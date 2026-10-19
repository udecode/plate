# floating toolbar duplicate shell regression

Objective:
Repair the failed floating-toolbar style fix; done when link, table, and AI
popover shells pass exact single-surface paint oracles and Regression learns the
missed shared-selector invariant.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-26-floating-toolbar-duplicate-shell-regression.md

Template:
docs/plans/templates/regression.md

Primary template:
docs/plans/templates/regression.md

Applied packs:
- none

Regression source:
- target bug / surface / corpus: reporter contradiction showing a duplicate
  table floating-toolbar shell after the prior link-toolbar style repair
- lane and current source owner: Plate website preview style generation;
  `createPreviewStyleCss`, transparent `FloatingPopoverContent` consumers, and
  Regression's shared-selector affected-corpus rule
- selected executable test cases: `homepage:link-toolbar-visible-shell`,
  `homepage:table-toolbar-single-shell`, and `homepage:ai-menu-single-shell`
- tested ref or dirty-state boundary: dirty baseline
  `168a4490e2ccf90dd9b1bd3230fb2f528460caa2`; final fingerprints required
- route / proof host and freshness method: fresh `apps/www` dev process,
  homepage `/`, Browser exploration and existing Chromium E2E runner
- invocation mode / timebox: one-shot failed-fix repair; no timebox requested

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
- selected executable package/DOM/Playwright/Browser/Chrome/device commands
- exact final-case replay and retry-free stability when required
- source/host freshness proof and exact final ref
- generated proof receipts and affected-corpus replay
- `node .agents/skills/regression/scripts/validate-regression-plan.mjs docs/plans/2026-08-26-floating-toolbar-duplicate-shell-regression.md --complete`
- P1 autoreview for non-trivial implementation packets
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-26-floating-toolbar-duplicate-shell-regression.md`

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
- allowed source owners: registry style generator, transparent floating-popover
  consumers, Regression rule/reference/template, focused workflow and browser tests
- allowed proof/test owners: Regression contract tests, registry transform tests,
  and `apps/www/tests/browser/link-floating-toolbar.spec.ts` or one focused sibling
- generated/source boundary: edit source rules/scripts only; run `pnpm install`,
  shadcn style sync, registry generation, and Tailwind generation
- browser/device claim width: desktop in-app Browser, Chromium, and exact local
  Google Chrome 151; no native-device, integration, or release claim
- forbidden product/API/release/public mutations: no templates, public APIs,
  package behavior, commit, push, PR, deployment, tracker, or other chat mutation
- orchestration mode and writer ownership: single root writer; no subagents or
  parallel writers; do not kill shared dev servers

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
- current phase: final closure
- current executable case: affected corpus complete
- current case status: all three cases completed locally on attempt 2
- next owner: user if commit/push is wanted
- goal status: complete after semantic and Autogoal validators pass

Completion rule:
- Do not call `update_goal(status: complete)` with unchecked Work Checklist
  items, unresolved Completion Gates, open required cases, or missing
  executable proof.
- Supporting case tables never replace tests or canonical gates.
- Run `check-complete.mjs` only after fresh evidence and risks are recorded.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured | yes | Screenshot contradiction, single-shell expectation, repair scope, and no-public-mutation boundary recorded |
| Regression methodology loaded | yes | Regression skill and complete methodology reference read before goal/test/product edits |
| Active goal checked or created | yes | Prior goal was complete; this plan precedes the new goal creation |
| Current source owner and tested ref recorded | yes | Dirty baseline ref and style/table owners recorded above |
| Executable test cases discovered | yes | Existing link E2E plus table and AI affected-corpus cases selected |
| Cumulative reporter evidence resolved | yes | Original link-shell acceptance remains required; latest screenshot adds the forbidden duplicate table shell |
| Reporter oracle matrix resolved | yes | Phase-specific rows below cover popup, paint, focus, errors, and interaction |
| Regression semantic validator ready | yes | Repo validator command and regression template selected |
| Route/proof-host readiness plan recorded | yes | Fresh `apps/www` process and homepage source route required |
| Patch delegation boundary recorded | yes | One root writer may change only named style/consumer/proof owners after repair-now passes |
| Orchestrator writer ownership recorded | N/A | No orchestrator or subagent work; one root writer |
| Output budget strategy recorded | yes | Exact-file reads and capped output; generated/minified trees queried only by selector/hash |
| Claim width and blocked rules recorded | yes | Local desktop Browser/Chromium only; blocked conditions above |
| Browser pack selected | yes | Browser pack materialized for paint and interaction proof |
| Browser route / app surface identified | yes | Homepage table selection toolbar, link toolbar, and AI menu |
| Browser tool decision recorded | yes | In-app Browser for pixels and interaction; Chromium runner for durable affected corpus |
| Console/network caveat policy recorded | yes | Runtime errors are blocking; unrelated external requests are recorded separately |
| Observable browser case captured | yes | Stable case IDs, screenshot source, setup/action/outcomes, dirty ref, and fingerprint plan recorded below |

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
- [x] Every blocking pixel classifier passes a known-positive and known-negative
      control through the same capture path; a failed control invalidates prior
      results and freezes product edits until the proof helper is repaired.
- [x] Every completed applicable `geometry-paint` row names actual pixel capture
      and classification in its proof layer and records `positive-control: pass`
      plus `negative-control: pass`; computed style, DOM state, selection text,
      callback traces, and unclassified screenshots are diagnostics only.
- [x] Every shared owner was replayed against its affected exact corpus after
      the final owner edit.
- [x] Every shared CSS selector, marker, and generated style expansion inventories
      explicit transparent, borderless, shadowless, and ringless consumers with
      negative inherited-paint or duplicate-shell geometry oracles.
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
      not certify the pushed tree; a local-only candidate records N/A and makes
      no pushed-ref, integration, or shipped claim.
- [x] Browser pack: native selection/paint, focus, DnD, compositor, or React DOM
      lifecycle cases pass 5/5 retry-free warm runs. When Chrome is the reported
      surface, the entire final replay and warm ledger run in exact Chrome;
      otherwise the limitation blocks fixed/completed wording.
- [x] Browser pack: no temporary stub, alias, generated-file edit, route bypass,
      or unshipped scaffolding is counted as final behavior proof.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named completion threshold | yes | Close every selected executable case and methodology row | yes: three cases completed and three methodology rows resolved |
| Current-source readiness | yes | Prove source owner and final tested ref/dirty boundary | yes: canonical generator/consumer owners and dirty base plus current input digest recorded |
| Route/proof-host readiness | yes | Prove the runner/host observes current source | yes: fresh PID 87318 started after final generation and is attested by receipts |
| Executable regression coverage | yes | Record exact test file, red result, green result, and owning invariant | yes: focused transform test and three-case browser file record red/green |
| E2E escalation closure | yes | Prove each case uses `unit-red:` without a new E2E or records `e2e-required:` with the exact unit/package limitation | yes: all cases record the portal/CSS-paint limitation |
| Cumulative reporter evidence closure | yes | Map every still-applicable base acceptance and later reporter delta to a phase-specific executable oracle | yes: evidence table maps the link and table screenshots plus AI affected consumer |
| Reporter oracle closure | yes | Resolve positive and forbidden states for all seven observations and every applicable interaction phase per case | yes: complete three-case oracle matrix with exact results and N/A reasons |
| Failed-fix interrupt closure | yes | Prove every claimed-fix failure invalidated prior proof and completed automatic Regression repair | yes: attempt 1 invalidated; 57 workflow tests and source/mirror parity passed before attempt 2 |
| Architecture pressure closure | yes | Prove every second failure or architecture trigger has Best API and layer-plan evidence | N/A: this is first failed fix and no architecture trigger or public API change exists |
| Proof receipt closure | yes | Validate generated final receipts against unchanged issue-owned inputs | yes: three tamper-evident exact Chrome attempt-2 receipts recorded |
| Affected-corpus replay closure | yes | Replay all cases affected by the last shared-owner edit | yes: link/table/AI combined exact Chrome replay passed 15/15 after last edit |
| Started-gate failure closure | yes | Rerun every requested or started gate that failed; completion requires the exact gate to pass on final bytes | yes: command, pixel-control, host, format, and typecheck failures all have exact green reruns |
| Smallest-probe closure | yes | Record first falsifying probe and any host repair | yes: link passed while table showed 50 and AI 1374 forbidden outer pixels |
| Patch delegation closure | yes | Read back one-case root-cause/red/green/proof evidence | yes: one root-writer patch packet and exact return evidence recorded |
| Focused verification closure | yes | Run owning test and exact final-case replay | yes: transform 7/7, browser cases 15/15 exact Chrome, and final typecheck/lint pass |
| Stability closure | yes | Record retry-free warm runs or evidence-backed N/A | yes: each case passed 5/5 exact Chrome with zero retries |
| Packet decision closure | yes | Keep/revert/quarantine/defer/block every selected case honestly | yes: all three cases kept as completed local candidates |
| Local completion status | yes | Mark every fully proved kept case and the run `completed`; record local ref/fingerprints and uncommitted/unpushed state separately | yes: local dirty fingerprint recorded; no pushed or shipped claim |
| No duplicate registry | yes | Prove no sidecar behavior manifest/database was created | yes: executable tests and this transient plan are the only behavior records |
| Generated/source and host repair | yes | Repair drift/host methodology or record blocked claim | yes: source generator rebuilt registry/Tailwind output and fresh host served it |
| Orchestrator writer closure | yes | Prove one shared-state writer and serialized overlapping owners/hosts, or N/A | N/A: single root writer; no subagent, orchestrator, or other-chat mutation |
| Workflow slowdown closure | yes | Repair avoidable slow/stale/noisy proof paths or defer with owner | yes: all five recorded slowdowns were repaired and rerun |
| Methodology delta closure | yes | Resolve repair-now/no-change/defer for every case | yes: table repair-now plus link/AI no-change rows resolved |
| Source/generated sync | yes | Run `pnpm install` and parity audit when agent sources changed, otherwise N/A | yes: `pnpm install`, 57 workflow tests, and source/generated parity passed |
| Agent-native review | yes | Run for changed agent workflows or record N/A | yes: route, authority, source/mirror, and validation review found no gap |
| Final handoff contract | yes | Record tests, decisions, proof, sync, reviews, risks, and next owner | yes: final handoff section is complete |
| Autoreview | yes | Run P1 autoreview for non-trivial implementation changes or record N/A | N/A: repository policy forbids Autoreview while the current branch is `next` |
| Regression semantic plan | yes | Run `node .agents/skills/regression/scripts/validate-regression-plan.mjs docs/plans/2026-08-26-floating-toolbar-duplicate-shell-regression.md --complete` | yes: final invocation passes |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-26-floating-toolbar-duplicate-shell-regression.md` | yes: final invocation passes |
| Browser interaction proof | yes | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | yes: in-app Browser exploration plus exact Chrome interaction replay completed |
| Browser console/network check | yes | Record console/network state or why it is not applicable | yes: no app-owned runtime error; one Chrome-extension content-script error was unrelated |
| Browser final proof artifact | yes | Record screenshot/trace/route/native proof or exact caveat | yes: classified screenshots in the executable cases and exact Chrome receipts |
| Exact case replay | yes | For report-backed behavior, prove the exact case and all applicable end-state claim fields; otherwise N/A with reason | yes: link, table drag-selection, and AI menu cases replayed on final bytes |
| Final ref and fingerprints | yes | Record the replayed commit/ref and issue-owned production/test/fixture/harness SHA-256 fingerprints; any later code or generated change invalidates the result | yes: dirty base, ten inputs, aggregate digest, and per-case receipt IDs recorded |
| Clean final runtime | yes | Before fixed/completed wording, start a fresh process from a clean checkout at the exact final pushed ref or immutable CI artifact and prove zero tracked/untracked issue-owned runtime-input differences; local candidates record N/A with exact unpushed status | N/A: local uncommitted/unpushed candidate only; no pushed-ref, integration, or shipped claim |
| Retry-free stability | yes | For native selection/paint, focus, DnD, compositor, or React DOM lifecycle, record 5/5 warm runs with no retry in the exact reported browser/device; otherwise N/A with reason | yes: all three cases passed 5/5 in Google Chrome 151 with zero retries |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Requirement extraction and goal setup | completed | explicit scope, proof, no-template, no-public-mutation, and one-writer boundaries recorded | complete |
| Current source and proof-host readiness | completed | canonical source owners and fresh PID 87318 recorded | complete |
| Executable case discovery and selection | completed | link, table, and AI cases selected | complete |
| Cumulative reporter evidence inventory | completed | original and latest screenshots plus affected consumer mapped | complete |
| Reporter oracle expansion | completed | seven observations per case resolved | complete |
| Pre-implementation semantic validation | completed | Regression plan structurally valid before product edits | complete |
| Smallest high-value probe | completed | link pass, table 50-pixel red, AI 1374-pixel red | complete |
| Reproduce, classify, and red test | completed | shared unlayered CSS override reproduced and classified | complete |
| One-case Patch delegation | completed | one root-writer shared-owner packet returned | complete |
| Focused verification and stability | completed | exact Chrome 15/15 plus Chromium and static gates passed | complete |
| Keep/revert/quarantine | completed | all three cases kept | complete |
| Methodology repair/no-change/defer | completed | one repair-now and two no-change decisions proved | complete |
| Reviews and final handoff | completed | agent-native pass; Autoreview correctly N/A on `next` | complete |
| Final goal-plan check | completed | semantic and Autogoal validators pass | final response |

