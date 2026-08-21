# Stale selection geometry after font-size change

Objective:
Repair #5091 at the durable selection/render owner and prove the exact
Playground 16 -> 10 font-size flow in five retry-free Chromium runs.

Flow mode:
one-shot execution

Goal plan:
docs/plans/5091-stale-selection-geometry-after-font-size-change.md

Template:
docs/plans/templates/regression.md

Primary template:
docs/plans/templates/regression.md

Applied packs:
- none

Regression source:
- target: GitHub #5091, the second AI bullet in the Playground
- case: `plate-5091-font-size-selection-geometry`
- source owner: Plite DOM native selection projection plus the Plite React
  post-commit selection lifecycle; font descriptors own mark targeting
- tested boundary: branch `next`, base
  `1fb72c581095f23ddba3f597f41e8b10608283ef`, dirty, uncommitted, unpushed
- proof host: a new local source-built www server on port 3021 and sequential
  fresh Chromium Playwright workers
- invocation mode: one-shot

First checkpoint:
- The exact report, best-long-term-fix requirement, five-run threshold,
  local-comment requirement, no-lint/no-Autoreview constraint, no-public-label
  boundary, and dirty-work preservation rule were captured before the repair.
- `.agents/skills/regression/references/methodology.md` was loaded completely.
- No sidecar case registry or duplicate behavior ledger was created.

Completion threshold:
- The exact 16 -> 10 flow has executable pixel-level proof that is red before
  the owner repair and green after it.
- The final issue-owned product and proof bytes pass five sequential fresh
  Chromium runs with no retry.
- Focused Plite DOM, Plite React, and Core contracts and source-first
  typechecks pass.
- The local case and Regression run are `completed`; commit, push, integration,
  shipment, public issue completion, and the `completed` label stay separate.
- The required truthful GitHub status comment is posted while the issue remains
  open and unlabeled `completed`.
- Every canonical checklist and completion gate resolves and
  `check-complete.mjs` passes.

Verification surface:
- `tooling/e2e/font-size-selection.test.ts` on `/blocks/playground`
- `packages/plite-dom/test/dom-coverage.ts`
- Plite React selection runtime, controller, DOM-coverage, and post-commit
  contracts
- Core leaf font-style injection contract
- source-first Core, Plite DOM, and Plite React typechecks
- five fresh Chromium runs after the last issue-owned byte
- final source hashes and live GitHub issue state

Constraints:
- Executable tests own behavior; GitHub owns public issue status.
- Fix the shared lifecycle owner, not the toolbar symptom.
- Preserve unrelated and prior dirty work.
- Do not edit generated registry or template output.
- Do not lint or run Autoreview in this session.
- Do not commit, push, create a PR, close the issue, or add `completed`.
- A local proof-complete case is locally `completed`, but publicly remains an
  unpushed candidate.

Boundaries:
- source: shared Plite DOM/React selection projection and source registry font
  descriptors only
- proof: focused package contracts plus exact source-built Chromium replay
- generated output: untouched; registry source metadata only
- browser claim: local Chromium on the exact Playground flow
- public mutation: one status comment only; issue stays open and unlabeled
- writer ownership: one main-thread writer; no subagents

Output budget strategy:
- Exact-file reads, focused tests, capped logs, and no generated-tree scans.

Blocked condition:
- Block only if the current behavior or authoritative host cannot be observed,
  user authority is required, or no safe alternate proof exists.
- Stale servers and broken commands are repaired and rerun on a fresh host.

Regression state:
- current phase: closure
- current executable case: `plate-5091-font-size-selection-geometry`
- current case status: completed locally
- next owner: pushed-ref replay when the user pushes the checkout
- goal status: complete after this plan gate passes

Completion rule:
- Local completion requires exact green replay, stability, fingerprints, and a
  resolved plan; pushed/integrated/shipped claims require their own evidence.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured | yes | Exact report, durable fix, 5/5, GitHub comment, no lint, no Autoreview, and no push were recorded before edits. |
| Regression methodology loaded | yes | Regression methodology was read completely on 2026-08-19. |
| Active goal checked or created | yes | One issue-specific goal and this ticket-prefixed plan own the run. |
| Current source owner and tested ref recorded | yes | Shared Plite selection projection at base `1fb72c581095f23ddba3f597f41e8b10608283ef`; final state is dirty and unpushed. |
| Executable test cases discovered | yes | One atomic case, `plate-5091-font-size-selection-geometry`. |
| Route/proof-host readiness plan recorded | yes | Source-built `/blocks/playground`, fresh port 3021, sequential Chromium workers. |
| Patch delegation boundary recorded | yes | The single normalized case stayed within the proven shared owner and focused proof files. |
| Orchestrator writer ownership recorded | no | Single-thread execution; no orchestrator or subagents. |
| Output budget strategy recorded | yes | Exact files, focused commands, and capped output. |
| Claim width and blocked rules recorded | yes | Local candidate only; open issue and no `completed` label until pushed-ref replay. |

