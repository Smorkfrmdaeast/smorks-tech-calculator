// ==========================
// SMORK'S TECH MULTI-MODE CALCULATOR SCRIPT
// ==========================

// === Calculator DOM Elements ===
const displayInput = document.getElementById('displayInput');
const history = document.getElementById('history');
const normalBtn = document.getElementById('normalBtn');
const scientificBtn = document.getElementById('scientificBtn');
const calculatorButtons = document.getElementById('calculatorButtons');
const scientificButtons = document.getElementById('scientificButtons');

let currentInput = '';
let currentHistory = '';

// ==========================
// MODE TOGGLE
// ==========================
normalBtn.addEventListener('click', () => {
  calculatorButtons.classList.remove('hidden');
  scientificButtons.classList.add('hidden');
  normalBtn.classList.add('active');
  scientificBtn.classList.remove('active');
  displayInput.value = '';
  currentInput = '';
});

scientificBtn.addEventListener('click', () => {
  calculatorButtons.classList.add('hidden');
  scientificButtons.classList.remove('hidden');
  scientificBtn.classList.add('active');
  normalBtn.classList.remove('active');
  displayInput.value = '';
  currentInput = '';
});

// ==========================
// BUTTON INPUT HANDLER
// ==========================
document.querySelectorAll('button[data-value]').forEach(btn => {
  btn.addEventListener('click', () => {
    handleInput(btn.dataset.value);
  });
});

function handleInput(value) {
  if (value === 'AC') {
    currentInput = '';
    displayInput.value = '';
    history.textContent = '';
  } else if (value === 'DEL') {
    currentInput = currentInput.slice(0, -1);
    displayInput.value = currentInput;
  } else if (value === '=') {
    calculateResult();
  } else {
    currentInput += value;
    displayInput.value = currentInput;
  }
}

// ==========================
// CALCULATION LOGIC
// ==========================
function calculateResult() {
  try {
    // Replace scientific functions
    let expr = currentInput
      .replace(/sin\(/g, 'Math.sin(')
      .replace(/cos\(/g, 'Math.cos(')
      .replace(/tan\(/g, 'Math.tan(')
      .replace(/log\(/g, 'Math.log10(')
      .replace(/ln\(/g, 'Math.log(')
      .replace(/π/g, 'Math.PI')
      .replace(/e/g, 'Math.E');

    // Convert degrees to radians for trig
    expr = expr.replace(/Math\.sin\(([^)]+)\)/g, (match, p1) => `Math.sin(${p1} * Math.PI / 180)`);
    expr = expr.replace(/Math\.cos\(([^)]+)\)/g, (match, p1) => `Math.cos(${p1} * Math.PI / 180)`);
    expr = expr.replace(/Math\.tan\(([^)]+)\)/g, (match, p1) => `Math.tan(${p1} * Math.PI / 180)`);

    const result = eval(expr);
    history.textContent = currentInput + ' =';
    displayInput.value = result;
    currentInput = result.toString();
  } catch (err) {
    displayInput.value = 'Error';
    currentInput = '';
  }
}

// ==========================
// KEYBOARD SUPPORT
// ==========================
document.addEventListener('keydown', e => {
  if (!isNaN(e.key) || ['+', '-', '*', '/', '.', '(', ')'].includes(e.key)) {
    handleInput(e.key);
  } else if (e.key === 'Enter') {
    handleInput('=');
  } else if (e.key === 'Backspace') {
    handleInput('DEL');
  } else if (e.key === 'Escape') {
    handleInput('AC');
  }
});

// ==========================
// CURRENCY CONVERTER LOGIC
// ==========================
const amountInput = document.getElementById('amount');
const fromCurrency = document.getElementById('fromCurrency');
const toCurrency = document.getElementById('toCurrency');
const convertBtn = document.getElementById('convertBtn');
const conversionResult = document.getElementById('conversionResult');
const lastUpdated = document.getElementById('lastUpdated');

const API_URL = 'https://api.exchangerate.host/latest';

// Load currencies dynamically
async function loadCurrencies() {
  try {
    const res = await fetch(API_URL); // FREE API
    const data = await res.json();
    const currencies = Object.keys(data.rates);
    currencies.forEach(cur => {
      fromCurrency.innerHTML += `<option value="${cur}">${cur}</option>`;
      toCurrency.innerHTML += `<option value="${cur}">${cur}</option>`;
    });
    fromCurrency.value = 'USD';
    toCurrency.value = 'EUR';
    lastUpdated.textContent = `Rates last updated: ${data.date}`;
  } catch (err) {
    conversionResult.textContent = 'Error loading currencies';
  }
}

loadCurrencies();

// Convert currency
convertBtn.addEventListener('click', async () => {
  const amount = parseFloat(amountInput.value);
  const from = fromCurrency.value;
  const to = toCurrency.value;

  if (!amount || amount <= 0) {
    conversionResult.textContent = 'Enter a valid amount';
    return;
  }

  conversionResult.textContent = 'Converting...';
  try {
    const res = await fetch(`${API_URL}?base=${from}&symbols=${to}`);
    const data = await res.json();
    const rate = data.rates[to];
    const converted = (amount * rate).toFixed(4);
    conversionResult.textContent = `${amount} ${from} = ${converted} ${to}`;
    lastUpdated.textContent = `Rate last updated: ${data.date}`;
  } catch (err) {
    conversionResult.textContent = 'Conversion failed';
  }
});
