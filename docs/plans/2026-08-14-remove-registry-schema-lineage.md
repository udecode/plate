# remove registry schema lineage

Objective:
Remove registry-owned named schema lineage; done when all EditorSchema consumers use derived identity and generated/registry/browser checks close; plan docs/plans/2026-08-14-remove-registry-schema-lineage.md.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-14-remove-registry-schema-lineage.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)
- registry-changelog (docs/plans/templates/packs/registry-changelog.md)

Task source:
- type: direct user correction
- id / link: current Codex task; no external tracker
- title: remove the public registry preset's named schema lineage
- acceptance criteria: delete the `EditorSchema` export rather than rename its id; remove every registry consumer import and `schema: EditorSchema` option; preserve `EditorKit` and all feature behavior; regenerate the editor contract and registry changelog projection; verify derived identity, source closure, focused checks, and Browser behavior or an exact unrelated blocker.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: none requested
- semantics: N/A: one-shot execution
- initial confidence score: N/A: binary source/generator checks are stronger
- improvement loop: remove lineage at the source owner, regenerate, audit consumers, verify once
- final score / loop closure: N/A: close on named pass gates

Completion threshold:
- `EditorSchema` has zero production references under registry source.
- Every former consumer constructs its editor from `EditorKit` without a registry-owned named schema.
- Generated schema identity is derived and its fingerprint/contracts match current `EditorKit`.
- Registry metadata/changelog, focused checks, scoped lint, Browser attempt, and P2 review close with exact evidence.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-14-remove-registry-schema-lineage.md` passes.

Verification surface:
- `rg` closure over `apps/www/src/registry/**` excluding CI-owned output.
- `pnpm --filter www editor:generate` and `editor:check`.
- Generated schema JSON identity audit, registry test/source checker, schema-adoption checker, and changelog write/check.
- Scoped Biome and diff check.
- Browser route `/blocks/editor-ai-demo`, with exact compile caveat if stale CI-owned registry output still blocks runtime.
- Exact P2 autoreview of this change only.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Do not rename the lineage to `main`; ordinary copied registry editors use derived identity.
- Preserve `EditorKit`, generated static types, plugin composition, explicit drawing demos, and every unrelated registry change.
- Do not edit `apps/www/src/__registry__/**`, templates, packages, skills, or public docs.

Boundaries:
- Source of truth: `apps/www/src/registry/components/editor/editor.ts`, all registry consumers of `EditorSchema`, CLI schema discovery/identity law, registry metadata, and the existing 2026-08-14 changelog event.
- Allowed edit scope: registry editor source/generated artifacts, direct registry consumers, registry metadata/changelog projection, and this plan.
- Browser surface: `/blocks/editor-ai-demo` exercises the canonical preset.
- Browser strategy: Browser for the route. Record the exact existing CI-owned import blocker without broadening scope. Use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no tracker.
- Non-goals: no plugin removal, no schema API redesign, no named-lineage migration system changes, no CLI behavior change, no CI registry generation, no PR/commit/push.

Output budget strategy:
- Exact files and bounded registry searches only; exclude `__registry__`, templates, build output, and package graphs from exploratory output; cap checks and isolate review to the exact patch.

Blocked condition:
- Stop only if removing lineage requires a consumer-owned persistence/collaboration contract not visible in current source. Existing unrelated type/browser failures are caveats, not authority to broaden scope.

Task state:
- task_type: registry preset ownership correction
- task_complexity: normal
- current_phase: closeout
- current_phase_status: completed
- next_phase: final response
- goal_status: complete

Current verdict:
- verdict: delete `EditorSchema`; do not replace its id
- confidence: high
- next owner: task
- reason: named lineage belongs to the consuming persisted application; the generator already derives identity without an application schema.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-14-remove-registry-schema-lineage.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Delete, do not rename; all consumers, generated contract, preservation and proof requirements are explicit above. |
| Timed checkpoint parsed | no | N/A: none requested. |
| Skill analysis before edits | yes | Loaded best-api review, Plate vision, task, autogoal, plate-ui, and registry-changelog; shadcn is N/A because no component is authored. |
| Active goal checked or created | yes | Matching goal created with this plan. |
| Source of truth read before edits | yes | Read current registry owner/consumers, generator optional-schema path, docs identity law, and adoption checker. |
| Tracker comments and attachments read | no | N/A: no tracker. |
| Video transcript evidence required | no | N/A: no video. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: accepted API correction is directly governed by current source and Vision. |
| TDD decision before behavior change or bug fix | no | N/A: source closure plus generated identity/checker are the durable oracle. |
| Branch decision for code-changing task | no | N/A: no git operation requested. |
| Release artifact decision | yes | Registry changelog only; no package changeset. |
| Browser tool decision for browser surface | yes | Browser route attempt; no native Chrome behavior. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker. |
| Output budget strategy recorded | yes | Exact bounded paths, capped checks, isolated review. |
| Browser pack selected | yes | Canonical registry editor setup changes. |
| Browser route / app surface identified | yes | `/blocks/editor-ai-demo`. |
| Browser tool decision recorded | yes | Browser first; record unrelated compile blocker if unchanged. |
| Console/network caveat policy recorded | yes | Inspect route and dev-server output; do not edit CI-owned output. |
| Registry changelog pack selected | yes | Copied-code install shape changes. |
| User-visible registry impact classified | yes | Consumers no longer copy a fake named schema lineage. |
| Source entry path selected | yes | Update `apps/www/src/registry/changelog/entries/2026-08-14-author-editor-runtime.mdx`. |
| Generator command selected | yes | Manual source edit, then changelog `--write` and `--check`; editor `generate` and `check`. |

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
- [x] Implementation fixes the ownership boundary: copied registry code no
      longer publishes application-owned schema lineage.
- [x] Release artifact requirement recorded: registry changelog source and
      generated projections updated; N/A package changeset because no package changed.
- [x] Final handoff shape decided: local implementation report with exact proof
      and unrelated blockers; N/A PR and tracker sync because neither was requested.
- [x] Branch handling recorded: N/A because no branch operation was requested.
- [x] Local-env-rot retry policy recorded: N/A because failures are deterministic
      source errors in unrelated shared WIP, not install-corruption signals.
- [x] Workspace authority recorded: all commands ran from
      `/Users/zbeyens/git/plate-2`; Browser targeted the local www dev server.
- [x] High-risk note recorded: the realistic risk was changing structural schema
      while removing lineage; unchanged fingerprint plus generated contract checks disprove it.
- [x] P2 autoreview reviewed a reconstructed task-only staged patch, excluding
      inherited shared-tree edits and mechanically generated projections.
- [x] Agent-native review decision recorded: N/A because no agent/tooling source changed.
- [x] Output budget discipline followed: searches and diffs were restricted to
      exact registry paths; broad failures were summarized rather than streamed.
- [x] Browser pack: `/blocks/editor-ai-demo` and the expected canonical editor render were recorded before proof.
- [x] Browser pack: Browser proof was used for the normal app surface; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it; native proof was N/A here.
- [x] Browser pack: dev-server compile output and 500 response were checked and attributed to stale CI-owned registry imports.
- [x] Browser pack: screenshot waived because compilation failed before the changed runtime path; the exact blocker is recorded.
- [x] Registry changelog pack: copied-code impact and migration guidance are recorded.
- [x] Registry changelog pack: updated `apps/www/src/registry/changelog/entries/2026-08-14-author-editor-runtime.mdx`.
- [x] Registry changelog pack: existing valid frontmatter was preserved.
- [x] Registry changelog pack: bullets name the real `editor-kit` registry item.
- [x] Registry changelog pack: JSON projections were updated only through the generator.
- [x] Registry changelog pack: N/A package changeset because package code did not change.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named source/generator/registry gates | Complete: zero registry source references; generated identity is derived; focused checks pass. |
| Bug reproduced before fix | no | N/A: accepted ownership correction, not a runtime bug | Complete. |
| Targeted behavior verification | yes | Run focused generated and registry proof | `editor:check`, registry 5/5, source checker, changelog check all pass. |
| TypeScript or typed config changed | yes | Run www typecheck | Attempted; blocked in unrelated `@platejs/suggestion` source errors before www completion. |
| Package exports or file layout changed | no | N/A: no package export/layout changes | Complete. |
| Package manifests, lockfile, or install graph changed | no | N/A | Complete. |
| Agent rules or skills changed | no | N/A | Complete. |
| Workspace authority proof | yes | Run from owning repo/app | All commands ran in `/Users/zbeyens/git/plate-2`; Browser used local www. |
| Browser surface changed | yes | Attempt canonical registry route | Attempted `/blocks/editor-ai-demo`; stale CI-owned imports fail compilation first. |
| Browser final proof | yes | Record exact caveat | GET 500 from missing deleted `editor-kit.tsx` and `plate-types.ts` imports in `src/__registry__/index.tsx`. |
| CI-controlled template output changed | no | N/A: templates untouched | Complete. |
| Package behavior or public API changed | no | N/A package changeset | Registry copied-code shape only. |
| Registry-only component work changed | yes | Use registry changelog owner | Existing registry changelog event updated; `docs/components/changelog.mdx` is not this registry system. |
| Docs or content changed | no | N/A: registry changelog metadata only | Complete. |
| High-risk mini gate | yes | Prove structural schema unchanged | Derived identity retains fingerprint `fnv1a64:787c7a7794eab51a`. |
| Agent-native review for agent/tooling changes | no | N/A | Complete. |
| Local install corruption suspected | no | N/A | Deterministic source failures, no install-rot signature. |
| P2 autoreview for non-trivial implementation changes | yes | Review exact task patch | Clean: no accepted/actionable findings, patch correct 0.99. |
| PR create or update | no | N/A: not requested | Complete. |
| Task-style PR body verified | no | N/A: no PR | Complete. |
| PR proof image hosting | no | N/A: no PR | Complete. |
| Tracker sync-back | no | N/A: no tracker | Complete. |
| Final handoff contract | yes | Fill fields below | Complete. |
| Final lint | yes | Run scoped equivalent | Biome checked 16 affected registry files; no fixes required. |
| Output budget discipline | yes | Keep proof bounded | Exact paths and capped outputs used. |
| Timed checkpoint | no | N/A: no duration requested | Complete. |
| Goal plan complete | yes | Run completion checker | Ready for checker after this ledger update. |
| Browser interaction proof | yes | Exercise target route | Blocked before interaction by stale CI-generated import references. |
| Browser console/network check | yes | Inspect compile/network outcome | Compile errors recorded; route returned 500. |
| Browser final proof artifact | yes | Record route result or exact caveat | Exact route and compiler paths recorded; screenshot is not meaningful before compilation. |
| Registry impact classification | yes | Record copied-code delta | Registry preset derives identity; apps own persisted lineage. |
| Registry changelog source | yes | Update source entry | Updated 2026-08-14 author-editor-runtime entry. |
| Registry changelog generation | yes | Run generator write | Complete. |
| Registry changelog check | yes | Run generator check | Pass, 59 events. |
| Registry generator test | no | N/A: generator/schema layout unchanged | Complete. |
| Registry package release split | yes | Record release owner | Registry changelog only; no package changeset. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | owner, consumers, generator, Vision, and skills read | implementation |
| Implementation | completed | export and 12 consumer options removed; projections regenerated | verification |
| Verification | completed | focused source/generator/registry/lint/review gates pass; unrelated blockers bounded | closeout |
| PR / tracker sync | completed | N/A: neither requested nor present | final response |
| Closeout | completed | ledger filled and completion checker next | final response |

Findings:
- Registry-owned `EditorSchema` falsely made copied example code own an application's persisted lineage.
- The editor generator already supports omitted named lineage and emits a derived identity.
- Removing the named identity preserved structural fingerprint `fnv1a64:787c7a7794eab51a`; plugin/schema composition did not change.

Decisions and tradeoffs:
- Delete `EditorSchema`; do not rename its id to `main`.
- Let ordinary copied registry editors derive identity from installed plugins.
- Require consuming applications to add id/version only when they own persisted migrations, history serialization, or collaboration lineage.
- Preserve all current `EditorKit` composition and explicit specialized demos.

Implementation notes:
- Removed the export, 12 imports, and 12 `schema: EditorSchema` options.
- Regenerated the editor TypeScript/schema contract and registry changelog JSON projections through their owning commands.

Review fixes:
- Exact task-only P2 review accepted the patch without findings; no review-triggered edits were needed.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Broad schema-adoption checker reports shared-tree package/doc allowlist debt | 1 | Filter findings against task files and preserve scope | No task-file or removed-lineage finding; recorded as unrelated. |
| www typecheck stops in `@platejs/suggestion` | 1 | Verify error owner and avoid unrelated package edits | Existing Suggestion contract/type errors; focused www registry checks pass. |
| Browser route returns 500 before app runtime | 1 | Inspect compiler owner | Stale CI-owned `src/__registry__/index.tsx` imports deleted `editor-kit.tsx` and `plate-types.ts`; prohibited from local regeneration/edit. |

Verification evidence:
- `pnpm --filter www editor:generate`: regenerated editor contract.
- `pnpm --filter www editor:check`: pass.
- `jq '.identity' apps/www/src/registry/components/editor/editor.schema.json`: `{ kind: "derived", fingerprint: "fnv1a64:787c7a7794eab51a" }`.
- Bounded `rg` for `EditorSchema`, `plate-www-editor`, and `schema: EditorSchema`: zero production registry source matches.
- `bun test apps/www/src/registry/registry.test.ts`: 5/5 tests, 159 assertions.
- `pnpm --filter www exec tsx --tsconfig ./scripts/tsconfig.scripts.json scripts/check-registry-source.mts`: pass.
- `node tooling/scripts/generate-ui-changelog-entries.mjs --write` followed by `--check`: pass, 59 events.
- Scoped `pnpm exec biome check --write ...`: 16 files checked, no fixes required.
- Exact scoped `git diff --check`: pass.
- `./.agents/skills/autoreview/scripts/autoreview --mode local --max-priority P2 --prompt <task-scope>` in a reconstructed task-only review clone: clean, no accepted/actionable findings, 0.99 correct.
- `pnpm turbo typecheck --filter=www`: attempted; unrelated `@platejs/suggestion` errors block completion.
- `node tooling/scripts/check-plate-schema-adoption.mjs`: attempted; unrelated shared-tree package/doc adoption debt only.
- Browser `/blocks/editor-ai-demo`: attempted; GET 500 because stale CI-owned registry output imports deleted files before this code executes.

Final handoff contract:
- PR line: N/A: no PR requested or created.
- Issue / tracker line: N/A: no tracker.
- Confidence line: high for the scoped change; browser/typecheck caveats are unrelated and exact.
- Flow table:
  - Reproduced: registry source previously published one named schema and 12 consumers passed it.
  - Verified: zero source references, derived generated identity, focused registry/generator/lint/review proof.
- Browser check: attempted `/blocks/editor-ai-demo`; stale CI-owned imports block compilation with GET 500.
- Outcome: copied registry editors derive schema identity; persisted lineage is app-owned.
- Caveat: full www typecheck and route runtime remain blocked by unrelated shared-tree Suggestion and CI-generated registry debt.
- Design:
  - Chosen boundary: registry preset owner plus every direct consumer and generated projection.
  - Why not quick patch: renaming the id would preserve the false ownership.
  - Why not broader change: generator and runtime identity behavior are already correct; no schema API redesign is needed.
- Verified: source closure, unchanged structural fingerprint, registry tests/checkers, lint, diff check, and clean exact P2 review.
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
- Issue / tracker: N/A: no tracker.
- Browser proof: attempted canonical route; compile blocked by stale CI-owned registry imports.
- Caveats: unrelated Suggestion type errors and broad schema-adoption debt remain in the shared checkout.

Timeline:
- 2026-08-14T20:04:45.187Z Task goal plan created.
- 2026-08-14 Registry lineage export and 12 consumers removed; editor and changelog projections regenerated.
- 2026-08-14 Focused source, registry, lint, and exact P2 review gates closed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | Remove registry-owned named schema lineage while preserving editor composition. |
| What have I learned? | The generator already derives identity and structural fingerprint remains stable. |
| What have I done? | Removed the export and all consumers, regenerated projections, and closed focused proof. |

Open risks:
- Stale CI-owned registry output prevents local Browser runtime proof until CI regenerates it.
- Unrelated `@platejs/suggestion` type errors prevent full www typecheck in this shared checkout.
