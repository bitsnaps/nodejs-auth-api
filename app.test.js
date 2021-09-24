// const app = require('./app')
const request = require('supertest')
const app = require('./app')
const { generateAccessToken, verifyToken } = require('./helpers/auth')

describe('Rest API should allow to register, login and logout users', () => {

  let user = {
    rowid: 1,
    name: 'a',
    email: 'a@a.a',
    password: 'a'
  }

  let token

  beforeEach( () => {
    token = generateAccessToken({ _id: user.rowid})
  })

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
      .set('Cookie', token)
      .set('Content-Type', 'application/json')
      .send({
      email: user.email,
      password: user.password
    })
    expect(response.header['set-cookie'][0]).toMatch(`jwt=${token}`)
    expect(response.body.message).toEqual('success')
  })

  test('Should not be able to authenticate with unvalid token', async () => {

    const response = await request(app).get('/api/user')
      .set('Cookie', `jwt=1234567`)
      .set('Content-Type', 'application/json')
      .send({})

    expect(response.statusCode).toEqual(401)
    expect(response.body.message).toEqual('Unauthenticated')
  })

  test('Should be able to authenticate with the valid token', async () => {
    const response = await request(app).get('/api/user')
      .set('Cookie', `jwt=${token}`)
      .set('Content-Type', 'application/json')
      .send({})

    expect(response.statusCode).toEqual(200)
    expect(response.body).toMatchObject({email: user.email, name: user.name})
  })

  test('Should be able to logout', async() => {
    const agent = await request(app)
    agent.post('/api/logout')
      .send()
      .end(function (err, res) {
        expect(res.body.message).toEqual('success')
        agent.get('/api/user')
          .set('Cookie', `jwt=${token}`)
          .set('Content-Type', 'application/json')
          .send(function (err, res) {
            expect(res.statusCode).toEqual(401)
            expect(res.body.message).toEqual('Unauthenticated')
          })
    })
  })

})
