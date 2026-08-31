/**
 * STATE MANAGEMENT & DATA MODELS (Fachleiter-Suite 360° Pro)
 */

const DEFAULT_DATA = {
  mentorName: "Fachleitung",
  selectedLAA: null,
  connectedFolderName: "",
  selectedProgressionUB: "all",
  laas: {}
};

let appState = (() => {
  try {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem("fl_cockpit_pro_state_v8");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.laas && typeof parsed.laas === 'object' && !Array.isArray(parsed.laas)) {
          return parsed;
        }
      }
    }
  } catch(e) {
    console.warn("Storage access warning:", e);
  }
  return JSON.parse(JSON.stringify(DEFAULT_DATA));
})();

function getCurrentLAA() {
  if (!appState || !appState.laas) return null;
  if (appState.selectedLAA && appState.laas[appState.selectedLAA]) {
    return appState.laas[appState.selectedLAA];
  }
  const keys = Object.keys(appState.laas);
  if (keys.length > 0) {
    appState.selectedLAA = keys[0];
    return appState.laas[keys[0]];
  }
  return null;
}

function saveState() {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem("fl_cockpit_pro_state_v8", JSON.stringify(appState));
    }
  } catch(e) {
    console.warn("Save state warning:", e);
  }
}

const saveAppState = saveState;

function getRoleTitle(type, gender) {
  if (type === 'NQ') return gender === 'f' ? 'Nachqualifizierende Lehrkraft' : (gender === 'm' ? 'Nachqualifizierender (NQ)' : 'Nachqualifizierende Person');
  if (type === 'WB') return gender === 'f' ? 'Weiterbildungs-Teilnehmerin (WB)' : (gender === 'm' ? 'Weiterbildungs-Teilnehmer (WB)' : 'Weiterbildungs-Teilnehmer/in');
  return gender === 'f' ? 'Lehramtsanwärterin (LAA)' : (gender === 'm' ? 'Lehramtsanwärter (LAA)' : 'Lehramtsanwärter/in');
}

function calcDurationString(startStr, endStr) {
  if (!startStr || !endStr) return "-";
  const s = new Date(startStr);
  const e = new Date(endStr);
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return "-";
  const months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth()) + 1;
  return `${s.toLocaleDateString('de-DE')} bis ${e.toLocaleDateString('de-DE')} (${months} Monate)`;
}

function showToast(msg, icon = "ℹ️") {
  const container = document.getElementById("toastContainer");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<span>${icon}</span><span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function openModal({ title, bodyHTML, footerHTML }) {
  const titleEl = document.getElementById("modalTitle");
  const bodyEl = document.getElementById("modalBody");
  const footerEl = document.getElementById("modalFooter");
  const modalEl = document.getElementById("appModal") || document.getElementById("globalModalOverlay");

  if (titleEl) titleEl.innerText = title || "Dialog";
  if (bodyEl) bodyEl.innerHTML = bodyHTML || "";
  if (footerEl) footerEl.innerHTML = footerHTML || '<button class="btn btn-outline" onclick="closeModal()">Schließen</button>';
  if (modalEl) {
    modalEl.classList.add("active");
    modalEl.style.display = "flex";
  }
}

function closeModal() {
  const modalEl = document.getElementById("appModal") || document.getElementById("globalModalOverlay");
  if (modalEl) {
    modalEl.classList.remove("active");
    modalEl.style.display = "none";
  }
}

/**
 * Global Keyboard & Modal Esc Helper
 */
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeModal();
  }
});
