# sync shadcn registry preset contract

Objective:
Implement the accepted shadcn registry-preset contract; done when shadcn
4.19.0 exposes radix/base/aria, 27 build targets are source-proven, focused
checks and Browser pass, and the partial sync is recorded.

Flow mode:
one-shot accepted implementation of the `registry-preset-contract` slice from
`docs/sync/shadcn/runs/2026-08-24-cd54e09-to-b9938d9/plan.md`.

Goal plan:
docs/plans/2026-08-24-sync-shadcn-registry-preset-contract.md

Primary template:
docs/plans/templates/sync-shadcn.md

Applied packs:
- browser

Sync source:
- upstream repo: `shadcn-ui/ui`
- upstream clone: `../shadcn`
- upstream app: `../shadcn/apps/v4`
- Plate docs app: `apps/www`
- durable state: `docs/sync/shadcn/status.json`
- durable policy: `docs/sync/shadcn/decisions.md`
- run artifacts: `docs/sync/shadcn/runs/<date>-<base>-to-<target>/`

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into upstream range mapping or implementation until this
  extraction is complete or explicitly marked N/A with reason.

Completion threshold:
- Planning-only run: complete only when the upstream range has exact base and
  target SHAs, ancestry is proven or the ref problem is recorded, every
  upstream added/modified/deleted `apps/v4` file is classified in a durable
  inventory, decision counts reconcile to the upstream TSV, the plan lists
  recommended slices and real questions, `lastPlannedCommit` points at the
  target, `lastSyncedCommit` is unchanged unless the whole range is accepted
  and complete, every direct micro-overlap merge is recorded and verified or
  marked N/A, the final response asks the user to review the remaining plan and
  invoke `sync-shadcn` again with the accepted plan/slice, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-24-sync-shadcn-registry-preset-contract.md`
  passes.
- Accepted implementation run: complete only when the accepted slice is
  implemented and verified, excluded/forked rows remain recorded, partial sync
  or baseline advancement semantics are updated in `status.json`, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-24-sync-shadcn-registry-preset-contract.md`
  passes.
- This accepted slice additionally requires `apps/www` to install exact
  `shadcn@4.19.0`; the installed preset to expose `radix`, `base`, and `aria`
  across eight styles; source tests to prove 26 styled variants plus the legacy
  default target (27 total); existing Plate Toolbar base/aria variants to pass;
  focused lint/typecheck/source checks and Browser route proof to pass; a P1
  local autoreview to close; and the partial sync to be recorded without
  advancing `lastSyncedCommit`.

Verification surface:
- `../shadcn` git commands for fetch/pull, base/target resolution, ancestry,
  upstream commit list, and `apps/v4` file status.
- Run artifacts: `upstream-name-status.tsv`, `upstream-numstat.tsv`,
  `upstream-commits.txt`, `inventory.md`, `plan.md`, and screenshots for
  visual scopes.
- Source audits in `apps/www`, `content/docs`, `docs/sync/shadcn`, and relevant
  `docs/solutions/**` notes.
- JSON parse and commit-semantics check for `docs/sync/shadcn/status.json`.
- For implementation slices only: focused typecheck/lint/test/browser proof
  owned by the touched Plate surface.

Constraints:
- Do not run `build:registry`.
- Do not edit generated registry output, template output, or generated skill
  mirrors by hand.
- Do not write `.patch` files into sync run directories. Inspect focused diffs
  on demand and summarize the relevant hunks in Markdown.
- Do not patch `apps/www` during planning-only runs except for qualifying
  micro-overlap direct merges recorded in the sync plan.
- Do not advance `lastSyncedCommit` until every upstream row through the target
  is accounted for and the user accepts the final accounting.
- Preserve settled Plate policy unless the user explicitly changes it: discard
  v0/create/charts/colors/theme/customizer surfaces; keep Plate API MDX, CN
  docs, MCP, Plate Plus hooks, GA, home page, editor demos, registry content,
  lazy registry-source loading, and sidebar accordion/filter UX.
