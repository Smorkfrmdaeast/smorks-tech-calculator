// ==========================
// SMORK'S TECH MULTI-MODE CALCULATOR + FULL CURRENCY CONVERTER
// ==========================

document.addEventListener('DOMContentLoaded', () => {
  // --- Calculator Elements ---
  const displayInput = document.getElementById('displayInput');
  const history = document.getElementById('history');
  const normalBtn = document.getElementById('normalBtn');
  const scientificBtn = document.getElementById('scientificBtn');
  const calculatorButtons = document.getElementById('calculatorButtons');
  const scientificButtons = document.getElementById('scientificButtons');
  let currentInput = '';

  // --- Mode Toggle ---
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

  // --- Calculator Button Input ---
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

  // --- Calculator Evaluation ---
  function calculateResult() {
    try {
      let expr = currentInput
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/π/g, 'Math.PI')
        .replace(/e/g, 'Math.E');

      // Convert degrees to radians for trig
      expr = expr.replace(/Math\.sin\(([^)]+)\)/g, (m,p)=>`Math.sin(${p}*Math.PI/180)`);
      expr = expr.replace(/Math\.cos\(([^)]+)\)/g, (m,p)=>`Math.cos(${p}*Math.PI/180)`);
      expr = expr.replace(/Math\.tan\(([^)]+)\)/g, (m,p)=>`Math.tan(${p}*Math.PI/180)`);

      const result = eval(expr);
      history.textContent = currentInput + ' =';
      displayInput.value = result;
      currentInput = result.toString();
    } catch {
      displayInput.value = 'Error';
      currentInput = '';
    }
  }

  // --- Keyboard Support ---
  document.addEventListener('keydown', e => {
    if (!isNaN(e.key) || ['+', '-', '*', '/', '.', '(', ')'].includes(e.key)) handleInput(e.key);
    else if (e.key === 'Enter') handleInput('=');
    else if (e.key === 'Backspace') handleInput('DEL');
    else if (e.key === 'Escape') handleInput('AC');
  });

  // ==========================
  // FULL COUNTRY CURRENCY CONVERTER
  // ==========================
  const amountInput = document.getElementById('amount');
  const fromCurrency = document.getElementById('fromCurrency');
  const toCurrency = document.getElementById('toCurrency');
  const convertBtn = document.getElementById('convertBtn');
  const conversionResult = document.getElementById('conversionResult');
  const lastUpdated = document.getElementById('lastUpdated');

  // Load all currency symbols
  async function loadAllCurrencies() {
    try {
      const res = await fetch('https://api.exchangerate.host/symbols');
      if (!res.ok) throw new Error('API fetch failed');
      const data = await res.json();
      const symbols = data.symbols;
      for (const code in symbols) {
        const name = symbols[code].description;
        fromCurrency.innerHTML += `<option value="${code}">${code} - ${name}</option>`;
        toCurrency.innerHTML += `<option value="${code}">${code} - ${name}</option>`;
      }
      fromCurrency.value = 'USD';
      toCurrency.value = 'EUR';
    } catch {
      conversionResult.textContent = 'Error loading currencies';
    }
  }

  loadAllCurrencies();

  // Convert button
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
      const res = await fetch(`https://api.exchangerate.host/latest?base=${from}&symbols=${to}`);
      const data = await res.json();
      const rate = data.rates[to];
      const converted = (amount * rate).toFixed(4);
      conversionResult.textContent = `${amount} ${from} = ${converted} ${to}`;
      lastUpdated.textContent = `Rate last updated: ${data.date}`;
    } catch {
      conversionResult.textContent = 'Conversion failed';
    }
  });

  // Prevent calculator from capturing converter input
  amountInput.addEventListener('input', e => e.stopPropagation());
});
