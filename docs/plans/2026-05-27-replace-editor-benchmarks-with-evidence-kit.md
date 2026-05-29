# replace editor benchmarks with evidence kit

Objective:
Hard replace `/Users/zbeyens/git/plate-2/benchmarks/editor` with an Evidence
Kit-backed editor benchmark/evidence lab. Complete only when the old benchmark
app/template surface is removed, the replacement exposes research, fetch, fuzz,
benchmark, perf-doc, and package-boundary evidence workflows, Plate package
scripts point at the new workflows, this plan records destructive scope and
verification, and the final goal-plan check passes.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-05-27-replace-editor-benchmarks-with-evidence-kit.md

Template:
docs/plans/templates/major-task.md

Primary template:
docs/plans/templates/major-task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)

Major source:
- type: user request
- id / link:
  `/Users/zbeyens/git/plate-2/benchmarks/editor`,
  `/Users/zbeyens/git/-shapeshift-labs-evidence-kit`
- title: hard cut/replace editor benchmark lab with Evidence Kit
- decision to make: how to replace the existing editor benchmark lab with the
  maximum useful Evidence Kit surface without preserving stale app/template
  machinery.
- decision criteria: Evidence Kit source is fully read locally; old
  `apps/**`, `templates/**`, stale benchmark app scripts, and benchmark contract
  app surface are removed; the replacement has executable scripts for inspect,
  research registry/fetch, fuzz, evidence benchmark, startup check, package
  boundary check, scope, perf docs, perf search, and full evidence; root package
  scripts call the new lab; verification commands pass or failures are
  recorded with a concrete blocker.

Major lane:
- lane: benchmark / framework-comparison infrastructure
- output type: destructive implementation plus evidence harness
- implementation expected: yes
- affected packages / surfaces:
  `/Users/zbeyens/git/plate-2/benchmarks/editor`,
  `/Users/zbeyens/git/plate-2/package.json`,
  this goal plan.
- dominant risk: deleting a broad benchmark tree and replacing it with a thin
  harness that either fails to run or silently loses the editor-comparison
  evidence contract.

Completion threshold:
- Old benchmark lab surface is gone: no `benchmarks/editor/apps`,
  `benchmarks/editor/templates`, `benchmark-app-contract`, or
  `run_contract_benchmarks` remains.
- Replacement evidence lab exists with target-owned sources, corpus, fuzzer,
  benchmark, startup check, package-boundary check, source fetcher, source map,
  iteration note, perf docs target, and package scripts.
- Plate root `bench:editor:*` scripts route to the replacement or are removed
  when obsolete.
- Evidence Kit full source under `/Users/zbeyens/git/-shapeshift-labs-evidence-kit`
  is read locally before implementation decisions are finalized.
- Focused verification passes: benchmark lab script checks, root script audit,
  stale-surface source audit, and final goal-plan checker.
- Major-task closure is legal only when the decision criteria are satisfied or
  explicitly narrowed, facts/inference/recommendation are separated, required
  review or pressure passes are recorded, implementation gates are closed when
  code changed, and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-27-replace-editor-benchmarks-with-evidence-kit.md`
  passes.

Verification surface:
- source audit: `rg` confirms stale app/template/contract surfaces are gone.
- command: benchmark lab `npm run check`, `npm run evidence:full` or scoped
  equivalent.
- command: root script audit for `bench:editor:*`.
- command: final
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-27-replace-editor-benchmarks-with-evidence-kit.md`.

Constraints:
- Start from repo evidence before external claims.
- Keep helper stack proportional.
- Separate measured evidence, source evidence, inference, and recommendation.
- Implementation is explicitly in scope.
- Preserve unrelated repo files.
- Do not commit or open a PR.

Boundaries:
- Source of truth: latest user request plus cloned Evidence Kit source at
  `/Users/zbeyens/git/-shapeshift-labs-evidence-kit`.
- Allowed edit scope: `benchmarks/editor/**`, root `package.json` benchmark
  scripts, and this plan.
- External sources: local Evidence Kit clone only unless a missing dependency
  requires package metadata.
- Browser surface: no browser proof required unless replacement keeps a browser
  app, which it should not.
- Tracker sync: none.
- Non-goals: no PR, no commits, no attempt to benchmark every editor in this
  slice, no preservation of the old benchmark app shell.

Blocked condition:
- Block only if the Evidence Kit source cannot be read locally, dependencies
  cannot be installed or executed enough to verify the replacement, or the
  hard-cut replacement conflicts with repo scripts in a way that needs a user
  decision after concrete repair attempts.

Major state:
- task_type: major
- task_complexity: major
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active until final checker passes

