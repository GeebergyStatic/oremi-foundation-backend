// import react.
import React from 'react';
// importing home component
import Home from './Home';
// import react router.
import { Navigate, Route, useNavigate } from 'react-router-dom';

const PrivateRoute = ({ component: Component, ...rest }) => {
    const isAuthenticated = localStorage.getItem('auth');
  
    return (
        
          isAuthenticated ? (
            <Home />
          ) : ( 
            <Navigate to="/login" />
          )
    );
  };

export default PrivateRoute;