import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Auth Pages
import Login from './features/auth/Login';
import Register from './features/auth/Register';

// Role Dashboards (each contains their own nested <Routes> for sub-pages)
import AdminDashboard from './features/dashboard/AdminDashboard';
import DoctorDashboard from './features/dashboard/DoctorDashboard';
import PatientDashboard from './features/dashboard/PatientDashboard';
import ReceptionistDashboard from './features/dashboard/ReceptionistDashboard';
import LabTechnicianDashboard from './features/dashboard/LabTechnicianDashboard';
import OfficeStaffDashboard from './features/dashboard/OfficeStaffDashboard';
import AmbulanceDriverDashboard from './features/dashboard/AmbulanceDriverDashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Role-Based Dashboard Routes — each uses "/*" to allow nested sub-routes */}
        <Route path="/admin-dashboard/*" element={<AdminDashboard />} />
        <Route path="/doctor-dashboard/*" element={<DoctorDashboard />} />
        <Route path="/patient-dashboard/*" element={<PatientDashboard />} />
        <Route path="/reception-dashboard/*" element={<ReceptionistDashboard />} />
        <Route path="/lab-dashboard/*" element={<LabTechnicianDashboard />} />
        <Route path="/office-dashboard/*" element={<OfficeStaffDashboard />} />
        <Route path="/driver-dashboard/*" element={<AmbulanceDriverDashboard />} />

        {/* Fallback — redirect unknown routes to login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;