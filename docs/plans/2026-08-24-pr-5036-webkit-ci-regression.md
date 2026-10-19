# PR 5036 WebKit CI regression

Objective:
Close the three exact WebKit failures exposed by PR 5036 CI without weakening
cross-browser editor law, then prove Root, full Plite CI, Vercel, and deployed
routes green on one pushed SHA.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-24-pr-5036-webkit-ci-regression.md

Template:
docs/plans/templates/regression.md

Primary template:
docs/plans/templates/regression.md

Applied packs:
- none

Regression source:
- target bug / surface / corpus: the three WebKit failures from Plite CI run
  `32743163175`: selected-text replacement undo, DOM-mutation import undo, and
  held block-drag focus/caret behavior
- lane and current source owner: Plite React input/history and DnD runtime;
  exact owner will be classified from each executable red before editing
- selected executable test cases: `webkit:drag-undo`,
  `webkit:dom-mutation-import`, `webkit:block-drag-focus`
- tested ref or dirty-state boundary: `commit:12f693f5a80e4f45672f621cca0d813f5b3ec22f`
  plus isolated `/Users/zbeyens/git/plate-ci` workflow/docs changes
- route / proof host and freshness method: managed `apps/plite` Playwright
  WebKit runner with `PLITE_BROWSER_FORCE_PROOF=1`; runner rebuilds stale app
  inputs and each exact case is run serially with retries disabled
- invocation mode / timebox: one-shot execution through exact local proof,
  push, exact-SHA GitHub/Vercel monitoring, and deployed Browser replay

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
- selected executable package/DOM/Playwright/Browser/Chrome/device commands
- exact final-case replay and retry-free stability when required
- source/host freshness proof and exact final ref
- generated proof receipts and affected-corpus replay
- `node .agents/skills/regression/scripts/validate-regression-plan.mjs docs/plans/2026-08-24-pr-5036-webkit-ci-regression.md --complete`
- P1 autoreview for non-trivial implementation packets
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-24-pr-5036-webkit-ci-regression.md`

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
- allowed source owners: smallest proven Plite React input/history or DnD
  runtime owner; no broad API redesign without an architecture trigger
- allowed proof/test owners: the three existing Playwright files, their shared
  Plite browser fixtures, and CI workflow contract tests
- generated/source boundary: never run or edit registry/template generated
  output; Fumadocs `build:source` may refresh its owned type source only
- browser/device claim width: exact managed WebKit plus regression Chrome proof
  where the accepted DnD geometry/focus law is cross-browser
- forbidden product/API/release/public mutations: no merge, no registry build,
  no templates, no public issue/PR prose beyond CI-owned push status
- orchestration mode and writer ownership: one writer in isolated
  `/Users/zbeyens/git/plate-ci`; no other task messages or shared-checkout edits

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
- current phase: pre-implementation semantic validation
- current executable case: `webkit:drag-undo`
- current case status: exact CI red recorded; local reproduction next
- next owner: Regression
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
| Prompt requirements captured | yes | Separate `../plate-ci`; fix all CI/scripts; push until green; no merge; no cross-task messages; final timing and deployed Browser proof. |
| Regression methodology loaded | yes | `.agents/skills/regression/references/methodology.md` read completely before behavior edits. |
| Active goal checked or created | yes | Existing PR 5036 durable goal remains active; this plan owns only the WebKit corpus. |
| Current source owner and tested ref recorded | yes | Exact pushed base `12f693f5a80e4f45672f621cca0d813f5b3ec22f`; owner classification follows each red. |
| Executable test cases discovered | yes | Three exact existing Playwright cases from failed WebKit shards 2, 3, and 4. |
| Cumulative reporter evidence resolved | yes | CI logs plus accepted #5070 focus law are inventoried; no later contradiction supersedes them. |
| Reporter oracle matrix resolved | yes | All seven observation classes have applicable assertions or explicit N/A reasons below. |
| Regression semantic validator ready | yes | Validator command recorded and will run before product edits. |
| Route/proof-host readiness plan recorded | yes | Managed WebKit runner, forced freshness, serial execution, zero retries. |
| Patch delegation boundary recorded | yes | One normalized case at a time; smallest proven owner only. |
| Orchestrator writer ownership recorded | yes | N/A: no orchestrator; this isolated checkout is the sole writer and browser host work is serialized. |
| Output budget strategy recorded | yes | Exact tests/owners first; logs capped; no broad generated/build output inspection. |
| Claim width and blocked rules recorded | yes | Local WebKit proof is not integrated proof; completion waits for exact pushed-SHA Root, Plite, Vercel, and deployed routes. |

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
- [ ] The smallest falsifying executable probe ran before scaling.
- [ ] Exact reproduction and durable owner classification are recorded; proxy
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
| Regression semantic plan | yes | Run `node .agents/skills/regression/scripts/validate-regression-plan.mjs docs/plans/2026-08-24-pr-5036-webkit-ci-regression.md --complete` | pending |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-24-pr-5036-webkit-ci-regression.md` | pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Requirement extraction and goal setup | in_progress | template created | source/host readiness |
| Current source and proof-host readiness | pending | | discover executable cases |
| Executable case discovery and selection | pending | | smallest probe |
| Cumulative reporter evidence inventory | pending | | reporter oracle expansion |
| Reporter oracle expansion | pending | | semantic validation |
| Pre-implementation semantic validation | pending | | smallest probe |
| Smallest high-value probe | pending | | reproduce/classify |
| Reproduce, classify, and red test | pending | | patch delegation |
| One-case Patch delegation | pending | | verification |
| Focused verification and stability | pending | | packet decision |
| Keep/revert/quarantine | pending | | methodology delta |
| Methodology repair/no-change/defer | pending | | next case or closure |
| Reviews and final handoff | pending | | goal-plan check |
| Final goal-plan check | pending | | final response |

