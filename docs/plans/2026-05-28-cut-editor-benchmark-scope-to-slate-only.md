# Cut editor benchmark scope to Slate only

Objective:
Cut the active Evidence Kit rich-text benchmark scope to Slate v2 vs Slate only.
Remove ProseMirror, Plate, Lexical, and Tiptap from active targets, adapters,
generated comparison data, and workflow prompts. Make Slate chunk-on the only
legacy Slate baseline surface; chunk-off must not be measured or emitted by the
active flow.

Completion threshold:
- `rich-text.html` and `rich-text-data.json` contain only Slate v2 and Slate
  libraries.
- The active rich-text result contains no ProseMirror, Lexical, Tiptap,
  chunk-off, legacyChunkOff, runtime-adapter, or non-Slate adapter rows.
- `Plate repo root` Slate browser trace and legacy-compare runners default to
  chunk-on only for legacy Slate.
- Benchmark package scripts, lockfile, research sources, registry, notes, and
  generated docs match the Slate-only scope.
- The benchmark package full check passes.

Verification surface:
- `npm install` in `/Users/zbeyens/git/plate-2/benchmarks/editor`
- `npm run research:editor-frameworks:fetch`
- `REACT_HUGE_COMPARE_LEGACY_REPO=../../../slate bun run bench:react:huge-document:legacy-compare:local`
- `SLATE_LEGACY_BROWSER_TRACE_SURFACES=legacyChunkOn bun run bench:react:huge-document:slate-browser-trace:local`
- `npm run check` in `/Users/zbeyens/git/plate-2/benchmarks/editor`
- Served JSON fetch from `http://127.0.0.1:8765/rich-text-data.json`

Constraints:
- Do not restore the old benchmark app zoo.
- Do not add non-Slate adapters.
- Do not create a PR or commit.
- Keep Evidence Kit as the active workflow.

Boundaries:
- Source of truth: user request in this thread plus
  `benchmarks/editor/research/benchmark-registry.json`.
- Allowed edit scope: `benchmarks/editor/**` and the two Slate v2 benchmark
  runner scripts that produced chunk-off artifacts.
- Browser surface: local static docs served at `http://127.0.0.1:8765`.
- Tracker sync: N/A; no external tracker.
- Non-goals: adding ProseMirror, Plate, Lexical, Tiptap, or chunk-off rows.

Blocked condition:
Only blocked if the local Slate checkout at `/Users/zbeyens/git/slate` or the
static docs server became unavailable. Both were available.

Task state:
- task_type: benchmark workflow hard cut
- task_complexity: medium
- current_phase: closeout
- current_phase_status: complete
- goal_status: ready for completion

Current verdict:
- verdict: complete
- confidence: high
- next owner: user
- reason: active comparison output and runner commands are Slate-only.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Used active autogoal plan and repo instructions for measurable benchmark workflow work. |
| Active goal checked or created | yes | Active goal created for Slate-only Evidence Kit scope cut. |
| Source of truth read before edits | yes | Read benchmark registry, package scripts, renderer, health report, source normalization, notes, and Slate v2 runner scripts. |
| Tracker comments and attachments read | no | N/A: thread-only task. |
| Video transcript evidence required | no | N/A: no video. |
| Existing solution lookup | no | N/A: local benchmark workflow cleanup, not a bug from prior solution docs. |
| TDD decision before behavior change | yes | Used existing benchmark/fuzz checks and added scope assertions instead of new product tests. |
| Branch decision for code-changing task | yes | N/A: user did not request branch, commit, or PR. |
| Release artifact decision | yes | N/A: private benchmark package, no public package release. |
| Browser tool decision for browser surface | yes | Browser MCP was not exposed; verified served local JSON by direct fetch from the active server. |
| PR expectation decision | yes | N/A: no PR requested. |
| Tracker sync expectation decision | yes | N/A: no tracker requested. |

