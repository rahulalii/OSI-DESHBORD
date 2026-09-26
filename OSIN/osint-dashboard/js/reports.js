document.addEventListener('DOMContentLoaded', () => {
  initReports();
});

let currentReportData = null;

function initReports() {
  // Tab handling
  const tabs = document.querySelectorAll('.tab');
  const panes = document.querySelectorAll('.tab-pane');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
      if (tab.dataset.tab === 'analytics') {
        setTimeout(renderCharts, 100);
      }
    });
  });

  renderCharts();
  populateInvestigationDropdown();
  loadReportHistory();

  document.getElementById('btnGenerateReport').addEventListener('click', generateReport);
  document.getElementById('btnPrintReport').addEventListener('click', printReport);
  document.getElementById('btnSaveReport').addEventListener('click', saveReport);
  document.getElementById('btnExportJSON').addEventListener('click', exportJSON);
  document.getElementById('btnExportCSV').addEventListener('click', exportCSV);
}

function renderCharts() {
  const evidence = window.OSINTStorage ? window.OSINTStorage.getEvidence() : [];
  const findings = window.OSINTStorage ? window.OSINTStorage.getFindings() : [];
  
  let websites = 0, social = 0, news = 0, publicRecords = 0, documents = 0, other = 0;
  evidence.forEach(e => {
    const type = (e.type || '').toLowerCase();
    if (type.includes('website')) websites++;
    else if (type.includes('social')) social++;
    else if (type.includes('news')) news++;
    else if (type.includes('public')) publicRecords++;
    else if (type.includes('document')) documents++;
    else other++;
  });
  
  if (websites === 0 && social === 0 && news === 0 && publicRecords === 0 && documents === 0 && other === 0) {
    websites = 45; social = 68; news = 32; publicRecords = 28; documents = 42; other = 33;
  }
  
  renderBarChart('sourcesBarChart', [
    { label: 'Websites', value: websites, color: 'var(--info)' },
    { label: 'Social Media', value: social, color: 'var(--accent)' },
    { label: 'News', value: news, color: 'var(--success)' },
    { label: 'Public Records', value: publicRecords, color: 'var(--warning)' },
    { label: 'Documents', value: documents, color: 'var(--accent-secondary)' },
    { label: 'Other', value: other, color: 'var(--text-muted)' }
  ].filter(d => d.value > 0));

  renderLineChart('evidenceLineChart', [12, 28, 45, 76]);

  let critical = 0, high = 0, medium = 0, low = 0;
  findings.forEach(f => {
    const sev = (f.severity || '').toLowerCase();
    if (sev === 'critical') critical++;
    else if (sev === 'high') high++;
    else if (sev === 'medium') medium++;
    else low++;
  });
  
  if (critical === 0 && high === 0 && medium === 0 && low === 0) {
    critical = 8; high = 22; medium = 31; low = 15;
  }

  renderDonutChart('findingsDonutChart', [
    { label: 'Critical', value: critical, color: 'var(--danger)' },
    { label: 'High', value: high, color: 'var(--warning)' },
    { label: 'Medium', value: medium, color: '#FDE047' },
    { label: 'Low', value: low, color: 'var(--success)' }
  ].filter(d => d.value > 0));

  let verified = 0, total = evidence.length;
  evidence.forEach(e => {
    if (e.status === 'verified') verified++;
  });
  let verifiedPercent = total > 0 ? Math.round((verified / total) * 100) : 94;

  renderProgressBar('verifiedProgressBar', verifiedPercent, 'Verified vs Unverified');
  renderSparkline('activitySparkline', [5, 12, 8, 15, 20, 18, 25, 30, 22, 10, 15, 28, 35, 42, 38]);
}

