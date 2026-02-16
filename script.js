// ===== MODE TOGGLE =====
const normalBtn = document.getElementById('normalModeBtn');
const scientificBtn = document.getElementById('scientificModeBtn');
const normalCalc = document.getElementById('normalCalculator');
const scientificCalc = document.getElementById('scientificCalculator');

normalBtn.addEventListener('click', () => {
  normalCalc.classList.remove('hidden');
  scientificCalc.classList.add('hidden');
  normalBtn.classList.add('active');
  scientificBtn.classList.remove('active');
});

scientificBtn.addEventListener('click', () => {
  normalCalc.classList.add('hidden');
  scientificCalc.classList.remove('hidden');
  scientificBtn.classList.add('active');
  normalBtn.classList.remove('active');
});

// ===== DISPLAY & BUTTONS =====
const inputDisplay = document.getElementById('inputDisplay');
const historyDisplay = document.getElementById('history');
let currentInput = '';
let history = '';

function updateDisplay() {
  inputDisplay.value = currentInput || '0';
  historyDisplay.textContent = history;
}

// Convert degrees to radians
function toRad(deg) { return deg * Math.PI / 180; }

// Safe calculation for scientific functions
function calculate(input) {
  try {
    const expr = input
      .replace(/÷/g, '/')
      .replace(/×/g, '*')
      .replace(/√\(/g, 'Math.sqrt(')
      .replace(/sin\(/g, 'Math.sin(toRad(')
      .replace(/cos\(/g, 'Math.cos(toRad(')
      .replace(/tan\(/g, 'Math.tan(toRad(')
      .replace(/ln\(/g, 'Math.log(')
      .replace(/log\(/g, 'Math.log10(')
      .replace(/\^2/g, '**2')
      .replace(/\^/g, '**');

    const func = new Function('toRad', `return ${expr}`);
    return func(toRad);
  } catch {
    return 'Error';
  }
}

// Buttons
document.querySelectorAll('button.btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const value = btn.dataset.value;

    if (value === 'AC') {
      currentInput = '';
      history = '';
    } else if (value === 'DEL') {
      currentInput = currentInput.slice(0, -1);
    } else if (value === '=') {
      history = currentInput + ' =';
      currentInput = calculate(currentInput);
    } else {
      currentInput += value;
    }
    updateDisplay();
  });
});

// Keyboard support
document.addEventListener('keydown', (e) => {
  const key = e.key;
  if (!isNaN(key) || '+-*/().'.includes(key)) currentInput += key;
  if (key === 'Enter') document.querySelector('button.equal').click();
  if (key === 'Backspace') currentInput = currentInput.slice(0, -1);
  if (key === 'Escape') { currentInput=''; history=''; }
  updateDisplay();
});

// ===== CURRENCY CONVERTER =====
const amountInput = document.getElementById('amount');
const fromCurrency = document.getElementById('fromCurrency');
const toCurrency = document.getElementById('toCurrency');
const convertBtn = document.getElementById('convertBtn');
const exchangeRateText = document.getElementById('exchangeRate');
const convertedAmountText = document.getElementById('convertedAmount');
const lastUpdatedText = document.getElementById('lastUpdated');

// Populate currency list
async function fetchCurrencies() {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    const data = await res.json();
    const currencies = Object.keys(data.rates);
    currencies.forEach(cur => {
      fromCurrency.innerHTML += `<option value="${cur}">${cur}</option>`;
      toCurrency.innerHTML += `<option value="${cur}">${cur}</option>`;
    });
    fromCurrency.value = 'USD';
    toCurrency.value = 'EUR';
  } catch(err) { console.error(err); }
}

async function convertCurrency() {
  const amount = parseFloat(amountInput.value);
  const from = fromCurrency.value;
  const to = toCurrency.value;
  if (!amount || !from || !to) return;

  exchangeRateText.textContent = 'Loading...';
  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/${from}`);
    const data = await res.json();
    const rate = data.rates[to];
    const converted = (amount * rate).toFixed(2);
    exchangeRateText.textContent = `1 ${from} = ${rate.toFixed(4)} ${to}`;
    convertedAmountText.textContent = `${amount} ${from} = ${converted} ${to}`;
    lastUpdatedText.textContent = `Last Updated: ${data.time_last_update_utc}`;
  } catch(err) {
    exchangeRateText.textContent = 'Error fetching rate';
    convertedAmountText.textContent = '';
    lastUpdatedText.textContent = '';
    console.error(err);
  }
}

convertBtn.addEventListener('click', convertCurrency);
fetchCurrencies();
