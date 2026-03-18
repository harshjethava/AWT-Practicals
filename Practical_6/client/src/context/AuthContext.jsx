import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { http, setAuthToken } from '../api/http'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '')
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  })

  useEffect(() => {
    setAuthToken(token)
  }, [token])

  const isAuthed = Boolean(token)

  const login = useCallback(async ({ email, password }) => {
    const res = await http.post('/auth/login', { email, password })
    const nextToken = res.data.token
    const nextUser = res.data.user

    localStorage.setItem('token', nextToken)
    localStorage.setItem('user', JSON.stringify(nextUser))

    setToken(nextToken)
    setUser(nextUser)

    return nextUser
  }, [])

  const register = useCallback(async ({ name, email, password }) => {
    const res = await http.post('/auth/register', { name, email, password })
    const nextToken = res.data.token
    const nextUser = res.data.user

    localStorage.setItem('token', nextToken)
    localStorage.setItem('user', JSON.stringify(nextUser))

    setToken(nextToken)
    setUser(nextUser)

    return nextUser
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken('')
    setUser(null)
    setAuthToken('')
  }, [])

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthed,
      login,
      register,
      logout,
    }),
    [token, user, isAuthed, login, register, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
