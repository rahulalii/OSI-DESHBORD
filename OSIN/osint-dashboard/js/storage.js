// js/storage.js

const DEMO_INVESTIGATION = {
  id: 'OSINT-2026-001',
  name: 'Project Phantom — Digital Footprint Analysis',
  investigator: 'Analyst Alpha',
  dateCreated: '2026-09-25T09:10:00Z',
  dateModified: '2026-09-25T11:30:00Z',
  status: 'active', // active|pending|completed|archived
  priority: 'high', // critical|high|medium|low
  tags: ['social-media', 'domain-analysis', 'threat-intel'],
  description: 'Investigation into the digital footprint of a fictional entity for training purposes.',
  targets: [
    { id: 'TGT-001', name: 'phantom_user_42', type: 'Username', notes: 'Primary target username' },
    { id: 'TGT-002', name: 'phantom-tech.example.com', type: 'Domain', notes: 'Associated domain' }
  ],
  sources: [
    { id: 'SRC-001', name: 'Public WHOIS Record', type: 'Public Record', url: '', verified: true },
    { id: 'SRC-002', name: 'GitHub Profile', type: 'Social Profile', url: 'https://github.com/phantom_user_42', verified: true },
    { id: 'SRC-003', name: 'Reddit Profile', type: 'Social Profile', url: '', verified: false },
    { id: 'SRC-004', name: 'Tech News Article', type: 'News Article', url: '', verified: true },
    { id: 'SRC-005', name: 'Archived Blog Post', type: 'Website', url: '', verified: false }
  ],
  notes: 'This is a DEMO investigation for training purposes. All data is fictional.'
};

const DEMO_EVIDENCE = [
  { id: 'EVD-001', investigationId: 'OSINT-2026-001', type: 'Website', source: 'phantom-tech.example.com', description: 'Main website of target domain', status: 'verified', confidence: 'high', date: '2026-09-25T09:25:00Z', notes: 'Domain registered 2024. Public info only.' },
  { id: 'EVD-002', investigationId: 'OSINT-2026-001', type: 'Social Profile', source: 'GitHub — phantom_user_42', description: 'Public GitHub profile with 23 repos', status: 'verified', confidence: 'high', date: '2026-09-25T09:42:00Z', notes: 'Active profile. Public repos analyzed.' },
  { id: 'EVD-003', investigationId: 'OSINT-2026-001', type: 'Document', source: 'WHOIS Public Record', description: 'Domain registration record', status: 'verified', confidence: 'medium', date: '2026-09-25T10:05:00Z', notes: 'Registrant info partially redacted.' },
  { id: 'EVD-004', investigationId: 'OSINT-2026-001', type: 'Screenshot', source: 'Twitter/X Profile Screenshot', description: 'Screenshot of public X profile', status: 'pending', confidence: 'medium', date: '2026-09-25T10:20:00Z', notes: 'Profile is public. Screenshot archived.' },
  { id: 'EVD-005', investigationId: 'OSINT-2026-001', type: 'News Article', source: 'TechDaily — Phantom Tech Coverage', description: 'News article mentioning target entity', status: 'verified', confidence: 'high', date: '2026-09-25T10:45:00Z', notes: 'Published article from reputable source.' },
  { id: 'EVD-006', investigationId: 'OSINT-2026-001', type: 'Public Record', source: 'Company Registry', description: 'Public business registration', status: 'unverified', confidence: 'low', date: '2026-09-25T11:00:00Z', notes: 'Needs cross-reference verification.' }
];

