# version plate-next package sync

Objective:
Version Plate Next doctrine and add an honest all-package sync protocol; done
when manifest, drift detection, generated skill, tests, review, and plan checker
pass.

Goal plan:
docs/plans/2026-07-24-version-plate-next-package-sync.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: direct user request
- id / link: current Codex task
- title: Version Plate Next patterns and synchronize tracked packages
- acceptance criteria:
  - Every reusable Plate Next pattern repair/update increments a doctrine
    version.
  - A machine-readable ledger records the applied version for every package
    already reviewed by Plate Next.
  - `plate-next sync` discovers and upgrades every stale tracked package to the
    latest doctrine with normal package proof.
  - Generated `.agents/skills/plate-next/SKILL.md` is regenerated from
    `.agents/rules/plate-next.mdc`; it is never edited directly.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: none
- semantics: N/A
- initial confidence score: 90
- improvement loop: source audit -> design -> implementation -> focused proof
  -> agent-native review -> autoreview -> closure
- final score / loop closure: 96; final autoreview clean and all named gates
  closed.

Completion threshold:
- Current doctrine has one monotonic version source, an immutable version
  history, honest v0 entries for all 41 active packages, and a retained retired
  entry for hard-deleted `caption`.
- A deterministic read-only command validates the ledger, fingerprints package
  source, and reports current/stale/drifted packages.
- `plate-next sync` has explicit queue, proof, attestation, failure, and
  doctrine-bump semantics; future package plans cannot close without recording
  the applied version.
