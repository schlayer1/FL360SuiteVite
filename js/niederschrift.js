/**
 * AUTHENTISCHE PRÜFUNGS-NIEDERSCHRIFT & 15-PUNKTE-SYSTEM ENGINE
 */

function initAuthenticNiederschrift() {
  const cur = getCurrentLAA();
  if (cur) {
    const nameEl = document.getElementById("nsExamineeNameDisplay");
    const typeEl = document.getElementById("nsExamineeTypeSelect");
    const genderEl = document.getElementById("nsExamineeGenderSelect");
    if (nameEl) nameEl.innerText = cur.name;
    if (typeEl) typeEl.value = cur.type || "laa";
    if (genderEl) genderEl.value = cur.gender || "f";
  }

  nsRenderCategoryTags();
  nsRenderCategoryFilterPills();
  nsRenderRasterView();
  nsUpdateCalculationsAndProgress();
}

function nsChangeActiveExam(val) {
  nsState.activeExam = val;
  nsState.selections = {};
  nsState.categoryFilter = "all";
  nsState.editableText = "";
  nsState.lastAutoText = "";
  
  const area = document.getElementById("nsEditableTextarea");
  if (area) area.value = "";

  nsRenderCategoryTags();
  nsRenderCategoryFilterPills();
  nsRenderRasterView();
  nsUpdateCalculationsAndProgress();
}

function nsSwitchTab(tabName, btn) {
  document.querySelectorAll(".ns-view-pane").forEach(p => p.style.display = "none");
  const target = document.getElementById("nsView-" + tabName);
  if (target) target.style.display = "block";

  const btnIds = { 'protokoll': 'btnNsTabProtokoll', 'raster': 'btnNsTabRaster', 'editor': 'btnNsTabEditor' };
  Object.entries(btnIds).forEach(([tKey, bId]) => {
    const b = document.getElementById(bId);
    if (b) {
      if (tKey === tabName) {
        b.classList.add('active');
        b.style.background = '#2563eb';
        b.style.color = '#ffffff';
      } else {
        b.classList.remove('active');
        b.style.background = 'transparent';
        b.style.color = '#cbd5e1';
      }
    }
  });

  if (tabName === 'raster') {
    nsRenderCategoryFilterPills();
    nsRenderRasterView();
  }
  if (tabName === 'editor') {
    nsGenerateDynamicText();
  }
}

function nsSetCategoryFilter(catId) {
  nsState.categoryFilter = catId;
  nsRenderCategoryFilterPills();
  nsRenderRasterView();
}

function nsRenderCategoryFilterPills() {
  const wrap = document.getElementById("nsCategoryFilterPillsWrap");
  if (!wrap || !EXAM_RUBRIC_DATA[nsState.activeExam]) return;

  const cats = EXAM_RUBRIC_DATA[nsState.activeExam].categories || [];
  let html = `
    <button class="ns-cat-filter-btn ${nsState.categoryFilter === 'all' ? 'active' : ''}" onclick="nsSetCategoryFilter('all')">
      🌐 Alle Anforderungen (${cats.length})
    </button>
  `;

  cats.forEach(c => {
    const shortName = c.shortName || c.title.replace('Anforderung: ', '');
    const isSel = nsState.categoryFilter === c.id;
    html += `
      <button class="ns-cat-filter-btn ${isSel ? 'active' : ''}" onclick="nsSetCategoryFilter('${c.id}')">
        ${shortName}
      </button>
    `;
  });

  wrap.innerHTML = html;

  // Update gap finder buttons
  const b1 = document.getElementById("nsBtnGapFinder");
  const b2 = document.getElementById("nsBtnGapFinderRaster");
  const label = nsState.focusMode ? '🔍 Lücken-Finder: AKTIV' : '🔍 Lücken-Finder: AUS';
  const bg = nsState.focusMode ? '#1e3a8a' : '#fef9c3';
  const fg = nsState.focusMode ? '#ffffff' : '#854d0e';
  const border = nsState.focusMode ? '#3b82f6' : '#eab308';
  
  [b1, b2].forEach(b => {
    if (b) {
      b.innerText = label;
      b.style.background = bg;
      b.style.color = fg;
      b.style.borderColor = border;
    }
  });
}

