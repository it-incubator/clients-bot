'use client';

import { useState } from 'react';
import VoiceRecorder from './VoiceRecorder';

interface ReplyInputProps {
  onSend: (text: string) => void;
  onSendVoice: (voiceUrl: string) => void;
  disabled: boolean;
  sending?: boolean;
}

export default function ReplyInput({
  onSend,
  onSendVoice,
  disabled,
  sending = false,
}: ReplyInputProps) {
  const [text, setText] = useState('');
  const [showRecorder, setShowRecorder] = useState(false);

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    onSend(trimmed);
    setText('');
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleRecorded(blob: Blob) {
    setShowRecorder(false);
    const url = URL.createObjectURL(blob);
    onSendVoice(url);
  }

  if (showRecorder) {
    return (
      <div className="border-t border-gray-200 bg-white p-3">
        <VoiceRecorder
          onRecorded={handleRecorded}
          onCancel={() => setShowRecorder(false)}
        />
      </div>
    );
  }

  const isDisabled = disabled || sending;

  return (
    <div className="border-t border-gray-200 bg-white p-3">
      {disabled && !sending && (
        <p className="mb-2 text-xs text-amber-600">
          Assign yourself to this dialog to reply.
        </p>
      )}
      <div className="flex items-end gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? 'Not assigned...' : sending ? 'Sending...' : 'Type a message...'}
          disabled={isDisabled}
          rows={1}
          className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />

        <button
          onClick={() => setShowRecorder(true)}
          disabled={isDisabled}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Record voice message"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
            />
          </svg>
        </button>

        <button
          onClick={handleSend}
          disabled={isDisabled || !text.trim()}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Send message"
        >
          {sending ? (
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
