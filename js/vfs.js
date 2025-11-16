// Simple Virtual Filesystem for the CRT terminal
// Provides directories, text files, and images that can be opened

// Node structure: { type: 'dir'|'text'|'image', children?, content?, src?, mime? }

const NOW = () => new Date().toISOString();

const initialFS = {
    '/': { type: 'dir', children: {
        'home': { type: 'dir', children: {
            'guest': { type: 'dir', children: {
                'README.txt': { type: 'text', content: [
                    '# Welcome to Ravon.Dev',
                    '',
                    'This is a simulated filesystem.',
                    'Try commands:',
                    '  - ls, cd, pwd',
                    '  - cat README.txt',
                    '  - nano notes.txt',
                    '  - open pictures/ravon-dev.svg',
                ].join('\n') },
                'notes.txt': { type: 'text', content: [
                    'Ravon ideas:',
                    '- Homelab improvements',
                    '- Docker Compose templates',
                    '- Tailscale routes',
                ].join('\n') },
                'socrates.txt': { type: 'text', content: [
                    'Socrates — selected quotes:',
                    '',
                    '1) The only true wisdom is in knowing you know nothing.',
                    '2) The unexamined life is not worth living.',
                    '3) To find yourself, think for yourself.',
                    '',
                    `Created: ${NOW()}`,
                ].join('\n') },
                'documents': { type: 'dir', children: {
                    'about-me.txt': { type: 'text', content: [
                        'Hi, I\'m Ravon. I like:',
                        '- Ben & Jerry\'s Chocolate Fudge Brownie',
                        '- Docker, Proxmox, and Tailscale',
                        '',
                        'Find me at: ravon.dev',
                    ].join('\n') },
                } },
                'pictures': { type: 'dir', children: {
                    'ravon-dev.svg': { type: 'image', src: 'img/ravon-dev.svg', mime: 'image/svg+xml' },
                    'matrix.svg': { type: 'image', src: 'img/matrix.svg', mime: 'image/svg+xml' },
                } },
            } },
        } },
        'docs': { type: 'dir', children: {
            'credits.txt': { type: 'text', content: [
                'Credits:',
                ' - davislcruz (site)',
                ' - Ravon (inspiration)',
                ' - Open CRT effects community',
            ].join('\n') },
        } },
    } },
};

// Utilities
function clone(obj) { return JSON.parse(JSON.stringify(obj)); }

let fsTree = clone(initialFS);

// Load from localStorage if present (persist edits)
try {
    const raw = localStorage.getItem('terminalFS');
    if (raw) fsTree = JSON.parse(raw);
} catch (_) {}

function persist() {
    try { localStorage.setItem('terminalFS', JSON.stringify(fsTree)); } catch (_) {}
}

function pathJoin(a, b) {
    if (!a) return b || '/';
    if (!b) return a || '/';
    if (b.startsWith('/')) return b;
    const stack = (a === '/' ? [''] : a.split('/'));
    b.split('/').forEach(part => {
        if (!part || part === '.') return;
        if (part === '..') {
            if (stack.length > 1) stack.pop();
        } else {
            stack.push(part);
        }
    });
    const out = stack.join('/');
    return out || '/';
}

function normalize(p) {
    return pathJoin('/', p);
}

function getNode(path) {
    const parts = normalize(path).split('/').filter(Boolean);
    let cur = fsTree['/'];
    for (const part of parts) {
        if (!cur || cur.type !== 'dir') return null;
        cur = cur.children[part];
    }
    return cur || null;
}

function ensureDir(path) {
    const parts = normalize(path).split('/').filter(Boolean);
    let cur = fsTree['/'];
    for (const part of parts) {
        if (!cur.children[part]) cur.children[part] = { type: 'dir', children: {} };
        cur = cur.children[part];
        if (cur.type !== 'dir') throw new Error('Path segment is not a directory: ' + part);
    }
    persist();
    return cur;
}

function setTextFile(path, content) {
    const dir = normalize(path).split('/').slice(0, -1).join('/') || '/';
    const name = normalize(path).split('/').pop();
    const parent = getNode(dir);
    if (!parent || parent.type !== 'dir') throw new Error('Invalid directory: ' + dir);
    const existing = parent.children[name];
    if (existing && existing.type === 'dir') {
        throw new Error(`${name}: Is a directory`);
    }
    if (existing && existing.type !== 'text') {
        throw new Error(`${name}: Not a text file`);
    }
    parent.children[name] = { type: 'text', content };
    persist();
}

function list(path) {
    const node = getNode(path);
    if (!node || node.type !== 'dir') return null;
    const names = Object.keys(node.children).sort();
    return names.map(n => {
        const child = node.children[n];
        return { name: n, type: child.type };
    });
}

export const vfs = {
    list,
    getNode,
    setTextFile,
    ensureDir,
    normalize,
    join: pathJoin,
    persist,
    _reset: () => { fsTree = clone(initialFS); persist(); },
};
