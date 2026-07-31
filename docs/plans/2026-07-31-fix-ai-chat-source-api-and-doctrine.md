# Fix AI chat source API and doctrine

Objective:
Remove the fake public `AIChatSourceEditor` type, make AI chat commands consume
their owned preview editor, and encode the rule in Best API doctrine.

Goal plan:
docs/plans/2026-07-31-fix-ai-chat-source-api-and-doctrine.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)
- agent-native (docs/plans/templates/packs/agent-native.md)
- package-api (docs/plans/templates/packs/package-api.md)
- registry-changelog (docs/plans/templates/packs/registry-changelog.md)
- browser (docs/plans/templates/packs/browser.md)

Task source:
- type: direct user request in this task
- id / link: N/A
- title: Remove `AIChatSourceEditor`, then repair Best API doctrine
- acceptance criteria:
  - remove the exported structural editor subset from `AIChatPlugin`
  - do not replace it with another `Pick`, cast, callback annotation, or local
    editor-shaped alias
  - AI chat insert/replace commands take domain options only and read the
    plugin-owned `aiEditor`
  - update every package, test, registry, docs, type, and release consumer
  - repair canonical Best API rule source, smallest Vision owner, and generated
    skill mirror so the compiler-workaround pattern is rejected explicitly
  - preserve AI chat behavior and prove package, www, docs, browser, and agent
    rule surfaces

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.
- [x] Explicit scope: AIChatPlugin first, Best API doctrine second.
- [x] Hard cut: no compatibility alias or deprecated editor-parameter overload.
- [x] Public shape: `insertBelow(options?)` and `replaceSelection(options?)`;
      source content comes from plugin-owned `aiEditor` state.
- [x] Supporting surfaces: tests, registry callers, AI docs, exports/declarations,
      changeset, registry changelog classification, Vision and skill generation.
- [x] Non-goal: no unrelated Plate/Plite API migration or package colocation.
- [x] Stop condition: zero fake editor type/old calls, all named proof green,
      review clean, goal checker green.
- [x] Final handoff: concise outcome, exact proof, browser result/caveat, no PR.

Timed checkpoint:
- requested duration: N/A
- semantics: N/A; no time box requested
- initial confidence score: 90%
- improvement loop: implement owner fix, prove typed/runtime/docs surfaces, then
  close autoreview and agent-native review findings
- final score / loop closure: 98%; two real review findings fixed, final scoped
  autoreview clean, all named proof green

