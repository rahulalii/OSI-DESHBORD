// investigations.js

let currentInvestigation = null;
let evidenceSort = { col: 'id', dir: 'asc' };
let investigationsList = [];

document.addEventListener('DOMContentLoaded', () => {
    initInvestigations();
});

function initInvestigations() {
    // Setup tabs
    const tabs = document.querySelectorAll('.tabs .tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tabs .tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
            const target = tab.getAttribute('data-target');
            document.getElementById(target).classList.add('active');
        });
    });

    document.getElementById('btn-back').addEventListener('click', () => {
        document.getElementById('detail-view').classList.remove('active');
        document.getElementById('list-view').classList.add('active');
        history.pushState({}, '', 'investigations.html');
    });

    document.getElementById('btn-new-inv').addEventListener('click', showNewInvestigationModal);

    // Filters
    document.getElementById('inv-search').addEventListener('input', (e) => {
        renderInvestigationList(e.target.value, document.getElementById('inv-filter').value);
    });
    document.getElementById('inv-filter').addEventListener('change', (e) => {
        renderInvestigationList(document.getElementById('inv-search').value, e.target.value);
    });

    // Notes autosave
    const notesArea = document.getElementById('inv-notes-area');
    notesArea.addEventListener('blur', () => {
        if(currentInvestigation && window.OSINTStorage) {
            currentInvestigation.notes = notesArea.value;
            window.OSINTStorage.saveInvestigation(currentInvestigation);
            document.getElementById('notes-status').textContent = 'Last saved: ' + new Date().toLocaleTimeString();
        }
    });

    // Check URL
    const urlParams = new URLSearchParams(window.location.search);
    const idParam = urlParams.get('id');
    const actionParam = urlParams.get('action');

    if(actionParam === 'new') {
        showNewInvestigationModal();
    } else if (actionParam === 'evidence') {
        if(window.OSINTUI) window.OSINTUI.showToast('Select an investigation to add evidence to', 'info', 3000);
    }
    
    bindDeadButtons();
    bindEvidenceFilters();
    
    if(idParam && window.OSINTStorage) {
        const inv = window.OSINTStorage.getInvestigation(idParam);
        if(inv) {
            showInvestigationDetail(idParam);
        } else {
            renderInvestigationList();
        }
    } else {
        renderInvestigationList();
    }
}

