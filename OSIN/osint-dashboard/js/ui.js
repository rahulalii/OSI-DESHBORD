// js/ui.js

window.OSINTUI = {
  currentModal: null,

  showModal(title, contentHTML, options = {}) {
    this.closeModal();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    
    // Allow closing on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.closeModal();
      }
    });

    const modal = document.createElement('div');
    modal.className = \`modal modal-\${options.size || 'md'}\`;
    modal.style.transform = 'scale(0.9)';
    modal.style.opacity = '0';
    modal.style.transition = 'transform var(--transition-fast), opacity var(--transition-fast)';

    const header = document.createElement('div');
    header.className = 'modal-header';
    header.innerHTML = \`
      <h2 class="modal-title">\${title}</h2>
      <button class="btn-icon close-modal-btn" aria-label="Close">✕</button>
    \`;
    header.querySelector('.close-modal-btn').addEventListener('click', () => this.closeModal());

    const body = document.createElement('div');
    body.className = 'modal-body';
    body.innerHTML = contentHTML;

    modal.appendChild(header);
    modal.appendChild(body);

    if (options.footer) {
      const footer = document.createElement('div');
      footer.className = 'modal-footer';
      footer.innerHTML = options.footer;
      modal.appendChild(footer);
    }

    overlay.appendChild(modal);
    const overlaysContainer = document.getElementById('overlays');
    if(overlaysContainer) {
      overlaysContainer.appendChild(overlay);
    } else {
      document.body.appendChild(overlay);
    }

    this.currentModal = overlay;
    
    if (options.onClose) {
      this.currentModal._onClose = options.onClose;
    }

    // Animate in
    requestAnimationFrame(() => {
      modal.style.transform = 'scale(1)';
      modal.style.opacity = '1';
    });

    return modal;
  },

  closeModal() {
    if (this.currentModal) {
      if (this.currentModal._onClose) {
        this.currentModal._onClose();
      }
      const overlay = this.currentModal;
      const modal = overlay.querySelector('.modal');
      if (modal) {
        modal.style.transform = 'scale(0.9)';
        modal.style.opacity = '0';
      }
      setTimeout(() => {
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
      }, 150);
      this.currentModal = null;
    }
  },

  showToast(message, type = 'info', duration = 3000) {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = \`toast toast-\${type}\`;
    toast.innerHTML = \`
      <span class="toast-message">\${message}</span>
      <button class="btn-icon toast-close">✕</button>
    \`;

    toast.querySelector('.toast-close').addEventListener('click', () => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    });

    container.appendChild(toast);
    
    // Trigger reflow for animation
    toast.offsetHeight;
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(0)';

    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.opacity = '0';
        setTimeout(() => {
          if (toast.parentNode) toast.remove();
        }, 300);
      }
    }, duration);
  },

  confirm(message, title = 'Confirm') {
    return new Promise((resolve) => {
      const footer = \`
        <button class="btn btn-secondary confirm-cancel-btn">Cancel</button>
        <button class="btn btn-primary confirm-ok-btn">Confirm</button>
      \`;
      
      const modal = this.showModal(title, \`<p>\${message}</p>\`, { footer, size: 'sm' });
      
      modal.querySelector('.confirm-cancel-btn').addEventListener('click', () => {
        this.closeModal();
        resolve(false);
      });
      
      modal.querySelector('.confirm-ok-btn').addEventListener('click', () => {
        this.closeModal();
        resolve(true);
      });
    });
  },

  showCommandPalette() {
    this.closeModal();

    const overlay = document.createElement('div');
    overlay.className = 'command-palette-overlay';
    
    const palette = document.createElement('div');
    palette.className = 'command-palette';
    
    const commands = [
      { icon: '📋', text: 'New Investigation', action: () => window.location.href = 'investigations.html?action=new' },
      { icon: '📎', text: 'Add Evidence', action: () => { window.location.href = 'investigations.html?action=new'; this.showToast('Please create or select an investigation first', 'info'); } },
      { icon: '🔍', text: 'Search Sources', action: () => this.showGlobalSearch() },
      { icon: '🕒', text: 'Open Timeline', action: () => window.location.href = 'investigations.html?tab=timeline' },
      { icon: '📄', text: 'Generate Report', action: () => window.location.href = 'reports.html' },
      { icon: '💾', text: 'Export Data', action: () => { 
        const json = window.OSINTStorage.exportJSON();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = \`osint-export-\${Date.now()}.json\`;
        a.click();
        this.showToast('Data exported successfully', 'success');
      }},
      { icon: '⚙️', text: 'Open Settings', action: () => window.location.href = 'settings.html' }
    ];

    palette.innerHTML = \`
      <input type="text" class="command-palette-input" placeholder="Type a command or search..." autofocus>
      <div class="command-list">
        \${commands.map((cmd, i) => \`
          <div class="command-item \${i === 0 ? 'active' : ''}" data-index="\${i}">
            <span class="command-icon">\${cmd.icon}</span>
            <span class="command-text">\${cmd.text}</span>
          </div>
        \`).join('')}
      </div>
    \`;

    overlay.appendChild(palette);
    const overlaysContainer = document.getElementById('overlays');
    if(overlaysContainer) {
      overlaysContainer.appendChild(overlay);
    } else {
      document.body.appendChild(overlay);
    }
    
    this.currentModal = overlay;

    const input = palette.querySelector('.command-palette-input');
    const list = palette.querySelector('.command-list');
    
    input.focus();

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.hideCommandPalette();
    });

    let activeIndex = 0;
    let filteredCommands = [...commands];

    const renderList = () => {
      list.innerHTML = filteredCommands.map((cmd, i) => \`
        <div class="command-item \${i === activeIndex ? 'active' : ''}" data-index="\${i}">
          <span class="command-icon">\${cmd.icon}</span>
          <span class="command-text">\${cmd.text}</span>
        </div>
      \`).join('');
      
      list.querySelectorAll('.command-item').forEach((item) => {
        item.addEventListener('mouseenter', (e) => {
          activeIndex = parseInt(item.getAttribute('data-index'));
          renderList();
        });
        item.addEventListener('click', () => {
          const idx = parseInt(item.getAttribute('data-index'));
          this.hideCommandPalette();
          filteredCommands[idx].action();
        });
      });
    };
    
    input.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      filteredCommands = commands.filter(c => c.text.toLowerCase().includes(q));
      activeIndex = 0;
      renderList();
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeIndex = (activeIndex + 1) % filteredCommands.length;
        renderList();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeIndex = (activeIndex - 1 + filteredCommands.length) % filteredCommands.length;
        renderList();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[activeIndex]) {
          this.hideCommandPalette();
          filteredCommands[activeIndex].action();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.hideCommandPalette();
      }
    });
  },

  hideCommandPalette() {
    this.closeModal();
  },

  showGlobalSearch() {
    this.closeModal();
    const overlay = document.createElement('div');
    overlay.className = 'command-palette-overlay modal-overlay';
    
    const searchContainer = document.createElement('div');
    searchContainer.className = 'command-palette'; // reuse styling
    
    searchContainer.innerHTML = \`
      <input type="text" class="command-palette-input" placeholder="Search across all data..." autofocus>
      <div class="command-list" id="globalSearchResults"></div>
    \`;

    overlay.appendChild(searchContainer);
    const overlaysContainer = document.getElementById('overlays');
    if(overlaysContainer) {
      overlaysContainer.appendChild(overlay);
    } else {
      document.body.appendChild(overlay);
    }
    
    this.currentModal = overlay;

    const input = searchContainer.querySelector('.command-palette-input');
    const resultsContainer = searchContainer.querySelector('#globalSearchResults');
    
    input.focus();

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.closeModal();
    });
    
    input.addEventListener('input', (e) => {
      const q = e.target.value.trim();
      if (!q) {
        resultsContainer.innerHTML = '';
        return;
      }
      
      const results = window.OSINTStorage.searchAll(q);
      
      if (results.length === 0) {
        resultsContainer.innerHTML = '<div class="command-item"><span class="command-text text-muted">No results found.</span></div>';
        return;
      }
      
      resultsContainer.innerHTML = results.map(r => \`
        <div class="command-item" onclick="OSINTUI.closeModal(); window.location.href='investigations.html'">
          <span class="badge badge-info" style="margin-right:8px; font-size:10px;">\${r.type}</span>
          <span class="command-text">\${r.matchField}</span>
        </div>
      \`).join('');
    });
    
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        this.closeModal();
      }
    });
  },

  animateCounter(element, targetStr, duration = 1500, suffix = '') {
    let target = parseFloat(targetStr);
    let isPercentage = String(targetStr).includes('%');
    if (isNaN(target)) return;

    let start = 0;
    let startTime = null;

    const step = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentVal = Math.floor(ease * target);
      
      const displaySuffix = isPercentage ? '%' : suffix;
      element.textContent = currentVal + displaySuffix;
      
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        element.textContent = target + displaySuffix;
      }
    };
    
    requestAnimationFrame(step);
  },

  createElement(tag, className, innerHTML = '') {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (innerHTML) el.innerHTML = innerHTML;
    return el;
  },

  showNotifications() {
    // A simplified notification dropdown popup
    const existing = document.querySelector('.notification-dropdown');
    if (existing) {
      existing.remove();
      return;
    }

    const dropdown = document.createElement('div');
    dropdown.className = 'notification-dropdown card';
    dropdown.style.position = 'absolute';
    dropdown.style.top = '60px';
    dropdown.style.right = '80px';
    dropdown.style.width = '300px';
    dropdown.style.zIndex = '1000';
    dropdown.style.boxShadow = 'var(--shadow-lg)';
    
    dropdown.innerHTML = \`
      <div class="card-header" style="padding-bottom: 12px; border-bottom: 1px solid var(--card-border); margin-bottom: 8px;">
        <h4 style="margin:0;">Notifications</h4>
      </div>
      <div class="notification-list" style="display:flex; flex-direction:column; gap:8px;">
        <div style="padding: 8px; border-radius: var(--radius-sm); background: var(--bg-secondary);">
          <div style="font-size: 13px; font-weight: 500;">Investigation OSINT-2026-001 updated</div>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">5 min ago</div>
        </div>
        <div style="padding: 8px; border-radius: var(--radius-sm); background: var(--bg-secondary);">
          <div style="font-size: 13px; font-weight: 500;">New evidence added</div>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">15 min ago</div>
        </div>
        <div style="padding: 8px; border-radius: var(--radius-sm); background: var(--bg-secondary);">
          <div style="font-size: 13px; font-weight: 500;">Report generated successfully</div>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">1 hour ago</div>
        </div>
      </div>
    \`;

    document.body.appendChild(dropdown);

    // Click outside to close
    setTimeout(() => {
      if (this._closeDropdownHandler) {
        document.removeEventListener('click', this._closeDropdownHandler);
      }
      this._closeDropdownHandler = (e) => {
        if (!dropdown.contains(e.target)) {
          dropdown.remove();
          document.removeEventListener('click', this._closeDropdownHandler);
          this._closeDropdownHandler = null;
        }
      };
      document.addEventListener('click', this._closeDropdownHandler);
    }, 10);
  }
};
