# plite-current-tree-stable-behavior-automation

Objective:
Close the current Plite tree, prove stable editor behavior, strengthen
selection oracles, validate `plite-browser` proof coverage, scope raw-mobile
claims, and smoke huge-document correctness without starting broad pagination
architecture.

Completion threshold:
Done when the current Plite tree has no stale dirty fixes, fake aliases,
docs/API mismatch, or orphan tests in the touched surface; stable behavior
proof is run for the requested families; visual/native selection and
huge-document oracles are repaired; repeated browser proof either promotes to
`plite-browser` or is explicitly not needed; raw mobile proof is run or scoped;
changed-list, workflow slowdowns, needs-attention, and stopping checkpoints are
filled; and `check-complete` passes.

Verification surface:
- `.tmp/plite` source, examples, Playwright tests, and package tests.
- Stable examples: richtext, plaintext, markdown shortcuts, selection,
  editable voids, placeholder, hidden content, and DOM coverage boundaries.
- Package/API proof: `plite-react`, `plite-browser`, `plite-history`, final
  `bun check`.
- Raw-mobile proof: `bun test:mobile-device-proof:raw`; viewport proof cannot
  satisfy raw Android/iOS claims.
- Parent repo proof: this plan only.

Constraints:
- Plite is continuous private alpha. No release, publish, changeset, PR, or
  commit readiness was raised.
- Behavior proof outranks perf. No broad pagination/virtualization architecture
  was started.
- Do not patch Plate for a Plite-v2-only loop.
- Do not leave test-only dirty fixes that are not the real runtime owner.

Boundaries:
- Edits stayed in `.tmp/plite` runtime/tests/examples and this parent
  `docs/plans/**` file.
- No `.agents/**`, rules, templates, benchmarks, or Plate package work changed.
- `plite-browser` was verified but not changed because existing helpers covered
  this proof.

Blocked condition:
No hard blocker remains for this loop. Raw-mobile proof is explicitly stopped
until a real device/Appium artifact exists. Autoreview is a review checkpoint
before commit, not a blocker for this proof loop.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements copied first | yes | Scope, non-goals, stop conditions, handoff sections, stable families, selection oracle, `plite-browser`, mobile, and huge-doc requirements are represented in this plan. |
| Active goal created | yes | Goal `019e6aa0-8ace-7e73-b0e9-166d6fbc4a30` tracks this slate-automation run. |
| Invocation mode recorded | yes | Full-loop mode; no timebox in the latest prompt. |
| Private alpha boundary recorded | yes | No release/publish/changeset/PR language in handoff. |
| Dynamic checkpoints allowed | yes | Runtime checkpoints changed after evidence: stale residue patch was cut; raw mobile became an explicit stopped claim. |

Work Checklist:
- [x] Prompt requirements were copied into checkable checkpoints before work.
- [x] Current tree/API/docs/test alias coherence was audited.
- [x] Stable editor behavior sweep was run for requested families.
- [x] Selection oracle was upgraded with visual/native/caret proof.
- [x] Missing huge-document oracle was added and verified.
- [x] Runtime duplicate insertion bug was fixed at the real owner.
- [x] Stale dirty experiment was removed.
- [x] `plite-browser` helper promotion was evaluated and verified.
- [x] Raw-mobile proof command was run and claim width recorded.
- [x] Huge-document correctness smoke was run.
- [x] Perf was marked N/A because correctness was the requested scope.
- [x] Workflow slowdowns were logged.
- [x] Changed files list was recorded.
- [x] Needs-your-attention list was recorded.
- [x] Stopping checkpoints were recorded.
- [x] Final `bun check` passed.
- [x] Agent-native review was marked N/A because no agent/tooling files changed.
- [x] Autoreview was deferred to pre-commit review because no commit was requested.

