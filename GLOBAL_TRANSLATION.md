# 🌍 Global Translation Feature

## Overview
StoryLoom now has a **global language selector** that translates everything in the app at once:
- ✅ Story content
- ✅ Quiz questions and answers
- ✅ Flashcard words, definitions, and examples

## How It Works

### 1. Language Selector Location
The language selector appears in the **header/navigation bar** (desktop and mobile) when you have a story loaded.

```
┌──────────────────────────────────────────┐
│ 📚 StoryLoom    Home  About  🌍 [English▼]│
└──────────────────────────────────────────┘
```

### 2. What Gets Translated

When you select a language (e.g., Spanish):

**Story Page:**
```
Original: "Once upon a time..."
Spanish:  "Érase una vez..."
```

**Quiz Questions:**
```
Original: "What was the character's name?"
Spanish:  "¿Cuál era el nombre del personaje?"

Options:
A) Sarah → A) Sarah
B) Emma  → B) Emma
C) Lucy  → C) Lucy
D) Anna  → D) Anna
```

**Flashcards:**
```
Front: mysterious → misterioso
Definition: Hard to understand → Difícil de entender
Example: "The mysterious figure..." → "La figura misteriosa..."
```

### 3. User Experience

1. **Generate a story** in English (default)
2. **Click language dropdown** in header
3. **Select your language** (e.g., Spanish, French, Japanese)
4. **Wait 2-3 seconds** while everything translates
5. **Everything is now translated!**
   - Story ✓
   - Quiz ✓  
   - Flashcards ✓

### 4. Switching Back

Simply select "English" from the dropdown to return to the original content.

## Technical Details

### Translation Method
- Uses `deep-translator` library with Google Translate API
- **Does NOT consume Gemini API tokens** 
- Free and fast translations
- Supports 19 languages

### Supported Languages
1. English (en) - Default
2. Spanish (es)
3. French (fr)
4. German (de)
5. Italian (it)
6. Portuguese (pt)
7. Russian (ru)
8. Japanese (ja)
9. Korean (ko)
10. Chinese Simplified (zh-CN)
11. Arabic (ar)
12. Hindi (hi)
13. Turkish (tr)
14. Dutch (nl)
15. Polish (pl)
16. Swedish (sv)
17. Indonesian (id)
18. Thai (th)
19. Vietnamese (vi)

### Performance
- **Story**: Translates in ~1-2 seconds
- **Quiz (5 questions)**: Translates in ~2-3 seconds
- **Flashcards (5 cards)**: Translates in ~1-2 seconds
- **Total**: ~5-7 seconds for everything

### Translation Flow
```
User selects language
    ↓
API calls (parallel):
  - Translate story content
  - Translate each quiz question
  - Translate each quiz option
  - Translate each flashcard (word + definition + example)
    ↓
Store translations in state
    ↓
UI updates automatically
```

## Benefits

### 1. Language Learning 🎓
- Read stories in your target language
- Learn vocabulary in that language
- Practice comprehension with translated quizzes

### 2. Accessibility 🌐
- Makes content available to non-English speakers
- Helps multilingual families
- Great for ESL/EFL students

### 3. Consistency ✨
- No confusion about which parts are translated
- One setting controls everything
- Clear visual indicator in header

### 4. Token Efficiency 💰
- Uses Google Translate (free)
- Saves Gemini API tokens for story generation
- No extra cost for translations

## UI Elements

### Desktop Header
```
┌────────────────────────────────────────────────┐
│ 📚 StoryLoom    Home  About  [🌍 English ▼] 🔄 │
└────────────────────────────────────────────────┘
```
- 🌍 = Language icon
- 🔄 = Loading spinner (when translating)

### Mobile Menu
```
┌──────────────┐
│ 📚 StoryLoom │
│ ☰ Menu       │
└──────────────┘

Expanded:
┌─────────────────┐
│ Home            │
│ About           │
│ 🌍 [English ▼]  │
└─────────────────┘
```

## Example Use Cases

### Case 1: Spanish Learner
1. Generate an Adventure story (Kids level)
2. Select "Spanish" from header
3. Read story in Spanish
4. Take quiz in Spanish to test comprehension
5. Learn Spanish vocabulary with flashcards

### Case 2: Multilingual Family
1. Parent generates a story for child
2. Switches between languages as needed
3. Child reads in native language
4. Parents help with comprehension

### Case 3: ESL Student
1. Read story in English first
2. Switch to native language (e.g., Arabic)
3. Compare translations to learn
4. Practice with quiz in both languages

## Code Structure

### State Management
```typescript
const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
const [translatedStory, setTranslatedStory] = useState<string>('');
const [translatedQuiz, setTranslatedQuiz] = useState<Array<{...}>>([]);
const [translatedFlashcards, setTranslatedFlashcards] = useState<Flashcard[]>([]);
```

### Translation Handler
```typescript
const handleGlobalTranslation = async (language: string) => {
  // If English, reset translations
  if (language === 'en') { /* reset */ }
  
  // Translate story
  const storyResult = await storyApi.translate({...});
  
  // Translate quiz (all questions + options in parallel)
  const quizTranslations = await Promise.all([...]);
  
  // Translate flashcards (if exist)
  const flashcardTranslations = await Promise.all([...]);
};
```

## Future Enhancements

Possible additions:
- [ ] Cache translations to avoid re-translating
- [ ] Translate UI labels/buttons
- [ ] Add more languages
- [ ] Save preferred language in localStorage
- [ ] Pronunciation audio for vocabulary
- [ ] Side-by-side view (original + translation)

---

**Enjoy reading in any language!** 🌍✨
