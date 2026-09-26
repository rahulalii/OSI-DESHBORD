// tools.js

let currentZoom = 1;
let selectedNodes = [];
let graphNodes = [];
let graphConnections = [];
let dragNode = null;
let dragOffset = {x: 0, y: 0};
let workspacePan = {x: 0, y: 0};
let isPanning = false;
let panStart = {x:0, y:0};

document.addEventListener('DOMContentLoaded', () => {
    initTools();
});

function initTools() {
    // Tab switching logic
    const tabs = document.querySelectorAll('.tabs .tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tabs .tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const target = tab.getAttribute('data-target');
            
            if(target === 'module-grid-view') {
                showAllModules();
            } else {
                const moduleNum = parseInt(target.replace('module-', ''));
                showModule(moduleNum);
            }
        });
    });

    // Check URL params
    const urlParams = new URLSearchParams(window.location.search);
    const modParam = urlParams.get('module');
    if (modParam) {
        showModule(parseInt(modParam));
        const tab = document.querySelector(`.tabs .tab[data-target="module-${modParam}"]`);
        if(tab) {
            document.querySelectorAll('.tabs .tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        }
    }

    initModuleHandlers();
    initCorrelationGraph();
}

function showModule(n) {
    document.getElementById('module-grid-view').style.display = 'none';
    document.querySelectorAll('.module-detail').forEach(el => el.classList.remove('active'));
    document.getElementById(`module-${n}`).classList.add('active');
}

function showAllModules() {
    document.querySelectorAll('.module-detail').forEach(el => el.classList.remove('active'));
    document.getElementById('module-grid-view').style.display = 'grid';
    document.querySelectorAll('.tabs .tab').forEach(t => t.classList.remove('active'));
    document.querySelector('.tabs .tab[data-target="module-grid-view"]').classList.add('active');
}

function initModuleHandlers() {
    // Module 1
    document.querySelectorAll('#module-1 .btn-primary').forEach(btn => {
        if(btn.textContent.trim() === 'Add Finding') {
            btn.addEventListener('click', () => {
                if(window.OSINTUI) {
                    window.OSINTUI.showModal('Add Finding', `
                        <div class="form-group"><label class="form-label">Title</label><input type="text" id="m1-fnd-title" class="form-input"></div>
                        <div class="form-group"><label class="form-label">Description</label><textarea id="m1-fnd-desc" class="form-input" rows="3"></textarea></div>
                        <div class="form-group"><label class="form-label">Severity</label>
                          <select id="m1-fnd-sev" class="form-select">
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="critical">Critical</option>
                          </select>
                        </div>
                    `, {
                        footer: '<button class="btn btn-secondary" onclick="OSINTUI.closeModal()">Cancel</button><button class="btn btn-primary" id="saveFindingBtn">Save</button>'
                    });
                    document.getElementById('saveFindingBtn')?.addEventListener('click', () => {
                        const title = document.getElementById('m1-fnd-title').value;
                        const desc = document.getElementById('m1-fnd-desc').value;
                        const sev = document.getElementById('m1-fnd-sev').value;
                        if(title) {
                            OSINTStorage.saveFinding({
                                id: OSINTStorage.generateId('FND'),
                                investigationId: 'OSINT-2026-001',
                                title: title,
                                description: desc,
                                severity: sev,
                                date: new Date().toISOString(),
                                status: 'under-review',
                                evidence: []
                            });
                            window.OSINTUI.showToast('Finding saved', 'success', 2000);
                        }
                        window.OSINTUI.closeModal();
                    });
                }
            });
        }
    });

    document.getElementById('m1-search-btn')?.addEventListener('click', () => {
        if(window.OSINTUI) window.OSINTUI.showToast('Search query saved to workspace', 'success', 3000);
    });
    document.getElementById('m1-analyze-btn')?.addEventListener('click', () => {
        const urlStr = document.getElementById('m1-url').value;
        if(!urlStr) return;
        try {
            const url = new URL(urlStr.startsWith('http') ? urlStr : 'https://' + urlStr);
            document.getElementById('m1-protocol').textContent = url.protocol;
            document.getElementById('m1-hostname').textContent = url.hostname;
            document.getElementById('m1-pathname').textContent = url.pathname;
            document.getElementById('m1-url-results').style.display = 'block';
        } catch(e) {
            if(window.OSINTUI) window.OSINTUI.showToast('Invalid URL', 'error', 3000);
        }
    });
    document.getElementById('m1-domain-btn')?.addEventListener('click', () => {
        document.getElementById('m1-domain-results').style.display = 'block';
    });

    // Module 2
    document.getElementById('m2-search-btn')?.addEventListener('click', () => {
        const uname = document.getElementById('m2-username').value;
        if(!uname) return;
        const platforms = ['Instagram','Facebook','X','LinkedIn','YouTube','Reddit','GitHub','TikTok'];
        const container = document.getElementById('m2-platforms');
        container.innerHTML = '';
        platforms.forEach(p => {
            const status = Math.random() > 0.5 ? '🟢 Found' : '🔴 Not Found';
            container.innerHTML += `
                <div class="card glass-card" style="padding: 12px;">
                    <strong>${p}</strong><br>
                    <span>${status}</span> <span class="demo-badge">DEMO</span>
                </div>
            `;
        });
    });
    document.getElementById('m2-save-notes')?.addEventListener('click', () => {
        if(window.OSINTUI) window.OSINTUI.showToast('Notes saved', 'success', 2000);
    });

    // Module 3
    document.getElementById('m3-add-source')?.addEventListener('click', () => {
        if(window.OSINTUI) {
            window.OSINTUI.showModal('Add Source', `
                <div class="form-group"><label class="form-label">URL</label><input type="text" id="m3-new-url" class="form-input"></div>
            `, {
                footer: '<button class="btn btn-secondary" onclick="OSINTUI.closeModal()">Cancel</button><button class="btn btn-primary" id="saveSourceBtn">Save</button>'
            });
            document.getElementById('saveSourceBtn')?.addEventListener('click', () => {
                const url = document.getElementById('m3-new-url').value;
                if(url) {
                    window.OSINTUI.showToast('Source added: ' + url, 'success', 2000);
                }
                window.OSINTUI.closeModal();
            });
        }
    });

    // Module 4
    document.getElementById('m4-plot-btn')?.addEventListener('click', () => {
        const lat = parseFloat(document.getElementById('m4-lat').value);
        const lng = parseFloat(document.getElementById('m4-lng').value);
        if(isNaN(lat) || isNaN(lng)) return;
        
        const map = document.getElementById('m4-map');
        const dot = document.createElement('div');
        dot.className = 'map-dot';
        
        // simple normalization for demo map (lat -90 to 90, lng -180 to 180)
        const x = ((lng + 180) / 360) * 100;
        const y = ((-lat + 90) / 180) * 100;
        
        dot.style.left = x + '%';
        dot.style.top = y + '%';
        map.appendChild(dot);
        
        const tbody = document.getElementById('m4-evidence');
        tbody.innerHTML += `<tr><td>${lat}</td><td>${lng}</td><td>User Plotted <span class="demo-badge">DEMO</span></td></tr>`;
        
        OSINTStorage.saveEvidence({
            id: OSINTStorage.generateId('EVD'),
            investigationId: 'OSINT-2026-001',
            type: 'Location',
            source: `Lat: ${lat}, Lng: ${lng}`,
            description: 'User plotted location on map',
            status: 'verified',
            confidence: 'high',
            date: new Date().toISOString()
        });
    });

    // Module 5
    document.getElementById('m5-lookup-btn')?.addEventListener('click', () => {
        const domain = document.getElementById('m5-domain').value || 'example.com';
        document.getElementById('m5-res-domain').textContent = domain;
        document.getElementById('m5-results').style.display = 'grid';
    });

    // Module 6
    document.getElementById('m6-search-user')?.addEventListener('click', () => {
        const uname = document.getElementById('m6-username').value;
        if(!uname) return;
        const platforms = ['Instagram','GitHub','Reddit','YouTube','X','LinkedIn','TikTok','Facebook'];
        const container = document.getElementById('m6-results');
        container.innerHTML = '';
        platforms.forEach(p => {
            let status = '🟡 Unknown'; let col = 'badge-warning';
            const r = Math.random();
            if(r > 0.6) { status = '🟢 Found'; col = 'badge-success'; }
            else if(r > 0.3) { status = '🔴 Not Found'; col = 'badge-danger'; }
            
            container.innerHTML += `
                <div class="card glass-card" style="padding: 12px;">
                    <strong>${p}</strong><br>
                    <span class="badge ${col}" style="margin-top:4px;">${status}</span>
                </div>
            `;
        });
    });

    // Module 7
    document.getElementById('m7-file')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if(!file) return;
        
        if(file.type.startsWith('image/')) {
            document.getElementById('m7-image-meta').style.display = 'block';
            document.getElementById('m7-video-meta').style.display = 'none';
            document.getElementById('m7-reverse').style.display = 'block';
            
            document.getElementById('m7-fname').textContent = file.name;
            document.getElementById('m7-ftype').textContent = file.type;
            document.getElementById('m7-fsize').textContent = file.size;
            document.getElementById('m7-fdate').textContent = new Date(file.lastModified).toISOString();
            
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('m7-preview').src = e.target.result;
                const img = new Image();
                img.onload = () => {
                    document.getElementById('m7-fdim').textContent = `${img.width} x ${img.height}`;
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        } else if (file.type.startsWith('video/')) {
            document.getElementById('m7-image-meta').style.display = 'none';
            document.getElementById('m7-reverse').style.display = 'none';
            document.getElementById('m7-video-meta').style.display = 'block';
            document.getElementById('m7-vname').textContent = file.name;
        }
    });

    // Module 8
    document.getElementById('m8-lookup-btn')?.addEventListener('click', () => {
        const ind = document.getElementById('m8-indicator').value;
        const type = document.getElementById('m8-type').value;
        if(!ind) return;
        
        document.getElementById('m8-res-ind').textContent = ind;
        document.getElementById('m8-res-type').textContent = type;
        document.getElementById('m8-result-card').style.display = 'block';
        
        const tbody = document.getElementById('m8-saved');
        tbody.innerHTML += `<tr><td>${ind}</td><td>${type}</td><td><span class="badge badge-warning">Medium</span></td></tr>`;
        
        OSINTStorage.saveEvidence({
            id: OSINTStorage.generateId('EVD'),
            investigationId: 'OSINT-2026-001',
            type: type,
            source: ind,
            description: 'Threat Intel Indicator',
            status: 'unverified',
            confidence: 'medium',
            date: new Date().toISOString()
        });
    });
}

