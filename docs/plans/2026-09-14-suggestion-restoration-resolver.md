# Suggestion restoration resolver coverage

Status: Completed.

Objective:
Audit deletion restoration against Google Docs authorship semantics, add prefix, suffix, full, mismatch, and author-boundary coverage, and change production only if the resolver violates independent review ownership.

Goal plan:
`docs/plans/2026-09-14-suggestion-restoration-resolver.md`

Completion threshold:
Matching text minimizes an author's own pending deletion. Matching text from another author remains a separate proposal, and each proposal can still be reviewed independently. The focused test, authored partition, lint, typecheck, and retry-free stability pass.

Verification surface:
`packages/plitejs/test/authored-self-edit-contract.test.ts`, the complete authored package partition, source lint/typecheck, the homepage fixture author setup, and a generated proof receipt.

Constraints:
Use the current dirty `next` checkout. Tests own the durable behavior. Preserve authenticated authorship and explicit review decisions. Do not change Google sharing, public API, generated registry output, templates, dependencies, Git history, or publication state.

Boundaries:
The Plite authored substrate owns proposal reconciliation. This run writes only the owner contract and this plan because the candidate behavior passed. The browser claim is limited to prior own-author Google observation and Google's official multi-suggestion model; the second signed-in account lacked access, so this run makes no direct two-account Google gesture claim. Work stayed sequential with one writer.

Blocked condition:
Block only if authenticated author behavior cannot be resolved from executable state plus authoritative Google model evidence, or if required access would need an unauthorized permission change.

Start Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Prompt requirements captured | yes | Retyping at a redline, merge expectation, resolver audit, Google comparison, and broader coverage are recorded. |
| Regression methodology loaded | yes | Regression methodology and Editor Test Harvester rules were read before test mutation. |
| Current source and executable owner | yes | Dirty base `5a899edcbea2c31f1bd34dc575c9dd3860c577d0`; authored self-edit contract is the smallest owner. |
| Behavior authority resolved | yes | The screenshot is Bob's seeded deletion plus Alice input; Google documents distinct/nested suggestion IDs and author-scoped deletion. |
| Writer and publication boundary | yes | Sequential local test/plan changes only; no publication or Google permission mutation. |

Work Checklist:

- [x] Inspect the homepage seed and identify the deletion author and active user.
- [x] Reconcile the latest reporter expectation with prior Google own-author evidence and Google's official suggestion model.
- [x] Run the existing owner contract before editing.
- [x] Add explicit same-author prefix, suffix, full, and mismatch assertions.
- [x] Add the exact different-author matching-prefix case and independent reject sequence.
- [x] Run focused, partition, lint, typecheck, and three retry-free stability passes.
- [x] Capture a source-bound proof receipt after the final test edit.
- [x] Record the no-production-change decision and residual proof limit.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|---|---|---|---|
| Named completion threshold | yes | Close SR-01 | Pass: 44 focused tests, 364 authored tests, lint, typecheck, and 132 three-run stability tests. |
| Executable regression coverage | yes | Preserve the author boundary and minimization matrix | Pass: durable assertions in the authored self-edit contract. |
| Cumulative reporter and oracle closure | yes | Account for screenshot, fixture authors, prior probe, and official model | Pass: evidence and oracle tables below. |
| Proof receipt and affected corpus | yes | Bind final bytes and replay the shared owner | Pass: receipt `sha256:9be347faac93ad61730bddea34c65ca3988711d240e1fbfc8aebe63e22a6df69`. |
| Failed-fix and architecture pressure | no | N/A: no claimed fix failed and production did not change | Pass: explicit zero-attempt and patch/no-change rows below. |
| Source/generated sync | no | N/A: no agent source or registry source changed | Pass: no generator required. |
| Autoreview and publication | no | N/A: no PR or explicit review request | Pass: local uncommitted work only. |
| Regression semantic plan | yes | Run the complete validator | Pass: final command recorded below. |
| Goal plan complete | yes | Run the Autogoal completion checker | Pass: final command recorded below. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|---|---|---|---|
| Authority and reproduction | completed | Fixture ownership, existing contract, prior Google probe, and official Google model reconciled | Coverage matrix |
| Coverage and verification | completed | Focused, partition, checks, stability, and receipt passed | Handoff |
| Handoff | completed | No production defect; behavior and proof limits recorded | None |