Selected executable cases:
| Case ID | Source reference | Setup / action | Expected outcome | Expected-outcome authority | Red-test escalation | Exact environment | Test file / command | Status | Tested ref | Next owner |
|---------|------------------|----------------|------------------|----------------------------|---------------------|-------------------|---------------------|--------|------------|------------|
| homepage:link-toolbar-visible-shell | Original missing-shell screenshot and prior exact red | `/`; click the `slash command` link | Exactly one opaque shadcn link-toolbar shell | reporter: original screenshot plus existing generated Nova contract | e2e-required: CSS cascade and painted shell cannot be reproduced in an owner-level unit test | exact-chrome: Google Chrome 151.0.7922.174 on the final fresh local route; bundled Chromium owns the permanent test | `pnpm --filter www exec playwright test --config playwright.config.ts --project=chromium tests/browser/link-floating-toolbar.spec.ts` | completed | dirty:168a4490e2ccf90dd9b1bd3230fb2f528460caa2 | user if commit/push is wanted |
| homepage:table-toolbar-single-shell | Latest duplicate-shell screenshot | `/blocks/table-demo`; drag-select two cells | Exactly one visible inner toolbar shell; provider positioner stays transparent and shadow/ring-free | reporter: latest screenshot forbids duplicate shell; existing-contract: explicit transparent outer plus styled inner Toolbar | e2e-required: portal composition, CSS cascade, and painted shell cannot be reproduced in an owner-level unit test | exact-chrome: Google Chrome 151.0.7922.174 on the final fresh local route; bundled Chromium owns the permanent test | `pnpm --filter www exec playwright test --config playwright.config.ts --project=chromium tests/browser/link-floating-toolbar.spec.ts` | completed | dirty:168a4490e2ccf90dd9b1bd3230fb2f528460caa2 | user if commit/push is wanted |
| homepage:ai-menu-single-shell | Current `ai-menu.tsx` transparent outer plus styled inner Command | `/`; select text, click Ask AI | Exactly one visible Command shell; provider positioner remains transparent and shadow/ring-free | existing-contract: explicit transparent outer plus styled inner Command | e2e-required: portal composition, CSS cascade, and painted shell cannot be reproduced in an owner-level unit test | exact-chrome: Google Chrome 151.0.7922.174 on the final fresh local route; bundled Chromium owns the permanent test | `pnpm --filter www exec playwright test --config playwright.config.ts --project=chromium tests/browser/link-floating-toolbar.spec.ts` | completed | dirty:168a4490e2ccf90dd9b1bd3230fb2f528460caa2 | user if commit/push is wanted |

