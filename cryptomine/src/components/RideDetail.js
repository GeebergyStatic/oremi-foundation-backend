// import useContext.
import { useContext, useState, useEffect } from 'react';
// import Context
import Context from '../Context';
// import react router. 
import { useNavigate } from 'react-router-dom';
// firebase imports
import {auth, db, realTimeDb } from '../firebase';
import {ref, set, onValue} from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';
import { useFirebase } from './UserRoleContext'; 

function RideDetail(props) { 
  const { user, isDriver, currentRide } = props;

  const { setCurrentRide, setIsLoading } = useContext(Context);
  const { userRole } = useFirebase();
  const [chatPartner, setChatPartner] = useState([
    {name: 'fullName', value: null},
    {name: 'profileImage', value: null},
    {name: 'email', value: null},
    {name: 'id', value: null},
    {name: 'phoneNo', value: null},
    {name: 'role', value: null}
  ]);


  const history = useNavigate();

  /**
   * remove ride from storage and context
   */
  const removeRideFromStorageAndContext = () => {
    // remove localStorage.
    localStorage.removeItem('currentRide');
    // remove data from context.
    setCurrentRide(null);
    // reload window 
    window.location.reload();
  }

  const updateRide = (ride) => { 
    // show loading indicator.
    setIsLoading(true);
    // update data on Firebase.
    const updateRideData = (ride) => {
      const rideRef = ref(realTimeDb, `rides/${ride.rideUuid}`);
    
      set(rideRef, ride)
        .then(() => {
          setIsLoading(false);
          removeRideFromStorageAndContext(); // Assuming you have defined this function
        })
        .catch(() => {
          setIsLoading(false);
        });
    };
    
    // Usage
    updateRideData(ride);
  }

  /**
   * cancel ride
   */
  const cancelRide = () => {
    const isCancel = window.confirm('Do you want to cancel this ride?');
    if (isCancel) {
      // update data on Firebase.
      currentRide.status = -1;
      updateRide(currentRide);
    }
  };

  /**
   * finish ride
   */
  const finishRide = () => {
    const isFinish = window.confirm('Do you want to finish this ride?');
    if (isFinish) {
      // update data on Firebase.
      currentRide.status = 2;
      updateRide(currentRide);
    }
  };

  /**
   * talk to user
   */
  const talkToUser = () => {
    history('/chat');
  };
// Getting user data

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

  // SETTING USER DATA FOR USE
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
              // console.log(`this is fullName ${updatedList[0].value} and 
              // this is profileImage ${updatedList[0].value}
              // this is fullName ${updatedList[0].value}
              // this is fullName ${updatedList[0].value}
              // this is fullName ${updatedList[0].value}
              // this is fullName ${updatedList[0].value}`)
        
              
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


  return (
    <div className="ride-detail">
      <div className="ride-detail__user-avatar">
        <img src={chatPartner[1].value} alt={chatPartner[2].value} />
      </div>
      <p className='ride-detail__userName'>{chatPartner[0].value}</p>
      <p className="ride-detail__user-info">{chatPartner[2].value} - {chatPartner[4].value}</p>
      <div className="ride-detail__actions">
        <p className="ride-detail__result-label"><span>From: </span>{currentRide.pickup && currentRide.pickup.label ? currentRide.pickup.label : ''}</p>
        <p className="ride-detail__result-label"><span>To: </span>{currentRide.destination && currentRide.destination.label ? currentRide.destination.label : ''}</p>
        <p className="text-success fw-bolder"><span className='text-dark fw-bold'>Ride Fare: </span><span className='mx-1'>N</span><span className='rideFare'>{currentRide.rideFare ? currentRide.rideFare : ''}</span></p>
        <button className="ride-detail__btn" onClick={talkToUser}>{isDriver ? 'Talk to User' : 'Talk to Driver'}</button>
        <button className="ride-detail__btn" onClick={cancelRide}>Cancel the Ride</button>
        {isDriver && <button className="ride-detail__btn" onClick={finishRide}>Finish the Ride</button>}
      </div>
    </div>
  );
}

export default RideDetail;