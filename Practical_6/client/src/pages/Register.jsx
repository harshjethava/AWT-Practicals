import { useCallback, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      setError('')
      setLoading(true)
      try {
        await register({ name, email, password })
        navigate('/dashboard', { replace: true })
      } catch (err) {
        setError(err?.response?.data?.message || 'Registration failed')
      } finally {
        setLoading(false)
      }
    },
    [name, email, password, register, navigate]
  )

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Register</h1>
          <p className="text-sm text-slate-400">Create your account to start shopping.</p>
        </div>

        {error ? <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm">{error}</div> : null}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-slate-300">Name</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950/40 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm text-slate-300">Email</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950/40 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
          </div>
          <div>
            <label className="text-sm text-slate-300">Password</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950/40 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
            />
          </div>

          <button
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 py-2 font-medium hover:bg-indigo-500 disabled:opacity-60"
            type="submit"
          >
            {loading ? 'Creating...' : 'Create account'}
          </button>
        </form>

        <div className="mt-4 text-sm text-slate-400">
          Already have an account?{' '}
          <Link className="text-indigo-400 hover:text-indigo-300" to="/login">
            Login
          </Link>
        </div>
      </div>
    </div>
  )
}
