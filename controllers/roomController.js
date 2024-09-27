// controllers/roomController.js
const Room = require('../models/Room');
const { nanoid } = require('nanoid');

// Create a new room
exports.createRoom = async (req, res) => {
  const { roomType, category, songSkipTime, pointLimit, competitionType } = req.body;

  try {
    // Generate a unique numeric ID for the room
    const roomId = nanoid(6).replace(/\D/g, '').substring(0, 6); // Generate a 6-digit numeric ID

    const room = new Room({
      roomId,
      roomType,
      category,
      songSkipTime: songSkipTime || 30,
      pointLimit: pointLimit || 10,
      competitionType,
      createdBy: req.user, // req.user comes from the authentication middleware
    });

    await room.save();

    res.status(201).json({ msg: 'Room created successfully', room });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: 'Server error' });
  }
};
