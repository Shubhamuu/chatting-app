import { KeyboardEvent, useRef } from 'react';

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
}

export default function MessageInput({
  value,
  onChange,
  onSend,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (
    e: KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const handleChange = (val: string) => {
    onChange(val);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + 'px';
    }
  };

  return (
    <div className="flex items-end gap-3 p-4 bg-zinc-950">
      <textarea
        ref={textareaRef}
        rows={1}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        className="
          flex-1
          max-h-40
          resize-none
          overflow-y-auto
          rounded-2xl
          bg-zinc-900
          border border-zinc-800
          px-4
          py-3
          text-sm
          text-white
          outline-none
          focus:border-blue-500
        "
      />

      <button
        onClick={onSend}
        disabled={!value.trim()}
        className="
          h-11
          px-5
          rounded-2xl
          bg-blue-600
          hover:bg-blue-500
          text-white
          text-sm
          font-medium
          transition
          disabled:opacity-40
          disabled:cursor-not-allowed
        "
      >
        Send
      </button>
    </div>
  );
}