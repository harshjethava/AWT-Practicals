import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './components/Login.jsx'
import AdminDash from './components/AdminDash.jsx'
import UserDash from './components/UserDash.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/AdminDash" element={<AdminDash />} />
        <Route path="/UserDash" element={<UserDash />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