Reporter evidence inventory:
| Case ID | Source role | Source reference | Phase | Claim | Disposition | Oracle anchors | Executable anchor | Result |
|---------|-------------|------------------|-------|-------|-------------|----------------|-------------------|--------|
| homepage:link-toolbar-visible-shell | base-acceptance | Original missing-border screenshot in the prior user turn | after-action | Link toolbar needs one visible shell and remains usable | required | dom-native@after-action, popup@after-action, geometry-paint@after-action, focus@after-action, follow-up-input@follow-up | test: apps/www/tests/browser/link-floating-toolbar.spec.ts#link:floating-toolbar-visible-boundary | pass: exact Chrome and Chromium show one shell |
| homepage:table-toolbar-single-shell | base-acceptance | `table.tsx` explicitly transparent outer plus styled inner Toolbar | after-action | Provider wrapper stays unpainted while the inner Toolbar owns the shell | required | dom-native@after-action, popup@after-action, geometry-paint@after-action | test: apps/www/tests/browser/link-floating-toolbar.spec.ts#table:floating-toolbar-single-shell | pass: exact Chrome and Chromium show the transparent wrapper and one inner shell |
| homepage:table-toolbar-single-shell | latest-reporter-delta | `/var/folders/md/2qpw448d4tx0dgncw_kqdpk80000gn/T/codex-clipboard-ebaca944-39bc-4e12-b989-ac4deb1060c9.png` | after-action | Table toolbar must not show nested outer and inner shells | required | geometry-paint@after-action | test: apps/www/tests/browser/link-floating-toolbar.spec.ts#table:floating-toolbar-single-shell | pass: outer-wrapper classifier reports zero painted pixels |
| homepage:ai-menu-single-shell | base-acceptance | `ai-menu.tsx` explicitly transparent outer plus styled inner Command | after-action | Shared preview styling preserves the transparent provider wrapper | required | dom-native@after-action, popup@after-action, geometry-paint@after-action | test: apps/www/tests/browser/link-floating-toolbar.spec.ts#ai:floating-menu-single-shell | pass: outer-wrapper classifier reports zero painted pixels |

