# Unify Markdown registry kit

Objective:
Unify Markdown into one runtime-neutral registry kit; done when
`markdown-base-kit` has zero live references, both editors compose the correct
Footnote renderer family, and focused checks pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-24-unify-markdown-registry-kit.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)
- agent-native (docs/plans/templates/packs/agent-native.md)
- registry-changelog (docs/plans/templates/packs/registry-changelog.md)

Task source:
- type: direct user correction
- id / link: N/A
- title: Delete redundant Base Markdown registry kit
- acceptance criteria:
  - `markdown-kit.tsx` is runtime-neutral and has no `'use client'`.
  - `MarkdownKit` owns only Markdown parser/configuration policy.
  - `EditorKit` composes `FootnoteKit` and `MarkdownKit`.
  - `BaseEditorKit` composes `BaseFootnoteKit` and `MarkdownKit`.
  - `markdown-base-kit.tsx`, its registry item, and all live references are
    deleted.
  - Registry install metadata, focused tests, changelog artifacts, formatting,
    typecheck to the nearest honest boundary, Browser attempt, and autoreview
    are complete.
  - The reusable “share runtime-neutral kits; split renderer owners” correction
    is captured in Best API, Plate UI, and Plate Vision source doctrine, with
    generated skills synced and agent-native proof complete.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A
- semantics: N/A; no duration requested
- initial confidence score: N/A; binary ownership threshold applies
- improvement loop: cut redundant owner, audit references/metadata, verify,
  review
- final score / loop closure: N/A; close at zero live references and clean proof

Completion threshold:
- Zero live source or registry metadata references to `markdown-base-kit` or
  `BaseMarkdownKit`.
- Exactly one registry Markdown kit exists and it imports no React/live/static
  Footnote renderer.
- Live and base editor presets each publish the correct Footnote renderers once
  while sharing the same `MarkdownKit`.
