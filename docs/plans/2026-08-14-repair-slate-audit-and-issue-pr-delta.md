# Repair Slate audit and issue/PR delta

Objective:
Repair the missing upstream Slate audit registration, preserve the remembered fork audit without inventing a cursor, and classify every issue or PR created or materially changed after the recovered tracker baseline.

Completion threshold:
- Recover the prior audit's exact authority and explain any cursor ambiguity.
- Register one honest upstream Slate source, test, and tracker cursor in `docs/editor-audits/index.json`.
- Inventory the full current upstream test tree and validate a strict regression-proof concept matrix.
- Audit every issue and PR with `updated_at > 2026-05-23T09:18:40Z`; leave zero unchecked rows.
- Run every focused local proof behind a covered disposition, lint the changed files, and pass the goal validator.

Verification surface:
- Local Git history and the clean `../slate-audit` clone establish source provenance.
- `docs/editor-test-harvester/slate/**` establishes test-tree coverage.
- `docs/editor-issue-harvester/slate/**` establishes all 54 tracker decisions.
- The strict concept-matrix validator, focused Plite tests, Chromium proof, JSON parsing, link checks, lint, and this goal validator own closure.

Constraints:
- No runtime or package implementation.
- No GitHub comments, labels, closures, reviews, commits, pushes, branches, or PRs.
- Keep raw bodies, comments, checks, commits, and PR file lists under `.tmp`; version compact metadata and decisions only.
- Keep source, test, and tracker cursors independent. Do not promote an open PR, synthetic mobile test, or fork file-set match beyond its evidence.

Boundaries:
- Durable edits are limited to this plan, `docs/editor-audits/**`, `docs/editor-test-harvester/slate/**`, `docs/editor-issue-harvester/slate/**`, and `docs/plans/artifacts/slate-regression-proof-audit/**`.
- Upstream source authority is `../slate-audit` at `ec793483ada7f7e21ebc82c2b3aa9ea674605ce3`.
- Tracker baseline is `2026-05-23T09:18:40Z`; refresh authority is the all-state gitcrawl sync finished at `2026-08-14T11:21:25.836091Z`.
- Browser proof is required only for an existing async-decoration coverage claim. Raw-device mobile rows may close only as reproduction gates.

Blocked condition:
Block only if the old audit cannot be recovered from Git history, current upstream cannot be frozen locally, or an uncapped all-state tracker delta cannot be obtained. None occurred; mobile-device availability is row-level evidence, not task blockage.

Goal state:
- task type: major audit repair
- flow: one-shot
- current phase: closeout
- goal status: complete after the mechanical validator and active-goal update

Start Gates:

| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Repair Slate audit, then audit all newer or changed issues and PRs; scope and proof limits are recorded above. |
| Active goal | yes | Goal created for this exact objective with this plan path. |
| Skills loaded | yes | `autogoal`, `major-task`, `editor-audit`, `editor-test-harvester`, `issue-harvester`, `clawsweeper`, and `docs-creator` were read. |
| Source owner established | yes | Clean `../slate-audit` upstream clone plus Plate Git history and gitcrawl tracker archive. |
| Implementation authority | no | Audit and documentation only; runtime changes are explicitly excluded. |
| Browser boundary | yes | Existing async-decoration Chromium row rerun; mobile claims remain raw-device gates. |
| Public mutation authority | no | No GitHub mutation requested or performed. |
| Output budget | yes | Raw high-volume provider data stays under `.tmp`; durable artifacts are compact. |