Reporter oracle matrix:
| Case ID | Observation | Phase | Applies | Positive assertion | Forbidden state | Proof layer | Executable anchor | Result |
|---------|-------------|-------|---------|--------------------|-----------------|-------------|-------------------|--------|
| homepage:link-toolbar-visible-shell | model | after-action | no | N/A: opening the link toolbar does not mutate the editor document | N/A: no document mutation belongs to this paint case | N/A: model observation does not apply | N/A: no executable model assertion applies | N/A: model observation does not apply |
| homepage:link-toolbar-visible-shell | dom-native | after-action | yes | One visible marked popover contains Edit link | Missing or duplicated marked popover | browser DOM | test: apps/www/tests/browser/link-floating-toolbar.spec.ts#link:floating-toolbar-visible-boundary | pass: one marked popover |
| homepage:link-toolbar-visible-shell | pointer-feedback | after-action | no | N/A: the reported shell defect has no cursor, hover, active, tooltip, or drag-affordance claim | N/A: pointer feedback cannot contradict this paint-only acceptance | N/A: pointer-feedback observation does not apply | N/A: no executable pointer-feedback assertion applies | N/A: pointer-feedback observation does not apply |
| homepage:link-toolbar-visible-shell | focus | after-action | yes | Editor remains focused when the toolbar opens | Toolbar opening steals editor focus | browser focus | test: apps/www/tests/browser/link-floating-toolbar.spec.ts#link:floating-toolbar-visible-boundary | pass: editor remains focused |
| homepage:link-toolbar-visible-shell | popup | after-action | yes | Link toolbar is visible | Link toolbar is missing or duplicated | browser popup | test: apps/www/tests/browser/link-floating-toolbar.spec.ts#link:floating-toolbar-visible-boundary | pass: toolbar visible |
| homepage:link-toolbar-visible-shell | geometry-paint | after-action | yes | Classified pixels contain one visible shell | Shell is absent or a second shell surrounds it | browser pixel classifier and exact-chrome pixel replay | test: apps/www/tests/browser/link-floating-toolbar.spec.ts#link:floating-toolbar-visible-boundary | pass: exact Chrome and Chromium visible-shell classifier; positive-control: pass; negative-control: pass |
| homepage:link-toolbar-visible-shell | runtime-errors | follow-up | yes | No task-owned runtime errors occur | Task-owned runtime error or overlay occurs | browser runtime-errors | test: apps/www/tests/browser/link-floating-toolbar.spec.ts#link:floating-toolbar-visible-boundary | pass: recorder empty |
| homepage:link-toolbar-visible-shell | follow-up-input | follow-up | yes | Edit link opens its input and Escape restores editor focus | Follow-up input fails or focus is lost | browser input | test: apps/www/tests/browser/link-floating-toolbar.spec.ts#link:floating-toolbar-visible-boundary | pass: input and Escape work |
| homepage:table-toolbar-single-shell | model | after-action | no | N/A: the selected table state is setup, not the shell invariant | N/A: document mutation is not the reported defect | N/A: model observation does not apply | N/A: no executable model assertion applies | N/A: model observation does not apply |
| homepage:table-toolbar-single-shell | dom-native | after-action | yes | One provider wrapper contains one inner Toolbar | Provider wrapper inherits shell paint around the Toolbar | browser DOM | test: apps/www/tests/browser/link-floating-toolbar.spec.ts#table:floating-toolbar-single-shell | pass: one transparent provider contains one Toolbar |
| homepage:table-toolbar-single-shell | pointer-feedback | after-action | no | N/A: drag-selection is setup and the report makes no cursor, hover, active, or drag-affordance claim | N/A: pointer feedback cannot contradict the final toolbar-shell acceptance | N/A: pointer-feedback observation does not apply | N/A: no executable pointer-feedback assertion applies | N/A: pointer-feedback observation does not apply |
| homepage:table-toolbar-single-shell | focus | after-action | yes | Editor focus survives table selection and toolbar use | Opening the toolbar steals focus | browser focus | test: apps/www/tests/browser/link-floating-toolbar.spec.ts#table:floating-toolbar-single-shell | pass: editor remains focused after selection and menu close |
| homepage:table-toolbar-single-shell | popup | after-action | yes | One table toolbar is visible | Missing toolbar or duplicate provider-owned surface | browser popup | test: apps/www/tests/browser/link-floating-toolbar.spec.ts#table:floating-toolbar-single-shell | pass: one popup with one painted shell |
| homepage:table-toolbar-single-shell | geometry-paint | after-action | yes | Classified pixels show only the inner compact shell | Outer rounded background, ring, or shadow remains visible | browser pixel classifier and exact-chrome pixel replay | test: apps/www/tests/browser/link-floating-toolbar.spec.ts#table:floating-toolbar-single-shell | pass: zero outer pixels in exact Chrome and Chromium; positive-control: pass; negative-control: pass |
| homepage:table-toolbar-single-shell | runtime-errors | follow-up | yes | No task-owned runtime errors occur | Task-owned runtime error or overlay occurs | browser runtime-errors | test: apps/www/tests/browser/link-floating-toolbar.spec.ts#table:floating-toolbar-single-shell | pass: recorder empty |
| homepage:table-toolbar-single-shell | follow-up-input | follow-up | yes | Cell borders menu opens and Escape restores editor focus | Button becomes unusable or focus is lost | browser input | test: apps/www/tests/browser/link-floating-toolbar.spec.ts#table:floating-toolbar-single-shell | pass: menu opens and Escape restores editor focus |
| homepage:ai-menu-single-shell | model | after-action | no | N/A: opening the AI menu does not mutate the editor document | N/A: no document mutation belongs to this paint case | N/A: model observation does not apply | N/A: no executable model assertion applies | N/A: model observation does not apply |
| homepage:ai-menu-single-shell | dom-native | after-action | yes | One provider wrapper contains one inner Command | Provider wrapper inherits shell paint around the Command | browser DOM | test: apps/www/tests/browser/link-floating-toolbar.spec.ts#ai:floating-menu-single-shell | pass: one transparent provider contains one Command |
| homepage:ai-menu-single-shell | pointer-feedback | after-action | no | N/A: the reported shell defect has no cursor, hover, active, tooltip, or drag-affordance claim | N/A: pointer feedback cannot contradict this paint-only acceptance | N/A: pointer-feedback observation does not apply | N/A: no executable pointer-feedback assertion applies | N/A: pointer-feedback observation does not apply |
| homepage:ai-menu-single-shell | focus | after-action | yes | AI input receives focus | Menu opens without usable input focus | browser focus | test: apps/www/tests/browser/link-floating-toolbar.spec.ts#ai:floating-menu-single-shell | pass: AI input focused before paint assertion |
| homepage:ai-menu-single-shell | popup | after-action | yes | One AI menu is visible | Missing menu or duplicate provider-owned surface | browser popup | test: apps/www/tests/browser/link-floating-toolbar.spec.ts#ai:floating-menu-single-shell | pass: one popup with one painted Command shell |
| homepage:ai-menu-single-shell | geometry-paint | after-action | yes | Classified pixels show only the inner Command shell | Outer rounded background, ring, or shadow remains visible | browser pixel classifier and exact-chrome pixel replay | test: apps/www/tests/browser/link-floating-toolbar.spec.ts#ai:floating-menu-single-shell | pass: zero outer pixels in exact Chrome and Chromium; positive-control: pass; negative-control: pass |
| homepage:ai-menu-single-shell | runtime-errors | follow-up | yes | No task-owned runtime errors occur | Task-owned runtime error or overlay occurs | browser runtime-errors | test: apps/www/tests/browser/link-floating-toolbar.spec.ts#ai:floating-menu-single-shell | pass: recorder empty |
| homepage:ai-menu-single-shell | follow-up-input | follow-up | yes | Escape closes the menu and restores editor focus | Menu traps or loses editor focus | browser input | test: apps/www/tests/browser/link-floating-toolbar.spec.ts#ai:floating-menu-single-shell | pass: Escape closes menu and restores editor focus |

