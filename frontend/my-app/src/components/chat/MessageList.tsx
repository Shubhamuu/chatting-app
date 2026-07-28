import { Virtuoso } from 'react-virtuoso';
import MessageBubble from './MessageBubble';
import { Message } from '@/types/chat';

interface Props {
  messages: Message[];
  currentUserId: string;
}

export default function MessageList({
  messages,
  currentUserId,
}: Props) {
  return (
    <div className="h-full w-full">
      <Virtuoso
        data={messages}
        followOutput="smooth"
        className="h-full"
        overscan={200}
        itemContent={(_, msg) => (
          <div className="px-4 py-1.5">
            <MessageBubble
              message={msg}
              isMine={msg.senderId === currentUserId}
            />
          </div>
        )}
      />
    </div>
  );
}