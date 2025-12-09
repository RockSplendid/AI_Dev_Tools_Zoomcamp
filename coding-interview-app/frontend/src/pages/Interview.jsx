import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import AceEditor from 'react-ace';
import 'ace-builds/src-min-noconflict/mode-javascript';
import 'ace-builds/src-min-noconflict/mode-python';
import 'ace-builds/src-min-noconflict/mode-java';
import 'ace-builds/src-min-noconflict/mode-csharp';
import 'ace-builds/src-min-noconflict/mode-ruby';
import 'ace-builds/src-min-noconflict/theme-monokai';
import UserList from '../components/UserList';
import Chat from '../components/Chat';
import Console from '../components/Console';
import { executeCode, preloadPyodide } from '../utils/wasmCodeExecution';
import { WS_BASE_URL } from '../config/api';
import '../styles/Interview.css';

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'ruby', label: 'Ruby' }
];

export default function Interview() {
  const { roomId } = useParams();
  const [username, setUsername] = useState('');
  const [code, setCode] = useState('// Start coding here\n');
  const [language, setLanguage] = useState('javascript');
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [output, setOutput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const socketRef = useRef(null);
  const editorRef = useRef(null);
  const updateTimeoutRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(WS_BASE_URL);

    // Preload Pyodide in the background for better UX
    preloadPyodide();

    socketRef.current.on('connect', () => {
      console.log('Connected to server');
    });

    socketRef.current.on('session-state', (data) => {
      setCode(data.code);
      setLanguage(data.language);
      setUsers(data.users);
    });

    socketRef.current.on('code-update', (data) => {
      setCode(data.code);
    });

    socketRef.current.on('language-change', (data) => {
      setLanguage(data.language);
    });

    socketRef.current.on('user-joined', (data) => {
      setUsers(data.users);
      setMessages(prev => [...prev, {
        type: 'system',
        message: `${data.username} joined the session`,
        timestamp: new Date()
      }]);
    });

    socketRef.current.on('user-left', (data) => {
      setUsers(data.users);
      setMessages(prev => [...prev, {
        type: 'system',
        message: `${data.username} left the session`,
        timestamp: new Date()
      }]);
    });

    socketRef.current.on('chat-message', (data) => {
      setMessages(prev => [...prev, {
        type: 'chat',
        username: data.username,
        message: data.message,
        timestamp: data.timestamp
      }]);
    });

    socketRef.current.on('error', (data) => {
      alert(`Error: ${data.message}`);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!username.trim()) {
      alert('Please enter your name');
      return;
    }

    socketRef.current.emit('join-room', {
      roomId,
      username
    });

    setShareLink(`${window.location.origin}/interview/${roomId}`);
    setIsJoined(true);
  };

  const handleCodeChange = (newCode) => {
    setCode(newCode);

    // Debounce code updates
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    updateTimeoutRef.current = setTimeout(() => {
      socketRef.current.emit('code-update', {
        roomId,
        code: newCode,
        cursorPosition: editorRef.current?.editor?.getCursorPosition?.()
      });
    }, 300);
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    socketRef.current.emit('language-change', {
      roomId,
      language: newLanguage
    });
  };

  const handleExecuteCode = async () => {
    setIsExecuting(true);
    setOutput('Executing code...');

    try {
      const result = await executeCode(code, language);
      setOutput(result.output);

      // Broadcast execution result to other users
      socketRef.current.emit('code-executed', {
        roomId,
        output: result.output,
        error: result.error,
        language,
        executedBy: username
      });
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    alert('Link copied to clipboard!');
  };

  const handleSendMessage = (message) => {
    socketRef.current.emit('chat-message', {
      roomId,
      message,
      username
    });
  };

  if (!isJoined) {
    return (
      <div className="join-container">
        <div className="join-box">
          <h2>Join Interview Session</h2>
          <p>Room ID: <code>{roomId}</code></p>
          
          <form onSubmit={handleJoinRoom}>
            <input
              type="text"
              placeholder="Enter your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
            <button type="submit" className="btn btn-primary">
              Join Session
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="interview-container">
      <div className="interview-header">
        <h1>Coding Interview Session</h1>
        <div className="header-info">
          <span className="room-id">Room: {roomId}</span>
          <button className="btn btn-secondary" onClick={handleCopyLink}>
            📋 Copy Share Link
          </button>
        </div>
      </div>

      <div className="interview-layout">
        <div className="left-panel">
          <UserList users={users} currentUser={username} />
        </div>

        <div className="center-panel">
          <div className="editor-controls">
            <div className="control-group">
              <label htmlFor="language">Language:</label>
              <select 
                id="language"
                value={language} 
                onChange={handleLanguageChange}
                className="language-select"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            <button 
              className="btn btn-success"
              onClick={handleExecuteCode}
              disabled={isExecuting}
            >
              {isExecuting ? '⏳ Running...' : '▶️ Execute Code'}
            </button>
          </div>

          <div className="editor-container">
            <AceEditor
              ref={editorRef}
              mode={language}
              theme="monokai"
              value={code}
              onChange={handleCodeChange}
              name="code-editor"
              setOptions={{
                enableBasicAutocompletion: false,
                enableLiveAutocompletion: false,
                enableSnippets: false,
                useWorker: false,
                fontSize: 14
              }}
              width="100%"
              height="400px"
            />
          </div>

          <Console output={output} isExecuting={isExecuting} />
        </div>

        <div className="right-panel">
          <Chat 
            messages={messages} 
            onSendMessage={handleSendMessage}
            currentUser={username}
          />
        </div>
      </div>
    </div>
  );
}
