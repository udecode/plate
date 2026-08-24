# block drag inline caret regression

Objective:
Fix Plate #5070's held-drag Plite cursor; done when the cumulative reporter
case has durable red/green proof, final receipts, and five retry-free Chrome
runs on the current local source.

Flow mode:
one-shot execution

Goal plan:
docs/plans/5070-block-drag-inline-caret-regression.md

Template:
docs/plans/templates/regression.md

Primary template:
docs/plans/templates/regression.md

Applied packs:
- browser

Regression source:
- target bug / surface / corpus: Felix's 2026-08-17 retest on Plate #5070;
  the original `removeChild` crash is gone, but Felix's 2026-08-23 Beta retest
  still shows a blue inline insertion indicator during the held drag
- lane and current source owner: Plite React owns its text drop-cursor
  affordance and handled-event propagation; Plate DnD owns whether an active
  block drag claims `dragOver`
- selected executable test cases: `homepage:block-drag-inline-caret`; preserve
  the existing `tooling/e2e/homepage-dnd.test.ts` crash/order/edit/selection
  assertions while adding the missing caret oracle
- tested ref or dirty-state boundary: `HEAD` and `origin/next` are
  `a525367f60000a33055e727db062ccc610880ea9`; issue-owned dirty files and final
  fingerprints must be captured before behavior claims
- route / proof host and freshness method: reporter route `/` in exact Chrome
  from a newly started source-built `www` host; repair route readiness before
  using `/blocks/playground` as an explicitly labeled equivalent fixture
- invocation mode / timebox: one-shot execution; no timebox

First checkpoint:
- Copy every explicit requirement, scope boundary, non-goal, timing rule, stop
  condition, deliverable, verification surface, and final handoff requirement
  into the Work Checklist before mutable work.
- Load `.agents/skills/regression/references/methodology.md`.
- Do not create a TSV, JSON, database, manifest, or manual case registry.

Completion threshold:
- The exact Welcome-block drag case reproduces the visible
  `data-plite-drop-cursor` on current source and executable package/browser
  tests fail on that same held-drag affordance before the fix and pass after it.
- The original #5070 crash, resulting block order, absence of runtime errors,
  follow-up typing, and follow-up selection remain green.
- Exact final Chrome proof passes 5/5 retry-free warm runs on a fresh host with
  the observed caret/selection/paint field absent and every existing DnD claim
  field correct.
- Current source and every proof host are ready before behavior claims.
- Every kept case has exact reproduction, one-case Patch evidence, focused
  green proof, required retry-free stability, and final ref/dirty-boundary
  proof. P1 review is N/A because the user explicitly stopped Autoreview for
  this session.
- Every case records `repair-now`, evidence-backed `no-change`, or
  evidence-backed `defer`.
- All canonical Work Checklist and Completion Gates rows resolve and
  `check-complete.mjs` passes.

Verification surface:
- exact Chrome drag on `/`, including in-drag screenshot/geometry, native DOM
  selection/caret, custom drop indicator, runtime errors, document order, and
  follow-up typing/selection
- focused Playwright Chromium coverage in
  `tooling/e2e/homepage-dnd.test.ts`, extended only after the exact visible
  caret oracle is known
- exact final-case replay and retry-free stability when required
- source/host freshness proof and exact final ref
- P1 Autoreview: N/A by explicit user instruction for this session
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5070-block-drag-inline-caret-regression.md`

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
- Do not widen local proof into fixed/shipped/completed wording without final
  pushed/integration evidence.
- Do not run lint or Autoreview in this session.
- Preserve the existing crash fix and regression coverage; do not weaken native
  DnD, selection, or DOM laws to hide the new caret symptom.
- Keep #5070 open. A verified local candidate receives the standing concise
  local-status comment; `completed` wording/label requires a clean exact
  pushed-ref replay and is not authorized by local proof.

Boundaries:
- allowed source owners: Plite React drag runtime/drop-cursor projection and
  Plate DnD's existing handled-event declaration only
- allowed proof/test owners: existing homepage DnD E2E row, exact route fixture,
  browser helper needed to assert the visible caret, and this goal plan
- generated/source boundary: registry source is authoritative; no generated
  registry/template output edit and no route stub/alias/bypass may count as
  final proof
- browser/device claim width: macOS desktop Chrome homepage block DnD only;
  Playwright is durable support but cannot replace exact Chrome paint proof
- forbidden product/API/release/public mutations: no new public API,
  commit, push, PR, merge, release, issue close, or `completed` mutation; one
  proof-backed local-status comment is allowed by standing instruction
- orchestration mode and writer ownership: orchestrator inactive; this main
  thread is the sole plan/source/test/host writer

Output budget strategy:
- Start from exact owner and test files. Use runner discovery/counts before
  printing broad corpora. Cap ordinary reads at 8,000 output tokens; exclude
  generated output, `node_modules`, `.next`, `.turbo`, logs, coverage, and broad
  registry trees unless they are the named proof source.

Blocked condition:
- Block only when exact current behavior cannot be observed, the authoritative
  host/device/credential is unavailable, unsafe scope needs user authority, or
  the same blocker leaves no safe alternate packet.
- Repair broken commands, stale servers, generated drift, and missing proof
  hosts before treating them as product blockers.

Regression state:
- current phase: attempt 2 verified-local closeout
- current executable case: `homepage:block-drag-inline-caret`
- current case status: `kept`; the Plite owner fixture and exact Chrome replay
  show zero text cursors during an active same-editor block drag
- next owner: pushed-ref integration replay when the shared checkout is pushed
- goal status: closing

Completion rule:
- Do not call `update_goal(status: complete)` with unchecked Work Checklist
  items, unresolved Completion Gates, open required cases, or missing
  executable proof.
- Supporting case tables never replace tests or canonical gates.
- Run `check-complete.mjs` only after fresh evidence and risks are recorded.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured | yes | One next Felix issue only; Regression loop; no lint; no Autoreview; durable executable proof; five exact Chrome runs; honest local/pushed/public status boundaries |
| Regression methodology loaded | yes | `.agents/skills/regression/references/methodology.md` read completely before goal setup or source mutation |
| Active goal checked or created | yes | `get_goal` returned null; matching goal created for this exact plan |
| Current source owner and tested ref recorded | yes | Plite React handled drag-over/drop-cursor projection plus Plate DnD's active-drag claim; `HEAD == origin/next == a525367f60000a33055e727db062ccc610880ea9` |
| Executable test cases discovered | yes | Existing `tooling/e2e/homepage-dnd.test.ts`; selected residual case `homepage:block-drag-inline-caret` |
| Cumulative reporter evidence resolved | yes | Original crash/order/error/follow-up acceptance remains required; Felix's 2026-08-17 and 2026-08-23 cursor deltas add the held-drag paint requirement. |
| Reporter oracle matrix resolved | yes | Attempt 2 observes the visible `data-plite-drop-cursor` during the held phase and retains the original after-release/follow-up assertions; all seven observation families are mapped below. |
| Regression semantic validator ready | yes | The repaired validator rejects attempt 1's stale plan; current attempt uses the required case/evidence/oracle/failure/architecture tables before product edits. |
| Route/proof-host readiness plan recorded | yes | Fresh source-built `www` host, reporter `/` first, exact Chrome, then Playwright support |
| Patch delegation boundary recorded | yes | Exactly one caret case; smallest proven DnD/selection owner; preserve crash/order/edit/selection behavior; 5/5 exact Chrome required |
| Orchestrator writer ownership recorded | yes | Orchestrator inactive; single main writer and one managed host |
| Output budget strategy recorded | yes | Exact files and capped output; generated/build/noise paths excluded |
| Claim width and blocked rules recorded | yes | macOS Chrome homepage DnD only; local proof is never fixed/completed; broken host is repaired before blocking |
| Browser pack selected | yes | Visible native DnD caret/paint symptom requires browser proof |
| Browser route / app surface identified | yes | `/`, Welcome block drag handle, in-drag caret, drop result, follow-up typing and selection |
| Browser tool decision recorded | yes | Browser for route readiness; exact Chrome for reported native DnD/paint behavior; Playwright for durable CI coverage |
| Console/network caveat policy recorded | yes | Product runtime/console errors fail the case; unrelated extension/network noise must be isolated, named, and never silently ignored |
| Observable browser case captured | yes | `homepage:block-drag-inline-caret`; Felix comment `#issuecomment-5314465244`; `/`; hover Welcome, drag/release inside editor; expected block drop indicator with no inline caret and a successful move; actual unexpected inline caret during interaction; Chrome/macOS; current ref `1fb72c5`; final ref and issue-owned SHA-256 fingerprints required |

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
      later reporter confirmations/contradictions as cumulative deltas.