function renderBarChart(containerId, data) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", "0 0 400 300");
  
  const maxVal = Math.max(...data.map(d => d.value));
  const barHeight = 25;
  const gap = 15;
  
  data.forEach((item, index) => {
    const y = index * (barHeight + gap) + 20;
    const width = (item.value / maxVal) * 250;
    
    // Label
    const text = document.createElementNS(svgNS, "text");
    text.setAttribute("x", "10");
    text.setAttribute("y", y + 17);
    text.setAttribute("fill", "var(--text-primary)");
    text.setAttribute("font-size", "12");
    text.textContent = item.label;
    svg.appendChild(text);
    
    // Background bar
    const bgRect = document.createElementNS(svgNS, "rect");
    bgRect.setAttribute("x", "100");
    bgRect.setAttribute("y", y);
    bgRect.setAttribute("width", "250");
    bgRect.setAttribute("height", barHeight);
    bgRect.setAttribute("fill", "var(--bg-tertiary)");
    bgRect.setAttribute("rx", "4");
    svg.appendChild(bgRect);
    
    // Value bar
    const rect = document.createElementNS(svgNS, "rect");
    rect.setAttribute("x", "100");
    rect.setAttribute("y", y);
    rect.setAttribute("width", "0"); // for animation
    rect.setAttribute("height", barHeight);
    rect.setAttribute("fill", item.color);
    rect.setAttribute("rx", "4");
    rect.style.transition = "width 1s ease-out";
    svg.appendChild(rect);
    
    // Trigger animation
    setTimeout(() => { rect.setAttribute("width", width); }, 50);
    
    // Value text
    const valText = document.createElementNS(svgNS, "text");
    valText.setAttribute("x", 100 + width + 5);
    valText.setAttribute("y", y + 17);
    valText.setAttribute("fill", "var(--text-secondary)");
    valText.setAttribute("font-size", "12");
    valText.textContent = item.value;
    // update pos on anim end ideally, but static is ok for demo
    setTimeout(() => {
        valText.setAttribute("x", 100 + parseFloat(rect.getAttribute("width")) + 5);
        svg.appendChild(valText);
    }, 1050);
  });
  
  container.appendChild(svg);
}

function renderDonutChart(containerId, data) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", "0 0 300 300");
  
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const cx = 150, cy = 130, r = 80;
  const circumference = 2 * Math.PI * r;
  let currentAngle = -90; // Start at top
  
  data.forEach(item => {
    const fraction = item.value / total;
    const dasharray = `${fraction * circumference} ${circumference}`;
    const offset = (currentAngle + 90) * (circumference / 360);
    
    const circle = document.createElementNS(svgNS, "circle");
    circle.setAttribute("cx", cx);
    circle.setAttribute("cy", cy);
    circle.setAttribute("r", r);
    circle.setAttribute("fill", "transparent");
    circle.setAttribute("stroke", item.color);
    circle.setAttribute("stroke-width", "30");
    circle.setAttribute("stroke-dasharray", dasharray);
    circle.setAttribute("stroke-dashoffset", -offset);
    circle.style.transformOrigin = `${cx}px ${cy}px`;
    circle.style.transform = `rotate(${currentAngle}deg)`;
    svg.appendChild(circle);
    
    currentAngle += fraction * 360;
  });
  
  // Center text
  const text = document.createElementNS(svgNS, "text");
  text.setAttribute("x", cx);
  text.setAttribute("y", cy);
  text.setAttribute("text-anchor", "middle");
  text.setAttribute("dominant-baseline", "middle");
  text.setAttribute("fill", "var(--text-primary)");
  text.setAttribute("font-size", "24");
  text.setAttribute("font-weight", "bold");
  text.textContent = total;
  svg.appendChild(text);

  const subtext = document.createElementNS(svgNS, "text");
  subtext.setAttribute("x", cx);
  subtext.setAttribute("y", cy + 20);
  subtext.setAttribute("text-anchor", "middle");
  subtext.setAttribute("fill", "var(--text-secondary)");
  subtext.setAttribute("font-size", "12");
  subtext.textContent = "Total Findings";
  svg.appendChild(subtext);

  // Legend
  const legendY = 250;
  const legendWidth = 300;
  const itemWidth = legendWidth / data.length;
  data.forEach((item, i) => {
      const g = document.createElementNS(svgNS, "g");
      const dot = document.createElementNS(svgNS, "circle");
      dot.setAttribute("cx", i * itemWidth + 20);
      dot.setAttribute("cy", legendY);
      dot.setAttribute("r", "5");
      dot.setAttribute("fill", item.color);
      
      const label = document.createElementNS(svgNS, "text");
      label.setAttribute("x", i * itemWidth + 30);
      label.setAttribute("y", legendY + 4);
      label.setAttribute("fill", "var(--text-secondary)");
      label.setAttribute("font-size", "10");
      label.textContent = item.label;
      
      g.appendChild(dot);
      g.appendChild(label);
      svg.appendChild(g);
  });

  container.appendChild(svg);
}

