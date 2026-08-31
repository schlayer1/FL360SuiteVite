/**
 * FACHLEITER 360° SUITE PRO - MAIN APPLICATION ROUTER & CONTROLLER
 */

let activeTabId = "tab-dashboard";
let liveTimerInterval = null;
let liveTimerSeconds = 0;
let liveTimerRunning = false;
let liveScores = [3, 3, 3, 3, 3, 3];
let liveLogs = [];
let speechRecognition = null;
let isDictating = false;

let dashboardRadarChart = null;
let progressionRadarChart = null;
let reflectionRadarChart = null;

// Initialization on DOM Load / Immediate if already loaded
function initApp() {
  try {
    populateLAASelector();
    initActiveTab();
    initLiveCockpit();
  } catch(err) {
    console.error("Initialization Error:", err);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}

function initActiveTab() {
  const hash = window.location.hash.replace("#", "");
  if (hash && document.getElementById(hash)) {
    switchTab(hash);
  } else {
    switchTab("tab-dashboard");
  }
}

function switchTab(tabId) {
  activeTabId = tabId;
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("onclick")?.includes(tabId));
  });

  document.querySelectorAll(".tab-content").forEach(content => {
    content.classList.toggle("active", content.id === tabId);
  });

  try {
    if (tabId === "tab-dashboard") {
      renderDashboard();
    } else if (tabId === "tab-live") {
      renderLiveCockpitUI();
    } else if (tabId === "tab-niederschrift") {
      if (typeof initAuthenticNiederschrift === "function") initAuthenticNiederschrift();
    } else if (tabId === "tab-progression") {
      renderProgressionTab();
    } else if (tabId === "tab-seminar") {
      renderSeminarTab();
    } else if (tabId === "tab-reflexion") {
      renderReflectionTab();
    } else if (tabId === "tab-fristen") {
      renderFristenTab();
    } else if (tabId === "tab-gutachten") {
      if (typeof initPdfEngine === "function") initPdfEngine();
    }
  } catch(err) {
    console.error(`Error rendering tab ${tabId}:`, err);
  }
}

/* ==========================================================================
   PROFILE & CANDIDATE MANAGEMENT
   ========================================================================== */

function populateLAASelector() {
  const selector = document.getElementById("laaSelect");
  if (!selector || !appState) return;

  const currentId = appState.selectedLAA;
  const entries = Object.entries(appState.laas || {});

  if (entries.length === 0) {
    selector.innerHTML = `<option value="">➕ Kein Kandidat angelegt (+ Profil)</option>`;
    return;
  }

  let html = "";
  for (const [id, laa] of entries) {
    const isSelected = id === currentId ? "selected" : "";
    const roleBadge = laa.type ? ` [${laa.type}]` : "";
    html += `<option value="${id}" ${isSelected}>${laa.name}${roleBadge} (${laa.subject1 || 'Fach 1'}/${laa.subject2 || 'Fach 2'})</option>`;
  }
  selector.innerHTML = html;
}

function handleLAAChange(laaId) {
  if (!appState.laas[laaId]) return;
  appState.selectedLAA = laaId;
  saveState();
  switchTab(activeTabId);
  showToast(`Profil gewechselt: ${appState.laas[laaId]?.name}`, "👤");
}

function openAddLAAModal() {
  const bodyHTML = `
    <div class="form-group">
      <label>Vollständiger Name mit Anrede</label>
      <input id="newLAA_name" class="form-control" placeholder="z. B. Frau Sarah Könitzer" />
    </div>
    <div class="form-row-2col">
      <div class="form-group">
        <label>Geschlecht</label>
        <select id="newLAA_gender" class="form-control">
          <option value="f">Weiblich (Frau)</option>
          <option value="m">Männlich (Herr)</option>
          <option value="d">Divers</option>
        </select>
      </div>
      <div class="form-group">
        <label>Status / Lehrkraft-Typ</label>
        <select id="newLAA_type" class="form-control">
          <option value="LAA">Lehramtsanwärter/in (LAA)</option>
          <option value="NQ">Nachqualifizierende Lehrkraft (NQ)</option>
          <option value="WB">Weiterbildung (WB)</option>
        </select>
      </div>
    </div>
    <div class="form-row-2col">
      <div class="form-group">
        <label>1. Ausbildungsfach</label>
        <input id="newLAA_subject1" class="form-control" placeholder="z. B. Mathematik" />
      </div>
      <div class="form-group">
        <label>2. Ausbildungsfach</label>
        <input id="newLAA_subject2" class="form-control" placeholder="z. B. Physik" />
      </div>
    </div>
    <div class="form-group">
      <label>Ausbildungsschule &amp; Anschrift</label>
      <input id="newLAA_school" class="form-control" placeholder="z. B. Staatliche Regelschule Erfurt-Süd, Am Südpark 12" />
    </div>
    <div class="form-row-2col">
      <div class="form-group">
        <label>Schulart</label>
        <select id="newLAA_schoolType" class="form-control">
          <option value="Regelschule">Regelschule</option>
          <option value="Gymnasium">Gymnasium</option>
          <option value="Grundschule">Grundschule</option>
          <option value="Gemeinschaftsschule">Gemeinschaftsschule</option>
          <option value="Berufsbildende Schule">Berufsbildende Schule</option>
          <option value="Förderschule">Förderschule</option>
        </select>
      </div>
      <div class="form-group">
        <label>Schulische/r Mentor/in</label>
        <input id="newLAA_mentor" class="form-control" placeholder="z. B. OStR Wagner" />
      </div>
    </div>
    <div class="form-row-2col">
      <div class="form-group">
        <label>Ausbildungsbeginn</label>
        <input id="newLAA_startDate" type="date" class="form-control" value="${new Date().toISOString().split('T')[0]}" />
      </div>
      <div class="form-group">
        <label>Geplantes Ausbildungsende</label>
        <input id="newLAA_endDate" type="date" class="form-control" />
      </div>
    </div>
    <div class="form-group">
      <label>Kohorte / Einstellungsjahrgang</label>
      <input id="newLAA_cohort" class="form-control" placeholder="z. B. Einstellung 25-08" />
    </div>
  `;

  const footerHTML = `
    <button class="btn btn-outline" onclick="closeModal()">Abbrechen</button>
    <button class="btn btn-primary" onclick="saveNewLAA()">💾 Profil anlegen</button>
  `;

  openModal({ title: "➕ Neues Kandidatenprofil anlegen", bodyHTML, footerHTML });
}

function saveNewLAA() {
  const name = document.getElementById("newLAA_name")?.value.trim();
  if (!name) {
    showToast("Bitte geben Sie einen Namen ein!", "⚠️");
    return;
  }

  const id = "laa_" + Date.now();
  const gender = document.getElementById("newLAA_gender")?.value || "f";
  const type = document.getElementById("newLAA_type")?.value || "LAA";
  const subject1 = document.getElementById("newLAA_subject1")?.value || "Fach 1";
  const subject2 = document.getElementById("newLAA_subject2")?.value || "Fach 2";
  const school = document.getElementById("newLAA_school")?.value || "";
  const schoolType = document.getElementById("newLAA_schoolType")?.value || "Regelschule";
  const mentor = document.getElementById("newLAA_mentor")?.value || "";
  const startDate = document.getElementById("newLAA_startDate")?.value || new Date().toISOString().split('T')[0];
  const endDate = document.getElementById("newLAA_endDate")?.value || "";
  const cohort = document.getElementById("newLAA_cohort")?.value || "Einstellung 25-08";

  appState.laas[id] = {
    id, name, gender, type, subject1, subject2, school, schoolType, mentor, startDate, endDate, cohort,
    currentPhase: "Orientierungsphase (1. Ausbildungshalbjahr)",
    competencies: { unterrichten: 3.0, erziehen: 3.0, beurteilen: 3.0, beraten: 3.0, weiterentwickeln: 3.0 },
    scoresHistory: [],
    selfScores: [3.0, 3.0, 3.0, 3.0, 3.0, 3.0],
    goals: [],
    visits: [],
    seminars: [],
    appointments: []
  };

  appState.selectedLAA = id;
  saveState();
  populateLAASelector();
  closeModal();
  switchTab(activeTabId);
  showToast(`Profil für "${name}" erfolgreich erstellt!`, "✅");
}

