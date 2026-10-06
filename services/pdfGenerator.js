const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

/**
 * Generates an executive-grade PDF Cover Letter with ZERO placeholders
 * @param {Object} job 
 * @param {Object} profile 
 * @param {string} coverLetterText 
 * @returns {Promise<string>} Output PDF file path
 */
function createCoverLetterPDF(job, profile, coverLetterText) {
  return new Promise((resolve, reject) => {
    try {
      const outputDir = path.join(__dirname, '..', 'data', 'generated_letters');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const safeCompany = (job.company || 'Company').replace(/[^a-zA-Z0-9]/g, '_');
      const safeTitle = (job.title || 'Job').replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `CoverLetter_${safeCompany}_${safeTitle}.pdf`;
      const outputPath = path.join(outputDir, filename);

      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 40, bottom: 40, left: 45, right: 45 }
      });

      const writeStream = fs.createWriteStream(outputPath);
      doc.pipe(writeStream);

      // Primary Accent Colors
      const isGerman = job.countryCode === 'DE' || job.country === 'Germany';
      const primaryColor = isGerman ? '#0f4c81' : '#059669'; // German Navy vs Sri Lankan Emerald
      const darkColor = '#111827';
      const secondaryColor = '#374151';
      const mutedColor = '#6b7280';
      const lineColor = '#e5e7eb';

      // 1. Top Decorative Brand Bar
      doc.rect(45, 35, 505, 4).fill(primaryColor);

      // 2. Candidate Header
      doc.fillColor(darkColor).fontSize(19).font('Helvetica-Bold').text(profile.name.toUpperCase(), 45, 48);
      doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold').text(profile.title.toUpperCase(), 45, 71);

      // Clean Contact Info Line
      doc.fillColor(secondaryColor).fontSize(8.5).font('Helvetica');
      const candidateLinkedIn = profile.linkedin || 'https://www.linkedin.com/in/muhammadhu-inaam-698566272/';
      const cleanLinkedIn = candidateLinkedIn.replace(/^https?:\/\/(www\.)?/, '');
      doc.text(`${profile.email}   •   ${profile.phone}   •   ${profile.address}   •   `, 45, 87, { continued: true });
      doc.fillColor(primaryColor).text(cleanLinkedIn, {
        link: candidateLinkedIn,
        underline: true
      });

      // Divider Line
      doc.moveTo(45, 102).lineTo(550, 102).strokeColor(lineColor).lineWidth(1).stroke();

      // 3. Document Date
      const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      doc.fillColor(mutedColor).fontSize(8.5).font('Helvetica').text(today, 45, 112);

      // 4. Recipient Information Block
      let recipientY = 126;
      doc.fillColor(darkColor).fontSize(9.5).font('Helvetica-Bold').text('To: The Recruitment & Engineering Team', 45, recipientY);
      recipientY += 13;
      doc.fillColor(secondaryColor).font('Helvetica').text(job.company, 45, recipientY);
      recipientY += 12;
      if (job.agency && job.agency !== 'Direct / Topjobs LK' && job.agency !== 'Direct Placement') {
        doc.text(`Recruitment Partner: ${job.agency}`, 45, recipientY);
        recipientY += 12;
      }
      doc.text(job.location, 45, recipientY);
      recipientY += 18;

      // 5. Formal Subject Header (Reflects custom edited subject from user)
      let subjectLine = `SUBJECT: Application for ${job.title}`;

      // Check if user edited the Subject line in cover letter text (e.g. "Subject: ...", "Betreff: ...", "SUBJECT: ...")
      const subjectMatch = coverLetterText.match(/(?:^|\n)\s*(?:Subject|Betreff|SUBJECT|BETREFF)\s*:\s*([^\n\r]+)/i);
      if (subjectMatch && subjectMatch[1].trim()) {
        const customSub = subjectMatch[1].trim();
        if (/^(?:subject|betreff)\b/i.test(customSub)) {
          subjectLine = customSub;
        } else {
          subjectLine = (isGerman && !customSub.toLowerCase().startsWith('application') ? 'BETREFF: ' : 'SUBJECT: ') + customSub;
        }
      } else if (job.customSubject) {
        subjectLine = /^(?:subject|betreff)\b/i.test(job.customSubject)
          ? job.customSubject
          : `SUBJECT: ${job.customSubject}`;
      }

      // Calculate dynamic height so long subjects wrap nicely without overflowing
      doc.fontSize(9.5).font('Helvetica-Bold');
      const textOptions = { width: 490, lineGap: 2 };
      const subjectHeight = doc.heightOfString(subjectLine, textOptions);
      const boxHeight = Math.max(26, Math.ceil(subjectHeight) + 12);

      doc.rect(45, recipientY, 505, boxHeight).fill('#f8fafc');
      doc.rect(45, recipientY, 3, boxHeight).fill(primaryColor);
      doc.fillColor(primaryColor).text(subjectLine, 55, recipientY + 6, textOptions);

      recipientY += boxHeight + 8;

      // 6. Letter Content Formatting
      const rawLines = coverLetterText.split('\n');
      const contentParagraphs = [];
      let currentPara = [];
      let inBody = false;

      for (const line of rawLines) {
        const trimmed = line.trim();
        if (!trimmed) {
          if (currentPara.length > 0) {
            contentParagraphs.push(currentPara.join(' '));
            currentPara = [];
          }
          continue;
        }

        // Skip letterhead metadata lines that are already rendered in the letterhead block
        if (!inBody) {
          const isHeader = (
            trimmed === profile.name ||
            trimmed === profile.address ||
            trimmed === profile.title ||
            trimmed.startsWith('Phone:') || trimmed.startsWith('Telefon:') ||
            trimmed.startsWith('Email:') || trimmed.startsWith('E-Mail:') ||
            trimmed.startsWith('LinkedIn:') ||
            trimmed.startsWith('Date:') || trimmed.startsWith('Datum:') ||
            trimmed.startsWith('To:') || trimmed.startsWith('An:') ||
            trimmed.startsWith('Subject:') || trimmed.startsWith('Betreff:') ||
            trimmed.startsWith('SUBJECT:') || trimmed.startsWith('BETREFF:') ||
            trimmed.startsWith('Vermittlung') || trimmed.startsWith('Recruitment Partner:') ||
            trimmed === job.company || trimmed === job.location
          );
          if (isHeader) {
            continue;
          }
          inBody = true;
        }

        if (trimmed.startsWith('•') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          if (currentPara.length > 0) {
            contentParagraphs.push(currentPara.join(' '));
            currentPara = [];
          }
          contentParagraphs.push('• ' + trimmed.replace(/^[•\-\*]\s*/, ''));
        } else {
          currentPara.push(trimmed);
        }
      }

      if (currentPara.length > 0) {
        contentParagraphs.push(currentPara.join(' '));
      }

      let textY = recipientY;
      doc.fillColor(darkColor).fontSize(8.8).font('Helvetica');

      for (const para of contentParagraphs) {
        if (para.startsWith('•')) {
          // Bullet point
          doc.font('Helvetica-Bold').fillColor(primaryColor).text('•', 50, textY);
          doc.font('Helvetica').fillColor(darkColor).text(para.replace(/^•\s*/, ''), 62, textY, {
            width: 488,
            align: 'left',
            lineGap: 1.5
          });
          textY = doc.y + 3.5;
        } else if (para.startsWith('Sincerely,') || para.startsWith('Mit freundlichen Grüßen')) {
          textY += 5;
          doc.font('Helvetica-Bold').fillColor(darkColor).text(para, 45, textY);
          textY = doc.y + 9;
          doc.font('Helvetica-Bold').fontSize(9.5).fillColor(primaryColor).text(profile.name, 45, textY);
          textY = doc.y + 2;
          doc.font('Helvetica').fontSize(8.2).fillColor(mutedColor).text(profile.title, 45, textY);
          textY = doc.y + 5;
        } else if (para.startsWith('Arbeitserlaubnis und Sprachkenntnisse:') || para.startsWith('Work Authorization & Relocation Readiness:') || para.startsWith('Availability & Engagement:')) {
          textY += 3;
          doc.rect(45, textY, 505, 24).fill('#f1f5f9');
          doc.rect(45, textY, 3, 24).fill(primaryColor);
          const badgeTitle = para.startsWith('Arbeitserlaubnis') 
            ? 'ARBEITSERLAUBNIS & SPRACHKENNTNISSE:' 
            : (para.startsWith('Work Authorization') ? 'WORK AUTHORIZATION & RELOCATION:' : 'AVAILABILITY:');
          
          doc.font('Helvetica-Bold').fontSize(7.6).fillColor(primaryColor).text(badgeTitle, 55, textY + 4);
          const bodyText = para.replace(/^(Arbeitserlaubnis und Sprachkenntnisse:|Work Authorization & Relocation Readiness:|Availability & Engagement:)\s*/i, '');
          doc.font('Helvetica').fontSize(7.6).fillColor(darkColor).text(bodyText, 55, textY + 13, { width: 485, lineGap: 1 });
          textY += 28;
        } else {
          doc.font('Helvetica').fillColor(darkColor).text(para, 45, textY, {
            width: 505,
            align: 'justify',
            lineGap: 1.5
          });
          textY = doc.y + 4.5;
        }
      }

      // 7. Footer
      const footerY = 805;
      doc.moveTo(45, footerY - 8).lineTo(550, footerY - 8).strokeColor(lineColor).lineWidth(0.5).stroke();
      doc.fontSize(7.5).fillColor(mutedColor).text(
        `Application Dossier  •  ${profile.name}  •  ${job.company}  •  Confidential`,
        45,
        footerY,
        { align: 'center', width: 505 }
      );

      doc.end();

      writeStream.on('finish', () => resolve(outputPath));
      writeStream.on('error', reject);
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { createCoverLetterPDF };
