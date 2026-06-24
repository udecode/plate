# cut-evidence-primary-nav

Objective:
Cut `evidence.html` from the primary `benchmarks/editor/docs/perf/index.html`
navigation while preserving it as a generated raw audit footer link.

Completion threshold:
- `index.html` primary list has exactly two cards: `rich-text.html` and `plite-internals.html`.
- `evidence.html` remains generated/reachable as a footer audit link.
- Benchmark docs generation/checks pass.
- Served `/index.html` proves the new shape.

Verification surface:
- `benchmarks/editor/benchmarks/render-perf-index.mjs`
- `benchmarks/editor/docs/perf/index.html`
- `cd benchmarks/editor && npm run check`
- HTTP smoke proof against `http://127.0.0.1:8765/index.html`

Constraints:
- Do not delete `evidence.html`.
- Do not change benchmark data or editor rows.
- No PR/commit/branch requested.

Boundaries:
- Source of truth: user accepted the cut-visible-nav recommendation.
- Allowed edit scope: perf docs index generator, generated index, and this plan.
- Browser surface: static docs server at `http://127.0.0.1:8765/`.
- Tracker sync: N/A.
- Non-goals: no benchmark schema, adapter, or runtime changes.

Blocked condition:
- Block only if generation/checks fail after targeted repair or the static server is unavailable. Neither happened.

Task state:
- task_type: generated docs navigation cleanup
- task_complexity: micro
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: ready to close

Current verdict:
- verdict: complete
- confidence: high
- next owner: user
- reason: generated docs and served route proof satisfy the requested cut.

Completion rule:
- Close the active goal only after this plan passes the autogoal completion checker.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Autogoal used for measurable generated docs output. |
| Active goal checked or created | yes | Active goal created for cutting Evidence Kit from primary nav. |
| Source of truth read before edits | yes | Existing generator and generated index inspected. |
| Tracker comments and attachments read | no | N/A: no tracker target. |
| Video transcript evidence required | no | N/A: no video. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: micro generated-docs cleanup. |
| TDD decision before behavior change or bug fix | yes | No TDD; static generator/check proof fits this change. |
| Branch decision for code-changing task | yes | No branch action requested. |
| Release artifact decision | yes | No release artifact; benchmark docs only. |
| Browser tool decision for browser surface | yes | Browser connector not exposed; HTTP served proof used as waiver. |
| PR expectation decision | yes | No PR requested. |
| Tracker sync expectation decision | yes | No tracker sync requested. |

