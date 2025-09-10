import React from "react";
import { voiceConfig } from './voiceConfig';

interface VoiceButtonProps {
  onTranscript?: (transcript: string) => void;
  onAudioResponse?: (audioBase64: string) => void;
  onError?: (error: string) => void;
  className?: string;
  backendUrl?: string;
}

export function VoiceButton({ 
  onTranscript, 
  onAudioResponse, 
  onError, 
  className = '',
  backendUrl = voiceConfig.backendUrl
}: VoiceButtonProps) {
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const chunksRef = React.useRef<BlobPart[]>([]);
  const [recording, setRecording] = React.useState(false);
  const [status, setStatus] = React.useState<string>("");
  const [replyText, setReplyText] = React.useState<string>("");
  const [transcriptText, setTranscriptText] = React.useState<string>("");
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  async function start() {
    try {
      setStatus("Requesting mic...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // MediaRecorder will produce webm/opus chunks in most browsers
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });

      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstart = () => {
        setRecording(true);
        setStatus("Recording...");
      };
      mr.start();
      mediaRecorderRef.current = mr;
    } catch (error: any) {
      setStatus("Microphone access denied");
      onError?.(error.message);
    }
  }

  async function stop() {
    const mr = mediaRecorderRef.current;
    if (!mr) return;
    
    setStatus("Stopping...");

    await new Promise<void>((resolve) => {
      mr.onstop = () => resolve();
      mr.stop();
    });

    setRecording(false);
    setStatus("Processing...");

    const blob = new Blob(chunksRef.current, { type: "audio/webm" });
    
    // Convert blob to base64
    const arrayBuffer = await blob.arrayBuffer();
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    try {
      // Send to gojo-bot backend
      const res = await fetch(`${backendUrl}/api/voice/process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ audio: base64Audio }),
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      
              if (data.success) {
          setTranscriptText(data.transcript || "");
          setReplyText(data.llmResponse || "");
          
          onTranscript?.(data.transcript || "");
          onAudioResponse?.(data.audio || "");

          if (data.audio) {
            // Play the synthesized audio
            const source = `data:audio/mpeg;base64,${data.audio}`;
            if (!audioRef.current) {
              audioRef.current = new Audio();
            }
            audioRef.current.src = source;
            await audioRef.current.play();
          }

        setStatus("Completed");
      } else {
        throw new Error(data.error || "Processing failed");
      }
    } catch (error: any) {
      setStatus("Error");
      onError?.(error.message);
    }
  }

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <button
        onMouseDown={start}
        onMouseUp={stop}
        onTouchStart={start}
        onTouchEnd={stop}
        disabled={recording}
        className="px-6 py-3 rounded-full bg-blue-600 text-white disabled:opacity-50 hover:bg-blue-700 transition-colors duration-200 shadow-lg"
      >
        {recording ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
            Listening...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
            Hold to Talk
          </div>
        )}
      </button>
      
      <div className="text-sm text-gray-600">{status}</div>
      
      {transcriptText && (
        <div className="w-full max-w-md p-3 bg-gray-100 rounded-lg">
          <div className="text-sm font-medium text-gray-700 mb-1">You said:</div>
          <div className="text-sm text-gray-600">{transcriptText}</div>
        </div>
      )}
      
      {replyText && (
        <div className="w-full max-w-md p-3 bg-blue-50 rounded-lg">
          <div className="text-sm font-medium text-blue-700 mb-1">Assistant:</div>
          <div className="text-sm text-blue-600">{replyText}</div>
        </div>
      )}
    </div>
  );
}