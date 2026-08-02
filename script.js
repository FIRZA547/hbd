/* =========================================================
   HAPPY BIRTHDAY WEBSITE — SCRIPT.JS
   Semua interaksi: navigasi halaman, countdown, confetti,
   surat cinta (typewriter), musik, cursor, background ambient.
========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  
  const birthdayDate = new Date('2026-08-13T00:00:00');

  /* ============ 1. LOADING SCREEN ============ */
  const loadingScreen = document.getElementById('loading-screen');
  window.addEventListener('load', () => {
    setTimeout(() => {
      loadingScreen.classList.add('fade-out');
    }, 2200); // tampil 2-3 detik
  });
  // fallback jika 'load' sudah lewat
  setTimeout(() => loadingScreen.classList.add('fade-out'), 3500);

  /* ============ 2. CUSTOM CURSOR (heart) ============ */
  const cursor = document.getElementById('custom-cursor');
  window.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  });
  document.addEventListener('mousedown', () => cursor.classList.add('grow'));
  document.addEventListener('mouseup', () => cursor.classList.remove('grow'));
  document.querySelectorAll('button, a, .dot, input[type="range"]').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('grow'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('grow'));
  });

  /* ============ 3. AMBIENT FLOATING HEARTS & SPARKLES ============ */
  const ambientBg = document.getElementById('ambient-bg');
  const HEART_CHARS = ['❤','💕','💗','🤍'];
  const SPARKLE_CHARS = ['✦','✧','⋆','•'];

  function spawnFloaty(type){
    const el = document.createElement('span');
    el.className = 'floaty ' + type;
    el.textContent = type === 'heart'
      ? HEART_CHARS[Math.floor(Math.random() * HEART_CHARS.length)]
      : SPARKLE_CHARS[Math.floor(Math.random() * SPARKLE_CHARS.length)];

    const left = Math.random() * 100;
    const size = type === 'heart' ? (12 + Math.random() * 16) : (6 + Math.random() * 8);
    const duration = 10 + Math.random() * 10;
    const drift = (Math.random() * 160 - 80) + 'px';

    el.style.left = left + 'vw';
    el.style.setProperty('--size', size + 'px');
    el.style.setProperty('--drift', drift);
    el.style.animationDuration = duration + 's';

    ambientBg.appendChild(el);
    setTimeout(() => el.remove(), duration * 1000 + 500);
  }

  setInterval(() => spawnFloaty('heart'), 900);
  setInterval(() => spawnFloaty('sparkle'), 500);
  for (let i = 0; i < 8; i++) setTimeout(() => spawnFloaty('heart'), i * 300);

  /* ============ 4. PAGE / SLIDE NAVIGATION ============ */
  const pages = Array.from(document.querySelectorAll('.page'));
  const totalPages = pages.length;
  let currentPage = 0;

  const dots = Array.from(document.querySelectorAll('.dot'));
  const navPrev = document.getElementById('nav-prev');
  const navNext = document.getElementById('nav-next');
  const navCurrent = document.getElementById('nav-current');
  const progressFill = document.getElementById('page-progress-fill');

  function revealChildren(page){
    const items = page.querySelectorAll('.reveal');
    items.forEach((el, i) => {
      el.classList.remove('in');
      // stagger reveal
      setTimeout(() => el.classList.add('in'), 120 + i * 90);
    });
  }

  function goToPage(index, opts = {}){
    index = Math.max(0, Math.min(totalPages - 1, index));
    if (index === currentPage && !opts.force) return;

    const direction = index > currentPage ? 'right' : 'left';

    pages.forEach((p, i) => {
      p.classList.remove('active', 'leaving-left', 'leaving-right');
      if (i === currentPage && i !== index) {
        p.classList.add(direction === 'right' ? 'leaving-left' : 'leaving-right');
      }
    });

    currentPage = index;
    const activePage = pages[currentPage];
    activePage.classList.add('active');
    activePage.scrollTop = 0;

    dots.forEach((d, i) => d.classList.toggle('active', i === currentPage));
    navCurrent.textContent = currentPage + 1;
    navPrev.disabled = currentPage === 0;
    navNext.disabled = currentPage === totalPages - 1;
    progressFill.style.width = ((currentPage + 1) / totalPages * 100) + '%';

    revealChildren(activePage);

    // trigger page-specific logic
    if (currentPage === 1) startCountdown();
    if (currentPage === 7) initTimelineObserver();
  }

  navPrev.addEventListener('click', () => goToPage(currentPage - 1));
  navNext.addEventListener('click', () => goToPage(currentPage + 1));
  dots.forEach(dot => {
    dot.addEventListener('click', () => goToPage(parseInt(dot.dataset.goto, 10)));
  });

  document.getElementById('open-gift-btn').addEventListener('click', () => goToPage(1));

  // keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') goToPage(currentPage + 1);
    if (e.key === 'ArrowLeft') goToPage(currentPage - 1);
  });

  // basic swipe support (mobile)
  let touchStartX = 0;
  document.getElementById('stage').addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  document.getElementById('stage').addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].screenX - touchStartX;
    if (Math.abs(dx) > 60) {
      if (dx < 0) goToPage(currentPage + 1); else goToPage(currentPage - 1);
    }
  }, { passive: true });

  // init first page
  goToPage(0, { force: true });

  /* ============ 5. COUNTDOWN ============ */
  let countdownInterval = null;
  const cdDays = document.getElementById('cd-days');
  const cdHours = document.getElementById('cd-hours');
  const cdMinutes = document.getElementById('cd-minutes');
  const cdSeconds = document.getElementById('cd-seconds');
  const countdownWrap = document.getElementById('countdown-wrap');
  const countdownFinished = document.getElementById('countdown-finished');
  let confettiFired = false;

  function pad(n){ return String(n).padStart(2, '0'); }

  function startCountdown(){
    if (countdownInterval) return; // already running
    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
  }

  function updateCountdown(){
    const now = new Date();
    const diff = birthdayDate - now;

    if (diff <= 0) {
      clearInterval(countdownInterval);
      countdownInterval = null;
      countdownWrap.classList.add('hidden');
      countdownFinished.classList.remove('hidden');
      if (!confettiFired) {
        confettiFired = true;
        fireConfetti();
      }
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    cdDays.textContent = pad(days);
    cdHours.textContent = pad(hours);
    cdMinutes.textContent = pad(minutes);
    cdSeconds.textContent = pad(seconds);
  }

  /* ============ 6. CONFETTI ============ */
  const confettiCanvas = document.getElementById('confetti-canvas');
  const ctx = confettiCanvas.getContext('2d');
  let confettiParticles = [];
  let confettiAnimId = null;

  function resizeConfettiCanvas(){
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeConfettiCanvas);
  resizeConfettiCanvas();

  const CONFETTI_COLORS = ['#ff4f9a', '#ff85c1', '#ffd6e8', '#ffffff'];

  function fireConfetti(){
    confettiCanvas.style.display = 'block';
    confettiParticles = [];
    const count = 160;
    for (let i = 0; i < count; i++) {
      confettiParticles.push({
        x: Math.random() * confettiCanvas.width,
        y: -20 - Math.random() * confettiCanvas.height * 0.5,
        w: 6 + Math.random() * 6,
        h: 10 + Math.random() * 8,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        speedY: 2 + Math.random() * 3,
        speedX: (Math.random() - 0.5) * 2,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
      });
    }
    let elapsed = 0;
    const duration = 6000;
    const start = performance.now();

    function frame(now){
      elapsed = now - start;
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      confettiParticles.forEach(p => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotationSpeed;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation * Math.PI / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      if (elapsed < duration) {
        confettiAnimId = requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        confettiCanvas.style.display = 'none';
      }
    }
    confettiAnimId = requestAnimationFrame(frame);
  }

  /* ============ 7. LOVE LETTER (envelope + typewriter) ============ */
  const envelope = document.getElementById('envelope');
  const openLetterBtn = document.getElementById('open-letter-btn');
  const typewriterText = document.getElementById('typewriter-text');
  const letterSignature = document.getElementById('letter-signature');

  const letterContent = `Nggak kerasa sekarang kamu udah 23 tahunn, yesss akhirnya seumuran kitaaa 🤍. Semoga di umur yang baru ini, semua hal baik selalu dateng ke kamu. Semoga Allah selalu mudahin setiap langkah kamu, semua mimpi dan cita-cita kamu satu per satu tercapai, rezekinya makin lancar, makin melimpah, dan penuh berkah.

Semoga kamu selalu dikasih kesehatan, hati yang selalu bahagia, badan yang makin sehat, makin strong, dan makin semangat ngejar semua impian kamu. Tetap jadi perempuan hebat, baik hati, penyayang, dan selalu jadi kebanggaan Mama, Papa, sama Ade. Jangan lupa juga yaa, nggak boleh bandel hihii. 🤏🏻

Aku juga berdoa semoga kamu selalu dikelilingi orang-orang yang tulus, dijauhkan dari semua rasa sedih dan kecewa, dan selalu diberi kebahagiaan yang nggak ada habisnya. Kalau suatu saat kamu capek atau lagi ngerasa dunia nggak berpihak sama kamu, inget yaa... ada aku yang bakal selalu ada buat dengerin semua cerita kamu, nemenin kamu, dan jadi orang yang selalu percaya sama kamu. ❤️

Terakhir... semoga kamu makin sayang, makin cinta, makin lengket, dan nggak pernah bosen sama akuu yaa. Hehe. Terima kasih yaa udah hadir di hidup aku dan bikin hari-hari aku jadi jauh lebih berwarna. Semoga kita bisa terus tumbuh bareng, saling nemenin, saling dukung, dan semoga suatu hari nanti aku masih jadi orang yang selalu ada buat ngerayain ulang tahun kamu setiap tahunnya. 🤍

I love you more than yesterday, and I'll love you even more tomorrow. Selamat ulang tahun, perempuan favoritku, perempuan yang paling aku sayang. Semoga tahun ini jadi tahun yang paling indah buat kamu. ❤️🎂🎁`;

  let typewriterStarted = false;

  function startTypewriter(){
    if (typewriterStarted) return;
    typewriterStarted = true;
    let i = 0;
    typewriterText.textContent = '';
    const speed = 28;

    function typeChar(){
      if (i < letterContent.length) {
        typewriterText.textContent += letterContent.charAt(i);
        i++;
        setTimeout(typeChar, speed);
      } else {
        letterSignature.classList.remove('hidden');
      }
    }
    typeChar();
  }

  openLetterBtn.addEventListener('click', () => {
    envelope.classList.add('open');
    openLetterBtn.disabled = true;
    openLetterBtn.style.opacity = '0.5';
    setTimeout(startTypewriter, 900);
  });

  /* ============ 8. TIMELINE SCROLL REVEAL ============ */
  let timelineObserverInitialized = false;
  function initTimelineObserver(){
    if (timelineObserverInitialized) return;
    timelineObserverInitialized = true;
    const items = document.querySelectorAll('.timeline-item');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('in');
      });
    }, { threshold: 0.2, root: document.getElementById('page-7') });
    items.forEach(item => observer.observe(item));
  }

  /* ============ 9. BACKGROUND MUSIC ============ */
  const bgMusic = document.getElementById('bg-music');
  const musicToggle = document.getElementById('music-toggle');
  const musicVolume = document.getElementById('music-volume');
  bgMusic.volume = 0.5;

  function tryAutoplay(){
    const p = bgMusic.play();
    if (p !== undefined) {
      p.then(() => musicToggle.classList.add('playing'))
       .catch(() => {
          // autoplay diblokir browser — tunggu interaksi pertama
          const resumeOnInteract = () => {
            bgMusic.play().then(() => musicToggle.classList.add('playing')).catch(()=>{});
            window.removeEventListener('click', resumeOnInteract);
            window.removeEventListener('touchstart', resumeOnInteract);
          };
          window.addEventListener('click', resumeOnInteract, { once: true });
          window.addEventListener('touchstart', resumeOnInteract, { once: true });
       });
    }
  }
  window.addEventListener('load', tryAutoplay);

  musicToggle.addEventListener('click', () => {
    if (bgMusic.paused) {
      bgMusic.play();
      musicToggle.classList.add('playing');
    } else {
      bgMusic.pause();
      musicToggle.classList.remove('playing');
    }
  });

  musicVolume.addEventListener('input', (e) => {
    bgMusic.volume = parseFloat(e.target.value);
  });

  /* ============ 10. BACK TO TOP (scroll current page to top) ============ */
  const backToTopBtn = document.getElementById('back-to-top');

  function checkScrollForBackToTop(){
    const activePage = pages[currentPage];
    if (activePage.scrollTop > 300) {
      backToTopBtn.classList.add('show');
    } else {
      backToTopBtn.classList.remove('show');
    }
  }

  pages.forEach(page => {
    page.addEventListener('scroll', checkScrollForBackToTop);
  });

  backToTopBtn.addEventListener('click', () => {
    pages[currentPage].scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ============ 11. GENERIC SCROLL-REVEAL FOR LONG PAGES ============ */
  // (wish letter paragraphs, gallery grid, video grid) — reveal as user scrolls within a page
  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('in');
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal').forEach(el => scrollObserver.observe(el));

});
