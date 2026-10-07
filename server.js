const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const { generateCoverLetter, generateEmailDraft } = require('./services/coverLetterGenerator');
const { createCoverLetterPDF } = require('./services/pdfGenerator');
const { launchOutlookApplication, openPortalUrl, createEmlDraft } = require('./services/outlookLauncher');
const { parseJobUrl, scrapeTopjobs, resolveJobRecruiterEmail } = require('./services/scraper');
const { ensureStarterCvs } = require('./services/starterCvs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/services', express.static(path.join(__dirname, 'services')));
app.use(express.static(__dirname));
app.use('/uploads', express.static(path.join(__dirname, 'data', 'uploads')));
app.use('/letters', express.static(path.join(__dirname, 'data', 'generated_letters')));

// Paths
const JOBS_FILE = path.join(__dirname, 'data', 'jobs.json');
const PROFILES_FILE = path.join(__dirname, 'data', 'profiles.json');
const AGENCIES_FILE = path.join(__dirname, 'data', 'agencies.json');
const APPLIED_FILE = path.join(__dirname, 'data', 'applied_history.json');
const UPLOADS_DIR = path.join(__dirname, 'data', 'uploads');
const DRAFTS_DIR = path.join(__dirname, 'data', 'drafts');
if (!fs.existsSync(DRAFTS_DIR)) fs.mkdirSync(DRAFTS_DIR, { recursive: true });

