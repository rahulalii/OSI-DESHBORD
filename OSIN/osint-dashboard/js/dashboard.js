/**
 * Dashboard specific JavaScript
 */

document.addEventListener('DOMContentLoaded', initDashboard);

function initDashboard() {
  updateLastUpdated();
  setupCounterAnimations();
  loadRecentActivity();
  loadActiveInvestigations();
  setupQuickActions();
  setupDemoBanner();
  
  // Refresh button
  const refreshBtn = document.getElementById('refreshBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      refreshBtn.querySelector('span').style.display = 'inline-block';
      refreshBtn.querySelector('span').style.transform = 'rotate(360deg)';
      refreshBtn.querySelector('span').style.transition = 'transform 0.5s ease';
      
      setTimeout(() => {
        refreshBtn.querySelector('span').style.transform = 'none';
        refreshBtn.querySelector('span').style.transition = 'none';
        updateLastUpdated();
        loadRecentActivity();
        loadActiveInvestigations();
        // Optional: show a toast
        if (window.OSINTUI) {
          OSINTUI.showToast('Dashboard data refreshed', 'success', 2000);
        }
      }, 600);
    });
  }
}

function updateLastUpdated() {
  const el = document.getElementById('lastUpdated');
  if (el) {
    const now = new Date();
    el.textContent = `Last updated: ${now.toLocaleTimeString()}`;
  }
}

function setupCounterAnimations() {
  const counters = document.querySelectorAll('.stat-value[data-target]');
  counters.forEach((counter, index) => {
    const target = parseInt(counter.getAttribute('data-target'), 10);
    const suffix = counter.getAttribute('data-suffix') || '';
    
    setTimeout(() => {
      if (window.OSINTUI && OSINTUI.animateCounter) {
        OSINTUI.animateCounter(counter, target, 1500, suffix);
      } else {
        // Fallback animation if OSINTUI is missing
        animateCounterFallback(counter, target, 1500, suffix);
      }
    }, index * 100);
  });
}

function animateCounterFallback(element, target, duration, suffix) {
  let start = 0;
  const increment = target / (duration / 16);
  
  const timer = setInterval(() => {
    start += increment;
    if (start >= target) {
      clearInterval(timer);
      element.innerText = target + suffix;
    } else {
      element.innerText = Math.floor(start) + suffix;
    }
  }, 16);
}

function loadRecentActivity() {
  const container = document.getElementById('recentActivityTimeline');
  if (!container) return;
  
  // Clear existing
  container.innerHTML = '';
  
  let timeline = OSINTStorage.getTimeline() || [];
  
  // Create timeline HTML
  timeline.slice(0, 6).forEach(item => {
    const timeAgo = getRelativeTime(item.time);
    const icon = getTypeIcon(item.type);
    
    const div = document.createElement('div');
    div.className = 'timeline-item';
    div.innerHTML = `
      <div class="timeline-dot" style="background: var(--accent); display: flex; align-items: center; justify-content: center; font-size: 0.8rem;">
        ${icon}
      </div>
      <div class="timeline-content">
        <div class="timeline-time">${timeAgo}</div>
        <div class="timeline-title">${item.title}</div>
        <div style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 4px;">${item.description}</div>
      </div>
    `;
    container.appendChild(div);
  });
}

function loadActiveInvestigations() {
  const container = document.getElementById('activeInvestigationsList');
  if (!container) return;
  
  container.innerHTML = '';
  
  // Fallback demo data
  const demoInvs = [
    { id: 'OSINT-2026-001', name: 'Project Phantom — Digital Footprint', status: 'active', priority: 'high', date: '2026-09-25' },
    { id: 'OSINT-2026-002', name: 'Corporate Espionage Tracing', status: 'pending', priority: 'critical', date: '2026-09-20' },
    { id: 'OSINT-2026-003', name: 'Dark Web Vendor Identification', status: 'active', priority: 'medium', date: '2026-09-15' }
  ];
  
  let investigations = demoInvs;
  if (window.OSINTStorage && typeof OSINTStorage.getInvestigations === 'function') {
    const stored = OSINTStorage.getInvestigations();
    if (stored && stored.length > 0) {
      investigations = stored;
    }
  }
  
  investigations.slice(0, 4).forEach(inv => {
    const statusClass = inv.status === 'active' ? 'badge-success' : (inv.status === 'pending' ? 'badge-warning' : 'badge-neutral');
    const priorityClass = inv.priority === 'critical' ? 'badge-danger' : (inv.priority === 'high' ? 'badge-warning' : 'badge-info');
    
    const row = document.createElement('div');
    row.className = 'investigation-row';
    row.onclick = () => window.location.href = `investigations.html?id=${inv.id}`;
    
    row.innerHTML = `
      <div class="inv-details">
        <h4>${inv.name}</h4>
        <p>${inv.id} • Updated ${inv.dateCreated || inv.dateModified || 'N/A'}</p>
      </div>
      <div class="inv-badges">
        <span class="badge ${priorityClass}">${(inv.priority || 'medium').toUpperCase()}</span>
        <span class="badge ${statusClass}">${(inv.status || 'active').toUpperCase()}</span>
      </div>
    `;
    
    container.appendChild(row);
  });
}

