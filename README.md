# AI-Powered Personalized Career Guidance and Intelligent Job Matching System

---

## 🌟 Project Overview

**CareerAI** is a comprehensive, full-stack intelligent career development and talent acquisition platform. The system bridges student capabilities with industry expectations by leveraging **Natural Language Processing (NLP)**, **Taxonomy Normalization**, and a mathematically **Explainable Job Matching Engine** with transparent scoring weights:

$$\text{Match Score} = 60\% \times \text{Skills} + 20\% \times \text{Experience} + 10\% \times \text{Education} + 10\% \times \text{Projects}$$

---

## 🚀 Key System Features

### 👨‍🎓 1. Student & Job Seeker Module
- **JWT Authentication & Profile Management**: Comprehensive profile tracking GPA, major, certifications, portfolio links, and verified skills.
- **NLP Resume Parser**: Upload PDF resumes to automatically extract technical skills, soft skills, educational degrees, work history, and certifications without manual data entry.
- **AI Career Guidance**: Computes suitability across 10+ career domains and returns the **Top 5 recommended career roles** with salary projections, growth rates, and step-by-step roadmaps.
- **Intelligent Job Recommendations**: Scored and ranked job listings with real-time match percentages.
- **Explainable Match Breakdown**: Interactive modal detailing exact scores across Skills (60%), Experience (20%), Education (10%), Projects (10%), matched skills, and missing skills.
- **Skill-Gap Analyzer**: Classifies skills into **Strong**, **Moderate**, and **Missing** with customized 4-phase learning roadmaps.
- **Job Applications**: Submit applications with resume selection and cover letters, and track real-time hiring pipeline statuses (`Applied`, `Under Review`, `Shortlisted`, `Selected`, `Rejected`).

### 🏢 2. Recruiter & Employer Module
- **Recruiter Profile**: Company branding, website, industry domain, location, and description.
- **Job Creation & Management**: Post opportunities specifying required skills (for 60% match weight), preferred skills, experience requirements, education criteria, and salary.
- **Candidate Evaluation**: View all applicants ranked by AI match percentage with instant access to candidate skill profiles and match explanations.
- **Application Status Pipeline**: Seamlessly transition candidate statuses from `Applied` to `Shortlisted` or `Selected`.

### 🛡️ 3. Admin Control Module
- **System Metrics Dashboard**: Real-time counters of active students, verified recruiters, active job postings, and submitted applications.
- **Student & Recruiter Moderation**: Supervise registered accounts, view skill counts, and activate/deactivate users.
- **Job & Application Moderation**: Moderate system-wide job postings and review application records.

---

## 🏗️ Architecture & Communication Flow

```
+-------------------------------------------------------------+
|                 React.js Frontend (SPA)                     |
|                 http://localhost:5173                       |
+------------------------------+------------------------------+
                               | (HTTP / REST + JWT)
                               v
+-------------------------------------------------------------+
|               Node.js & Express.js Backend                  |
|                 http://localhost:5000                       |
+---------------+------------------------------+--------------+
                |                              |
 (PostgreSQL Driver pg)         (Axios HTTP REST)
                |                              |
                v                              v
+-------------------------------+  +--------------------------+
|      PostgreSQL 18 Database   |  |   Python FastAPI AI      |
|      (DB: career_guidance)    |  |   http://127.0.0.1:8000  |
+-------------------------------+  +--------------------------+
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, JavaScript (ES6+), Vite 5, React Router 6, Lucide Icons, Axios, CSS3 Design System |
| **Backend API** | Node.js, Express.js, PostgreSQL Driver (`pg`), JWT, BcryptJS, Multer, Dotenv, CORS |
| **AI / NLP Microservice** | Python 3.12, FastAPI, Uvicorn, PyPDF, Pydantic v2, Scikit-Learn, NumPy |
| **Database** | PostgreSQL 18.3 (Relational Schema, JSONB fields, Foreign Keys, Indexes) |

---

## 📂 Project Structure

```
AI-Career-Job-Matching/
├── database/
│   ├── schema.sql              # 16 Relational Tables, Constraints, Indexes
│   ├── seed.sql                # 70+ Skills, 10 Career Roles, Sample Jobs & Users
│   └── init_db.js              # Automated Database Initialization & Migration Runner
├── ai-service/
│   ├── app/
│   │   ├── main.py             # FastAPI App & Endpoints
│   │   ├── models/schemas.py   # Pydantic Request/Response Models
│   │   ├── services/
│   │   │   ├── text_extractor.py     # PDF & Document Text Cleaning
│   │   │   ├── nlp_extractor.py      # Regex & Entity Skill Extractor
│   │   │   ├── skill_normalizer.py   # Alias Normalization (e.g. ReactJS -> React)
│   │   │   ├── job_matcher.py        # Explainable 60/20/10/10 Matching Engine
│   │   │   ├── career_recommender.py # Top 5 Career Roles & Guidance Engine
│   │   │   └── skill_gap_analyzer.py # Strong/Moderate/Missing Gap Analyzer
│   │   └── data/
│   │       ├── skills_taxonomy.json  # Comprehensive Taxonomy Dictionary
│   │       └── career_roles.json     # 10 Career Roles & Roadmaps
│   └── requirements.txt
├── backend/
│   ├── src/
│   │   ├── config/             # PostgreSQL Pool & Environment Configuration
│   │   ├── controllers/        # Auth, Student, Recruiter, Job, Resume, Career, Admin
│   │   ├── middleware/         # JWT Auth, Role Guards, Multer Upload, Error Handler
│   │   ├── routes/             # REST Endpoints
│   │   ├── services/           # AI Service Axios Client
│   │   └── server.js           # Express Entrypoint
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/         # Navbar, Sidebar, JobCard, SkillBadge, ScoreModal
│   │   ├── context/            # AuthContext (JWT session state)
│   │   ├── pages/              # Public, Student, Recruiter, and Admin Views
│   │   ├── services/api.js     # Axios API Client
│   │   ├── App.jsx             # Routes & Protected Routing
│   │   └── index.css           # Modern Responsive Glassmorphic Styles
│   └── package.json
└── README.md
```

---

## ⚙️ Prerequisites

1. **Node.js**: `v18+` (Tested on `v25.6.0`)
2. **Python**: `3.10+` (Tested on `Python 3.12.10`)
3. **PostgreSQL**: `18.3` (Installed with service running on port `5432`)

---

## 🚀 Step-by-Step Installation & Startup Guide

### Step 1: Configure Environment Variables

Create `backend/.env` file with your PostgreSQL password:

```env
PORT=5000
NODE_ENV=development

