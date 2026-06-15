# registry changelog entry files

Objective:
Rearchitect registry changelog authoring; done when stable per-entry MDX generation avoids historical JSON churn and checks pass; plan docs/plans/2026-06-15-registry-changelog-entry-files.md.

Goal plan:
docs/plans/2026-06-15-registry-changelog-entry-files.md

Template:
docs/plans/templates/major-task.md

Primary template:
docs/plans/templates/major-task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)

Major source:
- type: user architecture request
- id / link: conversation request after issue #4637 changelog churn
- title: Registry changelog per-entry MDX rearchitecture
- decision to make: Replace monolithic `tooling/data/plate-ui-changelog.mdx` as the canonical authoring source with stable per-entry MDX while preserving the generated public changelog JSON contract.
- decision criteria:
  - Adding one changelog entry touches only the new entry file plus required generated indexes/new event, not historical event JSON.
  - Authoring stays MDX-readable, not raw JSON-first.
  - Generated schema and consumer APIs stay compatible unless a deliberate migration is recorded.
  - PR/release metadata is explicit or cached, not live-inferred from moving `git blame` line numbers.
  - Existing legacy entries can migrate without rewriting public docs behavior.

Major lane:
- lane: architecture plus code-changing execution
- output type: implementation PR
- implementation expected: yes
- affected packages / surfaces: `tooling/scripts/generate-ui-changelog-entries.mjs`, generator tests, registry changelog source files, generated `apps/www/src/registry/changelog/**` artifacts
- dominant risk: churny generated artifacts and broken release/changelog docs consumers

