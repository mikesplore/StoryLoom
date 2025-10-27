"""
AI Provider Abstraction Layer
Supports multiple AI providers with automatic fallback
"""

import os
import json
import requests
from abc import ABC, abstractmethod
from typing import Optional, Dict, Any
import google.generativeai as genai

class AIProvider(ABC):
    """Abstract base class for AI providers"""
    @abstractmethod
    def generate_content(self, prompt: str) -> str:
        pass
    @abstractmethod
    def is_available(self) -> bool:
        pass
    @property
    @abstractmethod
    def name(self) -> str:
        pass

class GitHubModelProvider(AIProvider):
    """GitHub Models Provider - Generic class for any GitHub-hosted model"""
    def __init__(self, model_name: str, display_name: str, temperature: float = 0.8, top_p: float = 0.1, max_tokens: int = 2048):
        self.api_key = os.getenv('GITHUB_TOKEN')
        self.api_url = "https://models.github.ai/inference/chat/completions"
        self.model = model_name
        self.display_name = display_name
        self.temperature = temperature
        self.top_p = top_p
        self.max_tokens = max_tokens
        if self.api_key:
            print(f"✅ {self.display_name} provider initialized")
        else:
            print("⚠️  GITHUB_TOKEN not found")

    def generate_content(self, prompt: str) -> str:
        if not self.api_key:
            raise Exception("GITHUB_TOKEN not configured")
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": "You are a creative storyteller."},
                {"role": "user", "content": prompt}
            ],
            "max_tokens": self.max_tokens,
            "temperature": self.temperature,
            "top_p": self.top_p
        }
        try:
            response = requests.post(
                self.api_url,
                headers=headers,
                json=payload,
                timeout=60
            )
            response.raise_for_status()
            result = response.json()
            if (
                isinstance(result, dict)
                and "choices" in result
                and isinstance(result["choices"], list)
                and len(result["choices"]) > 0
                and "message" in result["choices"][0]
                and "content" in result["choices"][0]["message"]
            ):
                return result["choices"][0]["message"]["content"]
            else:
                raise Exception(f"Unexpected response format: {result}")
        except requests.exceptions.RequestException as e:
            raise Exception(f"{self.display_name} API request failed: {str(e)}")

    def is_available(self) -> bool:
        return self.api_key is not None

    @property
    def name(self) -> str:
        return self.display_name

"""
AI Provider Abstraction Layer
Supports multiple AI providers with automatic fallback
"""

import os
import json
import requests
from abc import ABC, abstractmethod
from typing import Optional, Dict, Any
import google.generativeai as genai


class AIProvider(ABC):
    """Abstract base class for AI providers"""
    
    @abstractmethod
    def generate_content(self, prompt: str) -> str:
        """Generate content based on the prompt"""
        pass
    
    @abstractmethod
    def is_available(self) -> bool:
        """Check if the provider is available (API key configured)"""
        pass
    
    @property
    @abstractmethod
    def name(self) -> str:
        """Provider name"""
        pass


class GeminiProvider(AIProvider):
    """Google Gemini AI Provider"""
    
    def __init__(self):
        self.api_key = os.getenv('GEMINI_API_KEY')
        self._model = None
        if self.api_key:
            try:
                genai.configure(api_key=self.api_key)
                self._model = genai.GenerativeModel('gemini-2.0-flash')
             
            except Exception as e:
                print(f"⚠️  Gemini provider initialization failed: {e}")
                self._model = None
    
    def generate_content(self, prompt: str) -> str:
        if not self._model:
            raise Exception("Gemini model not initialized")
        
        response = self._model.generate_content(prompt)
        return response.text
    
    def is_available(self) -> bool:
        return self._model is not None and self.api_key is not None
    
    @property
    def name(self) -> str:
        return "Gemini"


class AIProviderManager:
    """Manages multiple AI providers with automatic fallback"""
    
    def __init__(self):
        # Initialize providers in order of preference (all GitHub Models + Gemini)
        self.providers = [
            # GitHub Models - Free tier with various models as fallbacks
            GitHubModelProvider("openai/gpt-5", "GPT-5", temperature=1, top_p=1, max_tokens=16384),
            GitHubModelProvider("openai/gpt-5-chat", "GPT-5 Chat", temperature=1, top_p=1, max_tokens=16384),
            GitHubModelProvider("openai/gpt-5-mini", "GPT-5 Mini", temperature=1, top_p=1, max_tokens=8192),
            GitHubModelProvider("openai/gpt-4.1-nano", "GPT-4.1 Nano", temperature=1, top_p=1, max_tokens=4096),
            GitHubModelProvider("xai/grok-3", "Grok-3", temperature=1, top_p=1, max_tokens=8192),
            GitHubModelProvider("meta/Llama-4-Maverick-17B-128E-Instruct-FP8", "Llama-4 Maverick", temperature=0.8, top_p=0.1, max_tokens=2048),
            GitHubModelProvider("deepseek/DeepSeek-V3-0324", "DeepSeek-V3", temperature=0.8, top_p=0.1, max_tokens=2048),
            GitHubModelProvider("cohere/cohere-command-a", "Cohere Command-A", temperature=0.8, top_p=0.1, max_tokens=2048),
            # Gemini as final fallback (if configured)
            GeminiProvider(),
        ]
        
        # Find available providers
        self.available_providers = [p for p in self.providers if p.is_available()]
        
        if not self.available_providers:
            raise Exception(
                "No AI providers available! Please configure at least one API key:\n"
                "- GITHUB_TOKEN for GitHub Models\n"
                "- GEMINI_API_KEY for Google Gemini")
        
        print(f"\n🤖 Available AI Providers: {[p.name for p in self.available_providers]}")
        print(f"🎯 Primary provider: {self.available_providers[0].name}\n")
    
    def generate_content(self, prompt: str) -> str:
        """
        Generate content using available providers with automatic fallback
        Tries providers in order until one succeeds
        Returns tuple: (content, provider_name)
        """
        last_error = None
        
        for provider in self.available_providers:
            try:
                print(f"🔄 Trying {provider.name}...")
                result = provider.generate_content(prompt)
                print(f"✅ Story generated by: {provider.name}")
                # Return result with model name embedded in a comment (for logging)
                return result
            except Exception as e:
                error_msg = str(e)
                print(f"❌ {provider.name} failed: {error_msg}")
                # Check if it's a rate limit error (429) - continue to next provider
                if "429" in error_msg or "Too Many Requests" in error_msg:
                    print(f"⏭️  Rate limit hit, trying next provider...")
                last_error = e
                continue
        
        # All providers failed
        raise Exception(
            f"All AI providers failed. Last error: {str(last_error)}"
        )
    
    def get_current_provider(self) -> str:
        """Get the name of the current primary provider"""
        if self.available_providers:
            return self.available_providers[0].name
        return "None"
