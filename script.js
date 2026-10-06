const root = document.documentElement;
const intro = document.querySelector('.intro');
const header = document.querySelector('[data-header]');
const hero = document.querySelector('.hero');
const heroMedia = document.querySelector('[data-hero-media]');
const heroContent = document.querySelector('[data-hero-content]');
const menuButton = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

document.getElementById('year').textContent = new Date().getFullYear();

function finishIntro() {
  intro?.classList.add('is-finished');
}

if (reducedMotion.matches) {
  finishIntro();
} else {
  window.addEventListener('load', () => window.setTimeout(finishIntro, 1750), { once: true });
  window.setTimeout(finishIntro, 3200);
}

let ticking = false;
function renderScroll() {
  const scrollY = window.scrollY;
  header.classList.toggle('is-solid', scrollY > 55);

  if (hero && !reducedMotion.matches) {
    const heroHeight = hero.offsetHeight - window.innerHeight;
    const progress = Math.min(1, Math.max(0, scrollY / Math.max(heroHeight, 1)));
    heroMedia.style.setProperty('--hero-scale', (1 + progress * .1).toFixed(3));
    heroMedia.style.setProperty('--hero-opacity', (1 - progress * .42).toFixed(3));
    heroContent.style.setProperty('--hero-content-opacity', Math.max(0, 1 - progress * 2.2).toFixed(3));
    heroContent.style.setProperty('--hero-content-y', `${-progress * 55}px`);
    root.style.setProperty('--hero-reframe-opacity', Math.max(0, (progress - .42) * 1.9).toFixed(3));
    root.style.setProperty('--hero-reframe-y', `${Math.max(0, 30 - progress * 35)}px`);
  }
  ticking = false;
}

window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(renderScroll);
    ticking = true;
  }
}, { passive: true });
renderScroll();

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: .13, rootMargin: '0px 0px -5% 0px' });

const revealElements = [...document.querySelectorAll('.reveal, .image-reveal')];
revealElements.forEach((element) => revealObserver.observe(element));

function revealElementsAlreadyInView() {
  revealElements.forEach((element) => {
    const bounds = element.getBoundingClientRect();
    if (bounds.top < window.innerHeight * 1.08 && bounds.bottom > 0) {
      element.classList.add('is-visible');
      revealObserver.unobserve(element);
    }
  });
}

window.addEventListener('pageshow', revealElementsAlreadyInView);
window.requestAnimationFrame(revealElementsAlreadyInView);

function closeMenu() {
  document.body.classList.remove('menu-open');
  mobileMenu.classList.remove('is-open');
  mobileMenu.setAttribute('aria-hidden', 'true');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open menu');
}

menuButton.addEventListener('click', () => {
  const open = !mobileMenu.classList.contains('is-open');
  document.body.classList.toggle('menu-open', open);
  mobileMenu.classList.toggle('is-open', open);
  mobileMenu.setAttribute('aria-hidden', String(!open));
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
});

mobileMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

const bookingForm = document.getElementById('booking-form');
const bookingMessage = document.querySelector('.booking-message');
const checkin = bookingForm.elements.checkin;
const checkout = bookingForm.elements.checkout;
const today = new Date();
const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split('T')[0];
checkin.min = localToday;
checkout.min = localToday;

checkin.addEventListener('change', () => {
  checkout.min = checkin.value || localToday;
  if (checkout.value && checkout.value <= checkin.value) checkout.value = '';
});

bookingForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!bookingForm.reportValidity()) return;
  if (checkout.value <= checkin.value) {
    bookingMessage.textContent = 'Check-out must be after check-in.';
    checkout.focus();
    return;
  }
  const guests = bookingForm.elements.guests.options[bookingForm.elements.guests.selectedIndex].text;
  bookingMessage.textContent = `Showing the best homes for ${guests} · ${checkin.value} to ${checkout.value}`;
  document.getElementById('stays').scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth' });
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && mobileMenu.classList.contains('is-open')) closeMenu();
});
