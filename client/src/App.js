import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './App.css';

// Connect to the backend server
const socket = io('http://localhost:5000');

function App() {
    const [messages, setMessages] = useState([]);  // Store chat messages
    const [input, setInput] = useState('');        // Store the input message
    const messagesEndRef = useRef(null);           // Ref for the end of the message list

    // Function to scroll to the latest message
    const scrollToLatestMessage = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Listen for incoming messages from the server
    useEffect(() => {
        socket.on('message', (msg) => {
            const botMessage = { text: msg, sender: 'bot', timestamp: new Date() };
            setMessages((prevMessages) => [...prevMessages, botMessage]);
        });

        return () => {
            socket.off('message');
        };
    }, []);

    // Scroll to the latest message whenever messages are updated
    useEffect(() => {
        scrollToLatestMessage();
    }, [messages]);

    // Function to send user messages
    const sendMessage = () => {
        if (input.trim()) {
            const userMessage = { text: input, sender: 'user', timestamp: new Date() };
            setMessages((prevMessages) => [...prevMessages, userMessage]);
            socket.emit('message', input);  // Send the message to the server
            setInput('');  // Clear the input field
        }
    };

    // Handle "Enter" key press to send messages
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };

    // Function to format timestamp
    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    };

    return (
        <div className="chat-container">
            <h1 className="chat-title">Real-Time Chatbot</h1>

            {/* Chat box to display messages */}
            <div className="chat-box">
                {messages.map((msg, index) => (
                    <div key={index} className={`chat-message ${msg.sender}`}>
                        <span>{msg.text}</span>
                        <div className="timestamp">{formatTimestamp(msg.timestamp)}</div>
                    </div>
                ))}
                <div ref={messagesEndRef} />  {/* Ref for auto-scrolling */}
            </div>

            {/* Input field to send messages */}
            <div className="input-container">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="chat-input"
                />
                <button onClick={sendMessage} className="send-button">Send</button>
            </div>
        </div>
    );
}

export default App;
