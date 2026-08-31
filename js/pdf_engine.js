/**
 * INTERACTIVE ACROFORM PDF ENGINE & LOCAL FOLDER SYNC (Fachleiter-Suite 360° Pro)
 */

let pdfDocBytes = null;
let pdfJsDoc = null;
let currentPage = 1;
let totalPages = 1;
let activeTemplateKey = "f230";
let formFieldMap = {};
let customTemplates = [];
let localDirectoryHandle = null;
let pdfFieldElements = {};

const THUERINGEN_SUBJECTS = [
  "Mathematik", "Deutsch", "Englisch", "Physik", "Chemie", "Biologie",
  "Informatik", "Technik", "Geografie", "Geschichte", "Sozialkunde / Wirtschaft und Recht",
  "Ethik", "Evangelische Religionslehre", "Katholische Religionslehre",
  "Kunsterziehung", "Musik", "Sport", "Französisch", "Russisch", "Spanisch", "Latein"
];

async function initPdfEngine() {
  updateTemplateDropdown();
  updateFolderUIState();
  if (activeTemplateKey) {
    await loadPdfTemplate(activeTemplateKey);
  }
}

function updateTemplateDropdown() {
  const select = document.getElementById("pdfTemplateSelect");
  const countBadge = document.getElementById("templateCountBadge");
  if (!select) return;

  let optionsHtml = `<optgroup label="Amtliche Formulare (Thüringer Landesprüfungsamt)">`;
  if (typeof OFFICIAL_TEMPLATES !== 'undefined') {
    for (const [key, tpl] of Object.entries(OFFICIAL_TEMPLATES)) {
      const isSel = (key === activeTemplateKey) ? 'selected' : '';
      optionsHtml += `<option value="${key}" ${isSel}>${tpl.id} • ${tpl.title}</option>`;
    }
  }
  optionsHtml += `</optgroup>`;

  if (customTemplates.length > 0) {
    optionsHtml += `<optgroup label="📁 Verknüpfter Ordner / Lokale Formulare (${customTemplates.length})">`;
    customTemplates.forEach(t => {
      const isSel = (t.id === activeTemplateKey) ? 'selected' : '';
      optionsHtml += `<option value="${t.id}" ${isSel}>📄 ${t.title} (${t.filename})</option>`;
    });
    optionsHtml += `</optgroup>`;
  }

  select.innerHTML = optionsHtml;
  if (countBadge) {
    const total = (typeof OFFICIAL_TEMPLATES !== 'undefined' ? Object.keys(OFFICIAL_TEMPLATES).length : 0) + customTemplates.length;
    countBadge.innerText = `${total} Vorlagen`;
  }
}

function updateFolderUIState() {
  const badge = document.getElementById("connectedFolderBadge");
  const syncBtn = document.getElementById("btnSyncFolder");
  if (appState && appState.connectedFolderName) {
    if (badge) {
      badge.style.display = "inline-flex";
      badge.innerHTML = `📁 Ordner: <strong>${appState.connectedFolderName}</strong> (${customTemplates.length} PDFs)`;
    }
    if (syncBtn) syncBtn.style.display = "inline-flex";
  } else {
    if (badge) badge.style.display = "none";
    if (syncBtn) syncBtn.style.display = "none";
  }
}

/**
 * Connect Local Folder (Modern File System Access API + Fallback)
 */
async function connectLocalFolder() {
  if ('showDirectoryPicker' in window) {
    try {
      const dirHandle = await window.showDirectoryPicker({ id: 'fachleiter_forms_dir', mode: 'read' });
      localDirectoryHandle = dirHandle;
      appState.connectedFolderName = dirHandle.name;
      saveState();
      await scanDirectoryHandle(dirHandle);
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.warn("showDirectoryPicker fallback triggered:", err);
        triggerFolderInputFallback();
      }
    }
  } else {
    triggerFolderInputFallback();
  }
}

function triggerFolderInputFallback() {
  let fileInput = document.getElementById("hiddenFolderPickerInput");
  if (!fileInput) {
    fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.id = "hiddenFolderPickerInput";
    fileInput.webkitdirectory = true;
    fileInput.directory = true;
    fileInput.multiple = true;
    fileInput.style.display = "none";
    document.body.appendChild(fileInput);
    fileInput.addEventListener("change", handleFolderInputSelection);
  }
  fileInput.click();
}

