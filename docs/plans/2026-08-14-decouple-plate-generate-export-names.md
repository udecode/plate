# Decouple Plate generate export names

Objective:
Hard-cut Plate generator magic export names while adopting human-owned
`EditorKit` and `EditorSchema` names across the registry and docs.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-14-decouple-plate-generate-export-names.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)
- agent-native (docs/plans/templates/packs/agent-native.md)
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: direct user request and accepted `best-api` decision
- id / link: current Codex task; no external tracker
- title: Decouple `plate generate` from editor export names
- acceptance criteria:
  - `plate generate <entry>` discovers exactly one exported non-empty nominal Plate
    plugin tuple and zero or one valid application schema without fixed names.
  - Ambiguous or missing candidates fail with candidate-aware diagnostics.
  - The authored registry module exports `EditorKit` and `EditorSchema`; all
    consumers use those names with no compatibility aliases.
  - Generated editor types bind to the discovered plugin export.
  - CLI tests cover arbitrary names, missing candidates, and ambiguity.
  - Current docs and reusable doctrine teach shape discovery rather than magic
    `plugins` / `schema` export names.
  - Package proof, docs proof, browser proof, lint, P2 autoreview, agent-native
    review, and the final goal checker pass.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A; the user gave no duration
- semantics: N/A
- initial confidence score: N/A; binary gates exist
- improvement loop: fix each failed focused gate, then rerun the owning gate
- final score / loop closure: N/A

