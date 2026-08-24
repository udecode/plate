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
- Do not commit, push, open a PR, release, close the issue, or add the
  `completed` label. After local reporter-valid proof, post one truthful
  GitHub comment that says the work is local, uncommitted, and unpushed.

Boundaries:
- allowed source owners: modern copied registry toolbar primitives and their
  non-classic prevent-only consumers under `apps/www/src/registry/components/editor`
- allowed proof/test owners: focused registry specs and
  `tooling/e2e/floating-toolbar.test.ts`
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
- current phase: current-source readiness and red-proof creation
- current executable case: `plate-5085-comment-control`
- current case status: reproduced; executable red test pending
- next owner: Regression, then serialized Patch work at the shared toolbar owner
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
| Prompt requirements captured | yes | #5085 only; Comment and Turn Into; accepted shared-owner plan; no lint/Autoreview; local GitHub update only after exact proof; no commit/push/PR/release/close/label. |
| Regression methodology loaded | yes | `.agents/skills/regression/SKILL.md` and `references/methodology.md` read completely. |
| Active goal checked or created | yes | One-shot goal created for this exact plan and two-case threshold. |
| Current source owner and tested ref recorded | yes | Registry `toolbar.tsx` on `2b206974844c62c487337da12733293db10f674b`. |
| Executable test cases discovered | yes | Two named additions in `tooling/e2e/floating-toolbar.test.ts`; existing Bold row is the affected baseline. |
| Cumulative reporter evidence resolved | yes | Issue body and every comment through Felix's `5385360833` delta retained below. |
| Reporter oracle matrix resolved | yes | Positive and forbidden phase rows for both atomic cases are filled below. |
| Regression semantic validator ready | yes | Current validator is source/generated-synced; run before product implementation and again with `--complete`. |
| Route/proof-host readiness plan recorded | yes | Fresh `apps/www` process, Browser QA, then attested exact Chrome with 5/5 retry-free replay. |
| Patch delegation boundary recorded | yes | Shared modern toolbar primitives, non-classic prevent-only consumers, and focused tests only. |
| Orchestrator writer ownership recorded | N/A | No orchestrator or subagent; root agent is the sole writer and host owner. |
| Output budget strategy recorded | yes | Exact files and focused commands only; capped logs; generated/build trees excluded. |
| Claim width and blocked rules recorded | yes | Local completion only; final pushed-ref/public completion remains unavailable without push and replay. |
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
- [ ] Regression delegated only one normalized case at a time to Patch.
- [ ] Patch returned root cause, durable owner, changed files, exact red/green
      commands, final ref/dirty fingerprints, stability, architecture verdict,
      P1 review, and caveat.
- [ ] Focused green proof and exact final fresh-host replay passed.
- [ ] Final proof ran through `capture-proof-receipt.mjs`; its ref, input digest,
      host, timestamps, retry count, and receipt ID validate.
- [ ] Required retry-free stability runs passed with no retry.
- [ ] Any stability-only failure after an exact green run froze product edits,
      gained a phase-specific executable diagnostic, and restarted baselines
      after product-versus-proof classification.
- [ ] Any compositor phase claim records computed style, live range geometry,
      model/DOM endpoints, and callback identity at the mutation boundary. If
      those are final while pixels stay red, timing is rejected as the cause.
- [ ] Every blocking pixel classifier passes a known-positive and known-negative
      control through the same capture path; a failed control invalidates prior
      results and freezes product edits until the proof helper is repaired.
- [ ] Every shared owner was replayed against its affected exact corpus after
      the final owner edit.
- [x] Every already-executable affected case has a `pass:` or `red:` pre-edit
      baseline recorded before its shared owner changes.
- [ ] Every requested or started package, browser, root, or CI gate that failed
      is recorded and passes an exact final rerun on the final bytes.
- [ ] Every selected case is kept, reverted, quarantined, deferred, or blocked
      honestly; only kept cases can satisfy goal success.
- [x] No sidecar case registry, TSV, JSON manifest, or duplicate behavior
      database was created.
- [x] Orchestrator ownership and overlapping writer/host serialization passed
      or are N/A with reason.
- [ ] Workflow slowdowns and avoidable proof-host/command mistakes were
      repaired or deferred with owner.
- [ ] Every case records one methodology delta.
- [ ] Every failed claimed fix revoked prior completion, automatically repaired
      Regression with executable workflow proof, and restarted at attempt N+1.
