# Slate v2 uncommitted autoreview closeout

Objective:
Run one `slate-automation` closeout loop with `autoreview` over uncommitted Slate-v2 work so the user can commit with reviewed fixes.

Scope:
- Target repo: `/Users/zbeyens/git/plate-2/.tmp/slate-v2`.
- Parent repo: plan bookkeeping only.
- No commit, stage, push, PR, release, publish, or changeset work.
- Fix accepted review findings and cut invalid patches.

Completion threshold:
- Local uncommitted autoreview ran against `.tmp/slate-v2`.
- Every accepted finding from the completed review loop was fixed or consciously rejected.
- Focused proof for every edited behavior lane passed.
- No commit, stage, push, PR, release, publish, or changeset was created.
- Final handoff names changed files, commands run, accepted/rejected findings, workflow slowdown, and commit caveat.

Verification surface:
- Autoreview local mode from `/Users/zbeyens/git/plate-2/.tmp/slate-v2`.
- Focused package checks for `slate`, `slate-react`, and `slate-browser`.
- Focused Playwright checks for richtext, tables, markdown shortcuts, inlines, and paste-html examples on `http://localhost:3100`.
- Autogoal checker for this plan.

Constraints:
- Stay in the current checkout.
- Do not touch parent repo code except this plan.
- Do not create release artifacts.
- Do not claim full-release readiness without `bun check` or the full browser sweep.

Boundaries:
- Source of truth is the nested Slate-v2 uncommitted diff.
- Review artifacts under `.tmp/slate-v2/.tmp/autoreview-uncommitted*.txt` are evidence, not product files.
- Existing target-block fragment replacement contract remains authoritative.

Blocked condition:
- None. The loop is complete with a caveat that a further autoreview rerun was intentionally not started because this was scoped as one closeout loop and prior review passes were slow.

First checkpoint:
- All explicit prompt requirements were copied before implementation: use `slate-automation`, use `autoreview`, review uncommitted local work, prepare for commit, cut invalid patches, rerun proof, and include final changed/proof/review status.

Autoreview evidence:
- Initial local review:
  `/Users/zbeyens/git/plate-2/.agents/skills/autoreview/scripts/autoreview --mode local --prompt "<Slate-v2 uncommitted patch review>" --output .tmp/autoreview-uncommitted.txt --json-output .tmp/autoreview-uncommitted.json`
- Reruns:
  `.tmp/autoreview-uncommitted-rerun.txt`
  `.tmp/autoreview-uncommitted-final.txt`
  `.tmp/autoreview-uncommitted-final-2.txt`
  `.tmp/autoreview-uncommitted-cleancheck.txt`
- Workflow slowdown:
  autoreview repeatedly took about 10-15 minutes per run over a 227k-character dirty bundle.

Accepted findings fixed:
- Full-block browser text replacement preserved headings but now avoids structural container corruption.
- Delete-fragment explicit selection routes through `tx.fragment.delete` instead of bypassing fragment middleware.
- Table Tab handling no longer prevents default at first/last table-cell boundaries.
- Markdown shortcut cleanup deletes the marker before returning for existing list items.
- Inline-void paste into an empty target block places the caret after the inline void spacer.
- Auto-linking selected text with a typed URL collapses and moves outside the link.
- HTML block paste replaces expanded selections and preserves intentional leading blank pasted blocks.
- Slate-browser paste fallback forwards `slateFragment`.

Conscious rejection:
- Rejected the request to flip single-block selected-text fragment replacement to preserve the pasted fragment block type. Existing contract `packages/slate/test/clipboard-contract.ts` preserves the target block type for this case, and that contract still passes.

