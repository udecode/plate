# plate-next static clipboard payload owner

Objective:
Move static clipboard fragment payload writing to Plite DOM; done when
`setFragmentData`/`originEvent` are gone and focused proof passes.

Goal plan:
docs/plans/2026-07-03-plate-next-static-clipboard-payload-owner.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user accepted the long-term fix to update Plite DOM instead
  of keeping Core-owned `setFragmentData(data, originEvent)`.
- mode: named API/owner cleanup packet
- target surface: Plite DOM clipboard payload writing plus Core static view
  copy handling
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no
- correction-triggered related Core sweep: yes, for `setFragmentData`,
  `originEvent`, and raw Plite fragment payload writers in Core
- completion threshold summary: Plite DOM owns reusable fragment payload
  serialization, Core static owns selection extraction only, public-ish
  `setFragmentData(data, originEvent)` is removed, focused Plite/Core tests and
  package checks pass, source audits are clean, and this plan passes
  `check-complete`.

First checkpoint:
- Explicit requirement: implement the accepted best long-term fix.
- Explicit requirement: update `plite-dom` if that is the correct owner.
- Explicit requirement: remove the bad Core-owned `setFragmentData` shape.
- Scope boundary: clipboard fragment payload serialization and static view copy
  handling only.
- Non-goal: no broad Core sweep and no package sweep.
- Stop condition: no `setFragmentData` or `originEvent` callers in Core/Plite,
  no Core hand-rolled Plite fragment MIME writer, and focused proof passes.

Timed checkpoint:
- requested duration: N/A
- semantics: named API owner cleanup packet
- initial confidence score: 64 because the old behavior is understood but the
  static-view path needs careful ownership separation
- improvement loop: add Plite DOM writer, delegate Core static copy, remove old
  public-ish API, sweep symbol/callers, verify
- final score / loop closure: 97; target owner split is clean, proof is green,
  and only separate unmigrated `packages/selection` callers remain outside
  this packet

Completion threshold:
- Exact done state: Plite DOM exports the reusable fragment payload writer;
  Core static copy writes selected static DOM payload through that Plite DOM
  helper; `editor.api.setFragmentData(data, originEvent)` is gone; source
  audits for old symbols/raw MIME duplication are clean; focused tests,
  typecheck/lint, and plan check pass.
- Named file/API work may close from a scoped source map and focused proof.
- One-by-one review work may close only after the best Plate v2 recommendation
  is recorded, legacy/backcompat hacks are rejected, any Plite/Plate gaps are
  named, and every correction has a related Core sweep row.
- Broad Core sweep may close only when every Core source file has a valid row
  in this plan's Core drift ledger section or a linked plan artifact summarized
  in this plan.
- The plan records manifest command, expected row count, actual row count,
  missing row count, extra row count, and top drift rows before closeout.
- Any drift score `>=2` has an owner, evidence, and next action.
- Any drift score `>=4` is fixed, hard-cut, moved, quarantined, or deferred
  with owner/proof; it cannot close as `keep-in-plate`.
- Any file capped by the bridge scoring law must name the bridge dependency,
  the real owner, and the deletion path. It cannot be raised to 100 from
  `check:core` alone.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-03-plate-next-static-clipboard-payload-owner.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: `pnpm --filter @platejs/plite-dom test`,
  `pnpm --filter @platejs/core exec bun test src/static/plugins/ViewPlugin.spec.ts src/static/editor/withStatic.spec.tsx`
- package proof: `pnpm --filter @platejs/plite-dom typecheck`,
  `pnpm --filter @platejs/core typecheck`, scoped lint as needed
- source audits: exact `rg` for `setFragmentData`, `originEvent`,
  `application/x-plite-fragment`, and duplicate manual encoding in Core
- related Core sweep query / match count / patched count / deferred count:
  `rg -n "setFragmentData|originEvent" packages/core/src packages/plite-dom/src packages/plite-dom/test --glob '!**/dist/**'`
  returned no matches; broad package audit found six `packages/selection`
  legacy matches deferred to the package migration owner
- Plite/Plate gap ledger: no expected blocker; if Plite DOM writer shape cannot
  support static HTML/text payloads, record a Plite gap
