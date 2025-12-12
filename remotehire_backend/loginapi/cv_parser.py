"""
CV Parsing and Metadata Extraction using Google Gemini API
"""
import google.generativeai as genai
from django.conf import settings
import json
from pypdf import PdfReader
from pathlib import Path

# Try to import python-docx for DOCX support
try:
    from docx import Document as DocxDocument
    DOCX_AVAILABLE = True
except ImportError:
    DOCX_AVAILABLE = False
    print("[CV_PARSER] python-docx not installed. DOCX support disabled.")


def extract_text_from_pdf(pdf_path):
    """Extract text from PDF file using pypdf"""
    try:
        reader = PdfReader(pdf_path)
        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                # Clean up any encoding issues
                page_text = page_text.encode('utf-8', errors='ignore').decode('utf-8', errors='ignore')
                text += page_text
        
        if not text:
            print(f"[PDF_EXTRACT] Warning: No text extracted from PDF")
        else:
            print(f"[PDF_EXTRACT] Extracted {len(text)} characters from PDF")
        return text
    except Exception as e:
        print(f"[PDF_EXTRACT] Error extracting PDF text: {str(e)}")
        return ""


def extract_text_from_docx(docx_path):
    """Extract text from DOCX file"""
    if not DOCX_AVAILABLE:
        print("[DOCX_EXTRACT] python-docx not available")
        return ""
    
    try:
        doc = DocxDocument(docx_path)
        text = ""
        for paragraph in doc.paragraphs:
            if paragraph.text:
                text += paragraph.text + "\n"
        
        # Also extract from tables
        for table in doc.tables:
            for row in table.rows:
                for cell in row.cells:
                    if cell.text:
                        text += cell.text + "\n"
        
        if not text:
            print(f"[DOCX_EXTRACT] Warning: No text extracted from DOCX")
        else:
            print(f"[DOCX_EXTRACT] Extracted {len(text)} characters from DOCX")
        return text
    except Exception as e:
        print(f"[DOCX_EXTRACT] Error extracting DOCX text: {str(e)}")
        return ""


def configure_gemini():
    """Configure Gemini API"""
    api_key = settings.GEMINI_API_KEY
    print(f"[GEMINI_CONFIG] API Key configured: {bool(api_key)}")
    if not api_key or api_key == 'your_gemini_api_key_here':
        raise ValueError("GEMINI_API_KEY not configured in .env")
    genai.configure(api_key=api_key)
    
    # List available models
    try:
        models = genai.list_models()
        print(f"[GEMINI_CONFIG] Available models:")
        for model in models:
            if 'generateContent' in model.supported_generation_methods:
                print(f"  - {model.name}")
    except Exception as e:
        print(f"[GEMINI_CONFIG] Could not list models: {str(e)}")
    
    print(f"[GEMINI_CONFIG] Gemini configured successfully")


