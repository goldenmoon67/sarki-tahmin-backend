// /src/features/socket/handler.js

const generateOptions = (correctSong, songs) => {
    let options = [correctSong.title];
    let remainingSongs = songs.filter(song => song.id !== correctSong.id);
    remainingSongs.sort(() => Math.random() - 0.5); // Shuffle remaining songs

    for (let i = 0; i < 3; i++) {
        options.push(remainingSongs[i].title);
    }
    
    options.sort(() => Math.random() - 0.5); // Shuffle options

    return options;
};

const checkAnswers = (io, roomId, rooms) => {
    const room = rooms[roomId];
    const currentSong = room.songs[room.currentSongIndex];

    io.to(roomId).emit('answers_summary', {
        correctOption: currentSong.title,
        answers: room.answers
    });

    setTimeout(() => {
        room.currentSongIndex += 1;
        room.answered.clear();
        room.answers = {};

        if (room.currentSongIndex < room.songs.length) {
            const nextSong = room.songs[room.currentSongIndex];
            const options = generateOptions(nextSong, room.songs);
            io.to(roomId).emit('song', { ...nextSong, options });
        } else {
            io.to(roomId).emit('game_over', room.scores);
        }
    }, 10000);
};

module.exports = {
    generateOptions,
    checkAnswers,
};
