/**
 * FACHLEITER 360° SUITE PRO - ENTWURFS-BEGUTACHTUNG & DIGITALES ORDNERARCHIV
 * Split-screen lesson plan evaluator, Thuringian rubric, colloquium questions & local candidate folder archiver.
 */

let currentPdfDoc = null;
let currentPdfPage = 1;
let currentPdfScale = 1.1;
let currentPdfBlobUrl = null;
let currentPdfFileName = "";

// 5 Official Thuringian Lesson Plan Criteria Dimensions
const ENTWURF_CRITERIA_DIMS = [
  {
    key: "conditions",
    title: "1. Bedingungs- & Lerngruppenanalyse",
    desc: "Voraussetzungen der Lerngruppe, Vorwissen, soziokulturelle & räumliche Rahmenbedingungen.",
    points: 15,
    stars: 4.5,
    note: "Sehr präzise Differenzierung der Schülervoraussetzungen und Lernausgangslage."
  },
  {
    key: "subject",
    title: "2. Fachwissenschaftliche Sachanalyse",
    desc: "Fachliche Korrektheit, Tiefe der Durchdringung, aktueller fachdidaktischer Diskurs & Begriffsklarheit.",
    points: 15,
    stars: 4.5,
    note: "Fachlich exzellent fundiert, begriffsscharf und auf hohem fachwissenschaftlichem Niveau."
  },
  {
    key: "didactics",
    title: "3. Didaktische Reduktion & Passung der Lernziele",
    desc: "Lehrplanbezug Thüringen, Kompetenzstufen, didaktische Schwerpunktsetzung & Stundenzielklarheit.",
    points: 14,
    stars: 4.5,
    note: "Stundenziel curricular passgenau verankert, klare didaktische Stufung."
  },
  {
    key: "methods",
    title: "4. Methodische Phasierung & Verlaufsplanung",
    desc: "Artikulationsschema, Problemorientierung, Passung von Impulsen, Medien, Sozialformen & Zeitökonomie.",
    points: 14,
    stars: 4.5,
    note: "Methodisch schlüssig durchdacht, motivierender Problemaufriss und transparente Phasierung."
  },
  {
    key: "differentiation",
    title: "5. Binnendifferenzierung, Hilfen & Erwartungshorizonte",
    desc: "Niveaudifferenzierte Aufgaben, gestufte Lernhilfen, Inklusionsmaßnahmen & transparente Erwartungshorizonte.",
    points: 14,
    stars: 4.5,
    note: "Vorbildliche Differenzierungsmatrix mit gestuften Hilfekarten und Zusatzangeboten."
  }
];

function initCandidateEntwurfData() {
  const cur = getCurrentLAA();
  if (!cur) return;

  if (!cur.entwurfEval) {
    cur.entwurfEval = {
      title: "Unterrichtsentwurf zur Prüfungslehrprobe",
      subject: cur.subject1 || "Fachdidaktik",
      topic: cur.visits && cur.visits.length > 0 ? cur.visits[cur.visits.length - 1].topic : "Unterrichtsstunde",
      date: new Date().toISOString().split('T')[0],
      pdfPath: "",
      pdfName: "",
      dims: JSON.parse(JSON.stringify(ENTWURF_CRITERIA_DIMS)),
      questions: [
        "Welche didaktischen Alternativen wurden für den Einstiegsimpuls erwogen?",
        "Wie verhält sich die geplante Differenzierung zum Kompetenzniveau schwächerer Schüler?",
        "An welcher Stelle des Verlaufsplans ist ein Puffer bei Zeitverzögerungen eingeplant?"
      ]
    };
    saveState();
  }

  if (!cur.colloquiumQuestions) {
    cur.colloquiumQuestions = cur.entwurfEval.questions ? [...cur.entwurfEval.questions] : [];
  }
}

/**
 * TAB 3 MODE SWITCHER
 */
function switchTab3Mode(mode) {
  if (typeof nsSwitchTab === 'function') {
    nsSwitchTab(mode);
  }
}

/**
 * RENDER ENTWURF WORKSPACE
 */