function renderInvestigationList(searchQuery = '', statusFilter = 'all') {
    if(!window.OSINTStorage) return;
    
    investigationsList = window.OSINTStorage.getInvestigations() || [];
    
    let filtered = investigationsList;
    if(searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(i => i.name.toLowerCase().includes(q) || i.id.toLowerCase().includes(q));
    }
    if(statusFilter !== 'all') {
        filtered = filtered.filter(i => i.status === statusFilter);
    }

    const grid = document.getElementById('inv-grid');
    grid.innerHTML = '';
    
    if(filtered.length === 0) {
        grid.innerHTML = '<p style="color:var(--text-muted)">No investigations found.</p>';
        return;
    }

    filtered.forEach(inv => {
        const statusClass = `badge-${inv.status === 'active' ? 'success' : (inv.status === 'archived' ? 'neutral' : 'warning')}`;
        
        const card = document.createElement('div');
        card.className = 'card glass-card inv-card';
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                    <h3 style="margin:0 0 8px 0;">${inv.name}</h3>
                    <span class="badge ${statusClass}">${inv.status}</span>
                    <span class="badge badge-info">${inv.id}</span>
                </div>
                <div style="text-align:right;">
                    <button class="btn btn-sm btn-primary" onclick="showInvestigationDetail('${inv.id}')">View</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteInvestigation('${inv.id}')">Delete</button>
                </div>
            </div>
            <div style="margin-top:16px; display:flex; gap: 24px; color:var(--text-muted); font-size:0.9em;">
                <span>Investigator: ${inv.investigator}</span>
                <span>Created: ${new Date(inv.dateCreated).toLocaleDateString()}</span>
            </div>
        `;
        grid.appendChild(card);
    });
}

function showInvestigationDetail(id) {
    if(!window.OSINTStorage) return;
    currentInvestigation = window.OSINTStorage.getInvestigation(id);
    if(!currentInvestigation) return;

    document.getElementById('list-view').classList.remove('active');
    document.getElementById('detail-view').classList.add('active');
    
    // Update URL without reload
    history.pushState({}, '', \`investigations.html?id=\${id}\`);

    // Header
    document.getElementById('det-title').textContent = \`\${currentInvestigation.name} (#\${currentInvestigation.id})\`;
    document.getElementById('det-status').textContent = currentInvestigation.status;
    document.getElementById('det-priority').textContent = currentInvestigation.priority;
    
    // Info
    document.getElementById('det-inv-name').textContent = currentInvestigation.investigator;
    document.getElementById('det-created').textContent = new Date(currentInvestigation.dateCreated).toLocaleString();
    document.getElementById('det-modified').textContent = new Date(currentInvestigation.dateModified).toLocaleString();
    document.getElementById('det-desc').textContent = currentInvestigation.description;
    
    const tagsDiv = document.getElementById('det-tags');
    tagsDiv.innerHTML = '';
    (currentInvestigation.tags || []).forEach(t => {
        tagsDiv.innerHTML += \`<span class="badge badge-neutral">\${t}</span>\`;
    });

    document.getElementById('inv-notes-area').value = currentInvestigation.notes || '';

    // Render Tabs
    renderTargets();
    renderSources();
    renderEvidenceTable();
    renderFindings();
    renderTimeline();
}

function renderTargets() {
    const tbody = document.querySelector('#targets-table tbody');
    tbody.innerHTML = '';
    (currentInvestigation.targets || []).forEach(t => {
        tbody.innerHTML += \`
            <tr>
                <td>\${t.id}</td>
                <td>\${t.name}</td>
                <td><span class="badge badge-info">\${t.type}</span></td>
                <td>\${t.notes || ''}</td>
                <td><button class="btn btn-sm btn-danger" onclick="deleteTarget('${t.id}')">Delete</button></td>
            </tr>
        \`;
    });
}

function renderSources() {
    const tbody = document.querySelector('#sources-table tbody');
    tbody.innerHTML = '';
    (currentInvestigation.sources || []).forEach(s => {
        const vBadge = s.verified ? '<span class="badge badge-success">Verified</span>' : '<span class="badge badge-warning">Unverified</span>';
        tbody.innerHTML += \`
            <tr>
                <td>\${s.id}</td>
                <td>\${s.name}</td>
                <td>\${s.type}</td>
                <td>\${s.url ? '<a href="'+s.url+'" target="_blank" style="color:var(--accent);">Link</a>' : ''}</td>
                <td>\${vBadge}</td>
                <td><button class="btn btn-sm btn-secondary" onclick="toggleSourceVerify('${s.id}')">Toggle Verify</button></td>
            </tr>
        \`;
    });
}

function renderEvidenceTable() {
    if(!window.OSINTStorage) return;
    let evidence = window.OSINTStorage.getEvidence(currentInvestigation.id) || [];
    
    const searchInput = document.getElementById('evd-search');
    const typeSelect = document.getElementById('evd-type-filter');
    const statusSelect = document.getElementById('evd-status-filter');
    
    if (searchInput && searchInput.value) {
        const q = searchInput.value.toLowerCase();
        evidence = evidence.filter(e => e.source.toLowerCase().includes(q) || e.description.toLowerCase().includes(q) || (e.notes && e.notes.toLowerCase().includes(q)));
    }
    if (typeSelect && typeSelect.value !== 'all') {
        evidence = evidence.filter(e => e.type === typeSelect.value);
    }
    if (statusSelect && statusSelect.value !== 'all') {
        evidence = evidence.filter(e => e.status === statusSelect.value);
    }
    
    // Simple sort
    evidence.sort((a,b) => {
        let valA = a[evidenceSort.col];
        let valB = b[evidenceSort.col];
        if(valA < valB) return evidenceSort.dir === 'asc' ? -1 : 1;
        if(valA > valB) return evidenceSort.dir === 'asc' ? 1 : -1;
        return 0;
    });

    const tbody = document.querySelector('#evidence-table tbody');
    tbody.innerHTML = '';
    
    if(evidence.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8">No evidence recorded.</td></tr>';
        return;
    }

    evidence.forEach(e => {
        tbody.innerHTML += \`
            <tr>
                <td>\${e.id}</td>
                <td>\${e.type}</td>
                <td>\${e.source}</td>
                <td>\${e.description}</td>
                <td><span class="badge badge-\${e.status==='verified'?'success':'neutral'}">\${e.status}</span></td>
                <td>\${e.confidence}</td>
                <td>\${new Date(e.date).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick="viewEvidence('${e.id}')">View</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteEvidenceAction('${e.id}')">Del</button>
                </td>
            </tr>
        \`;
    });
}

window.sortEvidence = function(col) {
    if(evidenceSort.col === col) {
        evidenceSort.dir = evidenceSort.dir === 'asc' ? 'desc' : 'asc';
    } else {
        evidenceSort.col = col;
        evidenceSort.dir = 'asc';
    }
    renderEvidenceTable();
};

function renderFindings() {
    if(!window.OSINTStorage) return;
    const findings = window.OSINTStorage.getFindings(currentInvestigation.id) || [];
    const container = document.getElementById('findings-container');
    container.innerHTML = '';
    
    if(findings.length === 0) {
        container.innerHTML = '<p>No findings recorded.</p>';
        return;
    }

    findings.forEach(f => {
        const sevClass = f.severity === 'high' ? 'danger' : (f.severity === 'medium' ? 'warning' : 'info');
        container.innerHTML += \`
            <div class="card glass-card">
                <div style="display:flex; justify-content:space-between;">
                    <h4 style="margin:0;">\${f.title}</h4>
                    <span class="badge badge-\${sevClass}">\${f.severity} severity</span>
                </div>
                <p style="margin: 8px 0; color:var(--text-muted);">\${f.description}</p>
                <div style="font-size:0.8em;">Status: \${f.status} | Date: \${new Date(f.date).toLocaleDateString()}</div>
            </div>
        \`;
    });
}

function renderTimeline() {
    // Requires timeline data from storage or demo
    const container = document.getElementById('timeline-container');
    container.innerHTML = '';
    
    const tlData = OSINTStorage.getTimeline(currentInvestigation.id) || [];
    
    if(tlData.length === 0) {
        container.innerHTML = '<p>No timeline events.</p>';
        return;
    }

    tlData.forEach(t => {
        const dotColor = t.type === 'milestone' ? 'var(--accent)' : 'var(--text-muted)';
        container.innerHTML += \`
            <div class="timeline-item" style="position:relative; padding-bottom: 20px;">
                <div class="timeline-dot" style="position:absolute; left:-26px; top:4px; width:12px; height:12px; border-radius:50%; background:\${dotColor};"></div>
                <div class="timeline-time" style="font-size:0.8em; color:var(--accent);">\${new Date(t.time).toLocaleString()}</div>
                <div class="timeline-title" style="font-weight:bold; margin-top:4px;">\${t.title}</div>
                <div class="timeline-desc" style="color:var(--text-muted); font-size:0.9em; margin-top:4px;">\${t.description}</div>
            </div>
        \`;
    });
}

function showNewInvestigationModal() {
    if(window.OSINTUI) {
        const content = \`
            <div class="form-group"><label class="form-label">Name</label><input type="text" id="new-inv-name" class="form-input"></div>
            <div class="form-group"><label class="form-label">Investigator</label><input type="text" id="new-inv-inv" class="form-input"></div>
            <div class="form-group"><label class="form-label">Description</label><textarea id="new-inv-desc" class="form-input" rows="3"></textarea></div>
            <button class="btn btn-primary" onclick="createInvestigation()">Create</button>
        \`;
        window.OSINTUI.showModal('New Investigation', content, {});
    }
}

window.createInvestigation = function() {
    const name = document.getElementById('new-inv-name').value;
    if(!name) return;
    
    if(window.OSINTStorage) {
        const id = window.OSINTStorage.generateId('OSINT-' + new Date().getFullYear());
        const inv = {
            id,
            name,
            investigator: document.getElementById('new-inv-inv').value || 'Unknown',
            description: document.getElementById('new-inv-desc').value || '',
            dateCreated: new Date().toISOString(),
            dateModified: new Date().toISOString(),
            status: 'active',
            priority: 'medium',
            tags: [],
            targets: [],
            sources: []
        };
        window.OSINTStorage.saveInvestigation(inv);
        window.OSINTUI.closeModal();
        window.OSINTUI.showToast('Investigation created', 'success', 2000);
        showInvestigationDetail(id);
    }
};

window.deleteInvestigation = function(id) {
    if(window.OSINTUI && window.OSINTStorage) {
        window.OSINTUI.confirm('Are you sure you want to delete this investigation?', 'Delete Investigation').then(res => {
            if(res) {
                window.OSINTStorage.deleteInvestigation(id);
                renderInvestigationList();
                window.OSINTUI.showToast('Investigation deleted', 'success', 2000);
            }
        });
    }
};

window.deleteTarget = function(id) {
    if(!currentInvestigation) return;
    currentInvestigation.targets = (currentInvestigation.targets || []).filter(t => t.id !== id);
    window.OSINTStorage.saveInvestigation(currentInvestigation);
    renderTargets();
    if(window.OSINTUI) window.OSINTUI.showToast('Target deleted', 'success', 2000);
};

window.toggleSourceVerify = function(id) {
    if(!currentInvestigation) return;
    const source = (currentInvestigation.sources || []).find(s => s.id === id);
    if(source) {
        source.verified = !source.verified;
        window.OSINTStorage.saveInvestigation(currentInvestigation);
        renderSources();
        if(window.OSINTUI) window.OSINTUI.showToast('Source verification toggled', 'success', 2000);
    }
};

window.viewEvidence = function(id) {
    if(!window.OSINTStorage) return;
    const ev = window.OSINTStorage.getEvidence(currentInvestigation.id).find(e => e.id === id);
    if(ev && window.OSINTUI) {
        const content = `
            <p><strong>Type:</strong> ${ev.type}</p>
            <p><strong>Source:</strong> ${ev.source}</p>
            <p><strong>Description:</strong> ${ev.description}</p>
            <p><strong>Status:</strong> ${ev.status}</p>
            <p><strong>Confidence:</strong> ${ev.confidence}</p>
            <p><strong>Notes:</strong> ${ev.notes || ''}</p>
        `;
        window.OSINTUI.showModal('Evidence Details', content, {
            buttons: [{ text: 'Close', class: 'btn btn-secondary', onClick: () => window.OSINTUI.closeModal() }]
        });
    }
};

window.deleteEvidenceAction = function(id) {
    if(!window.OSINTUI || !window.OSINTStorage) return;
    window.OSINTUI.confirm('Are you sure you want to delete this evidence?', 'Delete Evidence').then(res => {
        if(res) {
            window.OSINTStorage.deleteEvidence(id);
            renderEvidenceTable();
            window.OSINTUI.showToast('Evidence deleted', 'success', 2000);
        }
    });
};

function bindEvidenceFilters() {
    const s = document.getElementById('evd-search');
    const t = document.getElementById('evd-type-filter');
    const st = document.getElementById('evd-status-filter');
    if (s) s.addEventListener('input', renderEvidenceTable);
    if (t) t.addEventListener('change', renderEvidenceTable);
    if (st) st.addEventListener('change', renderEvidenceTable);
}

function bindDeadButtons() {
    const btnAddTarget = document.getElementById('btn-add-target');
    if(btnAddTarget) {
        btnAddTarget.addEventListener('click', () => {
            const content = `
                <div class="form-group"><label class="form-label">Name</label><input type="text" id="new-tgt-name" class="form-input"></div>
                <div class="form-group"><label class="form-label">Type</label>
                    <select id="new-tgt-type" class="form-input">
                        <option>Username</option><option>Domain</option><option>Email</option><option>IP</option><option>Organization</option><option>Other</option>
                    </select>
                </div>
                <div class="form-group"><label class="form-label">Notes</label><textarea id="new-tgt-notes" class="form-input" rows="3"></textarea></div>
                <button class="btn btn-primary" onclick="saveNewTarget()">Save Target</button>
            `;
            window.OSINTUI.showModal('Add Target', content);
        });
    }

    const btnAddSource = document.getElementById('btn-add-source');
    if(btnAddSource) {
        btnAddSource.addEventListener('click', () => {
            const content = `
                <div class="form-group"><label class="form-label">Name</label><input type="text" id="new-src-name" class="form-input"></div>
                <div class="form-group"><label class="form-label">Type</label>
                    <select id="new-src-type" class="form-input">
                        <option>Website</option><option>Social Profile</option><option>Public Record</option><option>News Article</option><option>Document</option><option>Other</option>
                    </select>
                </div>
                <div class="form-group"><label class="form-label">URL</label><input type="text" id="new-src-url" class="form-input"></div>
                <div class="form-group"><label class="form-label">Notes</label><textarea id="new-src-notes" class="form-input" rows="2"></textarea></div>
                <button class="btn btn-primary" onclick="saveNewSource()">Save Source</button>
            `;
            window.OSINTUI.showModal('Add Source', content);
        });
    }

    const btnAddEvidence = document.getElementById('btn-add-evidence');
    if(btnAddEvidence) {
        btnAddEvidence.addEventListener('click', () => {
            const content = `
                <div class="form-group"><label class="form-label">Type</label><select id="new-evd-type" class="form-input"><option>Website</option><option>Social Profile</option><option>Document</option><option>Screenshot</option><option>News Article</option><option>Public Record</option><option>Other</option></select></div>
                <div class="form-group"><label class="form-label">Source</label><input type="text" id="new-evd-source" class="form-input"></div>
                <div class="form-group"><label class="form-label">Description</label><textarea id="new-evd-desc" class="form-input" rows="2"></textarea></div>
                <div class="form-group"><label class="form-label">Confidence</label><select id="new-evd-conf" class="form-input"><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></div>
                <div class="form-group"><label class="form-label">Notes</label><textarea id="new-evd-notes" class="form-input" rows="2"></textarea></div>
                <button class="btn btn-primary" onclick="saveNewEvidence()">Save Evidence</button>
            `;
            window.OSINTUI.showModal('Add Evidence', content);
        });
    }

    const btnAddFinding = document.getElementById('btn-add-finding');
    if(btnAddFinding) {
        btnAddFinding.addEventListener('click', () => {
            const content = `
                <div class="form-group"><label class="form-label">Title</label><input type="text" id="new-fnd-title" class="form-input"></div>
                <div class="form-group"><label class="form-label">Severity</label><select id="new-fnd-sev" class="form-input"><option value="critical">Critical</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></div>
                <div class="form-group"><label class="form-label">Description</label><textarea id="new-fnd-desc" class="form-input" rows="3"></textarea></div>
                <div class="form-group"><label class="form-label">Notes</label><textarea id="new-fnd-notes" class="form-input" rows="2"></textarea></div>
                <button class="btn btn-primary" onclick="saveNewFinding()">Save Finding</button>
            `;
            window.OSINTUI.showModal('Add Finding', content);
        });
    }

    const btnAddTimeline = document.getElementById('btn-add-timeline');
    if(btnAddTimeline) {
        btnAddTimeline.addEventListener('click', () => {
            const content = `
                <div class="form-group"><label class="form-label">Title</label><input type="text" id="new-tl-title" class="form-input"></div>
                <div class="form-group"><label class="form-label">Type</label><select id="new-tl-type" class="form-input"><option>milestone</option><option>evidence</option><option>source</option><option>finding</option><option>verified</option></select></div>
                <div class="form-group"><label class="form-label">Description</label><textarea id="new-tl-desc" class="form-input" rows="3"></textarea></div>
                <button class="btn btn-primary" onclick="saveNewTimeline()">Save Event</button>
            `;
            window.OSINTUI.showModal('Add Timeline Event', content);
        });
    }
}

window.saveNewTarget = function() {
    if(!currentInvestigation) return;
    const t = {
        id: window.OSINTStorage.generateId('TGT'),
        name: document.getElementById('new-tgt-name').value,
        type: document.getElementById('new-tgt-type').value,
        notes: document.getElementById('new-tgt-notes').value
    };
    currentInvestigation.targets = currentInvestigation.targets || [];
    currentInvestigation.targets.push(t);
    window.OSINTStorage.saveInvestigation(currentInvestigation);
    renderTargets();
    window.OSINTUI.closeModal();
    window.OSINTUI.showToast('Target added', 'success', 2000);
};

window.saveNewSource = function() {
    if(!currentInvestigation) return;
    const s = {
        id: window.OSINTStorage.generateId('SRC'),
        name: document.getElementById('new-src-name').value,
        type: document.getElementById('new-src-type').value,
        url: document.getElementById('new-src-url').value,
        notes: document.getElementById('new-src-notes').value,
        verified: false
    };
    currentInvestigation.sources = currentInvestigation.sources || [];
    currentInvestigation.sources.push(s);
    window.OSINTStorage.saveInvestigation(currentInvestigation);
    renderSources();
    window.OSINTUI.closeModal();
    window.OSINTUI.showToast('Source added', 'success', 2000);
};

window.saveNewEvidence = function() {
    if(!currentInvestigation) return;
    const e = {
        id: window.OSINTStorage.generateId('EVD'),
        investigationId: currentInvestigation.id,
        type: document.getElementById('new-evd-type').value,
        source: document.getElementById('new-evd-source').value,
        description: document.getElementById('new-evd-desc').value,
        confidence: document.getElementById('new-evd-conf').value,
        notes: document.getElementById('new-evd-notes').value,
        status: 'pending',
        date: new Date().toISOString()
    };
    window.OSINTStorage.saveEvidence(e);
    renderEvidenceTable();
    window.OSINTUI.closeModal();
    window.OSINTUI.showToast('Evidence added', 'success', 2000);
};

window.saveNewFinding = function() {
    if(!currentInvestigation) return;
    const f = {
        id: window.OSINTStorage.generateId('FND'),
        investigationId: currentInvestigation.id,
        title: document.getElementById('new-fnd-title').value,
        severity: document.getElementById('new-fnd-sev').value,
        description: document.getElementById('new-fnd-desc').value,
        notes: document.getElementById('new-fnd-notes').value,
        date: new Date().toISOString(),
        status: 'under-review'
    };
    window.OSINTStorage.saveFinding(f);
    renderFindings();
    window.OSINTUI.closeModal();
    window.OSINTUI.showToast('Finding added', 'success', 2000);
};

window.saveNewTimeline = function() {
    if(!currentInvestigation) return;
    const tl = {
        id: window.OSINTStorage.generateId('TL'),
        investigationId: currentInvestigation.id,
        title: document.getElementById('new-tl-title').value,
        type: document.getElementById('new-tl-type').value,
        description: document.getElementById('new-tl-desc').value,
        time: new Date().toISOString()
    };
    window.OSINTStorage.saveTimelineEvent(tl);
    renderTimeline();
    window.OSINTUI.closeModal();
    window.OSINTUI.showToast('Timeline event added', 'success', 2000);
};
