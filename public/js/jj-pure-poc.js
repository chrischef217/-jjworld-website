import * as THREE from 'https://esm.sh/three@0.180.0';
import gsap from 'https://esm.sh/gsap@3.13.0';
import { ScrollTrigger } from 'https://esm.sh/gsap@3.13.0/ScrollTrigger';
import Lenis from 'https://esm.sh/lenis@1.3.11';

gsap.registerPlugin(ScrollTrigger);

const canvas = document.querySelector('#three-canvas');
const cinematic = document.querySelector('#cinematic');
const stage = document.querySelector('.stage');
const ambient = document.querySelector('.ambient');
const copy = {
  opening: document.querySelector('.copy-opening'),
  calm: document.querySelector('.copy-calm'),
  plump: document.querySelector('.copy-plump'),
  bright: document.querySelector('.copy-bright'),
  bridge: document.querySelector('.copy-bridge'),
  serum: document.querySelector('.copy-serum'),
  cream: document.querySelector('.copy-cream')
};
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
renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1.15 : 1.55));

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(isMobile ? 35 : 31, 1, 0.1, 100);
camera.position.set(0, 0.08, isMobile ? 9.5 : 8.4);

const hemi = new THREE.HemisphereLight(0xffffff, 0xaab9a8, 2.25);
scene.add(hemi);
const key = new THREE.DirectionalLight(0xffffff, 5.0);
key.position.set(4.8, 6.4, 6.5);
scene.add(key);
const rim = new THREE.PointLight(0xb7edbd, 40, 24, 2);
rim.position.set(4.2, 1, 2.5);
scene.add(rim);
const fill = new THREE.PointLight(0xffffff, 20, 22, 2);
fill.position.set(-5, 0, 4.5);
scene.add(fill);

const world = new THREE.Group();
scene.add(world);

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smooth = (t) => {
  t = clamp01(t);
  return t * t * (3 - 2 * t);
};
const segment = (p, a, b) => smooth((p - a) / (b - a));
const bell = (p, a, b, c, d) => segment(p, a, b) * (1 - segment(p, c, d));
const lerp = THREE.MathUtils.lerp;
const mixColor = (a, b, t, target = new THREE.Color()) => target.copy(a).lerp(b, clamp01(t));

function makeLabelTexture(lines, accent = '') {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 512;
  const x = c.getContext('2d');
  x.clearRect(0, 0, c.width, c.height);
  x.textAlign = 'center';
  x.fillStyle = 'rgba(255,255,255,.98)';
  x.font = '600 58px Arial';
  x.fillText(lines[0] || '', 512, 150);
  x.font = '400 28px Arial';
  x.fillText(lines[1] || '', 512, 205);
  x.beginPath();
  x.moveTo(385, 248);
  x.lineTo(639, 248);
  x.strokeStyle = 'rgba(255,255,255,.72)';
  x.lineWidth = 2;
  x.stroke();
  x.font = '400 34px Georgia';
  x.fillText('JJ PURE', 512, 345);
  if (accent) {
    x.font = '700 25px Arial';
    x.fillText(accent, 512, 410);
  }
  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return texture;
}

function makePercentTexture(text) {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 1024;
  const x = c.getContext('2d');
  x.clearRect(0, 0, 1024, 1024);
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.fillStyle = 'rgba(80,86,96,.16)';
  x.font = '400 540px Georgia';
  x.fillText(text, 512, 535);
  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function setOpacity(root, opacity) {
  const o = clamp01(opacity);
  root.traverse((node) => {
    if (!node.material) return;
    const mats = Array.isArray(node.material) ? node.material : [node.material];
    mats.forEach((m) => {
      if (m.userData.baseOpacity == null) m.userData.baseOpacity = m.opacity ?? 1;
      m.transparent = true;
      m.opacity = o * m.userData.baseOpacity;
      m.depthWrite = m.opacity > 0.8;
    });
  });
}

function physical(color, opacity = 0.9, transmission = 0.34) {
  const m = new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.17,
    metalness: 0,
    transmission,
    thickness: 0.45,
    transparent: true,
    opacity,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
    ior: 1.46
  });
  m.userData.baseOpacity = opacity;
  return m;
}

const padGeometry = new THREE.CylinderGeometry(0.83, 0.83, 0.07, 64);
const padMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95, metalness: 0 });

