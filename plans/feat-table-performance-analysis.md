# feat: Table Performance Analysis Test Environment

## Enhancement Summary

**Deepened on:** 2026-01-22
**Research agents used:** performance-oracle, architecture-strategist, code-simplicity-reviewer, kieran-typescript-reviewer, julik-frontend-races-reviewer, best-practices-researcher, Context7

### Key Improvements
1. Simplified file structure - single page.tsx with inline components (per simplicity review)
2. Enhanced benchmark methodology - increased iterations, added P95/P99 percentiles
3. Added race condition mitigations for timing measurements
4. Added React Profiler integration with proper callback patterns
5. Revised presets for better O(n) vs O(n²) analysis

### New Considerations Discovered
- Use `useLayoutEffect` for timing, not `useEffect` (fires synchronously after DOM mutations)
- Use `event.timeStamp` for input latency, not `performance.now()` at handler entry
- Memory measurements unreliable - use for trend detection only
- Add cooldown between benchmark iterations to allow GC

---

## Overview

Create a dedicated test environment under `/dev/table-perf` for investigating table performance issues in the Plate editor. This environment will allow configuring table dimensions, running benchmarks, and generating detailed performance reports. **No fix code will be written** - only the test infrastructure and reporting.

## Problem Statement

The table plugin (`@platejs/table`) has potential performance bottlenecks identified in code review:

1. **`useSelectedCells.ts:45`** - `JSON.stringify` comparison O(n) on every selection change
2. **`useIsCellSelected.ts:10`** - `includes()` O(n) array scan per cell render
3. **`computeCellIndices.ts:50-91`** - Nested loops O(rows * cols)
4. **`useTableCellElement.ts:35-42`** - Effect with `.some()` O(n) per element change
5. **No `React.memo`** on TableElement, TableRowElement, TableCellElement
6. **No virtualization** - all cells render regardless of visibility

No existing benchmarks or performance tests exist to quantify these issues.

## Proposed Solution

Build a minimal test environment with:
- Configurable table generator (rows, columns)
- Performance metrics capture (render times, interaction latencies)
- Real-time metrics display
- Console-based reporting (no export needed initially)

---

## Technical Approach

### Research Insights: Architecture

**Simplified File Structure** (per architecture review):
```
apps/www/src/app/dev/table-perf/
  page.tsx              # Single file with all UI inline
```

**Rationale**: The existing `/dev` directory uses flat structure. Creating nested `lib/` and `components/` folders contradicts project patterns. All logic can be inline for a dev tool.

### Research Insights: Performance Measurement

**React Profiler Integration** (from React docs):
```tsx
import { Profiler, ProfilerOnRenderCallback } from 'react';

const onRender: ProfilerOnRenderCallback = (
  id,              // Profiler tree identifier
  phase,           // "mount" | "update" | "nested-update"
  actualDuration,  // Time spent rendering (ms)
  baseDuration,    // Estimated time without memoization
  startTime,       // When React began rendering
  commitTime       // When React committed the update
) => {
  // Log or aggregate metrics
  console.log(`${id} (${phase}): ${actualDuration.toFixed(2)}ms`);
};

// Wrap table in Profiler
<Profiler id="TableElement" onRender={onRender}>
  <TableElement {...props} />
</Profiler>
```

**Key Insight**: Compare `actualDuration` vs `baseDuration` to assess memoization effectiveness.

### Research Insights: Timing Best Practices

**Use `useLayoutEffect` for timing** (from race condition review):
```tsx
// WRONG: useEffect fires asynchronously after paint
useEffect(() => {
  const end = performance.now(); // Variable delay
}, []);

// CORRECT: useLayoutEffect fires synchronously after DOM mutations
useLayoutEffect(() => {
  const end = performance.now(); // Deterministic timing
}, []);
```

**Use `event.timeStamp` for input latency**:
```tsx
// WRONG: Handler entry time
const handleClick = () => {
  const start = performance.now(); // Milliseconds may have passed
};

// CORRECT: Browser knows actual event time
element.addEventListener('click', (event) => {
  const inputTime = event.timeStamp; // Actual event occurrence
  const handlerTime = performance.now();
  const latency = handlerTime - inputTime;
}, { capture: true });
```

### Route Structure

**Path:** `/dev/table-perf`

