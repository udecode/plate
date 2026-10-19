# Editors Preview Frame Polish

Date: 2026-05-30

Scope: smart-merge shadcn `/blocks` preview-frame polish into Plate `/editors`.

## Decision

Pull:

- Radial dotted preview background.
- Soft backing layer behind the resizable preview panel.
- Upstream-style overflow-hidden rounded preview frame.
- Upstream resizer handle breakpoint and framing classes.

Preserve:

- Plate `/editors` route and editor demo content.
- Plate iframe/source/install behavior.
- Plate Pro/Get the code behavior.
- No v0 action.
- No upstream mobile static image fallback.

## Implementation Result

- Updated `apps/www/src/components/block-viewer.tsx` `BlockViewerView` only.
- Kept the existing page-level `section-soft` shell because Plate already matches upstream there.
- Did not change registry data, code loading, toolbar commands, or block content.

## Visual Evidence

- `screenshots/plate-editors-preview-frame.png`
- `screenshots/shadcn-blocks-preview-frame.png`

## Verification

- `pnpm --filter www exec eslint src/components/block-viewer.tsx --fix`
- `pnpm --filter www typecheck`
- Browser proof at `http://localhost:3002/editors`:
  - radial dotted background present
  - soft resizable-panel backing layer present
  - preview iframe present at `/view/editor-ai`
  - preview panel overflow is hidden
  - v0 action absent
  - no horizontal overflow at 1175px viewport

Note: browser proof reported an existing external Potion iframe `X-Frame-Options`
warning. That warning is unrelated to this frame-class change.

## Baseline

This is a scoped partial sync. It does not advance `lastSyncedCommit`.
