import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Image as ImageIcon, Mic, MoreVertical, Send, Ban, Flag } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { ReportDialog } from "@/components/profile/ReportDialog";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import { initials, timeAgo } from "@/lib/utils";
import type { AppConversation } from "@/types/app";

export function ChatWindow({ conversation }: { conversation: AppConversation }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const lang = i18n.language === "ar" ? "ar" : "en";
  const {
    currentUser,
    profiles,
    messages,
    sendMessage,
    markConversationRead,
    acceptMessageRequest,
    declineMessageRequest,
    setReaction,
    blockUser,
  } = useApp();

  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const otherId = conversation.userAId === currentUser.id ? conversation.userBId : conversation.userAId;
  const otherProfile = profiles.find((p) => p.id === otherId);

  const conversationMessages = messages
    .filter((m) => m.conversationId === conversation.id)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  useEffect(() => {
    markConversationRead(conversation.id);
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation.id, conversationMessages.length]);

  if (!otherProfile) return null;

  const isMessageRequest = conversation.status === "request";
  const isRequestFromOther = isMessageRequest && conversationMessages[0]?.senderId !== currentUser.id;

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage(conversation.id, { senderId: currentUser.id, type: "text", content: text.trim() });
    setText("");
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 1500);
  };

  const handleSendPhoto = () => {
    sendMessage(conversation.id, {
      senderId: currentUser.id,
      type: "photo",
      mediaUrl: `https://picsum.photos/seed/chat${Date.now()}/400/400`,
    });
  };

  const handleSendVoice = () => {
    sendMessage(conversation.id, {
      senderId: currentUser.id,
      type: "voice",
      mediaDurationSeconds: Math.floor(5 + Math.random() * 25),
    });
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border p-3">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => navigate("/chat")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Avatar className="h-10 w-10 cursor-pointer" onClick={() => navigate(`/profile/${otherProfile.id}`)}>
          <AvatarImage src={otherProfile.photos[0]} />
          <AvatarFallback>{initials(otherProfile.displayName)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-bold">{otherProfile.displayName}</p>
          <p className="text-xs text-muted-foreground">
            {isTyping
              ? t("chat.typing")
              : otherProfile.onlineStatus === "online"
              ? t("chat.online")
              : t("chat.lastSeen", { time: timeAgo(otherProfile.lastActiveAt, lang) })}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate(`/profile/${otherProfile.id}`)}>{t("chat.viewProfile")}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setReportOpen(true)}>
              <Flag className="h-4 w-4" /> {t("chat.reportUser")}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => {
                blockUser(otherProfile.id);
                toast({ description: t("chat.blockUser") });
                navigate("/chat");
              }}
            >
              <Ban className="h-4 w-4" /> {t("chat.blockUser")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {conversationMessages.length === 0 ? (
          <p className="pt-10 text-center text-sm text-muted-foreground">{t("chat.emptyChat")}</p>
        ) : (
          conversationMessages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isMine={msg.senderId === currentUser.id}
              onReact={(emoji) => setReaction(msg.id, emoji)}
            />
          ))
        )}
        <div ref={endRef} />
      </div>

      {/* Message request banner */}
      {isRequestFromOther ? (
        <div className="flex items-center justify-between gap-3 border-t border-border p-3">
          <p className="text-sm text-muted-foreground">{t("matches.connectionRequests")}</p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => declineMessageRequest(conversation.id)}>
              {t("chat.decline")}
            </Button>
            <Button size="sm" onClick={() => acceptMessageRequest(conversation.id)}>
              {t("chat.accept")}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 border-t border-border p-3">
          <Button variant="ghost" size="icon" onClick={handleSendPhoto} aria-label={t("chat.sendPhoto")}>
            <ImageIcon className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleSendVoice} aria-label={t("chat.recordVoice")}>
            <Mic className="h-5 w-5" />
          </Button>
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={t("chat.typeMessage")}
            className="flex-1"
          />
          <Button size="icon" onClick={handleSend} disabled={!text.trim()} aria-label={t("common.send")}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      )}

      <ReportDialog open={reportOpen} onOpenChange={setReportOpen} userId={otherProfile.id} />
    </div>
  );
}
