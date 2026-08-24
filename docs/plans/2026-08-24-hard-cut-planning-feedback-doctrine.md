# hard-cut planning feedback doctrine

Objective:
Repair API and architecture planning feedback to prefer the maximum justified
hard cut; finish when source rules, generated mirrors, and forward proof agree.

Goal plan:
docs/plans/2026-08-24-hard-cut-planning-feedback-doctrine.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: direct user request
- id / link: current Codex task; no external tracker
- title: Remove fear-driven compromise from API and architecture planning
- acceptance criteria: make the doctrine universal, repair relevant source-owned
  skills and `.agents/AGENTS.md`, regenerate mirrors, forward-test the route,
  freeze writes, and hand the stable checkpoint to the PR #5036 coordinator.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A; no duration requested
- semantics: N/A
- initial confidence score: N/A; binary source/proof gates are stronger
- improvement loop: edit source rules, regenerate, audit mirrors, forward-test
- final score / loop closure: pass; source ownership, generated parity,
  discoverability, forward behavior, and prose checks all agree

Completion threshold:
- `.agents/AGENTS.md` and the smallest relevant planning/feedback rule owners
  require the maximum materially justified subtraction before local compromise.
- The rule applies to every API and architecture surface, not only packages.
- `SelectionArea`, `blockSelection`, and `BlockSelectionPlugin` receive the
  blunt target decision requested, without changing product code in this task.