Completion threshold:
- `tooling/data/plate-ui-changelog.mdx` is no longer the canonical source for new registry UI changelog entries.
- New per-entry MDX files with frontmatter under a stable source directory generate the same public event JSON shape.
- Adding a new entry file no longer rewrites historical event JSON due to source line/row drift.
- Existing generated changelog consumers still read `apps/www/src/registry/changelog/index.json`, `components.json`, and event JSON files.
- Focused generator tests cover parsing frontmatter MDX entries and no historical churn from inserted/new entries.
- Verification commands pass.
- Major-task closure is legal only when the decision criteria are satisfied or
  explicitly narrowed, facts/inference/recommendation are separated, required
  review or pressure passes are recorded, implementation gates are closed when
  code changed, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-registry-changelog-entry-files.md`
  passes.

Verification surface:
- Source audit of generator inputs/outputs and changelog consumers.
- Focused tests: `bun test tooling/scripts/generate-ui-changelog-entries.test.mjs`.
- Dry-run/write proof showing only intended generated files change for a new entry.
- Type/lint checks relevant to touched tooling and docs app.

Constraints:
- Start from repo evidence before external claims.
- Keep helper stack proportional.
- Separate measured evidence, source evidence, inference, and recommendation.
- Implementation is explicitly included.
- Preserve current public registry changelog JSON shape and import APIs.
- Keep authoring MDX-friendly.
- Do not make old generated JSON files volatile because of source line numbers, row numbers, git blame, or PR state drift.

Boundaries:
- Source of truth: user request plus current generator/source/consumer files.
- Allowed edit scope: generator, generator tests, registry changelog source location/files, generated changelog artifacts, goal plan.
- External sources: N/A; local repo source is sufficient.
- Browser surface: N/A; generated data/schema only, no visual UI change expected.
- Tracker sync: N/A unless PR created as handoff.
- Non-goals: redesign release notes, package changelogs, registry component schema, or docs UI rendering.

Output budget strategy:
- Scope reads to generator, source data, tests, and consumers.
- Avoid dumping full generated JSON or minified outputs; inspect representative diffs and use `git diff --name-status` for churn.
- Cap `rg` and `sed` outputs.

Blocked condition:
- Stop if preserving the current public JSON contract is impossible without a broader docs UI migration, or if generated artifacts cannot be made deterministic without deleting required release metadata.

Major state:
- task_type: major
- task_complexity: major
- current_phase: closeout
- current_phase_status: complete
- next_phase: commit / PR
- goal_status: active until PR handoff

Current verdict:
- verdict: implemented per-entry MDX frontmatter as canonical source and kept generated JSON as build artifacts
- confidence: high
- next owner: commit / PR
- reason: Existing churn was caused by monolithic MDX line/row metadata plus live git/PR inference; per-entry explicit metadata removes both volatility sources while preserving MDX authoring.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-registry-changelog-entry-files.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| `major-task` loaded | yes | Read `.agents/skills/major-task/SKILL.md`. |
| Active goal checked or created | yes | `get_goal` returned none; `create_goal` created this objective. |
| Source of truth read before analysis | yes | Read user request plus generator, source MDX, tests, and consumers. |
| Major lane selected | yes | Architecture plus code-changing execution. |
| Decision criteria stated | yes | Listed above. |
| Existing repo patterns / prior decisions checked | yes | Current generator/consumer/source patterns audited. |
| Helper stack selected | yes | `major-task` + `autogoal`; no external helper needed yet. |
| External research decision recorded | no | N/A: local repo source settles this. |
| Implementation expectation recorded | yes | Implementation expected and in scope. |
| Workspace authority selected | yes | `/Users/zbeyens/git/plate` tooling and `apps/www` generated artifacts own this behavior. |
| Branch / PR expectation decided | yes | Use a new branch from `main`; PR expected after verification if code changes. |
| Output budget strategy recorded | yes | Recorded above. |
| Docs pack selected | yes | Applied because source entries are MDX. |
| `docs-creator` loaded | no | N/A: this is data/source MDX, not user-facing docs prose. |
| Docs lane selected | no | N/A: not a docs-authoring task. |
| Target docs and nearest sibling docs read | no | N/A: no docs page copy targeted. |
| Docs style doctrine read | no | N/A: not writing public reference docs. |
| Documented source owner identified | yes | Registry changelog source/generator owns the generated public docs data. |

Work Checklist:
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
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Accepted/actionable review findings are fixed or explicitly rejected with
      evidence.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, anchors, and previews target real leaf pages or are marked N/A with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run repo audit, focused tests, idempotence proof, review, and PR gate | `pnpm check` passed; focused test/typecheck/lint/idempotence/autoreview evidence recorded below |
| Current-state source audit | yes | Map current owner, boundaries, constraints, and affected surfaces | Generator, tests, generated registry changelog JSON, source entry files, generated type, and live agent rules/templates audited |
| Decision criteria closure | yes | Mark each criterion satisfied, narrowed, rejected, or blocked with evidence | Per-entry files avoid monolith line/row drift; explicit metadata avoids live blame/PR drift; public JSON schema preserved |
| Options / tradeoffs / rejection record | yes | Record viable options, chosen recommendation, and why alternatives lose | Recorded below: monolith-with-fixes and JSON-first authoring rejected; per-entry MDX selected |
| Review / pressure pass | yes | Run selected reviewer/lens or record N/A with reason | Agent-native source audit done; `.agents/skills/autoreview/scripts/autoreview --mode local` clean after two accepted fixes |
| Review findings closure | yes | Fix or explicitly reject accepted/actionable findings and record closure proof | Fixed multi-row metadata swallowing and file-relative source line numbers; final autoreview clean |
| External-source audit | no | Cite official/local clone/external sources when used, or record N/A | N/A: local repo source settled the architecture |
| Implementation gates | yes | If code changed, close primary-template and touched-surface gates; otherwise N/A | Generator, source files, generated JSON, rules, templates, and tests updated; checks passed |
| Final handoff contract | yes | Record recommendation, evidence, caveats, residual risk, and next owner | Recorded below; next owner is PR review after branch push |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent when files changed | `pnpm lint:fix` passed after Biome normalized one generator file |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | One broad diff command overflowed context; recovered with capped `git diff --name-status`, `rg`, and counts |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-registry-changelog-entry-files.md` | Passed |
| Docs source-backed claim audit | yes | Verify docs claims against current source or record N/A | N/A for public docs pages; source MDX and agent-rule text verified with `rg` |
| Docs links / routes / previews | no | Verify leaf links, routes, anchors, and preview names or record N/A | N/A: no docs route/link/preview edited |
| Docs MDX/content parser | yes | Run docs-app parser/type surface for MDX/content changes, or record N/A | `pnpm --filter www typecheck` passed and ran `fumadocs-mdx`; `pnpm check` also passed |
| Plugin page specifics | no | For plugin pages, apply `docs-creator` kit/manual/API rules; otherwise N/A | N/A: no plugin docs page edited |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | done | User request plus generator/source/tests/consumer files read | current-state map |
| Current-state map | done | Existing monolithic source, generated JSON, consumer type, and agent rules audited | options |
| Options and recommendation | done | Per-entry MDX chosen over monolith patching and JSON-first authoring | review |
| Review / pressure pass | done | Autoreview found two real defects; both fixed; final autoreview clean | implementation decision |
| Implementation or plan artifact | done | Generator, tests, source entries, generated JSON, and rules/templates updated | verification |
| Verification | done | Lint, focused tests, docs typecheck, idempotence, autoreview, and `pnpm check` passed | closeout |
| Closeout | done | Plan evidence recorded; commit/PR remains | final response |

