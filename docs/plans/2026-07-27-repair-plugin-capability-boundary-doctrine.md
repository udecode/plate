# repair plugin capability boundary doctrine

Objective:
Make Plate plugin capability ownership unambiguous across the canonical creator
rule, cleanup auditor, API doctrine, Vision, and generated skills.

Goal plan:
docs/plans/2026-07-27-repair-plugin-capability-boundary-doctrine.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)
- docs (docs/plans/templates/packs/docs.md)

Task source:
- type: direct user request
- id / link: current Codex task
- title: repair plugin capability boundary protocol
- acceptance criteria:
  - `plate-plugin-creator` canonically distinguishes `initialState`, `store`,
    `selectors`, `api`, `read`, `update`, `extension`, constructor,
    `.extend()`, and `.configure()`.
  - `plate-next` audits and references that protocol instead of maintaining a
    contradictory duplicate.
  - stale plugin `options` / `getOptions` doctrine is removed in favor of the
    live `initialState` / `store` model.
  - `best-api` and the smallest Plate Vision owner preserve the reusable API
    decision.
  - Plate-next doctrine advances from the already-recorded state/store v14 to a
    distinct capability-boundary v15 entry with an exact fingerprint.
  - generated skills are regenerated from `.agents/rules/**`; no generated
    `SKILL.md` is edited directly.
  - source audits, version checks, mirror checks, agent-native review, and
    final review pass.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A; none requested
- semantics: N/A
- initial confidence score: 0.88
- improvement loop: source audit -> rule repair -> regenerate -> validate ->
  agent-native review -> final review
- final score / loop closure: 0.97; source, mirror, version, agent-native, and
  autoreview loops are closed