Work Checklist:
- [x] Regression supervised one normalized Patch case.
- [x] Every explicit requirement and boundary was captured before mutable work.
- [x] Objective, threshold, verification, constraints, boundaries, output
      budget, and blocked condition are concrete.
- [x] Source owner, base ref, dirty boundary, runner, route, host, and freshness
      method are recorded.
- [x] A stale shared server was rejected and final proof restarted on fresh port
      3021.
- [x] The case records source, owner, setup, action, expected result, test,
      tested boundary, and stability threshold.
- [x] The smallest falsifying browser probe measured stale painted geometry.
- [x] Exact reproduction separated correct DOM Range geometry from stale Blink
      selection paint.
- [x] The executable browser oracle was red before the owner repair.
- [x] Only one normalized case entered the Patch implementation loop.
- [x] Patch returned the root cause, shared owner, files, red/green evidence,
      fingerprints, stability, architecture verdict, and caveat.
- [x] Focused package proof and exact final fresh-host replay passed.
- [x] Five sequential runs passed with zero retry.
- [x] The case was kept and marked `completed` locally.
- [x] No TSV, JSON case manifest, database, or duplicate behavior ledger was
      created.
- [x] One main-thread writer owned shared state and the proof host.
- [x] The stale-host slowdown was repaired by using a unique fresh port.
- [x] Methodology decision is `repair-now`: compare painted selection pixels
      against an unselected computed-style clone, not Range width alone.
- [x] Public wording says local, uncommitted, and unpushed; it does not claim
      integration or shipment.
- [x] The local case and run are `completed`; pushed/public status is recorded
      separately.
- [x] Final handoff records tests, decision, ref, proof, review exclusions,
      risks, and next owner.
- [x] Output remained focused on exact files and commands.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named completion threshold | yes | Close the selected executable case | Exact case passed five sequential fresh Chromium runs with zero retry. |
| Current-source readiness | yes | Record owner and tested boundary | Shared Plite DOM/React owner; base `1fb72c581095f23ddba3f597f41e8b10608283ef`; dirty, uncommitted, unpushed. |
| Route/proof-host readiness | yes | Prove current source on a fresh host | New www process on port 3021 served `/blocks/playground`; all final runs used it. |
| Executable regression coverage | yes | Record red and green browser proof | The pixel oracle measured +127.703125px stale paint before the fix and correct resized paint after it. |
| Smallest-probe closure | yes | Identify the violated invariant | Native Range was already correct; Blink's painted selection retained old geometry. |
| Patch delegation closure | yes | Return one-case architecture evidence | Centralized range replacement and post-commit expanded-selection export own the repair. |
| Focused verification closure | yes | Run owner tests and exact replay | Focused DOM/React/Core tests and exact Chromium replay pass. |
| Stability closure | yes | Run five times without retry | 5/5 sequential final runs, zero retry. |
| Packet decision closure | yes | Keep or reject the case | Kept as durable executable coverage. |
| Local completion status | yes | Separate local and pushed state | Case and run are locally `completed`; checkout is uncommitted and unpushed. |
| No duplicate registry | yes | Avoid a manual behavior database | The Playwright/package tests are the only durable behavior records. |
| Generated/source and host repair | yes | Preserve generated boundaries and repair host freshness | No templates or generated registry output changed; stale port 3014 proof was discarded and restarted on 3021. |
| Orchestrator writer closure | no | Keep one writer | Main thread alone wrote code and used the final host. |
| Workflow slowdown closure | yes | Repair stale/noisy proof paths | Final stability restarted from run 1 on the fresh unique server. |
| Methodology delta closure | yes | Resolve the test-oracle change | `repair-now`: pixel-diff against an unselected clone detects compositor-only stale paint. |
| Source/generated sync | no | Sync only changed agent sources | No agent source or generated-output contract changed. |
| Agent-native review | no | Review changed agent workflows only | No agent workflow changed. |
| Final handoff contract | yes | Record proof, status, risks, and next owner | This plan and the GitHub comment record the full local-only boundary. |
| Autoreview | no | Respect direct user instruction | Autoreview was explicitly forbidden for this session. |
| Goal plan complete | yes | Run `check-complete.mjs` | This command is the final local closure gate. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Requirement extraction and goal setup | completed | Exact constraints captured | owner audit |
| Current source and proof-host readiness | completed | Source-built route and base ref recorded | case probe |
| Executable case discovery and selection | completed | One atomic issue case | red proof |
| Smallest high-value probe | completed | Pixel oracle exposed +127.703125px stale paint | classify |
| Reproduce, classify, and red test | completed | Correct Range, stale Blink paint | patch |
| One-case Patch delegation | completed | Shared DOM/React selection owner repaired | verify |
| Focused verification and stability | completed | Package proof plus 5/5 Chromium | keep |
| Keep/revert/quarantine | completed | Kept | methodology |
| Methodology repair/no-change/defer | completed | Paint-pixel oracle retained | handoff |
| Reviews and final handoff | completed | No lint/Autoreview by instruction; truthful GH comment posted | plan check |
| Final goal-plan check | completed | `check-complete.mjs` is the closing command | pushed-ref replay later |

