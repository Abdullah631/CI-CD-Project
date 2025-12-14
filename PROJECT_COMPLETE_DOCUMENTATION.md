# RemoteHire.io - Complete Project Documentation

## 🎯 Project Overview

**RemoteHire.io** is an AI-powered recruitment platform designed for remote hiring. It features intelligent CV analysis, secure interviews, candidate-recruiter matching, and comprehensive dashboards for both recruiters and candidates.

---

## 🏗️ Technology Stack

### Backend

- **Framework:** Django 5.2.9 with Django REST Framework
- **Database:** PostgreSQL (configurable to SQLite for development)
- **Authentication:** JWT (JSON Web Tokens)
- **File Storage:** AWS S3 / Local storage
- **AI/ML:** Google Gemini API for CV parsing
- **OAuth:** Google, GitHub, LinkedIn integration

### Frontend

- **Framework:** React 19.1.1
- **Build Tool:** Vite 7.1.2
- **UI Library:** Lucide React (icons)
- **HTTP Client:** Axios
- **Styling:** Tailwind CSS (inline utility classes)
- **OAuth:** @react-oauth/google

### Key Python Libraries

- `djangorestframework` - REST API
- `django-cors-headers` - CORS handling
- `python-dotenv` - Environment variables
- `boto3` - AWS S3 integration
- `google-generativeai` - Gemini AI for CV parsing
- `pypdf` & `python-docx` - Document parsing
- `pillow` - Image processing
- `psycopg2-binary` - PostgreSQL adapter

---

## 📊 Database Models

### 1. User Model

**Purpose:** Store user accounts for both candidates and recruiters

**Fields:**

- `username` - Unique username
- `password` - Hashed password
- `email` - Unique email
- `role` - User role: 'candidate' or 'recruiter'
- `date` - Registration date
- `photo` - Profile picture (stored in S3 or locally)
- `full_name` - Full name
- `phone_number` - Contact number
- `cv` - Resume/CV file (PDF/DOC)
- `cv_metadata` - JSON field with parsed CV data (skills, experience, education)
- `cv_last_updated` - Last CV update timestamp

### 2. Job Model

**Purpose:** Store job postings created by recruiters

**Fields:**

- `title` - Job title
- `description` - Job description
- `status` - 'active' or 'closed'
- `posted_by` - ForeignKey to User (recruiter)
- `created_at` - Creation timestamp
- `requirements` - JSON field with job requirements for matching

### 3. Application Model

**Purpose:** Track job applications

**Fields:**

- `job` - ForeignKey to Job
- `applicant` - ForeignKey to User (candidate)
- `created_at` - Application timestamp
- `similarity_score` - AI-calculated match score (0-100)

### 4. Interview Model

**Purpose:** Manage interview scheduling

**Fields:**

- `job` - ForeignKey to Job
- `recruiter` - ForeignKey to User (recruiter)
- `candidate` - ForeignKey to User (candidate)
- `scheduled_at` - Interview date/time
- `status` - 'pending', 'accepted', or 'declined'
- `created_at` - Creation timestamp

---

## 🔌 Backend API Endpoints

### Authentication Endpoints

| Method | Endpoint              | Description                   | Auth Required |
| ------ | --------------------- | ----------------------------- | ------------- |
| POST   | `/api/register/`      | Register new user             | No            |
| POST   | `/api/login/`         | Login user, returns JWT token | No            |
| POST   | `/api/auth/google/`   | OAuth login with Google       | No            |
| POST   | `/api/auth/github/`   | OAuth login with GitHub       | No            |
| POST   | `/api/auth/linkedin/` | OAuth login with LinkedIn     | No            |

### Recruiter - Job Management

| Method | Endpoint                        | Description                | Auth Required   |
| ------ | ------------------------------- | -------------------------- | --------------- |
| GET    | `/api/recruiter/jobs/`          | List all jobs by recruiter | Yes (Recruiter) |
| POST   | `/api/recruiter/jobs/add/`      | Create new job posting     | Yes (Recruiter) |
| GET    | `/api/recruiter/jobs/<job_id>/` | Get specific job details   | Yes (Recruiter) |
| PUT    | `/api/recruiter/jobs/<job_id>/` | Update job                 | Yes (Recruiter) |
| DELETE | `/api/recruiter/jobs/<job_id>/` | Delete job                 | Yes (Recruiter) |

