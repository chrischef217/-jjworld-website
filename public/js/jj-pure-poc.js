import * as THREE from 'https://esm.sh/three@0.180.0';
import gsap from 'https://esm.sh/gsap@3.13.0';
import { ScrollTrigger } from 'https://esm.sh/gsap@3.13.0/ScrollTrigger';
import Lenis from 'https://esm.sh/lenis@1.3.11';

gsap.registerPlugin(ScrollTrigger);

const canvas = document.querySelector('#three-canvas');
const cinematic = document.querySelector('#cinematic');
const stage = document.querySelector('.stage');
const ambient = document.querySelector('.ambient');
const openingCopy = document.querySelector('.copy-opening');
const calmCopy = document.querySelector('.copy-calm');
const plumpCopy = document.querySelector('.copy-plump');
const debug = document.querySelector('#debug');
const progressReadout = document.querySelector('#progress-readout');
const fpsReadout = document.querySelector('#fps-readout');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = matchMedia('(max-width: 780px)').matches;
const debugEnabled = new URLSearchParams(location.search).get('debug') === '1';
if (debugEnabled) debug.hidden = false;

const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true,
  antialias: !isMobile,
  powerPreference: 'high-performance'
});
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1.2 : 1.6));

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(isMobile ? 35 : 31, 1, 0.1, 100);
camera.position.set(0, 0.1, isMobile ? 9.3 : 8.2);

const hemi = new THREE.HemisphereLight(0xffffff, 0xaab9a8, 2.2);
scene.add(hemi);
const key = new THREE.DirectionalLight(0xffffff, 5.1);
key.position.set(4.5, 6.2, 6.5);
scene.add(key);
const rim = new THREE.PointLight(0xb7edbd, 42, 22, 2);
rim.position.set(4, 1, 2);
scene.add(rim);
const fill = new THREE.PointLight(0xffffff, 22, 20, 2);
fill.position.set(-5, 0, 4);
scene.add(fill);

const world = new THREE.Group();
scene.add(world);

function makeLabelTexture(title, sub, mode) {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 512;
  const x = c.getContext('2d');
  x.clearRect(0, 0, c.width, c.height);
  x.textAlign = 'center';
  x.fillStyle = 'rgba(255,255,255,.98)';
  x.font = '600 58px Arial';
  x.fillText(title, 512, 152);
  x.font = '400 28px Arial';
  x.fillText(sub, 512, 205);
  x.beginPath();
  x.moveTo(390, 250);
  x.lineTo(634, 250);
  x.strokeStyle = 'rgba(255,255,255,.75)';
  x.lineWidth = 2;
  x.stroke();
  x.font = '400 32px Georgia';
  x.letterSpacing = '8px';
  x.fillText('JJ PURE', 512, 355);
  x.font = '700 21px Arial';
  x.fillText(mode, 512, 417);
  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return texture;
}

function materialSetOpacity(root, opacity) {
  root.traverse((o) => {
    if (!o.material) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    mats.forEach((m) => {
      if (m.userData.baseOpacity == null) m.userData.baseOpacity = m.opacity ?? 1;
      m.transparent = true;
      m.opacity = Math.max(0, Math.min(1, opacity * m.userData.baseOpacity));
      m.depthWrite = m.opacity > 0.82;
    });
  });
}