function nsToggleGapFinder() {
  nsState.focusMode = !nsState.focusMode;
  nsRenderCategoryFilterPills();
  nsRenderRasterView();
  showToast(nsState.focusMode ? "Lücken-Finder aktiviert: Unbewertete Indikatoren gefiltert" : "Lücken-Finder deaktiviert: Alle Indikatoren sichtbar", "🔍");
}

function nsToggleFocusMode() {
  nsToggleGapFinder();
}

function nsToggleCategory(catId) {
  nsState.openCategories[catId] = nsState.openCategories[catId] === false ? true : false;
  nsRenderRasterView();
}

function nsToggleProfileView() {
  nsState.showProfile = !nsState.showProfile;
  const card = document.getElementById("nsProfileCard");
  if (card) {
    card.style.display = nsState.showProfile ? "block" : "none";
    if (nsState.showProfile) nsRenderProfileBars();
  }
}

function nsHandlePointSelect(indId, point) {
  if (nsState.selections[indId] === point) {
    delete nsState.selections[indId];
  } else {
    nsState.selections[indId] = point;
  }
  nsRenderRasterView();
  nsUpdateCalculationsAndProgress();
  nsGenerateDynamicText();
}

function nsCalculateCategoryAverage(cat) {
  const points = [];
  cat.indicators.forEach(ind => {
    if (nsState.selections[ind.id] !== undefined) {
      points.push(nsState.selections[ind.id]);
    }
  });
  if (points.length === 0) return null;
  const sum = points.reduce((a, b) => a + b, 0);
  return (sum / points.length).toFixed(1);
}

function nsCalculateTotalAverage() {
  const cats = EXAM_RUBRIC_DATA[nsState.activeExam] ? EXAM_RUBRIC_DATA[nsState.activeExam].categories : [];
  let totalSum = 0;
  let totalCount = 0;

  cats.forEach(c => {
    c.indicators.forEach(ind => {
      if (nsState.selections[ind.id] !== undefined) {
        totalSum += nsState.selections[ind.id];
        totalCount++;
      }
    });
  });

  if (totalCount === 0) return null;
  return (totalSum / totalCount).toFixed(2);
}

function nsGetColorForAvg(avg) {
  if (avg >= 13.5) return "#166534"; // Sehr gut
  if (avg >= 10.5) return "#065f46"; // Gut
  if (avg >= 7.5) return "#854d0e";  // Befriedigend
  if (avg >= 4.5) return "#9a3412";  // Ausreichend
  if (avg >= 1.5) return "#991b1b";  // Mangelhaft
  return "#475569";                  // Ungenügend
}

function nsUpdateCalculationsAndProgress() {
  const totalAvg = nsCalculateTotalAverage();
  const avgValEl = document.getElementById("nsTotalAverageVal");
  if (avgValEl) {
    avgValEl.innerText = totalAvg !== null ? `${totalAvg} Pkt.` : "–";
    if (totalAvg !== null) {
      avgValEl.style.color = nsGetColorForAvg(parseFloat(totalAvg));
    } else {
      avgValEl.style.color = "#38bdf8";
    }
  }

  if (nsState.showProfile) nsRenderProfileBars();
}