### Recruiter - Dashboard & Analytics

| Method | Endpoint                            | Description                                               | Auth Required   |
| ------ | ----------------------------------- | --------------------------------------------------------- | --------------- |
| GET    | `/api/recruiter/dashboard/stats/`   | Get dashboard statistics (jobs, candidates, applications) | Yes (Recruiter) |
| GET    | `/api/recruiter/analytics/`         | Get detailed analytics (pipeline, top jobs, metrics)      | Yes (Recruiter) |
| GET    | `/api/recruiter/active-candidates/` | Get count of active candidates                            | Yes (Recruiter) |

### Recruiter - Candidate Management

| Method | Endpoint                                   | Description                        | Auth Required         |
| ------ | ------------------------------------------ | ---------------------------------- | --------------------- |
| GET    | `/api/recruiter/applicants/`               | Get all applicants across all jobs | Yes (Recruiter)       |
| GET    | `/api/recruiter/applicants/recent/`        | Get recent applicants              | Yes (Recruiter)       |
| GET    | `/api/recruiter/jobs/<job_id>/applicants/` | Get applicants for specific job    | Yes (Recruiter)       |
| GET    | `/api/candidate/<user_id>/cv-metadata/`    | Get candidate's CV metadata        | Yes (Recruiter)       |
| GET    | `/api/candidate/<user_id>/cv/view/`        | View candidate's CV                | Yes (Recruiter/Owner) |
| GET    | `/api/candidate/<user_id>/cv/download/`    | Download candidate's CV            | Yes (Recruiter/Owner) |

### Recruiter - Interview Management

| Method | Endpoint                                  | Description                       | Auth Required   |
| ------ | ----------------------------------------- | --------------------------------- | --------------- |
| POST   | `/api/interviews/schedule/`               | Schedule interview with candidate | Yes (Recruiter) |
| GET    | `/api/interviews/recruiter/`              | Get all interviews for recruiter  | Yes (Recruiter) |
| POST   | `/api/interviews/<interview_id>/signal/`  | Send WebRTC signal for video call | Yes             |
| GET    | `/api/interviews/<interview_id>/signals/` | Get WebRTC signals                | Yes             |

### Candidate - Job Search & Applications

| Method | Endpoint                                         | Description                       | Auth Required   |
| ------ | ------------------------------------------------ | --------------------------------- | --------------- |
| GET    | `/api/jobs/`                                     | Get all public active jobs        | Yes (Candidate) |
| POST   | `/api/jobs/<job_id>/apply/`                      | Apply for a job                   | Yes (Candidate) |
| GET    | `/api/candidate/applications/`                   | Get all applications by candidate | Yes (Candidate) |
| DELETE | `/api/candidate/applications/<app_id>/withdraw/` | Withdraw application              | Yes (Candidate) |

### Candidate - Dashboard & Profile

| Method | Endpoint                          | Description                                    | Auth Required   |
| ------ | --------------------------------- | ---------------------------------------------- | --------------- |
| GET    | `/api/candidate/dashboard/stats/` | Get dashboard stats (applications, interviews) | Yes (Candidate) |
| GET    | `/api/candidate/profile/`         | Get candidate profile                          | Yes (Candidate) |
| PUT    | `/api/candidate/profile/`         | Update candidate profile                       | Yes (Candidate) |
| POST   | `/api/candidate/upload-cv/`       | Upload CV (auto-parsed with AI)                | Yes (Candidate) |
| DELETE | `/api/candidate/delete-cv/`       | Delete CV                                      | Yes (Candidate) |

### Candidate - Interview Management

| Method | Endpoint                                   | Description                      | Auth Required   |
| ------ | ------------------------------------------ | -------------------------------- | --------------- |
| GET    | `/api/interviews/candidate/`               | Get all interviews for candidate | Yes (Candidate) |
| POST   | `/api/interviews/<interview_id>/response/` | Accept/decline interview         | Yes (Candidate) |

---

## 🖥️ Frontend Pages & Routes

### Public Pages

| Route     | Component   | Description                                   |
| --------- | ----------- | --------------------------------------------- |
| `/`       | LandingPage | Homepage with features and login/signup links |
| `/signin` | SignInPage  | Login form with email/password and OAuth      |
| `/signup` | SignUpPage  | Registration form (candidate/recruiter)       |

