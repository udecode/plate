# OSS Rich HTML Paste Clipboard Invariants

Date: 2026-06-13

## Question

Which rich HTML paste and clipboard invariants from Lexical, ProseMirror,
Tiptap, CKEditor, and TinyMCE expose missing Slate v2 proof?

## Scope

- Inspect local OSS source, not issue-title summaries.
- Keep only portable editor invariants.
- Map each kept lead to current Slate v2 proof, a deferred owner, or a reject
  reason.
- Do not copy runtime code from external editors.

## Verdict

Keep this packet as research and proof routing.

Most portable leads are already covered by Slate v2 browser/package proof:

- inline paste around link boundaries,
- ProseMirror slice metadata stripping,
- ProseMirror table row slice import,
- sanitizer coverage,
- same-runtime child-root text paste and synthetic HTML drop isolation.

One attempted browser oracle was reverted:

- rich HTML clipboard paste into the same-runtime editable-void child root
  inserted text but did not preserve the `<strong>` mark;
- the route renders rich marks from its model but does not own the dedicated
  rich HTML deserializer used by the `paste-html` example;
- keeping the test would make an API/design decision implicitly, so the lead is
  deferred to `slate-plan` / paste API ownership instead of being forced into
  the current regression suite.

## Proof

Focused current-coverage reads:

- `.tmp/slate-v2/playwright/integration/examples/inlines.test.ts` covers
  inline paste outside and inside link boundaries.
- `.tmp/slate-v2/playwright/integration/examples/paste-html.test.ts` covers
  sanitizer rows, ProseMirror text/list/table slice metadata, and table row
  import.
- `.tmp/slate-v2/playwright/integration/examples/editable-voids.test.ts`
  covers native input paste, child-root text paste isolation, child-root HTML
  drop isolation, and parent/child selection boundaries.
- `.tmp/slate-v2/playwright/integration/examples/pagination.test.ts` covers
  copying a selection across table rows split by a page boundary.

Failed and reverted experiment:

```bash
PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/editable-voids.test.ts --project=chromium --project=firefox --project=webkit --grep "pastes rich HTML inside same-runtime child root"
```

Result: 3 failed because the text pasted into the child root but no `strong`
element appeared. The runtime did not crash, focus did not leak, and the outer
editor stayed isolated. This is a deferred parser/API question, not a safe
current-regression patch.

## Decision

- Keep existing Slate proof for inline link paste, ProseMirror slice handling,
  sanitizer behavior, table slice import, and child-root ownership isolation.
- Defer child-root rich HTML mark preservation to a paste API/plan owner.
- Reject product/plugin-specific autolink-on-paste behavior for Slate core.
- Keep ProseMirror table rectangle algebra as table-fragment semantics, not a
  generic clipboard runtime patch.