Selected executable cases:
| Case ID | Source reference | Setup / action | Expected outcome | Exact environment | Test file / command | Status | Tested ref | Next owner |
|---------|------------------|----------------|------------------|-------------------|---------------------|--------|------------|------------|
| webkit:drag-undo | Plite CI `32743163175`, job `97482666993` | Drag-select `using`, type `writing`, undo | Original text and selected range restore | WebKit: managed Playwright WebKit in `apps/plite` | `PLITE_BROWSER_FORCE_PROOF=1 pnpm --filter plite test:plite-browser:project -- webkit tests/plite-browser/donor/examples/code-highlighting.test.ts --grep="mouse drag undo restores typed selected paragraph text replacement"` | completed | dirty:12f693f5a80e4f45672f621cca0d813f5b3ec22f | Integration: exact final-SHA Plite CI |
| webkit:dom-mutation-import | Plite CI `32743163175`, job `97482667099` | Import a DOM text mutation, type `!`, undo | Undo restores the original model text, native selection stays coherent, and follow-up input is one history batch | WebKit: managed Playwright WebKit in `apps/plite` | `STRESS_ROUTES=richtext STRESS_FAMILIES=dom-mutation-import PLITE_BROWSER_FORCE_PROOF=1 pnpm --filter plite test:plite-browser:project -- webkit tests/plite-browser/donor/stress/generated-editing.test.ts --grep="richtext dom-mutation-import"` | completed | dirty:12f693f5a80e4f45672f621cca0d813f5b3ec22f | Integration: exact final-SHA Plite CI |
| webkit:block-drag-focus | Plite CI `32743163175`, job `97482667032`; accepted #5070 plan | Hold same-editor block drag over another block | No text caret/drop cursor paints and the source editor is unfocused | exact-chrome: Google Chrome 151.0.7922.173 full fixture 15/15 plus managed Playwright WebKit 6/6 | `PLITE_BROWSER_FORCE_PROOF=1 pnpm --filter plite test:plite-browser:project -- webkit tests/plite-browser/donor/examples/plate-dnd-cross-editor.test.ts --grep="does not paint a text cursor while a same-editor block drag is held"` | completed | dirty:12f693f5a80e4f45672f621cca0d813f5b3ec22f | Integration: exact final-SHA Plite CI |

