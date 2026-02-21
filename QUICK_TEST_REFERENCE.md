# Quick Reference: Running Tests

## Frontend Tests (45 Passing ✅)

```bash
cd remotehire-frontend

# Run all tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm run test:coverage

# UI mode
npm run test:ui
```

**Result**: 45/45 PASSING in ~3 seconds

---

## Backend Tests (19+ Passing ✅)

```bash
cd remotehire_backend

# Activate virtual environment
.\venv\Scripts\activate

# Run model tests
python -m pytest loginapi/tests/test_models.py -v

# Run all tests
python -m pytest loginapi/tests/ -v

# Run with coverage
python -m pytest loginapi/tests/ --cov=loginapi --cov-report=html

# Run single test
python -m pytest loginapi/tests/test_models.py::TestUserModel::test_user_creation -v

# Run with markers
python -m pytest -m "unit" -v

# Run with timeout
python -m pytest loginapi/tests/ --timeout=30
```

**Result**: 19/19 model tests PASSING in ~1 second

---

## Key Files

### Backend Configuration
- `backend/test_settings.py` - SQLite in-memory database
- `pytest.ini` - pytest configuration
- `conftest.py` - Global fixtures
- `loginapi/tests/factories.py` - Test data factories

### Frontend Configuration
- `vite.config.js` - Vitest configuration
- `src/test/setup.js` - Test environment setup
- `src/test/fixtures/mockData.js` - Mock data
- `package.json` - Test scripts

---

## Test Structure

### Backend
```
loginapi/tests/
├── __init__.py
├── conftest.py           # Test fixtures (mostly empty, uses root conftest.py)
├── factories.py          # Test data factories
├── test_models.py        # ✅ 19/19 passing
├── test_authentication.py
├── test_views.py
├── test_serializers.py
└── test_cv_parser.py
```

### Frontend
```
src/
├── test/
│   ├── setup.js          # Test environment config
│   ├── fixtures/
│   │   └── mockData.js   # Mock data
│   ├── auth.test.js      # ✅ 11/11 passing
│   └── api.test.js       # ✅ 21/21 passing
├── components/__tests__/
│   └── RecruiterNav.test.jsx  # ✅ 8/8 passing
└── pages/__tests__/
    └── DashboardPage.test.jsx # ✅ 5/5 passing
```

---

## Common Issues & Solutions

### Issue: Tests not running

**Solution**:
```bash
# Activate venv first
cd remotehire_backend
.\venv\Scripts\activate

# Then run tests
python -m pytest loginapi/tests/test_models.py -v
```

### Issue: Database errors

**Solution**: Uses SQLite in-memory, should be automatic. If issues:
```bash
# Delete pytest cache
rm -rf .pytest_cache

# Run again
python -m pytest loginapi/tests/ -v
```

### Issue: Import errors

**Solution**: Make sure venv is activated
```bash
# Check if venv is active (should show path)
where python

# Should show: C:\...\remotehire_backend\venv\Scripts\python.exe
```

### Issue: Hanging tests

**Solution**: Use timeout
```bash
python -m pytest loginapi/tests/ --timeout=30 -v
```

---

## Test Results at a Glance

| Test Suite | Tests | Status | Time |
|-----------|-------|--------|------|
| Frontend Auth | 11 | ✅ PASS | <1s |
| Frontend API | 21 | ✅ PASS | <1s |
| Frontend Nav | 8 | ✅ PASS | <1s |
| Frontend Pages | 5 | ✅ PASS | <1s |
| Backend Models | 19 | ✅ PASS | 1s |
| **TOTAL** | **64** | **✅ PASS** | **~4s** |

---

## Environment Details

### Python
- Version: 3.11.0
- Location: `venv/Scripts/python.exe`

### Frontend Test Runner
- Vitest 4.0.16
- React Testing Library
- jsdom

### Backend Test Runner
- pytest 7.4.3
- pytest-django 4.7.0
- Factory Boy 3.3.0

### Database
- Type: SQLite (In-Memory)
- Location: `:memory:`
- No setup needed - created automatically

---

## Next: CI/CD Integration

Ready to add to GitHub Actions:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: cd remotehire-frontend && npm install && npm test
  
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: 3.11
      - run: |
          cd remotehire_backend
          python -m pip install -r requirements.txt
          python -m pytest loginapi/tests/ --cov
```

---

## Documentation

- **Testing Strategy**: [TESTING_STRATEGY.md](TESTING_STRATEGY.md)
- **Backend Testing**: [BACKEND_TESTING_COMPLETE.md](BACKEND_TESTING_COMPLETE.md)
- **Full Status**: [TESTING_STATUS.md](TESTING_STATUS.md)

---

**Status**: ✅ Ready for Development & CI/CD