Selected executable cases:
| Case ID | Source reference | Setup / action | Expected outcome | Expected-outcome authority | Red-test escalation | Exact environment | Test file / command | Status | Tested ref | Next owner |
|---|---|---|---|---|---|---|---|---|---|---|
| SR-01 | User screenshot/message, homepage seed, prior live own-author Google probe, official Google Docs suggestion model | Delete `mark text` as one author; retype matching prefix/suffix/full or mismatching text as that author; then retype the matching prefix as another author and reject each contribution separately | Own matching text minimizes the same proposal; foreign matching text retains two author-scoped IDs and leaves the original deletion revision/content unchanged | accepted-product-law: authenticated contributions remain independently reviewable; upstream-contract: Google supports distinct nested suggestion IDs across users | unit-red: not-applicable-audit-only because the owner behavior was already green; the missing artifact was explicit matrix coverage | runtime-modes: propose/markup plus history and authenticated author switch; fixture-scope: complete `to mark text end` | `packages/plitejs/test/authored-self-edit-contract.test.ts`; `pnpm --filter plitejs exec bun test test/authored-self-edit-contract.test.ts` | completed | dirty:5a899edcbea2c31f1bd34dc575c9dd3860c577d0 | none: local coverage complete |

Reporter evidence inventory:
| Case ID | Source role | Source reference | Phase | Claim | Disposition | Oracle anchors | Executable anchor | Result |
|---|---|---|---|---|---|---|---|---|
| SR-01 | reporter | Current screenshot/message | after-action | Alice's matching prefix should silently undo Bob's deletion | superseded: authenticated author ownership and explicit review decisions forbid rewriting Bob's proposal through Alice text input | N/A: superseded outcome | N/A: superseded outcome | N/A: superseded outcome |
| SR-01 | reporter | Current request | after-action | Resolver coverage must include restoration and merge boundaries | required | model@after-action, runtime-errors@after-action | test: packages/plitejs/test/authored-self-edit-contract.test.ts#keeps a matching deletion prefix typed by another author separate | pass: prefix, suffix, full, mismatch, and author switch are explicit |
| SR-01 | fixture | `apps/www/src/registry/examples/playground-demo.tsx` | setup | The screenshot combines a Bob deletion with Alice as the active author | required | model@after-action | test: packages/plitejs/test/authored-self-edit-contract.test.ts#keeps a matching deletion prefix typed by another author separate | pass: exact author switch and text fixture reproduced |
| SR-01 | upstream | Google Docs API suggestion resource and request authorization documentation | after-action | Different-user nested edits keep distinct suggestion IDs; deleting a suggestion is author-scoped while rejecting it is an explicit review action | required | model@after-action, follow-up-input@follow-up | test: packages/plitejs/test/authored-self-edit-contract.test.ts#keeps a matching deletion prefix typed by another author separate | pass: separate IDs, unchanged parent revision, and independent rejection proved |

Reporter oracle matrix:
| Case ID | Observation | Phase | Applies | Positive assertion | Forbidden state | Proof layer | Executable anchor | Result |
|---|---|---|---|---|---|---|---|---|
| SR-01 | model | after-action | yes | Same-author matching edges disappear from the pending diff; foreign matching text has its own ID/author while the original deletion stays unchanged | Same-author matching text remains duplicated, or foreign input mutates/silently rejects another author's proposal | package | test: packages/plitejs/test/authored-self-edit-contract.test.ts#keeps a matching deletion prefix typed by another author separate | pass: authors, IDs, revision, projected text, and before/after parts match |
| SR-01 | dom-native | after-action | no | N/A: canonical owner behavior is fully expressible without DOM event routing | N/A: the screenshot reflects canonical authored state rather than a native-input fault | N/A: package owner is sufficient | N/A: package owner is sufficient | N/A: package owner is sufficient |
| SR-01 | pointer-feedback | after-action | no | N/A: no pointer or hover behavior is claimed | N/A: no pointer affordance participates in authorship resolution | N/A: no pointer proof needed | N/A: no pointer proof needed | N/A: no pointer proof needed |
| SR-01 | focus | follow-up | no | N/A: no focus transfer is claimed | N/A: focus cannot change the authenticated author boundary | N/A: no focus proof needed | N/A: no focus proof needed | N/A: no focus proof needed |
| SR-01 | popup | after-action | no | N/A: no popup behavior is claimed | N/A: discussion display is outside canonical reconciliation | N/A: no popup proof needed | N/A: no popup proof needed | N/A: no popup proof needed |
| SR-01 | geometry-paint | after-action | no | N/A: the red/green paint faithfully represents two canonical authors | N/A: no stale or duplicate paint exists independently of model state | N/A: no pixel proof needed | N/A: no pixel proof needed | N/A: no pixel proof needed |
| SR-01 | subscription-lifecycle | after-action | no | N/A: no subscription source changed | N/A: package reads canonical snapshots directly | N/A: no lifecycle proof needed | N/A: no lifecycle proof needed | N/A: no lifecycle proof needed |
| SR-01 | runtime-errors | after-action | yes | Prefix, suffix, full, mismatch, author switch, and review decisions complete with available details | Resolver throws or leaves unavailable review parts | package | test: packages/plitejs/test/authored-self-edit-contract.test.ts#keeps a matching deletion prefix typed by another author separate | pass: 44 focused and 364 partition tests complete without errors |
| SR-01 | follow-up-input | follow-up | yes | Rejecting Alice's insertion leaves Bob's deletion pending; rejecting Bob then restores the original text | One decision erases/corrupts the other contribution | package | test: packages/plitejs/test/authored-self-edit-contract.test.ts#keeps a matching deletion prefix typed by another author separate | pass: both decisions apply independently and restore the expected projections |

