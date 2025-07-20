# Google Perspective API Setup Guide

## Overview
The comments system now uses Google's Perspective API for sophisticated content moderation. This replaces basic pattern matching with machine learning-based detection of toxic content, spam, and inappropriate language.

## Setup Instructions

### 1. Get a Google Cloud API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Perspective API:
   - Go to "APIs & Services" > "Library"
   - Search for "Perspective API"
   - Click "Enable"
4. Create credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the API key

### 2. Configure Environment Variables

Add your API key to your `.env` file:

```bash
# Google Perspective API for content moderation
PERSPECTIVE_API_KEY=your-actual-api-key-here
```

### 3. Production Deployment

For production deployment on Cloudflare Workers:

1. Go to your Cloudflare Dashboard
2. Navigate to Workers & Pages > Your Worker
3. Go to Settings > Environment Variables
4. Add a new variable:
   - Name: `PERSPECTIVE_API_KEY`
   - Value: Your API key
   - Environment: Production

## How It Works

### Content Analysis
The Perspective API analyzes comments for:

- **TOXICITY**: General toxic content
- **SEVERE_TOXICITY**: Highly toxic content
- **IDENTITY_ATTACK**: Attacks on identity groups
- **INSULT**: Insulting language
- **PROFANITY**: Profane language
- **THREAT**: Threatening content
- **SPAM**: Spam content
- **FLIRTATION**: Inappropriate romantic content

### Thresholds
Current thresholds are set to:
- Toxicity: 0.7 (70%)
- Severe Toxicity: 0.5 (50%)
- Identity Attack: 0.6 (60%)
- Insult: 0.7 (70%)
- Profanity: 0.8 (80%)
- Threat: 0.5 (50%)
- Spam: 0.8 (80%)
- Flirtation: 0.9 (90%)

### Fallback Behavior
If the Perspective API is unavailable or not configured:
- Comments will be allowed through
- Errors are logged but don't block content
- Basic validation (length, URLs) still applies

## Benefits

1. **Sophisticated Detection**: ML-based analysis instead of simple pattern matching
2. **Context Awareness**: Understands context and nuance
3. **Multilingual Support**: Works with multiple languages
4. **Continuous Learning**: Google's models improve over time
5. **Configurable Thresholds**: Adjust sensitivity as needed

## Cost

- **Free Tier**: 1,000 requests per day
- **Paid**: $0.10 per 1,000 requests after free tier
- **Typical Usage**: Most small to medium sites stay within free tier

## Testing

You can test the API with various content types:

```bash
# Test with curl
curl -X POST \
  "https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "comment": {
      "text": "This is a test comment"
    },
    "languages": ["en"],
    "requestedAttributes": {
      "TOXICITY": {},
      "SPAM": {}
    }
  }'
```

## Monitoring

Check your API usage in the Google Cloud Console:
- Go to "APIs & Services" > "Dashboard"
- Look for "Perspective API" usage metrics
- Monitor request counts and errors 