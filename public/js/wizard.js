/**
 * SETUP WIZARD & ONBOARDING ENGINE (Fachleiter 360° Suite Pro)
 */

let wizardCurrentStep = 1;
const WIZARD_TOTAL_STEPS = 5;

const wizardTempData = {
  mentorTitle: "Studiendirektor/in",
  mentorName: "",
  seminarLocation: "Staatliches Studienseminar Erfurt",
  primarySubject: "Mathematik",
  
  // Candidate data
  createCandidate: true,
  candidateName: "",
  candidateGender: "f",
  candidateType: "LAA",
  candidateSchoolType: "Regelschule",
  candidateSubject1: "Mathematik",
  candidateSubject2: "Physik",
  candidateSchool: "",
  candidateMentor: "",
  candidateStartDate: new Date().toISOString().split('T')[0],
  candidateEndDate: "",
  
  // Standards
  gradingScale: "points15",
  defaultExamRole: "ausschussvorsitz",
  enableReminders: true
};

function openSetupWizard(force = false) {
  wizardCurrentStep = 1;
  
  // Pre-fill from current appState if available
  if (appState) {
    if (appState.mentorName) wizardTempData.mentorName = appState.mentorName;
    if (appState.seminarLocation) wizardTempData.seminarLocation = appState.seminarLocation;
  }

  renderWizardModal();
}

function renderWizardModal() {
  let modalEl = document.getElementById("wizardModalOverlay");
  if (!modalEl) {
    modalEl = document.createElement("div");
    modalEl.id = "wizardModalOverlay";
    modalEl.className = "modal-overlay wizard-overlay";
    document.body.appendChild(modalEl);
  }

  modalEl.innerHTML = `
    <div class="wizard-card modal-card">
      <!-- Wizard Header -->
      <div class="wizard-header">
        <div style="display:flex; align-items:center; gap:12px;">
          <div class="wizard-icon"><i data-lucide="sparkles" class="w-6 h-6 text-cyan-400"></i></div>
          <div>
            <h2 style="margin:0; font-size:1.25rem; color:#f8fafc;">Einrichtungsassistent</h2>
            <div style="font-size:0.8rem; color:#94a3b8;">Fachleiter 360° Suite • In 5 Schritten startklar</div>
          </div>
        </div>
        <button class="modal-close" onclick="closeSetupWizard()" title="Assistent schließen"><i data-lucide="x" class="w-4 h-4"></i></button>
      </div>

      <!-- Step Indicator / Progress Bar -->
      <div class="wizard-progress-wrap">
        <div class="wizard-progress-bar" style="width: ${(wizardCurrentStep / WIZARD_TOTAL_STEPS) * 100}%;"></div>
      </div>
      <div class="wizard-step-labels">
        <span class="${wizardCurrentStep >= 1 ? 'active' : ''}">1. Fachleitung</span>
        <span class="${wizardCurrentStep >= 2 ? 'active' : ''}">2. Kandidat</span>
        <span class="${wizardCurrentStep >= 3 ? 'active' : ''}">3. Standards</span>
        <span class="${wizardCurrentStep >= 4 ? 'active' : ''}">4. Formulare</span>
        <span class="${wizardCurrentStep >= 5 ? 'active' : ''}">5. Start</span>
      </div>

      <!-- Wizard Step Content -->
      <div class="wizard-body" id="wizardStepBody">
        ${getWizardStepHtml(wizardCurrentStep)}
      </div>

      <!-- Wizard Footer / Navigation -->
      <div class="wizard-footer">
        <button class="btn btn-outline" onclick="wizardPrevStep()" ${wizardCurrentStep === 1 ? 'style="visibility:hidden;"' : ''}>
          <i data-lucide="arrow-left" class="w-4 h-4 inline-block mr-1"></i> Zurück
        </button>
        <div style="font-size:0.82rem; color:#94a3b8;">
          Schritt <strong>${wizardCurrentStep}</strong> von ${WIZARD_TOTAL_STEPS}
        </div>
        ${wizardCurrentStep < WIZARD_TOTAL_STEPS ? `
          <button class="btn btn-primary" onclick="wizardNextStep()">
            Weiter <i data-lucide="arrow-right" class="w-4 h-4 inline-block ml-1"></i>
          </button>
        ` : `
          <button class="btn btn-primary" style="background: linear-gradient(135deg, #0284c7, #0369a1);" onclick="finishSetupWizard()">
            <i data-lucide="rocket" class="w-4 h-4 inline-block mr-1"></i> Suite jetzt starten
          </button>
        `}
      </div>
    </div>
  `;

  modalEl.classList.add("active");
  modalEl.style.display = "flex";
}