function openEditLAAModal() {
  const cur = getCurrentLAA();
  if (!cur) return;

  const bodyHTML = `
    <div class="form-group">
      <label>Vollständiger Name mit Anrede</label>
      <input id="editLAA_name" class="form-control" value="${cur.name || ''}" />
    </div>
    <div class="form-row-2col">
      <div class="form-group">
        <label>Geschlecht</label>
        <select id="editLAA_gender" class="form-control">
          <option value="f" ${cur.gender === 'f' ? 'selected' : ''}>Weiblich (Frau)</option>
          <option value="m" ${cur.gender === 'm' ? 'selected' : ''}>Männlich (Herr)</option>
          <option value="d" ${cur.gender === 'd' ? 'selected' : ''}>Divers</option>
        </select>
      </div>
      <div class="form-group">
        <label>Status / Typ</label>
        <select id="editLAA_type" class="form-control">
          <option value="LAA" ${cur.type === 'LAA' ? 'selected' : ''}>Lehramtsanwärter/in (LAA)</option>
          <option value="NQ" ${cur.type === 'NQ' ? 'selected' : ''}>Nachqualifizierende Lehrkraft (NQ)</option>
          <option value="WB" ${cur.type === 'WB' ? 'selected' : ''}>Weiterbildung (WB)</option>
        </select>
      </div>
    </div>
    <div class="form-row-2col">
      <div class="form-group">
        <label>1. Ausbildungsfach</label>
        <input id="editLAA_subject1" class="form-control" value="${cur.subject1 || ''}" />
      </div>
      <div class="form-group">
        <label>2. Ausbildungsfach</label>
        <input id="editLAA_subject2" class="form-control" value="${cur.subject2 || ''}" />
      </div>
    </div>
    <div class="form-group">
      <label>Ausbildungsschule &amp; Anschrift</label>
      <input id="editLAA_school" class="form-control" value="${cur.school || ''}" />
    </div>
    <div class="form-row-2col">
      <div class="form-group">
        <label>Schulart</label>
        <select id="editLAA_schoolType" class="form-control">
          <option value="Regelschule" ${cur.schoolType === 'Regelschule' ? 'selected' : ''}>Regelschule</option>
          <option value="Gymnasium" ${cur.schoolType === 'Gymnasium' ? 'selected' : ''}>Gymnasium</option>
          <option value="Grundschule" ${cur.schoolType === 'Grundschule' ? 'selected' : ''}>Grundschule</option>
          <option value="Gemeinschaftsschule" ${cur.schoolType === 'Gemeinschaftsschule' ? 'selected' : ''}>Gemeinschaftsschule</option>
          <option value="Berufsbildende Schule" ${cur.schoolType === 'Berufsbildende Schule' ? 'selected' : ''}>Berufsbildende Schule</option>
          <option value="Förderschule" ${cur.schoolType === 'Förderschule' ? 'selected' : ''}>Förderschule</option>
        </select>
      </div>
      <div class="form-group">
        <label>Schulische/r Mentor/in</label>
        <input id="editLAA_mentor" class="form-control" value="${cur.mentor || ''}" />
      </div>
    </div>
    <div class="form-row-2col">
      <div class="form-group">
        <label>Ausbildungsbeginn</label>
        <input id="editLAA_startDate" type="date" class="form-control" value="${cur.startDate || ''}" />
      </div>
      <div class="form-group">
        <label>Geplantes Ausbildungsende</label>
        <input id="editLAA_endDate" type="date" class="form-control" value="${cur.endDate || ''}" />
      </div>
    </div>
    <div class="form-group">
      <label>Ausbildungsphase</label>
      <input id="editLAA_currentPhase" class="form-control" value="${cur.currentPhase || ''}" />
    </div>
  `;

  const footerHTML = `
    <button class="btn btn-outline" onclick="closeModal()">Abbrechen</button>
    <button class="btn btn-primary" onclick="saveEditedLAA()">💾 Änderungen speichern</button>
  `;

  openModal({ title: `✏️ Profil bearbeiten: ${cur.name}`, bodyHTML, footerHTML });
}

function saveEditedLAA() {
  const cur = getCurrentLAA();
  if (!cur) return;

  cur.name = document.getElementById("editLAA_name")?.value || cur.name;
  cur.gender = document.getElementById("editLAA_gender")?.value || cur.gender;
  cur.type = document.getElementById("editLAA_type")?.value || cur.type;
  cur.subject1 = document.getElementById("editLAA_subject1")?.value || cur.subject1;
  cur.subject2 = document.getElementById("editLAA_subject2")?.value || cur.subject2;
  cur.school = document.getElementById("editLAA_school")?.value || cur.school;
  cur.schoolType = document.getElementById("editLAA_schoolType")?.value || cur.schoolType;
  cur.mentor = document.getElementById("editLAA_mentor")?.value || cur.mentor;
  cur.startDate = document.getElementById("editLAA_startDate")?.value || cur.startDate;
  cur.endDate = document.getElementById("editLAA_endDate")?.value || cur.endDate;
  cur.currentPhase = document.getElementById("editLAA_currentPhase")?.value || cur.currentPhase;

  saveState();
  populateLAASelector();
  closeModal();
  switchTab(activeTabId);
  showToast("Profiländerungen gespeichert!", "✅");
}

function confirmDeleteLAA() {
  const cur = getCurrentLAA();
  if (!cur) return;
  const keys = Object.keys(appState.laas);
  if (keys.length <= 1) {
    showToast("Das letzte verbleibende Profil kann nicht gelöscht werden!", "⚠️");
    return;
  }

  const bodyHTML = `
    <p>Möchten Sie das Profil von <strong>${cur.name}</strong> wirklich unwiderruflich löschen?</p>
    <p style="color:var(--text-muted); font-size:0.85rem; margin-top:8px;">Alle zugehörigen Unterrichtsbesuche, Notizen, Ziele und Seminarstände werden gelöscht.</p>
  `;

  const footerHTML = `
    <button class="btn btn-outline" onclick="closeModal()">Abbrechen</button>
    <button class="btn btn-danger" onclick="executeDeleteLAA('${cur.id}')">🗑️ Unwiderruflich löschen</button>
  `;

  openModal({ title: "⚠️ Profil löschen bestätigen", bodyHTML, footerHTML });
}

function executeDeleteLAA(id) {
  delete appState.laas[id];
  const remainingKeys = Object.keys(appState.laas);
  appState.selectedLAA = remainingKeys[0] || "";
  saveState();
  populateLAASelector();
  closeModal();
  switchTab("tab-dashboard");
  showToast("Profil gelöscht.", "🗑️");
}

function exportDataJSON() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appState, null, 2));
  const link = document.createElement("a");
  link.setAttribute("href", dataStr);
  link.setAttribute("download", `Fachleiter_Suite_Backup_${new Date().toISOString().split('T')[0]}.json`);
  link.click();
  showToast("Vollständiges Backup erfolgreich exportiert!", "💾");
}

function triggerJSONImport() {
  const input = document.getElementById("importFileInput");
  if (input) input.click();
}

function importDataJSON(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (data && data.laas && typeof data.laas === 'object') {
        appState = data;
        saveState();
        populateLAASelector();
        switchTab("tab-dashboard");
        showToast("Daten erfolgreich wiederhergestellt!", "✅");
      } else {
        showToast("Ungültiges Dateiformat!", "❌");
      }
    } catch (err) {
      showToast("Fehler beim Lesen der Backup-Datei!", "❌");
    }
  };
  reader.readAsText(file);
}