Failed fix history:
| Case ID | Attempt | Failure signal | Failure kind | Prior claim invalidated | Regression repair | Workflow test | Architecture trigger | Best API / layer plan | Resume state |
|---|---|---|---|---|---|---|---|---|---|
| none | 0 | N/A: no claimed fix failed | N/A: no failed fix | N/A: no prior claim invalidated | N/A: no workflow repair | N/A: no workflow repair | N/A: no architecture trigger | N/A: no escalation | N/A: no resume state |

Architecture pressure:
| Case ID | Failed fix count | Triggers | Verdict | Best API | Layer plan | Proof |
|---|---|---|---|---|---|---|
| SR-01 | 0 | none: no architecture trigger | patch | N/A: no public API or architecture change | N/A: existing authored substrate is the canonical owner | pass: audit found no product patch; only coverage changed |

Proof-host readiness:
| Case ID | Source owner | Runner / route / host | Freshness evidence | Generated/export boundary | Result |
|---|---|---|---|---|---|
| SR-01 | Plite authored state and resolver | Source-first package test runner plus homepage fixture source inspection | Final test bytes imported directly; existing source owner unchanged | No generated source; registry source did not change | pass: final owner test and partition observe current bytes |

Patch delegation:
| Case ID | Red test | Allowed owner/files | Required proof/stability | Patch return evidence | Result |
|---|---|---|---|---|---|
| SR-01 | unit-red: not applicable because candidate behavior passed the audit | `packages/plitejs/test/authored-self-edit-contract.test.ts` and this plan | Focused test, authored partition, lint/typecheck, three retry-free repeats | Same/foreign author IDs, review parts, parent revision, and independent review sequence | pass: test-only coverage; production remained unchanged |

Proof receipts:
| Case ID | Attempt | Claim | Command | Result | Ref | Input digest | Input count | Inputs | Host | Latest input mtime | Proof started | Proof ended | Retries | Receipt ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| SR-01 | 1 | completed | "pnpm" "--filter" "plitejs" "exec" "bun" "test" "test/authored-self-edit-contract.test.ts" | pass: exit 0 in 819ms | dirty:5a899edcbea2c31f1bd34dc575c9dd3860c577d0 | sha256:6263ac452fe013d19dbb6c043fcda26a7486dd65cb92cebf714344ed339c420a | 3 | apps/www/src/registry/examples/playground-demo.tsx,packages/plitejs/src/authored/steps.ts,packages/plitejs/test/authored-self-edit-contract.test.ts | host:none - package owner test | 2026-09-14T16:40:20.024Z | 2026-09-14T16:41:10.368Z | 2026-09-14T16:41:11.188Z | 0 | sha256:9be347faac93ad61730bddea34c65ca3988711d240e1fbfc8aebe63e22a6df69 |

Affected corpus replay:
| Owner | Affected cases | Pre-edit baseline | Last owner edit | Combined command | Receipt input digest | Result |
|---|---|---|---|---|---|---|
| Plite authored self-edit contract | SR-01 | pass: 40 tests before coverage edit | 2026-09-14T16:40:20.024Z | `pnpm --filter plitejs exec bun test test/authored-self-edit-contract.test.ts` | sha256:6263ac452fe013d19dbb6c043fcda26a7486dd65cb92cebf714344ed339c420a | pass: 44 final focused tests; 364 authored partition tests and 132 retry-free stability tests also pass |

