# Inline heading plugins in BasicBlocks kits

Objective:
Restore heading colocation in BasicBlocks kits; done when H1-H6 are inline,
standalone Heading kits and their teaching are gone, and www/docs/browser
proof passes.

Goal plan:
docs/plans/2026-07-23-inline-heading-plugins-in-basicblocks-kits.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)
- browser (docs/plans/templates/packs/browser.md)
- registry-changelog (docs/plans/templates/packs/registry-changelog.md)

Task source:
- type: direct user correction
- id / link: current Codex task
- title: Revert standalone Heading kit extraction
- acceptance criteria:
  - keep BaseH1-H6 and H1-H6 directly in the Base/live BasicBlocks registry kits
  - delete standalone registry `BaseHeadingKit` / `HeadingKit`
  - remove current docs teaching/imports created for those standalone kits
  - preserve package-owned individual heading plugin exports and behavior
  - verify source, www types/docs, and real registry/docs routes

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A
- semantics: N/A: no duration requested
- initial confidence score: N/A: binary cleanup outcome
- improvement loop: N/A: one-shot execution
- final score / loop closure: N/A: exact source and proof gates replace scoring

Completion threshold:
- `basic-blocks-base-kit.tsx` and `basic-blocks-kit.tsx` directly declare all
  six heading descriptors; standalone heading kit files and current docs
  references have zero matches; www type/docs checks, lint, Browser, review,
  and the plan checker pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-23-inline-heading-plugins-in-basicblocks-kits.md` passes.

Verification surface:
- source audit: exact registry files plus zero-match `rg` for
  `BaseHeadingKit|HeadingKit`
- commands in `/Users/zbeyens/git/plate-2`: `pnpm --filter www typecheck`,
  `pnpm --filter www build:source`, `pnpm --filter www check:docs`,
  `pnpm lint:fix`, registry changelog `--check`, and `git diff --check`
- Browser: `/blocks/basic-blocks-demo`, `/docs/heading`, and `/docs/static`;
  check rendered headings/content and console errors
- dirty-local autoreview with zero accepted/actionable findings

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: user correction, the exact BasicBlocks/Heading registry
  files, current references, and the active child-plugin plan row that caused
  the extraction.
- Allowed edit scope: the two BasicBlocks registry kit files, the two
  standalone Heading kit files, current docs/imports that reference them, this
  goal plan, and generated registry output only if an existing changelog source
  actually requires it.
- Browser surface: BasicBlocks standalone demo plus Heading and Static docs.
- Browser strategy: Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: direct user request, no external tracker.
- Non-goals: no package API/export changes, no heading behavior change, no
  unrelated child-plugin redesign, no template edits, no commit/PR/push.

Output budget strategy:
- Exact-file diffs/reads and bounded `rg` only; exclude generated public
  registry output until the changelog decision; cap every command output.

Blocked condition:
- Stop only if a current non-doc source consumer proves the standalone Heading
  kit has independent ownership that conflicts with the user's explicit
  colocation correction, or the real www/browser surface cannot run after one
  allowed environment repair.

Task state:
- task_type: registry refactor with supporting docs
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: ready_to_complete

Current verdict:
- verdict: valid
- confidence: high
- next owner: task
- reason: the standalone Heading kit has one real source consumer; same-run
  docs adoption does not establish reuse.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-23-inline-heading-plugins-in-basicblocks-kits.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Exact inline/delete/docs/proof requirements are recorded above. |
| Timed checkpoint parsed | N/A: no duration requested | Binary one-shot task. |
| Skill analysis before edits | yes | `task`, `autogoal`, `docs-creator`, Browser, `plate-ui`, `shadcn`, and `registry-changelog` loaded. |
| Active goal checked or created | yes | `get_goal` returned none; this plan is ready for the required goal handle. |
| Source of truth read before edits | yes | Exact diff, BasicBlocks kits, Heading kits, call sites, and causing plan rows read. |
| Tracker comments and attachments read | N/A: no tracker | Direct user correction. |
| Video transcript evidence required | N/A: no video | No media evidence. |
| `docs/solutions` checked for non-trivial existing-code work | N/A: direct reversal with exact owner evidence | No reusable solution lookup can change the requested colocation. |
| TDD decision before behavior change or bug fix | N/A: behavior-neutral colocation cleanup | Existing type/docs/browser proof is stronger than a new structure-only test. |
| Branch decision for code-changing task | N/A: user authorized current checkout | No branch operation requested. |
| Release artifact decision | yes | No package changeset; registry changelog N/A because this removes an unshipped local extraction and restores the preexisting copied-code shape. |
| Browser tool decision for browser surface | yes | Use in-app Browser on localhost routes. |
| PR expectation decision | N/A: no PR requested | Do not create one. |
| Tracker sync expectation decision | N/A: no tracker | No external sync. |
| Output budget strategy recorded | yes | Exact files and capped searches only. |
| Docs pack selected | yes | Supporting docs pack materialized. |
| `docs-creator` loaded | yes | Full skill read before docs edits. |
| Docs lane selected | yes | Plugin/feature plus serialization/static guide import cleanup. |
| Target docs and nearest sibling docs read | yes | Current Heading, Static, HTML, and Markdown references plus their source owners are in the bounded reference audit. |
| Docs style doctrine read | yes | Full `docs-creator` skill read. |
| Documented source owner identified | yes | Individual heading plugins are package-owned; their one reused preset remains the BasicBlocks registry kit. |
| Browser pack selected | yes | Browser pack materialized. |
| Browser route / app surface identified | yes | `/blocks/basic-blocks-demo`, `/docs/heading`, `/docs/static`. |
| Browser tool decision recorded | yes | In-app Browser; no native Chrome surface. |
| Console/network caveat policy recorded | yes | Record console errors and any unrelated dev-server noise separately. |
| Registry changelog pack selected | yes | Registry changelog pack materialized. |
| User-visible registry impact classified | N/A: unshipped local extraction reversal | Final copied BasicBlocks composition matches the pre-extraction source shape. |
| Source entry path selected | N/A: no registry changelog event | Do not announce a net-zero local reversal. |
| Generator command selected | yes | Run `node tooling/scripts/generate-ui-changelog-entries.mjs --check`; no `--write` without a source entry. |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: no duration.
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
| Named verification threshold | yes | Run named proof | Source audit, docs checks, browser proof, and clean review recorded below. |
| Bug reproduced before fix | N/A: structure correction | Record repro or reason | Exact diff and one-consumer audit proved the over-extraction. |
| Targeted behavior verification | yes | Run focused proof | Basic Blocks demo rendered H1-H3, blockquote, and horizontal rule. |
| TypeScript or typed config changed | yes | Run relevant typecheck | Initial www typecheck passed; final registry source check passed after metadata repair. A later full rerun was blocked only by unrelated shared completion-probe and AI Markdown typing edits. |
| Package exports or file layout changed | N/A: registry files only | Run barrels if package exports move | No package barrel changed. |
| Package manifests or install graph changed | N/A: registry metadata only | Install if manifests change | No manifest or lockfile changed. |
| Agent rules or skills changed | N/A | Regenerate skills if needed | No agent source changed. |
| Workspace authority proof | yes | Use owning checkout and app | All commands ran in `/Users/zbeyens/git/plate-2`; Browser used localhost:3000. |
| Browser final proof | yes | Verify affected routes | Demo, Heading docs, and Static docs rendered with zero console errors. |
| CI-controlled template output changed | N/A | Avoid template edits | No template file changed. |
| Package behavior or public API changed | N/A | Add changeset if applicable | Registry colocation only; no package API or release delta. |
| Registry changelog | N/A: unshipped reversal | Check generator state | Changelog `--check` passed; no net user-facing event to announce. |
| Docs or content changed | yes | Validate MDX and rendered pages | `build:source`, `check:docs`, source parity, and Browser passed. |
| High-risk mini gate | N/A: behavior-neutral ownership cleanup | Record proof | Clean-install dependency risk was found and fixed in registry metadata. |
| Agent-native review | N/A | Review agent changes if present | No agent tooling changed. |
| Local install corruption | N/A | Reinstall only on matching failure | No install-corruption signal occurred. |
| Autoreview | yes | Review dirty local scope | First pass found missing direct dependency; final pass was clean with no actionable findings. |
| PR / tracker / proof hosting | N/A: not requested | Sync only when requested | No commit, push, PR, or tracker action. |
| Final lint | yes | Run scoped equivalent | Biome checked three changed registry TS/TSX files; no fixes needed. |
| Output budget discipline | yes | Keep reads bounded | Exact files, bounded searches, and capped outputs used. |
| Timed checkpoint | N/A: no duration | Record reason | No timed request. |
| Goal plan complete | yes | Run completion checker | Checker is the final command after this receipt. |
| Registry generator test | N/A | Run only for generator changes | Generator/schema/source layout unchanged. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Exact diff, consumers, docs, registry metadata, and causing plan audited. | done |
| Implementation | complete | H1-H6 restored inline; standalone kits/entries removed; docs and plan repaired. | done |
| Verification | complete | Static checks, Browser, source audit, and final autoreview complete. | done |
| PR / tracker sync | N/A | User requested local edits only. | done |
| Closeout | complete | Final evidence and caveat recorded. | final response |

Findings:
- The child-plugin plan extracted a standalone Heading preset with no
  independent source consumer.
- Deleting that preset removed a transitive `@platejs/basic-nodes` registry
  dependency; both Basic Blocks registry items now declare it directly.

Decisions and tradeoffs:
- Keep the six descriptors inline in each coherent Basic Blocks owner. File
  size is irrelevant here; extraction needs independent reuse.
- Keep individual package H1-H6 exports. Do not restore deleted package
  grouping descriptors.
- Do not create a changelog entry for an unshipped, net-zero local reversal.

Implementation notes:
- Restored exact H1-H6 imports/configuration in the base and React Basic Blocks
  kits.
- Deleted standalone Heading kit files and registry entries.
- Replaced their docs teaching with Basic Blocks owners and repaired the
  causal architecture plan.

Review fixes:
- Accepted P1: add direct `@platejs/basic-nodes` dependencies to both Basic
  Blocks registry items. Final autoreview returned no findings.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Final broad www typecheck saw concurrent shared WIP errors | 1 | Keep ownership scoped and use the already-green initial run plus final registry source check | Errors are in `editor-kit.completion-probe.ts` and `ai-kit.tsx`, outside this task; no unrelated source edit. |

Verification evidence:
- `pnpm --filter www typecheck`: passed before the final metadata-only repair.
- Final `pnpm --filter www typecheck`: MDX, docs parity, and registry source
  checks passed before unrelated shared `completion-probe` / AI Markdown type
  errors stopped `tsc`.
- `pnpm --filter www build:source`: passed.
- `pnpm --filter www check:docs`: passed.
- `node tooling/scripts/generate-ui-changelog-entries.mjs --check`: passed,
  29 source events.
- Scoped Biome: three registry TS/TSX files clean.
- Zero matches for
  `BaseHeadingKit|HeadingKit|heading-base-kit|heading-kit` across live app,
  content, and the causing plan.
- `git diff --check`: passed.
- Browser: `/blocks/basic-blocks-demo`, `/docs/heading`, and `/docs/static`
  rendered the expected owners/content with zero console errors.
- Final scoped autoreview: clean, no accepted/actionable findings.

Final handoff contract:
- PR line: N/A: no PR requested.
- Issue / tracker line: N/A: direct user request.
- Confidence line: high.
- Flow table:
  - Reproduced: exact structural diff and one-consumer source audit.
  - Verified: source/docs checks, Browser, and final autoreview.
- Browser check: three target routes passed with zero console errors.
- Outcome: heading plugins are colocated in Basic Blocks; standalone Heading
  kits and their teaching are gone.
- Caveat: the final broad www `tsc` phase is blocked by unrelated concurrent
  shared WIP; the same command passed earlier, and its final docs/registry
  phases passed after this task's last source repair.
- Design:
  - Chosen boundary: Basic Blocks owns its one-use heading configuration.
  - Why not quick patch: deleting only the files would leave stale registry
    metadata, docs, and clean-install dependencies.
  - Why not broader change: package individual descriptors and child-plugin
    architecture remain valid.
- Verified: exact source, metadata, docs, Browser, and review.
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
- Issue / tracker: N/A: direct task.
- Browser proof: demo plus Heading and Static docs passed.
- Caveats: unrelated shared www type errors recorded above.

Timeline:
- 2026-07-23T23:11:24.937Z Task goal plan created.
- 2026-07-23T23:26Z Source, docs, registry metadata, Browser, and review closed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete. |
| Where am I going? | Final response. |
| What is the goal? | Keep H1-H6 inline in Basic Blocks and remove the fake standalone Heading kits. |
| What have I learned? | The extraction had one consumer and hid a required registry dependency. |
| What have I done? | Restored colocation, repaired docs/plan/metadata, and verified the result. |

Open risks:
- None in this task. Unrelated shared www type errors remain owned by their
  active completion-probe and AI Markdown work.
