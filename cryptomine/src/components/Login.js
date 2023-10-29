// import useRef and useContext
import { useRef, useContext, useEffect } from "react";
// import Context to get shared data from React context.
import Context from "../Context";
// import firebase authentication and real time database.
import { auth, db, realTimeDb } from "../firebase";
import {signInWithEmailAndPassword} from 'firebase/auth';
import {ref, onValue, orderByChild, equalTo, query, orderByValue, child} from 'firebase/database';
// import validator to validate user's credentials.
import validator from "validator";
// import custom componnets.
import withModal from "./Modal";
import SignUp from "./SignUp";
// import history
import { useNavigate } from 'react-router-dom';

function Login(props) {
  // get shared data from context.
  const { setUser, setIsLoading, cometChat } = useContext(Context);
  // get toggle modal function from withModal - higher order component.
  const { toggleModal } = props;
  // create ref to get user's email and user's password.
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const history = useNavigate();

  /**
   * validate user's credentials.
   * @param {*} email 
   * @param {*} password 
   * @returns 
   */
  const isUserCredentialsValid = (email, password) => {
    return validator.isEmail(email) && password;
  };

  /**
   * login
   */
  const login = () => {
    // show loading indicator.
    setIsLoading(true);
    // get the user's creadentials.
    const email = emailRef.current.value;
    const password = passwordRef.current.value;
    if (isUserCredentialsValid(email, password)) {
      // if the user's credentials are valid, call Firebase authentication service.
      signInWithEmailAndPassword(auth, email, password).then((userCredential) => {


        const userEmail = userCredential.user.email;
        const userID = userCredential.user.uid;
        const dbRef = ref(realTimeDb, `users/${userID}`);
        const ID = auth.currentUser.uid;
                localStorage.setItem('auth', JSON.stringify(ID));
                // save authenticated user to context.
                setUser(ID);
                // hide loading.
                setIsLoading(false);
                // redirect to home page.
              
                // Check if 'new' key exists in localStorage
                if (localStorage.getItem('new') === 'true') {
                  // If it's a new user, redirect to a certain page
                  history('/');
                } else {
                  // If it's not a new user, redirect to another page
                  history('/');
                }
            
      

          // end of then promise
        })
        .catch((error) => {      
          // hide loading indicator.
          setIsLoading(false);
          console.log(`this is an error ${error}`);
          alert(`Your username or password is not correct`);
        });
    } else {
      // hide loading indicator.
      setIsLoading(false);
      alert(`Your username or password is not correct`);
    }
  };

  return (
  // main login
  <div className="signup">
      <div className="signup__content">
        <div className="signup__container">
          <div className="signup__title">Login</div>
        </div>
        <div className="signup__subtitle"></div>
        <div className="signup__form">
          <input
            type="text"
            placeholder="Email"
            ref={emailRef}
          />
          <input
            type="password"
            placeholder="Password"
            ref={passwordRef} 
          />
          <button type="submit" className="signup__btn"  onClick={login}>
            Login
          </button>
          <span className="login__signup" onClick={() => toggleModal(true)}>Create Account</span>
        </div>
      </div>
    </div>
  );
}

export default withModal(SignUp)(Login);