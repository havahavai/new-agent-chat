import React from "react";
import { voiceConfig } from './voiceConfig';
import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useVoiceStreamWithCheck } from "@/hooks/useVoiceStreamWithCheck";
import { v4 as uuidv4 } from "uuid";
import { Message } from "@langchain/langgraph-sdk";

interface ChatVoiceButtonProps {
  onTranscript?: (transcript: string) => void;
  onAudioResponse?: (audioBase64: string) => void;
  onError?: (error: string) => void;
  className?: string;
  backendUrl?: string;
}

export function ChatVoiceButton({ 
  onTranscript, 
  onAudioResponse, 
  onError, 
  className = '',
  backendUrl = voiceConfig.backendUrl
}: ChatVoiceButtonProps) {
  const [isProcessingVoice, setIsProcessingVoice] = React.useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = React.useState(false);
  const [lastProcessedMessageId, setLastProcessedMessageId] = React.useState<string | null>(null);
  const [vadState, setVadState] = React.useState<'idle' | 'listening' | 'speaking' | 'error'>('idle');
  const [error, setError] = React.useState<string | null>(null);
  
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const vadRef = React.useRef<any>(null);
  
  // Use streaming context with helpful error messages
  const voiceStream = useVoiceStreamWithCheck();

  // Handle TTS output for audio playback
  React.useEffect(() => {
    if (!voiceStream?.values || voiceStream.isLoading) {
      return;
    }

    if (voiceStream.values.ttsOutput && voiceStream.values.ttsOutput.audioData) {
      const ttsOutput = voiceStream.values.ttsOutput;
      const currentTtsId = `tts_${voiceStream.messages.length}_${ttsOutput.audioData.length}`;
      
      if (currentTtsId !== lastProcessedMessageId) {
        setLastProcessedMessageId(currentTtsId);
        playAudioFromBase64(ttsOutput.audioData).catch(error => {
          console.error('Error playing TTS audio:', error);
        });
      }
    }
  }, [voiceStream?.values?.ttsOutput, voiceStream?.isLoading, lastProcessedMessageId]);

  // Handle errors
  React.useEffect(() => {
    if (error) {
      toast.error("Voice detection failed", {
        description: error,
      });
    }
  }, [error]);

  const playAudioFromBase64 = async (base64Audio: string) => {
    if (isPlayingAudio) {
      return;
    }

    try {
      setIsPlayingAudio(true);
      
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const audioBlob = new Blob([bytes], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);

      const audio = new Audio();
      audioRef.current = audio;
      
      audio.onended = () => {
        setIsPlayingAudio(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.onerror = (e) => {
        console.error('Audio error:', e);
        setIsPlayingAudio(false);
        toast.error("Failed to play audio response");
      };

      audio.src = audioUrl;
      await audio.play();
      toast.success("Playing response");
      
    } catch (error) {
      console.error('Error playing audio from base64:', error);
      setIsPlayingAudio(false);
      
      if (error instanceof Error && error.name === 'NotAllowedError') {
        toast.info("Audio ready to play", {
          description: "Click the record button to enable audio playback",
          duration: 3000,
        });
      } else {
        toast.error("Failed to play audio response");
      }
    }
  };

  const stopAudioPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlayingAudio(false);
    }
  };

  const convertFloat32ArrayToBase64 = async (audioData: Float32Array): Promise<string> => {
    // Convert Float32Array to WAV format
    const sampleRate = 16000; // VAD uses 16kHz
    const length = audioData.length;
    const buffer = new ArrayBuffer(44 + length * 2);
    const view = new DataView(buffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * 2, true);
    
    // Convert float32 to int16
    let offset = 44;
    for (let i = 0; i < length; i++) {
      const sample = Math.max(-1, Math.min(1, audioData[i]));
      view.setInt16(offset, sample * 0x7FFF, true);
      offset += 2;
    }
    
    // Convert to base64
    const uint8Array = new Uint8Array(buffer);
    const chunkSize = 8192;
    let binaryString = '';
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.slice(i, i + chunkSize);
      binaryString += String.fromCharCode(...chunk);
    }
    
    return btoa(binaryString);
  };

  const handleSpeechEnd = async (audioData: Float32Array) => {
    if (voiceStream?.isLoading || isProcessingVoice) return;
    
    setIsProcessingVoice(true);
    
    try {
      // Convert Float32Array to base64
      const base64Audio = await convertFloat32ArrayToBase64(audioData);
      
      // Use streaming approach
      voiceStream.submit(
        { 
          audioInput: {
            audioData: base64Audio,
            mimeType: 'audio/wav',
            size: audioData.length * 4 // 4 bytes per float32
          }
        },
        {
          streamMode: ["values"],
          optimisticValues: (prev: any) => ({
            ...prev,
            messages: [
              ...(prev.messages ?? []),
              {
                id: uuidv4(),
                type: "human",
                content: "🎤 Voice message (auto-detected)",
              } as Message,
            ],
          }),
        },
      );

      toast.success("Voice message sent!", {
        description: "Processing your request...",
      });
      
    } catch (error) {
      console.error('Error processing voice recording:', error);
      toast.error("Failed to process voice recording", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsProcessingVoice(false);
    }
  };

  const startVAD = async () => {
    try {
      setError(null);
      setVadState('listening');

      if (!window.vad || !window.vad.MicVAD) {
        throw new Error('VAD library not loaded');
      }

      vadRef.current = await window.vad.MicVAD.new({
        onSpeechStart: () => {
          console.log("Speech start detected");
          setVadState('speaking');
          // Stop audio playback when speech is detected
          // Check if audio is actually playing by examining the audio element
          if (audioRef.current && !audioRef.current.paused && !audioRef.current.ended) {
            stopAudioPlayback();
            toast.info("Audio stopped - listening to you");
          }
        },
        onSpeechEnd: (audio: Float32Array) => {
          console.log("Speech end detected, audio length:", audio.length);
          setVadState('listening');
          handleSpeechEnd(audio);
        },
        onVADMisfire: () => {
          console.log("VAD misfire detected");
        },
        onnxWASMBasePath: "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/",
        baseAssetPath: "https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.27/dist/",
        // minSpeechFrames: 3,
        // preSpeechPadFrames: 1,
        // postSpeechPadFrames: 1,
        // redemptionFrames: 8,
        // frameSamples: 512,
        // positiveSpeechThreshold: 0.5,
        // negativeSpeechThreshold: 0.35,
      });

      vadRef.current.start();

    } catch (err) {
      console.error('Error starting VAD:', err);
      setVadState('error');
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Microphone access denied. Please allow microphone permissions.');
        } else if (err.name === 'NotFoundError') {
          setError('No microphone found. Please connect a microphone.');
        } else {
          setError(`Unable to access microphone: ${err.message}`);
        }
      } else {
        setError('Unable to start voice detection. Please check permissions.');
      }
    }
  };

  const stopVAD = () => {
    if (vadRef.current) {
      try {
        vadRef.current.destroy();
      } catch (err) {
        console.warn('Error destroying VAD:', err);
      }
      vadRef.current = null;
    }
    setVadState('idle');
  };

  const handleToggleVAD = async () => {
    if (isProcessingVoice || voiceStream?.isLoading) return;

    if (vadState === 'idle') {
      await startVAD();
    } else {
      stopVAD();
    }
  };

  const getButtonState = () => {
    if (error) return 'error';
    if (isProcessingVoice || voiceStream?.isLoading) return 'processing';
    if (isPlayingAudio) return 'playing';
    if (vadState === 'speaking') return 'speaking';
    if (vadState === 'listening') return 'listening';
    return 'idle';
  };

  const getButtonIcon = () => {
    const state = getButtonState();
    switch (state) {
      case 'listening':
        return <Mic className="h-4 w-4 text-blue-500" />;
      case 'speaking':
        return <Mic className="h-4 w-4 text-red-500 animate-pulse" />;
      case 'processing':
        return <Mic className="h-4 w-4 animate-pulse" />;
      case 'playing':
        return <Mic className="h-4 w-4 text-green-500" />;
      default:
        return <Mic className="h-4 w-4" />;
    }
  };

  const getButtonText = () => {
    const state = getButtonState();
    switch (state) {
      case 'listening':
        return 'Listening...';
      case 'speaking':
        return 'Speaking';
      case 'processing':
        return 'Processing';
      case 'playing':
        return 'Playing';
      default:
        return vadState === 'idle' ? 'Start' : 'Stop';
    }
  };

  return (
    <div className="relative">
      <audio ref={audioRef} preload="none" className="hidden" />
      
      <Button
        type="button"
        variant={vadState !== 'idle' ? "default" : "outline"}
        size="sm"
        onClick={handleToggleVAD}
        disabled={isProcessingVoice || voiceStream?.isLoading}
        className={`${className} ${vadState === 'speaking' ? 'animate-pulse' : ''}`}
        title={
          vadState !== 'idle'
            ? "Click to stop listening (auto-detects speech)" 
            : "Click to start listening for speech"
        }
      >
        {getButtonIcon()}
        <span className="ml-1 text-xs">{getButtonText()}</span>
      </Button>
      
      {/* Visual indicators */}
      {vadState === 'listening' && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
      )}
      {vadState === 'speaking' && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
      )}
    </div>
  );
} 