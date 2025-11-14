// Main Terminal Orchestrator
// ==========================
// Imports and coordinates all modules

import { randomGlitch } from './effects.js';
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
    setHistoryIndex: (index) => { historyIndex = index; }
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

    // Update display on input
    input.addEventListener('input', updateCursorPosition);

    // Handle input - prevent newlines in textarea
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            processCommand(input.value.trim(), input, updateCursorPosition);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                input.value = commandHistory[historyIndex];
                updateCursorPosition();
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
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
            const partial = input.value.toLowerCase();
            const matches = Object.keys(commands).filter(cmd => cmd.startsWith(partial));
            if (matches.length === 1) {
                input.value = matches[0];
                updateCursorPosition();
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

    // Render welcome message
    input.disabled = true;
    renderWelcome();
    input.disabled = false;
    input.focus();

    // Wait a moment for DOM to fully render before positioning cursor
    setTimeout(() => {
        updateCursorPosition();
        // Start glitch effect on ASCII art
        randomGlitch();
    }, 100);
}

// Ensure init runs once when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
    // DOM is already ready (e.g., script injected after load)
    init();
}
