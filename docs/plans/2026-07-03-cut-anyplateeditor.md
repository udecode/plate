# cut AnyPlateEditor

Objective:
Cut `AnyPlateEditor`; done when no `AnyPlateEditor` or `PlateEditor<any, any>` references remain and Core proof passes.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-03-cut-anyplateeditor.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- none

Task source:
- type: user prompt
- id / link: N/A: direct local cleanup request
- title: Cut `AnyPlateEditor` alias and usage
- acceptance criteria: zero `AnyPlateEditor` / `PlateEditor<any, any>` references in Core source/type-tests; relevant Core typecheck passes.

First checkpoint:
- [x] Requirement captured: hard-cut `export type AnyPlateEditor = PlateEditor<any, any>`.
- [x] Requirement captured: cut all usage, not rename the alias.
- [x] Scope captured: Core Plate editor/react typing cleanup.
- [x] Success captured: source audit has zero alias references and focused proof passes.

Timed checkpoint:
- requested duration: N/A
- semantics: N/A
- initial confidence score: N/A
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- `rg -n "AnyPlateEditor|PlateEditor<any, any>" packages/core/src packages/core/type-tests --glob '!**/dist/**'` returns no matches.
- Core package typecheck passes.
- Related same-class `<any, any>` Plate editor aliases are either removed or explicitly outside scope with evidence.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-03-cut-anyplateeditor.md` passes.

Verification surface:
- Source audit over `packages/core/src` and `packages/core/type-tests`.
- Core typecheck.
- Focused related audit for `BaseEditor<any, any>` / `<any, any>` in Core.

Constraints:
- Do not introduce a replacement catch-all alias.
- Preserve Plate editor generic inference.
- Prefer `PlateEditor` with its defaults or a locally constrained editor type over explicit `any, any`.
- Do not stage, commit, push, or create a PR.

Boundaries:
- Source of truth: `packages/core/src/react/editor/PlateEditor.ts` and all current `AnyPlateEditor` call sites.
- Allowed edit scope: Core source/type definitions needed to remove the alias.
- Browser surface: N/A, type-only API cleanup.
- Browser strategy: N/A.
- Tracker sync: N/A.
- Non-goals: broad Core drift sweep, public docs rewrite, package migration outside direct alias callers.

Output budget strategy:
- Use exact `rg` searches and targeted file reads only. No broad build logs unless a focused proof fails.

Blocked condition:
- Stop only if removing the alias exposes a deeper public generic design fork that cannot be fixed without changing accepted Plate editor API shape.

Task state:
- task_type: Core type cleanup
- task_complexity: normal
- current_phase: implementation
- current_phase_status: in_progress
- next_phase: verification
- goal_status: active

Current verdict:
- verdict: hard-cut
- confidence: high
- next owner: plate-next
- reason: `AnyPlateEditor = PlateEditor<any, any>` hides generic type loss and violates the current Plate/Plite inference rule.

Completion rule:
- Do not call `update_goal(status: complete)` until the alias audit, typecheck, final plan evidence, and `check-complete.mjs` pass.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | First checkpoint rows above capture the exact hard-cut request. |
| Timed checkpoint parsed | no | No duration requested. |
| Skill analysis before edits | yes | `plate-next` and `autogoal` read. |
| Active goal checked or created | yes | Goal created for this alias cut. |
| Source of truth read before edits | yes | `rg` found alias owner and call sites before edits. |
| Tracker comments and attachments read | no | No tracker target. |
| Video transcript evidence required | no | No video target. |
| `docs/solutions` checked for non-trivial existing-code work | no | Direct local type cleanup; no existing solution owner required. |
| TDD decision before behavior change or bug fix | no | Type-only hard cut, no behavior change. |
| Branch decision for code-changing task | no | User did not ask for branch/PR; no git state inspection. |
| Release artifact decision | yes | No changeset: internal Core type cleanup in unreleased migration branch. |
| Browser tool decision for browser surface | yes | N/A: no browser surface. |
| PR expectation decision | yes | N/A: user did not ask for PR. |
| Tracker sync expectation decision | yes | N/A: no tracker. |
| Output budget strategy recorded | yes | Exact searches and focused proof only. |

Work Checklist:
- [x] First checkpoint complete.
- [x] Alias owner and all direct call sites found.
- [ ] Remove `AnyPlateEditor` export.
- [ ] Replace usages with `PlateEditor` defaults or narrowly inferred generic constraints.
- [ ] Run related audit for `AnyPlateEditor|PlateEditor<any, any>`.
- [ ] Run focused same-class `<any, any>` audit in Core editor/react scope.
- [ ] Run Core typecheck.
- [ ] Record final verification evidence.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run alias source audit | Pending implementation. |
| Bug reproduced before fix | no | N/A | Type cleanup, not bug repro. |
| Targeted behavior verification | no | N/A | Type-only cleanup. |
| TypeScript or typed config changed | yes | Run Core typecheck | Pending implementation. |
| Package exports or file layout changed | no | N/A | No export barrel/file layout change expected. |
| Package manifests, lockfile, or install graph changed | no | N/A | No package manifest change. |
| Agent rules or skills changed | no | N/A | No agent rule change. |
| Workspace authority proof | yes | Run proof in `/Users/zbeyens/git/plate-2` | Pending implementation. |
| Browser surface changed | no | N/A | No browser surface. |
| Browser final proof | no | N/A | No browser surface. |
| CI-controlled template output changed | no | N/A | No template output touched. |
| Package behavior or public API changed | no | N/A | Internal alias hard-cut in migration branch; no changeset. |
| Registry-only component work changed | no | N/A | No registry work. |
| Docs or content changed | no | N/A | No docs/content. |
| High-risk mini gate | yes | Record failure mode and chosen boundary | Failure mode: alias hides generic loss; boundary: use `PlateEditor` defaults instead of catch-all alias. |
| Agent-native review for agent/tooling changes | no | N/A | No agent/tooling changes. |
| Local install corruption suspected | no | N/A | No env-rot signal. |
| Autoreview for non-trivial implementation changes | no | N/A | Narrow type alias hard-cut; source audit and typecheck are the owning proof. |
| PR create or update | no | N/A | User did not ask for PR. |
| Task-style PR body verified | no | N/A | No PR. |
| PR proof image hosting | no | N/A | No PR/browser image. |
| Tracker sync-back | no | N/A | No tracker. |
| Final handoff contract | yes | Report changed files and proof | Pending final response. |
| Final lint | no | N/A | Type-only edits; typecheck/audit are sufficient unless formatter changes fail. |
| Output budget discipline | yes | Use exact searches | Exact searches only so far. |
| Timed checkpoint | no | N/A | No duration requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-03-cut-anyplateeditor.md` | Pending implementation. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | `rg` found alias owner and call sites. | implementation |
| Implementation | in_progress | Alias removal pending. | verification |
| Verification | waiting | Awaiting source audit and Core typecheck. | closeout |
| PR / tracker sync | N/A | No PR/tracker requested. | final response |
| Closeout | waiting | Awaiting completion gates. | final response |

Findings:
- `AnyPlateEditor` is a pure alias for `PlateEditor<any, any>`.
- Call sites are React/editor helper surfaces that can use `PlateEditor` defaults instead of preserving the catch-all alias.

Decisions and tradeoffs:
- Decision: hard-cut alias, do not create `PlateAnyEditor`, `UnknownPlateEditor`, or similar replacement.
- Reason: a replacement alias keeps the same type loss under a prettier name.
- Risk: some call sites may expose weak generic constraints; fix those owners if typecheck fails.

Implementation notes:
- Pending.

Review fixes:
- None.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None | 0 | N/A | N/A |

Verification evidence:
- Pending.

Final handoff contract:
- Changed files: pending.
- Proof: pending.
- Residual risk: pending.

Reboot status:
| Where am I? | Where am I going? | What is the goal? | What learned? | What done? |
|-------------|-------------------|-------------------|---------------|------------|
| Starting implementation | Remove alias and usages | Zero `AnyPlateEditor` references | Alias is direct `PlateEditor<any, any>` type loss | Plan and goal created |

Open risks:
- None yet.
