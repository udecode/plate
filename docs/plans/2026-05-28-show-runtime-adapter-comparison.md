# Show runtime adapter comparison

Objective:
Make the rich-text benchmark dashboard show Lexical and ProseMirror runtime
adapter rows as one side-by-side comparison table instead of two isolated
single-library sections.

Goal plan:
docs/plans/2026-05-28-show-runtime-adapter-comparison.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- autogoal
- task

Task source:
- type: user browser feedback
- id / link: current in-app browser at `http://127.0.0.1:8765/rich-text.html`
- title: Lexical benchmark value is unclear because no comparison is visible
- acceptance criteria: `rich-text-data.json` contains a
  `runtime-adapter-compare` group with both `prosemirror:runtime` and
  `lexical:runtime` columns for the seven shared runtime fixtures

Completion threshold:
- Runtime adapter rows from `lexical-runtime-adapter` and
  `prosemirror-runtime-adapter` render under a single
  `runtime-adapter-compare` group.
- The generated data has `7` rows in that group and both runtime libraries.
- `npm run docs:perf:check` passes.
- Served `rich-text-data.json` exposes `runtime-adapter-compare`.
- `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-show-runtime-adapter-comparison.md`
  passes.

Verification surface:
- `/Users/zbeyens/git/plate-2/benchmarks/editor`
- `benchmarks/editor/benchmarks/render-rich-text-viewer.mjs`
- `benchmarks/editor/docs/perf/rich-text-data.json`
- `npm run docs:perf:check`
- static served data at `http://127.0.0.1:8765/rich-text-data.json`

Constraints:
- Keep raw Evidence Kit result rows unchanged.
- Fix the dashboard grouping layer, not the benchmark producers.
- Preserve existing Plite internals split.
- Do not create PRs, comments, commits, or pushes.

Boundaries:
- Source of truth: generated `benchmarks/results/rich-text-editors-latest.json`
  plus dashboard renderer.
- Allowed edit scope: rich-text viewer renderer, generated perf docs/data, this
  goal plan.
- Browser surface: static docs served from `http://127.0.0.1:8765`.
- Tracker sync: N/A, no tracker item.
- Non-goals: adding new benchmark rows, changing measurements, or making Plite
  rows directly comparable to Lexical/ProseMirror.

Blocked condition:
- Work would stop only if the generated rows did not share fixture names. They
  do share names, so the renderer can group them.

Task state:
- task_type: visualization fix
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active until final `update_goal` call

Current verdict:
- verdict: accepted
- confidence: high
- next owner: user
- reason: dashboard data now exposes the missing side-by-side runtime table

Completion rule:
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and the autogoal
  `check-complete` command passes.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | user feedback mapped to renderer grouping bug |
| Active goal checked or created | yes | active goal created for visible runtime adapter comparison |
| Source of truth read before edits | yes | generated data showed separate `lexical-runtime-adapter` and `prosemirror-runtime-adapter` groups |
| Tracker comments and attachments read | no | N/A: no tracker item |
| Video transcript evidence required | no | N/A: no video |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: narrow generated dashboard fix |
| TDD decision before behavior change or bug fix | yes | no new test file; generated data assertion and docs check cover this renderer path |
| Branch decision for code-changing task | yes | no branch/PR requested |
| Release artifact decision | yes | N/A: benchmark docs package only |
| Browser tool decision for browser surface | yes | Browser plugin tool not exposed; verified served JSON and generated docs |
| PR expectation decision | yes | no PR requested |
| Tracker sync expectation decided | yes | N/A: no tracker |

Work Checklist:
- [x] Objective includes outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized
      `<video-transcripts>` XML, or marked N/A with reason.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [x] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason.
- [x] Final handoff shape decided: explain value, fix, proof, and caveat.
- [x] Branch handling recorded for code-changing work: no branch/PR requested.
- [x] Local-env-rot retry policy recorded: N/A, no surprising repo-wide failure.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded: N/A, generated dashboard grouping only.
- [x] Review/autoreview target selected from actual diff state: N/A, scoped
      renderer fix with generated proof.
