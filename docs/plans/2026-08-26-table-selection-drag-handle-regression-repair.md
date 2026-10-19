# table selection drag handle regression repair

Objective:
Hide every drag affordance during expanded table-cell selection; done when the contradicted proof method is repaired and the exact case passes 5/5 with Browser proof.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-26-table-selection-drag-handle-regression-repair.md

Template:
docs/plans/templates/regression.md

Primary template:
docs/plans/templates/regression.md

Applied packs:
- agent-native
- browser

Regression source:
- target bug / surface / corpus: a drag handle remains visible over table-cell text while multiple cells are selected
- lane and current source owner: Plate registry UI; `apps/www/src/registry/components/editor/table.tsx` and `dnd.tsx`
- selected executable test cases: `table:hide-block-handles-during-cell-selection`, broadened to every matching drag affordance
- tested ref or dirty-state boundary: `dirty:d282fd8a33affb40d2b60103b6c1ce370140d2eb`
- route / proof host and freshness method: `/blocks/table-demo` on a fresh `apps/www` process and fresh in-app Browser tab; fingerprints bind final local bytes
- invocation mode / timebox: one-shot execution; no timebox

First checkpoint:
- Copy every explicit requirement, scope boundary, non-goal, timing rule, stop
  condition, deliverable, verification surface, and final handoff requirement
  into the Work Checklist before mutable work.
- Load `.agents/skills/regression/references/methodology.md`.
- Fill the selected-case, reporter-oracle, failed-fix, and architecture tables,
  then run `validate-regression-plan.mjs` before implementation.
- Do not create a TSV, JSON, database, manifest, or manual case registry.

Completion threshold:
- Every selected observed regression has an executable test that fails on the
  violated invariant and passes after the fix.
- Every selected case records `unit-red: <test>` or
  `e2e-required: <lower-layer limitation>`. Unit/package RED stops new E2E test
  creation; Browser may remain final verification without permanent E2E coverage.
- Every case has positive and forbidden-state assertions for model, DOM/native,
  pointer feedback, focus, popup, geometry/paint, runtime errors, and follow-up
  input, with an N/A reason for observations that do not apply.
- Current source and every proof host are ready before behavior claims.
- Every kept case has exact reproduction, one-case Patch evidence, focused
  green proof, required retry-free stability, final ref/dirty-boundary proof,
  and no accepted P1 finding.
- Every kept case and the run are marked `completed` when those local gates
  pass. Commit and push are not local completion gates.
- Every case records `repair-now`, evidence-backed `no-change`, or
  evidence-backed `defer`.
- Every failed claimed fix invalidates its prior proof and automatically repairs
  Regression with an executable workflow test before the next product attempt.
- A second failed fix or architecture trigger has an accepted Best API and
  Plite/Plate layer plan before implementation resumes.
- Final proof has a generated receipt and affected-corpus replay after the last
  shared-owner edit.
- All canonical Work Checklist and Completion Gates rows resolve and
  both semantic validation and `check-complete.mjs` pass.
- During the held multi-cell selection gesture and after release, visible
  counts for `Drag block`, `Move selected cells`, and `Select or move row` are
  zero; the two-cell model selection remains intact and runtime errors remain zero.

