# date popover first-click regression

Objective:
Fix Date popover first-click regression; done when the exact reporter path is red before the fix, green for 5 retry-free runs after it, the real Playground confirms first-click open/reopen, and P1 review passes.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-31-date-popover-first-click-regression.md

Template:
docs/plans/templates/regression.md

Primary template:
docs/plans/templates/regression.md

Applied packs:

- browser

Regression source:

- target bug / surface / corpus: Date popover in the Plate Playground requires a second click to open, including after closing and trying to reopen it.
- lane and current source owner: Plate registry Date component at `apps/www/src/registry/components/editor/date.tsx`; exact shared browser case at `apps/www/tests/browser/inline-void-first-click.spec.ts`.
- selected executable test cases: `date-first-click:open-reopen` only.
- tested ref or dirty-state boundary: base ref `bc647af42db2f309a2ece9e424c11f77f86cc121`; final dirty proof will bind every issue-owned source/test/host input by SHA-256 without relying on unrelated workspace state.
- route / proof host and freshness method: reporter route is the Plate Playground at `http://localhost:3001`; final proof starts a fresh source-built www process and fresh exact-Chrome page. The in-app Browser is support proof only because its BODY-focus setup passed while the reporter's H2-selection setup failed in Chrome.
- invocation mode / timebox: explicit `$regression`, one-shot execution, no timebox.

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

Verification surface:

