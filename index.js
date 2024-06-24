const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const songs = [
    { id: 1, title: 'Despacito', url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk' },
    { id: 2, title: 'Shape of You', url: 'https://www.youtube.com/watch?v=JGwWNGJdvx8' },
    { id: 3, title: 'Blinding Lights', url: 'https://www.youtube.com/watch?v=4NRXx6U8ABQ' },
    { id: 4, title: 'Senorita', url: 'https://www.youtube.com/watch?v=Pkh8UtuejGw' },
    { id: 5, title: 'Dance Monkey', url: 'https://www.youtube.com/watch?v=q0hyYWKXF0Q' }
    // Add more songs as needed
];

const generateOptions = (correctSong) => {
    let options = [correctSong.title];
    let remainingSongs = songs.filter(song => song.id !== correctSong.id);
    remainingSongs.sort(() => Math.random() - 0.5); // Shuffle remaining songs

    for (let i = 0; i < 3; i++) {
        options.push(remainingSongs[i].title);
    }
    
    options.sort(() => Math.random() - 0.5); // Shuffle options

    return options;
};

const rooms = {};

const generateRoomId = () => {
    let roomId;
    do {
        roomId = Math.floor(100000 + Math.random() * 900000).toString();
    } while (rooms[roomId]);
    return roomId;
};

const checkAnswers = (roomId) => {
    const room = rooms[roomId];
    const currentSong = room.songs[room.currentSongIndex];

    // Send correct/wrong answers to all users
    io.to(roomId).emit('answers_summary', {
        correctOption: currentSong.title,
        answers: room.answers
    });

    // Wait for 10 seconds before proceeding to the next song
    setTimeout(() => {
        room.currentSongIndex += 1;
        room.answered.clear(); // Reset for the next song
        room.answers = {}; // Reset answers

        if (room.currentSongIndex < room.songs.length) {
            const nextSong = room.songs[room.currentSongIndex];
            const options = generateOptions(nextSong);
            io.to(roomId).emit('song', { ...nextSong, options });
            startTimer(roomId);
        } else {
            io.to(roomId).emit('game_over', room.scores);
        }
    }, 10000);
};

const startTimer = (roomId) => {
    setTimeout(() => {
        const room = rooms[roomId];
        const currentSong = room.songs[room.currentSongIndex];

        io.sockets.adapter.rooms.get(roomId).forEach(socketId => {
            if (!room.answered.has(socketId)) {
                room.answered.add(socketId);
                room.answers[socketId] = 'No Answer';
            }
        });

        checkAnswers(roomId);
    }, 30000);
};

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('create_room', () => {
        const roomId = generateRoomId();
        rooms[roomId] = {
            songs: [...songs], // Clone songs array
            currentSongIndex: 0,
            scores: {},
            answered: new Set(), // Track users who have answered
            answers: {} // Track answers of all users
        };
        socket.emit('room_created', roomId);
        
        // Automatically join the room and send the first song
        socket.join(roomId);
        const currentSong = rooms[roomId].songs[rooms[roomId].currentSongIndex];
        const options = generateOptions(currentSong);
        socket.emit('song', { ...currentSong, options });
        if (rooms[roomId].answered.size === 0) {
            startTimer(roomId);
        }
    });

    socket.on('join_room', (roomId) => {
        if (!rooms[roomId]) {
            socket.emit('error', { message: 'Room not found.' });
            return;
        }

        socket.join(roomId);
        const currentSong = rooms[roomId].songs[rooms[roomId].currentSongIndex];
        const options = generateOptions(currentSong);
        socket.emit('song', { ...currentSong, options });
        if (rooms[roomId].answered.size === 0) {
            startTimer(roomId);
        }
    });

    socket.on('answer', ({ roomId, answer }) => {
        const room = rooms[roomId];
        const currentSong = room.songs[room.currentSongIndex];

        if (!currentSong) {
            socket.emit('error', { message: 'No more songs available.' });
            return;
        }

        if (room.answered.has(socket.id)) {
            // User already answered this song
            return;
        }

        room.answered.add(socket.id);
        room.answers[socket.id] = answer;

        if (answer === currentSong.title) {
            if (!room.scores[socket.id]) {
                room.scores[socket.id] = 0;
            }
            room.scores[socket.id] += 1;
        }

        if (room.answered.size === io.sockets.adapter.rooms.get(roomId).size) {
            checkAnswers(roomId);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
        // Handle disconnection logic if needed
    });
});

server.listen(4000, () => console.log('Server is running on port 4000'));
