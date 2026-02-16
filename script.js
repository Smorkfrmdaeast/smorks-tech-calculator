/* ==========================================
   SMORK'S TECH Calculator & Currency Tool
   Professional Version 2026
========================================== */

/* ---------- CALCULATOR LOGIC ---------- */

const display = document.getElementById("display");
const buttons = document.querySelectorAll(".btn");

let currentInput = "";
let operator = null;
let previousInput = "";

// Update display safely
function updateDisplay(value) {
    display.value = value || "0";
}

// Clear everything
function clearDisplay() {
    currentInput = "";
    previousInput = "";
    operator = null;
    updateDisplay("0");
}

// Delete last digit
function deleteLast() {
    currentInput = currentInput.slice(0, -1);
    updateDisplay(currentInput);
}

// Handle numbers and decimal
function appendNumber(number) {
    if (number === "." && currentInput.includes(".")) return;
    currentInput += number;
    updateDisplay(currentInput);
}

// Handle operator selection
function chooseOperator(op) {
    if (currentInput === "") return;

    if (previousInput !== "") {
        compute();
    }

    operator = op;
    previousInput = currentInput;
    currentInput = "";
}

// Perform calculation safely
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
        default:
            return;
    }

    currentInput = result.toString();
    operator = null;
    previousInput = "";
    updateDisplay(currentInput);
}

// Button Event Handling
buttons.forEach(button => {
    button.addEventListener("click", () => {
        const value = button.dataset.value;

        if (button.classList.contains("number")) {
            appendNumber(value);
        }

        if (button.classList.contains("operator")) {
            chooseOperator(value);
        }

        if (button.classList.contains("equal")) {
            compute();
        }

        if (button.classList.contains("clear")) {
            clearDisplay();
        }

        if (button.classList.contains("delete")) {
            deleteLast();
        }
    });
});


/* ---------- TAB SWITCHING (Calculator / Converter) ---------- */

const calcTab = document.getElementById("calcTab");
const convertTab = document.getElementById("convertTab");
const calculatorSection = document.getElementById("calculator");
const converterSection = document.getElementById("converter");

calcTab.addEventListener("click", () => {
    calculatorSection.style.display = "block";
    converterSection.style.display = "none";
    calcTab.classList.add("active");
    convertTab.classList.remove("active");
});

convertTab.addEventListener("click", () => {
    calculatorSection.style.display = "none";
    converterSection.style.display = "block";
    convertTab.classList.add("active");
    calcTab.classList.remove("active");
});


/* ---------- CURRENCY CONVERTER ---------- */

// 🔐 Replace with your real API key
const API_KEY = "YOUR_API_KEY_HERE";

const amountInput = document.getElementById("amount");
const fromCurrency = document.getElementById("fromCurrency");
const toCurrency = document.getElementById("toCurrency");
const convertBtn = document.getElementById("convertBtn");
const resultText = document.getElementById("result");
const rateInfo = document.getElementById("rateInfo");

async function convertCurrency() {
    const amount = parseFloat(amountInput.value);

    if (isNaN(amount) || amount <= 0) {
        resultText.textContent = "Enter a valid amount";
        return;
    }

    const from = fromCurrency.value;
    const to = toCurrency.value;

    try {
        convertBtn.textContent = "Converting...";
        convertBtn.disabled = true;

        const response = await fetch(
            `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${from}`
        );

        const data = await response.json();

        if (data.result !== "success") {
            resultText.textContent = "Conversion failed";
            return;
        }

        const rate = data.conversion_rates[to];
        const converted = (amount * rate).toFixed(2);

        resultText.textContent = `${amount} ${from} = ${converted} ${to}`;
        rateInfo.textContent = `1 ${from} = ${rate} ${to}`;

    } catch (error) {
        resultText.textContent = "Network error. Try again.";
    } finally {
        convertBtn.textContent = "Convert";
        convertBtn.disabled = false;
    }
}

convertBtn.addEventListener("click", convertCurrency);


/* ---------- KEYBOARD SUPPORT ---------- */

document.addEventListener("keydown", (e) => {
    if (!isNaN(e.key)) appendNumber(e.key);

    if (e.key === ".") appendNumber(".");

    if (["+", "-", "*", "/"].includes(e.key)) {
        chooseOperator(e.key);
    }

    if (e.key === "Enter") compute();

    if (e.key === "Backspace") deleteLast();

    if (e.key === "Escape") clearDisplay();
});
