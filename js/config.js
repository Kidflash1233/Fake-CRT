// Configuration and Constants
// ===========================
// All static configuration values, ASCII art, and templates

// Session tracking
export const SESSION_START = Date.now();

// ASCII Art for Ravon "R" logo (used in neofetch)
export const ARCH_LOGO = `
███████████     
██       ██     
██       ██     
██      ██      
█████████       
██  ██          
██   ██         
██    ██        
██     ██   ▄▄▄ 
██      ██  ▀█▀ 
               
   R  A  V  O  N
`;

// Set of characters that indicate ASCII art lines
export const asciiArtLeaders = new Set([
    '▄','█','▀','╔','╗','╚','╝','╦','╩','╬','╠','╣','╤','╧','╪','╫','╟','╢','╥','╨',
    '╒','╕','╘','╛','╞','╡','╖','╓','╙','╳','╱','╲','┌','┐','└','┘','┼','├','┤','┬',
    '┴','─','│','╭','╮','╯','╰','░','▒','▓','╪','═','▁','▂','▃','▅','▆','▇'
]);

// Main ASCII art banner (original)
export const asciiArt =
` ███████████                                                ██████████
░░███░░░░░███                                              ░░███░░░░███
 ░███    ░███   ██████   █████ █████  ██████  ████████      ░███   ░░███  ██████  █████ █████
 ░██████████   ░░░░░███ ░░███ ░░███  ███░░███░░███░░███     ░███    ░███ ███░░███░░███ ░░███
 ░███░░░░░███   ███████  ░███  ░███ ░███ ░███ ░███ ░███     ░███    ░███░███████  ░███  ░███
 ░███    ░███  ███░░███  ░░███ ███  ░███ ░███ ░███ ░███     ░███    ███ ░███░░░   ░░███ ███
 █████   █████░░████████  ░░█████   ░░██████  ████ █████ ██ ██████████  ░░██████   ░░█████
░░░░░   ░░░░░  ░░░░░░░░    ░░░░░     ░░░░░░  ░░░░ ░░░░░ ░░ ░░░░░░░░░░    ░░░░░░     ░░░░░    `;

// Backward-compat alias for consumers expecting a named logo constant
export const RAVON_DEV_LOGO = asciiArt;

// Welcome message template
export const welcomeTemplate = `
<pre class="output-line ascii-art welcome-text">
${asciiArt}
</pre>
<div class="output-line welcome-text">Welcome to my website!</div>
<div class="output-line info-text">Type 'contact' to get in touch, and 'help' for more commands to try.</div>
<div class="output-line welcome-divider">══════════════════════════════════════</div>
`;

// Optional: set this to your email to prefill the composer in `contact` flow
// Example: export const CONTACT_EMAIL = 'you@example.com';
export const CONTACT_EMAIL = 'admin@ravon.dev';
