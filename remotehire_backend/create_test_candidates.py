import os
import django
import json
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from loginapi.models import User

# Candidate 2: Low match (few required skills)
candidate2_metadata = {
    'full_name': 'Ahmed Hassan',
    'email': 'ahmed@example.com',
    'phone': '+1-555-9876',
    'current_title': 'Junior Web Developer',
    'years_of_experience': 2,
    'skills': ['HTML', 'CSS', 'JavaScript', 'Bootstrap', 'Vue.js'],
    'programming_languages': ['JavaScript', 'Python'],
    'frameworks': ['Vue.js', 'Express.js'],
    'education': [{'degree': 'Bachelor', 'field': 'IT', 'institution': 'Community College'}],
    'work_experience': [{'title': 'Junior Developer', 'company': 'Web Agency', 'years': 2, 'key_achievements': ['Built 5 websites']}],
    'certifications': [],
    'languages': ['English'],
    'specializations': ['Frontend Development'],
    'soft_skills': ['Quick Learner']
}

# Candidate 3: High match (all required skills + more)
candidate3_metadata = {
    'full_name': 'Sarah Johnson',
    'email': 'sarah@example.com',
    'phone': '+1-555-5555',
    'current_title': 'Full Stack Engineer',
    'years_of_experience': 7,
    'skills': ['Python', 'Django', 'React', 'JavaScript', 'PostgreSQL', 'REST APIs', 'Docker', 'Kubernetes'],
    'programming_languages': ['Python', 'JavaScript', 'TypeScript', 'Go', 'SQL'],
    'frameworks': ['Django', 'React', 'FastAPI', 'NestJS'],
    'education': [{'degree': 'Master', 'field': 'Computer Science', 'institution': 'Stanford University'}],
    'work_experience': [
        {'title': 'Principal Engineer', 'company': 'Big Tech', 'years': 3, 'key_achievements': ['Led migration to microservices']},
        {'title': 'Senior Backend', 'company': 'Scale-up', 'years': 4, 'key_achievements': ['10M+ API calls/day']}
    ],
    'certifications': ['AWS Solutions Architect', 'Kubernetes CKAD'],
    'languages': ['English', 'Spanish'],
    'specializations': ['Cloud Architecture', 'Web Development'],
    'soft_skills': ['Leadership', 'Strategic Thinking']
}

# Create or update candidates
user2, created = User.objects.get_or_create(
    username='ahmed.hassan',
    defaults={
        'email': 'ahmed@example.com',
        'password': '',
        'role': 'candidate',
        'cv_metadata': candidate2_metadata
    }
)
if not created:
    user2.cv_metadata = candidate2_metadata
    user2.save()

user3, created = User.objects.get_or_create(
    username='sarah.johnson',
    defaults={
        'email': 'sarah@example.com',
        'password': '',
        'role': 'candidate',
        'cv_metadata': candidate3_metadata
    }
)
if not created:
    user3.cv_metadata = candidate3_metadata
    user3.save()

print('✅ Test Candidates Created:')
print(f'  1. Bilal Khawar (ID: 11) - 6 years - HIGH MATCH')
print(f'  2. Ahmed Hassan (ID: {user2.id}) - 2 years - LOW MATCH')
print(f'  3. Sarah Johnson (ID: {user3.id}) - 7 years - HIGHEST MATCH')
print(f'\nAll candidates ready for similarity scoring test!')
