// modern.js
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// ---- Supabase config (yours) ----
const SUPABASE_URL = "https://bbjwivuczofcauirxxcv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJiandpdnVjem9mY2F1aXJ4eGN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMTA2MTQsImV4cCI6MjA3MjU4NjYxNH0.wQwN5I-x6mOeO0fahidAdEPrYOnz4YQsYl1v_-w-eas";

// Create client FIRST, before any usage
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ---- DOM refs (after client) ----
const statusEl = document.getElementById("status");
const listEl   = document.getElementById("profilesList");
const formEl   = document.getElementById("addProfileForm");
const nameEl   = document.getElementById("profileName");

const tasksList      = document.getElementById("tasksList");
const addTaskForm    = document.getElementById("addTaskForm");
const taskProfileSel = document.getElementById("taskProfile");
const taskTextEl     = document.getElementById("taskText");

// Optional: hide the members list UI
if (listEl) listEl.style.display = "none";

// Safe probe AFTER we have statusEl
if (statusEl) statusEl.textContent = "JS loaded – probing…";
window.addEventListener("error", e => {
  if (statusEl) statusEl.textContent = "JS error: " + (e?.message || e);
});

// ---- utils ----
const esc = s => String(s).replace(/[&<>"']/g, m => ({
  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
}[m]));

let profilesById = {};

// ---- MEMBERS ----
async function loadProfiles() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  // render (hidden list; still render in case you unhide later)
  if (error) {
    if (listEl) listEl.innerHTML = `<li class="muted">Error: ${esc(error.message)}</li>`;
  } else if (!data || !data.length) {
    if (listEl) listEl.innerHTML = `<li class="muted">No members yet.</li>`;
  } else {
    if (listEl) listEl.innerHTML = data
      .map(p => `<li><strong>${esc(p.name)}</strong> <span class="muted">• ${new Date(p.created_at).toLocaleString()}</span></li>`)
      .join("");
  }

  // cache names for task display
  profilesById = Object.fromEntries((data || []).map(p => [p.id, p.name]));

  // assignment dropdown (optional)
  if (taskProfileSel) {
    taskProfileSel.innerHTML = [
      `<option value="">— Unassigned —</option>`,
      ...(data || []).map(p => `<option value="${p.id}">${esc(p.name)}</option>`)
    ].join("");
  }

  await loadTasks();
}

formEl?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = (nameEl.value || "").trim();
  if (!name) return;
  const { error } = await supabase.from("profiles").insert({ name });
  if (error) { alert(error.message); return; }
  nameEl.value = "";
  await loadProfiles();
});

// ---- TASKS (shared list, badge + delete only when done) ----
async function loadTasks() {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });

  if (!tasksList) return;

  if (error) { tasksList.innerHTML = `<li class="muted">Error: ${esc(error.message)}</li>`; return; }
  if (!data || !data.length) { tasksList.innerHTML = `<li class="muted">No tasks yet.</li>`; return; }

  tasksList.innerHTML = data.map(t => {
    const owner = t.profile_id ? (profilesById[t.profile_id] || "Unknown") : "Unassigned";
    return `
      <li>
        <div class="task-head" style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap">
          <span class="task-text" data-id="${t.id}" role="button" tabindex="0">
            ${esc(t.text)} <span class="muted">• ${esc(owner)}</span>
          </span>
          <span class="badge">${t.done ? "Done" : "Active"}</span>
        </div>
        <div class="muted">${new Date(t.created_at).toLocaleString()}</div>
        <div class="row" style="margin-top:6px">
          ${t.done ? `<button class="danger delete-task" data-id="${t.id}">Delete</button>` : ``}
        </div>
      </li>
    `;
  }).join("");
}

// assignment dropdown just refreshes list
taskProfileSel?.addEventListener("change", () => {
  loadTasks();
});

// add task (assignment optional)
addTaskForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = (taskTextEl.value || "").trim();
  if (!text) return;
  const profileId = taskProfileSel?.value || null;

  const { error } = await supabase
    .from("tasks")
    .insert({ profile_id: profileId, text });

  if (error) { alert(error.message); return; }
  taskTextEl.value = "";
  await loadTasks();
});

// click to toggle or delete
tasksList?.addEventListener("click", async (e) => {
  const del = e.target.closest("button.delete-task");
  if (del) {
    const id = del.dataset.id;
    if (!confirm("Delete this task?")) return;
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) { alert(error.message); return; }
    await loadTasks();
    return;
  }

  const txt = e.target.closest(".task-text");
  if (!txt) return;

  const id = txt.dataset.id;
  const { data, error } = await supabase
    .from("tasks")
    .select("done")
    .eq("id", id)
    .single();

  if (error) { alert(error.message); return; }

  if (!data.done && !confirm("Mark this task as done?")) return;

  const updates = { done: !data.done, completed_at: !data.done ? new Date().toISOString() : null };
  const { error: e2 } = await supabase.from("tasks").update(updates).eq("id", id);
  if (e2) { alert(e2.message); return; }
  await loadTasks();
});

// ---- INIT ----
(async () => {
  if (statusEl) statusEl.textContent = "Connecting…";
  const { error } = await supabase.from("profiles").select("id").limit(1);
  if (statusEl) statusEl.textContent = error ? "Supabase error: " + error.message : "Connected ✔";
  await loadProfiles();
})();