- selected executable package/DOM/Playwright/Browser/Chrome/device commands
- exact final-case replay and retry-free stability when required
- source/host freshness proof and exact final ref
- generated proof receipts and affected-corpus replay
- `node .agents/skills/regression/scripts/validate-regression-plan.mjs docs/plans/2026-08-31-date-popover-first-click-regression.md --complete`
- P1 autoreview for non-trivial implementation packets
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-31-date-popover-first-click-regression.md`

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

Boundaries:

- allowed source owners: `apps/www/src/registry/components/editor/date.tsx` and the smallest proven interaction owner if exact tracing shows date-local code cannot own the fix.
- allowed proof/test owners: existing `apps/www/tests/browser/inline-void-first-click.spec.ts`, focused existing Date component tests, Regression receipt/plan files, and temporary browser diagnostics outside durable product paths.
- generated/source boundary: do not edit `templates/**`, generated registry output, or generated plugin types; source registry owns the component and `pnpm --filter www build:registry` runs only if registry source changes require current generated output on `next`.
- browser/device claim width: macOS exact Chrome matching the recording for the whole final replay and 5/5 warm ledger; in-app Browser remains support proof only.
- forbidden product/API/release/public mutations: no public API change, no package release, no GitHub mutation, no commit, no push, no PR.
- orchestration mode and writer ownership: sequential main-thread execution per repository instructions; Regression supervises and the same thread applies the one normalized Patch packet. No parallel writers or shared-host users.

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

- current phase: completed local closure
- current executable case: `date-first-click:open-reopen`
- current case status: completed locally on attempt 9; unit RED/green, reporter-profile Computer Use 5/5, exact Chrome receipt, generated registry, typecheck, and direct P1 review pass
- next owner: Regression closure
- goal status: complete

Completion rule:

- Do not call `update_goal(status: complete)` with unchecked Work Checklist
  items, unresolved Completion Gates, open required cases, or missing
  executable proof.
- Supporting case tables never replace tests or canonical gates.
- Run `check-complete.mjs` only after fresh evidence and risks are recorded.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured | yes | Explicit requirement: clicking the Date must open its popover immediately. Recording adds first physical click and first-click reopen after close; no commit/push/public mutation requested. |
| Regression methodology loaded | yes | Read `.agents/skills/regression/references/methodology.md` completely before goal/test/product work. |
| Active goal checked or created | yes | `get_goal` returned none; created the matching active goal for this plan. |
| Current source owner and tested ref recorded | yes | `apps/www/src/registry/components/editor/date.tsx`; base ref `bc647af42db2f309a2ece9e424c11f77f86cc121`. |
| Executable test cases discovered | yes | Existing exact-browser owner `apps/www/tests/browser/inline-void-first-click.spec.ts`; Date component test `apps/www/src/registry/components/editor/date.slow.tsx` lacks the real editor capture/focus host. |
| Cumulative reporter evidence resolved | yes | User request plus transcript/contact sheet from `CleanShot 2026-08-31 at 18.13.49.mp4`; no later reporter delta. |
| Reporter oracle matrix resolved | yes | `date-first-click:open-reopen` matrix below records first physical click, popup, focus setup, runtime errors, and reopen follow-up; unrelated model/pointer/layout rows are explicitly N/A. |
| Regression semantic validator ready | yes | Current validator path: `.agents/skills/regression/scripts/validate-regression-plan.mjs`; run after the tables below are filled. |
| Route/proof-host readiness plan recorded | yes | Fresh www source process on literal `http://localhost:3001`, fresh Browser page, plus focused existing Plite browser runner as durable/affected-corpus proof. |
| Patch delegation boundary recorded | yes | One case; allowed date component and exact first-click test only unless trace proves another current owner. No API/generated/template/public/Git mutations. |
| Orchestrator writer ownership recorded | yes | Sequential main-thread Patch execution; no subagent or parallel writer. |
| Output budget strategy recorded | yes | Targeted `rg`, exact source/test reads, capped logs; exclude generated/build/node_modules trees unless they become the named owner. |
| Claim width and blocked rules recorded | yes | Local macOS desktop Browser claim only. Block only if the fresh exact www route cannot run or the reporter gesture cannot be made executable after safe host repair. |
| Browser pack selected | yes | Browser pack materialized by the regression template. |
| Browser route / app surface identified | yes | Plate Playground, `http://localhost:3001`, `Dates and Equations`, button `January 15, 2024`. |
| Browser tool decision recorded | yes | Started with the in-app Browser; switched to Chrome when the same BODY-focus path passed there but the recording stayed red. Exact reporter setup is now proved in the user's Chrome tab; Computer is N/A. |
| Console/network caveat policy recorded | yes | Record runtime console errors; unrelated external network failures cannot be hidden but pre-assertion host failures are repaired and rerun on unchanged product bytes. |
| Observable browser case captured | yes | `date-first-click:open-reopen`; initial native caret is physically created in `Dates and Equations` H2, then the physical pointer targets `January 15, 2024`. Current Chrome reproduces first-click absent; recording also shows close then the same two-click reopen failure. |

Work Checklist:

- [x] Skill analysis complete: Regression is the supervisor, Patch is the
      one-case worker, and executable tests are the behavior authority.
- [x] First checkpoint captures every explicit requirement before mutable work:
      the Date popover opens immediately from the first physical click and does
      the same after a close; no commit, push, PR, release, or public mutation.
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
      source and exact-route discovery. Any excluded matching affordance cites
      explicit reporter or accepted-product authority.
- [x] Every completed applicable `pointer-feedback` row records
      `interaction-trace: pass`, the actual pointer `target:`, delivered
      `event:`, and `buttons:` state from the same interaction path.
- [x] Every flash, flicker, or one-frame pointer-feedback claim uses a target-
      capture or equivalent pre-handler oracle and records
      `pre-handler-state: pass`; eventual post-handler style is insufficient.
- [x] Every reporter click reproduced through a drag surrogate proves the same
      gesture delivered a click event; a drag surrogate without the delivered
      click cannot authorize a product patch.
- [x] Every focus-first click report records the reporter's concrete setup in
      both required evidence and the focus oracle as
      `initial-focus: <concrete reporter state>`, records one real gesture as
      `event-order: <actual pointerdown/mousedown/(focus when emitted)/click trace>`,
      and proves
      `first-click-popup: open` immediately after that click. A pre-focused or
      outside-focused setup is valid only when reporter evidence matches it;
      an invented focus state or `fireEvent.click`-only test cannot close
      single-click behavior.
- [x] Every repeated focus-first contradiction whose component test stays green
      reruns against a passive popup wrapper that only reflects the component's
      `open` input and never injects a click toggle; completion records
      `component-open-owner: pass`.
- [x] When reporter video identifies concrete hit targets after locator-click
      or programmatic-selection proof stayed green, required evidence records
      `physical-hit-path: <first target -> action target>`. Browser proof drives
      both gestures from live coordinates, records
      `physical-hit-target: <actual target>` and
      `selection-origin: physical-pointer`, and completion records
      `physical-hit-target: pass`, `click-delivery: pass`, and
      `selection-origin: pass`. Locator clicks and direct Range mutation remain
      proxy evidence.
- [x] When editor capture routing branches on target/ancestor attributes,
      required evidence records
      `capture-routing-path: <target -> capture owner>`. The DOM/native oracle
      inventories the complete target-to-owner chain and the attributes read on
      their actual owners as `interaction-owner-chain: <nodes>` and
      `capture-routing-contract: <owner attributes>`; completion records both
      `interaction-owner-chain: pass` and `capture-routing-contract: pass`. A
      child-only attribute assertion is proxy evidence when capture reads the
      ancestor.
- [x] When a reporter's live tab stays red while an isolated exact-host case is
      green, required evidence inventories active dev overlays and global
      capture listeners as
      `interaction-interceptor-path: <global capture owner -> target>` and
      `external-interceptor-state: <active mode/settings>`. Product code may not
      compensate for an external owner that calls
      `preventDefault`/`stopPropagation` on the gesture;
      completion records `external-interceptor-isolated: pass` after the same
      tab is replayed with that interceptor inactive or permissive.
- [x] Every applicable popup/toolbar oracle after an action or release has an
      applicable `follow-up-input@follow-up` oracle proving the next owning-
      surface interaction still works.
- [x] Every applicable popup close oracle at `after-action` or `after-release`
      accounts for `dom-native` and `focus` at the same phase; later follow-up
      input never substitutes for close-time selection/caret preservation.
- [x] Every required caret, insertion-point, caret-accessible line, editable
      blank line/row, or text-cursor claim maps to applicable same-phase
      `dom-native` and `focus` rows plus `follow-up-input@follow-up`. Native
      browser proof replays the real interaction and asserts caret paint
      independently from wrapper height, DOM markers, and block highlighting.
- [x] Every required positive layout reference maps to same-phase
      `geometry-paint`. The oracle records `reference-geometry:`, its browser
      proof executes `layout-bounds`, and completion records
      `layout-bounds: pass`; negative-only paint or absence proof is insufficient.
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
- [x] Every managed browser receipt includes its literal `--base-url` in the
      proof command (for example `PLAYWRIGHT_BASE_URL=<url>`); a host label and
      command default may not name different ports.
- [x] Required retry-free stability runs passed with no retry.
- [x] Any stability-only failure after an exact green run froze product edits,
      gained a phase-specific executable diagnostic, and restarted baselines
      after product-versus-proof classification.
- [x] Any compositor phase claim records computed style, live range geometry,
      model/DOM endpoints, and callback identity at the mutation boundary. If
      those are final while pixels stay red, timing is rejected as the cause.
- [x] Every ordering fix exercises a pre-handler already-queued competitor and
      a delayed post-handler re-entry when either can overwrite the result; one
      ordering window cannot close the case.
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
- [x] Every target placement oracle uses a bounded visible interval with both a
      lower and upper bound; a one-sided threshold cannot prove visibility.
- [x] When behavior depends on a geometry library, a mock that records only the
      call stays proxy evidence; a real calculation or exact browser probe runs
      before the candidate can satisfy target placement.
- [x] Every final screenshot is followed by the surface settle boundary and a
      reassertion of the settled reporter final state after capture; a
      pre-capture transient poll cannot close the case.
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
      pixels captured in the named interaction phase, with known-correct
      single-layer, known-absent, and known-invalid duplicate-layer controls
      through the identical capture path. The proof records
      `positive-control: pass`, `negative-control: pass`, and
      `duplicate-control: pass`. Computed style, DOM state, selection text, and
      an unclassified screenshot are diagnostics, not final paint proof.
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

Conditional checklist closure:

- N/A: no pointer-feedback, cursor, drag, caret-paint, positive-layout,
  geometry-library, compositor, pixel-classifier, target-placement, shared CSS,
  or raw-device claim exists; the reporter oracle matrix records exact reasons.
- N/A: no screenshot-only claim is used; the final screenshot is paired with a
  settled Chrome DOM reassertion.
- N/A: no orchestrator or parallel writer ran; main-thread ownership stayed
  serialized.
- N/A: no pushed, integrated, shipped, or released claim is made; local work is
  explicitly uncommitted and unpushed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named completion threshold | yes | Close every selected executable case and methodology row | pass: unit RED/green, profile 5/5, exact Chrome 10/10, full 4/4, direct P1, and attempt-9 receipt |
| Current-source readiness | yes | Prove source owner and final tested ref/dirty boundary | pass: `date.tsx`, `date.slow.tsx`, generated `date.json`; dirty:bc647af42db2f309a2ece9e424c11f77f86cc121; receipt fingerprints current |
| Route/proof-host readiness | yes | Prove the runner/host observes current source | pass: PID 94408 on literal port 3001; exact Chrome 151 executable and reporter-profile Computer Use both replay final bytes |
| Executable regression coverage | yes | Record exact test file, red result, green result, and owning invariant | pass: passive owner and Radix-like same-gesture rows RED before fix, 5/5 unit after fix |
| E2E escalation closure | yes | Prove each case uses `unit-red:` without a new E2E or records `e2e-required:` with the exact unit/package limitation | pass: `unit-red:` owns durable coverage; no new/expanded E2E; existing untracked first-click spec is affected corpus only |
| Cumulative reporter evidence closure | yes | Map every still-applicable base acceptance and later reporter delta to a phase-specific executable oracle | pass: base request, fresh profile recording, close/reopen delta, and prior contradictions retained |
| Reporter oracle closure | yes | Resolve positive and forbidden states for all eight observations and every applicable interaction phase per case | pass: matrix complete; pointer/layout/paint/model rows carry exact N/A reasons |
| Failed-fix interrupt closure | yes | Prove every claimed-fix failure invalidated prior proof and completed automatic Regression repair | pass: attempts 1-8 invalidated and repaired; attempt 9 uses reporter-profile and tool-native proof gates; workflow 102/102 |
| Architecture pressure closure | yes | Prove every second failure or architecture trigger has Best API and layer-plan evidence | pass: existing best-api/plate-plan boundary retained; attempt 9 is Date-local and trace-backed with no API/Plite compensation |
| Proof receipt closure | yes | Validate generated final receipts against unchanged issue-owned inputs | pass: attempt-9 receipt sha256:889e506ff30ca655ff91c4482e869092f1ff57c161bd845d69bd07a626c73b92; retries 0 |
| Affected-corpus replay closure | yes | Replay all cases affected by the last shared-owner edit | pass: final digest sha256:ed25cfeca0a7d39a1eb18f3a4a0e21abc228632bcb112d055e948f0593c35baa; Date 10/10 and full 4/4 |
| Shared-style consumer closure | no | Inventory every shared selector/class consumer and prove explicit paint neutralizers do not inherit or duplicate the shared surface | N/A: no shared selector, class map, or paint style changed |
| Started-gate failure closure | yes | Rerun every requested or started gate that failed; completion requires the exact gate to pass on final bytes | pass: command/host/lint/workflow/candidate failures classified; final reruns pass |
| Smallest-probe closure | yes | Record first falsifying probe and any host repair | pass: wrong host repaired; passive owner RED and same-gesture RED isolated final owner |
| Patch delegation closure | yes | Read back one-case root-cause/red/green/proof evidence | pass: Date local gesture-start latch, generated payload, tests, receipt, and caveat recorded |
| Focused verification closure | yes | Run owning test and exact final-case replay | pass: unit 5/5, Computer Use 5/5, outside-dismiss, exact Chrome 10/10, full 4/4 |
| Stability closure | yes | Record retry-free warm runs or evidence-backed N/A | pass: reporter-profile runs 1-5 each open and close; retries 0 |
| Packet decision closure | yes | Keep/revert/quarantine/defer/block every selected case honestly | pass: attempt 9 kept; diagnostics and failed candidate shapes removed |
| Local completion status | yes | Mark every fully proved kept case and the run `completed`; record local ref/fingerprints and uncommitted/unpushed state separately | pass: completed locally on dirty base bc647af; uncommitted and unpushed |
| No duplicate registry | yes | Prove no sidecar behavior manifest/database was created | pass: executable tests remain durable behavior owner; only transient goal plan used |
| Generated/source and host repair | yes | Repair drift/host methodology or record blocked claim | pass: Node 22, correct www runner, literal port 3001, registry rebuild, changelog check, and host freshness proved |
| Orchestrator writer closure | no | Prove one shared-state writer and serialized overlapping owners/hosts, or N/A | N/A: sequential main-thread execution; no subagents or parallel writers |
| Workflow slowdown closure | yes | Repair avoidable slow/stale/noisy proof paths or defer with owner | pass: wrong path/Node/runner/port/stale-coordinate/source-map-output rows repaired; tool-native proof is now agent-native |
| Methodology delta closure | yes | Resolve repair-now/no-change/defer for every case | pass: repair-now source/template/validator/test change with 102/102 proof |
| Source/generated sync | yes | Run `pnpm install` and parity audit when agent sources changed, otherwise N/A | pass: `pnpm install`; `sync-resources.mjs --check` reports exact; direct source/mirror diffs are empty |
| Agent-native review | yes | Run for changed agent workflows or record N/A | pass: exact receipt binds bytes/browser; `tool-proof: computer-use` binds profile OS replay; 102/102 and mirrors exact |
| Final handoff contract | yes | Record tests, decisions, proof, sync, reviews, risks, and next owner | pass: final handoff section records root cause, files, gates, receipt, local status, and no next owner |
| Autoreview | no | Run P1 autoreview for non-trivial implementation changes or record N/A | N/A: current branch is `next`, where helper invocation is forbidden; targeted direct P1 review passed with zero P1 findings |
| Regression semantic plan | yes | Run `node .agents/skills/regression/scripts/validate-regression-plan.mjs docs/plans/2026-08-31-date-popover-first-click-regression.md --complete` | pass: Regression plan semantically complete on attempt-9 receipt and tool-native profile proof |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-31-date-popover-first-click-regression.md` | pass: final structural checker command below |
| Browser interaction proof | yes | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | pass: reporter-profile Computer Use OS input 5/5 plus exact Chrome 151 executable receipt |
| Browser console/network check | yes | Record console/network state or why it is not applicable | pass: `recordPliteBrowserRuntimeErrors` reports none across Date 10/10 and full 4/4; no visible runtime overlay in Computer Use |
| Browser final proof artifact | yes | Record screenshot/trace/route/native proof or exact caveat | pass: final 5/5 screenshot captured; post-capture Chrome DOM reasserts Date present, expanded false, grid hidden |
| Exact case replay | yes | For report-backed behavior, prove the exact case and all applicable end-state claim fields; otherwise N/A with reason | pass: first-click open, one-click close, first-click reopen 5/5; outside-dismiss passes |
| Final ref and fingerprints | yes | Record the replayed commit/ref and issue-owned production/test/fixture/harness SHA-256 fingerprints; any later code or generated change invalidates the result | pass: dirty:bc647af; receipt input digest ed25cfec… over 10 named inputs; receipt ID 889e506f… |
| Clean final runtime | no | Before fixed/completed wording, start a fresh process from a clean checkout at the exact final pushed ref or immutable CI artifact and prove zero tracked/untracked issue-owned runtime-input differences; local candidates record N/A with exact unpushed status | N/A: local completion only; work is uncommitted and unpushed, so no integrated/shipped claim |
| Retry-free stability | yes | For native selection/paint, focus, DnD, compositor, or React DOM lifecycle, record 5/5 warm runs with no retry in the exact reported browser/device; otherwise N/A with reason | pass: Computer Use exact profile 5/5, retries 0; exact Chrome Date rows 10/10 |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Requirement extraction and goal setup | completed | active goal plus browser-enabled Regression plan | source/host readiness |
| Current source and proof-host readiness | completed | current www PID 94408, literal port 3001, base ref, Node 22, clean/headed Chrome 151, Chrome profile, and Computer Use inventoried | discover executable cases |
| Executable case discovery and selection | completed | one Date open/reopen case; component mock limitation and existing untracked browser proof identified | smallest probe |
| Cumulative reporter evidence inventory | completed | fresh 18:13 recording invalidated prior attempt-8 completion; reporter profile and prior seven failed attempts retained | reporter oracle expansion |
| Reporter oracle expansion | completed | model/DOM/focus/popup/geometry/error/follow-up rows resolved with reporter-profile marker | semantic validation |
| Pre-implementation semantic validation | completed | active plan structurally valid under generated validator | smallest probe |
| Smallest high-value probe | completed | BODY-focus Browser green; exact OS profile red; clean/headed Chrome green; stale-coordinate and wrong-host runs revoked | reproduce/classify |
| Reproduce, classify, and red test | completed | passive Popover owner test RED; Radix-like focus-open/click-close test RED; Computer Use exact profile RED | Patch attempt 9 |
| One-case Patch delegation | completed | Date owns closed open, snapshots gesture start, uses live open ref, and ignores only the same gesture's false toggle | verification |
| Focused verification and stability | completed | unit 5/5, Computer Use 5/5 open/close, outside-dismiss, exact Chrome Date 10/10, full corpus 4/4, attempt-9 receipt | packet decision |
| Keep/revert/quarantine | completed | keep attempt 9; diagnostics removed; ref-only and snapshot-only candidates rejected before keep | methodology delta |
| Methodology repair/no-change/defer | completed | repair-now source/template/validator/test change; 102/102; mirrors exact | next case or closure |
| Reviews and final handoff | completed | Vercel React lens pass; agent-native PASS; targeted direct P1 pass; helper N/A on `next` | goal-plan check |
| Final goal-plan check | completed | semantic validator pass; final structural checker command below | final response |

Selected executable cases:
| Case ID | Source reference | Setup / action | Expected outcome | Expected-outcome authority | Red-test escalation | Exact environment | Test file / command | Status | Tested ref | Next owner |
|---------|------------------|----------------|------------------|----------------------------|---------------------|-------------------|---------------------|--------|------------|------------|
| date-first-click:open-reopen | User request and `CleanShot 2026-08-31 at 18.13.49.mp4` | Fresh Plate Playground; physically click the `Dates and Equations` heading so a collapsed native selection remains, then physically click `January 15, 2024` once. After it opens, click the trigger to close, then physically click it once again. | The first physical Date click immediately sets `aria-expanded=true` and shows the date grid; after close, the next first physical click immediately reopens it. | reporter: user request plus recording at 00:03-00:16 | unit-red: `apps/www/src/registry/components/editor/date.slow.tsx#owns first-click opening with a passive popover wrapper` and `#keeps a gesture that began closed open when focus opens first` failed before attempt 9 and pass on final bytes; existing E2E remains affected-corpus proof only. | exact-chrome: Google Chrome 151.0.7922.174 on macOS; reporter-profile: Feng Chrome profile with Agentation 3.0.2 and ChatGPT extension/browser-debug state isolated; tool-proof: computer-use; exact route `http://localhost:3001` | `apps/www/src/registry/components/editor/date.slow.tsx`; `bun test ./apps/www/src/registry/components/editor/date.slow.tsx`; affected existing browser command is receipt-bound | completed | dirty:bc647af42db2f309a2ece9e424c11f77f86cc121 | Regression closure |

Reporter evidence inventory:
| Case ID | Source role | Source reference | Phase | Claim | Disposition | Oracle anchors | Executable anchor | Result |
|---------|-------------|------------------|-------|-------|-------------|----------------|-------------------|--------|
| date-first-click:open-reopen | base-acceptance | User request: `要点击立马能打开date popover` | after-action | One click must open the Date popover immediately. | required | `popup@after-action`, `dom-native@after-action`, `runtime-errors@after-action` | `test: apps/www/src/registry/components/editor/date.slow.tsx#owns first-click opening with a passive popover wrapper` | pass: Date owns closed-state opening; exact Chrome receipt and reporter-profile Computer Use 5/5 pass |
| date-first-click:open-reopen | latest-reporter-delta | `reporter-profile: Feng Chrome profile with Agentation 3.0.2 and ChatGPT extension/browser-debug state isolated`; `CleanShot 2026-08-31 at 18.13.49.mp4` 00:03-00:09 plus Computer Use replay | after-action | `initial-focus: collapsed native selection in Dates and Equations while BODY owns focus`; one OS-level click on the Date must open the grid immediately. | required | `focus@after-action`, `dom-native@after-action`, `popup@after-action` | `test: apps/www/src/registry/components/editor/date.slow.tsx#keeps a gesture that began closed open when focus opens first` | pass: reporter-profile-replay: pass; Computer Use final bytes 5/5 first-click open and close; exact Chrome receipt 10/10 Date rows |
| date-first-click:open-reopen | recording | `CleanShot 2026-08-31 at 18.13.49.mp4` 00:10-00:16 | follow-up | After closing the grid, the next single physical click must reopen it; requiring a second click is forbidden. | required | `follow-up-input@follow-up`, `popup@follow-up`, `dom-native@follow-up` | `test: apps/www/src/registry/components/editor/date.slow.tsx#keeps a gesture that began closed open when focus opens first` | pass: unit close/reopen contract and Computer Use 5/5 open/close cycles pass |

Reporter oracle matrix:
| Case ID | Observation | Phase | Applies | Positive assertion | Forbidden state | Proof layer | Executable anchor | Result |
|---------|-------------|-------|---------|--------------------|-----------------|-------------|-------------------|--------|
| date-first-click:open-reopen | model | after-action | no | N/A: opening or closing the picker does not change the stored Date value. | N/A: the report makes no model-state claim. | N/A: browser DOM and popup lifecycle own this claim. | N/A: no model test applies. | N/A: no model mutation is reported. |
| date-first-click:open-reopen | dom-native | after-action | yes | The same real gesture records `physical-hit-target: January 15, 2024 button`, `click-delivery: delivered`, `event-order: pointerdown > mousedown > click`, and the Date button becomes `aria-expanded=true`. | The delivered first click leaves `aria-expanded=false`, or clean-profile automation replaces the reporter path. | exact-chrome reporter-profile browser computer-use plus receipt-bound Playwright event trace. | `test: apps/www/tests/browser/inline-void-first-click.spec.ts#date opens from the first physical click after a text caret` | pass: event-order: pass; physical-hit-target: pass; click-delivery: pass; reporter-profile-replay: pass; Computer Use 5/5 and exact Chrome 10/10 |
| date-first-click:open-reopen | pointer-feedback | during-action | no | N/A: the report does not name cursor, hover, pressed styling, tooltip, drag affordance, or one-frame pointer feedback. | N/A: no pointer-feedback state is authorized. | N/A: click delivery is proved under dom-native, not pointer styling. | N/A: no pointer-feedback test applies. | N/A: no pointer-feedback claim exists. |
| date-first-click:open-reopen | focus | after-action | yes | `initial-focus: collapsed native selection in Dates and Equations while BODY owns focus`; after the Date gesture, focus moves into the Date trigger/popover interaction subtree while the grid is open. | A clean runner starts from editor focus or loses the reporter's stale native selection, or the OS click leaves BODY focus and the popup closed. | exact-chrome reporter-profile browser computer-use focus/selection observation. | `test: apps/www/src/registry/components/editor/date.slow.tsx#keeps a gesture that began closed open when focus opens first` | pass: initial-focus: pass; selection-origin: pass; reporter-profile-replay: pass; final Computer Use 5/5 |
| date-first-click:open-reopen | popup | after-action | yes | `first-click-popup: open`; the date grid is visible immediately after the same first physical click. | The grid stays hidden until a second click or only opens in a clean automation profile. | exact-chrome reporter-profile browser computer-use screenshot/AX proof. | `test: apps/www/src/registry/components/editor/date.slow.tsx#keeps a gesture that began closed open when focus opens first` | pass: first-click-popup: pass; reporter-profile-replay: pass; Computer Use 5/5 and exact Chrome receipt |
| date-first-click:open-reopen | geometry-paint | after-action | no | N/A: the report supplies no size, bounds, position, alignment, or pixel-layer contract. | N/A: no positive reference geometry is authorized. | N/A: popup visibility belongs to the popup oracle. | N/A: no geometry test applies. | N/A: no geometry or paint claim exists. |
| date-first-click:open-reopen | runtime-errors | after-action | yes | The first click and reopen cycle emit no application runtime errors. | Any console or page runtime error occurs during the reporter path. | `recordPliteBrowserRuntimeErrors` in the receipt-bound Playwright browser case and Computer Use visible error check. | `test: apps/www/tests/browser/inline-void-first-click.spec.ts#date opens from the first click outside editor focus` | pass: no runtime errors in Date 10/10 or full 4/4 corpus; no visible error in Computer Use 5/5 |
| date-first-click:open-reopen | dom-native | follow-up | yes | After trigger-close, the next physical click delivers pointerdown, mousedown, and click to the Date button and returns `aria-expanded=true`. | The first reopen click leaves `aria-expanded=false` or misses the Date target. | exact-chrome reporter-profile browser computer-use plus unit gesture replay. | `test: apps/www/src/registry/components/editor/date.slow.tsx#keeps a gesture that began closed open when focus opens first` | pass: reporter-profile-replay: pass; all 5 Computer Use close/reopen cycles pass |
| date-first-click:open-reopen | popup | follow-up | yes | The date grid is visible after the first reopen click. | The grid stays hidden until a second reopen click. | exact-chrome reporter-profile browser computer-use screenshot/AX proof. | `test: apps/www/src/registry/components/editor/date.slow.tsx#keeps a gesture that began closed open when focus opens first` | pass: reporter-profile-replay: pass; first reopen click visible in all 5 cycles |
| date-first-click:open-reopen | follow-up-input | follow-up | yes | After a successful open and trigger-close, the next single physical click immediately reopens the grid with `aria-expanded=true`. | The next click only refocuses or arms the Date and requires another click. | exact-chrome reporter-profile browser computer-use 5-cycle ledger plus package unit Radix-like lifecycle. | `test: apps/www/src/registry/components/editor/date.slow.tsx#keeps a gesture that began closed open when focus opens first` | pass: 5/5 open, close, and first-click reopen; outside-dismiss also passes |

Proof receipts:
| Case ID | Attempt | Claim | Command | Result | Ref | Input digest | Input count | Inputs | Host | Latest input mtime | Proof started | Proof ended | Retries | Receipt ID |
|---------|---------|-------|---------|--------|-----|--------------|-------------|--------|------|--------------------|---------------|-------------|---------|------------|
| date-first-click:open-reopen | 9 | completed | "bash" "-lc" "set -euo pipefail\nsource /Users/felixfeng/.nvm/nvm.sh\nbun test ./apps/www/src/registry/components/editor/date.slow.tsx\nnvm exec 22 node tooling/scripts/generate-ui-changelog-entries.mjs --check\nPLAYWRIGHT_BASE_URL=http://localhost:3001 PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=\"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome\" nvm exec 22 pnpm --filter www exec playwright test --config playwright.config.ts --project=chromium tests/browser/inline-void-first-click.spec.ts --grep \"date opens\" --repeat-each=5\nPLAYWRIGHT_BASE_URL=http://localhost:3001 PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=\"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome\" nvm exec 22 pnpm --filter www exec playwright test --config playwright.config.ts --project=chromium tests/browser/inline-void-first-click.spec.ts" | pass: exit 0 in 56265ms | dirty:bc647af42db2f309a2ece9e424c11f77f86cc121 | sha256:ed25cfeca0a7d39a1eb18f3a4a0e21abc228632bcb112d055e948f0593c35baa | 10 | apps/www/playwright.config.ts,apps/www/public/r/date.json,apps/www/src/registry/changelog/2026-08-31-fix-date-first-click-reopen.json,apps/www/src/registry/changelog/components.json,apps/www/src/registry/changelog/entries/2026-08-31-fix-date-first-click-reopen.mdx,apps/www/src/registry/changelog/index.json,apps/www/src/registry/components/editor/date.slow.tsx,apps/www/src/registry/components/editor/date.tsx,apps/www/tests/browser/inline-void-first-click.spec.ts,tooling/scripts/generate-ui-changelog-entries.mjs | pid:94408;started:2026-08-31T07:59:45.000Z;base-url:http://localhost:3001;browser:exact-chrome:151;browser-executable:/Applications/Google Chrome.app/Contents/MacOS/Google Chrome;browser-version:Google Chrome 151.0.7922.174 | 2026-08-31T11:36:00.291Z | 2026-08-31T11:38:02.380Z | 2026-08-31T11:38:58.588Z | 0 | sha256:889e506ff30ca655ff91c4482e869092f1ff57c161bd845d69bd07a626c73b92 |

Affected corpus replay:
| Owner | Affected cases | Pre-edit baseline | Last owner edit | Combined command | Receipt input digest | Result |
|-------|----------------|-------------------|-----------------|------------------|----------------------|--------|
| `apps/www/src/registry/components/editor/date.tsx` | `date-first-click:open-reopen` | red: reporter-profile OS click required two clicks; original component 3/3 and existing browser 4/4 were proxy-green before the owner edit | 2026-08-31T19:31:50.000+08:00 | attempt-9 receipt command: Date unit 5/5, changelog check 95/95, exact Chrome Date 10/10, full inline-void corpus 4/4 | sha256:ed25cfeca0a7d39a1eb18f3a4a0e21abc228632bcb112d055e948f0593c35baa | pass: receipt sha256:889e506ff30ca655ff91c4482e869092f1ff57c161bd845d69bd07a626c73b92 starts after final owner edit and covers final generated payload |

Gate failure closure:
| Gate | Failure signal | Classification | Resolution | Final rerun |
|------|----------------|----------------|------------|-------------|
| Date component Bun probe | path without `./` matched no files | proof-command shape | reran with explicit relative path | pass: `bun test ./apps/www/src/registry/components/editor/date.slow.tsx` -> 3/3 |
| Plite browser runner | Node 24 rejected before assertion | proof-host | used repository Node 22 | pass: runner reached discovery under Node 22; then correctly exposed wrong test owner |
| Browser test owner | Plite runner enumerated 0 www tests | proof-command/owner | used www Playwright config and package script | pass: correct www runner enumerated and ran 4 tests |
| Default localhost host | www Playwright reused unrelated Informed app on port 3000 | proof-host mismatch | bound literal `PLAYWRIGHT_BASE_URL=http://localhost:3001` | pass: correct Plate suite 4/4 on port 3001 |
| Reporter-complete experimental row | initial blurred-selection test clicked an offscreen Date after editor scroll | invalid gesture/proof host | moved scroll before click, revalidated hit, then removed the proxy-green exploratory edit | pass: corrected clean/headed Chrome row ran green; user file restored |
| Static script syntax | Ultracite excluded all `.agents` files | unsupported lint surface | used Node syntax gate and workflow tests | pass: both changed scripts pass `node --check`; workflow 102/102 |

Failed fix history:
| Case ID | Attempt | Failure signal | Failure kind | Prior claim invalidated | Regression repair | Workflow test | Architecture trigger | Best API / layer plan | Resume state |
|---------|---------|----------------|--------------|-------------------------|-------------------|---------------|----------------------|-----------------------|--------------|
| date-first-click:open-reopen | 1 | drag surrogate stayed closed but did not deliver a click; exact zero-motion click opened | exact-replay | yes: invalidated native-drag-removal candidate and receipt | repair-now: `.agents/rules/regression.mdc` and methodology reject drag surrogates without delivered click | pass: click reports reject drag surrogates without a delivered click | no: no architecture trigger; proof selection failure only | N/A: first failed fix and no public API/layer question | reproduced: diagnostic: exact click opens once; drag surrogate is proxy-only |
| date-first-click:open-reopen | 2 | fresh reporter says attempt 2 still needs `1.focus 2open` | reporter-contradiction | yes: attempt-2 candidate receipt and all narrower green authority revoked | repair-now: `.agents/rules/regression/scripts/validate-regression-plan.mjs`, rule, methodology, template, and mirrors require the full focus-first event chain | pass: workflow tests reject missing initial-focus, event-order, and first-click-popup markers | yes: second-failed-fix and timer-focus-correctness | best-api: no public API/shared wrapper; plate-plan: component popup state owns opening independently from editor selection/focus | reproduced: exact Browser Date first count 0/second 1; attempt 3 restarted after architecture gate |
| date-first-click:open-reopen | 3 | completed Date fix still failed; attached video was initially transcribed as two Date clicks | reporter-contradiction | yes: invalidated attempt-3 receipt, prior 5/5 claim, and local completion | repair-now: `.agents/rules/regression.mdc`, methodology, template, validator, and tests require concrete initial focus and actual emitted event sequence | pass: workflow tests reject invented focus and allow already-focused gestures to omit a new focus event | yes: second-failed-fix and timer-focus-correctness | best-api rejects public/shared/timer machinery; plate-plan forbids a Date patch without reporter-exact RED | reproduced: corrected transcript and frames showed click 1 on text and click 2 as the first Date click |
| date-first-click:open-reopen | 4 | fresh reporter clarified caret in ordinary editor text then one Date click | reporter-contradiction | yes: attempt-4 proof-only receipt, 5/5 claim, packet decision, and local completion revoked | repair-now: `.agents/rules/regression.mdc`, methodology, template, and workflow test reject popup mocks that inject the click toggle | pass: passive-wrapper workflow fixture rejects mock-owned opening | yes: second-failed-fix and timer-focus-correctness | best-api: no API/timer/shared wrapper; plate-plan: Date registry component owns local controlled open | reproduced: component-open-owner RED enabled attempt 5 |
| date-first-click:open-reopen | 5 | concrete video showed text click then first physical Date click only selects, second opens | reporter-contradiction | yes: attempt-5 receipt, prior 5/5, packet decision, and local completion revoked | repair-now: `.agents/rules/regression.mdc`, methodology, template, receipt helper, semantic validator, and tests reject locator/programmatic hit paths and mismatched base URLs | pass: physical-path and base-URL workflow fixtures reject the failed packet | yes: second-failed-fix and timer-focus-correctness | accepted best-api/plate-plan boundary retained; controlled Date source kept only after exact current-tab replay | reproduced: attempt 6 used physical path, explicit port, and restarted stability |
| date-first-click:open-reopen | 6 | live reporter contradicted attempt-6 completion | reporter-contradiction | yes: attempt-6 receipt, 100/100 claim, packet decision, and local completion revoked | repair-now: `.agents/rules/regression.mdc`, methodology, template, semantic validator, and tests require target-to-capture-owner chain and actual-owner attributes | pass: capture-routing workflow fixture rejects child-only attribute proof | yes: second-failed-fix and timer-focus-correctness | best-api: no new API/timer/shared owner; plate-plan: move draggable ownership to the inline-void owner | reproduced: live DOM and unit RED enabled attempt 7 |
| date-first-click:open-reopen | 7 | live reporter contradicted attempt-7 wrapper contract | reporter-contradiction | yes: attempt-7 receipt, stability claim, packet decision, and local completion revoked | repair-now: `.agents/rules/regression.mdc`, methodology, template, semantic validator, and tests require active global capture-interceptor inventory/state and same-tab isolation | pass: external-interceptor workflow fixture rejects missing state or isolation | yes: second-failed-fix and timer-focus-correctness | best-api: forbid product compensation for external capture; plate-plan: restore Date to HEAD and isolate Agentation | reproduced: Agentation active blocks; prior attempt 8 claimed collapsed mode green |
| date-first-click:open-reopen | 8 | Fresh Chrome recording at 18:13 and reporter-profile OS replay contradict prior attempt-8 completion based on IAB/Playwright and Agentation isolation | reporter-contradiction | yes: prior attempt-8 completion, receipt, 5/5 stability, and external-interceptor isolation authority are revoked | repair-now: `.agents/rules/regression.mdc`, Regression methodology, template, semantic validator, and workflow tests treat visible browser/profile/extension state as exact environment and reject clean-profile/IAB substitution | pass: workflow 102/102; reporter-profile fixture rejects missing exact environment, proof-layer marker, replay result, or receipt profile; source/mirror exact | yes: second-failed-fix and timer-focus-correctness | required: existing best-api rejects Date/Plite compensation without reporter-profile executable RED; plate-plan: preserve Date, require same-profile executable proof, and block product edits until repeatable | reproduced: latest-reporter-delta is the 18:13 Chrome video; diagnostic: frozen product bytes are green in IAB, Playwright Chromium, clean Chrome 151, and headed Chrome 151 but red under reporter-profile OS input |

Architecture pressure:
| Case ID | Failed fix count | Triggers | Verdict | Best API | Layer plan | Proof |
|---------|------------------|----------|---------|----------|------------|-------|
| date-first-click:open-reopen | 8 | second-failed-fix, timer-focus-correctness | escalate | required: best-api from `docs/plans/2026-08-29-date-calendar-single-click-regression.md` rejects Date, Popover, or Plite compensation without a reporter-profile executable RED | plate-plan: keep original Date source; same-profile Chrome/profile/extension input delivery must be made repeatable before another product attempt | accepted: prior seven-failure architecture boundary remains authoritative; this attempt adds the missing reporter-profile proof gate before any runtime patch |

Proof-host readiness:
| Case ID | Source owner | Runner / route / host | Freshness evidence | Generated/export boundary | Result |
|---------|--------------|-----------------------|--------------------|---------------------------|--------|
| date-first-click:open-reopen | `apps/www/src/registry/components/editor/date.tsx`; controlled Date open state plus gesture-start refs own the focus-open/click-close race | www Playwright on literal `http://localhost:3001`; exact Google Chrome 151 executable; reporter-profile Computer Use OS input | PID 94408 predates proof; final product/test/generated inputs fingerprinted by attempt-9 receipt; feedback and browser-debug states isolated before Computer Use 5/5 | registry source plus generated `apps/www/public/r/date.json`; no template edits | pass: unit RED/green, reporter-profile Computer Use 5/5, exact Chrome 10/10, full corpus 4/4, final receipt valid |

Patch delegation:
| Case ID | Red test | Allowed owner/files | Required proof/stability | Patch return evidence | Result |
|---------|----------|---------------------|--------------------------|-----------------------|--------|
| date-first-click:open-reopen | unit-red: passive Popover wrapper could not open; Radix-like focus-open/click-toggle closed the same gesture | `date.tsx`, `date.slow.tsx`, generated Date registry payload, registry changelog, existing affected E2E only; no package/Plite/public API/Git mutation | unit RED/green; reporter-profile Computer Use 5/5; exact Chrome 10/10; full 4/4; typecheck/lint/registry/changelog; attempt-9 receipt | root cause, gesture trace, final files, receipt, P1 review, residual caveat | pass: Date owns closed-state open, snapshots gesture start, ignores only the same gesture's close, and preserves later trigger/outside close |

Stability:
| Case ID | Executable proof / host | Required runs | Results | Retry count | Decision |
|---------|-------------------------|---------------|---------|-------------|----------|
| date-first-click:open-reopen | reporter-profile Computer Use OS input plus exact Chrome executable receipt | 5 | pass: runs 1-5 each opened on first Date click and closed on one Date click; outside-dismiss pass; exact Chrome Date rows 10/10 | 0 | keep attempt 9 |

Packet decisions:
| Case | Executable evidence | Decision | Claim width | Residual risk | Next owner |
|------|---------------------|----------|-------------|---------------|------------|
| date-first-click:open-reopen | unit RED/green, Computer Use 5/5, exact Chrome receipt, full corpus, generated registry, typecheck, direct P1 | keep | completed local Date first-click open/close/reopen behavior; uncommitted and unpushed | Agentation feedback mode intentionally annotates the first click; product proof keeps it inactive | none |

Methodology deltas:
| Case | Miss or owner checked | Decision | Durable owner/change | Focused proof | Trigger/result |
|------|-----------------------|----------|----------------------|---------------|----------------|
| date-first-click:open-reopen | prior attempt-8 accepted IAB/clean-profile proof for a Chrome/profile-visible recording, while final proof also needed an agent-native tool-proof path | repair-now | `.agents/rules/regression.mdc`, methodology, template, semantic validator, generated mirrors, and workflow tests require profile identity, live target refresh, exact receipt, and explicit `tool-proof: computer-use` when only OS input can replay the profile | pass: workflow 102/102; source/mirror exact; profile fixture rejects clean substitution and accepts exact receipt plus Computer Use replay | attempt 9 completed without weakening executable receipt or profile replay |

Workflow slowdowns:
| Step / command | Owner | Elapsed / expected | Cause | Evidence value | Repair/result |
|----------------|-------|--------------------|-------|----------------|---------------|
| video transcript path | skill routing | one failed lookup | global path absent | repository skill existed and produced authoritative timestamps | repaired: use repository skill path |
| broad source-map search | output budget | one oversized truncated output | `rg --hidden` matched minified source map | narrowed later reads to exact dist line ranges; recorded as avoidable miss |
| browser proof | host/gesture | multiple revoked runs | Node version, wrong runner, port collision, active interceptors, and stale coordinates | each failure separated from product bytes and rerun through a different proof layer | repaired where possible; reporter-profile executable gap remains blocked |

Findings:

- Transcript and contact sheet confirm the exact www Plate Playground at `localhost:3001` and a repeatable two-click failure: first click misses, second opens; after close the same failure repeats.
- The contact sheet shows the toolbar still reporting `Heading 2` before the first Date click. Current Chrome replay confirms the exact setup: editor focus with a collapsed native selection in the `Dates and Equations` H2.
- From that H2 setup, current Chrome reproduces the exact red: the first physical Date click leaves `aria-expanded=false`, grid hidden, active focus on BODY, and the H2 selection unchanged.
- The same Date click from BODY focus opens immediately in both in-app Browser and Chrome. Existing Playwright rows also pass 4/4 against the correct 3001 host, proving they are proxy-green because they use a same-paragraph caret or outside-editor focus.
- Current source wraps the Date button in uncontrolled `Popover`/`PopoverTrigger`; the trigger has no Date-owned open state or click handler.
- Existing `inline-void-first-click.spec.ts` already traces physical mouse delivery and first-click open for Date/equation controls, but its current rows do not prove the reporter's open-close-first-click-reopen cycle on the exact www route.
- `date.slow.tsx` mocks `PlateElement`, `Popover`, `PopoverContent`, and `PopoverTrigger`, so it cannot reproduce native editor capture/focus plus real popup ownership. The existing browser case is the smallest exact durable layer.
- Attempt 8's original Date remained red in the reporter-profile OS path after Agentation and browser-debug isolation; passive Popover and Radix-like same-gesture unit cases then produced executable REDs.
- Mutation trace proved the decisive race: a closed trigger requested open, then Radix synchronously called `onOpenChange(false)` in the same click. The final component snapshots gesture-start state and ignores only that same-gesture close.
- Failed ref-only, controlled-only, and pointer-snapshot-only candidates were rejected before keep. Final live-state refs plus the same-gesture close latch pass exact profile open/close/reopen 5/5.
- Date source, component tests, generated registry payload, and registry changelog now carry attempt 9. No package, Plite, public API, commit, push, or release mutation occurred.

Timeline:

- 2026-08-31: loaded Regression methodology, Autogoal, Patch, Video Transcripts, and Unslop contracts; created the active goal and browser-enabled Regression plan.
- 2026-08-31: generated the attachment transcript and inspected a frame contact sheet; captured the exact first-click and reopen oracle.
- 2026-08-31: found current source owner, existing component tests, existing first-click browser coverage, route, and base ref.
- 2026-08-31: repaired three proof-host mistakes: Bun path filtering, Node 24 versus required Node 22, and Playwright reusing an unrelated Informed app on port 3000; the correct www suite on port 3001 passed 4/4.
- 2026-08-31: reproduced the reporter-exact red in the user's current Chrome tab by physically creating the H2 selection and then physically clicking the Date once.
- 2026-08-31: found the prior attempt-8 `completed` plan and seven earlier failed fixes; invalidated its receipt/completion under the fresh 18:13 recording.
- 2026-08-31: reproduced the reporter-profile red with Computer Use after collapsing Agentation and cancelling ChatGPT browser debugging; clean/headed Chrome remained green.
- 2026-08-31: completed automatic Regression repair, `pnpm install`, 102/102 workflow proof, source/mirror parity, active-plan validation, Node syntax checks, and agent-native review.
- 2026-08-31: passive-wrapper and Radix-like component rows failed before attempt 9, then passed after Date took controlled open ownership and suppressed only the same gesture's false toggle.
- 2026-08-31: rejected unstable intermediate candidates, captured `false > true > false > false` and live handler-state traces, then restarted final proof on frozen gesture-latch bytes.
- 2026-08-31: final Computer Use profile 5/5, outside-dismiss, exact Chrome Date 10/10, full 4/4, unit 5/5, registry/changelog, lint, www typecheck, direct P1, and attempt-9 receipt passed.
- 2026-08-31: repaired Regression to accept explicit Computer Use profile proof only alongside the final exact executable receipt; workflow remains 102/102 with exact mirrors.

Decisions and tradeoffs:

- Keep durable coverage at the owner-level unit RED; use the already-existing browser spec only as affected-corpus evidence, with no new or expanded E2E case.
- Keep the claim narrow: immediate open/reopen and no runtime errors. Do not invent date-value, popup geometry, cursor, or final-focus requirements.
- Keep Date-local controlled state and transient gesture refs; reject timers, Plite compensation, shared wrapper changes, and public API additions.

Review fixes:

- Agent-native PASS: source owner is `.agents/rules/regression*`; generated `.agents/skills/regression*` mirrors are exact; plan template exposes the new gate; validator and test make clean-profile substitution fail closed.
- P1 autoreview helper N/A: current branch is `next`, where invocation is forbidden. Targeted direct P1 review passed with zero findings after source/generated diff, outside-dismiss, keyboard/pointer paths, diagnostics removal, and generated parity checks.
- Vercel React review pass: controlled UI state stays in state; transient gesture/live identity stays in refs; event logic remains in event handlers; no effects or render-time side effects were added.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Tried missing global `video-transcripts` skill path | 1 | Use repository-owned `.agents/skills/video-transcripts/SKILL.md` | Repository skill read completely; helper produced a valid transcript. |
| Bun test path omitted `./` | 1 | Rerun exact relative path | pass: Date component 3/3 |
| Browser runner used Node 24 | 1 | Use repository Node 22 | host gate passed; next failure exposed wrong runner ownership |
| Plite runner received a www test path | 1 | Use www Playwright config | correct runner enumerated tests |
| www Playwright reused port-3000 Informed app | 1 | Bind literal port 3001 | correct Plate suite 4/4 |
| Browser evaluation used unavailable `HTMLElement` constructor | 1 | Read tag/attributes without cross-realm instanceof | corrected state read |
| Physical click reused stale coordinates after layout/overlay change | 3 | Refresh screenshot/bounds and verify hit target before each gesture | invalid runs revoked; durable Regression rule now enforces refresh |
| Broad source-map search overflowed output | 1 | Read exact installed dist ranges | later reads capped and targeted |
| Ultracite excluded `.agents` paths | 1 | Use Node syntax gate plus workflow tests | both scripts pass `node --check`; workflow 102/102 |
| Ref-only and pointer-snapshot candidate stability | 2 | Freeze bytes and trace `aria-expanded` plus live handler state | diagnosed same-gesture Radix false toggle; final close latch passes 5/5 |
| Changed-path lint formatting/context value | 1 | Memoize test Context value and format only changed files | final Ultracite pass on both Date files |
| Tool-native workflow fixture invalid Receipt ID | 1 | Generate fixture from source options instead of string-mutating a receipt | final focused 46/46 and mandatory 102/102 pass |
| `capture-proof-receipt --help` routed to nvm help | 1 | Read helper source contract and invoke exact schema | attempt-9 receipt emitted successfully |

Verification evidence:

- command: Date owner unit -> RED before fix; final 5/5 with 11 assertions.
- Chrome/Computer: exact reporter profile, feedback/debugging inactive -> runs 1-5 each first-click open and one-click close; outside-dismiss passes; settled state reasserted.
- command: exact Google Chrome 151 Date rows -> 10/10; full Date/inline/block corpus -> 4/4; runtime recorder reports none.
- command: attempt-9 receipt -> pass, retries 0, input digest `ed25cfec…`, receipt ID `889e506f…`.
- command: Ultracite changed paths, www typecheck, registry build, and changelog 95/95 -> pass.
- command: Regression focused 46/46; mandatory source/mirror workflow 102/102; `sync-resources --check` exact.
- review: Vercel React pass; agent-native PASS; targeted direct P1 pass; helper N/A on `next`.

Final handoff:

- executable cases: `date-first-click:open-reopen` completed locally on attempt 9; owner-level unit RED/green and existing affected browser corpus are receipt-bound.
- cumulative reporter evidence, phase-specific oracles, and forbidden states: fresh 18:13 profile recording, close/reopen requirement, Agentation boundary, and prior contradictions remain mapped and passing.
- failed-fix invalidation and automatic repair: attempts 1-8 invalidated; reporter-profile plus Computer Use tool-proof workflow passes 102/102.
- proof receipts and affected-corpus replay: attempt-9 receipt `889e506f…`, input digest `ed25cfec…`, retries 0; final exact corpus replayed after the last owner edit.
- started-gate failure closure: command path, Node, runner, host, coordinate, candidate stability, lint, and workflow fixture failures all have passing final reruns.
- changed files: Date source/test, generated Date registry payload, registry changelog source/generated indexes, Regression source/mirrors/template/validator/tests, and this active plan.
- design decisions: Date owns controlled open; live refs hold transient state; a closed gesture stays open despite the same click's Radix false toggle; later trigger/outside close remains normal.
- tests and proof: unit 5/5, Computer Use 5/5, outside-dismiss, exact Chrome 10/10, full 4/4, typecheck/lint/registry/changelog, workflow 102/102.
- source/generated sync: final registry rebuilt; changelog check pass; `pnpm install` and `sync-resources --check` exact.
- P1 and agent-native findings: zero direct P1 findings; helper N/A on `next`; Vercel React and agent-native reviews pass.
- residual risks and next owner: Agentation feedback mode intentionally consumes a first click for annotation; product proof and ordinary use require it inactive. No code owner remains.
- local completion status and integration/public-status boundary: completed locally, uncommitted and unpushed; not integrated, shipped, released, or publicly closed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | attempt 9 locally completed; semantic closure passed; structural closure next |
| Where am I going? | final plan checker, goal completion, concise handoff |
| What is the goal? | Date popover opens and reopens on the first physical click in the exact Plate Playground path |
| What have I learned? | Date can open during focus and then receive a synchronous Radix close from the same click; render closures alone are insufficient across the popover lifecycle. |
| What have I done? | Added owner-level REDs, implemented Date-local gesture ownership, proved exact profile 5/5 plus receipt, rebuilt registry/changelog, passed all gates, and repaired Regression tool-native proof. |

Open risks:

- Agentation feedback mode intentionally uses the first page click to create an annotation; this is not a Date product interaction. Leave feedback mode inactive for product QA.
- Work is local, uncommitted, and unpushed. Any later source, test, generated, commit, rebase, or push change invalidates the receipt until replayed.
