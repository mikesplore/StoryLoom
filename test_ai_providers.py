#!/usr/bin/env python3
"""
Test script to verify AI provider configuration
"""

import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

print("=" * 60)
print("StoryLoom AI Provider Configuration Test")
print("=" * 60)

# Check environment variables
gemini_key = os.getenv('GEMINI_API_KEY')
hf_key = os.getenv('HUGGINGFACE_API_KEY')

print("\n📋 Environment Check:")
print(f"  .env file exists: {env_path.exists()}")
print(f"  GEMINI_API_KEY: {'✅ Configured' if gemini_key else '❌ Not configured'}")
print(f"  HUGGINGFACE_API_KEY: {'✅ Configured' if hf_key else '❌ Not configured'}")

if not gemini_key and not hf_key:
    print("\n❌ ERROR: No AI provider API keys configured!")
    print("Please configure at least one API key in the .env file")
    sys.exit(1)

print("\n🔄 Testing AI Provider Manager...")

try:
    from backend.ai_providers import AIProviderManager
    
    manager = AIProviderManager()
    
    print(f"\n✅ AI Provider Manager initialized successfully!")
    print(f"  Primary provider: {manager.get_current_provider()}")
    print(f"  Available providers: {[p.name for p in manager.available_providers]}")
    
    # Test a simple generation
    print("\n🧪 Testing content generation...")
    test_prompt = "Write a one sentence story about a cat."
    
    try:
        result = manager.generate_content(test_prompt)
        print(f"✅ Generation successful!")
        print(f"  Provider used: {manager.get_current_provider()}")
        print(f"  Result: {result[:100]}..." if len(result) > 100 else f"  Result: {result}")
    except Exception as e:
        print(f"❌ Generation failed: {e}")
        sys.exit(1)
    
    print("\n" + "=" * 60)
    print("✅ All tests passed! Backend is ready to use.")
    print("=" * 60)
    
except Exception as e:
    print(f"\n❌ ERROR: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
