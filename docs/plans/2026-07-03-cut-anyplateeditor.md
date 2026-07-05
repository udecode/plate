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
- acceptance criteria: zero `AnyPlateEditor` / `PlateEditor<any, any>` references in Core source/type-tests; relevant Core typecheck and lint pass.

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
- [x] `rg -n "AnyPlateEditor|PlateEditor<any, any>" packages/core/src packages/core/type-tests --glob '!**/dist/**'` returns no matches.
- [x] Core package typecheck passes.
- [x] Core package lint passes.
- [x] Related same-class `<any, any>` Plate editor aliases are either removed or explicitly outside this packet with evidence.
- [x] `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-03-cut-anyplateeditor.md` passes.

Verification surface:
- Source audit over `packages/core/src` and `packages/core/type-tests`.
- Core typecheck.
- Core lint.
- Focused related React/store tests.
- Focused related audit for `PlateEditor<any`.

Constraints:
- Do not introduce a replacement catch-all alias.
- Preserve Plate editor generic inference.
- Prefer `PlateEditor` with defaults, `infer`, or a locally constrained editor type over explicit `any, any`.
- Do not stage, commit, push, or create a PR.

Boundaries:
- Source of truth: `packages/core/src/react/editor/PlateEditor.ts` and all current `AnyPlateEditor` call sites.
- Allowed edit scope: Core source/type definitions needed to remove the alias.
- Browser surface: N/A, type-only API cleanup.
- Browser strategy: N/A.
- Tracker sync: N/A.
- Non-goals: broad Core drift sweep, public docs rewrite, package migration outside direct alias callers.

Output budget strategy:
- Used exact `rg` searches and targeted file reads only. No broad build logs streamed.

Blocked condition:
- None. Removing the alias exposed a store/root existential boundary, but it was resolved without restoring the alias.

Task state:
- task_type: Core type cleanup
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: ready-to-complete

Current verdict:
- verdict: hard-cut complete
- confidence: high
- next owner: plate-next
- reason: `AnyPlateEditor = PlateEditor<any, any>` hid generic type loss; direct call sites now use `PlateEditor`, `infer`, or the store boundary type.