function makeJar({ color, title, sub, mode }) {
  const group = new THREE.Group();

  const glass = new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.17,
    metalness: 0,
    transmission: 0.34,
    thickness: 0.45,
    transparent: true,
    opacity: 0.88,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
    ior: 1.46
  });
  glass.userData.baseOpacity = 0.88;

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(1.08, 1.11, 1.63, 64, 1, false),
    glass.clone()
  );
  body.position.y = -0.20;
  group.add(body);

  const shoulder = new THREE.Mesh(
    new THREE.TorusGeometry(1.02, 0.075, 18, 64),
    glass.clone()
  );
  shoulder.rotation.x = Math.PI / 2;
  shoulder.position.y = 0.63;
  group.add(shoulder);

  const padMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.94, metalness: 0 });
  const padGeo = new THREE.CylinderGeometry(0.83, 0.83, 0.07, 64);
  for (let i = 0; i < 4; i++) {
    const pad = new THREE.Mesh(padGeo, padMaterial);
    pad.position.set(0, 0.61 + i * 0.055, 0.02);
    group.add(pad);
  }

  const floatingPad = new THREE.Mesh(padGeo, padMaterial.clone());
  floatingPad.name = 'floatingPad';
  floatingPad.position.set(0.15, 1.32, 0.18);
  floatingPad.rotation.set(0.32, 0.16, 0.16);
  group.add(floatingPad);

  const lidGroup = new THREE.Group();
  const lid = new THREE.Mesh(
    new THREE.CylinderGeometry(1.14, 1.14, 0.12, 64),
    glass.clone()
  );
  lid.rotation.x = Math.PI / 2;
  lidGroup.add(lid);
  lidGroup.position.set(0.72, 1.30, -0.34);
  lidGroup.rotation.set(-0.50, 0.07, -0.72);
  group.add(lidGroup);

  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(1.94, 0.97),
    new THREE.MeshBasicMaterial({
      map: makeLabelTexture(title, sub, mode),
      transparent: true,
      depthWrite: false
    })
  );
  label.position.set(0, -0.25, 1.105);
  group.add(label);

  group.userData = { floatingPad, lidGroup, glassColor: new THREE.Color(color) };
  return group;
}

const calmJar = makeJar({
  color: 0x52ad43,
  title: 'ALOVERA',
  sub: 'SOOTHING CLEAR · TONER PAD',
  mode: 'CALM MODE'
});
calmJar.position.set(isMobile ? 0.5 : 2.05, -0.25, 0.15);
world.add(calmJar);

const plumpJar = makeJar({
  color: 0xeb6f99,
  title: 'COLLAGEN',
  sub: 'CALMING GEL · TONER PAD',
  mode: 'PLUMP MODE'
});
plumpJar.position.set(isMobile ? 0.7 : 3.2, -0.22, -3.0);
world.add(plumpJar);
materialSetOpacity(plumpJar, 0);

const ringMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x9ddc91,
  roughness: 0.12,
  metalness: 0,
  transmission: 0.77,
  transparent: true,
  opacity: 0.54,
  thickness: 0.3,
  clearcoat: 1,
  side: THREE.DoubleSide
});
ringMaterial.userData.baseOpacity = 0.54;
const ring = new THREE.Mesh(new THREE.TorusGeometry(3.1, 0.075, 20, 140), ringMaterial);
ring.position.set(isMobile ? 0.4 : 1.65, 0.22, -1.1);
ring.rotation.set(0.16, 0.32, 0.06);
world.add(ring);

const halo = new THREE.Mesh(
  new THREE.RingGeometry(2.4, 2.47, 120),
  new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.13, side: THREE.DoubleSide })
);
halo.position.set(isMobile ? 0.4 : 1.65, 0.2, -1.35);
world.add(halo);

const bubbleMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xdff0df,
  roughness: 0.05,
  transmission: 0.9,
  thickness: 0.55,
  transparent: true,
  opacity: isMobile ? 0.22 : 0.35,
  ior: 1.42
});
const bubbles = [];
const bubbleCount = isMobile ? 4 : 8;
for (let i = 0; i < bubbleCount; i++) {
  const r = 0.12 + (i % 4) * 0.09;
  const b = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 24), bubbleMaterial.clone());
  const side = i % 2 ? 1 : -1;
  b.position.set(side * (1.7 + (i % 3) * 0.85), -1.5 + (i % 5) * 0.75, -0.5 - (i % 4) * 0.65);
  b.userData.base = b.position.clone();
  b.userData.phase = i * 1.47;
  bubbles.push(b);
  world.add(b);
}

const gelMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xf3a6be,
  roughness: 0.16,
  transmission: 0.52,
  transparent: true,
  opacity: 0,
  thickness: 0.8,
  clearcoat: 1
});
const gelBlobs = [];
for (let i = 0; i < (isMobile ? 2 : 4); i++) {
  const blob = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 40), gelMaterial.clone());
  blob.material.userData.baseOpacity = 0.45;
  blob.position.set(0.8 + i * 1.25, -1.7 + (i % 2) * 1.1, -2.0 - i * 0.2);
  blob.scale.set(1.35 + i * 0.12, 0.46 + (i % 2) * 0.16, 0.7);
  blob.userData.baseScale = blob.scale.clone();
  gelBlobs.push(blob);
  world.add(blob);
}