function makePadJar({ color, title, sub, mode }) {
  const group = new THREE.Group();
  const glass = physical(color, 0.88, 0.34);

  const body = new THREE.Mesh(new THREE.CylinderGeometry(1.08, 1.11, 1.63, 64), glass.clone());
  body.position.y = -0.20;
  group.add(body);

  const shoulder = new THREE.Mesh(new THREE.TorusGeometry(1.02, 0.075, 18, 64), glass.clone());
  shoulder.rotation.x = Math.PI / 2;
  shoulder.position.y = 0.63;
  group.add(shoulder);

  for (let i = 0; i < 4; i++) {
    const pad = new THREE.Mesh(padGeometry, padMaterial);
    pad.position.set(0, 0.61 + i * 0.055, 0.02);
    group.add(pad);
  }

  const heroPad = new THREE.Mesh(padGeometry, padMaterial.clone());
  heroPad.position.set(0.15, 1.32, 0.18);
  heroPad.rotation.set(0.32, 0.16, 0.16);
  group.add(heroPad);

  const lidGroup = new THREE.Group();
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(1.14, 1.14, 0.12, 64), glass.clone());
  lid.rotation.x = Math.PI / 2;
  lidGroup.add(lid);
  lidGroup.position.set(0.72, 1.30, -0.34);
  lidGroup.rotation.set(-0.50, 0.07, -0.72);
  group.add(lidGroup);

  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(1.94, 0.97),
    new THREE.MeshBasicMaterial({ map: makeLabelTexture([title, sub], mode), transparent: true, depthWrite: false })
  );
  label.position.set(0, -0.25, 1.105);
  group.add(label);

  group.userData = { heroPad, lidGroup };
  return group;
}

function makeSerum() {
  const g = new THREE.Group();
  const frost = physical(0xe9ebed, 0.88, 0.18);
  frost.roughness = 0.42;
  const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.76, 0.79, 2.42, 64), frost);
  bottle.position.y = -0.2;
  g.add(bottle);

  const shoulder = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.72, 0.30, 64), frost.clone());
  shoulder.position.y = 1.10;
  g.add(shoulder);

  const collar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.55, 0.46, 64),
    new THREE.MeshStandardMaterial({ color: 0xbfc2c6, roughness: 0.12, metalness: 0.82 })
  );
  collar.position.y = 1.45;
  g.add(collar);

  const bulb = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.32, 0.56, 8, 32),
    new THREE.MeshStandardMaterial({ color: 0xf8f8f6, roughness: 0.52 })
  );
  bulb.position.y = 2.0;
  g.add(bulb);

  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(1.24, 1.18),
    new THREE.MeshBasicMaterial({ map: makeLabelTexture(['PERFECT ALPHA ARBUTIN', 'WHITENING SERUM'], '3%'), transparent: true, depthWrite: false })
  );
  label.position.set(0, -0.32, 0.79);
  g.add(label);
  return g;
}

function makeCream() {
  const g = new THREE.Group();
  const frost = physical(0xe7e9ea, 0.9, 0.18);
  frost.roughness = 0.46;
  const body = new THREE.Mesh(new THREE.CylinderGeometry(1.12, 1.15, 1.45, 64), frost);
  body.position.y = -0.42;
  g.add(body);

  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(1.15, 1.15, 0.56, 64),
    new THREE.MeshStandardMaterial({ color: 0xbec1c5, roughness: 0.12, metalness: 0.82 })
  );
  cap.position.y = 0.60;
  g.add(cap);

  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(1.86, 0.78),
    new THREE.MeshBasicMaterial({ map: makeLabelTexture(['PERFECT ALPHA ARBUTIN', 'WHITENING CREAM'], '5%'), transparent: true, depthWrite: false })
  );
  label.position.set(0, -0.43, 1.145);
  g.add(label);
  return g;
}

const calmJar = makePadJar({ color: 0x52ad43, title: 'ALOVERA', sub: 'SOOTHING CLEAR · TONER PAD', mode: 'CALM MODE' });
const plumpJar = makePadJar({ color: 0xeb6f99, title: 'COLLAGEN', sub: 'CALMING GEL · TONER PAD', mode: 'PLUMP MODE' });
const brightJar = makePadJar({ color: 0xf0c62f, title: 'VITA-C', sub: 'BLEMISH · TONER PAD', mode: 'BRIGHT MODE' });
const serum = makeSerum();
const cream = makeCream();