Proof receipts:
| Case ID | Attempt | Claim | Command | Result | Ref | Input digest | Input count | Inputs | Host | Latest input mtime | Proof started | Proof ended | Retries | Receipt ID |
|---------|---------|-------|---------|--------|-----|--------------|-------------|--------|------|--------------------|---------------|-------------|---------|------------|
| homepage:link-toolbar-visible-shell | 1 | completed | "/usr/bin/env" "PLAYWRIGHT_BASE_URL=http://localhost:3001" "PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" "pnpm" "--filter" "www" "exec" "playwright" "test" "--config" "playwright.config.ts" "--project=chromium" "tests/browser/link-floating-toolbar.spec.ts" "--grep" "floating-toolbar-visible-boundary" "--repeat-each=5" | pass: exit 0 in 16370ms | dirty:168a4490e2ccf90dd9b1bd3230fb2f528460caa2 | sha256:b306e9c632124c42e55c9b4aa5c89f9ab47fe9485eda8402c540e29d7d6b8a13 | 10 | apps/www/playwright.config.ts,apps/www/scripts/registry-style-transform.mts,apps/www/scripts/registry-style-transform.test.mts,apps/www/src/app/globals.css,apps/www/src/components/site-registry/floating-popover.tsx,apps/www/src/registry/components/editor/ai-menu.tsx,apps/www/src/registry/components/editor/table.tsx,apps/www/src/registry/styles/preview-style-classes.css,apps/www/src/registry/styles/preview-style-classes.ts,apps/www/tests/browser/link-floating-toolbar.spec.ts | pid:87318;started:2026-08-26T10:59:31.000Z;base-url:http://localhost:3001;browser:exact-chrome:google-chrome-151;browser-executable:/Applications/Google Chrome.app/Contents/MacOS/Google Chrome;browser-version:Google Chrome 151.0.7922.174 | 2026-08-26T11:13:52.404Z | 2026-08-26T11:19:32.594Z | 2026-08-26T11:19:48.965Z | 0 | sha256:57b53c7f707218318aa70d039e850ebaca4a573fd00a8460a65cc84c9cf991d3 |
| homepage:table-toolbar-single-shell | 2 | completed | "/usr/bin/env" "PLAYWRIGHT_BASE_URL=http://localhost:3001" "PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" "pnpm" "--filter" "www" "exec" "playwright" "test" "--config" "playwright.config.ts" "--project=chromium" "tests/browser/link-floating-toolbar.spec.ts" "--grep" "table:floating-toolbar-single-shell" "--repeat-each=5" | pass: exit 0 in 20611ms | dirty:168a4490e2ccf90dd9b1bd3230fb2f528460caa2 | sha256:b306e9c632124c42e55c9b4aa5c89f9ab47fe9485eda8402c540e29d7d6b8a13 | 10 | apps/www/playwright.config.ts,apps/www/scripts/registry-style-transform.mts,apps/www/scripts/registry-style-transform.test.mts,apps/www/src/app/globals.css,apps/www/src/components/site-registry/floating-popover.tsx,apps/www/src/registry/components/editor/ai-menu.tsx,apps/www/src/registry/components/editor/table.tsx,apps/www/src/registry/styles/preview-style-classes.css,apps/www/src/registry/styles/preview-style-classes.ts,apps/www/tests/browser/link-floating-toolbar.spec.ts | pid:87318;started:2026-08-26T10:59:31.000Z;base-url:http://localhost:3001;browser:exact-chrome:google-chrome-151;browser-executable:/Applications/Google Chrome.app/Contents/MacOS/Google Chrome;browser-version:Google Chrome 151.0.7922.174 | 2026-08-26T11:13:52.404Z | 2026-08-26T11:20:00.472Z | 2026-08-26T11:20:21.084Z | 0 | sha256:b36c0ab85d1cbc6f6bbb34e42e83a345c577f7339df656b52e81f3e651ae365d |
| homepage:ai-menu-single-shell | 1 | completed | "/usr/bin/env" "PLAYWRIGHT_BASE_URL=http://localhost:3001" "PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" "pnpm" "--filter" "www" "exec" "playwright" "test" "--config" "playwright.config.ts" "--project=chromium" "tests/browser/link-floating-toolbar.spec.ts" "--grep" "ai:floating-menu-single-shell" "--repeat-each=5" | pass: exit 0 in 37777ms | dirty:168a4490e2ccf90dd9b1bd3230fb2f528460caa2 | sha256:b306e9c632124c42e55c9b4aa5c89f9ab47fe9485eda8402c540e29d7d6b8a13 | 10 | apps/www/playwright.config.ts,apps/www/scripts/registry-style-transform.mts,apps/www/scripts/registry-style-transform.test.mts,apps/www/src/app/globals.css,apps/www/src/components/site-registry/floating-popover.tsx,apps/www/src/registry/components/editor/ai-menu.tsx,apps/www/src/registry/components/editor/table.tsx,apps/www/src/registry/styles/preview-style-classes.css,apps/www/src/registry/styles/preview-style-classes.ts,apps/www/tests/browser/link-floating-toolbar.spec.ts | pid:87318;started:2026-08-26T10:59:31.000Z;base-url:http://localhost:3001;browser:exact-chrome:google-chrome-151;browser-executable:/Applications/Google Chrome.app/Contents/MacOS/Google Chrome;browser-version:Google Chrome 151.0.7922.174 | 2026-08-26T11:13:52.404Z | 2026-08-26T11:20:31.904Z | 2026-08-26T11:21:09.682Z | 0 | sha256:ef9efd806cce9a815e5b1c41b0b26a88e52adb88551606b8fbe9dbc0c3c56a60 |

