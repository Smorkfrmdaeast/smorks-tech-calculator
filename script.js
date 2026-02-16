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

// Handle button clicks
document.querySelectorAll('button.btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const value = btn.dataset.value;

    if (value === 'AC') {
      currentInput = '';
      history = '';
    } else if (value === 'DEL') {
      currentInput = currentInput.slice(0, -1);
    } else if (value === '=') {
      try {
        let expression = currentInput
          .replace(/÷/g, '/')
          .replace(/×/g, '*')
          .replace(/√/g, 'Math.sqrt')
          .replace(/sin\(/g, 'Math.sin(toRad(')
          .replace(/cos\(/g, 'Math.cos(toRad(')
          .replace(/tan\(/g, 'Math.tan(toRad(')
          .replace(/ln\(/g, 'Math.log(')
          .replace(/log\(/g, 'Math.log10(')
          .replace(/\^2/g, '**2')
          .replace(/\^/g, '**');
        
        const result = eval(expression);
        history = currentInput + ' =';
        currentInput = result;
      } catch {
        currentInput = 'Error';
      }
    } else {
      currentInput += value;
    }
    updateDisplay();
  });
});

// Convert degrees to radians for trig
function toRad(deg) {
  return deg * Math.PI / 180;
}

// ===== KEYBOARD SUPPORT =====
document.addEventListener('keydown', (e) => {
  const key = e.key;
  if (!isNaN(key) || '+-*/().'.includes(key)) {
    currentInput += key;
  } else if (key === 'Enter') {
    document.querySelector('button.equal').click();
  } else if (key === 'Backspace') {
    currentInput = currentInput.slice(0, -1);
  } else if (key === 'Escape') {
    currentInput = '';
    history = '';
  }
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

const apiKey = 'YOUR_API_KEY_HERE'; // Insert your API key
let currencyList = [];

async function fetchCurrencies() {
  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/USD`);
    const data = await res.json();
    currencyList = Object.keys(data.rates);
    currencyList.forEach(cur => {
      fromCurrency.innerHTML += `<option value="${cur}">${cur}</option>`;
      toCurrency.innerHTML += `<option value="${cur}">${cur}</option>`;
    });
  } catch (err) {
    console.error('Error fetching currencies', err);
  }
}

async function convertCurrency() {
  const amount = parseFloat(amountInput.value);
  const from = fromCurrency.value;
  const to = toCurrency.value;

  if (!amount || !from || !to) return;

  try {
    exchangeRateText.textContent = 'Loading...';
    const res = await fetch(`https://open.er-api.com/v6/latest/${from}`);
    const data = await res.json();
    const rate = data.rates[to];
    const converted = (amount * rate).toFixed(2);

    convertedAmountText.textContent = `${amount} ${from} = ${converted} ${to}`;
    exchangeRateText.textContent = `1 ${from} = ${rate.toFixed(4)} ${to}`;
    lastUpdatedText.textContent = `Last Updated: ${data.time_last_update_utc}`;
  } catch (err) {
    exchangeRateText.textContent = 'Error fetching conversion';
    convertedAmountText.textContent = '';
    lastUpdatedText.textContent = '';
    console.error(err);
  }
}

convertBtn.addEventListener('click', convertCurrency);

fetchCurrencies();
