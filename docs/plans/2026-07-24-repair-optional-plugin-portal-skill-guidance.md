# repair optional plugin portal skill guidance

Objective:
Repair relevant skill guidance for generic registry plugin access; done when
source rules and generated skills agree with zero contradictions.

Goal plan:
docs/plans/2026-07-24-repair-optional-plugin-portal-skill-guidance.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: direct user correction
- id / link: N/A
- title: Repair relevant skills
- acceptance criteria:
  - audit every relevant repo-local skill source rule;
  - generic registry/package code uses descriptor portals, never app-specific
    editor types or assumed root plugin APIs;
  - optional descriptors use `editor.plugin(Plugin).installed` before portal
    access;
  - concrete inferred app editors retain `editor.api.<pluginName>`;
  - edit `.agents/rules/**`, not generated skill mirrors;
  - leave `plate-plan` unchanged per the earlier explicit scope boundary;
  - regenerate skills and prove zero contradictory guidance.

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
- Every relevant `.agents/rules/**` owner is classified as repair/keep/N/A.
- All repaired generated `.agents/skills/**/SKILL.md` mirrors contain the same
  concrete-editor, generic-portal, and optional-portal law.
- Scoped contradiction searches return zero stale recommendations.
- `pnpm install`, agent-native review, scoped formatting/diff checks, and this
  plan's completion checker pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-24-repair-optional-plugin-portal-skill-guidance.md` passes.

Verification surface:
- Scoped `rg` inventory and post-repair contradiction searches across
  `.agents/rules/**` and `.agents/skills/**`.
- `pnpm install` generated-skill synchronization.
- `agent-native-reviewer` against the exact rule changes.
- Scoped Biome/diff checks.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `.agents/rules/**`; generated `.agents/skills/**/SKILL.md`
  files are verification output. Plate UI's nested rule/reference copies are
  paired source/canonical assets because Skiller does not mirror nested rule
  attachments. Plate Plugin Creator's auxiliary files exist only as canonical
  skill assets.
- Allowed edit scope: the smallest relevant `.agents/rules/**` files,
  regenerated mirrors, and this goal plan.
- Browser surface: N/A; agent guidance only.
- Browser strategy: N/A.
- Tracker sync: N/A.
- Non-goals: no `plate-plan` edits, no new skill, no wrapper/machinery, no
  product-code or public-API changes, no PR/commit/push.

Output budget strategy:
- Search only `.agents/rules/**` and `.agents/skills/**` with bounded `rg`
  patterns; inspect exact matching ranges; exclude generated/build trees beyond
  the named skill mirrors; cap each command output.

Blocked condition:
- Stop only if source rules give genuinely conflicting product doctrine that
  cannot be reconciled without changing the user's `plate-plan` exclusion.

Task state:
- task_type: agent-guidance repair
- task_complexity: normal
- current_phase: closeout
- current_phase_status: completed
- next_phase: final response
- goal_status: complete

Current verdict:
- verdict: relevant API and worker skills agree on host-root versus generic
  portal access, including optional descriptor availability
- confidence: 0.99
- next owner: none
- reason: `best-api` owns the reusable law; worker skills state only the
  consequence for their surfaces.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-24-repair-optional-plugin-portal-skill-guidance.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Task source and boundaries copy the explicit current request plus the earlier `plate-plan` exclusion |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | `autogoal` and `best-api repair` ownership read; relevant owners will be selected from a bounded source-rule audit |
