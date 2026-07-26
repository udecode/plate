# apply constructor-first extend cleanup

Objective:
Move 10 independent `.extend()` fixtures/examples into plugin constructors and
repair every stale constructor-first guidance block found in the live tree;
done when focused proof and structural audits pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-25-apply-constructor-first-extend-cleanup.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: user chat follow-up to the completed repo-wide `.extend()` audit
- id / link: N/A: no external tracker
- title: Apply every constructor-eligible `.extend()` cleanup
- acceptance criteria:
  - move the five audited fixture/benchmark `.extend()` calls into constructors;
  - move the five audited plugin-creator examples into constructors while
    keeping only real dependent stages;
  - repair the three stale constructor-versus-`.extend()` guidance blocks;
  - include guidance/docs in the same structural scan;
  - preserve runtime behavior and inferred callback types;
  - regenerate agent mirrors from source rules and close focused proof.

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
- initial confidence score: N/A: exact binary checklist exists
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- All 10 originally audited constructor-eligible executable/examples either no
  longer use `.extend()` or were deleted by the concurrent owner colocation.
- Every stale guidance block found teaches constructor-first authoring and reserves
  `.extend()` for imported/prebuilt contributions, inaccessible shared
  factories, or earlier-stage type dependencies.
- New production chains that appeared after the audit snapshot are either moved
  into the constructor or explicitly allowlisted with their exact dependent
  stage fields.
- Focused tests, modified-package typechecks, schema-adoption audit, agent
  source/generated sync, lint, and final review pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-25-apply-constructor-first-extend-cleanup.md` passes.

Verification surface:
- Focused Bun tests for AI, Selection, and Table fixture owners.
- Source-first Turbo typecheck for `packages/ai`, `packages/selection`, and
  `packages/table`.
- Benchmark syntax/targeted smoke proof for
  `benchmarks/slate-v2/donor/core/current/clipboard-large-payload.mjs`.
- `node tooling/scripts/check-plate-schema-adoption.mjs --audit` plus its
  checker tests.
- Targeted structural audit for the original 13 rows plus live-tree findings.
- `pnpm install` plus generated skill/source parity checks.
- `pnpm lint:fix` with scoped Biome fallback when unrelated shared artifacts
  block the root command; exact-diff review for this lane.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Do not change the accepted plugin authoring API.
- Do not move a stage that consumes an earlier inferred contribution.
- Do not annotate callbacks or plugin exports to hide inference regressions.
- Preserve concurrent shared-worktree changes outside the exact owner lines.

Boundaries:
- Source of truth: live audited files; `.agents/rules/plate-next.mdc` for the
  generated Plate Next skill; plugin-creator rule assets for their examples.
- Allowed edit scope: the 10 audited fixture/example locations, 3 stale
  guidance blocks, this goal plan, and generated mirrors/install metadata
  produced by the required sync.
- Browser surface: `/docs/plugin-methods` because one stale Chinese guide
  sentence was found during the exhaustive content pass.
- Browser strategy: start `www`, open the exact route in Browser, and record an
  exact unrelated build blocker if the shared checkout cannot render.
- Tracker sync: N/A: no issue or PR.
- Non-goals: no public API redesign, no hard cut, no unrelated package cleanup,
  no commit/push/PR.

Output budget strategy:
- Read exact audited ranges and run count/file-list searches before printing
  matches. Cap command output; exclude generated/build/vendor trees unless a
  generated mirror is the named proof owner.

Blocked condition:
- Stop only if constructor placement causes an owning Core inference regression
  that cannot be repaired inside this accepted scope without a new public API
  decision, or repeated environment/tool failure leaves no narrower proof.

Task state:
- task_type: behavior-neutral constructor-first cleanup plus agent guidance repair
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: complete

Current verdict:
- verdict: pass with one unrelated Browser caveat
- confidence: high
- next owner: none for this constructor-first lane
- reason: live structural audit, 48 focused tests, type proof, source/mirror
  sync, scoped lint, and exact-diff review all pass

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-25-apply-constructor-first-extend-cleanup.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Exact 10 code/example and 3 guidance requirements are in Task source and threshold |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | Fully read `plate-plugin-creator`, its two required rule assets, `autogoal`, and `agent-native-reviewer` |
| Active goal checked or created | yes | `get_goal` returned no active goal; creation follows this filled shell |
| Source of truth read before edits | yes | Live authoring rules and prior exact audit plan read |
| Tracker comments and attachments read | no | N/A: chat-only task |
| Video transcript evidence required | no | N/A: no recording |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: exact audit already resolved ownership; behavior-neutral mechanical adoption |
| TDD decision before behavior change or bug fix | no | N/A: no behavior change; existing focused tests are regression proof |
| Branch decision for code-changing task | no | N/A: no branch/commit/PR requested |
| Release artifact decision | no | N/A: fixtures, benchmark donor, and agent guidance only |
| Browser tool decision for browser surface | no | N/A: no runnable product/browser surface changes |
| PR expectation decision | no | N/A: no PR requested |
| Tracker sync expectation decision | no | N/A: no tracker |
| Output budget strategy recorded | yes | Exact-file reads and capped searches recorded above |
| Agent-native pack selected | yes | `agent-native` pack materialized |
| Agent-facing action surface identified | yes | Plugin constructor versus `.extend()` authoring guidance |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/plate-next.mdc`; regenerate `.agents/skills/plate-next/SKILL.md` with `pnpm install` |
| `agent-native-reviewer` loaded or waiver recorded | yes | Skill read completely before edits |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; N/A: no duration requested.
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
- [x] Implementation fixes the right ownership boundary: independent
      contributions moved into constructors; the unused Selection fixture API
      was deleted instead of publishing a fake partial production contract.
