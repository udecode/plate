# Stop DOM range lookups from landing in old text

Status: superseded by 2026-10-19-plite-owed-text-paint.md after panel round 2
Playbook: bug-fix

## Brief

### What will change?

A component that reads the editor's text and asks for a DOM range right after an edit now gets `null` until the page shows the new text. Before, it got a range that pointed one edit behind.

### What could go wrong?

Code that resolves a range in that window and expects a value now gets `null`, which the API docs already allow for a point that is not currently mappable. Typing, IME composition and the other browser examples behave as before.

## Teach

Plite paints most text by writing the new characters straight into the page while it publishes an edit. A plain paragraph instead uses a "text flow" painter that patches only what changed. That painter patches after React commits, sometimes a microtask later. Components that read the text run before it.

One such component asked for a DOM range at offset 3 right after `x` went in at offset 2 of `draft`. Plite counted 3 characters into the old `draft`, so the range landed after `a` instead of after `x`.

The text flow painter keeps a record of the text it last painted. Range lookups now compare that record with the editor's text and return `null` while they differ. Once the painter catches up, the same lookup returns the right range.

A first attempt made the painter paint at once instead. Review showed three cases it could not reach: composition, a paragraph emptied to nothing, and selectors that run during the editor's own notification.

## Main changes

- `resolveDOMPointInRoot` in `packages/plitejs/src/dom/plugin/dom-editor.ts` returns `null` for a text point when the text flow record of that text holds different text than the model. `resolveDOMRange` and `resolveDOMPoint` both go through it.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Where the fix lives | Range lookups return `null` while the painted text lags | The text flow painter paints at once | eager paint | big |
| What counts as lagging | The text flow's painted record differs from the model | Also compare the page text of plain leaves | check plain leaves | small |

## Verification

- `packages/plitejs/test/react/editable-text-flow-react-commit-contract.test.tsx` fails at base with a range ending after `dra` and passes after the fix. Its second case checks that the same lookup returns the range after `drx` once the page catches up.
- Composition in the same and in another paragraph, deleting all text, and a selector running during notification each returned a stale range at base and return `null` after the fix.
- The plitejs react suite passes apart from the kernel authority audit case, which fails the same way at base and belongs to suggested task t_c1908482.
- Chromium example specs pass, richtext IME composition included.

## Open work

- The kernel authority audit case stays red at base. owner: suggested task t_c1908482. stop: that task lands or is dropped.
