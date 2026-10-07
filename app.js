/**
 * AeroApply Client Application
 * Handles Job search & filtering, German agency mapping, Cover Letter review,
 * 1-Click Approve & Apply with Outlook and Portal launch, and Profile / CV management.
 */

// Global State
const state = {
  jobs: [],
  agencies: [],
  profiles: null,
  activeProfileKey: 'germany',
  activeCountryFilter: 'all',
  activeStatusFilter: 'all',
  activeAgencyFilter: 'all',
  searchQuery: '',
  selectedJob: null,
  selectedReviewProfileKey: 'germany',
  selectedLetterLang: 'en',
  viewMode: 'grid'
};

// DOM Elements
const jobsContainer = document.getElementById('jobsContainer');
const resultsCount = document.getElementById('resultsCount');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const agencyFilter = document.getElementById('agencyFilter');

// Modals
const reviewModal = document.getElementById('reviewModal');
const profileModal = document.getElementById('profileModal');
const autofillModal = document.getElementById('autofillModal');
const importModal = document.getElementById('importModal');

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  await loadProfiles();
  await loadAgencies();
  await loadStats();
  await loadJobs();
});

// ==========================================
// DATA FETCHING
// ==========================================
async function loadStats() {
  try {
    const res = await fetch('/api/stats');
    if (!res.ok) return;
    const stats = await res.json();

    document.getElementById('statTotal').textContent = stats.total;
    document.getElementById('statGermany').textContent = stats.germanyCount;
    document.getElementById('statSriLanka').textContent = stats.sriLankaCount;
    document.getElementById('statApplied').textContent = stats.appliedCount;
    const flEl = document.getElementById('statFreelance'); if (flEl) flEl.textContent = stats.freelanceCount || (state.jobs ? state.jobs.filter(j => j.tags?.includes('Freelance') || j.workType?.includes('Freelance')).length : 0);
    const flTab = document.getElementById('countFreelance'); if (flTab) flTab.textContent = stats.freelanceCount || (state.jobs ? state.jobs.filter(j => j.tags?.includes('Freelance') || j.workType?.includes('Freelance')).length : 0);

    document.getElementById('countAll').textContent = stats.total;
    document.getElementById('countDE').textContent = stats.germanyCount;
    document.getElementById('countLK').textContent = stats.sriLankaCount;
    document.getElementById('countAppliedTab').textContent = stats.appliedCount;
  } catch (err) {
    console.error('Failed to load stats:', err);
  }
}

async function loadAgencies() {
  try {
    const res = await fetch('/api/agencies');
    if (!res.ok) return;
    const data = await res.json();
    state.agencies = data.agencies || [];

    // Populate agency dropdown
    agencyFilter.innerHTML = '<option value="all">All 28 German Agencies</option>';
    state.agencies.forEach(agency => {
      const opt = document.createElement('option');
      opt.value = agency.id;
      opt.textContent = `${agency.name} (${agency.domains[0] || 'Engineering'})`;
      agencyFilter.appendChild(opt);
    });
  } catch (err) {
    console.error('Failed to load agencies:', err);
  }
}

async function loadProfiles() {
  try {
    const res = await fetch('/api/profiles');
    if (!res.ok) return;
    const data = await res.json();
    state.profiles = data.profiles;
    state.activeProfileKey = data.activeProfile || 'germany';
    updateActiveProfileBanner();
    updateBookmarkletLink();
  } catch (err) {
    console.error('Failed to load profiles:', err);
  }
}

function updateActiveProfileBanner() {
  const lbl = document.getElementById('activeProfileLabel');
  if (!lbl) return;
  if (state.activeProfileKey === 'germany') {
    lbl.innerHTML = `Active Profile: <strong>🇩🇪 Germany (Engineering / EU Blue Card)</strong>`;
  } else {
    lbl.innerHTML = `Active Profile: <strong>🇱🇰 Sri Lanka (Mechatronics / Automation)</strong>`;
  }
}

