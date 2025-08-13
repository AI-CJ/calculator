# Calculator

A responsive, accessible, zero-dependency calculator with a marine/onyx wispy aesthetic. It supports operator precedence, percent, sign toggle, delete/backspace, keyboard input, and “real calculator”-style rounding. The display is right-anchored and clips gracefully from the left as expressions get long, keeping the latest input in view.

## Features
- Clean math behavior
  - Operator precedence (×/÷ before +/−)
  - Percent (%) with contextual behavior (e.g., 200 + 10% => 220; 50 × 10% => 5)
  - ± sign toggle, delete/backspace, and AC (always full clear)
  - Division by zero safety with an Error state
- Rounding like a real calculator
  - 12 significant digits, half-up rounding
  - Scientific notation for very large/small values
- Thoughtful UI/UX
  - Right-aligned display that clips from the left when long
  - Subtle left-edge fade to soften clipping
  - Light emerald and onyx wispy textures for the case and keys
  - Responsive layout (mobile-friendly)
  - Keyboard support
- Accessibility
  - Aria-live display for screen readers
  - Clear focus states and high-contrast text

## Quick Start
- Option 1: Double-click index.html (no build step; pure HTML/CSS/JS).
- Option 2: Serve locally for a smoother experience:
  ```bash
  npm run start
This uses npx to run a tiny static server on http://localhost:5173.

Keyboard Shortcuts
Numbers: 0–9
Decimal: .
Operators: +, -, *, /
Equals: Enter or =
All Clear: Escape (or AC button)
Delete/backspace: Backspace or Delete
Percent: %
Toggle sign: use the ± button (or click)
Testing
Automated-in-browser test runner: open test.html and click “Run All Tests.”
Manual test plan: see TESTING.md for detailed steps and acceptance criteria.
Rounding Details
Internals compute with JavaScript numbers, rounding intermediate and final results to 12 significant digits (half-up).
Values outside [1e-6, 1e12) use scientific notation for clarity and to avoid awkward strings.
While typing, your entry isn’t rounded; rounding applies to tokens and results.
Project Structure
mipsasm

Copy
.
├── index.html         # App
├── styles.css         # Styles (wispy case + keys, responsive layout)
├── script.js          # Calculator logic (precedence, rounding, input handling)
├── test.html          # Browser test runner (no extra deps)
├── TESTING.md         # Manual test plan and acceptance criteria
├── README.md          # You are here
├── .gitignore         # Useful ignores for a web project
├── .editorconfig      # Consistent editor settings
├── package.json       # Optional local dev server & formatting helpers
└── LICENSE            # MIT