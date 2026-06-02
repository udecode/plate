# rename DOM coverage copy policy

Objective:
Rename Slate v2 DOM coverage copy policy values from `include-model` and
`summary-only` to `model` and `summary` across public API, examples, docs,
tests, and changesets.

Goal plan:
docs/plans/2026-05-31-rename-dom-coverage-copy-policy.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- docs
- package-api
- browser

Task source:
- type: user request
- title: rename copy policy values
- acceptance criteria: no current source/test/docs references to old copy
  policy values; focused package and browser checks pass; changesets document
  the public API rename.

Completion threshold:
- `DOMCoverageCopyPolicy` exposes `model`, `summary`, `exclude`, and
  `materialize`.
- Defaults and examples use `model`.
- Docs explain all four copy policies as current-state API.
- Focused package tests, hidden-content browser rows, and `bun check` pass in
  `/Users/zbeyens/git/plate-2/.tmp/slate-v2`.

Verification surface:
- `bun test ./packages/slate-dom/test/dom-coverage.ts ./packages/slate-dom/test/clipboard-boundary.ts`
- `cd packages/slate-react && bun test:vitest -- keyboard-input-strategy-contract selection-reconciler-contract dom-coverage-native-bridge-contract dom-strategy-and-scroll dom-coverage-boundary-contract`
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/hidden-content-blocks.test.ts playwright/integration/examples/query-controls.test.ts --project=chromium --grep "hidden content|query controls"`
- `bun check`
- `rg -n "include-model|summary-only" --glob '!site/out/**' --glob '!node_modules/**' .`

Constraints:
- Keep the rename hard-cut: no compatibility aliases.
- Do not create PRs, commits, or pushes.
- Do not broaden into unrelated DOM coverage behavior.

Boundaries:
- Source of truth: `.tmp/slate-v2` Slate v2 package and example sources.
- Allowed edit scope: DOM coverage copy policy source, tests, examples, docs,
  and changesets.
- Browser surface: `/examples/hidden-content-blocks`.
- Tracker sync: N/A, no tracker item.
- Non-goals: hidden-content selection, find, and virtualization behavior.

Blocked condition:
- Block only if the focused tests or `bun check` expose a real failure outside
  this rename that cannot be isolated without user direction.

Task state:
- task_type: public API rename
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: complete-ready

Current verdict:
- verdict: complete
- confidence: high
- next owner: user
- reason: source, docs, changesets, focused tests, browser rows, and `bun check`
  all agree on the new names.

Completion rule:
- Complete the goal only after this file passes the autogoal completion check.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | `autogoal`, `task`, and `changeset` loaded. |
| Active goal checked or created | yes | Active goal created for this rename. |
| Source of truth read before edits | yes | `rg` located copy policy API, runtime, examples, docs, and tests. |
| Tracker comments and attachments read | no | N/A: user chat request only. |
| Video transcript evidence required | no | N/A: no video evidence for this rename. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: narrow API rename, local source search was sufficient. |
| TDD decision before behavior change or bug fix | yes | Rename is API contract work; existing focused tests cover behavior. |
| Branch decision for code-changing task | yes | N/A: no branch work requested. |
| Release artifact decision | yes | Changesets updated for `slate-dom` and `slate-react`. |
| Browser tool decision for browser surface | yes | Automated Playwright proof covers the route/control behavior. |
| PR expectation decision | yes | N/A: no PR requested. |
| Tracker sync expectation decision | yes | N/A: no tracker. |
| Docs pack selected | yes | Docs pack applied; `docs/libraries/slate-react/editable.md` updated. |
| `docs-creator` loaded | no | N/A: small API reference table, not docs-dominant work. |
| Docs lane selected | yes | Supporting docs lane. |
| Target docs and nearest sibling docs read | yes | `docs/libraries/slate-react/editable.md` DOM Coverage Boundaries section read. |
| Docs style doctrine read | yes | Repo instruction: docs describe latest state only. |
| Documented source owner identified | yes | Source owner is DOM coverage boundary/copy runtime. |
| Package/API pack selected | yes | Public string literal union changed. |
| Public surface or package boundary identified | yes | `DOMCoverageCopyPolicy` and `copyPolicy` props. |
| Release artifact path selected | yes | `.changeset` files updated. |
| `changeset` skill loaded when `.changeset` is required | yes | `changeset` skill read. |
| Barrel/export impact decision recorded | yes | N/A: no exports or file layout changed. |
| Browser pack selected | yes | Hidden-content example controls touched. |
| Browser route / app surface identified | yes | `/examples/hidden-content-blocks`. |
| Browser tool decision recorded | yes | Playwright route proof used for deterministic coverage. |
| Console/network caveat policy recorded | yes | N/A: no manual browser console/network audit for string literal rename. |

Work Checklist:
- [x] Objective includes outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition.
- [x] Task source classified with source type, title, task type, acceptance
      criteria, caveats, likely files/routes/packages, browser surface, and
      root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized
      XML, or marked N/A with reason.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [x] Release artifact requirement recorded: changesets updated.
- [x] Final handoff shape decided: concise source/test summary.
- [x] Branch handling recorded: N/A, no branch requested.
- [x] Local-env-rot retry policy recorded: N/A, no env-rot failure shape.
- [x] Workspace authority recorded: verification commands ran in `.tmp/slate-v2`
      or its owning package.
- [x] High-risk note recorded: public API rename is hard-cut; tests and
      changesets prove callers see only the new names.
- [x] Review/autoreview target selected or marked N/A: N/A, narrow mechanical
      rename with green focused and full fast checks.
- [x] Agent-native review decision recorded: N/A, no agent/tooling behavior
      changed.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner
      recorded.
- [x] Docs pack: every named API, option, route, and demo claim is source-backed.
- [x] Docs pack: docs use current-state reference voice.
- [x] Docs pack: links, anchors, and previews are N/A for this table-only docs
      change.
- [x] Package/API pack: public API, package boundary, export, and
      release-artifact impact recorded.
- [x] Package/API pack: release artifact matrix applied via `.changeset`.
- [x] Package/API pack: `.changeset` work loaded `changeset`.
- [x] Package/API pack: registry-only work is N/A.
- [x] Package/API pack: no-artifact decisions are N/A because package users see
      a public API delta.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is
      explicit.
- [x] Package/API pack: package-owned typecheck/test proof recorded.
- [x] Package/API pack: generated barrels or release notes are N/A.
- [x] Browser pack: route, interaction path, and expected visible outcome
      recorded.
- [x] Browser pack: browser proof uses Playwright route rows; manual browser
      proof waived because this is a string-literal/API rename.
- [x] Browser pack: console and network errors are out of scope for this rename.
- [x] Browser pack: exact verification caveat is ready for final handoff.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named commands | Focused tests, Playwright rows, stale-string audit, and `bun check` passed. |
| Bug reproduced before fix | no | N/A | This is an API rename, not a bug repro. |
| Targeted behavior verification | yes | Run focused tests | 44 `slate-dom` tests, 94 focused `slate-react` tests, and 17 Playwright rows passed. |
| TypeScript or typed config changed | yes | Run typecheck | `bun check` typecheck phase passed. |
| Package exports or file layout changed | no | N/A | No exports or file layout changed. |
| Package manifests, lockfile, or install graph changed | no | N/A | No manifest or lockfile changed. |
| Agent rules or skills changed | no | N/A | No agent rules or skills changed. |
| Workspace authority proof | yes | Run checks in owning checkout | All commands ran in `.tmp/slate-v2` or `.tmp/slate-v2/packages/slate-react`. |
| Browser surface changed | yes | Run route proof or waiver | Playwright hidden-content/query-controls rows passed. |
| Browser final proof | yes | Record exact route proof | `http://localhost:3100/examples/hidden-content-blocks?selection=model&copy=model` returned 200; Playwright passed. |
| CI-controlled template output changed | no | N/A | No templates changed. |
| Package behavior or public API changed | yes | Add changesets | `slate-dom` and `slate-react` changesets updated. |
| Registry-only component work changed | no | N/A | No registry-only component work. |
| Docs or content changed | yes | Verify docs claims | `editable.md` copy policy table matches source union. |
| High-risk mini gate | yes | Record failure mode and proof | Failure mode: stale literal breaks consumers; stale audit and typecheck passed. |
| Agent-native review for agent/tooling changes | no | N/A | No `.agents`, `.claude`, `.codex`, skill, hook, command, prompt, or tooling change. |
| Local install corruption suspected | no | N/A | No install-corruption failure shape. |
| Autoreview for non-trivial implementation changes | no | N/A | Narrow mechanical API rename with green focused and fast full checks. |
| PR create or update | no | N/A | No PR requested. |
| PR proof image hosting | no | N/A | No PR body. |
| Tracker sync-back | no | N/A | No tracker. |
| Final handoff contract | yes | Fill final evidence | Final response will include changed surface and verification. |
| Final lint | yes | Run lint or scoped equivalent | `bun check` lint phase passed. |
| Goal plan complete | yes | Run autogoal check | Final check run before goal closure. |
| Docs source-backed claim audit | yes | Source audit | `DOMCoverageCopyPolicy` source matches docs table. |
| Docs links / routes / previews | no | N/A | No links, routes, or previews added to docs. |
| Docs MDX/content parser | no | N/A | Markdown-only package docs; `bun check` covered formatting/type/test gates. |
| Plugin page specifics | no | N/A | Not a plugin docs page. |
| Public API / package boundary proof | yes | Source audit and checks | Union/default/runtime checks use `model` and `summary`. |
| Release artifact classification | yes | Record classification | Published package API rename. |
| Published package changeset | yes | Update one per package | Existing `slate-dom` and `slate-react` major changesets updated. |
| Registry changelog | no | N/A | Not registry-only. |
| No release artifact | no | N/A | Public package delta exists. |
| Package typecheck/build/test | yes | Run owning checks | Focused tests and `bun check` passed. |
| Barrel/export generation | no | N/A | No exported file layout changed. |
| Browser interaction proof | yes | Exercise route/control path | Playwright hidden-content/query-controls rows passed. |
| Browser console/network check | no | N/A | No manual browser proof; automated test route covered behavior. |
| Browser final proof artifact | yes | Record exact caveat | Route 200 plus Playwright pass recorded. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Skills read; API/docs/test surface found with `rg`. | implementation |
| Implementation | complete | Policy literals renamed and docs/changesets updated. | verification |
| Verification | complete | Focused tests, Playwright rows, stale audit, and `bun check` passed. | closeout |
| PR / tracker sync | complete | N/A: no PR or tracker requested. | final response |
| Closeout | complete | Plan completed and ready for autogoal check. | final response |

