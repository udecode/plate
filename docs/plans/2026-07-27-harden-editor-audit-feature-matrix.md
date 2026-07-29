# harden editor audit feature matrix

Objective:
Harden editor-audit 1:1 feature proof; done when unique concept rows, exact
local mappings, superiority gates, generated sync, validator tests, and
agent-native review pass; plan
docs/plans/2026-07-27-harden-editor-audit-feature-matrix.md.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-27-harden-editor-audit-feature-matrix.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:

- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:

- type: user-requested recurring workflow repair
- id / link: `$editor-audit`
- title: Require literal feature-by-feature Wordgard/editor comparison
- acceptance criteria:
  - every atomic concept receives exactly one ungrouped decision row;
  - every row identifies the exact Plite and Plate equivalent, partial owner,
    absence, or non-applicability with source evidence;
  - comparison uses the same named qualitative dimensions for reference and
    local mechanisms without aggregate numeric scoring;
  - an overall-superiority claim is illegal unless the full matrix closes and
    every reference win, local win, equivalent, tradeoff, and unknown is
    enumerated;
  - `sync` cannot repeat a global claim from a legacy grouped audit until the
    strict matrix is backfilled;
  - mechanical validation rejects missing, duplicate, unknown, or grouped
    concept rows.

First checkpoint:

- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:

- requested duration: N/A: none requested
- semantics: N/A: no timebox
- initial confidence score: N/A: exact binary gates replace a confidence score
- improvement loop: source rule, deterministic validator, generated mirror,
  focused tests, agent-native review
- final score / loop closure: all binary gates pass

Completion threshold:

- `.agents/rules/editor-audit.mdc` makes one row per atomic concept, exact
  reference/Plite/Plate mapping, qualitative dimension parity, guarded
  superiority, and legacy-sync backfill mandatory.
- A source-owned comparison-matrix reference defines the precise row contract
  without bloating the main skill.
- A source-owned validator rejects grouped IDs, missing IDs, duplicate IDs,
  unknown IDs, malformed rows, and placeholders; its focused tests prove both
  acceptance and rejection paths.
- `pnpm install` synchronizes the generated `.agents/skills/editor-audit`
  instructions; source-owned references and scripts remain reachable at their
  exact `.agents/rules/editor-audit/**` paths.