- `pnpm install`, source/mirror parity, agent-native review, and an unrelated
  forward test pass; the coordinator receives a frozen checkpoint; no commit or
  push is made.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-24-hard-cut-planning-feedback-doctrine.md` passes.

Verification surface:
- Source audit of `.agents/AGENTS.md` and changed `.agents/rules/**` owners.
- `pnpm install` to regenerate `.agents/skills/**` mirrors.
- Exact source/mirror text audit plus available agent-rule validation.
- `agent-native-reviewer` review and a realistic unrelated API/architecture
  prompt tested against the new decision gate without seeding its answer.
- `check-complete.mjs` after evidence is recorded.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `.agents/AGENTS.md` and `.agents/rules/**/*.md*`; generated
  `.agents/skills/**/SKILL.md` files are mirrors only.
- Allowed edit scope: this plan, `.agents/AGENTS.md`, and the minimum relevant
  API/architecture planning and feedback source rules; generated mirrors only
  through `pnpm install`.
- Browser surface: N/A; agent doctrine only.
- Browser strategy: N/A; no browser-rendered surface changes.
- Tracker sync: N/A; no issue or tracker owns this request. The only external
  handoff is a stable-checkpoint message to the CI coordinator.
- Non-goals: no Plate/Plite product implementation; no package, selection,
  runtime, docs-site, release, PR, commit, or push changes.

Prompt requirements:
- [x] Give harsh honest design feedback: delete the public/general
  `SelectionArea`; a real marquee gesture may survive only as a private DOM
  input adapter into the canonical editor selection.
- [x] Delete `BlockSelectionPlugin`; do not rename or move it.
- [x] Delete the public `blockSelection` namespace and reuse the generic
  `selection` read/update namespace.
- [x] Keep one editor selection authority: no `selectedKeys`, shadow selection
  store, command bridge, compatibility alias, shim, or dual portal.
- [x] Repair planning and feedback doctrine, not product code, in this task.
- [x] Apply the repair to all API and architecture decisions, not packages only.
- [x] Require the strongest durable hard-cut target before any local improvement.
- [x] Treat current APIs, namespaces, plugins, abstractions, owners, layers, and
  packages as evidence rather than protected boundaries.
- [x] Test delete, merge, inline, and reuse-existing-owner for every public noun,
  namespace, plugin, abstraction, and layer touched by the recommendation.
- [x] Retain a surface only for a hard correctness/security/serialized-data/
  native/runtime law, an explicit user constraint, or a proven independent
  current user job. Compatibility and implementation difficulty affect rollout
  order only.
- [x] In harsh honest feedback, lead with the maximum justified cut even when
  its blast radius is large.
- [x] Preserve only hard laws and explicit task boundaries.
- [x] Edit source-owned rules and `.agents/AGENTS.md`, regenerate mirrors, run
  narrow proof, freeze repository writes, notify the coordinator, and do not
  commit or push.

Output budget strategy:
- Use owner-scoped `rg`, bounded `sed` ranges, and capped command output. Do not
  scan generated mirrors until source edits select the exact owners.

Blocked condition:
- Stop only if source generation fails repeatedly, a changed source owner has no
  deterministic mirror/proof path, or coordinator messaging is unavailable;
  report the exact caveat without committing or pushing.

Task state:
- task_type: agent-doctrine API/architecture feedback repair
- task_complexity: non-trivial source-rule change
- current_phase: closeout
- current_phase_status: completed
- next_phase: coordinator checkpoint and goal completion
- goal_status: ready_for_completion

Current verdict:
- verdict: repair required
- confidence: high; the current rules value ideal APIs but lack a mandatory
  universal maximum-subtraction gate at every planning/feedback stop
- next owner: best-api with planning/audit worker adoption
- reason: package hard-cut doctrine existed, but public nouns, namespaces,
  plugins, abstractions, and layers could still escape the strongest cut test

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-24-hard-cut-planning-feedback-doctrine.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | `Prompt requirements` has every explicit constraint |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | read `autogoal`, `best-api`, `behavior-and-ownership`, `skill-creator`, and `agent-native-reviewer` |
| Active goal checked or created | yes | goal created for this exact plan |
| Source of truth read before edits | yes | `.agents/AGENTS.md` and scoped planning/feedback rule owners inspected |
| Tracker comments and attachments read | no | N/A: direct request, no tracker |
| Video transcript evidence required | no | N/A: no video |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: no product/code behavior change |
| TDD decision before behavior change or bug fix | no | N/A: doctrine-only change |
| Branch decision for code-changing task | no | N/A: no branch/commit/push authorized |
| Release artifact decision | no | N/A: agent rules only |
| Browser tool decision for browser surface | no | N/A: no browser surface |
| PR expectation decision | no | no PR; coordinator owns PR #5036 checkout commit/push |
| Tracker sync expectation decision | no | N/A: no tracker |
| Output budget strategy recorded | yes | bounded owner-scoped commands recorded above |
| Agent-native pack selected | yes | generated plan includes agent-native pack |
| Agent-facing action surface identified | yes | planning and harsh-feedback recommendation path |
| Source rule versus generated mirror boundary identified | yes | edit `.agents/rules/**`; regenerate `.agents/skills/**` |
| `agent-native-reviewer` loaded or waiver recorded | yes | skill read before edits; review required after generation |

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
- [x] Required video or screen-recording evidence is cached/read as normalized
      `<video-transcripts>` XML, or marked N/A with reason. N/A: no video.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason: `best-api` owns the universal API decision gate;
      planning/audit workers consume it.
- [x] Release artifact requirement recorded: N/A; agent rules have no changeset
      or registry changelog.
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
      N/A with reason. Risk: overcorrecting could delete a hard-law owner; the
      retention burden explicitly preserves hard laws and independent user jobs.
- [x] Review/P1 autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: `pnpm install` synced every changed rule into its generated mirror.
- [x] Agent-native pack: agent-native review passed with no P0-P2 findings.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run source parity, discoverability, forward behavior, and closure proof | All named commands passed in `/Users/zbeyens/git/plate-2` |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: this repairs decision doctrine, not a product bug |
| Targeted behavior verification | yes | Forward-test an unrelated architecture decision without seeding the answer | Bounded read-only `best-api` pass led with the largest justified deletion cone |
| TypeScript or typed config changed | no | Run relevant typecheck | N/A: Markdown rule sources and generated Markdown mirrors only |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no package file or export changed |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | `pnpm install` completed; scoped diff shows no manifest or lockfile change |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `pnpm install` completed; six skill bodies and one reference have exact source/mirror parity |
| Workspace authority proof | yes | Run proof in the owning repository | Every recorded command ran with cwd `/Users/zbeyens/git/plate-2` |
| Browser surface changed | no | Capture Browser or native-browser proof | N/A: no browser-rendered surface changed |
| Browser final proof | no | Attach browser proof or exact caveat | N/A: agent decision prose has no runnable browser path |
| CI-controlled template output changed | no | Restore generated template output or justify keeping it | N/A: no `templates/**` output changed |
| Package behavior or public API changed | no | Add a changeset or record why none applies | N/A: the product target is a decision only; no package API changed |
| Registry-only component work changed | no | Update the registry changelog or record N/A | N/A: no registry component changed |
| Docs or content changed | yes | Verify source-backed claims and formatting | Internal rule/plan prose was source-audited; scoped whitespace proof passed; no public docs route changed |
| High-risk mini gate | yes | Record failure mode, proof plan, and boundary | Failure mode is indiscriminate deletion; retention still requires hard law, explicit constraint, or proven independent job; `best-api` remains sole API target owner |
| Agent-native review for agent/tooling changes | yes | Load the reviewer and close findings | Reviewer loaded; capability map, source ownership, mirrors, discoverability, and forward route passed with no P0-P2 findings |
| Local install corruption suspected | no | Reinstall and rerun or record N/A | N/A: no corruption signal occurred |
| P1 autoreview for non-trivial implementation changes | no | Run P1 review or record N/A | N/A: no product implementation; agent-native review is the owning review gate for this rule-only patch |
| PR create or update | no | Run `check` and sync PR body | N/A: coordinator owns PR #5036; this task must not commit, push, or update the PR |
| Task-style PR body verified | no | Verify PR body | N/A: no PR body mutation authorized |
| PR proof image hosting | no | Host proof images or record N/A | N/A: no PR body or browser proof image |
| Tracker sync-back | no | Post tracker sync or record N/A | N/A: direct request with no issue or Linear item |
| Final handoff contract | yes | Record exact outcome and proof | Filled below; stable checkpoint goes to the authorized coordinator after the final read-only gate |
| Final lint | yes | Run scoped equivalent | `git diff --check` passed for every changed tracked rule/mirror file; plan whitespace check is included in final proof |
| Output budget discipline | yes | Record accidental output and recovery | First forward agent overran internally and was interrupted; the replacement was capped at eight read-only commands and completed |
| Timed checkpoint | no | Satisfy requested duration or record N/A | N/A: no duration requested |
| Goal plan complete | yes | Run the closure checker | `[autogoal] complete` for this plan |
| Agent source / generated sync | yes | Regenerate and compare mirrors | `pnpm install` plus exact `diff`/`cmp` parity passed |
| Agent action discoverability | yes | Audit the route an agent reads | `rg` found the gate in global AGENTS, Best API, both plans, Editor Audit, Architecture Cleanup, Major Task, and generated mirrors |
| Agent-native review | yes | Close accepted findings | PASS; no actionable P0-P2 finding remains |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | requirements, skills, source owners, and Vision doctrine audited | implementation |
| Implementation | completed | eight source owners changed; mirrors generated only by `pnpm install` | verification |
| Verification | completed | exact parity, discoverability, forward behavior, and scoped prose proof passed | closeout |
| PR / tracker sync | completed | N/A: no PR/tracker mutation; coordinator checkpoint is the authorized handoff | final response |
| Closeout | completed | final contract and stable owned-file list recorded | final response |

Findings:
- Proven defect: the rules preferred ideal durable APIs but did not force every
  planning or feedback stop to test whether the named public concept itself
  should die. That omission let local/plugin-shaped compromise survive.
- Product target: delete public `SelectionArea`, `BlockSelectionPlugin`, and the
  `blockSelection` namespace. If marquee mechanics remain necessary, keep a
  private pointer/geometry adapter that writes through the sole Plite
  `selection` authority.
- This is not a Vision gap. Root Vision already makes current machinery and
  compatibility subordinate to the ideal target; the missing piece was
  procedural enforcement across planning, audits, cleanup, and feedback.

Decisions and tradeoffs:
- `best-api` owns the universal maximum-value hard-cut gate. Plate Plan, Plite
  Plan, Editor Audit, Architecture Cleanup, and Major Task consume it instead of
  inventing competing API doctrine.
- The gate applies beyond packages to every public noun, namespace, plugin,
  abstraction, owner, and layer.
- Large blast radius and migration cost may order adoption but cannot weaken the
  chosen target.
- No product selection code was changed. Mixing doctrine repair with the
  selection migration would violate the coordinator's requested atomic freeze.

Implementation notes:
- Source owners changed: `.agents/AGENTS.md`, `best-api.mdc`, its
  `behavior-and-ownership.md` reference, `plate-plan.mdc`, `plite-plan.mdc`,
  `editor-audit.mdc`, `architecture-cleanup.mdc`, and `major-task.mdc`.
- Generated outputs changed through `pnpm install`: root `AGENTS.md`, six
  `.agents/skills/*/SKILL.md` mirrors, and the Best API reference mirror.
- The source rules require delete, merge, inline, existing-owner reuse, a
  named sole survivor, and retention evidence for every public concept left.

Review fixes:
- Agent-native capability map:
  - user action: request API/architecture planning or harsh feedback;
  - route: global AGENTS to Best API, Editor Audit, layer plans, cleanup, or
    Major Task;
  - source owner: `.agents/AGENTS.md` plus the scoped `.agents/rules/**` files;
  - mirror: root `AGENTS.md` and generated `.agents/skills/**` files;
  - proof: generation, exact parity, discoverability, and unrelated forward
    decision test.
- Review result: PASS. No P0-P2 gap, duplicate owner, manual-only path, stale
  generated mirror, or unproven action route remains.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Placed Codex approval flag after `exec` | 1 | Use the documented global flag position | Re-ran as `codex -a never exec` |
| First forward agent used default maximum reasoning and expanded far beyond the proof budget | 1 | Cap reasoning and commands | Interrupted it; a low-reasoning, eight-command read-only pass completed successfully |

Verification evidence:
- `pnpm install` completed successfully and regenerated Codex/Claude skill
  artifacts. No manifest or lockfile changed.
- Exact source/mirror parity passed for `best-api`, `plate-plan`, `plite-plan`,
  `editor-audit`, `architecture-cleanup`, `major-task`, and the Best API
  behavior reference.
- Scoped `rg` found the new hard-cut gate in the global source/generated AGENTS,
  every changed worker source, and every generated worker mirror.
- `git diff --check` passed across all changed tracked rule and mirror files.
- The plan has no unresolved markers or trailing whitespace, ends with a
  newline, and passes `check-complete.mjs`.
- The bounded unrelated `best-api` forward test opened with: “The maximum
  justified cut is to delete transport, menu, and chat-session ownership from
  AIChatPlugin; keep AIPlugin as the document-level AI owner and reduce
  AIChatPlugin to editor-side prompt context, streaming, preview, and review
  operations.” It then named deleted public machinery, retained only jobs tied
  to a hard schema/current behavior constraint, rejected aliases, and routed
  adoption to Plate Plan.
- The first unbounded forward attempt is not counted as proof. It was stopped
  after excessive exploration; its replacement supplied the passing evidence.

Final handoff contract:
- PR line: N/A; no commit, push, or PR mutation; coordinator owns PR #5036
- Issue / tracker line: N/A; direct request, no tracker
- Confidence line: high for doctrine repair; product migration remains unimplemented
- Flow table:
  - Reproduced: N/A; decision-doctrine gap proven by source audit, browser N/A
  - Verified: source/mirror parity, discoverability, unrelated forward behavior;
    browser N/A
- Browser check: N/A; no browser surface
- Outcome: planning and feedback must lead with the maximum justified hard cut;
  the selection target is one Plite selection authority
- Caveat: selection product code is deliberately untouched
- Design:
  - Chosen boundary: Best API owns target selection; planning/audit workers
    enforce it; generated skills mirror source
  - Why not quick patch: soft wording without a deletion-cone gate caused the
    original compromise
  - Why not broader change: Vision already owns the durable taste and does not
    need duplicate wording; product implementation is a separate accepted plan
- Verified: generation, parity, discoverability, forward behavior, and scoped prose checks
- PR body verified: N/A; no PR body change

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
- PR: PR #5036 coordinator receives the stable owned-file/proof checkpoint; no
  commit or push from this task
- Issue / tracker: N/A
- Browser proof: N/A
- Caveats: product selection deletion still requires an explicit
  implementation plan/execution pass

Timeline:
- 2026-08-24T12:50:50.605Z Task goal plan created.
- 2026-08-24 Source doctrine repaired across the global owner and six scoped
  planning/feedback workers.
- 2026-08-24 `pnpm install`, exact mirror parity, discoverability, forward
  behavior, and scoped prose checks passed.
- 2026-08-24 Autogoal closure checker passed; repository writes froze at this
  recorded checkpoint.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Stable closeout checkpoint |
| Where am I going? | Coordinator handoff, goal completion, final response |
| What is the goal? | Make every API/architecture plan or feedback pass lead with the maximum justified hard cut |
| What have I learned? | See Findings |
| What have I done? | Repaired source doctrine, regenerated mirrors, and proved the route |

Open risks:
- The doctrine is proven; the actual selection consolidation is not implemented
  in this task. Its next plan must delete the three public concepts without
  retaining aliases, shadow state, or a second selection authority.