def extract_cv_metadata(cv_file_path):
    """
    Extract metadata from CV using Google Gemini API
    Returns structured metadata including skills, experience, education, etc.
    """
    try:
        configure_gemini()
        
        # Extract text based on file type
        file_ext = str(cv_file_path).lower()
        print(f"[CV_METADATA] Processing file: {cv_file_path}")
        
        if file_ext.endswith('.pdf'):
            cv_text = extract_text_from_pdf(cv_file_path)
        elif file_ext.endswith('.docx'):
            cv_text = extract_text_from_docx(cv_file_path)
        elif file_ext.endswith('.txt'):
            try:
                with open(cv_file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    cv_text = f.read()
                print(f"[TXT_EXTRACT] Extracted {len(cv_text)} characters from TXT")
            except Exception as e:
                print(f"[TXT_EXTRACT] Error: {str(e)}")
                cv_text = ""
        else:
            print(f"[CV_METADATA] Unsupported file type: {file_ext}")
            return {"error": f"Unsupported file type. Supported: PDF, DOCX, TXT"}
        
        if not cv_text.strip():
            return {"error": "Could not extract text from CV"}
        
        # Use Gemini to extract structured data
        prompt = f"""
        Analyze the following CV/Resume and extract the following information in JSON format:
        
        {{
            "full_name": "Extracted full name or null",
            "email": "Extracted email or null",
            "phone": "Extracted phone number or null",
            "current_title": "Current job title or null",
            "years_of_experience": numeric value (total years),
            "skills": ["list", "of", "key", "technical", "skills"],
            "programming_languages": ["list", "of", "programming", "languages"],
            "frameworks": ["list", "of", "frameworks", "and", "libraries"],
            "education": [
                {{
                    "degree": "Bachelor/Master/PhD etc",
                    "field": "Field of study",
                    "institution": "University/College name"
                }}
            ],
            "work_experience": [
                {{
                    "title": "Job title",
                    "company": "Company name",
                    "years": number (duration in years),
                    "key_achievements": ["achievement1", "achievement2"]
                }}
            ],
            "certifications": ["list", "of", "certifications"],
            "languages": ["list", "of", "languages"],
            "specializations": ["list", "of", "specialized", "areas"],
            "soft_skills": ["list", "of", "soft", "skills"]
        }}
        
        CV Content:
        {cv_text}
        
        Return ONLY valid JSON, no markdown or additional text.
        """
        
        print(f"[CV_METADATA] Sending prompt to Gemini API with CV text length: {len(cv_text)}")
        
        # Try to get available model
        try:
            available_models = [m for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]
            if available_models:
                model_name = available_models[0].name
                print(f"[CV_METADATA] Using model: {model_name}")
                model = genai.GenerativeModel(model_name)
            else:
                raise ValueError("No available models support content generation")
        except Exception as e:
            print(f"[CV_METADATA] Model selection error: {str(e)}")
            # Fallback to trying common model names
            model = genai.GenerativeModel('gemini-1.5-flash-latest')
        
        response = model.generate_content(prompt)
        response_text = response.text
        
        print(f"[CV_PARSER] Gemini response length: {len(response_text)}")
        print(f"[CV_PARSER] Gemini response (first 500 chars): {response_text[:500]}")
        
        # Try to parse JSON response
        try:
            # Handle markdown code blocks if present
            if response_text.startswith("```"):
                response_text = response_text.split("```")[1]
                if response_text.startswith("json"):
                    response_text = response_text[4:]
            
            # Clean up the response text - remove any BOM or invalid characters
            response_text = response_text.encode('utf-8', errors='ignore').decode('utf-8')
            response_text = response_text.strip()
            
            print(f"[CV_PARSER] After cleanup, response: {response_text[:500]}")
            
            # Try to parse JSON
            metadata = json.loads(response_text)
            print(f"[CV_PARSER] Successfully parsed metadata with keys: {list(metadata.keys())}")
            return metadata
        except json.JSONDecodeError as e:
            print(f"[CV_PARSER] JSON parsing error: {str(e)}")
            print(f"[CV_PARSER] Response that failed to parse: {response_text[:500]}")
            # Return a basic default structure instead of raw response
            return {
                "error": "Failed to parse CV metadata. Please try uploading again.",
                "years_of_experience": 0,
                "skills": [],
                "education": [],
                "work_experience": []
            }
            
    except ValueError as e:
        return {"error": str(e)}
    except Exception as e:
        error_str = str(e)
        print(f"[CV_METADATA] CV extraction error: {error_str}")
        
        # Check if it's a rate limit error
        if "429" in error_str or "quota" in error_str.lower():
            return {
                "error": "Gemini API rate limit exceeded. Please try again later.",
                "years_of_experience": 0,
                "skills": [],
                "education": [],
                "work_experience": []
            }
        
        return {
            "error": f"Failed to extract CV metadata: {error_str[:100]}",
            "years_of_experience": 0,
            "skills": [],
            "education": [],
            "work_experience": []
        }


def calculate_similarity_score(cv_metadata, job_requirements):
    """
    Calculate similarity score between CV metadata and job requirements
    Returns score 0-100
    """
    if not cv_metadata or not job_requirements:
        return 0.0
    
    if "error" in cv_metadata:
        return 0.0
    
    score = 0.0
    weights = {
        'skills': 0.35,
        'experience': 0.25,
        'education': 0.15,
        'languages': 0.10,
        'certifications': 0.15
    }
    
    # Skills matching
    cv_skills = set(str(s).lower() for s in cv_metadata.get('skills', []))
    required_skills = set(str(s).lower() for s in job_requirements.get('required_skills', []))
    
    if required_skills:
        skill_match = len(cv_skills & required_skills) / len(required_skills)
        score += skill_match * weights['skills'] * 100
    
    # Experience matching
    cv_experience = cv_metadata.get('years_of_experience', 0)
    required_experience = job_requirements.get('required_experience_years', 0)
    
    if required_experience > 0:
        exp_match = min(cv_experience / required_experience, 1.0)
        score += exp_match * weights['experience'] * 100
    else:
        score += weights['experience'] * 100
    
    # Education matching
    cv_education_levels = {e.get('degree', '').lower() for e in cv_metadata.get('education', [])}
    required_education = job_requirements.get('required_education', '').lower()
    
    education_match = 0.0
    if required_education:
        if required_education in cv_education_levels:
            education_match = 1.0
        elif 'bachelor' in required_education and any('bachelor' in e for e in cv_education_levels):
            education_match = 0.8
        elif 'master' in required_education and 'master' in cv_education_levels:
            education_match = 1.0
    else:
        education_match = 0.6  # Default if no education requirement specified
    
    score += education_match * weights['education'] * 100
    
    # Languages
    cv_languages = set(str(l).lower() for l in cv_metadata.get('languages', []))
    required_languages = set(str(l).lower() for l in job_requirements.get('required_languages', []))
    
    if required_languages:
        lang_match = len(cv_languages & required_languages) / len(required_languages)
        score += lang_match * weights['languages'] * 100
    
    # Certifications
    cv_certifications = set(str(c).lower() for c in cv_metadata.get('certifications', []))
    required_certifications = set(str(c).lower() for c in job_requirements.get('required_certifications', []))
    
    if required_certifications:
        cert_match = len(cv_certifications & required_certifications) / len(required_certifications)
        score += cert_match * weights['certifications'] * 100
    
    return min(score, 100.0)