Work Checklist:
- [x] Objective includes outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition.
- [x] Task source classified as thread request for benchmark workflow scope cut.
- [x] Video evidence marked N/A because none was supplied.
- [x] Repo instructions and benchmark implementation patterns read before edits.
- [x] Implementation fixed the active registry, scripts, generators, and runner
      ownership boundaries.
- [x] Release artifact requirement recorded as N/A for private benchmark lab.
- [x] Final handoff shape decided: concise outcome, verification, and reload URL.
- [x] Branch handling recorded as N/A because no branch or PR was requested.
- [x] Local-env-rot retry policy recorded as N/A; no install corruption signal.
- [x] Workspace authority recorded through `/benchmarks/editor` and `Plate repo root`
      commands.
- [x] High-risk command-contract note recorded: legacy Slate runner now measures
      chunk-on only.
- [x] Review target selected: benchmark package full check plus scope audit.
- [x] Agent-native review marked N/A; no agent skills or rules changed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named benchmark checks and served JSON audit | `npm run check` passed; served `rich-text-data.json` had only Slate libraries and no forbidden terms. |
| Bug reproduced before fix | no | N/A | Scope cleanup, not bug reproduction. |
| Targeted behavior verification | yes | Regenerate result/docs and audit output | `npm run docs:perf:check` passed inside `npm run check`. |
| TypeScript or typed config changed | no | N/A | JavaScript/JSON/docs only. |
| Package exports or file layout changed | no | N/A | No package exports changed. |
| Package manifests, lockfile, or install graph changed | yes | Refresh install graph and package checks | `npm install` passed in `benchmarks/editor`; `npm run check` passed. |
| Agent rules or skills changed | no | N/A | No `.agents` files changed. |
| Workspace authority proof | yes | Run commands in owning workspaces | `Plate repo root` runner commands passed; `benchmarks/editor` check passed. |
| Browser surface changed | yes | Verify local served data | Fetch from `http://127.0.0.1:8765/rich-text-data.json` passed. |
| Browser final proof | yes | Record exact browser caveat | Browser MCP unavailable; served JSON proof is recorded. |
| CI-controlled template output changed | no | N/A | No template output changed. |
| Package behavior or public API changed | no | N/A | Private benchmark lab only. |
| Registry-only component work changed | no | N/A | No Plate registry component work. |
| Docs or content changed | yes | Regenerate and check docs | `npm run docs:perf:check` passed inside `npm run check`. |
| High-risk mini gate | yes | Record failure mode and proof | Failure mode: old artifact or script reintroduces chunk-off; proof: reran chunk-on artifacts and `npm run check`. |
| Agent-native review for agent/tooling changes | no | N/A | No agent tooling changed. |
| Local install corruption suspected | no | N/A | No corruption signal. |
| Autoreview for non-trivial implementation changes | no | N/A | Benchmark workflow hard cut covered by full package check and output audit. |
| PR create or update | no | N/A | No PR requested. |
| PR proof image hosting | no | N/A | No PR. |
| Tracker sync-back | no | N/A | No tracker. |
| Final handoff contract | yes | Fill final result and caveat | Done below. |
| Final lint | yes | Run scoped lint/format | `pnpm exec biome check ... --write` passed with no fixes. |
| Goal plan complete | yes | Run autogoal completion checker | Recorded in Verification evidence. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Registry, renderer, package scripts, notes, and Slate runners read | done |
| Implementation | complete | Non-Slate adapters/results removed; Slate-only registry and scripts patched | done |
| Verification | complete | `npm run check` and served JSON audit passed | done |
| PR / tracker sync | skipped | N/A: no PR or tracker requested | done |
| Closeout | complete | Plan completed and ready for autogoal close | done |

Findings:
- Active rich-text comparison now has 463 served rows across 11 groups.
- Served comparison libraries are `slate`, `slate-v2`, `slate-v2:*`, and
  `slate:*` only.
- Health next actions are refresh/optional-artifact cleanup only; no non-Slate
  adapter action remains.

Decisions and tradeoffs:
- Kept Slate v2-only diagnostics on the internals page.
- Renamed normalized import-fixture labels that looked like a non-Slate editor
  target to neutral external-editor wording.
