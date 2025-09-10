# Voice Frontend Setup Guide

This guide explains how to set up and use the voice functionality in the new-agent-chat frontend that communicates with the gojo-bot backend.

## Overview

The frontend voice implementation consists of:
- **VoiceButton** - React component for audio recording and playback
- **VoiceDemo** - Demo page showcasing the voice functionality
- **API Proxy** - Next.js API route that forwards requests to gojo-bot backend

## Architecture

```
Frontend (new-agent-chat) → API Proxy → Backend (gojo-bot) → LangGraph → OpenAI
     ↓                        ↓              ↓                ↓         ↓
VoiceButton → /api/voice/process → gojo-bot → Voice Graph → STT/TTS
```

## Setup Instructions

### 1. Environment Variables

Create or update your `.env.local` file:

```env
# Backend URL for gojo-bot
NEXT_PUBLIC_GOJO_BOT_BACKEND_URL=http://localhost:3001
GOJO_BOT_BACKEND_URL=http://localhost:3001
```

### 2. Start the Backend (gojo-bot)

First, make sure the gojo-bot backend is running:

```bash
cd gojo-bot
npm install
npm run dev
```

The backend should be running on `http://localhost:3001`

### 3. Start the Frontend

```bash
cd new-agent-chat/new-agent-chat
npm install
npm run dev
```

The frontend will be running on `http://localhost:3000`

### 4. Test the Voice Agent

Visit `http://localhost:3000/voice-demo` to test the voice functionality.

## Components

### VoiceButton

A React component that handles audio recording and communication with the backend.

**Props:**
- `onTranscript?: (transcript: string) => void` - Callback for transcript
- `onResponse?: (response: string) => void` - Callback for AI response
- `onError?: (error: string) => void` - Callback for errors
- `className?: string` - Additional CSS classes
- `backendUrl?: string` - Backend URL (defaults to config)

**Usage:**
```tsx
import { VoiceButton } from '@/components/voice/VoiceButton';

<VoiceButton
  onTranscript={(text) => console.log('Transcript:', text)}
  onResponse={(text) => console.log('Response:', text)}
  onError={(error) => console.error('Error:', error)}
  backendUrl="http://localhost:3001"
/>
```

### VoiceDemo

A complete demo page showcasing the voice functionality.

**Access:** `http://localhost:3000/voice-demo`

## API Routes

### POST /api/voice/process

Proxies voice processing requests to the gojo-bot backend.

**Request:**
```json
{
  "audio": "base64_encoded_audio_data"
}
```

**Response:**
```json
{
  "success": true,
  "transcript": "User's speech converted to text",
  "llmResponse": "AI assistant's response",
  "audio": "base64_encoded_synthesized_audio",
  "status": "completed",
  "error": null
}
```

## Configuration

### voiceConfig.ts

Centralized configuration for voice settings:

```typescript
export const voiceConfig = {
  backendUrl: process.env.NEXT_PUBLIC_GOJO_BOT_BACKEND_URL || 'http://localhost:3001',
  audio: {
    mimeType: 'audio/webm',
    sampleRate: 16000,
    channels: 1,
  },
  ui: {
    recordingIndicator: true,
    showTranscript: true,
    showResponse: true,
    autoPlayAudio: true,
  },
  errors: {
    microphoneDenied: 'Microphone access denied...',
    networkError: 'Network error...',
    processingError: 'Voice processing failed...',
    backendUnavailable: 'Backend service unavailable...',
  },
};
```

## File Structure

```
src/
├── app/
│   ├── api/
│   │   └── voice/
│   │       └── process/
│   │           └── route.ts          # API proxy route
│   └── voice-demo/
│       └── page.tsx                  # Demo page
├── components/
│   └── voice/
│       ├── VoiceButton.tsx           # Main voice component
│       ├── VoiceDemo.tsx             # Demo component
│       ├── voiceConfig.ts            # Configuration
│       └── index.ts                  # Exports
```

## Integration with Existing UI

You can integrate the VoiceButton into your existing chat interface:

```tsx
import { VoiceButton } from '@/components/voice/VoiceButton';

// In your chat component
<VoiceButton
  onTranscript={(transcript) => {
    // Add transcript to chat messages
    addMessage({ role: 'user', content: transcript });
  }}
  onResponse={(response) => {
    // Add response to chat messages
    addMessage({ role: 'assistant', content: response });
  }}
  onError={(error) => {
    // Handle errors
    showError(error);
  }}
/>
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure the backend (gojo-bot) is running on the correct port
   - Check that the backend URL is correctly configured

2. **Microphone Access Denied**
   - Ensure the site is served over HTTPS (required for microphone access)
   - Check browser permissions for microphone access

3. **Backend Connection Failed**
   - Verify gojo-bot backend is running on port 3001
   - Check network connectivity between frontend and backend

4. **Audio Playback Issues**
   - Ensure browser supports audio playback
   - Check if autoplay is blocked by browser settings

### Debug Mode

Enable debug logging by setting environment variables:

```env
NODE_ENV=development
DEBUG=voice:*
```

## Production Deployment

### Environment Variables

For production, update your environment variables:

```env
NEXT_PUBLIC_GOJO_BOT_BACKEND_URL=https://your-gojo-bot-backend.com
GOJO_BOT_BACKEND_URL=https://your-gojo-bot-backend.com
```

### CORS Configuration

Ensure your gojo-bot backend allows requests from your frontend domain:

```typescript
// In gojo-bot server.ts
app.use(cors({
  origin: ['https://your-frontend-domain.com'],
  credentials: true
}));
```

## Customization

### Styling

The VoiceButton component uses Tailwind CSS classes. You can customize the appearance by:

1. Modifying the className prop
2. Overriding Tailwind classes
3. Creating custom CSS classes

### Audio Settings

Modify audio settings in `voiceConfig.ts`:

```typescript
audio: {
  mimeType: 'audio/webm', // or 'audio/mp4' for Safari
  sampleRate: 16000,
  channels: 1,
}
```

### Error Messages

Customize error messages in `voiceConfig.ts`:

```typescript
errors: {
  microphoneDenied: 'Your custom microphone error message',
  networkError: 'Your custom network error message',
  // ...
}
``` 