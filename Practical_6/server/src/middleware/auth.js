import { verifyAccessToken } from '../utils/jwt.js'

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const [type, token] = header.split(' ')

  if (type !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  try {
    const decoded = verifyAccessToken(token)
    req.user = decoded
    return next()
  } catch {
    return res.status(401).json({ message: 'Unauthorized' })
  }
}
