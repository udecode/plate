# plate-next nodes set block toggle sweep

Objective:
Sweep Core `nodes.set` block toggles; done when every current `nodes.set` call is classified, block-toggle misuse is patched, and focused Core proof passes.

Goal plan:
docs/plans/2026-07-04-plate-next-nodes-set-block-toggle-sweep.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: "ok scan for all other nodes.set we did use, if we means blocks.toggle instead" followed by "go"
- mode: named API sweep, not broad Core sweep
- target surface: `editor.update.nodes.set` / transaction `nodes.set` usages in Core and directly related Plite package APIs
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: N/A: user asked for all `nodes.set` usages, not every Core file
- correction-triggered related Core sweep: required for `nodes.set({ type: ... })`, `blocks.toggle`, and legacy `toggleBlock` patterns
- completion threshold summary: all `nodes.set` matches classified; semantic block toggles use `blocks.toggle`; legitimate property writes stay `nodes.set`; focused tests/typecheck/lint pass

First checkpoint:
- Copy every explicit prompt requirement into this plan before implementation:
  target, duration, non-goals, stop condition, proof commands, final handoff,
  and whether the user asked for `sweep`, `all core`, `full-loop`, or an
  equivalent broad Core review.
- If broad Core sweep is in scope, fill the Core drift ledger rows in this
  plan before closing any packet. Keep this template-only.

Timed checkpoint:
- requested duration: N/A: no duration requested
- semantics: N/A: no timed loop
- initial confidence score: N/A: static API sweep with command proof
- improvement loop: N/A: close when sweep/proof gates pass
- final score / loop closure: N/A: not a timed scorecard goal

Completion threshold:
- Done state: every current `nodes.set` usage in the scoped search is reviewed and either left as a legitimate property update or patched to `blocks.toggle` when it changes block type semantically.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-04-plate-next-nodes-set-block-toggle-sweep.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: run focused Core tests that cover patched owners, then Core typecheck/lint
- package proof: `pnpm --filter @platejs/core typecheck`; `pnpm --filter @platejs/core lint`
- source audits: `rg -n "nodes\\.set|blocks\\.toggle|toggleBlock" packages/core/src packages/core/type-tests packages/plite/src packages/plite/test --glob '!**/dist/**'`
- related Core sweep query / match count / patched count / deferred count:
  record after scan
- Plite/Plate gap ledger: no known gap before scan; record if found
- broad Core drift ledger gate: N/A: not broad Core sweep
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-04-plate-next-nodes-set-block-toggle-sweep.md`

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
- allowed edit scope: files containing bad `nodes.set` block-toggle migrations, tests for those owners, and this plan
- package/API surfaces: Core plugin/runtime code and Plite block toggle API only if the scan proves an API gap
- docs/browser surfaces: N/A unless public docs/examples contain the same bad API shape
- non-goals: no broad Core file-by-file review, no rename pass, no package sweep, no Plate v2 API redesign beyond this `nodes.set` classification
- out-of-scope package errors: ignore non-Core failures unless caused by this patch

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- Stop only if a `nodes.set` call is semantically ambiguous and source/tests cannot determine whether it should toggle block type or update props.

Current verdict:
- verdict: keep current `nodes.set` call sites; zero additional `blocks.toggle` migrations needed
- confidence: high after source audit, focused input-rule proof, Core typecheck, and Core lint
- next owner: plate-next
- keep / revert / quarantine call: keep
- reason: only semantic toggle sites already use `blocks.toggle`; remaining Core `nodes.set({ type })` is the direct input-rule block conversion path, matching main's setNodes behavior

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Target copied: scan all other `nodes.set` usages and patch only those that should be `blocks.toggle`. |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` read fully. |
| Active goal checked or created | yes | `get_goal` returned none; created goal for this plan. |
| Mode classified as named packet vs broad Core sweep | yes | Named API sweep, not broad Core sweep. |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Use Plite `blocks.toggle` for semantic block toggles; no old `toggleBlock`/`tf` compat. |
| Broad Core drift ledger initialized when in scope | no | N/A: this is a symbol sweep, not full Core file review. |
| Source of truth and allowed workspace recorded | yes | Current checkout `/Users/zbeyens/git/plate-2`; compare `origin/main` only as behavior evidence when needed. |
| Output budget strategy recorded | yes | Use focused `rg` and short file slices; no broad manifest streaming. |
| Public API fork routing checked | yes | No public API fork expected; route to `plate-plan` only if Plite lacks required block-toggle default support. |
| Gap policy checked | yes | Record Plite/Plate gap instead of local workaround if scan exposes one. |
| Related Core sweep policy checked | yes | Sweep `nodes.set`, `blocks.toggle`, and `toggleBlock` patterns after corrections. |
| Review-mode rename freeze checked | yes | No renames planned. |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan before implementation. Evidence: target/scope/proof rows above.
- [x] Mode classified: named file/API packet, broad Core sweep, package sweep,
      docs/API mismatch, or public API plan.