function getWizardStepHtml(step) {
  if (step === 1) {
    return `
      <div class="wizard-step-content">
        <div class="wizard-intro-box">
          <h3 style="margin:0 0 6px; font-size:1.05rem; color:#f8fafc; display:flex; align-items:center; gap:6px;">
            <i data-lucide="user" class="w-4 h-4 text-cyan-400"></i> Ihre Fachleiter-Stammdaten
          </h3>
          <p style="margin:0; font-size:0.85rem; color:#94a3b8;">
            Diese Angaben werden automatisch in amtliche Gutachten, Prüfungsniederschriften und PDF-Formulare als Erstgutachter/Ausschussvorsitz eingetragen.
          </p>
        </div>

        <div class="form-row-2col" style="margin-top:14px;">
          <div class="form-group">
            <label>Amtsbezeichnung / Titel</label>
            <input id="wiz_mentorTitle" class="form-control" value="${wizardTempData.mentorTitle}" placeholder="z. B. Studiendirektor/in, Fachleiter/in" />
          </div>
          <div class="form-group">
            <label>Vor- und Nachname *</label>
            <input id="wiz_mentorName" class="form-control" value="${wizardTempData.mentorName}" placeholder="z. B. Dr. Nicole Keller" autofocus />
          </div>
        </div>

        <div class="form-row-2col">
          <div class="form-group">
            <label>Studienseminar / Dienstort</label>
            <select id="wiz_seminarLocation" class="form-control">
              <option value="Staatliches Studienseminar Erfurt" ${wizardTempData.seminarLocation.includes("Erfurt") ? "selected" : ""}>Staatliches Studienseminar Erfurt</option>
              <option value="Staatliches Studienseminar Jena" ${wizardTempData.seminarLocation.includes("Jena") ? "selected" : ""}>Staatliches Studienseminar Jena</option>
              <option value="Staatliches Studienseminar Gera" ${wizardTempData.seminarLocation.includes("Gera") ? "selected" : ""}>Staatliches Studienseminar Gera</option>
              <option value="Staatliches Studienseminar Nordhausen" ${wizardTempData.seminarLocation.includes("Nordhausen") ? "selected" : ""}>Staatliches Studienseminar Nordhausen</option>
            </select>
          </div>
          <div class="form-group">
            <label>Haupt-Ausbildungsfach</label>
            <input id="wiz_primarySubject" class="form-control" value="${wizardTempData.primarySubject}" placeholder="z. B. Mathematik, Deutsch, Physik" />
          </div>
        </div>
      </div>
    `;
  }

  if (step === 2) {
    return `
      <div class="wizard-step-content">
        <div class="wizard-intro-box">
          <h3 style="margin:0 0 6px; font-size:1.05rem; color:#f8fafc; display:flex; align-items:center; gap:6px;">
            <i data-lucide="users" class="w-4 h-4 text-cyan-400"></i> Erstes Kandidatenprofil anlegen
          </h3>
          <p style="margin:0; font-size:0.85rem; color:#94a3b8;">
            Erfassen Sie Ihren ersten Referendar (LAA), Seiteneinsteiger (NQ) oder Weiterbildungsteilnehmer (WB). Sie können später jederzeit weitere Profile hinzufügen.
          </p>
        </div>

        <div style="margin: 12px 0;">
          <label style="display:flex; align-items:center; gap:8px; font-weight:600; cursor:pointer; font-size:0.9rem;">
            <input type="checkbox" id="wiz_createCandidate" ${wizardTempData.createCandidate ? 'checked' : ''} onchange="toggleWizardCandidateFields(this.checked)" />
            Jetzt direkt einen Kandidaten anlegen (empfohlen)
          </label>
        </div>

        <div id="wizCandidateFields" style="${wizardTempData.createCandidate ? '' : 'display:none; opacity:0.5; pointer-events:none;'}">
          <div class="form-row-2col">
            <div class="form-group">
              <label>Name des Kandidaten (mit Anrede) *</label>
              <input id="wiz_candidateName" class="form-control" value="${wizardTempData.candidateName}" placeholder="z. B. Frau Sarah Könitzer" />
            </div>
            <div class="form-group">
              <label>Status / Lehrkraft-Typ</label>
              <select id="wiz_candidateType" class="form-control">
                <option value="LAA" ${wizardTempData.candidateType === 'LAA' ? 'selected' : ''}>Lehramtsanwärter/in (LAA)</option>
                <option value="NQ" ${wizardTempData.candidateType === 'NQ' ? 'selected' : ''}>Nachqualifizierende Lehrkraft (NQ)</option>
                <option value="WB" ${wizardTempData.candidateType === 'WB' ? 'selected' : ''}>Weiterbildung (WB)</option>
              </select>
            </div>
          </div>

          <div class="form-row-2col">
            <div class="form-group">
              <label>Schulart</label>
              <select id="wiz_candidateSchoolType" class="form-control">
                <option value="Regelschule" ${wizardTempData.candidateSchoolType === 'Regelschule' ? 'selected' : ''}>Regelschule</option>
                <option value="Gymnasium" ${wizardTempData.candidateSchoolType === 'Gymnasium' ? 'selected' : ''}>Gymnasium</option>
                <option value="Grundschule" ${wizardTempData.candidateSchoolType === 'Grundschule' ? 'selected' : ''}>Grundschule</option>
                <option value="Berufsbildende Schule" ${wizardTempData.candidateSchoolType === 'Berufsbildende Schule' ? 'selected' : ''}>Berufsbildende Schule (BBS)</option>
                <option value="Förderzentrum" ${wizardTempData.candidateSchoolType === 'Förderzentrum' ? 'selected' : ''}>Förderzentrum (FÖP)</option>
              </select>
            </div>
            <div class="form-group">
              <label>Ausbildungsschule &amp; Ort</label>
              <input id="wiz_candidateSchool" class="form-control" value="${wizardTempData.candidateSchool}" placeholder="z. B. Staatliche Regelschule Erfurt-Süd" />
            </div>
          </div>

          <div class="form-row-2col">
            <div class="form-group">
              <label>1. Ausbildungsfach</label>
              <input id="wiz_candidateSubject1" class="form-control" value="${wizardTempData.candidateSubject1}" placeholder="z. B. Mathematik" />
            </div>
            <div class="form-group">
              <label>2. Ausbildungsfach</label>
              <input id="wiz_candidateSubject2" class="form-control" value="${wizardTempData.candidateSubject2}" placeholder="z. B. Physik" />
            </div>
          </div>
        </div>
      </div>
    `;
  }

  if (step === 3) {
    return `
      <div class="wizard-step-content">
        <div class="wizard-intro-box">
          <h3 style="margin:0 0 6px; font-size:1.05rem; color:#f8fafc; display:flex; align-items:center; gap:6px;">
            <i data-lucide="scale" class="w-4 h-4 text-cyan-400"></i> Ausbildungs- &amp; Prüfungsstandards (Thüringen)
          </h3>
          <p style="margin:0; font-size:0.85rem; color:#94a3b8;">
            Konfigurieren Sie die Standard-Notenskalen und Rechtsvorschriften gemäß ThürAZStPLVO.
          </p>
        </div>

        <div style="display:flex; flex-direction:column; gap:14px; margin-top:14px;">
          <div class="wizard-option-card">
            <label style="display:flex; align-items:flex-start; gap:12px; cursor:pointer;">
              <input type="radio" name="wizGradingScale" value="points15" checked style="margin-top:4px;" />
              <div>
                <strong>Amtliches 15-Punkte-System (ThürAZStPLVO)</strong>
                <div style="font-size:0.82rem; color:#64748b; margin-top:2px;">
                  15 bis 0 Notenpunkte mit automatischer Umrechnung in Schulnoten (1,0 bis 6,0) und Worturteile (sehr gut bis ungenügend).
                </div>
              </div>
            </label>
          </div>

          <div class="wizard-option-card">
            <label style="display:flex; align-items:flex-start; gap:12px; cursor:pointer;">
              <input type="checkbox" id="wiz_enableReminders" ${wizardTempData.enableReminders ? 'checked' : ''} style="margin-top:4px;" />
              <div>
                <strong>Automatische Fristenwarnungen aktivieren</strong>
                <div style="font-size:0.82rem; color:#64748b; margin-top:2px;">
                  Erinnert an das Ende der Orientierungsphase, das Zwischenbilanzgespräch nach 12 Monaten und die 2-Tage-Frist für Prüfungsentwürfe.
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>
    `;
  }

  if (step === 4) {
    return `
      <div class="wizard-step-content">
        <div class="wizard-intro-box">
          <h3 style="margin:0 0 6px; font-size:1.05rem; color:#f8fafc; display:flex; align-items:center; gap:6px;">
            <i data-lucide="folder" class="w-4 h-4 text-cyan-400"></i> PDF-Formulare &amp; Lokaler Ordner
          </h3>
          <p style="margin:0; font-size:0.85rem; color:#94a3b8;">
            Die Suite enthält bereits alle 8 amtlichen Thüringer Prüfungsformulare (F 230, F 010, F 030, F 050, F 220, F 240, F 242, F 250). Optional können Sie einen lokalen Ordner mit eigenen Vorlagen verknüpfen.
          </p>
        </div>

        <div style="text-align:center; padding: 24px 16px; background: rgba(255,255,255,0.03); border: 2px dashed rgba(255,255,255,0.12); border-radius: 10px; margin-top:14px;">
          <div style="margin-bottom: 8px; display:flex; justify-content:center;"><i data-lucide="folder-open" class="w-12 h-12 text-cyan-400 opacity-80"></i></div>
          <h4 style="margin:0 0 4px; color:#f8fafc;">Eigenen Formular-Ordner verknüpfen</h4>
          <p style="font-size:0.82rem; color:#94a3b8; margin:0 0 14px;">
            Verknüpfen Sie einen Ordner auf Ihrem Mac/PC, um Seminar-eigene PDF-Vorlagen direkt im Formular-Cockpit auszufüllen.
          </p>
          <button class="btn btn-outline" onclick="connectLocalFolder(); showToast('Ordner verknüpft!', '📁');">
            <i data-lucide="folder" class="w-4 h-4 inline-block mr-1"></i> Ordner jetzt auswählen...
          </button>
          <div style="font-size:0.75rem; color:#64748b; margin-top:8px;">(Kann auch jederzeit später in Tab 8 verknüpft werden)</div>
        </div>
      </div>
    `;
  }

  if (step === 5) {
    const candDisplay = wizardTempData.createCandidate && wizardTempData.candidateName ? wizardTempData.candidateName : 'Noch kein Kandidat (kann in der Suite angelegt werden)';
    return `
      <div class="wizard-step-content">
        <div class="wizard-intro-box" style="background:rgba(74,222,128,0.1); border-color:rgba(74,222,128,0.3);">
          <h3 style="margin:0 0 6px; font-size:1.05rem; color:#4ade80; display:flex; align-items:center; gap:6px;">
            <i data-lucide="check-circle-2" class="w-5 h-5 text-emerald-400"></i> Bereit für die Praxis!
          </h3>
          <p style="margin:0; font-size:0.85rem; color:#86efac;">
            Ihre Fachleiter 360° Suite ist vollständig konfiguriert und einsatzbereit.
          </p>
        </div>

        <div style="margin: 16px 0; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:14px;">
          <div style="font-size:0.85rem; font-weight:700; color:#cbd5e1; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">Zusammenfassung</div>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; font-size:0.85rem;">
            <div><strong>Fachleitung:</strong> ${wizardTempData.mentorTitle} ${wizardTempData.mentorName || 'Fachleitung'}</div>
            <div><strong>Studienseminar:</strong> ${wizardTempData.seminarLocation}</div>
            <div><strong>Hauptfach:</strong> ${wizardTempData.primarySubject}</div>
            <div><strong>Erster Kandidat:</strong> ${candDisplay}</div>
          </div>
        </div>

        <div style="font-size:0.85rem; font-weight:700; color:#cbd5e1; margin-bottom:8px;">Ihre 8 integrierten Werkzeuge:</div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px; font-size:0.8rem; color:#94a3b8;">
          <div style="display:flex; align-items:center; gap:6px;"><i data-lucide="layout-dashboard" class="w-3.5 h-3.5 text-cyan-400"></i> <strong>Tab 1:</strong> Dashboard &amp; Profil</div>
          <div style="display:flex; align-items:center; gap:6px;"><i data-lucide="play-circle" class="w-3.5 h-3.5 text-cyan-400"></i> <strong>Tab 2:</strong> Live-Hospitationsprotokoll</div>
          <div style="display:flex; align-items:center; gap:6px;"><i data-lucide="file-check-2" class="w-3.5 h-3.5 text-cyan-400"></i> <strong>Tab 3:</strong> Niederschrift</div>
          <div style="display:flex; align-items:center; gap:6px;"><i data-lucide="trending-up" class="w-3.5 h-3.5 text-cyan-400"></i> <strong>Tab 4:</strong> Progression &amp; Radar-Analyse</div>
          <div style="display:flex; align-items:center; gap:6px;"><i data-lucide="book-open" class="w-3.5 h-3.5 text-cyan-400"></i> <strong>Tab 5:</strong> Seminar- &amp; Modulplaner</div>
          <div style="display:flex; align-items:center; gap:6px;"><i data-lucide="git-compare" class="w-3.5 h-3.5 text-cyan-400"></i> <strong>Tab 6:</strong> Reflexions- &amp; Zielabgleich</div>
          <div style="display:flex; align-items:center; gap:6px;"><i data-lucide="calendar" class="w-3.5 h-3.5 text-cyan-400"></i> <strong>Tab 7:</strong> Fristen- &amp; Ausbildungsmatrix</div>
          <div style="display:flex; align-items:center; gap:6px;"><i data-lucide="folder" class="w-3.5 h-3.5 text-cyan-400"></i> <strong>Tab 8:</strong> Formular-Cockpit &amp; PDF-Export</div>
        </div>
      </div>
    `;
  }

  return "";
}

