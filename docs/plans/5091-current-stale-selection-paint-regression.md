# #5091 current stale selection paint regression

Objective:
Repair #5091 after a second reporter contradiction; done when the exact homepage
16 -> 10 case has a red/green executable oracle, exact Chrome passes 5/5, the
failed-fix method is repaired, architecture pressure is resolved, and P1 review passes.

Flow mode:
one-shot execution

Goal plan:
docs/plans/5091-current-stale-selection-paint-regression.md

Template:
docs/plans/templates/regression.md

Primary template:
docs/plans/templates/regression.md

Applied packs:
- browser

Regression source:
- target bug / surface / corpus: GitHub #5091, stale native selection paint after
  changing the exact homepage AI bullet from font size 16 to 10
- lane and current source owner: Plite DOM/React native-selection projection,
  with the Plate homepage/font-size control as the proof caller
- selected executable test cases: `issue-5091:font-size-selection-paint`
- tested ref or dirty-state boundary: start ref
  `aaf4607ccfa9bb6f85f18058c2b8fea3340b7893`; final dirty fingerprints required
- route / proof host and freshness method: fresh `apps/www` process on a unique
  port; exact homepage `/` with its current direct embedded Plite editor; fresh
  exact Chrome page
- invocation mode / timebox: one-shot execution, no timebox

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
- `node .agents/skills/regression/scripts/validate-regression-plan.mjs docs/plans/5091-current-stale-selection-paint-regression.md --complete`
- P1 autoreview for non-trivial implementation packets
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5091-current-stale-selection-paint-regression.md`

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
- allowed source owners: `.agents/rules/regression/**` for mandatory failed-fix
  repair; then only the accepted Plite DOM/React owner and necessary Plate caller
- allowed proof/test owners: regression validator tests and the existing
  `tooling/e2e/font-size-selection.test.ts` case plus focused owner tests
- generated/source boundary: change `.agents/rules/**`, then run `pnpm install`
  to regenerate `.agents/skills/**`; never hand-edit generated skills/templates
- browser/device claim width: exact macOS Chrome native/compositor paint on the
  reporter's homepage route; Playwright Chromium is diagnostic support only
- forbidden product/API/release/public mutations: no commit, push, PR, release,
  GitHub comment, label, close, generated registry edit, or template edit
- orchestration mode and writer ownership: Regression main owns plan/method;
  one Patch child may own the normalized product case after repair and architecture

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
- current phase: local behavior repair and exact proof complete; broad `www`
  typecheck blocked by unrelated current-branch docs/API errors
- current executable case: `issue-5091:font-size-selection-paint`
- current case status: completed locally on the dirty checkout; one inactive
  CursorOverlay layer remains after every font-size action
- next owner: current-branch `www` typecheck owners, then normal integration
- goal status: behavior complete; run closure blocked by the started broad gate

Completion rule:
- Do not call `update_goal(status: complete)` with unchecked Work Checklist
  items, unresolved Completion Gates, open required cases, or missing
  executable proof.
- Supporting case tables never replace tests or canonical gates.
- Run `check-complete.mjs` only after fresh evidence and risks are recorded.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured | yes | Fix current #5091 through Regression; no commit, push, PR, release, or public tracker mutation. |
| Regression methodology loaded | yes | Read `.agents/skills/regression/references/methodology.md` completely. |
| Active goal checked or created | yes | `get_goal` returned no goal. Governing plan created; no goal tool call because this task did not explicitly request a product goal. |
| Current source owner and tested ref recorded | yes | Start ref `aaf4607ccfa9bb6f85f18058c2b8fea3340b7893`; tentative Plite DOM/React owner pending source confirmation. |
| Executable test cases discovered | yes | Existing `tooling/e2e/font-size-selection.test.ts` contains #5091 and an optional exact-homepage lane. |
| Cumulative reporter evidence resolved | yes | Original #5091 acceptance, 2026-08-17 contradiction, 2026-08-22 pushed-ref claim, user 2026-08-25 contradiction, and paired wrong/correct selection screenshots retained. |
| Reporter oracle matrix resolved | yes | Phase-specific model/native/focus/popup/paint/error/follow-up rows below; correct single-layer, absent, and duplicate-layer controls are required. |
| Regression semantic validator ready | yes | Validator rejects completed pixel classifiers without `positive-control: pass`, `negative-control: pass`, and `duplicate-control: pass`; focused workflow suite passes. |
| Route/proof-host readiness plan recorded | yes | Fresh unique-port `apps/www`, `/` plus `/view/editor-ai`, fresh exact Chrome page. |
| Patch delegation boundary recorded | yes | Patch may edit only the accepted Plite DOM/React owner, exact test, focused contracts, and required changeset after method/architecture gates. |
| Orchestrator writer ownership recorded | yes | No orchestrator; main owns method/plan, one serialized Patch child owns product case. |
| Output budget strategy recorded | yes | Exact files and capped ranges only; artifacts/generated trees excluded after one noisy search. |
| Claim width and blocked rules recorded | yes | Local candidate only; exact route/Chrome absence blocks completion; no public mutation. |
| Browser pack selected | yes | Browser pack materialized. |
| Browser route / app surface identified | yes | Homepage `/`, current direct embedded Plite editor, exact reported bullet. Browser proved the old iframe locator has no current target. |
| Browser tool decision recorded | yes | Browser for route readiness/exploration; exact Chrome for compositor/native selection certification. |
| Console/network caveat policy recorded | yes | Product console/page errors block; unrelated third-party network noise is recorded, never silently ignored. |
| Observable browser case captured | yes | `issue-5091:font-size-selection-paint`; exact route, setup, action, native paint, current start ref, and final fingerprint plan recorded below. |

Work Checklist:
- [x] Skill analysis complete: Regression is the supervisor, Patch is the
      one-case worker, and executable tests are the behavior authority.
- [x] First checkpoint captures every explicit requirement before mutable work:
      fix #5091, current behavior still fails, use Regression, no public/git mutation.
- [x] Objective, threshold, verification, constraints, boundaries, output
      budget, and blocked condition are concrete.
- [x] Current source, dirty ref, runner, fresh route host, exact Chrome executable,
      export path, and freshness method are recorded in the receipt.
- [x] The selected case records every reporter delta, positive/forbidden state,
      phase-specific model/native/focus/popup/paint/error oracle, and N/A reason.
- [x] The smallest classifier probe failed the old width-only oracle before the
      product fix; the exact current route then produced a two-layer red.
- [x] Regression delegated one normalized case; Patch returned the narrow focus
      owner, unit/browser red-green proof, stability, changelog, and P1 result.
- [x] The final fresh-host proof receipt validates unchanged issue-owned inputs,
      dirty ref, Chrome 151 executable, timestamps, host PID, and zero retries.
- [x] Exact affected-corpus replay ran after the final owner edit: unit 12/12 and
      exact Chrome 5/5.
- [x] The pixel classifier passes absent, correct single-layer, and invalid
      duplicate-layer controls through the same capture path.
- [x] The two failed claims were revoked; Regression gained executable
      duplicate-control enforcement; workflow proof is 50/50 and mirrors exact.
- [x] Best API and the layer plan reject a new public API or Plite compensation;
      the registry font-size control owns its unnecessary forced refocus.
- [x] Every explored Plite/Core hypothesis was reverted; only the narrow Plate UI
      fix, focused proof, Regression repair, plan, and registry changelog remain.
- [x] No sidecar behavior database, temporary route, stub, alias, template edit,
      commit, push, PR, release, or public GitHub mutation was created.
- [x] Browser proved the current direct homepage editor; exact Chrome verified
      model, native selection, focus, popup, one-layer pixels, and runtime errors.
- [x] Agent-native review passed; P1 autoreview is clean; format, changelog,
      source/generated parity, and changed-file type scans pass.
- [ ] The started broad `pnpm turbo typecheck --filter=www` gate must pass on the
      final bytes. It currently fails in unchanged Plite docs navigation and old
      Slate API consumers outside #5091.
- [ ] Mark the whole Regression run complete only after that exact broad gate
      passes. The issue behavior itself is completed locally and remains
      uncommitted/unpushed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named completion threshold | completed | Close every selected executable case and methodology row | Exact behavior case and repair-now row are complete. |
| Current-source readiness | completed | Prove source owner and final tested ref/dirty boundary | Dirty ref and 13-file digest are in the receipt. |
| Route/proof-host readiness | completed | Prove the runner/host observes current source | Fresh localhost:3027 process and direct homepage editor attested. |
| Executable regression coverage | completed | Record exact test file, red result, green result, and owning invariant | Two-layer red, one-layer green, focused unit, and exact E2E recorded. |
| Cumulative reporter evidence closure | completed | Map every base acceptance and later reporter delta | All six reporter rows pass the final phase-specific oracle. |
| Reporter oracle closure | completed | Resolve positive and forbidden states | Model, native, focus, popup, paint, errors, and N/A follow-up resolved. |
| Failed-fix interrupt closure | completed | Revoke claims and repair Regression | Attempts 1/2 revoked; duplicate-control enforcement passes 50/50. |
| Architecture pressure closure | completed | Run Best API and layer plan | No public API; narrow registry focus-policy owner accepted. |
| Proof receipt closure | completed | Validate unchanged proof inputs | Receipt `sha256:12b7ad1dbb4f12e259da71c5418e427be34c078d0dcac3f67b2b70a1b4737d3a`. |
| Affected-corpus replay closure | completed | Replay after final owner edit | Unit 12/12 and exact Chrome 5/5. |
| Started-gate failure closure | blocked | Exact broad gate must pass | `www` typecheck still fails in unchanged Plite docs/old Slate API files. |
| Smallest-probe closure | completed | Record falsifying probe | Old classifier failed controls; repaired classifier produced exact red. |
| Patch delegation closure | completed | Read back one-case evidence | Root cause, files, proof, stability, changelog, and P1 returned. |
| Focused verification closure | completed | Run owner test and exact replay | Unit 12/12; Chrome 5/5. |
| Stability closure | completed | Record retry-free warm runs | Five independent serial exact-Chrome runs, zero retry. |
| Packet decision closure | completed | Decide every selected case | Narrow behavior fix kept; every false hypothesis reverted. |
| Local completion status | partial | Separate behavior from run closure | Behavior completed locally; run blocked by broad started gate; uncommitted/unpushed. |
| No duplicate registry | completed | Prove no sidecar database | None created. |
| Generated/source and host repair | completed | Repair drift and fresh host | `pnpm install`, exact mirror check, fresh isolated host. |
| Orchestrator writer closure | completed | Serialize shared writers | Main and one Patch worker used serialized ownership. |
| Workflow slowdown closure | completed | Repair avoidable command/proof errors | All proof-host issues classified and rerun. |
| Methodology delta closure | completed | Resolve repair-now | Duplicate-layer controls enforced in validator and tests. |
| Source/generated sync | completed | Run install and parity | `pnpm install`; required skill resources exact. |
| Agent-native review | completed | Review changed workflow | PASS. |
| Final handoff contract | completed | Record proof, sync, reviews, risks | Recorded below. |
| Autoreview | completed | Run P1 review | Clean; no actionable P0/P1. |
| Regression semantic plan | blocked | Run complete validator | Intentionally blocked by the unresolved started broad gate. |
| Goal plan complete | blocked | Run goal completion checker | Two gate-dependent checklist items remain open. |
| Browser interaction proof | completed | Exercise exact route/action | Current direct homepage inspected; exact Chrome owns paint certification. |
| Browser console/network check | completed | Record runtime errors | Exact E2E reports zero product page/runtime errors. |
| Browser final proof artifact | completed | Record native proof | Tamper-evident receipt with exact browser and 13 inputs. |
| Exact case replay | completed | Prove all end-state fields | Full, partial, and suggestion-boundary selections pass. |
| Final ref and fingerprints | completed | Record dirty ref and SHA-256 | Receipt ref and input digest recorded. |
| Clean final runtime | N/A: local dirty checkout | Clean pushed ref is an integration gate | No fixed/integrated/released/public claim is made. |
| Retry-free stability | completed | Record exact-browser 5/5 | 5/5 in Chrome 151, zero retries. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Requirement extraction and goal setup | completed | User correction, failed-fix count, boundaries, and no-public-mutation rule captured | source/host readiness |
| Current source and proof-host readiness | completed | Fresh localhost:3027; current direct editor; exact Chrome 151 attested | executable cases |
| Executable case discovery and selection | completed | Original video plus reporter screenshot pair inspected; full backward, two partial words, and mixed suggestion-boundary selection selected | reporter evidence |
| Cumulative reporter evidence inventory | completed | Original body/video, Aug 17 contradiction, Aug 22 claim, Aug 25 contradiction, and wrong/correct layer screenshots retained | oracle expansion |
| Reporter oracle expansion | completed | Model/native/focus/popup/paint/error rows plus absent, single-layer, and duplicate-layer controls recorded | semantic validation |
| Pre-implementation semantic validation | completed | `validate-regression-plan.mjs` reports structurally valid | smallest probe |
| Smallest high-value probe | completed | Current route/old iframe drift and weak pixel classifier found; both proof owners repaired | reproduce/classify |
| Reproduce, classify, and red test | completed | Current `/` fails: final paint has layers `192,224,255` and `160,192,255`; expected exactly one | Patch delegation |
| One-case Patch delegation | completed | FontSizeToolbarButton no longer forces editor focus after input, step, or popover mutations | focused verification |
| Focused verification and stability | completed | Unit 12/12; exact Chrome 151 serial 5/5 with zero retries and receipt `sha256:12b7ad1dbb4f12e259da71c5418e427be34c078d0dcac3f67b2b70a1b4737d3a` | packet decision |
| Keep/revert/quarantine | completed | Keep the narrow Plate UI focus-policy fix; all Plite/Core hypotheses reverted | methodology delta |
| Methodology repair/no-change/defer | completed | `repair-now` adds mandatory duplicate-layer control to rule, methodology, template, validator, test, and generated mirror; workflow 50/50 | Patch |
| Reviews and final handoff | completed | Agent-native PASS and P1 autoreview clean; registry changelog generated and checked | broad gate disclosure |
| Final goal-plan check | blocked | Started `www` typecheck still fails in unchanged Plite docs navigation and old Slate API files; changed selection files have no type errors | current-branch owners |

Selected executable cases:
| Case ID | Source reference | Setup / action | Expected outcome | Exact environment | Test file / command | Status | Tested ref | Next owner |
|---------|------------------|----------------|------------------|-------------------|---------------------|--------|------------|------------|
| issue-5091:font-size-selection-paint | GitHub #5091 body/video; Felix 2026-08-17; pushed claim 2026-08-22; user 2026-08-25 contradiction plus wrong/correct layer screenshots | On current `/`, cover backward full bullet, partial `summarize`/`content`, and `content seamlessly. Use ` beside a suggestion leaf; choose font size 10 from 16 and inspect paint after popover close | Font becomes 10px; model selection preserves text/direction; toolbar focus legally leaves native selection empty; CursorOverlay projects one light inactive selection layer; font-size control does not refocus editor or add the darker native layer | exact-chrome: Google Chrome 151.0.7922.174 on macOS; fresh localhost:3027 process, one worker, five independent pages | `PLAYWRIGHT_BASE_URL=<url> PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' pnpm exec playwright test --config tooling/config/playwright.config.ts --project=chromium --workers=1 --repeat-each=5 tooling/e2e/font-size-selection.test.ts` | completed | dirty:aaf4607ccfa9bb6f85f18058c2b8fea3340b7893 | current-branch typecheck owner, then integration |

Reporter evidence inventory:
| Case ID | Source role | Source reference | Phase | Claim | Disposition | Oracle anchors | Executable anchor | Result |
|---------|-------------|------------------|-------|-------|-------------|----------------|-------------------|--------|
| issue-5091:font-size-selection-paint | base-acceptance | GitHub #5091 issue body and video | after-action | Changing 16 -> 10 must repaint the expanded selection to the resized text bounds without a stale or duplicate old-width highlight | required | model@after-action, dom-native@after-action, geometry-paint@after-action, focus@after-action, popup@after-action, runtime-errors@after-action | test: tooling/e2e/font-size-selection.test.ts#font-size command refreshes expanded selection paint (#5091) | pass: exact Chrome 151 final replay preserves the resized single-layer selection |
| issue-5091:font-size-selection-paint | prior-reporter-delta | Felix GitHub comment 2026-08-17 | after-action | The first focus-based candidate still left the stale highlight | required | geometry-paint@after-action | test: tooling/e2e/font-size-selection.test.ts#font-size command refreshes expanded selection paint (#5091) | pass: final one-layer classifier rejects the old duplicate state |
| issue-5091:font-size-selection-paint | pushed-fix-claim | GitHub comment 2026-08-22 on pushed ref 088a82c84c | after-action | Pixel oracle was claimed 5/5 and `completed` was applied | required | geometry-paint@setup, geometry-paint@after-action | test: tooling/e2e/font-size-selection.test.ts#font-size command refreshes expanded selection paint (#5091) | pass: strengthened absent, single, and duplicate controls replace the invalid width-only claim |
| issue-5091:font-size-selection-paint | latest-reporter-delta | User message 2026-08-25 | after-action | The same #5091 problem still exists currently | required | geometry-paint@after-action | test: tooling/e2e/font-size-selection.test.ts#font-size command refreshes expanded selection paint (#5091) | pass: final dirty checkout returns exactly one layer in five independent runs |
| issue-5091:font-size-selection-paint | latest-reporter-delta | User wrong-selection screenshot | after-action | Incorrect state contains a second darker blue selection layer underneath the normal light-blue layer | required | geometry-paint@after-action, dom-native@after-action | test: tooling/e2e/font-size-selection.test.ts#font-size command refreshes expanded selection paint (#5091) | pass: duplicate control and pre-fix exact replay classify both light and dark layers |
| issue-5091:font-size-selection-paint | reporter-correct-oracle | User correct-selection screenshot | after-action | Correct state contains one continuous light-blue selection layer and no darker duplicate | required | geometry-paint@after-action | test: tooling/e2e/font-size-selection.test.ts#font-size command refreshes expanded selection paint (#5091) | pass: final exact replay matches the single light inactive overlay state |

Reporter oracle matrix:
| Case ID | Observation | Phase | Applies | Positive assertion | Forbidden state | Proof layer | Executable anchor | Result |
|---------|-------------|-------|---------|--------------------|-----------------|-------------|-------------------|--------|
| issue-5091:font-size-selection-paint | geometry-paint | setup | yes | Same classifier reports zero layers when absent, exactly one for the real selection, and rejects a synthetic second layer | Classifier accepts a missing selection, misses the single layer, or accepts the duplicate layer; width alone is insufficient | exact-chrome absent/single/duplicate pixel sentinels | test: tooling/e2e/font-size-selection.test.ts#font-size command refreshes expanded selection paint (#5091) | pass: positive-control: pass; negative-control: pass; duplicate-control: pass |
| issue-5091:font-size-selection-paint | model | after-action | yes | Font mark is 10px and model selection still spans the exact reporter text | Font stays 16px, selection collapses, or selection moves | package plus exact-chrome | test: tooling/e2e/font-size-selection.test.ts#font-size command refreshes expanded selection paint (#5091) | pass: 10px and exact text/direction preserved in all five runs |
| issue-5091:font-size-selection-paint | dom-native | after-action | yes | Native selection is empty while the installed CursorOverlay projects the preserved model range once | Native and overlay selection coexist, overlay is absent/duplicated, or model selection is lost | exact-chrome native state plus model/overlay assertions | test: tooling/e2e/font-size-selection.test.ts#font-size command refreshes expanded selection paint (#5091) | pass: native text empty and one overlay rect in all five runs |
| issue-5091:font-size-selection-paint | focus | after-action | yes | Font-size control retains focus outside the editor; model selection remains expanded and CursorOverlay renders it | Editor refocus creates a darker native layer, or model/overlay selection is lost | exact-chrome focus owner plus model/overlay/layer oracle | test: tooling/e2e/font-size-selection.test.ts#font-size command refreshes expanded selection paint (#5091) | pass: activeInEditor false and model range preserved in all five runs |
| issue-5091:font-size-selection-paint | popup | after-action | yes | Font-size popover closes after selecting 10 while the editor selection remains | Popover stays open or closes by discarding the selection | exact-chrome | test: tooling/e2e/font-size-selection.test.ts#font-size command refreshes expanded selection paint (#5091) | pass: popover closes and selection remains in all five runs |
| issue-5091:font-size-selection-paint | geometry-paint | after-action | yes | Painted highlight has exactly one blue fill layer and matches the 10px selection geometry | Any second darker blue layer, trailing old-width highlight, or duplicate selection overlay survives | exact-chrome layer-count pixel oracle with three sentinels | test: tooling/e2e/font-size-selection.test.ts#font-size command refreshes expanded selection paint (#5091) | pass: layerCount 1; positive-control: pass; negative-control: pass; duplicate-control: pass |
| issue-5091:font-size-selection-paint | runtime-errors | after-action | yes | No product console/page error occurs during selection or font-size action | Any product exception/error overlay appears | browser plus exact-chrome | test: tooling/e2e/font-size-selection.test.ts#font-size command refreshes expanded selection paint (#5091) | pass: zero page/runtime errors in all five runs |
| issue-5091:font-size-selection-paint | follow-up-input | follow-up | no | N/A: reporter acceptance is the preserved expanded selection paint, not a subsequent edit | N/A: no follow-up-input claim in issue or latest delta | N/A: no reporter follow-up-input requirement | N/A: no executable anchor required | N/A: paint-only reporter contract |

Proof receipts:
| Case ID | Attempt | Claim | Command | Result | Ref | Input digest | Input count | Inputs | Host | Latest input mtime | Proof started | Proof ended | Retries | Receipt ID |
|---------|---------|-------|---------|--------|-----|--------------|-------------|--------|------|--------------------|---------------|-------------|---------|------------|
| issue-5091:font-size-selection-paint | 3 | completed | "env" "PLAYWRIGHT_BASE_URL=http://localhost:3027" "PLAYWRIGHT_RETRIES=0" "PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" "pnpm" "exec" "playwright" "test" "--config" "tooling/config/playwright.config.ts" "--project=chromium" "--workers=1" "--repeat-each=5" "tooling/e2e/font-size-selection.test.ts" | pass: exit 0 in 53548ms | dirty:aaf4607ccfa9bb6f85f18058c2b8fea3340b7893 | sha256:580fbb2f4a543314c1ea856c0c17dc401cbfb5447c01fde88799e3ec1a219239 | 13 | apps/www/next.config.ts,apps/www/src/app/(app)/page.tsx,apps/www/src/app/globals.css,apps/www/src/components/ui/popover.tsx,apps/www/src/registry/blocks/editor-ai/components/editor/plate-editor.tsx,apps/www/src/registry/components/editor/cursor-overlay.tsx,apps/www/src/registry/components/editor/font-size-toolbar-button.tsx,apps/www/src/registry/components/editor/mark-toolbar-button.spec.tsx,apps/www/src/registry/components/editor/toolbar.tsx,packages/browser/dist/playwright/index.js,packages/selection/src/react/CursorOverlayPlugin.tsx,tooling/config/playwright.config.ts,tooling/e2e/font-size-selection.test.ts | pid:94311;started:2026-08-25T11:13:55.000Z;base-url:http://localhost:3027;browser:exact-chrome:151.0.7922.174;browser-executable:/Applications/Google Chrome.app/Contents/MacOS/Google Chrome;browser-version:Google Chrome 151.0.7922.174 | 2026-08-25T11:21:50.561Z | 2026-08-25T11:22:56.569Z | 2026-08-25T11:23:50.118Z | 0 | sha256:12b7ad1dbb4f12e259da71c5418e427be34c078d0dcac3f67b2b70a1b4737d3a |

Affected corpus replay:
| Owner | Affected cases | Pre-edit baseline | Last owner edit | Combined command | Receipt input digest | Result |
|-------|----------------|-------------------|-----------------|------------------|----------------------|--------|
| FontSizeToolbarButton focus policy and exact #5091 harness | `issue-5091:font-size-selection-paint` | red: pre-edit exact Chrome replay reported active editor focus and two paint layers | 2026-08-25T11:21:50.561Z | `bun test apps/www/src/registry/components/editor/mark-toolbar-button.spec.tsx` plus receipt exact Chrome command | sha256:580fbb2f4a543314c1ea856c0c17dc401cbfb5447c01fde88799e3ec1a219239 | pass: unit 12/12 and exact affected case 5/5 after final owner edit |

Gate failure closure:
| Gate | Failure signal | Classification | Resolution | Final rerun |
|------|----------------|----------------|------------|-------------|
| www fresh host | `pnpm --filter www dev -- --port 3027` treated `--port` as a directory | proof-host command | Started `PLATE_WWW_DYNAMIC_DOCS=1 pnpm --filter www exec next dev --port 3027` | pass: current direct `/` editor loaded through Browser and Playwright |
| browser package export | Missing `@platejs/browser/dist/playwright/index.js` after install | proof-host/package artifact | Built the intentional `@platejs/browser` artifact | pass: exact test imported and executed on final bytes |
| pixel negative control | Known-absent clone comparison reported 384px selection | invalid classifier | Deleted clone diff and classified the native highlight in edge bands against same screenshot background | pass: known-absent zero and known-visible 16px width pass in final 5/5 |
| keyboard reporter gesture | ArrowLeft kernel trace intermittently recorded `extend:false`; model/DOM stayed collapsed | interaction/proof-host drift before reporter paint assertion | Froze product bytes; used backward real-mouse selection with identical expanded direction, endpoints, focus, and native state | pass: final equivalent-state exact Chrome 5/5; keyboard-host issue remains outside #5091 |
| repeat teardown | Five concurrent behavior assertions passed but Playwright never exited | proof-host teardown | Invalidated batch, interrupted, restarted serially with explicit `--workers=1` | pass: final serial 5/5 exits 0 |
| `pnpm turbo typecheck --filter=www` | Static docs parity misses current Plite routes; unchanged AI routes import removed Slate APIs; one added matcher type was also caught | mixed: one issue-owned test assertion plus pre-existing current-branch failures | Replaced `toHaveValue` with native input value assertion; focused changed-file type scan is clean; broad docs/API ownership left untouched | blocked: exact broad rerun still fails outside issue-owned files, so the run cannot claim every started gate closed |

Failed fix history:
| Case ID | Attempt | Failure signal | Failure kind | Prior claim invalidated | Regression repair | Workflow test | Architecture trigger | Best API / layer plan | Resume state |
|---------|---------|----------------|--------------|-------------------------|-------------------|---------------|----------------------|-----------------------|--------------|
| issue-5091:font-size-selection-paint | 1 | Felix 2026-08-17 manual replay still showed the old-width highlight after the focus-based candidate | reporter-contradiction | yes: Aug 12 focus-based green/completed authority revoked | repair-now: `.agents/rules/regression/references/methodology.md` was repaired to require painted-pixel rather than logical Range proof | pass: existing 2026-08-19 workflow/test repair recorded in prior plan | yes: timer-focus-correctness and ui-repairs-substrate | best-api and plite-plan required now because attempt 2 also failed | reproduced: historical reporter contradiction and exact red were recorded |
| issue-5091:font-size-selection-paint | 2 | User screenshot proves the width-only 5/5 accepted two simultaneous selection layers after pushed ref 088a82c84c | reporter-contradiction | yes: receipt 9d5d7360, later width-only 5/5, pushed-fix wording, and completed authority revoked | repair-now: `.agents/rules/regression.mdc`, methodology, template, and validator require absent, correct single-layer, and invalid duplicate-layer controls | pass: 50/50 workflow tests; missing duplicate-control rejected; source/generated resources exact | yes: second-failed-fix, timer-focus-correctness, ui-repairs-substrate | best-api: no public API; one private Plite React host-commit selection lifecycle owner; plite-plan: pre-commit invalidation, one post-commit restore, delete node-bind writers | reproduced: current `/` returns layerCount 2 with the reporter colors |

Architecture pressure:
| Case ID | Failed fix count | Triggers | Verdict | Best API | Layer plan | Proof |
|---------|------------------|----------|---------|----------|------------|-------|
| issue-5091:font-size-selection-paint | 2 | second-failed-fix, cross-layer-compensation, ui-repairs-substrate | escalate | required: best-api exposes no API and rejects every Plite lifecycle/identity compensation; the font-size registry control owns whether it refocuses the editor after an input/popover action | plate-plan: remove unconditional editor refocus from all FontSizeToolbarButton mutation paths; preserve model/native selection and leave the control/outside owner focused so one inactive selection layer remains; Plite runtime stays unchanged | accepted: reporter correct screenshot is one light inactive layer; wrong screenshot is light+dark with editor focused; direct style/no focus is single-layer; all substrate/Core candidates are byte-identical red |

Proof-host readiness:
| Case ID | Source owner | Runner / route / host | Freshness evidence | Generated/export boundary | Result |
|---------|--------------|-----------------------|--------------------|---------------------------|--------|
| `issue-5091:font-size-selection-paint` | Current direct homepage Plite editor and `tooling/e2e/font-size-selection.test.ts` | Fresh `apps/www` on `http://localhost:3027/`; exact Chrome 151.0.7922.174 | Process started after `pnpm install`; Browser verified one top-level editor and no iframe; `@platejs/browser` rebuilt after install | Source test imports intentional browser package artifact; no generated registry/template edit | pass: exact current source host and browser attested |

Patch delegation:
| Case ID | Red test | Allowed owner/files | Required proof/stability | Patch return evidence | Result |
|---------|----------|---------------------|--------------------------|-----------------------|--------|
| `issue-5091:font-size-selection-paint` | red: exact Chrome current `/` reports editor focused and layers `192,224,255` + `160,192,255`; expected one light inactive layer and no forced editor focus | `apps/www/src/registry/components/editor/font-size-toolbar-button.tsx`, its focused spec, exact E2E, and registry changelog only; Plite/Core source forbidden | One-layer green, after-action focus outside editor, three classifier controls, focused unit proof, final fresh exact Chrome 5/5, affected-corpus replay, P1 review | Root cause, changed files, red/green commands, fingerprints, stability, changelog status, review, caveat | ready: delegate Plate UI focus-policy patch |

Stability:
| Case ID | Executable proof / host | Required runs | Results | Retry count | Decision |
|---------|-------------------------|---------------|---------|-------------|----------|
| `issue-5091:font-size-selection-paint` | Exact Chrome 151; full backward, partial words, and mixed suggestion boundary; three classifier controls | 5 | pass: 5/5 independent serial runs; one layer, model range preserved, native selection empty, zero runtime errors | 0 | completed locally for behavior; broad run gate remains blocked |

Packet decisions:
| Case | Executable evidence | Decision | Claim width | Residual risk | Next owner |
|------|---------------------|----------|-------------|---------------|------------|
| `issue-5091:font-size-selection-paint` | Pre-fix two-layer red; unit 12/12; final receipt exact Chrome 5/5 with all controls | keep | Completed local behavior on dirty checkout only; no integrated/released/public completion claim | Entire `www` typecheck remains red for unrelated current-branch docs/API errors | current-branch gate owners, then integration |

Methodology deltas:
| Case | Miss or owner checked | Decision | Durable owner/change | Focused proof | Trigger/result |
|------|-----------------------|----------|----------------------|---------------|----------------|
| issue-5091:font-size-selection-paint | Width-only paint proof accepted two simultaneous selection colors | repair-now | `.agents/rules/regression.mdc`, methodology, template, and validator require absent, correct single-layer, and invalid duplicate-layer controls; exact oracle counts dominant blue fill layers | pass: validator 24/24, workflow 50/50, source/generated parity exact, agent-native PASS | reporter screenshot invalidated the width-only 5/5 and produced exact layerCount 2 red |

Workflow slowdowns:
| Step / command | Owner | Elapsed / expected | Cause | Evidence value | Repair/result |
|----------------|-------|--------------------|-------|----------------|---------------|
| First www start | proof host | immediate failure | `pnpm --filter www dev -- --port` passed `--` as a project path | none | used explicit `next dev --port 3027`; fresh host ready |
| First exact test after install | package export | immediate failure | `@platejs/browser/playwright` intentionally resolves built dist | none | built `@platejs/browser`; exact command reached reporter case |
| Clone-based pixel baseline | proof oracle | two invalid runs | cloned list block rasterized differently even without selection | decisive negative control failure | replaced with same-screenshot, color-independent edge-band classifier; controls pass |
| Keyboard chord replay | browser gesture host | 3/5 then 4/5 setup | Playwright chord delivered ArrowLeft with kernel `extend:false` intermittently | no paint evidence; reporter assertion did not run | product bytes frozen; backward real-mouse state proved equivalent direction/endpoints/focus and passes 5/5 |
| Concurrent repeat closeout | Playwright worker teardown | behavior 5/5 then hung | implicit five workers did not exit cleanly | invalid stability receipt | terminated; reran explicit `--workers=1` from count zero |

Architecture decision:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
|---------|---------|--------|-------|--------|----------|-------|------|---------|
| font-size focus policy | Input commit, minus/plus, and popover size pick all call `editor.api.dom.focus()` after changing the mark | Apply the model update and close the control without forcing native editor focus; preserve the model range and let CursorOverlay remain the sole inactive selection visualization | `FontSizeToolbarButton` registry component | This control necessarily owns native input/popover focus; Plite should not compensate for an app-requested refocus | Remove focus expectations from focused spec; no package/public API change | unit action/focus contract plus exact Chrome layer/focus/model oracle | Follow-up typing requires the normal user action of returning to the editor; model selection remains intact | rearchitect |
| inactive selection visualization | CursorOverlayPlugin blur handler already captures model selection when focus enters `data-plate-focus`; refocusing the editor adds native paint before the overlay lifecycle settles | Keep CursorOverlay as the one existing owner; do not add UI-local DOM Range storage or a new overlay | Existing Plate Selection plugin and registry renderer | The correct screenshot is the existing light overlay state, not a native range | No plugin/API change | model selection, native empty, overlay one, paint one | Overlay must refresh geometry after the font-size commit | keep |
| public API | No public selection-paint API; Plate font-size UI issues a normal semantic property update | Keep no public API and no caller opt-in | Plite React private runtime | Apps must not know when Blink needs native paint invalidation | None | public-surface audit plus package typecheck | None beyond private behavior | keep |
| text component identity | Investigated as a possible remount cause | Keep current identity unchanged | Plite React | Exact layer profile did not change under the stable-key candidate | None | byte-identical refined red before the UI fix | Separate work needs its own issue | revert |
| segment identity | Investigated as a possible remount cause | Keep current segment keys unchanged | Plite React | Exact layer profile did not change under the candidate | None | byte-identical refined red before the UI fix | Separate work needs its own issue | revert |
| render revision | Investigated as a possible identity cause | Keep current revision behavior unchanged | Plite React selector layer | Exact evidence did not connect it to the duplicate layer | None | byte-identical refined red before the UI fix | Separate work needs its own issue | revert |
| pure inject-style mark wrapper | Investigated as a duplicate DOM owner | Keep the current Plate Core wrapper pipeline unchanged | Plate Core renderLeaf pipeline | Flattening the wrapper did not change the two-layer profile | None | byte-identical refined red before the UI fix | Separate cleanup requires independent proof | revert |
| selection lifecycle/writers | Preclear/restore and writer deletion/equality guards left the refined dark layer unchanged | Revert all selection-lifecycle candidates; do not bundle unrelated cleanup into #5091 | Existing owners unchanged | Exact evidence disproves them as this bug's owner | None | byte-identical red profiles | Separate cleanup only with independent issue/proof | revert |
| proof oracle | Final pushed test defaulted to `/blocks/playground`; its optional homepage branch targeted a removed iframe; its last rewrite weakened paint classification | Exact current homepage direct editor is mandatory; one color-independent classifier must pass known-absent and known-visible controls before judging the 16 -> 10 result | `tooling/e2e/font-size-selection.test.ts` plus Regression validator | The old proof could be green on a proxy route or never reach the current page | Hard-code current `/`, preserve stable NodeKey block identity across partial-leaf splits, cover full and partial selection states | exact homepage current-source proof and exact Chrome 5/5 | Screenshot thresholds can drift; controls fail closed | rearchitect |

Plite execution slices:
| Slice | Owner | Entry condition | Exit condition | Focused proof |
|-------|-------|-----------------|----------------|---------------|
| 1. reporter-complete red | exact homepage test and current host | three-control method repair and layer decision recorded | exact test reports layerCount 2 with reporter colors | exact Chrome diagnostic plus focused test command |
| 2. Plate UI focus-policy repair | `FontSizeToolbarButton` and focused unit spec | reporter screenshots plus trace prove refocus correlates exactly with the darker active layer; every substrate/identity candidate is rejected | no unconditional `editor.api.dom.focus()` after font-size mutations; model/native selection preserved; registry changelog updated | focused unit red/green, exact current route one-layer green |
| 3. browser closure | fresh exact homepage proof host | focused owner green | absent/single/duplicate controls and product case pass 5/5 exact Chrome, zero retries, no errors; receipt and P1 review close | Browser/Chrome receipt, affected corpus replay, P1 autoreview |

Findings:
- Attempt 1 fixed toolbar focus, but the reporter proved the paint remained stale.
- Attempt 2 moved repair to Plite native-selection projection and claimed exact
  Chrome 5/5 on pushed ref 088a82c84c; the current user contradiction revokes it.
- The pushed test defaulted to `/blocks/playground`; its optional homepage branch
  targeted an iframe removed by the current direct editor. It also weakened the
  paint classifier during the final 088a82c84c rewrite, so the old receipt cannot stand.

Timeline:
- 2026-08-25: user invoked Regression and contradicted pushed #5091 completion.
- 2026-08-25: prior proof, current test, live issue, and failed-fix history read;
  product edits paused for mandatory method repair and architecture escalation.

Decisions and tradeoffs:
- Treat this as failed attempt 2, not a new adjacent bug. Retain every original
  acceptance row and the latest contradiction in one exact homepage case.
- Do not try another focus, timer, forced-layout, or generic post-commit repaint
  tweak before Best API and Plite Plan choose the durable native-selection owner.

Review fixes:
- P1 `Locate the homepage editor inside its iframe`: rejected requested code
  change because Browser proves current local `/` has one direct embedded Plite
  editor and zero iframes. Accepted the underlying source/plan inconsistency;
  removed every stale iframe claim from this plan. Focused route proof remains green.
- P1 invocation 2: clean, no accepted/actionable P0 or P1 findings.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Initial plan helper omitted `--ticket` and created a date-prefixed issue plan | 1 | Delete untouched shell and regenerate with `--ticket 5091` | resolved before substantive work |
| Broad `rg` included large plan artifact manifests and produced noisy output | 1 | Restrict every read to exact plans/source files and capped ranges | resolved; output budget narrowed |

Verification evidence:
- `pnpm install` -> pass; Regression generated mirrors synchronized.
- Regression workflow proof -> 50 pass; final validator source/mirror suites -> 48 pass.
- `node .agents/rules/plate-next/scripts/sync-resources.mjs --check` -> exact.
- `pnpm exec ultracite check ...` and `git diff --check` -> pass on final files.
- Exact Chrome command with `--workers=1 --repeat-each=5` -> 5/5, zero retries,
  each run covering full backward selection plus `summarize` and `content`.
- Browser -> current local `/` has one direct Plite editor and zero iframes;
  `platejs.org` currently exposes a different Slate editor runtime.
- Agent-native review -> PASS; action route, source owner, generated mirror,
  proof command, and blocked handoff are discoverable.
- P1 autoreview invocation 2 -> clean, no accepted/actionable findings.

Final handoff:
- executable cases: one #5091 exact-browser test covers the full backward bullet,
  two partial words, and a suggestion-boundary selection
- cumulative reporter evidence, phase-specific oracles, and forbidden states:
  all pass the final one-layer classifier and model/native/focus assertions
- failed-fix invalidation and automatic repair: old width-only authority revoked;
  absent, correct-single, and invalid-duplicate controls are mandatory and proved
- proof receipts and affected-corpus replay: completed receipt
  `sha256:12b7ad1dbb4f12e259da71c5418e427be34c078d0dcac3f67b2b70a1b4737d3a`;
  unit 12/12 and exact Chrome 5/5 after the last owner edit
- started-gate failure closure: proof-host failures pass; the broad `www`
  typecheck remains red in unchanged Plite docs navigation and old Slate API files
- changed files: FontSizeToolbarButton, focused spec, #5091 E2E, registry
  changelog, Regression validator/source/mirrors/tests, and this plan
- design decisions: no public API and no Plite/Core selection workaround; the
  font-size control simply stops forcing editor focus after toolbar mutations
- tests and proof: unit 12/12; workflow 50/50; exact Chrome final 5/5; changelog,
  format, changed-file type scan, and generated-resource parity pass
- source/generated sync: exact after `pnpm install`
- P1 and agent-native findings: agent-native PASS; final P1 clean
- residual risks and next owner: current-branch owners must close the unrelated
  broad `www` check before whole-run completion/integration
- local completion status and integration/public-status boundary: #5091 behavior
  is completed on the dirty checkout; nothing is committed, pushed, integrated,
  released, commented, labeled, or closed publicly

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Local #5091 behavior complete; broad `www` typecheck blocked outside issue-owned files. |
| Where am I going? | Hand off the unrelated current-branch gate, then integrate the narrow fix normally. |
| What is the goal? | Keep exactly one inactive selection layer after font-size changes. |
| What have I learned? | CursorOverlay correctly paints the inactive range; forced editor refocus added the darker native layer. |
| What have I done? | Removed forced refocus, strengthened the oracle, passed unit 12/12 and exact Chrome 5/5, and repaired Regression controls. |

Open risks:
- The started broad `www` typecheck is not green: static docs parity misses
  current Plite routes and unchanged AI files still import removed Slate APIs.
- The local fix is dirty and unpushed. Existing public tracker state was not
  changed and must not be read as evidence that this candidate shipped.
