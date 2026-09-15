# Initial Render Readiness

Use this when startup, hydration, hidden or detached roots, full-document
replacement, or explicit DOM omission is part of the plan.

## Rule

Define readiness from the component's public DOM contract. A complete component
is ready only when every intended block is mounted. A component that explicitly
omits DOM is ready when its deterministic initial window and every selected or
requested target are mounted.

## Gate

- server and first-client markup use the same initial-window rule;
- hidden, zero-size and detached roots do not produce an empty or unbounded
  fallback;
- the first input target is mounted before editing;
- deep selection and navigation targets remain reachable;
- ready timing, mounted block count and stale DOM count are recorded;
- the result names its native surface as complete or mounted-window only.

Do not report a virtualized surface as eventually complete. Its omitted DOM is
the public behavior, not pending background work.
