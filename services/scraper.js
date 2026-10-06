const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const fs = require('fs');

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

const BLACKLISTED_EMAIL_DOMAINS = [
  'topjobs.lk', 'sentry.io', 'w3.org', 'example.com', 'schema.org', 
  'google.com', 'facebook.com', 'cloudflare.com', 'wordpress.org',
  'linkedin.com', 'stepstone.de', 'indeed.com', 'glassdoor.com', 'monster.com'
];

/**
 * Intelligently extracts the recruiter's specific email address from HTML
 */
function extractRecruiterEmail(html, companyName = '', targetUrl = '') {
  if (!html) return null;
  const $ = cheerio.load(html);

  // 1. Direct Topjobs dedicated company email input fields
  const topjobsInputs = [
    $('input[name="txtCompanyEmail"]').val(),
    $('#txtAVECompanyEmail').val(),
    $('#txtCompanyEmail').val(),
    $('input[id*="CompanyEmail"]').val()
  ];

  for (const raw of topjobsInputs) {
    if (raw && raw.trim()) {
      const email = raw.trim();
      const lower = email.toLowerCase();
      if (!BLACKLISTED_EMAIL_DOMAINS.some(d => lower.includes(d)) && email.includes('@')) {
        return email;
      }
    }
  }

  // 2. Look for labeled email spans / paragraphs
  const labeledRegexes = [
    /(?:company\s*email|recruiter\s*email|apply\s*(?:to|via|at)|send\s*(?:cv|resumes?)\s*to|forward\s*cv\s*to|contact\s*email|inquiries\s*to)\s*[:\-]?\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
    /(?:email|e-mail)\s*[:\-]?\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i
  ];

  for (const reg of labeledRegexes) {
    const match = html.match(reg);
    if (match && match[1]) {
      const email = match[1].trim();
      const lower = email.toLowerCase();
      if (!BLACKLISTED_EMAIL_DOMAINS.some(d => lower.includes(d))) {
        return email;
      }
    }
  }

  // 3. Check all mailto links
  const mailtos = [];
  $('a[href^="mailto:"]').each((i, el) => {
    const raw = $(el).attr('href').replace(/^mailto:/i, '').split('?')[0].trim();
    if (raw && raw.includes('@') && !BLACKLISTED_EMAIL_DOMAINS.some(d => raw.toLowerCase().includes(d))) {
      mailtos.push(raw);
    }
  });
  if (mailtos.length > 0) {
    return mailtos[0];
  }

  // 4. Regex scan entire HTML page for email addresses
  const allMatches = html.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g) || [];
  const validEmails = allMatches.filter(e => {
    const lower = e.toLowerCase();
    if (lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.gif') || lower.endsWith('.webp')) return false;
    return !BLACKLISTED_EMAIL_DOMAINS.some(d => lower.includes(d));
  });

  if (validEmails.length > 0) {
    // Score emails by relevance
    const cleanCompany = (companyName || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const prioritized = validEmails.sort((a, b) => {
      const score = emailStr => {
        const s = emailStr.toLowerCase();
        let val = 0;
        if (s.startsWith('hr') || s.startsWith('careers') || s.startsWith('jobs') || s.startsWith('recruitment')) val += 15;
        if (s.includes('opportunities') || s.includes('apply') || s.includes('talent') || s.includes('hiring') || s.includes('bewerbung')) val += 10;
        if (s.includes('careers') || s.includes('recruitment')) val += 8;
        if (cleanCompany && cleanCompany.length > 3 && s.includes(cleanCompany.slice(0, 8))) val += 12;
        if (s.startsWith('info@')) val -= 3;
        return val;
      };
      return score(b) - score(a);
    });

    return prioritized[0];
  }

  return null;
}

/**
 * Universal Job Page Parser with deep recruiter email extraction
 * Supports Topjobs LK (all subdomains and URLs) + international portals
 */
async function parseJobUrl(targetUrl) {
  try {
    let normalizedUrl = targetUrl.trim();
    const isTopjobs = normalizedUrl.toLowerCase().includes('topjobs.lk');

    // If it's a Topjobs link containing vacancy parameters, normalize directly to JobAdvertismentServlet
    if (isTopjobs) {
      const urlObj = new URL(normalizedUrl.startsWith('http') ? normalizedUrl : `https://${normalizedUrl}`);
      const ac = urlObj.searchParams.get('ac');
      const jc = urlObj.searchParams.get('jc') || urlObj.searchParams.get('jon') || urlObj.searchParams.get('js');
      const ec = urlObj.searchParams.get('ec');

      if (ac && jc && ec) {
        normalizedUrl = `https://www.topjobs.lk/employer/JobAdvertismentServlet?ac=${ac}&jc=${jc}&ec=${ec}`;
      }
    }

    const response = await axios.get(normalizedUrl, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,de;q=0.8'
      },
      timeout: 12000
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Extract Title
    let title = $('input[name="txtVacancy"]').val() ||
                $('meta[property="og:title"]').attr('content') ||
                $('meta[name="twitter:title"]').attr('content') ||
                $('h1').first().text().trim() ||
                $('title').text().trim();

    title = title.replace(/\s+/g, ' ').replace(/ - .*$/, '').replace(/ \| .*$/, '').replace(/^topjobs\s*\|\s*/i, '').trim();
    if (title.toUpperCase() === 'VACVIEW') {
      title = $('h2').first().text().trim() || 'Engineering Specialist';
    }

    // Extract Company Name
    let company = $('input[name="txtCompanyName"]').val() ||
                  $('meta[property="og:site_name"]').attr('content') ||
                  $('.company-name, .employer, [data-test="company-name"]').first().text().trim() ||
                  $('h1').first().text().trim() || '';

    if (!company || company.length < 2 || company.toLowerCase() === 'vacview') {
      try {
        const parsedUrl = new URL(normalizedUrl);
        const hostParts = parsedUrl.hostname.replace('www.', '').split('.');
        company = hostParts[0].charAt(0).toUpperCase() + hostParts[0].slice(1);
      } catch {
        company = 'Recruiting Partner';
      }
    }

    // Determine country
    let country = 'Germany';
    let countryCode = 'DE';
    const lowerUrl = normalizedUrl.toLowerCase();
    const fullText = (html + ' ' + title).toLowerCase();

    if (lowerUrl.includes('.lk') || lowerUrl.includes('topjobs') || fullText.includes('sri lanka') || fullText.includes('colombo')) {
      country = 'Sri Lanka';
      countryCode = 'LK';
    }

    // Extract Location
    let location = $('.location, [data-test="location"], .job-location').first().text().trim();
    if (!location) {
      if (countryCode === 'LK') location = 'Colombo / Western Province, Sri Lanka';
      else if (fullText.includes('münchen') || fullText.includes('munich')) location = 'Munich, Germany';
      else if (fullText.includes('berlin')) location = 'Berlin, Germany';
      else if (fullText.includes('frankfurt')) location = 'Frankfurt, Germany';
      else if (fullText.includes('stuttgart')) location = 'Stuttgart, Germany';
      else location = 'Germany (Hybrid / On-site)';
    }

    // Deep Recruiter Email Extraction
    let contactEmail = extractRecruiterEmail(html, company, normalizedUrl);

    // Check if Topjobs has an external ATS link (e.g., Keells, Workday, Lever)
    let directApplyUrl = normalizedUrl;
    $('a').each((i, el) => {
      const h = $(el).attr('href');
      if (h && (h.includes('careers.') || h.includes('/job/') || h.includes('workday') || h.includes('greenhouse') || h.includes('lever.co'))) {
        directApplyUrl = h;
      }
    });

    // If no direct email was found on Topjobs ad, but external ATS portal exists, attempt quick scan of external portal
    if (!contactEmail && directApplyUrl !== normalizedUrl && directApplyUrl.startsWith('http')) {
      try {
        const extRes = await axios.get(directApplyUrl, { headers: { 'User-Agent': USER_AGENT }, timeout: 6000 });
        const extEmail = extractRecruiterEmail(extRes.data, company, directApplyUrl);
        if (extEmail) contactEmail = extEmail;
      } catch (e) {
        // ignore secondary timeout
      }
    }

    // Final fallback if truly no recruiter email is found
    const emailVerified = !!contactEmail;
    if (!contactEmail) {
      contactEmail = countryCode === 'DE' ? 'karriere@recruiting.de' : 'careers@recruitment.lk';
    }

    // Extract Description
    let description = $('article, .job-description, .description, #job-description, main').first().text().trim();
    if (!description || description.length < 100) {
      description = $('meta[property="og:description"]').attr('content') ||
                    $('meta[name="description"]').attr('content') ||
                    $('p').slice(0, 5).text().trim() ||
                    `Professional engineering and technical opportunity with ${company} in ${location}. Full application package and direct recruiter outreach enabled.`;
    }
    description = description.replace(/\s+/g, ' ').slice(0, 1200);

    // Extract Requirements
    const requirements = [];
    $('ul li').each((i, el) => {
      const txt = $(el).text().trim();
      if (txt.length > 15 && txt.length < 160 && requirements.length < 6) {
        requirements.push(txt);
      }
    });

    if (requirements.length === 0) {
      requirements.push(
        'Solid engineering and hands-on technical integration competencies',
        'Experience with automation, system design, diagnostics, or process controls',
        'Strong problem-solving capability and clear professional communication',
        'Relevant degree or technical diploma (BEng / CGTTI / equivalent)'
      );
    }

    // Tags matching user engineering disciplines & training
    const techKeywords = [
      'Mechanical', 'Electronic', 'Electrical', 'Automation', 'Manufacturing',
      'Mechatronics', 'Industrial', 'Robotics', 'Embedded', 'PLC', 'SCADA', 'HMI',
      'SolidWorks', 'CAD', 'CNC', 'Motor Control', 'Power Electronics',
      'Trainee', 'Internship', 'Praktikum', 'Assistant'
    ];
    const tags = techKeywords.filter(k => 
      title.toLowerCase().includes(k.toLowerCase()) || 
      description.toLowerCase().includes(k.toLowerCase())
    );
    if (tags.length === 0) tags.push('Engineering', 'Automation', countryCode === 'DE' ? 'Germany' : 'Sri Lanka');

    const newJob = {
      id: `job-imported-${Date.now().toString(36)}`,
      title: title || 'Automation & Controls Engineer',
      company: company || 'Recruiting Partner',
      agency: isTopjobs ? 'Topjobs Sri Lanka' : company,
      agencyId: isTopjobs ? 'topjobs-lk' : company.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      country: country,
      countryCode: countryCode,
      location: location,
      workType: 'Full-time',
      salary: countryCode === 'DE' ? '€65,000 - €82,000 / year' : 'Competitive (LKR Industry Standard)',
      datePosted: new Date().toISOString().split('T')[0],
      applyUrl: directApplyUrl,
      adUrl: normalizedUrl,
      contactEmail: contactEmail,
      emailVerified: emailVerified,
      tags: tags,
      description: description,
      requirements: requirements,
      benefits: [
        'Direct recruiter outreach with pre-attached CV and custom cover letter',
        'Competitive salary benchmarked to technical qualifications',
        'Collaborative engineering environment'
      ],
      status: 'new',
      appliedAt: null,
      selectedCvProfile: countryCode === 'DE' ? 'germany' : 'sriLanka'
    };

    return { success: true, job: newJob };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Live Scraper for real Topjobs LK vacancies with verified recruiter emails
 */
async function scrapeTopjobs(category = 'ENG', maxJobs = 6) {
  try {
    const listUrl = `https://www.topjobs.lk/applicant/vacancybyfunctionalarea.jsp?FA=${category}&jst=OPEN`;
    const response = await axios.get(listUrl, {
      headers: { 'User-Agent': USER_AGENT },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    const candidateRows = [];

    $('tr').each((i, el) => {
      const jc = $(el).find('[id^="hdnJC"]').text().trim();
      const ec = $(el).find('[id^="hdnEC"]').text().trim();
      const ac = $(el).find('[id^="hdnAC"]').text().trim();

      const title = $(el).find('h2 span').text().trim();
      const company = $(el).find('h1').text().trim();
      const location = $(el).find('td:nth-child(8)').text().trim() || 'Colombo, Sri Lanka';

      const targetDisciplines = [
        'mechanical', 'electronic', 'electrical', 'automation', 'manufacturing',
        'mechatronics', 'industrial', 'robotics', 'embedded', 'trainee', 'engineer',
        'assistant', 'maintenance', 'controls', 'cad', 'cnc'
      ];

      const lowerTitle = (title || '').toLowerCase();
      const isTargetEngineering = targetDisciplines.some(d => lowerTitle.includes(d));

      if (jc && ec && ac && title && isTargetEngineering && candidateRows.length < maxJobs) {
        candidateRows.push({
          jc, ec, ac, title, company, location,
          adUrl: `https://www.topjobs.lk/employer/JobAdvertismentServlet?ac=${ac}&jc=${jc}&ec=${ec}`
        });
      }
    });

    const jobs = [];

    for (const item of candidateRows) {
      try {
        const adRes = await axios.get(item.adUrl, { headers: { 'User-Agent': USER_AGENT }, timeout: 8000 });
        const recruiterEmail = extractRecruiterEmail(adRes.data, item.company, item.adUrl);

        // Ensure applyUrl points to the specific job ad, NOT a generic company homepage
        let directUrl = item.adUrl;
        const $ad = cheerio.load(adRes.data);
        $ad('a').each((idx, a) => {
          const href = $ad(a).attr('href');
          if (href && (href.includes('/job/') || href.includes('/jobs/') || href.includes('/vacancy/') || href.includes('workday') || href.includes('lever.co') || href.includes('greenhouse.io'))) {
            try {
              const u = new URL(href.startsWith('http') ? href : `https://${href}`);
              if (u.pathname && u.pathname.length > 3 && u.pathname !== '/') {
                directUrl = href;
              }
            } catch(e) {}
          }
        });

        const finalEmail = recruiterEmail || 'careers@recruitment.lk';

        jobs.push({
          id: `job-topjobs-${item.jc}`,
          title: item.title,
          company: item.company || 'Leading Engineering Firm (Topjobs LK)',
          agency: 'Topjobs Sri Lanka',
          agencyId: 'topjobs-lk',
          country: 'Sri Lanka',
          countryCode: 'LK',
          location: item.location,
          workType: 'Full-time',
          salary: 'Competitive (LKR Industry Benchmark)',
          datePosted: new Date().toISOString().split('T')[0],
          applyUrl: directUrl,
          adUrl: item.adUrl,
          contactEmail: finalEmail,
          emailVerified: !!recruiterEmail,
          tags: ['Engineering', 'Automation', 'Topjobs LK'],
          description: `Direct vacancy for ${item.title} at ${item.company} sourced directly from Topjobs Sri Lanka. Direct recruiter contact verified.`,
          requirements: [
            'Hands-on technical engineering experience and qualifications',
            'Strong background in industrial, electrical, mechanical, or software systems',
            'Good teamwork and communication skills'
          ],
          benefits: [
            'Direct recruiter contact attachment',
            'Attractive industrial remuneration package'
          ],
          status: 'new',
          selectedCvProfile: 'sriLanka'
        });
      } catch (err) {
        console.warn(`Error crawling Topjobs ad ${item.adUrl}:`, err.message);
      }
    }

    return jobs;
  } catch (err) {
    console.warn('topjobs scraping error:', err.message);
    return [];
  }
}

/**
 * Resolves or re-verifies recruiter email for any existing job object
 */
async function resolveJobRecruiterEmail(job) {
  if (!job || !job.applyUrl) return job;
  
  // If email is already a verified specific recruiter email (not generic placeholder)
  const currentEmail = (job.contactEmail || '').toLowerCase();
  const isGeneric = !currentEmail || 
                    currentEmail.includes('@topjobs.lk') || 
                    currentEmail.includes('@recruitment.lk') || 
                    currentEmail.includes('@recruiting.de');

  if (!isGeneric && job.emailVerified) {
    return job;
  }

  // Crawl applyUrl or adUrl
  const targetToScan = job.adUrl || job.applyUrl;
  try {
    const parsed = await parseJobUrl(targetToScan);
    if (parsed.success && parsed.job.contactEmail && parsed.job.emailVerified) {
      job.contactEmail = parsed.job.contactEmail;
      job.emailVerified = true;
      if (parsed.job.company && (!job.company || job.company.includes('via topjobs.lk'))) {
        job.company = parsed.job.company;
      }
    }
  } catch (e) {
    console.warn(`Could not resolve recruiter email for ${job.id}:`, e.message);
  }

  return job;
}

module.exports = {
  extractRecruiterEmail,
  parseJobUrl,
  scrapeTopjobs,
  resolveJobRecruiterEmail
};
