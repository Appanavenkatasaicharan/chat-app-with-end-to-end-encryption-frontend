import React, { useState } from "react";
import '../styles/NameForm.css'

const NameForm = ({submitName})=>{
    const [name,setName] = useState('')
    const handleSubmit = (e) => {
        e.preventDefault();
        submitName(name);
      };
      const handleChange = (e) => {
        setName(e.target.value);
      };
    
      return (
        <div className="form-container">
          <form onSubmit={handleSubmit} className="form">
            <h2 className="form-title">Enter Your Name</h2>
            <input
              type="text"
              value={name}
              onChange={handleChange}
              className="form-input"
              placeholder="Your Name"
              required
            />
            <button type="submit" className="form-button">Submit</button>
          </form>
        </div>
      );
}

export default NameForm;