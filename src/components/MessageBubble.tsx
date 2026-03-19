import type { Message } from '@/lib/types';
import VoicePlayer from './VoicePlayer';

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.sender_type === 'user';
  const isBot = message.sender_type === 'bot';

  const alignment = isUser ? 'items-start' : 'items-end';
  const bgColor = isUser
    ? 'bg-gray-100 text-gray-900'
    : isBot
      ? 'bg-green-500 text-white'
      : 'bg-blue-500 text-white';

  const senderLabel = isUser
    ? 'User'
    : isBot
      ? 'Bot'
      : 'Manager';

  const time = new Date(message.created_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`flex flex-col ${alignment} mb-3`}>
      <div className="flex items-center gap-2 mb-0.5 px-1">
        <span className="text-xs font-medium text-gray-500">{senderLabel}</span>
        <span className="text-xs text-gray-400">{time}</span>
      </div>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${bgColor}`}
      >
        {message.text && <p className="whitespace-pre-wrap">{message.text}</p>}
        {message.voice_url && <VoicePlayer voiceUrl={message.voice_url} />}
      </div>
    </div>
  );
}
