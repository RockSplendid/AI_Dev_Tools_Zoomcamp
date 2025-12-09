import React from 'react';
import '../styles/UserList.css';

export default function UserList({ users, currentUser }) {
  return (
    <div className="user-list">
      <h3>👥 Participants ({users.length})</h3>
      <ul>
        {users.map(user => (
          <li key={user.userId} className="user-item">
            <span className="user-status"></span>
            <span className="user-name">
              {user.username}
              {user.username === currentUser && <span className="you-badge"> (You)</span>}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
