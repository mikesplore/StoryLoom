from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from flask_bcrypt import Bcrypt
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
from datetime import datetime
from models import db, User, Story
from ai_providers import AIProviderManager

# Load environment variables from parent directory
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-change-this-in-production')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///storyloom.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

 # Initialize extensions
CORS(app, supports_credentials=True, origins=["https://05sf7791-5173.euw.devtunnels.ms/","https://171e3922ae53.ngrok-free.app/"])
db.init_app(app)
bcrypt = Bcrypt(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'

# Flask-Admin setup
admin = Admin(app, name='StoryLoom Admin', template_mode='bootstrap4')
with app.app_context():
    admin.add_view(ModelView(User, db.session))
    admin.add_view(ModelView(Story, db.session))

@login_manager.user_loader
def load_user(user_id):
    return db.session.get(User, int(user_id))

# Initialize AI Provider Manager (supports multiple providers with fallback)
try:
    ai_manager = AIProviderManager()
except Exception as e:
    print(f"❌ Failed to initialize AI providers: {e}")
    raise

# Story themes/genres
THEMES = [
    'Mystery', 'Comedy', 'Adventure', 'Science Fiction', 
    'Fantasy', 'Horror', 'Romance', 'Thriller', 
    'Historical', 'Drama', 'Crime', 'Fairy Tale', 
    'Supernatural', 'Slice of Life'
]

# Age groups and their reading levels
AGE_GROUPS = {
    'preschool': {
        'label': 'Preschool (3-5 years)',
        'description': 'Very simple words, repetitive patterns, picture-book style. Use only basic sight words (cat, dog, run, see, etc.)',
        'word_count': '50-100'
    },
    'early_readers': {
        'label': 'Early Readers (5-7 years)',
        'description': 'Simple words, short sentences (3-5 words), easy to sound out. Focus on basic phonics and common words.',
        'word_count': '150-250'
    },
    'children': {
        'label': 'Children (8-10 years)',
        'description': 'Simple vocabulary, clear sentences, easy to follow plots. Age-appropriate themes.',
        'word_count': '300-500'
    },
    'kids': {
        'label': 'Pre-Teens (11-12 years)',
        'description': 'Moderate vocabulary, descriptive language, engaging plots with some complexity.',
        'word_count': '500-800'
    },
    'teens': {
        'label': 'Teens (13-17 years)',
        'description': 'Advanced vocabulary, complex plots, nuanced characters, mature themes appropriate for teens.',
        'word_count': '800-1200'
    },
    'young_adults': {
        'label': 'Young Adults (18-25 years)',
        'description': 'Sophisticated vocabulary, intricate plots, deep character development, contemporary themes.',
        'word_count': '1200-1800'
    },
    'adults': {
        'label': 'Adults (25+ years)',
        'description': 'Rich vocabulary, complex narratives, layered themes, literary quality.',
        'word_count': '1500-2500'
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
    'sw': 'Swahili',
    'id': 'Indonesian',
    'th': 'Thai',
    'vi': 'Vietnamese',
    'luo': 'Luo'
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
    """Health check endpoint with AI provider info"""
    return jsonify({
        'status': 'healthy',
        'message': 'Backend is running',
        'ai_provider': ai_manager.get_current_provider(),
        'available_providers': [p.name for p in ai_manager.available_providers]
    })


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
@login_required
def generate_story():
    """Generate a story based on theme, age group, and prompt, with per-user daily rate limit"""
    try:
        data = request.json
        print(f"📥 Received request data: {data}")

        # Rate limit: 3 stories per user per day
        user = current_user
        now = datetime.utcnow()
        today = now.date()
        last_activity = user.last_activity.date() if user.last_activity else None
        if last_activity == today:
            if user.stories_generated >= 5:
                return jsonify({'error': 'Daily story generation limit reached. Please try again tomorrow.'}), 429
            user.stories_generated += 1
        else:
            user.stories_generated = 1
            user.last_activity = now
        db.session.commit()

        theme = data.get('theme', 'Mystery')
        custom_prompt = data.get('prompt', '')
        age_group = data.get('ageGroup', 'children')  # early_readers, children, preteens, teens, adults

        print(f"📚 Theme: {theme}, Age Group: {age_group}, Prompt: {custom_prompt[:50] if custom_prompt else 'None'}...")

        age_info = AGE_GROUPS.get(age_group, AGE_GROUPS['children'])
        word_count = age_info['word_count']
        reading_level = age_info['description']
        
        
        # Construct the prompt for story generation (quiz is separate)
        if custom_prompt:
            prompt = f"""Create an engaging {theme} story based on this prompt: "{custom_prompt}"

The story should be:
- Appropriate for {age_info['label']}
- Reading level: {reading_level}
- Length: {word_count} words
- Use vocabulary and sentence structure suitable for this age group
- Include age-appropriate themes and content
- Be engaging and entertaining for the target audience
- Dont include long dashes

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
- Appropriate for {age_info['label']}
- Reading level: {reading_level}
- Length: {word_count} words
- Use vocabulary and sentence structure suitable for this age group
- Include age-appropriate themes and content
- Be engaging and entertaining for the target audience

Return ONLY a JSON object with this exact structure (no markdown, no code blocks):
{{
  "title": "Story Title",
  "genre": "{theme}",
  "content": "The full story text with multiple paragraphs separated by \\n\\n",
  "readTime": "X min read",
  "imageDescription": "A detailed description of the main scene or characters for a book cover illustration. Be VERY specific about: number of characters, their appearance, what they're doing, the setting, colors, and mood. Example: 'Two golden retriever dogs playing together in a sunny garden, one dog is brown with floppy ears, the other is lighter colored, both looking happy, green grass, blue sky, flowers in background'"
}}"""

        # Generate story
        response_text = ai_manager.generate_content(prompt)
        
        
        # Clean and parse JSON
        cleaned_text = clean_json_response(response_text)
        
        story_data = json.loads(cleaned_text)
        
        return jsonify(story_data)
    
    except json.JSONDecodeError as e:
        print(f"❌ JSON decode error: {e}")
        print(f"Response text was: {response_text if 'response_text' in locals() else 'N/A'}")
        return jsonify({'error': 'Failed to parse story data', 'details': str(e)}), 500
    except Exception as e:
        print(f"❌ Error generating story: {e}")
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
        age_group = data.get('ageGroup', 'children')
        
        age_info = AGE_GROUPS.get(age_group, AGE_GROUPS['children'])
        
        prompt = f"""Based on this story titled "{story_title}", create a comprehension quiz with 5 multiple-choice questions.

Story:
{story_content}

The quiz should be:
- Appropriate for {age_info['label']}
- Use simple, clear language suitable for this age group
- Test age-appropriate comprehension skills
- Have questions that are neither too easy nor too difficult for this age

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
        quiz_text = ai_manager.generate_content(prompt)
        
        # Clean and parse JSON
        cleaned_text = clean_json_response(quiz_text)
        quiz_data = json.loads(cleaned_text)
        
        return jsonify(quiz_data)
    
    except json.JSONDecodeError as e:
        print(f"JSON decode error: {e}")
        print(f"Response text: {quiz_text}")
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
        age_group = data.get('ageGroup', 'children')
        
        age_info = AGE_GROUPS.get(age_group, AGE_GROUPS['children'])
        
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
        flashcard_text = ai_manager.generate_content(prompt)
        
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
                # Use new Hugging Face Inference Providers API endpoint
                API_URL = f"https://router.huggingface.co/hf-inference/models/{model}"
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


# ============================================
# AUTHENTICATION ENDPOINTS
# ============================================

@app.route('/api/auth/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.json
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        
        if not username or not email or not password:
            return jsonify({'error': 'All fields are required'}), 400
        
        # Check if user already exists
        if User.query.filter_by(username=username).first():
            return jsonify({'error': 'Username already exists'}), 400
        
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'Email already exists'}), 400
        
        # Create new user
        password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
        new_user = User(username=username, email=email, password_hash=password_hash)
        
        db.session.add(new_user)
        db.session.commit()
        
        # Log the user in
        login_user(new_user)
        
        return jsonify({
            'message': 'Registration successful',
            'user': {
                'id': new_user.id,
                'username': new_user.username,
                'email': new_user.email
            }
        }), 201
    
    except Exception as e:
        db.session.rollback()
        print(f"Registration error: {e}")
        return jsonify({'error': 'Registration failed'}), 500


@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login user"""
    try:
        data = request.json
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'error': 'Username and password required'}), 400
        
        user = User.query.filter_by(username=username).first()
        
        if not user or not bcrypt.check_password_hash(user.password_hash, password):
            return jsonify({'error': 'Invalid username or password'}), 401
        
        login_user(user)
        
        return jsonify({
            'message': 'Login successful',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            }
        }), 200
    
    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({'error': 'Login failed'}), 500


