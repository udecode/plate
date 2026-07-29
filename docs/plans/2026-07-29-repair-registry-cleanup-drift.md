# repair registry cleanup drift

Objective:
Correct eight registry diffs and repair owning Plate UI/Next doctrine; done when
focused source, type/test, generated-skill, and browser gates pass.

Goal plan:
docs/plans/2026-07-29-repair-registry-cleanup-drift.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)
- browser (docs/plans/templates/packs/browser.md)
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: direct user correction
- id / link: current Codex task
- title: Audit registry cleanup drift and repair the owning skills
- acceptance criteria:
  - Explain and classify the diffs in code-drawing-demo, excalidraw-demo,
    list-classic-demo, cursor-overlay, ghost-text, media-image-node,
    media-video-node, and table-node.
  - Preserve explicit feature wiring in registry examples when it is deliberate
    teaching/install transparency even if EditorKit also includes the feature.
  - Revert or repair every incorrect source diff; keep correct cleanup.
  - Repair the smallest owning skill sources among plate-ui, plate-next, and
    plate-plugin-creator; never edit generated SKILL.md mirrors directly.
  - Prove source, types/tests, generated skills, and affected registry demos.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: none requested
- semantics: N/A
- initial confidence score: N/A
- improvement loop: continue until every named file is classified and all
  accepted corrections pass focused proof
- final score / loop closure: N/A