Affected corpus replay:
| Owner | Affected cases | Pre-edit baseline | Last owner edit | Combined command | Receipt input digest | Result |
|-------|----------------|-------------------|-----------------|------------------|----------------------|--------|
| Generated `.style-*` marker selector and transparent floating-popover consumers | homepage:link-toolbar-visible-shell, homepage:table-toolbar-single-shell, homepage:ai-menu-single-shell | red: link passed; table failed with 50 outer pixels; AI failed with 1374 outer pixels | 2026-08-26T11:13:52.404Z | three focused exact Google Chrome 151 case replays with `--repeat-each=5` | sha256:b306e9c632124c42e55c9b4aa5c89f9ab47fe9485eda8402c540e29d7d6b8a13 | pass: 15/15 exact Chrome runs after the last owner edit; zero retries |

Gate failure closure:
| Gate | Failure signal | Classification | Resolution | Final rerun |
|------|----------------|----------------|------------|-------------|
| Initial browser command | Accidental separator passed the focused path incorrectly and started the broader suite | proof-command | Stopped it and invoked Playwright with the exact config, project, and test path | pass: final exact Chrome command completed 15/15 |
| Exact Chrome link receipt command | Anchored grep returned `No tests found` although the literal case title exists | proof-command | Replaced the brittle anchored filter with the unique literal title fragment | pass: exact Chrome link replay completed 5/5 and emitted a valid receipt |
| Pixel classifier controls | Initial crop/transition timing hid the known-positive signal | proof-harness | Moved controls through the same outer-annulus capture path and waited for stable paint | pass: every geometry row reports positive-control and negative-control pass |
| Fresh route host | Registry generation left the prior dev process serving stale CSS and a missing generated import | proof-host | Stopped only the task-owned process and started fresh PID 87318 on port 3001 | pass: final receipt attests PID, start time, base URL, exact Chrome, and current input digest |
| Scoped Ultracite | Focused lint found formatting drift in changed files | product-format | Ran the repo formatter on the scoped files and reran the same check | pass: scoped Ultracite check has zero diagnostics |
| `pnpm --filter www typecheck` | API reference parity failed on a stale generated manifest before TypeScript | generated-parity | Ran the owning `api-reference` generator, then reran the exact typecheck | pass: exact final typecheck exited 0 and route/source/registry checks passed |

Failed fix history:
| Case ID | Attempt | Failure signal | Failure kind | Prior claim invalidated | Regression repair | Workflow test | Architecture trigger | Best API / layer plan | Resume state |
|---------|---------|----------------|--------------|-------------------------|-------------------|---------------|----------------------|-----------------------|--------------|
| homepage:table-toolbar-single-shell | 1 | Reporter screenshot shows nested table-toolbar shells after prior local completion claim | reporter-contradiction | yes: prior link-only proof and completion receipt cannot authorize the shared selector | repair-now: `.agents/rules/regression.mdc` requires shared style changes to inventory explicit override consumers and negative paint oracles | pass: 57 Regression workflow tests plus source/generated parity | no: first failed fix and no architecture trigger | N/A: first failure has no architecture trigger | reproduced: link passes while table and AI fail exact classified-pixel assertions on unchanged product bytes |

