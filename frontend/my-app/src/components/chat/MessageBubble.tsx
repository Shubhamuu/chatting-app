import { memo } from 'react';
import { Message } from '@/types/chat';

interface Props {
  message: Message;
  isMine: boolean;
}

function MessageBubble({ message, isMine }: Props) {
  return (
    <div
      className={`flex w-full ${
        isMine ? 'justify-end' : 'justify-start'
      }`}
    >
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm break-words ${
          isMine
            ? 'bg-blue-600 text-white rounded-br-md'
            : 'bg-zinc-800 text-zinc-100 rounded-bl-md'
        }`}
      >
        <p className="text-sm leading-relaxed">
          {message.text}
        </p>

        <div
          className={`mt-1 text-[10px] ${
            isMine ? 'text-blue-100' : 'text-zinc-400'
          } text-right`}
        >
          {new Date(message.time).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </div>
  );
}

export default memo(MessageBubble);