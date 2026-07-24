# fix optional suggestion trailing block kit composition

Objective:
Keep suggestion and trailing-block registry kits independently composable, with
weak suggestion adaptation only when trailing block is installed.

Goal plan:
docs/plans/2026-07-24-fix-optional-suggestion-trailing-block-kit-composition.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)
- browser (docs/plans/templates/packs/browser.md)
- registry-changelog (docs/plans/templates/packs/registry-changelog.md)

Task source:
- type: direct user request
- id / link: current Codex task; no external tracker
- title: Fix optional suggestion and trailing-block kit composition
- acceptance criteria:
  - `SuggestionKit` installs only the suggestion plugin.
  - Shared and AI editor kits install `TrailingBlockPlugin` explicitly.
  - Suggestion weakly adapts an installed trailing block without owning it.
  - Suggestion-only, trailing-only, both, and both with explicit trailing
    configuration compose correctly.
  - Current-state docs and registry changelog describe the ownership.
  - Focused tests, www typecheck, lint, docs source build, Browser proof, review,
    and the goal checker pass.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A; none requested
- semantics: finish the accepted implementation and proof
- initial confidence score: 92%
- improvement loop: close any type, composition, docs, Browser, or review finding
- final score / loop closure: 98%; focused review and all required proof pass

Completion threshold:
- The registry source has independent kit ownership, all four composition states
  pass focused runtime assertions, both concrete editor kits retain trailing
  behavior, user-facing docs/changelog are generated and source-backed, www
  typecheck/lint/docs/Browser/review pass, and no contradictory source remains.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-24-fix-optional-suggestion-trailing-block-kit-composition.md` passes.

Verification surface:
- Focused Bun spec beside `suggestion-kit.tsx` for the four composition states.
- `pnpm --filter www typecheck`.
  - Scoped Biome formatting/check.
- `pnpm --filter www build:source`.
- Registry changelog generator `--write` and `--check`.
- Browser proof on `/blocks/editor-ai`: editor renders, accepts input, and has no
  composition-related console or network error.
- Scoped source audit, local autoreview, and autogoal completion checker.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: registry kit descriptors and Core weak-plugin override
  resolution; relevant docs describe that runtime.
- Allowed edit scope: shared/AI registry editor kits, suggestion kit and focused
  spec, the stale DnD consumer required to restore the affected editor route,
  EN/CN suggestion/trailing-block docs, registry changelog source/generated
  artifacts, and this goal plan.
- Browser surface: `/blocks/editor-ai`.
- Browser strategy: Browser on the standalone editor block. Use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A; no issue or Linear task supplied.
- Non-goals: no package API redesign, no plugin topology changes, no editor-kit
  dependency expansion, no migration compatibility, no PR/commit/push.

Output budget strategy:
- Use bounded `rg` and `sed` against named owners, cap command output, and run
  focused tests before app-wide checks.

Blocked condition:
- Block only if the existing weak-override contract cannot express exact target
  options without changing Core, or the required Browser route remains
  unavailable after the documented server/tool retry.

Task state:
- task_type: registry composition bug fix
- task_complexity: non-trivial
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: complete

Current verdict:
- verdict: implemented and verified
- confidence: 98%
- next owner: task
- reason: SuggestionKit is suggestion-only, concrete editors own trailing
  behavior, weak adaptation and direct override precedence are proven.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-24-fix-optional-suggestion-trailing-block-kit-composition.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Acceptance criteria and non-goals above |
| Timed checkpoint parsed | yes | N/A; no duration requested |
| Skill analysis before edits | yes | task, autogoal, plate-ui, shadcn, docs-creator, registry-changelog, Browser |
| Active goal checked or created | yes | No active goal; create after this checkpoint |
| Source of truth read before edits | yes | SuggestionKit, both EditorKit owners, Core weak override types/runtime |
| Tracker comments and attachments read | yes | N/A; no external tracker |
| Video transcript evidence required | yes | N/A; no video |
| `docs/solutions` checked for non-trivial existing-code work | yes | Read 2026-04-06 trailing-block solution |
| TDD decision before behavior change or bug fix | yes | Add four-state focused runtime spec |
| Branch decision for code-changing task | yes | N/A; user requested edits in current shared checkout |
| Release artifact decision | yes | Registry changelog; no package changeset |
| Browser tool decision for browser surface | yes | Browser on `/blocks/editor-ai` |
| PR expectation decision | yes | N/A; no PR requested |
| Tracker sync expectation decision | yes | N/A; no tracker |
| Output budget strategy recorded | yes | Bounded owner-specific reads and focused proof |
| Docs pack selected | yes | docs pack applied |
| `docs-creator` loaded | yes | Read before docs edits |
| Docs lane selected | yes | plugin feature/supporting docs |
| Target docs and nearest sibling docs read | yes | EN trailing-block and suggestion pages; CN parity targets identified |
| Docs style doctrine read | yes | docs-creator and repo current-state doctrine |
| Documented source owner identified | yes | Registry SuggestionKit/EditorKit and TrailingBlockPlugin |
| Browser pack selected | yes | browser pack applied |
| Browser route / app surface identified | yes | `/blocks/editor-ai` |
| Browser tool decision recorded | yes | Browser; no native browser surface |
| Console/network caveat policy recorded | yes | Inspect both; report unrelated existing noise separately |
| Registry changelog pack selected | yes | registry-changelog pack applied |
| User-visible registry impact classified | yes | Installed registry kits change composition/ownership |
| Source entry path selected | yes | `apps/www/src/registry/changelog/entries/2026-07-24-decouple-suggestion-trailing-block.mdx` |
| Generator command selected | yes | Scaffold `--new`, edit source, then `--write` and `--check` |

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
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.
- [x] Registry changelog pack: user-visible registry impact is recorded.
- [x] Registry changelog pack: source entry exists under `apps/www/src/registry/changelog/entries/*.mdx` or N/A reason is recorded.
- [x] Registry changelog pack: entry frontmatter follows the contract in `.agents/skills/registry-changelog/SKILL.md`.
- [x] Registry changelog pack: row bullets name real registry item ids in backticks.
- [x] Registry changelog pack: generated `/registry/changelog/*.json`, `index.json`, and `components.json` are updated by the generator, not by hand.
- [x] Registry changelog pack: package changeset decision is separate when package code also changed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named proof | Focused test 2/2, full www typecheck, Browser, generator, lint, review pass |
| Bug reproduced before fix | yes | Failing focused repro | Suggestion-only unexpectedly installed trailingBlock; duplicate target threw |
| Targeted behavior verification | yes | Focused four-state spec | 2 tests, 9 assertions pass |
| TypeScript or typed config changed | yes | Relevant typecheck | `pnpm --filter www typecheck` passes in final autoreview run |
| Package exports or file layout changed | N/A | No package export/layout change | `pnpm brl` not needed |
| Package manifests, lockfile, or install graph changed | N/A | No manifest/lock/install change | No install needed |
| Agent rules or skills changed | N/A | No agent source changed in this goal | Prior doctrine work was already complete |
| Workspace authority proof | yes | Proof in owning checkout/app | All commands ran in `/Users/zbeyens/git/plate-2`; Browser used localhost www |
| Browser surface changed | yes | Browser proof | `/blocks/editor-ai` rendered and accepted input |
| Browser final proof | yes | Browser screenshot and console | HTTP 200, visible editor, marker inserted, 0 warnings/errors |
| CI-controlled template output changed | N/A | Templates untouched | No generated template edits |
| Package behavior or public API changed | N/A | Registry-only adoption | No package source API change; no changeset |
| Registry-only component work changed | yes | Registry changelog | Source entry plus generated JSON/index/components |
| Docs or content changed | yes | Build/source audit | `build:source`, parity, registry-source checks pass |
| High-risk mini gate | yes | Prove optional absence and precedence | Four states plus standalone DnD fallback and Browser proof |
| Agent-native review for agent/tooling changes | N/A | No agent/tooling changes in this goal | Not applicable |
| Local install corruption suspected | N/A | Failure was real stale source adoption | No reinstall |
| Autoreview for non-trivial implementation changes | yes | Local scoped review until clean | Final review: no findings, correctness 0.82 |
| PR create or update | N/A | No PR requested | No git write |
| Task-style PR body verified | N/A | No PR | Not applicable |
| PR proof image hosting | N/A | No PR | Not applicable |
| Tracker sync-back | N/A | No tracker | Not applicable |
| Final handoff contract | yes | Fill exact evidence below | Complete |
| Final lint | yes | Scoped equivalent | Biome check/write passes on changed TS/TSX |
| Output budget discipline | yes | Bounded reads/results | One dev-server shutdown dump was truncated; subsequent proof stayed scoped |
| Timed checkpoint | N/A | No duration requested | Not applicable |
| Goal plan complete | yes | Run checker | Pass |
| Docs source-backed claim audit | yes | Compare docs to current types/source | Removed deleted query options; match/insert ownership verified |
| Docs links / routes / previews | yes | Existing leaf links and preview retained | `/docs/suggestion`, component routes, discussion demo remain real |
| Docs MDX/content parser | yes | Run source build | `pnpm --filter www build:source` passes |
| Plugin page specifics | yes | Apply docs-creator | Kit/manual/current API sections remain source-backed |
| Browser interaction proof | yes | Exercise editor | Typed `kit-proof` into contenteditable |
| Browser console/network check | yes | Inspect runtime | 0 console warnings/errors; route returned 200 |
| Browser final proof artifact | yes | Screenshot | Captured visible editor after interaction |
| Registry impact classification | yes | User-visible wiring | Suggestion and trailing block independently installable |
| Registry changelog source | yes | Add source entry | `2026-07-24-decouple-suggestion-trailing-block.mdx` |
| Registry changelog generation | yes | Run `--write` | 31 events generated |
| Registry changelog check | yes | Run `--check` | 31 events checked |
| Registry generator test | N/A | Generator/schema unchanged | Not applicable |
| Registry package release split | yes | Registry changelog only | No package changeset |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | owners, prior solution, docs, contracts read | implementation |
| Implementation | complete | independent kit ownership and optional list adoption | verification |
| Verification | complete | tests, typecheck, docs, generator, Browser, review | closeout |
| PR / tracker sync | complete | N/A; neither requested | final response |
| Closeout | complete | plan checker passes | final response |

Findings:
- `SuggestionKit` installed a capability it did not own.
- The shared editor therefore depended on installing the optional suggestion kit
  to retain trailing-block behavior.
- The List refactor deleted `expandListItemsWithChildren`; the DnD registry
  consumer needed optional `editor.api.list` adoption with an identity fallback.

Decisions and tradeoffs:
- Direct editor kits own `TrailingBlockPlugin`.
- Suggestion contributes only a weak target override; direct target config wins.
- Standalone DnD must not require ListPlugin, so list expansion is capability
  optional and preserves entries when absent.

Implementation notes:
- `SuggestionKit` exports only `suggestionPlugin`.
- Both concrete editor kits explicitly include `TrailingBlockPlugin`.
- EN/CN docs describe current `match`/`insert` options and kit independence.

Review fixes:
- Accepted P1: hard root List API access could crash DnD-only installs.
  Added a typed optional capability view and identity fallback.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Generator `--help` unsupported | 1 | Use emitted usage | Scaffold/write/check succeeded |
| Initial Browser build failed on deleted list helper | 1 | Audit new List owner API | Migrated stale consumer |
| First spec type surface used incompatible matcher/generic | 2 | Use owner parameter types and standard matcher | Full typecheck passes |
| Registry audit briefly saw concurrent missing markdown source | 1 | Rerun exact source/type gates after shared write settled | Full `www typecheck` passes |

Verification evidence:
- `bun test apps/www/src/registry/components/editor/plugins/suggestion-kit.spec.tsx`:
  2 pass, 0 fail, 9 assertions.
- `pnpm --filter www typecheck`: pass, including docs parity, registry source,
  app TypeScript, and package-integration TypeScript.
- `node tooling/scripts/generate-ui-changelog-entries.mjs --check`: pass.
- Scoped Biome and `git diff --check`: pass.
- Browser `/blocks/editor-ai`: HTTP 200, editor rendered, typed marker present,
  0 console warnings/errors.
- Final scoped autoreview: no findings; correctness 0.82.

Final handoff contract:
- PR line: N/A; not requested
- Issue / tracker line: N/A; none supplied
- Confidence line: 98%
- Flow table:
  - Reproduced: focused test failed before fix; Browser initially exposed stale
    List consumer
  - Verified: focused test/typecheck/docs/registry/Browser/review pass
- Browser check: `/blocks/editor-ai` interactive; clean console
- Outcome: kits are independently composable with correct weak/strong ownership
- Caveat: none
- Design:
  - Chosen boundary: concrete kits own capabilities; weak peers only adapt
  - Why not quick patch: keeping trailing inside SuggestionKit preserves the bug
  - Why not broader change: existing weak override contract already fits
- Verified: exact evidence above
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
- PR: N/A; not requested
- Issue / tracker: N/A; none supplied
- Browser proof: pass on `/blocks/editor-ai`
- Caveats: none

Timeline:
- 2026-07-24T08:44:05.974Z Task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | Independently composable suggestion and trailing-block kits |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- None in the scoped behavior.
