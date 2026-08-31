/**
 * FACHLEITER 360° SUITE PRO - REFLECTION COMPARISON & CONSULTATION ENGINE
 * Manages per-UB self vs. mentor reflection history, discrepancy analysis, 1-click goal creation & printable consultation sheets.
 */

let activeReflectionIdx = 0;

function initCandidateReflections() {
  const cur = getCurrentLAA();
  if (!cur) return;

  if (!cur.reflectionEntries || cur.reflectionEntries.length === 0) {
    const visits = cur.visits || [];
    const lastVisit = visits.length > 0 ? visits[visits.length - 1] : null;

    const defaultFLScores = (cur.scoresHistory && cur.scoresHistory.length > 0)
      ? cur.scoresHistory[cur.scoresHistory.length - 1]
      : [3.5, 3.5, 3.5, 3.5, 3.5, 3.5];

    const defaultSelfScores = cur.selfScores || [3.5, 3.5, 3.5, 3.5, 3.5, 3.5];

    cur.reflectionEntries = [
      {
        id: "ref_init",
        ubId: lastVisit ? lastVisit.id : "",
        title: lastVisit ? `Auswertungsgespräch UB ${visits.length}: ${lastVisit.topic || 'Unterrichtsbesuch'}` : "Aktuelles Auswertungsgespräch",
        date: lastVisit ? lastVisit.date : new Date().toISOString().split('T')[0],
        flScores: [...defaultFLScores],
        selfScores: [...defaultSelfScores],
        notes: ""
      }
    ];
    saveState();
  }
}

function renderReflectionTab() {
  initCandidateReflections();
  const cur = getCurrentLAA();
  if (!cur) {
    const wrap = document.getElementById("reflectionInputsWrap");
    if (wrap) wrap.innerHTML = '<div style="text-align:center; padding:20px; color:#94a3b8;">Bitte wählen oder erstellen Sie zuerst ein Kandidatenprofil.</div>';
    return;
  }

  const entries = cur.reflectionEntries || [];
  if (activeReflectionIdx >= entries.length) {
    activeReflectionIdx = Math.max(0, entries.length - 1);
  }

  renderReflectionHeaderUI();
  renderReflectionRadar();
  renderReflectionInputs();
}

