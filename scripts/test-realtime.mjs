// Quick check: does Supabase Realtime connect for this project?
// Run: node scripts/test-realtime.mjs
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const env = readFileSync(new URL("../.env", import.meta.url), "utf8");
const get = (k) => (env.match(new RegExp(`${k}=(.*)`)) || [])[1]?.trim();
const url = get("VITE_SUPABASE_URL");
const key = get("VITE_SUPABASE_ANON_KEY");
console.log("URL:", url, "| key length:", key?.length);

const supabase = createClient(url, key);
const channel = supabase.channel("game-room:test-" + Date.now());

const timer = setTimeout(() => {
  console.log("RESULT: TIMED OUT (no SUBSCRIBED within 10s)");
  process.exit(1);
}, 10000);

channel.subscribe((status, err) => {
  console.log("status:", status, err ? "err=" + err.message : "");
  if (status === "SUBSCRIBED") {
    console.log("RESULT: ✅ REALTIME WORKS");
    clearTimeout(timer);
    setTimeout(() => process.exit(0), 200);
  }
  if (status === "CHANNEL_ERROR" || status === "CLOSED") {
    console.log("RESULT: ❌ REALTIME FAILED (" + status + ")");
    clearTimeout(timer);
    setTimeout(() => process.exit(1), 200);
  }
});
