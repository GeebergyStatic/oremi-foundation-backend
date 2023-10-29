// FirebaseContext.js

import { createContext, useContext, useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import {auth, realTimeDb, db} from '../firebase';
import { onAuthStateChanged } from 'firebase/auth'; 
import { doc, getDoc } from 'firebase/firestore';
import Navigation from './Sidebar';

const FirebaseContext = createContext(null);

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

export const FirebaseProvider = ({ children }) => {

  const [userImg, setUserImg] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [userFullName, setUserFullName] = useState(null);
  const [userID, setUserID] = useState(null);
  const [userPhoneNo, setUserPhoneNo] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userBalance, setUserBalance] = useState(null); // Initialize the balance

  useEffect(() => {


    // Listen to changes in the user role
    console.log('is running');
    const user = auth.currentUser;
    onAuthStateChanged(auth, (user) =>{
      
      console.log(user);
      const userRoleRef = ref(realTimeDb, `users/${user.uid}`); // Replace with your Firebase database path
      onValue(userRoleRef, (snapshot) => {
        const val = snapshot.val();
        const keys = Object.keys(val);
        const avatar = val[keys[0]];
        const email = val[keys[1]];
        const fullName = val[keys[2]];
        const ID = val[keys[3]];
        const phoneNo = val[keys[4]];
        const role = val[keys[5]];
        setUserImg(avatar);
        setUserEmail(email);
        setUserFullName(fullName);
        setUserID(ID);
        setUserPhoneNo(phoneNo);
        setUserRole(role);
      });

       // fetching user balance
    // Fetch the user's balance
    const fetchUserBalance = async () => {
      try {
        const userBalanceRef = doc(db, 'users', user.uid); // Assuming 'users' is your collection name
        const userBalanceSnapshot = await getDoc(userBalanceRef);
        if (userBalanceSnapshot.exists()) {
          const userBalanceData = userBalanceSnapshot.data();
          setUserBalance(userBalanceData.balance);
        }
      } catch (error) {
        console.error('Error fetching user balance:', error);
      }
    };

    // Fetch the user's balance
    fetchUserBalance();
    }) 
  }, [userBalance]);

  return (
    <FirebaseContext.Provider value={{userImg, userEmail, userFullName, userID, userPhoneNo ,userRole, userBalance, setUserBalance }}>
      {children}
      
    </FirebaseContext.Provider>
  );
};