Completion threshold:
- All eight named registry diffs have a source-backed verdict; incorrect diffs
  are corrected, correct diffs remain; owning doctrine is repaired and
  regenerated; focused package tests/typechecks, lint, source audits, and
  affected Browser demo checks pass with no new relevant console errors.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-29-repair-registry-cleanup-drift.md` passes.

Verification surface:
- Exact `git diff`/`rg` source audit for the eight named registry files.
- Focused tests and typechecks for any package owner changed.
- `pnpm brl` if a package export/file owner changes.
- `pnpm install` plus plate-next version validation when rule sources change.
- Browser proof on the affected standalone `/blocks/*-demo` routes where they
  exist; exact route caveat otherwise.
- Scoped lint and final local autoreview/agent-native review.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: current registry metadata/components, current package owners,
  `.agents/rules/plate-ui.mdc`, `.agents/rules/plate-next.mdc`, and generated
  skills after `pnpm install`.
- Allowed edit scope: the eight named registry files, their directly owning
  package files/tests/exports only where the diff exposed ownership drift,
  the smallest owning rule/version files, generated skill mirrors, and this
  plan.
- Browser surface: standalone demos for code drawing, Excalidraw, classic list,
  cursor overlay, ghost text, media image/video, and table when routes exist.
- Browser strategy: Browser for normal app QA. Use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no issue or PR requested.
- Non-goals: no broad registry redesign, no unrelated package cleanup, no
  compatibility aliases, no commits/PR/push, and no changes to correct diffs
  merely to make the whole set uniform.

Output budget strategy:
- Scope reads to named files, direct owners, and required skill references;
  cap command output and use `rg`/focused diffs rather than whole-repo dumps.

Blocked condition:
- Stop only if current shared writes make a named file impossible to repair
  without overwriting an active owner, or the required Browser route cannot be
  started after the repo-prescribed install retry.

Task state:
- task_type: implementation and doctrine repair
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final handoff
- goal_status: complete

Current verdict:
- verdict: pass
- confidence: high
- next owner: user
- reason: all scoped source, package, generated-skill, focused type/test, and Browser gates pass

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-29-repair-registry-cleanup-drift.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | acceptance criteria above copy every named file and requested skill repair |
| Timed checkpoint parsed | no | N/A: none requested |
| Skill analysis before edits | yes | plate-ui, plate-next, plate-plugin-creator, shadcn, and required references read |
| Active goal checked or created | yes | active goal created for this plan |
| Source of truth read before edits | yes | named diffs and direct owners inspected; focused owner reads continue before patch |
| Tracker comments and attachments read | no | N/A: no tracker |
| Video transcript evidence required | no | N/A: no video |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: direct current-tree regression with exact owners |
| TDD decision before behavior change or bug fix | yes | reuse existing focused behavior tests; corrections are behavior-preserving ownership/reversion, not new behavior |
| Branch decision for code-changing task | yes | N/A: keep current checkout; no branch requested |
| Release artifact decision | yes | registry changelog for copied registry changes; existing DnD and Selection major changesets own package deltas |
| Browser tool decision for browser surface | yes | Browser for standalone registry demos |
| PR expectation decision | yes | N/A: no PR requested |
| Tracker sync expectation decision | yes | N/A: no tracker |
| Output budget strategy recorded | yes | scoped/capped reads above |
| Agent-native pack selected | yes | agent-native pack materialized |
| Agent-facing action surface identified | yes | plate-ui registry rules and plate-next cleanup doctrine |
| Source rule versus generated mirror boundary identified | yes | edit `.agents/rules/**`; regenerate `.agents/skills/**` via `pnpm install` |
| `agent-native-reviewer` loaded or waiver recorded | yes | reviewer loaded; capability map closes source owner, generated mirror, proof, and discoverability |
| Browser pack selected | yes | browser pack materialized |
| Browser route / app surface identified | yes | standalone named feature demos where present |
| Browser tool decision recorded | yes | Browser; no native browser behavior |
| Console/network caveat policy recorded | yes | report only new relevant errors; preserve exact existing caveats |
| Package/API pack selected | yes | package-api pack materialized because package ownership may be repaired |
| Public surface or package boundary identified | yes | cursor-overlay hook and DnD selection-controller ownership |
| Release artifact path selected | yes | registry entry `2026-07-29-preserve-feature-example-wiring`; existing DnD/Selection major changesets updated or retained |
| `changeset` skill loaded when `.changeset` is required | yes | loaded; DnD changeset now names `selectBlockById`; Selection changeset already owns cursor geometry migration |
| Barrel/export impact decision recorded | yes | DnD flat export restored and `pnpm brl` completed 55/55 |

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
- [x] Implementation fixes the right ownership boundary: registry examples own
      transparent composition, cursor/resizable/DnD own reusable semantics.
- [x] Release artifacts recorded: registry changelog plus existing DnD and
      Selection major changesets.
- [x] Final handoff shape decided: local batch handoff; PR/tracker are N/A.
- [x] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason.
- [x] Local-env-rot retry policy recorded: N/A, failures were deterministic
      unrelated source diagnostics, not install-corruption signals.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded: duplicate same-key plugins could crash demos;
      copied cross-layer helpers could drift from package semantics. Browser,
      package tests, exports, and changesets cover both.
- [x] Autoreview targeted the frozen packet in local mode.
- [x] Agent-native review required and completed because rule sources changed.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Agent-native pack: source `.agents/rules/**` files were edited; generated
      `SKILL.md` mirrors were not edited directly.
- [x] Agent-native pack: registry teaching/uniqueness and package-owner rules are
      discoverable from generated plate-ui and plate-next skills.
- [x] Agent-native pack: `pnpm install` synced generated mirrors and Plate Next
      v23 validation passes.
- [x] Agent-native pack: parity review found no route, source, mirror, or proof gap.
- [x] Browser pack: mapped each registry item to its real `/blocks/*-demo` route
      and expected rendered feature.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it. N/A: no
      native browser behavior in this packet.
- [x] Browser pack: every proof tab had zero warning/error diagnostics.
- [x] Browser pack: DOM snapshots proved visible output; screenshot escalation
      was unnecessary because Browser could inspect every route.
- [x] Package/API pack: DnD flat controller, Selection hook ownership, exports,
      and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix applied.
- [x] Package/API pack: `changeset` rules followed for DnD/Selection.
- [x] Package/API pack: registry changes use the registry changelog generator.
- [x] Package/API pack: N/A no-artifact path; this packet has both registry and
      package release artifacts.
- [x] Package/API pack: no compatibility alias; one current API per owner.
- [x] Package/API pack: DnD/Selection typechecks and focused tests pass.
- [x] Package/API pack: `pnpm brl` and changelog generation completed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named source/type/test/skill/browser gates | All focused gates below pass |
| Bug reproduced before fix | yes | Record runtime repro | Browser reproduced duplicate `codeDrawing` descriptor before EditorKit filtering |
| Targeted behavior verification | yes | Run focused tests | 6/6 DnD, Selection, and ghost-text assertions pass; DnD package test passes |
| TypeScript or typed config changed | yes | Run relevant typecheck | DnD/Selection Turbo typechecks pass; TypeScript 7 focused app program reports 0 diagnostics in 8 files |
| Package exports or file layout changed | yes | Generate barrels | `pnpm brl`: 55/55 successful |
| Package manifests, lockfile, or install graph changed | no | N/A | No package manifest, lockfile, or dependency graph delta in this packet |
| Agent rules or skills changed | yes | Regenerate skills | `pnpm install`; Plate Next v23 registry validates |
| Workspace authority proof | yes | Use owning repo/package/app | Every command ran in `/Users/zbeyens/git/plate-2`; Browser used local www routes |
| Browser surface changed | yes | Verify real routes | Seven mapped `/blocks/*-demo` routes render expected feature content |
| Browser final proof | yes | Record rendered output | Code image, Excalidraw canvas, classic lists, cursor copy, media figure/video, table, and Copilot DOM visible |
| CI-controlled template output changed | no | N/A | No `templates/**` output touched |
| Package behavior or public API changed | yes | Record release artifact | Existing DnD major changeset updated; existing Selection major changeset already owns cursor surface |
| Registry-only component work changed | yes | Generate registry changelog | Source entry plus generated event/index/components pass `--check` |
| Docs or content changed | yes | Verify source-backed content | Rule source, generated skills, and changelog source/generation audited |
| High-risk mini gate | yes | Prove runtime/package boundary | Unit proof plus duplicate-key-free Browser routes and export/type checks |
| Agent-native review for agent/tooling changes | yes | Close parity map | PASS: route -> source rule -> generated skill -> proof -> handoff is complete |
| Local install corruption suspected | no | N/A | Failures were deterministic unrelated source diagnostics; no env-rot signature |
| Autoreview for non-trivial implementation changes | yes | Run local scoped review | One P2 changelog omission accepted/fixed; mention-node finding rejected as unrelated shared WIP; no accepted/actionable finding remains |
| PR create or update | no | N/A | User did not request PR, commit, or push |
| Task-style PR body verified | no | N/A | No PR exists or was requested |
| PR proof image hosting | no | N/A | No PR body |
| Tracker sync-back | no | N/A | No issue or Linear task |
| Final handoff contract | yes | Fill fields below | Completed below |
| Final lint | yes | Run scoped lint | DnD and Selection lint pass; scoped Biome reports no fixes |
| Output budget discipline | yes | Bound output | Reads/diffs were scoped and command output capped; large review output was truncated and summarized |
| Timed checkpoint | no | N/A | No duration requested |
| Goal plan complete | yes | Run checker | Final `check-complete.mjs` rerun after this ledger update |
| Agent source / generated sync | yes | Run install and validate | `pnpm install`; v23 validates 42 active, 1 retired |
| Agent action discoverability | yes | Audit generated skills | plate-ui exposes teaching/uniqueness rule; plate-next exposes durable flat owner rule |
| Agent-native review | yes | Review parity | PASS with no P0-P3 gap |
| Browser interaction proof | yes | Exercise routes | Browser loaded all seven routes and inspected rendered DOM |
| Browser console/network check | yes | Inspect diagnostics | Zero warning/error diagnostics on every proof tab |
| Browser final proof artifact | yes | Record route evidence | Route titles and DOM snapshots recorded in this task |
| Public API / package boundary proof | yes | Audit source/export/release | DnD helper is flat, exported, tested, typed, and named in changeset; Selection owns lifecycle only |
| Release artifact classification | yes | Classify deltas | Copied registry changes use registry changelog; package deltas use existing major changesets |
| Published package changeset | yes | Update existing artifacts | `.changeset/dnd-cross-editor-drop.md` names helper; `.changeset/selection-plite-runtime.md` owns cursor migration |
| Registry changelog | yes | Generate and check | Seven changed copied items/demos mapped in 2026-07-29 event |
| No release artifact | no | N/A | Release artifacts are required and present |
| Package typecheck/build/test | yes | Run owning checks | DnD test + DnD/Selection typechecks pass |
| Barrel/export generation | yes | Run `pnpm brl` | 55 successful tasks |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | pass | eight diffs and direct owners classified | implementation |
| Implementation | pass | wrong diffs repaired; correct ownership migrations retained | verification |
| Verification | pass | focused tests/types/lint/generation/Browser pass | closeout |
| PR / tracker sync | pass | N/A: neither requested | final response |
| Closeout | pass | autoreview and agent-native review closed | final response |

Findings:
- `code-drawing-demo` and `excalidraw-demo`: deleting explicit feature wiring
  was wrong; filter the aggregate descriptor and configure the feature once.
- `list-classic-demo`: the only remaining change was property-order churn; removed.
- `cursor-overlay`: cursor package owns geometry; Selection owns cursor state and lifecycle.
- `ghost-text`: node ids must respect the configured schema property, not `element.id`.
- `media-image-node` and `media-video-node`: passing `readOnly` was dead because
  Resizable derives editor read-only state itself.
- `table-node`: selection plus focus crosses read/update/DOM layers and belongs
  in a flat DnD controller, not copied registry JSX.

Decisions and tradeoffs:
- Changed plate-ui and plate-next doctrine. Plate-plugin-creator already permits
  real flat cross-layer owners, so changing it would duplicate policy.
- Kept package owners only where semantics are reusable; kept renderer/product
  composition explicit in registry source.
- Rejected autoreview's `mention-node` finding: real unrelated shared WIP, but
  outside the eight-file boundary and not legal to absorb into this changelog.

Implementation notes:
- Added `selectBlockById` with focused behavior coverage and a generated DnD barrel export.
- Renamed Selection's lifecycle hook to `useCursorOverlayPlugin` so the geometry
  hook name belongs solely to `@platejs/cursor`.
- Added Plate Next v21/v22 doctrine for teaching transparency, single-key
  runtime membership, and durable flat package owners; later shared v23 remains intact.
- Regenerated skills and the registry changelog from their source owners.

Review fixes:
- Accepted P2: registry changelog initially omitted five changed copied UI
  items. Added cursor-overlay, ghost-text, both media nodes, and table-node.
- Rejected P1: mention-node belongs to unrelated shared WIP and the review
  prompt's original eight-file scope excludes it.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Included untouched list-kit test in combined run | 1 | rerun exact affected test set | 6/6 pass; list runtime export failure remains outside scope |
| Full www typecheck hit unrelated files | 1 | use TypeScript 7 project API for file-scoped diagnostics | 8 scoped files, 0 diagnostics |
| Used legacy TypeScript compiler API with TypeScript 7 | 2 | use `typescript/unstable/sync` | focused type harness passes |
| Spied on a transient DOM API facade | 1 | install a test DOM extension at the real API owner | focus call is asserted and 6/6 tests pass |
| Autoreview found unrelated mention-node delta | 1 | verify scope and owner | rejected as unrelated; no source edit |

Verification evidence:
- `bun test packages/dnd/src/selectBlockById.spec.ts packages/selection/src/react/CursorOverlayPlugin.spec.tsx apps/www/src/registry/ui/ghost-text.spec.tsx` -> 6 pass.
- `pnpm --filter @platejs/dnd test` -> pass.
- `pnpm turbo typecheck --filter=./packages/dnd --filter=./packages/selection` -> 15/15 tasks.
- TypeScript 7 focused app program -> 8 registry files, 0 diagnostics.
- `pnpm --filter @platejs/dnd lint:fix` and Selection equivalent -> no fixes.
- scoped Biome -> 15 files, no fixes.
- `pnpm brl` -> 55/55.
- `pnpm install` and Plate Next validation -> v23 valid, 42 active, 1 retired.
- registry changelog generation/check -> 41/41 source events.
- Browser -> code drawing, Excalidraw, classic list, cursor overlay, media,
  table, and Copilot routes render; zero warning/error diagnostics.
- Full `www` typecheck source parity passes, then unrelated suggestion fixture
  and line-height value diagnostics stop whole-app `tsc`.

Final handoff contract:
- PR line: N/A: no PR requested
- Issue / tracker line: N/A: no tracker
- Confidence line: high
- Flow table:
  - Reproduced: duplicate codeDrawing plugin diagnostic before aggregate filtering
  - Verified: focused tests/types and seven Browser routes pass
- Browser check: seven local standalone routes render with zero warning/error diagnostics
- Outcome: eight diffs classified; wrong changes repaired; correct owner moves retained; doctrine and release artifacts synced
- Caveat: whole-app `www` typecheck remains red only in unrelated suggestion and line-height files
- Design:
  - Chosen boundary: registry composition stays explicit; reusable semantics stay package-owned
  - Why not quick patch: copied selection/focus logic would immediately drift from DnD
  - Why not broader change: List and mention shared WIP are outside the eight-file task
- Verified: exact evidence listed above
- PR body verified: N/A: no PR requested

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
- PR: N/A: no PR requested
- Issue / tracker: N/A: no tracker
- Browser proof: seven standalone routes, expected visible DOM, zero warning/error diagnostics
- Caveats: whole-app typecheck has unrelated suggestion and line-height errors

Timeline:
- 2026-07-29T10:09:57.514Z Task goal plan created.
- 2026-07-29 Registry source and direct package owners repaired.
- 2026-07-29 Generated skills, barrels, changesets, and registry changelog synced.
- 2026-07-29 Focused tests/types/lint and seven Browser routes passed.
- 2026-07-29 Autoreview P2 accepted/fixed; unrelated mention finding rejected.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final handoff |
| What is the goal? | Correct eight registry diffs and repair owning Plate UI/Next doctrine |
| What have I learned? | Explicit copied-example wiring and runtime plugin uniqueness are separate requirements |
| What have I done? | Repaired source owners, doctrine, release artifacts, and all focused proof gates |

Open risks:
- Whole-app `www` typecheck remains blocked outside scope by
  `suggestion-base-kit.spec.ts` and `line-height-toolbar-button.tsx`.
- Unrelated shared `mention-node` WIP lacks this packet's changelog coverage by
  design; its owning task must release it separately.