Findings:
- `copyPolicy` is a public DOM coverage contract owned by `slate-dom` and
  surfaced through `slate-react`.
- The clean names are `model`, `summary`, `exclude`, and `materialize`.

Decisions and tradeoffs:
- Hard-cut the old names instead of aliasing them.
- Keep Copy controls in the example because they exercise real clipboard
  behavior and remain useful coverage.

Implementation notes:
- Updated package source, React defaults, dom strategy helpers, pagination and
  hidden-content examples, unit tests, Playwright-facing URL controls, docs, and
  changesets.

Review fixes:
- Fixed one formatting issue caught by `bun check`.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `bun check` formatting failure in hidden-content example | 1 | Apply formatter-required line wrap | Fixed and reran `bun check` successfully. |

Verification evidence:
- `bun test ./packages/slate-dom/test/dom-coverage.ts ./packages/slate-dom/test/clipboard-boundary.ts`: 44 passed.
- `cd packages/slate-react && bun test:vitest -- keyboard-input-strategy-contract selection-reconciler-contract dom-coverage-native-bridge-contract dom-strategy-and-scroll dom-coverage-boundary-contract`: 5 files, 94 tests passed.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/hidden-content-blocks.test.ts playwright/integration/examples/query-controls.test.ts --project=chromium --grep "hidden content|query controls"`: 17 passed.
- `curl http://localhost:3100/examples/hidden-content-blocks?selection=model&copy=model`: 200.
- `bun check`: passed.
- `rg -n "include-model|summary-only" --glob '!site/out/**' --glob '!node_modules/**' .`: no matches.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker.
- Confidence line: high.
- Flow table:
  - Reproduced: N/A, API rename.
  - Verified: focused tests, route proof, stale audit, and `bun check`.
- Browser check: Playwright route rows passed against localhost 3100.
- Outcome: copy policy public names are `model`, `summary`, `exclude`, and
  `materialize`.
- Caveat: no manual in-app Browser pass; automated Playwright proof covered the
  route/control behavior.
- Design:
  - Chosen boundary: rename at public `DOMCoverageCopyPolicy` and React props.
  - Why not quick patch: labels alone would leave stale public API literals.
  - Why not broader change: find and selection policies were already cut.
- Verified: all named gates passed.

Final handoff / sync:
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: localhost route 200 plus Playwright pass.
- Caveats: none beyond no manual browser screenshot.

Timeline:
- 2026-05-31T06:42:27.664Z Task goal plan created.
- 2026-05-31T06:44Z Copy policy rename implemented.
- 2026-05-31T06:46Z Verification gates passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete. |
| Where am I going? | Final response after autogoal check. |
| What is the goal? | Rename DOM coverage copy policy values to `model` and `summary`. |
| What have I learned? | The public copy policy surface is centralized enough for a hard cut. |
| What have I done? | Updated source, examples, docs, tests, changesets, and verification. |

Open risks:
- None.
