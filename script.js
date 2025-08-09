'use strict';

// Elements
const display = document.getElementById('calculator-display');
const themeToggle = document.getElementById('theme-toggle');
const historyToggle = document.getElementById('history-toggle');
const historyPanel = document.getElementById('history-panel');
const historyList = document.getElementById('history-list');
const historyClose = document.getElementById('history-close');
const historyClear = document.getElementById('history-clear');
const degToggle = document.getElementById('deg-toggle');
const copyBtn = document.getElementById('copy-btn');
const srStatus = document.getElementById('sr-status');

// Buttons (both grids)
const allButtons = document.querySelectorAll('.advanced-buttons button, .calculator-buttons button');

// State
const state = {
  expr: '',
  lastResult: '0',
  memory: 0,
  resultDisplayed: false,
  deg: true,
  history: []
};

// Storage keys
const STORE = {
  THEME: 'calc:theme',
  DEG: 'calc:deg',
  HISTORY: 'calc:history',
  LAST: 'calc:last'
};

// Utils
function setDisplay(val) {
  display.value = val;
}
function announce(msg) {
  srStatus.textContent = msg;
}
function saveHistory() {
  localStorage.setItem(STORE.HISTORY, JSON.stringify(state.history.slice(-50)));
}
function renderHistory() {
  historyList.innerHTML = '';
  if (!state.history.length) {
    const li = document.createElement('li');
    li.className = 'history-item';
    li.innerHTML = '<span class="history-expr">No history yet.</span>';
    historyList.appendChild(li);
    return;
  }
  state.history.slice().reverse().forEach(item => {
    const li = document.createElement('li');
    li.className = 'history-item';
    const useBtn = document.createElement('button');
    useBtn.className = 'history-use';
    useBtn.title = 'Use this result';
    useBtn.textContent = `${item.expr} = ${item.result}`;
    useBtn.addEventListener('click', () => {
      state.expr = item.result;
      state.resultDisplayed = false;
      setDisplay(prettyExpr(state.expr));
      toggleHistory(false);
    });
    li.appendChild(useBtn);
    historyList.appendChild(li);
  });
}
function toggleHistory(forceOpen) {
  const open = forceOpen !== undefined ? forceOpen : !historyPanel.classList.contains('open');
  historyPanel.classList.toggle('open', open);
  historyPanel.setAttribute('aria-hidden', open ? 'false' : 'true');
  historyToggle?.setAttribute('aria-expanded', open ? 'true' : 'false');
}

// Pretty-print expression for display
function prettyExpr(expr) {
  return expr
    .replace(/\*/g, '×')
    .replace(/\//g, '÷')
    .replace(/-/g, '−')
    .replace(/\bpi\b/gi, 'π')
    .replace(/\bANS\b/g, 'Ans')
    .replace(/\bsqrt\(/gi, '√(');
}

// Theme init
(function initTheme() {
  const saved = localStorage.getItem(STORE.THEME);
  const systemPrefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  const light = saved ? saved === 'light' : systemPrefersLight;
  document.body.classList.toggle('light', light);
  themeToggle.textContent = document.body.classList.contains('light') ? '☀️' : '🌙';
})();

// DEG/RAD init
(function initDeg() {
  const saved = localStorage.getItem(STORE.DEG);
  state.deg = saved ? saved === 'true' : true;
  degToggle.textContent = state.deg ? 'DEG' : 'RAD';
  degToggle.setAttribute('aria-pressed', state.deg ? 'true' : 'false');
})();

// History init
(function initHistory() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE.HISTORY) || '[]');
    if (Array.isArray(saved)) state.history = saved;
  } catch {}
  renderHistory();
})();

// Last result init
(function initLast() {
  const saved = localStorage.getItem(STORE.LAST);
  if (saved) state.lastResult = saved;
})();

// Event: Theme toggle
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light');
  const light = document.body.classList.contains('light');
  themeToggle.textContent = light ? '☀️' : '🌙';
  localStorage.setItem(STORE.THEME, light ? 'light' : 'dark');
});

// Event: DEG/RAD toggle
degToggle.addEventListener('click', () => {
  state.deg = !state.deg;
  degToggle.textContent = state.deg ? 'DEG' : 'RAD';
  degToggle.setAttribute('aria-pressed', state.deg ? 'true' : 'false');
  localStorage.setItem(STORE.DEG, String(state.deg));
  announce(state.deg ? 'Degrees mode' : 'Radians mode');
});

