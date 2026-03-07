# perf: Table 20x20 Performance Optimization

## Enhancement Summary

**Deepened on:** 2026-01-22
**Research agents used:** best-practices-researcher, code-simplicity-reviewer, performance-oracle

### Key Improvements from Research
1. Simplified to minimal approach - remove sync effect first, measure, then decide
2. Use derived selector instead of dual state storage
3. Verified O(n²) -> O(n) improvement is achievable

---

## Overview

Clicking "Generate Table" on `/dev/table-perf` causes noticeable lag at 20x20 (400 cells). Root cause: O(n²) operations in table hooks where each cell performs O(n) array scans during render.

## Problem Statement

**Current behavior:** 20x20 table generation takes 2-3 seconds with visible UI freeze.

**Expected behavior:** Table generation should be < 100ms for 20x20.

**Root cause:** Multiple O(n) operations per cell render compound to O(n²):
- `useIsCellSelected`: `includes()` O(n) scan per cell
- `useTableCellElement`: `.some()` O(n) in useEffect ← **PRIMARY BOTTLENECK**

## Technical Approach (Simplified)

### Research Insight: Start Minimal

Per simplicity review: The sync effect in `useTableCellElement` causing cascading re-renders is the PRIMARY issue. Fix that first, measure, then add complexity only if needed.

### Step 1: Remove Sync Effect (High Impact)

**File:** `packages/table/src/react/components/TableCellElement/useTableCellElement.ts`

**Remove this effect entirely:**
```typescript
// Lines ~35-42 - REMOVE
React.useEffect(() => {
  if (selectedCells?.some((v) => v.id === element.id && element !== v)) {
    setOption('selectedCells', selectedCells.map(v => (v.id === element.id ? element : v)));
  }
}, [element, selectedCells, setOption]);
```

**Why safe to remove:** This effect syncs stale element references, but if we compare by ID (step 2), reference staleness doesn't matter.

### Step 2: Use ID Comparison in useIsCellSelected

**File:** `packages/table/src/react/hooks/useIsCellSelected.ts`

**Current:**
```typescript
return !!selectedCells?.includes(element);
```

**Proposed (still O(n) but simpler):**
```typescript
return !!selectedCells?.some(cell => cell.id === element.id);
```

**Or use derived Set for O(1):**
```typescript
const selectedCellIds = useTableStore().use.selectedCellIds();
return selectedCellIds?.has(element.id) ?? false;
```

### Step 3: Add Derived Selector (If Still Needed)

**File:** `packages/table/src/react/stores/tableStore.ts` or TablePlugin

Add a derived selector that computes Set on demand:
```typescript
.extendSelectors(({ getOptions }) => ({
  selectedCellIds: () => {
    const cells = getOptions().selectedCells;
    return cells ? new Set(cells.map(c => c.id)) : null;
  }
}))
```

**Research insight:** Use derived selector instead of storing dual state to avoid sync bugs.

## Implementation Tasks

### Phase 1: Minimal Fix
- [ ] Remove sync effect in `useTableCellElement.ts` (lines ~35-42)
- [ ] Change `useIsCellSelected` to compare by ID
- [ ] Run benchmark to measure improvement

### Phase 2: Add Set Selector (Only If Needed)
- [ ] Add `selectedCellIds` derived selector
- [ ] Update `useIsCellSelected` to use O(1) Set lookup
- [ ] Benchmark again

## Acceptance Criteria

### Functional Requirements
- [ ] 20x20 table generates in < 500ms (down from 2-3s)
- [ ] Cell selection still works
- [ ] Multi-cell selection via drag works
- [ ] Table merging still works

### Non-Functional Requirements
- [ ] No new dependencies
- [ ] Backwards compatible API
- [ ] Minimal code changes (YAGNI)

## Success Metrics

| Metric | Before | Target | Theoretical |
|--------|--------|--------|-------------|
| 20x20 initial render | ~2500ms | < 500ms | ~6ms |
| Complexity per cell | O(n) | O(1) | - |
| Total complexity | O(n²) | O(n) | ~400x improvement |

## Files to Modify

| File | Change | LOC |
|------|--------|-----|
| `packages/table/src/react/components/TableCellElement/useTableCellElement.ts` | Remove sync effect | -9 |
| `packages/table/src/react/hooks/useIsCellSelected.ts` | ID comparison | ~2 |

## References

- Plan: `plans/feat-table-performance-analysis.md`
- Test page: `apps/www/src/app/dev/table-perf/page.tsx`
- PR: #4825
