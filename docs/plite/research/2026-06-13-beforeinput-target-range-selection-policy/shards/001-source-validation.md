# Shard 001: Source Validation

## Scope

Validate P155's policy split: explicit beforeinput target ranges may import selection even when live DOM selection import is model-policy gated.

## Sources Sampled

- `../codemirror-view/src/domobserver.ts`
- `../codemirror-view/src/input.ts`
- `../lexical/packages/lexical/src/LexicalEvents.ts`
- `../lexical/packages/lexical/src/LexicalSelection.ts`
- `../lexical/packages/shared/src/environment.ts`
- Narrow no-hit scans over `../prosemirror` and `../tiptap`

## Top Leads

- `beforeinput-target-range:event-owned-selection-import`: keep P155. Lexical and CodeMirror both treat target ranges as explicit event data that can map to editor selection/document ranges.
- `beforeinput-target-range:shadow-selection-access`: support only. CodeMirror's shadow-root range access reinforces target ranges as distinct from ordinary live selection.

## Rejected Leads

- ProseMirror direct target-range handling: no direct local source hit.
- Tiptap direct target-range handling: no direct local source hit.

## Duplicate Leads

- None.

## Score Changes

- `beforeinput-target-range:event-owned-selection-import`: A evidence; impact 2, novelty 2, applicability 3, proofability 3, risk 1. Score 9. Already promoted and kept as P155.

## Next Query

None for this packet. Reopen only if a future target-range failure appears in Firefox/WebKit, IME, or shadow-root routes.
