/**
 * STARK PARTICLES & THRUSTER SIMULATOR
 * HTML5 Canvas particle physics for suit thrusters, energy sparks, and atmospheric smoke
 */

class ParticleEngine {
  constructor() {
    this.bgCanvas = document.getElementById('bg-particles');
    this.bgCtx = this.bgCanvas ? this.bgCanvas.getContext('2d') : null;
    
    this.thrusterCanvas = document.getElementById('thruster-particles');
    this.thrusterCtx = this.thrusterCanvas ? this.thrusterCanvas.getContext('2d') : null;

    this.particles = [];
    this.thrusterParticles = [];
    this.shockwaves = [];
    this.sparks = [];

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.mouse = { x: this.width / 2, y: this.height / 2, targetX: this.width / 2, targetY: this.height / 2 };
    this.suitActive = false;
    this.overcharged = false;

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => {
      this.mouse.targetX = e.clientX;
      this.mouse.targetY = e.clientY;
    });

    // Spawn initial ambient particles
    const count = Math.min(80, Math.floor(this.width / 20));
    for (let i = 0; i < count; i++) {
      this.particles.push(this.createAmbientParticle());
    }

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    if (this.bgCanvas) {
      this.bgCanvas.width = this.width;
      this.bgCanvas.height = this.height;
    }

