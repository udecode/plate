# media caption Enter regression

Objective:
Correct MEDIA-CAPTION-ENTER-001 attempt 2: Enter splits the caption at the
caret, keeps the left text in the media caption, moves the right text into a
following paragraph, and places the caret at that paragraph's start. Done when
the corrected regression is red/green, five retry-free browser runs pass, and
Regression plan gates close.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-25-media-caption-enter-regression.md

Template:
docs/plans/templates/regression.md

Primary template:
docs/plans/templates/regression.md

Applied packs:
- none

Regression source:
- target bug / surface / corpus: pressing Enter while editing a media caption
  inserts another media node
- lane and current source owner: Plate media caption editing in
  `packages/media/src/lib/BaseMediaPlugin.ts`, where every media text-block
  plugin shares construction and command behavior
- selected executable test cases: `MEDIA-CAPTION-ENTER-001`
- tested ref or dirty-state boundary: base
  `168a4490e2ccf90dd9b1bd3230fb2f528460caa2` plus final SHA-256 fingerprints
  for production, package test, browser test, demo fixture, and Playwright config
- route / proof host and freshness method: current-source `apps/www` media demo
  through the repo browser runner; start a fresh process after source changes
- invocation mode / timebox: explicit `regression` invocation, one-shot
  execution, no timebox

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
- `node .agents/skills/regression/scripts/validate-regression-plan.mjs docs/plans/2026-08-25-media-caption-enter-regression.md --complete`
- P1 autoreview for non-trivial implementation packets
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-25-media-caption-enter-regression.md`

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
- allowed source owners: the canonical media-caption Enter/event owner only
- allowed proof/test owners: its existing package/DOM test owner and the
  existing `apps/www` or Playwright media route harness
- generated/source boundary: edit source and tests only; generated registry
  output may be rebuilt only by its owning generator when current source proof
  requires it
- browser/device claim width: desktop browser Enter behavior shown in the
  attached recording; no raw-device or exact-Chrome claim was requested
- forbidden product/API/release/public mutations: no public API redesign,
  generated-file hand edit, commit, push, PR, release, or issue mutation
- orchestration mode and writer ownership: single writer in this task; Patch is
  followed sequentially in the main thread under the repo instruction

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
- current phase: attempt-2 closure
- current executable case: `MEDIA-CAPTION-ENTER-001`
- current case status: locally completed; attempt 1 remains invalid
- next owner: user/local integrator for any commit, CI, or release work
- goal status: closure-ready; final status transition follows the two plan checks

Completion rule:
- Do not call `update_goal(status: complete)` with unchecked Work Checklist
  items, unresolved Completion Gates, open required cases, or missing
  executable proof.
- Supporting case tables never replace tests or canonical gates.
- Run `check-complete.mjs` only after fresh evidence and risks are recorded.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured | yes | Base request forbids duplicated media. Latest user correction and two screenshots require `he\|llo` to become caption `he` plus following paragraph `\|llo`; deliver local implementation, executable regression, browser proof, and the Regression final handoff. No timing or public mutation request. |
| Regression methodology loaded | yes | `.agents/skills/regression/references/methodology.md` read completely before goal creation or product work. |
| Active goal checked or created | yes | Attempt-1 goal was closed and is no longer active. A new attempt-2 goal was created for corrected split semantics, five-run browser stability, and plan closure. |
| Current source owner and tested ref recorded | yes | `packages/media/src/lib/BaseMediaPlugin.ts`; base `168a4490e2ccf90dd9b1bd3230fb2f528460caa2`; final dirty fingerprints required. |
| Executable test cases discovered | yes | Package model coverage in `packages/media/src/lib/BaseMediaPluginContracts.spec.ts` plus trusted keyboard coverage in `tooling/e2e/media-caption-enter.test.ts` on `/blocks/media-demo`. |
| Cumulative reporter evidence resolved | yes | Base no-duplicate acceptance remains required. Latest reporter delta is the two screenshots and correction: split at the caret, retain the left caption, create a following paragraph from the right caption, and put the caret at its start. |
| Reporter oracle matrix resolved | yes | All seven observations are rebuilt below around the reporter-authorized paragraph split; the invented soft-break target is revoked. |
| Regression semantic validator ready | yes | Current validator is `.agents/skills/regression/scripts/validate-regression-plan.mjs`; pre-implementation run follows this table. |
| Route/proof-host readiness plan recorded | yes | Fresh `apps/www` process on a dedicated port, fresh Playwright page, `/blocks/media-demo`, source import through `EditorKit`, and unchanged demo fixture fingerprints. |
| Patch delegation boundary recorded | yes | One packet after workflow and architecture gates: preserve generic `insertBreak`, transform the split right media into the canonical following paragraph in `@platejs/media`; only package owner/test, exact browser test, changeset, and transient plan may change. No caption UI workaround. |
| Orchestrator writer ownership recorded | yes | Orchestrator mode is inactive; repo instructions require sequential main-thread work; one writer owns plan, tests, product source, and host. |
| Output budget strategy recorded | yes | Narrow owner-first `rg`, exact-file reads, capped logs, and no generated/build-tree scans. |
| Claim width and blocked rules recorded | yes | Claim is local desktop-browser caption Enter behavior only; blocked only after proof-host repair options are exhausted or scope needs new authority. |

Work Checklist:
- [x] Skill analysis complete: Regression is the supervisor, Patch is the
      one-case worker, and executable tests are the behavior authority.
- [x] First checkpoint captures every explicit requirement before mutable work:
      fix the reported Enter duplication; treat the attached recording and
      latest correction/screenshots as cumulative reporter evidence; split the
      caption into a following paragraph at the caret; add executable regression
      coverage; prove the actual browser interaction five retry-free times;
      report receipts, reviews, risks, and local-only status; do not commit,
      push, release, or mutate a public tracker.
- [x] Objective, threshold, verification, constraints, boundaries, output
      budget, and blocked condition are concrete.
- [x] Current source, exact ref/dirty boundary, test runner, route/proof host,
      export/build path, and freshness method are recorded.
- [x] Generated/source drift and host readiness are repaired or block the claim.
- [x] Every selected case has a stable ID, source reference, owner, setup,
      action, expected outcome, expected-outcome authority, executable test
      path/command, tested ref, and required stability.
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
- [x] Every blocking pixel classifier passes a known-positive and known-negative
      control through the same capture path; a failed control invalidates prior
      results and freezes product edits until the proof helper is repaired.
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

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named completion threshold | yes | Close every selected executable case and methodology row | MEDIA-CAPTION-ENTER-001 is locally completed; all case, proof, decision, and methodology rows below are resolved. |
| Current-source readiness | yes | Prove source owner and final tested ref/dirty boundary | Owner `packages/media/src/lib/BaseMediaPlugin.ts`; dirty ref `168a4490e2ccf90dd9b1bd3230fb2f528460caa2`; source/test/browser fingerprints are recorded below. |
| Route/proof-host readiness | yes | Prove the runner/host observes current source | Rebuilt `@platejs/media`; final process PID 53981 started at `2026-08-26T08:22:13.000Z` on `http://localhost:3000`; the receipt binds source, built runtime, route fixtures, host, and browser. |
| Executable regression coverage | yes | Record exact test file, red result, green result, and owning invariant | Corrected Bun red was 11/12 with `he\nllo` left in the caption; green is 12/12. Corrected Chromium red was 0/1 with `Image\n caption` in `figcaption`; final is 1/1. |
| Cumulative reporter evidence closure | yes | Map every still-applicable base acceptance and later reporter delta to a phase-specific executable oracle | The base request/MP4 still forbid duplicated media. The latest correction/screenshots positively require caption-left plus paragraph-right and map to package and trusted-browser assertions. |
| Reporter oracle closure | yes | Resolve positive and forbidden states for all seven observations and every applicable interaction phase per case | Model, DOM/native, focus, runtime-error, and follow-up rows pass; popup and geometry are N/A with reasons. |
| Failed-fix interrupt closure | yes | Prove every claimed-fix failure invalidated prior proof and completed automatic Regression repair | The reporter contradiction revoked attempt-1 completion, stability, and receipt. Regression now requires explicit positive expected-outcome authority; 50/50 workflow tests and generated-resource parity pass before attempt 2. |
| Architecture pressure closure | yes | Prove every second failure or architecture trigger has Best API and layer-plan evidence | `duplicated-live-identity` closed through accepted `best-api review` and `plate-plan --quick` before product implementation. |
| Proof receipt closure | yes | Validate generated final receipts against unchanged issue-owned inputs | Attempt-2 completed receipt `sha256:4e920cd0a6f5cddf5faeca962f03ad79eee98c38ee596d8d4774d5c7164eab65`; digest `sha256:9b7ac64d48a359fb502a9d716d2811916caf1e73ad42f95a305bfcd1ab894f11`; zero retries. Attempt-1 receipt remains revoked. |
| Affected-corpus replay closure | yes | Replay all cases affected by the last shared-owner edit | The combined Bun + Chromium receipt began at `2026-08-26T08:26:22.960Z`, after the last Media owner edit at `2026-08-26T08:14:00.000Z`, and passed under the attempt-2 digest. |
| Started-gate failure closure | yes | Rerun every requested or started gate that failed; completion requires the exact gate to pass on final bytes | Regression mirrors, full Media suite, dev-host readiness, exact Playwright, and Browser all have passing final reruns below. |
| Smallest-probe closure | yes | Record first falsifying probe and any host repair | Corrected Bun first rejected the attempt-1 soft break; Chromium then rejected the same caption-only result under trusted Enter. |
| Patch delegation closure | yes | Read back one-case root-cause/red/green/proof evidence | One normalized Media packet returned owner, root cause, changes, red/green, fingerprints, stability, architecture verdict, review caveat, and local status. |
| Focused verification closure | yes | Run owning test and exact final-case replay | Focused package 12/12 and receipt Chromium 1/1 pass; full Media suite is 80/80. |
| Stability closure | yes | Record retry-free warm runs or evidence-backed N/A | Five separate warm Chromium executions passed; retry count 0 for each. |
| Packet decision closure | yes | Keep/revert/quarantine/defer/block every selected case honestly | Keep MEDIA-CAPTION-ENTER-001 as locally completed. |
| Local completion status | yes | Mark every fully proved kept case and the run `completed`; record local ref/fingerprints and uncommitted/unpushed state separately | Case and run are completed on dirty local ref; changes are uncommitted and unpushed, so no integration/release claim is made. |
| No duplicate registry | yes | Prove no sidecar behavior manifest/database was created | Only executable package/browser tests and this transient goal plan record the case; no TSV, JSON, database, or sidecar registry was created. |
| Generated/source and host repair | yes | Repair drift/host methodology or record blocked claim | Built Media `dist` through its package script and restarted the host; generated registry files were not hand-edited. |
| Orchestrator writer closure | N/A: orchestrator inactive | Prove one shared-state writer and serialized overlapping owners/hosts, or N/A | Repo instructions required sequential main-thread work; one writer and one dedicated host ran at a time. |
| Workflow slowdown closure | yes | Repair avoidable slow/stale/noisy proof paths or defer with owner | Shared-build test interference, one reinstall materialization delay, and Browser host/focus recovery are classified and resolved below. |
| Methodology delta closure | yes | Resolve repair-now/no-change/defer for every case | `repair-now`: require a named positive expected-outcome authority; ambiguous negative-only reports stop as `needs-oracle`. The executable validator regression passes. |
| Source/generated sync | yes | Run `pnpm install` and parity audit when agent sources changed, otherwise N/A | Regression source rules, methodology, validator, test, and template changed. `pnpm install` regenerated mirrors; 50/50 workflow tests and `sync-resources.mjs --check` pass. |
| Agent-native review | yes | Run for changed agent workflows or record N/A | Manual agent-native review confirms canonical source ownership, discoverability, executable enforcement, regenerated mirrors, and no accepted P1 finding. |
| Final handoff contract | yes | Record tests, decisions, proof, sync, reviews, risks, and next owner | Final handoff section below records every required boundary. |
| Autoreview | N/A: current branch is `next` | Run P1 autoreview for non-trivial implementation changes or record N/A | Root instructions prohibit `autoreview` on `next`; manual scoped review fixed the JSDoc gap, then lint, tests, typecheck, build, Browser, and receipt passed. |
| Regression semantic plan | yes | Run `node .agents/skills/regression/scripts/validate-regression-plan.mjs docs/plans/2026-08-25-media-caption-enter-regression.md --complete` | pass: `Regression plan: semantically complete.` |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-25-media-caption-enter-regression.md` | pass: `[autogoal] complete: docs/plans/2026-08-25-media-caption-enter-regression.md` |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Requirement extraction and goal setup | complete | Goal and explicit request boundaries recorded. | source/host readiness |
| Current source and proof-host readiness | complete | Base ref, `@platejs/media` owner, `/blocks/media-demo`, fresh-host method, package runner, and source/generated boundary resolved. | discover executable cases |
| Executable case discovery and selection | complete | `MEDIA-CAPTION-ENTER-001` maps to package and Playwright tests. | smallest probe |
| Cumulative reporter evidence inventory | complete | Base request/MP4 plus latest correction and two screenshots are cumulative; attempt-1 soft-break authority is revoked. | reporter oracle expansion |
| Reporter oracle expansion | complete | Seven observation rows below use the reporter-authorized paragraph split. | semantic validation |
| Pre-implementation semantic validation | complete | Corrected plan passed structural validation after workflow repair and accepted architecture decisions. | smallest probe |
| Smallest high-value probe | complete | Corrected Bun test was 11/12 red and received `he\nllo` in the caption instead of a following paragraph. | reproduce/classify |
| Reproduce, classify, and red test | complete | Corrected Chromium was 0/1 red and received `Image\n caption` inside `figcaption`. | architecture pressure |
| One-case Patch delegation | complete | Best API and `plate-plan --quick` accepted the Media command owner; source, tests, browser proof, and changeset are complete. | verification |
| Focused verification and stability | complete | Focused 12/12, full Media 80/80, Chromium receipt 1/1, Browser route proof, and five retry-free warm runs pass. | packet decision |
| Keep/revert/quarantine | complete | Keep the one-case packet as locally completed. | methodology delta |
| Methodology repair/no-change/defer | complete | `repair-now` added explicit positive expected-outcome authority and a validator regression; 50/50 tests and mirror parity pass. | closure |
| Reviews and final handoff | complete | Manual product and agent-native P1 reviews are clear; `autoreview` is prohibited on `next`; all applicable mechanical gates pass. | goal-plan check |
| Final goal-plan check | complete | Semantic validator and Autogoal checker pass on the closed ledger. | final response |

Selected executable cases:
| Case ID | Source reference | Setup / action | Expected outcome | Expected-outcome authority | Exact environment | Test file / command | Status | Tested ref | Next owner |
|---------|------------------|----------------|------------------|----------------------------|-------------------|---------------------|--------|------------|------------|
| MEDIA-CAPTION-ENTER-001 | Base request and MP4 plus latest user correction and `/var/folders/md/2qpw448d4tx0dgncw_kqdpk80000gn/T/codex-clipboard-3dd32249-8b18-41fb-8fa7-e85659e638d0.png` and `/var/folders/md/2qpw448d4tx0dgncw_kqdpk80000gn/T/codex-clipboard-82c3cd8e-4f5e-4ab6-b7d8-793d56212ed5.png` | Open `/blocks/media-demo`; put a collapsed caption selection between the left and right text; press trusted Enter. | Keep one media node; leave the left text in its caption; insert a paragraph immediately after the media containing the right text; collapse the caret at offset 0 of that paragraph; preserve follow-up typing and zero runtime errors. | reporter: latest user correction and before/after screenshots; accepted-product-law: all five Media descriptors share the same direct-caption command owner | Local macOS desktop Playwright Chromium against current-source `apps/www` PID 53981 on `http://localhost:3000`. | `packages/media/src/lib/BaseMediaPluginContracts.spec.ts` via `bun test packages/media/src/lib/BaseMediaPluginContracts.spec.ts`; `tooling/e2e/media-caption-enter.test.ts` via `PLAYWRIGHT_BASE_URL=http://localhost:3000 pnpm e2e tooling/e2e/media-caption-enter.test.ts --project=chromium`. | completed | dirty:168a4490e2ccf90dd9b1bd3230fb2f528460caa2 | User/local integrator |

