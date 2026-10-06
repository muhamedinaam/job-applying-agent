const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

let openFn;
try {
  const openPkg = require('open');
  openFn = openPkg.default || openPkg;
} catch (e) {
  openFn = null;
}

/**
 * Creates a compliant RFC 822 .eml draft message with X-Unsent: 1
 * and attaches both the bespoke Cover Letter PDF and the Candidate CV as base64 MIME parts.
 *
 * When opened in Windows, Microsoft Outlook recognizes X-Unsent: 1 and opens the draft
 * directly in the Compose window with all files pre-attached in the attachments bar.
 */
function createEmlDraft({ to, subject, body, attachments = [], outputPath }) {
  const boundary = `----=_NextPart_000_AeroApply_${Date.now()}`;
  const nowUtc = new Date().toUTCString();

  let eml = '';
  eml += 'X-Unsent: 1\r\n';
  eml += `To: ${to || ''}\r\n`;
  eml += 'From: Muhammadhu Inaam <mohamedinnam787@gmail.com>\r\n';
  eml += `Subject: ${subject || 'Application: Mechatronics & Automation Engineer – Muhammadhu Inaam'}\r\n`;
  eml += `Date: ${nowUtc}\r\n`;
  eml += 'MIME-Version: 1.0\r\n';
  eml += `Content-Type: multipart/mixed; boundary="${boundary}"\r\n\r\n`;

  // 1. Plain Text Message Body
  eml += `--${boundary}\r\n`;
  eml += 'Content-Type: text/plain; charset="utf-8"\r\n';
  eml += 'Content-Transfer-Encoding: 8bit\r\n\r\n';
  eml += (body || '').replace(/\r?\n/g, '\r\n') + '\r\n\r\n';

  // 2. Attachments (Cover Letter PDF and CV PDF)
  for (const att of attachments) {
    if (att.path && fs.existsSync(att.path)) {
      const fileBuffer = fs.readFileSync(att.path);
      const base64Data = fileBuffer.toString('base64');
      const filename = att.filename || path.basename(att.path);

      eml += `--${boundary}\r\n`;
      eml += `Content-Type: application/pdf; name="${filename}"\r\n`;
      eml += 'Content-Transfer-Encoding: base64\r\n';
      eml += `Content-Disposition: attachment; filename="${filename}"\r\n\r\n`;

      // Split base64 into standard 76-character lines
      for (let i = 0; i < base64Data.length; i += 76) {
        eml += base64Data.substring(i, i + 76) + '\r\n';
      }
      eml += '\r\n';
    }
  }

  eml += `--${boundary}--\r\n`;

  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, eml, 'utf8');
  return outputPath;
}

/**
 * Launches Microsoft Outlook with pre-filled recipient, subject, and body,
 * with BOTH the Cover Letter PDF and Candidate CV automatically attached.
 */
function launchOutlookApplication({ to, subject, body, coverLetterPdfPath, cvFilePath, jobId }) {
  return new Promise((resolve) => {
    const safeJobId = (jobId || 'draft').replace(/[^a-zA-Z0-9_-]/g, '_');
    const draftsDir = path.join(__dirname, '..', 'data', 'drafts');
    const emlFileName = `Application_${safeJobId}.eml`;
    const emlPath = path.join(draftsDir, emlFileName);

    // Collect attachments
    const attachments = [];
    if (coverLetterPdfPath && fs.existsSync(coverLetterPdfPath)) {
      attachments.push({
        path: coverLetterPdfPath,
        filename: 'Cover_Letter_Muhammadhu_Inaam.pdf'
      });
    }
    if (cvFilePath && fs.existsSync(cvFilePath)) {
      attachments.push({
        path: cvFilePath,
        filename: path.basename(cvFilePath)
      });
    }

    // 1. Generate .eml draft with auto-attached PDFs
    createEmlDraft({
      to,
      subject,
      body,
      attachments,
      outputPath: emlPath
    });

    // 2. Launch Outlook natively using registered Outlook.File.eml handler
    if (process.platform === 'win32') {
    const classicOutlook = 'C:\\Program Files\\Microsoft Office\\Root\\Office16\\OUTLOOK.EXE';
    if (fs.existsSync(classicOutlook)) {
      // Direct call to Outlook /eml switch
      execFile(classicOutlook, ['/eml', emlPath], (err) => {
        if (err) console.error('Classic Outlook launch notice:', err.message);
      });
    } else {
      // Windows Shell Start-Process fallback
      const psCommand = `Start-Process -FilePath '${emlPath.replace(/'/g, "''")}'`;
      execFile('powershell', ['-NoProfile', '-Command', psCommand], () => {});
    }

    // 3. Highlight files in Windows Explorer as visual confirmation
    if (coverLetterPdfPath && fs.existsSync(coverLetterPdfPath)) {
      const resolvedPdf = path.resolve(coverLetterPdfPath);
      execFile('explorer.exe', [`/select,${resolvedPdf}`], () => {});
    }
    }

    const encodedSubject = encodeURIComponent(subject || '');
    const encodedBody = encodeURIComponent(body || '');
    const mailtoUrl = `mailto:${to || ''}?subject=${encodedSubject}&body=${encodedBody}`;

    resolve({
      success: true,
      emlPath,
      emlFileName,
      emlUrl: `/api/jobs/${jobId}/eml`,
      mailtoUrl,
      coverLetterPdfPath,
      cvFilePath,
      attachmentsCount: attachments.length
    });
  });
}

/**
 * Open external portal URL in default browser (Chrome/Edge)
 */
async function openPortalUrl(url) {
  if (!url || !url.startsWith('http')) return false;
  try {
    if (typeof openFn === 'function') {
      await openFn(url);
      return true;
    }
  } catch (err) {
    // Fallback to native Windows start command
  }

  return new Promise((resolve) => {
    if (process.platform !== 'win32') return resolve(false); execFile('cmd', ['/c', 'start', '', url], (err) => {
      resolve(!err);
    });
  });
}

module.exports = {
  createEmlDraft,
  launchOutlookApplication,
  openPortalUrl
};