function updateBookmarkletLink() {
  const profile = (state.profiles && state.profiles[state.activeProfileKey]) || (state.profiles && state.profiles.germany) || {
    name: 'Muhammadhu Inaam',
    email: 'mohamedinnam787@gmail.com',
    phone: '+94 77 089 6608',
    address: 'Beruwala, Kalutara, Sri Lanka',
    country: 'Sri Lanka',
    linkedin: 'https://www.linkedin.com/in/muhammadhu-inaam-698566272/',
    github: 'https://github.com/muhammadhu-inaam',
    portfolio: 'https://www.linkedin.com/in/muhammadhu-inaam-698566272/',
    workAuthorization: 'German Opportunity Card (Chancenkarte) & EU Blue Card Ready',
    summary: 'Mechatronics Engineer with 2+ years experience across PLC, HMI, SCADA automation, CNC and robotics.'
  };

  const names = (profile.name || 'Muhammadhu Inaam').trim().split(/\s+/);
  const firstName = names[0] || 'Muhammadhu';
  const lastName = names.slice(1).join(' ') || 'Inaam';
  const fullName = profile.name || 'Muhammadhu Inaam';
  const email = profile.email || 'mohamedinnam787@gmail.com';
  const phone = profile.phone || '+94 77 089 6608';
  const address = profile.address || 'Beruwala, Kalutara, Sri Lanka';
  const city = (profile.address || '').split(',')[0].trim() || 'Kalutara';
  const country = profile.country || (state.activeProfileKey === 'germany' ? 'Germany' : 'Sri Lanka');
  const linkedin = profile.linkedin || 'https://www.linkedin.com/in/muhammadhu-inaam-698566272/';
  const github = profile.github || 'https://github.com/muhammadhu-inaam';
  const portfolio = profile.portfolio || linkedin;
  const workAuth = profile.workAuthorization || 'German Opportunity Card & EU Blue Card Ready';
  const yearsExp = '2+';
  const summary = (profile.summary || '').slice(0, 300).replace(/[\r\n]+/g, ' ').replace(/'/g, "\\'");

  const code = `javascript:(function(){const p={firstName:'${firstName}',lastName:'${lastName}',fullName:'${fullName}',email:'${email}',phone:'${phone}',city:'${city}',address:'${address.replace(/'/g, "\\'")}',country:'${country}',linkedin:'${linkedin}',github:'${github}',portfolio:'${portfolio}',workAuth:'${workAuth.replace(/'/g, "\\'")}',yearsExp:'${yearsExp}',summary:'${summary}'};const rules=[{p:[/first.*name/i,/given.*name/i,/vorname/i,/^fname$/i,/input-firstName/i],v:p.firstName},{p:[/last.*name/i,/family.*name/i,/nachname/i,/surname/i,/^lname$/i,/input-lastName/i],v:p.lastName},{p:[/confirm.*email/i,/best.*tigen/i,/wiederholen/i,/verif.*email/i,/input-confirmEmail/i],v:p.email},{p:[/e-?mail/i,/elektronische.*post/i,/input-email/i],v:p.email},{p:[/phone/i,/telefon/i,/handy/i,/rufnummer/i,/mobile/i,/tel\\b/i,/input-phoneNumber/i],v:p.phone},{p:[/linkedin/i],v:p.linkedin},{p:[/github/i],v:p.github},{p:[/portfolio/i,/website/i,/homepage/i,/webseite/i],v:p.portfolio},{p:[/city/i,/stadt/i,/ort\\b/i,/wohnort/i,/location/i],v:p.city},{p:[/postal/i,/zip/i,/plz/i,/postleitzahl/i],v:'10115'},{p:[/address/i,/adresse/i,/anschrift/i,/strasse/i,/straße/i],v:p.address},{p:[/country/i,/land\\b/i,/staat/i],v:p.country},{p:[/full.*name/i,/^name$/i,/vollst.*ndig/i],v:p.fullName},{p:[/work.*auth/i,/visa/i,/arbeitserlaubnis/i,/aufenthalt/i],v:p.workAuth},{p:[/experience/i,/erfahrung/i,/berufserfahrung/i],v:p.yearsExp},{p:[/summary/i,/anschreiben/i,/cover.*letter/i,/motivation/i],v:p.summary}];function getDesc(el){let t=[el.id,el.name,el.placeholder,el.title,el.getAttribute('aria-label'),el.getAttribute('data-test'),el.getAttribute('data-testid'),el.getAttribute('data-automation-id'),el.getAttribute('autocomplete'),el.type].filter(Boolean).join(' ');if(el.labels&&el.labels.length){for(let l of el.labels)t+=' '+(l.innerText||l.textContent||'');}if(el.id){try{const l=document.querySelector('label[for=\\''+(window.CSS&&CSS.escape?CSS.escape(el.id):el.id)+'\\']');if(l)t+=' '+(l.innerText||l.textContent||'');}catch(e){}}const lb=el.getAttribute('aria-labelledby');if(lb){lb.split(/\\s+/).forEach(function(i){const o=document.getElementById(i);if(o)t+=' '+(o.innerText||o.textContent||'');});}if(el.previousElementSibling){t+=' '+(el.previousElementSibling.innerText||el.previousElementSibling.textContent||'');}let pNode=el.parentElement;for(let i=0;i<4&&pNode;i++){const items=pNode.querySelectorAll('label,[class*=label],[class*=Label],[class*=title],[class*=legend],span,strong,p');items.forEach(function(item){const txt=(item.innerText||item.textContent||'').trim();if(txt&&txt.length<80)t+=' '+txt;});if(pNode.className&&typeof pNode.className==='string')t+=' '+pNode.className;pNode=pNode.parentElement;}return t.toLowerCase();}function fill(el,val){try{el.focus();const proto=el instanceof HTMLTextAreaElement?window.HTMLTextAreaElement.prototype:window.HTMLInputElement.prototype;const desc=Object.getOwnPropertyDescriptor(proto,'value');if(desc&&desc.set){desc.set.call(el,val);}else{el.value=val;}el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));el.dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,key:'Enter'}));el.dispatchEvent(new KeyboardEvent('keyup',{bubbles:true,key:'Enter'}));el.dispatchEvent(new Event('blur',{bubbles:true}));el.style.transition='all 0.3s ease';el.style.border='2px solid #10b981';el.style.boxShadow='0 0 0 3px rgba(16,185,129,0.3)';el.style.backgroundColor='#ecfdf5';return true;}catch(e){return false;}}let count=0;const elements=Array.from(document.querySelectorAll('input:not([type=hidden]):not([type=submit]):not([type=button]):not([type=checkbox]):not([type=radio]):not([type=file]),textarea'));elements.forEach(function(el){const desc=getDesc(el);for(let i=0;i<rules.length;i++){const r=rules[i];let matched=false;for(let j=0;j<r.p.length;j++){if(r.p[j].test(desc)){matched=true;break;}}if(matched&&r.v){if(fill(el,r.v))count++;break;}}});alert('⚡ AeroApply: Filled '+count+' application fields for '+p.fullName+'!');})();`;

  const link = document.getElementById('bookmarkletLink');
  if (link) link.href = code;
}

async function loadJobs() {
  try {
    jobsContainer.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Scanning job vacancies across Germany & Sri Lanka...</p>
      </div>
    `;

    const params = new URLSearchParams();
    if (state.activeCountryFilter !== 'all') params.append('country', state.activeCountryFilter);
    if (state.activeCountryFilter === 'freelance') params.set('country', 'freelance');
    if (state.activeAgencyFilter !== 'all') params.append('agency', state.activeAgencyFilter);
    if (state.activeStatusFilter !== 'all') params.append('status', state.activeStatusFilter);
    if (state.searchQuery.trim()) params.append('q', state.searchQuery.trim());

    const res = await fetch(`/api/jobs?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to load jobs');
    const data = await res.json();
    state.jobs = data.jobs || [];

    renderJobs();
  } catch (err) {
    jobsContainer.innerHTML = `
      <div class="empty-state">
        <p>⚠️ Error loading jobs: ${err.message}</p>
      </div>
    `;
  }
}

// ==========================================
// RENDERING JOBS
// ==========================================
function renderJobs() {
  resultsCount.textContent = `${state.jobs.length} position${state.jobs.length === 1 ? '' : 's'}`;

  if (state.jobs.length === 0) {
    jobsContainer.innerHTML = `
      <div class="empty-state">
        <div style="font-size: 38px; margin-bottom: 12px;">🔍</div>
        <h3>No matching vacancies found</h3>
        <p>Try adjusting your search criteria, selecting another agency, or run the live scraper to discover newly posted roles.</p>
        <div style="margin-top: 18px;">
          <button class="btn btn-primary" onclick="resetFilters()">Reset All Filters</button>
        </div>
      </div>
    `;
    return;
  }

  jobsContainer.innerHTML = '';
  state.jobs.forEach(job => {
    const card = createJobCard(job);
    jobsContainer.appendChild(card);
  });
}

function createJobCard(job) {
  const isApplied = job.status === 'applied';
  const isGerman = job.countryCode === 'DE' || job.country === 'Germany';

  const card = document.createElement('div');
  card.className = `job-card ${isApplied ? 'is-applied' : ''}`;
  card.setAttribute('data-id', job.id);

  // Initial letter badge
  const initial = (job.company || 'C').charAt(0).toUpperCase();

  const formattedDate = job.appliedAt 
    ? new Date(job.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  card.innerHTML = `
    ${isApplied ? `<div class="applied-ribbon">APPLIED</div>` : ''}

    <div>
      <div class="card-top">
        <div class="company-meta">
          <div class="company-avatar">${initial}</div>
          <div class="company-info">
            <h4>${escapeHtml(job.company)}</h4>
            <span class="agency-tag">${escapeHtml(job.agency || 'Direct Placement')}</span>
          </div>
        </div>

        <div class="country-pill ${isGerman ? 'de' : 'lk'}">
          <span>${isGerman ? '🇩🇪' : '🇱🇰'}</span>
          <span>${isGerman ? 'Germany' : 'Sri Lanka'}</span>
        </div>
      </div>

      <h3 class="job-title">${escapeHtml(job.title)}</h3>

      <div class="job-meta-row">
        <div class="job-meta-item">
          <span>📍</span>
          <span>${escapeHtml(job.location)}</span>
        </div>
        <div class="job-meta-item">
          <span>💼</span>
          <span>${escapeHtml(job.workType || 'Full-time')}</span>
        </div>
      </div>

      <p class="job-desc-snippet">${escapeHtml(job.description || '')}</p>

      <div class="job-tags">
        ${(job.tags || []).slice(0, 4).map(t => `<span class="job-tag">${escapeHtml(t)}</span>`).join('')}
      </div>
    </div>

    <div>
      <div class="card-actions">
        ${isApplied ? `
          <div class="applied-badge">
            <span>✅ Applied on ${formattedDate}</span>
          </div>
        ` : `
          <div style="font-size: 12px; font-weight: 700; color: var(--accent-cyan); font-family: var(--font-mono);">
            ${escapeHtml(job.salary || 'Market Standard')}
          </div>
        `}

        <div style="display: flex; gap: 6px;">
          <button class="btn btn-secondary btn-sm" onclick="downloadCoverLetterPdf('${job.id}')" title="Download Tailored Cover Letter PDF">
            📄 PDF
          </button>
          <button class="btn btn-primary btn-sm" onclick="openReviewModal('${job.id}')">
            ⚡ ${isApplied ? 'Review / Re-apply' : 'Review & Apply'}
          </button>
        </div>
      </div>
    </div>
  `;

  return card;
}

// ==========================================
// REVIEW & APPROVE-TO-APPLY MODAL
// ==========================================
async function openReviewModal(jobId) {
  try {
    const res = await fetch(`/api/jobs/${jobId}`);
    if (!res.ok) throw new Error('Job not found');
    const data = await res.json();

    state.selectedJob = data.job;
    state.selectedReviewProfileKey = data.job.selectedCvProfile || (data.job.countryCode === 'DE' ? 'germany' : 'sriLanka');
    state.selectedLetterLang = 'en';

    const job = data.job;
    const isGerman = job.countryCode === 'DE' || job.country === 'Germany';

    // Populate Left Details
    document.getElementById('modalCountryTag').textContent = isGerman ? '🇩🇪 GERMANY RECRUITMENT' : '🇱🇰 SRI LANKA TECH';
    document.getElementById('modalCountryTag').className = `modal-tag ${isGerman ? 'kpi-de' : 'kpi-lk'}`;
    document.getElementById('modalJobTitle').textContent = job.title;
    document.getElementById('modalJobSub').textContent = `${job.company} • ${job.location} • via ${job.agency || 'Direct'}`;
    
    document.getElementById('modalSalary').textContent = job.salary || 'Competitive';
    document.getElementById('modalWorkType').textContent = job.workType || 'Full-time';
    document.getElementById('modalLocation').textContent = job.location;
    document.getElementById('modalJobDesc').textContent = job.description;

    // Requirements
    const reqList = document.getElementById('modalRequirementsList');
    reqList.innerHTML = '';
    (job.requirements || []).forEach(r => {
      const li = document.createElement('li');
      li.textContent = r;
      reqList.appendChild(li);
    });

    // Portal Link to Specific Job Post
    const portalBtn = document.getElementById('modalPortalLink');
    const specificJobUrl = job.adUrl || job.applyUrl || '#';
    portalBtn.href = specificJobUrl;
    portalBtn.target = '_blank';
    const isTopjobs = (job.adUrl && job.adUrl.includes('topjobs.lk')) || (job.applyUrl && job.applyUrl.includes('topjobs.lk'));
    portalBtn.innerHTML = `<span>🌐 ${isTopjobs ? 'Open Specific Topjobs Advertisement Post' : 'Open Specific Job Posting'}</span><span class="external-icon">↗</span>`;

    // Recruiter Email & Verification Badge
    const emailToUse = job.contactEmail || data.emailDraft.to;
    document.getElementById('modalContactEmail').value = emailToUse;
    const badge = document.getElementById('modalEmailBadge');
    if (badge) {
      badge.style.display = job.emailVerified ? 'inline-block' : 'none';
    }

    const postLinkEl = document.getElementById('modalOriginalPostLink');
    if (postLinkEl) {
      if (job.adUrl) {
        postLinkEl.innerHTML = `<span>Original Ad: </span><a href="${escapeHtml(job.adUrl)}" target="_blank" style="color: #0284c7; text-decoration: underline;">Open Topjobs Advertisement Post ↗</a>`;
      } else {
        postLinkEl.innerHTML = '';
      }
    }

    // CV Profile Toggles
    updateReviewProfileSelector(state.selectedReviewProfileKey);

    // Cover Letter Text (Use custom edited text only if full letter exists, otherwise use fresh complete letter)
    const useSaved = job.customCoverLetter && job.customCoverLetter.length > 250;
    document.getElementById('coverLetterTextarea').value = useSaved ? job.customCoverLetter : data.coverLetter;

    // Email Draft
    updateEmailDraftBox(data.emailDraft);
    if (job.customSubject) {
      const emailSubEl = document.getElementById('emailSubVal');
      if (emailSubEl) {
        if (emailSubEl.tagName === 'INPUT') emailSubEl.value = job.customSubject;
        else emailSubEl.textContent = job.customSubject;
      }
    }

    // Open Modal
    reviewModal.classList.add('open');
    reviewModal.setAttribute('aria-hidden', 'false');
  } catch (err) {
    showToast(`Error opening job: ${err.message}`, 'warning');
  }
}

function updateReviewProfileSelector(profileKey) {
  state.selectedReviewProfileKey = profileKey;
  const btnDE = document.getElementById('btnSelectDECV');
  const btnLK = document.getElementById('btnSelectLKCV');

  if (profileKey === 'germany') {
    btnDE.classList.add('active');
    btnLK.classList.remove('active');
  } else {
    btnLK.classList.add('active');
    btnDE.classList.remove('active');
  }

  // Update CV file name label
  const p = state.profiles ? state.profiles[profileKey] : null;
  if (p) {
    const cvLabel = document.getElementById('modalCvFileName');
    if (cvLabel) cvLabel.textContent = p.cvFileName;
    const attachedCvName = document.getElementById('attachedCvName');
    if (attachedCvName) attachedCvName.textContent = p.cvFileName;
  }
}

function updateEmailDraftBox(draft) {
  document.getElementById('emailToVal').textContent = draft.to;
  const emailSubEl = document.getElementById('emailSubVal');
  if (emailSubEl) {
    if (emailSubEl.tagName === 'INPUT') {
      emailSubEl.value = draft.subject;
    } else {
      emailSubEl.textContent = draft.subject;
    }
  }
  document.getElementById('emailBodyVal').textContent = draft.body;
}

// Auto-save edited cover letter and subject to server
async function saveCustomCoverLetterToServer() {
  if (!state.selectedJob) return;
  const textarea = document.getElementById('coverLetterTextarea');
  const letterText = textarea ? textarea.value : '';
  const emailSubEl = document.getElementById('emailSubVal');
  const subject = emailSubEl ? (emailSubEl.value || emailSubEl.textContent || '') : '';

  try {
    await fetch(`/api/jobs/${state.selectedJob.id}/cover-letter/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        coverLetterText: letterText,
        subject: subject,
        profileKey: state.selectedReviewProfileKey
      })
    });
    state.selectedJob.customCoverLetter = letterText;
    state.selectedJob.customSubject = subject;
  } catch (err) {
    console.warn('Auto-save error:', err);
  }
}

// Re-generate or switch language for cover letter
async function refreshCoverLetter() {
  if (!state.selectedJob) return;

  try {
    const res = await fetch(`/api/jobs/${state.selectedJob.id}/cover-letter/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: state.selectedLetterLang,
        profileKey: state.selectedReviewProfileKey
      })
    });
    if (!res.ok) return;
    const data = await res.json();
    document.getElementById('coverLetterTextarea').value = data.coverLetter;
    updateEmailDraftBox(data.emailDraft);
  } catch (err) {
    console.error('Failed to regenerate letter:', err);
  }
}

