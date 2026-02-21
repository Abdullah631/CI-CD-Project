# Testing Strategy Guide - Remote Hire CI-CD Project

## Overview
This document outlines the complete testing strategy for the Remote Hire project, including:
- **Backend Testing**: pytest + Django TestCase
- **Frontend Testing**: Vitest + React Testing Library
- **Local Testing Setup**
- **GitHub Actions CI/CD Pipeline**

---

## Part 1: Backend Testing (Django + pytest)

### Why pytest over Django's built-in TestCase?

| Feature | Django TestCase | pytest |
|---------|-----------------|--------|
| Simplicity | Good | Excellent |
| Fixtures | Limited | Powerful & Reusable |
| Performance | Slower | Faster |
| Plugins | Limited | Extensive ecosystem |
| Parallel Testing | Manual | Built-in (`pytest-xdist`) |
| Mocking | Available | Better with `pytest-mock` |
| Database Rollback | Each test | Efficient transactions |

**Recommendation**: Use **pytest** with Django integration for better testing experience.

---

### 1.1 Setup Backend Testing Locally

#### Step 1: Install Testing Dependencies

```bash
cd remotehire_backend

# Install pytest and related packages
pip install pytest==7.4.3
pip install pytest-django==4.7.0
pip install pytest-cov==4.1.0
pip install pytest-xdist==3.5.0
pip install pytest-mock==3.12.0
pip install factory-boy==3.3.0
pip install faker==20.1.0
```

Update `requirements.txt`:

```
# Existing packages...

# Testing (development only)
pytest==7.4.3
pytest-django==4.7.0
pytest-cov==4.1.0
pytest-xdist==3.5.0
pytest-mock==3.12.0
factory-boy==3.3.0
faker==20.1.0
```

#### Step 2: Create pytest Configuration File

Create `remotehire_backend/pytest.ini`:

```ini
[pytest]
DJANGO_SETTINGS_MODULE = backend.settings
python_files = tests.py test_*.py *_tests.py
python_classes = Test*
python_functions = test_*
addopts = 
    --cov=loginapi
    --cov-report=html
    --cov-report=term-missing
    --strict-markers
    -v

markers =
    slow: marks tests as slow (deselect with '-m "not slow"')
    integration: marks tests as integration tests
    unit: marks tests as unit tests
```

#### Step 3: Create Test Directory Structure

```
remotehire_backend/
├── loginapi/
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── conftest.py              # Shared fixtures
│   │   ├── test_models.py           # Model tests
│   │   ├── test_views.py            # View/API tests
│   │   ├── test_serializers.py      # Serializer tests
│   │   ├── test_cv_parser.py        # CV parsing tests
│   │   ├── test_authentication.py   # Auth tests
│   │   ├── test_interview.py        # Interview tests
│   │   └── factories.py             # Test data factories
```

#### Step 4: Create Shared Fixtures (`conftest.py`)

Create `remotehire_backend/loginapi/tests/conftest.py`:

```python
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from loginapi.models import Job, Application, Interview
from .factories import UserFactory, JobFactory, ApplicationFactory

User = get_user_model()

@pytest.fixture
def api_client():
    """Fixture for API client"""
    return APIClient()

@pytest.fixture
def authenticated_user(db):
    """Create and return an authenticated user"""
    user = UserFactory(role='candidate')
    return user

@pytest.fixture
def authenticated_recruiter(db):
    """Create and return an authenticated recruiter"""
    recruiter = UserFactory(role='recruiter')
    return recruiter

@pytest.fixture
def authenticated_client(api_client, authenticated_user):
    """API client with authenticated user"""
    from rest_framework_simplejwt.tokens import RefreshToken
    refresh = RefreshToken.for_user(authenticated_user)
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return api_client

@pytest.fixture
def recruiter_client(api_client, authenticated_recruiter):
    """API client with authenticated recruiter"""
    from rest_framework_simplejwt.tokens import RefreshToken
    refresh = RefreshToken.for_user(authenticated_recruiter)
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return api_client

@pytest.fixture
def sample_job(db, authenticated_recruiter):
    """Create a sample job posting"""
    return JobFactory(posted_by=authenticated_recruiter)

@pytest.fixture
def sample_application(db, authenticated_user, sample_job):
    """Create a sample application"""
    return ApplicationFactory(
        applicant=authenticated_user,
        job=sample_job
    )

@pytest.fixture
def sample_interview(db, authenticated_user, sample_job):
    """Create a sample interview"""
    from datetime import datetime, timedelta
    from django.utils import timezone
    return Interview.objects.create(
        candidate=authenticated_user,
        job=sample_job,
        scheduled_at=timezone.now() + timedelta(days=1),
        room_id='test-room-123'
    )
```