function nsRenderRasterView() {
  const container = document.getElementById("nsCategoriesRasterContainer");
  if (!container || !EXAM_RUBRIC_DATA[nsState.activeExam]) return;

  const allCategories = EXAM_RUBRIC_DATA[nsState.activeExam].categories || [];
  const categories = nsState.categoryFilter === 'all' 
    ? allCategories 
    : allCategories.filter(c => c.id === nsState.categoryFilter);

  let html = "";

  categories.forEach(cat => {
    const catAvg = nsCalculateCategoryAverage(cat);
    const isOpen = nsState.openCategories[cat.id] !== false;
    const catTotal = cat.indicators.length;
    const catAnswered = cat.indicators.filter(i => nsState.selections[i.id] !== undefined).length;

    const taggedEntries = Array.isArray(nsState.protocolEntries) ? nsState.protocolEntries.filter(e => {
      const eTags = Array.isArray(e.tags) ? e.tags : [];
      return eTags.includes(cat.id);
    }) : [];

    const visibleIndicators = nsState.focusMode 
      ? cat.indicators.filter(ind => nsState.selections[ind.id] === undefined)
      : cat.indicators;

    if (nsState.focusMode && visibleIndicators.length === 0) {
      html += `
        <div class="card" style="margin-bottom:12px; background:#f0fdf4; border:1px solid #86efac; padding:12px 18px; display:flex; justify-content:space-between; align-items:center; border-radius:10px;">
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="color:#16a34a; font-weight:bold; font-size:1.1rem;">✓</span>
            <strong style="color:#166534; font-size:0.92rem;">${cat.title}</strong>
            <span style="font-size:0.78rem; color:#15803d;">(Alle ${catTotal} Indikatoren vollständig bewertet)</span>
            ${taggedEntries.length > 0 ? `<span class="badge-pill" style="background:#fef3c7; color:#92400e; font-size:0.7rem; font-weight:700;">🏷️ ${taggedEntries.length} Notiz${taggedEntries.length > 1 ? 'en' : ''}</span>` : ''}
          </div>
          <span style="font-size:0.88rem; font-weight:800; color:#16a34a; background:#dcfce7; padding:4px 10px; border-radius:6px;">${catAvg} Pkt.</span>
        </div>
      `;
      return;
    }

    const shortCatName = cat.shortName || cat.title.replace('Anforderung: ', '');

    html += `
      <div class="card" style="margin-bottom:16px; border:1px solid #cbd5e1; border-radius:10px; overflow:hidden; padding:0; background:#ffffff; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
        
        <div style="background:#f8fafc; padding:12px 18px; display:flex; justify-content:space-between; align-items:center; cursor:pointer; user-select:none; border-bottom:${isOpen ? '1px solid #e2e8f0' : 'none'};" onclick="nsToggleCategory('${cat.id}')">
          <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
            <span style="font-size:0.85rem; color:#64748b;">${isOpen ? '▼' : '▶'}</span>
            <strong style="font-size:0.95rem; color:#0f172a;">${cat.title}</strong>
            <span class="badge-pill" style="background:#e2e8f0; color:#334155; font-size:0.72rem; font-weight:700;">${catAnswered}/${catTotal}</span>
            ${taggedEntries.length > 0 ? `<span class="badge-pill" style="background:#fef3c7; color:#92400e; font-size:0.72rem; font-weight:700;">🏷️ ${taggedEntries.length} Beobachtungs-Notiz${taggedEntries.length > 1 ? 'en' : ''}</span>` : ''}
          </div>

          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:0.88rem; font-weight:800; color:${catAvg ? nsGetColorForAvg(parseFloat(catAvg)) : '#94a3b8'}; background:#f1f5f9; padding:4px 10px; border-radius:6px; border:1px solid #e2e8f0;">
              ${catAvg !== null ? catAvg + ' Pkt.' : '–'}
            </span>
          </div>
        </div>

        <div id="nsCatBody-${cat.id}" style="display:${isOpen ? 'flex' : 'none'}; flex-direction:column; gap:16px; padding:16px; background:#f8fafc;">
          
          ${taggedEntries.length > 0 ? `
            <div style="background:#fffbeb; border:1px solid #fde68a; border-radius:8px; padding:12px 14px;">
              <div style="font-size:0.75rem; font-weight:700; color:#b45309; text-transform:uppercase; margin-bottom:8px; display:flex; align-items:center; gap:6px;">
                ⏱️ Beobachtungen aus der Mitschrift zu „${shortCatName}“:
              </div>
              <div style="display:flex; flex-direction:column; gap:6px;">
                ${taggedEntries.map(e => `
                  <div style="background:#ffffff; border:1px solid #e2e8f0; border-left:3px solid #f59e0b; padding:8px 12px; border-radius:6px; font-size:0.82rem; display:flex; align-items:flex-start; gap:8px;">
                    <span style="font-family:monospace; font-size:0.75rem; font-weight:700; background:#f1f5f9; padding:2px 6px; border-radius:4px; color:#475569; flex-shrink:0;">[${e.time}]</span>
                    <span style="color:#1e293b; line-height:1.4;">${e.text}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          ${visibleIndicators.map((ind, iIdx) => {
            const selectedPoint = nsState.selections[ind.id];
            const colIndex = selectedPoint !== undefined ? POINT_MAPPING[selectedPoint] : null;

            return `
              <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:16px; box-shadow:0 1px 2px rgba(0,0,0,0.04);">
                
                <div style="font-weight:700; font-size:0.9rem; color:#0f172a; margin-bottom:12px; line-height:1.45;">
                  ${nsParseDynamicText(ind.name)}
                </div>

                <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:12px;">
                  ${POINT_GROUPS.map((group, gIdx) => {
                    const colors = COLUMN_COLORS[gIdx];
                    return `
                      <div class="ns-point-group-wrap">
                        ${group.map(pt => {
                          const isSelected = selectedPoint === pt;
                          return `
                            <button type="button" onclick="nsHandlePointSelect('${ind.id}', ${pt})" title="${pt} Punkte"
                              class="ns-point-btn ${isSelected ? 'selected' : ''}"
                              style="
                                background:${isSelected ? colors.activeBg : 'transparent'};
                                color:${isSelected ? colors.activeText : '#334155'};
                              "
                            >
                              ${pt}
                            </button>
                          `;
                        }).join('')}
                      </div>
                    `;
                  }).join('')}
                </div>

                <div style="min-height:36px; display:flex; align-items:center;">
                  ${selectedPoint !== undefined ? `
                    <div style="width:100%; font-size:0.83rem; padding:10px 14px; border-radius:6px; background:#f8fafc; border:1px solid #cbd5e1; color:#0f172a; line-height:1.5;">
                      <span style="font-weight:800; color:#2563eb; margin-right:6px;">${selectedPoint} Punkte:</span>
                      „${nsParseDynamicText(ind.grades[colIndex])}“
                    </div>
                  ` : `
                    <div style="font-size:0.78rem; color:#94a3b8; font-style:italic; padding:4px 0;">
                      Noch keine Bewertung ausgewählt (Wählen Sie eine Punktzahl von 0 bis 15)
                    </div>
                  `}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function nsRenderProfileBars() {
  const container = document.getElementById("nsProfileBarsContainer");
  if (!container || !EXAM_RUBRIC_DATA[nsState.activeExam]) return;

  const cats = EXAM_RUBRIC_DATA[nsState.activeExam].categories || [];
  let html = "";

  cats.forEach(cat => {
    const avg = nsCalculateCategoryAverage(cat);
    const numAvg = avg !== null ? parseFloat(avg) : 0;
    const percent = Math.min(100, Math.max(0, (numAvg / 15) * 100));
    const color = nsGetColorForAvg(numAvg);

    html += `
      <div>
        <div style="display:flex; justify-content:space-between; font-size:0.84rem; font-weight:600; margin-bottom:4px;">
          <span>${cat.title}</span>
          <span style="color:${avg !== null ? color : '#94a3b8'}; font-weight:700;">${avg !== null ? avg + ' / 15 Pkt.' : '–'}</span>
        </div>
        <div style="background:#e2e8f0; height:10px; border-radius:5px; overflow:hidden;">
          <div style="background:${color}; width:${percent}%; height:100%; transition:width 0.3s ease;"></div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function nsGetExamineeTerm() {
  const typeSelect = document.getElementById("nsExamineeTypeSelect");
  const cur = getCurrentLAA() || {};
  const type = typeSelect ? typeSelect.value : (cur.type || "laa");
  if (type === "quereinsteiger") return "Quereinsteiger";
  if (type === "anwaerter") return "Anwärter";
  return "Lehramtsanwärter";
}

function nsParseDynamicText(text) {
  if (!text) return "";
  const cur = getCurrentLAA() || {};
  const genderSelect = document.getElementById("nsExamineeGenderSelect");
  const gender = genderSelect ? genderSelect.value : (cur.gender || "f");
  const isFemale = gender === "f";
  const examineeTerm = nsGetExamineeTerm();
  const lastName = cur.name || "Kandidat";

  let t = text;
  if (isFemale) {
    t = t.replace(/\bDer Lehramtsanwärter\b/g, `Die ${examineeTerm}in Frau ${lastName}`);
    t = t.replace(/\bder Lehramtsanwärter\b/g, `die ${examineeTerm}in Frau ${lastName}`);
    t = t.replace(/\bDer LAA\b/g, `Die ${examineeTerm}in Frau ${lastName}`);
    t = t.replace(/\bder LAA\b/g, `die ${examineeTerm}in Frau ${lastName}`);
    t = t.replace(/\bdes Lehramtsanwärters\b/g, `der ${examineeTerm}in Frau ${lastName}`);
    t = t.replace(/\bdem Lehramtsanwärter\b/g, `der ${examineeTerm}in Frau ${lastName}`);
    t = t.replace(/\bden Lehramtsanwärter\b/g, `die ${examineeTerm}in Frau ${lastName}`);
    t = t.replace(/\bseine\b/g, "ihre");
    t = t.replace(/\bsein\b/g, "ihr");
    t = t.replace(/\bseiner\b/g, "ihrer");
    t = t.replace(/\bseinem\b/g, "ihrem");
    t = t.replace(/\bseinen\b/g, "ihre");
    t = t.replace(/\ber\b/g, "sie");
    t = t.replace(/\bihm\b/g, "ihr");
    t = t.replace(/\bihn\b/g, "sie");
  } else {
    t = t.replace(/\bDer Lehramtsanwärter\b/g, `Der ${examineeTerm} Herr ${lastName}`);
    t = t.replace(/\bder Lehramtsanwärter\b/g, `der ${examineeTerm} Herr ${lastName}`);
    t = t.replace(/\bDer LAA\b/g, `Der ${examineeTerm} Herr ${lastName}`);
    t = t.replace(/\bder LAA\b/g, `der ${examineeTerm} Herr ${lastName}`);
    t = t.replace(/\bdes Lehramtsanwärters\b/g, `des ${examineeTerm}s Herr ${lastName}`);
    t = t.replace(/\bdem Lehramtsanwärter\b/g, `dem ${examineeTerm} Herr ${lastName}`);
    t = t.replace(/\bden Lehramtsanwärter\b/g, `den ${examineeTerm} Herr ${lastName}`);
  }
  return t;
}

function nsHandleGenderChange(val) {
  const cur = getCurrentLAA();
  if (cur) {
    cur.gender = val;
    saveState();
  }
  nsRenderRasterView();
  nsGenerateDynamicText();
}

function nsHandleTypeChange(val) {
  const cur = getCurrentLAA();
  if (cur) {
    cur.type = val;
    saveState();
  }
  nsRenderRasterView();
  nsGenerateDynamicText();
}

function nsGenerateDynamicText() {
  const cats = EXAM_RUBRIC_DATA[nsState.activeExam] ? EXAM_RUBRIC_DATA[nsState.activeExam].categories : [];
  let sentences = [];

  cats.forEach(category => {
    category.indicators.forEach(indicator => {
      const selectedPoint = nsState.selections[indicator.id];
      if (selectedPoint !== undefined) {
        const colIndex = POINT_MAPPING[selectedPoint];
        const textSnippet = indicator.grades[colIndex];
        if (textSnippet) {
          const indName = nsParseDynamicText(indicator.name);
          const indGrade = nsParseDynamicText(textSnippet.trim());
          let fullSentence = `${indName} ${indGrade}`.trim();
          if (!fullSentence.endsWith('.') && !fullSentence.endsWith('!') && !fullSentence.endsWith('?')) {
            fullSentence += '.';
          }
          fullSentence = fullSentence.replace(/\.\./g, '.');
          sentences.push(fullSentence);
        }
      }
    });
  });

  const newGeneratedText = sentences.join(" ");
  const area = document.getElementById("nsEditableTextarea");
  
  if (newGeneratedText !== nsState.lastAutoText) {
    if (nsState.editableText !== nsState.lastAutoText && (nsState.editableText || "").trim() !== "") {
      nsState.backupText = nsState.editableText;
      const banner = document.getElementById("nsBackupRestoreBanner");
      if (banner) banner.style.display = 'flex';
    }
    nsState.editableText = newGeneratedText;
    nsState.lastAutoText = newGeneratedText;
    if (area) area.value = newGeneratedText;
  }
}

function nsHandleManualTextInput(val) {
  nsState.editableText = val;
}

function nsRestoreBackupText() {
  if (nsState.backupText) {
    nsState.editableText = nsState.backupText;
    const area = document.getElementById("nsEditableTextarea");
    if (area) area.value = nsState.backupText;
    const banner = document.getElementById("nsBackupRestoreBanner");
    if (banner) banner.style.display = 'none';
    showToast("Manuelles Text-Backup erfolgreich wiederhergestellt!", "↩️");
  }
}

function nsApplyEditorTypography() {
  const font = document.getElementById("nsEditorFont")?.value || "Arial";
  const size = document.getElementById("nsEditorSize")?.value || "11pt";
  nsState.editorFont = font;
  nsState.editorSize = size;
  const area = document.getElementById("nsEditableTextarea");
  if (area) {
    area.style.fontFamily = font;
    area.style.fontSize = size;
  }
}

function nsCopyToClipboard() {
  const area = document.getElementById("nsEditableTextarea");
  if (area) {
    navigator.clipboard.writeText(area.value).then(() => {
      showToast("Niederschrift in die Zwischenablage kopiert!", "📋");
    });
  }
}

function nsExportToWord() {
  let safeFont = "\\f0";
  if (nsState.editorFont.includes("Times")) safeFont = "\\f1";
  if (nsState.editorFont.includes("Calibri")) safeFont = "\\f2";
  
  let fSize = 22; 
  if (nsState.editorSize === "10pt") fSize = 20;
  if (nsState.editorSize === "11pt") fSize = 22;
  if (nsState.editorSize === "12pt") fSize = 24;
  if (nsState.editorSize === "14pt") fSize = 28;

  const textToExport = document.getElementById("nsEditableTextarea")?.value || "";
  const cur = getCurrentLAA() || {};
  const candidateName = cur.name ? cur.name.replace(/[^a-zA-Z0-9_äöüÄÖÜß]/g, '_') : 'Kandidat';
  const examLabel = nsState.activeExam === 'praktisch' ? 'Lehrprobe' : 'Muendliche_Pruefung';

  let rtfBody = textToExport
    .split(String.fromCharCode(92)).join(String.fromCharCode(92, 92))
    .split('{').join(String.fromCharCode(92) + '{')
    .split('}').join(String.fromCharCode(92) + '}')
    .split(String.fromCharCode(10)).join(String.fromCharCode(92) + 'par' + String.fromCharCode(10));

  let rtfContent = "{\\rtf1\\ansi\\deff0\n{\\fonttbl{\\f0 Arial;}{\\f1 Times New Roman;}{\\f2 Calibri;}}\n{\\colortbl ;\\red0\\green0\\blue0;}\n\\viewkind4\\uc1\\pard\\cf1" + safeFont + "\\fs" + fSize + " \n" + rtfBody + "\n\\par\n}";

  const blob = new Blob([rtfContent], { type: 'application/rtf;charset=utf-8;' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `Niederschrift_${candidateName}_${examLabel}.rtf`;
  link.click();
  showToast("Word-Dokument (.rtf) erfolgreich heruntergeladen!", "📄");
}

const nsExportWordRTF = nsExportToWord;
const nsResetRubric = nsResetAllConfirm;

function nsPrintEditorText() {
  const text = document.getElementById("nsEditableTextarea")?.value || "";
  const cur = getCurrentLAA() || {};
  const totalAvg = nsCalculateTotalAverage();

  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Niederschrift - ${cur.name}</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.6; margin: 40px; }
        .header { border-bottom: 2px solid #1e3a8a; padding-bottom: 12px; margin-bottom: 24px; }
        h1 { font-size: 16pt; margin: 0 0 6px 0; color: #1e3a8a; }
        .meta { font-size: 10pt; color: #475569; display: flex; gap: 20px; }
        .content { white-space: pre-wrap; font-size: 11pt; }
        .footer { margin-top: 50px; display: flex; justify-content: space-between; font-size: 10pt; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Anhang zur Prüfungs-Niederschrift</h1>
        <div class="meta">
          <span><strong>Prüfling:</strong> ${cur.name}</span>
          <span><strong>Prüfungsart:</strong> ${nsState.activeExam === 'praktisch' ? 'Praktische Lehrprobe' : 'Mündliche Prüfung'}</span>
          <span><strong>Gesamt-Ergebnis:</strong> ${totalAvg !== null ? totalAvg + ' Punkte' : '–'}</span>
          <span><strong>Datum:</strong> ${new Date().toLocaleDateString('de-DE')}</span>
        </div>
      </div>
      <div class="content">${text}</div>
      <div class="footer">
        <div>_______________________________<br>Unterschrift Fachleiter/in</div>
        <div>_______________________________<br>Unterschrift Prüfungsvorsitzende/r</div>
      </div>
    </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 300);
}

// TIMER & PROTOKOLL
let nsTimerInterval = null;

function nsToggleTimer() {
  const btn = document.getElementById("btnNsTimerToggle");
  if (nsState.timerIsRunning) {
    clearInterval(nsTimerInterval);
    nsState.timerIsRunning = false;
    if (btn) { btn.innerText = "▶ Start"; btn.classList.remove("btn-accent"); btn.classList.add("btn-primary"); }
  } else {
    nsState.timerIsRunning = true;
    if (btn) { btn.innerText = "⏸ Pause"; btn.classList.remove("btn-primary"); btn.classList.add("btn-accent"); }
    nsTimerInterval = setInterval(() => {
      nsState.timerSeconds++;
      const m = Math.floor(nsState.timerSeconds / 60).toString().padStart(2, '0');
      const s = (nsState.timerSeconds % 60).toString().padStart(2, '0');
      const display = document.getElementById("nsTimerDisplay");
      if (display) display.innerText = `${m}:${s}`;
    }, 1000);
  }
}

function nsResetTimer() {
  clearInterval(nsTimerInterval);
  nsState.timerIsRunning = false;
  nsState.timerSeconds = 0;
  const btn = document.getElementById("btnNsTimerToggle");
  const display = document.getElementById("nsTimerDisplay");
  if (btn) { btn.innerText = "▶ Start"; btn.classList.remove("btn-accent"); btn.classList.add("btn-primary"); }
  if (display) display.innerText = "00:00";
}

function nsRenderCategoryTags() {
  const wrap = document.getElementById("nsCategoryTagsWrap");
  if (!wrap || !EXAM_RUBRIC_DATA[nsState.activeExam]) return;

  const cats = EXAM_RUBRIC_DATA[nsState.activeExam].categories || [];
  wrap.innerHTML = cats.map(c => {
    const isSelected = nsState.currentTags.includes(c.id);
    return `
      <button type="button" class="ns-cat-filter-btn ${isSelected ? 'active' : ''}" style="min-height:28px; padding:4px 10px; font-size:0.78rem;" onclick="nsToggleTag('${c.id}')">
        ${c.shortName || c.title.replace('Anforderung: ', '')}
      </button>
    `;
  }).join('');
}

function nsToggleTag(catId) {
  if (nsState.currentTags.includes(catId)) {
    nsState.currentTags = nsState.currentTags.filter(id => id !== catId);
  } else {
    nsState.currentTags.push(catId);
  }
  nsRenderCategoryTags();
}

function nsAddProtocolEntry() {
  const input = document.getElementById("nsNoteInput");
  const text = input ? input.value.trim() : "";
  if (!text) return;

  const m = Math.floor(nsState.timerSeconds / 60).toString().padStart(2, '0');
  const s = (nsState.timerSeconds % 60).toString().padStart(2, '0');
  const timeStr = `${m}:${s}`;

  const entry = {
    id: Date.now(),
    time: timeStr,
    text: text,
    tags: [...nsState.currentTags]
  };

  nsState.protocolEntries.unshift(entry);
  if (input) input.value = "";
  nsRenderProtocolStream();
  nsRenderRasterView();
  showToast("Beobachtung erfasst!", "📝");
}

function nsRenderProtocolStream() {
  const stream = document.getElementById("nsProtocolStream");
  if (!stream) return;

  if (nsState.protocolEntries.length === 0) {
    stream.innerHTML = `<div style="text-align:center; color:#94a3b8; font-size:0.84rem; padding:20px;">Noch keine Beobachtungen erfasst.</div>`;
    return;
  }

  stream.innerHTML = nsState.protocolEntries.map(e => {
    return `
      <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:6px; padding:10px 14px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:flex-start; gap:10px;">
        <div>
          <span style="font-family:monospace; font-weight:700; font-size:0.8rem; background:#f1f5f9; padding:2px 6px; border-radius:4px; color:#475569; margin-right:8px;">[${e.time}]</span>
          <span style="font-size:0.86rem; color:#0f172a;">${e.text}</span>
          ${e.tags && e.tags.length > 0 ? `
            <div style="display:flex; gap:4px; margin-top:6px;">
              ${e.tags.map(t => `<span class="badge-pill" style="background:#e0f2fe; color:#0369a1; font-size:0.7rem;">🏷️ ${t}</span>`).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function nsClearLogConfirm() {
  if (confirm("Möchten Sie den Protokoll-Stream wirklich leeren?")) {
    nsState.protocolEntries = [];
    nsRenderProtocolStream();
    nsRenderRasterView();
    showToast("Protokoll geleert.", "🗑️");
  }
}

function nsResetAllConfirm() {
  if (confirm("Möchten Sie alle Bewertungen und Eingaben für diese Niederschrift zurücksetzen?")) {
    nsState.selections = {};
    nsState.editableText = "";
    nsState.lastAutoText = "";
    nsState.backupText = "";
    const area = document.getElementById("nsEditableTextarea");
    if (area) area.value = "";
    nsRenderRasterView();
    nsUpdateCalculationsAndProgress();
    showToast("Niederschrift zurückgesetzt.", "🗑️");
  }
}

let isNsDictating = false;
function nsToggleDictation() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    showToast("Spracherkennung wird in diesem Browser nicht unterstützt.", "⚠️");
    return;
  }
  const btn = document.getElementById("btnNsDictate");
  if (!isNsDictating) {
    const recognition = new SpeechRecognition();
    recognition.lang = 'de-DE';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => {
      isNsDictating = true;
      if (btn) btn.classList.add("listening");
      showToast("Diktat aktiv: Bitte sprechen...", "🎤");
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const input = document.getElementById("nsNoteInput");
      if (input) {
        input.value = (input.value ? input.value + " " : "") + transcript;
      }
    };

    recognition.onerror = () => {
      isNsDictating = false;
      if (btn) btn.classList.remove("listening");
      showToast("Spracherkennung abgebrochen oder keine Berechtigung.", "⚠️");
    };

    recognition.onend = () => {
      isNsDictating = false;
      if (btn) btn.classList.remove("listening");
    };

    recognition.start();
  }
}
