from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import google.generativeai as genai
import os
from dotenv import load_dotenv
import json
import re
from pathlib import Path
from deep_translator import GoogleTranslator
import requests
import io
import base64
from PIL import Image

# Load environment variables from parent directory
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

app = Flask(__name__)
CORS(app)

# Configure Gemini API
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    print("ERROR: GEMINI_API_KEY not found in environment variables")
    print(f"Looking for .env at: {env_path}")
    print(f".env exists: {env_path.exists()}")
    raise ValueError("GEMINI_API_KEY not found in environment variables")

print(f"✅ Gemini API key loaded (length: {len(GEMINI_API_KEY)})")
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.0-flash')

# Story themes/genres
THEMES = [
    'Mystery', 'Comedy', 'Adventure', 'Science Fiction', 
    'Fantasy', 'Horror', 'Romance', 'Thriller', 
    'Historical', 'Drama'
]

# Age groups and their reading levels
AGE_GROUPS = {
    'children': {
        'label': 'Children (5-8 years)',
        'description': 'Simple words, short sentences, easy to understand',
        'word_count': '200-300'
    },
    'kids': {
        'label': 'Kids (9-12 years)',
        'description': 'Basic vocabulary, clear stories',
        'word_count': '300-400'
    },
    'teens': {
        'label': 'Teens (13-17 years)',
        'description': 'Regular vocabulary, interesting plots',
        'word_count': '400-500'
    },
    'adults': {
        'label': 'Adults (18+ years)',
        'description': 'Advanced vocabulary, complex stories',
        'word_count': '400-600'
    }
}

# Supported languages for translation
LANGUAGES = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'ja': 'Japanese',
    'ko': 'Korean',
    'zh-CN': 'Chinese (Simplified)',
    'ar': 'Arabic',
    'hi': 'Hindi',
    'tr': 'Turkish',
    'nl': 'Dutch',
    'pl': 'Polish',
    'sv': 'Swedish',
    'id': 'Indonesian',
    'th': 'Thai',
    'vi': 'Vietnamese'
}


def clean_json_response(text):
    """Extract and clean JSON from response text"""
    # Try to find JSON in code blocks
    json_match = re.search(r'```json\s*(\{.*?\})\s*```', text, re.DOTALL)
    if json_match:
        return json_match.group(1)
    
    # Try to find raw JSON
    json_match = re.search(r'\{.*\}', text, re.DOTALL)
    if json_match:
        return json_match.group(0)
    
    return text


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'Backend is running'})


@app.route('/api/themes', methods=['GET'])
def get_themes():
    """Get available story themes"""
    return jsonify({'themes': THEMES})


@app.route('/api/age-groups', methods=['GET'])
def get_age_groups():
    """Get available age groups"""
    return jsonify({'ageGroups': AGE_GROUPS})


@app.route('/api/languages', methods=['GET'])
def get_languages():
    """Get available languages for translation"""
    return jsonify({'languages': LANGUAGES})