Architecture pressure:
| Case ID | Failed fix count | Triggers | Verdict | Best API | Layer plan | Proof |
|---------|------------------|----------|---------|----------|------------|-------|
| homepage:link-toolbar-visible-shell | 0 | none: no architecture trigger | patch | N/A: no reusable public API changes | N/A: no Plate or Plite layer-plan trigger | pass: existing marker and generated class map remain the canonical owner |
| homepage:table-toolbar-single-shell | 1 | none: no architecture trigger | patch | N/A: no reusable public API changes | N/A: no Plate or Plite layer-plan trigger | pass: one CSS cascade owner overrode an explicit consumer neutralizer; no cross-layer compensation is needed |
| homepage:ai-menu-single-shell | 0 | none: no architecture trigger | patch | N/A: no reusable public API changes | N/A: no Plate or Plite layer-plan trigger | pass: same shared CSS owner and consumer contract as the table case |

Proof-host readiness:
| Case ID | Source owner | Runner / route / host | Freshness evidence | Generated/export boundary | Result |
|---------|--------------|-----------------------|--------------------|---------------------------|--------|
| homepage:link-toolbar-visible-shell | generated preview selector and link-toolbar consumer | fresh PID 87318 on port 3001; homepage `/`; Browser, Chromium, and exact Chrome | process started 2026-08-26T10:59:31Z after final generation; receipt hashes current inputs | source generator emits CSS; generated CSS was rebuilt, never hand-edited | pass: one opaque shell on fresh source |
| homepage:table-toolbar-single-shell | generated preview selector plus `table.tsx` | fresh PID 87318 on port 3001; homepage `/`; Browser, Chromium, and exact Chrome | process started 2026-08-26T10:59:31Z after final generation; receipt hashes current inputs | source generator emits CSS; generated CSS was rebuilt, never hand-edited | pass: transparent outer and one inner shell |
| homepage:ai-menu-single-shell | same selector plus `ai-menu.tsx` | same fresh host and route | same process and receipt freshness evidence | source generator plus rebuilt generated CSS | pass: transparent outer and one inner Command shell |

Patch delegation:
| Case ID | Red test | Allowed owner/files | Required proof/stability | Patch return evidence | Result |
|---------|----------|---------------------|--------------------------|-----------------------|--------|
| homepage:table-toolbar-single-shell | exact browser red on outer annulus/transparent wrapper | `registry-style-transform.mts`, shadcn style sync generator, `table.tsx`, `ai-menu.tsx`, focused tests; forbid link logic/Plite/templates/public APIs | combined link/table/AI green, pixel controls, 5/5, typecheck, builds | root cause: unlayered generated CSS overrode transparent utilities; final receipt and dirty fingerprint recorded; local-only caveat retained | pass: one normalized shared-owner patch closed all three affected cases |

Stability:
| Case ID | Executable proof / host | Required runs | Results | Retry count | Decision |
|---------|-------------------------|---------------|---------|-------------|----------|
| homepage:link-toolbar-visible-shell | exact Google Chrome 151 combined corpus receipt | 5/5 | pass: five warm runs with one opaque shell | 0 | completed locally |
| homepage:table-toolbar-single-shell | exact Google Chrome 151 combined corpus receipt | 5/5 | pass: five warm runs with a transparent provider and one inner shell | 0 | completed locally |
| homepage:ai-menu-single-shell | exact Google Chrome 151 combined corpus receipt | 5/5 | pass: five warm runs with a transparent provider and one inner Command shell | 0 | completed locally |

Packet decisions:
| Case | Executable evidence | Decision | Claim width | Residual risk | Next owner |
|------|---------------------|----------|-------------|---------------|------------|
| homepage:link-toolbar-visible-shell | exact Chrome 5/5 plus bundled Chromium 5/5 and classifier controls | keep | local uncommitted candidate on dirty base `168a4490e2ccf90dd9b1bd3230fb2f528460caa2` | no pushed-ref or integration proof | user if commit/push is wanted |
| homepage:table-toolbar-single-shell | pre-edit exact red, exact Chrome 5/5 green, bundled Chromium 5/5 green | keep | local uncommitted candidate on dirty base `168a4490e2ccf90dd9b1bd3230fb2f528460caa2` | no pushed-ref or integration proof | user if commit/push is wanted |
| homepage:ai-menu-single-shell | pre-edit exact red, exact Chrome 5/5 green, bundled Chromium 5/5 green | keep | local uncommitted candidate on dirty base `168a4490e2ccf90dd9b1bd3230fb2f528460caa2` | no pushed-ref or integration proof | user if commit/push is wanted |

Methodology deltas:
| Case | Miss or owner checked | Decision | Durable owner/change | Focused proof | Trigger/result |
|------|-----------------------|----------|----------------------|---------------|----------------|
| homepage:link-toolbar-visible-shell | Existing positive-shell case remains required in the widened corpus | no-change | Existing executable test remains the durable behavior owner | pass: link classifier baseline | Shared-selector repair must preserve this positive case |
| homepage:table-toolbar-single-shell | Prior link-only proof missed explicit neutralizing consumers of the broadened CSS marker selector | repair-now | `.agents/rules/regression.mdc`, methodology reference, and plan template require consumer inventory plus forbidden duplicate-paint oracles | pass: 57 workflow tests and source/generated parity | Product retry unlocked at attempt 2 after exact reproduction |
| homepage:ai-menu-single-shell | New consumer inventory found the same explicit transparent-wrapper contract | no-change | The repaired Regression shared-style rule already owns future discovery | pass: AI pixel controls expose the inherited shell | Affected-corpus row added before shared-owner edit |

Workflow slowdowns:
| Step / command | Owner | Elapsed / expected | Cause | Evidence value | Repair/result |
|----------------|-------|--------------------|-------|----------------|---------------|
| Initial focused browser invocation | proof command | avoidable broad start | A malformed separator did not preserve the intended focused path | none: unrelated suite work | stopped and replaced with the exact Playwright config/project/file command |
| First pixel probe | browser harness | two repair iterations | crop, transition timing, and a hidden positive control made the classifier inconclusive | valuable after repair only | controls now traverse the identical capture/classification path and pass |
| Table toolbar setup | browser harness | one repair iteration | click/drag alone did not establish the editor harness focus required by the table plugin | exact setup discovery | real drag-selection plus explicit harness focus reliably opens the toolbar |
| Generated CSS host | apps/www dev host | one restart | pre-generation process served stale CSS and logged a missing generated import | invalid host until refresh | restarted only the task-owned process after generation; final host receipt is fresh |
| Website typecheck | generated API reference | one generator pass | stale API reference manifest blocked the typecheck before TypeScript | valid parity signal | owning generator ran; exact typecheck then passed |

