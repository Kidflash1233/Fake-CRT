// Rendering Functions
// ===================
// Functions for displaying content to the terminal

import { asciiArtLeaders, welcomeTemplate } from './config.js';

// Get terminal elements (will be set from main.js)
let output, terminal;

export function setTerminalElements(outputEl, terminalEl) {
    output = outputEl;
    terminal = terminalEl;
}

// Check if a line looks like ASCII art
export function looksLikeAsciiArt(line) {
    const trimmed = line.trim();
    if (!trimmed) return false;
    return asciiArtLeaders.has(trimmed[0]);
}

// Helper to scroll terminal to bottom
export function scrollToBottom() {
    terminal.scrollTop = terminal.scrollHeight;
}

// Update display text and position textarea at cursor
export function updateCursorPosition(input, inputDisplay, cursor) {
    inputDisplay.textContent = input.value;

    // Position textarea at cursor location for mobile keyboard
    const cursorRect = cursor.getBoundingClientRect();
    input.style.left = cursorRect.left + 'px';
    input.style.top = cursorRect.top + 'px';
}

// Render welcome message
export function renderWelcome() {
    const template = document.createElement('template');
    template.innerHTML = welcomeTemplate.trim();
    output.appendChild(template.content.cloneNode(true));
    scrollToBottom();
}

// Type text with animation
export function typeText(text, element, speed = 30) {
    return new Promise((resolve) => {
        let index = 0;
        const lines = text.split('\n');

        function typeLine() {
            if (index < lines.length) {
                const line = document.createElement('div');
                line.className = 'output-line';

                // Apply special styling for certain lines
                if (looksLikeAsciiArt(lines[index])) {
                    line.className += ' ascii-art';
                } else if (lines[index].includes('Welcome') || lines[index].includes('CRT Terminal')) {
                    line.className += ' welcome-text';
                } else if (lines[index].includes('Type') || lines[index].includes('help')) {
                    line.className += ' info-text';
                }

                line.textContent = lines[index];
                element.appendChild(line);
                index++;

                // Scroll to bottom
                scrollToBottom();

                setTimeout(typeLine, speed);
            } else {
                resolve();
            }
        }

        typeLine();
    });
}

// Configuration for memory management
const MAX_OUTPUT_CHILDREN = 200; // Keep last 200 elements (includes commands + output)

// Limit terminal output to prevent memory bloat
function limitOutputSize() {
    const children = output.children;
    const toRemove = children.length - MAX_OUTPUT_CHILDREN;

    if (toRemove > 0) {
        // Remove oldest elements
        for (let i = 0; i < toRemove; i++) {
            output.removeChild(children[0]);
        }
        console.log(`♻️ Cleaned up ${toRemove} old output lines`);
    }
}

// Add output to terminal
export function addOutput(text, className = '') {
    if (text === null) return;

    // Handle structured data via renderer registry
    if (typeof text === 'object' && text.type) {
        const renderer = structuredRenderers[text.type];
        if (renderer) {
            renderer(text.data);
            limitOutputSize(); // Cleanup after adding structured content
            return;
        }
        console.warn(`No renderer found for type: ${text.type}`);
    }

    const lines = text.split('\n');
    lines.forEach(line => {
        const div = document.createElement('div');
        let lineClass = 'output-line ' + className;
        if (looksLikeAsciiArt(line)) {
            lineClass += ' ascii-art';
        }
        div.className = lineClass.trim();
        div.textContent = line;
        output.appendChild(div);
    });

    limitOutputSize(); // Cleanup after adding output
    scrollToBottom();
}

// Append a single output line and return the element (for dynamic updates)
export function appendLine(text, className = '') {
    const div = document.createElement('div');
    div.className = ('output-line ' + className).trim();
    div.textContent = text;
    output.appendChild(div);
    limitOutputSize();
    scrollToBottom();
    return div;
}

// Append an arbitrary node to output and keep terminal scrolled
export function appendNode(node) {
    output.appendChild(node);
    limitOutputSize();
    scrollToBottom();
    return node;
}

// Registry for structured command renderers
const structuredRenderers = {
    neofetch: (data) => renderNeofetch(data)
    // Future structured commands can be added here:
    // htop: (data) => renderHtop(data),
    // gitStatus: (data) => renderGitStatus(data),
};

// Render neofetch output
function renderNeofetch(data) {
    // Defensive checks
    if (!data?.info) {
        console.error('renderNeofetch: Invalid data structure', data);
        return;
    }

    const container = document.createElement('div');
    container.className = 'neofetch-container';

    // Logo column
    const logoDiv = document.createElement('pre');
    logoDiv.className = 'neofetch-logo';
    logoDiv.textContent = data.logo;

    // Info column
    const infoDiv = document.createElement('div');
    infoDiv.className = 'neofetch-info';
    infoDiv.setAttribute('aria-label', 'System Information');

    // Header
    const header = document.createElement('div');
    header.className = 'neofetch-header';
    header.textContent = data.header;
    infoDiv.appendChild(header);

    // Divider
    const divider = document.createElement('div');
    divider.className = 'neofetch-divider';
    divider.textContent = data.divider;
    infoDiv.appendChild(divider);

    // Info lines as semantic definition list
    const dl = document.createElement('dl');
    data.info.forEach(item => {
        const dt = document.createElement('dt');
        dt.className = 'neofetch-label';
        dt.textContent = item.label;

        const dd = document.createElement('dd');
        dd.className = 'neofetch-value';

        // Clickable link if value looks like a URL or if item.url provided
        const val = item.value;
        if (item.url || (typeof val === 'string' && /^https?:\/\//i.test(val))) {
            const a = document.createElement('a');
            a.href = item.url || val;
            a.textContent = (typeof val === 'string') ? val : (item.text || item.url);
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.style.color = '#66ccff';
            dd.appendChild(a);
        } else {
            dd.textContent = typeof val === 'string' ? val : String(val);
        }

        dl.appendChild(dt);
        dl.appendChild(dd);
    });
    infoDiv.appendChild(dl);

    container.appendChild(logoDiv);
    container.appendChild(infoDiv);
    output.appendChild(container);
    scrollToBottom();
}