### OAuth Callback Pages

| Route                     | Component            | Description                     |
| ------------------------- | -------------------- | ------------------------------- |
| `/auth/github/callback`   | GitHubCallbackPage   | GitHub OAuth callback handler   |
| `/auth/linkedin/callback` | LinkedInCallbackPage | LinkedIn OAuth callback handler |

### Recruiter Pages (Protected)

| Route                   | Component               | Description                                       |
| ----------------------- | ----------------------- | ------------------------------------------------- |
| `/dashboard`            | DashboardPage           | Recruiter main dashboard with stats               |
| `/job-posts`            | JobPostsPage            | Manage job postings (CRUD)                        |
| `/recruiter-candidates` | RecruiterCandidatesPage | View and filter all candidates/applicants         |
| `/recruiter-interviews` | RecruiterInterviewsPage | Manage scheduled interviews                       |
| `/recruiter-analytics`  | RecruiterAnalyticsPage  | Analytics dashboard (pipeline, metrics, top jobs) |
| `/candidate/:id`        | CandidateDetailsPage    | View detailed candidate profile and CV            |

### Candidate Pages (Protected)

| Route                   | Component               | Description                    |
| ----------------------- | ----------------------- | ------------------------------ |
| `/candidate-dashboard`  | CandidateDashboardPage  | Candidate dashboard with stats |
| `/find-jobs`            | FindJobsPage            | Browse and apply for jobs      |
| `/candidate-interviews` | CandidateInterviewsPage | View interview invitations     |
| `/profile`              | ProfilePage             | Manage profile and upload CV   |

### Shared Pages

| Route                               | Component         | Description                 |
| ----------------------------------- | ----------------- | --------------------------- |
| `/interview-room?id=<interview_id>` | InterviewRoomPage | WebRTC video interview room |

---

## 🎨 Frontend Components

### Navigation Components

- **LandingNav** - Navigation for landing page (public)
- **RecruiterNav** - Navigation for recruiter pages
- **CandidateNav** - Navigation for candidate pages
- **Header** - Shared header component

### Reusable Components

- **JobDetailsModal** - Modal to display job details

---

## 🔐 Authentication & Security

### JWT Authentication Flow

1. User logs in via `/api/login/` or OAuth
2. Backend returns JWT token (expires in ~30 days)
3. Frontend stores token in `localStorage`
4. All subsequent requests include header: `Authorization: Bearer <token>`
5. Custom middleware `JWTAuthenticationMiddleware` validates token
6. `request.user` is populated with authenticated user

### OAuth Integration

- **Google:** Uses `@react-oauth/google` library
- **GitHub:** OAuth 2.0 flow with client ID/secret
- **LinkedIn:** OAuth 2.0 flow with client ID/secret

### Middleware Stack

1. CORS Middleware (allows frontend origin)
2. Security Middleware
3. Session Middleware
4. **JWT Authentication Middleware** (custom - authenticates requests)
5. CSRF Middleware
6. Auth Middleware
7. Messages Middleware

---

## 🤖 AI Features

### CV Parsing with Google Gemini AI

**Location:** `remotehire_backend/loginapi/cv_parser.py`

**Process:**

1. Candidate uploads PDF or DOCX file
2. Backend extracts text using `pypdf` or `python-docx`
3. Text is sent to Google Gemini API with structured prompt
4. AI returns JSON with:
   - Skills (programming languages, tools, frameworks)
   - Work experience (roles, companies, duration)
   - Education (degrees, institutions, years)
   - Projects
   - Certifications
5. Parsed data stored in `User.cv_metadata` (JSON field)

**Benefits:**

- Automatic skill extraction
- Searchable CV data
- Candidate-job matching via similarity scoring

### Similarity Scoring

- When candidate applies, their CV metadata is compared with job requirements
- Score (0-100) stored in `Application.similarity_score`
- Helps recruiters prioritize best-fit candidates

---

## 📂 File Storage

### Configuration

- **Local Storage:** Default for development (`MEDIA_ROOT`, `MEDIA_URL`)
- **AWS S3:** Production storage (configured via `.env`)

### S3 Setup

Environment variables:

```env
USE_S3=True
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_STORAGE_BUCKET_NAME=your_bucket
AWS_S3_REGION_NAME=us-east-1
```

### Stored Files

- **Profile Photos:** `photos/` directory
- **CVs/Resumes:** `resumes/` directory

---

## 🎥 Real-time Features

### WebRTC Video Interviews

**Implementation:**

- Interview room uses WebRTC for peer-to-peer video
- Signaling handled via REST API:
  - POST `/api/interviews/<id>/signal/` - Send offer/answer/ICE candidates
  - GET `/api/interviews/<id>/signals/` - Retrieve signals
- Both recruiter and candidate can initiate/join

**Flow:**

1. Recruiter schedules interview
2. Candidate accepts invitation
3. Both navigate to `/interview-room?id=<interview_id>`
4. WebRTC handshake via signaling API
5. Direct video/audio connection established

---

## 📊 Analytics Dashboard Features

### Metrics Tracked

1. **Total Candidates** - Unique applicants across all jobs
2. **Active Jobs** - Currently open job postings
3. **Total Applications** - All applications received
4. **Avg. Time to Hire** - Estimated hiring duration

### Pipeline Status

- **Applied** - Total applications received
- **Screening** - Candidates being reviewed
- **Interview** - Candidates with scheduled interviews
- **Offer** - Candidates receiving offers (placeholder)

### Top Jobs

- Lists top 4 jobs by application count
- Helps identify most popular positions

### Data Source

- Aggregated from Job, Application, and Interview models
- Uses Django ORM annotations and aggregations
- Recent changes calculated from last 30 days

---

## 🔄 User Workflows

### Candidate Workflow

```
1. Sign up as candidate
2. Upload CV (auto-parsed by AI)
3. Browse jobs in "Find Jobs"
4. Apply for jobs (similarity score calculated)
5. Receive interview invitation (email notification)
6. Accept/decline interview
7. Join video interview room
8. Track application status in dashboard
```

### Recruiter Workflow

```
1. Sign up as recruiter
2. Create job posting with requirements
3. Review applicants (sorted by similarity score)
4. View candidate CVs and profiles
5. Schedule interviews with candidates
6. Join video interview room
7. View analytics (pipeline, metrics, top jobs)
8. Track hiring progress in dashboard
```

---

## 🌐 CORS & Network Configuration

### Allowed Origins

- `http://localhost:5173` (Vite dev server)
- `http://localhost:5174` (alternative port)
- `http://192.168.100.12:5173` (network access)
- `http://192.168.100.12:5174`

### CORS Settings

```python
CORS_ALLOW_ALL_ORIGINS = True  # Development only
CORS_ALLOW_CREDENTIALS = True
```

---

## 📦 Project Structure

```
RemoteHire.io/
├── remotehire_backend/          # Django Backend
│   ├── backend/                 # Project settings
│   │   ├── settings.py         # Main configuration
│   │   ├── urls.py             # Root URL routing
│   │   └── storage_backends.py # S3 configuration
│   ├── loginapi/               # Main app
│   │   ├── models.py           # Database models
│   │   ├── views.py            # API endpoints
│   │   ├── urls.py             # API routes
│   │   ├── serializer.py       # DRF serializers
│   │   ├── middleware.py       # JWT middleware
│   │   ├── cv_parser.py        # AI CV parsing
│   │   └── migrations/         # Database migrations
│   ├── media/                  # Uploaded files (dev)
│   ├── manage.py               # Django CLI
│   ├── requirements.txt        # Python dependencies
│   └── .env                    # Environment variables
│
├── remotehire-frontend/        # React Frontend
│   ├── src/
│   │   ├── pages/              # Page components
│   │   │   ├── LandingPage.jsx
│   │   │   ├── SignInPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── RecruiterAnalyticsPage.jsx
│   │   │   ├── CandidateDashboardPage.jsx
│   │   │   └── ...
│   │   ├── components/         # Reusable components
│   │   │   ├── RecruiterNav.jsx
│   │   │   ├── CandidateNav.jsx
│   │   │   └── JobDetailsModal.jsx
│   │   ├── App.jsx             # Main router
│   │   ├── main.jsx            # Entry point
│   │   └── config.js           # API URL config
│   ├── public/
│   │   └── api-config.js       # Runtime config
│   ├── package.json            # NPM dependencies
│   └── vite.config.js          # Vite config
│
└── Documentation Files
    ├── README.md
    ├── PROJECT_SUMMARY.md
    ├── CANDIDATE_DASHBOARD_GUIDE.md
    ├── RECRUITER_DASHBOARD_IMPLEMENTATION.md
    └── AWS_S3_SETUP_GUIDE.md
```