- [x] Agent-native review decision recorded: N/A, no agent/tooling surfaces.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Prove shared runtime group exists | data assertion recorded below |
| Bug reproduced before fix | yes | Show separate single-library groups | pre-fix data had separate `lexical-runtime-adapter` and `prosemirror-runtime-adapter` groups |
| Targeted behavior verification | yes | Run generated data assertion | `runtime-adapter-compare` has 7 rows and both runtime libraries |
| TypeScript or typed config changed | no | N/A | JS renderer only |
| Package exports or file layout changed | no | N/A | no exports/layout change |
| Package manifests, lockfile, or install graph changed | no | N/A | no package metadata change in this slice |
| Agent rules or skills changed | no | N/A | no agent surfaces |
| Workspace authority proof | yes | Run verification in owning package | commands run from `/Users/zbeyens/git/plate-2/benchmarks/editor` |
| Browser surface changed | yes | Verify served data or browser proof caveat | served `rich-text-data.json` returns `200` and includes `runtime-adapter-compare`; Browser plugin unavailable |
| Browser final proof | yes | Record caveat | static HTML shell fetches JSON, so string exists in data file, not HTML source |
| CI-controlled template output changed | no | N/A | no templates |
| Package behavior or public API changed | no | N/A | no published package/API |
| Registry-only component work changed | no | N/A | no registry component |
| Docs or content changed | yes | Verify generated docs | `npm run docs:perf:check` passed |
| High-risk mini gate | no | N/A | no public API/runtime behavior change |
| Agent-native review for agent/tooling changes | no | N/A | no agent/tooling change |
| Local install corruption suspected | no | N/A | no env-rot signal |
| Autoreview for non-trivial implementation changes | no | N/A | narrow renderer grouping fix |
| PR create or update | no | N/A | no PR requested |
| PR proof image hosting | no | N/A | no PR |
| Tracker sync-back | no | N/A | no tracker |
| Final handoff contract | yes | Fill final handoff fields | see below |
| Final lint | yes | Run scoped equivalent | `pnpm exec biome check ... --fix` passed |
| Goal plan complete | yes | Run `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-show-runtime-adapter-comparison.md` | recorded below |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | renderer and generated data inspected | implementation |
| Implementation | complete | runtime adapter categories remapped to one comparison group | verification |
| Verification | complete | docs check, data assertion, served JSON smoke | closeout |
| PR / tracker sync | complete | N/A, no PR/tracker requested | final response |
| Closeout | complete | goal plan completed | final response |

Findings:
- Lexical rows existed, but the renderer grouped by source category. Because
  Lexical and ProseMirror used different categories, the dashboard showed two
  single-library sections instead of a comparison.
- The shared fixture names already existed, so the right fix was to normalize
  those adapter categories in the viewer data model.

Decisions and tradeoffs:
- Chosen: map `lexical-runtime-adapter` and `prosemirror-runtime-adapter` to
  `runtime-adapter-compare` in `render-rich-text-viewer.mjs`.
- Rejected: changing raw benchmark result categories, because Evidence Kit
  artifact identity should stay target-owned.
- Deferred: direct Plite vs Lexical/ProseMirror normalized runtime comparison.
  That needs a Plite adapter or normalized fixtures, not a display-only trick.

Implementation notes:
- Added `runtimeAdapterCategories`.
- `formatRow` now rewrites those categories only for viewer grouping.
- Library sort order now ranks `prosemirror:runtime` and `lexical:runtime`.

Review fixes:
- Corrected static smoke expectation: the HTML shell does not contain fetched
  data strings; the served JSON does.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Checked `rich-text.html` source for fetched data string | 1 | Verify generated and served `rich-text-data.json` | fixed verification claim |

Verification evidence:
- `npm run docs:rich-text` from `/Users/zbeyens/git/plate-2/benchmarks/editor`: success.
- Data assertion from `/Users/zbeyens/git/plate-2`: `runtime-adapter-compare` has `7` rows with `prosemirror:runtime` and `lexical:runtime`.
- `npm run docs:perf:check` from `/Users/zbeyens/git/plate-2/benchmarks/editor`: success.
- `pnpm exec biome check benchmarks/editor/benchmarks/render-rich-text-viewer.mjs docs/plans/2026-05-28-show-runtime-adapter-comparison.md --fix` from `/Users/zbeyens/git/plate-2`: success.
- `node --check benchmarks/render-rich-text-viewer.mjs` from `/Users/zbeyens/git/plate-2/benchmarks/editor`: success.
- Served data smoke from `/Users/zbeyens/git/plate-2`: `http://127.0.0.1:8765/rich-text-data.json` returned `200` and includes `runtime-adapter-compare`.
- `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-show-runtime-adapter-comparison.md` from `/Users/zbeyens/git/plate-2`: success.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker.
- Confidence line: high.
- Flow table:
  - Reproduced: generated viewer data had separate single-library runtime
    adapter groups.
  - Verified: generated viewer data now has one shared runtime adapter group.
- Browser check: served data is updated; reload `rich-text.html` to fetch it.
- Outcome: visible Lexical vs ProseMirror runtime comparison table.
- Caveat: this is Lexical vs ProseMirror headless runtime comparison, not a
  direct Plite-vs-Lexical runtime comparison.
- Design:
  - Chosen boundary: viewer data normalization.
  - Why not quick patch: raw artifact names are still useful; display grouping
    is the broken layer.
  - Why not broader change: direct Plite normalization is a separate benchmark
    design problem.
- Verified: docs check, data assertion, syntax check, served JSON smoke,
  autogoal check.

Final handoff / sync:
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: served JSON proof; Browser plugin unavailable in tool search.
- Caveats: reload the page to refetch `rich-text-data.json`.

Timeline:
- 2026-05-28T20:17:35Z Task goal plan created.
- 2026-05-28T20:18:00Z Runtime adapter categories grouped in viewer data.
- 2026-05-28T20:19:00Z Docs and served data verified.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Final response |
| What is the goal? | Show Lexical/ProseMirror runtime adapter comparison visibly |
| What have I learned? | The benchmark rows existed; the dashboard grouping hid the comparison |
| What have I done? | Added shared runtime-adapter comparison group and regenerated docs/data |

Open risks:
- Direct Plite vs Lexical/ProseMirror runtime comparison still needs normalized
  Plite-side fixtures or a Plite adapter.
