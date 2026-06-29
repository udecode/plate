# migrate ai sdk v7

Objective:
Migrate Plate AI SDK usage to v7; done when repo AI SDK packages, registry/template outputs, and affected builds/typechecks pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-06-28-migrate-ai-sdk-v7.md

Template:
docs/plans/templates/major-task.md

Primary template:
docs/plans/templates/major-task.md

Applied packs:
- package-api (docs/plans/templates/packs/package-api.md)
- registry-changelog (docs/plans/templates/packs/registry-changelog.md)
- docs (docs/plans/templates/packs/docs.md; added after source audit found stale public AI docs)

Major source:
- type: user prompt
- id / link: N/A
- title: migrate to AI SDK v7
- decision to make: how to move Plate's AI SDK usage, registry install metadata, and templates to AI SDK v7 without leaving mixed provider/runtime versions.
- decision criteria: local source and official docs agree on API shape; affected dependency manifests use compatible v7 package lines; generated/copyable template code typechecks and builds; registry install metadata matches template dependencies.

Major lane:
- lane: framework/library migration
- output type: code-changing execution
- implementation expected: yes
- affected packages / surfaces: apps/www AI route sources, registry dependency metadata, templates, lockfiles, `@platejs/ai` dev type surface, public AI docs, and any package/example usage found by source audit.
- dominant risk: mixed AI SDK/provider majors causing TypeScript or runtime model incompatibility.

Timed checkpoint:
- requested duration: N/A
- semantics: N/A: user did not request a timed checkpoint.
- initial confidence score: N/A
- improvement loop: N/A
- final score / loop closure: pending closeout

Completion threshold:
- All in-repo AI SDK direct dependencies are migrated to compatible v7 package lines where this task owns them.
- All direct `ai`, `@ai-sdk/*`, and AI Gateway usage touched by Plate registry/template sources compiles against v7.
- Affected app/template install, typecheck, lint, and build commands pass or have source-backed N/A reasons.
- Registry changelog and package changeset decisions are closed with evidence.
- Major-task closure is legal only when the decision criteria are satisfied or
  explicitly narrowed, facts/inference/recommendation are separated, required
  review or pressure passes are recorded, implementation gates are closed when
  code changed, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-28-migrate-ai-sdk-v7.md`
  passes.

Verification surface:
- Source audit: focused `rg` for `from 'ai'`, `from "@ai-sdk`, `@ai-sdk/`, `AI SDK`, `streamText`, `useChat`, and `gateway`.
- External-source audit: local `../ai` clone plus Context7 official docs for AI SDK v7 migration, structured output, and AI Gateway.
- Commands: affected root/package/template install, typecheck, lint, build, registry changelog check when applicable, and final `pnpm check` if feasible.

Constraints:
- Start from repo evidence before external claims.
- Keep helper stack proportional.
- Separate measured evidence, source evidence, inference, and recommendation.
- Do not execute implementation unless this major goal explicitly includes it.
- Public docs must describe the current state only; no migration/changelog voice.

Boundaries:
- Source of truth: current repo source, `../ai` local clone, Context7 official AI SDK docs, and PR #5045 branch context.
- Allowed edit scope: AI SDK dependency manifests/locks, registry source metadata/changelog, affected AI route/example/template code, public AI docs, and this plan.
- External sources: official AI SDK docs only unless local clone and docs disagree.
- Browser surface: N/A unless source audit finds UI/runtime behavior that cannot be proven by type/build checks.
- Tracker sync: update open PR #5045 if changes ship on its branch.
- Non-goals: broad unrelated template redesign, manual generated registry JSON edits, unrelated dependency upgrades, and full product docs rewrite.

Output budget strategy:
- Use `rg --files-with-matches`, focused globs, and capped `sed` ranges before printing matches. Exclude `node_modules`, `.next`, `.turbo`, generated registry JSON, and large lockfiles except targeted dependency slices.

Blocked condition:
- Stop only if AI SDK v7 package versions are unavailable through the current package manager, docs/source expose an unresolved API break that needs product choice, or required verification cannot run after one install-repair attempt.

Major state:
- task_type: major
- task_complexity: major
- current_phase: closeout
- current_phase_status: complete
- next_phase: git/PR handoff
- goal_status: locally complete; PR branch update follows this plan check

