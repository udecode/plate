# rewrite regression harness closure

Objective:
Close the rewrite regression-harness plan; done when case inventory, scoring,
ownership, cleanup, promotion loop, and proof gates are decision-ready; plan
docs/plans/2026-08-17-rewrite-regression-harness-closure.md.

Flow mode:
agent-led plan hardening

Goal plan:
docs/plans/2026-08-17-rewrite-regression-harness-closure.md

Template:
docs/plans/templates/plite-plan.md

Primary template:
docs/plans/templates/plite-plan.md

Applied packs:
- docs
- browser
- agent-native
- package-api

Mode:
- `deep`: the risk spans native editing behavior, browser proof, Plate example
  adoption, reusable test infrastructure, and external prior art.

Completion threshold:
- Binary readiness: live claims sourced, one owner per responsibility, every
  decision resolved, every public break has adoption and proof, execution
  slices are concrete, conditional gates are resolved, and `check-complete`
  passes.
- The plan defines one resumable case ledger with stable identities, source
  provenance, behavior steps, browser/device scope, risk score, current proof,
  `main`/rewrite result, verdict, promotion owner, and dedupe state.
- The plan defines a bounded parity protocol: inventory all relevant current
  examples and documented interaction stories; execute the highest-risk rows
  first; add durable tests only for observed regressions or critically missing
  invariants.
- At least five testing-architecture candidates receive source-backed
  delete/merge/inline/simplify/split/keep/defer decisions and navigation scores.
- Plite substrate, Plate feature/example, research, and agent-workflow owners
  have explicit handoffs, proof gates, iteration rules, and stop conditions.

Verification surface:
- Source audits of current Plite unit/browser test owners, shared fixtures and
  utilities, `apps/plite`, Plate package tests, `apps/www` examples/content,
  existing behavior ledgers, templates, and relevant proof commands.
- A bounded `main` versus current-rewrite sample that proves the proposed case
  schema can represent one real native-input story without encoding
  implementation details. The pilot is
  `autoformat:text-substitution-native-input`; broader topologies follow only
  after its speed and determinism gates pass.
- Planning checks: decision-ledger closure, cleanup-candidate accounting,
  duplicate/source-provenance audit, exact execution proof matrix, and final
  `check-complete`.

Constraints:
- Planning only until the user explicitly accepts this exact plan and invokes
  `plite-plan` against it.
- No public compatibility aliases or runtime shims.
- Keep one plan as the default artifact; add a machine-readable artifact only
  when it materially improves a large audit.
- Do not claim absolute regression freedom. Claim only inventoried coverage,
  executed parity, deterministic critical proof, and explicit residual risk.
- Do not port tests merely because they exist on `main`; test externally
  observable behavior and reject implementation-coupled or duplicate cases.
- Do not add a durable test for a passing low-risk story. Promote only an
  observed regression, a critical invariant with no trustworthy proof, or a
  reusable harness contract.
- Keep manual exploratory checks out of the permanent suite unless they expose
  a durable oracle. Avoid multiplying browser helpers, ledgers, or templates.

Boundaries:
- In scope: the current rewrite; the live `main` docs/source/examples used as
  behavioral story sources; Plite unit and browser proof; Plate package and
  registry/example adoption; test utilities; proof runners; behavior ledgers;
  reusable autogoal/agent workflow documentation.
- Source owners: provisional until the source map is complete: Plite model,
  operations, runtime/DOM/input, React, history/collaboration, `apps/plite`,
  Plate feature packages, `apps/www` examples/content, and repo proof tooling.
- Non-goals: blind one-to-one `main` test migration; implementation parity;
  exhaustive browser/device combinations for every row; tests for dead legacy
  paths; product or public API redesign without a promoted evidence-backed gap.
- Direct Plate/collaboration adoption owners: feature package tests and
  `apps/www` story sources; collaboration owners only for rows whose behavior
  depends on replay, offline/reconnect, remote selection, or history semantics.

Output budget strategy:
- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.
- Exclude generated output, build artifacts, dependencies, coverage, and raw
  research dumps. Inventory paths/counts first, then read only representative
  owners and decision-changing cases. Persist large case/research state as TSV
  or another mechanically diffable artifact only after the schema proves useful.

Blocked condition:
- Block only if the live `main` behavioral source or a required browser/native
  proof surface is unavailable and no local source, focused Browser run, or
  explicit residual-risk classification can resolve the affected decision.

Plite Plan state:
- status: blocked
- phase: orchestrated-pilot-stopped
- next: user may separately authorize the stale `apps/www` registry host owner;
  pilot-only authority is exhausted
- handoff: mastermind-prepared

Pilot execution state:

- authority: user said `go pilot only`
- mastermind: current task `01a00ee9-80bb-7c72-ba1a-f084c6bb89e2`
- child key: `rewrite-harness/autoformat-pilot`
- child task: `01a00f04-8444-75f0-a99c-860728c8e0ff` (`rewrite-harness autoformat pilot`), archived; child goal blocked
- child model: `gpt-5.6-sol` high
- checkout: saved `plate-next` project, local, no worktree
- concurrency: one code-writing child; mastermind stays read-only for product code
- stop: after the single Autoformat case and mastermind verification
- master blocked audit: `3/3` consecutive goal turns; same route-host blocker,
  no pilot-scoped repair authority; terminal blocked threshold satisfied

Pilot execution checklist:

- [x] One durable child task is created with the exact one-case contract and non-goals: `01a00f04-8444-75f0-a99c-860728c8e0ff`.
- [x] The child creates a one-shot execution goal against this plan: active goal
      `Execute the one-case Autoformat browser pilot; done when the ledger row
      and 5/5 warm proof meet the plan gates`.
- [x] Exactly one case row is added for `autoformat:text-substitution-native-input`.
- [x] The minimum `apps/www` focused Chromium lane targets
      `/blocks/autoformat-demo`; its retained focused command reaches the one
      test but the route host fails before the editor renders.
- [ ] Blocked by route host: on one stable non-code text block, real keyboard input types ` ->` and
      produces model/rendered-DOM suffix ` →`; follow-up real keyboard input
      types `x` and produces suffix ` →x`.
- [ ] Blocked by route host: the focused proof also records collapsed model/DOM selection at the end,
      editor-owned focus, follow-up typing, and zero runtime errors.
- [ ] Cold timing is recorded; five consecutive warm runs are unmeasured
      because the route never reaches an editor-ready state. Retries remain
      disabled. When the host is repaired, every warm run must pass and remain
      at most 60 seconds.
- [x] In-app Browser spot check is N/A: deterministic proof never reached an
      editor-ready route, so no truthful post-proof Browser check was available.