function renderReflectionHeaderUI() {
  const container = document.getElementById("reflectionHeaderControls");
  if (!container) return;

  const cur = getCurrentLAA();
  if (!cur) return;

  const entries = cur.reflectionEntries || [];
  const optionsHtml = entries.map((e, idx) => `
    <option value="${idx}" ${idx === activeReflectionIdx ? 'selected' : ''}>
      ${e.title} (${new Date(e.date).toLocaleDateString('de-DE')})
    </option>
  `).join('');

  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; width:100%;">
      <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
        <label style="font-size:0.82rem; font-weight:700; color:#334155;">Auswertungsgespräch:</label>
        <select class="form-control" style="font-size:0.82rem; padding:4px 8px; width:auto; font-weight:600;" onchange="selectReflectionEntry(this.value)">
          ${optionsHtml}
        </select>
        <button class="btn btn-outline" style="font-size:0.76rem; padding:4px 10px;" onclick="openNewReflectionEntryModal()" title="Neuen Reflexionsabgleich für einen UB anlegen">
          ➕ Neues Gespräch
        </button>
      </div>

      <div style="display:flex; gap:8px;">
        <button class="btn btn-outline" style="font-size:0.78rem; padding:5px 12px; background:#fff;" onclick="printReflectionSheet()" title="Druckfertigen Beratungs- & Reflexionsbogen erstellen">
          🖨️ Reflexionsbogen drucken
        </button>
        <button class="btn btn-accent" style="font-size:0.78rem; padding:5px 14px;" onclick="saveCurrentReflection()">
          💾 Abgleich speichern
        </button>
      </div>
    </div>
  `;
}

function selectReflectionEntry(idx) {
  activeReflectionIdx = parseInt(idx, 10) || 0;
  renderReflectionRadar();
  renderReflectionInputs();
}

function renderReflectionRadar() {
  const canvas = document.getElementById("radarCanvasReflection");
  if (!canvas || typeof Chart === 'undefined') return;

  const cur = getCurrentLAA();
  if (!cur || !cur.reflectionEntries) return;

  const entry = cur.reflectionEntries[activeReflectionIdx];
  if (!entry) return;

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

  const flScores = entry.flScores || [3.5, 3.5, 3.5, 3.5, 3.5, 3.5];
  const selfScores = entry.selfScores || [3.5, 3.5, 3.5, 3.5, 3.5, 3.5];

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
            pointBackgroundColor: "#1d4ed8",
            pointRadius: 4
          },
          {
            label: `Selbsteinschätzung (${cur.name})`,
            data: selfScores,
            backgroundColor: "rgba(13, 148, 136, 0.25)",
            borderColor: "#0d9488",
            borderWidth: 2,
            pointBackgroundColor: "#0f766e",
            pointRadius: 4
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
          legend: { position: 'top', labels: { font: { size: 11, weight: '600' } } }
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
  if (!cur || !cur.reflectionEntries) return;

  const entry = cur.reflectionEntries[activeReflectionIdx];
  if (!entry) return;

  const dims = typeof CRITERIA_DIMS !== 'undefined' ? CRITERIA_DIMS : [
    "Fachdidaktik & Struktur",
    "Klassenführung & Präsenz",
    "Unterrichtsplanung & Ziele",
    "Heterogenität & Differenzierung",
    "Diagnostik & Feedback",
    "Reflexion & Haltung"
  ];

  const suggestedGoalTexts = [
    "Strukturierung der Phasenübergänge und didaktische Reduktion im Fachunterricht schärfen.",
    "Klassenführung durch klare Rituale, präzise nonverbale Signale und Blickkontakt festigen.",
    "Stundenziele transparent formulieren und methodisch passgenau auf den Kern ausrichten.",
    "Differenzierte Aufgabenformate und gestufte Lernhilfen für heterogene Lernstände bereitstellen.",
    "Formative Diagnosemethoden und kriterienorientiertes Schülerfeedback gezielt einsetzen.",
    "Fachdidaktische Reflexionsfähigkeit stärken und eigene Alternativen im Auswertungsgespräch benennen."
  ];

  const flScores = entry.flScores || [3.5, 3.5, 3.5, 3.5, 3.5, 3.5];
  const selfScores = entry.selfScores || [3.5, 3.5, 3.5, 3.5, 3.5, 3.5];

  container.innerHTML = dims.map((dim, idx) => {
    const fl = flScores[idx] || 3.0;
    const self = selfScores[idx] || 3.0;
    const diff = (self - fl).toFixed(1);
    const diffNum = parseFloat(diff);

    let diffBadge = `<span class="badge-pill" style="background:#f1f5f9; color:#475569;">Deckungsgleich</span>`;
    if (diffNum > 0.5) diffBadge = `<span class="badge-pill" style="background:#fef3c7; color:#92400e; font-weight:700;">Überschätzung (+${diff})</span>`;
    if (diffNum < -0.5) diffBadge = `<span class="badge-pill" style="background:#dbeafe; color:#1e40af; font-weight:700;">Unterschätzung (${diff})</span>`;

    const goalSuggestion = suggestedGoalTexts[idx] || `Entwicklungsaufgabe im Bereich ${dim} gezielt im nächsten UB verfolgen.`;

    return `
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:12px 16px; display:flex; flex-direction:column; gap:8px;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
          <strong style="font-size:0.9rem; color:#0f172a;">${dim}</strong>
          <div style="display:flex; align-items:center; gap:8px;">
            ${diffBadge}
            <button 
              class="btn btn-outline" 
              style="font-size:0.72rem; padding:3px 8px; background:#ffffff; color:#1e3a8a; border-color:#93c5fd;" 
              onclick="createGoalFromDiscrepancy('${dim}', '${goalSuggestion.replace(/'/g, "\\'")}')"
              title="Dieses Handlungsfeld als Zielvereinbarung ins Dashboard übernehmen"
            >
              🎯 Als Ziel vereinbaren
            </button>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; align-items:center;">
          <div style="display:flex; align-items:center; gap:6px;">
            <label style="font-size:0.78rem; font-weight:700; color:#2563eb;">FL-Wertung:</label>
            <input 
              type="number" 
              min="1" max="5" step="0.1" 
              class="calc-input" 
              style="width:65px; padding:3px 6px; font-weight:700; color:#1d4ed8;" 
              value="${fl}" 
              onchange="updateFLScoreLive(${idx}, this.value)"
            />
            <span style="font-size:0.75rem; color:#64748b;">/ 5.0</span>
          </div>

          <div style="display:flex; align-items:center; gap:6px;">
            <label style="font-size:0.78rem; font-weight:700; color:#0d9488;">LAA-Selbstwert:</label>
            <input 
              type="number" 
              min="1" max="5" step="0.1" 
              class="calc-input" 
              style="width:65px; padding:3px 6px; font-weight:700; color:#0f766e;" 
              value="${self}" 
              onchange="updateSelfScoreLive(${idx}, this.value)"
            />
            <span style="font-size:0.75rem; color:#64748b;">/ 5.0</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Append Synchronized Colloquium / Reflection Questions from Entwurfsbegutachtung
  const questions = cur.colloquiumQuestions || [];
  container.innerHTML += `
    <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:10px; padding:14px 16px; margin-top:6px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <strong style="font-size:0.88rem; color:#1e40af;">❓ Vorbereitete Prüferfragen aus der Entwurfs-Begutachtung</strong>
        <button class="btn btn-outline" style="font-size:0.72rem; padding:2px 8px; background:#fff;" onclick="switchTab('tab-niederschrift'); switchTab3Mode('entwurf');">
          📑 Zur Entwurfsmaske
        </button>
      </div>
      <div style="font-size:0.74rem; color:#3b82f6; margin-bottom:10px;">
        💡 Diese Fragen wurden bei der Sichtung des schriftlichen Unterrichtsentwurfs erfasst und dienen als Leitfaden für das Auswertungsgespräch:
      </div>
      <div style="display:flex; flex-direction:column; gap:6px;">
        ${questions.map(q => `
          <div style="background:#ffffff; border:1px solid #dbeafe; border-radius:6px; padding:6px 10px; font-size:0.8rem; color:#1e293b;">
            • <strong>Frage:</strong> ${q}
          </div>
        `).join('') || '<div style="font-size:0.78rem; color:#94a3b8; font-style:italic;">Keine Vorbereitungsfragen in der Entwurfsbegutachtung erfasst.</div>'}
      </div>
    </div>
  `;
}

