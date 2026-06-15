import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Heart, MessageCircle, Plus, Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/context/AppContext";
import { cn, initials, timeAgo } from "@/lib/utils";
import type { MajlisCategory } from "@/types/app";

const CATEGORIES: { id: MajlisCategory; variant: "intent" | "teal" | "coral" | "gold" | "secondary" }[] = [
  { id: "discussion", variant: "intent" },
  { id: "story", variant: "gold" },
  { id: "question", variant: "teal" },
  { id: "heritage", variant: "coral" },
  { id: "advice", variant: "secondary" },
];

export default function MajlisPage() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const lang = isAr ? "ar" : "en";
  const { currentUser, profiles, majlisTopics, toggleMajlisLike, replyToMajlis, postMajlisTopic } = useApp();

  const [openId, setOpenId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const author = (id: string) => profiles.find((p) => p.id === id);

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/community" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t("community.backToHub")}
      </Link>

      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h1 className="mb-1 text-2xl font-extrabold sm:text-3xl">{t("community.sections.majlis.name")}</h1>
          <p className="text-muted-foreground">{t("community.sections.majlis.long")}</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gradient-brand shrink-0 text-white">
          <Plus className="h-4 w-4" /> {t("majlis.newTopic")}
        </Button>
      </div>

      <div className="space-y-3">
        {majlisTopics.map((topic) => {
          const a = author(topic.authorId);
          const liked = topic.likeIds.includes(currentUser.id);
          const expanded = openId === topic.id;
          const cat = CATEGORIES.find((c) => c.id === topic.category)!;
          return (
            <Card key={topic.id}>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center gap-2">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={a?.photos[0]} />
                    <AvatarFallback>{initials(a?.displayName ?? "?")}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{a?.displayName}</p>
                    <p className="text-xs text-muted-foreground">{timeAgo(topic.createdAt, lang)}</p>
                  </div>
                  <Badge variant={cat.variant}>{t(`majlis.categories.${topic.category}`)}</Badge>
                </div>

                <div>
                  <h3 className="text-lg font-bold leading-snug">{isAr && topic.titleAr ? topic.titleAr : topic.title}</h3>
                  <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
                    {isAr && topic.bodyAr ? topic.bodyAr : topic.body}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <button
                    onClick={() => toggleMajlisLike(topic.id)}
                    className={cn("flex items-center gap-1.5 font-semibold transition-colors", liked ? "text-coral-500" : "text-muted-foreground hover:text-foreground")}
                  >
                    <Heart className={cn("h-4 w-4", liked && "fill-current")} /> {topic.likeIds.length}
                  </button>
                  <button
                    onClick={() => { setOpenId(expanded ? null : topic.id); setReplyText(""); }}
                    className="flex items-center gap-1.5 font-semibold text-muted-foreground hover:text-foreground"
                  >
                    <MessageCircle className="h-4 w-4" /> {topic.replies.length}
                  </button>
                </div>

                {expanded && (
                  <div className="space-y-3 border-t border-border pt-3">
                    {topic.replies.map((r) => {
                      const ra = author(r.authorId);
                      return (
                        <div key={r.id} className="flex gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarImage src={ra?.photos[0]} />
                            <AvatarFallback className="text-[10px]">{initials(ra?.displayName ?? "?")}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 rounded-xl bg-secondary/60 px-3 py-2">
                            <p className="text-xs font-semibold">{ra?.displayName}</p>
                            <p className="text-sm">{r.body}</p>
                          </div>
                        </div>
                      );
                    })}
                    <div className="flex gap-2">
                      <Input
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={t("majlis.replyPlaceholder")}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && replyText.trim()) {
                            replyToMajlis(topic.id, replyText);
                            setReplyText("");
                          }
                        }}
                      />
                      <Button
                        size="icon"
                        disabled={!replyText.trim()}
                        onClick={() => { replyToMajlis(topic.id, replyText); setReplyText(""); }}
                      >
                        <Send className="h-4 w-4 rtl:rotate-180" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <NewTopicDialog open={createOpen} onOpenChange={setCreateOpen} onPost={(input) => { postMajlisTopic(input); setCreateOpen(false); }} />
    </div>
  );
}

function NewTopicDialog({
  open,
  onOpenChange,
  onPost,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onPost: (input: { title: string; body: string; category: MajlisCategory }) => void;
}) {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<MajlisCategory>("discussion");

  const submit = () => {
    if (!title.trim() || !body.trim()) return;
    onPost({ title, body, category });
    setTitle(""); setBody(""); setCategory("discussion");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{t("majlis.newTopic")}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>{t("majlis.topicTitle")}</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("majlis.topicTitlePlaceholder")} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("activities.category")}</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as MajlisCategory)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{t(`majlis.categories.${c.id}`)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{t("majlis.topicBody")}</Label>
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} placeholder={t("majlis.topicBodyPlaceholder")} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
          <Button onClick={submit} disabled={!title.trim() || !body.trim()}>{t("majlis.post")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