Reporter evidence inventory:
| Case ID | Source role | Source reference | Phase | Claim | Disposition | Oracle anchors | Executable anchor | Result |
|---------|-------------|------------------|-------|-------|-------------|----------------|-------------------|--------|
| MEDIA-CAPTION-ENTER-001 | base-acceptance | User request: “pressing enter in caption is inserting another media node!!” | after-action | Enter in a caption must not insert another media node. | required | `model@after-action`, `dom-native@after-action` | `test: packages/media/src/lib/BaseMediaPluginContracts.spec.ts#splits each media caption into a following paragraph on Enter` | pass: five descriptor rows and exact Chromium retain one media node |
| MEDIA-CAPTION-ENTER-001 | base-acceptance | Attached 2.4-second MP4 before and after Enter | setup | One media node owns the direct caption and one collapsed caption selection receives Enter. | required | `dom-native@after-action`, `focus@after-action` | `test: tooling/e2e/media-caption-enter.test.ts#Enter in an image caption splits the suffix into a following paragraph` | pass: trusted Enter starts from caption path `[2,0]` offset 5 and retains editor focus |
| MEDIA-CAPTION-ENTER-001 | latest-reporter-delta | Latest user correction plus the two attached before/after screenshots | after-action | Split at the caret: keep the left text in the caption, move the right text to a paragraph immediately after the media, and put the caret at offset 0 of that paragraph. | required | `model@after-action`, `dom-native@after-action`, `focus@after-action`, `follow-up-input@follow-up` | `test: tooling/e2e/media-caption-enter.test.ts#Enter in an image caption splits the suffix into a following paragraph` | pass: package and browser assert caption-left, paragraph-right, paragraph offset 0, then follow-up typing |