async function handleFolderInputSelection(event) {
  const files = Array.from(event.target.files).filter(f => f.name.toLowerCase().endsWith(".pdf"));
  if (files.length === 0) {
    showToast("Keine PDF-Dateien im ausgewählten Ordner gefunden!", "⚠️");
    return;
  }

  const folderName = files[0].webkitRelativePath ? files[0].webkitRelativePath.split('/')[0] : 'Formulare';
  appState.connectedFolderName = folderName;
  saveState();

  showToast(`Lese ${files.length} PDFs aus Ordner "${folderName}" ein...`, "⏳");
  customTemplates = [];

  for (const file of files) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = "";
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);
      const cleanId = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_");
      customTemplates.push({
        id: `custom_${cleanId}`,
        title: file.name.replace(/\.[^/.]+$/, ""),
        filename: file.name,
        pages: 1,
        base64: base64
      });
    } catch (e) {
      console.error("Error reading file:", file.name, e);
    }
  }

  updateTemplateDropdown();
  updateFolderUIState();
  showToast(`✅ ${customTemplates.length} Formulare aus Ordner "${folderName}" synchronisiert!`, "📁");
}

async function scanDirectoryHandle(dirHandle) {
  showToast(`Scanne Ordner "${dirHandle.name}"...`, "⏳");
  customTemplates = [];

  try {
    for await (const entry of dirHandle.values()) {
      if (entry.kind === 'file' && entry.name.toLowerCase().endsWith('.pdf')) {
        const file = await entry.getFile();
        const arrayBuffer = await file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        let binary = "";
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64 = btoa(binary);
        const cleanId = entry.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_");
        customTemplates.push({
          id: `custom_${cleanId}`,
          title: entry.name.replace(/\.[^/.]+$/, ""),
          filename: entry.name,
          pages: 1,
          base64: base64
        });
      }
    }

    updateTemplateDropdown();
    updateFolderUIState();
    showToast(`✅ ${customTemplates.length} PDF-Dateien synchronisiert!`, "📁");
  } catch (err) {
    console.error("Directory scan error:", err);
    showToast("Fehler beim Ordner-Scan: " + err.message, "❌");
  }
}

async function resyncConnectedFolder() {
  if (localDirectoryHandle) {
    await scanDirectoryHandle(localDirectoryHandle);
  } else {
    connectLocalFolder();
  }
}

async function loadPdfTemplate(key) {
  activeTemplateKey = key;
  pdfDocBytes = null;
  pdfJsDoc = null;
  formFieldMap = {};
  pdfFieldElements = {};

  showToast(`Formular "${key}" wird geladen...`, "⏳");
  
  let b64 = "";
  if (typeof OFFICIAL_TEMPLATES !== 'undefined' && OFFICIAL_TEMPLATES[key]) {
    b64 = OFFICIAL_TEMPLATES[key].base64;
  } else {
    const custom = customTemplates.find(t => t.id === key);
    if (custom) b64 = custom.base64;
  }

  if (!b64) {
    showToast("Formular-Daten nicht gefunden!", "⚠️");
    return;
  }

  try {
    const binStr = atob(b64);
    const len = binStr.length;
    pdfDocBytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      pdfDocBytes[i] = binStr.charCodeAt(i);
    }

    if (typeof pdfjsLib !== 'undefined') {
      try {
        if (pdfjsLib.GlobalWorkerOptions) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }
      } catch(e) {}

      pdfJsDoc = await pdfjsLib.getDocument({
        data: pdfDocBytes.buffer.slice(0),
        cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
        cMapPacked: true,
        isEvalSupported: false
      }).promise;

      currentPage = 1;
      totalPages = pdfJsDoc.numPages;
      
      await discoverAcroFormFields();
      await renderPage(currentPage);
      
      const tplName = (typeof OFFICIAL_TEMPLATES !== 'undefined' && OFFICIAL_TEMPLATES[key]) ? OFFICIAL_TEMPLATES[key].title : "Benutzerdefiniertes Formular";
      const titleEl = document.getElementById("pdfDocTitle");
      if (titleEl) titleEl.innerText = `${key.toUpperCase()} • ${tplName}`;
      showToast(`Formular "${key}" geladen (inkl. Dropdowns &amp; Textfeldern)!`, "✅");
    }
  } catch (err) {
    console.error("PDF Load Error:", err);
    showToast("Fehler beim Laden des PDF-Formulars: " + err.message, "❌");
  }
}