function updateSelfScoreLive(dimIdx, val) {
  const cur = getCurrentLAA();
  if (!cur || !cur.reflectionEntries || !cur.reflectionEntries[activeReflectionIdx]) return;
  cur.reflectionEntries[activeReflectionIdx].selfScores[dimIdx] = parseFloat(val) || 3.0;
  // Keep legacy mirror updated
  cur.selfScores = [...cur.reflectionEntries[activeReflectionIdx].selfScores];
  saveState();
  renderReflectionRadar();
}

function updateFLScoreLive(dimIdx, val) {
  const cur = getCurrentLAA();
  if (!cur || !cur.reflectionEntries || !cur.reflectionEntries[activeReflectionIdx]) return;
  cur.reflectionEntries[activeReflectionIdx].flScores[dimIdx] = parseFloat(val) || 3.0;
  saveState();
  renderReflectionRadar();
}

function saveCurrentReflection() {
  saveState();
  showToast("Reflexionsabgleich für dieses Gespräch gespeichert!", "💾");
}

/**
 * 1-CLICK GOAL CREATION FROM DISCREPANCY
 */
function createGoalFromDiscrepancy(dimTitle, suggestedText) {
  const cur = getCurrentLAA();
  if (!cur) return;

  const entry = (cur.reflectionEntries && cur.reflectionEntries[activeReflectionIdx]) ? cur.reflectionEntries[activeReflectionIdx] : null;
  const source = entry ? `Reflexionsabgleich: ${entry.title}` : `Reflexionsabgleich: ${dimTitle}`;

  if (typeof openAddGoalModal === "function") {
    openAddGoalModal(suggestedText, source);
  }
}

/**
 * NEW REFLECTION SESSION MODAL
 */
