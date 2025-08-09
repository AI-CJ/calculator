"use strict";

// Basic calculator state. Kept simple on purpose.
const state = {
  displayValue: "0",
  firstOperand: null,
  operator: null,                  // "+", "-", "*", "/"
  waitingForSecondOperand: false,
  justEvaluated: false,
  memory: 0,
  history: []                      // { expr: string, result: string }
};

// DOM references
const displayEl = document.getElementById("display");
const miniEl = document.getElementById("mini");
const keysEl = document.getElementById("keys");
const clearKeyEl = document.getElementById("clearKey");
const memIndicatorEl = document.getElementById("memIndicator");
const historyListEl = document.getElementById("historyList");

// Load memory from localStorage (nice small touch for a portfolio)
(function init() {
  const m = localStorage.getItem("asu_calc_memory");
  if (m !== null && !Number.isNaN(Number(m))) {
    state.memory = Number(m);
  }
  updateMemoryIndicator();
  renderHistory();
  updateDisplay();
})();

function updateDisplay() {
  displayEl.textContent = state.displayValue;
  if (state.operator && state.firstOperand !== null) {
    miniEl.textContent = `${formatResult(state.firstOperand)} ${symbolOf(state.operator)}`;
  } else {
    miniEl.textContent = "";
  }
  updateClearLabel();
}

function updateClearLabel() {
  // Show C if there's something to clear on the current entry; otherwise AC
  const needEntryClear = state.displayValue !== "0" || state.justEvaluated;
  clearKeyEl.textContent = needEntryClear ? "C" : "AC";
}

function symbolOf(op) {
  return op === "/" ? "÷" : op === "*" ? "×" : op;
}

function formatResult(num) {
  if (!Number.isFinite(num)) return "Error";
  // Round to ~12 significant digits to reduce floating-point noise
  const s = Number(num.toPrecision(12)).toString();
  return s;
}

function pushHistory(expr, result) {
  state.history.push({ expr, result });
  if (state.history.length > 25) state.history.shift(); // keep it lean
  renderHistory();
}

function renderHistory() {
  historyListEl.innerHTML = "";
  // Show most recent first
  const items = [...state.history].reverse();
  for (const h of items) {
    const li = document.createElement("li");
    li.className = "hist-item";
    const expr = document.createElement("div");
    expr.className = "hist-expr";
    expr.textContent = h.expr;
    const res = document.createElement("div");
    res.className = "hist-res";
    res.textContent = h.result;
    li.appendChild(expr);
    li.appendChild(res);
    li.title = "Click to reuse result";
    li.addEventListener("click", () => {
      state.displayValue = h.result;
      state.firstOperand = null;
      state.operator = null;
      state.waitingForSecondOperand = false;
      state.justEvaluated = true;
      updateDisplay();
    });
    historyListEl.appendChild(li);
  }
}

function setDisplayValueFromNumber(n) {
  state.displayValue = formatResult(n);
  updateDisplay();
}

function clearEntry() {
  state.displayValue = "0";
  state.justEvaluated = false;
  updateDisplay();
}

function allClear() {
  state.displayValue = "0";
  state.firstOperand = null;
  state.operator = null;
  state.waitingForSecondOperand = false;
  state.justEvaluated = false;
  updateDisplay();
}

function handleClear() {
  if (clearKeyEl.textContent === "C") {
    clearEntry();
  } else {
    allClear();
  }
}

function inputDigit(digit) {
  if (state.justEvaluated && !state.operator) {
    // Start a new calculation after equals
    state.firstOperand = null;
    state.operator = null;
    state.waitingForSecondOperand = false;
    state.displayValue = digit;
    state.justEvaluated = false;
    updateDisplay();
    return;
  }

  if (state.waitingForSecondOperand) {
    state.displayValue = digit;
    state.waitingForSecondOperand = false;
    updateDisplay();
    return;
  }

  // Prevent leading zeros like "0005"
  if (state.displayValue === "0") {
    state.displayValue = digit;
  } else {
    // Limit length to keep UI tidy
    if (state.displayValue.length >= 16) return;
    state.displayValue += digit;
  }
  state.justEvaluated = false;
  updateDisplay();
}

function inputDot() {
  if (state.waitingForSecondOperand) {
    state.displayValue = "0.";
    state.waitingForSecondOperand = false;
    updateDisplay();
    return;
  }
  if (!state.displayValue.includes(".")) {
    state.displayValue += ".";
    updateDisplay();
  }
}

function toggleSign() {
  if (state.displayValue === "0") return;
  if (state.displayValue.startsWith("-")) {
    state.displayValue = state.displayValue.slice(1);
  } else {
    state.displayValue = "-" + state.displayValue;
  }
  updateDisplay();
}