@app.route('/api/generate-story', methods=['POST'])
def generate_story():
    """Generate a story based on theme, age group, and prompt"""
    try:
        data = request.json
        theme = data.get('theme', 'Mystery')
        custom_prompt = data.get('prompt', '')
        age_group = data.get('ageGroup', 'kids')  # children, kids, teens, adults
        
        age_info = AGE_GROUPS.get(age_group, AGE_GROUPS['kids'])
        word_count = age_info['word_count']
        reading_level = age_info['description']
        
        print(f"📖 Generating story - Theme: {theme}, Age: {age_group}, Prompt: {custom_prompt[:50] if custom_prompt else 'None'}...")
        
        # Construct the prompt for Gemini
        if custom_prompt:
            prompt = f"""Create an engaging {theme} story based on this prompt: "{custom_prompt}"

The story should be:
- Between {word_count} words
- Written for {age_info['label']} - {reading_level}
- Have a clear beginning, middle, and end
- Include vivid descriptions and engaging characters

Return ONLY a JSON object with this exact structure (no markdown, no code blocks):
{{
  "title": "Story Title",
  "genre": "{theme}",
  "content": "The full story text with multiple paragraphs separated by \\n\\n",
  "readTime": "X min read",
  "imageDescription": "A detailed description of the main scene or characters for a book cover illustration. Be VERY specific about: number of characters, their appearance, what they're doing, the setting, colors, and mood. Example: 'Two golden retriever dogs playing together in a sunny garden, one dog is brown with floppy ears, the other is lighter colored, both looking happy, green grass, blue sky, flowers in background'"
}}"""
        else:
            prompt = f"""Create an original, engaging {theme} story.

The story should be:
- Between {word_count} words
- Written for {age_info['label']} - {reading_level}
- Have a clear beginning, middle, and end
- Include vivid descriptions and engaging characters
- Original and creative

Return ONLY a JSON object with this exact structure (no markdown, no code blocks):
{{
  "title": "Story Title",
  "genre": "{theme}",
  "content": "The full story text with multiple paragraphs separated by \\n\\n",
  "readTime": "X min read",
  "imageDescription": "A detailed description of the main scene or characters for a book cover illustration. Be VERY specific about: number of characters, their appearance, what they're doing, the setting, colors, and mood. Example: 'Two golden retriever dogs playing together in a sunny garden, one dog is brown with floppy ears, the other is lighter colored, both looking happy, green grass, blue sky, flowers in background'"
}}"""

        # Generate story
        print("🤖 Calling Gemini API...")
        response = model.generate_content(prompt)
        story_text = response.text
        
        print(f"✅ Received response from Gemini (length: {len(story_text)})")
        print(f"First 200 chars: {story_text[:200]}")
        
        # Clean and parse JSON
        cleaned_text = clean_json_response(story_text)
        print(f"🧹 Cleaned JSON (length: {len(cleaned_text)})")
        
        story_data = json.loads(cleaned_text)
        print(f"✅ Successfully parsed story: {story_data.get('title', 'Unknown')}")
        
        return jsonify(story_data)
    
    except json.JSONDecodeError as e:
        print(f"❌ JSON decode error: {e}")
        print(f"Response text: {response.text if 'response' in locals() else 'No response'}")
        return jsonify({'error': 'Failed to parse story data', 'details': str(e)}), 500
    except Exception as e:
        print(f"❌ Error generating story: {e}")
        print(f"Error type: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to generate story', 'details': str(e)}), 500


@app.route('/api/generate-quiz', methods=['POST'])
def generate_quiz():
    """Generate a quiz based on the story"""
    try:
        data = request.json
        story_title = data.get('title', '')
        story_content = data.get('content', '')
        
        prompt = f"""Based on this story titled "{story_title}", create a comprehension quiz with 5 multiple-choice questions.

Story:
{story_content}

Create questions that test understanding of:
- Plot details and events
- Character information
- Key story elements
- Reading comprehension

Return ONLY a JSON object with this exact structure (no markdown, no code blocks):
{{
  "questions": [
    {{
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0
    }}
  ]
}}

The "correct" field should be the index (0-3) of the correct answer in the options array."""

        # Generate quiz
        response = model.generate_content(prompt)
        quiz_text = response.text
        
        # Clean and parse JSON
        cleaned_text = clean_json_response(quiz_text)
        quiz_data = json.loads(cleaned_text)
        
        return jsonify(quiz_data)
    
    except json.JSONDecodeError as e:
        print(f"JSON decode error: {e}")
        print(f"Response text: {response.text}")
        return jsonify({'error': 'Failed to parse quiz data', 'details': str(e)}), 500
    except Exception as e:
        print(f"Error generating quiz: {e}")
        return jsonify({'error': 'Failed to generate quiz', 'details': str(e)}), 500


@app.route('/api/generate-flashcards', methods=['POST'])
def generate_flashcards():
    """Generate flashcards from the story for vocabulary learning"""
    try:
        data = request.json
        story_content = data.get('content', '')
        age_group = data.get('ageGroup', 'kids')
        
        age_info = AGE_GROUPS.get(age_group, AGE_GROUPS['kids'])
        
        prompt = f"""Based on this story, create 5 vocabulary flashcards with important or interesting words.

Story:
{story_content}

Create flashcards appropriate for {age_info['label']} - {age_info['description']}.

Each flashcard should have:
- A word from the story
- Simple definition (easy to understand)
- Example sentence using the word

Return ONLY a JSON object with this exact structure (no markdown, no code blocks):
{{
  "flashcards": [
    {{
      "word": "example word",
      "definition": "simple definition",
      "example": "example sentence"
    }}
  ]
}}"""

        # Generate flashcards
        print("🃏 Generating flashcards...")
        response = model.generate_content(prompt)
        flashcard_text = response.text
        
        # Clean and parse JSON
        cleaned_text = clean_json_response(flashcard_text)
        flashcard_data = json.loads(cleaned_text)
        
        print(f"✅ Generated {len(flashcard_data.get('flashcards', []))} flashcards")
        return jsonify(flashcard_data)
    
    except json.JSONDecodeError as e:
        print(f"JSON decode error: {e}")
        return jsonify({'error': 'Failed to parse flashcard data', 'details': str(e)}), 500
    except Exception as e:
        print(f"Error generating flashcards: {e}")
        return jsonify({'error': 'Failed to generate flashcards', 'details': str(e)}), 500


@app.route('/api/translate', methods=['POST'])
def translate_content():
    """Translate story or text to another language using Google Translate API"""
    try:
        data = request.json
        text = data.get('text', '')
        target_language = data.get('targetLanguage', 'es')
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        if target_language not in LANGUAGES:
            return jsonify({'error': 'Unsupported language'}), 400
        
        print(f"🌍 Translating to {LANGUAGES[target_language]}...")
        
        # Use deep-translator for efficient translation (doesn't use Gemini tokens)
        translator = GoogleTranslator(source='en', target=target_language)
        
        # Split text into paragraphs for better translation
        paragraphs = text.split('\n\n')
        translated_paragraphs = []
        
        for para in paragraphs:
            if para.strip():
                translated = translator.translate(para)
                translated_paragraphs.append(translated)
        
        translated_text = '\n\n'.join(translated_paragraphs)
        
        print(f"✅ Translation complete")
        return jsonify({
            'translatedText': translated_text,
            'targetLanguage': target_language,
            'languageName': LANGUAGES[target_language]
        })
    
    except Exception as e:
        print(f"Error translating: {e}")
        return jsonify({'error': 'Failed to translate', 'details': str(e)}), 500


@app.route('/api/generate-cover-image', methods=['POST'])
def generate_cover_image():
    """Generate a story cover image using Stable Diffusion API"""
    try:
        data = request.json
        title = data.get('title', '')
        genre = data.get('genre', '')
        story_summary = data.get('summary', '')
        
        if not title:
            return jsonify({'error': 'Title is required'}), 400
        
        print(f"🎨 Generating cover image for: {title}")
        
        # Create a detailed, accurate prompt for image generation
        if story_summary:
            # Use the detailed description if provided
            image_prompt = f"{story_summary}. Professional children's book cover illustration, storybook art style, vibrant colors, detailed, high quality"
        else:
            # Fallback to basic prompt
            image_prompt = f"Book cover illustration: '{title}', {genre} genre story. Beautiful detailed professional children's book cover art, storybook illustration style, vibrant colors, perfect composition"
        
        print(f"🖼️ Image prompt: {image_prompt[:250]}...")
        
        # Use Hugging Face's best image generation models for accuracy
        # These models are better at following prompts accurately
        models = [
            "black-forest-labs/FLUX.1-schnell",         # Fast, accurate, excellent at prompt following
            "stabilityai/stable-diffusion-xl-base-1.0", # High quality SDXL
            "runwayml/stable-diffusion-v1-5",           # Reliable fallback
        ]
        
        # Get Hugging Face API key from environment
        hf_api_key = os.getenv('HUGGINGFACE_API_KEY')
        
        if not hf_api_key or hf_api_key == 'your_huggingface_token_here':
            print("⚠️ No valid Hugging Face API key found")
            return jsonify({
                'imageData': None,
                'error': 'Hugging Face API key not configured. Get one at https://huggingface.co/settings/tokens',
                'fallback': True
            })
        
        headers = {
            "Authorization": f"Bearer {hf_api_key}"
        }
        
        # Try each model until one succeeds
        last_error = None
        for model in models:
            try:
                API_URL = f"https://api-inference.huggingface.co/models/{model}"
                print(f"🎨 Trying model: {model}")
                
                response = requests.post(
                    API_URL,
                    headers=headers,
                    json={"inputs": image_prompt, "wait_for_model": True},  # Wait for model to load
                    timeout=60  # Longer timeout for model loading
                )
                
                print(f"📡 Image API response status: {response.status_code}")
                
                if response.status_code == 200:
                    # Convert image to base64 for easy transfer
                    image_bytes = response.content
                    image_base64 = base64.b64encode(image_bytes).decode('utf-8')
                    
                    print(f"✅ Cover image generated successfully with {model} (size: {len(image_base64)} chars)")
                    return jsonify({
                        'imageData': f"data:image/jpeg;base64,{image_base64}",
                        'prompt': image_prompt,
                        'model': model
                    })
                elif response.status_code == 503:
                    # Model is loading
                    print(f"⏳ Model {model} is loading, trying next...")
                    last_error = f"Model loading (503)"
                    continue
                else:
                    print(f"⚠️ Model {model} returned status {response.status_code}")
                    print(f"Response: {response.text[:300]}")
                    last_error = f"Status {response.status_code}: {response.text[:100]}"
                    continue
                    
            except requests.exceptions.Timeout:
                print(f"⏱️ Timeout for model {model}, trying next...")
                last_error = "Request timeout"
                continue
            except Exception as e:
                print(f"❌ Error with model {model}: {e}")
                last_error = str(e)
                continue
        
        # All models failed
        print(f"⚠️ All image generation models failed. Last error: {last_error}")
        return jsonify({
            'imageData': None,
            'error': f'Image generation temporarily unavailable: {last_error}',
            'fallback': True
        })
    
    except Exception as e:
        print(f"Error generating cover image: {e}")
        return jsonify({
            'imageData': None,
            'error': str(e),
            'fallback': True
        }), 200  # Return 200 so frontend can handle gracefully


if __name__ == '__main__':
    app.run(debug=True, port=5000)
