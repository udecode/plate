# Hard cut plugin name references

Objective:
Hard-cut `*pluginName` inputs to descriptor-aware `*plugin` inputs; done when current source/docs/tooling have no rejected identifiers, focused runtime/type proof passes, and this plan closes.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-01-hard-cut-plugin-name-references.md

Template:
docs/plans/templates/major-task.md

Primary template:
docs/plans/templates/major-task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)
- package-api (docs/plans/templates/packs/package-api.md)
- agent-native (docs/plans/templates/packs/agent-native.md)

Major source:
- type: explicit user-approved public API correction
- id / link: current Codex task; no external ticket
- title: Hard cut plugin-name inputs to plugin references
- decision to make: implementation only; the user already chose `Plugin | string` inputs and rejected aliases
- decision criteria: every input concept named `*pluginName` becomes `*plugin`, plural target-name inputs become `*Plugins`, descriptors preserve inference, strings remain the erased runtime path, and no compatibility API survives

Major lane:
- lane: Plate/Plite public API migration
- output type: source, type tests, runtime tests, package/app callers, docs, release notes, and agent doctrine
- implementation expected: yes; explicitly ordered by the user
- affected packages / surfaces: Core/Plite reference owners first, then all current package/app/content/tooling/rule consumers found by bounded inventory
- dominant risk: descriptor inference loss, string-only narrowing, runtime normalization drift, or leaving a second naming alternative alive

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: none requested
- semantics: N/A: no timed checkpoint
- initial confidence score: N/A: binary source/type/runtime gates are stronger
- improvement loop: continue owner-first migration, adoption sweep, proof, doctrine repair, and autoreview until zero accepted findings remain
- final score / loop closure: N/A: close only on the named binary gates

