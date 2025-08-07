const display = document.getElementById('calculator-display');
const buttons = document.querySelectorAll('.calculator-buttons button');
const themeToggle = document.getElementById('theme-toggle');

let currentInput = '';
let operand1 = '';
let operand2 = '';
let operator = '';
let resultDisplayed = false;

// Utility: update display
function updateDisplay(val) {
  display.value = val;
}

// Handle button click
buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    const value = btn.getAttribute('data-value');
    handleInput(value);
    highlightButton(btn);
  });
});

function handleInput(value) {
  if (/\d/.test(value) || value === '.') {
    if (resultDisplayed) {
      currentInput = '';
      resultDisplayed = false;
    }
    if (value === '.' && currentInput.includes('.')) return;
    currentInput += value;
    updateDisplay(currentInput);
  } else if (['+', '-', '*', '/'].includes(value)) {
    if (!currentInput) return;
    if (operand1 && operator && currentInput) {
      operand2 = currentInput;
      let result = calculate(operand1, operator, operand2);
      operand1 = result;
      updateDisplay(result);
    } else {
      operand1 = currentInput;
    }
    operator = value;
    currentInput = '';
  } else if (value === '=') {
    if (operator && currentInput) {
      operand2 = currentInput;
      let result = calculate(operand1, operator, operand2);
      updateDisplay(result);
      currentInput = result.toString();
      resultDisplayed = true;
      operand1 = '';
      operand2 = '';
      operator = '';
    }
  } else if (value === 'C') {
    currentInput = '';
    operand1 = '';
    operand2 = '';
    operator = '';
    updateDisplay('');
  } else if (value === 'DEL') {
    if (!resultDisplayed) {
      currentInput = currentInput.slice(0, -1);
      updateDisplay(currentInput);
    }
  }
}

function calculate(op1, op, op2) {
  let num1 = parseFloat(op1);
  let num2 = parseFloat(op2);
  if (op === '/' && num2 === 0) return "Err";
  try {
    let res = eval(`${num1} ${op} ${num2}`);
    return Number.isFinite(res) ? parseFloat(res.toFixed(8)) : "Err";
  } catch {
    return "Err";
  }
}

// Visual feedback for button press/click
function highlightButton(btn) {
  btn.classList.add('active');
  setTimeout(() => btn.classList.remove('active'), 140);
}

// Keyboard support with button highlight
document.addEventListener('keydown', (e) => {
  const key = e.key;
  let matchedBtn = null;
  if ((/\d/.test(key) || key === '.') && !(key === '.' && currentInput.includes('.'))) {
    handleInput(key);
    matchedBtn = document.querySelector(`button[data-value="${key}"]`);
  } else if (['+', '-', '*', '/'].includes(key)) {
    handleInput(key);
    matchedBtn = document.querySelector(`button[data-value="${key}"]`);
  } else if (key === 'Enter' || key === '=') {
    handleInput('=');
    matchedBtn = document.querySelector(`button[data-value="="]`);
    e.preventDefault();
  } else if (key === 'Backspace') {
    handleInput('DEL');
    matchedBtn = document.querySelector(`button[data-value="DEL"]`);
  } else if (key.toLowerCase() === 'c') {
    handleInput('C');
    matchedBtn = document.querySelector(`button[data-value="C"]`);
  }
  if (matchedBtn) highlightButton(matchedBtn);
});

// Theme toggle
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light');
  themeToggle.textContent = document.body.classList.contains('light') ? '☀️' : '🌙';
});

// Start with dark theme
document.body.classList.remove('light');
themeToggle.textContent = '🌙';