- [ ] Every second failed fix or architecture trigger passed Best API and the
      owning Plite/Plate plan before another Patch attempt.
- [ ] Claim wording matches local, pushed, integration, and release evidence.
- [ ] Every kept case and the run are marked `completed` once all required local
      proof and plan gates pass; commit/push state is recorded separately.
- [ ] Final handoff records executable tests, decisions, refs, proof, sync,
      reviews, risks, and next owner.
- [ ] Output budget discipline was followed.
- [ ] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [ ] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [ ] Browser pack: console and network errors are checked or explicitly out of scope.
- [ ] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.
- [ ] Browser pack: report-backed proof fails on the exact observable case
      before the fix; a proxy route/action/outcome is classified `needs-repro`.
- [ ] Browser pack: final proof uses a fresh page/session on the final code
      state, rechecks every applicable model/DOM/selection/caret/focus/popup/
      toolbar/paint/error/follow-up-input field after the interaction ends, and
      records the ref plus production/test/fixture/harness fingerprints.
- [ ] Browser pack: fixed/completed proof starts a fresh process from a clean
      checkout at the exact final pushed ref, or an immutable CI artifact, and
      proves zero tracked or untracked issue-owned runtime-input differences.
      Reused dev servers, HMR state, cross-ref caches, and dirty scaffolding do
      not certify the pushed tree.
- [ ] Browser pack: native selection/paint, focus, DnD, compositor, or React DOM
      lifecycle cases pass 5/5 retry-free warm runs. When Chrome is the reported
      surface, the entire final replay and warm ledger run in exact Chrome;
      otherwise the limitation blocks fixed/completed wording.
- [ ] Browser pack: no temporary stub, alias, generated-file edit, route bypass,
      or unshipped scaffolding is counted as final behavior proof.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named completion threshold | pending | Close every selected executable case and methodology row | pending |