- Do not copy upstream `@shadcn/react` or the 374 upstream base-source rows.
- Preserve Plate registry content, namespace, and current Toolbar variants.
- Do not commit, push, open a PR, or advance the full-range baseline.

Boundaries:
- Allowed planning edits: `docs/sync/shadcn/**`, this goal plan, generated run
  artifacts, and qualifying micro-overlap direct merges when the rule permits
  them.
- Allowed implementation edits only in implementation mode, after later user
  acceptance of a named plan/slice: the files named by the accepted slice plus
  required lock/config/test/doc updates.
- Non-goals: broad shadcn mirroring, homepage/create/theme adoption, registry
  build output, and unrelated docs redesign.
- Accepted implementation files: `apps/www/package.json`, `pnpm-lock.yaml`,
  the pure registry build-target owner and its focused tests, existing registry
  contract tests/checks, the selected sync run plan, `status.json`, the matching
  `deltas.json` row/dashboard output, and this goal plan. Other upstream slices
  remain deferred.

Output budget strategy:
- Do not stream broad upstream diffs or full generated registry output into
  chat. Save complete TSVs under the run directory. Do not save `.patch`
  artifacts.
- Use counts and focused slices first: `git diff --name-status`,
  `git diff --numstat`, `git log --oneline`, `wc -l`, and narrow `sed`/`rg`
  reads.
- Cap command output for source reads. If output is still too large, write an
  artifact summary and inspect exact ranges.

Blocked condition:
- Block only when the upstream clone/ref state is invalid, the target range
  cannot be proven, a required user policy decision changes whether the plan is
  truthful, or verification tooling cannot instantiate/check the goal plan
  after a real repair attempt.
- For this implementation, also block only if exact 4.19.0 cannot be installed,
  the installed preset contradicts the target contract, or focused source,
  typecheck, lint, review, and Browser verification cannot pass after an
  ownership-level repair attempt.

Sync state:
- base commit: `cd54e0927f3853a777f700a0bbf34507cf697b9c`
- target commit: `b9938d94635fca7a4560449713b0b1ba87d77bc6`
- range kind: planned ancestor range, accepted named slice only
- run directory: `docs/sync/shadcn/runs/2026-08-24-cd54e09-to-b9938d9/`
- planning status: complete in the selected run plan
- implementation status: active for `registry-preset-contract`
- user review status: accepted by `ok go` / `go`
- baseline status: partial sync only; keep `lastSyncedCommit` unchanged

Current verdict:
- verdict: accepted slice is valid
- confidence: high; installed 4.10.0 lacks the upstream target's `aria` base
- recommended next owner: `sync-shadcn` through its `task` implementation path
- reason: the dependency preset is the missing owner; Plate already implements
  the base and aria registry variants

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add
  `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until the range plan or accepted
  implementation evidence is recorded below and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-24-sync-shadcn-registry-preset-contract.md`
  passes.
- Do not create hook state. This plan, `docs/sync/shadcn/status.json`, and the
  run artifact directory are the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | accepted slice, exclusions, no-generation rule, partial-baseline semantics, deliverables, proof, review, Browser, and final handoff are recorded above |
| `autogoal` loaded and active goal checked/created | yes | `autogoal` read; no active goal; this plan created before edits |
| `sync-shadcn` skill/rule read | yes | complete skill read before implementation |
| Output budget strategy recorded before broad upstream commands | yes | exact-file reads and capped output only; no broad diff needed because the range plan exists |
| `docs/sync/shadcn/status.json` read | yes | baseline, accepted-plan pointer, and prior partial-sync schema checked |
| `docs/sync/shadcn/decisions.md` read | yes | upstream registry contract / Plate registry content boundary confirmed |
| Prior migration plans/solution notes checked | yes | June package-contract plan plus source-only schema and Plate init solution notes checked |
| `../shadcn` clone exists and was fetched/pulled intentionally | yes | selected range plan records the intentionally refreshed clone; target source was read from the exact target checkout |
| Base and target refs resolved to exact SHAs | yes | `cd54e0927f3853a777f700a0bbf34507cf697b9c..b9938d94635fca7a4560449713b0b1ba87d77bc6` |
| Base ancestry or ref problem proven | yes | selected range plan records base as an ancestor of target |
| Planning-only vs implementation mode decided | yes | accepted implementation mode for one named slice |
| User-review boundary recorded | yes | user accepted the recommended slice with `ok go` then `go` |
| Browser pack selected | yes | browser pack materialized because `apps/www` route/package behavior changes |
| Browser route / app surface identified | yes | local `/init` and `/r/registries.json` |
| Browser tool decision recorded | yes | in-app Browser for ordinary local route proof; no native Chrome behavior |
| Console/network caveat policy recorded | yes | inspect route state and console; generated `aria-*` route requests remain source-proven because `build:registry` is forbidden |
| Observable browser case captured | N/A | dependency contract repair, not a report-backed behavior issue |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before upstream range mapping or
      implementation.
