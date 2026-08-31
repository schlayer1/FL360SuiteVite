/**
 * STATE MANAGEMENT & DATA MODELS (Fachleiter-Suite 360° Pro)
 */

const DEMO_LAA_CANDIDATE = {
  id: "laa_max_weber",
  name: "Maximilian Weber",
  gender: "m",
  type: "LAA",
  subject1: "Deutsch",
  subject2: "Geschichte",
  school: "Staatliche Regelschule „Am Petersberg“ Erfurt",
  schoolType: "Regelschule",
  seminarLocation: "Studienseminar Erfurt",
  cohort: "2025/2026",
  startDate: "2025-02-01",
  endDate: "2026-07-31",
  currentPhase: "Prüfungsphase (3. Halbjahr)",
  mentor: "Frau StR' M. Schneider (Ausbildungslehrerin)",
  notes: "Sehr engagierter und fachlich fundierter Lehramtsanwärter kurz vor dem 2. Staatsexamen. Unterrichtet mit hoher methodischer Varianz, souveräner Klassenführung und differenzierter Aufgabenkultur.",
  
  competencies: {
    unterrichten: 4.6,
    erziehen: 4.4,
    beurteilen: 4.3,
    beraten: 4.2,
    weiterentwickeln: 4.6
  },

  scoresHistory: [
    [3.0, 3.2, 2.8, 2.5, 3.0, 3.5], // UB 1: 18.03.2025
    [3.5, 3.8, 3.4, 3.0, 3.2, 3.8], // UB 2: 12.06.2025
    [4.2, 4.0, 4.3, 4.0, 3.8, 4.2], // UB 3: 14.11.2025
    [4.6, 4.4, 4.5, 4.3, 4.2, 4.6]  // UB 4: 28.01.2026
  ],

  selfScores: [4.5, 4.5, 4.5, 4.0, 4.2, 4.6],

  visits: [
    {
      id: "v_1",
      date: "2025-03-18",
      type: "1. Unterrichtsbesuch",
      subject: "Deutsch",
      class: "7b",
      topic: "Szenische Interpretation der Ballade 'Der Zauberlehrling' von J. W. v. Goethe",
      grade: "2,7 (9 Pkt.)",
      scores: [3.0, 3.2, 2.8, 2.5, 3.0, 3.5],
      notes: "Guter Einstieg mit akustischem Impuls. Phasentransparenz und Zeitmanagement noch ausbaufähig."
    },
    {
      id: "v_2",
      date: "2025-06-12",
      type: "2. Unterrichtsbesuch",
      subject: "Geschichte",
      class: "8a",
      topic: "Die soziale Frage im 19. Jahrhundert – Lebensbedingungen von Industriearbeiterfamilien",
      grade: "2,3 (11 Pkt.)",
      scores: [3.5, 3.8, 3.4, 3.0, 3.2, 3.8],
      notes: "Starke Problemorientierung durch Karikatureinstieg. Sehr gute Reibungslosigkeit in der Gruppenarbeit."
    },
    {
      id: "v_3",
      date: "2025-11-14",
      type: "3. Unterrichtsbesuch",
      subject: "Deutsch",
      class: "9b",
      topic: "Erörterung aktueller Streitfragen im Format 'Jugend debattiert'",
      grade: "1,7 (13 Pkt.)",
      scores: [4.2, 4.0, 4.3, 4.0, 3.8, 4.2],
      notes: "Hervorragende kognitive Aktivierung, klare Kriterienorientierung und gelungene Differenzierungsangebote."
    },
    {
      id: "v_4",
      date: "2026-01-28",
      type: "4. Unterrichtsbesuch",
      subject: "Geschichte",
      class: "9a",
      topic: "Quellenkritische Analyse von Wahlplakaten der Weimarer Republik (1930–1932)",
      grade: "1,3 (14 Pkt.)",
      scores: [4.6, 4.4, 4.5, 4.3, 4.2, 4.6],
      notes: "Prüfungsreifes Niveau: Exzellente didaktische Reduktion, multiperspektivischer Unterrichtsdiskurs und souveräne Klassenführung."
    }
  ],

  goals: [
    {
      id: "g_1",
      text: "Wartezeit nach offenen Impulsfragen auf mindestens 3 Sekunden ausdehnen (kognitive Aktivierung).",
      status: "done",
      createdAt: "18.03.2025",
      source: "Auswertungsgespräch UB 1"
    },
    {
      id: "g_2",
      text: "Gestufte Hilfekarten und Differenzierungsmatrizen für heterogene Lerngruppen bereitstellen.",
      status: "done",
      createdAt: "12.06.2025",
      source: "Auswertungsgespräch UB 2"
    },
    {
      id: "g_3",
      text: "Formative Zwischensicherungen und Schülerselbstkontrolle konsequent in Erarbeitungsphasen verankern.",
      status: "progress",
      createdAt: "14.11.2025",
      source: "Auswertungsgespräch UB 3"
    },
    {
      id: "g_4",
      text: "Prüfungsdidaktische Feinabstimmung der beiden Prüfungslehrproben mit der Ausbildungsschule finalisieren.",
      status: "open",
      createdAt: "28.01.2026",
      source: "Auswertungsgespräch UB 4 (Prüfungsvorbereitung)"
    }
  ],

  appointments: [
    {
      id: "appt_1",
      title: "1. Prüfungslehrprobe (Deutsch Kl. 10)",
      date: "2026-03-24",
      time: "09:45",
      location: "RS Am Petersberg • R 204",
      note: "Thema: Lyrik der Nachkriegszeit – Prüfungskommission: StD' Wagner, OStR Dr. Keller, StR' Schneider"
    },
    {
      id: "appt_2",
      title: "2. Prüfungslehrprobe (Geschichte Kl. 9)",
      date: "2026-04-02",
      time: "11:30",
      location: "RS Am Petersberg • R 108",
      note: "Thema: Der Mauerbau 1961 im Spiegel internationaler Pressestimmen"
    },
    {
      id: "appt_3",
      title: "Mündliche Staatsprüfung (Pädagogik & Fachdidaktik)",
      date: "2026-05-07",
      time: "14:00",
      location: "Studienseminar Erfurt • Saal B",
      note: "Schwerpunkte: Schulentwicklung, Leistungsbewertung, Inklusive Didaktik"
    }
  ],

  customDeadlines: [
    {
      title: "Einreichung der Entwürfe für Prüfungslehrproben",
      date: "2026-03-17",
      seminarNote: "Spätestens 1 Woche vor der 1. Prüfungslehrprobe an Prüfungskommission",
      status: "progress"
    },
    {
      title: "1. Prüfungslehrprobe (Deutsch)",
      date: "2026-03-24",
      seminarNote: "Staatliche Regelschule Erfurt • 3. Stunde",
      status: "open"
    },
    {
      title: "2. Prüfungslehrprobe (Geschichte)",
      date: "2026-04-02",
      seminarNote: "Staatliche Regelschule Erfurt • 5. Stunde",
      status: "open"
    },
    {
      title: "Fertigstellung & Übergabe des Fachleitergutachtens (F 230)",
      date: "2026-04-20",
      seminarNote: "Vornote für die Prüfungsakte gem. § 31 ThürAZStPLVO",
      status: "open"
    },
    {
      title: "Mündliche Prüfung & Gesamtergebnis-Feststellung",
      date: "2026-05-07",
      seminarNote: "Abschlussprüfung nach §§ 32–34 ThürAZStPLVO",
      status: "open"
    }
  ],

  reflectionEntries: [
    {
      id: "ref_ub1",
      ubId: "v_1",
      title: "Auswertungsgespräch UB 1 (Balladenunterricht)",
      date: "2025-03-18",
      flScores: [3.0, 3.2, 2.8, 2.5, 3.0, 3.5],
      selfScores: [3.5, 3.8, 3.0, 2.0, 3.0, 3.5],
      notes: "Hohe Selbstkritik bei der Differenzierung, gute Selbstreflexion."
    },
    {
      id: "ref_ub2",
      ubId: "v_2",
      title: "Auswertungsgespräch UB 2 (Soziale Frage)",
      date: "2025-06-12",
      flScores: [3.5, 3.8, 3.4, 3.0, 3.2, 3.8],
      selfScores: [3.5, 4.0, 3.5, 3.0, 3.5, 4.0],
      notes: "Sehr deckungsgleiche Wahrnehmung in allen Kompetenzfeldern."
    },
    {
      id: "ref_ub3",
      ubId: "v_3",
      title: "Auswertungsgespräch UB 3 (Debattieren)",
      date: "2025-11-14",
      flScores: [4.2, 4.0, 4.3, 4.0, 3.8, 4.2],
      selfScores: [4.0, 4.2, 4.5, 3.8, 3.5, 4.0],
      notes: "Deutliche Steigerung in Didaktik und Heterogenitätsmanagement."
    },
    {
      id: "ref_ub4",
      ubId: "v_4",
      title: "Auswertungsgespräch UB 4 (Quellenkritik Weimar)",
      date: "2026-01-28",
      flScores: [4.6, 4.4, 4.5, 4.3, 4.2, 4.6],
      selfScores: [4.5, 4.5, 4.5, 4.0, 4.2, 4.6],
      notes: "Prüfungsreife Reife und souveränes Professionsbewusstsein."
    }
  ]
};

