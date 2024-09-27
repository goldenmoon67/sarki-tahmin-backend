// controllers/roomController.js
import Room from'../models/Room.js';
import { customAlphabet } from 'nanoid';

// Create a new room
export const createRoom = async (req, res) => {
  const { roomType, category, songSkipTime, pointLimit, competitionType } = req.body;

  try {
    // Generate a unique numeric ID for the room
    const generateRoomId = customAlphabet('0123456789', 6); // 6 digits, numeric only
    const roomId = generateRoomId(); 
    if (!roomId) {
      return res.status(400).json({ msg: 'Failed to generate roomId' });
    }
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

// Join an existing room
export const joinRoom = async (req, res) => {
    const { roomId } = req.params;
  
    try {
      // Find the room by roomId
      const room = await Room.findOne({ roomId });
      if (!room) {
        return res.status(404).json({ msg: 'Room not found' });
      }
  
      // Check if the user is already in the room
      if (room.players.includes(req.user)) {
        return res.status(400).json({ msg: 'You are already in this room' });
      }
  
      // Add the user to the room's player list
      room.players.push(req.user);
      await room.save();
  
      res.status(200).json({ msg: 'Joined room successfully', room });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ msg: 'Server error' });
    }
  };