Findings:
- Fact: `tooling/data/plate-ui-changelog.mdx` made one canonical file carry every registry changelog entry, so inserting or editing one section could shift `source.line` / `source.row` metadata for historical generated events.
- Fact: The old default generator path inferred PR/release provenance from source lines and git/GitHub state; that is useful for bootstrap, but brittle as the canonical authoring model.
- Fact: Generated consumers already read `apps/www/src/registry/changelog/*.json`, `index.json`, and `components.json`; they do not need the authoring source to stay monolithic.
- Inference: The stable unit is one changelog entry file with explicit metadata, not a global MDX ledger.
- Recommendation: Keep MDX authoring, split by entry, freeze metadata in frontmatter/comments, and continue generating the same public JSON contract.

Decisions and tradeoffs:
- Chosen: `apps/www/src/registry/changelog/entries/*.mdx` is the canonical source.
- Chosen: entry frontmatter owns event-level metadata (`change`, `release`, diagnostics, legacy release info); row comments own stable row IDs/kind/migration notes.
- Chosen: `node tooling/scripts/generate-ui-changelog-entries.mjs --write` formats generated JSON through Biome so a second run is clean.
- Rejected: keep the monolith and patch line-number churn. That leaves authoring coupled to global file position and still makes unrelated entries fragile.
- Rejected: raw JSON-first authoring. That is stable, but worse for humans and agents writing changelog prose.
- Rejected: hidden sidecar cache. That preserves the monolith but adds another state file and makes provenance harder to review.

Implementation notes:
- Added per-entry parser/generator path while retaining legacy parser support for explicit legacy sources.
- Deleted `tooling/data/plate-ui-changelog.mdx` and migrated the 20 current generated events into 20 source MDX files under `apps/www/src/registry/changelog/entries/`.
- Regenerated existing event JSON with `source.kind: "entry-mdx"` and file-relative source lines.
- Updated `apps/www/src/lib/registry-changelog.ts` source kind typing.
- Updated generated-source tests for per-entry parsing, multi-row metadata preservation, no historical churn when adding a new file, and current-entry index generation.
- Updated `.agents/rules/*`, synced `.agents/skills/*` with `pnpm install`, and updated plan templates so future agents use the new entry-source path.