// Event: Copy
copyBtn.addEventListener('click', async () => {
  const text = display.value || '0';
  try {
    await navigator.clipboard.writeText(text);
    announce('Copied to clipboard');
  } catch {
    announce('Copy failed');
  }
});

// Event: History drawer
historyToggle.addEventListener('click', () => toggleHistory());
historyClose.addEventListener('click', () => toggleHistory(false));
historyClear.addEventListener('click', () => {
  state.history = [];
  saveHistory();
  renderHistory();
  announce('History cleared');
});

// Button input
allButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const value = btn.getAttribute('data-value');
    handleInput(value);
    highlightButton(btn);
  });
});

// Keyboard support
document.addEventListener('keydown', (e) => {
  const k = e.key;
  let val = null;

  if (/^\d$/.test(k) || k === '.') val = k;
  else if (['+', '-', '*', '/', '^', '(', ')', '%'].includes(k)) val = k;
  else if (k === 'Enter' || k === '=') { val = '='; e.preventDefault(); }
  else if (k === 'Backspace') val = 'DEL';
  else if (k.toLowerCase() === 'c') val = 'C';
  // Function shorthands
  else if (k.toLowerCase() === 'p') val = 'pi';
  // Allow typing function names: sin, cos, tan, log, ln, sqrt(...
  // We detect when a user types letters followed by '(' by letting them actually type into expression via our handler:
  else if (/^[a-zA-Z]$/.test(k)) {
    // Start building function names if appropriate
    val = k.toLowerCase();
  }

  if (val !== null) {
    handleInput(val);
    const selector = `button[data-value="${CSS.escape(val)}"]`;
    const match = document.querySelector(selector);
    if (match) highlightButton(match);
  }
});

// Visual feedback for buttons
function highlightButton(btn) {
  btn.classList.add('active');
  setTimeout(() => btn.classList.remove('active'), 140);
}

// Input handling
function handleInput(value) {
  // If a previous result is shown and user starts typing a number or '(' or function, start a new expression
  const startsNew = /^(\d|\(|pi|e|sin|cos|tan|log|ln|sqrt)$/i.test(value);
  if (state.resultDisplayed && (startsNew || value === '.')) {
    state.expr = '';
    state.resultDisplayed = false;
  }

  if (/^\d$/.test(value) || value === '.' || /^[a-z]$/.test(value)) {
    // Append numbers, dot, or raw letters (to allow typing "sin", "cos", etc.)
    state.expr += value;
    setDisplay(prettyExpr(state.expr));
    return;
  }

  if (['+', '-', '*', '/', '^', '(', ')', '%'].includes(value)) {
    state.expr += value;
    setDisplay(prettyExpr(state.expr));
    return;
  }

  if (['sin','cos','tan','log','ln','sqrt'].includes(value)) {
    state.expr += value + '(';
    setDisplay(prettyExpr(state.expr));
    return;
  }

  if (value === 'pi') {
    state.expr += 'pi';
    setDisplay(prettyExpr(state.expr));
    return;
  }
  if (value === 'ANS') {
    state.expr += 'ANS';
    setDisplay(prettyExpr(state.expr));
    return;
  }

  // Memory
  if (value === 'MC') { state.memory = 0; announce('Memory cleared'); return; }
  if (value === 'MR') { state.expr += String(state.memory); setDisplay(prettyExpr(state.expr)); return; }
  if (value === 'M+') {
    const n = numberFromExprOrResult();
    if (n !== null) { state.memory += n; announce(`Memory plus ${formatNumber(n)}`); }
    return;
  }
  if (value === 'M-') {
    const n = numberFromExprOrResult();
    if (n !== null) { state.memory -= n; announce(`Memory minus ${formatNumber(n)}`); }
    return;
  }

  if (value === '=') {
    if (!state.expr.trim()) return;
    const res = evaluateExpressionSafe(state.expr, state.deg, state.lastResult);
    if (res === 'Err') {
      setDisplay('Err');
      announce('Error');
      state.resultDisplayed = true;
      return;
    }
    const resStr = formatNumber(res);
    setDisplay(resStr);
    announce(`Result ${resStr}`);
    state.lastResult = String(res);
    localStorage.setItem(STORE.LAST, state.lastResult);
    state.history.push({ expr: prettyExpr(state.expr), result: resStr, ts: Date.now() });
    saveHistory();
    renderHistory();
    state.expr = String(res); // allow chaining
    state.resultDisplayed = true;
    return;
  }

  if (value === 'C') {
    state.expr = '';
    setDisplay('');
    state.resultDisplayed = false;
    return;
  }
  if (value === 'DEL') {
    if (!state.resultDisplayed) {
      state.expr = state.expr.slice(0, -1);
      setDisplay(prettyExpr(state.expr));
    }
    return;
  }
}

// Try evaluating, catch and map to Err
function evaluateExpressionSafe(expr, deg, ansStr) {
  try {
    const res = evaluateExpression(expr, deg, parseFloat(ansStr || '0'));
    if (!Number.isFinite(res)) return 'Err';
    // Round to 12 decimal places, drop trailing zeros
    return Number(Number(res).toFixed(12));
  } catch {
    return 'Err';
  }
}

// Formatting result for UI
function formatNumber(n) {
  if (!Number.isFinite(n)) return 'Err';
  const abs = Math.abs(n);
  // Use scientific notation for very large/small values
  if ((abs !== 0 && (abs >= 1e12 || abs < 1e-6))) {
    return n.toExponential(8).replace(/(?:\.|(\..*?))0+e/, '$1e');
  }
  // Locale formatting with up to 12 decimals
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 12 }).format(n);
}