- broad Core drift ledger gate: N/A, named API owner cleanup packet
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-03-plate-next-static-clipboard-payload-owner.md`

Constraints:
- Review mode targets the best Plate v2 shape: clean Plate product layer on top
  of Plite, no legacy compatibility goal.
- Plate owns product composition; Plite owns editor substrate.
- Core must not wrap Plite editor APIs under Plate names.
- No public compat aliases, old Slate shims, or docs for old API names.
- No local hacks: do not hide migration difficulty in bridge dumps, helper
  dumps, `any` casts, duplicated wrappers, command fallbacks, or fake aliases.
- If clean migration is blocked, record a `Plite gap` or `Plate gap` instead of
  inventing a compatibility workaround.
- After every correction, run a related Core sweep across `packages/core/src`
  and relevant `packages/core/type-tests` for the same symbol/pattern/smell.
- Review-mode rename freeze: keep current `HEAD` names/paths while behavior and
  API drift are under review. Put desirable later renames in
  `docs/plans/pre-renaming.md`; do not turn the active diff into Added/Deleted
  rename soup unless the user explicitly asks for a rename pass.
- Extracted-file recovery gate: every untracked/extracted Core/Plate source,
  spec, type-test, and config file in scope must be inventoried and classified
  as `recover-main-owner`, `merge-existing-owner`, `move-to-plite`,
  `justify-new-proof-tooling`, or `delete-duplicate`.
- No file or packet can score `100` while an extracted/untracked file in scope
  lacks a ledger row and one of those buckets.
- Private bridges require owner, deletion gate, and proof.
- Private bridges cannot collect displaced product/plugin behavior. A bridge
  file that centralizes input-rules, node-id, affinity, DOM, command, or change
  listener behavior scores `0` until deleted.
- Any file importing or installing a forbidden bridge is capped at `25`.
- Owner files whose runtime behavior lives in a forbidden bridge are capped:
  `InputRulesPlugin` `<=5`, `NodeIdPlugin` `<=45`, `AffinityPlugin` `<=55`,
  `PliteExtensionPlugin` `<=45`.
- Public type/plugin/editor files touched while a forbidden bridge remains are
  capped at `75`.
- If a helper exists only because migration was hard, cut it.
- Do not use a narrow representative file to close a broad Core sweep.
- For Core-only targets, ignore non-Core package errors unless the package is
  named, touched by the packet, or the failure proves a Core public API
  regression.

Boundaries:
- allowed edit scope: `packages/plite-dom/src/plugin/dom-clipboard-runtime.ts`,
  plite-dom exports/tests, Core static `ViewPlugin`/`PlateView`/static tests,
  and direct barrels if required
- package/API surfaces: Plite DOM clipboard API/helper and Core static view copy
  API
- docs/browser surfaces: N/A unless package docs fail from public-surface tests
- non-goals: no broad Core sweep, no docs rewrite, no editable runtime rewrite
- out-of-scope package errors: classify only if a command reports unrelated
  package failures

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- Stop and report only if current Plite DOM architecture cannot expose a
  payload writer without weakening clipboard trust boundaries or if a focused
  test reveals missing static-selection behavior that needs a larger Plite
  design.

Current verdict:
- verdict: move-to-plite plus Core private static helper
- confidence: 64 before implementation
- next owner: plate-next
- keep / revert / quarantine call: keep
- reason: Plite DOM already owns fragment MIME/HTML/plaintext format; Core
  static should not duplicate that format.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | first checkpoint rows above |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` read |
| Active goal checked or created | yes | `get_goal` returned none; `create_goal` created this packet |
| Mode classified as named packet vs broad Core sweep | yes | named API owner cleanup packet |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Current verdict and constraints |
| Broad Core drift ledger initialized when in scope | no | N/A: broad Core sweep not requested |
| Source of truth and allowed workspace recorded | yes | current checkout and `origin/main` comparison for old owner |
| Output budget strategy recorded | yes | targeted reads/searches only |
| Public API fork routing checked | yes | no `plate-plan` needed; public-ish legacy API is a direct hard cut |
| Gap policy checked | yes | no expected gap, but plan records blocker condition |
| Related Core sweep policy checked | yes | symbol/caller sweeps required after patch |
| Review-mode rename freeze checked | yes | no rename churn except API hard cut already accepted |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan before implementation.
- [x] Mode classified: named file/API packet, broad Core sweep, package sweep,
      docs/API mismatch, or public API plan.
- [x] Best Plate v2 call recorded for every reviewed target: `cut`,
      `move-to-plite`, `keep-in-plate`, `private-bridge-with-deletion-gate`,
      `Plite gap`, `Plate gap`, or `blocker`.
