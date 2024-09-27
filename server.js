// server.js
import express from 'express';
import connectDB  from './config/db.js';
import dotenv from 'dotenv';
import authRoutes from'./routes/authRoutes.js';
import roomRoutes from'./routes/roomRoutes.js';
import errorHandler from'./middleware/errorHandler.js';

dotenv.config();
const app = express();

connectDB();

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