async function discoverAcroFormFields() {
  formFieldMap = {};
  if (!pdfDocBytes || typeof PDFLib === 'undefined') return;

  try {
    const pdfDoc = await PDFLib.PDFDocument.load(pdfDocBytes.slice(0), { ignoreEncryption: true });
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    fields.forEach(f => {
      const name = f.getName();
      const type = f.constructor.name;
      formFieldMap[name] = { name, type, field: f };
    });
  } catch(e) {
    console.warn("Could not discover AcroForm fields:", e);
  }
}

async function renderPage(pageNum) {
  if (!pdfJsDoc) return;
  const canvas = document.getElementById("pdfCanvas");
  const formLayer = document.getElementById("pdfFormLayer");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const page = await pdfJsDoc.getPage(pageNum);
  const viewport = page.getViewport({ scale: 1.35 });

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  const renderContext = {
    canvasContext: ctx,
    viewport: viewport
  };

  await page.render(renderContext).promise;

  // Clear & render interactive form overlay layer
  if (formLayer) {
    formLayer.innerHTML = "";
    formLayer.style.width = `${viewport.width}px`;
    formLayer.style.height = `${viewport.height}px`;

    try {
      const annotations = await page.getAnnotations();
      annotations.forEach(annot => {
        if (annot.subtype === 'Widget' && annot.fieldName) {
          const rect = annot.rect;
          const vRect = viewport.convertToViewportRectangle(rect);
          const vx = Math.min(vRect[0], vRect[2]);
          const vy = Math.min(vRect[1], vRect[3]);
          const vw = Math.abs(vRect[2] - vRect[0]);
          const vh = Math.abs(vRect[3] - vRect[1]);

          let inputElem;

          // 1. Choice / Dropdown / ComboBox fields
          if (annot.fieldType === 'Ch' || annot.combo || (annot.options && annot.options.length > 0)) {
            inputElem = document.createElement("select");
            inputElem.className = "pdf-form-field-select";

            let optionsList = annot.options || [];

            // If empty or only dummy option, enrich with Thuringian standard lists
            const fnLower = annot.fieldName.toLowerCase();
            if (optionsList.length <= 1 && (fnLower.includes("ausbildungsfach") || fnLower.includes("fach"))) {
              optionsList = [
                { exportValue: "--", displayValue: "-- Bitte wählen --" },
                ...THUERINGEN_SUBJECTS.map(s => ({ exportValue: s, displayValue: s }))
              ];
            }

            optionsList.forEach(opt => {
              const optElem = document.createElement("option");
              if (typeof opt === 'object' && opt !== null) {
                optElem.value = opt.exportValue !== undefined ? opt.exportValue : (opt.value || opt.displayValue);
                optElem.innerText = opt.displayValue || opt.label || opt.value || opt.exportValue;
              } else {
                optElem.value = String(opt);
                optElem.innerText = String(opt);
              }
              inputElem.appendChild(optElem);
            });

            // Restore saved or auto value
            const savedVal = appState.pdfFormValues ? appState.pdfFormValues[annot.fieldName] : undefined;
            if (savedVal !== undefined) {
              inputElem.value = savedVal;
            } else if (annot.fieldValue) {
              inputElem.value = annot.fieldValue;
            }

            inputElem.addEventListener('change', (e) => {
              if (!appState.pdfFormValues) appState.pdfFormValues = {};
              appState.pdfFormValues[annot.fieldName] = e.target.value;
              saveState();
            });

          // 2. Multiline Text Areas
          } else if (annot.fieldType === 'Tx' && (vh > 36 || annot.multiline)) {
            inputElem = document.createElement("textarea");
            inputElem.className = "pdf-form-field-textarea";

            const savedVal = appState.pdfFormValues ? appState.pdfFormValues[annot.fieldName] : undefined;
            if (savedVal !== undefined) {
              inputElem.value = savedVal;
            } else if (annot.fieldValue) {
              inputElem.value = annot.fieldValue;
            }

            inputElem.addEventListener('input', (e) => {
              if (!appState.pdfFormValues) appState.pdfFormValues = {};
              appState.pdfFormValues[annot.fieldName] = e.target.value;
              saveState();
            });

          // 3. Checkboxes & Radio Buttons
          } else if (annot.fieldType === 'Btn' && (annot.checkBox || annot.radioButton)) {
            inputElem = document.createElement("input");
            inputElem.type = "checkbox";
            inputElem.className = "pdf-form-field-input";

            const savedVal = appState.pdfFormValues ? appState.pdfFormValues[annot.fieldName] : undefined;
            if (savedVal !== undefined) {
              inputElem.checked = Boolean(savedVal);
            } else if (annot.fieldValue) {
              inputElem.checked = (annot.fieldValue === 'On' || annot.fieldValue === true);
            }

            inputElem.addEventListener('change', (e) => {
              if (!appState.pdfFormValues) appState.pdfFormValues = {};
              appState.pdfFormValues[annot.fieldName] = e.target.checked;
              saveState();
            });

          // 4. Standard Single-line Text Inputs
          } else {
            inputElem = document.createElement("input");
            inputElem.type = "text";
            inputElem.className = "pdf-form-field-input";

            const savedVal = appState.pdfFormValues ? appState.pdfFormValues[annot.fieldName] : undefined;
            if (savedVal !== undefined) {
              inputElem.value = savedVal;
            } else if (annot.fieldValue) {
              inputElem.value = annot.fieldValue;
            }

            inputElem.addEventListener('input', (e) => {
              if (!appState.pdfFormValues) appState.pdfFormValues = {};
              appState.pdfFormValues[annot.fieldName] = e.target.value;
              saveState();
            });
          }

          inputElem.id = `field_${annot.fieldName}`;
          inputElem.dataset.fieldName = annot.fieldName;
          inputElem.style.left = `${vx}px`;
          inputElem.style.top = `${vy}px`;
          inputElem.style.width = `${vw}px`;
          inputElem.style.height = `${vh}px`;

          pdfFieldElements[annot.fieldName] = inputElem;
          formLayer.appendChild(inputElem);
        }
      });
    } catch(err) {
      console.warn("Annotation rendering notice:", err);
    }
  }

  const pageIndicator = document.getElementById("pdfPageIndicator");
  if (pageIndicator) pageIndicator.innerText = `Seite ${pageNum} von ${totalPages}`;
}

