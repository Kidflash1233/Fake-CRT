// Main Terminal Orchestrator
// ==========================
// Imports and coordinates all modules

import { randomGlitch, showBootSequence } from './effects.js';
import {
    setTerminalElements,
    updateCursorPosition as updateCursorPos,
    renderWelcome
} from './rendering.js';
import { setOutputElement, commands, processCommand } from './commands.js';

// Command history (module-level state)
let commandHistory = [];
let historyIndex = -1;
let initialized = false;

// Expose state for commands module (use getter for live reference)
window.terminalState = {
    get commandHistory() { return commandHistory; },
    setHistoryIndex: (index) => { historyIndex = index; },
    interactiveHandler: null,
    setInteractiveHandler(fn) { this.interactiveHandler = fn || null; },
    isInteractive() { return typeof this.interactiveHandler === 'function'; },
    cwd: '/home/guest',
    setCwd: (path) => { window.terminalState.cwd = path || '/'; updatePrompt(); },
    getPromptString: () => {
        const cwd = window.terminalState.cwd || '/';
        const home = '/home/guest';
        const shown = cwd === home ? '~' : cwd;
        return `guest@terminal:${shown}$`;
    }
};

// Initialize terminal
function init() {
    if (initialized) return;
    initialized = true;

    // Select DOM elements (now that DOM is ready)
    const output = document.getElementById('output');
    const input = document.getElementById('input');
    const inputDisplay = document.getElementById('input-display');
    const terminal = document.getElementById('terminal');
    const cursor = document.getElementById('cursor');
    const prompt = document.querySelector('.prompt');

    // Verify elements exist
    if (!output || !input || !inputDisplay || !terminal || !cursor || !prompt) {
        console.error('Failed to find required DOM elements');
        return;
    }

    // Initialize rendering module with terminal elements
    setTerminalElements(output, terminal);
    setOutputElement(output);

    // Update cursor position wrapper
    function updateCursorPosition() {
        updateCursorPos(input, inputDisplay, cursor);
    }

    function updatePrompt() {
        if (prompt) {
            prompt.textContent = window.terminalState.getPromptString();
        }
    }
    // Make updatePrompt available to terminalState methods
    window.updatePrompt = updatePrompt;

    // Update display on input
    input.addEventListener('input', updateCursorPosition);

    // Handle input - prevent newlines in textarea
    input.addEventListener('keydown', (e) => {
        // Handle special exits for interactive flows (e.g., nano)
        if (window.terminalState.isInteractive()) {
            const handler = window.terminalState.interactiveHandler;
            if (e.key === 'Escape') {
                e.preventDefault();
                if (handler) handler(':esc', input, updateCursorPosition);
                return;
            }
            if (e.ctrlKey && (e.key === 'x' || e.key === 'X')) {
                e.preventDefault();
                if (handler) handler(':ctrlx', input, updateCursorPosition);
                return;
            }
        }
        if (e.key === 'Enter') {
            e.preventDefault();
            // Route to interactive handler if active
            if (window.terminalState.isInteractive()) {
                const handler = window.terminalState.interactiveHandler;
                if (handler) handler(input.value.trim(), input, updateCursorPosition);
            } else {
                processCommand(input.value.trim(), input, updateCursorPosition);
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (window.terminalState.isInteractive()) {
                // Ignore history navigation during interactive flows
                return;
            }
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                input.value = commandHistory[historyIndex];
                updateCursorPosition();
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (window.terminalState.isInteractive()) {
                // Ignore history navigation during interactive flows
                return;
            }
            if (historyIndex > 0) {
                historyIndex--;
                input.value = commandHistory[historyIndex];
                updateCursorPosition();
            } else if (historyIndex === 0) {
                historyIndex = -1;
                input.value = '';
                updateCursorPosition();
            }
        } else if (e.key === 'Tab') {
            e.preventDefault();
            // Disable autocompletion inside interactive sessions
            if (!window.terminalState.isInteractive()) {
                const partial = input.value.toLowerCase();
                const matches = Object.keys(commands).filter(cmd => cmd.startsWith(partial));
                if (matches.length === 1) {
                    input.value = matches[0];
                    updateCursorPosition();
                }
            }
        }
    });

    // Keep focus on input - click anywhere focuses textarea
    terminal.addEventListener('click', () => {
        input.focus();
    });

    // Handle touches for mobile
    terminal.addEventListener('touchend', () => {
        input.focus();
    });

    // Also handle clicks on cursor specifically for mobile
    cursor.addEventListener('click', (e) => {
        e.stopPropagation();
        input.focus();
    });

    // Handle clicks on input display
    inputDisplay.addEventListener('click', (e) => {
        e.stopPropagation();
        input.focus();
    });

    // Boot sequence, then render welcome
    input.disabled = true;
    updatePrompt();
    showBootSequence().then(() => {
        renderWelcome();
        // Start glitch effect on ASCII art now that it exists
        randomGlitch();
        input.disabled = false;
        input.focus();
    }).catch(() => {
        renderWelcome();
        randomGlitch();
        input.disabled = false;
        input.focus();
    });

    // Wait a moment for DOM to fully render before positioning cursor
    setTimeout(() => {
        updateCursorPosition();
        updatePrompt();
    }, 100);
}

// Ensure init runs once when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
    // DOM is already ready (e.g., script injected after load)
    init();
}