Reporter evidence inventory:
| Case ID | Source role | Source reference | Phase | Claim | Disposition | Oracle anchors | Executable anchor | Result |
|---------|-------------|------------------|-------|-------|-------------|----------------|-------------------|--------|
| webkit:drag-undo | base-acceptance | CI job `97482666993` | after-action | Undo of a typed native-drag selection replacement restores original text and range | required | model@after-action, dom-native@after-action | test: apps/plite/tests/plite-browser/donor/examples/code-highlighting.test.ts#mouse drag undo restores typed selected paragraph text replacement | pass: unchanged history owner passed 6/6 exact local WebKit runs and combined replay |
| webkit:dom-mutation-import | base-acceptance | CI job `97482667099` | follow-up | DOM import plus typed follow-up is one undoable interaction that returns to original text | required | model@follow-up, dom-native@after-action, focus@after-action, follow-up-input@follow-up | test: apps/plite/tests/plite-browser/donor/stress/generated-editing.test.ts#dom-mutation-import | pass: unchanged history owner passed 6/6 exact local WebKit runs and combined replay |
| webkit:block-drag-focus | base-acceptance | CI job `97482667032` | during-action | Held same-editor block drag suppresses text focus, native caret, and drop cursor without runtime error | required | dom-native@during-action, focus@during-action, geometry-paint@during-action, runtime-errors@during-action | test: apps/plite/tests/plite-browser/donor/examples/plate-dnd-cross-editor.test.ts#does not paint a text cursor while a same-editor block drag is held | pass: focused blur owner is green 6/6 WebKit and 5/5 exact Chrome held rows |

