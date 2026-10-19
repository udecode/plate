---
review_scopes:
  - html
  - runtime
  - react
  - annotations
  - list
  - table
review_basis:
  - 2026-09-30-content-root-locations-adoption-review
  - 2026-09-30-content-root-locations-agreement
  - 2026-09-30-content-root-locations-last-pass
  - 2026-09-30-static-preview-next-content-roots
  - 2026-09-11-runtime-document-view-ownership
  - 2026-09-12-react-public-runtime-cut
  - 2026-09-21-annotations-oss-validation
  - 2026-09-24-list-audit
  - 2026-09-17-table-host-delivery-benchmark-closure
work_kind: implementation
---

# Content-root locations execution

Status: Complete — S1–S5 adopted locally, including the closure repairs from review `2026-09-30-content-root-locations-adoption-review` and the Chromium S5 matrix; nothing staged or committed.

Objective:

Adopt the [content-root location design](./2026-09-30-content-root-locations.md)
in product code with the corrections of the
[last-pass](../research/review-records/2026-09-30-content-root-locations-last-pass.json)
and [agreement](../research/review-records/2026-09-30-content-root-locations-agreement.json)
reviews. Callbacks read the node their entry names, in the document and root
where it lives, through the existing scoped editor and root-relative paths.

Goal plan:
docs/plans/2026-09-30-content-root-locations-execution.md

Template:
docs/plans/templates/task.md

Primary template:
task

Packs:
package-api

Task source:
- User: "go the full plan" after the last-pass and agreement reviews
  (2026-09-30). Execute S1–S5 of the design plan in shipped-value order.
- Design decisions D1–D18 and proof matrix: `docs/plans/2026-09-30-content-root-locations.md`.
- Corrections: known-path List/Table reads land independently of the
  content-root chain; owner lookups in `discussion.tsx` and
  `authored-fragment-view.ts` stay unless redundant after S1; automatic
  owned-root mounts already receive initial authored policy through
  `EditorRoot`, so check later parent-mode changes; decoration source review
  covers rootless canonical inputs, not only explicit roots; pp4 stays
  2 pass / 2 inconclusive.

Completion threshold:
- S1: `createEditorView` over a view yields a coherent view of the requested
  root (omitted root = primary), inherits immutable document, sticky
  read-only and authored policy, validates a captured document once per schema
  revision, and keeps independent constructors.
- S2: static rendering supplies a root-scoped reader to render, leaf/text and
  decoration callbacks and dependency traversal inside content roots, reuses
  readers privately per document view and root, and keys reuse on root
  identity.
- S3: decoration output is admitted by root before caches and path fast paths;
  static leaf slicing honors target identity and multi-leaf ranges; attribute
  callbacks share the read guard; automatic owned-root mounts inherit source
  definitions and follow the owner's authored policy; sources that translate
  external canonical ranges emit explicit roots or decline.
- S4: `read.ordinal(at: NodeTarget<Element>)` resolves known paths without
  node recovery and returns `undefined` for unresolved targets; known-path
  `read.cell` presentation avoids keyed selection compilation; registry static
  list/table pass paths.
- S5: package types, tests, registry output, changesets, registry changelog,
  doctrine and mirrors, barrels and lint are complete on the final tree, with
  the applicable browser proof and cost rerun recorded honestly.

Verification surface:
- Plite: `packages/plitejs/test/runtime-contracts.test.ts`,
  `read-view-lifecycle-contract.test.ts`, `node-key-view-contract.test.ts`,
  React decoration/root tests under Vitest.
- Plate: `PlateStatic.spec.tsx`, `PlateStatic.reuse-oracle.spec.tsx`,
  `getPlateDecorationSources.spec.ts`, list/table specs.
- Types: source-first `plitejs`, `platejs`, `www` typechecks.
- Registry: `pnpm --filter www build:registry`; browser: managed Plite suites
  named in the design proof matrix.

Constraints:
- `next` branch; the user owns commits. No staging, commit, PR or publication.
- Paths stay root-relative; the primary root stays implicit in public API.
- Detached conversion stays editor-free; projected views stay read-only and
  source-isolated.
- Do not edit unrelated in-flight changes (for example `ai-menu.tsx`,
  `markdown-streaming-demo.tsx`).

Boundaries:
- Plite owns view/read semantics and raw decoration admission. Plate owns
  plugin adaptation and static traversal. List and table own their reads.
  Registry UI owns presentation.
