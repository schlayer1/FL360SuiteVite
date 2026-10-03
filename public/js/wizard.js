/**
 * SETUP WIZARD & ONBOARDING ENGINE (Fachleiter 360° Suite Pro)
 */

let wizardCurrentStep = 1;
const WIZARD_TOTAL_STEPS = 4;

const wizardTempData = {
  mentorTitle: "Studiendirektor/in",
  mentorName: "",
  seminarLocation: "Staatliches Studienseminar Gera",
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
    <div class="wizard-card modal-card" style="max-width:760px;">
      <!-- Wizard Header -->
      <div class="wizard-header">
        <div style="display:flex; align-items:center; gap:12px;">
          <div class="wizard-icon"><i data-lucide="compass" class="w-6 h-6 text-blue-500"></i></div>
          <div>
            <h2 style="margin:0; font-size:1.25rem; color:#f8fafc; font-weight:700;">Praxis-Guide &amp; Schnellstart</h2>
            <div style="font-size:0.8rem; color:#94a3b8;">Fachleiter 360° Suite • Thüringer Ausbildungsmanagement im echten Einsatz</div>
          </div>
        </div>
        <button class="modal-close" onclick="closeSetupWizard()" title="Schließen"><i data-lucide="x" class="w-4 h-4"></i></button>
      </div>

      <!-- Step Indicator / Progress Bar -->
      <div class="wizard-progress-wrap">
        <div class="wizard-progress-bar" style="width: ${(wizardCurrentStep / WIZARD_TOTAL_STEPS) * 100}%;"></div>
      </div>
      <div class="wizard-step-labels">
        <span class="${wizardCurrentStep >= 1 ? 'active' : ''}">1. Workflow-Überblick</span>
        <span class="${wizardCurrentStep >= 2 ? 'active' : ''}">2. Live-Mitschrift</span>
        <span class="${wizardCurrentStep >= 3 ? 'active' : ''}">3. Beratung &amp; Formulare</span>
        <span class="${wizardCurrentStep >= 4 ? 'active' : ''}">4. Fachleiter-Profil</span>
      </div>

      <!-- Wizard Step Content -->
      <div class="wizard-body" id="wizardStepBody">
        ${getWizardStepHtml(wizardCurrentStep)}
      </div>

      <!-- Wizard Footer / Navigation -->
      <div class="wizard-footer">
        <div>
          ${wizardCurrentStep === 1 ? `
            <button class="btn btn-outline" onclick="loadDemoCandidateAndClose()" style="border-color:rgba(37,99,235,0.4); background:rgba(37,99,235,0.08); color:#93c5fd;" title="Überspringt die Tour und lädt direkt den Muster-Referendar">
              <i data-lucide="flask-conical" class="w-4 h-4 mr-1 inline"></i> Sofort mit Muster-LAA testen
            </button>
          ` : `
            <button class="btn btn-outline" onclick="wizardPrevStep()">
              <i data-lucide="arrow-left" class="w-4 h-4 inline-block mr-1"></i> Zurück
            </button>
          `}
        </div>

        <div style="font-size:0.82rem; color:#94a3b8;">
          Schritt <strong>${wizardCurrentStep}</strong> von ${WIZARD_TOTAL_STEPS}
        </div>

        <div>
          ${wizardCurrentStep < WIZARD_TOTAL_STEPS ? `
            <button class="btn btn-primary" onclick="wizardNextStep()">
              Weiter <i data-lucide="arrow-right" class="w-4 h-4 inline-block ml-1"></i>
            </button>
          ` : `
            <button class="btn btn-primary" style="background: linear-gradient(135deg, #1d4ed8, #2563eb);" onclick="finishSetupWizard()">
              <i data-lucide="rocket" class="w-4 h-4 inline-block mr-1"></i> Suite jetzt starten
            </button>
          `}
        </div>
      </div>
    </div>
  `;

  modalEl.classList.add("active");
  modalEl.style.display = "flex";
  if (window.lucide) lucide.createIcons();
}

function getWizardStepHtml(step) {
  if (step === 1) {
    return `
      <div class="wizard-step-content">
        <div class="wizard-intro-box" style="background:rgba(37,99,235,0.08); border-color:rgba(37,99,235,0.25);">
          <h3 style="margin:0 0 6px; font-size:1.1rem; color:#f8fafc; display:flex; align-items:center; gap:8px;">
            <i data-lucide="sparkles" class="w-5 h-5 text-blue-400"></i> Der Fachleiter-Workflow im Überblick
          </h3>
          <p style="margin:0; font-size:0.86rem; color:#94a3b8; line-height:1.5;">
            Die Fachleiter 360° Suite begleitet Sie durch Ihren gesamten Betreuungs- und Prüfungszyklus nach Thüringer Ausbildungsordnung (ThürAZStPLVO / ThürNQVO) – 100% offline-fähig, datenschutzkonform und ohne Cloud-Zwang.
          </p>
        </div>

        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap:12px; margin-top:16px;">
          <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:14px;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
              <div style="padding:6px; border-radius:8px; background:rgba(37,99,235,0.15); color:#60a5fa;"><i data-lucide="clock" class="w-4 h-4"></i></div>
              <strong style="font-size:0.88rem; color:#f1f5f9;">1. Live im Unterricht</strong>
            </div>
            <p style="font-size:0.8rem; color:#94a3b8; margin:0; line-height:1.4;">
              Stoppuhr, Phasenwechsel per Klick, kriterienbezogene Mitschrift, Sprachnotizen &amp; Fokus-Modus.
            </p>
          </div>

          <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:14px;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
              <div style="padding:6px; border-radius:8px; background:rgba(16,185,129,0.15); color:#34d399;"><i data-lucide="printer" class="w-4 h-4"></i></div>
              <strong style="font-size:0.88rem; color:#f1f5f9;">2. Auswertung &amp; Ziele</strong>
            </div>
            <p style="font-size:0.8rem; color:#94a3b8; margin:0; line-height:1.4;">
              Reflexionsabgleich, Zielvereinbarungen und der neue <strong>1-Klick-Beratungsnachweis als 1-Seiter</strong>.
            </p>
          </div>

          <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:14px;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
              <div style="padding:6px; border-radius:8px; background:rgba(245,158,11,0.15); color:#fbbf24;"><i data-lucide="award" class="w-4 h-4"></i></div>
              <strong style="font-size:0.88rem; color:#f1f5f9;">3. Prüfung &amp; Formulare</strong>
            </div>
            <p style="font-size:0.8rem; color:#94a3b8; margin:0; line-height:1.4;">
              Amtliches 15-Punkte-Raster, Prüfungsrechner (§ 33) und 8 vorausgefüllte Thüringer PDF-Formulare (F 230 etc.).
            </p>
          </div>
        </div>

        <div style="margin-top:16px; padding:12px 16px; background:rgba(37,99,235,0.06); border-radius:10px; border:1px dashed rgba(37,99,235,0.3); display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap;">
          <div>
            <strong style="font-size:0.86rem; color:#bfdbfe;">Keine Lust zu tippen? Sofort ausprobieren:</strong>
            <div style="font-size:0.78rem; color:#94a3b8;">Lädt den Muster-Referendar „Maximilian Weber“ mit 4 fertigen UBs und Zielen.</div>
          </div>
          <button class="btn btn-primary" onclick="loadDemoCandidateAndClose()" style="font-size:0.82rem; padding:6px 14px;">
            <i data-lucide="flask-conical" class="w-4 h-4"></i>
            <span>Muster-LAA laden &amp; starten</span>
          </button>
        </div>
      </div>
    `;
  }

  if (step === 2) {
    return `
      <div class="wizard-step-content">
        <div class="wizard-intro-box">
          <h3 style="margin:0 0 6px; font-size:1.05rem; color:#f8fafc; display:flex; align-items:center; gap:8px;">
            <i data-lucide="clock" class="w-4 h-4 text-blue-500"></i> Praxis-Tipp: Das Live-Hospitationscockpit
          </h3>
          <p style="margin:0; font-size:0.85rem; color:#94a3b8; line-height:1.5;">
            Das Live-Cockpit ist für den Einsatz direkt im Klassenzimmer optimiert (Laptop oder iPad).
          </p>
        </div>

        <div style="display:flex; flex-direction:column; gap:10px; margin-top:14px;">
          <div style="display:flex; gap:12px; align-items:flex-start; padding:10px 14px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); border-radius:10px;">
            <div style="padding:6px; border-radius:8px; background:rgba(59,130,246,0.15); color:#60a5fa; flex-shrink:0;"><i data-lucide="zap" class="w-4 h-4"></i></div>
            <div>
              <strong style="font-size:0.86rem; color:#f8fafc;">Phasensteuerung per 1-Klick:</strong>
              <div style="font-size:0.8rem; color:#94a3b8; margin-top:2px;">
                Über die Phasen-Pills (Einstieg, Erarbeitung, Sicherung...) wechseln Sie mit einem Klick die Phase. Jede Mitschrift erhält automatisch die korrekte Phasenzuordnung und einen exakten Zeitstempel.
              </div>
            </div>
          </div>

          <div style="display:flex; gap:12px; align-items:flex-start; padding:10px 14px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); border-radius:10px;">
            <div style="padding:6px; border-radius:8px; background:rgba(16,185,129,0.15); color:#34d399; flex-shrink:0;"><i data-lucide="maximize-2" class="w-4 h-4"></i></div>
            <div>
              <strong style="font-size:0.86rem; color:#f8fafc;">Ablenkungsfreier Fokus-Modus:</strong>
              <div style="font-size:0.8rem; color:#94a3b8; margin-top:2px;">
                Klicken Sie auf <em>„Fokus-Modus“</em>, um Menüleisten und Kopfzeilen auszublenden. So haben Sie die maximale Arbeitsfläche für die Mitschrift.
              </div>
            </div>
          </div>

          <div style="display:flex; gap:12px; align-items:flex-start; padding:10px 14px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); border-radius:10px;">
            <div style="padding:6px; border-radius:8px; background:rgba(245,158,11,0.15); color:#fbbf24; flex-shrink:0;"><i data-lucide="mic" class="w-4 h-4"></i></div>
            <div>
              <strong style="font-size:0.86rem; color:#f8fafc;">Sprachnotizen &amp; Formulierungshilfen:</strong>
              <div style="font-size:0.8rem; color:#94a3b8; margin-top:2px;">
                Nutzen Sie den Button <em>„Diktieren“</em> für freihändige Mitschriften oder die didaktischen Phrasen-Bausteine aus den Thüringer Bildungsstandards.
              </div>
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
          <h3 style="margin:0 0 6px; font-size:1.05rem; color:#f8fafc; display:flex; align-items:center; gap:8px;">
            <i data-lucide="file-check-2" class="w-4 h-4 text-emerald-400"></i> Nachbesprechung, Nachweis &amp; Formulare
          </h3>
          <p style="margin:0; font-size:0.85rem; color:#94a3b8; line-height:1.5;">
            Nach dem Unterrichtsbesuch begleitet die Suite Ihr Auswertungsgespräch und die Dokumentenablage.
          </p>
        </div>

        <div style="display:flex; flex-direction:column; gap:10px; margin-top:14px;">
          <div style="display:flex; gap:12px; align-items:flex-start; padding:10px 14px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); border-radius:10px;">
            <div style="padding:6px; border-radius:8px; background:rgba(37,99,235,0.15); color:#60a5fa; flex-shrink:0;"><i data-lucide="printer" class="w-4 h-4"></i></div>
            <div>
              <strong style="font-size:0.86rem; color:#f8fafc;">1-Klick-Beratungsnachweis (1-Seiter):</strong>
              <div style="font-size:0.8rem; color:#94a3b8; margin-top:2px;">
                Klicken Sie bei jedem UB auf <em>„Nachweis“</em>. Es öffnet sich sofort ein druckfertiger, genau 1-seitiger Bogen für die Seminarakte mit Stammdaten, Zielen und Unterschriftenfeldern (LAA, Mentor, Fachleiter).
              </div>
            </div>
          </div>

          <div style="display:flex; gap:12px; align-items:flex-start; padding:10px 14px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); border-radius:10px;">
            <div style="padding:6px; border-radius:8px; background:rgba(16,185,129,0.15); color:#34d399; flex-shrink:0;"><i data-lucide="calendar" class="w-4 h-4"></i></div>
            <div>
              <strong style="font-size:0.86rem; color:#f8fafc;">Kalenderexport (.ics):</strong>
              <div style="font-size:0.8rem; color:#94a3b8; margin-top:2px;">
                Alle Fristen, Prüfungstermine und Hospitationen können mit 1 Klick als <code>.ics</code> in Apple Kalender, Google Kalender oder Outlook übertragen werden.
              </div>
            </div>
          </div>

          <div style="display:flex; gap:12px; align-items:flex-start; padding:10px 14px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); border-radius:10px;">
            <div style="padding:6px; border-radius:8px; background:rgba(139,92,246,0.15); color:#c084fc; flex-shrink:0;"><i data-lucide="columns-2" class="w-4 h-4"></i></div>
            <div>
              <strong style="font-size:0.86rem; color:#f8fafc;">Split-Screen Entwurfsbegutachtung:</strong>
              <div style="font-size:0.8rem; color:#94a3b8; margin-top:2px;">
                Öffnen Sie den PDF-Unterrichtsentwurf links und bewerten Sie parallel rechts im 15-Punkte-Raster oder im Formular F 230 – ohne ständiges Fensterwechseln.
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  if (step === 4) {
    return `
      <div class="wizard-step-content">
        <div class="wizard-intro-box">
          <h3 style="margin:0 0 6px; font-size:1.05rem; color:#f8fafc; display:flex; align-items:center; gap:8px;">
            <i data-lucide="user-check" class="w-4 h-4 text-blue-500"></i> Ihre Fachleiter-Stammdaten hinterlegen
          </h3>
          <p style="margin:0; font-size:0.85rem; color:#94a3b8; line-height:1.5;">
            Tragen Sie Ihre Daten ein, damit diese künftig automatisch in alle Gutachten, Nachweise und Formulare eingesetzt werden.
          </p>
        </div>

        <div class="form-row-2col" style="margin-top:14px;">
          <div class="form-group">
            <label>Amtsbezeichnung / Titel</label>
            <input id="wiz_mentorTitle" class="form-control" value="${wizardTempData.mentorTitle}" placeholder="z. B. Studiendirektor/in, Fachleiter/in" />
          </div>
          <div class="form-group">
            <label>Vor- und Nachname</label>
            <input id="wiz_mentorName" class="form-control" value="${wizardTempData.mentorName}" placeholder="z. B. Frau Sarah Könitzer" />
          </div>
        </div>

        <div class="form-row-2col">
          <div class="form-group">
            <label>Studienseminar / Dienstort</label>
            <select id="wiz_seminarLocation" class="form-control">
              <option value="Staatliches Studienseminar Gera" ${wizardTempData.seminarLocation.includes("Gera") ? "selected" : ""}>Staatliches Studienseminar Gera</option>
              <option value="Staatliches Studienseminar Erfurt" ${wizardTempData.seminarLocation.includes("Erfurt") ? "selected" : ""}>Staatliches Studienseminar Erfurt</option>
              <option value="Staatliches Studienseminar Jena" ${wizardTempData.seminarLocation.includes("Jena") ? "selected" : ""}>Staatliches Studienseminar Jena</option>
              <option value="Staatliches Studienseminar Nordhausen" ${wizardTempData.seminarLocation.includes("Nordhausen") ? "selected" : ""}>Staatliches Studienseminar Nordhausen</option>
            </select>
          </div>
          <div class="form-group">
            <label>Haupt-Ausbildungsfach</label>
            <input id="wiz_primarySubject" class="form-control" value="${wizardTempData.primarySubject}" placeholder="z. B. Mathematik, Deutsch, Sport" />
          </div>
        </div>

        <div style="margin-top:14px; padding:10px 14px; background:rgba(16,185,129,0.06); border:1px solid rgba(16,185,129,0.25); border-radius:10px; display:flex; align-items:center; gap:10px;">
          <i data-lucide="shield-check" class="w-5 h-5 text-emerald-400 flex-shrink-0"></i>
          <div style="font-size:0.78rem; color:#86efac; line-height:1.4;">
            <strong>Datenschutz-Garantie:</strong> Alle Daten bleiben ausschließlich auf Ihrem Gerät im verschlüsselten Browser-Speicher (IndexedDB). Keine Weitergabe an externe Server.
          </div>
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
  if (step === 4) {
    const title = document.getElementById("wiz_mentorTitle")?.value.trim();
    const name = document.getElementById("wiz_mentorName")?.value.trim();
    const sem = document.getElementById("wiz_seminarLocation")?.value;
    const sub = document.getElementById("wiz_primarySubject")?.value.trim();

    if (title) wizardTempData.mentorTitle = title;
    if (name) wizardTempData.mentorName = name;
    if (sem) wizardTempData.seminarLocation = sem;
    if (sub) wizardTempData.primarySubject = sub;
  }
}

function loadDemoCandidateAndClose() {
  if (typeof loadDemoCandidate === "function") {
    loadDemoCandidate();
  }
  closeSetupWizard();
  switchTab("tab-dashboard");
  showToast("Muster-Kandidat 'Maximilian Weber' geladen – Viel Spaß beim Testen!", "🚀");
}

function wizardNextStep() {
  saveStepInputs(wizardCurrentStep);

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
  if (wizardTempData.mentorName) {
    appState.mentorName = fullMentor;
  }
  appState.seminarLocation = wizardTempData.seminarLocation || "Staatliches Studienseminar Gera";
  appState.wizardCompleted = true;

  // 2. Ensure at least demo candidate exists if no candidates
  if (!appState.laas || Object.keys(appState.laas).length === 0) {
    if (typeof loadDemoCandidate === "function") {
      loadDemoCandidate();
    }
  }

  saveState();
  closeSetupWizard();
  populateLAASelector();
  switchTab("tab-dashboard");
  showToast("🎉 Bereit für die Praxis! Suite erfolgreich eingerichtet.", "✅");
}

function closeSetupWizard() {
  const modalEl = document.getElementById("wizardModalOverlay");
  if (modalEl) {
    modalEl.classList.remove("active");
    modalEl.style.display = "none";
  }
}
