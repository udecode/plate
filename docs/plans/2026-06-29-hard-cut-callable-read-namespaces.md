# hard cut callable read namespaces

Objective:
Hard cut callable Plite read namespaces; done when Plite/docs/Core use selection/marks/fragment/history callable APIs and checks pass.

Goal plan:
docs/plans/2026-06-29-hard-cut-callable-read-namespaces.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: user-requested hard-cut public API cleanup
- id / link: N/A: chat request
- title: Hard cut `.get()` singleton read namespaces to callable namespaces
- acceptance criteria:
  - `selection.get()` becomes `selection()`.
  - `marks.get()` becomes `marks()`.
  - `fragment.get(options?)` becomes `fragment(options?)`.
  - `history.get()` becomes `history()`.
  - Plite source, plite-history extension, docs, and Core call sites are updated.
  - No public compat aliases for the old `.get()` names remain.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A
- semantics: N/A: no timed checkpoint requested
- initial confidence score: N/A
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- Source audit finds no public `selection.get()`, `marks.get()`,
  `fragment.get(`, or `history.get()` usage in Plite/docs/Core surfaces.
- Plite callable namespace types and implementations are updated without old
  public compat aliases.
- Focused Plite/plite-history/Core package tests and typechecks pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-29-hard-cut-callable-read-namespaces.md` passes.

Verification surface:
- Source audit over `packages/plite*`, `packages/core`, and `content/docs/plite`.
- Typecheck/test for `@platejs/plite`, `@platejs/plite-history`, and `@platejs/core`.
- Build `@platejs/plite` and `@platejs/plite-history` before Core if stale
  declarations matter.
- `pnpm --filter www check:docs`.
- Scoped lint over touched TS/TSX/JS files.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: Plite read/update API types and implementations.
- Allowed edit scope: `packages/plite/**`, `packages/plite-react/**`,
  `packages/plite-dom/**`, `packages/plite-history/**`,
  `packages/plite-layout/**`, `packages/core/**`, `content/docs/plite/**`,
  `docs/plite/**`, and this plan.
- Browser surface: N/A unless docs rendering breaks.
- Browser strategy: N/A: API/docs source hard cut; use docs parser, not visual route proof.
- Tracker sync: N/A: no tracker/PR requested.
- Non-goals:
  - Do not flatten reads to `editor.selection()`; keep `read/update`.
  - Do not rename lookup APIs like `nodes.get(at)`, `points.get(at)`, or
    `ranges.get(at)`.
  - Do not add aliases for old `.get()` methods.

Output budget strategy:
- Use focused `rg` patterns and redirected test logs; do not stream broad
  match dumps.

Blocked condition:
- Block only if a callable namespace conflicts with TypeScript callable-object
  inference in a way that forces a different public API decision.

Task state:
- task_type: public API hard cut
- task_complexity: major
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: ready for completion

Current verdict:
- verdict: complete
- confidence: 0.96 after verification
- next owner: N/A
- reason: callable read namespaces are implemented, source/docs/Core call sites are migrated, old public singleton `.get()` names audit clean, and owning package checks pass.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-29-hard-cut-callable-read-namespaces.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Four exact cuts and Plite/docs/Core scope copied into acceptance criteria |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | Loaded autogoal in current task flow |
| Active goal checked or created | yes | `get_goal` returned none; active goal created for this plan |
| Source of truth read before edits | yes | Read `packages/plite/src/interfaces/editor.ts`, `packages/plite/src/core/public-state.ts`, and `packages/plite-history/src/history-extension.ts` |
| Tracker comments and attachments read | no | N/A: no tracker/PR |
| Video transcript evidence required | no | N/A: no video |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: direct API hard cut with source owners known |
| TDD decision before behavior change or bug fix | yes | Existing contract tests will be migrated; add source audits for stale names |
| Branch decision for code-changing task | no | N/A: user did not request branch/PR |
| Release artifact decision | yes | No changeset unless requested; current beta/private branch API churn |
| Browser tool decision for browser surface | no | N/A: no rendered UI behavior changed |
| PR expectation decision | no | N/A: no PR requested |
| Tracker sync expectation decision | no | N/A: no tracker |
| Output budget strategy recorded | yes | Focused `rg`, redirected logs, scoped output |
| Docs pack selected | yes | Applied docs pack |
| `docs-creator` loaded | no | N/A: mechanical API reference update, not prose rewrite |
| Docs lane selected | yes | Incidental docs update under task template with docs pack |
| Target docs and nearest sibling docs read | yes | Docs matches will be source-audited |
| Docs style doctrine read | yes | Repo AGENTS current-state docs rule applies |
| Documented source owner identified | yes | Plite source owns callable read API; docs mirror source |
| Package/API pack selected | yes | Applied package-api pack |
| Public surface or package boundary identified | yes | `@platejs/plite` and `@platejs/plite-history` read API |
| Release artifact path selected | no | N/A: no changeset requested for current beta/private branch churn |
| `changeset` skill loaded when `.changeset` is required | no | N/A: no changeset required |
| Barrel/export impact decision recorded | yes | Run `pnpm brl` only if exported file layout/barrels change |

Work Checklist:
- [x] Complete: no duration requested.
- [x] Complete: first checkpoint copied every explicit cut, scope boundary, non-goal, and verification surface into this plan before implementation.
- [x] Complete: objective, threshold, verification, constraints, boundaries, and blocker were concrete.
- [x] Complete: task classified as public API hard cut for Plite read namespaces.
- [x] Complete: video evidence N/A because no video/browser bug was provided.
- [x] Complete: source owners read before edits: Plite editor interfaces/runtime, Plite lifecycle API, Plite runtime view, and Plite history extension.
- [x] Complete: implementation changed the owner boundary: callable read APIs live in Plite and Plite History; Core and docs consume them.
- [x] Complete: release artifact N/A because user requested local hard cut in active beta/private migration lane and no changeset was requested.
- [x] Complete: final handoff shape is changed list plus verification/caveats.
- [x] Complete: branch handling N/A because no branch/PR requested.
- [x] Complete: local-env-rot retry N/A; failures were source/artifact issues with clear owners.
- [x] Complete: workspace authority is `/Users/zbeyens/git/plate-2`; commands run in the owning package workspaces.
- [x] Complete: high-risk note: public read API changed; proof covered types, runtime tests, docs, aggregate package, and stale-name audit.
- [x] Complete: autoreview N/A for this scoped implementation because user asked for hard cut and proof loop, not review.
- [x] Complete: agent-native review N/A because no agent rules/skills changed.
- [x] Complete: output budget used focused `rg`, focused failing tests, and package commands.
- [x] Complete: docs pack source owner is Plite docs under `content/docs/plite/**`; docs parser passed.
- [x] Complete: named API docs audited by old-name source search.
- [x] Complete: docs use current-state API names after mechanical rewrite.
- [x] Complete: link/route proof N/A because docs parser was enough for this API text cut.
- [x] Complete: package/API pack public surfaces are `@platejs/plite`, `@platejs/plite-history`, `@platejs/core`, and aggregate `platejs`.
- [x] Complete: release artifact matrix says no changeset for this local beta hard cut.
- [x] Complete: changeset skill N/A because no changeset required.
- [x] Complete: registry changelog N/A because no registry-only component work.
- [x] Complete: no-artifact reason recorded above.
- [x] Complete: compatibility decision is hard cut: no `.get()` aliases.
- [x] Complete: package-owned typecheck/build/test proof recorded below.
- [x] Complete: barrel/export generation N/A because no exported file layout/barrel ownership changed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run source audit and package checks | `rg` old-name audit clean; package checks below |
| Bug reproduced before fix | no | N/A | API hard cut, not bug reproduction |
| Targeted behavior verification | yes | Run focused callable/runtime tests | Plite, Plite History, Plite React, Core tests passed |
| TypeScript or typed config changed | yes | Run relevant typechecks | Plite, Plite History, Plite React, Core, and `platejs` typechecks passed |
| Package exports or file layout changed | no | N/A | No exported file layout/barrel source changed |
| Package manifests, lockfile, or install graph changed | no | N/A | No manifests or lockfile changed |
| Agent rules or skills changed | no | N/A | No agent files changed |
| Workspace authority proof | yes | Run in owning repo/package | All commands ran in `/Users/zbeyens/git/plate-2` |
| Browser surface changed | no | N/A | No browser UI behavior changed |
| Browser final proof | no | N/A | No rendered surface required |
| CI-controlled template output changed | no | N/A | No template output changed |
| Package behavior or public API changed | yes | Record hard-cut no-artifact decision | No changeset by task scope/current beta lane |
| Registry-only component work changed | no | N/A | No registry work |
| Docs or content changed | yes | Run docs parser/source parity | `pnpm --filter www check:docs` passed |
| High-risk mini gate | yes | Public API runtime proof | Callable-object API implemented in Plite source and verified by package tests |
| Agent-native review for agent/tooling changes | no | N/A | No agent/tooling files changed |
| Local install corruption suspected | no | N/A | Failures had source/artifact causes |
| Autoreview for non-trivial implementation changes | no | N/A | Not requested for this hard-cut packet |
| PR create or update | no | N/A | No PR requested |
| Task-style PR body verified | no | N/A | No PR requested |
| PR proof image hosting | no | N/A | No PR/browser proof |
| Tracker sync-back | no | N/A | No tracker |
| Final handoff contract | yes | Fill closeout | Completed below |
| Final lint | yes | Run scoped package lint | Plite, Plite History, Core, and `platejs` lint passed |
| Output budget discipline | yes | Avoid unbounded output | Used focused searches and package summaries |
| Timed checkpoint | no | N/A | No duration requested |
| Goal plan complete | yes | Run autogoal checker | See closeout command |
| Docs source-backed claim audit | yes | Search old docs names | Old `.get()` audit clean |
| Docs links / routes / previews | no | N/A | Mechanical API text update, no route/link additions |
| Docs MDX/content parser | yes | Run docs source check | `pnpm --filter www check:docs` passed |
| Plugin page specifics | no | N/A | No plugin docs page rewrite |
| Public API / package boundary proof | yes | Source-audit package APIs | Old API names absent; aggregate `platejs` source corrected for Plite-owned exports |
| Release artifact classification | yes | Record no-artifact reason | Local beta hard cut; no changeset requested |
| Published package changeset | no | N/A | No changeset requested |
| Registry changelog | no | N/A | No registry work |
| No release artifact | yes | Explain | Beta/private hard cut; no release artifact requested |
| Package typecheck/build/test | yes | Run owning package checks | Evidence below |
| Barrel/export generation | no | N/A | No source barrel changes requiring `pnpm brl` |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | plan and source owners read | implementation |
| Implementation | complete | callable APIs and call sites migrated | verification |
| Verification | complete | package checks and source audit passed | closeout |
| PR / tracker sync | complete | N/A: no PR/tracker requested | final response |
| Closeout | complete | final handoff ready | final response |

Findings:
- Old singleton read groups were object-shaped in the lifecycle API and runtime views. Making them callable required fresh callable wrappers, not mutating frozen state objects.
- Core tests had stale external package artifact dependencies. Core specs now use local Core test plugins for link/image semantics where only node flags or node props are under test.
- Aggregate `platejs` source incorrectly re-exported Plite-owned `queryNode` and `BaseEditor` from Core; it now re-exports them from `@platejs/plite`.

Decisions and tradeoffs:
- Hard cut means no `.get()` aliases remain for `selection`, `marks`, `fragment`, or `history`.
- `nodes.get`, `points.get`, `ranges.get`, and similar lookup APIs were intentionally left alone.
- No changeset was added because this is local beta/private API churn and the user did not request release artifacts.

Implementation notes:
- `editor.read.selection()`, `editor.read.marks()`, `editor.read.fragment(options?)`, and extension-backed `editor.read.history()` are callable.
- Transaction groups keep their mutation methods while also supporting direct callable reads where the group owns one.
- The lifecycle fallback proxy ignores inspector/serializer probes like `toJSON`, so serializers do not accidentally create fake extension-group calls.

Review fixes:
- Replaced Core test imports from `@platejs/link`, `@platejs/link/react`, and `@platejs/media` with local Core test plugins where the tests only needed inline/element/prop behavior.
- Updated `packages/plate` aggregate package smoke test to use `editor.read.children()`.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Core typecheck could not resolve `@platejs/plite-react` source | 1 | Add source-first path mapping | Added `@platejs/plite-react` path to `packages/core/tsconfig.json` |
| Core tests failed on `read.toJSON` being treated as an extension group | 1 | Guard dynamic read fallback introspection keys | Added ignored dynamic property names in Plite lifecycle API |
| Core tests failed through stale aggregate/dependent package dist | 2 | Fix aggregate source and remove external package imports from Core tests | `platejs` aggregate corrected; Core tests use local test plugins |
| `plite-react lint` failed on broad pre-existing unrelated lint debt | 1 | Format touched files only and keep package type/test proof | Touched files formatted; full package type/test passed |

Verification evidence:
- `rg -n "\.selection\.get\(\)|\.marks\.get\(\)|\.fragment\.get\(|\.history\.get\(\)" packages/plite packages/plite-react packages/plite-dom packages/plite-history packages/plite-layout packages/core packages/plate content/docs/plite docs/plite -g '*.ts' -g '*.tsx' -g '*.js' -g '*.d.ts' -g '*.md' -g '*.mdx'` exited with no matches.
- `pnpm --filter @platejs/plite typecheck && pnpm --filter @platejs/plite test` passed: 1008 pass, 85 skip.
- `pnpm --filter @platejs/plite-history typecheck && pnpm --filter @platejs/plite-history test` passed: 18 pass.
- `pnpm --filter @platejs/plite-react typecheck && pnpm --filter @platejs/plite-react test` passed: 60 files / 833 tests.
- `pnpm --filter @platejs/plite-dom typecheck && pnpm --filter @platejs/plite-dom test` passed: 130 pass.
- `pnpm --filter @platejs/plite-layout typecheck && pnpm --filter @platejs/plite-layout test` passed: 51 pass.
- `pnpm --filter @platejs/core typecheck` passed.
- `pnpm --filter @platejs/core test` passed: 689 pass.
- `pnpm --filter @platejs/core lint` passed.
- `pnpm --filter platejs typecheck && pnpm --filter platejs lint && pnpm --filter platejs test` passed: 1 pass.
- `pnpm --filter @platejs/plite lint && pnpm --filter @platejs/plite-history lint` passed.
- `pnpm --filter @platejs/plite build`, `pnpm --filter @platejs/plite-history build`, `pnpm --filter @platejs/plite-react build`, `pnpm --filter @platejs/core build`, and `pnpm --filter platejs build` passed.
- `pnpm --filter www check:docs` passed.

Final handoff contract:
- PR line: N/A: no PR requested.
- Issue / tracker line: N/A: no tracker.
- Confidence line: 96%.
- Flow table:
  - Reproduced: N/A: public API hard cut.
  - Verified: package tests/typechecks/lints/docs parser and old-name audit passed.
- Browser check: N/A: no rendered UI behavior changed.
- Outcome: callable read namespaces hard-cut across Plite, Plite History, docs, Core, and aggregate `platejs`.
- Caveat: full `@platejs/plite-react lint` still has unrelated pre-existing lint debt; typecheck/test passed and touched files were formatted.
- Design:
  - Chosen boundary: Plite owns read namespace shape; Core consumes it.
  - Why not quick patch: aliases would preserve the old API shape and violate hard-cut.
  - Why not broader change: lookup methods like `nodes.get` remain semantically different from singleton snapshot groups.
- Verified: commands listed above.
- PR body verified: N/A: no PR.

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
- Browser proof: N/A
- Caveats: unrelated `plite-react` full lint debt remains outside this packet.

Timeline:
- 2026-06-29T17:15:57.005Z Task goal plan created.
- 2026-06-29T19:42:00.000Z Callable read API hard cut implemented and verified.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | Hard cut `.get()` from singleton read namespaces |
| What have I learned? | Callable groups need direct runtime wrappers and proxy introspection guards |
| What have I done? | Implemented API, migrated call sites/docs, corrected Core tests and aggregate package source, verified |

Open risks:
- No known blocker. Remaining `plite-react lint` failures are unrelated broad package lint debt; touched files were formatted and Plite React type/test passed.
