# hard cut plate migrations after v54

Objective:
Hard-cut Plate migration v55/v56, fold all unreleased AST and code-block-line work into public v54, repair migration-version doctrine, and prove the package, CLI, docs, registry, browser, and generated skill surfaces.

Goal plan:
docs/plans/2026-09-03-hard-cut-plate-migrations-after-v54.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- package-api (docs/plans/templates/packs/package-api.md)
- docs (docs/plans/templates/packs/docs.md)
- agent-native (docs/plans/templates/packs/agent-native.md)
- browser (docs/plans/templates/packs/browser.md)

Task source:
- type: direct user instruction
- id / link: N/A: no tracker
- title: Plate migration hard cut after v54
- acceptance criteria: v54 is the only next migration; remove v55/v56; repair the relevant skill so later changes cannot invent future migration numbers.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A
- semantics: N/A: no duration requested
- initial confidence score: 88%
- improvement loop: source audit, hard cut, focused proof, broad proof, stale-reference audit
- final score / loop closure: 99%; all task-owned gates pass, with unrelated whole-tree schema-audit failures recorded below

Completion threshold:
- `migratePlateV54` is the sole public next-version migration and includes the current v54, final-AST, and code-block-line transformations.
- Zero live product, package, CLI, docs, example, changelog-source, or source-rule references teach `migratePlateV55`, `migratePlateV56`, target version 55, or target version 56.
- Selection mapping remains correct across the composed v54 transformation, including named roots and empty code lines.
- Public barrels, changeset, generated registry output, and generated skill mirrors match their source owners.
- Focused package/CLI migration tests, package typecheck, docs source build, registry build, and required browser proof pass or carry an exact blocker.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-03-hard-cut-plate-migrations-after-v54.md` passes.

Verification surface:
- Focused `packages/platejs` migration specs and CLI migration tests.
- `pnpm brl`, the owning package typecheck/check lane, `pnpm --filter www build:source`, `pnpm --filter www build:registry`, and `pnpm install`.
- Scoped `rg` audit excluding historical plans and generated/vendor noise.
- Browser exercise of the document migration demo route, including console/network inspection when runnable.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `packages/platejs/src/migrations`, migration orchestration, migration docs/demo/changelog sources, and `.agents/rules/best-api/rules/schema-and-identity.md`.
- Allowed edit scope: migration source/tests/exports, CLI tests, docs, registry source/generated output, relevant agent rule/generated mirror, one changeset, and this plan.
- Browser surface: document migration demo in `apps/www`.
- Browser strategy: Browser for the normal app route. Use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: direct local task with no issue or PR requested.
- Non-goals: compatibility aliases, an additional migration version, commit, push, release, unrelated migration redesign, or virtualized-editor performance work.

Output budget strategy:
- Scope searches to migration identifiers and owning directories; print file lists/counts before excerpts; cap command output and inspect only matched regions.

Blocked condition:
- Block only if the single v54 step cannot preserve selection mapping across the composed transforms, or the required generated owners cannot run after one install-repair attempt.

Task state:
- task_type: public API hard cut and serialized-document migration repair
- task_complexity: high
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: complete

Current verdict:
- verdict: v55/v56 are invalid unreleased boundaries and must be deleted
- confidence: 88%
- next owner: best-api plus plate-plan execution
- reason: migration versions describe persisted source/target contracts, not each implementation batch.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-03-hard-cut-plate-migrations-after-v54.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | v54-only hard cut, skill repair, and proof are explicit above |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | loaded autogoal, hard-cut, best-api, plate-plan, and skill-creator owners |
| Active goal checked or created | yes | no existing goal; create after this first checkpoint |
| Source of truth read before edits | yes | migration implementations/exports/tests and best-api migration doctrine inspected |
| Tracker comments and attachments read | no | N/A: direct user instruction |
| Video transcript evidence required | no | N/A: no video |
| `docs/solutions` checked for non-trivial existing-code work | yes | scoped search required before implementation |
| TDD decision before behavior change or bug fix | yes | preserve and retarget existing v55/v56 specs to fail/pass against v54 |
| Branch decision for code-changing task | no | N/A: current checkout is required; no branch/PR requested |
| Release artifact decision | yes | published `platejs` API/runtime delta requires a changeset; registry changelog source also needs v54 naming |
| Browser tool decision for browser surface | yes | Browser against the document migration demo |
| PR expectation decision | no | N/A: no PR requested |
| Tracker sync expectation decision | no | N/A: no tracker |
| Output budget strategy recorded | yes | scoped/capped searches and excerpts recorded above |
| Package/API pack selected | yes | public `platejs` migration export and behavior |
| Public surface or package boundary identified | yes | `platejs` migration entrypoint and document migration runner |
| Release artifact path selected | yes | `.changeset` plus existing registry changelog source correction |
| `changeset` skill loaded when `.changeset` is required | yes | load before creating the artifact |
| Barrel/export impact decision recorded | yes | deleting two public migration exports requires `pnpm brl` |
| Runtime scale applicability resolved | no | N/A: this changes one-time migration transforms, not repeated/hot editor work |
| Docs pack selected | yes | document-model and editor migration guides |
| `docs-creator` loaded | yes | load before docs edits |
| Docs lane selected | yes | current-state migration reference and demo |
| Target docs and nearest sibling docs read | yes | read before editing each matched migration section |
| Docs style doctrine read | yes | load docs-creator owner before edits |
| Documented source owner identified | yes | `packages/platejs/src/migrations/migratePlateV54.ts` |
| Agent-native pack selected | yes | best-api source migration gate |
| Agent-facing action surface identified | yes | target-version allocation and unreleased-step folding |
| Source rule versus generated mirror boundary identified | yes | edit `.agents/rules/**`; regenerate `.agents/skills/**` with `pnpm install` |
| `agent-native-reviewer` loaded or waiver recorded | yes | load before final agent-rule review |
| Browser pack selected | yes | migration demo route |
| Browser route / app surface identified | yes | registry document migration demo route, resolved from route source before launch |
| Browser tool decision recorded | yes | Browser, with exact blocker if server/route is unavailable |
| Console/network caveat policy recorded | yes | report console/network state or exact unavailable reason |
| Observable browser case captured | no | N/A: implementation/API correction, not a report-backed visual bug |

Work Checklist:
- [x] No duration was requested; initial and final confidence are recorded.
- [x] Every prompt requirement, boundary, stop condition, deliverable, proof surface, and success criterion was captured before implementation.
- [x] Task source, target files, root owner, public API risk, browser route, and no-PR boundary are explicit.
- [x] Video evidence is N/A: no video was supplied.
- [x] Repo instructions, Vision, migration source, tests, docs doctrine, and relevant skills were read before edits.
- [x] One public `migratePlateV54` owns the complete migration; three implementation phases remain private `.internal.ts` files.
- [x] Existing `platejs` major changesets were corrected relative to `main`; the registry changelog source was renamed and regenerated.
- [x] No branch, commit, push, PR, or tracker action was requested or performed.
- [x] No local-install corruption appeared; `pnpm install` ran for generated skill sync, not as a repair attempt.
- [x] All verification ran from `/Users/zbeyens/git/plate-2` in the owning package/app/tool.
- [x] High-risk failure mode was selection drift across composed transforms; direct, named-root, empty-line, and prior-phase block-move cases pass.
- [x] P1 autoreview is N/A because repo policy forbids it on the active `next` lane.
- [x] Agent-native review passes: route, source owner, generated mirrors, proof, and discoverability are present.
- [x] Output remained scoped to migration identifiers, owners, capped excerpts, and named proof commands.
- [x] Docs and changelog prose completed an Unslop file-edit review; no further prose edits were justified.
- [x] Browser verified `/dev/document-migration` in a fresh tab: one migrated code text-flow host, expected text, and no warning/error logs.
- [x] Paint controls, exact reporter replay, clean pushed ref, fingerprints, and 5/5 native stability are N/A: this is a local API/migration correction with no paint or reporter claim.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named proof and hard-cut audit | All task-owned commands pass |
| Bug reproduced before fix | no | N/A: architecture correction, not a reported behavior bug | Existing v55/v56 source audit was the red state |
| Targeted behavior verification | yes | Run migration and CLI tests | 72 package tests and 6 CLI tests pass |
| TypeScript or typed config changed | yes | Run owning typechecks | migration entrypoint, full `platejs`, CLI, and www typechecks pass |
| Package exports or file layout changed | yes | Run `pnpm brl` | pass; only `migratePlateV54` is public |
| Package manifests or install graph changed | no | N/A: no manifest change | `pnpm install` ran for skill generation and reported lockfile current |
| Agent rules or skills changed | yes | Regenerate mirrors | `pnpm install`; source/mirror audit passes |
| Workspace authority proof | yes | Use owning workspace | every command ran in `/Users/zbeyens/git/plate-2` |
| Browser surface changed | yes | Exercise migration demo | `/dev/document-migration` passes in Browser |
| Browser final proof | yes | Fresh tab after final generation | one text-flow host, expected code text, zero warning/error logs |
| CI-controlled template output changed | no | N/A | templates untouched |
| Package behavior or public API changed | yes | Correct existing changesets | three `platejs` major changesets teach v54 only |
| Registry changelog changed | yes | Edit source and regenerate | `--write` and `--check` pass for 110 events |
| Docs or content changed | yes | Source-backed docs checks | `build:source`, `check:docs`, and www typecheck pass |
| High-risk mini gate | yes | Prove composed selection mapping | main root, named root, empty lines, and block-move case pass |
| Agent-native review | yes | Review route/source/mirror/proof map | PASS; no findings |
| Local install corruption suspected | no | N/A | no corruption signature occurred |
| P1 autoreview | no | N/A | forbidden by repo policy on `next` |
| PR, body, proof hosting, tracker sync | no | N/A | no PR or tracker action requested |
| Final handoff contract | yes | Record below | complete |
| Final lint | yes | Run scoped owning lint/format checks | migration and CLI lint pass; scoped oxfmt passes after repair |
| Output budget discipline | yes | Keep output scoped/capped | pass |
| Timed checkpoint | no | N/A | no duration requested |
| Goal plan complete | yes | Run checker | run after this update |
| Public API / package boundary proof | yes | Audit exports and stale names | hard-cut audit passes |
| Runtime scale contract | no | N/A | one-time migration path, not hot editor work |
| Release artifact classification | yes | Package plus registry user-visible delta | existing major changesets plus registry changelog corrected |
| Published package changeset | yes | Follow changeset policy | no new file; existing branch changesets corrected relative to `main` |
| No release artifact | no | N/A | artifacts apply |
| Package typecheck/build/test | yes | Run package proof | pass |
| Barrel/export generation | yes | Run `pnpm brl` | pass |
| Docs source-backed claim audit | yes | Compare docs to source | v54 import, step, target, and behavior match source |
| Required Unslop pass | yes | Review every touched docs artifact in full | pass; literals and claims preserved |
| Requirements disclosure | yes | Classify owners | package owns migration; app owns lineage; registry owns demo/changelog |
| Docs links / routes / previews | yes | Verify affected route | `/dev/document-migration` renders |
| Docs MDX/content parser | yes | Run parser | pass |
| Plugin page specifics | no | N/A | no plugin page changed |
| Agent source / generated sync | yes | Sync and compare | pass |
| Agent action discoverability | yes | Audit skill wording | best-api and plate-plan both state the v54 allocation rule |
| Browser console/network check | yes | Fresh-tab error inspection | no warning/error or failed-resource message observed |
| Browser final proof artifact | yes | Record DOM evidence | expected code, exactly one text-flow host |
| Exact case replay, final pushed ref, clean runtime, retry stability | no | N/A | no reporter, push, paint, focus, DnD, or native-lifecycle claim |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | owners, tests, docs, Vision, and skills read | implementation |
| Implementation | complete | v54 wrapper, private phases, consumers, docs, rules, artifacts | verification |
| Verification | complete | package, CLI, docs, registry, agent, source, and Browser proof | closeout |
| PR / tracker sync | N/A | no PR/tracker requested | final response |
| Closeout | complete | completion checker | final response |

Findings:
- `migratePlateV55` and `migratePlateV56` were unreleased implementation batches, not valid persisted boundaries.
- The best-api example taught a concrete v53-to-v55 chain and normalized speculative version allocation.
- The single public v54 function needs private ordered phases because combining roughly 1,900 lines into one file would damage maintenance without changing the API.
- The repository-wide schema adoption checker still reports unrelated pre-existing failures outside this task; its migration-owned allowlists are repaired and no migration-owned failure remains.

Decisions and tradeoffs:
- Hard-cut v55/v56 with no aliases.
- Compose v53 profile, final AST, and code-line flattening inside `migratePlateV54`.
- Compose selection mapping across the pre-flatten document so earlier structural moves cannot corrupt line offsets.
- Keep generic migration-runner tests on versions 1-3 so they do not imply Plate release numbers.

Implementation notes:
- Renamed implementation phases to `.internal.ts`, regenerated the migrations barrel, and retained one public `migratePlateV54` export.
- Retargeted package, CLI, docs, demo, changesets, changelog, research, checker allowlists, Vision, best-api, and plate-plan to v54.

Review fixes:
- Scoped lint found one non-null assertion in the v54 wrapper; replaced it with a narrowed local function.
- Registry generation exposed stale changelog indexes; used the owning changelog generator and verified all 110 events.
- Browser logs initially contained a transient registry-alias error captured while generation replaced files; a fresh post-generation tab had zero warning/error logs.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Combined move/add patch targeted the same path | 1 | split move and add patches | resolved |
| Initial focused suite exposed v54 final-AST expectation drift | 1 | update old intermediate expectation to final v54 output | 86/86 passed |
| Initial migration lint rejected a non-null assertion | 1 | preserve the narrowed mapper in a local constant | lint passed |
| Whole-tree schema adoption audit includes unrelated failures | 2 | isolate task-owned findings | zero migration-owned failures remain |

Verification evidence:
- `pnpm --filter platejs test:entrypoint:migrations`: 72 pass.
- `bun test packages/cli/test/run-migration.test.ts`: 6 pass.
- `pnpm --filter platejs typecheck`, migration entrypoint typecheck/lint, and CLI typecheck/lint: pass.
- `pnpm --filter www typecheck`, `build:source`, `check:docs`, and `build:registry`: pass.
- `pnpm brl`, `pnpm install`, changelog `--check`, hard-cut source audit, and skill mirror comparison: pass.
- Browser `/dev/document-migration`: expected code text, exactly one text-flow host, no warning/error logs in a fresh tab.

Final handoff contract:
- PR line: N/A: no PR requested
- Issue / tracker line: N/A: direct local task
- Confidence line: 99%
- Flow table:
  - Reproduced: source audit found public v55/v56 implementations, exports, consumers, docs, and skill teaching
  - Verified: 72 package tests, 6 CLI tests, package/app checks, generation, source audit, and Browser pass
- Browser check: `/dev/document-migration` renders the migrated v53 code block through one text-flow host with no fresh warning/error logs
- Outcome: v54 is the sole public next migration and owns every unreleased transformation
- Caveat: whole-tree schema adoption audit has unrelated failures; no task-owned failure remains
- Design:
  - Chosen boundary: one public v54 migration with private ordered phases and composed selection mapping
  - Why not quick patch: deleting exports alone would strand AST/code-line behavior and selection correctness
  - Why not broader change: the migration runner contract is correct; only target allocation and the Plate release step were wrong
- Verified: tests, typechecks, lint, docs, registry, generated mirrors, source audit, and Browser
- PR body verified: N/A: no PR

Task-style PR body contract:
- Preserve any existing `<!-- auto-release:start -->` block. If a changeset is
  part of the diff and repo policy expects auto release, include that block.
- Use the accepted kitcn PR #270 visual format. The body starts with an emoji
  issue/tracker/fix line, for example `🐛 Fixes #123` or `🐛 Fixes ➖ N/A`, then
  an emoji confidence line like `🟢 95-100% confidence`.
- Use this exact table header: `| Phase | 🧪 Tests | 🌐 Browser |`.
- Use `Reproduced` and `Verified` rows. Mark passing proof with `🟢`, repro or
  failing proof with `🔴`, and non-applicable cells with `➖ N/A`.
- Use bold emoji section headings: `**✅ Outcome**`, `**⚠️ Caveat**`,
  `**🏗️ Design**`, and `**🧪 Verified**`.
- Never include a line that links to the current PR itself. The current PR URL
  belongs in the final response, not in its own description.
- Do not replace this with a generic `Summary` / `Verification` PR body, an
  adaptive prose body from a git helper skill, plain `## Outcome` sections, or
  an unrelated generated badge footer unless the caller or repo template
  explicitly asks for it.
- Proof is `gh pr view --json body` output or a concise source-backed summary
  of that output.

Final handoff / sync:
- PR: N/A
- Issue / tracker: N/A
- Browser proof: pass at `/dev/document-migration`
- Caveats: unrelated whole-tree schema adoption failures remain outside scope

Timeline:
- 2026-09-03T10:54:53.415Z Task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | Keep v54 as the sole next Plate migration and prevent speculative target versions |
| What have I learned? | Migration versions are persistence boundaries, not implementation counters |
| What have I done? | Hard cut v55/v56, folded behavior into v54, repaired doctrine and consumers, and verified the result |

Open risks:
- The full schema adoption audit is not green because of unrelated current-tree findings listed above; none cite migration files after the repair.