- [x] No second case, public Browser API, shared runner extraction, broad inventory, commit, push, or PR is created.
- [x] The mastermind read the child result/diff and reran the exact focused command once; it independently reproduced the route-host failure before the editor root appeared.
- [x] Pilot result is recorded as methodology repair before scaling.
- [x] Child handoff below reports the task/branch key, changed files, exact case row,
      exact commands, cold/warm timings, 5-run result, Browser proof,
      keep/revert/methodology-repair decision, blockers, and next owner.

Pilot child evidence:

- task key: `rewrite-harness/autoformat-pilot`
- child task: `01a00f04-8444-75f0-a99c-860728c8e0ff`
- checkout key: saved `plate-next` project; no worktree or branch mutation
- changed files: `apps/www/package.json`, `apps/www/playwright.config.ts`,
  `apps/www/tests/browser/autoformat.spec.ts`,
  `docs/editor-behavior/example-story-coverage.tsv`, and this plan
- case row: one 21-column row for
  `autoformat:text-substitution-native-input`, risk `12`, status
  `methodology-repair`, source fingerprint
  `sha256:51ba6d6a62128b0e0c13e5abeaabf881ff362d2970e474176c69558c23bb3295`
- exact focused command:
  `pnpm --filter www test:www-browser:chromium`
- exact static discovery command:
  `PLAYWRIGHT_BASE_URL=http://localhost:9 pnpm --filter www exec playwright test --config playwright.config.ts --project=chromium --list`
- cold timing: retained clean run failed after `73.29s`; the single Chromium
  test timed out at `45.1s` waiting for the editor root
- warm timings and 5-run result: unmeasured; the route never reached an
  editor-ready state, so no warm retry-free run was possible
- runtime blocker: `apps/www/src/__registry__/index.tsx` imports removed
  registry UI and kit paths, so `/blocks/autoformat-demo` renders no editor;
  one required reinstall did not change the failure
- Browser proof: N/A because deterministic proof did not reach the app route
- decision: methodology repair; retain the one case row and focused failing
  lane as a quarantined, non-default proof packet; revert failed test-only
  registry alias experiments, and stop before harvest
- next owner: `apps/www` registry source/generation owner repairs the local
  runnable route without `build:registry`; mastermind then reruns the exact
  focused command once before deciding whether to resume the five warm runs

Pilot mastermind evidence:

- Readback confirmed the child added only one browser command, one app-local
  Playwright config, one Autoformat spec, and one ledger row. No Browser public
  API or product implementation changed. Existing unrelated `apps/www`
  manifest edits remain outside the child packet.
- Exact rerun: `pnpm --filter www test:www-browser:chromium` -> exit 1; the
  single test timed out after 45 seconds waiting for
  `[data-plite-editor="true"][contenteditable="true"]`.
- Independent discovery rerun lists exactly one Chromium test in one file;
  independent TSV readback reports one row, 21 columns, and the exact case ID;
  independent Biome check passes the config, spec, and manifest.
- The rerun independently reproduced removed imports from
  `apps/www/src/__registry__/index.tsx`; source-first package resolution also
  emitted React Server Component boundary errors before the target editor
  could mount.
- Warm and five-run gates remain unmeasured. No behavioral claim is made about
  the Autoformat rewrite.
- Packet decision: `quarantine`. Keep the explicit manual failing command,
  spec, and ledger row outside default checks as the exact route-readiness
  repro; do not scale or merge the lane until the route owner is repaired and
  this test passes.
- Process readback: no child/master Next listener remains on port 3000.
- Owner trace: `apps/www/src/__registry__/index.tsx` declares itself generated
  and do-not-edit; `apps/www/src/lib/registry-component.tsx` imports it
  unconditionally. The generated file still imports `registry/ui/**`, while
  current registry definitions point at `registry/components/editor/**`.
- Generation owner: `apps/www/scripts/build-registry.mts`, invoked by
  `apps/www` build scripts and registry/release/sync-template workflows. Repo
  policy forbids running `build:registry` locally, so no pilot-scoped command
  can refresh the host.
- No existing source-mode fallback bypasses `@/__registry__` for block preview
  components. Adding one is an `apps/www` route-host implementation decision,
  not part of the authorized one-case pilot.