Completion threshold:
- The canonical protocol is source-backed, internally consistent, regenerated
  into every skill mirror, versioned as plate-next v15, and passes every named
  verification command with no accepted review findings left.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-27-repair-plugin-capability-boundary-doctrine.md` passes.

Verification surface:
- Core source audit for the live capability fields and callback contracts.
- Scoped stale-language searches across the changed rules, skill resources,
  Vision, and generated skills.
- `pnpm install` for Skiller regeneration.
- Plate-next version helper `validate`, `status`, and `doctrine-fingerprint`.
- Generated-mirror source audit and any repo-owned skill checker found during
  implementation.
- `pnpm lint:fix`.
- `agent-native-reviewer` and `autoreview` over the actual local diff.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Do not edit package source or change the runtime API.
- Do not edit generated `SKILL.md` files directly.
- Do not duplicate the complete canonical protocol across worker skills.

Boundaries:
- Source of truth: `.agents/rules/plate-plugin-creator.mdc` for plugin
  authoring mechanics; `.agents/rules/best-api.mdc` for reusable API taste;
  `.agents/rules/plate-next.mdc` for migration auditing; root `VISION.md` and
  `docs/vision/plate.md` for durable product doctrine; Core plugin types for
  factual runtime/type contracts.
- Allowed edit scope: those source rules, source-owned creator resources
  discovered from them, root/Plate Vision, plate-next version metadata and
  template, this goal plan, and generated mirrors from `pnpm install`.
- Browser surface: N/A; no `content/**`, `apps/www/**`, or package runtime/UI
  changes.
- Browser strategy: N/A. Use Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A; no issue or Linear target.
- Non-goals: package source migration, public runtime changes, compatibility
  aliases, package attestations, PR/commit/push, rendered docs changes.

Output budget strategy:
- Use `rg` with exact capability terms and bounded path globs; use targeted
  `sed` ranges; cap command output; never stream whole-repo build/test logs.

Blocked condition:
- Block only if the generated resource owner cannot be identified, the
  doctrine fingerprint cannot be reproduced, or current Core contradicts the
  accepted capability model in a way that requires a runtime API decision.

Task state:
- task_type: agent-doctrine and docs repair
- task_complexity: medium
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: complete

Current verdict:
- verdict: accepted; canonicalize one protocol and remove stale duplicate law
- confidence: 0.88
- next owner: task
- reason: the live API already has one boundary model; the agent doctrine does
  not state it in one place.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-27-repair-plugin-capability-boundary-doctrine.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | acceptance criteria and boundaries above |
| Timed checkpoint parsed | N/A | no duration requested |
| Skill analysis before edits | yes | `autogoal`, `best-api`, `plate-next`, and `plate-plugin-creator` loaded |
| Active goal checked or created | yes | active goal created for this objective |
| Source of truth read before edits | yes | creator/next rules and live Core capability types inspected |
| Tracker comments and attachments read | N/A | no tracker |
| Video transcript evidence required | N/A | no video |
| `docs/solutions` checked for non-trivial existing-code work | N/A | no runtime behavior change |
| TDD decision before behavior change or bug fix | N/A | doctrine-only repair |
| Branch decision for code-changing task | N/A | no branch/git operation requested |
| Release artifact decision | N/A | agent doctrine/docs only |
| Browser tool decision for browser surface | N/A | no rendered surface |
| PR expectation decision | N/A | no PR requested |
| Tracker sync expectation decision | N/A | no tracker |
| Output budget strategy recorded | yes | bounded `rg`/`sed` and capped output |
| Agent-native pack selected | yes | generated plan includes agent-native pack |
| Agent-facing action surface identified | yes | plugin authoring and cleanup decisions |
| Source rule versus generated mirror boundary identified | yes | `.agents/rules/**` source; `SKILL.md` generated |
| `agent-native-reviewer` loaded or waiver recorded | yes | loaded fully; parity review passed |
| Docs pack selected | yes | generated plan includes docs pack |
| `docs-creator` loaded | yes | loaded fully before Vision/reference edits |
| Docs lane selected | yes | internal Vision/reference doctrine |
| Target docs and nearest sibling docs read | yes | root Vision, common Vision, Plate Vision, creator resources, and Core owners read |
| Docs style doctrine read | yes | current-state reference voice from `docs-creator` applied |
| Documented source owner identified | yes | rules/Core/Vision owners listed above |

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
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, anchors, and previews target real leaf pages or are marked N/A with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named source, mirror, version, review, and diff checks | All named checks recorded below |
| Bug reproduced before fix | N/A | Record reason | Doctrine clarity repair, not a runtime bug |
| Targeted behavior verification | yes | Prove the changed agent behavior | Core contract audit, mirror equality, and review passed |
| TypeScript or typed config changed | N/A | Record reason | No package TypeScript or typed runtime config changed |
| Package exports or file layout changed | N/A | Record reason | No package files or barrels changed |
| Package manifests, lockfile, or install graph changed | yes | Run install needed for generation | `pnpm install` completed; lockfile was already current |
| Agent rules or skills changed | yes | Regenerate and verify mirrors | `pnpm install`; all three source-to-mirror body checks passed |
| Workspace authority proof | yes | Run in owning checkout | Every command ran in `/Users/zbeyens/git/plate-2` |
| Browser surface changed | N/A | Record reason | No app, content, UI, or package runtime surface changed |
| Browser final proof | N/A | Record reason | No browser-facing behavior exists in this patch |
| CI-controlled template output changed | N/A | Record reason | Edited the source goal template, not CI-generated template output |
| Package behavior or public API changed | N/A | Record reason | Doctrine documents existing Core behavior; no runtime release change |
| Registry-only component work changed | N/A | Record reason | No registry component changed |
| Docs or content changed | yes | Apply docs pack and source-check claims | Root/Plate Vision use current-state prose backed by live Core |
| High-risk mini gate | yes | Record failure mode and proof | Risk was misrouting mutation/read/state; canonical table plus Core audit and two reviews close it |
| Agent-native review for agent/tooling changes | yes | Load reviewer and close findings | PASS; source route, mirrors, proof, and discoverability all present |
| Local install corruption suspected | N/A | Record reason | No install-corruption signal appeared |
| Autoreview for non-trivial implementation changes | yes | Run scoped local review | Clean: no accepted/actionable findings, confidence 0.81 |
| PR create or update | N/A | Record reason | User did not request PR work |
| Task-style PR body verified | N/A | Record reason | No PR exists in this task |
| PR proof image hosting | N/A | Record reason | No PR or image proof |
| Tracker sync-back | N/A | Record reason | No issue or Linear target |
| Final handoff contract | yes | Fill exact handoff | Completed below |
| Final lint | yes with caveat | Run repo and scoped lint | Repo lint hit unrelated artifact debt; scoped JSON lint and diff check passed |
| Output budget discipline | yes | Keep exploration bounded | Searches were path-scoped/capped; one 612 KB review bundle stayed inside the review helper |
| Timed checkpoint | N/A | Record reason | No duration requested |
| Goal plan complete | yes | Run the goal checker | `[autogoal] complete` |
| Agent source / generated sync | yes | Regenerate and compare | Source bodies match generated creator, next, and best-api skills |
| Agent action discoverability | yes | Audit expected routes | Creator owns authoring; Next owns audit; best-api owns public forks |
| Agent-native review | yes | Close accepted findings | PASS with zero findings |
| Docs source-backed claim audit | yes | Verify named contracts | Core types prove state/read/update/selector/portal claims |
| Docs links / routes / previews | N/A | Record reason | No public links, routes, anchors, or previews added |
| Docs MDX/content parser | N/A | Record reason | No `content/**` MDX changed |
| Plugin page specifics | N/A | Record reason | No public plugin page changed |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | skills, Vision, Core types, and live diff read | done |
| Implementation | complete | canonical protocol, worker audit, companions, template, Vision, and v15 repaired | done |
| Verification | complete | install, mirror, version, source, test, lint caveat, and reviews recorded | done |
| PR / tracker sync | N/A | neither requested nor linked | done |
| Closeout | complete | handoff and risks recorded | final response |

Findings:
- The live Core contract already exposes `initialState`, `store`, `selectors`,
  `api`, state-bound `read`, transaction-bound `update`, and raw Plite
  `extension`; the doctrine lacked one decision protocol.
- The creator typing/audit companions still taught deleted
  `options/getOptions` APIs after the main rule had moved to state/store.
- Plate Next duplicated authoring mechanics and its plan template incorrectly
  said plugin extension options belonged in `.extend()` by default.
- State/store was already recorded as doctrine v14 in the live diff, so this
  distinct capability-boundary change correctly owns v15.

Decisions and tradeoffs:
- `plate-plugin-creator` is the sole mechanics owner.
- `plate-next` keeps a compact audit map and references the creator instead of
  maintaining another authoring model.
- `best-api` owns the semantic API decision and Vision carries the durable
  minimum.
- `api` publication is immutable, but method purity is not implied:
  document reads use `read`, store projections use `selectors`, and document
  writes use `update`.
- No package attestations were advanced merely because doctrine changed.

Implementation notes:
- Added the canonical capability and authoring-stage tables to the creator.
- Repaired creator typing, creation-flow, and audit companions.
- Replaced duplicated Plate Next builder law with an enforcement checklist.
- Repaired the Plate Next template, best-api, root/Plate Vision, and v15
  metadata.
- Ran `pnpm install`; generated creator, next, and best-api skill bodies match
  their sources exactly.

Review fixes:
- Agent-native parity map:

| User action | Agent route | Source owner | Mirror / doc | Proof | Status |
|-------------|-------------|--------------|--------------|-------|--------|
| Author/refactor a plugin | `plate-plugin-creator` | `.agents/rules/plate-plugin-creator.mdc` | generated skill plus creator companions | Core contract audit + mirror equality | pass |
| Audit a migrated package | `plate-next` | `.agents/rules/plate-next.mdc` + template/version registry | generated skill | version validate/status/fingerprint + tests | pass |
| Choose a reusable public shape | `best-api` | `.agents/rules/best-api.mdc` | generated skill + root/Plate Vision | mirror equality + source audit | pass |

- Agent-native review: PASS, zero gaps.
- Scoped Codex autoreview: clean, zero accepted/actionable findings.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `bun test` did not discover the hidden Node test | 1 | use its declared `node:test` owner | `node --test` passed 8/8 |
| First portal source-audit regex expected `store` in `defineProperties` | 1 | inspect the owner and match object-literal publication | corrected audit passed |
| `pnpm lint:fix` hit unrelated docs artifact diagnostics | 1 | run scoped JSON lint and diff check | scoped lint and `git diff --check` passed; repo caveat recorded |
| First parallel proof script had a local JavaScript delimiter typo | 1 | rerun corrected script | all four proof lanes completed |

Verification evidence:
- `pnpm install` -> generated skills synced.
- `node .agents/rules/plate-next/scripts/version.mjs validate --json` -> valid,
  v15, 41 active packages, 1 retired package.
- `node .agents/rules/plate-next/scripts/version.mjs doctrine-fingerprint --json`
  -> `sha256:11a906bfe40d6200ee141e61230c2ef4b91aad4cb0fca67e83f878eec0d87e94`.
- `node --test .agents/rules/plate-next/scripts/version.test.mjs` -> 8/8.
- Source-to-generated body comparison -> MATCH for creator, next, and
  best-api.
- Core capability contract audit -> all API/read/store/update, selector, and
  constructor-field checks passed.
- Deleted option-authoring audit across creator companions -> zero matches.
- `pnpm exec biome check .agents/rules/plate-next/versions.json --write` ->
  pass, no fixes.
- `git diff --check -- <scoped files>` -> pass.
- `pnpm lint:fix` -> blocked by 170 unrelated diagnostics under existing docs
  artifacts; Biome reported no fixes applied.
- Agent-native review -> PASS, no findings.
- `.agents/skills/autoreview/scripts/autoreview --mode local ...` -> clean,
  no accepted/actionable findings, confidence 0.81.
- `node .agents/skills/autogoal/scripts/check-complete.mjs
  docs/plans/2026-07-27-repair-plugin-capability-boundary-doctrine.md` ->
  complete.

Final handoff contract:
- PR line: N/A; no PR requested
- Issue / tracker line: N/A; no tracker target
- Confidence line: 97%
- Flow table:
  - Reproduced: stale creator companion and duplicated audit doctrine found by
    scoped source search; browser N/A
  - Verified: version tests 8/8, mirrors 3/3, Core audits pass; browser N/A
- Browser check: N/A; no browser surface
- Outcome: one canonical capability/staging protocol, one audit consumer, and
  synchronized API/Vision doctrine
- Caveat: repo-wide lint remains red on unrelated large docs artifacts and
  script diagnostics; scoped changed-file checks pass
- Design:
  - Chosen boundary: creator owns mechanics; best-api/Vision own taste; Next
    audits
  - Why not quick patch: editing only generated skills would be overwritten and
    leave contradictory sources
  - Why not broader change: no runtime/package source change was needed to
    document the already-live Core contract
- Verified: exact commands and results are listed above
- PR body verified: N/A; no PR

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
- PR: N/A; no PR requested
- Issue / tracker: N/A; no tracker target
- Browser proof: N/A; no browser surface
- Caveats: repo-wide lint has unrelated docs-artifact debt; no source package
  or package attestation was changed for this task

Timeline:
- 2026-07-27T11:42:47.450Z Task goal plan created.
- 2026-07-27 canonical protocol, companions, audit, API doctrine, Vision, and
  v15 metadata repaired.
- 2026-07-27 generated mirrors synced; source/version/review gates closed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final user handoff |
| What is the goal? | Keep one source-backed plugin capability boundary protocol across authoring, audit, API taste, and Vision |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- No scoped correctness risk remains. Repo-wide lint debt outside this task
  remains visible and was not modified.