function prevPdfPage() {
  if (currentPage > 1) {
    currentPage--;
    renderPage(currentPage);
  }
}

function nextPdfPage() {
  if (currentPage < totalPages) {
    currentPage++;
    renderPage(currentPage);
  }
}

function setFieldValue(name, val) {
  if (!appState.pdfFormValues) appState.pdfFormValues = {};
  appState.pdfFormValues[name] = val;

  const elem = pdfFieldElements[name] || document.querySelector(`[data-field-name="${name}"]`);
  if (elem) {
    if (elem.type === 'checkbox') elem.checked = Boolean(val);
    else {
      elem.value = val || '';
      // If it is a select and value not in options, try matching case-insensitively or adding
      if (elem.tagName === 'SELECT' && elem.value !== val && val) {
        let found = false;
        for (let i = 0; i < elem.options.length; i++) {
          const opt = elem.options[i];
          if (opt.value.toLowerCase() === String(val).toLowerCase() || opt.innerText.toLowerCase().includes(String(val).toLowerCase())) {
            elem.selectedIndex = i;
            appState.pdfFormValues[name] = opt.value;
            found = true;
            break;
          }
        }
        if (!found) {
          const newOpt = document.createElement("option");
          newOpt.value = val;
          newOpt.innerText = val;
          elem.appendChild(newOpt);
          elem.value = val;
        }
      }
    }
  }
}