Selected executable cases:
| Case ID | Source reference | Test file / command | Status | Tested ref | Next owner |
|---------|------------------|---------------------|--------|------------|------------|
| `plate-5091-font-size-selection-geometry` | GitHub #5091 and Felix's 2026-08-17 contradiction | `tooling/e2e/font-size-selection.test.ts` | completed locally | dirty boundary on `1fb72c581095f23ddba3f597f41e8b10608283ef` | pushed-ref replay |

Proof-host readiness:
| Case ID | Source owner | Runner / route / host | Freshness evidence | Generated/export boundary | Result |
|---------|--------------|-----------------------|--------------------|---------------------------|--------|
| `plate-5091-font-size-selection-geometry` | Plite DOM/React selection projection | Playwright Chromium, `/blocks/playground`, port 3021 | New dev process and fresh worker per sequential run | Source registry only; no generated output | pass |

Patch delegation:
| Case ID | Red test | Allowed owner/files | Required proof/stability | Patch return evidence | Result |
|---------|----------|---------------------|--------------------------|-----------------------|--------|
| `plate-5091-font-size-selection-geometry` | Painted width exceeded resized text by 127.703125px | Plite DOM/React selection runtime, font descriptors, focused tests | exact replay plus 5/5 | root cause, shared owner, contracts, hashes, and caveats recorded | kept |

Stability:
| Case ID | Executable proof / host | Required runs | Results | Retry count | Decision |
|---------|-------------------------|---------------|---------|-------------|----------|
| `plate-5091-font-size-selection-geometry` | `PLAYWRIGHT_BASE_URL=http://localhost:3021 pnpm exec playwright test --config tooling/config/playwright.config.ts --project=chromium tooling/e2e/font-size-selection.test.ts` | 5 | pass, pass, pass, pass, pass | 0 | completed locally |

Packet decisions:
| Case | Executable evidence | Decision | Claim width | Residual risk | Next owner |
|------|---------------------|----------|-------------|---------------|------------|
| `plate-5091-font-size-selection-geometry` | Exact pixel-level browser test and focused package contracts | keep | local Chromium candidate | Pushed ref has not been replayed | pushed-ref verifier |

Methodology deltas:
| Case | Miss or owner checked | Decision | Durable owner/change | Focused proof | Trigger/result |
|------|-----------------------|----------|----------------------|---------------|----------------|
| `plate-5091-font-size-selection-geometry` | Range geometry alone missed compositor paint | repair-now | Compare real selected pixels with an offscreen unselected style clone | Exact E2E fails on stale paint and passes on repaired paint | The earlier focus-only claim was reporter-invalidated |

Workflow slowdowns:
| Step / command | Owner | Elapsed / expected | Cause | Evidence value | Repair/result |
|----------------|-------|--------------------|-------|----------------|---------------|
| Final stability on shared port 3014 | proof host | one discarded navigation timeout | stale shared server | none | Restarted on unique port 3021 and reset the count to 0/5 |

Findings:
- The earlier toolbar-focus diagnosis was wrong. Font marks and DOM Range
  geometry updated correctly, while Blink retained native selection paint at
  the previous width.
- Replacing the Range, forcing layout, delaying, probing, and remounting did not
  repair the paint. A direction-preserving one-character `Selection.modify`
  nudge did.
- The durable invariant is that a document change with an unchanged expanded
  model selection re-exports that selection after React commit/browser paint.
- Native range replacement and direction restoration now have one Plite DOM
  owner. Already-focused `DOMEditor.focus()` no longer overwrites the repair.
- Font marks target text leaves. The registry descriptors no longer claim
  paragraph-only scope.

Timeline:
- 2026-08-19: selected live #5091 and treated Felix's contradiction as
  invalidating the earlier proof.
- 2026-08-20: reproduced stale paint, classified the shared owner, repaired the
  runtime, added durable tests, passed final 5/5, and posted the local-only
  GitHub update.

Decisions and tradeoffs:
- Rejected another toolbar focus patch because it cannot govern compositor
  selection geometry.