#### Step 5: Create Factory Classes

Create `remotehire_backend/loginapi/tests/factories.py`:

```python
import factory
from faker import Faker
from django.contrib.auth import get_user_model
from loginapi.models import Job, Application

User = get_user_model()
fake = Faker()

class UserFactory(factory.django.DjangoModelFactory):
    """Factory for creating test users"""
    class Meta:
        model = User
    
    username = factory.Sequence(lambda n: f'testuser{n}')
    email = factory.LazyAttribute(lambda obj: fake.email())
    password = 'testpass123'
    role = 'candidate'
    full_name = factory.LazyAttribute(lambda obj: fake.name())
    phone_number = factory.LazyAttribute(lambda obj: fake.phone_number())

    @classmethod
    def create(cls, **kwargs):
        obj = super().create(**kwargs)
        obj.set_password(obj.password)
        obj.save()
        return obj

class JobFactory(factory.django.DjangoModelFactory):
    """Factory for creating test jobs"""
    class Meta:
        model = Job
    
    title = factory.LazyAttribute(lambda obj: fake.job())
    description = factory.LazyAttribute(lambda obj: fake.text(max_nb_chars=200))
    status = 'active'
    posted_by = factory.SubFactory(UserFactory, role='recruiter')
    requirements = {
        'skills': ['Python', 'Django', 'REST API'],
        'experience': '3+ years',
        'education': 'Bachelor\'s Degree'
    }

class ApplicationFactory(factory.django.DjangoModelFactory):
    """Factory for creating test applications"""
    class Meta:
        model = Application
    
    job = factory.SubFactory(JobFactory)
    applicant = factory.SubFactory(UserFactory)
    similarity_score = 75.5
```

#### Step 6: Write Sample Tests

Create `remotehire_backend/loginapi/tests/test_authentication.py`:

```python
import pytest
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient

User = get_user_model()

@pytest.mark.unit
class TestUserSignUp:
    """Test user registration"""
    
    def test_candidate_signup_success(self, api_client):
        """Test successful candidate signup"""
        payload = {
            'username': 'candidate1',
            'email': 'candidate@example.com',
            'password': 'testpass123',
            'role': 'candidate',
            'full_name': 'John Doe'
        }
        response = api_client.post('/api/auth/register/', payload)
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['username'] == 'candidate1'
    
    def test_duplicate_email_signup_fails(self, api_client, authenticated_user):
        """Test that signup fails with duplicate email"""
        payload = {
            'username': 'newuser',
            'email': authenticated_user.email,  # Duplicate
            'password': 'testpass123',
            'role': 'candidate'
        }
        response = api_client.post('/api/auth/register/', payload)
        assert response.status_code == status.HTTP_400_BAD_REQUEST

@pytest.mark.unit
class TestLogin:
    """Test user login"""
    
    def test_login_success(self, api_client, authenticated_user):
        """Test successful login"""
        payload = {
            'username': authenticated_user.username,
            'password': 'testpass123'  # Default password from factory
        }
        response = api_client.post('/api/auth/login/', payload)
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data
        assert 'refresh' in response.data
    
    def test_login_invalid_credentials(self, api_client):
        """Test login with invalid credentials"""
        payload = {
            'username': 'nonexistent',
            'password': 'wrongpassword'
        }
        response = api_client.post('/api/auth/login/', payload)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

@pytest.mark.unit
class TestJWTAuthentication:
    """Test JWT token functionality"""
    
    def test_authenticated_request_success(self, authenticated_client, authenticated_user):
        """Test request with valid JWT token"""
        response = authenticated_client.get('/api/user/profile/')
        assert response.status_code == status.HTTP_200_OK
    
    def test_invalid_token_fails(self, api_client):
        """Test request with invalid token"""
        api_client.credentials(HTTP_AUTHORIZATION='Bearer invalid_token')
        response = api_client.get('/api/user/profile/')

- Components: 5/5 tested (100%)
- Pages: 18/18 tested (100%)
- Features: 10 scenarios covered and passing
- Latest run: 26 passed suites, 1 skipped; 78 passed tests, 1 skipped; Duration 20.12s
- Coverage (v8): Statements 38.09%, Branches 25.86%, Functions 31.31%, Lines 38.37%

Notes:
- Coverage reflects high-level smoke and behavior tests; API calls are stubbed or allowed to 401 in jsdom where tokens are absent, which does not affect pass/fail.
- Consider adding MSW to mock network requests for quieter logs and improved branch coverage in data-fetching paths.

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
```

Create `remotehire_backend/loginapi/tests/test_models.py`:

```python
import pytest
from django.contrib.auth import get_user_model
from loginapi.models import Job, Application
from .factories import UserFactory, JobFactory, ApplicationFactory

User = get_user_model()

@pytest.mark.unit
class TestUserModel:
    """Test User model"""
    
    def test_user_creation(self, db):
        """Test creating a user"""
        user = UserFactory(username='testuser')
        assert user.username == 'testuser'
        assert user.role == 'candidate'
    
    def test_user_str_representation(self, db):
        """Test user string representation"""
        user = UserFactory(username='john')
        assert str(user) == 'john'

@pytest.mark.unit
class TestJobModel:
    """Test Job model"""
    
    def test_job_creation(self, db):
        """Test creating a job"""
        recruiter = UserFactory(role='recruiter')
        job = JobFactory(posted_by=recruiter, title='Python Developer')
        assert job.title == 'Python Developer'
        assert job.status == 'active'
        assert job.posted_by == recruiter

@pytest.mark.unit
class TestApplicationModel:
    """Test Application model"""
    
    def test_application_creation(self, db):
        """Test creating an application"""
        app = ApplicationFactory(similarity_score=80.5)
        assert app.similarity_score == 80.5
        assert app.applicant is not None
        assert app.job is not None
```

Create `remotehire_backend/loginapi/tests/test_views.py`:

```python
import pytest
from rest_framework import status
from .factories import UserFactory, JobFactory

@pytest.mark.integration
class TestJobListingAPI:
    """Test job listing endpoints"""
    
    def test_list_jobs_success(self, authenticated_client, sample_job):
        """Test listing all jobs"""
        response = authenticated_client.get('/api/jobs/')
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 1
    
    def test_create_job_as_recruiter(self, recruiter_client):
        """Test job creation by recruiter"""
        payload = {
            'title': 'Senior Python Developer',
            'description': 'Looking for experienced Python developer',
            'status': 'active',
            'requirements': {'skills': ['Python', 'Django']}
        }
        response = recruiter_client.post('/api/jobs/', payload)
        assert response.status_code == status.HTTP_201_CREATED
    
    def test_create_job_as_candidate_fails(self, authenticated_client):
        """Test that candidate cannot create jobs"""
        payload = {
            'title': 'Test Job',
            'description': 'Test',
        }
        response = authenticated_client.post('/api/jobs/', payload)
        assert response.status_code in [status.HTTP_403_FORBIDDEN, status.HTTP_401_UNAUTHORIZED]
```

---

### 1.2 Running Backend Tests Locally

```bash
# Run all tests
pytest

# Run with verbose output
pytest -v

# Run specific test file
pytest loginapi/tests/test_authentication.py

# Run specific test class
pytest loginapi/tests/test_authentication.py::TestUserSignUp

# Run specific test
pytest loginapi/tests/test_authentication.py::TestUserSignUp::test_candidate_signup_success

# Run tests with coverage
pytest --cov=loginapi --cov-report=html

# Run tests in parallel (faster)
pytest -n auto

# Run only unit tests
pytest -m unit

# Run only integration tests
pytest -m integration

# Run tests excluding slow tests
pytest -m "not slow"
```

---

## Part 2: Frontend Testing (React + Vitest)

### Why Vitest over Jest?

| Feature | Jest | Vitest |
|---------|------|--------|
| Speed | Slower | 10-100x faster |
| Vite Integration | Manual config | Native support |
| ESM Support | Limited | Full support |
| Setup Time | Longer | Minimal |
| Configuration | Complex | Simple |

**Recommendation**: Use **Vitest** for React component testing.

---

### 2.1 Setup Frontend Testing Locally

#### Step 1: Install Testing Dependencies

```bash
cd remotehire-frontend

npm install --save-dev vitest @vitest/ui
npm install --save-dev @testing-library/react @testing-library/jest-dom
npm install --save-dev jsdom
npm install --save-dev @vitest/coverage-v8
npm install --save-dev happy-dom
```

Or with yarn:
```bash
yarn add --dev vitest @vitest/ui @testing-library/react @testing-library/jest-dom jsdom @vitest/coverage-v8
```

#### Step 2: Configure Vitest

Update `remotehire-frontend/vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

#### Step 3: Create Test Setup File

Create `remotehire-frontend/src/test/setup.js`:

```javascript
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock window.API_BASE_URL
global.window.API_BASE_URL = 'http://localhost:8000'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.localStorage = localStorageMock
```

#### Step 4: Update package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

#### Step 5: Create Test Directory Structure

```
remotehire-frontend/src/
├── test/
│   ├── setup.js
│   ├── fixtures/
│   │   └── mockData.js
│   └── mocks/
│       ├── axios.js
│       └── handlers.js
├── components/
│   └── __tests__/
│       ├── Header.test.jsx
│       ├── Login.test.jsx
│       └── JobCard.test.jsx
└── pages/
    └── __tests__/
        ├── DashboardPage.test.jsx
        └── RecruiterCandidatesPage.test.jsx
