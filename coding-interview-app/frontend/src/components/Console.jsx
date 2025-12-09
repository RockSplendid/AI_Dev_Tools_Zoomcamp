import React from 'react';
import '../styles/Console.css';

export default function Console({ output, isExecuting }) {
  return (
    <div className="console-container">
      <h3>📤 Output</h3>
      <div className={`console-output ${isExecuting ? 'executing' : ''}`}>
        {output ? (
          <pre>{output}</pre>
        ) : (
          <p className="placeholder">Code output will appear here...</p>
        )}
      </div>
    </div>
  );
}
