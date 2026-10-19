---
name: tanstack-virtual
description: Headless UI for virtualizing large element lists at 60FPS in TS/JS, React, Vue, Solid, Svelte, Lit & Angular.
---


## Overview

TanStack Virtual provides virtualization logic for rendering only visible items in large lists, grids, and tables. It calculates which items are in the viewport and positions them with absolute positioning, keeping DOM node count minimal regardless of dataset size.

**Package:** `@tanstack/react-virtual`
**Core:** `@tanstack/virtual-core` (framework-agnostic)

## Installation

```bash
npm install @tanstack/react-virtual
```

## Core Pattern

```tsx
import { useVirtualizer } from '@tanstack/react-virtual'

function VirtualList() {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: 10000,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35, // estimated row height in px
    overscan: 5,
  })

  return (
    <div ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            Row {virtualItem.index}
          </div>
        ))}
      </div>
    </div>
  )
}
```

## Virtualizer Options

### Required

| Option | Type | Description |
|--------|------|-------------|
| `count` | `number` | Total number of items |
| `getScrollElement` | `() => Element \| null` | Returns scroll container |
| `estimateSize` | `(index) => number` | Estimated item size (overestimate recommended) |

### Optional

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `overscan` | `number` | `1` | Extra items rendered beyond viewport |
| `horizontal` | `boolean` | `false` | Horizontal virtualization |
| `gap` | `number` | `0` | Gap between items (px) |
| `lanes` | `number` | `1` | Number of lanes (masonry/grid) |
| `paddingStart` | `number` | `0` | Padding before first item |
| `paddingEnd` | `number` | `0` | Padding after last item |
| `scrollPaddingStart` | `number` | `0` | Offset for scrollTo positioning |
| `scrollPaddingEnd` | `number` | `0` | Offset for scrollTo positioning |
| `initialOffset` | `number` | `0` | Starting scroll position |
| `initialRect` | `Rect` | - | Initial dimensions (SSR) |
| `enabled` | `boolean` | `true` | Enable/disable |
| `getItemKey` | `(index) => Key` | `(i) => i` | Stable key for items |
| `rangeExtractor` | `(range) => number[]` | default | Custom visible indices |
| `scrollToFn` | `(offset, options, instance) => void` | default | Custom scroll behavior |
| `measureElement` | `(el, entry, instance) => number` | default | Custom measurement |
| `onChange` | `(instance, sync) => void` | - | State change callback |
| `isScrollingResetDelay` | `number` | `150` | Delay before scroll complete |

## Virtualizer API

```typescript
// Get visible items
virtualizer.getVirtualItems(): VirtualItem[]

// Get total scrollable size
virtualizer.getTotalSize(): number

// Scroll to specific index
virtualizer.scrollToIndex(index, { align: 'start' | 'center' | 'end' | 'auto', behavior: 'auto' | 'smooth' })

// Scroll to offset
virtualizer.scrollToOffset(offset, options)

// Force recalculation
virtualizer.measure()
```

## VirtualItem Properties

```typescript
interface VirtualItem {
  key: Key           // Unique key
  index: number      // Index in source data
  start: number      // Pixel offset (use for transform)
  end: number        // End pixel offset
  size: number       // Item dimension
  lane: number       // Lane index (multi-column)
}
```

## Dynamic/Variable Heights

Use `measureElement` ref for items with unknown heights:

```tsx
const virtualizer = useVirtualizer({
  count: items.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 50, // overestimate
})

{virtualizer.getVirtualItems().map((virtualItem) => (
  <div
    key={virtualItem.key}
    data-index={virtualItem.index}  // REQUIRED for measurement
    ref={virtualizer.measureElement} // Attach for dynamic measurement
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      transform: `translateY(${virtualItem.start}px)`,
      // Do NOT set fixed height - let content determine it
    }}
  >
    {items[virtualItem.index].content}
  </div>
))}
```

## Horizontal Virtualization

```tsx
const virtualizer = useVirtualizer({
  count: columns.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 100,
  horizontal: true,
})

// Use width for container, translateX for positioning
<div style={{ width: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
  {virtualizer.getVirtualItems().map((item) => (
    <div style={{
      position: 'absolute',
      height: '100%',
      width: `${item.size}px`,
      transform: `translateX(${item.start}px)`,
    }}>
      Column {item.index}
    </div>
  ))}
</div>
```

## Grid Virtualization (Two Virtualizers)

