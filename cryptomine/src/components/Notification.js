// Notification.js

import React from 'react';

const Notification = ({ message, onClose }) => {
  return (
    <div className="notification alert-success fixed-top">
      <p>{message}</p>
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default Notification;
