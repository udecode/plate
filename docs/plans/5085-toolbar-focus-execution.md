# 5085 toolbar focus execution

Objective:
Complete #5085 Comment and Turn Into toolbar regressions locally; done when
exact cases pass 5/5 in exact Chrome with receipts.

Flow mode:
one-shot execution

Goal plan:
docs/plans/5085-toolbar-focus-execution.md

Template:
docs/plans/templates/regression.md

Primary template:
docs/plans/templates/regression.md

Applied packs:
- browser

Regression source:
- target bug / surface / corpus: issue #5085 residual non-mark floating-toolbar controls
- lane and current source owner: Plate copied registry `toolbar.tsx`
- selected executable test cases: `plate-5085-comment-control` and
  `plate-5085-turn-into-control`
- tested ref or dirty-state boundary: base commit
  `2b206974844c62c487337da12733293db10f674b`; final dirty fingerprints required
- route / proof host and freshness method: fresh source-built `apps/www`
  `/blocks/playground`; Browser for normal QA, then attested installed Google
  Chrome for the complete retry-free final replay
- invocation mode / timebox: one-shot accepted-plan execution; no timebox

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
- Every case has positive and forbidden-state assertions for model, DOM/native,
  focus, popup, geometry/paint, runtime errors, and follow-up input, with an N/A
  reason for observations that do not apply.
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

