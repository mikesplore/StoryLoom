from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime
import json

db = SQLAlchemy()

class User(UserMixin, db.Model):
    """User model for authentication"""
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Usage tracking
    stories_generated = db.Column(db.Integer, default=0)
    last_activity = db.Column(db.DateTime, default=datetime.utcnow)
    current_streak = db.Column(db.Integer, default=0)
    longest_streak = db.Column(db.Integer, default=0)
    
    # Relationship with stories
    stories = db.relationship('Story', backref='author', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        """Convert user to dictionary"""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'storiesGenerated': self.stories_generated,
            'currentStreak': self.current_streak,
            'longestStreak': self.longest_streak,
            'lastActivity': self.last_activity.isoformat() if self.last_activity else None
        }
    
    def __repr__(self):
        return f'<User {self.username}>'


class Story(db.Model):
    """Story model for saving user's generated stories"""
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    genre = db.Column(db.String(50), nullable=False)
    content = db.Column(db.Text, nullable=False)
    age_group = db.Column(db.String(20), nullable=False)
    read_time = db.Column(db.String(20))
    cover_image = db.Column(db.Text)  # Base64 encoded image
    
    # Quiz data stored as JSON
    questions = db.Column(db.Text)  # JSON string of quiz questions
    
    # Flashcards stored as JSON
    flashcards = db.Column(db.Text)  # JSON string of flashcards
    
    # Metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    def to_dict(self):
        """Convert story to dictionary"""
        return {
            'id': self.id,
            'title': self.title,
            'genre': self.genre,
            'content': self.content,
            'ageGroup': self.age_group,
            'readTime': self.read_time,
            'coverImage': self.cover_image,
            'questions': json.loads(self.questions) if self.questions else [],
            'flashcards': json.loads(self.flashcards) if self.flashcards else [],
            'createdAt': self.created_at.isoformat()
        }
    
    def __repr__(self):
        return f'<Story {self.title}>'
