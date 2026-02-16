/* ==========================================
   SMORK'S TECH Calculator & Currency Tool
   2026 Professional Version
========================================== */

/* ---------- CALCULATOR LOGIC ---------- */

const display = document.getElementById("result");
const historyDisplay = document.getElementById("history");
const buttons = document.querySelectorAll(".btn");

let currentInput = "";
let previousInput = "";
let operator = null;

// Update display
function updateDisplay(value) {
    display.value = value || "0";
}

// Clear all
function clearDisplay() {
    currentInput = "";
    previousInput = "";
    operator = null;
    updateDisplay("0");
    historyDisplay.textContent = "";
}

// Delete last character
function deleteLast() {
    currentInput = currentInput.slice(0, -1);
    updateDisplay(currentInput);
}

// Append number or decimal
function appendNumber(number) {
    if (number === "." && currentInput.includes(".")) return;
    currentInput += number;
    updateDisplay(currentInput);
}

// Choose operator
function chooseOperator(op) {
    if (currentInput === "") return;

    if (previousInput !== "") {
        compute();
    }

    operator = op;
    previousInput = currentInput;
    currentInput = "";
    historyDisplay.textContent = `${previousInput} ${operator}`;
}

// Perform calculation
function compute() {
    let result;
    const prev = parseFloat(previousInput);
    const current = parseFloat(currentInput);

    if (isNaN(prev) || isNaN(current)) return;

    switch (operator) {
        case "+":
            result = prev + current;
            break;
        case "-":
            result = prev - current;
            break;
        case "*":
            result = prev * current;
            break;
        case "/":
            result = current === 0 ? "Error" : prev / current;
            break;
        case "%":
            result = prev * (current / 100);
            break;
        default:
            return;
    }

    currentInput = result.toString();
    operator = null;
    previousInput = "";
    historyDisplay.textContent = "";
    updateDisplay(currentInput);
}

// Button click events
buttons.forEach(button => {
    button.addEventListener("click", () => {
        const action = button.dataset.action;

        if (button.classList.contains("number")) appendNumber(action);
        else if (button.classList.contains("operator")) chooseOperator(action);
        else if (button.classList.contains("equal")) compute();
        else if (button.classList.contains("clear")) clearDisplay();
        else if (button.classList.contains("delete")) deleteLast();
    });
});


/* ---------- TAB SWITCHING ---------- */

const calcTab = document.querySelector('[data-tab="calculatorTab"]');
const convertTab = document.querySelector('[data-tab="converterTab"]');
const calculatorSection = document.getElementById("calculatorTab");
const converterSection = document.getElementById("converterTab");

calcTab.addEventListener("click", () => {
    calculatorSection.classList.add("active");
    converterSection.classList.remove("active");
    calcTab.classList.add("active");
    convertTab.classList.remove("active");
});

convertTab.addEventListener("click", () => {
    calculatorSection.classList.remove("active");
    converterSection.classList.add("active");
    convertTab.classList.add("active");
    calcTab.classList.remove("active");
});


/* ---------- CURRENCY CONVERTER ---------- */

const API_KEY = "008c03e87fd9dfb21cd8cd89"; // YOUR API KEY
const amountInput = document.getElementById("amount");
const fromCurrency = document.getElementById("fromCurrency");
const toCurrency = document.getElementById("toCurrency");
const convertBtn = document.getElementById("convertBtn");
const rateInfo = document.getElementById("rateInfo");
const convertedAmount = document.getElementById("convertedAmount");
const lastUpdated = document.getElementById("lastUpdated");

// Populate currency dropdowns
async function populateCurrencies() {
    try {
        const response = await fetch(`https://v6.exchangerate-api.com/v6/${API_KEY}/codes`);
        const data = await response.json();

        if (data.result !== "success") return;

        const codes = data.supported_codes;
        codes.forEach(code => {
            const optionFrom = document.createElement("option");
            optionFrom.value = code[0];
            optionFrom.textContent = `${code[0]} - ${code[1]}`;
            fromCurrency.appendChild(optionFrom);

            const optionTo = document.createElement("option");
            optionTo.value = code[0];
            optionTo.textContent = `${code[0]} - ${code[1]}`;
            toCurrency.appendChild(optionTo);
        });

        fromCurrency.value = "USD";
        toCurrency.value = "NGN";

    } catch (err) {
        convertedAmount.textContent = "Error loading currencies";
    }
}

// Convert currency
async function convertCurrency() {
    const amount = parseFloat(amountInput.value);
    if (isNaN(amount) || amount <= 0) {
        convertedAmount.textContent = "Enter a valid amount";
        return;
    }

    const from = fromCurrency.value;
    const to = toCurrency.value;

    try {
        convertBtn.textContent = "Converting...";
        convertBtn.disabled = true;

        const response = await fetch(`https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${from}`);
        const data = await response.json();

        if (data.result !== "success") {
            convertedAmount.textContent = "Conversion failed";
            return;
        }

        const rate = data.conversion_rates[to];
        const converted = (amount * rate).toFixed(2);

        convertedAmount.textContent = `${amount} ${from} = ${converted} ${to}`;
        rateInfo.textContent = `1 ${from} = ${rate} ${to}`;
        lastUpdated.textContent = `Last Updated: ${data.time_last_update_utc}`;

    } catch (error) {
        convertedAmount.textContent = "Network error. Try again.";
    } finally {
        convertBtn.textContent = "Convert";
        convertBtn.disabled = false;
    }
}

// Initialize dropdowns
populateCurrencies();

// Button click
convertBtn.addEventListener("click", convertCurrency);


/* ---------- KEYBOARD SUPPORT ---------- */

document.addEventListener("keydown", (e) => {
    if (!isNaN(e.key)) appendNumber(e.key);
    if (e.key === ".") appendNumber(".");
    if (["+", "-", "*", "/", "%"].includes(e.key)) chooseOperator(e.key);
    if (e.key === "Enter") compute();
    if (e.key === "Backspace") deleteLast();
    if (e.key === "Escape") clearDisplay();
});
