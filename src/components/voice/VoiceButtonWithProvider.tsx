import React from "react";
import { VoiceStreamProvider } from "@/providers/VoiceStream";
import { ChatVoiceButton } from "./ChatVoiceButton";

interface VoiceButtonWithProviderProps {
  onTranscript?: (transcript: string) => void;
  onAudioResponse?: (audioBase64: string) => void;
  onError?: (error: string) => void;
  className?: string;
  backendUrl?: string;
}

export function VoiceButtonWithProvider(props: VoiceButtonWithProviderProps) {
  return (
    <VoiceStreamProvider>
      <ChatVoiceButton {...props} />
    </VoiceStreamProvider>
  );
} 