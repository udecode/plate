# seeded removal suggestion crash regression

Objective:
Fix Plate #5086 so accepting the seeded removal suggestion deletes the text,
closes its card, preserves an interactive Playground, and produces no runtime
error in five retry-free exact runs.

Flow mode:
one-shot execution

Goal plan:
docs/plans/5086-seeded-removal-suggestion-crash-regression.md

Template:
docs/plans/templates/regression.md

Primary template:
docs/plans/templates/regression.md

Applied packs:
- browser

Regression source:
- target bug / surface / corpus: Plate #5086 and Felix's 2026-08-17 reporter
  retest `#issuecomment-5314465937`; on the homepage Playground, click the
  seeded `mark text for removal` suggestion and accept its Delete card.
- lane and current source owner: Plate suggestion acceptance across
  `@platejs/suggestion`, the suggestion-card integration, and React DOM
  projection; exact owner must be proved before patching.
- selected executable test cases: existing
  `tooling/e2e/suggestion-accept.test.ts` exact seeded-removal case plus the
  owning suggestion-package accept contract once discovered.
- tested ref or dirty-state boundary: `HEAD == origin/next ==
  1fb72c581095f23ddba3f597f41e8b10608283ef`; preserve unrelated current-tree
  edits and record every issue-owned final fingerprint.
- route / proof host and freshness method: real homepage `/` from a newly
  started source-built `www` host; Browser for rendered interaction and
  Playwright Chromium for durable exact replay/stability.
- invocation mode / timebox: one-shot execution; no timebox

First checkpoint:
- Copy every explicit requirement, scope boundary, non-goal, timing rule, stop
  condition, deliverable, verification surface, and final handoff requirement
  into the Work Checklist before mutable work.
- Load `.agents/skills/regression/references/methodology.md`.
- Do not create a TSV, JSON, database, manifest, or manual case registry.

Completion threshold:
- Every selected observed regression has an executable test that fails on the
  violated invariant and passes after the fix.
- Current source and every proof host are ready before behavior claims.
- Every kept case has exact reproduction, one-case Patch evidence, focused
  green proof, required retry-free stability, final ref/dirty-boundary proof,
  and no accepted P1 finding.
- Every kept case and the run are marked `completed` when those local gates
  pass. Commit and push are not local completion gates.
- Every case records `repair-now`, evidence-backed `no-change`, or
  evidence-backed `defer`.
- All canonical Work Checklist and Completion Gates rows resolve and
  `check-complete.mjs` passes.
- The exact case first reproduces the `removeChild` `NotFoundError`, then passes
  five retry-free final runs: the phrase and Delete card disappear, the
  Playground remains mounted and editable, and no page/runtime error occurs.
- The owning suggestion/package contract and required typecheck stay green.
- The stale public `completed` label is removed after live-state confirmation;
  one honest local-completion comment is posted, and the issue stays open.