```

#### Step 6: Create Mock Utilities

Create `remotehire-frontend/src/test/mocks/axios.js`:

```javascript
import { vi } from 'vitest'

const mockAxios = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  patch: vi.fn(),
}

export default mockAxios
```

Create `remotehire-frontend/src/test/fixtures/mockData.js`:

```javascript
export const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  role: 'candidate',
  full_name: 'Test User',
}

export const mockRecruiter = {
  id: 2,
  username: 'recruiter1',
  email: 'recruiter@example.com',
  role: 'recruiter',
  full_name: 'Recruiter User',
}

export const mockJob = {
  id: 1,
  title: 'Python Developer',
  description: 'Senior Python Developer needed',
  status: 'active',
  posted_by: mockRecruiter.id,
}

export const mockApplication = {
  id: 1,
  job: mockJob.id,
  applicant: mockUser.id,
  similarity_score: 75.5,
}

export const mockInterview = {
  id: 1,
  candidate: mockUser.id,
  job: mockJob.id,
  scheduled_at: '2025-12-25T10:00:00Z',
  room_id: 'test-room-123',
}
```

#### Step 7: Write Component Tests

Create `remotehire-frontend/src/components/__tests__/Header.test.jsx`:

```javascript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Header from '../Header'

describe('Header Component', () => {
  beforeEach(() => {
    localStorage.getItem.mockReturnValue('test-token')
  })

  it('renders header with title', () => {
    render(<Header title="Remote Hire" />)
    expect(screen.getByText('Remote Hire')).toBeInTheDocument()
  })

  it('displays user name when provided', () => {
    render(<Header userName="John Doe" />)
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('calls logout function when logout button is clicked', async () => {
    const mockLogout = vi.fn()
    render(<Header onLogout={mockLogout} />)
    
    const logoutBtn = screen.getByRole('button', { name: /logout/i })
    await userEvent.click(logoutBtn)
    
    expect(mockLogout).toHaveBeenCalled()
  })
})
```

Create `remotehire-frontend/src/pages/__tests__/DashboardPage.test.jsx`:

```javascript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import axios from 'axios'
import DashboardPage from '../DashboardPage'
import { mockUser } from '../../test/fixtures/mockData'

vi.mock('axios')

describe('Dashboard Page', () => {
  beforeEach(() => {
    localStorage.getItem.mockReturnValue(JSON.stringify(mockUser))
    vi.clearAllMocks()
  })

  it('renders dashboard title', () => {
    render(<DashboardPage />)
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
  })

  it('fetches and displays user statistics', async () => {
    const mockStats = {
      total_applications: 5,
      interviews_scheduled: 2,
    }
    
    axios.get.mockResolvedValueOnce({ data: mockStats })
    
    render(<DashboardPage />)
    
    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument()
    })
  })

  it('displays error message when API fails', async () => {
    axios.get.mockRejectedValueOnce(new Error('API Error'))
    
    render(<DashboardPage />)
    
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument()
    })
  })
})
```

---

### 2.2 Running Frontend Tests Locally

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage

# Run specific test file
npm test -- Header.test.jsx

# Run tests matching pattern
npm test -- --grep "Header"
```

---

## Part 3: GitHub Actions CI/CD Pipeline

### 3.1 Create Backend CI Workflow

Create `.github/workflows/backend-tests.yml`:

```yaml
name: Backend Tests (Django + pytest)

on:
  push:
    branches: [ main, develop ]
    paths:
      - 'remotehire_backend/**'
      - '.github/workflows/backend-tests.yml'
  pull_request:
    branches: [ main, develop ]
    paths:
      - 'remotehire_backend/**'

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: test_db
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_password
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'
    
    - name: Cache pip packages
      uses: actions/cache@v3
      with:
        path: ~/.cache/pip
        key: ${{ runner.os }}-pip-${{ hashFiles('**/requirements.txt') }}
        restore-keys: |
          ${{ runner.os }}-pip-
    
    - name: Install dependencies
      run: |
        cd remotehire_backend
        python -m pip install --upgrade pip
        pip install -r requirements.txt
        pip install pytest pytest-django pytest-cov pytest-xdist factory-boy faker
    
    - name: Create .env file
      run: |
        cd remotehire_backend
        cat > .env << EOF
        DJANGO_SETTINGS_MODULE=backend.settings
        SECRET_KEY=test-secret-key-ci
        DEBUG=False
        DB_ENGINE=django.db.backends.postgresql
        DB_NAME=test_db
        DB_USER=test_user
        DB_PASSWORD=test_password
        DB_HOST=localhost
        DB_PORT=5432
        USE_S3=False
        EOF
    
    - name: Run migrations
      run: |
        cd remotehire_backend
        python manage.py migrate
    
    - name: Run pytest
      run: |
        cd remotehire_backend
        pytest --cov=loginapi --cov-report=xml --cov-report=term-missing
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./remotehire_backend/coverage.xml
        flags: backend
        name: backend-coverage
```