- Focused registry tests/checks, changelog generation/check, scoped
  format/lint, bounded typecheck, Browser attempt/caveat, and clean autoreview
  are recorded.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-24-unify-markdown-registry-kit.md` passes.

Verification surface:
- `rg` audit for `markdown-base-kit|BaseMarkdownKit`.
- Focused Markdown/registry tests and registry source checker.
- `pnpm --filter www typecheck` to the nearest checkout-owned boundary.
- Registry changelog generator `--write` and `--check`.
- Scoped Biome/Prettier, `git diff --check`, Browser attempt on
  `/blocks/markdown-demo`, and dirty local autoreview.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: current Markdown/Footnote registry kits, live/base editor
  presets, `registry-kits.ts`, focused tests, registry source checker, and the
  accepted Best API correction in the latest user turn.
- Allowed edit scope: those registry owners, the current 2026-07-24 registry
  changelog entry/generated artifacts, focused tests/checker if needed, Best
  API/Plate UI source rules and generated mirrors, Plate Vision, and this plan.
- Browser surface: `/blocks/markdown-demo`.
- Browser strategy: Browser only; no native browser/OS behavior applies.
- Tracker sync: N/A; direct user task.
- Non-goals: package API/runtime changes, Footnote package redesign, generated
  registry build output, unrelated shared List repairs, PR/commit/push.

Output budget strategy:
- Use exact symbol/registry-item searches capped with `head`; read only
  implicated kit/editor/test/metadata ranges; exclude generated registry output
  except the single changelog event produced by its generator.

Blocked condition:
- Block only if the same neutral Markdown descriptor cannot legally compose in
  both `createPlateEditor` and `createBaseEditor` after focused source/type
  proof, with no narrower registry-owned fix remaining.

Task state:
- task_type: registry ownership hard cut
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: complete

Current verdict:
- verdict: valid; `BaseMarkdownKit` is a fake owner created by misplaced
  Footnote renderer composition
- confidence: high from `MarkdownPlugin = createBasePlugin` and identical
  Markdown configuration in both current kits
- next owner: task
- reason: one reusable runtime-neutral parser policy plus renderer-specific
  Footnote kits is the smallest truthful model

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-24-unify-markdown-registry-kit.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Latest user accepted deletion of redundant base Markdown owner; exact hard-cut criteria are above. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Skill analysis before edits | yes | Loaded Best API for target choice, then Autogoal, Task, Plate UI registry rules, and Registry Changelog for execution. |
| Active goal checked or created | yes | New active goal points at this plan. |
| Source of truth read before edits | yes | Read both Markdown/Footnote kits, MarkdownPlugin owner, editor presets, registry items/dependencies, focused test, and prior plans. |
| Tracker comments and attachments read | no | N/A: direct user task. |
| Video transcript evidence required | no | N/A: no video. |
| `docs/solutions` checked for non-trivial existing-code work | yes | No matching solution; prior plans record the superseded duplicated-kit decision and package tests already treat MarkdownKit as parser policy. |
| TDD decision before behavior change or bug fix | yes | Refactor preserves parser/render behavior; update focused ownership/runtime test rather than fake pre-fix TDD. |
| Branch decision for code-changing task | no | N/A: no branch/PR requested. |
| Release artifact decision | yes | Registry-only install/composition change updates existing 2026-07-24 registry changelog event; no package changeset. |
| Browser tool decision for browser surface | yes | Attempt Browser on `/blocks/markdown-demo`; record unrelated shared List blocker without editing it. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker. |
| Output budget strategy recorded | yes | Exact/capped owner searches and narrow file reads only. |
| Registry changelog pack selected | yes | Materialized in this plan. |
| User-visible registry impact classified | yes | `markdown-base-kit` registry item is removed; both editor presets install the shared `markdown-kit` plus their own Footnote kit. |
| Source entry path selected | yes | Update `apps/www/src/registry/changelog/entries/2026-07-24-compose-markdown-footnotes.mdx`. |
| Generator command selected | yes | Edit source with `apply_patch`, then run generator `--write` and `--check`. |
| Docs pack selected | yes | Supporting Plate Vision doctrine changed; task remains registry-dominant. |
| `docs-creator` loaded | yes | Loaded after the reusable correction entered Plate Vision scope. |
| Docs lane selected | yes | Spec/law/behavior doctrine lane. |
| Target docs and nearest sibling docs read | yes | Read root Vision, common Vision, and Plate Vision; only Plate detail owns this correction. |
| Docs style doctrine read | yes | Loaded `docs-creator`; current-state ownership law applies. |
| Documented source owner identified | yes | `.agents/rules/best-api.mdc` owns API method; `docs/vision/plate.md` owns durable Plate doctrine. |
| Agent-native pack selected | yes | Best API and Plate UI source rules changed. |
| Agent-facing action surface identified | yes | Future kit reviews must distinguish runtime-neutral policy from renderer-specific ownership. |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/*.mdc`; regenerate `.agents/skills/*/SKILL.md` through `pnpm install`. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded before rule edits and closeout review. |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: no duration requested.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is N/A: no video supplied.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary: `MarkdownKit` owns
      runtime-neutral parser policy; live/base editor presets own their matching
      Footnote renderer kits.
- [x] Release artifact requirement recorded: registry changelog only; no package
      changeset.
- [x] Final handoff shape decided: report deleted owner/references, focused
      proof, Browser caveat, review result, and no Git/tracker action.
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded as N/A: no Git/PR action requested.
- [x] Local-env-rot retry policy recorded: deterministic shared List source
      errors are not install corruption; reinstall only if a new env-shaped
      failure appears.
- [x] Workspace authority recorded: all proof runs from
      `/Users/zbeyens/git/plate-2`, with `www` owning registry checks/runtime.
- [x] High-risk note recorded for registry install behavior: failure mode is a
      copied editor missing either Markdown or the correct Footnote renderer;
      prove both editor compositions and registry dependency closure.
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason.
- [x] Review/autoreview target selected: dirty local mode with exact Markdown
      registry hard-cut scope.
