import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

// 导入页面组件
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import HealthNews from './pages/HealthNews'
import HealthNewsDetail from './pages/HealthNewsDetail'
import Dashboard from './pages/Dashboard'
import PatientManagement from './pages/PatientManagement'
import HealthRecords from './pages/patient/HealthRecords'

// 导入布局组件
import MainLayout from './components/MainLayout'

// 患者端功能页面
import HealthMonitor from './pages/patient/HealthMonitor'
import SmartReminders from './pages/patient/SmartReminders'
import HealthConsultation from './pages/patient/HealthConsultation'
import PersonalSettings from './pages/patient/PersonalSettings'
import MyTreatment from './pages/patient/MyTreatment'
import PatientMedicalRecords from './pages/patient/MedicalRecords'

// 医生端功能页面
import MyPatients from './pages/doctor/MyPatients'
import MedicalRecords from './pages/doctor/MedicalRecords'
import DoctorConsultation from './pages/doctor/DoctorConsultation'
import MedicationPlans from './pages/doctor/MedicationPlans'

// 检查用户是否已登录
function isAuthenticated() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token') !== null
  }
  return false
}

// 受保护的路由组件
function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  return children
}

function App() {
  return (
    <Router>
      <Routes>
        {/* 公共路由 */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* 需要布局的路由 */}
        <Route path="/home" element={<ProtectedRoute><MainLayout><Home /></MainLayout></ProtectedRoute>} />
        <Route path="/health-news" element={<ProtectedRoute><MainLayout><HealthNews /></MainLayout></ProtectedRoute>} />
        <Route path="/health-news/:id" element={<ProtectedRoute><MainLayout><HealthNewsDetail /></MainLayout></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
        <Route path="/patients" element={<ProtectedRoute><MainLayout><PatientManagement /></MainLayout></ProtectedRoute>} />
        <Route path="/health-records" element={<ProtectedRoute><MainLayout><HealthRecords /></MainLayout></ProtectedRoute>} />
        
        {/* 患者端功能路由 */}
        <Route path="/patient/monitor" element={<ProtectedRoute><MainLayout><HealthMonitor /></MainLayout></ProtectedRoute>} />
        <Route path="/patient/reminders" element={<ProtectedRoute><MainLayout><SmartReminders /></MainLayout></ProtectedRoute>} />
        <Route path="/patient/consultation" element={<ProtectedRoute><MainLayout><HealthConsultation /></MainLayout></ProtectedRoute>} />
        <Route path="/patient/settings" element={<ProtectedRoute><MainLayout><PersonalSettings /></MainLayout></ProtectedRoute>} />
        <Route path="/patient/treatment" element={<ProtectedRoute><MainLayout><MyTreatment /></MainLayout></ProtectedRoute>} />
        <Route path="/patient/medical-records" element={<ProtectedRoute><MainLayout><PatientMedicalRecords /></MainLayout></ProtectedRoute>} />
        
        {/* 医生端功能路由 */}
        <Route path="/doctor/my-patients" element={<ProtectedRoute><MainLayout><MyPatients /></MainLayout></ProtectedRoute>} />
        <Route path="/doctor/medical-records" element={<ProtectedRoute><MainLayout><MedicalRecords /></MainLayout></ProtectedRoute>} />
        <Route path="/doctor/consultation" element={<ProtectedRoute><MainLayout><DoctorConsultation /></MainLayout></ProtectedRoute>} />
        <Route path="/doctor/medication-plans/:patientId" element={<ProtectedRoute><MainLayout><MedicationPlans /></MainLayout></ProtectedRoute>} />
        
        {/* 默认路由 */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}

export default App