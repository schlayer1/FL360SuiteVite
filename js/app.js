/**
 * FACHLEITER 360° SUITE PRO - MAIN APPLICATION ROUTER & CONTROLLER
 */

let activeTabId = "tab-dashboard";
var dashboardViewMode = "profile";
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
    restoreLiveSessionDraftIfPresent();

    // Auto-launch Setup Wizard on first start if no candidates exist
    if (appState && !appState.wizardCompleted && Object.keys(appState.laas || {}).length === 0) {
      setTimeout(() => {
        if (typeof openSetupWizard === "function") {
          openSetupWizard();
        }
      }, 400);
    }
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

  updateHeaderBreadcrumbs();
  updateQuickDockState();
  if (window.lucide) lucide.createIcons();
}

/* ==========================================================================
   HEADER ACTIONS DROPDOWN & STATUS BADGE (PROPOSAL 3)
   ========================================================================== */

function toggleHeaderActionsDropdown(event) {
  if (event) event.stopPropagation();
  const dropdown = document.getElementById("headerActionsDropdown");
  const chevron = document.getElementById("headerActionsChevron");
  if (!dropdown) return;
  const isShown = dropdown.style.display === "block";
  dropdown.style.display = isShown ? "none" : "block";
  if (chevron) {
    chevron.style.transform = isShown ? "rotate(0deg)" : "rotate(180deg)";
  }
}

function closeHeaderActionsDropdown() {
  const dropdown = document.getElementById("headerActionsDropdown");
  const chevron = document.getElementById("headerActionsChevron");
  if (dropdown) dropdown.style.display = "none";
  if (chevron) chevron.style.transform = "rotate(0deg)";
}

window.addEventListener("click", (e) => {
  if (!e.target.closest(".header-dropdown-wrap")) {
    closeHeaderActionsDropdown();
  }
});

function updateHeaderPhaseBadge(cur) {
  const badge = document.getElementById("laaHeaderPhaseBadge");
  if (!badge) return;
  if (!cur) {
    badge.style.display = "none";
    updateHeaderBreadcrumbs();
    return;
  }
  const visitsCount = (cur.visits || []).length;
  const phase = cur.currentPhase || cur.phase || "Hauptphase";
  const type = cur.type || "LAA";
  const typeColors = {
    LAA: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    NQ: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    WB: "bg-purple-500/20 text-purple-300 border-purple-500/40"
  };
  const typeBadgeClass = typeColors[type] || "bg-slate-500/20 text-slate-300 border-slate-500/40";

  badge.innerHTML = `
    <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[0.7rem] font-bold border ${typeBadgeClass}">${type}</span>
    <span class="inline-flex items-center text-slate-300"><i data-lucide="compass" class="w-3.5 h-3.5 inline mr-1 text-blue-500"></i>${phase} • ${visitsCount} UB${visitsCount === 1 ? '' : 's'}</span>
  `;
  badge.style.display = "inline-flex";
  updateHeaderBreadcrumbs();
  if (window.lucide) lucide.createIcons();
}

/* ==========================================================================
   HEADER BREADCRUMBS (PROPOSAL 7)
   ========================================================================== */

function updateHeaderBreadcrumbs() {
  const container = document.getElementById("headerBreadcrumb");
  if (!container) return;

  const cur = getCurrentLAA();
  const tabNames = {
    "tab-dashboard": { name: "Dashboard Leitstand", icon: "layout-dashboard" },
    "tab-live": { name: "Live-Hospitation", icon: "activity" },
    "tab-reflexion": { name: "Reflexionsabgleich", icon: "git-commit" },
    "tab-progression": { name: "Progression & Radar", icon: "trending-up" },
    "tab-niederschrift": { name: "Niederschrift & Entwurf", icon: "file-text" },
    "tab-fristen": { name: "Fristen & Noten", icon: "calendar" },
    "tab-gutachten": { name: "Formular-Cockpit", icon: "files" },
    "tab-seminar": { name: "Seminarplaner", icon: "book-open" }
  };

  const currentTab = tabNames[activeTabId] || { name: "Arbeitsbereich", icon: "layers" };

  let html = "";
  if (cur) {
    const visitsCount = (cur.visits || []).length;
    const phaseLabel = cur.phase || "Hauptphase";
    const subLabel = visitsCount > 0 ? `${visitsCount}. Unterrichtsbesuch` : phaseLabel;

    html = `
      <span class="breadcrumb-item clickable" onclick="switchTab('tab-dashboard')" title="Zum Profil von ${cur.name}">
        <i data-lucide="user" class="w-3.5 h-3.5 inline text-blue-500"></i>
        <span>${cur.name}</span>
      </span>
      <span class="breadcrumb-sep">›</span>
      <span class="breadcrumb-item" title="Ausbildungsabschnitt">
        <span>${subLabel}</span>
      </span>
      <span class="breadcrumb-sep">›</span>
      <span class="breadcrumb-current flex items-center gap-1">
        <i data-lucide="${currentTab.icon}" class="w-3.5 h-3.5 inline"></i>
        <span>${currentTab.name}</span>
      </span>
    `;
  } else {
    html = `
      <span class="breadcrumb-item clickable" onclick="switchTab('tab-dashboard')">
        <i data-lucide="users" class="w-3.5 h-3.5 inline text-blue-500"></i>
        <span>Kandidaten</span>
      </span>
      <span class="breadcrumb-sep">›</span>
      <span class="breadcrumb-current flex items-center gap-1">
        <i data-lucide="${currentTab.icon}" class="w-3.5 h-3.5 inline"></i>
        <span>${currentTab.name}</span>
      </span>
    `;
  }

  container.innerHTML = html;
  if (window.lucide) lucide.createIcons();
}

/* ==========================================================================
   QUICK-DOCK ACTIONS (SHORTCUT-RAIL)
   ========================================================================== */

function toggleQuickDockCollapse() {
  const dock = document.getElementById("appQuickDock");
  const icon = document.getElementById("quickDockCollapseIcon");
  if (!dock) return;

  const isCollapsed = dock.classList.toggle("collapsed");
  if (icon) {
    icon.setAttribute("data-lucide", isCollapsed ? "chevron-right" : "chevron-left");
  }
  localStorage.setItem("fachleiter_dock_collapsed", isCollapsed ? "1" : "0");
  if (window.lucide) lucide.createIcons();
}

function updateQuickDockState() {
  const liveBtn = document.getElementById("quickDockLiveBtn");
  if (liveBtn) {
    liveBtn.classList.toggle("active", activeTabId === "tab-live");
  }

  const dot = document.getElementById("quickDockTimerDot");
  if (dot) {
    dot.style.display = (typeof liveTimerRunning !== "undefined" && liveTimerRunning) ? "block" : "none";
  }

  const dock = document.getElementById("appQuickDock");
  const icon = document.getElementById("quickDockCollapseIcon");
  if (!dock) return;

  // Auto-expand in live hospitation for quick control, otherwise respect collapsed state (default: collapsed)
  const savedState = localStorage.getItem("fachleiter_dock_collapsed");
  const shouldCollapse = activeTabId === "tab-live" ? false : (savedState === "0" ? false : true);

  if (shouldCollapse) {
    dock.classList.add("collapsed");
    if (icon) icon.setAttribute("data-lucide", "chevron-right");
  } else {
    dock.classList.remove("collapsed");
    if (icon) icon.setAttribute("data-lucide", "chevron-left");
  }
}

function toggleGlobalSplitScreen() {
  if (activeTabId === "tab-niederschrift") {
    toggleNiederschriftSplitScreen();
  } else if (activeTabId === "tab-gutachten") {
    toggleCockpitSplitScreen();
  } else {
    switchTab("tab-niederschrift");
    setTimeout(() => {
      toggleNiederschriftSplitScreen(true);
    }, 150);
  }
}

/* ==========================================================================
   SPLIT-SCREEN WORKFLOWS (PROPOSAL 6)
   ========================================================================== */

let nsSplitActive = false;
let cockpitSplitActive = false;

function toggleNiederschriftSplitScreen(forceState) {
  const grid = document.getElementById("nsSplitGrid");
  const btn = document.getElementById("btnToggleNsSplit");
  const text = document.getElementById("btnToggleNsSplitText");
  const quickBtn = document.getElementById("quickDockSplitBtn");
  if (!grid) return;

  if (typeof forceState === "boolean") {
    nsSplitActive = forceState;
  } else {
    nsSplitActive = !nsSplitActive;
  }

  grid.classList.toggle("split-active", nsSplitActive);
  if (btn) {
    btn.classList.toggle("active", nsSplitActive);
  }
  if (text) {
    text.innerText = nsSplitActive ? "Split-Screen: AN" : "Split-Screen Entwurf";
  }
  if (quickBtn) {
    quickBtn.classList.toggle("active", nsSplitActive);
  }

  if (nsSplitActive) {
    if (typeof renderPdfPage === "function" && typeof currentPdfPage !== "undefined") {
      renderPdfPage(currentPdfPage);
    }
    showToast("Split-Screen aktiv: Entwurf links, 15-Punkte-Raster rechts", "◫");
  } else {
    showToast("Vollbild-Raster wiederhergestellt", "ℹ️");
  }
  if (window.lucide) lucide.createIcons();
}

function toggleCockpitSplitScreen(forceState) {
  const grid = document.getElementById("cockpitSplitGrid");
  const btn = document.getElementById("btnToggleCockpitSplit");
  const text = document.getElementById("btnToggleCockpitSplitText");
  const quickBtn = document.getElementById("quickDockSplitBtn");
  if (!grid) return;

  if (typeof forceState === "boolean") {
    cockpitSplitActive = forceState;
  } else {
    cockpitSplitActive = !cockpitSplitActive;
  }

  grid.classList.toggle("split-active", cockpitSplitActive);
  if (btn) {
    btn.classList.toggle("active", cockpitSplitActive);
  }
  if (text) {
    text.innerText = cockpitSplitActive ? "Split-Screen: AN" : "Split-Screen Entwurf";
  }
  if (quickBtn) {
    quickBtn.classList.toggle("active", cockpitSplitActive);
  }

  if (cockpitSplitActive) {
    if (typeof renderPdfPage === "function" && typeof currentPdfPage !== "undefined") {
      renderPdfPage(currentPdfPage);
    }
    showToast("Split-Screen aktiv: Entwurf links, Formular F 230 rechts", "◫");
  } else {
    showToast("Vollbild-Formular wiederhergestellt", "ℹ️");
  }
  if (window.lucide) lucide.createIcons();
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
    selector.innerHTML = `<option value="">Kein Kandidat angelegt (+ Profil)</option>`;
    updateHeaderPhaseBadge(null);
    return;
  }

  let html = "";
  for (const [id, laa] of entries) {
    const isSelected = id === currentId ? "selected" : "";
    const roleBadge = laa.type ? ` [${laa.type}]` : "";
    html += `<option value="${id}" ${isSelected}>${laa.name}${roleBadge} (${laa.subject1 || 'Fach 1'}/${laa.subject2 || 'Fach 2'})</option>`;
  }
  selector.innerHTML = html;
  updateHeaderPhaseBadge(getCurrentLAA());
}