// ==========================================
// APPROVE & APPLY (THE 1-CLICK DISPATCHER)
// ==========================================
async function handleApproveAndApply() {
  if (!state.selectedJob) return;

  const btn = document.getElementById('btnApproveAndApply');
  const originalText = btn.innerHTML;
  btn.innerHTML = `<span class="spinner" style="width:16px;height:16px;border-width:2px;display:inline-block;margin:0;"></span> Dispathing Application...`;
  btn.disabled = true;

  try {
    const customLetter = document.getElementById('coverLetterTextarea').value;
    const customEmailTo = document.getElementById('modalContactEmail').value;
    const emailSubEl = document.getElementById('emailSubVal');
    const customEmailSub = (emailSubEl ? (emailSubEl.value || emailSubEl.textContent) : '') || '';
    const customEmailBody = document.getElementById('emailBodyVal').textContent;

    const res = await fetch(`/api/jobs/${state.selectedJob.id}/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profileKey: state.selectedReviewProfileKey,
        customCoverLetterText: customLetter,
        customEmail: {
          to: customEmailTo,
          subject: customEmailSub,
          body: customEmailBody
        }
      })
    });

    if (!res.ok) throw new Error('Apply failed on server');
    const result = await res.json();

    // 1. Download Customized Cover Letter PDF with user's edited subject
    await downloadCoverLetterPdf(state.selectedJob.id);

    // 2. Automatically trigger fresh .eml download for Outlook with both PDFs pre-attached
    setTimeout(() => {
      const emlLink = document.createElement('a');
      emlLink.href = `/api/jobs/${state.selectedJob.id}/eml?t=${Date.now()}`;
      emlLink.download = `Application_${state.selectedJob.id}.eml`;
      document.body.appendChild(emlLink);
      emlLink.click();
      document.body.removeChild(emlLink);
    }, 400);

    // 3. Close Modal & Show Success Toast
    reviewModal.classList.remove('open');
    reviewModal.setAttribute('aria-hidden', 'true');

    showToast(`🚀 Approved! Outlook compose launched with Cover Letter & CV pre-attached, and portal opened!`, 'success');

    // Refresh jobs and stats
    await loadStats();
    await loadJobs();
  } catch (err) {
    showToast(`Error dispatching application: ${err.message}`, 'warning');
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

// Open Outlook on demand with both PDFs pre-attached
async function handleOpenOutlookDirect() {
  if (!state.selectedJob) return;

  const customLetter = document.getElementById('coverLetterTextarea').value;
  const customEmailTo = document.getElementById('modalContactEmail').value;
  const emailSubEl = document.getElementById('emailSubVal');
  const customEmailSub = (emailSubEl ? (emailSubEl.value || emailSubEl.textContent) : '') || '';
  const customEmailBody = document.getElementById('emailBodyVal').textContent;

  showToast('✉️ Opening Outlook with Cover Letter & CV attached...', 'info');

  try {
    const res = await fetch(`/api/jobs/${state.selectedJob.id}/open-outlook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profileKey: state.selectedReviewProfileKey,
        customCoverLetterText: customLetter,
        to: customEmailTo,
        subject: customEmailSub,
        body: customEmailBody
      })
    });

    if (res.ok) {
      showToast('✅ Outlook compose opened with Cover Letter & CV attached!', 'success');
    }

    // Also trigger fresh .eml download as immediate direct launch
    const emlLink = document.createElement('a');
    emlLink.href = `/api/jobs/${state.selectedJob.id}/eml?t=${Date.now()}`;
    emlLink.download = `Application_${state.selectedJob.id}.eml`;
    document.body.appendChild(emlLink);
    emlLink.click();
    document.body.removeChild(emlLink);
  } catch (err) {
    window.location.href = `/api/jobs/${state.selectedJob.id}/eml`;
  }
}