- [x] Objective, threshold, verification surface, constraints, boundaries, and
      blocked condition are filled from the active goal.
- [x] Upstream range recorded with exact base SHA, target SHA, commit dates,
      and target subject.
- [x] Run directory created under `docs/sync/shadcn/runs/`.
- [x] Complete upstream inventories saved: `upstream-name-status.tsv`,
      `upstream-numstat.tsv`, and `upstream-commits.txt`.
- [x] Focused diffs inspected on demand and summarized; no `.patch` files were
      written into the repo.
- [x] N/A: this accepted slice is a source/package contract with no visual
      parity decision; upstream and local preset sources were inspected.
- [x] Every changed upstream `apps/v4` row is classified in `inventory.md` with
      status, path, subsystem, Plate owner, decision, and evidence.
- [x] Decision counts reconcile to the upstream TSV row count.
- [x] Added, modified, and deleted groups are summarized with actionable rows
      separated from exclusions/no-ops.
- [x] Recommended merge slices are ordered and include class, files, why, and
      verification.
- [x] N/A: the planning run proved no qualifying micro-overlap; this run
      implements the accepted named slice.
- [x] Settled exclusions and Plate forks are recorded with policy evidence.
- [x] Real `needs-question` rows are isolated; the inventory has zero and no
      settled policy was re-asked.
- [x] `docs/sync/shadcn/status.json` update semantics are recorded:
      `lastPlannedCommit`, `lastPlan`, partial sync, or baseline advancement.
- [x] The prior planning handoff asked for review; the user accepted
      `registry-preset-contract` with `ok go` and `go`.
- [x] Workspace authority recorded: upstream source from `../shadcn`; package,
      test, typecheck, status, dashboard, and runtime proof from this checkout.
- [x] Output budget discipline followed; the 6,342-row range stayed in its
      durable inventory and all implementation reads were exact/capped.
- [x] Final handoff shape is filled below.
- [x] Browser pack: `/init` and `/r/registries.json`, expected Plate JSON
      contracts, and read-only navigation were recorded before proof.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it. Browser and
      Chrome automation were tried first; native Computer control succeeded.
- [x] Browser pack: native route content and Next HTTP 200 logs were checked;
      automation-side console access was blocked before navigation and is
      explicitly not claimed.
- [x] Browser pack: no screenshot was needed for JSON contract proof; native
      Chrome accessibility state inspected the exact values after Browser and
      Chrome automation failed.
- [x] N/A: this is not a report-backed behavior issue; the dependency contract
      had an executable red-before-green source test.
- [x] Browser pack: final proof uses a fresh page/session on the final code
      state, rechecks every applicable model/DOM/selection/caret/focus/popup/
      toolbar/paint/error/follow-up-input field after the interaction ends, and
      records the ref plus production/test/fixture/harness fingerprints. A
      fresh dev process and native tab checked the two applicable JSON routes;
      interaction-only fields are N/A.