Verification surface:
- `apps/www/src/registry/components/editor/toolbar.spec.tsx`
- `apps/www/src/registry/components/editor/mark-toolbar-button.spec.tsx`
- `tooling/e2e/floating-toolbar.test.ts` Comment, Turn Into, and affected Bold rows
- focused registry tests and `apps/www` source-first typecheck
- Browser route QA and exact installed Google Chrome 5/5 retry-free proof
- exact final-case replay and retry-free stability when required
- source/host freshness proof and exact final ref
- generated proof receipts and affected-corpus replay
- `node .agents/skills/regression/scripts/validate-regression-plan.mjs docs/plans/5085-toolbar-focus-execution.md --complete`
- Autoreview: N/A because the user explicitly forbids it in this session
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5085-toolbar-focus-execution.md`

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
- Execute only the accepted #5085 slices from
  `docs/plans/5085-5088-toolbar-marquee-ownership.md`; #5088 and #5070 remain
  separate packets.
- Use the best long-term shared toolbar owner. Do not add Comment- or Turn
  Into-specific focus workarounds and do not change Plite's correct outside-focus law.
- Do not lint and do not run Autoreview in this session.
- This agent does not commit, push, open a PR, release, close the issue, or add
  the `completed` label. Another session pushed the exact proved product/test
  bytes to `origin/next`; the GitHub comment must name that ref and say it is
  not a release claim.

Boundaries:
- allowed source owners: modern copied registry toolbar primitives and their
  non-classic prevent-only consumers under `apps/www/src/registry/components/editor`
- allowed proof/test owners: focused registry specs,
  `tooling/e2e/floating-toolbar.test.ts`, and exact-browser receipt commands
- generated/source boundary: source only; never edit templates or registry build output
- browser/device claim width: `/blocks/playground` real-pointer selection and
  control activation in Browser plus exact installed Chrome
- forbidden product/API/release/public mutations: no Plite change, no classic
  parity work, no #5088/#5070 product work, no commit/push/PR/release/close/label
- orchestration mode and writer ownership: current root agent only; no subagents

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
- current phase: completed
- current executable case: none; both selected cases are completed
- current case status: kept and completed on pushed ref
- next owner: GitHub issue status, then reporter confirmation
- goal status: completing

Completion rule:
- Do not call `update_goal(status: complete)` with unchecked Work Checklist
  items, unresolved Completion Gates, open required cases, or missing
  executable proof.
- Supporting case tables never replace tests or canonical gates.
- Run `check-complete.mjs` only after fresh evidence and risks are recorded.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured | yes | #5085 only; Comment and Turn Into; accepted shared-owner plan; no lint/Autoreview; local GitHub update only after exact proof; no commit/push/PR/release/close/label. |
| Regression methodology loaded | yes | `.agents/skills/regression/SKILL.md` and `references/methodology.md` read completely. |
| Active goal checked or created | yes | One-shot goal created for this exact plan and two-case threshold. |
| Current source owner and tested ref recorded | yes | Red base `2b206974844c62c487337da12733293db10f674b`; final pushed ref `5104eb406fc8550c8527d89b829d4320ebf2f368`. |
| Executable test cases discovered | yes | Two named additions in `tooling/e2e/floating-toolbar.test.ts`; existing Bold row is the affected baseline. |
| Cumulative reporter evidence resolved | yes | Issue body and every comment through Felix's `5385360833` delta retained below. |
| Reporter oracle matrix resolved | yes | Positive and forbidden phase rows for both atomic cases are filled below. |
| Regression semantic validator ready | yes | Current validator is source/generated-synced; run before product implementation and again with `--complete`. |
| Route/proof-host readiness plan recorded | yes | Fresh `apps/www` process, Browser QA, then attested exact Chrome with 5/5 retry-free replay. |
| Patch delegation boundary recorded | yes | Shared modern toolbar primitives, non-classic prevent-only consumers, and focused tests only. |
| Orchestrator writer ownership recorded | N/A | No orchestrator or subagent; root agent is the sole writer and host owner. |
| Output budget strategy recorded | yes | Exact files and focused commands only; capped logs; generated/build trees excluded. |
| Claim width and blocked rules recorded | yes | Product and proof inputs are clean on pushed `origin/next` ref `5104eb4`; issue stays open and no release claim is made. |
| Browser pack selected | yes | Browser pack materialized for visible focus/popup behavior. |
| Browser route / app surface identified | yes | `apps/www` `/blocks/playground`. |
| Browser tool decision recorded | yes | Browser first for route QA; exact Chrome for final reporter proof. |
| Console/network caveat policy recorded | yes | Record action-time console/page errors; proof-host network/navigation failures invalidate and restart the run. |
| Observable browser case captured | yes | Two case rows below include exact selection, real pointer action, outcome, environment, bad ref, and final fingerprint plan. |

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
      action, expected outcome, executable test path/command, tested ref, and
      required stability.
- [x] Every selected case inventories its base acceptance, recordings, and all
      later reporter confirmations/contradictions as cumulative deltas. Every
      still-applicable claim stays required; superseded claims cite the source
      and reason that removed them.
- [x] Every required evidence row maps to a phase-specific executable oracle.
      A final-state assertion never substitutes for a transient during-action
      caret, overlay, popup, selection, or paint assertion.
- [x] Every selected case has one or more phase-specific reporter-oracle rows
      for model, DOM/native, focus, popup, geometry/paint, runtime errors, and
      follow-up input.
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
- [x] Focused green proof and exact final fresh-host replay passed.
- [x] Final proof ran through `capture-proof-receipt.mjs`; its ref, input digest,
      host, timestamps, retry count, and receipt ID validate.
- [x] Required retry-free stability runs passed with no retry.
- [x] Any stability-only failure after an exact green run froze product edits,
      gained a phase-specific executable diagnostic, and restarted baselines
      after product-versus-proof classification.
- [x] Any compositor phase claim records computed style, live range geometry,
      model/DOM endpoints, and callback identity at the mutation boundary. If
      those are final while pixels stay red, timing is rejected as the cause.
      N/A: #5085 makes no compositor-phase claim.
- [x] Every blocking pixel classifier passes a known-positive and known-negative
      control through the same capture path; a failed control invalidates prior
      results and freezes product edits until the proof helper is repaired.
      N/A: #5085 has no blocking pixel classifier.
- [x] Every shared owner was replayed against its affected exact corpus after
      the final owner edit.
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
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.
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
| Named completion threshold | yes | Close every selected executable case and methodology row | pass: both cases completed and kept. |
| Current-source readiness | yes | Prove source owner and final tested ref/dirty boundary | pass: issue-owned inputs clean on pushed `5104eb4`. |
| Route/proof-host readiness | yes | Prove the runner/host observes current source | pass: fresh PID 77168 started after pushed ref. |
| Executable regression coverage | yes | Record exact test file, red result, green result, and owning invariant | pass: focused unit and E2E rows below. |
| Cumulative reporter evidence closure | yes | Map every still-applicable reporter delta | pass: body plus Felix 5385360833 retained. |
| Reporter oracle closure | yes | Resolve positive and forbidden states | pass: every applicable row is green. |
| Failed-fix interrupt closure | yes | Prove prior contradiction repaired Regression | pass: attempt 1 remains revoked; attempt 2 is exact. |
| Architecture pressure closure | yes | Record Best API and layer plan | pass: shared toolbar and overlay owners accepted. |
| Proof receipt closure | yes | Validate generated final receipts | pass: exact headed Chrome receipt digest `sha256:788f3cc0...`. |
| Affected-corpus replay closure | yes | Replay every shared-owner case | pass: Bold, Comment, and Turn Into. |
| Started-gate failure closure | yes | Resolve every started gate | pass or scoped N/A; Turbo upstream failure recorded below. |
| Smallest-probe closure | yes | Record first falsifying probe | pass: Bold green, two exact controls red. |
| Patch delegation closure | yes | Read back root cause/red/green/proof | pass: shared-owner return recorded below. |
| Focused verification closure | yes | Run owning tests and exact replay | pass. |
| Stability closure | yes | Record retry-free warm runs | pass: exact Chrome 5/5. |
| Packet decision closure | yes | Decide every selected case | keep both. |
| Local completion status | yes | Mark kept cases and run completed | completed on pushed ref; no release claim. |
| No duplicate registry | yes | Prove no sidecar behavior database | pass. |
| Generated/source and host repair | yes | Repair drift/host methodology | pass: reinstall, fresh host, exact ref restart. |
| Orchestrator writer closure | yes | Record writer ownership | pass: no subagents; product bytes stabilized before final proof. |
| Workflow slowdown closure | yes | Repair proof-host mistakes | pass: Chrome navigation/action serialization and headed receipt. |
| Methodology delta closure | yes | Resolve every case delta | repair-now completed before attempt 2. |
| Source/generated sync | N/A | Agent sources unchanged | N/A. |
| Agent-native review | N/A | Agent workflows unchanged | N/A. |
| Final handoff contract | yes | Record tests, decisions, proof, risks, owner | pass below. |
| Autoreview | N/A | User forbids Autoreview | N/A by explicit instruction. |
| Regression semantic plan | yes | Run complete validator | pass: `Regression plan: semantically complete.` |
| Goal plan complete | yes | Run `check-complete.mjs` | pass: final command recorded in Verification evidence. |
| Browser interaction proof | yes | Exercise exact route through Browser and Chrome | pass. |
| Browser console/network check | yes | Record action-time errors | pass: zero new action-time errors in 5/5. |
| Browser final proof artifact | yes | Record route/native proof | exact Chrome ledger and receipt; screenshot N/A because DOM/native/focus were directly inspected. |
| Exact case replay | yes | Prove all reporter fields | pass on pushed `5104eb4`. |
| Final ref and fingerprints | yes | Record ref and SHA-256 | pass below. |
| Clean final runtime | yes | Restart on exact pushed ref | pass: PID 77168 after `origin/next` resolved to `5104eb4`. |
| Retry-free stability | yes | Record exact Chrome 5/5 | pass with zero retries. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Requirement extraction and goal setup | completed | scoped plan and active goal | source/host readiness |
| Current source and proof-host readiness | completed | base `2b206974`; route warmed; copied registry owner verified | discover executable cases |
| Executable case discovery and selection | completed | two named E2E rows plus affected Bold baseline | smallest probe |
| Cumulative reporter evidence inventory | completed | issue body and all comments through 5385360833 | reporter oracle expansion |
| Reporter oracle expansion | completed | every observation and phase resolved below | semantic validation |
| Pre-implementation semantic validation | completed | exact titles created; final passing rerun follows this plan-row closure | smallest probe |
| Smallest high-value probe | completed | warm Bold passes; Comment and Turn Into fail exact UI assertions | reproduce/classify |
| Reproduce, classify, and red test | completed | Chromium: Bold pass; Comment/Turn Into red with zero proxy substitution | patch delegation |
| One-case Patch delegation | completed | shared primitive plus overlay-owner return below | verification |
| Focused verification and stability | completed | units, variants, Chromium, Browser, exact Chrome 5/5 | packet decision |
| Keep/revert/quarantine | completed | keep both cases | methodology delta |
| Methodology repair/no-change/defer | completed | prior sibling-generalization repair retained | closure |
| Reviews and final handoff | completed | Autoreview N/A by user constraint; source/proof audit complete | goal-plan check |
| Final goal-plan check | completed | semantic validator and Autogoal commands recorded at close | final response |

Selected executable cases:
| Case ID | Source reference | Setup / action | Expected outcome | Exact environment | Test file / command | Status | Tested ref | Next owner |
|---------|------------------|----------------|------------------|-------------------|---------------------|--------|------------|------------|
| plate-5085-comment-control | #5085 body and Felix comment 5385360833 | On `/blocks/playground`, select exact text `Experience a modern` with a real pointer and click visible floating Comment once | The exact target gains draft-comment marks, the main selection collapses by command design, the visible `Reply...` editor owns focus, and follow-up typing works | exact-chrome: installed Google Chrome 151 on macOS against a fresh source-built Playground | `test: tooling/e2e/floating-toolbar.test.ts#floating Comment marks the target and opens the reply editor` | completed | commit:5104eb406fc8550c8527d89b829d4320ebf2f368 | reporter confirmation; issue remains open |
| plate-5085-turn-into-control | #5085 body and Felix comment 5385360833 | On `/blocks/playground`, select exact text `Experience a modern` with a real pointer and click visible floating Turn Into once | The command selection survives, the visible Turn Into menu opens, and choosing Heading 1 transforms the intended block with valid selection | exact-chrome: installed Google Chrome 151 on macOS against a fresh source-built Playground | `test: tooling/e2e/floating-toolbar.test.ts#floating Turn Into opens without losing the selection` | completed | commit:5104eb406fc8550c8527d89b829d4320ebf2f368 | reporter confirmation; issue remains open |

