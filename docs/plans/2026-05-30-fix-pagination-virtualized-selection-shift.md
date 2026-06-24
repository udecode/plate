# fix pagination virtualized selection shift

Objective:
Fix the virtualized pagination bug where selecting a paragraph shifts its text left on `/examples/pagination?page_layout=single&strategy=virtualized`.

Completion threshold:
The bug is reproduced before the fix, covered by focused Playwright regression, fixed at the pagination/native-flow ownership boundary, typechecked, formatted, and reviewed with no accepted actionable findings.

Verification surface:
`site/examples/ts/pagination.tsx` owns the selected/native-flow render path. `playwright/integration/examples/pagination.test.ts` owns the browser regression for projected text becoming native flow after selection.

Constraints:
Keep the patch scoped to virtualized pagination selected text. Do not change staged pagination, non-virtualized layout, projection geometry, package exports, registry output, commits, PRs, or tracker state.

Boundaries:
- Source of truth: `Plate repo root` pagination example and its Playwright integration test.
- Allowed edit scope: `apps/www/src/app/(app)/examples/plite/_examples/pagination.tsx`, `apps/www/tests/plite-browser/donor/examples/pagination.test.ts`, and this goal plan.
- Browser surface: `http://localhost:3100/examples/pagination?page_layout=single&strategy=virtualized`.
- Tracker sync: N/A, local user-reported issue.
- Non-goals: broader pagination architecture, page virtualization policy, shortcut behavior, autoscroll behavior.

Blocked condition:
None. The bug was reproducible locally and the focused proof runs.

Work Checklist:
- [x] Objective, completion threshold, verification surface, constraints, boundaries, and blocked condition recorded.
- [x] User-reported browser route and selected paragraph alignment acceptance criteria recorded.
- [x] Video evidence N/A: the issue was directly reproducible from the provided route.
- [x] Nearby pagination render/projection code and existing pagination Playwright tests read before edits.
- [x] Implementation fixed the selected/native-flow virtualized text boundary instead of changing projection geometry.
- [x] Release artifact N/A: example/test-only bug fix in `Plate repo root`.
- [x] Branch, PR, tracker sync, and changeset N/A: user did not request git or release work.
- [x] Workspace authority recorded: all proof commands ran in `Plate repo root` except this plan check.
- [x] Browser pack covered by Playwright route proof; Browser plugin unavailable in this session after tool discovery.
- [x] Autoreview selected for the local pagination alignment patch.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Used slate-patch and autogoal for a browser/editor bug with measurable proof. |
| Active goal checked or created | yes | Active Codex goal created for this virtualized selection shift. |
| Source of truth read before edits | yes | Read pagination projection/render code and nearby pagination Playwright tests. |
| TDD decision before behavior change | yes | Added failing focused Playwright regression before the fix. |
| Browser route identified | yes | `/examples/pagination?page_layout=single&strategy=virtualized`. |
| Browser tool decision recorded | yes | Browser plugin tool discovery did not expose a browser control tool; used repo Playwright harness. |

Completion Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Bug reproduced before fix | yes | Before fix, projected leaf left was 341px and selected native-flow leaf left was 339px. |
| Targeted behavior verification | yes | Focused Playwright alignment test passes after the fix. |
| TypeScript changed | yes | `bun typecheck:site` passed in `Plate repo root`. |
| Formatting | yes | `bunx biome check --write site/examples/ts/pagination.tsx playwright/integration/examples/pagination.test.ts` passed in `Plate repo root`. |
| Browser surface changed | yes | Playwright exercised the target route and selection transition. |
| Package exports or install graph | no | N/A: no package export, manifest, lockfile, or install graph changes. |
| Changeset | no | N/A: example/test-only fix in Plite checkout. |
| Autoreview | yes | Local autoreview ran for the pagination alignment patch; result recorded below. |
| PR or tracker sync | no | N/A: user asked for local fix, not git or tracker update. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Route, repro, projection and render paths identified. | implementation |
| Implementation | complete | Added selected/native-flow inline inset for virtualized text blocks. | verification |
| Verification | complete | Formatter, site typecheck, focused Playwright proofs passed. | closeout |
| Review | complete | Autoreview result handled. | final response |
| Closeout | complete | Plan and goal ready to close. | final response |

Findings:
- Root cause: virtualized projected text uses `PAGE_CONTENT_INLINE_INSET`, but the selected paragraph switches to native flow text and previously started at the block left edge.

Decisions and tradeoffs:
- Chosen boundary: apply the same inset only when a text block is both selected/native-flow and in virtualized layout.
- Rejected broader change: changing projection geometry would risk staged and non-selected virtualized text.

Implementation notes:
- Added `paddingLeft: PAGE_CONTENT_INLINE_INSET` for `flowElement && usesVirtualizedLayout` text blocks.
- Added Playwright geometry coverage that verifies absolute projected text and selected native-flow text share the same left coordinate.

Review fixes:
- First autoreview caught that padding alone would shrink the selected/native-flow wrap width by 2px. Fixed by expanding the selected virtualized text block width by the same inset and hardening the regression with `wrapWidthPreserved`.
- Second autoreview clean: no accepted/actionable findings reported.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Red focused Playwright regression before fix | 1 | Apply native-flow inset in virtualized render path. | Green after patch. |

Verification evidence:
- `Plate repo root`: `bunx biome check --write site/examples/ts/pagination.tsx playwright/integration/examples/pagination.test.ts`
- `Plate repo root`: `bun typecheck:site`
- `Plate repo root`: `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/pagination.test.ts --project=chromium --grep "keeps virtualized pagination text aligned"`
- `Plate repo root`: `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/pagination.test.ts --project=chromium --grep "keeps virtualized pagination text aligned|moves the cursor between the first two virtualized"`

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, local user-reported bug.
- Confidence line: High, the regression measures the exact left-coordinate shift across projected and selected native-flow render states.
- Browser check: Playwright route proof used because Browser plugin tooling was unavailable.
- Outcome: selected virtualized paragraph text no longer shifts left.
- Caveat: unrelated local pagination changes in the same files were preserved.

Open risks:
None known for this scoped fix. Broader pagination interactions remain covered by adjacent focused Playwright tests, not a full browser sweep.

Final handoff / sync:
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: focused Playwright route proof.
- Caveats: no git operation performed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Final response after autoreview and plan check |
| What is the goal? | Fix selected paragraph left shift in virtualized pagination |
