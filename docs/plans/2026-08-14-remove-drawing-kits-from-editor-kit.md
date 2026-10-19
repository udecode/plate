# remove drawing kits from editor kit

Objective:
Remove CodeDrawingKit and ExcalidrawKit only from canonical EditorKit; done when generated contract, registry metadata/changelog, focused checks, and review pass; plan docs/plans/2026-08-14-remove-drawing-kits-from-editor-kit.md.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-14-remove-drawing-kits-from-editor-kit.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)
- browser (docs/plans/templates/packs/browser.md)

Task source:
- type: direct user correction
- id / link: current Codex task; no external tracker
- title: remove only the two drawing kits from canonical EditorKit
- acceptance criteria: canonical EditorKit excludes CodeDrawingKit and ExcalidrawKit; dedicated examples keep explicit kit ownership; every other preset entry remains; generated editor contract and registry metadata/changelog match; focused checks and review pass.

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
- initial confidence score: N/A: binary generation/source checks are stronger
- improvement loop: remove exactly two entries, regenerate, verify, review once
- final score / loop closure: N/A: close on named pass gates

Completion threshold:
- Canonical `EditorKit` has no CodeDrawingKit or ExcalidrawKit import/member.
- The other 37 current top-level preset entries remain unchanged.
- Dedicated code-drawing/excalidraw examples retain explicit feature kits.
- Generated editor contract, registry metadata, changelog projection, focused checks, scoped lint, and P2 review pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-14-remove-drawing-kits-from-editor-kit.md` passes.

Verification surface:
- Source audit and exact preset membership diff.
- `pnpm --filter www editor:generate` and `editor:check`.
- Registry test/source checker and changelog write/check.
- Scoped Biome, `git diff --check`, Browser route attempt, and P2 autoreview.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Remove only CodeDrawingKit and ExcalidrawKit from the canonical preset; preserve all other membership.
- Preserve the feature kits, packages, UI renderers, dedicated examples, and explicit demo composition.
- Do not edit CI-owned `apps/www/src/__registry__/**`, templates, or run `build:registry`.

Boundaries:
- Source of truth: canonical `editor.ts`, generated editor contract, `registry-kits.ts`, dedicated examples, and existing 2026-08-14 registry changelog event.
- Allowed edit scope: those registry source/generated contract/changelog artifacts plus this goal plan.
- Browser surface: `/blocks/editor-ai-demo` or another canonical editor block if current CI-owned registry output compiles.
- Browser strategy: Browser for route proof; record the known stale CI-owned import blocker precisely if it persists. Use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no external tracker.
- Non-goals: no other plugin removal, no package/API deletion, no demo removal, no toolbar redesign, no commit/PR/push.

Output budget strategy:
- Exact files and bounded searches only; cap generator/test/review output; isolate review to the task file list.

Blocked condition:
- Stop only if editor generation or focused registry checks require an unrelated source change after distinct repair attempts. Existing browser compilation debt is a proof caveat, not authorization to broaden scope.

Task state:
- task_type: registry preset composition cleanup
- task_complexity: micro
- current_phase: closeout
- current_phase_status: completed
- next_phase: final response
- goal_status: complete

Current verdict:
- verdict: remove exactly CodeDrawingKit and ExcalidrawKit from EditorKit
- confidence: high
- next owner: task
- reason: both features have explicit example owners; the user rejected every broader removal.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-14-remove-drawing-kits-from-editor-kit.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Exact two removals, preservation constraints, generated/metadata/changelog scope, and proof gates recorded. |
| Timed checkpoint parsed | no | N/A: no duration. |
| Skill analysis before edits | yes | Loaded plate-ui, best-api, registry-changelog, and autogoal; shadcn action N/A because no UI component changes. |
| Active goal checked or created | yes | Matching goal created. |
| Source of truth read before edits | yes | Read current/main preset, all 39 current entries, registry metadata, dedicated examples, and dependent toolbar owner. |
| Tracker comments and attachments read | no | N/A: none. |
| Video transcript evidence required | no | N/A: no video. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: micro exact-membership correction. |
| TDD decision before behavior change or bug fix | no | N/A: generated contract and source membership checks are the durable oracle. |
| Branch decision for code-changing task | no | N/A: no git operation requested. |
| Release artifact decision | yes | Update the existing 2026-08-14 registry changelog event; no package changeset. |
| Browser tool decision for browser surface | yes | Browser route attempt; exact stale-registry caveat if compilation blocks runtime. |
| PR expectation decision | no | N/A: no PR. |
| Tracker sync expectation decision | no | N/A: no tracker. |
| Output budget strategy recorded | yes | Exact files, bounded searches, capped output, isolated review. |
| Docs pack selected | yes | Incidental registry changelog projection only. |
| `docs-creator` loaded | no | N/A: registry changelog owns this release metadata. |
| Docs lane selected | yes | Registry changelog source/projection. |
| Target docs and nearest sibling docs read | yes | Existing 2026-08-14 event is the owner. |
| Docs style doctrine read | yes | Registry-changelog current event contract loaded. |
| Documented source owner identified | yes | Canonical preset, registry-kits metadata, generated editor contract, and changelog event. |
| Browser pack selected | yes | Registry app composition changes. |
| Browser route / app surface identified | yes | Canonical editor block route. |
| Browser tool decision recorded | yes | Browser only; no native browser behavior. |
| Console/network caveat policy recorded | yes | Record exact pre-runtime blocker without broad source repair. |

Work Checklist:
- [x] N/A: no duration requested.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] N/A: no video or screen recording.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the canonical preset and registry dependency owner;
      dedicated feature demos and packages remain explicit and unchanged.
- [x] Release artifact requirement recorded: existing registry changelog event/projection; no package changeset.
- [x] Final handoff shape decided: exact removals, preserved scope, focused proof, browser caveat, no PR/tracker.
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] N/A: no branch/commit/PR requested.
- [x] Local-env-rot policy: reinstall only for documented corruption signals; otherwise preserve real failures.
- [x] Workspace authority recorded: `/Users/zbeyens/git/plate-2` and its `www` workspace own proof.
      owns the changed behavior.
- [x] High-risk note: generated Value/schema contract loses only the two drawing node families; exact membership and generation checks guard every other capability.
- [x] P2 autoreview ran against an exact reconstructed before/after snapshot.
- [x] N/A: no agent-native surface.
- [x] Output budget discipline recorded: bounded files/searches and isolated review.
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Docs pack: registry changelog lane, existing event, and source owner recorded.
- [x] Docs pack: drawing-kit ownership and dedicated examples are source-backed.
- [x] Docs pack: N/A: registry changelog intentionally records an event.
- [x] Docs pack: N/A: no links, anchors, or previews changed.
- [x] Browser pack: canonical editor route should compile/render without the two implicit drawing features; explicit drawing examples remain their own proof owners.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: console and network errors were checked; compilation failed in stale CI-owned registry output before runtime.
- [x] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named proof | Editor generation/check, registry checks, exact 37-entry audit, formatting, and P2 review passed. |
| Bug reproduced before fix | no | N/A | Exact membership correction; source audit is the oracle. |
| Targeted behavior verification | yes | Run focused proof | Generator check, registry test 5/5, registry source checker, and changelog checker passed. |
| TypeScript or typed config changed | yes | Run relevant typecheck | Generated typed contract check passed. Broad www graph is blocked by existing code-block TS7056 and suggestion schema errors outside this cut. |
| Package exports or file layout changed | no | N/A | No package export or file-layout change. |
| Package manifests, lockfile, or install graph changed | no | N/A | No manifest or install graph change. |
| Agent rules or skills changed | no | N/A | No agent source changed. |
| Workspace authority proof | yes | Verify in owner | All commands ran from `/Users/zbeyens/git/plate-2`; www-owned scripts verified the registry. |
| Browser surface changed | yes | Attempt Browser proof | `/blocks/editor-ai-demo` was attempted with Browser. |
| Browser final proof | yes | Record exact caveat | Route is blocked before runtime by stale CI-owned `__registry__` imports of deleted `editor-kit.tsx` and `plate-types.ts`; no task source broadened. |
| CI-controlled template output changed | no | N/A | No template or `__registry__` output edited. |
| Package behavior or public API changed | no | N/A | Registry preset composition only; no package changeset. |
| Registry-only component work changed | yes | Update registry changelog | Existing 2026-08-14 source event and generated projection updated and checked. |
| Docs or content changed | no | N/A | Only registry changelog release metadata changed. |
| High-risk mini gate | yes | Record failure mode and proof | Risk was accidental removal of another preset member; exact 37-entry audit and generated contract guard it. |
| Agent-native review for agent/tooling changes | no | N/A | No agent/tooling change. |
| Local install corruption suspected | no | N/A | Failures were deterministic current-source compile errors, not install rot. |
| P2 autoreview for non-trivial implementation changes | yes | Run exact review | Exact three-file before/after snapshot: clean, no accepted/actionable findings, patch correct 0.99. |
| PR create or update | no | N/A | User did not request PR work. |
| Task-style PR body verified | no | N/A | No PR. |
| PR proof image hosting | no | N/A | No PR. |
| Tracker sync-back | no | N/A | No tracker. |
| Final handoff contract | yes | Fill handoff | Completed below. |
| Final lint | yes | Run scoped formatter | Biome checked five applicable task artifacts with no fixes. |
| Output budget discipline | yes | Keep output bounded | Commands used exact paths and capped outputs; broad typecheck output was capped. |
| Timed checkpoint | no | N/A | No duration requested. |
| Goal plan complete | yes | Run checker | Checker is the final command after this update. |
| Docs source-backed claim audit | yes | Verify claim | Dedicated demos explicitly install CodeDrawingPlugin/ExcalidrawPlugin; playground explicitly appends ExcalidrawKit. |
| Docs links / routes / previews | no | N/A | No links, routes, or preview names changed. |
| Docs MDX/content parser | no | N/A | Registry changelog generator/check owns this MDX projection. |
| Plugin page specifics | no | N/A | No plugin docs page. |
| Browser interaction proof | yes | Exercise route | Browser reached the Next build overlay; app runtime could not start due unrelated CI-owned registry debt. |
| Browser console/network check | yes | Record state | GET returned 500 with the two missing-module errors; runtime network/console inspection was impossible. |
| Browser final proof artifact | yes | Record evidence | Browser DOM snapshot and dev-server log captured the exact compile blocker. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | Exact 39-member baseline and owners audited | implementation |
| Implementation | completed | Removed only two imports/members and matching registry dependencies; regenerated contracts | verification |
| Verification | completed | Focused checks, 37-member audit, lint, browser attempt, and exact P2 review recorded | closeout |
| PR / tracker sync | completed | N/A: neither requested | final response |
| Closeout | completed | Plan completed and checker invoked | final response |

Findings:
- Code drawing and Excalidraw already have explicit demo owners; the canonical preset does not need either specialized capability.
- The canonical preset retains exactly 37 other top-level entries.
- Current CI-owned registry output blocks app routes before this composition runs.

Decisions and tradeoffs:
- Removed only the two specialized kits and their editor-kit dependency closure.
- Kept their registry items, packages, renderers, and explicit demo composition.
- Rejected broader cleanup, including inherited ElementId/Copilot changes, as outside this request.

Implementation notes:
- Regenerated `editor.generated.ts` and `editor.schema.json` from canonical `editor.ts`.
- Updated the existing same-day registry event and regenerated its JSON/index/component projections.

Review fixes:
- First review used repository HEAD as its baseline and misattributed inherited shared WIP; both findings were rejected as outside this task.
- Reconstructed the exact pre-task baseline and reran P2 review; it returned clean with 0.99 confidence.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Broad www typecheck hit existing code-block/suggestion errors | 1 | Rely on owner-specific generated/type checks and record the boundary | Focused typed generator check passed; unrelated errors left untouched. |
| Browser route hit stale CI-owned registry imports | 1 | Record exact build blocker without editing generated registry output | GET 500 and both missing imports captured. |
| Initial P2 review included inherited shared WIP | 1 | Reconstruct exact pre-task baseline | Exact three-file review passed clean. |

Verification evidence:
- `pnpm --filter www editor:generate` and `editor:check`: pass.
- `bun test apps/www/src/registry/registry.test.ts`: 5 pass, 0 fail.
- Registry source checker and changelog generator check: pass.
- Exact source audit: 37 entries; no drawing identity in canonical source/generated schema; explicit demos preserved.
- Scoped Biome: pass, no fixes. Final diff check: pass.
- Exact P2 autoreview: clean, no accepted/actionable findings, patch correct 0.99.

Final handoff contract:
- PR line: N/A: no PR requested.
- Issue / tracker line: N/A: no tracker.
- Confidence line: High for the exact source/generated/registry change; browser runtime is blocked upstream.
- Flow table:
  - Reproduced: 39-entry baseline contained both specialized kits; Browser route hit unrelated compile debt.
  - Verified: 37-entry target plus generated/registry checks passed; browser runtime unavailable.
- Browser check: Browser attempted `/blocks/editor-ai-demo`; build overlay reports stale CI-owned imports of deleted `editor-kit.tsx` and `plate-types.ts`.
- Outcome: Canonical EditorKit excludes only CodeDrawingKit and ExcalidrawKit.
- Caveat: Broad www typecheck and app runtime remain blocked by unrelated current-tree failures documented above.
- Design:
  - Chosen boundary: canonical preset membership, registry dependency closure, generated contract, and registry event projection.
  - Why not quick patch: generated artifacts and install dependencies must match the source preset.
  - Why not broader change: user explicitly authorized only two removals; all other capabilities remain.
- Verified: focused generation, registry checks, exact audit, lint, and P2 review passed.
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
- PR: N/A: no PR requested.
- Issue / tracker: N/A: none.
- Browser proof: Attempted; compile blocker captured before runtime.
- Caveats: Existing code-block/suggestion type errors and stale CI-owned registry imports remain outside scope.

Timeline:
- 2026-08-14T19:11:05.062Z Task goal plan created.
- 2026-08-14 Canonical preset and install closure removed the two drawing kits; generated contracts and changelog projection refreshed.
- 2026-08-14 Focused checks passed; broad type/browser blockers were isolated as unrelated current-tree debt.
- 2026-08-14 Exact P2 before/after review passed clean.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Complete |
| Where am I going? | Final response |
| What is the goal? | Remove only CodeDrawingKit and ExcalidrawKit from canonical EditorKit and its generated/install metadata. |
| What have I learned? | See Findings |
| What have I done? | Implemented, regenerated, audited, tested, attempted browser proof, and passed exact P2 review. |

Open risks:
- Browser runtime cannot be exercised until CI regenerates stale `apps/www/src/__registry__/**` output; task-owned source and generation checks are clean.