@app.route('/api/auth/logout', methods=['POST'])
@login_required
def logout():
    """Logout user"""
    logout_user()
    return jsonify({'message': 'Logout successful'}), 200


@app.route('/api/auth/user', methods=['GET'])
@login_required
def get_current_user():
    """Get current logged in user"""
    return jsonify({
        'user': {
            'id': current_user.id,
            'username': current_user.username,
            'email': current_user.email
        }
    }), 200


# ============================================
# STORY LIBRARY ENDPOINTS
# ============================================

@app.route('/api/library/stories', methods=['GET'])
@login_required
def get_user_stories():
    """Get all stories for the current user"""
    try:
        stories = Story.query.filter_by(user_id=current_user.id).order_by(Story.created_at.desc()).all()
        return jsonify({
            'stories': [story.to_dict() for story in stories]
        }), 200
    except Exception as e:
        print(f"Error fetching stories: {e}")
        return jsonify({'error': 'Failed to fetch stories'}), 500


@app.route('/api/library/stories', methods=['POST'])
@login_required
def save_story():
    """Save a story to user's library"""
    try:
        data = request.json
        
        # Create new story
        new_story = Story(
            title=data.get('title'),
            genre=data.get('genre'),
            content=data.get('content'),
            age_group=data.get('ageGroup'),
            read_time=data.get('readTime'),
            cover_image=data.get('coverImage'),
            questions=json.dumps(data.get('questions', [])),
            flashcards=json.dumps(data.get('flashcards', [])),
            user_id=current_user.id
        )
        
        db.session.add(new_story)
        db.session.commit()
        
        return jsonify({
            'message': 'Story saved successfully',
            'story': new_story.to_dict()
        }), 201
    
    except Exception as e:
        db.session.rollback()
        print(f"Error saving story: {e}")
        return jsonify({'error': 'Failed to save story'}), 500


