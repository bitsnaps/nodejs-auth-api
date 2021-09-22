# JWT Authentication API using Node and express

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
  http://localhost:8080/api/register \
  -H 'content-type: application/json' \
  -d '{
	"name": "a",
	"email": "a@a.a",
	"password": "a"
}'
```

Login with email:
```bash
curl -X POST \
  http://localhost:8080/api/login \
  -H 'content-type: application/json' \
  -d '{
	"email":"a@a.a",
	"password":"a"
}'
```

Get authenticated user info using client cookie:
```bash
curl -X GET http://localhost:8080/api/user
```

Logout (and delete cookie):
```bash
curl -X POST http://localhost:8080/api/logout
```
