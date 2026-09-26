import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  countryCode: { type: String, required: true, default: '+91' }, // Standardized for internationalization
  phone: { type: String, required: true },
  role: {
    type: String,
    enum: [
      'ClinicAdmin', 'Doctor', 'Receptionist', 'LabTechnician',
      'Nurse', 'CleaningStaff', 'DressingStaff', 'OTAssistant',
      'OfficeStaff', 'AmbulanceDriver', 'Patient'
    ],
    default: 'Patient', // Self-registration only creates Patients
    required: true
  },
  department: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  isApproved: { type: Boolean, default: false },
  shiftStart: { type: String, default: '09:00' },
  shiftEnd: { type: String, default: '17:00' },
}, { timestamps: true });
import bcrypt from 'bcryptjs';

// Hash password before saving to database
userSchema.pre('save', async function (next) {
  // Only hash if the password is new or modified
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare entered password with hashed password in DB
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);