- [x] Legacy/backcompat decision recorded: no public compat alias, shim,
      duplicate Plate wrapper around Plite, old command fallback, or old docs
      path is kept unless explicitly accepted with deletion gate.
- [x] Hack check recorded: no bridge/helper dump, broad `any` cast, fake
      alias, or displaced product/plugin behavior is kept as a shortcut.
- [x] Gap ledger updated for every blocker: exact missing Plite or Plate
      capability, why local workaround is wrong, smallest owner, and proof.
- [x] After every correction, related Core sweep row is added with query,
      match count, patched count, deferred count, and remaining risk.
- [x] For broad Core sweep, the Core drift ledger in this plan, or linked from
      this plan, has one row per Core source file before closeout.
- [x] For broad Core sweep, every Core file row has `path`, `drift_score`,
      `verdict`, `owner`, `evidence`, and `next`.
- [x] For broad Core sweep, the plan records manifest command, expected row
      count, actual row count, missing row count, extra row count, and confirms
      missing/extra are zero.
- [x] For broad Core sweep, the drift score gate is closed in this plan:
      score `>=2` rows have owner/evidence/next, and score `>=4` rows are not
      closed as `keep-in-plate`.
- [x] Bridge scoring law applied: forbidden bridges score `0`, direct bridge
      imports/installers are capped, displaced owner files are capped, and no
      capped file is raised to 100 from green checks alone.
- [x] Review matrix is filled for every inspected file/API/helper.
- [x] Public API forks are routed to `plate-plan` before implementation.
- [x] Review-mode rename freeze applied: Added/Deleted rename noise is either
      restored to current `HEAD` names or mapped in `docs/plans/pre-renaming.md`
      with an explicit reason it cannot be restored in this packet.
- [x] Extracted-file recovery gate closed: every untracked/extracted file in
      scope has an inventory row and bucket, with `origin/main` owner checked
      before keeping any new path/name.
- [x] Safe cleanup packets are kept, reverted, or quarantined with proof.
- [x] Focused package proof is run after meaningful code changes.
- [x] `pnpm brl` is run when exports/barrels change.
- [x] Old compatibility names are source-audited when cut.
- [x] Changed list, top drift rows, needs-attention rows, and next owner are
      filled before final response.
