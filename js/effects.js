// Visual Effects
// ==============
// Functions for visual effects like glitch and matrix

// Glitch effect for welcome ASCII art
export function randomGlitch() {
    console.log('🎨 randomGlitch() called');
    const asciiArt = document.querySelector('.ascii-art');
    console.log('🎯 Found ASCII art element:', asciiArt);

    if (!asciiArt) {
        console.log('❌ No .ascii-art element found!');
        return;
    }

    console.log('✅ Starting glitch loop');

    let glitchTimeoutId = null;
    let glitchActive = false;

    function checkGlitch() {
        // Only run glitch if page is visible (save CPU when tab is inactive)
        if (document.hidden) {
            console.log('⏸️ Page hidden, pausing glitch');
            const nextCheck = Math.floor(Math.random() * 5500) + 500;
            glitchTimeoutId = setTimeout(checkGlitch, nextCheck);
            return;
        }

        if (Math.random() < 0.95) {
            console.log('⚡ Triggering glitch!');
            asciiArt.classList.add('glitch');
            asciiArt.setAttribute('data-text', asciiArt.textContent);
            glitchActive = true;

            const glitchDuration = Math.floor(Math.random() * 1700) + 800;
            setTimeout(() => {
                asciiArt.classList.remove('glitch');
                glitchActive = false;
                console.log('✅ Glitch removed');
            }, glitchDuration);
        }

        const nextCheck = Math.floor(Math.random() * 5500) + 500;
        glitchTimeoutId = setTimeout(checkGlitch, nextCheck);
    }

    // Pause glitch when tab becomes hidden, resume when visible
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            console.log('👁️ Tab hidden - glitch will pause on next cycle');
            if (glitchActive) {
                asciiArt.classList.remove('glitch');
                glitchActive = false;
            }
        } else {
            console.log('👁️ Tab visible - glitch resumed');
        }
    });

    checkGlitch();
}

// Boot sequence overlay that mimics a BIOS/OS boot
export function showBootSequence() {
    return new Promise((resolve) => {
        // Fullscreen overlay shell
        const root = document.createElement('div');
        root.id = 'boot-overlay';
        root.style.position = 'fixed';
        root.style.inset = '0';
        root.style.zIndex = '99999';
        root.style.background = '#000';

        // Build a proper CRT screen with same classes as the app
        const screen = document.createElement('div');
        screen.className = 'crt-screen crt-scanlines crt-flicker';
        screen.style.width = '100vw';
        screen.style.height = '100vh';
        const term = document.createElement('div');
        term.className = 'terminal crt-colorsep';
        // Use same font/color/animations by leveraging .terminal + info-text
        const pre = document.createElement('pre');
        pre.className = 'info-text';
        pre.style.margin = '0';
        pre.style.whiteSpace = 'pre-wrap';
        term.appendChild(pre);
        screen.appendChild(term);
        const badge = document.createElement('div');
        badge.className = 'overlay';
        badge.textContent = 'TERM-1';
        screen.appendChild(badge);
        root.appendChild(screen);
        // Hide until fonts are ready to avoid flash of wrong size/font
        root.style.visibility = 'hidden';
        document.body.appendChild(root);

        const lines = [
            'RAVON.DEV BIOS v1.00',
            'Copyright (C) Ravon Industries',
            '',
            'CPU: Retro-CRT x86_64           Memory: 65536 KB  [OK]',
            'Devices: KBD [OK]   CRT [OK]    NET [OK]',
            'Boot Order: CRT-0  MATRIX-1  NET-2',
            '',
            'Calibrating scanlines.................... [OK]',
            'Warming phosphor glow.................... [OK]',
            'Applying chromatic aberration............ [OK]',
            'Loading jokes database................... [3 warnings]',
            'Checking Ben&Jerry supply................ [ABUNDANT]',
            'Consulting white rabbit.................. [BUSY]',
            'Charging flux capacitor.................. [OK]',
            'Tuning RGB split shaders................. [OK]',
            'Enabling Tailscale magic................. [NAT TRAVERSAL OK]',
            'Spinning Docker daemons.................. [HAPPY WHALES]',
            'Proxmox handshake........................ [HIGH FIVE]',
            'Organizing cables........................ [IT\'S A MESS]',
            'Counting stars in the Matrix............. [LOTS]',
            'Mounting /home/guest..................... [OK]',
            'Starting snake driver.................... [COILS READY]',
            'Feeding cats............................. [PURR]',
            'Encrypting pizza......................... [DELICIOUS]',
            'Reassuring servers....................... [YOU GOT THIS]',
            'One more thing........................... [JUST KIDDING]',
            '',
            'Starting RavonOS terminal................ [OK]',
            'Press ESC to skip',
        ];

        let idx = 0;
        let cancelled = false;
        function cleanup() {
            document.removeEventListener('keydown', onKey, { capture: true });
            document.removeEventListener('click', onKey, { capture: true });
            document.removeEventListener('touchstart', onKey, { capture: true });
            if (root.parentNode) root.parentNode.removeChild(root);
        }
        function onKey(e) {
            cancelled = true;
            cleanup();
            resolve();
        }
        document.addEventListener('keydown', onKey, { capture: true });
        document.addEventListener('click', onKey, { capture: true });
        document.addEventListener('touchstart', onKey, { capture: true });

        const baseDelay = 160; // baseline per line
        function writeNext() {
            if (cancelled) return;
            if (idx < lines.length) {
                pre.textContent += lines[idx] + '\n';
                idx++;
                // Add a little random jitter so it feels more organic
                const jitter = 80 + Math.floor(Math.random() * 220); // 80..300ms
                setTimeout(writeNext, baseDelay + jitter);
            } else {
                setTimeout(() => {
                    cleanup();
                    resolve();
                }, 1800);
            }
        }
        const start = () => { root.style.visibility = 'visible'; writeNext(); };
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(start).catch(start);
        } else {
            start();
        }
    });
}

