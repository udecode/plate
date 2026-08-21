# block drag inline caret regression

Objective:
Resolve Plate #5070's residual inline caret during homepage block drag; done
when the exact Chrome case has durable red/green browser coverage and passes
five retry-free final runs.

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
  the original `removeChild` crash is gone, but an unexpected inline caret is
  visible during the same homepage Welcome-block drag/drop workflow
- lane and current source owner: Plate copied registry DnD/selection paint
  boundary; the exact owner remains to be classified from the red browser case
- selected executable test cases: `homepage:block-drag-inline-caret`; preserve
  the existing `tooling/e2e/homepage-dnd.test.ts` crash/order/edit/selection
  assertions while adding the missing caret oracle
- tested ref or dirty-state boundary: `HEAD` and `origin/next` are
  `1fb72c581095f23ddba3f597f41e8b10608283ef`; issue-owned dirty files and final
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
- The exact Welcome-block drag case reproduces the unexpected inline caret on
  current source and an executable browser test fails on the same visible
  invariant before the fix and passes after it.
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
- allowed source owners: the smallest causally proven copied registry DnD,
  selection, or DOM integration owner; package/runtime code only if the exact
  red case proves registry code is not the owner
- allowed proof/test owners: existing homepage DnD E2E row, exact route fixture,
  browser helper needed to assert the visible caret, and this goal plan
- generated/source boundary: registry source is authoritative; no generated
  registry/template output edit and no route stub/alias/bypass may count as
  final proof
- browser/device claim width: macOS desktop Chrome homepage block DnD only;
  Playwright is durable support but cannot replace exact Chrome paint proof
- forbidden product/API/release/public mutations: no public API redesign,
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
- current phase: verified-local handoff; pushed-ref integration remains open
- current executable case: `homepage:block-drag-inline-caret`
- current case status: exact `/` red is repaired locally and passes 5/5 clean
  Chromium plus 5/5 exact Chrome with a held-drag caret oracle
- next owner: push only when authorized, then replay on that exact pushed ref
  before fixed/completed wording or label mutation
- goal status: complete locally; public/integration state remains open

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
| Current source owner and tested ref recorded | yes | copied registry DnD drag-handle selection-mode transition; `HEAD == origin/next == 1fb72c5` |
| Executable test cases discovered | yes | Existing `tooling/e2e/homepage-dnd.test.ts`; selected residual case `homepage:block-drag-inline-caret` |
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
- [x] The smallest falsifying executable probe ran before scaling.
- [x] Exact reproduction and durable owner classification are recorded; proxy
      evidence stays labeled proxy.
- [x] The executable test is red before the fix, or the exact safe-red
      limitation and proof-host repair are explicit.
- [x] Regression delegated only one normalized case at a time to Patch.
- [x] Patch returned root cause, durable owner, changed files, exact red/green
      commands, final ref/dirty fingerprints, stability, architecture verdict,
      P1 review, and caveat.
- [x] Focused green proof and exact final fresh-host replay passed. Chromium and
      exact Chrome both cover the final matching-fingerprint candidate.