Reporter evidence inventory:
| Case ID | Source role | Source reference | Phase | Claim | Disposition | Oracle anchors | Executable anchor | Result |
|---------|-------------|------------------|-------|-------|-------------|----------------|-------------------|--------|
| plate-5085-comment-control | base-acceptance | https://github.com/udecode/plate/issues/5085 | setup | Expanded `Experience a modern` selection opens the floating toolbar and remains the command target | required | dom-native@setup, focus@setup, runtime-errors@after-action | `test: tooling/e2e/floating-toolbar.test.ts#floating Bold applies the mark without losing the selection` | pass: existing Bold case proves only the route and expanded-selection setup |
| plate-5085-comment-control | latest-reporter-delta | https://github.com/udecode/plate/issues/5085#issuecomment-5385360833 | after-action | Comment dismisses the toolbar without marking the target or opening comment UI | required | model@after-action, dom-native@after-action, focus@after-action, popup@after-action, geometry-paint@after-action, follow-up-input@follow-up | `test: tooling/e2e/floating-toolbar.test.ts#floating Comment marks the target and opens the reply editor` | pass: exact Chrome 5/5 marks only the target, opens and focuses the reply editor, collapses intentionally, accepts typing, and emits no action error |
| plate-5085-turn-into-control | base-acceptance | https://github.com/udecode/plate/issues/5085 | setup | Expanded `Experience a modern` selection opens the floating toolbar and remains the command target | required | dom-native@setup, focus@setup, runtime-errors@after-action | `test: tooling/e2e/floating-toolbar.test.ts#floating Bold applies the mark without losing the selection` | pass: existing Bold case proves only the route and expanded-selection setup |
| plate-5085-turn-into-control | latest-reporter-delta | https://github.com/udecode/plate/issues/5085#issuecomment-5385360833 | after-action | Turn Into dismisses the toolbar without opening its menu | required | focus@after-action, popup@after-action, geometry-paint@after-action, follow-up-input@follow-up | `test: tooling/e2e/floating-toolbar.test.ts#floating Turn Into opens without losing the selection` | pass: exact Chrome 5/5 keeps the command selection, paints the menu, applies Heading 1, restores expanded editor focus, and emits no action error |

Reporter oracle matrix:
| Case ID | Observation | Phase | Applies | Positive assertion | Forbidden state | Proof layer | Executable anchor | Result |
|---------|-------------|-------|---------|--------------------|-----------------|-------------|-------------------|--------|
| plate-5085-comment-control | model | after-action | yes | The exact target carries draft-comment marks and the main selection collapses intentionally | No draft-marked target, marks on another range, or an expanded stale main selection | browser | `test: tooling/e2e/floating-toolbar.test.ts#floating Comment marks the target and opens the reply editor` | pass: one exact draft target and collapsed reply selection |
| plate-5085-comment-control | dom-native | setup | yes | Expanded `Experience a modern` selection is the command target | Collapsed, replaced, or out-of-editor selection before activation | browser | `test: tooling/e2e/floating-toolbar.test.ts#floating Bold applies the mark without losing the selection` | pass: existing exact Bold setup establishes this field |
| plate-5085-comment-control | dom-native | after-action | yes | The original target renders as a draft-comment leaf and the reply editable mounts | Unmarked target with no reply editable | exact-chrome | `test: tooling/e2e/floating-toolbar.test.ts#floating Comment marks the target and opens the reply editor` | pass: visible `.plite-comment` and exactly two editables |
| plate-5085-comment-control | focus | setup | yes | The expanded editor selection owns focus before activation | Body or another control owns focus before the click | browser | `test: tooling/e2e/floating-toolbar.test.ts#floating Bold applies the mark without losing the selection` | pass: existing exact Bold setup establishes this field |
| plate-5085-comment-control | focus | after-action | yes | The mounted `Reply...` editor owns focus | Browser body owns focus or an unfocused composer appears | exact-chrome | `test: tooling/e2e/floating-toolbar.test.ts#floating Comment marks the target and opens the reply editor` | pass: reply editable contains the active element 5/5 |
| plate-5085-comment-control | popup | after-action | yes | A visible Comment composer containing `Reply...` replaces the action UI | No dialog, input, or composer exists | exact-chrome | `test: tooling/e2e/floating-toolbar.test.ts#floating Comment marks the target and opens the reply editor` | pass: visible composer 5/5 |
| plate-5085-comment-control | geometry-paint | after-action | yes | Draft highlight and visible reply UI paint after activation | Floating toolbar disappears with neither draft paint nor replacement UI | exact-chrome | `test: tooling/e2e/floating-toolbar.test.ts#floating Comment marks the target and opens the reply editor` | pass: draft leaf and reply UI are visible 5/5 |
| plate-5085-comment-control | runtime-errors | after-action | yes | No reporter-path console or page error occurs | An error interrupts Comment activation | browser | `test: tooling/e2e/floating-toolbar.test.ts#floating Comment marks the target and opens the reply editor` | pass: zero new action-time errors 5/5 |
| plate-5085-comment-control | follow-up-input | follow-up | yes | Typing in the focused reply editor updates its content | Reply editor cannot accept the next intended input | browser | `test: tooling/e2e/floating-toolbar.test.ts#floating Comment marks the target and opens the reply editor` | pass: `Verified-1` through `Verified-5` accepted |
| plate-5085-turn-into-control | model | after-action | no | N/A: opening the menu intentionally does not mutate the document | N/A: no document mutation belongs to menu open | N/A: model does not apply to menu open | N/A: no model assertion for menu open | N/A: follow-up-input owns the menu-choice transform |
| plate-5085-turn-into-control | dom-native | setup | yes | Expanded `Experience a modern` selection is the command target | Collapsed, replaced, or out-of-editor selection before activation | browser | `test: tooling/e2e/floating-toolbar.test.ts#floating Bold applies the mark without losing the selection` | pass: existing exact Bold setup establishes this field |
| plate-5085-turn-into-control | focus | setup | yes | The expanded editor selection owns focus before activation | Body or another control owns focus before the click | browser | `test: tooling/e2e/floating-toolbar.test.ts#floating Bold applies the mark without losing the selection` | pass: existing exact Bold setup establishes this field |
| plate-5085-turn-into-control | focus | after-action | yes | Editor selection ownership survives while the menu owns interaction focus | Browser body takes focus and command context is lost | exact-chrome | `test: tooling/e2e/floating-toolbar.test.ts#floating Turn Into opens without losing the selection` | pass: expanded selection survives menu open and editor focus returns 5/5 |
| plate-5085-turn-into-control | popup | after-action | yes | A visible Turn Into menu/listbox opens | No menu or listbox exists | exact-chrome | `test: tooling/e2e/floating-toolbar.test.ts#floating Turn Into opens without losing the selection` | pass: visible menu and Heading 1 item 5/5 |
| plate-5085-turn-into-control | geometry-paint | after-action | yes | The visible Turn Into menu replaces or accompanies the dismissed toolbar | Toolbar disappears with no replacement UI | exact-chrome | `test: tooling/e2e/floating-toolbar.test.ts#floating Turn Into opens without losing the selection` | pass: menu has nonzero geometry 5/5 |
| plate-5085-turn-into-control | runtime-errors | after-action | yes | No reporter-path console or page error occurs | An error interrupts Turn Into activation | browser | `test: tooling/e2e/floating-toolbar.test.ts#floating Turn Into opens without losing the selection` | pass: zero new action-time errors 5/5 |
| plate-5085-turn-into-control | follow-up-input | follow-up | yes | Choosing Heading 1 transforms the intended block and leaves valid selection | The choice cannot run against the intended target or corrupts selection | browser | `test: tooling/e2e/floating-toolbar.test.ts#floating Turn Into opens without losing the selection` | pass: exact block becomes H1 and selection stays expanded 5/5 |

