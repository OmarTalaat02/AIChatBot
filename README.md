# AIChatBot

## Overview
This is a real-time AI Chatbot application built using modern technologies such as React.js, Node.js, Socket.IO, and PostgreSQL. It integrates OpenAI's GPT-3.5 API for natural language processing (NLP), enabling interactive and intelligent responses to user inputs. The chatbot allows users to send and receive messages dynamically, with session persistence and chat history stored in a PostgreSQL database

## Features
- Real-Time Communication: Implements WebSockets via Socket.IO for real-time message exchange between users and the chatbot.

- NLP Integration: Utilizes OpenAI’s GPT-3.5 API for intelligent and context-aware responses.

- Session Persistence: Each chat session is uniquely identified and saved, allowing for seamless resumption of conversations.

- Chat History: Retrieves and displays previous messages for continuity and user convenience.

- Dynamic UI: A responsive and visually appealing user interface with features such as auto-scrolling and typing indicators.

- Theme: Designed with a futuristic space theme, featuring a gradient background and modern scrollbars for enhanced user experience.

## Technologies Used
### Frontend
- React.js: For building the user interface.
- Socket.IO: For real-time communication with the backend.
- CSS: For custom styling, including animations and themes.

### Backend
- Node.js: For the serve-side logic
- Express.js: For setting up API endpoints and server management.
- Socket.IO: For WebSocket implementation.

### Database
- PostgreSQL: For storing chat messages and session data.

### Others
- dotenv: For environment variable management.
- OpenAI GPT-3.5 API: For chatbot intelligence and response generation.

## Installation and Setup
### Prerequisites
- Node.js Installed Version 14 or above
- PostgreSQL installed and configured
### Steps
1. Clone REPO
- git clone https://github.com/"your-username"/AIChatBot.git

2. Set up the backend
- cd server
- npm install

3. Set up frontend
- cd Client
- npm install

4. Start application
- Backend: make sure you are in server directory then run "node index.js"
- Frontend: make sure you are in client directory then run "npm start"

## Usage
- Enter messages in the input field to interact with the chatbot.
- Use the "New Chat" button to start a fresh conversation.
- Chat history is displayed dynamically, even after refreshing the page.

## Screenshots (will add soon)

## Acknowledgments
- OpenAI for providing the GPT-3.5 API.
- Socket.IO for enabling real-time communication.
- PostgreSQL for robust database management.
---


