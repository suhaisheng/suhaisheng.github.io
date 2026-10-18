function initThemeToggle() {
  const toggle = document.querySelector('.theme-toggle');
  if (!toggle) return;

  const applyTheme = (isDark) => {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }

    toggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    toggle.setAttribute('aria-pressed', String(isDark));
    toggle.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
  };

  applyTheme(document.documentElement.getAttribute('data-theme') === 'dark');

  toggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    applyTheme(!isDark);
  });
}

function initNewsToggle() {
  const list = document.getElementById('news-list');
  const toggle = document.getElementById('news-toggle');
  if (!list || !toggle) return;

  const visibleCount = 10;
  const items = Array.from(list.querySelectorAll(':scope > .news-item'));
  if (items.length <= visibleCount) return;

  const label = toggle.querySelector('.news-toggle-label');
  const icon = toggle.querySelector('.news-toggle-icon');

  const setExpanded = (expanded) => {
    items.forEach((item, index) => {
      item.hidden = !expanded && index >= visibleCount;
    });

    toggle.setAttribute('aria-expanded', String(expanded));
    label.textContent = expanded ? 'Show less' : 'Earlier News';
    icon.textContent = expanded ? '↑' : '↓';
  };

  toggle.hidden = false;
  setExpanded(false);

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    setExpanded(!expanded);

    if (expanded) {
      document.getElementById('news')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initNewsToggle();

  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen);
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-links a');

  if (sections.length && navItems.length) {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navItems.forEach(item => {
              item.style.color = item.getAttribute('href') === `#${id}`
                ? 'var(--color-accent)'
                : '';
            });
          }
        });
      },
      { rootMargin: '-30% 0px -60% 0px' }
    );

    sections.forEach(section => observer.observe(section));
  }
});
