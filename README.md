# AeroApply // Autonomous Job Search & Application Dispatcher

An intelligent, dual-corridor job search, bespoke Cover Letter PDF generator, and Outlook application dispatcher tailored for **German Engineering Recruitment Agencies** and **Sri Lankan Tech Portals**.

---

## 🌟 Key Features

1. **Dual-Corridor Job Discovery**:
   - **🇩🇪 Germany Private Placement Agencies (28 Premier Technical Agencies)**:
     - Hays Germany, Randstad, GULP, Michael Page, ManpowerGroup, Adecco, DIS AG, Robert Half, Brunel, Ferchau, Bertrandt, Akkodis, Alten, Amadeus FiRe, Piening Personal, Trenkwalder, Tempton, persona service, pluss, Kelly Services, Harvey Nash, Progressive Recruitment, ACTIEF, Horwood-Köhler, IRC Germany, Ingenieure International, Etengo AG, and home of jobs.
   - **🇱🇰 Sri Lanka & Topjobs LK**:
     - Topjobs.lk, LinkedIn LK, and direct tech companies (WSO2, IFS, Sysco LABS, LSEG, Virtusa, 99x, etc.).
   - **Universal Job Importer**: Paste ANY job URL from the internet to automatically scrape the title, company, requirements, recruiter email, and generate an instant application package.

2. **Bespoke Cover Letter PDF Generation**:
   - Aligns candidate's background directly with the job requirements.
   - Generates executive-standard **PDFs** with custom letterhead, candidate details, recipient address, DIN/ISO standards, and formal sign-offs.
   - Dual-language support: **English** and **Deutsch (Anschreiben)**.
   - Automatic download upon approval, plus a dedicated on-demand **Download PDF** button.

3. **Dual Candidate Profile & CV Management**:
   - **🇩🇪 German CV Profile (Lebenslauf)**: Highlights EU Blue Card / Opportunity Card (Chancenkarte) readiness, German language level, DIN/ISO engineering standards, and industrial systems.
   - **🇱🇰 Sri Lankan CV Profile**: Highlights enterprise architecture, cloud solutions, and full-stack leadership.
   - **Custom CV File Upload**: Upload your actual `.pdf` or `.docx` CVs directly through the UI.

4. **1-Click "Approve & Apply" Workflow (Outlook + Portal)**:
   - **Launches Microsoft Outlook**: Opens compose window with pre-filled recipient, subject, and tailored body.
   - **File Explorer Assistance**: Automatically opens Windows File Explorer with the generated Cover Letter PDF and candidate CV highlighted for effortless drag-and-drop into Outlook.
   - **Opens External Portal**: Launches the company or agency application portal in your default browser (Chrome/Edge).
   - **Tracks Applied Status**: Marks the role as Applied with timestamp and moves it into the Applied history section.

5. **Portal Autofill Assistant for Chrome & Edge**:
   - **Method 1 (Instant Bookmarklet)**: Drag the `⚡ AeroApply Autofill` button from the dashboard to your bookmarks bar. Click it on any job site (Workday, Personio, Lever, Taleo, etc.) to autofill your information in 1 click!
   - **Method 2 (Manifest V3 Extension)**: Load the included `extension/` folder in Chrome or Microsoft Edge (`edge://extensions` or `chrome://extensions` -> *Load unpacked*).

---

## 🚀 Quick Start Guide

### 1. Project Location
The project is located at:
```
C:\Job Applying Agent
```
*(Also accessible at `C:\Users\marja\.gemini\antigravity-ide\scratch\Job Applying Agent`)*

### 2. Starting the Server
Open PowerShell in the project directory:
```powershell
cd "C:\Job Applying Agent"
npm start
```
The server will start at:
```
http://localhost:3000
```

### 3. Open the Dashboard
Open your browser (Edge or Chrome) and navigate to:
```
http://localhost:3000
```

---

## 📁 Project Structure

