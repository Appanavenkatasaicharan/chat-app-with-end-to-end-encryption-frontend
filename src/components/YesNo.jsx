import React from 'react';
import '../styles/YesNo.css';

const YesNo = ({ name, onResult }) => {
  return (
    <div className="popup-container">
      <div className="popup">
        <span className='username'>{`${name} `}</span><p className='message'> wants to connect with you.</p>
        <div className="button-container">
          <button onClick={() => onResult(true)}>Accept</button>
          <button onClick={() => onResult(false)}>Reject</button>
        </div>
      </div>
    </div>
  );
};

export default YesNo;
