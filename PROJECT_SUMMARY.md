# RemoteHire.io - Project Summary

## 📋 Project Overview

**RemoteHire.io** is a comprehensive full-stack recruitment platform that connects recruiters with candidates, featuring job postings, applications, interview scheduling, video interviews, and AI-powered candidate matching.

## 🛠️ Technology Stack

### Frontend

- **Framework**: React 18.x
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Routing**: Hash-based routing (window.location.hash)
- **State Management**: React Hooks (useState, useEffect, useRef)
- **Video Conferencing**: WebRTC (PeerJS)
- **Real-time Communication**: Socket.IO

### Backend

- **Framework**: Django 4.x + Django REST Framework
- **Database**: SQLite (db.sqlite3)
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: AWS S3 for resume/photo uploads
- **CORS**: django-cors-headers
- **Resume Parsing**: Custom CV parser
- **API**: RESTful API architecture

### Additional Services

- **Cloud Storage**: AWS S3 (for media files)
- **Authentication Providers**: LinkedIn OAuth, GitHub OAuth
- **Video**: WebRTC with STUN/TURN servers

## 🏗️ System Architecture

### Frontend Structure

```
remotehire-frontend/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── LandingNav.jsx  # Landing page navigation
│   │   ├── RecruiterNav.jsx # Recruiter dashboard navigation
│   │   └── CandidateNav.jsx # Candidate dashboard navigation
│   ├── pages/              # Application pages
│   │   ├── LandingPage.jsx
│   │   ├── SignInPage.jsx
│   │   ├── SignUpPage.jsx
│   │   ├── DashboardPage.jsx (Recruiter)
│   │   ├── CandidateDashboardPage.jsx
│   │   ├── JobPostsPage.jsx
│   │   ├── FindJobsPage.jsx
│   │   ├── RecruiterCandidatesPage.jsx
│   │   ├── RecruiterInterviewsPage.jsx
│   │   ├── CandidateInterviewsPage.jsx
│   │   ├── InterviewRoomPage.jsx
│   │   ├── RecruiterAnalyticsPage.jsx
│   │   ├── ProfilePage.jsx
│   │   └── CandidateDetailsPage.jsx
│   ├── config.js           # API configuration
│   └── App.jsx             # Main app component with routing
├── public/
│   └── api-config.js       # Runtime API configuration
└── index.html
```

### Backend Structure

```
remotehire_backend/
├── loginapi/
│   ├── models.py           # Database models
│   ├── views.py            # API endpoints
│   ├── serializer.py       # Data serialization
│   ├── urls.py             # URL routing
│   ├── cv_parser.py        # Resume parsing logic
│   ├── middleware.py       # Custom middleware
│   └── decorators.py       # Custom decorators
├── backend/
│   ├── settings.py         # Django settings
│   ├── urls.py             # Main URL configuration
│   ├── storage_backends.py # AWS S3 storage configuration
│   └── wsgi.py
├── media/                  # Local media storage (fallback)
│   ├── resumes/
│   └── photos/
└── manage.py
```

## 📊 Database Models

### 1. **User Model** (Extended Django User)

- username, email, password
- role: 'recruiter' or 'candidate'
- profile fields: phone, location, bio, linkedin_url, github_url
- photo (ImageField via S3)

### 2. **Job Model**

- title, description, company_name
- location, job_type (Full-time, Part-time, Contract, Remote)
- salary_range, status (active/closed)
- posted_by (ForeignKey to User - recruiter)
- requirements: required_skills, required_languages, required_certifications
- required_experience_years
- views_count, applicants_count
- created_at, updated_at

### 3. **Application Model**

- applicant (ForeignKey to User - candidate)
- job (ForeignKey to Job)
- resume (FileField via S3)
- cover_letter, status (pending/reviewed/accepted/rejected)
- match_score (AI-calculated 0-100)
- applied_at

### 4. **Interview Model**

- recruiter (ForeignKey to User)
- candidate (ForeignKey to User)
- job (ForeignKey to Job)
- scheduled_at (DateTime)
- status (Scheduled/Completed/Cancelled)
- meeting_link, notes
- created_at