| Current-source readiness | pending | Prove source owner and final tested ref/dirty boundary | pending |
| Route/proof-host readiness | pending | Prove the runner/host observes current source | pending |
| Executable regression coverage | pending | Record exact test file, red result, green result, and owning invariant | pending |
| Cumulative reporter evidence closure | pending | Map every still-applicable base acceptance and later reporter delta to a phase-specific executable oracle | pending |
| Reporter oracle closure | pending | Resolve positive and forbidden states for all seven observations and every applicable interaction phase per case | pending |
| Failed-fix interrupt closure | pending | Prove every claimed-fix failure invalidated prior proof and completed automatic Regression repair | pending |
| Architecture pressure closure | pending | Prove every second failure or architecture trigger has Best API and layer-plan evidence | pending |
| Proof receipt closure | pending | Validate generated final receipts against unchanged issue-owned inputs | pending |
| Affected-corpus replay closure | pending | Replay all cases affected by the last shared-owner edit | pending |
| Started-gate failure closure | pending | Rerun every requested or started gate that failed; completion requires the exact gate to pass on final bytes | pending |
| Smallest-probe closure | pending | Record first falsifying probe and any host repair | pending |
| Patch delegation closure | pending | Read back one-case root-cause/red/green/proof evidence | pending |
| Focused verification closure | pending | Run owning test and exact final-case replay | pending |
| Stability closure | pending | Record retry-free warm runs or evidence-backed N/A | pending |
| Packet decision closure | pending | Keep/revert/quarantine/defer/block every selected case honestly | pending |
| Local completion status | pending | Mark every fully proved kept case and the run `completed`; record local ref/fingerprints and uncommitted/unpushed state separately | pending |
| No duplicate registry | pending | Prove no sidecar behavior manifest/database was created | pending |
| Generated/source and host repair | pending | Repair drift/host methodology or record blocked claim | pending |
| Orchestrator writer closure | pending | Prove one shared-state writer and serialized overlapping owners/hosts, or N/A | pending |
| Workflow slowdown closure | pending | Repair avoidable slow/stale/noisy proof paths or defer with owner | pending |
| Methodology delta closure | pending | Resolve repair-now/no-change/defer for every case | pending |
| Source/generated sync | pending | Run `pnpm install` and parity audit when agent sources changed, otherwise N/A | pending |
| Agent-native review | pending | Run for changed agent workflows or record N/A | pending |
| Final handoff contract | pending | Record tests, decisions, proof, sync, reviews, risks, and next owner | pending |
| Autoreview | pending | Run P1 autoreview for non-trivial implementation changes or record N/A | pending |
| Regression semantic plan | yes | Run `node .agents/skills/regression/scripts/validate-regression-plan.mjs docs/plans/5085-toolbar-focus-execution.md --complete` | pending |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5085-toolbar-focus-execution.md` | pending |
| Browser interaction proof | pending | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | pending |
| Browser console/network check | pending | Record console/network state or why it is not applicable | pending |
| Browser final proof artifact | pending | Record screenshot/trace/route/native proof or exact caveat | pending |
| Exact case replay | pending | For report-backed behavior, prove the exact case and all applicable end-state claim fields; otherwise N/A with reason | pending |
| Final ref and fingerprints | pending | Record the replayed commit/ref and issue-owned production/test/fixture/harness SHA-256 fingerprints; any later code or generated change invalidates the result | pending |
| Clean final runtime | pending | Before fixed/completed wording, start a fresh process from a clean checkout at the exact final pushed ref or immutable CI artifact and prove zero tracked/untracked issue-owned runtime-input differences; local candidates record N/A with exact unpushed status | pending |
| Retry-free stability | pending | For native selection/paint, focus, DnD, compositor, or React DOM lifecycle, record 5/5 warm runs with no retry in the exact reported browser/device; otherwise N/A with reason | pending |

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
| One-case Patch delegation | in_progress | accepted shared-owner packet below | verification |
| Focused verification and stability | pending | | packet decision |
| Keep/revert/quarantine | pending | | methodology delta |
| Methodology repair/no-change/defer | pending | | next case or closure |
| Reviews and final handoff | pending | | goal-plan check |
| Final goal-plan check | pending | | final response |

Selected executable cases:
| Case ID | Source reference | Setup / action | Expected outcome | Exact environment | Test file / command | Status | Tested ref | Next owner |
|---------|------------------|----------------|------------------|-------------------|---------------------|--------|------------|------------|
| plate-5085-comment-control | #5085 body and Felix comment 5385360833 | On `/blocks/playground`, select exact text `Experience a modern` with a real pointer and click visible floating Comment once | The exact target gains draft-comment marks, the main selection collapses by command design, the visible `Reply...` editor owns focus, and follow-up typing works | exact-chrome: installed Google Chrome on macOS against a fresh source-built Playground | `test: tooling/e2e/floating-toolbar.test.ts#floating Comment marks the target and opens the reply editor` | red: target mark count is 0 and no reply editor exists | commit:2b206974844c62c487337da12733293db10f674b | Patch at the accepted shared toolbar owner |
| plate-5085-turn-into-control | #5085 body and Felix comment 5385360833 | On `/blocks/playground`, select exact text `Experience a modern` with a real pointer and click visible floating Turn Into once | The command selection survives, the visible Turn Into menu opens, and choosing Heading 1 transforms the intended block with valid selection | exact-chrome: installed Google Chrome on macOS against a fresh source-built Playground | `test: tooling/e2e/floating-toolbar.test.ts#floating Turn Into opens without losing the selection` | red: no menu exists after the real click | commit:2b206974844c62c487337da12733293db10f674b | Patch at the accepted shared toolbar owner |

Reporter evidence inventory:
| Case ID | Source role | Source reference | Phase | Claim | Disposition | Oracle anchors | Executable anchor | Result |
|---------|-------------|------------------|-------|-------|-------------|----------------|-------------------|--------|
| plate-5085-comment-control | base-acceptance | https://github.com/udecode/plate/issues/5085 | setup | Expanded `Experience a modern` selection opens the floating toolbar and remains the command target | required | dom-native@setup, focus@setup, runtime-errors@after-action | `test: tooling/e2e/floating-toolbar.test.ts#floating Bold applies the mark without losing the selection` | pass: existing Bold case proves only the route and expanded-selection setup |
| plate-5085-comment-control | latest-reporter-delta | https://github.com/udecode/plate/issues/5085#issuecomment-5385360833 | after-action | Comment dismisses the toolbar without marking the target or opening comment UI | required | model@after-action, dom-native@after-action, focus@after-action, popup@after-action, geometry-paint@after-action, follow-up-input@follow-up | `test: tooling/e2e/floating-toolbar.test.ts#floating Comment marks the target and opens the reply editor` | red: exact Chrome reproduced body focus, no draft paint, and no reply UI; durable test pending |
| plate-5085-turn-into-control | base-acceptance | https://github.com/udecode/plate/issues/5085 | setup | Expanded `Experience a modern` selection opens the floating toolbar and remains the command target | required | dom-native@setup, focus@setup, runtime-errors@after-action | `test: tooling/e2e/floating-toolbar.test.ts#floating Bold applies the mark without losing the selection` | pass: existing Bold case proves only the route and expanded-selection setup |
| plate-5085-turn-into-control | latest-reporter-delta | https://github.com/udecode/plate/issues/5085#issuecomment-5385360833 | after-action | Turn Into dismisses the toolbar without opening its menu | required | focus@after-action, popup@after-action, geometry-paint@after-action, follow-up-input@follow-up | `test: tooling/e2e/floating-toolbar.test.ts#floating Turn Into opens without losing the selection` | red: exact Chrome reproduced body focus and no menu; durable test pending |