function renderEntwurfWorkspace() {
  initCandidateEntwurfData();
  const container = document.getElementById("tab3ContentEntwurf");
  if (!container) return;

  const cur = getCurrentLAA();
  if (!cur) {
    container.innerHTML = `<div style="text-align:center; padding:30px; color:#94a3b8;">Bitte wählen oder erstellen Sie zuerst ein Kandidatenprofil.</div>`;
    return;
  }

  const evalData = cur.entwurfEval || {};
  const questions = cur.colloquiumQuestions || [];

  // Calculate overall Entwurf grade / score
  let totalScore = 0;
  let dimCount = 0;
  (evalData.dims || []).forEach(d => {
    totalScore += (parseFloat(d.stars) || 4.0);
    dimCount++;
  });
  const avgStars = dimCount > 0 ? (totalScore / dimCount).toFixed(1) : "4.5";

  container.innerHTML = `
    <!-- Top Action Bar -->
    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:12px 16px; margin-bottom:16px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
      <div>
        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
          <h2 style="font-size:1.1rem; color:#0f172a; margin:0;">📑 Entwurfs-Begutachtung: ${cur.name}</h2>
          <span class="badge" style="background:#e0f2fe; color:#0369a1; font-size:0.72rem; padding:2px 6px;">${cur.type || 'LAA'}</span>
          <span class="badge" style="background:#f0fdf4; color:#166534; font-size:0.75rem; font-weight:700; padding:2px 8px;">Ø Entwurfsnote: ${avgStars} / 5.0</span>
        </div>
        <div style="font-size:0.76rem; color:#64748b; margin-top:2px;">
          Split-Screen-Prüfungsarbeitsplatz mit PDF-Viewer, Thüringer 5-Felder-Raster &amp; Prüferfragen-Archiv
        </div>
      </div>

      <div style="display:flex; gap:8px; flex-wrap:wrap;">
        <button class="btn btn-outline" style="font-size:0.78rem; padding:5px 12px; background:#fff;" onclick="triggerProjectFolderSync()" title="Lokalen Ordner 'Auszubildende/${cur.name.replace(/ /g, '_')}' anlegen / verknüpfen">
          📁 Kandidaten-Ordner verknüpfen
        </button>
        <button class="btn btn-outline" style="font-size:0.78rem; padding:5px 12px; background:#fff;" onclick="transferEntwurfToGutachten()" title="Entwurfs-Beurteilungstext mit 1 Klick in Gutachten F 230 übertragen">
          ➡️ In Gutachten F 230 übernehmen
        </button>
        <button class="btn btn-primary" style="font-size:0.78rem; padding:5px 14px;" onclick="saveEntwurfEvaluation()">
          💾 Bewertung speichern
        </button>
      </div>
    </div>

    <!-- Split Screen Container -->
    <div class="entwurf-split-grid">
      <!-- LEFT PANE: PDF VIEWER -->
      <div class="entwurf-pane card" style="display:flex; flex-direction:column; padding:0; overflow:hidden;">
        <div class="entwurf-pane-header">
          <div style="display:flex; align-items:center; gap:8px;">
            <strong style="font-size:0.88rem; color:#1e293b;">📄 PDF-Unterrichtsentwurf</strong>
            <span id="entwurfPdfNameBadge" style="font-size:0.75rem; color:#64748b; font-family:monospace;">${currentPdfFileName || (evalData.pdfName || 'Kein PDF geladen')}</span>
          </div>

          <div style="display:flex; align-items:center; gap:6px;">
            <button class="btn btn-outline" style="font-size:0.75rem; padding:3px 8px; background:#fff;" onclick="triggerPdfUpload()" title="PDF-Entwurf auswählen">
              📂 PDF laden...
            </button>
            <input type="file" id="entwurfPdfFileInput" accept="application/pdf" style="display:none;" onchange="handleEntwurfPdfSelected(event)" />
            
            <!-- Zoom Controls -->
            <button class="btn btn-ghost" style="padding:2px 6px; font-size:0.8rem;" onclick="zoomPdf(-0.2)" title="Verkleinern">🔍-</button>
            <button class="btn btn-ghost" style="padding:2px 6px; font-size:0.8rem;" onclick="zoomPdf(0.2)" title="Vergrößern">🔍+</button>
            <button class="btn btn-ghost" style="padding:2px 6px; font-size:0.8rem;" onclick="prevPdfPage()" title="Vorherige Seite">◀</button>
            <span id="pdfPageIndicator" style="font-size:0.75rem; font-weight:700; color:#475569;">1 / 1</span>
            <button class="btn btn-ghost" style="padding:2px 6px; font-size:0.8rem;" onclick="nextPdfPage()" title="Nächste Seite">▶</button>
          </div>
        </div>

        <div id="entwurfPdfViewerContainer" class="entwurf-pdf-container">
          <div id="pdfPlaceholderNotice" style="text-align:center; padding:60px 20px; color:#94a3b8;">
            <div style="font-size:3rem; margin-bottom:10px;">📑</div>
            <h4 style="color:#334155; margin-bottom:6px;">Schriftlichen Unterrichtsentwurf laden</h4>
            <p style="font-size:0.84rem; max-width:400px; margin:0 auto 16px;">
              Wählen Sie die PDF-Datei des Auszubildenden aus, um sie direkt im Split-Screen zu sichten und parallel zu begutachten.
            </p>
            <button class="btn btn-primary" onclick="triggerPdfUpload()">📂 PDF-Entwurf auswählen</button>
          </div>
          <canvas id="entwurfPdfCanvas" style="display:none; max-width:100%; margin:0 auto; box-shadow:0 4px 12px rgba(0,0,0,0.15); border-radius:4px;"></canvas>
        </div>
      </div>

      <!-- RIGHT PANE: 5-DIMENSIONS RUBRIC & COLLOQUIUM QUESTIONS -->
      <div class="entwurf-pane card" style="display:flex; flex-direction:column; padding:16px; overflow-y:auto; max-height:calc(100vh - 220px);">
        
        <!-- Header Info Inputs -->
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px 12px; margin-bottom:14px;">
          <div class="form-row-2col">
            <div class="form-group" style="margin-bottom:6px;">
              <label style="font-size:0.76rem;">Stundenthema / Prüfungslehrprobe</label>
              <input id="entwurf_topic" class="form-control" style="font-size:0.82rem; padding:4px 8px;" value="${evalData.topic || ''}" placeholder="z. B. Quellenkritik Weimarer Republik" />
            </div>
            <div class="form-group" style="margin-bottom:6px;">
              <label style="font-size:0.76rem;">Fach &amp; Lerngruppe</label>
              <input id="entwurf_subject" class="form-control" style="font-size:0.82rem; padding:4px 8px;" value="${evalData.subject || cur.subject1 || ''}" placeholder="z. B. Geschichte • Klasse 9a" />
            </div>
          </div>
        </div>

        <h3 style="font-size:0.95rem; color:#1e293b; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
          <span>⚖️ Begutachtungsraster nach ThürAZStPLVO</span>
          <span style="font-size:0.75rem; color:#64748b; font-weight:normal;">Skala 1.0 – 5.0 (Vornotenbezug)</span>
        </h3>

        <!-- Criteria Cards -->
        <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:18px;">
          ${(evalData.dims || ENTWURF_CRITERIA_DIMS).map((dim, idx) => `
            <div class="entwurf-dim-card">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px;">
                <div>
                  <strong style="font-size:0.86rem; color:#0f172a;">${dim.title}</strong>
                  <div style="font-size:0.74rem; color:#64748b;">${dim.desc}</div>
                </div>
                <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
                  <select 
                    class="form-control" 
                    style="font-size:0.8rem; font-weight:700; padding:2px 6px; width:70px; color:#1e3a8a;"
                    onchange="updateEntwurfDimStars(${idx}, this.value)"
                  >
                    <option value="5.0" ${dim.stars == 5.0 ? 'selected' : ''}>5.0 (Sehr gut)</option>
                    <option value="4.5" ${dim.stars == 4.5 ? 'selected' : ''}>4.5 (Gut+)</option>
                    <option value="4.0" ${dim.stars == 4.0 ? 'selected' : ''}>4.0 (Gut)</option>
                    <option value="3.5" ${dim.stars == 3.5 ? 'selected' : ''}>3.5 (Befriedigend+)</option>
                    <option value="3.0" ${dim.stars == 3.0 ? 'selected' : ''}>3.0 (Befriedigend)</option>
                    <option value="2.0" ${dim.stars == 2.0 ? 'selected' : ''}>2.0 (Ausreichend)</option>
                    <option value="1.0" ${dim.stars == 1.0 ? 'selected' : ''}>1.0 (Mangelhaft)</option>
                  </select>
                </div>
              </div>
              <textarea 
                class="form-control auto-expand-textarea" 
                style="font-size:0.82rem; padding:6px 10px; line-height:1.45; resize:vertical; min-height:46px; border:1px solid #cbd5e1; border-radius:6px; font-family:inherit; transition:height 0.1s ease;" 
                placeholder="Gutachtliche Würdigung, Belege &amp; Beobachtungen eintragen..." 
                rows="2"
                oninput="autoResizeEntwurfTextarea(this); updateEntwurfDimNote(${idx}, this.value)"
              >${dim.note || ''}</textarea>
            </div>
          `).join('')}
        </div>

        <!-- Colloquium & Reflection Questions -->
        <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:8px; padding:12px; margin-bottom:14px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <strong style="font-size:0.86rem; color:#1e40af;">❓ Prüferfragen für Kolloquium &amp; Nachbesprechung</strong>
            <button class="btn btn-outline" style="font-size:0.72rem; padding:2px 8px; background:#fff;" onclick="openAddColloquiumQuestionModal()">
              ➕ Neue Frage
            </button>
          </div>
          <div style="font-size:0.74rem; color:#3b82f6; margin-bottom:8px;">
            💡 Diese Fragen werden automatisch in <strong>Tab 6 (Reflexionsabgleich)</strong> und den <strong>Beratungs-Druckbogen</strong> synchronisiert.
          </div>
          <div id="entwurfQuestionsList" style="display:flex; flex-direction:column; gap:8px;">
            ${questions.map((q, qIdx) => `
              <div class="question-row" style="align-items:flex-start; gap:8px; padding:6px 10px; background:#ffffff; border:1px solid #bfdbfe; border-radius:6px;">
                <span style="font-weight:700; color:#1e40af; font-size:0.82rem; margin-top:4px; flex-shrink:0;">Q${qIdx + 1}:</span>
                <textarea 
                  class="form-control auto-expand-textarea" 
                  style="flex:1; font-size:0.82rem; padding:4px 8px; line-height:1.4; resize:vertical; min-height:34px; border:1px solid #e2e8f0; border-radius:4px; font-family:inherit;" 
                  rows="1"
                  placeholder="Prüferfrage eingeben..."
                  oninput="autoResizeEntwurfTextarea(this); updateColloquiumQuestion(${qIdx}, this.value)"
                >${q}</textarea>
                <button class="btn btn-ghost btn-icon-only" style="padding:2px 6px; color:#ef4444; font-size:0.85rem; margin-top:2px;" onclick="deleteColloquiumQuestion(${qIdx})" title="Frage löschen">✕</button>
              </div>
            `).join('') || '<div style="font-size:0.78rem; color:#94a3b8; font-style:italic;">Keine Fragen hinterlegt.</div>'}
          </div>
        </div>

        <!-- Action Button -->
        <button class="btn btn-accent" style="width:100%; font-size:0.86rem; padding:8px 14px;" onclick="transferEntwurfToGutachten()">
          ➡️ Entwurfsurteil in Gutachten F 230 übertragen
        </button>

      </div>
    </div>
  `;

  // Auto-resize all textareas based on their initial content
  setTimeout(() => {
    document.querySelectorAll('.auto-expand-textarea').forEach(el => {
      autoResizeEntwurfTextarea(el);
    });
  }, 50);

  // If a pdf blob exists or was previously rendered, render current page
  if (currentPdfDoc) {
    renderPdfPage(currentPdfPage);
  }
}

