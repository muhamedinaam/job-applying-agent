const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

/**
 * Generates an executive 2-page DIN/ISO European standard CV for Germany
 * Exactly matching Muhammadhu Inaam's attached Germany / International CV.
 */
function generateInaamGermanCV(profile, targetPath) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4', autoFirstPage: true });
      const stream = fs.createWriteStream(targetPath);
      doc.pipe(stream);

      const primaryColor = '#0f4c81';
      const darkColor = '#111827';
      const textSecondary = '#374151';
      const textMuted = '#6b7280';
      const dividerColor = '#d1d5db';

      // ==========================================
      // PAGE 1: HEADER, PROFILE, SKILLS, EXPERIENCE, PROJECTS (1-2)
      // ==========================================

      // 1. Header Name & Title
      doc.fillColor(darkColor).fontSize(20).font('Helvetica-Bold').text(profile.name.toUpperCase(), 40, 40);
      doc.fillColor(primaryColor).fontSize(11).font('Helvetica-Bold').text('Mechatronics Engineer — Automation & Controls', 40, 64);

      doc.fillColor(textSecondary).fontSize(8.5).font('Helvetica');
      doc.text('Beruwala, Kalutara, Sri Lanka   |   +94 77 089 6608   |   mohamedinnam787@gmail.com   |   linkedin.com/in/muhammadhu-inaam', 40, 78);

      // Divider Line
      doc.moveTo(40, 93).lineTo(555, 93).strokeColor(dividerColor).lineWidth(0.8).stroke();

      // 2. Profile Summary
      doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold').text('PROFILE', 40, 102);
      doc.fillColor(textSecondary).fontSize(8.8).font('Helvetica').text(
        'Mechatronics Engineer with 2+ years of hands-on experience across PLC/HMI/SCADA automation, embedded systems and CNC/industrial process control, backed by a BEng (Hons) in Mechatronics. Track record of taking automation and control projects from design through to working hardware, including a from-scratch CNC laser cutter build and an IoT-enabled motor controller. Seeking a junior-to-mid-level Automation / Mechatronics / Controls Engineer role internationally; currently building German language skills (A1) alongside the job search.',
        40, 115, { width: 515, align: 'justify', lineGap: 2.2 }
      );

      // 3. Technical Skills
      const skillsY = doc.y + 12;
      doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold').text('TECHNICAL SKILLS', 40, skillsY);

      const skills = [
        ['Automation & Controls:', 'PLC / HMI / SCADA programming & troubleshooting, industrial automation, process control, power electronics & motor control'],
        ['Programming & Embedded:', 'C, C++, Python; microcontroller platforms and embedded systems; circuit design, PCB layout, electronics debugging'],
        ['Design & Manufacturing:', 'SolidWorks & general CAD, 3D printing & additive manufacturing, CNC systems'],
        ['Project & Supply Chain:', 'Project management (Primavera P6), supplier sourcing, supply chain management']
      ];

      doc.y = skillsY + 14;
      skills.forEach(([label, val]) => {
        doc.fontSize(8.5).font('Helvetica-Bold').fillColor(darkColor).text(label + ' ', 40, doc.y, { continued: true });
        doc.font('Helvetica').fillColor(textSecondary).text(val, { lineGap: 2 });
        doc.y += 2;
      });

      // 4. Work Experience
      const expY = doc.y + 10;
      doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold').text('WORK EXPERIENCE', 40, expY);

      // Skipod
      let curY = expY + 14;
      doc.fontSize(9.5).font('Helvetica-Bold').fillColor(darkColor).text('Mechatronics Engineer', 40, curY);
      doc.fontSize(8.5).font('Helvetica-Oblique').fillColor(textMuted).text('Skipod Manufacturer Pvt Ltd (US-based company) - Sep 2025 to Jul 2026', 40, curY + 12);

      const exp1Bullets = [
        'Designed and built the "Skimulator," an interactive simulation system, from concept through working hardware',
        'Built an industrial CNC laser cutter from scratch, integrating mechanical structure with electronics and control systems',
        'Redesigned the original Skimulator into a more compact production version, cutting footprint while retaining full functionality',
        'Integrated and tested simulation software within the Skimulator hardware environment',
        'Managed supplier sourcing from initial concept through to production parts'
      ];

      doc.y = curY + 25;
      exp1Bullets.forEach(b => {
        doc.fontSize(8.5).font('Helvetica').fillColor(textSecondary).text('•  ' + b, 46, doc.y, { width: 509, lineGap: 1.8 });
        doc.y += 1.5;
      });

      // AXEL Industries
      curY = doc.y + 6;
      doc.fontSize(9.5).font('Helvetica-Bold').fillColor(darkColor).text('Assistant Mechatronics Engineer', 40, curY);
      doc.fontSize(8.5).font('Helvetica-Oblique').fillColor(textMuted).text('AXEL Industries Pvt Ltd, Sri Lanka - May 2024 to Jul 2025', 40, curY + 12);

      const exp2Bullets = [
        'Operated and troubleshot PLC, HMI and SCADA systems supporting automation and process control lines',
        'Designed, developed and tested mechatronic systems for industrial applications',
        'Collaborated with cross-functional engineering teams to improve automation reliability and uptime'
      ];

      doc.y = curY + 25;
      exp2Bullets.forEach(b => {
        doc.fontSize(8.5).font('Helvetica').fillColor(textSecondary).text('•  ' + b, 46, doc.y, { width: 509, lineGap: 1.8 });
        doc.y += 1.5;
      });

      // 5. Key Projects (First 2 on page 1)
      curY = doc.y + 8;
      doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold').text('KEY PROJECTS', 40, curY);

      const projP1 = [
        'IoT-Enabled 3-Phase Motor Controller (Final Year Project) - designed a fully electronic motor controller for 1 kW systems with IoT-based real-time monitoring and diagnostics',
        'Automated Pulse Jet Dust Collector - DSI, Galle - developed a PLC + HMI + SCADA automation system, improving operational efficiency and reducing maintenance requirements'
      ];

      doc.y = curY + 14;
      projP1.forEach(b => {
        doc.fontSize(8.5).font('Helvetica').fillColor(textSecondary).text('•  ' + b, 46, doc.y, { width: 509, lineGap: 1.8 });
        doc.y += 1.5;
      });

      // ==========================================
      // PAGE 2: KEY PROJECTS (CONT), EDUCATION, LANGUAGES, REFERENCES
      // ==========================================
      doc.addPage();

      // Page 2 Running Header
      doc.fillColor(textMuted).fontSize(8).font('Helvetica').text('MUHAMMADHU INAAM — Mechatronics Engineer (Automation & Controls)', 40, 36, { continued: true });
      doc.text('Page 2 of 2', { align: 'right' });
      doc.moveTo(40, 48).lineTo(555, 48).strokeColor(dividerColor).lineWidth(0.8).stroke();

      // Key Projects Continued
      doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold').text('KEY PROJECTS (CONTINUED)', 40, 60);

      const projP2 = [
        'Traditional Lathe to CNC Conversion - converted a manual lathe into a fully CNC-controlled system',
        'Industrial CNC Laser Cutter (scratch build) - designed the mechanical structure and integrated electronics and control systems',
        '340 kW On-Grid Solar Installation, Rajagiriya - assisted with installation and testing of a three-phase solar system',
        'Additional builds: moisture harvesting system, Arduino-based automated feeding system, surface texture measurement device, automatic light control system'
      ];

      doc.y = 74;
      projP2.forEach(b => {
        doc.fontSize(8.5).font('Helvetica').fillColor(textSecondary).text('•  ' + b, 46, doc.y, { width: 509, lineGap: 2 });
        doc.y += 2;
      });

      // Education
      const eduY = doc.y + 14;
      doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold').text('EDUCATION & CERTIFICATIONS', 40, eduY);

      let eY = eduY + 15;
      doc.fontSize(9.2).font('Helvetica-Bold').fillColor(darkColor).text('Bachelor of Engineering Technology (Hons), Mechatronics', 40, eY);
      doc.fontSize(8.5).font('Helvetica-Oblique').fillColor(textMuted).text('University of Sri Jayewardenepura, Sri Lanka - 2022 to 2026', 40, eY + 12);

      eY += 26;
      doc.fontSize(9.2).font('Helvetica-Bold').fillColor(darkColor).text('Industrial Automation (PLC) & Electronics (E2) - Certificate Training', 40, eY);
      doc.fontSize(8.5).font('Helvetica-Oblique').fillColor(textMuted).text('Ceylon German Technical Training Institute (CGTTI) - 2024', 40, eY + 12);

      // Languages
      const langY = eY + 28;
      doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold').text('LANGUAGES', 40, langY);
      doc.fontSize(8.8).font('Helvetica').fillColor(textSecondary).text(
        'English - Native (C2)   |   Tamil - Native (C2)   |   Sinhala - Native (C2)   |   German - Basic (A1), currently learning',
        40, langY + 14
      );

      // References
      const refY = langY + 36;
      doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold').text('REFERENCES', 40, refY);

      const rTop = refY + 15;
      doc.fontSize(9).font('Helvetica-Bold').fillColor(darkColor).text('Dr. Kasun Weranga', 40, rTop);
      doc.fontSize(8.2).font('Helvetica').fillColor(textSecondary).text('Senior Lecturer, Faculty of Technology (FOT)', 40, rTop + 12);
      doc.text('University of Sri Jayewardenepura', 40, rTop + 23);
      doc.text('kasun.weranga@sjp.ac.lk   |   +64 22 032 7126', 40, rTop + 34);

      doc.fontSize(9).font('Helvetica-Bold').fillColor(darkColor).text('Chalinda Wickramasinghe', 300, rTop);
      doc.fontSize(8.2).font('Helvetica').fillColor(textSecondary).text('Project Engineer', 300, rTop + 12);
      doc.text('Skipod Manufacturer Pvt Ltd', 300, rTop + 23);
      doc.text('chalindaw@skipod.lk   |   +94 76 543 2613', 300, rTop + 34);

      doc.end();
      stream.on('finish', resolve);
      stream.on('error', reject);
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Generates an executive CV tailored for Sri Lankan & Local Technical roles
 * Exactly matching Muhammadhu Inaam's attached Sri Lankan / Local CV.
 */
