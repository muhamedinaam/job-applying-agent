document.addEventListener('DOMContentLoaded', async () => {
  const profileSelect = document.getElementById('profileSelect');
  const btnAutofill = document.getElementById('btnAutofill');
  const toastMsg = document.getElementById('toastMsg');

  let profiles = null;

  try {
    const res = await fetch('http://localhost:3000/api/profiles');
    if (res.ok) {
      const data = await res.json();
      profiles = data.profiles;
      if (data.activeProfile) {
        profileSelect.value = data.activeProfile;
      }
    }
  } catch (err) {
    console.log('Local server offline, using fallback defaults.');
  }

  function getActiveProfile() {
    const key = profileSelect.value;
    if (profiles && profiles[key]) {
      return profiles[key];
    }
    // Fallback static profile
    return {
      name: "Muhammadhu Inaam",
      email: "mohamedinnam787@gmail.com",
      phone: "+94 77 089 6608",
      address: "Beruwala, Kalutara, Sri Lanka",
      linkedin: "https://www.linkedin.com/in/muhammadhu-inaam-698566272/",
      workAuthorization: key === 'germany' 
        ? "Eligible for German Opportunity Card (Chancenkarte) & EU Blue Card Fast-Track Recognition" 
        : "Citizen of Sri Lanka",
      summary: key === 'germany'
        ? "Mechatronics Engineer with 2+ years experience in PLC/HMI/SCADA, CNC systems, and power electronics. BEng (Hons) Mechatronics & Ceylon German Technical Training Institute certified."
        : "Mechatronics Engineer with 2+ years experience across automated manufacturing, PLC/SCADA lines, and embedded hardware integration."
    };
  }

  function showToast(msg) {
    toastMsg.textContent = msg;
    setTimeout(() => {
      toastMsg.textContent = '';
    }, 2500);
  }

  btnAutofill.addEventListener('click', () => {
    const p = getActiveProfile();
    const names = (p.name || '').split(' ');

    const payload = {
      action: 'AUTOFILL',
      profile: {
        firstName: names[0] || '',
        lastName: names.slice(1).join(' ') || '',
        fullName: p.name,
        email: p.email,
        phone: p.phone,
        address: p.address,
        city: (p.address || '').split(',')[0],
        linkedin: p.linkedin || 'https://www.linkedin.com/in/muhammadhu-inaam-698566272/',
        github: p.github || 'https://github.com/muhammadhu-inaam',
        portfolio: p.portfolio || 'https://www.linkedin.com/in/muhammadhu-inaam-698566272/',
        workAuth: p.workAuthorization,
        summary: p.summary
      }
    };

    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].id) {
          chrome.tabs.sendMessage(tabs[0].id, payload, (response) => {
            if (chrome.runtime.lastError) {
              showToast('⚠️ Please refresh the page once or click on the form.');
            } else {
              showToast('✅ Autofill executed on page!');
            }
          });
        }
      });
    } else {
      showToast('Autofill triggered.');
    }
  });

  // Quick Copy Listeners
  const copyMap = [
    { id: 'copyName', key: 'name' },
    { id: 'copyEmail', key: 'email' },
    { id: 'copyPhone', key: 'phone' },
    { id: 'copyLinkedIn', key: 'linkedin' },
    { id: 'copyVisa', key: 'workAuthorization' },
    { id: 'copySummary', key: 'summary' }
  ];

  copyMap.forEach(({ id, key }) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('click', () => {
        const p = getActiveProfile();
        const val = p[key] || '';
        navigator.clipboard.writeText(val);
        showToast(`Copied ${key}!`);
      });
    }
  });
});
