import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import User from '../models/User.js';

// Configure DNS resolution for Windows environment
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

// Load environment variables (Make sure you run this from the backend root folder)
dotenv.config();

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding...');

    // 1. Check if an admin already exists to prevent duplicates
    const adminExists = await User.findOne({ email: 'admin@medassist.com' });

    if (adminExists) {
      console.log('Clinic Admin already exists in the database.');
      process.exit();
    }

    // 2. Create the Admin User
    const admin = new User({
      name: 'System Administrator',
      email: 'admin@medassist.com',
      password: 'admin', // Mongoose pre-save hook will hash this securely!
      countryCode: '+91',
      phone: '9999999999',
      role: 'ClinicAdmin',
      isActive: true
    });

    await admin.save();
    console.log('✅ Success! ClinicAdmin created.');
    console.log('Email: admin@medassist.com');
    console.log('Password: admin');
    
    process.exit();
  } catch (error) {
    console.error('❌ Seeding Failed:', error.message);
    process.exit(1);
  }
};

seedAdmin();