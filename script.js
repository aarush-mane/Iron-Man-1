/**
 * STARK INDUSTRIES // MARK VII SUIT OS CONTROLLER
 * Full interactive suit lifecycle, HUD diagnostics, Armor showcase,
 * Arc reactor overcharge, 3D mouse parallax, and Asset Manager.
 */

document.addEventListener('DOMContentLoaded', () => {
  // ================= State Management =================
  const state = {
    suitOnline: false,
    scanning: false,
    overcharged: false,
    activeComponentIndex: 0,
    flightMode: 'HOVER',
    audioMuted: false,
    metrics: {
      power: 98,
      armor: 94,
      energy: 87,
      flight: 92,
      weapons: 100,
      ai: 100
    }
  };

  // ================= DOM Elements =================
  const btnActivateSuit = document.getElementById('btn-activate-suit');
  const btnScanSuit = document.getElementById('btn-scan-suit');
  const heroSuitStatus = document.getElementById('hero-suit-status');
  const heroSuitStatusText = document.getElementById('hero-suit-status-text');
  const screenFlash = document.getElementById('screen-flash');
  const terminalLogs = document.getElementById('terminal-logs');
  const terminalClock = document.getElementById('terminal-clock');
  const heroStage = document.getElementById('hero-stage');
  const suit3DWrapper = document.getElementById('suit-3d-wrapper');
  const heroImgElement = document.getElementById('hero-img-element');
  const armorImgElement = document.getElementById('armor-img-element');
  const scannerLaser = document.getElementById('scanner-laser');

  // Scanner Markers
  const scanMarkers = [
    document.getElementById('scan-marker-helmet'),
    document.getElementById('scan-marker-reactor'),
    document.getElementById('scan-marker-repulsor'),
    document.getElementById('scan-marker-flight')
  ];

  // HUD widgets
  const valPower = document.getElementById('val-power');
  const fillPower = document.getElementById('fill-power');
  const valArmor = document.getElementById('val-armor');
  const fillArmor = document.getElementById('fill-armor');
  const valEnergy = document.getElementById('val-energy');
  const fillEnergy = document.getElementById('fill-energy');
  const valFlight = document.getElementById('val-flight');
  const fillFlight = document.getElementById('fill-flight');
  const valWeapons = document.getElementById('val-weapons');
  const fillWeapons = document.getElementById('fill-weapons');
  const valAi = document.getElementById('val-ai');
  const fillAi = document.getElementById('fill-ai');

  // Arc Reactor Elements
  const reactorInteractiveCore = document.getElementById('reactor-interactive-core');
  const btnOverchargeCore = document.getElementById('btn-overcharge-core');
  const btnStabilizeCore = document.getElementById('btn-stabilize-core');
  const statOutput = document.getElementById('stat-output');
  const statTemp = document.getElementById('stat-temp');
  const statFlux = document.getElementById('stat-flux');
  const statStatus = document.getElementById('stat-status');
  const barOutput = document.getElementById('bar-output');
  const barTemp = document.getElementById('bar-temp');
  const reactorHint = document.getElementById('reactor-hint');

  // Flight simulator elements
  const horizonPitch = document.getElementById('horizon-pitch');
  const metricSpeed = document.getElementById('metric-speed');
  const metricAlt = document.getElementById('metric-alt');
  const metricG = document.getElementById('metric-g');
  const flightModeBtns = document.querySelectorAll('.flight-mode-btn');

  // Audio Toggle
  const audioToggle = document.getElementById('audio-toggle');
  const audioLabel = document.getElementById('audio-label');

  // Asset Modal Elements
  const assetModal = document.getElementById('asset-modal');
  const openAssetModal = document.getElementById('open-asset-modal');
  const closeAssetModal = document.getElementById('close-asset-modal');
  const inputHeroFile = document.getElementById('input-hero-file');
  const inputArmorFile = document.getElementById('input-armor-file');
  const btnResetAssets = document.getElementById('btn-reset-assets');
  const btnSaveAssets = document.getElementById('btn-save-assets');

  // Mobile menu
  const mobileToggle = document.getElementById('mobile-toggle');
  const navLinksMenu = document.getElementById('nav-links-menu');

  // ================= Terminal Clock =================
  function updateClock() {
    const now = new Date();
    if (terminalClock) {
      terminalClock.textContent = now.toTimeString().split(' ')[0] + ' UTC';
    }
  }
  setInterval(updateClock, 1000);
  updateClock();

  // Log message helper
  function addLog(msg, isHighlight = false) {
    if (!terminalLogs) return;
    const entry = document.createElement('div');
    entry.className = `log-entry ${isHighlight ? 'highlight' : ''}`;
    entry.textContent = msg;
    terminalLogs.appendChild(entry);
    terminalLogs.scrollTop = terminalLogs.scrollHeight;
    if (terminalLogs.children.length > 7) {
      terminalLogs.removeChild(terminalLogs.firstChild);
    }
  }

  // ================= Number Counter Animation =================
  function animateCounter(el, target, duration = 1200, suffix = '%') {
    let start = 0;
    const startTime = performance.now();
    function step(timestamp) {
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease out cubic
      const current = Math.floor(start + (target - start) * (1 - Math.pow(1 - progress, 3)));
      el.textContent = current + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target + suffix;
      }
    }
    requestAnimationFrame(step);
  }

  // ================= 1. SUIT ACTIVATION SEQUENCE =================
  function activateSuit() {
    if (state.suitOnline) {
      starkAudio.playHudBeep(900, 0.1);
      addLog('[SYS] Suit is already ONLINE and at peak efficiency.');
      return;
    }

    state.suitOnline = true;

    // 1. Play Sound Engine sequence
    starkAudio.playBootSequence();

    // 2. Brief Screen Blue Flash
    screenFlash.classList.add('active');
    setTimeout(() => {
      screenFlash.classList.remove('active');
    }, 280);

    // 3. Update Status Pill
    heroSuitStatus.classList.remove('status-offline');
    heroSuitStatus.classList.add('status-online');
    heroSuitStatusText.textContent = 'GEN 07 • ONLINE';

    // 4. Update Button Appearance
    btnActivateSuit.innerHTML = '<span>✔ SUIT ENGAGED</span>';
    btnActivateSuit.style.background = 'linear-gradient(135deg, #0088ff 0%, #00f0ff 100%)';
    btnActivateSuit.style.boxShadow = '0 0 35px var(--arc-cyan)';

    // 5. Hero Stage Suit Glow & Thrusters
    document.body.classList.add('suit-active');
    if (window.starkParticles) {
      window.starkParticles.setSuitState(true, false);
      const rect = suit3DWrapper.getBoundingClientRect();
      window.starkParticles.triggerShockwave(rect.left + rect.width / 2, rect.top + rect.height * 0.3, '#00f0ff', 400);
    }

    // 6. Animate HUD Values
    animateCounter(valPower, state.metrics.power, 1400);
    fillPower.style.width = state.metrics.power + '%';

    animateCounter(valArmor, state.metrics.armor, 1600);
    fillArmor.style.width = state.metrics.armor + '%';

    animateCounter(valEnergy, state.metrics.energy, 1200);
    fillEnergy.style.width = state.metrics.energy + '%';

    animateCounter(valFlight, state.metrics.flight, 1500);
    fillFlight.style.width = state.metrics.flight + '%';

    setTimeout(() => {
      valWeapons.textContent = 'READY • 100%';
      valWeapons.style.color = 'var(--arc-cyan)';
      fillWeapons.style.width = '100%';
    }, 600);

    setTimeout(() => {
      valAi.textContent = 'J.A.R.V.I.S. ONLINE';
      valAi.style.color = '#fff';
      fillAi.style.width = '100%';
    }, 900);

    // 7. Streaming Boot Telemetry
    addLog('[BOOT] Initializing firmware Mark VII rev 7.42...', true);
    setTimeout(() => addLog('[PWR] Arc Reactor micro-fusion ignition 100% stable.'), 300);
    setTimeout(() => addLog('[HUD] Neural synaptic bridge established with pilot.'), 600);
    setTimeout(() => addLog('[ARMOR] Nanotech molecular integrity verified at 94%.'), 900);
    setTimeout(() => addLog('[J.A.R.V.I.S.] "At your service, sir. All systems nominal."', true), 1200);
  }

  btnActivateSuit.addEventListener('click', activateSuit);

  // ================= 2. SUIT SCANNER SEQUENCE =================
  function scanSuit() {
    if (state.scanning) return;
    state.scanning = true;

    starkAudio.playScanSweep();
    scannerLaser.classList.add('scanning');
    btnScanSuit.innerHTML = '<span>⚡ SCANNING...</span>';

    addLog('[SCAN] Initiating multi-spectrum diagnostic sweep...', true);

    // Sequential targeting markers
    setTimeout(() => {
      scanMarkers[0].classList.add('active');
      starkAudio.playHudBeep(1400, 0.06);
      addLog('[SCAN] Target 1: Helmet neural optics verified.');
    }, 600);

    setTimeout(() => {
      scanMarkers[1].classList.add('active');
      starkAudio.playHudBeep(1600, 0.06);
      addLog('[SCAN] Target 2: Arc core fusion output 3.2 GW.');
    }, 1200);

    setTimeout(() => {
      scanMarkers[2].classList.add('active');
      starkAudio.playHudBeep(1800, 0.06);
      addLog('[SCAN] Target 3: Gauntlet repulsors charged.');
    }, 1800);

    setTimeout(() => {
      scanMarkers[3].classList.add('active');
      starkAudio.playHudBeep(2100, 0.06);
      addLog('[SCAN] Target 4: Supersonic flight thrusters ready.');
    }, 2400);

    // Complete Scan
    setTimeout(() => {
      scannerLaser.classList.remove('scanning');
      scanMarkers.forEach(m => m.classList.remove('active'));
      state.scanning = false;
      btnScanSuit.innerHTML = '<span>✔ SCAN COMPLETE</span>';
      starkAudio.playTargetLock();

      addLog('✔ SUIT ANALYSIS COMPLETE - ALL SYSTEMS READY', true);

      // Auto-activate suit if offline
      if (!state.suitOnline) {
        activateSuit();
      }

      setTimeout(() => {
        btnScanSuit.innerHTML = '<span>🔍 SCAN SUIT</span>';
      }, 4000);
    }, 3200);
  }

  btnScanSuit.addEventListener('click', scanSuit);

  // ================= 3. ARMOR SHOWCASE COMPONENT INTERACTION =================
  const armorComponents = [
    {
      id: 'helmet',
      badge: 'SUBSYSTEM // MK-01',
      title: 'TACTICAL HELMET',
      subtitle: 'Neural Interface & Retina Holographic HUD',
      desc: 'Constructed from forged 99.4% Titanium-Gold alloy with polarized bulletproof gold visor. Houses the holographic tactical reticle, 360-degree threat perception matrix, and high-bandwidth neural link directly into Tony Stark\'s synaptics.',
      mat: 'Titanium-Gold Alloy',
      pwr: '420 kW',
      stat: '100% NOMINAL',
      cap: 'Target Lock / 120km'
    },
    {
      id: 'reactor',
      badge: 'POWER CORE // MK-02',
      title: 'ARC REACTOR',
      subtitle: 'Primary energy source',
      desc: 'Clean zero-point fusion core generating continuous non-polluting energy. Houses the synthesized new element core in an electromagnetically pressurized vibranium containment ring.',
      mat: 'Palladium / Synthesized RT-03',
      pwr: '3.2 GW Continuous',
      stat: '99.8% STABLE',
      cap: 'Infinite Autonomy'
    },
    {
      id: 'repulsor',
      badge: 'ORDNANCE // MK-03',
      title: 'GAUNTLET REPULSORS',
      subtitle: 'Directed Energy Projector & Flight Stabilizer',
      desc: 'High-density muon particle accelerators mounted in both gauntlet palms. Dual function: primary supersonic flight steering verniers and variable-yield kinetic concussion energy blasters.',
      mat: 'Superconducting Copper Array',
      pwr: '1.2 GW Surge',
      stat: 'PRIMED & ARMED',
      cap: 'Variable Yield Blast'
    },
    {
      id: 'shoulder',
      badge: 'WEAPONS // MK-04',
      title: 'SHOULDER ARMOR PODS',
      subtitle: 'Micro-Missile Tactical Launchers',
      desc: 'Retractable shoulder pods carrying 12 miniaturized armor-piercing kinetic micro-missiles. Guided by J.A.R.V.I.S. simultaneous multi-target lock algorithms with zero collateral splash.',
      mat: 'Chobham Composite Plating',
      pwr: '150 kW Auxiliary',
      stat: '12 / 12 READY',
      cap: 'Simultaneous Multi-Target'
    },
    {
      id: 'chest',
      badge: 'DEFENSE // MK-05',
      title: 'CHEST DEFLECTION PLATE',
      subtitle: 'Vibranium-Reinforced Kinetic Damping Plating',
      desc: 'Multi-layered impact dissipation armor shielding the pilot and central reactor. Reactive energy absorption converts hostile kinetic ballistic impacts into auxiliary battery replenishment.',
      mat: 'Vibranium-Titanium Matrix',
      pwr: 'Passive Damping',
      stat: 'INTEGRITY: 94%',
      cap: 'Mach 5 Ballistic Proof'
    },
    {
      id: 'flight',
      badge: 'PROPULSION // MK-06',
      title: 'SUPERSONIC FLIGHT ARRAY',
      subtitle: 'Twin Vectored Boot Thrusters & Variable Flaps',
      desc: 'Back-mounted aerodynamic stabilizer aerospikes and twin boot micro-thrusters generate Mach 3.5+ velocity with atmospheric ceiling beyond 85,000 feet. Features dynamic thermal de-icing.',
      mat: 'Heat-Resistant Ceramic Alloy',
      pwr: '2.8 GW Full Afterburner',
      stat: 'THRUST: 120,000 LBF',
      cap: 'Mach 3.5 Velocity'
    }
  ];

  const compBadge = document.getElementById('comp-badge');
  const compTitle = document.getElementById('comp-title');
  const compSubtitle = document.getElementById('comp-subtitle');
  const compDesc = document.getElementById('comp-desc');
  const specMat = document.getElementById('spec-mat');
  const specPwr = document.getElementById('spec-pwr');
  const specStat = document.getElementById('spec-stat');
  const specCap = document.getElementById('spec-cap');
  const btnTestSubsystem = document.getElementById('btn-test-subsystem');
  const btnCycleComponent = document.getElementById('btn-cycle-component');
  const hotspots = document.querySelectorAll('.armor-hotspot');

  function renderComponent(comp) {
    if (!comp) return;
    starkAudio.playTargetLock();

    // Smooth fade effect
    const card = document.getElementById('component-card');
    card.style.opacity = '0.5';
    card.style.transform = 'translateY(6px)';

    setTimeout(() => {
      compBadge.textContent = comp.badge;
      compTitle.textContent = comp.title;
      compSubtitle.textContent = comp.subtitle;
      compDesc.textContent = comp.desc;
      specMat.textContent = comp.mat;
      specPwr.textContent = comp.pwr;
      specStat.textContent = comp.stat;
      specCap.textContent = comp.cap;

      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, 150);

    // Update active hotspot
    hotspots.forEach(h => {
      if (h.dataset.component === comp.id) {
        h.classList.add('active');
      } else {
        h.classList.remove('active');
      }
    });

    addLog(`[ARMOR] Subsystem selected: ${comp.title}`);
  }

  hotspots.forEach(spot => {
    spot.addEventListener('click', () => {
      const id = spot.dataset.component;
      const foundIdx = armorComponents.findIndex(c => c.id === id);
      if (foundIdx !== -1) {
        state.activeComponentIndex = foundIdx;
        renderComponent(armorComponents[foundIdx]);
      }
    });
  });

  btnCycleComponent.addEventListener('click', () => {
    state.activeComponentIndex = (state.activeComponentIndex + 1) % armorComponents.length;
    renderComponent(armorComponents[state.activeComponentIndex]);
  });

  btnTestSubsystem.addEventListener('click', () => {
    const curComp = armorComponents[state.activeComponentIndex];
    starkAudio.playRepulsorBlast();
    btnTestSubsystem.innerHTML = '<span>⚡ FIRING TEST...</span>';

    addLog(`[DIAG] Subsystem ${curComp.title} test fired: 100% DISCHARGE EFFICIENCY.`, true);

    setTimeout(() => {
      btnTestSubsystem.innerHTML = '<span>TEST SUBSYSTEM</span>';
    }, 1200);
  });

  // ================= 4. ARC REACTOR CORE INTERACTION =================
  function pulseArcReactor() {
    starkAudio.playArcPulse();

    // Trigger visual shockwave from reactor center
    const rect = reactorInteractiveCore.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    if (window.starkParticles) {
      window.starkParticles.triggerShockwave(cx, cy, '#00f0ff', 550);
      window.starkParticles.triggerShockwave(cx, cy, '#ffd700', 350);
    }

    // Expand reactor temporarily
    reactorInteractiveCore.classList.add('overcharging');

    // Surging power stats
    state.overcharged = true;
    statOutput.textContent = '4.8 GW (OVERCHARGED)';
    statOutput.style.color = 'var(--arc-cyan)';
    barOutput.style.width = '100%';

    statTemp.textContent = '4,180 K';
    statTemp.style.color = 'var(--stark-red-bright)';
    barTemp.style.width = '88%';

    statStatus.textContent = 'CORE SURGE ACTIVE';
    statStatus.style.color = 'var(--stark-gold-bright)';

    reactorHint.textContent = '[ CORE IN HIGH-YIELD OVERCHARGE MODE ]';
    reactorHint.style.color = 'var(--stark-gold-bright)';

    // Update hero energy widget if present
    valEnergy.textContent = '120%';
    valEnergy.style.color = 'var(--stark-gold-bright)';
    fillEnergy.style.width = '100%';

    addLog('[ARC] Resonance surge triggered! Power output boosted to 4.8 GW.', true);

    if (window.starkParticles) {
      window.starkParticles.setSuitState(state.suitOnline, true);
    }
  }

  reactorInteractiveCore.addEventListener('click', pulseArcReactor);
  btnOverchargeCore.addEventListener('click', pulseArcReactor);

  btnStabilizeCore.addEventListener('click', () => {
    starkAudio.playHudBeep(800, 0.2);
    state.overcharged = false;
    reactorInteractiveCore.classList.remove('overcharging');

    statOutput.textContent = '3.2 GW';
    statOutput.style.color = '#fff';
    barOutput.style.width = '70%';

    statTemp.textContent = '3,420 K';
    statTemp.style.color = '#fff';
    barTemp.style.width = '48%';

    statStatus.textContent = 'STABLE';
    statStatus.style.color = 'var(--arc-cyan)';

    reactorHint.textContent = '[ CLICK CORE TO PULSE & OVERCHARGE ]';
    reactorHint.style.color = 'var(--arc-cyan)';

    valEnergy.textContent = state.metrics.energy + '%';
    valEnergy.style.color = '#fff';
    fillEnergy.style.width = state.metrics.energy + '%';

    if (window.starkParticles) {
      window.starkParticles.setSuitState(state.suitOnline, false);
    }

    addLog('[ARC] Core resonance stabilized to baseline 3.2 GW.');
  });

  // ================= 5. MOUSE PARALLAX & FLIGHT GYROSCOPE =================
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const deltaX = (mouseX - centerX) / centerX; // -1 to 1
    const deltaY = (mouseY - centerY) / centerY; // -1 to 1

    // 1. Subtle 3D tilt on Hero Iron Man
    if (suit3DWrapper) {
      const tiltX = -deltaY * 9; // up/down tilt
      const tiltY = deltaX * 14; // left/right yaw
      const transX = deltaX * 18;
      suit3DWrapper.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateX(${transX}px)`;
    }

    // 2. Parallax on floating HUD widgets
    const widgets = document.querySelectorAll('.hud-widget');
    widgets.forEach(w => {
      const depth = parseFloat(w.dataset.depth || 0.2);
      const moveX = -deltaX * 35 * depth;
      const moveY = -deltaY * 35 * depth;
      w.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });

    // 3. Flight Artificial Horizon Gyroscope feedback
    if (horizonPitch) {
      const pitchDeg = deltaY * 18;
      const rollDeg = -deltaX * 24;
      horizonPitch.style.transform = `translateY(${pitchDeg}px) rotate(${rollDeg}deg)`;
    }
  });

  // Flight Mode Selector
  flightModeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      flightModeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const mode = btn.dataset.mode;
      state.flightMode = mode;
      starkAudio.playHudBeep(1200, 0.08);

      if (mode === 'HOVER') {
        metricSpeed.textContent = 'MACH 0.2';
        metricAlt.textContent = '450 FT';
        metricG.textContent = '1.0 G';
      } else if (mode === 'SUPERSONIC') {
        metricSpeed.textContent = 'MACH 3.2';
        metricAlt.textContent = '38,500 FT';
        metricG.textContent = '4.6 G';
      } else if (mode === 'STEALTH') {
        metricSpeed.textContent = 'MACH 0.8';
        metricAlt.textContent = '62,000 FT';
        metricG.textContent = '1.2 G';
      } else if (mode === 'COMBAT') {
        metricSpeed.textContent = 'MACH 2.4';
        metricAlt.textContent = '12,200 FT';
        metricG.textContent = '7.8 G';
      }

      addLog(`[FLIGHT] Navigation matrix switched to: ${mode} MODE.`);
    });
  });

  // ================= 6. AUDIO SFX TOGGLE =================
  audioToggle.addEventListener('click', () => {
    const isEnabled = starkAudio.toggleSound();
    state.audioMuted = !isEnabled;
    if (isEnabled) {
      audioLabel.textContent = 'SFX: ON';
      audioToggle.classList.remove('audio-muted');
    } else {
      audioLabel.textContent = 'SFX: OFF';
      audioToggle.classList.add('audio-muted');
    }
  });

  // ================= 7. ASSET MANAGER / FILE DROP =================
  openAssetModal.addEventListener('click', () => {
    assetModal.classList.add('open');
    starkAudio.playHudBeep(1000, 0.05);
  });

  closeAssetModal.addEventListener('click', () => {
    assetModal.classList.remove('open');
  });

  btnSaveAssets.addEventListener('click', () => {
    assetModal.classList.remove('open');
    starkAudio.playTargetLock();
    addLog('[ASSETS] Custom assets applied to suit viewport.');
  });

  // File Handlers for Drop Zones
  function handleImageUpload(file, targetImg, storageKey) {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      targetImg.src = e.target.result;
      try {
        localStorage.setItem(storageKey, e.target.result);
      } catch (err) {}
      starkAudio.playHudBeep(1500, 0.08);
      addLog(`[ASSET] New asset loaded for: ${targetImg.id}`);
    };
    reader.readAsDataURL(file);
  }

  inputHeroFile.addEventListener('change', (e) => {
    handleImageUpload(e.target.files[0], heroImgElement, 'stark_hero_asset');
  });

  inputArmorFile.addEventListener('change', (e) => {
    handleImageUpload(e.target.files[0], armorImgElement, 'stark_armor_asset');
  });

  // Drag and drop events
  const dropHero = document.getElementById('drop-hero');
  const dropArmor = document.getElementById('drop-armor');

  [dropHero, dropArmor].forEach(dropZone => {
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('dragover');
    });
    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('dragover');
    });
  });

  dropHero.addEventListener('drop', (e) => {
    e.preventDefault();
    dropHero.classList.remove('dragover');
    if (e.dataTransfer.files.length) {
      handleImageUpload(e.dataTransfer.files[0], heroImgElement, 'stark_hero_asset');
    }
  });

  dropArmor.addEventListener('drop', (e) => {
    e.preventDefault();
    dropArmor.classList.remove('dragover');
    if (e.dataTransfer.files.length) {
      handleImageUpload(e.dataTransfer.files[0], armorImgElement, 'stark_armor_asset');
    }
  });

  btnResetAssets.addEventListener('click', () => {
    localStorage.removeItem('stark_hero_asset');
    localStorage.removeItem('stark_armor_asset');
    heroImgElement.src = 'assets/hero-ironman.png';
    armorImgElement.src = 'assets/armor-ironman.jpg';
    starkAudio.playHudBeep(800, 0.1);
    addLog('[ASSET] Restored default Stark Industries assets.');
  });

  // Restore saved assets from localStorage if any
  try {
    const savedHero = localStorage.getItem('stark_hero_asset');
    const savedArmor = localStorage.getItem('stark_armor_asset');
    if (savedHero) heroImgElement.src = savedHero;
    if (savedArmor) armorImgElement.src = savedArmor;
  } catch (e) {}

  // ================= 8. NAVIGATION & SMOOTH SCROLL =================
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPos = window.pageYOffset + 200;
    sections.forEach(sec => {
      if (sec.offsetTop <= scrollPos) {
        current = sec.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  // Mobile menu toggle
  mobileToggle.addEventListener('click', () => {
    navLinksMenu.classList.toggle('mobile-open');
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navLinksMenu.classList.remove('mobile-open');
    });
  });

  // Play subtle hover sound on interactive elements
  const interactiveElements = document.querySelectorAll('.btn-stark, .hud-widget, .armor-hotspot, .flight-mode-btn');
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      starkAudio.playHudBeep(2200, 0.02, 'sine');
    });
  });
});
