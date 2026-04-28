---
title: Slate v2 destructive leaf-boundary deletion should own leaf cleanup before render
type: decision
status: accepted
updated: 2026-04-25
source_refs:
  - docs/plans/2026-04-25-slate-v2-leaf-lifecycle-dom-shape-conformance-plan.md
  - docs/research/decisions/slate-v2-read-update-runtime-architecture.md
  - docs/research/decisions/slate-v2-editing-epoch-legacy-timing-recovery-audit.md
legacy_refs:
  - ../slate/packages/slate/src/transforms-text/delete-text.ts
  - ../slate/packages/slate-react/src/components/string.tsx
  - ../slate/packages/slate-react/src/components/leaf.tsx
  - ../slate/packages/slate-dom/src/plugin/dom-editor.ts
  - ../slate/packages/slate-dom/src/plugin/with-dom.ts
v2_refs:
  - ../slate-v2/packages/slate/src/core/leaf-lifecycle.ts
  - ../slate-v2/packages/slate/test/leaf-lifecycle-contract.ts
  - ../slate-v2/packages/slate/test/selection-rebase-contract.ts
  - ../slate-v2/packages/slate-react/test/rendered-dom-shape-contract.tsx
  - ../slate-v2/packages/slate-browser/src/playwright/index.ts
  - ../slate-v2/playwright/integration/examples/richtext.test.ts
  - ../slate-v2/playwright/integration/examples/inlines.test.ts
---

# Slate v2 destructive leaf-boundary deletion should own leaf cleanup before render

## Decision

Slate v2 copies legacy Slate's user-visible editing contract for destructive
leaf-boundary deletes, but intentionally does not copy legacy's committed empty
leaf tolerance.

The v2 invariant is stricter:

```txt
destructive edit
  -> transaction
  -> remove or classify empty leaves
  -> rebase selection to a surviving valid point
  -> commit
  -> render without fake visual lines
  -> slate-browser asserts visible DOM shape
```

Legacy Slate keeps more empty-leaf shapes alive and makes them renderable through
zero-width sentinels. That is a useful compatibility lesson, not the v2
architecture target.

## Legacy Contract To Keep

Legacy Slate proves these durable behaviors:

- Destructive text deletion is model-owned in `delete-text.ts`; browser DOM
  mutation is not the final source of document truth.
- Zero-width render nodes are legitimate for empty blocks, inline/void spacing,
  mark placeholders, and selection addressability.
- DOM point mapping must understand `data-slate-string`,
  `data-slate-zero-width`, mark placeholders, void spacers, non-editable
  content, Android IME quirks, and Firefox newline quirks.
- Clipboard serialization must strip zero-width sentinels or convert newline
  placeholders to plain newline text.
- Inline and void boundaries need invisible spacer structure so selection can
  land around non-text content.

V2 keeps those as compatibility constraints.

## Legacy Behavior To Improve

Legacy render code treats any empty leaf in a non-empty parent as a zero-width
selection target. That is correct for inline spacers and mark placeholders, but
too permissive after destructive deletion.

V2 hardens the contract:

- Empty block anchors may render a line-break placeholder.
- Required inline spacers may survive.
- Mark placeholders may render a non-line-breaking sentinel.
- Removable empty marked/code/decorated leaves are not committed render truth.
- A non-empty paragraph must not accumulate empty leaves that render `<br>` and
  create fake visual lines.

This is an intentional improvement, not a legacy regression.

## Parity Rows