- [x] Release artifact requirement recorded: N/A because no published package
      behavior, export, or registry component changes.
- [x] Final handoff shape decided: concise batch result with exact changed
      categories, proof, and browser N/A.
- [x] Branch handling recorded: N/A because no git operation was requested.
- [x] Local-env-rot retry policy recorded: use one `pnpm run reinstall` only if
      a failure matches the repo’s install-corruption signals.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded: agent-action guidance can teach the wrong
      authoring boundary; source/generated sync and targeted source audit cover it.
- [x] Review/autoreview target selected: exact constructor-first owner files;
      structured local helper waived because the shared local diff is 158 files
      and roughly 54,000 unrelated changed lines.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Output budget discipline recorded and followed except one dev-server poll
      streamed repeated unrelated build errors; broad output stopped
      immediately and later proof stayed capped.
- [x] Agent-native pack: source rule owners were edited; generated `SKILL.md`
      mirrors were regenerated, never hand-edited.
- [x] Agent-native pack: the changed action is discoverable from
      `plate-plugin-creator` and its required `typing.md` / `creation-flow.md`.
- [x] Agent-native pack: `pnpm install` regenerated both affected skill mirrors.
- [x] Agent-native pack: agent-native review passed with no actionable gap.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the named tests, type proof, audits, sync, and review | All named proof below passed; Browser caveat recorded separately |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: behavior-neutral authoring cleanup; inference regression was caught by typecheck |
| Targeted behavior verification | yes | Run focused tests | Bun 48/48 across Selection, Table, AIChat, codec benchmark, and checker |
| TypeScript or typed config changed | yes | Run relevant typecheck | Selection/Table Turbo 16/16 tasks; focused BaseAI temporary-project `tsc` passed |
| Package exports or file layout changed | no | Run `pnpm brl` or N/A | N/A: this lane added/deleted no exported files; concurrent AI colocation owns its barrels |
| Package manifests, lockfile, or install graph changed | no | Run install if applicable | N/A as package delta; `pnpm install` still ran for agent mirror sync |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | Two successful installs; exact source/mirror phrase checks passed |
| Workspace authority proof | yes | Run proof in owning workspace | Every command ran in `/Users/zbeyens/git/plate-2`; Browser targeted localhost from that checkout |
| Browser surface changed | yes | Capture Browser proof or blocker | `/docs/plugin-methods` opened; Next build overlay blocked rendering on unrelated missing AI exports |
| Browser final proof | yes | Record exact browser result | Source MDX build passed; Browser caveat names `aiCommentToRange`, `applyAISuggestions`, and other missing AI exports |
| CI-controlled template output changed | no | Restore or N/A | N/A: no `templates/**` edits |
| Package behavior or public API changed | no | Add changeset or N/A | N/A: declarations, exports, runtime behavior, and public API shape unchanged |
| Registry-only component work changed | no | Update registry changelog or N/A | N/A: no registry edits in this lane |
| Docs or content changed | yes | Verify source-backed claim and render | 52 content `.extend` tokens audited; MDX source build passed; render blocked by unrelated AI export churn |
| High-risk mini gate | yes | Record failure mode and proof | Risk was teaching context-only `.extend()` or flattening dependent stages; exact doctrine/mirror checks plus production audit cover both |
| Agent-native review for agent/tooling changes | yes | Close actionable findings | PASS: route, source owner, generated mirror, proof command, and discoverability all present |
| Local install corruption suspected | no | Reinstall or N/A | N/A: failures were deterministic missing shared-worktree files/exports, not install corruption signals |
| Autoreview for non-trivial implementation changes | no | Run helper or justified waiver | N/A: helper cannot isolate this lane from a 158-file/54k-line shared local diff; exact task diff manually reviewed with zero findings |
| PR create or update | no | Run check before PR or N/A | N/A: user did not request PR work |
| Task-style PR body verified | no | Verify PR body or N/A | N/A: no PR |
| PR proof image hosting | no | Host image or N/A | N/A: no PR |
| Tracker sync-back | no | Sync tracker or N/A | N/A: no tracker |
| Final handoff contract | yes | Fill exact outcome/proof/caveat fields | Completed below |
| Final lint | yes | Run root or scoped lint | Root `pnpm lint:fix` blocked by unrelated artifact lint debt; scoped Biome passed 4 files and `git diff --check` passed |
| Output budget discipline | yes | Record any miss and recovery | One dev-server poll streamed repeated errors; server stopped and every later command was capped |
| Timed checkpoint | no | Continue to duration or N/A | N/A: no duration requested |
| Goal plan complete | yes | Run final checker | `[autogoal] complete` after final evidence update |
| Agent source / generated sync | yes | Run `pnpm install` and compare mirrors | Passed twice; `plate-next` and `plate-plugin-creator` source phrases match generated skills |
| Agent action discoverability | yes | Audit route | `plate-plugin-creator` requires both edited rule assets; constructor-first law is also in its generated main skill |
| Agent-native review | yes | Close findings | PASS; no accepted/actionable findings |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Skills, rules, prior audit, and exact targets read | implementation |
| Implementation | complete | Constructor moves, dead fixture API deletion, live BaseAI cleanup, checker/doctrine/docs repair | verification |
| Verification | complete | 48/48, type proof, 4,648-file audit, checker 24/24, sync and scoped lint | closeout |
| PR / tracker sync | complete | N/A: neither requested | final response |
| Closeout | complete | Manual exact-diff and agent-native reviews clean; Browser caveat recorded | final response |