Reporter oracle matrix:
| Case ID | Observation | Phase | Applies | Positive assertion | Forbidden state | Proof layer | Executable anchor | Result |
|---------|-------------|-------|---------|--------------------|-----------------|-------------|-------------------|--------|
| plate-5085-comment-control | model | after-action | yes | The exact target carries draft-comment marks and the main selection collapses intentionally | No draft-marked target, marks on another range, or an expanded stale main selection | browser | `test: tooling/e2e/floating-toolbar.test.ts#floating Comment marks the target and opens the reply editor` | red: current exact route opens no comment state |
| plate-5085-comment-control | dom-native | setup | yes | Expanded `Experience a modern` selection is the command target | Collapsed, replaced, or out-of-editor selection before activation | browser | `test: tooling/e2e/floating-toolbar.test.ts#floating Bold applies the mark without losing the selection` | pass: existing exact Bold setup establishes this field |
| plate-5085-comment-control | dom-native | after-action | yes | The original target renders as a draft-comment leaf and the reply editable mounts | Unmarked target with no reply editable | exact-chrome | `test: tooling/e2e/floating-toolbar.test.ts#floating Comment marks the target and opens the reply editor` | red: neither draft presentation nor reply editable appears |
| plate-5085-comment-control | focus | setup | yes | The expanded editor selection owns focus before activation | Body or another control owns focus before the click | browser | `test: tooling/e2e/floating-toolbar.test.ts#floating Bold applies the mark without losing the selection` | pass: existing exact Bold setup establishes this field |
| plate-5085-comment-control | focus | after-action | yes | The mounted `Reply...` editor owns focus | Browser body owns focus or an unfocused composer appears | exact-chrome | `test: tooling/e2e/floating-toolbar.test.ts#floating Comment marks the target and opens the reply editor` | red: body owns focus after click |
| plate-5085-comment-control | popup | after-action | yes | A visible Comment composer containing `Reply...` replaces the action UI | No dialog, input, or composer exists | exact-chrome | `test: tooling/e2e/floating-toolbar.test.ts#floating Comment marks the target and opens the reply editor` | red: no Comment UI opens |
| plate-5085-comment-control | geometry-paint | after-action | yes | Draft highlight and visible reply UI paint after activation | Floating toolbar disappears with neither draft paint nor replacement UI | exact-chrome | `test: tooling/e2e/floating-toolbar.test.ts#floating Comment marks the target and opens the reply editor` | red: exact Chrome shows no replacement UI |
| plate-5085-comment-control | runtime-errors | after-action | yes | No reporter-path console or page error occurs | An error interrupts Comment activation | browser | `test: tooling/e2e/floating-toolbar.test.ts#floating Comment marks the target and opens the reply editor` | red: durable exact assertion does not exist yet |
| plate-5085-comment-control | follow-up-input | follow-up | yes | Typing in the focused reply editor updates its content | Reply editor cannot accept the next intended input | browser | `test: tooling/e2e/floating-toolbar.test.ts#floating Comment marks the target and opens the reply editor` | red: reply editor never opens |
| plate-5085-turn-into-control | model | after-action | no | N/A: opening the menu intentionally does not mutate the document | N/A: no document mutation belongs to menu open | N/A: model does not apply to menu open | N/A: no model assertion for menu open | N/A: follow-up-input owns the menu-choice transform |
| plate-5085-turn-into-control | dom-native | setup | yes | Expanded `Experience a modern` selection is the command target | Collapsed, replaced, or out-of-editor selection before activation | browser | `test: tooling/e2e/floating-toolbar.test.ts#floating Bold applies the mark without losing the selection` | pass: existing exact Bold setup establishes this field |
| plate-5085-turn-into-control | focus | setup | yes | The expanded editor selection owns focus before activation | Body or another control owns focus before the click | browser | `test: tooling/e2e/floating-toolbar.test.ts#floating Bold applies the mark without losing the selection` | pass: existing exact Bold setup establishes this field |
| plate-5085-turn-into-control | focus | after-action | yes | Editor selection ownership survives while the menu owns interaction focus | Browser body takes focus and command context is lost | exact-chrome | `test: tooling/e2e/floating-toolbar.test.ts#floating Turn Into opens without losing the selection` | red: body owns focus after click |
| plate-5085-turn-into-control | popup | after-action | yes | A visible Turn Into menu/listbox opens | No menu or listbox exists | exact-chrome | `test: tooling/e2e/floating-toolbar.test.ts#floating Turn Into opens without losing the selection` | red: no menu opens |
| plate-5085-turn-into-control | geometry-paint | after-action | yes | The visible Turn Into menu replaces or accompanies the dismissed toolbar | Toolbar disappears with no replacement UI | exact-chrome | `test: tooling/e2e/floating-toolbar.test.ts#floating Turn Into opens without losing the selection` | red: exact Chrome shows no replacement UI |
| plate-5085-turn-into-control | runtime-errors | after-action | yes | No reporter-path console or page error occurs | An error interrupts Turn Into activation | browser | `test: tooling/e2e/floating-toolbar.test.ts#floating Turn Into opens without losing the selection` | red: durable exact assertion does not exist yet |
| plate-5085-turn-into-control | follow-up-input | follow-up | yes | Choosing Heading 1 transforms the intended block and leaves valid selection | The choice cannot run against the intended target or corrupts selection | browser | `test: tooling/e2e/floating-toolbar.test.ts#floating Turn Into opens without losing the selection` | red: menu never opens |

