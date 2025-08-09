# Calculator Web App

Live Demo: https://polite-rugelach-549c2f.netlify.app/

## Overview

A modern, accessible calculator with a scientific mode, expression parsing (parentheses, functions, exponent), keyboard support, history with persistence, and dark/light themes that follow system preferences.

## Highlights for Recruiters

- Expression engine (Shunting Yard + RPN), no libraries
- Scientific features: sin, cos, tan, ln, log, sqrt, π, e, exponent (^), Ans
- DEG/RAD toggle for trigonometry
- Memory (MC, MR, M+, M−)
- History drawer (persistent, reusable)
- Accessibility: screen reader announcements, focus-visible, ARIA
- Keyboard-first UX and responsive design
- Automated test page for evaluator

## How to Use

- Type or click to build expressions. Examples:
  - (2+3)*4
  - sqrt(9)
  - 2^10
  - ln(e)
  - sin(30) with DEG on (or RAD to use radians)
- Press C to clear, DEL to backspace; Enter or = to evaluate.
- Ans inserts the last result.
- Memory: MC, MR, M+, M−.
- Toggle dark/light (🌙/☀️), history (🕘), and DEG/RAD.

## Accessibility

- Display is readonly (not disabled) and updates a polite aria-live region.
- Buttons have accessible names (e.g., ÷/×/−).
- Focus-visible outlines for keyboard navigation.

## Persistence

- Theme, DEG/RAD, last result, and history are saved in localStorage.

## Run Locally

1. Clone the repo:
   git clone https://github.com/ai-cj/calculator.git
2. Open `index.html` in your browser.

## Tests

Open `test.html` in a browser to see evaluator tests run.

## Tech

- HTML5, CSS3, JavaScript (ES6)