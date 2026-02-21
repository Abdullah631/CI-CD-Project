"""
Quick test to verify Ollama CV parsing is working
Run this with: python test_ollama_cv_parsing.py
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
sys.path.insert(0, os.path.dirname(__file__))

# Configure Django
django.setup()

from loginapi.cv_parser import extract_cv_metadata, calculate_file_hash

# Test paths
test_cv_path = "test-files/sample_cv.pdf"  # Adjust if needed

if os.path.exists(test_cv_path):
    print("🧪 Testing CV Metadata Extraction...")
    print(f"📄 CV File: {test_cv_path}")
    
    # Calculate hash
    file_hash = calculate_file_hash(test_cv_path)
    print(f"🔐 File Hash: {file_hash[:16]}...")
    
    # Extract metadata (should try Ollama first)
    print("\n📊 Extracting metadata (first time - should hit Ollama)...")
    metadata = extract_cv_metadata(test_cv_path)
    
    if metadata and not metadata.get('error'):
        print("✅ SUCCESS! Metadata extracted:")
        print(f"   Name: {metadata.get('full_name')}")
        print(f"   Experience: {metadata.get('years_of_experience')} years")
        print(f"   Skills: {metadata.get('skills', [])[:3]}")
        print(f"   Provider: {metadata.get('_ai_provider')}")
        
        # Test caching (second time - should use cache)
        print("\n⚡ Extracting same CV again (should use cache)...")
        metadata2 = extract_cv_metadata(test_cv_path, cached_metadata=metadata)
        
        if metadata2:
            print("✅ Cache working! Retrieved instantly")
            print(f"   Same name: {metadata2.get('full_name') == metadata.get('full_name')}")
    else:
        print(f"❌ Error: {metadata.get('error')}")
else:
    print(f"❌ Test file not found: {test_cv_path}")
    print("   Please provide a sample CV file in test-files/sample_cv.pdf")
