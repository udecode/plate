# remove element id from editor kit

Objective:
Remove ElementIdPlugin from canonical EditorKit; done when generated editor contract and registry checks prove persisted IDs are opt-in; plan docs/plans/2026-08-14-remove-element-id-from-editor-kit.md.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-14-remove-element-id-from-editor-kit.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)
- browser (docs/plans/templates/packs/browser.md)

Task source:
- type: direct user request
- id / link: current Codex task; no external tracker
- title: remove ElementIdPlugin from the canonical registry EditorKit
- acceptance criteria: canonical EditorKit omits ElementIdPlugin; generated editor schema/types omit its persisted `id` property; explicit package consumers and the plugin itself remain available; focused registry generation, source, changelog, lint, and review gates pass.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: none requested
- semantics: N/A: one-shot micro task
- initial confidence score: N/A: binary source and generated-contract checks are stronger
- improvement loop: remove the preset dependency, regenerate, verify, review once
- final score / loop closure: N/A: close on named pass gates

Completion threshold:
- `apps/www/src/registry/components/editor/editor.ts` has no `ElementIdPlugin` import or member.
- Generated `editor.generated.ts` and `editor.schema.json` contain no `elementId` capability or schema-owned `id` property.
- Markdown's explicit `ElementIdPlugin` dependency for `withBlockId` and the package API remain unchanged.
- Focused editor generation check, registry source/test checks, changelog generation check, scoped lint, diff check, and P2 autoreview pass with zero accepted findings.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-14-remove-element-id-from-editor-kit.md` passes.

Verification surface:
- Source audit of canonical editor, generated contract, and Markdown opt-in owner.
- `pnpm --filter www editor:generate` followed by `pnpm --filter www editor:check`.
- Registry test and source checker; registry changelog generator write/check.
- Scoped lint and `git diff --check`.
- Browser proof is attempted only if the existing app route can compile without regenerating CI-owned registry output; otherwise record the exact pre-existing stale-registry blocker.
- P2 local autoreview on the isolated task diff.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Preserve ElementIdPlugin as an explicit opt-in package capability and preserve Markdown `withBlockId` behavior.
- Do not edit CI-owned `apps/www/src/__registry__/**` or templates and do not run `build:registry`.
- Do not repair unrelated shared-checkout type errors or optional-coupling work.

Boundaries:
- Source of truth: `apps/www/src/registry/components/editor/editor.ts`; generated `editor.generated.ts` and `editor.schema.json`; registry changelog source/event projection.
- Allowed edit scope: canonical editor source, its generated contract, the existing 2026-08-14 registry changelog event/projections, and this goal plan.
- Browser surface: a standalone registry block using the canonical editor, if current CI-owned registry imports permit compilation.
- Browser strategy: Browser for normal route proof; record the stale `apps/www/src/__registry__` compile blocker rather than locally generating forbidden CI output. Use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no external issue, PR, or tracker requested.
- Non-goals: no package/public API change, no removal of ElementIdPlugin itself, no Markdown behavior change, no broad editor-kit cleanup, no registry build, no commit/PR/push.

Output budget strategy:
- Read exact owner files and bounded `rg` matches only; cap command output; exclude CI-generated registry trees except named generated editor contract; isolate P2 review to the task file list.

Blocked condition:
- Stop only if the editor generator cannot produce a contract without unrelated source repair, or focused owner checks fail in the edited files after distinct repair attempts. A pre-existing browser compile failure is a documented proof caveat, not a source blocker.

Task state:
- task_type: registry composition cleanup
- task_complexity: micro
- current_phase: implementation
- current_phase_status: ready
- next_phase: implementation
- goal_status: active

Current verdict:
- verdict: remove ElementIdPlugin from the canonical preset; keep it explicit for durable serialized identity
- confidence: high
- next owner: task
- reason: live registry code has no persisted-ID consumer; Markdown already guards its explicit optional dependency.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-14-remove-element-id-from-editor-kit.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Explicit removal, preservation, generated-contract, proof, and non-goal rows recorded above. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Skill analysis before edits | yes | Loaded `plate-ui`, `registry-changelog`, `shadcn`, and `autogoal`; shadcn action is N/A because no component changes. |
| Active goal checked or created | yes | Created matching active goal for this plan. |
| Source of truth read before edits | yes | Read canonical editor, generator scripts, existing changelog event, Markdown opt-in consumer, and bounded registry usages. |
| Tracker comments and attachments read | no | N/A: direct request has no external tracker or attachment. |
| Video transcript evidence required | no | N/A: no video. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: micro preset composition edit with exact owner already identified. |
| TDD decision before behavior change or bug fix | no | N/A: no runtime behavior implementation; generated schema and focused registry checks are the contract proof. |
| Branch decision for code-changing task | no | N/A: user did not request git operations. |
| Release artifact decision | yes | Registry-only composition change updates the existing 2026-08-14 registry changelog event; no package changeset. |
| Browser tool decision for browser surface | yes | Use Browser for standalone registry route if it compiles; document stale CI-generated import blocker exactly if not. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker. |
| Output budget strategy recorded | yes | Exact files, bounded searches, capped output, isolated review. |
| Docs pack selected | yes | Selected only for registry changelog projection. |
| `docs-creator` loaded | no | N/A: registry changelog metadata is governed by `registry-changelog`, not documentation authoring. |
| Docs lane selected | yes | Incidental registry changelog lane under `registry-changelog`. |
| Target docs and nearest sibling docs read | yes | Read the existing 2026-08-14 registry changelog source event; no user-facing docs page changes. |
| Docs style doctrine read | yes | Current-state docs prose is N/A; registry event uses existing event format and generator. |
| Documented source owner identified | yes | Canonical editor source plus registry changelog entry/projection. |
| Browser pack selected | yes | App registry source changed. |
| Browser route / app surface identified | yes | Standalone canonical-editor block route; current known route compilation is blocked by stale CI-owned `src/__registry__` imports. |
| Browser tool decision recorded | yes | Browser only; no native browser behavior. |
| Console/network caveat policy recorded | yes | Record exact compile/console blocker and do not claim runtime proof. |

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
- [x] N/A: no video or screen recording supplied.
- [x] Nearby repo instructions and implementation patterns read before edits: root AGENTS, canonical editor, generator scripts, existing registry changelog event, and Markdown opt-in owner.
- [x] Implementation fixes the preset owner: canonical `EditorKit` no longer installs durable identity implicitly; the package and explicit Markdown consumer remain unchanged.
- [x] Release artifact requirement recorded: update the existing registry changelog event/projection; no package changeset.
- [x] Final handoff shape decided: concise outcome, exact files, focused proof, browser caveat, and no PR/tracker line.
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] N/A: no branch, commit, or PR requested.
- [x] Local-env-rot retry policy recorded: run `pnpm run reinstall` only if a focused command shows the documented install-corruption signals; otherwise do not mask real failures.
- [x] Workspace authority recorded: every proof command runs from `/Users/zbeyens/git/plate-2` or its `www` workspace.
      owns the changed behavior.
- [x] High-risk note: generated editor schema/type output changes for the canonical registry preset; explicit package consumers remain untouched, and regeneration/check proves the boundary.
- [x] P2 autoreview ran on a clean isolated snapshot containing exactly the six task artifacts; final result clean at 0.97 confidence.
- [x] N/A: no agent-native files or behavior change.
- [x] Output budget discipline recorded: exact files, bounded `rg`, capped outputs, isolated review.
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Docs pack: incidental registry changelog lane, existing 2026-08-14 event, and generator owner recorded.
- [x] Docs pack: ElementIdPlugin and Markdown `withBlockId` claims are source-backed; no other API/docs claims.
- [x] Docs pack: N/A: registry changelog intentionally records a change event rather than current-state reference prose.
- [x] Docs pack: N/A: no links, anchors, previews, or docs routes changed.
- [x] Browser pack: standalone canonical-editor block route should render normally without an `ElementIdPlugin` dependency; compile failure from stale CI-owned registry imports is an explicit caveat.
- [x] Browser pack: Browser opened `/blocks/editor-ai-demo`; compilation stopped before runtime on stale CI-owned registry imports, so no Chrome fallback could add evidence.
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: console/server output recorded the same missing `editor-kit.tsx` and `plate-types.ts` imports; network behavior never began.
- [x] Browser pack: visual artifact waived because the Next.js build-error overlay, DOM snapshot, and server output already identify the pre-runtime blocker; CI-owned registry regeneration is forbidden locally.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named owner checks and source audit | Editor generation/check, registry test/source checker, changelog write/check, lint/diff, source absence audit, and P2 review all passed. |
| Bug reproduced before fix | no | N/A: direct preset-policy removal, not a behavior bug. | No repro required. |
| Targeted behavior verification | yes | Run focused registry proof | `bun test apps/www/src/registry/registry.test.ts`: 5/5; registry source checker passed. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm --filter www editor:check` passed. Broad `pnpm turbo typecheck --filter=www` stopped upstream in pre-existing `@platejs/suggestion` errors before app typecheck; no task-file error. |
| Package exports or file layout changed | no | N/A: no package export or layout change. | `pnpm brl` not required. |
| Package manifests, lockfile, or install graph changed | no | N/A: none changed. | No install required. |
| Agent rules or skills changed | no | N/A: none changed. | No skill sync required. |
| Workspace authority proof | yes | Run from owning repo/app | All commands ran in `/Users/zbeyens/git/plate-2`; app commands used the `www` workspace. |
| Browser surface changed | yes | Attempt canonical editor route in Browser | `/blocks/editor-ai-demo` reached Next.js build overlay before runtime because stale CI-owned imports still reference deleted `editor-kit.tsx` and `plate-types.ts`. |
| Browser final proof | yes | Captured Browser DOM and dev-server evidence | `/blocks/editor-ai-demo` returned 500 before editor runtime: `src/__registry__/index.tsx` imports missing `editor-kit.tsx` and `plate-types.ts`; repository policy reserves `build:registry` for CI. |
| CI-controlled template output changed | no | N/A: no templates or `src/__registry__` edits. | Forbidden generated registry output preserved. |
| Package behavior or public API changed | no | N/A: registry preset composition only. | No package changeset. |
| Registry-only component work changed | yes | Update registry changelog event | Existing 2026-08-14 source event and generated JSON/index updated; generator check passed. |
| Docs or content changed | yes | Verify incidental registry event | Source claim matches `editor.ts` and Markdown owner; changelog generator check passed. |
| High-risk mini gate | yes | Prove generated typed contract matches preset policy | Generator removed only persisted `id` contributions; exact absence audit and deterministic editor check passed. |
| Agent-native review for agent/tooling changes | no | N/A: no agent/tooling change. | Not required. |
| Local install corruption suspected | no | N/A: no install-corruption signal. | Broad failure is a real unrelated suggestion type error, not environment rot. |
| P2 autoreview for non-trivial implementation changes | yes | Run isolated local P2 review | Final exact-six-file run: clean, no accepted/actionable findings, overall correct 0.97. |
| PR create or update | no | N/A: user did not request PR work. | No git mutation. |
| Task-style PR body verified | no | N/A: no PR. | No body. |
| PR proof image hosting | no | N/A: no PR. | No image hosting. |
| Tracker sync-back | no | N/A: no tracker. | No external mutation. |
| Final handoff contract | yes | Fill fields below | Completed below. |
| Final lint | yes | Run scoped equivalent | Biome checked supported task TS/JSON files with no fixes; `git diff --check` passed. |
| Output budget discipline | yes | Record bounded commands and recovery | Searches were bounded. First review accidentally rooted at the shared checkout and produced unrelated findings; verdict rejected and exact-six-file isolated rerun passed. |
| Timed checkpoint | no | N/A: no duration requested. | One-shot task. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-14-remove-element-id-from-editor-kit.md` | Passed after final evidence closure. |
| Docs source-backed claim audit | yes | Verify claims against current source | Canonical preset has no ElementIdPlugin; Markdown `withBlockId` still explicitly requires it. |
| Docs links / routes / previews | no | N/A: no links, anchors, or preview names changed. | Not applicable. |
| Docs MDX/content parser | no | N/A: registry changelog MDX uses its dedicated generator, not Fumadocs source. | Dedicated generator check passed. |
| Plugin page specifics | no | N/A: no plugin page. | Not applicable. |
| Browser interaction proof | yes | Exercise target route in Browser | Route attempted; pre-runtime stale-registry compile blocker captured. |
| Browser console/network check | yes | Record console/network state | Console/server show module-not-found before requests can exercise editor behavior. |
| Browser final proof artifact | yes | Record exact caveat | Browser DOM snapshot and server log identify stale `src/__registry__/index.tsx` imports; no screenshot needed for the compiler overlay. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | Canonical preset, generator, changelog event, Markdown owner, and registry usages read. | implementation |
| Implementation | completed | Removed preset member/import; regenerated editor contract; updated changelog source/projection. | verification |
| Verification | completed | Focused checks, source audit, lint, browser attempt, and clean P2 review recorded. | closeout |
| PR / tracker sync | completed | N/A: no PR or tracker requested. | final response |
| Closeout | completed | Goal plan prepared for mechanical checker. | final response |

Findings:
- The registry has no durable-ID consumer; only Markdown's opt-in `withBlockId` path explicitly requires ElementIdPlugin.
- Removing the plugin deletes the generated required `id` property from every editor element, which is the intended contract change.
- Browser runtime proof is independently blocked by stale CI-owned `src/__registry__` imports for deleted editor facade files.

Decisions and tradeoffs:
- Keep ElementIdPlugin optional and explicit -> runtime keys own editor-internal identity -> durable serialized IDs remain available without preset tax.
- Regenerate the editor contract -> do not hand-edit generated schema/types -> deterministic generator owns their shape.
- Do not repair or regenerate `src/__registry__` locally -> CI owns it and `build:registry` is forbidden -> browser proof remains a precise caveat.

Implementation notes:
- Removed `ElementIdPlugin` import/member from canonical `EditorKit`.
- Regenerated `editor.generated.ts` and `editor.schema.json`.
- Expanded the existing 2026-08-14 registry event to state explicit persisted-ID installation policy.

Review fixes:
- First review invocation rooted at the shared checkout and surfaced four unrelated findings; rejected as invalid target evidence.
- Exact-six-file isolated rerun: no accepted/actionable findings, 0.97 correctness confidence; no code fix required.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Broad `www` typecheck stops in unrelated `@platejs/suggestion` generic errors | 1 | Use the owning generated-editor check and record the upstream boundary | `editor:check` passes; no task-file error. |
| First autoreview rooted at shared checkout rather than isolated clone | 1 | Invoke the clone-owned helper after asserting its six-file staged list | Clean P2 result at 0.97. |
| Browser route cannot compile because CI-owned registry imports deleted facades | 1 | Preserve CI-owned output and record exact Browser/server caveat | No task-scope source change authorized or needed. |

Verification evidence:
- `pnpm --filter www editor:generate` -> regenerated one editor contract.
- `pnpm --filter www editor:check` -> passed twice after final edits.
- `bun test apps/www/src/registry/registry.test.ts` -> 5 pass, 0 fail.
- `pnpm --filter www exec tsx --tsconfig ./scripts/tsconfig.scripts.json scripts/check-registry-source.mts` -> passed.
- Registry changelog generator `--write` then `--check` -> 59/59 events consistent.
- Scoped Biome -> no fixes; scoped `git diff --check` -> passed.
- Exact absence audit across canonical editor/generated contract -> zero ElementIdPlugin, elementId, owner elementId, or schema key id matches.
- P2 autoreview exact-six-file snapshot -> clean, overall correct 0.97.
- Browser `/blocks/editor-ai-demo` -> exact pre-runtime caveat captured from DOM and server console.

Final handoff contract:
- PR line: N/A: no PR requested.
- Issue / tracker line: N/A: no tracker.
- Confidence line: High for source/generated contract; browser behavior unproved because of an unrelated CI-owned compile blocker.
- Flow table:
  - Reproduced: N/A policy edit; Browser compile blocker reproduced.
  - Verified: focused owner tests/checks pass; browser runtime not reached.
- Browser check: `/blocks/editor-ai-demo` blocked by stale `src/__registry__` imports of `editor-kit.tsx` and `plate-types.ts`.
- Outcome: canonical EditorKit no longer installs persisted element IDs; generated Value types no longer require `id`.
- Caveat: broad www typecheck remains blocked upstream by unrelated suggestion errors; runtime route remains blocked by stale CI-owned registry output.
- Design:
  - Chosen boundary: canonical registry preset plus its generated contract and registry event.
  - Why not quick patch: generated types/schema must follow the authored preset or they lie.
  - Why not broader change: ElementIdPlugin remains correct for explicit durable-identity consumers such as Markdown `withBlockId`.
- Verified: generation, focused tests/source checker, changelog, lint/diff, source audit, and P2 review.
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
- PR: N/A: not requested.
- Issue / tracker: N/A: none.
- Browser proof: exact compiler-overlay/server-log caveat recorded for `/blocks/editor-ai-demo`.
- Caveats: unrelated suggestion type errors block broad www typecheck; stale CI-owned registry imports block route runtime.

Timeline:
- 2026-08-14T18:06:58.281Z Task goal plan created.
- 2026-08-14 Removed ElementIdPlugin from canonical EditorKit and regenerated its typed schema contract.
- 2026-08-14 Focused editor, registry, changelog, lint, and source audits passed; broad typecheck boundary recorded.
- 2026-08-14 Browser route attempt captured the stale CI-owned registry compile blocker.
- 2026-08-14 Exact-six-file P2 autoreview passed with no accepted findings at 0.97 correctness confidence.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | All implementation, proof, review, and plan gates are complete. |
| Where am I going? | Goal completion and concise handoff. |
| What is the goal? | Remove ElementIdPlugin from canonical EditorKit while preserving explicit durable-ID consumers and proving the generated contract. |
| What have I learned? | See Findings |
| What have I done? | Removed the implicit plugin, regenerated contract artifacts, updated the registry event, and closed focused proof/review. |

Open risks:
- No risk in the authored preset boundary. Browser runtime remains unverified until CI regenerates `apps/www/src/__registry__`; broad www typecheck remains independently red in `@platejs/suggestion`.
