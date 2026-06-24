# plite terminology migration

Objective:
Rename fork terminology to Plite; done when docs/content are Plite-first and stale Plite-v2/Plate-Plite refs are audited.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-06-23-plite-terminology-migration.md

Template:
docs/plans/templates/major-task.md

Primary template:
docs/plans/templates/major-task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)
- package-api (docs/plans/templates/packs/package-api.md)

Major source:
- type: user request
- id / link: latest chat instruction
- title: Rename fork terminology to Plite
- decision to make: execute a staged terminology migration without confusing Plite with upstream Slate
- decision criteria: public docs/content are Plite-first; stale `Plite`, `Plite`, `plite`, and non-upstream `slate` wording is removed or ledgered; package/API/code renames happen only when the repo actually provides matching package names, imports, routes, and checks

Major lane:
- lane: docs/content terminology migration, followed by package/API/code rename packets
- output type: implementation plus audit ledger
- implementation expected: yes
- affected packages / surfaces: `content/**`, `docs/plite/**`, `docs/plite-draft/**`, docs navigation/source config, `apps/www` docs/example routes, package names/imports/routes when promoted from docs-only rename to breaking code rename
- dominant risk: global replacement that either erases intentional upstream Slate references or documents Plite package names before the code actually ships them

First checkpoint:
- User requirement: rename fork terminology to `Plite`, a lite version of Plate.
- User requirement: remove confusing fork terminology including `Plite`, `Plite`, stale lowercase `slate` wording, and similar docs/product copy when it refers to this fork.
- User requirement: keep `Plite` only when intentionally referring to upstream Slate or an explicitly ledgered still-existing code/package surface that has not yet been renamed.
- User requirement: start with public content and docs, including `docs/plite` renamed to `docs/plite` where that directory is still an active source.
- User requirement: run under `autogoal` until stale refs are no longer found by audit, except intentional allowlisted upstream Slate references.
- User requirement: perform breaking code/package rename work after the docs/content pass, not before the public terminology direction is clear.
- Scope: public docs/content first, then route/nav/source config, then package/API/code rename packets with package-owned proof.
- Non-goal: no commit, push, release, PR, or npm publication unless separately requested.
- Non-goal: no blind historical rewrite of generated artifacts, old issue ledgers, archived research, `node_modules`, build output, or transplant evidence unless it affects public docs/content or active source.
- Stop condition: stop only for a real blocker, a package-name decision that cannot be inferred from source and would make docs lie, or a user interruption.
- Final handoff must include changed files, stale-term audit result, intentional remaining `Plite` allowlist, commands run, package/API/code work completed or remaining, and risks needing user review.

Timed checkpoint:
- requested duration: none
- semantics: N/A: user asked for until-clean audit, not a timed checkpoint
- initial confidence score: N/A: completion is a binary source audit plus checks
- improvement loop: continue staged audit/rename/proof until no stale unallowlisted matches remain in selected surfaces
- final score / loop closure: record final stale-match counts and allowlist

