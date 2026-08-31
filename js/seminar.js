/**
 * FACHLEITER 360° SUITE PRO - CENTRAL SEMINAR CURRICULUM & MODULE ENGINE
 * Manages central seminar sessions, multi-candidate assignments, 1-5 participation grading & UB core competence transfer.
 */

// Standard Thuringian Curriculum Template (Optional 1-Click Import)
const THURINGIA_DEFAULT_SEMINARS = [
  {
    code: "M 01",
    title: "Lehrplananalyse & Strukturierung von Unterrichtsreihen",
    kmk: "Unterrichten",
    coreCompetence: "Fachdidaktische Reduktion und curriculare Reihenplanung nach Thüringer Lehrplan",
    materialPath: "Seminarmaterialien/M01_Lehrplan_Reihenplanung.pdf",
    description: "Analyse von Kompetenzstufen, Formulierung von Stundenzielen und didaktische Jahresplanung."
  },
  {
    code: "M 02",
    title: "Unterrichtseinstiege, Problemorientierung & Kognitive Aktivierung",
    kmk: "Unterrichten",
    coreCompetence: "Entwicklung motivierender Problemfragen und aktivierender Einstiegsphasen",
    materialPath: "Seminarmaterialien/M02_Problemorientierung.pdf",
    description: "Methoden für kognitiv aktivierende Impulse, Advance Organizer und Problemstellungen."
  },
  {
    code: "M 03",
    title: "Heterogenität, Differenzierung & Gestufte Lernhilfen",
    kmk: "Unterrichten",
    coreCompetence: "Planung und Durchführung differenzierender Lernarrangements",
    materialPath: "Seminarmaterialien/M03_Differenzierung.pdf",
    description: "Methoden der Binnendifferenzierung, Hilfekarten, niveaudifferenzierte Aufgabenformate."
  },
  {
    code: "M 04",
    title: "Klassenführung, Rituale & Konstruktiver Umgang mit Störungen",
    kmk: "Erziehen",
    coreCompetence: "Präsenz, Reibungslosigkeit im Unterrichtsfluss und transparente Regelkultur",
    materialPath: "Seminarmaterialien/M04_Klassenfuehrung.pdf",
    description: "Strategien nach Kounin, Zeitmanagement, nonverbale Signale und Interventionsstufen."
  },
  {
    code: "M 05",
    title: "Kompetenzorientierte Aufgabenkultur & Lernaufgaben",
    kmk: "Unterrichten",
    coreCompetence: "Gestaltung authentischer und anforderungsdifferenzierter Fachaufgaben",
    materialPath: "Seminarmaterialien/M05_Aufgabenkultur.pdf",
    description: "Operator-Einsatz, Materialaufbereitung und formative Zwischensicherungen."
  },
  {
    code: "M 06",
    title: "Diagnostik, Feedback & Formative Leistungsmessung",
    kmk: "Beurteilen",
    coreCompetence: "Erkennen individueller Lernstände und lernförderliches Feedback",
    materialPath: "Seminarmaterialien/M06_Diagnostik.pdf",
    description: "Lernstandsanalysen, Feedback-Methoden, Selbsteinschätzungsbögen und Kriterienraster."
  },
  {
    code: "M 07",
    title: "Digitale Medien & Fachspezifische Werkzeuge im Unterricht",
    kmk: "Innovieren",
    coreCompetence: "Didaktisch begründeter Einsatz digitaler Medien zur Lernunterstützung",
    materialPath: "Seminarmaterialien/M07_Digitale_Medien.pdf",
    description: "Einsatz von Tablets, interaktiven Tafeln, Thüringer Schulcloud und Fachsoftware."
  },
  {
    code: "M 08",
    title: "Schüler- und Elterngespräche & Beratungskompetenz",
    kmk: "Beraten",
    coreCompetence: "Professionelle Gesprächsführung in Entwicklungs- und Beratungskontexten",
    materialPath: "Seminarmaterialien/M08_Beratung.pdf",
    description: "Gesprächsphasen, lösungsorientierte Beratung und Feedback an Erziehungsberechtigte."
  }
];

function initSeminarCurriculum() {
  if (!appState.seminarCurriculum) {
    appState.seminarCurriculum = [];
  }
}

/**
 * RENDER TAB 5: SEMINAR CURRICULUM OVERVIEW
 */