Reporter oracle matrix:
| Case ID | Observation | Phase | Applies | Positive assertion | Forbidden state | Proof layer | Executable anchor | Result |
|---------|-------------|-------|---------|--------------------|-----------------|-------------|-------------------|--------|
| MEDIA-CAPTION-ENTER-001 | model | after-action | yes | The document has one media node whose caption is the left text, followed immediately by one paragraph containing the right text; selection is collapsed at `[nextPath,0]` offset 0. | A second media exists, media props survive on the right node, a soft break remains in the caption, text is lost, or selection is not at the paragraph start. | package transaction test | `test: packages/media/src/lib/BaseMediaPluginContracts.spec.ts#splits each media caption into a following paragraph on Enter` | pass: all five media descriptors produce caption `he`, paragraph `llo`, and selection `[1,0]` offset 0 |
| MEDIA-CAPTION-ENTER-001 | dom-native | after-action | yes | Exactly one media/caption renders; its caption contains the left text and the immediately following paragraph contains the right text; native selection is collapsed at paragraph offset 0. | Duplicate media/caption DOM, a line break inside `figcaption`, misplaced paragraph, multiple ranges, or a caret inside the caption survives. | browser Playwright DOM and native-selection assertions | `test: tooling/e2e/media-caption-enter.test.ts#Enter in an image caption splits the suffix into a following paragraph` | pass: one target image and caption `Image`; path 3 paragraph ` caption`; one range at `[3,0]` offset 0 |
| MEDIA-CAPTION-ENTER-001 | focus | after-action | yes | The editor root retains keyboard focus and the native caret is in the new following paragraph at offset 0. | Focus moves to media chrome/body/toolbar, or the caret remains in the caption or another block. | browser Playwright active-element and selection assertions | `test: tooling/e2e/media-caption-enter.test.ts#Enter in an image caption splits the suffix into a following paragraph` | pass: editor root remains active and native selection is inside the new paragraph |
| MEDIA-CAPTION-ENTER-001 | popup | after-action | no | N/A: neither the report nor the Enter path opens a toolbar, menu, overlay, or dialog. | N/A: no popup state belongs to this case. | N/A: no popup proof applies to this interaction. | N/A: no popup behavior belongs to the executable case. | N/A: no popup behavior applies |
| MEDIA-CAPTION-ENTER-001 | geometry-paint | after-action | no | N/A: the claim is node/DOM duplication, not exact layout, pixels, or compositor output. | N/A: no pixel or geometry state is asserted. | N/A: DOM image count owns the visible duplication claim. | N/A: no geometry or pixel oracle is needed. | N/A: no geometry-paint claim applies |
| MEDIA-CAPTION-ENTER-001 | runtime-errors | after-action | yes | No page error or console error occurs after trusted Enter and follow-up input. | Any page exception, React error, console error, or dev overlay appears. | browser Playwright runtime-error recorder | `test: tooling/e2e/media-caption-enter.test.ts#Enter in an image caption splits the suffix into a following paragraph` | pass: Playwright recorder and independent Browser logs report zero errors |
| MEDIA-CAPTION-ENTER-001 | follow-up-input | follow-up | yes | Typing `X` after Enter inserts `X` at the start of the new paragraph, before its right-text suffix, while the one media caption remains unchanged. | Input edits the caption or another block, creates media, loses text/selection, or becomes inert. | browser Playwright trusted keyboard input plus DOM/model assertions | `test: tooling/e2e/media-caption-enter.test.ts#Enter in an image caption splits the suffix into a following paragraph` | pass: paragraph becomes `X caption`, caption remains `Image`, and selection advances to `[3,0]` offset 1 |

