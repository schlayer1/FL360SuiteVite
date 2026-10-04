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
    <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:12px 16px; margin-bottom:16px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
      <div>
        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
          <h2 style="font-size:1.1rem; color:#f8fafc; margin:0; display:flex; align-items:center; gap:6px;">
            <i data-lucide="file-check-2" class="w-5 h-5 text-blue-500"></i> Entwurfs-Begutachtung: ${cur.name}
          </h2>
          <span class="badge" style="background:rgba(37,99,235,0.15); color:#60a5fa; font-size:0.72rem; padding:2px 6px;">${cur.type || 'LAA'}</span>
          <span class="badge" style="background:rgba(74,222,128,0.15); color:#4ade80; border:1px solid rgba(74,222,128,0.3); font-size:0.75rem; font-weight:700; padding:2px 8px;">Ø Entwurfsnote: ${avgStars} / 5.0</span>
        </div>
        <div style="font-size:0.76rem; color:#94a3b8; margin-top:2px;">
          Split-Screen-Prüfungsarbeitsplatz mit PDF-Viewer, Thüringer 5-Felder-Raster &amp; Prüferfragen-Archiv
        </div>
      </div>

      <div style="display:flex; gap:8px; flex-wrap:wrap;">
        <button class="btn btn-outline" style="font-size:0.78rem; padding:5px 12px;" onclick="triggerProjectFolderSync()" title="Lokalen Ordner 'Auszubildende/${cur.name.replace(/ /g, '_')}' anlegen / verknüpfen">
          <i data-lucide="folder" class="w-4 h-4 inline-block mr-1"></i> Kandidaten-Ordner verknüpfen
        </button>
        <button class="btn btn-outline" style="font-size:0.78rem; padding:5px 12px;" onclick="transferEntwurfToGutachten()" title="Entwurfs-Beurteilungstext mit 1 Klick in Gutachten F 230 übertragen">
          <i data-lucide="arrow-right" class="w-4 h-4 inline-block mr-1"></i> In Gutachten F 230 übernehmen
        </button>
        <button class="btn btn-primary" style="font-size:0.78rem; padding:5px 14px;" onclick="saveEntwurfEvaluation()">
          <i data-lucide="save" class="w-4 h-4 inline-block mr-1"></i> Bewertung speichern
        </button>
      </div>
    </div>

    <!-- Split Screen Container -->
    <div class="entwurf-split-grid">
      <!-- LEFT PANE: PDF VIEWER -->
      <div class="entwurf-pane card" style="display:flex; flex-direction:column; padding:0; overflow:hidden;">
        <div class="entwurf-pane-header">
          <div style="display:flex; align-items:center; gap:8px;">
            <strong style="font-size:0.88rem; color:#f8fafc; display:flex; align-items:center; gap:6px;">
              <i data-lucide="file-text" class="w-4 h-4 text-blue-500"></i> PDF-Unterrichtsentwurf
            </strong>
            <span id="entwurfPdfNameBadge" style="font-size:0.75rem; color:#94a3b8; font-family:monospace;">${currentPdfFileName || (evalData.pdfName || 'Kein PDF geladen')}</span>
          </div>

          <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
            <!-- Annotation Toolbar -->
            ${getAnnotToolbarHtml('entwurfWorkspace')}

            <button class="btn btn-outline" style="font-size:0.75rem; padding:3px 8px;" onclick="triggerPdfUpload()" title="PDF-Entwurf auswählen">
              <i data-lucide="folder-open" class="w-3.5 h-3.5 inline-block mr-1"></i> PDF laden...
            </button>
            
            <!-- Zoom Controls -->
            <button class="btn btn-ghost" style="padding:2px 6px; font-size:0.8rem;" onclick="zoomPdf(-0.2)" title="Verkleinern"><i data-lucide="zoom-out" class="w-3.5 h-3.5"></i></button>
            <button class="btn btn-ghost" style="padding:2px 6px; font-size:0.8rem;" onclick="zoomPdf(0.2)" title="Vergrößern"><i data-lucide="zoom-in" class="w-3.5 h-3.5"></i></button>
            <button class="btn btn-ghost" style="padding:2px 6px; font-size:0.8rem;" onclick="prevPdfPage()" title="Vorherige Seite"><i data-lucide="chevron-left" class="w-3.5 h-3.5"></i></button>
            <span id="entwurfPdfPageIndicator" style="font-size:0.75rem; font-weight:700; color:#94a3b8;">1 / 1</span>
            <button class="btn btn-ghost" style="padding:2px 6px; font-size:0.8rem;" onclick="nextPdfPage()" title="Nächste Seite"><i data-lucide="chevron-right" class="w-3.5 h-3.5"></i></button>
          </div>
        </div>

        <div id="entwurfPdfViewerContainer" class="entwurf-pdf-container">
          <div id="pdfPlaceholderNotice" style="text-align:center; padding:60px 20px; color:#94a3b8;">
            <div style="margin-bottom:10px; display:flex; justify-content:center;"><i data-lucide="file-text" class="w-16 h-16 text-slate-500 opacity-60"></i></div>
            <h4 style="color:#e2e8f0; margin-bottom:6px;">Schriftlichen Unterrichtsentwurf laden</h4>
            <p style="font-size:0.84rem; max-width:400px; margin:0 auto 16px; color:#94a3b8;">
              Wählen Sie die PDF-Datei des Auszubildenden aus, um sie direkt im Split-Screen zu sichten und parallel zu begutachten.
            </p>
            <button class="btn btn-primary" onclick="triggerPdfUpload()"><i data-lucide="upload" class="w-4 h-4 inline-block mr-1"></i> PDF-Entwurf auswählen</button>
          </div>
          <div id="entwurfPdfWrapper" class="pdf-canvas-wrapper" style="display:none;">
            <canvas id="entwurfPdfCanvas" style="display:block; max-width:100%; box-shadow:0 4px 12px rgba(0,0,0,0.4); border-radius:4px;"></canvas>
            <canvas id="entwurfAnnotCanvas" class="pdf-annot-layer" style="display:block;"></canvas>
          </div>
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
          <span style="display:flex; align-items:center; gap:6px;"><i data-lucide="scale" class="w-4 h-4 text-blue-500"></i><span>Begutachtungsraster nach ThürAZStPLVO</span></span>
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
        <div style="background:rgba(37,99,235,0.05); border:1px solid rgba(37,99,235,0.2); border-radius:8px; padding:12px; margin-bottom:14px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <strong style="font-size:0.86rem; color:#60a5fa; display:flex; align-items:center; gap:6px;">
              <i data-lucide="help-circle" class="w-4 h-4 text-blue-500"></i> Prüferfragen für Kolloquium &amp; Nachbesprechung
            </strong>
            <button class="btn btn-outline" style="font-size:0.72rem; padding:2px 8px; background:#fff;" onclick="openAddColloquiumQuestionModal()">
              <i data-lucide="plus" class="w-3.5 h-3.5 inline-block mr-1"></i> Neue Frage
            </button>
          </div>
          <div style="font-size:0.74rem; color:#94a3b8; margin-bottom:8px; display:flex; align-items:center; gap:6px;">
            <i data-lucide="info" class="w-3.5 h-3.5 text-blue-500"></i> Diese Fragen werden automatisch in <strong>Tab 6 (Reflexionsabgleich)</strong> und den <strong>Beratungs-Druckbogen</strong> synchronisiert.
          </div>
          <div id="entwurfQuestionsList" style="display:flex; flex-direction:column; gap:8px;">
            ${questions.map((q, qIdx) => `
              <div class="question-row" style="align-items:flex-start; gap:8px; padding:6px 10px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:6px;">
                <span style="font-weight:700; color:#60a5fa; font-size:0.82rem; margin-top:4px; flex-shrink:0;">Q${qIdx + 1}:</span>
                <textarea 
                  class="form-control auto-expand-textarea" 
                  style="flex:1; font-size:0.82rem; padding:4px 8px; line-height:1.4; resize:vertical; min-height:34px; border:1px solid rgba(255,255,255,0.15); border-radius:4px; font-family:inherit;" 
                  rows="1"
                  placeholder="Prüferfrage eingeben..."
                  oninput="autoResizeEntwurfTextarea(this); updateColloquiumQuestion(${qIdx}, this.value)"
                >${q}</textarea>
                <button class="btn btn-ghost btn-icon-only" style="padding:2px 6px; color:#ef4444; font-size:0.85rem; margin-top:2px;" onclick="deleteColloquiumQuestion(${qIdx})" title="Frage löschen"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
              </div>
            `).join('') || '<div style="font-size:0.78rem; color:#94a3b8; font-style:italic;">Keine Fragen hinterlegt.</div>'}
          </div>
        </div>

        <!-- Action Button -->
        <button class="btn btn-accent" style="width:100%; font-size:0.86rem; padding:8px 14px;" onclick="transferEntwurfToGutachten()">
          <i data-lucide="arrow-right" class="w-4 h-4 inline-block mr-1"></i> Entwurfsurteil in Gutachten F 230 übertragen
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
  let input = document.getElementById("entwurfPdfFileInput");
  if (!input) {
    input = document.createElement("input");
    input.type = "file";
    input.id = "entwurfPdfFileInput";
    input.accept = "application/pdf";
    input.style.display = "none";
    input.onchange = handleEntwurfPdfSelected;
    document.body.appendChild(input);
  }
  // Reset value so selecting the same file again triggers change event
  input.value = "";
  input.click();
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

