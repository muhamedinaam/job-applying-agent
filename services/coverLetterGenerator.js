/**
 * Zero-Placeholder Cover Letter & Email Generator
 * Tailored specifically for Muhammadhu Inaam, Mechatronics Engineer (Automation & Controls)
 * Produces 100% submission-ready cover letters and email drafts with ZERO placeholders.
 * Includes dedicated Freelance / Contractor pitches for German & International desks.
 */

function generateCoverLetter(job, profile, language = 'en') {
  const candidateName = profile.name || "Muhammadhu Inaam";
  const candidateTitle = profile.title || "Mechatronics Engineer — Automation & Controls";
  const candidateAddress = profile.address || "Beruwala, Kalutara, Sri Lanka";
  const candidateEmail = profile.email || "mohamedinnam787@gmail.com";
  const candidatePhone = profile.phone || "+94 77 089 6608";
  const candidateLinkedIn = profile.linkedin || "https://www.linkedin.com/in/muhammadhu-inaam-698566272/";

  const companyName = job.company || "Your Engineering Team";
  const jobTitle = job.title || "Mechatronics / Automation Engineer";
  const jobLocation = job.location || (job.countryCode === 'DE' ? "Germany" : "Sri Lanka");
  const agencyName = (job.agency && job.agency !== "Direct Placement" && job.agency !== "Direct / Topjobs LK") ? job.agency : null;

  const todayDE = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const todayEN = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const isGermanJob = job.countryCode === 'DE' || job.country === 'Germany';
  const isFreelance = (job.workType && (job.workType.includes('Freelance') || job.workType.includes('Contract'))) ||
                      (job.tags && (job.tags.includes('Freelance') || job.tags.includes('Contract'))) ||
                      (job.title && (job.title.toLowerCase().includes('freelance') || job.title.toLowerCase().includes('freiberuflich') || job.title.toLowerCase().includes('contract')));

  // ==========================================
  // 1. GERMAN FREELANCE / CONTRACTOR LETTER
  // ==========================================
  if (isFreelance && (language === 'de' || (isGermanJob && language === 'de'))) {
    return `${candidateName}
${candidateAddress}
Telefon: ${candidatePhone} | E-Mail: ${candidateEmail}
LinkedIn: ${candidateLinkedIn}

Datum: ${todayDE}

An das Projekt- & Recruiting-Team
${companyName}
${agencyName ? `Vermittlung über: ${agencyName}` : ''}
${jobLocation}

Projektangebot / Freiberufliche Bewerbung: ${jobTitle}

Sehr geehrte Damen und Herren,

mit großem Interesse bewerbe ich mich für das aktuelle Projektmandat als "${jobTitle}" bei ${companyName}.

Als selbstständiger Mechatronik-Ingenieur mit fundierter praktischer Erfahrung in der industriellen Automatisierung, SPS- und SCADA-Programmierung (Siemens TIA Portal S7-1500, Beckhoff TwinCAT), Robotik-Integration (KUKA / ABB) und Schaltschrank-/Steuerungstechnik stehe ich Ihnen für anspruchsvolle Projektaufgaben flexibel zur Verfügung.

Eckdaten zu meinem Contractor-Profil:
• Verfügbarkeit: Kurzfristig / ab sofort einsatzbereit (Vorlaufzeit: 1-2 Wochen)
• Einsatzmodell: Vor-Ort-Inbetriebnahmen deutschlandweit sowie hybride/Remote-Software- und SPS-Entwicklung
• Stundensatz-Orientierung: ${job.salary && job.salary.includes('hour') ? job.salary : '85 € - 95 € / Std. all-in (verhandelbar je nach Projektumfang)'}
• Qualifikation: Bachelor of Engineering Technology (Hons) in Mechatronik (University of Sri Jayewardenepura) sowie praxisorientierte Fachausbildung in Industrieller Automatisierung (SPS) am Ceylon German Technical Training Institute (CGTTI nach deutschem Standard)
• Abrechnung: B2B-Projektabrechnung mit transparenter Leistungsdokumentation

In meinen bisherigen Industrieprojekten habe ich komplexe Automatisierungs- und Mechatronik-Aufgaben eigenverantwortlich umgesetzt:
• Programmierung, Virtual Commissioning und Inbetriebnahme von SPS-, HMI- und SCADA-Systemen für Fertigungslinien
• Mechanische und steuerungstechnische Konzeptionierung von CNC-Bearbeitungssystemen inklusive Schrittmotor- und Servoverstärker-Parametrierung
• Fehlerdiagnose, Oszilloskop-Messungen und Signaloptimierung an industriellen Sensor- und Aktor-Schnittstellen

Ich freue mich über die Gelegenheit, Details zum Projektumfang und zur zeitlichen Einbindung in einem persönlichen Gespräch mit Ihnen abzustimmen.

Mit freundlichen Grüßen,

${candidateName}
Freiberuflicher Mechatronik- & Automatisierungs-Ingenieur
Telefon: ${candidatePhone} | E-Mail: ${candidateEmail}`;
  }

  // ==========================================
  // 2. ENGLISH FREELANCE / CONTRACTOR LETTER
  // ==========================================
  if (isFreelance) {
    return `${candidateName}
${candidateAddress}
Phone: ${candidatePhone} | Email: ${candidateEmail}
LinkedIn: ${candidateLinkedIn}

Date: ${todayEN}

To the Project Delivery & Staffing Team
${companyName}
${agencyName ? `Represented via: ${agencyName}` : ''}
${jobLocation}

Subject: Contractor Project Proposal — ${jobTitle}

Dear Project & Recruitment Leadership,

I am writing to express my strong interest in the contract / freelance assignment for "${jobTitle}" with ${companyName}.

As an independent Mechatronics Engineer specializing in industrial automation, PLC/SCADA programming, robotics integration, and process controls, I offer immediate, hands-on technical capacity to support your project lifecycle from system architecture to on-site commissioning.

Contractor Profile & Key Terms:
• Availability: Immediate / Within 1-2 weeks deployment notice
• Engagement Model: Flexible on-site commissioning (Germany/International) and remote PLC/firmware engineering
• Target Rate: ${job.salary && job.salary.includes('hour') ? job.salary : '€80 - €95 / hour (aligned with project scope)'}
• Technical Qualifications: BEng (Hons) in Mechatronics Technology + specialized Industrial Automation & PLC certification from the Ceylon German Technical Training Institute (CGTTI)
• Core Toolchain: Siemens TIA Portal (S7-1200/1500), Beckhoff TwinCAT, SCADA/HMI, KUKA/ABB Robotics, SolidWorks CAD, Embedded C/C++

Key Project Capabilities I Bring:
• End-to-end PLC logic development, fieldbus integration (Profinet, CAN, Modbus), and HMI interface engineering
• Design, fabrication, and motion control integration for automated CNC machines and robotic cells
• Rapid diagnostics, sensor calibration, and functional safety compliance testing to minimize plant downtime

Attached is my comprehensive CV and reference project portfolio. I welcome the opportunity to discuss the project milestones and technical deliverables.

Sincerely,

${candidateName}
Freelance Mechatronics & Automation Specialist
Phone: ${candidatePhone} | Email: ${candidateEmail}`;
  }

  // ==========================================
  // 3. STANDARD GERMAN ANSCHREIBEN (FULL-TIME)
  // ==========================================
  if (language === 'de' || (isGermanJob && language === 'de')) {
    return `${candidateName}
${candidateAddress}
Telefon: ${candidatePhone} | E-Mail: ${candidateEmail}
LinkedIn: ${candidateLinkedIn}

Datum: ${todayDE}

An die Personalabteilung
${companyName}
${agencyName ? `Vermittlung über: ${agencyName}` : ''}
${jobLocation}

Bewerbung als ${jobTitle}

Sehr geehrte Damen und Herren,

mit großem Interesse bewerbe ich mich bei ${companyName} um die Position als ${jobTitle}. Als Mechatronik-Ingenieur mit fundierter praktischer Erfahrung in der SPS-, HMI- und SCADA-Automatisierung, industrieller Steuerungstechnik und Embedded-Entwicklung möchte ich meine Fähigkeiten gewinnbringend in Ihre anspruchsvollen Projekte einbringen.

Meinen Bachelor of Engineering Technology (Hons) in Mechatronik habe ich an der University of Sri Jayewardenepura absolviert. Zudem habe ich eine praxisorientierte Fachausbildung in Industrieller Automatisierung (SPS) und Elektronik am renommierten Ceylon German Technical Training Institute (CGTTI) abgeschlossen, das nach deutschen Standards ausbildet.

In meinen bisherigen Stationen bei Skipod Manufacturer und AXEL Industries habe ich komplexe Mechatronik-Projekte eigenverantwortlich von der Konzeption bis zur Inbetriebnahme umgesetzt:
• Entwicklung und Fertigung eines industriellen CNC-Laserschneiders von Grund auf inklusive Konstruktion, Leistungselektronik und Schrittmotorsteuerung
• Programmierung, Inbetriebnahme und Instandhaltung von SPS-, HMI- und SCADA-Systemen für industrielle Fertigungslinien zur Steigerung der Anlagenverfügbarkeit
• Fehlersuche und Optimierung elektronischer Steuerungen mit modernster Messtechnik (Oszilloskop, Logikanalysator)

Mit meiner abgeschlossenen Ingenieurausbildung erfülle ich alle Voraussetzungen für das beschleunigte Fachkräfteverfahren (Chancenkarte / EU Blue Card). Eine Relocation nach Deutschland ist für mich kurzfristig realisierbar.

Über die Gelegenheit, mich Ihnen in einem persönlichen Gespräch vorzustellen, freue ich mich sehr.

Mit freundlichen Grüßen,

${candidateName}
Mechatronics Engineer — Automation & Controls`;
  }

  // ==========================================
  // 4. STANDARD ENGLISH COVER LETTER (FULL-TIME)
  // ==========================================
  return `${candidateName}
${candidateAddress}
Phone: ${candidatePhone} | Email: ${candidateEmail}
LinkedIn: ${candidateLinkedIn}

Date: ${todayEN}

To the Hiring Team
${companyName}
${agencyName ? `Represented via: ${agencyName}` : ''}
${jobLocation}

Application for ${jobTitle}

Dear Hiring Team,

I am writing to express my enthusiastic interest in the ${jobTitle} role at ${companyName}. As a Mechatronics Engineer equipped with rigorous hands-on training in PLC, HMI, and SCADA automation, industrial control systems, and mechanical-electronic design, I am eager to contribute effectively to your technical operations.

I hold a Bachelor of Engineering Technology (Hons) in Mechatronics from the University of Sri Jayewardenepura, alongside specialized practical qualifications in Industrial Automation & Electronics from the Ceylon German Technical Training Institute (CGTTI), recognized for rigorous German-standard industrial curricula.

Across my roles at Skipod Manufacturer and AXEL Industries, I spearheaded end-to-end mechatronics engineering initiatives:
• Engineered and fabricated an industrial-grade CNC laser cutting machine from concept to operation, integrating motor drives, power distribution, and safety interlocks
• Programmed, validated, and optimized industrial PLC, HMI, and SCADA automation architectures to elevate production yield and reduce cycle downtime
• Conducted advanced diagnostics, signal profiling, and circuit troubleshooting using oscilloscopes, multimeters, and logic analyzers

I possess strong problem-solving acumen, adaptability, and clear communication skills. I am prepared to deliver immediate value to your engineering team.

Thank you for your time and consideration. I look forward to the opportunity to discuss my qualifications with you in an interview.

Sincerely,

${candidateName}
Mechatronics Engineer — Automation & Controls
Phone: ${candidatePhone} | Email: ${candidateEmail}`;
}

