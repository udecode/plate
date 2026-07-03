# plate-next core named files score gate

Objective:
Score six named Core files under Plate Next rules; done when each is >95
confidence with no regression, no drift, and type proof.

Goal plan:
docs/plans/2026-07-01-plate-next-core-named-files-score-gate.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user asked `$autogoal` + `$plate-next` score gate on six named
  files
- mode: named file/API packet
- target surface:
  - `packages/core/src/lib/plugins/node-id/NodeIdPlugin.ts`
  - `packages/core/src/lib/plugin/createBasePlugin.ts`
  - `packages/core/src/lib/plugin/SlatePlugin.ts`
  - `packages/core/src/lib/plugin/BasePlugin.ts`
  - `packages/core/src/lib/editor/SlateEditor.ts`
  - `packages/core/src/lib/editor/withPlite.ts`
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no; user named exactly six files
- correction-triggered related Core sweep: yes, only for symbols/patterns
  changed during this packet
- completion threshold summary: every target file scores `>95`, with target
  score `100`, no regression/no drift including type, focused proof recorded,
  and `check-complete` passes

First checkpoint:
- Copy every explicit prompt requirement into this plan before implementation:
  target, duration, non-goals, stop condition, proof commands, final handoff,
  and whether the user asked for `sweep`, `all core`, `full-loop`, or an
  equivalent broad Core review.
- If broad Core sweep is in scope, fill the Core drift ledger rows in this
  plan before closing any packet. Keep this template-only.

Timed checkpoint:
- requested duration: none
- semantics: N/A
- initial confidence score: 80 before proof, because the target files had to be
  checked against Plate Next drift rules and type proof
- improvement loop: continued through review, support fixes, focused proof,
  scoped source audits, and `check:core`
- final score / loop closure: all six named files scored `100`; no target file
  remains below the `>95` gate

Completion threshold:
- Done when all six named files have ledger rows scoring `>95`, no unresolved
  type regression, no unnecessary drift from `origin/main`, no retained
  forbidden bridge/helper dump, no Plite/Plate ownership gap without a named
  owner, focused proof passes, and this plan passes `check-complete`.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-01-plate-next-core-named-files-score-gate.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: Core target specs, Parser/DOM regression specs,
  Plite DOM package proof, and `check:core`
- package proof: `pnpm --filter @platejs/core typecheck`,
  `pnpm --filter @platejs/plite-dom typecheck`, scoped Core lint,
  Plite DOM lint/test, and `pnpm check:core`
- source audits: forbidden pattern scan across the six target files and support
  files; untracked/extracted inventory for the target directories and support
  directories
- related Core sweep query / match count / patched count / deferred count:
  DOM clipboard ownership query found five expected matches, all accounted for,
  zero deferred
- Plite/Plate gap ledger: no blocker remains; the only gap was solved in Plite
  DOM plus Plate DOM ownership