// Module 9 - Correlation Graph
function initCorrelationGraph() {
    const ws = document.getElementById('graph-workspace');
    if(!ws) return;
    
    // Load Nodes from storage
    graphNodes = OSINTStorage.getNodes();
    graphConnections = OSINTStorage.getRelationships();
    
    renderGraph();

    // Toolbar events
    document.getElementById('m9-add-node').addEventListener('click', () => {
        const cat = document.getElementById('m9-add-cat').value;
        const id = OSINTStorage.generateId('node');
        const node = {id, label: 'New ' + cat, category: cat, x: 250, y: 250};
        graphNodes.push(node);
        OSINTStorage.saveNode(node);
        renderGraph();
    });

    document.getElementById('m9-connect').addEventListener('click', () => {
        if(selectedNodes.length === 2) {
            const rel = { id: OSINTStorage.generateId('REL'), fromId: selectedNodes[0], toId: selectedNodes[1] };
            graphConnections.push(rel);
            OSINTStorage.saveRelationship(rel);
            renderGraph();
            selectedNodes = [];
        } else {
            if(window.OSINTUI) window.OSINTUI.showToast('Select exactly 2 nodes to connect', 'warning', 2000);
        }
    });

    document.getElementById('m9-delete').addEventListener('click', () => {
        if(selectedNodes.length === 0) return;
        
        selectedNodes.forEach(id => OSINTStorage.deleteNode(id));
        graphNodes = OSINTStorage.getNodes();
        graphConnections = OSINTStorage.getRelationships();
        
        selectedNodes = [];
        document.getElementById('node-details').style.display = 'none';
        renderGraph();
    });

    document.getElementById('m9-clear').addEventListener('click', () => {
        graphNodes.forEach(n => OSINTStorage.deleteNode(n.id));
        graphNodes = [];
        graphConnections = [];
        selectedNodes = [];
        document.getElementById('node-details').style.display = 'none';
        renderGraph();
    });

    document.getElementById('m9-zoom-in').addEventListener('click', () => zoom(0.1));
    document.getElementById('m9-zoom-out').addEventListener('click', () => zoom(-0.1));
    document.getElementById('m9-reset').addEventListener('click', () => {
        currentZoom = 1;
        workspacePan = {x:0, y:0};
        updateTransform();
    });

    // Panning
    ws.addEventListener('mousedown', (e) => {
        if(e.target === ws || e.target.id === 'svg-canvas') {
            isPanning = true;
            panStart = {x: e.clientX - workspacePan.x, y: e.clientY - workspacePan.y};
        }
    });
    
    window.addEventListener('mousemove', (e) => {
        if(isPanning) {
            workspacePan.x = e.clientX - panStart.x;
            workspacePan.y = e.clientY - panStart.y;
            updateTransform();
        } else if (dragNode) {
            const container = document.getElementById('nodes-container');
            const rect = container.getBoundingClientRect();
            // convert screen coords to workspace coords
            const x = (e.clientX - rect.left) / currentZoom - dragOffset.x;
            const y = (e.clientY - rect.top) / currentZoom - dragOffset.y;
            
            const node = graphNodes.find(n => n.id === dragNode);
            if(node) {
                node.x = x;
                node.y = y;
                renderGraph();
            }
        }
    });
    
    window.addEventListener('mouseup', () => {
        isPanning = false;
        if (dragNode) {
            const node = graphNodes.find(n => n.id === dragNode);
            if (node) {
                OSINTStorage.saveNode(node);
            }
        }
        dragNode = null;
    });
}