- Third-turn readback reconfirmed all three blocker facts: the generated index
  still names `registry/ui/ai-menu.tsx`, that file is absent while the current
  `registry/components/editor/ai-menu.tsx` owner exists, and
  `registry-component.tsx` still imports `@/__registry__` unconditionally.

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Every explicit scope, restraint, deliverable, and stop condition is recorded above and in the work checklist. |
| Active goal and plan verified | yes | Active goal points to this exact plan. |
| Current owners read | yes | Read root/common/Plite/Plate Vision, Plite agent start, Browser package/runtime/test owners, Plate demo/docs/test owners, editor-behavior matrices, proof routing, and prior testing research/plans. |
| Best API target resolved | yes | No public call-shape change is accepted by this plan. Any repeated missing `@platejs/browser` primitive first runs `best-api`; route-specific Plate semantics stay app-owned. |
| Mode and execution boundary resolved | yes | Deep, agent-led plan hardening; planning only until explicit acceptance of this exact plan. |
| Docs pack selected | yes | Durable loop documentation and template/workflow ownership are in scope. |
| `docs-creator` loaded | N/A: internal control docs | Public Plate teaching is not changed during planning. Accepted execution loads `docs-creator` only if public docs are corrected. |
| Docs lane selected | yes | Internal behavior/proof control under `docs/editor-behavior/**`; public docs remain case sources and may be corrected only when a story is invalid. |
| Target docs and nearest sibling docs read | yes | Read `docs/editor-behavior/README.md`, protocol matrix, Plite example parity, browser framework docs, and prior no-regression plans. |
| Docs style doctrine read | N/A: internal control docs | Current-state, source-backed prose rules from root AGENTS/Vision govern the internal artifact. |
| Documented source owner identified | yes | `docs/editor-behavior/**` owns behavior law/coverage; the active goal plan owns run state; package/app tests own executable proof. |
| Browser pack selected | yes | Native editing interaction proof is a primary risk. |
| Browser route / app surface identified | yes | Plate product cases use `/blocks/<demo>` in `apps/www`; Plite substrate proof uses `/examples/plite/<example>` through `apps/plite`. |
| Browser tool decision recorded | yes | Browser for exploratory/manual current-route proof; Playwright plus `@platejs/browser` for durable cases; Chrome/Computer only for native browser/OS state Browser cannot inspect. |
| Console/network caveat policy recorded | yes | Every route case records runtime console errors; expected third-party network noise must be named and cannot hide editor failures. |
| Agent-native pack selected | yes | The proposed resumable loop may change autogoal templates or repo skills after acceptance. |
| Agent-facing action surface identified | yes | Case-ledger resume, scoring, promotion, and stop rules for future agents. |
| Source rule versus generated mirror boundary identified | yes | `.agents/rules/**` is source; generated `.agents/skills/**/SKILL.md` is read-only and synced with `pnpm install`. |
| `agent-native-reviewer` loaded or waiver recorded | N/A: planning only | Accepted execution loads it if `.agents/**`, templates, commands, or agent actions change. |
| Package/API pack selected | yes | Reusable test utilities or browser package boundaries may change; the plan must decide whether any public package surface changes. |
| Public surface or package boundary identified | yes | `@platejs/browser` is the only likely public test API; `@platejs/test-utils` remains separate; Plate case semantics stay in `apps/www`. |
| Release artifact path selected | N/A: planning only | Execution classifies each kept packet. Internal tests/docs need no release artifact; public Browser changes require a package changeset. |
| `changeset` skill loaded when `.changeset` is required | N/A: planning only | Load during accepted execution only if a public Browser packet is kept. |
| Barrel/export impact decision recorded | yes | No export change in planning. A kept Browser API packet runs `pnpm brl` when exported files or barrels change. |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports/behavior claims cite live source.
- [x] Reusable public call shape has one `best-api` verdict before target lock. N/A: no public target is accepted; every future Browser promotion is gated on `best-api`.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks and any private bridge have complete adoption/deletion answers. N/A: no break or bridge is accepted in planning.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, anchors, and previews target real leaf pages or are marked N/A with reason.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: console and network errors are checked or explicitly out of scope. N/A for planning; required per execution row.
- [x] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors. N/A: planning changes no agent rule.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text. N/A: no agent action changed.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded. N/A: no `.agents/**` edit.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason. N/A: no agent implementation diff.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: planning-only internal artifact, no release artifact.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules. N/A: no package change.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset. N/A: no registry change.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`: planning-only internal artifact.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes. N/A: no public shape changed.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason. N/A: no package source changed.
- [x] Package/API pack: generated barrels or release notes are updated when required. N/A: no exports or release notes changed.
- [ ] Pilot execution: real keyboard input must prove Autoformat ` ->` to ` →x`, model/DOM agreement, collapsed end selection, editor focus, and zero runtime errors. BLOCKED: `/blocks/autoformat-demo` renders no editor because the checked-in registry imports removed paths.
- [ ] Pilot execution: five retry-free warm Chromium runs must pass in at most 60 seconds each. BLOCKED: the route never reached ready, so warm proof is unmeasured.
- [ ] Pilot closeout: the focused command must pass before this lane can scale or merge. BLOCKED: `pnpm --filter www test:www-browser:chromium` independently reproduces the route-host failure.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every readiness condition | Source claims, ownership, decisions, slices, risks, adoption, and proof matrix are closed for planning. |
| Fresh source evidence | yes | Recheck decision-changing current claims | Fresh reads/counts use current `HEAD`, `origin/main`, and live owners recorded in Verification evidence. |
| Best API review | N/A: no public shape change | Resolve/reject every P0/P1 call-shape finding, or record no public shape change | Future Browser promotion is gated on `best-api`; planning accepts no new API. |
| Conditional risk and adoption | yes | Complete triggered risk/browser/benchmark/provenance work or give one scoped N/A reason | Five high-risk scenarios and Plate/Plite adoption owners are explicit; benchmark/release/provenance limits are scoped. |
| Verification recorded | yes | Record fresh planning proof and exact execution gates | Verification evidence and proof matrix name current facts and execution gates. |
| Handoff prepared | yes | Prepare concise ownership, breaks, proof, risks, and execution order | Final handoff fields are complete. |
| P2 autoreview | N/A: planning-only | Run with `--max-priority P2` for implementation changes; P3 is opt-in only, or record planning-only N/A | No implementation diff; accepted execution closes P2 review after code changes. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-17-rewrite-regression-harness-closure.md` | Planning passed before execution; pilot completion is blocked by the canonical open Work Checklist rows above. |
| Docs source-backed claim audit | yes | Verify docs claims against current source or record N/A | Demo counts, protocol counts, prior-ledger scope, and stale-path claims were source-audited. |
| Docs links / routes / previews | yes | Verify leaf links, routes, anchors, and preview names or record N/A | `/blocks/<demo>` and `/examples/plite/<example>` owners were read; 60 preview names were enumerated on both refs. |
| Docs MDX/content parser | N/A: internal plan only | Run `pnpm --filter www build:source` for MDX/content changes, or record N/A | No public content/MDX source changed. |
| Plugin page specifics | N/A: no plugin page edit | For plugin pages, apply `docs-creator` kit/manual/API rules; otherwise N/A | Plugin docs were read only as story sources. |
| Browser interaction proof | N/A: planning-only | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | Pilot Browser/Playwright proof is an accepted-execution gate, not a planning claim. |
| Browser console/network check | N/A: planning-only | Record console/network state or why it is not applicable | Required for every future route row; no route result is claimed now. |
| Browser final proof artifact | N/A: planning-only | Record screenshot/trace/route/native proof or exact caveat | Execution slices name the required artifacts. |
| Agent source / generated sync | N/A: no agent edit | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | No `.agents/**` source changed. |
| Agent action discoverability | N/A: no agent edit | Source-audit the skill/rule path an agent will read | Existing Auto plan path is named; no new action is shipped. |
| Agent-native review | N/A: no agent edit | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | Accepted execution loads it if workflow source changes. |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | Browser, test-utils, app, Plite host, and package semantic boundaries are explicit; no export changed. |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Planning-only internal artifact; no release delta. |
| Published package changeset | N/A: no package delta | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | Future kept public Browser changes require a package changeset. |
| Registry changelog | N/A: no registry delta | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | No registry source changed. |
| No release artifact | yes | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | Internal planning artifact only. |
| Package typecheck/build/test | N/A: no package source changed | Run owning package checks or record N/A with reason | Execution proof matrix names package commands by changed owner. |
| Barrel/export generation | N/A: no export change | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | No package export or file layout changed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Prompt, doctrine, live owners, prior ledgers/research, branch cursors, independently ranked pilot candidates, and Autoformat sources read. | Decide |
| Decide | complete | Case model, ownership, pilot, promotion policy, cleanup candidates, and execution slices resolved below. | Prove and hand off |
| Prove and hand off | complete | Source-backed proof matrix, risk gates, final handoff, and user acceptance boundary prepared. | User review |