## 🔐 Authentication System

### Implementation

1. **JWT Token-based Authentication**

   - Access tokens stored in localStorage
   - Bearer token in Authorization header
   - Token validation on protected routes

2. **Custom Middleware**

   - `loginapi/middleware.py` validates JWT tokens
   - Extracts user from token for all API requests

3. **OAuth Integration**
   - LinkedIn OAuth callback handler
   - GitHub OAuth callback handler
   - Automatic account creation/linking

### Protected Routes

- All `/api/` endpoints require authentication
- Role-based access control (recruiter vs candidate)
- Automatic redirects for unauthorized access

## 🎨 UI/UX Features

### Dark Mode Implementation

- **Toggle**: Sun/Moon icon in navigation
- **Storage**: Persisted in localStorage
- **Scope**: Global across all pages and components
- **Styling Pattern**:
  ```jsx
  className={`${
    darkMode
      ? "bg-slate-800 text-white"
      : "bg-white text-slate-900"
  }`}
  ```

### Design System

- **Colors**:
  - Light: Blue/Indigo gradients, white backgrounds
  - Dark: Slate gradients, semi-transparent overlays
- **Components**: Rounded corners (rounded-xl, rounded-3xl)
- **Animations**: Fade-in, scale on hover, smooth transitions
- **Backdrop Blur**: Glass-morphism effects
- **Responsive**: Mobile-first design with Tailwind breakpoints

### Navigation Components

1. **LandingNav**: Unauthenticated users
2. **RecruiterNav**: Recruiter dashboard navigation
3. **CandidateNav**: Candidate dashboard navigation

All navigation components feature:

- Dark mode toggle
- User profile display
- Logout functionality
- Active page highlighting
- Responsive mobile menu

## 🚀 Key Features

### For Recruiters

#### 1. **Dashboard**

- Overview statistics (Active Jobs, Candidates, Applications, Interviews, Offers)
- Quick action cards for posting jobs, viewing candidates, scheduling interviews
- Real-time data from API

#### 2. **Job Management**

- Create/Edit/Delete job postings
- Required skills, languages, certifications
- AI matching requirements
- Track views and applications
- Search and filter jobs
- Sort by latest, oldest, title, applications

#### 3. **Candidate Management**

- View all applicants
- Filter by job position
- Search candidates
- View detailed profiles with resumes
- AI match scores (0-100)
- Application status management
- Schedule interviews directly

#### 4. **Interview Scheduling**

- Schedule interviews with candidates
- Real-time countdown to interviews
- Notification system (5 min and start time alerts)
- Filter by status (All, Scheduled, Completed)
- Join video interviews via WebRTC

#### 5. **Analytics Dashboard**

- Comprehensive recruitment metrics
- Job posting performance
- Application trends
- Interview statistics
- Visual charts and graphs

### For Candidates

#### 1. **Dashboard**

- Personal statistics (Applied Jobs, Pending, Accepted, Rejected)
- Recent applications overview
- Quick navigation to job search and interviews

#### 2. **Job Search**

- Browse all active jobs
- Search by title/company
- Filter by job type
- Detailed job descriptions
- One-click apply with resume upload
- AI match score display

#### 3. **Application Tracking**

- View all applications
- Filter by status
- Application status updates
- Match scores
- Application history

#### 4. **Interview Management**

- View scheduled interviews
- Accept/Decline interview requests
- Real-time countdown
- Notification alerts
- Join video interviews
- Filter by status

#### 5. **Profile Management**

- Update personal information
- Upload/update resume
- Upload profile photo
- Add skills, languages, certifications
- LinkedIn/GitHub integration

### Universal Features

#### 1. **Video Interview Room**

- WebRTC peer-to-peer connection
- Camera and microphone controls
- Screen sharing capability
- Chat messaging
- Leave interview functionality
- Automatic cleanup on exit

#### 2. **File Upload System**

- AWS S3 integration for resumes and photos
- Automatic file type validation
- Secure signed URLs for file access
- Fallback to local storage

#### 3. **Real-time Notifications**

