# Cut derived editor generated contracts

Objective:
Cut generated editor contracts from AI and Copilot examples; done when only the main editor is generated and focused registry checks pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-14-cut-derived-editor-generated-contracts.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)

Task source:
- type: direct user request
- id / link: current Codex task; no external tracker
- title: Cut generated editor contracts from derived AI and Copilot examples
- acceptance criteria: delete both derived `.generated.ts` and `.schema.json`
  pairs; remove their generation/check inputs and copied-registry metadata;
  preserve their authored runtime editor modules and consumers; keep the main
  editor definition as the sole first-class generated example; sync registry
  tests, source checks, and changelog artifacts; leave unrelated editor API and
  runtime behavior untouched.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: none requested
- semantics: N/A: no timed checkpoint
- initial confidence score: N/A: binary artifact/check threshold
- improvement loop: N/A: one-shot execution through named gates
- final score / loop closure: N/A: close when all checks below pass

Completion threshold:
- Exactly four derived generated artifacts are absent; the main editor remains
  the only `editor:generate` / `editor:check` input; no registry item or source
  checker references the removed files; authored AI/Copilot editor modules and
  their consumers remain; registry metadata/tests, changelog source/JSON, lint,
  and focused generation/source checks pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-14-cut-derived-editor-generated-contracts.md` passes.

Verification surface:
- Narrow `rg` audits for generated-editor paths and authored runtime consumers.
- `pnpm --filter www editor:check`.
- Focused `apps/www/src/registry/registry.test.ts` and registry source checker.
- Registry changelog generator `--check`.
- Scoped lint/format proof for touched files.
- P2 autoreview of the actual scoped diff.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `apps/www/package.json`, authored editor modules, registry
  metadata/tests/source checker, and registry changelog MDX source.
- Allowed edit scope: derived AI/Copilot generated artifacts plus the smallest
  registry scripts, metadata, tests, changelog artifacts, and this plan needed
  to remove them coherently.
- Browser surface: N/A: no rendered component or behavior changes; generated
  type/schema files are not imported at runtime.
- Browser strategy: N/A: static generation and copied-install metadata checks
  are the owning proof. Use Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no issue or external tracker.
- Non-goals: changing plugin composition, editor runtime behavior, the main
  generated editor contract, package APIs, templates, or unrelated registry
  integrations.

Output budget strategy:
- Read exact files and bounded ranges; use `rg --files-with-matches` or narrow
  patterns under `apps/www`; exclude generated file contents except filenames
  and sizes; cap all command output.

Blocked condition:
- Stop only if an authored runtime consumer imports a generated contract in a
  way that cannot be replaced without changing the accepted runtime API, or if
  the owning focused checks repeatedly fail for unrelated shared-tree changes
  after narrowing proof.

Task state:
- task_type: registry install-shape cleanup
- task_complexity: normal
- current_phase: closeout
- current_phase_status: completed
- next_phase: final response
- goal_status: complete

Current verdict:
- verdict: derived examples should not own generated application contracts
- confidence: high; focused proof passes and P2 autoreview reports 0 findings
- next owner: final handoff
- reason: generated schema/value typing belongs only at the first-class static
  application boundary; derived examples should consume ordinary plugin arrays.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-14-cut-derived-editor-generated-contracts.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Exact AI + Copilot cut, main-editor preservation, proof, and non-goals are recorded above |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | Read `autogoal`, `plate-ui`, `registry-changelog`, and `shadcn`; shadcn component workflow is N/A because no component is authored |
| Active goal checked or created | yes | `get_goal` returned none; matching goal created for this plan |
| Source of truth read before edits | yes | Read authored AI/Copilot editor modules, package scripts, registry metadata/tests/source checker, main editor owner, generated-file references/sizes, and current changelog source before implementation |
| Tracker comments and attachments read | no | N/A: direct request has no tracker or attachment |
| Video transcript evidence required | no | N/A: no video |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: narrow registry artifact ownership cut with explicit current files |
| TDD decision before behavior change or bug fix | no | N/A: no runtime behavior change; existing registry tests are the contract proof |
| Branch decision for code-changing task | no | N/A: user requested local edits, not branch creation |
| Release artifact decision | yes | Registry-only copied-install change requires registry changelog; no package changeset |
| Browser tool decision for browser surface | no | N/A: no rendered surface changes |
| PR expectation decision | no | N/A: no PR requested |
| Tracker sync expectation decision | no | N/A: no tracker |
| Output budget strategy recorded | yes | Exact-file reads and narrow capped searches recorded above |
| Docs pack selected | yes | Incidental docs pack covers registry changelog MDX/source sync |
| `docs-creator` loaded | no | N/A: `registry-changelog` owns this source contract |
| Docs lane selected | yes | Registry changelog, not public reference docs |
| Target docs and nearest sibling docs read | yes | Read `2026-08-14-author-editor-runtime.mdx` and `2026-07-23-explicit-editor-kit-composition.mdx` |
| Docs style doctrine read | yes | `registry-changelog` authoring contract read completely |
| Documented source owner identified | yes | `apps/www/src/registry/changelog/entries/*.mdx` owns registry changelog source |

Work Checklist:
- [x] N/A: no duration was requested.
- [x] First checkpoint complete: every explicit requirement, boundary, stop
      condition, deliverable, verification surface, and success criterion is
      recorded before implementation.
- [x] Objective, completion threshold, verification surface, constraints,
      boundaries, output budget, and blocked condition are concrete.
- [x] Task source is classified with acceptance criteria, likely files,
      browser boundary, and root owner.
- [x] N/A: no video or screen-recording evidence.
- [x] Nearby repo instructions and implementation patterns read before edits:
      registry metadata, tests, source checker, authored editor modules, main
      generated owner, current changelog, and nearest sibling entry.
- [x] Implementation fixes the derived generated-contract ownership boundary.
- [x] Release artifact recorded: registry changelog required; package changeset N/A.
- [x] Final handoff shape: outcome, exact removed/preserved surfaces, focused
      proof, browser N/A, and no PR/tracker.
- [x] Branch handling: N/A, no branch requested.
- [x] Local-env-rot policy: run `pnpm run reinstall` once only for documented
      install-rot signals; otherwise fix or report the real owner.
- [x] Workspace authority: all proof runs in
      `/Users/zbeyens/git/plate-2`, scoped to `apps/www` where applicable.
- [x] High-risk note: stale registry paths or accidental loss of the main
      generated contract are the realistic failures; generation/source tests
      prove the chosen boundary.
- [x] P2 autoreview target selected from an isolated exact registry/script/changelog
      bundle because the shared checkout contains unrelated staged and unstaged work.
- [x] Agent-native review: N/A unless `.agents/**` changes; no skill edit is planned.
- [x] Output budget discipline: exact files and narrow capped searches only.
- [x] Docs pack: registry changelog lane, target entry, nearest sibling, and
      canonical MDX source owner are recorded.
- [x] Docs pack: all named items and generated artifacts are source-backed.
- [x] Docs pack: changelog prose follows the registry-changelog contract.
- [x] Docs pack: N/A for links, anchors, routes, and previews; the entry has none.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the named generation, registry, changelog, lint, source-audit, and review proof | All named checks pass; exact commands are recorded below |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: ownership/install-shape cleanup, not a runtime bug |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior | Registry test 4/4, source checker, and editor generation check pass |
| TypeScript or typed config changed | yes | Run relevant typecheck | Generated contract check, Bun-compiled registry test, and TSX source checker pass; full app `tsc` was attempted and fails only in unrelated List/Suggestion/Table/media shared WIP listed below |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification | N/A: no package export or exported package file layout changed |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: only an app script command changed; no dependency or lockfile change |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: no agent source changed |
| Workspace authority proof | yes | Run verification in the owning repo/app | All commands ran in `/Users/zbeyens/git/plate-2`; app commands used `--filter www` |
| Browser surface changed | no | Capture browser proof | N/A: removed unused generated type/schema artifacts and registry metadata only |
| Browser final proof | no | Attach browser proof or caveat | N/A: no rendered route, interaction, or runtime import changed |
| CI-controlled template output changed | no | Restore generated template output | N/A: no `templates/**` files touched |
| Package behavior or public API changed | no | Add a changeset or N/A | N/A: no published package change; registry changelog is the release artifact |
| Registry-only component work changed | yes | Update the owning registry changelog | Updated MDX source and generated event/index/components JSON; generator check passes |
| Docs or content changed | yes | Verify incidental docs source | Registry changelog source is source-backed and regenerated; no public docs route changed |
| High-risk mini gate | yes | Record failure mode and boundary proof | Failure mode is stale derived file shipping or loss of main generation; global registry test plus editor/source audits prove exactly one owner |
| Agent-native review for agent/tooling changes | no | Run agent-native review or N/A | N/A: no agent/tooling instruction source changed |
| Local install corruption suspected | no | Run reinstall or N/A | N/A: no install-rot failure signal occurred |
| P2 autoreview for non-trivial implementation changes | yes | Run scoped P2 autoreview | Isolated local bundle, `--max-priority P2`: clean, 0 actionable findings, patch correct 0.91 |
| PR create or update | no | Run check before PR work | N/A: no PR requested |
| Task-style PR body verified | no | Verify PR body | N/A: no PR |
| PR proof image hosting | no | Host browser proof if needed | N/A: no PR and no browser proof |
| Tracker sync-back | no | Sync issue/Linear | N/A: no tracker |
| Final handoff contract | yes | Fill exact outcome/proof/caveat fields | Completed below |
| Final lint | yes | Run scoped equivalent | `pnpm exec biome check` passed for all eight supported touched files; MDX/JSON generation check passed |
| Output budget discipline | yes | Verify scoped output | Searches were path-bounded and capped; the changelog checker lists 59 known artifacts but remained bounded |
| Timed checkpoint | no | Complete requested duration or N/A | N/A: no duration requested |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-14-cut-derived-editor-generated-contracts.md` | Passed after final evidence and gate closure |
| Docs source-backed claim audit | yes | Verify docs claims against source | Entry names four real registry items and matches the final metadata/generation topology |
| Docs links / routes / previews | no | Verify links/routes/previews | N/A: entry contains none |
| Docs MDX/content parser | yes | Parse the changed MDX source | Registry changelog generator parsed and regenerated all 59 events; `build:source` is N/A because this is not Fumadocs content |
| Plugin page specifics | no | Apply plugin-page rules | N/A: no plugin page |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | exact owners, references, consumers, sizes, and changelog read | implementation |
| Implementation | completed | four derived artifacts removed; scripts/metadata/tests/checker/changelog aligned | verification |
| Verification | completed | all focused checks pass; unrelated full-app type debt bounded | closeout |
| PR / tracker sync | completed | N/A: neither requested nor present | final response |
| Closeout | completed | P2 review clean and final proof rerun | final response |

Findings:
- AI and Copilot generated modules had zero source imports.
- The four derived artifacts totaled 797,184 bytes; the main generated pair has
  real type-contract consumers and remains the sole generated owner.
- The authored AI `EditorSchema` is runtime configuration used by
  `plate-editor.tsx`; it correctly remains in `editor.ts`.

Decisions and tradeoffs:
- Keep authored `editor.ts` composition for every variant; generate only at the
  first-class application typing boundary.
- Enforce the topology globally in the registry test rather than maintaining
  three caller-specific generated-file expectations.
- Do not edit skills: existing `plate-ui` rule 9 already says copied UI does not
  own the host application contract, so the doctrine is not stale.

Implementation notes:
- Removed AI/Copilot generator inputs, registry file entries, and the AI source
  checker assertion.
- Deleted the two derived `.generated.ts` and two `.schema.json` artifacts.
- Updated the existing editor-runtime registry changelog event and regenerated
  its event, index, and component maps.

Review fixes:
- P2 autoreview reported no accepted/actionable findings; no review patch needed.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| App ESLint ignored the scoped files | 1 | Use root Biome, the actual repo lint owner | Biome check passed with no fixes |
| Full app TypeScript check hit unrelated shared WIP errors | 1 | Keep focused owner proof and record exact external failures | Editor generation, registry test, and source checker pass; no task file appears in the TypeScript errors |
| Initial isolated review patch was generated from the wrong checkout state | 2 | Reconstruct staged then unstaged scoped state in the temporary clone | Review bundle completed and P2 review passed |
| Direct temporary `rm -rf` cleanup was rejected | 1 | Use recoverable cleanup | Temporary review clone moved to `/Users/zbeyens/.Trash/plate-derived-editor-review.uLWckV` |

Verification evidence:
- `pnpm --filter www editor:check` -> checked exactly one editor and its main generated TS/JSON pair.
- `bun test apps/www/src/registry/registry.test.ts` -> 4 pass, 0 fail, 154 expectations.
- `pnpm --filter www exec tsx --tsconfig ./scripts/tsconfig.scripts.json scripts/check-registry-source.mts` -> passed.
- `node tooling/scripts/generate-ui-changelog-entries.mjs --check` -> 59/59 source events agree with generated artifacts.
- `pnpm exec biome check <eight touched supported files>` -> clean, no fixes.
- Exact `rg`/existence audit -> no derived generated references; only main
  `components/editor/editor.generated.ts` and `editor.schema.json` remain;
  authored AI/Copilot `editor.ts` files remain.
- `git diff --check -- <scoped files>` -> passed.
- Scoped P2 autoreview -> clean, no accepted/actionable findings, patch correct 0.91.
- Full `pnpm --filter www exec tsc --noEmit -p tsconfig.json --pretty false`
  remains red only in unrelated current List/Suggestion/Table/media registry WIP;
  this packet introduced no reported TypeScript error.

Final handoff contract:
- PR line: N/A: no PR requested
- Issue / tracker line: N/A: no tracker
- Confidence line: high; focused ownership proof and P2 review are clean
- Flow table:
  - Reproduced: static audit proved duplicate generated artifacts/references existed before the cut; browser N/A
  - Verified: generation, registry test/source checker, changelog, Biome, diff check, and P2 review pass; browser N/A
- Browser check: N/A: no rendered behavior or runtime import changed
- Outcome: AI and Copilot examples use authored runtime composition without generated contracts; only `editor-kit` generates schema-derived types.
- Caveat: full app TypeScript remains blocked by unrelated shared WIP outside this packet.
- Design:
  - Chosen boundary: generator inputs plus copied registry install metadata and its invariant test.
  - Why not quick patch: deleting files alone would leave scripts and installed registry items stale.
  - Why not broader change: runtime editor composition and the main generated contract are correct and have real consumers.
- Verified: exact commands and results are listed above.
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
- PR: N/A
- Issue / tracker: N/A
- Browser proof: N/A: no browser surface changed
- Caveats: unrelated app-wide TypeScript failures remain outside scope

Timeline:
- 2026-08-14T16:27:05.966Z Task goal plan created.
- 2026-08-14T18:43:01+02:00 Cut derived artifacts and aligned generator,
  registry metadata/tests/source checker, and changelog; all focused proof and
  P2 autoreview passed.
- 2026-08-14T18:43:01+02:00 Final autogoal checker passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete; every named gate passes or has an explicit N/A/bounded caveat |
| Where am I going? | Final response |
| What is the goal? | Keep generated editor contracts only at the main editor boundary |
| What have I learned? | Derived generated modules had no imports; authored runtime modules are sufficient |
| What have I done? | Removed four artifacts, repaired every owning reference, regenerated changelog artifacts, and closed focused proof/review |

Open risks:
- The shared app TypeScript check remains red in unrelated List/Suggestion/Table/media work; this packet's focused compiled checks are green.
