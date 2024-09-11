// index.js

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const routes = require('./src/routes.js');
const bodyParser = require('body-parser');
const socketService = require('./src/features/socket/service.js');

const mongoString = process.env.DATABASE_URL;

mongoose.connect(mongoString)
    .then(() => console.log('MongoDB bağlantısı başarılı!'))
    .catch(err => console.error('MongoDB bağlantı hatası:', err));

const app = express();
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/api', routes);

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message, data });
});

const server = http.createServer(app);
const io = socketIo(server);


io.use((socket, next) => {
    console.log("Socket.io middleware triggered");  // Add this log
    
    const token = socket.handshake.auth.token;
    if (!token) {
        console.log("Authentication error: Token is missing");
        return next(new Error('Authentication error: Token is missing'));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Token decoded successfully:", decoded);  // Log successful decoding
        socket.user = decoded;
        next();
    } catch (err) {
        console.log("Authentication error: Invalid token");
        return next(new Error('Authentication error: Invalid token'));
    }
});
io.use((socket, next) => {
    console.log("Handshake data: ", socket.handshake);  // Log the entire handshake object
    next();
});



const songs = [
    { id: 1, title: 'Despacito', url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk' },
    { id: 2, title: 'Shape of You', url: 'https://www.youtube.com/watch?v=JGwWNGJdvx8' },
    { id: 3, title: 'Blinding Lights', url: 'https://www.youtube.com/watch?v=4NRXx6U8ABQ' },
    { id: 4, title: 'Senorita', url: 'https://www.youtube.com/watch?v=Pkh8UtuejGw' },
    { id: 5, title: 'Dance Monkey', url: 'https://www.youtube.com/watch?v=q0hyYWKXF0Q' }
];

io.on('connection', (socket) => {   
     console.log('Client connected!');  // Basic connection check

    console.log('New client connected', socket.user);

    socket.on('create_room', () => socketService.createRoom(io, socket, songs));
    
    socket.on('join_room', (roomId) => socketService.joinRoom(socket, roomId));

    socket.on('answer', ({ roomId, answer }) => socketService.handleAnswer(io, socket, roomId, answer));

    socket.on('disconnect', () => {
        console.log('Client disconnected');
        // Handle disconnection logic if needed
    });
});

server.listen(8000, () => console.log('Server is running on port 8000'));