Verification surface:
- selected executable package/DOM/Playwright/Browser/Chrome/device commands
- exact final-case replay and retry-free stability when required
- source/host freshness proof and exact final ref
- P1 autoreview is N/A by the user's standing instruction; source inspection,
  exact browser replay, focused contracts, and type-boundary evidence replace it
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5086-seeded-removal-suggestion-crash-regression.md`
- focused existing suggestion-accept E2E red/green and five-run Chromium ledger
- Browser replay on `/` with phrase/card/remount/follow-up-edit/error fields
- owning suggestion package tests and source-first typecheck

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
- Do not run lint or Autoreview in this session.
- Felix's exact retest invalidates the earlier green proof and the stale public
  `completed` label. Do not reuse the old three-run result as current proof.
- Fix the durable package/runtime owner if the crash is systemic; do not hide
  it in homepage-only timing, keys, remounts, or error suppression.
- Always post the required proof-backed GitHub status comment when the local
  run completes; call the Regression run `completed` locally but the public
  issue only a local candidate until pushed-ref proof exists.

Boundaries:
- allowed source owners: `packages/suggestion`, shared Plate/Plite React DOM or
  operation owners proved causal, and the copied suggestion-card integration;
  homepage-only edits require proof that product policy is the real owner.
- allowed proof/test owners: `tooling/e2e/suggestion-accept.test.ts`, focused
  owning-package contracts, minimal reusable browser helper changes, and this
  plan.
- generated/source boundary: registry/package source only; no `apps/www/public/r`
  generated JSON, template output, route alias, or error-boundary bypass counts
  as a fix or proof.
- browser/device claim width: current macOS desktop homepage flow; browser and
  OS were absent from the report, so Browser plus Chromium is the honest local
  claim unless exact Chrome-specific evidence appears.
- forbidden product/API/release/public mutations: no commit, push, branch, PR,
  merge, release, issue close, or completed-label addition. Reporter-invalidated
  label correction and one proof-backed local status comment are authorized by
  the standing user-selected issue workflow.
- orchestration mode and writer ownership: orchestrator inactive; this main
  thread is the sole source/test/plan/host writer.

Output budget strategy:
- Start from exact owner and test files. Use runner discovery/counts before
  printing broad corpora. Cap logs and exclude generated/build trees,
  `node_modules`, `.next`, `.turbo`, coverage, and `apps/www/public/r`.

Blocked condition:
- Block only when exact current behavior cannot be observed, the authoritative
  host/device/credential is unavailable, unsafe scope needs user authority, or
  the same blocker leaves no safe alternate packet.
- Repair broken commands, stale servers, generated drift, and missing proof
  hosts before treating them as product blockers.

Regression state:
- current phase: local completion and public candidate handoff
- current executable case: `suggestion-accept:seeded-removal-homepage`
- current case status: `completed` locally; uncommitted and unpushed
- next owner: final pushed-ref replay before restoring the public `completed` label
- goal status: complete after the goal-plan checker passes

Completion rule:
- Do not call `update_goal(status: complete)` with unchecked Work Checklist
  items, unresolved Completion Gates, open required cases, or missing
  executable proof.
- Supporting case tables never replace tests or canonical gates.
- Run `check-complete.mjs` only after fresh evidence and risks are recorded.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured | yes | Next chronological open Felix issue; exact repro/fix/test/stability; local completion; required public comment; stale-label correction; no lint/Autoreview/commit/push |
| Regression methodology loaded | yes | Regression entrypoint and methodology read completely before goal or product mutation |
| Active goal checked or created | yes | No prior active goal; created exact #5086 goal with this plan |
| Current source owner and tested ref recorded | yes | Suggestion package/card/DOM projection classification boundary; `HEAD == origin/next == 1fb72c5` |
| Executable test cases discovered | yes | Exact E2E plus the 9-case `editor.update.suggestion.accept` package contract |
| Route/proof-host readiness plan recorded | yes | Fresh source-built `www` homepage `/`; Browser plus Chromium; reject stale hosts |
| Patch delegation boundary recorded | yes | One seeded-removal case; durable causal owner only; exact red/green, follow-up edit, zero page errors, five runs |
| Orchestrator writer ownership recorded | yes | Orchestrator inactive; main thread sole issue writer |
| Output budget strategy recorded | yes | Exact owners first; generated/build/noise trees excluded; bounded logs |
| Claim width and blocked rules recorded | yes | Regression run may complete locally; public issue stays candidate/open until pushed proof; ordinary host/test failures are repair work |
| Browser pack selected | yes | Crash occurs during a rendered pointer/card/React DOM interaction |
| Browser route / app surface identified | yes | Homepage `/`; Playground Collaborative Editing; exact removal phrase; Delete-card checkmark |
| Browser tool decision recorded | yes | Browser for normal rendered interaction; Playwright Chromium for durable exact replay and five-run stability |
| Console/network caveat policy recorded | yes | `removeChild`, page errors, runtime overlays, and action-time console errors fail; unrelated known extension/network noise must be isolated and named |
| Observable browser case captured | yes | `suggestion-accept:seeded-removal-homepage`; Plate #5086/Felix retest; route `/`; click exact phrase then Delete-card checkmark; expect phrase/card gone, editor mounted/editable, no error; reported browser/OS unknown; historical bad ref unknown; final base/ref and SHA-256 required |

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
- [x] Required retry-free stability runs passed with no retry.
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
| Named completion threshold | complete | Close every selected executable case and methodology row | Exact red, green, 5/5, Browser, package proof, comment, and label correction complete |
| Current-source readiness | complete | Prove source owner and final tested ref/dirty boundary | `dirty:1fb72c581095f23ddba3f597f41e8b10608283ef`; final runtime/test fingerprints recorded below |
| Route/proof-host readiness | complete | Prove the runner/host observes current source | Fresh Next process on `http://localhost:3010/`; no HMR after final source state |
| Executable regression coverage | complete | Record exact test file, red result, green result, and owning invariant | Exact direct-text E2E red with runtime overlay, then green; generic count trigger split into its own smoke row |
| Smallest-probe closure | complete | Record first falsifying probe and any host repair | Old generic path passed; exact reporter path failed, proving the false-green gap |
| Patch delegation closure | complete | Read back one-case root-cause/red/green/proof evidence | Conditional Radix custom-anchor topology detached the trigger; stable custom anchor kept |
| Focused verification closure | complete | Run owning test and exact final-case replay | E2E, Browser, 9 suggestion contracts, registry source check, and focused type evidence recorded |
| Stability closure | complete | Record retry-free warm runs or evidence-backed N/A | Chromium exact case 5/5, zero retries |
| Packet decision closure | complete | Keep/revert/quarantine/defer/block every selected case honestly | Kept one registry-owner patch and exact regression |
| Local completion status | complete | Mark every fully proved kept case and the run `completed`; record local ref/fingerprints and uncommitted/unpushed state separately | Local Regression case/run `completed`; public issue remains open candidate |
| No duplicate registry | complete | Prove no sidecar behavior manifest/database was created | Only executable tests and this transient plan were used |
| Generated/source and host repair | complete | Repair drift/host methodology or record blocked claim | Stale dev process replaced; final process fresh; changelog artifacts generated before the obsolete formatter failed |
| Orchestrator writer closure | complete | Prove one shared-state writer and serialized overlapping owners/hosts, or N/A | Main thread was sole writer; no subagent or second host writer |
| Workflow slowdown closure | complete | Repair avoidable slow/stale/noisy proof paths or defer with owner | False-green path repaired; unrelated API-reference/type migration failures isolated below |
| Methodology delta closure | complete | Resolve repair-now/no-change/defer for every case | `repair-now`: exact reporter action must not be replaced by a nearby aggregate-card path |
| Source/generated sync | complete | Run `pnpm install` and parity audit when agent sources changed, otherwise N/A | N/A: no agent source or dependency change; registry source/artifact semantic parity passed |
| Agent-native review | complete | Run for changed agent workflows or record N/A | N/A: no agent workflow changed |
| Final handoff contract | complete | Record tests, decisions, proof, sync, reviews, risks, and next owner | Recorded below |
| Autoreview | complete | Run P1 autoreview for non-trivial implementation changes or record N/A | N/A by explicit user instruction; no Autoreview ran |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5086-seeded-removal-suggestion-crash-regression.md` | Run after this evidence update |
| Browser interaction proof | complete | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | Fresh Browser exact replay passed and follow-up typing produced `Collaborative Editing!` |
| Browser console/network check | complete | Record console/network state or why it is not applicable | Zero Browser error logs before, after accept, and after follow-up edit; network N/A after successful load |
| Browser final proof artifact | complete | Record screenshot/trace/route/native proof or exact caveat | Browser DOM/error-log proof plus Chromium executable test; screenshot used only to target the wrapped visible text |
| Exact case replay | complete | For report-backed behavior, prove the exact case and all applicable end-state claim fields; otherwise N/A with reason | Direct click on red phrase, Delete-card named accept action, phrase/card gone, editor mounted, follow-up edit, zero errors |
| Final ref and fingerprints | complete | Record the replayed commit/ref and issue-owned production/test/fixture/harness SHA-256 fingerprints; any later code or generated change invalidates the result | `dirty:1fb72c5`; SHA-256 rows recorded below |
| Clean final runtime | complete | Before fixed/completed wording, start a fresh process from a clean checkout at the exact final pushed ref or immutable CI artifact and prove zero tracked/untracked issue-owned runtime-input differences; local candidates record N/A with exact unpushed status | N/A for public fixed/completed: current candidate is uncommitted/unpushed; fresh local process and fingerprints certify only local completion |
| Retry-free stability | complete | For native selection/paint, focus, DnD, compositor, or React DOM lifecycle, record 5/5 warm runs with no retry in the exact reported browser/device; otherwise N/A with reason | Browser/OS were unspecified; local Chromium 5/5, zero retries, plus fresh in-app Browser pass |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Requirement extraction and goal setup | complete | live #5086/Felix retest, intake, doctrine, exact case, goal, and constraints captured | source/host readiness |
| Current source and proof-host readiness | complete | stale host replaced; current `dirty:1fb72c5` served from a fresh process | exact case |
| Executable case discovery and selection | complete | exact reporter path plus adjacent count-trigger smoke and 9 package contracts | red probe |
| Smallest high-value probe | complete | old aggregate-card path passed while direct reporter click failed | reproduce/classify |
| Reproduce, classify, and red test | complete | Browser and tightened E2E produced the exact `removeChild` runtime overlay | patch delegation |
| One-case Patch delegation | complete | one registry UI anchor-topology repair only | verification |
| Focused verification and stability | complete | exact E2E 5/5; smoke, Browser, package, registry checks pass | packet decision |
| Keep/revert/quarantine | complete | kept stable custom-anchor topology and exact tests | methodology delta |
| Methodology repair/no-change/defer | complete | repair-now exact-action rule captured; no Regression skill edit required | closure |
| Reviews and final handoff | complete | manual source review; Autoreview N/A; public local-candidate comment posted | goal-plan check |
| Final goal-plan check | complete | checker is the final command after this update | final response |

Selected executable cases:
| Case ID | Source reference | Test file / command | Status | Tested ref | Next owner |
|---------|------------------|---------------------|--------|------------|------------|
| `suggestion-accept:seeded-removal-homepage` | Plate #5086; Felix `#issuecomment-5314465937` | `tooling/e2e/suggestion-accept.test.ts`; fresh `/`; 9 focused suggestion accept contracts | `completed` locally / candidate-local | `dirty:1fb72c581095f23ddba3f597f41e8b10608283ef` plus fingerprints | final pushed-ref replay |