Findings:
- The screenshot exactly matches `TableFloatingToolbarContent`: an explicitly
  transparent `FloatingPopoverContent` wrapping a styled `Toolbar`.
- Generated marker CSS was unlayered, so it outranked Tailwind's layered caller
  utilities; selector specificity reduction alone could not restore the explicit
  `bg-transparent` and `shadow-none` contract.
- `ai-menu.tsx` has the same transparent-wrapper composition and joins the
  affected corpus.
- The durable fix puts zero-specificity generated defaults in `@layer components`;
  explicit consumer utilities then win, and the transparent wrappers also state
  `ring-0` against the new default ring.

Timeline:
- 2026-08-26 Reporter contradicted the prior local completion with a duplicate
  table-toolbar shell screenshot; product edits froze and repair-now started.
- 2026-08-26 Regression gained the shared-style consumer-inventory rule and its
  57 workflow tests passed before product attempt 2.
- 2026-08-26 Attempt 2 passed the three-case affected corpus 5/5 in exact Google
  Chrome 151, plus bundled Chromium, transform, lint, generation, and typecheck.

Decisions and tradeoffs:
- Prefer zero-specificity generated selectors so explicit component utilities
  remain authoritative; separately neutralize the new shadcn ring on intended
  transparent wrappers. Reject hard-coded per-style classes and DOM mutation.

Review fixes:
- Agent-native workflow review found no routing, authority, source/mirror, or
  executable-validation gap after the Regression repair.
- Autoreview is N/A because repository policy forbids it on branch `next`.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Focused Playwright path was not preserved | 1 | invoke Playwright with exact config/project/file arguments | final exact command passed 15/15 |
| Pixel sentinel crop/control was inconclusive | 1 | share the product capture and classifier path with visible/absent controls | both controls pass for every paint row |
| Table drag-selection did not open the toolbar | 1 | establish editor harness focus before real drag-selection | exact table case reliably opens and passes |
| Existing dev process served stale generated CSS | 1 | restart only the task-owned host after generation | final PID and input digest attested |
| Typecheck hit stale API-reference parity | 1 | run the owning API reference generator | exact final typecheck passed |

Verification evidence:
- `node --test .agents/rules/regression/scripts/test-first-contract.test.mjs .agents/rules/regression/scripts/validate-regression-plan.test.mjs .agents/skills/regression/scripts/test-first-contract.test.mjs`: pass, 57/57.
- `node .agents/rules/plate-next/scripts/sync-resources.mjs --check`: pass, agent
  source and generated mirrors exact.
- `pnpm --filter www exec tsx scripts/registry-style-transform.test.mts`: pass,
  7/7 tests and 198 assertions.
- `pnpm --filter www build:registry` and `pnpm --filter www build:tw`: pass;
  generated registry and Tailwind output rebuilt from source.
- Scoped Ultracite check over all changed product/test/config files: pass with
  zero formatting or lint diagnostics.
- `pnpm --filter www typecheck`: pass, including editor checks, API-reference
  parity, docs source parity, registry source parity, and route generation.
- Bundled Chromium affected corpus: pass 5/5 per case with zero retry.
- Exact Google Chrome 151.0.7922.174 affected corpus: pass 15/15 combined,
  five warm runs per case, zero retry; receipts above bind the ten inputs.
- Direct Browser/Chrome inspection confirmed table and AI outer wrappers are
  transparent with no shadow while the link toolbar remains opaque; no app-owned
  runtime errors occurred.

Final handoff:
- executable cases: link visible shell, table single shell, and AI single shell
  all completed in one permanent Playwright file.
- cumulative reporter evidence, phase-specific oracles, and forbidden states:
  all original and latest claims remain required and pass the complete matrix.
- failed-fix invalidation and automatic repair: prior link-only completion was
  revoked; Regression source/reference/template/test were repaired before retry.
- proof receipts and affected-corpus replay: three attempt-2 receipts share the
  final digest and attest exact Chrome 15/15 after the last owner edit.
- started-gate failure closure: all five failed proof/static gates have exact
  passing reruns.
- changed source owners: preview style generator and test, table and AI transparent
  consumers, Playwright config/test, and Regression source/reference/template/test;
  registry/Tailwind/API-reference outputs were regenerated from their owners.
- design decision: generated style defaults use zero specificity inside
  `@layer components`; explicit component utilities remain authoritative.
- tests and proof: workflow 57/57, transform 7/7, exact Chrome 15/15, bundled
  Chromium stability, scoped lint, registry/Tailwind generation, and typecheck pass.
- source/generated sync: `pnpm install`, registry build, Tailwind build, API
  reference generation, and skill source/mirror parity completed; `templates/**`
  was not edited.
- P1 and agent-native findings: Autoreview N/A on `next`; agent-native review clear.
- residual risks and next owner: no known local behavior risk; user owns any
  decision to commit/push and a pushed-ref replay would then be required.
- local completion status and integration/public-status boundary: completed only
  as an uncommitted/unpushed dirty-tree candidate; not integrated, shipped, or released.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | final validated local closure |
| Where am I going? | user handoff; commit/push only if requested |
| What is the goal? | close selected regressions through executable tests and fresh proof |
| What have I learned? | unlayered generated defaults can override explicit utility neutralizers even after selector specificity is reduced |
| What have I done? | repaired Regression, fixed the canonical CSS owner, regenerated outputs, and proved all affected cases in exact Chrome |

Open risks:
- No known local behavior risk. The candidate is uncommitted and unpushed, so no
  integration, deployment, or release claim exists; replay after any byte or ref change.