async function applyAutofill() {
  const cur = getCurrentLAA();
  if (!cur) return;
  showToast(`Übertrage Stammdaten für ${cur.name}...`, "⚡");

  if (!appState.pdfFormValues) appState.pdfFormValues = {};

  let filledCount = 0;
  const getValForField = (fName) => {
    const fn = fName.toLowerCase();
    
    // Lehramt Dropdown mapping (GS, RS, GY, BBS, FÖP)
    if (fn.includes("drlehramt") || (fn.includes("lehramt") && fn.startsWith("lehramtsanwaerter.dr"))) {
      const st = (cur.schoolType || "").toLowerCase();
      if (st.includes("regel")) return "RS";
      if (st.includes("gym")) return "GY";
      if (st.includes("grund")) return "GS";
      if (st.includes("beruf")) return "BBS";
      if (st.includes("förder") || st.includes("foerder")) return "FÖP";
      return "RS";
    }

    // Ausbildungsfach ComboBox (Prüfungstag / Modus 1/2)
    if (fn.includes("drausbildungsfachpraktischepruefung") || fn.includes("drausbildungsfachmuendlichepruefung")) {
      return "1. Prüfungstag | Erstes Ausbildungsfach";
    }

    if (fn.includes("drausbildungsfach") || (fn.includes("ausbildungsfach") && fn.includes("dr"))) {
      return cur.subject1 || "Mathematik";
    }

    if (fn.includes("drhandlungsfeld")) {
      return "Didaktik und Methodik";
    }

    if (fn.includes("kandidat") || fn.includes("prüfling") || fn.includes("anwärter") || fn.includes("pruefling") || fn.includes("name_anwaerter") || fn.includes("name_kandidat") || fn.includes("lehramtsanwaerter.namevorname")) {
      return cur.name || "";
    }
    if (fn.includes("geburt") || fn.includes("dategeburtsdatum")) {
      return cur.birthDate ? new Date(cur.birthDate).toLocaleDateString('de-DE') : "";
    }
    if (fn === "name" || fn.startsWith("name_") || fn.endsWith("_name") || fn.includes("nachname")) {
      return cur.name || "";
    }
    if (fn.includes("vorname")) {
      const parts = (cur.name || "").split(" ");
      return parts.length > 1 ? parts[0] : "";
    }
    if (fn.includes("schule") || fn.includes("ausbildungsschule") || fn.includes("seminarschule") || fn.includes("dienststelle") || fn.includes("schuleanschrift")) {
      return cur.school || "";
    }
    if (fn.includes("fach_1") || fn.includes("fach1") || fn.includes("ausbildungsfach_1") || fn.includes("erstfach") || fn.includes("unterrichtsfach") || fn.includes("lernfeld")) {
      return cur.subject1 || "";
    }
    if (fn.includes("fach_2") || fn.includes("fach2") || fn.includes("ausbildungsfach_2") || fn.includes("zweitfach")) {
      return cur.subject2 || "";
    }
    if (fn.includes("fachleiter") || fn.includes("ausbilder") || fn.includes("erstgutachter") || fn.includes("ausschussvorsitzender") || fn.includes("mentor")) {
      return cur.mentor || (appState && appState.mentorName) || "Fachleitung";
    }
    if (fn.includes("ort") || fn.includes("ausstellungsort")) {
      return "Erfurt";
    }
    if (fn.includes("datum") || fn.includes("ausstellungsdatum") || fn.includes("pruefungsdatum") || fn.includes("dateanddayofweek")) {
      return new Date().toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' });
    }
    if (fn.includes("thema") || fn.includes("themaderlehrprobe")) {
      return (cur.visits && cur.visits.length > 0) ? cur.visits[cur.visits.length - 1].topic : "Prüfungsunterricht";
    }
    return null;
  };

  // Populate from discovered fields
  Object.keys(formFieldMap).forEach(fieldName => {
    const val = getValForField(fieldName);
    if (val !== null) {
      setFieldValue(fieldName, val);
      filledCount++;
    }
  });

  // Also update currently rendered DOM elements (inputs, selects, textareas)
  document.querySelectorAll(".pdf-form-field-input, .pdf-form-field-select, .pdf-form-field-textarea").forEach(input => {
    const fn = input.dataset.fieldName;
    if (fn) {
      const val = getValForField(fn);
      if (val !== null) {
        setFieldValue(fn, val);
        filledCount++;
      }
    }
  });

  saveState();
  showToast(`✅ ${filledCount} Stammdaten- & Dropdown-Felder präzise eingetragen!`, "🎯");
}

function harvestLiveFormValues() {
  if (!appState.pdfFormValues) appState.pdfFormValues = {};
  document.querySelectorAll(".pdf-form-field-input, .pdf-form-field-select, .pdf-form-field-textarea").forEach(elem => {
    const fn = elem.dataset.fieldName;
    if (fn) {
      if (elem.type === 'checkbox') {
        appState.pdfFormValues[fn] = elem.checked;
      } else {
        appState.pdfFormValues[fn] = elem.value;
      }
    }
  });
  saveState();
}