Findings:
- Prior exhaustive audit found 35 production and 23 current public-doc
  executable `.extend()` calls justified.
- Exactly 10 non-production calls can move to constructors and 3 guidance
  blocks are stale.
- The live tree changed after that snapshot: the two AI fixture specs were
  deleted by owner colocation, and a new independent BaseAI API `.extend()`
  appeared. The API moved into the constructor.
- AIChat keeps `[extension]` because it calls the earlier inferred
  `context.api.show`; Copilot keeps `[api, handlers, render, selectors,
  shortcuts] -> [extension]` because the first stage uses the constructor tx
  group and the extension uses the first-stage API.
- One Chinese public guide sentence still claimed “context” alone justified
  `.extend()`; it was corrected.

Decisions and tradeoffs:
- Keep every production and dependent-stage `.extend()` unchanged; constructor
  context access alone is not a staging reason.
- Edit source rule owners and regenerate mirrors; never hand-edit generated
  `SKILL.md`.
- Delete an unused partial Selection fixture API instead of inventing a
  constructor type escape.
- Keep imported/prebuilt consumer adaptation and historical migration examples;
  they are not constructor-eligible author declarations.

Implementation notes:
- The two AI fixture candidates were moved, then their files were deleted by
  concurrent owner colocation; they remain absent and were not resurrected.
- Moved the Table DOM extension, benchmark codec, and live BaseAI API into
  their constructors.
- Deleted the unused Selection fixture API; its only behavior owner is the
  `selectedIds` option that the test actually asserts.
- Rewrote five plugin-creator examples and every stale guidance/docs block found.
- Updated the production-stage checker to reflect the live AIChat/Copilot
  dependency graphs and moved preview-test allowlist ownership.

Review fixes:
- Manual exact-diff review: zero actionable findings.
- Agent-native review verdict: PASS.
  - action: author independent plugin contribution;
  - route: `plate-plugin-creator`;
  - source owners: `.agents/rules/plate-plugin-creator.mdc`,
    `rules/typing.md`, `rules/creation-flow.md`, and `plate-next.mdc`;
  - mirrors: regenerated main skill files;
  - proof: install sync, exact phrase audit, source checker, focused tests.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Selection constructor rejected a partial `BlockSelectionConfig['pluginApi']` | 1 | Inspect actual test use instead of annotating/casting the callback | `set` was unused; deleted the fake fixture API and Selection typecheck passed on rerun |
