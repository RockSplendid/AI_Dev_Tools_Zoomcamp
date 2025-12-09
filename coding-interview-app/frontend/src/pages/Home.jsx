import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import '../styles/Home.css';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const createSession = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/sessions`);
      const { roomId } = response.data;
      navigate(`/interview/${roomId}`);
    } catch (error) {
      console.error('Failed to create session:', error);
      alert('Failed to create interview session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container">
      <div className="home-content">
        <h1>Online Coding Interview</h1>
        <p>Collaborate on coding problems in real-time with syntax highlighting and instant execution.</p>
        
        <div className="home-features">
          <div className="feature">
            <h3>🔗 Share Links</h3>
            <p>Create shareable links to invite candidates</p>
          </div>
          <div className="feature">
            <h3>⌨️ Real-time Editing</h3>
            <p>Multiple users can edit code simultaneously</p>
          </div>
          <div className="feature">
            <h3>🎨 Syntax Highlighting</h3>
            <p>Support for multiple programming languages</p>
          </div>
          <div className="feature">
            <h3>▶️ Execute Code</h3>
            <p>Run code safely and see results instantly</p>
          </div>
        </div>

        <button 
          className="btn btn-primary" 
          onClick={createSession}
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Start Interview Session'}
        </button>
      </div>
    </div>
  );
}
