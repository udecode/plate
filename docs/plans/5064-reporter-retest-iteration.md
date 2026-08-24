# Felix reporter retest iteration

Objective:
Repair four residual cases from Felix's notification sweep; done when each
updated exact case passes 5/5 and the failed-fix workflow is repaired.

Flow mode:
one-shot execution

Goal plan:
docs/plans/5064-reporter-retest-iteration.md

Template:
docs/plans/templates/regression.md

Primary template:
docs/plans/templates/regression.md

Applied packs:
- agent-native
- browser

Regression source:
- target bug / surface / corpus: Felix's unread reply sweep on issues #5064,
  #5065, #5066, #5070, #5085, #5086, #5087, and #5088. Confirmations close
  #5064, #5065, #5066, #5086, and #5087. Residual work is #5070's held-drag
  inline caret, #5085's Comment action, #5085's Turn Into action, and #5088's
  missing drag marquee.
- lane and current source owner: Plate/Plite DnD and native selection (#5070),
  Plite React focus/control ownership plus Plate floating-toolbar actions
  (#5085), and Plate structural block-selection overlay lifecycle (#5088);
  Best API and layer plans must select the durable owners before product edits
- selected executable test cases: `plate-5070-held-drag-caret-attempt-2`,
  `plate-5085-comment-control`, `plate-5085-turn-into-control`, and
  `plate-5088-drag-marquee-attempt-2`
- tested ref or dirty-state boundary: `HEAD == upstream ==
  2b206974844c62c487337da12733293db10f674b` before this iteration; record
  every issue-owned production/test/fixture/harness fingerprint; do not use an
  unexplained working-tree or server state for public completion
- route / proof host and freshness method: source-built homepage and Playground
  routes from `PORT=3124 pnpm --filter www dev:plite`; focused Playwright for
  repeatability and exact Chrome for native held-state diagnosis and the full
  final replay; restart the host after the last product edit
- invocation mode / timebox: one-shot full four-case iteration; no timebox

First checkpoint:
- Copy every explicit requirement, scope boundary, non-goal, timing rule, stop
  condition, deliverable, verification surface, and final handoff requirement
  into the Work Checklist before mutable work.
- Load `.agents/skills/regression/references/methodology.md`.
- Fill the selected-case, reporter-oracle, failed-fix, and architecture tables,
  then run `validate-regression-plan.mjs` before implementation.
- Do not create a TSV, JSON, database, manifest, or manual case registry.

Completion threshold:
- Every unread Felix reply is read live. Confirmed issues stay closed; every
  residual observable is translated into a cumulative reporter oracle before
  product edits.
- Every residual issue remains open without `completed`. Live state already
  satisfies this correction for #5070, #5085, and #5088. A new `completed`
  label is forbidden until a future exact replay on the final pushed ref.
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
- live `gh issue view` before status correction, before any later comment, and
  after each public mutation
- selected executable package/DOM/Playwright/Browser/Chrome/device commands
- exact final-case replay and retry-free stability when required
- source/host freshness proof and exact final ref
- generated proof receipts and affected-corpus replay
- `node .agents/skills/regression/scripts/validate-regression-plan.mjs docs/plans/5064-reporter-retest-iteration.md --complete`
- P1 Autoreview: N/A by explicit standing user instruction for this session;
  direct executable and browser proof remains mandatory
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5064-reporter-retest-iteration.md`

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
- #5070 and #5088 are second failed fixes; #5085 is a confirmed mark fix with
  two newly exposed related control failures. All three surfaces trigger
  focus/selection/cross-layer architecture pressure, so run `best-api` plus the
  owning `plite-plan`, `plate-plan`, or both before Patch changes product code.
- Do not lint. Do not run Autoreview.
- Do not commit, push, create a PR, merge, release, close an issue, or imply
  shipping. Product fixes remain local unless the user separately authorizes
  integration.
- Comments, when reporter-valid local packets pass, must say local,
  uncommitted/unpushed, not fixed/completed. Do not defend the old proof.

Boundaries:
- allowed source owners: the exact Plite/Plate runtime owners selected by Best
  API and layer-plan review; Regression source rule/methodology/template/helper/
  validator for the mandatory failed-fix repair
- allowed proof/test owners: the four existing issue-owned executable browser
  cases and the smallest package/DOM/benchmark diagnostics needed to express
  Felix's missing invariant
- generated/source boundary: edit `.agents/rules/**` only for agent doctrine;
  run `pnpm install` to regenerate `.agents/skills/**` and `.claude/skills/**`;
  never edit generated skill mirrors directly
- browser/device claim width: exact Chrome on macOS for the reporter browser
  flows; Browser/Playwright may diagnose but cannot certify final Chrome claims
- forbidden product/API/release/public mutations: no unrelated product scope,
  lint, Autoreview, commit, push, PR, merge, release, issue close, or renewed
  `completed` label without final-pushed-ref proof
- orchestration mode and writer ownership: main agent only; no child agents or
  parallel writers; serialize four cases and shared homepage host

Output budget strategy:
- Start from exact owner and test files. Use runner discovery/counts before
  printing broad corpora. Query only four issues with compact JSON, cap logs,
  exclude generated/build trees, and store high-volume proof output in transient
  artifacts rather than streaming it.

Blocked condition:
- Block only when exact current behavior cannot be observed, the authoritative
  host/device/credential is unavailable, unsafe scope needs user authority, or
  the same blocker leaves no safe alternate packet.
- Repair broken commands, stale servers, generated drift, and missing proof
  hosts before treating them as product blockers.
- If the reporter requires an unavailable physical device/profile or private
  reproduction state, exhaust exact Chrome and source-level diagnostics, then
  stop that case with the precise missing evidence instead of claiming green.

Regression state:
- current phase: architecture gate
- current executable case: four reproduced residuals with exact owner traces
- current case status: prior completion invalidated; Regression repair passed;
  product edits remain frozen until the two exact architecture plans are accepted
- next owner: user acceptance, then Regression/Patch
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
| Prompt requirements captured | yes | All unread Felix replies, four residual atomic cases, confirmation preservation, second-failure architecture pressure, stale-label truth, local proof, no lint/Autoreview, and no unrequested integration are recorded. |
| Regression methodology loaded | yes | `.agents/skills/regression/references/methodology.md` read completely before goal creation or product work. |
| Active goal checked or created | yes | New matching active goal created for this exact four-case attempt-2 run. |
| Current source owner and tested ref recorded | yes | Initial checkout and upstream both resolve to `2b206974844c62c487337da12733293db10f674b`; likely owners are DnD/native selection, floating-toolbar control focus, and block-selection overlay lifecycle. |
| Executable test cases discovered | yes | Existing #5070 and #5088 tests are adjacent but incomplete; two new #5085 titles and stronger held-phase assertions are specified in the accepted layer plans. |
| Reporter oracle matrix resolved | yes | Original issue acceptance and every later Felix delta are cumulative; transient and final fields are split by phase below. |
| Regression semantic validator ready | yes | Source validator and mirrors require cumulative failed-fix evidence plus phase-qualified oracle anchors; 46/46 focused workflow tests pass. |
| Route/proof-host readiness plan recorded | yes | Fresh source-built `www` host on port 3124, focused Playwright, and exact Chrome replay are recorded. |
| Patch delegation boundary recorded | yes | Exactly one normalized reporter case at a time after Regression repair and Best API/layer-plan gates. |
| Orchestrator writer ownership recorded | yes | Main-agent serialized execution; no subagents or parallel writers. |
| Output budget strategy recorded | yes | Four compact live issue reads, focused source/test discovery, capped logs, transient proof artifacts. |
| Claim width and blocked rules recorded | yes | Local candidate only unless exact final-pushed ref is replayed; unavailable exact reporter environment blocks wider claims. |
| Agent-native pack selected | yes | Failed-fix auto-repair necessarily changes Regression agent workflow. |
| Agent-facing action surface identified | yes | Failed-fix intake must reject a packet that ignores a fresh reporter's complete new reply or labels the stale claim authoritative. |
| Source rule versus generated mirror boundary identified | yes | `.agents/rules/**` is source; `pnpm install` generates `.agents/skills/**` and `.claude/skills/**`. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded completely; source/mirror parity, discoverability, and forward rejection tests passed. |
| Browser pack selected | yes | All four claims are real editor/browser behavior; #5070 and #5088 require exact Chrome held-phase paint. |
| Browser route / app surface identified | yes | Homepage Playground and standalone demo routes resolved from current tests after live intake. |
| Browser tool decision recorded | yes | Exact Chrome for final proof; current executable harness for repeatability; no Puppeteer substitution. |
| Console/network caveat policy recorded | yes | Only reporter-path runtime failures count; pre-assertion unrelated network/navigation failures are proof-host failures and restart the count. |
| Observable browser case captured | yes | Live text and media were inspected; exact Chrome reproduced Plite's drop-cursor node, two dead non-mark controls, and a transparent 100x78 marquee portal. |

Work Checklist:
- [x] Skill analysis complete: Maintainer owns live public truth, Regression is
      the supervisor, Patch is the
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
- [x] Every selected case has one reporter-oracle row for model, DOM/native,
      focus, popup, geometry/paint, runtime errors, and follow-up input.
- [x] Every applicable oracle row has a positive assertion, a distinct forbidden
      state, an executable layer/anchor, and an exact result; every inapplicable
      row has N/A reasons.
- [x] The smallest falsifying executable probe ran before scaling.
- [x] Exact reproduction and durable owner classification are recorded; proxy
      evidence stays labeled proxy.
- [ ] The executable test is red before the fix, or the exact safe-red
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
- [ ] Every already-executable affected case has a `pass:` or `red:` pre-edit
      baseline recorded before its shared owner changes.
- [ ] Every requested or started package, browser, root, or CI gate that failed
      is recorded and passes an exact final rerun on the final bytes.
- [ ] Every selected case is kept, reverted, quarantined, deferred, or blocked
      honestly; only kept cases can satisfy goal success.
- [ ] No sidecar case registry, TSV, JSON manifest, or duplicate behavior
      database was created.
- [ ] Orchestrator ownership and overlapping writer/host serialization passed
      or are N/A with reason.
- [ ] Workflow slowdowns and avoidable proof-host/command mistakes were
      repaired or deferred with owner.
- [ ] Every case records one methodology delta.
- [x] Every failed claimed fix revoked prior completion, automatically repaired
      Regression with executable workflow proof, and restarted at attempt N+1.
- [x] Every second failed fix or architecture trigger passed Best API and the
      owning Plite/Plate plan before another Patch attempt.
- [ ] Claim wording matches local, pushed, integration, and release evidence.
- [ ] Every kept case and the run are marked `completed` once all required local
      proof and plan gates pass; commit/push state is recorded separately.
- [ ] Final handoff records executable tests, decisions, refs, proof, sync,
      reviews, risks, and next owner.
- [ ] Output budget discipline was followed.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
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
| Reporter oracle closure | pending | Resolve positive and forbidden states for all seven observation rows per case | pending |
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
| Regression semantic plan | yes | Run `node .agents/skills/regression/scripts/validate-regression-plan.mjs docs/plans/5064-reporter-retest-iteration.md --complete` | pending |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5064-reporter-retest-iteration.md` | pending |
| Agent source / generated sync | pending | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | pending |
| Agent action discoverability | pending | Source-audit the skill/rule path an agent will read | pending |
| Agent-native review | pending | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | pending |
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
| Requirement extraction and goal setup | completed | Live issue bodies, every Felix delta, constraints, and four atomic residuals captured. | source/host readiness |
| Current source and proof-host readiness | completed | Product ref `2b206974844c62c487337da12733293db10f674b`; fresh source host on port 3124. | discover executable cases |
| Executable case discovery and selection | completed | Two adjacent existing tests and two missing exact #5085 rows identified. | smallest probe |
| Reporter oracle expansion | completed | Cumulative evidence inventory and phase-specific matrix below. | semantic validation |
| Pre-implementation semantic validation | blocked | Exact planned test titles do not exist until accepted execution adds the red tests. | user acceptance |
| Smallest high-value probe | completed | Exact Chrome held-state DOM/style/focus probes falsified the old oracles. | reproduce/classify |
| Reproduce, classify, and red test | in_progress | Exact browser reproduction and owner classification complete; durable executable red tests await plan acceptance. | patch delegation |
| One-case Patch delegation | blocked | Product edits are frozen by the accepted-plan gate. | user acceptance |
| Focused verification and stability | pending | | packet decision |
| Keep/revert/quarantine | pending | | methodology delta |
| Methodology repair/no-change/defer | pending | | next case or closure |
| Reviews and final handoff | pending | | goal-plan check |
| Final goal-plan check | pending | | final response |

Selected executable cases:
| Case ID | Source reference | Setup / action | Expected outcome | Exact environment | Test file / command | Status | Tested ref | Next owner |
|---------|------------------|----------------|------------------|-------------------|---------------------|--------|------------|------------|
| plate-5070-held-drag-caret-attempt-2 | #5070 body and Felix comments 5314465244/5385433072 | On `/`, hold a native drag from the welcome heading across the next block, inspect before release, then drop and type | Owned block drag shows Plate's block drop affordance but no Plite text drop cursor; order, errors, selection, and typing remain valid | exact-chrome: installed Google Chrome on macOS against fresh source-built `www` | `test: tooling/e2e/homepage-dnd.test.ts#moves a block without breaking follow-up editing`; strengthen with held `data-plite-drop-cursor` and paint assertions | reproduced; red-test edit blocked on plan acceptance | commit:2b206974844c62c487337da12733293db10f674b | Patch after `docs/plans/5070-suppress-claimed-drop-cursor.md` acceptance |
| plate-5085-comment-control | #5085 body and Felix comment 5385360833 | Select `Experience a modern`; click Comment once | The selected range gains draft-comment marks, the main selection collapses by command design, and the focused reply editor opens | exact-chrome: installed Google Chrome on macOS against fresh source-built Playground | `test: tooling/e2e/floating-toolbar.test.ts#floating Comment marks the target and opens the reply editor` | reproduced; exact test title not created before plan acceptance | commit:2b206974844c62c487337da12733293db10f674b | Patch after `docs/plans/5085-5088-toolbar-marquee-ownership.md` acceptance |
| plate-5085-turn-into-control | #5085 body and Felix comment 5385360833 | Select `Experience a modern`; click Turn Into once | Selection ownership survives and the Turn Into menu opens | exact-chrome: installed Google Chrome on macOS against fresh source-built Playground | `test: tooling/e2e/floating-toolbar.test.ts#floating Turn Into opens without losing the selection` | reproduced; exact test title not created before plan acceptance | commit:2b206974844c62c487337da12733293db10f674b | Patch after `docs/plans/5085-5088-toolbar-marquee-ownership.md` acceptance |
| plate-5088-drag-marquee-attempt-2 | #5088 body and Felix comments 5314466483/5385439336 | On Playground, hold a native gutter drag across the heading and next block and inspect before release | Crossed blocks are structurally selected, native text selection and floating toolbar stay absent, and a nontransparent marquee paints throughout the held drag | exact-chrome: installed Google Chrome on macOS against fresh source-built Playground | `test: tooling/e2e/block-selection.test.ts#drags from the editor gutter to select whole blocks`; strengthen with computed-style and pixel controls | reproduced; existing test fails after-release intermittently and does not prove paint | commit:2b206974844c62c487337da12733293db10f674b | Patch after `docs/plans/5085-5088-toolbar-marquee-ownership.md` acceptance |

Reporter evidence inventory:
| Case ID | Source role | Source reference | Phase | Claim | Disposition | Oracle anchors | Executable anchor | Result |
|---------|-------------|------------------|-------|-------|-------------|----------------|-------------------|--------|
| plate-5070-held-drag-caret-attempt-2 | base-acceptance | https://github.com/udecode/plate/issues/5070 | after-release | Block moves without `removeChild`, and follow-up typing/selection work | required | model@after-release, runtime-errors@after-release, follow-up-input@follow-up | `test: tooling/e2e/homepage-dnd.test.ts#moves a block without breaking follow-up editing` | pass: current adjacent test covers final order, error, and follow-up state |
| plate-5070-held-drag-caret-attempt-2 | intermediate-reporter-delta | https://github.com/udecode/plate/issues/5070#issuecomment-5314465244 | during-action | An unexpected inline indicator remains during drag | required | dom-native@during-action, geometry-paint@during-action | `test: tooling/e2e/homepage-dnd.test.ts#moves a block without breaking follow-up editing` | red: current test samples after release and cannot observe the held phase |
| plate-5070-held-drag-caret-attempt-2 | latest-reporter-delta | https://github.com/udecode/plate/issues/5070#issuecomment-5385433072 | during-action | Screenshot shows the blue line at the dragged-heading boundary while the original crash is absent | required | dom-native@during-action, geometry-paint@during-action | `test: tooling/e2e/homepage-dnd.test.ts#moves a block without breaking follow-up editing` | red: exact Chrome identifies a visible `data-plite-drop-cursor` span while DOM selection is empty |
| plate-5085-comment-control | base-acceptance | https://github.com/udecode/plate/issues/5085 | setup | Expanded `Experience a modern` selection opens the floating toolbar and must remain the command target | required | dom-native@setup, focus@setup, runtime-errors@after-action | `test: tooling/e2e/floating-toolbar.test.ts#floating Bold applies the mark without losing the selection` | pass: adjacent mark test proves the route and base expanded-selection setup only |
| plate-5085-comment-control | latest-reporter-delta | https://github.com/udecode/plate/issues/5085#issuecomment-5385360833 | after-action | Comment dismisses the toolbar without marking the target or opening comment UI | required | model@after-action, dom-native@after-action, focus@after-action, popup@after-action, geometry-paint@after-action | `test: tooling/e2e/floating-toolbar.test.ts#floating Comment marks the target and opens the reply editor` | red: exact Chrome reproduces body focus and no draft UI; exact test title awaits accepted execution |
| plate-5085-turn-into-control | base-acceptance | https://github.com/udecode/plate/issues/5085 | setup | Expanded `Experience a modern` selection opens the floating toolbar and must remain the command target | required | dom-native@setup, focus@setup, runtime-errors@after-action | `test: tooling/e2e/floating-toolbar.test.ts#floating Bold applies the mark without losing the selection` | pass: adjacent mark test proves the route and base expanded-selection setup only |
| plate-5085-turn-into-control | latest-reporter-delta | https://github.com/udecode/plate/issues/5085#issuecomment-5385360833 | after-action | Turn Into dismisses the toolbar without opening its menu | required | focus@after-action, popup@after-action, geometry-paint@after-action | `test: tooling/e2e/floating-toolbar.test.ts#floating Turn Into opens without losing the selection` | red: exact Chrome reproduces body focus and no menu; exact test title awaits accepted execution |
| plate-5088-drag-marquee-attempt-2 | base-acceptance | https://github.com/udecode/plate/issues/5088 | during-action | Gutter drag selects crossed blocks, shows a visual rectangle, and does not fall back to character selection | required | model@during-action, dom-native@during-action, popup@during-action, geometry-paint@during-action | `test: tooling/e2e/block-selection.test.ts#drags from the editor gutter to select whole blocks` | red: current test checks portal geometry but not paint and is unstable after release |
| plate-5088-drag-marquee-attempt-2 | intermediate-reporter-delta | https://github.com/udecode/plate/issues/5088#issuecomment-5314466483 | during-action | Structural styling and native selection/floating toolbar appeared together | required | dom-native@during-action, popup@during-action | `test: tooling/e2e/block-selection.test.ts#drags from the editor gutter to select whole blocks` | red: existing final-state query does not prove simultaneous held-state exclusion |
| plate-5088-drag-marquee-attempt-2 | latest-reporter-delta | https://github.com/udecode/plate/issues/5088#issuecomment-5385439336 | during-action | Blocks select but the drag marquee never paints | required | model@during-action, geometry-paint@during-action | `test: tooling/e2e/block-selection.test.ts#drags from the editor gutter to select whole blocks` | red: exact Chrome finds two selected blocks and a 100x78 portal with transparent background and zero border |

Reporter oracle matrix:
| Case ID | Observation | Phase | Applies | Positive assertion | Forbidden state | Proof layer | Executable anchor | Result |
|---------|-------------|-------|---------|--------------------|-----------------|-------------|-------------------|--------|
| plate-5070-held-drag-caret-attempt-2 | model | after-release | yes | Welcome block has the intended final order | Original order or duplicated/lost block | browser | `test: tooling/e2e/homepage-dnd.test.ts#moves a block without breaking follow-up editing` | pass: existing final-order assertion |
| plate-5070-held-drag-caret-attempt-2 | dom-native | during-action | yes | No `data-plite-drop-cursor` exists when Plate DnD owns the drag | Visible Plite cursor node despite empty DOM selection | exact-chrome | `test: tooling/e2e/homepage-dnd.test.ts#moves a block without breaking follow-up editing` | red: exact Chrome shows one visible cursor node |
| plate-5070-held-drag-caret-attempt-2 | focus | after-release | yes | Editor regains a valid caret/selection after drop | Body focus with unusable editor selection | browser | `test: tooling/e2e/homepage-dnd.test.ts#moves a block without breaking follow-up editing` | pass: follow-up editing succeeds |
| plate-5070-held-drag-caret-attempt-2 | popup | during-action | no | N/A: block drag has no popup acceptance | N/A: block drag has no popup forbidden state | N/A: popup does not apply | N/A: no popup behavior | N/A: excluded by case contract |
| plate-5070-held-drag-caret-attempt-2 | geometry-paint | during-action | yes | Only the Plate block-drop affordance paints | Blue Plite inline text cursor paints at the block boundary | exact-chrome | `test: tooling/e2e/homepage-dnd.test.ts#moves a block without breaking follow-up editing` | red: reporter screenshot and exact Chrome show the forbidden line |
| plate-5070-held-drag-caret-attempt-2 | runtime-errors | after-release | yes | No runtime error page or `removeChild` exception | Runtime error replaces editor or exception is logged | browser | `test: tooling/e2e/homepage-dnd.test.ts#moves a block without breaking follow-up editing` | pass: original crash remains absent |
| plate-5070-held-drag-caret-attempt-2 | follow-up-input | follow-up | yes | Typing and selection work after drop | Editor cannot accept input or selection | browser | `test: tooling/e2e/homepage-dnd.test.ts#moves a block without breaking follow-up editing` | pass: adjacent test covers follow-up input |
| plate-5085-comment-control | model | after-action | yes | The exact selected text carries draft-comment marks and the main selection collapses intentionally | No draft-marked range, or marks apply to another range | browser | `test: tooling/e2e/floating-toolbar.test.ts#floating Comment marks the target and opens the reply editor` | red: no draft UI or durable exact model assertion exists |
| plate-5085-comment-control | dom-native | setup | yes | Expanded `Experience a modern` selection is the command target | Collapsed or replaced selection before activation | browser | `test: tooling/e2e/floating-toolbar.test.ts#floating Bold applies the mark without losing the selection` | pass: exact Chrome and adjacent test establish setup |
| plate-5085-comment-control | dom-native | after-action | yes | The original range renders as a draft-comment leaf and the reply editable mounts | Unmarked target text with no reply editable | exact-chrome | `test: tooling/e2e/floating-toolbar.test.ts#floating Comment marks the target and opens the reply editor` | red: neither draft presentation nor reply editable appears |
| plate-5085-comment-control | focus | setup | yes | The expanded editor selection owns focus before activation | Body or another control owns focus before the click | browser | `test: tooling/e2e/floating-toolbar.test.ts#floating Bold applies the mark without losing the selection` | pass: adjacent mark test and exact Chrome establish setup focus |
| plate-5085-comment-control | focus | after-action | yes | The mounted `Reply...` editor intentionally owns focus | Browser body owns focus or an unfocused composer appears | exact-chrome | `test: tooling/e2e/floating-toolbar.test.ts#floating Comment marks the target and opens the reply editor` | red: body is focused after click |
| plate-5085-comment-control | popup | after-action | yes | Comment composer with `Reply...` is visible | No comment dialog/input/composer exists | exact-chrome | `test: tooling/e2e/floating-toolbar.test.ts#floating Comment marks the target and opens the reply editor` | red: no comment UI opens |
| plate-5085-comment-control | geometry-paint | after-action | yes | Draft highlight and visible reply UI replace the dismissed toolbar | Toolbar disappears with neither draft paint nor replacement UI | exact-chrome | `test: tooling/e2e/floating-toolbar.test.ts#floating Comment marks the target and opens the reply editor` | red: exact Chrome shows no replacement UI |
| plate-5085-comment-control | runtime-errors | after-action | yes | No reporter-path console/page error | Error interrupts Comment activation | browser | `test: tooling/e2e/floating-toolbar.test.ts#floating Comment marks the target and opens the reply editor` | red: exact title is absent, so no durable assertion exists |
| plate-5085-comment-control | follow-up-input | follow-up | yes | Typing in the focused reply editor updates its content | Reply editor cannot accept the next intended input | browser | `test: tooling/e2e/floating-toolbar.test.ts#floating Comment marks the target and opens the reply editor` | red: UI never opens |
| plate-5085-turn-into-control | model | after-action | no | N/A: opening the menu does not transform a block | N/A: no model mutation belongs to menu open | N/A: model does not apply | N/A: no model assertion | N/A: excluded until menu choice |
| plate-5085-turn-into-control | dom-native | setup | yes | Expanded `Experience a modern` selection is the command target | Collapsed or replaced selection before activation | browser | `test: tooling/e2e/floating-toolbar.test.ts#floating Bold applies the mark without losing the selection` | pass: exact Chrome and adjacent test establish setup |
| plate-5085-turn-into-control | focus | setup | yes | The expanded editor selection owns focus before activation | Body or another control owns focus before the click | browser | `test: tooling/e2e/floating-toolbar.test.ts#floating Bold applies the mark without losing the selection` | pass: adjacent mark test and exact Chrome establish setup focus |
| plate-5085-turn-into-control | focus | after-action | yes | Editor selection ownership survives while the menu opens | Browser body takes focus and command context is lost | exact-chrome | `test: tooling/e2e/floating-toolbar.test.ts#floating Turn Into opens without losing the selection` | red: body is focused after click |
| plate-5085-turn-into-control | popup | after-action | yes | Turn Into menu/listbox is visible | No menu or listbox exists | exact-chrome | `test: tooling/e2e/floating-toolbar.test.ts#floating Turn Into opens without losing the selection` | red: no menu opens |
| plate-5085-turn-into-control | geometry-paint | after-action | yes | Visible Turn Into menu replaces or accompanies the dismissed toolbar | Toolbar disappears with no replacement UI | exact-chrome | `test: tooling/e2e/floating-toolbar.test.ts#floating Turn Into opens without losing the selection` | red: exact Chrome shows no replacement UI |
| plate-5085-turn-into-control | runtime-errors | after-action | yes | No reporter-path console/page error | Error interrupts Turn Into activation | browser | `test: tooling/e2e/floating-toolbar.test.ts#floating Turn Into opens without losing the selection` | red: exact title is absent, so no durable assertion exists |
| plate-5085-turn-into-control | follow-up-input | follow-up | yes | A menu choice transforms the intended block and leaves valid selection | Choice cannot run against the intended selection | browser | `test: tooling/e2e/floating-toolbar.test.ts#floating Turn Into opens without losing the selection` | red: menu never opens |
| plate-5088-drag-marquee-attempt-2 | model | during-action | yes | Every crossed block is structurally selected | Zero or partial structural block selection | exact-chrome | `test: tooling/e2e/block-selection.test.ts#drags from the editor gutter to select whole blocks` | pass: exact Chrome reports two selected blocks during hold |
| plate-5088-drag-marquee-attempt-2 | dom-native | during-action | yes | Native text selection is empty | Character-level DOM selection coexists with block selection | exact-chrome | `test: tooling/e2e/block-selection.test.ts#drags from the editor gutter to select whole blocks` | pass: exact Chrome range count is zero |
| plate-5088-drag-marquee-attempt-2 | focus | during-action | yes | Plite shadow input retains editor focus | Body or unrelated control owns focus | exact-chrome | `test: tooling/e2e/block-selection.test.ts#drags from the editor gutter to select whole blocks` | pass: shadow input is focused |
| plate-5088-drag-marquee-attempt-2 | popup | during-action | yes | Floating text toolbar remains absent | Floating text toolbar appears during block selection | exact-chrome | `test: tooling/e2e/block-selection.test.ts#drags from the editor gutter to select whole blocks` | pass: exact Chrome finds no floating toolbar |
| plate-5088-drag-marquee-attempt-2 | geometry-paint | during-action | yes | Marquee has live geometry and a nontransparent visible fill/border throughout hold | Portal exists with transparent background and zero border | exact-chrome | `test: tooling/e2e/block-selection.test.ts#drags from the editor gutter to select whole blocks` | red: portal is 100x78 but fully transparent |
| plate-5088-drag-marquee-attempt-2 | runtime-errors | after-release | yes | No reporter-path console/page error | Error interrupts selection or release | browser | `test: tooling/e2e/block-selection.test.ts#drags from the editor gutter to select whole blocks` | red: current Playwright replay loses selection after release and needs phase repair |
| plate-5088-drag-marquee-attempt-2 | follow-up-input | follow-up | yes | Released structural selection remains operable by a block command | Selection vanishes or falls back before follow-up action | browser | `test: tooling/e2e/block-selection.test.ts#drags from the editor gutter to select whole blocks` | red: stable follow-up command assertion is missing |

Proof receipts:
| Case ID | Attempt | Claim | Command | Result | Ref | Input digest | Input count | Inputs | Host | Latest input mtime | Proof started | Proof ended | Retries | Receipt ID |
|---------|---------|-------|---------|--------|-----|--------------|-------------|--------|------|--------------------|---------------|-------------|---------|------------|
| pending | pending | pending | pending | pending | pending | pending | pending | pending | pending | pending | pending | pending | pending | pending |

Affected corpus replay:
| Owner | Affected cases | Pre-edit baseline | Last owner edit | Combined command | Receipt input digest | Result |
|-------|----------------|-------------------|-----------------|------------------|----------------------|--------|
| pending | pending | pending | pending | pending | pending | pending |

Gate failure closure:
| Gate | Failure signal | Classification | Resolution | Final rerun |
|------|----------------|----------------|------------|-------------|
| pending | pending | pending | pending | pending |

Failed fix history:
| Case ID | Attempt | Failure signal | Failure kind | Prior claim invalidated | Regression repair | Workflow test | Architecture trigger | Best API / layer plan | Resume state |
|---------|---------|----------------|--------------|-------------------------|-------------------|---------------|----------------------|-----------------------|--------------|
| plate-5070-held-drag-caret-attempt-2 | 1 | Felix comment 5314465244 reports an inline indicator after the crash fix | reporter-contradiction | yes: prior completion and green proof revoked | repair-now: `.agents/rules/regression.mdc`, methodology, template, and validator require cumulative phase evidence | pass: 46/46 focused Regression tests after the final validator repair | yes: ui-repairs-substrate and wrong transient-state oracle | best-api: existing drag handled result owns built-ins; plite-plan: `docs/plans/5070-suppress-claimed-drop-cursor.md` ready | reproduced: exact Chrome shows `data-plite-drop-cursor` during hold |
| plate-5070-held-drag-caret-attempt-2 | 2 | Felix comment 5385433072 confirms the indicator with screenshot | reporter-contradiction | yes: attempt-1 claim and proof revoked | repair-now: `.agents/rules/regression.mdc`, methodology, template, and validator require base plus latest delta and interaction phase | pass: 46/46 focused Regression tests after the final validator repair | yes: second-failed-fix | best-api: no new API; plite-plan: `docs/plans/5070-suppress-claimed-drop-cursor.md` ready | reproduced: node owner and paint phase identified in exact Chrome |
| plate-5085-comment-control | 1 | Felix comment 5385360833 contradicts issue completion: Comment opens nothing | reporter-contradiction | yes: issue-level completion and mark-only proof revoked for this control family | repair-now: `.agents/rules/regression.mdc`, methodology, template, and validator forbid generalizing sibling-control proof | pass: 46/46 focused Regression tests after the final validator repair | yes: cross-layer-compensation through per-caller focus patches | best-api: shared ToolbarButton owns editor focus; plate-plan: `docs/plans/5085-5088-toolbar-marquee-ownership.md` ready | reproduced: exact Chrome focuses body and opens no composer |
| plate-5085-turn-into-control | 1 | Felix comment 5385360833 contradicts issue completion: Turn Into opens nothing | reporter-contradiction | yes: issue-level completion and mark-only proof revoked for this control family | repair-now: `.agents/rules/regression.mdc`, methodology, template, and validator forbid generalizing sibling-control proof | pass: 46/46 focused Regression tests after the final validator repair | yes: cross-layer-compensation through per-caller focus patches | best-api: shared ToolbarButton owns editor focus; plate-plan: `docs/plans/5085-5088-toolbar-marquee-ownership.md` ready | reproduced: exact Chrome focuses body and opens no menu |
| plate-5088-drag-marquee-attempt-2 | 1 | Felix comment 5314466483 reports native selection and text toolbar during structural drag | reporter-contradiction | yes: prior completion and green geometry-only proof revoked | repair-now: `.agents/rules/regression.mdc`, methodology, template, and validator require cumulative phase evidence | pass: 46/46 focused Regression tests after the final validator repair | yes: ui-repairs-substrate and incomplete held-state oracle | best-api: app owns portal presentation; plate-plan: `docs/plans/5085-5088-toolbar-marquee-ownership.md` ready | reproduced: current exact Chrome isolates the remaining paint failure |
| plate-5088-drag-marquee-attempt-2 | 2 | Felix comment 5385439336 shows blocks selected but no marquee | reporter-contradiction | yes: attempt-1 claim and `toBeVisible` proof revoked | repair-now: `.agents/rules/regression.mdc`, methodology, template, and validator require paint, not geometry, during the held phase | pass: 46/46 focused Regression tests after the final validator repair | yes: second-failed-fix | best-api: hard-cut one truthful portal class owner; plate-plan: `docs/plans/5085-5088-toolbar-marquee-ownership.md` ready | reproduced: exact Chrome reads transparent background and zero border |

Architecture pressure:
| Case ID | Failed fix count | Triggers | Verdict | Best API | Layer plan | Proof |
|---------|------------------|----------|---------|----------|------------|-------|
| plate-5070-held-drag-caret-attempt-2 | 2 | second-failed-fix, ui-repairs-substrate | escalate | required: best-api keeps the existing handled-result contract and rejects CSS masks | plite-plan: `docs/plans/5070-suppress-claimed-drop-cursor.md` | accepted: plan resolves one drag owner, adoption, negative controls, and exact Chrome proof; awaiting user execution acceptance |
| plate-5085-comment-control | 1 | cross-layer-compensation, ui-repairs-substrate | escalate | required: best-api makes registry ToolbarButton preserve editor focus by default | plate-plan: `docs/plans/5085-5088-toolbar-marquee-ownership.md` | accepted: plan audits all consumers and rejects two caller patches; awaiting user execution acceptance |
| plate-5085-turn-into-control | 1 | cross-layer-compensation, ui-repairs-substrate | escalate | required: best-api makes registry ToolbarButton preserve editor focus by default | plate-plan: `docs/plans/5085-5088-toolbar-marquee-ownership.md` | accepted: plan audits all consumers and rejects two caller patches; awaiting user execution acceptance |
| plate-5088-drag-marquee-attempt-2 | 2 | second-failed-fix, ui-repairs-substrate | escalate | required: best-api hard-cuts unused `rightSelectionAreaClassName` to the truthful portal class owner | plate-plan: `docs/plans/5085-5088-toolbar-marquee-ownership.md` | accepted: plan keeps lifecycle in Selection and app paint in BlockSelectionKit; awaiting user execution acceptance |

Proof-host readiness:
| Case ID | Source owner | Runner / route / host | Freshness evidence | Generated/export boundary | Result |
|---------|--------------|-----------------------|--------------------|---------------------------|--------|
| plate-5070-held-drag-caret-attempt-2 | Plite React drag runtime plus Plate DnD claim | `/` on `PORT=3124 pnpm --filter www dev:plite`; focused Playwright; exact Chrome | Fresh source host started from current checkout; exact Chrome DOM inspected during a held native drag | Direct source app; no package build or registry output | pass: owner-revealing reproduction is current; restart after implementation for final proof |
| plate-5085-comment-control | copied registry ToolbarButton and Comment control | Playground on the same fresh source host; focused Playwright; exact Chrome | Fresh route selected exact fixture text and reproduced one click | Copied registry source is the runtime owner | pass: owner-revealing reproduction is current; restart after implementation for final proof |
| plate-5085-turn-into-control | copied registry ToolbarButton and Turn Into control | Playground on the same fresh source host; focused Playwright; exact Chrome | Fresh route selected exact fixture text and reproduced one click | Copied registry source is the runtime owner | pass: owner-revealing reproduction is current; restart after implementation for final proof |
| plate-5088-drag-marquee-attempt-2 | Selection portal contract plus copied BlockSelectionKit paint | Playground on the same fresh source host; focused Playwright; exact Chrome | Exact Chrome inspected live geometry, style, selection, focus, and popup state during hold | Selection package owns portal hook; registry owns literal classes | pass: owner-revealing reproduction is current; restart after implementation for final proof |

Patch delegation:
| Case ID | Red test | Allowed owner/files | Required proof/stability | Patch return evidence | Result |
|---------|----------|---------------------|--------------------------|-----------------------|--------|
| plate-5070-held-drag-caret-attempt-2 | Strengthen homepage DnD test with held Plite cursor absence | Plite React drag runtime, DnD handler, focused tests, homepage DnD test | handled/unhandled negative controls; exact Chrome cumulative replay 5/5 | root cause, red/green commands, product/test fingerprints, receipt | blocked: exact Plite plan awaits user acceptance |
| plate-5085-comment-control | Add exact Comment draft-mark/focus/reply-editor case | registry toolbar primitives, consumer audit, focused test | Comment, Turn Into, mark/dropdown/split controls; exact Chrome 5/5 | shared-owner proof and full control-family replay | blocked: exact Plate plan awaits user acceptance |
| plate-5085-turn-into-control | Add exact Turn Into selection/focus/menu case | registry ToolbarButton, consumer audit, focused test | Turn Into, Comment, mark/dropdown controls; exact Chrome 5/5 | shared-owner proof and full control-family replay | blocked: exact Plate plan awaits user acceptance |
| plate-5088-drag-marquee-attempt-2 | Strengthen held drag with nontransparent style and pixel controls | Selection class owner, BlockSelectionKit, unreachable registry styles, focused tests | positive/negative pixel controls; exact Chrome cumulative replay 5/5 | hard-cut adoption audit, changeset, product/test fingerprints, receipt | blocked: exact Plate plan awaits user acceptance |

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
| plate-5070-held-drag-caret-attempt-2 | Old proof inspected final DOM selection instead of the transient visible node and dropped later reporter evidence | repair-now | `.agents/rules/regression.mdc`, methodology/template, and validator require cumulative evidence plus phase-qualified oracles | pass: 46/46 Regression workflow tests reject dropped deltas and skipped exact-Chrome paint | failed-fix interrupt completed; product attempt frozen at accepted-plan gate |
| plate-5085-comment-control | Mark-only sibling proof was generalized to a control with a different primitive path | repair-now | `.agents/rules/regression.mdc`, methodology/template, and validator require atomic reporter cases and cumulative evidence | pass: 46/46 Regression workflow tests | failed-fix interrupt completed; product attempt frozen at accepted-plan gate |
| plate-5085-turn-into-control | Mark-only sibling proof was generalized to a control with a different primitive path | repair-now | `.agents/rules/regression.mdc`, methodology/template, and validator require atomic reporter cases and cumulative evidence | pass: 46/46 Regression workflow tests | failed-fix interrupt completed; product attempt frozen at accepted-plan gate |
| plate-5088-drag-marquee-attempt-2 | `toBeVisible()` proved portal geometry, not paint, and after-release state missed the held phase | repair-now | `.agents/rules/regression.mdc`, methodology/template, and validator require phase-specific geometry/paint with exact Chrome | pass: 46/46 Regression workflow tests including oracle-only exact-Chrome enforcement | failed-fix interrupt completed; product attempt frozen at accepted-plan gate |

Workflow slowdowns:
| Step / command | Owner | Elapsed / expected | Cause | Evidence value | Repair/result |
|----------------|-------|--------------------|-------|----------------|---------------|
| pending | pending | pending | pending | pending | pending |

Findings:
- #5070's blue line is a Plite-owned `data-plite-drop-cursor` span. Native DOM
  selection is empty, so the previous caret assertion queried the wrong owner.
- Plite's drag-over runtime computes a handled result but discards it before
  `Editable` paints its built-in cursor; Plate DnD claims `drop` conditionally
  but does not claim `dragOver`.
- #5085's Comment and Turn Into use generic ToolbarButton, which permits native
  mouse focus transfer. MarkToolbarButton independently prevents `mousedown`,
  so its green result never covered the two failing controls.
- #5088's portal exists in `document.body` with valid 100x78 geometry and two
  selected blocks, but its background is transparent and border width is zero.
  EditorContainer descendant classes cannot style that portal.
- Regression's first phase-qualified validator version still queried the old
  unqualified geometry key. A forward test exposed and repaired that defect.

Timeline:
- 2026-08-24: read live bodies and all Felix replies; preserved five confirmed
  issues and selected four residual atomic cases from #5070/#5085/#5088.
- 2026-08-24: exact Chrome reproduced all four residuals and traced their
  literal DOM/focus/paint owners.
- 2026-08-24: repaired cumulative and phase-specific Regression methodology;
  regenerated Codex/Claude mirrors and passed 46 focused tests.
- 2026-08-24: Best API chose existing handled-event ownership, shared toolbar
  focus semantics, and a hard-cut portal class owner.
- 2026-08-24: Plite and Plate execution plans passed `check-complete`; product
  edits paused for explicit acceptance.

Decisions and tradeoffs:
- Do not suppress #5070 with CSS, caret color, body state, or caller DOM
  deletion. Preserve the existing handler result and make the built-in cursor
  obey it.
- Do not patch Comment and Turn Into separately. The editor toolbar primitive
  owns mouse-focus preservation; a true native-focus control must use another
  primitive.
- Do not move marquee brand styles into Selection or move the portal into the
  editor tree. Selection exposes one truthful class hook; BlockSelectionKit
  supplies literal app classes.
- Hard-cut unused `rightSelectionAreaClassName`; no alias is justified before
  stability.

Review fixes:
- pending

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| DOM selection used as #5070 caret oracle | 2 claimed fixes | Inspect every visible held-phase DOM node | Exact Chrome identified Plite's cursor span. |
| `toBeVisible()` used as #5088 paint oracle | 1 claimed completion | Read computed style and run pixel controls during hold | Exact Chrome proved geometry without paint. |
| Bold result generalized to #5085 non-mark controls | 1 claimed completion | Replay each distinct control family | Comment and Turn Into are separate red cases. |
| Phase-qualified validator retained old geometry lookup | 1 | Add an oracle-only exact-Chrome rejection test | Source repaired; focused test passes. |

Verification evidence:
- Exact Chrome reproduced all four residuals on source ref
  `2b206974844c62c487337da12733293db10f674b`.
- `node --test .agents/rules/regression/scripts/validate-regression-plan.test.mjs`
  passed 20/20 after the final validator repair.
- Full source plus generated Regression workflow suite and mirror parity are
  green after the final `pnpm install`: 46/46 tests, exact required resources,
  and identical source/Codex/Claude validator SHA-256
  `1d7d32e1a9eb8090f97eeb957cb02f7424656ef1189851ffbe978043dbc26718`.
- Pre-implementation semantic validation fails only because the two planned
  Comment/Turn Into exact test titles do not exist. Creating those red tests is
  execution work and remains blocked by the accepted-plan gate.
- Both exact architecture plans return `[autogoal] complete`.

Final handoff:
- executable cases: pending
- reporter oracles and forbidden states: pending
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
| Where am I? | requirement extraction |
| Where am I going? | source/host readiness, executable cases, patch, verification, closeout |
| What is the goal? | close selected regressions through executable tests and fresh proof |
| What have I learned? | Old green checks observed adjacent or final states, not the transient owners Felix reported. |
| What have I done? | Reproduced every residual, repaired Regression, selected durable owners, and prepared two exact execution plans. |

Open risks:
- Product behavior is still red. No test, comment, label, or wording may claim
  these residuals are fixed before accepted execution and final 5/5 proof.
- The shared ToolbarButton consumer audit may find a true native-focus control;
  it must use a different primitive rather than weaken the default invariant.