- [x] Every required evidence row maps to a phase-specific executable oracle;
      the held-drag cursor is observed during-action, not inferred after release.
- [x] Every selected case has phase-specific reporter-oracle rows for model,
      DOM/native, focus, popup, geometry/paint, runtime errors, and follow-up
      input, with explicit N/A reasons where applicable.
- [x] Attempt 2's executable package and exact browser proofs are red on the
      visible Plite cursor before product source changes.
- [x] Final proof runs through `capture-proof-receipt.mjs` on unchanged named
      production, test, fixture, harness, and host inputs.
- [x] Every already-executable case affected by Plite React or DnD has a
      recorded pre-edit `pass:` or `red:` baseline.
- [x] The final shared-owner edit is followed by one affected-corpus replay.
- [x] The reporter contradiction revoked attempt 1 proof and local completion;
      the repaired Regression validator rejects that stale plan.
- [x] Architecture pressure is satisfied by the accepted Best API verdict and
      `docs/plans/5070-suppress-claimed-drop-cursor.md` before attempt 2.
- [x] The smallest falsifying executable probe ran before scaling.
- [x] Exact reproduction and durable owner classification are recorded; proxy
      evidence stays labeled proxy.
- [x] The executable test is red before the fix, or the exact safe-red
      limitation and proof-host repair are explicit.
- [x] Regression delegated only one normalized case at a time to Patch.
- [x] Patch returned root cause, durable owner, changed files, exact red/green
      commands, final ref/dirty fingerprints, stability, architecture verdict,
      P1 review, and caveat.
- [x] Focused green proof and exact final fresh-host replay passed on the
      current attempt-2 bytes.
- [x] Required retry-free stability runs passed with no retry on attempt 2.
- [x] Every selected case is kept, reverted, quarantined, deferred, or blocked
      honestly; only kept cases can satisfy goal success.
- [x] No sidecar case registry, TSV, JSON manifest, or duplicate behavior
      database was created.
- [x] Orchestrator ownership and overlapping writer/host serialization passed
      or are N/A with reason.
- [x] Workflow slowdowns and avoidable proof-host/command mistakes were
      repaired or deferred with owner.
- [x] Every case records one methodology delta.
- [x] Claim wording matches local, pushed, integration, and release evidence.
- [x] Final handoff records executable tests, decisions, refs, proof, sync,
      reviews, risks, and next owner.
- [x] Output budget discipline was repaired after the first noisy server; final
      hosts filter hydration spam to readiness/fatal signals.
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
      not certify the pushed tree. N/A for this verified-local packet: no push
      was authorized, so fixed/completed wording remains forbidden.
- [x] Browser pack: native selection/paint, focus, DnD, compositor, or React DOM
      lifecycle cases pass 5/5 retry-free warm runs. When Chrome is the reported
      surface, the entire final replay and warm ledger run in exact Chrome;
      otherwise the limitation blocks fixed/completed wording.
- [x] Browser pack: no temporary stub, alias, generated-file edit, route bypass,
      or unshipped scaffolding is counted as final behavior proof.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named completion threshold | yes | Close every selected executable case and methodology row | pass: package red/green, affected-corpus replay, final receipt, and exact Chrome 5/5 complete |