- [x] Best Plate v2 call recorded for every reviewed target: `cut`,
      `move-to-plite`, `keep-in-plate`, `private-bridge-with-deletion-gate`,
      `Plite gap`, `Plate gap`, or `blocker`. Evidence: review matrix below.
- [x] Legacy/backcompat decision recorded: no public compat alias, shim,
      duplicate Plate wrapper around Plite, old command fallback, or old docs
      path is kept unless explicitly accepted with deletion gate. Evidence: no `toggleBlock` / `editor.tf` compatibility path added.
- [x] Hack check recorded: no bridge/helper dump, broad `any` cast, fake
      alias, or displaced product/plugin behavior is kept as a shortcut. Evidence: no runtime code changed in this sweep.
- [x] Gap ledger updated for every blocker: exact missing Plite or Plate
      capability, why local workaround is wrong, smallest owner, and proof. Evidence: no Plite/Plate gap found.
- [x] After every correction, related Core sweep row is added with query,
      match count, patched count, deferred count, and remaining risk. Evidence: sweep ledger below; patched count 0 for this pass.
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
      capped file is raised to 100 from green checks alone. Evidence: no bridge touched or used for this API decision.
- [x] Review matrix is filled for every inspected file/API/helper.
- [x] Public API forks are routed to `plate-plan` before implementation. Evidence: no public fork required.
- [x] Review-mode rename freeze applied: Added/Deleted rename noise is either
      restored to current `HEAD` names or mapped in `docs/plans/pre-renaming.md`
      with an explicit reason it cannot be restored in this packet. Evidence: no rename touched.
- [x] Extracted-file recovery gate closed: every untracked/extracted file in
      scope has an inventory row and bucket, with `origin/main` owner checked
      before keeping any new path/name. Evidence: N/A, no extracted-file scope.
- [x] Safe cleanup packets are kept, reverted, or quarantined with proof. Evidence: keep; no extra patch required.
- [x] Focused package proof is run after meaningful code changes. Evidence: input-rule tests and Core typecheck/lint passed.
- [x] `pnpm brl` is run when exports/barrels change. Evidence: N/A, no exports/barrels changed.
- [x] Old compatibility names are source-audited when cut. Evidence: audited `toggleBlock` and `blocks.toggle`; no cut in this pass.
- [x] Changed list, top drift rows, needs-attention rows, and next owner are
      filled before final response.
