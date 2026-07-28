export default function TypingIndicator() {
  return (
    <div className="flex gap-1 px-4 py-2 bg-zinc-800 rounded-2xl w-fit">
      <div className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce" />
      <div className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce delay-100" />
      <div className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce delay-200" />
    </div>
  );
}