**Single File Implementation:**
```tsx
// apps/www/src/app/dev/table-perf/page.tsx
'use client';

import { Profiler, useState, useLayoutEffect, useRef } from 'react';
import { usePlateEditor, Plate, PlateContent } from 'platejs/react';
import { TablePlugin } from '@platejs/table/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Types
interface TableConfig {
  rows: number;
  cols: number;
}

interface Metrics {
  initialRender: number | null;
  renderCount: number;
  lastRenderDuration: number | null;
}

// Table generator
function generateTableValue(config: TableConfig): TTableElement {
  // Implementation inline
}

// Main page
export default function TablePerfPage() {
  const [config, setConfig] = useState<TableConfig>({ rows: 10, cols: 10 });
  const [metrics, setMetrics] = useState<Metrics>({...});
  // ... rest of implementation
}
```

### Metrics to Capture

| Metric | Description | How Measured |
|--------|-------------|--------------|
| Initial Render | Time from mount to paint | React Profiler `actualDuration` on mount phase |
| Re-render Duration | Time for update renders | React Profiler `actualDuration` on update phase |
| Re-render Count | Number of component re-renders | Counter in Profiler callback |
| Cell Click Latency | Time from click to response | `event.timeStamp` to `useLayoutEffect` |
| Selection Latency | Time for multi-cell selection | Same as cell click |

### Research Insights: Removed Metrics

**Memory measurements removed** (per race condition review):
- `performance.memory` is Chrome-only, non-standard
- Updates infrequently, reflects unrelated allocations
- Use Chrome DevTools Memory tab for manual profiling instead

**Frame rate measurement simplified**:
- Use Chrome DevTools Performance tab
- No need for custom FPS counter in initial version

### Table Generation

```typescript
import type { TTableElement, TTableRowElement, TTableCellElement } from 'platejs';

function generateTableValue(rows: number, cols: number): TTableElement {
  const children: TTableRowElement[] = Array.from({ length: rows }, (_, rowIndex) => ({
    type: 'tr',
    children: Array.from({ length: cols }, (_, colIndex): TTableCellElement => ({
      type: 'td',
      id: `cell-${rowIndex}-${colIndex}`,
      children: [{ type: 'p', children: [{ text: `R${rowIndex}C${colIndex}` }] }],
    })),
  }));

  return {
    type: 'table',
    colSizes: Array.from({ length: cols }, () => 100),
    children,
  };
}
```

### Presets (Revised for O(n²) Analysis)

**Research insight**: Use square tables with 2x scaling factor to reveal O(n²) patterns.

| Preset | Rows | Cols | Cells | Purpose |
|--------|------|------|-------|---------|
| Small | 10 | 10 | 100 | Baseline |
| Medium | 20 | 20 | 400 | 4x cells |
| Large | 40 | 40 | 1,600 | 16x cells |
| XLarge | 60 | 60 | 3,600 | 36x cells |

**Analysis**: If render time scales linearly with cell count, behavior is O(n). If it grows faster (e.g., 4x cells = 16x time), indicates O(n²).

### Benchmark Methodology (Enhanced)

**Research insight**: Increase iterations, add cooldown, use percentiles.

1. **Warm-up**: 5 runs discarded (allow V8 JIT optimization)
2. **Iterations**: 20 measured runs
3. **Cooldown**: 100ms between iterations (allow GC)
4. **Statistics**: Mean, median, P95, P99, min, max, std dev
5. **Outlier removal**: Discard top/bottom 10%
6. **Isolation**: Fresh editor instance per benchmark suite

```typescript
interface BenchmarkResult {
  mean: number;
  median: number;
  p95: number;
  p99: number;
  min: number;
  max: number;
  stdDev: number;
}

function calculateStats(samples: number[]): BenchmarkResult {
  const sorted = [...samples].sort((a, b) => a - b);
  const n = sorted.length;

  // Remove outliers (top/bottom 10%)
  const trimStart = Math.floor(n * 0.1);
  const trimEnd = Math.ceil(n * 0.9);
  const trimmed = sorted.slice(trimStart, trimEnd);

  const mean = trimmed.reduce((a, b) => a + b, 0) / trimmed.length;
  const median = trimmed[Math.floor(trimmed.length / 2)];
  const p95 = sorted[Math.floor(n * 0.95)];
  const p99 = sorted[Math.floor(n * 0.99)];

  const variance = trimmed.reduce((sum, x) => sum + (x - mean) ** 2, 0) / trimmed.length;
  const stdDev = Math.sqrt(variance);

  return { mean, median, p95, p99, min: sorted[0], max: sorted[n - 1], stdDev };
}
```