- Non-goals: table topology, parsing, streaming, CSS, AI product behavior,
  decoration caching/chunking.

Timing:
- N/A.

Blocked condition:
- None known.

Task state:
- current_phase: complete
- next: none

Work Checklist:
- [x] Every applicable user, method, reference and template obligation maps to a source-linked row here or an existing linked ledger; exclusions have reasons.
- [x] Final reconciliation against the original checklists found no omitted requirement; evidence and applicable semantic/completion checks cover the full scope.
- [x] Capture the full outcome, acceptance criteria, scope and actual authority.
- [x] Inspect the named source, current owners and relevant evidence.
- [x] S1 view derivation (design D2, D3, D5; agreement owner-lookup caution).
- [x] S4 known-path List/Table presentation (D11, D12, D14, D13).
- [x] S2 static scoped delivery and reader reuse (D4, D6, D15).
- [x] S3 decoration admission, attribute guard, owned-root inheritance and source census (D8, D9, D10, D16).
- [x] S5 types, docs/rules/doctrine, changesets, registry changelog/output, barrels, browser and cost proof (D18).
- [x] Record the execution outcome in the review ledger and reconcile decision pages.
- [x] Closure pass (review `2026-09-30-content-root-locations-adoption-review`): static root readers follow policy changes, retained render contexts restore owner sources, Yjs root regression coverage, Chromium S5 cadence matrix.
- [x] Run applicable `lint:fix` as the final implementation item.

Decisions and tradeoffs:

| Decision | Owner and source | Chosen fix | Material alternative rejected | Proof |
| --- | --- | --- | --- | --- |
| Location contract | Vision `docs/vision/plite.md:406-409` | Scoped editor + root-relative entry | Root-qualified locations; new carrier | Design plan |
| View derivation (D2, D3) | `packages/plitejs/src/editor-runtime-view.ts` | Bind views over the runtime owner; inherit document, sticky read-only and authored policy from a source view; omitted root is primary | Forbid view sources; caller flattening | Four runtime/authored contracts |
| Validation once (D5) | same | Certificate per compiled schema and document | Revision counter | `production-roots.json`: 1 validation at 1,000 roots |
| Static root readers (D4, D6, D15) | `staticDocumentView.ts`, `PlateStatic.tsx` | One cached reader per rendered document and root, replaced when the rendering view's authored mode or read-only state changes; root keys in block inputs; reader's root in the initial stack | Explicit document view per root; readers keyed by identity alone (stale after a mode switch) | `PlateStatic.spec` content-root and mode-switch cases |
| Admission (D8) | `internal/root-location.ts` `getReaderRange`, live compiler, static reads | One helper strips the reader's own root and drops other roots before caches, fast paths and slicing | Per-source checks only | Decoration-manager case; static slicing by leaf intersection |
| Owned-root mounts (D10) | `editable-text-blocks.tsx`, internal `DecorationSourcesContext`, `usePliteRenderContext` | Borrow owner sources; the retained render context restores them for parent content inside a fragment; follow owner authored mode through view-state notifications | Source-array stabilizer (reconciliation already compares source identities) | Three React contracts |
| Known paths (D11, D12) | `BaseListPlugin.ts`, `BaseTablePlugin.ts`, registry static list/table | `ordinal(at: NodeTarget)`; path `read.cell` through the cached pure grid | Separate list resolver; table marker API | `production-features.json`: 0 index builds |
| Canonical sources (D16) | `YjsPlugin.tsx` | Remote selections paint only through a reader of their root | Admission alone (cannot tell canonical rootless ranges apart) | Yjs React contract; fails with the filter removed |

Completion Gates:

| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| User-visible result | yes | S1–S4 adopted with package tests | pass: see evidence |
| Public API / package boundary proof | yes | `createEditorView` derivation semantics; list `ordinal` target widening | pass: types, JSDoc, docs, doctrine v253 |
| Runtime scale contract | yes | Production rerun of the frozen contract; Chromium S5 static/AI cells | pass: `production-roots.json`, `production-features.json`; S5 no-regression checks pass in every cell (`s5/README.txt`), ai-rich profile attribution inconclusive |
| Release artifact classification | yes | plitejs + platejs package behavior/API; registry source | package and registry deltas |
| Published package changeset | yes | One `.changeset/*.md` per package, no forbidden `minor` | `.changeset/plitejs-content-root-views.md`, `.changeset/platejs-content-root-reads.md` (patch) |
| Registry changelog | yes | Static list/table registry components change | `2026-09-30-static-list-table-known-paths`; `--check` pass |
| No release artifact | no | N/A: package and registry deltas exist | N/A |
| Package typecheck/build/test | yes | plitejs, platejs, www | pass |
| Barrel/export generation | yes | `pnpm brl` | pass: no changes |