Proof receipts:
| Case ID | Attempt | Claim | Command | Result | Ref | Input digest | Input count | Inputs | Host | Latest input mtime | Proof started | Proof ended | Retries | Receipt ID |
|---------|---------|-------|---------|--------|-----|--------------|-------------|--------|------|--------------------|---------------|-------------|---------|------------|
| MEDIA-CAPTION-ENTER-001 | 2 | completed | "bash" "-lc" "bun test packages/media/src/lib/BaseMediaPluginContracts.spec.ts && PLAYWRIGHT_BASE_URL=http://localhost:3000 pnpm e2e tooling/e2e/media-caption-enter.test.ts --project=chromium" | pass: exit 0 in 4127ms | dirty:168a4490e2ccf90dd9b1bd3230fb2f528460caa2 | sha256:9b7ac64d48a359fb502a9d716d2811916caf1e73ad42f95a305bfcd1ab894f11 | 12 | apps/www/src/registry/components/editor/caption.tsx,apps/www/src/registry/components/editor/media-image.tsx,apps/www/src/registry/components/editor/plugins.ts,apps/www/src/registry/examples/demo.tsx,apps/www/src/registry/examples/values/media-value.tsx,packages/media/dist/index.js,packages/media/dist/react/index.js,packages/media/package.json,packages/media/src/lib/BaseMediaPlugin.ts,packages/media/src/lib/BaseMediaPluginContracts.spec.ts,tooling/config/playwright.config.ts,tooling/e2e/media-caption-enter.test.ts | pid:53981;started:2026-08-26T08:22:13.000Z;base-url:http://localhost:3000;browser:chromium | 2026-08-26T08:25:04.592Z | 2026-08-26T08:26:22.960Z | 2026-08-26T08:26:27.087Z | 0 | sha256:4e920cd0a6f5cddf5faeca962f03ad79eee98c38ee596d8d4774d5c7164eab65 |

