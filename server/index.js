// Serve as entry point for backend application

// Import modules
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');  // Import the CORS middleware
const axios = require('axios');  // Import axios for API calls

// Init Express application
const app = express();

// Your OpenAI API Key (replace 'your-api-key' with the actual API key)
const OPENAI_API_KEY = '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';  // Please replace this with your actual API key!

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

// Listen for connections from clients
io.on('connection', (socket) => {
    console.log('A user connected');

    // Listen for messages from the client
    socket.on('message', async (msg) => {
        console.log('Message received from client:', msg);  // Log the message received from the client

        // Send the message to GPT and get a response
        const gptResponse = await queryGPT(msg);

        console.log('Sending response back to client:', gptResponse);  // Log the response being sent back to the client

        // Send the GPT response back to the client
        io.emit('message', gptResponse);
    });

    // Handle client disconnection
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// Start Server on port
server.listen(5000, () => {
    console.log('Server is running on port 5000');
});