Verification evidence:

- Final tree: `pnpm turbo run typecheck --filter=plitejs --filter=platejs`
  93/93; `pnpm --filter www typecheck` pass (registry fresh, docs parity
  pass); Plite runtime/authored contracts 874 pass; touched Plate specs 243
  pass; Plite React suite 92 files / 1,346 pass before formatting and the two
  touched React files 80 pass after it; `pnpm --filter platejs test` 141/141
  tasks; list/table slow contracts and the public import smoke 87 pass.
- `pnpm check:plite:contracts`: 253 pass, 3 fail in
  `tooling/scripts/test-suite-routing.test.mjs` (runner output format and
  `apps/www/src/value.test.ts` discovery). They fail standalone with no diff
  in their inputs; unrelated to this plan.
- www Chromium (fresh dev server): `markdown-streaming-contract` and
  `markdown-streaming-lifetime` 22 pass, 16 benchmark cells skipped without
  `S5_BENCH`; static and AI previews equal fresh renders with the registry kit.
- Browser (managed Chromium, fresh build): smoke 3/3; multi-root document,
  synced blocks, editable voids, tables and async decorations 14 pass, 2 fail
  (`decorations-async` IME composition cases). The same two fail with this
  plan's Plite runtime and React files reverted to their pre-change content,
  so they predate this work.
- Slow AI/HTML contracts: 28 pass, 6 fail. `HtmlPlugin.mapping.slow` fails on
  `no mapping for <img>` (known before this plan); three
  `AIChatPlugin.submit.slow` backward-selection undo cases fail identically
  with the pre-change view runtime and touch no other file of this plan.
- Cost (`docs/research/probes/2026-09-30-content-root-locations/production.tsx`):
  one document validation per capture at 2/10/100/1,000 roots, zero extra
  validations for explicit per-root views, zero index builds; total cold
  0.19/0.28/1.62/14.5 ms (prototype 0.18/0.28/1.48/15.86). Path feature reads
  build 0 indexes (node targets 2): 0.32/0.28 ms against 0.61/1.36 ms at
  20/500 unrelated paragraphs. Streamed static preview (16 publications,
  rich/CJK, 10/50 KB, React reuse under happy-dom) against hash-verified
  pre-change sources: identical HTML in every cell; per-publication medians
  within the 10% inconclusive band (load 4.9). No speed claim.
- Doctrine: Best API behavior rule, Plite Vision, Plate Next v253
  (`version.mjs validate` pass), mirrors regenerated with `pnpm install`.
- Docs: list API (English/Chinese) and Plite `createEditorView` reference.
- `lint:fix`: Ultracite on the 26 changed source/test files (root `ultracite
  fix` would format unrelated in-flight files); 7 reformatted, checks rerun.
- S1: `bun test --preload ./config/plite-source-test-setup.ts` runtime,
  read-view lifecycle, node-key view and authored view contracts: 874 pass,
  including four new derivation contracts.
- S4: `pnpm --filter platejs test -- BaseListPlugin` 44 pass;
  `-- BaseTablePlugin PlateStatic grid` 194 pass across 18 files.
- S3 live: `bun run test:react` in `packages/plitejs`: 92 files, 1346 pass.
  New decoration-manager root admission case; two new owned-root mount cases
  fail without the change (sources absent; owned root kept `propose` after the
  owner switched to `edit/accepted`) and pass with it.
- S2/S3 static: `PlateStatic.spec` 20 pass, including the new content-root
  reader case (live editor and supplied document); adapter spec 9 pass.
- `pnpm --filter plitejs typecheck` and `pnpm --filter platejs typecheck`
  (90/90) pass; `pnpm --filter platejs test` 141/141 tasks pass.

Findings and remaining work:

- Automatic owned-root mounts kept their initial authored mode after the owner
  switched modes. Initial inheritance already existed through `EditorRoot`;
  the slot now follows the owner's policy through view-state notifications.