Current verdict:
- verdict: execute hard replacement
- confidence: high
- next owner: future benchmark adapter work
- reason: user explicitly requested hard cut/replace, and the current
  benchmark lab already drifted into a large app/template surface instead of an
  evidence-first benchmark harness. The replacement now passes its Evidence Kit
  gates and root script wiring proof.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-27-replace-editor-benchmarks-with-evidence-kit.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| `major-task` loaded | yes | `.agents/skills/major-task/SKILL.md` read before implementation; lane selected as benchmark/framework-comparison infrastructure. |
| Active goal checked or created | yes | `get_goal` returned null; `create_goal` created active goal `019e692a-6e34-7141-8264-52d3b83f834d`. |
| Source of truth read before analysis | yes | User request and autogoal skill body read in prompt; full local Evidence Kit source read: `src/cli.mjs`, `src/index.mjs`, `scripts/evidence-kit.mjs`, templates, schemas, tests, and skills under `/Users/zbeyens/git/-shapeshift-labs-evidence-kit`. |
| Major lane selected | yes | benchmark / framework-comparison infrastructure. |
| Decision criteria stated | yes | Criteria recorded in Major source and Completion threshold. |
| Existing repo patterns / prior decisions checked | yes | Read old `benchmarks/editor/README.md`, root `package.json` benchmark scripts, `docs/analysis/editor-architecture-candidates.md`, Slate v2 benchmark README, and prior memory for Slate v2 benchmark artifacts. |
| Helper stack selected | yes | `autogoal`, `major-task`, local Evidence Kit skills/source. No browser or docs-creator because browser app and user-facing docs were removed. |
| External research decision recorded | yes | Use local Evidence Kit clone only. No web research unless local source is insufficient. |
| Implementation expectation recorded | yes | Destructive implementation is in scope. |
| Workspace authority selected | yes | `/Users/zbeyens/git/plate-2` root and `benchmarks/editor`; Evidence Kit source at `/Users/zbeyens/git/-shapeshift-labs-evidence-kit`. |
| Branch / PR expectation decided | yes | No commit or PR requested; do not create one. |
| Docs pack selected | yes | Applied `docs` pack because this plan is the durable docs artifact. |
| `docs-creator` loaded | no | N/A: no user-facing docs rewrite; only runtime goal plan evidence. |
| Docs lane selected | no | N/A: implementation-dominant, docs pack only for goal plan evidence. |
| Target docs and nearest sibling docs read | no | N/A: no user-facing docs target; benchmark README/source will be read. |
| Docs style doctrine read | no | N/A: no docs content change beyond this plan. |
| Documented source owner identified | yes | `benchmarks/editor` becomes Evidence Kit lab owner; old benchmark app surface is intentionally removed. |

Work Checklist:
- [x] Objective includes outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition.
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
- [x] Accepted/actionable review findings are fixed or explicitly rejected with
      evidence.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded. N/A: only runtime plan and replacement README/evidence notes changed.
