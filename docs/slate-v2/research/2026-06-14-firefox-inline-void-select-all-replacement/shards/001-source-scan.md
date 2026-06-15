# Source Scan

Scope: Firefox select-all replacement over markable inline void mentions.

Status: promoted.

## Sources Sampled

- Slate v2 `mentions.test.ts` and `site/examples/ts/mentions.tsx`.
- ProseMirror selection import/export, DOM-change replacement, select-all, and
  inline-atom command range handling.
- CodeMirror atomic-range selection and DOM-change input handling.
- WPT non-collapsed input target ranges across atomic content.
- WPT select-all deletion through `contenteditable=false` boundaries.
- Upstream Slate mention rendering shape.

## Top Lead

Expanded replacement through inline atomic content is a real editor operation.
The current Firefox row should become a diagnostic/fix packet, not a permanent
browser-unsupported skip.

## Rejected Leads

- Do not copy ProseMirror or CodeMirror atom logic.
- Do not copy upstream Slate's mention wrapper until Slate v2 diagnostic proof
  shows rendering shape is the cause.
- Do not call the lane unsupported without a native Firefox probe proving there
  is no usable range or target range.

## Promotion

Next owner: `slate-patch`.

Packet: make the Firefox mentions select-all replacement row diagnosable, then
fix or keep-scoped from exact evidence. The diagnostic must record native
selection, beforeinput/input target ranges, model selection, operations, and the
React error signature before any runtime change is kept.
