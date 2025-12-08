# Project Management API

A comprehensive REST API built with Nest.js, PostgreSQL, TypeORM, and JWT authentication for managing accounts and projects.

## Features

- **RESTful API** with complete CRUD operations
- **PostgreSQL** database with TypeORM ORM
- **JWT Authentication** with secure sign-in/sign-up
- **Permission-Based Access Control** (Standard and Elevated permissions)
- **Input Validation** using class-validator
- **Centralized Error Handling** with custom exception handlers
- **Unit Tests** with Jest

## Tech Stack

- **Framework**: Nest.js 10
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT with Passport.js
- **Validation**: class-validator & class-transformer
- **Testing**: Jest with @nestjs/testing

## API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Welcome info |
| GET | `/status` | System status check |
| POST | `/identity/sign-up` | Register new account |
| POST | `/identity/sign-in` | Authenticate account |

### Protected Endpoints (Require JWT)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/identity/current` | Get current account info | All authenticated |
| GET | `/accounts` | Get all accounts | Elevated only |
| GET | `/accounts/:id` | Get account by ID | Owner or Elevated |
| POST | `/accounts` | Create new account | Elevated only |
| PATCH | `/accounts/:id` | Modify account | Owner or Elevated |
| DELETE | `/accounts/:id` | Remove account | Elevated only |
| GET | `/projects` | Get all projects | All authenticated (own or Elevated) |
| GET | `/projects/:id` | Get project by ID | Owner or Elevated |
| POST | `/projects` | Initiate new project | All authenticated |
| PATCH | `/projects/:id` | Edit project | Owner or Elevated |
| DELETE | `/projects/:id` | Terminate project | Owner or Elevated |

## Installation

```bash
npm install
npm run start:dev
```

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - JWT secret key

## API Usage Examples

### Register a new account

```bash
curl -X POST http://localhost:5000/identity/sign-up \
  -H "Content-Type: application/json" \
  -d '{
    "emailAddress": "user@example.com",
    "secretKey": "password123",
    "givenName": "John",
    "familyName": "Doe"
  }'
```

### Sign in

```bash
curl -X POST http://localhost:5000/identity/sign-in \
  -H "Content-Type: application/json" \
  -d '{
    "emailAddress": "user@example.com",
    "secretKey": "password123"
  }'
```

### Create a project (with token)

```bash
curl -X POST http://localhost:5000/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "projectName": "My First Project",
    "projectDetails": "Project description",
    "urgency": "critical"
  }'
```

### Get all projects

```bash
curl http://localhost:5000/projects \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

## Running Tests

```bash
npm run test
npm run test:cov
npm run test:e2e
```

## Project Structure

```
src/
├── account/                    # Account management module
│   ├── models/                 # Entity definitions
│   ├── schemas/                # Data transfer schemas
│   ├── account.controller.ts
│   ├── account.module.ts
│   └── account.service.ts
├── identity/                   # Authentication module
│   ├── schemas/                # Sign-in/sign-up schemas
│   ├── utilities/              # Token strategy and guards
│   ├── identity.controller.ts
│   ├── identity.module.ts
│   └── identity.service.ts
├── project/                    # Project management module
│   ├── models/
│   ├── schemas/
│   ├── project.controller.ts
│   ├── project.module.ts
│   └── project.service.ts
├── shared/                     # Shared resources
│   ├── constants/              # Enumerations
│   ├── handlers/               # Exception handlers
│   └── utilities/              # Guards and decorators
├── app.controller.ts
├── app.module.ts
├── app.service.ts
└── main.ts
test/
├── app.e2e-spec.ts
└── jest-e2e.json
```

## License

MIT