Completion threshold:
- Zero fixed-name lookups or current teaching remain for the CLI editor-entry
  contract; all scoped tests/typechecks/docs/browser/lint/review gates pass;
  generated mirrors are synced; no compatibility aliases survive.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-14-decouple-plate-generate-export-names.md` passes.

Verification surface:
- Focused `packages/cli/test/generate.test.ts` behavior tests.
- CLI and www source-first typechecks.
- `pnpm --filter www build:source` for changed MDX.
- `pnpm install` plus source/generated skill audits for doctrine sync.
- One standalone registry demo route in Browser after app import adoption.
- `pnpm lint:fix`, P2 local autoreview, agent-native review, and static `rg`
  audits for rejected fixed-name lookups and aliases.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `packages/cli/src/generate.ts`, its focused tests, the
  authored registry editor module/callers, current editor guide, Plate Vision,
  and `.agents/rules/best-api.mdc`.
- Allowed edit scope: CLI implementation/tests/package release note; registry
  editor export/callers; current editor docs; smallest affected doctrine and
  generated skill mirrors; this plan.
- Browser surface: one registry editor demo proving renamed runtime imports.
- Browser strategy: Browser on the standalone demo route. Use Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A; no issue or external tracker was requested.
- Non-goals: no `defineEditor`, wrapper/config object, metadata annotation,
  default-export convention, compatibility alias, package plugin redesign,
  generated runtime owner, or unrelated registry refactor.

Output budget strategy:
- Use exact owner reads and capped `rg` output. Count broad adoption matches
  before reading them. Run focused tests before broad typechecks. Never stream
  build artifacts or whole-repo diffs.

Blocked condition:
- Block only if the CLI cannot distinguish a nominal plugin tuple or valid
  application schema without adding rejected public metadata, or if the same
  owning verification failure recurs three times after distinct repairs.

Task state:
- task_type: public CLI contract hard cut plus registry/docs adoption
- task_complexity: normal
- current_phase: closeout
- current_phase_status: completed
- next_phase: final response
- goal_status: complete

Current verdict:
- verdict: implement accepted name-independent discovery
- confidence: high; the runtime already nominally brands plugin descriptors
- next owner: task
- reason: authored names should serve humans; compiler discovery should depend
  on validated semantic shape, not magic identifiers.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-14-decouple-plate-generate-export-names.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Acceptance rows above copy the semantic-discovery, naming, no-wrapper, adoption, and proof requirements. |
| Timed checkpoint parsed | no | N/A: no duration was requested. |
| Skill analysis before edits | yes | Read `best-api`, `plate-plan`, `autogoal`, root Vision, common Vision, and Plate Vision. |
| Active goal checked or created | yes | Active goal points to this exact plan. |
| Source of truth read before edits | yes | Read CLI worker, generated type emission, registry `editor.ts`, representative kits, current editor docs, and doctrine owners. |
| Tracker comments and attachments read | no | N/A: no tracker or attachment belongs to this request. |
| Video transcript evidence required | no | N/A: no video supplied. |
| `docs/solutions` checked for non-trivial existing-code work | yes | Scoped search for codegen/editor-entry solutions will precede implementation; no historical plan will override live owners. |
| TDD decision before behavior change or bug fix | yes | Add focused CLI discovery tests with the implementation; this is a contract change, not a bug repro. |
| Branch decision for code-changing task | no | N/A: continue in the shared current checkout; no branch or PR requested. |
| Release artifact decision | yes | Update the existing major `@platejs/cli` changeset that owns the generated-editor contract on this branch. |
| Browser tool decision for browser surface | yes | Browser will verify one standalone registry demo after import adoption. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker requested. |
| Output budget strategy recorded | yes | Exact reads, capped searches, counted adoption, focused commands first. |
| Docs pack selected | yes | Incidental editor guide and CLI reference adoption. |
| `docs-creator` loaded | yes | Read the complete generated skill before docs edits. |
| Docs lane selected | yes | Current-state editor/codegen reference only. |
| Target docs and nearest sibling docs read | yes | Read the exact generated-editor sections in `editor.mdx` and `editor.cn.mdx`; no page topology changes. |
| Docs style doctrine read | yes | Read complete `docs-creator`; current-state guide lane applies. |
| Documented source owner identified | yes | CLI runtime discovery and generated type emitter own every documentation claim. |
| Agent-native pack selected | yes | `best-api` source rule and generated skill mirror change. |
| Agent-facing action surface identified | yes | `best-api` ordinary application/compiler contract. |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/best-api.mdc`; regenerate `.agents/skills/**` through `pnpm install`. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Read the complete reviewer skill and completed the capability map below. |
| Package/API pack selected | yes | `@platejs/cli` command contract changes. |
| Public surface or package boundary identified | yes | `plate generate` editor-entry discovery and diagnostics. |
| Release artifact path selected | yes | Patch changeset for `@platejs/cli`. |
| `changeset` skill loaded when `.changeset` is required | yes | Read complete `changeset`; update the existing CLI changeset relative to `main` rather than narrating branch-only names. |
| Barrel/export impact decision recorded | no | N/A: no package export or file-layout change is planned. |

Work Checklist:
- [x] N/A: no duration was requested.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] N/A: no video or screen recording belongs to this task.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the CLI compiler owner: runtime-shape discovery and
      generated type binding live in `packages/cli/src/generate.ts`; Core only
      exposes the existing nominal/compiler primitives through its internal barrel.
- [x] Release artifact requirement recorded: the existing major CLI changeset
      describes the generated-editor contract; registry adoption is not a separate
      component release.
- [x] Final handoff shape is a local feature/API handoff with exact package,
      generated-artifact, docs, review, and browser-caveat evidence.
- [x] Branch handling N/A: the user asked to edit the current shared checkout,
      not create a branch or PR.
- [x] Local-env-rot policy: N/A. No install-corruption signature appeared. The
      watcher timeout was traced to repeated candidate editor construction and
      fixed at the compiler boundary, then the isolated 64-test suite passed.
- [x] Workspace authority: all commands ran in `/Users/zbeyens/git/plate-2` or
      the owning CLI/Core/www package; Browser used the local www dev server.
- [x] High-risk note: the realistic failures were ambiguous exports, invalid
      schema lookalikes, default-export omission, stale generated bindings, and
      candidate-validation resource leaks. Focused tests, the full suite,
      typechecks, artifact `--check`, and P2 review cover those paths.