Review fixes:
- Autoreview accepted finding 1: multi-row entry parsing swallowed the next row's `<!-- entry: ... -->` comment. Fixed by stopping the continuation scan before metadata comments and added coverage for second-row metadata.
- Autoreview accepted finding 2: per-entry `source.line` was body-relative while `source.path` was file-relative. Fixed by carrying frontmatter line offset through the parser and regenerated JSON with actual MDX row line numbers.
- Final autoreview: clean, no accepted/actionable findings.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Generated JSON was not idempotent before formatting | 1 | Format generated output inside the CLI write path | Added Biome format step for generated JSON and proved repeat generation keeps the same diff set |
| Biome rejected inline number regexp in frontmatter parser | 1 | Hoist regexp to a top-level constant | Added `FRONTMATTER_NUMBER_PATTERN`; `pnpm lint:fix` passed |
| Broad parallel diff inspection exceeded output context | 1 | Use capped `git diff --name-status`, `rg`, file counts, and representative diffs | Recovered with scoped/capped audits |
| Autoreview found parser swallowed multi-row metadata | 1 | Fix parser ownership of metadata comment boundaries | Fixed and tested |
| Autoreview found source lines were body-relative | 1 | Carry frontmatter line offset into row parsing | Fixed and regenerated JSON |

Verification evidence:
- `pnpm install` passed and synced generated skills after `.agents/rules/*` edits.
- `rg -n "tooling/data/plate-ui-changelog\\.mdx" .agents docs/plans/templates AGENTS.md` returns no active-rule/template hits.
- `find apps/www/src/registry/changelog/entries -name '*.mdx' | wc -l` returns `20`.
- `node tooling/scripts/generate-ui-changelog-entries.mjs --write` writes 20 events from 20 source entries.
- Repeat-generation proof passed: two consecutive `--write` runs plus `diff -u /tmp/changelog-diff-before.txt /tmp/changelog-diff-after.txt` produced no diff.
- Representative source-line proof: `apps/www/src/registry/changelog/2026-06-14-fix-shadcn-editor-kit-install-paths.json` reports row line `13`, matching the actual MDX row.
- `bun test tooling/scripts/generate-ui-changelog-entries.test.mjs` passed: 13 tests, 0 failures.
- `pnpm --filter www typecheck` passed, including docs source parity and registry source checks.
- `pnpm lint:fix` passed after Biome normalized one generator file.
- `.agents/skills/autoreview/scripts/autoreview --mode local` final run passed: clean, no accepted/actionable findings.
- `pnpm check` passed. It reported the existing sidebar hook warning and repeated `Detected multiple @platejs/core instances!` diagnostic during tests, but exited 0 with all build/typecheck/test gates green.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-registry-changelog-entry-files.md` passed.

Final handoff contract:
- Recommendation: Ship the per-entry MDX source layout.
- Confidence: high.
- Evidence: generator tests, docs typecheck, lint, idempotence proof, autoreview, and full `pnpm check` passed.
- Tests / commands: `pnpm install`; `pnpm lint:fix`; `bun test tooling/scripts/generate-ui-changelog-entries.test.mjs`; `pnpm --filter www typecheck`; repeat `node tooling/scripts/generate-ui-changelog-entries.mjs --write` diff proof; `.agents/skills/autoreview/scripts/autoreview --mode local`; `pnpm check`.
- Browser proof: N/A; tooling/data/schema change only.
- PR / tracker: branch handoff next; no external issue sync needed.
- Caveats: one-time migration rewrites existing event source metadata from the legacy monolith to per-entry files; that is intentional and should be reviewed as the migration cost.
- Next owner: PR reviewer.

Timeline:
- 2026-06-15T13:51:08.489Z Major-task goal plan created.
- 2026-06-15T14:11:00Z Implemented per-entry MDX parser/source files and generator write formatting.
- 2026-06-15T14:18:00Z Updated active agent rules/templates and synced generated skills with `pnpm install`.
- 2026-06-15T14:32:00Z Fixed autoreview metadata-comment parser finding.
- 2026-06-15T14:41:00Z Fixed autoreview file-relative line-number finding.
- 2026-06-15T14:58:00Z `pnpm check` passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout after full verification |
| Where am I going? | Commit, push, PR |
| What is the goal? | Stable per-entry registry changelog authoring without historical generated JSON churn |
| What have I learned? | Monolithic MDX line/row metadata and live inference were the root churn sources |
| What have I done? | Implemented per-entry MDX source files, regenerated artifacts, updated rules/templates, fixed review findings, and passed checks |

Open risks:
- Low: reviewers should inspect the one-time generated JSON metadata rewrite carefully, because it is intentionally broad but mostly mechanical.