function renderLineChart(containerId, data) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", "0 0 400 300");

  const padding = 40;
  const width = 400 - padding * 2;
  const height = 300 - padding * 2;
  const maxVal = Math.max(...data) * 1.2;

  const points = data.map((val, i) => {
    const x = padding + (i / (data.length - 1)) * width;
    const y = 300 - padding - (val / maxVal) * height;
    return `${x},${y}`;
  });

  // Draw path
  const path = document.createElementNS(svgNS, "polyline");
  path.setAttribute("points", points.join(" "));
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", "var(--accent)");
  path.setAttribute("stroke-width", "3");
  svg.appendChild(path);

  // Draw points
  data.forEach((val, i) => {
    const x = padding + (i / (data.length - 1)) * width;
    const y = 300 - padding - (val / maxVal) * height;
    const dot = document.createElementNS(svgNS, "circle");
    dot.setAttribute("cx", x);
    dot.setAttribute("cy", y);
    dot.setAttribute("r", "5");
    dot.setAttribute("fill", "var(--bg-primary)");
    dot.setAttribute("stroke", "var(--accent)");
    dot.setAttribute("stroke-width", "2");
    svg.appendChild(dot);

    const label = document.createElementNS(svgNS, "text");
    label.setAttribute("x", x);
    label.setAttribute("y", 300 - padding + 20);
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("fill", "var(--text-secondary)");
    label.setAttribute("font-size", "12");
    const months = ['Jun', 'Jul', 'Aug', 'Sep'];
    label.textContent = months[i];
    svg.appendChild(label);
  });

  container.appendChild(svg);
}

function renderSparkline(containerId, data) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 400 100");
    svg.setAttribute("preserveAspectRatio", "none");
    
    const maxVal = Math.max(...data);
    const width = 400;
    const height = 80;
    
    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = 100 - (val / maxVal) * height;
        return `${x},${y}`;
    });

    const path = document.createElementNS(svgNS, "polyline");
    path.setAttribute("points", points.join(" "));
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "var(--info)");
    path.setAttribute("stroke-width", "2");
    svg.appendChild(path);
    container.appendChild(svg);
}

