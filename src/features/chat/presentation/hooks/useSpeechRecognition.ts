import { useCallback, useEffect, useRef, useState } from 'react';

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  isSupported: boolean;
  startListening: () => Promise<void>;
  stopListening: () => void;
  toggleListening: () => Promise<void>;
}

const SpeechRecognitionAPI =
  typeof window !== 'undefined' &&
  (window.SpeechRecognition || window.webkitSpeechRecognition);

let nativeModule: any = null;
let nativeEvents = false;

try {
  const mod = require('expo-speech-recognition');
  if (mod.ExpoSpeechRecognitionModule) {
    mod.ExpoSpeechRecognitionModule.getStateAsync();
    nativeModule = mod.ExpoSpeechRecognitionModule;
    nativeEvents = true;
  }
} catch {}

export const useSpeechRecognition = (
  onTranscript: (text: string) => void
): UseSpeechRecognitionReturn => {
  const [isListening, setIsListening] = useState(false);
  const webRef = useRef<SpeechRecognition | null>(null);
  const listenerRef = useRef<{ remove: () => void } | null>(null);

  useEffect(() => {
    if (nativeModule) {
      const onResult = (event: any) => {
        if (event.results?.[0]?.transcript) {
          onTranscript(event.results[0].transcript);
        }
      };
      const onStart = () => setIsListening(true);
      const onEnd = () => setIsListening(false);
      const onError = (event: any) => {
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          console.warn(event.message);
        }
        setIsListening(false);
      };

      try {
        const sub = nativeModule.addListener('result', onResult);
        listenerRef.current = sub;
      } catch {}

      try {
        nativeModule.addListener('start', onStart);
        nativeModule.addListener('end', onEnd);
        nativeModule.addListener('error', onError);
      } catch {}
    } else if (SpeechRecognitionAPI) {
      const recognition = new SpeechRecognitionAPI();
      recognition.lang = 'es-EC';
      recognition.interimResults = true;
      recognition.continuous = false;
      recognition.onresult = (event) => {
        onTranscript(event.results[0][0].transcript);
      };
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      webRef.current = recognition;
    }

    return () => {
      listenerRef.current?.remove();
      webRef.current?.abort();
      webRef.current = null;
    };
  }, [onTranscript]);

  const startListening = useCallback(async () => {
    if (nativeModule) {
      try {
        const perm = await nativeModule.requestPermissionsAsync();
        if (!perm.granted) return;
        nativeModule.start({
          lang: 'es-EC',
          interimResults: true,
          addsPunctuation: true,
        });
      } catch {}
    } else if (webRef.current) {
      try {
        webRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    if (nativeModule) {
      nativeModule.stop();
    } else {
      webRef.current?.stop();
      setIsListening(false);
    }
  }, []);

  const toggleListening = useCallback(async () => {
    if (isListening) {
      stopListening();
    } else {
      await startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    isSupported: !!nativeModule || !!SpeechRecognitionAPI,
    startListening,
    stopListening,
    toggleListening,
  };
};
