# Editor selection presence hook

Use this file only when the task benefits from durable state. Task owns the
lifecycle under `.agents/rules/task/references/workflow.md`; apply the user's
standing Autogoal request for long-running work unless they opt out. Publication
retains its separate authority. Add only relevant domain
packs. A template is not a list of actions every task must perform.

Objective:
Expose useEditorHasSelection(id?) from platejs/react, migrate the two direct boolean consumers, and prove presence-only rendering and existing provider semantics.

Goal plan:
docs/plans/2026-09-08-editor-selection-presence-hook.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- none

Task source:
- User: "go" after approving the proposed hook and identifying comment-toolbar-button and font-color-toolbar-button as its two direct consumers.

Completion threshold:
- Public hook returns whether the primary-root text range exists, including a caret. Both consumers use it. Presence transitions rerender, same-presence selection/document changes do not. Scope and provider replacement work. Types, docs, generated registry and doctrine adoption pass.

Verification surface:
- Existing createPlateStore.spec.tsx and useEditorSelector.spec.tsx; source-first platejs types; www source types; docs/API and registry generators. Actual discussion and font-color demos plus narrow view verify the two controls.

Constraints:
- Local next checkout only. No publication or other-project sync. Keep existing Range/null meaning, nearest or explicit editor scope, missing-provider behavior and boolean equality. No new store, scheduler or selection state.

Boundaries:
- createPlateStore.ts and curated React export; two copied toolbars; current API docs; smallest affected source teaching and doctrine version. Unrelated cmdk work is complete review-only and outside this change.

Timing:
- N/A: no requested time or token budget.

Blocked condition:
- Only unavailable required proof or unresolved semantics could prevent completion; continue independent work and record exact limits.

Task state:
- current_phase: complete
- next: none
- status: complete

Work Checklist:
- [x] Every applicable user, method, reference and template obligation maps to a source-linked row here or an existing linked ledger; exclusions have reasons.
- [x] Final reconciliation against the original checklists found no omitted requirement; evidence and applicable semantic/completion checks cover the full scope.
- [x] Capture the full outcome, acceptance criteria, scope and actual authority.
- [x] Inspect the named source, current owners and relevant evidence.
- [x] Make the change at its durable owner and adopt every affected consumer.
- [x] Run applicable proof and resolve verified in-scope findings.
- [x] Record the final outcome, evidence, material limits and next action.

- [x] Best API doctrine repair: preserve the semantic subscription boundary in source teaching; regenerate mirrors and append the required Plate Next version without rewriting historical attestations.
- [x] Verify Plate/Testing: use existing package runners and actual registered consumers; no full browser matrix is required for this wrapper-only projection.
- [x] Technical Writing/Task docs: update exact current API claims and verify docs generation.
- [x] Scale applicability: the hook uses the same existing boolean selector/subscription with O(1) work and no added runtime owner. Deterministic render-count proof verifies the performance contract; no latency improvement or new architecture is claimed.
- [x] Task review: no Autoreview on next; no workflow control or helper changes requiring independent workflow review.

Decisions and tradeoffs:

| Decision | Owner and source | Chosen fix | Material alternative rejected | Proof |
| --- | --- | --- | --- | --- |
| Presence subscription | Best API, Plate UI, createPlateStore | Boolean projection on the existing runtime hook, same optional id as useEditorSelection | Full-range subscription rerenders for every caret move; generic selectors leak repeated invalidation details; no new owner or selector overload | Focused transition, render-count and scope tests |

Completion Gates:

| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Public API and consumers | yes | Focused hook tests, package/app types and actual controls | 6 passing tests; 79 package type tasks; complete www typecheck; browser receipt below |
| Teaching and distribution | yes | Docs, brl, registry, changeset, doctrine and mirrors | brl, install/mirrors, API generator and registry build pass; doctrine v168 valid, history and attestations preserved |

Select proof from the actual change. Verify Plate owns package, browser,
native-device, CLI and artifact claims; Testing owns test value. Generated
skills use the source generator. Public API adoption, registry/changelog,
security and release mechanics stay with their domain owners. Link their
existing receipts here instead of copying their full checklists.

Task's shared review budget applies only to an explicit review request or
actual PR closeout and never runs Autoreview on `next`. A budget cap does not
end useful authorized repairs. Record an actual review or its N/A reason.
For authorized PRs use the real repository template and Task's PR-body contract.
For authorized tracker messages read back the result. Neither follows merely
from creating this file.

Verification evidence:

- [Focused hooks](artifacts/editor-selection-presence-hook/hooks.log): 6 tests, 30 assertions, no failures. Presence transitions rerender; caret movement, expanded ranges and unrelated document edits preserve the render count. Nested scope and provider replacement pass.
- [Package types](artifacts/editor-selection-presence-hook/package-types.log): `pnpm turbo typecheck --filter=./packages/platejs`, 79/79 tasks pass.
- [Website types](artifacts/editor-selection-presence-hook/www-types.log): complete `pnpm --filter www typecheck` passes editor generation, API freshness, docs parity, registry source checks, route generation and both source/integration TypeScript graphs.
- [Scoped lint](artifacts/editor-selection-presence-hook/lint.log), [barrels](artifacts/editor-selection-presence-hook/barrels.log), [API generation](artifacts/editor-selection-presence-hook/api-reference.log), [registry generation](artifacts/editor-selection-presence-hook/registry.log), [source/mirror installation](artifacts/editor-selection-presence-hook/install-mirrors.log), and [doctrine validation](artifacts/editor-selection-presence-hook/doctrine.log) pass. Registry output contains the new hook in both copied consumers; 366 canonical payloads and 15 sparse overlays materialized.
- [Source receipt](artifacts/editor-selection-presence-hook/source-receipt.json) binds the code, docs, generated consumers, serving checkout and immutable doctrine comparison. Versions through 167 and all active/retired package attestations remain identical.
- [Interactive browser receipt](artifacts/editor-selection-presence-hook/browser.md): text and background color application, initial disabled Comment, caret enablement, fixed/floating comment drafts, desktop and 390px viewport, plus English and Chinese API bodies.
- `.changeset/editor-selection-presence.md` records the public Plate React export. No registry release note is needed because copied controls retain the same behavior. Primitive variants are unchanged, so this hook-only adoption does not require rebuilding installed Base/Radix templates.
- Final source-linked reconciliation: `.agents/rules/task/references/workflow.md`, `best-api.mdc`, `plate-ui.mdc`, `plate-plugin-creator.mdc`, `verify-plate.mdc`, and Task's docs reference are satisfied by the rows above. No plugin definition, inference API, runtime owner, package path or generated application contract was introduced. Existing scope/missing-provider behavior is inherited from `useEditor`.

Findings and remaining work:

- Both direct boolean consumers use the exported hook. No in-scope issue remains. The narrow color palette screenshot clips its right edge; this task does not change popup layout or certify complete responsive layout. Color application itself passes at 390px.

Final handoff:

- Outcome and owning fix: `useEditorHasSelection(id?)` is exported from `platejs/react`, implemented at the existing Plate React store owner and adopted by comment/font-color toolbars.
- Proof and limits: focused hooks, source/integration types, generators, doctrine and actual consumer replay pass. No latency, release-artifact or raw-device claim is made.
- Local / integrated / published state: local only.
- Next action or completion: complete; no publication requested.

Timeline:

- 2026-09-08T18:15:35.731Z Plan created.

Open risks:

- No unresolved risk in the hook contract. Responsive color-popup layout is outside this projection change.