// Helper: derive number from current expression tail or last result
function numberFromExprOrResult() {
  // Try to evaluate current expr; if fails, use last result
  if (state.expr.trim()) {
    const v = evaluateExpressionSafe(state.expr, state.deg, state.lastResult);
    if (v !== 'Err') return Number(v);
  }
  const last = parseFloat(state.lastResult);
  return Number.isFinite(last) ? last : null;
}

/* ========= Expression Evaluator (Shunting Yard + RPN) ========= */

function evaluateExpression(expr, deg, ansVal) {
  const tokens = tokenize(expr);
  const rpn = toRPN(tokens);
  return evalRPN(rpn, deg, ansVal);
}

function tokenize(expr) {
  const tokens = [];
  let i = 0;

  const isDigit = c => /[0-9]/.test(c);
  const isAlpha = c => /[a-zA-Z]/.test(c);
  const isSpace = c => /\s/.test(c);

  while (i < expr.length) {
    const c = expr[i];

    if (isSpace(c)) { i++; continue; }

    // Numbers (including leading dot)
    if (isDigit(c) || c === '.') {
      let s = c; i++;
      while (i < expr.length && (isDigit(expr[i]) || expr[i] === '.')) { s += expr[i++]; }
      tokens.push({ type: 'number', value: parseFloat(s) });
      continue;
    }

    // Operators and parentheses (including pretty chars)
    if (c === '+' || c === '-' || c === '*' || c === '/' || c === '^' || c === '%' || c === '(' || c === ')') {
      tokens.push({ type: mapType(c), value: c });
      i++; continue;
    }
    if (c === '×') { tokens.push({ type: 'operator', value: '*' }); i++; continue; }
    if (c === '÷') { tokens.push({ type: 'operator', value: '/' }); i++; continue; }
    if (c === '−') { tokens.push({ type: 'operator', value: '-' }); i++; continue; }
    if (c === 'π') { tokens.push({ type: 'const', value: 'pi' }); i++; continue; }

    // Identifiers: functions or constants or ANS
    if (isAlpha(c)) {
      let s = c; i++;
      while (i < expr.length && /[a-zA-Z]/.test(expr[i])) { s += expr[i++]; }
      const id = s.toLowerCase();
      if (['sin','cos','tan','log','ln','sqrt'].includes(id)) {
        tokens.push({ type: 'func', value: id });
      } else if (id === 'pi' || id === 'e' || id === 'ans') {
        tokens.push({ type: 'const', value: id });
      } else {
        // Unknown identifier
        throw new Error('Unknown identifier: ' + id);
      }
      continue;
    }

    throw new Error('Unexpected char: ' + c);
  }

  // Handle unary minus: convert '-' to 'u-' if at start or after operator or '('
  const out = [];
  for (let j = 0; j < tokens.length; j++) {
    const t = tokens[j];
    if (t.type === 'operator' && t.value === '-') {
      const prev = out[out.length - 1];
      if (!prev || (prev.type === 'operator' || prev.type === 'lparen')) {
        out.push({ type: 'operator', value: 'u-' }); // unary minus
        continue;
      }
    }
    out.push(t);
  }

  return out;

  function mapType(ch) {
    if (ch === '(') return 'lparen';
    if (ch === ')') return 'rparen';
    return 'operator';
  }
}