- [x] Agent-native review decision recorded: Best API self-maintenance changed
      source rules, so generated skill sync and agent-native review apply.
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Registry changelog pack: user-visible registry impact is recorded.
- [x] Registry changelog pack: source entry exists at
      `apps/www/src/registry/changelog/entries/2026-07-24-compose-markdown-footnotes.mdx`.
- [x] Registry changelog pack: entry frontmatter follows the contract in
      `.agents/skills/registry-changelog/SKILL.md`; generator check passes.
- [x] Registry changelog pack: row bullets name the real `markdown-kit`,
      `editor-kit`, `editor-ai`, and `editor-base-kit` ids in backticks.
- [x] Registry changelog pack: generated `/registry/changelog/*.json`,
      `index.json`, and `components.json` were updated by the generator
      `--write`, never by hand.
- [x] Registry changelog pack: package changeset is N/A because no package code
      changes.
- [x] Docs pack: spec/law doctrine lane, Plate Vision target, root/common
      sibling context, and Best API source owner are recorded.
- [x] Docs pack: every named kit/plugin concept is source-backed by the
      Markdown/Footnote registry owners.
- [x] Docs pack: Plate Vision uses current-state ownership law, not changelog
      voice.
- [x] Docs pack: links, anchors, and previews are N/A because no route, link, or
      preview changed.
- [x] Agent-native pack: source `.agents/rules/*.mdc` files were edited instead
      of generated skill mirrors.
- [x] Agent-native pack: the runtime-neutral versus renderer-specific kit
      decision is explicit in Best API and Plate UI rule text.
- [x] Agent-native pack: `pnpm install` regenerated skill mirrors after source
      rule edits.
- [x] Agent-native pack: review passed with no accepted/actionable findings;
      source rules, Plate Vision, generated mirrors, and the public registry
      shape agree.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Zero live `markdown-base-kit`/`BaseMarkdownKit` references; focused tests pass 7/7 with 166 assertions. |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: ownership refactor; duplicate live/base kit source was the pre-change evidence. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | Markdown and registry tests pass 7/7; isolated live/static Footnote composition publishes the expected renderer once. |
