// Serve as entry point for backend application

// Import modules
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');  // Import the CORS middleware
const axios = require('axios');  // Import axios for API calls
const { Pool } = require('pg');  // Import the Pool class from the pg module

// Database connection configuration
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

pool.connect()
    .then(() => console.log('Connected to PostgreSQL'))
    .catch(err => console.error('Connection error', err.stack));


// Function to save messages to the database
async function saveMessageToDB(sender, text, session_id) {
    try {
        const query = 'INSERT INTO messages (sender, text, session_id, timestamp) VALUES ($1, $2, $3, NOW())';
        const values = [sender, text, session_id];
        await pool.query(query, values);
        console.log('Message saved to database:', { sender, text, session_id });
    } catch (error) {
        console.error('Error saving message to database:', error.message);
    }
}


// Function to retrieve messages from the database
async function getMessagesFromDB(session_id) {
    try {
        const query = 'SELECT * FROM messages WHERE session_id = $1 ORDER BY timestamp ASC';
        const result = await pool.query(query, [session_id]);
        return result.rows;
    } catch (error) {
        console.error('Error retrieving messages from database:', error.message);
        return [];
    }
}



// Init Express application
const app = express();

// Your OpenAI API Key (replace 'your-api-key' with the actual API key)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

// Use CORS to allow cross-origin requests from the frontend
app.use(cors({
    origin: 'http://localhost:3000'  // Allow requests from your React frontend
}));

// Serve a simple message for the root route
app.get('/', (req, res) => {
    res.send('Welcome to the real-time chatbot backend!');
});

// Create an HTTP server and wrap it with Socket.io
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",  // Allow the frontend to connect via WebSockets
        methods: ["GET", "POST"]
    }
});

// Function to send user message to OpenAI and receive a response
async function queryGPT(message) {
    console.log(`Sending message to OpenAI: "${message}"`);  // Log the message being sent to OpenAI

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {  // Correct endpoint
            model: 'gpt-3.5-turbo',  // Updated model to gpt-3.5-turbo
            messages: [{ role: 'user', content: message }],  // New chat format
            max_tokens: 150,  // Control the response length
            temperature: 0.7,  // Controls the randomness of the response
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            }
        });

        console.log('OpenAI response received:', response.data.choices[0].message.content.trim());  // Log the response from OpenAI

        // Return the generated response from OpenAI
        return response.data.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error with OpenAI API:', error.response ? error.response.data : error.message);
        return 'Sorry, I am having trouble understanding that right now.';
    }
}

const { v4: uuidv4 } = require('uuid'); // Install uuid package for session generation

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('resumeSession', async (existingSessionID) => {
        console.log(`Resuming session with ID: ${existingSessionID}`);
        // Fetch chat history for the existing session ID
        const chatHistory = await getMessagesFromDB(existingSessionID);
        socket.emit('chatHistory', chatHistory);
    });

    socket.on('newSession', () => {
        const newSessionID = uuidv4();
        console.log(`New session started: ${newSessionID}`);
        socket.emit('sessionStarted', newSessionID);
    });

    socket.on('message', async (data) => {
        const { text, session_id } = data; // Extract message text and session_id
        console.log('Message received from client:', text);

        // Save the user's message with the session_id
        await saveMessageToDB('user', text, session_id);

        // Generate GPT response
        const gptResponse = await queryGPT(text);

        // Save the bot's response
        await saveMessageToDB('bot', gptResponse, session_id);

        // Send the GPT response back to the client
        io.emit('message', gptResponse);
    });


    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});



// Start Server on port
server.listen(5000, () => {
    console.log('Server is running on port 5000', 'http://localhost:5000');
});