Proof receipts:
| Case ID | Attempt | Claim | Command | Result | Ref | Input digest | Input count | Inputs | Host | Latest input mtime | Proof started | Proof ended | Retries | Receipt ID |
|---------|---------|-------|---------|--------|-----|--------------|-------------|--------|------|--------------------|---------------|-------------|---------|------------|
| plate-5085-comment-control | 2 | completed | "node" "--input-type=module" "-e" "import { chromium, expect } from \"@playwright/test\";const browser=await chromium.launch({executablePath:process.argv[1],headless:false});const url=process.argv[2];const selected=\"Experience a modern\";const intro=\"Experience a modern rich-text editor built with\";const editors=p=>p.locator(\"[data-plite-editor=\\\"true\\\"][contenteditable=\\\"true\\\"]\");const selection=p=>p.evaluate(()=>{const s=document.getSelection();const a=s?.anchorNode;const f=s?.focusNode;const active=document.activeElement;return{text:s?.toString(),collapsed:s?.isCollapsed,insideEditor:!!a&&!!f&&!!(a.nodeType===Node.ELEMENT_NODE?a:a.parentElement)?.closest(\"[data-plite-editor=\\\"true\\\"]\")&&!!(f.nodeType===Node.ELEMENT_NODE?f:f.parentElement)?.closest(\"[data-plite-editor=\\\"true\\\"]\"),activeInEditor:!!active?.closest(\"[data-plite-editor=\\\"true\\\"]\")};});const center=async(p,l)=>{const b=await l.boundingBox();if(!b)throw new Error(\"missing visible control\");await p.mouse.click(b.x+b.width/2,b.y+b.height/2);};const setup=async p=>{await p.goto(url);await p.waitForTimeout(500);const e=editors(p);await expect(e).toHaveCount(1);const target=p.getByText(intro,{exact:true});const r=await target.evaluate((el,n)=>{const t=el.firstChild;if(!t)throw new Error(\"missing target text\");const a=document.createRange();a.setStart(t,0);a.setEnd(t,1);const b=document.createRange();b.setStart(t,0);b.setEnd(t,n);const x=a.getBoundingClientRect();const y=b.getBoundingClientRect();return{sx:x.left+1,sy:x.top+x.height/2,ex:y.right-1,ey:y.top+y.height/2};},selected.length);await p.mouse.move(r.sx,r.sy);await p.mouse.down();await p.mouse.move(r.ex,r.ey,{steps:10});await p.mouse.up();const ft=p.getByRole(\"toolbar\").filter({has:p.getByRole(\"button\",{name:\"Ask AI\",exact:true})});await expect(ft).toBeVisible();await expect.poll(()=>selection(p)).toMatchObject({text:selected,collapsed:false,insideEditor:true,activeInEditor:true});return ft;};const errors=p=>{const list=[];p.on(\"pageerror\",e=>list.push(e.message));p.on(\"console\",m=>{if(m.type()===\"error\")list.push(m.text());});return list;};const run=async(name,fn)=>{console.log(name);const p=await browser.newPage();try{await fn(p);}finally{await p.close();}};const warm=await browser.newPage();await warm.goto(url);await warm.waitForTimeout(1000);await warm.close();await run(\"Bold\",async p=>{const ft=await setup(p);const es=errors(p);const b=ft.locator(\"button\").filter({has:p.locator(\"svg.lucide-bold\")});await expect(b).toHaveCount(1);await center(p,b);await expect(p.locator(\"strong\").filter({hasText:selected})).toHaveCount(1);await expect.poll(()=>selection(p)).toMatchObject({text:selected,collapsed:false,insideEditor:true,activeInEditor:true});expect(es).toEqual([]);});await run(\"Comment\",async p=>{const ft=await setup(p);const es=errors(p);const b=ft.locator(\"button\").filter({has:p.locator(\"svg.lucide-message-square-text\")});await expect(b).toHaveCount(1);await center(p,b);const draft=p.locator(\".plite-comment\").filter({hasText:selected});const reply=editors(p).last();await expect(draft).toHaveCount(1);await expect(draft).toBeVisible();await expect(editors(p)).toHaveCount(2);await expect.poll(()=>reply.evaluate(el=>el.contains(document.activeElement))).toBe(true);await expect.poll(()=>p.evaluate(()=>document.getSelection()?.isCollapsed)).toBe(true);await reply.pressSequentially(\"Receipt\");await expect(reply).toContainText(\"Receipt\");expect(es).toEqual([]);});await run(\"Turn Into\",async p=>{const ft=await setup(p);const es=errors(p);const b=ft.getByRole(\"button\",{name:\"Text\",exact:true});await expect(b).toHaveCount(1);await center(p,b);const menu=p.getByRole(\"menu\");const item=p.getByRole(\"menuitemradio\",{name:\"Heading 1\",exact:true});await expect(menu).toBeVisible();await expect(item).toBeVisible();await expect.poll(()=>selection(p)).toMatchObject({text:selected,collapsed:false,insideEditor:true});await center(p,item);await expect(p.getByRole(\"heading\",{level:1}).filter({hasText:intro})).toHaveCount(1);await expect.poll(()=>selection(p)).toMatchObject({text:selected,collapsed:false,insideEditor:true,activeInEditor:true});expect(es).toEqual([]);});await browser.close();console.log(\"exact headed Chrome reporter proof passed\");" "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" "http://localhost:3124/blocks/playground" | pass: exit 0 in 10702ms | commit:5104eb406fc8550c8527d89b829d4320ebf2f368 | sha256:788f3cc0a9f0a51170332074e4bb87427d32392c9d09f9da5e2a17d473a0b20b | 24 | apps/www/src/app/(blocks)/blocks/playground/page.tsx,apps/www/src/registry/components/editor/ai-toolbar-button.tsx,apps/www/src/registry/components/editor/comment-toolbar-button.tsx,apps/www/src/registry/components/editor/floating-toolbar.spec.tsx,apps/www/src/registry/components/editor/floating-toolbar.tsx,apps/www/src/registry/components/editor/history-toolbar-button.tsx,apps/www/src/registry/components/editor/indent-toolbar-button.tsx,apps/www/src/registry/components/editor/link-toolbar-button.tsx,apps/www/src/registry/components/editor/list-toolbar-button.tsx,apps/www/src/registry/components/editor/mark-toolbar-button.spec.tsx,apps/www/src/registry/components/editor/mark-toolbar-button.tsx,apps/www/src/registry/components/editor/suggestion-toolbar-button.tsx,apps/www/src/registry/components/editor/table.tsx,apps/www/src/registry/components/editor/tag.tsx,apps/www/src/registry/components/editor/toggle-toolbar-button.tsx,apps/www/src/registry/components/editor/toolbar.spec.tsx,apps/www/src/registry/components/editor/toolbar.tsx,apps/www/src/registry/components/editor/transforms.spec.ts,apps/www/src/registry/components/editor/turn-into-toolbar-button.tsx,apps/www/src/registry/examples/playground-demo.tsx,apps/www/src/registry/examples/values/playground-value.tsx,packages/plite-react/src/editable/runtime-root-lifecycle.ts,tooling/config/playwright.config.ts,tooling/e2e/floating-toolbar.test.ts | pid:77168;started:2026-08-24T10:33:14.000Z;base-url:http://localhost:3124;browser:exact-chrome:google-chrome-151-headed;browser-executable:/Applications/Google Chrome.app/Contents/MacOS/Google Chrome;browser-version:Google Chrome 151.0.7922.173 | 2026-08-24T10:04:38.178Z | 2026-08-24T10:41:46.722Z | 2026-08-24T10:41:57.425Z | 0 | sha256:75d8ba105e4da9f33891f44a91e1213f4ef6467b1cb5ea545bfb7b6dba374f30 |
| plate-5085-turn-into-control | 2 | completed | "node" "--input-type=module" "-e" "import { chromium, expect } from \"@playwright/test\";const browser=await chromium.launch({executablePath:process.argv[1],headless:false});const url=process.argv[2];const selected=\"Experience a modern\";const intro=\"Experience a modern rich-text editor built with\";const editors=p=>p.locator(\"[data-plite-editor=\\\"true\\\"][contenteditable=\\\"true\\\"]\");const selection=p=>p.evaluate(()=>{const s=document.getSelection();const a=s?.anchorNode;const f=s?.focusNode;const active=document.activeElement;return{text:s?.toString(),collapsed:s?.isCollapsed,insideEditor:!!a&&!!f&&!!(a.nodeType===Node.ELEMENT_NODE?a:a.parentElement)?.closest(\"[data-plite-editor=\\\"true\\\"]\")&&!!(f.nodeType===Node.ELEMENT_NODE?f:f.parentElement)?.closest(\"[data-plite-editor=\\\"true\\\"]\"),activeInEditor:!!active?.closest(\"[data-plite-editor=\\\"true\\\"]\")};});const center=async(p,l)=>{const b=await l.boundingBox();if(!b)throw new Error(\"missing visible control\");await p.mouse.click(b.x+b.width/2,b.y+b.height/2);};const setup=async p=>{await p.goto(url);await p.waitForTimeout(500);const e=editors(p);await expect(e).toHaveCount(1);const target=p.getByText(intro,{exact:true});const r=await target.evaluate((el,n)=>{const t=el.firstChild;if(!t)throw new Error(\"missing target text\");const a=document.createRange();a.setStart(t,0);a.setEnd(t,1);const b=document.createRange();b.setStart(t,0);b.setEnd(t,n);const x=a.getBoundingClientRect();const y=b.getBoundingClientRect();return{sx:x.left+1,sy:x.top+x.height/2,ex:y.right-1,ey:y.top+y.height/2};},selected.length);await p.mouse.move(r.sx,r.sy);await p.mouse.down();await p.mouse.move(r.ex,r.ey,{steps:10});await p.mouse.up();const ft=p.getByRole(\"toolbar\").filter({has:p.getByRole(\"button\",{name:\"Ask AI\",exact:true})});await expect(ft).toBeVisible();await expect.poll(()=>selection(p)).toMatchObject({text:selected,collapsed:false,insideEditor:true,activeInEditor:true});return ft;};const errors=p=>{const list=[];p.on(\"pageerror\",e=>list.push(e.message));p.on(\"console\",m=>{if(m.type()===\"error\")list.push(m.text());});return list;};const run=async(name,fn)=>{console.log(name);const p=await browser.newPage();try{await fn(p);}finally{await p.close();}};const warm=await browser.newPage();await warm.goto(url);await warm.waitForTimeout(1000);await warm.close();await run(\"Bold\",async p=>{const ft=await setup(p);const es=errors(p);const b=ft.locator(\"button\").filter({has:p.locator(\"svg.lucide-bold\")});await expect(b).toHaveCount(1);await center(p,b);await expect(p.locator(\"strong\").filter({hasText:selected})).toHaveCount(1);await expect.poll(()=>selection(p)).toMatchObject({text:selected,collapsed:false,insideEditor:true,activeInEditor:true});expect(es).toEqual([]);});await run(\"Comment\",async p=>{const ft=await setup(p);const es=errors(p);const b=ft.locator(\"button\").filter({has:p.locator(\"svg.lucide-message-square-text\")});await expect(b).toHaveCount(1);await center(p,b);const draft=p.locator(\".plite-comment\").filter({hasText:selected});const reply=editors(p).last();await expect(draft).toHaveCount(1);await expect(draft).toBeVisible();await expect(editors(p)).toHaveCount(2);await expect.poll(()=>reply.evaluate(el=>el.contains(document.activeElement))).toBe(true);await expect.poll(()=>p.evaluate(()=>document.getSelection()?.isCollapsed)).toBe(true);await reply.pressSequentially(\"Receipt\");await expect(reply).toContainText(\"Receipt\");expect(es).toEqual([]);});await run(\"Turn Into\",async p=>{const ft=await setup(p);const es=errors(p);const b=ft.getByRole(\"button\",{name:\"Text\",exact:true});await expect(b).toHaveCount(1);await center(p,b);const menu=p.getByRole(\"menu\");const item=p.getByRole(\"menuitemradio\",{name:\"Heading 1\",exact:true});await expect(menu).toBeVisible();await expect(item).toBeVisible();await expect.poll(()=>selection(p)).toMatchObject({text:selected,collapsed:false,insideEditor:true});await center(p,item);await expect(p.getByRole(\"heading\",{level:1}).filter({hasText:intro})).toHaveCount(1);await expect.poll(()=>selection(p)).toMatchObject({text:selected,collapsed:false,insideEditor:true,activeInEditor:true});expect(es).toEqual([]);});await browser.close();console.log(\"exact headed Chrome reporter proof passed\");" "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" "http://localhost:3124/blocks/playground" | pass: exit 0 in 10702ms | commit:5104eb406fc8550c8527d89b829d4320ebf2f368 | sha256:788f3cc0a9f0a51170332074e4bb87427d32392c9d09f9da5e2a17d473a0b20b | 24 | apps/www/src/app/(blocks)/blocks/playground/page.tsx,apps/www/src/registry/components/editor/ai-toolbar-button.tsx,apps/www/src/registry/components/editor/comment-toolbar-button.tsx,apps/www/src/registry/components/editor/floating-toolbar.spec.tsx,apps/www/src/registry/components/editor/floating-toolbar.tsx,apps/www/src/registry/components/editor/history-toolbar-button.tsx,apps/www/src/registry/components/editor/indent-toolbar-button.tsx,apps/www/src/registry/components/editor/link-toolbar-button.tsx,apps/www/src/registry/components/editor/list-toolbar-button.tsx,apps/www/src/registry/components/editor/mark-toolbar-button.spec.tsx,apps/www/src/registry/components/editor/mark-toolbar-button.tsx,apps/www/src/registry/components/editor/suggestion-toolbar-button.tsx,apps/www/src/registry/components/editor/table.tsx,apps/www/src/registry/components/editor/tag.tsx,apps/www/src/registry/components/editor/toggle-toolbar-button.tsx,apps/www/src/registry/components/editor/toolbar.spec.tsx,apps/www/src/registry/components/editor/toolbar.tsx,apps/www/src/registry/components/editor/transforms.spec.ts,apps/www/src/registry/components/editor/turn-into-toolbar-button.tsx,apps/www/src/registry/examples/playground-demo.tsx,apps/www/src/registry/examples/values/playground-value.tsx,packages/plite-react/src/editable/runtime-root-lifecycle.ts,tooling/config/playwright.config.ts,tooling/e2e/floating-toolbar.test.ts | pid:77168;started:2026-08-24T10:33:14.000Z;base-url:http://localhost:3124;browser:exact-chrome:google-chrome-151-headed;browser-executable:/Applications/Google Chrome.app/Contents/MacOS/Google Chrome;browser-version:Google Chrome 151.0.7922.173 | 2026-08-24T10:04:38.178Z | 2026-08-24T10:41:46.722Z | 2026-08-24T10:41:57.425Z | 0 | sha256:404ed47ae35015c578296d8f95eb599ddcdbcd880ff9b38751beeca2225a1698 |