Affected corpus replay:
| Owner | Affected cases | Pre-edit baseline | Last owner edit | Combined command | Receipt input digest | Result |
|-------|----------------|-------------------|-----------------|------------------|----------------------|--------|
| `packages/media/src/lib/BaseMediaPlugin.ts` | MEDIA-CAPTION-ENTER-001 | red: corrected package test was 11/12 with `he\nllo` retained in the caption; corrected Chromium was 0/1 with `Image\n caption` retained in `figcaption` | 2026-08-26T08:14:00.000Z | `bash -lc "bun test packages/media/src/lib/BaseMediaPluginContracts.spec.ts && PLAYWRIGHT_BASE_URL=http://localhost:3000 pnpm e2e tooling/e2e/media-caption-enter.test.ts --project=chromium"` | sha256:9b7ac64d48a359fb502a9d716d2811916caf1e73ad42f95a305bfcd1ab894f11 | pass: receipt started after the final owner edit; package 12/12 and Chromium 1/1 |

Gate failure closure:
| Gate | Failure signal | Classification | Resolution | Final rerun |
|------|----------------|----------------|------------|-------------|
| Regression source/generated parity | Initial required workflow command failed because installed Regression mirrors still predated the source repair. | expected generated-mirror drift after editing the canonical rule; product code remained frozen. | Ran `pnpm install` to regenerate Codex/Claude skill mirrors, then reran the exact workflow proof. | pass: 50/50 Regression workflow tests and `sync-resources.mjs --check` pass |
| Regression validator test | The first focused validator run failed because `missingExpectedOutcomeAuthority` was wired to the wrong fixture helper. | workflow-test implementation error; product code remained frozen. | Moved the option to the selected-case fixture and reran the exact validator suite. | pass: 24/24 validator tests; final combined workflow proof is 50/50 |
| Full Media suite | The first full-suite run reported seven package-resolution errors while another Turbo command was rebuilding shared dependencies; the first post-reinstall retry then briefly lacked `node_modules/.bin/bun`. | local install/build-state race, matching repository reinstall guidance rather than product behavior. | Ran `pnpm run reinstall` once, waited for package links to materialize, then reran the exact package gate without a concurrent build. | pass: `pnpm --filter @platejs/media test` is 80/80 with 214 expectations |
| Browser proof host | The first Browser tab got `ERR_CONNECTION_REFUSED`; a direct `pnpm dev` attempt then found an already-starting Next process and exited on the dev lock. | proof-host readiness failure; product tests remained green. | Verified PID 53981 listening on port 3000 and route HTTP 200, then used a fresh Browser tab and reran the exact interaction. | pass: final Browser replay starts at caption offset 5 and ends in `X caption`, one media/caption, correct selection, focus retained, zero errors |
| Autogoal completion check | Initial final check reported the Goal-plan evidence and final phase as unresolved placeholders. | expected self-ledger preflight; all executable product and workflow gates were already green. | Recorded the semantic result, closed the final phase, and reran the exact checker. | pass: `[autogoal] complete: docs/plans/2026-08-25-media-caption-enter-regression.md` |

