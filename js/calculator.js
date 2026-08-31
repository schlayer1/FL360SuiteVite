/**
 * THURINGIAN LEGAL DEADLINES & FINAL GRADE CALCULATOR (Fachleiter 360° Suite Pro)
 * Covers: Lehramtsanwärter (ThürAZStPLVO §31-§33), Nachqualifikation (ThürNQVO), Weiterbildung (ThürAZStPLVO §40)
 */

let activeCalcMode = "LAA"; // "LAA", "NQ", "WB"

const LEGAL_DOCS = {
  LAA: {
    title: "ThürAZStPLVO",
    fullTitle: "Thüringer Verordnung über die Ausbildung und Zweite Staatsprüfung für die Lehrämter (vom 26. April 2016)",
    section: "§ 31 (Noten und Punktesystem), § 32 (Mündliche Prüfung), § 33 (Gesamtergebnis)",
    url: "https://landesrecht.thueringen.de/bsth/document/jlr-LehrAusbPrVTH2016rahmen",
    infoText: "Die Zweite Staatsprüfung gilt als bestanden, wenn das Gesamtergebnis mindestens 5,00 Notenpunkte ('ausreichend') beträgt und keine der Prüfungsleistungen mit 0 Punkten bewertet wurde.",
    modalContentHTML: `
      <div style="font-size:0.88rem; color:#334155; line-height:1.6;">
        <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:8px; padding:14px; margin-bottom:16px;">
          <strong style="color:#1e3a8a; font-size:1rem;">⚖️ ThürAZStPLVO – Auszug Zweite Staatsprüfung</strong>
          <div style="font-size:0.8rem; color:#64748b; margin-top:2px;">Rechtsverbindliche Vorschriften für Lehramtsanwärterinnen und Lehramtsanwärter</div>
        </div>

        <h4 style="color:#0f172a; margin:14px 0 6px;">§ 31 Noten- und Punktesystem</h4>
        <p>Die einzelnen Prüfungsleistungen und das Gesamtergebnis werden mit folgenden Noten und Punkten bewertet:</p>
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:10px 14px; margin-bottom:12px;">
          <ul style="margin:0; padding-left:20px; font-size:0.84rem;">
            <li><strong>Sehr gut (15, 14, 13 Punkte / 1,0 – 1,3):</strong> Eine den Anforderungen in besonderem Maße entsprechende Leistung.</li>
            <li><strong>Gut (12, 11, 10 Punkte / 1,7 – 2,3):</strong> Eine den Anforderungen voll entsprechende Leistung.</li>
            <li><strong>Befriedigend (9, 8, 7 Punkte / 2,7 – 3,3):</strong> Eine den Anforderungen im Allgemeinen entsprechende Leistung.</li>
            <li><strong>Ausreichend (6, 5 Punkte / 3,7 – 4,0):</strong> Eine Leistung, die Mängel aufweist, aber den Anforderungen noch entspricht.</li>
            <li><strong>Mangelhaft (4, 3, 2, 1 Punkte / 4,3 – 5,5):</strong> Eine den Anforderungen nicht entsprechende Leistung.</li>
            <li><strong>Ungenügend (0 Punkte / 6,0):</strong> Eine völlig unbrauchbare Leistung.</li>
          </ul>
        </div>

        <h4 style="color:#0f172a; margin:14px 0 6px;">§ 33 Ermittlung des Gesamtergebnisses</h4>
        <p>Das Gesamtergebnis der Zweiten Staatsprüfung wird aus den Notenpunkten der Prüfungsteile wie folgt ermittelt:</p>
        <ol style="padding-left:20px; margin-bottom:14px;">
          <li><strong>Ausbildungsnote (40%):</strong> Gesamturteil der Ausbildungsschule und des Staatlichen Studienseminars (§ 18).</li>
          <li><strong>1. Prüfungslehrprobe (20%):</strong> Schulpraktischer Prüfungsunterricht im 1. Ausbildungsfach (§ 24).</li>
          <li><strong>2. Prüfungslehrprobe (20%):</strong> Schulpraktischer Prüfungsunterricht im 2. Ausbildungsfach (§ 24).</li>
          <li><strong>Mündliche Prüfung / Kolloquium (20%):</strong> Pädagogik, Schulrecht und Fachdidaktiken (§ 27).</li>
        </ol>

        <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:12px; font-size:0.84rem; color:#166534;">
          🎯 <strong>Bestehenskriterium (§ 33 Abs. 3):</strong> Die Zweite Staatsprüfung ist bestanden, wenn der Gesamtdurchschnitt mindestens <strong>5,00 Punkte</strong> beträgt und keine Prüfungsleistung mit <strong>0 Punkten</strong> bewertet wurde.
        </div>
      </div>
    `
  },
  NQ: {
    title: "ThürNQVO / ThürLbG",
    fullTitle: "Thüringer Verordnung über die Nachqualifizierung von Lehrkräften & Anpassungslehrgänge für den Seiteneinstieg",
    section: "§ 8 (Schulpraktische Nachqualifikation) & § 12 (Abschlusskolloquium & Gesamtnote)",
    url: "https://bildung.thueringen.de/lehrkraefte/lehrerausbildung",
    infoText: "Die Nachqualifikation umfasst die Bewertung der KMK-Pädagogik-Module (40%), die schulpraktische Beurteilung (20%), den Prüfungsunterricht (20%) und das Abschlusskolloquium (20%).",
    modalContentHTML: `
      <div style="font-size:0.88rem; color:#334155; line-height:1.6;">
        <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:8px; padding:14px; margin-bottom:16px;">
          <strong style="color:#1e3a8a; font-size:1rem;">⚖️ Nachqualifikation &amp; Seiteneinstieg in Thüringen</strong>
          <div style="font-size:0.8rem; color:#64748b; margin-top:2px;">Rechtsgrundlagen: ThürLbG, KMK-Standards &amp; Nachqualifizierungsrichtlinien</div>
        </div>

        <h4 style="color:#0f172a; margin:14px 0 6px;">Struktur der pädagogischen Nachqualifizierung</h4>
        <p>Lehrkräfte im Seiteneinstieg absolvieren eine modularisierte pädagogisch-didaktische Nachqualifizierung am Staatlichen Studienseminar sowie begleitenden Unterricht an ihrer Stammschule.</p>

        <h4 style="color:#0f172a; margin:14px 0 6px;">Zusammensetzung des Gesamtergebnisses</h4>
        <ol style="padding-left:20px; margin-bottom:14px;">
          <li><strong>Pädagogische Modulnachweise (40%):</strong> Nachweis über die erfolgreiche Teilnahme und Leistungsnachweise in den 5 KMK-Kompetenzbereichen am Studienseminar.</li>
          <li><strong>Schulpraktische Beurteilung (20%):</strong> Gutachten der Schulleitung über die Bewährung und Unterrichtstätigkeit an der Schule.</li>
          <li><strong>Prüfungslehrprobe / Unterrichtspraxis (20%):</strong> Fachdidaktischer Prüfungsunterricht unter Beobachtung der Prüfungskommission.</li>
          <li><strong>Abschlusskolloquium &amp; Reflexionsgespräch (20%):</strong> Fachdidaktisch-pädagogisches Prüfungsgespräch zum Abschluss der Nachqualifikation.</li>
        </ol>

        <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:12px; font-size:0.84rem; color:#166534;">
          🎯 <strong>Zertifikatserteilung:</strong> Nach erfolgreichem Gesamtergebnis (&ge; 5,00 Punkte bzw. Note 4,0) wird die unbefristete Gleichstellung bzw. die Lehrbefähigung ausgesprochen.
        </div>
      </div>
    `
  },
  WB: {
    title: "ThürAZStPLVO § 40 / WB-RL",
    fullTitle: "Thüringer Richtlinie über die Weiterbildung & Erweiterungsprüfungen für Lehrkräfte",
    section: "§ 40 (Erweiterungsprüfung und Zusatzzertifikate) & TMBJS-Weiterbildungsrichtlinie",
    url: "https://landesrecht.thueringen.de/bsth/document/jlr-LehrAusbPrVTH2016rahmen",
    infoText: "Zusatzqualifikationen und Erweiterungsfächer erfordern den erfolgreichen Nachweis der Fachdidaktik-Module (30%), die Weiterbildungs-Lehrprobe (40%) und das Fachkolloquium (30%).",
    modalContentHTML: `
      <div style="font-size:0.88rem; color:#334155; line-height:1.6;">
        <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:8px; padding:14px; margin-bottom:16px;">
          <strong style="color:#1e3a8a; font-size:1rem;">⚖️ § 40 ThürAZStPLVO – Erweiterungsprüfungen &amp; Weiterbildung</strong>
          <div style="font-size:0.8rem; color:#64748b; margin-top:2px;">Erwerb der Lehrbefähigung in einem weiteren Fach oder einer sonderpädagogischen Fachrichtung</div>
        </div>

        <h4 style="color:#0f172a; margin:14px 0 6px;">Prüfungsteile der Erweiterungsprüfung</h4>
        <p>Die Weiterbildungs- und Erweiterungsprüfung umfasst nach § 40 ThürAZStPLVO:</p>
        <ol style="padding-left:20px; margin-bottom:14px;">
          <li><strong>Fachdidaktische Seminar-Module (30%):</strong> Nachweis über die erfolgreiche Absolvierung der fachdidaktischen und fachwissenschaftlichen Weiterbildungskurse.</li>
          <li><strong>Weiterbildungs-Lehrprobe (40%):</strong> Schulpraktischer Prüfungsunterricht im neuen Erweiterungsfach vor der Prüfungskommission.</li>
          <li><strong>Fachwissenschaftliches / fachdidaktisches Kolloquium (30%):</strong> Mündliche Abschlussprüfung zu Theorie, Methodik und Lehrplan des Erweiterungsfachs.</li>
        </ol>

        <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:12px; font-size:0.84rem; color:#166534;">
          🎯 <strong>Lehrbefähigung:</strong> Mit Bestehen der Erweiterungsprüfung wird die offizielle Lehrbefähigung für das Erweiterungsfach zuerkannt.
        </div>
      </div>
    `
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

function openLegalDocModal(mode) {
  const m = mode || activeCalcMode || "LAA";
  const doc = LEGAL_DOCS[m] || LEGAL_DOCS.LAA;

  if (typeof openModal === "function") {
    openModal({
      title: `⚖️ ${doc.title} – Amtliche Bestimmungen`,
      bodyHTML: doc.modalContentHTML,
      footerHTML: `
        <div style="display:flex; justify-content:space-between; width:100%; align-items:center;">
          <a href="${doc.url}" target="_blank" rel="noopener noreferrer" class="btn btn-outline" style="font-size:0.8rem; padding:6px 14px;">
            🔗 Landesrecht Thüringen öffnen ↗
          </a>
          <button class="btn btn-primary" onclick="closeModal()">Schließen</button>
        </div>
      `
    });
  }
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
      <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px; flex-wrap:wrap;">
        <div style="flex:1; min-width:280px;">
          <div style="font-weight:700; font-size:0.88rem; color:#1e3a8a; display:flex; align-items:center; gap:6px;">
            <span>⚖️</span> <span>${doc.title}</span> &ndash; <span>${doc.section}</span>
          </div>
          <div style="font-size:0.78rem; color:#475569; margin-top:2px;">
            ${doc.fullTitle}
          </div>
          <div style="font-size:0.75rem; color:#64748b; margin-top:4px;">
            💡 ${doc.infoText}
          </div>
        </div>
        <div style="display:flex; gap:6px; flex-wrap:wrap;">
          <button class="btn btn-primary" style="font-size:0.76rem; padding:5px 12px;" onclick="openLegalDocModal('${activeCalcMode}')" title="Bestimmungen direkt offline einsehen">
            📖 Vorschriften im Detail
          </button>
          <a href="${doc.url}" target="_blank" rel="noopener noreferrer" class="btn btn-outline" style="font-size:0.76rem; padding:5px 12px; white-space:nowrap; background:#fff;" title="Offizielles Landesrechtsportal aufrufen">
            🔗 Landesrecht Thüringen ↗
          </a>
        </div>
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
