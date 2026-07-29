# align plugin creator builder deletions

Objective:
Align Plate plugin authoring doctrine; done when source rules, version registry,
generated skills, and validation pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-28-align-plugin-creator-builder-deletions.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: direct user request
- id / link: N/A
- title: Align `plate-plugin-creator` with `plate-next`
- acceptance criteria: close both identified doctrine gaps: explicitly forbid
  deleted builder spellings and detect same-key optional-kit composition for
  `best-api` routing; edit canonical sources, bump Plate Next doctrine, sync
  generated skills, and pass source/version validation.

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
- initial confidence score: N/A
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- Canonical creator doctrine explicitly forbids all deleted builder helpers.
- Canonical creator doctrine catches same-key independently optional kit
  composition and routes its public identity to `best-api` without duplicating
  Plate Next's review procedure.
- Plate Next doctrine version is incremented with immutable migration checks.
- `pnpm install`, version validation, generated-mirror comparison, focused
  source audits, and lint complete successfully.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-28-align-plugin-creator-builder-deletions.md` passes.

Verification surface:
- `node .agents/rules/plate-next/scripts/version.mjs validate`
- focused `rg` audits of both canonical rule sources
- source-to-generated-body comparison for both named skills
- `pnpm install`
- `pnpm lint:fix`

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `.agents/rules/plate-plugin-creator.mdc`,
  `.agents/rules/plate-next.mdc`, and
  `.agents/rules/plate-next/versions.json`.
- Allowed edit scope: those canonical rules, their generated skill mirrors
  through `pnpm install`, and this goal plan.
- Browser surface: N/A: agent doctrine only.
- Browser strategy: N/A.
- Tracker sync: N/A.
- Non-goals: no package source/API migration, no duplicated composition
  procedure in the creator, no PR/commit/push.

Output budget strategy:
- Read exact skill/rule files in bounded chunks; use focused `rg`, `sed`, and
  validation commands with output caps; do not scan package/generated trees.

Blocked condition:
- Stop only if canonical source generation or the immutable version schema
  cannot express the repair after three distinct owner-level attempts.

Task state:
- task_type: agent-doctrine repair
- task_complexity: micro
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: complete

Current verdict:
- verdict: implement
- confidence: high
- next owner: `plate-plugin-creator` canonical source
- reason: both missing details have clear existing Plate Next doctrine.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-28-align-plugin-creator-builder-deletions.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Two identified gaps and proof requirements copied above |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | Read full `autogoal`, `plate-next`, and `plate-plugin-creator` skills |
| Active goal checked or created | yes | Goal created for this exact repair |
| Source of truth read before edits | yes | Generated skills read; canonical `.mdc` owner identified and relevant source verified |
| Tracker comments and attachments read | no | N/A: direct local request |
| Video transcript evidence required | no | N/A: no video |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: micro doctrine-only repair |
| TDD decision before behavior change or bug fix | no | N/A: no runtime behavior |
| Branch decision for code-changing task | no | N/A: user did not request git operations |
| Release artifact decision | no | N/A: agent doctrine only |
| Browser tool decision for browser surface | no | N/A: no browser surface |
| PR expectation decision | no | N/A: no PR requested |
| Tracker sync expectation decision | no | N/A: no tracker |
| Output budget strategy recorded | yes | Exact bounded reads and focused audits only |
| Agent-native pack selected | yes | `agent-native` pack materialized |
| Agent-facing action surface identified | yes | Plugin authoring builder and composition-routing rules |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/*.mdc`; regenerate `SKILL.md` via `pnpm install` |
| `agent-native-reviewer` loaded or waiver recorded | yes | Will load before source edit |

Work Checklist:
- [x] N/A: no duration requested. If a duration was requested, it is recorded as minimum active work unless
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
- [x] N/A: no video. Required video or screen-recording evidence is cached/read as normalized
      `<video-transcripts>` XML, or marked N/A with reason.
- [x] Nearby repo instructions and implementation patterns read before edits:
      root `AGENTS.md`, both named skills, creator supporting rules, version
      helper/tests, and agent-native reviewer.
- [x] Implementation fixes the right ownership boundary: canonical `.mdc`
      sources and the Plate Next version helper own the durable behavior.
