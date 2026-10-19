# Decouple live and base registry kits

Objective:
Decouple live/base registry kits; done when Markdown is self-contained, audit
finds zero dishonest cross-layer imports/dependencies, and focused checks pass;
plan docs/plans/2026-07-24-decouple-live-and-base-registry-kits.md.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-24-decouple-live-and-base-registry-kits.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- registry-changelog (docs/plans/templates/packs/registry-changelog.md)

Task source:
- type: direct user correction
- id / link: N/A
- title: Decouple live and base registry kits
- acceptance criteria:
  - `markdown-kit.tsx` does not import implementation from
    `markdown-base-kit.tsx`.
  - The live and base Markdown kits each own their inferred plugin declaration.
  - `markdown-kit` no longer declares `markdown-base-kit` as a registry
    dependency.
  - Every registry live↔base import and live-item→base-item registry dependency
    is audited and classified; other dishonest couplings are repaired.
  - Focused tests, registry checks, changelog generation, formatting,
    typecheck to the nearest honest boundary, Browser attempt, and autoreview
    are recorded.

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
- initial confidence score: N/A; binary source-audit threshold applies
- improvement loop: audit imports and registry metadata, repair, verify, review
- final score / loop closure: N/A; close on zero dishonest cross-layer edges

Completion threshold:
- Zero live registry kit source files import a `*-base-kit` implementation.
- Zero live registry items depend on a `*-base-kit` unless the installed live
  item genuinely composes and uses that full base preset.
- Markdown live/base kits remain behaviorally equivalent where intended,
  independently installable, and publish Footnote plugins once.
