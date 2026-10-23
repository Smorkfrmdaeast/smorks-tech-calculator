# SMORK'S TECH Calculator & Currency Converter

A refined, organic redesign of SMORK'S TECH Calculator & Currency Converter crafted to feel like a mature, hardware-inspired utility application built by a senior web engineer—combining a tactile Normal/Scientific calculator with a live exchange-rate currency converter.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and UX choices incorporate your confirmed preferences from the clarification step:

- **Confirmed Decision 1 — Desktop & Mobile Layout**: Side-by-side split workspace (`max-w-5xl`) on desktop screens (`lg:grid-cols-12`) pairing the primary calculator chassis on the left with the currency converter on the right, collapsing cleanly into a single-column vertical flow on mobile viewports (`375px–430px`).
- **Confirmed Decision 2 — Calculation History & Expression Recall**: A compact, collapsible recent calculations list integrated directly into the calculator module, plus a two-line display showing the active expression above the evaluated result with one-click recall.
- **Confirmed Decision 3 — Live Currency Conversion**: Instant live calculation as the user types or changes currencies, complemented by an explicit **Convert / Refresh** button, a one-click **Swap Currencies** control, unit exchange rate readout (`1 USD = X EUR`), and automatic fallback currency support.

---

### 1. Overview & Core Concept

- **What It Does**: Provides a dual-mode calculator (Normal arithmetic and degree-based Scientific functions) alongside a real-time multi-currency converter powered by `open.er-api.com`.
- **Target Audience / Persona**: Developers, engineers, students, and everyday users who need an immediate, dependable calculation and currency utility without visual clutter or artificial dashboard bloat.
- **Key Value**: Elevates the original functional prototype into a portfolio-grade software product through disciplined surface contrast, tabular numeric typography, tactile button hierarchy, full keyboard accessibility, and resilient network state handling.

---

### 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Immediate Calculation**: Users land directly on the calculator with keyboard focus ready. Typing numbers/operators or clicking keypad buttons updates the active expression line and live preview; pressing `=` or `Enter` commits the calculation to the collapsible history tape and promotes the result.
  2. **Scientific Mode Expansion**: Toggling the segmented control from **Normal** to **Scientific** smoothly reveals the scientific function rows (`sin`, `cos`, `tan` in degrees, `√`, `log`, `ln`, `x²`, `xʸ`, `π`, `e`, parentheses) with clear degree-mode labeling (`DEG`).
  3. **History Recall**: Opening the compact history drawer lets users click any previous expression or result to insert it back into the active display or clear the tape.
  4. **Currency Conversion**: Entering an amount or selecting `From` / `To` currencies immediately computes the converted value using cached or freshly fetched rates from `open.er-api.com`, displays the unit rate (`1 FROM = X.XXXX TO`), and allows instant currency reversal via the Swap button.

- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Utilitarian, hardware-inspired precision software (think Braun/Dieter Rams functional clarity adapted to a modern dark-mode web tool). Zero neon glow, zero decorative blobs, zero fake telemetry tickers.
  - *Color Palette & Mood (60-30-10 Discipline)*:
    - **60% Foundation Canvas**: Deep Midnight Blue (`#0A0F2C`) background grounding the viewport, paired with neutral dark slate surfaces (`#0F1638` and `#131B42`) and quiet hairline borders (`rgba(255, 255, 255, 0.08)`).
    - **30% Structural Controls & Surfaces**: Distinct tactile keycaps—neutral dark indigo-slate (`#18224D`) for numbers, deeper recessed navy (`#11193B`) for scientific/secondary keys, muted slate-blue (`#1E2B63`) for operators, and subtle warm-tinted neutral (`#2A1C35`) for `AC`/`DEL` destructive actions.
    - **10% Accent Budget**: Royal Blue (`#4169E1`) reserved strictly for high-intent focal points: the `=` action key, the active mode segment indicator, the primary Convert button, and focus rings.
  - *Typography & Hierarchy*:
    - **UI & Controls**: `Plus Jakarta Sans` (weights 500, 600) for crisp, legible control labels, section titles, and currency selectors.
    - **Numeric Display, Keypad & Rates**: `JetBrains Mono` with `font-variant-numeric: tabular-nums` so expressions, decimal points,scientific exponents, and currency figures align without horizontal jitter.
    - **Responsive Display Scaling**: Dynamic font sizing on the primary calculator readout (`text-4xl` down to `text-xl` as character length increases) with horizontal scroll protection so long expressions never clip.
  - *Component Styling & Layout*:
    - Single-elevation panels (`rounded-xl`, `1px` subtle border, quiet top highlight) with generous internal padding (`p-5` to `p-6`) and minimum `48px` touch targets on mobile.
    - Unboxed metadata with middle-dot (`·`) separators for status info (e.g., `DEG · Keyboard active` and `Rate: 1 USD = 0.9241 EUR · Updated live`).

