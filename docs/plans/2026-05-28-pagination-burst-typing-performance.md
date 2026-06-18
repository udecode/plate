# pagination burst typing performance

Objective:
Fix virtualized pagination fast typing so burst input in the middle of
`/examples/pagination` preserves every typed character and stays responsive on
the real rich-markdown stress document.

Completion threshold:
- Browser proof types a multi-character string without per-character
  model-selection waits.
- The full string appears in the target block and model text.
- Model selection catches up after the burst.
- Mounted DOM/page surfaces stay bounded.
- Focused package/site checks pass.

Verification surface:
- `PLAYWRIGHT_RETRIES=0 bun playwright playwright/integration/examples/pagination.test.ts --project=chromium -g "keeps fast burst typing" --reporter=line`
- `PLAYWRIGHT_RETRIES=0 bun playwright playwright/integration/examples/pagination.test.ts --project=chromium -g "keeps middle-document typing responsive" --reporter=line`
- `bun test ./packages/slate-react/test/dom-repair-policy-contract.ts`
- `cd packages/slate-react && bun test:vitest test/input-router-contract.test.tsx`
- `bun --filter slate-react typecheck`
- `bun typecheck:site`
- `bun lint:fix`

Constraints:
- Preserve the real pagination stress document and virtualized page behavior.
- No commit, PR, or tracker sync.

Boundaries:
- Implementation and tests in `/Users/zbeyens/git/plate-2/Plate repo root`.
- Goal plan in `/Users/zbeyens/git/plate-2/docs/plans`.
- Browser surface: `/examples/pagination`, DOM strategy `virtualized`.

Blocked condition:
Stop only if burst typing cannot be reproduced or no code-owned repair path
remains. This did not happen.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Used `performance` and `debug`; root cause investigation before fix. |
| Active goal checked or created | yes | Created active goal for virtualized pagination burst typing. |
| Source of truth read before edits | yes | User reported fast typing still slow and skipping chars. |
| Browser route identified | yes | `/examples/pagination` with DOM strategy `virtualized`. |
| TDD decision | yes | Added failing burst Playwright repro before repair changes. |
| Release artifact decision | yes | Existing pagination typing changeset covers `slate-react` behavior change. |
| PR expectation | no | N/A: no PR requested. |
| Tracker sync | no | N/A: chat-only report. |

Work Checklist:
- [x] Reproduced burst typing without per-character waits.
- [x] Identified root cause from evidence.
- [x] Fixed the owning runtime boundary.
- [x] Added focused unit coverage for burst DOM delta import.
- [x] Added focused browser coverage for burst typing.
- [x] Verified the previous single-character latency proof still passes.
- [x] Recorded package/site/lint evidence.
- [x] Recorded remaining caveats.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Bug reproduced before fix | yes | Run focused burst proof | Failed with text `Release arcdeeghajklmdopiness memo`, proving skipped/reordered chars. |
| Targeted behavior verification | yes | Run burst proof after fix | Passed. |
| Previous latency proof | yes | Rerun existing middle typing proof | Passed. |
| TypeScript changed | yes | Run relevant typecheck | `bun --filter slate-react typecheck` and `bun typecheck:site` passed. |
| Lint | yes | Run formatter/lint fix | `bun lint:fix` passed. |
| Package behavior changed | yes | Changeset | Covered by existing pagination typing changeset. |
| PR create or update | no | N/A | No PR requested. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Reproduce | complete | Burst Playwright row failed before fix. | root cause |
| Root cause | complete | Deferred repair replayed old individual input events against later DOM selection and caret repair fought live typing. | implementation |
| Implementation | complete | Debounced virtualized native text repair and imported current DOM/model delta once. | verification |
| Verification | complete | Focused browser/unit/type/site/lint checks passed. | closeout |
| Closeout | complete | Plan recorded. | final |

Findings:
- The prior proof waited for model selection after every character, hiding the
  actual user path.
- Fast typing produced corrupted text such as
  `Release arcdeeghajklmdopiness memo`.
- Root cause: virtualized deferred repair replayed old single-character input
  events against later DOM selection, and repeated caret repair interrupted the
  browser's live selection during a burst.

Performance:
- applicability: applied.
- repeated unit: active virtualized text block inside mounted page surfaces.
- cohorts: stress document, ~1000 pages.
- budgets: burst proof keeps DOM < 1400 and page surfaces <= 10.
- interaction metrics: burst string typed with `keyboard.type(..., { delay: 0 })`.
- degradation contract: virtualized mode lets native DOM own burst text while
  model repair debounces briefly, imports the full DOM delta, then catches model
  selection up.
- dashboard/RUM gap: no production RUM added.

Implementation notes:
- `input-router` debounces deferred native text repair for virtualized insert
  text bursts and coalesces pending repairs.
- `dom-repair-queue` imports the current DOM text delta relative to the Slate
  text instead of trusting the stale single-character `InputEvent.data`.
- Playwright now has a burst typing proof that does not wait per character.

Verification evidence:
- Failing repro before fix:
  `PLAYWRIGHT_RETRIES=0 bun playwright playwright/integration/examples/pagination.test.ts --project=chromium -g "keeps fast burst typing" --reporter=line`
  failed with missing/reordered chars.
- Passing proof after fix:
  `PLAYWRIGHT_RETRIES=0 bun playwright playwright/integration/examples/pagination.test.ts --project=chromium -g "keeps fast burst typing" --reporter=line`
  passed.
- Regression proof:
  `PLAYWRIGHT_RETRIES=0 bun playwright playwright/integration/examples/pagination.test.ts --project=chromium -g "keeps middle-document typing responsive" --reporter=line`
  passed.
- `bun test ./packages/slate-react/test/dom-repair-policy-contract.ts` passed.
- `cd packages/slate-react && bun test:vitest test/input-router-contract.test.tsx` passed.
- `bun --filter slate-react typecheck` passed.
- `bun typecheck:site` passed.
- `bun lint:fix` passed.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, chat-only report.
- Confidence line: high for focused Chromium burst typing in virtualized
  pagination; mobile/IME remains unproven.
- Browser check: focused Chromium Playwright proof.
- Outcome: fast burst typing preserves the full typed string and model
  selection catches up.
- Caveat: no full browser matrix, no mobile/IME proof.

Reboot status:
Complete. Dev server remains the live manual verification surface.

Open risks:
- Debounced model repair means model state trails native DOM during an active
  burst by a short delay; non-insert input flushes pending repair first.
- Mobile/IME needs separate proof before claiming full parity.

Timeline:
- 2026-05-28T15:42Z Burst repro added and failed with skipped/reordered chars.
- 2026-05-28T15:49Z Unit and browser burst proofs passed after repair debounce
  and DOM delta import.
