export const mockUser = {
  id: 1,
  username: "candidate_user",
  email: "candidate@example.com",
  role: "candidate",
  full_name: "John Doe",
  phone_number: "+1234567890",
  date: "2025-01-10T10:00:00Z",
};

export const mockRecruiter = {
  id: 2,
  username: "recruiter_user",
  email: "recruiter@example.com",
  role: "recruiter",
  full_name: "Jane Smith",
  phone_number: "+0987654321",
  date: "2025-01-05T10:00:00Z",
};

export const mockJob = {
  id: 1,
  title: "Senior Python Developer",
  description: "Looking for an experienced Python developer with Django expertise",
  status: "active",
  posted_by: mockRecruiter.id,
  created_at: "2025-01-01T10:00:00Z",
  requirements: {
    skills: ["Python", "Django", "PostgreSQL", "REST API"],
    experience: "5+ years",
    education: "Bachelor's Degree in Computer Science",
  },
};

export const mockJobInactive = {
  id: 2,
  title: "Junior Frontend Developer",
  description: "React and Vue.js specialist needed",
  status: "closed",
  posted_by: mockRecruiter.id,
  created_at: "2024-12-01T10:00:00Z",
  requirements: {
    skills: ["React", "JavaScript", "CSS"],
    experience: "2+ years",
    education: "Bachelor's or Bootcamp",
  },
};

export const mockApplication = {
  id: 1,
  job: mockJob.id,
  applicant: mockUser.id,
  created_at: "2025-01-08T10:00:00Z",
  similarity_score: 82.5,
  status: "pending",
};

export const mockApplicationWithCV = {
  ...mockApplication,
  id: 2,
  has_cv: true,
  similarity_score: 90.0,
};

export const mockInterview = {
  id: 1,
  candidate: mockUser.id,
  job: mockJob.id,
  scheduled_at: "2025-02-25T10:00:00Z",
  room_id: "test-room-123",
  status: "scheduled",
};

export const mockInterviewCompleted = {
  id: 2,
  candidate: mockUser.id,
  job: mockJob.id,
  scheduled_at: "2025-01-10T10:00:00Z",
  room_id: "test-room-456",
  status: "completed",
};

export const mockAuthTokens = {
  access: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6ImNhbmRpZGF0ZV91c2VyIn0.test",
  refresh: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxfQ.test",
};

export const mockDashboardStats = {
  total_applications: 5,
  interviews_scheduled: 2,
  interviews_completed: 1,
  average_similarity_score: 76.5,
  active_jobs: 3,
  closed_jobs: 1,
};

export const mockApplicationsList = [
  mockApplication,
  mockApplicationWithCV,
  {
    ...mockApplication,
    id: 3,
    similarity_score: 65.0,
  },
];

export const mockJobsList = [mockJob, mockJobInactive];

export const mockInterviewsList = [mockInterview, mockInterviewCompleted];