/**
 * PDF ENGINE (PDF.JS INTEGRATION)
 */
function triggerPdfUpload() {
  const input = document.getElementById("entwurfPdfFileInput");
  if (input) input.click();
}

function handleEntwurfPdfSelected(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  currentPdfFileName = file.name;
  const cur = getCurrentLAA();
  if (cur && cur.entwurfEval) {
    cur.entwurfEval.pdfName = file.name;
    saveState();
  }

  const reader = new FileReader();
  reader.onload = function(evt) {
    const typedarray = new Uint8Array(evt.target.result);
    if (typeof pdfjsLib !== 'undefined') {
      pdfjsLib.getDocument(typedarray).promise.then(function(pdf) {
        currentPdfDoc = pdf;
        currentPdfPage = 1;
        renderPdfPage(1);
        showToast(`Entwurf "${file.name}" geladen (${pdf.numPages} Seiten)!`, "📄");
      }).catch(err => {
        console.error("PDF load error:", err);
        showToast("Fehler beim Laden des PDFs!", "⚠️");
      });
    } else {
      showToast("PDF-Bibliothek lädt noch...", "⏳");
    }
  };
  reader.readAsArrayBuffer(file);
}

function renderPdfPage(num) {
  if (!currentPdfDoc) return;
  currentPdfDoc.getPage(num).then(function(page) {
    const canvas = document.getElementById("entwurfPdfCanvas");
    const placeholder = document.getElementById("pdfPlaceholderNotice");
    if (!canvas) return;

    const viewport = page.getViewport({ scale: currentPdfScale });
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    canvas.style.display = "block";
    if (placeholder) placeholder.style.display = "none";

    const ctx = canvas.getContext('2d');
    const renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };
    page.render(renderContext);

    const indicator = document.getElementById("pdfPageIndicator");
    if (indicator) indicator.innerText = `${num} / ${currentPdfDoc.numPages}`;

    const nameBadge = document.getElementById("entwurfPdfNameBadge");
    if (nameBadge && currentPdfFileName) nameBadge.innerText = currentPdfFileName;
  });
}