Affected corpus replay:
| Owner | Affected cases | Pre-edit baseline | Last owner edit | Combined command | Receipt input digest | Result |
|-------|----------------|-------------------|-----------------|------------------|----------------------|--------|
| copied registry `toolbar.tsx` plus `floating-toolbar.tsx` overlay ownership | plate-5085-comment-control, plate-5085-turn-into-control | red: combined retry-free Chromium run kept Bold green, found Comment target mark count 0, and found no Turn Into menu | 2026-08-24T10:04:38.178Z | exact headed Chrome receipt plus `tooling/e2e/floating-toolbar.test.ts`, including affected Bold | sha256:788f3cc0a9f0a51170332074e4bb87427d32392c9d09f9da5e2a17d473a0b20b | pass: pushed-ref Chrome 5/5 for Bold, Comment, and Turn Into; focused Chromium 3/3 with retries 0 |

Gate failure closure:
| Gate | Failure signal | Classification | Resolution | Final rerun |
|------|----------------|----------------|------------|-------------|
| Pre-implementation Regression semantic validator | Missing exact Comment and Turn Into test titles; all other populated semantics accepted | expected red-proof readiness gate | Added both executable titles and proved both red | pass: rerun after this row update must return zero errors before product edit |
| Pre-edit Bold baseline on first cold page | Floating toolbar absent while the route emitted an existing hydration remount | proof-host readiness, not product assertion | Warm the route as required, then rerun the exact Bold row unchanged | pass: unchanged Bold case passed in 2.1s with no retry after warm-up |
| First direct `www` TypeScript command | Generated docs collections were absent because the command bypassed `build:source` | wrong gate | Use the package-owned Turbo typecheck lane | pass: `pnpm turbo typecheck --filter=./apps/www` completed 60/60 |
| First Turbo typecheck after install | `docx-import` could not resolve built Plite declarations during a cold parallel graph | proof-host/build-order readiness | Ran the mandated reinstall once, retained the focused source typecheck, then reran the exact Turbo command after artifacts stabilized | pass: exact rerun completed 60/60 in 1m50s |
| Browser reload locator evaluation | Chrome extension locator evaluation timed out after navigation before product action | proof transport | Serialized navigation/action and used read-only CDP geometry with real CUA pointer actions | pass: final Chrome ledger completed 5/5 with no retry |
| Exact receipt in headless Chrome | Turn Into transformed but headless Chrome dropped native selection | different browser mode, not reported surface | Run the receipt in headed installed Chrome, matching the reporter surface and plugin proof | pass: exact headed Chrome receipt exited 0 |