- Browser notifications for upcoming interviews
- In-app notification alerts
- 5-minute and start-time reminders

## 🔌 API Endpoints

### Authentication

- `POST /api/signup/` - User registration
- `POST /api/login/` - User login
- `POST /api/linkedin/callback/` - LinkedIn OAuth
- `POST /api/github/callback/` - GitHub OAuth

### Jobs

- `GET /api/jobs/` - List all active jobs
- `POST /api/jobs/` - Create job (recruiter)
- `PUT /api/jobs/{id}/` - Update job (recruiter)
- `DELETE /api/jobs/{id}/` - Delete job (recruiter)
- `GET /api/jobs/recruiter/` - Recruiter's jobs

### Applications

- `POST /api/jobs/{id}/apply/` - Apply to job
- `GET /api/applications/` - User's applications
- `GET /api/applications/recruiter/` - Recruiter's received applications
- `POST /api/applications/{id}/update-status/` - Update application status

### Interviews

- `GET /api/interviews/recruiter/` - Recruiter's interviews
- `GET /api/interviews/candidate/` - Candidate's interviews
- `POST /api/interviews/schedule/` - Schedule interview
- `POST /api/interviews/{id}/response/` - Accept/Decline interview

### Dashboard

- `GET /api/recruiter/dashboard/stats/` - Recruiter statistics
- `GET /api/candidate/dashboard/stats/` - Candidate statistics

### Profile

- `GET /api/profile/` - Get user profile
- `PUT /api/profile/` - Update user profile
- `POST /api/profile/upload-photo/` - Upload profile photo
- `POST /api/profile/upload-resume/` - Upload resume

### Candidates

- `GET /api/candidates/` - List all candidates (recruiter)
- `GET /api/candidates/{id}/` - Get candidate details

## 🤖 AI/ML Features

### Resume Parsing (`cv_parser.py`)

- Automatic skill extraction from resumes
- Language detection
- Experience calculation
- Contact information extraction
- Education parsing

### Candidate Matching

- AI-powered match score (0-100)
- Based on:
  - Required skills overlap
  - Language requirements
  - Experience level
  - Certifications
- Helps recruiters identify best candidates

## 🎯 How Key Features Are Implemented

### 1. Dark Mode

**Storage**: localStorage with key "darkMode"
**State**: React useState hook in each page
**Persistence**: useEffect syncs with localStorage
**Application**: Conditional className based on darkMode boolean

### 2. Authentication Flow

1. User submits credentials → `/api/login/`
2. Backend validates and returns JWT token
3. Frontend stores token in localStorage
4. All subsequent API calls include `Authorization: Bearer {token}`
5. Middleware validates token and attaches user to request

### 3. File Uploads (AWS S3)

1. Frontend sends file in multipart/form-data
2. Backend receives file via Django FileField
3. `storage_backends.py` handles S3 upload with boto3
4. S3 returns secure URL
5. URL stored in database
6. Frontend accesses via presigned URLs

### 4. Video Interviews (WebRTC)

1. Both users navigate to `/interview-room?id={interview_id}`
2. PeerJS establishes peer-to-peer connection
3. getUserMedia() captures video/audio
4. Peers exchange media streams
5. Display in video elements
6. Socket.IO for signaling (optional)

### 5. Real-time Notifications

1. useEffect polling every second (currentTime state)
2. Calculate time until interview
3. Check if 5 min or 0 min remaining
4. Browser Notification API with permission request
5. Prevent duplicates with notifiedRef

### 6. Search & Filter

1. User input updates state (searchTerm, filterStatus, sortBy)
2. Derived state filters data array
3. Array.filter() for search/status
4. Array.sort() for sorting
5. Render filtered results

### 7. Resume Parsing

1. Candidate uploads resume via file input
2. Backend saves to S3
3. cv_parser.py reads file content
4. Regex patterns extract:
   - Skills (keyword matching)
   - Languages (pattern detection)
   - Experience (years calculation)
   - Education (degree parsing)
5. Extracted data populates profile

## 📦 Environment Setup

### Frontend Environment

