

## Plan: Add Analytics Tracking for Portfolio Metrics

### What We're Building
A lightweight, client-side analytics system that tracks user engagement metrics and stores them in Supabase. This gives you real data to showcase in your portfolio (DAU, feature usage, conversion rates).

### Architecture
- **New Supabase table**: `analytics_events` to store all events
- **New hook**: `useAnalytics` - simple event tracking utility
- **Integration points**: Key user actions tracked across existing components
- **New admin view**: Simple analytics dashboard (owner-only) on the Settings page

### 1. Database Migration - Create `analytics_events` table

```sql
CREATE TABLE public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  business_id uuid,
  event_name text NOT NULL,
  event_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Users can insert their own events
CREATE POLICY "Users can insert own events"
  ON public.analytics_events FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Owners can read events for their business
CREATE POLICY "Owners can read business events"
  ON public.analytics_events FOR SELECT
  USING (is_business_owner(auth.uid(), business_id) OR user_id = auth.uid());

-- Index for efficient querying
CREATE INDEX idx_analytics_events_name_created ON public.analytics_events (event_name, created_at);
CREATE INDEX idx_analytics_events_user ON public.analytics_events (user_id, created_at);
```

### 2. Create `src/hooks/useAnalytics.ts`

A minimal hook that:
- Exposes `trackEvent(eventName, eventData?)` function
- Batches events (debounced writes to reduce DB calls)
- Auto-tracks `page_view` and `session_start`
- Silently fails (never blocks UI)

### 3. Track Key Events Across the App

| Event | Location | Purpose |
|-------|----------|---------|
| `session_start` | AuthContext (on login) | DAU measurement |
| `page_view` | Index.tsx | Active usage |
| `product_added` | ProductForm.tsx | Feature usage |
| `sale_recorded` | TallyProfit.tsx | Core engagement |
| `report_generated` | SalesReportDialog.tsx | Premium feature usage |
| `marketplace_viewed` | Marketplace.tsx | Feature discovery |
| `supplier_contacted` | ContactSupplierModal.tsx | Conversion metric |
| `upgrade_clicked` | TierComparisonCard, UpgradePrompt | Conversion funnel |
| `ai_assistant_used` | AIAssistant.tsx | Premium feature usage |
| `ai_locked_tapped` | AIAssistantLocked.tsx | Upgrade intent |
| `staff_invited` | ManageStaff.tsx | Premium feature usage |
| `pdf_downloaded` | usePDFReports.ts | Feature usage |

### 4. No Admin Dashboard (Keep It Simple)

Analytics data lives in the database for querying via Supabase SQL Editor or for future dashboard builds. No UI overhead added now -- the portfolio value is in the tracking infrastructure and the data itself, which can be queried directly.

### Files Changed

| File | Action |
|------|--------|
| Migration SQL | Create `analytics_events` table |
| `src/hooks/useAnalytics.ts` | New - event tracking hook |
| `src/contexts/AuthContext.tsx` | Track `session_start` on login |
| `src/pages/Index.tsx` | Track `page_view` |
| `src/components/ProductForm.tsx` | Track `product_added` |
| `src/components/profit-tally/TallyProfit.tsx` | Track `sale_recorded` |
| `src/components/profit-tally/SalesReportDialog.tsx` | Track `report_generated` |
| `src/components/marketplace/Marketplace.tsx` | Track `marketplace_viewed` |
| `src/components/marketplace/ContactSupplierModal.tsx` | Track `supplier_contacted` |
| `src/components/subscription/TierComparisonCard.tsx` | Track `upgrade_clicked` |
| `src/components/UpgradePrompt.tsx` | Track `upgrade_clicked` |
| `src/components/AIAssistant.tsx` | Track `ai_assistant_used` |
| `src/components/AIAssistantLocked.tsx` | Track `ai_locked_tapped` |
| `src/components/staff/ManageStaff.tsx` | Track `staff_invited` |
| `src/hooks/usePDFReports.ts` | Track `pdf_downloaded` |

Each integration is a single `trackEvent()` call -- minimal code changes per file.