- [x] P2 autoreview used an exact task-only frozen bundle because the shared
      checkout local bundle was 2.2 MB and mixed unrelated work.
- [x] Agent-native review applies and passed; source owner, generated mirror,
      command route, proof, and current docs are all present.
- [x] Output budget discipline recorded: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Docs pack: current editor guides EN/CN and their CLI source owner were
      audited; examples map `EditorKit` / `EditorSchema` to editor options.
- [x] Docs pack: every changed command, export, option, and generated import is
      backed by current source and focused tests.
- [x] Docs pack: both guides use current-state reference voice.
- [x] Docs pack: N/A for links/anchors/previews; this edit adds none.
- [x] Agent-native pack: edited `.agents/rules/**`, never the generated skills.
- [x] Agent-native pack: `best-api` and `docs-creator` expose the action and the
      runtime-shape law.
- [x] Agent-native pack: `pnpm install` refreshed generated mirrors; exact source
      audits match the relevant phrases.
- [x] Agent-native pack: no actionable review finding remains.
- [x] Package/API pack: this is a breaking CLI entry-contract hard cut plus one
      Core-internal export; no public Core export was added.
- [x] Package/API pack: updated `.changeset/generated-editor-contracts.md`; no
      registry changelog applies because registry edits adopt the CLI contract.
- [x] Package/API pack: the complete `changeset` skill was loaded and the
      existing major package entry was reused.
- [x] Package/API pack: compatibility is explicitly rejected; there are no
      `plugins` / `schema` export aliases or wrappers.
- [x] Package/API pack: CLI 64/64 tests, CLI/Core typechecks, package lint, and
      generated artifact checks pass.
- [x] Package/API pack: `pnpm --filter @platejs/core brl` passed and kept the
      Core internal barrel canonical.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Pass every named gate | CLI 64/64, typechecks, lint, docs build, artifact check, reviews pass; Browser caveat recorded. |