Failed fix history:
| Case ID | Attempt | Failure signal | Failure kind | Prior claim invalidated | Regression repair | Workflow test | Architecture trigger | Best API / layer plan | Resume state |
|---------|---------|----------------|--------------|-------------------------|-------------------|---------------|----------------------|-----------------------|--------------|
| MEDIA-CAPTION-ENTER-001 | 1 | After attempt 1 was claimed completed, the user corrected the intended result with screenshots: caption `he\|llo` must become caption `he` plus following paragraph `\|llo`, not one caption containing a soft break. | reporter-contradiction | yes: attempt-1 green runs, receipt `sha256:61b8ca145ad42df5f214e30a4b986e64a097abf8d7ceaa7a3891f0a3bc03f489`, local completion, stability, and handoff authority are revoked | repair-now: `.agents/rules/regression.mdc`, its methodology/template, and validator now require explicit positive expected-outcome authority; a negative report cannot choose an invented positive behavior | pass: 50/50 Regression contract tests include `a negative-only report cannot authorize an invented positive outcome`; generated mirrors and resource parity pass after `pnpm install` | yes: duplicated-live-identity remains the architecture trigger and this is attempt 2 | best-api: accepted the unchanged public `editor.update.break.insert()` call and hard-cut the caption soft-break mapping; plate-plan: accepted Media-owned downstream split conversion using the current root's schema default | reproduced: corrected package test is 11/12 red with `he\nllo`; corrected Chromium test is 0/1 red with `Image\n caption` remaining in `figcaption` |

Architecture pressure:
| Case ID | Failed fix count | Triggers | Verdict | Best API | Layer plan | Proof |
|---------|------------------|----------|---------|----------|------------|-------|
| MEDIA-CAPTION-ENTER-001 | 1 | duplicated-live-identity | escalate | required: best-api accepted no new public caption API, mode, plugin, UI handler, or Plite primitive. Keep the sole public call `editor.update.break.insert()` and delete the attempt-1 `tx.break.insertSoft()` mapping. | plate-plan: accepted `@platejs/media` ownership. Its `around(editorCommands.insertBreak)` calls downstream generic splitting, then extends that transaction to replace only the right split media with `tx.schema.createDefaultRootChild(selection.anchor.root)`, preserving its suffix children and selection path. Plite and registry UI stay unchanged. | accepted: generic Plite splitting correctly owns deletion/splitting/selection/history; Media alone knows duplicated media identity is invalid. The schema default avoids hardcoding `paragraph`, all five descriptor tests prove class breadth, and exact Chromium proves trusted Enter/focus/follow-up. |

Proof-host readiness:
| Case ID | Source owner | Runner / route / host | Freshness evidence | Generated/export boundary | Result |
|---------|--------------|-----------------------|--------------------|---------------------------|--------|
| MEDIA-CAPTION-ENTER-001 | `packages/media/src/lib/BaseMediaPlugin.ts`; route fixture `apps/www/src/registry/examples/values/media-value.tsx` | Bun package test; current-source `apps/www` dev process; `/blocks/media-demo`; Playwright Chromium and in-app Browser | Rebuilt `@platejs/media`; final PID 53981 started after the last source edit; warmed `/blocks/media-demo`; receipt binds host start, base URL, and 12 inputs. | Package source owns behavior; receipt includes Media source and rebuilt `dist`; no generated registry or template file was hand-edited. | pass: final receipt and fresh Browser reload observe current source |

Patch delegation:
| Case ID | Red test | Allowed owner/files | Required proof/stability | Patch return evidence | Result |
|---------|----------|---------------------|--------------------------|-----------------------|--------|
| MEDIA-CAPTION-ENTER-001 | Corrected package red: attempt-1 soft break produced caption `he\nllo` and no paragraph. Corrected browser red: trusted Enter produced `Image\n caption` in `figcaption`. | `packages/media/src/lib/BaseMediaPlugin.ts`, `packages/media/src/lib/BaseMediaPluginContracts.spec.ts`, `tooling/e2e/media-caption-enter.test.ts`, amended `@platejs/media` changeset, and this transient plan. | Corrected package red/green; non-media fallthrough control; trusted Enter on `/blocks/media-demo`; model, DOM/native, focus, errors, follow-up input; five retry-free warm runs; final receipt; review gate. | Owner: shared Media command contribution. Root cause: generic hard break correctly split text but copied the media wrapper; attempt 1 wrongly replaced it with a caption soft break. The accepted fix keeps the generic split and changes only its right media copy into the schema-default root paragraph. Source/test/browser fingerprints: `f214b9d5cddc1e9d1fae536e3590b9ea1b1f096644f3e54739b7e6044497c63e`, `2e67b678429a39ce708344806e56475a8f2713e82cd27ed724a60605dc4ae694`, `4188f2aead1cf16affb87601fd5227eb790844be73f7c6375d8538d03ab6189e`. | complete: one-case Patch returned all required evidence |

Stability:
| Case ID | Executable proof / host | Required runs | Results | Retry count | Decision |
|---------|-------------------------|---------------|---------|-------------|----------|
| MEDIA-CAPTION-ENTER-001 | `PLAYWRIGHT_BASE_URL=http://localhost:3000 pnpm e2e tooling/e2e/media-caption-enter.test.ts --project=chromium`; fresh page per execution | 5 | run 1 pass 1/1; run 2 pass 1/1; run 3 pass 1/1; run 4 pass 1/1; run 5 pass 1/1 | 0 | pass: keep; final receipt adds another 1/1 execution on the attested host |