// Download PDF button handler (Preserves customized cover letter text and edited subject)
async function downloadCoverLetterPdf(jobId) {
  const id = jobId || (state.selectedJob ? state.selectedJob.id : null);
  if (!id) return;

  const textarea = document.getElementById('coverLetterTextarea');
  const letterText = textarea ? textarea.value : '';
  const emailSubEl = document.getElementById('emailSubVal');
  const subject = emailSubEl ? (emailSubEl.value || emailSubEl.textContent || '') : '';

  showToast('📄 Generating Cover Letter PDF with your edited subject...', 'info');

  try {
    const res = await fetch(`/api/jobs/${id}/cover-letter/pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        coverLetterText: letterText,
        subject: subject,
        profileKey: state.selectedReviewProfileKey
      })
    });

    if (!res.ok) throw new Error('PDF download error');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Cover_Letter_Muhammadhu_Inaam.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    showToast('✅ Downloaded Cover Letter PDF with your edited subject!', 'success');
  } catch (err) {
    window.open(`/api/jobs/${id}/cover-letter/pdf`, '_blank');
  }
}

// ==========================================
// PROFILE & CV MANAGEMENT
// ==========================================
function openProfileModal(tabKey = 'germany') {
  renderProfileTab(tabKey);
  profileModal.classList.add('open');
  profileModal.setAttribute('aria-hidden', 'false');
}

function renderProfileTab(profileKey) {
  if (profileKey === 'outlook') {
    document.getElementById('profileForm').style.display = 'none';
    document.getElementById('outlookTabContent').style.display = 'block';

    document.getElementById('tabProfileDE').classList.remove('active');
    document.getElementById('tabProfileLK').classList.remove('active');
    document.getElementById('tabOutlookSettings').classList.add('active');
    return;
  }

  document.getElementById('profileForm').style.display = 'block';
  document.getElementById('outlookTabContent').style.display = 'none';

  const tabDE = document.getElementById('tabProfileDE');
  const tabLK = document.getElementById('tabProfileLK');
  const tabOutlook = document.getElementById('tabOutlookSettings');

  if (profileKey === 'germany') {
    tabDE.classList.add('active');
    tabLK.classList.remove('active');
    tabOutlook.classList.remove('active');
    document.getElementById('profCvLabel').textContent = 'German Engineering CV (Lebenslauf)';
  } else {
    tabLK.classList.add('active');
    tabDE.classList.remove('active');
    tabOutlook.classList.remove('active');
    document.getElementById('profCvLabel').textContent = 'Sri Lankan Tech CV';
  }

  const p = state.profiles ? state.profiles[profileKey] : null;
  if (!p) return;

  document.getElementById('profName').value = p.name || '';
  document.getElementById('profTitle').value = p.title || '';
  document.getElementById('profEmail').value = p.email || '';
  document.getElementById('profPhone').value = p.phone || '';
  document.getElementById('profAddress').value = p.address || '';
  document.getElementById('profWorkAuth').value = p.workAuthorization || '';
  document.getElementById('profLanguages').value = p.languages || '';
  document.getElementById('profLinkedIn').value = p.linkedin || '';
  document.getElementById('profGitHub').value = p.github || '';
  document.getElementById('profSummary').value = p.summary || '';
  document.getElementById('profSkills').value = (p.skills || []).join(', ');

  document.getElementById('currentCvFileName').textContent = p.cvFileName;
  const dlBtn = document.getElementById('downloadCurrentCvBtn');
  dlBtn.href = `/api/profiles/${profileKey}/download-cv`;

  document.getElementById('profileForm').setAttribute('data-country', profileKey);
}

async function handleProfileSave(e) {
  e.preventDefault();
  const countryKey = document.getElementById('profileForm').getAttribute('data-country') || 'germany';

  const payload = {
    name: document.getElementById('profName').value,
    title: document.getElementById('profTitle').value,
    email: document.getElementById('profEmail').value,
    phone: document.getElementById('profPhone').value,
    address: document.getElementById('profAddress').value,
    workAuthorization: document.getElementById('profWorkAuth').value,
    languages: document.getElementById('profLanguages').value,
    linkedin: document.getElementById('profLinkedIn').value,
    github: document.getElementById('profGitHub').value,
    summary: document.getElementById('profSummary').value,
    skills: document.getElementById('profSkills').value.split(',').map(s => s.trim()).filter(Boolean)
  };

  try {
    const res = await fetch(`/api/profiles/${countryKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Save failed');

    const statusEl = document.getElementById('profileSaveStatus');
    statusEl.textContent = '✅ Saved successfully!';
    setTimeout(() => { statusEl.textContent = ''; }, 3000);

    await loadProfiles();
    showToast(`Profile updated for ${countryKey === 'germany' ? 'Germany' : 'Sri Lanka'}`, 'success');
  } catch (err) {
    showToast(`Error saving profile: ${err.message}`, 'warning');
  }
}

async function handleCvFileUpload(file) {
  if (!file) return;
  const countryKey = document.getElementById('profileForm').getAttribute('data-country') || 'germany';

  const formData = new FormData();
  formData.append('cvFile', file);

  try {
    const res = await fetch(`/api/profiles/${countryKey}/upload-cv`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('Upload failed');
    const result = await res.json();

    document.getElementById('currentCvFileName').textContent = result.filename;
    await loadProfiles();
    showToast(`CV uploaded successfully: ${result.filename}`, 'success');
  } catch (err) {
    showToast(`Error uploading CV: ${err.message}`, 'warning');
  }
}

// ==========================================
// IMPORT JOB FROM URL
// ==========================================
async function handleImportUrl() {
  const urlInput = document.getElementById('importUrlInput');
  const url = urlInput.value.trim();
  if (!url) return;

  const statusEl = document.getElementById('importStatus');
  statusEl.innerHTML = `<span class="spinner" style="width:14px;height:14px;border-width:2px;display:inline-block;margin:0;"></span> Scraping and parsing job details...`;

  try {
    const res = await fetch('/api/jobs/import-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Import failed');

    statusEl.innerHTML = `<span style="color:#10b981;">✅ Imported: ${result.job.title} at ${result.job.company}!</span>`;
    urlInput.value = '';

    await loadStats();
    await loadJobs();

    setTimeout(() => {
      importModal.classList.remove('open');
      statusEl.innerHTML = '';
      openReviewModal(result.job.id);
    }, 1200);
  } catch (err) {
    statusEl.innerHTML = `<span style="color:#ef4444;">⚠️ ${err.message}</span>`;
  }
}

// ==========================================
// LIVE SCRAPER TRIGGER
// ==========================================
async function handleRunScraper() {
  const btn = document.getElementById('btnScrapeLive');
  if (btn.disabled) return;

  btn.disabled = true;
  let remaining = 60;
  const originalHtml = btn.innerHTML;
  btn.innerHTML = `<span class="spinner" style="width:14px;height:14px;border-width:2px;display:inline-block;margin:0 4px 0 0;"></span> Scanning (${remaining}s)`;

  showToast('🚀 Commencing 1-Minute Deep Scrape across Topjobs LK & 28 German Agency Desks...', 'info');

  const timer = setInterval(() => {
    remaining--;
    if (remaining > 0) {
      btn.innerHTML = `<span class="spinner" style="width:14px;height:14px;border-width:2px;display:inline-block;margin:0 4px 0 0;"></span> Scanning (${remaining}s)`;
      if (remaining === 45) {
        showToast('🔎 [15s] Scanning Topjobs Sri Lanka (MAE - Eng/Mech/Elec & POS - Manufacturing)...', 'info');
      } else if (remaining === 30) {
        showToast('📡 [30s] Parsing individual advertisements & extracting direct recruiter contact emails...', 'info');
      } else if (remaining === 15) {
        showToast('🇩🇪 [45s] Synchronizing vacancies with 28 German recruitment partner desks...', 'info');
      }
    } else {
      btn.innerHTML = `<span class="spinner" style="width:14px;height:14px;border-width:2px;display:inline-block;margin:0 4px 0 0;"></span> Finalizing...`;
    }
  }, 1000);

  try {
    const res = await fetch('/api/jobs/scrape', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ durationSeconds: 60 })
    });
    const result = await res.json();
    clearInterval(timer);
    showToast(result.message || '✅ 1-Minute Deep Scrape completed!', 'success');
    await loadStats();
    await loadJobs();
  } catch (err) {
    clearInterval(timer);
    showToast(`Deep scrape finished: ${err.message}`, 'info');
    await loadStats();
    await loadJobs();
  } finally {
    clearInterval(timer);
    btn.disabled = false;
    btn.innerHTML = originalHtml;
  }
}