Completion threshold:
- `AIChatSourceEditor` and editor-parameter calls are absent; the two AI chat
  generate-preview commands read `previewValue` from their owner store and
  accept only operation
  options; AI package/tests/declarations, www typecheck, docs parsing/checking,
  relevant browser flow, changeset/changelog policy, generated skills, focused
  rule checks, lint, review, and source audits pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-31-fix-ai-chat-source-api-and-doctrine.md` passes.

Verification surface:
- `@platejs/ai` focused tests, typecheck, build/declaration inspection
- `www` typecheck plus AI docs source build/check
- Browser proof on the standalone AI editor demo route and AI action flow
- source scans for the deleted type, old command calls, and doctrine text
- `pnpm install`, Plate Next skill validators, scoped lint, diff check
- local autoreview and agent-native review; autogoal completion checker

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `packages/ai/src/react/AIChatPlugin.ts`, its tests/callers,
  `.agents/rules/best-api.mdc`, and the smallest matching `docs/vision/**` owner.
- Allowed edit scope: AI package and consumers needed for this hard cut; AI docs;
  release artifacts; canonical Best API/Vision rules and generated mirrors; this plan.
- Browser surface: `/blocks/editor-ai`, the existing standalone AI editor block
  route that exercises the AI chat menu.
- Browser strategy: Browser for the normal app route and interaction. Use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A; no issue or PR requested.
- Non-goals: unrelated packages, broad editor generic redesign, compatibility
  aliases, manual generated registry JSON edits, commit/push/PR.

Output budget strategy:
- Scope `rg` to AI/docs/rules, cap shell output, run focused package/app checks,
  and record pass counts or concise errors instead of streaming broad logs.

Blocked condition:
- Block only if the owning API cannot access stored preview nodes without a
  broader public contract change, or the mandated browser surface cannot run
  after one repository-prescribed reinstall retry.

Task state:
- task_type: public API hard cut plus agent doctrine repair
- task_complexity: non-trivial
- current_phase: closeout
- current_phase_status: completed
- next_phase: final response
- goal_status: complete after checker

Current verdict:
- verdict: complete
- confidence: 98%
- next owner: user
- reason: owner fix, adoption, release/docs, browser, and doctrine proof are green

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-31-fix-ai-chat-source-api-and-doctrine.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Explicit checklist above |
| Timed checkpoint parsed | yes | N/A: no duration requested |
| Skill analysis before edits | yes | `plate-next`, user-supplied `best-api`, `autogoal`, `task`, `changeset`, `docs-creator`, `registry-changelog`, `agent-native-reviewer` loaded |
| Active goal checked or created | yes | Active goal points to this plan |
| Source of truth read before edits | yes | AI plugin type/state/update stages, every caller, tests, docs headings, and current release artifacts inventoried |
| Tracker comments and attachments read | yes | N/A: direct request, no tracker |
| Video transcript evidence required | yes | N/A: no recording supplied |
| `docs/solutions` checked for non-trivial existing-code work | yes | AI solution corpus inventoried; streaming rollback/spec-path notes are adjacent, not API owners |
| TDD decision before behavior change or bug fix | yes | Reuse and adapt focused AI suggestion spec; this is an API ownership hard cut, not a new behavior bug |
| Branch decision for code-changing task | yes | Existing shared checkout; no branch/PR operation requested |
| Release artifact decision | yes | Update existing `.changeset/ai-v54-runtime.md`; classify registry copied-code delta separately |
| Browser tool decision for browser surface | yes | Browser on existing AI editor demo; Chrome/Computer N/A |
| PR expectation decision | yes | N/A: no PR requested |
| Tracker sync expectation decision | yes | N/A: no tracker |
| Output budget strategy recorded | yes | Scoped searches and capped focused commands recorded above |
| Docs pack selected | yes | Supporting AI workflow/API docs lane |
| `docs-creator` loaded | yes | Full generated skill read |
| Docs lane selected | yes | Workflow / AI with API reference correction |
| Target docs and nearest sibling docs read | yes | Read EN/CN AI workflow pages, their insert/replace API sections, plugin setup, and owning source |
| Docs style doctrine read | yes | `docs-creator` full skill read |
| Documented source owner identified | yes | `AIChatPlugin` update stage and plugin-owned `aiEditor` state |
| Agent-native pack selected | yes | Best API source-rule repair |
| Agent-facing action surface identified | yes | Public API review rule that rejects compiler-only structural editor aliases |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/best-api.mdc`; generate `.agents/skills/best-api/SKILL.md` with `pnpm install` |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded before plan creation |
| Package/API pack selected | yes | `@platejs/ai` public command signatures and exported type |
| Public surface or package boundary identified | yes | `AIChatPlugin` descriptor-owned update API and `@platejs/ai/react` type surface |
| Release artifact path selected | yes | Existing `.changeset/ai-v54-runtime.md` plus registry changelog source if copied API shape is user-visible |
| `changeset` skill loaded when `.changeset` is required | yes | Loaded before edits |
| Barrel/export impact decision recorded | yes | Type is exported through wildcard; run `pnpm brl` and inspect built declarations |
| Registry changelog pack selected | yes | Copied `ai-menu` and possibly `ai-kit` call shape |
| User-visible registry impact classified | yes | Yes: copied AI menu source changes to the package command API |
| Source entry path selected | yes | Create `apps/www/src/registry/changelog/entries/2026-07-31-simplify-ai-chat-source-commands.mdx` unless implementation proves registry diff internal-only |
| Generator command selected | yes | Source edit/`--new`, then `--write` and `--check`; focused generator test N/A unless schema changes |

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
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized
      `<video-transcripts>` XML, or marked N/A with reason.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [x] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason.
- [x] Final handoff shape decided: bug/feature/testing/batch/review/tracker
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      reinstall/rerun evidence or N/A with reason.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason.
- [x] Review/autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, anchors, and previews target real leaf pages or are marked N/A with reason.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required.
- [x] Registry changelog pack: user-visible registry impact is recorded.
- [x] Registry changelog pack: source entry exists under `apps/www/src/registry/changelog/entries/*.mdx` or N/A reason is recorded.
- [x] Registry changelog pack: entry frontmatter follows the contract in `.agents/skills/registry-changelog/SKILL.md`.
- [x] Registry changelog pack: row bullets name real registry item ids in backticks.
- [x] Registry changelog pack: generated `/registry/changelog/*.json`, `index.json`, and `components.json` are updated by the generator, not by hand.
- [x] Registry changelog pack: package changeset decision is separate when package code also changed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named code, docs, browser, release, and agent checks | All evidence recorded below |
| Bug reproduced before fix | no | N/A: public API/type cleanup, with compile/runtime regressions caught by focused tests and review | N/A recorded |
| Targeted behavior verification | yes | Prove edit insert, generated replace, and stale-preview clearing | Focused 5/5 passed |
| TypeScript or typed config changed | yes | Run owning package and app typechecks | AI and www typechecks passed |
| Package exports or file layout changed | yes | Run package barrel generation and declaration audit | `@platejs/ai brl` passed; built declaration has no old type |
| Package manifests, lockfile, or install graph changed | no | N/A: no manifest or dependency change | `pnpm install` ran only for skill generation |
| Agent rules or skills changed | yes | Regenerate and validate skill mirrors | `pnpm install`, version validate, resource sync passed |
| Workspace authority proof | yes | Run every command in `/Users/zbeyens/git/plate-2` or owning package/app | All commands used the owning checkout |
| Browser surface changed | yes | Verify copied AI menu route with Browser | `/blocks/editor-ai` 200; Mod+J menu visible |
| Browser final proof | yes | Record DOM and console result | Seven commands visible; no AI menu error |
| CI-controlled template output changed | no | N/A: no `templates/**`; `public/r/**` intentionally unchanged | Repo policy observed |
| Package behavior or public API changed | yes | Update package release artifact | `.changeset/ai-v54-runtime.md` updated |
| Registry-only component work changed | no | N/A: mixed package plus registry work uses registry changelog owner | Dedicated registry event generated |
| Docs or content changed | yes | Parse, parity-check, and route-check AI docs | `check:docs` passed; `/docs/ai` 200 |
| High-risk mini gate | yes | Prove no stale preview, edit-branch regression, or public type recursion | Tests, declaration audit, and clean final autoreview |
| Agent-native review for agent/tooling changes | yes | Check source owner, route, mirror, and proof | Parity map complete; source/mirror exact |
| Local install corruption suspected | no | N/A: raw Bun failure was a wrong command, not install corruption | Correct repo test lanes passed |
| Autoreview for non-trivial implementation changes | yes | Close accepted findings and rerun clean | Final local scoped review clean |
| PR create or update | no | N/A: user did not request PR | No git publication performed |
| Task-style PR body verified | no | N/A: no PR | N/A |
| PR proof image hosting | no | N/A: no PR | N/A |
| Tracker sync-back | no | N/A: no tracker | N/A |
| Final handoff contract | yes | Fill exact outcome, proof, caveat, and design | Completed below |
| Final lint | yes | Run scoped Biome and diff check | Scoped Biome clean; scoped `git diff --check` passed |
| Output budget discipline | yes | Keep searches and checks scoped/capped | One generated changelog listing was verbose but bounded; all other output capped |
| Timed checkpoint | no | N/A: no duration requested | N/A |
| Goal plan complete | yes | Run autogoal completion checker | Final command follows this edit |
| Docs source-backed claim audit | yes | Match preview state and command signatures to source | EN/CN sections match built API |
| Docs links / routes / previews | yes | Verify affected leaf route | `/docs/ai` returned 200 with both option-only headings |
| Docs MDX/content parser | yes | Run docs source build/check | Passed |
| Plugin page specifics | yes | Keep Workflow/AI API reference current and source-backed | `previewValue` and option-only commands documented |
| Agent source / generated sync | yes | Regenerate from `.agents/rules/best-api.mdc` | Generated Best API skill contains exact rule |
| Agent action discoverability | yes | Verify Best API rule is on the normal review path | Source and installed skill both expose rule |
| Agent-native review | yes | Close accepted/rejected findings with proof | No remaining agent-native gap |
| Public API / package boundary proof | yes | Audit source, callers, and built declarations | Old type/calls zero; final signatures option-only |
| Release artifact classification | yes | Classify package plus copied-registry delta | Both changeset and registry changelog required |
| Published package changeset | yes | Update one `@platejs/ai` changeset | Existing major changeset updated |
| Registry changelog | yes | Add source event and generate JSON | 42-event write/check passed |
| No release artifact | no | N/A: user-visible package and registry deltas exist | N/A |
| Package typecheck/build/test | yes | Run AI owner proof | Typecheck/build; fast 67/67; slow 6/6 |
| Barrel/export generation | yes | Run scoped barrel check | Passed |
| Registry impact classification | yes | Record copied `ai-menu` API adoption | User-visible wiring event |
| Registry changelog source | yes | Add real-item event | `2026-07-31-simplify-ai-chat-source-commands.mdx` |
| Registry changelog generation | yes | Run generator write | Wrote 42 events |
| Registry changelog check | yes | Run generator check | Checked 42 events |
| Registry generator test | no | N/A: generator/schema/layout unchanged | N/A |
| Registry package release split | yes | Keep package and registry release artifacts separate | Both present and independently validated |

Browser Pack Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Browser pack selected | yes | `apps/www/src/registry/ui/ai-menu.tsx` is copied UI source |
| Browser route / app surface identified | yes | `/blocks/editor-ai`; open the AI menu and verify command wiring without transmitting sample content to an external model |
| Browser tool decision recorded | yes | Browser; native Chrome/OS behavior is not involved |
| Console/network caveat policy recorded | yes | Check console; AI provider/network completion is not required to prove local command wiring |

Browser Pack Checklist:
- [x] Route `/blocks/editor-ai`; focus editor; press Mod+J; expect visible AI input and command items.
- [x] Used Browser for the normal app surface; Chrome and Computer are N/A.
- [x] Checked console; no AI menu crash, only the pre-existing React script-tag warning.
- [x] DOM proof recorded: visible `Ask AI anything...` input and seven selection commands.

Browser Pack Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Browser interaction proof | yes | Exercise `/blocks/editor-ai` AI menu command wiring | Route 200; Mod+J opened visible input plus Improve writing, Comment, Emojify, Make longer/shorter, grammar, and simplify commands |
| Browser console/network check | yes | Record app console and separate external provider state | One pre-existing React script-tag warning before interaction; no AI menu error; external provider call intentionally not sent |
| Browser final proof artifact | yes | Record route plus screenshot/DOM result or exact blocker | Browser DOM proof recorded; text-only `/docs/ai` returned 200 with both option-only headings |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | requirements, owners, consumers, skills, docs, solutions, and release paths read | implementation |
| Implementation | completed | option-only commands, domain preview state, lifecycle clearing, callers/docs/releases/doctrine repaired | verification |
| Verification | completed | AI 67/67 fast, 6/6 slow, typecheck/build, www/docs, Browser, generators, validators | closeout |
| PR / tracker sync | completed | N/A: no PR or tracker requested | final response |
| Closeout | completed | final scoped autoreview clean; agent parity and plan checks closed | final response |

Findings:
- `AIChatSourceEditor` was a compiler-depth workaround, not a user concept.
- The deeper recursion owner was `AIChatPluginState.aiEditor: PlateEditor`; the
  commands need generated nodes, so the honest state is `previewValue: Value`.
- Every production command caller passed the same editor already registered by
  `useAIChatEditor`; no arbitrary external-editor job exists.
- `apps/www/public/r/**` still reflects the pre-cut registry payload, but repo
  policy makes it CI-controlled output and forbids local `build:registry`.

Decisions and tradeoffs:
- Hard-cut the editor parameter with no overload or alias.
- Store preview domain data, not an editor object; commands take formatting
  options only.
- Keep `getPreviewSource` lexical because insert and replace share it; do not
  publish another helper or staged capability.
- Best API rejects compiler-only structural capability aliases; independently
  implemented/substituted interfaces remain valid when they own a real job.

Implementation notes:
- `useAIChatEditor` replaces the preview document and publishes its current
  children to `previewValue` in the same effect.
- `insertBelow` and `replaceSelection` resolve that state inside the active
  update stage and preserve all existing transform logic.
- Registry menu callbacks no longer receive or forward `aiEditor`.
- EN/CN docs, package changeset, registry changelog, Vision, and generated Best
  API skill mirror describe the final shape.

Review fixes:
- Added focused insert and replace tests against owned `previewValue`.
- Rejected the first autoreview finding about `apps/www/public/r/**`: that
  output is unchanged, CI-controlled, and local generation is explicitly
  forbidden. Final review rerun includes that repository policy.
- Accepted the second autoreview finding: edit-suggestion `insertBelow` does not
  consume preview nodes, so preview lookup now happens only in its generate
  branch and the test proves edit insertion works without seeded preview state.
- Accepted the next lifecycle finding: reset, submit, and regenerate clear
  `previewValue`; focused coverage proves a new request cannot reuse stale AI
  output.
- Rejected unrelated findings about the pre-existing `AIChatKitPlugin` docs and
  its copied registry consumers. They belong to the separate companion-vs-extend
  decision and were not introduced or authorized by this type hard cut.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Filtered package test used a repo-root path from package cwd | 1 | Rerun with package-relative `src/react/...` path | 3/3 passed |
| Raw `bun test` bypassed root preload/source aliases | 1 | Use `pnpm --filter @platejs/ai test` and root `pnpm test:slow -- <file>` | Fast 67/67 and focused slow 6/6 passed |
| Guessed `/blocks/editor-ai-demo` route returned 404 | 1 | Read the real block owner and use `/blocks/editor-ai` | Route 200; AI menu DOM proof passed |

Verification evidence:
- `pnpm --filter @platejs/ai test`: 67/67 passed, 131 assertions.
- `pnpm test:slow -- packages/ai/src/react/useAIChat.slow.tsx`: 6/6 passed.
- `pnpm --filter @platejs/ai typecheck` and `build`: passed; declaration audit
  contains `previewValue` and option-only commands, with no old editor type.
- `pnpm --filter www typecheck`, `build:source`, and `check:docs`: passed.
- Browser `/blocks/editor-ai`: route 200, Mod+J opened visible AI input and
  seven commands; no AI menu error. `/docs/ai` returned 200 with both new headings.
- Registry changelog write/check: 42/42 events; package barrel check passed.
- `pnpm install`, Plate Next version validation, and resource sync: passed.
- Scoped Biome and diff check: passed; old type/call source scan returned zero.
- Final `.agents/skills/autoreview/scripts/autoreview --mode local`: clean.

Final handoff contract:
- PR line: N/A; no PR requested
- Issue / tracker line: N/A; direct task
- Confidence line: 98%
- Flow table:
  - Reproduced: compile-depth failure and review-detected lifecycle/branch regressions
  - Verified: AI 67/67 fast + 6/6 slow; Browser route/menu; docs route 200
- Browser check: `/blocks/editor-ai` loaded and Mod+J menu opened; console has
  only the pre-existing React script-tag warning
- Outcome: fake editor type and editor state removed; option-only commands use
  owned domain preview state; reusable Best API rule installed
- Caveat: CI regenerates unchanged `apps/www/public/r/**`; unrelated
  `AIChatKitPlugin` companion-vs-extend drift remains outside this task
- Design:
  - Chosen boundary: plugin-owned `previewValue: Value` plus option-only updates
  - Why not quick patch: another structural alias would preserve compiler plumbing
  - Why not broader change: ai-kit composition is a separate public design decision
- Verified: exact evidence list above
- PR body verified: N/A; no PR

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
- Browser proof: `/blocks/editor-ai` 200; visible Mod+J AI command menu
- Caveats: pre-existing React script-tag warning; CI owns `public/r/**`

Timeline:
- 2026-07-31T09:45:00.095Z Task goal plan created.
- 2026-07-31 AI source API, consumers, docs, releases, and doctrine repaired.
- 2026-07-31 Review fixed edit-branch gating and stale preview lifecycle; final review clean.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | Remove fake AI editor plumbing and make the rule durable |
| What have I learned? | See Findings |
| What have I done? | Implemented, adopted, documented, released, browser-tested, and reviewed the hard cut |

Open risks:
- No in-scope open risk. CI-controlled `apps/www/public/r/**` remains unchanged
  by policy; the pre-existing ai-kit composition/docs decision is separate.
