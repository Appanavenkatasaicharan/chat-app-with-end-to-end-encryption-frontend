import { io } from "socket.io-client";
import './App.css';
import {  useEffect, useState } from "react";
import NameForm from "./components/NameForm";
import UsersList from "./components/UsersList";
import YesNo from "./components/YesNo";
import ErrorPopup from "./components/ErrorPopup";
import { createDiffieHellman } from 'crypto-browserify';
import CryptoJS from "crypto-js";

function App() {
  
  const [name,setName] = useState('');
  const [tryingToConnect,setTryingToConnect] = useState({})
  const [isConnected,setIsConnected] = useState(false)
  const [socket,setSocket] = useState(null);
  const [users,setUsers] = useState([]);
  const [onlineUsers,setOnlineUsers] = useState();

  const [message,setMessage] = useState('')
  const [messages,setMessages] = useState([]);

  const [showUsersList, setShowUsersList] = useState(false);
  const [showYesNo,setShowYesNo] = useState(false)
  const [showError,setShowError] = useState(false)
  const [error,setError] = useState('')
  
  const [dh,setDh] = useState(null)
  const [publickey,setPublicKey] = useState()
  const [key,setKey] = useState(null)
  const [receivingMsg,setReceivingMsg] = useState(null)
  

  const handleStartConversation = () => {
    socket.emit('get-users',(myRes)=>{
      setUsers(myRes)
      setOnlineUsers(myRes.length)
    })
    setShowUsersList(true);
  };

  const handleCloseUsersList = () => {
    setShowUsersList(false);
  };

  const selectUser = (user)=>{
    setTryingToConnect(user);
    setShowUsersList(false);
    socket.emit('make-connection',user.id);
  }

  const yesOrNoResponse = (myRes)=>{
    setShowYesNo(false)
    socket.emit('connection-response',tryingToConnect,myRes)
    if(myRes){
      setIsConnected(true)
    }
  }

  const handleConnectionResponse = (myRes)=>{
    if(myRes){
      setIsConnected(true)
      setMessages([])
    }
    else{
      setError('User denied')
      setShowError(true)
    }
  }

  const handleMessageChange = (e)=>{
    setMessage(e.target.value)
  }

  const sendMessage = ()=>{
    setMessages((prevMessages)=>[...prevMessages,{msg:message,type:'sent'}])
    const encrypted = CryptoJS.AES.encrypt(message,key).toString()
    socket.emit('send-message',tryingToConnect,encrypted)
    console.log("Message: ",message);
    console.log('Encrypted: ',encrypted);
    setMessage('')
  }

  const receiveMessage = (encrypted)=>{
    setReceivingMsg(encrypted)
    console.log("Received: ",encrypted);
  }

  const leaveConversation = ()=>{
    socket.emit('leave-conversation',tryingToConnect)
    setIsConnected(false)
    setMessages([])
  }

  const handleLeaveConversationEvent = ()=>{
    setIsConnected(false)
    setMessages([])
  }

  
  const initiateConnection = (name)=>{
    setName(name);
    const socket = io('https://chat-app-with-end-to-end-encryption-backend-axom5787n.vercel.app/', { transports: ['websocket', 'polling', 'flashsocket'] });
    socket.on('connect',()=>{
      setSocket(socket)
      
      socket.emit('take-name',name);
      
      socket.emit('get-users',(myRes)=>{
        setUsers(myRes)
        setOnlineUsers(myRes.length)
      })
      
      socket.on('update-users',(myRes)=>{
        setUsers(myRes)
        setOnlineUsers(myRes.length)
      })
      
      socket.on(`connect-with-${socket.id}`,(user,callback)=>{
        if(isConnected){
          callback({
            error : true,
            msg : "User is Busy."
          })
        }
        else{
          setShowYesNo(true)
          setTryingToConnect(user)
        }
      })

      socket.on(`connection-response-${socket.id}`,handleConnectionResponse)
      
      socket.on(`receive-message-${socket.id}`,receiveMessage)
      
      socket.on(`dh-values-${socket.id}`,(myRes)=>{
        const obj = createDiffieHellman(myRes.prime,myRes.generator);
        obj.generateKeys()
        setDh(obj)
        console.log("Received prime,generator from the server");
      })
      
      socket.on(`take-publickey-${socket.id}`,(pubkey)=>{
        setPublicKey(pubkey)
        console.log("Received public key.");
      })
      
      socket.on(`leave-conversation-${socket.id}`,handleLeaveConversationEvent)
    })
  }
  useEffect(() => {
    if (socket && dh && tryingToConnect.id) {
      socket.emit(`take-publickey`, tryingToConnect, dh.getPublicKey());
      console.log('Sending public key.');
    }
  }, [dh, socket, tryingToConnect]);

  useEffect(() => {
    if (dh && publickey) {
      setKey(new TextDecoder().decode(dh.computeSecret(Buffer(publickey))));
      console.log('Secret Key: ',new TextDecoder().decode(dh.computeSecret(Buffer(publickey))));
    }
  }, [dh, publickey]);

  useEffect(()=>{
    if(receivingMsg&&key){
      const decrypted = CryptoJS.AES.decrypt(receivingMsg,key).toString(CryptoJS.enc.Utf8)
      setMessages((prevMessages)=>[...prevMessages,{msg:decrypted,type:'received'}])
      setReceivingMsg(null)

      console.log('Decrypted: ',decrypted);
    }
  },[receivingMsg,key])
  
  
  return (
    <div className="App">
        { 
          !name ? <NameForm submitName={initiateConnection} /> :
          <div className="chat-container">
      <div className="sidebar">
        <p>Hello {name}</p>
        <div className="user-count">
          <span>Online Users: </span>
          <span>{onlineUsers}</span>
        </div>
        {isConnected ? (
          <button className="leave-conversation-btn" onClick={leaveConversation}>Leave Conversation</button>
          ) : (
          <button className="start-conversation-btn" onClick={handleStartConversation}>Start Conversation</button>
        )}
        {isConnected && <><p> You are connected with {tryingToConnect.name}</p><div>Your chats are end to end encrypted.</div></>  }
      </div>
      <div className="main-panel">
  {(isConnected) ? (
    <>
      {messages.map((message) => (
        <div className={`message ${message.type}`}>
          <div className="message-text">{message.msg}</div>
        </div>
      ))}
      <div className="message-input-container">
        <input type="text" 
          placeholder="Type your message..." 
          className="message-input" 
          value={message} 
          onChange={handleMessageChange} 
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              sendMessage();
            }
        }} />
        <button className="send-btn" onClick={sendMessage}>Send</button>
      </div>
    </>
  ) : (
    <div className="not-connected-message">
      <p>You are not connected to anyone</p>
      <button className="start-conversation-btn" onClick={handleStartConversation}>Start Conversation</button>
    </div>
  )}
      {showUsersList && <UsersList onClose={handleCloseUsersList} users={users} username={name} selectUser={selectUser} />}
      {showYesNo && <YesNo name={tryingToConnect.name} onResult={yesOrNoResponse} />}
      {showError && <ErrorPopup message={error} onClose={setShowError} /> }
      </div>
    </div>
        }
    </div>
  );
}

export default App;