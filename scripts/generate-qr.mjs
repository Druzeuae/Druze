// Generates a branded QR code PNG for the DRUZE UAE app link.
// Run: node scripts/generate-qr.mjs
import QRCode from "qrcode";
import { resolve } from "node:path";

const URL = "https://druzeuae1.vercel.app";
const out = resolve(process.env.USERPROFILE || ".", "Downloads", "druze-uae-qr.png");

await QRCode.toFile(out, URL, {
  width: 1200,
  margin: 3,
  errorCorrectionLevel: "H",
  color: {
    dark: "#4C2A85", // brand purple
    light: "#FFFFFF",
  },
});

console.log("QR code saved to: " + out);