```
C:\Job Applying Agent\
├── package.json                   # Dependencies: express, pdfkit, cheerio, axios, multer, open
├── server.js                      # Express backend & REST API endpoints
├── README.md                      # Documentation & user guide
├── data/
│   ├── jobs.json                  # Jobs database (Germany & Sri Lanka)
│   ├── agencies.json              # Full directory of 28 German agencies
│   ├── profiles.json              # Candidate profiles (Germany & Sri Lanka)
│   ├── applied_history.json       # Record of all applied positions
│   ├── uploads/                   # Candidate CV files
│   └── generated_letters/         # Generated Cover Letter PDFs
├── services/
│   ├── scraper.js                 # Web scraping & universal URL importer
│   ├── coverLetterGenerator.js    # AI-style tailored cover letters (EN/DE)
│   ├── pdfGenerator.js            # PDFKit executive letterhead generator
│   ├── outlookLauncher.js         # Windows Outlook mailto & file explorer trigger
│   └── starterCvs.js              # Auto-generates starter CV PDFs
├── extension/                     # Chrome & Edge Manifest V3 Autofill Extension
│   ├── manifest.json              # Extension manifest
│   ├── content.js                 # Smart portal form detection & autofill
│   ├── popup.html                 # Extension popup UI
│   └── popup.js                   # Extension popup logic & quick-copy chips
└── public/                        # Web Dashboard UI
    ├── index.html                 # Single page application
    ├── style.css                  # Modern dark glassmorphism CSS
    └── app.js                     # Client state & interactive workflows
```

---

## 🇩🇪 Private Placement Agencies in Germany

The dashboard has built-in directory mapping and filtering for all 28 German engineering recruitment firms:

| Agency | URL | Primary Focus |
|---|---|---|
| Hays Germany | https://www.hays.de | Engineering, Industrial, Automation |
| Randstad Deutschland | https://www.randstad.de | Broad Technical / Engineering Desks |
| GULP (Randstad Group) | https://www.gulp.de | IT & Engineering Contractors / Freelancers |
| Michael Page Germany | https://www.michaelpage.de | Engineering & Manufacturing |
| ManpowerGroup Deutschland | https://www.manpower.de | Industrial & Automation Placements |
| Adecco Germany | https://www.adecco.de | Engineering & Technical Services |
| DIS AG (Adecco Group) | https://www.dis-ag.com | Engineering, IT, Systems |
| Robert Half Germany | https://www.roberthalf.de | Cloud & Software Engineering |
| Brunel Germany | https://www.brunel.net/de | Technical Contractors & Work-Permit Logistics |
| Ferchau | https://www.ferchau.com | Germany's Largest Engineering Staffing Firm |
| Bertrandt | https://www.bertrandt.com | Automotive & Industrial Solutions |
| Akkodis Germany | https://www.akkodis.com/de-de | Smart Industry, Engineering & IT |
| Alten Germany | https://www.alten.de | Technology Consulting & Embedded |
| Amadeus FiRe | https://www.amadeus-fire.de | Technical & Professional Staffing |
| Piening Personal | https://www.piening-personal.de | Industrial / Technical Placements |
| Trenkwalder Deutschland | https://www.trenkwalder.com/de-de | Technical Staffing & IT Placements |
| Tempton Personaldienstleistungen | https://www.tempton.de | Technical & Digital Workforce |
| persona service | https://www.persona.de | Technical & Production Placements |
| pluss Personalmanagement | https://www.pluss.de | Multi-sector with Technical Desk |
| Kelly Services Germany | https://www.kellyservices.de | Engineering, Science & High-Tech |
| Harvey Nash Germany | https://www.harveynash.com/de | Tech & Engineering Recruitment |
| Progressive Recruitment | https://www.progressiverecruitment.com | Engineering, Automation & Clean Tech |
| ACTIEF Personalmanagement | https://www.actief.de | Technical & Industrial Solutions |
| Horwood-Köhler | https://www.horwood-koehler.com | Munich-based Science, Tech & Engineering |
| IRC International Employment | https://www.irc-germany.com | Munich Headhunting & Relocation |
| Ingenieure International | https://ingenieure-international.de/en | Recruits Foreign Engineers (Visas & Permits) |
| Etengo AG | https://www.etengo.de | IT & Engineering Freelancers |
| home of jobs | https://www.homeofjobs.de | Northern Germany Technical Placements |

---

## ✉️ Microsoft Outlook Sending Workflow

When you click **"Approve & Apply"**:
1. **Cover Letter PDF Download**: Automatically downloads to your browser's download folder.
2. **Outlook Compose Window**: Automatically launches with the recipient recruiter email, subject line, and customized body already typed.
3. **Attachment Staging**: Windows Explorer opens immediately with your **Tailored Cover Letter PDF** and your **Candidate CV** highlighted. You can simply drag and drop them into the Outlook window in 1 second!
4. **Portal Opening**: If an online application link exists, the portal opens in a new tab in Edge or Chrome.
5. **Applied History**: The job card updates with an **APPLIED** ribbon and moves into the Applied Jobs tab.
