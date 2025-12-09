import React, { useState, useEffect, useRef } from 'react';
import '../styles/Chat.css';

export default function Chat({ messages, onSendMessage, currentUser }) {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <div className="chat-container">
      <h3>💬 Chat</h3>
      
      <div className="messages-container">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`message ${msg.type} ${msg.username === currentUser ? 'own' : ''}`}
          >
            {msg.type === 'system' ? (
              <div className="system-message">
                <em>{msg.message}</em>
              </div>
            ) : (
              <>
                <div className="message-header">
                  <strong>{msg.username}</strong>
                  <span className="message-time">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="message-body">{msg.message}</div>
              </>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="message-form">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="message-input"
        />
        <button type="submit" className="btn btn-small">Send</button>
      </form>
    </div>
  );
}