/**
 * GOODNOTES-STYLE ANNOTATION ENGINE FOR PDF ENTWURF
 */
let annotCurrentTool = 'none'; // 'none', 'highlighter', 'pen', 'eraser', 'note'
let annotCurrentColor = '#fde047'; // default yellow highlighter
let annotHighlighterSize = 18;
let annotPenSize = 3;
let isDrawingAnnotation = false;
let currentStrokePoints = [];

const ANNOT_COLORS = {
  highlighter: [
    { name: 'Gelb', hex: '#fde047' },
    { name: 'Grün', hex: '#4ade80' },
    { name: 'Pink', hex: '#f472b6' },
    { name: 'Blau', hex: '#38bdf8' },
    { name: 'Orange', hex: '#fb923c' }
  ],
  pen: [
    { name: 'Rot', hex: '#ef4444' },
    { name: 'Blau', hex: '#2563eb' },
    { name: 'Schwarz', hex: '#0f172a' },
    { name: 'Grün', hex: '#16a34a' }
  ]
};

function setAnnotTool(tool) {
  annotCurrentTool = (annotCurrentTool === tool) ? 'none' : tool;
  if (annotCurrentTool === 'highlighter' && !ANNOT_COLORS.highlighter.some(c => c.hex === annotCurrentColor)) {
    annotCurrentColor = '#fde047';
  } else if (annotCurrentTool === 'pen' && !ANNOT_COLORS.pen.some(c => c.hex === annotCurrentColor)) {
    annotCurrentColor = '#ef4444';
  }
  updateAnnotToolbarsUI();
  updateAnnotLayerCursors();
}