- Source census (range origin): Suggestions derive ranges from the entry with
  the reader's root; Comments resolve by node key and address only the
  primary root; Find decorates only the searched children array; Code and the
  Plite view-selection source are entry- or root-filtered. Yjs remote cursors
  compared canonical paths without roots and now paint only in a reader of
  the cursor's own root.
- Owner lookups in `discussion.tsx` (cache key) and
  `authored-fragment-view.ts` (fixed accepted projection) stay; neither is a
  derivation workaround.

Closure pass (adoption review `2026-09-30-content-root-locations-adoption-review`):

- Static root readers kept the authored policy of their first construction:
  after a live proposal view switched to accepted mode, `EditorStatic` still
  rendered "Foot draft" in its caption. `getStaticRootView` now replaces a
  cached reader when the rendering view's authored policy object or read-only
  state changes and reuses it otherwise; `readAuthoredView` reaches Plate
  through `plitejs/internal` and the facade. `PlateStatic.spec` renders the
  switch and rerenders ("Foot"); the case fails when the cache ignores policy.
- `usePliteRenderContext` restores the owner's decoration sources for parent
  content handed back inside a retained fragment. Source reconciliation keys
  on source identity, so a new array with the same sources recompiles
  nothing; no stabilizer is needed. A React contract pins the restore.
- My earlier claim that a Yjs test needs the private awareness format was
  wrong: public `syncSelection` plus the existing `FakeAwareness` transport
  drives both cases. `packages/platejs/test/yjs/react-contract.spec.tsx` now
  asserts primary and caption cursors paint only in their own root and fails
  with the root filter removed.
- Chromium S5 matrix (`docs/research/probes/2026-09-30-content-root-locations/s5/`):
  candidate and hash-verified pre-change baseline built from one snapshot,
  bundle identity checked. All six complete cells pass the summarizer's
  no-regression checks (final and arrival p95 within max(10%, 5 ms)) with
  identical final text; its 20%/100 ms speedup gate does not apply. The
  ai-rich cells stay inconclusive under the unchanged profile rule (stack loss
  in both arms, twice); their trace checks pass. React time and busy time are
  flat or lower except one static CJK 10 KB candidate stream recorded at load
  ~10.
- After the repairs: typecheck 93/93; Plite React 1,347; Plite runtime and
  authored contracts 854; touched Plate specs 248; import smoke 29; doctrine
  v253 valid. The reviewer's two static-policy probes now match a fresh
  accepted render.

Final handoff:

- Outcome and owning fix: S1–S5 adopted at their owners (Plite view runtime,
  root-location admission and React content-root slot; Plate static renderer,
  decoration adapter, list/table reads and Yjs source; registry static
  list/table).
- Proof and limits: see Verification evidence and the closure pass. The
  retained-source repair is pinned at the render-context boundary; no full
  retained-markup interaction was driven. ai-rich S5 profile attribution is
  inconclusive under the frozen rule. Pre-existing failures remain for their
  owners.
- Local / integrated / published state: local only; nothing staged or committed.
- Next action or completion: none required for this plan.

Timeline:

- 2026-09-30T11:09:52.676Z Plan created.
- 2026-09-30 Closure reopened by the adoption review; repairs below.

Design proof-matrix reconciliation: covered rows are root/view composition,
live root ownership, decoration admission, static correctness (primary,
owned and supplied-document roots, and authored mode changes), list and table
semantics, session paint (Yjs primary/caption cursors), native
multi-root/synced/void/table suites, cost (headless and Chromium S5) and
teaching. Exclusions: a root-key reassociation case needs an element whose
root key changes without the element changing, which element-derived keys
cannot produce, so block inputs compare root keys by construction; the AI
end-marker row has no case because the AI end marker is a component, not a
decoration source.

Open risks:

- Pre-existing failures named above remain for their owners.
- ai-rich S5 profile attribution is unavailable; its latency rests on trace
  and page checks.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Package/API pack selected | yes | package-api |
| Public surface or package boundary identified | yes | `createEditorView`, list `read.ordinal`, static rendering callbacks |
| Release artifact path selected | yes | `.changeset` for plitejs/platejs; registry changelog for registry |
| `changeset` skill loaded when `.changeset` is required | yes | loaded; two patch changesets |
| Barrel/export impact decision recorded | yes | `pnpm brl`: no changes |
| Runtime scale applicability resolved | yes | Design probe covers root/read scale; rerun at S5 |