Failed fix history:
| Case ID | Attempt | Failure signal | Failure kind | Prior claim invalidated | Regression repair | Workflow test | Architecture trigger | Best API / layer plan | Resume state |
|---------|---------|----------------|--------------|-------------------------|-------------------|---------------|----------------------|-----------------------|--------------|
| plate-5085-comment-control | 1 | Felix comment 5385360833 contradicts issue completion: Comment opens nothing | reporter-contradiction | yes: issue-level completion and mark-only proof revoked for this control family | repair-now: `.agents/rules/regression.mdc`, methodology, template, and validator forbid generalizing sibling-control proof | pass: 46/46 focused Regression tests after the final validator repair | yes: cross-layer-compensation through per-caller focus patches | best-api: shared ToolbarButton owns editor focus; plate-plan: `docs/plans/5085-5088-toolbar-marquee-ownership.md` accepted | reproduced: exact Chrome focuses body and opens no composer |
| plate-5085-turn-into-control | 1 | Felix comment 5385360833 contradicts issue completion: Turn Into opens nothing | reporter-contradiction | yes: issue-level completion and mark-only proof revoked for this control family | repair-now: `.agents/rules/regression.mdc`, methodology, template, and validator forbid generalizing sibling-control proof | pass: 46/46 focused Regression tests after the final validator repair | yes: cross-layer-compensation through per-caller focus patches | best-api: shared ToolbarButton owns editor focus; plate-plan: `docs/plans/5085-5088-toolbar-marquee-ownership.md` accepted | reproduced: exact Chrome focuses body and opens no menu |