| Combined package typecheck reached unrelated missing AI transform/hook files | 1 | Keep Selection/Table proof; run focused BaseAI temporary-project `tsc` | Resolved proportionally: Selection/Table pass; BaseAI exact `tsc` pass; broad AI remains external WIP |
| AI fixture files disappeared during verification | 1 | Treat live owner colocation as truth; do not restore dead files | Resolved: exact audit asserts both files remain absent |
| Root `pnpm lint:fix` hit unrelated large artifacts and 160 existing lint errors | 1 | Run scoped Biome and diff check | Resolved for this lane; exact files clean |
| Browser route showed Next build overlay for missing concurrent AI exports | 1 | Record exact route/blocker; rely on successful MDX source build for content syntax | Browser caveat remains external to this lane |
| Dev-server poll streamed repeated build errors | 1 | Stop server and cap all later output | Resolved; no further broad output |

Verification evidence:
- `bun test <5 focused files>` -> 48 pass, 0 fail.
- `pnpm turbo typecheck --filter=./packages/selection --filter=./packages/table`
  -> 16/16 tasks passed.
- focused temporary-project `tsc` for `BaseAIPlugin.ts` -> pass; temp config
  deleted.
- `node tooling/scripts/check-plate-schema-adoption.mjs --audit` -> passed
  4,648 source/docs files.
- checker unit suite -> 24 pass, 0 fail.
- clipboard benchmark suite -> included in 48/48; configured codec path passed.
- constructor-first exact audit -> 4 live no-extend owners, 2 colocated
  deletions, 7 guidance/source-mirror checks passed.
- `pnpm install` -> source/generated skill sync passed twice.
- `pnpm --filter www build:source:dev` -> passed.
- scoped Biome -> clean; `git diff --check` -> clean.

Final handoff contract:
- PR line: N/A: no PR requested
- Issue / tracker line: N/A: no tracker
- Confidence line: high; code/type/structural proof clean, Browser blocked externally
- Flow table:
  - Reproduced: Selection partial-contract type failure and live checker drift
  - Verified: 48/48 focused tests, type proof, 4,648-file audit, sync, scoped lint
- Browser check: attempted `/docs/plugin-methods`; unrelated missing AI exports
  prevented route rendering
- Outcome: all live constructor-eligible `.extend()` rows removed or deleted;
  dependent stages retained and documented
- Caveat: root lint and Browser remain blocked by unrelated shared WIP
- Design:
  - Chosen boundary: constructors for independent contributions; later stages
    only for accumulated types/imported adaptation/inaccessible factories
  - Why not quick patch: annotations/casts would hide the inference defect
  - Why not broader change: no public API redesign was needed
- Verified: exact commands listed above
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
- Browser proof: attempted; unrelated Next build error recorded
- Caveats: root lint and rendered docs route blocked by unrelated shared WIP

Timeline:
- 2026-07-25T23:06:47.619Z Task goal plan created.
- 2026-07-26 Requirement extraction, skill reads, scope, proof, and source-owner
  gates completed before edits.
- 2026-07-26 Applied all 13 audited cleanup rows; focused 23/23 tests passed.
- 2026-07-26 Selection partial-API inference failed honestly; deleted its
  unused fixture API. Selection and Table typechecks then passed; AI package
  typecheck is blocked by unrelated missing shared-worktree source files.
- 2026-07-26 Live audit found new AI chains; moved BaseAI API, retained and
  exactly allowlisted dependent AIChat/Copilot stages.
- 2026-07-26 Audited all 52 public content `.extend` tokens; repaired stale
  Chinese context wording.
- 2026-07-26 Final focused proof, source/mirror sync, manual review, and
  agent-native review passed; Browser/root-lint external caveats recorded.
- 2026-07-26 Autogoal completion checker passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | Constructor-first cleanup with no unjustified `.extend()` examples |
| What have I learned? | Live-tree churn added BaseAI/checker/docs rows; dependent AIChat/Copilot stages are justified |
| What have I done? | Closed original and live findings with focused type/runtime/structural proof |

Open risks:
- No known constructor-first regression.
- External shared-WIP caveat: www cannot render until removed AI exports are
  adopted by current registry consumers; broad AI package typecheck fails for
  the same concurrent colocation lane.
