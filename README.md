
# Property Management Intern Challenge

## 🏗️ Project Purpose

This project was built as part of a technical internship challenge.  
It simulates a **property maintenance request system**, where:

- Tenants can submit issue reports (e.g., leaks, noise, damage).
- Service team members (employees) can log in, view, and manage incoming requests.
- Each request is automatically analyzed and prioritized based on urgency keywords (AI-like mock).
- Staff can update the status of each request (`in-progress`, `resolved`) to reflect its current state.

## How It Works

- A simulated "AI" endpoint analyzes tenant messages and assigns a **priority score** based on detected urgency keywords.
- Tenants can **submit requests**, which are stored in **DynamoDB**.
- All actions (except analysis) require **authentication** using **JWT stored in cookies**.
- Admins or users can **change request status**.
- All requests can be **filtered by priority** and retrieved via an API.

## 🧰 Tech Stack

| Layer              | Tech                                    |
|--------------------|-----------------------------------------|
| Runtime            | Node.js 22.x                            |
| Language           | TypeScript                              |
| Framework          | Serverless Framework                    |
| Serverless Runtime | AWS Lambda                              |
| DB                 | AWS DynamoDB (NoSQL)                    |
| Auth               | JSON Web Tokens (`jose` library)        |
| Local Dev          | `serverless-offline`, `esbuild`         |

## Setup Instructions

### 1. Clone the project

```bash
git clone https://github.com/G4C3K2/Property-Management-Intern-Challenge.git
cd property-management-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the project root:

```
JWT_SECRET=your_jwt_secret_key
```

> You can generate one with `npx nanoid` or `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

## AWS Configuration (IMPORTANT)

This project **uses AWS DynamoDB** and requires access to your AWS account.

You need to:

1. Create two DynamoDB tables:
   - `TenantRequests` — with `requestId` (string) as primary key
   - `Tenants` — with `email` (string) as primary key

2. Ensure your AWS CLI is configured with credentials:

```bash
aws configure
```

> The user must have permission to use DynamoDB (PutItem, GetItem, Scan, UpdateItem)

3. Optionally set region in `dynamoClient.ts`, e.g. `region: 'eu-central-1'`

## Running Locally

```bash
npx serverless offline
```

> Local dev server at `http://localhost:3000`

## Available Endpoints

| Method | Path                            | Description                                              | Auth Required |
|--------|---------------------------------|----------------------------------------------------------|---------------|
| POST   | `/register`                     | Register a new user(employee)                            | ❌            |
| POST   | `/login`                        | Authenticate & get JWT cookie                            | ❌            |
| POST   | `/requests`                     | Submit a maintenance request                             | ✅            |
| GET    | `/requests?priority="priority"` | Get all requests (filterable by "high", "medium", "low") | ✅            |
| PUT    | `/requests/{id}`                | Change status of a request                               | ✅            |
| POST   | `/analyze`                      | Internal AI-like message analysis                        | ❌            |

## Request Body Examples

### POST /register

```json
{
    "email": "email@email.com",
    "firstName": "Test",
    "lastName": "Test",
    "password": "test123"
}
```

### POST /login

```json
{
    "email":"email@email.com",
    "password": "test123"
}
```

### POST /requests

```json
{
  "tenantId": "TEN222",
  "message": "water pipe burst, flood",
  "timestamp": "2025-06-06T14:00:00Z"
}
```

### PUT /requests/{id}

```json
{
  "status": "in_progress"
}
```

### POST /analyze

```json
{
  "message": "There's a gas leak in the kitchen"
}
```

## Auth Notes

- JWT is set as a `HttpOnly` cookie named `token`
- Secured endpoints read `token` from the `Cookie` header and verify it

## Development Notes

- All lambda functions are in `functions/`
- Reusable utilities are in `lib/`
- `verify.ts` acts as lightweight middleware for auth in `events/`

## AWS Deployment (optional)

```bash
npx serverless deploy
```

## ✅ Testing

Start with `/register`, then `/login`, then use cookie to test secured routes.

## 📌 Final Note

This project uses your own AWS setup.  
You must connect your AWS credentials and DynamoDB — **nothing is preconfigured or shared**.