function renderSeminarTab() {
  initSeminarCurriculum();
  const container = document.getElementById("seminarCurriculumContainer");
  if (!container) return;

  const modules = appState.seminarCurriculum || [];
  const laas = appState.laas || {};
  const laaCount = Object.keys(laas).length;

  if (modules.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:50px 20px; background:#f8fafc; border:2px dashed #cbd5e1; border-radius:12px;">
        <div style="font-size:3rem; margin-bottom:12px;">📚</div>
        <h3 style="font-size:1.2rem; color:#1e293b; margin-bottom:8px;">Noch keine Seminarmodule im Curriculum angelegt</h3>
        <p style="color:#64748b; font-size:0.92rem; max-width:560px; margin:0 auto 20px;">
          Legen Sie Ihre eigenen Fachdidaktik-Module an oder importieren Sie das Thüringer Standard-Curriculum als bearbeitbares Grundgerüst.
        </p>
        <div style="display:flex; justify-content:center; gap:10px; flex-wrap:wrap;">
          <button class="btn btn-primary" onclick="openAddSeminarModuleModal()">
            ➕ Erstes Modul anlegen
          </button>
          <button class="btn btn-outline" style="background:#fff;" onclick="importThuringiaDefaultSeminars()">
            🪄 Thüringer Standard-Curriculum laden (8 Module)
          </button>
        </div>
      </div>
    `;
    return;
  }

  let modulesHtml = modules.map((mod, modIdx) => {
    const participants = mod.participants || {};
    const assignedIds = Object.keys(participants);
    const assignedCount = assignedIds.length;

    // Calculate module stats
    let totalScore = 0;
    let scoredCount = 0;
    let doneTransfers = 0;

    assignedIds.forEach(id => {
      const p = participants[id];
      if (p) {
        if (p.participationScore) {
          totalScore += p.participationScore;
          scoredCount++;
        }
        if (p.transferStatus === 'Sehr gut nachgewiesen' || p.transferStatus === 'Nachgewiesen') {
          doneTransfers++;
        }
      }
    });

    const avgScore = scoredCount > 0 ? (totalScore / scoredCount).toFixed(1) : "–";

    // Participant rows
    let participantRows = "";
    if (assignedCount === 0) {
      participantRows = `
        <div style="padding:14px; text-align:center; color:#94a3b8; font-size:0.84rem; background:#f8fafc; border-radius:8px;">
          Diesem Modul sind noch keine Teilnehmer zugeordnet. 
          <button class="btn btn-outline" style="font-size:0.75rem; padding:2px 8px; margin-left:8px;" onclick="openAssignParticipantsModal(${modIdx})">➕ Teilnehmer zuordnen</button>
        </div>
      `;
    } else {
      participantRows = assignedIds.map(laaId => {
        const laa = laas[laaId];
        const p = participants[laaId] || { participationScore: 3, transferStatus: "Noch offen", transferNote: "" };
        const laaName = laa ? laa.name : "Unbekannter Teilnehmer";
        const laaType = laa ? (laa.type || "LAA") : "LAA";

        let transferBadge = "badge-open";
        if (p.transferStatus === 'Sehr gut nachgewiesen') transferBadge = "badge-done";
        else if (p.transferStatus === 'Nachgewiesen') transferBadge = "badge-progress";
        else if (p.transferStatus === 'In Erprobung') transferBadge = "badge-urgent";

        return `
          <div class="seminar-participant-card">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
              <div>
                <strong style="color:#0f172a; font-size:0.9rem;">${laaName}</strong>
                <span class="badge" style="background:#e0f2fe; color:#0369a1; font-size:0.7rem; padding:1px 6px; margin-left:6px;">${laaType}</span>
              </div>
              <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
                <!-- 1-5 Participation Score -->
                <div style="display:flex; align-items:center; gap:6px;">
                  <span style="font-size:0.78rem; font-weight:700; color:#475569;">Mitarbeit:</span>
                  <select 
                    class="form-control" 
                    style="font-size:0.8rem; padding:2px 6px; width:70px; font-weight:700; color:#1e3a8a;"
                    onchange="updateParticipantScore(${modIdx}, '${laaId}', this.value)"
                  >
                    <option value="5" ${p.participationScore == 5 ? 'selected' : ''}>5 (Sehr gut)</option>
                    <option value="4" ${p.participationScore == 4 ? 'selected' : ''}>4 (Gut)</option>
                    <option value="3" ${p.participationScore == 3 ? 'selected' : ''}>3 (Befriedigend)</option>
                    <option value="2" ${p.participationScore == 2 ? 'selected' : ''}>2 (Ausreichend)</option>
                    <option value="1" ${p.participationScore == 1 ? 'selected' : ''}>1 (Mangelhaft)</option>
                  </select>
                </div>

                <!-- Core Competence Transfer Status -->
                <div style="display:flex; align-items:center; gap:6px;">
                  <span style="font-size:0.78rem; font-weight:700; color:#475569;">UB-Transfer:</span>
                  <select 
                    class="form-control ${transferBadge}" 
                    style="font-size:0.78rem; padding:2px 6px; font-weight:700; width:165px;"
                    onchange="updateParticipantTransfer(${modIdx}, '${laaId}', this.value)"
                  >
                    <option value="Sehr gut nachgewiesen" ${p.transferStatus === 'Sehr gut nachgewiesen' ? 'selected' : ''}>⭐⭐ Sehr gut nachgewiesen</option>
                    <option value="Nachgewiesen" ${p.transferStatus === 'Nachgewiesen' ? 'selected' : ''}>⭐ Nachgewiesen</option>
                    <option value="In Erprobung" ${p.transferStatus === 'In Erprobung' ? 'selected' : ''}>🔄 In Erprobung</option>
                    <option value="Noch offen" ${p.transferStatus === 'Noch offen' ? 'selected' : ''}>⏳ Noch offen</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Transfer Notes / UB Reference -->
            <div style="margin-top:8px;">
              <input 
                type="text" 
                class="form-control" 
                style="font-size:0.78rem; padding:3px 8px;" 
                placeholder="UB-Beobachtung / Nachweis (z. B. 'Im UB 2 bei Gruppenarbeit sicher gezeigt')" 
                value="${p.transferNote || ''}" 
                onchange="updateParticipantTransferNote(${modIdx}, '${laaId}', this.value)"
              />
            </div>
          </div>
        `;
      }).join('');
    }

    return `
      <div class="card seminar-module-card" style="margin-bottom:16px; border:1px solid #e2e8f0; box-shadow:0 2px 4px rgba(0,0,0,0.03);">
        <div style="padding:16px 20px; background:#f8fafc; border-bottom:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:10px;">
          <div>
            <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
              <span class="badge" style="background:#1e3a8a; color:#ffffff; font-weight:800; font-size:0.75rem; padding:3px 8px;">${mod.code || 'MODUL'}</span>
              <h3 style="margin:0; font-size:1.05rem; color:#0f172a;">${mod.title}</h3>
              <span class="badge-pill" style="background:#e0e7ff; color:#3730a3; font-weight:700; font-size:0.72rem;">${mod.kmk || 'Unterrichten'}</span>
            </div>
            <div style="font-size:0.8rem; color:#475569; margin-top:4px;">
              🎯 <strong>Kernkompetenz:</strong> ${mod.coreCompetence || 'Fachdidaktische Umsetzung'}
            </div>
            ${mod.date ? `<div style="font-size:0.75rem; color:#64748b; margin-top:2px;">📅 <strong>Sitzungsdatum:</strong> ${new Date(mod.date).toLocaleDateString('de-DE')} ${mod.time ? '• ' + mod.time + ' Uhr' : ''} ${mod.room ? '• ' + mod.room : ''}</div>` : ''}
            ${mod.materialPath ? `
              <div style="font-size:0.75rem; color:#2563eb; margin-top:2px; display:flex; align-items:center; gap:4px;">
                <span>📁</span> <span>Materialordner / Datei:</span> <code>${mod.materialPath}</code>
              </div>
            ` : ''}
          </div>

          <div style="display:flex; gap:6px; align-items:center;">
            <button class="btn btn-outline" style="font-size:0.75rem; padding:4px 10px; background:#fff;" onclick="openAssignParticipantsModal(${modIdx})">
              👥 Teilnehmer (${assignedCount})
            </button>
            <button class="btn btn-outline" style="font-size:0.75rem; padding:4px 10px; background:#fff;" onclick="openEditSeminarModuleModal(${modIdx})">
              ✏️ Bearbeiten
            </button>
            <button class="btn btn-ghost btn-icon-only" style="color:#ef4444;" onclick="deleteSeminarModule(${modIdx})" title="Modul löschen">
              🗑️
            </button>
          </div>
        </div>

        <!-- Participants & Assessment Matrix -->
        <div style="padding:16px 20px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <span style="font-size:0.82rem; font-weight:700; color:#334155;">
              Teilnehmerbewertung &amp; Transfernachweis (${assignedCount} zugeordnet):
            </span>
            <span style="font-size:0.75rem; color:#64748b;">
              Ø Mitarbeit: <strong>${avgScore} / 5.0</strong> • Nachgewiesen: <strong>${doneTransfers}/${assignedCount}</strong>
            </span>
          </div>

          <div style="display:flex; flex-direction:column; gap:8px;">
            ${participantRows}
          </div>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <!-- Top Actions Bar -->
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; flex-wrap:wrap; gap:10px;">
      <div>
        <h2 style="font-size:1.15rem; font-weight:700; color:#1e293b; margin:0;">Fachdidaktisches Seminarcurriculum (${modules.length} Module)</h2>
        <div style="font-size:0.78rem; color:#64748b;">Zentrale Modulplanung, Teilnehmerzuordnung, 1–5 Mitarbeit &amp; Kernkompetenz-Transfer</div>
      </div>

      <div style="display:flex; gap:8px; flex-wrap:wrap;">
        <button class="btn btn-outline" style="font-size:0.8rem; padding:6px 12px;" onclick="importThuringiaDefaultSeminars()">
          🪄 Standard-Curriculum laden
        </button>
        <button class="btn btn-outline" style="font-size:0.8rem; padding:6px 12px;" onclick="exportCurriculumCSV()">
          📑 CSV-Export
        </button>
        <button class="btn btn-primary" style="font-size:0.8rem; padding:6px 14px;" onclick="openAddSeminarModuleModal()">
          ➕ Neues Modul anlegen
        </button>
      </div>
    </div>

    <!-- Modules List -->
    <div>
      ${modulesHtml}
    </div>
  `;
}

/**
 * PARTICIPANT SCORE & TRANSFER UPDATES
 */
function updateParticipantScore(modIdx, laaId, scoreVal) {
  initSeminarCurriculum();
  const mod = appState.seminarCurriculum[modIdx];
  if (!mod || !mod.participants) return;
  if (!mod.participants[laaId]) mod.participants[laaId] = {};
  mod.participants[laaId].participationScore = parseInt(scoreVal, 10) || 3;
  saveState();
  showToast("Mitarbeitsnote aktualisiert!", "⭐");
}

function updateParticipantTransfer(modIdx, laaId, statusVal) {
  initSeminarCurriculum();
  const mod = appState.seminarCurriculum[modIdx];
  if (!mod || !mod.participants) return;
  if (!mod.participants[laaId]) mod.participants[laaId] = {};
  mod.participants[laaId].transferStatus = statusVal;
  saveState();
  renderSeminarTab();
  showToast("Transferstatus aktualisiert!", "🎯");
}

function updateParticipantTransferNote(modIdx, laaId, noteVal) {
  initSeminarCurriculum();
  const mod = appState.seminarCurriculum[modIdx];
  if (!mod || !mod.participants) return;
  if (!mod.participants[laaId]) mod.participants[laaId] = {};
  mod.participants[laaId].transferNote = noteVal;
  saveState();
}

/**
 * MODAL: ADD / EDIT SEMINAR MODULE
 */
function openAddSeminarModuleModal() {
  openEditSeminarModuleModal(-1);
}

function openEditSeminarModuleModal(modIdx) {
  initSeminarCurriculum();
  const isEdit = modIdx >= 0;
  const mod = isEdit ? appState.seminarCurriculum[modIdx] : {
    code: `M 0${(appState.seminarCurriculum || []).length + 1}`,
    title: "",
    kmk: "Unterrichten",
    coreCompetence: "",
    date: new Date().toISOString().split('T')[0],
    time: "14:00 - 17:30",
    room: appState.seminarLocation || "Studienseminar",
    materialPath: `Seminarmaterialien/Modul_${(appState.seminarCurriculum || []).length + 1}/`,
    description: "",
    participants: {}
  };

  const bodyHTML = `
    <div class="form-row-2col">
      <div class="form-group">
        <label>Modulcode</label>
        <input id="mod_code" class="form-control" value="${mod.code || ''}" placeholder="z. B. M 01" />
      </div>
      <div class="form-group">
        <label>KMK-Handlungsfeld</label>
        <select id="mod_kmk" class="form-control">
          <option value="Unterrichten" ${mod.kmk === 'Unterrichten' ? 'selected' : ''}>Unterrichten (Didaktik &amp; Methodik)</option>
          <option value="Erziehen" ${mod.kmk === 'Erziehen' ? 'selected' : ''}>Erziehen (Klassenführung &amp; Werte)</option>
          <option value="Beurteilen" ${mod.kmk === 'Beurteilen' ? 'selected' : ''}>Beurteilen (Diagnostik &amp; Feedback)</option>
          <option value="Beraten" ${mod.kmk === 'Beraten' ? 'selected' : ''}>Beraten (Gesprächsführung)</option>
          <option value="Innovieren" ${mod.kmk === 'Innovieren' ? 'selected' : ''}>Innovieren (Medien &amp; Entwicklung)</option>
        </select>
      </div>
    </div>

    <div class="form-group">
      <label>Fachdidaktisches Seminarthema</label>
      <input id="mod_title" class="form-control" value="${mod.title || ''}" placeholder="z. B. Binnendifferenzierung &amp; Heterogenität" />
    </div>

    <div class="form-group">
      <label>🎯 Kernkompetenz der Sitzung (Transfer-Ziel für UBs)</label>
      <input id="mod_coreCompetence" class="form-control" value="${mod.coreCompetence || ''}" placeholder="z. B. Einsatz gestufter Lernhilfen im schülerzentrierten Unterricht" />
    </div>

    <div class="form-row-2col">
      <div class="form-group">
        <label>Sitzungsdatum</label>
        <input id="mod_date" type="date" class="form-control" value="${mod.date || ''}" />
      </div>
      <div class="form-group">
        <label>Uhrzeit &amp; Raum</label>
        <input id="mod_time_room" class="form-control" value="${(mod.time || '') + (mod.room ? ' • ' + mod.room : '')}" placeholder="14:00 - 17:30 • Seminarraum 2" />
      </div>
    </div>

    <div class="form-group">
      <label>📁 Lokaler Materialordner / Dateipfad</label>
      <input id="mod_materialPath" class="form-control" value="${mod.materialPath || ''}" placeholder="z. B. Seminarmaterialien/M03_Differenzierung/" />
      <div style="font-size:0.72rem; color:#64748b; margin-top:2px;">
        Geben Sie den relativen Pfad im Projektordner oder zu Ihren Seminarunterlagen an.
      </div>
    </div>

    <div class="form-group">
      <label>Inhaltliche Beschreibung / Ablauf</label>
      <textarea id="mod_description" class="form-control" rows="2" placeholder="Kurze Stichpunkte zu Zielen, Methoden und Vorbereitungsauftrag...">${mod.description || ''}</textarea>
    </div>
  `;

  const footerHTML = `
    <button class="btn btn-outline" onclick="closeModal()">Abbrechen</button>
    <button class="btn btn-primary" onclick="saveSeminarModule(${modIdx})">💾 ${isEdit ? 'Änderungen speichern' : 'Modul anlegen'}</button>
  `;

  openModal({
    title: isEdit ? `✏️ Modul ${mod.code} bearbeiten` : "📚 Neues Seminarmodul anlegen",
    bodyHTML,
    footerHTML
  });
}

function saveSeminarModule(modIdx) {
  initSeminarCurriculum();
  const title = document.getElementById("mod_title")?.value.trim();
  if (!title) {
    showToast("Bitte geben Sie einen Modultitel ein!", "⚠️");
    return;
  }

  const timeRoomRaw = document.getElementById("mod_time_room")?.value || "";
  const parts = timeRoomRaw.split("•");
  const time = (parts[0] || "").trim();
  const room = (parts[1] || "").trim();

  const isEdit = modIdx >= 0;
  const existing = isEdit ? appState.seminarCurriculum[modIdx] : {};

  const modData = {
    ...existing,
    id: existing.id || "sem_" + Date.now(),
    code: document.getElementById("mod_code")?.value.trim() || `M 0${(appState.seminarCurriculum || []).length + 1}`,
    title,
    kmk: document.getElementById("mod_kmk")?.value || "Unterrichten",
    coreCompetence: document.getElementById("mod_coreCompetence")?.value.trim() || "Fachdidaktische Umsetzung",
    date: document.getElementById("mod_date")?.value || "",
    time,
    room,
    materialPath: document.getElementById("mod_materialPath")?.value.trim() || "",
    description: document.getElementById("mod_description")?.value.trim() || "",
    participants: existing.participants || {}
  };

  // If new module and candidates exist, auto-assign all by default (can be customized)
  if (!isEdit && Object.keys(modData.participants).length === 0) {
    const laas = appState.laas || {};
    Object.keys(laas).forEach(id => {
      modData.participants[id] = {
        participated: true,
        participationScore: 4,
        transferStatus: "Noch offen",
        transferNote: ""
      };
    });
  }

  if (isEdit) {
    appState.seminarCurriculum[modIdx] = modData;
  } else {
    appState.seminarCurriculum.push(modData);
  }

  saveState();
  closeModal();
  renderSeminarTab();
  showToast(isEdit ? "Modul aktualisiert!" : "Neues Seminarmodul angelegt!", "📚");
}

function deleteSeminarModule(modIdx) {
  initSeminarCurriculum();
  const mod = appState.seminarCurriculum[modIdx];
  if (!mod) return;

  if (confirm(`Möchten Sie das Modul "${mod.code}: ${mod.title}" wirklich löschen?`)) {
    appState.seminarCurriculum.splice(modIdx, 1);
    saveState();
    renderSeminarTab();
    showToast("Modul gelöscht.", "🗑️");
  }
}

/**
 * MODAL: ASSIGN PARTICIPANTS TO MODULE
 */
function openAssignParticipantsModal(modIdx) {
  initSeminarCurriculum();
  const mod = appState.seminarCurriculum[modIdx];
  if (!mod) return;

  const laas = appState.laas || {};
  const entries = Object.entries(laas);

  if (entries.length === 0) {
    showToast("Es sind noch keine Kandidaten im Pool angelegt!", "⚠️");
    return;
  }

  const currentAssigned = mod.participants || {};

  const checkboxesHtml = entries.map(([id, laa]) => {
    const isAssigned = !!currentAssigned[id];
    return `
      <label style="display:flex; align-items:center; justify-content:space-between; padding:10px 14px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; cursor:pointer; margin-bottom:8px;">
        <div style="display:flex; align-items:center; gap:10px;">
          <input 
            type="checkbox" 
            id="assign_chk_${id}" 
            value="${id}" 
            ${isAssigned ? 'checked' : ''} 
            style="width:18px; height:18px; cursor:pointer;" 
          />
          <div>
            <strong style="color:#0f172a; font-size:0.9rem;">${laa.name}</strong>
            <div style="font-size:0.75rem; color:#64748b;">
              <span class="badge" style="background:#e0f2fe; color:#0369a1; font-size:0.68rem; padding:1px 5px;">${laa.type || 'LAA'}</span>
              ${laa.subject1 || '-'}${laa.subject2 ? ' / ' + laa.subject2 : ''} • ${laa.school || '-'}
            </div>
          </div>
        </div>
        <span style="font-size:0.75rem; color:${isAssigned ? '#16a34a' : '#94a3b8'}; font-weight:700;">
          ${isAssigned ? '✅ Zugeordnet' : '⚪ Nicht zugeordnet'}
        </span>
      </label>
    `;
  }).join('');

  const bodyHTML = `
    <div style="font-size:0.86rem; color:#475569; margin-bottom:14px;">
      Wählen Sie aus Ihrem Kandidatenpool die Teilnehmer aus, die an <strong>${mod.code}: ${mod.title}</strong> teilnehmen:
    </div>
    <div style="max-height:360px; overflow-y:auto; padding-right:4px;">
      ${checkboxesHtml}
    </div>
  `;

  const footerHTML = `
    <button class="btn btn-outline" onclick="closeModal()">Abbrechen</button>
    <button class="btn btn-primary" onclick="saveAssignedParticipants(${modIdx})">💾 Zuordnung speichern</button>
  `;

  openModal({
    title: `👥 Teilnehmer für ${mod.code} zuordnen`,
    bodyHTML,
    footerHTML
  });
}

function saveAssignedParticipants(modIdx) {
  initSeminarCurriculum();
  const mod = appState.seminarCurriculum[modIdx];
  if (!mod) return;

  const laas = appState.laas || {};
  const newParticipants = {};

  Object.keys(laas).forEach(id => {
    const chk = document.getElementById(`assign_chk_${id}`);
    if (chk && chk.checked) {
      // Preserve existing score/transfer if already present
      newParticipants[id] = (mod.participants && mod.participants[id]) ? mod.participants[id] : {
        participated: true,
        participationScore: 4,
        transferStatus: "Noch offen",
        transferNote: ""
      };
    }
  });

  mod.participants = newParticipants;
  saveState();
  closeModal();
  renderSeminarTab();
  showToast(`Teilnehmer für ${mod.code} erfolgreich aktualisiert!`, "👥");
}

/**
 * IMPORT DEFAULT THURINGIA CURRICULUM TEMPLATE
 */
function importThuringiaDefaultSeminars() {
  initSeminarCurriculum();
  const laas = appState.laas || {};
  const laaIds = Object.keys(laas);

  const newModules = THURINGIA_DEFAULT_SEMINARS.map((tmpl, idx) => {
    const participants = {};
    laaIds.forEach(id => {
      participants[id] = {
        participated: true,
        participationScore: 4,
        transferStatus: "Noch offen",
        transferNote: ""
      };
    });

    const d = new Date();
    d.setDate(d.getDate() + (idx * 14)); // every 2 weeks

    return {
      id: "sem_th_" + Date.now() + "_" + idx,
      code: tmpl.code,
      title: tmpl.title,
      kmk: tmpl.kmk,
      coreCompetence: tmpl.coreCompetence,
      date: d.toISOString().split('T')[0],
      time: "14:00 - 17:30",
      room: appState.seminarLocation || "Studienseminar",
      materialPath: tmpl.materialPath,
      description: tmpl.description,
      participants
    };
  });

  if (appState.seminarCurriculum.length > 0) {
    if (confirm("Möchten Sie die 8 Thüringer Standard-Module zu Ihrem bestehenden Curriculum hinzufügen?")) {
      appState.seminarCurriculum.push(...newModules);
    } else {
      return;
    }
  } else {
    appState.seminarCurriculum = newModules;
  }

  saveState();
  renderSeminarTab();
  showToast("8 Thüringer Standard-Module erfolgreich importiert!", "🪄");
}

/**
 * EXPORT CURRICULUM CSV
 */
function exportCurriculumCSV() {
  initSeminarCurriculum();
  const modules = appState.seminarCurriculum || [];
  const laas = appState.laas || {};

  if (modules.length === 0) {
    showToast("Keine Seminarmodule zum Exportieren vorhanden!", "⚠️");
    return;
  }

  let csv = "Modulcode;Titel;KMK-Bereich;Sitzungsdatum;Uhrzeit;Kernkompetenz;Kandidat;Typ;Mitarbeit (1-5);UB-Transfer;UB-Notiz\n";

  modules.forEach(mod => {
    const participants = mod.participants || {};
    const pKeys = Object.keys(participants);

    if (pKeys.length === 0) {
      csv += `"${mod.code}";"${mod.title}";"${mod.kmk}";"${mod.date || ''}";"${mod.time || ''}";"${mod.coreCompetence || ''}";"-";"-";"-";"-";"-"\n`;
    } else {
      pKeys.forEach(laaId => {
        const laa = laas[laaId];
        const p = participants[laaId];
        csv += `"${mod.code}";"${mod.title}";"${mod.kmk}";"${mod.date || ''}";"${mod.time || ''}";"${mod.coreCompetence || ''}";"${laa ? laa.name : laaId}";"${laa ? (laa.type || 'LAA') : 'LAA'}";${p.participationScore || ''};"${p.transferStatus || ''}";"${p.transferNote || ''}"\n`;
      });
    }
  });

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Seminarcurriculum_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  showToast("Seminarcurriculum als CSV exportiert!", "📑");
}
