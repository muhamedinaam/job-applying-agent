/**
 * Zero-Placeholder Cover Letter & Email Generator
 * Tailored specifically for Muhammadhu Inaam, Mechatronics Engineer (Automation & Controls)
 * Produces 100% submission-ready cover letters and email drafts with ZERO placeholders.
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

  if (language === 'de' || (isGermanJob && language === 'de')) {
    // High-standard German Anschreiben (Zero placeholders, professional German engineering tone)
    return `
${candidateName}
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
• Konzeption einer IoT-fähigen 3-Phasen-Motorsteuerung (1 kW) mit integrierter Echtzeit-Telemetrie und Fehlerschutzschaltungen
• Modernisierung und Umbau konventioneller Drehmaschinen zu präzisen CNC-gesteuerten Fertigungssystemen

Arbeitserlaubnis und Sprachkenntnisse:
Für die Einreise und Arbeitsaufnahme in Deutschland erfülle ich alle Voraussetzungen für die deutsche Chancenkarte (Opportunity Card) sowie das beschleunigte Fachkräfteverfahren zur Blauen Karte EU. Meine Englischkenntnisse sind verhandlungssicher (C2); grundlegende Deutschkenntnisse (A1) baue ich derzeit intensiv weiter aus.

Über eine Einladung zu einem persönlichen oder virtuellen Vorstellungsgespräch freue ich mich sehr.

Mit freundlichen Grüßen

${candidateName}
`.trim();
  }

  // English Cover Letter (International / Sri Lankan / German Engineering Roles)
  const visaSection = isGermanJob
    ? `Work Authorization & Relocation Readiness:
I am fully prepared for relocation to Germany and meet all criteria for the German Opportunity Card (Chancenkarte) and the fast-track EU Blue Card for skilled technical graduates. I am dedicated to rapid integration and am currently advancing my German language studies alongside full professional English fluency (C2).`
    : `Availability & Engagement:
I am based in Kalutara / Western Province and available for immediate on-site or hybrid deployment in Sri Lanka, bringing proven field experience across automated production environments and equipment commissioning.`;

  return `
${candidateName}
${candidateAddress}
Phone: ${candidatePhone} | Email: ${candidateEmail}
LinkedIn: ${candidateLinkedIn}

Date: ${todayEN}

To: The Recruitment & Engineering Team
${companyName}
${agencyName ? `Recruitment Partner: ${agencyName}` : ''}
${jobLocation}

Subject: Application for ${jobTitle} – ${candidateName}

Dear Hiring Team at ${companyName},

I am writing to express my strong interest in the ${jobTitle} position at ${companyName}. As a Mechatronics Engineer with over 2 years of hands-on experience spanning PLC/HMI/SCADA automation, embedded systems, motion control, and CNC machinery, I am eager to apply my technical and commissioning background to your engineering operations.

I hold a Bachelor of Engineering Technology (Hons) in Mechatronics from the University of Sri Jayewardenepura and completed specialized training in Industrial Automation (PLC) and Electronics at the Ceylon German Technical Training Institute (CGTTI). My engineering philosophy is built on bridging conceptual control logic with reliable, physical hardware on the factory floor.

Key highlights of my recent engineering deliveries include:
• Designing and manufacturing an industrial CNC laser cutter from scratch, integrating the mechanical frame, stepper motion drives, and laser firing safety interlocks
• Programming and operating industrial PLC, HMI, and SCADA automation lines at AXEL Industries, directly contributing to minimized downtime and increased cycle efficiency
• Developing an IoT-enabled 3-phase motor controller for 1 kW systems with real-time operational diagnostics and thermal protection
• Delivering an automated pulse jet dust collector with PLC/HMI integration at DSI Galle, significantly lowering manual maintenance requirements
• Converting manual machinery into fully automated CNC motion systems with high dimensional repeatability

${visaSection}

Enclosed are my Curriculum Vitae and detailed project documentation. I would welcome the opportunity to discuss how my hands-on automation and mechatronics background aligns with ${companyName}'s engineering goals in an interview.

Thank you very much for your time and consideration.

Sincerely,

${candidateName}
`.trim();
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

  const recipient = job.contactEmail || (isGerman ? "bewerbung@engineering-germany.de" : "careers@topjobs.lk");

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

module.exports = {
  generateCoverLetter,
  generateEmailDraft
};
