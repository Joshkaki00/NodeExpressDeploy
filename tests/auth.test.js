/**
 * Auth middleware tests — JWT protection on POST /contact.
 * All tests here must FAIL until middleware/auth.js is implemented.
 */
import { test, describe, before, after } from 'node:test'
import assert from 'node:assert/strict'
import jwt from 'jsonwebtoken'
import app from '../app.js'

const TEST_SECRET = 'test-secret-do-not-use-in-prod'

let server
let baseUrl

before(() => {
  process.env.JWT_SECRET = TEST_SECRET
  server = app.listen(0)
  const { port } = server.address()
  baseUrl = `http://localhost:${port}`
})

after(() => {
  server.close()
  delete process.env.JWT_SECRET
})

function validToken() {
  return jwt.sign({ sub: 'test-user' }, TEST_SECRET, { expiresIn: '1h' })
}

describe('POST /contact — JWT auth', () => {
  const validBody = JSON.stringify({ name: 'Alice', email: 'a@b.com', message: 'hello' })
  const jsonHeader = { 'Content-Type': 'application/json' }

  test('returns 401 when Authorization header is missing', async () => {
    const res = await fetch(`${baseUrl}/contact`, {
      method: 'POST',
      headers: { ...jsonHeader },
      body: validBody
    })
    assert.equal(res.status, 401)
    const body = await res.json()
    assert.equal(body.error, 'Unauthorized')
  })

  test('returns 401 when Authorization header is malformed (no Bearer prefix)', async () => {
    const res = await fetch(`${baseUrl}/contact`, {
      method: 'POST',
      headers: { ...jsonHeader, 'Authorization': validToken() },
      body: validBody
    })
    assert.equal(res.status, 401)
    const body = await res.json()
    assert.equal(body.error, 'Unauthorized')
  })

  test('returns 401 when token has invalid signature', async () => {
    const badToken = jwt.sign({ sub: 'evil' }, 'wrong-secret')
    const res = await fetch(`${baseUrl}/contact`, {
      method: 'POST',
      headers: { ...jsonHeader, 'Authorization': `Bearer ${badToken}` },
      body: validBody
    })
    assert.equal(res.status, 401)
  })

  test('returns 401 when token is expired', async () => {
    const expiredToken = jwt.sign({ sub: 'test' }, TEST_SECRET, { expiresIn: -1 })
    const res = await fetch(`${baseUrl}/contact`, {
      method: 'POST',
      headers: { ...jsonHeader, 'Authorization': `Bearer ${expiredToken}` },
      body: validBody
    })
    assert.equal(res.status, 401)
  })

  test('returns 201 with valid token and all body fields', async () => {
    const res = await fetch(`${baseUrl}/contact`, {
      method: 'POST',
      headers: { ...jsonHeader, 'Authorization': `Bearer ${validToken()}` },
      body: validBody
    })
    assert.equal(res.status, 201)
    const body = await res.json()
    assert.equal(body.success, true)
  })

  test('GET /contact does not require auth', async () => {
    const res = await fetch(`${baseUrl}/contact`)
    assert.equal(res.status, 200)
  })

  test('GET / does not require auth', async () => {
    const res = await fetch(`${baseUrl}/`)
    assert.equal(res.status, 200)
  })

  test('GET /about does not require auth', async () => {
    const res = await fetch(`${baseUrl}/about`)
    assert.equal(res.status, 200)
  })
})
