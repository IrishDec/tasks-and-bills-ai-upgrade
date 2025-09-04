import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://bbjwivuczofcauirxxcv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJiandpdnVjem9mY2F1aXJ4eGN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMTA2MTQsImV4cCI6MjA3MjU4NjYxNH0.wQwN5I-x6mOeO0fahidAdEPrYOnz4YQsYl1v_-w-eas"; // Settings → API

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM
const statusEl = document.getElementById("status");
const listEl   = document.getElementById("profilesList");
const formEl   = document.getElementById("addProfileForm");
const nameEl   = document.getElementById("profileName");
const tasksList = document.getElementById("tasksList");
const addTaskForm = document.getElementById("addTaskForm");
const taskProfileSel = document.getElementById("taskProfile");
const taskTextEl = document.getElementById("taskText");


const esc = s => String(s).replace(/[&<>"']/g, m => ({
  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
}[m]));

// load & render
async function loadProfiles() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    listEl.innerHTML = `<li class="muted">Error: ${esc(error.message)}</li>`;
    return;
  }
  if (!data.length) {
    listEl.innerHTML = `<li class="muted">No members yet.</li>`;
    return;
  }
  listEl.innerHTML = data.map(p =>
    `<li><strong>${esc(p.name)}</strong> <span class="muted">• ${new Date(p.created_at).toLocaleString()}</span></li>`
  ).join("");
}
// load tasks
async function loadTasks(profileId) {
  if (!profileId) {
    tasksList.innerHTML = `<li class="muted">Select a member.</li>`;
    return;
  }
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });

  if (error) {
    tasksList.innerHTML = `<li class="muted">Error: ${esc(error.message)}</li>`;
    return;
  }
  if (!data.length) {
    tasksList.innerHTML = `<li class="muted">No tasks yet.</li>`;
    return;
  }
  tasksList.innerHTML = data.map(t => `
    <li>
      <div class="task-head" style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap">
        <span>${esc(t.text)}</span>
        <button class="toggle" data-id="${t.id}">
          ${t.done ? "Mark active" : "Mark done"}
        </button>
      </div>
      <div class="muted">${new Date(t.created_at).toLocaleString()}</div>
    </li>
  `).join("");
}


// add member
formEl.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = (nameEl.value || "").trim();
  if (!name) return;
  const { error } = await supabase.from("profiles").insert({ name });
  if (error) { alert(error.message); return; }
  nameEl.value = "";
  await loadProfiles();
});

// init
(async () => {
  statusEl.textContent = "Connecting…";
  const { data, error } = await supabase.from("profiles").select("id").limit(1);
  if (error) {
    statusEl.textContent = "Supabase error: " + error.message;
    console.error("Supabase select error:", error);
  } else {
    statusEl.textContent = "Connected ✔";
  }
  await loadProfiles();
})();