const DEMO_FINDINGS = [
  { id: 'FND-001', investigationId: 'OSINT-2026-001', title: 'Username correlation confirmed', severity: 'medium', description: 'The username phantom_user_42 is linked across GitHub, Reddit, and X based on public profile information.', date: '2026-09-25T10:31:00Z', evidence: ['EVD-002', 'EVD-004'], status: 'confirmed' },
  { id: 'FND-002', investigationId: 'OSINT-2026-001', title: 'Domain ownership link', severity: 'high', description: 'Domain phantom-tech.example.com is publicly registered to an entity matching the target profile.', date: '2026-09-25T10:50:00Z', evidence: ['EVD-001', 'EVD-003'], status: 'confirmed' },
  { id: 'FND-003', investigationId: 'OSINT-2026-001', title: 'Social media presence mapped', severity: 'low', description: 'Target has public presence on 4 social platforms. All profiles are public.', date: '2026-09-25T11:10:00Z', evidence: ['EVD-002', 'EVD-004'], status: 'under-review' }
];

const DEMO_TIMELINE = [
  { id: 'TL-001', investigationId: 'OSINT-2026-001', time: '2026-09-25T09:10:00Z', title: 'Investigation Created', description: 'New investigation initiated for Project Phantom.', type: 'milestone' },
  { id: 'TL-002', investigationId: 'OSINT-2026-001', time: '2026-09-25T09:25:00Z', title: 'Domain Added', description: 'phantom-tech.example.com added as primary domain target.', type: 'evidence' },
  { id: 'TL-003', investigationId: 'OSINT-2026-001', time: '2026-09-25T09:42:00Z', title: 'Public Source Added', description: 'GitHub profile identified and added as source.', type: 'source' },
  { id: 'TL-004', investigationId: 'OSINT-2026-001', time: '2026-09-25T10:05:00Z', title: 'Social Profile Reference Added', description: 'X and Reddit profiles discovered via public search.', type: 'source' },
  { id: 'TL-005', investigationId: 'OSINT-2026-001', time: '2026-09-25T10:31:00Z', title: 'Finding Added', description: 'Username correlation confirmed across platforms.', type: 'finding' },
  { id: 'TL-006', investigationId: 'OSINT-2026-001', time: '2026-09-25T11:10:00Z', title: 'Evidence Verified', description: 'Domain ownership evidence verified against public records.', type: 'verified' }
];

const DEMO_RELATIONSHIPS = [
  { id: 'REL-001', fromId: 'node-1', toId: 'node-2' },
  { id: 'REL-002', fromId: 'node-2', toId: 'node-3' },
  { id: 'REL-003', fromId: 'node-2', toId: 'node-4' },
  { id: 'REL-004', fromId: 'node-3', toId: 'node-5' },
  { id: 'REL-005', fromId: 'node-4', toId: 'node-5' },
  { id: 'REL-006', fromId: 'node-1', toId: 'node-6' }
];

const DEMO_NODES = [
  { id: 'node-1', label: 'phantom_user_42', category: 'person', x: 400, y: 200, notes: 'Primary target username' },
  { id: 'node-2', label: 'GitHub Profile', category: 'social', x: 250, y: 350, notes: 'Public GitHub account' },
  { id: 'node-3', label: 'phantom-tech.example.com', category: 'domain', x: 550, y: 350, notes: 'Associated domain' },
  { id: 'node-4', label: 'X Profile', category: 'social', x: 150, y: 500, notes: 'Public X account' },
  { id: 'node-5', label: 'Tech News Article', category: 'source', x: 400, y: 500, notes: 'News coverage of entity' },
  { id: 'node-6', label: 'analyst@example.com', category: 'email', x: 600, y: 200, notes: 'Public contact email' }
];

const DEMO_STATS = {
  activeInvestigations: 12,
  sourcesCollected: 248,
  findings: 76,
  reportsGenerated: 18,
  verifiedPercent: 94
};