Source and owner map:
| Surface | Live evidence | Owner | Planning consequence |
| --- | --- | --- | --- |
| Stable Plate story corpus | `origin/main` and `HEAD` each expose 60 unique `ComponentPreview` demos; only `markdown-to-slate-demo` / `markdown-to-plite-demo` differs by name. | Plate docs, registry, feature packages | Inventory every registered demo, then derive atomic observable cases from docs, source, tests, and changelog evidence. |
| Plate browser proof | `apps/www` has no Playwright config or `tests/*-browser` tree. `/blocks/<demo>` renders the real registry component. | `apps/www` | Add a narrow Plate browser lane; Plite example proof cannot stand in for Plate product behavior. |
| Plite browser proof | 38 registered Plite examples; 42 example spec files, about 41,429 lines and 1,058 static `test(...)` calls; strict proof runs through `apps/plite`. | `apps/plite`, `@platejs/browser` | Reuse the substrate harness and runner discipline; do not copy Plite example source into a second tree. |
| Existing behavior law | `editor-protocol-matrix.md` contains 168 tested, 62 specified, 11 deferred, and 1 partial rows. | `docs/editor-behavior/**` | Link matching protocol IDs. Do not duplicate generic key/boundary law in the example ledger. |
| Plate package proof | Table has broad package-level semantic coverage; combobox has trigger tests and three mocked registry input tests. Current docs still promise table selection/clipboard/navigation and combobox keyboard navigation/selection. | Plate feature packages and registry UI | Package proof covers combinations; browser proof covers native input, focus, DOM selection, popup/toolbar, and cross-feature workflows. |
| Affected proof routing | `createAffectedPlan()` selects package tests/typecheck for table or combobox changes but `browserSmoke: false`; Plite runtime changes set `browserSmoke: true`. | `tooling/scripts/check-plite.mjs` | Add case-ledger-driven Plate browser selection after the lane is stable; do not run the entire product corpus on every package edit. |
| Pilot source | Current Autoformat docs promise explicit input rules; the live registry owner defines `->` to `→`; Core unit proof covers that substitution; `/blocks/autoformat-demo` has no Plate browser proof. The current flat registry owner and value path are not selected by `createAffectedPlan()`. | Plate registry + Core input rules | One tiny native-keyboard case tests product wiring, Plite input transport, DOM/model agreement, focus, selection, follow-up typing, and affected-proof discovery. |
| Plate runtime bridge | `PlateContent` renders Plite React `Editable`, which owns `data-plite-editor` and the browser handle. | `@platejs/core`, `@platejs/plite-react` | Use `@platejs/browser` directly on Plate routes. Do not restore the deleted `@platejs/playwright` package or another Plate-only transport. |
| Existing control docs | The file-level Plite example matrix and several testing research/plan docs still cite `.tmp/plite`, `site/examples`, or `playwright/integration`; they do not enumerate atomic Plate product stories. | Plite/history docs plus editor-behavior control docs | Consolidate current control into one example-story owner and leave historical research as evidence, not live queue state. |

Case ledger contract:

- Durable path: `docs/editor-behavior/example-story-coverage.tsv`, with a short
  operating section added to `docs/editor-behavior/README.md`.
- One row is one externally observable setup/action/outcome. It is not one
  source file, exported function, unit assertion, or implementation branch.
- Stable identity: `<surface>:<behavior-slug>`, for example
  `autoformat:text-substitution-native-input` or
  `table:grid-selection-shift-arrow`.
- Required columns:
  `case_id`, `surface`, `route`, `owner`, `setup`, `action`, `expected`,
  `source_refs`, `protocol_id`, `impact`, `rewrite_exposure`,
  `browser_dependence`, `proof_gap`, `risk_score`, `baseline_verdict`,
  `current_proof`, `next_result`, `test_decision`, `status`,
  `last_verified_ref`, `source_fingerprint`.
- `risk_score = impact + rewrite_exposure + browser_dependence + proof_gap`;
  each dimension is `0..3`. The score orders work but never turns missing
  evidence into confidence.
- Priority: observed regressions first; then score `9..12`; then `6..8`;
  lower rows remain explicit inventory and are sampled only when a changed
  owner, user report, or research result reopens them.
- A validator compares the ledger with live docs demos, registry examples,
  proof paths, stable IDs, and branch cursors. New, renamed, or deleted demos
  fail inventory validation until explicitly classified.
- Record baseline and target cursors once per refresh. Planning cursors are
  `origin/main` `2f87593f95a1ff2e931cd42fcf73f052b1d0db41` and current
  `origin/next` / `HEAD` `a18bab5bba2d73e446523cbd848c5baeb19935f4`;
  execution refreshes both before using them. Current checkout source outranks
  the commit cursor; record a digest for selected live owner files so owner
  moves outside `HEAD` cannot disappear behind commit-only provenance.

Test-promotion policy:

1. An observed rewrite regression gets a focused failing proof before its fix
   whenever the owner can express one deterministically.
2. A passing case gets a new durable test only when `impact = 3` and no
   trustworthy owner already proves the browser-sensitive invariant.
3. A package/unit test owns semantic combinations. A Plate route test owns
   native input, DOM/selection, focus, popup/toolbar, clipboard transport, and
   cross-plugin composition. A Plite route test owns generic DOM/input/runtime
   behavior reproduced without Plate product code.
4. Main is a story source, not automatic law. A main behavior that conflicts
   with current docs, Vision, or an accepted hard cut is classified instead of
   fossilized in a regression test.
5. A passing medium/low-risk exploratory case is recorded as `no-test`; green
   manual work does not automatically become permanent suite weight.
6. When the same action or assertion appears twice, evaluate promotion into
   `@platejs/browser`. Plate concepts such as combobox items, table commands,
   toolbar labels, or product policy never enter the substrate harness.

Batch loop:

```text
refresh cursors -> select highest-risk unclosed cases -> ground expected law
-> reproduce on current Plate route -> classify pass/regression/intentional cut
-> add only required oracle -> patch owning layer -> focused proof
-> harness cleanup decision -> update ledger -> reassess
```

- Each batch uses the existing `auto` autogoal template in batch-loop mode and
  points to the shared case ledger. Do not create another skill or speculative
  template before two real batches prove a recurring missing field.
- The first batch is exactly one Autoformat case. It validates the schema,
  Plate route host, native keyboard path, DOM/model/focus/selection assertions,
  focused command latency, and affected-proof owner before any second feature
  is inventoried.
- A batch closes only when every selected row has one verdict: `covered`,
  `next-pass-no-test`, `regression-fixed`, `critical-oracle-added`,
  `intentional-cut`, `duplicate`, `invalid`, or `deferred-with-owner`.
- After two or three fixes around one runtime/harness owner, stop local patches
  and escalate to the Plite or Plate architecture owner.

Pilot ranking:

The pilot score is operational, not architectural confidence. Each dimension
is `0..3`: boundary coverage, determinism, setup speed, diagnostic clarity,
and incremental proof value.

| Candidate | Boundary | Determinism | Speed | Diagnosis | Incremental value | Total | Verdict |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Autoformat native `->` to `→` plus follow-up typing | 3 | 3 | 3 | 3 | 3 | 15 | choose |
| Basic-mark hotkey plus typing | 3 | 3 | 3 | 3 | 1 | 13 | reject: heavily duplicated by existing Plite rich-text proof |
| Slash-command keyboard select | 3 | 2 | 2 | 2 | 3 | 12 | defer: popup and command policy add failure owners |
| Mention combobox select | 3 | 2 | 2 | 2 | 3 | 12 | defer: native input and popup focus are a second-stage test |
| Table Shift+Arrow selection | 3 | 2 | 1 | 1 | 3 | 10 | defer: structural and geometry failures make methodology diagnosis slow |