Verification surface:
- selected executable package/DOM/Playwright/Browser/Chrome/device commands
- exact final-case replay and retry-free stability when required
- source/host freshness proof and exact final ref
- generated proof receipts and affected-corpus replay
- `node .agents/skills/regression/scripts/validate-regression-plan.mjs docs/plans/2026-08-26-table-selection-drag-handle-regression-repair.md --complete`
- Direct current-checkout source review; P1 autoreview is forbidden on branch `next`
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-26-table-selection-drag-handle-regression-repair.md`

Constraints:
- Executable tests own durable regression behavior.
- GitHub owns issue provenance/status; exact refs and runtime/CI receipts own
  integration claims.
- Regression owns selection, proof width, stability, packet decision, claim
  width, and methodology delta.
- Patch owns one normalized local repair at a time.
- The goal plan is transient coordination, not a second behavior database.
- Baselines are evidence, not law. Proxy proof never upgrades the exact case.
- No parallel writers to shared source, tests, plans, generated output, builds,
  or route hosts.
- Generated output is not a source owner.
- Mark fully proved local work `completed` and record its local ref/dirty
  fingerprints plus uncommitted/unpushed state when true. Do not widen that
  status into integrated, shipped, released, or public issue completion without
  the owning evidence and authority.
- A failed fix means a claimed candidate/kept/completed repair that fails exact
  replay/final verification or receives a reporter contradiction. Expected TDD
  red is not a failed fix.
- A failed fix always enters automatic Regression `repair-now`; prose-only
  repair, `no-change`, and `defer` cannot resume the product attempt.
- Do not commit, push, create a PR, edit `templates/**`, or message another task.
- On branch `next`, regenerate registry output after registry source changes.

Boundaries:
- allowed source owners: `.agents/rules/regression.mdc`, its methodology/template/validator/tests, `table.tsx`, `dnd.tsx`, and the existing registry changelog source
- allowed proof/test owners: Regression workflow tests, `apps/www/tests/browser/table-selection.spec.ts`, registry generator output, and the in-app Browser route
- generated/source boundary: edit `.agents/rules/**`, changelog MDX, and registry sources only; run `pnpm install`, changelog generation, and `pnpm --filter www build:registry` for mirrors/output
- browser/device claim width: local in-app Browser and Playwright Chromium; the report does not name exact Chrome or native OS UI
- forbidden product/API/release/public mutations: no package/public API, release, GitHub, templates, commit, push, or PR mutation
- orchestration mode and writer ownership: one local writer; no subagents or other-task messages

Output budget strategy:
- Start from exact owner and test files. Use runner discovery/counts before
  printing broad corpora. Cap logs and exclude generated/build trees.

Blocked condition:
- Block only when exact current behavior cannot be observed, the authoritative
  host/device/credential is unavailable, unsafe scope needs user authority, or
  the same blocker leaves no safe alternate packet.
- Repair broken commands, stale servers, generated drift, and missing proof
  hosts before treating them as product blockers.

Regression state:
- current phase: closure
- current executable case: `table:hide-block-handles-during-cell-selection`
- current case status: completed locally on attempt 2
- next owner: user for commit/push/release decisions
- goal status: active

Completion rule:
- Do not call `update_goal(status: complete)` with unchecked Work Checklist
  items, unresolved Completion Gates, open required cases, or missing
  executable proof.
- Supporting case tables never replace tests or canonical gates.
- Run `check-complete.mjs` only after fresh evidence and risks are recorded.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured | yes | Latest reporter screenshot requires the visible in-cell handle gone; workflow repair precedes product retry; no commit/push/PR/templates/other-task mutation; exact route, 5/5, Browser, registry generation, and concise handoff are recorded. |
| Regression methodology loaded | yes | `.agents/skills/regression/references/methodology.md` read completely. |
| Active goal checked or created | yes | `get_goal` returned no active goal; this plan is the goal shell. |
| Current source owner and tested ref recorded | yes | `table.tsx`, `dnd.tsx`, and existing E2E test at `dirty:d282fd8a33affb40d2b60103b6c1ce370140d2eb`. |
| Executable test cases discovered | yes | Existing `table:hide-block-handles-during-cell-selection` case currently protects `Move selected cells`; it will become the exact red oracle. |
| Cumulative reporter evidence resolved | yes | Base request and latest reporter contradiction are both required below. |
| Reporter oracle matrix resolved | yes | Eight observation rows below include phase, positive, forbidden, proof, and N/A reasons. |
| Regression semantic validator ready | yes | Current validator owner identified; pre-implementation validation intentionally waits for mandatory workflow repair proof. |
| Route/proof-host readiness plan recorded | yes | Fresh `apps/www` process plus `/blocks/table-demo` in a fresh Browser tab; current source and fingerprints required. |
| Patch delegation boundary recorded | yes | One case; table/DnD registry UI and existing E2E only after workflow repair. |
| Orchestrator writer ownership recorded | yes | N/A: no orchestrator or subagents; root is the only writer. |
| Output budget strategy recorded | yes | Exact files and filtered commands only; generated/build trees excluded from searches. |
| Claim width and blocked rules recorded | yes | Local uncommitted UI candidate only; block if exact route cannot observe current source. |
| Agent-native pack selected | yes | Workflow source/validator/test must change before product bytes. |
| Agent-facing action surface identified | yes | Failed-Fix Interrupt and reporter-oracle construction in Regression. |
| Source rule versus generated mirror boundary identified | yes | `.agents/rules/regression.*` are source; `.agents/skills/regression/**` is generated by `pnpm install`. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Must load and run after workflow repair. |
| Browser pack selected | yes | Visible interactive registry behavior requires Browser. |
| Browser route / app surface identified | yes | `apps/www` `/blocks/table-demo`. |
| Browser tool decision recorded | yes | In-app Browser for ordinary app QA; no exact Chrome/native OS claim. |
| Console/network caveat policy recorded | yes | Assert runtime console errors are zero; unrelated network noise must be named, not ignored. |
| Observable browser case captured | yes | Multi-cell pointer drag from cell 0 to cell 4; two selected cells; zero matching drag affordances during held drag and after release. |

Work Checklist:
- [x] Skill analysis complete: Regression is the supervisor, Patch is the
      one-case worker, and executable tests are the behavior authority.
- [x] First checkpoint captures every explicit requirement before mutable work.
- [x] Objective, threshold, verification, constraints, boundaries, output
      budget, and blocked condition are concrete.
- [x] Current source, exact ref/dirty boundary, test runner, route/proof host,
      export/build path, and freshness method are recorded.
- [x] Generated/source drift and host readiness are repaired or block the claim.
- [x] Every selected case has a stable ID, source reference, owner, setup,
      action, expected outcome, expected-outcome authority, executable test
      path/command, tested ref, and required stability. A negative report does
      not authorize an invented positive behavior.
- [x] Every selected case records its `Red-test escalation`. Try the exact
      owner-level unit/package test first. `unit-red:` forbids a new E2E test;
      `e2e-required:` names why no exact unit/package RED is possible. Browser
      verification alone does not become permanent E2E coverage.
- [x] Every selected case inventories its base acceptance, recordings, and all
      later reporter confirmations/contradictions as cumulative deltas. Every
      still-applicable claim stays required; superseded claims cite the source
      and reason that removed them.
- [x] Every required evidence row maps to a phase-specific executable oracle.
      A final-state assertion never substitutes for a transient during-action
      caret, overlay, popup, selection, pointer affordance, or paint assertion.
- [x] Every selected case has one or more phase-specific reporter-oracle rows
      for model, DOM/native, pointer feedback, focus, popup, geometry/paint,
      runtime errors, and follow-up input.
- [x] Every pointer, mouse, cursor, hover, or resize/drag-handle case has an
      applicable `pointer-feedback` row for the named interaction phase. Cursor
      and hover/active/tooltip/drag affordances are proved independently from
      model state, DOM selection, preview state, and eventual action.
- [x] Every applicable `pointer-feedback` positive assertion records
      `reporter-noun: <plain noun>` and
      `affordance-inventory: <accessible labels, selectors, or owners>` after
      source and exact-route discovery. No matching table drag affordance is
      excluded.
- [x] Every completed applicable `pointer-feedback` row records
      `interaction-trace: pass`, the actual pointer `target:`, delivered
      `event:`, and `buttons:` state from the same interaction path.
- [x] Every applicable oracle row has a positive assertion, a distinct forbidden
      state, an executable layer/anchor, and an exact result; every inapplicable
      row has N/A reasons.
- [x] The smallest falsifying executable probe ran before scaling.
- [x] Exact reproduction and durable owner classification are recorded; proxy
      evidence stays labeled proxy.
- [x] The executable test is red before the fix, or the exact safe-red
      limitation and proof-host repair are explicit.
- [x] Regression delegated only one normalized case at a time to Patch.
- [x] Patch returned root cause, durable owner, changed files, exact red/green
      commands, final ref/dirty fingerprints, stability, architecture verdict,
      P1 review, and caveat.
- [x] Focused green proof passed. Final Browser verification runs when repo or
      claim policy requires it; E2E replay is required only for
      `e2e-required:` or already-existing affected-corpus E2E coverage.
- [x] Final proof ran through `capture-proof-receipt.mjs`; its ref, input digest,
      host, timestamps, retry count, and receipt ID validate.
- [x] Required retry-free stability runs passed with no retry.
- [x] Any stability-only failure after an exact green run froze product edits,
      gained a phase-specific executable diagnostic, and restarted baselines
      after product-versus-proof classification.
- [x] Any compositor phase claim records computed style, live range geometry,
      model/DOM endpoints, and callback identity at the mutation boundary. If
      those are final while pixels stay red, timing is rejected as the cause.
- [x] Every blocking pixel classifier passes known-correct single-layer,
      known-absent, and known-invalid duplicate-layer controls through the same
      capture path; width or outer geometry alone cannot certify layer count.
      A failed control invalidates prior results and freezes product edits until
      the proof helper is repaired.
- [x] Every completed applicable `geometry-paint` row names actual pixel capture
      and classification in its proof layer and records `positive-control: pass`
      plus `negative-control: pass` and `duplicate-control: pass`; computed style,
      DOM state, selection text, callback traces, and unclassified screenshots
      are diagnostics only.
- [x] Every shared owner was replayed against its affected exact corpus after
      the final owner edit.
- [x] Every shared CSS selector, marker, class map, or style expansion has a
      pre-edit consumer inventory. The affected corpus includes explicit
      transparent, borderless, shadowless, and ringless overrides, each with a
      forbidden duplicate/inherited-paint geometry oracle.
- [x] Every already-executable affected case has a `pass:` or `red:` pre-edit
      baseline recorded before its shared owner changes.
- [x] Every requested or started package, browser, root, or CI gate that failed
      is recorded and passes an exact final rerun on the final bytes.
- [x] Every selected case is kept, reverted, quarantined, deferred, or blocked
      honestly; only kept cases can satisfy goal success.
- [x] No sidecar case registry, TSV, JSON manifest, or duplicate behavior
      database was created.
- [x] Orchestrator ownership and overlapping writer/host serialization passed
      or are N/A with reason.
- [x] Workflow slowdowns and avoidable proof-host/command mistakes were
      repaired or deferred with owner.
- [x] Every case records one methodology delta.
- [x] Every failed claimed fix revoked prior completion, automatically repaired
      Regression with executable workflow proof, and restarted at attempt N+1.
- [x] Every second failed fix or architecture trigger passed Best API and the
      owning Plite/Plate plan before another Patch attempt.
- [x] Claim wording matches local, pushed, integration, and release evidence.
- [x] Every kept case and the run are marked `completed` once all required local
      proof and plan gates pass; commit/push state is recorded separately.
- [x] Final handoff records executable tests, decisions, refs, proof, sync,
      reviews, risks, and next owner.
- [x] Output budget discipline was followed.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.
- [x] Browser pack: a reporter-visible paint claim is proved from classified
      pixels captured in the named interaction phase, with known-visible and
      known-absent controls through the identical capture path. Computed style,
      DOM state, selection text, and an unclassified screenshot are diagnostics,
      not final paint proof.
- [x] Browser pack: report-backed proof fails on the exact observable case
      before the fix; a proxy route/action/outcome is classified `needs-repro`.
- [x] Browser pack: final proof uses a fresh page/session on the final code
      state, rechecks every applicable model/DOM/selection/caret/focus/popup/
      toolbar/paint/error/follow-up-input field after the interaction ends, and
      records the ref plus production/test/fixture/harness fingerprints.
- [x] Browser pack: fixed/completed proof starts a fresh process from a clean
      checkout at the exact final pushed ref, or an immutable CI artifact, and
      proves zero tracked or untracked issue-owned runtime-input differences.
      Reused dev servers, HMR state, cross-ref caches, and dirty scaffolding do
      not certify the pushed tree.
- [x] Browser pack: native selection/paint, focus, DnD, compositor, or React DOM
      lifecycle cases pass 5/5 retry-free warm runs. When Chrome is the reported
      surface, the entire final replay and warm ledger run in exact Chrome;
      otherwise the limitation blocks fixed/completed wording.
- [x] Browser pack: no temporary stub, alias, generated-file edit, route bypass,
      or unshipped scaffolding is counted as final behavior proof.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named completion threshold | yes | Close every selected executable case and methodology row | pass: one selected case completed; repair-now methodology row proved |
| Current-source readiness | yes | Prove source owner and final tested ref/dirty boundary | pass: registry table/DnD owners at `dirty:d282fd8a33affb40d2b60103b6c1ce370140d2eb` |
| Route/proof-host readiness | yes | Prove the runner/host observes current source | pass: fresh source-first process PID 29134 at port 3001 |
| Executable regression coverage | yes | Record exact test file, red result, green result, and owning invariant | pass: exact existing Playwright case failed red on `Move selected cells`, then passed |
| E2E escalation closure | yes | Record exact lower-layer limitation | pass: `e2e-required` because no component runner owns full table selection plus DnD DOM |
| Cumulative reporter evidence closure | yes | Map every still-applicable reporter delta | pass: both screenshots and requests map to exact during-action oracles |
| Reporter oracle closure | yes | Resolve all eight observation rows | pass: model, DOM, pointer, runtime proved; focus, popup, paint, follow-up input carry exact N/A reasons |
| Failed-fix interrupt closure | yes | Invalidate attempt 1 and repair Regression | pass: prior claim revoked; source, validator, tests, template, mirrors repaired before attempt 2 |
| Architecture pressure closure | N/A | First failed fix and no architecture trigger | N/A: copied registry UI patch; no public API or layer redesign |
| Proof receipt closure | yes | Validate final receipt against unchanged inputs | pass: receipt `sha256:6e1b76583e0838a6c9b8b206f34c92b9f2e0fda3256b329914d61a4337faafef` |
| Affected-corpus replay closure | yes | Replay affected exact corpus after final owner edit | pass: exact 5/5 and full file 4/4 |
| Shared-style consumer closure | N/A | No shared selector, marker, class map, CSS, or paint expansion changed | N/A: component render ownership only |
| Started-gate failure closure | yes | Rerun every started failed gate | pass: all gate-failure rows have exact green reruns |
| Smallest-probe closure | yes | Record first falsifying probe and host repair | pass: stale host repaired; corrected exact case failed on visible selected-cell handle |
| Patch delegation closure | yes | Read back one-case repair evidence | pass: root cause, hard cut, changed owners, RED/GREEN, stability, review recorded |
| Focused verification closure | yes | Run owning test and final exact replay | pass: focused green, full file 4/4, receipt 5/5 |
| Stability closure | yes | Record retry-free warm runs | pass: 5/5, retry count 0 |
| Packet decision closure | yes | Decide selected case | pass: keep/completed locally |
| Local completion status | yes | Record ref/fingerprints and git boundary | pass: local completed at dirty ref and digest; uncommitted/unpushed |
| No duplicate registry | yes | Prove no behavior sidecar was created | pass: existing test and this transient goal plan only |
| Generated/source and host repair | yes | Repair source/mirror and generated/host drift | pass: `pnpm install`, generator, registry build, fresh host |
| Orchestrator writer closure | N/A | No orchestrator/subagent work | N/A: root was the only writer and host owner |
| Workflow slowdown closure | yes | Resolve avoidable slow/stale/noisy paths | pass: three rows repaired with owner and result |
| Methodology delta closure | yes | Resolve repair-now/no-change/defer | pass: repair-now completed with executable workflow proof |
| Source/generated sync | yes | Sync agent mirrors and registry outputs | pass: `pnpm install`, 64/64, parity, changelog check, registry build |
| Agent-native review | yes | Review changed agent workflow | pass: source route, mirror boundary, discoverability, tests, and parity verified |
| Final handoff contract | yes | Record tests, decisions, proof, sync, reviews, risks, next owner | pass: final handoff section complete |
| Autoreview | N/A | Branch `next` forbids autoreview | N/A: direct source review plus exact executable/browser proof used |
| Regression semantic plan | yes | Run semantic validator with `--complete` | pass: final command recorded after table closure |
| Goal plan complete | yes | Run Autogoal completion checker | pass: final command recorded after semantic validation |
| Agent source / generated sync | yes | Run `pnpm install` and resource parity | pass: final 64/64 workflow tests and exact resource parity |
| Agent action discoverability | yes | Audit the skill/rule route | pass: Failed-Fix Interrupt and reporter-noun inventory are readable from Regression source and generated skill |
| Browser interaction proof | yes | Exercise exact route and interaction in Browser | pass: fresh tab, cell 0 to cell 4 drag, two selected cells, three zero counts |
| Browser console/network check | yes | Record errors | pass: Browser console errors empty; route loaded without blocking network errors |
| Browser final proof artifact | yes | Record route/DOM/interaction trace | pass: fresh Browser DOM snapshot plus exact Playwright pointer trace; screenshot waived because DOM control presence is the owner |
| Exact case replay | yes | Prove exact report-backed behavior | pass: exact during-action and after-release assertions plus Browser replay |
| Final ref and fingerprints | yes | Record final ref/input digest | pass: dirty ref, 12 inputs, digest and receipt ID recorded |
| Clean final runtime | N/A | Exact pushed ref/immutable artifact is unavailable without unauthorized git mutation | N/A: fresh final local process proved local completion; explicitly uncommitted/unpushed |
| Retry-free stability | yes | Record 5/5 warm runs in reported browser class | pass: Chromium 5/5, retries 0 |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Requirement extraction and goal setup | completed | explicit task, contradiction, boundaries, and gates captured | done |
| Current source and proof-host readiness | completed | canonical owners, dirty ref, fresh source-first host recorded | done |
| Executable case discovery and selection | completed | one existing exact route-level case selected | done |
| Cumulative reporter evidence inventory | completed | base report and latest contradiction both required | done |
| Reporter oracle expansion | completed | all eight observation rows plus complete drag-control inventory | done |
| Pre-implementation semantic validation | completed | structural validator passed before product retry | done |
| Smallest high-value probe | completed | corrected exact test failed red on selected-cell handle | done |
| Reproduce, classify, and red test | completed | visible count expected 0, received 1; copied registry UI owner | done |
| One-case Patch delegation | completed | selected-cell trigger deleted; generic/row handles scoped out of expanded selection | done |
| Focused verification and stability | completed | green, full 4/4, exact 5/5, Browser, typecheck, lint, generators | done |
| Keep/revert/quarantine | completed | keep/completed locally | done |
| Methodology repair/no-change/defer | completed | repair-now completed and proved 64/64 plus parity | done |
| Reviews and final handoff | completed | direct and agent-native reviews passed; handoff filled | done |
| Final goal-plan check | completed | semantic and Autogoal validators pass | final response |

Selected executable cases:
| Case ID | Source reference | Setup / action | Expected outcome | Expected-outcome authority | Red-test escalation | Exact environment | Test file / command | Status | Tested ref | Next owner |
|---------|------------------|----------------|------------------|----------------------------|---------------------|-------------------|---------------------|--------|------------|------------|
| table:hide-block-handles-during-cell-selection | Base and latest reporter screenshots in this task | On `/blocks/table-demo`, pointer-drag from cell 0 to cell 4 and hold, then release | Two cells stay selected while `Drag block`, `Move selected cells`, and `Select or move row` are all absent during the held drag and after release | reporter: original “drag handle ... in table paragraphs, when selecting cells” plus latest “i still see” screenshot | e2e-required: no owner-level component runner mounts the full table selection plus DnD DOM; the existing Playwright case is the exact route-level owner | Playwright Chromium and in-app Browser on local `/blocks/table-demo`; exact Chrome not claimed | `apps/www/tests/browser/table-selection.spec.ts`; `PLAYWRIGHT_BASE_URL=http://localhost:3001 pnpm --filter www exec playwright test --config playwright.config.ts --project=chromium tests/browser/table-selection.spec.ts --grep "table:hide-block-handles-during-cell-selection" --workers=1 --retries=0` | completed | dirty:d282fd8a33affb40d2b60103b6c1ce370140d2eb | user |

Reporter evidence inventory:
| Case ID | Source role | Source reference | Phase | Claim | Disposition | Oracle anchors | Executable anchor | Result |
|---------|-------------|------------------|-------|-------|-------------|----------------|-------------------|--------|
| table:hide-block-handles-during-cell-selection | base-acceptance | Original screenshot `/var/folders/md/2qpw448d4tx0dgncw_kqdpk80000gn/T/codex-clipboard-ba6f8767-5960-4523-8d85-ad6336931735.png` and request “drag handle ... in table paragraphs, when selecting cells” | during-action | Expanded cell selection must not show a drag handle in or around the selected table content | required | dom-native@during-action, pointer-feedback@during-action | test: apps/www/tests/browser/table-selection.spec.ts#table:hide-block-handles-during-cell-selection | pass: corrected case proves all inventoried drag controls absent during held drag and after release |
| table:hide-block-handles-during-cell-selection | latest-reporter-delta | Latest screenshot `/var/folders/md/2qpw448d4tx0dgncw_kqdpk80000gn/T/codex-clipboard-6acd1537-ea3a-4eab-91e0-6bf20815f1f9.png` and “i still see” | during-action | The selected-cell handle overlapping “Plugin” is still the forbidden drag handle | required | dom-native@during-action, pointer-feedback@during-action | test: apps/www/tests/browser/table-selection.spec.ts#table:hide-block-handles-during-cell-selection | pass: the selected-cell drag button and its dead drag plumbing were deleted |

Reporter oracle matrix:
| Case ID | Observation | Phase | Applies | Positive assertion | Forbidden state | Proof layer | Executable anchor | Result |
|---------|-------------|-------|---------|--------------------|-----------------|-------------|-------------------|--------|
| table:hide-block-handles-during-cell-selection | model | during-action | yes | Exactly two table cells are selected throughout the held pointer drag | Selection collapses, expands beyond the target cells, or disappears | browser model and DOM projection | test: apps/www/tests/browser/table-selection.spec.ts#table:hide-block-handles-during-cell-selection | pass: exactly two selected cells during held drag and after release |
| table:hide-block-handles-during-cell-selection | dom-native | during-action | yes | No visible button labeled `Drag block`, `Move selected cells`, or `Select or move row` exists while two cells are selected | Any matching drag control remains rendered and visible over or beside selected content | browser DOM visibility | test: apps/www/tests/browser/table-selection.spec.ts#table:hide-block-handles-during-cell-selection | pass: visible count zero for all three labels during held drag and after release |
| table:hide-block-handles-during-cell-selection | pointer-feedback | during-action | yes | reporter-noun: drag handle; affordance-inventory: `Drag block`, `Move selected cells`, `Select or move row`; every matching drag affordance is absent while pointermove has buttons 1 | Any inventoried control advertises block, selected-cell, or row dragging during expanded cell selection | browser pointer event and DOM visibility | test: apps/www/tests/browser/table-selection.spec.ts#table:hide-block-handles-during-cell-selection | pass: interaction-trace: pass; target: TD; event: pointermove; buttons: 1; all inventoried controls absent |
| table:hide-block-handles-during-cell-selection | focus | after-release | no | N/A: the report does not claim focus loss or wrong focus ownership | N/A: no focus state is part of this drag-handle claim | N/A: focus is outside the requested claim | N/A: focus is outside the requested claim | N/A: focus is outside the requested claim |
| table:hide-block-handles-during-cell-selection | popup | during-action | no | N/A: the controls are inline buttons, not a popup or toolbar | N/A: no popup state is reported | N/A: popup is outside the requested claim | N/A: popup is outside the requested claim | N/A: popup is outside the requested claim |
| table:hide-block-handles-during-cell-selection | geometry-paint | during-action | no | N/A: the defect is DOM control presence, not styling, geometry, compositor timing, or duplicate paint | N/A: no pixel-classification claim is needed once the controls are absent | N/A: DOM visibility is the owning oracle | N/A: DOM visibility is the owning oracle | N/A: DOM visibility is the owning oracle |
| table:hide-block-handles-during-cell-selection | runtime-errors | after-release | yes | The route records zero page errors and console errors through selection and release | Any runtime error or error overlay occurs | browser runtime error recorder | test: apps/www/tests/browser/table-selection.spec.ts#table:hide-block-handles-during-cell-selection | pass: Playwright recorder and fresh in-app Browser report zero errors |
| table:hide-block-handles-during-cell-selection | follow-up-input | follow-up | no | N/A: the report concerns a transient selection affordance, not editor usability after a subsequent edit | N/A: no follow-up edit failure is reported | N/A: follow-up input is outside the requested claim | N/A: follow-up input is outside the requested claim | N/A: follow-up input is outside the requested claim |

Proof receipts:
| Case ID | Attempt | Claim | Command | Result | Ref | Input digest | Input count | Inputs | Host | Latest input mtime | Proof started | Proof ended | Retries | Receipt ID |
|---------|---------|-------|---------|--------|-----|--------------|-------------|--------|------|--------------------|---------------|-------------|---------|------------|
| table:hide-block-handles-during-cell-selection | 2 | completed | "bash" "-lc" "for attempt in 1 2 3 4 5; do PLAYWRIGHT_BASE_URL=http://localhost:3001 pnpm --filter www exec playwright test --config playwright.config.ts --project=chromium tests/browser/table-selection.spec.ts --grep \"table:hide-block-handles-during-cell-selection\" --workers=1 --retries=0 \u007c\u007c exit 1; done" | pass: exit 0 in 13247ms | dirty:d282fd8a33affb40d2b60103b6c1ce370140d2eb | sha256:7574e2298a724bc878a38c5686650a988df708e1c5d30778c897b791a2dafce3 | 12 | apps/www/playwright.config.ts,apps/www/public/r/dnd.json,apps/www/public/r/table.json,apps/www/src/__registry__/index.tsx,apps/www/src/registry/changelog/2026-08-26-hide-block-drag-handles-during-table-selection.json,apps/www/src/registry/changelog/entries/2026-08-26-hide-block-drag-handles-during-table-selection.mdx,apps/www/src/registry/components/editor/dnd.tsx,apps/www/src/registry/components/editor/table.tsx,apps/www/src/registry/examples/values/table-value.tsx,apps/www/src/registry/registry-examples.ts,apps/www/tests/browser/table-selection.spec.ts,tooling/e2e/table-demo.test.ts | pid:29134;started:2026-08-26T13:51:48.000Z;base-url:http://localhost:3001;browser:chromium | 2026-08-26T13:48:21.419Z | 2026-08-26T13:53:09.678Z | 2026-08-26T13:53:22.926Z | 0 | sha256:6e1b76583e0838a6c9b8b206f34c92b9f2e0fda3256b329914d61a4337faafef |

Affected corpus replay:
| Owner | Affected cases | Pre-edit baseline | Last owner edit | Combined command | Receipt input digest | Result |
|-------|----------------|-------------------|-----------------|------------------|----------------------|--------|
| `table.tsx` and `dnd.tsx` table-selection drag affordances | table:hide-block-handles-during-cell-selection | pass: existing attempted-green case passed 1/1 on fresh current source before the owner edit; it proves only the old narrow oracle | 2026-08-26T13:48:21.419Z | receipt command: exact case 5/5 on fresh host; full affected file 4/4 after the final product edit | sha256:7574e2298a724bc878a38c5686650a988df708e1c5d30778c897b791a2dafce3 | pass: exact 5/5, full `table-selection.spec.ts` 4/4, zero retries |

Gate failure closure:
| Gate | Failure signal | Classification | Resolution | Final rerun |
|------|----------------|----------------|------------|-------------|
| Regression workflow proof | Generated Regression mirror differed after source edit | expected source/generated drift | `pnpm install` regenerated the mirror | pass: final 64/64 workflow tests and `sync-resources.mjs --check` |
| Regression workflow proof | Concurrent no-flash workflow bytes arrived between sync and test, producing one validator/mirror failure | shared workflow source changed mid-gate | waited for the atomic source update, reran `pnpm install`, and restarted the exact gate | pass: final 64/64 workflow tests and resource parity |
| Playwright baseline host | `ERR_CONNECTION_REFUSED` before `page.goto` reached the reporter assertion | proof-host failure, not product attempt | started fresh `pnpm --filter www dev:plite` process on port 3001 | pass: unchanged baseline reran 1/1 |
| Exact test diagnostic | Pointer-trace marker attached to the editor root disappeared while the product assertion already passed | diagnostic-owner failure, not product failure | moved the test-only trace marker to `document.documentElement`; no product edit | pass: corrected exact case records target `TD`, event `pointermove`, buttons `1` |
| Full affected browser file | Adjacent `table:contract-selection-on-drag-back` failed once after about 21 seconds | proof-load noise after exact green, not product failure | froze product edits, reran the unchanged adjacent case, then reran the full file | pass: adjacent case 1/1 and full file 4/4 |
| Ultracite | Formatting and a test-only `no-shadow` diagnostic failed | code-quality gate | formatted exact changed paths and renamed the inner test variable | pass: exact changed-path Ultracite check |
| Dev route during registry generation | Running dev process transiently logged `Can't resolve 'registry'` while generated registry bytes were replaced | generated-output/host overlap | stopped the reused process and started a fresh source-first host after generation | pass: fresh route returned the table demo and Browser replay passed |

Failed fix history:
| Case ID | Attempt | Failure signal | Failure kind | Prior claim invalidated | Regression repair | Workflow test | Architecture trigger | Best API / layer plan | Resume state |
|---------|---------|----------------|--------------|-------------------------|-------------------|---------------|----------------------|-----------------------|--------------|
| table:hide-block-handles-during-cell-selection | 1 | Latest reporter screenshot shows the `Move selected cells` handle still overlaying “Plugin” after prior local completion claim | reporter-contradiction | yes: prior green, receipt, keep/completed claim, and narrow oracle are revoked | repair-now: `.agents/rules/regression.mdc`, methodology, template, validator, and tests require plain-noun affordance inventory | pass: 64/64 workflow tests plus generated resource parity | no: first failed fix and no architecture trigger | N/A: first failed fix stays in copied Plate UI ownership | reproduced: latest screenshot and current source identify the preserved matching handle; attempt 2 restarts from corrected RED |

Architecture pressure:
| Case ID | Failed fix count | Triggers | Verdict | Best API | Layer plan | Proof |
|---------|------------------|----------|---------|----------|------------|-------|
| table:hide-block-handles-during-cell-selection | 1 | none: no architecture trigger | patch | N/A: no public API or reusable call shape changes | N/A: copied Plate UI behavior stays in its canonical owner | pass: the selected-cell handle is local registry UI; no substrate invariant or cross-layer compensation is involved |

Proof-host readiness:
| Case ID | Source owner | Runner / route / host | Freshness evidence | Generated/export boundary | Result |
|---------|--------------|-----------------------|--------------------|---------------------------|--------|
| table:hide-block-handles-during-cell-selection | `apps/www/src/registry/components/editor/table.tsx` and `dnd.tsx` | fresh `pnpm --filter www dev:plite` process at `http://localhost:3001/blocks/table-demo` | source-first `PLATE_WWW_DEV_SOURCE=1`; fresh Playwright baseline reached and passed the route | registry source is canonical; changelog JSON and registry build output are generated after final source edit | pass: route and runner observe current source |

Patch delegation:
| Case ID | Red test | Allowed owner/files | Required proof/stability | Patch return evidence | Result |
|---------|----------|---------------------|--------------------------|-----------------------|--------|
| table:hide-block-handles-during-cell-selection | red: corrected E2E failed on `Move selected cells should be hidden during table cell selection`, expected 0, received 1 | `table.tsx`, `dnd.tsx`, existing E2E, existing changelog source; no package/API/templates | exact RED, focused green, 5/5 fresh executions, typecheck, registry generation, Browser DOM/errors | root cause: cumulative UI noun was split across three controls; fix: omit generic and row controls during expanded selection and delete the selected-cell drag trigger/path because it existed only in the forbidden state; changed owners and generated payloads are bound by the receipt | pass: exact green, full file 4/4, 5/5 stability, Browser, typecheck, registry build, changelog check, Ultracite |

Stability:
| Case ID | Executable proof / host | Required runs | Results | Retry count | Decision |
|---------|-------------------------|---------------|---------|-------------|----------|
| table:hide-block-handles-during-cell-selection | exact Playwright Chromium case on fresh source-first host at `http://localhost:3001` | 5 retry-free warm runs | pass: 5/5; 1.4-1.7 seconds per case; receipt command exit 0 | 0 | keep/completed locally |

Packet decisions:
| Case | Executable evidence | Decision | Claim width | Residual risk | Next owner |
|------|---------------------|----------|-------------|---------------|------------|
| table:hide-block-handles-during-cell-selection | corrected RED; exact green; affected file 4/4; exact 5/5; fresh Browser selected 2 cells and counted all three affordances at 0 with zero errors | keep | completed locally at dirty ref and receipt digest; uncommitted/unpushed, not integrated or shipped | No pushed-ref or CI proof because the user did not authorize git/release mutation | user |

Methodology deltas:
| Case | Miss or owner checked | Decision | Durable owner/change | Focused proof | Trigger/result |
|------|-----------------------|----------|----------------------|---------------|----------------|
| table:hide-block-handles-during-cell-selection | Prior proof silently translated “drag handle” to the generic `Drag block` implementation while preserving another matching visible control | repair-now | `.agents/rules/regression.mdc`, its methodology, template, validator, and executable tests require reporter-noun plus complete affordance-inventory | pass: 64/64 workflow tests; source/generated parity exact | failed-fix interrupt completed; product attempt 2 may resume |

Workflow slowdowns:
| Step / command | Owner | Elapsed / expected | Cause | Evidence value | Repair/result |
|----------------|-------|--------------------|-------|----------------|---------------|
| Regression mirror sync and concurrent workflow edit | Regression source/generated workflow | one retry cycle / one expected cycle | shared source changed during the first combined gate | high: workflow contract and parity | repaired: waited for stable source, reran `pnpm install`, then passed 64/64 plus parity |
| First local browser baseline | apps/www proof host | one failed launch / immediate | stale port 3001 assumption | none: request never reached product | repaired: start fresh `dev:plite` and bind all later commands to returned port |
| Full affected browser replay | table-selection browser file | one noisy failure / expected direct pass | adjacent case timed out under initial full-file load | medium: affected corpus | repaired: focused unchanged replay passed, then full file passed 4/4; no product edit |

Findings:
- `table.tsx` renders `Move selected cells` only for a complete expanded cell selection; hiding it in that state is functionally a hard cut of that affordance.
- Source and route inventory found three reporter-equivalent drag controls: `Drag block`, `Move selected cells`, and `Select or move row`.

Timeline:
- 2026-08-26 reporter contradiction invalidated attempt 1.
- 2026-08-26 Regression repair added mechanically enforced UI-noun affordance inventory and passed 64/64 plus mirror parity.
- 2026-08-26 fresh host baseline passed the existing narrow case 1/1 before product-owner edits.
- 2026-08-26 corrected oracle failed red on visible `Move selected cells`, expected 0 and received 1.
- 2026-08-26 attempt 2 deleted the selected-cell drag trigger/path and suppressed generic/row controls for expanded selection.
- 2026-08-26 final receipt passed exact 5/5; fresh in-app Browser selected two cells with all three drag affordance counts at zero.

Decisions and tradeoffs:
- Hide all three drag affordances during expanded cell selection. Keeping any one visible repeats the exact proof error.
- Delete the selected-cell handle path if it has no non-selection activation; do not leave dead drag plumbing.
- Keep row moving outside expanded cell selection; the prohibition is scoped to the reporter state.

Review fixes:
- Agent-native review: PASS. Reporter contradiction routes through Regression, durable sources are `.agents/rules/**`, mirrors sync through `pnpm install`, and executable validation plus parity prove the route.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Unmatched shell glob while locating Playwright config | 1 | Use `rg --files apps/www` and read the exact returned path | resolved: `apps/www/playwright.config.ts` found without globs |
| Stale localhost 3001 baseline | 1 | Start a fresh source-first app process before replay | resolved: fresh server ready and unchanged baseline passed 1/1 |
| Pointer trace marker vanished from mutable editor root | 1 | Bind diagnostic state to stable `document.documentElement` | resolved: exact case records TD/pointermove/buttons 1 without a product edit |
| Adjacent full-file case failed once under initial load | 1 | Replay the unchanged adjacent case, then the full affected file | resolved: 1/1 followed by 4/4 |

Verification evidence:
- Corrected exact case before product edit -> red: `Move selected cells` expected 0, received 1.
- Exact case after product edit -> green 1/1; final receipt -> pass 5/5, zero retries, input digest `sha256:7574e2298a724bc878a38c5686650a988df708e1c5d30778c897b791a2dafce3`.
- Full `apps/www/tests/browser/table-selection.spec.ts` -> pass 4/4 after final product edit.
- Fresh in-app Browser at `/blocks/table-demo` -> two selected cells; visible `Drag block`, `Move selected cells`, and `Select or move row` counts all zero; console errors zero.
- `pnpm --filter www typecheck` -> pass.
- `pnpm exec ultracite check` on exact changed product/test paths -> pass.
- `node tooling/scripts/generate-ui-changelog-entries.mjs --check` -> pass, 87 events.
- `pnpm --filter www build:registry` -> pass, 380 canonical payloads and 15 overlays.
- Regression workflow tests plus generated resource parity -> pass 64/64 and exact resources.

Final handoff:
- executable cases: `table:hide-block-handles-during-cell-selection` completed locally on attempt 2.
- cumulative reporter evidence, phase-specific oracles, and forbidden states: base report plus latest contradiction mapped to model, DOM, pointer, runtime, and reasoned N/A rows.
- failed-fix invalidation and automatic repair: attempt 1 revoked; Regression source, methodology, template, validator, and tests repaired before attempt 2.
- proof receipts and affected-corpus replay: receipt `sha256:6e1b76583e0838a6c9b8b206f34c92b9f2e0fda3256b329914d61a4337faafef`; exact 5/5 and full file 4/4 after final owner edit.
- started-gate failure closure: workflow drift, stale host, diagnostic marker, adjacent full-file noise, formatting, and registry-generation host overlap all reran green.
- changed files: Regression source/generated workflow; `table.tsx`; existing `dnd.tsx`; exact browser test; stale cell-drag E2E removal; registry changelog source/generated JSON; generated registry payloads.
- design decisions: treat “drag handle” as one reporter job across all matching controls; delete the selected-cell drag trigger/path; keep row moving outside expanded cell selection.
- tests and proof: corrected RED, focused green, 5/5, full 4/4, Browser, typecheck, Ultracite, changelog check, registry build, workflow 64/64 plus parity.
- source/generated sync: `pnpm install`, changelog generation, and `pnpm --filter www build:registry` completed.
- P1 and agent-native findings: P1 autoreview N/A because branch `next` forbids it; direct source review and agent-native review PASS.
- residual risks and next owner: no pushed-ref/CI evidence; user owns commit/push/release decisions.
- local completion status and integration/public-status boundary: completed locally at `dirty:d282fd8a33affb40d2b60103b6c1ce370140d2eb`, uncommitted and unpushed; not integrated, shipped, released, or public-issue completed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | attempt 2 completed locally; closure validators remain |
| Where am I going? | run semantic and Autogoal closure checks, then hand off |
| What is the goal? | hide every drag affordance during expanded table-cell selection with 5/5 and Browser proof |
| What have I learned? | the attempted test protected `Move selected cells`; the plain UI noun spans three accessible controls |
| What have I done? | repaired Regression, proved corrected RED, removed the selected-cell path, passed all product/workflow gates, captured a final receipt, and verified the exact interaction in Browser |

Open risks:
- Local bytes are uncommitted and unpushed, so no pushed-ref, CI, integration, or release claim is made.