function handleLAAChange(laaId) {
  if (!appState.laas[laaId]) return;
  appState.selectedLAA = laaId;
  liveSessionFocus = "";
  isEditingLiveFocus = false;

  const targetLAA = appState.laas[laaId];
  if (targetLAA && targetLAA.type && ['LAA', 'NQ', 'WB'].includes(targetLAA.type)) {
    if (typeof activeCalcMode !== 'undefined') {
      activeCalcMode = targetLAA.type;
    }
  }

  saveState();
  updateHeaderPhaseBadge(targetLAA);
  switchTab(activeTabId);
  showToast(`Profil gewechselt: ${targetLAA?.name}`, "👤");
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
    <button class="btn btn-primary" onclick="saveNewLAA()"><i data-lucide="save" class="w-4 h-4 mr-1 inline"></i><span>Profil anlegen</span></button>
  `;

  openModal({ title: "Neues Kandidatenprofil anlegen", bodyHTML, footerHTML });
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
    <button class="btn btn-primary" onclick="saveEditedLAA()"><i data-lucide="save" class="w-4 h-4 mr-1 inline"></i><span>Änderungen speichern</span></button>
  `;

  openModal({ title: `Profil bearbeiten: ${cur.name}`, bodyHTML, footerHTML });
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
    <button class="btn btn-danger" onclick="executeDeleteLAA('${cur.id}')"><i data-lucide="trash-2" class="w-4 h-4 mr-1 inline"></i><span>Unwiderruflich löschen</span></button>
  `;

  openModal({ title: "Profil löschen bestätigen", bodyHTML, footerHTML });
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
  
  if (window.resilientStorage && typeof window.resilientStorage.recordBackupTimestamp === 'function') {
    window.resilientStorage.recordBackupTimestamp();
  }
  
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
   UNIFIED DEADLINE & APPOINTMENT RESOLVER
   ========================================================================== */

/**
 * Resolves and normalizes all deadlines (Fristenkalender) and appointments (Termine) for a candidate.
 */
function getAllCandidateDeadlinesAndAppointments(cur) {
  if (!cur) cur = typeof getCurrentLAA === 'function' ? getCurrentLAA() : null;
  if (!cur) return [];
  const list = [];

  // 1. Deadlines / Milestones from customDeadlines (Fristenkalender)
  (cur.customDeadlines || []).forEach((dl, idx) => {
    const rawDate = dl.customDate || dl.date;
    if (!rawDate) return;
    list.push({
      id: dl.id || `dl_${idx}`,
      rawId: dl.id,
      index: idx,
      title: dl.title || "Unbenannte Frist",
      date: rawDate,
      time: dl.time || "",
      location: dl.legalGuideline || "Fristenkalender",
      notes: dl.notes || dl.seminarNote || "",
      status: dl.status || "open",
      isCustomDeadline: true,
      badgeText: "Frist / Meilenstein",
      type: "Frist"
    });
  });

  // 2. Scheduled Appointments from cur.appointments
  (cur.appointments || []).forEach((a, idx) => {
    if (!a.date) return;
    list.push({
      id: a.id || `appt_${idx}`,
      rawId: a.id,
      index: idx,
      title: a.title || "Termin",
      date: a.date,
      time: a.time || "",
      location: a.location || "Schule / Seminar",
      notes: a.notes || "",
      status: a.status || "open",
      isCustomDeadline: false,
      badgeText: a.type || "Termin",
      type: a.type || "Termin"
    });
  });

  return list;
}

/* ==========================================================================
   TAB 1: DASHBOARD
   ========================================================================== */

function renderDashboard() {
  const cur = getCurrentLAA();
  const candidatesCount = Object.keys(appState.laas || {}).length;
  const switcherEl = document.getElementById("dashboardViewSwitcher");
  const cohortContainer = document.getElementById("dashboardCohortView");
  const profileView = document.getElementById("dashboardProfileView");

  // Render Top Mode Switcher
  if (switcherEl) {
    switcherEl.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <div style="display:flex; background:rgba(255,255,255,0.06); padding:4px; border-radius:12px; border:1px solid rgba(255,255,255,0.1); gap:4px;">
          <button class="btn ${typeof dashboardViewMode !== 'undefined' && dashboardViewMode === 'profile' ? 'btn-primary' : 'btn-ghost'}" style="font-size:0.82rem; padding:6px 14px;" onclick="setDashboardViewMode('profile')">
            <i data-lucide="user" class="w-4 h-4"></i>
            <span>Einzelkandidat-Profil ${cur ? '(' + cur.name + ')' : ''}</span>
          </button>
          <button class="btn ${typeof dashboardViewMode !== 'undefined' && dashboardViewMode === 'cohort' ? 'btn-primary' : 'btn-ghost'}" style="font-size:0.82rem; padding:6px 14px;" onclick="setDashboardViewMode('cohort')">
            <i data-lucide="users" class="w-4 h-4"></i>
            <span>Seminar- &amp; Kohortenübersicht (${candidatesCount})</span>
          </button>
        </div>
        ${typeof dashboardViewMode !== 'undefined' && dashboardViewMode === 'cohort' ? `
          <div style="display:flex; gap:8px;">
            <button class="btn btn-outline" style="font-size:0.8rem; padding:5px 10px;" onclick="exportCohortCSV()">
              <i data-lucide="file-spreadsheet" class="w-4 h-4"></i>
              <span>CSV / Excel</span>
            </button>
            <button class="btn btn-outline" style="font-size:0.8rem; padding:5px 10px;" onclick="window.print()">
              <i data-lucide="printer" class="w-4 h-4"></i>
              <span>Drucken</span>
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }

  // Handle Cohort Matrix View Mode
  if (typeof dashboardViewMode !== 'undefined' && dashboardViewMode === 'cohort') {
    if (profileView) profileView.style.display = "none";
    if (cohortContainer) {
      cohortContainer.style.display = "block";
      if (typeof renderCohortOverview === 'function') {
        renderCohortOverview();
      }
    }
    return;
  }

  // Handle Profile View Mode
  if (cohortContainer) cohortContainer.style.display = "none";
  if (profileView) profileView.style.display = "block";

  const bannerEl = document.getElementById("dashboardUpcomingBanner");
  const profileContainer = document.getElementById("dashboardProfileGrid");

  if (!cur) {
    const hub = document.getElementById("dashboardStatusHub");
    if (hub) hub.style.display = "none";
    if (bannerEl) bannerEl.style.display = "none";
    const candidateBannerEl = document.getElementById("dashboardCandidateBanner");
    if (candidateBannerEl) {
      candidateBannerEl.innerHTML = `
        <div style="padding: 32px 24px; text-align: center; background: rgba(15, 23, 42, 0.5); border-radius: 14px; border: 1.5px dashed rgba(255,255,255,0.15);">
          <div style="margin-bottom: 12px;" class="inline-flex p-3 rounded-2xl bg-blue-500/10 border border-blue-500/25 text-blue-500">
            <i data-lucide="compass" class="w-8 h-8"></i>
          </div>
          <h2 style="font-size: 1.25rem; margin-bottom: 6px; color: #f8fafc; font-weight: 700;">Willkommen in Ihrer Fachleiter 360° Suite</h2>
          <p style="color: #94a3b8; font-size: 0.88rem; max-width: 520px; margin: 0 auto 18px;">
            Aktuell ist noch kein Kandidatenprofil geladen. Starten Sie direkt mit einem vorbereiteten Muster-Referendar oder legen Sie Ihr eigenes Profil an.
          </p>
          <div style="display:flex; justify-content:center; gap:10px; flex-wrap:wrap;">
            <button class="btn btn-primary" onclick="loadDemoCandidate()" style="padding: 9px 18px; font-size: 0.88rem;">
              <i data-lucide="flask-conical" class="w-4 h-4"></i>
              <span>Muster-Kandidat laden (Sofort testen)</span>
            </button>
            <button class="btn btn-outline" onclick="openSetupWizard(true)" style="padding: 9px 18px; font-size: 0.88rem;">
              <i data-lucide="sparkles" class="w-4 h-4 text-amber-400"></i>
              <span>3-Minuten Schnellstart-Guide</span>
            </button>
            <button class="btn btn-outline" onclick="openAddLAAModal()" style="padding: 9px 18px; font-size: 0.88rem;">
              <i data-lucide="user-plus" class="w-4 h-4"></i>
              <span>Neues Profil anlegen</span>
            </button>
          </div>
        </div>
      `;
    }
    const visitsTable = document.getElementById("dashboardVisitsTableBody");
    if (visitsTable) visitsTable.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#94a3b8; padding:20px;">Noch keine Unterrichtsbesuche vorhanden</td></tr>';
    const goalsList = document.getElementById("dashboardGoalsList");
    if (goalsList) goalsList.innerHTML = '<div style="text-align:center; color:#94a3b8; padding:20px;">Noch keine Entwicklungsziele vorhanden</div>';
    const appointmentsList = document.getElementById("dashboardAppointmentsList");
    if (appointmentsList) appointmentsList.innerHTML = '<div style="text-align:center; color:#94a3b8; padding:20px;">Noch keine anstehenden Termine vorhanden</div>';
    if (window.lucide) lucide.createIcons();
    return;
  }

  // Upcoming Banner (Vereint Fristenkalender & Termine)
  if (bannerEl) {
    const allEvents = getAllCandidateDeadlinesAndAppointments(cur);
    const activeEvents = allEvents.filter(e => e.status !== 'done');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcoming = activeEvents
      .filter(e => {
        const d = new Date(e.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime() >= today.getTime();
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

    if (upcoming) {
      bannerEl.style.display = "flex";
      const isCustom = upcoming.isCustomDeadline;
      bannerEl.innerHTML = `
        <div style="display:flex; align-items:center; gap:12px;">
          <div class="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <i data-lucide="calendar" class="w-5 h-5"></i>
          </div>
          <div>
            <strong style="color:#fde68a;">${isCustom ? 'Nächste Frist' : 'Nächster Termin'}: ${upcoming.title}</strong>
            <div style="font-size:0.78rem; color:#cbd5e1;">
              ${new Date(upcoming.date).toLocaleDateString('de-DE')}${upcoming.time ? ' um ' + upcoming.time + ' Uhr' : ''} • ${upcoming.location || (isCustom ? 'Fristenkalender' : 'Seminar')}
            </div>
          </div>
        </div>
        <div style="display:flex; gap:8px;">
          ${isCustom ? `
            <button class="btn btn-outline" style="font-size:0.78rem; padding:4px 10px;" onclick="switchTab('tab-fristen')">
              <i data-lucide="calendar-clock" class="w-4 h-4"></i>
              <span>Im Fristenkalender öffnen</span>
            </button>
          ` : `
            <button class="btn btn-outline" style="font-size:0.78rem; padding:4px 10px;" onclick="exportSingleAppointmentICS('${upcoming.id}')">
              <i data-lucide="calendar-arrow-down" class="w-4 h-4"></i>
              <span>Kalender (.ics)</span>
            </button>
          `}
        </div>
      `;
    } else {
      bannerEl.style.display = "none";
    }
  }

  // Ausbildungs-Leitstand Status Hub (Proposal 5)
  renderDashboardStatusHub(cur);

  // Compact Candidate Summary Banner (Proposal 2: Entrümpelung)
  const candidateBannerEl = document.getElementById("dashboardCandidateBanner");
  if (candidateBannerEl) {
    const roleTitle = getRoleTitle ? getRoleTitle(cur.type, cur.gender) : (cur.type || 'LAA');
    const typeBadge = cur.type === 'NQ' ? 'badge-neon-warning' : (cur.type === 'WB' ? 'badge-neon-info' : 'badge-neon-success');
    candidateBannerEl.innerHTML = `
      <div class="candidate-summary-inner">
        <div class="candidate-summary-identity">
          <div class="candidate-avatar-icon">
            <i data-lucide="user" class="w-5 h-5 text-blue-500"></i>
          </div>
          <div>
            <div class="candidate-summary-name">
              <strong>${cur.name}</strong>
              <span class="badge-pill ${typeBadge}" style="font-size:0.72rem; padding:2px 7px;">${cur.type || 'LAA'}</span>
              <span style="font-size:0.82rem; color:var(--text-muted); font-weight:500;">(${roleTitle})</span>
            </div>
            <div class="candidate-summary-meta">
              <span><i data-lucide="book" class="w-3.5 h-3.5"></i> ${cur.subject1 || 'Fach 1'}${cur.subject2 ? ' / ' + cur.subject2 : ''}</span>
              <span class="meta-dot">•</span>
              <span><i data-lucide="building" class="w-3.5 h-3.5"></i> ${cur.school || 'Ausbildungsschule'}${cur.mentor ? ' (Mentor/in: ' + cur.mentor + ')' : ''}</span>
              <span class="meta-dot">•</span>
              <span><i data-lucide="calendar" class="w-3.5 h-3.5"></i> ${cur.currentPhase || cur.phase || 'Hauptphase'}</span>
            </div>
          </div>
        </div>
        <div class="candidate-summary-actions">
          <button class="btn btn-outline" style="font-size:0.76rem; padding:4px 10px;" onclick="openEditLAAModal()" title="Stammdaten &amp; Schule bearbeiten">
            <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
            <span>Stammdaten</span>
          </button>
        </div>
      </div>
    `;
  }

  // Render Radar Chart if container is visible
  const radarContainer = document.getElementById("dashboardRadarContainer");
  if (radarContainer && radarContainer.style.display !== "none") {
    renderDashboardRadar(cur);
  }

  // Render Goals List
  renderDashboardGoals(cur);

  // Render Visits Table
  renderDashboardVisits(cur);

  // Render Appointments List
  renderDashboardAppointments(cur);

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

function toggleDashboardRadar(forceState) {
  const container = document.getElementById("dashboardRadarContainer");
  const toggleBtn = document.getElementById("toggleRadarBtn");
  if (!container) return;

  const isCurrentlyOpen = container.style.display !== "none";
  const shouldOpen = forceState !== undefined ? forceState : !isCurrentlyOpen;

  if (shouldOpen) {
    container.style.display = "block";
    if (toggleBtn) {
      toggleBtn.classList.add("active");
      toggleBtn.innerHTML = `<i data-lucide="activity" class="w-3.5 h-3.5 text-blue-400"></i><span>Netz ausblenden</span>`;
    }
    const cur = getCurrentLAA();
    if (cur) renderDashboardRadar(cur);
  } else {
    container.style.display = "none";
    if (toggleBtn) {
      toggleBtn.classList.remove("active");
      toggleBtn.innerHTML = `<i data-lucide="activity" class="w-3.5 h-3.5 text-blue-400"></i><span>Kompetenznetz</span>`;
    }
  }
  if (window.lucide) lucide.createIcons();
}

function renderDashboardStatusHub(cur) {
  const hub = document.getElementById("dashboardStatusHub");
  if (!hub) return;
  if (!cur) {
    hub.innerHTML = "";
    hub.style.display = "none";
    return;
  }

  hub.style.display = "grid";

  // 1. Ausbildungsfortschritt (Monate & Phase nach ThürAZStPLVO)
  let currentMonth = 12;
  const totalMonths = 18;
  if (cur.startDate) {
    const start = new Date(cur.startDate);
    const now = new Date();
    if (!isNaN(start.getTime())) {
      const diffMonths = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth()) + 1;
      currentMonth = Math.min(totalMonths, Math.max(1, diffMonths));
    }
  } else if (cur.phase === "Einführungsphase") {
    currentMonth = 4;
  } else if (cur.phase === "Prüfungsphase") {
    currentMonth = 17;
  }
  const progressPercent = Math.min(100, Math.round((currentMonth / totalMonths) * 100));
  const phaseLabel = cur.phase || "Hauptphase";

  // 2. Unterrichtsbesuche (UB-Status)
  const visits = cur.visits || [];
  const targetVisits = 4;
  const visitsCount = visits.length;
  const visitsStatus = visitsCount >= targetVisits ? "Soll erfüllt" : `${targetVisits - visitsCount} ausstehend`;
  const visitsColor = visitsCount >= targetVisits ? "text-emerald-400" : "text-amber-400";

  // 3. Aktiver Beratungsschwerpunkt
  const openGoals = (cur.goals || []).filter(g => g.status === 'open' || !g.status);
  const activeGoal = openGoals.length > 0 ? openGoals[0] : null;

  // 4. Nächster Meilenstein / Frist (Vereint Fristenkalender & Termine)
  const allEvents = getAllCandidateDeadlinesAndAppointments(cur);
  const activeEvents = allEvents.filter(e => e.status !== 'done');

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayMs = today.getTime();

  activeEvents.forEach(e => {
    const d = new Date(e.date);
    d.setHours(0, 0, 0, 0);
    e.diffDays = Math.round((d.getTime() - todayMs) / (1000 * 60 * 60 * 24));
  });

  const upcomingEvents = activeEvents
    .filter(e => e.diffDays >= 0)
    .sort((a, b) => a.diffDays - b.diffDays);

  const overdueEvents = activeEvents
    .filter(e => e.diffDays < 0)
    .sort((a, b) => b.diffDays - a.diffDays);

  let apptCountdownText = "Keine Fristen";
  let apptSubtext = "Alle Termine absolviert";
  let apptColorClass = "text-amber-300";

  if (upcomingEvents.length > 0) {
    const nextEvent = upcomingEvents[0];
    if (nextEvent.diffDays === 0) {
      apptCountdownText = "Heute fällig!";
      apptColorClass = "text-amber-400 font-bold";
    } else if (nextEvent.diffDays === 1) {
      apptCountdownText = "Morgen fällig";
      apptColorClass = "text-sky-400 font-bold";
    } else if (nextEvent.diffDays <= 7) {
      apptCountdownText = `In ${nextEvent.diffDays} Tagen`;
      apptColorClass = "text-amber-300";
    } else {
      apptCountdownText = `In ${nextEvent.diffDays} Tagen`;
      apptColorClass = "text-slate-200";
    }
    const formattedDate = new Date(nextEvent.date).toLocaleDateString('de-DE');
    const extraInfo = overdueEvents.length > 0 ? ` (${overdueEvents.length} vergangen)` : '';
    apptSubtext = `${nextEvent.title} (${formattedDate})${extraInfo}`;
  } else if (overdueEvents.length > 0) {
    const mostRecentOverdue = overdueEvents[0];
    const daysAgo = Math.abs(mostRecentOverdue.diffDays);
    apptCountdownText = daysAgo === 1 ? "Vor 1 Tag" : `Vor ${daysAgo} Tagen`;
    apptColorClass = "text-slate-400 font-semibold";
    apptSubtext = `${mostRecentOverdue.title} (${new Date(mostRecentOverdue.date).toLocaleDateString('de-DE')})`;
  }

  hub.innerHTML = `
    <!-- Card 1: Ausbildungsfortschritt -->
    <div class="status-hub-card">
      <div>
        <div class="status-hub-header">
          <span class="status-hub-label">Ausbildungsfortschritt</span>
          <span class="badge-pill" style="font-size:0.7rem; font-weight:700;">${phaseLabel}</span>
        </div>
        <div class="status-hub-value">Monat ${currentMonth} <span style="font-size:0.85rem; font-weight:500; color:var(--text-muted);">/ ${totalMonths}</span></div>
        <div class="status-hub-subtext">${progressPercent}% der Ausbildung nach ThürAZStPLVO absolviert</div>
      </div>
      <div class="status-hub-progress-track">
        <div class="status-hub-progress-bar" style="width: ${progressPercent}%;"></div>
      </div>
    </div>

    <!-- Card 2: Unterrichtsbesuche -->
    <div class="status-hub-card">
      <div>
        <div class="status-hub-header">
          <span class="status-hub-label">Unterrichtsbesuche</span>
          <span class="badge-pill ${visitsColor}" style="font-size:0.7rem; font-weight:700;">${visitsStatus}</span>
        </div>
        <div class="status-hub-value">${visitsCount} <span style="font-size:0.85rem; font-weight:500; color:var(--text-muted);">/ ${targetVisits} UBs</span></div>
        <div class="status-hub-subtext">
          ${visits.length > 0 ? `Letzter: ${visits[visits.length - 1].topic || 'UB'} (${visits[visits.length - 1].grade ? 'Note ' + visits[visits.length - 1].grade : 'erfasst'})` : 'Noch keine Hospitation dokumentiert'}
        </div>
      </div>
      <div style="margin-top:10px;">
        <button class="btn btn-accent" style="font-size:0.75rem; padding:4px 10px; width:100%; justify-content:center;" onclick="switchTab('tab-live')">
          <i data-lucide="clock" class="w-3.5 h-3.5"></i>
          <span>Live-Hospitation starten</span>
        </button>
      </div>
    </div>

    <!-- Card 3: Aktiver Beratungsschwerpunkt -->
    <div class="status-hub-card">
      <div>
        <div class="status-hub-header">
          <span class="status-hub-label">Fokus-Zielvereinbarung</span>
          <span class="badge-pill text-blue-500" style="font-size:0.7rem; font-weight:700;">${openGoals.length} offen</span>
        </div>
        <div class="status-hub-value" style="font-size:0.92rem; font-weight:600; line-height:1.3; min-height:42px;">
          ${activeGoal ? activeGoal.text : '<span style="color:var(--text-muted); font-style:italic;">Kein Entwicklungsziel hinterlegt</span>'}
        </div>
        <div class="status-hub-subtext">
          ${activeGoal ? (activeGoal.source || 'Vereinbart im Beratungsgespräch') : 'Handlungsfelder im Reflexionsabgleich definieren'}
        </div>
      </div>
      <div style="margin-top:10px;">
        <button class="btn btn-outline" style="font-size:0.75rem; padding:4px 10px; width:100%; justify-content:center;" onclick="openAddGoalModal()">
          <i data-lucide="plus-circle" class="w-3.5 h-3.5"></i>
          <span>Ziel vereinbaren</span>
        </button>
      </div>
    </div>

    <!-- Card 4: Nächster Meilenstein / Frist -->
    <div class="status-hub-card">
      <div>
        <div class="status-hub-header">
          <span class="status-hub-label">Nächste Frist / Termin</span>
          <i data-lucide="calendar" class="w-4 h-4 text-amber-400"></i>
        </div>
        <div class="status-hub-value ${apptColorClass}">${apptCountdownText}</div>
        <div class="status-hub-subtext" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${apptSubtext}">
          ${apptSubtext}
        </div>
      </div>
      <div style="margin-top:10px;">
        <button class="btn btn-outline" style="font-size:0.75rem; padding:4px 10px; width:100%; justify-content:center;" onclick="switchTab('tab-fristen')">
          <i data-lucide="calendar-clock" class="w-3.5 h-3.5"></i>
          <span>Fristenkalender</span>
        </button>
      </div>
    </div>
  `;

  if (window.lucide) lucide.createIcons();
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
            backgroundColor: "rgba(37, 99, 235, 0.2)",
            borderColor: "#3b82f6",
            pointBackgroundColor: "#2563eb",
            pointBorderColor: "#ffffff",
            pointHoverBackgroundColor: "#ffffff",
            pointHoverBorderColor: "#2563eb",
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
            ticks: { stepSize: 1, backdropColor: "transparent", color: document.body.classList.contains('theme-light') ? "#64748b" : "#94a3b8" },
            grid: { color: document.body.classList.contains('theme-light') ? "rgba(0, 0, 0, 0.08)" : "rgba(255, 255, 255, 0.1)" },
            angleLines: { color: document.body.classList.contains('theme-light') ? "rgba(0, 0, 0, 0.08)" : "rgba(255, 255, 255, 0.1)" },
            pointLabels: { font: { size: 11, weight: "bold", family: "'Inter', sans-serif" }, color: document.body.classList.contains('theme-light') ? "#1e293b" : "#cbd5e1" }
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
          <button class="btn btn-ghost btn-icon-only" style="color:#f87171;" onclick="deleteGoal('${g.id}')" title="Ziel löschen"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
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
  renderDashboardStatusHub(cur);
}

function deleteGoal(goalId) {
  const cur = getCurrentLAA();
  if (!cur || !cur.goals) return;
  cur.goals = cur.goals.filter(g => g.id !== goalId);
  saveState();
  renderDashboardGoals(cur);
  renderDashboardStatusHub(cur);
  showToast("Ziel entfernt.", "🗑️");
}

function openAddGoalModal(prefillText, prefillSource) {
  const bodyHTML = `
    <div class="form-group">
      <label>Zielbeschreibung / Entwicklungsaufgabe</label>
      <textarea id="newGoal_text" class="form-control" rows="3" placeholder="z. B. Wartezeit nach Impulsfragen konsequent auf >3 Sek. ausdehnen...">${prefillText || ''}</textarea>
    </div>
    <div class="form-group">
      <label>Quelle / Anlass</label>
      <input id="newGoal_source" class="form-control" value="${prefillSource || 'Reflexionsabgleich / Nachbesprechung'}" placeholder="z. B. 2. Unterrichtsbesuch Nachbesprechung" />
    </div>
  `;

  const footerHTML = `
    <button class="btn btn-outline" onclick="closeModal()">Abbrechen</button>
    <button class="btn btn-primary" onclick="saveNewGoal()"><i data-lucide="save" class="w-4 h-4 mr-1 inline"></i><span>Ziel speichern</span></button>
  `;

  openModal({ title: "Neues Entwicklungsziel vereinbaren", bodyHTML, footerHTML });
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
  renderDashboardStatusHub(cur);
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
        <td><span class="badge-pill" style="background:rgba(37,99,235,0.15); color:#60a5fa; border:1px solid rgba(37,99,235,0.3); font-weight:700;">${v.grade || '–'}</span></td>
        <td>
          <div style="display:flex; gap:6px;">
            <button class="btn btn-outline" style="font-size:0.74rem; padding:3px 8px; min-height:28px;" onclick="printConsultationSheet('${v.id}')" title="1-Klick Beratungsnachweis als 1-Seiter drucken / PDF"><i data-lucide="printer" class="w-3.5 h-3.5 text-blue-500"></i><span>Nachweis</span></button>
            <button class="btn btn-outline" style="font-size:0.74rem; padding:3px 8px; min-height:28px;" onclick="viewVisitDetails('${v.id}')"><i data-lucide="eye" class="w-3.5 h-3.5"></i><span>Details</span></button>
            <button class="btn btn-ghost" style="font-size:0.74rem; padding:3px 8px; min-height:28px; color:#f87171;" onclick="deleteVisit('${v.id}')"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
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
        <strong style="font-size:0.84rem; display:flex; align-items:center; gap:6px; margin-bottom:8px;">
          <i data-lucide="clock" class="w-4 h-4 text-blue-500"></i>
          <span>Protokollierte Beobachtungen:</span>
        </strong>
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
      <div style="background:var(--bg-card-subtle); padding:12px; border-radius:6px; border:1px solid var(--border); font-size:0.86rem; line-height:1.5;">
        ${v.notes || 'Keine zusätzlichen Notizen hinterlegt.'}
      </div>
    </div>
    ${logHtml}
  `;

  const footerHTML = `
    <div style="display:flex; justify-content:space-between; width:100%; align-items:center;">
      <button class="btn btn-primary" onclick="printConsultationSheet('${v.id}')"><i data-lucide="printer" class="w-4 h-4 mr-1"></i><span>1-Klick-Beratungsnachweis drucken</span></button>
      <button class="btn btn-outline" onclick="closeModal()">Schließen</button>
    </div>
  `;

  openModal({ title: `Details: ${v.topic || 'Unterrichtsbesuch'}`, bodyHTML, footerHTML });
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
  if (!cur) cur = typeof getCurrentLAA === 'function' ? getCurrentLAA() : null;
  const container = document.getElementById("dashboardAppointmentsList");
  if (!container) return;

  const allEvents = getAllCandidateDeadlinesAndAppointments(cur);
  if (allEvents.length === 0) {
    container.innerHTML = `<li style="color:var(--text-muted); font-size:0.84rem; font-style:italic; padding:10px 0;">Keine anstehenden Termine oder Fristen eingetragen.</li>`;
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayMs = today.getTime();

  // Sort: open/upcoming first, then done
  const sorted = [...allEvents].sort((a, b) => {
    if (a.status === 'done' && b.status !== 'done') return 1;
    if (a.status !== 'done' && b.status === 'done') return -1;
    return new Date(a.date) - new Date(b.date);
  });

  container.innerHTML = sorted.map(item => {
    const itemDate = new Date(item.date);
    itemDate.setHours(0, 0, 0, 0);
    const diffDays = Math.round((itemDate.getTime() - todayMs) / (1000 * 60 * 60 * 24));
    
    let badgeClass = "badge-neon-neutral";
    let badgeLabel = item.badgeText || "Termin";
    if (item.status === 'done') {
      badgeClass = "badge-done";
      badgeLabel = "Erledigt";
    } else if (diffDays < 0) {
      const daysAgo = Math.abs(diffDays);
      badgeClass = "badge-past";
      badgeLabel = daysAgo === 1 ? "Vor 1 Tag" : `Vor ${daysAgo} Tagen`;
    } else if (diffDays === 0) {
      badgeClass = "badge-urgent";
      badgeLabel = "Heute fällig";
    } else if (diffDays <= 7) {
      badgeClass = "badge-urgent";
      badgeLabel = `In ${diffDays} Tagen`;
    } else {
      badgeClass = item.isCustomDeadline ? "badge-neon-info" : "badge-neon-warning";
    }

    const isCustom = item.isCustomDeadline;

    return `
      <li class="goal-item" style="display:flex; justify-content:space-between; align-items:center; gap:12px;">
        <div style="flex:1; min-width:0;">
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <strong style="color:var(--text-main); font-size:0.9rem;">${item.title}</strong>
            <span class="badge ${badgeClass}" style="font-size:0.68rem;">${badgeLabel}</span>
            <span class="badge ${isCustom ? 'badge-neon-info' : 'badge-neon-neutral'}" style="font-size:0.68rem;">
              ${isCustom ? 'Fristenkalender' : (item.type || 'Termin')}
            </span>
          </div>
          <div class="goal-meta" style="margin-top:3px;">
            <i data-lucide="calendar" class="w-3 h-3 inline mr-1 text-blue-500"></i>
            <span class="font-mono tabular-nums font-semibold">${new Date(item.date).toLocaleDateString('de-DE')}</span>
            ${item.time ? ` um ${item.time} Uhr` : ''} • 
            <i data-lucide="map-pin" class="w-3 h-3 inline mr-1 text-slate-400"></i>${item.location || (isCustom ? 'Ausbildungsplan' : 'Schule')}
          </div>
          ${item.notes ? `<div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">${item.notes}</div>` : ''}
        </div>
        <div class="goal-actions" style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
          ${isCustom ? `
            <button class="btn btn-outline" style="font-size:0.72rem; padding:3px 8px; min-height:26px;" onclick="switchTab('tab-fristen')" title="Im Fristenkalender ansehen &amp; bearbeiten">
              <i data-lucide="calendar-clock" class="w-3.5 h-3.5"></i>
              <span>Öffnen</span>
            </button>
            <button class="btn btn-ghost btn-icon-only" style="color:#f87171;" onclick="deleteDeadlineById('${item.id}', ${item.index})" title="Frist löschen">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          ` : `
            <button class="btn btn-outline" style="font-size:0.72rem; padding:3px 8px; min-height:26px;" onclick="exportSingleAppointmentICS('${item.id}')" title="Als Outlook/iCal Kalendertermin exportieren">
              <i data-lucide="calendar" class="w-3.5 h-3.5"></i>
              <span>.ics</span>
            </button>
            <button class="btn btn-ghost btn-icon-only" style="color:#f87171;" onclick="deleteAppointment('${item.id}')" title="Termin löschen">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          `}
        </div>
      </li>
    `;
  }).join('');
}

function deleteDeadlineById(dlId, idx) {
  const cur = getCurrentLAA();
  if (!cur || !cur.customDeadlines) return;
  if (dlId) {
    cur.customDeadlines = cur.customDeadlines.filter(d => d.id !== dlId);
  } else if (idx !== undefined && idx >= 0) {
    cur.customDeadlines.splice(idx, 1);
  }
  saveState();
  if (typeof renderCustomDeadlinesUI === 'function') renderCustomDeadlinesUI();
  renderDashboard(cur);
  showToast("Frist entfernt.", "🗑️");
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
    <button class="btn btn-primary" onclick="saveNewAppointment()"><i data-lucide="save" class="w-4 h-4 mr-1 inline"></i><span>Termin speichern</span></button>
  `;

  openModal({ title: "Neuen Termin planen", bodyHTML, footerHTML });
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
  initLivePhrases();
}

function renderLiveCockpitUI() {
  renderLiveActiveGoalBanner();
  renderLiveCriteriaGrid();
  renderLiveLogStream();
  updateTimerDisplay();
  initLivePhrases();
}

let liveSessionFocus = "";
let isEditingLiveFocus = false;

function escapeHtmlAttr(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function setLiveFocusEditMode(isEdit) {
  isEditingLiveFocus = isEdit;
  renderLiveActiveGoalBanner();
  if (isEdit) {
    setTimeout(() => {
      const input = document.getElementById("liveFocusCustomInput");
      if (input) input.focus();
    }, 50);
  }
}

function handleLiveGoalSelectChange(val) {
  const input = document.getElementById("liveFocusCustomInput");
  if (!input) return;
  if (val && val !== "__custom__") {
    input.value = val;
  } else if (val === "__custom__") {
    input.value = "";
    input.focus();
  }
}

function applyLiveFocus() {
  const input = document.getElementById("liveFocusCustomInput");
  const saveCheck = document.getElementById("liveSaveAsGoalCheck");
  const cur = getCurrentLAA();
  if (!input || !cur) return;

  const text = input.value.trim();
  liveSessionFocus = text;
  isEditingLiveFocus = false;

  if (saveCheck && saveCheck.checked && text) {
    if (!cur.goals) cur.goals = [];
    const exists = cur.goals.some(g => (g.text || '').toLowerCase() === text.toLowerCase());
    if (!exists) {
      cur.goals.push({
        id: "g_" + Date.now(),
        text: text,
        status: "open",
        date: new Date().toISOString().split('T')[0]
      });
      saveState();
      showToast("Als neues Entwicklungsziel für " + cur.name + " hinterlegt.", "check-circle-2");
    }
  }

  renderLiveActiveGoalBanner();
  showToast(text ? "Beratungsschwerpunkt festgelegt." : "Beratungsschwerpunkt zurückgesetzt.", "target");
}

function renderLiveActiveGoalBanner() {
  const banner = document.getElementById("liveActiveGoalBanner");
  if (!banner) return;
  const cur = getCurrentLAA();
  if (!cur) {
    banner.style.display = "none";
    return;
  }

  const openGoals = (cur.goals || []).filter(g => g.status === 'open' || !g.status);
  
  // If no focus has been manually set or loaded yet, default to first open goal if available
  if (liveSessionFocus === "" && openGoals.length > 0) {
    liveSessionFocus = openGoals[0].text || "";
  }

  banner.style.display = "flex";
  banner.style.flexDirection = "column";

  if (!isEditingLiveFocus) {
    // Normal Display Mode
    banner.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; width:100%;">
        <div style="display:flex; align-items:center; gap:10px; flex:1; min-width:260px;">
          <div class="w-8 h-8 rounded-lg bg-cyan-500/20 text-blue-500 flex items-center justify-center shrink-0">
            <i data-lucide="target" class="w-4 h-4"></i>
          </div>
          <div style="flex:1;">
            <div style="font-size:0.68rem; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:#60a5fa; display:flex; align-items:center; gap:8px;">
              <span>Aktueller Beratungsschwerpunkt (Fokus der Hospitation):</span>
            </div>
            <div id="liveFocusDisplay" style="font-size:0.92rem; font-weight:600; color:var(--text-main); margin-top:2px;">
              ${liveSessionFocus 
                ? escapeHtmlAttr(liveSessionFocus) 
                : '<span style="color:var(--text-muted); font-style:italic; font-weight:normal; font-size:0.86rem;">Noch kein Schwerpunkt festgelegt. Klicken Sie auf „Schwerpunkt anpassen / wählen“, um ein Ziel oder einen individuellen Fokus zu setzen.</span>'}
            </div>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <button type="button" class="btn btn-outline" style="padding:4px 12px; font-size:0.78rem; font-weight:600;" onclick="setLiveFocusEditMode(true)">
            <i data-lucide="edit-3" class="w-3.5 h-3.5 mr-1 inline"></i>
            <span>${liveSessionFocus ? 'Ändern / Wählen' : 'Schwerpunkt festlegen'}</span>
          </button>
          <span class="badge-pill" style="background:rgba(37,99,235,0.15); color:#60a5fa; border:1px solid rgba(37,99,235,0.3); font-size:0.7rem; white-space:nowrap;">
            Fokus-Beobachtung
          </span>
        </div>
      </div>
    `;
  } else {
    // Edit & Select Mode
    const goalsOptionsHtml = openGoals.map(g => {
      const isSelected = g.text === liveSessionFocus ? 'selected' : '';
      return `<option value="${escapeHtmlAttr(g.text)}" ${isSelected}>${escapeHtmlAttr(g.text)}</option>`;
    }).join('');

    banner.innerHTML = `
      <div style="width:100%; display:flex; flex-direction:column; gap:8px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:#60a5fa;" class="inline-flex items-center gap-1.5">
            <i data-lucide="target" class="w-3.5 h-3.5"></i>
            <span>Beratungsschwerpunkt für diese Hospitation anpassen:</span>
          </span>
          <button type="button" class="btn btn-ghost btn-icon-only" style="padding:2px 6px; font-size:0.8rem;" onclick="setLiveFocusEditMode(false)">✕</button>
        </div>

        <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
          <!-- Dropdown of Candidate's Agreed Goals -->
          <select 
            id="liveGoalSelect" 
            class="form-control" 
            style="font-size:0.85rem; max-width:340px; background:var(--bg-input, rgba(255,255,255,0.06)); font-weight:500;"
            onchange="handleLiveGoalSelectChange(this.value)"
          >
            <option value="">-- Zielvereinbarung aus Akte wählen --</option>
            ${goalsOptionsHtml}
            <option value="__custom__">➕ Individuellen Schwerpunkt frei eingeben...</option>
          </select>

          <!-- Input for Custom / Edited Focus Text -->
          <input 
            id="liveFocusCustomInput" 
            type="text" 
            class="form-control" 
            style="font-size:0.88rem; flex:1; min-width:240px;" 
            value="${escapeHtmlAttr(liveSessionFocus || '')}" 
            placeholder="Schwerpunkt eingeben (z. B. Klassenführung &amp; Raumpräsenz in EA)..."
            onkeydown="if(event.key==='Enter') applyLiveFocus()"
          />

          <!-- Action Buttons -->
          <button type="button" class="btn btn-primary" style="padding:6px 14px; font-size:0.82rem; white-space:nowrap;" onclick="applyLiveFocus()">
            <i data-lucide="check" class="w-3.5 h-3.5 mr-1 inline"></i>
            <span>Übernehmen</span>
          </button>
          <button type="button" class="btn btn-outline" style="padding:6px 10px; font-size:0.82rem;" onclick="setLiveFocusEditMode(false)">
            <span>Abbrechen</span>
          </button>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-top:2px;">
          <label style="font-size:0.75rem; color:var(--text-muted); display:inline-flex; align-items:center; gap:6px; cursor:pointer;">
            <input type="checkbox" id="liveSaveAsGoalCheck" style="cursor:pointer;" />
            <span>Diesen Schwerpunkt als neue Zielvereinbarung für ${escapeHtmlAttr(cur.name)} speichern</span>
          </label>
          <span style="font-size:0.72rem; color:var(--text-muted); font-style:italic;">
            Wird beim Klick auf „Hospitation abschließen“ automatisch ins Protokoll übernommen.
          </span>
        </div>
      </div>
    `;
  }

  if (window.lucide) lucide.createIcons();
}

function toggleLiveFocusMode() {
  const isFocus = document.body.classList.toggle("live-focus-mode");
  const icon = document.getElementById("focusModeIcon");
  const text = document.getElementById("focusModeText");

  if (icon) {
    icon.setAttribute("data-lucide", isFocus ? "minimize-2" : "maximize-2");
  }
  if (text) {
    text.innerText = isFocus ? "Fokus beenden" : "Fokus-Modus";
  }
  if (window.lucide) lucide.createIcons();
  showToast(isFocus ? "Fokus-Modus aktiv (Esc zum Beenden)" : "Fokus-Modus beendet", "maximize-2");
}

function quickSwitchPhase(phaseName) {
  const select = document.getElementById("livePhaseSelect");
  if (select) {
    select.value = phaseName;
  }
  document.querySelectorAll(".phase-pill-btn").forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("data-phase") === phaseName);
  });

  const m = Math.floor(liveTimerSeconds / 60).toString().padStart(2, '0');
  const s = (liveTimerSeconds % 60).toString().padStart(2, '0');
  const time = `${m}:${s}`;

  liveLogs.unshift({
    id: "log_" + Date.now(),
    time,
    phase: phaseName,
    text: `--- Phasensprung: ${phaseName} gestartet ---`,
    isPhaseDivider: true
  });
  renderLiveLogStream();
}

function handlePhaseSelectChange(phaseName) {
  quickSwitchPhase(phaseName);
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
      btn.innerHTML = '<i data-lucide="play" class="w-4 h-4"></i><span>Start</span>';
      btn.className = "btn btn-primary";
      if (window.lucide) lucide.createIcons();
    }
  } else {
    liveTimerRunning = true;
    liveTimerInterval = setInterval(() => {
      liveTimerSeconds++;
      updateTimerDisplay();
    }, 1000);
    if (btn) {
      btn.innerHTML = '<i data-lucide="pause" class="w-4 h-4"></i><span>Pause</span>';
      btn.className = "btn btn-warning";
      if (window.lucide) lucide.createIcons();
    }
  }
  updateQuickDockState();
}

function resetTimer() {
  clearInterval(liveTimerInterval);
  liveTimerRunning = false;
  liveTimerSeconds = 0;
  updateTimerDisplay();
  const btn = document.getElementById("btnToggleTimer");
  if (btn) {
    btn.innerHTML = '<i data-lucide="play" class="w-4 h-4"></i><span>Start</span>';
    btn.className = "btn btn-primary";
    if (window.lucide) lucide.createIcons();
  }
  updateQuickDockState();
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

const LIVE_PHRASES_CATEGORIZED = {
  "all": {
    label: "Alle Kriterien",
    icon: "layers",
    phrases: []
  },
  "fachdidaktik": {
    label: "Fachdidaktik & Struktur",
    icon: "book-open",
    phrases: [
      { label: "+ Phasentransparenz", text: "Konsequente Phasentransparenz und klarer roter Faden im Stundenverlauf." },
      { label: "+ Didakt. Reduktion", text: "Treffende didaktische Reduktion auf das wesentliche Stundenziel gelungen." },
      { label: "+ Problemorientierung", text: "Gelungener problemorientierter Einstieg weckt echtes Schülerinteresse." },
      { label: "+ Tafelbild/Visualisierung", text: "Strukturierte, prozessbegleitende Visualisierung am Whiteboard/Tafelbild." },
      { label: "+ Fachsprache", text: "Konsequentes Einfordern und Modellieren präziser Fachterminologie." },
      { label: "+ Ergebnissicherung", text: "Tragfähige Ergebnissicherung vor Beginn der nächsten Phase erfolgt." }
    ]
  },
  "klassenfuehrung": {
    label: "Klassenführung & Präsenz",
    icon: "shield-check",
    phrases: [
      { label: "+ Klassenführung", text: "Souveräne Klassenführung, ruhige Moderationshaltung und hohe Allgegenwärtigkeit." },
      { label: "+ Ritualisierte Übergänge", text: "Reibungsarme, ritualisierte Phasenwechsel ohne Leerlaufzeiten." },
      { label: "+ Hoher LK-Redeanteil", text: "Erhöhter Redeanteil der Lehrkraft hemmt die Eigenaktivität der Schüler." },
      { label: "+ Raumpräsenz", text: "Gezielte Raumpräsenz und Blickkontakt aktivieren auch passivere Schüler." },
      { label: "+ Störungsprävention", text: "Proaktive, nonverbale Signalgebung stoppt Unruhe im Keim." },
      { label: "+ Zeitmanagement", text: "Präzise Zeitansagen und strukturierter Countdown für die Arbeitsphase." }
    ]
  },
  "planung": {
    label: "Unterrichtsplanung & Ziele",
    icon: "calendar",
    phrases: [
      { label: "+ Kognitive Aktivierung", text: "Aufgabenstellung fordert hohes kognitives Anspruchsniveau und eigenständiges Denken." },
      { label: "+ Kompetenzorientierung", text: "Klarer Bezug zwischen angestrebtem Kompetenzzuwachs und gewähltem Material." },
      { label: "+ Angemessenes Tempo", text: "Gutes Pacing; Zeitökonomie in allen Unterrichtsphasen gewahrt." },
      { label: "+ Methodenpassung", text: "Kooperative Lernform fördert zielgerichteten fachlichen Diskurs." },
      { label: "+ Zieltransparenz", text: "Stundenziel wird zu Beginn schülernah transparent gemacht und reflektiert." }
    ]
  },
  "differenzierung": {
    label: "Heterogenität & Differenzierung",
    icon: "users",
    phrases: [
      { label: "+ Differenzierung", text: "Differenzierte Aufgabenstellung ermöglicht allen Lernenden passgenauen Zugang." },
      { label: "+ Hilfekarten / Scaffolding", text: "Gestufte Hilfekarten (Scaffolding) unterstützen leistungsschwächere Schüler gezielt." },
      { label: "+ Expertenaufgabe", text: "Zusätzliche Transfer- und Vertiefungsaufgabe für schnelle Lerner greift gut." },
      { label: "+ Barrierefreier Zugang", text: "Anschauliche, sprachsensible Materialien entlasten Textverständnis." },
      { label: "+ Tempodifferenzierung", text: "Temporäre Differenzierung verhindert Unterforderung bei frühen Fertigstellern." }
    ]
  },
  "diagnostik": {
    label: "Diagnostik & Feedback",
    icon: "help-circle",
    phrases: [
      { label: "+ Impulsfragen", text: "Impulsfragen fordern eigenständiges Denken heraus (Wartezeit vorbildlich eingehalten)." },
      { label: "+ Lernstandsdiagnose", text: "Lernstandserhebung durch diagnostische Zwischenabfrage (z. B. Daumenprobe / Ampel)." },
      { label: "+ Konstruktives Feedback", text: "Wertschätzende, kriterienorientierte Schülerrückmeldung im Plenum." },
      { label: "+ Konstruktive Fehlerkultur", text: "Konstruktiver Umgang mit Schülerfehlern als produktiver Lernanlass." },
      { label: "+ Schülerevaluation", text: "Gezielte Schülerselbstreflexion zur erreichten Lernleistung integriert." }
    ]
  },
  "reflexion": {
    label: "Reflexion & Haltung",
    icon: "sparkles",
    phrases: [
      { label: "+ Rollenflexibilität", text: "Gelungener Wechsel zwischen Lehrerzentrierung und lernbegleitender Moderation." },
      { label: "+ Didaktische Flexibilität", text: "Spontane didaktische Anpassung an unerwartete Schülereinwürfe." },
      { label: "+ Wertschätzendes Klima", text: "Positives, fehlerfreundliches Unterrichtsklima und wertschätzender Tonfall." },
      { label: "+ Beratungsansatz", text: "Lehrkraft zeigt gutes Gespür für Phasenoptimierung und Schülerbedürfnisse." }
    ]
  }
};

let currentPhraseCategory = "all";

function initLivePhrases() {
  const catContainer = document.getElementById("livePhraseCategories");
  if (!catContainer) return;

  const categories = Object.keys(LIVE_PHRASES_CATEGORIZED);
  catContainer.innerHTML = categories.map(key => {
    const cat = LIVE_PHRASES_CATEGORIZED[key];
    const isActive = key === currentPhraseCategory;
    return `
      <button 
        type="button"
        class="phrase-cat-btn ${isActive ? 'active' : ''}" 
        onclick="selectPhraseCategory('${key}')"
      >
        <i data-lucide="${cat.icon}" class="w-3.5 h-3.5"></i>
        <span>${cat.label}</span>
      </button>
    `;
  }).join('');

  renderLivePhraseTags();
  if (window.lucide) lucide.createIcons();
}

function selectPhraseCategory(catKey) {
  currentPhraseCategory = catKey;
  const buttons = document.querySelectorAll(".phrase-cat-btn");
  const keys = Object.keys(LIVE_PHRASES_CATEGORIZED);
  buttons.forEach((btn, idx) => {
    btn.classList.toggle("active", keys[idx] === catKey);
  });
  renderLivePhraseTags();
}

function renderLivePhraseTags() {
  const tagContainer = document.getElementById("livePhraseTags");
  if (!tagContainer) return;

  let phrasesToRender = [];
  if (currentPhraseCategory === "all") {
    Object.keys(LIVE_PHRASES_CATEGORIZED).forEach(k => {
      if (k !== "all") {
        phrasesToRender = phrasesToRender.concat(LIVE_PHRASES_CATEGORIZED[k].phrases);
      }
    });
  } else if (LIVE_PHRASES_CATEGORIZED[currentPhraseCategory]) {
    phrasesToRender = LIVE_PHRASES_CATEGORIZED[currentPhraseCategory].phrases;
  }

  tagContainer.innerHTML = phrasesToRender.map(p => {
    const escapedText = p.text.replace(/'/g, "\\'");
    return `
      <button 
        type="button" 
        class="tag-btn" 
        onclick="insertPhrase('${escapedText}')"
        title="${p.text}"
      >${p.label}</button>
    `;
  }).join('');
}

function autoResizeLiveNote(el) {
  if (!el) el = document.getElementById("liveNoteInput");
  if (!el) return;
  el.style.height = "auto";
  const newH = Math.max(68, Math.min(el.scrollHeight, 260));
  el.style.height = newH + "px";
}

function handleLiveNoteKeydown(event) {
  // Support Ctrl+Enter, Cmd+Enter or plain Enter (without shift)
  if ((event.key === 'Enter' && (event.ctrlKey || event.metaKey)) || (event.key === 'Enter' && !event.shiftKey)) {
    event.preventDefault();
    addLiveNote();
  }
}

// Global Keyboard Shortcuts for Live-Hospitation (Alt + 1..5)
window.addEventListener("keydown", function(e) {
  if (e.altKey && activeTabId === "tab-live") {
    const phaseMap = {
      "1": "Einstieg",
      "2": "Erarbeitung",
      "3": "Sicherung",
      "4": "Vertiefung",
      "5": "Reflexion"
    };
    if (phaseMap[e.key]) {
      e.preventDefault();
      quickSwitchPhase(phaseMap[e.key]);
      showToast(`Phase gewechselt: ${phaseMap[e.key]} (Alt+${e.key})`, "clock");
    }
  }
});

// Guard against accidental window/tab closing while timer is actively running
window.addEventListener("beforeunload", function(e) {
  if (typeof liveTimerRunning !== "undefined" && liveTimerRunning) {
    e.preventDefault();
    e.returnValue = "Eine Live-Hospitation wird aktuell protokolliert. Möchten Sie die Seite wirklich verlassen?";
    return e.returnValue;
  }
});

function insertPhrase(phrase) {
  const input = document.getElementById("liveNoteInput");
  if (!input) return;
  input.value = input.value ? `${input.value} ${phrase}` : phrase;
  autoResizeLiveNote(input);
  input.focus();

  // Visual feedback: Subtle pulse highlight on input
  input.classList.remove("phrase-inserted-pulse");
  void input.offsetWidth; // Force reflow
  input.classList.add("phrase-inserted-pulse");
  setTimeout(() => input.classList.remove("phrase-inserted-pulse"), 600);
}

function copyLiveTranscriptText() {
  if (!liveLogs || liveLogs.length === 0) {
    showToast("Noch keine Protokolleinträge vorhanden.", "alert-triangle");
    return;
  }

  const cur = getCurrentLAA ? getCurrentLAA() : null;
  const header = `=== HOSPITATIONSPROTOKOLL ===\nKandidat: ${cur ? cur.name : 'Lehramtsanwärter'}\nDatum: ${new Date().toLocaleDateString('de-DE')}\nFachleiter/in: ${appState.mentorName || 'Fachleitung'}\n==============================\n\n`;

  const body = liveLogs.slice().reverse().map(l => {
    return `[${l.time}] (${l.phase}) ${l.text}`;
  }).join("\n");

  const fullText = header + body;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(fullText).then(() => {
      showToast("Mitschrift als Text in Zwischenablage kopiert!", "copy");
    }).catch(() => {
      fallbackCopyText(fullText);
    });
  } else {
    fallbackCopyText(fullText);
  }
}

function fallbackCopyText(text) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand("copy");
    showToast("Mitschrift in Zwischenablage kopiert!", "copy");
  } catch(err) {
    showToast("Kopieren fehlgeschlagen.", "x-circle");
  }
  document.body.removeChild(ta);
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
  input.style.height = "auto";
  persistLiveSessionDraft();
  renderLiveLogStream();
}

function persistLiveSessionDraft() {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem("fl_live_session_draft", JSON.stringify({
        logs: liveLogs,
        seconds: liveTimerSeconds,
        scores: liveScores,
        focus: liveSessionFocus || ""
      }));
    }
  } catch(e) {}
}

function restoreLiveSessionDraftIfPresent() {
  try {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem("fl_live_session_draft");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.logs) && parsed.logs.length > 0) {
          liveLogs = parsed.logs;
          if (parsed.scores && Array.isArray(parsed.scores)) liveScores = parsed.scores;
          if (parsed.focus) liveSessionFocus = parsed.focus;
          renderLiveLogStream();
          renderLiveCriteriaGrid();
          showToast("Laufende Mitschrift aus letzter Sitzung wiederhergestellt.", "check-circle");
        }
      }
    }
  } catch(e) {}
}

function renderLiveLogStream() {
  const container = document.getElementById("liveLogStream");
  if (!container) return;

  if (liveLogs.length === 0) {
    container.innerHTML = `<div style="text-align:center; color:var(--text-muted); font-size:0.84rem; padding:20px; font-style:italic;">Noch keine Protokolleinträge während dieser Hospitation erfasst.</div>`;
    return;
  }

  container.innerHTML = liveLogs.map(l => {
    if (l.isPhaseDivider) {
      return `
        <div class="log-item log-phase-divider">
          <span class="log-time">${l.time}</span>
          <span class="phase-divider-tag"><i data-lucide="flag" class="w-3.5 h-3.5 inline mr-1"></i>${l.phase}</span>
          <span style="font-weight:600; color:#60a5fa;">${l.text}</span>
          <button class="btn btn-ghost btn-icon-only" style="padding:0 6px; font-size:0.75rem; margin-left:auto;" onclick="deleteLiveLogItem('${l.id}')">✕</button>
        </div>
      `;
    }
    return `
      <div class="log-item">
        <span class="log-time">${l.time}</span>
        <span class="log-phase">${l.phase}</span>
        <span>${l.text}</span>
        <button class="btn btn-ghost btn-icon-only" style="padding:0 6px; font-size:0.75rem; margin-left:auto;" onclick="deleteLiveLogItem('${l.id}')">✕</button>
      </div>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
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
          autoResizeLiveNote(input);
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
      btn.innerHTML = '<i data-lucide="square" class="w-3.5 h-3.5 mr-1 inline"></i><span>Stopp</span>';
      if (window.lucide) lucide.createIcons();
    }
    showToast("Diktierfunktion aktiv (Sprechen Sie jetzt)...", "mic");
  } catch(e) {}
}

function stopDictation() {
  try {
    speechRecognition.stop();
    isDictating = false;
    const btn = document.getElementById("btnLiveMic");
    if (btn) {
      btn.classList.remove("listening");
      btn.innerHTML = '<i data-lucide="mic" class="w-3.5 h-3.5 mr-1 inline"></i><span>Diktieren</span>';
      if (window.lucide) lucide.createIcons();
    }
    showToast("Diktierfunktion beendet.", "info");
  } catch(e) {}
}

function openFinishVisitModal() {
  const cur = getCurrentLAA();
  if (!cur) return;

  const validScores = liveScores.filter(s => s && s > 0);
  const avgScore = validScores.length > 0 
    ? (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(1)
    : "3.0";

  // Calculate suggested points on Thüringer 15-point scale (1-5 star scale -> approx 1-15 points)
  const suggestedPoints = Math.min(15, Math.max(1, Math.round(parseFloat(avgScore) * 3)));

  const pointsScale = [
    { pts: 15, note: "1+ • Sehr gut" },
    { pts: 14, note: "1 • Sehr gut" },
    { pts: 13, note: "1- • Sehr gut" },
    { pts: 12, note: "2+ • Gut" },
    { pts: 11, note: "2 • Gut" },
    { pts: 10, note: "2- • Gut" },
    { pts: 9, note: "3+ • Befriedigend" },
    { pts: 8, note: "3 • Befriedigend" },
    { pts: 7, note: "3- • Befriedigend" },
    { pts: 6, note: "4+ • Ausreichend" },
    { pts: 5, note: "4 • Ausreichend" },
    { pts: 4, note: "4- • Ausreichend" },
    { pts: 3, note: "5+ • Mangelhaft" },
    { pts: 2, note: "5 • Mangelhaft" },
    { pts: 1, note: "6 • Ungenügend" }
  ];

  const pointsOptionsHTML = pointsScale.map(p => {
    const isSel = p.pts === suggestedPoints ? "selected" : "";
    const prefix = p.pts < 10 ? `0${p.pts}` : `${p.pts}`;
    return `<option value="${p.pts}" ${isSel}>${prefix} Punkte (${p.note})</option>`;
  }).join('');

  const bodyHTML = `
    <div class="form-group">
      <label>Thema der Unterrichtsstunde</label>
      <input id="finishVisit_topic" class="form-control" placeholder="z. B. Einführung in die Integralrechnung" />
    </div>
    <div class="form-group">
      <label class="inline-flex items-center gap-1.5 font-semibold" style="color:var(--text-main); margin-bottom:6px;">
        <i data-lucide="award" class="w-4 h-4 text-blue-500"></i>
        <span>Vorläufige Punktetendenz (1 bis 15 Punkte)</span>
      </label>
      <select id="finishVisit_points" class="form-control" style="font-weight:600; font-size:0.92rem;">
        ${pointsOptionsHTML}
      </select>
      <div style="font-size:0.75rem; color:var(--text-muted); margin-top:5px;">
        Vorauswahl errechnet aus den Live-Kriterien (~${avgScore}/5 Sternen). Thüringer 15-Punkte-System.
      </div>
    </div>
    <div class="form-group">
      <label>Beobachtungsschwerpunkt</label>
      <input id="finishVisit_focus" class="form-control" value="${escapeHtmlAttr(liveSessionFocus || '')}" placeholder="z. B. Kognitive Aktivierung &amp; Gesprächsführung" />
    </div>
    <div class="form-group">
      <label>Abschließende Nachbesprechungs-Notizen</label>
      <textarea id="finishVisit_notes" class="form-control" rows="3" placeholder="Zusammenfassung der Stärken und nächsten Entwicklungsschritte..."></textarea>
    </div>
  `;

  const footerHTML = `
    <button class="btn btn-outline" onclick="closeModal()">Abbrechen</button>
    <button class="btn btn-primary" onclick="saveFinishedVisit()"><i data-lucide="save" class="w-4 h-4 mr-1 inline"></i><span>Besuch abschließen &amp; speichern</span></button>
  `;

  openModal({ title: `Hospitation abschließen (${cur.name})`, bodyHTML, footerHTML });
}

function saveFinishedVisit() {
  const topic = document.getElementById("finishVisit_topic")?.value.trim() || "Unterrichtsbesuch";
  const pointsVal = document.getElementById("finishVisit_points")?.value || "11";
  const grade = `${pointsVal} Pkt.`;
  const focus = document.getElementById("finishVisit_focus")?.value.trim() || "";
  const notes = document.getElementById("finishVisit_notes")?.value || "";

  if (focus) liveSessionFocus = focus;

  const cur = getCurrentLAA();
  if (!cur) return;

  const phase = cur.currentPhase || cur.phase || "UB";

  if (!cur.visits) cur.visits = [];
  if (!cur.scoresHistory) cur.scoresHistory = [];

  const newVisit = {
    id: "v_" + Date.now(),
    date: new Date().toISOString().split('T')[0],
    phase,
    topic,
    grade,
    points: parseInt(pointsVal, 10),
    focus,
    notes,
    scores: [...liveScores],
    log: [...liveLogs]
  };

  cur.visits.push(newVisit);
  cur.scoresHistory.push([...liveScores]);

  saveState();
  closeModal();
  resetTimer();
  liveLogs = [];
  try { localStorage.removeItem("fl_live_session_draft"); } catch(e) {}
  showToast("Unterrichtsbesuch erfolgreich in Entwicklungsakte gesichert!", "check-circle-2");

  // Post-Hospitation Guided Workflow (Proposal 2)
  openPostHospitationWorkflowModal(newVisit);
}

function openPostHospitationWorkflowModal(visit) {
  const cur = getCurrentLAA();
  if (!cur) {
    switchTab("tab-dashboard");
    return;
  }

  const visitNum = (cur.visits || []).length;
  const bodyHTML = `
    <div style="margin-bottom: 16px;">
      <div style="display:flex; align-items:center; gap:12px; padding:12px 14px; border-radius:12px; background:rgba(74,222,128,0.08); border:1px solid rgba(74,222,128,0.25); margin-bottom:14px;">
        <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
          <i data-lucide="check-circle-2" class="w-6 h-6"></i>
        </div>
        <div>
          <h4 style="margin:0; font-size:0.98rem; font-weight:700; color:#4ade80;">Hospitation gesichert: UB ${visitNum}</h4>
          <div style="font-size:0.8rem; color:var(--text-muted);">${cur.name} • „${visit.topic}“ (Ergebnis: ${visit.grade || '–'})</div>
        </div>
      </div>
      <p style="font-size:0.86rem; color:var(--text-muted); margin-bottom:12px;">
        Wie möchten Sie diesen Ausbildungszyklus nach Thüringer Ausbildungsstandards fortführen?
      </p>
    </div>

    <div class="workflow-choice-grid">
      <!-- Option 1: Reflexionsabgleich -->
      <div class="workflow-choice-card" onclick="navigateToReflectionFromVisit('${visit.id}')">
        <div class="workflow-choice-icon bg-cyan-500/15 text-blue-500 border border-cyan-500/30">
          <i data-lucide="git-compare" class="w-5 h-5"></i>
        </div>
        <div style="flex:1;">
          <div style="font-size:0.92rem; font-weight:700; color:var(--text-main); display:flex; align-items:center; gap:6px;">
            <span>Direkt zum Reflexionsabgleich</span>
            <span class="badge-pill text-blue-500" style="font-size:0.65rem;">Empfohlen</span>
          </div>
          <div style="font-size:0.78rem; color:var(--text-muted); margin-top:2px;">
            Auswertungsgespräch führen: Fachleiter-Beobachtungen &amp; LAA-Selbsteinschätzung abgleichen.
          </div>
        </div>
        <i data-lucide="arrow-right" class="w-4 h-4 text-blue-500"></i>
      </div>

      <!-- Option 2: Entwicklungsziel vereinbaren -->
      <div class="workflow-choice-card" onclick="closeModal(); openAddGoalModal('', 'Hospitation: ${visit.topic.replace(/'/g, "\\'")} (${visit.phase})');">
        <div class="workflow-choice-icon bg-amber-500/15 text-amber-400 border border-amber-500/30">
          <i data-lucide="target" class="w-5 h-5"></i>
        </div>
        <div style="flex:1;">
          <div style="font-size:0.92rem; font-weight:700; color:var(--text-main);">
            Entwicklungsziel vereinbaren
          </div>
          <div style="font-size:0.78rem; color:var(--text-muted); margin-top:2px;">
            Konkrete Förder- und Beratungsaufgabe für den nächsten Unterrichtsbesuch festlegen.
          </div>
        </div>
        <i data-lucide="arrow-right" class="w-4 h-4 text-amber-400"></i>
      </div>

      <!-- Option 3: 1-Klick Beratungsnachweis (1-Seiter PDF) -->
      <div class="workflow-choice-card" onclick="closeModal(); printConsultationSheet('${visit.id}');">
        <div class="workflow-choice-icon bg-blue-500/15 text-blue-400 border border-blue-500/30">
          <i data-lucide="printer" class="w-5 h-5"></i>
        </div>
        <div style="flex:1;">
          <div style="font-size:0.92rem; font-weight:700; color:var(--text-main);">
            1-Klick-Beratungsnachweis drucken (1-Seiter)
          </div>
          <div style="font-size:0.78rem; color:var(--text-muted); margin-top:2px;">
            Druckreife DIN-A4-Bescheinigung für Schule &amp; Lehramtsanwärter direkt ausgeben.
          </div>
        </div>
        <i data-lucide="arrow-right" class="w-4 h-4 text-blue-400"></i>
      </div>

      <!-- Option 4: Zur Entwicklungsakte (Dashboard) -->
      <div class="workflow-choice-card" onclick="closeModal(); switchTab('tab-dashboard');">
        <div class="workflow-choice-icon bg-slate-500/15 text-slate-400 border border-slate-500/30">
          <i data-lucide="layout-dashboard" class="w-5 h-5"></i>
        </div>
        <div style="flex:1;">
          <div style="font-size:0.92rem; font-weight:700; color:var(--text-main);">
            Zur Entwicklungsakte (Dashboard)
          </div>
          <div style="font-size:0.78rem; color:var(--text-muted); margin-top:2px;">
            Gesamte Übersicht, Notenübersicht und Kompetenzradar des Kandidaten einsehen.
          </div>
        </div>
        <i data-lucide="arrow-right" class="w-4 h-4 text-slate-400"></i>
      </div>
    </div>
  `;

  const footerHTML = `
    <button class="btn btn-outline" onclick="closeModal(); switchTab('tab-dashboard');">Schließen</button>
  `;

  openModal({ title: "Geführter Hospitations-Abschluss", bodyHTML, footerHTML });
}

function navigateToReflectionFromVisit(visitId) {
  closeModal();
  const cur = getCurrentLAA();
  if (!cur) return;

  if (!cur.reflectionEntries) cur.reflectionEntries = [];
  const matchingVisit = (cur.visits || []).find(v => v.id === visitId);

  // Check if a reflection entry exists for this visit
  let refIdx = cur.reflectionEntries.findIndex(e => e.ubId === visitId);
  if (refIdx === -1) {
    const defaultFLScores = matchingVisit && matchingVisit.scores && matchingVisit.scores.length === 6
      ? [...matchingVisit.scores]
      : [3.5, 3.5, 3.5, 3.5, 3.5, 3.5];

    const newRef = {
      id: "ref_" + Date.now(),
      ubId: visitId,
      title: matchingVisit ? `Auswertungsgespräch UB ${(cur.visits || []).indexOf(matchingVisit) + 1}: ${matchingVisit.topic || 'Unterricht'}` : 'Auswertungsgespräch',
      date: matchingVisit ? matchingVisit.date : new Date().toISOString().split('T')[0],
      flScores: defaultFLScores,
      selfScores: [...defaultFLScores],
      notes: ""
    };
    cur.reflectionEntries.push(newRef);
    saveState();
    refIdx = cur.reflectionEntries.length - 1;
  }

  if (typeof activeReflectionIdx !== 'undefined') {
    activeReflectionIdx = refIdx;
  }

  switchTab("tab-reflexion");
  showToast("Auswertungsgespräch vorbereitet.", "git-compare");
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

  // Retrieve scores per visit (with fallback to scoresHistory)
  let history = [];
  if (cur.visits && cur.visits.length > 0) {
    history = cur.visits.map((v, i) => ({
      index: i,
      scores: (v.scores && v.scores.length === 6) ? v.scores : (cur.scoresHistory && cur.scoresHistory[i] ? cur.scoresHistory[i] : [3, 3, 3, 3, 3, 3]),
      label: `UB ${i + 1} (${v.topic ? (v.topic.length > 22 ? v.topic.substring(0, 22) + '...' : v.topic) : (v.date || 'Besuch')})`
    }));
  } else if (cur.scoresHistory && cur.scoresHistory.length > 0) {
    history = cur.scoresHistory.map((s, i) => ({
      index: i,
      scores: s,
      label: `UB ${i + 1}`
    }));
  }

  const filter = appState.selectedProgressionUB || 'all';

  // Apply filter
  let displayEntries = [];
  if (filter === 'latest') {
    if (history.length > 0) {
      displayEntries = [history[history.length - 1]];
    }
  } else if (filter === 'first_vs_last') {
    if (history.length === 1) {
      displayEntries = [history[0]];
    } else if (history.length >= 2) {
      displayEntries = [history[0], history[history.length - 1]];
    }
  } else {
    // 'all'
    displayEntries = history;
  }

  const palette = [
    { bg: "rgba(239, 68, 68, 0.15)", border: "#ef4444", point: "#dc2626" },   // UB 1 (Rot)
    { bg: "rgba(245, 158, 11, 0.15)", border: "#f59e0b", point: "#d97706" }, // UB 2 (Orange)
    { bg: "rgba(59, 130, 246, 0.2)", border: "#2563eb", point: "#1d4ed8" },   // UB 3 (Blau)
    { bg: "rgba(16, 185, 129, 0.25)", border: "#059669", point: "#047857" }, // UB 4 (Grün)
    { bg: "rgba(139, 92, 246, 0.2)", border: "#7c3aed", point: "#6d28d9" }   // UB 5+ (Lila)
  ];

  const datasets = [];
  if (displayEntries.length === 0) {
    datasets.push({
      label: "Keine Verlaufsdaten vorhanden",
      data: [3, 3, 3, 3, 3, 3],
      borderColor: "#cbd5e1",
      backgroundColor: "rgba(203, 213, 225, 0.2)"
    });
  } else {
    displayEntries.forEach(entry => {
      let col = palette[entry.index % palette.length];
      if (filter === 'first_vs_last') {
        if (entry.index === 0) {
          col = { bg: "rgba(239, 68, 68, 0.2)", border: "#ef4444", point: "#dc2626" }; // 1. UB = Rot
        } else {
          col = { bg: "rgba(16, 185, 129, 0.3)", border: "#059669", point: "#047857" }; // Letzter UB = Grün
        }
      }

      datasets.push({
        label: entry.label,
        data: entry.scores,
        backgroundColor: col.bg,
        borderColor: col.border,
        borderWidth: 2,
        pointBackgroundColor: col.point,
        pointRadius: 4,
        pointHoverRadius: 6
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
            ticks: { stepSize: 1, backdropColor: "transparent", color: document.body.classList.contains('theme-light') ? "#64748b" : "#94a3b8" },
            grid: { color: document.body.classList.contains('theme-light') ? "rgba(0, 0, 0, 0.08)" : "rgba(255, 255, 255, 0.1)" },
            angleLines: { color: document.body.classList.contains('theme-light') ? "rgba(0, 0, 0, 0.08)" : "rgba(255, 255, 255, 0.1)" },
            pointLabels: { font: { size: 11, weight: "bold", family: "'Inter', sans-serif" }, color: document.body.classList.contains('theme-light') ? "#1e293b" : "#cbd5e1" }
          }
        },
        plugins: {
          legend: {
            position: 'top',
            labels: { font: { size: 11, weight: '600', family: "'Inter', sans-serif" }, color: document.body.classList.contains('theme-light') ? "#1e293b" : "#cbd5e1" }
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

  let history = [];
  if (cur.visits && cur.visits.length > 0) {
    history = cur.visits.map((v, i) => ({
      index: i,
      scores: (v.scores && v.scores.length === 6) ? v.scores : (cur.scoresHistory && cur.scoresHistory[i] ? cur.scoresHistory[i] : [3, 3, 3, 3, 3, 3]),
      topic: v.topic || `UB #${i+1}`,
      date: v.date || ""
    }));
  } else if (cur.scoresHistory && cur.scoresHistory.length > 0) {
    history = cur.scoresHistory.map((s, i) => ({
      index: i,
      scores: s,
      topic: `UB #${i+1}`,
      date: ""
    }));
  }

  if (history.length === 0) {
    container.innerHTML = `<div style="text-align:center; color:var(--text-muted); padding:20px; font-style:italic;">Keine Verlaufsdaten vorhanden.</div>`;
    return;
  }

  const filter = appState.selectedProgressionUB || 'all';

  let html = `
    <div class="table-responsive">
      <table class="standard-table progression-table">
        <thead>
          <tr>
            <th>Kompetenzdimension</th>
            ${history.map((h, idx) => {
              const isSelected = (filter === 'all') || (filter === 'latest' && idx === history.length - 1) || (filter === 'first_vs_last' && (idx === 0 || idx === history.length - 1));
              return `<th class="${isSelected ? 'prog-col-active' : 'prog-col-inactive'}">UB #${idx + 1}<br><span style="font-size:0.7rem; font-weight:normal; opacity:0.8;">${h.date ? new Date(h.date).toLocaleDateString('de-DE') : ''}</span></th>`;
            }).join('')}
            <th>Entwicklung / Delta</th>
          </tr>
        </thead>
        <tbody>
  `;

  dims.forEach((dim, dIdx) => {
    const scoresForDim = history.map(h => h.scores[dIdx] || 0);
    const first = scoresForDim[0] || 0;
    const last = scoresForDim[scoresForDim.length - 1] || 0;
    const delta = (last - first).toFixed(1);
    const deltaColor = delta > 0 ? 'var(--success)' : (delta < 0 ? 'var(--danger)' : 'var(--text-muted)');

    html += `
      <tr>
        <td><strong>${dim}</strong></td>
        ${scoresForDim.map((s, idx) => {
          const isSelected = (filter === 'all') || (filter === 'latest' && idx === history.length - 1) || (filter === 'first_vs_last' && (idx === 0 || idx === history.length - 1));
          return `<td class="${isSelected ? 'prog-col-active' : 'prog-col-inactive'}"><span class="prog-score-badge">${s.toFixed(1)}</span></td>`;
        }).join('')}
        <td>
          <strong style="color:${deltaColor}; font-size:0.88rem; font-family:'JetBrains Mono', monospace;">
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
   TAB 5: SEMINARPLANER & KMK-KOMPETENZEN (ZENTRALES CURRICULUM)
   ========================================================================== */
// Delegated to js/seminar.js

/* ==========================================================================
   TAB 6: REFLEXIONSABGLEICH (SELBSTEINSCHÄTZUNG VS. FREMDEINSCHÄTZUNG)
   ========================================================================== */
// Delegated to js/reflection.js

/* ==========================================================================
   TAB 7: FRISTEN, TERMINE & NOTENRECHNER
   ========================================================================== */

function renderFristenTab() {
  if (typeof renderCustomDeadlinesUI === 'function') {
    renderCustomDeadlinesUI();
  }
  if (typeof renderCalculatorUI === 'function') {
    renderCalculatorUI();
  }
}

function exportAllAppointmentsICS() {
  const cur = getCurrentLAA();
  if (!cur) return;

  const allEvents = getAllCandidateDeadlinesAndAppointments(cur);
  if (allEvents.length === 0) {
    showToast("Keine Termine oder Fristen zum Exportieren vorhanden!", "⚠️");
    return;
  }

  let icsLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Fachleiter360//SuitePro//DE",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH"
  ];

  allEvents.forEach(a => {
    if (!a.date) return;
    const dateClean = a.date.replace(/-/g, "");
    const timeClean = a.time ? a.time.replace(/:/g, "") + "00" : "090000";
    icsLines.push("BEGIN:VEVENT");
    icsLines.push(`UID:event_${a.id}@fachleiter360.de`);
    icsLines.push(`DTSTAMP:${dateClean}T000000Z`);
    icsLines.push(`DTSTART:${dateClean}T${timeClean}`);
    icsLines.push(`SUMMARY:${a.title} (${cur.name})`);
    icsLines.push(`LOCATION:${a.location || 'Schule / Seminar'}`);
    icsLines.push(`DESCRIPTION:${a.notes || a.type || 'Frist / Termin'}`);
    icsLines.push("STATUS:CONFIRMED");
    icsLines.push("END:VEVENT");
  });

  icsLines.push("END:VCALENDAR");

  const blob = new Blob([icsLines.join("\r\n")], { type: "text/calendar;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `Fristen_und_Termine_${cur.name.replace(/[^a-zA-Z0-9]/g, '_')}.ics`;
  link.click();
  showToast("Alle Fristen & Termine (.ics) exportiert!", "📅");
}

function exportSingleAppointmentICS(appId) {
  const cur = getCurrentLAA();
  if (!cur) return;
  const allEvents = getAllCandidateDeadlinesAndAppointments(cur);
  const a = allEvents.find(item => item.id === appId || item.rawId === appId);
  if (!a || !a.date) return;

  const dateClean = a.date.replace(/-/g, "");
  const timeClean = a.time ? a.time.replace(/:/g, "") + "00" : "090000";

  const icsLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Fachleiter360//SuitePro//DE",
    "BEGIN:VEVENT",
    `UID:event_${a.id}@fachleiter360.de`,
    `DTSTAMP:${dateClean}T000000Z`,
    `DTSTART:${dateClean}T${timeClean}`,
    `SUMMARY:${a.title} (${cur.name})`,
    `LOCATION:${a.location || 'Schule / Seminar'}`,
    `DESCRIPTION:${a.notes || a.type || 'Frist / Termin'}`,
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

/**
 * FEATURE 1: 1-KLICK-BERATUNGSNACHWEIS ALS 1-SEITIGER PDF-AUSDRUCK (UB-FEEDBACKBOGEN)
 * Kompakter amtlicher Nachweis für Unterrichtsbesuche (UB 1-4) zur Weitergabe an Seminar, Schule & LAA.
 */
function printConsultationSheet(visitId) {
  const cur = getCurrentLAA();
  if (!cur || !cur.visits) return;
  const v = cur.visits.find(item => item.id === visitId) || cur.visits[cur.visits.length - 1];
  if (!v) {
    showToast("Kein Unterrichtsbesuch zum Drucken gefunden!", "⚠️");
    return;
  }

  const visitIdx = cur.visits.indexOf(v) + 1;
  const mentorName = appState.mentor || "Frau Könitzer (Fachleiterin)";
  const goals = (cur.goals || []).filter(g => g.status === 'open' || !g.status).slice(0, 3);

  // Group logs or highlights
  const logHighlights = (v.log || []).slice(0, 6);

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    showToast("Pop-up blockiert! Bitte Druckfenster im Browser zulassen.", "⚠️");
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="de">
    <head>
      <meta charset="UTF-8">
      <title>Beratungsnachweis UB ${visitIdx} – ${cur.name}</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 12mm 15mm 12mm 15mm;
        }
        * { box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #0f172a;
          background: #ffffff;
          margin: 0;
          padding: 0;
          font-size: 10pt;
          line-height: 1.45;
        }
        .header-table {
          width: 100%;
          border-bottom: 2px solid #1e3a8a;
          padding-bottom: 8px;
          margin-bottom: 12px;
        }
        .header-title {
          font-size: 14pt;
          font-weight: 800;
          color: #1e3a8a;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .header-sub {
          font-size: 8.5pt;
          color: #64748b;
          margin-top: 2px;
        }
        .meta-grid {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
        }
        .meta-grid td {
          padding: 6px 10px;
          border-bottom: 1px solid #e2e8f0;
          font-size: 9pt;
        }
        .meta-label {
          color: #475569;
          font-weight: 600;
          width: 22%;
        }
        .meta-val {
          color: #0f172a;
          font-weight: 700;
        }
        .section-title {
          font-size: 10pt;
          font-weight: 700;
          color: #1e3a8a;
          border-bottom: 1.5px solid #cbd5e1;
          padding-bottom: 3px;
          margin-top: 10px;
          margin-bottom: 6px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .box-content {
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          padding: 8px 10px;
          font-size: 9pt;
          background: #ffffff;
          min-height: 48px;
        }
        .log-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 4px;
          font-size: 8.5pt;
        }
        .log-table th {
          background: #f1f5f9;
          text-align: left;
          padding: 4px 6px;
          border-bottom: 1px solid #cbd5e1;
          color: #475569;
        }
        .log-table td {
          padding: 4px 6px;
          border-bottom: 1px solid #f1f5f9;
        }
        .goal-item {
          padding: 4px 0;
          border-bottom: 1px dashed #e2e8f0;
        }
        .goal-item:last-child { border-bottom: none; }
        .score-pill {
          display: inline-block;
          background: #eff6ff;
          color: #1d4ed8;
          border: 1px solid #bfdbfe;
          padding: 2px 8px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 9pt;
        }
        .signatures {
          margin-top: 24px;
          width: 100%;
          display: table;
          page-break-inside: avoid;
        }
        .sign-cell {
          display: table-cell;
          width: 33.33%;
          text-align: center;
          padding: 0 10px;
          vertical-align: bottom;
        }
        .sign-line {
          border-top: 1px solid #475569;
          padding-top: 4px;
          font-size: 8pt;
          color: #475569;
        }
        .footer-note {
          margin-top: 14px;
          font-size: 7.5pt;
          color: #94a3b8;
          text-align: center;
          border-top: 1px solid #e2e8f0;
          padding-top: 4px;
        }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      </style>
    </head>
    <body>
      <table class="header-table">
        <tr>
          <td>
            <div class="header-title">Staatliches Studienseminar Gera</div>
            <div class="header-sub">Schulpraktischer Beratungs- und Hospitationsnachweis gemäß ThürAZStPLVO / ThürNQVO</div>
          </td>
          <td style="text-align:right;">
            <span class="score-pill">UB #${visitIdx} • ${v.grade || 'Bewertet'}</span>
          </td>
        </tr>
      </table>

      <table class="meta-grid">
        <tr>
          <td class="meta-label">Lehramtsanwärter/in:</td>
          <td class="meta-val">${cur.name} (${cur.type || 'LAA'})</td>
          <td class="meta-label">Fachleiter/in:</td>
          <td class="meta-val">${mentorName}</td>
        </tr>
        <tr>
          <td class="meta-label">Ausbildungsschule:</td>
          <td class="meta-val">${cur.school || 'Staatliche Regelschule'}</td>
          <td class="meta-label">Mentor/in Schule:</td>
          <td class="meta-val">${cur.mentor || '–'}</td>
        </tr>
        <tr>
          <td class="meta-label">Fach / Lerngruppe:</td>
          <td class="meta-val">${cur.subject1 || 'Fachunterricht'} (${v.phase || cur.currentPhase || 'Hauptphase'})</td>
          <td class="meta-label">Hospitationsdatum:</td>
          <td class="meta-val">${v.date ? new Date(v.date).toLocaleDateString('de-DE') : new Date().toLocaleDateString('de-DE')}</td>
        </tr>
        <tr>
          <td class="meta-label">Thema der Stunde:</td>
          <td class="meta-val" colspan="3"><strong>${v.topic || 'Unterrichtsstunde'}</strong></td>
        </tr>
      </table>

      <div class="section-title">
        <span>1. Didaktischer Schwerpunkt &amp; Beobachtungsschwerpunkte</span>
      </div>
      <div class="box-content">
        ${v.focus ? `<strong>Schwerpunkt:</strong> ${v.focus}<br>` : ''}
        ${v.notes || 'Der Unterricht wurde kriteriengeleitet nach den Thüringer Ausbildungsstandards beobachtet und im anschließenden Fachleiter-Gespräch ausgewertet.'}
      </div>

      ${logHighlights.length > 0 ? `
        <div class="section-title">
          <span>2. Verlaufs- &amp; Beobachtungsprotokoll (Auszug)</span>
        </div>
        <table class="log-table">
          <thead>
            <tr>
              <th style="width:14%;">Zeit</th>
              <th style="width:22%;">Phase</th>
              <th>Didaktische Beobachtung / Impuls</th>
            </tr>
          </thead>
          <tbody>
            ${logHighlights.map(l => `
              <tr>
                <td><strong>${l.time || '–'}</strong></td>
                <td>${l.phase || 'Unterricht'}</td>
                <td>${l.text || ''}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : ''}

      <div class="section-title">
        <span>3. Verbindliche Entwicklungsziele &amp; Handlungsvereinbarungen</span>
      </div>
      <div class="box-content">
        ${goals.length > 0 ? goals.map((g, i) => `
          <div class="goal-item">
            <strong>Ziel ${i + 1}:</strong> ${g.text}
            <span style="font-size:8pt; color:#64748b;"> (Anlass: ${g.source || 'Auswertungsgespräch'})</span>
          </div>
        `).join('') : `
          <div style="color:#64748b; font-style:italic;">Im Auswertungsgespräch wurden didaktisch-methodische Handlungsfelder für den nächsten Unterrichtsbesuch einvernehmlich festgelegt.</div>
        `}
      </div>

      <div class="signatures">
        <div class="sign-cell">
          <br><br>
          <div class="sign-line">Unterschrift Lehramtsanwärter/in</div>
        </div>
        <div class="sign-cell">
          <br><br>
          <div class="sign-line">Unterschrift schulische/r Mentor/in</div>
        </div>
        <div class="sign-cell">
          <br><br>
          <div class="sign-line">Unterschrift Fachleiter/in</div>
        </div>
      </div>

      <div class="footer-note">
        Fachleiter 360° Suite • Staatliches Studienseminar Gera • Dokument erstellt am ${new Date().toLocaleDateString('de-DE')} • Exakte 1-Seiten-Ausfertigung
      </div>
    </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 350);
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

function updateChartsForTheme(theme) {
  const cur = typeof getCurrentLAA === 'function' ? getCurrentLAA() : null;
  if (!cur) return;
  if (typeof activeTabId !== 'undefined') {
    if (activeTabId === 'tab-dashboard' && typeof renderCompetencyRadarChart === 'function') {
      renderCompetencyRadarChart(cur);
    } else if (activeTabId === 'tab-progression' && typeof renderProgressionChart === 'function') {
      renderProgressionChart();
    } else if (activeTabId === 'tab-reflexion' && typeof renderReflectionRadar === 'function') {
      renderReflectionRadar();
    }
  }
}

// Global Escape listener to exit Live-Focus-Mode
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && document.body.classList.contains("live-focus-mode")) {
    toggleLiveFocusMode();
  }
});


