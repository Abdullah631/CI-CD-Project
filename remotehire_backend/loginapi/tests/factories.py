import factory
from faker import Faker
from loginapi.models import User, Job, Application, Interview
from django.utils import timezone
from datetime import timedelta

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
    photo = ''  # Empty string for testing

    @classmethod
    def create(cls, **kwargs):
        # Simply create and save - password is stored in plain text in the custom User model
        obj = super().create(**kwargs)
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


class InterviewFactory(factory.django.DjangoModelFactory):
    """Factory for creating test interviews"""
    class Meta:
        model = Interview

    recruiter = factory.SubFactory(UserFactory, role='recruiter')
    candidate = factory.SubFactory(UserFactory, role='candidate')
    job = factory.SubFactory(JobFactory)
    scheduled_at = factory.LazyFunction(lambda: timezone.now() + timedelta(days=1))
    status = 'pending'
