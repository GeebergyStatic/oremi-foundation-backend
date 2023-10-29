// import useContext
import { useContext, useState, useEffect } from 'react';
// import Context
import Context from '../Context';
// import react router
import { useNavigate } from 'react-router-dom';
// import logo white
import {auth} from '../firebase';
import {onAuthStateChanged } from 'firebase/auth';
import logoWhite from '../logo_white.png';


function Header() {
  const { user, setUser } = useContext(Context);


// Initialize a state variable to store the user's email
const [userEmail, setUserEmail] = useState(null);

// Use onAuthStateChanged to listen for changes in the user's authentication state
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in.
      setUserEmail(user.email);
    } else {
      // No user is signed in.
      setUserEmail(null);
    }
  });

  // Unsubscribe when the component unmounts to avoid memory leaks
  return () => unsubscribe();
}, [auth]);

  const history = useNavigate();

  /**
   * logout
   */
  const logout = () => {
    const isLogout = window.confirm('Do you want to log out ?');
    if (isLogout) {
      // remove local storage.
      localStorage.removeItem('auth');
      // remove authenticated user from context.
      setUser(null);
      // redirect to login page.
      history('/login');
    }
  }

  return (
    <div className="header fixed-top">
      <div className="header__left">
        <img src={logoWhite} alt="Uber Clone" />
        {
          user && (
            <div className="header__right">
              <img src={user.avatar} alt={user.email}/>
              <span>Hello, {userEmail}</span>
            </div>
          )
        }
      </div>
      <span className="header__logout" onClick={logout}><span>Logout</span></span>
    </div>
  );
}

export default Header;