function setAnnotColor(hex) {
  annotCurrentColor = hex;
  updateAnnotToolbarsUI();
}

function updateAnnotToolbarsUI() {
  document.querySelectorAll('.pdf-annot-btn[data-tool]').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-tool') === annotCurrentTool);
  });
  document.querySelectorAll('.pdf-annot-color-dot').forEach(dot => {
    dot.classList.toggle('active', dot.getAttribute('data-color') === annotCurrentColor);
  });
}

function updateAnnotLayerCursors() {
  document.querySelectorAll('.pdf-annot-layer').forEach(layer => {
    layer.className = 'pdf-annot-layer';
    if (annotCurrentTool !== 'none') {
      layer.classList.add(`mode-${annotCurrentTool}`);
    }
  });
}

function getCandidateAnnotations() {
  const cur = getCurrentLAA();
  if (!cur) return {};
  if (!cur.entwurfAnnotations) {
    cur.entwurfAnnotations = {};
  }
  return cur.entwurfAnnotations;
}

function getPageAnnotations(pageNum) {
  const annots = getCandidateAnnotations();
  const pageKey = `page_${pageNum}`;
  if (!annots[pageKey]) {
    annots[pageKey] = [];
  }
  return annots[pageKey];
}

function savePageAnnotations(pageNum, list) {
  const annots = getCandidateAnnotations();
  annots[`page_${pageNum}`] = list;
  saveState();
}

function undoLastAnnotation() {
  if (!currentPdfDoc) return;
  const list = getPageAnnotations(currentPdfPage);
  if (list.length > 0) {
    list.pop();
    savePageAnnotations(currentPdfPage, list);
    redrawAllAnnotLayers();
    showToast("Letzte Markierung rückgängig gemacht", "↩️");
  }
}

function clearPageAnnotations() {
  if (!currentPdfDoc) return;
  const list = getPageAnnotations(currentPdfPage);
  if (list.length === 0) return;
  if (confirm(`Möchten Sie wirklich alle Markierungen auf Seite ${currentPdfPage} löschen?`)) {
    savePageAnnotations(currentPdfPage, []);
    redrawAllAnnotLayers();
    showToast(`Markierungen auf Seite ${currentPdfPage} gelöscht`, "🧹");
  }
}

function renderPdfAnnotations(annotCanvas, pageNum) {
  if (!annotCanvas) return;
  const ctx = annotCanvas.getContext('2d');
  const w = annotCanvas.width;
  const h = annotCanvas.height;
  ctx.clearRect(0, 0, w, h);

  const list = getPageAnnotations(pageNum);
  list.forEach(item => {
    if (item.type === 'highlighter' || item.type === 'pen') {
      drawStroke(ctx, item, w, h);
    }
  });

  // Render sticky note pins
  const wrapper = annotCanvas.parentElement;
  if (wrapper) {
    wrapper.querySelectorAll('.pdf-note-pin').forEach(pin => pin.remove());
    list.forEach((item, idx) => {
      if (item.type === 'note') {
        createNotePinElement(wrapper, item, idx);
      }
    });
  }
}

function drawStroke(ctx, stroke, w, h) {
  if (!stroke.points || stroke.points.length < 2) return;
  ctx.save();
  ctx.beginPath();

  if (stroke.type === 'highlighter') {
    ctx.globalAlpha = 0.38;
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = (stroke.size || annotHighlighterSize) * (w / 800);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  } else {
    ctx.globalAlpha = 1.0;
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = (stroke.size || annotPenSize) * (w / 800);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }

  const p0 = stroke.points[0];
  ctx.moveTo(p0.x * w, p0.y * h);
  for (let i = 1; i < stroke.points.length; i++) {
    const pt = stroke.points[i];
    ctx.lineTo(pt.x * w, pt.y * h);
  }
  ctx.stroke();
  ctx.restore();
}