    if (this.thrusterCanvas) {
      const container = this.thrusterCanvas.parentElement;
      if (container) {
        this.thrusterCanvas.width = container.clientWidth || 600;
        this.thrusterCanvas.height = container.clientHeight || 800;
      } else {
        this.thrusterCanvas.width = this.width;
        this.thrusterCanvas.height = this.height;
      }
    }
  }

  createAmbientParticle() {
    return {
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      size: Math.random() * 2.2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: -Math.random() * 0.8 - 0.2,
      opacity: Math.random() * 0.7 + 0.2,
      hue: Math.random() > 0.6 ? 195 : (Math.random() > 0.8 ? 45 : 210), // Arc cyan, gold, or deep blue
      pulseSpeed: Math.random() * 0.03 + 0.01,
      angle: Math.random() * Math.PI * 2
    };
  }

  // Create shockwave ring from specific coordinate
  triggerShockwave(x, y, color = '#00f0ff', maxRadius = 300) {
    this.shockwaves.push({
      x,
      y,
      radius: 10,
      maxRadius,
      opacity: 0.9,
      color,
      lineWidth: 5
    });

    // Also burst sparks
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 3;
      this.sparks.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        decay: Math.random() * 0.03 + 0.015,
        color: Math.random() > 0.4 ? '#00f0ff' : '#ffd700',
        size: Math.random() * 3 + 1
      });
    }
  }

  // Spawn thruster jet exhaust flame particles
  emitThrusterFlames(x, y, intensity = 1.0, direction = 1) {
    const rate = this.overcharged ? 10 : 5;
    for (let i = 0; i < rate; i++) {
      const spread = (Math.random() - 0.5) * 18;
      const speed = (Math.random() * 6 + 5) * intensity;
      const angle = (Math.PI / 2) + ((Math.random() - 0.5) * 0.35); // downward with slight spread
      
      this.thrusterParticles.push({
        x: x + spread,
        y: y,
        vx: Math.cos(angle) * speed * 0.3 + (Math.random() - 0.5) * 1.5,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 7 + 4,
        maxSize: Math.random() * 20 + 12,
        life: 1.0,
        decay: Math.random() * 0.04 + 0.02,
        // Color transition: white core -> cyan plasma -> amber flame -> smoke grey
        type: Math.random() > 0.3 ? 'plasma' : 'ember'
      });
    }
  }

  setSuitState(active, overcharged = false) {
    this.suitActive = active;
    this.overcharged = overcharged;
  }

  animate() {
    // Smooth mouse lerp
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.08;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.08;

    // 1. Draw Background Particles Canvas
    if (this.bgCtx) {
      this.bgCtx.clearRect(0, 0, this.width, this.height);

      // Render subtle grid background scanline
      this.particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.angle += p.pulseSpeed;

        if (p.y < -10) p.y = this.height + 10;
        if (p.x < -10) p.x = this.width + 10;
        if (p.x > this.width + 10) p.x = -10;

        const currentOpacity = p.opacity * (0.6 + 0.4 * Math.sin(p.angle));
        this.bgCtx.beginPath();
        this.bgCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.bgCtx.fillStyle = `hsla(${p.hue}, 100%, 75%, ${currentOpacity})`;
        this.bgCtx.shadowBlur = p.size > 1.5 ? 8 : 0;
        this.bgCtx.shadowColor = `hsl(${p.hue}, 100%, 70%)`;
        this.bgCtx.fill();
        this.bgCtx.shadowBlur = 0;
      });

      // Render Shockwaves
      for (let i = this.shockwaves.length - 1; i >= 0; i--) {
        const sw = this.shockwaves[i];
        sw.radius += (sw.maxRadius - sw.radius) * 0.12 + 2;
        sw.opacity *= 0.94;
        sw.lineWidth *= 0.96;

        this.bgCtx.save();
        this.bgCtx.beginPath();
        this.bgCtx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        this.bgCtx.strokeStyle = sw.color;
        this.bgCtx.lineWidth = Math.max(1, sw.lineWidth);
        this.bgCtx.globalAlpha = sw.opacity;
        this.bgCtx.shadowBlur = 20;
        this.bgCtx.shadowColor = sw.color;
        this.bgCtx.stroke();
        this.bgCtx.restore();

        if (sw.opacity < 0.02 || sw.radius >= sw.maxRadius) {
          this.shockwaves.splice(i, 1);
        }
      }

      // Render Sparks
      for (let i = this.sparks.length - 1; i >= 0; i--) {
        const sp = this.sparks[i];
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.vx *= 0.95;
        sp.vy *= 0.95;
        sp.life -= sp.decay;

        this.bgCtx.save();
        this.bgCtx.beginPath();
        this.bgCtx.arc(sp.x, sp.y, sp.size * sp.life, 0, Math.PI * 2);
        this.bgCtx.fillStyle = sp.color;
        this.bgCtx.globalAlpha = Math.max(0, sp.life);
        this.bgCtx.shadowBlur = 10;
        this.bgCtx.shadowColor = sp.color;
        this.bgCtx.fill();
        this.bgCtx.restore();

        if (sp.life <= 0) {
          this.sparks.splice(i, 1);
        }
      }
    }

    // 2. Draw Thruster Canvas for Hero Suit
    if (this.thrusterCtx && this.thrusterCanvas) {
      const tW = this.thrusterCanvas.width;
      const tH = this.thrusterCanvas.height;
      this.thrusterCtx.clearRect(0, 0, tW, tH);

      // If suit is active, emit thruster flames from boot positions
      if (this.suitActive) {
        // Boot positions dynamically scaled to container
        const leftBootX = tW * 0.42;
        const leftBootY = tH * 0.88;
        const rightBootX = tW * 0.58;
        const rightBootY = tH * 0.92;
        const handX = tW * 0.18;
        const handY = tH * 0.48;

        const thrusterIntensity = this.overcharged ? 1.8 : 1.0;
        this.emitThrusterFlames(leftBootX, leftBootY, thrusterIntensity);
        this.emitThrusterFlames(rightBootX, rightBootY, thrusterIntensity);

        // Repulsor hand glow bursts
        if (Math.random() > 0.4) {
          this.thrusterParticles.push({
            x: handX + (Math.random() - 0.5) * 12,
            y: handY + (Math.random() - 0.5) * 12,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            size: Math.random() * 8 + 3,
            maxSize: 18,
            life: 1.0,
            decay: 0.05,
            type: 'plasma'
          });
        }
      }

      // Render Thruster Particles
      for (let i = this.thrusterParticles.length - 1; i >= 0; i--) {
        const tp = this.thrusterParticles[i];
        tp.x += tp.vx;
        tp.y += tp.vy;
        tp.life -= tp.decay;
        const currentSize = tp.size + (tp.maxSize - tp.size) * (1 - tp.life);

        this.thrusterCtx.save();
        this.thrusterCtx.beginPath();
        this.thrusterCtx.arc(tp.x, tp.y, currentSize, 0, Math.PI * 2);

        let color = '';
        if (tp.type === 'plasma') {
          if (tp.life > 0.7) {
            color = `rgba(255, 255, 255, ${tp.life})`;
          } else if (tp.life > 0.3) {
            color = `rgba(0, 240, 255, ${tp.life * 0.8})`;
          } else {
            color = `rgba(0, 130, 255, ${tp.life * 0.5})`;
          }
        } else {
          // Ember flame
          if (tp.life > 0.6) {
            color = `rgba(255, 220, 80, ${tp.life})`;
          } else if (tp.life > 0.25) {
            color = `rgba(255, 90, 0, ${tp.life * 0.7})`;
          } else {
            color = `rgba(80, 20, 10, ${tp.life * 0.3})`;
          }
        }

        this.thrusterCtx.fillStyle = color;
        this.thrusterCtx.shadowBlur = 15;
        this.thrusterCtx.shadowColor = tp.type === 'plasma' ? '#00f0ff' : '#ff7700';
        this.thrusterCtx.fill();
        this.thrusterCtx.restore();

        if (tp.life <= 0) {
          this.thrusterParticles.splice(i, 1);
        }
      }
    }

    requestAnimationFrame(this.animate);
  }
}

// Particle Engine Instance
let starkParticles = null;
window.addEventListener('DOMContentLoaded', () => {
  starkParticles = new ParticleEngine();
});