// Simple image viewer overlay; closes on any key, click, or tap
export function openImageViewer(src) {
    const overlay = document.createElement('div');
    overlay.id = 'image-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.background = 'rgba(0,0,0,0.8)';
    overlay.style.zIndex = '99998';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.className = 'crt-scanlines crt-flicker crt-colorsep';

    const img = document.createElement('img');
    img.src = src;
    img.alt = 'image';
    img.style.maxWidth = '90vw';
    img.style.maxHeight = '80vh';
    img.style.boxShadow = '0 0 20px rgba(255,255,255,0.3)';
    img.style.borderRadius = '6px';
    overlay.appendChild(img);

    function cleanup() {
        document.removeEventListener('keydown', onKey, { capture: true });
        document.removeEventListener('click', onClick, { capture: true });
        document.removeEventListener('touchstart', onClick, { capture: true });
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }
    function onKey() { cleanup(); }
    function onClick() { cleanup(); }

    document.addEventListener('keydown', onKey, { capture: true });
    document.addEventListener('click', onClick, { capture: true });
    document.addEventListener('touchstart', onClick, { capture: true });
    document.body.appendChild(overlay);
}

// Family slideshow overlay
export function startSlideshow(items, options = {}) {
    const settings = Object.assign({ interval: 3000 }, options);
    if (!items || !items.length) return;

    let idx = 0;
    let playing = true;

    const overlay = document.createElement('div');
    overlay.id = 'slideshow-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.background = 'rgba(0,0,0,0.85)';
    overlay.style.zIndex = '99998';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.className = 'crt-scanlines crt-flicker crt-colorsep';

    const img = document.createElement('img');
    img.style.maxWidth = '92vw';
    img.style.maxHeight = '82vh';
    img.style.boxShadow = '0 0 20px rgba(255,255,255,0.25)';
    img.style.borderRadius = '6px';
    img.alt = 'slideshow image';
    overlay.appendChild(img);

    // Controls hint (bottom-right)
    const controls = document.createElement('div');
    controls.className = 'overlay';
    controls.style.right = '30px';
    controls.style.left = 'auto';
    controls.style.bottom = '20px';
    controls.style.fontSize = '18px';
    controls.textContent = 'Space: pause/play  ←/→: prev/next  Esc: close';
    overlay.appendChild(controls);

    // Caption (bottom-left)
    const captionBox = document.createElement('div');
    captionBox.className = 'overlay';
    captionBox.style.left = '30px';
    captionBox.style.right = 'auto';
    captionBox.style.bottom = '20px';
    captionBox.style.fontSize = '22px';
    captionBox.style.color = '#66ccff';
    overlay.appendChild(captionBox);

    const images = items;

    function normalizeItem(entry) {
        if (typeof entry === 'string') return { src: entry, caption: '' };
        if (entry && typeof entry === 'object') return { src: entry.src, caption: entry.caption || '' };
        return { src: '', caption: '' };
    }

    function show(i) {
        idx = (i + images.length) % images.length;
        const it = normalizeItem(images[idx]);
        img.src = it.src;
        captionBox.textContent = it.caption || '';
        img.onload = () => {};
    }

    function cleanup() {
        stop();
        document.removeEventListener('keydown', onKey, { capture: true });
        document.removeEventListener('click', onClick, { capture: true });
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }

    function onKey(e) {
        if ([' ', 'ArrowLeft', 'ArrowRight', 'Escape'].includes(e.key)) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (e.key === ' ') {
            playing = !playing;
            if (playing) start(); else stop();
        } else if (e.key === 'ArrowLeft') {
            show(idx - 1);
        } else if (e.key === 'ArrowRight') {
            show(idx + 1);
        } else if (e.key === 'Escape') {
            cleanup();
        }
    }

    function onClick() {
        // Single click toggles play/pause
        playing = !playing;
        if (playing) start(); else stop();
    }

    let timer = null;
    function start() {
        clearInterval(timer);
        timer = setInterval(() => show(idx + 1), settings.interval);
    }
    function stop() { clearInterval(timer); timer = null; }

    document.addEventListener('keydown', onKey, { capture: true });
    document.addEventListener('click', onClick, { capture: true });
    document.body.appendChild(overlay);
    show(idx);
    start();
}
// Matrix digital rain effect
export function createMatrixEffect() {
    console.log('🎬 Matrix effect started!');

    // ============================================
    // CONFIGURATION - Change these to test different styles!
    // ============================================
    const DEBUG_MODE = false;     // Set to true to show debug overlay text
    const config = {
        scope: 'fullpage',        // 'fullpage' or 'terminal'
        background: 'dim',        // 'hide', 'dim', or 'visible'
        duration: 10000,          // milliseconds (10 seconds)
        backgroundOpacity: 0.4    // 0.0 = fully transparent, 1.0 = solid black
    };
    console.log('⚙️ Config:', config);
    // ============================================

    // Create overlay container
    const overlay = document.createElement('div');
    console.log('📦 Overlay created:', overlay);
    overlay.id = 'matrix-overlay';
    overlay.style.position = 'fixed';
    overlay.style.zIndex = '9999';
    overlay.style.backgroundColor = `rgba(0, 0, 0, ${config.backgroundOpacity})`;
    overlay.style.opacity = '1';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.pointerEvents = 'auto';

    // Apply CRT effects to overlay
    overlay.className = 'crt-scanlines crt-flicker crt-colorsep';

    // Set scope (fullpage or terminal-only)
    const terminalElement = document.querySelector('.crt-screen');
    if (config.scope === 'fullpage') {
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
    } else {
        // Terminal-only scope
        const rect = terminalElement.getBoundingClientRect();
        overlay.style.top = rect.top + 'px';
        overlay.style.left = rect.left + 'px';
        overlay.style.width = rect.width + 'px';
        overlay.style.height = rect.height + 'px';
        overlay.style.borderRadius = '8px';
    }

    // Set background visibility (what happens to content behind)
    if (config.background === 'hide') {
        terminalElement.style.opacity = '0';
    } else if (config.background === 'dim') {
        terminalElement.style.opacity = '0.3';
    } else {
        terminalElement.style.opacity = '1';
    }

    // Debug overlay text (only shown when DEBUG_MODE = true)
    let debugText = null;
    if (DEBUG_MODE) {
        debugText = document.createElement('div');
        debugText.style.position = 'absolute';
        debugText.style.top = '50%';
        debugText.style.left = '50%';
        debugText.style.transform = 'translate(-50%, -50%)';
        debugText.style.color = '#00ff00';
        debugText.style.fontSize = '20px';
        debugText.style.fontFamily = 'monospace';
        debugText.style.zIndex = '10000';
        debugText.textContent = 'MATRIX OVERLAY VISIBLE - Loading...';
        overlay.appendChild(debugText);
    }

    // Create canvas for Matrix effect
    const canvas = document.createElement('canvas');
    canvas.style.display = 'block';
    canvas.style.position = 'relative';
    canvas.style.zIndex = '1001';

    // Add canvas to overlay and overlay to page FIRST (before reading dimensions)
    overlay.appendChild(canvas);
    document.body.appendChild(overlay);
    console.log('✅ Overlay appended to body');

    // Force a reflow to ensure dimensions are calculated
    overlay.offsetHeight;

    // NOW read the actual rendered dimensions
    const overlayWidth = overlay.offsetWidth || window.innerWidth;
    const overlayHeight = overlay.offsetHeight || window.innerHeight;

    canvas.width = overlayWidth;
    canvas.height = overlayHeight;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    console.log('📐 Canvas dimensions:', canvas.width, 'x', canvas.height);
    console.log('📐 Overlay dimensions:', overlayWidth, 'x', overlayHeight);
    console.log('📐 Window dimensions:', window.innerWidth, 'x', window.innerHeight);

    // Safety check
    if (canvas.width === 0 || canvas.height === 0) {
        console.error('❌ Canvas has zero dimensions! Aborting.');
        if (DEBUG_MODE) {
            alert('Matrix Error: Canvas has zero dimensions!\nCanvas: ' + canvas.width + 'x' + canvas.height + '\nOverlay: ' + overlayWidth + 'x' + overlayHeight);
        }
        terminalElement.style.opacity = '1';
        if (overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
        }
        return;
    }

    // Update debug text with canvas info (only in DEBUG_MODE)
    if (DEBUG_MODE && debugText) {
        debugText.textContent = 'Canvas: ' + canvas.width + 'x' + canvas.height + ' - Starting...';
    }

    // Track animation frames for debugging
    let frameCount = 0;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('❌ Could not get canvas context! Aborting.');
        terminalElement.style.opacity = '1';
        if (overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
        }
        return;
    }

    // Matrix characters - katakana, numbers, symbols
    const matrixChars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789:・."=*+-<>¦|';
    const chars = matrixChars.split('');

    const fontSize = 16;
    const columns = Math.floor(canvas.width / fontSize);

    // Array to track drop position for each column
    const drops = [];
    for (let x = 0; x < columns; x++) {
        drops[x] = Math.floor(Math.random() * -100);
    }

    // Draw function for animation
    function draw() {
        frameCount++;

        // Update debug text every 30 frames (only in DEBUG_MODE)
        if (DEBUG_MODE && debugText && frameCount % 30 === 0 && debugText.parentNode) {
            debugText.textContent = 'Frames: ' + frameCount + ' | Columns: ' + columns;
        }

        // Semi-transparent black to create trail effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = fontSize + 'px monospace';

        // Draw characters for each column
        for (let i = 0; i < drops.length; i++) {
            // Random character
            const text = chars[Math.floor(Math.random() * chars.length)];
            const x = i * fontSize;
            const y = drops[i] * fontSize;

            // Draw with chromatic aberration effect (RGB split like terminal prompt)
            // Magenta/pink layer (offset right) - STRONGER EFFECT
            ctx.fillStyle = 'rgba(234, 54, 175, 0.8)';
            ctx.fillText(text, x + 2, y);

            // Cyan/green layer (offset left) - STRONGER EFFECT
            ctx.fillStyle = 'rgba(117, 250, 105, 0.8)';
            ctx.fillText(text, x - 2, y);

            // Main bright green text (centered)
            ctx.fillStyle = '#0F0';
            ctx.fillText(text, x, y);

            // Reset drop to top randomly after reaching bottom
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }

            // Move drop down
            drops[i]++;
        }
    }

    // Function to clean up and remove overlay
    function cleanup() {
        clearInterval(intervalId);
        document.removeEventListener('keydown', exitHandler, { capture: true });
        document.removeEventListener('touchstart', exitHandler, { capture: true });
        document.removeEventListener('click', exitHandler, { capture: true });
        terminalElement.style.opacity = '1'; // Restore visibility
        if (overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
        }
    }

    // Exit handler for keypress/touch/click
    let exitHandlersActive = false;
    function exitHandler(e) {
        if (!exitHandlersActive) {
            console.log('⚠️ Exit handler called but not active yet, ignoring');
            return;
        }
        console.log('✋ Exit handler triggered by:', e.type);
        e.preventDefault();
        e.stopPropagation();
        cleanup();
    }

    // Start animation
    const intervalId = setInterval(draw, 33);
    console.log('🎬 Animation started with', columns, 'columns');

    // Add exit handlers immediately (but they won't trigger until activated)
    document.addEventListener('keydown', exitHandler, { capture: true });
    document.addEventListener('touchstart', exitHandler, { capture: true });
    document.addEventListener('click', exitHandler, { capture: true });
    console.log('⌨️ Keydown, touch, and click listeners added (capture phase)');

    // Activate exit handlers after 1 second delay to prevent accidental immediate exit
    setTimeout(() => {
        exitHandlersActive = true;
        console.log('✅ Exit handlers now active');
        if (DEBUG_MODE && debugText && debugText.parentNode) {
            debugText.textContent = 'TAP OR PRESS KEY TO EXIT';
        }
    }, 1000);

    // Hide debug text after 4 seconds (only in DEBUG_MODE)
    if (DEBUG_MODE) {
        setTimeout(() => {
            if (debugText && debugText.parentNode) {
                debugText.remove();
            }
        }, 4000);
    }

    // Auto-stop after duration
    setTimeout(() => {
        cleanup();
    }, config.duration);

    console.log('✅ Matrix effect fully initialized!');
}