[calmJar, plumpJar, brightJar, serum, cream].forEach((o) => world.add(o));
setOpacity(plumpJar, 0);
setOpacity(brightJar, 0);
setOpacity(serum, 0);
setOpacity(cream, 0);

const ringMaterial = physical(0x9ddc91, 0.54, 0.77);
ringMaterial.roughness = 0.12;
const ring = new THREE.Mesh(new THREE.TorusGeometry(3.1, 0.075, 20, 140), ringMaterial);
ring.position.set(isMobile ? 0.4 : 1.65, 0.22, -1.1);
ring.rotation.set(0.16, 0.32, 0.06);
world.add(ring);

const halo = new THREE.Mesh(
  new THREE.RingGeometry(2.4, 2.47, 120),
  new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.13, side: THREE.DoubleSide, depthWrite: false })
);
halo.position.set(isMobile ? 0.4 : 1.65, 0.2, -1.35);
world.add(halo);

const bubbleMaterial = physical(0xdff0df, isMobile ? 0.20 : 0.32, 0.9);
bubbleMaterial.roughness = 0.05;
const bubbles = [];
for (let i = 0; i < (isMobile ? 4 : 8); i++) {
  const r = 0.12 + (i % 4) * 0.09;
  const b = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 24), bubbleMaterial.clone());
  const side = i % 2 ? 1 : -1;
  b.position.set(side * (1.7 + (i % 3) * 0.85), -1.5 + (i % 5) * 0.75, -0.5 - (i % 4) * 0.65);
  b.userData.base = b.position.clone();
  b.userData.phase = i * 1.47;
  bubbles.push(b);
  world.add(b);
}

const gelBlobs = [];
for (let i = 0; i < (isMobile ? 2 : 4); i++) {
  const mat = physical(0xf3a6be, 0.0, 0.52);
  mat.userData.baseOpacity = 0.46;
  const blob = new THREE.Mesh(new THREE.SphereGeometry(1, 36, 36), mat);
  blob.position.set(0.8 + i * 1.25, -1.7 + (i % 2) * 1.1, -2.0 - i * 0.2);
  blob.scale.set(1.35 + i * 0.12, 0.46 + (i % 2) * 0.16, 0.7);
  blob.userData.baseScale = blob.scale.clone();
  gelBlobs.push(blob);
  world.add(blob);
}

const crystalPlanes = [];
for (let i = 0; i < (isMobile ? 3 : 6); i++) {
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xe6e9ed,
    roughness: 0.05,
    transmission: 0.82,
    transparent: true,
    opacity: 0,
    thickness: 0.18,
    side: THREE.DoubleSide
  });
  mat.userData.baseOpacity = 0.28;
  const plane = new THREE.Mesh(new THREE.BoxGeometry(0.035, 4.8, 1.1 + (i % 2) * 0.55), mat);
  plane.position.set(-3 + i * 1.25, 0, -2.5 - (i % 3) * 0.6);
  plane.rotation.y = -0.5 + i * 0.16;
  crystalPlanes.push(plane);
  world.add(plane);
}

const bridgePad = new THREE.Mesh(padGeometry, padMaterial.clone());
bridgePad.position.set(0, 0.2, 0.2);
bridgePad.material.transparent = true;
bridgePad.material.opacity = 0;
bridgePad.material.userData.baseOpacity = 1;
world.add(bridgePad);

const lightSlit = new THREE.Mesh(
  new THREE.PlaneGeometry(0.34, 5.4),
  new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })
);
lightSlit.position.set(0.6, 0.1, -0.7);
world.add(lightSlit);

function makePercentPlane(text) {
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(5.7, 5.7),
    new THREE.MeshBasicMaterial({ map: makePercentTexture(text), transparent: true, opacity: 0, depthWrite: false })
  );
  m.material.userData.baseOpacity = 1;
  return m;
}
const threePercent = makePercentPlane('3%');
const fivePercent = makePercentPlane('5%');
threePercent.position.set(1.3, 0.1, -3.4);
fivePercent.position.set(1.3, 0.1, -3.4);
world.add(threePercent, fivePercent);