function inputPercent() {
  const current = Number(state.displayValue);
  if (Number.isNaN(current)) return;

  let value = current;
  if (state.operator && state.firstOperand !== null && !state.waitingForSecondOperand) {
    // Interpret as "x op (x * percent)" e.g., 200 + 10% -> 200 + (200*10/100)
    value = (state.firstOperand * current) / 100;
  } else {
    value = current / 100;
  }
  setDisplayValueFromNumber(value);
  state.justEvaluated = false;
}

function performCalc(a, b, op) {
  if (op === "+") return a + b;
  if (op === "-") return a - b;
  if (op === "*") return a * b;
  if (op === "/") {
    if (b === 0) return Infinity; // will become "Error" via formatResult
    return a / b;
  }
  return b;
}

function handleOperator(nextOp) {
  const inputValue = Number(state.displayValue);
  if (Number.isNaN(inputValue)) return;

  if (state.operator && state.waitingForSecondOperand) {
    // Change operator before entering second operand
    state.operator = nextOp;
    updateDisplay();
    return;
  }

  if (state.firstOperand === null) {
    state.firstOperand = inputValue;
  } else if (state.operator) {
    const result = performCalc(state.firstOperand, inputValue, state.operator);
    if (!Number.isFinite(result)) {
      // Error (like divide by zero)
      allClear();
      state.displayValue = "Error";
      updateDisplay();
      return;
    }
    // Push to history as a complete "a op b = result"
    const expr = `${formatResult(state.firstOperand)} ${symbolOf(state.operator)} ${formatResult(inputValue)} =`;
    const formatted = formatResult(result);
    pushHistory(expr, formatted);

    state.firstOperand = result;
    state.displayValue = formatted;
  }

  state.waitingForSecondOperand = true;
  state.operator = nextOp;
  state.justEvaluated = false;
  updateDisplay();
}

function handleEquals() {
  if (state.operator === null || state.waitingForSecondOperand) {
    // Nothing to compute
    return;
  }
  const a = state.firstOperand;
  const b = Number(state.displayValue);
  const op = state.operator;

  const result = performCalc(a, b, op);
  if (!Number.isFinite(result)) {
    allClear();
    state.displayValue = "Error";
    updateDisplay();
    return;
  }

  const expr = `${formatResult(a)} ${symbolOf(op)} ${formatResult(b)} =`;
  const formatted = formatResult(result);
  pushHistory(expr, formatted);

  state.displayValue = formatted;
  state.firstOperand = null;
  state.operator = null;
  state.waitingForSecondOperand = false;
  state.justEvaluated = true;
  updateDisplay();
}

// Memory operations
function updateMemoryIndicator() {
  memIndicatorEl.textContent = state.memory !== 0 ? `Memory: ${formatResult(state.memory)}` : "";
}

function saveMemory() {
  try { localStorage.setItem("asu_calc_memory", String(state.memory)); } catch {}
  updateMemoryIndicator();
}

function handleMemory(action) {
  const current = Number(state.displayValue);
  if (action === "mc") {
    state.memory = 0;
  } else if (action === "mr") {
    state.displayValue = formatResult(state.memory);
    state.justEvaluated = false;
  } else if (action === "mplus") {
    if (!Number.isNaN(current)) state.memory += current;
  } else if (action === "mminus") {
    if (!Number.isNaN(current)) state.memory -= current;
  }
  saveMemory();
  updateDisplay();
}

// Keyboard support
document.addEventListener("keydown", (e) => {
  const k = e.key;
  if (k >= "0" && k <= "9") {
    inputDigit(k);
    return;
  }
  if (k === ".") { inputDot(); return; }
  if (k === "+" || k === "-" || k === "*" || k === "/") { handleOperator(k); return; }
  if (k === "Enter" || k === "=") { e.preventDefault(); handleEquals(); return; }
  if (k === "Backspace") { backspace(); return; }
  if (k === "Escape") { allClear(); return; }
  if (k === "%") { inputPercent(); return; }
});

function backspace() {
  if (state.justEvaluated || state.waitingForSecondOperand) return;
  if (state.displayValue.length > 1) {
    state.displayValue = state.displayValue.slice(0, -1);
  } else {
    state.displayValue = "0";
  }
  updateDisplay();
}

// Click handling (event delegation)
keysEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button.key");
  if (!btn) return;

  if (btn.dataset.digit) { inputDigit(btn.dataset.digit); return; }
  if (btn.hasAttribute("data-dot")) { inputDot(); return; }
  if (btn.dataset.op) { handleOperator(btn.dataset.op); return; }
  if (btn.hasAttribute("data-equals")) { handleEquals(); return; }
  if (btn.hasAttribute("data-percent")) { inputPercent(); return; }
  if (btn.hasAttribute("data-sign")) { toggleSign(); return; }
  if (btn.hasAttribute("data-clear")) { handleClear(); return; }
  if (btn.dataset.mem) { handleMemory(btn.dataset.mem); return; }
});