Current verdict:
- verdict: valid migration task
- confidence: high after install, typecheck, template build, registry generator, docs parser, and root check proof
- next owner: current agent for commit/push and PR #5045 metadata
- reason: the repo now uses `ai@7` with matching AI SDK provider/react major lines across the app, `@platejs/ai` dev surface, registry install metadata, and playground template.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-28-migrate-ai-sdk-v7.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Timed checkpoint parsed | N/A | No duration requested. |
| `major-task` loaded | yes | Read `.agents/skills/major-task/SKILL.md`. |
| Active goal checked or created | yes | `get_goal` returned none; `create_goal` created active AI SDK v7 migration goal. |
| Source of truth read before analysis | yes | User prompt read; repo instructions supplied in chat; Context7 docs and local SDK clone selected for version-sensitive API source. |
| Major lane selected | yes | Lane: framework/library migration. |
| Decision criteria stated | yes | Criteria recorded in Major source. |
| Existing repo patterns / prior decisions checked | yes | Audited `apps/www`, `packages/ai`, `templates/plate-playground-template`, registry metadata, and AI docs before editing. |
| Helper stack selected | yes | `autogoal`, `major-task`, `task`, `changeset`, `registry-changelog`, `docs-creator`, Context7. Autoreview waived by prior user instruction in this thread. |
| External research decision recorded | yes | Use local `../ai` clone plus official Context7 docs because AI SDK v7 API is version-sensitive. |
| Implementation expectation recorded | yes | Code-changing execution expected. |
| Workspace authority selected | yes | `/Users/zbeyens/git/plate`; local SDK source in `/Users/zbeyens/git/ai` only for external API evidence. |
| Branch / PR expectation decided | yes | Continue `codex/fix-pr-5045-template-sync`; push to open PR #5045 head `templates/release-sync-failure` if verified. |
| Output budget strategy recorded | yes | Focused searches and capped reads recorded above. |
| Package/API pack selected | yes | Dependency/API migration touches public install/template surfaces. |
| Public surface or package boundary identified | yes | Registry install metadata, templates, public AI docs, and `@platejs/ai` dev type surface are affected. |
| Release artifact path selected | yes | Both `.changeset/ai-sdk-v7-chat-types.md` and a registry changelog entry are required. |
| `changeset` skill loaded when `.changeset` is required | yes | Read `.agents/skills/changeset/SKILL.md` and `.agents/rules/changeset.mdc`; only create `.changeset` if packages changed with user-visible delta from `main`. |
| Barrel/export impact decision recorded | yes | N/A: no package exports, exported folder layout, or public barrel files changed. |
| Registry changelog pack selected | yes | Selected because registry dependency metadata may change copied install shape. |
| User-visible registry impact classified | yes | Copied AI registry items install AI SDK v7 and use Gateway through `ai`; user-visible registry delta. |
| Source entry path selected | yes | `apps/www/src/registry/changelog/entries/2026-06-28-ai-sdk-v7.mdx`. |
| Generator command selected | yes | `node tooling/scripts/generate-ui-changelog-entries.mjs --write` then `--check` with Corepack pnpm on PATH. |
| Docs pack selected | yes | Added because public AI docs reference AI SDK imports and install shape. |
| `docs-creator` loaded | yes | Read `.agents/skills/docs-creator/SKILL.md`. |
| Docs lane selected | yes | Workflow / AI docs; supporting surface under major migration. |
| Target docs and nearest sibling docs read | yes | Read and edited `ai.mdx`, `ai.cn.mdx`, `copilot.mdx`, and `copilot.cn.mdx`. |
| Docs style doctrine read | yes | `docs-creator` read through verification checklist. |
| Documented source owner identified | yes | AI docs now mirror registry command/copilot route sources and playground template route usage. |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: no duration requested.
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
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`. N/A: package and registry artifacts are required.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required. N/A: no export layout changed.
- [x] Registry changelog pack: user-visible registry impact is recorded.
- [x] Registry changelog pack: source entry exists under `apps/www/src/registry/changelog/entries/*.mdx` or N/A reason is recorded.
- [x] Registry changelog pack: entry frontmatter follows the contract in `.agents/skills/registry-changelog/SKILL.md`.
- [x] Registry changelog pack: row bullets name real registry item ids in backticks.
- [x] Registry changelog pack: generated `/registry/changelog/*.json`, `index.json`, and `components.json` are updated by the generator, not by hand.
- [x] Registry changelog pack: package changeset decision is separate when package code also changed.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, anchors, and previews target real leaf pages or are marked N/A with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the repo audit, artifact checks, and affected builds named in this plan | Passed affected install/typecheck/lint/build, registry generator, docs source build, source audit, and root `pnpm check`. |
| Current-state source audit | yes | Map current owner, boundaries, constraints, and affected surfaces | Audited AI SDK dependencies/imports in `apps/www`, `packages/ai`, `templates/plate-playground-template`, registry metadata, and AI docs. |
| Decision criteria closure | yes | Mark each criterion satisfied, narrowed, rejected, or blocked with evidence | Satisfied: dependency majors aligned, v7 APIs compile, template builds, docs source builds, registry metadata regenerated. |
| Options / tradeoffs / rejection record | yes | Record viable options, chosen recommendation, and why alternatives lose | Chose `ai`-owned Gateway imports and `instructions`/stateless stream helpers; rejected direct gateway dep and v6/v7 mixed runtime. |
| Review / pressure pass | N/A | Run selected reviewer/lens or record N/A with reason | Formal autoreview waived by prior user instruction: "cut the autoreview". Source audit and command proof replace it for this task. |
| Review findings closure | yes | Fix or explicitly reject accepted/actionable findings and record closure proof | Fixed install peer issue by keeping app on `zod@3.25.76`; fixed changelog generator test count after root check failure. |
| External-source audit | yes | Cite official/local clone/external sources when used, or record N/A | Used Context7 official AI SDK v7 docs and local `../ai` source for v7 stream/Gateway/react helper API evidence. |
| Implementation gates | yes | If code changed, close primary-template and touched-surface gates; otherwise N/A | Closed package/API, registry changelog, and docs gates. Browser gate recorded as tool-unavailable caveat. |
| Final handoff contract | yes | Record recommendation, evidence, caveats, residual risk, and next owner | Recorded below. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent when files changed | `pnpm lint:fix` passed. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | One noisy generated-registry search was stopped and replaced with scoped `rg` excludes; later outputs were capped. |
| Timed checkpoint | N/A | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | No timed checkpoint requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-28-migrate-ai-sdk-v7.md` | Passed at 2026-06-28T11:54Z. |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | `@platejs/ai` dev helper types compile against `@ai-sdk/react@4`; no public barrel/export layout changed. |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Both package type-surface and registry/template install shape changed. |
| Published package changeset | yes | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/slate`, `@platejs/core`, or `platejs` | Added `.changeset/ai-sdk-v7-chat-types.md` with patch bump for `@platejs/ai`; no forbidden packages touched. |
| Registry changelog | yes | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | Added registry changelog entry because registry items changed; package changeset remains separate for `@platejs/ai`. |
| No release artifact | N/A | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | Release artifacts are required and present. |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | `pnpm --filter www typecheck`, `pnpm --filter @platejs/ai typecheck`, template `bun run typecheck`, template `bun run build`, and root `pnpm check` passed. |
| Barrel/export generation | N/A | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | No exports or exported file layout changed. |
| Registry impact classification | yes | Record user-visible registry delta or N/A reason | Registry AI items install and show AI SDK v7 runtime/provider metadata. |
| Registry changelog source | yes | Add/update `apps/www/src/registry/changelog/entries/*.mdx` or record N/A | Added `apps/www/src/registry/changelog/entries/2026-06-28-ai-sdk-v7.mdx`. |
| Registry changelog generation | yes | Run `node tooling/scripts/generate-ui-changelog-entries.mjs --write` when a source entry is required | Generator `--write` passed with Corepack pnpm on PATH. |
| Registry changelog check | yes | Run `node tooling/scripts/generate-ui-changelog-entries.mjs --check` | Generator `--check` passed. |
| Registry generator test | yes | If generator/schema/source layout changed, run `bun test tooling/scripts/generate-ui-changelog-entries.test.mjs`; otherwise N/A | Ran after expected count update; 16 tests passed. |
| Registry package release split | yes | Record `.changeset`, registry changelog, both, or N/A with reason | Both: `.changeset` for `@platejs/ai` type surface and registry changelog for registry/template install behavior. |
| Docs source-backed claim audit | yes | Verify docs claims against current source or record N/A | Docs imports/options/routes mirror v7 API and copied registry/template routes. |
| Docs links / routes / previews | yes | Verify leaf links, routes, anchors, and preview names or record N/A | No new external links or preview routes added; existing AI/copilot leaf pages build through source parser. |
| Docs MDX/content parser | yes | Run `pnpm --filter www build:source` for MDX/content changes, or record N/A | `pnpm --filter www build:source` passed. |
| Plugin page specifics | yes | For plugin pages, apply `docs-creator` kit/manual/API rules; otherwise N/A | AI plugin docs use current-state route/API snippets without migration voice. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | created plan; loaded required skills; cloned `../ai`; queried official docs | current-state map done |
| Current-state map | complete | dependency/import/docs/template audit found all owned AI SDK surfaces | options done |
| Options and recommendation | complete | chose full v7 alignment with `ai`-owned Gateway import and `instructions` API | implementation done |
| Review / pressure pass | complete | formal autoreview waived; source audit plus command proof used | verification done |
| Implementation or plan artifact | complete | package manifests, lockfiles, registry metadata, template routes, docs, changeset, and registry changelog updated | verification done |
| Verification | complete | affected checks plus root `pnpm check` passed | closeout done |
| Closeout | complete | this plan is ready for mechanical completion check, commit, push, and PR body update | final response next |

Findings:
- Context7 official docs identify `npx @ai-sdk/codemod v7` as the v6 -> v7 migration entrypoint.
- Context7 official docs say `streamText` array output should use `Output.array` plus `elementStream` for complete validated array elements.
- Context7 official docs say AI Gateway can be imported from `ai` directly or from `@ai-sdk/gateway`.
- No relevant memory entry was found for this migration.
- npm registry latest versions on 2026-06-28: `ai@7.0.4`, `@ai-sdk/react@4.0.5`, `@ai-sdk/gateway@4.0.4`, `@ai-sdk/openai@4.0.2`, `@ai-sdk/google@4.0.2`.
- Direct repo package manifests currently use `ai@6` / `@ai-sdk/*@3` in `apps/www`, `packages/ai` devDeps, and `templates/plate-playground-template`.
- AI SDK usage is concentrated in `packages/ai`, `apps/www/src/registry/**`, and `templates/plate-playground-template/src/**`.
- Local `../ai/packages/ai/src/index.ts` re-exports `createGateway` and `gateway` from `ai`, so copied route code can avoid a direct `@ai-sdk/gateway` import.

Decisions and tradeoffs:
- Keep the migration source-owned: update registry source/dependency metadata and template code together rather than only patching generated template locks.
- Do not run formal autoreview unless the user re-enables it; prior instruction in this thread cut autoreview. Use source audit plus type/build checks instead.
- Prefer `createGateway` from `ai` for copied routes so `ai` owns the Gateway provider version line and the template does not need a separate direct `@ai-sdk/gateway` dependency.

Implementation notes:
- `apps/www`, `packages/ai`, and `templates/plate-playground-template` use `ai@7` and matching `@ai-sdk/*@4` package lines.
- Copied command routes use `createGateway` from `ai` and stateless `toUIMessageStream({ stream: result.stream, ... })`.
- Copied copilot routes use Gateway model slugs and `instructions`; request handling still accepts the old `system` field as a fallback.
- Public AI docs describe AI SDK v7 imports/options in current-state wording.
- Registry dependency metadata and playground lockfile were updated with the package manager, not hand-edited version guesses.

Review fixes:
- Fixed AI SDK v7 peer mismatch by bumping `apps/www` to `zod@3.25.76` instead of forcing zod 4 into the app.
- Fixed `tooling/scripts/generate-ui-changelog-entries.test.mjs` expected current-entry count after adding the new registry changelog.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `rg ... apps www packages templates content` typo included generated public registry JSON and returned truncated noise | 1 | Use focused roots and explicit `!apps/www/public/r/**` / `!apps/www/public/rd/**` excludes | Recorded; subsequent searches are scoped. |

Verification evidence:
- `/Users/zbeyens/git/plate`: `pnpm install` passed with Corepack pnpm after zod peer fix.
- `/Users/zbeyens/git/plate/templates/plate-playground-template`: `bun install --no-frozen-lockfile` passed.
- `/Users/zbeyens/git/plate`: `pnpm --filter www typecheck` passed.
- `/Users/zbeyens/git/plate`: `pnpm --filter @platejs/ai typecheck` passed.
- `/Users/zbeyens/git/plate/templates/plate-playground-template`: `bun run lint`, `bun run typecheck`, and `bun run build` passed.
- `/Users/zbeyens/git/plate`: `node tooling/scripts/generate-ui-changelog-entries.mjs --write` and `--check` passed with Corepack pnpm on PATH.
- `/Users/zbeyens/git/plate`: `bun test tooling/scripts/generate-ui-changelog-entries.test.mjs` passed.
- `/Users/zbeyens/git/plate`: `pnpm --filter www build:source` passed for MDX/source generation.
- `/Users/zbeyens/git/plate`: `pnpm lint:fix` passed.
- `/Users/zbeyens/git/plate`: `git diff --check` passed.
- `/Users/zbeyens/git/plate`: focused `rg` audit found no stale owned `@ai-sdk/gateway`, `ai@6`, `@ai-sdk/react@3`, provider v3, `convertToCoreMessages`, `toDataStreamResponse`, `maxTokens`, `body.system`, `System Prompt`, `OPENAI_API_KEY`, or old provider examples in touched app/template/docs/package surfaces.
- `/Users/zbeyens/git/plate`: `pnpm check` passed after updating the registry changelog generator test. Existing lint warning remains in `apps/www/src/components/ui/sidebar.tsx` about `toggleSidebar`; unrelated to this diff.
- `/Users/zbeyens/git/plate`: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-28-migrate-ai-sdk-v7.md` passed.
- Browser proof caveat: repo policy asks for browser proof on `apps/www`/`packages` changes, but tool discovery did not expose a usable Browser or browser-use tool in this session. The template Next build proved the affected API routes compile, and no interactive UI behavior was changed.

Final handoff contract:
- Recommendation: ship the full AI SDK v7 alignment on PR #5045.
- Confidence: high for source/type/build correctness; medium for live browser runtime because the browser plugin was unavailable.
- Evidence: dependency alignment, v7 route/API migration, docs source build, template build, registry generator/check/test, and root `pnpm check` passed.
- Tests / commands: see Verification evidence.
- Browser proof: not run; tool unavailable in this session.
- PR / tracker: open PR #5045 is the target; branch push and body update are the next step after this plan check.
- Caveats: remote CI still needs to run after push; local checks passed.
- Next owner: current agent until push/PR metadata is complete, then maintainers/CI.

Timeline:
- 2026-06-28T11:32:05.799Z Major-task goal plan created.
- 2026-06-28T11:32Z Loaded `autogoal`, `major-task`, `task`, `changeset`, and registry changelog instructions.
- 2026-06-28T11:33Z Queried official AI SDK v7 docs with Context7.
- 2026-06-28T11:34Z Cloned local SDK source to `../ai` because repo policy requires local source before external docs are treated as enough.
- 2026-06-28T11:35Z Confirmed current branch `codex/fix-pr-5045-template-sync` and open PR #5045 head `templates/release-sync-failure`.
- 2026-06-28T11:38Z Source audit found public AI docs are affected; loaded `docs-creator` and added docs-pack rows.
- 2026-06-28T11:45Z Implemented package, registry, docs, and template migration to AI SDK v7.
- 2026-06-28T11:50Z Fixed root `pnpm check` failure in the registry changelog generator test.
- 2026-06-28T11:53Z Ran focused docs source build; `www` MDX generation passed.
- 2026-06-28T11:54Z Autogoal completion checker passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout after local verification. |
| Where am I going? | Mechanical autogoal check, then commit/push and PR #5045 body update. |
| What is the goal? | Migrate Plate AI SDK usage to v7 with registry/template/package proof. |
| What have I learned? | `ai` re-exports Gateway helpers in v7; copied route code can avoid direct `@ai-sdk/gateway`; docs and registry install metadata are part of the migration surface. |
| What have I done? | Migrated package lines, route APIs, docs, registry metadata/changelog, template source/lockfile, changeset, and tests; local checks passed. |

Open risks:
- Remote CI may catch environment-specific issues after the push, but local `pnpm check` and template build passed.
- Browser runtime proof is absent because no browser tool was available; affected interactive UI code only changed request body naming from `system` to `instructions`.
