/**
 * AeroApply Content Script
 * Automatically detects job application form fields and injects a smart floating autofill button.
 */

(function () {
  // Prevent duplicate injection
  if (window.__AEROAPPLY_INJECTED__) return;
  window.__AEROAPPLY_INJECTED__ = true;

  // Default Candidate Data (fallback if local server not running)
  let candidateData = {
    firstName: "Muhammadhu",
    lastName: "Inaam",
    fullName: "Muhammadhu Inaam",
    email: "mohamedinnam787@gmail.com",
    phone: "+94 77 089 6608",
    address: "Beruwala, Kalutara, Sri Lanka",
    city: "Kalutara",
    country: "Sri Lanka",
    linkedin: "https://www.linkedin.com/in/muhammadhu-inaam-698566272/",
    github: "https://github.com/muhammadhu-inaam",
    portfolio: "https://www.linkedin.com/in/muhammadhu-inaam-698566272/",
    workAuth: "Eligible for German Opportunity Card (Chancenkarte) & EU Blue Card Fast-Track Recognition",
    yearsExp: "2+",
    summary: "Mechatronics Engineer with 2+ years hands-on experience across PLC/HMI/SCADA automation, embedded systems, power electronics, and CNC machinery. BEng (Hons) Mechatronics & Ceylon German Technical Training Institute certified."
  };

  // Attempt to fetch live active profile from AeroApply local backend
  try {
    fetch('http://localhost:3000/api/profiles/active')
      .then(res => res.json())
      .then(profile => {
        if (profile && profile.name) {
          const names = profile.name.split(' ');
          candidateData.firstName = names[0] || '';
          candidateData.lastName = names.slice(1).join(' ') || '';
          candidateData.fullName = profile.name;
          candidateData.email = profile.email || candidateData.email;
          candidateData.phone = profile.phone || candidateData.phone;
          candidateData.address = profile.address || candidateData.address;
          candidateData.city = (profile.address || '').split(',')[0] || 'Berlin';
          candidateData.linkedin = profile.linkedin || candidateData.linkedin;
          candidateData.github = profile.github || candidateData.github;
          candidateData.portfolio = profile.portfolio || candidateData.portfolio;
          candidateData.workAuth = profile.workAuthorization || candidateData.workAuth;
          candidateData.summary = profile.summary || candidateData.summary;
        }
      })
      .catch(() => {
        // Fallback to chrome storage if local server is unreachable
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.get(['activeProfileData'], (result) => {
            if (result.activeProfileData) {
              candidateData = Object.assign(candidateData, result.activeProfileData);
            }
          });
        }
      });
  } catch (e) {
    // Ignore fetch errors
  }

  // Field detection mappings with explicit confirm-email rule
  const fieldRules = [
    { patterns: [/first.*name/i, /given.*name/i, /vorname/i, /^fname$/i, /input-firstName/i], value: () => candidateData.firstName },
    { patterns: [/last.*name/i, /family.*name/i, /nachname/i, /surname/i, /^lname$/i, /input-lastName/i], value: () => candidateData.lastName },
    { patterns: [/confirm.*email/i, /best.*tigen/i, /wiederholen/i, /verif.*email/i, /input-confirmEmail/i], value: () => candidateData.email },
    { patterns: [/e-?mail/i, /elektronische.*post/i, /input-email/i], value: () => candidateData.email },
    { patterns: [/phone/i, /tel\b/i, /mobile/i, /telefon/i, /handy/i, /rufnummer/i, /input-phoneNumber/i], value: () => candidateData.phone },
    { patterns: [/linkedin/i], value: () => candidateData.linkedin },
    { patterns: [/github/i], value: () => candidateData.github },
    { patterns: [/portfolio/i, /website/i, /personal.*site/i, /webseite/i], value: () => candidateData.portfolio },
    { patterns: [/city/i, /stadt/i, /ort\b/i, /wohnort/i, /location/i], value: () => candidateData.city },
    { patterns: [/postal/i, /zip/i, /plz/i, /postleitzahl/i], value: () => '10115' },
    { patterns: [/address/i, /adresse/i, /strasse/i, /straße/i, /anschrift/i], value: () => candidateData.address },
    { patterns: [/country/i, /land\b/i, /staat/i], value: () => candidateData.country },
    { patterns: [/full.*name/i, /^name$/i, /vollst.*ndiger.*name/i, /applicant.*name/i], value: () => candidateData.fullName },
    { patterns: [/work.*auth/i, /visa/i, /arbeitserlaubnis/i, /aufenthalt/i, /sponsorship/i], value: () => candidateData.workAuth },
    { patterns: [/experience/i, /erfahrung/i, /berufserfahrung/i], value: () => candidateData.yearsExp },
    { patterns: [/summary/i, /about/i, /cover.*letter/i, /anschreiben/i, /motivation/i], value: () => candidateData.summary }
  ];

  function fillInput(el, val) {
    if (!el || !val) return false;
    try {
      el.focus();
      // Use React / Vue compatible native value setter if available
      const proto = el instanceof HTMLTextAreaElement ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
      if (setter) {
        setter.call(el, val);
      } else {
        el.value = val;
      }

      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      el.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
      el.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'Enter' }));
      el.dispatchEvent(new Event('blur', { bubbles: true }));

      el.style.transition = 'all 0.3s ease';
      el.style.boxShadow = '0 0 0 2px #10b981';
      el.style.borderColor = '#10b981';
      el.style.background = 'rgba(16, 185, 129, 0.08)';
      return true;
    } catch(err) {
      console.warn('Error filling element:', err);
      return false;
    }
  }

  function getFieldDescriptor(input) {
    let parts = [
      input.id || '',
      input.name || '',
      input.placeholder || '',
      input.title || '',
      input.getAttribute('aria-label') || '',
      input.getAttribute('aria-placeholder') || '',
      input.getAttribute('data-test') || '',
      input.getAttribute('data-testid') || '',
      input.getAttribute('data-qa') || '',
      input.getAttribute('data-automation-id') || '',
      input.getAttribute('autocomplete') || '',
      input.type || ''
    ];

    if (input.labels && input.labels.length) {
      for (let l of input.labels) parts.push(l.innerText || l.textContent || '');
    }
    if (input.id) {
      try {
        const l = document.querySelector(`label[for="${CSS.escape ? CSS.escape(input.id) : input.id}"]`);
        if (l) parts.push(l.innerText || l.textContent || '');
      } catch (e) {}
    }
    const labelledBy = input.getAttribute('aria-labelledby');
    if (labelledBy) {
      labelledBy.split(/\s+/).forEach(id => {
        const lblEl = document.getElementById(id);
        if (lblEl) parts.push(lblEl.innerText || lblEl.textContent || '');
      });
    }

    if (input.previousElementSibling) {
      parts.push(input.previousElementSibling.innerText || input.previousElementSibling.textContent || '');
    }
    if (input.parentElement && input.parentElement.previousElementSibling) {
      parts.push(input.parentElement.previousElementSibling.innerText || input.parentElement.previousElementSibling.textContent || '');
    }

    // Traverse upwards through container wrappers (up to 4 levels)
    let parent = input.parentElement;
    for (let i = 0; i < 4 && parent; i++) {
      const candidates = parent.querySelectorAll('label, [class*="label" i], [class*="Label"], [class*="title" i], [class*="legend" i], span, strong, p');
      candidates.forEach(lbl => {
        const txt = (lbl.innerText || lbl.textContent || '').trim();
        if (txt && txt.length < 80) parts.push(txt);
      });
      if (parent.className && typeof parent.className === 'string') parts.push(parent.className);
      ['data-test', 'data-testid', 'data-qa', 'data-automation-id'].forEach(attr => {
        const val = parent.getAttribute(attr);
        if (val) parts.push(val);
      });
      parent = parent.parentElement;
    }

    return parts.filter(Boolean).join(' ').toLowerCase();
  }

  function autofillPortalForm() {
    let filledCount = 0;
    const inputs = Array.from(document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="checkbox"]):not([type="radio"]), textarea, select'));

    inputs.forEach(input => {
      const combinedText = getFieldDescriptor(input);

      for (const rule of fieldRules) {
        if (rule.patterns.some(pattern => pattern.test(combinedText))) {
          const val = rule.value();
          if (val && fillInput(input, val)) {
            filledCount++;
            break;
          }
        }
      }
    });

    showAutofillToast(filledCount);
  }

  function showAutofillToast(count) {
    let toast = document.getElementById('aeroapply-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'aeroapply-toast';
      toast.style.cssText = `
        position: fixed;
        bottom: 85px;
        right: 25px;
        background: #0f172a;
        color: #ffffff;
        padding: 12px 18px;
        border-radius: 8px;
        border: 1px solid #10b981;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 13px;
        font-weight: 500;
        z-index: 9999999;
        box-shadow: 0 10px 25px rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        gap: 8px;
      `;
      document.body.appendChild(toast);
    }
    toast.innerHTML = count > 0 
      ? `✅ <strong>AeroApply:</strong> Filled ${count} fields automatically!`
      : `⚠️ <strong>AeroApply:</strong> No standard fields recognized on this page.`;

    setTimeout(() => {
      if (toast && toast.parentNode) toast.parentNode.removeChild(toast);
    }, 4000);
  }

  // Inject floating assistant badge
  function injectFloatingAssistant() {
    if (document.getElementById('aeroapply-floating-badge')) return;

    const btn = document.createElement('div');
    btn.id = 'aeroapply-floating-badge';
    btn.innerHTML = `⚡ Autofill with AeroApply`;
    btn.title = "Click to 1-Click Autofill this job application portal";
    btn.style.cssText = `
      position: fixed;
      bottom: 25px;
      right: 25px;
      background: linear-gradient(135deg, #059669 0%, #0284c7 100%);
      color: #ffffff;
      padding: 10px 16px;
      border-radius: 30px;
      cursor: pointer;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 12.5px;
      font-weight: 600;
      letter-spacing: 0.3px;
      z-index: 9999998;
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.35);
      display: flex;
      align-items: center;
      gap: 6px;
      transition: transform 0.2s, box-shadow 0.2s;
    `;

    btn.addEventListener('mouseenter', () => {
      btn.style.transform = 'translateY(-2px) scale(1.03)';
      btn.style.boxShadow = '0 6px 22px rgba(16, 185, 129, 0.5)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'none';
      btn.style.boxShadow = '0 4px 18px rgba(0, 0, 0, 0.35)';
    });

    btn.addEventListener('click', autofillPortalForm);
    document.body.appendChild(btn);
  }

  // Listen for message from extension popup
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
      if (req.action === 'AUTOFILL') {
        if (req.profile) candidateData = Object.assign(candidateData, req.profile);
        autofillPortalForm();
        sendResponse({ success: true });
      }
    });
  }

  // Only inject button if form inputs exist
  if (document.querySelectorAll('input, textarea').length > 2) {
    injectFloatingAssistant();
  }
})();