Work Checklist:
- [x] Every prompt requirement, non-goal, stop condition, deliverable, verification surface, and handoff item was recorded before durable repair.
- [x] The deleted 1,120-file audit was recovered from Git history and tied to its fork-specific lineage.
- [x] The legacy file-set hash was checked against upstream and shown not to be an upstream cursor.
- [x] A clean upstream Slate clone was frozen at the current `origin/main` head.
- [x] The 1,136-file test tree was fully inventoried and classified with zero unresolved rows.
- [x] All 1,093 runnable files received 1,254 direct or fixture-derived test identities.
- [x] The regression-proof manifest and 12-row atomic concept matrix were generated and validated.
- [x] An uncapped 5,853-thread all-state metadata sync was completed.
- [x] Exact PR details were hydrated for all 54 changed threads, not the historical corpus.
- [x] All 7 issues and 47 PRs received explicit owner, status, provenance, proof, and next-action fields.
- [x] Every `covered-by-existing-test` owner was rerun with a focused command.
- [x] Browser-level async-decoration proof passed in Chromium.
- [x] Facts, inference, recommendation, alternatives, blast radius, and remaining risk are separated in the audit report.
- [x] The pressure review rejected fake upstream authority, fake coverage, and fake mobile proof.
- [x] Durable outputs contain no raw issue body, comment, review, check, commit, or PR diff corpus.
- [x] Runtime implementation and public tracker mutation remained outside scope.
- [x] Final JSON, matrix, ledger, link, lint, and goal-plan checks were executed.

Completion Gates:

