/**
 * Characterization tests — lock in existing route behavior before any changes.
 * Run with: npm test
 */
import { test, describe, before, after } from 'node:test'
import assert from 'node:assert/strict'
import jwt from 'jsonwebtoken'
import app from '../app.js'

const TEST_SECRET = 'routes-test-secret'

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
  return jwt.sign({ sub: 'test' }, TEST_SECRET, { expiresIn: '1h' })
}

describe('GET /', () => {
  test('returns 200 with page and message fields', async () => {
    const res = await fetch(`${baseUrl}/`)
    assert.equal(res.status, 200)
    const body = await res.json()
    assert.equal(body.page, 'Home')
    assert.ok(body.message)
  })
})

describe('GET /about', () => {
  test('returns 200 with page and message fields', async () => {
    const res = await fetch(`${baseUrl}/about`)
    assert.equal(res.status, 200)
    const body = await res.json()
    assert.equal(body.page, 'About')
    assert.ok(body.message)
  })
})

describe('GET /contact', () => {
  test('returns 200 with page and info fields', async () => {
    const res = await fetch(`${baseUrl}/contact`)
    assert.equal(res.status, 200)
    const body = await res.json()
    assert.equal(body.page, 'Contact')
    assert.ok(body.info)
  })
})

describe('POST /contact — field validation (auth passes)', () => {
  test('returns 400 when name is missing', async () => {
    const res = await fetch(`${baseUrl}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${validToken()}` },
      body: JSON.stringify({ email: 'a@b.com', message: 'hello' })
    })
    assert.equal(res.status, 400)
    const body = await res.json()
    assert.ok(body.error)
  })

  test('returns 400 when email is missing', async () => {
    const res = await fetch(`${baseUrl}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${validToken()}` },
      body: JSON.stringify({ name: 'Alice', message: 'hello' })
    })
    assert.equal(res.status, 400)
  })

  test('returns 400 when message is missing', async () => {
    const res = await fetch(`${baseUrl}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${validToken()}` },
      body: JSON.stringify({ name: 'Alice', email: 'a@b.com' })
    })
    assert.equal(res.status, 400)
  })

  test('returns 201 with echoed data when all fields present', async () => {
    const res = await fetch(`${baseUrl}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${validToken()}` },
      body: JSON.stringify({ name: 'Alice', email: 'a@b.com', message: 'hello' })
    })
    assert.equal(res.status, 201)
    const body = await res.json()
    assert.equal(body.success, true)
    assert.equal(body.data.name, 'Alice')
    assert.equal(body.data.email, 'a@b.com')
    assert.equal(body.data.message, 'hello')
  })
})
