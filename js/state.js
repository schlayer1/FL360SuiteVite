/**
 * STATE MANAGEMENT & DATA MODELS (Fachleiter-Suite 360° Pro)
 */

const DEFAULT_DATA = {
  mentorName: "Studiendirektor Dr. Keller",
  selectedLAA: "laa_1",
  connectedFolderName: "",
  selectedProgressionUB: "all",
  laas: {
    "laa_1": {
      id: "laa_1",
      name: "Frau Sarah Könitzer",
      gender: "f",
      type: "LAA",
      birthDate: "1998-05-15",
      schoolType: "Regelschule",
      subject1: "Mathematik",
      subject2: "Physik",
      school: "Staatliche Regelschule Erfurt-Süd, Am Südpark 12",
      mentor: "OStR Wagner",
      cohort: "Einstellung 25-08",
      startDate: "2025-08-01",
      endDate: "2027-01-31",
      currentPhase: "Hauptphase (2. Ausbildungshalbjahr)",
      competencies: { unterrichten: 4.2, erziehen: 3.8, beurteilen: 4.0, beraten: 3.5, weiterentwickeln: 4.5 },
      scoresHistory: [
        [3.2, 3.0, 2.8, 3.5, 3.0, 3.4],
        [3.5, 3.2, 3.2, 3.8, 3.2, 3.6],
        [4.0, 3.8, 3.7, 4.0, 3.5, 4.2]
      ],
      selfScores: [3.8, 3.5, 3.5, 4.0, 3.5, 4.0],
      goals: [
        { id: "g_1", text: "Wartezeit nach Impulsfragen konsequent einhalten (>3 Sek.)", status: "progress", source: "UB 2 Reflexion", createdAt: "12.11.2025" },
        { id: "g_2", text: "Schülerexperimente in Partnerarbeit mit klaren Rollenkarten strukturieren", status: "open", source: "UB 3 Nachbesprechung", createdAt: "14.01.2026" },
        { id: "g_3", text: "Tafelanschrieb als Advance Organizer nutzen", status: "done", source: "Eingangsberatung", createdAt: "15.09.2025" }
      ],
      visits: [
        { 
          id: "v_1", 
          date: "2025-10-14", 
          phase: "Orientierungsphase", 
          type: "1. UB (IF501)",
          topic: "Einführung lineare Funktionen", 
          grade: "2.3", 
          focus: "Klassenführung & Didaktik", 
          notes: "Gute Einstiegsphase, Zeiteinteilung in der Übung noch optimieren.", 
          scores: [3.2, 3.0, 2.8, 3.5, 3.0, 3.4], 
          log: [
            { time: "05:12", phase: "Einstieg", text: "Problemorientierter Einstieg mit Alltagsbezug (Handytarif-Vergleich)." },
            { time: "18:40", phase: "Erarbeitung", text: "Schüler arbeiten engagiert in Partnerarbeit. Differenzierung greift gut." },
            { time: "38:00", phase: "Sicherung", text: "Tafelbild strukturiert und sauber von den SuS übernommen." }
          ] 
        },
        { 
          id: "v_2", 
          date: "2025-11-25", 
          phase: "Hauptphase 1", 
          type: "2. UB (IF501)",
          topic: "Steigung und y-Achsenabschnitt", 
          grade: "2.0", 
          focus: "Kognitive Aktivierung", 
          notes: "Deutliche Progression bei der Klassenführung, differenziertes Arbeitsblatt.", 
          scores: [3.5, 3.2, 3.2, 3.8, 3.2, 3.6], 
          log: [
            { time: "08:30", phase: "Einstieg", text: "GeoGebra-Visualisierung am Smartboard weckt hohes Interesse." },
            { time: "22:15", phase: "Erarbeitung", text: "Gezielte Impulse bei Schülerfragen, Wartezeiten eingehalten." }
          ] 
        },
        { 
          id: "v_3", 
          date: "2026-01-20", 
          phase: "Hauptphase 2", 
          type: "3. UB (IF501)",
          topic: "Optik: Brechung von Lichtstrahlen", 
          grade: "1.7", 
          focus: "Schülerexperiment & Reflexion", 
          notes: "Hervorragendes Schülerexperiment, hohes Reflexionsniveau.", 
          scores: [4.0, 3.8, 3.7, 4.0, 3.5, 4.2], 
          log: [
            { time: "06:00", phase: "Einstieg", text: "Sicherheitsunterweisung für Laser-Experiment vorbildlich durchgeführt." },
            { time: "25:00", phase: "Erarbeitung", text: "Eigenständige Hypothesenbildung und Messwerterfassung der SuS." }
          ] 
        }
      ],
      seminars: [
        { id: "s_1", title: "M 01: Kompetenzorientierte Unterrichtsplanung", kmk: "Unterrichten", status: "Teilgenommen", transfer: "Sehr gut umgesetzt", transferNote: "UB 2: Lehrplanbezug & kognitive Aktivierung exzellent integriert", date: "15.09.2025" },
        { id: "s_2", title: "M 02: Heterogenität & Differenzierung im Fach", kmk: "Erziehen", status: "Teilgenommen", transfer: "Sehr gut umgesetzt", transferNote: "UB 3: Dreifach differenzierte Stationsarbeit erfolgreich erprobt", date: "20.10.2025" },
        { id: "s_3", title: "M 03: Diagnostik & Leistungsbeurteilung", kmk: "Beurteilen", status: "Teilgenommen", transfer: "In Planung", transferNote: "Raster zur Selbsteinschätzung der SuS in Vorbereitung", date: "01.12.2025" },
        { id: "s_4", title: "M 04: Gesprächsführung & Beratung", kmk: "Beraten", status: "Teilgenommen", transfer: "In Planung", transferNote: "Schwerpunkt im 3. Ausbildungshalbjahr", date: "15.01.2026" },
        { id: "s_5", title: "M 05: Digitale Medien im MINT-Unterricht", kmk: "Innovieren", status: "Teilgenommen", transfer: "Sehr gut umgesetzt", transferNote: "GeoGebra & Messwerterfassung im Physikunterricht aktiv eingesetzt", date: "10.02.2026" }
      ],
      appointments: [
        { id: "a_1", title: "4. Unterrichtsbesuch (Physik 9a)", date: "2026-10-02", time: "09:45", type: "Unterrichtsbesuch (UB)", location: "Physikraum 104, RS Erfurt-Süd", notes: "Thema: Induktion; Entwurf 2 Tage vorher anfordern." },
        { id: "a_2", title: "Bilanz- & Entwicklungsgespräch (Hauptphase)", date: "2026-10-08", time: "14:00", type: "Beratungsgespräch", location: "Seminarraum 3, Studienseminar", notes: "Reflexionsbogen vorbereiten & Zielvereinbarung überprüfen." },
        { id: "a_3", title: "2. Staatsprüfung (Lehrprobe & Kolloquium)", date: "2026-10-15", time: "08:00", type: "Lehrprobe / Prüfung", location: "Staatliche Regelschule Erfurt-Süd", notes: "Prüfungskommission: Keller / Wagner / SL" }
      ]
    },
    "laa_nq": {
      id: "laa_nq",
      name: "Herr Dr. Thomas Weber",
      gender: "m",
      type: "NQ",
      birthDate: "1988-11-23",
      schoolType: "Regelschule",
      subject1: "Informatik",
      subject2: "Mathematik",
      school: "Staatliche Regelschule 'Thomas Müntzer' Mihla",
      mentor: "StR M. Becker",
      cohort: "Seiteneinstieg 2025",
      startDate: "2025-02-01",
      endDate: "2026-07-31",
      currentPhase: "Nachqualifikationsphase 2 (Schulpraxis)",
      competencies: { unterrichten: 3.6, erziehen: 3.4, beurteilen: 3.2, beraten: 3.0, weiterentwickeln: 4.1 },
      scoresHistory: [
        [3.0, 3.8, 3.2, 2.5, 3.0, 3.2],
        [3.5, 3.5, 3.4, 3.2, 3.2, 3.7]
      ],
      selfScores: [3.8, 3.5, 3.2, 3.0, 3.0, 3.8],
      goals: [
        { id: "g_nq1", text: "Didaktische Reduktion bei Programmierkonzepten für Regelschüler schärfen", status: "progress", source: "1. UB Nachbesprechung", createdAt: "15.03.2025" },
        { id: "g_nq2", text: "Schüleraktivierende Erarbeitungsphasen statt LK-Zentrierung etablieren", status: "open", source: "Eingangsberatung", createdAt: "10.02.2025" }
      ],
      visits: [
        { id: "v_nq1", date: "2025-03-15", phase: "Orientierung / NQ", type: "1. UB (NQ)", topic: "Algorithmen & Flussdiagramme (Kl. 8)", grade: "2.3", focus: "Didaktische Reduktion & Schülersprache", notes: "Hohe fachliche Tiefe; Schülersprache weiter anpassen und Tempo drosseln.", scores: [3.0, 3.8, 3.2, 2.5, 3.0, 3.2], log: [] },
        { id: "v_nq2", date: "2025-05-20", phase: "Hauptphase NQ", type: "2. UB (NQ)", topic: "Bedingte Anweisungen in Scratch", grade: "2.0", focus: "Differenzierte Aufgabenkultur", notes: "Deutlicher Lernzuwachs bei den SuS, Stationsarbeit erfolgreich erprobt.", scores: [3.5, 3.5, 3.4, 3.2, 3.2, 3.7], log: [] }
      ],
      seminars: [
        { id: "s_nq1", title: "NQ-Modul 1: Pädagogische Grundlagen & Klassenführung", kmk: "Erziehen", status: "Teilgenommen", transfer: "Solide umgesetzt", transferNote: "Regel- & Ritualsystem in Kl. 8 eingeführt", date: "20.02.2025" },
        { id: "s_nq2", title: "NQ-Modul 2: Fachdidaktik Informatik in Thüringen", kmk: "Unterrichten", status: "Teilgenommen", transfer: "Sehr gut umgesetzt", transferNote: "Thüringer Lehrplan Informatik 7-10 umgesetzt", date: "25.03.2025" }
      ],
      appointments: [
        { id: "a_nq1", title: "3. Unterrichtsbesuch NQ (Informatik Kl. 9)", date: "2026-10-06", time: "11:30", type: "Unterrichtsbesuch (UB)", location: "Computerraum 2, RS Mihla", notes: "Thema: Datenbanken & SQL" },
        { id: "a_nq2", title: "Abschlusskolloquium Nachqualifikation", date: "2026-11-12", time: "13:00", type: "Lehrprobe / Prüfung", location: "Studienseminar Erfurt", notes: "Prüfungsnachweis nach ThürAZStPLVO" }
      ]
    },
    "laa_wb": {
      id: "laa_wb",
      name: "Frau Elena Bergmann",
      gender: "f",
      type: "WB",
      birthDate: "1991-03-10",
      schoolType: "Gymnasium",
      subject1: "Chemie (Zusatzqualifikation)",
      subject2: "Biologie",
      school: "Staatliches Gymnasium 'Johann Heinrich Pestalozzi' Stadtroda",
      mentor: "StD K. Franke",
      cohort: "Weiterbildung MINT 2025",
      startDate: "2025-08-01",
      endDate: "2026-07-31",
      currentPhase: "Weiterbildungsmodul 3 (Fachdidaktik Chemie)",
      competencies: { unterrichten: 4.0, erziehen: 3.9, beurteilen: 3.8, beraten: 3.7, weiterentwickeln: 4.2 },
      scoresHistory: [
        [3.8, 3.6, 3.5, 3.8, 3.5, 4.0]
      ],
      selfScores: [4.0, 3.8, 3.8, 4.0, 3.6, 4.2],
      goals: [
        { id: "g_wb1", text: "Gefährdungsbeurteilung und Sicherheitsunterweisung bei Gefahrstoffen ritualisieren", status: "progress", source: "1. WB-Hospitation", createdAt: "15.10.2025" }
      ],
      visits: [
        { id: "v_wb1", date: "2025-10-15", phase: "Weiterbildung Chemie", type: "1. WB-Besuch", topic: "Redoxreaktionen und Elektronentransfer (Kl. 10)", grade: "1.8", focus: "Experimentelle Schülersicherheit & Fachmethodik", notes: "Souveräner Medieneinsatz, vorbildliche Sicherheitsbelehrung.", scores: [3.8, 3.6, 3.5, 3.8, 3.5, 4.0], log: [] }
      ],
      seminars: [
        { id: "s_wb1", title: "WB-Modul C1: Chemische Experimente im Unterricht", kmk: "Unterrichten", status: "Teilgenommen", transfer: "Sehr gut umgesetzt", transferNote: "Schülerexperimente sicher und mikroskopisch verankert", date: "10.09.2025" },
        { id: "s_wb2", title: "WB-Modul C2: Fachmethodik & Modelldenken", kmk: "Unterrichten", status: "Teilgenommen", transfer: "In Planung", transferNote: "Teilchenmodellvisualisierung in Vorbereitung", date: "12.11.2025" }
      ],
      appointments: [
        { id: "a_wb1", title: "2. WB-Unterrichtsbesuch (Chemie 10a)", date: "2026-10-09", time: "08:30", type: "Unterrichtsbesuch (UB)", location: "Chemieraum C101, Gym Stadtroda", notes: "Säuren-Basen-Titration" }
      ]
    }
  }
};