// ==========================================
// EVENT LISTENERS
// ==========================================
function setupEventListeners() {
  // Country & Status Tabs
  document.getElementById('tabAll').addEventListener('click', () => setTab('all', 'all'));
  document.getElementById('tabDE').addEventListener('click', () => setTab('de', 'all'));
  document.getElementById('tabLK').addEventListener('click', () => setTab('lk', 'all'));
  document.getElementById('tabApplied').addEventListener('click', () => setTab('all', 'applied'));
  const tabFL = document.getElementById('tabFreelance'); if (tabFL) tabFL.addEventListener('click', () => setTab('freelance', 'all'));

  // Agency Dropdown Filter
  agencyFilter.addEventListener('change', (e) => {
    state.activeAgencyFilter = e.target.value;
    if (state.activeAgencyFilter !== 'all') {
      // Automatically switch to Germany tab
      setTab('de', state.activeStatusFilter);
    } else {
      loadJobs();
    }
  });

  // Search Input
  let searchDebounce = null;
  searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    clearSearchBtn.style.display = state.searchQuery ? 'block' : 'none';
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
      loadJobs();
    }, 250);
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    state.searchQuery = '';
    clearSearchBtn.style.display = 'none';
    loadJobs();
  });

  // Top Nav Buttons
  document.getElementById('btnImportJob').addEventListener('click', () => {
    importModal.classList.add('open');
    importModal.setAttribute('aria-hidden', 'false');
  });
  document.getElementById('btnScrapeLive').addEventListener('click', handleRunScraper);
  document.getElementById('btnAutofillModal').addEventListener('click', () => {
    updateBookmarkletLink();
    autofillModal.classList.add('open');
    autofillModal.setAttribute('aria-hidden', 'false');
  });
  document.getElementById('btnManageProfile').addEventListener('click', () => openProfileModal(state.activeProfileKey));

  // Review Modal Controls
  document.getElementById('closeReviewModal').addEventListener('click', () => reviewModal.classList.remove('open'));
  document.getElementById('btnCancelReview').addEventListener('click', () => reviewModal.classList.remove('open'));
  document.getElementById('btnApproveAndApply').addEventListener('click', handleApproveAndApply);
  document.getElementById('btnDownloadCoverLetterPdf').addEventListener('click', () => downloadCoverLetterPdf());
  const btnOpenOutlookDirect = document.getElementById('btnOpenOutlookDirect');
  if (btnOpenOutlookDirect) {
    btnOpenOutlookDirect.addEventListener('click', handleOpenOutlookDirect);
  }

  // Language buttons in review
  document.getElementById('langEn').addEventListener('click', () => {
    state.selectedLetterLang = 'en';
    document.getElementById('langEn').classList.add('active');
    document.getElementById('langDe').classList.remove('active');
    refreshCoverLetter();
  });
  document.getElementById('langDe').addEventListener('click', () => {
    state.selectedLetterLang = 'de';
    document.getElementById('langDe').classList.add('active');
    document.getElementById('langEn').classList.remove('active');
    refreshCoverLetter();
  });

  // CV Toggle in review
  document.getElementById('btnSelectDECV').addEventListener('click', () => {
    updateReviewProfileSelector('germany');
    refreshCoverLetter();
  });
  document.getElementById('btnSelectLKCV').addEventListener('click', () => {
    updateReviewProfileSelector('sriLanka');
    refreshCoverLetter();
  });

  // Re-generate Letter
  document.getElementById('btnResetLetter').addEventListener('click', refreshCoverLetter);

  // Copy Email text
  document.getElementById('btnCopyEmailText').addEventListener('click', () => {
    const text = document.getElementById('emailBodyVal').textContent;
    navigator.clipboard.writeText(text);
    showToast('Copied email text to clipboard!', 'info');
  });

  // Download CV file in review modal
  document.getElementById('btnDownloadCvFile').addEventListener('click', () => {
    window.open(`/api/profiles/${state.selectedReviewProfileKey}/download-cv`, '_blank');
  });

  // Sync Contact Email input with preview
  const contactInput = document.getElementById('modalContactEmail');
  if (contactInput) {
    contactInput.addEventListener('input', (e) => {
      const emailToVal = document.getElementById('emailToVal');
      if (emailToVal) emailToVal.textContent = e.target.value.trim();
    });
  }

  // 2-Way Sync between Cover Letter Subject and Email Subject Input
  const clTextarea = document.getElementById('coverLetterTextarea');
  const emailSubInput = document.getElementById('emailSubVal');

  if (clTextarea) {
    clTextarea.addEventListener('input', (e) => {
      const val = e.target.value;
      const subMatch = val.match(/(?:^|\n)\s*(?:Subject|Betreff)\s*:\s*([^\n\r]+)/i);
      if (subMatch && subMatch[1].trim() && emailSubInput) {
        if (emailSubInput.tagName === 'INPUT') {
          emailSubInput.value = subMatch[1].trim();
        } else {
          emailSubInput.textContent = subMatch[1].trim();
        }
      }

      // Auto-save on debounce
      if (state.selectedJob) {
        clearTimeout(state.coverLetterSaveTimer);
        state.coverLetterSaveTimer = setTimeout(() => {
          saveCustomCoverLetterToServer();
        }, 500);
      }
    });
  }

  if (emailSubInput) {
    emailSubInput.addEventListener('input', (e) => {
      const newSubject = e.target.value.trim();
      if (clTextarea && clTextarea.value) {
        if (/(?:^|\n)\s*(?:Subject|Betreff)\s*:\s*[^\n\r]+/i.test(clTextarea.value)) {
          clTextarea.value = clTextarea.value.replace(/((?:^|\n)\s*(?:Subject|Betreff)\s*:\s*)[^\n\r]+/i, `$1${newSubject}`);
        }
      }
      if (state.selectedJob) {
        clearTimeout(state.coverLetterSaveTimer);
        state.coverLetterSaveTimer = setTimeout(() => {
          saveCustomCoverLetterToServer();
        }, 500);
      }
    });
  }

  // Re-detect Recruiter Email from post
  const btnDetect = document.getElementById('btnDetectEmail');
  if (btnDetect) {
    btnDetect.addEventListener('click', async () => {
      if (!state.selectedJob) return;
      const oldText = btnDetect.textContent;
      btnDetect.textContent = '⏳ Scanning...';
      btnDetect.disabled = true;

      try {
        const res = await fetch(`/api/jobs/${state.selectedJob.id}/refresh-email`, { method: 'POST' });
        const data = await res.json();
        if (data.success && data.contactEmail) {
          state.selectedJob.contactEmail = data.contactEmail;
          state.selectedJob.emailVerified = data.emailVerified;
          document.getElementById('modalContactEmail').value = data.contactEmail;
          const emailToVal = document.getElementById('emailToVal');
          if (emailToVal) emailToVal.textContent = data.contactEmail;
          const badge = document.getElementById('modalEmailBadge');
          if (badge) badge.style.display = data.emailVerified ? 'inline-block' : 'none';
          showToast(data.message, data.emailVerified ? 'success' : 'info');
        } else {
          showToast(data.message || 'Could not detect recruiter email from post', 'warning');
        }
      } catch (err) {
        showToast(`Detection error: ${err.message}`, 'warning');
      } finally {
        btnDetect.textContent = oldText;
        btnDetect.disabled = false;
      }
    });
  }

  // Profile Modal Controls
  document.getElementById('closeProfileModal').addEventListener('click', () => profileModal.classList.remove('open'));
  document.getElementById('tabProfileDE').addEventListener('click', () => renderProfileTab('germany'));
  document.getElementById('tabProfileLK').addEventListener('click', () => renderProfileTab('sriLanka'));
  document.getElementById('tabOutlookSettings').addEventListener('click', () => renderProfileTab('outlook'));
  document.getElementById('profileForm').addEventListener('submit', handleProfileSave);

  // CV File Upload dropzone
  const dropzone = document.getElementById('dropzoneTrigger');
  const fileInput = document.getElementById('cvFileInput');
  dropzone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleCvFileUpload(e.target.files[0]);
    }
  });

  // Autofill Modal Controls
  document.getElementById('closeAutofillModal').addEventListener('click', () => autofillModal.classList.remove('open'));
  const btnCopyBm = document.getElementById('btnCopyBookmarkletCode');
  if (btnCopyBm) {
    btnCopyBm.addEventListener('click', () => {
      const link = document.getElementById('bookmarkletLink');
      if (link && link.href) {
        navigator.clipboard.writeText(link.href).then(() => {
          showToast('✅ Bookmarklet code copied to clipboard!', 'success');
        }).catch(() => {
          showToast('Failed to copy bookmarklet code', 'warning');
        });
      }
    });
  }

  // Import Modal Controls
  document.getElementById('closeImportModal').addEventListener('click', () => importModal.classList.remove('open'));
  document.getElementById('btnCancelImport').addEventListener('click', () => importModal.classList.remove('open'));
  document.getElementById('btnSubmitImport').addEventListener('click', handleImportUrl);

  // Discipline & Germany Internship Pill Filters
  document.querySelectorAll('.pill-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pill-filter').forEach(b => {
        b.classList.remove('active');
        b.style.background = 'rgba(255,255,255,0.03)';
        b.style.color = '#9ca3af';
      });
      btn.classList.add('active');
      btn.style.background = 'rgba(255,255,255,0.15)';
      btn.style.color = '#fff';

      const term = btn.getAttribute('data-term');
      if (term === 'all') {
        state.searchQuery = '';
        searchInput.value = '';
      } else if (term === 'internship') {
        state.searchQuery = 'intern';
        searchInput.value = 'internship';
        setTab('de', 'all');
        return;
      } else {
        state.searchQuery = term;
        searchInput.value = term;
      }
      loadJobs();
    });
  });

  // Close modals on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
    }
  });
}

function setTab(country, status) {
  state.activeCountryFilter = country;
  state.activeStatusFilter = status;

  document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));

  if (status === 'applied') {
    document.getElementById('tabApplied').classList.add('active');
    document.getElementById('sectionTitle').textContent = 'Applied Positions & Applications History';
  } else {
    document.getElementById('sectionTitle').textContent = 'Available Positions';
    if (country === 'all') document.getElementById('tabAll').classList.add('active');
    else if (country === 'de') document.getElementById('tabDE').classList.add('active');
    else if (country === 'lk') document.getElementById('tabLK').classList.add('active');
    else if (country === 'freelance') document.getElementById('tabFreelance')?.classList.add('active');
  }

  loadJobs();
}

function resetFilters() {
  state.activeCountryFilter = 'all';
  state.activeStatusFilter = 'all';
  state.activeAgencyFilter = 'all';
  state.searchQuery = '';
  searchInput.value = '';
  agencyFilter.value = 'all';
  setTab('all', 'all');
}

// ==========================================
// TOAST NOTIFICATIONS
// ==========================================
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icon = type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
  toast.innerHTML = `<span>${icon}</span> <span>${escapeHtml(message)}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(30px)';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 4000);
}

// Helper: Escape HTML
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
