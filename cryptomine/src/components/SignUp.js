// import useRef, useContext
import { useRef, useContext } from "react";
// import Context to get shared data.
import Context from "../Context";
// import validator to validate user's information.
import validator from "validator";
// import firebase authentication.
import { auth, realTimeDb } from "../firebase";
import {getAuth,createUserWithEmailAndPassword} from 'firebase/auth'
import { ref, set} from 'firebase/database'
// import uuid to generate id for users.
import { v4 as uuidv4 } from "uuid";
import { getFirestore, doc, setDoc } from 'firebase/firestore';

function SignUp(props) {
  // get toggleModal functin from higher order components.
  const { toggleModal } = props;

  // create refs to get user's email, user's password, user's confirm password.
  const fullNameRef = useRef(null);
  const emailRef = useRef(null);
  const phoneRef = useRef(null);
  const roleRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  const { cometChat, setIsLoading } = useContext(Context);

  const Personal = 'personal';
  const Business = 'business';

  /**
   * generate random avatar for demo purpose
   * @returns 
   */
  const generateAvatar = () => {
    // hardcode list of user's avatars for the demo purpose.
    const avatars= [
      'https://data-us.cometchat.io/assets/images/avatars/captainamerica.png',
      'https://data-us.cometchat.io/assets/images/avatars/cyclops.png',
      'https://data-us.cometchat.io/assets/images/avatars/ironman.png',
      'https://data-us.cometchat.io/assets/images/avatars/spiderman.png',
      'https://data-us.cometchat.io/assets/images/avatars/wolverine.png'
    ];
    const avatarPosition = Math.floor(Math.random() * avatars.length);
    return avatars[avatarPosition];
  }

  /**
   * validate user's informatin.
   * @param {*} param0 
   * @returns 
   */
  const isSignupValid = ({ fullName, email, phone, role, password, confirmPassword }) => {
    if (validator.isEmpty(fullName)){
      alert("Please input your full name");
      return false
    }
    if (!validator.isEmail(email)) {
      alert("Please input your email");
      return false;
    }
    if (!validator.isMobilePhone(phone)) {
      alert("Please input a valid phone number");
      return false;
    }
    if (validator.isEmpty(role)) {
      alert("Please input your role");
      return false;
    }
    if (validator.isEmpty(password) || !validator.isLength(password, {min: 6})) {
      alert("Please input your password. You password must have at least 6 characters");
      return false;
    }
    if (validator.isEmpty(confirmPassword)) {
      alert("Please input your confirm password");
      return false;
    }
    if (password !== confirmPassword) {
      alert("Confirm password and password must be the same");
      return false;
    }
    return true;
  };

  /**
   * sign up
   */
  const signup = () => {
    // get user's email, user's password, user's confirm password.
    const fullName = fullNameRef.current.value;
    const email = emailRef.current.value;
    const phone = phoneRef.current.value;
    const role = roleRef.current.value;
    const password = passwordRef.current.value;
    const confirmPassword = confirmPasswordRef.current.value;

    if (isSignupValid({fullName, email, phone, role, password, confirmPassword })) {
      // show loading 
      setIsLoading(true);
      // create new user's uuid.
      const userUuid = uuidv4(); 
      // generate user's avatar.
      const userAvatar = generateAvatar();
      // call firebase to to register a new account.
      createUserWithEmailAndPassword(auth, email, password).then((userCrendentials) => {
        const auth = getAuth();
        const firestore = getFirestore();
        
        if (userCrendentials) {
          const userID = userCrendentials.user.uid;
          const user = userCrendentials.user;
          const firestore = getFirestore();
          // call firebase real time database to insert a new user.
            const dbRef = ref(realTimeDb, `users/${userID}`);
            set(dbRef, {
              id: userID,
              email,
              phone,
              role,
              avatar: userAvatar,
              fullName
      
          })
          
          // Create a Firestore document for the new user
          const userDocRef = doc(firestore, 'users', user.uid);
          const userData = {
            id: user.uid,
            email: user.email,
            balance: 0,
            // Add other user data fields as needed (phone, role, avatar, fullName, etc.)
          };

          return setDoc(userDocRef, userData)
          .then(() => {
            localStorage.setItem('new', true);
            alert(`${userCrendentials.user.email} was created successfully! Please sign in with your created account`);
            setIsLoading(false);
          
            
            // close sign up dialog.
            toggleModal(false);
          });
        }
      }).catch((error) => {
        console.log(error);
        setIsLoading(false);
        alert(`Cannot create your account, ${email} already exist, please try again!`);
      }); 
    }
  };

  return (
    <div className="signup">
      <div className="signup__content">
        <div className="signup__container">
          <div className="signup__title text-theme">Sign Up</div>
          <div className="signup__close">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" alt="close"
          onClick={() => toggleModal(false)} height="20" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
           <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
          </svg>
          </div>
        </div>
        <div className="signup__subtitle"></div>
        <div className="signup__form">
        <input type="text" placeholder="Full Name" ref={fullNameRef} />
          <input type="text" placeholder="Email" ref={emailRef} />
          <input type="text" placeholder="Phone" ref={phoneRef} />
          <select ref={roleRef} defaultValue={Personal} >
            <option value={Personal}>Stay Updated</option>
            <option value={Business}>Don't get updates</option>
          </select>
          <input type="password" placeholder="Password" ref={passwordRef} />
          <input
            type="password"
            placeholder="Confirm Password"
            ref={confirmPasswordRef}
          />
          <button className="signup__btn" onClick={signup}>
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}

export default SignUp;