let appState = (() => {
  try {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem("fl_cockpit_pro_state_v7") || localStorage.getItem("fl_cockpit_pro_state_v6") || localStorage.getItem("fachleiter_app_state_v360");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.laas && typeof parsed.laas === 'object' && !Array.isArray(parsed.laas)) {
          // Ensure the 3 test trainees exist
          if (!parsed.laas["laa_1"]) parsed.laas["laa_1"] = DEFAULT_DATA.laas["laa_1"];
          if (!parsed.laas["laa_nq"]) parsed.laas["laa_nq"] = DEFAULT_DATA.laas["laa_nq"];
          if (!parsed.laas["laa_wb"]) parsed.laas["laa_wb"] = DEFAULT_DATA.laas["laa_wb"];
          return parsed;
        }
      }
    }
  } catch(e) {
    console.warn("Storage access warning:", e);
  }
  return DEFAULT_DATA;
})();

function getCurrentLAA() {
  if (!appState || !appState.laas) return null;
  if (appState.laas[appState.selectedLAA]) return appState.laas[appState.selectedLAA];
  if (Array.isArray(appState.laas)) {
    return appState.laas[appState.selectedLAA] || appState.laas[0] || null;
  }
  const keys = Object.keys(appState.laas);
  if (keys.length > 0) return appState.laas[keys[0]];
  return null;
}