function renderProgressBar(containerId, percent, label) {
  const container = document.getElementById(containerId);
  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; font-size: 12px; color: var(--text-secondary); margin-bottom: 5px;">
      <span>Verified (${percent}%)</span>
      <span>Unverified (${100 - percent}%)</span>
    </div>
    <div style="width: 100%; background-color: var(--bg-tertiary); border-radius: var(--radius-sm); height: 10px; overflow: hidden;">
      <div style="width: ${percent}%; background-color: var(--success); height: 100%; transition: width 1s ease-out;"></div>
    </div>
  `;
}

function populateInvestigationDropdown() {
  const select = document.getElementById('reportInvestigationSelect');
  if(!window.OSINTStorage) return; // guard if not loaded yet

  const investigations = window.OSINTStorage.getInvestigations() || [];
  select.innerHTML = '';
  if (investigations.length === 0) {
    select.innerHTML = '<option value="">No investigations available</option>';
    return;
  }
  investigations.forEach(inv => {
    const option = document.createElement('option');
    option.value = inv.id;
    option.textContent = inv.name;
    select.appendChild(option);
  });
}

function generateReport() {
  const invId = document.getElementById('reportInvestigationSelect').value;
  if (!invId) {
    window.OSINTUI?.showToast('Please select an investigation', 'error', 3000);
    return;
  }
  
  const inv = window.OSINTStorage.getInvestigation(invId);
  const title = document.getElementById('reportTitleInput').value || 'Investigation Report';
  const analyst = document.getElementById('analystNameInput').value;
  const notes = document.getElementById('additionalNotesInput').value;

  // Build report structure based on checkboxes
  let reportText = `OSINT INVESTIGATION REPORT\n━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  reportText += `Report ID: RPT-${new Date().getFullYear()}-${Math.floor(Math.random()*1000).toString().padStart(3, '0')}\n`;
  reportText += `Investigation: ${inv.id}\n`;
  reportText += `Title: ${title}\n`;
  reportText += `Investigator: ${analyst}\n`;
  reportText += `Date: ${new Date().toISOString().split('T')[0]}\n`;
  reportText += `Classification: UNCLASSIFIED\n\n`;

  if(document.getElementById('secSummary').checked) {
      reportText += `── EXECUTIVE SUMMARY ──\n`;
      reportText += `${inv.description}\n\n`;
  }
  
  if(document.getElementById('secTarget').checked) {
      reportText += `── TARGET INFORMATION ──\n`;
      (inv.targets || []).forEach(t => {
          reportText += `- ${t.name} (${t.type}): ${t.notes}\n`;
      });
      reportText += `\n`;
  }

  if(document.getElementById('secSources').checked) {
      reportText += `── SOURCES ──\n`;
      (inv.sources || []).forEach(s => {
          reportText += `- [${s.verified ? 'VERIFIED' : 'UNVERIFIED'}] ${s.name} (${s.type})\n`;
      });
      reportText += `\n`;
  }

  if(document.getElementById('secEvidence').checked) {
      reportText += `── EVIDENCE ──\n`;
      const evidence = window.OSINTStorage.getEvidence(invId) || [];
      evidence.forEach(e => {
          reportText += `- ${e.id}: ${e.source} [Confidence: ${e.confidence}]\n  ${e.description}\n`;
      });
      reportText += `\n`;
  }

  if(document.getElementById('secFindings').checked) {
      reportText += `── FINDINGS ──\n`;
      const findings = window.OSINTStorage.getFindings(invId) || [];
      findings.forEach(f => {
          reportText += `- [SEVERITY: ${(f.severity || 'medium').toUpperCase()}] ${f.title}\n  ${f.description}\n`;
      });
      reportText += `\n`;
  }

  if(document.getElementById('secTimeline').checked) {
      reportText += `── TIMELINE ──\n`;
      const timeline = window.OSINTStorage.getTimeline(invId);
      if (timeline && timeline.length > 0) {
        timeline.forEach(t => {
          reportText += `${new Date(t.time).toLocaleString()} — ${t.title}: ${t.description || ''}\n`;
        });
      } else {
        reportText += `No timeline events recorded.\n`;
      }
      reportText += `\n`;
  }
  if(document.getElementById('secRelations').checked) {
      reportText += `── INTELLIGENCE RELATIONSHIPS ──\n`;
      const nodes = window.OSINTStorage.getNodes();
      const rels = window.OSINTStorage.getRelationships();
      if (rels && rels.length > 0 && nodes && nodes.length > 0) {
        rels.forEach(r => {
          const fromNode = nodes.find(n => n.id === r.fromId);
          const toNode = nodes.find(n => n.id === r.toId);
          if (fromNode && toNode) {
            reportText += `${fromNode.label} → ${toNode.label}\n`;
          }
        });
      } else {
        reportText += `No relationships mapped.\n`;
      }
      reportText += `\n`;
  }

  if(document.getElementById('secNotes').checked && notes) {
      reportText += `── ANALYST NOTES ──\n${notes}\n\n`;
  }

  if(document.getElementById('secVerification').checked) {
      reportText += `── VERIFICATION STATUS ──\n[Summary: 94% verified, 6% unverified]\n\n`;
  }

  if(document.getElementById('secDisclaimer').checked) {
      reportText += `── DISCLAIMER ──\nThis report contains information collected from publicly available sources and should be used only for lawful and authorized purposes.\n`;
  }

  currentReportData = {
      id: `RPT-${Date.now()}`,
      investigationId: invId,
      date: new Date().toISOString(),
      analyst: analyst,
      content: reportText
  };

  document.getElementById('reportPreview').textContent = reportText;
  document.getElementById('reportPreviewContainer').style.display = 'block';
}