function setupQuickActions() {
  const btnAddEvidence = document.getElementById('qaAddEvidence');
  if (btnAddEvidence) {
    btnAddEvidence.addEventListener('click', () => {
      if (window.OSINTUI) {
        const formHtml = `
          <div class="form-group">
            <label class="form-label">Evidence Type</label>
            <select class="form-select" id="qaEvidenceType" style="width:100%; padding: 8px; margin-bottom: 16px;">
              <option>Website</option>
              <option>Social Profile</option>
              <option>Document</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Source URL / Value</label>
            <input type="text" id="qaEvidenceSource" class="form-input" style="width:100%; padding: 8px; margin-bottom: 16px;" placeholder="https://...">
          </div>
          <div class="form-group">
            <label class="form-label">Notes</label>
            <textarea id="qaEvidenceNotes" class="form-input" style="width:100%; padding: 8px; height: 80px;"></textarea>
          </div>
          <div style="text-align: right; margin-top: 16px;">
            <button class="btn btn-primary" id="qaSaveEvidenceBtn">Save Evidence</button>
          </div>
        `;
        const modal = OSINTUI.showModal('Add New Evidence', formHtml);
        const saveBtn = modal.querySelector('#qaSaveEvidenceBtn');
        if (saveBtn) {
          saveBtn.addEventListener('click', () => {
            const type = modal.querySelector('#qaEvidenceType').value;
            const source = modal.querySelector('#qaEvidenceSource').value;
            const notes = modal.querySelector('#qaEvidenceNotes').value;
            
            if (!source) {
              OSINTUI.showToast('Source is required', 'error');
              return;
            }
            
            const newEv = {
              id: OSINTStorage.generateId('EVD'),
              type,
              source,
              notes,
              date: new Date().toISOString(),
              status: 'pending',
              confidence: 'medium'
            };
            OSINTStorage.saveEvidence(newEv);
            OSINTUI.closeModal();
            OSINTUI.showToast('Evidence added successfully', 'success', 3000);
          });
        }
      }
    });
  }
  
  const btnExport = document.getElementById('qaExportData');
  if (btnExport) {
    btnExport.addEventListener('click', () => {
      if (window.OSINTStorage && typeof OSINTStorage.exportJSON === 'function') {
        const jsonStr = OSINTStorage.exportJSON();
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'osint-export.json';
        a.click();
        URL.revokeObjectURL(url);
        if (window.OSINTUI) OSINTUI.showToast('Data exported successfully', 'success', 3000);
      } else {
        // Fallback simulation
        if (window.OSINTUI) OSINTUI.showToast('Exporting data...', 'info', 2000);
        setTimeout(() => {
          if (window.OSINTUI) OSINTUI.showToast('Data exported successfully', 'success', 3000);
        }, 1000);
      }
    });
  }
}

function setupDemoBanner() {
  const banner = document.getElementById('demoBanner');
  const dismissBtn = document.getElementById('dismissBannerBtn');
  
  if (banner && dismissBtn) {
    // Check if previously dismissed
    if (sessionStorage.getItem('demoBannerDismissed') === 'true') {
      banner.style.display = 'none';
    }
    
    dismissBtn.addEventListener('click', () => {
      banner.style.opacity = '0';
      banner.style.transition = 'opacity 0.3s ease';
      setTimeout(() => {
        banner.style.display = 'none';
        sessionStorage.setItem('demoBannerDismissed', 'true');
      }, 300);
    });
  }
}

// Helpers
function getRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
}

function getTypeIcon(type) {
  switch(type) {
    case 'verified': return '✅';
    case 'finding': return '🔍';
    case 'source': return '📡';
    case 'evidence': return '📎';
    case 'milestone': return '🚩';
    default: return '🔹';
  }
}
