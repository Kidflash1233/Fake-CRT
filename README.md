## SUPER QUICK: How to View This Page

You can’t double-click `index.html` anymore — you need to run a tiny local server.

Pick **ONE** of the options below:

---

### Option A — Python

1. Open **Terminal** (macOS/Linux) or **Command Prompt** (Windows).
2. Go into the folder where you downloaded the project. Example:
   ```bash
   cd ~/Downloads/RavonDev
   ```
   **⚠️ Don’t copy this exact path.** Change it to wherever *you* saved the folder (e.g., `Desktop`, `Documents`, etc.).
3. Start the server:
   ```bash
   python -m http.server 8000
   ```
4. Open your browser and go to **http://localhost:8000**
5. Press **Ctrl + C** in the terminal to stop the server when you're finished.

---

### Option B — Node.js

1. Open **Terminal** or **Command Prompt**.
2. Go into the folder where you downloaded the project. Example:
   ```bash
   cd ~/Downloads/RavonDev
   ```
   **⚠️ Use your actual folder path.**
3. Start the server:
   ```bash
   npx serve .
   ```
4. Open the link the command prints (usually **http://localhost:8000** or **3000**).
5. Press **Ctrl + C** to stop the server when you're done.



