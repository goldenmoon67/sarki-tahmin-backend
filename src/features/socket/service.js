// /src/features/socket/service.js

const handler = require('./handler');

const rooms = {};

const generateRoomId = () => {
    let roomId;
    do {
        roomId = Math.floor(100000 + Math.random() * 900000).toString();
    } while (rooms[roomId]);
    return roomId;
};

const createRoom = (io, socket, songs) => {
    const roomId = generateRoomId();
    rooms[roomId] = {
        songs: [...songs],
        currentSongIndex: 0,
        scores: {},
        answered: new Set(),
        answers: {}
    };
    socket.emit('room_created', roomId);
    socket.join(roomId);

    const currentSong = rooms[roomId].songs[rooms[roomId].currentSongIndex];
    const options = handler.generateOptions(currentSong, rooms[roomId].songs);
    socket.emit('song', { ...currentSong, options });
};

const joinRoom = (socket, roomId) => {
    if (!rooms[roomId]) {
        socket.emit('error', { message: 'Room not found.' });
        return;
    }

    socket.join(roomId);
    const currentSong = rooms[roomId].songs[rooms[roomId].currentSongIndex];
    const options = handler.generateOptions(currentSong, rooms[roomId].songs);
    socket.emit('song', { ...currentSong, options });
};

const handleAnswer = (io, socket, roomId, answer) => {
    const room = rooms[roomId];
    const currentSong = room.songs[room.currentSongIndex];

    if (!currentSong) {
        socket.emit('error', { message: 'No more songs available.' });
        return;
    }

    if (room.answered.has(socket.id)) {
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
        handler.checkAnswers(io, roomId, rooms);
    }
};

module.exports = {
    createRoom,
    joinRoom,
    handleAnswer
};
