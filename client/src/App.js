import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { loadFull } from "tsparticles";
import './App.css';

// Connect to the backend server
const socket = io('http://localhost:5000');

function App() {
    const [messages, setMessages] = useState([]); // Store chat messages
    const [input, setInput] = useState('');       // Store the input message
    const messagesEndRef = useRef(null);          // Ref for auto-scrolling

    // Function to scroll to the latest message
    const scrollToLatestMessage = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Scroll to the latest message whenever messages are updated
    useEffect(() => {
        scrollToLatestMessage();
    }, [messages]);

    // Fetch chat history and session management
    useEffect(() => {
        const storedSessionID = localStorage.getItem('session_id');

        if (storedSessionID) {
            console.log('Resuming session with ID:', storedSessionID);
            socket.emit('resumeSession', storedSessionID); // Notify backend to resume session
        } else {
            console.log('No session found, starting a new session');
            socket.emit('newSession'); // Start a new session
        }

        socket.on('sessionStarted', (newSessionID) => {
            console.log('New session started with ID:', newSessionID);
            localStorage.setItem('session_id', newSessionID); // Save session ID in localStorage
        });

        socket.on('chatHistory', (history) => {
            console.log('Chat history received:', history);
            const formattedHistory = history.map((msg) => ({
                ...msg,
                timestamp: new Date(msg.timestamp), // Convert string to Date object
            }));
            setMessages(formattedHistory); // Update state with chat history
        });

        return () => {
            socket.off('sessionStarted');
            socket.off('chatHistory');
        };
    }, []);

    // Listen for incoming messages from the server
    useEffect(() => {
        socket.on('message', (msg) => {
            console.log('Message received from server:', msg);
            const botMessage = { text: msg, sender: 'bot', timestamp: new Date() };
            setMessages((prevMessages) => [...prevMessages, botMessage]);
        });

        return () => {
            socket.off('message');
        };
    }, []);

    // Particle animation configuration
    useEffect(() => {
        async function loadParticles() {
            try {
                const tsParticles = await import("tsparticles-engine"); // Import engine
                const { loadFull } = await import("tsparticles");
                await loadFull(tsParticles.tsParticles); // Use matching engine and particles
                tsParticles.tsParticles.load("particles-js", {
                    particles: {
                        number: { value: 100 },
                        color: { value: "#ffffff" },
                        shape: { type: "circle" },
                        opacity: { value: 0.5 },
                        size: { value: 3 },
                        move: {
                            enable: true,
                            speed: 1,
                            direction: "none",
                            outModes: { default: "out" },
                        },
                    },
                    interactivity: {
                        events: {
                            onHover: { enable: true, mode: "repulse" },
                            onClick: { enable: true, mode: "push" },
                        },
                        modes: {
                            repulse: { distance: 100 },
                            push: { quantity: 4 },
                        },
                    },
                    background: {
                        color: "transparent",
                    },
                });
            } catch (error) {
                console.error("Error loading particles:", error);
            }
        }

        loadParticles();
    }, []);




    // Function to send user messages
    const sendMessage = () => {
        if (input.trim()) {
            const sessionID = localStorage.getItem('session_id'); // Get the current session ID
            const userMessage = { text: input, sender: 'user', timestamp: new Date(), session_id: sessionID };
            setMessages((prevMessages) => [...prevMessages, userMessage]); // Add to chat window
            socket.emit('message', { text: input, session_id: sessionID }); // Send both message and session_id
            setInput(''); // Clear the input field
        }
    };

    // Start a new chat session
    const startNewChat = () => {
        setMessages([]); // Clear current messages
        localStorage.removeItem('session_id'); // Clear stored session ID
        socket.emit('newSession'); // Notify backend to start a new session
    };

    // Handle "Enter" key press to send messages
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };

    // Function to format timestamps
    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    };

    return (
        <div className="chat-container">
            {/* Div for Particle Animation */}
            <div id="particles-js"></div>

            <h1 className="chat-title">Real-Time Chatbot</h1>

            {/* Chat box to display messages */}
            <div className="chat-box">
                {messages.map((msg, index) => (
                    <div key={index} className={`chat-message ${msg.sender}`}>
                        <span>{msg.text}</span>
                        <div className="timestamp">{formatTimestamp(msg.timestamp)}</div>
                    </div>
                ))}
                <div ref={messagesEndRef} /> {/* Ref for auto-scrolling */}
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
                <button onClick={startNewChat} className="new-chat-button">New Chat</button>
            </div>
        </div>
    );
}

export default App;
