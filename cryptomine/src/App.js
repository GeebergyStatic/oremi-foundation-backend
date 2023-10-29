import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import './index.css';
import Context from './Context';
import { FirebaseProvider } from './components/UserRoleContext';
import { realTimeDb } from './firebase';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './components/Home';
import Login from './components/Login';
import Loading from './components/Loading';
import Chat from './components/Chat';
import PrivateRoute from './components/PrivateRoute';
import PrivateChat from './components/PrivateChat';
import PrivateLoad from './components/PrivateLoad';
import LoadingPageCarousel from './components/LoadingPageCarousel';
import SignUp from './components/SignUp';
import Navbar from './components/Navbar';
import { useLocation } from 'react-router-dom';
import WalletBalance from './components/WalletBalance';
import PaymentModal from './components/PaymentModal';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [cometChat, setCometChat] = useState(null);
  const [selectedFrom, setSelectedFrom] = useState(null);
  const [selectedTo, setSelectedTo] = useState(null);
  const [rideRequest, setRideRequest] = useState(null);
  const [currentRide, setCurrentRide] = useState(null);
  const [ridePrice, setRidePrice] = useState(null);



  const lookingDriverMaxTime = 30000;

  useEffect(() => {
    initAuthUser();
    initCurrentRide();
  }, []);

  useEffect(() => {
    if (rideRequest) {
      const lookingDriverTimeout = setTimeout(() => {
        alert('Cannot find your driver, please re-enter your pickup location and try again');
        setRideRequest(null);
        setIsLoading(false);
      }, lookingDriverMaxTime);
      setIsLoading(true);

      const rideRef = ref(realTimeDb, 'rides/' + rideRequest.rideUuid);
      onValue(rideRef, (snapshot) => {
        const updatedRide = snapshot.val();
        if (updatedRide && updatedRide.rideUuid === rideRequest.rideUuid && updatedRide.driver) {
          setIsLoading(false);
          clearTimeout(lookingDriverTimeout);
          setRideRequest(null);
          localStorage.setItem('currentRide', JSON.stringify(updatedRide));
          setCurrentRide(updatedRide);
        }
      });
    }
  }, [rideRequest]);

  useEffect(() => {
    if (currentRide) {
      const currentRideRef = ref(realTimeDb, `rides/${currentRide.rideUuid}`);
      onValue(currentRideRef, (snapshot) => {
        const updatedRide = snapshot.val();
        if (updatedRide && updatedRide.rideUuid === currentRide.rideUuid && updatedRide.driver && (updatedRide.status === -1 || updatedRide.status === 2)) {
          localStorage.removeItem('currentRide');
          setCurrentRide(null);
          window.location.reload();
        }
      });
    }
  }, [currentRide]);

  const initCurrentRide = () => {
    const currentRide = localStorage.getItem('currentRide');
    if (currentRide) {
      setCurrentRide(() => JSON.parse(currentRide));
    }
  }

  const initAuthUser = () => {
    const authenticatedUser = localStorage.getItem('auth');
    if (authenticatedUser) {
      setUser(JSON.parse(authenticatedUser));
    }
  };

  return (
    <Context.Provider value={{ isLoading, setIsLoading, user, setUser, cometChat, selectedFrom, setSelectedFrom, selectedTo, setSelectedTo, rideRequest, setRideRequest, currentRide, setCurrentRide, ridePrice, setRidePrice }}>
      <FirebaseProvider>
        <Router>
          <ErrorBoundary>
            <Navbar />
            <Routes>
              <Route
                exact
                path="/load"
                element={<PrivateLoad exact path="/load" element={<LoadingPageCarousel />} />}
              />
              <Route exact path="/" element={<PrivateRoute exact path="/" element={<Home />} />} />
              <Route
                exact
                path="/chat"
                element={<PrivateChat exact path="/chat" element={<Chat />} />}
              />
              <Route
                exact
                path="/login"
                element={<Login />}
              />
              <Route
                exact
                path="/signup"
                element={<SignUp />}
              />
              <Route
                exact
                path="/balance"
                element={<WalletBalance/>}
              />
              <Route
              exact  path='/activate_account'
              element={<PaymentModal/>}
              />
            </Routes>
          </ErrorBoundary>
          {isLoading && <Loading />}
        </Router>
      </FirebaseProvider>
    </Context.Provider>
  );
}

export default App;
