// const app = require('./app')
const request = require('supertest')
const app = require('./app')
const { generateAccessToken, verifyToken } = require('./helpers/auth')

describe('Rest API should allow to register, login and logout users', () => {

  // This user will be registered (at: /api/register)
  let user = {
    id: 1,
    name: 'a',
    email: 'a@a.a',
    password: 'a'
  }

  // This fakeUser won't be registered
  let fakeUser = {
    id: 2,
    name: 'b',
    email: 'b@a.a',
    password: 'b'
  }

  let accessToken
  let fakeToken
  let refreshToken

  beforeAll( () => {
    jest.spyOn(global.Math, 'random').mockReturnValue(0.123456789)
  })

  beforeEach( () => {
    const username = user.name
    const fakeUsername = fakeUser.name
    accessToken = generateAccessToken({ username, name: 'User ' + username }, '2h')
    fakeToken = generateAccessToken({ fakeUsername, name: 'User ' + fakeUsername }, '2h')
    refreshToken = Math.floor(Math.random() * (1000000000000000 - 1 + 1)) + 1
  })


  afterAll( (done) => {
    jest.spyOn(global.Math, 'random').mockRestore();
    // Allows Jest to exit successfully.
    app.closeDb()
    done()
  })


  test('Should register a user with a name, email and password', async () => {
    const response = await request(app).post('/api/register').send(user)
    expect(response.statusCode).toBe(201)
    expect(response.body.id).toBeDefined()
    // because it shouldn't have a password
    expect(response.body).not.toMatchObject(user)
    expect(response.body.name).toEqual(user.name)
    expect(response.body.email).toEqual(user.email)
  })

  test('Should login with registered user', async () => {
    const response = await request(app).post('/api/login')
      .set('Content-Type', 'application/json')
      .send({
      email: user.email,
      password: user.password
    })
    expect(response.statusCode).toEqual(200)
    expect(response.body.token).toBeDefined()
    expect(response.body.token.accessToken).toEqual(accessToken)
    expect(response.body.token.refreshToken).toEqual(refreshToken)
  })

  test('Should not be able to authenticate with a different token', async () => {
    const response = await request(app).get('/api/user')
      .set('Authorization', `Bearer ${fakeToken}`)
      .set('Content-Type', 'application/json')
      .send({})

    expect(response.statusCode).toEqual(200)
    expect(response.body.user.fakeUsername).not.toEqual(user.name)
  })

  test('Should be able to authenticate with the valid token', async () => {
    const response = await request(app).get('/api/user')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Content-Type', 'application/json')
      .send({})

    expect(response.statusCode).toEqual(200)
    expect(response.body.user.username).toEqual(user.name)
    expect(response.body.user.name).toEqual(`User ${user.name}`)
  })

  test('Should be able to logout', async() => {
    const agent = await request(app)
    agent.post('/api/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send()
      .end(function (err, res) {
        expect(res.body.status).toEqual('OK')
    })
  })

  test('Should not be able to login with unregistered user', async () => {
    const response = await request(app).post('/api/login')
      .set('Authorization', `Bearer ${fakeToken}`)
      .set('Content-Type', 'application/json')
      .send({
        email: fakeUser.email,
        password: fakeUser.password
      })

    expect(response.statusCode).toEqual(404)
    expect(response.body.error).toEqual('User not found')
  })

  test('Should not be able to get info for another user', async () => {
    const response = await request(app).get('/api/user')
      .set('Authorization', `Bearer ${fakeToken}`)
      .set('Content-Type', 'application/json')
      .send({})
    expect(response.body.user.name).not.toMatch(`User ${user.name}`)
  })

})