const green = new THREE.Color('#e8f2e5');
const neutral = new THREE.Color('#f1eee9');
const pink = new THREE.Color('#f3dde6');
const greenRing = new THREE.Color('#76c867');
const pinkRing = new THREE.Color('#ef87aa');
const tempColor = new THREE.Color();

let targetProgress = 0;
let progress = 0;
let lastTime = performance.now();
let frames = 0;
let fpsClock = lastTime;
let elapsed = 0;

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smooth = (t) => {
  t = clamp01(t);
  return t * t * (3 - 2 * t);
};
const segment = (p, a, b) => smooth((p - a) / (b - a));
const bell = (p, a, b, c, d) => segment(p, a, b) * (1 - segment(p, c, d));
const lerp = THREE.MathUtils.lerp;

function setCopy(el, opacity, y = 0) {
  el.style.opacity = opacity.toFixed(4);
  el.style.transform = isMobile
    ? `translate3d(0, ${y}px, 0)`
    : `translate3d(0, calc(-46% + ${y}px), 0)`;
}

function updateScene(p, now) {
  const openingW = bell(p, 0.0, 0.035, 0.13, 0.19);
  const calmW = bell(p, 0.13, 0.20, 0.54, 0.68);
  const plumpW = segment(p, 0.66, 0.79);
  setCopy(openingCopy, openingW, (1 - openingW) * 18);
  setCopy(calmCopy, calmW, (1 - calmW) * 22);
  setCopy(plumpCopy, plumpW, (1 - plumpW) * 24);

  const enter = segment(p, 0.02, 0.20);
  const transition = segment(p, 0.56, 0.76);
  const settle = segment(p, 0.76, 0.96);

  // Camera stays in one world; only small dolly/yaw changes.
  camera.position.z = lerp(isMobile ? 9.4 : 8.5, isMobile ? 8.5 : 7.55, enter) - transition * 0.18;
  camera.position.x = (isMobile ? 0.05 : 0) + transition * (isMobile ? 0.1 : 0.22);
  camera.position.y = 0.08 + Math.sin(now * 0.00025) * (reducedMotion ? 0 : 0.018);
  camera.lookAt(isMobile ? 0.28 : 0.52, 0.05, 0);

  // CALM jar: enters from depth and moves left/back during transition.
  calmJar.position.x = lerp(isMobile ? 0.55 : 2.35, isMobile ? 0.42 : 2.0, enter) - transition * (isMobile ? 1.65 : 2.25);
  calmJar.position.z = lerp(-2.8, 0.1, enter) - transition * 2.6;
  calmJar.position.y = -0.25 + Math.sin(now * 0.0012) * (reducedMotion ? 0 : 0.035);
  calmJar.rotation.y = -0.09 + Math.sin(now * 0.00045) * (reducedMotion ? 0 : 0.035) - transition * 0.12;
  materialSetOpacity(calmJar, 1 - segment(p, 0.64, 0.80));

  const calmPad = calmJar.userData.floatingPad;
  calmPad.position.y = 1.30 + Math.sin(now * 0.0016) * (reducedMotion ? 0 : 0.08);
  calmPad.rotation.z = 0.12 + Math.sin(now * 0.0008) * (reducedMotion ? 0 : 0.08);

  // PLUMP jar rises from same 3D stage, not a page cut.
  plumpJar.position.x = lerp(isMobile ? 1.9 : 3.35, isMobile ? 0.55 : 2.05, transition);
  plumpJar.position.z = lerp(-3.8, 0.02, transition);
  plumpJar.position.y = -0.22 + Math.sin(now * 0.00105 + 1.3) * (reducedMotion ? 0 : 0.035);
  plumpJar.rotation.y = lerp(0.18, -0.04, transition) + Math.sin(now * 0.00045) * (reducedMotion ? 0 : 0.028);
  materialSetOpacity(plumpJar, segment(p, 0.60, 0.78));

  const plumpPad = plumpJar.userData.floatingPad;
  plumpPad.position.y = 1.30 + Math.sin(now * 0.00175 + 2.0) * (reducedMotion ? 0 : 0.095);
  plumpPad.rotation.z = 0.12 + Math.sin(now * 0.001) * (reducedMotion ? 0 : 0.10);

  // Persistent ring is the continuity device.
  tempColor.copy(greenRing).lerp(pinkRing, transition);
  ring.material.color.copy(tempColor);
  ring.position.x = lerp(isMobile ? 0.45 : 1.68, isMobile ? 0.56 : 1.82, transition);
  ring.rotation.z = 0.05 + p * 0.34;
  ring.rotation.y = 0.28 + p * 0.16;
  ring.scale.setScalar(1 + transition * 0.06 + Math.sin(now * 0.0004) * (reducedMotion ? 0 : 0.006));
  halo.material.opacity = 0.10 + transition * 0.10;
  halo.scale.setScalar(1 + transition * 0.05);

  // Environment color transforms through neutral; never hard-cuts.
  if (transition < 0.5) tempColor.copy(green).lerp(neutral, transition * 2);
  else tempColor.copy(neutral).lerp(pink, (transition - 0.5) * 2);
  const css = `rgb(${Math.round(tempColor.r * 255)},${Math.round(tempColor.g * 255)},${Math.round(tempColor.b * 255)})`;
  stage.style.setProperty('--bg-a', css);
  stage.style.setProperty('--bg-b', transition < 0.5 ? '#dcebd9' : '#efcbd9');
  ambient.style.opacity = String(0.82 + transition * 0.12);
  ambient.style.transform = `scale(${1.08 + transition * 0.04}) translate3d(${transition * -2.3}%,0,0)`;

  // Lighting shifts green -> neutral -> pink.
  rim.color.copy(greenRing).lerp(pinkRing, transition);
  rim.intensity = 38 + transition * 8;
  key.intensity = 5.0 + transition * 0.8;

  // Calm bubbles drift out while PLUMP gel volumes breathe in.
  bubbles.forEach((b, i) => {
    const base = b.userData.base;
    const drift = reducedMotion ? 0 : Math.sin(now * 0.00045 + b.userData.phase) * 0.10;
    b.position.x = base.x - transition * (i % 2 ? 0.45 : -0.25);
    b.position.y = base.y + drift;
    b.material.opacity = (isMobile ? 0.20 : 0.32) * (1 - transition * 0.65);
  });

  const gelIn = segment(p, 0.57, 0.80);
  gelBlobs.forEach((blob, i) => {
    blob.material.opacity = 0.44 * gelIn;
    const pulse = reducedMotion ? 1 : 1 + Math.sin(now * 0.00105 + i) * 0.016 * gelIn;
    blob.scale.copy(blob.userData.baseScale).multiplyScalar(pulse);
    blob.position.x -= (blob.position.x - (0.8 + i * 1.25 - transition * 0.5)) * 0.04;
  });

  // Small overall world parallax.
  world.rotation.y = Math.sin(now * 0.00012) * (reducedMotion ? 0 : 0.008) + transition * 0.016;
  world.position.y = settle * 0.03;
}

