# Inline derived editor composition

Objective:
Remove derived editor composition owners; done when Copilot is inline, AI reuses the canonical editor, and focused registry checks pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-14-inline-derived-editor-composition.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)

Task source:
- type: direct user correction
- id / link: current Codex task; no tracker
- title: Inline derived editor composition
- acceptance criteria: delete `examples/copilot-editor.ts` and inline its
  explicit Copilot composition in both consumers; delete the AI block-local
  `editor.ts` and import the canonical editor composition/schema instead;
  remove both files from registry metadata; preserve explicit feature-kit
  teaching in Copilot examples; update tests/source checks/changelog; leave
  the canonical editor definition and unrelated runtime behavior unchanged.

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
- initial confidence score: N/A: binary topology and check threshold
- improvement loop: N/A: one-shot through named gates
- final score / loop closure: N/A

Completion threshold:
- Both redundant authored files are absent; both Copilot consumers compose
  canonical `EditorKit` followed by explicit `CopilotKit` inline; AI imports
  canonical `EditorKit` and `EditorSchema`; no registry metadata/test/source
  check references the removed owners; changelog projections and focused
  registry/generation/lint/review proof pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-14-inline-derived-editor-composition.md` passes.

Verification surface:
- Exact source/reference audit; editor generation check; registry test and
  registry source checker; changelog generator check; scoped Biome/diff check;
  P2 autoreview.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: the two derived owners and consumers, canonical
  `components/editor/editor.ts`, registry metadata/tests/source checker, and
  current editor-runtime changelog entry.
- Allowed edit scope: those exact owners/consumers plus the smallest metadata,
  tests, changelog projections, and this plan needed for coherent deletion.
- Browser surface: N/A: composition is unchanged and no rendered JSX changes.
- Browser strategy: N/A: compiled registry topology is the owning proof. Use Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no tracker.
- Non-goals: plugin API redesign, package changes, canonical editor contents,
  feature removal, generated main contract changes, or unrelated registry UI.

Output budget strategy:
- Read exact files and bounded ranges; use narrow `rg` patterns under
  `apps/www`; exclude generated contents and cap all command output.

Blocked condition:
- Stop only if the canonical editor lacks behavior/schema required by AI, or a
  copied-install path cannot reuse it without changing the accepted registry API.

Task state:
- task_type: registry ownership cleanup
- task_complexity: normal
- current_phase: closeout
- current_phase_status: completed
- next_phase: final response
- goal_status: complete

Current verdict:
- verdict: both derived files are redundant ownership
- confidence: high, subject to exact dependency/import audit
- next owner: task
- reason: Copilot composition is tiny call-site policy; AI duplicates the
  canonical application editor rather than owning a distinct contract.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-14-inline-derived-editor-composition.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Both file deletions, inline/reuse targets, metadata/proof, preservation, and non-goals are recorded above |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | Read `autogoal`, `plate-ui`, `registry-changelog`, and `shadcn`; shadcn component actions are N/A because no component is added or restyled |
| Active goal checked or created | yes | No active goal existed; matching goal created for this plan |
| Source of truth read before edits | yes | Read both derived owners, all three consumers, canonical editor, AI/Copilot kits, registry metadata/test/source checker, registry dependencies, and current/sibling changelog entries |
| Tracker comments and attachments read | no | N/A: direct request without tracker/attachment |
| Video transcript evidence required | no | N/A: no video |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: explicit two-owner deletion with live source owners |
| TDD decision before behavior change or bug fix | no | N/A: behavior-neutral topology cleanup; existing registry contracts are the proof |
| Branch decision for code-changing task | no | N/A: no branch requested |
| Release artifact decision | yes | Registry changelog required; package changeset N/A |
| Browser tool decision for browser surface | no | N/A: no rendered behavior change |
| PR expectation decision | no | N/A: no PR requested |
| Tracker sync expectation decision | no | N/A: no tracker |
| Output budget strategy recorded | yes | Exact-file reads and narrow capped searches recorded above |
| Docs pack selected | yes | Incidental registry changelog source/projection sync |
| `docs-creator` loaded | no | N/A: `registry-changelog` owns this artifact |
| Docs lane selected | yes | Registry changelog only |
| Target docs and nearest sibling docs read | yes | Read `2026-08-14-author-editor-runtime.mdx` and `2026-07-23-explicit-editor-kit-composition.mdx` |
| Docs style doctrine read | yes | Registry changelog authoring contract read completely |
| Documented source owner identified | yes | `apps/www/src/registry/changelog/entries/*.mdx` |

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
- [x] Implementation fixes the ownership boundary: all three consumers reuse
      canonical `EditorKit` and append `CopilotKit` explicitly at the call site.
- [x] Release artifact: registry changelog required; package changeset N/A.
- [x] Final handoff: exact deleted/reused/inline owners, focused proof, browser
      N/A, and no PR/tracker.
- [x] Branch handling: N/A, no branch requested.
- [x] Local-env-rot policy: reinstall once only for documented corruption signals.
- [x] Workspace authority: `/Users/zbeyens/git/plate-2`, scoped to `www`.
- [x] High-risk note: copied install paths/import rewrites could break; registry
      source checker and exact dependency metadata are the owning proof.
- [x] P2 autoreview ran against an isolated bundle containing only this registry
      packet and returned no accepted/actionable findings.
- [x] Agent-native review: N/A, no agent source change planned.
- [x] Output budget: exact files and narrow capped searches only.
- [x] Docs pack: registry changelog lane, target entry, sibling entry, and MDX
      source owner are recorded.
- [x] Docs pack: the entry names only source-backed registry items and the exact
      canonical `EditorKit` plus explicit `CopilotKit` composition.
- [x] Docs pack: N/A for reference voice; this is intentionally a generated
      registry migration event owned by `registry-changelog`.
- [x] Docs pack: N/A; the entry contains no links, anchors, or previews.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run every named focused gate | `editor:check`, registry test, source checker, changelog check, Biome, stale-reference audit, diff check, and P2 autoreview pass |
| Bug reproduced before fix | no | N/A: behavior-neutral ownership cleanup | Exact pre-edit source audit established two redundant composition owners |
| Targeted behavior verification | yes | Verify generated editor and registry topology | One editor checked; registry contract 5/5; source checker passed |
| TypeScript or typed config changed | yes | Run relevant typed checks | Editor generation and TS registry test pass; full `www` `tsc` was attempted and is red only in unrelated list, suggestion, table, and existing registry files |
| Package exports or file layout changed | no | N/A: no package exports | Only registry source ownership changed; `pnpm brl` does not apply |
| Package manifests, lockfile, or install graph changed | no | N/A: registry item dependencies only | Copied-install graph validated by registry source checker |
| Agent rules or skills changed | no | N/A | No `.agents`, `.claude`, or `.codex` source changed |
| Workspace authority proof | yes | Run proof in owning repo/app | All commands ran in `/Users/zbeyens/git/plate-2`; app gates used `www` |
| Browser surface changed | no | N/A: no JSX/rendered behavior changed | Composition resolves to the same canonical editor plus explicit Copilot feature |
| Browser final proof | no | N/A: source topology is the affected surface | Registry generation and copied-install checks are the owning proof |
| CI-controlled template output changed | no | N/A | No `templates/**` files touched |
| Package behavior or public API changed | no | N/A | No package changeset needed |
| Registry-only component work changed | yes | Update registry changelog owner | Authored MDX entry and generated projections are synchronized |
| Docs or content changed | yes | Verify source-backed changelog artifact | Registry changelog generator checked all 59 entries |
| High-risk mini gate | yes | Prove copied-install dependency closure | AI metadata depends on `@plate/editor-kit` and `@plate/copilot-kit`; source checker passes |
| Agent-native review for agent/tooling changes | no | N/A | No agent/tooling changes |
| Local install corruption suspected | no | N/A | No corruption signals appeared |
| P2 autoreview for non-trivial implementation changes | yes | Run isolated scoped P2 review | Clean: no accepted/actionable findings; overall patch correct at 0.9 |
| PR create or update | no | N/A | User did not request a PR |
| Task-style PR body verified | no | N/A | No PR exists for this task |
| PR proof image hosting | no | N/A | No PR and no browser image |
| Tracker sync-back | no | N/A | Direct request without tracker |
| Final handoff contract | yes | Record exact outcome and proof | Filled below |
| Final lint | yes | Run scoped equivalent | Biome checked the supported task files with no fixes |
| Output budget discipline | yes | Keep reads and searches bounded | Exact-file reads and scoped commands only; changelog checker emitted its bounded 59-entry list |
| Timed checkpoint | no | N/A | No duration requested |
| Goal plan complete | yes | Run completion checker | `check-complete.mjs` passes |
| Docs source-backed claim audit | yes | Compare entry with live registry source | Names and composition match the three edited consumers and metadata |
| Docs links / routes / previews | no | N/A | Entry contains none |
| Docs MDX/content parser | yes | Run owning parser/generator | `generate-ui-changelog-entries.mjs --check` passes; broad `build:source` is unnecessary |
| Plugin page specifics | no | N/A | No plugin page changed |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | exact owners, consumers, metadata, tests, and changelog read | implementation |
| Implementation | completed | two derived owners removed; three consumers use canonical composition | verification |
| Verification | completed | all focused gates and P2 review pass | closeout |
| PR / tracker sync | completed | N/A: neither requested | final response |
| Closeout | completed | ledger and handoff filled | final response |

Findings:
- Canonical `EditorKit` intentionally does not contain `CopilotKit`; each
  feature consumer must append `CopilotKit` explicitly to preserve behavior.
- The AI block duplicated the canonical composition and repeated its entire
  dependency fanout. Depending on `@plate/editor-kit` is the correct copied-item
  ownership boundary.
- The full `www` typecheck remains red in unrelated pre-existing list,
  suggestion, table, and registry files; no diagnostic points at this packet.

Decisions and tradeoffs:
- Keep the reusable application composition in one canonical registry item.
- Keep one-off feature composition inline as `[..., ...]`, with canonical
  `EditorKit` first and explicit `CopilotKit` last.
- Do not repair skills: current `plate-ui` already states that one-off
  composition stays inline and feature examples preserve explicit kits.

Implementation notes:
- Deleted `examples/copilot-editor.ts` and the AI block-local `editor.ts`.
- Inlined `EditorKit` plus `CopilotKit` in both Copilot examples.
- Reused canonical `EditorKit` and `EditorSchema` in AI `plate-editor.tsx`.
- Replaced the AI block's copied dependency fanout with `@plate/editor-kit`
  while retaining explicit `@plate/copilot-kit`.
- Updated registry contract tests, metadata, changelog source, and generated
  changelog projections.

Review fixes:
- None. The scoped P2 autoreview returned clean on its first pass.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Full `www` `tsc --noEmit` reports unrelated errors | 1 | Use owner-specific gates and inspect diagnostic paths | No diagnostic references a task file; recorded as existing app-wide debt |

Verification evidence:
- `pnpm --filter www editor:check`: checked the sole canonical editor and its
  generated TypeScript/schema artifacts.
- `bun test apps/www/src/registry/registry.test.ts`: 5 passed, 0 failed,
  156 expectations.
- `pnpm --filter www exec tsx --tsconfig ./scripts/tsconfig.scripts.json scripts/check-registry-source.mts`:
  passed.
- `node tooling/scripts/generate-ui-changelog-entries.mjs --check`: all 59
  events and projections checked.
- Scoped `pnpm exec biome check`, stale-reference/file-absence audit, and
  `git diff --check`: passed.
- Isolated `autoreview --mode local --max-priority P2`: clean, no
  accepted/actionable findings.

Final handoff contract:
- PR line: N/A: no PR requested
- Issue / tracker line: N/A: direct request
- Confidence line: high; focused topology and generated-artifact gates pass
- Flow table:
  - Reproduced: exact source audit proved both redundant owners and all consumers
  - Verified: registry 5/5, generation/source/changelog/format/audit/review green
- Browser check: N/A: no rendered behavior changed
- Outcome: one canonical editor composition; explicit Copilot composition inline
- Caveat: full `www` typecheck remains red only in unrelated existing files
- Design:
  - Chosen boundary: canonical editor registry item plus feature kits at consumers
  - Why not quick patch: retaining derived modules would preserve duplicate ownership
  - Why not broader change: canonical editor contents and plugin APIs are unrelated
- Verified: exact metadata, generated contract, focused tests, and P2 review
- PR body verified: N/A: no PR

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
- PR: N/A: not requested
- Issue / tracker: N/A: none
- Browser proof: N/A: no rendered surface changed
- Caveats: unrelated full-app type errors remain outside this packet

Timeline:
- 2026-08-14T16:52:45.323Z Task goal plan created.
- 2026-08-14 Derived editor owners removed; consumers, registry metadata,
  contract tests, and changelog synchronized.
- 2026-08-14 Focused generation, registry, source, changelog, format, stale
  reference, diff, and P2 review gates passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | Remove derived editor owners and reuse canonical composition |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- No task-local risk remains. The app-wide TypeScript baseline has unrelated
  existing errors and is not promoted as green.