Architecture pressure:
| Case ID | Failed fix count | Triggers | Verdict | Best API | Layer plan | Proof |
|---------|------------------|----------|---------|----------|------------|-------|
| plate-5085-comment-control | 1 | cross-layer-compensation, ui-repairs-substrate | escalate | required: best-api makes the registry ToolbarButton family preserve editor focus by default | plate-plan: `docs/plans/5085-5088-toolbar-marquee-ownership.md` | accepted: user invoked Regression and Plate Plan for #5085 execution |
| plate-5085-turn-into-control | 1 | cross-layer-compensation, ui-repairs-substrate | escalate | required: best-api makes the registry ToolbarButton family preserve editor focus by default | plate-plan: `docs/plans/5085-5088-toolbar-marquee-ownership.md` | accepted: user invoked Regression and Plate Plan for #5085 execution |

Proof-host readiness:
| Case ID | Source owner | Runner / route / host | Freshness evidence | Generated/export boundary | Result |
|---------|--------------|-----------------------|--------------------|---------------------------|--------|
| plate-5085-comment-control | copied registry ToolbarButton, Toolbar overlay contract, FloatingToolbar, and Comment control | `/blocks/playground` on fresh PID 77168; focused Playwright; Browser; installed Chrome 151 | Host restarted only after `origin/next` resolved to clean `5104eb4`; receipt fingerprints 24 inputs | Direct copied registry source; no template or registry build output | pass: final exact route and pushed ref replayed |
| plate-5085-turn-into-control | copied registry ToolbarButton, Toolbar overlay contract, FloatingToolbar, and Turn Into control | `/blocks/playground` on fresh PID 77168; focused Playwright; Browser; installed Chrome 151 | Host restarted only after `origin/next` resolved to clean `5104eb4`; receipt fingerprints 24 inputs | Direct copied registry source; no template or registry build output | pass: final exact route and pushed ref replayed |

Patch delegation:
| Case ID | Red test | Allowed owner/files | Required proof/stability | Patch return evidence | Result |
|---------|----------|---------------------|--------------------------|-----------------------|--------|
| plate-5085-comment-control | Exact draft-mark/focus/reply-editor case was red before the fix | modern toolbar primitives, FloatingToolbar overlay ownership, prevent-only consumers, focused tests | Comment, Turn Into, Bold, dropdown/split, file-picker, variants, exact Chrome 5/5 | root cause: primitive missed mouse focus preservation and floating toolbar unmounted its owned Radix portal; P1 review N/A by user instruction; digest/ref above | pass: completed and kept |
| plate-5085-turn-into-control | Exact selection/focus/menu/follow-up case was red before the fix | same shared owners and focused proof boundary | Turn Into, Comment, Bold, dropdown/split, file-picker, variants, exact Chrome 5/5 | root cause: Radix menu autofocus blurred the editor and focus-only toolbar gating destroyed the trigger owner; Plite remains unchanged | pass: completed and kept |

Stability:
| Case ID | Executable proof / host | Required runs | Results | Retry count | Decision |
|---------|-------------------------|---------------|---------|-------------|----------|
| plate-5085-comment-control | installed Google Chrome 151 headed on fresh pushed-ref host | 5 | pass, pass, pass, pass, pass | 0 | completed |
| plate-5085-turn-into-control | installed Google Chrome 151 headed on fresh pushed-ref host | 5 | pass, pass, pass, pass, pass | 0 | completed |

Packet decisions:
| Case | Executable evidence | Decision | Claim width | Residual risk | Next owner |
|------|---------------------|----------|-------------|---------------|------------|
| plate-5085-comment-control | red before owner repair; focused Chromium, exact headed Chrome receipt, and Chrome plugin 5/5 green | keep | fixed on pushed `origin/next` ref; not released | Existing cold hydration warning predates the action and is excluded by action-time error windows | reporter confirmation; issue stays open |
| plate-5085-turn-into-control | red before owner repair; focused Chromium, exact headed Chrome receipt, and Chrome plugin 5/5 green | keep | fixed on pushed `origin/next` ref; not released | Headless Chrome selection differs after transform; reported headed Chrome is fully green | reporter confirmation; issue stays open |

Methodology deltas:
| Case | Miss or owner checked | Decision | Durable owner/change | Focused proof | Trigger/result |
|------|-----------------------|----------|----------------------|---------------|----------------|
| plate-5085-comment-control | Mark-only sibling proof was generalized to a different control path | repair-now | `.agents/rules/regression.mdc`, methodology/template, and validator require atomic reporter cases and cumulative evidence | pass: 46/46 focused Regression workflow tests | failed-fix interrupt completed; accepted shared-owner plan unblocks attempt 2 |
| plate-5085-turn-into-control | Mark-only sibling proof was generalized to a different control path | repair-now | `.agents/rules/regression.mdc`, methodology/template, and validator require atomic reporter cases and cumulative evidence | pass: 46/46 focused Regression workflow tests | failed-fix interrupt completed; accepted shared-owner plan unblocks attempt 2 |