Reporter oracle matrix:
| Case ID | Observation | Phase | Applies | Positive assertion | Forbidden state | Proof layer | Executable anchor | Result |
|---------|-------------|-------|---------|--------------------|-----------------|-------------|-------------------|--------|
| webkit:drag-undo | model | after-action | yes | Model text and selection equal the original `using` range | Partial replacement text or collapsed/stale model selection | browser model | test: apps/plite/tests/plite-browser/donor/examples/code-highlighting.test.ts#mouse drag undo restores typed selected paragraph text replacement | pass: exact local WebKit 6/6 plus combined replay |
| webkit:drag-undo | dom-native | after-action | yes | Native selected text is exactly `using` after undo | Native selection is empty, partial, or outside the restored range | browser DOM/native selection | test: apps/plite/tests/plite-browser/donor/examples/code-highlighting.test.ts#mouse drag undo restores typed selected paragraph text replacement | pass: exact local WebKit 6/6 plus combined replay |
| webkit:drag-undo | focus | after-action | no | N/A: this case owns restored model/native selection, not focus ownership | N/A: no focus acceptance exists beyond executable keyboard delivery | N/A: focus is not a reporter oracle here | N/A: no dedicated focus assertion applies | N/A: excluded honestly rather than inferred |
| webkit:drag-undo | popup | after-action | no | N/A: interaction has no popup | N/A: interaction has no popup state | N/A: no popup layer exists | N/A: no popup assertion applies | N/A: excluded by interaction shape |
| webkit:drag-undo | geometry-paint | after-action | no | N/A: range values, not painted pixels, own this case | N/A: no geometry or paint acceptance exists | N/A: no geometry layer applies | N/A: no geometry assertion applies | N/A: excluded by acceptance criteria |
| webkit:drag-undo | runtime-errors | after-action | no | N/A: this exact case has no dedicated runtime recorder | N/A: runtime behavior is outside this test's acceptance | N/A: runner success is not promoted to runtime-error proof | N/A: no dedicated runtime anchor applies | N/A: excluded honestly rather than inferred |
| webkit:drag-undo | follow-up-input | follow-up | no | N/A: the case ends at restored selected text | N/A: no post-undo input acceptance exists | N/A: follow-up input is outside this case | N/A: no follow-up assertion applies | N/A: excluded by test contract |
| webkit:dom-mutation-import | model | follow-up | yes | Undo returns model text to `This is editable ` | Imported or typed text remains in the model | browser model | test: apps/plite/tests/plite-browser/donor/stress/generated-editing.test.ts#dom-mutation-import | pass: exact local WebKit 6/6 plus combined replay |
| webkit:dom-mutation-import | dom-native | after-action | yes | Native selection points at the imported text and expected offset | Native endpoints point at stale text or offset | browser DOM/native selection | test: apps/plite/tests/plite-browser/donor/stress/generated-editing.test.ts#dom-mutation-import | pass: exact local WebKit 6/6 plus combined replay |
| webkit:dom-mutation-import | focus | after-action | yes | Editor owns focus after DOM import | Body or another control owns focus | browser focus | test: apps/plite/tests/plite-browser/donor/stress/generated-editing.test.ts#dom-mutation-import | pass: exact local WebKit 6/6 plus combined replay |
| webkit:dom-mutation-import | popup | follow-up | no | N/A: interaction has no popup | N/A: interaction has no popup state | N/A: no popup layer exists | N/A: no popup assertion applies | N/A: excluded by scenario |
| webkit:dom-mutation-import | geometry-paint | follow-up | no | N/A: scenario owns model and selection values only | N/A: no pixel or geometry acceptance exists | N/A: no geometry layer applies | N/A: no geometry assertion applies | N/A: excluded by scenario |
| webkit:dom-mutation-import | runtime-errors | follow-up | no | N/A: stress scenario runner has no dedicated runtime-error oracle | N/A: runtime errors are outside this scenario contract | N/A: runner completion is not promoted to runtime proof | N/A: no dedicated executable anchor exists | N/A: explicitly excluded, not inferred from pass/fail |
| webkit:dom-mutation-import | follow-up-input | follow-up | yes | Typed `!` commits once and undo removes the complete imported interaction | Duplicate input or imported text survives undo | browser model and command trace | test: apps/plite/tests/plite-browser/donor/stress/generated-editing.test.ts#dom-mutation-import | pass: exact local WebKit 6/6 plus combined replay |
| webkit:block-drag-focus | model | during-action | no | N/A: held-focus case performs no model command | N/A: document mutation is covered by the move/copy sibling cases | N/A: model is outside this held-state oracle | N/A: no held-state model assertion applies | N/A: existing sibling cases own model outcomes |
| webkit:block-drag-focus | dom-native | during-action | yes | No collapsed native selection exists inside source | Native caret collapses inside source during block drag | browser DOM/native selection | test: apps/plite/tests/plite-browser/donor/examples/plate-dnd-cross-editor.test.ts#does not paint a text cursor while a same-editor block drag is held | pass: WebKit 6/6 and exact Chrome held row 5/5 |
| webkit:block-drag-focus | focus | during-action | yes | Source editor is unfocused while drag is held | Source editor retains contenteditable focus | browser focus | test: apps/plite/tests/plite-browser/donor/examples/plate-dnd-cross-editor.test.ts#does not paint a text cursor while a same-editor block drag is held | pass: red before owner fix; WebKit 6/6 and exact Chrome 5/5 after |
| webkit:block-drag-focus | popup | during-action | no | N/A: block drag has no popup | N/A: block drag has no popup state | N/A: no popup layer exists | N/A: no popup assertion applies | N/A: excluded by interaction shape |
| webkit:block-drag-focus | geometry-paint | during-action | yes | Visible text-drop cursor count remains zero during held drag | Any visible text cursor/drop cursor paints in source | exact-chrome and browser geometry | test: apps/plite/tests/plite-browser/donor/examples/plate-dnd-cross-editor.test.ts#does not paint a text cursor while a same-editor block drag is held | pass: WebKit 6/6 and exact Chrome held row 5/5 |
| webkit:block-drag-focus | runtime-errors | during-action | yes | Runtime error recorder remains empty | Any page, console, or unhandled runtime error | browser runtime recorder | test: apps/plite/tests/plite-browser/donor/examples/plate-dnd-cross-editor.test.ts#does not paint a text cursor while a same-editor block drag is held | pass: WebKit 6/6 and exact Chrome full fixture 15/15 |
| webkit:block-drag-focus | follow-up-input | after-release | no | N/A: held-state case ends when the mouse is released | N/A: move-and-edit sibling owns post-drop input | N/A: follow-up belongs to a separate executable case | N/A: no follow-up assertion applies here | N/A: sibling case passed in exact Chrome 5/5 |

