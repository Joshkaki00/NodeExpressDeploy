import jwt from 'jsonwebtoken'

/**
 * Verifies a Bearer JWT in the Authorization header.
 * Reads the secret from process.env.JWT_SECRET.
 * Responds 401 on missing, malformed, expired, or invalid tokens.
 */
export default function authMiddleware(req, res, next) {
  const header = req.headers['authorization'] || ''
  const [scheme, token] = header.split(' ')

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Unauthorized' })
  }
}