function openNewReflectionEntryModal() {
  const cur = getCurrentLAA();
  if (!cur) return;

  const visits = cur.visits || [];
  const visitsOptions = visits.map((v, i) => `
    <option value="${v.id}">UB ${i + 1} (${new Date(v.date).toLocaleDateString('de-DE')} • ${v.topic || 'Unterrichtsstunde'})</option>
  `).join('');

  const bodyHTML = `
    <div class="form-group">
      <label>Bezeichnung des Auswertungsgesprächs</label>
      <input id="newRef_title" class="form-control" value="Nachbesprechung UB ${visits.length + 1}" placeholder="z. B. Nachbesprechung UB 3" />
    </div>
    <div class="form-row-2col">
      <div class="form-group">
        <label>Zugeordneter Unterrichtsbesuch (Optional)</label>
        <select id="newRef_ubId" class="form-control">
          <option value="">-- Kein spezifischer UB (Allgemeines Beratungsgespräch) --</option>
          ${visitsOptions}
        </select>
      </div>
      <div class="form-group">
        <label>Datum des Gesprächs</label>
        <input id="newRef_date" type="date" class="form-control" value="${new Date().toISOString().split('T')[0]}" />
      </div>
    </div>
  `;

  const footerHTML = `
    <button class="btn btn-outline" onclick="closeModal()">Abbrechen</button>
    <button class="btn btn-primary" onclick="saveNewReflectionEntry()">➕ Abgleich anlegen</button>
  `;

  openModal({
    title: "🪞 Neues Auswertungsgespräch dokumentieren",
    bodyHTML,
    footerHTML
  });
}

function saveNewReflectionEntry() {
  const cur = getCurrentLAA();
  if (!cur) return;
  if (!cur.reflectionEntries) cur.reflectionEntries = [];

  const title = document.getElementById("newRef_title")?.value.trim() || `Auswertungsgespräch #${cur.reflectionEntries.length + 1}`;
  const ubId = document.getElementById("newRef_ubId")?.value || "";
  const date = document.getElementById("newRef_date")?.value || new Date().toISOString().split('T')[0];

  // Try to inherit FL scores from linked visit if exists
  let flScores = [3.5, 3.5, 3.5, 3.5, 3.5, 3.5];
  if (ubId && cur.visits) {
    const v = cur.visits.find(item => item.id === ubId);
    if (v && v.scores && v.scores.length === 6) {
      flScores = [...v.scores];
    }
  }

  cur.reflectionEntries.push({
    id: "ref_" + Date.now(),
    ubId,
    title,
    date,
    flScores,
    selfScores: [3.5, 3.5, 3.5, 3.5, 3.5, 3.5],
    notes: ""
  });

  activeReflectionIdx = cur.reflectionEntries.length - 1;
  saveState();
  closeModal();
  renderReflectionTab();
  showToast("Neues Auswertungsgespräch angelegt!", "🪞");
}

/**
 * PRINTABLE REFLECTION CONSULTATION SHEET
 */
