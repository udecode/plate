# Debug TOC Demo Navigation

## Goal
Fix `http://localhost:3002/blocks/toc-demo` so TOC clicks navigate to the target heading and the target flash is visible.

## Phases
- [x] Reproduce on `/blocks/toc-demo` and confirm the failure shape.
- [ ] Check existing learnings and relevant route/component patterns.
- [ ] Isolate whether the bug lives in the blocks demo wrapper, generated registry payload, or TOC runtime.
- [ ] Implement the minimal durable fix.
- [ ] Verify with tests, lint, registry rebuild if needed, and browser proof on `/blocks/toc-demo`.

## Notes
- Browser repro already shows all TOC rows incorrectly render `aria-current=true` on `/blocks/toc-demo`.
- Clicking a TOC row on that route does not scroll and does not set nav highlight.
- Avoid broad `www` build unless absolutely needed.