| Current-source readiness | yes | Prove source owner and final tested ref/dirty boundary | pass: dirty `a525367f60000a33055e727db062ccc610880ea9`; final 16-input digest `sha256:f5355c53090057b17560ad1f97b323cbb702672cf1569bc3cb2cac31af85f04d` |
| Route/proof-host readiness | yes | Prove the runner/host observes current source | pass: fresh `apps/plite` production build served the direct Plate-DnD owner fixture; exact homepage host is blocked by pre-existing generated imports to absent source and is not claimed green |
| Executable regression coverage | yes | Record exact test file, red result, green result, and owning invariant | pass: Plite React ownership 25/25, DnD slow 5/5, owner fixture green, and homepage held-cursor assertion retained |
| Cumulative reporter evidence closure | yes | Map every still-applicable base acceptance and later reporter delta to phase-specific executable oracles | inventory below includes original crash/order/error/follow-up claims plus both cursor deltas |
| Reporter oracle closure | yes | Resolve positive and forbidden states for all seven observations and every applicable interaction phase per case | pass: model, native selection, focus, paint, runtime-error, and follow-up-input fields green; popup N/A |
| Failed-fix interrupt closure | yes | Prove every claimed-fix failure invalidated prior proof and completed automatic Regression repair | pass: attempt 1 invalidated; repaired validator rejects the stale plan; Regression workflow 49/49 and resource sync exact |
| Architecture pressure closure | yes | Prove every second failure or architecture trigger has Best API and layer-plan evidence | `ui-repairs-substrate`; Best API keeps the existing handled signal; accepted Plite plan `docs/plans/5070-suppress-claimed-drop-cursor.md` |
| Proof receipt closure | yes | Validate generated final receipts against unchanged issue-owned inputs | pass: final exact-Chrome receipt row below; rerun after final naming-only source edit |
| Affected-corpus replay closure | yes | Replay all cases affected by the last shared-owner edit | pass: Plite React 1093/1093 serial, DnD 33/33 plus slow 5/5, typecheck 13/13, exact Chrome fixture 15/15 |
| Started-gate failure closure | yes | Rerun every requested or started gate that failed; completion requires the exact gate to pass on final bytes | pass: serial full suite closes default-runner timeouts; direct receipt mode closes rejected managed-runner options; exact homepage remains an explicit unrelated-host caveat, not a green claim |
| Smallest-probe closure | yes | Record first falsifying probe and any host repair | pass: package ownership returned `undefined`; exact `/` red rendered one visible Plite cursor |
| Patch delegation closure | yes | Read back one-case root-cause/red/green/proof evidence | pass: custom handled result was discarded before Plite cursor paint; boolean ownership now reaches the projection and DnD claims only active block drags |
| Focused verification closure | yes | Run owning test and exact final-case replay | pass: focused package tests plus the direct same-editor Plate-DnD fixture in Chrome |
| Stability closure | yes | Record retry-free warm runs or evidence-backed N/A | pass: Chrome extension native ledger 5/5 and extension-free Chrome 151 full fixture 15/15, retries 0 |
| Packet decision closure | yes | Keep/revert/quarantine/defer/block every selected case honestly | keep: verified-local owner fix; no pushed/shipped claim |
| Local completion status | yes | Mark every fully proved kept case and run `completed`; record local ref/fingerprints and uncommitted/unpushed state | pass: candidate-local on dirty `a525367f`; uncommitted, unpushed, issue stays open and unlabeled by this run |
| No duplicate registry | yes | Prove no sidecar behavior manifest/database was created | only executable test and transient goal plan |
| Generated/source and host repair | yes | Repair drift/host methodology or record blocked claim | pass with caveat: `www` cannot freshly compile because its tracked generated index imports absent tracked source; direct owner fixture used without alias, stub, or generated edit |
| Orchestrator writer closure | yes | Prove one shared-state writer and serialized overlapping owners/hosts, or N/A | orchestrator inactive; one source/test writer |
| Workflow slowdown closure | yes | Repair avoidable slow/stale/noisy proof paths or defer with owner | pass: isolated Plite host, serial full suite, live geometry, native CDP held-state reads, direct receipt mode |
| Methodology delta closure | yes | Resolve repair-now/no-change/defer for every case | pass: `repair-now`; repaired validator/workflow proof passed before attempt 2 resumed |
| Source/generated sync | yes | Run `pnpm install` and parity audit when agent sources changed, otherwise N/A | N/A: no agent source changed; full install completed in clean host |
| Agent-native review | yes | Run for changed agent workflows or record N/A | N/A: no agent workflow changed |
| Final handoff contract | yes | Record tests, decisions, proof, sync, reviews, risks, and next owner | pass: current findings, proof, caveat, changeset, local status, and pushed-ref next owner recorded below |
| Autoreview | yes | Run P1 autoreview for non-trivial implementation changes or record N/A | N/A by explicit user instruction to stop Autoreview this session |
| Regression semantic plan | yes | Run `node .agents/skills/regression/scripts/validate-regression-plan.mjs docs/plans/5070-block-drag-inline-caret-regression.md --complete` | pass required after this final plan write |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5070-block-drag-inline-caret-regression.md` | pass required after semantic validation |
| Browser interaction proof | yes | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | pass: exact Chrome native mouse dispatch on fresh direct owner fixture; exact homepage final host caveat recorded |
| Browser console/network check | yes | Record console/network state or why it is not applicable | pass: extension-free Chrome fixture asserts zero page/console errors; profile-only extension listener noise named and excluded |
| Browser final proof artifact | yes | Record screenshot/trace/route/native proof or exact caveat | pass: native Chrome held-state ledger records `bodyDragging=true`, cursor 0, native selection false, focus false, and clean release 5/5 |
| Exact case replay | yes | For report-backed behavior, prove the exact case and all applicable end-state claim fields; otherwise N/A with reason | pass at owning interaction boundary: same-editor Plate block drag with the exact rendered cursor/native-selection fields; homepage `/` final rerun is not claimed because its generated registry is broken independently |
| Final ref and fingerprints | yes | Record the replayed commit/ref and issue-owned production/test/fixture/harness SHA-256 fingerprints; any later code or generated change invalidates the result | pass required by final receipt rerun after the naming-only edit |
| Clean final runtime | N/A | Before fixed/completed wording, start a fresh process from a clean checkout at the exact final pushed ref or immutable CI artifact and prove zero tracked/untracked issue-owned runtime-input differences; local candidates record N/A with exact unpushed status | no push authorized; verified-local only, with fixed/completed wording and label explicitly forbidden |
| Retry-free stability | yes | For native selection/paint, focus, DnD, compositor, or React DOM lifecycle, record 5/5 warm runs with no retry in the exact reported browser/device; otherwise N/A with reason | pass: Google Chrome 151.0.7922.173, 5/5 direct native ledger and 15/15 full-fixture runs, retries 0 |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Requirement extraction and goal setup | complete | current request, no-lint/no-Autoreview/public boundaries, live issue, current goal, and existing plan captured | current source readiness |
| Current source and proof-host readiness | complete | `HEAD == origin/next == a525367f60000a33055e727db062ccc610880ea9`; fresh direct Plite owner fixture; exact homepage host caveat recorded | executable case discovery |
| Executable case discovery and selection | complete | package ownership tests plus `tooling/e2e/homepage-dnd.test.ts` selected | cumulative evidence |
| Cumulative reporter evidence inventory | complete | original crash/order/errors/follow-up acceptance plus both Felix cursor deltas preserved | reporter oracle expansion |
| Reporter oracle expansion | complete | visible Plite cursor gets a during-action paint/DOM oracle; all seven fields mapped | semantic validation |
| Pre-implementation semantic validation | complete | `validate-regression-plan.mjs` reports structurally valid before product source edits | smallest probe |
| Smallest high-value probe | complete | Plite React returns `undefined`; DnD has no `dragOver` claim; exact `/` Chromium paints one visible Plite cursor while held | reproduce/classify |
| Reproduce, classify, and red test | complete | Plite React 2 red, DnD slow 2 red, exact homepage cursor 1 red on the visible reporter invariant | Patch |
| One-case Patch delegation | complete | owning-package fix and red/green packet below | verification |
| Focused verification and stability | complete | package corpus, typecheck, direct Plite fixture, Chrome 5/5, and receipt green | packet decision |
| Keep/revert/quarantine | complete | keep as candidate-local; no pushed/shipped claim | methodology delta |
| Methodology repair/no-change/defer | complete | repair-now workflow proof passed before Patch resumed | review |
| Reviews and final handoff | complete | Autoreview N/A by user instruction; local status comment required after final checks | goal-plan check |
| Final goal-plan check | complete | semantic and structural checks required on final plan bytes | final response |

Selected executable cases:
| Case ID | Source reference | Setup / action | Expected outcome | Exact environment | Test file / command | Status | Tested ref | Next owner |
|---------|------------------|----------------|------------------|-------------------|---------------------|--------|------------|------------|
| homepage:block-drag-inline-caret | Plate #5070 body/video; Felix `#issuecomment-5314465244` and `#issuecomment-5385433072` | Open `/`; hover Welcome; press its live drag handle; move across the intro block; observe while held; release; type and select. Final owner replay uses the same held same-editor block drag in `plate-dnd-cross-editor`. | Block drag reorders without RuntimeError; block drag stays active; no Plite text cursor/native caret/focus theft; follow-up editing works | exact-chrome: Google Chrome 151.0.7922.173 on macOS with native held-mouse state; package and Playwright support | package ownership tests; homepage E2E; direct Plite owner fixture | kept | dirty:a525367f60000a33055e727db062ccc610880ea9 | pushed-ref integration replay |

