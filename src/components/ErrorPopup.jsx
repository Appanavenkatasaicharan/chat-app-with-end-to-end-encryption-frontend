import React from 'react';
import '../styles/ErrorPopup.css'

const ErrorPopup = ({ message, onClose }) => {
  return (
    <div className="error-popup">
      <p>{message}</p>
      <button onClick={()=>onClose(false)}>OK</button>
    </div>
  );
};

export default ErrorPopup;
