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
async function loadProfiles() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  // Render the Members list
  if (error) {
    listEl.innerHTML = `<li class="muted">Error: ${esc(error.message)}</li>`;
  } else if (!data.length) {
    listEl.innerHTML = `<li class="muted">No members yet.</li>`;
  } else {
    listEl.innerHTML = data
      .map(p => `<li><strong>${esc(p.name)}</strong> <span class="muted">• ${new Date(p.created_at).toLocaleString()}</span></li>`)
      .join("");
  }

  // Populate the “Assign to member” dropdown and load tasks
  if (taskProfileSel) {
    taskProfileSel.innerHTML = (data || [])
      .map(p => `<option value="${p.id}">${esc(p.name)}</option>`)
      .join("");

    if (data && data.length) {
      await loadTasks(taskProfileSel.value);
    } else {
      tasksList.innerHTML = `<li class="muted">Add a member first.</li>`;
    }
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

// Change selected member → reload tasks
taskProfileSel?.addEventListener("change", () => {
  loadTasks(taskProfileSel.value);
});

// Add a new task for the selected member
addTaskForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = (taskTextEl.value || "").trim();
  if (!text) return;
  const profileId = taskProfileSel.value;

  const { error } = await supabase
    .from("tasks")
    .insert({ profile_id: profileId, text });

  if (error) { alert(error.message); return; }
  taskTextEl.value = "";
  await loadTasks(profileId);
});

// Toggle task done/active
tasksList?.addEventListener("click", async (e) => {
  const btn = e.target.closest("button.toggle");
  if (!btn) return;
  const id = btn.dataset.id;

  const { data, error } = await supabase
    .from("tasks")
    .select("done, profile_id")
    .eq("id", id)
    .single();

  if (error) { alert(error.message); return; }

  const updates = {
    done: !data.done,
    completed_at: !data.done ? new Date().toISOString() : null
  };

  const { error: e2 } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", id);

  if (e2) { alert(e2.message); return; }
  await loadTasks(data.profile_id);
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


