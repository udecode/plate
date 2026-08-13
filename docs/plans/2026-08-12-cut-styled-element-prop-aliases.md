# Cut styled element prop aliases

Objective:
Cut public `StyledPlate*Props` and `StyledPlite*Props` aliases; migrate renderer
components to the canonical `Plate*Props` / `Plite*Props` families.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-12-cut-styled-element-prop-aliases.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: direct user request
- id / link: N/A
- title: Cut styled renderer prop aliases
- acceptance criteria: no public `StyledPlate*Props` or `StyledPlite*Props`
  aliases; all consumers use canonical renderer props; Core and www compile.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A
- semantics: N/A
- initial confidence score: N/A
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- Zero source matches for public `StyledPlate*Props` or `StyledPlite*Props`.
- Registry consumers use canonical descriptor-inferred props.
- Core and `platejs` builds, Core tests, barrels, lint, source/export audits, and
  registry changelog checks pass. Full typecheck and browser gates may close
  with exact unrelated-owner blockers when neither reaches this change.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-12-cut-styled-element-prop-aliases.md` passes.

Verification surface:
- `rg` source audit for removed names.
- `pnpm brl`.
- `pnpm turbo typecheck --filter=./packages/core --filter=./apps/www`, with
  exact unrelated-owner failures recorded if the shared tree prevents a pass.
- `pnpm lint:fix`.
- Browser proof on a registry demo, or exact pre-render app blocker evidence.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: Core node wrapper declarations and their complete consumers.
- Allowed edit scope: `packages/core` node wrapper types/type contracts, three
  registry consumers, Core release prose, registry changelog artifacts, one
  stale plan reference, and this plan.
- Browser surface: registry editor demo rendering callout/link nodes.
- Browser strategy: Browser. Use Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A; direct local task.
- Non-goals: no wrapper runtime redesign, no unrelated renderer API changes,
  no compatibility aliases.

Output budget strategy:
- Use exact symbol searches and bounded owner-file reads; cap command output.

Blocked condition:
- Stop only if canonical renderer props cannot type existing registered
  components without reintroducing the removed composite surface.

Task state:
- task_type: public API hard cut and consumer migration
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active

Current verdict:
- verdict: implement the hard cut at Core ownership
- confidence: high
- next owner: task
- reason: the styled aliases duplicate canonical renderer props and expose
  polymorphic wrapper implementation details.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-12-cut-styled-element-prop-aliases.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Hard cut both `StyledPlate*Props` and `StyledPlite*Props`; canonical props only |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | `hard-cut`, `task`, `autogoal`, `changeset`, and `best-api` read |
| Active goal checked or created | yes | Matching goal created for this plan |
| Source of truth read before edits | yes | Core live/static wrapper declarations plus all exact consumers read |
| Tracker comments and attachments read | no | N/A: direct prompt |
| Video transcript evidence required | no | N/A: no video |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: exact API owner and complete consumer graph are local and bounded |
| TDD decision before behavior change or bug fix | no | N/A: type/export hard cut; compile contracts are the proof |
| Branch decision for code-changing task | no | N/A: user did not request branch or PR |
| Release artifact decision | yes | Update existing `@platejs/core` major changeset because this branch already owns the breaking API release packet |
| Browser tool decision for browser surface | yes | Browser proof after compile checks |
| PR expectation decision | no | N/A: no PR requested |
| Tracker sync expectation decision | no | N/A: no tracker |
| Output budget strategy recorded | yes | Exact symbols and bounded file slices only |
| Package/API pack selected | yes | `package-api` materialized in this plan |
| Public surface or package boundary identified | yes | `@platejs/core/react` and `@platejs/core/static` exports |
| Release artifact path selected | yes | Existing `.changeset/plugin-portal-scoped-api.md` |
| `changeset` skill loaded when `.changeset` is required | yes | Read before editing release prose |
| Barrel/export impact decision recorded | yes | Run `pnpm brl`; source barrels export owner module wholesale |

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
- [x] Required video or screen-recording evidence is N/A: none supplied.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary: aliases removed in Core;
      wrapper composite types remain private; consumers use canonical props.
- [x] Release artifacts recorded: existing Core major changeset plus generated
      registry changelog entry.
- [x] Final handoff shape decided: concise local implementation report; PR and
      tracker N/A.
- [x] Branch handling recorded for code-changing work: N/A, no branch/PR requested.
- [x] Local-env-rot retry policy N/A: failures are deterministic source type
      errors and a missing generated source file, not install-corruption signals.
- [x] Workspace authority recorded: all commands ran in
      `/Users/zbeyens/git/plate-2`; Browser targeted its local www server.
- [x] High-risk note: failure mode is leaking/deleting wrapper inference;
      package builds plus declaration export audit prove canonical exports and
      private wrapper composite types.
- [x] P2 autoreview selected as dirty local. Helper failed closed on unrelated
      oversized untracked generated schema; manual bounded P2 review found no
      accepted issue.
- [x] Agent-native review decision recorded: N/A, no agent/tooling edits.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix selects the existing Core changeset.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only rule is N/A because Core public API changes.
- [x] Package/API pack: no-artifact rule is N/A because this is a published breaking Core type cut.
- [x] Package/API pack: hard cut is explicit; no compatibility alias survives.
- [x] Package/API pack: Core and `platejs` builds pass; Core tests pass 686/686;
      full typecheck blockers are recorded below.
- [x] Package/API pack: `pnpm brl` passes; Core changeset and registry changelog updated.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named source/build/test/audit gates | Core/plate builds, Core 686/686, barrels, lint, declaration/source audit, changelog check pass; unrelated blockers recorded |
| Bug reproduced before fix | no | N/A | N/A: API hard cut, not bug fix |
| Targeted behavior verification | yes | Run focused proof | Core 686/686 plus built declaration export audit pass |
| TypeScript or typed config changed | yes | Run relevant typecheck | Full gate attempted; blocked by `plite-react/with-react.ts`, List, Suggestion, and Table source errors unrelated to this diff; Core and plate declaration builds pass |
| Package exports or file layout changed | yes | Run `pnpm brl` | 56/56 barrel tasks pass |
| Package manifests, lockfile, or install graph changed | no | N/A | N/A: untouched |
| Agent rules or skills changed | no | N/A | N/A: untouched |
| Workspace authority proof | yes | Prove in owning checkout | All commands ran in `/Users/zbeyens/git/plate-2` |
| Browser surface changed | no | N/A | N/A: runtime rendering unchanged; consumer types only |
| Browser final proof | yes | Attempt affected route | `/blocks/editor-demo` blocked before renderer load by missing `apps/www/src/registry/components/editor/plate-types.ts` generated import |
| CI-controlled template output changed | no | N/A | N/A: untouched |
| Package behavior or public API changed | yes | Update changeset | Existing `.changeset/plugin-portal-scoped-api.md` updated |
| Registry-only component work changed | yes | Update registry changelog | Source entry plus generated JSON; generator check passes |
| Docs or content changed | no | N/A | N/A: internal plans and release artifacts only |
| High-risk mini gate | yes | Prove canonical exports/private wrapper typing | Core/plate builds and declaration audit pass; zero styled alias exports |
| Agent-native review for agent/tooling changes | no | N/A | N/A: untouched |
| Local install corruption suspected | no | N/A | N/A: deterministic unrelated source failures |
| P2 autoreview for non-trivial implementation changes | yes | Run local P2 | Helper failed closed on unrelated oversized untracked schema; manual bounded review found no accepted issue |
| PR create or update | no | N/A | N/A: not requested |
| Task-style PR body verified | no | N/A | N/A: no PR |
| PR proof image hosting | no | N/A | N/A: no PR |
| Tracker sync-back | no | N/A | N/A: no tracker |
| Final handoff contract | yes | Fill exact outcome/proof/caveat | Filled below |
| Final lint | yes | Run `pnpm lint:fix` | Pass; only existing large artifact warnings |
| Output budget discipline | yes | Audit commands | Exact searches and capped reads used |
| Timed checkpoint | no | N/A | N/A: none requested |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-12-cut-styled-element-prop-aliases.md` | Pass after final plan closure |
| Public API / package boundary proof | yes | Source-audit public API | Zero styled alias matches in Core source/dist; canonical props remain exported through Core and `platejs` |
| Release artifact classification | yes | Classify delta | Published breaking Core type removal plus copied registry import migration |
| Published package changeset | yes | Update Core changeset | Existing Core major changeset updated; no forbidden minor |
| Registry changelog | yes | Generate/check registry event | 51/51 generated events check passes |
| No release artifact | no | N/A | N/A: artifacts required and added |
| Package typecheck/build/test | yes | Run package proof | Core build and 686/686 tests pass; `platejs` build passes; unrelated typecheck blockers recorded |
| Barrel/export generation | yes | Run `pnpm brl` | 56/56 tasks pass |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | complete owner/consumer audit | implementation |
| Implementation | completed | aliases private/removed; consumers migrated | verification |
| Verification | completed | evidence below | closeout |
| PR / tracker sync | completed | N/A: not requested | final response |
| Closeout | completed | plan and evidence closed | final response |