# PostgreSQL Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_actual_postgres_password
DB_NAME=career_guidance

# JWT Secret
JWT_SECRET=super_secret_jwt_key_career_guidance_2026_change_in_production
JWT_EXPIRES_IN=7d

# Python AI Service URL
AI_SERVICE_URL=http://127.0.0.1:8000
```

---

### Step 2: Initialize Database & Seed Data

Run the automated database initializer from the `database/` folder:

```bash
# In backend/ or root:
node database/init_db.js
```

> **Note**: This will automatically create the `career_guidance` database (if not existing), execute `database/schema.sql` (all 16 relational tables and indexes), and insert rich development data from `database/seed.sql`.

---

### Step 3: Start Python FastAPI AI Service (Port 8000)

Open **Terminal 1**:

```powershell
cd ai-service
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

*AI Service Health Check:* `http://127.0.0.1:8000/api/ai/health`  
*Interactive Swagger Docs:* `http://127.0.0.1:8000/docs`

---

### Step 4: Start Node.js Express Backend API (Port 5000)

Open **Terminal 2**:

```powershell
cd backend
npm install
npm start
```

*Backend Health Check:* `http://localhost:5000/api/health`

---

### Step 5: Start React.js Frontend UI (Port 5173)

Open **Terminal 3**:

```powershell
cd frontend
npm install
npm run dev
```

*Access the Web Application:* Open your browser at **`http://localhost:5173`**

---

## 🔑 Default Accounts

| Role | Email | Access Route |
| :--- | :--- | :--- |
| **Student** | `alex.student@university.edu` | `/login` |
| **Recruiter** | `recruiter@techcorp.com` | `/login` |
| **Admin** | Configured via `ADMIN_EMAIL` in `.env` | Direct hidden route `/admin/login` |

*(Students and Recruiters can also register directly on `/register`. Admin authentication is dedicated and protected via `/admin/login`.)*

---

## 📊 AI Scoring & Match Formula

The explainable job matching algorithm computes multi-factor fit:

1. **Skill Match (60%)**:
   - $45\%$ allocated to Required Skills matching canonical taxonomy.
   - $15\%$ allocated to Preferred Skills.
2. **Experience Match (20%)**:
   - Compares candidate's verified work history against job's minimum experience years requirement.
3. **Education Match (10%)**:
   - Compares degree qualification (B.Tech / M.Tech / Ph.D.) with job requirements.
4. **Project Domain Relevance (10%)**:
   - Evaluates overlap between project portfolio tech stack and target role keywords.

---

## 🧪 Verification & API Endpoints

| Service | Endpoint | Description |
| :--- | :--- | :--- |
| **AI Microservice** | `POST /api/ai/parse-resume` | Multipart PDF resume upload & NLP skill parsing |
| **AI Microservice** | `POST /api/ai/match-job` | 60/20/10/10 Explainable Job Matching |
| **AI Microservice** | `POST /api/ai/career-recommendation` | Top 5 Career Roles & Roadmaps |
| **AI Microservice** | `POST /api/ai/skill-gap` | Categorized Skill Gap Analysis (Strong/Moderate/Missing) |
| **Backend REST API** | `POST /api/auth/login` | User login & JWT issuance |
| **Backend REST API** | `GET /api/jobs/recommendations` | Student personalized AI job matches |
| **Backend REST API** | `POST /api/applications/apply` | Job application submission with live scoring |
| **Backend REST API** | `GET /api/admin/stats` | System metrics & moderation |