Packet decisions:
| Case | Executable evidence | Decision | Claim width | Residual risk | Next owner |
|------|---------------------|----------|-------------|---------------|------------|
| MEDIA-CAPTION-ENTER-001 | Package 12/12 focused, Media 80/80, Chromium 1/1 final receipt, five-run stability, clean Browser route | keep; locally completed | Local desktop browser caption Enter only; no integration, release, or exact-Chrome claim | No accepted local product risk. Hosted CI and release state remain unverified. | User/local integrator |

Methodology deltas:
| Case | Miss or owner checked | Decision | Durable owner/change | Focused proof | Trigger/result |
|------|-----------------------|----------|----------------------|---------------|----------------|
| MEDIA-CAPTION-ENTER-001 | Attempt 1 inferred a soft break from a negative-only duplication report; the positive target had no reporter or accepted-law authority. | repair-now | `.agents/rules/regression.mdc`, methodology, template, validator, and validator test require `Expected-outcome authority` and stop ambiguous negative-only cases as `needs-oracle`. | pass: 50/50 workflow tests, generated Regression/Patch mirror equality, and resource parity after `pnpm install` | Reporter correction supplied the missing authority; corrected red proof and accepted Best API / Plate plan preceded the completed attempt-2 patch |

Workflow slowdowns:
| Step / command | Owner | Elapsed / expected | Cause | Evidence value | Repair/result |
|----------------|-------|--------------------|-------|----------------|---------------|
| Full Media suite | Package proof | one failed run plus one transient retry | A concurrent Turbo build changed shared package resolution; immediately after the required reinstall, the Bun link had not materialized yet. | High: the exact package gate had to close on stable install state. | Serialized commands, ran the repo-authorized reinstall once, then exact rerun passed 80/80. |
| Browser host startup | Next dev host | one refused navigation and one dev-lock exit | The first Browser navigation raced server startup; a second `pnpm dev` saw PID 53981 already owning the app lock. | High: target-route proof requires an attested live host. | Verified listener plus HTTP 200, opened a fresh tab, and completed the route interaction without errors. |
| Browser keyboard target | In-app Browser | one locator mismatch plus one ineffective CUA key sequence | Caption clicks focus the contenteditable editor root rather than `figcaption`; raw CUA arrows did not move the selection. | Medium: trusted input still had to start at exact caption offset 5. | Used the focused editor-root locator for trusted arrows, Enter, and typing; read-only selection checks prove paths and offsets. |
| Regression mirror generation | Workflow proof | one expected sync cycle | Canonical Regression sources changed while installed mirrors still held the old contract. | High: the repair is not durable until every agent surface agrees. | `pnpm install`, 50/50 workflow tests, and resource parity pass. |

Findings:
- The MP4 shows a collapsed caption caret at the start of `Image caption` and a
  second copied image immediately after Enter.
- Every media plugin is a non-void `schema.element.textBlock`; default
  `insertBreak` splits that block and therefore copies media properties.
- Attempt 1 suppressed duplication by mapping Enter to `insertSoft`, but the
  reporter-authorized outcome is a following paragraph, not a multiline caption.
- The corrected red proves that mistake directly: package state is `he\nllo`
  inside the caption and Chromium renders `Image\n caption` in `figcaption`.
- `@platejs/media` is the narrow owner that knows a copied right-hand media is
  invalid. Generic Plite still owns split, deletion, selection, and history.

Timeline:
- 2026-08-26: loaded Regression methodology and Autogoal/Patch contracts,
  created the attempt-2 goal, rebuilt the oracle from the latest screenshots,
  and revoked the attempt-1 receipt and completion claim.
- 2026-08-26: repaired Regression's negative-only-report gap with explicit
  positive expected-outcome authority, regenerated mirrors, and passed 50/50
  workflow tests plus resource parity.
- 2026-08-26: recorded corrected package and Chromium red proof, then closed the
  architecture trigger through Best API plus a quick Plate plan.
- 2026-08-26: implemented the Media-owned downstream split conversion, proved
  all five media types plus ordinary-block fallthrough, passed five warm
  Chromium runs and clean Browser replay, captured the attempt-2 receipt, and
  closed package/release hygiene.

Decisions and tradeoffs:
- Keep the direct-caption architecture and intercept the media command in the
  package owner. A UI `onKeyDown` workaround would duplicate model policy and
  fail non-React command callers.
- Preserve generic Plite `insertBreak` for deletion, splitting, selection, and
  history. Media extends that transaction and replaces only the right copied
  media with `tx.schema.createDefaultRootChild(selection.anchor.root)`, keeping
  its suffix children and mapped selection.
- Do not hardcode `paragraph`, add a caption mode/API, alter Plite, or patch the
  registry UI. Node selections and non-media blocks fall through unchanged.

Review fixes:
- Manual scoped review found the public `defineMediaPlugin` JSDoc omitted its
  caption-editing responsibility; updated it before the final build and receipt.
- Manual product P1 review accepted the schema-default paragraph conversion,
  same-media selection gate, downstream transaction reuse, and five-descriptor
  coverage. No public editor call shape changed.
- Manual agent-native review accepted canonical source ownership, validator
  enforcement, regenerated mirrors, and discoverability with no P1 finding.
- `autoreview` was not invoked because the current branch is `next`, where root
  instructions prohibit it. No accepted P1 finding remains.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Validator regression used the option in the wrong fixture | 1 | Move the option to the selected-case fixture and rerun the exact suite. | Validator 24/24 and combined workflow 50/50 pass. |