- [x] Release artifact requirement recorded: N/A, agent doctrine only.
      N/A with reason.
- [x] Final handoff shape decided: concise files plus validation evidence;
      PR/tracker fields are N/A.
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded for code-changing work: N/A, no git operation requested.
      new branch needed, or N/A with reason.
- [x] Local-env-rot retry policy recorded: run `pnpm run reinstall` only if
      `pnpm install` shows matching install-corruption signals.
      reinstall/rerun evidence or N/A with reason.
- [x] Workspace authority recorded: all proof runs in `/Users/zbeyens/git/plate-2`.
      owns the changed behavior.
- [x] High-risk note: agent-action doctrine changes can misroute future
      refactors; exact source audits and generated-mirror proof are required.
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason.
- [x] Review target: agent-native reviewer for canonical doctrine diff;
      autoreview N/A if final patch remains trivial and agent-only.
      implementation work, or marked N/A with reason.
- [x] Agent-native review required and will be loaded before source edit.
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Output budget discipline recorded: exact files and capped output only.
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Agent-native pack: source-of-truth `.mdc` files were edited instead of
      generated skill mirrors.
- [x] Agent-native pack: deleted builders, receiver classification, and
      same-key routing are explicit in the creator skill.
- [x] Agent-native pack: `pnpm install` regenerated both named skill mirrors,
      and body comparisons are exact.
- [x] Agent-native pack: agent-native review accepted two findings: fingerprint
      the delegated creator owner and classify same-named non-plugin receivers.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the named focused proof | Version validation, 8/8 tests, exact mirrors, scoped Biome all pass |
| Bug reproduced before fix | yes | Prove creator changes were outside the doctrine fingerprint | Focused test failed 7/8 before helper repair, then passed 8/8 |
| Targeted behavior verification | yes | Run focused test/proof | `node --test .agents/rules/plate-next/scripts/version.test.mjs` -> 8/8 |
| TypeScript or typed config changed | no | N/A | No TypeScript/config surface changed |
| Package exports or file layout changed | no | N/A | No package files or barrels changed |
| Package manifests, lockfile, or install graph changed | no | N/A | `pnpm install` was required only for skill generation; lockfile stayed current |
| Agent rules or skills changed | yes | Regenerate and compare mirrors | `pnpm install`; both generated bodies exact |
| Workspace authority proof | yes | Run proof in owning checkout | All commands ran in `/Users/zbeyens/git/plate-2` |
| Browser surface changed | no | N/A | No browser surface |
| Browser final proof | no | N/A | No browser surface |
| CI-controlled template output changed | no | N/A | No `templates/**` output changed |
| Package behavior or public API changed | no | N/A | Agent doctrine only; no changeset |
| Registry-only component work changed | no | N/A | No registry component |
| Docs or content changed | no | N/A | No user docs/content |
| High-risk mini gate | yes | Prevent stale source ownership and regex damage | Creator source added to fingerprint; receiver classification protects Zustand stores |
| Agent-native review for agent/tooling changes | yes | Load reviewer and close findings | PASS after source-owner, discoverability, proof, and receiver audit |
| Local install corruption suspected | no | N/A | No corruption signal |
| Autoreview for non-trivial implementation changes | no | N/A | Micro agent-doctrine/helper patch; focused TDD and agent-native review are the owning gates |
| PR create or update | no | N/A | No PR requested |
| Task-style PR body verified | no | N/A | No PR |
| PR proof image hosting | no | N/A | No PR/browser image |
| Tracker sync-back | no | N/A | No tracker |
| Final handoff contract | yes | Fill exact outcome/proof/caveat | Filled below |
| Final lint | yes | Run root and scoped lint | Root lint blocked by unrelated editor-audit errors; scoped Biome clean on all supported changed files |
| Output budget discipline | yes | Keep reads/searches bounded | Exact files and capped outputs only |
| Timed checkpoint | no | N/A | No duration requested |
| Goal plan complete | yes | Run the goal-plan checker | `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-28-align-plugin-creator-builder-deletions.md` |
| Agent source / generated sync | yes | Regenerate and compare | `pnpm install`; both mirrors exact |
| Agent action discoverability | yes | Audit rule and generated paths | Rules appear in canonical creator source and generated skill |
| Agent-native review | yes | Close accepted findings | PASS; no open accepted finding |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read named skills, supporting rules, version helper/tests, reviewer | implementation |
| Implementation | complete | Repaired creator, v18 registry, fingerprint owner, and regression test | verification |
| Verification | complete | Version validate, 8/8 tests, exact mirrors, scoped Biome | closeout |
| PR / tracker sync | complete | N/A: none requested | final response |
| Closeout | complete | Plan updated with final evidence | final response |

