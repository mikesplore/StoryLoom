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


class HuggingFaceProvider(AIProvider):
    """Hugging Face Inference API Provider (Free Tier)"""
    
    def __init__(self):
        self.api_key = os.getenv('HUGGINGFACE_API_KEY')
        # Use Zephyr-7B Beta, a strong free-tier chat/instruct model
        self.model_id = "huggingfaceh4/zephyr-7b-beta"
        # Correct API endpoint for this model
        self.api_url = f"https://api-inference.huggingface.co/models/{self.model_id}"
        
    
    def generate_content(self, prompt: str) -> str:
        if not self.api_key:
            raise Exception("Hugging Face API key not configured")
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "inputs": prompt,
            "parameters": {
                "max_new_tokens": 1024,
                "temperature": 0.7,
                "top_p": 0.95
            }
        }
        
        try:
            response = requests.post(
                self.api_url,
                headers=headers,
                json=payload,
                timeout=60
            )
            
            if response.status_code == 503:
                # Model is loading, wait and retry once
                import time
                time.sleep(20)
                response = requests.post(
                    self.api_url,
                    headers=headers,
                    json=payload,
                    timeout=60
                )
            
            response.raise_for_status()
            result = response.json()
            # Zephyr and most Hugging Face instruct models return {'generated_text': ...} or a list of such dicts
            if isinstance(result, list) and len(result) > 0 and 'generated_text' in result[0]:
                return result[0]['generated_text']
            elif isinstance(result, dict) and 'generated_text' in result:
                return result['generated_text']
            else:
                raise Exception(f"Unexpected response format: {result}")
                
        except requests.exceptions.RequestException as e:
            raise Exception(f"Hugging Face API request failed: {str(e)}")
    
    def is_available(self) -> bool:
        return self.api_key is not None
    
    @property
    def name(self) -> str:
        return "Hugging Face"


class AIProviderManager:
    """Manages multiple AI providers with automatic fallback"""
    
    def __init__(self):
        # Initialize providers in order of preference
        self.providers = [
            GeminiProvider(),
            HuggingFaceProvider(),
        ]
        
        # Find available providers
        self.available_providers = [p for p in self.providers if p.is_available()]
        
        if not self.available_providers:
            raise Exception(
                "No AI providers available! Please configure at least one API key:\n"
                "- GEMINI_API_KEY for Google Gemini\n"
                "- HUGGINGFACE_API_KEY for Hugging Face"
            )
        
        print(f"\n🤖 Available AI Providers: {[p.name for p in self.available_providers]}")
        print(f"🎯 Primary provider: {self.available_providers[0].name}\n")
    
    def generate_content(self, prompt: str) -> str:
        """
        Generate content using available providers with automatic fallback
        Tries providers in order until one succeeds
        """
        last_error = None
        
        for provider in self.available_providers:
            try:
                print(f"🔄 Trying {provider.name}...")
                result = provider.generate_content(prompt)
                print(f"✅ {provider.name} succeeded")
                return result
            except Exception as e:
                print(f"❌ {provider.name} failed: {str(e)}")
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