Pilot case contract:

- ID: `autoformat:text-substitution-native-input`.
- Route: `/blocks/autoformat-demo`.
- Setup: open the route, find the Plate editor, collapse at the end of a stable
  non-code text block, and record its text.
- Action: use real keyboard input to type ` ->`, assert the suffix is ` →`,
  then type `x`.
- Required outcome: model text and rendered DOM end in ` →x`; model/DOM
  selection is collapsed at the end; the editor owns focus; no runtime error
  is recorded; follow-up typing does not duplicate or reorder text.
- Durable-test decision: `critical-oracle-added`. Core unit proof covers the
  rule, but no real Plate route proves native input through the rewritten stack.
- Speed gate: after the server is warm, one focused run is at most 60 seconds.
- Robustness gate: 5/5 consecutive warm Chromium runs pass with the same final
  state and no retry.
- Scope gate: one case, one route, no new public Browser API, no shared-runner
  extraction, no full demo inventory, no unrelated cleanup.
- Failure meaning: if this needs a public harness change, more than one product
  case, or cannot meet the speed/repeat gate, stop before scaling and repair the
  methodology first.

Mastermind and child-thread contract:

- This current session becomes orchestration-only when the user accepts pilot
  execution. It owns case selection, source packet, plan/ledger state, evidence
  acceptance, architecture decisions, and final closure. It does not implement
  product code.
- Dispatch exactly one durable child task keyed
  `rewrite-harness/autoformat-pilot`. Do not use temporary subagents, parallel
  code writers, or worktrees.
- Use a fresh Sol-high child for the first pilot. The methodology, route host,
  proof command, and failure classification are still design-sensitive.
- The child executes only slices 1 and 2 under a new one-shot execution goal,
  then stops. It does not begin the 60-surface harvest.
- The child reports exact files, case row, command, cold/warm timings, 5-run
  result, browser artifacts, scope deviations, blocker, and recommended next
  owner. It does not commit, push, or open a PR without explicit authority.
- The mastermind reads the diff/evidence and reruns the one focused command
  once. A second child is unnecessary unless the result is technically
  ambiguous; any such review child is read-only and starts only after the
  implementation child stops.
- Later routine feature batches use fresh Sol-medium child tasks. Reuse the
  same child for follow-ups on the same branch/batch; archive it after closure.
  Escalate to Sol-high for native selection, IME, clipboard, collaboration,
  browser-specific failures, public Browser API, or runner architecture.
- The shared TSV ledger, not worker conversation history, is the durable state.
  Fresh workers receive only selected case rows, current refs/checkout facts,
  owner files, proof commands, and explicit non-goals.

Architecture cleanup candidates:
| Rank | Strength | Candidate | Files / facts | Navigation score | Recommendation | Owner | Proof | Decision |
| ---: | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Strong | Plate adopter browser gap | `check-plite.mjs`; live flat Autoformat registry/value changes are not considered relevant, while table/combobox package changes select package proof but no browser smoke; `apps/www` has zero browser-test entrypoints. | 3 owners, no product browser command, proof boundary unclear -> worse | Add the one-case Plate lane and later select cases by changed owner paths. | Plate Plan + tooling | Autoformat Chromium pilot, selector contracts, later all-demo load smoke | plan |
| 2 | Strong | Prose-only first-party contract registry | 25 intent rows and 5 parity rows; 4 generated-stress families are unregistered, 8 registered families are absent from generated stress, and assertion strings do not name executable proof. | 4 files, 3 owners, indirect proof -> worse | Replace duplicate prose contracts with stable executable case IDs/proof refs; preserve public API only after `best-api`. | Plite Plan / Browser | core contract tests plus mapped route greps | plan |
| 3 | Strong | Raw browser-handle bypasses | 14 Plite spec files access `__pliteBrowserHandle`; browser specs/harness contain 65 `any`-style casts around these paths. | 18 files, 2 owners, private/public boundary bypass -> worse | Add only repeated curated harness operations, then remove direct handle reads where the harness can express the proof. | `@platejs/browser` + Plite React | Browser package tests and affected route cases | simplify |
| 4 | Strong | Timing/readiness duplication | 24 example specs navigate directly to `/examples/plite`; 42 `waitForTimeout` calls exist across specs and harness code. | 24+ files, timing policy hidden -> worse | Route normal setup through readiness contracts; move repeated browser settling into named semantic waits, retaining justified browser-policy timers. | `@platejs/browser` | focused flake/repeat runs and runner contracts | simplify |
| 5 | Worth exploring | Route spec monoliths | Six files hold 574 static tests; `richtext.test.ts` alone has 203 tests across marks, IME, selection, input, history, scroll, and stress. | 1 file but many behavior owners and brittle grep targeting -> worse | Split only by durable behavior/proof family after stable case IDs exist; share one route fixture. | `apps/plite` proof | unchanged focused greps plus full source file proof | split |
| 6 | Worth exploring | Managed runner reuse | `apps/plite/scripts` has 5,760 source/test lines; the managed runner is proven but currently has one host and hard-coded Plite selectors. | 4 runtime owners, clear Plite proof -> same today | Keep for the pilot. If `apps/www` becomes a second real adapter, extract only the shared executor/state core. | repo proof tooling | existing runner tests plus Plate runner contracts | defer |
| 7 | Strong | Testing control-doc drift | 12 relevant docs contain obsolete checkout/path names; the active Plite example matrix is file-level and cannot answer Plate story coverage. | many docs, overlapping queue claims -> worse | Merge live operating truth into editor-behavior README + one TSV ledger; mark historical plans/research as reference and update stale active status. | docs/editor-behavior | path validator and source-backed link audit | merge |
| 8 | Strong keep | `@platejs/test-utils` | Two focused modules, 230 consuming files across Plate app/packages. | 3 source files, one package proof command, clear boundary -> easier | Keep. It already earns its package boundary; do not fold browser automation into it. | `@platejs/test-utils` | package test/typecheck/build | keep |
| 9 | Strong keep | Single Plite example source tree | `apps/plite` imports 38 live examples from `apps/www`; repo policy forbids a second example tree. | 2 owners with explicit host/source split -> easier | Keep. Plate product browser tests use `apps/www` routes instead of copying sources into `apps/plite`. | `apps/www` + `apps/plite` | registry/loader audit and browser route proof | keep |

Decision brief:
- outcome: one resumable, source-backed inventory and risk-driven proof loop
  can close the Plate-on-Plite rewrite without pretending every interaction
  deserves a permanent browser test.