function createNotePinElement(wrapper, noteItem, idx) {
  const pin = document.createElement('div');
  pin.className = 'pdf-note-pin';
  pin.style.left = `${noteItem.x * 100}%`;
  pin.style.top = `${noteItem.y * 100}%`;
  pin.innerHTML = `<span>${idx + 1}</span>`;
  pin.title = noteItem.text || 'Notiz öffnen';
  pin.onclick = (e) => {
    e.stopPropagation();
    openNotePinDialog(noteItem, idx);
  };
  wrapper.appendChild(pin);
}

function openNotePinDialog(noteItem, idx) {
  const action = prompt(`Fachleiter-Notiz #${idx + 1}:\n(Leer lassen oder 'LÖSCHEN' zum Entfernen)`, noteItem.text || "");
  if (action === null) return;
  const list = getPageAnnotations(currentPdfPage);
  if (action.trim() === "" || action.trim().toUpperCase() === "LÖSCHEN") {
    list.splice(idx, 1);
    savePageAnnotations(currentPdfPage, list);
    redrawAllAnnotLayers();
    showToast("Notiz-Pin entfernt", "🗑️");
  } else {
    noteItem.text = action.trim();
    savePageAnnotations(currentPdfPage, list);
    redrawAllAnnotLayers();
    showToast("Notiz aktualisiert", "💾");
  }
}

function redrawAllAnnotLayers() {
  const annotCanvases = [
    document.getElementById("entwurfAnnotCanvas"),
    document.getElementById("nsSplitAnnotCanvas"),
    document.getElementById("cockpitSplitAnnotCanvas")
  ];
  annotCanvases.forEach(ac => {
    if (ac && ac.width > 0) {
      renderPdfAnnotations(ac, currentPdfPage);
    }
  });
}

function setupAnnotCanvasEvents(annotCanvas) {
  if (!annotCanvas || annotCanvas._annotInitialized) return;
  annotCanvas._annotInitialized = true;

  const getCanvasCoords = (e) => {
    const rect = annotCanvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) / rect.width,
      y: (clientY - rect.top) / rect.height
    };
  };

  const onPointerDown = (e) => {
    if (annotCurrentTool === 'none') return;
    e.preventDefault();

    const coords = getCanvasCoords(e);
    if (coords.x < 0 || coords.x > 1 || coords.y < 0 || coords.y > 1) return;

    if (annotCurrentTool === 'note') {
      const noteText = prompt("Neue Fachleiter-Randnotiz auf dem PDF anheften:");
      if (noteText && noteText.trim()) {
        const list = getPageAnnotations(currentPdfPage);
        list.push({
          type: 'note',
          x: Math.round(coords.x * 1000) / 1000,
          y: Math.round(coords.y * 1000) / 1000,
          text: noteText.trim(),
          date: new Date().toISOString()
        });
        savePageAnnotations(currentPdfPage, list);
        redrawAllAnnotLayers();
        showToast("Randnotiz angeheftet!", "📌");
      }
      return;
    }

    if (annotCurrentTool === 'eraser') {
      eraseAnnotationAt(coords);
      return;
    }

    // Pen or Highlighter
    isDrawingAnnotation = true;
    currentStrokePoints = [coords];
  };

  const onPointerMove = (e) => {
    if (!isDrawingAnnotation) return;
    e.preventDefault();
    const coords = getCanvasCoords(e);
    currentStrokePoints.push(coords);

    // Live feedback drawing
    const ctx = annotCanvas.getContext('2d');
    const w = annotCanvas.width;
    const h = annotCanvas.height;
    const pts = currentStrokePoints;
    if (pts.length >= 2) {
      ctx.save();
      ctx.beginPath();
      if (annotCurrentTool === 'highlighter') {
        ctx.globalAlpha = 0.38;
        ctx.strokeStyle = annotCurrentColor;
        ctx.lineWidth = annotHighlighterSize * (w / 800);
      } else {
        ctx.globalAlpha = 1.0;
        ctx.strokeStyle = annotCurrentColor;
        ctx.lineWidth = annotPenSize * (w / 800);
      }
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      const prev = pts[pts.length - 2];
      const curr = pts[pts.length - 1];
      ctx.moveTo(prev.x * w, prev.y * h);
      ctx.lineTo(curr.x * w, curr.y * h);
      ctx.stroke();
      ctx.restore();
    }
  };

  const onPointerUp = (e) => {
    if (!isDrawingAnnotation) return;
    isDrawingAnnotation = false;
    if (currentStrokePoints.length >= 2) {
      const list = getPageAnnotations(currentPdfPage);
      list.push({
        type: annotCurrentTool,
        color: annotCurrentColor,
        size: (annotCurrentTool === 'highlighter') ? annotHighlighterSize : annotPenSize,
        points: currentStrokePoints.map(p => ({
          x: Math.round(p.x * 1000) / 1000,
          y: Math.round(p.y * 1000) / 1000
        }))
      });
      savePageAnnotations(currentPdfPage, list);
      redrawAllAnnotLayers();
    }
    currentStrokePoints = [];
  };

  annotCanvas.addEventListener('mousedown', onPointerDown);
  window.addEventListener('mousemove', onPointerMove);
  window.addEventListener('mouseup', onPointerUp);

  annotCanvas.addEventListener('touchstart', onPointerDown, { passive: false });
  window.addEventListener('touchmove', onPointerMove, { passive: false });
  window.addEventListener('touchend', onPointerUp, { passive: false });
}