function toggleWizardCandidateFields(checked) {
  wizardTempData.createCandidate = checked;
  const fields = document.getElementById("wizCandidateFields");
  if (fields) {
    fields.style.display = checked ? "" : "none";
    fields.style.opacity = checked ? "1" : "0.5";
    fields.style.pointerEvents = checked ? "auto" : "none";
  }
}

function saveStepInputs(step) {
  if (step === 1) {
    const title = document.getElementById("wiz_mentorTitle")?.value.trim();
    const name = document.getElementById("wiz_mentorName")?.value.trim();
    const sem = document.getElementById("wiz_seminarLocation")?.value;
    const sub = document.getElementById("wiz_primarySubject")?.value.trim();

    if (title) wizardTempData.mentorTitle = title;
    if (name) wizardTempData.mentorName = name;
    if (sem) wizardTempData.seminarLocation = sem;
    if (sub) wizardTempData.primarySubject = sub;
  } else if (step === 2) {
    const candName = document.getElementById("wiz_candidateName")?.value.trim();
    const candType = document.getElementById("wiz_candidateType")?.value;
    const candSchoolType = document.getElementById("wiz_candidateSchoolType")?.value;
    const candSchool = document.getElementById("wiz_candidateSchool")?.value.trim();
    const candSub1 = document.getElementById("wiz_candidateSubject1")?.value.trim();
    const candSub2 = document.getElementById("wiz_candidateSubject2")?.value.trim();

    if (candName) wizardTempData.candidateName = candName;
    if (candType) wizardTempData.candidateType = candType;
    if (candSchoolType) wizardTempData.candidateSchoolType = candSchoolType;
    if (candSchool) wizardTempData.candidateSchool = candSchool;
    if (candSub1) wizardTempData.candidateSubject1 = candSub1;
    if (candSub2) wizardTempData.candidateSubject2 = candSub2;
  }
}

