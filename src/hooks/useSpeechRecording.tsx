import { useState, useRef, useCallback, useEffect } from 'react';

export type RecordingState = 'idle' | 'requesting' | 'recording' | 'stopping';

interface UseSpeechRecordingReturn {
  recordingState: RecordingState;
  isRecording: boolean;
  audioLevel: number;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  error: string | null;
}

export function useSpeechRecording(): UseSpeechRecordingReturn {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const cleanup = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    mediaRecorderRef.current = null;
    setAudioLevel(0);
    chunksRef.current = [];
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setRecordingState('requesting');

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
          channelCount: 1
        } 
      });

      streamRef.current = stream;

      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0.8;
      source.connect(analyserRef.current);

      const mimeTypes = [
        'audio/wav',
        'audio/webm',
        'audio/webm;codecs=opus',
        'audio/mp4',
        'audio/ogg;codecs=opus',
      ];

      let selectedMimeType = 'audio/webm';
      
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          break;
        }
      }

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: selectedMimeType,
        audioBitsPerSecond: 128000
      });

      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstart = () => {
        setRecordingState('recording');
      };

      mediaRecorderRef.current.onerror = (event) => {
        setError('Recording failed. Please try again.');
        cleanup();
        setRecordingState('idle');
      };

      mediaRecorderRef.current.start(250);

      const updateAudioLevel = () => {
        if (!analyserRef.current) return;
        
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i] * dataArray[i];
        }
        const rms = Math.sqrt(sum / dataArray.length);
        const normalizedLevel = Math.min(rms / 128, 1);
        
        setAudioLevel(normalizedLevel);
        animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
      };
      updateAudioLevel();

    } catch (err) {
      console.error('Error starting recording:', err);
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Microphone access denied. Please allow microphone permissions.');
        } else if (err.name === 'NotFoundError') {
          setError('No microphone found. Please connect a microphone.');
        } else {
          setError(`Unable to access microphone: ${err.message}`);
        }
      } else {
        setError('Unable to access microphone. Please check permissions.');
      }
      cleanup();
      setRecordingState('idle');
    }
  }, [cleanup]);

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || recordingState !== 'recording') {
        resolve(null);
        return;
      }

      setRecordingState('stopping');

      mediaRecorderRef.current.onstop = () => {
        const actualMimeType = mediaRecorderRef.current?.mimeType || 'audio/wav';
        const audioBlob = new Blob(chunksRef.current, { type: actualMimeType });
        
        cleanup();
        setRecordingState('idle');
        resolve(audioBlob);
      };

      mediaRecorderRef.current.stop();
    });
  }, [recordingState, cleanup]);

  return {
    recordingState,
    isRecording: recordingState === 'recording',
    audioLevel,
    startRecording,
    stopRecording,
    error,
  };
} 