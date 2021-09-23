// const app = require('./app')
const request = require('supertest')
const app = require('./app')

describe('Rest API should allow to register, login and logout users', () => {

  let user = {
    name: 'a',
    email: 'a@a.a',
    password: 'a'
  }

  test('Route to home should return Hello', async () => {
    const response = await request(app).get('/').send({})
    expect(response.statusCode).toBe(200)
    // console.log(response);
    expect(response.body.message).toEqual('Hello')
    expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
  })

  test('Should register a user with a name, email and password', async () => {
    const response = await request(app).post('/api/register').send(user)
    expect(response.statusCode).toBe(200)
    expect(response.body._id).toBeDefined()
    // because it shouldn't have a password
    expect(response.body).not.toMatchObject(user)
    expect(response.body.name).toEqual(user.name)
    expect(response.body.email).toEqual(user.email)
  })

  test('Should login with registered user', async () => {
    const response = await request(app).post('/api/login')
      .set('Cookie', 'my-jwt-token')
      .set('Content-Type', 'application/json')
      .send({
      email: user.email,
      password: user.password
    })
    expect(response.header['set-cookie'][0]).toMatch(/jwt=/)
    expect(response.body.message).toEqual('success')
  })

  test('Should not be able to authenticate with a wrong token', async () => {

    let token = 'my-jwt-token'

    const response = await request(app).get('/api/user')
      .set('Cookie', `jwt=${token};`)
      .set('Content-Type', 'application/json')
      .send({})

    expect(response.statusCode).toEqual(401)
    expect(response.text).toEqual('Unauthenticated')
  })

})
