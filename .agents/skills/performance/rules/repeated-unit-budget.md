# Repeated Unit Budget

Use this for blocks, lines, leaves, rows, decorations, shell islands, groups, or
other repeated editor units.

## Rule

Budget the hot repeated unit before optimizing globally.

Track:

| Budget | Ask |
| --- | --- |
| DOM nodes per unit | How many nodes before decorations/overlays? |
| React components per unit | How many instances in the common case? |
| event handlers per unit | Are handlers delegated or attached per unit? |
| effects per unit | Are effects banned from wrappers and repeated rows? |
| subscriptions per unit | Does each unit subscribe narrowly by runtime id/range? |
| selectors per unit | Are selectors O(1), stable, and dirtiness-aware? |
| allocations per interaction | Does typing/select/copy allocate proportional to document size? |
| style/layout cost | Any forced reflow, layout read, or heavy selector? |
| React scheduler/effect cost | Does this unit render, mount effects, or block urgent work? |

## Policy

Tiny removals compound. Removing two DOM nodes per unit is 20k fewer nodes at
10k units.

Use Vercel rules for micro-tactics:

- `rerender-*`
- `rendering-*`
- `js-*`

This rule owns the budget table and release gate.
