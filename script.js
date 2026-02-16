// ================================
// PROFESSIONAL MULTI-MODE CALCULATOR ENGINE
// Normal + Scientific Mode
// Deep Midnight Blue UI Compatible
// ================================

const display = document.getElementById("display");
const buttons = document.querySelectorAll(".btn");
const normalModeBtn = document.getElementById("normalModeBtn");
const scientificModeBtn = document.getElementById("scientificModeBtn");
const scientificPanel = document.getElementById("scientificPanel");

let currentInput = "";

// ================================
// MODE TOGGLE LOGIC
// ================================
normalModeBtn.addEventListener("click", () => {
    scientificPanel.classList.add("hidden");
    normalModeBtn.classList.add("active");
    scientificModeBtn.classList.remove("active");
});

scientificModeBtn.addEventListener("click", () => {
    scientificPanel.classList.remove("hidden");
    scientificModeBtn.classList.add("active");
    normalModeBtn.classList.remove("active");
});

// ================================
// BUTTON HANDLING
// ================================
buttons.forEach(button => {
    button.addEventListener("click", () => {
        const value = button.dataset.value;
        handleInput(value);
    });
});

// ================================
// MAIN INPUT HANDLER
// ================================
function handleInput(value) {

    if (!value) return;

    switch (value) {

        case "clear":
            currentInput = "";
            break;

        case "delete":
            currentInput = currentInput.slice(0, -1);
            break;

        case "=":
            calculate();
            return;

        case "π":
        case "pi":
            currentInput += "Math.PI";
            break;

        case "e":
            currentInput += "Math.E";
            break;

        case "√":
        case "sqrt(":
            currentInput += "Math.sqrt(";
            break;

        case "sin(":
        case "cos(":
        case "tan(":
            currentInput += value;
            break;

        case "log(":
            currentInput += "log10(";
            break;

        case "ln(":
            currentInput += "Math.log(";
            break;

        case "^":
            currentInput += "**";
            break;

        default:
            currentInput += value;
    }

    display.value = currentInput;
}

// ================================
// SAFE CALCULATION ENGINE
// ================================
function calculate() {
    try {

        let expression = currentInput;

        // Convert degree-based trig to radians
        expression = expression.replace(/sin\(([^)]+)\)/g, "Math.sin(($1) * Math.PI / 180)");
        expression = expression.replace(/cos\(([^)]+)\)/g, "Math.cos(($1) * Math.PI / 180)");
        expression = expression.replace(/tan\(([^)]+)\)/g, "Math.tan(($1) * Math.PI / 180)");

        // Log base 10
        expression = expression.replace(/log10\(([^)]+)\)/g, "Math.log10($1)");

        // Evaluate safely
        const result = Function('"use strict"; return (' + expression + ')')();

        currentInput = result.toString();
        display.value = currentInput;

    } catch (error) {
        display.value = "Error";
        currentInput = "";
    }
}

// ================================
// KEYBOARD SUPPORT
// ================================
document.addEventListener("keydown", (e) => {

    if (!isNaN(e.key) || "+-*/().".includes(e.key)) {
        currentInput += e.key;
        display.value = currentInput;
    }

    if (e.key === "Enter") {
        e.preventDefault();
        calculate();
    }

    if (e.key === "Backspace") {
        currentInput = currentInput.slice(0, -1);
        display.value = currentInput;
    }

    if (e.key === "Escape") {
        currentInput = "";
        display.value = "";
    }
});
