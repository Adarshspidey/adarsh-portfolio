/* =========================================================
   PRELOADER
========================================================= */
const preloader = document.getElementById('preloader');
const preloaderFill = document.getElementById('preloaderFill');
const preloaderText = document.getElementById('preloaderText');

(function runPreloader(){
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 18;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      preloaderFill.style.width = '100%';
      preloaderText.textContent = 'LOADING WORLD... 100%';
      setTimeout(() => {
        preloader.classList.add('hidden');
        document.body.classList.add('loaded');
        kickOffTypewriter();
        revealOnLoadHero();
      }, 450);
      return;
    }
    preloaderFill.style.width = progress + '%';
    preloaderText.textContent = 'LOADING WORLD... ' + Math.floor(progress) + '%';
  }, 160);
})();

/* =========================================================
   CUSTOM CURSOR
========================================================= */
const cursorDot = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');

if (window.matchMedia('(pointer: fine)').matches) {
  let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top = mouseY + 'px';
  });

  function animateRing(){
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  document.querySelectorAll('a, button, .tilt, .skill-chip, .connect-card').forEach(el => {
    el.addEventListener('mouseenter', () => cursorRing.classList.add('active'));
    el.addEventListener('mouseleave', () => cursorRing.classList.remove('active'));
  });
}

/* =========================================================
   SOUND FX (Web Audio API  no external files)
========================================================= */
let sfxEnabled = false;
const soundToggle = document.getElementById('soundToggle');
let audioCtx = null;

function ensureAudioCtx(){
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function playBlip(freq = 440, duration = 0.07, type = 'sine', gainVal = 0.05){
  if (!sfxEnabled) return;
  ensureAudioCtx();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = gainVal;
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
  osc.stop(audioCtx.currentTime + duration);
}

soundToggle.addEventListener('click', () => {
  sfxEnabled = !sfxEnabled;
  soundToggle.textContent = sfxEnabled ? '??' : '??';
  if (sfxEnabled) { ensureAudioCtx(); playBlip(660, 0.09, 'square', 0.06); }
});

document.querySelectorAll('.nav-link, .btn, .connect-card, .skill-chip').forEach(el => {
  el.addEventListener('mouseenter', () => playBlip(880, 0.05, 'sine', 0.03));
  el.addEventListener('click', () => playBlip(520, 0.09, 'square', 0.05));
});

/* =========================================================
   HUD NAV  mobile burger + scrollspy
========================================================= */
const hudBurger = document.getElementById('hudBurger');
const navLinks = document.getElementById('navLinks');

hudBurger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

const sections = document.querySelectorAll('.section');
const navLinkEls = document.querySelectorAll('.nav-link');
const hudLevel = document.getElementById('hudLevel');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinkEls.forEach(l => l.classList.toggle('active', l.dataset.section === id));
      const idx = Array.from(sections).indexOf(entry.target) + 1;
      hudLevel.textContent = String(idx).padStart(2, '0');
    }
  });
}, { rootMargin: '-45% 0px -45% 0px' });

sections.forEach(sec => sectionObserver.observe(sec));

/* =========================================================
   TYPEWRITER
========================================================= */
const roles = [
  'Unreal Engine Game Developer',
  'Story Creator  Guardian of Ananthankadu',
  'Full-Stack Software Developer',
  'Gameplay & Blueprint Developer',
];
const typewriterEl = document.getElementById('typewriter');
let roleIndex = 0, charIndex = 0, deleting = false;

function kickOffTypewriter(){
  typeLoop();
}

function typeLoop(){
  const current = roles[roleIndex];
  if (!deleting) {
    charIndex++;
    typewriterEl.textContent = current.slice(0, charIndex);
    if (charIndex === current.length) {
      deleting = true;
      setTimeout(typeLoop, 1600);
      return;
    }
    setTimeout(typeLoop, 55);
  } else {
    charIndex--;
    typewriterEl.textContent = current.slice(0, charIndex);
    if (charIndex === 0) {
      deleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      setTimeout(typeLoop, 300);
      return;
    }
    setTimeout(typeLoop, 25);
  }
}