Reporter evidence inventory:
| Case ID | Source role | Source reference | Phase | Claim | Disposition | Oracle anchors | Executable anchor | Result |
|---------|-------------|------------------|-------|-------|-------------|----------------|-------------------|--------|
| homepage:block-drag-inline-caret | base-acceptance | issue body/video and `#issuecomment-5181191082` | after-release | Welcome moves to the chosen position without `removeChild`/RuntimeError | required | model@after-release,runtime-errors@after-release | `test: apps/plite/tests/plite-browser/donor/examples/plate-dnd-cross-editor.test.ts#moves after target insertion and leaves a third editor isolated` | pass: exact Chrome fixture reorders `source|keep` to `keep|source`; full fixture reports zero product errors 5/5 |
| homepage:block-drag-inline-caret | base-acceptance | issue acceptance criteria | follow-up | typing and selection remain usable after drop | required | follow-up-input@follow-up | `test: apps/plite/tests/plite-browser/donor/examples/plate-dnd-cross-editor.test.ts#moves after target insertion and leaves a third editor isolated` | pass: follow-up editing green in every one of five exact-Chrome fixture repetitions |
| homepage:block-drag-inline-caret | reporter-confirmation | `#issuecomment-5314465244` | after-release | original crash is gone and block drag works | required | model@after-release,runtime-errors@after-release | `test: apps/plite/tests/plite-browser/donor/examples/plate-dnd-cross-editor.test.ts#moves after target insertion and leaves a third editor isolated` | pass: block drag completes and runtime error recorder stays empty 5/5 |
| homepage:block-drag-inline-caret | reporter-delta | `#issuecomment-5314465244` | during-action | no unexpected inline caret appears during drag/drop | required | dom-native@during-action,geometry-paint@during-action | `test: apps/plite/tests/plite-browser/donor/examples/plate-dnd-cross-editor.test.ts#does not paint a text cursor while a same-editor block drag is held` | pass: native selection false and visible Plite cursor count 0 in Chrome 5/5; pre-fix package and homepage probes were red |
| homepage:block-drag-inline-caret | latest-reporter-delta | `#issuecomment-5385433072` and screenshot asset `6a631ebf-8782-4591-b013-0494e0d47d40` | during-action | the blue line at the heading/next-block boundary must not appear during the held drag | required | geometry-paint@during-action | `test: apps/plite/tests/plite-browser/donor/examples/plate-dnd-cross-editor.test.ts#does not paint a text cursor while a same-editor block drag is held` | pass: exact Chrome cursor count 0 while `body.dragging=true` in 5/5 native held-state runs |

Reporter oracle matrix:
| Case ID | Observation | Phase | Applies | Positive assertion | Forbidden state | Proof layer | Executable anchor | Result |
|---------|-------------|-------|---------|--------------------|-----------------|-------------|-------------------|--------|
| homepage:block-drag-inline-caret | model | after-release | yes | target order changes once without document corruption | unchanged/reversed order or corrupted document | browser: Playwright plus exact-chrome | `test: apps/plite/tests/plite-browser/donor/examples/plate-dnd-cross-editor.test.ts#moves after target insertion and leaves a third editor isolated` | pass: direct fixture ends `keep|source` 5/5; homepage assertion retained but final host blocked independently |
| homepage:block-drag-inline-caret | dom-native | during-action | yes | native selection is empty and block-drag DOM remains active | collapsed text selection/caret inside the editor | browser: Playwright plus exact-chrome | `test: apps/plite/tests/plite-browser/donor/examples/plate-dnd-cross-editor.test.ts#does not paint a text cursor while a same-editor block drag is held` | pass: `bodyDragging=true`, native selection inside false, 5/5 |
| homepage:block-drag-inline-caret | focus | during-action | yes | editor is unfocused while the block drag owns input | editor or unrelated control steals focus | exact-chrome | `test: apps/plite/tests/plite-browser/donor/examples/plate-dnd-cross-editor.test.ts#does not paint a text cursor while a same-editor block drag is held` | pass: source editor unfocused in 5/5 native held-state runs |
| homepage:block-drag-inline-caret | popup | during-action | no | N/A: #5070 does not involve a popup or toolbar | N/A: no popup/toolbar state exists in this workflow | N/A: issue scope has no popup | N/A: issue scope has no popup | N/A: issue scope has no popup |
| homepage:block-drag-inline-caret | geometry-paint | during-action | yes | Plate's block drop line may show at the target and zero visible Plite text cursors exist | any visible `[data-plite-drop-cursor]`, including the blue line in Felix's screenshot | exact-chrome | `test: apps/plite/tests/plite-browser/donor/examples/plate-dnd-cross-editor.test.ts#does not paint a text cursor while a same-editor block drag is held` | pass: visible cursor count 0 in Chrome 5/5 and Playwright 5/5 |
| homepage:block-drag-inline-caret | runtime-errors | after-release | yes | zero product-origin console/page errors and no RuntimeError screen | `removeChild`, React DOM, or other product-origin runtime error | browser: Playwright plus exact-chrome | `test: apps/plite/tests/plite-browser/donor/examples/plate-dnd-cross-editor.test.ts#moves after target insertion and leaves a third editor isolated` | pass: extension-free exact Chrome runtime recorder empty 5/5; Chrome profile noise is extension-owned and named |
| homepage:block-drag-inline-caret | follow-up-input | follow-up | yes | editing remains usable after the moved block | lost focus, failed edit, wrong text, or unusable selection | browser: Playwright plus exact-chrome | `test: apps/plite/tests/plite-browser/donor/examples/plate-dnd-cross-editor.test.ts#moves after target insertion and leaves a third editor isolated` | pass: move-and-edit test green in exact Chrome 5/5 |