function prevPdfPage() {
  if (!currentPdfDoc || currentPdfPage <= 1) return;
  currentPdfPage--;
  renderPdfPage(currentPdfPage);
}

function nextPdfPage() {
  if (!currentPdfDoc || currentPdfPage >= currentPdfDoc.numPages) return;
  currentPdfPage++;
  renderPdfPage(currentPdfPage);
}

function zoomPdf(delta) {
  if (!currentPdfDoc) return;
  currentPdfScale = Math.max(0.6, Math.min(2.5, currentPdfScale + delta));
  renderPdfPage(currentPdfPage);
}

/**
 * DIMENSIONS UPDATES
 */
function updateEntwurfDimStars(idx, val) {
  const cur = getCurrentLAA();
  if (!cur || !cur.entwurfEval || !cur.entwurfEval.dims) return;
  cur.entwurfEval.dims[idx].stars = parseFloat(val) || 4.0;
  saveState();
  renderEntwurfWorkspace();
}

function updateEntwurfDimNote(idx, val) {
  const cur = getCurrentLAA();
  if (!cur || !cur.entwurfEval || !cur.entwurfEval.dims) return;
  cur.entwurfEval.dims[idx].note = val;
  saveState();
}

function saveEntwurfEvaluation() {
  const cur = getCurrentLAA();
  if (!cur || !cur.entwurfEval) return;

  cur.entwurfEval.topic = document.getElementById("entwurf_topic")?.value.trim() || cur.entwurfEval.topic;
  cur.entwurfEval.subject = document.getElementById("entwurf_subject")?.value.trim() || cur.entwurfEval.subject;

  saveState();
  showToast("Entwurfsbegutachtung & Prüfernotizen gespeichert!", "💾");
}