- broad Core drift ledger gate: N/A, named six-file packet
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-01-plate-next-core-named-files-score-gate.md`

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
- allowed edit scope: six target files plus smallest owner files/tests needed
  to fix a proven type/regression/drift issue found from those targets
- package/API surfaces: Core plugin/editor typing and Plate-on-Plite boundary
- docs/browser surfaces: N/A unless API docs are directly broken by a fix
- non-goals: no broad Core sweep, no feature package sweep, no rename pass, no
  commit/PR, no compatibility aliases, no speculative cleanup outside the named
  score gate
- out-of-scope package errors: ignore non-Core package errors unless caused by
  a Core public API regression from this packet

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- A file cannot reach `>95` without a larger Plite/Plate API decision that
  belongs in `plite-plan` or `plate-plan`, or proof commands reveal unrelated
  repo-wide breakage outside the named packet.

Current verdict:
- verdict: keep
- confidence: 100 for the six named files
- next owner: plate-next
- keep / revert / quarantine call: keep
- reason: targeted cleanup removed drift in the named files, support fixes
  repaired a real ParserPlugin/DOM ownership regression, and scoped proof is
  green

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Six files, `>95`/target `100`, no regression, no drift, including type, and no stop-before-done copied above |
| `plate-next` skill/rule read | yes | Skill read before plan creation; current work applies named-file packet mode |
| Active goal checked or created | yes | Active goal created for this plan |
| Mode classified as named packet vs broad Core sweep | yes | Named six-file/API packet, not broad Core sweep |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Target says best Plate v2 on Plite, no legacy compat |
| Broad Core drift ledger initialized when in scope | N/A | Broad Core sweep explicitly out of scope |
| Source of truth and allowed workspace recorded | yes | Current checkout `/Users/zbeyens/git/plate-2`; source owner files above |
| Output budget strategy recorded | yes | Targeted `rg`/`sed`/diff, artifact ledgers for counts |
| Public API fork routing checked | yes | Route only if a file exposes a public API fork needing plan-level decision |
| Gap policy checked | yes | Record Plite/Plate gap instead of workaround |
| Related Core sweep policy checked | yes | Required only for corrected symbols/patterns |
| Review-mode rename freeze checked | yes | No rename pass in this packet |

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

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Checkpoint zero | done | User requirements copied into this plan before closeout |
| Six-file Plate Next review | done | Every named file has a score row of `100` |
| Support regression repair | done | ParserPlugin/DOM clipboard ownership regression fixed and proven |
| Proof and audit | done | Focused tests, typecheck, lint, Plite DOM proof, forbidden scan, inventory scan, and `check:core` passed |
| Broad Core sweep | not-applicable | User named exactly six files; broad sweep stayed out of scope |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the proof commands named in this plan | Six target rows scored `100`; focused Core and Plite DOM proof passed |
| Broad Core drift ledger coverage | N/A | Record manifest command, expected row count, actual row count, missing row count, and extra row count when broad Core sweep applies | Broad Core sweep is out of scope; named six-file ledger is complete |
| Score gate | yes | Prove all scores are valid and high drift is owned/fixed/deferred in the plan ledger | All six named files are `100`; no target remains below `>95` |
| Best Plate v2 recommendation | yes | Record the recommended current shape and rejected legacy/hack alternatives for the reviewed target | Recommendation table filled per file and support packet |
| Plite/Plate gap ledger | yes | Record blockers or record no blocker after review | DOM clipboard ownership gap fixed; no blocker remains |
| Related Core sweep after correction | yes | For each correction, run and record same-class Core search/review results | DOM clipboard query recorded; forbidden bridge scan recorded |
| Package/API proof | yes | Run focused typecheck/test/build or record N/A | Core typecheck/lint, Plite DOM typecheck/lint/test, focused Core tests, and `check:core` passed |
| Non-Core package error triage | yes | If a proof command reports non-Core failures, classify as named/touched/Core-regression or out-of-scope package drift | No non-Core failure remained after support packet |
| Source audit | yes | Run exact audit for removed compatibility names or record N/A | Forbidden scan across target/support files returned no matches |
| Rename ledger | N/A | Update `docs/plans/pre-renaming.md` when a rename is postponed or intentionally kept | No rename was introduced or postponed |
| Extracted-file inventory | yes | Record untracked/extracted file command, row count, and bucket for every file in scope | Inventory scan returned zero rows |
| Autoreview / review | N/A | Run review gate for non-trivial implementation diffs or record N/A | This is a named score-gate packet; no separate `autoreview` requested |
| Final lint/check | yes | Run scoped lint/check or record N/A | `pnpm check:core` passed |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Ledgers below filled |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-01-plate-next-core-named-files-score-gate.md` | Ready to run after this evidence update |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/core/src/lib/plugins/node-id/NodeIdPlugin.ts` | 100 | keep-in-plate | Core node-id plugin | Node-id behavior stays in owner plugin, no forbidden bridge scan matches, focused NodeId specs and `check:core` passed | Keep |
| `packages/core/src/lib/plugin/createBasePlugin.ts` | 100 | keep-in-plate | Core plugin factory | Inline inference/type tests pass, no transforms/getPluginApi bridge, no extracted-file noise | Keep |
| `packages/core/src/lib/plugin/SlatePlugin.ts` | 100 | keep-in-plate | Core plugin types | `PluginConfig` uses API/tx/selectors shape, no transforms slot, Core typecheck passed | Keep |
| `packages/core/src/lib/plugin/BasePlugin.ts` | 100 | keep-in-plate | Core base plugin API | Owns Plate plugin methods and Plite extension surface, no legacy transforms surface, Core typecheck passed | Keep |
| `packages/core/src/lib/editor/SlateEditor.ts` | 100 | keep-in-plate | Core editor type surface | Plite runtime base plus Plate identity/plugin cache; no `tf`/direct mirror compatibility surface; typecheck passed | Keep |
| `packages/core/src/lib/editor/withPlite.ts` | 100 | keep-in-plate | Core Plate-to-Plite setup | Dead scaffolds removed; no forbidden runtime bridge imports; Parser/DOM regression exposed and fixed; `check:core` passed | Keep |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| `NodeIdPlugin.ts` | Keep node-id as Plate product/plugin behavior installed through Plite extension hooks | Do not move node-id product policy into a private bridge or generic Plite helper | Node IDs are Plate plugin semantics, not raw editor substrate | None blocking |
| `createBasePlugin.ts` | Keep as the non-React Plate plugin factory with inline inference | No `createT*` parallel factory, no transforms alias, no wrapper-only rename | One factory keeps inference and avoids compatibility clutter | None blocking |
| `SlatePlugin.ts` / `BasePlugin.ts` | Keep API/tx/selectors typing; transforms are gone | No `extendTransforms`, `plugin.transforms`, `editor.tf`, or `getPluginApi` survival path | Plate v2 should extend Plite through API and tx only | None blocking |
| `SlateEditor.ts` | Keep `BaseEditor` as Plate's non-React editor type layered on Plite runtime | No direct children/marks/selection/history mirrors, no old Slate editor namespace | Plite owns substrate reads/writes; Plate owns product/plugin state | None blocking |
| `withPlite.ts` | Keep as the Plate-to-Plite setup owner | No separate bridge file that stores displaced plugin behavior | Setup code belongs here until a later split is proven by owner boundaries | None blocking |
| Core DOM support packet | Plate DOM plugin should not own ParserPlugin clipboard insertion | No fallback clipboard behavior in Core DOM that bypasses ParserPlugin replacement semantics | Fixed real regression caught by ParserPlugin specs | Review only if you want Plite DOM clipboard opt-out named differently |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| Plite DOM support | Transaction-safe DOM text fallback plus host opt-out for clipboard API | Letting Plate DOM own clipboard insertion broke ParserPlugin replacement semantics | `@platejs/plite-dom` for transaction-safe fallback; Core DOM plugin for opt-out | ParserPlugin and DOMPlugin specs, Plite DOM proof | Fixed |
| Six target files | None remaining | N/A | N/A | Focused Core proof and `check:core` | Closed |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| DOM clipboard ownership fix | `rg -n "pliteDom\\(|clipboard: false|insertDOMTextDataInTransaction|insertDOMTextData =|clipboard\\?: false" packages/core/src packages/plite-dom/src` | 5 expected matches | 3 files changed | 0 | None known |
| Forbidden bridge/compat audit | `rg -n "currentRuntimeBridge|currentRuntimeCommandStore|runtimeTxExtensions|extendTransforms|getTransforms|getPluginApi|editor\\.tf|plugin\\.transforms|editor\\.transforms|compat|normalizeInitialValue" ...target/support files...` | 0 | 0 | 0 | None known |

Core drift ledger:
- Applies: no; named six-file packet
- Manifest command: N/A for broad Core; target inventory command recorded in
  Extracted file ledger
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: this table or a linked artifact summarized here
- Expected row count: N/A
- Actual row count: N/A
- Missing row count: N/A
- Extra row count: N/A
- Score gate: N/A for broad ledger; six target file score gate applies in
  Review matrix
- Top drift rows: N/A unless target file scoring finds one

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| `packages/core/src/lib/plugins/node-id/NodeIdPlugin.ts` | 100 | keep | Core node-id plugin | Focused NodeId specs, typecheck, `check:core`, forbidden scan | Keep |
| `packages/core/src/lib/plugin/createBasePlugin.ts` | 100 | keep | Core plugin factory | Factory/type specs, typecheck, forbidden scan | Keep |
| `packages/core/src/lib/plugin/SlatePlugin.ts` | 100 | keep | Core plugin types | Core typecheck, forbidden scan | Keep |
| `packages/core/src/lib/plugin/BasePlugin.ts` | 100 | keep | Core plugin API | Core typecheck, forbidden scan | Keep |
| `packages/core/src/lib/editor/SlateEditor.ts` | 100 | keep | Core editor type surface | Tightened generic boundaries, Core typecheck, forbidden scan | Keep |
| `packages/core/src/lib/editor/withPlite.ts` | 100 | keep | Core editor setup | Dead scaffold removed, Parser/DOM regression fixed, `check:core` | Keep |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| Six named Core files score gate | `plate-next` | Named files may still contain drift, bridge leftovers, or type regression | Six target files plus focused Core specs/typecheck/lint | keep | Closed |
| ParserPlugin/DOM clipboard regression | Core DOM + Plite DOM | Plite DOM clipboard fallback displaced ParserPlugin ownership | `DOMPlugin.ts`, `with-dom.ts`, `dom-clipboard-runtime.ts`, Parser/DOM specs | keep | Closed |
| Target support audits | `plate-next` | Untracked/extracted or forbidden bridge files could invalidate score `100` | forbidden scan and `git ls-files --others` inventory | keep | Closed |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| Target/support directories | zero rows | `git ls-files --others --exclude-standard packages/core/src/lib/plugins/node-id packages/core/src/lib/plugin packages/core/src/lib/editor packages/core/src/lib/plugins/dom packages/plite-dom/src/plugin \| sort` returned no output | no extracted-file blocker | command exit `0`, empty output |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| none | no unrelated package failure remained in recorded proof | N/A | N/A |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Removed dead scaffolds in `withPlite.ts`; tightened `SlateEditor.ts` generic/type boundaries; made Plite DOM text fallback run inside `editor.update`; added Plite DOM clipboard opt-out; Core DOM plugin opts out so ParserPlugin owns insertion |
| tests/proof | No test source changed in this packet; focused Core/Plite DOM proof commands passed |
| docs/templates/skills | Updated this autogoal plan |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Plite DOM clipboard opt-out name | It is a small new Plite DOM option introduced to preserve Plate ParserPlugin ownership | `packages/plite-dom/src/plugin/with-dom.ts` | Keep `clipboard?: false`; it is honest and narrow |

Findings:
- The six named Core files can score `100`. The only real regression found was
  not inside a target file: Core DOM had accidentally become the clipboard
  insertion owner, which broke ParserPlugin replacement semantics.

Decisions and tradeoffs:
- Keep the six named files.
- Keep the Plite DOM support fix and Core DOM opt-out.
- Do not add a rename pass or broad Core sweep inside this named-file packet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `pnpm check:core` exposed ParserPlugin text fallback failure | 1 | Move fallback into `editor.update` instead of patching ParserPlugin expectations | Fixed in Plite DOM text fallback |
| First DOM fallback fix made ParserPlugin replacement spec fail | 1 | Stop Core DOM from owning clipboard insertion | Fixed with `pliteDom({ clipboard: false })` in Core DOM plugin |

Verification evidence:
- `pnpm --filter @platejs/core exec bun test src/lib/plugins/node-id/NodeIdPlugin.spec.tsx src/lib/plugin/createBasePlugin.spec.ts src/lib/plugin/createBasePlugin.typed.spec.ts src/lib/editor/withPlite.spec.ts` passed: 71 tests.
- `pnpm --filter @platejs/core typecheck` passed.
- `pnpm --filter @platejs/core lint` passed.
- `pnpm --filter @platejs/core exec bun test src/lib/plugins/ParserPlugin.spec.ts src/lib/plugins/dom/DOMPlugin.spec.ts src/lib/plugins/node-id/NodeIdPlugin.spec.tsx src/lib/plugin/createBasePlugin.spec.ts src/lib/plugin/createBasePlugin.typed.spec.ts src/lib/editor/withPlite.spec.ts` passed: 85 tests.
- `pnpm --filter @platejs/core typecheck && pnpm --filter @platejs/plite-dom typecheck` passed.
- `pnpm --filter @platejs/plite-dom lint` passed.
- `pnpm --filter @platejs/plite-dom test` passed: 133 tests.
- `pnpm --filter @platejs/plite-dom typecheck && pnpm --filter @platejs/core typecheck` passed.
- `pnpm check:core` passed: Core tests 706 pass; Plite tests 1887 pass, 85 skip; typecheck/lint stages passed.
- Forbidden bridge/compat scan across target/support files returned no output.
- Untracked/extracted inventory across target/support directories returned no output.

Final handoff contract:
- target surface and mode: named six-file Plate Next score gate
- files/APIs reviewed: `NodeIdPlugin.ts`, `createBasePlugin.ts`,
  `SlatePlugin.ts`, `BasePlugin.ts`, `SlateEditor.ts`, `withPlite.ts`
- broad Core drift score coverage: not in scope; named rows complete
- best Plate v2 recommendation: keep all six target files in current owners;
  keep Plite DOM support fix and Core DOM clipboard opt-out
- verdict matrix summary: six rows scored `100`
- Plite/Plate gaps or blockers: none remain
- related Core sweep query/matches/patched/deferred: DOM query found five
  expected matches, three support files changed, zero deferred
- changes made: see Changed list
- tests/proof commands: see Verification evidence
- old compatibility names audited: forbidden scan returned no output
- needs attention: only optional review of the Plite DOM `clipboard?: false`
  option name
- next best Plate Next packet: continue ordinary one-file review mode; no
  blocker from these six files

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final score-gate closeout |
| Where am I going? | Mark goal complete after mechanical plan check |
| What is the goal? | Score the six named Core files `>95` with no regression/no drift/type proof |
| What have I learned? | The named files are clean; the real bug was DOM clipboard ownership |
| What have I done? | See Timeline |

Timeline:
- 2026-07-01T23:52:11.814Z Goal plan created.
- 2026-07-02 Score-gated six named files, removed target drift, fixed support
  regression, ran focused proof, source audits, and `check:core`.

Open risks:
- None blocking for the six named files. The only taste item is whether the
  Plite DOM opt-out should stay named `clipboard?: false`; recommendation is
  yes.
