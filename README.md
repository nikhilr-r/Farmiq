# Agriq (Farmiq V1) - Digital Government Sahayak

Agriq (internally known as Farmiq) is a comprehensive, farmer-first digital platform tailored specifically for the agricultural community in Maharashtra. The product is designed to empower farmers by providing accessible, trustworthy, and actionable insights related to government schemes, localized crop knowledge, and direct contacts to agricultural officers—all with an intuitive interface that offers seamless user experience regardless of the user's technical proficiency.

## About the Agriq Product
Agriq bridges the crucial gap between the government's agricultural services and the hard-working farmers. Recognizing that digital literacy and complex login flows can be barriers, Agriq allows essential modules to be accessed effortlessly. 

**Key Product Offerings:**
- **Scheme Finder**: An intelligent repository of State (Maharashtra) and Central government schemes, allowing farmers to find subsidies, loan waivers, and insurance information relevant to them.
- **Crop Knowledge Hub**: A comprehensive, season-wise guide spanning from sowing to harvesting, empowering farmers with best practices for major commercial and food crops.
- **Crop Doctor (AI Integration)**: An intuitive feature allowing farmers to snap a photo of an infected crop and receive instant, AI-driven disease diagnosis and actionable remedies.
- **Crop Calendar**: A customized itinerary tailored to the farmer's specific crop and sowing date, advising them on irrigation, fertilizers, and pest control at different growth stages.
- **Officer Directory**: A geo-mapped directory of local Agricultural Officers that enables farmers to instantly search for and contact authorities in their District or Taluka.
- **Multilingual Support**: Fully localized to serve users in Marathi, Hindi, and English natively to maximize regional reach.

## Architecture

Below is the high-level architecture diagram demonstrating how the Agriq application connects the user directly to government resources through a scalable Node.js backend.

```mermaid
graph TD;
    Farmer[Farmer (Web/Mobile Browser)] -->|HTTP GET/POST| Frontend[React + Vite Frontend]
    Frontend -->|API Requests| Backend[Node.js + Express Backend]
    
    subgraph Agriq Server
        Backend -->|Fetch Data| DB[(MongoDB)]
        Backend -->|Image Processing Request| AI[Crop Doctor AI service]
        Backend -->|Scheduled Tasks| Cron[Cron Jobs]
    end

    Cron -->|Daily Sync| GovPortal[Government Portals / RSS]
    GovPortal -.->|Data Feed| DB
    
    Admin[Admin Users] -->|Authentication| Backend
```

## Tech Stack
- **Frontend**: React.js, Tailwind CSS, Vite
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ODM)
- **AI/ML**: External API integration / custom models for crop disease detection.

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB (Running on port 27017 or hosted cloud instance)

### Installation
1. Clone the repository (or unzip the files).
2. Install dependencies for both client and server components:
   ```bash
   # Backend Server
   cd server
   npm install
   
   # Frontend Client
   cd client
   npm install
   ```
3. Configure the Environment variables:
   - Ensure `server/.env` is properly configured with your `MONGO_URI` and `JWT_SECRET`.
   - Update `client/src/config/api.js` to point to the correct backend host (default is `http://localhost:5000` for development).

### Running the Application

**Start the Backend API:**
```bash
cd server
npm run dev
# The server will start running on http://localhost:5000
```

**Start the Frontend App:**
```bash
cd client
npm run dev
# The application will be accessible at http://localhost:5173
```

### Seeding Data
To populate the database with initial Schemes, Crops, and Officers, you can run the provided seeder script:
```bash
cd server
node seeder.js
```

### Admin Access
- Navigate to `/admin/login` on the frontend.
- Note: Registration should be completed via an API client (`POST /api/v1/auth/register`) or the seed script to create initial credentials.

## Project Structure
- `client/`: React Frontend (Pages, Components, Context, i18n hooks, assets)
- `server/`: Express Backend
    - `models/`: Mongoose Schemas (Scheme, Crop, Officer, Farmer, Admin)
    - `routes/`: API endpoint definitions
    - `controllers/`: Business logic for API endpoints
    - `cron/`: Auto-update logic and schedulers
    - `data/`: Mock data for seeding the database
