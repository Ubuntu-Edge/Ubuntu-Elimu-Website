/**
 * Ubuntu Elimu — Warm, Human-Centered Interactive Engine & Simulator
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initAirplaneModeToggle();
  initSimulator();
  initPilotForm();
  initSmoothScroll();
});

// ---------------------------------------------------------------------------
// 1. Mobile Menu Drawer
// ---------------------------------------------------------------------------
function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const closeBtn = document.getElementById('close-menu-btn');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  if (!menuBtn || !mobileDrawer) return;

  menuBtn.addEventListener('click', () => {
    mobileDrawer.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  });

  const closeDrawer = () => {
    mobileDrawer.classList.add('hidden');
    document.body.style.overflow = '';
  };

  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  mobileLinks.forEach(link => link.addEventListener('click', closeDrawer));
}

// ---------------------------------------------------------------------------
// 2. Global Airplane Mode Toggle
// ---------------------------------------------------------------------------
let isAirplaneMode = true;

function initAirplaneModeToggle() {
  const toggleBtn = document.getElementById('airplane-toggle-btn');
  const toggleStatusText = document.getElementById('airplane-status-text');

  if (!toggleBtn) return;

  toggleBtn.addEventListener('click', () => {
    isAirplaneMode = !isAirplaneMode;
    if (isAirplaneMode) {
      if (toggleStatusText) toggleStatusText.textContent = 'Airplane Mode: ON (100% Offline)';
      toggleBtn.classList.add('bg-white', 'text-ink');
      toggleBtn.classList.remove('bg-amber-100', 'text-amber-900');
    } else {
      if (toggleStatusText) toggleStatusText.textContent = 'Online Mode (Simulated)';
      toggleBtn.classList.add('bg-amber-100', 'text-amber-900');
      toggleBtn.classList.remove('bg-white', 'text-ink');
    }
  });
}

// ---------------------------------------------------------------------------
// 3. Interactive Offline Socratic Tutor Simulator
// ---------------------------------------------------------------------------
const curriculumDatabase = {
  biology: {
    title: 'Kenya CBC Form 2 Biology: Photosynthesis & Plant Physiology',
    grade: 'Form 2 / Grade 8 CBC',
    sourceFile: 'KICD_Approved_Biology_F2_Ch3.pdf',
    presetQuestions: [
      'Why do guard cells close stomata during drought?',
      'Explain the role of chlorophyll in the light stage.',
      'How does light intensity affect the rate of photosynthesis?'
    ],
    passages: [
      {
        ref: 'Page 48, §3.2.1: Guard Cell Turgidity',
        text: 'During moisture stress, abscisic acid (ABA) triggers an efflux of potassium ions (K+) from guard cells, causing water to leave by osmosis. Guard cells lose turgor and become flaccid, closing the stomatal pore to prevent transpirational water loss.'
      },
      {
        ref: 'Page 50, §3.2.4: Environmental Limiting Factors',
        text: 'Stomatal closure conserves moisture at the expense of carbon dioxide uptake, temporarily halting the dark stage of photosynthesis until hydration is restored.'
      }
    ],
    socraticSteps: [
      "Jambo! Let's explore this step by step together.",
      "When a plant stands under the hot coastal sun in Lamu with dry soil, what is its greatest survival risk? Escaping water through evaporation (transpiration).",
      "According to your KICD textbook (§3.2.1), the plant actively pumps potassium ions (K+) out of its guard cells. Because water follows ions by osmosis, does the water enter or leave the guard cells?",
      "Exactly! Water leaves, making the guard cells lose turgor pressure and become flaccid. When they collapse against each other, the stomatal pore seals tight, conserving every drop of water for the plant."
    ]
  },
  science: {
    title: 'Grade 8 Integrated Science: Pure Substances & Mixtures',
    grade: 'Junior Secondary (CBC)',
    sourceFile: 'CBC_JSS_Science_G8_Strand2.pdf',
    presetQuestions: [
      'How does fractional distillation separate miscible liquids?',
      'What is the difference between a mixture and a compound?',
      'Why is water called a universal solvent?'
    ],
    passages: [
      {
        ref: 'Page 34, §2.1.3: Fractional Distillation',
        text: 'Fractional distillation separates miscible liquids with close boiling points (less than 25°C difference). As vapours rise through the fractionating column, the liquid with the lower boiling point distils over first into the Liebig condenser.'
      }
    ],
    socraticSteps: [
      "Think about boiling ethanol and water together. Ethanol boils at 78°C, while water boils at 100°C.",
      "If you heat both gently in a distillation flask, which liquid begins turning to vapor first?",
      "The fractionating column allows the vapor with the lower boiling point (ethanol) to pass into the condenser first, while water condenses and drips back down until all ethanol is collected."
    ]
  },
  physics: {
    title: 'Form 4 Physics: Thin Lenses & Optical Instruments',
    grade: 'Senior Secondary / KCSE',
    sourceFile: 'KCSE_Physics_Optics_Unit4.pdf',
    presetQuestions: [
      'What image is formed when an object is between F and 2F of a convex lens?',
      'State the lens formula and sign convention.',
      'How does a magnifying glass work?'
    ],
    passages: [
      {
        ref: 'Page 82, §4.3: Real and Inverted Images',
        text: 'When an object is positioned beyond F but within 2F of a biconvex lens, rays refract through the focal point to form a real, inverted, and magnified image beyond 2F on the opposite side.'
      }
    ],
    socraticSteps: [
      "Let's trace the rays step by step as done in your KCSE practicals.",
      "Ray 1 travels parallel to the principal axis and bends right through the focal point (F). Ray 2 passes straight through the optical center (C) without bending.",
      "Notice where the rays physically intersect on the other side of the lens: it is beyond 2F. Because real light rays intersect, the image is real, inverted (upside down), and magnified!"
    ]
  }
};

let currentSubjectKey = 'biology';
let isStreaming = false;

function initSimulator() {
  const subjectSelect = document.getElementById('sim-subject-select');
  const chipContainer = document.getElementById('sim-question-chips');
  const customInput = document.getElementById('sim-custom-input');
  const askBtn = document.getElementById('sim-ask-btn');
  const terminalStream = document.getElementById('sim-stream-output');
  const citationList = document.getElementById('sim-citations');
  const docBadge = document.getElementById('sim-doc-badge');
  const ramUsageFill = document.getElementById('ram-usage-fill');
  const ramUsageText = document.getElementById('ram-usage-text');
  const latencyBadge = document.getElementById('sim-latency-badge');

  if (!subjectSelect || !askBtn) return;

  function loadSubject(subjectKey) {
    currentSubjectKey = subjectKey;
    const data = curriculumDatabase[subjectKey];
    if (!data) return;

    if (docBadge) {
      docBadge.innerHTML = `<span>📄</span> ${data.grade} • ${data.sourceFile}`;
    }

    // Populate question chips with friendly styling
    if (chipContainer) {
      chipContainer.innerHTML = '';
      data.presetQuestions.forEach((q, idx) => {
        const chip = document.createElement('button');
        chip.className = `px-3.5 py-2 rounded-xl text-xs font-bold text-left transition-all ${
          idx === 0 
            ? 'bg-amber-100 text-terracotta-700 border-2 border-amber-300 hover:bg-amber-200' 
            : 'bg-slate-50 text-slate-700 border border-slate-200 hover:border-amber-300 hover:bg-amber-50'
        }`;
        chip.innerHTML = `<span>💬</span> "${q}"`;
        chip.addEventListener('click', () => {
          if (customInput) customInput.value = q;
          triggerSimulatedInference(q);
        });
        chipContainer.appendChild(chip);
      });
    }

    if (customInput) {
      customInput.value = data.presetQuestions[0];
    }
  }

  subjectSelect.addEventListener('change', (e) => {
    loadSubject(e.target.value);
  });

  askBtn.addEventListener('click', () => {
    const query = customInput ? customInput.value.trim() : '';
    if (query) {
      triggerSimulatedInference(query);
    }
  });

  if (customInput) {
    customInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        askBtn.click();
      }
    });
  }

  // Initial load
  loadSubject('biology');

  async function triggerSimulatedInference(question) {
    if (isStreaming) return;
    isStreaming = true;
    askBtn.disabled = true;
    askBtn.innerHTML = `<span>⚙️</span> Searching...`;

    // Step 1: Show User Question Bubble in Chat Window
    if (terminalStream) {
      terminalStream.innerHTML = `
        <div class="flex items-start gap-2.5 justify-end">
          <div class="bubble-user p-4 rounded-2xl max-w-[85%] text-slate-800 shadow-sm border border-amber-200">
            <p class="font-bold text-terracotta-700 text-xs mb-0.5">Student Question:</p>
            <p class="font-semibold text-sm">"${question}"</p>
          </div>
          <div class="w-8 h-8 rounded-full bg-amber-200 flex-shrink-0 flex items-center justify-center text-sm shadow-sm">
            👧🏾
          </div>
        </div>
        <div id="tutor-streaming-card" class="flex items-start gap-2.5">
          <div class="w-8 h-8 rounded-full bg-leaf-100 border border-leaf-300 flex-shrink-0 flex items-center justify-center text-sm shadow-sm">
            🌿
          </div>
          <div class="bubble-tutor p-4 rounded-2xl max-w-[90%] text-slate-800 shadow-sm border border-leaf-200 space-y-3">
            <div class="flex items-center gap-1.5 text-xs font-bold text-leaf-700">
              <span class="w-2 h-2 rounded-full bg-leaf-500 animate-ping"></span>
              <span>Scanning local textbook with sqlite-vec (100% offline)...</span>
            </div>
            <div id="active-socratic-steps" class="space-y-2 text-sm"></div>
          </div>
        </div>
      `;
    }

    if (ramUsageFill) ramUsageFill.style.width = '24%';
    if (ramUsageText) ramUsageText.textContent = '715 MB / 3072 MB RAM (Safe)';
    if (latencyBadge) latencyBadge.textContent = 'Local Vector Match: 11ms';

    await sleep(350);

    // Step 2: Show Verified Passages in Citations
    const data = curriculumDatabase[currentSubjectKey];
    if (citationList && data) {
      citationList.innerHTML = '';
      data.passages.forEach(p => {
        const item = document.createElement('div');
        item.className = 'p-3 rounded-xl bg-leaf-50/80 border border-leaf-200 text-xs shadow-sm';
        item.innerHTML = `
          <div class="font-bold text-leaf-800 flex items-center gap-1.5 mb-1">
            <span>📖</span> ${p.ref}
          </div>
          <div class="text-slate-700 leading-relaxed">${p.text}</div>
        `;
        citationList.appendChild(item);
      });
    }

    // Step 3: Stream Socratic Tutor response
    const stepsContainer = document.getElementById('active-socratic-steps');
    if (stepsContainer && data) {
      stepsContainer.innerHTML = '';
      for (let i = 0; i < data.socraticSteps.length; i++) {
        const stepP = document.createElement('p');
        stepP.className = 'leading-relaxed text-slate-800';
        stepsContainer.appendChild(stepP);
        await streamTextTokenByToken(data.socraticSteps[i], stepP);
        await sleep(200);
      }
    }

    if (latencyBadge) latencyBadge.textContent = '100% Offline • 18.4 tokens/sec';
    askBtn.disabled = false;
    askBtn.innerHTML = `<span>⚡</span> Ask`;
    isStreaming = false;
  }
}

function streamTextTokenByToken(text, targetElement) {
  return new Promise((resolve) => {
    const tokens = text.split(' ');
    let currentIdx = 0;
    targetElement.innerHTML = '';

    const cursor = document.createElement('span');
    cursor.className = 'typing-cursor';

    const interval = setInterval(() => {
      if (currentIdx < tokens.length) {
        targetElement.textContent += (currentIdx > 0 ? ' ' : '') + tokens[currentIdx];
        targetElement.appendChild(cursor);
        currentIdx++;
      } else {
        clearInterval(interval);
        cursor.remove();
        resolve();
      }
    }, 40);
  });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ---------------------------------------------------------------------------
// 4. Pilot Application Form Modal
// ---------------------------------------------------------------------------
function initPilotForm() {
  const form = document.getElementById('school-pilot-form');
  const toast = document.getElementById('pilot-toast');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const schoolName = document.getElementById('pilot-school-name')?.value || 'Your School';
    
    if (toast) {
      toast.classList.remove('hidden');
      toast.innerHTML = `
        <div class="p-6 rounded-3xl bg-leaf-50 border-2 border-leaf-300 shadow-xl flex items-start gap-4 text-leaf-900">
          <span class="text-3xl">🎉</span>
          <div>
            <h4 class="font-black text-lg">Asante Sana! Pilot Request Received!</h4>
            <p class="text-sm text-slate-700 mt-1 leading-relaxed">
              We are delighted to partner with <strong>${schoolName}</strong>. Our Head of Operations & Partnerships (Salame Khamis) will contact you directly via WhatsApp/email to deliver your offline APK installer, CBC syllabus pack, and teacher guide.
            </p>
          </div>
        </div>
      `;

      setTimeout(() => {
        toast.classList.add('hidden');
      }, 9000);
    }

    form.reset();
  });
}

// ---------------------------------------------------------------------------
// 5. Smooth Scroll Navigation
// ---------------------------------------------------------------------------
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}