- Rejected element remounts, waits, forced layout reads, and probe ranges
  because they hide the symptom or failed exact reproduction.
- Chose a shared Plite lifecycle repair: post-commit model export plus a
  Blink-only painted-geometry refresh that preserves forward/backward direction.
- Kept the API internal. This repairs runtime law without adding public
  application machinery.

Review fixes:
- Autoreview: N/A by direct user instruction.
- Lint: N/A by direct user instruction during the linter migration.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Reuse old focus-only diagnosis | 1 | Measure native Range and painted pixels separately | Proved compositor paint was the stale layer. |
| Range replacement/layout/remount/delay probes | 1 investigation set | Exercise the native focus endpoint | `Selection.modify` inward/outward refreshed paint. |
| Final run on shared port 3014 | 1 | Start a unique fresh server | Port 3021 passed 5/5 from a reset count. |

Verification evidence:
- Red: exact 16 -> 10 flow left 127.703125px of painted highlight beyond the
  resized text while the DOM Range width was correct.
- Green stability: the exact Playwright command above passed five sequential
  fresh Chromium runs after the last issue-owned proof byte, with zero retry.
- `bun test ./packages/plite-dom/test/dom-coverage.ts`: 24 pass, 0 fail.
- `bun test ./packages/plite-react/test/selection-runtime-contract.test.ts`:
  21 pass, 0 fail.
- Focused Plite React controller, DOM-coverage, and post-commit export contracts
  each pass.
- Core active-font leaf style contract passes.
- `pnpm turbo typecheck --filter=./packages/plite-dom --filter=./packages/plite-react --filter=./packages/core`:
  12 tasks successful.
- Strict `pnpm check:plite` reached 1052 passing tests and one unrelated
  concurrent leaf-DOM-identity failure; it is not used to widen this claim.
- Public update: https://github.com/udecode/plate/issues/5091#issuecomment-5349172493

Final fingerprints:
- `tooling/e2e/font-size-selection.test.ts`:
  `f55c6b3fb18e79a191130ebb05a8a14bd0161181038f60bab52b709bf9e1d459`
- `packages/plite-dom/src/utils/dom.ts`:
  `9af6dbe214eac01269aff0656b9efdd9c8a58b6caff4c09ec610fcc97d68a604`
- `packages/plite-dom/src/plugin/dom-editor.ts`:
  `3f79e30bb85ec87399d920dff2cf0adc8e6edb6cbc3cef10703e1a2cf4f288fd`
- `packages/plite-react/src/editable/editable-dom-runtime.ts`:
  `5b2b32bb512d23bba6fa6a3060a79d1a8788760ef6f4c1f3aaa8afc21b663469`
- `packages/plite-react/src/editable/selection-controller.ts`:
  `235a66db3e27e3256aa80df993fbbbdf787c3c42655b9dd82bc068d242ce3377`
- `packages/plite-react/src/editable/selection-runtime.ts`:
  `a9fd852b81f066303e520b1eca603d6141b9df3f8fb61f2cd993445ae467a12b`
- `apps/www/src/registry/components/editor/font.tsx`:
  `99938811da2e97f5c770aada99dc393896961ba8cc55b9b2825d137d3a2c998d`
- `.changeset/plite-react-read-only-provider.md`:
  `3196be3929adbdb369ce783cd3b452fc17d79bacaca8889b09eaa8004b4398e1`

Final handoff:
- executable case: exact Playground 16 -> 10 font-size selection flow
- root cause: stale Blink selection paint after an expanded document-property
  update, not missing toolbar focus
- fix: shared native range writer, after-paint expanded-selection export,
  direction-preserving Blink refresh, no redundant refocus rewrite, and correct
  font mark targeting
- proof: exact red, focused package green, source-first typechecks, final 5/5
- sync/review: no agent sync; lint and Autoreview excluded by user instruction
- status: local case and run `completed`; checkout uncommitted and unpushed;
  GitHub issue open with no `completed` label
- next owner: replay exact test on the final pushed ref, then update the public
  status and label if still green

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Local Regression closure for #5091. |
| Where am I going? | Pushed-ref replay after the user pushes this checkout. |
| What is the goal? | Keep the local case complete without overstating public integration. |
| What have I learned? | Blink paint can remain stale when the Range is already correct; lifecycle re-export plus focus-endpoint refresh owns it. |
| What have I done? | Reproduced, repaired the shared owner, added executable coverage, passed 5/5, and posted the truthful local-only update. |

Open risks:
- The repair is proved only in local Chromium. It is neither pushed nor
  integrated, so the public issue remains open and unlabeled `completed`.
- Shared registry index files contain concurrent dirty work; this packet did
  not claim exclusive ownership of their full-file diffs.
