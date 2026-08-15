# prefer long-term api fixes

Objective:
Make `best-api` require the durable owner-level API/type fix instead of
accepting compiler staging as a final architecture; done when doctrine,
dependent owners, generated mirrors, and forward-test proof agree.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-15-prefer-long-term-api-fixes.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:

- docs (docs/plans/templates/packs/docs.md)
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:

- type: direct user correction
- id / link: current Codex task; no external tracker
- title: Prefer long-term API fixes over compiler staging
- acceptance criteria: `best-api` always names and prefers the ideal durable
  API/owner repair; TS7056 declaration stages are never accepted as a final
  best-API result; source and generated skill agree; affected doctrine and
  teaching owners contain no contradiction.

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
- initial confidence score: N/A
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:

- `.agents/rules/best-api.mdc` requires owner-level long-term repair as the
  target and forbids reporting a declaration-stage workaround as the best or
  complete API.
- The relevant Plate Vision and every intersecting worker rule are aligned;
  generated mirrors match after `pnpm install`.
- Exact source audits find zero stale teaching that calls the TS7056 staging
  exception an accepted final boundary.
- Agent-native review and an unseeded forward test produce zero accepted
  actionable findings.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-15-prefer-long-term-api-fixes.md` passes.

Verification surface:

- `pnpm install` for source-to-generated skill sync.
- Focused `rg` audits over `.agents/rules`, generated skill mirrors, and Plate
  Vision.
- `agent-native-reviewer` review and forward test on the Code Block TS7056 case.
- Focused formatting/lint proof for changed prose.

Constraints:

- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:

- Source of truth: `.agents/rules/best-api.mdc`, with durable doctrine in
  `docs/vision/plate.md` and only intersecting worker-rule corrections.
- Allowed edit scope: agent rules, relevant Vision prose, the existing Plate
  adoption checker and its focused test, generated skill mirrors through
  `pnpm install`, and this plan.
- Browser surface: N/A: agent doctrine only.
- Browser strategy: N/A. Use Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no external tracker.
- Non-goals: no package/runtime/source API changes; do not remove or refactor
  the current Code Block declaration stages in this task.

Output budget strategy:

- Read exact rule/Vision files in bounded chunks. Search marker and TS7056
  wording with filename/count-first `rg`; cap command output. Do not scan build
  output, generated package artifacts, or dependencies.

Blocked condition:

- Stop only if generated-skill sync or the required reviewer cannot run after
  focused repair and one environment recovery attempt, or if an intersecting
  rule forces a contradictory product decision outside this authorized scope.

Task state:

- task_type: agent-doctrine repair
- task_complexity: normal
- current_phase: closeout
- current_phase_status: completed
- next_phase: final response
- goal_status: complete

Current verdict:

- verdict: the existing TS7056 paragraph wrongly permits a workaround to become
  an accepted final boundary; retain temporary containment only while the
  owning long-term repair remains explicitly open.
- confidence: high from current source, Vision, checker, and CI-plan evidence
- next owner: best-api repair
- reason: this is reusable API taste and routing, not a Code Block-only patch.

Completion rule:

- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-15-prefer-long-term-api-fixes.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured before work | yes | `best-api` must prefer the long-term owner repair and prevent another declaration-stage workaround; product source is excluded. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Skill analysis before edits | yes | Loaded `best-api` and `autogoal`; durable doctrine required Plate Vision, worker-rule audit, sync, and forward proof. |
| Active goal checked or created | yes | `get_goal` returned none; goal `019ff6e8-42c2-7023-a6f8-9640f6e0efa1` created against this plan. |
| Source of truth read before edits | yes | Read `best-api`, root/common/Plate Vision, current marker source, checker, and intersecting worker rules. |
| Tracker comments and attachments read | no | N/A: direct local request with no tracker or attachment. |
| Video transcript evidence required | no | N/A: no video. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: doctrine and existing checker repair; no product behavior diagnosis. |
| TDD decision before behavior change or bug fix | yes | Extended the existing checker test; focused suite passes 61/61. |
| Branch decision for code-changing task | no | N/A: no branch operation requested. |
| Release artifact decision | no | N/A: no package or registry release surface changed. |
| Browser tool decision for browser surface | no | N/A: no browser surface. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker. |
| Output budget strategy recorded | yes | Exact files and bounded searches; one verbose forward-runner overflow is recorded below. |
| Docs pack selected | yes | Incidental spec/law doctrine update in `docs/vision/plate.md`. |
| `docs-creator` loaded | yes | Read the full generated skill before Vision edits. |
| Docs lane selected | yes | Spec/law doctrine, not public product docs. |
| Target docs and nearest sibling docs read | yes | Read root `VISION.md`, `docs/vision/common.md`, and `docs/vision/plate.md`. |
| Docs style doctrine read | yes | `docs-creator` current-state and ownership rules applied. |
| Documented source owner identified | yes | `best-api` owns API judgment; Plate Vision owns durable plugin doctrine. |
| Agent-native pack selected | yes | Rule source, generated mirrors, checker route, and forward action changed. |
| Agent-facing action surface identified | yes | `best-api review/repair`, package creator typing, and Plate Next audits. |
| Source rule versus generated mirror boundary identified | yes | Edited `.agents/rules/**`; regenerated `.agents/skills/**` only through `pnpm install`. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Full skill read; capability review recorded below. |

Work Checklist:

- [x] N/A: no duration was requested.
- [x] First checkpoint captured the long-term-fix requirement, skill-only scope,
      no product-source edits, verification, and final handoff.
- [x] Objective, threshold, proof, constraints, boundaries, and blocked condition
      are concrete.
- [x] Task is classified as a reusable agent-doctrine correction rooted in
      `best-api`, with Plate Vision and two worker skills as intersecting owners.
- [x] N/A: no video or screen recording.
- [x] Read repo instructions, source rules, generated skills, Vision, marker
      source, checker behavior, and CI-plan evidence.
- [x] Repaired the durable API judgment owner and mechanically prevented new
      checker-marker escapes; left the existing product workaround untouched.
- [x] N/A: no changeset or registry changelog for agent doctrine/tooling.
- [x] Final handoff reports changed owners, proof, full-check caveat, and the
      still-open Code Block debt.
- [x] N/A: no branch operation requested.
- [x] N/A: no environment-rot signal; install and focused tests passed normally.
- [x] All proof ran in `/Users/zbeyens/git/plate-2`.
- [x] High-risk note: accepting compiler staging as architecture would spread
      private compiler carriers. The durable rule keeps direct inference as the
      target and exact-allowlists only the six already-existing stages.
- [x] N/A: this narrow doctrine/checker repair used specialized agent-native
      review plus an independent forward test instead of general P2 autoreview.
- [x] Agent-native review found no accepted actionable gap after source/mirror,
      checker, and forward-test proof.
- [x] Searches were bounded. The Codex forward runner emitted verbose logs
      beyond the requested cap; its final response was recovered from
      `/tmp/plate-best-api-forward-test.txt`.
- [x] Docs lane, target Vision files, sibling doctrine, and owner are recorded.
- [x] Every named API/marker/compiler claim is source-backed; routes,
      components, demos, and previews are N/A.
- [x] Vision uses current-state law rather than migration prose.
- [x] N/A: no links, routes, anchors, or previews changed.
- [x] Edited source `.agents/rules/**`, not generated mirrors.
- [x] The `Long-Term Target Gate` and TS7056 rule make the changed action
      discoverable.
- [x] `pnpm install` regenerated mirrors; Plate Next v76 validation proves parity.
- [x] No agent-native review finding remained after exact-allowlist and blind
      forward-test proof.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Named verification threshold | yes | Prove doctrine, mirrors, stale-text audit, checker prevention, and forward behavior | All named rows pass below. |
| Bug reproduced before fix | no | N/A: reusable doctrine correction, not runtime bug | Old source explicitly accepted TS7056 staging; the corrected diff captures the contradiction. |
| Targeted behavior verification | yes | Reject arbitrary new markers while retaining six exact current stages | Focused checker suite passes 61/61. |
| TypeScript or typed config changed | no | N/A | No TypeScript or typed configuration changed. |
| Package exports or file layout changed | no | N/A | No exports or files moved; `pnpm brl` is not applicable. |
| Package manifests, lockfile, or install graph changed | no | N/A | `pnpm install` ran for skill generation; lockfile stayed current. |
| Agent rules or skills changed | yes | Regenerate and validate | `pnpm install` passed; Plate Next v76 validation passes. |
| Workspace authority proof | yes | Run in owning checkout | Every command ran in `/Users/zbeyens/git/plate-2`. |
| Browser surface changed | no | N/A | No browser surface. |
| Browser final proof | no | N/A | No visual or runtime UI claim. |
| CI-controlled template output changed | no | N/A | No `templates/**` edits. |
| Package behavior or public API changed | no | N/A | Doctrine/tooling only; no changeset. |
| Registry-only component work changed | no | N/A | No registry work. |
| Docs or content changed | yes | Verify source-backed Vision law | Root/common/Plate Vision and live marker/checker source audited; diff-check passes. |
| High-risk mini gate | yes | Prevent workaround normalization without breaking current WIP | Exact six-stage allowlist plus rejection test; durable owner remains Core. |
| Agent-native review for agent/tooling changes | yes | Close capability-map findings | PASS: source route, mirror sync, checker proof, and blind forward action all exist. |
| Local install corruption suspected | no | N/A | No corruption signal; reinstall not used. |
| P2 autoreview for non-trivial implementation changes | no | N/A | Specialized agent-native review and blind forward test cover this narrow doctrine/checker repair. |
| PR create or update | no | N/A | No PR requested. |
| Task-style PR body verified | no | N/A | No PR. |
| PR proof image hosting | no | N/A | No PR or browser image. |
| Tracker sync-back | no | N/A | No tracker. |
| Final handoff contract | yes | Record exact outcome and caveat | Completed below. |
| Final lint | yes | Run scoped formatter/lint and diff check | Biome checks three files with no fixes; `git diff --check` passes. |
| Output budget discipline | yes | Record overflow and recovery | Forward-runner overflow recorded; final artifact read narrowly from `/tmp`. |
| Timed checkpoint | no | N/A | No duration requested. |
| Goal plan complete | yes | Run the named checker | Passing result recorded after this plan update. |
| Docs source-backed claim audit | yes | Compare doctrine to current source/checker | Six live markers, exact allowlist, and rejecting fixture verified. |
| Docs links / routes / previews | no | N/A | No links, routes, or previews changed. |
| Docs MDX/content parser | no | N/A | No `content/**` MDX change. |
| Plugin page specifics | no | N/A | No plugin page. |
| Agent source / generated sync | yes | Regenerate from source | `pnpm install` and Plate Next v76 validation pass. |
| Agent action discoverability | yes | Audit generated skill | All affected generated teaching owners contain the new law. |
| Agent-native review | yes | Close accepted findings | Zero accepted actionable findings. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Intake and source read | completed | Rules, Vision, marker source, checker, and workers read | implementation |
| Implementation | completed | Doctrine, workers, v76 registry, checker, and test updated | verification |
| Verification | completed | 61/61, v76 validate, Biome, diff-check, stale audit, forward test | closeout |
| PR / tracker sync | completed | N/A: neither requested | final response |
| Closeout | completed | Plan and handoff filled | final response |

Findings:

- The former `best-api` TS7056 paragraph contradicted its ideal-target rule by
  allowing declaration staging to become accepted architecture.
- Plate Vision, package-creator typing guidance, and Plate Next repeated that
  exception, so repairing only `best-api` would have left conflicting agents.
- The adoption checker accepted the declaration-stage marker at any path and
  name. It now recognizes only the six existing Code Block declarators.
- Capability map:

  | Action | Route | Source owner | Proof |
  | --- | --- | --- | --- |
  | Review a blocked API | `best-api review` | `.agents/rules/best-api.mdc` | Generated mirror plus blind forward test |
  | Implement or audit plugin typing | `plate-plugin-creator` / `plate-next` | Package creator rules and Plate Next v76 | Generated mirrors plus version validation |
  | Reject a new declaration-stage escape | Plate adoption checker | `tooling/scripts/check-plate-schema-adoption.mjs` | Focused checker suite, 61/61 |

Decisions and tradeoffs:

- A direct inferred exported descriptor is the only accepted target. A compiler
  limit identifies an owner defect; it does not redefine the public API.
- No new marker, private carrier, staged alias, cast, widening, subset type, or
  generated facade may be introduced only to avoid that owner repair.
- The six current Code Block stages remain exact transitional debt because
  product source was explicitly outside this task. They block current-doctrine
  attestation until Core supports the direct declaration.
- An exact checker allowlist is smaller and safer than adding another public
  compiler API, helper layer, or generalized debt manifest.

Implementation notes:

- Added a long-term-target gate and replaced the TS7056 exception in
  `best-api`.
- Aligned Plate Vision, package-creator typing guidance, and Plate Next v76.
- Tightened the existing checker and added rejecting and retained-debt fixtures.
- Regenerated all skill mirrors from their source rules with `pnpm install`.

Review fixes:

- Agent-native capability review found no accepted actionable gap after the
  source, mirror, checker, and forward-action audit.
- The blind forward test rejected the proposed private typed intermediate and
  named Core declaration inference as the owner.
- An accidental broad Prettier rewrite in the typing resource was restored;
  only the intended doctrine paragraph remains changed.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Full adoption audit reported 23 unrelated live-tree failures | 1 | Use the focused checker suite and preserve the full-audit boundary | Focused changed behavior passes 61/61; unrelated failures are reported as a caveat. |
| Prettier could not infer `.mdc` and reformatted unrelated typing examples | 1 | Restore unrelated formatting and use scoped Biome plus diff-check | Restored; the final diff contains only the intended typing-law edit. |
| Forward-test runner streamed beyond the requested output cap | 1 | Read its bounded final-response artifact | `/tmp/plate-best-api-forward-test.txt` contains the complete passing verdict. |

Verification evidence:

- `pnpm install`: passed; generated skill mirrors synchronized.
- `bun test tooling/scripts/check-plate-schema-adoption.test.mjs`: 61 passed,
  0 failed.
- `node .agents/rules/plate-next/scripts/version.mjs validate`: Plate Next v76
  registry valid, 42 active and 1 retired.
- `pnpm exec biome check tooling/scripts/check-plate-schema-adoption.mjs tooling/scripts/check-plate-schema-adoption.test.mjs .agents/rules/plate-next/versions.json`:
  passed with no fixes.
- Scoped `git diff --check`: passed.
- Exact stale-wording search across source rules, generated mirrors, and Plate
  Vision: zero matches.
- Product marker audit: exactly six existing Code Block stages, all named in
  the checker allowlist.
- Blind read-only `best-api` forward test: rejected staging, retained the direct
  export as the ideal call, routed the defect to Core, and kept the architecture
  incomplete until the stages are deleted.

Final handoff contract:

- PR line: N/A: no PR requested.
- Issue / tracker line: N/A: direct local task with no tracker.
- Confidence line: high; all changed-surface gates pass.
- Flow table:
  - Reproduced: old doctrine and permissive marker behavior confirmed; browser
    N/A.
  - Verified: focused tests 61/61, mirror/version/lint/diff/search/forward gates
    pass; browser N/A.
- Browser check: N/A: agent doctrine and tooling only.
- Outcome: `best-api` and every intersecting owner require the durable
  owner-level fix; the checker rejects new declaration-stage workarounds.
- Caveat: six existing Code Block stages remain explicit debt; the full
  adoption audit also reports 23 unrelated live-tree failures.
- Design:
  - Chosen boundary: durable API law in `best-api` and Plate Vision, worker
    adoption in package creator and Plate Next, enforcement in the existing
    adoption checker.
  - Why not quick patch: blessing a typed intermediate would preserve the
    compiler workaround as architecture and teach agents to repeat it.
  - Why not broader change: repairing Core and deleting current Code Block
    stages changes product source and was explicitly excluded.
- Verified: source/mirror parity, zero stale exception prose, exact allowlist,
  focused tests, formatting, diff, version registry, and blind forward action.
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
- Issue / tracker: N/A: no external tracker.
- Browser proof: N/A: no browser surface.
- Caveats: six exact Code Block declaration stages remain transitional debt;
  the unrelated 23-row full adoption backlog was not modified.

Timeline:

- 2026-08-15T07:38:02.816Z Task goal plan created.
- 2026-08-15 Repaired source doctrine, aligned worker rules and Plate Vision,
  bumped Plate Next to v76, and tightened the adoption checker.
- 2026-08-15 Regenerated mirrors and passed focused tests, version validation,
  lint, diff, stale-text, marker, agent-native, and blind forward-test gates.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Complete. |
| Where am I going? | Final response. |
| What is the goal? | Prevent compiler staging from becoming accepted best API. |
| What have I learned? | The stale exception spanned doctrine, workers, Vision, and checker enforcement. |
| What have I done? | Repaired every owner, regenerated mirrors, and proved the new behavior. |

Open risks:

- Core still cannot emit the direct Code Block declarations without the six
  transitional stages. That separate owner repair remains required before the
  package can attest to the latest doctrine.
- The repository-wide adoption audit has 23 unrelated failures outside this
  task; they were neither caused nor hidden by this change.
