import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, GraduationCap, HandHeart, Megaphone, PartyPopper, Plus, Flower2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import type { MomentType } from "@/types/app";

const TYPES: { id: MomentType; icon: typeof PartyPopper; gradient: string }[] = [
  { id: "celebration", icon: PartyPopper, gradient: "gradient-coral" },
  { id: "milestone", icon: GraduationCap, gradient: "gradient-teal" },
  { id: "condolence", icon: Flower2, gradient: "gradient-brand" },
  { id: "announcement", icon: Megaphone, gradient: "gradient-gold" },
];

export default function MomentsPage() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const lang = isAr ? "ar" : "en";
  const { currentUser, profiles, communityMoments, toggleMomentSupport, postMoment } = useApp();
  const [createOpen, setCreateOpen] = useState(false);

  const author = (id: string) => profiles.find((p) => p.id === id);

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/community" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t("community.backToHub")}
      </Link>

      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h1 className="mb-1 text-2xl font-extrabold sm:text-3xl">{t("community.sections.moments.name")}</h1>
          <p className="text-muted-foreground">{t("community.sections.moments.long")}</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gradient-coral shrink-0 text-white">
          <Plus className="h-4 w-4" /> {t("moments.share")}
        </Button>
      </div>

      <div className="space-y-3">
        {communityMoments.map((m) => {
          const a = author(m.authorId);
          const type = TYPES.find((x) => x.id === m.type)!;
          const Icon = type.icon;
          const supporting = m.supportIds.includes(currentUser.id);
          return (
            <Card key={m.id} className="overflow-hidden">
              <div className={cn("flex items-center gap-2 px-4 py-2 text-white", type.gradient)}>
                <Icon className="h-4 w-4" />
                <span className="text-sm font-bold">{t(`moments.types.${m.type}`)}</span>
              </div>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center gap-2">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={a?.photos[0]} />
                    <AvatarFallback>{initials(a?.displayName ?? "?")}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold">{a?.displayName}</p>
                    <p className="text-xs text-muted-foreground">{timeAgo(m.createdAt, lang)}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold leading-snug">{isAr && m.titleAr ? m.titleAr : m.title}</h3>
                  <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">{isAr && m.bodyAr ? m.bodyAr : m.body}</p>
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2 rtl:space-x-reverse">
                      {m.supportIds.slice(0, 4).map((id) => {
                        const p = author(id);
                        if (!p) return null;
                        return (
                          <Avatar key={id} className="h-6 w-6 ring-2 ring-background">
                            <AvatarImage src={p.photos[0]} />
                            <AvatarFallback className="text-[9px]">{initials(p.displayName)}</AvatarFallback>
                          </Avatar>
                        );
                      })}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {t("moments.standingWith", { count: m.supportIds.length })}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant={supporting ? "outline" : "default"}
                    onClick={() => toggleMomentSupport(m.id)}
                  >
                    <HandHeart className="h-4 w-4" />
                    {supporting ? t("moments.supporting") : t(m.type === "condolence" ? "moments.standWith" : "moments.celebrate")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <ShareMomentDialog open={createOpen} onOpenChange={setCreateOpen} onPost={(input) => { postMoment(input); setCreateOpen(false); }} />
    </div>
  );
}

function ShareMomentDialog({
  open,
  onOpenChange,
  onPost,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onPost: (input: { title: string; body: string; type: MomentType }) => void;
}) {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState<MomentType>("celebration");

  const submit = () => {
    if (!title.trim() || !body.trim()) return;
    onPost({ title, body, type });
    setTitle(""); setBody(""); setType("celebration");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{t("moments.share")}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>{t("moments.type")}</Label>
            <Select value={type} onValueChange={(v) => setType(v as MomentType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TYPES.map((x) => (
                  <SelectItem key={x.id} value={x.id}>{t(`moments.types.${x.id}`)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{t("moments.titleLabel")}</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("moments.titlePlaceholder")} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("moments.message")}</Label>
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} placeholder={t("moments.messagePlaceholder")} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
          <Button onClick={submit} disabled={!title.trim() || !body.trim()}>{t("moments.post")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