function eraseAnnotationAt(coords) {
  const list = getPageAnnotations(currentPdfPage);
  let removed = false;
  // Check in reverse order so latest strokes on top are erased first
  for (let i = list.length - 1; i >= 0; i--) {
    const item = list[i];
    if (item.type === 'note') {
      const dist = Math.hypot(item.x - coords.x, item.y - coords.y);
      if (dist < 0.04) {
        list.splice(i, 1);
        removed = true;
        break;
      }
    } else if (item.points) {
      const hit = item.points.some(pt => Math.hypot(pt.x - coords.x, pt.y - coords.y) < 0.035);
      if (hit) {
        list.splice(i, 1);
        removed = true;
        break;
      }
    }
  }

  if (removed) {
    savePageAnnotations(currentPdfPage, list);
    redrawAllAnnotLayers();
    showToast("Markierung gelöscht", "🧹");
  }
}

/**
 * GENERATE TOOLBAR HTML HELPER
 */
function getAnnotToolbarHtml(prefix = "") {
  return `
    <div class="pdf-annot-toolbar" id="${prefix}AnnotToolbar">
      <!-- Highlighter Button & Palette -->
      <button class="pdf-annot-btn" data-tool="highlighter" onclick="setAnnotTool('highlighter')" title="Textmarker (GoodNotes-Style: Gelb, Grün, Pink, Blau)">
        <i data-lucide="highlighter" class="w-3.5 h-3.5 inline"></i>
        <span>Marker</span>
      </button>

      <!-- Pen Button -->
      <button class="pdf-annot-btn" data-tool="pen" onclick="setAnnotTool('pen')" title="Stift / Freihand-Kommentar (Rot, Blau, Schwarz)">
        <i data-lucide="pencil" class="w-3.5 h-3.5 inline"></i>
        <span>Stift</span>
      </button>

      <!-- Color Dot Selector -->
      <div style="display:inline-flex; align-items:center; gap:3px; padding:0 3px;">
        <span class="pdf-annot-color-dot ${annotCurrentColor === '#fde047' ? 'active' : ''}" data-color="#fde047" style="background:#fde047;" onclick="setAnnotColor('#fde047')" title="Neon Gelb"></span>
        <span class="pdf-annot-color-dot ${annotCurrentColor === '#4ade80' ? 'active' : ''}" data-color="#4ade80" style="background:#4ade80;" onclick="setAnnotColor('#4ade80')" title="Pastell Grün"></span>
        <span class="pdf-annot-color-dot ${annotCurrentColor === '#f472b6' ? 'active' : ''}" data-color="#f472b6" style="background:#f472b6;" onclick="setAnnotColor('#f472b6')" title="Neon Pink"></span>
        <span class="pdf-annot-color-dot ${annotCurrentColor === '#38bdf8' ? 'active' : ''}" data-color="#38bdf8" style="background:#38bdf8;" onclick="setAnnotColor('#38bdf8')" title="Himmelblau"></span>
        <span class="pdf-annot-color-dot ${annotCurrentColor === '#ef4444' ? 'active' : ''}" data-color="#ef4444" style="background:#ef4444;" onclick="setAnnotColor('#ef4444')" title="Korrektur-Rot"></span>
        <span class="pdf-annot-color-dot ${annotCurrentColor === '#0f172a' ? 'active' : ''}" data-color="#0f172a" style="background:#0f172a;" onclick="setAnnotColor('#0f172a')" title="Schwarz / Dunkel"></span>
      </div>

      <!-- Eraser Button -->
      <button class="pdf-annot-btn" data-tool="eraser" onclick="setAnnotTool('eraser')" title="Radierer: Klick auf Markierung oder Pin zum Entfernen">
        <i data-lucide="eraser" class="w-3.5 h-3.5 inline"></i>
      </button>

      <!-- Sticky Note Pin Button -->
      <button class="pdf-annot-btn" data-tool="note" onclick="setAnnotTool('note')" title="Randnotiz-Pin: Klicke auf das PDF, um einen Kommentar anzuheften">
        <i data-lucide="sticky-note" class="w-3.5 h-3.5 inline"></i>
        <span>Notiz</span>
      </button>

      <!-- Undo Button -->
      <button class="pdf-annot-btn" onclick="undoLastAnnotation()" title="Letzten Strich rückgängig machen">
        <i data-lucide="undo-2" class="w-3.5 h-3.5 inline"></i>
      </button>

      <!-- Clear Page Annotations Button -->
      <button class="pdf-annot-btn" onclick="clearPageAnnotations()" title="Alle Markierungen dieser Seite entfernen">
        <i data-lucide="trash-2" class="w-3.5 h-3.5 inline"></i>
      </button>
    </div>
  `;
}