Proof receipts:
| Case ID | Attempt | Claim | Command | Result | Ref | Input digest | Input count | Inputs | Host | Latest input mtime | Proof started | Proof ended | Retries | Receipt ID |
|---------|---------|-------|---------|--------|-----|--------------|-------------|--------|------|--------------------|---------------|-------------|---------|------------|
| webkit:drag-undo | 1 | completed | "fnm" "exec" "--using=22" "pnpm" "--filter" "plite" "test:plite-browser:project" "--" "webkit" "tests/plite-browser/donor/examples/code-highlighting.test.ts" "tests/plite-browser/donor/stress/generated-editing.test.ts" "tests/plite-browser/donor/examples/plate-dnd-cross-editor.test.ts" "--grep=mouse drag undo restores typed selected paragraph text replacement\u007crichtext dom-mutation-import\u007cdoes not paint a text cursor while a same-editor block drag is held" | pass: exit 0 in 5583ms | dirty:12f693f5a80e4f45672f621cca0d813f5b3ec22f | sha256:a60f9a09b2a7de25583e86ead5f149381f7cba8a90f335a5b5a160dcaa9f2b22 | 8 | apps/plite/playwright.config.ts,apps/plite/scripts/run-plite-browser.mjs,apps/plite/tests/plite-browser/donor/examples/code-highlighting.test.ts,apps/plite/tests/plite-browser/donor/examples/plate-dnd-cross-editor.test.ts,apps/plite/tests/plite-browser/donor/stress/generated-editing.test.ts,apps/www/src/app/(app)/examples/plite/_examples/plate-dnd-cross-editor.tsx,packages/dnd/src/useDndNode.spec.ts,packages/dnd/src/useDndNode.ts | host:none - managed runner owns the fresh immutable WebKit host | 2026-08-24T15:33:28.566Z | 2026-08-24T15:40:43.175Z | 2026-08-24T15:40:48.758Z | 0 | sha256:a536e25976a96269e50f48b69b6a778ebaebe7101b66f8235faa44509bb308ae |
| webkit:dom-mutation-import | 1 | completed | "fnm" "exec" "--using=22" "pnpm" "--filter" "plite" "test:plite-browser:project" "--" "webkit" "tests/plite-browser/donor/examples/code-highlighting.test.ts" "tests/plite-browser/donor/stress/generated-editing.test.ts" "tests/plite-browser/donor/examples/plate-dnd-cross-editor.test.ts" "--grep=mouse drag undo restores typed selected paragraph text replacement\u007crichtext dom-mutation-import\u007cdoes not paint a text cursor while a same-editor block drag is held" | pass: exit 0 in 5583ms | dirty:12f693f5a80e4f45672f621cca0d813f5b3ec22f | sha256:a60f9a09b2a7de25583e86ead5f149381f7cba8a90f335a5b5a160dcaa9f2b22 | 8 | apps/plite/playwright.config.ts,apps/plite/scripts/run-plite-browser.mjs,apps/plite/tests/plite-browser/donor/examples/code-highlighting.test.ts,apps/plite/tests/plite-browser/donor/examples/plate-dnd-cross-editor.test.ts,apps/plite/tests/plite-browser/donor/stress/generated-editing.test.ts,apps/www/src/app/(app)/examples/plite/_examples/plate-dnd-cross-editor.tsx,packages/dnd/src/useDndNode.spec.ts,packages/dnd/src/useDndNode.ts | host:none - managed runner owns the fresh immutable WebKit host | 2026-08-24T15:33:28.566Z | 2026-08-24T15:40:43.175Z | 2026-08-24T15:40:48.758Z | 0 | sha256:98657a5b4b90f208c8e0e6977bff22fa8eb69e64c72753aed376c369e240a4dc |
| webkit:block-drag-focus | 1 | completed | "fnm" "exec" "--using=22" "pnpm" "--filter" "plite" "test:plite-browser:project" "--" "webkit" "tests/plite-browser/donor/examples/code-highlighting.test.ts" "tests/plite-browser/donor/stress/generated-editing.test.ts" "tests/plite-browser/donor/examples/plate-dnd-cross-editor.test.ts" "--grep=mouse drag undo restores typed selected paragraph text replacement\u007crichtext dom-mutation-import\u007cdoes not paint a text cursor while a same-editor block drag is held" | pass: exit 0 in 5583ms | dirty:12f693f5a80e4f45672f621cca0d813f5b3ec22f | sha256:a60f9a09b2a7de25583e86ead5f149381f7cba8a90f335a5b5a160dcaa9f2b22 | 8 | apps/plite/playwright.config.ts,apps/plite/scripts/run-plite-browser.mjs,apps/plite/tests/plite-browser/donor/examples/code-highlighting.test.ts,apps/plite/tests/plite-browser/donor/examples/plate-dnd-cross-editor.test.ts,apps/plite/tests/plite-browser/donor/stress/generated-editing.test.ts,apps/www/src/app/(app)/examples/plite/_examples/plate-dnd-cross-editor.tsx,packages/dnd/src/useDndNode.spec.ts,packages/dnd/src/useDndNode.ts | host:none - managed runner owns the fresh immutable WebKit host | 2026-08-24T15:33:28.566Z | 2026-08-24T15:40:43.175Z | 2026-08-24T15:40:48.758Z | 0 | sha256:9fda4d225f2ab4566a0259511d7151192b21b66f185f4d66000df3f36a4406a0 |
| webkit:block-drag-focus | 1 | completed | "/usr/bin/env" "PLAYWRIGHT_BASE_URL=http://127.0.0.1:3102" "PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" "PLAYWRIGHT_WORKERS=1" "fnm" "exec" "--using=22" "pnpm" "--filter" "plite" "exec" "playwright" "test" "tests/plite-browser/donor/examples/plate-dnd-cross-editor.test.ts" "--config" "playwright.config.ts" "--project" "chromium" "--repeat-each=5" "--workers=1" | pass: exit 0 in 12796ms | dirty:12f693f5a80e4f45672f621cca0d813f5b3ec22f | sha256:2206fc1c477186f4d0170442d26aa1dbe934655e48d9d3ae7457e18c5e333887 | 5 | apps/plite/playwright.config.ts,apps/plite/tests/plite-browser/donor/examples/plate-dnd-cross-editor.test.ts,apps/www/src/app/(app)/examples/plite/_examples/plate-dnd-cross-editor.tsx,packages/dnd/src/useDndNode.spec.ts,packages/dnd/src/useDndNode.ts | pid:55431;started:2026-08-24T15:40:53.000Z;base-url:http://127.0.0.1:3102;browser:exact-chrome:macos;browser-executable:/Applications/Google Chrome.app/Contents/MacOS/Google Chrome;browser-version:Google Chrome 151.0.7922.173 | 2026-08-24T15:33:28.566Z | 2026-08-24T15:41:05.282Z | 2026-08-24T15:41:18.078Z | 0 | sha256:e0f0703e05ad19e96541d9051c4ae35784402ed288da1ad877773d4b05572779 |

