import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import clinicalRoutes from './routes/clinicalRoutes.js';
import labRoutes from './routes/labRoutes.js';
import ambulanceRoutes from './routes/ambulanceRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import billingRoutes from './routes/billingRoutes.js';
import roomRoutes from './routes/roomRoutes.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json()); // Parses incoming JSON requests
app.use(cors({ origin: 'http://localhost:5173', credentials: true })); // Allows frontend to talk to backend
app.use(cookieParser()); // Parses cookies (useful if we store JWT in cookies)

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/clinical', clinicalRoutes);
app.use('/api/lab', labRoutes);
app.use('/api/ambulances', ambulanceRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/rooms', roomRoutes);

// Make the 'uploads' folder publicly accessible
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Basic route to test the server
app.get('/', (req, res) => {
  res.send('MedAssist API is running...');
});

// We will mount our Auth and User routes here next!

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});