// Multer storage for CV uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const countryKey = req.params.countryKey || 'custom';
    cb(null, `CV_${countryKey}_${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

// Helper to read/write JSON files safely
function readJson(filePath, defaultVal = []) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultVal, null, 2));
      return defaultVal;
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err.message);
    return defaultVal;
  }
}

function writeJson(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err.message);
    return false;
  }
}

// Ensure starter candidate CV PDFs exist on startup
ensureStarterCvs().catch(err => console.warn('Starter CV note:', err.message));

// ==========================================
// ROUTES: JOBS & SEARCH
// ==========================================

// GET /api/jobs (with filtering and search)
app.get('/api/jobs', (req, res) => {
  const { country, agency, status, q } = req.query;
  let jobs = readJson(JOBS_FILE, []);

  // Filter Country
  if (country === 'freelance') {
    filtered = filtered.filter(j => (j.workType && j.workType.includes('Freelance')) || (j.tags && j.tags.includes('Freelance')));
  } else if (country && country !== 'all') {
    if (country.toLowerCase() === 'de' || country.toLowerCase() === 'germany') {
      jobs = jobs.filter(j => j.countryCode === 'DE' || j.country === 'Germany');
    } else if (country.toLowerCase() === 'lk' || country.toLowerCase() === 'srilanka' || country.toLowerCase() === 'sri lanka') {
      jobs = jobs.filter(j => j.countryCode === 'LK' || j.country === 'Sri Lanka');
    }
  }

  // Filter Agency
  if (agency && agency !== 'all') {
    jobs = jobs.filter(j => (j.agencyId === agency || j.agency === agency));
  }

  // Filter Status
  if (status && status !== 'all') {
    if (status === 'applied') {
      jobs = jobs.filter(j => j.status === 'applied');
    } else if (status === 'new') {
      jobs = jobs.filter(j => j.status !== 'applied' && j.status !== 'archived');
    } else {
      jobs = jobs.filter(j => j.status === status);
    }
  }

  // Search Query
  if (q && q.trim()) {
    const term = q.trim().toLowerCase();
    jobs = jobs.filter(j => {
      const matchTitle = (j.title || '').toLowerCase().includes(term);
      const matchComp = (j.company || '').toLowerCase().includes(term);
      const matchAgency = (j.agency || '').toLowerCase().includes(term);
      const matchLoc = (j.location || '').toLowerCase().includes(term);
      const matchTags = (j.tags || []).some(t => t.toLowerCase().includes(term));
      const matchDesc = (j.description || '').toLowerCase().includes(term);
      return matchTitle || matchComp || matchAgency || matchLoc || matchTags || matchDesc;
    });
  }

  res.json({ success: true, count: jobs.length, jobs });
});

// GET /api/jobs/:id
app.get('/api/jobs/:id', async (req, res) => {
  const jobs = readJson(JOBS_FILE, []);
  const job = jobs.find(j => j.id === req.params.id);
  if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

  // Auto-resolve recruiter email if not yet verified or if generic placeholder
  const isGenericEmail = !job.contactEmail || 
    job.contactEmail.includes('@topjobs.lk') || 
    job.contactEmail.includes('@recruitment.lk') || 
    job.contactEmail.includes('@recruiting.de');

  if ((!job.emailVerified || isGenericEmail) && (job.adUrl || job.applyUrl)) {
    try {
      await resolveJobRecruiterEmail(job);
      writeJson(JOBS_FILE, jobs);
    } catch (err) {
      console.warn('Auto resolve email notice:', err.message);
    }
  }

  const profilesData = readJson(PROFILES_FILE, {});
  const profileKey = job.selectedCvProfile || (job.countryCode === 'DE' ? 'germany' : 'sriLanka');
  const profile = profilesData.profiles[profileKey] || profilesData.profiles['germany'];

  const coverLetter = job.customCoverLetter || generateCoverLetter(job, profile, 'en');
  const emailDraft = generateEmailDraft(job, profile);

  res.json({
    success: true,
    job,
    profile,
    coverLetter,
    emailDraft
  });
});

// POST /api/jobs/:id/refresh-email (Explicitly re-scan job post to detect recruiter's specific email)
app.post('/api/jobs/:id/refresh-email', async (req, res) => {
  try {
    const jobs = readJson(JOBS_FILE, []);
    const job = jobs.find(j => j.id === req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    job.emailVerified = false;
    await resolveJobRecruiterEmail(job);
    writeJson(JOBS_FILE, jobs);

    res.json({
      success: true,
      contactEmail: job.contactEmail,
      emailVerified: job.emailVerified,
      company: job.company,
      message: job.emailVerified 
        ? `Direct recruiter email found: ${job.contactEmail}` 
        : 'Could not extract specific recruiter email from post text.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/jobs/import-url (Universal job scraper)
app.post('/api/jobs/import-url', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ success: false, message: 'URL is required' });

  const result = await parseJobUrl(url);
  if (!result.success) {
    return res.status(500).json({ success: false, message: `Failed to scrape job page: ${result.error}` });
  }

  const jobs = readJson(JOBS_FILE, []);
  jobs.unshift(result.job);
  writeJson(JOBS_FILE, jobs);

  res.json({ success: true, message: 'Job successfully imported with recruiter details!', job: result.job });
});

// POST /api/jobs/scrape (Trigger 1-minute maximum deep crawler)
app.post('/api/jobs/scrape', async (req, res) => {
  try {
    const duration = parseInt(req.body?.durationSeconds || req.query?.durationSeconds || 60, 10);
    const result = await scrapeTopjobs(duration);
    res.json({ 
      success: true, 
      count: result.newCount,
      totalCount: result.totalCount,
      duration: result.durationSeconds,
      message: `Completed 1-minute deep scrape. Added ${result.newCount} new verified engineering vacancies (Total: ${result.totalCount}).`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/jobs/:id/cover-letter/save
app.post('/api/jobs/:id/cover-letter/save', (req, res) => {
  const { coverLetterText, profileKey, subject } = req.body;
  const jobs = readJson(JOBS_FILE, []);
  const jobIndex = jobs.findIndex(j => j.id === req.params.id);
  if (jobIndex === -1) return res.status(404).json({ success: false, message: 'Job not found' });

  jobs[jobIndex].customCoverLetter = coverLetterText;
  if (subject) {
    jobs[jobIndex].customSubject = subject;
  } else if (coverLetterText) {
    const subMatch = coverLetterText.match(/(?:^|\n)\s*(?:Subject|Betreff)\s*:\s*([^\n\r]+)/i);
    if (subMatch) jobs[jobIndex].customSubject = subMatch[1].trim();
  }
  if (profileKey) jobs[jobIndex].selectedCvProfile = profileKey;
  writeJson(JOBS_FILE, jobs);

  // Invalidate any old cached .eml file so next dispatch uses the updated letter
  const safeJobId = jobs[jobIndex].id.replace(/[^a-zA-Z0-9_-]/g, '_');
  const emlPath = path.join(DRAFTS_DIR, `Application_${safeJobId}.eml`);
  if (fs.existsSync(emlPath)) {
    try { fs.unlinkSync(emlPath); } catch (e) {}
  }

  res.json({ success: true, message: 'Cover letter updated successfully.' });
});

// POST /api/jobs/:id/cover-letter/pdf (Download PDF with custom edited text on demand)
app.post('/api/jobs/:id/cover-letter/pdf', async (req, res) => {
  try {
    const jobs = readJson(JOBS_FILE, []);
    const jobIndex = jobs.findIndex(j => j.id === req.params.id);
    if (jobIndex === -1) return res.status(404).json({ success: false, message: 'Job not found' });

    const job = jobs[jobIndex];
    const { coverLetterText, subject, profileKey } = req.body;

    if (coverLetterText) job.customCoverLetter = coverLetterText;
    if (subject) {
      job.customSubject = subject;
    } else if (coverLetterText) {
      const subMatch = coverLetterText.match(/(?:^|\n)\s*(?:Subject|Betreff)\s*:\s*([^\n\r]+)/i);
      if (subMatch) job.customSubject = subMatch[1].trim();
    }
    if (profileKey) job.selectedCvProfile = profileKey;
    jobs[jobIndex] = job;
    writeJson(JOBS_FILE, jobs);

    const profilesData = readJson(PROFILES_FILE, {});
    const pKey = profileKey || job.selectedCvProfile || (job.countryCode === 'DE' ? 'germany' : 'sriLanka');
    const profile = profilesData.profiles[pKey] || profilesData.profiles['germany'];

    const letterText = coverLetterText || job.customCoverLetter || generateCoverLetter(job, profile, 'en');
    const pdfPath = await createCoverLetterPDF(job, profile, letterText);

    res.download(pdfPath);
  } catch (err) {
    console.error('PDF generation error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/jobs/:id/cover-letter/pdf (Download PDF on demand)
app.get('/api/jobs/:id/cover-letter/pdf', async (req, res) => {
  try {
    const jobs = readJson(JOBS_FILE, []);
    const job = jobs.find(j => j.id === req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    const profilesData = readJson(PROFILES_FILE, {});
    const profileKey = job.selectedCvProfile || (job.countryCode === 'DE' ? 'germany' : 'sriLanka');
    const profile = profilesData.profiles[profileKey] || profilesData.profiles['germany'];

    const letterText = job.customCoverLetter || generateCoverLetter(job, profile, 'en');
    const pdfPath = await createCoverLetterPDF(job, profile, letterText);

    res.download(pdfPath);
  } catch (err) {
    console.error('PDF generation error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// ROUTES: APPROVE & APPLY (CORE WORKFLOW)
// ==========================================

// POST /api/jobs/:id/apply
app.post('/api/jobs/:id/apply', async (req, res) => {
  try {
    const jobs = readJson(JOBS_FILE, []);
    const jobIndex = jobs.findIndex(j => j.id === req.params.id);
    if (jobIndex === -1) return res.status(404).json({ success: false, message: 'Job not found' });

    const job = jobs[jobIndex];
    const { profileKey, customEmail, customCoverLetterText } = req.body;

    const profilesData = readJson(PROFILES_FILE, {});
    const activeKey = profileKey || job.selectedCvProfile || (job.countryCode === 'DE' ? 'germany' : 'sriLanka');
    const profile = profilesData.profiles[activeKey] || profilesData.profiles['germany'];

    // 1. Generate Custom Tailored Cover Letter PDF
    const letterText = customCoverLetterText || job.customCoverLetter || generateCoverLetter(job, profile, 'en');
    job.customCoverLetter = letterText;

    // 2. Draft Email
    const emailDraft = generateEmailDraft(job, profile);
    const recipient = (customEmail && customEmail.to) || job.contactEmail || emailDraft.to;
    let subject = (customEmail && customEmail.subject) || job.customSubject || emailDraft.subject;
    
    // Sync subject from cover letter if user edited it
    const subMatch = letterText.match(/(?:^|\n)\s*(?:Subject|Betreff)\s*:\s*([^\n\r]+)/i);
    if (subMatch && (!customEmail || !customEmail.subject || customEmail.subject === emailDraft.subject)) {
      subject = subMatch[1].trim();
    }
    job.customSubject = subject;

    const body = (customEmail && customEmail.body) || emailDraft.body;
    const pdfPath = await createCoverLetterPDF(job, profile, letterText);

    // Resolve Candidate CV file path
    const cvFilePath = path.join(UPLOADS_DIR, profile.cvFileName);

    // 3. Launch Outlook compose with Cover Letter & CV auto-attached
    const outlookResult = await launchOutlookApplication({
      to: recipient,
      subject: subject,
      body: body,
      coverLetterPdfPath: pdfPath,
      cvFilePath: fs.existsSync(cvFilePath) ? cvFilePath : null,
      jobId: job.id
    });

    // 4. Open External Application Portal in default browser (Chrome/Edge)
    let portalOpened = false;
    const targetApplyUrl = job.adUrl || job.applyUrl;
    if (targetApplyUrl && targetApplyUrl.startsWith('http')) {
      portalOpened = await openPortalUrl(targetApplyUrl);
    }

    // 5. Update Job status to 'applied' and record in history
    const appliedTimestamp = new Date().toISOString();
    job.status = 'applied';
    job.appliedAt = appliedTimestamp;
    job.appliedVia = 'Outlook & Portal';
    job.selectedCvProfile = activeKey;
    jobs[jobIndex] = job;
    writeJson(JOBS_FILE, jobs);

    // Invalidate cached .eml
    const safeJobId = job.id.replace(/[^a-zA-Z0-9_-]/g, '_');
    const emlPath = path.join(DRAFTS_DIR, `Application_${safeJobId}.eml`);
    if (fs.existsSync(emlPath)) {
      try { fs.unlinkSync(emlPath); } catch (e) {}
    }

    // Record in applied_history.json
    const history = readJson(APPLIED_FILE, []);
    history.unshift({
      id: `app-${Date.now()}`,
      jobId: job.id,
      title: job.title,
      company: job.company,
      agency: job.agency,
      country: job.country,
      appliedAt: appliedTimestamp,
      recipient: recipient,
      subject: subject,
      profileUsed: activeKey,
      coverLetterPdf: path.basename(pdfPath),
      cvFile: profile.cvFileName
    });
    writeJson(APPLIED_FILE, history);

    res.json({
      success: true,
      message: 'Application Approved! Outlook compose launched with Cover Letter & CV attached, and portal opened.',
      job,
      pdfDownloadUrl: `/api/jobs/${job.id}/cover-letter/pdf`,
      emlDownloadUrl: `/api/jobs/${job.id}/eml`,
      mailtoUrl: outlookResult.mailtoUrl,
      portalOpened,
      portalUrl: job.applyUrl
    });
  } catch (err) {
    console.error('Apply error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/jobs/:id/eml - Downloads or opens pre-attached RFC 822 email draft for Outlook
app.get('/api/jobs/:id/eml', async (req, res) => {
  try {
    const jobs = readJson(JOBS_FILE, []);
    const job = jobs.find(j => j.id === req.params.id);
    if (!job) return res.status(404).send('Job not found');

    const safeJobId = job.id.replace(/[^a-zA-Z0-9_-]/g, '_');
    const emlPath = path.join(DRAFTS_DIR, `Application_${safeJobId}.eml`);

    const profilesData = readJson(PROFILES_FILE, {});
    const activeKey = job.selectedCvProfile || (job.countryCode === 'DE' ? 'germany' : 'sriLanka');
    const profile = profilesData.profiles[activeKey] || profilesData.profiles['germany'];
    const letterText = job.customCoverLetter || generateCoverLetter(job, profile, 'en');
    const pdfPath = await createCoverLetterPDF(job, profile, letterText);
    const cvFilePath = path.join(UPLOADS_DIR, profile.cvFileName);
    const emailDraft = generateEmailDraft(job, profile);

    const emailSubject = job.customSubject || emailDraft.subject;

    createEmlDraft({
      to: job.contactEmail || emailDraft.to,
      subject: emailSubject,
      body: emailDraft.body,
      attachments: [
        { path: pdfPath, filename: 'Cover_Letter_Muhammadhu_Inaam.pdf' },
        { path: cvFilePath, filename: profile.cvFileName }
      ],
      outputPath: emlPath
    });

    res.setHeader('Content-Type', 'message/rfc822');
    res.setHeader('Content-Disposition', `attachment; filename="Application_${safeJobId}.eml"`);
    const fileStream = fs.createReadStream(emlPath);
    fileStream.pipe(res);
  } catch (err) {
    console.error('EML download error:', err);
    res.status(500).send('Error delivering email draft');
  }
});

// POST /api/jobs/:id/open-outlook - Launches Outlook compose with pre-attached files on demand
app.post('/api/jobs/:id/open-outlook', async (req, res) => {
  try {
    const jobs = readJson(JOBS_FILE, []);
    const jobIndex = jobs.findIndex(j => j.id === req.params.id);
    if (jobIndex === -1) return res.status(404).json({ success: false, message: 'Job not found' });

    const job = jobs[jobIndex];
    const profilesData = readJson(PROFILES_FILE, {});
    const activeKey = req.body.profileKey || job.selectedCvProfile || (job.countryCode === 'DE' ? 'germany' : 'sriLanka');
    const profile = profilesData.profiles[activeKey] || profilesData.profiles['germany'];
    const letterText = req.body.customCoverLetterText || job.customCoverLetter || generateCoverLetter(job, profile, 'en');
    job.customCoverLetter = letterText;

    const emailDraft = generateEmailDraft(job, profile);
    const recipient = req.body.to || job.contactEmail || emailDraft.to;
    let subject = req.body.subject || job.customSubject || emailDraft.subject;

    const subMatch = letterText.match(/(?:^|\n)\s*(?:Subject|Betreff)\s*:\s*([^\n\r]+)/i);
    if (subMatch && (!req.body.subject || req.body.subject === emailDraft.subject)) {
      subject = subMatch[1].trim();
    }
    job.customSubject = subject;
    jobs[jobIndex] = job;
    writeJson(JOBS_FILE, jobs);

    const pdfPath = await createCoverLetterPDF(job, profile, letterText);
    const cvFilePath = path.join(UPLOADS_DIR, profile.cvFileName);
    const body = req.body.body || emailDraft.body;

    const result = await launchOutlookApplication({
      to: recipient,
      subject: subject,
      body: body,
      coverLetterPdfPath: pdfPath,
      cvFilePath: fs.existsSync(cvFilePath) ? cvFilePath : null,
      jobId: job.id
    });

    res.json(result);

    res.json(result);
  } catch (err) {
    console.error('Open Outlook error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// ROUTES: PROFILES & CV MANAGEMENT
// ==========================================

// GET /api/profiles
app.get('/api/profiles', (req, res) => {
  const profiles = readJson(PROFILES_FILE, {});
  res.json(profiles);
});

// GET /api/profiles/active
app.get('/api/profiles/active', (req, res) => {
  const data = readJson(PROFILES_FILE, {});
  const activeKey = data.activeProfile || 'germany';
  const profile = data.profiles[activeKey];
  res.json(profile);
});

// POST /api/profiles/active
app.post('/api/profiles/active', (req, res) => {
  const { activeProfile } = req.body;
  const data = readJson(PROFILES_FILE, {});
  if (data.profiles && data.profiles[activeProfile]) {
    data.activeProfile = activeProfile;
    writeJson(PROFILES_FILE, data);
    res.json({ success: true, activeProfile });
  } else {
    res.status(400).json({ success: false, message: 'Invalid profile key' });
  }
});

// POST /api/profiles/:countryKey (Update details)
app.post('/api/profiles/:countryKey', (req, res) => {
  const { countryKey } = req.params;
  const data = readJson(PROFILES_FILE, {});
  if (!data.profiles || !data.profiles[countryKey]) {
    return res.status(404).json({ success: false, message: 'Profile not found' });
  }

  // Merge fields
  data.profiles[countryKey] = Object.assign(data.profiles[countryKey], req.body);
  writeJson(PROFILES_FILE, data);
  res.json({ success: true, profile: data.profiles[countryKey] });
});

// POST /api/profiles/:countryKey/upload-cv (Upload candidate CV file)
app.post('/api/profiles/:countryKey/upload-cv', upload.single('cvFile'), (req, res) => {
  const { countryKey } = req.params;
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

  const data = readJson(PROFILES_FILE, {});
  if (!data.profiles || !data.profiles[countryKey]) {
    return res.status(404).json({ success: false, message: 'Profile not found' });
  }

  data.profiles[countryKey].cvFileName = req.file.filename;
  data.profiles[countryKey].cvFilePath = `data/uploads/${req.file.filename}`;
  data.profiles[countryKey].hasCustomFile = true;
  writeJson(PROFILES_FILE, data);

  res.json({
    success: true,
    message: 'CV uploaded successfully!',
    filename: req.file.filename,
    profile: data.profiles[countryKey]
  });
});

// GET /api/profiles/:countryKey/download-cv
app.get('/api/profiles/:countryKey/download-cv', (req, res) => {
  const { countryKey } = req.params;
  const data = readJson(PROFILES_FILE, {});
  if (!data.profiles || !data.profiles[countryKey]) {
    return res.status(404).json({ success: false, message: 'Profile not found' });
  }

  const cvPath = path.join(UPLOADS_DIR, data.profiles[countryKey].cvFileName);
  if (!fs.existsSync(cvPath)) {
    return res.status(404).json({ success: false, message: 'CV file not found on disk' });
  }

  res.download(cvPath);
});

// ==========================================
// ROUTES: RECRUITMENT AGENCIES & STATS
// ==========================================

// GET /api/agencies
app.get('/api/agencies', (req, res) => {
  const agencies = readJson(AGENCIES_FILE, []);
  res.json({ success: true, count: agencies.length, agencies });
});

// GET /api/stats
app.get('/api/stats', (req, res) => {
  const jobs = readJson(JOBS_FILE, []);
  const total = jobs.length;
  const germanyCount = jobs.filter(j => j.countryCode === 'DE' || j.country === 'Germany').length;
  const sriLankaCount = jobs.filter(j => j.countryCode === 'LK' || j.country === 'Sri Lanka').length;
  const appliedCount = jobs.filter(j => j.status === 'applied').length;
  const readyCount = total - appliedCount;
  const freelanceCount = jobs.filter(j => (j.workType && j.workType.includes('Freelance')) || (j.tags && j.tags.includes('Freelance'))).length;

  res.json({
    total,
    germanyCount,
    sriLankaCount,
    appliedCount,
    readyCount,
    freelanceCount
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 AeroApply Agent running at http://localhost:${PORT}`);
  console.log(`🇩🇪 German Recruitment Agencies & 🇱🇰 Topjobs Sri Lanka Ready`);
  console.log(`=======================================================`);
});
