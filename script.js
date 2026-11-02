/**
 * Ubuntu Elimu — Refined On-Device Simulator & Client Engine
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
// 2. Air-Gapped Network Simulator Toggle
// ---------------------------------------------------------------------------
let isOfflineMode = true;

function initAirplaneModeToggle() {
  const toggleBtn = document.getElementById('airplane-toggle-btn');
  const statusText = document.getElementById('airplane-status-text');

  if (!toggleBtn) return;

  toggleBtn.addEventListener('click', () => {
    isOfflineMode = !isOfflineMode;
    if (isOfflineMode) {
      if (statusText) statusText.textContent = 'Network: 100% Offline (0 KB Sent)';
      toggleBtn.classList.remove('bg-zinc-750', 'text-zinc-400');
      toggleBtn.classList.add('bg-zinc-800', 'text-zinc-300');
    } else {
      if (statusText) statusText.textContent = 'Network: Online (Simulated)';
      toggleBtn.classList.remove('bg-zinc-800', 'text-zinc-300');
      toggleBtn.classList.add('bg-zinc-750', 'text-zinc-400');
    }
  });
}

// ---------------------------------------------------------------------------
// 3. Socratic Vector Retrieval Simulator
// ---------------------------------------------------------------------------
const curriculumDatabase = {
  biology: {
    title: 'Kenya CBC Form 2 Biology: Plant Physiology',
    sourceFile: 'KICD_Approved_Biology_F2_Ch3.pdf',
    presetQuestions: [
      'Why do guard cells close stomata during drought stress?',
      'Explain the role of chlorophyll in light-dependent reactions.',
      'How does light intensity limit the rate of photosynthesis?'
    ],
    passages: [
      {
        ref: 'Page 48, §3.2.1: Guard Cell Osmotic Mechanics',
        text: 'During moisture stress, abscisic acid (ABA) triggers an efflux of potassium ions (K+) from guard cells, causing water to leave by osmosis. Guard cells lose turgor and become flaccid, closing the stomatal pore to prevent transpirational water loss.'
      },
      {
        ref: 'Page 50, §3.2.4: Environmental Limiting Factors',
        text: 'Stomatal closure conserves internal moisture at the expense of carbon dioxide uptake, temporarily halting the dark stage of photosynthesis until hydration is restored.'
      }
    ],
    socraticSteps: [
      "Let's trace this through physiological first principles.",
      "When a plant faces dry soil and severe heat, its primary survival constraint is transpirational water loss.",
      "According to syllabus §3.2.1, the plant actively triggers an efflux of potassium ions (K+) from the guard cells. Because water follows ion concentration via osmosis, water flows out of the guard cells.",
      "As a result, the guard cells lose internal turgor pressure and become flaccid, collapsing against each other to seal the stomatal pore."
    ]
  },
  science: {
    title: 'Grade 8 Integrated Science: Pure Substances & Mixtures',
    sourceFile: 'CBC_JSS_Science_G8_Strand2.pdf',
    presetQuestions: [
      'How does fractional distillation separate miscible liquids?',
      'What is the structural difference between a mixture and a compound?',
      'Why is water designated as a universal solvent?'
    ],
    passages: [
      {
        ref: 'Page 34, §2.1.3: Fractional Distillation',
        text: 'Fractional distillation separates miscible liquids with close boiling points (less than 25°C difference). As vapours rise through the fractionating column, the liquid with the lower boiling point distils over first into the Liebig condenser.'
      }
    ],
    socraticSteps: [
      "Consider a solution containing ethanol (boiling point 78°C) and water (boiling point 100°C).",
      "When heated in a distillation flask, ethanol vaporizes at a lower temperature than water.",
      "The fractionating column repeatedly condenses and revaporizes the mixture, allowing pure ethanol vapor to ascend into the condenser while returning water liquid to the flask."
    ]
  },
  physics: {
    title: 'Form 4 Physics: Thin Lenses & Optical Instruments',
    sourceFile: 'KCSE_Physics_Optics_Unit4.pdf',
    presetQuestions: [
      'What image is formed when an object is positioned between F and 2F of a convex lens?',
      'State the thin lens formula and Cartesian sign convention.',
      'Explain the ray mechanics of a simple astronomical telescope.'
    ],
    passages: [
      {
        ref: 'Page 82, §4.3: Real and Inverted Images',
        text: 'When an object is positioned beyond F but within 2F of a biconvex lens, rays refract through the focal point to form a real, inverted, and magnified image beyond 2F on the opposite side.'
      }
    ],
    socraticSteps: [
      "Let's evaluate the primary ray trajectories according to the Cartesian convention.",
      "Ray 1 travels parallel to the principal axis and refracts directly through the principal focus (F). Ray 2 passes undeviated through the optical centre (C).",
      "Because the rays physically converge beyond 2F on the opposing side, the resulting image is real, inverted, and magnified."
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
      docBadge.textContent = data.sourceFile;
    }

    if (chipContainer) {
      chipContainer.innerHTML = '';
      data.presetQuestions.forEach((q, idx) => {
        const chip = document.createElement('button');
        chip.className = `px-3 py-1.5 rounded bg-zinc-900 border text-left text-[11px] font-mono transition-colors ${
          idx === 0 
            ? 'border-emerald-500/50 text-emerald-300 hover:border-emerald-400' 
            : 'border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
        }`;
        chip.textContent = q;
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

  loadSubject('biology');

  async function triggerSimulatedInference(question) {
    if (isStreaming) return;
    isStreaming = true;
    askBtn.disabled = true;
    askBtn.textContent = 'Executing...';

    if (terminalStream) {
      terminalStream.innerHTML = `
        <div class="p-3 rounded bg-zinc-900/90 border border-zinc-800 font-mono text-xs text-zinc-300 space-y-1">
          <div class="text-[10px] text-zinc-500 uppercase tracking-wider">Input Query:</div>
          <div>"${question}"</div>
        </div>
        <div class="p-4 rounded bg-zinc-900/40 border border-zinc-800 space-y-2">
          <div class="text-[10px] font-mono text-emerald-400 flex items-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>[sqlite-vec] Querying on-device embeddings...</span>
          </div>
          <div id="active-socratic-steps" class="space-y-2 text-xs text-zinc-200 font-sans leading-relaxed"></div>
        </div>
      `;
    }

    if (ramUsageFill) ramUsageFill.style.width = '24%';
    if (ramUsageText) ramUsageText.textContent = '715 MB / 3072 MB';
    if (latencyBadge) latencyBadge.textContent = 'Vector Search: 11ms';

    await sleep(300);

    const data = curriculumDatabase[currentSubjectKey];
    if (citationList && data) {
      citationList.innerHTML = '';
      data.passages.forEach(p => {
        const item = document.createElement('div');
        item.className = 'p-2.5 rounded bg-zinc-900/80 border border-zinc-800 text-[11px] font-mono';
        item.innerHTML = `
          <div class="font-bold text-emerald-400 text-[10px] mb-0.5">${p.ref}</div>
          <div class="text-zinc-400 leading-relaxed font-sans text-xs">${p.text}</div>
        `;
        citationList.appendChild(item);
      });
    }

    const stepsContainer = document.getElementById('active-socratic-steps');
    if (stepsContainer && data) {
      stepsContainer.innerHTML = '';
      for (let i = 0; i < data.socraticSteps.length; i++) {
        const stepP = document.createElement('p');
        stepP.className = 'border-l border-zinc-700 pl-3 py-0.5 text-zinc-300 text-xs';
        stepsContainer.appendChild(stepP);
        await streamTextTokenByToken(data.socraticSteps[i], stepP);
        await sleep(180);
      }
    }

    if (latencyBadge) latencyBadge.textContent = '100% Offline • 18.4 tok/s';
    askBtn.disabled = false;
    askBtn.textContent = 'Run';
    isStreaming = false;
  }
}

function streamTextTokenByToken(text, targetElement) {
  return new Promise((resolve) => {
    const tokens = text.split(' ');
    let currentIdx = 0;
    targetElement.innerHTML = '';

    const cursor = document.createElement('span');
    cursor.className = 'typing-bar';

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
    }, 38);
  });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ---------------------------------------------------------------------------
// 4. Pilot Application Form
// ---------------------------------------------------------------------------
function initPilotForm() {
  const form = document.getElementById('school-pilot-form');
  const toast = document.getElementById('pilot-toast');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const schoolName = document.getElementById('pilot-school-name')?.value || 'Your Institution';
    
    if (toast) {
      toast.classList.remove('hidden');
      toast.innerHTML = `
        <div class="p-4 rounded-lg bg-zinc-900 border border-emerald-500/40 text-xs text-zinc-300 font-mono space-y-1">
          <div class="text-emerald-400 font-bold">Pilot Application Logged</div>
          <div>Thank you. Our deployment coordinator will contact <strong>${schoolName}</strong> with APK checksums and curriculum indexing guides.</div>
        </div>
      `;

      setTimeout(() => {
        toast.classList.add('hidden');
      }, 8000);
    }

    form.reset();
  });
}

// ---------------------------------------------------------------------------
// 5. Smooth Scroll
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
