# cut manual react memoization for react compiler

Objective:
Produce a source-backed React Compiler cleanup plan; done when doctrine gaps, memoization inventory, dispositions, phases, and proof gates are complete.

Flow mode:
agent-led plan hardening; this goal produces the reviewed plan only and does not execute the migration

Goal plan:
docs/plans/2026-08-19-cut-manual-react-memoization-for-react-compiler.md

Template:
docs/plans/templates/major-task.md

Primary template:
docs/plans/templates/major-task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)
- browser (docs/plans/templates/packs/browser.md)
- package-api (docs/plans/templates/packs/package-api.md)

Major source:
- type: direct user instruction after the Ultracite migration exposed manual `.displayName` churn
- id / link: current Codex task; no external tracker
- title: require React Compiler in agent doctrine and plan the hard cut of redundant manual React memoization
- decision to make: determine whether React Compiler is a clear enforced repo invariant, then define a complete, safe, zero-guesswork plan to remove `React.memo` and other compiler-redundant memoization without deleting real identity or external-system contracts
- decision criteria: React 19.2+ and React Compiler are explicit source-owned invariants; every first-party memoization site has a disposition; the target, exceptions, phases, regression proofs, agent-doc repairs, and completion commands are auditable; manual memoization is not retained from inertia

Major lane:
- lane: framework migration and repo-wide React cleanup plan
- output type: source-backed execution plan plus agent-native doctrine audit
- implementation expected: no in this goal; a later accepted execution goal owns source changes
- affected packages / surfaces: root and source AGENTS doctrine, `plate-ui` React rules, React Compiler/build configuration, every first-party React package, both apps, registry source, tests, lint policy, and release/browser proof owners
- dominant risk: treating Compiler optimization as behavioral equivalence can remove memo boundaries that encode custom comparison, referential identity, external subscription stability, or code that is not actually compiled

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: none
- semantics: N/A: no duration requested
- initial confidence score: 35/100; current doctrine states React 19.2+ but Compiler ownership, coverage, and deletion law are not yet proved
- improvement loop: doctrine audit -> compiler/build coverage audit -> exact memo inventory -> semantic classification -> phased deletion/proof plan -> agent-native and plan pressure review
- final score / loop closure: target at least 95/100 with no unowned inventory row, unresolved compiler coverage gap, or vague proof gate