Proof receipts:
| Case ID | Attempt | Claim | Command | Result | Ref | Input digest | Input count | Inputs | Host | Latest input mtime | Proof started | Proof ended | Retries | Receipt ID |
|---------|---------|-------|---------|--------|-----|--------------|-------------|--------|------|--------------------|---------------|-------------|---------|------------|
| pending | pending | pending | pending | pending | pending | pending | pending | pending | pending | pending | pending | pending | pending | pending |

Affected corpus replay:
| Owner | Affected cases | Pre-edit baseline | Last owner edit | Combined command | Receipt input digest | Result |
|-------|----------------|-------------------|-----------------|------------------|----------------------|--------|
| copied registry `toolbar.tsx` | plate-5085-comment-control, plate-5085-turn-into-control | red: combined retry-free Chromium run kept affected Bold green, found Comment target mark count 0, and found no Turn Into menu | pending | pending | pending | pending |

Gate failure closure:
| Gate | Failure signal | Classification | Resolution | Final rerun |
|------|----------------|----------------|------------|-------------|
| Pre-implementation Regression semantic validator | Missing exact Comment and Turn Into test titles; all other populated semantics accepted | expected red-proof readiness gate | Added both executable titles and proved both red | pass: rerun after this row update must return zero errors before product edit |
| Pre-edit Bold baseline on first cold page | Floating toolbar absent while the route emitted an existing hydration remount | proof-host readiness, not product assertion | Warm the route as required, then rerun the exact Bold row unchanged | pass: unchanged Bold case passed in 2.1s with no retry after warm-up |

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
| plate-5085-comment-control | copied registry ToolbarButton and Comment control | `/blocks/playground` on a fresh source-built `apps/www`; focused Playwright; Browser; exact Chrome | Base ref and route reproduced from a fresh host; final process must restart after implementation | Direct copied registry source; no package build, template, or registry output | pass: owner-revealing reproduction is current; final host restart pending |
| plate-5085-turn-into-control | copied registry ToolbarButton and Turn Into control | `/blocks/playground` on a fresh source-built `apps/www`; focused Playwright; Browser; exact Chrome | Base ref and route reproduced from a fresh host; final process must restart after implementation | Direct copied registry source; no package build, template, or registry output | pass: owner-revealing reproduction is current; final host restart pending |