Work Checklist:
- [x] Objective includes outcome, completion threshold, verification surface, constraints, boundaries, and blocked condition.
- [x] Task source classified with source type, id/link, title, task type, acceptance criteria, caveats, likely files/routes/packages, browser surface, and root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized `<video-transcripts>` XML, or marked N/A with reason.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice is recorded with reason.
- [x] Release artifact requirement recorded: N/A, benchmark docs only.
- [x] Final handoff shape decided: concise URL/check summary.
- [x] Branch handling recorded for code-changing work: N/A, no branch requested.
- [x] Local-env-rot retry policy recorded: N/A, no install corruption signal.
- [x] Workspace authority recorded: verification runs in `benchmarks/editor`.
- [x] High-risk note recorded: low risk static docs generator change.
- [x] Review/autoreview target selected: N/A, micro docs generator cleanup.
- [x] Agent-native review decision recorded: N/A, no agent surfaces changed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run docs/package checks and route proof. | `npm run check` passed; served `/index.html` proof passed. |
| Bug reproduced before fix | no | N/A: not a bug fix. | N/A. |
| Targeted behavior verification | yes | Prove only two primary cards and footer audit link remains. | HTTP proof found `primaryCards: 2`, `primaryHasEvidence: false`, `footerHasEvidence: true`. |
| TypeScript or typed config changed | no | N/A. | JS syntax check covered by package check. |
| Package exports or file layout changed | no | N/A. | No barrels. |
| Package manifests, lockfile, or install graph changed | no | N/A. | No manifest change this pass. |
| Agent rules or skills changed | no | N/A. | No sync. |
| Workspace authority proof | yes | Verify in benchmark package/static server. | Commands ran in `/Users/zbeyens/git/plate-2/benchmarks/editor` and route proof hit `127.0.0.1:8765`. |
| Browser surface changed | yes | Route proof or browser proof. | Browser connector unavailable; HTTP route proof passed. |
| Browser final proof | yes | Record exact caveat. | No screenshot/console capture; static served HTML assertion passed. |
| CI-controlled template output changed | no | N/A. | No templates. |
| Package behavior or public API changed | no | N/A. | No changeset. |
| Registry-only component work changed | no | N/A. | No changelog. |
| Docs or content changed | yes | Verify generated docs. | `npm run docs:index`, `npm run docs:index:check`, and `npm run check` passed. |
| High-risk mini gate | no | N/A. | Low-risk static nav cleanup. |
| Agent-native review for agent/tooling changes | no | N/A. | No agent surfaces. |
| Local install corruption suspected | no | N/A. | No reinstall. |
| Autoreview for non-trivial implementation changes | no | N/A. | Micro cleanup. |
| PR create or update | no | N/A. | No PR. |
| PR proof image hosting | no | N/A. | No PR. |
| Tracker sync-back | no | N/A. | No tracker. |
| Final handoff contract | yes | Fill final handoff fields. | Final handoff fields completed below. |
| Final lint | yes | Run scoped formatter/check. | `npx biome check benchmarks/render-perf-index.mjs --fix` passed. |
| Goal plan complete | yes | Run autogoal checker. | To run after this update. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Generator and index inspected. | implementation |
| Implementation | complete | Generator changed to footer-only evidence link. | verification |
| Verification | complete | Formatter, docs index check, full package check, and served route proof passed. | closeout |
| PR / tracker sync | complete | N/A. | final response |
| Closeout | complete | Plan ready for autogoal checker. | final response |

Findings:
- The generated index made Evidence Kit a peer page, which is too noisy for the main benchmark entrypoint.

Decisions and tradeoffs:
- Keep `evidence.html` as a raw audit footer link instead of deleting it.

Implementation notes:
- Changed the generated `index.html` template to render two primary list items and a footer link for Evidence Kit.

Review fixes:
- None.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Browser connector unavailable | 1 | Use HTTP route proof. | Route proof passed. |

Verification evidence:
- `npx biome check benchmarks/render-perf-index.mjs --fix` passed in `benchmarks/editor`.
- `npm run docs:index` passed in `benchmarks/editor`.
- `npm run docs:index:check` passed in `benchmarks/editor`.
- `node --check benchmarks/render-perf-index.mjs` passed in `benchmarks/editor`.
- `npm run check` passed in `benchmarks/editor`.
- Served proof for `http://127.0.0.1:8765/index.html`: status 200, title present, primary cards 2, primary rich-text link true, primary internals link true, primary evidence link false, footer evidence link true.

Final handoff contract:
- PR line: N/A.
- Issue / tracker line: N/A.
- Confidence line: High; generated docs and route proof passed.
- Flow table:
  - Reproduced: N/A.
  - Verified: `npm run check` and served index assertion passed.
- Browser check: Browser connector unavailable; static HTTP assertion used.
- Outcome: `index.html` now has only two primary navigation cards, with Evidence Kit in the footer.
- Caveat: No screenshot or console capture.
- Design:
  - Chosen boundary: generated index template.
  - Why not quick patch: generated HTML would be overwritten.
  - Why not broader change: preserving raw Evidence Kit output is still useful.
- Verified: see verification evidence above.

Final handoff / sync:
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: route-level HTTP proof passed.
- Caveats: static HTML proof only.

Timeline:
- 2026-05-28T15:45Z Created goal and inspected generator/index.
- 2026-05-28T15:46Z Moved Evidence Kit from primary card to footer audit link.
- 2026-05-28T15:47Z Regenerated docs and verified package plus served route.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Final response |
| What is the goal? | Remove Evidence Kit from primary nav while preserving raw audit access. |
| What have I learned? | The generator owns the page, so the template is the right boundary. |
| What have I done? | Changed the generator, regenerated docs, and verified checks/routes. |

Open risks:
- None for the requested cut; browser proof is route-level rather than screenshot-level.