Affected corpus replay:
| Owner | Affected cases | Pre-edit baseline | Last owner edit | Combined command | Receipt input digest | Result |
|-------|----------------|-------------------|-----------------|------------------|----------------------|--------|
| pending | pending | pending | pending | pending | pending | pending |

Gate failure closure:
| Gate | Failure signal | Classification | Resolution | Final rerun |
|------|----------------|----------------|------------|-------------|
| Plite Firefox shards 1-4 | Firefox refuses root launch because `/github/home` belongs to `pwuser` | CI host configuration | Set `HOME: /root` on both Linux Playwright container jobs and add workflow contract test | red: exact final-SHA Plite CI still required |
| Plite WebKit shard 2 | Selected-text replacement undo leaves partial `wri` | behavior regression | reproduce and patch smallest input/history owner | red: exact case and full Plite CI still required |
| Plite WebKit shard 3 | DOM import survives expected undo | behavior regression or invalid history grouping oracle to classify | reproduce, inspect history law, then patch owner or prove oracle correction | red: exact case and full Plite CI still required |
| Plite WebKit shard 4 | Held block drag leaves source focused | behavior regression against accepted #5070 law | reproduce and patch smallest DnD owner | red: exact WebKit, Chrome regression, and full Plite CI required |
| Vercel `12f693f5` | Cache Components prerender blocks `/editors` and `/cn/docs/examples/plate-to-html` | shared async component owner | Put async `BlockDisplayContent` under synchronous exported Suspense owner | red: exact final-SHA Vercel and deployed routes required |