Proof-host readiness:
| Case ID | Source owner | Runner / route / host | Freshness evidence | Generated/export boundary | Result |
|---------|--------------|-----------------------|--------------------|---------------------------|--------|
| `suggestion-accept:seeded-removal-homepage` | registry `block-discussion` Radix anchor lifecycle; package transform remained correct | fresh source-built `www` homepage; Browser and Playwright Chromium | final process started after all runtime/test edits; exact route loaded from port 3010 | registry source plus changelog JSON only; no `public/r` or route bypass | ready and passed |

Patch delegation:
| Case ID | Red test | Allowed owner/files | Required proof/stability | Patch return evidence | Result |
|---------|----------|---------------------|--------------------------|-----------------------|--------|
| `suggestion-accept:seeded-removal-homepage` | direct phrase path produced exact `removeChild` overlay; old count path passed | `block-discussion.tsx`, exact E2E, registry changelog, plan | exact red/green; 9 contracts; Browser; Chromium 5/5; focused type evidence | stable custom anchor; candidate-local; no package changeset; Autoreview N/A; fingerprints below | kept / completed locally |

Stability:
| Case ID | Executable proof / host | Required runs | Results | Retry count | Decision |
|---------|-------------------------|---------------|---------|-------------|----------|
| `suggestion-accept:seeded-removal-homepage` | fresh Next process; exact Chromium E2E | 5 | pass, pass, pass, pass, pass; about 4.3s each | 0 | keep / completed locally |

