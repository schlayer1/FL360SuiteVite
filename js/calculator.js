/**
 * THURINGIAN LEGAL DEADLINES & FINAL GRADE CALCULATOR (Fachleiter 360° Suite Pro)
 * Covers: Lehramtsanwärter (ThürAZStPLVO §31-§33), Nachqualifikation (ThürNQVO), Weiterbildung (ThürAZStPLVO §40)
 */

let activeCalcMode = "LAA"; // "LAA", "NQ", "WB"

const LEGAL_DOCS = {
  LAA: {
    title: "ThürAZStPLVO (2016)",
    fullTitle: "Thüringer Verordnung über die Ausbildung und Zweite Staatsprüfung für die Lehrämter",
    section: "§ 31 (Noten und Punktesystem), § 32 (Mündliche Prüfung), § 33 (Gesamtergebnis)",
    url: "https://landesrecht.thueringen.de/bsth/document/jlr-LehrAmtsStPrVTH2016pP1",
    infoText: "Die Zweite Staatsprüfung gilt als bestanden, wenn das Gesamtergebnis mindestens 5,00 Notenpunkte ('ausreichend') beträgt und keine der Prüfungsleistungen mit 0 Punkten bewertet wurde."
  },
  NQ: {
    title: "ThürNQVO / ThürLbG",
    fullTitle: "Thüringer Verordnung über die Nachqualifizierung & Anpassungslehrgänge für den Seiteneinstieg",
    section: "§ 8 (Schulpraktische Nachqualifikation) & § 12 (Abschlusskolloquium & Gesamtnote)",
    url: "https://bildung.thueringen.de/lehrkraefte/lehrerausbildung",
    infoText: "Die Nachqualifikation umfasst die Bewertung der KMK-Pädagogik-Module (40%), die schulpraktische Beurteilung (20%), den Prüfungsunterricht (20%) und das Abschlusskolloquium (20%)."
  },
  WB: {
    title: "ThürAZStPLVO § 40 / WB-RL",
    fullTitle: "Thüringer Richtlinie über die Weiterbildung & Erweiterungsprüfungen für Lehrkräfte",
    section: "§ 40 (Erweiterungsprüfung und Zusatzzertifikate) & TMBJS-Weiterbildungsrichtlinie",
    url: "https://landesrecht.thueringen.de/bsth/document/jlr-LehrAmtsStPrVTH2016pP40",
    infoText: "Zusatzqualifikationen und Erweiterungsfächer erfordern den erfolgreichen Nachweis der Fachdidaktik-Module (30%), die Weiterbildungs-Lehrprobe (40%) und das Fachkolloquium (30%)."
  }
};

