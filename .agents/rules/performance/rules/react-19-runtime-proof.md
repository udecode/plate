# React 19 Runtime Proof

Use this when React 19.2 primitives are proposed as part of a perf lane.

## Activity

Use `Activity` for hidden/background UI panels, inspectors, preview panes, or
likely-next views where hidden mode can unmount effects and defer updates.

Do not treat `Activity hidden` as a Slate hidden editable content primitive. It
does not solve browser find, native selection, IME, copy/paste, screen-reader,
or DOM point mapping.

## Transitions And Deferred Work

Use transitions/deferred values for overlays, search results, sidebars,
background summaries, and non-urgent projections.

Keep visible typing, DOM text sync, selection import/export, caret repair, and
IME urgent.

## Effect Events

Use `useEffectEvent` only for event-like callbacks fired from effects or
external subscriptions. Do not use it to silence dependency warnings.

## Performance Tracks

Capture React Performance Tracks when React work breadth is suspicious:

- Scheduler priority
- blocking vs transition work
- component render/mount
- effect cost
- blocked/yielded work

React tracks prove React work breadth. They do not prove editor dirtiness,
selection mapping, or native behavior correctness.

## Server APIs

`cacheSignal` and partial pre-rendering are page-shell/server tools. They are
usually irrelevant to the editor body hot path.