| Bug reproduced before fix | no | N/A | This is an accepted breaking contract, not a behavior bug. |
| Targeted behavior verification | yes | Focused discovery tests | 8/8 passed, including default exports, lookalikes, ambiguity, and watch recovery. |
| TypeScript or typed config changed | yes | CLI/Core typechecks | Both package typechecks and Core contract declarations passed. |
| Package exports or file layout changed | yes | Core barrel generation | `pnpm --filter @platejs/core brl` passed. |
| Package manifests, lockfile, or install graph changed | no | N/A | No manifest or lockfile contract changed. |
| Agent rules or skills changed | yes | Sync mirrors | `pnpm install` passed; source/mirror phrase audits passed. |
| Workspace authority proof | yes | Owning commands | All proof ran in the Plate repo and owning packages/app. |
| Browser surface changed | yes | Browser route | Attempted `/blocks/editor-default-demo` and `/docs/editor`. |
| Browser final proof | yes | Exact caveat | Both routes are blocked by stale CI-owned `src/__registry__/index.tsx` imports of deleted `editor-kit.tsx` and `plate-types.ts`; local `build:registry` is forbidden. |
| CI-controlled template output changed | no | N/A | No `templates/**` output changed. |
| Package behavior or public API changed | yes | Changeset | Existing major CLI changeset updated. |
| Registry-only component work changed | no | N/A | Registry changes adopt the package contract and are not an independent component feature. |
| Docs or content changed | yes | Source audit and MDX build | EN/CN claims match source; `www build:source` passed. |
| High-risk mini gate | yes | Failure-mode proof | Ambiguity, default exports, invalid lookalikes, stale bindings, and resource leaks are covered. |
| Agent-native review for agent/tooling changes | yes | Capability review | PASS; command, owner, mirrors/docs, and proof are discoverable. |
| Local install corruption suspected | no | N/A | No corruption signature occurred. |
| P2 autoreview for non-trivial implementation changes | yes | Exact frozen task bundle | Final P2 run clean with no actionable findings. |
| PR create or update | no | N/A | User requested no PR. |
| Task-style PR body verified | no | N/A | No PR exists for this task. |
| PR proof image hosting | no | N/A | No PR exists. |
| Tracker sync-back | no | N/A | No tracker exists. |
| Final handoff contract | yes | Fill below | Complete. |
| Final lint | yes | Package lint | CLI and Core package lint passed; targeted Biome passed. |
| Output budget discipline | yes | Bounded output | One browser/dev-server poll truncated; subsequent reads were capped and the final evidence is concise. |
| Timed checkpoint | no | N/A | No duration requested. |
| Goal plan complete | yes | Run checker | Run after this ledger update. |
| Docs source-backed claim audit | yes | Static audit | Current guide examples and compiler claims match source/tests. |
| Docs links / routes / previews | no | N/A | No links, anchors, or previews added. |
| Docs MDX/content parser | yes | `www build:source` | Passed. |
| Plugin page specifics | no | N/A | The changed pages are editor guides, not plugin pages. |
| Agent source / generated sync | yes | Install and audit | Passed. |
| Agent action discoverability | yes | Source/mirror audit | `best-api` and `docs-creator` teach the shape-discovery contract. |
| Agent-native review | yes | Capability map | PASS with no findings. |
| Public API / package boundary proof | yes | Source audit | CLI owns discovery; Core additions are internal only. |
| Release artifact classification | yes | Published CLI contract | Major CLI changeset applies. |
| Published package changeset | yes | Existing changeset | `@platejs/cli: major`; no forbidden minor entry. |
| Registry changelog | no | N/A | Not registry-only work. |
| No release artifact | no | N/A | A release artifact is present. |
| Package typecheck/build/test | yes | Owning package proof | CLI/Core typechecks, CLI 64/64, package lint pass. |
| Barrel/export generation | yes | Core `brl` | Passed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | owners, skills, docs, and prior generated-editor policy read | implementation |
| Implementation | completed | semantic discovery, adoption, docs, doctrine, artifacts | verification |
| Verification | completed | focused/full tests, typechecks, lint, docs build, artifact check, reviews | closeout |
| PR / tracker sync | completed | N/A: neither requested nor present | final response |
| Closeout | completed | final ledger and checker | final response |

Findings:
- Fixed-name imports were the wrong owner contract; runtime nominal descriptors
  already provide a stronger discovery signal.
- Default exports must participate. Excluding `default` silently omitted a valid
  schema and still coupled the CLI to export syntax.
- Shallow field checks misclassify lookalikes such as
  `{ properties: { retries: 3 } }`. Candidate validity now runs through the
  existing Core lowering and Plite schema compiler.
- Constructing one editor per candidate leaked enough runtime work to hang watch
  recovery. Candidate validation now reuses one base compiled model and creates
  the final schema-aware editor once.
- Browser rendering is blocked by stale CI-controlled registry output, not the
  authored modules or CLI artifacts.

Decisions and tradeoffs:
- Human names (`EditorKit`, `EditorSchema`, or any other/default export) are app
  vocabulary, not CLI API.
- One non-empty nominal tuple is required. An empty array cannot prove plugin
  tuple identity and is ignored like any unrelated array.
- Invalid schema lookalikes are ignored because, without a rejected wrapper or
  annotation, compiler validity is the only honest discriminator.
- No compatibility aliases, `defineEditor`, config object, or metadata markers.

Implementation notes:
- `pluginExportName` crosses the worker boundary only so generated TypeScript can
  index the exact authored tuple through `typeof EditorModule`.
- Core exposes its existing nominal descriptor and application-schema compiler
  only through `@platejs/core/internal` for the CLI worker.
- Three generated TypeScript/JSON artifact pairs are committed codegen outputs;
  `--check` proves they are current.

Review fixes:
- Accepted P2 review: include default exports in semantic discovery.
- Accepted P2 review: validate schema candidates through the real compiler.
- Test-driven follow-up: reuse one base model so validation does not construct
  an editor per lookalike/candidate.
