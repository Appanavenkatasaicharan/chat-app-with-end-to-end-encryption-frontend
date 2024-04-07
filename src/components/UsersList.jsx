import React from 'react';
import '../styles/UsersList.css'

const UsersList = ({ onClose,users,username,selectUser }) => {
  return (
    <>
    <div className="overlay"></div>
    <div className="users-list-popup">
      <div className="popup-content">
        <div className="search-bar">
          <input type="text" placeholder="Search users..." />
        </div>
        <div className="users-list">
          { 
          users
          .filter(user=>user.name!==username)
          .map((user)=><div className='user' onClick={()=>selectUser(user)}>{user.name}</div> )
          }
        </div>
      </div>
      <button className="close-btn" onClick={onClose}>Close</button>
    </div>
    </>
  );
};

export default UsersList;
