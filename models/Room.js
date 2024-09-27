import mongoose from'mongoose';

const roomSchema = new mongoose.Schema({
  roomId: {
    type: Number,
    required: true,
    unique: true,
  },
  roomType: {
    type: String,
    enum: ['public', 'private'],
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  songSkipTime: {
    type: Number,
    default: 30, // Default to 30 seconds
  },
  pointLimit: {
    type: Number,
    default: 10, // Default point limit to 10
  },
  competitionType: {
    type: String,
    enum: ['multiple-choice', 'text'],
    required: true,
  },
  players: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default  mongoose.model('Room', roomSchema);