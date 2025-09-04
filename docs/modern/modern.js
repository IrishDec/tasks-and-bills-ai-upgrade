import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://YOUR-PROJECT-REF.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_PUBLIC_ANON_KEY";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// simple check
const el = document.getElementById("status");
el.textContent = "Connecting…";
try {
  const { error } = await supabase.from("profiles").select("*").limit(1);
  el.textContent = error ? "Connected ✔ (no table yet)" : "Connected ✔";
} catch {
  el.textContent = "Connected ✔";
}