const DEFAULT_DEADLINE_TEMPLATES = {
  LAA: [
    { id: "eb", title: "Eingangsberatung & Ausbildungsplan", monthOffset: 3, notes: "Absprache der Schwerpunkte & Ausbildungsplan (§ 12)", status: "open" },
    { id: "hp1", title: "Zwischenbilanz Hauptphase 1", monthOffset: 6, notes: "Reflexion der ersten UBs & Zielvereinbarung (§ 15)", status: "open" },
    { id: "hp2", title: "Entwicklungsgespräch Hauptphase 2", monthOffset: 12, notes: "Halbzeit-Bilanz & Festlegung des Prüfungszeitraums", status: "open" },
    { id: "ha", title: "Abgabe Schriftliche Hausarbeit / Prüfungsarbeit", monthOffset: 16, notes: "Einreichung beim Landesprüfungsamt (§ 22)", status: "open" },
    { id: "draft", title: "Frist: Vorlage schriftlicher Prüfungsentwurf", monthOffset: 17, daysBefore: 2, notes: "2 Arbeitstage vor der Lehrprobe bei der Kommission einreichen", status: "open" },
    { id: "exam", title: "2. Staatsprüfung (Lehrproben & Kolloquium)", monthOffset: 18, notes: "Prüfungsabschluss nach § 24-§ 30 ThürAZStPLVO", status: "open" }
  ],
  NQ: [
    { id: "nq_intro", title: "Eingangsdiagnostik & NQ-Zielvereinbarung", monthOffset: 2, notes: "Bestandsaufnahme & Festlegung der pädagogischen Module", status: "open" },
    { id: "nq_mid", title: "Zwischenreflexion Schulpraxis", monthOffset: 6, notes: "Rückmeldung der Schulleitung & Ausbildungsbesuch", status: "open" },
    { id: "nq_modules", title: "Nachweisabschluss aller NQ-Module", monthOffset: 14, notes: "KMK-Modulzertifikate beim Studienseminar vorlegen", status: "open" },
    { id: "nq_exam", title: "Prüfungsunterricht & Abschlusskolloquium", monthOffset: 18, notes: "Abschlussbewertung gemäß ThürNQVO", status: "open" }
  ],
  WB: [
    { id: "wb_intro", title: "Weiterbildungsberatung Fachdidaktik", monthOffset: 2, notes: "Fachspezifische Vereinbarung mit dem Fachleiter", status: "open" },
    { id: "wb_mid", title: "1. Weiterbildungs-Hospitation", monthOffset: 6, notes: "Schulpraktische Erprobung der Fachmethodik", status: "open" },
    { id: "wb_exam", title: "Zertifikats-Lehrprobe & Fachkolloquium", monthOffset: 12, notes: "Erweiterungsprüfung gemäß § 40 ThürAZStPLVO", status: "open" }
  ]
};

function renderFristenTab() {
  const cur = getCurrentLAA();
  if (cur && cur.type && ['LAA', 'NQ', 'WB'].includes(cur.type)) {
    activeCalcMode = cur.type;
  }
  renderCustomDeadlinesUI();
  renderCalculatorUI();
}

/**
 * 1. INDIVIDUALLY EDITABLE DEADLINES & SEMINAR TIMELINES
 */
