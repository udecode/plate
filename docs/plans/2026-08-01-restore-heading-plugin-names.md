# Restore heading plugin names

Objective:
Hard-cut heading plugin names from `heading1`…`heading6` back to `h1`…`h6`; done when all current consumers use the restored names, stale identifiers are zero, and focused source/type/runtime/browser proof passes.

Goal plan:
docs/plans/2026-08-01-restore-heading-plugin-names.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: explicit user instruction in the current Codex task
- id / link: current task; no external ticket
- title: Restore heading plugin names
- acceptance criteria: `KEYS.h1` through `KEYS.h6` resolve to `h1` through `h6`; every current source/type/test/app/docs/release consumer follows that identity; no compatibility alias survives; nothing else is redesigned

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: none requested
- semantics: N/A: no time floor or hard stop
- initial confidence score: high on requested shape; blast radius requires inventory
- improvement loop: owner-first rename, consumer sweep, focused proof, final stale scan and review
- final score / loop closure: close only when the binary identity/adoption/proof gates pass

Completion threshold:
- `KEYS.h1`…`KEYS.h6` equal `h1`…`h6` in the owning constants and every current plugin descriptor, portal lookup, command namespace, schema reference, serialized fixture, registry consumer, docs example, and release artifact uses the restored names.
- Zero current `heading1`…`heading6` identifiers remain outside explicit historical migration prose that must name an old release.
- No alias, fallback, dual registration, or migration shim accepts the rejected long names.
- Focused basic-nodes/Core tests, relevant package/app typechecks, scoped lint, browser proof for an affected heading surface, changeset validation, and final autoreview pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-01-restore-heading-plugin-names.md` passes.

Verification surface:
- Bounded `rg` inventory and final zero scan for `heading[1-6]`, plus owner inspection of `KEYS`, heading plugin descriptors, generated editor capability names, schema, and serialized fixtures.
- Focused heading/runtime/type tests; source-first typechecks for affected packages and `apps/www`; scoped Biome; changeset status against `main`.
- Browser proof on the smallest standalone registry route that renders heading controls/content; final autoreview and goal checker.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Hard cut only: do not keep the long names through aliases, normalization, deprecated overloads, or fallbacks.
- Change heading plugin identity only; do not redesign serialized heading element types, toolbar UX, schema grammar, or unrelated plugin names.
- Preserve shared WIP and do not stage, commit, push, create a PR, or message other tasks.

Boundaries:
- Source of truth: the user instruction plus current `KEYS`, BaseHeadingPlugin, Core plugin publication/types, and their live consumers.
- Allowed edit scope: current `packages/**`, `apps/www/src/**`, `content/**`, `.changeset/**`, tests, and generated barrels only where the heading-name hard cut requires adoption; never templates or generated registry JSON.
- Browser surface: smallest affected standalone `/blocks/[id]-demo` route containing headings; exact route selected after inventory.
- Browser strategy: Browser against the local www dev server. Use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no issue or external tracker supplied.
- Non-goals: any other plugin/API rename, component refactor, colocation work, schema redesign, or git publication.

Output budget strategy:
- Count and list matching files first; inspect bounded owner slices with capped output; exclude generated registry JSON, templates, build output, node_modules, and historical plans from the current-state zero gate.

Blocked condition:
- Block only if current source proves that `heading1`…`heading6` are externally required serialized identities that cannot be restored without a separate data migration decision; otherwise continue autonomously.

Task state:
- task_type: public API identity hard cut
- task_complexity: normal cross-package migration
- current_phase: closeout
- current_phase_status: complete
- next_phase: N/A: final response
- goal_status: complete

Current verdict:
- verdict: valid; restore the concise plugin identities with no compatibility path
- confidence: high
- next owner: task
- reason: the user explicitly rejected `heading1`…`heading6`; the owning plugin names should match their stable `h1`…`h6` keys

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-01-restore-heading-plugin-names.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Exact six-name restoration, hard-cut behavior, all-consumer adoption, proof, no unrelated redesign, and no git/task messaging recorded above |
| Timed checkpoint parsed | no | N/A: none requested |
| Skill analysis before edits | yes | `hard-cut`, `autogoal`, `task`, and `changeset` loaded; docs/autoreview gates follow before those actions |
| Active goal checked or created | yes | `get_goal` returned no active goal; this filled plan precedes goal creation |
| Source of truth read before edits | yes | Compared current `plate-keys.ts`, heading descriptors/tests, docs, and `main`; `main` already uses `h1`…`h6` |
| Tracker comments and attachments read | no | N/A: no tracker source |
| Video transcript evidence required | no | N/A: no video supplied |
| `docs/solutions` checked for non-trivial existing-code work | yes | Read the heading-start Enter solution; it concerns serialized heading behavior, not plugin-name identity |
| TDD decision before behavior change or bug fix | yes | Existing identity/type/runtime tests will be updated and used; no behavior-first red test needed for an explicit API rename |
| Branch decision for code-changing task | no | N/A: user did not request a branch/commit/PR; use current checkout without git publication |
| Release artifact decision | no | N/A: this restores the API already shipped on `main`; no upgrading user sees a heading-name delta |
| Browser tool decision for browser surface | yes | Use in-app Browser on the smallest affected heading demo after implementation |
| PR expectation decision | no | N/A: no PR requested |
| Tracker sync expectation decision | no | N/A: no tracker supplied |
| Output budget strategy recorded | yes | Bounded counts/file lists and capped owner slices above |
| Docs pack selected | yes | Supporting docs may expose the public identity; docs pack materialized |
| `docs-creator` loaded | yes | Full skill and source rule read before docs edits |
| Docs lane selected | yes | Current-state plugin/API examples; historical migration prose retained only when genuinely historical |
| Target docs and nearest sibling docs read | yes | Heading plugin page, installation pages, API utils page, and source-backed registry examples audited |
| Docs style doctrine read | yes | Current-state voice and source-backed API rules applied |
| Documented source owner identified | yes | `KEYS` and BaseHeadingPlugin/current Core capability publication own the contract |
| Package/API pack selected | yes | Public plugin names and generated editor capability keys cross package boundaries |
| Public surface or package boundary identified | yes | `@platejs/basic-nodes`, Core inferred API/update/read namespaces, and package/app consumers |
| Release artifact path selected | no | N/A: no published delta from `main`; existing broad changesets remain untouched |
| `changeset` skill loaded when `.changeset` is required | yes | Changeset skill read before release classification |
| Barrel/export impact decision recorded | yes | No export or file-layout change; `pnpm brl` is N/A |

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
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the source/type/runtime/browser audit | Owner values are `h1`…`h6`; all semantic consumers migrated; focused tests and Browser pass |
| Bug reproduced before fix | no | Explicit API restoration, not a reported behavior bug | N/A: compared against `main`, which already exposes `h1`…`h6` |
| Targeted behavior verification | yes | Run focused heading/runtime tests | 11 pass, 0 fail, 64 expectations across utils and base/React heading specs |
| TypeScript or typed config changed | yes | Run relevant typechecks | 13/13 utils/basic-nodes tasks and full www typecheck pass |
| Package exports or file layout changed | no | Run barrels only when exports/layout change | N/A: no export or file-layout delta |
| Package manifests, lockfile, or install graph changed | no | Install only for graph changes | N/A: no manifest or dependency change |
| Agent rules or skills changed | no | Regenerate only for agent-rule changes | N/A: no agent source changed |
| Workspace authority proof | yes | Verify in `/Users/zbeyens/git/plate-2` | Package tests/typechecks, www typecheck, and local Browser route all ran in the owning checkout |
| Browser surface changed | yes | Verify the affected heading demo | `/blocks/basic-blocks-demo` returned 200 and rendered live H1/H2/H3 elements |
| Browser final proof | yes | Check DOM and console | One editable, one H1/H2/H3 each, zero console errors |
| CI-controlled template output changed | no | Do not retain template/generated output | N/A: templates and registry JSON were not edited |
| Package behavior or public API changed | yes | Classify release delta against `main` | Restores the existing `main` API; no new changeset is correct |
| Registry-only component work changed | no | Registry changelog only for registry-only changes | N/A: registry examples merely adopt the package API |
| Docs or content changed | yes | Verify source-backed claims and parser | Heading/API/install docs match source; www source build and parity checks pass |
| High-risk mini gate | yes | Prove namespace and runtime identity together | Tests cover `editor.update.h1/h6`, plugin names, input-rule IDs, schemas, and serialized `NODES.h*` types |
| Agent-native review for agent/tooling changes | no | Agent review only for agent/tooling edits | N/A: no agent/tooling source changed |
| Local install corruption suspected | no | Reinstall only on matching signals | N/A: no install-corruption signal occurred |
| Autoreview for non-trivial implementation changes | yes | Run scoped local review | Clean: no accepted/actionable findings; correctness 0.84 |
| PR create or update | no | Only with explicit user request | N/A: no PR requested |
| Task-style PR body verified | no | Only when a PR exists | N/A: no PR created |
| PR proof image hosting | no | Only when PR proof requires it | N/A: no PR created |
| Tracker sync-back | no | Only when a tracker exists | N/A: no tracker supplied |
| Final handoff contract | yes | Record exact outcome and proof | Filled below |
| Final lint | yes | Run scoped equivalent | Biome checked the six supported changed code files with no fixes required |
| Output budget discipline | yes | Keep searches bounded | File lists and capped source slices used; no unbounded scan streamed |
| Timed checkpoint | no | No duration requested | N/A: binary proof gates govern closure |
| Goal plan complete | yes | Run goal checker | Final checker is the last closeout command |
| Docs source-backed claim audit | yes | Match docs against current source | Commands are `tx.h1.toggle()`…`tx.h6.toggle()` and identities match `KEYS`/descriptors |
| Docs links / routes / previews | yes | Verify affected route | Existing basic-blocks preview route rendered successfully |
| Docs MDX/content parser | yes | Run www source build | `pnpm --filter www typecheck` ran `build:source`, docs parity, registry source, and both TS projects successfully |
| Plugin page specifics | yes | Preserve source-backed kit/manual/API structure | Heading page kept its existing topology; only stale command names changed |
| Public API / package boundary proof | yes | Audit inference and runtime publication | Base and React editors compile and execute `update.h1`/`update.h6`; old groups are absent from semantic current consumers |
| Release artifact classification | yes | Compare against `main` | No upgrade-visible delta: `main` already uses `h1`…`h6` |
| Published package changeset | no | Add only for a delta from `main` | N/A: a rename changeset would falsely describe branch-only `heading1` names |
| Registry changelog | no | Use only for registry-only user features | N/A: no registry feature delta |
| No release artifact | yes | Record exact reason | Restores current-main public identity and adds no new user-visible release delta |
| Package typecheck/build/test | yes | Run owners | Focused tests 11/11; package typecheck 13/13; www typecheck passes |
| Barrel/export generation | no | Run only when exports/layout change | N/A: no exported file or barrel changed |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Current owner, `main`, docs, tests, and semantic exceptions audited | done |
| Implementation | complete | Owner, tests, apps, and docs restored to `h1`…`h6` | done |
| Verification | complete | Tests, typechecks, MDX/parity, Biome, Browser, zero scan, and autoreview pass | done |
| PR / tracker sync | complete | N/A: neither requested nor supplied | done |
| Closeout | complete | Goal ledger and final audit complete | final response |

Findings:
- `heading1`…`heading6` were branch-only plugin identities; current `main` already derives `KEYS.h1`…`KEYS.h6` from `NODES` as `h1`…`h6`.
- Serialized heading types were already correct. The regression affected plugin identity, generated update namespaces, input-rule ownership/IDs, apps, and docs.
- Remaining `heading1` strings are deliberate Markdown URL-validation text fixtures and historical link changelog prose, not plugin identifiers.

Decisions and tradeoffs:
- Remove redundant H1-H6 overrides from `KEYS` and inherit the canonical values from `NODES` instead of maintaining duplicate equal mappings.
- Hard-cut command and input-rule namespaces to `h1`…`h6`; keep no alias for `heading1`…`heading6`.
- Add no changeset because release truth is relative to `main`, where the concise identities already exist.

Implementation notes:
- Restored `KEYS.h1`…`KEYS.h6` and `KEYS.heading` through the `NODES` spread.
- Migrated base/React heading capability tests, input-rule runtime keys/IDs, registry installation demos, heading docs, API docs, and install docs.
- Preserved `NODES.h1`…`NODES.h6` as serialized element types.

Review fixes:
- Scoped Biome requested one compact array format in `plate-keys.spec.ts`; applied and rechecked.
- Final autoreview found no accepted/actionable issue.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Scoped Biome found one formatting delta | 1 | Apply the exact formatter shape | Rechecked clean |

Verification evidence:
- `bun test packages/utils/src/lib/plate-keys.spec.ts packages/basic-nodes/src/lib/BaseHeadingPlugins.spec.tsx packages/basic-nodes/src/react/BasicNodesPlugins.spec.tsx`: 11 pass, 0 fail, 64 expectations.
- `pnpm turbo typecheck --filter=./packages/utils --filter=./packages/basic-nodes`: 13/13 tasks.
- `pnpm --filter www typecheck`: MDX source build, docs parity, registry source, app TypeScript, and package-integration TypeScript pass.
- Scoped `pnpm exec biome check`: clean.
- Browser `/blocks/basic-blocks-demo`: HTTP 200, one editable, rendered H1/H2/H3, zero console errors.
- Final semantic scan finds no stale plugin/update/input-rule/API use; only unrelated Markdown content fixtures and historical changelog prose remain.
- `.agents/skills/autoreview/scripts/autoreview --mode local --prompt <scoped heading contract>`: clean, no accepted/actionable findings, correctness 0.84.

Final handoff contract:
- PR line: N/A: no PR requested or created
- Issue / tracker line: N/A: no tracker supplied
- Confidence line: 95-100%; owner, runtime, type, docs, browser, and review evidence agree
- Flow table:
  - Reproduced: source comparison proves the branch-only long-name regression; browser N/A before fix because this was an explicit identity restoration
  - Verified: 11/11 focused tests, 13/13 package tasks, full www typecheck, and clean Browser route
- Browser check: `/blocks/basic-blocks-demo` renders H1/H2/H3 in one editable with zero console errors
- Outcome: heading plugin identities and commands are `h1`…`h6` everywhere they semantically apply
- Caveat: literal Markdown strings such as `# heading1` remain in Link URL-validation fixtures by design
- Design:
  - Chosen boundary: canonical `NODES`/`KEYS` identity owner plus every current semantic consumer
  - Why not quick patch: changing only the constants would leave stale generated command names, runtime rule IDs, docs, and examples
  - Why not broader change: serialized node types and unrelated heading behavior were already correct
- Verified: focused runtime/types, docs parser/parity, Browser, lint, source scan, and autoreview
- PR body verified: N/A: no PR created

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
- Issue / tracker: N/A: not supplied
- Browser proof: `/blocks/basic-blocks-demo` passed with zero console errors
- Caveats: non-API Markdown sample text intentionally retains words like `heading1`

Timeline:
- 2026-08-01T09:24:54.875Z Task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response; implementation and verification are complete |
| What is the goal? | Hard-cut heading plugin identities from `heading1`…`heading6` back to `h1`…`h6` |
| What have I learned? | The long names were branch-only drift; `main` already owns the concise contract |
| What have I done? | Restored the owner, migrated semantic consumers, and closed source/type/runtime/docs/browser/review proof |

Open risks:
- None in the restored heading identity surface. Unrelated shared-checkout changes remain outside this task.
