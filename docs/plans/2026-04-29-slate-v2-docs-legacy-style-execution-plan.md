# Slate v2 Docs Legacy-Style Execution Plan

Date: 2026-04-29
Status: done
Source review: `docs/plans/2026-04-28-slate-v2-docs-legacy-style-review-plan.md`
Current phase: complete

## Goal

Rewrite the public `../slate-v2/docs` tree so it keeps legacy Slate's calm
information architecture and walkthrough voice while teaching only the live
Slate v2 contracts.

## North Star

- Keep the legacy docs shape: Introduction, Walkthroughs, Concepts, API,
  Libraries, General.
- Keep the writing style: problem first, code second, API reference last.
- Replace stale legacy API claims with source-backed Slate v2 contracts.
- Keep raw Slate unopinionated. Plate owns product/plugin API ergonomics above
  the raw substrate.
- Document migration backbone for Plate and slate-yjs, not current-version
  adapter support.

## Scope

Allowed:

- Edit `../slate-v2/docs/**`.
- Add lightweight docs proof artifacts only if needed.
- Read `../slate-v2/packages/**`, `../slate-v2/test/**`, `../slate/docs/**`,
  and relevant `docs/research/**` / `docs/solutions/**`.

Avoid:

- Implementation changes in `../slate-v2/packages/**`.
- Current-version Plate or slate-yjs adapter promises.
- Changelog/migration voice in current docs.
- App-owned void spacer docs.
- Broad React subscription advice in rendered content.

## Execution Phases

| Phase | Status | Owner | Output | Gate |
| --- | --- | --- | --- | --- |
| 1. Front door and navigation | complete | docs author | `Introduction.md`, `Summary.md`, `walkthroughs/01-installing-slate.md`, bundled-source placement | Link/stale-term grep |
| 2. Core lifecycle docs | complete | core API docs author | Editor, Commands, Transforms, Plugins, Normalizing, formatting walkthroughs aligned with `read`, `update`, `state`, `tx` | Stale write/API grep |
| 3. React runtime docs | complete | slate-react docs author | Slate, Editable, hooks, rendering, voids, decorations, annotations, performance | Source ledger and stale React grep |
| 4. Collaboration substrate docs | complete | collaboration docs author | Adapter-substrate docs for commits, tags, snapshots, operation replay, local runtime ids | `withYjs` promise grep and source ledger |
| 5. Proof wiring | complete | docs/test owner | Stale-term grep, source ledger, snippet/proof map, browser contract map | Final docs gates |

## Phase 1 Plan

1. Rewrite `../slate-v2/docs/Introduction.md` from legacy copy into current
   Slate v2 positioning.
2. Keep `../slate-v2/docs/Summary.md` structure, but remove the normal-path
   bundled-source walkthrough link and label historical content carefully.
3. Rewrite `../slate-v2/docs/walkthroughs/01-installing-slate.md` around
   package-manager-neutral install commands, typed `createEditor`, `Slate`,
   `Editable`, and `initialValue`.
4. Remove broken UMD/global bundle claims from the normal docs path.

## Current Evidence

- Review scorecard closed at `0.92`.
- `../slate-v2/docs/Introduction.md` is still legacy copy with stale beta and
  plugin-positioning claims.
- `../slate-v2/docs/walkthroughs/01-installing-slate.md` still links
  `xx-using-the-bundled-source.md` and mentions `dist/slate.js`.
- `../slate-v2/docs/walkthroughs/08-using-the-bundled-source.md` documents UMD
  artifacts that do not match current package exports.
- `../slate-v2/packages/slate/package.json` and
  `../slate-v2/packages/slate-react/package.json` expose ESM package entries,
  not the old normal-path UMD bundle story.

## Fast Driver Gates

```bash
rg -n "beta|xx-using|dist/slate|dist/slate-react|under construction|editor\\.children|editor\\.selection|editor\\.operations|editor\\.marks|methods\\(|Editor.addMark\\(|Editor.removeMark\\(|editor\\.insertNodes\\(" ../slate-v2/docs
```