Proof receipts:
| Case ID | Attempt | Claim | Command | Result | Ref | Input digest | Input count | Inputs | Host | Latest input mtime | Proof started | Proof ended | Retries | Receipt ID |
|---------|---------|-------|---------|--------|-----|--------------|-------------|--------|------|--------------------|---------------|-------------|---------|------------|
| homepage:block-drag-inline-caret | 2 | completed | "/usr/bin/env" "PLAYWRIGHT_BASE_URL=http://127.0.0.1:3102" "PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" "PLAYWRIGHT_WORKERS=1" "pnpm" "--filter" "plite" "exec" "playwright" "test" "tests/plite-browser/donor/examples/plate-dnd-cross-editor.test.ts" "--config" "playwright.config.ts" "--project" "chromium" "--repeat-each=5" "--workers=1" | pass: exit 0 in 20492ms | dirty:a525367f60000a33055e727db062ccc610880ea9 | sha256:f5355c53090057b17560ad1f97b323cbb702672cf1569bc3cb2cac31af85f04d | 16 | apps/plite/next.config.ts,apps/plite/playwright.config.ts,apps/plite/scripts/plite-browser-runner.mjs,apps/plite/scripts/run-plite-browser.mjs,apps/plite/tests/plite-browser/donor/examples/plate-dnd-cross-editor.test.ts,apps/www/src/app/(app)/examples/plite/_examples/plate-dnd-cross-editor.tsx,apps/www/src/app/(app)/examples/plite/plite-example-loaders.tsx,apps/www/src/app/(app)/examples/plite/plite-example-registry.ts,packages/dnd/src/DndPlugin.slow.tsx,packages/dnd/src/internal/DndStorePlugin.ts,packages/plite-react/src/components/editable.tsx,packages/plite-react/src/editable/clipboard-input-strategy.ts,packages/plite-react/src/editable/input-router.ts,packages/plite-react/src/editable/runtime-drag-events.ts,packages/plite-react/test/dom-coverage-native-bridge-contract.test.ts,tooling/e2e/homepage-dnd.test.ts | pid:63269;started:2026-08-24T12:58:18.000Z;base-url:http://127.0.0.1:3102;browser:exact-chrome:macos;browser-executable:/Applications/Google Chrome.app/Contents/MacOS/Google Chrome;browser-version:Google Chrome 151.0.7922.173 | 2026-08-24T12:52:16.343Z | 2026-08-24T13:01:04.838Z | 2026-08-24T13:01:25.332Z | 0 | sha256:db76a1903e2ccf4b604ecd891b3c7b2c073e5734456d0bfd1d321cb434cd6c8e |

Affected corpus replay:
| Owner | Affected cases | Pre-edit baseline | Last owner edit | Combined command | Receipt input digest | Result |
|-------|----------------|-------------------|-----------------|------------------|----------------------|--------|
| Plite React drag runtime/drop-cursor projection plus Plate DnD handled declaration | `homepage:block-drag-inline-caret` | pass: Plite React 24/24, DnD 33/33, and existing homepage DnD 1/1 on base `a525367f` | 2026-08-24T12:52:16.343Z | Plite React 1093/1093 serial; focused Plite React 25/25; DnD 33/33 and slow 5/5; turbo typecheck 13/13; exact Chrome full fixture 15/15 | sha256:f5355c53090057b17560ad1f97b323cbb702672cf1569bc3cb2cac31af85f04d | pass: all affected behavior and types green on final bytes |

Gate failure closure:
| Gate | Failure signal | Classification | Resolution | Final rerun |
|------|----------------|----------------|------------|-------------|
| DnD focused command | `pnpm --filter @platejs/dnd test -- DndPlugin.slow.tsx` matched no test file | command-shape proof-host failure before product assertion | use the owning package test command without the invalid filter | pass: `pnpm --filter @platejs/dnd test` ran 33/33 |
| fresh www host | attempted webpack commands were invalid; isolated Turbopack `/` and `/view/editor-ai` return 500 because tracked `apps/www/src/__registry__/index.tsx` imports many source files absent even at `HEAD` | pre-existing proof-host/source-registry failure before final assertion | preserve unrelated servers and generated output; use the fresh direct Plite owner fixture, and do not claim final homepage green | pass: owning fixture is fresh and exact homepage remains an explicit caveat that cannot authorize public fixed/completed wording |
| homepage E2E final | current `/` renders its shell but the preview has no editor because `/view/editor-ai` hits the same generated import failure | pre-assertion host failure, not product failure | retain the exact homepage test and run the direct package-owned same-editor Plate-DnD fixture | pass: direct Chrome owner fixture 5/5; homepage not claimed green |
| Plite React full default runner | first run failed 26 unrelated DOM-strategy cases and second failed 4, almost all timeouts under shared-machine parallel load | runner oversubscription; focused drag test stayed green and failures shrank when load dropped | rerun the complete suite with one file worker | pass: 75 files, 1093 tests, 0 failures in 105.74s |
| managed proof receipt | managed runner rejected diagnostic `--repeat-each=5` and `--workers=1` before opening the case | command-shape failure | use documented direct Playwright mode against the fresh managed static host | pass: final receipt command ran 15/15 and emitted `sha256:3357e62e1e0ed75bb867b8a7b95d17d216cbf79874c130c683d6dc9b02bd3820` |

Failed fix history:
| Case ID | Attempt | Failure signal | Failure kind | Prior claim invalidated | Regression repair | Workflow test | Architecture trigger | Best API / layer plan | Resume state |
|---------|---------|----------------|--------------|-------------------------|-------------------|---------------|----------------------|-----------------------|--------------|
| homepage:block-drag-inline-caret | 1 | Felix's 2026-08-23 Beta screenshot still shows the blue insertion line after the 2026-08-19 verified-local 5/5 claim | reporter-contradiction | yes: attempt-1 red/green, receipts, local completion, and status authority revoked | repair-now: `.agents/rules/regression/scripts/validate-regression-plan.mjs` requires cumulative reporter evidence, phase-specific visible oracles, and failed-fix architecture proof | pass: Regression workflow suite 49/49 and resource sync exact on 2026-08-24 | yes: ui-repairs-substrate because Plate UI selection work tried to repair Plite cursor ownership | best-api: existing handled signal accepted; plite-plan: `docs/plans/5070-suppress-claimed-drop-cursor.md` accepted for execution | reproduced: Plite React 2 red, DnD slow 2 red, and exact homepage held-drag cursor 1 red |

