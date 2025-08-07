// Simple Calculator Logic

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
  });
});

function handleInput(value) {
  if (/\d/.test(value) || value === '.') {
    // Number or decimal
    if (resultDisplayed) {
      currentInput = '';
      resultDisplayed = false;
    }
    // Prevent multiple decimals
    if (value === '.' && currentInput.includes('.')) return;
    currentInput += value;
    updateDisplay(currentInput);
  } else if (['+', '-', '*', '/'].includes(value)) {
    // Operator
    if (!currentInput) return;
    if (operand1 && operator && currentInput) {
      // Chain calculations
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

// Calculation logic with division by zero check
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

// Keyboard support
document.addEventListener('keydown', (e) => {
  const key = e.key;
  if ((/\d/.test(key) || key === '.') && !(key === '.' && currentInput.includes('.'))) {
    handleInput(key);
  } else if (['+', '-', '*', '/'].includes(key)) {
    handleInput(key);
  } else if (key === 'Enter' || key === '=') {
    handleInput('=');
    e.preventDefault();
  } else if (key === 'Backspace') {
    handleInput('DEL');
  } else if (key.toLowerCase() === 'c') {
    handleInput('C');
  }
});

// Theme toggle
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light');
  themeToggle.textContent = document.body.classList.contains('light') ? '☀️' : '🌙';
});

// Start with dark theme
document.body.classList.remove('light');
themeToggle.textContent = '🌙';