Completion threshold:
- `content/**`, active docs source/config, and owned active docs folders are Plite-first.
- `docs/plite/**` and active fork docs are renamed or replaced with `docs/plite/**` where they are still source-owned docs rather than archival proof.
- Search audits over active docs/content/routes/package docs find no unallowlisted `Plite`, `plite`, `Plite`, `/docs/plite`, `content/docs/plite`, or fork-owned lowercase `slate` terminology.
- Remaining `Plite` matches are intentional and recorded: upstream Slate references, external repo names, legacy package names not yet renamed, generated/archival artifacts, or code surfaces deferred to the package rename packet.
- Breaking code/package rename packet is either completed with package checks or explicitly left open with exact next owner and stale-match ledger.
- Major-task closure is legal only when the decision criteria are satisfied or
  explicitly narrowed, facts/inference/recommendation are separated, required
  review or pressure passes are recorded, implementation gates are closed when
  code changed, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-23-plite-terminology-migration.md`
  passes.

Verification surface:
- Source audit: constrained `rg` counts and file lists for stale terminology across active docs/content/routes/package sources, excluding generated/build/vendor/archive paths.
- Docs parser: `pnpm --filter www build:source` after MDX/content/nav changes.
- Docs route proof: local docs route check for the renamed Plite docs route if docs routing changes.
- Package/API proof: package-owned typecheck/test/build only for code/package/import renames actually performed in this goal.

Constraints:
- Start from repo evidence before external claims.
- Keep helper stack proportional.
- Separate measured evidence, source evidence, inference, and recommendation.
- Execute implementation in staged packets because the user explicitly requested rename work.
- Do not document package/import names that do not exist yet.
- Preserve intentional upstream Slate references; do not pretend upstream Slate disappeared.
- Keep docs in current-state voice; no changelog-style explanation unless a migration/release page explicitly compares concepts.

Boundaries:
- Source of truth: current checkout plus this plan; public docs source under `content/**`; active docs artifacts under `docs/**`; package metadata/imports when code rename begins.
- Allowed edit scope: `content/**`, active docs config/nav/source files, `docs/plite*` to `docs/plite*`, route labels/links in `apps/www`, package/API/code surfaces only after docs/content audit establishes the rename map.
- External sources: N/A unless needed to distinguish upstream Slate references; this is repo terminology work.
- Browser surface: affected docs route under the local docs app after route/nav changes.
- Tracker sync: N/A, no external issue/PR mutation requested.
- Non-goals: commit/push/release/PR; generated build artifacts; vendored deps; broad deletion of historical research/proof artifacts without a public-doc owner.

Output budget strategy:
- Use `rg --count`, `rg --files-with-matches`, `find`, and short `sed` slices before printing match lines.
- Exclude `node_modules`, `.next`, `.turbo`, `dist`, `coverage`, `test-results`, generated `.agents/skills/**`, and archival/proof folders unless they are the active owner for a stale public claim.
- Save large audit outputs under `docs/plans/artifacts/plite-terminology-migration/` instead of streaming them.

Blocked condition:
- A package/API rename requires a public package naming decision that current source cannot infer without making docs lie, or package rename checks fail in a way that needs a broader architecture decision beyond terminology.

Major state:
- task_type: major
- task_complexity: major
- current_phase: intake
- current_phase_status: in_progress
- next_phase: research / analysis
- goal_status: active

Current verdict:
- verdict: execute staged rename
- confidence: medium before audit
- next owner: autogoal + docs-creator, then package/API packet when docs are Plite-first
- reason: user explicitly chose Plite and wants stale Plite terminology removed except intentional upstream references

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-23-plite-terminology-migration.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | First checkpoint lists rename scope, allowlist rule, docs-first order, code-afterward order, non-goals, stop conditions, verification, and handoff |
| Timed checkpoint parsed | no | N/A: no duration requested |
| `major-task` loaded | no | N/A: autogoal instructions were provided inline; goal uses major-task template but not the worker skill |
| Active goal checked or created | yes | `get_goal` returned no active goal, then `create_goal` created this objective |
| Source of truth read before analysis | yes | Read current plan and top-level active docs/source directories with `find content docs apps/www -maxdepth 4 ...` |
| Major lane selected | yes | Docs/content terminology migration followed by package/API/code rename packets |
| Decision criteria stated | yes | Completion threshold defines Plite-first docs/content and stale-term audit |
| Existing repo patterns / prior decisions checked | partial | Need current content/nav/package audit before broad edits |
| Helper stack selected | yes | `autogoal` plus `docs-creator`; package/API checks when code rename starts |
| External research decision recorded | no | N/A: repo-local naming decision, no external authority needed |
| Implementation expectation recorded | yes | Implementation expected in staged packets |
| Workspace authority selected | yes | `/Users/zbeyens/git/plate-2` current checkout |
| Branch / PR expectation decided | no | N/A: no PR/commit/push requested |
| Output budget strategy recorded | yes | Use counted/scoped `rg`, exclude generated/vendor/archive by default, artifact large outputs |
| Docs pack selected | yes | Applied pack: docs |
| `docs-creator` loaded | yes | Read `.agents/skills/docs-creator/SKILL.md` |
| Docs lane selected | yes | Guide/system docs plus nav/routing terminology migration |
| Target docs and nearest sibling docs read | partial | Need target docs read after stale-term file list |
| Docs style doctrine read | yes | Read docs-creator voice, navigation, anti-slop, verification rules |
| Documented source owner identified | partial | Public docs source likely `content/docs/plite`; exact nav/source owner pending audit |
| Package/API pack selected | yes | Applied pack: package-api because breaking code/package rename follows docs |
| Public surface or package boundary identified | partial | Existing package names/imports pending audit |
| Release artifact path selected | yes | Changeset metadata audited; Plite package rename is branch-prepublic, @platejs/yjs got a major changeset |
| `changeset` skill loaded when `.changeset` is required | no | N/A until package rename creates published user-visible delta |
| Barrel/export impact decision recorded | no | N/A: touched Plite packages do not require brl for this rename packet; package tests/typecheck passed |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: no duration requested.
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
      the question, or N/A reason is recorded. N/A: repo-local terminology work.
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
- [x] Stale terminology audit artifact exists with active-source counts and an intentional remaining-reference allowlist.
- [x] Public docs/content route rename packet is complete: `content/docs/plite` becomes Plite-owned docs or is replaced by `content/docs/plite`, and active links/nav labels point to Plite.
- [x] `docs/plite` active docs are renamed or moved to `docs/plite`, while archival proof/research is either renamed only if active or ledgered as intentional history.
- [x] Breaking package/API/code rename packet is completed or deferred with exact remaining `Plite` package/import symbols and owner checks.
- [x] Accepted/actionable review findings are fixed or explicitly rejected with
      evidence.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, anchors, and previews target real leaf pages or are marked N/A with reason.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run stale audit, docs source, Plite package gates, and browser proof | strict active stale audit returned no matches; docs source, Plite typecheck, Plite package tests, focused browser row, and full Chromium browser proof recorded below |
| Current-state source audit | yes | Map current owner, boundaries, constraints, and affected surfaces | active owners mapped to content/docs/plite, docs/plite, apps/plite, Plite packages, browser proof, Yjs, changesets, and release metadata |
| Decision criteria closure | yes | Mark criteria satisfied or narrowed with evidence | Plite-first docs/package/app terminology complete; remaining Slate refs are upstream/provenance and recorded in allowlist |
| Options / tradeoffs / rejection record | yes | Record chosen recommendation and rejected alternatives | chose targeted rewrite plus allowlist; rejected blind global replacement because it would corrupt upstream issue URLs, Tailwind color names, and historical evidence |
| Review / pressure pass | yes | Run source audit and browser proof pressure | active stale audit, package contracts, docs parser, typecheck/test, and browser proof all executed |
| Review findings closure | yes | Fix accepted/actionable findings | stale route, docs, package contracts, Yjs metadata, browser fixture, changeset, and release metadata findings fixed |
| External-source audit | no | Record N/A | N/A: repo-local terminology migration; external Slate URLs preserved only as provenance |
| Implementation gates | yes | Close touched-surface gates | docs, package/API, browser, Yjs, and changeset gates closed with proof below |
| Final handoff contract | yes | Record evidence, caveats, residual risk, next owner | final response will include changed groups, commands, flaky row, lint debt, and review needs |
| Final lint | partial | Run lint or record blocker | `pnpm lint:fix` applied safe fixes but failed on 1,638 existing diagnostics in Plite examples/tests; scoped gates are green |
| Output budget discipline | partial | Verify broad outputs were capped/artifacted | broad stale audit stored under docs/plans/artifacts; one `git diff --name-only` was too broad and truncated, then abandoned for grouped handoff |
| Timed checkpoint | no | Record N/A | N/A: no duration requested |
| Goal plan complete | yes | Run check-complete | pending final check after this update |
| Docs source-backed claim audit | yes | Verify docs claims against current source | docs/source route and proof map updated to current Plite files; `pnpm --filter www build:source` green |
| Docs links / routes / previews | yes | Verify renamed routes | focused browser proof built /examples/plite and comment-mode row passed |
| Docs MDX/content parser | yes | Run docs parser | `pnpm --filter www build:source` green after final edits |
| Plugin page specifics | no | Record N/A | N/A: no Plate plugin docs were edited |
| Public API / package boundary proof | yes | Source-audit public API, exports, package boundary | Plite package contracts and import smoke included in `pnpm plite:test`; strict stale audit clean |
| Release artifact classification | yes | Classify changeset need | Plite packages absent on origin/main, so rename-only changesets would be branch-history noise; @platejs/yjs exists and got a major changeset for Plite metadata keys |
| Published package changeset | yes | Add/update changesets | updated browser changeset wording, renamed prepare-v54 beta changeset to @platejs/plite, added @platejs/yjs major changeset |
| Registry changelog | no | Record N/A | N/A: no registry-only package changelog lane |
| No release artifact | partial | Record reason | no new Plite-package changesets because packages are absent on origin/main; @platejs/yjs change has an artifact |
| Package typecheck/build/test | yes | Run owning package checks | `pnpm plite:typecheck` and `pnpm plite:test` green after lint formatting |
| Barrel/export generation | no | Record N/A | N/A: no barrel generator required by Plite packages in this rename packet |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | done | plan captured explicit requirements and boundaries | complete |
| Current-state map | done | active docs/package/app/proof surfaces mapped by rg and source reads | complete |
| Options and recommendation | done | targeted rename plus allowlist chosen; blind rewrite rejected | complete |
| Review / pressure pass | done | strict stale audit, package gates, docs parser, browser proof | complete |
| Implementation or plan artifact | done | Plite rename applied across active docs, packages, app, proof, Yjs, changesets | complete |
| Verification | done | commands recorded below; broad lint debt recorded | complete |
| Closeout | done | final handoff pending after check-complete | complete |

Findings:
- Strict active stale audit has no disallowed matches after excluding intentional upstream/provenance/historical evidence.
- Full Chromium browser proof passed with one unrelated flaky pagination stress row that passed on retry.
- `pnpm lint:fix` is not a usable completion gate yet for Plite examples/tests: it fixed 50 files but still reports 1,638 existing diagnostics.

Decisions and tradeoffs:
- Chose Plite as public fork/product terminology across active docs, app routes, package names, API type names, tests, and release metadata.
- Preserved upstream Slate references only when they identify upstream comparison, issue/PR provenance, prior-art repositories, or negative tests rejecting upstream package metadata.
- Rejected blind historical rewrites of changelogs, issue dossiers, and research artifacts because that would falsify provenance.
- Added a @platejs/yjs major changeset for Plite-owned serialized metadata keys; did not add per-package Plite rename changesets for packages absent on origin/main.

Implementation notes:
- Renamed active Slate-owned docs/app/package surfaces to Plite: content docs, docs/plite references, apps/plite route/proof app, package names/imports, Plite DOM error codes, Plite React hooks/components/docs references, browser proof labels, Yjs metadata keys, and changeset prerelease metadata.
- Stored broad audit artifacts under docs/plans/artifacts/plite-terminology-migration/.
- Fixed stale browser comment-mode selection assertions by deriving expected range offsets from the selected prefix text.

Review fixes:
- Fixed source alias regex to resolve @platejs/plite packages only.
- Fixed stale docs storage keys, docs proof map paths, package README wording, Plite React surface contracts, public package surface contracts, and Yjs attribute tests.
- Fixed stale changesets and pre.json package ids.
- Fixed /examples/plite navigation and comment-mode browser proof fallout.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- `pnpm --filter www build:source` passed after final docs edits.
- `pnpm plite:typecheck` passed after final lint formatting.
- `pnpm plite:test` passed after final lint formatting.
- `pnpm --filter plite test:plite-browser:chromium tests/plite-browser/donor/examples/comment-mode.test.ts` passed after final lint formatting: 6 passed.
- Full `pnpm --filter plite test:plite-browser:chromium` passed before lint formatting: 587 passed / 7 skipped, follow-up groups 3 passed and 45 passed, final pagination group exited 0 with one flaky retry in `pagination.test.ts`.
- Strict active stale audit returned no disallowed matches across package.json, config, apps/plite, content/docs/plite, docs/plite, Plite packages, browser, Yjs, tooling/plite, .github, and .changeset.
- `pnpm lint:fix` was attempted and failed on existing Plite lint debt after applying safe fixes: 1,638 diagnostics remain.

Final handoff contract:
- Recommendation: accept the Plite terminology migration as active-source complete.
- Confidence: high for docs/package/app terminology; medium for broad repo history because old provenance remains intentionally allowlisted.
- Evidence: strict stale audit clean, docs source green, Plite typecheck green, Plite package tests green, focused browser proof green, full browser proof exited 0 with one flaky retry.
- Tests / commands: recorded in Verification evidence.
- Browser proof: /examples/plite comment-mode focused row passed; full Chromium row passed with one flaky pagination retry.
- PR / tracker: N/A; no PR or tracker mutation requested.
- Caveats: broad lint remains red from existing Plite examples/tests diagnostics.
- Next owner: auto/architecture-cleanup can handle lint debt or pagination flake separately.

Timeline:
- 2026-06-23T12:10:46.239Z Major-task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final handoff after check-complete |
| What is the goal? | Rename active fork terminology to Plite while preserving intentional upstream Slate provenance |
| What have I learned? | Active stale terminology is clean; lint and pagination flake are separate debt |
| What have I done? | Applied docs/package/app/proof/Yjs/changeset rename and verified scoped gates |

Open risks:
- Full lint is not green; current Plite examples/tests have broad pre-existing lint debt outside this rename.
- Full Chromium browser proof had one flaky pagination stress row that passed on retry; not a rename blocker, but it should stay in perf/proof debt.
- Historical changelogs, issue ledgers, and research artifacts intentionally still mention upstream Slate; do not rewrite them unless their owner is promoted to public current-state docs.

