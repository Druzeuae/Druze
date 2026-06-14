import type { TFunction } from "i18next";
import type { City, LifestyleType, Nationality, Observance } from "@/types/database";

export function cityLabel(t: TFunction, city: City | null | undefined): string {
  switch (city) {
    case "dubai":
      return t("profile.dubai");
    case "abu_dhabi":
      return t("profile.abuDhabi");
    case "sharjah":
      return t("profile.sharjah");
    default:
      return t("profile.otherCity");
  }
}

export function nationalityLabel(t: TFunction, nationality: Nationality | null | undefined): string {
  return nationality === "druze" ? t("profile.druze") : t("profile.friendAlly");
}

export function observanceLabel(t: TFunction, observance: Observance | null | undefined): string {
  switch (observance) {
    case "practicing":
      return t("profile.practicing");
    case "moderately_practicing":
      return t("profile.moderatelyPracticing");
    case "cultural":
      return t("profile.cultural");
    default:
      return t("profile.preferNotToSay");
  }
}

export function lifestyleLabel(t: TFunction, lifestyle: LifestyleType | null | undefined): string {
  switch (lifestyle) {
    case "family_oriented":
      return t("profile.familyOriented");
    case "career_oriented":
      return t("profile.careerOriented");
    case "adventurous":
      return t("profile.adventurous");
    default:
      return t("profile.balanced");
  }
}