| TypeScript or typed config changed | yes | Run relevant typecheck | Focused typed tests and registry source checker pass. Whole `www` typecheck reaches unrelated shared `block-draggable.tsx` List API/implicit-any errors; no Markdown error. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: deleted registry source item, not a package export/barrel; `pnpm brl` does not apply. |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A for package manifests/lockfile; `pnpm install` still passed for agent-rule mirror generation. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `pnpm install` passed after source formatting; exact source/mirror `rg` audit found the runtime-neutral doctrine in both generated skills. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All commands ran in `/Users/zbeyens/git/plate-2`; registry checks used the `www` workspace and Browser used its live route. |
| Browser surface changed | yes | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | Browser loaded `/blocks/markdown-demo` with HTTP 200 and rendered editor DOM. |
| Browser final proof | yes | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | Browser console contained zero warnings/errors on the Markdown demo; dev server stopped after proof. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no `templates/**` edits and no registry build. |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: registry install/composition only; no package source or published package API changed. |
| Registry-only component work changed | yes | Update `docs/components/changelog.mdx` or record N/A | Authoritative registry changelog source and generated JSON updated; legacy `docs/components/changelog.mdx` is not this registry's changelog owner. |
| Docs or content changed | yes | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | Plate Vision claim is source-backed; `pnpm --filter www build:source && pnpm --filter www check:docs` passes. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Failure mode was missing parser or wrong Footnote renderer after install; exact composition tests, metadata checks, and Browser proof cover it. |
| Agent-native review for agent/tooling changes | yes | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | Loaded reviewer; capability map and source/mirror audit pass with no findings. |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no env-rot signature; remaining whole-www type errors are deterministic shared List source errors. |
| Autoreview for non-trivial implementation changes | yes | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | Dirty local autoreview passed with no accepted/actionable findings; correctness confidence 0.86. |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: user did not request Git/PR action. |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A: no PR. |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR. |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: direct user task, no tracker. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled below. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | Scoped Biome and Prettier pass; `git diff --check` passes. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Used exact/capped searches and narrow reads; no unbounded output. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-24-unify-markdown-registry-kit.md` | Pass after all product, proof, review, and handoff evidence was recorded. |
| Registry impact classification | yes | Record user-visible registry delta or N/A reason | `markdown-base-kit` is removed; live/base editor installs share `markdown-kit` and directly own matching Footnote kits. |
| Registry changelog source | yes | Add/update `apps/www/src/registry/changelog/entries/*.mdx` or record N/A | Updated `2026-07-24-compose-markdown-footnotes.mdx`. |
| Registry changelog generation | yes | Run `node tooling/scripts/generate-ui-changelog-entries.mjs --write` when a source entry is required | Generator `--write` completed; 31 current events include concurrent shared entries. |
| Registry changelog check | yes | Run `node tooling/scripts/generate-ui-changelog-entries.mjs --check` | Pass: 31 events. |
| Registry generator test | no | If generator/schema/source layout changed, run `bun test tooling/scripts/generate-ui-changelog-entries.test.mjs`; otherwise N/A | N/A: generator/schema/source layout unchanged. |
| Registry package release split | yes | Record `.changeset`, registry changelog, both, or N/A with reason | Registry changelog only; no package changeset because package source/API did not change. |
| Docs source-backed claim audit | yes | Verify docs claims against current source or record N/A | Plate Vision wording matches the neutral `MarkdownKit` plus platform Footnote-kit composition. |
| Docs links / routes / previews | no | Verify leaf links, routes, anchors, and preview names or record N/A | N/A: no link, route, anchor, or preview-name change. |
| Docs MDX/content parser | yes | Run `pnpm --filter www build:source` for MDX/content changes, or record N/A | `pnpm --filter www build:source && pnpm --filter www check:docs` passes. |
| Plugin page specifics | no | For plugin pages, apply `docs-creator` kit/manual/API rules; otherwise N/A | N/A: Vision law and registry changelog, not a plugin reference page. |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | `pnpm install` passes after final source-rule formatting. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | New ownership law appears in Best API and Plate UI source rules and their generated skills. |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | Pass; no accepted/actionable findings. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read Markdown/Footnote owners, editor presets, registry metadata, doctrine, and prior plan context. | implementation |
| Implementation | complete | Unified neutral Markdown owner; moved Footnote composition; deleted base item; repaired metadata/tests/changelog/doctrine. | verification |
| Verification | complete | Focused 7/7, source checker, changelog 31 events, docs, formatting, Browser, and autoreview pass. | closeout |
| PR / tracker sync | complete | N/A: no PR or tracker requested. | final response |
| Closeout | complete | Completion evidence recorded; final checker is the remaining mechanical command. | final response |

Findings:
- `MarkdownPlugin` is created with `createBasePlugin`; it has no React owner.
- The two Markdown kits are identical except for live/static Footnote kit
  composition and the live file's `'use client'`.
- Markdown already parses node families such as headings, lists, tables, and
  Footnotes without owning their renderer kits; Footnotes are not a special
  Markdown-owned exception.
- Prior plans encode the superseded duplicate-kit decision; the latest explicit
  user correction is authoritative.
- Best API self-maintenance makes this correction durable: runtime-neutral
  policy stays shared; platform-specific renderer owners split.

Decisions and tradeoffs:
- Keep one registry-owned `MarkdownKit` because its configured parser policy is
  reused by live/base editors and examples.
- Move Footnote kit composition to each editor preset; delete the fake
  `BaseMarkdownKit` owner instead of adding another shared helper.

Implementation notes:
- Removed `'use client'` and Footnote ownership from
  `plugins/markdown-kit.tsx`; it contains only configured `MarkdownPlugin`.
- Deleted `plugins/markdown-base-kit.tsx` and its registry item.
- `editor-kit` and `editor-ai` compose `FootnoteKit`; `editor-base-kit`
  composes `BaseFootnoteKit`; all three compose the same `MarkdownKit`.
- Updated registry dependency graphs and focused ownership/runtime tests.
- Updated authoritative registry changelog source/generated artifacts.
- Repaired Best API, Plate UI, and Plate Vision doctrine and regenerated skill
  mirrors.

Review fixes:
- Autoreview and agent-native review returned no accepted/actionable findings.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Full `EditorKit` import in Bun test hit unrelated Excalidraw CSS loader failure | 1 | Test the exact Markdown plus Footnote composition boundary | Focused composition test passes without hiding product behavior behind a full-app mock. |
| Registry assertion searched `editor-ai` only in `registryKits` | 1 | Include the authoritative `registryBlocks` source | Dependency assertion passes. |
| Prettier did not infer a parser for `.mdc` | 1 | Pass `--parser markdown` | Source rules formatted and generated mirrors resynced. |
| Whole `www` typecheck reached shared List API errors in `block-draggable.tsx` | 1 | Keep scope; use source checker, focused typed tests, and Browser as nearest honest boundary | No Markdown error; external shared blocker recorded, not patched. |

Verification evidence:
- `rg -n "markdown-base-kit|BaseMarkdownKit" apps/www/src/registry
  --glob '!registry-shadcn.json' --glob '!__registry__/**'`: zero matches.
- `bun test .../markdown-kit.spec.ts .../registry.test.ts`: 7/7 pass,
  166 assertions.
- `pnpm --filter www exec tsx --tsconfig
  ./scripts/tsconfig.scripts.json scripts/check-registry-source.mts`: pass.
- Registry changelog generator `--check`: pass, 31 events.
- `pnpm --filter www build:source && pnpm --filter www check:docs`: pass.
- Scoped Biome, Prettier, and `git diff --check`: pass.
- `pnpm install`: pass after final `.agents/rules/**` formatting; generated
  Best API and Plate UI mirrors contain the new law.
- Browser `/blocks/markdown-demo`: HTTP 200, rendered editor, zero
  warnings/errors.
- Dirty local autoreview: pass, no accepted/actionable findings.
- Whole `pnpm --filter www typecheck`: external shared
  `apps/www/src/registry/ui/block-draggable.tsx` List API and implicit-any
  errors only.

Final handoff contract:
- PR line: N/A; no Git/PR action requested.
- Issue / tracker line: N/A; direct user task.
- Confidence line: high; exact ownership, dependency, runtime, docs, Browser,
  and review proof pass.
- Flow table:
  - Reproduced: duplicate runtime-neutral kit and split Footnote ownership
    confirmed from source; browser N/A before refactor.
  - Verified: focused tests 7/7; Browser HTTP 200 with zero console issues.
- Browser check: `/blocks/markdown-demo` rendered successfully with no
  warnings/errors.
- Outcome: one runtime-neutral `MarkdownKit`; live/base editors directly
  compose their correct Footnote renderers; redundant base kit/item is gone.
- Caveat: whole-www typecheck is blocked only by unrelated shared List typing
  in `block-draggable.tsx`; all nearest task-owned typed/runtime checks pass.
- Design:
  - Chosen boundary: neutral parser policy in one kit; platform renderers in
    editor-owned Footnote kits.
  - Why not quick patch: retaining parallel Markdown kits would preserve a fake
    owner and invite drift.
  - Why not broader change: package/runtime APIs are already correct; this was
    registry ownership debt.
- Verified: exact source audit, focused tests/checkers, generated changelog,
  docs parser/check, formatting, Browser, and clean reviews.
- PR body verified: N/A; no PR.

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
- PR: N/A; not requested.
- Issue / tracker: N/A; direct user task.
- Browser proof: `/blocks/markdown-demo`, HTTP 200, rendered editor, zero
  warning/error logs.
- Caveats: unrelated shared List typing prevents a clean whole-www typecheck;
  task-owned proof is green.

Timeline:
- 2026-07-24T08:54:12.442Z Task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | One runtime-neutral Markdown registry kit with editor-owned Footnote renderers and zero redundant base-kit references |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- External shared List API typing in `block-draggable.tsx` keeps whole-www
  typecheck red. It does not touch this ownership lane; focused typed/runtime
  proof and Browser are green.
