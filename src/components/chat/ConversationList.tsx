import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useApp } from "@/context/AppContext";
import { cn, initials, timeAgo } from "@/lib/utils";
import type { AppConversation } from "@/types/app";

export function ConversationList({ activeId }: { activeId?: string }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, profiles, conversations } = useApp();
  const lang = i18n.language === "ar" ? "ar" : "en";

  const matched = conversations
    .filter((c) => c.status === "matched")
    .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

  const requests = conversations.filter((c) => c.status === "request");

  const renderItem = (conv: AppConversation) => {
    const otherId = conv.userAId === currentUser.id ? conv.userBId : conv.userAId;
    const profile = profiles.find((p) => p.id === otherId);
    if (!profile) return null;
    return (
      <button
        key={conv.id}
        onClick={() => navigate(`/chat/${conv.id}`)}
        className={cn(
          "flex w-full items-center gap-3 rounded-xl p-3 text-start transition-colors hover:bg-secondary",
          activeId === conv.id && "bg-primary-50"
        )}
      >
        <div className="relative">
          <Avatar className="h-12 w-12">
            <AvatarImage src={profile.photos[0]} />
            <AvatarFallback>{initials(profile.displayName)}</AvatarFallback>
          </Avatar>
          {profile.onlineStatus === "online" && (
            <span className="absolute -end-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-background bg-emerald-500" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate font-bold">{profile.displayName}</p>
            <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(conv.lastMessageAt, lang)}</span>
          </div>
          <p className="truncate text-sm text-muted-foreground">{conv.lastMessagePreview || t("chat.emptyChat")}</p>
        </div>
      </button>
    );
  };

  return (
    <div className="flex h-full flex-col">
      <Tabs defaultValue="chats" className="flex h-full flex-col">
        <div className="px-2 pt-2">
          <TabsList className="w-full">
            <TabsTrigger value="chats" className="flex-1">
              {t("chat.title")}
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex-1">
              {t("chat.messageRequests")}
              {requests.length > 0 && <Badge variant="gold" className="ms-1">{requests.length}</Badge>}
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="chats" className="flex-1 space-y-1 overflow-y-auto px-2 pb-2">
          {matched.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">{t("chat.noConversations")}</p>
          ) : (
            matched.map(renderItem)
          )}
        </TabsContent>
        <TabsContent value="requests" className="flex-1 space-y-1 overflow-y-auto px-2 pb-2">
          {requests.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">{t("chat.noRequests")}</p>
          ) : (
            requests.map(renderItem)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