| Row | Legacy behavior | V2 behavior | Classification | Required proof |
| --- | --- | --- | --- | --- |
| Richtext repeated word delete through `<textarea>!` | Delete keeps model text coherent; empty leaves may still be renderable as zero-width sentinels. | Invalid empty code/plain suffix leaves are removed before render; first block DOM text matches model text; follow-up typing works. | Improved | `richtext.test.ts` row `keeps rendered DOM shape after repeated leaf-boundary word-delete`. |
| Backward delete over an empty marked/code suffix leaf | Selection mapping can tolerate zero-width leaves. | Core cleanup removes removable empty leaves and rebases selection to the previous surviving same-block point. | Improved | `leaf-lifecycle-contract.ts`; `selection-rebase-contract.ts`. |
| Forward Delete before trailing punctuation | Legacy can preserve an addressable zero-width suffix or move through DOM mapping. | Selection rebases to the previous surviving same-block point instead of jumping to the next paragraph or staying in a removed suffix leaf. | Improved | `selection-rebase-contract.ts`; `richtext.test.ts` row `keeps caret editable after browser Delete before trailing punctuation`. |
| Range delete across selected text | Delete produces the expected text and keeps the editor typeable. | Same user-visible behavior, plus DOM selection, follow-up typing, and rendered shape assertions. | Copied and hardened | Richtext selected-range destructive rows. |
| Mark boundary delete | Zero-width mark placeholders can preserve composition/mark behavior. | Mark placeholders stay non-line-breaking; removable empty marked leaves do not survive as visual line breaks. | Improved | `rendered-dom-shape-contract.tsx`; generated richtext destructive gauntlet. |
| Code leaf delete | Code leaf rendering can wrap a zero-width string. | Empty code leaf artifacts inside non-empty blocks are cleaned or rendered without fake `<br>` line boxes. | Improved | `leaf-lifecycle-contract.ts`; richtext DOM-shape row. |
| Inline boundary delete/cut | Invisible spacer leaves around inline content are required. | Required inline spacers survive; generated inline cut typing gauntlet proves no unexpected zero-width line breaks. | Copied and hardened | `inlines.test.ts` generated inline cut typing gauntlet. |
| Void inline boundary | Legacy uses a separate invisible spacer around non-editable void content. | V2 keeps the spacer classification rule; raw void/mobile depth remains a separately scoped proof lane. | Copied, scoped | Existing inline/void spacer contracts plus future raw-device proof. |
| Decorated/highlighted text delete | Legacy has leaf splitting and DOM selection mapping for render-only wrappers. | V2 treats decorations/projections as render shape, not committed empty-leaf permission; generated rows assert visible DOM shape where rows exist. | Improved | Highlighted text destructive browser rows plus slate-browser DOM-shape assertions. |
| Empty block after repeated delete | One editable empty text anchor renders a line-break placeholder. | Same invariant is explicit: empty blocks may render one placeholder `<br>`. | Copied | `rendered-dom-shape-contract.tsx` empty-block row. |
| Clipboard/cut after zero-width leaves | Serialized DOM strips zero-width implementation detail. | Browser helpers and generated cut rows assert selected text/DOM shape without leaking fake line breaks. | Copied and hardened | `slate-browser` selected text helpers; inline cut typing gauntlet. |
| Legacy plugin monkeypatching around delete | Examples/plugins may override instance methods and read `editor.selection`. | Not copied. V2 requires `editor.update`, primitive editor methods, extension middleware/methods, and live selection reads. | Rejected | Public API hard-cut guards from the read/update runtime plan. |

## Release Claim Boundary

The local release claim is browser-engine proof, not raw-device proof.

Covered:

- Chromium, Firefox, WebKit, and mobile viewport rows where the transport is
  available.
- Model tree/text.
- Model selection.
- Visible DOM text.
- Rendered block text/textContent.
- Zero-width count and unexpected zero-width `<br>` rejection.
- DOM selection still inside the editor.
- Follow-up typing after destructive cleanup.

Not covered by this parity artifact:

- Real Android/iOS native keyboard, clipboard, and IME device-lab proof.
- Every custom renderer in userland.
- Every possible decoration/projection split shape.

Those are release-scope boundaries, not excuses to let the richtext regression
back in.

## Evidence Commands

Current accepted proof for this decision:

```bash
bun test ./packages/slate/test/leaf-lifecycle-contract.ts ./packages/slate/test/selection-rebase-contract.ts ./packages/slate/test/transaction-target-runtime-contract.ts ./packages/slate/test/commit-metadata-contract.ts --bail 1
bun test ./packages/slate-react/test/rendered-dom-shape-contract.tsx ./packages/slate-react/test/primitives-contract.tsx ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun run --cwd packages/slate-browser test:core --bail 1
PLAYWRIGHT_BASE_URL=http://localhost:3100 bunx playwright test ./playwright/integration/examples/richtext.test.ts ./playwright/integration/examples/highlighted-text.test.ts ./playwright/integration/examples/inlines.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "destructive|leaf|zero-width|DOM shape|Backspace|Delete|word-delete|generated inline cut|generated mixed" --workers=4 --retries=0
bunx turbo build --filter=./packages/slate --filter=./packages/slate-browser --filter=./packages/slate-react --filter=./packages/slate-dom --force
bunx turbo typecheck --filter=./packages/slate --filter=./packages/slate-browser --filter=./packages/slate-react --filter=./packages/slate-dom --force
bun run lint:fix
bun run lint
```

The broad destructive browser grep passed 64 rows across Chromium, Firefox,
WebKit, and mobile viewport after the same-block forward-delete rebase fix.

## Architecture Rule

Do not fix this class in React alone.

React rendering may defend against a bad shape, but the authoritative fix is:

- core classifies empty text leaves
- destructive edits remove/merge invalid leaves
- selection rebases before deleted paths die
- commit metadata carries the cleanup/rebase shape
- React maps valid model leaf classes to DOM shape
- slate-browser asserts visible DOM shape as a release gate

If a future row needs a zero-width `<br>` in a non-empty block, it must name the
model class that makes the line break valid. Otherwise it is garbage.
