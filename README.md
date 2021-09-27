# JWT Authentication API using Node and express

![test workflow](https://github.com/bitsnaps/nodejs-auth-api/actions/workflows/test.yml/badge.svg)


A simple Auth-API using NodeJS and express framework, with onlyHttp and cookie client validation.

## Create the project

How the project was created:
```
mkdir auth-api
cd auth-api
npm init -y
```

## Install packages
What packages installed:
```bash
npm i express
# Used to store users data (some different DB for prod)
npm i sqlite3
# Used to encrypt password
npm i bcryptjs
# Used to generate user Authentication token
npm i jsonwebtoken
# Used middleware for global authentication
npm i express-jwt
# Allows request from different port and sending credentials
npm i cors
# Parse cookie to verify token
npm i cookie-parser
# Store and read sensitive data from .env file
npm i dotenv
# Run for dev mode
npm i nodemon --save-dev
# For testing
npm i -D jest supertest
```

## Environment variable
You must create the `.env` file to store your secret key:
```bash
TOKEN_SECRET=your_secret_key
```

## Run
```bash
npm run dev
```

## Test
```bash
npm test
```

Register a user:

```bash
curl -X POST \
  http://localhost:3001/api/register \
  -H 'content-type: application/json' \
  -d '{
	"name": "a",
	"email": "a@a.a",
	"password": "a"
}'
```
Returns:
```
{
    "id": 1,
    "name": "a",
    "email": "a@a.a"
}
```

Login with email:
```bash
curl -X POST \
  http://localhost:3001/api/login \
  -H 'content-type: application/json' \
  -d '{
	"email":"a@a.a",
	"password":"a"
}'
```
Returns:
```
{
    "token": {
        "accessToken": "...",
        "refreshToken": ...
    }
}
```

Refresh token:
```bash
curl -X POST \
  http://localhost:3001/api/refresh \
  -H 'content-type: application/json' \
  -d '{
	"refreshToken": 531137316942949
}'
```
Returns:
```
{
    "token": {
        "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiYSIsIm5hbWUiOiJVc2VyIGEiLCJpYXQiOjE2MzI3NDIwMjAsImV4cCI6MTYzMjc0MjA4MH0.jfg3psYKx8FC6ZIKTbVs-oh0piJKtrzfF-HjfCa69dM",
        "refreshToken": 289241271081889
    }
}
```

Get authenticated user info using client cookie:
```bash
curl -X GET \
  http://localhost:3001/api/user \
  -H 'authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiYSIsIm5hbWUiOiJVc2VyIGEiLCJpYXQiOjE2MzI3NDIwMjAsImV4cCI6MTYzMjc0MjA4MH0.jfg3psYKx8FC6ZIKTbVs-oh0piJKtrzfF-HjfCa69dM'
```
Returns:
```
{
    "user": {
        "user": "a",
        "name": "User a",
        "iat": 1632742020,
        "exp": 1632742080
    }
}
```

Logout:
```bash
curl -X POST \
  http://localhost:3001/api/logout \
  -H 'authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiYSIsIm5hbWUiOiJVc2VyIGEiLCJpYXQiOjE2MzI3NDIwMjAsImV4cCI6MTYzMjc0MjA4MH0.jfg3psYKx8FC6ZIKTbVs-oh0piJKtrzfF-HjfCa69dM'
```
Returns:
```
{
    "status": "OK"
}
```