Patch delegation:
| Case ID | Red test | Allowed owner/files | Required proof/stability | Patch return evidence | Result |
|---------|----------|---------------------|--------------------------|-----------------------|--------|
| plate-5085-comment-control | Add exact draft-mark/focus/reply-editor case and prove it red | modern toolbar primitives, non-classic prevent-only consumers, focused registry/E2E tests | Comment, Turn Into, Bold, dropdown/split, and file-picker controls; exact Chrome 5/5 | root cause, shared-owner diff, red/green commands, dirty fingerprints, receipt, architecture verdict | ready: accepted plan authorizes serialized implementation after red proof |
| plate-5085-turn-into-control | Add exact selection/focus/menu/follow-up case and prove it red | same shared toolbar owner and focused proof boundary | Turn Into, Comment, Bold, dropdown/split, and file-picker controls; exact Chrome 5/5 | root cause, shared-owner diff, red/green commands, dirty fingerprints, receipt, architecture verdict | ready: execute after the Comment red proof against the same unchanged owner |

Stability:
| Case ID | Executable proof / host | Required runs | Results | Retry count | Decision |
|---------|-------------------------|---------------|---------|-------------|----------|
| pending | pending | pending | pending | pending | pending |

Packet decisions:
| Case | Executable evidence | Decision | Claim width | Residual risk | Next owner |
|------|---------------------|----------|-------------|---------------|------------|
| pending | pending | pending | pending | pending | pending |

Methodology deltas:
| Case | Miss or owner checked | Decision | Durable owner/change | Focused proof | Trigger/result |
|------|-----------------------|----------|----------------------|---------------|----------------|
| plate-5085-comment-control | Mark-only sibling proof was generalized to a different control path | repair-now | `.agents/rules/regression.mdc`, methodology/template, and validator require atomic reporter cases and cumulative evidence | pass: 46/46 focused Regression workflow tests | failed-fix interrupt completed; accepted shared-owner plan unblocks attempt 2 |
| plate-5085-turn-into-control | Mark-only sibling proof was generalized to a different control path | repair-now | `.agents/rules/regression.mdc`, methodology/template, and validator require atomic reporter cases and cumulative evidence | pass: 46/46 focused Regression workflow tests | failed-fix interrupt completed; accepted shared-owner plan unblocks attempt 2 |

Workflow slowdowns:
| Step / command | Owner | Elapsed / expected | Cause | Evidence value | Repair/result |
|----------------|-------|--------------------|-------|----------------|---------------|
| pending | pending | pending | pending | pending | pending |

Findings:
- The exact red tests reproduce Felix's two remaining controls while the
  adjacent Bold case remains green.
- The first cold-page Bold probe raced an existing hydration remount. Warming
  the route repaired host readiness; the unchanged test then passed.
- The shared primitive still spreads caller props without owning mouse-focus
  preservation; Comment and Turn Into have no local override.

Timeline:
- 2026-08-24: created the scoped one-shot goal and loaded Regression, Patch,
  Plate Plan, Best API, current Vision, accepted plan, live issue, and current owners.
- 2026-08-24: pre-implementation semantic validator rejected only the two
  not-yet-created exact test titles, establishing the next proof step.

Decisions and tradeoffs:
- Keep Plite React unchanged; its outside-focus rule is correct.
- Compose `onMouseDown` inside all three modern toolbar button primitives and
  remove non-classic prevent-only duplicates. No opt-out flag or caller patch.

Review fixes:
- pending

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | N/A | N/A |

Verification evidence:
- Pre-edit affected corpus: one retry-free Chromium command -> Bold pass,
  Comment red at missing draft mark, Turn Into red at missing menu.
- Semantic validator before red proof -> rejected only missing exact titles.

Final handoff:
- executable cases: pending
- cumulative reporter evidence, phase-specific oracles, and forbidden states: pending
- failed-fix invalidation and automatic repair: pending
- proof receipts and affected-corpus replay: pending
- started-gate failure closure: pending
- changed files: pending
- design decisions: pending
- tests and proof: pending
- source/generated sync: pending
- P1 and agent-native findings: pending
- residual risks and next owner: pending
- local completion status and integration/public-status boundary: pending

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | creating the two reporter-complete red tests |
| Where am I going? | semantic green, shared-owner patch, focused proof, Browser and exact Chrome closure |
| What is the goal? | complete only #5085 Comment and Turn Into locally with exact 5/5 proof |
| What have I learned? | current source still lacks the shared mouse-focus invariant; the validator blocks absent exact tests |
| What have I done? | scoped goal/plan, cumulative issue evidence, oracles, architecture gate, and pre-red validator run |

Open risks:
- Dropdown, split-button, and file-picker triggers share the primitive and need
  negative controls before the invariant can be kept.
