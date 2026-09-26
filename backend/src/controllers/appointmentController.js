import Appointment from '../models/Appointment.js';
import User from '../models/User.js';

// GET: Fetch appointments dynamically based on user role
export const getAppointments = async (req, res) => {
  try {
    let query = {};

    // 1. Smart Filtering based on the JWT Token's role
    if (req.user.role === 'Doctor') {
      // Doctors only see their own schedule
      query.doctorId = req.user._id;
    } else if (req.user.role === 'Patient') {
      // Patients only see their own booking history
      query.patientId = req.user._id;
    }
    // Note: ClinicAdmin and Receptionist bypass the filter, leaving query = {}, so they see everything.

    // 2. Fetch from DB and populate the actual names instead of just showing raw MongoDB IDs
    const appointments = await Appointment.find(query)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name department')
      .sort({ date: 1, time: 1 }); // Sort chronologically (upcoming first)

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createAppointment = async (req, res) => {
  try {
    const { doctorId, date, time, type, notes } = req.body;
    
    // Auto-assign patient ID if a patient is making their own booking
    const patientId = req.user.role === 'Patient' ? req.user._id : req.body.patientId;

    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'Doctor') {
      return res.status(400).json({ message: 'Invalid Doctor selected.' });
    }

    // RULE 1: Doctor must be on duty
    if (doctor.shiftStart && doctor.shiftEnd) {
      if (time < doctor.shiftStart || time > doctor.shiftEnd) {
        return res.status(400).json({ 
          message: `Dr. ${doctor.name} is off duty at ${time}. Duty hours are ${doctor.shiftStart} to ${doctor.shiftEnd}.` 
        });
      }
    }

    // RULE 2: Max 8 appointments per hour slot
    // We count how many appointments exist for this doctor, on this date, at this exact time
    const existingAppointments = await Appointment.countDocuments({ doctorId, date, time });
    if (existingAppointments >= 8) {
      return res.status(400).json({ 
        message: 'This time slot is fully booked (Max 8 patients per hour). Please choose another time.' 
      });
    }

    // RULE 3: Patient bookings go to the Receptionist Queue
    const status = req.user.role === 'Patient' ? 'Pending' : 'Confirmed';

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      date,
      time,
      department: doctor.department || 'General',
      type,
      notes,
      status
    });

    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// GET: Fetch unique patients treated by the logged-in doctor
export const getDoctorPatients = async (req, res) => {
  try {
    // Only fetch appointments tied to this specific doctor
    const doctorId = req.user._id;
    
    // Find all appointments and populate the patient data
    const appointments = await Appointment.find({ doctorId })
      .populate('patientId', 'name email phone bloodGroup emergencyContact')
      .sort({ date: -1 }); // Newest first

    // Extract unique patients (since one patient might have 5 appointments)
    const uniquePatientsMap = new Map();
    
    appointments.forEach(apt => {
      // Ensure patientId exists (hasn't been deleted from DB) and isn't already mapped
      if (apt.patientId && !uniquePatientsMap.has(apt.patientId._id.toString())) {
        uniquePatientsMap.set(apt.patientId._id.toString(), apt.patientId);
      }
    });

    // Convert the map values back to a clean array
    const uniquePatients = Array.from(uniquePatientsMap.values());

    res.status(200).json(uniquePatients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT: Update appointment status (e.g., Pending -> Confirmed -> Checked-In -> Completed)
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate the requested status against allowed enum values in the schema
    const allowedStatuses = ['Pending', 'Confirmed', 'Checked-In', 'In-Progress', 'Completed', 'Cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status update requested.' });
    }

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Optional: Add security to ensure Patients can only cancel their own, while staff can change to anything
    if (req.user.role === 'Patient' && status !== 'Cancelled') {
      return res.status(403).json({ message: 'Patients can only cancel appointments, not confirm them.' });
    }

    appointment.status = status;
    const updatedAppointment = await appointment.save();

    res.status(200).json(updatedAppointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};