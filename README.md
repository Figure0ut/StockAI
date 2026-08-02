# 📦 StockAI - AI-Powered Inventory Management

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Gemini_AI-8E75B2?style=for-the-badge&logo=googlebard&logoColor=white)

StockAI is a modern, full-stack inventory management application that goes beyond simple CRUD operations. By integrating Google's Gemini AI, the system not only tracks stock levels but acts as a virtual supply chain analyst, providing real-time strategic insights based on the current state of the database.

## 🚀 Live Demo
- **Frontend (Client):** [stock-ai-phi-beryl.vercel.app](https://stock-ai-phi-beryl.vercel.app)
- **Backend API (Swagger UI):** [stockai-zoxh.onrender.com/docs](https://stockai-zoxh.onrender.com/docs)

---

## ✨ Key Features

*   **Full CRUD Functionality:** Create, read, update, and delete inventory items instantly.
*   **AI Strategic Analysis:** A dedicated integration with Gemini Flash processes the entire database payload and generates concise, high-impact business insights (rendered in Markdown).
*   **Modern UI/UX:** Built with Tailwind CSS v4, featuring a responsive, dark-mode-first aesthetic with dynamic layout rendering.
*   **Monorepo Architecture:** Clean separation of concerns with the frontend and backend coexisting in a single repository for streamlined CI/CD deployments.

---

## 🛠️ Tech Stack & Architecture

### Frontend (`/frontend`)
*   **Framework:** React + Vite
*   **Styling:** Tailwind CSS v4
*   **Markdown Parsing:** `react-markdown` + `@tailwindcss/typography`
*   **Deployment:** Vercel

### Backend (`/app`)
*   **Framework:** FastAPI (Python)
*   **Database ORM:** SQLAlchemy
*   **AI Integration:** Google Generative AI SDK (`gemini-flash-latest`)
*   **Deployment:** Render

---

## 💻 Local Development Setup

This project uses a monorepo structure. You will need to run the backend and frontend servers in separate terminal instances.

### 1. Backend Setup
Navigate to the root directory and set up the Python environment:
```bash
# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up your environment variables
# Create a .env file in the root and add:
# GOOGLE_API_KEY=your_gemini_api_key_here

# Run the FastAPI server
uvicorn app.main:app --reload

```

*The API will be available at `http://localhost:8000*`

### 2. Frontend Setup

Open a new terminal window and navigate to the frontend directory:

```bash
cd frontend

# Install Node dependencies
npm install

# Set up environment variables
# Create a .env file in the frontend folder and add:
# VITE_API_URL=http://localhost:8000

# Start the Vite development server
npm run dev

```

*The application will be available at `http://localhost:5173*`

---

## 🧠 AI Integration Details

The AI feature relies on a custom `POST /analyze-stock` endpoint. When triggered, the backend aggregates the current database state into a JSON payload and injects it into a constrained prompt designed for supply chain analysis.

---

*Designed and built by Pablo Bernal.*