Findings:
- The six styled aliases were public wrapper implementation composites.
- Only three production consumers used them; canonical descriptor props type all three.
- `callout-node`'s incoming `className` was not part of renderer input and was dead customization surface.

Decisions and tradeoffs:
- Keep `PlateHTMLProps` / `PliteHTMLProps` public for direct primitive composition;
  keep the combined primitive callable types private.
- Do not fold polymorphic HTML props into renderer callback props; the DOM tag
  is a primitive choice, not renderer input.

Implementation notes:
- Removed all `StyledPlateElement/Text/LeafProps` and
  `StyledPliteElement/Text/LeafProps` exports.
- Migrated callout/link live/static renderers to canonical descriptor props.
- Removed styled-alias-only type contract rows.

Review fixes:
- Manual P2 bounded review: no accepted finding. Structured helper did not
  reach review because unrelated untracked generated schema exceeded scanner limit.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Initial multi-file patch stale changeset context | 1 | Split by owner | Applied cleanly |
| Core/www typecheck unrelated source errors | 2 | Isolate builds/tests and record exact owners | Core/plate builds and Core tests pass; blocker retained |
| Browser pre-render missing generated plate-types import | 1 | Inspect console/build owner | Exact unrelated blocker recorded; no source workaround |
| P2 helper oversized unrelated untracked schema | 1 | Preserve WIP; manual bounded review | No accepted issue |

