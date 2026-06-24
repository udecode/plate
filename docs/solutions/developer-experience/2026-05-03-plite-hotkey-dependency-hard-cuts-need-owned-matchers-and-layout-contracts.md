---
title: Plite hotkey dependency hard cuts need owned matchers and layout contracts
type: solution
date: 2026-05-03
status: completed
last_updated: 2026-05-04
category: developer-experience
module: plite plite-dom
problem_type: developer_experience
component: tooling
symptoms:
  - `is-hotkey` was unmaintained and still sat on Plite's browser keyboard runtime path
  - examples and docs imported `is-hotkey` directly instead of using a Plite-owned helper
  - prior local installs could corrupt the `is-hotkey` payload and break docs routes before Plite code ran
  - replacement risk included non-Latin keyboard layouts, remapped ASCII layouts, and AltGraph shortcuts
root_cause: missing_tooling
resolution_type: dependency_update
severity: high
tags:
  - plite
  - plite-dom
  - hotkeys
  - hard-cut
  - keyboard
  - dependencies
  - altgraph
  - layouts
---

# Plite hotkey dependency hard cuts need owned matchers and layout contracts

## Problem

Plite depended on `is-hotkey` for editor keyboard intent, but the dependency
was stale, externally shaped, and already had local install corruption history.
Cutting it safely required more than deleting the package.

## Symptoms

- `is-hotkey` and `@types/is-hotkey` were active deps.
- `site/examples/ts/*` files imported `is-hotkey` directly.
- Docs recommended `is-hotkey` for keyboard shortcuts.
- A prior local failure corrupted `node_modules/.bun/is-hotkey.../lib/index.js`
  and blocked docs routes before app code executed.
- A naive replacement could regress `Cmd+Z`, `Ctrl+Z`, `AltGraph`, non-Latin
  layouts, or remapped ASCII layouts.

## What Didn't Work

- Keeping `is-hotkey` with a patch. That kept a dead dependency on the runtime
  path and preserved the local install-corruption blast radius.
- Forking `is-hotkey`. That would keep old semantics and make Plite own a fork
  instead of owning the shortcut contract.
- Importing ProseMirror, Tiptap, or Lexical keymap code. Those APIs bring
  product-level command assumptions that do not belong in `plite-dom`.
- Relying only on default `bun check`. Some contract files and hard-cut proof
  rows need explicit path runs.
- Porting only Plite-specific tests. The upstream `is-hotkey` tests still had
  useful generic matcher cases for aliases, multiple specs, modifier-only
  keydown, exact modifiers, optional modifiers, and invalid grammar.

## Solution

Own the matcher in `plite-dom`, keep the public `Hotkeys` surface stable, and
expose one direct generic helper for examples:

```ts
import { Hotkeys, isHotkey } from 'plite-dom'

if (Hotkeys.isUndo(event)) {
  // Plite-owned undo intent
}

if (isHotkey('mod+b', event)) {
  // Example-level mark toggle
}
```

The matcher contract should be explicit:

- keep compiled matchers private for built-in `Hotkeys`
- cache direct `isHotkey(spec, event)` checks internally instead of exposing a
  public curried matcher factory
- support `mod`, `shift`, `alt`, `ctrl`, `cmd`, optional modifiers, and named
  keys
- support modifier-only keydown checks like `shift` and `meta`
- support multiple specs like `['meta+a', 'meta+s']`
- match `event.key` first
- fall back to `event.code === KeyX` only for non-ASCII letter layouts
- do not treat ASCII remapped layouts as the physical key
- block Ctrl+Alt matches when `getModifierState('AltGraph')` is true
- reject malformed modifier grammar like `ctrlalt+k`

The hard-cut sweep must cover manifests, source, examples, docs, and lockfiles:

```bash
rg -n "is-hotkey|@types/is-hotkey|isHotkey|isKeyHotkey" \
  package.json packages site docs bun.lock \
  --glob '!site/out/**' \
  --glob '!**/node_modules/**' \
  --glob '!**/dist/**'
```

Keep historical changelog mentions if they are truly historical. Cut active
imports, recommendations, package deps, and generated stale source only when the
repo owns that output.

## Why This Works

Keyboard intent is editor runtime behavior, not generic app sugar. Plite needs a
small, stable matcher that matches its own undo, redo, split, soft-break, and
delete policies without inheriting an unmaintained package's assumptions.

The key detail is layout policy. `event.key` preserves user-visible remapped
ASCII shortcuts. `event.code` fallback is useful only for non-ASCII letter
layouts where the browser reports a non-Latin key for a shortcut that the user
still expects to map to the physical Latin key. AltGraph must stay out of
Ctrl+Alt shortcut matching because many international keyboards use it for
normal character entry.

## Prevention

- Add red public-behavior tests before deleting the dependency.
- Include non-Latin, remapped ASCII, and AltGraph rows in the matcher tests.
- After deleting a dependency, read its upstream tests and backfill valuable
  public behavior rows. Do not blindly copy tests for implementation details or
  legacy browser fields Plite does not want to own.
- Run explicit path tests for hard cuts, not only default discovery.
- Browser-prove real examples that depend on the shortcut surface, including
  iframe routes when the examples use iframe-local editors.
- Run a dependency sweep after `bun install`, then treat generated output and
  historical changelog hits separately from active source.
- For keyboard runtime dependencies, prefer Plite-owned contracts over tiny
  stale browser packages. Tiny stale deps still own real behavior.

## Related Issues

- [Local is-hotkey parse failure](../../plans/2026-03-30-local-is-hotkey-parse-failure.md)
- [Plite hard cuts must run explicit contract files, not only default tests](./2026-04-29-plite-hard-cuts-must-run-explicit-contract-files.md)
- [Plite React history hotkeys must repair DOM after model undo](../ui-bugs/2026-04-21-slate-react-history-hotkeys-must-repair-dom-after-model-undo.md)
- [Workspace reinstall must clear package node_modules before pnpm install](./2026-04-01-workspace-reinstall-must-clear-package-node-modules-before-pnpm-install.md)