@app.route('/api/library/stories/<int:story_id>', methods=['GET'])
@login_required
def get_story(story_id):
    """Get a specific story"""
    try:
        story = Story.query.filter_by(id=story_id, user_id=current_user.id).first()
        
        if not story:
            return jsonify({'error': 'Story not found'}), 404
        
        return jsonify({'story': story.to_dict()}), 200
    
    except Exception as e:
        print(f"Error fetching story: {e}")
        return jsonify({'error': 'Failed to fetch story'}), 500


@app.route('/api/library/stories/<int:story_id>', methods=['DELETE'])
@login_required
def delete_story(story_id):
    """Delete a story"""
    try:
        story = Story.query.filter_by(id=story_id, user_id=current_user.id).first()
        
        if not story:
            return jsonify({'error': 'Story not found'}), 404
        
        db.session.delete(story)
        db.session.commit()
        
        return jsonify({'message': 'Story deleted successfully'}), 200
    
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting story: {e}")
        return jsonify({'error': 'Failed to delete story'}), 500


@app.route('/api/library/stories/<int:story_id>', methods=['PUT'])
@login_required
def update_story(story_id):
    """Update a story's content"""
    try:
        story = Story.query.filter_by(id=story_id, user_id=current_user.id).first()
        
        if not story:
            return jsonify({'error': 'Story not found'}), 404
        
        data = request.json
        
        # Update only provided fields
        if 'title' in data:
            story.title = data['title']
        if 'content' in data:
            story.content = data['content']
        if 'genre' in data:
            story.genre = data['genre']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Story updated successfully',
            'story': story.to_dict()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        print(f"Error updating story: {e}")
        return jsonify({'error': 'Failed to update story'}), 500


@app.route('/api/user/stats', methods=['GET'])
@login_required
def get_user_stats():
    """Get user's usage statistics"""
    try:
        return jsonify({
            'storiesGenerated': current_user.stories_generated,
            'currentStreak': current_user.current_streak,
            'longestStreak': current_user.longest_streak,
            'totalStoriesSaved': Story.query.filter_by(user_id=current_user.id).count()
        }), 200
    
    except Exception as e:
        print(f"Error fetching stats: {e}")
        return jsonify({'error': 'Failed to fetch statistics'}), 500


@app.route('/api/user/activity', methods=['POST'])
@login_required
def update_activity():
    """Update user activity and streak"""
    try:
        from datetime import timedelta
        
        now = datetime.utcnow()
        last_activity = current_user.last_activity
        
        # Check if this is a new day
        if last_activity:
            days_diff = (now.date() - last_activity.date()).days
            
            if days_diff == 1:
                # Continue streak
                current_user.current_streak += 1
                if current_user.current_streak > current_user.longest_streak:
                    current_user.longest_streak = current_user.current_streak
            elif days_diff > 1:
                # Streak broken
                current_user.current_streak = 1
        else:
            # First activity
            current_user.current_streak = 1
        
        current_user.stories_generated += 1
        current_user.last_activity = now
        
        db.session.commit()
        
        return jsonify({
            'storiesGenerated': current_user.stories_generated,
            'currentStreak': current_user.current_streak,
            'longestStreak': current_user.longest_streak
        }), 200
    
    except Exception as e:
        db.session.rollback()
        print(f"Error updating activity: {e}")
        return jsonify({'error': 'Failed to update activity'}), 500


if __name__ == '__main__':
    # Create tables
    with app.app_context():
        db.create_all()
    
    app.run(debug=True, host='0.0.0.0', port=5000)