- [x] Required retry-free stability runs passed with no retry: Chromium 5/5 and
      exact Chrome held-drag 5/5.
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
| Named completion threshold | yes | Close every selected executable case and methodology row | one case is verified-local with red/green executable coverage and exact Chrome 5/5 |
| Current-source readiness | yes | Prove source owner and final tested ref/dirty boundary | final local DnD/test/harness fingerprints match the clean proof host; unrelated shared linter edits are excluded and block only a whole-checkout integration claim |
| Route/proof-host readiness | yes | Prove the runner/host observes current source | clean `1fb72c5` webpack host on `:3107`, with matching DnD/test fingerprints; Turbopack Shiki failure excluded |
| Executable regression coverage | yes | Record exact test file, red result, green result, and owning invariant | `tooling/e2e/homepage-dnd.test.ts`; red inline caret; green clear-selection transition |
| Smallest-probe closure | yes | Record first falsifying probe and any host repair | exact Chrome selection path `32,0`; stale selector and host repairs recorded |
| Patch delegation closure | yes | Read back one-case root-cause/red/green/proof evidence | Plate registry DnD owner; collapse -> clear; two changed files |
| Focused verification closure | yes | Run owning test and exact final-case replay | Chromium full case green; exact Chrome held-drag full case green on matching final fingerprints |
| Stability closure | yes | Record retry-free warm runs or evidence-backed N/A | Chromium 5/5 and exact Chrome held-drag 5/5, both retry-free |
| Packet decision closure | yes | Keep/revert/quarantine/defer/block every selected case honestly | keep `verified-local`; pushed/public completion remains unauthorized |
| No duplicate registry | yes | Prove no sidecar behavior manifest/database was created | only executable test and transient goal plan |
| Generated/source and host repair | yes | Repair drift/host methodology or record blocked claim | webpack host used; no alias/generated edit counted |
| Orchestrator writer closure | yes | Prove one shared-state writer and serialized overlapping owners/hosts, or N/A | orchestrator inactive; one source/test writer |
| Workflow slowdown closure | yes | Repair avoidable slow/stale/noisy proof paths or defer with owner | filtered host logs, port 3107, webpack, live post-hover coordinates |
| Methodology delta closure | yes | Resolve repair-now/no-change/defer for every case | no skill change; executable case repaired under existing doctrine |
| Source/generated sync | yes | Run `pnpm install` and parity audit when agent sources changed, otherwise N/A | N/A: no agent source changed; full install completed in clean host |
| Agent-native review | yes | Run for changed agent workflows or record N/A | N/A: no agent workflow changed |
| Final handoff contract | yes | Record tests, decisions, proof, sync, reviews, risks, and next owner | evidence and public candidate comment recorded |
| Autoreview | yes | Run P1 autoreview for non-trivial implementation changes or record N/A | N/A by explicit user instruction to stop Autoreview this session |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5070-block-drag-inline-caret-regression.md` | canonical rows resolved; command receipt added after the final check |
| Browser interaction proof | yes | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | Browser confirmed the route; Chromium 5/5; exact Chrome held-drag 5/5 |
| Browser console/network check | yes | Record console/network state or why it is not applicable | focused test asserts zero page/console errors; Chrome profile extension errors excluded by source URL and named |
| Browser final proof artifact | yes | Record screenshot/trace/route/native proof or exact caveat | exact Chrome screenshots, live post-hover hit geometry, native held-drag state, final DOM state, and 5/5 ledger recorded |
| Exact case replay | yes | For report-backed behavior, prove the exact case and all applicable end-state claim fields; otherwise N/A with reason | held drag, order, caret, focus, scroll, drop UI, runtime errors, typing, and selection pass 5/5 in exact Chrome |
| Final ref and fingerprints | yes | Record the replayed commit/ref and issue-owned production/test/fixture/harness SHA-256 fingerprints; any later code or generated change invalidates the result | dirty base `1fb72c5`; matching production/test/harness fingerprints recorded after final replay |
| Clean final runtime | N/A | Before fixed/completed wording, start a fresh process from a clean checkout at the exact final pushed ref or immutable CI artifact and prove zero tracked/untracked issue-owned runtime-input differences; local candidates record N/A with exact unpushed status | no push authorized; verified-local only, with fixed/completed wording and label explicitly forbidden |
| Retry-free stability | yes | For native selection/paint, focus, DnD, compositor, or React DOM lifecycle, record 5/5 warm runs with no retry in the exact reported browser/device; otherwise N/A with reason | exact Chrome held-drag 5/5, zero retry and zero product-origin errors |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Requirement extraction and goal setup | complete | explicit requirements, methodology, issue, goal, and plan captured before product mutation | source/host readiness |
| Current source and proof-host readiness | complete | `HEAD == origin/next == 1fb72c5`; clean exact-ref `/` runs on webpack at port 3107 with final matching DnD/test/harness fingerprints; unrelated shared linter edits stay outside the claim | exact Chrome stability |
| Executable case discovery and selection | complete | existing homepage DnD E2E plus one residual reporter case selected | smallest probe |
| Smallest high-value probe | complete | exact `/` Chrome and focused Chromium both expose the collapsed inline caret when the drag starts from a live post-hover handle | reproduce/classify |
| Reproduce, classify, and red test | complete | exact route red plus executable post-drop caret red; Plate registry drag-handle selection-mode owner | patch delegation |
| One-case Patch delegation | complete | collapse replaced with clear; test selectors/input/oracle repaired | verification |
| Focused verification and stability | complete | focused green, direct TypeScript green, Chromium 5/5, exact Chrome held-drag 5/5 | packet decision |
| Keep/revert/quarantine | complete | keep as `verified-local`; pushed/public completion remains unauthorized | methodology delta |
| Methodology repair/no-change/defer | complete | no skill change: existing exact/native/freshness law caught both stale selectors and stale hover coordinates; durable test repaired | final handoff |
| Reviews and final handoff | complete | public local-status comment posted; no lint or Autoreview by instruction | goal-plan check after exact Chrome |
| Final goal-plan check | complete | canonical gates resolved; command receipt recorded below | final response |

Selected executable cases:
| Case ID | Source reference | Test file / command | Status | Tested ref | Next owner |
|---------|------------------|---------------------|--------|------------|------------|
| `homepage:block-drag-inline-caret` | Plate #5070, Felix `#issuecomment-5314465244` | `tooling/e2e/homepage-dnd.test.ts`; exact Chrome `/` held drag | `verified-local`: exact red/green, Chromium 5/5, exact Chrome held-drag 5/5 | `dirty:1fb72c581095f23ddba3f597f41e8b10608283ef`; production `fc07d822...`; test `66ccb0bf...` | pushed-ref replay when authorized |