- chosen shape: Plate demo stories are inventoried as atomic cases under
  `docs/editor-behavior`; `apps/www` owns product-route proof;
  `@platejs/browser` owns reusable editor/browser primitives; package tests own
  semantic combinations; Auto owns repeated batches.
- strongest rejected alternative: port every main behavior into one giant
  Playwright suite or extend the existing Plite contract registry with more
  prose rows.
- consequence: the first implementation is one Autoformat case and the minimum
  Plate browser command needed to run it. Full inventory and harness cleanup
  follow only after the pilot proves both speed and determinism.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Product story inventory | 60 stable docs demos, package tests, docs features, registry source, and changelog rows have no atomic shared inventory. | One validated TSV row per observable case, with source provenance, risk, owner, proof, and disposition. | `docs/editor-behavior/**` | Existing protocol law is broad but does not answer per-demo product workflow coverage. | Link existing protocol IDs and proof; do not copy their law. | validator covers every live demo and path. | Corpus growth or stale refs can create false closure. | rearchitect |
| Main baseline | Main tests are incomplete; docs/source still describe stable stories. | Record main source/docs/tests as baseline evidence; run main runtime only for decision-changing ambiguity. | Plate Plan | Blind main parity would lock old bugs and waste dual-runtime setup. | Every row records baseline verdict and source refs. | cursor audit plus sampled pilot. | Current intent may differ from main. | keep |
| Plate browser host | No `apps/www` Playwright lane; Plite proof cannot cover registry behavior. | Narrow `apps/www` Chromium lane against `/blocks/<demo>` using `@platejs/browser`. | Plate Plan / `apps/www` | Product input rules, UI, focus, popup, toolbar, and feature integration live here. | Autoformat pilot, then case-selected growth. | Browser route, model/DOM/selection/focus, console. | Next build cost and flake pressure. | move |
| Browser harness | Rich generic Plite harness exists, but route specs bypass it and public prose contracts drift from executable proof. | Preserve generic input/selection/clipboard/IME/focus/geometry ownership; promote only repeated primitives with `best-api`. | Plite Plan / `@platejs/browser` | Plate concepts would pollute substrate; repeated raw operations show real missing primitives. | Pilot starts with current public harness and app-owned locators. | package tests/types plus selected browser cases. | Public API churn or fake abstraction. | gate |
| Test creation | Existing suites are large, while many main stories have no test. | Add a test only for an observed regression or an impact-3 missing browser invariant. | owning package/app | Test count is not confidence; permanent cost needs a concrete risk owner. | Every case records a `test_decision`. | validator rejects blank decisions on closed rows. | Under-testing medium-risk interactions. | keep |
| Proof selection | Plate adopter changes run package proof only; full Plite browser is broad and unrelated. | Case rows declare owner paths and commands; changed-path selection runs focused Plate cases, Chromium during iteration, broader browsers at closure or for browser-specific rows. | tooling + app runner | Focused proof makes the loop usable without hiding browser risk. | Integrate only after pilot stability. | selector unit tests and synthetic changed-file fixtures. | Bad path mapping can skip required proof. | rearchitect |
| Existing testing docs | Multiple active/historical docs overlap and cite obsolete paths. | One current operating owner and ledger; historical research remains linked evidence. | architecture cleanup / docs | Future agents need a single resume point. | Update README and stale status/links during accepted execution. | source/path audit. | Deleting useful historical rationale. | merge |
| Research | Existing research already covers `fill()` rejection, native traces, IME, selection, and clipboard methods. | Reuse first; open a Plite Research artifact only when a selected critical case lacks behavior law or a trustworthy oracle. | `plite-research` | More broad research now would be decorative duplication. | Promoted test/plan packet links back to the case ID. | research doctor/dedupe plus local source proof. | Browser-specific gaps may remain hidden until execution. | gate |
| Autogoal and orchestration workflow | Auto already has batch-loop, scenario, oracle, browser-promotion, cleanup, and handoff rows; Orchestrator keeps implementation out of the mastermind session. | Mastermind dispatches one durable child per bounded branch/batch; pilot uses a one-shot execution goal, later batches use the existing Auto template with the shared ledger. Repair templates only after two batches prove a recurring missing field. | `orchestrator` + `auto` + `autogoal` | Temporary subagents lose durable branch context; a new wrapper skill/template duplicates current owners. | Each child records selected case IDs and ledger cursor; same-branch follow-ups reuse the child. | child readback, focused rerun, goal checker, batch ledger readback. | Durable thread tools must be available at execution time. | keep |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. One-row pilot inventory | Mastermind session + editor-behavior docs | Create one ledger row for `autoformat:text-substitution-native-input`; source it from main/current docs, registry rule source, Core unit proof, and the live route owner. | User accepts this corrected plan. | The row has stable identity, provenance, score, expected law, proof fields, and one test decision without generic machinery. | row validator, source cursor/checkout readback, mastermind review. |
| 2. Minimal Plate browser lane | One fresh durable Sol-high child task | Add only the focused Chromium command and case for `/blocks/autoformat-demo`; use current Browser primitives and app-owned setup. Type ` ->`, require ` →`, then type `x`. | Pilot row is locked and mastermind dispatches the bounded packet. | Model and DOM end in ` →x`; selection is collapsed at the end; focus remains editor-owned; no runtime errors; 5/5 warm focused runs pass; warm run is at most 60 seconds. | child command/artifacts, then independent mastermind readback and one rerun. |
| 3. Full story harvest | Plate Plan / Auto | Expand to every live docs demo and any registry-only product surface; dedupe against protocol IDs and existing proof. | Pilot schema and route lane are stable. | 60/60 docs demos classified; zero discovered cases lack score, owner, source, and test decision. | inventory validator and source/path audit. |
| 4. Risk-ordered execution | Auto routes regressions to `patch` | Run observed regressions and score 9..12 first, then 6..8; write only required oracles; fix the owning package/runtime. | Full or incrementally valid inventory exists. | Zero open observed regressions; every impact-3 browser-sensitive row has durable proof or an explicit unavailable-proof risk. | focused package/browser proof per row; batch summaries. |
| 5. Harness and test cleanup | architecture cleanup + Plite/Plate Plan | Apply accepted candidate packets: raw-handle reductions, semantic waits, executable case IDs, justified test-family splits, docs consolidation. | At least two real batches expose repeated friction. | Every packet is kept, reverted, or deferred; navigation improves and behavior stays green. | Browser package tests/types, selected route proof, navigation score readback. |
| 6. Affected-proof routing | tooling + Auto | Map changed owner paths to case IDs and add the smallest stable CI/development commands. | Plate browser lane has stable runtime and case IDs. | Synthetic Autoformat owner/value changes select the pilot; unrelated package changes do not trigger the full suite. | routing unit tests and focused command dry runs. |
| 7. Closure | Plite Plan + Plate Plan + Auto | Run full inventory validation, P0/P1 case proof, scoped browser matrix, package gates, docs/path audit, P2 review, and final residual-risk report. | No runnable high-risk row remains. | Plan/ledger checks pass, zero accepted review findings remain, and every residual claim is scoped. | named closure commands below plus `check-complete`. |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Plate corpus is completely inventoried | 60 live docs demos on both refs. | validator reports 60/60 surfaces and zero unclassified cases. | planned |
| Existing generic behavior law is reused | protocol matrix has 242 status rows across tested/specified/partial/deferred. | every applicable example case links a valid protocol ID or records why product-specific. | planned |
| Plate product behavior runs in a real browser | `/blocks/<demo>` renders the registry component; no current Plate browser lane exists. | focused Chromium pilot plus all-demo load/handle/runtime-error smoke. | planned |
| Browser proof matches claim width | Vision requires model, DOM, selection/caret, focus, commit/trace, replay, and follow-up typing when applicable. | each critical row declares and proves only its applicable fields. | planned |
| Plite substrate stays green | Plate uses Plite React Editable and Browser handle. | focused `pnpm check:plite:dev`; `pnpm check:plite` and scoped browser matrix at closure when substrate changes. | planned |
| Package semantics stay green | Core unit proof owns Autoformat text substitution; feature package tests own later semantic combinations. | owning package test/typecheck commands per selected case. | planned |
| Changed-path selection is honest | current live Autoformat registry/value paths are not considered relevant; table/combobox package changes also lack product browser proof. | routing tests prove both positive and negative selections from synthetic changed files. | planned |
| Public Browser API remains coherent | no public API change accepted in planning. | `best-api` review, package build/test/typecheck, exports/barrels, changeset only for a kept public delta. | conditional |
| Workflow is resumable | existing Auto template carries batch/checkpoint state. | new Auto plans record case IDs/cursors; ledger validator and goal checker pass after interruption/resume. | planned |

