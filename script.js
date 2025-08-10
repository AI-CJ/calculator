(function () {
  "use strict";

  var displayEl = document.getElementById("display");
  var trailEl = document.getElementById("trail");
  var keysEl = document.getElementById("keys");

  var calc = {
    displayValue: "0",
    firstOperand: null,
    operator: null, // "+", "-", "*", "/"
    waitingForSecondOperand: false,
    error: false
  };

  function updateDisplay() {
    displayEl.textContent = calc.displayValue;
    updateTrail();
    updateClearKey();
    updateActiveOperator();
  }

  function updateTrail() {
    var t = "";
    if (!calc.error && calc.firstOperand !== null && calc.operator !== null) {
      var opSymbol = toSymbol(calc.operator);
      t = formatNumber(calc.firstOperand) + " " + opSymbol;
    }
    trailEl.textContent = t;
  }

  function updateClearKey() {
    var clearBtn = keysEl.querySelector('[data-action="clear"]');
    var shouldShowC =
      calc.displayValue !== "0" ||
      calc.firstOperand !== null ||
      calc.operator !== null ||
      calc.waitingForSecondOperand ||
      calc.error;
    clearBtn.textContent = shouldShowC ? "C" : "AC";
    clearBtn.setAttribute("aria-label", shouldShowC ? "Clear Entry" : "All Clear");
  }

  function updateActiveOperator() {
    var ops = keysEl.querySelectorAll('[data-action="operator"]');
    for (var i = 0; i < ops.length; i++) {
      ops[i].classList.remove("active");
    }
    if (calc.operator && calc.waitingForSecondOperand) {
      for (var j = 0; j < ops.length; j++) {
        if (ops[j].dataset.operator === calc.operator) {
          ops[j].classList.add("active");
          break;
        }
      }
    }
  }

  function inputDigit(d) {
    if (calc.error) return;
    if (calc.waitingForSecondOperand) {
      calc.displayValue = d;
      calc.waitingForSecondOperand = false;
    } else {
      if (calc.displayValue === "0") {
        calc.displayValue = d;
      } else {
        // Limit length to avoid overflow
        if (calc.displayValue.replace("-", "").length < 16) {
          calc.displayValue += d;
        }
      }
    }
  }

  function inputDecimal() {
    if (calc.error) return;
    if (calc.waitingForSecondOperand) {
      calc.displayValue = "0.";
      calc.waitingForSecondOperand = false;
      return;
    }
    if (calc.displayValue.indexOf(".") === -1) {
      calc.displayValue += ".";
    }
  }

  function toggleSign() {
    if (calc.error) return;
    if (calc.displayValue === "0") return;
    if (calc.displayValue.charAt(0) === "-") {
      calc.displayValue = calc.displayValue.slice(1);
    } else {
      calc.displayValue = "-" + calc.displayValue;
    }
  }

  function handlePercent() {
    if (calc.error) return;
    if (calc.waitingForSecondOperand) return;

    var current = parseFloat(calc.displayValue);
    if (isNaN(current)) return;

    if (calc.firstOperand !== null && calc.operator !== null) {
      if (calc.operator === "+" || calc.operator === "-") {
        current = calc.firstOperand * (current / 100);
      } else {
        current = current / 100;
      }
    } else {
      current = current / 100;
    }
    calc.displayValue = formatNumber(current);
  }

  function clearEntryOrAll() {
    if (calc.error) {
      allClear();
      return;
    }
    var showC =
      calc.displayValue !== "0" ||
      calc.waitingForSecondOperand ||
      calc.firstOperand !== null ||
      calc.operator !== null;
    if (showC && !calc.waitingForSecondOperand) {
      calc.displayValue = "0";
    } else {
      allClear();
    }
  }

  function allClear() {
    calc.displayValue = "0";
    calc.firstOperand = null;
    calc.operator = null;
    calc.waitingForSecondOperand = false;
    calc.error = false;
  }

  function performCalculation(op, first, second) {
    switch (op) {
      case "+": return first + second;
      case "-": return first - second;
      case "*": return first * second;
      case "/": return second === 0 ? Infinity : first / second;
      default: return second;
    }
  }

  function handleOperator(nextOp) {
    if (calc.error) return;

    var inputValue = parseFloat(calc.displayValue);
    if (isNaN(inputValue)) inputValue = 0;

    if (calc.operator && calc.waitingForSecondOperand) {
      calc.operator = nextOp;
      return;
    }

    if (calc.firstOperand === null) {
      calc.firstOperand = inputValue;
    } else if (calc.operator) {
      var result = performCalculation(calc.operator, calc.firstOperand, inputValue);
      if (!isFinite(result)) {
        setError();
        return;
      }
      calc.displayValue = formatNumber(result);
      calc.firstOperand = result;
    }

    calc.waitingForSecondOperand = true;
    calc.operator = nextOp;
  }

  function handleEquals() {
    if (calc.error) return;
    if (calc.operator === null) return;
    if (calc.waitingForSecondOperand) return;

    var second = parseFloat(calc.displayValue);
    if (isNaN(second)) second = 0;

    var result = performCalculation(calc.operator, calc.firstOperand, second);
    if (!isFinite(result)) {
      setError();
      return;
    }
    calc.displayValue = formatNumber(result);
    calc.firstOperand = null;
    calc.operator = null;
    calc.waitingForSecondOperand = false;
  }

  function backspace() {
    if (calc.error) return;
    if (calc.waitingForSecondOperand) return;
    if (calc.displayValue.length <= 1 || (calc.displayValue.length === 2 && calc.displayValue.charAt(0) === "-")) {
      calc.displayValue = "0";
    } else {
      calc.displayValue = calc.displayValue.slice(0, -1);
    }
  }

  function setError() {
    calc.displayValue = "Error";
    calc.firstOperand = null;
    calc.operator = null;
    calc.waitingForSecondOperand = false;
    calc.error = true;
  }

  function toSymbol(op) {
    if (op === "/") return "÷";
    if (op === "*") return "×";
    if (op === "-") return "−";
    return op;
  }

  function formatNumber(n) {
    if (!isFinite(n)) return "Error";
    // Round to avoid floating point artifacts, keep reasonable precision
    var rounded = Number(n.toPrecision(12));
    var s = String(rounded);

    // Use exponential for very large/small numbers
    var abs = Math.abs(rounded);
    if ((abs !== 0 && abs < 1e-6) || abs >= 1e12) {
      return rounded.toExponential(8).replace("+", "");
    }

    // Trim trailing zeros after decimal
    if (s.indexOf(".") !== -1) {
      s = s.replace(/\.?0+$/, "");
    }

    // If still too long, fallback to exponential
    if (s.replace("-", "").length > 16) {
      return rounded.toExponential(8).replace("+", "");
    }
    return s;
  }

  // Click handling (event delegation)
  keysEl.addEventListener("click", function (e) {
    var btn = e.target.closest("button.key");
    if (!btn) return;

    var action = btn.dataset.action;

    if (action === "digit") {
      inputDigit(btn.dataset.digit);
    } else if (action === "decimal") {
      inputDecimal();
    } else if (action === "operator") {
      handleOperator(btn.dataset.operator);
    } else if (action === "equals") {
      handleEquals();
    } else if (action === "clear") {
      clearEntryOrAll();
    } else if (action === "sign") {
      toggleSign();
    } else if (action === "percent") {
      handlePercent();
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
      handleOperator(k);
    } else if (k === "Enter" || k === "=") {
      // Prevent form submissions if embedded
      e.preventDefault();
      handleEquals();
    } else if (k === "Backspace") {
      backspace();
    } else if (k === "Escape") {
      allClear();
    } else if (k === "%") {
      handlePercent();
    } else {
      return; // Ignore other keys
    }

    updateDisplay();
  });

  // Initialize UI
  updateDisplay();
})();