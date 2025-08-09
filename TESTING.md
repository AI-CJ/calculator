# Testing Guide

This app includes a lightweight test page (test.html) and a manual test plan. No external libraries are required.

Automated Tests (Browser)
- Open test.html in your browser.
- It will:
  - Spin up the app’s JavaScript in a hidden container.
  - Run a set of unit-style tests (basic ops, percent, memory, error states, etc.).
  - Show a summary (pass/fail) and details for each test.
- Click “Run tests again” to re-run after changes.

Manual Test Plan
1. Basic Operations
   - 12 + 7 = → 19
   - 9 − 3 = → 6
   - 4 × 2.5 = → 10
   - 10 ÷ 4 = → 2.5

2. Chaining (immediate execute)
   - 3 + 4 × 5 = → 35 (evaluates 3+4 first, then ×5)

3. Decimals
   - .5 + .25 = → 0.75
   - 0.1 + 0.2 = → 0.3 (rounded nicely)

4. Sign Toggle
   - 25 ± → -25
   - -25 ± → 25

5. Percent
   - 200 + 10 % = → 220 (interpreted as 200 + (200*10/100))
   - 50 % → 0.5 when used standalone (no first operand/operator)

6. Memory
   - Enter 5 → M+ → MR → shows 5
   - M+ again → MR → shows 10
   - M− (with current display 2) → MR → shows 8
   - MC → MR → shows 0
   - Refresh page → memory persists (last value shown unless cleared)

7. Clear / Backspace
   - Enter “123” then Backspace → “12”
   - AC clears everything (operator, first operand, history unaffected)
   - C only clears current entry (label toggles between C/AC)

8. History
   - Perform a few calculations → items appear in “History”
   - Click an item → its result populates the display

9. Error Handling
   - 5 ÷ 0 = → “Error” (display), calculator resets to a safe state

10. Keyboard Shortcuts
   - Try digits, ., +, -, *, /, Enter/=, Backspace, Escape, %.
   - Confirm behavior matches clicks.

Browser Compatibility
- Test in at least:
  - Chrome (latest)
  - Firefox (latest)
  - Safari (latest macOS/iOS)
  - Edge (latest)
- Mobile: ensure layout is responsive and keys are easy to tap.

Performance & UX Checks
- Fast typing and clicking shouldn’t lag or double-trigger.
- Display doesn’t overflow; long numbers wrap or limit correctly.
- Clear button label switches between AC and C appropriately.

Extending Tests
- Add more cases inside test.html by copying an existing test() block.
- Consider testing edge rounding cases and very long entry sequences.