| Full Media suite raced a concurrent dependency build | 1 | Stop concurrent proof, run the repo reset command once, and serialize the exact rerun. | Full Media suite passes 80/80 with 214 expectations. |
| First post-reinstall Media retry briefly lacked the Bun link | 1 | Wait for package links to finish materializing, then repeat the same gate. | Exact full-suite rerun passes. |
| First Browser tab hit a stopped host | 1 | Re-establish a listener and use a fresh tab rather than reusing the net-error document. | PID 53981 serves HTTP 200; final Browser replay passes. |
| Direct dev restart collided with the already-starting Next process | 1 | Keep the existing current-source PID after verifying its start time and route. | Receipt attests PID 53981 and base URL. |
| Caption locator did not own keyboard focus | 1 | Send trusted keys through the focused editor root after clicking the caption. | Browser starts at `[2,0]` offset 5 and ends at `[3,0]` offset 1 after typing. |
| Stale-claim audit used unsafe shell quoting for backticks and `\n` | 1 | Retry with separate single-quoted `rg -e` patterns. | Audit completed; only the intentionally revoked attempt-1 receipt and historical soft-break references remain. |

Verification evidence:
- Corrected pre-fix focused package: 11 pass, 1 fail, 58 expectations; received
  `he\nllo` in the caption instead of caption `he` plus paragraph `llo`.
- Corrected pre-fix Chromium: 0/1; received `Image\n caption` in `figcaption`
  instead of caption `Image` plus paragraph ` caption`.
- Final focused package: 12/12, 67 expectations.
- Final full `@platejs/media` suite: 80/80, 214 expectations.
- Source-first Media typecheck: 12/12 Turbo tasks.
- Media package build: pass; final receipt binds rebuilt `dist`.
- Changed TypeScript Ultracite: pass on all three files; `git diff --check`: pass.
- Changesets status: pass; existing `@platejs/media` major changeset now states
  that Enter splits captions into a following paragraph without duplication.
- Chromium stability: five separate 1/1 passes, zero retries.
- In-app Browser after final reload: starts at caption `[2,0]` offset 5; after
  Enter and `X`, one target image/caption remains, caption is `Image`, paragraph
  is `X caption`, selection is `[3,0]` offset 1, focus remains, and errors are 0.
- Regression workflow: 50/50 tests plus generated-resource parity pass.
- Final receipt: package 12/12 plus Chromium 1/1, zero retries, 12 inputs,
  receipt `sha256:4e920cd0a6f5cddf5faeca962f03ad79eee98c38ee596d8d4774d5c7164eab65`.

Final handoff:
- executable cases: MEDIA-CAPTION-ENTER-001 completed; exact package and browser
  tests own the behavior.
- cumulative reporter evidence, phase-specific oracles, and forbidden states:
  base request/MP4 plus latest correction/screenshots map to model, DOM/native,
  focus, errors, and follow-up tests; popup and geometry are inapplicable.
- failed-fix invalidation and automatic repair: attempt-1 completion, stability,
  and receipt are revoked. Regression now requires positive expected-outcome
  authority; its executable workflow repair and generated mirrors pass.
- proof receipts and affected-corpus replay: completed receipt and digest above;
  combined replay began after the last shared-owner edit.
- started-gate failure closure: repaired workflow mirrors, package install,
  full Media suite, host readiness, Playwright, and Browser gates all pass.
- changed files: `packages/media/src/lib/BaseMediaPlugin.ts`, its contract test,
  `tooling/e2e/media-caption-enter.test.ts`, `.changeset/media-v54-runtime.md`,
  Regression source/methodology/template/validator/test and regenerated skill
  mirrors, plus this transient plan.
- design decisions: Media keeps the generic Plite hard split, then converts only
  the right copied media into the current root schema's default paragraph;
  Plite and registry UI remain unchanged.
- tests and proof: focused 12/12, full Media 80/80, typecheck/build/lint pass,
  five-run stability, clean Browser proof, completed receipt.
- source/generated sync: Regression source changed; `pnpm install`, 50/50 tests,
  and resource parity prove generated mirrors are exact. No barrel, export,
  registry source, or template output was hand-edited.
- P1 and agent-native findings: `autoreview` is prohibited on `next`; manual
  product and agent-native P1 reviews are clear after the JSDoc correction.
- residual risks and next owner: no accepted local product risk. User/local
  integrator owns commit, hosted CI, integration, and release proof.
- local completion status and integration/public-status boundary: locally
  completed on dirty `168a4490e2ccf90dd9b1bd3230fb2f528460caa2`, uncommitted
  and unpushed; not integrated, shipped, released, or publicly closed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | one-case Regression packet locally completed |
| Where am I going? | final semantic and Autogoal mechanical checks, then local handoff |
| What is the goal? | Split a media caption at Enter into caption-left and following-paragraph-right without duplicating media. |
| What have I learned? | The generic split owns correct text, selection, and history behavior; Media must replace only the invalid copied wrapper on its right side. |
| What have I done? | Repaired the false oracle, fixed the Media command owner, proved exact red/green and five-run stability, verified the Browser route, and captured an attempt-2 receipt. |

Open risks:
- No accepted local product risk remains.
- Hosted CI, integration, release, and public status are outside this local,
  uncommitted/unpushed proof boundary.