Packet decisions:
| Case | Executable evidence | Decision | Claim width | Residual risk | Next owner |
|------|---------------------|----------|-------------|---------------|------------|
| exact seeded removal | direct-action E2E red then 5/5 green; fresh Browser green | keep | current dirty local candidate only | no pushed-ref replay; reported browser/OS unknown | final pushed-ref verifier |

Methodology deltas:
| Case | Miss or owner checked | Decision | Durable owner/change | Focused proof | Trigger/result |
|------|-----------------------|----------|----------------------|---------------|----------------|
| exact seeded removal | Old regression clicked aggregate count trigger, not Felix's red text | repair-now | Tightened exact case; preserved count-trigger path as a separate smoke test | exact red before fix and 5/5 after | completed; no skill edit needed because existing Regression law already forbids proxy proof |

Workflow slowdowns:
| Step / command | Owner | Elapsed / expected | Cause | Evidence value | Repair/result |
|----------------|-------|--------------------|-------|----------------|---------------|
| Initial fresh host | local dev host | one failed start | stale Next PID held the app lock | required fresh-ref proof | exact stale PID stopped; fresh process used for red and a second fresh final process used for closure |
| Exact red E2E | Playwright | 30s timeout | test checked follow-up heading only after the crash removed the editor | useful red but slow | added immediate editor-mounted assertion; later red failed in about 9s |
| Registry changelog `--write` | registry generator | under 1s / expected under 1s | artifacts wrote, then obsolete `pnpm exec biome format` resolved incorrectly during the parallel linter migration | generated artifacts exist | did not rerun lint/format; semantic source/index/components parity check passed |
| Full www typecheck | unrelated current-tree migration | stopped at API check, then direct TSC exposed existing errors | stale API manifest plus unrelated registry/type migration, including pre-existing `displayName` errors | bounded relevant type evidence | registry source check passed; new anchor nullability error was fixed; no new issue-owned TSC error remains |