function generateInaamSriLankaCV(profile, targetPath) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4', autoFirstPage: true });
      const stream = fs.createWriteStream(targetPath);
      doc.pipe(stream);

      const primaryColor = '#059669';
      const darkColor = '#111827';
      const textSecondary = '#374151';
      const textMuted = '#6b7280';
      const dividerColor = '#d1d5db';

      // ==========================================
      // PAGE 1: HEADER, PROFILE, SOFT & TECH SKILLS, EXPERIENCE, PROJECTS (1-2)
      // ==========================================

      // 1. Header Name & Title
      doc.fillColor(darkColor).fontSize(20).font('Helvetica-Bold').text(profile.name.toUpperCase(), 40, 40);
      doc.fillColor(primaryColor).fontSize(11).font('Helvetica-Bold').text('MECHATRONICS ENGINEER', 40, 64);

      doc.fillColor(textSecondary).fontSize(8.5).font('Helvetica');
      doc.text('Beruwala, Kalutara, Sri Lanka   |   +94 77 089 6608   |   mohamedinnam787@gmail.com   |   LinkedIn: Muhammadhu Inaam', 40, 78);

      // Divider Line
      doc.moveTo(40, 93).lineTo(555, 93).strokeColor(dividerColor).lineWidth(0.8).stroke();

      // 2. Profile Summary
      doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold').text('PROFILE SUMMARY', 40, 102);
      doc.fillColor(textSecondary).fontSize(8.8).font('Helvetica').text(
        'Motivated Mechatronics Engineer with solid knowledge in mechanical, electronic and control systems integration. Completed specialized training in PLC programming and industrial automation at Ceylon German Technical Training Institute. Practical experience in designing IoT-enabled devices, CNC systems, industrial automation projects and 3D modeling. Seeking a junior-to-mid-level Automation / Mechatronics / Controls Engineer role locally to contribute technical skills in an innovative team while gaining advance industry exposure.',
        40, 115, { width: 515, align: 'justify', lineGap: 2.2 }
      );

      // 3. Technical & Soft Skills
      const skillsY = doc.y + 12;
      doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold').text('TECHNICAL SKILLS & CORE COMPETENCIES', 40, skillsY);

      const skillCategories = [
        ['Automation & Process Control:', 'PLC / HMI / SCADA programming & troubleshooting, industrial process control, power electronics & motor control'],
        ['Embedded Systems & Software:', 'C, C++, Python; microcontroller platforms and embedded systems; circuit design, PCB layout, electronics debugging'],
        ['CAD, 3D & Machining:', 'SolidWorks & general CAD software, 3D printing & additive manufacturing, CNC systems & lathe conversion'],
        ['Engineering Management:', 'Project management (Primavera P6), supplier sourcing, supply chain management, cross-functional collaboration'],
        ['Soft Skills:', 'Problem-solving and Adaptability, Analytical Thinking, Leadership, Teamwork abilities, Communication Skills, Time Management']
      ];

      doc.y = skillsY + 14;
      skillCategories.forEach(([label, val]) => {
        doc.fontSize(8.5).font('Helvetica-Bold').fillColor(darkColor).text(label + ' ', 40, doc.y, { continued: true });
        doc.font('Helvetica').fillColor(textSecondary).text(val, { lineGap: 2 });
        doc.y += 2;
      });

      // 4. Work Experience
      const expY = doc.y + 10;
      doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold').text('WORK EXPERIENCE', 40, expY);

      // Skipod
      let curY = expY + 14;
      doc.fontSize(9.5).font('Helvetica-Bold').fillColor(darkColor).text('Mechatronics Engineer', 40, curY);
      doc.fontSize(8.5).font('Helvetica-Oblique').fillColor(textMuted).text('Skipod Manufacturer Pvt Ltd (USA based Company) - Sep 2025 - Jul 2026', 40, curY + 12);

      const exp1Bullets = [
        'Gained advanced knowledge to design and build a Skimulator interactive simulation system',
        'Acquired hands-on expertise in building an industrial laser cutter from scratch',
        'Integrated and tested simulation games within the Skimulator hardware environment',
        'Redesigned and developed the previous Skimulator into a more compact serial production version',
        'Managed supplier sourcing from sketch through to finished production parts'
      ];

      doc.y = curY + 25;
      exp1Bullets.forEach(b => {
        doc.fontSize(8.5).font('Helvetica').fillColor(textSecondary).text('•  ' + b, 46, doc.y, { width: 509, lineGap: 1.8 });
        doc.y += 1.5;
      });

      // AXEL Industries
      curY = doc.y + 6;
      doc.fontSize(9.5).font('Helvetica-Bold').fillColor(darkColor).text('Assistant Mechatronics Engineer', 40, curY);
      doc.fontSize(8.5).font('Helvetica-Oblique').fillColor(textMuted).text('AXEL Industries Pvt Ltd (Sri Lanka) - May 2024 - Jul 2025', 40, curY + 12);

      const exp2Bullets = [
        'Work with PLC, HMI, and SCADA systems for automation and process control',
        'Design, develop, and test mechatronic systems for industrial applications',
        'Collaborate with cross-functional teams to enhance automation uptime and reliability'
      ];

      doc.y = curY + 25;
      exp2Bullets.forEach(b => {
        doc.fontSize(8.5).font('Helvetica').fillColor(textSecondary).text('•  ' + b, 46, doc.y, { width: 509, lineGap: 1.8 });
        doc.y += 1.5;
      });

      // 5. Key Projects (First 2 on page 1)
      curY = doc.y + 8;
      doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold').text('PROJECTS', 40, curY);

      const projP1 = [
        'IoT-Enabled 3-Phase Motor Controller (Final Year Project) – Designed a fully electronic motor controller for 1 kW systems with IoT-based real-time telemetry and diagnostics',
        'Automated Pulse Jet Dust Collector – DSI, Galle – Developed PLC + HMI + SCADA based automation system, improving operational efficiency and reducing maintenance'
      ];

      doc.y = curY + 14;
      projP1.forEach(b => {
        doc.fontSize(8.5).font('Helvetica').fillColor(textSecondary).text('•  ' + b, 46, doc.y, { width: 509, lineGap: 1.8 });
        doc.y += 1.5;
      });

      // ==========================================
      // PAGE 2: PROJECTS (CONT), EDUCATION, LANGUAGES, REFERENCES
      // ==========================================
      doc.addPage();

      // Page 2 Running Header
      doc.fillColor(textMuted).fontSize(8).font('Helvetica').text('MUHAMMADHU INAAM — Mechatronics Engineer', 40, 36, { continued: true });
      doc.text('Page 2 of 2', { align: 'right' });
      doc.moveTo(40, 48).lineTo(555, 48).strokeColor(dividerColor).lineWidth(0.8).stroke();

      // Projects Continued
      doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold').text('PROJECTS (CONTINUED)', 40, 60);

      const projP2 = [
        'Traditional Lathe to CNC Conversion – Converted manual lathe into CNC-controlled system',
        'Industrial CNC Laser Cutter (Scratch Build) – Designed mechanical structure and integrated electronics and control systems',
        'On-Grid Solar Installation – Rajagiriya (340 kW) – Assisted in installation and testing of three-phase solar system',
        'Additional Projects: Moisture Harvesting System, Arduino-Based Automated Feeding System, Surface Texture Measurement Device, Automatic Light Control System'
      ];

      doc.y = 74;
      projP2.forEach(b => {
        doc.fontSize(8.5).font('Helvetica').fillColor(textSecondary).text('•  ' + b, 46, doc.y, { width: 509, lineGap: 2 });
        doc.y += 2;
      });

      // Education
      const eduY = doc.y + 14;
      doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold').text('EDUCATION & CERTIFICATIONS', 40, eduY);

      let eY = eduY + 15;
      doc.fontSize(9.2).font('Helvetica-Bold').fillColor(darkColor).text('Bachelor of Engineering Technology (Hons) in Mechatronics', 40, eY);
      doc.fontSize(8.5).font('Helvetica-Oblique').fillColor(textMuted).text('University of Sri Jayewardenepura, Sri Lanka (2022 - 2026)', 40, eY + 12);

      eY += 26;
      doc.fontSize(9.2).font('Helvetica-Bold').fillColor(darkColor).text('Industrial Automation – (Course Code: PLC)', 40, eY);
      doc.fontSize(8.5).font('Helvetica-Oblique').fillColor(textMuted).text('Ceylon German Technical Training Institute (2024)', 40, eY + 12);

      eY += 26;
      doc.fontSize(9.2).font('Helvetica-Bold').fillColor(darkColor).text('Electronic – (Course Code: E2)', 40, eY);
      doc.fontSize(8.5).font('Helvetica-Oblique').fillColor(textMuted).text('Ceylon German Technical Training Institute (2024)', 40, eY + 12);

      // Languages
      const langY = eY + 28;
      doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold').text('LANGUAGES', 40, langY);
      doc.fontSize(8.8).font('Helvetica').fillColor(textSecondary).text(
        'English: Native proficiency (C2)   |   Tamil: Native proficiency (C2)   |   Sinhala: Native proficiency (C2)   |   German: Basic (A1) – currently learning',
        40, langY + 14
      );

      // References
      const refY = langY + 36;
      doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold').text('REFERENCES', 40, refY);

      const rTop = refY + 15;
      doc.fontSize(9).font('Helvetica-Bold').fillColor(darkColor).text('Dr. Kasun Weranga', 40, rTop);
      doc.fontSize(8.2).font('Helvetica').fillColor(textSecondary).text('Senior Lecturer, FOT', 40, rTop + 12);
      doc.text('University of Sri Jayewardenepura', 40, rTop + 23);
      doc.text('kasun.weranga@sjp.ac.lk   |   +64 22 032 7126', 40, rTop + 34);

      doc.fontSize(9).font('Helvetica-Bold').fillColor(darkColor).text('Chalinda Wickramasinghe', 300, rTop);
      doc.fontSize(8.2).font('Helvetica').fillColor(textSecondary).text('Project Engineer', 300, rTop + 12);
      doc.text('Skipod Manufacturer PVT LTD', 300, rTop + 23);
      doc.text('Chalindaw@SKIPOD.lk   |   +94 76 543 2613', 300, rTop + 34);

      doc.end();
      stream.on('finish', resolve);
      stream.on('error', reject);
    } catch (err) {
      reject(err);
    }
  });
}

function generateInaamCV(profile, targetPath) {
  if (profile.countryCode === 'DE' || profile.id === 'germany') {
    return generateInaamGermanCV(profile, targetPath);
  }
  return generateInaamSriLankaCV(profile, targetPath);
}

async function ensureStarterCvs() {
  const profilesPath = path.join(__dirname, '..', 'data', 'profiles.json');
  if (!fs.existsSync(profilesPath)) return;

  const data = JSON.parse(fs.readFileSync(profilesPath, 'utf8'));
  const uploadsDir = path.join(__dirname, '..', 'data', 'uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  // Generate German CV
  const pDE = data.profiles['germany'];
  await generateInaamGermanCV(pDE, path.join(uploadsDir, pDE.cvFileName));
  console.log(`Generated official German CV PDF: ${pDE.cvFileName}`);

  // Generate Sri Lanka CV
  const pLK = data.profiles['sriLanka'];
  await generateInaamSriLankaCV(pLK, path.join(uploadsDir, pLK.cvFileName));
  console.log(`Generated official Sri Lanka CV PDF: ${pLK.cvFileName}`);
}

module.exports = { generateInaamCV, generateInaamGermanCV, generateInaamSriLankaCV, ensureStarterCvs };
