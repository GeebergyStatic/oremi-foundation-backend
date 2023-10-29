import Context from '../Context';
// import { CometChat } from "@cometchat-pro/chat";
// import { CometChatUI } from "../cometchat-pro-react-ui-kit/CometChatWorkspace/src";
// import { CometChatMessages  } from '../cometchat-pro-react-ui-kit/CometChatWorkspace/src';
// import { auth } from '../firebase';
// import {onAuthStateChanged} from 'firebase/auth';

import { collection, addDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import React, { useContext, useState, useEffect } from 'react';
import {useNavigate} from 'react-router-dom';
import {auth, db, realTimeDb } from '../firebase';
import {ref, get, onValue} from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';
import { useFirebase } from './UserRoleContext'; 
import Loading from './Loading';

function Chat() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { userRole } = useFirebase();
  const [chatPartner, setChatPartner] = useState([
    {name: 'fullName', value: null},
    {name: 'profileImage', value: null},
    {name: 'email', value: null},
    {name: 'id', value: null},
    {name: 'phoneNo', value: null},
    {name: 'role', value: null}
  ]);

  
  const { user, currentRide } = useContext(Context);

  console.log(`this is the user variable ${user} and this is the current Ride ${currentRide}`);
  const findUserUids = () => {
    if (user && currentRide) {
      let currentUserUid, intendedPersonUid;
      console.log(`user and currentRide identified`);
      
      console.log(userRole);
      console.log(currentRide);
      if (userRole === 'user' && currentRide.driver) {
        console.log('user and requestor');
        currentUserUid = currentRide.requestor;
        intendedPersonUid = currentRide.driver;
      } else if (userRole === 'driver' && currentRide.requestor) {
        console.log('user and driver');
        currentUserUid = currentRide.driver;
        intendedPersonUid = currentRide.requestor;
      }
      else{
        console.log('something went wrong!');
      }
  
      return { currentUserUid, intendedPersonUid };
    }
  
    // If no user or currentRide data is available or if the conditions don't match
    return null;
  };
  

  const userUids = findUserUids();
  console.log(userUids);

  const { currentUserUid, intendedPersonUid } = userUids;


  useEffect(() => {
    const chatRef = collection(db, 'messages');
    const q = query(
      chatRef,
      where('senderUid', 'in', [currentUserUid, intendedPersonUid]),
      where('receiverUid', 'in', [currentUserUid, intendedPersonUid]),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const newMessages = [];
      querySnapshot.forEach((doc) => {
        newMessages.push({ id: doc.id, ...doc.data() });
      });
      setMessages(newMessages);
    });

    return unsubscribe;

  }, [currentUserUid, intendedPersonUid]);

  useEffect(() => {
    // Function to fetch the user's role from Firestore
    const fetchPartnerData = async () => {
        // Listen for changes in authentication state
    onAuthStateChanged(auth, (user) => {
        if (user !== null && user !== undefined)  {
            const userRef = ref(realTimeDb, `users/${intendedPersonUid}`);
      
            // Listen for changes to the user's role
            const unsubscribe = onValue(userRef, snapshot => {
              const val = snapshot.val();
              const keys = Object.keys(val);
                // Update the value of a specific object inside the list
              const updateObjectValue = (index, newValue) => {
                // Create a copy of the list and update the specific object
                const updatedList = [
                  {name: 'fullName', value: val[keys[2]] },
                  {name: 'profileImage', value: val[keys[0]]},
                  {name: 'email', value: val[keys[1]]},
                  {name: 'id', value: val[keys[3]]},
                  {name: 'phoneNo', value: val[keys[4]]},
                  {name: 'role', value: val[keys[5]]}
              ];
        
              
                // Set the state with the updated list
                setChatPartner(updatedList);
                console.log(chatPartner);
              }; 
              updateObjectValue();
              console.log(`these are the keys ${keys}`);
            });
      
            return () => {
              // Clean up the listener when the component unmounts
              unsubscribe();
              console.log('userRole set!');
            };
          }
        });
    };

    fetchPartnerData();
  }, [user]);

  const history = useNavigate(); // Create a history object for navigation

  // ... Other state variables ...

  // Function to handle navigation back to the home page
  const navigateToHomePage = () => {
    history('/'); // Replace '/' with the actual route to your home page
  };
  const sendMessage = async () => {
    const chatRef = collection(db, 'messages');
    const newMessage = {
      text: message,
      timestamp: new Date().getTime(),
      senderUid: currentUserUid,
      receiverUid: intendedPersonUid,
    };

    try {
      await addDoc(chatRef, newMessage);
      setMessage('');
      
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  // Function to handle sending a message when Enter key is pressed
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent the default behavior (e.g., line break)
      sendMessage();
    }
  };              

  return (
    <div>
      <div className="chat-header fixed-top bg-white">
        <div className='chat-header-left d-flex align-items-center'>
        {chatPartner && (
          <>
            <img
              src={chatPartner[1].value}
              alt={chatPartner[0].value}
              className="chat-partner-image"
            />
            <div className="chat-partner-details">
              <h3>{chatPartner[0].value}</h3>
              <p className='text-secondary'>{chatPartner[4].value}</p>
              {/* Add more chat partner details here */}
            </div>
          </>
        )}
        </div>
        <div className="chat-header-right mx-3">
          <button className="back-button" onClick={navigateToHomePage}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20
          " height="20" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
           <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
          </svg>
          </button>
        </div>
      </div>
      <div className="chat-messages">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`chat-bubble ${msg.senderUid === currentUserUid ? 'user' : 'other'}`}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <div className="chat-input-container fixed-bottom">
        <input
          type="text"
          className="chat-input"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        />
          <button className="send-icon" onClick={sendMessage}>
          <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" class="bi bi-send" viewBox="0 0 16 16">
            <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z"/>
          </svg>
          </button>
      </div>
      
    </div>
  );
}

export default Chat;