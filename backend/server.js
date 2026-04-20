const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')
dotenv.config()

const app = express()

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://legal-management-system-ecru.vercel.app'
  ],
  credentials: true
}))

app.use(express.json())

app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/cases', require('./routes/caseRoutes'))
app.use('/api/appointments', require('./routes/appointmentRoutes'))
app.use('/api/documents', require('./routes/documentRoutes'))
app.use('/api/chat', require('./routes/chatRoutes'))
app.use('/api/tasks', require('./routes/taskRoutes'))
app.use('/api/clients', require('./routes/clientRoutes'))

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected')
    app.listen(process.env.PORT, () =>
      console.log(`Server running on port ${process.env.PORT}`)
    )
  })
  .catch(err => console.log(err))