Findings:
- Plate Next delegated authoring doctrine to `plate-plugin-creator` but its
  doctrine fingerprint did not include that canonical owner.
- A raw deleted-name scan finds `ImagePreviewStore.extendSelectors()`;
  receiver inspection proves it is a valid Zustand API, not plugin-builder
  drift.

Decisions and tradeoffs:
- Keep detailed optional-kit composition proof in `plate-next`/`best-api`; the
  creator owns the detection and routing rule.
- Include the creator source in the Plate Next fingerprint so future authoring
  doctrine edits force a version bump.
- Do not mass-attest packages at v18; the version law requires real sync proof.

Implementation notes:
- Added same-key optional-kit routing and explicit deleted plugin-builder
  spellings to the creator source.
- Added receiver classification to both skills.
- Bumped Plate Next to v18 and added migration checks.
- Upgraded doctrine fingerprint inputs and domain tag; added regression proof.

Review fixes:
- Accepted: delegated creator source was not fingerprinted -> added it.
- Accepted: deleted-name regex could target unrelated store APIs -> added
  receiver classification.
- Rejected: duplicate the full composition audit in creator -> ownership stays
  with `plate-next`/`best-api`.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Fingerprint regression test failed before helper repair | 1 | Add creator source to doctrine fingerprint inputs | Passed 8/8 after repair |
| Root `pnpm lint:fix` hit unrelated editor-audit diagnostics | 1 | Run scoped Biome on changed supported files | Scoped check passed, no fixes |
| Broad deleted-name scan found `ImageStore.extendSelectors` | 1 | Inspect receiver instead of deleting by text | Classified valid Zustand store API |

Verification evidence:
- `node --test .agents/rules/plate-next/scripts/version.test.mjs` -> 8/8.
- `node .agents/rules/plate-next/scripts/version.mjs validate` -> v18 valid,
  42 active and 1 retired.
- Generated-body comparison -> exact for both named skills.
- `pnpm exec biome check <changed JSON/MJS files>` -> 3 files clean.
- Focused source audit -> one same-name match, classified as Zustand rather
  than Plate plugin builder.
- Goal-plan checker -> complete.

Final handoff contract:
- PR line: N/A: no PR requested
- Issue / tracker line: N/A
- Confidence line: high; focused proof complete
- Flow table:
  - Reproduced: fingerprint test failed before owner repair; browser N/A
  - Verified: 8/8 tests and exact generated mirrors; browser N/A
- Browser check: N/A: agent doctrine only
- Outcome: both alignment gaps fixed and Plate Next v18 published locally
- Caveat: 42 active packages are intentionally stale until `plate-next sync`
- Design:
  - Chosen boundary: canonical creator/Plate Next rules plus version helper
  - Why not quick patch: mirror-only edits would be overwritten
  - Why not broader change: package attestation requires separate real proof
- Verified: version helper, registry, source rules, generated mirrors, and lint
- PR body verified: N/A

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
- Browser proof: N/A
- Caveats: root lint remains red in unrelated editor-audit files; scoped lint
  passes. All 42 active packages are v17 and correctly stale under v18.

Timeline:
- 2026-07-28T16:50:59.228Z Task goal plan created.
- 2026-07-28 Read full skills/rules, repaired canonical doctrine, and bumped v18.
- 2026-07-28 Added fingerprint regression test; observed 7/8 before fix and 8/8 after.
- 2026-07-28 Regenerated skills and completed focused validation.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Complete |
| Where am I going? | Final response |
| What is the goal? | Align creator and Plate Next doctrine durably |
| What have I learned? | Delegated doctrine must be fingerprinted; method names require receiver ownership |
| What have I done? | Repaired rules, v18 registry/helper/test, generated mirrors, and proof |

Open risks:
- Package attestations remain at v17 until a real `plate-next sync`; no package
  was falsely promoted.