- [x] Output budget discipline followed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the proof commands named in this plan | `nodes.set` audit complete: 60 total package matches, 15 type-setting lines, 5 Core matches, 1 Core type-setting call; no additional bad toggles. |
| Broad Core drift ledger coverage | no | N/A: named API sweep, not broad Core sweep | N/A |
| Score gate | no | N/A: no broad drift scoring requested | N/A |
| Best Plate v2 recommendation | yes | Record the recommended current shape and rejected legacy/hack alternatives for the reviewed target | Keep `nodes.set` for direct block conversion/property writes; use `blocks.toggle` only for semantic toggle/wrap actions. |
| Plite/Plate gap ledger | yes | Record blockers or N/A when no gap blocks the target | N/A: no gap blocks the current call sites. |
| Related Core sweep after correction | yes | For each correction, run and record same-class Core search/review results | Sweep done for `nodes.set`, type-setting `nodes.set`, `blocks.toggle`, and `toggleBlock`; patched 0 additional files. |
| Package/API proof | yes | Run focused typecheck/test/build or record N/A | `pnpm --filter @platejs/core exec bun test src/react/utils/inputRules.spec.tsx src/react/plugins/paragraph/ParagraphPlugin.tsx` -> 17 pass; `pnpm --filter @platejs/core typecheck` -> pass. |
| Non-Core package error triage | yes | If a proof command reports non-Core failures, classify as named/touched/Core-regression or out-of-scope package drift | N/A: proof commands passed. |
| Source audit | yes | Run exact audit for removed compatibility names or record N/A | `rg` audits for `nodes.set`, type-setting `nodes.set`, `blocks.toggle`, and `toggleBlock` completed. |
| Rename ledger | no | N/A: no rename in scope | N/A |
| Extracted-file inventory | no | N/A: no extracted-file review in scope | N/A |
| Autoreview / review | no | N/A: narrow mechanical API correction with focused proof | N/A |
| Final lint/check | yes | Run scoped lint/check or record N/A | `pnpm --filter @platejs/core lint` -> pass. |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | See changed list / needs attention sections below. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-04-plate-next-nodes-set-block-toggle-sweep.md` | Final rerun after phase-row repair must pass. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| `nodes.set` API sweep | complete | Source audits found no additional block-toggle misuse; focused input-rule test, Core typecheck, and Core lint passed. | Close goal. |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/core/src/react/plugins/paragraph/ParagraphPlugin.tsx` shortcut handler | 0 | main-parity-cleanup already applied before this sweep | Core React paragraph plugin | Uses `editor.update.blocks.toggle(type, { defaultType: editor.plugin('p').type })` for semantic toggle. | keep |
| `packages/core/src/lib/plugins/input-rules/createInputRules.ts` mode `wrap` / `toggle` | 0 | keep-in-plate with Plite API | Core input-rules plugin | Explicit modes already call `editor.update.blocks.toggle(node, { defaultType: editor.plugin('p').type, wrap })`. | keep |
| `packages/core/src/lib/plugins/input-rules/createInputRules.ts` default conversion path | 0 | keep-in-plate direct conversion | Core input-rules plugin | `origin/main` used `editor.tf.setNodes({ type: node })`; this is conversion, not toggle. | keep |
| Core `nodes.set` property writes (`Plate.slow`, `PlateContent.spec`, `plateChangeHandlers.spec`, `NodeIdPlugin`) | 0 | keep-in-plate / test proof writes | Core tests/plugins | Writes `path`, `variant`, or node-id props, not block type toggles. | keep |
| Plite / Plite React `nodes.set` contract tests | 0 | keep-in-plite | Plite package tests | Tests direct set-node primitive behavior; converting to toggle would destroy coverage. | keep |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| Semantic block toolbar/shortcut toggles | `editor.update.blocks.toggle(type, { defaultType: editor.plugin('p').type })` in Plate call sites until Plite owns the default block type. | `editor.update.nodes.set({ type })`; old `editor.tf.toggleBlock`; hardcoded fallback to raw `'p'` in Plate. | Toggle must flip active type back to the configured paragraph type. | None for this sweep. |
| Input-rule direct conversion | `editor.update.nodes.set({ type: node }, { match: block })` | `blocks.toggle` for non-toggle conversion. | Markdown/input conversion should set the target type; it should not toggle off when the block is already active. | None. |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | None for current sweep | N/A | N/A | N/A | No blocker. Later optional improvement: Plite/Plate could install default block type so Plate call sites can omit `defaultType`. |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| Paragraph shortcut changed to `blocks.toggle` in prior packet | `rg -n "editor\\.update\\.nodes\\.set\|tx\\.nodes\\.set\|editor\\.nodes\\.set" packages/core/src packages/core/type-tests` | 5 Core matches | 0 | 0 | Low: all Core matches are property writes or direct conversion. |
| Type-setting false-positive guard | `rg -n -U "nodes\\.set\\([\\s\\S]{0,140}\\btype\\b" packages/core/src packages/core/type-tests` | 1 Core call printed across 2 lines | 0 | 0 | Low: `createInputRules` default path is set-not-toggle by design and matches main. |
| Whole package awareness | `rg -n "nodes\\.set\\(" packages --glob '!**/dist/**' --glob '!**/.next/**'` | 60 total matches | 0 | 0 | Low: non-Core matches are Plite primitive tests, app-owned direct transforms, or property writes. |
| Toggle compatibility audit | `rg -n "blocks\\.toggle\\(\|toggleBlock" packages/core/src packages/core/type-tests packages/plite/src packages/plite/test` | 9 matches | 0 | 0 | Low: no Core `toggleBlock` legacy call remains in scoped search. |