function printReflectionSheet() {
  const cur = getCurrentLAA();
  if (!cur || !cur.reflectionEntries) return;

  const entry = cur.reflectionEntries[activeReflectionIdx] || {};
  const dims = typeof CRITERIA_DIMS !== 'undefined' ? CRITERIA_DIMS : [
    "Fachdidaktik & Struktur",
    "Klassenführung & Präsenz",
    "Unterrichtsplanung & Ziele",
    "Heterogenität & Differenzierung",
    "Diagnostik & Feedback",
    "Reflexion & Haltung"
  ];

  const flScores = entry.flScores || [3.5, 3.5, 3.5, 3.5, 3.5, 3.5];
  const selfScores = entry.selfScores || [3.5, 3.5, 3.5, 3.5, 3.5, 3.5];

  let rowsHtml = dims.map((dim, idx) => {
    const fl = flScores[idx] || 3.0;
    const self = selfScores[idx] || 3.0;
    const diff = (self - fl).toFixed(1);
    return `
      <tr>
        <td style="padding:8px 10px; border-bottom:1px solid #e2e8f0; font-weight:600;">${dim}</td>
        <td style="padding:8px 10px; border-bottom:1px solid #e2e8f0; text-align:center; color:#2563eb; font-weight:700;">${fl.toFixed(1)}</td>
        <td style="padding:8px 10px; border-bottom:1px solid #e2e8f0; text-align:center; color:#0d9488; font-weight:700;">${self.toFixed(1)}</td>
        <td style="padding:8px 10px; border-bottom:1px solid #e2e8f0; text-align:center; font-weight:700;">${diff > 0 ? '+' + diff : diff}</td>
      </tr>
    `;
  }).join('');

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    showToast("Pop-up blockiert! Bitte Druckfunktion im Browser erlauben.", "⚠️");
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="de">
    <head>
      <meta charset="UTF-8">
      <title>Reflexions- und Beratungsbogen – ${cur.name}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; color: #0f172a; padding: 30px; margin: 0; line-height: 1.5; font-size: 11pt; }
        .header { border-bottom: 2px solid #1e3a8a; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
        .title { font-size: 16pt; font-weight: bold; color: #1e3a8a; }
        .grid-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 20px; font-size: 10pt; background: #f8fafc; padding: 12px; border: 1px solid #e2e8f0; border-radius: 6px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 10.5pt; }
        th { background: #f1f5f9; padding: 8px 10px; text-align: left; border-bottom: 2px solid #cbd5e1; font-weight: 700; font-size: 10pt; }
        .section-box { border: 1px solid #cbd5e1; border-radius: 6px; padding: 14px; margin-bottom: 20px; min-height: 80px; }
        .section-title { font-weight: 700; font-size: 11pt; margin-bottom: 8px; color: #1e293b; }
        .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 40px; }
        .sign-line { border-top: 1px solid #64748b; padding-top: 6px; text-align: center; font-size: 9pt; color: #475569; }
        @media print { body { padding: 15mm; } button { display: none; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="title">🪞 Reflexions- &amp; Beratungsbogen</div>
          <div style="color:#64748b; font-size:10pt; margin-top:2px;">Studienseminar für Lehrämter • Thüringen</div>
        </div>
        <div style="font-size:10pt; color:#64748b;">Datum: ${new Date(entry.date).toLocaleDateString('de-DE')}</div>
      </div>

      <div class="grid-meta">
        <div><strong>Lehrkraft / Prüfling:</strong> ${cur.name} (${cur.type || 'LAA'})</div>
        <div><strong>Fach / Fachrichtung:</strong> ${cur.subject1 || '-'}${cur.subject2 ? ' / ' + cur.subject2 : ''}</div>
        <div><strong>Ausbildungsschule:</strong> ${cur.school || '-'}</div>
        <div><strong>Anlass / Gespräch:</strong> ${entry.title}</div>
      </div>

      <h3 style="font-size:12pt; margin-bottom:8px;">1. Abgleich der Kompetenzdimensionen (Skala 1.0 – 5.0)</h3>
      <table>
        <thead>
          <tr>
            <th>Kompetenzbereich</th>
            <th style="text-align:center; width:130px;">Fremdeinschätzung (FL)</th>
            <th style="text-align:center; width:130px;">Selbstwert (LAA)</th>
            <th style="text-align:center; width:100px;">Differenz</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <div class="section-box">
        <div class="section-title">2. Vereinbarte Entwicklungsziele &amp; Schwerpunkte für den nächsten Unterrichtsbesuch</div>
        <div style="font-size:10pt; color:#475569; min-height:50px;">
          ${(cur.goals || []).map((g, i) => `<div>• <strong>Ziel ${i+1}:</strong> ${g.text}</div>`).join('') || '<em>Im Gespräch vereinbarte Schwerpunkte hier handschriftlich ergänzen...</em>'}
        </div>
      </div>

      <div class="section-box" style="background:#f8fafc;">
        <div class="section-title">3. Vorbereitete Prüferfragen &amp; Reflexionsimpulse aus der Entwurfsbegutachtung</div>
        <div style="font-size:9.5pt; color:#334155; min-height:40px;">
          ${(cur.colloquiumQuestions || []).map(q => `<div>• ${q}</div>`).join('') || '<em>Keine gesonderten Vorbereitungsfragen erfasst.</em>'}
        </div>
      </div>

      <div class="signatures">
        <div>
          <div style="height:40px;"></div>
          <div class="sign-line">Unterschrift Lehrkraft / Lehramtsanwärter(in)</div>
        </div>
        <div>
          <div style="height:40px;"></div>
          <div class="sign-line">Unterschrift Fachleiter(in)</div>
        </div>
      </div>

      <script>
        window.onload = function() { window.print(); };
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}
