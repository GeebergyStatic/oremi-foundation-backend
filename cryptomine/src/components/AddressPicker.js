// import useContext, useState, useEffect, useRef, useCallback
import { useContext, useState, useEffect, useRef, useCallback } from 'react';
// import Context
import Context from '../Context';
// import
import { OpenStreetMapProvider } from 'leaflet-geosearch';
// import custom components.
import withModal from './Modal';
import RequestRide from './RequestRide';
// import {publicRide} from '../App/CarsGeneral.svg'

function AddressPicker(props) {
  const [isFrom, setIsFrom] = useState(true);
  const [searchResults, setSearchResults] = useState([]);

  const { selectedFrom, setSelectedFrom, selectedTo, setSelectedTo } = useContext(Context);

  const [expanded, setExpanded] = useState(false);
  
  const handleToggle = () => {
    setExpanded(!expanded);
  };

  const provider = useRef();
  const searchRef = useRef();

  const { toggleModal } = props;

  const publicBtn = document.getElementById('publicBtn');
  const standardBtn = document.getElementById('standardBtn');
  const executiveBtn = document.getElementById('executiveBtn');
  const addressTitle = document.querySelector('.address__title');
  const search = document.querySelector('.search');
  const unavailable = document.querySelector('.unavailable');

  const publicBtnAction = () =>{
    publicBtn.classList.add('active');
    standardBtn.classList.remove('active');
    executiveBtn.classList.remove('active');
    addressTitle.classList.add('d-none');
    search.classList.add('d-none');
    unavailable.classList.remove('d-none');
  }

  const standardBtnAction = () =>{
    publicBtn.classList.remove('active');
    standardBtn.classList.add('active');
    executiveBtn.classList.remove('active');
    addressTitle.classList.remove('d-none');
    search.classList.remove('d-none');
    unavailable.classList.add('d-none');
    
  }

  const executiveBtnAction = ()=>{
    publicBtn.classList.remove('active');
    standardBtn.classList.remove('active');
    executiveBtn.classList.add('active');
    addressTitle.classList.add('d-none');
    search.classList.add('d-none');
    unavailable.classList.remove('d-none');
  }

  useEffect(() => {
    initProvider();
  }, []);

  const shouldRequestDriver = useCallback( () => { 
    if (selectedFrom && selectedTo) {
      // show confirmation dialog to request a driver.
      toggleModal(true);
    }
  }, [selectedFrom, selectedTo, toggleModal]);

  useEffect(() => {
    if (selectedFrom && selectedTo) {
      // check a driver should be requested, or not.s
      shouldRequestDriver();
    }
  }, [selectedFrom, selectedTo, shouldRequestDriver]);

  /**
   * handle input changed to get pick up location or destination.
   */
  const onInputChanged = (e) => { 
    const input = e.target.value;
    provider.current.search({ query: input }).then(results => {
      setSearchResults(() => results);
    });
  };

  /**
   * init provider.
   */
  const initProvider = () => {
    provider.current = new OpenStreetMapProvider({
      params: {
        'accept-language': 'en',
        countrycodes: "ng"
      }
    });
  }

  /**
   * select location.
   * @param {*} selectedLocation 
   */
  const onLocationSelected = (selectedLocation) => {
    if (selectedLocation && selectedLocation.label && selectedLocation.x && selectedLocation.y) {
      if (isFrom) {
        // set pick up location
        setSelectedFrom(selectedLocation);
        setIsFrom(false);
        alert('isFrom worked!');
        alert(setIsFrom);
      } else {
        // set destination.
        setSelectedTo(selectedLocation);
        setIsFrom(true);
        alert('else worked!');
      }
      // clear search result.
      setSearchResults(() => []);
      // reset input value.
      searchRef.current.value = '';
    }
  };

  return (
    <div className={`address bottom-panel p-4 ${expanded ? 'expanded' : ''}`}>
          <button className={`btn p-3  theme toggle-button ${expanded ? 'ex-btn2' : 'ex-btn text-white'}`} onClick={handleToggle}>
            {expanded ? 
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="white" class="bi bi-arrow-down-circle-fill" viewBox="0 0 16 16">
            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v5.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V4.5z"/>
            </svg>
            : 'Take a Ride'}
          </button>
          <div className={`toggle-btn mt-3 mx-auto ${expanded ? '' : 'd-none'}`}>
           <button id="publicBtn" onClick={publicBtnAction}>Public</button>
           <button id="standardBtn" onClick={standardBtnAction} className="active">Standard</button>
           <button id="executiveBtn" onClick={executiveBtnAction}>Executive</button>
          </div>
          <div className={`unavailable d-none increase_size`}>
            <p className='text-secondary d-flex justify-content-center text-center align-items-start'>
              <span className='mx-1'>    <svg
                xmlns="http://www.w3.org/2000/svg"
                width="25"
                height="25"
                fill="currentColor"
                className="bi bi-info-circle"
                viewBox="0 0 16 16"
             >
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
              </svg>
              </span>
              <span>Currently Unavailable</span>
              </p>
          </div>
      <div className={`address__title`}>
        <div className="address__title-container">
          <p className="address__title-from" onClick={() => setIsFrom(true)}>{selectedFrom && selectedFrom.label ? selectedFrom.label : 'Pickup location ?'}</p>
          <p className="address__title-to" onClick={() => setIsFrom(false)}>{selectedTo && selectedTo.label ? selectedTo.label : 'Destination ?'}</p>
        </div>
      </div>
      <div className={`search ${expanded ? '' : 'd-none'}`}>
        <input
          className="search__input"
          type="text"
          placeholder={isFrom ? 'Add a pickup location' : 'Enter your destination'}
          onChange={onInputChanged}
          ref={searchRef}
        />
        <div className="search__result">
          {
            searchResults && searchResults.length !== 0 && searchResults.map((result, index) => (
              <div className="search__result-item" key={index} onClick={() => onLocationSelected(result)}>
                <div className="search__result-icon">
                  <svg title="LocationMarkerFilled" viewBox="0 0 24 24" className="g2 ec db"><g transform="matrix( 1 0 0 1 2.524993896484375 1.0250244140625 )"><path fillRule="nonzero" clipRule="nonzero" d="M16.175 2.775C12.475 -0.925 6.475 -0.925 2.775 2.775C-0.925 6.475 -0.925 12.575 2.775 16.275L9.475 22.975L16.175 16.175C19.875 12.575 19.875 6.475 16.175 2.775ZM9.475 11.475C8.375 11.475 7.475 10.575 7.475 9.475C7.475 8.375 8.375 7.475 9.475 7.475C10.575 7.475 11.475 8.375 11.475 9.475C11.475 10.575 10.575 11.475 9.475 11.475Z" opacity="1"></path></g></svg>
                </div>
                <p className="search__result-label">{result.label}</p>
              </div>  
            ))
          }
        </div>
      </div>
    </div>
  );
}

export default withModal(RequestRide)(AddressPicker);