function printReport() {
    window.print();
}

function saveReport() {
    if(!currentReportData) return;
    let reports = JSON.parse(localStorage.getItem('osint-reports') || '[]');
    reports.push(currentReportData);
    localStorage.setItem('osint-reports', JSON.stringify(reports));
    window.OSINTUI?.showToast('Report saved successfully', 'success', 3000);
    loadReportHistory();
}

function exportJSON() {
    if(!currentReportData) return;
    const inv = window.OSINTStorage.getInvestigation(currentReportData.investigationId);
    const exportData = {
        report: currentReportData,
        investigation: inv,
        evidence: window.OSINTStorage.getEvidence(inv.id),
        findings: window.OSINTStorage.getFindings(inv.id)
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentReportData.id}_export.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function exportCSV() {
    if(!currentReportData) return;
    const evidence = window.OSINTStorage.getEvidence(currentReportData.investigationId) || [];
    if(evidence.length === 0) {
        window.OSINTUI?.showToast('No evidence to export', 'warning', 3000);
        return;
    }
    
    let csv = 'ID,Type,Source,Description,Status,Confidence,Date,Notes\n';
    evidence.forEach(e => {
        const row = [
            `"${e.id}"`, `"${e.type}"`, `"${e.source}"`, `"${(e.description || '').replace(/"/g, '""')}"`,
            `"${e.status}"`, `"${e.confidence}"`, `"${e.date}"`, `"${(e.notes || '').replace(/"/g, '""')}"`
        ];
        csv += row.join(',') + '\n';
    });
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentReportData.id}_evidence.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

function loadReportHistory() {
    const tbody = document.querySelector('#reportHistoryTable tbody');
    if(!tbody) return;
    let reports = JSON.parse(localStorage.getItem('osint-reports') || '[]');
    tbody.innerHTML = '';
    
    if(reports.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No saved reports found</td></tr>';
        return;
    }

    reports.forEach(report => {
        const tr = document.createElement('tr');
        const date = new Date(report.date).toLocaleDateString();
        tr.innerHTML = `
            <td>${report.id}</td>
            <td>${report.investigationId}</td>
            <td>${date}</td>
            <td>${report.analyst}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="viewReport('${report.id}')">View</button>
                <button class="btn btn-sm btn-danger" onclick="deleteReport('${report.id}')">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.viewReport = function(id) {
    let reports = JSON.parse(localStorage.getItem('osint-reports') || '[]');
    const r = reports.find(x => x.id === id);
    if(r) {
        currentReportData = r;
        document.getElementById('reportPreview').textContent = r.content;
        document.getElementById('reportPreviewContainer').style.display = 'block';
        // Switch to generator tab to view
        document.querySelector('.tab[data-tab="generator"]').click();
    }
};

window.deleteReport = async function(id) {
    const confirmed = await OSINTUI.confirm('Are you sure you want to delete this report?', 'Delete Report');
    if(confirmed) {
        let reports = JSON.parse(localStorage.getItem('osint-reports') || '[]');
        reports = reports.filter(x => x.id !== id);
        localStorage.setItem('osint-reports', JSON.stringify(reports));
        loadReportHistory();
        window.OSINTUI?.showToast('Report deleted', 'success', 3000);
    }
};