### 3.2 Create Frontend CI Workflow

Create `.github/workflows/frontend-tests.yml`:

```yaml
name: Frontend Tests (React + Vitest)

on:
  push:
    branches: [ main, develop ]
    paths:
      - 'remotehire-frontend/**'
      - '.github/workflows/frontend-tests.yml'
  pull_request:
    branches: [ main, develop ]
    paths:
      - 'remotehire-frontend/**'

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
        cache-dependency-path: remotehire-frontend/package-lock.json
    
    - name: Install dependencies
      run: |
        cd remotehire-frontend
        npm ci
    
    - name: Lint code
      run: |
        cd remotehire-frontend
        npm run lint
    
    - name: Run tests
      run: |
        cd remotehire-frontend
        npm test -- --run --coverage
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./remotehire-frontend/coverage/coverage-final.json
        flags: frontend
        name: frontend-coverage
```

### 3.3 Create Combined CI Workflow

Create `.github/workflows/ci.yml`:

```yaml
name: Full CI Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  backend-test:
    uses: ./.github/workflows/backend-tests.yml
  
  frontend-test:
    uses: ./.github/workflows/frontend-tests.yml

  status:
    runs-on: ubuntu-latest
    needs: [backend-test, frontend-test]
    if: always()
    steps:
      - name: Check status
        run: |
          if [ "${{ needs.backend-test.result }}" != "success" ] || [ "${{ needs.frontend-test.result }}" != "success" ]; then
            echo "CI Pipeline Failed"
            exit 1
          fi
          echo "CI Pipeline Passed ✓"
```

---

## Part 4: Test Writing Best Practices

### For Backend (pytest):

```python
# ✓ Good: Clear, focused tests
@pytest.mark.unit
def test_user_email_uniqueness(self, db):
    """Test that user emails must be unique"""
    user1 = UserFactory(email='test@example.com')
    with pytest.raises(IntegrityError):
        UserFactory(email='test@example.com')

# ✗ Bad: Testing multiple things
def test_user_everything(self, db):
    """Don't do this"""
    user = UserFactory()
    assert user.username
    assert user.email
    assert user.role
```

### For Frontend (Vitest):

```javascript
// ✓ Good: Test behavior, not implementation
it('allows user to submit the form', async () => {
  render(<LoginForm />)
  await userEvent.type(screen.getByLabelText(/username/i), 'testuser')
  await userEvent.click(screen.getByRole('button', { name: /submit/i }))
  expect(mockSubmit).toHaveBeenCalled()
})

// ✗ Bad: Testing implementation details
it('sets state correctly', () => {
  const { getByDisplayValue } = render(<LoginForm />)
  const state = component.instance().state
  expect(state.username).toBe('testuser')
})
```

---

## Part 5: Running Tests Summary

### Local Backend Testing
```bash
cd remotehire_backend
pip install -r requirements.txt pytest pytest-django pytest-cov
pytest -v --cov=loginapi
```

### Local Frontend Testing
```bash
cd remotehire-frontend
npm install
npm test
```

### GitHub CI/CD
- Tests run automatically on push/PR
- Coverage reports uploaded to Codecov
- Required status checks can prevent merging failing code

---

## Part 6: Coverage Targets

| Component | Target | Current |
|-----------|--------|---------|
| Backend Models | 90%+ | Setup needed |
| Backend Views/APIs | 85%+ | Setup needed |
| Frontend Components | 80%+ | Setup needed |
| Critical Features | 100%* | Setup needed |

*Critical features: Authentication, Interviews, CV uploads

---

## Next Steps

1. **Install testing dependencies** (see Part 1 & 2)
2. **Configure pytest and Vitest** (pytest.ini, vite.config.js)
3. **Create test fixtures and factories** (conftest.py, factories.py)
4. **Write tests for Sprint 1 features**
5. **Set up GitHub Actions workflows**
6. **Configure branch protection rules** to require passing tests