Conditional evidence:
- High-risk scenarios:
  1. Main docs describe a behavior that current product law intentionally cut;
     the loop must classify it instead of creating a false regression.
  2. A green route test asserts model state while native focus or DOM selection
     is broken; claim fields must be explicit per case.
  3. Hard waits make the new lane flaky; readiness and browser-policy settling
     must be semantic and repeat-proven.
  4. Changed-path selection misses a cross-package dependency; routing tests
     need transitive owner fixtures and a conservative fallback.
  5. Harness cleanup leaks Autoformat or other product concepts into Plite; public
     promotion stops for `best-api` and layer review.
- External research: reuse existing Plite testing-oracle and proof-methodology
  artifacts. Start a new `docs/plite/research/<date>-<topic>/` packet only for
  a selected critical case with a local law/oracle gap; dedupe first and
  promote to a test or plan owner, never directly to runtime.
- Issue/PR provenance: N/A for planning. Changelog/issue evidence may seed case
  provenance during harvest, but no public GitHub mutation is authorized.
- Browser/benchmark/docs/release/behavior-law owners: browser and docs are in
  scope; benchmarks are N/A unless a test-lane latency/flake claim appears;
  release artifacts are conditional on a public package delta; behavior law
  remains in `docs/editor-behavior`.

Findings:
- The finish line must be regression-resistant rather than literally
  regression-free: native editing behavior is browser- and platform-dependent,
  so the plan must expose residual coverage instead of hiding it behind a green
  suite.
- The rewrite has a concrete product-proof hole: 60 docs demos survive on
  `main` and `next`, but `apps/www` has no Plate browser suite. Package tests and
  Plite browser proof do not cover registry UI workflows.
- The repo already owns a strong generic framework. Creating another runner,
  harness package, or universal test DSL would be architecture regression.
- Current first-party contract prose is not executable traceability. The 25
  registered rows and generated stress cases already disagree at the family
  level.
- Autoformat is the best pilot because one deterministic native-keyboard case
  crosses docs, registry policy, Core input rules, Plate composition, Plite
  transport, DOM/model state, selection, focus, follow-up typing, Browser, and
  affected-proof routing without popup, pointer, clipboard, layout, network,
  collaboration, or device variability.

Decisions and tradeoffs:
- Use one Plite Plan as the governing artifact. Plite owns native editing and
  browser proof; Plate examples are adoption/story sources; architecture
  cleanup and research are workstreams inside the same resumable loop.
- Reject separate competing Plite, Plate, cleanup, and research plans. They
  would duplicate state and make case ownership harder to resume.
- Reject a full main-to-next browser mirror. Source/docs/tests seed expected
  behavior; current product law decides whether a difference is a regression.
- Reject a new autogoal template now. The existing Auto template already owns
  the batch loop; repair it only after repeated evidence proves a missing field.
- Reject disposable parallel workers. The mastermind uses one durable Sol-high
  child for the pilot, then Sol-medium per routine batch, with same-branch
  thread reuse and no concurrent code writers.
- Keep `@platejs/test-utils` and the shared Plite example source topology. Both
  have clear owners and substantial real reuse.
- Child workflow overhead: loading generic `testing`, `plate-ui`, and `shadcn`
  added no useful implementation decision after the mastermind narrowed the
  slice to one test-only app lane. No component, shadcn, or registry
  implementation review followed.

Review fixes:
- Self-review rejected the literal `regression-free` claim and replaced it with
  auditable critical-case closure plus residual risk.
- Self-review collapsed four possible work plans into one Plite-governed plan
  with explicit Plate adoption.
- Self-review moved harness refactoring after the pilot so source cleanup is
  driven by repeated friction instead of file-size aesthetics.
- User correction rejected a pilot copied from prompt examples. Candidate
  ranking now selects one Autoformat case independently and stops before any
  second case or broad inventory.
- User correction made this session the mastermind. The plan now forbids local
  implementation and disposable/parallel workers during pilot execution.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Used zsh read-only variable name `status` while counting protocol rows. | 1 | Use one bounded regex pipeline without shell state. | Resolved; counted 168 tested, 62 specified, 11 deferred, and 1 partial rows. |
| Pilot spec used `import.meta.url` under the app's CommonJS Playwright loader. | 1 | Resolve the ledger from the app process cwd. | Resolved; static discovery lists exactly one test. |
| Default and `dev:plite` route hosts compiled stale `src/__registry__/index.tsx` imports. | 3 | Try only app-owned source modes, then preserve the focused failure. | Unresolved; test-only alias experiments were reverted and the pilot stopped. |
| Turbopack resolved app CSS dependencies from the workspace `apps/` parent. | 1 | Run the repo-required reinstall once, then return to the owned webpack host. | Reinstall passed; Turbopack remained unsuitable and its experiment was reverted. |
| An interrupted Playwright run left a child-owned Next process and polluted one cold timing. | 1 | Kill only that exact process and rerun cold from no server. | Resolved; discarded the 353.15s sample and retained the clean 73.29s result. |
| Standalone `oxfmt` was unavailable. | 1 | Use the repo's installed Biome binary on the explicit changed files. | Resolved; Biome check passed. |
| Pilot blockers were first recorded under a custom checklist heading ignored by `check-complete`. | 1 | Move required pilot gates into the canonical Work Checklist. | Resolved for plan honesty; the checker now fails until behavior and warm proof close. |

