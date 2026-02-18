import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// static credentials
const CREDENTIALS = {
  admin: 'admin',
  user: 'user123',
}

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleSubmit = e => {
    e.preventDefault()

    // check against static credentials
    if (username === 'admin' && password === CREDENTIALS.admin) {
      navigate('/AdminDash')
    } else if (username === 'user' && password === CREDENTIALS.user) {
      navigate('/UserDash')
    } else {
      alert('Invalid Credentials')
    }
  }

  return (
    <div className="login-container">
      <h1 className="page-title">Login</h1>
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            id="username"
            className="input-field"
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            id="password"
            className="input-field"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
        <button className="btn" type="submit">Login</button>
      </form>
    </div>
  )
}

export default Login