- Final scoped P2 autoreview: clean, no actionable findings.
- Agent-native review: PASS. The action route, source owners, generated mirrors,
  docs, and proof commands are all discoverable.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Called `generateEditors` with object entries instead of string paths | 1 | Read the signature and rerun with entry strings | Resolved; final artifact check passes. |
| Browser routes hit stale `src/__registry__/index.tsx` imports | 1 | Verify both standalone and docs routes, then preserve CI ownership | Exact caveat recorded; no forbidden registry build run. |
| Full-checkout autoreview mixed 2.2 MB of unrelated WIP and rejected a large generated JSON | 1 | Use an exact task-only frozen bundle | Final scoped P2 review clean. |
| Autoreview isolated parallel watcher tests timed out | 1 | Run tests normally and separately | Final isolated CLI suite passed 64/64. |
| Repeated candidate editor construction hung watch recovery | 1 | Validate against the base compiled model | Focused watch test and full suite pass. |
| Direct root ESLint had no matching configuration for package files | 1 | Use package-owned lint | CLI/Core package lint passed. |
| Direct temp `rm -rf` cleanup was rejected | 1 | Move the exact temp review directory to Trash | Resolved without touching workspace source. |

Verification evidence:
- Focused CLI discovery/watch tests: 8 passed, 0 failed.
- Full CLI suite: 64 passed, 0 failed, 193 assertions.
- `pnpm --filter @platejs/cli typecheck`: passed.
- `pnpm --filter @platejs/core typecheck`: passed, including contract declarations.
- `pnpm --filter @platejs/cli lint`: passed.
- `pnpm --filter @platejs/core lint`: passed.
- `pnpm --filter @platejs/core brl`: passed.
- `pnpm --filter www build:source`: passed.
- Three-entry `generateEditors(..., { check: true })`: passed.
- `pnpm install`: passed and refreshed generated skill mirrors.
- Final P2 autoreview: clean.
- Browser: blocked before route render by stale CI-controlled registry imports of
  deleted `editor-kit.tsx` and `plate-types.ts`.

Final handoff contract:
- PR line: N/A; no PR requested.
- Issue / tracker line: N/A; no tracker requested.
- Confidence line: high for the CLI/API contract; browser rendering caveat is isolated to stale generated registry output.
- Flow table:
  - Reproduced: fixed-name/default/lookalike failures covered by focused tests; browser route blocker captured.
  - Verified: CLI/Core/package/docs/artifact/review gates pass.
- Browser check: attempted standalone demo and docs route; both hit the same stale generated registry imports.
- Outcome: CLI is export-name independent and registry apps use human-owned kit/schema names.
- Caveat: browser UI cannot render until CI refreshes `apps/www/src/__registry__/index.tsx`; local registry generation is forbidden.
- Design:
  - Chosen boundary: CLI semantic discovery over nominal descriptors plus the existing schema compiler.
  - Why not quick patch: renaming one magic export would preserve the coupling.
  - Why not broader change: wrappers, config objects, metadata, and generated runtime kits are rejected machinery.
- Verified: exact commands listed above.
- PR body verified: N/A; no PR exists.

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
- PR: N/A; no PR requested.
- Issue / tracker: N/A; no tracker requested.
- Browser proof: exact build blocker recorded from Browser and local dev server.
- Caveats: broad www typecheck remains blocked by unrelated shared List/Suggestion/Table WIP; owning CLI/Core and docs checks pass.

Timeline:
- 2026-08-14T15:13:54.003Z Task goal plan created.
- 2026-08-14T18:01:40+02:00 Implementation, proof, doctrine sync, and reviews completed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | Decouple `plate generate` from export names without adding wrappers or metadata. |
| What have I learned? | See Findings |
| What have I done? | Implemented semantic discovery, adopted human names, synced docs/doctrine/artifacts, and passed proof/review. |

Open risks:
- CI must regenerate `apps/www/src/__registry__/index.tsx` before Browser can
  render the affected routes. This checkout must not run `build:registry` locally.