| Gate | Applies | Evidence |
| --- | --- | --- |
| Prior audit recovery | yes | [Audit report](./artifacts/slate-regression-proof-audit/audit-report.md#legacy-audit-recovery) records the deleted plan, exact hash, two matching fork commits, and upstream mismatch. |
| Audit registry repair | yes | `docs/editor-audits/index.json` registers upstream Slate at `ec793483ada7f7e21ebc82c2b3aa9ea674605ce3`. |
| Full test inventory | yes | 1,136 classified, 1,093 runnable, 1,254 identities, zero unresolved. |
| Strict atomic matrix | yes | 12 rows; zero duplicate, grouped, missing, unknown, canned, or unresolved rows. |
| Tracker delta completeness | yes | 54 rows: 7 issues, 47 PRs, 33 new, 21 materially updated, zero unchecked. |
| Coverage proof | yes | DOM 1, selected hook 10, selection origin 2, Unicode 17, History 1, command 44, Chromium decoration 4 all passed. |
| Options and rejection record | yes | Keep current proof, rearchitect nested arrays, defer hyperscript refs, reproduce native no-op and mobile IME; fork batching and null-as-unset are rejected for current adoption. |
| Review pressure | yes | Authority, exact-test, and raw-device pressure rules are recorded in the audit report. |
| Implementation gates | no | No runtime or package code changed. |
| Docs source claims | yes | All source claims point to current local source, generated ledgers, or recovered Git evidence. |
| Docs links | yes | Relative artifact links were checked against real files. |
| MDX parser | no | No MDX or `content/**` file changed. |
| Browser route | yes | Existing Plite async-decoration route passed 4/4 Chromium tests. |
| Public tracker mutation | no | Read-only sync only. |
| Final lint | yes | `pnpm lint:fix` completed for the checkout after artifact generation. |
| Goal plan | yes | `check-complete.mjs` reports this plan complete. |

Phase / pass table:

| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Intake and source read | complete | Governing skills and owners read | recovery |
| Prior audit recovery | complete | Fork file-set hash and ambiguous commits recorded | upstream baseline |
| Upstream baseline | complete | Clean clone frozen at `ec793483ada7f7e21ebc82c2b3aa9ea674605ce3` | test inventory |
| Test harvest | complete | 1,136 files and 1,254 identities | strict matrix |
| Strict audit | complete | 12 atomic rows validated | tracker sync |
| Tracker refresh | complete | All-state metadata plus 54-row exact hydration | classification |
| Row closure | complete | Zero unchecked; explicit owners and proof boundaries | focused proof |
| Focused proof | complete | Package and Chromium commands passed | verification |
| Review pressure | complete | False-authority and false-proof claims rejected | closeout |
| Verification | complete | JSON, ledgers, matrix, links, lint, and goal validator passed | handoff |
| Closeout | complete | Registry and validation receipt complete | user handoff |

Findings:
- The remembered audit was the deleted 2026-04-13 Slate-v2 ledger gap audit. Its 1,120-file hash matches two commits on the `6038-batched-set-node-prototype` fork lineage, so it cannot identify one commit or upstream `main`.
- Current upstream `main` is `ec793483ada7f7e21ebc82c2b3aa9ea674605ce3`. Its full test tree has 1,136 files.
- The tracker delta has 54 threads. Closure statuses are 12 covered, 7 deferred with owner, 4 needing reproduction, and 31 inspected non-behavior skips.
- Merged PR #6092 is the one confirmed material Plite gap: nested arrays compare recursively upstream but by member identity in Plite.

Decisions and tradeoffs:
- Chosen: create a new current upstream audit and retain the old fork audit as provenance. Rejected: assign either matching fork commit as the upstream cursor.
- Chosen: hydrate only the exact 54-row delta after an uncapped metadata sync. Rejected: hydrate every historical PR, which expands without helping the requested delta.
- Chosen: keep exact local coverage where tests passed. Rejected: count adjacent tests as proof for native no-op DOM repair or raw mobile IME.
- Chosen: recommend a focused nested-array slice. Rejected: bundle hyperscript ergonomics, mobile reproduction, batching architecture, or null-as-unset API changes.

Review fixes:
- Replaced the original dirty fork checkout with a clean upstream clone for authority.
- Corrected four initial focused commands whose filename filters did not use explicit Bun paths; reruns passed.
- Replaced open-PR file paths that do not exist in upstream `main` with durable hydrated-ledger evidence.
- Added `issue_number` alongside the display `number` and asserted allowed owners, allowed statuses, and zero unchecked rows in the classifier.

Error attempts:

| Error | Count | Different move | Resolution |
| --- | ---: | --- | --- |
| Historical `--with pr-details` hydration expanded beyond the requested delta | 1 | Stop, run uncapped metadata only, derive exact delta, hydrate 54 numbers | Complete |
| Bun/Vitest filename filters did not match explicit nonstandard test filenames | 4 | Use `exec bun test` with `./test/...` paths | All focused reruns passed |
| First full lint found one `console.log` in the test-harvest generator | 1 | Use `process.stdout.write` and rerun full lint | Full lint passed |

Verification evidence:
- Strict matrix: 12/12 rows; integrity errors 0; one material P1 row.
- Tracker classifier: 54/54 rows; 7 issues; 47 PRs; 33 new; 21 materially updated; 0 unchecked.
- Package proof: DOM resolver 1 pass; selected hook 10 passes; selection origin 2 passes; Unicode text units 17 passes; History rollback 1 pass; semantic commands 44 passes.
- Browser proof: async decorations 4/4 passed in Chromium.
- Registry JSON parses and all registered Slate artifact paths exist.
- Final lint and goal validator completed successfully.

Final handoff contract:
- Recommendation: keep the repaired cursor and schedule only the P1 nested-array equality slice.
- Confidence: high for source, inventory, and tracker completeness; medium for open native/mobile behavior because reproduction is deliberately outstanding.
- Evidence: [audit report](./artifacts/slate-regression-proof-audit/audit-report.md), [test report](../editor-test-harvester/slate/report.md), and [tracker report](../editor-issue-harvester/slate/report.md).
- Browser proof: existing async-decoration suite passed in Chromium; #6084 still needs its own selected reproduction.
- PR / tracker: read-only refresh only; no public changes.
- Caveats: open PRs can change; raw-device rows remain device-lane work; the full upstream suite was inventoried but not transplanted or rerun against Plite.
- Next owner: `patch` for the nested-array behavior slice if selected; Plite browser owner for #6084 reproduction; raw-device lane for mobile IME.

Timeline:
- 2026-08-14: plan created; skills and source owners read.
- 2026-08-14: legacy fork audit recovered and upstream mismatch proved.
- 2026-08-14: current test inventory, strict matrix, and 54-row tracker delta completed.
- 2026-08-14: focused package and Chromium proof passed; registry repaired.

Reboot status:

| Question | Answer |
| --- | --- |
| Where am I? | Closeout is complete. |
| Where am I going? | User handoff with the repaired cursor and delta verdict. |
| What is the goal? | Register honest current Slate authority and close all changed issue/PR rows. |
| What did I learn? | The old audit was fork-specific; current upstream has one material Plite gap and explicit browser/device proof gaps. |
| What did I do? | Built the current test harvest, strict audit, compact tracker ledgers, registry row, and fresh proof receipt. |

Open risks:
- GitHub can update old threads after this checked-at timestamp; the next sync must use `updated_at`, not creation date alone.
- Open PR #6084 and #6096 can change or close without merge.
- Real Android and Firefox mobile behavior remains unproved outside a capable raw-device lane.