function renderGraph() {
    const container = document.getElementById('nodes-container');
    const svg = document.getElementById('svg-canvas');
    if(!container || !svg) return;
    
    container.innerHTML = '';
    svg.innerHTML = '';

    const iconMap = {
        person: '👤', social: '📱', website: '🌐', domain: '🔗',
        email: '📧', location: '📍', media: '🖼️', source: '📰',
        indicator: '🔐', document: '📄', organization: '🏢', ip: '🌍'
    };

    graphNodes.forEach(node => {
        const el = document.createElement('div');
        el.className = 'graph-node';
        if(selectedNodes.includes(node.id)) el.classList.add('selected');
        
        el.style.left = node.x + 'px';
        el.style.top = node.y + 'px';
        
        el.innerHTML = `<span>${iconMap[node.category] || '❓'}</span> <span>${node.label}</span>`;
        
        // Node events
        el.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            dragNode = node.id;
            const rect = el.getBoundingClientRect();
            dragOffset.x = (e.clientX - rect.left) / currentZoom;
            dragOffset.y = (e.clientY - rect.top) / currentZoom;
            
            if(e.ctrlKey || e.metaKey) {
                if(selectedNodes.includes(node.id)) {
                    selectedNodes = selectedNodes.filter(id => id !== node.id);
                } else {
                    selectedNodes.push(node.id);
                }
            } else {
                if(!selectedNodes.includes(node.id)) {
                    selectedNodes = [node.id];
                }
            }
            showNodeDetails(node);
            renderGraph();
        });
        
        el.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            if (window.OSINTUI) {
                window.OSINTUI.showModal('Edit Node Label', `
                  <div class="form-group">
                    <label class="form-label">Label</label>
                    <input type="text" class="form-input" id="editNodeLabel" value="${node.label}">
                  </div>
                `, {
                  footer: '<button class="btn btn-secondary" onclick="OSINTUI.closeModal()">Cancel</button><button class="btn btn-primary" id="saveNodeLabel">Save</button>'
                });
                document.getElementById('saveNodeLabel').addEventListener('click', () => {
                  const newLabel = document.getElementById('editNodeLabel').value.trim();
                  if (newLabel) {
                    node.label = newLabel;
                    OSINTStorage.saveNode(node);
                    renderGraph();
                  }
                  window.OSINTUI.closeModal();
                });
            } else {
                const newLabel = prompt('Edit label:', node.label);
                if(newLabel) {
                    node.label = newLabel;
                    OSINTStorage.saveNode(node);
                    renderGraph();
                }
            }
        });

        container.appendChild(el);
    });

    // Draw connections
    // Need actual width/height of nodes, so wait a tick
    setTimeout(() => {
        graphConnections.forEach(conn => {
            const n1 = graphNodes.find(n => n.id === conn.fromId);
            const n2 = graphNodes.find(n => n.id === conn.toId);
            if(n1 && n2) {
                // approximate centers
                const x1 = n1.x + 60;
                const y1 = n1.y + 20;
                const x2 = n2.x + 60;
                const y2 = n2.y + 20;
                
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', x1);
                line.setAttribute('y1', y1);
                line.setAttribute('x2', x2);
                line.setAttribute('y2', y2);
                line.setAttribute('class', 'graph-connection');
                svg.appendChild(line);
            }
        });
    }, 0);
}

function updateTransform() {
    const container = document.getElementById('nodes-container');
    const svg = document.getElementById('svg-canvas');
    if(container) container.style.transform = `translate(${workspacePan.x}px, ${workspacePan.y}px) scale(${currentZoom})`;
    if(svg) svg.style.transform = `translate(${workspacePan.x}px, ${workspacePan.y}px) scale(${currentZoom})`;
}

function zoom(delta) {
    currentZoom = Math.max(0.1, Math.min(3, currentZoom + delta));
    updateTransform();
}

function showNodeDetails(node) {
    const panel = document.getElementById('node-details');
    panel.style.display = 'block';
    document.getElementById('nd-label').textContent = node.label;
    document.getElementById('nd-cat').textContent = node.category;
    document.getElementById('nd-notes').value = node.notes || '';
    
    // Save notes on blur
    document.getElementById('nd-notes').onblur = (e) => {
        node.notes = e.target.value;
    };
}