Verification evidence:
- Source audit: `origin/main` and `HEAD` each contain 60 unique docs demo names;
  the only name delta is markdown-to-Slate versus markdown-to-Plite.
- Source audit: 38 Plite examples are registered; 42 example browser spec
  files contain about 41,429 lines and 1,058 static tests.
- Pre-pilot source audit: `apps/www` contained no Playwright config or Plate
  browser test directory; the child added one config and one spec only.
- Runtime-owner audit: PlateContent renders Plite React Editable; the Browser
  harness can inspect current Plate roots without restoring a Plate-specific
  transport.
- Routing audit: synthetic table and combobox changes select package tests and
  typechecks but no browser smoke; current flat Autoformat registry/value paths
  are not considered relevant at all; a Plite React runtime change selects
  Plite browser smoke and downstream adopter typechecks.
- Cleanup audit: 14 example specs access the raw browser handle, 65 `any`-style
  casts exist in the inspected browser proof scope, 42 hard waits exist, and 24
  specs navigate directly instead of using the normal route helper.
- Existing research audit: native event trace, selection, clipboard, IME, and
  `fill()` policy are already covered; no new broad research packet is justified
  before a selected case exposes a gap.
- Pilot audit: current docs and live registry source define explicit
  text-substitution rules; Core unit proof covers `->` to `→`; the real
  `/blocks/autoformat-demo` route has no Plate browser proof.
- Routing audit: the current flat Autoformat registry owner and demo value are
  not selected by `createAffectedPlan()`, which reports no relevant package,
  typecheck, or browser work for either path.
- Thread capability audit: durable Codex create/read/send/wait/archive tools are
  available and support explicit `gpt-5.6-sol` high/medium child settings. The
  pilot will use the saved project directly with no worktree.
- Command: `PLAYWRIGHT_BASE_URL=http://localhost:9 pnpm --filter www exec
  playwright test --config playwright.config.ts --project=chromium --list` ->
  passed; one Chromium test in one file with the exact case ID.
- Command: bounded Node TSV validation -> passed; one case row and 21 aligned
  columns.
- Command: `pnpm exec biome check apps/www/playwright.config.ts
  apps/www/tests/browser/autoformat.spec.ts apps/www/package.json` -> passed;
  three files checked with no fixes.
- Command: `pnpm run reinstall` -> passed once; route-host missing imports
  remained, so the failure is not attributed to install corruption.
- Command: `pnpm --filter www test:www-browser:chromium` -> failed in `73.29s`;
  the one test timed out after `45.1s` waiting for the editor root while
  `src/__registry__/index.tsx` reported removed registry imports. The real
  keyboard, selection, focus, runtime-error, and warm gates were not reached.
- Warm proof: unmeasured. Cold startup duration is not used as evidence against
  the `<=60s` warm gate.
- Browser proof: N/A because deterministic Playwright proof did not reach an
  editor-ready route.
- Plan honesty gate: `check-complete.mjs` now exits 1 and reports the three
  canonical unchecked pilot rows; the blocked pilot cannot masquerade as a
  completed plan.

Final handoff prepared:
- Ownership and target API/runtime: Plite owns generic browser primitives;
  Plate owns demo stories and `/blocks` proof; no public API target is accepted.
- Public breaks and Plate/collaboration adoption: no break; the Autoformat
  pilot did not reach the shared Plate/Plite input path, so no broader product
  or collaboration case may enter scope.
- Applicable browser/benchmark/docs/provenance decisions: Browser and internal
  docs apply; benchmarks/release/public provenance are conditional or N/A.
- Proof and execution risks: false main parity, model-only greens, timing
  flakes, path-selection misses, and substrate pollution are gated above.
- Execution order and user attention: accept this plan, then one pilot row,
  minimal Plate lane, full harvest, risk batches, cleanup, routing, closure.
- Orchestration: this session is the mastermind; one fresh durable Sol-high
  local-project child executes only the Autoformat pilot; no worktree, parallel
  code writer, commit, push, or PR.

Timeline:
- 2026-08-17T08:50:39.029Z Plite Plan created.
- 2026-08-17 Prompt requirements captured before broad source exploration;
  goal activated and deep planning boundary selected.
- 2026-08-17 Live proof owners, 60-demo corpus, branch cursors, protocol rows,
  harness bypasses, timing debt, runner ownership, and Plate routing gap audited.
- 2026-08-17 Plan initially hardened around a table/combobox pilot, one case ledger,
  selective test promotion, existing Auto batches, and nine cleanup decisions.
- 2026-08-17 User rejected example-anchored pilot selection. Re-ranked the
  smallest candidates and selected one Autoformat native-input case; added
  mastermind/child orchestration and quantitative speed/robustness gates.
- 2026-08-17 Child created the one-row ledger and one-case `apps/www` Chromium
  lane, then stopped with methodology repair after the local route host failed
  before rendering an editor. Warm and Browser proof remain unmeasured/N/A.
- 2026-08-17 The identical route-host blocker survived three consecutive master
  goal turns with no pilot-scoped repair authority; the goal is terminally
  blocked pending a separate `apps/www` registry-host decision or refreshed
  generated artifact.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Pilot stopped at a route-host methodology repair; no harvest started. |
| Where am I going? | Mastermind readback, then the `apps/www` registry source/generation owner repairs local route readiness. |
| What is the goal? | Prove the single Autoformat native-input case before scaling. |
| What have I learned? | The focused lane is statically valid, but the checked-in registry host cannot render the target route in this checkout. |
| What have I done? | Added one ledger row and one focused Chromium test, retained the clean route-host failure, reverted failed alias experiments, and stopped. |

Open risks:
- `main` may contain stories that are no longer intended behavior. Every parity
  case needs a current product/behavior-law verdict before it can become an
  oracle.
- Browser automation may not expose every native selection, IME, clipboard, or
  accessibility state. The plan must distinguish deterministic automation,
  focused visual/manual proof, and explicitly deferred device-specific risk.
- The full case count is intentionally unknown until the pilot proves the row
  schema. A guessed target count would reward superficial enumeration.
- Plate warm browser cost is unmeasured. Do not wire it into daily affected
  proof until the route host reaches ready and the pilot produces five stable
  timings.
- The Autoformat route exposes current checkout integration failures in the
  stale generated registry and source-first React boundary. Repair belongs to
  the `apps/www` route host owner; it must not widen this child.
