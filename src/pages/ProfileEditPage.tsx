import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PhotoUploader } from "@/components/onboarding/PhotoUploader";
import { InterestPicker } from "@/components/onboarding/InterestPicker";
import { IntentPicker } from "@/components/onboarding/IntentPicker";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import type {
  City,
  ConnectionIntent,
  Gender,
  LifestyleType,
  Nationality,
  Observance,
} from "@/types/database";

export default function ProfileEditPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, updateCurrentUser } = useApp();
  const { toast } = useToast();

  const [form, setForm] = useState({ ...currentUser });

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleInterest = (id: string) =>
    set("interestIds", form.interestIds.includes(id) ? form.interestIds.filter((i) => i !== id) : [...form.interestIds, id]);

  const toggleIntent = (intent: ConnectionIntent) =>
    set("intents", form.intents.includes(intent) ? form.intents.filter((i) => i !== intent) : [...form.intents, intent]);

  const handleSave = () => {
    updateCurrentUser(form);
    toast({ description: t("common.save") + " ✓" });
    navigate("/profile");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">{t("profile.editProfile")}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/profile")}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSave}>{t("common.save")}</Button>
        </div>
      </div>

      {/* Media */}
      <Card>
        <CardHeader>
          <CardTitle>{t("profile.media")}</CardTitle>
        </CardHeader>
        <CardContent>
          <PhotoUploader photos={form.photos} onChange={(photos) => set("photos", photos)} />
          <p className="mt-2 text-xs text-muted-foreground">{t("profile.facePhotoHint")}</p>
        </CardContent>
      </Card>

      {/* Basic info */}
      <Card>
        <CardHeader>
          <CardTitle>{t("profile.basicInfo")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>{t("profile.fullName")}</Label>
            <Input value={form.fullName} onChange={(e) => set("fullName", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("profile.displayName")}</Label>
            <Input value={form.displayName} onChange={(e) => set("displayName", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("profile.gender")}</Label>
            <Select value={form.gender} onValueChange={(v) => set("gender", v as Gender)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="male">{t("profile.male")}</SelectItem>
                <SelectItem value="female">{t("profile.female")}</SelectItem>
                <SelectItem value="other">{t("profile.other")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{t("profile.dob")}</Label>
            <Input type="date" value={form.dateOfBirth} onChange={(e) => set("dateOfBirth", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("profile.nationality")}</Label>
            <Select value={form.nationality} onValueChange={(v) => set("nationality", v as Nationality)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="druze">{t("profile.druze")}</SelectItem>
                <SelectItem value="friend_ally">{t("profile.friendAlly")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{t("profile.city")}</Label>
            <Select value={form.city} onValueChange={(v) => set("city", v as City)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="dubai">{t("profile.dubai")}</SelectItem>
                <SelectItem value="abu_dhabi">{t("profile.abuDhabi")}</SelectItem>
                <SelectItem value="sharjah">{t("profile.sharjah")}</SelectItem>
                <SelectItem value="other">{t("profile.otherCity")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{t("profile.occupation")}</Label>
            <Input value={form.occupation} onChange={(e) => set("occupation", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("profile.languages")}</Label>
            <Input
              value={form.languages.join(", ")}
              onChange={(e) => set("languages", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
              placeholder="Arabic, English"
            />
          </div>
        </CardContent>
      </Card>

      {/* Bio */}
      <Card>
        <CardHeader>
          <CardTitle>{t("profile.aboutMe")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>{t("profile.aboutMe")}</Label>
            <Textarea maxLength={500} value={form.aboutMe} onChange={(e) => set("aboutMe", e.target.value)} />
            <p className="text-end text-xs text-muted-foreground">{form.aboutMe.length}/500</p>
          </div>
          <div className="space-y-1.5">
            <Label>{t("profile.personalValues")}</Label>
            <Textarea value={form.personalValues} onChange={(e) => set("personalValues", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("profile.lifestyleSection")}</Label>
            <Textarea value={form.lifestyleText} onChange={(e) => set("lifestyleText", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("profile.hobbies")}</Label>
            <Textarea value={form.hobbiesText} onChange={(e) => set("hobbiesText", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Alignment */}
      <Card>
        <CardHeader>
          <CardTitle>{t("profile.alignment")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>{t("profile.religiousObservance")}</Label>
            <Select value={form.religiousObservance} onValueChange={(v) => set("religiousObservance", v as Observance)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="practicing">{t("profile.practicing")}</SelectItem>
                <SelectItem value="moderately_practicing">{t("profile.moderatelyPracticing")}</SelectItem>
                <SelectItem value="cultural">{t("profile.cultural")}</SelectItem>
                <SelectItem value="prefer_not_to_say">{t("profile.preferNotToSay")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{t("profile.lifestyleType")}</Label>
            <Select value={form.lifestyle} onValueChange={(v) => set("lifestyle", v as LifestyleType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="family_oriented">{t("profile.familyOriented")}</SelectItem>
                <SelectItem value="career_oriented">{t("profile.careerOriented")}</SelectItem>
                <SelectItem value="balanced">{t("profile.balanced")}</SelectItem>
                <SelectItem value="adventurous">{t("profile.adventurous")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Connection intent */}
      <Card>
        <CardHeader>
          <CardTitle>{t("profile.connectionIntent")}</CardTitle>
        </CardHeader>
        <CardContent>
          <IntentPicker selected={form.intents} onToggle={toggleIntent} />
        </CardContent>
      </Card>

      {/* Interests */}
      <Card>
        <CardHeader>
          <CardTitle>{t("profile.editInterests")}</CardTitle>
        </CardHeader>
        <CardContent>
          <InterestPicker selected={form.interestIds} onToggle={toggleInterest} />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2 pb-4">
        <Button variant="outline" onClick={() => navigate("/profile")}>
          {t("common.cancel")}
        </Button>
        <Button onClick={handleSave}>{t("common.save")}</Button>
      </div>
    </div>
  );
}