const colors = {
  green: new THREE.Color('#e8f2e5'),
  neutral: new THREE.Color('#f1eee9'),
  pink: new THREE.Color('#f3dde6'),
  gold: new THREE.Color('#f5e7bd'),
  cool: new THREE.Color('#edf0f3'),
  cream: new THREE.Color('#eeeae4'),
  greenRing: new THREE.Color('#76c867'),
  pinkRing: new THREE.Color('#ef87aa'),
  goldRing: new THREE.Color('#d7ad27'),
  silverRing: new THREE.Color('#c4c9d0')
};
const tempColor = new THREE.Color();

let targetProgress = 0;
let progress = 0;
let lastTime = performance.now();
let frames = 0;
let fpsClock = lastTime;

function setCopy(el, opacity, y = 0) {
  el.style.opacity = clamp01(opacity).toFixed(4);
  el.style.transform = isMobile
    ? `translate3d(0, ${y}px, 0)`
    : `translate3d(0, calc(-46% + ${y}px), 0)`;
}

function copyWeights(p) {
  setCopy(copy.opening, bell(p, 0.000, 0.020, 0.060, 0.090), 12);
  setCopy(copy.calm, bell(p, 0.075, 0.105, 0.205, 0.255), 18);
  setCopy(copy.plump, bell(p, 0.275, 0.315, 0.420, 0.475), 18);
  setCopy(copy.bright, bell(p, 0.495, 0.535, 0.635, 0.690), 18);
  setCopy(copy.bridge, bell(p, 0.660, 0.685, 0.720, 0.748), 18);
  setCopy(copy.serum, bell(p, 0.720, 0.750, 0.815, 0.855), 18);
  setCopy(copy.cream, segment(p, 0.875, 0.925), 18 * (1 - segment(p, 0.925, 0.97)));
}

function backgroundAt(p) {
  let c;
  if (p < 0.23) {
    c = mixColor(colors.neutral, colors.green, segment(p, 0.02, 0.14), tempColor);
  } else if (p < 0.30) {
    c = mixColor(colors.green, colors.pink, segment(p, 0.23, 0.30), tempColor);
  } else if (p < 0.45) {
    c = tempColor.copy(colors.pink);
  } else if (p < 0.52) {
    c = mixColor(colors.pink, colors.gold, segment(p, 0.45, 0.52), tempColor);
  } else if (p < 0.67) {
    c = tempColor.copy(colors.gold);
  } else if (p < 0.75) {
    c = mixColor(colors.gold, colors.cool, segment(p, 0.67, 0.75), tempColor);
  } else if (p < 0.87) {
    c = tempColor.copy(colors.cool);
  } else {
    c = mixColor(colors.cool, colors.cream, segment(p, 0.87, 0.96), tempColor);
  }
  const css = `rgb(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)})`;
  stage.style.setProperty('--bg-a', css);
  if (p < 0.30) stage.style.setProperty('--bg-b', '#dcebd9');
  else if (p < 0.52) stage.style.setProperty('--bg-b', '#efcbd9');
  else if (p < 0.70) stage.style.setProperty('--bg-b', '#f4ddb0');
  else if (p < 0.88) stage.style.setProperty('--bg-b', '#dfe4e9');
  else stage.style.setProperty('--bg-b', '#e7e0d8');
}

