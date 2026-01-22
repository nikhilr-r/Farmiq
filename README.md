# Farmiq V1 (MVP) - Digital Government Sahayak

Farmiq is a farmer-first digital platform for Maharashtra farmers, designed to provide trustworthy access to government schemes, crop knowledge, and officer contacts without requiring login.

## Features (Version 1)
- **No Login Required for Farmers**: Instant access to all public information.
- **Scheme Finder**: Browse Maharashtra State & Central schemes.
- **Crop Knowledge Hub**: Sowing-to-harvest guide.
- **Officer Directory**: Search Agri Officers by District/Taluka.
- **Admin Dashboard**: Content verification and management (Protected).
- **Auto-Updates**: Mock cron job to fetch official updates.

## Tech Stack
- **Frontend**: React, Tailwind CSS, Vite
- **Backend**: Node.js, Express, MongoDB
- **Database**: MongoDB (Local)

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB (Running on port 27017)

### Installation
1.  Clone the repository (or unzip).
2.  Install dependencies for both client and server:
    ```bash
    # Server
    cd server
    npm install
    
    # Client
    cd client
    npm install
    ```

3.  Configure Environment:
    - Ensure `server/.env` exists with `MONGO_URI` and `JWT_SECRET`.

### Running the Project

**Start Backend:**
```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

**Start Frontend:**
```bash
cd client
npm run dev
# App runs on http://localhost:5173
```

### Admin Access
- Go to `/admin/login`
- Register a new admin via Postman/API first (`POST /api/v1/auth/register`) OR use the manual registration endpoint if enabled (currently register route is verified).
- Default seed user (if you run seed script): `admin` / `password123` (Not implemented, please register manually).

## Project Structure
- `client/`: React Frontend
- `server/`: Express Backend
    - `models/`: Mongoose Schemas (Scheme, Crop, Officer)
    - `routes/`: API Routes
    - `cron/`: Auto-update logic