Architecture pressure:
| Case ID | Failed fix count | Triggers | Verdict | Best API | Layer plan | Proof |
|---------|------------------|----------|---------|----------|------------|-------|
| homepage:block-drag-inline-caret | 1 | ui-repairs-substrate | escalate | required: best-api keeps the existing public handled-event signal; no new flag, API, or compatibility path | plite-plan: `docs/plans/5070-suppress-claimed-drop-cursor.md` | accepted: current source shows `pipeHandler` returns handled, Plite runtime discards it before cursor paint, and DnD claims only `drop` |

Proof-host readiness:
| Case ID | Source owner | Runner / route / host | Freshness evidence | Generated/export boundary | Result |
|---------|--------------|-----------------------|--------------------|---------------------------|--------|
| homepage:block-drag-inline-caret | Plite React drag runtime/drop-cursor projection plus Plate DnD handled-event declaration | package Vitest/Bun tests; fresh source-built `apps/plite` direct Plate-DnD owner fixture; exact homepage red before fix | `HEAD == origin/next == a525367f60000a33055e727db062ccc610880ea9`; final receipt fingerprints all 16 inputs | source packages and direct fixture are authoritative; no generated/template edit, alias, stub, or route bypass counted | pass for owner-level local candidate; exact homepage final host caveat blocks pushed/fixed claim |

Patch delegation:
| Case ID | Red test | Allowed owner/files | Required proof/stability | Patch return evidence | Result |
|---------|----------|---------------------|--------------------------|-----------------------|--------|
| homepage:block-drag-inline-caret | Plite React: 2 red (`undefined` versus true/false ownership); DnD slow: 2 red (`undefined` versus owned/unowned); exact `/` Chromium: visible cursor count 1 versus 0 | Plite React drag runtime/projection; DnD store declaration; package tests; homepage and direct fixture E2E | package red/green; owner fixture Chrome 5/5; original order/error/follow-up claims preserved | root cause: Plite discarded handled `dragOver` before cursor projection; durable fix propagates ownership and DnD claims only active block drags; one `@platejs/dnd` patch changeset; Autoreview N/A; homepage host caveat | pass: candidate-local packet returned complete evidence |

Stability:
| Case ID | Executable proof / host | Required runs | Results | Retry count | Decision |
|---------|-------------------------|---------------|---------|-------------|----------|
| homepage:block-drag-inline-caret | direct same-editor Plate-DnD owner fixture; extension-free Google Chrome 151 | 5 full-fixture repetitions | pass: 15/15 tests; held-drag row 5/5 | 0 | keep |
| homepage:block-drag-inline-caret | direct same-editor Plate-DnD owner fixture; connected exact Google Chrome 151 native CDP ledger | 5 held-drag repetitions | pass: body dragging true, visible cursor 0, native selection false, editor focus false; clean reorder/teardown 5/5 | 0 | keep |

Packet decisions:
| Case | Executable evidence | Decision | Claim width | Residual risk | Next owner |
|------|---------------------|----------|-------------|---------------|------------|
| homepage:block-drag-inline-caret | attempt 2 package red/green, affected corpus, direct owner fixture, Chrome 5/5, and final receipt | keep as candidate-local | current checkout and direct Plite owner fixture only; no pushed/integration/shipment/public completion claim | exact homepage cannot freshly compile because of a pre-existing generated-registry violation; pushed-ref replay remains required | integration owner after push |

Methodology deltas:
| Case | Miss or owner checked | Decision | Durable owner/change | Focused proof | Trigger/result |
|------|-----------------------|----------|----------------------|---------------|----------------|
| homepage:block-drag-inline-caret | attempt 1 asserted native selection while the reported blue line was a separate Plite cursor DOM node | repair-now | `.agents/rules/regression/scripts/validate-regression-plan.mjs` requires cumulative reporter deltas, phase-specific visible paint/DOM oracles, failed-fix invalidation, and architecture pressure | pass: stale attempt-1 plan fails semantic validation; Regression workflow suite passes 49/49; resources exact | reporter contradiction on 2026-08-23; attempt 2 uses the rendered cursor owner |

Attempt 2 final findings:
- The reported blue line is Plite's rendered `data-plite-drop-cursor`, not a
  native selection caret. Attempt 1 cleared native selection and therefore
  proved the wrong field.
- Plate's handler pipeline already returns whether a plugin handled a drag
  event. Plite React called that pipeline during `dragOver` but discarded its
  result, then painted its own text cursor unconditionally.
- The durable owner fix propagates that existing boolean through the internal
  drag runtime to `EditableDOMRoot`. A handled `dragOver` clears and suppresses
  Plite's cursor. Plate DnD returns handled only while its store reports an
  active React-DnD block drag, so unrelated native drags keep Plite behavior.
- This adds no public API, flag, timer, CSS exception, or app-owned workaround.
  The internal `HandleEditableDrag` return widens only to carry the existing
  handler contract through private Plite React modules.
- Fresh `www` compilation is independently blocked because its tracked
  generated registry imports many source files absent even at `HEAD`. No
  generated file, alias, stub, or unrelated source was changed to hide that.
  Final browser proof therefore uses the fresh direct Plite Plate-DnD fixture
  at the same owning package/runtime boundary. The exact homepage test remains
  in place and its final route is not claimed green.

Verification evidence:
- Red: focused Plite React returned `undefined` instead of `true`/`false` in
  two ownership cases; DnD slow returned `undefined` in two active/inactive
  cases; exact homepage Chromium rendered one visible Plite cursor while held.
- Green: Plite React ownership 25/25; DnD fast 33/33; DnD slow 5/5 with 29
  assertions; source-first Turbo typecheck 13/13.
- Affected corpus: Plite React 75 files and 1093 tests pass with one file
  worker. The default parallel runner timed out unrelated DOM-strategy tests
  twice under shared-machine load; the complete serial replay closed that gate.
- Browser: the fresh direct Plite fixture passed once in managed Chromium.
  Connected Chrome native mouse/CDP proof passed 5/5 with
  `body.dragging=true`, visible cursor count 0, native selection outside the
  editor, editor unfocused, correct reorder, and clean teardown.
- Exact Chrome 151.0.7922.173 then ran the full three-test Plate-DnD fixture
  five times: 15/15, retries 0. That includes move, held-cursor, runtime-error,
  follow-up editing, copy-intent, and bystander-isolation coverage.
- Chrome profile logs contained one extension-owned `removeChild` error and
  two extension message-channel errors. The extension-free Chrome run's
  product runtime recorder was empty in every repetition.
- Changeset: `.changeset/prevent-text-cursor-block-drag.md` applies one patch
  entry to `@platejs/dnd`. `@platejs/plite-react` is absent on `origin/main`,
  so a second branch-relative release note would violate Changeset policy.
- Lint and Autoreview were not run by explicit user instruction.

Final handoff:
- decision: keep as `candidate-local` on dirty ref
  `a525367f60000a33055e727db062ccc610880ea9`.
