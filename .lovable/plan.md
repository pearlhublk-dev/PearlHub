

# Fix useState Error, Add ErrorBoundary & Smoke Tests

## Root Cause

The `useState` null error at "line 319" of App.tsx (which only has 88 lines) indicates stale Vite dependency cache serving an old bundled version. The current `vite.config.ts` dedupe fix is correct but incomplete — `react-dom/client` (used in `main.tsx`) is missing from the dedupe/alias list, potentially causing a second React instance.

## Plan

### 1. Fix Vite config — add missing React entry points
In `vite.config.ts`, add `react-dom/client` to both the alias map and dedupe array. This ensures `createRoot` in `main.tsx` uses the same React instance as all components.

### 2. Create ErrorBoundary component
Create `src/components/ErrorBoundary.tsx` — a class component that catches render errors and shows a branded fallback UI with a "Reload" button instead of a blank screen.

### 3. Wrap App with ErrorBoundary
In `src/main.tsx`, wrap `<App />` with `<ErrorBoundary>` so any crash in the component tree shows the fallback instead of a white screen.

### 4. Create Playwright smoke test
Create `tests/smoke.spec.ts` that:
- Navigates to `/` and confirms content renders (no blank screen)
- Checks `/dashboard`, `/property`, `/stays`, `/vehicles`, `/events`, `/auth`
- Collects console errors and asserts none are runtime errors
- Verifies no `useState` null errors appear