/* ==========================================================================
   TAB 1: DASHBOARD
   ========================================================================== */

function renderDashboard() {
  const cur = getCurrentLAA();
  const bannerEl = document.getElementById("dashboardUpcomingBanner");
  const profileContainer = document.getElementById("dashboardProfileGrid");

  if (!cur) {
    if (bannerEl) bannerEl.style.display = "none";
    if (profileContainer) {
      profileContainer.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 40px 20px; text-align: center; background: white; border-radius: 12px; border: 2px dashed #cbd5e1;">
          <div style="font-size: 3rem; margin-bottom: 12px;">👥</div>
          <h2 style="font-size: 1.3rem; margin-bottom: 8px; color: #1e293b;">Herzlich willkommen in Ihrer Fachleiter 360° Suite</h2>
          <p style="color: #64748b; font-size: 0.95rem; max-width: 540px; margin: 0 auto 20px;">Es ist aktuell noch kein Ausbildungs- oder Prüfungskandidat angelegt. Starten Sie, indem Sie Ihr erstes Profil anlegen.</p>
          <button class="btn btn-primary" onclick="openAddLAAModal()" style="padding: 10px 24px; font-size: 1rem;">➕ Erstes Kandidatenprofil anlegen</button>
        </div>
      `;
    }
    const visitsTable = document.getElementById("dashboardVisitsTableBody");
    if (visitsTable) visitsTable.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#94a3b8; padding:20px;">Noch keine Unterrichtsbesuche vorhanden</td></tr>';
    const goalsList = document.getElementById("dashboardGoalsList");
    if (goalsList) goalsList.innerHTML = '<div style="text-align:center; color:#94a3b8; padding:20px;">Noch keine Entwicklungsziele vorhanden</div>';
    const appointmentsList = document.getElementById("dashboardAppointmentsList");
    if (appointmentsList) appointmentsList.innerHTML = '<div style="text-align:center; color:#94a3b8; padding:20px;">Noch keine anstehenden Termine vorhanden</div>';
    return;
  }

  // Upcoming Banner
  if (bannerEl) {
    const upcoming = (cur.appointments || []).find(a => new Date(a.date) >= new Date(new Date().setHours(0,0,0,0)));
    if (upcoming) {
      bannerEl.style.display = "flex";
      bannerEl.innerHTML = `
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="font-size:1.4rem;">📅</span>
          <div>
            <strong>Nächster Termin: ${upcoming.title}</strong>
            <div style="font-size:0.78rem; color:var(--text-muted);">${new Date(upcoming.date).toLocaleDateString('de-DE')} um ${upcoming.time || '–'} Uhr • ${upcoming.location || 'Seminar'}</div>
          </div>
        </div>
        <button class="btn btn-outline" style="font-size:0.78rem; padding:4px 10px;" onclick="exportSingleAppointmentICS('${upcoming.id}')">📅 Kalender (.ics)</button>
      `;
    } else {
      bannerEl.style.display = "none";
    }
  }

  // Profile Grid
  const profileContainer = document.getElementById("dashboardProfileGrid");
  if (profileContainer) {
    profileContainer.innerHTML = `
      <div class="profile-item">
        <span class="profile-label">Kandidat / Status</span>
        <span class="profile-value">${cur.name} (${getRoleTitle(cur.type, cur.gender)})</span>
      </div>
      <div class="profile-item">
        <span class="profile-label">Ausbildungsfächer</span>
        <span class="profile-value">${cur.subject1 || '-'} / ${cur.subject2 || '-'}</span>
      </div>
      <div class="profile-item">
        <span class="profile-label">Ausbildungsschule</span>
        <span class="profile-value">${cur.school || '-'}</span>
      </div>
      <div class="profile-item">
        <span class="profile-label">Schulische/r Mentor/in</span>
        <span class="profile-value">${cur.mentor || '-'}</span>
      </div>
      <div class="profile-item">
        <span class="profile-label">Ausbildungszeitraum</span>
        <span class="profile-value">${calcDurationString(cur.startDate, cur.endDate)}</span>
      </div>
      <div class="profile-item">
        <span class="profile-label">Aktuelle Phase</span>
        <span class="profile-value">${cur.currentPhase || 'Hauptphase'}</span>
      </div>
    `;
  }

  // Render Radar Chart
  renderDashboardRadar(cur);

  // Render Goals List
  renderDashboardGoals(cur);

  // Render Visits Table
  renderDashboardVisits(cur);

  // Render Appointments List
  renderDashboardAppointments(cur);
}

function renderDashboardRadar(cur) {
  const canvas = document.getElementById("radarCanvasDashboard");
  if (!canvas || typeof Chart === 'undefined') return;

  const ctx = canvas.getContext("2d");
  if (dashboardRadarChart) dashboardRadarChart.destroy();

  const labels = typeof CRITERIA_DIMS !== 'undefined' ? CRITERIA_DIMS : [
    "Fachdidaktik & Struktur",
    "Klassenführung & Präsenz",
    "Unterrichtsplanung & Ziele",
    "Heterogenität & Differenzierung",
    "Diagnostik & Feedback",
    "Reflexion & Haltung"
  ];

  let scores = [3.5, 3.5, 3.5, 3.5, 3.5, 3.5];
  if (cur.scoresHistory && cur.scoresHistory.length > 0) {
    scores = cur.scoresHistory[cur.scoresHistory.length - 1];
  } else if (cur.competencies) {
    scores = [
      cur.competencies.unterrichten || 3.5,
      cur.competencies.erziehen || 3.5,
      cur.competencies.beurteilen || 3.5,
      cur.competencies.beraten || 3.5,
      cur.competencies.weiterentwickeln || 3.5,
      3.8
    ];
  }

  try {
    dashboardRadarChart = new Chart(ctx, {
      type: "radar",
      data: {
        labels: labels,
        datasets: [
          {
            label: `Aktueller Stand (${cur.name})`,
            data: scores,
            backgroundColor: "rgba(59, 130, 246, 0.2)",
            borderColor: "#2563eb",
            pointBackgroundColor: "#1d4ed8",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "#1d4ed8",
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            min: 1,
            max: 5,
            ticks: { stepSize: 1, backdropColor: "transparent" },
            grid: { color: "rgba(0, 0, 0, 0.08)" },
            angleLines: { color: "rgba(0, 0, 0, 0.08)" },
            pointLabels: { font: { size: 11, weight: "bold" }, color: "#334155" }
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  } catch(e) {
    console.warn("Chart render warning:", e);
  }
}

function renderDashboardGoals(cur) {
  const container = document.getElementById("dashboardGoalsList");
  if (!container) return;

  const goals = cur.goals || [];
  if (goals.length === 0) {
    container.innerHTML = `<li style="color:var(--text-muted); font-size:0.84rem; font-style:italic; padding:10px 0;">Keine Entwicklungsziele hinterlegt.</li>`;
    return;
  }

  container.innerHTML = goals.map(g => {
    let statusClass = "status-open";
    let statusText = "Offen";
    if (g.status === "progress") { statusClass = "status-progress"; statusText = "In Arbeit"; }
    if (g.status === "done") { statusClass = "status-done"; statusText = "Erreicht"; }

    return `
      <li class="goal-item">
        <div style="flex:1;">
          <div style="font-weight:600; color:var(--text-main);">${g.text}</div>
          <div class="goal-meta">Quelle: ${g.source || 'Beratungsgespräch'} • Seit: ${g.createdAt || '-'}</div>
        </div>
        <div class="goal-actions">
          <span class="goal-status ${statusClass}" onclick="toggleGoalStatus('${g.id}')" title="Klicken zum Ändern des Status">${statusText}</span>
          <button class="btn btn-ghost btn-icon-only" onclick="deleteGoal('${g.id}')" title="Ziel löschen">✕</button>
        </div>
      </li>
    `;
  }).join('');
}

function toggleGoalStatus(goalId) {
  const cur = getCurrentLAA();
  if (!cur || !cur.goals) return;
  const goal = cur.goals.find(g => g.id === goalId);
  if (!goal) return;

  if (goal.status === "open") goal.status = "progress";
  else if (goal.status === "progress") goal.status = "done";
  else goal.status = "open";

  saveState();
  renderDashboardGoals(cur);
}

function deleteGoal(goalId) {
  const cur = getCurrentLAA();
  if (!cur || !cur.goals) return;
  cur.goals = cur.goals.filter(g => g.id !== goalId);
  saveState();
  renderDashboardGoals(cur);
  showToast("Ziel entfernt.", "🗑️");
}

function openAddGoalModal() {
  const bodyHTML = `
    <div class="form-group">
      <label>Zielbeschreibung / Entwicklungsaufgabe</label>
      <textarea id="newGoal_text" class="form-control" rows="3" placeholder="z. B. Wartezeit nach Impulsfragen konsequent auf >3 Sek. ausdehnen..."></textarea>
    </div>
    <div class="form-group">
      <label>Quelle / Anlass</label>
      <input id="newGoal_source" class="form-control" placeholder="z. B. 2. Unterrichtsbesuch Nachbesprechung" />
    </div>
  `;

  const footerHTML = `
    <button class="btn btn-outline" onclick="closeModal()">Abbrechen</button>
    <button class="btn btn-primary" onclick="saveNewGoal()">💾 Ziel speichern</button>
  `;

  openModal({ title: "🎯 Neues Entwicklungsziel vereinbaren", bodyHTML, footerHTML });
}

function saveNewGoal() {
  const text = document.getElementById("newGoal_text")?.value.trim();
  if (!text) {
    showToast("Bitte Zieltext eingeben!", "⚠️");
    return;
  }
  const source = document.getElementById("newGoal_source")?.value.trim() || "Beratungsgespräch";
  const cur = getCurrentLAA();
  if (!cur) return;

  if (!cur.goals) cur.goals = [];
  cur.goals.push({
    id: "g_" + Date.now(),
    text,
    source,
    status: "open",
    createdAt: new Date().toLocaleDateString('de-DE')
  });

  saveState();
  closeModal();
  renderDashboardGoals(cur);
  showToast("Neues Ziel hinzugefügt!", "🎯");
}

function renderDashboardVisits(cur) {
  const tbody = document.getElementById("dashboardVisitsTableBody");
  if (!tbody) return;

  const visits = cur.visits || [];
  if (visits.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:16px;">Bislang keine dokumentierten Unterrichtsbesuche vorhanden.</td></tr>`;
    return;
  }

  tbody.innerHTML = visits.map((v, idx) => {
    return `
      <tr>
        <td><strong>#${idx + 1}</strong></td>
        <td>${v.date ? new Date(v.date).toLocaleDateString('de-DE') : '-'}</td>
        <td>${v.phase || '-'}</td>
        <td><strong>${v.topic || '-'}</strong></td>
        <td><span class="badge-pill" style="background:#dbeafe; color:#1e40af; font-weight:700;">${v.grade || '–'}</span></td>
        <td>
          <div style="display:flex; gap:6px;">
            <button class="btn btn-outline" style="font-size:0.74rem; padding:3px 8px; min-height:28px;" onclick="viewVisitDetails('${v.id}')">🔍 Details</button>
            <button class="btn btn-ghost" style="font-size:0.74rem; padding:3px 8px; min-height:28px; color:var(--danger);" onclick="deleteVisit('${v.id}')">✕</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function viewVisitDetails(visitId) {
  const cur = getCurrentLAA();
  if (!cur || !cur.visits) return;
  const v = cur.visits.find(item => item.id === visitId);
  if (!v) return;

  let logHtml = "";
  if (v.log && v.log.length > 0) {
    logHtml = `
      <div style="margin-top:14px;">
        <strong style="font-size:0.84rem; display:block; margin-bottom:8px;">⏱️ Protokollierte Beobachtungen:</strong>
        <div class="log-container" style="max-height:180px;">
          ${v.log.map(l => `
            <div class="log-item">
              <span class="log-time">${l.time || '00:00'}</span>
              <span class="log-phase">${l.phase || 'Phase'}</span>
              <span>${l.text}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  const bodyHTML = `
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; font-size:0.86rem; margin-bottom:14px;">
      <div><strong>Datum:</strong> ${v.date ? new Date(v.date).toLocaleDateString('de-DE') : '-'}</div>
      <div><strong>Phase:</strong> ${v.phase || '-'}</div>
      <div style="grid-column:1/-1;"><strong>Thema:</strong> ${v.topic || '-'}</div>
      <div style="grid-column:1/-1;"><strong>Schwerpunkt:</strong> ${v.focus || '-'}</div>
      <div style="grid-column:1/-1;"><strong>Bewertung / Gesamtnote:</strong> ${v.grade || '-'}</div>
    </div>
    <div class="form-group">
      <label>Zusammenfassende Notizen &amp; Absprachen</label>
      <div style="background:#f8fafc; padding:12px; border-radius:6px; border:1px solid var(--border); font-size:0.86rem; line-height:1.5;">
        ${v.notes || 'Keine zusätzlichen Notizen hinterlegt.'}
      </div>
    </div>
    ${logHtml}
  `;

  openModal({ title: `🔍 Details: ${v.topic || 'Unterrichtsbesuch'}`, bodyHTML });
}

function deleteVisit(visitId) {
  const cur = getCurrentLAA();
  if (!cur || !cur.visits) return;
  if (!confirm("Diesen Besuch wirklich aus der Historie entfernen?")) return;

  cur.visits = cur.visits.filter(v => v.id !== visitId);
  saveState();
  renderDashboardVisits(cur);
  showToast("Besuch gelöscht.", "🗑️");
}

function renderDashboardAppointments(cur) {
  const container = document.getElementById("dashboardAppointmentsList");
  if (!container) return;

  const appts = cur.appointments || [];
  if (appts.length === 0) {
    container.innerHTML = `<li style="color:var(--text-muted); font-size:0.84rem; font-style:italic; padding:10px 0;">Keine anstehenden Termine eingetragen.</li>`;
    return;
  }

  container.innerHTML = appts.map(a => {
    return `
      <li class="goal-item">
        <div style="flex:1;">
          <div style="font-weight:700; color:var(--text-main);">${a.title}</div>
          <div class="goal-meta">📅 ${a.date ? new Date(a.date).toLocaleDateString('de-DE') : '-'} um ${a.time || '–'} Uhr • 📍 ${a.location || 'Schule'}</div>
          ${a.notes ? `<div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">${a.notes}</div>` : ''}
        </div>
        <div class="goal-actions">
          <button class="btn btn-outline" style="font-size:0.72rem; padding:3px 8px; min-height:26px;" onclick="exportSingleAppointmentICS('${a.id}')" title="Als Outlook/iCal Kalendertermin exportieren">📅 .ics</button>
          <button class="btn btn-ghost btn-icon-only" onclick="deleteAppointment('${a.id}')" title="Termin löschen">✕</button>
        </div>
      </li>
    `;
  }).join('');
}

function openAddAppointmentModal() {
  const bodyHTML = `
    <div class="form-group">
      <label>Terminbezeichnung</label>
      <input id="newAppt_title" class="form-control" placeholder="z. B. 4. Unterrichtsbesuch (Physik 9a)" />
    </div>
    <div class="form-row-2col">
      <div class="form-group">
        <label>Datum</label>
        <input id="newAppt_date" type="date" class="form-control" value="${new Date().toISOString().split('T')[0]}" />
      </div>
      <div class="form-group">
        <label>Uhrzeit</label>
        <input id="newAppt_time" type="time" class="form-control" value="09:45" />
      </div>
    </div>
    <div class="form-row-2col">
      <div class="form-group">
        <label>Terminart</label>
        <select id="newAppt_type" class="form-control">
          <option value="Unterrichtsbesuch (UB)">Unterrichtsbesuch (UB)</option>
          <option value="Beratungsgespräch">Beratungsgespräch</option>
          <option value="Lehrprobe / Prüfung">Lehrprobe / Prüfung</option>
          <option value="Seminarveranstaltung">Seminarveranstaltung</option>
          <option value="Dienstbesprechung">Dienstbesprechung</option>
        </select>
      </div>
      <div class="form-group">
        <label>Ort / Raum</label>
        <input id="newAppt_location" class="form-control" placeholder="z. B. Physikraum 104, RS Erfurt-Süd" />
      </div>
    </div>
    <div class="form-group">
      <label>Notizen / Vorbereitung</label>
      <input id="newAppt_notes" class="form-control" placeholder="z. B. Entwurf 2 Tage vorher per Mail anfordern" />
    </div>
  `;

  const footerHTML = `
    <button class="btn btn-outline" onclick="closeModal()">Abbrechen</button>
    <button class="btn btn-primary" onclick="saveNewAppointment()">💾 Termin speichern</button>
  `;

  openModal({ title: "📅 Neuen Termin planen", bodyHTML, footerHTML });
}

function saveNewAppointment() {
  const title = document.getElementById("newAppt_title")?.value.trim();
  if (!title) {
    showToast("Bitte Titel eingeben!", "⚠️");
    return;
  }

  const cur = getCurrentLAA();
  if (!cur) return;
  if (!cur.appointments) cur.appointments = [];

  cur.appointments.push({
    id: "a_" + Date.now(),
    title,
    date: document.getElementById("newAppt_date")?.value || "",
    time: document.getElementById("newAppt_time")?.value || "",
    type: document.getElementById("newAppt_type")?.value || "Unterrichtsbesuch (UB)",
    location: document.getElementById("newAppt_location")?.value || "",
    notes: document.getElementById("newAppt_notes")?.value || ""
  });

  saveState();
  closeModal();
  renderDashboard(cur);
  showToast("Termin angelegt!", "📅");
}

function deleteAppointment(appId) {
  const cur = getCurrentLAA();
  if (!cur || !cur.appointments) return;
  cur.appointments = cur.appointments.filter(a => a.id !== appId);
  saveState();
  renderDashboard(cur);
  showToast("Termin entfernt.", "🗑️");
}

/* ==========================================================================
   TAB 2: LIVE-HOSPITATION COCKPIT
   ========================================================================= */

function initLiveCockpit() {
  initSpeechRecognition();
}

function renderLiveCockpitUI() {
  renderLiveCriteriaGrid();
  renderLiveLogStream();
  updateTimerDisplay();
}

function updateTimerDisplay() {
  const el = document.getElementById("liveTimerDisplay");
  if (!el) return;
  const m = Math.floor(liveTimerSeconds / 60).toString().padStart(2, '0');
  const s = (liveTimerSeconds % 60).toString().padStart(2, '0');
  el.innerText = `${m}:${s}`;
}

function toggleTimer() {
  const btn = document.getElementById("btnToggleTimer");
  if (liveTimerRunning) {
    clearInterval(liveTimerInterval);
    liveTimerRunning = false;
    if (btn) {
      btn.innerText = "▶ Start";
      btn.className = "btn btn-primary";
    }
  } else {
    liveTimerRunning = true;
    liveTimerInterval = setInterval(() => {
      liveTimerSeconds++;
      updateTimerDisplay();
    }, 1000);
    if (btn) {
      btn.innerText = "⏸ Pause";
      btn.className = "btn btn-warning";
    }
  }
}

function resetTimer() {
  clearInterval(liveTimerInterval);
  liveTimerRunning = false;
  liveTimerSeconds = 0;
  updateTimerDisplay();
  const btn = document.getElementById("btnToggleTimer");
  if (btn) {
    btn.innerText = "▶ Start";
    btn.className = "btn btn-primary";
  }
}

function renderLiveCriteriaGrid() {
  const container = document.getElementById("liveCriteriaGrid");
  if (!container) return;

  const dims = typeof CRITERIA_DIMS !== 'undefined' ? CRITERIA_DIMS : [
    "Fachdidaktik & Struktur",
    "Klassenführung & Präsenz",
    "Unterrichtsplanung & Ziele",
    "Heterogenität & Differenzierung",
    "Diagnostik & Feedback",
    "Reflexion & Haltung"
  ];

  container.innerHTML = dims.map((dim, idx) => {
    const currentScore = liveScores[idx];
    return `
      <div class="crit-card">
        <div class="crit-title">${dim}</div>
        <div class="crit-buttons">
          ${[1, 2, 3, 4, 5].map(lvl => `
            <button 
              type="button"
              class="crit-btn lvl-${lvl} ${currentScore === lvl ? 'active' : ''}"
              onclick="rateCrit(${idx}, ${lvl})"
            >${lvl}</button>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');
}

function rateCrit(dimIdx, score) {
  liveScores[dimIdx] = score;
  renderLiveCriteriaGrid();
}

function insertPhrase(phrase) {
  const input = document.getElementById("liveNoteInput");
  if (!input) return;
  input.value = input.value ? `${input.value} ${phrase}` : phrase;
  input.focus();
}

function addLiveNote() {
  const input = document.getElementById("liveNoteInput");
  const phaseSelect = document.getElementById("livePhaseSelect");
  if (!input || !input.value.trim()) return;

  const text = input.value.trim();
  const phase = phaseSelect ? phaseSelect.value : "Erarbeitung";
  const m = Math.floor(liveTimerSeconds / 60).toString().padStart(2, '0');
  const s = (liveTimerSeconds % 60).toString().padStart(2, '0');
  const time = `${m}:${s}`;

  liveLogs.unshift({ time, phase, text, id: "log_" + Date.now() });
  input.value = "";
  renderLiveLogStream();
}

function renderLiveLogStream() {
  const container = document.getElementById("liveLogStream");
  if (!container) return;

  if (liveLogs.length === 0) {
    container.innerHTML = `<div style="text-align:center; color:var(--text-muted); font-size:0.84rem; padding:20px; font-style:italic;">Noch keine Protokolleinträge während dieser Hospitation erfasst.</div>`;
    return;
  }

  container.innerHTML = liveLogs.map(l => `
    <div class="log-item">
      <span class="log-time">${l.time}</span>
      <span class="log-phase">${l.phase}</span>
      <span>${l.text}</span>
      <button class="btn btn-ghost btn-icon-only" style="padding:0 6px; font-size:0.75rem;" onclick="deleteLiveLogItem('${l.id}')">✕</button>
    </div>
  `).join('');
}

function deleteLiveLogItem(logId) {
  liveLogs = liveLogs.filter(l => l.id !== logId);
  renderLiveLogStream();
}

function confirmClearLog() {
  if (liveLogs.length === 0) return;
  if (confirm("Möchten Sie das Live-Protokoll wirklich leeren?")) {
    liveLogs = [];
    renderLiveLogStream();
    showToast("Live-Protokoll zurückgesetzt.", "ℹ️");
  }
}

function initSpeechRecognition() {
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    speechRecognition = new SpeechRec();
    speechRecognition.continuous = true;
    speechRecognition.interimResults = true;
    speechRecognition.lang = 'de-DE';

    speechRecognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        const input = document.getElementById("liveNoteInput");
        if (input) {
          input.value = input.value ? `${input.value} ${finalTranscript}` : finalTranscript;
        }
      }
    };

    speechRecognition.onerror = (e) => {
      console.warn("Speech recognition error:", e);
      stopDictation();
    };

    speechRecognition.onend = () => {
      if (isDictating) speechRecognition.start();
    };
  }
}

function toggleDictation() {
  if (!speechRecognition) {
    showToast("Spracherkennung wird in diesem Browser leider nicht unterstützt.", "⚠️");
    return;
  }

  if (isDictating) {
    stopDictation();
  } else {
    startDictation();
  }
}

function startDictation() {
  try {
    speechRecognition.start();
    isDictating = true;
    const btn = document.getElementById("btnLiveMic");
    if (btn) {
      btn.classList.add("listening");
      btn.innerText = "🛑 Stopp";
    }
    showToast("Diktierfunktion aktiv (Sprechen Sie jetzt)...", "🎙️");
  } catch(e) {}
}

function stopDictation() {
  try {
    speechRecognition.stop();
    isDictating = false;
    const btn = document.getElementById("btnLiveMic");
    if (btn) {
      btn.classList.remove("listening");
      btn.innerText = "🎤 Diktieren";
    }
    showToast("Diktierfunktion beendet.", "ℹ️");
  } catch(e) {}
}

function openFinishVisitModal() {
  const cur = getCurrentLAA();
  if (!cur) return;

  const avgScore = (liveScores.reduce((a, b) => a + (b || 3), 0) / liveScores.length).toFixed(1);

  const bodyHTML = `
    <div class="form-group">
      <label>Thema der Unterrichtsstunde</label>
      <input id="finishVisit_topic" class="form-control" placeholder="z. B. Einführung in die Integralrechnung" />
    </div>
    <div class="form-row-2col">
      <div class="form-group">
        <label>Ausbildungsphase / Besuchstyp</label>
        <select id="finishVisit_phase" class="form-control">
          <option value="Hauptphase 1">Hauptphase (1. UB)</option>
          <option value="Hauptphase 2">Hauptphase (2. UB)</option>
          <option value="Orientierungsphase">Orientierungsphase</option>
          <option value="Prüfungsphase">Prüfungsphase</option>
        </select>
      </div>
      <div class="form-group">
        <label>Vorläufige Notentendenz / Ziffernnote</label>
        <input id="finishVisit_grade" class="form-control" value="${avgScore >= 4.0 ? '1.7' : (avgScore >= 3.0 ? '2.3' : '3.0')}" />
      </div>
    </div>
    <div class="form-group">
      <label>Beobachtungsschwerpunkt</label>
      <input id="finishVisit_focus" class="form-control" placeholder="z. B. Kognitive Aktivierung &amp; Gesprächsführung" />
    </div>
    <div class="form-group">
      <label>Abschließende Nachbesprechungs-Notizen</label>
      <textarea id="finishVisit_notes" class="form-control" rows="3" placeholder="Zusammenfassung der Stärken und nächsten Entwicklungsschritte..."></textarea>
    </div>
  `;

  const footerHTML = `
    <button class="btn btn-outline" onclick="closeModal()">Abbrechen</button>
    <button class="btn btn-primary" onclick="saveFinishedVisit()">💾 Besuch abschließen &amp; speichern</button>
  `;

  openModal({ title: `🏁 Hospitation abschließen (${cur.name})`, bodyHTML, footerHTML });
}

function saveFinishedVisit() {
  const topic = document.getElementById("finishVisit_topic")?.value.trim() || "Unterrichtsbesuch";
  const phase = document.getElementById("finishVisit_phase")?.value || "Hauptphase";
  const grade = document.getElementById("finishVisit_grade")?.value || "2.0";
  const focus = document.getElementById("finishVisit_focus")?.value || "";
  const notes = document.getElementById("finishVisit_notes")?.value || "";

  const cur = getCurrentLAA();
  if (!cur) return;

  if (!cur.visits) cur.visits = [];
  if (!cur.scoresHistory) cur.scoresHistory = [];

  cur.visits.push({
    id: "v_" + Date.now(),
    date: new Date().toISOString().split('T')[0],
    phase,
    topic,
    grade,
    focus,
    notes,
    scores: [...liveScores],
    log: [...liveLogs]
  });

  cur.scoresHistory.push([...liveScores]);

  saveState();
  closeModal();
  resetTimer();
  liveLogs = [];
  showToast("Unterrichtsbesuch erfolgreich in Entwicklungsakte gesichert!", "🎉");
  switchTab("tab-dashboard");
}

/* ==========================================================================
   TAB 4: PROGRESSIONS-VERGLEICH
   ========================================================================== */

function renderProgressionTab() {
  renderProgressionChart();
  renderProgressionTable();
}

function setProgressionFilter(filter) {
  appState.selectedProgressionUB = filter;
  saveState();

  document.querySelectorAll(".progression-filter-btn").forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("onclick")?.includes(filter));
  });

  renderProgressionChart();
  renderProgressionTable();
}

function renderProgressionChart() {
  const canvas = document.getElementById("radarCanvasProgression");
  if (!canvas || typeof Chart === 'undefined') return;

  const cur = getCurrentLAA();
  if (!cur) return;

  const ctx = canvas.getContext("2d");
  if (progressionRadarChart) progressionRadarChart.destroy();

  const labels = typeof CRITERIA_DIMS !== 'undefined' ? CRITERIA_DIMS : [
    "Fachdidaktik & Struktur",
    "Klassenführung & Präsenz",
    "Unterrichtsplanung & Ziele",
    "Heterogenität & Differenzierung",
    "Diagnostik & Feedback",
    "Reflexion & Haltung"
  ];

  const history = cur.scoresHistory || [];
  const datasets = [];

  const colors = [
    { bg: "rgba(239, 68, 68, 0.15)", border: "#ef4444" },
    { bg: "rgba(245, 158, 11, 0.15)", border: "#f59e0b" },
    { bg: "rgba(59, 130, 246, 0.2)", border: "#2563eb" },
    { bg: "rgba(16, 185, 129, 0.25)", border: "#059669" }
  ];

  if (history.length === 0) {
    datasets.push({
      label: "Keine Verlaufsdaten",
      data: [3, 3, 3, 3, 3, 3],
      borderColor: "#cbd5e1"
    });
  } else {
    history.forEach((scores, idx) => {
      const col = colors[idx % colors.length];
      datasets.push({
        label: `${idx + 1}. UB (${cur.visits && cur.visits[idx] ? cur.visits[idx].topic : 'Besuch'})`,
        data: scores,
        backgroundColor: col.bg,
        borderColor: col.border,
        borderWidth: 2,
        pointBackgroundColor: col.border
      });
    });
  }

  try {
    progressionRadarChart = new Chart(ctx, {
      type: "radar",
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            min: 1,
            max: 5,
            ticks: { stepSize: 1, backdropColor: "transparent" },
            grid: { color: "rgba(0, 0, 0, 0.08)" },
            angleLines: { color: "rgba(0, 0, 0, 0.08)" },
            pointLabels: { font: { size: 11, weight: "bold" }, color: "#334155" }
          }
        }
      }
    });
  } catch(e) {
    console.warn("Progression Chart render warning:", e);
  }
}

function renderProgressionTable() {
  const container = document.getElementById("progressionHistoryTableWrap");
  if (!container) return;

  const cur = getCurrentLAA();
  if (!cur) return;

  const dims = typeof CRITERIA_DIMS !== 'undefined' ? CRITERIA_DIMS : [
    "Fachdidaktik & Struktur",
    "Klassenführung & Präsenz",
    "Unterrichtsplanung & Ziele",
    "Heterogenität & Differenzierung",
    "Diagnostik & Feedback",
    "Reflexion & Haltung"
  ];

  const history = cur.scoresHistory || [];
  if (history.length === 0) {
    container.innerHTML = `<div style="text-align:center; color:var(--text-muted); padding:20px; font-style:italic;">Keine Verlaufsdaten vorhanden.</div>`;
    return;
  }

  let html = `
    <div class="table-responsive">
      <table class="standard-table">
        <thead>
          <tr>
            <th>Kompetenzdimension</th>
            ${history.map((_, idx) => `<th>UB #${idx + 1}</th>`).join('')}
            <th>Entwicklung / Delta</th>
          </tr>
        </thead>
        <tbody>
  `;

  dims.forEach((dim, dIdx) => {
    const scoresForDim = history.map(h => h[dIdx] || 0);
    const first = scoresForDim[0] || 0;
    const last = scoresForDim[scoresForDim.length - 1] || 0;
    const delta = (last - first).toFixed(1);
    const deltaColor = delta > 0 ? '#16a34a' : (delta < 0 ? '#dc2626' : '#64748b');

    html += `
      <tr>
        <td><strong>${dim}</strong></td>
        ${scoresForDim.map(s => `<td><span class="badge-pill" style="background:#f1f5f9; font-weight:700;">${s.toFixed(1)}</span></td>`).join('')}
        <td>
          <strong style="color:${deltaColor}; font-size:0.88rem;">
            ${delta > 0 ? '+' : ''}${delta}
          </strong>
        </td>
      </tr>
    `;
  });

  html += `</tbody></table></div>`;
  container.innerHTML = html;
}

/* ==========================================================================
   TAB 5: SEMINARPLANER & KMK-KOMPETENZEN
   ========================================================================== */

function renderSeminarTab() {
  const container = document.getElementById("seminarModuleTableBody");
  if (!container) return;

  const cur = getCurrentLAA();
  if (!cur) return;

  const seminars = cur.seminars || [];
  if (seminars.length === 0) {
    container.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:20px;">Keine Seminarmodule erfasst.</td></tr>`;
    return;
  }

  container.innerHTML = seminars.map(s => `
    <tr>
      <td><strong>${s.title}</strong></td>
      <td><span class="badge-pill" style="background:#e0e7ff; color:#3730a3; font-weight:700;">${s.kmk || 'KMK'}</span></td>
      <td>${s.date || '-'}</td>
      <td><span class="badge-pill" style="background:#dcfce7; color:#15803d; font-weight:700;">${s.status || 'Teilgenommen'}</span></td>
      <td>
        <strong style="color:var(--primary); font-size:0.82rem; display:block;">${s.transfer || '-'}</strong>
        <span style="font-size:0.75rem; color:var(--text-muted);">${s.transferNote || ''}</span>
      </td>
      <td>
        <button class="btn btn-ghost" style="padding:2px 8px; color:var(--danger);" onclick="deleteSeminar('${s.id}')">✕</button>
      </td>
    </tr>
  `).join('');
}

function openAddSeminarModal() {
  const bodyHTML = `
    <div class="form-group">
      <label>Modulbezeichnung</label>
      <input id="newSem_title" class="form-control" placeholder="z. B. M 06: Heterogenität &amp; Inklusion" />
    </div>
    <div class="form-row-2col">
      <div class="form-group">
        <label>KMK-Handlungsfeld</label>
        <select id="newSem_kmk" class="form-control">
          <option value="Unterrichten">Unterrichten</option>
          <option value="Erziehen">Erziehen</option>
          <option value="Beurteilen">Beurteilen</option>
          <option value="Beraten">Beraten</option>
          <option value="Innovieren">Innovieren / Schulentwicklung</option>
        </select>
      </div>
      <div class="form-group">
        <label>Datum der Seminarsitzung</label>
        <input id="newSem_date" type="date" class="form-control" value="${new Date().toISOString().split('T')[0]}" />
      </div>
    </div>
    <div class="form-group">
      <label>Transferstand in den Fachunterricht</label>
      <select id="newSem_transfer" class="form-control">
        <option value="Sehr gut umgesetzt">Sehr gut umgesetzt</option>
        <option value="Solide umgesetzt">Solide umgesetzt</option>
        <option value="In Planung">In Planung</option>
        <option value="Noch offen">Noch offen</option>
      </select>
    </div>
    <div class="form-group">
      <label>Transfer-Beobachtung / Nachweis im UB</label>
      <input id="newSem_transferNote" class="form-control" placeholder="z. B. UB 3: Differenzierungsmatrix erfolgreich angewandt" />
    </div>
  `;

  const footerHTML = `
    <button class="btn btn-outline" onclick="closeModal()">Abbrechen</button>
    <button class="btn btn-primary" onclick="saveNewSeminar()">💾 Modul eintragen</button>
  `;

  openModal({ title: "📚 Neues Fachdidaktik-Modul dokumentieren", bodyHTML, footerHTML });
}

function saveNewSeminar() {
  const title = document.getElementById("newSem_title")?.value.trim();
  if (!title) {
    showToast("Bitte Modultitel eingeben!", "⚠️");
    return;
  }

  const cur = getCurrentLAA();
  if (!cur) return;
  if (!cur.seminars) cur.seminars = [];

  cur.seminars.push({
    id: "s_" + Date.now(),
    title,
    kmk: document.getElementById("newSem_kmk")?.value || "Unterrichten",
    date: document.getElementById("newSem_date")?.value || "",
    status: "Teilgenommen",
    transfer: document.getElementById("newSem_transfer")?.value || "Solide umgesetzt",
    transferNote: document.getElementById("newSem_transferNote")?.value || ""
  });

  saveState();
  closeModal();
  renderSeminarTab();
  showToast("Seminarmodul gespeichert!", "📚");
}

function deleteSeminar(id) {
  const cur = getCurrentLAA();
  if (!cur || !cur.seminars) return;
  cur.seminars = cur.seminars.filter(s => s.id !== id);
  saveState();
  renderSeminarTab();
  showToast("Modul entfernt.", "🗑️");
}

/* ==========================================================================
   TAB 6: REFLEXIONSABGLEICH (SELBSTEINSCHÄTZUNG VS. FREMDEINSCHÄTZUNG)
   ========================================================================== */

function renderReflectionTab() {
  renderReflectionRadar();
  renderReflectionInputs();
}

function renderReflectionRadar() {
  const canvas = document.getElementById("radarCanvasReflection");
  if (!canvas || typeof Chart === 'undefined') return;

  const cur = getCurrentLAA();
  if (!cur) return;

  const ctx = canvas.getContext("2d");
  if (reflectionRadarChart) reflectionRadarChart.destroy();

  const labels = typeof CRITERIA_DIMS !== 'undefined' ? CRITERIA_DIMS : [
    "Fachdidaktik & Struktur",
    "Klassenführung & Präsenz",
    "Unterrichtsplanung & Ziele",
    "Heterogenität & Differenzierung",
    "Diagnostik & Feedback",
    "Reflexion & Haltung"
  ];

  const flScores = (cur.scoresHistory && cur.scoresHistory.length > 0)
    ? cur.scoresHistory[cur.scoresHistory.length - 1]
    : [3.5, 3.5, 3.5, 3.5, 3.5, 3.5];

  const selfScores = cur.selfScores || [3.5, 3.5, 3.5, 3.5, 3.5, 3.5];

  try {
    reflectionRadarChart = new Chart(ctx, {
      type: "radar",
      data: {
        labels,
        datasets: [
          {
            label: "Fremdeinschätzung (Fachleitung)",
            data: flScores,
            backgroundColor: "rgba(37, 99, 235, 0.2)",
            borderColor: "#2563eb",
            borderWidth: 2,
            pointBackgroundColor: "#1d4ed8"
          },
          {
            label: `Selbsteinschätzung (${cur.name})`,
            data: selfScores,
            backgroundColor: "rgba(13, 148, 136, 0.25)",
            borderColor: "#0d9488",
            borderWidth: 2,
            pointBackgroundColor: "#0f766e"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            min: 1,
            max: 5,
            ticks: { stepSize: 1, backdropColor: "transparent" },
            grid: { color: "rgba(0, 0, 0, 0.08)" },
            angleLines: { color: "rgba(0, 0, 0, 0.08)" },
            pointLabels: { font: { size: 11, weight: "bold" }, color: "#334155" }
          }
        }
      }
    });
  } catch(e) {
    console.warn("Reflection Chart render warning:", e);
  }
}

function renderReflectionInputs() {
  const container = document.getElementById("reflectionInputsWrap");
  if (!container) return;

  const cur = getCurrentLAA();
  if (!cur) return;

  const dims = typeof CRITERIA_DIMS !== 'undefined' ? CRITERIA_DIMS : [
    "Fachdidaktik & Struktur",
    "Klassenführung & Präsenz",
    "Unterrichtsplanung & Ziele",
    "Heterogenität & Differenzierung",
    "Diagnostik & Feedback",
    "Reflexion & Haltung"
  ];

  const flScores = (cur.scoresHistory && cur.scoresHistory.length > 0)
    ? cur.scoresHistory[cur.scoresHistory.length - 1]
    : [3.5, 3.5, 3.5, 3.5, 3.5, 3.5];

  const selfScores = cur.selfScores || [3.5, 3.5, 3.5, 3.5, 3.5, 3.5];

  container.innerHTML = dims.map((dim, idx) => {
    const fl = flScores[idx] || 3.0;
    const self = selfScores[idx] || 3.0;
    const diff = (self - fl).toFixed(1);
    let diffBadge = `<span class="badge-pill" style="background:#f1f5f9; color:#475569;">Deckungsgleich</span>`;
    if (diff > 0.5) diffBadge = `<span class="badge-pill" style="background:#fef3c7; color:#92400e;">Überschätzung (+${diff})</span>`;
    if (diff < -0.5) diffBadge = `<span class="badge-pill" style="background:#dbeafe; color:#1e40af;">Unterschätzung (${diff})</span>`;

    return `
      <div style="background:#f8fafc; border:1px solid var(--border); border-radius:8px; padding:12px 16px; display:flex; flex-direction:column; gap:8px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <strong style="font-size:0.88rem; color:#0f172a;">${dim}</strong>
          ${diffBadge}
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; align-items:center;">
          <div style="font-size:0.82rem; color:var(--text-muted);">
            FL-Wertung: <strong style="color:#2563eb;">${fl.toFixed(1)} / 5.0</strong>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <label style="font-size:0.78rem; font-weight:700; color:#0d9488;">LAA-Selbstwert:</label>
            <input 
              type="number" 
              min="1" max="5" step="0.1" 
              class="calc-input" 
              value="${self}" 
              onchange="updateSelfScoreLive(${idx}, this.value)"
            />
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function updateSelfScoreLive(dimIdx, val) {
  const cur = getCurrentLAA();
  if (!cur) return;
  if (!cur.selfScores) cur.selfScores = [3.5, 3.5, 3.5, 3.5, 3.5, 3.5];
  cur.selfScores[dimIdx] = parseFloat(val) || 3.0;
  saveState();
  renderReflectionRadar();
}

function saveReflectionComparison() {
  saveState();
  showToast("Reflexionsdaten & Diskrepanzprofil gespeichert!", "🎯");
}

/* ==========================================================================
   TAB 7: FRISTEN, TERMINE & NOTENRECHNER
   ========================================================================== */

function renderFristenTab() {
  calculateDeadlines();
}

function calculateDeadlines() {
  const cur = getCurrentLAA();
  if (!cur || !cur.startDate) return;

  const start = new Date(cur.startDate);
  const addMonths = (d, m) => {
    const res = new Date(d);
    res.setMonth(res.getMonth() + m);
    return res;
  };

  const d1 = addMonths(start, 3);
  const d2 = addMonths(start, 6);
  const d3 = addMonths(start, 12);
  const d4 = addMonths(start, 16);
  const d5 = addMonths(start, 18);

  const el = (id, txt) => {
    const node = document.getElementById(id);
    if (node) node.innerText = txt;
  };

  el("deadline_eb", d1.toLocaleDateString('de-DE'));
  el("deadline_hp1", d2.toLocaleDateString('de-DE'));
  el("deadline_hp2", d3.toLocaleDateString('de-DE'));
  el("deadline_ha", d4.toLocaleDateString('de-DE'));
  el("deadline_exam", d5.toLocaleDateString('de-DE'));
}

function exportAllAppointmentsICS() {
  const cur = getCurrentLAA();
  if (!cur) return;

  const appts = cur.appointments || [];
  if (appts.length === 0) {
    showToast("Keine Termine zum Exportieren vorhanden!", "⚠️");
    return;
  }

  let icsLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Fachleiter360//SuitePro//DE",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH"
  ];

  appts.forEach(a => {
    if (!a.date) return;
    const dateClean = a.date.replace(/-/g, "");
    const timeClean = a.time ? a.time.replace(/:/g, "") + "00" : "090000";
    icsLines.push("BEGIN:VEVENT");
    icsLines.push(`UID:appt_${a.id}@fachleiter360.de`);
    icsLines.push(`DTSTAMP:${dateClean}T000000Z`);
    icsLines.push(`DTSTART:${dateClean}T${timeClean}`);
    icsLines.push(`SUMMARY:${a.title} (${cur.name})`);
    icsLines.push(`LOCATION:${a.location || 'Schule'}`);
    icsLines.push(`DESCRIPTION:${a.notes || a.type || 'Unterrichtsbesuch / Termin'}`);
    icsLines.push("STATUS:CONFIRMED");
    icsLines.push("END:VEVENT");
  });

  icsLines.push("END:VCALENDAR");

  const blob = new Blob([icsLines.join("\r\n")], { type: "text/calendar;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `Termine_${cur.name.replace(/[^a-zA-Z0-9]/g, '_')}.ics`;
  link.click();
  showToast("Kalenderdatei (.ics) exportiert!", "📅");
}

function exportSingleAppointmentICS(appId) {
  const cur = getCurrentLAA();
  if (!cur || !cur.appointments) return;
  const a = cur.appointments.find(item => item.id === appId);
  if (!a || !a.date) return;

  const dateClean = a.date.replace(/-/g, "");
  const timeClean = a.time ? a.time.replace(/:/g, "") + "00" : "090000";

  const icsLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Fachleiter360//SuitePro//DE",
    "BEGIN:VEVENT",
    `UID:appt_${a.id}@fachleiter360.de`,
    `DTSTAMP:${dateClean}T000000Z`,
    `DTSTART:${dateClean}T${timeClean}`,
    `SUMMARY:${a.title} (${cur.name})`,
    `LOCATION:${a.location || 'Schule'}`,
    `DESCRIPTION:${a.notes || a.type || 'Termin'}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ];

  const blob = new Blob([icsLines.join("\r\n")], { type: "text/calendar;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `Termin_${a.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`;
  link.click();
  showToast("Termin (.ics) exportiert!", "📅");
}

function calculateFinalGrade() {
  const vornote = parseFloat(document.getElementById("calc_vornote")?.value) || 0;
  const lp1 = parseFloat(document.getElementById("calc_lp1")?.value) || 0;
  const lp2 = parseFloat(document.getElementById("calc_lp2")?.value) || 0;
  const mp = parseFloat(document.getElementById("calc_mp")?.value) || 0;
  const koll = parseFloat(document.getElementById("calc_koll")?.value) || 0;

  // ThürAZStPLVO Typical Calculation Weighting
  const weighted = (vornote * 0.3) + (lp1 * 0.25) + (lp2 * 0.25) + (mp * 0.1) + (koll * 0.1);
  const resultEl = document.getElementById("calcResultDisplay");
  if (resultEl) {
    resultEl.innerText = `${weighted.toFixed(2)} (${weighted <= 1.5 ? 'Sehr gut' : (weighted <= 2.5 ? 'Gut' : (weighted <= 3.5 ? 'Befriedigend' : 'Ausreichend'))})`;
  }
}
