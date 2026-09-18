# AI table widths after accept

Use this file only when the task benefits from durable state. Task owns the
lifecycle under `.agents/rules/task/references/workflow.md`; apply the user's
standing Autogoal request for long-running work unless they opt out. Publication
retains its separate authority. Add only relevant domain
packs. A template is not a list of actions every task must perform.

Objective:
Repair the AI Markdown-sample accept flow so generated tables retain usable
column widths after acceptance, with the table kit supplying its documented
missing-width policy and the reported browser interaction passing on final
source.

Goal plan:
docs/plans/2026-09-17-ai-table-widths-after-accept.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- none

Task source:
- User report and screenshot from 2026-09-17: after accepting the AI-generated
  Markdown sample, the two-column table collapses to narrow word-wrapped cells.
- Expected: the accepted table uses the same usable editor-width layout as its
  preview and ordinary inserted tables.

Completion threshold:
- Exact AI command and Accept interaction reproduces red before the fix and
  passes on final local source.
- The existing focused browser regression rejects the width-losing accepted
  table state after the real AI command and Accept interaction.
- Narrow affected checks pass and Verify Plate's implementation review accepts
  the final ownership and complexity.

Verification surface:
- Registry integration: `apps/www/src/registry/components/editor/table.tsx`
  and the focused AI browser test.
- Browser: the reported AI demo route, Generate Markdown sample, Accept, and
  rendered table geometry in Chrome.
- Source audit: acceptance/conversion path and materially different table callers.

Constraints:
- Preserve AI draft/accept semantics, table resize metadata, selection, history,
  and the existing non-suggesting default.
- Fix the canonical table-kit policy; no AI-specific width mutation, timing
  guess, or DOM measurement compensation.
- No public API change unless the invariant cannot be enforced internally.

Boundaries:
- Product/package code, focused tests, browser fixture assertions, generated
  registry output only if registry source changes, and this acceptance plan.
- No commit, push, PR, release, or unrelated AI/table redesign.

Timing:
- N/A.

Blocked condition:
- The reported route or command cannot be reached after two informed serving
  attempts and no package-level reproduction can identify the lost metadata.

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

Decisions and tradeoffs:

| Decision | Owner and source | Chosen fix | Material alternative rejected | Proof |
| --- | --- | --- | --- | --- |
| Table width preservation owner | `TablePlugin.initialState.defaultTableWidth`; table API design and public table setup | Configure the copied interactive `TableKit` with its documented 600px missing-width policy | AI accept mutation, Markdown codec presentation metadata, or renderer/model mismatch | Red/green exact browser geometry |

Completion Gates:

| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Exact AI Accept interaction | applies | Chrome replay on reported route | pass: no draft remains; table is 608px with 300px data columns |
| Width-preserving table policy | applies | Focused AI browser test asserts accepted table and cell geometry | pass: red was 104px / 48px columns; final assertion is 608px / 300px columns |
| Final implementation review | applies | Verify Plate ownership/complexity review | pass: kit state is the existing canonical owner; no AI mutation, DOM measurement, effect, timer or renderer compensation added |

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

- Red baseline: the exact Playwright flow produced cell widths `[8, 48, 48]`
  and a 104px table after Accept.
- `bun test apps/www/src/registry/components/editor/plugins.spec.tsx`: 3 pass.
- `bun test apps/www/src/registry/components/editor/table-toolbar-button.spec.tsx`:
  1 pass.
- Focused Playwright Chromium against the owned source server on port 3010:
  1 pass for `Generate Markdown sample keeps its review visible and accepts a
  usable table`.
- Exact Chrome final replay on `/docs/components/ai-menu`: Generate Markdown
  sample, Accept, inspected screenshot, then reasserted `[8, 300, 300]`, 608px,
  and zero `[data-editor-ai-preview]` nodes.
- `pnpm --filter www build:registry`: pass; regenerated `table.json` and
  `table-toolbar-button.json`.
- `pnpm --filter www editor:generate` followed by `editor:check`: pass;
  refreshed the stale typed EditorKit artifact from the settled table API.
- Focused Ultracite check over the changed app/test files: pass.
- Full www TypeScript reaches only two unrelated existing failures in
  `tests/browser/comment.spec.ts` for stale
  `recordPliteBrowserRuntimeErrors` / `createPliteBrowserEditorHarness` names.
  All table migration errors found by the same check were repaired.
- Detailed local receipt:
  `docs/plans/artifacts/ai-table-widths-after-accept/verification.md`.

Findings and remaining work:

- The Markdown codec correctly leaves presentation widths absent. The static AI
  preview stretches that semantic table, while the live table renderer resolves
  absent widths through `TablePlugin.initialState.defaultTableWidth`.
- `TableKit` omitted the documented 600px app policy, so Accept exposed the
  package minimum of 48px per column. Configuring the kit repairs imported,
  pasted, AI-generated and newly inserted widthless tables through one owner.
- No in-scope work remains. The unrelated comment-test type errors are recorded
  above and were not absorbed into this table repair.

Final handoff:

- Outcome and owning fix: `TableKit` supplies the documented 600px fallback for
  tables without authored widths; stale table API callers compile against the
  settled option shapes.
- Proof and limits: exact Chrome and Playwright geometry pass; focused tests,
  lint and registry generation pass. Full www typecheck retains the unrelated
  comment-test failures listed above.
- Local / integrated / published state: complete in the current checkout;
  publication was not requested.
- Next action or completion: complete.

Timeline:

- 2026-09-17T09:49:31.892Z Plan created.
- 2026-09-17: Captured the screenshot contract, package/browser proof surfaces,
  and prohibition on caller CSS compensation.
- 2026-09-17T12:16:18+02:00: Final source passed the focused unit, registry,
  Chromium and exact Chrome proof; Verify Plate accepted implementation
  ownership.

Open risks:

- None in scope. A host that intentionally keeps `defaultTableWidth: null`
  continues to receive the package minimum for missing widths.
