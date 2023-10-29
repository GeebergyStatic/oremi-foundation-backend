import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const LoadingPageCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleSelect = (selectedIndex) => {
    setActiveIndex(selectedIndex);
  };

  const handleContinue = () => {
    // Redirect to the main page or perform any desired action
    console.log('Redirecting to the main page...');
  };

  const slides = [
    {
      imageUrl: '../UWD-OB/OB-1.png',
      altText: 'Slide 1',
    },
    {
      imageUrl: '../UWD-OB/OB-2.png',
      altText: 'Slide 2',
    },
    {
      imageUrl: '../UWD-OB/OB-3.png',
      altText: 'Slide 3',
    },
  ];

  return (
    <div className="loading-page">
      <div className="carousel-container">
        <div className="carousel">
          <img src={slides[activeIndex].imageUrl} alt={slides[activeIndex].altText} />
        </div>
        <div className="carousel-nav">
          {/* Add dynamic class names to the indicator dots */}
          <div className="carousel-indicator">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`indicator-dot ${index === activeIndex ? 'current' : 'next'}`}
              ></div>
            ))}
          </div>

          {activeIndex !== slides.length - 1 ? (
            <button
              id="nextButton"
              className="carousel-nav-btn"
              onClick={() => handleSelect(activeIndex + 1)}
            >
               <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlSpace="preserve"
      width="40px"
      height="40px"
      version="1.1"
      style={{
        shapeRendering: 'geometricPrecision',
        textRendering: 'geometricPrecision',
        imageRendering: 'optimizeQuality',
        fillRule: 'evenodd',
        clipRule: 'evenodd',
      }}
      viewBox="0 0 0.18 0.18"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      xmlnsXodm="http://www.corel.com/coreldraw/odm/2003"
    >
      <defs>
        <style type="text/css">
          {`
            .str0 { stroke: white; stroke-width: 0.01; stroke-miterlimit: 2.61313; }
            .fil1 { fill: none; }
            .fil0 { fill: #0000FE; }
          `}
        </style>
      </defs>
      <g id="Layer_x0020_1">
        <circle className="fil0" cx="0.09" cy="0.09" r="0.09" />
        <polyline className="fil1 str0" points="0.07,0.06 0.1,0.09 0.07,0.12" />
      </g>
    </svg>
            </button>
          ) : (
            <Link className="continue-btn" onClick={handleContinue} to="/">
              <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlSpace="preserve"
      width="40px"
      height="40px"
      version="1.1"
      style={{
        shapeRendering: 'geometricPrecision',
        textRendering: 'geometricPrecision',
        imageRendering: 'optimizeQuality',
        fillRule: 'evenodd',
        clipRule: 'evenodd',
      }}
      viewBox="0 0 0.18 0.18"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      xmlnsXodm="http://www.corel.com/coreldraw/odm/2003"
    >
      <defs>
        <style type="text/css">
          {`
            .str0 { stroke: white; stroke-width: 0.01; stroke-miterlimit: 2.61313; }
            .fil1 { fill: none; }
            .fil0 { fill: #0000FE; }
          `}
        </style>
      </defs>
      <g id="Layer_x0020_1">
        <circle className="fil0" cx="0.09" cy="0.09" r="0.09" />
        <polyline className="fil1 str0" points="0.07,0.06 0.1,0.09 0.07,0.12" />
      </g>
    </svg>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoadingPageCarousel;