Workflow slowdowns:
| Step / command | Owner | Elapsed / expected | Cause | Evidence value | Repair/result |
|----------------|-------|--------------------|-------|----------------|---------------|
| Exact Chrome proof transport | Regression proof host | repeated setup probes; expected one warm attempt | extension command dispatch and stale locator evaluation after navigation | high after classification; no product signal before action | serialized navigation/action, CDP reads, and CUA pointer input; final 5/5 had zero retry |
| Full `www` Turbo typecheck | repo build graph | 1m50s final | cold build ordering initially lacked declarations | required started-gate closure | exact final rerun passed 60/60 |

Findings:
- The exact red tests reproduce Felix's two remaining controls while the
  adjacent Bold case remains green.
- The first cold-page Bold probe raced an existing hydration remount. Warming
  the route repaired host readiness; the unchanged test then passed.
- The shared primitive now owns composed mouse-focus preservation. FloatingToolbar
  also owns the lifetime of portals opened by its toolbar through an aggregate
  ARIA overlay contract.
- Plite already keeps model selection across legitimate outside focus. Changing
  it would weaken the correct substrate rule, so the fix stays in Plate UI.

Timeline:
- 2026-08-24: created the scoped one-shot goal and loaded Regression, Patch,
  Plate Plan, Best API, current Vision, accepted plan, live issue, and current owners.
- 2026-08-24: pre-implementation semantic validator rejected only the two
  not-yet-created exact test titles, establishing the next proof step.
- 2026-08-24: exact red cases isolated the shared primitive and Radix portal
  lifetime failure; shared Plate owners were repaired without a Plite change.
- 2026-08-24: pushed `5104eb4` passed units, toolbar variants, full `www`
  typecheck, Browser QA, focused Chromium 3/3, exact headed Chrome receipt, and
  installed-Chrome 5/5.
- 2026-08-24: posted pushed-ref proof to #5085 in
  https://github.com/udecode/plate/issues/5085#issuecomment-5394190739 and left
  the issue open for reporter confirmation.

Decisions and tradeoffs:
- Keep Plite React unchanged; its outside-focus rule is correct.
- Compose `onMouseDown` inside all three modern toolbar button primitives and
  remove non-classic prevent-only duplicates. No opt-out flag or caller patch.
- Derive overlay ownership from Radix ARIA trigger props, aggregate open overlay
  IDs in Toolbar, and let FloatingToolbar stay mounted while an owned overlay is
  open. The visual `isDropdown` prop is not a behavior contract.

Review fixes:
- Autoreview: N/A by explicit user instruction.
- Manual source/proof audit rejected a Plite change and retained one shared
  Plate toolbar/overlay owner.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Comment locator invalidated after placeholder text changed | 1 | Hold the last editor locator, not placeholder-derived identity | proof helper repaired; product state stayed green |
| Chrome extension batched navigation and locator reads timed out | 3 proof-host attempts | serialize navigation/action; use CDP only for reads and CUA for input | final 5/5 restarted after repair |
| Freshness assertion counted intentional sample comments elsewhere | 1 | scope the negative control to path `1,0` | classifier repaired before final ledger |
| Headless installed Chrome dropped Turn Into native selection | 1 separate-mode probe | match the reported headed Chrome surface | headed exact receipt passed; headless remains outside #5085 claim |

Verification evidence:
- Pre-edit affected corpus: one retry-free Chromium command -> Bold pass,
  Comment red at missing draft mark, Turn Into red at missing menu.
- Semantic validator before red proof -> rejected only missing exact titles.
- Final units: toolbar 5/5, FloatingToolbar 2/2, mark/file-picker 11/11,
  transforms 19/19.
- `pnpm --filter www check:toolbar-variants`: Radix, Base, and Aria variants pass.
- `pnpm --filter www exec tsc --noEmit -p tsconfig.json`: pass.
- `pnpm turbo typecheck --filter=./apps/www`: 60/60 pass.
- Focused Chromium: Bold, Comment, Turn Into 3/3, retries 0.
- Browser QA: all three paths pass with zero new action-time errors.
- Installed Google Chrome 151.0.7922.173: all three paths pass 5/5, retries 0.
- Exact headed Chrome receipt: digest `sha256:788f3cc0...`, commit `5104eb4`.
- Regression semantic validator and Autogoal completion check: pass.
- Final fingerprints: toolbar `07ea72fc...`, FloatingToolbar `b45a44e2...`,
  toolbar spec `cb595f99...`, FloatingToolbar spec `94615ad1...`, mark spec
  `91d82df0...`, transforms spec `4205a9f1...`, E2E `d0437d75...`.

Final handoff:
- executable cases: both completed and kept on attempt 2
- cumulative reporter evidence, phase-specific oracles, and forbidden states: closed
- failed-fix invalidation and automatic repair: attempt 1 revoked; Regression repair passed before retry
- proof receipts and affected-corpus replay: exact Chrome receipts plus Bold/Comment/Turn Into replay complete
- started-gate failure closure: every started gate passes on final bytes
- changed files: shared toolbar/overlay owners, prevent-only consumers, focused specs, and E2E
- design decisions: Plate owns editor-command focus and owned overlay lifetime; Plite remains unchanged
- tests and proof: units, variants, source/full typecheck, Browser, Chromium, exact Chrome
- source/generated sync: reinstall completed; no agent-source or generated-source edits
- P1 and agent-native findings: N/A by explicit no-Autoreview instruction and unchanged agent workflows
- residual risks and next owner: headless Chrome selection differs; reporter confirmation owns next step
- local completion status and integration/public-status boundary: completed on pushed `origin/next` ref `5104eb4`; not released; issue remains open

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | final GitHub status update |
| Where am I going? | reporter confirmation; no release claim |
| What is the goal? | complete only #5085 Comment and Turn Into locally with exact 5/5 proof |
| What have I learned? | focus preservation and owned overlay lifetime are separate Plate responsibilities; Plite was already correct |
| What have I done? | repaired both owners and proved the exact pushed ref across every required lane |

Open risks:
- Headless installed Chrome clears native selection after the Turn Into choice;
  headed installed Chrome, the reporter surface, passes. Track separately if
  headless browser behavior becomes a supported claim.
- The route emits a pre-action hydration warning on a cold first page. Warm
  proof and action-time error windows prevent it from masquerading as #5085.