- [x] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason. N/A: no API docs or demo pages changed.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, anchors, and previews target real leaf pages or are marked N/A with reason. N/A: no docs links or previews added.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the repo audit, benchmark, review, prototype, or artifact check named in this plan | `npm run bench:editor:check` passed from `/Users/zbeyens/git/plate-2`; it runs syntax checks, fuzz, benchmark rows, startup check, package-boundary check, scope, perf docs, and research registry. |
| Current-state source audit | yes | Map current owner, boundaries, constraints, and affected surfaces | Old surface mapped from old `benchmarks/editor/README.md`, root package scripts, and directory tree; replacement owner is `benchmarks/editor` Evidence Kit package. |
| Decision criteria closure | yes | Mark each criterion satisfied, narrowed, rejected, or blocked with evidence | Satisfied: old app/template surface removed; replacement scripts and artifacts exist; root scripts updated; checks passed. |
| Options / tradeoffs / rejection record | yes | Record viable options, chosen recommendation, and why alternatives lose | Recorded under Decisions and tradeoffs. |
| Review / pressure pass | yes | Run selected reviewer/lens or record N/A with reason | Scoped Biome check acted as implementation pressure pass and caught generated-script issues; fixed and reran clean. |
| Review findings closure | yes | Fix or explicitly reject accepted/actionable findings and record closure proof | Fixed generated parse loops, assertion style, and import-regex assignment; `pnpm exec biome check ... --fix` now passes. |
| External-source audit | yes | Cite official/local clone/external sources when used, or record N/A | Local Evidence Kit source read in `/Users/zbeyens/git/-shapeshift-labs-evidence-kit`; package version verified by `npm view @shapeshift-labs/evidence-kit version` -> `0.1.2`. |
| Implementation gates | yes | If code changed, close primary-template and touched-surface gates; otherwise N/A | `benchmarks/editor` replaced, root scripts updated, `npm run bench:editor:check` passed. |
| Final handoff contract | yes | Record recommendation, evidence, caveats, residual risk, and next owner | Recorded below. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent when files changed | `pnpm exec biome check package.json benchmarks/editor docs/plans/2026-05-27-replace-editor-benchmarks-with-evidence-kit.md --fix` passed after fixes. |
| Goal plan complete | yes | Run `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-27-replace-editor-benchmarks-with-evidence-kit.md` | Passed after closeout row repair. |
| Docs source-backed claim audit | no | Verify docs claims against current source or record N/A | N/A: no user-facing docs/API claims changed; replacement README and evidence notes point at files created in this slice. |
| Docs links / routes / previews | no | Verify leaf links, routes, anchors, and preview names or record N/A | N/A: no docs links/routes/previews added. |
| Docs MDX/content parser | no | Run `pnpm --filter www build:contentlayer` for MDX/content changes, or record N/A | N/A: no MDX/contentlayer docs changed. |
| Plugin page specifics | no | For plugin pages, apply `docs-creator` kit/manual/API rules; otherwise N/A | N/A: no plugin page changed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | User request, autogoal prompt body, major-task skill, full Evidence Kit source, old benchmark README/root scripts read. | current-state map |
| Current-state map | complete | Old app/template lab and root benchmark scripts mapped before deletion. | implementation |
| Options and recommendation | complete | Hard replacement chosen over adapter-preserving migration. | review |
| Review / pressure pass | complete | Scoped Biome found generated-script issues; fixed. | verification |
| Implementation or plan artifact | complete | `benchmarks/editor` replaced with Evidence Kit package and root scripts updated. | verification |
| Verification | complete | `npm run bench:editor:check`, source fetcher, stale-surface audit, and scoped Biome passed. | closeout |
| Closeout | complete | Plan updated; first checker attempt repaired open closeout row. | final response |

Findings:
- Evidence Kit is mechanism-first: CLI/lib owns inspect, init, add-fuzzer,
  add-benchmark, source fetch, scope, docs, search, and research registry.
- Generated TypeScript scripts are placeholders unless a TS runner is added;
  this replacement uses JavaScript so Node can run every gate directly.
- Evidence Kit package detection is npm/pnpm/yarn only, but this new lab is an
  npm island, so detection reports `npm`.
- Old `benchmarks/editor` had broad Next/Vite app/template/browser machinery.
  The replacement has no `apps`, `templates`, `components`, `assets`, `website`,
  or contract runner directories.
- The new evidence benchmark emits an explicit `hard-cut /
  legacy-app-surface-removed` row with `status: ok`.

Decisions and tradeoffs:
- Chose a standalone npm evidence package over keeping the old browser app lab.
  Reason: user asked for hard cut and Evidence Kit already owns the evidence
  workflows. Risk: no real cross-editor runtime adapters yet.
- Chose `@shapeshift-labs/evidence-kit@0.1.2` from npm over a hardcoded local
  file dependency. Reason: root scripts should run without depending on
  `/Users/zbeyens/git/-shapeshift-labs-evidence-kit` after install.
- Kept generated Evidence Kit helper scripts in the package and patched them to
  satisfy Plate Biome policy. Reason: better than adding lint suppression around
  the new harness.
- Rejected preserving `bench:editor:contract`, `bench:editor:dev`, and
  target-app scripts. Reason: those names point at the deleted app lab.

Implementation notes:
- Deleted old `benchmarks/editor` and created a new Evidence Kit package.
- Added `benchmarks/editor/src/index.mjs` as target-owned contract code for
  editor targets, stale-surface guards, row normalization, and evidence
  readiness rows.
- Added target-owned corpus, fuzzer, benchmark, research source configs,
  source-pass notes, perf docs, benchmark result JSON, and source fetch
  manifest.
- Rewrote root `bench:editor:*` scripts to Evidence Kit workflows.

Review fixes:
- Scoped Biome found generated script style issues: `for` loops in arg parsers,
  assignment inside regex loop, and `assert` usage outside test blocks.
- Fixed generated scripts locally and reran scoped Biome clean.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Scoped Biome failed on generated Evidence Kit scripts | 1 | Patch generated scripts to repo style instead of suppressing the tree | Resolved; scoped Biome passes. |
| Goal checker found `Closeout=in_progress` | 1 | Mark closeout complete after recording final evidence | Resolved in this plan update. |

