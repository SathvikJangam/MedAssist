import MedicalRecord from '../models/MedicalRecord.js';
import { generateClinicalSummaries } from '../services/aiService.js';

// GET: Smart Fetching for EMR Records
export const getMedicalRecords = async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'Patient') {
      query.patientId = req.user._id;
    } else if (req.user.role === 'Doctor') {
      // Doctors can fetch a specific patient's history via /api/clinical/records?patientId=123
      if (req.query.patientId) query.patientId = req.query.patientId;
      else query.doctorId = req.user._id;
    }

    const records = await MedicalRecord.find(query)
      .populate('patientId', 'name age gender')
      .populate('doctorId', 'name pgSpecialization')
      .sort({ createdAt: -1 });

    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST: Doctor creates a record (Triggers Gemini AI)
export const createMedicalRecord = async (req, res) => {
  try {
    const { patientId, appointmentId, clinicalDiagnosis, observations, prescriptions } = req.body;

    // 1. Trigger Gemini AI to generate the summaries
    const aiSummaries = await generateClinicalSummaries(clinicalDiagnosis, observations);

    // 2. Save everything to MongoDB
    const newRecord = await MedicalRecord.create({
      patientId,
      doctorId: req.user._id, // Extracted securely from JWT token
      appointmentId,
      clinicalDiagnosis,
      observations,
      aiGeneratedSummary: aiSummaries.clinicalSummary,
      patientFriendlySummary: aiSummaries.patientFriendlySummary,
      prescriptions
    });

    res.status(201).json(newRecord);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};