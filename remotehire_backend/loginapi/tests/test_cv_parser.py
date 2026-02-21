import pytest
from loginapi import cv_parser
from .factories import UserFactory, JobFactory

pytestmark = pytest.mark.unit


@pytest.mark.unit
class TestCVExtraction:
    """Test CV text extraction functionality"""

    def test_cv_parser_module_exists(self):
        """Test that cv_parser module exists"""
        assert cv_parser is not None

    def test_extract_text_from_pdf_function_exists(self):
        """Test that extract_text_from_pdf function exists"""
        assert hasattr(cv_parser, 'extract_text_from_pdf')

    def test_extract_text_from_docx_function_exists(self):
        """Test that extract_text_from_docx function exists"""
        assert hasattr(cv_parser, 'extract_text_from_docx')

    def test_extract_text_from_txt_function_exists(self):
        """Test that extract_text_from_txt function exists"""
        assert hasattr(cv_parser, 'extract_text_from_txt')

    def test_cv_parser_handles_missing_file(self):
        """Test that parser handles missing files gracefully"""
        # Should not raise exception
        result = cv_parser.extract_text_from_pdf("nonexistent.pdf")
        assert isinstance(result, str)

    def test_extract_text_returns_string(self):
        """Test that extraction functions return strings"""
        result = cv_parser.extract_text_from_txt("nonexistent.txt")
        assert isinstance(result, str)


@pytest.mark.unit
class TestCVMetadataStorage:
    """Test CV metadata storage in User model"""

    def test_user_has_cv_metadata_field(self, db):
        """Test that user has cv_metadata field"""
        user = UserFactory()
        assert hasattr(user, 'cv_metadata')

    def test_cv_metadata_is_json(self, db):
        """Test that cv_metadata is JSON field"""
        user = UserFactory(cv_metadata={'skills': ['Python', 'Django']})
        assert isinstance(user.cv_metadata, dict)
        assert 'skills' in user.cv_metadata

    def test_cv_metadata_default_value(self, db):
        """Test cv_metadata has default empty dict"""
        user = UserFactory()
        assert isinstance(user.cv_metadata, dict)

    def test_cv_last_updated_timestamp(self, db):
        """Test cv_last_updated field exists"""
        user = UserFactory()
        assert hasattr(user, 'cv_last_updated')

    def test_cv_upload_field(self, db):
        """Test that user has cv upload field"""
        user = UserFactory()
        assert hasattr(user, 'cv')

    def test_cv_metadata_persistence(self, db):
        """Test that cv_metadata persists after save"""
        metadata = {
            'skills': ['Python', 'Django', 'PostgreSQL'],
            'experience': '5+ years',
            'education': 'Bachelor\'s in CS'
        }
        user = UserFactory(cv_metadata=metadata)
        user.save()
        
        # Fetch from database
        from django.contrib.auth import get_user_model
        User = get_user_model()
        saved_user = User.objects.get(id=user.id)
        
        assert saved_user.cv_metadata == metadata
        assert saved_user.cv_metadata['skills'] == metadata['skills']