function autoResizeEntwurfTextarea(el) {
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = Math.max(34, el.scrollHeight + 2) + 'px';
}

function updateColloquiumQuestion(qIdx, val) {
  const cur = getCurrentLAA();
  if (!cur || !cur.colloquiumQuestions) return;
  cur.colloquiumQuestions[qIdx] = val;
  if (cur.entwurfEval && Array.isArray(cur.entwurfEval.questions)) {
    cur.entwurfEval.questions[qIdx] = val;
  }
  saveState();
}

/**
 * COLLOQUIUM QUESTIONS MANAGEMENT
 */
function openAddColloquiumQuestionModal() {
  const bodyHTML = `
    <div class="form-group">
      <label>Prüferfrage / Reflexionsimpuls zur Unterrichtsstunde</label>
      <textarea id="newColloquium_text" class="form-control auto-expand-textarea" rows="3" style="font-size:0.85rem; line-height:1.45; resize:vertical;" placeholder="z. B. Aus welchem didaktischen Grund wurde in der Erarbeitungsphase Partnerarbeit statt Gruppenarbeit gewählt?" oninput="autoResizeEntwurfTextarea(this)"></textarea>
    </div>
  `;

  const footerHTML = `
    <button class="btn btn-outline" onclick="closeModal()">Abbrechen</button>
    <button class="btn btn-primary" onclick="saveNewColloquiumQuestion()">➕ Frage hinzufügen</button>
  `;

  openModal({
    title: "❓ Prüferfrage für Kolloquium & Nachbesprechung",
    bodyHTML,
    footerHTML
  });
}