```tsx
function VirtualGrid() {
  const parentRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: 10000,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35,
    overscan: 5,
  })

  const columnVirtualizer = useVirtualizer({
    count: 10000,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    horizontal: true,
    overscan: 5,
  })

  return (
    <div ref={parentRef} style={{ height: '500px', width: '500px', overflow: 'auto' }}>
      <div style={{
        height: `${rowVirtualizer.getTotalSize()}px`,
        width: `${columnVirtualizer.getTotalSize()}px`,
        position: 'relative',
      }}>
        {rowVirtualizer.getVirtualItems().map((virtualRow) => (
          <Fragment key={virtualRow.key}>
            {columnVirtualizer.getVirtualItems().map((virtualColumn) => (
              <div
                key={virtualColumn.key}
                style={{
                  position: 'absolute',
                  width: `${virtualColumn.size}px`,
                  height: `${virtualRow.size}px`,
                  transform: `translateX(${virtualColumn.start}px) translateY(${virtualRow.start}px)`,
                }}
              >
                Cell {virtualRow.index},{virtualColumn.index}
              </div>
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  )
}
```

## Window Scrolling

```tsx
import { useWindowVirtualizer } from '@tanstack/react-virtual'

function WindowList() {
  const listRef = useRef<HTMLDivElement>(null)

  const virtualizer = useWindowVirtualizer({
    count: 10000,
    estimateSize: () => 45,
    overscan: 5,
    scrollMargin: listRef.current?.offsetTop ?? 0,
  })

  return (
    <div ref={listRef}>
      <div style={{
        height: `${virtualizer.getTotalSize()}px`,
        position: 'relative',
      }}>
        {virtualizer.getVirtualItems().map((item) => (
          <div
            key={item.key}
            style={{
              position: 'absolute',
              height: `${item.size}px`,
              transform: `translateY(${item.start - virtualizer.options.scrollMargin}px)`,
            }}
          >
            Row {item.index}
          </div>
        ))}
      </div>
    </div>
  )
}
```

## Infinite Scrolling

```tsx
import { useVirtualizer } from '@tanstack/react-virtual'
import { useInfiniteQuery } from '@tanstack/react-query'

function InfiniteList() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['items'],
    queryFn: ({ pageParam = 0 }) => fetchItems(pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  const allItems = data?.pages.flatMap((page) => page.items) ?? []

  const virtualizer = useVirtualizer({
    count: hasNextPage ? allItems.length + 1 : allItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
    overscan: 5,
  })

  useEffect(() => {
    const items = virtualizer.getVirtualItems()
    const lastItem = items[items.length - 1]
    if (lastItem && lastItem.index >= allItems.length - 1 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [virtualizer.getVirtualItems(), hasNextPage, isFetchingNextPage, allItems.length])

  // Render virtual items, show loader row for last item if loading
}
```

## Sticky Items

```tsx
import { defaultRangeExtractor, Range } from '@tanstack/react-virtual'

const stickyIndexes = [0, 10, 20, 30] // Header indices

const virtualizer = useVirtualizer({
  count: 1000,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 50,
  rangeExtractor: useCallback((range: Range) => {
    const next = new Set([...stickyIndexes, ...defaultRangeExtractor(range)])
    return [...next].sort((a, b) => a - b)
  }, [stickyIndexes]),
})

// Render sticky items with position: sticky; top: 0; zIndex: 1
```

## Smooth Scrolling

```tsx
const virtualizer = useVirtualizer({
  scrollToFn: (offset, { behavior }, instance) => {
    if (behavior === 'smooth') {
      // Custom easing animation
      instance.scrollElement?.scrollTo({ top: offset, behavior: 'smooth' })
    } else {
      instance.scrollElement?.scrollTo({ top: offset })
    }
  },
})

// Usage
virtualizer.scrollToIndex(500, { align: 'center', behavior: 'smooth' })
```

## Best Practices

1. **Overestimate `estimateSize`** - prevents scroll jumps (items shrinking causes issues)
2. **Increase `overscan`** (3-5) to reduce blank flashing during fast scrolling
3. **Use `transform: translateY()`** over `top` for GPU-composited positioning
4. **Add `data-index` attribute** when using `measureElement` for dynamic sizing
5. **Don't set fixed height** on dynamically measured items
6. **Use `getItemKey`** for stable keys when items can reorder
7. **Use `gap` option** instead of margins (margins interfere with measurement)
8. **Use `paddingStart/End`** instead of CSS padding on the container
9. **Use `enabled: false`** to pause when the list is hidden
10. **Memoize callbacks** (`estimateSize`, `getItemKey`, `rangeExtractor`)
11. **Use `will-change: transform`** CSS on items for GPU acceleration

## Common Pitfalls

- Setting fixed height on dynamically measured items
- Using CSS margins instead of the `gap` option
- Forgetting `data-index` with `measureElement`
- Not providing `position: relative` on the inner container
- Underestimating `estimateSize` (causes scroll jumps)
- Setting `overscan` too low for fast scrolling (blank items)
- Forgetting to subtract `scrollMargin` from `translateY` in window scrolling
- Not memoizing the `estimateSize` function (causes re-renders)
