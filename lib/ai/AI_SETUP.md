# AI_SETUP

**Project Overview**: AI service and integration utilities

---

# AI Provider Setup Guide

This guide explains how to set up AI providers for the Tether learning platform. The system includes multiple AI providers with automatic fallback to ensure the application works even without API keys.

## 🎉 Recommended: Google Gemini (100% Free!)

**Gemini is now the primary AI provider** - it's completely free, requires no credit card, and offers multiple powerful models.

### Quick Setup (2 minutes)
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Copy your API key
4. Add to `.env.local`:
   ```bash
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

## Environment Variables

Create a `.env.local` file in the project root with the following variables:

```bash
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# AI Provider API Keys (Optional - fallback system will work without these)
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
OLLAMA_BASE_URL=http://localhost:11434

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## AI Providers

### 1. Google Gemini (Primary - FREE!)
- **Cost**: 100% Free, no credit card required
- **Setup**: Get API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
- **Models**: 
  - `gemini-2.5-pro` - Most powerful for complex reasoning
  - `gemini-2.5-flash` - Newest multimodal model
  - `gemini-2.5-flash-lite` - Fastest and most cost-efficient
  - `gemini-2.5-flash-image` - Image generation
- **Best for**: Everything! Structured output, multimodal, reasoning
- **Features**: JSON schema validation, embeddings, multiple specialized models

### 2. OpenAI
- **Cost**: Pay-per-use
- **Setup**: Get API key from [OpenAI Platform](https://platform.openai.com/)
- **Models**: GPT-3.5-turbo, GPT-4
- **Best for**: High-quality responses, complex reasoning

### 3. Anthropic Claude
- **Cost**: Pay-per-use
- **Setup**: Get API key from [Anthropic Console](https://console.anthropic.com/)
- **Models**: Claude-3-haiku, Claude-3-sonnet
- **Best for**: Long-form content, analysis

### 4. Hugging Face (Free Tier Available)
- **Cost**: Free tier available, paid plans for higher usage
- **Setup**: Get API key from [Hugging Face](https://huggingface.co/settings/tokens)
- **Models**: Various open-source models
- **Best for**: Cost-effective alternative

### 5. Ollama (Local AI)
- **Cost**: Free (runs locally)
- **Setup**: Install [Ollama](https://ollama.ai/) and pull a model
- **Models**: Llama2, CodeLlama, Mistral, etc.
- **Best for**: Privacy, offline usage

### 6. Fallback Provider (Always Available)
- **Cost**: Free
- **Setup**: No setup required
- **Models**: Rule-based responses
- **Best for**: Basic functionality when AI providers are unavailable

## Provider Priority

The system tries providers in this order:
1. **Gemini** (if API key provided) - Primary choice
2. OpenAI (if API key provided)
3. Anthropic (if API key provided)
4. Hugging Face (if API key provided)
5. Ollama (if running locally)
6. Fallback Provider (always available)

## Testing the Setup

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to the AI test component (if available) or create flashcards

3. Check the browser console for provider availability logs

## Free Options for MVP

### Option 1: Hugging Face (Recommended)
1. Sign up at [Hugging Face](https://huggingface.co/)
2. Go to Settings > Access Tokens
3. Create a new token
4. Add `HUGGINGFACE_API_KEY=your_token_here` to `.env.local`

### Option 2: Ollama (Local)
1. Install [Ollama](https://ollama.ai/)
2. Pull a model: `ollama pull llama2`
3. Add `OLLAMA_BASE_URL=http://localhost:11434` to `.env.local`
4. Start Ollama: `ollama serve`

### Option 3: Fallback Only
- No setup required
- Basic educational responses
- Perfect for MVP demonstration

## Troubleshooting

### Common Issues

1. **"All AI providers are currently unavailable"**
   - Check if any API keys are provided
   - Verify API keys are correct
   - Check network connectivity

2. **Hugging Face errors**
   - Ensure the model is available
   - Check API key permissions
   - Some models may be rate-limited

3. **Ollama connection failed**
   - Ensure Ollama is running: `ollama serve`
   - Check if the model is pulled: `ollama list`
   - Verify the base URL is correct

### Debug Mode

Add this to your component to see provider status:
```typescript
import { aiService } from '@/lib/ai/service';

console.log('Available providers:', aiService.getAvailableProviders());
```

## Features Available

### With AI Providers
- Intelligent flashcard generation
- Topic analysis and suggestions
- Content-based flashcard creation
- Learning style adaptation
- Study tips and strategies

### With Fallback Only
- Basic educational responses
- Pre-defined flashcard templates
- Simple topic analysis
- Study technique suggestions

## Next Steps

1. Choose your preferred free option (Hugging Face recommended)
2. Set up the environment variables
3. Test the flashcard generation
4. Customize the fallback responses if needed
5. Consider upgrading to paid providers for production use
