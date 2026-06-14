import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Heart, MessageCircle, Star, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import { calculateAge, initials } from "@/lib/utils";
import { cityLabel } from "@/lib/profileLabels";

export default function MatchesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser, profiles, matches, appreciations, conversations, unmatchUser, appreciateUser } = useApp();
  const [unmatchTarget, setUnmatchTarget] = useState<{ matchId: string; name: string } | null>(null);

  const activeMatches = matches.filter(
    (m) => m.status === "active" && (m.userAId === currentUser.id || m.userBId === currentUser.id)
  );

  const pendingRequests = appreciations.filter(
    (a) => a.status === "pending" && a.toUserId === currentUser.id
  );

  const getProfile = (id: string) => profiles.find((p) => p.id === id);

  const handleAccept = (fromUserId: string) => {
    const profile = getProfile(fromUserId);
    const { matched } = appreciateUser(fromUserId);
    if (matched && profile) {
      toast({ variant: "brand", title: t("matches.newMatch"), description: t("matches.newMatchSubtitle", { name: profile.displayName }) });
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-1 text-2xl font-extrabold sm:text-3xl">{t("matches.title")}</h1>
      <p className="mb-5 text-muted-foreground">{t("matches.subtitle")}</p>

      <Tabs defaultValue="matches">
        <TabsList>
          <TabsTrigger value="matches">
            {t("matches.title")} {activeMatches.length > 0 && <Badge variant="gold" className="ms-1">{activeMatches.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="requests">
            {t("matches.connectionRequests")} {pendingRequests.length > 0 && <Badge variant="gold" className="ms-1">{pendingRequests.length}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="matches">
          {activeMatches.length === 0 ? (
            <EmptyState message={t("matches.noMatches")} />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {activeMatches.map((match) => {
                const otherId = match.userAId === currentUser.id ? match.userBId : match.userAId;
                const profile = getProfile(otherId);
                if (!profile) return null;
                const conversation = conversations.find(
                  (c) =>
                    (c.userAId === currentUser.id && c.userBId === otherId) ||
                    (c.userBId === currentUser.id && c.userAId === otherId)
                );
                return (
                  <Card key={match.id} className="overflow-hidden">
                    <CardContent className="flex items-center gap-4 p-4">
                      <Avatar className="h-16 w-16 cursor-pointer" onClick={() => navigate(`/profile/${profile.id}`)}>
                        <AvatarImage src={profile.photos[0]} />
                        <AvatarFallback>{initials(profile.displayName)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-bold">
                          {profile.displayName}, {calculateAge(profile.dateOfBirth)}
                        </p>
                        <p className="text-sm text-muted-foreground">{cityLabel(t, profile.city)}</p>
                        <Badge variant="intent" className="mt-1">
                          <Heart className="h-3 w-3" /> {t("matches.compatibility", { percent: match.compatibilityScore })}
                        </Badge>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button size="sm" onClick={() => conversation && navigate(`/chat/${conversation.id}`)}>
                          <MessageCircle className="h-4 w-4" /> {t("matches.sendMessage")}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive"
                          onClick={() => setUnmatchTarget({ matchId: match.id, name: profile.displayName })}
                        >
                          <X className="h-4 w-4" /> {t("matches.unmatch")}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests">
          {pendingRequests.length === 0 ? (
            <EmptyState message={t("matches.noMatches")} />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {pendingRequests.map((req) => {
                const profile = getProfile(req.fromUserId);
                if (!profile) return null;
                return (
                  <Card key={req.id}>
                    <CardContent className="flex items-center gap-4 p-4">
                      <Avatar className="h-16 w-16 cursor-pointer" onClick={() => navigate(`/profile/${profile.id}`)}>
                        <AvatarImage src={profile.photos[0]} />
                        <AvatarFallback>{initials(profile.displayName)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-bold">
                          {profile.displayName}, {calculateAge(profile.dateOfBirth)}
                        </p>
                        <p className="text-sm text-muted-foreground">{cityLabel(t, profile.city)}</p>
                        {req.message && <p className="mt-1 text-sm italic">"{req.message}"</p>}
                      </div>
                      <Button size="sm" onClick={() => handleAccept(req.fromUserId)}>
                        <Star className="h-4 w-4" /> {t("discovery.appreciate")}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!unmatchTarget} onOpenChange={(open) => !open && setUnmatchTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("matches.unmatch")}</DialogTitle>
            <DialogDescription>
              {unmatchTarget && t("matches.unmatchConfirm", { name: unmatchTarget.name })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUnmatchTarget(null)}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (unmatchTarget) unmatchUser(unmatchTarget.matchId);
                setUnmatchTarget(null);
              }}
            >
              {t("matches.unmatch")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center text-muted-foreground">
      <Heart className="mb-2 h-10 w-10 text-primary-200" />
      <p className="text-lg font-semibold">{message}</p>
    </div>
  );
}