- product owners: four private Plite React drag/projection files and Plate
  DnD's private store declaration.
- durable proof: package ownership tests, homepage regression assertion, and
  the direct same-editor Plate-DnD browser fixture.
- architecture verdict: use the existing handled-event law end to end; do not
  add public surface or app-specific suppression.
- public claim: local, uncommitted, unpushed, and not shipped. Keep #5070 open;
  do not add `completed`. The exact pushed ref requires a new homepage replay
  after the independent registry build violation is repaired. Local status:
  `https://github.com/udecode/plate/issues/5070#issuecomment-5395578051`.
- next owner: shared-checkout CI coordinator may include these stable bytes;
  integration proof must use its resulting pushed ref.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | attempt 2 is complete as a verified local regression packet |
| Where am I going? | comment the local candidate, freeze writes, and hand the exact bytes to the shared-checkout CI coordinator |
| What is the goal? | suppress Plite's text cursor only while Plate DnD owns an active block drag |
| What have I learned? | the existing handled-event result was lost before cursor paint; native selection was never the residual line |
| What have I done? | repaired ownership propagation, added package and browser regression tests, passed affected corpus and exact Chrome 5/5, and captured a matching receipt |

Open risks:
- The exact homepage cannot freshly compile because its tracked generated
  registry imports source files absent at `HEAD`. The package-owned interaction
  is proved; the exact homepage is not claimed green on final bytes.
- The candidate is uncommitted and unpushed. Public fixed/completed wording,
  the `completed` label, and shipment claims remain forbidden until a pushed
  ref replays the exact homepage with matching fingerprints.

Attempt 1 invalidated workflow history:
| Step / command | Owner | Elapsed / expected | Cause | Evidence value | Repair/result |
|----------------|-------|--------------------|-------|----------------|---------------|
| shared-checkout `www` host | concurrent linter-migration session | much slower than expected; stop output exceeded the intended cap | unrelated invalid `const` rewrites prevented compilation and emitted accumulated server logs | proves shared host is not current-route ready; no issue evidence | moved proof to a clean exact-ref checkout; do not repeat or touch the other session's files |
| clean exact-ref homepage | `www` dependency graph | one focused navigation | `/` fails resolving `@shikijs/core`, while `/blocks/playground` renders | exact-route blocker and valid proxy boundary | stop the server and rerun a full frozen install before any product edit |
| exact Chrome DnD setup | Browser/Chrome host | two instrumented probes | Browser read-only evaluation omits `document.getSelection`; first failed probe left the mouse pressed until the next call | direct proxy visibly reproduces the caret and CDP can read native selection | released the mouse immediately; switched native selection reads to CDP `Runtime.evaluate`; do not repeat the unsupported API |
| exact Chrome final ledger | Chrome extension profile | several pre-action readiness failures before the final ledger | Playwright isolated-world setup and the Chrome helper's fixed mouse deadline stalled under extension-injected work | proves the proof host, not Plate, was the remaining blocker | raw CDP state reads plus native `Input.dispatchMouseEvent`, live-handle hit checks, explicit route readiness polling, and held-mouse cleanup produced the final 5/5 ledger |

Attempt 1 invalidated findings:
- Live #5070 is OPEN and still carries `completed`, but Felix's latest retest
  confirms the original crash is gone and reports a residual inline caret.
  The old crash proof remains valid; the blanket completed status does not.
- The previous durable E2E already asserts crash absence, document order,
  follow-up typing, and selection. It missed the in-drag visual caret field.
- On the clean direct Playground proxy, exact Chrome ends the drag with the
  editor focused and a collapsed native selection at path `32,0`, the final
  empty block; the stray caret is visibly painted there.
- The causal source path is the drag handle's `editor.api.dom.blur()` followed
  by `editor.update.selection.collapse()`. Collapse preserves a text caret while
  the following `BlockSelectionPlugin` write switches interaction modes. The
  adjacent block-selection-area owner uses the durable law instead: blur, then
  clear the text selection before setting block selection.
- The drop-line lifecycle is not the owner of the residual symptom.
- The old E2E did not merely miss one assertion: its `data-block-id` selectors
  no longer existed, and `dragTo` without an established text selection could
  pass while skipping the reported native-caret state.
- Exact Chrome handle geometry changes on hover. Pressing pre-hover coordinates
  hits editor chrome instead of the draggable button and creates a false caret
  result. Every valid replay re-resolves the handle after hover and confirms
  `elementsFromPoint` contains `aria-label="Drag block"` before dragging.
- The durable fix is one selection-mode correction: `collapse()` becomes
  `clear()`. A brief `mousedown.preventDefault()` experiment stopped HTML5 DnD
  and was reverted before final proof.