Completion Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Named verification threshold | yes | Stable browser sweeps, huge-doc smoke, package tests, raw-mobile gate, `plite-browser` proof, build, and final `bun check` ran. |
| Behavior gates | yes | Chromium stable sweep passed `200 passed, 5 skipped`; Firefox/WebKit focused sweep passed `105 passed, 35 skipped`. |
| Visual/native selection proof | yes | Richtext multi-leaf right-margin click oracle passed; huge virtualized insert-break browser proof passed. |
| Missing oracle repair | yes | Added right-margin multi-leaf oracle, huge select-all paste/undo oracle, and DOM-repair virtualized target contract. |
| `plite-browser` promotion | yes | No new helper needed; `plite-browser` selection/proof tests and typecheck passed. |
| Mobile/raw-device claim width | yes | Raw-mobile command failed closed without real proof artifact, so no raw mobile claim is made. |
| Huge-document smoke | yes | Focused huge-document smoke passed `10 passed`. |
| Package/API proof | yes | Alias cut, runtime fix, focused contracts, `plite-react` build/typecheck, and final `bun check` passed. |
| Skill/rule sync | N/A | No `.agents/**` or source-rule files changed. |
| Autoreview | deferred | Not run in this proof loop; queue it before commit if desired. |
| Goal plan complete | yes | This plan is complete and ready for `check-complete`. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero | complete | Prompt scope and final handoff requirements captured. | closed |
| Current-tree closure | complete | Removed `unstableBoundary` public alias and migrated tests/example. | closed |
| Behavior proof | complete | Stable Chromium and Firefox/WebKit sweeps passed. | closed |
| Selection oracle | complete | Added multi-leaf right-margin native/caret proof. | closed |
| Runtime repair | complete | Fixed beforeinput duplicate insert in huge virtualized route. | closed |
| Stale-fix cleanup | complete | Removed pending model-owned residue experiment and tests. | closed |
| plite-browser | complete | Existing helpers verified; no promotion needed. | closed |
| Mobile/raw-device | complete | Raw proof stopped without artifact; claim scoped. | closed |
| Final handoff | complete | Changed list, slowdowns, attention, stop checkpoints recorded. | final |

Packet Ledger:
| Packet | Decision | Evidence |
|--------|----------|----------|
| API alias cleanup | keep | `EditableElementSlots.unstableBoundary` removed; surface guard leaves only negative assertions. |
| Right-margin multi-leaf selection oracle | keep | Richtext Playwright test checks model selection, DOM caret, typed text, and visual caret. |
| Huge select-all paste/undo oracle | keep | Huge-doc Playwright test replaces a huge selection, then undo restores block texts and selection. |
| Huge virtualized insert-break bug | keep | Fixed duplicate `d/e/f` after newline by skipping model-owned beforeinput apply when inline DOM repair already reconciled the text. |
| Pending model-owned residue experiment | cut | Trace proved it was not root cause; all refs removed. |
| plite-browser promotion | no-change | Existing helper surface was enough and package proof passed. |
| Raw mobile proof | defer claim | Raw proof artifact missing, so local loop cannot claim raw mobile behavior. |

Behavior Proof Ledger:
| Family | Command | Result |
|--------|---------|--------|
| Stable Chromium examples | `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/richtext.test.ts playwright/integration/examples/plaintext.test.ts playwright/integration/examples/markdown-shortcuts.test.ts playwright/integration/examples/editable-voids.test.ts playwright/integration/examples/hidden-content-blocks.test.ts playwright/integration/examples/dom-coverage-boundaries.test.ts playwright/integration/examples/placeholder.test.ts playwright/integration/examples/select.test.ts --project=chromium` | `200 passed, 5 skipped` |
| Firefox/WebKit focused examples | `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/dom-coverage-boundaries.test.ts playwright/integration/examples/markdown-shortcuts.test.ts playwright/integration/examples/plaintext.test.ts playwright/integration/examples/hidden-content-blocks.test.ts --project=firefox --project=webkit` | `105 passed, 35 skipped` |
| History package | `bun test ./packages/plite-history/test/history-contract.ts ./packages/plite-history/test/document-state-history-contract.ts ./packages/plite-history/test/integrity-contract.ts ./packages/plite-history/test/index.spec.ts ./packages/plite/test/collab-history-runtime-contract.ts`; `bun --filter plite-history typecheck` | `82 pass, 1 skip`; typecheck passed |