function updateScene(p, now) {
  copyWeights(p);
  backgroundAt(p);

  const calmIn = segment(p, 0.035, 0.105);
  const c2p = segment(p, 0.225, 0.305);
  const p2b = segment(p, 0.445, 0.525);
  const b2s = segment(p, 0.665, 0.745);
  const s2c = segment(p, 0.835, 0.900);

  // Camera: one continuous gallery; no scene reset.
  camera.position.z = (isMobile ? 9.55 : 8.55) - calmIn * 0.72 - c2p * 0.08 - p2b * 0.16 - b2s * 0.32 - s2c * 0.12;
  camera.position.x = c2p * 0.18 + p2b * 0.12 - b2s * 0.22 + s2c * 0.08;
  camera.position.y = 0.08 + Math.sin(now * 0.00023) * (reducedMotion ? 0 : 0.016);
  camera.lookAt(isMobile ? 0.25 : 0.54, 0.04, 0);

  // CALM
  calmJar.position.set(
    lerp(isMobile ? 0.55 : 2.35, isMobile ? 0.40 : 2.0, calmIn) - c2p * (isMobile ? 1.55 : 2.2),
    -0.25 + Math.sin(now * 0.0012) * (reducedMotion ? 0 : 0.032),
    lerp(-2.8, 0.08, calmIn) - c2p * 2.5
  );
  calmJar.rotation.y = -0.08 + Math.sin(now * 0.00042) * (reducedMotion ? 0 : 0.032) - c2p * 0.12;
  setOpacity(calmJar, calmIn * (1 - segment(p, 0.245, 0.315)));
  calmJar.userData.heroPad.position.y = 1.30 + Math.sin(now * 0.0016) * (reducedMotion ? 0 : 0.075);

  // PLUMP
  const plumpIn = segment(p, 0.245, 0.320);
  plumpJar.position.set(
    lerp(isMobile ? 1.9 : 3.35, isMobile ? 0.55 : 2.05, plumpIn) - p2b * (isMobile ? 1.45 : 2.0),
    -0.22 + Math.sin(now * 0.00105 + 1.3) * (reducedMotion ? 0 : 0.032),
    lerp(-3.7, 0.02, plumpIn) - p2b * 2.5
  );
  plumpJar.rotation.y = lerp(0.18, -0.04, plumpIn) - p2b * 0.10;
  setOpacity(plumpJar, plumpIn * (1 - segment(p, 0.465, 0.535)));
  plumpJar.userData.heroPad.position.y = 1.30 + Math.sin(now * 0.00175 + 2.0) * (reducedMotion ? 0 : 0.09);

  // BRIGHT
  const brightIn = segment(p, 0.465, 0.540);
  brightJar.position.set(
    lerp(isMobile ? 1.9 : 3.25, isMobile ? 0.55 : 2.05, brightIn) - b2s * (isMobile ? 0.55 : 1.0),
    -0.22 + Math.sin(now * 0.00115 + 2.2) * (reducedMotion ? 0 : 0.028),
    lerp(-3.8, 0.0, brightIn) - b2s * 1.8
  );
  brightJar.rotation.y = lerp(0.16, -0.03, brightIn) - b2s * 0.08;
  setOpacity(brightJar, brightIn * (1 - segment(p, 0.675, 0.740)));
  brightJar.userData.heroPad.position.y = 1.30 + Math.sin(now * 0.0017 + 3.1) * (reducedMotion ? 0 : 0.075);

  // Persistent ring/halo is the continuity anchor.
  if (p < 0.30) ring.material.color.copy(colors.greenRing).lerp(colors.pinkRing, c2p);
  else if (p < 0.52) ring.material.color.copy(colors.pinkRing).lerp(colors.goldRing, p2b);
  else if (p < 0.74) ring.material.color.copy(colors.goldRing).lerp(colors.silverRing, b2s);
  else ring.material.color.copy(colors.silverRing);
  ring.rotation.z = 0.05 + p * 0.54;
  ring.rotation.y = 0.28 + p * 0.20;
  ring.position.x = (isMobile ? 0.48 : 1.72) - b2s * (isMobile ? 0.15 : 0.55);
  ring.scale.set(
    1 + c2p * 0.04 + p2b * 0.06 - b2s * 0.44,
    1 + c2p * 0.04 + p2b * 0.06 + b2s * 0.22,
    1
  );
  ring.material.opacity = 0.54 - b2s * 0.22 + s2c * 0.08;

  halo.scale.setScalar(1 + p2b * 0.20 - b2s * 0.12);
  halo.material.opacity = 0.10 + p2b * 0.20 - b2s * 0.12;
  halo.material.color.copy(colors.goldRing).lerp(colors.silverRing, b2s);

  // CALM bubbles leave; PLUMP gel breathes; BRIGHT opens the world.
  bubbles.forEach((b, i) => {
    const drift = reducedMotion ? 0 : Math.sin(now * 0.00045 + b.userData.phase) * 0.10;
    b.position.x = b.userData.base.x - c2p * (i % 2 ? 0.4 : -0.24) + p2b * (i % 2 ? 0.3 : -0.2);
    b.position.y = b.userData.base.y + drift;
    const bubbleVisibility = (1 - segment(p, 0.44, 0.54)) * (isMobile ? 0.20 : 0.32);
    b.material.opacity = bubbleVisibility;
  });

  const gelIn = bell(p, 0.245, 0.315, 0.445, 0.525);
  gelBlobs.forEach((blob, i) => {
    blob.material.opacity = 0.46 * gelIn;
    const pulse = reducedMotion ? 1 : 1 + Math.sin(now * 0.00105 + i) * 0.016 * gelIn;
    blob.scale.copy(blob.userData.baseScale).multiplyScalar(pulse);
  });

  // Bridge pad: a recurring pad becomes the gateway to the active line.
  const bridgeIn = bell(p, 0.630, 0.675, 0.715, 0.755);
  bridgePad.material.opacity = bridgeIn;
  bridgePad.position.set(
    lerp(isMobile ? 0.45 : 1.7, isMobile ? 0.10 : 0.55, b2s),
    lerp(1.05, 0.15, b2s),
    lerp(0.2, -0.15, b2s)
  );
  bridgePad.rotation.x = lerp(0.26, Math.PI / 2.1, b2s);
  bridgePad.rotation.z = lerp(0.12, 0.0, b2s);
  bridgePad.scale.setScalar(lerp(1, 0.82, b2s));

  lightSlit.material.opacity = bell(p, 0.680, 0.715, 0.750, 0.790) * 0.92;
  lightSlit.scale.x = lerp(0.3, 1.2, segment(p, 0.70, 0.76));

  // SERUM
  const serumIn = segment(p, 0.705, 0.765);
  serum.position.set(
    lerp(isMobile ? 0.35 : 0.70, isMobile ? 0.55 : 2.0, segment(p, 0.745, 0.805)) - s2c * (isMobile ? 1.0 : 1.9),
    -0.25 + Math.sin(now * 0.0008) * (reducedMotion ? 0 : 0.018),
    lerp(-3.5, 0.1, serumIn) - s2c * 2.2
  );
  serum.rotation.y = lerp(0.18, -0.04, serumIn) - s2c * 0.10;
  setOpacity(serum, serumIn * (1 - segment(p, 0.850, 0.910)));
  threePercent.material.opacity = bell(p, 0.720, 0.755, 0.825, 0.875) * 0.95;
  threePercent.position.z = lerp(-5.2, -3.0, segment(p, 0.72, 0.81));
  threePercent.rotation.z = -0.025 + Math.sin(now * 0.00015) * (reducedMotion ? 0 : 0.01);

  // CREAM
  const creamIn = segment(p, 0.845, 0.910);
  cream.position.set(
    lerp(isMobile ? 1.7 : 3.15, isMobile ? 0.55 : 2.05, creamIn),
    -0.38 + Math.sin(now * 0.00065 + 0.8) * (reducedMotion ? 0 : 0.012),
    lerp(-3.8, 0.05, creamIn)
  );
  cream.rotation.y = lerp(0.17, -0.03, creamIn);
  setOpacity(cream, creamIn);
  fivePercent.material.opacity = segment(p, 0.855, 0.915) * 0.95;
  fivePercent.position.z = lerp(-5.0, -3.0, segment(p, 0.86, 0.94));

  // Crystal architecture enters with serum and persists through cream.
  const architecture = segment(p, 0.705, 0.790);
  crystalPlanes.forEach((plane, i) => {
    plane.material.opacity = plane.material.userData.baseOpacity * architecture;
    plane.rotation.y = (-0.5 + i * 0.16) + Math.sin(now * 0.00016 + i) * (reducedMotion ? 0 : 0.015);
    plane.position.x += ((-3 + i * 1.25 + s2c * 0.12) - plane.position.x) * 0.04;
  });

  // Light language becomes more precise after pads.
  if (p < 0.30) rim.color.copy(colors.greenRing).lerp(colors.pinkRing, c2p);
  else if (p < 0.52) rim.color.copy(colors.pinkRing).lerp(colors.goldRing, p2b);
  else rim.color.copy(colors.goldRing).lerp(colors.silverRing, b2s);
  rim.intensity = 38 + p2b * 10 - b2s * 4 + s2c * 2;
  key.intensity = 5.0 + p2b * 1.0 + b2s * 0.5;

  ambient.style.opacity = String(0.82 + p2b * 0.1 - b2s * 0.08);
  ambient.style.transform = `scale(${1.08 + p2b * 0.05 - b2s * 0.03}) translate3d(${(-c2p - p2b + b2s) * 1.5}%,0,0)`;

  world.rotation.y = Math.sin(now * 0.00011) * (reducedMotion ? 0 : 0.007) + p * 0.012;
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
  onUpdate: (self) => { targetProgress = self.progress; }
});

function loop(now) {
  requestAnimationFrame(loop);
  const dt = Math.min(50, now - lastTime);
  lastTime = now;
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
requestAnimationFrame(() => ScrollTrigger.refresh());
