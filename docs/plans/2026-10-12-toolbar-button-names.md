# Name icon-only toolbar buttons

Status: fixed, waiting on your commit
Page: https://claude.ai/artifact/LZaUQgneVc5bqNTdSdmjFb
Playbook: bug-fix

Screen readers and Playwright's `getByRole('button', { name })` found no name on most copied toolbar buttons. On `/blocks/link-demo`, 29 of the 38 fixed-toolbar buttons were icons with no `aria-label` and no text, Link included. `ToolbarButton` put its `tooltip` only inside a closed tooltip, so the text never reached the button. Now `ToolbarButton` uses a string `tooltip` as its name when the caller passes no `aria-label`. The two buttons that show a value, and the split buttons, get their own names.

## Demo

1. Start a www dev server from this checkout, for example `pnpm --filter www dev --port 3297`, and open `http://localhost:3297/blocks/link-demo`. In the browser's accessibility tree, every fixed-toolbar button has a name, such as "Link", "Bold (⌘+B)", "Turn into: Text", "Numbered list" and "Numbered list styles".
2. Make the window narrower than 1024px. The mode button hides its "Editing" text and keeps the name "Editing mode: Editing".
3. Run `PLAYWRIGHT_BASE_URL=http://localhost:3297 pnpm --filter www test:www-browser:chromium tests/browser/link-url-policy.spec.ts`. All 6 tests pass. The draft test clicks the toolbar's Link button by its role and name.

## Public API

A button whose label only repeated its tooltip drops the label, because the tooltip names it now.

```tsx before
// apps/www/src/registry/components/editor/history-toolbar-button.tsx
<ToolbarButton
  aria-label="Undo"
  {...props}
  aria-busy={pending !== null}
  disabled={!canUndo}
  onClick={undo}
  tooltip="Undo"
>
```

```tsx after
// apps/www/src/registry/components/editor/history-toolbar-button.tsx
<ToolbarButton
  {...props}
  aria-busy={pending !== null}
  disabled={!canUndo}
  onClick={undo}
  tooltip="Undo"
>
```

A button that shows a current value names its job and the value, as the WAI-ARIA toolbar example does with "Font: Sans-serif".

```tsx before
// apps/www/src/registry/components/editor/turn-into-toolbar-button.tsx
<ToolbarButton
  className="min-w-[125px]"
  disabled={readOnly || !hasSelection}
  pressed={open}
  tooltip="Turn into"
  isDropdown
>
```

```tsx after
// apps/www/src/registry/components/editor/turn-into-toolbar-button.tsx
<ToolbarButton
  aria-label={`Turn into: ${getTurnIntoLabel(leafValue)}`}
  className="min-w-[125px]"
  disabled={readOnly || !hasSelection}
  pressed={open}
  tooltip="Turn into"
  isDropdown
>
```

## Main changes

- `ToolbarButton` in `apps/www/src/registry/bases/radix/toolbar.tsx` and `apps/www/src/registry/bases/base/toolbar.tsx` sets `aria-label` from a string `tooltip` before it spreads props, so a caller's own `aria-label` still wins.
- The turn-into and mode buttons name themselves "Turn into: <block>" and "Editing mode: <mode>". The list and media split buttons name both halves, such as "Bulleted list" and "Bulleted list styles", or "Image" and "Image options".
- Nineteen `aria-label`s that repeated their tooltip are gone from the history, import, export, table, comment, more, emoji and table-cell toolbar buttons. "All comments" keeps its label, because its tooltip changes while a new comment is pending.
- No consumer passes a non-string `tooltip`. Four consumers pass an expression: comment, suggestion, font color and the table color menu. Each expression is a string.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| What a button that shows a value is called | What it does and what it shows, like "Turn into: Text" | Just the tooltip, like "Turn into", so a screen reader never says "Text" | tooltip names only | small |
| Extra labels that say what the tooltip says | Removed, and the buttons keep the same names | Left in | keep labels | detail |
| List and media buttons with an arrow half | Both halves get names now | Leave them unnamed for now | skip split names | small |
| How I checked the Base UI version | A quick test that renders both versions (look) | Install both versions in a fresh app and click through them in Chrome | run create-install | detail |
| Tooltips that are not plain text | Still allowed, but you add the name yourself | Only plain text tooltips | text tooltips only | detail |

## Close

What landed. `ToolbarButton` in both primitive families names itself from a string tooltip. The turn-into and mode buttons name their job and value. The list and media split buttons have names. Nineteen labels that repeated the tooltip are gone. A registry changelog entry, `2026-10-12-toolbar-button-names`, and the regenerated registry output come with it. Nothing is committed, and the change sits in the working tree on `next` for your commit.

Reversal. I first changed the mark toolbar spec to look for "Bold". That spec replaces the toolbar module with a stub, so its old "B" query was right, and I put it back.

Proof, all on the final bytes after the lint fix:

- Before the fix, a DOM read of `/blocks/link-demo` found 29 of 38 fixed-toolbar buttons with no `aria-label` and no text. After it, all 38 have a name.
- In Chromium, `link-url-policy.spec.ts` now clicks Link with `getByRole('button', { name: 'Link' })`. That case timed out before the fix. After it, the full spec passed 6 of 6, and the case passed 5 of 5 with `--repeat-each=5`. Both runs used a dev server that served source on port 3331.
- The new `toolbar.spec.tsx` case names an icon-only button in both Base and Radix. It fails at `HEAD` in a detached worktree and passes now.
- The 26 spec files that render the changed components match their runs from before the edit, apart from 2 new passing toolbar cases. `table-node-selection.spec.tsx` fails 3 cases before and after the edit, and fails the same way at `HEAD`.
- `build:registry --check`, the changelog `--check`, the registry source check and the lint on the task's files all pass.

Limits. A happy-dom unit test proves the Base UI toolbar, and no Chromium run does, because the site renders only Radix. The www `typecheck` script stops at its first step, `editor:check`, on generated plugin files that other work changed. Its `tsc` step, run alone, shows 9 errors, all in `import-toolbar-button.spec.tsx`, and `HEAD` has the same 9. I inferred from its hidden text that the mode button had no name at narrow widths before the fix, and did not observe it.