function resize() {
  const w = innerWidth;
  const h = innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
addEventListener('resize', () => {
  resize();
  ScrollTrigger.refresh();
}, { passive: true });
resize();

let lenis = null;
if (!reducedMotion) {
  lenis = new Lenis({
    duration: 1.12,
    smoothWheel: true,
    wheelMultiplier: 0.92,
    touchMultiplier: 1.0
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

ScrollTrigger.create({
  trigger: cinematic,
  start: 'top top',
  end: 'bottom bottom',
  invalidateOnRefresh: true,
  onUpdate: (self) => {
    targetProgress = self.progress;
  }
});

function loop(now) {
  requestAnimationFrame(loop);
  const dt = Math.min(50, now - lastTime);
  lastTime = now;
  elapsed += dt;

  const follow = reducedMotion ? 1 : 1 - Math.pow(0.001, dt / 1000);
  progress += (targetProgress - progress) * Math.min(0.16, Math.max(0.045, follow * 1.35));
  updateScene(progress, now);
  renderer.render(scene, camera);

  if (debugEnabled) {
    progressReadout.textContent = progress.toFixed(3);
    frames++;
    if (now - fpsClock > 500) {
      fpsReadout.textContent = Math.round((frames * 1000) / (now - fpsClock));
      frames = 0;
      fpsClock = now;
    }
  }
}
requestAnimationFrame(loop);

// Ensure initial layout is measured after fonts and module execution.
requestAnimationFrame(() => ScrollTrigger.refresh());