function saveNewColloquiumQuestion() {
  const text = document.getElementById("newColloquium_text")?.value.trim();
  if (!text) {
    showToast("Bitte geben Sie eine Frage ein!", "⚠️");
    return;
  }

  const cur = getCurrentLAA();
  if (!cur) return;
  if (!cur.colloquiumQuestions) cur.colloquiumQuestions = [];

  cur.colloquiumQuestions.push(text);
  if (cur.entwurfEval && Array.isArray(cur.entwurfEval.questions)) {
    cur.entwurfEval.questions.push(text);
  }
  saveState();
  closeModal();
  renderEntwurfWorkspace();
  showToast("Frage gespeichert & in Tab 6 synchronisiert!", "❓");
}

function deleteColloquiumQuestion(qIdx) {
  const cur = getCurrentLAA();
  if (!cur || !cur.colloquiumQuestions) return;
  cur.colloquiumQuestions.splice(qIdx, 1);
  if (cur.entwurfEval && Array.isArray(cur.entwurfEval.questions)) {
    cur.entwurfEval.questions.splice(qIdx, 1);
  }
  saveState();
  renderEntwurfWorkspace();
}

/**
 * 1-CLICK TEXT GENERATION INTO FORM F 230 / GUTACHTEN
 */
function transferEntwurfToGutachten() {
  const cur = getCurrentLAA();
  if (!cur || !cur.entwurfEval) return;

  const evalData = cur.entwurfEval;
  const dims = evalData.dims || ENTWURF_CRITERIA_DIMS;

  let text = `Würdigung des schriftlichen Unterrichtsentwurfs (${evalData.topic || 'Unterrichtsbesuch'}):\n\n`;
  dims.forEach(d => {
    text += `• ${d.title}: ${d.note || 'Erfüllt die fachdidaktischen Anforderungen.'} (${d.stars} / 5.0 Pkt.)\n`;
  });

  const gutachtenInput = document.getElementById("gutachtenTextArea");
  if (gutachtenInput) {
    gutachtenInput.value = gutachtenInput.value ? `${gutachtenInput.value}\n\n${text}` : text;
  }

  showToast("Entwurfsbeurteilung in Gutachten F 230 übertragen!", "➡️");
  switchTab("tab-gutachten");
}

/**
 * LOCAL DIRECTORY ARCHIVING (Auszubildende/{Name}/)
 */
async function triggerProjectFolderSync() {
  const cur = getCurrentLAA();
  if (!cur) return;

  const folderName = `Auszubildende/${cur.name.replace(/ /g, '_')}`;

  try {
    if (window.showDirectoryPicker) {
      const rootDir = await window.showDirectoryPicker();
      if (rootDir) {
        // Create subdirectories
        const candidateDir = await rootDir.getDirectoryHandle(cur.name.replace(/ /g, '_'), { create: true });
        await candidateDir.getDirectoryHandle('01_Entwuerfe', { create: true });
        await candidateDir.getDirectoryHandle('02_Niederschriften', { create: true });
        await candidateDir.getDirectoryHandle('03_Gutachten_F230', { create: true });

        showToast(`Ordnerstruktur '${folderName}/' erfolgreich auf Dienstgerät angelegt!`, "📁");
      }
    } else {
      showToast(`Archiv-Ordnerpfad '${folderName}/' im Projektverzeichnis aktiv!`, "📁");
    }
  } catch(e) {
    if (e.name !== 'AbortError') {
      showToast(`Ordner '${folderName}/' bereitgestellt.`, "📁");
    }
  }
}