Proof-host readiness:
| Case ID | Source owner | Runner / route / host | Freshness evidence | Generated/export boundary | Result |
|---------|--------------|-----------------------|--------------------|---------------------------|--------|
| `homepage:block-drag-inline-caret` | copied registry DnD drag-handle selection-mode transition | shared checkout `/` fails on unrelated linter-migration compile errors; clean exact-ref `/` runs with Next webpack on port 3107 | clean detached worktree at `1fb72c5`; current DnD/test/harness match SHA-256; fresh webpack process | Turbopack `/` cannot resolve transitive `@shikijs/core`; no alias/stub counted; webpack is the honest source-built host | ready; Chromium and exact Chrome complete |

Patch delegation:
| Case ID | Red test | Allowed owner/files | Required proof/stability | Patch return evidence | Result |
|---------|----------|---------------------|--------------------------|-----------------------|--------|
| `homepage:block-drag-inline-caret` | focused Chromium failed `Expected false, Received true` on the post-drop inline-caret oracle; exact Chrome showed collapsed selection at `32,0` | `apps/www/src/registry/components/editor/dnd.tsx`; `tooling/e2e/homepage-dnd.test.ts` | focused red/green, Chromium 5/5, exact Chrome required; crash/order/error/edit/selection preserved | Plate focus/selection owner; collapse -> clear; fingerprints below; keep architecture; Autoreview N/A by instruction | verified-local returned |

Stability:
| Case ID | Executable proof / host | Required runs | Results | Retry count | Decision |
|---------|-------------------------|---------------|---------|-------------|----------|
| `homepage:block-drag-inline-caret` | exact `/`; focused Playwright Chromium | 5 | `5/5` retry-free in 57.6s on final matching DnD/test fingerprints | 0 | pass for Chromium only |
| `homepage:block-drag-inline-caret` | exact `/`; exact Chrome profile | 5 | `5/5` retry-free held-drag ledger: while held, `body.dragging=true`, caret false, editor unfocused, scroll 0; after drop order/paint clean; follow-up typing/selection clean | 0 behavior retries; pre-action proof-host readiness failures did not execute a case and reset the earlier ledger | pass |

