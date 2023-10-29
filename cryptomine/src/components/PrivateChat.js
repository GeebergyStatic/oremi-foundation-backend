// import react.
import React from 'react';
// importing chat component
import Chat from './Chat';
// import react router.
import { Navigate, Route, useNavigate } from 'react-router-dom';

const PrivateChat = ({ component: Component, ...rest }) => {
    const isAuthenticated = localStorage.getItem('auth');
  
    return (
        
          isAuthenticated ? (
            <Chat />
          ) : (
            <Navigate to="/login" />
          )
    );
  };

export default PrivateChat;