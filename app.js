import express from 'express'
import authMiddleware from './middleware/auth.js'

const app = express()
app.use(express.json())

/* HOME */
app.get('/', (req, res) => {
  res.json({
    page: 'Home',
    message: 'Welcome to Node.js deployed on Vercel 🚀'
  })
})

/* ABOUT */
app.get('/about', (req, res) => {
  res.json({
    page: 'About',
    message: 'This is a sample Node.js project with basic routes'
  })
})

/* CONTACT (GET) */
app.get('/contact', (req, res) => {
  res.json({
    page: 'Contact',
    info: 'Send POST request with name, email and message'
  })
})

/* CONTACT (POST) — requires valid JWT */
app.post('/contact', authMiddleware, (req, res) => {
  const { name, email, message } = req.body || {}

  if (!name || !email || !message) {
    return res.status(400).json({
      error: 'name, email and message are required'
    })
  }

  res.status(201).json({
    success: true,
    data: { name, email, message }
  })
})

export default app
