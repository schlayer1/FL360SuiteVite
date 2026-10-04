# 🧭 Fachleiter 360° Suite Pro – Vite & Vercel Edition
### Praxis-Handbuch & Leitfaden für Fachleiterinnen und Fachleiter
**Staatliches Studienseminar für das Lehramt an Regelschulen in Gera**  
*Repository: [https://github.com/schlayer1/FL360SuiteVite](https://github.com/schlayer1/FL360SuiteVite)* • *Live-App: [https://fl-360-suite-vite.vercel.app](https://fl-360-suite-vite.vercel.app)*

---

## 🌟 Herzlich willkommen zur modernisierten Vite-Edition!

Liebe Kolleginnen und Kollegen,

die **Fachleiter 360° Suite Pro** wurde von Fachleitern für Fachleiter entwickelt. Sie begleitet Sie durch alle Phasen der Ausbildung Ihrer Lehramtsanwärterinnen und Lehramtsanwärter (LAA) sowie Nachqualifikanten (NQ) – von der Orientierungsphase über die Unterrichtsbesuche (UBs) bis hin zur 2. Staatsprüfung nach der Thüringer Ausbildungs- und Prüfungsordnung (**ThürAZStPLVO**).

Die neue **Vite-Edition** bietet:
* ⚡ **Blitzschnelle Ladezeit (< 350 ms):** Vollständig modular gebündelt über Vite 6, keine externen blockierenden CDN-Skripte.
* 🛡️ **Triple-Tier Data Defense:** Maximale Ausfallsicherheit gegen versehentliche Browser-Bereinigungen & nativer Schließschutz während laufender Hospitationen.
* 🎨 **Thüringen Slate & Indigo Design:** Ein hochprofessioneller, blendfreier Look für den Alltag und Seminar-Beamer mit vollständiger Tastaturnavigation.
* 📄 **1-Klick Beratungsnachweis (1-Seiter):** Kompakter, druckfertiger Nachweis für Akte und Schulleitung auf Knopfdruck.
* ☁️ **Vercel Edge Ready:** Schlüsselfertig optimiert für hochperformantes, DSGVO-konformes Hosting.

---

## 🔒 100 % Datenschutz & Triple-Tier Resilienz auf Ihrem Dienstgerät

> **Ihre Daten verlassen Ihr Dienstgerät zu keinem Zeitpunkt.**  
> * **Keine Cloud-Datenbank, kein Fremdserver:** Alle Personen- und Bewertungsdaten, Notizen und Gutachten verbleiben lokal auf Ihrem eigenen Rechner/iPad.
> * **100 % DSGVO- & Thüringen-konform:** Keine Weitergabe an externe KI- oder Tracking-Dienste.
> * **Funktioniert vollständig offline:** Im Klassenraum ohne Schul-WLAN uneingeschränkt nutzbar (integrierte Progressive Web App).

### Die vier Schutzmechanismen im Hintergrund:
1. **Persistent Storage API (`navigator.storage.persist()`):**  
   Die App beansprucht beim Browser das Recht auf dauerhaften Speicher. Safari und Chrome löschen Ihre Daten auch bei vollem Gerätespeicher nicht automatisch im Hintergrund.
2. **IndexedDB Dual-Persistence:**  
   Robuste, asynchrone Datenbank im Browser, die auch große PDF-Unterrichtsentwürfe und lange Protokolle ohne Quota-Grenzen zuverlässig sichert.
3. **One-Click Backup-Sentinel:**  
   Erinnert an regelmäßige Datensicherungen und ermöglicht mit einem Klick eine vollständige JSON-Komplettsicherung.
4. **Nativer Schließschutz (`beforeunload`-Guard):**  
   Solange der Hospitationstimer aktiv läuft, verhindert das System das versehentliche Schließen des Tabs oder Fensters mit einer Sicherheitswarnung.

---

## ⚡ Neu in Version 2.2.0 & 2.3.0: GoodNotes-Annotationen & Formular-Cockpit Split-Screen

| Feature | Beschreibung | Nutzen in der Praxis |
| :--- | :--- | :--- |
| 🖍️ **GoodNotes PDF-Annotationen** | Vollausgestattetes Freihand- & Textmarker-System direkt auf dem PDF-Unterrichtsentwurf: Textmarker (Gelb, Grün, Pink, Blau), Stift (Rot, Schwarz), Radierer, Notiz-Pins und Undo. | Handschriftliches Kommentieren und Markieren von Entwürfen wie auf dem iPad – persistent pro Kandidat & Seite gesichert. |
| 📌 **Digitale Randnotiz-Pins** | Klick-Pins direkt auf dem Entwurf zum Anheften nummerierter Fachleiter-Notizen und spontaner Prüfungsfragen. | Wichtige Diskussionspunkte fürs Kolloquium direkt an der Fundstelle im Entwurf verankern. |
| 📑 **Formular-Cockpit PDF Upload & Split-Screen** | PDF-Entwürfe können direkt im Formular-Cockpit hochgeladen oder als Muster geladen werden – parallel zu amtlichen Formularen wie F 230. | Formulare ausfüllen mit dem Unterrichtsentwurf des Kandidaten direkt daneben im Blick. |
| 🔄 **Universelles PDF-Blättern** | Nahtloses Vor- und Zurückblättern mehrseitiger Entwürfe in allen 3 Ansichten (Entwurfs-Arbeitsplatz, 15-Punkte-Raster, Formular-Cockpit). | Vollständige Durchsicht von Bedingungsanalyse bis Verlaufsplan ohne Wechsel der Ansicht. |
| ⌨️ **Live-Shortcuts (`Alt + 1..5`)** | Wechselt die Unterrichtsphase im Flug (`1`: Einstieg, `2`: Erarbeitung, `3`: Sicherung, `4`: Vertiefung, `5`: Reflexion). | Kein Wechsel zur Maus/Dropdown während des Unterrichtsgeschehens nötig. |
| ⏩ **Protokoll-Schnellabsendung** | `Enter` bzw. `Ctrl/Cmd + Enter` speichert die Beobachtung und setzt den Fokus sofort zurück. | Schnelles Mitschreiben im 10-Finger-System ohne Unterbrechung. |
| 📋 **„Mitschrift kopieren“** | 1-Klick-Export des gesamten Live-Protokollstroms als formatierter Text mit Zeitstempeln und Metadaten in die Zwischenablage. | Perfekt für schnelles Einfügen in E-Mails, Besprechungsnotizen oder Word/Pages. |
| ✨ **Phrasen-Puls & Auto-Fokus** | Klick auf Beobachtungs-Chips erzeugt visuelles Puls-Feedback und setzt den Cursor direkt an das Textende. | Sofortiges Weitertippen nach Auswahl vorgefertigter Kriterienformulierungen. |
| 🛡️ **Hospitations-Schließschutz** | Aktiver Browser-Schutz vor versehentlichem Tab-Schließen bei laufendem Timer. | Verhindert irreversiblen Verlust ungespeicherter Unterrichtsbeobachtungen. |
| 📄 **1-Klick-Beratungsnachweis** | Generiert aus dem Dashboard einen formalen 1-seitigen Beratungsnachweis mit Unterschriftsfeldern. | Zeitersparnis bei der Dokumentationspflicht gegenüber Schulleitung und Seminar. |
| 📅 **.ics-Kalenderexport** | Exportiert Prüfungsfristen und Prüfungstage direkt als Kalenderdatei für Outlook, Apple Kalender oder Google Kalender. | Verlässliche Fristenkontrolle ohne manuelles Eintragen. |
| 👤 **Candidate Summary Banner** | Kompaktes Übersichtsbanner mit Status, Ausbildungstyp (LAA / NQ), Fächern und aktuellem Ausbildungsmonat. | Sofortige Orientierung beim Wechsel zwischen mehreren Anwärtern. |

---

## 🔄 Der typische Arbeitsablauf: Von der Hospitation bis zum Gutachten

```
[1. LAA/NQ auswählen] ──▶ [2. Live-Cockpit (Hospitation)] ──▶ [3. Nachbesprechung (Reflexion)] ──▶ [4. Niederschrift / Gutachten]
```

### Schritt 1: Referendar auswählen oder neu anlegen
* **Oben links:** Wählen Sie die gewünschte Akte oder erstellen Sie mit **`+ Neuer LAA`** ein neues Profil (LAA nach ThürAZStPLVO oder Nachqualifikant nach ThürLbG).
* Das **Candidate Summary Banner** zeigt sofort Fach, Schule, Mentor und Ausbildungsfortschritt an.
* Im Menü **`Aktionen & Daten`** können Sie jederzeit ein Backup importieren oder das Musterprofil „Maximilian Weber“ zum Ausprobieren laden.

### Schritt 2: Der Unterrichtsbesuch (Reiter: `Live-Hospitation`)
1. **Beratungsschwerpunkt im Blick:** Direkt vor Stundenbeginn auswählen oder spontan eintippen.
2. **Unterrichtsphasen & Stoppuhr:** Auf **`Start`** klicken oder mit **`Alt + 1..5`** die Phase blitzschnell anpassen.
3. **Phrasen-Baukasten (31 Bausteine) & Diktat:** Vorgefertigte Kriterienformulierungen anklicken (mit Auto-Fokus) oder Spracheingabe nutzen.
4. **Mitschrift kopieren:** Bei Bedarf vor dem Schließen mit einem Klick alle Beobachtungen in die Zwischenablage übernehmen.
5. **Hospitation abschließen:** Thema eingeben, Notenpunkte (1–15 Pkt.) wählen und direkt in die Entwicklungsakte übernehmen.

### Schritt 3: Die Nachbesprechung (Reiter: `Reflexionsabgleich`)
* Gegenüberstellung Ihrer Beobachtungen mit der Selbsteinschätzung der Lehrkraft im Spinnennetz-Diagramm.
* Farbliche Differenz-Indikatoren heben Stärken und Entwicklungsfelder für das Beratungsgespräch hervor.

### Schritt 4: Niederschrift & Gutachten (Reiter: `Niederschrift & Entwurf` / `Formular-Cockpit`)
* **15-Punkte-Bewertungsraster:** Bepunktung nach ThürAZStPLVO mit intelligentem Lücken-Finder.
* **1-Klick-Beratungsnachweis:** Schneller DIN-A4-Ausdruck zur Bestätigung der durchgeführten Beratung.
* **Word/RTF-Export & PDF-Druck:** Formatgetreue Niederschriften und amtliche Vordrucke (F 010, F 030, F 050, F 220, F 230 etc.).

---

## 🗂️ Übersicht aller 8 Arbeitsbereiche der Suite

| Symbol | Bereich | Funktion |
| :--- | :--- | :--- |
| 📊 | **Dashboard & Profil** | Schaltzentrale mit Ausbildungsmonat (1–18), Notenhistorie, 1-Klick-Beratungsnachweis, Fristen und Kompetenzradar. |
| ⏱️ | **Live-Hospitation** | Digitales Mitschriften-Cockpit mit Stoppuhr, Phasen-Pills, Tastatur-Shortcuts (`Alt+1..5`), Phrasen-Baukasten und Clipboard-Export. |
| 🔄 | **Reflexionsabgleich** | Vorbereitung des Beratungsgesprächs: Fachleiter-Sicht vs. Anwärter-Selbsteinschätzung. |
| 📈 | **Progression & Radar** | Visuelle Langzeitentwicklung über alle Pflicht-UBs in den 6 Thüringer Dimensionen. |
| 📝 | **Niederschrift & Entwurf** | Integrierter Split-Screen für Unterrichtsentwürfe und amtliche 15-Punkte-Niederschrift. |
| 📅 | **Fristen & Noten** | Fristenkalender mit .ics-Export und amtlicher Prüfungsrechner (§ 33 ThürAZStPLVO) inkl. Vornotenberechnung. |
| 📋 | **Formular-Cockpit** | Ausfüllen und Generieren offizieller Formulare und Gutachten mit automatischer Datenübernahme. |
| 📚 | **Seminarplaner** | Modulverwaltung und Kompetenztransfer für die Fachseminare. |

---

## 🚀 Entwicklung & Vercel-Bereitstellung

### Lokale Entwicklung
```bash
# 1. Abhängigkeiten installieren
npm install

# 2. Lokalen Entwicklungsserver starten
npm run dev

# 3. Produktions-Build erstellen
npm run build

# 4. Vorschau des gebauten Bundles testen
npm run preview
```

### Hosting auf Vercel
1. Öffnen Sie [vercel.com](https://vercel.com) und verbinden Sie Ihr GitHub-Konto.
2. Wählen Sie das Repository `schlayer1/FL360SuiteVite` aus.
3. Vercel erkennt automatisch das Framework **Vite**:
   * **Build Command:** `npm run build`
   * **Output Directory:** `dist`
4. Die beiliegende [`vercel.json`](file:///Users/nicolekeller/Desktop/Antigravity%20Projekte/Fachleiter%20360%20Suite/vercel.json) sorgt automatisch für perfekte Cache-Header, SPA-Rewrites und strikte Sicherheitsrichtlinien.
5. Klicken Sie auf **Deploy** – fertig!

---

*Entwickelt mit ❤️ für Fachleiterinnen & Fachleiter am Staatlichen Studienseminar für das Lehramt an Regelschulen in Gera.*
