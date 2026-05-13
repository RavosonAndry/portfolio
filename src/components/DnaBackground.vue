<template>
  <canvas ref="canvasRef" class="fixed top-0 left-0 w-full h-full -z-10 bg-[#f2f2f2]"></canvas>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';

const props = defineProps({
  activeSection: { type: String, default: 'accueil' }
});

const canvasRef = ref<HTMLCanvasElement | null>(null);
let ctx: CanvasRenderingContext2D | null = null;
let animationFrameId: number;

const SECTIONS = ['accueil', 'competences', 'projets', 'contact'];
const TEAL = '#00a39b';
const ORANGE = '#e67e22';

let particles: any[] = [];
let time = 0;
let currentY = 0;
let targetY = 0;
let speed = 0.04;
let hasExploded = false;

// --- DÉTECTION MOBILE ---
const isMobile = ref(false);
const updateMobileStatus = () => {
  isMobile.value = window.innerWidth < 1024;
};

const initCanvas = () => {
  if (!canvasRef.value) return;
  updateMobileStatus();
  canvasRef.value.width = window.innerWidth;
  canvasRef.value.height = window.innerHeight;
  ctx = canvasRef.value.getContext('2d');
  targetY = window.innerHeight / 2;
  currentY = targetY;
  createParticles(props.activeSection);
};

// --- LOGIQUE DE DÉPLACEMENT PowerPoint ---
watch(() => props.activeSection, (newSection, oldSection) => {
  const newIndex = SECTIONS.indexOf(newSection);
  const oldIndex = SECTIONS.indexOf(oldSection || 'accueil');

  particles = [];
  hasExploded = false;
  if (ctx && canvasRef.value) ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);

  // Si je descends, ça vient du HAUT (-800). Si je monte, ça vient du BAS (+800)
  if (newIndex > oldIndex) currentY = -800; 
  else currentY = window.innerHeight + 800;

  speed = 0.07;
  setTimeout(() => {
    speed = 0.04;
    createParticles(newSection);
  }, 300);
});

const createParticles = (section: string) => {
  if (section === 'competences') {
    const radius = isMobile.value ? 160 : 380;
    for (let i = 0; i < 180; i++) {
      particles.push({ theta: Math.acos(Math.random() * 2 - 1), phi: Math.random() * Math.PI * 2, r: radius });
    }
  } 
  else if (section === 'projets') {
    const radius = isMobile.value ? 140 : 320;
    for (let i = 0; i < 120; i++) {
      particles.push({ 
        theta: Math.acos(Math.random() * 2 - 1), 
        phi: Math.random() * Math.PI * 2, 
        r: radius,
        color: Math.random() > 0.5 ? TEAL : ORANGE 
      });
    }
  }
};

const draw = () => {
  if (!ctx || !canvasRef.value) return;

  if (props.activeSection === 'accueil') {
    ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
  } else {
    ctx.fillStyle = 'rgba(242, 242, 242, 0.4)';
    ctx.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height);
  }

  currentY += (targetY - currentY) * speed;
  time += 0.015;
  const cx = canvasRef.value.width / 2;

  switch (props.activeSection) {
    case 'accueil': drawFullDna(cx, currentY); break;
    case 'competences': 
      // MOBILE: Taille réduite à 4 (vs 8 sur desktop)
      drawSphere(cx, currentY, isMobile.value ? 4 : 8, isMobile.value ? 15 : 30, false); 
      break;
    case 'projets': 
      // MOBILE: Taille réduite à 3 (vs 5 sur desktop)
      drawSphere(cx, currentY, isMobile.value ? 3 : 5, isMobile.value ? 20 : 45, true); 
      break;
    case 'contact': 
      // TIMING RETARDÉ : 100px au lieu de 250px (se déclenche plus tard dans la descente)
      if (!hasExploded && Math.abs(currentY - targetY) < 100) triggerExplosion(cx, currentY);
      drawExplosion();
      break;
  }

  animationFrameId = requestAnimationFrame(draw);
};

const drawFullDna = (x: number, y: number) => {
  const h = canvasRef.value!.height;
  const amplitude = isMobile.value ? 110 : 230;
  const dotSize = isMobile.value ? 5 : 6.5;

  for (let i = -h; i < h; i += 28) {
    const t = time + (i * 0.005);
    const wave = Math.sin(t) * amplitude;
    const dist = Math.abs(i);
    const alpha = Math.max(0, (1 - dist / (h * 0.8)) * 1); 

    if (alpha > 0) {
      ctx!.globalAlpha = alpha;
      ctx!.shadowBlur = isMobile.value ? 5 : 10;
      ctx!.fillStyle = TEAL; ctx!.shadowColor = TEAL;
      ctx!.beginPath(); ctx!.arc(x + wave, y + i, dotSize, 0, Math.PI * 2); ctx!.fill();
      ctx!.fillStyle = ORANGE; ctx!.shadowColor = ORANGE;
      ctx!.beginPath(); ctx!.arc(x - wave, y + i, dotSize, 0, Math.PI * 2); ctx!.fill();
    }
  }
  ctx!.globalAlpha = 1; ctx!.shadowBlur = 0;
};

const drawSphere = (x: number, y: number, dotSize: number, pulseAmp: number, isRandom: boolean) => {
  particles.forEach(p => {
    p.phi += 0.005;
    const pulse = Math.sin(time * 3 + p.theta * 4) * pulseAmp;
    const r = p.r + pulse;
    const dx = r * Math.sin(p.theta) * Math.cos(p.phi);
    const dy = r * Math.sin(p.theta) * Math.sin(p.phi);
    const dz = r * Math.cos(p.theta);
    const scale = 600 / (600 + dz);
    ctx!.globalAlpha = scale * 0.5;
    ctx!.fillStyle = isRandom ? p.color : (dx < 0 ? TEAL : ORANGE);
    ctx!.beginPath(); ctx!.arc(x + dx * scale, y + dy * scale, dotSize * scale, 0, Math.PI * 2); ctx!.fill();
  });
};

const triggerExplosion = (x: number, y: number) => {
  particles = [];
  const force = isMobile.value ? 8 : 14;
  for (let i = 0; i < 180; i++) {
    const ang = Math.random() * Math.PI * 2;
    const f = 4 + Math.random() * force;
    particles.push({ x, y, vx: Math.cos(ang) * f, vy: Math.sin(ang) * f, c: Math.random() > 0.5 ? TEAL : ORANGE, s: 2 + Math.random() * 4, a: 1 });
  }
  hasExploded = true;
};

const drawExplosion = () => {
  particles.forEach(p => {
    p.x += p.vx; p.y += p.vy;
    p.vx *= 0.96; p.vy *= 0.96;
    ctx!.globalAlpha = p.a * 0.6;
    ctx!.fillStyle = p.c;
    ctx!.beginPath(); ctx!.arc(p.x, p.y, p.s, 0, Math.PI * 2); ctx!.fill();
  });
};

onMounted(() => {
  initCanvas();
  draw();
  window.addEventListener('resize', initCanvas);
});

onUnmounted(() => {
  cancelAnimationFrame(animationFrameId);
  window.removeEventListener('resize', initCanvas);
});
</script>