Completion threshold:
- Zero current product source, tests, apps, docs, tooling, or agent-rule identifiers using rejected `*pluginName`, `pluginNames`, or `targetPluginNames` API shapes, except explicit migration prose that must name the removed API.
- Every migrated input accepts an exact plugin/extension descriptor or `string`; descriptor inputs retain exact inferred capability/state/options typing and string inputs remain intentionally erased.
- No deprecated alias, overload, compatibility bridge, `{ name }` fallback, or string-only duplicate API remains.
- Focused runtime tests, negative/positive type tests, affected package/app typechecks, lint, release artifacts, generated skill sync, and final autoreview pass.
- Major-task closure is legal only when the decision criteria are satisfied or
  explicitly narrowed, facts/inference/recommendation are separated, required
  review or pressure passes are recorded, implementation gates are closed when
  code changed, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-01-hard-cut-plugin-name-references.md`
  passes.

Verification surface:
- Bounded `rg` inventories before and after, saved/countable by owner rather than streamed unbounded.
- Core/Plite focused runtime and type tests for descriptor/string lookup and target-plugin tuples.
- Source-first typechecks for every affected package and `apps/www`; focused registry demo browser proof if app examples change.
- Changeset checks, `pnpm brl` only if exports/layout change, `pnpm install` after source rule edits, scoped lint/Biome, `autoreview`, and `check-complete.mjs`.

Constraints:
- Start from repo evidence before external claims.
- Keep helper stack proportional.
- Separate measured evidence, source evidence, inference, and recommendation.
- Hard cut only: no aliases, deprecations, parallel string-only helpers, or migration shims.
- Preserve runtime identity and plugin topology; this task renames/reference-types inputs, not descriptor `name` or serialized node `type`.
- Fix generic inference at the owning builder/portal type; no caller casts, `any`, or callback annotations.
- Do not edit generated `.agents/skills/**/SKILL.md`; edit `.agents/rules/**` and run `pnpm install`.
- Do not widen into unrelated heading-key, toolbar-type, schema, or plugin-colocation repairs unless the migration directly requires it.

Boundaries:
- Source of truth: current checkout public types/runtime plus `VISION.md`, `docs/vision/{common,plate,plite}.md`, and `.agents/rules/{best-api,plate-next,plate-plugin-creator}.mdc`.
- Allowed edit scope: all current `packages/**`, `apps/**`, `content/**`, `tooling/**`, `.agents/rules/**`, `docs/vision/**`, tests, barrels, and `.changeset/**` consumers required by this hard cut; never `templates/**` or generated registry output.
- External sources: N/A: local public API ownership settles the change.
- Browser surface: affected standalone `/blocks/[id]-demo` route if registry examples are migrated; otherwise N/A with exact reason.
- Tracker sync: N/A: no issue/PR requested.
- Non-goals: no compatibility preservation, no unrelated API redesign, no git staging/commit/push/PR.

Output budget strategy:
- Start with counts and file lists; exclude `node_modules`, build output, caches, generated registry JSON, `templates/**`, and historical plans. Inspect matches in bounded owner batches with capped output. Save any large adoption ledger under this plan rather than streaming it.

Blocked condition:
- Block only if the same owning generic/runtime contradiction survives three distinct source-backed repair attempts or required browser/package tooling is unavailable after the repo-prescribed reinstall recovery; otherwise continue autonomously.

Major state:
- task_type: major
- task_complexity: major
- current_phase: closeout
- current_phase_status: complete
- next_phase: N/A: implementation and verification complete
- goal_status: complete

Current verdict:
- verdict: hard cut complete; one descriptor-aware plugin reference API remains
- confidence: high; source, type, runtime, package, app, docs, browser, and reviewer gates passed
- next owner: user/release owner
- reason: `plugin` names the accepted reference concept; `pluginName` falsely narrows a descriptor-aware input to strings and multiplies alternatives

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-01-hard-cut-plugin-name-references.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Exact hard-cut, `Plugin | string`, `targetPluginNames`, no-alias, scope, proof, and handoff rows recorded above |
| Timed checkpoint parsed | no | N/A: none requested |
| `major-task` loaded | yes | `.agents/skills/major-task/SKILL.md` read in this task chain |
| Active goal checked or created | yes | `get_goal` returned no active goal; creation follows this filled plan shell |
| Source of truth read before analysis | yes | targeted Vision and source-rule identity/portal doctrine read; owner source inventory is next |
| Major lane selected | yes | Plate/Plite public API migration |
| Decision criteria stated | yes | Completion threshold above |
| Existing repo patterns / prior decisions checked | yes | Vision already mandates descriptor identity plus descriptor-or-name portal lookup; stale parameter naming identified |
| Helper stack selected | yes | `best-api`, `hard-cut`, `major-task`, `autogoal`; later `changeset`, `docs-creator`, `agent-native-reviewer`, `autoreview` at their gates |
| External research decision recorded | no | N/A: local source owns the API |
| Implementation expectation recorded | yes | User explicitly said “let's cut all” |
| Workspace authority selected | yes | `/Users/zbeyens/git/plate-2` current shared checkout |
| Branch / PR expectation decided | no | N/A: no git publication requested |
| Output budget strategy recorded | yes | Count/file-list-first bounded searches above |
| Docs pack selected | yes | `docs` pack materialized; exact pages await inventory |
| `docs-creator` loaded | yes | `.agents/skills/docs-creator/SKILL.md` read before docs edits |
| Docs lane selected | yes | current-state public API reference/adoption |
| Target docs and nearest sibling docs read | yes | Current plugin, input-rule, migration, and API docs audited against source |
| Docs style doctrine read | yes | `.agents/rules/docs-creator.mdc` and skill instructions applied |
| Documented source owner identified | yes | runtime/type owner in packages plus Vision/best-api doctrine |
| Package/API pack selected | yes | `package-api` pack materialized |
| Public surface or package boundary identified | yes | plugin/extension reference inputs and target plugin collections across exported packages |
| Release artifact path selected | yes | `.changeset` required for each published package with a user-visible API/type delta; exact package matrix after inventory |
| `changeset` skill loaded when `.changeset` is required | yes | `.agents/skills/changeset/SKILL.md` read; existing release artifacts repaired |
| Barrel/export impact decision recorded | yes | Public type/export removals required `pnpm brl`; 55/55 barrel checks passed |
| Agent-native pack selected | yes | `agent-native` pack materialized |
| Agent-facing action surface identified | yes | best-api plus Plate Next/plugin-creator identity-reference doctrine |
| Source rule versus generated mirror boundary identified | yes | edit `.agents/rules/**`; regenerate `.agents/skills/**` via `pnpm install` |
| `agent-native-reviewer` loaded or waiver recorded | yes | Reviewer skill read; final agent-native and API reviews closed clean |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded.
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
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named source/type/runtime/docs/browser/reviewer proof | Zero current stale identifiers; focused 215/215 descriptor tests and final autoreview clean |
| Current-state source audit | yes | Map current owner, boundaries, constraints, and affected surfaces | Core reference owners, schemas, input rules, portals, packages, registry, docs, tooling, and doctrine audited |
| Decision criteria closure | yes | Close every accepted criterion | Descriptor or string accepted, exact inference/identity preserved, aliases and fallback serialization removed |
| Options / tradeoffs / rejection record | yes | Record chosen and rejected shapes | Chose `plugin`/`plugins`; rejected `pluginName`, `{ name }`, aliases, and serialized-type fallback |
| Review / pressure pass | yes | Run API and agent-native reviewer lenses | Multiple closure passes run; final reviewer returned no accepted/actionable findings |
| Review findings closure | yes | Fix or reject each actionable finding | Block-fence typing, family identity, unresolved-string fallback, defaults, and snapshot identity fixed and retested |
| External-source audit | no | Local source owns the public contract | N/A: no external claim or dependency decision used |
| Implementation gates | yes | Close code, docs, package, browser, and agent packs | All named focused gates passed; broad unrelated failures disclosed below |
| Final handoff contract | yes | Record recommendation, evidence, caveats, and owner | Recorded below |
| Final lint | yes | Run scoped formatter/lint | Biome checked 100 hard-cut files with no fixes; full lint blockers are unrelated shared artifacts |
| Output budget discipline | yes | Keep broad scans bounded | One initial truncated scan was recovered with owner-scoped capped scans; final scans are bounded |
| Timed checkpoint | no | No duration requested | N/A: binary proof gates governed closure |
| Goal plan complete | yes | Run goal checker | Final checker command is the last closeout command |
| Docs source-backed claim audit | yes | Verify docs against current source | Public plugin, target, schema, and input-rule examples match current APIs |
| Docs links / routes / previews | yes | Verify affected routes | Standalone editor-ai and toggle demos loaded successfully in Browser |
| Docs MDX/content parser | yes | Run www source build | `pnpm --filter www build:source` passed, including docs source parity |
| Plugin page specifics | yes | Apply current-state plugin docs rules | Current-state docs updated; historical migration prose retained only where intentional |
| Public API / package boundary proof | yes | Audit exports and inference | Core typecheck, package graph, compile-only tests, and `pnpm brl` passed |
| Release artifact classification | yes | Classify published deltas | Breaking public package API/type delta; existing package changesets repaired to final contract |
| Published package changeset | yes | Verify release status | `changeset status --since=main`: affected public packages are major; no Core/Plate minor bump |
| Registry changelog | no | Registry edits are adoption of package API | N/A: package hard cut owns release communication; no registry-only feature |
| No release artifact | no | Published user-visible delta exists | N/A: release artifacts are required and present |
| Package typecheck/build/test | yes | Run owning package checks | 96/96 package typecheck tasks; focused runtime packets 95/95, 110/110, and 215/215 |
| Barrel/export generation | yes | Regenerate/check barrels | `pnpm brl` passed 55/55 |
| Agent source / generated sync | yes | Regenerate skills and validate version registry | `pnpm install`; Plate Next v42 registry valid; doctrine fingerprint matches v42 |
| Agent action discoverability | yes | Audit source rules and generated skill | Best API, Plate Next, plugin creator, docs, Plate UI, and Vision describe descriptor-first inputs |
| Agent-native review | yes | Close reviewer findings | Final autoreview clean; no accepted/actionable findings |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | prompt, skills, Vision, doctrine, and source owners read | done |
| Current-state map | complete | bounded inventory across package/app/docs/tooling/rules | done |
| Options and recommendation | complete | descriptor-or-string winner; alternatives rejected | done |
| Review / pressure pass | complete | API, agent-native, and final autoreview passes | done |
| Implementation or plan artifact | complete | owner-first hard cut adopted across current surfaces | done |
| Verification | complete | type, runtime, docs, browser, lint, changeset, barrels, and zero scans | done |
| Closeout | complete | ledger and exact residual caveat recorded | final response |

Findings:
- Source doctrine already distinguishes descriptor `name` from serialized node `type` and allows descriptor-or-runtime-name lookup, but stale APIs encode the string representation into identifiers such as `pluginName` and `targetPluginNames`.
- The accepted public noun is `plugin`; exact descriptor inputs preserve inference and `string` remains the dynamic erased path.

Decisions and tradeoffs:
- Hard cut `*pluginName`/`*pluginNames` to `*plugin`/`*plugins` -> one concept and one input path -> breaking adoption is intentional.
- Keep descriptor `name` and node `type` unchanged -> they are real identities, not lookup-parameter alternatives -> avoids conflating this cut with the prior `key` to `name` migration.
- Do not expose `{ name }` as another lookup shape -> it recreates alternatives without better inference.

Implementation notes:
- Renamed target and parameter concepts to `plugin`/`plugins`; `targetPluginNames` is `targetPlugins`.
- Public reference inputs accept an exact `PluginReference` or dynamic `string`; exact descriptors retain inferred options/state/API types.
- Schema references and input rules resolve serialized identity only through an installed portal's `.type`; unresolved names no-op.
- Descriptor family identity survives configure, snapshot, state, merge, publication, exclusions, and target resolution.
- Removed `PluginName<T>`, `NodePluginName<T>`, `KnownPluginName`, `elementTypesByName`, name-only helpers, and duplicate input-rule identities.
- Updated production defaults, consumers, type/runtime fixtures, docs, changesets, exports, and agent doctrine.
- Plate Next doctrine advanced to v42; package attestations remain truthfully stale until each package is separately synced.

Review fixes:
- Fixed descriptor atomicity through clone/snapshot/publication rather than weakening nominal identity.
- Fixed block-fence descriptor typing and removed name fallback into serialized mark/block types.
- Added family verification for target plugins, schema references, and exclusion matching.
- Replaced CodeBlock/Math serialized node defaults with paragraph plugin references.
- Closed declaration inference regressions without casts or callback annotations.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Initial doctrine `rg` streamed more matches than intended and was truncated | 1 | use counts/file lists and narrow owner slices only | recovered; no source edits occurred |
| Descriptor cloning initially lost nominal family identity | 1 | repair the shared clone/snapshot owner and add cross-family tests | fixed; 215/215 descriptor snapshot packet passed |
| Basic-styles matcher exposed a narrowed generic | 1 | repair owner inference instead of annotating callers | fixed; full package typecheck passed |
| Full `pnpm lint:fix` reported 233 diagnostics in unrelated editor-audit/Wordgard shared artifacts | 1 | run scoped Biome over the hard-cut file set | 100 files clean; unrelated files left untouched |
| `bun run test` broad fast suite failed in unrelated Yjs authority and collaboration demo WIP | 1 | verify file diffs and run owning hard-cut focused suites | neither failure uses the migrated reference API; focused hard-cut suites pass |

Verification evidence:
- Final stale scans: zero current `pluginName`, `pluginNames`, `targetPluginNames`, `elementTypesByName`, removed name aliases/helpers, descriptor `.name` targets, or `NODES.*` input-rule identities outside explicit migration history and the legacy changelog.
- Core focused packet: 95 pass, 0 fail, 303 expectations.
- Core + CodeBlock + Math focused packet: 110 pass, 0 fail; 14/14 typecheck tasks.
- Cross-package descriptor snapshot packet: 215 pass, 0 fail, 426 expectations.
- Tooling/docs contract packet: 93 pass, 0 fail.
- All package source-first typechecks: 96/96 tasks across 58 packages.
- `pnpm --filter www typecheck`: source build, docs parity, registry source, app TypeScript, and package integration passed.
- `pnpm brl`: 55/55 passed. Scoped Biome: 100 files checked, no fixes.
- Plate Next registry validates at v42 with doctrine fingerprint `sha256:e45e5c9a49f73340a577e17f8ce752d9530171818cce38c58c04d6bd91940bb0`.
- Browser: `/blocks/editor-ai` and `/blocks/toggle-demo` returned 200 and rendered editors; only the existing React script-tag warning appeared.
- Final autoreview: clean, no accepted/actionable findings; reported correctness probability 0.73.
- Broad `bun run test` remains red only in separately modified Yjs shared-effect authority tests and collaboration-demo mocking; exact focused migration proof is green.

Final handoff contract:
- Recommendation: ship the single `plugin`/`plugins` descriptor-or-string contract; do not restore name-shaped alternatives.
- Confidence: high.
- Evidence: zero scans plus nominal identity, unresolved-name, input-rule serialization, declaration inference, package/app, docs, and browser proof above.
- Tests / commands: focused runtime 95/95, 110/110, 215/215; package typecheck 96/96; www typecheck; docs/tooling 93/93; barrels 55/55; scoped Biome 100 files.
- Browser proof: editor-ai and toggle standalone demos rendered successfully.
- PR / tracker: N/A: user did not request git publication or external tracker mutation.
- Caveats: broad fast suite has unrelated shared Yjs/collaboration-demo failures; package attestations intentionally remain stale rather than falsely marking v42 synced.
- Next owner: user/release owner.

Timeline:
- 2026-08-01T07:17:21.451Z Major-task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Intake and source read |
| Where am I going? | Final response; implementation and proof are complete |
| What is the goal? | Hard-cut all plugin-name-shaped inputs to descriptor-aware plugin references with no aliases |
| What have I learned? | Exact descriptor identity must survive publication; strings are dynamic names, never serialized node types |
| What have I done? | Completed the hard cut across source, tests, apps, docs, tooling, changesets, exports, and doctrine, then verified it |

Open risks:
- Broad repository fast tests are not globally green because separately modified Yjs authority and collaboration-demo tests fail; neither owner references this API migration.
- Plate Next v42 intentionally reports 42 stale package attestations. That is accurate sync debt, not an implementation failure.