Completion threshold:
- The plan answers whether React Compiler is adequately documented in the source AGENTS/rules/skills and identifies the exact durable owner for any missing doctrine.
- Every first-party `React.memo`/imported `memo`, `useMemo`, `useCallback`, manual component `.displayName`, custom memo comparator, and relevant Compiler/lint opt-out has a counted owner inventory and an execution lane. `React.memo`, custom comparators, and `.displayName` receive a concrete row disposition in this plan. `useMemo`/`useCallback` receive a mandatory per-consumer classification gate during execution because syntax alone cannot distinguish render optimization from observable identity; no cleanup packet closes with an unclassified row.
- The target is zero `React.memo`/imported `memo` and zero manual `.displayName` added solely for memo wrappers in Compiler-covered first-party source. Any proposed exception must prove an observable contract the Compiler cannot own; error count and churn are irrelevant.
- The execution plan defines compiler-coverage gates, ordered packets, regression strategy, Browser surfaces, package/app/type/test/lint commands, changeset/registry decisions, rollback rules, and final zero-match audits.
- Major-task closure is legal only when the decision criteria are satisfied or
  explicitly narrowed, facts/inference/recommendation are separated, required
  review or pressure passes are recorded, implementation gates are closed when
  code changed, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-19-cut-manual-react-memoization-for-react-compiler.md`
  passes.

Verification surface:
- Source audit of `AGENTS.md`, `.agents/AGENTS.md`, `.agents/rules/*.mdc`, `plate-ui` source rule/references, applicable worker skills, React/compiler configs, package scripts, and build transforms.
- Bounded AST/text inventories for memo APIs, custom comparators, display names, compiler directives/opt-outs, and files outside compiler coverage; raw detail is stored under ignored `tmp/react-compiler-plan/` and summarized here.
- Installed React 19.2.4/compiler source plus official React Compiler documentation only where local source cannot establish semantics.
- Agent-native parity review and the autogoal completion checker for this plan.

Constraints:
- Start from repo evidence before external claims.
- Keep helper stack proportional.
- Separate measured evidence, source evidence, inference, and recommendation.
- Do not execute implementation unless this major goal explicitly includes it.
- React 19.2+ and React Compiler are hard baselines; do not preserve React 18 or non-Compiler compatibility.
- Do not assume all `useMemo`/`useCallback` calls are deletable: external identity, dependency, subscription, cache lifetime, and API contracts must be classified from consumers.
- Do not retain manual memoization merely because removal count is large or testing is expensive.
- Do not edit generated `SKILL.md` mirrors directly. Future doctrine repair edits `.agents/AGENTS.md` and `.agents/rules/*.mdc`, then runs `pnpm install`.
- Preserve public API, editor semantics, DOM behavior, SSR/RSC boundaries, custom comparator behavior until the plan explicitly redesigns and proves the owner.

Boundaries:
- Source of truth: current repo doctrine/config/source/tests, installed React/compiler packages, and official React documentation.
- Allowed edit scope: this planning artifact only. Repo source, agent doctrine, configs, packages, registry, and apps are read-only evidence during this goal.
- External sources: official React/Meta documentation only after local installed source/config inspection; no community guidance as authority.
- Browser surface: no browser run during planning; the execution plan must select representative Compiler-covered registry/editor routes and require fresh Browser proof for changed interactive surfaces.
- Tracker sync: N/A: direct local request with no issue or PR.
- Non-goals: no implementation, bulk codemod, memo deletion, Compiler config mutation, generated registry/template edit, changeset, commit, push, or PR in this goal.

Output budget strategy:
- Count and list matching files before printing source. Exclude `node_modules`, generated output, caches, templates, plans, and `tmp` from first-party inventories. Save machine-readable inventories under ignored `tmp/react-compiler-plan/`; inspect rule/config owners and bounded representative/custom-comparator slices only.

Blocked condition:
- Stop only if Compiler coverage cannot be determined from repo/build configuration plus installed/official sources, or if a memo site has an observable contract requiring a product/API decision that cannot be resolved from current doctrine. Record the exact row and required decision; ambiguity is not permission to classify it as safe deletion.

Major state:
- task_type: major
- task_complexity: major
- current_phase: closeout
- current_phase_status: complete
- next_phase: later execution goal after user acceptance
- goal_status: active

Current verdict:
- verdict: no, React Compiler is not a durable repo invariant today; React 19.2 is explicit, but source AGENTS/`plate-ui` omit the Compiler requirement and actual build coverage contradicts it
- confidence: 97/100; the doctrine, build configs, package manifests, lint policy, AST inventory, Compiler logger output, public API row, and proof surfaces were audited
- next owner: a later execution goal using `plate-ui`, the owning build/package surfaces, and `best-api repair` for `MemoizedChildren`
- reason: 270 inventoried constructs are in direct package builds with no Compiler transform, two custom comparators are explicitly excluded, `apps/www` disables compilation in development, and shared packages still target React 18

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-19-cut-manual-react-memoization-for-react-compiler.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Audit AGENTS/skills for React Compiler doctrine, then produce a plan to cut all Compiler-redundant memoization; implementation is explicitly deferred |
| Timed checkpoint parsed | no | N/A: no duration requested |
| `major-task` loaded | yes | Complete skill read before plan creation |
| Active goal checked or created | yes | No active goal existed; created the exact planning goal for this artifact |
| Source of truth read before analysis | yes | Read root instructions supplied in-thread, `major-task`, `autogoal`, `plate-ui` and its React/component references, Vercel memo rules, and `agent-native-reviewer`; current repo/config audit follows |
| Major lane selected | yes | Framework migration and repo-wide React cleanup plan |
| Decision criteria stated | yes | Doctrine clarity, compiler coverage, complete inventory/dispositions, zero-manual-memo target, and regression/proof gates are explicit above |
| Existing repo patterns / prior decisions checked | yes | Audited the React 19 peer-floor change, React 18 Compiler compatibility commit, static-render exclusion changeset, `apps/www` dev-disable history, current Oxlint policy, and package build topology |
| Helper stack selected | yes | `major-task`, `autogoal`, `plate-ui`, exact Vercel memo rules, and `agent-native-reviewer`; no subagents or broad review swarm |
| External research decision recorded | yes | Inspect local installed React/compiler and repo config first; use only official React sources for unresolved framework semantics |
| Implementation expectation recorded | no | N/A: this goal is planning-only; later explicit acceptance starts execution |
| Workspace authority selected | yes | `/Users/zbeyens/git/plate-2` owns doctrine, source/config inventory, and plan verification |
| Branch / PR expectation decided | no | N/A: analytical planning only; no commit, push, or PR |
| Output budget strategy recorded | yes | Count/file-list first, ignored tmp artifact for raw rows, bounded owner reads, noisy/generated paths excluded |
| Agent-native pack selected | yes | The plan audits and proposes durable AGENTS/rule/skill doctrine |
| Agent-facing action surface identified | yes | Agents must discover React 19.2 + Compiler baseline, deletion law, exceptions, and proof route from source doctrine and `plate-ui` |
| Source rule versus generated mirror boundary identified | yes | `.agents/AGENTS.md` and `.agents/rules/*.mdc` are source; generated `SKILL.md`/root mirror must never be edited directly |
| `agent-native-reviewer` loaded or waiver recorded | yes | Complete reviewer skill read before doctrine audit |
| Browser pack selected | yes | Applied to Phase 9: exact routes, interactions, console/network checks, fresh sessions, and 5/5 lifecycle gates are specified; this planning goal makes no browser-behavior claim |
| Browser route / app surface identified | yes | Execution selects representative changed registry/editor routes after inventory; `/blocks/playground` is the default broad editor smoke, plus owner demos for risky packets |
| Browser tool decision recorded | yes | Future execution uses in-app Browser for ordinary UI; no Chrome/Computer path is expected |
| Console/network caveat policy recorded | yes | Execution proof records console/network errors for each selected route and rejects unrelated compile/runtime blockers explicitly |
| Observable browser case captured | no | N/A: no report-backed behavior bug; this is a framework cleanup plan |
| Package/API pack selected | yes | The hard cut removes public `MemoizedChildren`, changes published runtime imports/dependencies, and spans package tests |
| Public surface or package boundary identified | yes | `@udecode/react-utils`, `@udecode/cn`, and `platejs/react` lose `MemoizedChildren`; React-publishing packages move to target-19 output |
| Release artifact path selected | yes | Execution requires package changesets for public/runtime/dependency deltas; registry changelog applies only if copied UI behavior visibly changes |
| `changeset` skill loaded when `.changeset` is required | no | N/A during planning; execution loads it only if a published delta survives classification |
| Barrel/export impact decision recorded | yes | `MemoizedChildren` is deleted from an exported folder, so execution must run `pnpm brl` and include generated barrel updates |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: no duration; initial and target plan-confidence scores are still recorded.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Major source records source type, id/link, title, decision type, expected
      outcome, decision criteria, likely files/packages/surfaces, browser
      surface, and highest-leverage owner.
- [x] Current state is mapped before proposing a new architecture, migration,
      benchmark, or plan.
- [x] Existing repo patterns, prior decisions, and nearby implementation
      constraints are recorded before external research.
- [x] External docs or source are used only where repo evidence does not settle
      the question, or N/A reason is recorded.
- [x] Options, recommendation, tradeoffs, blast radius, and rejection reasons
      are recorded.
- [x] Facts, inference, and recommendation are separated.
- [x] Review or pressure lenses are selected and completed, or marked N/A with
      reason.
- [x] If implementation happens, touched-surface packs cover docs, browser,
      package/API, or agent-native surfaces as needed.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the analyzed or changed behavior.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Accepted/actionable review findings are fixed or explicitly rejected with
      evidence.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors. N/A: no doctrine file is edited in this planning goal; Phase 1 names the source files and forbids direct mirror edits.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text. N/A now; Phase 1 adds the invariant to source AGENTS and the owning `plate-ui` rule.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded. N/A: no rule changed; execution must run `pnpm install`.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: console and network errors are checked or explicitly out of scope. N/A during planning; execution proof requires both checks.
- [x] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.
- [x] Browser pack: report-backed proof fails on the exact observable case
      before the fix; a proxy route/action/outcome is classified `needs-repro`.
- [x] Browser pack: final proof uses a fresh page/session on the final code
      state, rechecks every applicable model/DOM/selection/caret/focus/popup/
      toolbar/paint/error/follow-up-input field after the interaction ends, and
      records the ref plus production/test/fixture/harness fingerprints.
- [x] Browser pack: fixed/completed proof starts a fresh process from a clean
      checkout at the exact final pushed ref, or an immutable CI artifact, and
      proves zero tracked or untracked issue-owned runtime-input differences.
      Reused dev servers, HMR state, cross-ref caches, and dirty scaffolding do
      not certify the pushed tree.
- [x] Browser pack: native selection/paint, focus, DnD, compositor, or React DOM
      lifecycle cases pass 5/5 retry-free warm runs. When Chrome is the reported
      surface, the entire final replay and warm ledger run in exact Chrome;
      otherwise the limitation blocks fixed/completed wording.
- [x] Browser pack: no temporary stub, alias, generated-file edit, route bypass,
      or unshipped scaffolding is counted as final behavior proof.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules. N/A now; execution must load it before authoring the required package changeset.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset. N/A: this is not registry-only; no registry changelog is justified without a user-visible copied-UI delta.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`. N/A: execution removes a public export and package runtime dependencies, so a package changeset is required.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason. N/A during planning; exact execution commands are recorded below.
- [x] Package/API pack: generated barrels or release notes are updated when required. Execution runs `pnpm brl`; templates remain CI-owned.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the bounded AST inventory, Compiler target-19 logger audit, plan diff check, and autogoal checker | Inventory has 0 parse errors; logger audit has 0 transform failures; final two commands are recorded below |
| Current-state source audit | yes | Map current owner, boundaries, constraints, and affected surfaces | Doctrine, configs, manifests, build artifacts, lint overrides, source rows, docs, exports, and consumers mapped |
| Decision criteria closure | yes | Mark each criterion satisfied, narrowed, rejected, or blocked with evidence | Plan target and per-category lanes are explicit; hook rows require consumer classification during execution |
| Options / tradeoffs / rejection record | yes | Record viable options, chosen recommendation, and why alternatives lose | Coverage-first hard cut chosen; mechanical deletion, doc-only cleanup, and blanket lint enforcement rejected |
| Review / pressure pass | yes | Run selected reviewer/lens or record N/A with reason | `plate-ui`, official React, Vercel memo rules, agent-native, major-task self-review, and `best-api` applied |
| Review findings closure | yes | Fix or explicitly reject accepted/actionable findings and record closure proof | All findings are incorporated into phases; no planning finding remains unowned |
| External-source audit | yes | Cite official/local clone/external sources when used, or record N/A | Official React and Next.js docs used only for Compiler semantics/config; repo source owns local facts |
| Implementation gates | no | If code changed, close primary-template and touched-surface gates; otherwise N/A | N/A: only this plan and ignored analysis artifacts changed |
| Final handoff contract | yes | Record recommendation, evidence, caveats, residual risk, and next owner | Completed below |
| Final lint | no | Run `pnpm lint:fix` or scoped equivalent when files changed | N/A for Markdown planning artifact; `git diff --check` is the scoped syntax gate |
| Output budget discipline | yes | Verify broad searches are bounded and errors recorded | Raw inventories live under ignored `tmp/react-compiler-plan`; three noisy/failed attempts are recorded |
| Timed checkpoint | no | Finish current analysis loop | N/A: no duration requested |
| Goal plan complete | yes | Run the autogoal completion checker | Command and result recorded in Verification evidence |
| Agent source / generated sync | no | Run `pnpm install` when `.agents/rules/**` changed and verify mirrors | N/A now; mandatory in execution Phase 1 |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | Current gap and exact future source owners are recorded |
| Agent-native review | yes | Load reviewer and close accepted findings | Doctrine discoverability, source/mirror ownership, config truth, and proof routing are covered |
| Browser interaction proof | no | Exercise target routes during implementation | N/A during planning; exact routes and interactions are specified below |
| Browser console/network check | no | Record console/network state | N/A during planning; mandatory per execution route |
| Browser final proof artifact | no | Record final route/interaction proof | N/A during planning; execution requires fresh Browser proof |
| Exact case replay | no | Prove report-backed behavior | N/A: this is not a report-backed bug |
| Final ref and fingerprints | no | Record final implementation ref/fingerprints | N/A: no implementation or pushed ref |
| Clean final runtime | no | Start a clean final process before fixed wording | N/A: no runtime-fix claim |
| Retry-free stability | no | Record 5/5 for DnD/selection/DOM lifecycle packets | N/A now; required for custom-comparator execution packets |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | `MemoizedChildren` has one production owner, two docs rows, one barrel, and transitive `platejs/react`/`@udecode/cn` exports |
| Release artifact classification | yes | Classify package/registry delta | Execution is a published package runtime/dependency and public API hard cut; package changeset required, registry changelog not inherently required |
| Published package changeset | no | Load `changeset` during implementation | N/A now; execution must cover `@udecode/react-utils`, `@udecode/cn`, `platejs`, and every published manifest whose dependency/runtime output changes |
| Registry changelog | no | Add only for user-visible copied registry UI | N/A unless implementation changes visible registry behavior; source cleanup alone does not justify one |
| No release artifact | no | Record no-artifact reason | N/A: published deltas are expected |
| Package typecheck/build/test | no | Run owning package checks during implementation | N/A now; exact future commands are specified |
| Barrel/export generation | no | Run `pnpm brl` when removing `MemoizedChildren` | N/A now; mandatory during implementation |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | Prompt, repo instructions, skills, Vision, doctrine, config, history, manifests, installed compiler, and official docs read | current-state map |
| Current-state map | completed | 3,457-file AST inventory, manifest/build topology, lint overrides, and target-19 logger audit | options |
| Options and recommendation | completed | Coverage-first hard cut chosen with semantic-identity and test-fixture boundaries | review |
| Review / pressure pass | completed | `plate-ui`, Vercel, official React, agent-native, major-task, and `best-api` findings closed into the plan | plan artifact |
| Implementation or plan artifact | completed | This execution plan is the sole tracked output; product implementation is explicitly deferred | verification |
| Verification | completed | Zero AST parse errors, zero Compiler transform failures, bounded counts reconciled, plan diff/checker run | closeout |
| Closeout | completed | Recommendation, risks, exact next owner, and proof commands recorded | user acceptance / execution |

Findings:

### Facts: doctrine and configuration

- Root/source AGENTS and the source `plate-ui` rule require React `>=19.2`, but none declares React Compiler mandatory. `plate-ui` only says manual memo must “pay rent.” The Vercel skill says Compiler makes render-optimization memoization unnecessary, but it is an advisory tactic, not Plate doctrine.
- All 43 published package manifests with a React peer require `react` and `react-dom` `>=19.2.0`; the installed workspace uses React `19.2.4`.
- Shared package builds still run `babel-plugin-react-compiler` with `target: '18'`. Commit `30aa6cf008` added that target and the standalone runtime specifically for React 18 compatibility; the React 19 peer-floor change did not remove either.
- Forty manifests still depend on `react-compiler-runtime` (39 packages plus `apps/www`). React 19 Compiler output should instead import `react/compiler-runtime` and needs no standalone runtime. [React target reference](https://react.dev/reference/react-compiler/target)
- `packages/plite-react`, `packages/plite-layout`, and `packages/yjs` use `defineDirectPackageConfig`, which has no Compiler transform. Their current built artifacts confirm the gap: `packages/plite-react/dist` contains the source `React.memo` wrappers and no Compiler runtime/cache output.
- `apps/www` uses `reactCompiler: !isDev`, disabled in development since commit `e57557e3ae3` for compile speed. `apps/plite` uses `reactCompiler: true`. Next supports `reactCompiler: true` as the direct project-wide configuration. [Next.js React Compiler configuration](https://nextjs.org/docs/app/api-reference/config/next-config-js/reactCompiler)
- `tooling/config/tsdown.config.ts` excludes `**/static/**` from Compiler transformation. Commit `b4637bcddb` and its changeset only say “skip react-compiler for static rendering”; no reproduction or enduring constraint was found.
- `react/react-compiler` is enabled by the Ultracite base, but 30 runtime override patterns disable its diagnostics across 111 resolved files. Those files contain 206 `useCallback`, 111 `useMemo`, five memo wrappers, and two `.displayName` assignments. A lint override is not a runtime Compiler opt-out; it hides evidence about functions the Compiler may skip.
- `react-doctor/react-compiler-no-manual-memoization` is globally disabled for a sound reason: it cannot distinguish render optimization from observable identity used by subscriptions, refs, imperative adapters, or third-party hooks. `react/display-name` is also globally disabled.
- A target-19 logger dry run across all 142 matching files emitted 397 `CompileSuccess` and 254 `CompileError` events, with success in 108 files and errors in 70 files. Events are function-level and may coexist in one file. The Compiler safely skips unsupported functions, so build configuration alone is not proof that a deletion site is optimized. [React Compiler debugging](https://react.dev/learn/react-compiler/debugging)

### Facts: bounded source inventory

The ignored `tmp/react-compiler-plan/inventory.json` was produced by an import-aware Babel AST scan of 3,457 first-party JS/TS files. It excludes dependencies, builds, caches, generated output, public output, templates, plans, and snapshots. It completed with zero parse errors.

| Construct | Runtime | Static excluded | Tests | Total |
| --- | ---: | ---: | ---: | ---: |
| `React.memo` / imported `memo` | 11 | 0 | 7 | 18 |
| `memo` with custom comparator | 4 | 2 | 0 | 6 |
| `useMemo` | 197 | 0 | 12 | 209 |
| `useCallback` | 362 | 0 | 0 | 362 |
| manual component `.displayName` | 21 | 0 | 0 | 21 |
| `"use memo"`, `"use no memo"`, inline Compiler suppressions | 0 | 0 | 0 | 0 |

Current build-coverage disposition:

| Current coverage | `useMemo` | `useCallback` | ordinary `memo` | custom comparator | `.displayName` | Disposition before deletion |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| direct package build, no Compiler | 87 | 176 | 2 | 3 | 2 | Add target-19 Compiler transform, prove each target function, then classify |
| package `static` path excluded | 0 | 0 | 0 | 2 | 0 | Reproduce/remove exclusion or redesign static owner before touching comparator |
| `apps/plite`, dev and production | 1 | 3 | 0 | 0 | 0 | Consumer classification can start |
| `apps/www`, production only | 89 | 157 | 8 | 1 | 17 | Enable development Compiler parity, then classify |
| shared package build, target 18 | 20 | 26 | 1 | 0 | 2 | Hard-cut target/runtime compatibility first, then classify |
| test runner, Compiler unproved | 12 | 0 | 7 | 0 | 0 | Keep explicit test apparatus unless the harness gains equivalent Compiler proof |

Runtime hook owners:

| Owner | `useMemo` | `useCallback` |
| --- | ---: | ---: |
| `apps/plite` | 1 | 3 |
| `apps/www` excluding registry | 55 | 87 |
| `apps/www/src/registry` | 34 | 70 |
| `packages/core` | 13 | 3 |
| `packages/cursor` | 1 | 2 |
| `packages/dnd` | 0 | 1 |
| `packages/plite-layout` | 19 | 0 |
| `packages/plite-react` | 68 | 169 |
| `packages/resizable` | 1 | 4 |
| `packages/selection` | 0 | 4 |
| `packages/udecode/cmdk` | 4 | 0 |
| `packages/udecode/react-hotkeys` | 1 | 9 |
| `packages/udecode/react-utils` | 0 | 3 |
| `packages/yjs` | 0 | 7 |

The 11 ordinary runtime wrappers are one Plite search example; seven registry wrappers in `ai-menu`, `column`, `dnd` (two), `emoji-picker` (two), and `table`; two `plite-react` DOM/editable wrappers; and public `MemoizedChildren`.

The six custom comparator owners are:

1. registry `ColorPicker`;
2. Core static `ElementStatic`;
3. Core static `LeafStatic`;
4. Plite `EditableRootGroup`;
5. Plite `EditableText`;
6. Plite `DOMStrategySegmentPlaceholder`.

The seven test-only `React.memo` calls are deliberate render-isolation controls: six in `useElementStore.spec.tsx` and one in `widget-layer-contract.tsx`. They test store/subscription fan-out and are not shipped optimization debt.

All 21 manual `.displayName` assignments are redundant: some annotate memo wrappers, several annotate inferred const functions, one annotates a named function, and wrapper-factory properties are not a React 19 correctness contract. Delete them and use named component functions when a useful DevTools name is otherwise absent.

### Facts: public API row

- `@udecode/react-utils` publicly exports and documents `MemoizedChildren`, and `platejs/react` plus `@udecode/cn` transitively re-export it.
- It has one production owner: the registry DnD component wraps `{children}` with it.
- Under the hard Compiler baseline its only behavior is redundant render optimization. Leaving a fragment wrapper after removing `React.memo` would preserve a dishonest public noun.

### Inference

- React Compiler is installed, but it is not yet a repo invariant. Development, direct Plite package builds, static package source, React 18 output, and function-level compile errors all contradict that claim.
- Blindly deleting 571 hook calls would be reckless. The Compiler owns render optimization, not stable identities observed by effects, subscriptions, callback refs, registration/unregistration APIs, WeakMap/cache keys, or documented public helpers such as `useStableFn` and `useComposedRef`.
- Existing manual memoization can constrain Compiler output, and removing it can alter behavior or performance; React explicitly recommends careful tests for existing code. [React Compiler introduction](https://react.dev/learn/react-compiler/introduction) [manual memoization lint reference](https://react.dev/reference/eslint-plugin-react-hooks/lints/preserve-manual-memoization)
- `React.memo` itself has no honest shipped owner after coverage is repaired. Custom comparators are performance policies, not correctness APIs; each needs behavior plus measured render/performance proof before deletion.

### Recommendation

Adopt a coverage-first hard cut:

- React `>=19.2` plus React Compiler in every shipped first-party React build, in development and production.
- Target React 19 output; zero `react-compiler-runtime` dependencies and zero React 18 Compiler compatibility.
- Zero shipped `React.memo`/imported `memo`, including custom comparators.
- Zero manual component `.displayName` assignments.
- Delete public `MemoizedChildren`; do not keep a no-op compatibility wrapper.
- Delete `useMemo`/`useCallback` used only for render optimization. Retain only a named observable-identity, effect-lifetime, external-cache, or test-harness contract, with owner proof and focused tests.
- Keep the seven current test-fixture `memo` calls unless their test harness is deliberately migrated to equivalent Compiler-backed isolation.
- Never decide from error count. On regression, fix the owner first; use a narrow temporary diagnostic opt-out only to prove a Compiler bug, and never globally disable Compiler rules because a packet is large.

Decisions and tradeoffs:

| Option | Decision | Reason |
| --- | --- | --- |
| Delete every memo call mechanically now | reject | 270 constructs are in uncompiled direct-package output, static is excluded, 70 matching files emit Compiler errors, and custom comparators/identity hooks can be observable |
| Document Compiler but leave manual optimization | reject | Compiler preserves existing memoization, so the maintenance and stale-dependency burden remains |
| Re-enable the blanket React Doctor manual-memo rule | reject | It conflates optimization with behavioral identity and would replace code clutter with suppression clutter |
| Coverage-first hard cut with per-owner proof | choose | It makes the Compiler claim true before relying on it, removes all shipped `React.memo`, and preserves only proven non-optimization contracts |
| Keep `MemoizedChildren` as a plain fragment | reject | One production owner and no independent behavior do not justify a public component |
| Delete the seven test-fixture memos to reach a lexical zero | reject | They are explicit controls for subscription fan-out, not shipped optimization; lexical purity is not worth weakening tests |
| Fold all React 19 cleanup into this effort | reject | Existing `forwardRef` cleanup and unrelated effect architecture are separate React 19/component-shape work; touch them only when a memo packet already owns the wrapper |

Hard-cut boundary:

- Compatibility with React 18 is intentionally removed.
- Public `MemoizedChildren` is removed with no alias or deprecated wrapper.
- Runtime behavior, DOM shape, editor selection/composition, subscription correctness, and measured hot-path performance remain hard laws.
- A packet that cannot meet those laws stays open; it does not earn a global rule disable or a fake completion claim.

Implementation notes:

### Phase 0 — Freeze the contract and make drift executable

1. Promote the bounded AST inventory into `tooling/scripts/check-react-compiler-contract.mjs` with focused unit tests. Do not commit the ignored exploratory scripts.
2. Add `check:react-compiler` and include it in root `check`/`check:push`.
3. The check fails on shipped/runtime `React.memo` or imported `memo`, manual component `.displayName`, permanent `"use no memo"`, React Compiler target 17/18, `react-compiler-runtime`, a disabled app Compiler phase, or a React-publishing package without the shared transform. Keep an explicit allowlist only for the seven named test-fixture memo calls.
4. Add Compiler logger output to package artifact verification. A deletion packet records `CompileSuccess` for its owning component/hook before removing manual optimization; file-level configuration is insufficient.
5. Re-run the inventory before every packet and record before/after counts by owner. No row disappears through an ignore pattern.

Exit: the current 616-row inventory reproduces, generated/build paths remain excluded, tests prove aliases/import forms, and the check is wired into CI before cleanup starts.

### Phase 1 — Repair doctrine and lint ownership

Edit source owners only:

- `.agents/AGENTS.md`: state that shipped Plate/Plite React code requires React `>=19.2` and React Compiler.
- `.agents/rules/plate-ui.mdc` and `.agents/rules/plate-ui/rules/react-performance.md`: replace “memo pays rent” with the sharper law below.
- `.agents/rules/best-api.mdc`: public wrappers whose sole contract is Compiler-owned memoization are deleted, not preserved as no-op compatibility API.

Required doctrine:

- Compiler owns render-tree, JSX, function, object, and calculation memoization.
- `React.memo` and custom comparators are forbidden in shipped first-party source.
- `useMemo`/`useCallback` survive only for an observable identity/lifetime or external-cache contract; exported stable-identity APIs document and test that promise.
- Manual memoization never supplies correctness. Effects, subscriptions, and imperative registrations own their lifecycle explicitly.
- `"use no memo"` is temporary diagnosis, never landed compatibility.
- Named functions, not `.displayName`, own useful component names.

Keep `react-doctor/react-compiler-no-manual-memoization` globally off; its semantic-identity false positives are structural, not count-based. Keep `react/display-name` off. Repair or narrow each `react/react-compiler` override from evidence; do not add broader disables.

Run `pnpm install`, then verify source/generated parity and rerun `agent-native-reviewer`. The `best-api repair` pass audits `plate-plan`, `plite-plan`, `plate-plugin-creator`, `plate-ui`, `docs-creator`, and `plate-next` for stale memo-wrapper teaching; update only actual conflicts. Reaffirm Vision unless execution discovers a new durable product law.

Exit: a fresh agent can discover the React 19 + Compiler baseline, deletion law, semantic exception, and proof path without reading this plan.

### Phase 2 — Make React Compiler coverage true

1. Extract one shared target-19 React Compiler transform owner from `tooling/config/tsdown.config.ts`; both ordinary package config and direct package config consume it. Do not duplicate Babel options.
2. Apply it to every package that publishes React code, including direct builds for `plite-react`, `plite-layout`, and `yjs`. Pure model packages do not pay the Babel cost.
3. Change package output to target `'19'` or the documented default. Inspect built artifacts for `react/compiler-runtime` and reject `react-compiler-runtime`.
4. Set `apps/www` to `reactCompiler: true` in development and production. Keep `apps/plite` true.
5. Reproduce the historical static-render failure, then remove `exclude: '**/static/**'`. Prove Core static render/serialization and RSC/SSR consumers. If current Compiler has a real bug, isolate and report it; do not silently keep a broad exclusion.
6. Remove `react-compiler-runtime` from all 40 manifests and from `docs/transplant/slate-v2/scripts/transplant-donor-packages.mjs`. Do not edit `templates/**`; CI regenerates templates from owning inputs.
7. Run `pnpm install` and build all published packages. Extend artifact checks so a future React 18 target/runtime or uncompiled React package fails.

Exit: all shipped React source passes through the target-19 transform, both apps compile in dev and production, the static carve-out is gone or a named packet remains blocked, and zero standalone runtime imports/dependencies remain.

### Phase 3 — Delete component-name churn and ordinary wrappers

Delete all 21 `.displayName` assignments. Use a named function only where the component would otherwise be anonymous in DevTools.

Delete the 10 internal ordinary runtime wrappers as owner packets:

- Plite search-highlighting example;
- registry `AIChatEditor`, `ColumnDragHandle`, `DragHandle`, `DropLine`, `EmojiButton`, `RowOfButtons`, and `TableCellResizeControls`;
- Plite `EditableDescendantNode` and `DOMStrategyVirtualizedRangeBoundary`.

Preserve generics and callback inference by naming the underlying function; do not add type assertions merely to compensate for removing `memo`.

Exit: ordinary shipped `memo` count is one (`MemoizedChildren`, owned by Phase 4), names remain useful, focused owner tests/browser interactions pass, and logger evidence proves every unwrapped component compiled.

### Phase 4 — Hard-cut public `MemoizedChildren`

The `best-api` target is no wrapper:

```tsx
<div>{children}</div>
```

1. Inline `{children}` in the sole registry DnD owner.
2. Delete `MemoizedChildren.tsx`, its barrel export, and its current-state docs row in English and Chinese.
3. Audit the transitive public removal from `@udecode/react-utils`, `@udecode/cn`, and `platejs/react`; add no alias, deprecation wrapper, or replacement API.
4. Run `pnpm brl` and the `changeset` skill. The changeset covers every published facade whose surface changes, plus the dependency/runtime changes from Phase 2.
5. Prove DnD behavior and compare render/performance evidence; the Compiler, not a renamed helper, owns child reuse.

Exit: zero source/docs/export references, zero ordinary shipped `memo`, correct barrels, required changeset, and DnD proof green.

### Phase 5 — Remove custom comparators one owner at a time

Each row is its own regression/performance packet:

| Owner | Main risk | Required proof before deletion |
| --- | --- | --- |
| registry `ColorPicker` | current comparator ignores callbacks, DOM props, and class name, which can retain stale props | open/change/clear custom and recent colors; prop-update test; Compiler success; Browser console/network clean |
| Core `ElementStatic` | element/decorations/content-root structural equality and static-render cost | static HTML/serialization snapshots, plugin renderer changes, RSC/SSR, measured static render |
| Core `LeafStatic` | text/decorations equality and leaf renderer output | marks/decorations/text mutations, static HTML snapshots, measured static render |
| Plite `EditableRootGroup` | virtualization group fan-out and node-key equality | render ledger, insert/remove/reorder, scroll away/back, selection, huge-document benchmark |
| Plite `EditableText` | text/marks/path/zero-width projection, IME, selection, and render locality | focused package contracts, composition/selection/browser matrix, render ledger, editing benchmark |
| Plite `DOMStrategySegmentPlaceholder` | placeholder promotion, preview bounds, node-key equality, and selection materialization | DOM strategy contracts, promote/select/copy, huge-document Browser 5/5, benchmark |

Decision order on regression:

1. fix a Rules-of-React or owner-lifecycle bug;
2. reshape props/subscriptions so the Compiler sees the real dependency boundary;
3. prove and report a Compiler bug with a minimal reproduction, using local `"use no memo"` only as diagnosis;
4. if correctness or measured performance still fails, keep the comparator and leave that packet open rather than globally disabling a rule or shipping a regression.

Exit: zero shipped custom comparators and zero shipped `React.memo`; every hot owner has behavior plus benchmark evidence, not a green typecheck alone.

### Phase 6 — Classify and cut 197 runtime `useMemo` calls

Process by owner, cheapest/lowest-risk first: `apps/plite` and small packages; non-registry `apps/www`; registry; Core; `plite-layout`; `plite-react` last.

Give every row one disposition:

- **delete**: derived render values, JSX, prop objects, arrays/maps/sets, plugin lookups, and expensive component/hook calculations the Compiler successfully memoizes;
- **move**: effect-only objects/functions move inside the effect; shared non-React caches move to their honest module/store owner;
- **retain**: only exact identity observed outside React render semantics, an external cache lifetime, or a documented public stable-value contract;
- **repair first**: Compiler skips the owning function or dependencies are incomplete.

Do not preserve a call because the calculation looks expensive; the Compiler owns component/hook calculation caching. Do not delete a call whose identity controls effect firing, subscription lifetime, or external equality until that owner is redesigned or proved.

Exit: all 197 runtime rows have an owner disposition, all render-only rows are gone, survivors have a concrete consumer/test, and owner before/after counts are recorded. The 12 test-only calls are reviewed separately and retained only when they construct a test invariant.

### Phase 7 — Classify and cut 362 runtime `useCallback` calls

Use the same owner order and dispositions:

- delete event/render callbacks whose only consumer is JSX or a Compiler-covered child;
- move callbacks used only by one effect into that effect, or use React 19 `useEffectEvent` when latest-state event semantics are the real job;
- retain external subscription/register/unregister, callback-ref, imperative adapter, third-party hook, cache-key, or documented stable-function contracts;
- preserve public `useStableFn` and `useComposedRef` only because stable identity is their explicit API, with focused contract tests—not because Compiler coverage is uncertain.

Pay special attention to the current high-signal names: `subscribe`, `getSnapshot`, `selector`, `shouldUpdate`, refs, editor event bridges, DnD connectors, Yjs observers, and runtime registration callbacks. Those names indicate semantic review, not automatic retention.

Exit: all 362 rows classified, render-only callbacks removed, semantic survivors proved, no missing-dependency workaround, and owner counts recorded.

### Phase 8 — Close Compiler diagnostics and opt-outs

1. Re-enable `react/react-compiler` on repaired files and shrink the 30 runtime patterns to the smallest still-proven owner.
2. Run the target-19 logger ledger. A file may contain both compiled and skipped functions; record target-function success, not a file badge.
3. Fix Rules-of-React violations exposed by removing memo-for-correctness. Do not add permanent `"use no memo"`.
4. Keep the blanket React Doctor rule off unless its semantics change upstream; the repo-specific contract check owns the precise bans.

Exit: every remaining lint override has a current behavioral reason and narrow path, every deletion target compiles, and the contract check has no runtime allowlist.

### Phase 9 — Verification and closure

Run from `/Users/zbeyens/git/plate-2`:

```bash
pnpm install
pnpm brl
node tooling/scripts/check-react-compiler-contract.mjs
pnpm turbo typecheck \
  --filter=./packages/core \
  --filter=./packages/plite-react \
  --filter=./packages/plite-layout \
  --filter=./packages/yjs \
  --filter=./packages/udecode/react-utils \
  --filter=./packages/udecode/cn \
  --filter=./packages/plate
bun test packages/core/src/react/stores/element/useElementStore.spec.tsx \
  packages/plite-react/test/widget-layer-contract.tsx
pnpm check:plite:dev
pnpm turbo build --filter='./packages/*' --filter='./packages/udecode/*'
pnpm lint:fix
pnpm check:plite
pnpm check
```

Add focused commands for every changed owner; the list above is the floor, not a substitute. The full package build is justified because Compiler runtime imports are published artifacts. Never run `build:registry` locally.

Final zero audits cover runtime source, manifests, generator inputs, configs, and built artifacts:

- no shipped `React.memo` or imported `memo`;
- no manual component `.displayName`;
- no `target: '17'`/`'18'` or `react-compiler-runtime`;
- no permanent `"use no memo"`;
- exactly seven allowlisted test-fixture memo calls unless a stronger harness replaces them;
- every remaining `useMemo`/`useCallback` listed by owner and semantic contract.

Start `pnpm --filter www dev` and use Browser on fresh sessions:

- `/blocks/playground`: type, select, toolbar color, undo/redo, and follow-up typing;
- `/blocks/dnd-demo`: drag/drop and follow-up editing;
- `/blocks/emoji-demo`: search, select emoji, and continue typing;
- `/blocks/table-demo`: edit and resize cells;
- `/blocks/huge-document-demo`: scroll away/back, edit, select, promote placeholders, and follow-up typing;
- `/docs/examples/plate-to-html`: static output parity.

Check console and network on each route. DnD, selection, composition, virtualized DOM, and React lifecycle packets require 5/5 retry-free warm runs. Performance claims route through `benchmark` with current/main comparison and behavior guardrails.

Closure requires green focused proof, green `pnpm check:plite`, green root `pnpm check`, Browser proof, artifact/runtime audits, changeset/barrels, doctrine mirror parity, and no unowned inventory row.

Review fixes:

| Lens | Finding | Closure in this plan |
| --- | --- | --- |
| `plate-ui` | React 19 is explicit but “memo pays rent” still legitimizes Compiler-owned optimization | Phase 1 replaces it with a hard Compiler/deletion law and a semantic-identity exception |
| Vercel React | Manual render memo is redundant under Compiler | Phases 3, 5, 6, and 7 remove it only after coverage proof |
| Official React | Existing memo removal can change Compiler output; `useMemo`/`useCallback` remain precise-identity escape hatches | Per-row consumer classification and behavior/performance gates added |
| agent-native | Agents cannot discover the Compiler baseline or a trustworthy verification route from source doctrine | Exact source owners, generated-sync command, contract check, and forward discoverability proof added |
| build/artifact audit | React 18 target/runtime, three uncompiled direct packages, prod-only www, and excluded static source make the premise false | Coverage repair is Phase 2 and blocks deletion |
| Compiler logger | 70 matching files emit function-level errors; file configuration is insufficient | Per-target `CompileSuccess` evidence and diagnostic closure added |
| `best-api` | `MemoizedChildren` would become a public no-op wrapper | Hard-cut implementation/export/docs/callsite with no alias; changeset and doctrine repair required |
| self-review | Test fixture memo calls were being conflated with shipped debt | Seven explicit test controls are allowlisted and independently reviewed |
| self-review | A lexical zero could motivate global rule disables or risky custom-comparator deletion | Regression decision order and behavior/benchmark blockers added |

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Initial doctrine/config search used nonexistent shell globs | 1 | Use `rg` globs against existing roots instead of zsh-expanded optional paths | Replaced with repo-root scoped search |
| First repo-root Compiler search included a generated release index and exceeded the intended output cap | 1 | Split doctrine, config, manifests, and source searches; exclude generated JSON/changelogs explicitly | Broad output discarded; all following audits use counts/file lists or exact owners |
| First inventory implementation imported the TypeScript 7 package API, which exposes no `ScriptKind` runtime in this workspace | 2 | Use the installed Babel parser, matching the actual Compiler pipeline | Rewritten; final scan parses all 3,457 files with zero errors |
| First AST inventory admitted `.next-plite` and `out` build artifacts | 1 | Exclude `.next*` and `out` segments while retaining source `packages/core/src/static` as a deliberate coverage row | Generated `.displayName` noise removed; final total reconciled to 616 rows |
| Historical static-exclusion search entered a large raw research artifact | 1 | Read the exact introducing commit and changeset instead of repo-wide prose | Found commit `b4637bcddb` and its only stated reason; no further broad search used |

Verification evidence:

- Source doctrine search: React 19.2 appears in `plate-ui`; React Compiler does not appear as a required invariant in root/source AGENTS or source `plate-ui` rules.
- Manifest audit: 43 React peer packages, all `>=19.2.0`; 40 standalone Compiler runtime dependencies.
- Build audit: shared transform targets React 18; three React-publishing direct packages have no transform; Core static is excluded; `apps/www` compiles production only; `apps/plite` compiles both phases.
- AST inventory: `node tmp/react-compiler-plan/inventory.mjs` scanned 3,457 files, produced 616 rows in 142 files, and reported zero parse errors.
- Compiler audit: `node tmp/react-compiler-plan/compiler-coverage.mjs` transformed all 142 files at target 19 with zero transform failures, 397 successes, and 254 function-level errors.
- Public API audit: one production `MemoizedChildren` consumer, one implementation, one direct barrel, two current docs rows, and two transitive facade re-exports.
- History audit: `30aa6cf008` owns React 18 compatibility, `e57557e3ae3` owns www dev disable, and `b4637bcddb` owns the static exclusion.
- External semantics: official React target, introduction, manual-memo preservation, debugging docs, and official Next.js Compiler config; no community source used as authority.
- `git diff --check -- docs/plans/2026-08-19-cut-manual-react-memoization-for-react-compiler.md` passed with no output.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-19-cut-manual-react-memoization-for-react-compiler.md` returned `[autogoal] complete`.

Final handoff contract:
- Recommendation: accept the coverage-first hard cut; do not start memo deletion until Phase 2 makes React 19 Compiler coverage true
- Confidence: 97/100; remaining uncertainty is implementation behavior/performance, not plan ownership or scope
- Evidence: exact doctrine/config/history/manifests, 3,457-file AST inventory, target-19 logger audit, lint override map, public API/caller/docs/export audit, and official framework semantics
- Tests / commands: planning evidence commands are recorded above; Phases 0-9 define implementation, focused, package artifact, Plite, root CI, and zero-match gates
- Browser proof: N/A for planning; execution routes and interactions are `/blocks/playground`, DnD, emoji, table, huge-document, and Plate-to-HTML static proof
- PR / tracker: N/A; direct local request, no commit/push/PR authorized
- Caveats: static Compiler exclusion lacks a durable reproduction; 70 matching files emit Compiler errors; custom comparators are hot-path policies; 559 runtime hook calls require consumer classification; seven test memos are intentional fixtures
- Next owner: later execution goal using `plate-ui` for React doctrine/shape, tooling/package owners for coverage, `best-api repair` for `MemoizedChildren`, `benchmark` for hot-path claims, and Browser for final interaction proof

Timeline:
- 2026-08-19T17:55:53.830Z Major-task goal plan created.
- 2026-08-19T18:03Z Doctrine/config/history audit proved React Compiler is not a durable invariant.
- 2026-08-19T18:10Z Import-aware inventory closed at 616 rows across 142 files with zero parse errors.
- 2026-08-19T18:13Z Target-19 Compiler logger audit closed with zero transform failures and exposed function-level coverage debt.
- 2026-08-19T18:20Z `best-api` review selected hard deletion of public `MemoizedChildren`.
- 2026-08-19T18:34Z Coverage-first execution phases, regression policy, proof routes, and closure gates completed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Planning closeout |
| Where am I going? | User acceptance, then a separate execution goal beginning with Compiler coverage |
| What is the goal? | Make React 19 + Compiler a real invariant, then delete shipped manual render memoization without breaking identity, editor behavior, or performance |
| What have I learned? | The doctrine and build premise are incomplete; 616 constructs need ordered coverage and semantic classification; one public wrapper should be deleted |
| What have I done? | Audited source/build/lint/API state and wrote a nine-phase zero-guesswork execution plan |

Open risks:

- The 2026 static-render exclusion has no reproduction. Execution must recover or recreate the failure before removing it.
- Compiler target-19 dry run emits 254 function-level errors in 70 matching files. Some are unrelated to memo rows, but no deletion can infer coverage from file config.
- Enabling Compiler in `apps/www` development may slow startup/HMR. That cost is accepted as parity debt unless measurement proves a better Next-supported configuration with identical coverage.
- The three Plite custom comparators sit on editor rendering/virtualization hot paths. Behavior green without current/main benchmark evidence is insufficient.
- Hook identities may be observed by effects, subscriptions, refs, DnD, Yjs, caches, or public APIs. Per-consumer audit is mandatory.
- Removing `MemoizedChildren` is a breaking public surface change across three exports and needs the full best-api/changeset/barrel/docs path.
- The seven test-fixture memos remain by design. If the user requires a literal repository-wide token zero, build an equivalent Compiler-backed test harness first; do not weaken subscription tests for aesthetics.