| Active goal checked or created | yes | `get_goal` returned null; goal created for this plan |
| Source of truth read before edits | yes | Repo instruction: `.agents/rules/*.mdc` is source; never hand-edit generated `SKILL.md` |
| Tracker comments and attachments read | no | N/A: direct local request |
| Video transcript evidence required | no | N/A: no video |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: agent-guidance repair, not product diagnosis |
| TDD decision before behavior change or bug fix | no | N/A: prose guidance only; sync and source audits are the proof |
| Branch decision for code-changing task | no | N/A: no branch/PR requested |
| Release artifact decision | no | N/A: agent rules are not package or registry release artifacts |
| Browser tool decision for browser surface | no | N/A: no browser-facing source changes |
| PR expectation decision | no | N/A: no PR requested |
| Tracker sync expectation decision | no | N/A: no tracker |
| Output budget strategy recorded | yes | Narrow/capped rule-and-skill `rg` plus exact range reads |
| Agent-native pack selected | yes | `agent-native` pack materialized in this plan |
| Agent-facing action surface identified | yes | Skill instructions choosing concrete root API versus generic/optional descriptor portals |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/**`; regenerate `.agents/skills/**` with `pnpm install` |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded completely and applied; capability map passed |

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
- [x] Nearby repo instructions and implementation patterns read before edits:
      repo source/generated boundary, `best-api repair`, and `autogoal`.
- [x] Implementation fixes the right ownership boundary: reusable doctrine in
      `best-api`, surface consequences in the four relevant worker skills.
- [x] Release artifact requirement recorded: N/A, agent-rule-only repair.
- [x] Final handoff shape decided: concise repaired-owner list, source/sync
      proof, agent-native review, and deliberate non-repairs.
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling: N/A, no branch/PR requested.
- [x] Local-env-rot retry policy: N/A unless `pnpm install` produces an
      installation-specific failure.
- [x] Workspace authority recorded: every proof command uses
      `/Users/zbeyens/git/plate-2`.
      owns the changed behavior.
- [x] High-risk note: agent guidance can spread the wrong API across registry
      code; prove source/generated agreement and zero contradictions.
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason.
- [x] Autoreview target frozen to the named skill files; unrelated shared
      checkout changes are excluded.
- [x] Agent-native review completed for the changed rule/skill routes.
- [x] Output budget discipline followed: searches were path-scoped and capped.
- [x] Agent-native pack: source `.agents/rules/**` owners were edited; generated
      `SKILL.md` files came from `pnpm install`.
- [x] Agent-native pack: `best-api`, `plate-ui`, `plate-plugin-creator`,
      `plate-next`, and `docs-creator` expose the changed decision.
- [x] Agent-native pack: generated main skills and copied auxiliary assets are
      synchronized.
- [x] Agent-native pack: no accepted agent-native finding remains.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named sync and audits | `pnpm install`, five main mirror comparisons, four auxiliary copy comparisons, contradiction audit, and diff check pass |
| Bug reproduced before fix | no | Record N/A | N/A: agent guidance correction; stale Plate UI auxiliary files were demonstrated by `diff -u` |
| Targeted behavior verification | yes | Audit exact guidance | Five relevant owners contain the concrete-host, generic-portal, and optional-availability law |
| TypeScript or typed config changed | no | Record N/A | N/A: prose-only skill repair |
| Package exports or file layout changed | no | Record N/A | N/A: no package files or exports changed |
| Package manifests, lockfile, or install graph changed | no | Record N/A | N/A: no manifest/lock change; `pnpm install` ran only for required skill generation |
| Agent rules or skills changed | yes | Regenerate and compare | `pnpm install` passed; main and auxiliary copies match |
| Workspace authority proof | yes | Verify in owning repo | Every command ran in `/Users/zbeyens/git/plate-2` |
| Browser surface changed | no | Record N/A | N/A: no app/browser source change |
| Browser final proof | no | Record N/A | N/A: no browser surface |
| CI-controlled template output changed | no | Record N/A | N/A: no template output |
| Package behavior or public API changed | no | Record N/A | N/A: guidance only; no changeset |
| Registry-only component work changed | no | Record N/A | N/A: no registry component edit |
| Docs or content changed | no | Record N/A | N/A: goal plan only; no user docs/content |
| High-risk mini gate | yes | Record failure mode and proof | Wrong guidance could spread host coupling; descriptor portal law is centralized and source/mirror audited |
| Agent-native review for agent/tooling changes | yes | Review capability path | PASS: route, source owner, mirrors, proof, and discoverability are present |
| Local install corruption suspected | no | Record N/A | N/A: install completed normally |
| Autoreview for non-trivial implementation changes | yes | Run scoped local review | Three scoped passes fixed plan state, stale bundle-plugin doctrine, and the old Code Syntax descriptor name; false Plate Plan attribution was rejected |
| PR create or update | no | Record N/A | N/A: user did not request PR work |
| Task-style PR body verified | no | Record N/A | N/A: no PR |
| PR proof image hosting | no | Record N/A | N/A: no PR/browser image |
| Tracker sync-back | no | Record N/A | N/A: no tracker |
| Final handoff contract | yes | Fill exact outcome and proof | Filled below |
| Final lint | yes | Run scoped equivalent | Biome ignores agent Markdown; scoped `git diff --check` passes |
| Output budget discipline | yes | Verify bounded output | All searches and diffs were path-scoped and capped |
| Timed checkpoint | no | Record N/A | N/A: no duration requested |
| Goal plan complete | yes | Run completion checker | Final checker command recorded below |
| Agent source / generated sync | yes | Run sync and comparisons | Three `pnpm install` syncs pass; exact comparisons pass |
| Agent action discoverability | yes | Audit routes | All five relevant skill entrypoints expose the law |
| Agent-native review | yes | Close findings | PASS; no actionable finding remains |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | relevant owner inventory and source reads | implementation |
| Implementation | completed | five skill owners and supporting assets repaired | verification |
| Verification | completed | sync, comparisons, searches, reviews, diff check | closeout |
| PR / tracker sync | N/A | no PR or tracker requested | closeout |
| Closeout | completed | final handoff and plan prepared | final response |

Findings:
- `best-api` is the reusable doctrine owner.
- `plate-ui`, `plate-plugin-creator`, `plate-next`, and `docs-creator` teach
  surface-specific consequences and needed repair.
- `architecture-cleanup`, `task`, `react`, `components`,
  `registry-changelog`, and `plite-plan` do not choose this API and stay
  unchanged.
- Copied registry UI is generic even when hosted by a fully inferred app editor.
- Skiller regenerates main `SKILL.md` files and copies canonical skill assets,
  but does not mirror nested `.agents/rules/plate-ui/**` attachments.

Decisions and tradeoffs:
- Keep root `editor.api.<pluginName>` for host-owned code with a complete
  inferred kit.
- Require descriptor portals for copied registry UI and reusable generic
  components.
- Require `.installed` only when descriptor absence is legitimate; required
  descriptors access the portal directly.
- Pair the two Plate UI nested source/canonical assets; do not add generator
  machinery for two files.
- Leave `plate-plan` unchanged exactly as requested.

Implementation notes:
- Repaired source rules: `best-api`, `plate-ui`, `plate-plugin-creator`,
  `plate-next`, and `docs-creator`.
- Repaired Plate UI and Plate Plugin Creator supporting rule/reference files.
- Removed stale Plate Plugin Creator bundle-plugin/descriptor-`plugins`
  guidance; optional capabilities stay in app/registry arrays.
- Regenerated main skills and copied canonical assets with `pnpm install`.

Review fixes:
- Agent-native review: PASS; action route, owner, mirrors, proof, and
  discoverability are complete.
- Autoreview P2 rejected: current exact diff for both Plate Plan files is empty;
  the finding came from unrelated/shared bundle context.
- Autoreview P3 accepted: this plan was closed and populated with final proof.
- Autoreview P1 accepted: stale descriptor-`plugins` and package bundle-plugin
  guidance was replaced with consumer-owned app/registry arrays.
- Final skills-only review P2 accepted: `CodeSyntaxPlugin` example renamed to
  the current source export, `CodeHighlightPlugin`.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Backticks in double-quoted `rg` pattern executed by zsh | 1 | Use single-quoted patterns | Resolved |
| Unmatched `skiller*` zsh glob | 1 | Use explicit paths and `rg --files` | Resolved |
| Zsh did not split space-delimited source/mirror pairs | 1 | Use a pipe-delimited heredoc | Resolved |
| Biome processed zero agent Markdown files | 1 | Use scoped `git diff --check` | Resolved; repo config ignores these files |
| Autoreview attributed a Plate Plan edit to this task | 1 | Verify exact current paths | Rejected; exact `git diff` is empty |

Verification evidence:
- `pnpm install` passed after final source changes and Skiller completed.
- Five source/main-skill body comparisons passed.
- Plate UI source/canonical and canonical/Claude auxiliary comparisons passed.
- Plate Plugin Creator canonical/Claude auxiliary comparisons passed.
- Scoped stale-guidance audit found no positive recommendation to use host root
  APIs or structural/error probing in generic optional integrations.
- `bun x skiller@latest check` exited 0; unrelated upstream skill updates were
  reported but not applied.
- Scoped `git diff --check` passed.
- Agent-native capability map passed.
- Three scoped autoreview passes found and closed plan state, stale
  bundle-plugin doctrine, and one stale descriptor name. The Plate Plan finding
  was disproved by exact current diff. The final rename is source-verified;
  the two-cycle governor rejects another 600k-character review bundle for it.
- `node .agents/skills/autogoal/scripts/check-complete.mjs
  docs/plans/2026-07-24-repair-optional-plugin-portal-skill-guidance.md` passed.

Final handoff contract:
- PR line: N/A, not requested
- Issue / tracker line: N/A, direct local task
- Confidence line: 99%
- Flow table:
  - Reproduced: stale Plate UI auxiliary guidance confirmed by exact diff
  - Verified: source/mirror comparisons, contradiction audit, and reviews pass
- Browser check: N/A, agent guidance only
- Outcome: relevant skills consistently separate host root APIs from generic
  descriptor portals and optional availability checks
- Caveat: nested Plate UI source/canonical assets require paired edits because
  Skiller does not mirror them
- Design:
  - Chosen boundary: reusable law in `best-api`, local consequences in workers
  - Why not quick patch: only fixing Plate UI would leave plugin/docs agents
    able to recreate the coupling
  - Why not broader change: unrelated skills do not select this API; Plate Plan
    was explicitly excluded
- Verified: sync, comparisons, source audits, agent-native review, autoreview
- PR body verified: N/A, no PR

Final handoff / sync:
- PR: N/A
- Issue / tracker: N/A
- Browser proof: N/A
- Caveats: nested Plate UI attachments need paired source/canonical edits

Timeline:
- 2026-07-24T09:38:27.705Z Task goal plan created.
- 2026-07-24T09:45Z Relevant source rules and supporting assets repaired.
- 2026-07-24T09:46Z `pnpm install` synchronized main skills and agent copies.
- 2026-07-24T09:47Z Agent-native review passed.
- 2026-07-24T09:49Z Autoreview plan-state finding fixed; false Plate Plan
  attribution rejected with exact-path proof.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | Keep registry UI generic while preserving root API discovery for inferred host editors |
| What have I learned? | Five skill owners needed alignment; Plate Plan did not |
| What have I done? | Repaired, synchronized, audited, and reviewed the relevant guidance |

Open risks:
- None in the current guidance. The only maintenance caveat is the explicitly
  recorded paired-copy requirement for nested Plate UI assets.