- Agent-native review has zero accepted actionable findings.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-27-harden-editor-audit-feature-matrix.md` passes.

Verification surface:

- `node --test .agents/rules/editor-audit/scripts/validate-concept-matrix.test.mjs`
- validator smoke against compliant and intentionally broken fixtures in the
  test
- `pnpm install`
- exact source/generated body comparison for `editor-audit`, plus source
  reference/script existence checks
- source audit for one-row, mapping, dimension, superiority, sync, and
  validator clauses
- `git diff --check` on this task's files
- agent-native parity review

Constraints:

- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Keep numeric aggregate scores forbidden; improve literal coverage and
  comparability instead of rewarding feature count.
- Do not edit generated `.agents/skills/editor-audit/**` files directly.
- Keep the main skill below 500 lines through one directly named source
  reference.

Boundaries:

- Source of truth: `.agents/rules/editor-audit.mdc` plus its source-owned
  `references/` and `scripts/`; `.agents/skills/editor-audit/**` is generated.
- Allowed edit scope: editor-audit source bundle, generated editor-audit mirror,
  this goal plan, and install-controlled metadata only when `pnpm install`
  requires it.
- Browser surface: N/A: agent workflow and deterministic artifacts only.
- Browser strategy: N/A: no UI, route, or browser behavior changes.
- Tracker sync: N/A: no issue or PR requested.
- Non-goals: rerunning or rewriting the Wordgard audit, changing product code,
  changing `best-api` priority policy, creating a compatibility skill, or
  publishing Git state.

Output budget strategy:

- Read exact skill/rule/template files and bounded searches only. Exclude
  generated audit inventories and product source unless a named rule depends
  on them. Keep validation output to pass/fail summaries.

Blocked condition:

- Stop only if `pnpm install` cannot regenerate the skill mirror, the source
  bundle cannot expose scripts and references, or deterministic
  validation conflicts with an existing required audit format.

Task state:

- task_type: agent-native workflow repair
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active

Current verdict:

- verdict: add a strict per-concept matrix contract and deterministic validator;
  prose alone already failed once
- confidence: high; the miss is concrete and the source/generated boundary is
  explicit
- next owner: editor-audit source rule
- reason: the current rule says “every concept” but still permits grouped rows
  and unguarded global conclusions

Completion rule:

- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-27-harden-editor-audit-feature-matrix.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Acceptance criteria copied above before source edits |
| Timed checkpoint parsed | no | N/A: none requested |
| Skill analysis before edits | yes | `editor-audit`, `skill-creator`, and `autogoal` read completely |
| Active goal checked or created | yes | `get_goal` returned no active goal; creation follows this filled shell |
| Source of truth read before edits | yes | `.agents/rules/editor-audit.mdc` and generated mirror read completely |
| Tracker comments and attachments read | no | N/A: no tracker source |
| Video transcript evidence required | no | N/A: no video |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: workflow contract repair, no product implementation |
| TDD decision before behavior change or bug fix | yes | Deterministic validator will be test-first enough to prove the recurring failure |
| Branch decision for code-changing task | no | N/A: no Git publication requested |
| Release artifact decision | no | N/A: internal agent rule; no package release |
| Browser tool decision for browser surface | no | N/A: no browser surface |
| PR expectation decision | no | N/A: no PR requested |
| Tracker sync expectation decided | no | N/A: no tracker mutation |
| Output budget strategy recorded | yes | Exact bounded reads and pass/fail validation only |
| Agent-native pack selected | yes | `agent-native` materialized in this plan |
| Agent-facing action surface identified | yes | `$editor-audit` full audit and sync workflows |
| Source rule versus generated mirror boundary identified | yes | `.agents/rules/editor-audit*` source; `.agents/skills/editor-audit*` generated |
| `agent-native-reviewer` loaded or waiver recorded | yes | Skill read completely before edits |

Work Checklist:

- [x] N/A: no duration requested.
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
- [x] N/A: no video or screen recording.
- [x] Required video or screen-recording evidence is cached/read as normalized
      `<video-transcripts>` XML, or marked N/A with reason.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary: source rule, strict
      contract, and reusable validator own the recurring audit behavior.
- [x] Release artifact requirement recorded: N/A, internal agent rule only.
- [x] Final handoff shape decided: repaired owner, behavior contract,
      verification, and deliberate non-repairs.
- [x] Branch handling recorded: N/A, no Git publication requested.
- [x] Local-env-rot retry policy recorded: use `pnpm run reinstall` once only
      for matching dependency-resolution corruption.
- [x] Workspace authority recorded: all proof runs in
      `/Users/zbeyens/git/plate-2`.
- [x] High-risk note: grouped rows or unguarded superiority claims can mislead
      architecture decisions; deterministic completeness proof is required.
- [x] Generic autoreview N/A: agent-native reviewer is the owning focused lens
      for this workflow-only change.
- [x] Agent-native review required after generated sync.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Agent-native pack: source-of-truth rule files are edited instead of
      generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the
      skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**`
      changed.
- [x] Agent-native pack: accepted agent-native review findings are fixed or
      explicitly rejected with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Source rule, reference, validator, tests, generated sync, source audit, review, and checker pass | All named gates and the final checker passed |
| Bug reproduced before fix | yes | Existing Wordgard artifact proves 73 concepts collapsed into 37 grouped rows while still claiming exhaustive comparison | confirmed before edit |
| Targeted behavior verification | yes | Run validator positive and negative tests plus source audit | 5/5 Node tests pass; legacy Wordgard report is rejected |
| TypeScript or typed config changed | no | N/A: Markdown and Node validator only | N/A |
| Package exports or file layout changed | no | N/A: no package exports | N/A |
| Package manifests, lockfile, or install graph changed | yes | Run `pnpm install` only to regenerate skills; preserve unrelated install state | `pnpm install` passed; lockfile already current |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated editor-audit bundle | Generated body exactly matches source body |
| Workspace authority proof | yes | Run all commands in `/Users/zbeyens/git/plate-2` | Every recorded command used the owner checkout |
| Browser surface changed | no | N/A: no browser surface | N/A |
| Browser final proof | no | N/A: no browser surface | N/A |
| CI-controlled template output changed | no | N/A: no templates | N/A |
| Package behavior or public API changed | no | N/A: no package behavior or changeset | N/A |
| Registry-only component work changed | no | N/A: no registry component | N/A |
| Docs or content changed | no | N/A: agent workflow docs only, verified through source audit | N/A |
| High-risk mini gate | yes | Prove grouped/missing/duplicate rows fail and overall claims require complete matrix | Negative tests pass; winner/mapping contradiction also rejected |
| Agent-native review for agent/tooling changes | yes | Close all accepted findings from agent-native reviewer | Zero accepted findings remain after two fixes |
| Local install corruption suspected | no | N/A unless matching dependency-resolution corruption appears | N/A |
| Autoreview for non-trivial implementation changes | no | N/A: focused agent-native review owns this workflow-only diff | N/A |
| PR create or update | no | N/A: no PR requested | N/A |
| Task-style PR body verified | no | N/A: no PR | N/A |
| PR proof image hosting | no | N/A: no PR/browser proof | N/A |
| Tracker sync-back | no | N/A: no tracker | N/A |
| Final handoff contract | yes | Report repaired owner, exact behavior, proof, and non-repairs | Filled below |
| Final lint | yes | Run scoped syntax/format/whitespace checks | ESLint, Node syntax, Prettier, and diff checks pass |
| Output budget discipline | yes | Confirm bounded reads and outputs | Reads stayed on named skills, task files, and exact legacy artifact |
| Timed checkpoint | no | N/A: no duration requested | N/A |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-27-harden-editor-audit-feature-matrix.md` | Passed |
| Agent source / generated sync | yes | Run `pnpm install` and verify source/mirror parity | `pnpm install` passed; body diff is empty |
| Agent action discoverability | yes | Source-audit the generated skill for all new gates | Generated skill names strict 1:1, legacy, dominance, registry, and validator gates |
| Agent-native review | yes | Close accepted findings | Source, action, mirror, runtime, and proof map passes |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | named skills, source rule, generated skill, and legacy evidence read | implementation complete |
| Implementation | complete | strict contract, registry cursor, validator, and tests added | verification complete |
| Verification | complete | 5/5 tests, lint, syntax, format, generation, parity, and negative legacy proof | closeout complete |
| PR / tracker sync | complete | N/A: no PR or tracker mutation requested | final response |
| Closeout | complete | agent-native review closed; checker is final command | final response |

Findings:

- The current Wordgard manifest has 73 atomic concepts, but the prior report
  uses a grouped schema and therefore cannot prove one decision per concept.
- “Every concept” prose was insufficient: no machine gate tied manifest IDs to
  exact ledger rows.
- `local stronger` hid whether Plite, Plate, or their combined stack was the
  preferred implementation.
- Skiller regenerates `SKILL.md` but does not copy arbitrary nested rule
  resources; generated instructions must point at the real source-owned paths.

Decisions and tradeoffs:

- One manifest/matrix pair is required per reference repository. This keeps
  concept identity, commit provenance, and winner evidence independent.
- Six fixed qualitative dimensions replace aggregate numeric scoring. Numbers
  would manufacture precision and hide applicability differences.
- The final row names both a comparison class and preferred implementation.
  The validator rejects contradictions and winners whose layer is absent.
- A legacy grouped audit may refresh provenance/tests/issues, but cannot repeat
  a global superiority claim until its whole matrix is backfilled.

Implementation notes:

- `.agents/rules/editor-audit.mdc` owns workflow, registry, sync, claim, and
  closure gates.
- `.agents/rules/editor-audit/references/feature-matrix.md` owns the canonical
  15-column row contract and dominance rules.
- `.agents/rules/editor-audit/scripts/validate-concept-matrix.mjs` enforces
  exact headers, unique IDs, complete mappings/dimensions, coherent winners,
  verdicts, priorities, and complete classification ID summaries.
- `.agents/skills/editor-audit/SKILL.md` is regenerated only through
  `pnpm install`.

Review fixes:

- Fixed a multi-reference ownership flaw by storing manifest/matrix cursors on
  each registry reference instead of once at audit level.
- Fixed broken generated-resource assumptions by using the source-owned
  `.agents/rules/editor-audit/**` paths already used by repo skills.
- Added winner/mapping coherence checks and complete zero-inclusive
  classification/preference summaries.
- Agent-native capability map passes:
  `$editor-audit full|sync` -> generated skill -> source rule/reference/script
  -> strict CLI proof -> registry validation cursor.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Validator import missing during first TDD run | 1 | Implement the source-owned validator | Expected red became 5/5 green |
| One broad patch missed exact rule context | 1 | Apply bounded exact hunks | All intended rule edits landed |
| Generated resource `cmp` found no copied directory | 2 | Inspect repo generator patterns and use real rule paths | Generated skill contains no broken relative links |
| Stricter layer labels broke old `local stronger` fixtures | 1 | Update fixtures to name Plite explicitly | Tests pass |
| Generic `quick_validate.py` rejects repo-only frontmatter keys | 1 | Keep repo-valid metadata and use Skiller generation as authority | `pnpm install` passes; generated body parity passes |
| Default Prettier quote mode disagreed with Skiller frontmatter | 1 | Check the rule with repo-consistent `--single-quote true` | Scoped format check passes |

Verification evidence:

- `node --test .agents/rules/editor-audit/scripts/validate-concept-matrix.test.mjs`
  -> 5 passed, 0 failed.
- `pnpm exec eslint <validator> <validator-test>` -> pass.
- `node --check` on both scripts -> pass.
- `pnpm install` -> Skiller apply passed; workspace lockfile already current.
- Source/generated body `diff -u` -> empty; generated skill is 436 lines.
- Required source reference/script exist; generated skill has no broken
  `./references` or `./scripts` links.
- The old Wordgard report fails strict validation at the required 15-column
  header, so it is truthfully `legacy-incomplete`.
- `git diff --check` on task-owned tracked files -> pass.

Final handoff contract:

- PR line: N/A: no Git publication requested.
- Issue / tracker line: N/A: no tracker mutation requested.
- Confidence line: 98%; deterministic contract and failure proof pass.
- Flow table:
  - Reproduced: old grouped Wordgard report rejected; browser N/A.
  - Verified: validator tests 5/5; browser N/A.
- Browser check: N/A: no browser-facing surface.
- Outcome: every future full audit must map and score every exact reference
  concept against Plite and Plate and name the preferred implementation.
- Caveat: the existing Wordgard report is not backfilled by this task and is
  explicitly `legacy-incomplete`.
- Design:
  - Chosen boundary: source rule plus strict reference and deterministic
    validator.
  - Why not quick patch: prose-only completeness already allowed grouped rows.
  - Why not broader change: rerunning the Wordgard audit was outside this skill
    repair.
- Verified: tests, lint, syntax, formatting, generation, parity, legacy
  rejection, and agent-native review.
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

- PR: N/A: not requested.
- Issue / tracker: N/A: not requested.
- Browser proof: N/A: workflow-only task.
- Caveats: existing Wordgard matrix needs a separate full backfill before any
  renewed global superiority claim.

Timeline:

- 2026-07-27T15:20:57.234Z Task goal plan created.
- 2026-07-27 TDD red proved the validator did not exist.
- 2026-07-27 Source rule, strict matrix contract, validator, and five tests
  completed.
- 2026-07-27 Skiller regeneration and source/generated parity passed.
- 2026-07-27 Agent-native review closed two findings and left zero accepted
  actions.
- 2026-07-27 Autogoal completion checker passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | Enforce literal 1:1 feature proof in editor-audit |
| What have I learned? | Grouped ledgers and ambiguous local winners caused the overclaim |
| What have I done? | Added strict contract, validator, tests, generation proof, and review |

Open risks:

- The historical Wordgard audit remains noncompliant until separately
  backfilled. The repaired skill prevents it from being presented as a current
  full superiority proof.
