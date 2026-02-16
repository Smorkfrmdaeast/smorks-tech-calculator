// ==============================
// SMORK'S TECH CALCULATOR & CONVERTER
// © 2026 SMORK'S TECH — All Rights Reserved
// ==============================

// ------------------------------
// TAB SWITCHING
// ------------------------------
const tabs = document.querySelectorAll('.tab');
const contents = document.querySelectorAll('.content');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        contents.forEach(c => c.classList.remove('active'));
        document.getElementById(tab.dataset.tab).classList.add('active');
    });
});

// ------------------------------
// CALCULATOR LOGIC
// ------------------------------
const result = document.getElementById('result');
const history = document.getElementById('history');
const buttons = document.querySelectorAll('.buttons .btn');

let currentInput = '';
let prevInput = '';
let operator = '';

buttons.forEach(button => {
    button.addEventListener('click', () => {
        const value = button.textContent;

        if (value === 'C') {
            currentInput = '';
            prevInput = '';
            operator = '';
            result.value = '';
            history.textContent = '';
        } else if (value === '⌫') {
            currentInput = currentInput.slice(0, -1);
            result.value = currentInput;
        } else if (value === '=') {
            if (currentInput === '' || operator === '') return;
            calculate();
        } else if (['+', '−', '×', '÷', '%'].includes(value)) {
            if (currentInput === '') return;
            if (prevInput !== '') calculate();
            operator = value;
            prevInput = currentInput;
            currentInput = '';
            history.textContent = `${prevInput} ${operator}`;
        } else {
            // prevent multiple decimals
            if (value === '.' && currentInput.includes('.')) return;
            currentInput += value;
            result.value = currentInput;
        }
    });
});

function calculate() {
    let a = parseFloat(prevInput);
    let b = parseFloat(currentInput);
    let res = 0;

    switch (operator) {
        case '+': res = a + b; break;
        case '−': res = a - b; break;
        case '×': res = a * b; break;
        case '÷': 
            if (b === 0) {
                res = 'Error';
                break;
            }
            res = a / b; 
            break;
        case '%': res = (a * b) / 100; break;
        default: res = 0;
    }

    result.value = res;
    history.textContent = `${prevInput} ${operator} ${currentInput} =`;
    currentInput = res.toString();
    prevInput = '';
    operator = '';
}

// Keyboard support
document.addEventListener('keydown', (e) => {
    const keyMap = {
        '0':'0','1':'1','2':'2','3':'3','4':'4','5':'5','6':'6','7':'7','8':'8','9':'9',
        '+':'+','-':'−','*':'×','/':'÷','.':'.','Enter':'=','Backspace':'⌫','Delete':'C'
    };
    const key = keyMap[e.key];
    if (key) {
        buttons.forEach(btn => { if (btn.textContent === key) btn.click(); });
    }
});

// ------------------------------
// CURRENCY CONVERTER
// ------------------------------
const apiKey = '008c03e87fd9dfb21cd8cd89';
const fromCurrency = document.getElementById('fromCurrency');
const toCurrency = document.getElementById('toCurrency');
const amountInput = document.getElementById('amount');
const convertBtn = document.getElementById('convertBtn');
const convertedAmount = document.getElementById('convertedAmount');
const rateInfo = document.getElementById('rateInfo');
const lastUpdated = document.getElementById('lastUpdated');

let rates = {};

// Fetch exchange rates
async function fetchRates() {
    try {
        rateInfo.textContent = 'Loading rates...';
        const res = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`);
        const data = await res.json();
        if (data.result === 'success') {
            rates = data.conversion_rates;
            populateCurrencies();
            rateInfo.textContent = 'Rates loaded successfully';
        } else {
            rateInfo.textContent = 'Failed to load rates';
        }
    } catch (err) {
        console.error(err);
        rateInfo.textContent = 'Error fetching rates';
    }
}

function populateCurrencies() {
    fromCurrency.innerHTML = '';
    toCurrency.innerHTML = '';
    Object.keys(rates).forEach(curr => {
        const optionFrom = document.createElement('option');
        optionFrom.value = curr;
        optionFrom.textContent = curr;
        fromCurrency.appendChild(optionFrom);

        const optionTo = document.createElement('option');
        optionTo.value = curr;
        optionTo.textContent = curr;
        toCurrency.appendChild(optionTo);
    });

    fromCurrency.value = 'USD';
    toCurrency.value = 'EUR';
}

// Conversion
convertBtn.addEventListener('click', () => {
    const from = fromCurrency.value;
    const to = toCurrency.value;
    const amount = parseFloat(amountInput.value);

    if (!amount || !rates[from] || !rates[to]) return;

    const converted = (amount / rates[from]) * rates[to];
    convertedAmount.textContent = `${amount.toFixed(2)} ${from} = ${converted.toFixed(2)} ${to}`;
    rateInfo.textContent = `1 ${from} = ${(rates[to]/rates[from]).toFixed(4)} ${to}`;
    lastUpdated.textContent = `Last updated: ${new Date().toLocaleString()}`;
});

// Initialize
fetchRates();