```bash
rg -n "createEditor<|initialValue|renderVoid|useElementSelected|decorationSources|annotationStores|applyOperations|editor\\.update|editor\\.read" ../slate-v2/docs ../slate-v2/packages
```

## Completion Target

Set `tmp/completion-check.md` to `done` only when:

- all five phases are complete
- no normal docs path teaches stale legacy API contracts
- front-door docs point readers to current source-backed walkthroughs
- core docs teach `editor.read`, `editor.update`, `state`, and `tx` as the
  normal authoring shape
- React docs teach provider-owned projection and target-scoped hooks
- collaboration docs explain migration substrate without current adapter
  promises
- browser-sensitive docs map to replayable proof rows
- focused stale-term/source-ledger gates pass

## Progress Ledger

| Date | Slice | Files changed | Evidence | Next owner |
| --- | --- | --- | --- | --- |
| 2026-04-29 | Activated execution lane from accepted review plan. | This plan, `tmp/completion-check.md`, `tmp/continue.md` | Review lane closed at `0.92`; Phase 1 is runnable. | Phase 1 front door and navigation docs |
| 2026-04-29 | Completed Phase 1 front door and navigation. | `../slate-v2/docs/Introduction.md`, `../slate-v2/docs/Summary.md`, `../slate-v2/docs/walkthroughs/01-installing-slate.md`, `../slate-v2/docs/walkthroughs/08-using-the-bundled-source.md` | Focused stale-term grep over touched docs returned no matches for beta, broken bundled-source, direct mutable fields, extension methods, or direct write snippets. Changelog and migration links are labeled historical. | Phase 2 core lifecycle docs |
| 2026-04-29 | Completed Phase 2 core lifecycle docs. | `../slate-v2/docs/walkthroughs/04-applying-custom-formatting.md`, `../slate-v2/docs/walkthroughs/05-executing-commands.md`, `../slate-v2/docs/concepts/07-editor.md`, `../slate-v2/docs/concepts/08-plugins.md`, `../slate-v2/docs/concepts/11-normalizing.md`, `../slate-v2/docs/api/nodes/editor.md` | Focused stale-write/API grep over Phase 2 docs returned no matches for extension `methods`, direct mutable fields, direct `Editor.addMark` / `Editor.removeMark` calls, or normal-path primitive writes. | Phase 3 React runtime docs |
| 2026-04-29 | Completed Phase 3 React runtime docs. | `../slate-v2/docs/libraries/slate-react/slate.md`, `../slate-v2/docs/libraries/slate-react/editable.md`, `../slate-v2/docs/concepts/09-rendering.md`, `../slate-v2/docs/api/nodes/element.md` | Focused React docs grep found no `useSlate`, `<Editor>`, under-construction source escape hatch, app-owned void spacer example, eager `selected` / `focused` void props, or unsafe void action props. | Phase 4 collaboration substrate docs |
| 2026-04-29 | Completed Phase 4 collaboration substrate docs. | `../slate-v2/docs/walkthroughs/07-enabling-collaborative-editing.md`, `../slate-v2/docs/Summary.md` | Replaced current-adapter recipe with commit/operation substrate docs. Focused grep returned no `withYjs`, `YjsEditor`, `withCursors`, `@slate-yjs`, `Liveblocks`, `YjsProvider`, direct mutable fields, extension `methods`, or direct `editor.insertNodes` recipe in the touched docs. | Phase 5 proof wiring |
| 2026-04-29 | Completed Phase 5 proof wiring and final cleanup. | `../slate-v2/docs/general/docs-proof-map.md`, `../slate-v2/docs/Summary.md`, `../slate-v2/docs/walkthroughs/04-applying-custom-formatting.md`, `../slate-v2/docs/walkthroughs/06-saving-to-a-database.md` | Added source/test/browser contract map. Normal-path stale grep is clean when historical changelog and migration pages are excluded. Changelog-voice grep over current docs returned no matches after cleaning two old walkthrough openings. | Complete |
