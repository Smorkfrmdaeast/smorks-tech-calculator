/* =========================================
   SMORK'S TECH CALCULATOR + CONVERTER
   © 2026 ALL RIGHTS RESERVED
========================================= */

/* ===============================
   TAB SWITCHING
=============================== */
const tabs = document.querySelectorAll(".tab");
const contents = document.querySelectorAll(".content");

tabs.forEach(tab => {
    tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("active"));
        contents.forEach(c => c.classList.remove("active"));

        tab.classList.add("active");
        document.getElementById(tab.dataset.tab).classList.add("active");
    });
});

/* ===============================
   CALCULATOR LOGIC
=============================== */

const resultInput = document.getElementById("result");
const historyDisplay = document.getElementById("history");
const buttons = document.querySelectorAll(".btn");

let currentInput = "";

/* Prevent multiple decimals */
function canAddDecimal() {
    const parts = currentInput.split(/[\+\−\×\÷]/);
    const lastNumber = parts[parts.length - 1];
    return !lastNumber.includes(".");
}

/* Safe evaluation without eval */
function safeEvaluate(expression) {
    const formatted = expression
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/−/g, "-");

    if (/\/0(?!\d)/.test(formatted)) {
        throw new Error("Cannot divide by zero");
    }

    return Function(`"use strict"; return (${formatted})`)();
}

function handleInput(value) {

    if (value === "C") {
        currentInput = "";
        resultInput.value = "";
        historyDisplay.textContent = "";
        return;
    }

    if (value === "⌫") {
        currentInput = currentInput.slice(0, -1);
        resultInput.value = currentInput;
        return;
    }

    if (value === "=") {
        if (!currentInput) return;

        try {
            const answer = safeEvaluate(currentInput);
            historyDisplay.textContent = currentInput + " =";
            resultInput.value = answer;
            currentInput = answer.toString();
        } catch {
            resultInput.value = "Error";
            currentInput = "";
        }
        return;
    }

    if (value === ".") {
        if (!canAddDecimal()) return;
    }

    const operators = ["+", "−", "×", "÷", "%"];

    if (operators.includes(value)) {
        if (!currentInput || operators.includes(currentInput.slice(-1))) return;
    }

    currentInput += value;
    resultInput.value = currentInput;
}

/* Button Clicks */
buttons.forEach(button => {
    button.addEventListener("click", () => {
        handleInput(button.textContent);
    });
});

/* ===============================
   KEYBOARD SUPPORT
=============================== */
document.addEventListener("keydown", (e) => {

    if (!isNaN(e.key)) handleInput(e.key);
    if (e.key === ".") handleInput(".");
    if (e.key === "+") handleInput("+");
    if (e.key === "-") handleInput("−");
    if (e.key === "*") handleInput("×");
    if (e.key === "/") handleInput("÷");

    if (e.key === "Enter") handleInput("=");
    if (e.key === "Backspace") handleInput("⌫");
    if (e.key === "Escape") handleInput("C");
});

/* ===============================
   CURRENCY CONVERTER
=============================== */

const apiKey = "008c03e87fd9dfb21cd8cd89";  // Your API Key

const amountInput = document.getElementById("amount");
const fromCurrency = document.getElementById("fromCurrency");
const toCurrency = document.getElementById("toCurrency");
const convertBtn = document.getElementById("convertBtn");

const rateInfo = document.getElementById("rateInfo");
const convertedAmount = document.getElementById("convertedAmount");
const lastUpdated = document.getElementById("lastUpdated");

/* Load currency list */
async function loadCurrencies() {
    try {
        const response = await fetch(
            `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`
        );

        const data = await response.json();

        if (data.result !== "success") {
            throw new Error("API Error");
        }

        const currencies = Object.keys(data.conversion_rates);

        currencies.forEach(currency => {
            fromCurrency.innerHTML += `<option value="${currency}">${currency}</option>`;
            toCurrency.innerHTML += `<option value="${currency}">${currency}</option>`;
        });

        fromCurrency.value = "USD";
        toCurrency.value = "EUR";

    } catch (error) {
        convertedAmount.textContent = "Failed to load currencies.";
    }
}

/* Convert currency */
async function convertCurrency() {

    const amount = parseFloat(amountInput.value);

    if (!amount || amount <= 0) {
        alert("Enter a valid amount");
        return;
    }

    convertedAmount.textContent = "Converting...";
    rateInfo.textContent = "";
    lastUpdated.textContent = "";

    try {
        const response = await fetch(
            `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${fromCurrency.value}`
        );

        const data = await response.json();

        if (data.result !== "success") {
            throw new Error("Conversion failed");
        }

        const rate = data.conversion_rates[toCurrency.value];
        const result = (amount * rate).toFixed(2);

        rateInfo.textContent =
            `1 ${fromCurrency.value} = ${rate} ${toCurrency.value}`;

        convertedAmount.textContent =
            `${amount} ${fromCurrency.value} = ${result} ${toCurrency.value}`;

        lastUpdated.textContent =
            `Last Updated: ${data.time_last_update_utc}`;

    } catch (error) {
        convertedAmount.textContent = "Conversion failed. Try again.";
    }
}

convertBtn.addEventListener("click", convertCurrency);

/* Load currencies when page loads */
loadCurrencies();