Findings:
- Intake found #5086 open and unassigned with `bug` plus stale `completed`;
  closeout removed the invalidated label and preserved `bug`.
- Felix's 2026-08-17 exact retest says the `removeChild` crash remains, so the
  2026-08-06 local three-run proof is disproven.
- The old E2E was false-green: it opened the aggregate `5` discussion trigger,
  while Felix clicked the red suggestion itself. Only the latter installed the
  text node as a Radix virtual anchor.
- Instrumented red proof showed React trying to remove an already-detached
  closed trigger button from a wrapper containing a replacement open trigger.
  The child was the `popover-trigger`, not a Plite text DOM node.
- `block-discussion` conditionally mounted `PopoverAnchor`. Radix therefore
  switched `PopoverTrigger` between wrapped trigger-anchor and direct
  custom-anchor trees when the accepted suggestion disappeared.
- Keeping one custom-anchor topology and falling back to a stable trigger ref
  removes the contested React ownership. This is copied registry UI ownership,
  not `@platejs/suggestion` model or Plite DOM behavior.
- The public issue is now OPEN with only `bug`; the stale `completed` label was
  removed and the local-candidate evidence comment is
  https://github.com/udecode/plate/issues/5086#issuecomment-5347016657.

Timeline:
- 2026-08-19: selected the next chronological open Felix issue after #5085,
  read live issue/retest and maintainer/regression/autogoal doctrine, created the
  goal/plan, and captured the exact case before product mutation.
- 2026-08-19: replaced the stale dev host, proved the old aggregate-card E2E
  passed, replayed Felix's direct text click through Browser, and reproduced the
  exact `removeChild` overlay with the editor removed.
- 2026-08-19: tightened the exact E2E, instrumented one red run to identify the
  detached Radix trigger, removed the diagnostic probe, and kept a stable custom
  anchor with the count trigger as fallback.
- 2026-08-19: passed fresh Chromium 5/5, the separate count-trigger smoke, fresh
  Browser acceptance plus follow-up edit, 9 suggestion acceptance contracts,
  registry source validation, and changelog semantic parity.
- 2026-08-19: removed the stale public label, posted/read back the local-only
  candidate comment, and verified the issue remains open.

Decisions and tradeoffs:
- Treat prior E2E green as untrusted until it fails on Felix's topology or its
  false-green gap is named. Prefer the causal package/runtime owner over
  homepage remount/timing/error suppression.
- Reject the package rewrite: suggestion acceptance produced correct model
  behavior in all 9 focused contracts. The failing child was the registry
  popover trigger, and the conditional custom-anchor topology owned it.
- Reject delayed acceptance, `flushSync`, remount keys, and error suppression.
  Stable anchor topology fixes the React ownership invariant without timing.
- Keep named `Accept suggestion` and `Reject suggestion` controls so browser
  proof selects the semantic action instead of button position.

Review fixes:
- Autoreview is N/A by the user's standing instruction; source-backed local
  review and browser/package proof remain required.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| First new host start collided with stale Next PID | 1 | Resolve exact PID and restart | fresh red host and second fresh final host used |
| Direct Browser locator click did not open the card | 1 | Inspect visible page and use precise CUA click on the text rect | exact Browser red and green reproduced |
| Popover close-state staging hypothesis | 2 variants | Instrument failing DOM removal instead of adding more timing | disproved; reverted fully |
| Changelog generator's obsolete Biome format step | 1 | Respect no-lint constraint; validate written artifacts semantically | source/event/index/components agree; formatter not rerun |
| Full www typecheck | 2 lanes | Isolate issue-owned errors from current migration failures | new virtual-anchor type error fixed; remaining errors pre-existed this packet |

Verification evidence:
- Pre-fix old aggregate path: original E2E passed once, proving it did not cover
  Felix's direct anchored case.
- Pre-fix exact path: Browser and tightened E2E produced Next Runtime
  `NotFoundError: Failed to execute 'removeChild' on 'Node'`; editor count became
  zero. The tightened E2E failed before the fix.
- Diagnostic red run: detached child was the closed Radix `popover-trigger`;
  parent contained the replacement open trigger. Diagnostic code was removed.
