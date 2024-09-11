const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    nickname: { type: String, required: true, unique: true },
    email: { type: String },
    password: { type: String },
    score: { type: Number, default: 0 },
});

const User = mongoose.model('User', userSchema);
module.exports = User;
