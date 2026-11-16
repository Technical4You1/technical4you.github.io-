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

/* ======================================
   LIVE SAP CAREER EXPERIENCE COUNTER + GRAPH MARKER
   Career start: 02 November 2023
====================================== */
function updateCareerExperience() {
  const start = new Date(2023, 10, 2);
  const graphEnd = new Date(2028, 0, 1);
  const now = new Date();

  // Years / months / days since the start date
  if (now >= start) {
    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();
    let days = now.getDate() - start.getDate();

    if (days < 0) {
      months--;
      days += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); // days in previous month
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    const y = document.getElementById('careerYears');
    const m = document.getElementById('careerMonths');
    const d = document.getElementById('careerDays');
    if (y) y.textContent = years;
    if (m) m.textContent = months;
    if (d) d.textContent = days;
  }

  // Move the marker along the graph line according to today's date
  const path = document.getElementById('careerGrowthPath');
  const marker = document.getElementById('careerNowPoint');
  if (!path || !marker) return;

  const totalLength = path.getTotalLength();
  if (!totalLength) return; // tab hidden; it will run again when the tab opens

  const progress = Math.max(0, Math.min(1, (now - start) / (graphEnd - start)));
  const X_START = 35, X_END = 490;               // graph start and end on the x-axis
  const targetX = X_START + progress * (X_END - X_START);

  // Find the point on the line that matches the date position
  let low = 0, high = totalLength;
  for (let i = 0; i < 24; i++) {
    const mid = (low + high) / 2;
    if (path.getPointAtLength(mid).x < targetX) low = mid; else high = mid;
  }
  const point = path.getPointAtLength(high);
  marker.setAttribute('cx', point.x);
  marker.setAttribute('cy', point.y);
}

document.addEventListener('DOMContentLoaded', () => {
  updateCareerExperience();
  setInterval(updateCareerExperience, 60000);

  // Recalculate when the Experience tab is opened
  document.addEventListener('click', e => {
    if (e.target.closest('.tab-btn, .text-link, .btn')) {
      setTimeout(updateCareerExperience, 80);
    }
  });
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

