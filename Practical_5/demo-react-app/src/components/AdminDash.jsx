import React from 'react'
import { useNavigate } from 'react-router-dom'

const AdminDash = () => {
  const navigate = useNavigate()
  return (
    <div className="dashboard-container">
      <h2 className="page-title">Admin Dashboard</h2>
      <p>Welcome, <strong>administrator</strong>!</p>
      <button className="btn" onClick={() => navigate('/')}>Logout</button>
    </div>
  )
}

export default AdminDash