/* =========================================================
   SCROLL REVEAL + STAT BAR FILL
========================================================= */
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      entry.target.querySelectorAll('.stat-fill').forEach(fill => {
        const val = fill.getAttribute('data-value') || 0;
        fill.style.width = val + '%';
      });
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealEls.forEach(el => revealObserver.observe(el));

function revealOnLoadHero(){
  // small delay so hero animates right after preloader closes
  setTimeout(() => {
    document.querySelectorAll('.hero .reveal').forEach(el => {
      el.classList.add('in-view');
      el.querySelectorAll('.stat-fill').forEach(fill => {
        const val = fill.getAttribute('data-value') || 0;
        fill.style.width = val + '%';
      });
    });
  }, 150);
}

/* =========================================================
   3D TILT EFFECT ON GAME CARDS
========================================================= */
document.querySelectorAll('.tilt').forEach(card => {
  card.style.perspective = '900px';

  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = ((y / rect.height) - 0.5) * -12;
    const rotateY = ((x / rect.width) - 0.5) * 12;
    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'rotateX(0) rotateY(0) translateY(0)';
  });
});

/* =========================================================
   FOOTER YEAR
========================================================= */
document.getElementById('year').textContent = new Date().getFullYear();

/* =========================================================
   THREE.JS BACKGROUND SCENE
========================================================= */
(function initThree(){
  const canvas = document.getElementById('bg-canvas');
  if (!window.THREE || !canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 18;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  // ---- Particle starfield ----
  const starCount = 900;
  const starGeo = new THREE.BufferGeometry();
  const starPositions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    starPositions[i * 3] = (Math.random() - 0.5) * 70;
    starPositions[i * 3 + 1] = (Math.random() - 0.5) * 70;
    starPositions[i * 3 + 2] = (Math.random() - 0.5) * 70;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  const starMat = new THREE.PointsMaterial({
    color: 0x2fd3d0,
    size: 0.06,
    transparent: true,
    opacity: 0.75,
  });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  // ---- Floating low-poly wireframe shapes (kept subtle & biased to edges so they don't sit on top of text) ----
  const shapes = [];
  const geometries = [
    new THREE.IcosahedronGeometry(1, 0),
    new THREE.OctahedronGeometry(0.9, 0),
    new THREE.TorusKnotGeometry(0.65, 0.2, 64, 8),
    new THREE.TetrahedronGeometry(0.95, 0),
    new THREE.IcosahedronGeometry(0.7, 0),
    new THREE.OctahedronGeometry(0.8, 0),
  ];
  const shapeColors = [0x2fd3d0, 0xff9d3f, 0x8a6bff, 0x2fd3d0, 0xff9d3f, 0x8a6bff];

  geometries.forEach((geo, i) => {
    const mat = new THREE.MeshBasicMaterial({
      color: shapeColors[i % shapeColors.length],
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    });
    const mesh = new THREE.Mesh(geo, mat);
    // bias x toward the left/right margins so shapes stay clear of the centered text column
    const side = Math.random() < 0.5 ? -1 : 1;
    const edgeX = side * (9 + Math.random() * 9);
    mesh.position.set(
      edgeX,
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 10 - 10
    );
    mesh.userData.rotSpeed = {
      x: (Math.random() - 0.5) * 0.006,
      y: (Math.random() - 0.5) * 0.008,
    };
    mesh.userData.floatOffset = Math.random() * Math.PI * 2;
    scene.add(mesh);
    shapes.push(mesh);
  });

  // mouse parallax
  let targetX = 0, targetY = 0;
  window.addEventListener('mousemove', (e) => {
    targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  let t = 0;
  function animate(){
    t += 0.01;

    stars.rotation.y += 0.0006;
    stars.rotation.x += 0.0002;

    shapes.forEach(mesh => {
      mesh.rotation.x += mesh.userData.rotSpeed.x;
      mesh.rotation.y += mesh.userData.rotSpeed.y;
      mesh.position.y += Math.sin(t + mesh.userData.floatOffset) * 0.003;
    });

    camera.position.x += (targetX * 2 - camera.position.x) * 0.03;
    camera.position.y += (-targetY * 2 - camera.position.y) * 0.03;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
})();
