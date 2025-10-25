# AI Provider Configuration Guide

StoryLoom supports multiple AI providers with automatic fallback capability. This ensures your app keeps working even if one provider is unavailable.

## Supported Providers

### 1. Google Gemini (Primary - Recommended)
- **Model**: Gemini 2.0 Flash
- **Quality**: Excellent story generation
- **Speed**: Very fast
- **Cost**: Free tier with generous limits
- **Get API Key**: [Google AI Studio](https://makersuite.google.com/app/apikey)

### 2. Hugging Face (Fallback)
- **Model**: Mixtral-8x7B-Instruct-v0.1
- **Quality**: Good story generation
- **Speed**: Good (may have cold start delay)
- **Cost**: Free tier available
- **Get API Key**: [Hugging Face Settings](https://huggingface.co/settings/tokens)

## Configuration

### Option 1: Both Providers (Recommended)
Configure both API keys in your `.env` file for maximum reliability:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
HUGGINGFACE_API_KEY=your_huggingface_token_here
```

**Behavior**: 
- Uses Gemini by default (fastest and best quality)
- Automatically falls back to Hugging Face if Gemini fails
- Zero downtime if one provider has issues

### Option 2: Gemini Only
```bash
GEMINI_API_KEY=your_gemini_api_key_here
# HUGGINGFACE_API_KEY=  # Optional
```

**Behavior**: 
- Uses only Gemini
- Fails if Gemini is unavailable

### Option 3: Hugging Face Only
```bash
# GEMINI_API_KEY=  # Optional
HUGGINGFACE_API_KEY=your_huggingface_token_here
```

**Behavior**: 
- Uses only Hugging Face
- Slightly slower than Gemini
- May have cold start delays (model loading)

## How Fallback Works

1. **Request arrives** for story/quiz/flashcard generation
2. **Try Gemini** (if configured)
   - ✅ Success → Return result
   - ❌ Fail → Continue to step 3
3. **Try Hugging Face** (if configured)
   - ✅ Success → Return result
   - ❌ Fail → Return error

The fallback happens automatically and transparently. Users won't notice which provider is used.

## Monitoring Active Provider

Check which provider is currently active:

```bash
curl http://localhost:5000/api/health
```

Response:
```json
{
  "status": "healthy",
  "message": "Backend is running",
  "ai_provider": "Gemini",
  "available_providers": ["Gemini", "Hugging Face"]
}
```

Console output when starting the backend:
```
✅ Gemini provider initialized
✅ Hugging Face provider initialized with model: mistralai/Mixtral-8x7B-Instruct-v0.1

🤖 Available AI Providers: ['Gemini', 'Hugging Face']
🎯 Primary provider: Gemini
🚀 AI System ready with Gemini as primary provider
```

## Getting API Keys

### Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Get API Key" or "Create API Key"
4. Copy the API key
5. Add to `.env` file

**Free Tier Limits**: 
- 60 requests per minute
- Generous daily quota

### Hugging Face API Token

1. Go to [Hugging Face](https://huggingface.co)
2. Sign up or log in
3. Go to [Settings → Access Tokens](https://huggingface.co/settings/tokens)
4. Click "New token"
5. Give it a name (e.g., "StoryLoom")
6. Select "read" access
7. Copy the token
8. Add to `.env` file

**Free Tier Limits**:
- Rate limits apply
- Cold start delay possible (20 seconds when model is loading)

## Troubleshooting

### Both providers fail
**Error**: "All AI providers failed"

**Solutions**:
1. Check API keys are correct in `.env`
2. Verify API keys have proper permissions
3. Check internet connection
4. Verify Hugging Face model is not rate limited
5. Check console logs for specific error messages

### Hugging Face timeout
**Error**: "Model is loading"

**Solution**: The system automatically waits 20 seconds and retries once. If still failing, the model may be under heavy load. Try again later or use Gemini.

### Slow responses
**Cause**: Hugging Face may have cold starts

**Solutions**:
- Use Gemini for faster responses
- First request to Hugging Face may take longer (model loading)
- Subsequent requests will be faster

## Code Architecture

The multi-provider system is implemented in `backend/ai_providers.py`:

- **AIProvider** (Abstract Base Class)
  - Defines interface for all providers
  - `generate_content(prompt)` - Generate AI content
  - `is_available()` - Check if provider is configured
  - `name` - Provider name

- **GeminiProvider** (Concrete Implementation)
  - Wraps Google Gemini API
  - Fast and reliable

- **HuggingFaceProvider** (Concrete Implementation)
  - Wraps Hugging Face Inference API
  - Handles cold starts automatically

- **AIProviderManager** (Orchestrator)
  - Manages multiple providers
  - Implements fallback logic
  - Used by Flask routes in `app.py`

## Adding New Providers

To add a new AI provider:

1. Create a new class inheriting from `AIProvider` in `ai_providers.py`
2. Implement required methods:
   - `generate_content(prompt)` 
   - `is_available()`
   - `name` property
3. Add to `AIProviderManager.__init__()` providers list
4. Add API key to `.env.example`
5. Update documentation

Example:
```python
class OpenAIProvider(AIProvider):
    def __init__(self):
        self.api_key = os.getenv('OPENAI_API_KEY')
    
    def generate_content(self, prompt: str) -> str:
        # Implementation here
        pass
    
    def is_available(self) -> bool:
        return self.api_key is not None
    
    @property
    def name(self) -> str:
        return "OpenAI"
```

Then add to manager:
```python
self.providers = [
    GeminiProvider(),
    HuggingFaceProvider(),
    OpenAIProvider(),  # New provider
]
```