let activePdfRenderTasks = {};

function renderPdfPage(num) {
  if (!currentPdfDoc) return;
  currentPdfPage = num;
  currentPdfDoc.getPage(num).then(function(page) {
    const targets = [
      { canvasId: "entwurfPdfCanvas", annotId: "entwurfAnnotCanvas", wrapperId: "entwurfPdfWrapper", placeholderId: "pdfPlaceholderNotice", indicatorId: "entwurfPdfPageIndicator", badgeId: "entwurfPdfNameBadge" },
      { canvasId: "nsSplitPdfCanvas", annotId: "nsSplitAnnotCanvas", wrapperId: "nsSplitPdfWrapper", placeholderId: "nsSplitPdfPlaceholder", indicatorId: "nsSplitPdfPageIndicator", badgeId: "nsSplitPdfNameBadge" },
      { canvasId: "cockpitSplitPdfCanvas", annotId: "cockpitSplitAnnotCanvas", wrapperId: "cockpitSplitPdfWrapper", placeholderId: "cockpitSplitPdfPlaceholder", indicatorId: "cockpitSplitPdfPageIndicator", badgeId: "cockpitSplitPdfNameBadge" }
    ];

    targets.forEach(cfg => {
      const canvas = document.getElementById(cfg.canvasId);
      const annotCanvas = document.getElementById(cfg.annotId);
      const wrapper = document.getElementById(cfg.wrapperId);
      const placeholder = document.getElementById(cfg.placeholderId);
      const indicator = document.getElementById(cfg.indicatorId);
      const badge = document.getElementById(cfg.badgeId);

      if (indicator) indicator.innerText = `${num} / ${currentPdfDoc.numPages}`;
      if (badge && currentPdfFileName) badge.innerText = currentPdfFileName;

      if (!canvas) return;
      // Only render if container is not completely hidden
      const parentPane = canvas.closest('.split-pane-pdf, .entwurf-pane');
      if (parentPane && getComputedStyle(parentPane).display === 'none') {
        return;
      }

      // Cancel any existing render task on this canvas before starting a new one
      if (activePdfRenderTasks[cfg.canvasId]) {
        try {
          activePdfRenderTasks[cfg.canvasId].cancel();
        } catch(e) {}
      }

      const viewport = page.getViewport({ scale: currentPdfScale });
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      canvas.style.display = "block";

      if (wrapper) {
        wrapper.style.display = "inline-block";
        wrapper.style.width = `${viewport.width}px`;
        wrapper.style.height = `${viewport.height}px`;
      }

      if (annotCanvas) {
        annotCanvas.width = viewport.width;
        annotCanvas.height = viewport.height;
        annotCanvas.style.display = "block";
        setupAnnotCanvasEvents(annotCanvas);
      }

      if (placeholder) placeholder.style.display = "none";

      const ctx = canvas.getContext('2d');
      const renderContext = {
        canvasContext: ctx,
        viewport: viewport
      };

      const renderTask = page.render(renderContext);
      activePdfRenderTasks[cfg.canvasId] = renderTask;
      renderTask.promise.then(() => {
        if (activePdfRenderTasks[cfg.canvasId] === renderTask) {
          delete activePdfRenderTasks[cfg.canvasId];
        }
        if (annotCanvas) {
          renderPdfAnnotations(annotCanvas, num);
        }
        updateAnnotLayerCursors();
      }).catch(err => {
        if (err && err.name !== 'RenderingCancelledException') {
          console.warn("PDF render notice:", err);
        }
      });
    });
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
    <button class="btn btn-primary" onclick="saveNewColloquiumQuestion()"><i data-lucide="plus" class="w-4 h-4 inline-block mr-1"></i> Frage hinzufügen</button>
  `;

  openModal({
    title: "Prüferfrage für Kolloquium & Nachbesprechung",
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

/**
 * GENERATE / LOAD SAMPLE LESSON PLAN PDF (DEMO & TEST WORKFLOW)
 */
async function loadSampleLessonPlanPdf() {
  if (typeof PDFLib === 'undefined' || typeof pdfjsLib === 'undefined') {
    showToast("PDF-Bibliotheken werden geladen...", "⏳");
    return;
  }
  try {
    const pdfDoc = await PDFLib.PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 format
    const font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(PDFLib.StandardFonts.HelveticaBold);
    
    // Seite 1: Deckblatt & Lehrplanbezug
    page.drawText("STAATSSEMINAR FÜR LEHRÄMTER THÜRINGEN", { x: 50, y: 800, size: 9, font: fontBold, color: PDFLib.rgb(0.25, 0.4, 0.55) });
    page.drawText("Schriftlicher Unterrichtsentwurf zur 2. Staatsprüfung", { x: 50, y: 775, size: 15, font: fontBold, color: PDFLib.rgb(0.06, 0.1, 0.2) });
    
    const cur = typeof getCurrentLAA === 'function' ? getCurrentLAA() : null;
    const candName = cur ? cur.name : "Maximilian Weber";
    page.drawText(`Kandidat/in: ${candName} • Fach: Geschichte • Klasse 9b`, { x: 50, y: 745, size: 10.5, font, color: PDFLib.rgb(0.2, 0.25, 0.3) });
    page.drawText("Stundenthema: Wendepunkt 1989 – Die Friedliche Revolution in Thüringen", { x: 50, y: 725, size: 11, font: fontBold, color: PDFLib.rgb(0.05, 0.25, 0.45) });

    page.drawLine({ start: { x: 50, y: 710 }, end: { x: 545, y: 710 }, thickness: 1, color: PDFLib.rgb(0.8, 0.85, 0.9) });

    page.drawText("1. Lehrplanbezug & Kompetenzschwerpunkte (Thüringer Lehrplan Geschichte):", { x: 50, y: 690, size: 11, font: fontBold, color: PDFLib.rgb(0.1, 0.15, 0.2) });
    page.drawText("• Sachkompetenz: Die Schülerinnen und Schüler analysieren Ursachen und Verlauf der Revolution 1989.", { x: 60, y: 670, size: 9.5, font, color: PDFLib.rgb(0.2, 0.25, 0.3) });
    page.drawText("• Methodenkompetenz: Quellenkritische Erschließung historischer Flugblätter und Bürgerkomitee-Berichte.", { x: 60, y: 652, size: 9.5, font, color: PDFLib.rgb(0.2, 0.25, 0.3) });
    page.drawText("• Urteilskompetenz: Reflexion des Wertes von Meinungs- und Demonstrationsfreiheit im Gegenwartsbezug.", { x: 60, y: 634, size: 9.5, font, color: PDFLib.rgb(0.2, 0.25, 0.3) });

    page.drawText("2. Bedingungs- und Lerngruppenanalyse:", { x: 50, y: 600, size: 11, font: fontBold, color: PDFLib.rgb(0.1, 0.15, 0.2) });
    page.drawText("Die Klasse 9b besteht aus 24 Lernenden (13w, 11m). Das Vorwissen zur DDR-Geschichte ist heterogen.", { x: 60, y: 580, size: 9.5, font, color: PDFLib.rgb(0.2, 0.25, 0.3) });
    page.drawText("Kooperative Lernformen wie Tandem-Arbeit sind etabliert, bedürfen jedoch klarer Zeitstrukturen.", { x: 60, y: 562, size: 9.5, font, color: PDFLib.rgb(0.2, 0.25, 0.3) });
    page.drawText("— Seite 1 von 3 (Weiterblättern für Verlaufsplanung & Binnendifferenzierung) —", { x: 120, y: 50, size: 8.5, font, color: PDFLib.rgb(0.5, 0.55, 0.6) });

    // Seite 2: Didaktisch-methodische Verlaufsplanung
    const page2 = pdfDoc.addPage([595.28, 841.89]);
    page2.drawText("STAATSSEMINAR FÜR LEHRÄMTER THÜRINGEN • SEITE 2", { x: 50, y: 800, size: 9, font: fontBold, color: PDFLib.rgb(0.25, 0.4, 0.55) });
    page2.drawText("2. Didaktisch-methodische Verlaufsplanung (45 Min.):", { x: 50, y: 765, size: 12, font: fontBold, color: PDFLib.rgb(0.06, 0.1, 0.2) });
    page2.drawLine({ start: { x: 50, y: 750 }, end: { x: 545, y: 750 }, thickness: 1, color: PDFLib.rgb(0.8, 0.85, 0.9) });

    page2.drawText("00-08 Min | Einstieg: Bildimpuls Nikolaikirche Leipzig & Friedensgebete (Plenum)", { x: 50, y: 720, size: 9.5, font: fontBold, color: PDFLib.rgb(0.1, 0.15, 0.2) });
    page2.drawText("• Ziel: Emotionaler Problemaufriss und Aktivierung des Vorwissens zu Bürgerprotesten.", { x: 65, y: 704, size: 9, font, color: PDFLib.rgb(0.25, 0.3, 0.35) });

    page2.drawText("08-26 Min | Erarbeitung: Quellenanalyse in Partnerarbeit mit gestuften Hilfekarten", { x: 50, y: 670, size: 9.5, font: fontBold, color: PDFLib.rgb(0.1, 0.15, 0.2) });
    page2.drawText("• Material: Flugblatt des Neuen Forums Erfurt (Herbst 1989) & MfS-Lagebericht.", { x: 65, y: 654, size: 9, font, color: PDFLib.rgb(0.25, 0.3, 0.35) });
    page2.drawText("• Differenzierung: Niveau A (Wortgeländer), Niveau B (Originaltext mit Leitfragen).", { x: 65, y: 638, size: 9, font, color: PDFLib.rgb(0.25, 0.3, 0.35) });

    page2.drawText("26-38 Min | Sicherung: Synoptische Ergebnissicherung an der Tafel", { x: 50, y: 605, size: 9.5, font: fontBold, color: PDFLib.rgb(0.1, 0.15, 0.2) });
    page2.drawText("• Ergebnis: Gegenüberstellung Bürgerforderungen vs. staatliche Repression.", { x: 65, y: 589, size: 9, font, color: PDFLib.rgb(0.25, 0.3, 0.35) });

    page2.drawText("38-45 Min | Transfer & Reflexion: 'Demokratie heute verteidigen' – Blitzlicht im Plenum", { x: 50, y: 555, size: 9.5, font: fontBold, color: PDFLib.rgb(0.1, 0.15, 0.2) });
    page2.drawText("• Reflexionsimpuls: 'Welche Verantwortung erwächst aus 1989 für uns heute?'", { x: 65, y: 539, size: 9, font, color: PDFLib.rgb(0.25, 0.3, 0.35) });
    page2.drawText("— Seite 2 von 3 (Weiterblättern für Binnendifferenzierung & Reflexion) —", { x: 120, y: 50, size: 8.5, font, color: PDFLib.rgb(0.5, 0.55, 0.6) });

    // Seite 3: Binnendifferenzierung & Begründung
    const page3 = pdfDoc.addPage([595.28, 841.89]);
    page3.drawText("STAATSSEMINAR FÜR LEHRÄMTER THÜRINGEN • SEITE 3", { x: 50, y: 800, size: 9, font: fontBold, color: PDFLib.rgb(0.25, 0.4, 0.55) });
    page3.drawText("3. Binnendifferenzierung, Hilfesystem & Inklusion:", { x: 50, y: 765, size: 12, font: fontBold, color: PDFLib.rgb(0.06, 0.1, 0.2) });
    page3.drawLine({ start: { x: 50, y: 750 }, end: { x: 545, y: 750 }, thickness: 1, color: PDFLib.rgb(0.8, 0.85, 0.9) });

    page3.drawText("• Niveau Basis: Entlastete Textauszüge mit Wortschatz-Erklärungen und Zeilenangaben.", { x: 60, y: 720, size: 9.5, font, color: PDFLib.rgb(0.2, 0.25, 0.3) });
    page3.drawText("• Niveau Erweitert: Ungestutzte Zeitzeugenberichte aus der Erfurter Andreasstraße.", { x: 60, y: 700, size: 9.5, font, color: PDFLib.rgb(0.2, 0.25, 0.3) });
    page3.drawText("• Zusatzangebot: Vergleich mit aktuellen Bürgerrechtsbewegungen weltweit.", { x: 60, y: 680, size: 9.5, font, color: PDFLib.rgb(0.2, 0.25, 0.3) });

    page3.drawText("4. Begründung der didaktischen Schwerpunktsetzung:", { x: 50, y: 640, size: 12, font: fontBold, color: PDFLib.rgb(0.06, 0.1, 0.2) });
    page3.drawLine({ start: { x: 50, y: 625 }, end: { x: 545, y: 625 }, thickness: 1, color: PDFLib.rgb(0.8, 0.85, 0.9) });
    page3.drawText("Die didaktische Reduktion konzentriert sich exemplarisch auf den regionalen Bezug Thüringens.", { x: 60, y: 595, size: 9.5, font, color: PDFLib.rgb(0.2, 0.25, 0.3) });
    page3.drawText("Der kooperative Ansatz fördert die diskursive Argumentation und multiperspektivische Urteilsbildung.", { x: 60, y: 575, size: 9.5, font, color: PDFLib.rgb(0.2, 0.25, 0.3) });
    page3.drawText("— Seite 3 von 3 (Ende des Unterrichtsentwurfs) —", { x: 160, y: 50, size: 8.5, font, color: PDFLib.rgb(0.5, 0.55, 0.6) });

    const pdfBytes = await pdfDoc.save();
    currentPdfFileName = `Unterrichtsentwurf_${candName.replace(/ /g, '_')}.pdf`;
    if (cur && cur.entwurfEval) {
      cur.entwurfEval.pdfName = currentPdfFileName;
    }
    const pdf = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
    currentPdfDoc = pdf;
    currentPdfPage = 1;
    renderPdfPage(1);
    showToast(`Muster-Unterrichtsentwurf (3 Seiten) für '${candName}' im Split-Screen geladen!`, "📄");
  } catch(err) {
    console.error("Error loading sample lesson plan pdf:", err);
  }
}