- Final fresh Chromium:
  `PLAYWRIGHT_BASE_URL=http://localhost:3010 pnpm exec playwright test --config tooling/config/playwright.config.ts --project=chromium tooling/e2e/suggestion-accept.test.ts --grep 'accepts the seeded removal suggestion without crashing' --repeat-each=5 --workers=1`
  -> 5 passed, zero retries.
- Fresh count-trigger smoke -> 1 passed. Exact test also asserts phrase/card
  removal, editor mount, follow-up edit, and zero console/page errors.
- Fresh in-app Browser -> phrase 0, Delete label 0, editor 1, follow-up heading
  `Collaborative Editing!`, error logs `[]` before/after/final.
- `bun test packages/suggestion/src/lib/BaseSuggestionPlugin.spec.tsx -t
  'editor.update.suggestion.accept'` -> 9 passed, 75 filtered, 0 failed.
- Registry source check -> passed. Registry changelog source/event/index/
  components semantic parity -> passed. Generator `--write` wrote artifacts but
  its obsolete Biome formatter failed; it was not rerun because lint is forbidden.
- Full www typecheck is not green due unrelated current-tree API-reference and
  TypeScript migration errors. Direct TSC exposed one issue-owned virtual-anchor
  nullability error; it was fixed. Remaining `block-discussion` `displayName`
  and sibling errors predate this packet. Package-integration TSC has the same
  unrelated current-tree failures. No lint or Autoreview ran.
- Final ref/status: `HEAD == origin/next ==
  1fb72c581095f23ddba3f597f41e8b10608283ef`; local issue files are uncommitted
  and unpushed.
- Final SHA-256: `block-discussion.tsx`
  `dafe2ef8837b65e0e2a988630bc597fe541f781231e7ef5c4fe53e8bc7bcc85a`;
  E2E `8bf56c87e54431786671ad3e2db4b31a66fa2031f340d73458356d7748e9896e`;
  fixture `4c86662834d31b57de45075134e02808e5b717e29781ab199e997888104cf32a`;
  popover primitive `2143300c5d9ef83ea372966f4540047b71cb7967c626b9a5adcaf5ef80d5137f`;
  changelog source `a1f90b215b4beff4f565667e1e00f0767ce7aebc558860b0c34d7caa1880dd31`;
  changelog event `90cd44c46c7c6b3606d3d711e502b9c92efb96eaf64911de7f0dfcf0207590c1`.

Final handoff:
- executable cases: exact direct-text acceptance plus separate count-trigger
  smoke in `tooling/e2e/suggestion-accept.test.ts`; 9 package accept contracts
- changed files: registry `block-discussion`, exact E2E, registry changelog
  source/generated artifacts, and this plan; no published package changed
- design decisions: stable Radix custom-anchor topology with trigger fallback;
  no timing, flush, remount, package rewrite, or Plite change
- tests and proof: exact red; fresh Chromium 5/5; count smoke; fresh Browser
  follow-up edit and zero errors; package 9/9; registry source pass
- source/generated sync: registry artifacts written and semantic parity passed;
  obsolete Biome format step failed and was not rerun; agent sync N/A
- P1 and agent-native findings: both N/A by explicit no-Autoreview instruction
  and no agent-workflow change; manual root-cause/source review complete
- residual risks and next owner: no reported browser/OS and no pushed ref;
  integration owner must replay exact case with matching fingerprints after push
- local completion status and integration/public-status boundary: Regression
  case/run `completed` locally; issue OPEN with only `bug`; local candidate
  comment posted; no commit, push, PR, release, closure, or shipped claim

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | #5086 local Regression run completed; public issue remains an open local candidate |
| Where am I going? | final goal checker, then handoff for eventual pushed-ref replay |
| What is the goal? | accept the seeded removal suggestion without crashing and keep the Playground usable |
| What have I learned? | prior proof clicked the aggregate trigger; conditional Radix anchor topology detached and replaced its trigger on the exact direct path |
| What have I done? | exact red/green, durable registry fix, 5/5, Browser follow-up edit, package/registry proof, changelog, label correction, and local-candidate comment |

Open risks:
- Exact historical bad ref/browser/OS are unknown; local completion must stay
  scoped to current source and the proved Browser/Chromium environment.
- The current checkout contains unrelated API-reference, registry migration,
  and TypeScript errors, so full www typecheck is not green. The issue-owned
  new type error was fixed and the browser/runtime proof is unaffected.
- Public fixed/completed status remains blocked on commit/push and exact replay
  on that final ref; the stale public label was intentionally removed.