Packet decisions:
| Case | Executable evidence | Decision | Claim width | Residual risk | Next owner |
|------|---------------------|----------|-------------|---------------|------------|
| `homepage:block-drag-inline-caret` | exact red; focused red/green; Chromium 5/5; exact Chrome held-drag 5/5 | keep `verified-local` | final local issue-owned code/test candidate only; not pushed, fixed, shipped, or completed | final pushed ref and whole-checkout integration are not certified | pushed-ref replay owner |

Methodology deltas:
| Case | Miss or owner checked | Decision | Durable owner/change | Focused proof | Trigger/result |
|------|-----------------------|----------|----------------------|---------------|----------------|
| `homepage:block-drag-inline-caret` | prior coverage used removed `data-block-id` selectors and `dragTo` alone, so it never reached the native caret oracle | `no-change` to skill doctrine; repair test now | current selectors, prior text selection, mouse start, post-drop native caret, order, errors, typing, and selection | existing Regression exact/native/freshness rules caught the miss; post-hover coordinates are re-read before Chrome input |

Workflow slowdowns:
| Step / command | Owner | Elapsed / expected | Cause | Evidence value | Repair/result |
|----------------|-------|--------------------|-------|----------------|---------------|
| shared-checkout `www` host | concurrent linter-migration session | much slower than expected; stop output exceeded the intended cap | unrelated invalid `const` rewrites prevented compilation and emitted accumulated server logs | proves shared host is not current-route ready; no issue evidence | moved proof to a clean exact-ref checkout; do not repeat or touch the other session's files |
| clean exact-ref homepage | `www` dependency graph | one focused navigation | `/` fails resolving `@shikijs/core`, while `/blocks/playground` renders | exact-route blocker and valid proxy boundary | stop the server and rerun a full frozen install before any product edit |
| exact Chrome DnD setup | Browser/Chrome host | two instrumented probes | Browser read-only evaluation omits `document.getSelection`; first failed probe left the mouse pressed until the next call | direct proxy visibly reproduces the caret and CDP can read native selection | released the mouse immediately; switched native selection reads to CDP `Runtime.evaluate`; do not repeat the unsupported API |
| exact Chrome final ledger | Chrome extension profile | several pre-action readiness failures before the final ledger | Playwright isolated-world setup and the Chrome helper's fixed mouse deadline stalled under extension-injected work | proves the proof host, not Plate, was the remaining blocker | raw CDP state reads plus native `Input.dispatchMouseEvent`, live-handle hit checks, explicit route readiness polling, and held-mouse cleanup produced the final 5/5 ledger |

Findings:
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

Verification evidence:
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

Final handoff:
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

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | verified-local handoff with pushed-ref integration open |
| Where am I going? | replay on the exact pushed ref only when push is authorized |
| What is the goal? | remove #5070's residual inline caret without regressing block move, crash safety, typing, or selection |
| What have I learned? | collapse preserved the caret; stale selectors, stale post-hover geometry, and broken hosts can each fabricate or hide DnD proof |
| What have I done? | repaired the owner and durable test, passed focused red/green, 5/5 Chromium, TypeScript, and 5/5 exact Chrome held-drag proof, while keeping the issue open and the claim local |

Open risks:
- The verified candidate is unpushed. No fixed, shipped, or completed claim is
  valid until the exact pushed ref passes the same proof.
- Unrelated concurrent linter-migration edits prevent a whole-current-checkout
  runtime claim; issue-owned production/test/harness fingerprints do match the
  clean proof host exactly.
