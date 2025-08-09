# ASU Calculator (HTML/CSS/JS)

A clean, beginner-friendly calculator built with just HTML, CSS, and vanilla JavaScript. It’s designed to be portfolio-ready while staying approachable for a software engineering student.

Features
- Basic operations: add, subtract, multiply, divide
- Decimals, sign toggle (±), percent
- Memory: MC, MR, M+, M− (persists via localStorage)
- History: recent calculations; click any item to reuse the result
- Keyboard support: 0–9, ., + − * /, Enter/Return or =, Backspace, Escape, %
- Responsive design: works on phone and desktop
- No eval; simple state machine logic

Tech Stack
- HTML: semantic structure and ARIA where appropriate
- CSS: responsive layout and theming (dark/light aware)
- JavaScript: DOM events + a small state machine

Project Structure
- index.html — main app UI
- styles.css — styling
- app.js — calculator logic and UI behavior
- test.html — lightweight test runner (no frameworks)
- TESTING.md — how to validate features (manual and automated)
- README.md — this file
- .gitignore — ignores common local files

Getting Started
- Option 1: Double‑click index.html to open it in your browser.
- Option 2 (recommended during dev): use a simple local server (for example, VS Code Live Server).

Keyboard Shortcuts
- Digits: 0–9
- Decimal: .
- Operators: +, -, *, /
- Equals: Enter or =
- Clear: Escape (AC)
- Backspace: delete a single character
- Percent: %

Code Overview
- State is stored in a single object (displayValue, firstOperand, operator, memory, etc.).
- Button clicks and key presses update state and refresh the display.
- Immediate-execute model (like basic handheld calculators): when you chain operators, it computes the previous operation immediately.
- Results are formatted to about 12 significant digits to reduce floating‑point noise.

Accessibility
- ARIA roles/labels added to primary interactive areas (keypad, display).
- Live region for result updates.
- History is keyboard-focusable (list items are standard <li>).

How to Test
- Automated: open test.html in a browser. It runs a small test suite with pass/fail output.
- Manual: see TESTING.md for a thorough test plan with steps and expected results.

Deploy (GitHub Pages)
1. Push this folder to a GitHub repository.
2. Settings → Pages → Deploy from branch (main), folder: / (root) or /docs if you move files there.
3. Wait for the link to become active and add it to your resume/portfolio.

Future Ideas
- Scientific functions (sin, cos, tan, sqrt)
- Parentheses and an expression parser
- Theme toggle
- A progressive web app (PWA) wrapper

License
- MIT (add a LICENSE file if you want to publish publicly).