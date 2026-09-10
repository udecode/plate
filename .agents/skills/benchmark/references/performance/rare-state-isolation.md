# Rare State Isolation

Use this when every repeated unit carries state for comments, menus, hover
chrome, debug panels, selection tools, or context actions.

## Rule

The primary repeated unit should render primary content only. Rare UI state
mounts only when active.

## Check

- comments are indexed by location and rendered only where present
- menus/context panels mount on demand
- hover/focus tools do not add heavy props to every unit
- debug panels are outside hot unit props
- "has something here" booleans are split from heavy payload reads

## Reject

- one generic unit component carrying all product state
- repeated unit props containing comment payloads, menu state, hover state, and
  debug state for every row/block

Use Vercel `rerender-defer-reads`, `rerender-memo`, and `js-index-maps` for the
micro-rules. This rule owns the product-scale isolation requirement.
