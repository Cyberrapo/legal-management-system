const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
console.log('API KEY loaded:', process.env.ANTHROPIC_API_KEY ? 'YES' : 'NO')

const app = express();
app.use(cors({
  origin: ['http://localhost:5173', 'https://legal-management-system-ecru.vercel.app'],
  credentials: true
}))
app.use(express.json());

// Routes (we'll add these soon)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/cases', require('./routes/caseRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT, () =>
      console.log(`Server running on port ${process.env.PORT}`)
    );
  })
  .catch(err => console.log(err));