Huge-Document Ledger:
| Scenario | Command | Result |
|----------|---------|--------|
| Exact insert-break regression | `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/huge-document.test.ts --project=chromium --grep "keeps virtualized insert-break bursts split at the live caret"` | passed after final rebuild |
| Huge smoke subset | same Playwright file with grep `renders huge document|replaces a huge select-all range|middle-block fast typing|insert-break bursts|backward scroll stable|downward drag selection|blank-gap drag selection|repeated typing visible|clicked refocus position|caret at the edited block end` | `10 passed` |

Package/API Proof:
| Surface | Command | Result |
|---------|---------|--------|
| slate-react focused contracts | `bun test:vitest test/input-router-contract.test.tsx test/dom-repair-policy-contract.test.ts` | `42 passed` |
| slate-react build | `bun --filter plite-react build` | passed |
| plite-browser | `bun --filter plite-browser test:selection && bun --filter plite-browser test:proof && bun --filter plite-browser typecheck` | `9 passed`, `26 passed`, typecheck passed |
| Final fast gate | `bun check` | passed |
| Debug/stale scan | `rg -n "console\\.log|\\[huge-|\\[react-input\\]|\\[dom-repair-input\\]|pendingModelOwnedTextInput|markPendingModelOwnedTextInput|consumePendingModelOwnedTextInput|unstableBoundary" ...` | no run-added debug or stale residue refs; only existing docs/test console text and negative alias assertions |

Mobile/Raw-Device Claim:
| Command | Result | Claim |
|---------|--------|-------|
| `bun test:mobile-device-proof:raw` | failed closed: missing `test-results/release-proof/mobile-device-proof.json` raw artifact | no raw mobile claim from this loop |

Workflow Slowdowns:
| Slowdown | Cause | Repair / decision |
|----------|-------|-------------------|
| Broad greps streamed noisy output | Generic terms and generated/site output included too much. | Narrow source/docs globs and exclusions. |
| Missing `site/package.json` path | Local command assumption. | Recorded; no skill patch needed. |
| Dev server freshness | Package source changes needed rebuild/server restart for meaningful browser proof. | Rebuilt `plite-react` and restarted server before final browser proof. |
| Huge-doc false starts | Early contract fixes did not match browser root cause. | Added targeted trace, found beforeinput double-apply, cut stale experiment. |

Changed Files:
| Group | Files |
|-------|-------|
| Runtime/API | `packages/plite-react/src/components/editable-text-blocks.tsx`; `packages/plite-react/src/editable/dom-repair-queue.ts`; `packages/plite-react/src/editable/input-router.ts`; `packages/plite-react/src/editable/model-input-strategy.ts`; `packages/plite-react/src/editable/runtime-before-input-events.ts`; `packages/plite-react/src/editable/runtime-input-events.ts` |
| Tests/oracles | `packages/plite-react/test/dom-coverage-boundary-contract.tsx`; `packages/plite-react/test/dom-repair-policy-contract.test.ts`; `packages/plite-react/test/input-router-contract.test.tsx`; `packages/plite-react/test/surface-contract.tsx`; `playwright/integration/examples/huge-document.test.ts`; `playwright/integration/examples/richtext.test.ts` |
| Example/docs | `site/examples/ts/dom-coverage-boundaries.tsx`; this plan |

