require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const projectRoutes = require('./routes/projects');
const skillRoutes = require('./routes/skills');
const contactRoutes = require('./routes/contact');

const app = express();

app.set('trust proxy', 1);

const PORT = process.env.PORT || 10000;

// Security
app.use(helmet());
app.use(morgan('dev'));

// Rate Limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use('/api', limiter);

// CORS
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://e-commerce-store-frontend-smoky.vercel.app'
  ],
  methods: ['GET','POST','PUT','DELETE'],
  credentials: true
}));

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// Routes
app.use('/api/projects', projectRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/contact', contactRoutes);

// Health check
app.get('/api/health', (req,res)=>{
  res.json({
    status:"OK",
    server:"running"
  });
});

// Root
app.get('/',(req,res)=>{
  res.send('API running');
});

// 404
app.use((req,res)=>{
  res.status(404).json({
    error:"Route not found"
  });
});

// Error handler
app.use((err,req,res,next)=>{
  console.error(err);
  res.status(500).json({
    error:"Server error"
  });
});

app.listen(PORT,()=>{
  console.log(`Server running on port ${PORT}`);
});