// import useContext.
import { useContext, useState } from 'react';
// import realtime database from Firebase.
import { realTimeDb } from "../firebase";
// import uuid to generate id for users.
import { v4 as uuidv4 } from "uuid";
// import Context
import Context from '../Context';
// firebase imports
import {ref, set} from 'firebase/database';
import { useFirebase } from './UserRoleContext';

function RequestRide(props) {
  // get toggleModal functin from higher order components.
  const { toggleModal } = props;

  const { user, selectedFrom, selectedTo, setRideRequest, setIsLoading } = useContext(Context);
  const {ridePrice, setRidePrice} = useContext(Context);
  /**
   * request a ride
   */

  if (user && selectedFrom && selectedTo){
    const calculateDistance = (fromLocation, toLocation) => {
      const lat1 = parseFloat(fromLocation.y);
      const lon1 = parseFloat(fromLocation.x);
      const lat2 = parseFloat(toLocation.y);
      const lon2 = parseFloat(toLocation.x);
      
      const distance = calculateHaversineDistance(lat1, lon1, lat2, lon2);
      return distance;
    };
  
    const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
      // Haversine formula to calculate the distance between two points on Earth
      const R = 6371; // Earth's radius in kilometers
      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLon = (lon2 - lon1) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c * 1000; // Distance in meters
    };
     
        function metersToKilometers(meters) {
          const kilometers = meters / 1000;
          return kilometers;
        }
        
        // Example usage:
        const meters = calculateDistance(selectedFrom, selectedTo);
        const kilometers = metersToKilometers(meters);
        alert(`${kilometers} km`);
        
        const rideDistance = kilometers;
        const rideFare = parseInt(rideDistance) * 200;
        setRidePrice(rideFare);
  }
  const requestRide = () => {
  if (user && selectedFrom && selectedTo && ridePrice) {

    
        // close the modal.
        toggleModal(false);
        // show loading indicator. 
        setIsLoading(true);
        // create object.     

      const rideUuid = uuidv4();
      const ride = {
        "rideUuid": rideUuid,
        "requestor": user,
        "pickup": selectedFrom,
        "destination": selectedTo,
        "status": 0,
        "rideFare": ridePrice
      }
      // insert to Firebase realtime database.
      const updateRide = (rideUuid, ride) => {
        const rideRef = ref(realTimeDb, `rides/${rideUuid}`);
      
        set(rideRef, ride)
          .then(() => {
            setRideRequest(ride); // Assuming you have defined setRideRequest somewhere
            setIsLoading(false);  // Assuming you have defined setIsLoading somewhere
          })
          .catch(() => {
            setIsLoading(false);  // Assuming you have defined setIsLoading somewhere
          });
      };
      
      // Usage
      updateRide(rideUuid, ride);
    }
  };

  return (
    <div className="request-ride">
      <div className="request-ride__content">
        <div className="request-ride__container">
          <div className="request-ride__title">Requesting a Ride</div>
          <div className="request-ride__close">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" alt="close"
            onClick={() => toggleModal(false)} height="20" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
             <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
            </svg>
          </div>
        </div>
        <div className="request-ride__subtitle"></div>
        <div className="request-ride__form">
          <p className='fw-bolder'>Ride Price: <span className='text-success'>{ridePrice!==null ? `N ${ridePrice}` : ''}</span></p>
          <p>
            You entered the pickup location successfully. Do you want to request a ride now ?
          </p>
          <button className="request-ride__btn request-ride__change-btn" onClick={() => toggleModal(false)}>
            Change
          </button>
          <button className="request-ride__btn" onClick={requestRide}>
            Request a ride now
          </button>
        </div>
      </div>
    </div>
  );
}

export default RequestRide;