function renderCustomDeadlinesUI() {
  const container = document.getElementById("deadlinesTableContainer");
  if (!container) return;

  const cur = getCurrentLAA();
  if (!cur) {
    container.innerHTML = '<div style="text-align:center; padding:20px; color:#94a3b8;">Bitte wählen oder erstellen Sie zuerst ein Kandidatenprofil.</div>';
    return;
  }

  // Initialize candidate deadlines if not present
  if (!cur.customDeadlines || cur.customDeadlines.length === 0) {
    const type = cur.type || "LAA";
    const tmpl = DEFAULT_DEADLINE_TEMPLATES[type] || DEFAULT_DEADLINE_TEMPLATES.LAA;
    const start = cur.startDate ? new Date(cur.startDate) : new Date();

    cur.customDeadlines = tmpl.map(t => {
      const calcDate = new Date(start);
      calcDate.setMonth(calcDate.getMonth() + (t.monthOffset || 0));
      return {
        id: t.id || "dl_" + Math.random().toString(36).substr(2, 6),
        title: t.title,
        legalGuideline: `${t.monthOffset || 0}. Monat (${calcDate.toLocaleDateString('de-DE')})`,
        customDate: calcDate.toISOString().split('T')[0],
        notes: t.notes || "",
        status: t.status || "open"
      };
    });
    saveState();
  }

  const now = new Date();

  let rowsHtml = "";
  cur.customDeadlines.forEach((dl, idx) => {
    const dDate = dl.customDate ? new Date(dl.customDate) : null;
    let badgeClass = "badge-open";
    let badgeLabel = "Offen";

    if (dl.status === 'done') {
      badgeClass = "badge-done";
      badgeLabel = "Erledigt";
    } else if (dDate) {
      const diffDays = Math.ceil((dDate - now) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) {
        badgeClass = "badge-overdue";
        badgeLabel = `Überfällig (${Math.abs(diffDays)} T.)`;
      } else if (diffDays <= 7) {
        badgeClass = "badge-urgent";
        badgeLabel = `In ${diffDays} Tagen`;
      }
    }

    rowsHtml += `
      <tr class="deadline-row">
        <td>
          <input 
            type="text" 
            class="form-control deadline-title-input" 
            value="${dl.title || ''}" 
            onchange="updateDeadlineField(${idx}, 'title', this.value)"
            placeholder="Bezeichnung des Meilensteins"
          />
          <div style="font-size:0.72rem; color:#64748b; margin-top:2px;">
            Gesetzl. Orientierung: <strong>${dl.legalGuideline || '–'}</strong>
          </div>
        </td>
        <td style="width: 160px;">
          <input 
            type="date" 
            class="form-control" 
            style="font-size:0.82rem; padding:4px 8px;" 
            value="${dl.customDate || ''}" 
            onchange="updateDeadlineField(${idx}, 'customDate', this.value)"
          />
        </td>
        <td>
          <input 
            type="text" 
            class="form-control" 
            style="font-size:0.8rem; padding:4px 8px;" 
            value="${dl.notes || ''}" 
            onchange="updateDeadlineField(${idx}, 'notes', this.value)"
            placeholder="Seminarinterne Notizen..."
          />
        </td>
        <td style="width: 130px; text-align:center;">
          <select class="form-control deadline-status-select ${badgeClass}" onchange="updateDeadlineField(${idx}, 'status', this.value)">
            <option value="open" ${dl.status === 'open' ? 'selected' : ''}>⏳ Offen</option>
            <option value="progress" ${dl.status === 'progress' ? 'selected' : ''}>🔄 In Planung</option>
            <option value="done" ${dl.status === 'done' ? 'selected' : ''}>✅ Erledigt</option>
          </select>
        </td>
        <td style="width: 60px; text-align:right;">
          <button class="btn btn-ghost btn-icon-only" style="color:#ef4444;" onclick="deleteDeadlineRow(${idx})" title="Meilenstein löschen">🗑️</button>
        </td>
      </tr>
    `;
  });

  container.innerHTML = `
    <div class="table-responsive">
      <table class="data-table" style="margin:0;">
        <thead>
          <tr>
            <th>Meilenstein / Frist-Bezeichnung</th>
            <th>Individuelles Datum</th>
            <th>Details &amp; Frist-Hinweise</th>
            <th style="text-align:center;">Status</th>
            <th style="text-align:right;">Aktion</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </div>
    <div style="padding: 12px 16px; background:#f8fafc; border-top:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
      <button class="btn btn-outline" style="font-size:0.8rem; padding:5px 12px;" onclick="addNewDeadlineRow()">
        ➕ Eigene Frist / Seminar-Meilenstein hinzufügen
      </button>
      <button class="btn btn-outline" style="font-size:0.8rem; padding:5px 12px;" onclick="resetDeadlinesToDefault()">
        🔄 Auf Thüringer Standard zurücksetzen
      </button>
    </div>
  `;
}

function updateDeadlineField(idx, field, value) {
  const cur = getCurrentLAA();
  if (!cur || !cur.customDeadlines || !cur.customDeadlines[idx]) return;
  cur.customDeadlines[idx][field] = value;
  saveState();
  if (field === 'status' || field === 'customDate') {
    renderCustomDeadlinesUI();
  }
}

function addNewDeadlineRow() {
  const cur = getCurrentLAA();
  if (!cur) return;
  if (!cur.customDeadlines) cur.customDeadlines = [];

  cur.customDeadlines.push({
    id: "dl_" + Date.now(),
    title: "Neuer seminarinterner Termin",
    legalGuideline: "Individuelle Frist",
    customDate: new Date().toISOString().split('T')[0],
    notes: "",
    status: "open"
  });

  saveState();
  renderCustomDeadlinesUI();
  showToast("Neuer Frist-Meilenstein hinzugefügt!", "➕");
}

function deleteDeadlineRow(idx) {
  const cur = getCurrentLAA();
  if (!cur || !cur.customDeadlines) return;
  cur.customDeadlines.splice(idx, 1);
  saveState();
  renderCustomDeadlinesUI();
  showToast("Meilenstein entfernt.", "🗑️");
}