Files intentionally touched in this closeout:
- `.tmp/slate-v2/packages/slate/src/transforms-text/insert-fragment.ts`
- `.tmp/slate-v2/packages/slate/test/clipboard-contract.ts`
- `.tmp/slate-v2/packages/slate-react/src/editable/mutation-controller.ts`
- `.tmp/slate-v2/packages/slate-react/test/projected-command-contract.test.ts`
- `.tmp/slate-v2/packages/slate-browser/src/playwright/index.ts`
- `.tmp/slate-v2/site/examples/ts/tables.tsx`
- `.tmp/slate-v2/site/examples/ts/markdown-shortcuts.tsx`
- `.tmp/slate-v2/site/examples/ts/inlines.tsx`
- `.tmp/slate-v2/site/examples/ts/paste-html-import.ts`
- `.tmp/slate-v2/playwright/integration/examples/richtext.test.ts`
- `.tmp/slate-v2/playwright/integration/examples/tables.test.ts`
- `.tmp/slate-v2/playwright/integration/examples/markdown-shortcuts.test.ts`
- `.tmp/slate-v2/playwright/integration/examples/inlines.test.ts`
- `.tmp/slate-v2/playwright/integration/examples/paste-html.test.ts`

Verification evidence:
- `bun biome check --write packages/slate/src/transforms-text/insert-fragment.ts packages/slate-react/src/editable/mutation-controller.ts packages/slate-browser/src/playwright/index.ts site/examples/ts/markdown-shortcuts.tsx site/examples/ts/inlines.tsx site/examples/ts/paste-html-import.ts packages/slate/test/clipboard-contract.ts packages/slate-react/test/projected-command-contract.test.ts playwright/integration/examples/richtext.test.ts playwright/integration/examples/tables.test.ts playwright/integration/examples/markdown-shortcuts.test.ts playwright/integration/examples/inlines.test.ts playwright/integration/examples/paste-html.test.ts`
- `bun --filter slate typecheck`
- `bun --filter slate-react typecheck`
- `bun --filter slate-browser typecheck`
- `bun test ./packages/slate/test/clipboard-contract.ts`
- `cd .tmp/slate-v2/packages/slate-react && bun vitest run --config ./vitest.config.mjs test/projected-command-contract.test.ts`
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/richtext.test.ts --project=chromium --grep "preserves the selected heading block after browser text replacement|replaces the current block after browser triple click and typing"`
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/tables.test.ts --project=chromium --grep "moves between table cells with Tab and Shift\+Tab|does not prevent Tab at table boundaries"`
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/markdown-shortcuts.test.ts --project=chromium --grep "merges a markdown-created list before an existing list"`
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/inlines.test.ts --project=chromium --grep "collapses after auto-linking selected text with a typed URL|keeps selected text selected after toolbar link wrapping|wraps typed URL text as a link command"`
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/paste-html.test.ts --project=chromium --grep "preserves an intentional leading blank block when pasting into an empty paragraph|imports a blank paragraph without duplicating its line break|replaces a blank paragraph with pasted block styles"`

Final status:
- Accepted review findings were fixed and focused proof is green.
- The last autoreview run found three findings; all three were fixed and verified.
- A further autoreview rerun was intentionally not started because this was scoped as one closeout loop and prior review passes were slow enough to become a workflow cost.
- Commit-readiness caveat: full `bun check` / full browser sweep was not run.

Work Checklist:
- [x] Prompt requirements copied before implementation.
- [x] Uncommitted `.tmp/slate-v2` patch reviewed with autoreview local mode.
- [x] Accepted findings fixed or consciously rejected.
- [x] Invalid full-document fragment patch cut and recorded.
- [x] Focused typecheck, package, and browser proof passed.
- [x] No commit/stage/push/PR/release artifact created.
- [x] Final handoff evidence recorded.

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Intake | done | Prompt requirements and nested repo target recorded. |
| Autoreview | done | Local autoreview outputs recorded under `.tmp/slate-v2/.tmp`. |
| Fixes | done | Accepted findings fixed; one invalid finding consciously rejected. |
| Verification | done | Focused package and Playwright proof commands passed. |
| Closeout | done | Plan checker target recorded and final handoff ready. |

Reboot status:
- current: completed closeout; no resume required.
- next step if reopened: run a fresh autoreview or `bun check` only if the user wants a broader pre-commit gate.

Open risks:
- Full `bun check` and full browser sweep were not run.
- Final clean autoreview after the last fixes was not run; the last completed autoreview findings were fixed with focused proof.

Goal plan complete:
- Ready for `check-complete`.