Needs Your Attention:
| Rank | Item | Why |
|------|------|-----|
| 1 | `runtime-before-input-events.ts` duplicate-insert fix | This is the core runtime behavior change. |
| 2 | `dom-repair-queue.ts` virtualized captured target selection policy | It decides when model selection advances while DOM authority stays current. |
| 3 | API alias cut | Confirm no private consumer still expects `slots.unstableBoundary`. |
| 4 | Raw mobile proof | Local raw lane cannot pass without real device/Appium artifact. |
| 5 | Autoreview | Not run; use before commit if you want a second pass. |

Stopping Checkpoints:
| Id | Type | Question / decision | Recommendation |
|----|------|---------------------|----------------|
| S1 | review | Run autoreview before commit? | Recommended if committing runtime input changes. |
| S2 | device | Run raw mobile proof on a real device lane? | Only needed if you want to claim raw mobile behavior. |

Findings:
- Current tree had a real fake-compat alias: `slots.unstableBoundary`. It is
  removed and guarded.
- Huge virtualized insert-break duplication was real. The root was beforeinput
  inline DOM repair plus model-owned text insertion for the same event.
- Earlier pending model-owned residue logic was a stale dirty fix. It is gone.

Decisions and tradeoffs:
- No broad pagination/virtualization architecture.
- No perf packet in this correctness loop.
- No new `plite-browser` helper because the existing API covered the repeated
  proof pattern.
- No raw mobile claim without raw artifact.

Verification evidence:
- `bun test:vitest test/surface-contract.test.tsx` passed, 31 tests.
- `bun test:vitest test/dom-coverage-boundary-contract.test.tsx` passed, 17 tests.
- `bun test:vitest test/input-router-contract.test.tsx test/dom-repair-policy-contract.test.ts` passed, 42 tests.
- `bun --filter plite-react build` passed.
- Exact huge-document regression passed after final rebuild.
- Huge-document smoke passed, 10 tests.
- Stable Chromium sweep passed, 200 passed and 5 skipped.
- Firefox/WebKit focused sweep passed, 105 passed and 35 skipped.
- `plite-browser` selection/proof/typecheck passed.
- `bun test:mobile-device-proof:raw` failed closed because raw proof artifact is missing.
- Final `bun check` passed.

Final handoff contract:
- Goal plan: this file.
- Surface and route/package: `.tmp/plite`, `plite-react`, `plite-browser`,
  stable examples, `/examples/huge-document`.
- Invocation mode: full-loop, no timebox.
- Behavior gates and visual proof: passed as recorded above.
- Primary metric baseline/latest/best: N/A; this was correctness, not perf.
- Stop reason: all in-scope checkpoints closed; raw mobile and autoreview are
  queued stopping checkpoints.
- Bugs fixed and oracles added: duplicate beforeinput fixed, fake alias cut,
  multi-leaf right-margin oracle, huge select-all paste/undo oracle, DOM repair
  virtualized target contract.
- Workflow slowdowns: recorded above.
- Changed list: recorded above.
- Needs attention: recorded above.
- Accepted deferrals: raw mobile device proof and autoreview before commit.
- Next owner: user review/autoreview before commit; raw device lane only if
  raw mobile claim matters.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final handoff. |
| Where am I going? | User review or autoreview before commit; raw mobile device lane only if needed. |
| What is the goal? | Close current Plite work and prove stable editor behavior/selection/browser/mobile/huge-document scope. |
| What have I learned? | The huge-doc duplicate was a beforeinput ownership double-apply, not a single-node or residue bug. |
| What have I done? | Cut alias, fixed duplicate insertion, added oracles, cut stale experiment, ran stable/huge/package/raw-mobile proof. |
| What changed in the checkpoint plan? | All in-scope checkpoints are closed; raw mobile is an explicit stopped claim. |

Open risks:
- Raw mobile/device proof is unavailable locally because the raw proof artifact
  is missing; do not claim raw mobile behavior from this loop.
- Autoreview was not run; run it before commit if you want a second review pass.