### Research Insights: Race Condition Mitigations

**State machine for benchmark iterations**:
```typescript
type BenchmarkState = 'idle' | 'running' | 'cleanup' | 'cooldown';

async function runBenchmarkSuite(iterations: number, runFn: () => Promise<number>) {
  let state: BenchmarkState = 'idle';
  const results: number[] = [];

  for (let i = 0; i < iterations; i++) {
    state = 'running';
    const duration = await runFn();
    results.push(duration);

    state = 'cleanup';
    // Allow any pending effects to settle

    state = 'cooldown';
    await new Promise(resolve => setTimeout(resolve, 100)); // GC opportunity

    state = 'idle';
  }

  return results;
}
```

**Double-rAF for paint confirmation**:
```typescript
function waitForPaint(): Promise<number> {
  return new Promise(resolve => {
    requestAnimationFrame(() => {
      // First rAF: we're in the frame
      requestAnimationFrame(() => {
        // Second rAF: previous frame painted
        resolve(performance.now());
      });
    });
  });
}
```

---

## Implementation (Simplified)

### Single Phase: Complete Implementation

**Tasks:**
- [ ] Create `apps/www/src/app/dev/table-perf/page.tsx`
- [ ] Implement table generator function inline
- [ ] Add configuration UI (rows/cols inputs, preset buttons)
- [ ] Wrap editor in React Profiler
- [ ] Display metrics in real-time
- [ ] Add "Run Benchmark" button with iteration support

**UI Structure:**
```
┌─────────────────────────────────────────┐
│ Table Performance Test                  │
├─────────────────────────────────────────┤
│ [10] x [10] cells                       │
│ [Small] [Medium] [Large] [XLarge]       │
│                                         │
│ [Generate] [Run Benchmark (20 iter)]    │
├─────────────────────────────────────────┤
│ Metrics                                 │
│ • Initial render: 45ms                  │
│ • Re-renders: 12                        │
│ • Avg render: 8.5ms                     │
│ • P95: 15ms                             │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ [Table renders here]                │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## Acceptance Criteria

### Functional Requirements
- [ ] Route `/dev/table-perf` accessible and renders
- [ ] Can configure table size via inputs
- [ ] Can select presets (Small, Medium, Large, XLarge)
- [ ] Table generates with correct dimensions
- [ ] Initial render time displayed via React Profiler
- [ ] Re-render count tracked
- [ ] "Run Benchmark" executes 20 iterations with stats

### Non-Functional Requirements
- [ ] Page loads without error
- [ ] XLarge preset (3600 cells) doesn't crash browser
- [ ] Metrics update after each interaction
- [ ] Console logs detailed benchmark results

---

## Dependencies

- Existing table components: `@platejs/table`, `table-node.tsx`
- UI components: `@/components/ui/button`, `@/components/ui/input`
- React Profiler (built-in)
- No external performance libraries needed

## References

### Internal Files
- `/packages/table/src/react/components/` - Hook implementations
- `/apps/www/src/registry/ui/table-node.tsx` - UI components
- `/apps/www/src/app/dev/page.tsx` - Existing dev page pattern

### Performance APIs
- [React Profiler](https://react.dev/reference/react/Profiler) - Component render timing
- [Performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance) - High-resolution timing
- [PerformanceObserver for Long Tasks](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver) - Detect >50ms blocking

### Research Sources
- React Profiler onRender callback documentation
- Performance testing best practices research
- Race condition analysis for frontend timing

---

## Open Questions (Resolved)

1. ~~Metrics to capture~~ → React Profiler actualDuration, re-render count
2. ~~Route path~~ → `/dev/table-perf`
3. ~~Table generation~~ → Inline function with deterministic IDs
4. ~~Size ranges~~ → Square tables: 10x10 to 60x60
5. ~~File structure~~ → Single page.tsx (per simplicity review)
6. ~~Benchmark methodology~~ → 20 iterations, 100ms cooldown, percentiles
7. ~~Memory measurement~~ → Removed (unreliable), use DevTools manually