Completion rule:
- `update_goal(status: complete)` is legal after this plan passes `check-complete.mjs`.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | First checkpoint rows capture the exact hard-cut request. |
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
- [x] Remove `AnyPlateEditor` export.
- [x] Replace usages with `PlateEditor`, `infer`, or `PlateStoreEditor`.
- [x] Run related audit for `AnyPlateEditor|PlateEditor<any, any>`.
- [x] Run focused same-class `PlateEditor<any` audit in Core editor/react scope.
- [x] Run Core typecheck.
- [x] Run Core lint.
- [x] Record final verification evidence.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run alias source audit | `rg -n "AnyPlateEditor|PlateEditor<any, any>" packages/core/src packages/core/type-tests --glob '!**/dist/**'` returned no matches. |
| Bug reproduced before fix | no | N/A | Type cleanup, not bug repro. |
| Targeted behavior verification | no | N/A | Type-only cleanup. |
| TypeScript or typed config changed | yes | Run Core typecheck | `pnpm --filter @platejs/core typecheck` passed. |
| Package exports or file layout changed | no | N/A | No export barrel/file layout change. |
| Package manifests, lockfile, or install graph changed | no | N/A | No package manifest change. |
| Agent rules or skills changed | no | N/A | No agent rule change. |
| Workspace authority proof | yes | Run proof in `/Users/zbeyens/git/plate-2` | Typecheck, lint, audits, and focused tests ran in repo root. |
| Browser surface changed | no | N/A | No browser surface. |
| Browser final proof | no | N/A | No browser surface. |
| CI-controlled template output changed | no | N/A | No template output touched. |
| Package behavior or public API changed | no | N/A | Internal alias hard-cut in migration branch; no changeset. |
| Registry-only component work changed | no | N/A | No registry work. |
| Docs or content changed | no | N/A | No docs/content. |
| High-risk mini gate | yes | Record failure mode and chosen boundary | Failure mode: alias hides generic loss; boundary: use direct `PlateEditor` where specific and `PlateStoreEditor` only for the store existential. |
| Agent-native review for agent/tooling changes | no | N/A | No agent/tooling changes. |
| Local install corruption suspected | no | N/A | No env-rot signal. |
| Autoreview for non-trivial implementation changes | no | N/A | Narrow type alias hard-cut; source audit, typecheck, lint, and focused tests are the owning proof. |
| PR create or update | no | N/A | User did not ask for PR. |
| Task-style PR body verified | no | N/A | No PR. |
| PR proof image hosting | no | N/A | No PR/browser image. |
| Tracker sync-back | no | N/A | No tracker. |
| Final handoff contract | yes | Report changed files and proof | Final response will list the alias cut and proof commands. |
| Final lint | yes | Run Core lint | `pnpm --filter @platejs/core lint` passed. |
| Output budget discipline | yes | Use exact searches | Exact searches only; one malformed broad audit produced noisy output and was superseded by exact audits. |
| Timed checkpoint | no | N/A | No duration requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-03-cut-anyplateeditor.md` | Pass recorded below. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | `rg` found alias owner and call sites. | implementation |
| Implementation | complete | Alias export removed; call sites migrated. | verification |
| Verification | complete | Source audits, typecheck, lint, and focused tests passed. | closeout |
| PR / tracker sync | N/A | No PR/tracker requested. | final response |
| Closeout | complete | Plan updated with final evidence. | final response |

Findings:
- `AnyPlateEditor` was a pure alias for `PlateEditor<any, any>`.
- Direct `PlateEditor<any, any>` disappeared with the alias.
- `PlateStoreEditor = PlateEditor<any, AnyPluginConfig>` remains as the explicit store/root existential boundary. That is not the deleted alias and avoids `any, any`; it is the honest TypeScript representation for a store that can hold any inferred Plate editor value/plugin set.

Decisions and tradeoffs:
- Decision: hard-cut alias, do not create `PlateAnyEditor`, `UnknownPlateEditor`, or similar replacement.
- Decision: keep `PlateStoreEditor` as the store existential owner instead of forcing every React store/component generic to default to a narrow `PlateEditor`.
- Decision: replace inference-helper `PlateEditor<any, infer P>` / `PlateEditor<infer V, any>` with `infer` on both generic slots.
- Risk: `PlateStoreEditor` still exposes one explicit `any` for the value slot because TypeScript lacks an existential generic for "some PlateEditor<V, P>". Keeping it visible is cleaner than hiding it behind `AnyPlateEditor`.

Implementation notes:
- Removed `AnyPlateEditor` export from `PlateEditor.ts`.
- Replaced React/editor call sites with `PlateEditor`.
- Repaired store/root defaults after the alias removal exposed a narrow default constraint.
- Repaired malformed mechanical signatures in render/handler helpers.

Review fixes:
- Lint formatting fixed in `createPlateStore.ts` and `useEditorSelector.ts`.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Mechanical replacement malformed helper signatures | 1 | Patch exact helper signatures | Resolved; typecheck reached semantic failures. |
| Store/root structural type too weak | 1 | Restore Plate-specific store existential owner without alias | Resolved; typecheck passed. |

Verification evidence:
- `rg -n "AnyPlateEditor|PlateEditor<any, any>" packages/core/src packages/core/type-tests --glob '!**/dist/**'` -> no matches.
- `rg -n "PlateEditor<any" packages/core/src packages/core/type-tests --glob '!**/dist/**'` -> one match: `PlateStoreEditor = PlateEditor<any, AnyPluginConfig>`, accepted as store existential boundary.
- `pnpm --filter @platejs/core typecheck` -> pass.
- `pnpm --filter @platejs/core exec bun test src/react/stores/plate/createPlateStore.spec.tsx src/react/components/PlateContent.spec.tsx src/react/hooks/useSlateProps.spec.tsx src/react/plugins/navigation-feedback/NavigationFeedbackPlugin.spec.tsx` -> 12 pass.
- `pnpm --filter @platejs/core lint` -> pass.

Final handoff contract:
- Changed files: Core React editor/store/plugin/render/helper typing files plus this goal plan.
- Proof: alias audit, related audit, Core typecheck, focused tests, Core lint.
- Residual risk: one explicit store existential remains by design.

Reboot status:
| Where am I? | Where am I going? | What is the goal? | What learned? | What done? |
|-------------|-------------------|-------------------|---------------|------------|
| Closeout | Final response | Zero `AnyPlateEditor` / `PlateEditor<any, any>` refs | Store/root needs an explicit existential owner | Alias removed and proof passed |

Open risks:
- None for the requested alias cut.