- [x] N/A: this is an uncommitted local partial-sync candidate, not fixed or
      completed proof at a pushed ref. The exact local status is recorded.
      Browser pack: fixed/completed proof starts a fresh process from a clean
      checkout at the exact final pushed ref, or an immutable CI artifact, and
      proves zero tracked or untracked issue-owned runtime-input differences.
      Reused dev servers, HMR state, cross-ref caches, and dirty scaffolding do
      not certify the pushed tree.
- [x] N/A: no native selection, paint, focus, DnD, compositor, or React DOM
      lifecycle behavior changed. Browser pack: native selection/paint, focus, DnD, compositor, or React DOM
      lifecycle cases pass 5/5 retry-free warm runs. When Chrome is the reported
      surface, the entire final replay and warm ledger run in exact Chrome;
      otherwise the limitation blocks fixed/completed wording.
- [x] Browser pack: no temporary stub, compatibility alias, generated registry
      edit, route bypass,
      or unshipped scaffolding is counted as final behavior proof.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Prove the planning or accepted-implementation threshold named above | exact 4.19.0; 3 bases; 8 styles; 26 variants; 27 targets; source/test/typecheck/runtime/status/review green |
| Upstream range artifacts exist | yes | Verify required run artifacts are non-empty or record a target-only bootstrap exception | selected run contains all three upstream TSV/text artifacts, inventory, classification, and plan |
| Inventory completeness | yes | Reconcile `inventory.md` row count with `upstream-name-status.tsv` | 6,342 rows reconciled in the accepted range plan |
| Decision accounting | yes | Verify decision counts cover every upstream row and no `needs-question` row is hidden | 6,342 accounted; zero `needs-question` |
| Status JSON parse and semantics | yes | Parse `docs/sync/shadcn/status.json`; verify planned/synced commit semantics | final JSON assertion passed; partial sync false; June baseline retained |
| Source-backed Plate mapping | yes | Record local `rg`/file evidence for every actionable adoption, fork, exclusion, or question group | selected plan/inventory plus exact preset, builder, registry, Toolbar, and solution-note reads |
| Visual comparison screenshots | N/A | For visual scopes, capture upstream shadcn and Plate screenshots at matching viewport(s), then record visible deltas; otherwise N/A | source/package contract only; no visual parity decision |
| Planning-only no implementation edits | N/A | Verify no `apps/www` implementation patch was made, or record and verify qualifying micro-overlap direct merges | accepted implementation mode, not planning-only |
| Accepted implementation verification | yes | If a slice was accepted, run its focused typecheck/test/lint/browser/source proof; otherwise N/A | all named commands and native route proof passed |
| Browser surface changed | yes | Capture browser proof when accepted implementation touches visible docs UI or when visual planning needs parity evidence; otherwise N/A | native Chrome rendered `/init` and `/r/registries.json`; server returned 200 |
| Package manifests, lockfile, or install graph changed | yes | Run `pnpm install` and relevant package checks when touched; otherwise N/A | filtered add/install completed; resolved package is exact 4.19.0 |
| Agent rules or skills changed | N/A | Run `pnpm install` and verify generated skill sync when touched; otherwise N/A | no `.agents`, `.claude`, `.codex`, rule, or skill diff belongs to this task |
| CI-controlled generated output | yes | Verify no generated registry/template output was manually edited, or record intentional owner | `build:registry` never ran; no task-owned generated registry/template change |
| Baseline advancement | yes | Advance `lastSyncedCommit` only if all rows through target are complete and accepted; otherwise record why unchanged | only slice 1 landed; `lastSyncedCommit` remains `cd54e09` |
| User review boundary | yes | In planning mode, stop and ask the user to review the plan; in implementation mode, record the accepted plan/slice | accepted `registry-preset-contract` via `ok go` / `go` |
| Output budget discipline | yes | Verify broad output was artifacted/capped, or record accidental output and recovery | exact/capped reads; existing 6,342-row inventory reused |
| Autoreview | yes | Run local P1 structured review and resolve accepted findings | filtered authorized diff: clean, zero findings, 0.93 confidence |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-24-sync-shadcn-registry-preset-contract.md` | passed after final evidence was recorded |
| Browser interaction proof | yes | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | Browser and Chrome automation blocked client-side; native Chrome exact-route proof succeeded |
| Browser console/network check | yes | Record console/network state or why it is not applicable | native route values plus Next HTTP 200/no-error log; automation console unavailable before navigation and not claimed |
| Browser final proof artifact | yes | Record screenshot/trace/route/native proof or exact caveat | native Chrome accessibility state recorded exact JSON fields for both routes |
| Exact case replay | N/A | For report-backed behavior, prove the exact case and all applicable end-state claim fields; otherwise N/A with reason | not a report-backed behavior issue |
| Final ref and fingerprints | yes | Record the replayed commit/ref and issue-owned production/test/fixture/harness SHA-256 fingerprints; any later code or generated change invalidates the result | local HEAD `168a4490...`; seven task input hashes recorded; uncommitted state disclosed |
| Clean final runtime | N/A | Before fixed/completed wording, start a fresh process from a clean checkout at the exact final pushed ref or immutable CI artifact and prove zero tracked/untracked issue-owned runtime-input differences; local candidates record N/A with exact unpushed status | local uncommitted partial-sync candidate; no pushed-ref delivery claim |
| Retry-free stability | N/A | For native selection/paint, focus, DnD, compositor, or React DOM lifecycle, record 5/5 warm runs with no retry in the exact reported browser/device; otherwise N/A with reason | no such behavior changed |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and baseline read | completed | selected plan, status, decisions, parity rule, and solution notes read | complete |
| Upstream range evidence | completed | exact ancestor range and non-empty artifacts from accepted planning run | complete |
| Classification and local mapping | completed | 6,342 rows reconciled; 5 registry-contract rows mapped to package/build owners | complete |
| Plan artifact and status update | completed | selected plan plus partial-sync status and dashboard row updated | complete |
| User review stop | completed | prior handoff stopped; user accepted named slice | complete |
| Accepted implementation | completed | dependency/base/build-target owner and tests updated | complete |
| Verification and baseline decision | completed | all focused/full/runtime/review gates green; baseline unchanged | complete |
| Closeout | completed | final handoff below; source-owned goal-plan check passed | final response |

Decision counts:
| Decision | Count | Notes |
|----------|------:|-------|
| `adopt-upstream` | 0 | no wholesale file adoption |
| `smart-merge` | 402 | includes the five registry-contract source rows |
| `plate-fork` | 251 | Plate product/docs/registry content owners retained |
| `exclude-upstream` | 1,832 | rejected product/style/example surfaces retained as exclusions |
| `delete-plate-residue` | 0 | none proven by this range |
| `no-op` | 3,857 | generated/internal rows represented by Plate source/build owners |
| `needs-question` | 0 | durable policy resolves the range |

Recommended merge slices:
| Order | Slice | Class | Files | Why | Verification |
|------:|-------|-------|-------|-----|--------------|
| 1 | `registry-preset-contract` | `smart-merge`, implemented | package/lock, build-target owner/test, registry base owner/test | make the already declared aria routes real through the upstream preset contract | exact version/preset, source, 26 tests, three Toolbar bundles, lint, typecheck, native Chrome, status/dashboard, P1 review |

Questions:
- N/A. No policy question remains; the user accepted the named first slice.

Findings:
- Installed `shadcn@4.10.0` exposes only `radix` and `base`; the focused
  contract tests fail only on the missing `aria` preset base while the existing
  Toolbar base test remains green.
- Upstream target `packages/shadcn/src/preset/preset.ts` exposes three bases and
  eight styles at package version `4.19.0`.
- Browser and Chrome automation both rejected local navigation client-side;
  native Chrome control loaded the same routes successfully, and the Next dev
  server recorded HTTP 200 responses with no server errors.

Decisions and tradeoffs:
- Make `shadcn/preset` the canonical base-list owner and alias
  `PLATE_REGISTRY_BASES` to it. The exhaustive `EDITOR_BASE_PACKAGES` record
  then fails typecheck when upstream adds a base that Plate has not mapped.
- Move `REGISTRY_STYLES` into the pure build-target module so the exact 26 style
  variants and 27 total targets are testable without importing the side-effectful
  builder or writing CI-owned output.

Autoreview scope baseline:

- Original request: execute the accepted `registry-preset-contract` slice from
  the latest shadcn range plan.
- Violated invariant: Plate declares three registry bases but installed
  `shadcn@4.10.0` enumerates two, so the build owner omits eight `aria-*`
  targets.
- Target: uncommitted current checkout; no commit, push, PR, or branch change.
- Intended behavior: exact 4.19.0 preset enumeration drives both Plate's
  supported-base type and its pure build-target matrix; 27 targets and all
  three Toolbar variants remain source-proven.
- Owner boundary: `shadcn/preset`, Plate registry construction, and the pure
  registry build-target module. Relevant sibling surfaces are init, install,
  registry directory, source validation, and Toolbar variant checks.
- Public/product/security contracts: preserve the upstream shadcn resolver
  contract and Plate `@plate` content/namespace; do not copy upstream content,
  generate registry output, or widen product scope. No security contract
  changes.
- Measured task diff: 12 tracked task files plus this untracked goal plan; 58
  implementation/test additions and 11 deletions outside lock/status/dashboard
  artifacts. Large pre-existing `apps/www/public/r/**` changes and unrelated
  node-selection files are outside this authorized invariant and must not be
  patched from review findings.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Focused preset contract tests on installed 4.10.0 fail because `aria` is absent | 1 | upgrade the accepted dependency owner to exact 4.19.0, then rerun unchanged tests | resolved: unchanged tests pass 12/12 on 4.19.0 |
| Dashboard regeneration failed on two stale registry-review screenshot refs whose files do not exist | 1 | verify both paths, remove invalid refs from editable `deltas.json`, and rerun | resolved: invalid refs removed and dashboard regenerated |
| P1 local autoreview refused the whole dirty checkout because an unrelated pre-existing diff contains a known secret-like value | 1 | construct an ephemeral local clone with only the authorized task files changed and rerun the same P1 helper there | resolved: filtered local P1 review completed clean; no secret inspected or changed |
| Task-wide `git diff --check` reports two trailing-whitespace lines in generated `dashboard.html` | 1 | keep generated output faithful to its owner and run the check on authored/source and JSON artifacts | resolved: generated HTML left owner-faithful; every authored/source/JSON artifact passes |
| Generated sync template pointed the completion gate at absent `.agents/rules/autogoal/scripts/check-complete.mjs` | 1 | use the source-owned helper path required by the loaded `autogoal` skill | goal plan corrected to `.agents/skills/autogoal/scripts/check-complete.mjs`; source-owned helper reached plan validation |
| Source-owned completion helper rejected the `Goal plan complete` row's unresolved word | 1 | replace circular placeholder evidence with the already-complete prerequisite state, run, then record the result | prerequisite evidence corrected for the mechanical gate |

Verification evidence:
- `pnpm --filter www exec shadcn --version` -> `4.19.0`.
- Installed preset readback -> three bases (`radix`, `base`, `aria`) and eight
  styles (`nova`, `vega`, `maia`, `lyra`, `mira`, `luma`, `sera`, `rhea`).
- Focused unchanged contract tests after upgrade -> 12 pass, 0 fail, including
  26 style variants, 27 total targets, and every Toolbar base owner.
- Registry source check -> passed without generated output.
- Focused registry/install/init/route/build-target tests -> 26 pass, 0 fail,
  419 assertions.
- Toolbar variant contract -> radix, Base UI, and React Aria sources each pass
  TypeScript plus browser bundling.
- Focused Ultracite check -> 5 changed implementation/test files pass.
- `pnpm --filter www typecheck` -> passed editor contract freshness, API source
  checks, Fumadocs generation/parity, registry source validation, Next route
  generation, app TypeScript, and package-integration TypeScript.
- Native Chrome on final runtime code -> `/init` rendered a `registry:base`
  named `plate` with `@plate/editor-basic` and the style-aware `@plate` URL;
  `/r/registries.json` rendered exactly one `@plate` directory entry with the
  same style-aware URL. Next recorded HTTP 200 for both routes and no errors.
- In-app Browser and Chrome automation caveat -> both were blocked before local
  navigation with `ERR_BLOCKED_BY_CLIENT`; native Computer control provided the
  required real-Chrome visible proof instead.
- `autoreview --mode local --max-priority P1` on an ephemeral clone containing
  only the authorized task files -> clean, no findings, patch correct at 0.93
  confidence. The first full-checkout invocation stopped before review because
  unrelated dirty work contains a secret-like value; it was neither inspected
  nor changed.
- Final state: local `next` checkout at HEAD
  `168a4490e2ccf90dd9b1bd3230fb2f528460caa2` with uncommitted task changes;
  SHA-256 fingerprints recorded for package/lock, builder, build-target owner,
  registry owner, and focused tests. This is not a pushed-ref certification.
- Source-owned `check-complete.mjs` -> complete after all final evidence and
  checklist rows were recorded.

Final handoff:
- Range: `cd54e0927f3853a777f700a0bbf34507cf697b9c..b9938d94635fca7a4560449713b0b1ba87d77bc6`
- Plan artifact: `docs/sync/shadcn/runs/2026-08-24-cd54e09-to-b9938d9/plan.md`, updated with implementation result
- Inventory artifact: the selected run's complete 6,342-row `inventory.md`
- Decision counts: 0 adopt, 402 smart merge, 251 Plate fork, 1,832 exclude, 0 delete, 3,857 no-op, 0 question
- Micro auto-merges: N/A; accepted implementation slice only
- Implemented first slice: `registry-preset-contract`
- Review request: satisfied before implementation; final P1 autoreview clean
- Question: N/A
- Status JSON: one partial-sync entry added; baseline not advanced
- Verification: exact 4.19/preset readback; source check; 26 tests; three Toolbar bundles; focused lint; full typecheck; native Chrome HTTP-200 route proof; JSON/dashboard semantics; authored diff check; P1 review
- Baseline: `lastSyncedCommit` remains `cd54e0927f3853a777f700a0bbf34507cf697b9c`; sidebar, Fumadocs, and Calendar slices remain

Timeline:
- 2026-08-24T16:33:43.605Z Sync Shadcn goal plan created.
- 2026-08-24 Accepted `registry-preset-contract`; read range/status/policy,
  installed-owner patterns, and upstream target preset source.
- 2026-08-24 Added source-owned preset/build-target assertions; focused tests
  reproduced the missing `aria` base under installed 4.10.0 (10 pass, 2 fail).
- 2026-08-24 Installed exact `shadcn@4.19.0`; CLI/preset readback and unchanged
  focused tests pass (12/12).
- 2026-08-24 Source registry, 26 focused tests, all three Toolbar bundles, and
  focused formatting/lint pass; no registry output generated.
- 2026-08-24 Full `www` typecheck passed. Browser and Chrome automation hit a
  tool-side localhost block; native Chrome then rendered `/init` and
  `/r/registries.json`, with HTTP 200 in the final dev-server log.
- 2026-08-24 P1 autoreview completed on the isolated authorized diff with zero
  findings; no review-triggered code changes were needed.
- 2026-08-24 Partial-sync status/dashboard semantics and authored diff checks
  passed; the source-owned goal-plan completion gate passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | complete after clean P1 review, final semantic checks, and goal-plan gate |
| Where am I going? | goal completion and concise handoff |
| What is the goal? | implement and verify the accepted shadcn registry-preset contract without advancing the full-range baseline |
| What have I learned? | 4.10 omitted aria; 4.19 restores the declared three-base contract and 27 truthful targets |
| What have I done? | upgraded, centralized owners, added proof, verified runtime, recorded partial sync/dashboard, reviewed clean |

Open risks:
- No implementation blocker. This remains uncommitted local work, and the three
  later upstream slices are intentionally deferred. Generated dashboard HTML
  retains two whitespace-only lines emitted by its generator; authored/source
  artifacts pass `git diff --check`.
