export const voiceConfig = {
  // Backend URL for gojo-bot
  backendUrl: process.env.NEXT_PUBLIC_GOJO_BOT_BACKEND_URL || 'http://localhost:2024',
  
  // Audio settings
  audio: {
    mimeType: 'audio/webm',
    sampleRate: 16000,
    channels: 1,
  },
  
  // UI settings
  ui: {
    recordingIndicator: true,
    showTranscript: true,
    showResponse: true,
    autoPlayAudio: true,
  },
  
  // Error messages
  errors: {
    microphoneDenied: 'Microphone access denied. Please allow microphone access and try again.',
    networkError: 'Network error. Please check your connection and try again.',
    processingError: 'Voice processing failed. Please try again.',
    backendUnavailable: 'Backend service unavailable. Please try again later.',
  },
}; 