- Focused tests, registry source validation, changelog check, scoped
  lint/format, bounded typecheck, Browser attempt/caveat, and clean autoreview
  are recorded.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-24-decouple-live-and-base-registry-kits.md` passes.

Verification surface:
- Source audits over `apps/www/src/registry/**` imports and
  `registryDependencies`.
- `bun test
  apps/www/src/registry/components/editor/plugins/markdown-kit.spec.ts`.
- `pnpm --filter www exec tsx --tsconfig
  ./scripts/tsconfig.scripts.json scripts/check-registry-source.mts`.
- `pnpm --filter www typecheck` to the nearest checkout-owned boundary.
- Registry changelog `--write` and `--check`.
- Scoped Biome/ESLint/Prettier, `git diff --check`, Browser attempt, and
  bounded dirty-tree autoreview.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: current registry kit files, `registry-kits.ts`, registry
  source checker/tests, current changelog source, and accepted `best-api`/Plate
  ownership doctrine.
- Allowed edit scope: affected registry kit files/metadata/tests/changelog,
  this plan, and the smallest checker/test owner if the audit reveals an
  unenforced recurring invariant.
- Browser surface: `/blocks/markdown-demo` or the closest installed Markdown
  demo; expected shared List compile blocker must be recorded rather than
  patched here.
- Browser strategy: Browser only; no native browser/OS behavior applies.
- Tracker sync: N/A; direct user task without tracker.
- Non-goals: package API/runtime changes, package changesets, generated
  registry build output, unrelated shared List repairs, and a shared
  `markdown-config` helper/registry item.

Output budget strategy:
- Use filename/count audits first, cap matching lines with `head`, inspect only
  implicated kit pairs/metadata rows, and exclude generated registry output
  except the changelog JSON produced by its generator.

Blocked condition:
- Block only if registry install semantics cannot distinguish a real composed
  dependency from stale metadata after source, checker, registry tests, and
  shadcn item generation owners are exhausted.

Task state:
- task_type: registry ownership refactor and exhaustive audit
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: complete

Current verdict:
- verdict: valid; live→base implementation reuse is dishonest coupling
- confidence: high from current source and accepted ownership doctrine
- next owner: task
- reason: live/base presets are independently installable product owners;
  tiny duplicated inferred configuration is cheaper than a cross-layer
  registry dependency.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-24-decouple-live-and-base-registry-kits.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Decouple Markdown and find every other such coupling; exact source and metadata thresholds are recorded above. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Skill analysis before edits | yes | Loaded `best-api`, `task`, `autogoal`, `plate-ui`, `shadcn`, and `registry-changelog`; `docs-creator` is N/A because public docs are not changing. |
| Active goal checked or created | yes | New active goal points to this plan. |
| Source of truth read before edits | yes | Read Markdown live/base files, comparable kit pairs, registry metadata, current Vision/doctrine, registry guide, prior install-path plan, and solution note. |
| Tracker comments and attachments read | no | N/A: direct user request without tracker. |
| Video transcript evidence required | no | N/A: no video. |
| `docs/solutions` checked for non-trivial existing-code work | yes | Registry helper/install-path solution and issue #4971 plan confirm metadata must match real copied-code imports. |
| TDD decision before behavior change or bug fix | yes | Behavior remains unchanged; extend focused current-behavior/source contracts only where the audit invariant needs proof. |
| Branch decision for code-changing task | no | N/A: user did not request branch/PR and repo policy forbids unsolicited Git actions. |
| Release artifact decision | yes | Registry-only visible install-shape correction updates the existing 2026-07-24 registry changelog event; no package changeset. |
| Browser tool decision for browser surface | yes | Attempt Browser on Markdown demo; record the shared List compile blocker without editing it. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker. |
| Output budget strategy recorded | yes | Capped owner searches and exact implicated file reads only. |
| Registry changelog pack selected | yes | Materialized in this plan. |
| User-visible registry impact classified | yes | Copied `markdown-kit` install graph becomes independent of `markdown-base-kit`. |
| Source entry path selected | yes | Update `apps/www/src/registry/changelog/entries/2026-07-24-compose-markdown-footnotes.mdx`. |
| Generator command selected | yes | Edit source with `apply_patch`, then run generator `--write` and `--check`. |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; N/A because no duration was requested.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is N/A because no video was
      supplied.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the registry ownership boundary and adds a source
      checker so stale cross-layer dependencies cannot return.
- [x] Release artifact requirement recorded: update the existing registry
      changelog event; no package changeset.
      N/A with reason.
- [x] Final handoff shape decided: bug/feature/testing/batch/review/tracker
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded as N/A because no Git/PR action was requested.
- [x] Local-env-rot retry policy recorded: N/A because the final app failure is
      a source-owned missing List export, not install corruption.
- [x] Workspace authority recorded: all commands ran from
      `/Users/zbeyens/git/plate-2`; app checks ran through the `www` owner.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason: install-graph risk was missing transitive registry UI
      items; focused source validation and autoreview found and repaired it.
- [x] Review/autoreview target selected from actual diff state for non-trivial
      implementation work: dirty local mode with an explicit registry-only
      file and contract prompt.
- [x] Agent-native review decision recorded as N/A because no agent/tooling
      source is changing.
- [x] Output budget discipline recorded: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Registry changelog pack: copied-code install graph impact is recorded.
- [x] Registry changelog pack: source entry exists at
      `apps/www/src/registry/changelog/entries/2026-07-24-compose-markdown-footnotes.mdx`.
- [x] Registry changelog pack: entry frontmatter follows the contract in
      `.agents/skills/registry-changelog/SKILL.md`; generator check passes.
- [x] Registry changelog pack: row bullets name real registry item ids in
      backticks.
- [x] Registry changelog pack: generated `/registry/changelog/*.json`,
      `index.json`, and `components.json` were updated by the generator.
- [x] Registry changelog pack: no package code changes, so package changeset is
      N/A separately.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named source audit and focused proof | Source checker passes with zero dishonest edges; tests pass 5/5. |
| Bug reproduced before fix | yes | Record failing source repro | Guard first failed on 22 live dependencies plus one live import, then exposed two more stale base dependencies. |
| Targeted behavior verification | yes | Run focused tests/proof | Markdown and registry tests pass 5/5 with 158 assertions. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `www` typecheck passed before concurrent List edits; final rerun reaches only unrelated `block-draggable.tsx` List errors. |
| Package exports or file layout changed | no | N/A | No package exports or public files moved; `pnpm brl` is N/A. |
| Package manifests, lockfile, or install graph changed | no | N/A | Registry metadata changed, not package-manager manifests/lockfile; install graph is covered by source check and review. |
| Agent rules or skills changed | no | N/A | No agent rule or skill edits. |
| Workspace authority proof | yes | Use owning repo/app | All proof ran in `/Users/zbeyens/git/plate-2`; `www` owns registry checks and typecheck. |
| Browser surface changed | yes | Attempt Browser proof | Browser opened `/blocks/markdown-demo`; app compilation is blocked by unrelated List export drift. |
| Browser final proof | yes | Record exact caveat | Route returns 500 because `block-draggable.tsx` imports missing `expandListItemsWithChildren`; no packet-owned browser error observed. |
| CI-controlled template output changed | no | N/A | No `templates/**` edits and no registry build command. |
| Package behavior or public API changed | no | N/A | Registry copied-source metadata only; no package changeset. |
| Registry-only component work changed | yes | Use current registry changelog owner | Updated the authoritative registry changelog source and generated JSON; legacy `docs/components/changelog.mdx` is N/A. |
| Docs or content changed | no | N/A | Only task plan and registry changelog source changed; generator and formatting checks pass. |
| High-risk mini gate | yes | Prove install graph | Autoreview found missing direct `@plate/editor`; repaired and clean re-review confirms copied imports are installed. |
| Agent-native review for agent/tooling changes | no | N/A | No agent/tooling source changed. |
| Local install corruption suspected | no | N/A | Failure is deterministic missing List source export, not environment rot. |
| Autoreview for non-trivial implementation changes | yes | Run dirty local review to clean | First review found one accepted P1; fixed direct dependency; second review reports no accepted/actionable findings. |
| PR create or update | no | N/A | User did not request Git/PR action. |
| Task-style PR body verified | no | N/A | No PR exists or was requested. |
| PR proof image hosting | no | N/A | No PR and no successful browser image. |
| Tracker sync-back | no | N/A | Direct task without tracker. |
| Final handoff contract | yes | Fill fields below | Complete below with exact proof and caveat. |
| Final lint | yes | Run scoped equivalent | Biome passes on six TS files; Prettier passes on changelog MDX; `git diff --check` passes. |
| Output budget discipline | yes | Keep searches bounded | Searches were exact/capped; one dev-server error stream was verbose but immediately stopped and summarized. |
| Timed checkpoint | no | N/A | No duration requested. |
| Goal plan complete | yes | Run completion checker | Run after this plan update. |
| Registry impact classification | yes | Record install delta | Live kits no longer co-install independent base presets; `editor-ai` directly installs `@plate/editor`. |
| Registry changelog source | yes | Update source entry | Updated `2026-07-24-compose-markdown-footnotes.mdx`. |
| Registry changelog generation | yes | Run generator write | Generator wrote 30 events. |
| Registry changelog check | yes | Run generator check | Generator check passes for all 30 events. |
| Registry generator test | no | N/A | Generator/schema/source layout unchanged. |
| Registry package release split | yes | Record release artifact | Registry changelog only; package changeset N/A. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Goal, requirements, doctrine, kit pairs, registry metadata, prior plan, and solution owner read. | implementation |
| Implementation | complete | Markdown declarations are self-contained; 22 live-kit→base-kit dependencies, two additional source-unbacked base dependencies, and one live Suggestion→static helper import are removed; source checker enforces the kit/dependency law. | verification |
| Verification | complete | Source guard pass; tests 5/5; generator/format/diff checks pass; final app typecheck and Browser are blocked only by shared List source drift. | closeout |
| PR / tracker sync | complete | N/A: no PR or tracker requested. | final response |
| Closeout | complete | Clean scoped autoreview after one accepted install-graph fix; plan checker is the final command. | final response |

Findings:
- The initial red source check found 22 live registry kits depending on their
  independent base counterpart plus `markdown-kit.tsx` importing
  `markdown-base-kit.tsx`.
- Generalizing the check to require every base-kit registry dependency to have
  a real source import found two more stale edges:
  `editor-base-kit -> code-drawing-base-kit` and
  `editor-ai -> editor-base-kit`.
- The source import audit found one analogous live→static implementation edge:
  `suggestion-node.tsx` imported a presentation-only `cva` helper from
  `suggestion-node-static.tsx`.
- Remaining base/static imports are real consumers: static rendering,
  Markdown streaming, AI/export previews, Plate-to-HTML, and DOCX export.
- Autoreview found that removing `editor-ai -> editor-base-kit` also removed
  the transitive `editor` UI dependency; `editor-ai` now declares the honest
  direct `@plate/editor` dependency.

Decisions and tradeoffs:
- Duplicate the tiny Markdown configuration in the two independently
  installable presets; reject a third shared helper/registry item.
- Duplicate the Suggestion overlay style declaration across live/static
  renderers; reject reverse renderer ownership for presentation-only reuse.
- Keep honest same-layer composition:
  `BaseMarkdownKit -> BaseFootnoteKit`,
  `BaseListKit -> BaseIndentKit`, and
  `BaseEditorKit -> source-imported base kits`.
- Registry dependencies describe copied-source requirements, not convenience
  co-installation.

Implementation notes:
- `check-registry-source.mts` now rejects live-kit source imports from
  `*-base-kit` and rejects every base-kit registry dependency without a source
  import in that item.
- The existing 2026-07-24 registry changelog event records the corrected copied
  install graph; no package code or package changeset applies.

Review fixes:
- Accepted one P1 install-graph finding: added direct `@plate/editor` to
  `editor-ai`. Clean re-review reports no accepted/actionable findings.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Changelog MDX failed initial Prettier check | 1 | Format the source entry and regenerate | Prettier and generator checks pass. |
| Browser and final `www` typecheck hit shared List export drift | 1 | Preserve owner boundary; record exact caveat | Source guard/focused tests pass; no unrelated List edit made. |

Verification evidence:
- `pnpm --filter www exec tsx --tsconfig
  ./scripts/tsconfig.scripts.json scripts/check-registry-source.mts`: pass.
- `bun test
  apps/www/src/registry/components/editor/plugins/markdown-kit.spec.ts
  apps/www/src/registry/registry.test.ts`: 5/5 pass, 158 assertions.
- `node tooling/scripts/generate-ui-changelog-entries.mjs --write` and
  `--check`: 30/30 events generated and current.
- Scoped Biome: pass; changelog Prettier: pass; `git diff --check`: pass.
- `pnpm --filter www typecheck`: one pre-final run passed; final concurrent
  rerun fails only in out-of-scope `block-draggable.tsx` because
  `@platejs/list` does not export `expandListItemsWithChildren`, followed by
  four inferred-any errors from that missing owner type.
- Browser `/blocks/markdown-demo`: route reaches the same unrelated
  `block-draggable.tsx` compile error and returns 500.
- Autoreview command: `.agents/skills/autoreview/scripts/autoreview --mode
  local` with an exact registry packet prompt; first pass accepted one P1,
  second pass is clean.

Final handoff contract:
- PR line: N/A; no PR requested.
- Issue / tracker line: N/A; direct user task.
- Confidence line: high for registry ownership/install graph; browser runtime
  remains blocked by unrelated shared List source drift.
- Flow table:
  - Reproduced: red source guard exposed 22 live dependencies, one live import,
    and two further stale base dependencies.
  - Verified: source guard pass, tests 5/5, changelog 30/30, clean autoreview.
- Browser check: attempted `/blocks/markdown-demo`; blocked before app render by
  the unrelated missing List export in `block-draggable.tsx`.
- Outcome: live/base registry presets are independent; copied install metadata
  follows source ownership; Suggestion live/static presentation ownership is
  independent.
- Caveat: browser and final whole-app typecheck cannot clear until the shared
  List owner restores or replaces `expandListItemsWithChildren`.
- Design:
  - Chosen boundary: each installable preset owns its declaration; registry
    dependencies describe actual copied-source imports.
  - Why not quick patch: removing only Markdown's import would leave 24 sibling
    dishonest edges and no recurrence guard.
  - Why not broader change: no shared config registry or generic import parser
    framework is justified; the narrow source guard enforces the exact law.
- Verified: focused proof and clean scoped review recorded above.
- PR body verified: N/A; no PR requested.

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
- PR: N/A; no Git action requested.
- Issue / tracker: N/A.
- Browser proof: attempted; exact shared List compile blocker recorded.
- Caveats: unrelated `block-draggable.tsx` List export/type errors remain.

Timeline:
- 2026-07-24T08:25:45.702Z Task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | Independent live/base registry kits with source-backed install metadata |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- Shared List work currently blocks `www` runtime compilation and the final
  whole-app typecheck; it is explicitly outside this packet.
