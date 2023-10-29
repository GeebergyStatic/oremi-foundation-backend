// import react.
import React from 'react';
// importing home component
import LoadingPageCarousel from './LoadingPageCarousel';
// import react router.
import { Navigate, Route, useNavigate } from 'react-router-dom';

const PrivateLoad = ({ component: Component, ...rest }) => {
    const isAuthenticated = localStorage.getItem('auth');
     // Check if the user is considered new
     const isNewUser = localStorage.getItem('new') === 'true';
  
    return (
        
          <div>
            {isAuthenticated ? (
              isNewUser ? (
                <LoadingPageCarousel />
              ) : (
                <Navigate to="/" />
              )
            ) : (
                <Navigate to="/login" />
            )}
          </div>
    );
  };

export default PrivateLoad;