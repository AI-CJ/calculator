document.addEventListener('keydown', (e) => {
  const key = e.key;
  if (/\d/.test(key) || key === '.') {
    // If number or decimal
    if (resultDisplayed) {
      currentInput = '';
      resultDisplayed = false;
    }
    currentInput += key;
    display.value = currentInput;
  } else if (['+', '-', '*', '/'].includes(key)) {
    // If operator
    if (currentInput === '') return;
    operand1 = currentInput;
    operator = key;
    currentInput = '';
  } else if (key === 'Enter' || key === '=') {
    // If equals/enter
    if (operator && currentInput) {
      operand2 = currentInput;
      let result = eval(`${operand1} ${operator} ${operand2}`);
      display.value = result;
      currentInput = result.toString();
      resultDisplayed = true;
    }
  } else if (key === 'Backspace') {
    currentInput = currentInput.slice(0, -1);
    display.value = currentInput;
  } else if (key.toLowerCase() === 'c') {
    currentInput = '';
    operand1 = '';
    operand2 = '';
    operator = '';
    display.value = '';
  } else if (value === '=') {
  if (operator && currentInput) {
    operand2 = currentInput;
    let result;
    try {
      if (operator === '/' && Number(operand2) === 0) {
        result = "Error: Div by 0";
      } else {
        result = eval(`${operand1} ${operator} ${operand2}`);
      }
    } catch {
      result = "Error";
    }
    display.value = result;
    currentInput = result.toString();
    resultDisplayed = true;
  }
}
});

document.addEventListener('keydown', (e) => {
  const key = e.key;
  if (/\d/.test(key) || key === '.') {
    // If number or decimal
    if (resultDisplayed) {
      currentInput = '';
      resultDisplayed = false;
    }
    currentInput += key;
    display.value = currentInput;
  } else if (['+', '-', '*', '/'].includes(key)) {
    // If operator
    if (currentInput === '') return;
    operand1 = currentInput;
    operator = key;
    currentInput = '';
  } else if (key === 'Enter' || key === '=') {
    // If equals/enter
    if (operator && currentInput) {
      operand2 = currentInput;
      let result = eval(`${operand1} ${operator} ${operand2}`);
      display.value = result;
      currentInput = result.toString();
      resultDisplayed = true;
    }
  } else if (key === 'Backspace') {
    currentInput = currentInput.slice(0, -1);
    display.value = currentInput;
  } else if (key.toLowerCase() === 'c') {
    currentInput = '';
    operand1 = '';
    operand2 = '';
    operator = '';
    display.value = '';
  }
});
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  document.body.classList.toggle('light');
  document.querySelector('.calculator').classList.toggle('dark');
  document.querySelector('.calculator').classList.toggle('light');
  themeToggle.textContent = document.body.classList.contains('dark') ? '🌙' : '☀️';
});
// Set the default theme to dark
document.body.classList.add('dark');
document.querySelector('.calculator').classList.add('dark');