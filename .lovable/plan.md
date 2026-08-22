# Currency Safeguards for Zimbabwe Trading Reality

## The problem today (verified in code)

- Every product price (`buyingPrice`, `transportCost`, `stallFee`, `sellingPrice`) is stored as a plain number with **no currency tag**. `ProductForm` has no currency logic at all.
- The app has one global rate (`CurrencyContext`, saved in `localStorage`) used **only for display**. Switching to ZWL just multiplies all stored numbers by the rate.
- So if a trader is in ZWL mode and types a ZWL buying price, it is stored as if it were USD, then multiplied by the rate again on screen. Costs and profit become wrong by a factor of the rate, silently.
- The rate has no date and never expires. A rate typed weeks ago keeps re-pricing today's stock with no warning.
- Profit mixes goods bought at an old rate with sales made at a new rate, with nothing showing the trader that this happened.

These are exactly the traps that knock an informal trader off kilter. Fixes below stay simple and visual — no accounting jargon.

## What we build

### 1. Money always knows its currency
Every price entered is stamped with the currency it was typed in plus the rate in force at that moment. Under the hood everything still settles to a single USD base figure, so totals and profit never double-convert. The trader just sees "You are entering prices in USD / ZWL" right above the price fields, matching the currency switch.

### 2. Rate freshness reminder
The rate gets a "last updated" date. If it is older than 3 days, a soft yellow strip appears at the top: "Your ZWL rate is from 18/08. Is it still correct?" with an Update button. No blocking, one tap to fix or dismiss for the day.

### 3. Sanity check on the rate
If a newly typed rate is more than 30% away from the previous one, ask once: "You changed the rate from 1 200 to 30 000. Is that right?" Catches missing or extra zeros, the most common and most damaging typo.

### 4. Silent-loss warning on ZWL sales
When a product was bought at an older rate and is now being sold after the rate has moved, the sale row shows a small note: "Rate moved since you bought this — your real profit is X, not Y." Plain numbers only.

### 5. Real profit in USD, always visible
The Daily Summary keeps its current headline but adds one small line underneath: the same profit expressed in USD at today's rate. This is the number that tells a Zimbabwean trader whether they actually made money or just held depreciating cash.

### 6. Rounding that matches the street
ZWL amounts display as whole numbers with thousand separators (no cents — nobody prices in ZWL cents). USD keeps 2 decimals. Change and totals never show misleading fractions.

### 7. Change-of-currency guard
Switching USD to ZWL while a form is half filled clears nothing but shows: "Prices you type now are in ZWL." Prevents the mixed-entry mistake at its source.

## Technical notes

- `Product` gains `entryCurrency` and `entryRate`; `calculateProduct` normalises to USD base before all maths. Existing rows default to `USD` / rate `1`, so current data stays correct.
- `CurrencySettings` gains `rateUpdatedAt` and `previousRate`; the sanity check and freshness strip read from these.
- Add `formatPrice` variants: ZWL to 0 decimals with locale grouping, USD to 2.
- New `src/components/currency/RateFreshnessBar.tsx` and a confirm dialog inside `CurrencySelector`.
- Guest local store and Supabase both persist the two new product fields; a migration adds nullable `entry_currency` / `entry_rate` columns with USD/1 defaults.
- All new strings translated in English, Shona and Ndebele.