function toRPN(tokens) {
  const output = [];
  const ops = [];

  const prec = (op) => {
    switch (op) {
      case 'u-': return 5;
      case '^': return 4;
      case '%': return 3;
      case '*':
      case '/': return 2;
      case '+':
      case '-': return 1;
      default: return 0;
    }
  };
  const rightAssoc = (op) => op === '^' || op === 'u-';

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];

    if (t.type === 'number' || t.type === 'const') {
      output.push(t);
      continue;
    }

    if (t.type === 'func') {
      ops.push(t);
      continue;
    }

    if (t.type === 'operator') {
      while (ops.length) {
        const top = ops[ops.length - 1];
        if (top.type === 'func') {
          output.push(ops.pop());
          continue;
        }
        if (top.type === 'operator' &&
           ((prec(top.value) > prec(t.value)) ||
            (prec(top.value) === prec(t.value) && !rightAssoc(t.value)))) {
          output.push(ops.pop());
          continue;
        }
        break;
      }
      ops.push(t);
      continue;
    }

    if (t.type === 'lparen') {
      ops.push(t);
      continue;
    }

    if (t.type === 'rparen') {
      while (ops.length && ops[ops.length - 1].type !== 'lparen') {
        output.push(ops.pop());
      }
      if (!ops.length) throw new Error('Mismatched parentheses');
      ops.pop(); // pop '('
      // If a function is on top, pop it too
      if (ops.length && ops[ops.length - 1].type === 'func') {
        output.push(ops.pop());
      }
      continue;
    }
  }

  while (ops.length) {
    const t = ops.pop();
    if (t.type === 'lparen' || t.type === 'rparen') throw new Error('Mismatched parentheses');
    output.push(t);
  }

  return output;
}

function evalRPN(rpn, deg, ansVal) {
  const stack = [];
  for (const t of rpn) {
    if (t.type === 'number') {
      stack.push(t.value);
      continue;
    }
    if (t.type === 'const') {
      if (t.value === 'pi') stack.push(Math.PI);
      else if (t.value === 'e') stack.push(Math.E);
      else if (t.value.toLowerCase() === 'ans') stack.push(ansVal);
      else throw new Error('Unknown const');
      continue;
    }
    if (t.type === 'operator') {
      if (t.value === 'u-') {
        const a = stack.pop(); if (a === undefined) throw new Error('Stack underflow');
        stack.push(-a);
        continue;
      }
      const b = stack.pop(); const a = stack.pop();
      if (a === undefined || b === undefined) throw new Error('Stack underflow');
      switch (t.value) {
        case '+': stack.push(a + b); break;
        case '-': stack.push(a - b); break;
        case '*': stack.push(a * b); break;
        case '/':
          if (b === 0) return Infinity; // handled as Err by caller
          stack.push(a / b);
          break;
        case '^': stack.push(Math.pow(a, b)); break;
        case '%': stack.push(a % b); break; // Note: % is remainder if used as binary (rare). Prefer postfix 10% by typing 10*0.01 or use explicit divide by 100.
        default: throw new Error('Op ' + t.value);
      }
      continue;
    }
    if (t.type === 'func') {
      const a = stack.pop(); if (a === undefined) throw new Error('Stack underflow');
      switch (t.value) {
        case 'sin': stack.push(Math.sin(deg ? toRad(a) : a)); break;
        case 'cos': stack.push(Math.cos(deg ? toRad(a) : a)); break;
        case 'tan': {
          const angle = deg ? toRad(a) : a;
          const v = Math.tan(angle);
          if (!Number.isFinite(v)) throw new Error('Domain error');
          stack.push(v);
          break;
        }
        case 'log':
          if (a <= 0) throw new Error('Domain error');
          stack.push(Math.log10(a));
          break;
        case 'ln':
          if (a <= 0) throw new Error('Domain error');
          stack.push(Math.log(a));
          break;
        case 'sqrt':
          if (a < 0) throw new Error('Domain error');
          stack.push(Math.sqrt(a));
          break;
        default:
          throw new Error('Func ' + t.value);
      }
      continue;
    }
    throw new Error('Unknown token in RPN');
  }
  if (stack.length !== 1) throw new Error('Invalid expression');
  return stack[0];

  function toRad(x) { return x * Math.PI / 180; }
}

/* ========= End evaluator ========= */

// Start with dark or saved theme applied; display empty
setDisplay('');

// Done!