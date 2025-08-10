(function () {
  "use strict";

  var displayEl = document.getElementById("display");
  var keysEl = document.getElementById("keys");

  // State: build a tokenized expression; evaluate only on "=" with precedence
  var state = {
    tokens: [],          // e.g., [2, "+", 3, "*", 4]
    currentEntry: "0",   // string user is typing
    justEvaluated: false,
    error: false
  };

  function last(arr) {
    return arr.length ? arr[arr.length - 1] : undefined;
  }

  function isOperator(t) {
    return t === "+" || t === "-" || t === "*" || t === "/";
  }

  function toSymbol(op) {
    if (op === "/") return "÷";
    if (op === "*") return "×";
    if (op === "-") return "−";
    return op;
  }

  function digitsCount(s) {
    var c = 0;
    for (var i = 0; i < s.length; i++) {
      var ch = s.charAt(i);
      if (ch >= "0" && ch <= "9") c++;
    }
    return c;
  }

  function formatNumber(n) {
    if (!isFinite(n)) return "Error";
    var rounded = Number(n.toPrecision(12));
    var s = String(rounded);

    var abs = Math.abs(rounded);
    if ((abs !== 0 && abs < 1e-6) || abs >= 1e12) {
      return rounded.toExponential(8).replace("+", "");
    }

    if (s.indexOf(".") !== -1) {
      s = s.replace(/\.?0+$/, "");
    }

    if (s.replace("-", "").length > 16) {
      return rounded.toExponential(8).replace("+", "");
    }
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
    updateClearKey();
    updateActiveOperator();
  }

  function updateClearKey() {
    var clearBtn = keysEl.querySelector('[data-action="clear"]');
    var showC =
      state.error ||
      state.justEvaluated ||
      state.tokens.length > 0 ||
      (state.currentEntry !== "" && state.currentEntry !== "0");
    clearBtn.textContent = showC ? "C" : "AC";
    clearBtn.setAttribute("aria-label", showC ? "Clear Entry" : "All Clear");
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

  // Input handlers
  function inputDigit(d) {
    if (state.error) return;

    if (state.justEvaluated) {
      state.tokens = [];
      state.currentEntry = d;
      state.justEvaluated = false;
      return;
    }

    if (state.currentEntry === "") {
      state.currentEntry = d;
      return;
    }

    if (state.currentEntry === "0") {
      state.currentEntry = d;
      return;
    }

    if (state.currentEntry === "-0") {
      state.currentEntry = "-" + d;
      return;
    }

    if (digitsCount(state.currentEntry) < 16) {
      state.currentEntry += d;
    }
  }

  function inputDecimal() {
    if (state.error) return;

    if (state.justEvaluated) {
      state.tokens = [];
      state.currentEntry = "0.";
      state.justEvaluated = false;
      return;
    }

    if (state.currentEntry === "") {
      state.currentEntry = "0.";
      return;
    }

    if (state.currentEntry.indexOf(".") === -1) {
      state.currentEntry += ".";
    }
  }

  function toggleSign() {
    if (state.error) return;

    if (state.currentEntry === "") {
      state.currentEntry = "-0";
      state.justEvaluated = false;
      return;
    }

    if (state.currentEntry === "0") {
      state.currentEntry = "-0";
      state.justEvaluated = false;
      return;
    }

    if (state.currentEntry.charAt(0) === "-") {
      state.currentEntry = state.currentEntry.slice(1);
    } else {
      state.currentEntry = "-" + state.currentEntry;
    }
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
      if (op === "+" || op === "-") {
        current = base * (current / 100);
      } else {
        current = current / 100;
      }
    } else {
      current = current / 100;
    }

    state.currentEntry = formatNumber(current);
    state.justEvaluated = false;
  }

  function clearEntryOrAll() {
    if (state.error) {
      allClear();
      return;
    }
    var showC =
      state.error ||
      state.justEvaluated ||
      state.tokens.length > 0 ||
      (state.currentEntry !== "" && state.currentEntry !== "0");
    if (showC) {
      state.currentEntry = "0";
      state.justEvaluated = false;
    } else {
      allClear();
    }
  }

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
      if (!isFinite(numAfterEquals)) {
        setError();
        return;
      }
      state.tokens = [numAfterEquals, nextOp];
      state.currentEntry = "";
      state.justEvaluated = false;
      return;
    }

    if (state.currentEntry !== "") {
      var num = parseFloat(state.currentEntry);
      if (!isFinite(num)) {
        setError();
        return;
      }
      state.tokens.push(num);
      state.currentEntry = "";
    }

    if (state.tokens.length === 0) {
      // Operator pressed first: assume leading 0
      state.tokens.push(0);
    }

    if (isOperator(last(state.tokens))) {
      // Replace operator
      state.tokens[state.tokens.length - 1] = nextOp;
    } else {
      state.tokens.push(nextOp);
    }
  }

  function evaluateWithPrecedence(t) {
    if (!t.length) return NaN;

    // First pass: resolve * and /
    var out = [t[0]];
    for (var i = 1; i < t.length; i += 2) {
      var op = t[i];
      var rhs = t[i + 1];
      if (op === "*" || op === "/") {
        var lhs = out[out.length - 1];
        var v = op === "*" ? lhs * rhs : (rhs === 0 ? Infinity : lhs / rhs);
        out[out.length - 1] = v;
      } else {
        out.push(op, rhs);
      }
    }

    // Second pass: resolve + and -
    var result = out[0];
    for (var j = 1; j < out.length; j += 2) {
      var op2 = out[j];
      var rhs2 = out[j + 1];
      result = op2 === "+" ? result + rhs2 : result - rhs2;
    }
    return result;
  }

  function handleEquals() {
    if (state.error) return;

    // Build a copy of tokens including current entry
    var t = state.tokens.slice();
    if (state.currentEntry !== "") {
      var n = parseFloat(state.currentEntry);
      if (!isFinite(n)) {
        setError();
        updateDisplay();
        return;
      }
      t.push(n);
    }

    // Remove trailing operator(s)
    while (t.length && isOperator(last(t))) t.pop();

    if (t.length === 0) {
      // Nothing to evaluate; keep current entry as-is
      state.justEvaluated = true;
      updateDisplay();
      return;
    }

    // Ensure expression starts with a number
    if (typeof t[0] !== "number") {
      t.unshift(0);
    }

    var result = evaluateWithPrecedence(t);

    if (!isFinite(result)) {
      setError();
      updateDisplay();
      return;
    }

    state.tokens = [];
    state.currentEntry = formatNumber(result);
    state.justEvaluated = true;
  }

  function backspace() {
    if (state.error) return;

    // If just evaluated, allow editing the result
    if (state.justEvaluated) state.justEvaluated = false;

    if (state.currentEntry === "") {
      // Delete trailing operator or pull back last number to edit
      if (state.tokens.length > 0) {
        var t = last(state.tokens);
        if (isOperator(t)) {
          state.tokens.pop();
        } else if (typeof t === "number") {
          state.currentEntry = String(t);
          state.tokens.pop();
        }
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

    if (action === "digit") {
      inputDigit(btn.dataset.digit);
    } else if (action === "decimal") {
      inputDecimal();
    } else if (action === "operator") {
      pressOperator(btn.dataset.operator);
    } else if (action === "equals") {
      handleEquals();
    } else if (action === "clear") {
      clearEntryOrAll();
    } else if (action === "sign") {
      toggleSign();
    } else if (action === "percent") {
      handlePercent();
    } else if (action === "delete") {
      backspace();
    }

    updateDisplay();
  });

  // Keyboard support
  window.addEventListener("keydown", function (e) {
    var k = e.key;

    if (k >= "0" && k <= "9") {
      inputDigit(k);
    } else if (k === ".") {
      inputDecimal();
    } else if (k === "+" || k === "-" || k === "*" || k === "/") {
      pressOperator(k);
    } else if (k === "Enter" || k === "=") {
      e.preventDefault();
      handleEquals();
    } else if (k === "Backspace" || k === "Delete") {
      backspace();
    } else if (k === "Escape") {
      allClear();
    } else if (k === "%") {
      handlePercent();
    } else {
      return;
    }

    updateDisplay();
  });

  // Initialize
  updateDisplay();
})();