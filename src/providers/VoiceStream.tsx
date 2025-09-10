import React, { createContext, useContext, ReactNode, useState } from "react";
import { useStream } from "@langchain/langgraph-sdk/react";
import { type Message } from "@langchain/langgraph-sdk";

interface SpeechInput {
  audioData: string;
  mimeType?: string;
  size?: number;
}

export interface TTSOutput {
  audioData: string;
  mimeType: string;
  size: number;
}

export type VoiceStateType = { 
  messages: Message[]; 
  audioInput?: SpeechInput;
  ttsOutput?: TTSOutput;
};

const useVoiceStream = useStream<
  VoiceStateType,
  {
    UpdateType: {
      messages?: Message[] | Message | string;
      audioInput?: SpeechInput;
      ttsOutput?: TTSOutput;
    };
  }
>;

type VoiceStreamContextType = ReturnType<typeof useVoiceStream>;
export const VoiceStreamContext = createContext<VoiceStreamContextType | undefined>(undefined);

const VoiceStreamSession = ({
  children,
  apiKey,
  apiUrl,
  assistantId,
}: {
  children: ReactNode;
  apiKey: string | null;
  apiUrl: string;
  assistantId: string;
}) => {
  const streamValue = useVoiceStream({
    apiUrl,
    apiKey: apiKey ?? undefined,
    assistantId,
    threadId: null,
  });

  return (
    <VoiceStreamContext.Provider value={streamValue}>
      {children}
    </VoiceStreamContext.Provider>
  );
};

export const VoiceStreamProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [apiKey, setApiKey] = useState("");
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8123";
  const assistantId = process.env.NEXT_PUBLIC_ASSISTANT_ID || "voiceGraph";
  return (
    <VoiceStreamSession apiKey={apiKey} apiUrl={apiUrl} assistantId={assistantId}>
      {children}
    </VoiceStreamSession>
  );
};

export const useVoiceStreamContext = (): VoiceStreamContextType => {
  const context = useContext(VoiceStreamContext);
  if (context === undefined) {
    throw new Error("useVoiceStreamContext must be used within a VoiceStreamProvider");
  }
  return context;
}; 