- [x] Output budget discipline followed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the proof commands named in this plan | Plite DOM tests, Core static tests, package typecheck, lint, brl, and source audits passed |
| Broad Core drift ledger coverage | no | Record manifest command, expected row count, actual row count, missing row count, and extra row count when broad Core sweep applies | N/A: named API owner cleanup packet |
| Score gate | yes | Prove all scores are valid and high drift is owned/fixed/deferred in the plan ledger | target rows below; no unresolved target drift above 1 |
| Best Plate v2 recommendation | yes | Record the recommended current shape and rejected legacy/hack alternatives for the reviewed target | Plite DOM owns payload writing; Core static owns selection extraction |
| Plite/Plate gap ledger | yes | Record blockers or N/A when no gap blocks the target | N/A: Plite DOM writer added; no blocker remains |
| Related Core sweep after correction | yes | For each correction, run and record same-class Core search/review results | scoped `setFragmentData`/`originEvent` audit has zero Core/Plite matches |
| Package/API proof | yes | Run focused typecheck/test/build or record N/A | Core and Plite DOM typecheck passed; focused and package tests passed |
| Non-Core package error triage | yes | If a proof command reports non-Core failures, classify as named/touched/Core-regression or out-of-scope package drift | `packages/selection` still has legacy `editor.tf.setFragmentData`; out of scope |
| Source audit | yes | Run exact audit for removed compatibility names or record N/A | old-symbol audit passed in target scope |
| Rename ledger | no | Update `docs/plans/pre-renaming.md` when a rename is postponed or intentionally kept | N/A: no postponed rename |
| Extracted-file inventory | yes | Record untracked/extracted file command, row count, and bucket for every file in scope | new internal helper/spec classified below; prior static util files noted separately |
| Autoreview / review | yes | Run review gate for non-trivial implementation diffs or record N/A | Plate Next review performed in this plan; no separate autoreview requested for this narrow packet |
| Final lint/check | yes | Run scoped lint/check or record N/A | `@platejs/core lint` and `@platejs/plite-dom lint` passed |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | rows below |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-03-plate-next-static-clipboard-payload-owner.md` | pass |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/plite-dom/src/plugin/dom-clipboard-runtime.ts` / `writeDOMFragmentData` | 0 | move-to-plite | Plite DOM clipboard payload format | Plite DOM now owns reusable MIME/html/text payload writer and existing selection writer reuses it | keep |
| `packages/plite-dom/src/index.ts` | 0 | public API hard-cut support | Plite DOM public utilities | root export added with JSDoc and public-surface contract proof | keep |
| `packages/core/src/static/internal/writeStaticSelectionClipboardData.ts` | 0 | keep-in-plate | Core static selection extraction | extracts static DOM selection, delegates payload to Plite DOM, no public editor API | keep |
| `packages/core/src/static/plugins/ViewPlugin.ts` | 0 | hard-cut | Core static view plugin | `setFragmentData(data, originEvent)` removed; plugin only exposes `getFragment` | keep |
| `packages/core/src/react/components/PlateView.tsx` | 0 | main-parity-cleanup | Plate static view component | copy handler calls private static writer and prevents default only when data was written | keep |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| Static clipboard payload writing | Plite DOM owns `writeDOMFragmentData`; Core static owns only DOM-selection extraction and invokes the writer privately | reject `editor.api.setFragmentData`, reject `originEvent`, reject Core hand-rolled `application/x-plite-fragment` writer | Fragment payload format is Plite substrate; static selection is Plate/Core rendering concern | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | no missing capability after patch | Plite DOM writer exists; no local workaround remains | Plite DOM and Core static | Plite DOM/Core static tests and typecheck | closed |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| Remove `setFragmentData(data, originEvent)` | `rg -n "setFragmentData|originEvent" packages/core/src packages/plite-dom/src packages/plite-dom/test --glob '!**/dist/**'` | 0 | Core static API and tests | 0 | low |
| Move raw Plite fragment payload writer to Plite DOM | `rg -n "data\\.setData\\(['\\\"]application/x-plite-fragment|window\\.btoa\\(encodeURIComponent\\(string\\)\\)|const string = JSON\\.stringify\\(fragment\\)" packages/core/src/static packages/core/src/react packages/plite-dom/src --glob '!**/dist/**'` | 1 target helper match | Core raw writer removed; Plite DOM helper remains | 0 | low |
| Broad package legacy caller scan | `rg -n "setFragmentData|originEvent" packages --glob '!**/dist/**' --glob '!**/CHANGELOG.md'` | 6 `packages/selection` matches | 0 | 6 to selection package migration | medium outside this packet |

Core drift ledger:
- Applies: no
- Manifest command: N/A: broad Core sweep not requested
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: this table or a linked artifact summarized here
- Expected row count: N/A
- Actual row count: N/A
- Missing row count: N/A
- Extra row count: N/A
- Score gate: N/A; named API rows reviewed above
- Top drift rows: none in target

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| `packages/core/src/static/**` named clipboard surface | 0 | keep-in-plate / move-to-plite split | Core static + Plite DOM | source rows above | keep |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| static clipboard payload owner | Core static + Plite DOM | Core was hand-rolling Plite fragment payload through old `setFragmentData` API | files listed in changed list and proof commands | keep | close packet |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| `packages/core/src/static/internal/writeStaticSelectionClipboardData.ts` | justify-new-proof-tooling | no `origin/main` owner; replaces removed public-ish API with private static helper | keep | Core static tests pass |
| `packages/core/src/static/internal/writeStaticSelectionClipboardData.spec.ts` | justify-new-proof-tooling | no `origin/main` owner; preserves old copy behavior without asserting dead API | keep | Core static tests pass |
| `packages/core/src/static/utils/stripPliteDataAttributes.ts` | existing-untracked-outside-packet | prior static-utils packet artifact, not created by this packet | keep outside current claim | prior packet proof |
| `packages/core/src/static/utils/stripPliteDataAttributes.spec.ts` | existing-untracked-outside-packet | prior static-utils packet artifact, not created by this packet | keep outside current claim | prior packet proof |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| `packages/selection` broad scan | legacy `editor.tf.setFragmentData` callers remain | not named, not touched, and not required to prove Core static + Plite DOM owner split | selection package migration |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | added `writeDOMFragmentData` in Plite DOM; reused it in Plite DOM selection writing; removed Core static `setFragmentData(data, originEvent)` API; `PlateView` calls a private static writer |
| tests/proof | added Plite DOM writer test, updated public-surface contract, moved Core static copy proof to internal helper spec, updated ViewPlugin/withStatic specs |
| docs/templates/skills | updated this autogoal plan |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | `packages/selection` still uses `editor.tf.setFragmentData` | separate unmigrated package still has legacy API callers | `packages/selection/src/react/utils/copySelectedBlocks.ts` | handle in package migration, not this Core static packet |

