# 🧭 Fachleiter 360° Suite Pro – Vite & Vercel Edition
### Praxis-Handbuch & Leitfaden für Fachleiterinnen und Fachleiter
**Staatliches Studienseminar für das Lehramt an Regelschulen in Gera**  
*Repository: [https://github.com/schlayer1/FL360SuiteVite](https://github.com/schlayer1/FL360SuiteVite)*

---

## 🌟 Herzlich willkommen zur modernisierten Vite-Edition!

Liebe Kolleginnen und Kollegen,

die **Fachleiter 360° Suite Pro** wurde von Fachleitern für Fachleiter entwickelt. Sie begleitet Sie durch alle Phasen der Ausbildung Ihrer Lehramtsanwärterinnen und Lehramtsanwärter (LAA) – von der Orientierungsphase über die Unterrichtsbesuche (UBs) bis hin zur 2. Staatsprüfung nach der Thüringer Ausbildungs- und Prüfungsordnung (**ThürAZStPLVO**).

Die neue **Vite-Edition** bietet:
* ⚡ **Blitzschnelle Ladezeit (< 350 ms):** Keine externen, blockierenden Skript-Downloads mehr.
* 🛡️ **Triple-Tier Data Defense:** Maximale Ausfallsicherheit gegen versehentliche Browser-Bereinigungen.
* 🎨 **Thüringen Slate & Indigo Design:** Ein hochprofessioneller, blendfreier Look für den Alltag und Seminar-Beamer.
* ☁️ **Vercel Edge Ready:** Schlüsselfertig optimiert für hochperformantes, DSGVO-konformes Hosting.

---

## 🔒 100 % Datenschutz & Triple-Tier Resilienz auf Ihrem Dienstgerät

> **Ihre Daten verlassen Ihr Dienstgerät zu keinem Zeitpunkt.**  
> * **Keine Cloud-Datenbank, kein Fremdserver:** Alle Personen- und Bewertungsdaten, Notizen und Gutachten verbleiben verschlüsselt auf Ihrem eigenen Rechner/iPad.
> * **100 % DSGVO- & Thüringen-konform:** Keine Weitergabe an externe KI- oder Tracking-Dienste.
> * **Funktioniert vollständig offline:** Im Klassenraum ohne Schul-WLAN uneingeschränkt nutzbar.

### Die drei Schutzmechanismen im Hintergrund:
1. **Persistent Storage API (`navigator.storage.persist()`):**  
   Die App beansprucht beim Browser das Recht auf dauerhaften Speicher. Safari und Chrome löschen Ihre Daten auch bei vollem Gerätespeicher nicht automatisch im Hintergrund.
2. **IndexedDB Dual-Persistence:**  
   Robuste, asynchrone Datenbank im Browser, die auch große PDF-Unterrichtsentwürfe und lange Protokolle ohne Quota-Grenzen zuverlässig sichert.
3. **One-Click Backup-Sentinel & Schließschutz:**  
   Vor dem Schließen des Fensters erinnert die Suite an ungespeicherte Live-Mitschriften und schlägt bei Bedarf mit einem Klick eine JSON-Komplettsicherung vor.

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

## 🔄 Der typische Arbeitsablauf: Von der Hospitation bis zum Gutachten

```
[1. LAA auswählen] ──▶ [2. Live-Cockpit (Hospitation)] ──▶ [3. Nachbesprechung (Reflexion)] ──▶ [4. Niederschrift / PDF-Druck]
```

### Schritt 1: Referendar auswählen oder neu anlegen
* **Oben links:** Wählen Sie die gewünschte Akte oder erstellen Sie mit **`+ Neuer LAA`** ein neues Profil.
* Im Menü **`Aktionen & Daten`** können Sie jederzeit ein Backup importieren oder das Musterprofil „Maximilian Weber“ zum Ausprobieren laden.

### Schritt 2: Der Unterrichtsbesuch (Reiter: `Live-Hospitation`)
1. **Beratungsschwerpunkt im Blick:** Direkt vor Stundenbeginn auswählen oder spontan eintippen.
2. **Unterrichtsphasen & Stoppuhr:** Auf **`Start`** klicken und Phasen (*Einstieg*, *Erarbeitung*, *Sicherung* etc.) mit einem Klick protokollieren.
3. **Phrasen-Baukasten (31 Bausteine) & Diktat:** Vorgefertigte Kriterienformulierungen anklicken oder Spracheingabe nutzen.
4. **Hospitation abschließen:** Thema eingeben, Notenpunkte (1–15 Pkt.) wählen und direkt in die Entwicklungsakte übernehmen.

### Schritt 3: Die Nachbesprechung (Reiter: `Reflexionsabgleich`)
* Gegenüberstellung Ihrer Beobachtungen mit der Selbsteinschätzung der Lehrkraft im Spinnennetz-Diagramm.
* Farbliche Differenz-Indikatoren heben Gesprächsschwerpunkte sofort hervor.

### Schritt 4: Niederschrift & Gutachten (Reiter: `Niederschrift & Entwurf` / `Formular-Cockpit`)
* **15-Punkte-Bewertungsraster:** Bepunktung nach ThürAZStPLVO mit intelligentem Lücken-Finder.
* **Word/RTF-Export & PDF-Druck:** Formatgetreue Niederschriften und amtliche Vordrucke (F 010, F 030, F 050, F 220, F 230 etc.).

---

## 🗂️ Übersicht aller 8 Arbeitsbereiche der Suite

| Symbol | Bereich | Funktion |
| :--- | :--- | :--- |
| 📊 | **Dashboard & Profil** | Schaltzentrale mit Ausbildungsmonat (1–18), Notenhistorie, Fristen und Kompetenzradar. |
| ⏱️ | **Live-Hospitation** | Digitales Mitschriften-Cockpit mit Stoppuhr, Phasen-Pills, Phrasen-Baukasten und Diktat. |
| 🔄 | **Reflexionsabgleich** | Vorbereitung des Beratungsgesprächs: Fachleiter-Sicht vs. Anwärter-Selbsteinschätzung. |
| 📈 | **Progression & Radar** | Visuelle Langzeitentwicklung über alle 4 Pflicht-UBs in den 6 Thüringer Dimensionen. |
| 📝 | **Niederschrift & Entwurf** | Integrierter Split-Screen für Unterrichtsentwürfe und amtliche 15-Punkte-Niederschrift. |
| 📅 | **Fristen & Noten** | Fristenkalender und amtlicher Prüfungsrechner (§ 33 ThürAZStPLVO). |
| 📋 | **Formular-Cockpit** | Ausfüllen und Generieren offizieller Formulare und Gutachten. |
| 📚 | **Seminarplaner** | Modulverwaltung und Kompetenztransfer für die Fachseminare. |

---

*Entwickelt mit ❤️ für Fachleiterinnen & Fachleiter am Staatlichen Studienseminar für das Lehramt an Regelschulen in Gera.*
