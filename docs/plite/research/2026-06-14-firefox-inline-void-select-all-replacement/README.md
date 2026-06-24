# Firefox Inline Void Select-All Replacement

Date: 2026-06-14
Owner: slate-auto / slate-research
Status: promoted-kept

## Question

What should Plite do when native select-all replacement spans markable inline
void mentions, and does the current Firefox crash look like an unsupported
browser lane or a Plite runtime/oracle gap?

## Scope

- Native select-all replacement over inline void mentions.
- Undo after replacing the full document with plain text.
- Atomic/inline selection mapping and input replacement invariants.
- Firefox-specific crash triage for the `mentions` route.

## Exclusions

- Pagination.
- Runtime patches copied from external editors.
- Raw mobile/device claims.
- Clipboard-only mention coverage; this packet is about replacement input.

## Local Evidence Gap

`playwright/integration/examples/mentions.test.ts` had a real route-level
quarantine: Chromium/WebKit passed `keyboard undo restores select-all
replacement content`, but Firefox crashed the route after native select-all
replacement. P158 captured the Firefox runtime `NotFoundError` and showed the
test was using `page.keyboard.insertText()`, which bypassed the actual keydown
ownership path. P159 switched the row to a real key press, routed expanded
inline/void replacement through model-owned keydown, removed the Firefox skip,
and proved the focused row across Chromium/Firefox/WebKit.

Existing inline-void research covered arrows, drag, clipboard, IME, and
decoration boundaries. It did not cover expanded replacement across inline
voids, so this artifact owns the narrower failure signature.

## Stop Rule

Stop after reading local Plite evidence plus exact source slices from
ProseMirror, CodeMirror, upstream Slate, and WPT. Promote only a Plite-native
diagnostic or fix owner; do not patch runtime from source snippets.

## Verdict

Promoted and kept a Plite-native diagnostic/fix packet; do not classify this as
browser unsupported.

- WPT treats expanded editing ranges across atomic/non-editable content as real
  replacement/deletion operations. The range is not supposed to collapse into
  only the atomic object.
- ProseMirror and CodeMirror both keep explicit atom/atomic-range rules around
  native selection import, selection export, pointer selection, and default
  DOM-change replacement.
- %%UPSTREAM_PLITE_CAP%%'s mention example wraps its markable inline void with
  `contentEditable={false}` and a nested non-editable element for IME/caret
  stability; Plite's example delegates void rendering to the current v2
  renderer and still crashes on the Firefox replacement row.
- The kept runtime fix is keyboard/native input ownership, not range import:
  expanded selections that span inline, void, or read-only model boundaries use
  model-owned keydown replacement before Firefox mutates DOM under React.

## Promotion

Promoted kept lead:

- `inline-void-expanded-replacement`: owner `plite-patch`, proof kind
  `mentions Firefox diagnostic + focused Playwright fix packet`, commands
  `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/mentions.test.ts --grep "keyboard undo restores select-all replacement content"`,
  `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/mentions.test.ts --project=firefox`,
  `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/mentions.test.ts --project=chromium --project=webkit`, and
  `bun check`.

Reopen condition:

- If physical Firefox typing over select-all inline voids regresses again,
  reopen the keyboard/native input ownership packet before declaring the route
  browser-unsupported.
