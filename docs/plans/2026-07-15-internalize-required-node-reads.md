# internalize required node reads

Objective:
Decide the Plite required-read boundary; done when the plan scores >=0.92 with
no dimension below 0.85 and the public/internal API cut is source-backed.

Flow mode:
agent-led plan hardening; planning only until the user explicitly accepts this
plan and invokes `plite-plan` against it again.

Goal plan:
docs/plans/2026-07-15-internalize-required-node-reads.md

Template:
docs/plans/templates/plite-plan.md

Primary template:
docs/plans/templates/plite-plan.md

Applied packs:
- none

Completion threshold:
- Every live `required: true` caller is classified as public consumer,
  Plite-internal invariant, test-only assertion, or removable misuse.
- The plan chooses one public/internal API shape, records adoption and proof,
  closes every objection/pass row, scores >=0.92 overall with no dimension
  below 0.85, and stops for user review without implementation.
- Plite Plan closure is legal only when score >= 0.92, no dimension is below
  0.85, every pass row is complete or intentionally skipped with evidence,
  issue/reference sync rows are closed, final handoff is emitted, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-15-internalize-required-node-reads.md` passes.

Verification surface:
- Bounded `rg` inventory of `required: true`, the option declaration/export,
  direct call sites, tests, package exports, and the current Plate migration
  pressure.
- Source-backed comparison of public `nodes.get` and any internal assertion
  primitive; focused future type/runtime test commands named in the plan.
- Planning-only checks run in `plate-2`; any Plite source/runtime/browser/API
  claim must cite and verify the live `Plate repo root` workspace command.

Constraints:
- No implementation edits in planning mode.
- No compatibility alias, public assertion flag, Plate wrapper, or `any` cast.
- Preserve ergonomic optional reads for public consumers and explicit invariant
  failures for trusted Plite internals.
- Plite Plan may edit planning, research, issue-ledger, and PR-reference
  artifacts only. Plite implementation belongs to accepted-plan execution
  after user review.

Boundaries:
- Editable: this plan and only planning/reference artifacts it explicitly
  requires. Readable: Plite packages, Core/feature callers, tests, VISION, and
  relevant existing plans/solutions in `/Users/zbeyens/git/plate-2`.
- Allowed edit scope: `docs/plans/**`, `docs/research/**`,
  `docs/plite-issues/**`, `docs/plite/ledgers/**`,
  `docs/plite/references/**`.

Blocked condition:
- Stop only if live source cannot distinguish public from internal exports, or
  a product behavior requirement needs user intent that source/tests cannot
  establish.
- Do not use blocked while any research, review, ledger, source-grounding,
  score-hardening, or plan-hardening move remains runnable.

Plite Plan lane state:
- plite_plan_lane_status: complete
- current_pass: closure-score-and-final-gates
- current_pass_status: complete
- next_pass: none
- next_action: user reviews the accepted plan; execution requires a later
  explicit `plite-plan` invocation naming this plan
- final_handoff_status: ready

Execution goal:
- status: active
- flow mode: one-shot execution of this accepted plan
- objective: hard-cut the public lifecycle `{ required: true }` mode, move
  trusted Plite substrate assertions behind `@platejs/plite/internal`, migrate
  every caller without stale rereads, and close package/browser/release/review
  proof.
- completion threshold: zero lifecycle required-option declarations,
  overloads, runtime branches, middleware metadata, docs teaching, and literal
  `{ required: true }` callers in the accepted scope; all focused and broad
  package checks, canonical Browser routes, five-package changeset proof,
  autoreview, and this plan's mechanical checker pass.
- verification surface: bounded source audits; Plite/Core/Diff/feature
  typechecks and tests; package build/import smoke; `pnpm check:plite` and
  `pnpm check:core`; docs check; Browser proof through `apps/plite`; changeset
  status/predicted-version audit; lint; autoreview.
- constraints: no public alias, shim, renamed strict flag, Plate assertion
  wrapper, `any` cast, editor-static reread, or `hasPath` preflight; preserve
  malformed-input errors, strict static helper contracts, DOM/input fallbacks,
  Diff replay failure context, and callback type inference.
- boundaries: edit only the accepted plan's Plite, DOM, React, Core, Diff,
  affected feature tests/examples/docs, package manifests, barrels, and five
  package-scoped changesets. Do not widen into unrelated static-helper redesign.
- blocked condition: stop only after the same package/browser/tooling blocker
  repeats three goal turns and no smaller focused proof or source fix remains.
- output budget: count and list matches before reading them; inspect bounded
  owner slices; exclude generated output, templates, `node_modules`, build
  artifacts, and unrelated packages.

Execution checklist:
- [x] Add and prove internal-only `failInvariant(message): never` with stable
      `Plite invariant failed:` prefix and exact internal package export smoke.
- [x] Migrate 47 Plite/DOM/React production substrate reads according to the
      accepted 19 invariant / 19 guard / 7 static postcondition / 2 indexed
      classification without transaction-locality drift.
- [x] Migrate 23 Core/Diff/example production reads: Core/examples guard;
      Diff throws operation-specific replay errors.
- [x] Migrate four docs and 120 test-only strict reads without retaining a
      production assertion API for test convenience.
- [x] Delete the public required option declarations, 12 overloads, target
      propagation, runtime branches, and synthetic middleware metadata.
- [x] Cover Plite, DOM, React, Core, and Diff in release metadata, folding
      impact into an existing same-package changeset where duplicate bump
      hygiene forbids another file; derive peer floors from predicted versions.
- [x] Run focused package/type/runtime/export proof, broad Plite/Core checks,
      docs/lint, canonical Browser proof, bounded zero-match audits, and
      autoreview; fix every accepted finding.
- [x] Record final evidence, current reboot status, residual risks, and pass
      `check-complete.mjs` before closing the execution goal.

Execution phase table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| 1. Internal primitive | complete | `failInvariant` export, stable error contract, and exact package import smoke pass. | None. |
| 2. Substrate callers | complete | Plite/DOM/React callers use one optional read with invariant or domain fallback. | None. |
| 3. Public callers and tests | complete | Core/Diff/examples/tests compile and focused behavior suites pass. | None. |
| 4. Public hard cut | complete | Required option types, overloads, runtime branches, and middleware metadata are absent. | None. |
| 5. Current-state docs and Browser | complete | Docs checks pass; all seven canonical routes mount without console errors and two accept edits. | None. |
| 6. Release and closure | complete | Five packages are release-covered at beta.2; peer floors, checks, Browser, and autoreview pass. | None. |

Execution completion gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Public hard cut | yes | Zero accepted-scope strict lifecycle API/usages and positive optional contracts. | Zero bounded source matches; state/query/invariant/import contracts pass. |
| Runtime/package proof | yes | Focused tests/typechecks/build/import smoke plus `check:plite` and `check:core`. | Eleven modified package typechecks, focused suites, `check:plite`, and `check:core` pass. |
| Docs and Browser proof | yes | Current-state docs check and canonical `apps/plite` Browser verification. | Docs source/parity checks pass; seven canonical routes mount cleanly and two accept edits. |
| Release packet | yes | Five-package release coverage, predicted versions, aligned peer floors, and status proof. | Changesets predicts beta.2 for all five packages; peer floors and duplicate-bump hygiene pass. |
| Autoreview | yes | Review the complete uncommitted implementation and fix accepted findings. | First pass found two reproducible P2s; both fixed; second pass clean. |
| Goal plan complete | yes | Run the mechanical checker after all execution evidence is recorded. | Execution evidence recorded; final checker rerun is the last closeout command. |

Output budget strategy:
- Count and list matching files before printing call sites; read only the API
  owner, representative callers, relevant tests, and capped VISION/plan slices.
- Exclude generated output, templates, `node_modules`, build artifacts, and
  unrelated packages from searches.

Current verdict:
- verdict: ready for user review; no planning owner remains open
- confidence: 0.95 after revision reconciled package release ownership, Diff
  invariant handling, vertical type/runtime proof, implementation-skill scope,
  and browser/package gates
- keep / cut / revise call: cut `{ required: true }` from public `state`/`tx`
  read option types and docs; add internal-only `failInvariant(message): never`
  for 19 proven substrate invariants and 7 strict static-query postconditions;
  convert 19 absence-tolerant reads to one optional lookup and replace the last
  2 redundant lookups with their already-bounds-checked child values
- reason: a boolean option changes both return type and failure semantics,
  pollutes every lookup overload, and encourages app/test callers to assert
  invariants they do not own

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every Plite Plan
  completion gate below is satisfied and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-15-internalize-required-node-reads.md` passes.
- Do not create hook state for this goal. This
  file plus the active goal are the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | `plite-plan` and `autogoal` read fully; planning-only one-pass lane selected. |
| Active goal checked or created | yes | New planning goal created with this exact plan path and score threshold. |
| Source of truth read before edits | yes | Root VISION, Plite/Common/Plate detail vision, Plite API/interface/runtime owners, docs, examples, and Plate boundary rule read. |
| `docs/solutions` checked for non-trivial existing-code work | yes | Focused `required`/invariant search found no dedicated solution; historical plans exist and are not treated as current proof. |
| Live `Plate repo root` grounding needed for current-state claims | yes | All current claims below come from `/Users/zbeyens/git/plate-2` live source. |

Work Checklist:
- [x] Short objective plus lane outcome, full pass schedule, one-pass-per-
      activation policy, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] One-pass-per-activation policy respected through the completed closure
      pass; no implementation pass ran under the planning goal.
- [x] Live source grounding recorded for every current implementation claim, or
      marked N/A with reason.
- [x] Issue ledger / ClawSweeper pass skipped with concrete evidence: exact
      target-term searches found no public issue, PR, sync-ledger, changeset,
      or changelog claim; running ClawSweeper would invent provenance.
- [x] Research and ecosystem synthesis complete for every external system used
      as evidence: local primary-source snapshots of Lexical, ProseMirror,
      Tiptap, and Slate were inspected and translated into Plite decisions.
- [x] Intent/boundary record and decision brief complete: public reads stay
      optional, assertion policy belongs only to Plite substrate internals,
      Plate/product callers guard absence, and public strict variants are cut.
- [x] Scorecard recorded with evidence; weighted total is 0.95 and the lowest
      dimension is 0.94, above the 0.85 floor.
- [x] Applicable implementation-skill review matrix applied or skipped with
      concrete reason: performance, TDD, React, and docs doctrine shaped the
      execution packet; effect/component/Plate UI lenses are source-backed N/A.
- [x] Plite maintainer objection ledger complete for public lifecycle reads,
      strict static helpers, middleware, internal exports, errors, hot paths,
      tests, Plate consumers, docs, and beta adoption.
- [x] Verification workspace gate recorded for every Plite source, runtime,
      browser, package, public API, or issue-fix claim; execution commands and
      evidence are recorded in the execution closeout.
- [x] TDD execution is N/A in planning-only mode; the accepted plan records
      five vertical red-green slices and rejects dead-API syntax tests.
- [x] Browser proof is N/A in planning-only mode because no runtime/browser
      source changed; focused Chromium routes and escalation criteria are
      mandatory execution gates.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Prove the planning score, source-backed boundary, pass closure, and executable proof route. | Score 0.95 with every dimension >=0.94; 195 callers classified; every scheduled review pass closed; execution commands named by owner. |
| Plite source, runtime, browser, package, public API, or issue-fix claim | yes | Ground current-state claims locally and distinguish future execution proof. | Live Plate source/types/runtime/docs/tests/manifests and package exports were read; no implementation or issue-fix result is claimed; package/browser commands remain explicit execution gates. |
| Issue ledger or PR reference changed | no | Sync the relevant ledger/reference row or record why no sync applies | N/A: no issue/PR claim or matching ledger row exists; this plan contains the complete local provenance accounting. |
| Autoreview for uncommitted implementation changes | no | Load autoreview only for an implementation patch. | N/A: planning mode changed only this plan artifact; execution phase 6 requires autoreview after source changes. |
| Final user-review handoff | yes | Materialize and emit the complete accepted-decision list. | Complete handoff is recorded below and mirrored in the final response. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-15-internalize-required-node-reads.md` | Passed: `[autogoal] complete`. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Current-state read and initial score | complete | Public option/overloads, runtime branch, internal export boundary, and 48 raw Plite/DOM/React occurrences across 19 files audited; the later full ledger correctly separates 47 production substrate calls from 1 public declaration. Initial score 0.67. | related issue discovery |
| Related issue discovery | complete | No exact public issue, PR, changeset, or changelog owner found. Historical plans and commits show the flag was introduced with safe-read optionalization, then inherited by NodeTarget work rather than independently justified as public API. | issue-ledger pass |
| Issue-ledger pass | complete | Exact searches across `docs/plite-issues`, Plite ledgers/references, historical plans, changesets, and package changelogs found no target claim. ClawSweeper correctly skipped rather than manufacturing an issue row. | intent/boundary pass |
| Intent/boundary and decision brief | complete | Intent, outcome, in-scope/non-goals, owner map, six viable option families, chosen public/internal split, consequences, and resolved helper granularity recorded. | research refresh |
| Research, ecosystem strategy, live-source refresh | complete | Local primary-source repos inspected at Lexical `d52f66e25`, ProseMirror Model `6264de0`, Tiptap `91c51be53`, and Slate `945a484df`; only assertion typing, semantic separation, and product guards are adopted. | pressure passes |
| Performance/DX/migration/regression/simplicity pressure passes | complete | Exact 195-use inventory closed and initial action split recorded; the later objection pass correctly reclassified seven apparent artifacts as strict static postconditions. Internal `failInvariant(message): never`, migration order, and proof matrix locked. | objection ledger |
| Plite maintainer objection ledger | complete | Ten objections steelmanned from live exports, middleware types/runtime, beta manifests, docs, tests, internal imports, and error behavior. The seven strict static-query sites were revised from deletion to post-middleware invariant enforcement. | high-risk pass |
| High-risk deliberate mode | complete | Eight realistic failure modes modeled across types, middleware, transaction locality, DOM/input, Diff invariants, package exports, partial beta upgrades, and test migration. The consumed v54 changeset assumption was rejected; a new beta release packet and aligned peer-floor/release proof were added, then corrected by the ecosystem pass. | ecosystem maintainer pass |
| Ecosystem maintainer pass | complete | Seven owner positions challenged the API, middleware, package boundary, product error, docs, release, and proof shape. The cut survived; release ownership was corrected to five separate patch changeset files with current-state wording relative to `origin/main`, and peer floors are derived from the prerelease dry run rather than guessed. | revision pass |
| Revision pass | complete | Re-read live API/runtime/manifests, changeset doctrine, target tests, affected docs/examples, and implementation skills. Reconciled release notes with `main`, replaced the placeholder skill matrix, locked vertical TDD slices, and made effect/browser/performance non-claims explicit. | issue sync accounting |
| Issue sync accounting | complete | Re-ran exact local ledger/release searches and live GitHub searches across Plate and upstream Slate. No issue or PR owns the lifecycle-option cut. Existing stale-path and autofocus reports are related-only with different repro contracts; `#6053` is already closed and owned by the separate selected-element self-removal lane. No generated ledger or PR reference needs mutation. | closure score and final gates |
| Closure score and final gates | complete | Requirement-by-requirement audit closed score, source grounding, implementation-skill scope, issue accounting, planning-only N/A gates, full handoff, and mechanical plan validation without claiming execution work. | final handoff |

Scorecard:
| Dimension | Weight | Score | Evidence |
|-----------|-------:|------:|----------|
| React 19.2 runtime performance | 0.20 | 0.96 | Every target keeps one transaction-local lookup; `?? failInvariant(...)` is cold-path-only, public guards delete preflights, and no subscription/render behavior changes. |
| Plite-close unopinionated DX | 0.20 | 0.95 | Lifecycle reads have one optional contract; distinct strict static primitives keep their current semantic contract; substrate code gets one tiny failure primitive. |
| Plate and collaboration migration backbone | 0.15 | 0.94 | Core guards, Diff domain assertions, no new Plate internal import, five-package beta publication ownership, emitted-version peer-floor alignment, and no speculative collaboration API are explicit. |
| Regression-proof testing strategy | 0.20 | 0.95 | Positive optional-return types, malformed-input behavior, invariant failure, transaction locality, strict middleware postcondition, stale DOM, packed exports, focused package, broad Plite/Core, and Browser gates are named. |
| Research evidence completeness | 0.15 | 0.95 | Current exports, middleware types/runtime, docs, tests, manifests, beta pre-state, Changesets implementation, provenance, and four local editor repos support the revised boundary. |
| shadcn-style composability and minimalism | 0.10 | 0.94 | One optional public operation plus a three-line internal failure primitive is smaller than overloads, typed strict helpers, or a second query namespace. |
| **Weighted total** | **1.00** | **0.95** | Threshold met; every dimension is >=0.94 and all scheduled planning passes are closed. |

Source-backed architecture north star:
- target shape: public lifecycle reads are honestly optional; existing strict
  static power helpers keep distinct function semantics; trusted Plite
  internals use one explicit assertion primitive through
  `@platejs/plite/internal`
- source evidence: `interfaces/editor.ts` exposes required overloads;
  `core/public-state.ts` branches on the flag; `package.json` already exports
  `./internal`; current docs/examples teach the flag publicly
- rejected drift: Plate wrapper, public `getOrThrow`, renamed public boolean,
  non-null assertions, duplicated per-package throw helpers
- migration posture: hard cut after caller classification; public consumers
  guard absence, sibling Plite packages import the internal assertion owner

Current-source inventory:
| Surface | Current shape | Evidence | Initial classification |
|---------|---------------|----------|------------------------|
| Public read types | `EditorRequiredQueryOptions.required?: boolean` flows into node/path/point/range options; overloads narrow on `{ required: true }` | `packages/plite/src/interfaces/editor.ts:364-622,2374-2431` | public API pollution |
| Runtime implementation | public state helpers branch on `options.required` and call `requireLocationPath` | `packages/plite/src/core/public-state.ts:559-625,757-887,2097-2130` | split public optional read from internal assertion |
| Strict static runtime | Four strict static helpers are exported from the package root and three more are internal; all seven inject public `{ required: true }` metadata before query middleware. | `packages/plite/src/index.ts:6-27`; `packages/plite/src/core/editor-query-runtime.ts:187-454`; `packages/plite/src/core/editor-runtime.ts:50-80` | preserve distinct static contracts; replace public metadata with post-middleware invariant enforcement |
| Internal package boundary | `@platejs/plite/internal` already exists and exports low-level editor primitives | `packages/plite/package.json:37-48`; `packages/plite/src/internal/index.ts` | target home for assertion primitive |
| Plite sibling/runtime internals | 47 production occurrences across 18 `plite`, `plite-dom`, and `plite-react` files, excluding the one public declaration occurrence | bounded source audit | 19 substrate invariants, 19 guard/domain-fallback reads, 7 strict static postconditions, 2 redundant indexed reads |
| Public teaching surfaces | API docs, node/location docs, and 16 `apps/www` example occurrences teach the flag | `content/docs/api/plite/editor-api.mdx:62`; `content/docs/plite/api/nodes/editor.mdx:130-135`; `apps/www/.../tables.tsx:133-140` | must hard-cut and teach guards |
| Plate/feature pressure | Core/Diff production and many feature specs use strict overloads | bounded package audit | Core guards, Diff throws domain-specific replay errors, tests assert locally; no Plate wrapper |

Complete live caller ledger:
| Category | Files | Uses | Execution rule | Closure proof |
|----------|------:|-----:|----------------|---------------|
| Plite substrate production | 18 | 47 | Apply the exact 19 invariant / 19 guard / 7 static-postcondition / 2 indexed-read split below. | no `{ required: true }` remains in Plite production source |
| Public production/examples | 11 | 23 | Core 4 and examples 16 use one optional read plus owner-specific guard/fallback; Diff 3 use optional reads followed by inline change-tracking domain errors because silently skipping a replay record would corrupt output. | no Plate/product import of `@platejs/plite/internal` added for this cut |
| Public docs | 4 | 4 | Describe optional absence only; delete strict-mode prose and samples. | docs search and docs check |
| Public declaration | 1 | 1 literal definition | Delete the required option type/property, inherited propagation, and 12 strict overload signatures. | positive optional-return type contracts plus zero-source audit; no dead-API rejection test |
| Test-only | 37 | 120 | Replace 20 strict-contract cases with optional/malformed-input contracts; migrate 100 fixture reads with Vitest narrowing or a reused test-local helper. | focused tests plus zero production-API retention for fixture brevity |
| **Total** | **71** | **195** | No caller is unclassified. | bounded recount equals zero after execution |

Plite substrate migration ledger:
| File / family | Uses | Target | Reason |
|---------------|-----:|--------|--------|
| `plite/core/editor-query-runtime.ts` | 7 | Drop synthetic `required` metadata and apply `?? failInvariant(...)` to the final middleware result. | Default callbacks are strict, but public query middleware result types are optional and may override with `undefined`; the postcondition preserves all seven static contracts without leaking the removed option. |
| `plite-dom/plugin/dom-editor.ts` | 6 | Optional read plus existing null/domain-error path. | DOM mappings and mounted paths can be stale; generic invariant errors would weaken the DOM-specific contract. |
| `plite-dom/plugin/with-dom.ts` | 2 | `?? failInvariant(...)`. | Post-operation path/key bookkeeping owns these existence invariants. |
| React DOM/user-input fallbacks: segment placeholder, clipboard input, content-root geometry, DOM-coverage selection, runtime live state, node ref | 7 | Optional read plus existing null/false/fallback path. | Mount, DOM, or selection state may become stale without constituting a kernel bug. |
| React selection-void target | 2 | Optional read plus guard; delete `hasPath` preflight. | DOM event targets may disappear before reconciliation. |
| React root interaction | 2 | Guard the stale DOM-derived node; assert the document-end point. | Mixed caller ownership requires two different absence policies. |
| React mutation-block editing | 2 | Guard arbitrary inline location; assert the derived previous sibling. | User location can be absent; a previous top-level sibling derived from the same snapshot cannot. |
| React DOM-coverage vertical selection | 2 | Use the already-bounds-checked `children[blockIndex]!`. | The strict lookup is redundant after the exact array bounds check. |
| React mutation full-block editing | 8 | `?? failInvariant(...)`. | Paths are derived and consumed inside the same model operation. |
| React caret engine and mutation controller | 6 | `?? failInvariant(...)` for document boundary points. | A normalized document must have start/end points during model-owned commands. |
| React history focus | 1 | `?? failInvariant(...)`. | Restoring focus into a normalized mounted document owns the start-point invariant. |
| React selection controller | 2 | Optional pair; return `false` when either document edge is absent. | The current function already treats any failure as “not full document selection.” |
| **Action totals** | **47** | **19 substrate invariant + 19 guard/domain fallback + 7 strict static postcondition + 2 direct indexed read** | Every production use has one owner and one absence policy. |

Public API target:
| Surface | Proposed shape | User-facing DX | Compatibility / migration | Evidence | Verdict |
|---------|----------------|----------------|---------------------------|----------|---------|
| lifecycle node/path/point/range reads on `editor.read`, `state`, and `tx` | Remove `required` option inheritance and all strict overloads; return optional values only. | one predictable lifecycle lookup contract | breaking hard cut; guard absence at app boundaries | complete 195-use inventory plus public interface/runtime audit | accept |
| existing static `first`/`edges`/`parent`/`range` and internal strict primitives | Keep their distinct strict function contracts; do not add a lifecycle `getOrThrow` or suggest static helpers merely to avoid an optional result. | power/runtime primitives remain explicit functions, while normal authoring stays lifecycle-first | no expansion; static-helper cleanup, if desired, is a separate API plan | package-root exports, `InternalEditorQueryRuntime`, and VISION primitive-method doctrine | keep scoped |

Internal runtime target:
| Layer | Current owner | Target mechanism | Avoids | Evidence | Verdict |
|-------|---------------|------------------|--------|----------|---------|
| invariant reads | `@platejs/plite/internal` | `failInvariant(message: string): never`; use `state.nodes.get(path) ?? failInvariant(context)` on the 19 proven invariant sites | happy-path helper calls, stale-editor reads, duplicated typed helpers, public flags | existing internal subpath plus exact internal classification | accept |
| strict static query postconditions | `packages/plite/src/core/editor-query-runtime.ts` | execute middleware without `required`, then apply `?? failInvariant('Query middleware returned no result for ...')` to the final result | silently weakening static return types when middleware returns `undefined` | public middleware result types are optional even when default static callbacks are strict | revise and accept |

Internal assertion contract:
```ts
export function failInvariant(message: string): never {
  throw new Error(`Plite invariant failed: ${message}`);
}
```

- Home: a small Plite internal source file exported only by
  `packages/plite/src/internal/index.ts` and the existing `./internal` subpath.
- Callers pass a concrete violated expectation, including the relevant path or
  operation when available; the helper owns only the stable error prefix.
- `never` gives natural expression inference with `??`, needs no generic, and
  never runs on the valid hot path.
- Strict static wrappers assert after the complete middleware chain, not inside
  the default callback. Normal invalid-target errors therefore keep their
  existing detailed `NodeApi` messages; only an invalid middleware override
  receives the new invariant error.
- Do not add typed `requireNode`/`requirePoint`/`requireRange` helpers, a value-
  returning `expectDefined`, a condition-style invariant that forces a second
  statement, or local sibling-package copies.

Plite / Plate boundary map:
| Surface | Owner | Allowed target | Forbidden target | Evidence | Verdict |
|---------|-------|----------------|------------------|----------|---------|
| Public `state` / `tx` read signatures | `@platejs/plite` | Optional return for absent/unresolved targets | `{ required: true }`, public `getOrThrow`, public `require` namespace | current public overload and docs audit | hard-cut strict mode |
| Existing strict static helpers | `@platejs/plite` power/runtime surface | Preserve current strict function return contracts and enforce them after query middleware | using them as a replacement normal-authoring API or adding new strict lifecycle variants | package-root exports plus VISION primitive-method doctrine | keep scoped |
| Core static/runtime invariant reads | Plite core | Low-level strict primitive or internal result assertion with transaction/root correctness | routing assertions back through public options | `editor-query-runtime.ts` and `public-state.ts` | internalize |
| DOM/React runtime invariant reads | `@platejs/plite-dom` / `@platejs/plite-react` consuming `@platejs/plite/internal` | Explicit internal assertion around the same state/tx result | stale editor-static reread, duplicated local throw helpers | existing sibling dependencies and internal imports | internalize |
| Plate Core and feature packages | Plate product/framework owners | Public optional read plus owner behavior: Core guard/early return, Diff inline domain error after replay invariants | importing the assertion helper merely to recover old non-optional types | 4 Core and 3 Diff production occurrences | migrate as public consumers with local behavior ownership |
| Plite examples/docs | public teaching owners | Single read plus absence guard; explain optionality | internal import or assertion-mode example | 16 example occurrences and three docs surfaces | hard-cut and rewrite |
| Tests | owning package test layer | Fixture/test assertion helper or explicit guard appropriate to the test | retaining production public API only to shorten fixtures | broad feature-spec occurrence audit | migrate separately from runtime |

Hook / component / render DX target:
| Surface | Call-site shape | Composition rule | Performance rule | Evidence | Verdict |
|---------|-----------------|------------------|------------------|----------|---------|
| Plite DOM/React invariant | `const entry = state.nodes.get(path) ?? failInvariant('Expected ...')` | only substrate-owned invariants use the internal helper; message names the violated state | one lookup; helper is not called on the valid path; no extra subscription | 19 exact invariant occurrences | accept |
| Plite DOM/React absence-tolerant flow | `const entry = state.nodes.get(path); if (!entry) return ...` | DOM staleness, user input, and async mount absence keep their existing null/false/fallback behavior | removes `hasPath` preflights and avoids assertion exceptions | 19 exact guard/domain-fallback occurrences | accept |
| Plate components/examples | `const entry = tx.nodes.get(path); if (!entry) return` | product code handles runtime absence at its boundary | one lookup replaces `hasPath` plus strict get | highlighted table example | accept |

Plate migration-backbone target:
| Pressure | Plite substrate target | Plate adaptation route | Non-goal | Evidence | Verdict |
|----------|------------------------|------------------------|----------|---------|---------|
| Core/Diff strict calls | public optional reads only | Core guards product state; Diff throws inline change-tracking errors for impossible post-replay absence; neither imports Plite internals | preserving old non-optional convenience or silently dropping Diff records | exact 7 production occurrences | hard-cut migration |
| Feature specs | no public strict overload | use owner test helper or explicit test assertion | make fixture brevity drive production API | package occurrence inventory | migrate in execution |
| Docs/examples | optional-read contract | teach guard-first examples and remove strict-mode prose | migration notes or old API docs | live docs/example audit | current-state rewrite |

Collaboration migration-backbone target:
| Pressure | Plite substrate target | Collaboration route | Non-goal | Evidence | Verdict |
|----------|------------------------|---------------------|----------|---------|---------|
| Snapshot/transaction locality | internal assertion consumes the result from the active state/tx | history/Yjs may use the internal owner only when a real invariant caller exists | editor-static rereads inside active transactions | `tx.nodes.get` local-state doctrine and sibling package boundary | preserve locality |
| Public collab integrations | optional public reads remain unchanged | app/product collab code guards absence | new collaboration API | no current collab-specific required caller found | no behavior expansion |

Intent / boundary record:
- intent: remove assertion policy from public read options without weakening
  loud invariant failures inside Plite-owned runtime code
- outcome: one optional public lookup contract; one explicit internal assertion
  owner; all public docs/examples/callers handle absence honestly
- in-scope: required option types/overloads, public-state branches, internal
  static wrappers, Plite DOM/React callers, Plate/Core/feature callers, tests,
  docs, examples, package exports, and proof commands needed for the hard cut
- non-goals: change valid-read results, malformed input validation, root or
  transaction semantics, introduce public strict variants, add Plate wrappers,
  redesign all query names, remove existing static power/runtime helpers, or
  change editor/browser behavior
- decision boundaries: Plite owns public lifecycle and internal substrate;
  only Plite substrate packages may consume the internal assertion owner;
  Plate/product/docs/examples consume public optional reads; test ergonomics do
  not dictate production API
- unresolved user-decision points: none; the user explicitly proposed
  internalization and live source determines the smallest honest cut

Decision brief:
- principles: one method has one failure contract; absence is data at public
  boundaries; invariants fail loudly only where the owner can prove them;
  transaction-local reads must stay local; package ownership beats convenience
- top drivers: 12 public strict overload signatures, shared required option
  propagation across seven read-option types, redundant `hasPath` + strict-get
  patterns, public docs teaching assertion policy, and an existing internal
  subpath already used by sibling runtimes
- viable options: (1) keep the flag; (2) rename strict behavior to public
  `getOrThrow`/`require`; (3) expose a public `state.required.*` namespace;
  (4) use one generic internal result assertion; (5) add typed internal
  node/point/range assertion helpers; (6) replace every caller with editor-static
  strict primitives; (7) preserve existing strict static helpers but remove
  their dependency on public lifecycle option metadata
- chosen option: hard-cut public strict mode and add internal-only
  `failInvariant(message: string): never`; true invariants use nullish
  coalescing around the already-produced state/tx result, while absence-
  tolerant flows guard and direct strict-runtime artifacts simply drop the flag
- rejected alternatives: keep/rename/public namespace all preserve assertion
  policy as app API; broad static rereads risk stale transaction state; local
  per-package helpers duplicate the invariant owner; non-null assertions lose
  runtime failure evidence
- consequences: breaking type/docs/examples cut; simpler public signatures;
  deliberate migration of runtime, product, and test callers; internal errors
  need contextual messages; valid-read hot paths remain one lookup; strict
  static wrappers gain a post-middleware contract check
- follow-ups: complete objection and deliberate-risk passes, then revise the
  accepted execution packet rather than reopening public strict variants

Issue accounting:
| Issue / cluster | Claim category | Exact claim | Why | Proof route | V2 sync ledger | PR line |
|-----------------|----------------|-------------|-----|-------------|----------------|---------|
| No exact public owner | non-claim | This hard cut is user/API-design pressure, not resolution of a public bug report. | Exact local searches found no target claim; live Plate searches found zero matching issues and zero Plite `editor.read`/invariant PRs. Old release PR `#3176` and tokenized upstream results `#3800`/`#3627` are false neighbors. | bounded local audit plus live GitHub search on 2026-07-15 | N/A final; no exact row exists to sync | N/A |
| Slate `#6053` | already-owned closed issue | Do not claim it here. The selected-element self-removal lane owns the exact stale-path hook repro. | Live GitHub reports `closed/completed` on 2026-07-09 after cross-reference from upstream PR `#6073`; existing Plite proof and claim live in the dedicated `useElementSelected` plan/ledger. This packet changes different read callers. | live issue/timeline plus `issue-coverage-matrix.md` row | unchanged: existing `Fixes` owner remains | N/A |
| Slate `#3858`, `#4081`, `#4323` | related-only | Stale descendant paths and DOM-point resolution are adjacent pressure, not fixed claims. | All three remain open; their external-reset, fast-refresh, and DOM-point repros are broader than the classified optional-read callers and need their own exact proof. | live issue state plus existing related rows | unchanged: related only | N/A |
| Slate `#5213`, `#4696` | related-only | Autofocus failures are not claimed. | Both remain open. This packet guards an unavailable public target; it does not prove selection establishment or caret-at-end behavior from either issue. | live issue state plus autofocus caller audit | unchanged: focus-runtime owners | N/A |
| `2026-06-27-plite-safe-read-api-completion.md` | historical decision | Optionalize app-facing reads while retaining `{ required: true }` for loud reads. | This is the introducing plan and explains the migration mechanism, but it did not test whether assertion policy belongs in public options. | plan lines 22-30, 226-240, 248 | historical only | N/A |
| `bf825e31e7` | introducing commit | Added required option interfaces/overloads in the same patch that made formerly strict reads optional. | Proves the flag is a local migration design, not inherited Slate law. | focused `git show` of interface/public-state/tests | provenance only | N/A |
| `139eaaab2e` | propagation commit | Threaded `options.required` through live `NodeTarget` resolution. | Proves later work propagated the mode; it does not independently justify public exposure. | focused `git show` of `public-state.ts` | provenance only | N/A |
| July 9 node-target/parity plans | inherited decision | Repeated optional-plus-required as accepted current shape. | Useful adoption history, but neither plan reopened the public/internal ownership question raised here. | targeted plan reads | historical only | N/A |

Issue-ledger sync status:
- ClawSweeper related-issue pass: N/A; the existing ledgers already classify
  every adjacent issue above, and this plan adds no new ingestion,
  reclassification, or closure claim.
- generated live gitcrawl rows read: complete. Exact target-term search stayed
  empty; broader stale-path/autofocus search surfaced the existing related
  rows. `#6053` is closed live, while the generated historical snapshot still
  says open; do not hand-edit generated/historical ledgers from this plan.
- live GitHub refresh: complete on 2026-07-15 for Plate exact API/behavior
  searches and upstream `#6053`, `#3858`, `#4081`, `#4323`, `#5213`, and
  `#4696` state/timeline.
- manual v2 sync ledger update: N/A; there is no issue row to reclassify.
- fork issue dossier update: N/A; no fork issue is claimed or affected.
- issue coverage matrix update: N/A; this is API-boundary planning, not issue
  coverage.
- PR description sync: N/A; no PR is part of this planning goal.

Ecosystem strategy synthesis:
| System | Source | Mechanism | Avoids | Steal | Reject | Plite target | Verdict |
|--------|--------|-----------|--------|-------|--------|--------------|---------|
| Lexical | local primary source `../lexical` at `d52f66e25`; `packages/shared/src/invariant.ts`, `LexicalUtils.ts:516-539,1655-1665` | Optional `$getNodeByKey`; `invariant(...): asserts cond`; separate public `$getNodeByKeyOrThrow` | Boolean mode options; lost runtime assertions | Internal assertion-function typing and contextual invariant message | Public `OrThrow` duplication and Lexical active-state naming | internal assertion narrows the already-read optional result | steal assertion mechanism, reject public API |
| ProseMirror Model | local primary source `../prosemirror-model` at `6264de0`; `src/node.ts:180-214`, `resolvedpos.ts:218-230` | Optional `nodeAt`; strict `resolve`; `resolveNoCache` marked internal | One option changing absence policy | Separate semantic jobs and keep lower-level strict machinery internal | Position-centric method split as Plite lifecycle design | optional public read plus internal strict owner | supporting precedent |
| Tiptap | local primary source `../tiptap` at `91c51be53`; `toggleList.ts`, `delete.ts` | Product commands guard or optional-chain ProseMirror `nodeAt` results | Framework-level strict wrappers | Guard absence at the product/command boundary | New Tiptap/Plate assertion abstraction | Plate/Core/features consume optional Plite reads honestly | steal product behavior |
| Slate | local primary source `../slate` at `945a484df`; `interfaces/node.ts:419-459` | Low-level `Node.getIf` optional and `Node.get` strict | Boolean mode option | Preserve a distinct strict low-level operation separate from optional lifecycle read | Re-exporting both as competing public Plite state methods | existing static power helpers may stay strict; public lifecycle state stays optional | supporting precedent |

Ecosystem conclusion:
- No editor provides a reason to keep `{ required: true }` as a public option.
- Lexical proves a contextual assertion function can narrow types without
  changing the lookup API; Tiptap proves framework/product code can guard
  optional reads without inventing a wrapper.
- ProseMirror and Slate separate optional and strict jobs. Plite already has
  strict static power helpers and internal primitives; copying another strict
  lifecycle method would be duplication, not parity.

Legacy regression proof matrix:
| Regression class | Legacy behavior | Plite target | Proof route | Owner | Status |
|------------------|-----------------|-----------------|-------------|-------|--------|
| Missing valid-shaped target | Plain lifecycle reads return `undefined`; strict mode throws. | Every lifecycle read returns `undefined`; assertion is unavailable through lifecycle options. | Runtime matrix for node first/get/leaf/path/parent, point start/end/get, and range edges/get. | Plite state-query tests | planned |
| Malformed location/path | Shape validation throws independently of strict mode. | Preserve malformed-input errors; optional means absent, not structurally invalid. | Focused malformed path/location runtime tests. | Plite state-query tests | planned |
| Valid reads | Both modes return the same node/path/point/range. | Optional signatures return the same value with no extra lookup. | Existing valid-read suite plus focused type assertions. | Plite | planned |
| Existing strict static helpers | Strict functions throw on invalid targets and return non-optional results. | Keep those function contracts; do not route them through optional lifecycle reads. | Existing query-contract suite plus focused middleware-returns-`undefined` postcondition row. | Plite static runtime | planned |
| Transaction-local update | Strict `tx` reads see the transaction snapshot. | Assert the first optional `tx` result; never re-read editor/static state. | Regression test mutates then reads/asserts inside one update. | Plite | planned |
| Query middleware payload/result | Static wrappers synthesize `options.required`; middleware results are typed optional. | Middleware sees only real public options; a post-chain invariant preserves every strict static result contract. | Query-middleware spy plus an override returning `undefined` for a strict static call. | Plite | planned |
| Internal invariant failure | Strict mode throws a low-level path error. | True substrate bugs throw `Plite invariant failed: <context>`. | Unit test for `failInvariant` and one representative node/point integration. | Plite internal + React runtime | planned |
| DOM/input staleness | Preflight plus strict get generally returns null/false unless state changes between reads. | One optional lookup returns the same null/false/domain fallback without generic assertion noise. | Existing DOM/React tests plus focused stale-path cases. | Plite DOM/React | planned |
| Diff replay invariant | Strict lifecycle reads throw after operation replay when the expected point/range is absent. | Optional read followed by an inline change-tracking domain error; never silently omit a diff record. | Focused merge/split/set replay tests asserting both valid records and impossible-state failure context. | Diff | planned |
| Test fixture brevity | 120 test reads use the production strict overload. | Test assertions narrow locally; no runtime API exists only for tests. | Typecheck all 37 affected test files and run focused suites. | Package test owners | planned |

Browser stress / parity strategy:
| Surface | Scenario | Browser/device | Command or proof route | Expected signal | Status |
|---------|----------|----------------|------------------------|-----------------|--------|
| Changed example smoke | Open `check-lists`, `dom-coverage-boundaries`, `hidden-content-blocks`, `markdown-shortcuts`, `mentions`, `richtext`, and `tables`; perform the route's basic edit/selection action and inspect console. | Browser Chromium through `apps/plite` | dev server plus Browser at `/examples/plite/<id>` | every route mounted with no console/error UI; check-lists and DOM coverage accepted edits | complete |
| Focused browser behavior | Exercise table selection, markdown conversion, mention selection, rich-text undo/redo, and DOM-coverage boundaries. | Plite Playwright Chromium | focused existing rows plus DOM-coverage rows through `pnpm check:plite` | Chromium behavior suites passed | complete |
| Plite browser suite | Run existing browser behavior rows after React/DOM caller migration. | Playwright Chromium | `pnpm --filter plite test:plite-browser:chromium` through `pnpm check:plite` | 587 passed / 7 skipped, 3 passed, 45 passed, and 46 passed / 1 skipped | complete |
| Cross-browser matrix | No browser algorithm changes are intended. | N/A | N/A unless focused Chromium proof exposes a behavior regression | closure matrix is disproportionate for a type/failure-policy cut | intentionally skipped |

Verification workspace gate:
| Claim | Workspace | Command | Result | Owner |
|-------|-----------|---------|--------|-------|
| Public lifecycle optional types infer correctly and stale strict declarations are gone | Plate repo root | positive Plite type contracts, bounded source audit, then package typecheck | zero strict source matches; type and runtime contracts pass | Plite |
| Plite/DOM/React internal migration preserves runtime behavior | Plate repo root | focused tests, then `pnpm check:plite` | focused suites and full check pass | Plite substrate |
| Core/Diff public-consumer migration compiles and behaves | Plate repo root | Core/Diff typechecks and focused package tests, then `pnpm check:core` | typechecks, focused Diff tests, and full check pass | Plate Core/Diff |
| All affected feature tests migrate without production API retention | Plate repo root | affected package typechecks/tests plus bounded source audit | eleven modified package typechecks and owning checks pass | package owners |
| Docs/examples teach only optional reads | Plate repo root | docs check, relevant app typecheck, and Browser proof | docs source/parity checks and seven-route Browser proof pass | docs/apps |
| Internal export/barrels and packaged imports are correct | Plate repo root | exact import smoke and `pnpm brl` | 18 import-smoke rows and 56 barrel rows pass | Plite + DOM/React |
| Beta release packet is coherent | Plate repo root | five-package release coverage, status JSON, predicted versions, and peer floors | all five packages predict beta.2; release contracts pass | release owner |
| Formatting/lint is clean | Plate repo root | `pnpm lint:fix` followed by relevant checks | root fixer exposed unrelated app/donor baseline diagnostics; owning package lint in `check:core` and scoped selection lint pass | execution owner |

Applicable implementation-skill review matrix:
| Lens | Applies | Status | Findings | Plan delta |
|------|---------|--------|----------|------------|
| `performance` | yes | applied | Repeated unit is one lifecycle read. Target budget is one state/tx lookup, zero `hasPath` preflights, zero editor-static rereads, zero new caches/listeners/subscriptions, and a cold-only invariant throw. No latency, huge-document, trace, CWV, or RUM claim is made because algorithm, DOM cardinality, and render topology do not change. | Keep the one-lookup source audit; use behavior/browser proof rather than inventing a benchmark. |
| `tdd` | yes | applied | Public optional reads already exist, so a fake red test for removed syntax would test dead code. Real red slices exist for the missing internal export, strict query middleware returning `undefined`, and stale DOM paths that currently throw. | Execute vertical red-green slices; keep positive optional type contracts and reject a dead-API `@ts-expect-error` test. |
| `react` | yes | applied | Target React files change lookup failure handling only. No prop shape, render derivation, ref access, memoization, subscription, or component ownership changes are needed. | Preserve current hook/render boundaries; add no memoization or state/effect workaround. |
| `react-useeffect` | no | skipped | The only target file containing an Effect is `root-interaction-controller.ts`, but the changed strict reads live in callback/helper bodies and do not alter effect setup, dependencies, listeners, or cleanup. | If execution changes any Effect body or dependency list, load this lens then; otherwise no effect ceremony. |
| `docs-creator` | yes | applied | Four API/concept references and seven canonical examples teach the flag. They are API-reference/current-state surfaces, not migration pages. | Rewrite source-first, exact, current-state prose; teach one optional read plus owner guard; keep the Chinese API page aligned; run docs check and route proof. |
| `components` | no | skipped | No component contract, composition boundary, props, slots, or UI ownership changes. | None. |
| `plate-ui` | no | skipped | No registry component, kit, copied UI source, or visual design surface changes. | None. |

Performance no-change defense:
- repeated unit: one lifecycle node/point/range read
- cohorts: normal, large, stress, and pathological documents all retain the
  same lookup complexity; this packet adds no document-size-dependent work
- budget: one active-state lookup; no preflight, reread, cache, allocation on
  success beyond existing return values, listener, effect, or subscription
- native/degradation contract: unchanged; no virtualization, staged DOM, or
  model-backed fallback is introduced
- proof: source audit enforces the lookup budget; focused Chromium and
  `pnpm check:plite` guard behavior; traces, CWV, and RUM are N/A because the
  plan makes no performance-release claim

TDD execution slices:
| Slice | RED | GREEN | Refactor / broad proof |
|-------|-----|-------|------------------------|
| Internal assertion owner | Exact internal import smoke and direct stable-prefix throw test fail because `failInvariant` is absent. | Add the three-line internal helper and export only from `./internal`. | Run Plite focused tests/typecheck/build and exact export smoke. |
| Strict static middleware | Add a query-extension row where middleware returns `undefined`; current non-optional wrapper silently returns it. | Assert the final middleware result after the chain without restoring public metadata. | Run state/query contracts; preserve normal invalid-target error text. |
| Absence-tolerant runtime | Add or tighten one stale-path DOM/React behavior row that currently reaches the strict throw. | Replace that caller category with one optional lookup plus its existing fallback. | Migrate the remaining classified guard sites, then focused browser rows. |
| Product invariants | Extend existing Core/Diff behavior owners only where a missing target has observable fallback/error behavior. | Core guards; Diff throws operation-specific replay errors. | Run focused Core/Diff suites and broad owner checks. |
| Public hard cut | Positive optional return contracts and whole-graph typecheck expose every caller still assuming a value. | Migrate callers, then remove option inheritance, overloads, runtime branches, and middleware metadata. | Zero-source audit; no dead-syntax test. |

High-risk deliberate-mode pre-mortem:
| Risk | Trigger | Failure mode | Mitigation | Proof | Status |
|------|---------|--------------|------------|-------|--------|
| Repository caller missed by literal inventory | Spread/aliased options or a variable carries `required` without a literal. | Cut compiles locally in sampled files but another package fails or retains hidden assertion semantics. | Current audit found no `required: false`, dynamic value, or external `.required` reader; rely on whole affected graph typecheck and exact type-owner deletion, not literal count alone. | positive optional-return type contracts, affected graph typechecks, and zero searches for option types/runtime branches | mitigated |
| Static query middleware returns `undefined` | An extension overrides strict `first`/`edges`/`parent`/`range` or internal strict method. | Non-optional static API silently produces `undefined`. | Assert the final middleware result with contextual `failInvariant`; preserve normal low-level errors from the default callback. | focused query-extension test returning `undefined` plus existing query contracts | mitigated |
| Transaction-local state is lost | Migration replaces a `tx`/active-state read with an editor-static reread. | Post-operation paths resolve against stale committed state. | Assert or guard the first result produced by the current state/tx; source audit rejects a second read and `hasPath` preflight. | mutate-then-read transaction regression and caller diff review | mitigated |
| DOM/input absence is misclassified as invariant | A DOM node, mounted path, selection, or clipboard target disappears between browser phases. | New generic invariant crash in normal selection, focus, IME, or clipboard flow. | Keep all 19 stale/external flows optional with their existing null/false/domain fallback; no mechanical assertion sweep. | focused DOM/React stale-path tests, seven-route Browser smoke, full Chromium suite | mitigated |
| Diff absence is guarded instead of asserted | Merge/split/set operation replay does not produce the expected point/range. | Change tracking silently omits property records and emits a plausible but wrong diff. | Inline operation-specific errors in Diff after the optional read; do not import Plite invariant helper and do not return early. | focused Diff replay tests and `pnpm --filter @platejs/diff test` | mitigated |
| Internal export missing from built package | Source paths compile through tsconfig aliases but published DOM/React cannot import `failInvariant`. | Runtime module-load failure from `@platejs/plite/internal`. | Add the symbol to the exact internal export smoke, run barrels and built-package import checks before broad checks. | `public-package-import-smoke.test.ts`, `pnpm brl`, Plite/DOM/React builds | mitigated |
| Partial beta package upgrade | New DOM/React loads old Plite without `failInvariant`, or old DOM passes removed strict options to new Plite. | Module-load failure or stale DOM code receives `undefined` where it expected a throw. | Publish all five changed production packages through one package per patch changeset file; derive DOM/React Plite floors and React's DOM floor from the prerelease dry run, and declare mixed beta generations unsupported; no runtime shim. | live `.changeset/pre.json` check, changeset status/version dry proof, manifest/packed-set smoke | mitigated with release gate |
| Test migration hides fixture failures | Mechanical `!` assertions replace runtime strict reads. | Tests compile while invalid fixtures proceed with undefined values. | Use `node:assert` for one-offs and a file-local throwing helper only after three uses; forbid production API or broad test-utils expansion for fixture brevity. | diff audit plus all 37 affected test files typechecked and focused suites green | mitigated |

High-risk blast radius and hard-cut answer:
- Production packages: `@platejs/plite`, `@platejs/plite-dom`,
  `@platejs/plite-react`, `@platejs/core`, and `@platejs/diff`.
- Test-only consumers: code-block, Core, DnD, Layout, Media, Mention, Plite,
  and Table; teaching surfaces: seven Plite examples and four docs files.
- Runtime exposure: lifecycle query types/behavior, extension query middleware,
  DOM/selection/input reconciliation, model-owned mutations, Core delete/input
  rules and autofocus, and Diff operation replay. No document model, operation,
  commit, normalization, or persisted-data shape changes.
- Before release, rollback means revert the whole packet. After a beta release,
  fix forward by correcting caller classification or aligned package metadata;
  never restore the public flag, alias it, or add a runtime shim.
- If aligned packed-package proof cannot be made green, block publication and
  repair package version ownership. Mixed beta generations are not a supported
  compatibility target for packages consuming `@platejs/plite/internal`.

Plite maintainer objection ledger:
| Change | Pain owner | Steelman objection | Tension / why worth it | Evidence | Rejected alternative | Adoption, docs, and regression answer | Verdict |
|--------|------------|--------------------|------------------------|----------|----------------------|--------------------------------------|---------|
| Cut lifecycle `{ required: true }` | Current app, package, and extension authors using the overload. | A strict opt-in is concise, narrows types, and catches invariant bugs. | Convenience is real, but a boolean that changes failure and return semantics makes every normal read API carry assertion policy. | 12 overloads, shared option inheritance, 195 uses, and docs explicitly teaching internal invariants through public API. | Rename to `strict`, `getOrThrow`, or `state.required.*`. | Migrate product code to guards/domain errors, substrate invariants to internal failure, rewrite current-state docs, add positive optional-return types and runtime optional tests. | keep cut |
| Preserve existing strict static helpers | Maintainers wanting one universal optional-read law. | If strict reads are conceptually internal, all public strict functions should disappear now. | Static power/runtime functions are a separate semantic operation and current package-root contract; widening this cut would mix two API decisions. | `packages/plite/src/index.ts` exports `edges`, `first`, `parent`, and `range`; VISION allows primitive power/runtime tools. | Remove or internalize all static helpers in this packet. | Keep exact behavior and focused tests; route any later static-surface cleanup to its own source-backed plan. | keep scoped |
| Remove `required` from query middleware args | Extension authors inspecting or forwarding `options.required`. | Middleware needs to know whether the caller expects a strict result. | Middleware should model the public query input, not an assertion side channel; strict static return contracts belong to their wrappers. | Public middleware args reuse read-option types; static runtime currently injects the flag. No live middleware caller branches on it. | Keep a private symbol/boolean in public middleware args. | Remove the field, positively type middleware options against the current public shape, source-audit stale fields, and assert strict static results after the full chain. | keep cut, revise runtime |
| Add internal `failInvariant` | Plite DOM/React/History package maintainers. | A shared helper couples sibling packages to another internal export; local throws are simpler. | Separate npm packages already share the internal subpath and peer-version together; duplicate failure helpers create drift. | Existing source imports and tsconfig mappings prove the sibling substrate contract. | Per-package helpers or root-public `invariant`. | Export only from `./internal`, add one direct test, require contextual messages, and forbid new Plate production imports for this cut. | keep |
| Use generic `Error`, not a public error class | Debuggers and tests wanting catchable error identity. | An invariant class enables monitoring and targeted recovery. | Recovery from a violated kernel invariant is unsafe; a class would become another public/internal contract. | Existing generic Plite invariant throws are not caught by class; DOM resolution already has its own domain error. | `PliteInvariantError` export. | Stable prefix plus caller context; DOM flows retain domain errors and normal invalid static targets retain detailed `NodeApi` errors. | keep simple error |
| Guard 19 DOM/input substrate reads | Runtime maintainers worried about hidden corruption. | Returning null/false can mask a genuine broken path. | These functions already define null, false, fallback, or catch behavior for stale external state; throwing changes browser behavior. | Exact call-site control flow in DOM resolution, selection reconciliation, clipboard, live state, and interaction owners. | Mechanically replace all 47 sites with invariant failures. | One optional lookup, preserve existing fallback, and add focused stale-path regression rows. | keep guards |
| Assert 19 substrate invariants | Runtime maintainers worried about new crashes. | Optional chaining everywhere is more resilient. | Silently continuing after same-snapshot operation/path invariants fail corrupts bookkeeping and makes later failures opaque. | Post-operation key maps, model-owned mutation paths, and normalized document boundary points are locally owned invariants. | Guard every missing result. | `?? failInvariant` on the first transaction-local result with operation/path context and representative failure tests. | keep assertions |
| Migrate 120 test reads without production strict mode | Test authors and package maintainers. | Two-line assertions make fixtures noisy and the production overload already solves it. | Test brevity cannot dictate the runtime API; explicit assertions improve fixture diagnostics. | 37 test files, including 20 strict-contract rows and 100 fixture reads; no current false/dynamic option callers. | Root-public helper or broad `@platejs/test-utils` dependency expansion. | Use `node:assert` for one-offs; add a test-local `must` only when reused at least three times in one file; rewrite contract rows around optional/malformed behavior. | keep cut |
| Keep Plate product code outside the assertion owner | Core/Diff maintainers already using other Plite internals. | Core is trusted framework code and should import the helper for concise invariants. | Trust is call-site-specific, not package-wide; Diff does own replay invariants but should report its own domain failure, not a Plite kernel failure. | 4 Core, 3 Diff, and 16 example uses; existing unrelated Core internal imports do not prove blanket assertion authority. | Plate wrapper or new Core/Diff internal import. | Core guards, Diff inline domain errors, examples guard; source audit forbids new production internal imports attributable to this cut. | keep boundary |
| Hard cut during v54 beta | Beta adopters and docs consumers. | Even beta users pay migration cost; defer until a later major or preserve a shim. | The package is already in beta pre-mode; shipping the polluted option makes later removal worse, but consumed changesets cannot own another beta. | Live manifests, `.changeset/pre.json`, config, Changesets dependent/link implementation, and `origin/main`. | Deprecated option, runtime shim, migration prose, or editing the already-consumed v54 major changeset. | Add five package-scoped beta patch changesets with final-state wording relative to `main`; align emitted peer floors; update current-state docs/examples and packed-package proof. | keep hard cut, revise release |

Ecosystem maintainer review:
| Owner position | Strongest challenge | Current evidence | Decision | Plan delta | Status |
|----------------|---------------------|------------------|----------|------------|--------|
| Plite API maintainer | A strict lookup is useful enough to deserve a named public method even if the boolean is bad. | Plite already has distinct strict static power functions; lifecycle reads otherwise model optional target resolution, and 12 overloads exist only to recover assertion semantics. | Keep lifecycle reads optional-only; do not add `getOrThrow`. | None. | closed |
| Extension author | Removing `options.required` could make middleware unable to preserve a caller's strict intent. | No live middleware branches on the field; strict static intent belongs to each wrapper and optional middleware result types require a final postcondition anyway. | Remove the field from public middleware args and assert strict wrapper results after the chain. | Positive middleware option/result type proof remains mandatory. | closed |
| DOM/React maintainer | Sharing `failInvariant` through `plite/internal` can break independently upgraded packages. | DOM and React already consume the internal subpath; current peers allow `>=54.0.0-beta.0`, while the new symbol requires the emitted Plite beta. | Keep one internal owner, publish aligned packages, and tighten floors to emitted versions. | Floors are computed after prerelease dry proof, never guessed in the plan. | closed |
| Plate Core/Diff maintainer | Trusted Plate framework code should reuse the Plite invariant helper. | Core absence flows already have product fallbacks; Diff owns replay-specific failures whose messages should name the failed replay operation. | No new Plate production import; Core guards and Diff throws domain errors. | None. | closed |
| Docs/examples maintainer | Guard-heavy samples make the API look weaker than strict examples. | Absence is a real public result and the table preflight plus strict read currently performs duplicate work. | Teach one optional lookup and a local guard; keep current-state prose only. | Browser smoke covers all changed canonical examples. | closed |
| Beta release maintainer | A blanket five-package changeset conflicts with one-package files and can narrate branch-only removals. | `.agents/rules/changeset.mdc` requires one package per file and wording relative to `main`; `origin/main` contains neither the Plite packages nor this flag, while pre-mode has consumed the v54 preparation changesets. Linked groups do not publish unchanged members automatically. | Use five separate patch files to publish the five runtime packages, describe their final behavior relative to `main`, and avoid removal/migration language. | Corrected every release row and added an origin-main wording audit. | closed |
| Test/browser maintainer | Full cross-browser proof is expensive for a type/API cut. | The changed DOM/React paths are exercised by owned focused Chromium rows and seven canonical routes; no browser behavior is intentionally changed. | Focused rows plus full Chromium `check:plite`; run the closure matrix only if Chromium exposes a behavior discrepancy. | Matrix is an escalation gate, not default proof. | closed |

Hard cuts and rejected alternatives:
| Option / API | Keep / cut / reject | Why | Migration cost | Evidence | Follow-up |
|--------------|---------------------|-----|----------------|----------|-----------|
| Lifecycle `{ required: true }` and strict overloads | cut | Assertion policy does not belong in normal state/transaction read options. | 195 literal uses plus public types/runtime/docs. | complete caller and interface audit | execute phased caller migration, then delete types/runtime branches |
| Public `getOrThrow`, `strict`, or `required.*` replacement | reject | Renames rather than removes the competing lifecycle contract. | none because it will not ship | ecosystem and owner analysis | none |
| Existing strict static power/runtime functions | keep scoped | Distinct function semantics already exist and are outside lifecycle option design. | add post-middleware proof only | package-root exports and VISION | separate plan if their public status is challenged later |
| Synthetic `required` query-middleware metadata | cut | Public middleware args should describe public query input. | seven wrapper edits and middleware type tests | middleware args/runtime audit | assert strict static final results instead |
| `failInvariant(message): never` under `./internal` | keep | Smallest cold-path failure owner with natural `??` inference. | one internal file/export/test | 26 target postconditions and existing sibling internal boundary | contextual messages mandatory |
| Root-public invariant helper or error class | reject | Would turn substrate failure policy into app API. | none | current generic error and package boundary audit | none |
| Plate/Core assertion wrapper | reject | Hides a Plite decision and grants product code blanket invariant authority. | none | exact Core/Diff caller audit | guards or domain errors stay at owners |
| Broad test-utils assertion helper | reject | Adds package dependencies and public testing surface for a one-time migration. | local assertions in 37 files | current test-utils adoption is incomplete and helper is not editor-specific | file-local helper only when reused |
| `hasPath` then strict read | reject | Double lookup and still encodes a race-shaped API pattern. | replace with one optional read | current DOM/example call sites | source audit preflight pairs |
| Compatibility alias, deprecated flag, or runtime shim | reject | Beta is the correct time for the clean cut; docs must teach only current state. | direct adoption required | beta pre-state and package-boundary audit | five package-scoped patch changesets plus current docs |

Plan deltas from review:
- Initial assumption tightened: `{ required: true }` is not internal-only in
  current source; it is explicitly documented and used by public Plite examples.
- Existing `@platejs/plite/internal` export boundary makes a real public hard
  cut feasible without inventing a Plate bridge.
- Provenance overturns the strongest keep argument: `{ required: true }` was
  added as the strict half of a safe-read migration, not because public callers
  need an assertion-policy API.
- No exact public issue/PR claim constrains the hard cut; adjacent stale-path
  and autofocus issues keep their existing owners and claim width.
- Closed issue-ledger machinery as N/A. Creating a synthetic issue row would
  weaken claim hygiene rather than improve it.
- Locked the owner line: `@platejs/plite/internal` is a real substrate contract
  already consumed by Plite History/DOM/React; Plate product code does not gain
  access merely because Core has other low-level bridge imports.
- Rejected all public strict variants, including a cleaner-looking
  `getOrThrow`; renaming the assertion policy would not internalize it.
- Added a one-lookup performance constraint: public guards and internal
  assertions must wrap the result, not preflight with `hasPath` or re-read the
  editor.
- Ecosystem evidence revised the helper direction from a return-value helper
  like `expectDefined(value)` toward a contextual assertion function with an
  explicit failure path; caller pressure then selected
  `failInvariant(message): never` because `??` preserves inference without a
  happy-path call or a second statement.
- Explicitly rejected Lexical's public `$getNodeByKeyOrThrow`: it solves a
  discoverable active-state API job, while Plite already has a private strict
  substrate and should not duplicate its public lifecycle.
- Closed the complete live inventory at 195 uses across 71 files: 47 substrate,
  23 public production/examples, 4 docs, 1 declaration, and 120 tests.
- Split substrate migration by behavior instead of syntax: 19 true invariants,
  19 stale/optional/domain flows, 7 strict static postconditions, and 2
  already-bounds-checked indexed reads.
- Locked the hard-cut order so public overload removal happens only after all
  callers compile against optional reads; this is sequencing, not a temporary
  compatibility layer.
- Added positive optional-return typing, malformed-input, middleware-payload,
  transaction-locality, DOM-staleness, package, docs, and Browser proof gates;
  rejected a dead-API `@ts-expect-error` test per repo testing doctrine.
- Corrected an over-cut found by the middleware objection: the seven static
  runtime sites back strict function contracts, including four package-root
  exports. They lose public `required` metadata but gain a post-chain invariant
  so middleware cannot silently return `undefined`.
- Scoped the claim precisely: public lifecycle `editor.read`/`state`/`tx`
  reads become optional-only; existing static power/runtime functions retain
  their separate strict semantics and are not promoted as normal authoring DX.
- Locked test adoption to `node:assert` for one-offs and a file-local helper
  only after three uses; no root-public invariant and no new broad test-utils
  dependency.
- Corrected release ownership twice: `.changeset/pre.json` already consumed the
  v54 preparation changesets, but `.agents/rules/changeset.mdc` requires one
  package per file and wording relative to `main`. Execution therefore creates
  five separate patch changeset files with final-state behavior, not branch-
  only removal prose, then aligns peer floors to versions emitted by the dry
  prerelease proof.
- Revision made the five release claims concrete: optional Plite lifecycle
  results, stale-path DOM/React fallback behavior, unavailable-target Core
  guards, and operation-specific Diff replay errors. Each has observable user
  impact relative to `main`; internal helper/caller choreography stays out of
  release notes.
- Applied performance as a bounded no-change lens: one lookup stays one lookup,
  with no new caches, effects, subscriptions, DOM, or performance claim.
- Applied TDD vertically to real failure paths: missing internal export, strict
  middleware returning `undefined`, stale runtime paths, and product fallback/
  error behavior. A dead-syntax type test remains rejected.
- Applied React and docs doctrine. Read handling changes do not justify hook,
  memoization, effect, component, or Plate UI redesign; docs remain terse
  current-state API references with the Chinese page kept aligned.

Open questions and decision-changing evidence:
| Question | Why it matters | Evidence needed | Owner | Status |
|----------|----------------|-----------------|-------|--------|
| Should the internal owner be a generic value helper or typed node/point/range helpers? | Determines call-site clarity, error context, and API duplication. | Complete caller and hot-path classification. | pressure pass | closed: use non-generic `failInvariant(message): never`; `??` performs inference |
| Can static primitives replace strict state reads without violating transaction-local snapshot semantics? | Avoids unnecessary helper API but stale reads would be a correctness bug. | Inspect every internal caller category and package-root export. | objection pass | closed: do not reroute state/tx callers; preserve the 7 existing strict static wrappers and assert their final middleware result |

Implementation phases with owners:
| Phase | Owner | Scope | Entry criteria | Exit criteria | Verification |
|-------|-------|-------|----------------|---------------|--------------|
| 1. Internal primitive | Plite | Add `failInvariant`, internal export, direct test, exact internal import-smoke expectation, and barrel output. | User accepts ready plan and invokes execution. | Source and built internal import work; helper throws stable prefix; no root-public export. | focused test, package typecheck/build, import smoke, `pnpm brl` |
| 2. Substrate callers | Plite/DOM/React | Apply exact 19 invariant / 19 guard / 7 strict static postcondition / 2 indexed-read ledger; preserve transaction-local reads and domain errors. | Phase 1 green. | No substrate `{ required: true }`; no new preflight/reread; strict static middleware overrides cannot return `undefined`. | focused tests/typechecks |
| 3. Public callers and tests | Core/Diff/apps/package owners | Guard 4 Core and 16 example callers; add inline domain errors to 3 Diff replay invariants; migrate 120 test uses with owner-local test assertions. | Internal callers no longer require strict overload. | No product import of internal helper; Diff cannot silently omit change records; affected packages typecheck/test. | affected package checks |
| 4. Public hard cut | Plite | Delete required option types/properties, lifecycle strict overloads, target-resolution boolean, runtime branches, and synthetic middleware metadata; preserve strict static wrappers with final-result postconditions. | All callers compile against optional lifecycle reads. | `{ required: true }` is rejected, lifecycle missing-target behavior is optional-only, and strict static helpers still throw/return non-optional values. | type/runtime/middleware tests |
| 5. Current-state docs | docs/apps | Rewrite four docs and changed examples around optional absence. | Public API cut compiles. | No strict-mode teaching or migration prose. | docs/app checks + Browser |
| 6. Release and closure | execution + release owner | Add five separate patch changeset files for Plite, DOM, React, Core, and Diff with final-state wording relative to `main`; derive DOM/React peer floors from the prerelease dry run; run aligned packed-package proof, lint, broad checks, source audit, and autoreview. | Focused gates green and current beta pre-state re-read. | Changeset status includes all five production packages, no changeset narrates branch-only removal, aligned package imports work, all commands are green, and no accepted actionable review finding remains. | origin-main wording audit, changeset status/version dry proof, builds/import smoke, `pnpm check:plite`, `pnpm check:core`, source audit, autoreview |

Release artifact contract:
| Package | Bump | Final-state user impact to express | Forbidden diary framing |
|---------|------|------------------------------------|-------------------------|
| `@platejs/plite` | patch | Lifecycle node, point, and range reads return `undefined` when a target is unavailable; strict static power functions keep their existing contracts. | “Remove `required`” or internal helper rationale. |
| `@platejs/plite-dom` | patch | DOM resolution tolerates stale mapped paths through its existing null/domain-error behavior. | Internal subpath/export choreography. |
| `@platejs/plite-react` | patch | Selection, focus, clipboard, and mounted-path reconciliation preserve their existing fallback behavior when external paths disappear. | Caller counts or assertion migration. |
| `@platejs/core` | patch | Autofocus, input-rule, and override flows skip unavailable public read targets instead of assuming they exist. | Plite migration bookkeeping. |
| `@platejs/diff` | patch | Invalid post-replay points and ranges fail with change-tracking operation context instead of a generic read failure. | Internal invariant ownership. |

Release proof order:
1. Re-read `origin/main` for every changeset claim and create one patch file per
   package.
2. Run `pnpm changeset status --verbose` and
   `pnpm changeset status --output=.tmp/required-read-release.json`; assert the
   JSON release set contains all five package names and capture each predicted
   `newVersion`.
3. Set DOM/React Plite peer floors and React's DOM peer floor to the predicted
   versions, then rerun status and the source-import peer-floor contract.
4. Build Plite, DOM, and React and run exact internal export/import smoke.
   Actual `changeset version` remains the CI release owner's mutation; do not
   run it destructively in the user's checkout for a fake dry run.

Fast driver gates:
| Gate | Cwd | Command / artifact | Proves | Status |
|------|-----|--------------------|--------|--------|
| caller-accounting audit | plate-2 | bounded `rg --count-matches "required:\\s*true"` over packages/apps/docs | all 195 current uses entered the migration ledger | complete: 71 files / 195 uses |
| public surface audit | plate-2 | `rg` for `required: true`, `required?: boolean`, and required option type names after execution | zero accepted-scope source matches | complete |
| internal-boundary audit | plate-2 | `rg` new `failInvariant` imports outside Plite substrate packages | zero matches outside Plite/DOM/React | complete |
| focused API/runtime gate | Plate repo root | invariant, state-query, query-extension, and import-smoke contracts plus type tests | 1 + 11 + 10 + 18 rows pass | complete |
| Plite behavior check | Plate repo root | `pnpm check:plite` | package types/tests and Chromium behavior pass | complete |
| Plate consumer check | Plate repo root | `pnpm check:core` plus affected Diff/feature checks | full reviewed-package check and focused suites pass | complete |
| beta package alignment | Plate repo root | five-package release coverage, status JSON, predicted versions, peer-floor and packed-import audit | all five predict beta.2; peer floors and release contracts pass | complete |
| planning artifact check | plate-2 | `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-15-internalize-required-node-reads.md` | plan/template integrity after all scheduled passes | complete: `[autogoal] complete` |

Final user-review handoff outline:
- Plite/Plate boundary:
  - `cut`: public lifecycle `editor.read`/`state`/`tx` options no longer carry
    assertion policy; Plate remains a public optional-read consumer.
  - `move`: trusted Plite substrate assertions use
    `@platejs/plite/internal` `failInvariant(message): never` only at proven
    invariants and strict static postconditions.
  - `gate`: Core and Diff do not gain the Plite assertion helper; Core guards
    absence and Diff owns operation-specific replay failures.
- public API target:
  - `cut`: delete `EditorRequiredQueryOptions`, inherited `required` fields,
    12 `{ required: true }` overloads, target-resolution boolean propagation,
    public-state runtime branches, and synthetic query-middleware metadata.
  - `keep`: lifecycle node/point/range reads return optional results for absent
    or unresolved targets; malformed inputs retain their existing validation.
  - `keep`: existing strict static `edges`, `first`, `parent`, and `range`
    functions retain non-optional/throwing semantics as a separate power
    surface, enforced after the complete middleware chain.
  - `cut`: no public `getOrThrow`, `strict`, `required.*`, renamed boolean,
    deprecation alias, compatibility shim, or Plate wrapper.
- runtime/default-route target:
  - `move`: 19 true substrate invariants use the first active-state/tx result
    with `?? failInvariant(context)`.
  - `keep`: 19 DOM/input/mount absence flows use one optional lookup and their
    existing null/false/fallback/domain-error behavior.
  - `keep`: 7 strict static wrappers assert final middleware output; normal
    invalid-target errors retain detailed low-level messages.
  - `cut`: 2 bounds-checked reads use the already-indexed child; all new
    `hasPath` preflights and editor-static rereads are forbidden.
  - `keep`: invariant errors use generic `Error` with stable prefix
    `Plite invariant failed:`; no catchable public error class.
- package/plugin target:
  - `move`: export `failInvariant` only through the existing Plite internal
    subpath and exact package import smoke.
  - `gate`: publish Plite, DOM, React, Core, and Diff through five separate
    patch changeset files with final-state user impact relative to `main`.
  - `gate`: compute DOM/React peer floors from Changesets predicted versions;
    mixed beta generations are unsupported and receive no runtime shim.
- docs/examples/browser proof:
  - `cut`: four docs and seven canonical examples teach optional reads plus
    owner guards only; current-state prose, including the Chinese API page,
    contains no migration narrative.
  - `gate`: execution proves the seven `apps/plite` routes, focused table/
    markdown/mention/rich-text/DOM rows, and full Chromium `check:plite`;
    cross-browser matrix runs only if Chromium exposes a behavior discrepancy.
- proof gates:
  - `gate`: vertical TDD covers the internal export, strict middleware
    postcondition, stale-path fallback, Core/Diff behavior, and public hard cut.
  - `gate`: positive optional-return type contracts and whole-graph typecheck
    replace a dead-API `@ts-expect-error` test.
  - `gate`: 120 test-only strict reads migrate to `node:assert` or a file-local
    throwing helper after three uses; production API is never retained for
    fixture brevity.
  - `gate`: focused Plite tests/typechecks/build/import smoke, affected package
    checks, `pnpm check:plite`, `pnpm check:core`, docs check, lint, source
    audits, release status proof, Browser, and autoreview must all pass.
- issue/provenance accounting:
  - `keep`: no public issue or PR owns this API cut; do not claim adjacent
    stale-path or autofocus reports.
  - `keep`: Slate `#6053` remains separately owned/closed; `#3858`, `#4081`,
    `#4323`, `#5213`, and `#4696` remain related or separately owned.
- next execution owners:
  - `gate`: execution starts only after user acceptance and a later explicit
    `plite-plan` invocation naming this plan; phases run Plite primitive,
    substrate callers, product/tests, public hard cut, docs/examples, then
    release/closure.
- needs user attention:
  - accept or reject this plan. Existing public strict static helpers are
    deliberately out of scope; challenge them through a separate plan rather
    than widening this packet during implementation.

Final completion gates:
| Gate | Required evidence | Status |
|------|-------------------|--------|
| score >= 0.92 and no dimension below 0.85 | scorecard rows cite evidence | complete: 0.95 total; floor 0.94 |
| all pass rows complete or skipped with evidence | phase/pass table closed | complete |
| issue/reference sync closed | issue-ledger sync status closed | complete: no exact claim or artifact mutation |
| live source grounding complete | source-backed rows cite current owners | complete |
| workspace verification recorded | verification workspace gate closed | complete: package, docs, Browser, release, and bounded source evidence recorded |
| autoreview clean or N/A | `.agents/skills/autoreview/SKILL.md` loaded and clean for non-trivial uncommitted implementation changes, or N/A with reason | complete: two accepted P2s fixed; second pass clean |
| final handoff emitted or lane remains pending | final response / next pass recorded | complete: full decision list materialized above and emitted at closeout |
| `check-complete` passes | `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-15-internalize-required-node-reads.md` | complete: `[autogoal] complete` |

Findings:
- The user-highlighted table example first checks `tx.nodes.hasPath`, then uses
  `tx.nodes.get(..., { required: true })`. That is redundant assertion syntax
  on a public teaching surface, not a good reason for a public option.
- The flag affects `nodes.first/get/leaf/path/parent`, `points.start/end/get`,
  and `ranges.edges/get`, so this is one cross-cutting public API mode, not a
  local `nodes.get` wart.
- The public option types themselves are not top-level named exports, but their
  properties are structurally exposed through public method signatures and
  overloads. Hiding the type name does not make the option internal.
- Plite already publishes an `./internal` subpath. The clean direction is to
  move assertion semantics there while keeping public reads optional.
- Commit `bf825e31e7` introduced the required overloads while changing
  formerly strict `get`/point/range reads to optional returns. The overload was
  the expedient migration valve for strict internal callers.
- Commit `139eaaab2e` later threaded the same flag through live NodeTarget
  resolution. That widened the flag's reach but added no public-DX rationale.
- The June 27 strict-path plan's statement that plain `nodes.get(invalid)` is
  strict conflicts with current source after safe-read completion; it is stale
  for this boundary decision.
- No exact public issue, PR, changeset, changelog, or issue-ledger row promises
  this flag. Cutting it does not falsify an issue-resolution narrative or
  broaden the related stale-path/autofocus claims.
- Historical plan template examples containing placeholder issue numbers are
  workflow prose, not issue linkage; the targeted audit found no actual claim.
- The internal subpath is already a normal sibling-runtime dependency for
  Plite History, DOM, and React. Adding one assertion primitive there does not
  create a new package relationship.
- Core and Diff have seven current production strict-read occurrences, while
  public examples have sixteen. Those are public-consumer migrations, not
  justification for letting Plate import the assertion owner.
- The table example's `hasPath` followed by strict `get` performs two checks.
  Optional `get` plus one guard is both cleaner and cheaper.
- Lexical separates nullable lookup from assertion and types its invariant as
  `asserts cond`, but also publicly exports an `OrThrow` convenience. Only the
  internal assertion mechanism fits Plite's smaller public surface.
- ProseMirror and Slate separate optional and strict operations by semantic
  method, never by a boolean mode option. Plite already has strict static
  power helpers plus internal primitives, so another lifecycle method is
  redundant.
- Tiptap commands guard or optional-chain nullable node lookups. That supports
  treating Plate product code as a public consumer rather than privileged
  substrate.
- No local Plite/Core assertion helper exists today, so execution needs one
  deliberate owner rather than consolidating existing competing helpers.
- Only 19 of 47 production sites are substrate-state invariants. Treating all
  47 as privileged strict state reads would preserve the same category error
  behind a new import.
- The other 19 substrate reads already have null, false, fallback, catch, or
  domain-error behavior. Optional reads express that behavior directly and
  remove redundant `hasPath` checks.
- Seven sites are strict static wrappers, not disposable metadata: their
  default callbacks are strict, but optional query-middleware results require
  a post-chain invariant. Only the two bounded child-index reads need no
  assertion.
- `failInvariant(message): never` is preferable to a generic value helper: it
  is absent from the hot path, requires contextual failure text, and lets `??`
  infer node/point/range results without exported advanced types.
- The three Diff reads are not ordinary absence-tolerant product reads. They
  happen after operation replay and feed required change records, so returning
  early would silently corrupt diff output; inline Diff-domain errors preserve
  the invariant without granting access to Plite internals.
- `.changeset/prepare-v54-beta-plite.md` and the Core counterpart are already
  listed in `.changeset/pre.json.changesets`. Editing either file cannot own
  this later beta packet.
- `origin/main` has no `packages/plite`, `packages/plite-dom`, or
  `packages/plite-react` manifests and no `{ required: true }` use in the
  bounded target packages. The flag is branch-local migration work, so release
  prose must describe the final package behavior rather than claim a public
  removal relative to `main`.
- Changeset doctrine requires one package per changeset file. Publishing the
  five changed runtime packages therefore means five patch files, not one
  multi-package file; linked-package configuration does not make this optional.
- Plite DOM and React consume `@platejs/plite/internal` at runtime. Introducing
  a new internal export creates a real aligned-beta requirement; a Plite-only
  changeset would publish a broken partial-upgrade path.
- The repository has no false or dynamic `required` caller, but literal search
  alone cannot prove external adoption. Positive current-type contracts, full
  graph typecheck, and exact owner deletion are the proof; a dead-API
  `@ts-expect-error` test is explicitly rejected.

Decisions and tradeoffs:
- Initial decision: cut the public mode flag. Cost is migration across docs,
  examples, feature tests, and internal packages; payoff is one honest public
  read contract and no assertion-by-boolean API.
- Do not replace it with `getOrThrow` publicly. That merely renames the same
  problem and preserves overload/failure-policy surface.
- Do not use non-null assertions internally. Loud runtime invariant failures
  are valuable; they need an explicit internal owner and useful error context.
- Treat historical plans as provenance, not vetoes. Their valid invariant is
  “internal bugs fail loudly”; their public boolean mechanism is replaceable.
- Skip ClawSweeper for this lane. Issue tools are for real issue claims, not a
  ritual every time a public API changes.
- Plite substrate packages may assert through the internal boundary; Plate,
  examples, and public docs may not. This is intentionally stricter than the
  current repo's broad use of Plite internals for unrelated Core bridges.
- Preserve transaction-local values by asserting the optional result. Do not
  substitute a second editor-static lookup just to obtain a throwing type.
- Use `failInvariant(message): never` at proven substrate invariants and strict
  static postconditions only. Nullish coalescing keeps the first result,
  infers the non-optional value, and executes no helper call on the valid path.
- Do not mechanically replace every strict call with `failInvariant`. A stale
  DOM path, external target, or “not full selection” probe is data, not a Plite
  invariant violation.
- External precedent is advisory. We steal mechanisms, not Lexical `$` names,
  ProseMirror position ontology, Tiptap command layering, or a new Slate-style
  dual lifecycle getter surface.
- Preserve existing public static `edges`, `first`, `parent`, and `range` as
  separate power/runtime functions. This plan removes lifecycle assertion
  options; it does not smuggle a second static-surface cleanup into the cut.
- Release Plite, DOM, React, Core, and Diff together through five separate
  beta patch changeset files. Describe final behavior relative to `main`, set
  DOM/React peer floors from the versions emitted by prerelease dry proof, and
  treat mixed beta generations as unsupported rather than carrying a shim.
- Diff owns its own replay error messages; Core and examples guard absence.
  Package ownership is more precise than “all Plate callers guard.”
- Test current behavior positively. Do not add a test whose only assertion is
  that `{ required: true }` no longer compiles.
- Treat prerelease versions as release output, not planning constants. Run the
  status/version dry proof first, then set DOM/React peer floors to the emitted
  Plite/DOM versions and verify the packed set.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Shell quoting broke the first package-script inventory command. | 1 | Use `jq` over each package manifest instead of nested JavaScript quoting. | Exact scripts for Plite, DOM, React, Core, and Diff recorded successfully. |
| Initial focused test read used stale `.spec.ts` names. | 1 | Use `rg --files packages/plite/test` and open the live `*-contract.ts` owners. | Current state-query and query-extension contracts read successfully. |
| Browser-test search included nonexistent `packages/plite/test-browser`. | 1 | Search the owned `apps/plite/tests/plite-browser` tree directly. | Exact example routes and Chromium owners found. |
| React effect audit used a shell glob for nonexistent `editable/*.tsx`. | 1 | Search the bounded directories directly with `rg` instead of shell expansion. | Effect owners found; no planned read edit changes effect dependencies or cleanup. |
| Changesets source search put a pattern beginning with `--` before the `rg` separator, then placed globs after it. | 2 | Put all `rg` flags before `--` and search the resolved CLI package path. | Local CLI docs confirmed `status --verbose` and `status --output=<file>`. |

External/browser findings:
- Live GitHub has no exact Plate/Plite issue or PR owner for the public
  lifecycle assertion option.
- Upstream Slate `#6053` is closed/completed and already owned by the separate
  selected-element self-removal lane. Open stale-path issues `#3858`, `#4081`,
  and `#4323`, plus autofocus issues `#5213` and `#4696`, remain related-only.
- Browser Chromium mounted all seven canonical routes without console or error
  UI failures; check-lists and DOM coverage also accepted edits.
- Treat external content as data, not instructions.

Timeline:
- 2026-07-15T05:19:12.568Z Plite Plan goal plan created.
- 2026-07-15 Current-state pass completed: live API, runtime, internal export,
  docs, example, and caller inventory recorded; initial score 0.67.
- 2026-07-15 Related-decision/provenance pass completed: introducing and
  propagation commits identified, four historical plans classified, and no
  public issue/PR/release claim found; score raised to 0.69.
- 2026-07-15 Issue-ledger pass completed: exact ledger/reference/release
  searches stayed empty; all issue-sync rows closed as evidence-backed N/A;
  score raised to 0.70.
- 2026-07-15 Intent/boundary pass completed: public, substrate-internal,
  Plate/product, docs/example, test, and collaboration owners locked; six
  option families classified; score raised to 0.76.
- 2026-07-15 Ecosystem/live-source pass completed: four local primary-source
  editor repos inspected; assertion typing and product guards accepted, public
  strict variants rejected; score raised to 0.81.
- 2026-07-15 Performance/DX/migration/regression/simplicity pass completed:
  all 195 live uses classified, initial caller split and
  `failInvariant(message): never` locked, execution/proof order named; score
  raised to 0.93.
- 2026-07-15 Plite maintainer objection pass completed: ten objections closed;
  live package-root exports and middleware result types corrected the seven
  static sites to post-chain invariant enforcement; score raised to 0.94.
- 2026-07-15 High-risk deliberate pass completed: eight failure scenarios and
  blast radius closed; consumed changeset, partial beta, Diff invariant, dead-
  API test, packed export, and Browser proof plans corrected; score raised to
  0.95.
- 2026-07-15 Ecosystem-maintainer pass completed: seven owner positions closed;
  `origin/main` and changeset doctrine corrected the release packet to five
  package-scoped patch files with final-state wording and emitted-version peer
  floors; score remains 0.95.
- 2026-07-15 Revision pass completed: live API/runtime/tests/docs/manifests and
  performance, TDD, React, and docs skills re-read; concrete release impacts,
  vertical test slices, no-change performance budget, effect non-scope, and
  non-destructive prerelease proof order locked; score remains 0.95.
- 2026-07-15 Issue-sync accounting completed: exact local searches remained
  empty; live Plate/Slate searches found no exact owner; adjacent stale-path
  and autofocus issues were classified related-only, with `#6053` already
  closed and separately owned; no ledger/PR artifact mutation required.
- 2026-07-15 Closure-score-and-final-gates pass completed: the weighted score
  remains 0.95 with a 0.94 floor; every planning pass, applicability decision,
  provenance row, and user-review decision is closed. Execution proof remains
  deliberately future work after plan acceptance.
- 2026-07-15 Execution completed: public strict lifecycle reads were cut,
  callers/docs/tests/release metadata migrated, package and Browser proof
  passed, two autoreview findings were repaired, and the second review is clean.

Verification evidence:
- Source audit: the initial raw Plite/DOM/React search found 48 occurrences;
  the complete classification separates 47 production substrate calls across
  18 files from the public declaration occurrence.
- Complete caller audit: `rg --count-matches` found 195 literal uses across 71
  files: 47 substrate, 23 public production/examples, 4 docs, 1 declaration,
  and 120 tests.
- Internal context audit: every one of the 47 substrate calls was read and
  assigned to 19 substrate invariant, 19 guard/domain-fallback, 7 strict static
  postcondition, or 2 indexed-read actions; mixed files retain mixed semantics.
- Source read: public overloads and option propagation verified in
  `packages/plite/src/interfaces/editor.ts`; runtime branching verified in
  `packages/plite/src/core/public-state.ts`.
- Export read: `packages/plite/package.json` exposes `./internal`, backed by
  `packages/plite/src/internal/index.ts`.
- Docs read: four current docs files across three conceptual surfaces teach the
  strict flag publicly, including the Chinese editor-API translation.
- Execution pass: focused invariant/state/query/import/Diff/selection suites,
  eleven modified-package typechecks, `check:plite`, `check:core`, docs checks,
  barrel generation, release status, and Browser proof passed.
- Requirement audit: the plan decides the public/internal boundary, accounts
  for all 195 literal callers, names every package and release owner, and gives
  executable type/runtime/browser proof for the later implementation packet.
- Planning/execution boundary audit: current-source reads and the mechanical
  plan checker are planning evidence; package tests, Browser proof, release
  artifacts, and autoreview remain mandatory execution gates and are not
  claimed green here.
- Final artifact check: `node .agents/skills/autogoal/scripts/check-complete.mjs
  docs/plans/2026-07-15-internalize-required-node-reads.md` passed with
  `[autogoal] complete` after the complete user-review handoff was recorded.
- Provenance audit: `git log -S` identified `bf825e31e7` as the safe-read
  overload introduction and `139eaaab2e` as NodeTarget propagation; focused
  diffs verified both claims.
- Historical-decision audit: June 27 safe-read/strict-path and July 9
  NodeTarget/parity plans read at their decision, proof, and objection rows.
- Issue/release search: exact target terms returned zero local matches in
  `docs/plite-issues`, `docs/plite/ledgers`, `docs/plite/references`,
  `.changeset`, and package changelogs. Live Plate searches returned zero exact
  issues and zero Plite read/invariant PRs; old release PR `#3176` was a false
  tokenized neighbor.
- Current issue-ledger closure audit: broader stale-path and autofocus searches
  surfaced existing classifications only. `#6053` remains owned by its exact
  hook plan; `#3858`, `#4081`, `#4323`, `#5213`, and `#4696` remain related or
  separately owned. No row changes category because this plan proves none of
  their exact repros.
- Live GitHub state audit: upstream `#6053` is closed/completed as of
  2026-07-09 after a cross-reference from PR `#6073`; the five related issues
  above remain open. Generated historical ledgers are not hand-edited to mimic
  live state.
- Boundary audit: current `@platejs/plite/internal` imports prove existing
  Plite History/DOM/React dependency; package manifests confirm sibling
  dependencies; production strict-read counts are 4 Core, 3 Diff, and 16
  public example occurrences in the sampled product/teaching scope.
- Public type audit: 12 strict overload signatures plus shared required-option
  inheritance across node/path/point/range read options remain in
  `interfaces/editor.ts`.
- Primary-source ecosystem audit: Lexical `d52f66e25`, ProseMirror Model
  `6264de0`, Tiptap `91c51be53`, and Slate `945a484df` read locally at the
  exact lookup/assertion owners recorded above.
- Local helper audit: no existing `invariant`, `expectDefined`,
  `assertDefined`, or `assertPresent` owner exists across Plite, DOM, React, or
  Core source.
- Package proof audit: current manifests expose package-local typecheck/tests;
  root scripts provide `check:plite`, `check:core`, `brl`, and `lint:fix` for
  the execution gate stack.
- Static-surface audit: the package root exports four strict static helpers;
  three more strict methods exist only in `InternalEditorQueryRuntime`. The
  boundary claim is therefore lifecycle-optional, not universally optional.
- Middleware audit: public query result types are optional; no live middleware
  implementation branches on `options.required`; post-chain assertion is
  necessary to preserve strict static return contracts after removing metadata.
- Release audit: Plite, DOM, and React are `54.0.0-beta.0`; the existing
  `.changeset/prepare-v54-beta-plite.md` established the v54 lifecycle API
  shape but is already consumed by pre-mode.
- Beta pre-state audit: `.changeset/pre.json` already lists the Plite and Core
  v54 preparation changesets, so a new changeset is required for another beta.
- Origin-main audit: the Plite/DOM/React packages and the target strict flag do
  not exist on `origin/main`; changeset prose cannot honestly describe this as
  a removal relative to the release baseline.
- Changeset-doctrine audit: `.agents/rules/changeset.mdc` requires one package
  per file and final impact relative to `main`; the release gate now requires
  five separate patch files and an origin-main wording review.
- Changesets implementation audit: linked packages synchronize only packages
  already releasing, while dependent bumps occur only when ranges demand it;
  broad `>=54.0.0-beta.0` peers do not automatically publish DOM/React or
  protect the new internal import.
- Production-package audit: this packet changes runtime source in Plite, DOM,
  React, Core, and Diff; test-only feature-package edits do not need release
  entries.
- Package-import audit: `public-package-import-smoke.test.ts` owns exact
  `@platejs/plite/internal` runtime exports and must include `failInvariant`.
- Browser-owner audit: `apps/plite` imports the canonical www examples and owns
  exact routes/tests for all seven changed examples, including table, markdown,
  mention, rich-text, checklist, and DOM-coverage behavior.
- Implementation-skill audit: performance, TDD, React, and docs doctrine were
  read and applied; source search found no planned effect dependency/listener/
  cleanup change and no component or Plate UI surface, so those lenses are
  recorded as N/A with triggers if execution scope changes.
- TDD-owner audit: live Plite tests provide `state-query-contract.ts`,
  `query-extension-contract.ts`, and exact public package import smoke; Diff's
  existing `with-change-tracking.spec.ts` owns replay behavior. The plan uses
  these public/observable owners rather than private-method tests.
- Changesets CLI audit: local `@changesets/cli` 2.30.0 documents
  `status --verbose` and `status --output=<file>`; the release proof can obtain
  predicted versions without mutating package manifests through
  `changeset version`.
- Revision artifact check: `check-complete.mjs` correctly remains red only for
  the three closure checklist rows, unresolved planning completion gates, and
  the scheduled issue-sync/closure pass rows. It reported no missing required
  section or malformed completed row.
- Issue-sync artifact check: rerunning `check-complete.mjs` after this pass
  removed issue accounting from the open-status list. Only the three planned
  closure checklist rows, planning completion gates, and the final closure
  phase remain.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Required-read hard cut implemented and verified |
| Where am I going? | Final checker and concise user handoff |
| What is the goal? | Decide and prove the public/internal required-read hard cut |
| What have I learned? | Public lifecycle reads need one optional contract; trusted substrate invariants need an internal assertion primitive; strict static helpers are a separate semantic surface |
| What have I done? | Cut the public option, migrated every accepted caller, aligned release metadata, passed package/docs/Browser proof, and closed autoreview |

Open risks:
- Changesets status emits expected prerelease peer-floor warnings because the
  manifests deliberately target the predicted beta.2 packet before CI versions
  package manifests. Status exits successfully and all five releases align.
- Root `pnpm lint:fix` still reports unrelated app/donor baseline diagnostics;
  owning package lint and the required Plite/Core checks pass.
- Generated registry JSON retains the pre-source-sync selection class. Repo
  doctrine reserves that output for CI; all owned source uses `plite-selectable`.