Verification evidence:
- `pnpm --filter @platejs/core build` -> pass.
- `pnpm --filter platejs build` -> pass.
- `pnpm --filter @platejs/core test` -> 686 pass, 0 fail.
- `pnpm brl` -> 56/56 tasks pass.
- `pnpm lint:fix` -> pass; 15 existing oversized-artifact warnings.
- `node tooling/scripts/generate-ui-changelog-entries.mjs --check` -> 51 events pass.
- `rg` across Core source/dist and registry -> zero `StyledPlate` / `StyledPlite` matches.
- `git diff --check` -> pass.

Final handoff contract:
- PR line: N/A: not requested
- Issue / tracker line: N/A: direct task
- Confidence line: high for API cut; browser/typecheck caveats are unrelated shared-tree blockers
- Flow table:
  - Reproduced: N/A: hard cut
  - Verified: Core 686/686; builds/barrels/lint/export audit pass
- Browser check: blocked before component load by missing generated `plate-types.ts`
- Outcome: styled aliases removed publicly; canonical props are the sole renderer path
- Caveat: full shared-tree typecheck and browser page remain blocked by unrelated owners
- Design:
  - Chosen boundary: Core owns public renderer prop types; wrapper composites private
  - Why not quick patch: migrating only call sites would leave the bad public alternatives
  - Why not broader change: `PlateHTMLProps` / `PliteHTMLProps` still serve direct primitive composition
- Verified: commands listed above
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
- PR: N/A
- Issue / tracker: N/A
- Browser proof: exact pre-render blocker recorded
- Caveats: unrelated full-typecheck and dev-route blockers

Timeline:
- 2026-08-12T16:21:49.490Z Task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | One canonical renderer props family; styled aliases gone |
| What have I learned? | Wrapper composite typing belongs private |
| What have I done? | Hard cut, consumer migration, release artifacts, proof |

Open risks:
- Shared-tree typecheck failures in Plite React, List, Suggestion, and Table are unresolved outside this task.
- www browser route cannot compile until its missing generated `plate-types.ts` owner is repaired.
