import { ChatBox } from "@/components/assistant/ChatBox";

export default function AssistantPage() {
  return (
    <div className="h-[calc(100vh-73px)] overflow-hidden bg-[radial-gradient(circle_at_top_left,#dbeafe,transparent_35%),linear-gradient(180deg,#f8fafc,#eef2f7)] px-4 py-4">
      <ChatBox />
    </div>
  );
}
