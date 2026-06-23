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
| Release artifact path selected | pending | Decide after knowing whether code/package rename occurs in this goal |
| `changeset` skill loaded when `.changeset` is required | no | N/A until package rename creates published user-visible delta |
| Barrel/export impact decision recorded | pending | Decide after code/package rename scope is known |

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
- [ ] Current state is mapped before proposing a new architecture, migration,
      benchmark, or plan.
- [ ] Existing repo patterns, prior decisions, and nearby implementation
      constraints are recorded before external research.
- [x] External docs or source are used only where repo evidence does not settle
      the question, or N/A reason is recorded. N/A: repo-local terminology work.
- [ ] Options, recommendation, tradeoffs, blast radius, and rejection reasons
      are recorded.
- [ ] Facts, inference, and recommendation are separated.
- [ ] Review or pressure lenses are selected and completed, or marked N/A with
      reason.
- [x] If implementation happens, touched-surface packs cover docs, browser,
      package/API, or agent-native surfaces as needed.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the analyzed or changed behavior.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [ ] Stale terminology audit artifact exists with active-source counts and an intentional remaining-reference allowlist.
- [ ] Public docs/content route rename packet is complete: `content/docs/plite` becomes Plite-owned docs or is replaced by `content/docs/plite`, and active links/nav labels point to Plite.
- [ ] `docs/plite` active docs are renamed or moved to `docs/plite`, while archival proof/research is either renamed only if active or ledgered as intentional history.
- [ ] Breaking package/API/code rename packet is completed or deferred with exact remaining `Plite` package/import symbols and owner checks.
- [ ] Accepted/actionable review findings are fixed or explicitly rejected with
      evidence.
- [ ] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [ ] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason.
- [ ] Docs pack: docs use current-state reference voice, not changelog voice.
- [ ] Docs pack: links, anchors, and previews target real leaf pages or are marked N/A with reason.
- [ ] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [ ] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [ ] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [ ] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset.
- [ ] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [ ] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [ ] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [ ] Package/API pack: generated barrels or release notes are updated when required.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | pending | Run the repo audit, benchmark, review, prototype, or artifact check named in this plan | pending |
| Current-state source audit | pending | Map current owner, boundaries, constraints, and affected surfaces | pending |
| Decision criteria closure | pending | Mark each criterion satisfied, narrowed, rejected, or blocked with evidence | pending |
| Options / tradeoffs / rejection record | pending | Record viable options, chosen recommendation, and why alternatives lose | pending |
| Review / pressure pass | pending | Run selected reviewer/lens or record N/A with reason | pending |
| Review findings closure | pending | Fix or explicitly reject accepted/actionable findings and record closure proof | pending |
| External-source audit | pending | Cite official/local clone/external sources when used, or record N/A | pending |
| Implementation gates | pending | If code changed, close primary-template and touched-surface gates; otherwise N/A | pending |
| Final handoff contract | pending | Record recommendation, evidence, caveats, residual risk, and next owner | pending |
| Final lint | pending | Run `pnpm lint:fix` or scoped equivalent when files changed | pending |
| Output budget discipline | pending | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | pending |
| Timed checkpoint | pending | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | pending |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-23-plite-terminology-migration.md` | pending |
| Docs source-backed claim audit | pending | Verify docs claims against current source or record N/A | pending |
| Docs links / routes / previews | pending | Verify leaf links, routes, anchors, and preview names or record N/A | pending |
| Docs MDX/content parser | pending | Run `pnpm --filter www build:source` for MDX/content changes, or record N/A | pending |
| Plugin page specifics | pending | For plugin pages, apply `docs-creator` kit/manual/API rules; otherwise N/A | pending |
| Public API / package boundary proof | pending | Source-audit public API, exports, and package boundary impact | pending |
| Release artifact classification | pending | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | pending |
| Published package changeset | pending | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | pending |
| Registry changelog | pending | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | pending |
| No release artifact | pending | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | pending |
| Package typecheck/build/test | pending | Run owning package checks or record N/A with reason | pending |
| Barrel/export generation | pending | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | in_progress | created plan | research / analysis |
| Current-state map | pending | | options |
| Options and recommendation | pending | | review |
| Review / pressure pass | pending | | implementation decision |
| Implementation or plan artifact | pending | | verification |
| Verification | pending | | closeout |
| Closeout | pending | | final response |

Findings:
- None yet.

Decisions and tradeoffs:
- None yet.

Implementation notes:
- None yet.

Review fixes:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- Pending.

Final handoff contract:
- Recommendation: pending
- Confidence: pending
- Evidence: pending
- Tests / commands: pending
- Browser proof: pending
- PR / tracker: pending
- Caveats: pending
- Next owner: pending

Timeline:
- 2026-06-23T12:10:46.239Z Major-task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Intake and source read |
| Where am I going? | Research / analysis, options, review, verification, closeout |
| What is the goal? | TODO: Fill from Objective |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- Pending.
