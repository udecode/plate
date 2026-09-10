# Event Delegation Budget

Use this when many repeated units attach pointer, hover, keyboard, drag, or
selection handlers.

## Rule

Delegate repeated handlers to a stable parent when possible. Use `data-*`
identity for hit targets when it avoids per-unit closures.

## Budget

- handler count per repeated unit
- total active handlers at target cohort
- hot handler allocations per render
- drag/resize event frequency
- pointer capture or passive listener policy

Treat 20+ handlers per repeated unit as a fire.

## Use Vercel For

- `client-event-listeners`
- `client-passive-event-listeners`
- `advanced-event-handler-refs`

This rule owns per-unit handler budgets and data-attribute hit routing.