window.OSINTStorage = {
  DATA_KEY: 'osint-data',
  SETTINGS_KEY: 'osint-settings',
  THEME_KEY: 'osint-theme',

  getData() {
    const dataStr = localStorage.getItem(this.DATA_KEY);
    if (!dataStr) return null;
    try {
      return JSON.parse(dataStr);
    } catch (e) {
      console.error('Error parsing storage data', e);
      return null;
    }
  },

  saveData(data) {
    localStorage.setItem(this.DATA_KEY, JSON.stringify(data));
  },

  getInvestigations() {
    const data = this.getData();
    return data && data.investigations ? data.investigations : [];
  },

  getInvestigation(id) {
    return this.getInvestigations().find(i => i.id === id) || null;
  },

  saveInvestigation(investigation) {
    const data = this.getData();
    if (!data) return;
    if (!data.investigations) data.investigations = [];
    const idx = data.investigations.findIndex(i => i.id === investigation.id);
    if (idx !== -1) {
      data.investigations[idx] = investigation;
    } else {
      data.investigations.push(investigation);
    }
    this.saveData(data);
  },

  deleteInvestigation(id) {
    const data = this.getData();
    if (!data) return;
    if (!data.investigations) data.investigations = [];
    data.investigations = data.investigations.filter(i => i.id !== id);
    // Cascade delete could be added here
    this.saveData(data);
  },

  getEvidence(investigationId = null) {
    const data = this.getData();
    let evidence = data && data.evidence ? data.evidence : [];
    if (investigationId) {
      evidence = evidence.filter(e => e.investigationId === investigationId);
    }
    return evidence;
  },

  saveEvidence(evidence) {
    const data = this.getData();
    if (!data) return;
    if (!data.evidence) data.evidence = [];
    const idx = data.evidence.findIndex(e => e.id === evidence.id);
    if (idx !== -1) {
      data.evidence[idx] = evidence;
    } else {
      data.evidence.push(evidence);
    }
    this.saveData(data);
  },

  deleteEvidence(id) {
    const data = this.getData();
    if (!data) return;
    if (!data.evidence) data.evidence = [];
    data.evidence = data.evidence.filter(e => e.id !== id);
    this.saveData(data);
  },

  getFindings(investigationId = null) {
    const data = this.getData();
    let findings = data && data.findings ? data.findings : [];
    if (investigationId) {
      findings = findings.filter(f => f.investigationId === investigationId);
    }
    return findings;
  },

  saveFinding(finding) {
    const data = this.getData();
    if (!data) return;
    if (!data.findings) data.findings = [];
    const idx = data.findings.findIndex(f => f.id === finding.id);
    if (idx !== -1) {
      data.findings[idx] = finding;
    } else {
      data.findings.push(finding);
    }
    this.saveData(data);
  },

  deleteFinding(id) {
    const data = this.getData();
    if (!data) return;
    if (!data.findings) data.findings = [];
    data.findings = data.findings.filter(f => f.id !== id);
    this.saveData(data);
  },

  getTimeline(investigationId = null) {
    const data = this.getData();
    let timeline = data && data.timeline ? data.timeline : [];
    if (investigationId) {
      timeline = timeline.filter(t => t.investigationId === investigationId);
    }
    return timeline;
  },

  saveTimelineEvent(event) {
    const data = this.getData();
    if (!data) return;
    if (!data.timeline) data.timeline = [];
    const idx = data.timeline.findIndex(t => t.id === event.id);
    if (idx !== -1) {
      data.timeline[idx] = event;
    } else {
      data.timeline.push(event);
    }
    this.saveData(data);
  },

  deleteTimelineEvent(id) {
    const data = this.getData();
    if (!data) return;
    if (!data.timeline) data.timeline = [];
    data.timeline = data.timeline.filter(t => t.id !== id);
    this.saveData(data);
  },

  getRelationships() {
    const data = this.getData();
    return data && data.relationships ? data.relationships : [];
  },

  getNodes() {
    const data = this.getData();
    return data && data.nodes ? data.nodes : [];
  },

  saveNode(node) {
    const data = this.getData();
    if (!data) return;
    if (!data.nodes) data.nodes = [];
    const idx = data.nodes.findIndex(n => n.id === node.id);
    if (idx !== -1) {
      data.nodes[idx] = node;
    } else {
      data.nodes.push(node);
    }
    this.saveData(data);
  },

  deleteNode(id) {
    const data = this.getData();
    if (!data) return;
    if (!data.nodes) data.nodes = [];
    if (!data.relationships) data.relationships = [];
    data.nodes = data.nodes.filter(n => n.id !== id);
    data.relationships = data.relationships.filter(r => r.fromId !== id && r.toId !== id);
    this.saveData(data);
  },

  saveRelationship(rel) {
    const data = this.getData();
    if (!data) return;
    if (!data.relationships) data.relationships = [];
    const idx = data.relationships.findIndex(r => r.id === rel.id);
    if (idx !== -1) {
      data.relationships[idx] = rel;
    } else {
      data.relationships.push(rel);
    }
    this.saveData(data);
  },

  deleteRelationship(id) {
    const data = this.getData();
    if (!data) return;
    if (!data.relationships) data.relationships = [];
    data.relationships = data.relationships.filter(r => r.id !== id);
    this.saveData(data);
  },

  getSettings() {
    const settingsStr = localStorage.getItem(this.SETTINGS_KEY);
    if (!settingsStr) return {};
    try {
      return JSON.parse(settingsStr);
    } catch (e) {
      return {};
    }
  },

  saveSettings(settings) {
    localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
  },

  exportJSON() {
    const data = this.getData();
    return JSON.stringify(data, null, 2);
  },

  importJSON(jsonStr) {
    try {
      const data = JSON.parse(jsonStr);
      if (data && data.investigations) {
        this.saveData(data);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to import JSON', e);
      return false;
    }
  },

  exportCSV() {
    const evidence = this.getEvidence();
    if (!evidence.length) return '';
    const headers = Object.keys(evidence[0]).join(',');
    const rows = evidence.map(e => {
      return Object.values(e).map(val => \`"\${String(val).replace(/"/g, '""')}"\`).join(',');
    });
    return [headers, ...rows].join('\\n');
  },

  initDemoData() {
    if (!this.getData()) {
      const initData = {
        investigations: [DEMO_INVESTIGATION],
        evidence: [...DEMO_EVIDENCE],
        findings: [...DEMO_FINDINGS],
        timeline: [...DEMO_TIMELINE],
        relationships: [...DEMO_RELATIONSHIPS],
        nodes: [...DEMO_NODES],
        stats: {...DEMO_STATS}
      };
      this.saveData(initData);
      
      if (!localStorage.getItem(this.THEME_KEY)) {
        localStorage.setItem(this.THEME_KEY, 'dark');
      }
    }
  },

  clearAll() {
    localStorage.removeItem(this.DATA_KEY);
    localStorage.removeItem(this.SETTINGS_KEY);
    localStorage.removeItem(this.THEME_KEY);
  },

  generateId(prefix) {
    return \`\${prefix}-\${Date.now()}\`;
  },

  searchAll(query) {
    query = query.toLowerCase();
    const results = [];
    const data = this.getData();
    if (!data) return results;

    data.investigations.forEach(inv => {
      if (inv.name.toLowerCase().includes(query) || inv.description.toLowerCase().includes(query)) {
        results.push({ type: 'Investigation', item: inv, matchField: inv.name });
      }
    });

    data.evidence.forEach(ev => {
      if (ev.source.toLowerCase().includes(query) || ev.description.toLowerCase().includes(query)) {
        results.push({ type: 'Evidence', item: ev, matchField: ev.source });
      }
    });

    data.findings.forEach(f => {
      if (f.title.toLowerCase().includes(query) || f.description.toLowerCase().includes(query)) {
        results.push({ type: 'Finding', item: f, matchField: f.title });
      }
    });
    
    return results;
  }
};

// Auto-initialize demo data on load if empty
OSINTStorage.initDemoData();
