/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Check, X, RotateCcw, AlertCircle, Volume2, Square } from 'lucide-react';

interface VoiceTextareaProps {
  id?: string;
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  helperText?: string;
  badgeText?: string;
}

// Type declaration for browser SpeechRecognition
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

export const VoiceTextarea: React.FC<VoiceTextareaProps> = ({
  id,
  label,
  required = false,
  value,
  onChange,
  placeholder,
  rows = 3,
  className = '',
  helperText,
  badgeText,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [interimText, setInterimText] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastAppendedText, setLastAppendedText] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const baseValueBeforeListeningRef = useRef<string>('');
  const sessionFinalsRef = useRef<string>('');

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore cleanup abort errors
        }
      }
    };
  }, []);

  const startListening = () => {
    setErrorMessage(null);
    setStatusMessage(null);

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage(
        'Voice typing is not natively supported in this browser. Please use Google Chrome, Apple Safari, or Microsoft Edge, or type manually.'
      );
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      // Prefer user's browser language or New Zealand English
      recognition.lang = navigator.language || 'en-NZ';

      baseValueBeforeListeningRef.current = value;
      sessionFinalsRef.current = '';
      setInterimText('');

      recognition.onstart = () => {
        setIsListening(true);
        setStatusMessage('Listening... Speak your story or memories naturally.');
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let currentInterim = '';
        let newFinalChunk = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            newFinalChunk += transcript;
          } else {
            currentInterim += transcript;
          }
        }

        if (newFinalChunk) {
          sessionFinalsRef.current += (sessionFinalsRef.current ? ' ' : '') + newFinalChunk.trim();
          commitAppendedText(sessionFinalsRef.current);
        }

        setInterimText(currentInterim);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setErrorMessage(
            'Microphone access was denied. Please allow microphone permissions in your browser bar to use voice typing.'
          );
          stopListening();
        } else if (event.error === 'no-speech') {
          setStatusMessage('No speech detected. Keep talking or click Done when finished.');
        } else if (event.error !== 'aborted') {
          setErrorMessage(`Speech recognition note: ${event.error}. You can keep speaking or type manually.`);
        }
      };

      recognition.onend = () => {
        // If user was actively listening, finish session cleanly
        setIsListening(false);
        setInterimText('');
        if (sessionFinalsRef.current) {
          commitAppendedText(sessionFinalsRef.current);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Error starting speech recognition:', err);
      setErrorMessage(
        err.message || 'Could not start voice recognition. Please check your microphone permissions.'
      );
      setIsListening(false);
    }
  };

  const commitAppendedText = (spokenText: string) => {
    const rawSpoken = spokenText.trim();
    if (!rawSpoken) return;

    // Capitalize first letter of the spoken text
    const capitalized = rawSpoken.charAt(0).toUpperCase() + rawSpoken.slice(1);
    const existing = baseValueBeforeListeningRef.current.trim();

    let combined = '';
    if (!existing) {
      combined = capitalized;
    } else {
      // Check punctuation at end of existing text
      const endsWithPunctuation = /[.!?]$/.test(existing);
      const endsWithNewline = /\n$/.test(baseValueBeforeListeningRef.current);

      if (endsWithNewline) {
        combined = `${existing}\n${capitalized}`;
      } else if (endsWithPunctuation) {
        combined = `${existing} ${capitalized}`;
      } else {
        // Add a full stop before the new spoken sentence if missing
        combined = `${existing}. ${capitalized}`;
      }
    }

    setLastAppendedText(capitalized);
    onChange(combined);
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
    setInterimText('');
    setStatusMessage(null);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const undoLastSpoken = () => {
    if (lastAppendedText) {
      onChange(baseValueBeforeListeningRef.current);
      setLastAppendedText(null);
      setStatusMessage('Spoken text was removed.');
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Header with Label and Voice Type Trigger */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <label htmlFor={id} className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <span>{label}</span>
          {required && <span className="text-red-500">*</span>}
          {badgeText && (
            <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
              {badgeText}
            </span>
          )}
        </label>

        {/* Voice typing button */}
        <div className="flex items-center gap-1.5">
          {lastAppendedText && !isListening && (
            <button
              type="button"
              onClick={undoLastSpoken}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-800 px-2 py-0.5 rounded-md hover:bg-slate-100 transition-colors"
              title="Undo last voice entry"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Undo voice</span>
            </button>
          )}

          <button
            type="button"
            onClick={toggleListening}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer ${
              isListening
                ? 'bg-rose-600 text-white hover:bg-rose-700 ring-4 ring-rose-200 animate-pulse'
                : 'bg-gradient-to-r from-[#421078] to-[#F51B91] text-white hover:opacity-95 hover:shadow-sm'
            }`}
            title={isListening ? 'Click to finish speaking' : 'Speak into your microphone to type automatically'}
          >
            {isListening ? (
              <>
                <Square className="w-3 h-3 fill-current" />
                <span>Done Speaking</span>
              </>
            ) : (
              <>
                <Mic className="w-3.5 h-3.5" />
                <span>Voice Type</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Helper text if provided */}
      {helperText && <p className="text-[11px] text-slate-500">{helperText}</p>}

      {/* Active Voice Typing Banner */}
      {isListening && (
        <div className="p-3 rounded-2xl bg-gradient-to-r from-rose-50 via-purple-50 to-pink-50 border border-rose-200/80 shadow-xs space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
              </span>
              <span className="text-xs font-bold text-rose-900">
                Recording your voice...
              </span>
            </div>

            {/* Sound wave animated bars */}
            <div className="flex items-center gap-0.5 h-4">
              <span className="w-1 h-2 bg-rose-500 rounded-full animate-bounce [animation-delay:0ms]"></span>
              <span className="w-1 h-3.5 bg-purple-600 rounded-full animate-bounce [animation-delay:150ms]"></span>
              <span className="w-1 h-4 bg-pink-500 rounded-full animate-bounce [animation-delay:300ms]"></span>
              <span className="w-1 h-2.5 bg-rose-500 rounded-full animate-bounce [animation-delay:450ms]"></span>
              <span className="w-1 h-3 bg-purple-600 rounded-full animate-bounce [animation-delay:200ms]"></span>
            </div>
          </div>

          <p className="text-[11px] text-slate-600 leading-snug">
            Speak clearly at your normal pace. Say memories, places, people, or inside jokes—your words will automatically appear in the box below.
          </p>

          {/* Real-time live transcript ticker */}
          {interimText && (
            <div className="p-2 rounded-xl bg-white/90 border border-rose-100 flex items-start gap-1.5 text-xs text-slate-800">
              <Volume2 className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5 animate-pulse" />
              <p className="italic text-slate-700">"{interimText}"</p>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={stopListening}
              className="px-3 py-1 rounded-lg text-xs font-bold bg-[#421078] text-white hover:bg-purple-900 transition-colors flex items-center gap-1 shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Done (Add to story)</span>
            </button>
          </div>
        </div>
      )}

      {/* Error or Alert banner */}
      {errorMessage && (
        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p>{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-amber-600 hover:text-amber-800"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Success/Status brief banner */}
      {statusMessage && !isListening && (
        <p className="text-[11px] text-purple-700 font-medium px-1 flex items-center gap-1">
          <Check className="w-3 h-3 text-emerald-600" />
          <span>{statusMessage}</span>
        </p>
      )}

      {/* Main Textarea */}
      <div className="relative">
        <textarea
          id={id}
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none ${
            isListening
              ? 'border-rose-400 ring-2 ring-rose-200/80 bg-rose-50/10'
              : 'border-slate-300 focus:ring-2 focus:ring-[#421078] bg-white'
          }`}
        />

        {/* Small mic hint inside corner when empty and not listening */}
        {!value && !isListening && isSupported && (
          <div className="absolute right-3 bottom-3 pointer-events-none flex items-center gap-1 text-[11px] text-slate-400 bg-white/90 px-2 py-0.5 rounded-full border border-slate-100 shadow-2xs">
            <Mic className="w-3 h-3 text-purple-600" />
            <span>Voice typing ready</span>
          </div>
        )}
      </div>
    </div>
  );
};
