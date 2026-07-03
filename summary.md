# Project AgriQ Summary

## Project Overview
**AgriQ** (internally Farmiq) is a comprehensive, farmer-first digital platform designed specifically for the agricultural community in India, with a focus on Maharashtra. It serves as a "Digital Government Sahayak" and an AI-driven agronomist, bridging the gap between government services and farmers through an intuitive, multilingual interface.

## Key Features
- **Crop Doctor (AI Diagnosis)**: Instant AI-driven disease detection from leaf photographs with actionable remedies and Grad-CAM visual explanations.
- **Smart Advisory Engine**: Structured recommendations including immediate actions, chemical/organic treatments, prevention strategies, and yield impact assessments.
- **Scheme Finder**: A localized repository of State and Central government schemes, subsidies, and insurance information.
- **Crop Knowledge Hub**: Season-wise guides (sowing to harvesting) for major Indian commercial and food crops.
- **Crop Calendar**: Personalized task itineraries based on specific crops and sowing dates.
- **Officer Directory**: Geo-mapped directory of local Agricultural Officers for direct contact.
- **Multilingual Support**: Natively available in **Marathi, Hindi, and English**.

## Technical Architecture
The system uses a modern, scalable microservices-based architecture:

### 1. Full-Stack Web Platform
- **Frontend**: Built with **React.js**, **Tailwind CSS**, and **Vite** for a high-performance, responsive UI.
- **Backend**: **Node.js** with **Express.js** managing business logic, user authentication, and data orchestration.
- **Database**: **MongoDB** (Mongoose ODM) for flexible storage of schemes, crop data, and farmer profiles.

### 2. AI/ML Diagnostic Service
- **Framework**: **Python** with **FastAPI** for high-performance inference.
- **Ensemble Model**: A weighted ensemble of **EfficientNetV2-S** (accuracy-focused) and **MobileNetV3-Large** (efficiency-focused).
- **Advanced Techniques**:
    - **8-pass Test-Time Augmentation (TTA)** for robust real-world predictions.
    - **Grad-CAM Visualization** for Explainable AI (XAI), highlighting diseased regions.
    - **Performance**: Achieved **99.34% accuracy** across 28 disease classes.

## Project Structure
```text
AgriQ/
├── client/          # React Frontend (Pages, Components, i18n)
├── server/          # Node.js Backend (Controllers, Routes, Models, Cron Jobs)
├── model/           # Python ML Service (FastAPI, Model Checkpoints, Training Scripts)
├── README.md        # Main setup and architecture documentation
└── project_report/  # Detailed academic documentation and research
```

## Impact & Vision
AgriQ aims to reduce the 20-40% annual yield loss caused by crop diseases in India by providing expert-level diagnosis to every farmer with a smartphone. By integrating integrated advisory with disease detection, the platform promotes sustainable farming practices and reduces the misuse of agrochemicals.
