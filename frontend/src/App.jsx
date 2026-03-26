import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Cases from './pages/Cases'
import Appointments from './pages/Appointments'
import Chatbot from './pages/Chatbot'
import Hearings from './pages/Hearings'
import DocumentGenerator from './pages/DocumentGenerator'
import Layout from './components/Layout'

const PrivateRoute = ({ children }) => {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" />
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="cases" element={<Cases />} />
          <Route path="hearings" element={<Hearings />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="chat" element={<Chatbot />} />
          <Route path="documents" element={<DocumentGenerator />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App