async function generateFilledPdfDoc() {
  if (!pdfDocBytes || typeof PDFLib === 'undefined') return null;

  harvestLiveFormValues();

  const pdfDoc = await PDFLib.PDFDocument.load(pdfDocBytes.slice(0), { ignoreEncryption: true });
  const form = pdfDoc.getForm();

  let standardFont = null;
  try {
    standardFont = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
  } catch(e) {}

  // Force PDF Viewers (Apple Preview, Adobe Reader, Chrome, Edge) to render fresh values
  try {
    form.acroForm.dict.set(PDFLib.PDFName.of('NeedAppearances'), PDFLib.PDFBool.True);
  } catch(e) {}

  // Clean stale pre-compiled appearance streams (/AP) on all fields & widgets so viewers never show cached "Bitte wählen"
  try {
    const allFields = form.getFields();
    allFields.forEach(f => {
      try {
        if (f.acroField && f.acroField.dict) {
          f.acroField.dict.delete(PDFLib.PDFName.of('AP'));
        }
        if (f.acroField && f.acroField.getWidgets) {
          f.acroField.getWidgets().forEach(w => {
            if (w.dict) w.dict.delete(PDFLib.PDFName.of('AP'));
          });
        }
      } catch(e) {}
    });
  } catch(e) {}

  if (appState.pdfFormValues) {
    for (const [fieldName, val] of Object.entries(appState.pdfFormValues)) {
      if (val === undefined || val === null || val === '' || val === '--') continue;

      try {
        const field = form.getField(fieldName);
        const type = field.constructor.name;
        const strVal = String(val).trim();

        if (type === 'PDFCheckBox') {
          if (val === true || val === 'On') field.check();
          else field.uncheck();
        } else if (type === 'PDFDropdown') {
          let selected = false;

          // 1. Try exact selection
          try {
            const existingOpts = field.getOptions();
            if (!existingOpts.includes(strVal)) {
              field.addOptions([strVal]);
            }
            field.select(strVal);
            selected = true;
          } catch(err) {}

          // 2. Try matching display or export value
          if (!selected) {
            try {
              const opts = field.getOptions();
              const match = opts.find(o => o.toLowerCase() === strVal.toLowerCase() || o.toLowerCase().includes(strVal.toLowerCase()) || strVal.toLowerCase().includes(o.toLowerCase()));
              if (match) {
                field.select(match);
                selected = true;
              } else {
                field.addOptions([strVal]);
                field.select(strVal);
                selected = true;
              }
            } catch(err2) {}
          }

          // 3. Directly set /V and /DV in AcroForm dictionary as bulletproof fallback
          try {
            if (field.acroField && field.acroField.dict) {
              field.acroField.dict.set(PDFLib.PDFName.of('V'), PDFLib.PDFString.of(strVal));
              field.acroField.dict.set(PDFLib.PDFName.of('DV'), PDFLib.PDFString.of(strVal));
            }
          } catch(err3) {}

        } else if (type === 'PDFTextField' || field.setText) {
          field.setText(strVal);
        }
      } catch(e) {
        console.warn("Field export notice:", fieldName, e);
      }
    }
  }

  // Generate clean, sharp appearance streams for all updated fields
  try {
    if (standardFont) {
      form.updateFieldAppearances(standardFont);
    } else {
      form.updateFieldAppearances();
    }
  } catch(e) {}

  return await pdfDoc.save();
}

async function downloadFilledPdf() {
  showToast("Generiere PDF mit allen Eingaben & Dropdown-Auswahlen...", "⏳");
  const bytes = await generateFilledPdfDoc();
  if (!bytes) {
    showToast("Fehler beim Erstellen des PDFs!", "❌");
    return;
  }

  const cur = getCurrentLAA() || {};
  const candidateName = cur.name ? cur.name.replace(/[^a-zA-Z0-9_äöüÄÖÜß]/g, '_') : 'Kandidat';
  const formId = activeTemplateKey.replace(/[^a-zA-Z0-9_]/g, '_');
  const filename = `${formId}_${candidateName}.pdf`;

  const blob = new Blob([bytes], { type: "application/pdf" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  showToast(`PDF "${filename}" erfolgreich heruntergeladen!`, "💾");
}

async function printFilledPdf() {
  showToast("Bereite Druckversion mit Ihren Eingaben vor...", "⏳");
  const bytes = await generateFilledPdfDoc();
  if (!bytes) {
    showToast("Fehler beim Erstellen der Druckversion!", "❌");
    return;
  }

  const blob = new Blob([bytes], { type: 'application/pdf' });
  const blobUrl = URL.createObjectURL(blob);
  const printWindow = window.open(blobUrl, '_blank');
  if (printWindow) {
    printWindow.focus();
    setTimeout(() => {
      try { printWindow.print(); } catch(e) {}
    }, 500);
  }
}