Core drift ledger:
- Applies: N/A: named API sweep, not broad Core sweep
- Manifest command: N/A
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: this table or a linked artifact summarized here
- Expected row count: N/A
- Actual row count: N/A
- Missing row count: N/A
- Extra row count: N/A
- Score gate: N/A
- Top drift rows: N/A

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| N/A | N/A | N/A | N/A | Broad Core sweep not requested. | N/A |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| `nodes.set` toggle sweep | Core / Plite boundary | Other migrated `nodes.set({ type })` calls may mean semantic block toggle. | Source audits + focused input-rule tests + Core typecheck/lint. | keep current code; no additional patch. | Optional later default-block-type ergonomics in Plite/Plate. |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| N/A | N/A | N/A | No extracted-file scope. | N/A |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| N/A | N/A | Proof commands passed. | N/A |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | None in this sweep; earlier paragraph toggle patch remains the only related code correction. |
| tests/proof | Ran focused input-rule test, Core typecheck, Core lint, source audits. |
| docs/templates/skills | Updated this goal plan. |
| reverted/quarantined packets | None. |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Optional default block type ergonomics | Plate call sites still need `defaultType: editor.plugin('p').type` for semantic toggles. | `packages/core/src/react/plugins/paragraph/ParagraphPlugin.tsx` | Not needed for this sweep; consider later Plite/Plate default-block-type install so call sites can omit the option. |

Findings:
- `createInputRules.ts` has the only Core `nodes.set({ type })` call after paragraph; it is a direct conversion path, not a toggle.
- Plite and Plite React `nodes.set({ type })` occurrences are primitive/contract tests or app-owned direct transforms, not Plate migration drift.

Decisions and tradeoffs:
- Keep `nodes.set` for direct set-node primitive coverage and one-way block conversion.
- Use `blocks.toggle` for user-facing semantic toggle shortcuts/actions.
- Keep `defaultType: editor.plugin('p').type` in Plate toggle call sites for now because Plite's raw default is `'p'`.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `check-complete` plan-shape failure | 1 | Add missing final gate evidence and phase row | Patched plan shape, then reran checker. |

Verification evidence:
- `rg -n "nodes\\.set\\(" packages --glob '!**/dist/**' --glob '!**/.next/**'` -> 60 total matches reviewed by category.
- `rg -n -U "nodes\\.set\\([\\s\\S]{0,140}\\btype\\b" packages/core/src packages/core/type-tests --glob '!**/dist/**'` -> one Core call in `createInputRules.ts`, keep.
- `pnpm --filter @platejs/core exec bun test src/react/utils/inputRules.spec.tsx src/react/plugins/paragraph/ParagraphPlugin.tsx` -> 17 pass.
- `pnpm --filter @platejs/core typecheck` -> pass.
- `pnpm --filter @platejs/core lint` -> pass.

Final handoff contract:
- target surface and mode: named API sweep for `nodes.set` vs `blocks.toggle`.
- files/APIs reviewed: Core `nodes.set` call sites, package-wide type-setting `nodes.set` call sites, `blocks.toggle` / `toggleBlock` audit.
- broad Core drift score coverage: N/A, not requested.
- best Plate v2 recommendation: use `blocks.toggle` only for semantic toggles; keep `nodes.set` for direct conversion/property writes.
- verdict matrix summary: no additional bad call sites found; keep current code.
- Plite/Plate gaps or blockers: none blocking; optional future default block type ergonomics.
- related Core sweep query/matches/patched/deferred: see sweep ledger; patched 0, deferred 0.
- changes made: plan only in this sweep.
- tests/proof commands: focused input-rule test, Core typecheck, Core lint, source audits.
- old compatibility names audited: `toggleBlock` audited; no scoped Core legacy use found.
- needs attention: optional default-block-type ergonomics only.
- next best Plate Next packet: continue reviewing Core plugin call sites that still expose old Plate-style imperative command ergonomics.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Checkpoint zero |
| Where am I going? | Close the named API sweep. |
| What is the goal? | Sweep Core `nodes.set` block toggles and prove no additional bad call sites remain. |
| What have I learned? | No additional toggle misuse exists; remaining Core `nodes.set({ type })` is direct conversion. |
| What have I done? | Completed source audit and proof; updated plan. |

Timeline:
- 2026-07-04T07:24:10.210Z Goal plan created.
- 2026-07-04T07:26Z Created active goal and filled checkpoint zero.
- 2026-07-04T07:30Z Audited `nodes.set`, type-setting `nodes.set`, `blocks.toggle`, and `toggleBlock` call sites.
- 2026-07-04T07:32Z Ran focused input-rule test, Core typecheck, and Core lint successfully.

Open risks:
- Low: optional ergonomics debt remains around installing a Plate-aware default block type so `blocks.toggle(type)` can omit `defaultType`.
