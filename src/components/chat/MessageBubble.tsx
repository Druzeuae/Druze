import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, CheckCheck, Mic, SmilePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AppMessage } from "@/types/app";

const QUICK_REACTIONS = ["❤️", "😂", "👍", "😮", "😢", "🙏"];

export function MessageBubble({
  message,
  isMine,
  onReact,
}: {
  message: AppMessage;
  isMine: boolean;
  onReact: (emoji: string) => void;
}) {
  const { t } = useTranslation();
  const [showReactions, setShowReactions] = useState(false);

  const time = new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const reactions = Object.values(message.reaction || {});

  return (
    <div className={cn("group flex flex-col gap-1", isMine ? "items-end" : "items-start")}>
      <div className="relative flex items-center gap-1">
        {isMine && (
          <button
            onClick={() => setShowReactions((s) => !s)}
            className="invisible rounded-full p-1 text-muted-foreground hover:bg-secondary group-hover:visible"
          >
            <SmilePlus className="h-4 w-4" />
          </button>
        )}
        <div
          className={cn(
            "max-w-[75vw] rounded-2xl px-4 py-2.5 text-sm shadow-sm sm:max-w-sm",
            isMine ? "rounded-ee-sm bg-primary text-primary-foreground" : "rounded-ss-sm bg-secondary text-secondary-foreground"
          )}
        >
          {message.type === "text" && <p className="whitespace-pre-wrap">{message.content}</p>}
          {message.type === "photo" && (
            <img src={message.mediaUrl} alt="Shared photo" className="max-h-64 rounded-lg object-cover" />
          )}
          {message.type === "voice" && (
            <div className="flex items-center gap-2">
              <Mic className="h-4 w-4" />
              <div className="h-1.5 w-32 rounded-full bg-current/30">
                <div className="h-1.5 w-1/3 rounded-full bg-current" />
              </div>
              <span className="text-xs">{message.mediaDurationSeconds}s</span>
            </div>
          )}
          {message.type === "system" && <p className="italic opacity-80">{message.content}</p>}
        </div>
        {!isMine && (
          <button
            onClick={() => setShowReactions((s) => !s)}
            className="invisible rounded-full p-1 text-muted-foreground hover:bg-secondary group-hover:visible"
          >
            <SmilePlus className="h-4 w-4" />
          </button>
        )}

        {showReactions && (
          <div className={cn("absolute z-10 flex gap-1 rounded-full border border-border bg-popover p-1 shadow-lg", isMine ? "end-8 -top-10" : "start-8 -top-10")}>
            {QUICK_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onReact(emoji);
                  setShowReactions(false);
                }}
                className="rounded-full p-1 text-lg hover:scale-125 transition-transform"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={cn("flex items-center gap-1.5 px-1 text-[11px] text-muted-foreground", isMine && "flex-row-reverse")}>
        <span>{time}</span>
        {isMine &&
          (message.readAt ? (
            <span className="flex items-center gap-0.5 text-primary"><CheckCheck className="h-3.5 w-3.5" /> {t("chat.read")}</span>
          ) : (
            <span className="flex items-center gap-0.5"><Check className="h-3.5 w-3.5" /> {t("chat.delivered")}</span>
          ))}
        {reactions.length > 0 && <span className="text-sm">{reactions.join(" ")}</span>}
      </div>
    </div>
  );
}