const DEFAULT_DATA = {
  mentorName: "Fachleitung",
  selectedLAA: "laa_max_weber",
  connectedFolderName: "",
  selectedProgressionUB: "all",
  laas: {
    "laa_max_weber": JSON.parse(JSON.stringify(DEMO_LAA_CANDIDATE))
  }
};

let appState = (() => {
  try {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem("fl_cockpit_pro_state_v8");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.laas && typeof parsed.laas === 'object' && !Array.isArray(parsed.laas)) {
          // If no candidate exists, insert demo candidate
          if (Object.keys(parsed.laas).length === 0) {
            parsed.laas["laa_max_weber"] = JSON.parse(JSON.stringify(DEMO_LAA_CANDIDATE));
            parsed.selectedLAA = "laa_max_weber";
          }
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

/**
 * 1-Click Demo Candidate Loader
 */
function loadDemoCandidate() {
  if (!appState.laas) appState.laas = {};
  appState.laas["laa_max_weber"] = JSON.parse(JSON.stringify(DEMO_LAA_CANDIDATE));
  appState.selectedLAA = "laa_max_weber";
  saveState();

  // If curriculum exists, assign to all modules
  if (typeof initSeminarCurriculum === 'function') {
    initSeminarCurriculum();
    (appState.seminarCurriculum || []).forEach(mod => {
      if (!mod.participants) mod.participants = {};
      mod.participants["laa_max_weber"] = {
        participated: true,
        participationScore: 5,
        transferStatus: "Sehr gut nachgewiesen",
        transferNote: "Im UB 3 und UB 4 vorbildlich und differenziert umgesetzt"
      };
    });
  }

  if (typeof renderLAAList === 'function') renderLAAList();
  if (typeof renderDashboard === 'function') renderDashboard();
  if (typeof renderCohortOverview === 'function') renderCohortOverview();
  if (typeof renderProgressionRadar === 'function') renderProgressionRadar();
  if (typeof renderSeminarTab === 'function') renderSeminarTab();
  if (typeof renderReflectionTab === 'function') renderReflectionTab();
  if (typeof renderFristenTab === 'function') renderFristenTab();

  showToast("Demokandidat 'Maximilian Weber' (Prüfungsphase) geladen!", "👤");
}

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