- Script tests, source/generated sync, agent-native review, local autoreview,
  lint, and this plan checker pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-24-version-plate-next-package-sync.md` passes.

Verification surface:
- Node unit tests for ledger validation, enrollment parity, version staleness,
  fingerprint drift, and package filtering.
- Live `validate`, `status`, and `fingerprint` commands against the checked-in
  ledger of 41 active and one retired package.
- `pnpm install` regeneration plus source audit of the generated Plate Next
  skill and package plan template.
- Agent-native review, local autoreview, scoped lint, and final plan checker.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Use monotonic integer doctrine versions; never reconstruct fake historical
  version precision.
- Do not attest any pre-versioned package to the latest doctrine without a new
  full package proof.
- A later package source edit invalidates its attestation through a fingerprint
  mismatch even when its recorded doctrine version is current.

Boundaries:
- Source of truth: `.agents/rules/plate-next.mdc`, the Plate Next ledger/helper
  under `.agents/rules/plate-next/`, and
  `docs/plans/templates/plate-next.md`.
- Allowed edit scope: those source files, their generated Plate Next skill
  mirror, deterministic tests, and this goal plan.
- Browser surface: none; this changes an agent workflow and local CLI contract.
- Browser strategy: N/A. Use Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A; no external issue or PR.
- Non-goals: synchronizing package implementation in this turn, changing
  package runtime/public APIs, reconstructing unverifiable pre-version history,
  or committing/pushing.

Output budget strategy:
- Read exact rule/template/script files in bounded slices; use filename/count
  searches before line dumps; cap command output; exclude generated/build trees.

Blocked condition:
- The generated skill cannot be regenerated from the source rule, or the repo
  exposes no deterministic package source boundary from which to compute a
  stable fingerprint after three distinct repair attempts.

Task state:
- task_type: agent workflow and deterministic tooling
- task_complexity: medium
- current_phase: verification
- current_phase_status: complete
- next_phase: final response
- goal_status: complete

Current verdict:
- verdict: implement
- confidence: 96
- next owner: user may invoke `plate-next sync`
- reason: version/fingerprint attestation is the smallest honest owner for
  repeatable package synchronization.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-24-version-plate-next-package-sync.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | acceptance criteria above |
| Timed checkpoint parsed | no | no duration requested |
| Skill analysis before edits | yes | plate-next, autogoal, and skill-creator loaded |
| Active goal checked or created | yes | goal created for this plan |
| Source of truth read before edits | yes | loaded Plate Next skill; verified generated body equals source `.mdc`; audited `reviewedPackageSlugs` |
| Tracker comments and attachments read | no | direct local request |
| Video transcript evidence required | no | no video |
| `docs/solutions` checked for non-trivial existing-code work | no | agent workflow, no runtime bug |
| TDD decision before behavior change or bug fix | yes | deterministic CLI gets node:test coverage |
| Branch decision for code-changing task | no | no branch/commit requested |
| Release artifact decision | no | no package runtime/release change |
| Browser tool decision for browser surface | no | no browser surface |
| PR expectation decision | no | no PR requested |
| Tracker sync expectation decision | no | no tracker |
| Output budget strategy recorded | yes | bounded strategy above |
| Agent-native pack selected | yes | generated plan includes agent-native pack |
| Agent-facing action surface identified | yes | `plate-next sync` |
| Source rule versus generated mirror boundary identified | yes | edit `.mdc`; regenerate `SKILL.md` |
| `agent-native-reviewer` loaded or waiver recorded | yes | loaded full skill; parity review recorded below |

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
- [x] Nearby repo instructions and implementation patterns read before edits:
      repo AGENTS, Plate Next source/generated parity, plan template, Core
      reviewed-package enrollment, and existing rule script layout.
- [x] Implementation fixes the right ownership boundary: source `.mdc`,
      version registry/helper, Plate Next plan template, and generated mirror.
- [x] Release artifact requirement N/A: agent workflow only.
- [x] Final handoff shape: concise files, version model, commands, and caveats;
      PR/tracker sync N/A.
- [x] Branch handling N/A: no branch/commit requested.
- [x] Local-env-rot retry policy N/A: no install/runtime corruption signal.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note: stale ledger or false attestation could skip required
      package rewrites; validate schema, source fingerprint, and closure rules.
- [x] Review target: local Plate Next rule, ledger/helper/tests, generated skill,
      and Plate Next plan template.
- [x] Agent-native review required for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Agent-native pack: source `.agents/rules/plate-next.mdc` was edited, not
      the generated skill.
- [x] Agent-native pack: `plate-next sync [package]` and every proof command are
      discoverable from the generated skill.
- [x] Agent-native pack: `pnpm install` regenerated the Plate Next skill and
      exact-body parity is proven.
- [x] Agent-native pack: all agent-native and autoreview findings were accepted,
      fixed, reproved, and the final autoreview was clean.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | 8/8 tests; registry valid; status counts exact; scoped Biome clean; final autoreview clean |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: feature/workflow implementation; discovered gate bugs were reproduced by validation/review and regression-tested |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | Node tests, live CLI validate/status/fingerprint/check semantics |
| TypeScript or typed config changed | no | Run relevant typecheck | N/A: JavaScript/JSON/Markdown agent workflow only |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no package exports |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: lockfile unchanged; `pnpm install` still ran for skill generation |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `pnpm install` passed; validator proves exact shared frontmatter/body plus generated name/metadata |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | all commands ran in `/Users/zbeyens/git/plate-2` |
| Browser surface changed | no | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | N/A: no app/browser surface |
| Browser final proof | no | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | N/A: agent workflow only |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: `docs/plans/templates/plate-next.md` is source, not `templates/**` CI output |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: no package runtime/public API |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A |
| Docs or content changed | no | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | N/A: plan/workflow source only |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | false-current attestation, stale mirror, malformed ledger, and retired lifecycle tested/reviewed at registry owner |
| Agent-native review for agent/tooling changes | yes | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | capability map passes; all accepted gaps fixed |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no corruption signal |
| Autoreview for non-trivial implementation changes | yes | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | final local scoped autoreview clean; no accepted/actionable findings |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: no PR requested |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A: no PR |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR/browser proof |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | filled below |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | scoped Biome clean on all executable/data changes |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | bounded exact files/slices; autoreview bundles handled by helper |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-24-version-plate-next-package-sync.md` | final checker pass |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | `pnpm install` passed; exact parity validator passed |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | `argument-hint`, invocation examples, Sync Mode, commands, and final handoff visible in generated skill |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | loaded; capability map pass; accepted fixes closed |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | prompt contract, source/mirror audit, 42-row enrollment audit | implementation |
| Implementation | complete | v1 registry/helper/tests/sync doctrine/template; caption retirement repair | verification |
| Verification | complete | 8/8 tests, registry valid, exact generated parity, expected check failure, scoped Biome | closeout |
| PR / tracker sync | complete | N/A: no PR/tracker requested | closeout |
| Closeout | complete | final autoreview clean; final checker pass | final response |

Findings:
- Honest bootstrap is v0 for every pre-versioned package. Assigning the current
  doctrine retroactively would claim proof that never ran.
- Doctrine version alone is insufficient: package edits after attestation must
  produce a drifted state through a deterministic source fingerprint.
- `tooling/scripts/check-core.mjs` currently enrolls 42 packages as completed
  Plate Next reviews, but `caption` was hard-deleted. Active enrollment must
  contain 41 packages, the retired ledger must preserve `caption`, and
  validation must reject future lifecycle drift.
- Agent-native capability map:
  - invoke sync -> `plate-next sync [package]` -> source `.mdc` -> generated
    skill -> `status`/`check` proof: pass;
  - update doctrine -> source `.mdc` + plan template -> immutable version entry
    + doctrine fingerprint -> `validate` + `pnpm install`: pass;
  - attest package -> package review/sync -> registry entry -> package
    fingerprint + `status <package>`: pass;
  - retire package -> Core enrollment + retired registry entry ->
    `validate`/retired status: pass.

Decisions and tradeoffs:
- Use monotonic integers, not semver: every package-facing doctrine change is a
  required full sync checkpoint, so major/minor/patch distinctions add fiction.
- Keep the helper read-only. Agents patch the source ledger only after package
  proof, preserving normal `apply_patch` reviewability.

Implementation notes:
- The initial v1 baseline deliberately leaves every active pre-versioned package
  at v0. `plate-next sync` is the authority that advances them after proof.

Review fixes:
- [P1 accepted] A manual version number alone could not enforce bumping after a
  doctrine edit. Added a fingerprint over the source rule and Plate Next plan
  template; `validate` fails until a new version records the new fingerprint.
- [P1 accepted] Generated skill could remain stale while source validation
  passed. Added source/generated body parity to `validate`.
- [P1 accepted] Deleted `caption` remained in the active Core package gate.
  Removed the dead enrollment and retained its v0/retirement evidence in
  `retiredPackages`, excluded from sync.
- [P2 accepted] Malformed `versions` could throw while collecting validation
  errors. Guarded latest-history access and added a no-throw regression.
- [P2 accepted] Generated parity ignored source frontmatter. It now compares
  every source-owned frontmatter group plus the complete body.
- [P2 accepted] Generated-only `name` and `metadata.skiller.source` could drift.
  They are now exact validated fields; unexpected generated fields fail.
- Final scoped autoreview: clean, no accepted/actionable findings.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Initial live registry validation failed because deleted `caption` remained active | 1 | model active/retired lifecycle instead of weakening validation | resolved |
| First scoped Biome run found six local regex literals | 1 | promote reusable patterns to module constants | resolved; scoped Biome clean |

Verification evidence:
- `/Users/zbeyens/git/plate-2`: Node tests pass 8/8.
- `/Users/zbeyens/git/plate-2`: registry valid at v1 with 41 active and one
  retired package.
- `/Users/zbeyens/git/plate-2`: live status reports 41 stale v0 packages, zero
  falsely current packages, and one retired package.
- `/Users/zbeyens/git/plate-2`: `pnpm install` regenerated the Plate Next skill;
  source/generated shared frontmatter/body and generated ownership metadata
  match exactly.
- `/Users/zbeyens/git/plate-2`: scoped Biome passes four changed executable/data
  files.
- `/Users/zbeyens/git/plate-2`: status summary is v1, 41 stale, zero current,
  zero drifted, one retired; `check all` correctly exits 1 until sync advances
  the active packages.
- `/Users/zbeyens/git/plate-2`: final scoped autoreview is clean with no
  accepted/actionable findings.
- `/Users/zbeyens/git/plate-2`: final autogoal plan checker passes.

Final handoff contract:
- PR line: N/A; no PR requested.
- Issue / tracker line: N/A; direct local task.
- Confidence line: 96%.
- Flow table:
  - Reproduced: old unversioned state and stale Caption enrollment source-audited; browser N/A.
  - Verified: 8/8 tests, live CLI, exact generated parity, lint, clean autoreview; browser N/A.
- Browser check: N/A; no browser surface.
- Outcome: Plate Next v1 has enforceable doctrine/package versioning and
  `sync [package]` execution semantics.
- Caveat: 41 active packages intentionally remain v0 until sync runs; none were
  falsely attested by this infrastructure task.
- Design:
  - Chosen boundary: source rule + plan template doctrine fingerprint,
    machine-readable registry, and read-only validation/fingerprint helper.
  - Why not quick patch: prose-only versions cannot detect stale doctrine,
    source drift, generated mirrors, or deleted packages.
  - Why not broader change: package migrations belong to a later explicit
    `plate-next sync` run.
- Verified: commands and review evidence above.
- PR body verified: N/A; no PR.

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
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: N/A.
- Caveats: 41 active packages are queued at v0; Caption is historical/retired.

Timeline:
- 2026-07-24T22:24:37.699Z Task goal plan created.
- 2026-07-25 Captured all prompt requirements; loaded plate-next, autogoal, and
  skill-creator; selected v0 bootstrap plus source-fingerprint drift detection.
- 2026-07-25 Source audit found 42 completed package reviews in
  `reviewedPackageSlugs`; expanded bootstrap and parity validation accordingly.
- 2026-07-25 Live validation caught deleted `caption` still in the active Core
  gate. Removed the dead gate entry and retained it as a retired package with
  hard-cut plan evidence.
- 2026-07-25 Implemented doctrine/package fingerprints, lifecycle-aware status,
  sync semantics, package-plan gates, eight unit tests, and generated-skill
  parity validation.
- 2026-07-25 Closed three autoreview iterations: malformed history, shared
  frontmatter parity, and generated ownership metadata; final review clean.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Complete |
| Where am I going? | Final response; later `plate-next sync` on user request |
| What is the goal? | Version Plate Next and make package sync auditable |
| What have I learned? | 41 active packages need honest v0; retired caption must remain historical, not syncable |
| What have I done? | Implemented v1 registry/sync contract, proved it, and closed review |

Open risks:
- No infrastructure risk open. Expected work remains: 41 active packages are v0
  and require explicit `plate-next sync`; release/prose-only files are excluded
  from package fingerprints by design.
