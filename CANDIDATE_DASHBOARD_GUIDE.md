# Candidate Dashboard - Quick Reference Guide

## What's New

### Backend (Django)

✅ **3 New API Endpoints** for candidate dashboard functionality:

- `GET /api/candidate/dashboard/stats/` - Dashboard statistics
- `GET /api/candidate/applications/` - List all candidate applications
- `DELETE /api/candidate/applications/<id>/withdraw/` - Withdraw application

### Frontend (React)

✅ **New Pages:**

- `CandidateDashboardPage.jsx` - Main candidate dashboard with statistics and applications list
- Enhanced `FindJobsPage.jsx` - Job browsing with application tracking
- Updated `DashboardPage.jsx` - Auto-redirect candidates to candidate dashboard

✅ **Route:** `/candidate-dashboard`

## How to Use

### For Candidates:

1. **Sign In** as a candidate account
2. **Auto-redirect** to `/candidate-dashboard`
3. **View Statistics**:
   - Applications sent count
   - Active job openings count
4. **Browse Jobs** - Click "Browse Jobs" button
5. **Apply to Jobs** - Click "Apply" on job listings
6. **Track Applications** - View all applications in dashboard
7. **Withdraw** - Remove applications anytime

### For Recruiters:

- Unchanged - still see recruiter dashboard with job management

## Files Modified/Created

### Backend Files:

- `remotehire_backend/loginapi/views.py` - Added 3 new endpoint functions
- `remotehire_backend/loginapi/urls.py` - Updated URL routing

### Frontend Files:

- **NEW:** `remotehire-frontend/src/pages/CandidateDashboardPage.jsx`
- Modified: `remotehire-frontend/src/pages/FindJobsPage.jsx`
- Modified: `remotehire-frontend/src/pages/DashboardPage.jsx`
- Modified: `remotehire-frontend/src/App.jsx`

## Features Implemented

✅ Candidate-specific dashboard  
✅ Application tracking  
✅ View all submitted applications  
✅ Withdraw applications  
✅ Job browsing interface  
✅ Application status tracking (Applied/Not Applied)  
✅ Dashboard statistics  
✅ Dark mode support  
✅ Responsive design  
✅ Error handling  
✅ Success messages  
✅ Loading states

## Testing the Features

### Test Scenario 1: Browse and Apply

1. Login as candidate
2. Go to `/find-jobs`
3. Click "Apply" on a job
4. Check dashboard - applications count should increase

### Test Scenario 2: View Applications

1. On candidate dashboard
2. See "My Applications" section
3. All applications listed with details

### Test Scenario 3: Withdraw Application

1. Click "Withdraw" on any application
2. Confirm withdrawal
3. Application removed from list

### Test Scenario 4: Dark Mode

1. Toggle dark mode on dashboard
2. Switch to find jobs page
3. Dark mode should persist

## API Examples

### Get Dashboard Stats

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://127.0.0.1:8000/api/candidate/dashboard/stats/
```

### Get All Applications

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://127.0.0.1:8000/api/candidate/applications/
```

### Apply to Job

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  http://127.0.0.1:8000/api/jobs/1/apply/
```

### Withdraw Application

```bash
curl -X DELETE \
  -H "Authorization: Bearer YOUR_TOKEN" \
  http://127.0.0.1:8000/api/candidate/applications/1/withdraw/
```

## Common URLs

| Page                  | URL                      | Who Can Access |
| --------------------- | ------------------------ | -------------- |
| Candidate Dashboard   | `/#/candidate-dashboard` | Candidates     |
| Find Jobs             | `/#/find-jobs`           | Candidates     |
| Job Posts (Recruiter) | `/#/job-posts`           | Recruiters     |
| Main Dashboard        | `/#/dashboard`           | Recruiters     |

## Troubleshooting

### Issue: "Only candidates can view this" error

**Solution:** You're logged in as recruiter. The system auto-redirects recruiters to their recruiter dashboard.

### Issue: Applications not loading

**Solution:** Check that:

1. You're logged in as candidate
2. JWT token is valid (not expired)
3. You have submitted at least one application

### Issue: Dark mode not persisting

**Solution:** Check browser localStorage - theme should be stored as `theme: "dark"` or `theme: "light"`

## Performance Notes

- Dashboard stats load with minimal API calls
- Applications list is fetched once and cached
- Applied jobs set is tracked in component state for instant UI feedback
- No unnecessary re-renders

## Security

✅ JWT authentication on all endpoints  
✅ Role-based access control  
✅ Candidates can only view/modify their own data  
✅ Server validates all requests

## Next Steps (Optional Enhancements)

- [ ] Add search/filter to job listings
- [ ] Add application status (pending, accepted, rejected)
- [ ] Add candidate profile page
- [ ] Add saved jobs functionality
- [ ] Add email notifications for applications
- [ ] Add application comments/messages