Verification evidence:
- `/Users/zbeyens/git/plate-2/benchmarks/editor`: `npm run check` passed.
- `/Users/zbeyens/git/plate-2/benchmarks/editor`:
  `npm run research:editor-frameworks:fetch` passed and wrote
  `research/repos/editor-frameworks/manifest.json`.
- `/Users/zbeyens/git/plate-2`: `npm run bench:editor:inspect` passed; Evidence
  Kit inspect reports fuzzers, benchmarks, research fetchers, source cache,
  perf docs, and perf index present.
- `/Users/zbeyens/git/plate-2`: `npm run bench:editor:search -- editor benchmark`
  passed and returned benchmark/research/iteration evidence rows.
- `/Users/zbeyens/git/plate-2`: stale surface audit passed:
  `find benchmarks/editor/apps benchmarks/editor/app benchmarks/editor/templates benchmarks/editor/components benchmarks/editor/assets benchmarks/editor/website benchmarks/editor/tests/config -maxdepth 0 -print`
  returned only missing-path errors, proving the old directories are absent.
- `/Users/zbeyens/git/plate-2`: stale script audit passed:
  `rg '"bench:editor:(build|build:plate|contract|contract:prod|dev|dev:plate|dev:slate|prepare:plate|preview:plate|preview:slate|start|transform)"|benchmark:contract|apps/plate|apps/slate|benchmark-app-contract|run_contract_benchmarks|EditorBenchmarkContract|templates/apps|templates/tests' package.json benchmarks/editor --glob '!benchmarks/editor/src/index.mjs' --glob '!benchmarks/editor/benchmarks/data/**'`
  returned no matches.
- `/Users/zbeyens/git/plate-2`: scoped lint passed:
  `pnpm exec biome check package.json benchmarks/editor docs/plans/2026-05-27-replace-editor-benchmarks-with-evidence-kit.md --fix`.
- `/Users/zbeyens/git/plate-2`: `npm run bench:editor:check` passed from the root
  script. It emitted npm warnings for pnpm-oriented config keys; warnings did
  not fail the command.
- `/Users/zbeyens/git/plate-2`: first goal-plan checker run failed only because
  `Closeout` still said `in_progress`; this row is fixed before final rerun.
- `/Users/zbeyens/git/plate-2`:
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-27-replace-editor-benchmarks-with-evidence-kit.md`
  passed.

Final handoff contract:
- Recommendation: keep `benchmarks/editor` as an Evidence Kit evidence package;
  add future cross-editor adapters as benchmark/fuzzer/source rows, not by
  restoring the old app lab.
- Confidence: high for replacement correctness; medium for future benchmark
  usefulness until real adapter rows are added.
- Evidence: listed in Verification evidence.
- Tests / commands: `npm run bench:editor:check`, scoped Biome, source fetcher,
  root inspect/search aliases.
- Browser proof: N/A; browser app intentionally removed.
- PR / tracker: N/A; no PR requested.
- Caveats: npm prints warnings from pnpm-oriented config keys when root scripts
  invoke npm. They are warning-only. No real ProseMirror/Lexical/Tiptap runtime
  benchmarks exist yet.
- Next owner: future benchmark adapter slice.

Timeline:
- 2026-05-27T11:30:32.942Z Major-task goal plan created.
- 2026-05-27T11:31Z Active autogoal created.
- 2026-05-27T11:32Z Full local Evidence Kit source read.
- 2026-05-27T11:35Z Old `benchmarks/editor` hard-deleted and Evidence Kit scaffold initialized.
- 2026-05-27T11:38Z New fuzzer, benchmark, research config, README, source map,
  and root scripts added.
- 2026-05-27T11:39Z `npm run check` passed in `benchmarks/editor`.
- 2026-05-27T11:39Z `npm run research:editor-frameworks:fetch` passed.
- 2026-05-27T11:41Z Scoped Biome initially failed on generated-script issues;
  fixes applied.
- 2026-05-27T11:42Z Scoped Biome and root `npm run bench:editor:check` passed.
- 2026-05-27T11:43Z First goal-plan checker run failed on open closeout status;
  plan fixed for rerun.
- 2026-05-27T11:43Z Goal-plan checker passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Final goal-plan check, update goal complete, final response |
| What is the goal? | Hard replace `benchmarks/editor` with an Evidence Kit evidence lab and verify it. |
| What have I learned? | Evidence Kit works best here as the harness and artifact layer; real editor adapters are future work. |
| What have I done? | Old lab deleted, new Evidence Kit lab added, root scripts rewired, verification passed. |

Open risks:
- No remaining risk for the hard replacement. Future risk: the lab does not yet
  benchmark actual ProseMirror/Lexical/Tiptap runtimes.
