## Plan: Agentic Features + Privacy Trust Layer

### Part 1 — Four Agentic Modules

All four run on the existing Lovable AI Gateway path used by `AIAssistant.tsx`. No new edge functions — reuse the existing chat endpoint with structured system prompts. Each agent is a **button on the AI Assistant panel** ("Quick Agents") that pre-fills a specialized query with the user's real business data (sales, products, stock).

**1. Daily Closing Agent** — End-of-day summary
- Button: "Close today's books"
- Pulls today's sales + starting stock, sends to AI with a closing-agent system prompt
- Output: today's revenue, profit, discrepancies (bought vs sold), tomorrow's restock list

**2. Restock Forecasting Agent**
- Button: "What should I buy?"
- Computes 14-day sales velocity per product client-side, sends top movers to AI
- Output: predicted stock-out dates + suggested quantities

**3. Price Negotiation Coach**
- Button: "Help me negotiate"
- Modal asks: product + supplier's offer
- AI returns counter-offer + bilingual script (English/Shona/Ndebele based on user's language)

**4. Spoilage + Cash-Flow Watchdog**
- Button: "Check my business health"
- Analyzes stock aging, discard patterns (products deleted after being added), inflow vs outflow
- Output: warnings + concrete actions

**Implementation:** One new file `src/lib/agents.ts` with 4 prompt builders. Modify `AIAssistant.tsx` to add a "Quick Agents" row of 4 chips above the free-text input. Each chip → builds the specialized prompt → sends via existing chat flow. Track each via `trackEvent('agent_used', { agent: 'daily_closing' })`.

### Part 2 — Privacy Center + Trust Layer

**A. New page: `/privacy-center`** (`src/pages/PrivacyCenter.tsx`)
Sections:
- "Your Data, Your Control" hero (multilingual)
- What we store / what we never store (plain language)
- **Export all my data** button → downloads JSON of products + sales
- **Delete everything** button → wired to existing delete-account edge function
- **Local-Only Mode** toggle (see D)
- Link to AI Transparency Log

**B. Home banner** — dismissible strip on `Index.tsx`: "🔒 Your data stays private — [Privacy Center →]". Uses localStorage `privacy_banner_dismissed`.

**C. Route + nav** — add to `App.tsx`; link from Settings/Profile menu and AboutDialog.

**D. Local-Only Mode**
- New context `LocalOnlyModeContext` reading `localStorage.local_only_mode`
- When ON: `useProducts`/sales hooks skip Supabase writes, use localStorage only
- Big warning modal on enable: "Multi-device sync will stop. Employees won't see your data."
- Simplest safe approach: gate Supabase mutations behind `if (!localOnly)` in the existing hooks — reads still work but writes go to localStorage mirror. Include disable toggle to restore cloud.
- *Scoped implementation:* wire the toggle + context + UI warnings; add the guard in `useSupabaseProducts` and `useSupabaseSalesHistory` write functions to short-circuit to localStorage. Full offline data parity is a follow-up if the user wants deeper coverage.

**E. AI Transparency Log**
- Every AI call already goes through `AIAssistant.tsx`. Add a collapsible "🔍 What was sent" accordion below each assistant message showing the exact context payload (product counts, sales numbers — anonymized, no supplier/customer names).
- Store last 20 payloads in `sessionStorage` (never persisted server-side).

### Files

**New:**
- `src/lib/agents.ts` — 4 prompt builders
- `src/pages/PrivacyCenter.tsx`
- `src/contexts/LocalOnlyModeContext.tsx`
- `src/components/PrivacyBanner.tsx`

**Edited:**
- `src/components/AIAssistant.tsx` — Quick Agents chips + transparency accordion
- `src/App.tsx` — route + LocalOnlyMode provider
- `src/pages/Index.tsx` — banner mount
- `src/hooks/useSupabaseProducts.ts` — local-only write guard
- `src/hooks/useSupabaseSalesHistory.ts` — local-only write guard
- `src/components/AboutDialog.tsx` — Privacy Center link

### Not in scope
- No new DB tables (transparency log is client-only, agents reuse existing AI path)
- No new edge functions
- Language translations for new copy: English first; Shona/Ndebele strings added to existing i18n where trivial, otherwise English fallback.

Ready to build on approval.