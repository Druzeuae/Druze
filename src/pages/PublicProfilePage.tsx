import { useState } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Star, Bookmark, CalendarPlus, MoreVertical, MessageCircle, Flag, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ProfileView } from "@/components/profile/ProfileView";
import { ReportDialog } from "@/components/profile/ReportDialog";
import { useApp, sharedInterestCount } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function PublicProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    currentUser,
    profiles,
    appreciations,
    matches,
    conversations,
    savedUserIds,
    appreciateUser,
    saveUser,
    unsaveUser,
    blockUser,
  } = useApp();

  const [requestOpen, setRequestOpen] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [reportOpen, setReportOpen] = useState(false);

  const profile = profiles.find((p) => p.id === userId);
  if (!profile) return <Navigate to="/discover" replace />;
  if (profile.id === currentUser.id) return <Navigate to="/profile" replace />;

  const shared = sharedInterestCount(currentUser, profile);
  const isSaved = savedUserIds.includes(profile.id);
  const alreadyAppreciated = appreciations.some(
    (a) => a.fromUserId === currentUser.id && a.toUserId === profile.id
  );
  const isMatched = matches.some(
    (m) =>
      m.status === "active" &&
      ((m.userAId === currentUser.id && m.userBId === profile.id) ||
        (m.userBId === currentUser.id && m.userAId === profile.id))
  );
  const conversation = conversations.find(
    (c) =>
      (c.userAId === currentUser.id && c.userBId === profile.id) ||
      (c.userBId === currentUser.id && c.userAId === profile.id)
  );

  const handleAppreciate = () => {
    if (alreadyAppreciated) return;
    const { matched } = appreciateUser(profile.id);
    if (matched) {
      toast({ variant: "brand", title: t("matches.newMatch"), description: t("matches.newMatchSubtitle", { name: profile.displayName }) });
    } else {
      toast({ description: t("discovery.appreciated") });
    }
  };

  const handleSendRequest = () => {
    appreciateUser(profile.id, requestMessage);
    setRequestOpen(false);
    setRequestMessage("");
    toast({ description: t("matches.sendRequest") });
  };

  const handleBlock = () => {
    blockUser(profile.id);
    toast({ description: t("chat.blockUser") });
    navigate("/discover");
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          ← {t("common.back")}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setReportOpen(true)}>
              <Flag className="h-4 w-4" /> {t("chat.reportUser")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleBlock} className="text-destructive">
              <Ban className="h-4 w-4" /> {t("chat.blockUser")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {shared > 0 && (
        <Badge variant="intent" className="mb-3">
          {t("profile.sharedInterests", { count: shared })}
        </Badge>
      )}

      <ProfileView profile={profile} />

      {/* Action bar */}
      <div className="sticky bottom-20 mt-6 flex items-center justify-center gap-3 rounded-2xl border border-border bg-background/95 p-3 shadow-lg backdrop-blur md:bottom-4">
        <Button
          variant="outline"
          size="lg"
          className={cn("flex-1 sm:flex-none", isSaved && "border-gold text-gold-600")}
          onClick={() => (isSaved ? unsaveUser(profile.id) : saveUser(profile.id))}
        >
          <Bookmark className={cn("h-5 w-5", isSaved && "fill-gold-500")} />
          {isSaved ? t("discovery.saved") : t("discovery.save")}
        </Button>

        {isMatched && conversation ? (
          <Button size="lg" className="flex-1 sm:flex-none" onClick={() => navigate(`/chat/${conversation.id}`)}>
            <MessageCircle className="h-5 w-5" /> {t("matches.sendMessage")}
          </Button>
        ) : (
          <Button
            size="lg"
            variant={alreadyAppreciated ? "secondary" : "default"}
            className="flex-1 sm:flex-none"
            onClick={handleAppreciate}
            disabled={alreadyAppreciated}
          >
            <Star className={cn("h-5 w-5", alreadyAppreciated && "fill-current")} />
            {alreadyAppreciated ? t("discovery.appreciated") : t("discovery.appreciate")}
          </Button>
        )}

        <Button variant="outline" size="lg" className="flex-1 sm:flex-none" onClick={() => setRequestOpen(true)}>
          <CalendarPlus className="h-5 w-5" /> {t("discovery.inviteToActivity")}
        </Button>
      </div>

      {/* Connection request dialog */}
      <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("matches.sendRequest")}</DialogTitle>
            <DialogDescription>{t("matches.requestMessage")}</DialogDescription>
          </DialogHeader>
          <Textarea
            value={requestMessage}
            onChange={(e) => setRequestMessage(e.target.value)}
            placeholder={t("matches.requestMessage")}
            maxLength={300}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRequestOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleSendRequest}>{t("common.send")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ReportDialog open={reportOpen} onOpenChange={setReportOpen} userId={profile.id} />
    </div>
  );
}
