import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { ConversationList } from "@/components/chat/ConversationList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";

export default function ChatPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const { conversations } = useApp();

  const activeConversation = conversations.find((c) => c.id === conversationId);

  return (
    <div className="mx-auto h-[calc(100vh-9rem)] max-w-5xl overflow-hidden rounded-2xl border border-border bg-card sm:h-[calc(100vh-7rem)]">
      <div className="grid h-full grid-cols-1 sm:grid-cols-[20rem_1fr]">
        <div className={cn("border-border sm:border-e", conversationId && "hidden sm:block")}>
          <div className="border-b border-border p-4">
            <h1 className="text-xl font-extrabold">{t("chat.title")}</h1>
          </div>
          <ConversationList activeId={conversationId} />
        </div>

        <div className={cn(!conversationId && "hidden sm:block")}>
          {activeConversation ? (
            <ChatWindow conversation={activeConversation} />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-muted-foreground">
              <MessageCircle className="h-12 w-12 text-primary-200" />
              <p className="text-lg font-semibold">{t("chat.selectConversation")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