---

## 🚀 Running the Project

### Backend Setup

```bash
cd remotehire_backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Configure environment
# Create .env file with required variables

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start server
python manage.py runserver
# Runs on http://127.0.0.1:8000
```

### Frontend Setup

```bash
cd remotehire-frontend

# Install dependencies
npm install

# Start dev server
npm run dev
# Runs on http://localhost:5173
```

---

## 🔑 Environment Variables (.env)

```env
# Database (PostgreSQL)
DB_ENGINE=django.db.backends.postgresql
DB_NAME=remotehire_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432

# OAuth
GOOGLE_OAUTH_CLIENT_ID=your_google_client_id
GOOGLE_OAUTH_CLIENT_SECRET=your_google_secret
GITHUB_OAUTH_CLIENT_ID=your_github_client_id
GITHUB_OAUTH_CLIENT_SECRET=your_github_secret
LINKEDIN_OAUTH_CLIENT_ID=your_linkedin_client_id
LINKEDIN_OAUTH_CLIENT_SECRET=your_linkedin_secret

# AI
GEMINI_API_KEY=your_gemini_api_key

# AWS S3 (Optional)
USE_S3=True
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_STORAGE_BUCKET_NAME=your_bucket
AWS_S3_REGION_NAME=us-east-1
```

---

## 🎯 Key Features Summary

### ✅ Implemented Features

1. **User Authentication** - JWT, OAuth (Google, GitHub, LinkedIn)
2. **Role-based Access** - Separate dashboards for candidates and recruiters
3. **Job Management** - CRUD operations for recruiters
4. **Application System** - Apply, withdraw, track applications
5. **AI CV Parsing** - Automatic skill extraction using Gemini AI
6. **Candidate Matching** - Similarity scoring based on CV vs. job requirements
7. **Interview Scheduling** - Recruiters schedule, candidates accept/decline
8. **Video Interviews** - WebRTC-based real-time video calls
9. **Analytics Dashboard** - Pipeline tracking, metrics, top jobs
10. **File Management** - S3 or local storage for CVs and photos
11. **Profile Management** - Update profile, upload/delete CV
12. **Responsive UI** - Dark mode, mobile-friendly design

### 🔮 Future Enhancements

- Real-time notifications (WebSocket)
- Collaborative code editor for technical interviews
- Deepfake detection for interview security
- Advanced AI candidate recommendations
- Email notifications for interview invites
- Chat system between recruiter and candidate
- Offer management module
- Advanced filtering and search

---

## 🧪 Testing

### Backend Testing

```bash
# Run Django tests
python manage.py test

# Test specific app
python manage.py test loginapi
```

### API Testing

- Use Postman or similar tool
- Import API collection (if available)
- Test all endpoints with proper authentication

---

## 🛠️ Development Notes

### Common Issues & Solutions

**1. CORS Errors**

- Ensure `CORS_ALLOW_ALL_ORIGINS = True` in settings.py
- Check frontend API URL matches backend

**2. JWT Authentication Fails**

- Verify token is stored in localStorage
- Check Authorization header format: `Bearer <token>`
- Ensure token hasn't expired

**3. File Upload Issues**

- Check `MEDIA_ROOT` and `MEDIA_URL` settings
- For S3: verify AWS credentials and bucket permissions
- Ensure file size within limits

**4. OAuth Not Working**

- Verify redirect URIs in OAuth provider settings
- Check client ID and secret in .env
- Ensure callback routes are registered

---

## 📞 Support & Contact

**Team Members:**

- Muhammad Bilal Khawar (bsef22m546@pucit.edu.pk)
- Hafiz Sheikh Abdullah Arshad (bsef22m505@pucit.edu.pk)

**Institution:** Punjab University College of Information Technology (PUCIT)

---

## 📄 License

This project is developed as part of academic coursework at PUCIT.

---

**Last Updated:** December 14, 2025