Gate failure closure:
| Gate | Failure signal | Classification | Resolution | Final rerun |
|---|---|---|---|---|
| none | N/A: no requested gate failed | N/A: no gate failure | N/A: no repair required | N/A: no failed gate to rerun |

Stability:
| Case ID | Executable proof / host | Required runs | Results | Retry count | Decision |
|---|---|---|---|---|---|
| SR-01 | `authored-self-edit-contract.test.ts` package runner | 3 | pass: 132/132 tests across three retry-free runs | 0 | keep coverage |

Packet decisions:
| Case | Executable evidence | Decision | Claim width | Residual risk | Next owner |
|---|---|---|---|---|---|
| SR-01 | 44 focused tests, 364 partition tests, author fixture inspection, official Google model | keep | Plite authenticated proposal reconciliation and homepage fixture explanation | Direct two-account Google gesture was unavailable; no claim beyond the documented model | none: complete |

Methodology deltas:
| Case | Miss or owner checked | Decision | Durable owner/change | Focused proof | Trigger/result |
|---|---|---|---|---|---|
| SR-01 | Checked whether the reported duplicate markup was paint, grouping, or canonical authorship | no-change | Existing Regression method correctly forced author/oracle resolution; durable behavior added only to the package test | pass: focused, partition, checks, receipt, and stability | No failed-fix trigger; product source stayed unchanged |

Workflow slowdowns:
| Step / command | Owner | Elapsed / expected | Cause | Evidence value | Repair/result |
|---|---|---|---|---|---|
| Direct other-author Google probe | external credential boundary | one bounded attempt | Second signed-in account lacks access to the authorized document | Established the proof limit; no behavior claim | Used official Google suggestion model and preserved permissions |

Findings:

- The homepage deletion is Bob's; the runtime resets to Alice before interaction.
- Plite already minimizes matching prefix/suffix text for the same author. The reported green insertion is a separate Alice proposal beside Bob's unchanged deletion.
- Collapsing Alice's text into Bob's deletion would silently perform a partial review decision and destroy independent attribution. Google models different-user nested edits with distinct suggestion IDs, and suggestion deletion is author-scoped.

Timeline:

- 2026-09-14: resolved the author boundary, added the complete owner matrix, and passed focused, partition, source-check, stability, and receipt proof.

Decisions and tradeoffs:

- Keep foreign proposals separate even when their visible text matches. Use explicit accept/reject for review decisions.
- Minimize matching text inside the same author's proposal so the remaining redline shows only the actual difference.

Review fixes:

- N/A: no PR or explicit review was requested; source checks and the complete affected partition passed.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|---|---|---|---|
| Pre-implementation semantic plan placeholders | 1 | Replace the generated shell with the resolved audit packet | Final semantic validator passes |

Verification evidence:

- `pnpm --filter plitejs exec bun test test/authored-self-edit-contract.test.ts` — 44 pass.
- `pnpm --filter plitejs test:partition:authored` — 364 pass.
- `pnpm --filter plitejs exec bun test test/authored-self-edit-contract.test.ts --rerun-each 3` — 132 pass.
- `pnpm --filter plitejs lint:partition:authored` — pass.
- `pnpm --filter plitejs typecheck:partition:authored` — pass.
- Proof receipt `sha256:9be347faac93ad61730bddea34c65ca3988711d240e1fbfc8aebe63e22a6df69` binds the final test, authored resolver owner, and homepage fixture.

Final handoff:

- Executable coverage: own prefix, suffix, full, mismatch, foreign matching prefix, stable identities, review parts, and independent rejection.
- Changed files: package owner contract and this plan; no production source.
- Design decision: authenticated author ownership beats visual text equality.
- Local state: completed on dirty base `5a899edcbea2c31f1bd34dc575c9dd3860c577d0`; uncommitted and unpushed.
- Residual risk: direct two-account Google UI behavior remains unobserved because permission changes were outside scope.

Reboot status:
| Question | Answer |
|---|---|
| Where am I? | Completed local resolver audit and coverage |
| Where am I going? | Final handoff |
| What is the goal? | Preserve standard author-scoped suggestion resolution with durable edge coverage |
| What have I learned? | The screenshot crosses Bob-to-Alice ownership; same-author minimization already works |
| What have I done? | Added and verified the complete owner-level matrix |

Open risks:

- Direct Google Docs behavior with two authenticated authors was not replayed. Google's official model supports the preserved distinct-ID behavior, and no Google permissions were changed to force the probe.
