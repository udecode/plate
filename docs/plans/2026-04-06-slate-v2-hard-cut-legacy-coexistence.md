---
date: 2026-04-06
topic: slate-v2-hard-cut-legacy-coexistence
status: completed
---

# Slate v2 Hard Cut Legacy Coexistence

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

Turn `/Users/zbeyens/git/slate-v2` into a replacement-candidate repo instead of
a coexistence repo that still ships legacy packages, legacy examples, and
legacy comparison lanes internally.

## Scope

- delete legacy workspace packages from `packages/`
- delete legacy site examples and legacy Playwright example tests
- update the site registry and examples index to only expose the surviving v2
  surfaces
- update root scripts and workflows to target only the surviving architecture

## Non-Goals

- no package rename cut yet
- no React 19.2 convergence completion in this slice
- no external benchmark harness against `/Users/zbeyens/git/slate` yet

## Acceptance

- `/Users/zbeyens/git/slate-v2/packages` no longer contains legacy `slate*`
  packages except the surviving target stack
- site example registry no longer lists legacy examples
- Playwright example directory no longer contains legacy example tests
- root scripts no longer reference deleted legacy surfaces

## Progress

- deleted legacy workspace packages from `/Users/zbeyens/git/slate-v2/packages`
- deleted legacy site examples and legacy Playwright example tests
- cut legacy comparison and legacy helper scripts from the root package surface
- rewired the example registry and example index to surviving v2 surfaces only
- restored the generic local browser runner for surviving v2 browser proofs
- updated Rollup config and release-comment workflow to the surviving package
  graph

## Recovery Ledger

This is the explicit reminder list for later work.

Hard rule:

- do **not** restore these surfaces back into `/Users/zbeyens/git/slate-v2`
  just because a later slice wants comparison data
- comparison-only recovery belongs in `/Users/zbeyens/git/slate`
  unless the item is intentionally redesigned as a v2-native surface

### Removed Packages

Removed from `/Users/zbeyens/git/slate-v2/packages`:

- `slate`
- `slate-react`
- `slate-dom`
- `slate-history`
- `slate-hyperscript`

Recovery step:

- **never recover inside `slate-v2`**
- use `/Users/zbeyens/git/slate` as the legacy package oracle
- only recover by deliberate package rename/cutover, not by restoring these
  legacy packages into the replacement repo

### Removed TypeScript Examples

Removed from `/Users/zbeyens/git/slate-v2/site/examples/ts`:

- `android-tests.tsx`
- `check-lists.tsx`
- `code-highlighting.tsx`
- `custom-placeholder.tsx`
- `custom-types.d.ts`
- `editable-voids.tsx`
- `embeds.tsx`
- `forced-layout.tsx`
- `hovering-toolbar.tsx`
- `huge-document.tsx`
- `iframe.tsx`
- `images.tsx`
- `inlines.tsx`
- `markdown-preview.tsx`
- `markdown-shortcuts.tsx`
- `mentions.tsx`
- `paste-html.tsx`
- `plaintext.tsx`
- `read-only.tsx`
- `richtext.tsx`
- `scroll-into-view.tsx`
- `search-highlighting.tsx`
- `shadow-dom.tsx`
- `styling.tsx`
- `tables.tsx`

Recovery step:

- **comparison harness step against `/Users/zbeyens/git/slate`**
- do **not** restore these files in `slate-v2`
- if a specific surface is still strategically useful, reintroduce it as a
  **v2-native example** with replacement-candidate names and runtime contracts

### Removed Generated Example JS Mirrors

Removed from `/Users/zbeyens/git/slate-v2/site/examples/js`:

- generated JS mirrors for every removed TypeScript example above

Recovery step:

- **none directly**
- these regenerate automatically only if a future v2-native TS example is added

### Removed Playwright Example Tests

Removed from `/Users/zbeyens/git/slate-v2/playwright/integration/examples`:

- `check-lists.test.ts`
- `code-highlighting.test.ts`
- `editable-voids.test.ts`
- `embeds.test.ts`
- `forced-layout.test.ts`
- `hovering-toolbar.test.ts`
- `huge-document.test.ts`
- `iframe.test.ts`
- `images.test.ts`
- `inlines.test.ts`
- `markdown-preview.test.ts`
- `markdown-shortcuts.test.ts`
- `mentions.test.ts`
- `paste-html.test.ts`
- `placeholder.test.ts`
- `plaintext.test.ts`
- `read-only.test.ts`
- `richtext.test.ts`
- `search-highlighting.test.ts`
- `select.test.ts`
- `shadow-dom.test.ts`
- `slate-browser-clipboard.test.ts`
- `slate-browser-helpers.test.ts`
- `slate-browser-ime.test.ts`
- `styling.test.ts`
- `tables.test.ts`
- `phase6-compatibility.test.ts`

Recovery step:

- **legacy comparison lane step against `/Users/zbeyens/git/slate`**
- only recover a test into `slate-v2` if it is rewritten to exercise a
  surviving v2-native example or a surviving `slate-browser` API

### Removed Scripts And Workflows

Removed from `/Users/zbeyens/git/slate-v2`:

- `.github/workflows/phase6-proof.yml`
- `scripts/phase6-decoration-benchmark.mjs`
- `scripts/phase6-placeholder-benchmark.mjs`
- `scripts/phase6-huge-document-benchmark.mjs`

Recovery step:

- **post-rename benchmark/compat rebuild step**
- restore only as v2-native proof lanes with no baked-in legacy example
  dependency
- if a comparison benchmark is needed, run legacy-vs-v2 from separate repos,
  not by restoring mixed legacy fixtures into `slate-v2`

### Root Script Surface Removed Or Rewritten

Removed or rewritten in `/Users/zbeyens/git/slate-v2/package.json`:

- legacy workspace dependencies
- mixed legacy/v2 rollup package list
- mixed legacy Mocha scope
- local browser commands that depended on deleted legacy example surfaces
- Phase 6 compatibility and benchmark commands that depended on deleted legacy
  fixtures

Recovery step:

- **replacement proof rebuild step**
- add back only:
  - v2-native browser lanes
  - v2-native benchmark lanes
  - explicit cross-repo comparison wrappers if needed

## Ordered Recovery Steps

1. **Rename cut**
   Recovery allowed:

   - none from the removed legacy list

2. **React 19.2 / latest Next convergence**
   Recovery allowed:

   - none from the removed legacy list

3. **Cross-repo comparison harness**
   Recover from this ledger:

   - legacy example semantics
   - legacy benchmark baselines
   - old helper coverage
     Where:
   - `/Users/zbeyens/git/slate`, not `/Users/zbeyens/git/slate-v2`

4. **V2-native proof rebuild**
   Recover from this ledger only if rewritten as v2-native:

   - placeholder benchmark lane
   - huge-document benchmark lane
   - helper/browser proof lanes
   - any strategically useful example surface

5. **Replacement-gates scoreboard**
   Use the recovered comparison data, but keep the surviving implementation
   repo clean.
