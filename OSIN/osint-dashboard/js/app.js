// js/app.js

window.OSINTApp = {
  init() {
    if (window.OSINTStorage) {
      window.OSINTStorage.initDemoData();
    }
    
    this.setActiveNav();
    this.setupKeyboardShortcuts();
    this.setupTheme();
    this.setupMobileMenu();
    this.setupGlobalSearchBtn();
    this.setupNotificationsBtn();
    this.setupThemeToggleBtn();
  },

  getCurrentPage() {
    const path = window.location.pathname;
    let page = path.split('/').pop().replace('.html', '');
    if (!page || page === 'index') {
      page = 'landing';
    }
    return page;
  },

  setActiveNav() {
    const page = this.getCurrentPage();
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('data-page') === page) {
        link.classList.add('active');
      }
    });
  },

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl+K / Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (window.OSINTUI) window.OSINTUI.showCommandPalette();
      }
      
      // Ctrl+N / Cmd+N
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        this.navigateTo('investigations.html?action=new');
      }

      // Ctrl+S / Cmd+S
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (window.OSINTUI) window.OSINTUI.showToast('Data auto-saved to localStorage', 'success');
      }

      // Ctrl+E / Cmd+E
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        if (window.OSINTStorage && window.OSINTUI) {
          const json = window.OSINTStorage.exportJSON();
          const blob = new Blob([json], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = \`osint-export-\${Date.now()}.json\`;
          a.click();
          window.OSINTUI.showToast('Data exported successfully', 'success');
        }
      }

      // Escape is handled globally by OSINTUI.closeModal() in ui.js where applicable
      if (e.key === 'Escape' && window.OSINTUI) {
        window.OSINTUI.closeModal();
      }
    });
  },

  setupTheme() {
    const theme = localStorage.getItem('osint-theme') || 'dark';
    document.documentElement.dataset.theme = theme;
  },

  toggleTheme() {
    const current = document.documentElement.dataset.theme || 'dark';
    let next = 'dark';
    if (current === 'dark') next = 'light';
    else if (current === 'light') next = 'cyber';
    
    document.documentElement.dataset.theme = next;
    localStorage.setItem('osint-theme', next);
    
    const iconSpan = document.querySelector('#themeToggleBtn span');
    if (iconSpan) {
      if (next === 'dark') iconSpan.textContent = '🌙';
      if (next === 'light') iconSpan.textContent = '☀️';
      if (next === 'cyber') iconSpan.textContent = '⚡';
    }
    
    if (window.OSINTUI) {
      window.OSINTUI.showToast(\`Theme changed to \${next}\`, 'success', 2000);
    }
  },

  setupMobileMenu() {
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    
    if (mobileBtn && navLinks) {
      mobileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        navLinks.classList.toggle('mobile-open');
      });

      // Close menu when clicking link
      navLinks.addEventListener('click', (e) => {
        if (e.target.classList.contains('nav-link')) {
          navLinks.classList.remove('mobile-open');
        }
      });

      // Close on outside click
      document.addEventListener('click', (e) => {
        if (!navLinks.contains(e.target) && e.target !== mobileBtn) {
          navLinks.classList.remove('mobile-open');
        }
      });
    }
  },

  setupGlobalSearchBtn() {
    const btn = document.getElementById('globalSearchBtn');
    if (btn) {
      btn.addEventListener('click', () => {
        if (window.OSINTUI) window.OSINTUI.showGlobalSearch();
      });
    }
  },

  setupNotificationsBtn() {
    const btn = document.getElementById('notificationsBtn');
    if (btn) {
      btn.addEventListener('click', () => {
        if (window.OSINTUI) window.OSINTUI.showNotifications();
      });
    }
  },

  setupThemeToggleBtn() {
    const btn = document.getElementById('themeToggleBtn');
    if (btn) {
      // Set initial icon
      const theme = localStorage.getItem('osint-theme') || 'dark';
      const iconSpan = btn.querySelector('span');
      if (iconSpan) {
        if (theme === 'dark') iconSpan.textContent = '🌙';
        if (theme === 'light') iconSpan.textContent = '☀️';
        if (theme === 'cyber') iconSpan.textContent = '⚡';
      }

      btn.addEventListener('click', () => {
        this.toggleTheme();
      });
    }
  },

  navigateTo(page) {
    window.location.href = page;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  OSINTApp.init();
});