Failed fix history:
| Case ID | Attempt | Failure signal | Failure kind | Prior claim invalidated | Regression repair | Workflow test | Architecture trigger | Best API / layer plan | Resume state |
|---------|---------|----------------|--------------|-------------------------|-------------------|---------------|----------------------|-----------------------|--------------|
| none | 0 | N/A: no claimed candidate has failed | N/A: expected pre-fix reds only | N/A: no prior green claim | N/A: no failed-fix repair triggered | N/A: no workflow repair required | N/A: no architecture trigger | N/A: no escalation required | N/A: start from exact reproduction |

Architecture pressure:
| Case ID | Failed fix count | Triggers | Verdict | Best API | Layer plan | Proof |
|---------|------------------|----------|---------|----------|------------|-------|
| webkit:drag-undo | 0 | none: single browser-specific history defect | patch | N/A: existing input/history API law is sufficient | N/A: smallest owner patch first | exact CI red; local owner proof next |
| webkit:dom-mutation-import | 0 | none: single history-grouping defect | patch | N/A: existing DOM import/history contract is sufficient | N/A: smallest owner patch first | exact CI red; local owner proof next |
| webkit:block-drag-focus | 0 | none: accepted #5070 browser behavior has one WebKit miss | patch | N/A: accepted DnD focus law already exists | N/A: smallest owner patch first | exact CI red plus accepted plan evidence |

Proof-host readiness:
| Case ID | Source owner | Runner / route / host | Freshness evidence | Generated/export boundary | Result |
|---------|--------------|-----------------------|--------------------|---------------------------|--------|
| webkit:drag-undo | Plite React input/history, exact owner unclassified | managed WebKit; `/examples/plite/code-highlighting` | `PLITE_BROWSER_FORCE_PROOF=1` rebuilds current app inputs | no registry generation; app consumes existing www example source | ready: exact command recorded |
| webkit:dom-mutation-import | Plite React DOM import/history, exact owner unclassified | managed WebKit; `/examples/plite/richtext` stress runner | route/family filters plus forced proof | no generated registry writes | ready: exact command recorded |
| webkit:block-drag-focus | Plite React/DnD runtime, exact owner unclassified | managed WebKit; `/examples/plite/plate-dnd-cross-editor`; exact Chrome regression after patch | forced app proof and serial browser host | no generated registry writes | ready: exact command recorded |

Patch delegation:
| Case ID | Red test | Allowed owner/files | Required proof/stability | Patch return evidence | Result |
|---------|----------|---------------------|--------------------------|-----------------------|--------|
| webkit:drag-undo | exact existing WebKit test | smallest Plite React input/history owner plus same test | exact green, package proof, five retry-free warm runs | root cause, owner, changed files, red/green commands, fingerprints | pending: reproduce first |
| webkit:dom-mutation-import | exact existing WebKit stress case | smallest DOM import/history owner plus same scenario | exact green, package proof, five retry-free warm runs | root cause, owner, changed files, red/green commands, fingerprints | pending: reproduce second |
| webkit:block-drag-focus | exact existing WebKit test | smallest DnD runtime owner plus same test | exact WebKit green, exact Chrome regression, five retry-free warm runs | root cause, owner, changed files, red/green commands, fingerprints | pending: reproduce third |

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
| pending | pending | pending | pending | pending | pending |

Workflow slowdowns:
| Step / command | Owner | Elapsed / expected | Cause | Evidence value | Repair/result |
|----------------|-------|--------------------|-------|----------------|---------------|
| pending | pending | pending | pending | pending | pending |

Findings:
- pending

Timeline:
- pending

Decisions and tradeoffs:
- pending

Review fixes:
- pending

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | N/A | N/A |

Verification evidence:
- pending

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
| Where am I? | requirement extraction |
| Where am I going? | source/host readiness, executable cases, patch, verification, closeout |
| What is the goal? | close selected regressions through executable tests and fresh proof |
| What have I learned? | pending |
| What have I done? | template created |

Open risks:
- pending