function resetDeadlinesToDefault() {
  const cur = getCurrentLAA();
  if (!cur) return;
  cur.customDeadlines = [];
  saveState();
  renderCustomDeadlinesUI();
  showToast("Fristen auf Thüringer Standard zurückgesetzt!", "🔄");
}

/**
 * 2. LEGAL FINAL GRADE CALCULATOR (ThürAZStPLVO §31-33 / ThürNQVO / WB)
 */
function setCalcMode(mode) {
  activeCalcMode = mode;
  renderCalculatorUI();
}

function renderCalculatorUI() {
  const container = document.getElementById("calculatorContainer");
  if (!container) return;

  const cur = getCurrentLAA() || {};
  const doc = LEGAL_DOCS[activeCalcMode] || LEGAL_DOCS.LAA;

  let fieldsHtml = "";

  if (activeCalcMode === "LAA") {
    fieldsHtml = `
      <div class="calc-row">
        <div>
          <span style="font-weight:600;">Ausbildungsnote / Seminargutachten (40%):</span>
          <div style="font-size:0.72rem; color:#64748b;">Gesamturteil Schule &amp; Seminar (§ 18 ThürAZStPLVO)</div>
        </div>
        <div style="display:flex; align-items:center; gap:6px;">
          <input id="calc_laa_vornote" type="number" min="0" max="15" step="0.1" class="calc-input" value="11.5" oninput="calculateFinalGradeLive()" />
          <span class="calc-unit">Pkt.</span>
        </div>
      </div>

      <div class="calc-row">
        <div>
          <span style="font-weight:600;">1. Prüfungslehrprobe (1. Ausbildungsfach) [20%]:</span>
          <div style="font-size:0.72rem; color:#64748b;">Prüfungsunterricht nach § 24 ThürAZStPLVO</div>
        </div>
        <div style="display:flex; align-items:center; gap:6px;">
          <input id="calc_laa_lp1" type="number" min="0" max="15" step="0.1" class="calc-input" value="12.0" oninput="calculateFinalGradeLive()" />
          <span class="calc-unit">Pkt.</span>
        </div>
      </div>

      <div class="calc-row">
        <div>
          <span style="font-weight:600;">2. Prüfungslehrprobe (2. Ausbildungsfach) [20%]:</span>
          <div style="font-size:0.72rem; color:#64748b;">Prüfungsunterricht nach § 24 ThürAZStPLVO</div>
        </div>
        <div style="display:flex; align-items:center; gap:6px;">
          <input id="calc_laa_lp2" type="number" min="0" max="15" step="0.1" class="calc-input" value="11.0" oninput="calculateFinalGradeLive()" />
          <span class="calc-unit">Pkt.</span>
        </div>
      </div>

      <div class="calc-row">
        <div>
          <span style="font-weight:600;">Mündliche Prüfung / Prüfungskolloquium [20%]:</span>
          <div style="font-size:0.72rem; color:#64748b;">Pädagogik, Schulrecht &amp; Fachdidaktiken (§ 27)</div>
        </div>
        <div style="display:flex; align-items:center; gap:6px;">
          <input id="calc_laa_mp" type="number" min="0" max="15" step="0.1" class="calc-input" value="13.0" oninput="calculateFinalGradeLive()" />
          <span class="calc-unit">Pkt.</span>
        </div>
      </div>
    `;
  } else if (activeCalcMode === "NQ") {
    fieldsHtml = `
      <div class="calc-row">
        <div>
          <span style="font-weight:600;">Pädagogische KMK-Modulnachweise (40%):</span>
          <div style="font-size:0.72rem; color:#64748b;">Abschluss der 5 KMK-Kompetenzmodule am Studienseminar</div>
        </div>
        <div style="display:flex; align-items:center; gap:6px;">
          <input id="calc_nq_modules" type="number" min="0" max="15" step="0.1" class="calc-input" value="11.0" oninput="calculateFinalGradeLive()" />
          <span class="calc-unit">Pkt.</span>
        </div>
      </div>

      <div class="calc-row">
        <div>
          <span style="font-weight:600;">Schulpraktische Beurteilung (20%):</span>
          <div style="font-size:0.72rem; color:#64748b;">Beurteilung der Ausbildungsschule / Schulleitung</div>
        </div>
        <div style="display:flex; align-items:center; gap:6px;">
          <input id="calc_nq_school" type="number" min="0" max="15" step="0.1" class="calc-input" value="10.5" oninput="calculateFinalGradeLive()" />
          <span class="calc-unit">Pkt.</span>
        </div>
      </div>

      <div class="calc-row">
        <div>
          <span style="font-weight:600;">Prüfungslehrprobe / Unterrichtspraxis (20%):</span>
          <div style="font-size:0.72rem; color:#64748b;">Schulpraktischer Prüfungsunterricht im Fach</div>
        </div>
        <div style="display:flex; align-items:center; gap:6px;">
          <input id="calc_nq_lp" type="number" min="0" max="15" step="0.1" class="calc-input" value="11.5" oninput="calculateFinalGradeLive()" />
          <span class="calc-unit">Pkt.</span>
        </div>
      </div>

      <div class="calc-row">
        <div>
          <span style="font-weight:600;">Abschlusskolloquium &amp; Reflexion (20%):</span>
          <div style="font-size:0.72rem; color:#64748b;">Fachdidaktisches Abschlussgespräch (ThürNQVO § 12)</div>
        </div>
        <div style="display:flex; align-items:center; gap:6px;">
          <input id="calc_nq_koll" type="number" min="0" max="15" step="0.1" class="calc-input" value="12.0" oninput="calculateFinalGradeLive()" />
          <span class="calc-unit">Pkt.</span>
        </div>
      </div>
    `;
  } else if (activeCalcMode === "WB") {
    fieldsHtml = `
      <div class="calc-row">
        <div>
          <span style="font-weight:600;">Fachdidaktik-Weiterbildungsmodule (30%):</span>
          <div style="font-size:0.72rem; color:#64748b;">Theorie- &amp; Methodenmodule am Studienseminar</div>
        </div>
        <div style="display:flex; align-items:center; gap:6px;">
          <input id="calc_wb_modules" type="number" min="0" max="15" step="0.1" class="calc-input" value="12.0" oninput="calculateFinalGradeLive()" />
          <span class="calc-unit">Pkt.</span>
        </div>
      </div>

      <div class="calc-row">
        <div>
          <span style="font-weight:600;">Weiterbildungs-Lehrprobe (40%):</span>
          <div style="font-size:0.72rem; color:#64748b;">Prüfungsunterricht im Erweiterungsfach (§ 40)</div>
        </div>
        <div style="display:flex; align-items:center; gap:6px;">
          <input id="calc_wb_lp" type="number" min="0" max="15" step="0.1" class="calc-input" value="12.5" oninput="calculateFinalGradeLive()" />
          <span class="calc-unit">Pkt.</span>
        </div>
      </div>

      <div class="calc-row">
        <div>
          <span style="font-weight:600;">Fachwissenschaftliches Kolloquium (30%):</span>
          <div style="font-size:0.72rem; color:#64748b;">Mündliche Erweiterungsprüfung vor der Kommission</div>
        </div>
        <div style="display:flex; align-items:center; gap:6px;">
          <input id="calc_wb_koll" type="number" min="0" max="15" step="0.1" class="calc-input" value="13.0" oninput="calculateFinalGradeLive()" />
          <span class="calc-unit">Pkt.</span>
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <!-- Mode Selection Pills -->
    <div style="display:flex; gap:6px; margin-bottom:16px; flex-wrap:wrap;">
      <button class="btn ${activeCalcMode === 'LAA' ? 'btn-primary' : 'btn-outline'}" style="font-size:0.78rem; padding:5px 12px;" onclick="setCalcMode('LAA')">
        🎓 Lehramtsanwärter (LAA) • ThürAZStPLVO
      </button>
      <button class="btn ${activeCalcMode === 'NQ' ? 'btn-primary' : 'btn-outline'}" style="font-size:0.78rem; padding:5px 12px;" onclick="setCalcMode('NQ')">
        💼 Nachqualifikation (NQ) • ThürNQVO
      </button>
      <button class="btn ${activeCalcMode === 'WB' ? 'btn-primary' : 'btn-outline'}" style="font-size:0.78rem; padding:5px 12px;" onclick="setCalcMode('WB')">
        🔬 Weiterbildung (WB) • § 40 ThürAZStPLVO
      </button>
    </div>

    <!-- Official Legal Reference Link Banner -->
    <div class="legal-doc-banner">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px;">
        <div>
          <div style="font-weight:700; font-size:0.86rem; color:#1e3a8a; display:flex; align-items:center; gap:6px;">
            <span>⚖️</span> <span>${doc.title}</span> &ndash; <span>${doc.section}</span>
          </div>
          <div style="font-size:0.78rem; color:#475569; margin-top:2px;">
            ${doc.fullTitle}
          </div>
          <div style="font-size:0.75rem; color:#64748b; margin-top:4px;">
            💡 ${doc.infoText}
          </div>
        </div>
        <a href="${doc.url}" target="_blank" rel="noopener" class="btn btn-outline" style="font-size:0.72rem; padding:3px 8px; white-space:nowrap; background:#fff;">
          🔗 Gesetzestext öffnen ↗
        </a>
      </div>
    </div>

    <!-- Input Calculation Rows -->
    <div class="calc-box" style="margin-top:14px;">
      ${fieldsHtml}

      <!-- Result Display -->
      <div class="calc-result-box">
        <div>
          <div style="font-size:0.78rem; color:#64748b; text-transform:uppercase; font-weight:700; letter-spacing:0.5px;">Gesamtergebnis (${doc.title})</div>
          <div id="calcFinalScoreDisplay" style="font-size:1.4rem; font-weight:800; color:#1e3a8a; font-family:'JetBrains Mono',monospace; margin-top:2px;">
            11.60 Pkt. (1,8 • Gut)
          </div>
          <div id="calcPassedBadge" style="margin-top:4px;">
            <span class="badge" style="background:#dcfce7; color:#15803d; font-size:0.75rem; padding:2px 8px;">✅ Prüfung bestanden (&ge; 5,00 Pkt.)</span>
          </div>
        </div>
        <button class="btn btn-outline" style="font-size:0.78rem; padding:6px 12px; background:#fff;" onclick="transferGradeToCockpit()" title="Ergebnis in Formular-Cockpit übertragen">
          ⚡ In Formular F 230 übertragen
        </button>
      </div>
    </div>
  `;

  calculateFinalGradeLive();
}

function calculateFinalGradeLive() {
  let weightedPoints = 0;

  if (activeCalcMode === "LAA") {
    const vornote = parseFloat(document.getElementById("calc_laa_vornote")?.value) || 0;
    const lp1 = parseFloat(document.getElementById("calc_laa_lp1")?.value) || 0;
    const lp2 = parseFloat(document.getElementById("calc_laa_lp2")?.value) || 0;
    const mp = parseFloat(document.getElementById("calc_laa_mp")?.value) || 0;
    weightedPoints = (vornote * 0.4) + (lp1 * 0.2) + (lp2 * 0.2) + (mp * 0.2);
  } else if (activeCalcMode === "NQ") {
    const modules = parseFloat(document.getElementById("calc_nq_modules")?.value) || 0;
    const school = parseFloat(document.getElementById("calc_nq_school")?.value) || 0;
    const lp = parseFloat(document.getElementById("calc_nq_lp")?.value) || 0;
    const koll = parseFloat(document.getElementById("calc_nq_koll")?.value) || 0;
    weightedPoints = (modules * 0.4) + (school * 0.2) + (lp * 0.2) + (koll * 0.2);
  } else if (activeCalcMode === "WB") {
    const modules = parseFloat(document.getElementById("calc_wb_modules")?.value) || 0;
    const lp = parseFloat(document.getElementById("calc_wb_lp")?.value) || 0;
    const koll = parseFloat(document.getElementById("calc_wb_koll")?.value) || 0;
    weightedPoints = (modules * 0.3) + (lp * 0.4) + (koll * 0.3);
  }

  // Convert 15 Points to Decimal Grade & Word Rating
  const decimalGrade = pointsToDecimalGrade(weightedPoints);
  const wordRating = pointsToWordRating(weightedPoints);
  const isPassed = weightedPoints >= 5.0;

  const scoreEl = document.getElementById("calcFinalScoreDisplay");
  const badgeEl = document.getElementById("calcPassedBadge");

  if (scoreEl) {
    scoreEl.innerText = `${weightedPoints.toFixed(2)} Pkt. (${decimalGrade} • ${wordRating})`;
  }

  if (badgeEl) {
    if (isPassed) {
      badgeEl.innerHTML = `<span class="badge" style="background:#dcfce7; color:#15803d; font-size:0.75rem; padding:2px 8px;">✅ Prüfung bestanden (&ge; 5,00 Pkt.)</span>`;
    } else {
      badgeEl.innerHTML = `<span class="badge" style="background:#fee2e2; color:#b91c1c; font-size:0.75rem; padding:2px 8px;">❌ Nicht bestanden (&lt; 5,00 Pkt.)</span>`;
    }
  }
}

function pointsToDecimalGrade(points) {
  // Thuringian linear translation formula from 15 to 1:
  // 15 -> 1.0, 14 -> 1.0, 13 -> 1.3, 12 -> 1.7, 11 -> 2.0, 10 -> 2.3, 9 -> 2.7, 8 -> 3.0, 7 -> 3.3, 6 -> 3.7, 5 -> 4.0, 4 -> 4.3, 3 -> 4.7, 2 -> 5.0, 1 -> 5.5, 0 -> 6.0
  if (points >= 14.5) return "1,0";
  if (points >= 13.5) return "1,1";
  if (points >= 12.5) return "1,3";
  if (points >= 11.5) return "1,7";
  if (points >= 10.5) return "2,0";
  if (points >= 9.5) return "2,3";
  if (points >= 8.5) return "2,7";
  if (points >= 7.5) return "3,0";
  if (points >= 6.5) return "3,3";
  if (points >= 5.5) return "3,7";
  if (points >= 4.5) return "4,0";
  if (points >= 3.5) return "4,3";
  if (points >= 2.5) return "4,7";
  if (points >= 1.5) return "5,0";
  if (points >= 0.5) return "5,5";
  return "6,0";
}

function pointsToWordRating(points) {
  if (points >= 13.5) return "Sehr gut";
  if (points >= 10.5) return "Gut";
  if (points >= 7.5) return "Befriedigend";
  if (points >= 5.0) return "Ausreichend";
  if (points >= 1.5) return "Mangelhaft";
  return "Ungenügend";
}

function transferGradeToCockpit() {
  const scoreText = document.getElementById("calcFinalScoreDisplay")?.innerText || "";
  if (!appState.pdfFormValues) appState.pdfFormValues = {};

  const cur = getCurrentLAA() || {};
  let pts = "12";
  let word = "Gut";
  let grade = "1,7";

  if (activeCalcMode === "LAA") {
    pts = (parseFloat(document.getElementById("calc_laa_lp1")?.value) || 12).toFixed(1);
    grade = pointsToDecimalGrade(parseFloat(pts));
    word = pointsToWordRating(parseFloat(pts));
  }

  appState.pdfFormValues["Notenfestsetzung.Punkte"] = `${pts} Punkte`;
  appState.pdfFormValues["Notenfestsetzung.Worturteil"] = word;
  appState.pdfFormValues["Notenfestsetzung.NoteAlsZiffer"] = grade;
  saveState();

  showToast(`Noten (${pts} Pkt. / ${grade}) erfolgreich ins Formular F 230 übernommen!`, "⚡");
  switchTab("tab-gutachten");
}