- Kept Evidence Kit package identity unchanged because the scope cut is about
  benchmark targets, not the private package name.

Implementation notes:
- Removed adapter scripts, generated adapter JSON, adapter deps, adapter package
  scripts, and stale research data.
- `legacy-slate` remains renamed to `slate` in active output.
- `Plate repo root` legacy compare and browser trace no longer run chunk-off.

Review fixes:
- Fixed `slate-v2-legacy-benchmark.mjs` to accept plain `slate` as the legacy
  library.
- Fixed readiness target count from six/four-editor assumptions to two active
  targets.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Legacy compare first used `.tmp/slate` default path | 1 | Rerun with `REACT_HUGE_COMPARE_LEGACY_REPO=../../../slate` | Passed and registry command updated. |

Verification evidence:
- `/Users/zbeyens/git/plate-2/benchmarks/editor`: `npm install` passed and
  removed 22 out-of-scope packages.
- `/Users/zbeyens/git/plate-2/benchmarks/editor`: `npm run research:editor-frameworks:fetch`
  passed with only `slate-v2-package` and `slate-package`.
- `/Users/zbeyens/git/plate-2/Plate repo root`:
  `REACT_HUGE_COMPARE_LEGACY_REPO=../../../slate bun run bench:react:huge-document:legacy-compare:local`
  passed and wrote chunk-on-only legacy compare output.
- `/Users/zbeyens/git/plate-2/Plate repo root`:
  `SLATE_LEGACY_BROWSER_TRACE_SURFACES=legacyChunkOn bun run bench:react:huge-document:slate-browser-trace:local`
  passed and wrote `surfaces-legacyChunkOn`.
- `/Users/zbeyens/git/plate-2/benchmarks/editor`: `npm run check` passed.
- `/Users/zbeyens/git/plate-2`: scoped `pnpm exec biome check ... --write`
  passed with no fixes.
- Served `http://127.0.0.1:8765/rich-text-data.json` returned 463 rows, 11
  groups, Slate-only libraries, and no forbidden scope terms.
- `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-cut-editor-benchmark-scope-to-slate-only.md`
  is the final mechanical completion gate.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker.
- Confidence line: high; active output, scripts, docs, and package check agree.
- Flow table:
  - Reproduced: stale non-Slate/adapter/chunk-off rows existed in generated data.
  - Verified: regenerated benchmark docs and served JSON show Slate-only output.
- Browser check: direct fetch from the active local server passed; Browser MCP was
  not exposed in this turn.
- Outcome: Slate v2 vs Slate only; Slate baseline is chunk-on.
- Caveat: health still reports stale Slate v2 artifacts and optional missing
  Slate v2 internals; those are not non-Slate scope issues.
- Design:
  - Chosen boundary: Evidence Kit registry/generators plus Slate-owned runner
    scripts.
  - Why not quick patch: hiding columns would leave scripts/results able to
    resurrect old rows.
  - Why not broader change: non-Slate adapters are explicitly out of scope.
- Verified: `npm run check` and served JSON audit passed.

Final handoff / sync:
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: served JSON audit from `http://127.0.0.1:8765/rich-text-data.json`.
- Caveats: Browser MCP unavailable; direct local fetch used.

Timeline:
- 2026-05-28T20:28:58.118Z Goal plan created.
- 2026-05-28T21:03Z Slate-only benchmark artifacts regenerated.
- 2026-05-28T21:12Z Full benchmark package check passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete. |
| Where am I going? | Final response after autogoal checker and goal close. |
| What is the goal? | Slate v2 vs Slate only, with Slate chunk-on as the only legacy baseline. |
| What have I learned? | Old adapters were removed; health now points only to Slate refresh/optional cleanup. |
| What have I done? | Patched registry, scripts, docs, generated output, and verification. |

Open risks:
- None for the scope cut. Remaining health actions are Slate-only refresh and
  optional-artifact decisions.