Findings:
- Old Core static copy path was legacy drift from `origin/main`: it wrapped
  `tf.setFragmentData(data, originEvent)` and hand-wrote Plite fragment MIME.
- Plite DOM already owned runtime selection clipboard writing, so the durable
  owner was a reusable Plite DOM payload writer plus a Core-private static
  selection helper.
- Broad package scan still finds `packages/selection` legacy callers. That is a
  package migration item, not proof failure for this target.

Decisions and tradeoffs:
- Added public `writeDOMFragmentData` to `@platejs/plite-dom` because the
  fragment payload format is a low-level DOM utility, not Core product API.
- Kept static DOM selection extraction in Core because `PlateStatic` copies
  rendered static DOM, not the live editable Plite DOM range path.
- Removed `originEvent`; copy/cut/drag routing belongs at event-handler level,
  not the payload writer.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- `pnpm --filter @platejs/plite-dom test -- clipboard-boundary public-surface-contract`
  -> pass, 55 tests / 120 expects.
- `pnpm --filter @platejs/core exec bun test src/static/plugins/ViewPlugin.spec.ts src/static/internal/writeStaticSelectionClipboardData.spec.ts src/static/editor/withStatic.spec.tsx`
  -> pass, 25 tests / 43 expects.
- `pnpm --filter @platejs/core exec bun test src/static` -> pass, 89 tests /
  165 expects.
- `pnpm --filter @platejs/plite-dom test` -> pass, 134 tests / 347 expects.
- `pnpm --filter @platejs/plite-dom typecheck` -> pass.
- `pnpm --filter @platejs/core typecheck` -> pass.
- `pnpm --filter @platejs/plite-dom lint` -> pass.
- `pnpm --filter @platejs/core lint` -> pass.
- `pnpm brl` -> pass, 57 tasks.
- scoped old-symbol audit for Core/Plite DOM -> no matches.
- broad package audit -> only `packages/selection` legacy matches, deferred.

Final handoff contract:
- target surface and mode: named Core static + Plite DOM clipboard payload owner cleanup
- files/APIs reviewed: `writeDOMFragmentData`, `ViewPlugin`, `PlateView`,
  `writeStaticSelectionClipboardData`, static editor specs, Plite DOM public surface
- broad Core drift score coverage: N/A, not requested
- best Plate v2 recommendation: Plite DOM owns fragment payload writing; Core
  static owns selection extraction only
- verdict matrix summary: one `move-to-plite`, one Core private helper, one
  hard-cut legacy API
- Plite/Plate gaps or blockers: none
- related Core sweep query/matches/patched/deferred: recorded above
- changes made: recorded above
- tests/proof commands: recorded above
- old compatibility names audited: `setFragmentData`, `originEvent`, raw Core
  Plite fragment writer patterns
- needs attention: `packages/selection` legacy callers outside this packet
- next best Plate Next packet: migrate `packages/selection` copy-selected-blocks
  off `editor.tf.setFragmentData`

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Owner decision | complete | Plite DOM writer + Core private static helper selected | closed |
| Implementation | complete | `writeDOMFragmentData` added; Core `setFragmentData` removed | closed |
| Verification | complete | focused tests, full Plite DOM tests, static tests, typecheck, lint, brl, audits passed | closed |
| Handoff | complete | changed list, gaps, risks, and next owner recorded | closed |

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Checkpoint zero |
| Where am I going? | Drift-scored Plate Next closure |
| What is the goal? | Move static clipboard payload writing to Plite DOM and remove Core static `setFragmentData` |
| What have I learned? | Plite DOM can own the writer cleanly; Core static only needs a private selection helper |
| What have I done? | Added Plite DOM writer, delegated static copy to it, removed old API, ran proof |

Timeline:
- 2026-07-03T22:18:43.980Z Goal plan created.

Open risks:
- `packages/selection` still has legacy `editor.tf.setFragmentData` callers.
  This does not block the named Core static + Plite DOM packet, but it is the
  next package migration item.