function wizardNextStep() {
  saveStepInputs(wizardCurrentStep);

  // Validation
  if (wizardCurrentStep === 1 && !wizardTempData.mentorName) {
    showToast("Bitte geben Sie Ihren Namen ein!", "⚠️");
    return;
  }

  if (wizardCurrentStep < WIZARD_TOTAL_STEPS) {
    wizardCurrentStep++;
    renderWizardModal();
  }
}

function wizardPrevStep() {
  saveStepInputs(wizardCurrentStep);
  if (wizardCurrentStep > 1) {
    wizardCurrentStep--;
    renderWizardModal();
  }
}

function finishSetupWizard() {
  saveStepInputs(wizardCurrentStep);

  // 1. Save Mentor Profile
  const fullMentor = `${wizardTempData.mentorTitle} ${wizardTempData.mentorName}`.trim();
  appState.mentorName = fullMentor || "Fachleitung";
  appState.seminarLocation = wizardTempData.seminarLocation || "Staatliches Studienseminar Erfurt";
  appState.wizardCompleted = true;

  // 2. Create Initial Candidate if provided
  if (wizardTempData.createCandidate && wizardTempData.candidateName) {
    const id = "laa_" + Date.now();
    const name = wizardTempData.candidateName;
    const type = wizardTempData.candidateType || "LAA";
    const gender = wizardTempData.candidateGender || "f";
    const schoolType = wizardTempData.candidateSchoolType || "Regelschule";
    const school = wizardTempData.candidateSchool || "";
    const subject1 = wizardTempData.candidateSubject1 || wizardTempData.primarySubject || "Fach 1";
    const subject2 = wizardTempData.candidateSubject2 || "Fach 2";

    appState.laas[id] = {
      id,
      name,
      gender,
      type,
      schoolType,
      school,
      subject1,
      subject2,
      mentor: fullMentor,
      startDate: wizardTempData.candidateStartDate,
      endDate: wizardTempData.candidateEndDate,
      cohort: `Einstellung ${new Date().getFullYear().toString().slice(-2)}-08`,
      currentPhase: "Orientierungsphase (1. Ausbildungshalbjahr)",
      competencies: { unterrichten: 3.0, erziehen: 3.0, beurteilen: 3.0, beraten: 3.0, weiterentwickeln: 3.0 },
      scoresHistory: [],
      selfScores: [3.0, 3.0, 3.0, 3.0, 3.0, 3.0],
      goals: [],
      visits: [],
      seminars: [],
      appointments: []
    };

    appState.selectedLAA = id;
  }

  saveState();
  closeSetupWizard();
  populateLAASelector();
  switchTab("tab-dashboard");
  showToast("🎉 Einrichtungsassistent erfolgreich abgeschlossen!", "🚀");
}

function closeSetupWizard() {
  const modalEl = document.getElementById("wizardModalOverlay");
  if (modalEl) {
    modalEl.classList.remove("active");
    modalEl.style.display = "none";
  }
}