/**
 * Generate a 100% clean, pre-typed email draft for Outlook with ZERO placeholders
 */
function generateEmailDraft(job, profile) {
  const candidateName = profile.name || "Muhammadhu Inaam";
  const candidatePhone = profile.phone || "+94 77 089 6608";
  const candidateEmail = profile.email || "mohamedinnam787@gmail.com";
  const candidateLinkedIn = profile.linkedin || "https://www.linkedin.com/in/muhammadhu-inaam-698566272/";

  const companyName = job.company || "Your Company";
  const jobTitle = job.title || "Mechatronics / Automation Engineer";
  const isGerman = job.countryCode === 'DE';
  const isFreelance = (job.workType && (job.workType.includes('Freelance') || job.workType.includes('Contract'))) ||
                      (job.tags && (job.tags.includes('Freelance') || job.tags.includes('Contract'))) ||
                      (job.title && (job.title.toLowerCase().includes('freelance') || job.title.toLowerCase().includes('freiberuflich')));

  const recipient = job.contactEmail || (isGerman ? "bewerbung@engineering-germany.de" : "careers@topjobs.lk");

  if (isFreelance && isGerman) {
    const subject = `Freiberufliche Projektmitarbeit / Contracting: ${jobTitle} – ${candidateName}`;
    const body = `Sehr geehrte Damen und Herren,

mit großem Interesse bewerbe ich mich für das aktuelle Projektmandat als "${jobTitle}" bei ${companyName}.

Als selbstständiger Mechatronik-Ingenieur mit fundierter praktischer Expertise in der industriellen Automatisierung (SPS-Programmierung nach IEC 61131-3, Siemens TIA Portal S7-1500, Beckhoff TwinCAT), Robotik-Integration (KUKA/ABB) und Steuerungstechnik stehe ich für kurzfristige Projekteinsätze zur Verfügung.

Eckdaten zu meiner Verfügbarkeit:
• Verfügbarkeit: Ab sofort / kurzfristig (Vorlaufzeit: 1-2 Wochen)
• Einsatzort: Vor-Ort-Einsätze deutschlandweit für Inbetriebnahme & Hardware-Tests sowie Remote-Entwicklung
• Stundensatz: ${job.salary || 'Orientiert am Projektbudget (ca. 85 € - 95 € / Std. all-in, verhandelbar)'}
• Qualifikation: BEng (Hons) Mechatronik + Fachausbildung am Ceylon German Technical Training Institute (CGTTI nach deutschem AHK-Standard)

Anbei finden Sie mein aktuelles Projekt-Profil / CV sowie mein abgestimmtes Projektangebot. Gerne stehe ich Ihnen für ein kurzfristiges Kennenlernen zur Verfügung.

Mit freundlichen Grüßen,

${candidateName}
Freiberuflicher Mechatronik- & Automatisierungs-Ingenieur
Telefon: ${candidatePhone}
E-Mail: ${candidateEmail}
LinkedIn: ${candidateLinkedIn}`;

    return { to: recipient, subject, body };
  }

  if (isFreelance) {
    const subject = `Contractor Project Proposal: ${jobTitle} – ${candidateName}`;
    const body = `Dear Staffing & Project Team,

Please find attached my Contractor Profile, CV, and tailored Project Proposal for the "${jobTitle}" assignment at ${companyName}.

As an independent Mechatronics & Controls Engineer with proven experience across industrial PLC automation, robotics cells, embedded electronics, and machine commissioning, I am ready to deploy immediately to deliver on your technical milestones.

Contractor Summary:
• Availability: Immediate (1-2 weeks deployment notice)
• Rate Expectation: ${job.salary || 'Competitive contractor hourly rate (€80 - €95/hr)'}
• Core Expertise: Siemens TIA Portal, Beckhoff TwinCAT, SCADA/HMI, KUKA/ABB Robotics, Motion Control

I welcome the opportunity to discuss the project schedule and technical deliverables.

Best regards,

${candidateName}
Freelance Mechatronics & Automation Specialist
Phone: ${candidatePhone}
Email: ${candidateEmail}
LinkedIn: ${candidateLinkedIn}`;

    return { to: recipient, subject, body };
  }

  const subject = isGerman
    ? `Bewerbung als ${jobTitle} – ${candidateName}`
    : `Application: ${jobTitle} – ${candidateName}`;

  const body = isGerman
    ? `Sehr geehrte Damen und Herren,

anbei erhalten Sie meine vollständigen Bewerbungsunterlagen (Lebenslauf sowie ein auf die Position abgestimmtes Anschreiben) für die Stelle als "${jobTitle}" bei ${companyName}.

Als Mechatronik-Ingenieur mit fundierter praktischer Erfahrung in der SPS/SCADA-Automatisierung (zertifiziert durch das Ceylon German Technical Training Institute), CNC-Entwicklung und industrieller Steuerungstechnik freue ich mich sehr über die Gelegenheit eines persönlichen Vorstellungsgesprächs.

Mit freundlichen Grüßen

${candidateName}
Mechatronics Engineer — Automation & Controls
Telefon: ${candidatePhone}
E-Mail: ${candidateEmail}
LinkedIn: ${candidateLinkedIn}`
    : `Dear Hiring Team,

Please find attached my Curriculum Vitae and tailored Cover Letter for the "${jobTitle}" position at ${companyName}.

As a Mechatronics Engineer with 2+ years of hands-on experience in PLC/HMI/SCADA automation, CNC systems, embedded electronics, and industrial process control, I would welcome the opportunity to discuss how my qualifications align with your engineering requirements.

Thank you for your time and review.

Best regards,

${candidateName}
Mechatronics Engineer — Automation & Controls
Phone: ${candidatePhone}
Email: ${candidateEmail}
LinkedIn: ${candidateLinkedIn}`;

  return {
    to: recipient,
    subject: subject,
    body: body
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { generateCoverLetter, generateEmailDraft };
}
if (typeof window !== 'undefined') {
  window.generateCoverLetter = generateCoverLetter;
  window.generateEmailDraft = generateEmailDraft;
}
