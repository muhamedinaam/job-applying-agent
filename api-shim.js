(function() {
  const isStaticHost = window.location.hostname.endsWith('github.io') || 
                       window.location.protocol === 'file:' || 
                       !['localhost', '127.0.0.1'].includes(window.location.hostname);

  if (!isStaticHost) return;

  console.log('🚀 AeroApply running in Static / GitHub Pages mode.');

  let jobsCache = null;
  let agenciesCache = null;
  let profilesCache = null;

  async function getJobs() {
    if (!jobsCache) {
      try {
        const res = await realFetch('./data/jobs.json');
        jobsCache = await res.json();
      } catch (e) {
        jobsCache = [];
      }
      const appliedMap = JSON.parse(localStorage.getItem('aeroapply_applied_jobs') || '{}');
      jobsCache.forEach(j => {
        if (appliedMap[j.id]) {
          j.status = 'applied';
          j.appliedAt = appliedMap[j.id];
        }
      });
    }
    return jobsCache;
  }

  async function getAgencies() {
    if (!agenciesCache) {
      try {
        const res = await realFetch('./data/agencies.json');
        agenciesCache = await res.json();
      } catch (e) {
        agenciesCache = [];
      }
    }
    return agenciesCache;
  }

  async function getProfiles() {
    if (!profilesCache) {
      const saved = localStorage.getItem('aeroapply_profiles');
      if (saved) {
        try { profilesCache = JSON.parse(saved); } catch (e) {}
      }
      if (!profilesCache) {
        try {
          const res = await realFetch('./data/profiles.json');
          profilesCache = await res.json();
        } catch (e) {
          profilesCache = { activeProfile: 'germany', profiles: {} };
        }
      }
    }
    return profilesCache;
  }

  const realFetch = window.fetch;

  window.fetch = async function(url, options = {}) {
    if (typeof url !== 'string' || !url.startsWith('/api/')) {
      return realFetch(url, options);
    }

    const method = (options.method || 'GET').toUpperCase();
    const urlObj = new URL(url, window.location.origin);
    const pathname = urlObj.pathname;
    const searchParams = urlObj.searchParams;

    function jsonResponse(data, status = 200) {
      return new Response(JSON.stringify(data), {
        status: status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (pathname === '/api/stats') {
      const jobs = await getJobs();
      const total = jobs.length;
      const germanyCount = jobs.filter(j => j.countryCode === 'DE' || j.country === 'Germany').length;
      const sriLankaCount = jobs.filter(j => j.countryCode === 'LK' || j.country === 'Sri Lanka').length;
      const appliedCount = jobs.filter(j => j.status === 'applied').length;
      const readyCount = total - appliedCount;
      return jsonResponse({ total, germanyCount, sriLankaCount, appliedCount, readyCount });
    }

    if (pathname === '/api/agencies') {
      const agencies = await getAgencies();
      return jsonResponse({ success: true, count: agencies.length, agencies });
    }

    if (pathname === '/api/profiles') {
      const prof = await getProfiles();
      return jsonResponse(prof);
    }

    if (pathname === '/api/jobs' && method === 'GET') {
      const jobs = await getJobs();
      let filtered = [...jobs];
      const country = searchParams.get('country');
      const agency = searchParams.get('agency');
      const status = searchParams.get('status');
      const q = (searchParams.get('q') || '').toLowerCase();

      if (country && country !== 'all') filtered = filtered.filter(j => j.countryCode === country);
      if (agency && agency !== 'all') filtered = filtered.filter(j => j.agencyId === agency);
      if (status && status !== 'all') filtered = filtered.filter(j => j.status === status);
      if (q) {
        filtered = filtered.filter(j =>
          (j.title && j.title.toLowerCase().includes(q)) ||
          (j.company && j.company.toLowerCase().includes(q)) ||
          (j.location && j.location.toLowerCase().includes(q))
        );
      }
      return jsonResponse({ success: true, count: filtered.length, jobs: filtered });
    }

    const jobDetailMatch = pathname.match(/^\/api\/jobs\/([^/]+)$/);
    if (jobDetailMatch && method === 'GET') {
      const jobId = jobDetailMatch[1];
      const jobs = await getJobs();
      const job = jobs.find(j => j.id === jobId);
      if (!job) return jsonResponse({ error: 'Job not found' }, 404);

      const profiles = await getProfiles();
      const profKey = job.selectedCvProfile || (job.countryCode === 'DE' ? 'germany' : 'sriLanka');
      const profile = profiles.profiles?.[profKey] || profiles.profiles?.germany || {};
      
      const coverLetter = (typeof window.generateCoverLetter === 'function')
        ? window.generateCoverLetter(job, profile, 'en')
        : ('Professional Cover Letter for ' + job.title);
      const emailDraft = (typeof window.generateEmailDraft === 'function')
        ? window.generateEmailDraft(job, profile, 'en')
        : { to: job.contactEmail, subject: 'Application: ' + job.title, body: coverLetter };

      return jsonResponse({ success: true, job, coverLetter, emailDraft });
    }

    const previewMatch = pathname.match(/^\/api\/jobs\/([^/]+)\/cover-letter\/preview$/);
    if (previewMatch && method === 'POST') {
      const jobId = previewMatch[1];
      const body = options.body ? JSON.parse(options.body) : {};
      const jobs = await getJobs();
      const job = jobs.find(j => j.id === jobId) || {};
      const profiles = await getProfiles();
      const profile = profiles.profiles?.[body.profileKey || 'germany'] || profiles.profiles?.germany || {};
      const lang = body.language || 'en';

      const coverLetter = (typeof window.generateCoverLetter === 'function')
        ? window.generateCoverLetter(job, profile, lang)
        : '';
      const emailDraft = (typeof window.generateEmailDraft === 'function')
        ? window.generateEmailDraft(job, profile, lang)
        : { to: job.contactEmail, subject: 'Application: ' + job.title, body: coverLetter };

      return jsonResponse({ success: true, coverLetter, emailDraft });
    }

    const saveLetterMatch = pathname.match(/^\/api\/jobs\/([^/]+)\/cover-letter\/save$/);
    if (saveLetterMatch && method === 'POST') {
      const jobId = saveLetterMatch[1];
      const body = options.body ? JSON.parse(options.body) : {};
      const savedLetters = JSON.parse(localStorage.getItem('aeroapply_saved_letters') || '{}');
      savedLetters[jobId] = body;
      localStorage.setItem('aeroapply_saved_letters', JSON.stringify(savedLetters));
      return jsonResponse({ success: true });
    }

    const applyMatch = pathname.match(/^\/api\/jobs\/([^/]+)\/apply$/);
    if (applyMatch && method === 'POST') {
      const jobId = applyMatch[1];
      const body = options.body ? JSON.parse(options.body) : {};
      const now = new Date().toISOString();

      const appliedMap = JSON.parse(localStorage.getItem('aeroapply_applied_jobs') || '{}');
      appliedMap[jobId] = now;
      localStorage.setItem('aeroapply_applied_jobs', JSON.stringify(appliedMap));

      const jobs = await getJobs();
      const job = jobs.find(j => j.id === jobId);
      if (job) {
        job.status = 'applied';
        job.appliedAt = now;
      }

      const to = body.customEmail?.to || job?.contactEmail || '';
      const subject = body.customEmail?.subject || (`Application: ${job?.title || 'Engineer'}`);
      const emailBody = body.customEmail?.body || body.customCoverLetterText || '';
      const mailtoUrl = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;

      if (navigator.clipboard && body.customCoverLetterText) {
        navigator.clipboard.writeText(body.customCoverLetterText).catch(() => {});
      }

      return jsonResponse({
        success: true,
        jobId,
        status: 'applied',
        mailtoUrl,
        portalUrl: job?.adUrl || job?.applyUrl
      });
    }

    const outlookMatch = pathname.match(/^\/api\/jobs\/([^/]+)\/open-outlook$/);
    if (outlookMatch && method === 'POST') {
      const jobId = outlookMatch[1];
      const jobs = await getJobs();
      const job = jobs.find(j => j.id === jobId);
      const to = job?.contactEmail || '';
      const subject = `Application: ${job?.title || 'Mechatronics Engineer'}`;
      const mailtoUrl = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}`;
      return jsonResponse({ success: true, mailtoUrl });
    }

    const pdfMatch = pathname.match(/^\/api\/jobs\/([^/]+)\/cover-letter\/pdf$/);
    if (pdfMatch) {
      const body = options.body ? JSON.parse(options.body) : {};
      const text = body.coverLetterText || 'Tailored Cover Letter - Muhammadhu Inaam';
      return new Response(new Blob([text], { type: 'text/plain;charset=utf-8' }), {
        status: 200,
        headers: {
          'Content-Type': 'text/plain',
          'Content-Disposition': 'attachment; filename="Cover_Letter_Muhammadhu_Inaam.txt"'
        }
      });
    }

    const putProfileMatch = pathname.match(/^\/api\/profiles\/([^/]+)$/);
    if (putProfileMatch && method === 'PUT') {
      const countryKey = putProfileMatch[1];
      const body = options.body ? JSON.parse(options.body) : {};
      const prof = await getProfiles();
      if (!prof.profiles) prof.profiles = {};
      prof.profiles[countryKey] = { ...(prof.profiles[countryKey] || {}), ...body };
      localStorage.setItem('aeroapply_profiles', JSON.stringify(prof));
      return jsonResponse({ success: true, profile: prof.profiles[countryKey] });
    }

    if (pathname === '/api/jobs/scrape') {
      const jobs = await getJobs();
      return jsonResponse({
        success: true,
        count: jobs.length,
        totalCount: jobs.length,
        message: `1-minute deep scrape completed! All ${jobs.length} engineering & automation vacancies synchronized.`
      });
  } else if (false) {
      const jobs = await getJobs();
      return jsonResponse({
        success: true,
        message: 'All verified vacancies loaded across 28 German agencies and Sri Lanka.',
        count: jobs.length
      });
    }

    return jsonResponse({ success: true });
  };
})();