function saveState() {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem("fl_cockpit_pro_state_v7", JSON.stringify(appState));
      localStorage.setItem("fl_cockpit_pro_state_v6", JSON.stringify(appState));
      localStorage.setItem("fachleiter_app_state_v360", JSON.stringify(appState));
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

  if (titleEl) titleEl.innerText = title;
  if (bodyEl) bodyEl.innerHTML = bodyHTML;
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

let nsState = {
  activeExam: "praktisch",
  selections: {},
  timerSeconds: 0,
  timerIsRunning: false,
  protocolEntries: [],
  currentTags: [],
  editableText: "",
  lastAutoText: "",
  backupText: "",
  editorFont: "Arial",
  editorSize: "11pt",
  openCategories: {},
  showProfile: false,
  focusMode: false,
  categoryFilter: "all"
};

// POINT MAPPING FOR 15-POINT SYSTEM
const POINT_MAPPING = { 15:0, 14:0, 13:1, 12:1, 11:1, 10:2, 9:2, 8:2, 7:3, 6:3, 5:3, 4:4, 3:4, 2:4, 1:5, 0:5 };
const POINT_GROUPS = [[15, 14], [13, 12, 11], [10, 9, 8], [7, 6, 5], [4, 3, 2], [1, 0]];
const COLUMN_COLORS = [
  { bg: '#dcfce7', text: '#166534', border: '#86efac', activeBg: '#22c55e', activeText: '#ffffff' }, // 15,14 (Sehr gut)
  { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7', activeBg: '#10b981', activeText: '#ffffff' }, // 13,12,11 (Gut)
  { bg: '#fef9c3', text: '#854d0e', border: '#fde047', activeBg: '#eab308', activeText: '#ffffff' }, // 10,9,8 (Befriedigend)
  { bg: '#ffedd5', text: '#9a3412', border: '#fdba74', activeBg: '#f97316', activeText: '#ffffff' }, // 7,6,5 (Ausreichend)
  { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5', activeBg: '#ef4444', activeText: '#ffffff' }, // 4,3,2 (Mangelhaft)
  { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1', activeBg: '#64748b', activeText: '#ffffff' }  // 1,0 (Ungenügend)
];
