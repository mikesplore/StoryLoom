#!/usr/bin/env python3
"""Test script to verify Gemini API connection"""

import os
from dotenv import load_dotenv
from pathlib import Path
import google.generativeai as genai

# Load environment variables
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

print("🔍 Testing Gemini API Connection")
print("=" * 50)

# Check API key
api_key = os.getenv('GEMINI_API_KEY')
if not api_key:
    print("❌ ERROR: GEMINI_API_KEY not found in .env file")
    print(f"   Looking at: {env_path}")
    print(f"   File exists: {env_path.exists()}")
    exit(1)

print(f"✅ API Key found (length: {len(api_key)})")
print(f"   First 10 chars: {api_key[:10]}...")

# Configure Gemini
try:
    genai.configure(api_key=api_key)
    print("✅ Gemini API configured")
except Exception as e:
    print(f"❌ Error configuring Gemini: {e}")
    exit(1)

# Test with a simple prompt
try:
    print("\n🤖 Testing API with simple prompt...")
    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content("Say hello in 5 words")
    print(f"✅ API Response: {response.text}")
    print("\n🎉 SUCCESS! Gemini API is working correctly!")
except Exception as e:
    print(f"❌ Error calling Gemini API: {e}")
    print(f"   Error type: {type(e).__name__}")
    import traceback
    traceback.print_exc()
    exit(1)