Timeline:
- 2026-08-19: selected the next Felix-authored issue (#5070), read the live
  reporter contradiction and prior proof, loaded Regression methodology,
  created this goal/plan, and captured the exact new case before product work.
- 2026-08-19: isolated a clean detached proof checkout at `1fb72c5`, recorded
  the exact homepage dependency blocker, reproduced the native selection/caret
  jump on the direct Playground proxy in exact Chrome, and paused Patch until
  exact `/` host readiness is repaired.
- 2026-08-19: restored exact `/` with the supported webpack dev lane on port
  3107, captured focused red/green, passed five final matching-fingerprint
  Chromium runs, passed direct `www` TypeScript, and posted the local-candidate
  status at `#issuecomment-5343933825`.
- 2026-08-19: replaced the unstable isolated-world/mouse wrapper in the proof
  instrumentation with raw Chrome CDP reads and native mouse dispatch, then
  passed five retry-free full exact-Chrome replays. Each replay asserted the
  held-drag state before release and the complete post-drop editing state.
- 2026-08-19: posted the verified-local 5/5 evidence at
  `#issuecomment-5344392260`, kept #5070 open, and removed the stale
  `completed` label. No push or integration claim was made.

Decisions and tradeoffs:
- Split Felix's residual inline-caret observation into one new executable case
  while preserving the original crash case; do not weaken or relabel the old
  test to make the new symptom look covered.

Review fixes:
- N/A so far; the user explicitly stopped Autoreview for this session.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Shared host compiled unrelated linter-migration rewrites and emitted oversized stop logs | 1 | clean exact-ref host with capped logs | isolated; shared files preserved |
| Clean exact-ref `/` could not resolve `@shikijs/core` after an `--ignore-scripts` install | 1 | full install, then use Next webpack instead of Turbopack externalization | resolved without alias/source edit |
| Browser read-only `document.getSelection()` failed mid-drag | 1 | release mouse, use CDP `Runtime.evaluate` | resolved; proxy selection captured |
| First full install failed because Bun's postinstall was skipped | 1 | run Bun's documented installer, then full frozen install | resolved |
| Existing E2E failed before the case on removed `data-block-id` selectors | 1 | use current visible Plite element/path selectors | resolved; exact caret red reached |
| Manual mouse path did not perform HTML5 drop | 1 | use native mouse start for caret field and Playwright `dragTo` for deterministic drop | resolved in executable test |
| Pre-hover Chrome handle coordinates became stale after hover layout | 2 | re-read geometry after hover and verify hit target | resolved; exploratory exact Chrome full case green |
| `mousedown.preventDefault()` removed the caret but also blocked DnD | 1 | revert and keep the selection-mode fix only | resolved |
| Port 3000 was taken by unrelated `informed-fe-v3` | 1 | preserve that process and move Plate proof to 3107 | resolved |
| Turbopack exact `/` lost transitive `@shikijs/core` | 2 hosts | use supported Next webpack dev lane, no alias or source edit | resolved; exact `/` returns 200 |
| Chrome profile extensions flooded hydration logs and killed the first dev host | 1 | filter server output and restart isolated host | resolved for Chromium; Chrome profile remains noisy |
| Exact-Chrome Playwright isolated-world setup stalled after reload | repeated pre-action readiness probes | use the documented raw CDP capability for read-only state and poll explicit route readiness | resolved; no failed probe executed the case |
| Exact-Chrome helper timed out on `Input.dispatchMouseEvent` | repeated pre-action/input attempts before the final ledger | use documented raw CDP `Input.dispatchMouseEvent` with an explicit deadline and always release a held mouse in `finally` | resolved; exact held-drag 5/5 |
| Raw CDP keyboard dispatch is unsupported | 1 | retain Chrome CUA keypress for End, `!`, and selection after raw native mouse input | resolved; follow-up input 5/5 |
| `pnpm --filter www typecheck` could not find the unbuilt `plate` CLI | 1 | run direct app `tsc --noEmit` after focused browser proof | resolved; direct TypeScript passes |

Attempt 1 invalidated verification evidence:
- Goal closure: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5070-block-drag-inline-caret-regression.md` returned `[autogoal] complete`.
- Red: `PLAYWRIGHT_BASE_URL=http://localhost:3000 pnpm exec playwright test tooling/e2e/homepage-dnd.test.ts --config tooling/config/playwright.config.ts --project chromium` failed the post-drop native caret oracle with `Expected: false`, `Received: true` before the selection fix.
- Focused green: the same case passed after `selection.clear()`.
- Stability green: `PLAYWRIGHT_BASE_URL=http://localhost:3107 pnpm exec playwright test tooling/e2e/homepage-dnd.test.ts --config tooling/config/playwright.config.ts --project chromium --repeat-each=5 --workers=1` passed 5/5 in 57.6 seconds with no retry.
- TypeScript green: `pnpm --filter www exec tsc --noEmit -p tsconfig.json`.
- Exact Chrome final 5/5 on `/`: every live post-hover hit stack contained
  `aria-label="Drag block"`; while the native mouse remained pressed and moved,
  `body.dragging=true`, inline caret false, editor unfocused, and editor
  scrollTop 0. After release, intro path 0, Welcome path 1, no caret, no visible
  drop line, no dragging class, and zero product-origin errors. `!` then typed
  and selected inside Welcome. The ledger was retry-free after route readiness;
  pre-action readiness failures executed no case and were excluded.
- Dirty local ref: `1fb72c581095f23ddba3f597f41e8b10608283ef`.
- Final issue-owned SHA-256: DnD source `fc07d822f5b8395d807952616084a014b6d0aac461831dfbda7ad7b99d6092d0`; E2E `66ccb0bf5749485faffee90286b5cc0d43af385a760923ecd84837163550acab`; harness `383d6fd0f19d0db91db1b2095d51e35246d487f77fc79de83aa13943344ff544`.
- Red baseline DnD SHA-256: `13a3df2ef2ac014021b855705bc907fcda79ca48db315d786bb3ef5fdd83dde7`.
- Clean proof fixtures: Playground preview `5ad17c49f03cf5be585fcb1b3228c3fe145316805bb943e58219514af95693f3`; Playground demo `1f02c65d19b923bfa2cb0ea8dc347f1fa69da2c7fbf2948d07fd681cd6a56ab4`.
- Current shared fixture fingerprints differ under the concurrent linter migration: preview `77133a21f2dd94592ecfc80a51eff3f4f0632ea46ae2cc13a7ad4d09c9bc4e1b`; demo `e5374ee7ed7d3236577d764eae52633bc0ddc92a5ed4917833e575096b38989e`. Those unrelated edits stay outside this issue-owned verified-local claim and still block a whole-checkout integration claim.
- Public status: initial candidate comment
  https://github.com/udecode/plate/issues/5070#issuecomment-5343933825;
  verified-local 5/5 update
  https://github.com/udecode/plate/issues/5070#issuecomment-5344392260.

Attempt 1 invalidated handoff:
- executable cases: one case, `homepage:block-drag-inline-caret`; keep as `verified-local`.
- changed files: `apps/www/src/registry/components/editor/dnd.tsx`; `tooling/e2e/homepage-dnd.test.ts`; this transient goal plan.
- design decisions: Plate registry owns the behavior; clear text selection before block selection; no package/runtime/API change.
- tests and proof: focused red/green, Chromium 5/5, direct TypeScript, and exact Chrome held-drag 5/5 with all native/post-input fields green.
- source/generated sync: no agent source or generated product output changed; full clean install completed; no registry/template build run.
- P1 and agent-native findings: N/A; user explicitly stopped Autoreview and no agent workflow changed. Lint was not run by instruction.
- changeset: N/A; no published package changed.
- public state: verified-local comment posted; issue stays open; stale
  `completed` label removed; no fixed/completed wording used.
- residual risks and next owner: work is unpushed. Replay on the exact pushed ref with matching whole-tree inputs before fixed/completed wording; the shared linter migration remains outside this packet.

Attempt 1 invalidated reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | verified-local handoff with pushed-ref integration open |
| Where am I going? | replay on the exact pushed ref only when push is authorized |
| What is the goal? | remove #5070's residual inline caret without regressing block move, crash safety, typing, or selection |
| What have I learned? | collapse preserved the caret; stale selectors, stale post-hover geometry, and broken hosts can each fabricate or hide DnD proof |
| What have I done? | repaired the owner and durable test, passed focused red/green, 5/5 Chromium, TypeScript, and 5/5 exact Chrome held-drag proof, while keeping the issue open and the claim local |

Attempt 1 invalidated risks:
- The verified candidate is unpushed. No fixed, shipped, or completed claim is
  valid until the exact pushed ref passes the same proof.
- Unrelated concurrent linter-migration edits prevent a whole-current-checkout
  runtime claim; issue-owned production/test/harness fingerprints do match the
  clean proof host exactly.
