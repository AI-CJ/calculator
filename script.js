(function () {
  "use strict";

  var displayEl = document.getElementById("display");
  var keysEl = document.getElementById("keys");

  // State: tokenized expression; evaluate on "=" with precedence
  var state = {
    tokens: [],          // e.g., [2, "+", 3, "*", 4]
    currentEntry: "0",   // string user is typing
    justEvaluated: false,
    error: false
  };

  var SIG = 12;                // "real calculator" style: 12 significant digits
  var EXP_LOW = 1e-6;          // show exponent if |n| < EXP_LOW (and not zero)
  var EXP_HIGH = 1e12;         // show exponent if |n| >= EXP_HIGH

  function last(arr) { return arr.length ? arr[arr.length - 1] : undefined; }
  function isOperator(t) { return t === "+" || t === "-" || t === "*" || t === "/"; }
  function toSymbol(op) { return op === "/" ? "÷" : op === "*" ? "×" : op === "-" ? "−" : op; }

  // Half-up rounding to N significant digits
  function roundToSig(n, sig) {
    if (!isFinite(n)) return n;
    if (n === 0) return 0;
    var neg = n < 0;
    var abs = Math.abs(n);
    var exp = Math.floor(Math.log10(abs));
    var scale = sig - exp - 1;
    var result;
    if (scale >= 0) {
      var f = Math.pow(10, scale);
      result = Math.round(abs * f) / f;
    } else {
      var inv = Math.pow(10, -scale);
      result = Math.round(abs / inv) * inv;
    }
    return neg ? -result : result;
  }

  // Format with 12 sig digits, exponent fallback; strip trailing zeros
  function formatNumber(n) {
    if (!isFinite(n)) return "Error";

    var x = roundToSig(n, SIG);
    var abs = Math.abs(x);

    if (abs !== 0 && (abs < EXP_LOW || abs >= EXP_HIGH)) {
      // 12 sig digits total => toExponential(11) after the leading digit
      return x.toExponential(SIG - 1).replace("+", "");
    }

    // Choose decimals so total significant digits <= SIG
    var intDigits = abs >= 1 ? Math.floor(Math.log10(abs)) + 1 : 1;
    var decimals = Math.max(0, SIG - intDigits);
    var s = x.toFixed(decimals);
    s = s.replace(/\.?0+$/, ""); // remove trailing zeros and stray dot
    return s;
  }

  function getDisplayText() {
    if (state.error) return "Error";
    var parts = [];
    for (var i = 0; i < state.tokens.length; i++) {
      var t = state.tokens[i];
      parts.push(typeof t === "number" ? formatNumber(t) : toSymbol(t));
    }
    var expr = parts.join(" ");
    if (state.currentEntry !== "") {
      return expr ? expr + " " + state.currentEntry : state.currentEntry;
    }
    return expr || "0";
  }

  function updateDisplay() {
    displayEl.textContent = getDisplayText();
    updateActiveOperator();
  }

  function updateActiveOperator() {
    var ops = keysEl.querySelectorAll('[data-action="operator"]');
    for (var i = 0; i < ops.length; i++) ops[i].classList.remove("active");
    if (state.currentEntry === "" && isOperator(last(state.tokens))) {
      var op = last(state.tokens);
      for (var j = 0; j < ops.length; j++) {
        if (ops[j].dataset.operator === op) {
          ops[j].classList.add("active");
          break;
        }
      }
    }
  }

  // Helpers
  function digitsCount(s) {
    var c = 0;
    for (var i = 0; i < s.length; i++) {
      var ch = s.charAt(i);
      if (ch >= "0" && ch <= "9") c++;
    }
    return c;
  }

  function resetFromError(startEntry) {
    state.tokens = [];
    state.currentEntry = startEntry;
    state.error = false;
    state.justEvaluated = false;
  }

  // Input handlers
  function inputDigit(d) {
    // New: typing a digit after Error resets and starts fresh with that digit
    if (state.error) { resetFromError(d); return; }

    if (state.justEvaluated) {
      state.tokens = [];
      state.currentEntry = d;
      state.justEvaluated = false;
      return;
    }

    if (state.currentEntry === "") { state.currentEntry = d; return; }
    if (state.currentEntry === "0") { state.currentEntry = d; return; }
    if (state.currentEntry === "-0") { state.currentEntry = "-" + d; return; }

    if (digitsCount(state.currentEntry) < 16) state.currentEntry += d;
  }

  function inputDecimal() {
    // Also sensible: typing '.' after Error starts a fresh "0."
    if (state.error) { resetFromError("0."); return; }

    if (state.justEvaluated) {
      state.tokens = [];
      state.currentEntry = "0.";
      state.justEvaluated = false;
      return;
    }
    if (state.currentEntry === "") { state.currentEntry = "0."; return; }
    if (state.currentEntry.indexOf(".") === -1) state.currentEntry += ".";
  }

  function toggleSign() {
    if (state.error) return;

    if (state.currentEntry === "") { state.currentEntry = "-0"; state.justEvaluated = false; return; }
    if (state.currentEntry === "0") { state.currentEntry = "-0"; state.justEvaluated = false; return; }

    if (state.currentEntry.charAt(0) === "-") state.currentEntry = state.currentEntry.slice(1);
    else state.currentEntry = "-" + state.currentEntry;
    state.justEvaluated = false;
  }

  function handlePercent() {
    if (state.error) return;

    var entry = state.currentEntry === "" ? "0" : state.currentEntry;
    var current = parseFloat(entry);
    if (isNaN(current)) return;

    if (state.tokens.length >= 2 && isOperator(last(state.tokens)) && typeof state.tokens[state.tokens.length - 2] === "number") {
      var op = last(state.tokens);
      var base = state.tokens[state.tokens.length - 2];
      if (op === "+" || op === "-") current = base * (current / 100);
      else current = current / 100;
    } else {
      current = current / 100;
    }

    state.currentEntry = formatNumber(current);
    state.justEvaluated = false;
  }

  // Always All Clear (label stays "AC")
  function allClear() {
    state.tokens = [];
    state.currentEntry = "0";
    state.justEvaluated = false;
    state.error = false;
  }

  function pressOperator(nextOp) {
    if (state.error) return;

    if (state.justEvaluated) {
      var numAfterEquals = parseFloat(state.currentEntry);
      if (!isFinite(numAfterEquals)) { setError(); return; }
      state.tokens = [numAfterEquals, nextOp];
      state.currentEntry = "";
      state.justEvaluated = false;
      return;
    }

    if (state.currentEntry !== "") {
      var num = parseFloat(state.currentEntry);
      if (!isFinite(num)) { setError(); return; }
      state.tokens.push(num);
      state.currentEntry = "";
    }

    if (state.tokens.length === 0) state.tokens.push(0); // operator first => leading 0

    if (isOperator(last(state.tokens))) {
      state.tokens[state.tokens.length - 1] = nextOp; // replace operator
    } else {
      state.tokens.push(nextOp);
    }
  }

  function evaluateWithPrecedence(t) {
    if (!t.length) return NaN;

    // First pass: * and /
    var out = [t[0]];
    for (var i = 1; i < t.length; i += 2) {
      var op = t[i];
      var rhs = t[i + 1];
      if (op === "*" || op === "/") {
        var lhs = out[out.length - 1];
        var v = (op === "*") ? (lhs * rhs) : (rhs === 0 ? Infinity : lhs / rhs);
        v = roundToSig(v, SIG); // round intermediate
        out[out.length - 1] = v;
      } else {
        out.push(op, rhs);
      }
    }

    // Second pass: + and -
    var result = out[0];
    for (var j = 1; j < out.length; j += 2) {
      var op2 = out[j];
      var rhs2 = out[j + 1];
      result = (op2 === "+") ? (result + rhs2) : (result - rhs2);
      result = roundToSig(result, SIG);
    }
    return result;
  }

  function handleEquals() {
    if (state.error) return;

    var t = state.tokens.slice();
    if (state.currentEntry !== "") {
      var n = parseFloat(state.currentEntry);
      if (!isFinite(n)) { setError(); updateDisplay(); return; }
      t.push(n);
    }

    while (t.length && isOperator(last(t))) t.pop();
    if (t.length === 0) { state.justEvaluated = true; updateDisplay(); return; }
    if (typeof t[0] !== "number") t.unshift(0);

    var result = evaluateWithPrecedence(t);
    if (!isFinite(result)) { setError(); updateDisplay(); return; }

    state.tokens = [];
    state.currentEntry = formatNumber(result);
    state.justEvaluated = true;
  }

  function backspace() {
    if (state.error) return;

    if (state.justEvaluated) state.justEvaluated = false;

    if (state.currentEntry === "") {
      // Remove trailing operator or bring last number back to edit
      if (state.tokens.length > 0) {
        var t = last(state.tokens);
        if (isOperator(t)) state.tokens.pop();
        else if (typeof t === "number") { state.currentEntry = String(t); state.tokens.pop(); }
      }
      return;
    }

    var s = state.currentEntry;
    var ns = s.slice(0, -1);
    if (ns === "" || ns === "-") ns = "0";
    state.currentEntry = ns;
  }

  function setError() {
    state.tokens = [];
    state.currentEntry = "Error";
    state.error = true;
    state.justEvaluated = false;
  }

  // Click handling
  keysEl.addEventListener("click", function (e) {
    var btn = e.target.closest("button.key");
    if (!btn) return;

    var action = btn.dataset.action;

    if (action === "digit") inputDigit(btn.dataset.digit);
    else if (action === "decimal") inputDecimal();
    else if (action === "operator") pressOperator(btn.dataset.operator);
    else if (action === "equals") handleEquals();
    else if (action === "clear") allClear();           // always All Clear
    else if (action === "sign") toggleSign();
    else if (action === "percent") handlePercent();
    else if (action === "delete") backspace();

    updateDisplay();
  });

  // Keyboard support
  window.addEventListener("keydown", function (e) {
    var k = e.key;

    if (k >= "0" && k <= "9") inputDigit(k);
    else if (k === ".") inputDecimal();
    else if (k === "+" || k === "-" || k === "*" || k === "/") pressOperator(k);
    else if (k === "Enter" || k === "=") { e.preventDefault(); handleEquals(); }
    else if (k === "Backspace" || k === "Delete") backspace();
    else if (k === "Escape") allClear();
    else if (k === "%") handlePercent();
    else return;

    updateDisplay();
  });

  // Initialize
  updateDisplay();
})();