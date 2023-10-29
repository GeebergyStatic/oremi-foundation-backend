import { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFirebase } from './UserRoleContext';
// import Context
import Context from '../Context';
// import react router
import { useNavigate } from 'react-router-dom';
// import logo white
import {auth} from '../firebase';
import {onAuthStateChanged } from 'firebase/auth';
// import togglerIcon from '../App/SandwitchMenu.svg';

const Navigation = () => {
  const [showNav, setShowNav] = useState(false);
  const {userImg, userEmail, userFullName, userID, userPhoneNo ,userRole } = useFirebase();

  const toggleNav = () => {
    setShowNav(!showNav);
  };

  const { user, setUser } = useContext(Context);
  
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
    <div>
      <button className="nav-toggler" onClick={toggleNav}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="38" height="38"
        viewBox="0 0 51 51" // Adjust the viewBox to match the original SVG's dimensions
      >
        <rect width="51" height="51" rx="12" ry="13" style={{ fill: 'white' }} />
        <rect x="12" y="15" width="27" height="3" style={{ fill: 'black' }} />
        <rect x="12" y="24" width="16" height="3" style={{ fill: 'black' }} />
        <rect x="12" y="33" width="27" height="3" style={{ fill: 'black' }} />
      </svg>
      </button>
      {showNav && (
        <div className="backdrop" onClick={toggleNav}></div>
      )}
      <div className={`offcanvas navigation-canvas offcanvas-start ${showNav ? 'show' : ''}`} tabIndex="-1">
        <div className="offcanvas-header">
          <button type="button" className="btn-close text-reset navigation-close" onClick={toggleNav}></button>
        </div>
        <div className="offcanvas-body">
          <div className='d-flex profile-offNav align-items-start'>
            <img src={userImg} width='70px' height='70px' className='mx-3 nav-img'></img>
            <div className='d-flex column'><h3>{userFullName}</h3> <p className='text-secondary profile-state'>{userRole}</p></div>
          </div>
          <ul className="navigation-list d-flex">
            {/* ... (navigation links) ... */}
            
            <Link to="/uwallet" className='navigation-linkOne'>UWallet</Link>
            <Link to="/third-party-order" className='navigation-link'>Order For A Friend</Link>
            <Link to="/profile" className='navigation-link'>Profile</Link>
            <Link to="/settings" className='navigation-link'>Settings</Link>
            <Link to="/support" className='navigation-link'>Support</Link>
            <Link to="/about" className='navigation-link'>About</Link>
            <span className="header__logout" onClick={logout}><span>Logout</span></span>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
