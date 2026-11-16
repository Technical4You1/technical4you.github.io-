// Page navigation
function showPage(id) {
  const target = document.getElementById(id);
  if (!target) return;
  document.querySelectorAll('.page').forEach(page => page.classList.toggle('show', page.id === id));
  document.querySelectorAll('.tab-btn').forEach(button => {
    const active = button.dataset.page === id;
    button.classList.toggle('active', active);
    if (active) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
  // Save the current section in the URL so a refresh keeps it
  if (location.hash !== '#' + id) history.replaceState(null, '', '#' + id);
  closeMenu();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Responsive navigation
function toggleMenu() {
  const nav = document.getElementById('mainNav');
  const button = document.querySelector('.menu-toggle');
  const isOpen = nav.classList.toggle('open');
  button.setAttribute('aria-expanded', String(isOpen));
  button.textContent = isOpen ? '×' : '☰';
}

function closeMenu() {
  const nav = document.getElementById('mainNav');
  const button = document.querySelector('.menu-toggle');
  if (!nav || !button) return;
  nav.classList.remove('open');
  button.setAttribute('aria-expanded', 'false');
  button.textContent = '☰';
}

// Expand/collapse premium SOP descriptions
function toggleDetails(button) {
  const details = button.nextElementSibling;
  if (!details) return;
  const isOpen = details.classList.toggle('open');
  button.textContent = isOpen ? 'Hide details −' : 'View details +';
  button.setAttribute('aria-expanded', String(isOpen));
}

// Countdown to the published SAP Business Suite 7 mainstream-maintenance date.
function updateCountdown() {
  const target = new Date('2028-01-01T00:00:00+05:30');
  const remaining = Math.max(0, target.getTime() - Date.now());
  const totalSeconds = Math.floor(remaining / 1000);
  const values = {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60
  };
  Object.entries(values).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) element.textContent = String(value).padStart(2, '0');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Open the section named in the URL (for example #sop), or Home if there is none
  const fromUrl = location.hash.slice(1);
  const startPage = document.getElementById(fromUrl)?.classList.contains('page') ? fromUrl : 'home';
  showPage(startPage);

  updateCountdown();
  window.setInterval(updateCountdown, 1000);
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
});

// ---------------------------------------------------------------
// Animated transparent dot-network background for the hero section
// ---------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  if (getComputedStyle(hero).position === 'static') hero.style.position = 'relative';
  hero.style.overflow = 'hidden';
  hero.style.isolation = 'isolate';

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, {
    position: 'absolute', inset: '0', width: '100%', height: '100%',
    pointerEvents: 'none', zIndex: '-1', background: 'transparent'
  });
  hero.prepend(canvas);

  const ctx = canvas.getContext('2d');
  const labels = ['SAP S/4HANA', 'SAP BTP', 'AI', 'Cloud', 'Automation', 'Enterprise Apps', 'HANA DB', 'Linux'];
  const LINK_DISTANCE = 150;
  let width = 0, height = 0, nodes = [];

  function createNodes() {
    const count = Math.min(60, Math.floor((width * height) / 16000));
    nodes = Array.from({ length: count }, (_, i) => {
      const isHub = i < labels.length;
      return {
        x: Math.random() * width, y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
        hub: isHub, label: isHub ? labels[i] : null, phase: Math.random() * Math.PI * 2
      };
    });
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = hero.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    createNodes();
  }

  function update() {
    nodes.forEach(n => {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > width) n.vx *= -1;
      if (n.y < 0 || n.y > height) n.vy *= -1;
      n.phase += 0.02;
    });
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < LINK_DISTANCE) {
          ctx.strokeStyle = `rgba(90, 160, 255, ${0.35 * (1 - d / LINK_DISTANCE)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    nodes.forEach(n => {
      if (n.hub) {
        const pulse = 1 + Math.sin(n.phase) * 0.15;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 9 * pulse, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 200, 230, 0.35)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(n.x, n.y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 220, 240, 0.95)';
        ctx.shadowColor = 'rgba(0, 220, 240, 0.8)';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.font = '11px system-ui, sans-serif';
        ctx.fillStyle = 'rgba(170, 190, 210, 0.7)';
        ctx.fillText(n.label, n.x - ctx.measureText(n.label).width / 2, n.y + 22);
      } else {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(120, 190, 255, 0.6)';
        ctx.fill();
      }
    });
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 200);
  });

  resize();
  loop();
});



/* ======================================
   LIVE SAP CAREER EXPERIENCE COUNTER
   Career start: 02 November 2023
====================================== */

function updateCareerExperience() {

  // Your actual career starting date
  const startDate = new Date(2023, 10, 2);

  const now = new Date();

  if (now < startDate) return;

  // Calculate completed years
  let years = now.getFullYear() - startDate.getFullYear();

  let cursor = new Date(startDate);
  cursor.setFullYear(startDate.getFullYear() + years);

  if (cursor > now) {
    years--;
    cursor = new Date(startDate);
    cursor.setFullYear(startDate.getFullYear() + years);
  }

  // Calculate completed months
  let months =
    (now.getFullYear() - cursor.getFullYear()) * 12 +
    now.getMonth() - cursor.getMonth();

  let monthCursor = new Date(cursor);
  monthCursor.setMonth(cursor.getMonth() + months);

  if (monthCursor > now) {
    months--;
    monthCursor = new Date(cursor);
    monthCursor.setMonth(cursor.getMonth() + months);
  }

  // Calculate remaining days using calendar dates
  const todayUTC = Date.UTC(
    now.getFullYear(), now.getMonth(), now.getDate()
  );

  const monthUTC = Date.UTC(
    monthCursor.getFullYear(),
    monthCursor.getMonth(),
    monthCursor.getDate()
  );

  const days = Math.floor(
    (todayUTC - monthUTC) / 86400000
  );

  // Update counter
  const yearElement = document.getElementById("careerYears");
  const monthElement = document.getElementById("careerMonths");
  const dayElement = document.getElementById("careerDays");

  if (yearElement) yearElement.textContent = years;
  if (monthElement) monthElement.textContent = months;
  if (dayElement) dayElement.textContent = days;

  // Move graph marker according to current date
  const graphPath = document.getElementById("careerGrowthPath");
  const currentPoint = document.getElementById("careerNowPoint");

  if (graphPath && currentPoint) {

    // Graph covers 02 Nov 2023 through 01 Jan 2028
    const graphEnd = new Date(2028, 0, 1);

    const totalDuration = graphEnd - startDate;
    const elapsedDuration = now - startDate;

    const progress = Math.max(
      0,
      Math.min(1, elapsedDuration / totalDuration)
    );

    const totalLength = graphPath.getTotalLength();
    const position = graphPath.getPointAtLength(
      totalLength * progress
    );

    currentPoint.setAttribute("cx", position.x);
    currentPoint.setAttribute("cy", position.y);
  }
}

// Run immediately and refresh every minute
updateCareerExperience();
setInterval(updateCareerExperience, 60000);