- **Interactive Feedback & Motion**:
  - Instant tactile button states (`active:translate-y-[1px]`, subtle surface brightening on hover, visible `focus-visible:ring-2 focus-visible:ring-[#4169E1]`) settling within `120ms`.
  - Brief visual highlight on the corresponding keypad button when triggered via physical keyboard keys.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Safe, Deterministic Expression Engine Preserving `Math.*` & Degree Trig**
  - *Chosen Approach*: Format user tokens for clean human readability on screen (e.g., displaying `sin(45)` and `9 × 3` in the expression bar while mapping to degree-aware `Math.sin(rad(45))` and `9 * 3` under the hood), handling implicit parenthesis closure, division-by-zero checks (`Infinity` / `NaN` caught cleanly as `"Cannot divide by zero"` or `"Format error"`), and floating-point precision rounding (e.g., `0.1 + 0.2 = 0.3`).
  - *Why*: Raw JavaScript syntax like `Math.sin(rad(` in the user-facing display looks broken and unpolished to a senior developer reviewing the app. Separating the display tokens from the evaluation expression preserves 100% of the existing scientific functionality while making the display feel like a real calculator.
  - *Alternatives Considered*: Displaying raw `Math.sin(rad(` strings directly in the input box—rejected because it hurts readability and feels like an unfinished prototype.

- **Decision 2: Cached Live Exchange Rates with Instant Reactive Conversion**
  - *Chosen Approach*: Cache the fetched rate table per base currency in memory so typing amounts or changing target currencies recalculates instantaneously (`0ms` latency), while changing the base currency or clicking **Convert** fetches fresh rates from `https://open.er-api.com/v6/latest/{from}` with clear loading and offline fallback states.
  - *Why*: Prevents redundant network requests on every keystroke while delivering instant feedback and preserving the explicit Convert button workflow.

---

### 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           App Shell & Header                            │
│        Brand Title  ·  Keyboard Shortcuts Popover  ·  Mode Status       │
└───────────────────┬─────────────────────────────────┬───────────────────┘
                    │                                 │
                    ▼                                 ▼
┌───────────────────────────────────────┐ ┌───────────────────────────────┐
│           Calculator Module           │ │   Currency Converter Module   │
│  ┌─────────────────────────────────┐  │ │  ┌─────────────────────────┐  │
│  │ Segmented Mode Switch           │  │ │  │ Amount Numeric Input    │  │
│  │ [ Normal ]  [ Scientific · DEG ]│  │ │  └────────────┬────────────┘  │
│  ├─────────────────────────────────┤  │ │               ▼               │
│  │ Multi-Line Display Screen       │  │ │  ┌─────────────────────────┐  │
│  │ • Previous Expression / Ans     │  │ │  │ From Currency Select    │  │
│  │ • Active Expression / Input     │  │ │  │       [ ⇅ Swap ]        │  │
│  │ • Collapsible History Tape (N)  │  │ │  │ To Currency Select      │  │
│  ├─────────────────────────────────┤  │ │  └────────────┬────────────┘  │
│  │ Scientific Keypad Grid (Cond.)  │  │ │               ▼               │
│  │ sin cos tan √ log ln x² xʸ π e  │  │ │  ┌─────────────────────────┐  │
│  ├─────────────────────────────────┤  │ │  │ Converted Result Panel  │  │
│  │ Primary Tactile Keypad Grid     │  │ │  │ • Formatted Output      │  │
│  │ AC  DEL  %   ÷                  │  │ │  │ • 1 FROM = X.XXXX TO    │  │
│  │ 7   8    9   ×     + Keyboard   │  │ │  │ • Convert / Refresh Btn │  │
│  │ 4   5    6   −       Listener   │  │ │  └─────────────────────────┘  │
│  │ 1   2    3   +                  │  │ └───────────────┬───────────────┘
│  │ 0        .   =                  │  │                 │
│  └─────────────────────────────────┘  │                 ▼
└───────────────────────────────────────┘ ┌───────────────────────────────┐
                                          │   Exchange Rate Service       │
                                          │ • open.er-api.com/v6/latest   │
                                          │ • Rate Cache + Fallback List  │
                                          └───────────────────────────────┘
```

- **Data Model & State**:
  - `CalculatorState`: `mode` (`'normal' | 'scientific'`), `expression` (raw/token string), `displayValue` (formatted current value or result), `previousExpression` (last evaluated formula), `error` (nullable error label), `history` (array of `{ id, expression, result, timestamp }`), `isHistoryOpen` (boolean), and `activeKey` (briefly highlights physical key presses).
  - `ConverterState`: `amount` (string), `fromCurrency` (string, default `'USD'`), `toCurrency` (string, default `'EUR'`), `currencies` (string array initialized with fallback list and hydrated from API), `ratesCache` (`Record<string, Record<string, number>>`), `isLoading` (boolean), `error` (nullable string), and `lastUpdated` (timestamp/status).

- **Interactive Component & State Mapping**:
  - **Keypad & Keyboard Handler**: Maps number keys (`0-9`, `.`), operators (`+`, `-`, `*`, `/`, `%`, `(`, `)`), scientific functions, `Backspace` (`DEL`), `Escape` (`AC`), and `Enter`/`=` (`calculate`). Prevents keyboard capture when the user is focused inside the Currency Converter inputs.
  - **History Drawer**: Toggles open/closed; clicking a history row loads its result or expression back into the calculator display; includes a `Clear History` action.
  - **Currency Swap & Live Calculation**: Clicking the Swap button exchanges `fromCurrency` and `toCurrency` and immediately updates the converted output. Clicking `Convert` forces a fresh rate check and updates the result readout.
