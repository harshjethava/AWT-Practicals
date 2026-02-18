import React from 'react'
import { useNavigate } from 'react-router-dom'

const UserDash = () => {
  const navigate = useNavigate()
  return (
    <div className="dashboard-container">
      <h2 className="page-title">User Dashboard</h2>
      <p>Welcome, <strong> user</strong>!</p>
      <button className="btn" onClick={() => navigate('/')}>Logout</button>
    </div>
  )
}

export default UserDash