- Node.js and npm
- Vite dev server on port 5173 (default)
- Environment variables in `api-config.js`

### Backend Environment

- Python 3.x
- Django virtual environment
- Required packages in `requirements.txt`
- Environment variables for:
  - AWS_ACCESS_KEY_ID
  - AWS_SECRET_ACCESS_KEY
  - AWS_STORAGE_BUCKET_NAME
  - AWS_S3_REGION_NAME
  - SECRET_KEY
  - DEBUG

### Database

- SQLite for development
- Migrations managed via Django ORM
- Data backup in `data_backup.json`

## 🔄 Development Workflow

### Running the Application

**Backend**:

```bash
cd remotehire_backend
python manage.py runserver
# or
python run_network.py  # For network access
```

**Frontend**:

```bash
cd remotehire-frontend
npm install
npm run dev
```

### Database Management

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

## 🌐 Deployment Considerations

### Frontend

- Build: `npm run build`
- Serves static files from `dist/`
- Configure API_BASE_URL for production

### Backend

- Set DEBUG=False
- Configure allowed hosts
- Use production database (PostgreSQL recommended)
- Set up proper CORS origins
- Configure S3 with production credentials
- Use environment variables for secrets

## 📝 Code Quality Features

### Frontend

- Component-based architecture
- Reusable navigation components
- Consistent dark mode implementation
- Error handling with try-catch
- Loading states for API calls
- Responsive design patterns

### Backend

- RESTful API design
- JWT authentication
- CORS configured
- File upload validation
- Error responses with proper status codes
- Serializers for data validation

## 🔒 Security Features

1. **JWT Authentication**: Secure token-based auth
2. **Password Hashing**: Django's built-in password hashing
3. **CORS Protection**: Configured allowed origins
4. **File Upload Validation**: File type and size checks
5. **SQL Injection Protection**: Django ORM prevents SQL injection
6. **XSS Protection**: React's automatic escaping
7. **HTTPS**: Recommended for production
8. **Environment Variables**: Secrets not in code

## 📈 Performance Optimizations

1. **Lazy Loading**: Components load on demand
2. **Memoization**: Derived state calculations
3. **Debouncing**: Search input delays
4. **Pagination**: Could be added for large datasets
5. **S3 CDN**: Fast file delivery
6. **Database Indexing**: Foreign keys indexed
7. **Caching**: Browser caching for static assets

## 🚧 Known Limitations & Future Enhancements

### Current Limitations

- SQLite for production (should use PostgreSQL)
- No email verification system
- Basic analytics (could expand)
- No chat system between users
- No resume template builder

### Potential Enhancements

- Real-time chat between recruiters and candidates
- Email notifications
- Calendar integration
- Advanced analytics with charts
- Multi-language support
- Mobile app (React Native)
- AI-powered job recommendations
- Automated interview scheduling
- Video interview recording
- Skill assessment tests
- Salary negotiation tools

## 📚 Documentation Files

- `README.md` - General project overview
- `CANDIDATE_DASHBOARD_GUIDE.md` - Candidate features guide
- `CANDIDATE_DASHBOARD_IMPLEMENTATION.md` - Implementation details
- `RECRUITER_DASHBOARD_COMPLETE.md` - Recruiter features
- `RECRUITER_DASHBOARD_IMPLEMENTATION.md` - Implementation guide
- `AWS_S3_SETUP_GUIDE.md` - S3 configuration
- `NETWORK_TESTING_GUIDE.md` - Network testing
- `TESTING_TWO_LAPTOPS.md` - Multi-device testing
- `QUICK_REFERENCE.md` - Quick commands
- `CHANGES_SUMMARY.md` - Recent changes

## 🎓 Learning Outcomes

This project demonstrates proficiency in:

- Full-stack web development
- React component architecture
- Django REST Framework
- JWT authentication
- AWS S3 integration
- WebRTC video communication
- Real-time features
- Responsive UI design
- Dark mode implementation
- File upload handling
- Database design
- API development
- State management
- OAuth integration

---

**Project Status**: ✅ Fully Functional
**Last Updated**: December 14, 2025
**Version**: 1.0
