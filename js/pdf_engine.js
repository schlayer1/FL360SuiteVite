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
      showToast(`Formular "${key}" erfolgreich geladen!`, "✅");
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

async function applyAutofill() {
  if (!pdfDocBytes || typeof PDFLib === 'undefined') {
    showToast("Bitte zuerst ein Formular laden!", "⚠️");
    return;
  }

  const cur = getCurrentLAA();
  if (!cur) return;
  showToast(`Übertrage Stammdaten für ${cur.name}...`, "⚡");

  try {
    const pdfDoc = await PDFLib.PDFDocument.load(pdfDocBytes.slice(0), { ignoreEncryption: true });
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    let filledCount = 0;

    const getValForField = (fName) => {
      const fn = fName.toLowerCase();
      
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
      if (fn.includes("bemerkungen") || fn.includes("begruendungderpunktevergabe")) {
        const area = document.getElementById("gutachtenTextArea");
        return area ? area.value : "";
      }
      return null;
    };

    fields.forEach(field => {
      const type = field.constructor.name;
      const name = field.getName();
      const autoVal = getValForField(name);

      if (autoVal !== null) {
        try {
          if (type === 'PDFTextField' || field.setText) {
            field.setText(String(autoVal));
            filledCount++;
          }
        } catch(e) {}
      }
    });

    const modifiedBytes = await pdfDoc.save();
    pdfDocBytes = modifiedBytes;
    pdfJsDoc = await pdfjsLib.getDocument({ data: modifiedBytes.buffer.slice(0) }).promise;
    await renderPage(currentPage);
    
    showToast(`${filledCount} amtliche Stammdatenfelder präzise ausgefüllt!`, "🎯");
  } catch(err) {
    console.error("Autofill error:", err);
    showToast("Fehler beim Autofill: " + err.message, "❌");
  }
}

async function downloadFilledPdf() {
  if (!pdfDocBytes) {
    showToast("Kein aktives Dokument zum Herunterladen!", "⚠️");
    return;
  }
  const cur = getCurrentLAA() || {};
  const candidateName = cur.name ? cur.name.replace(/[^a-zA-Z0-9_äöüÄÖÜß]/g, '_') : 'Kandidat';
  const formId = activeTemplateKey.replace(/[^a-zA-Z0-9_]/g, '_');
  const filename = `${formId}_${candidateName}.pdf`;

  const blob = new Blob([pdfDocBytes], { type: "application/pdf" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  showToast(`PDF "${filename}" erfolgreich gespeichert!`, "💾");
}

async function printFilledPdf() {
  if (!pdfDocBytes) {
    showToast("Kein Dokument zum Drucken vorhanden!", "⚠️");
    return;
  }
  const blob = new Blob([pdfDocBytes], { type: 'application/pdf' });
  const blobUrl = URL.createObjectURL(blob);
  const printWindow = window.open(blobUrl, '_blank');
  if (printWindow) {
    printWindow.focus();
    setTimeout(() => {
      try { printWindow.print(); } catch(e) {}
    }, 500);
  }
}
