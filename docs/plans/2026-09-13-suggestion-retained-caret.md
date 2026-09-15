# Visible caret in suggested deletions

Status: Completed

Reporter contradiction, attempt 2: The user reports “i see with keyboard but not on click”. Prior completion and attempt-1 click-paint authority are invalidated; their receipts remain historical evidence only. On frozen product bytes, the user's stale in-app tab showed Editing mode, retained markup and no installed Suggestion behavior: clicking `redundant phrase ` at offset 6 produced a native selection without projected caret, and ArrowRight moved from the stale canonical position to `Review ` offset 7. Reloading the exact route restored the Suggestion menu/discussion and a visible click-only caret at offset 6 before any key. Source diagnosis identifies mixed hot-reload editor/descriptor/fragment identities. No additional product patch is selected. The proof repair moves actual pixel capture before arrow navigation and before synthetic control styles.

Objective:
Restore the visible caret when clicking and navigating struck-through suggestion text on `/blocks/suggestion-demo`.

Completion threshold:
The reporter's click inside retained text shows one caret at the native selection endpoint, left/right movement and subsequent input remain coherent, and final source-bound browser proof and focused checks pass.

Verification surface:
The existing www suggestion Browser runner and source-first React/selection tests. Inspect actual captured caret pixels with positive, absent and duplicate controls; repeat the affected keyboard/pointer case five times. No Chrome-specific, mobile or whole-editor claim.

Constraints:
Current `next` checkout; no commit/publication. Preserve the preceding self-edit repair. Retained deleted content remains read-only. Use the existing view-selection owner if it can serve the invariant; no example-specific caret workaround.

Boundaries:
Root owns product, browser test and host. `click_caret_proof_repair` completed workflow repair and plan reconciliation; ownership returns to Root at handoff. `click_caret_owner_trace` supplied read-only diagnosis. No new public API was introduced.

Blocked condition:
Missing exact reproduction or a visual oracle keeps the claim open; continue useful diagnosis before asking for missing user information.

Work Checklist:
- [x] Reproduce on the user's actual route: clicking the red `redundant phrase` places native selection at offset 6 within a `contenteditable=false` retained span; no caret is painted. The discussion opens and the editor retains focus.
- [x] Add failing real-pointer/keyboard and caret-pixel coverage.
- [x] Repair the native selection/render owner and preserve follow-up input.
- [x] Invalidate attempt-1 click paint, diagnose the exact stale tab on unchanged product source, and reload the owning host state.
- [x] Repair Regression's executable rejection of click paint sampled only after later input; install and verify source/generated parity.
- [x] Run the corrected attempt-2 suggestion suite and five repeated click-paint checks against unchanged final inputs; inspect the click-only capture before any keyboard action.
- [x] Reconcile corrected receipts, still-applicable keyboard/focus/follow-up acceptance, and the reporter's live route before closure.

Evidence: In-app Browser tab 1, local port3297, native selection `redundant phrase ` offset6 after click at the word interior. Initial screenshot visibly lacks the caret. This is distinct from the earlier green-insertion cursor navigation test.

Diagnosis and repair: Retained deletions are rendered as `contenteditable=false`. The browser stores a selection inside them but does not draw a native caret, while the projected selection renderer had no collapsed-selection paint. Editable now paints one focused projected caret using the existing range-geometry coordinator and retained DOM-point resolver. Native caret suppression also applies when consumers disable default styles. Retained text remains read-only, and leaving it restores ordinary typing. No public API was added. `.changeset/tidy-retained-caret.md` records the package fix.

Historical attempt-1 evidence (invalidated for click-only completion):
- [Initial failing browser case](artifacts/suggestion-retained-caret/red.log): real pointer selection succeeds but the caret count is zero.
- [Suggestion Browser suite](artifacts/suggestion-retained-caret/browser-settled.log): 9 passed, no retries, on source-serving host PID45553 at `http://localhost:3297`. The receipt binds 12 source/test/config inputs to fingerprint `sha256:d0855d5c483f51685df6673945deaec0f425aa6f542bb8057698d2c88884e63e`. The actual pixel assertion followed arrow navigation and cannot certify click paint.
- [Stability run](artifacts/suggestion-retained-caret/stability-final.log): 5/5 passed with the same insufficient click-paint oracle; no attempt-2 authority.
- [Inspected screenshot](artifacts/suggestion-retained-caret/final/retained-caret.png): controls distinguish zero, one and two vertical strokes, but the actual screenshot followed keyboard navigation.

Verification evidence:
- Unchanged product checks remain support evidence: [React checks](artifacts/suggestion-retained-caret/react-final.log) passed 83 tests across range geometry, authored fragment providers and decoration rendering; [source React typecheck](artifacts/suggestion-retained-caret/types-final.log), targeted Ultracite and whitespace checks passed.
- Attempt-2 frozen-source affected baseline: [the existing 9 suggestion Browser tests](artifacts/suggestion-retained-caret/click-attempt2-baseline.log) passed in 17.7s. The live tab contradiction is resolved by reloading the same exact route, before changing product source.
- Attempt-2 final combined proof: [click-final.log](artifacts/suggestion-retained-caret/click-final.log) passed the full 9-test suite in 17.0s and 5 repeated caret checks in 9.1s, with zero retries. Fresh source host PID57948 at `http://localhost:3297`; the attempt-2 candidate-local receipt binds 16 unchanged inputs, digest `sha256:8c6d0a8a5d3c5ed4e467bd4ab5c9eb098ab4cf850981601fd1ca8b8bd9d941ed`, receipt `sha256:c7636f85e778c6ff9cf84fa9373394091e0e65a2d6b9820a91accd01731d1899`. Actual pixel capture precedes controls and keys; delivered retained-target `pointerdown/mousedown/pointerup/mouseup/click` and buttons 1/0 are asserted with no intervening key. Final targeted lint and whitespace checks passed.
- Root inspected [click-only final screenshot](artifacts/suggestion-retained-caret/click-final/suggestion-paints-one-care-18bf4-ointer-and-arrow-navigation-chromium/retained-caret.png), actual capture and all three controls: actual/single show one vertical caret, absent shows none, duplicate shows two. The user's same in-app tab independently showed a visible offset-6 caret on click alone after reload.
- Workflow red: [failed-packet test](artifacts/suggestion-retained-caret/workflow-click/red.log) shows the old semantic validator accepted click DOM without same-phase pixel proof.
- Workflow green: [focused test](artifacts/suggestion-retained-caret/workflow-click/green.log) rejects missing click paint, later ArrowLeft/ArrowRight, focus calls, selection writes, reversed order and a second late capture; a phase-complete fixture passes.
- [Final workflow suite](artifacts/suggestion-retained-caret/workflow-click/final.log): 151 tests passed across source semantic/contract tests and generated contract tests. [Install](artifacts/suggestion-retained-caret/workflow-click/install.log) passed; `sync-resources.mjs --check` reports exact mirrors; owned-file `git diff --check` passed. Agent Native Reviewer: source ownership, generated discovery, runnable helper, positive/negative packets and scope boundaries inspected; no actionable finding. The sole intermediate suite failure was expected stale generated content before installation, and the final same suite passes.

Failed fix history:
| Case | Attempt invalidated | Kind | Missed invariant | Repair and resumption |
|---|---|---|---|---|
| SUGGESTION-RETAINED-CARET | 1 | reporter-contradiction | Click caret pixels were sampled only after arrow keys; live tab also retained stale hot-reload identities. | `repair-now`: Regression requires same-phase click paint and `paint-input-trace: click > pixel-capture`. Executable workflow rejection/install/parity passed. `exact-route-reproduction: red` in stale tab; `pass` after exact-route reload on unchanged product bytes. Attempt 2 completed corrected proof; no product patch or architecture escalation selected. |

Cumulative reporter oracle:
| Acceptance | Phase and direct evidence | Current result |
|---|---|---|
| Visible caret in redlined text; retained text stays read-only | Exact-route physical click, native/model/view endpoint, focused editor and actual pixel classification | Click-only live readback and final executable capture passed. |
| Keyboard movement retains the caret and coherent selection | ArrowLeft/ArrowRight after the independent click capture | Final suite and all 5 repetitions passed. |
| Clicking must paint without a keyboard repair | `geometry-paint@after-action`; `paint-trigger: click`; actual capture first; controls through the same screenshot path; `paint-input-trace: click > pixel-capture` | `pass`; `positive-control: pass`; `negative-control: pass`; `duplicate-control: pass`; no key before click capture. |
| Discussion/focus and next input remain usable | Read-only retained input, comment focus, editor return, ordinary live-text typing | Final suite and all 5 repetitions passed. |

Reboot status:
The task-owned server restart and concurrent plugin migration in attempt 1 are historical: `browser-final.log` preserves its pre-assertion HTTP500. Attempt 2 diagnosed a stale client after hot reload; reloading the exact user's tab restored Suggestion behavior and click-only caret without product edits. `browser-source-attestation: fresh host restart` as PID57948 preceded the passing final combined receipt; all named inputs stayed unchanged throughout.

Open risks:
The verified scope is the reported demo and in-app/Chromium behavior, not mobile or all host CSS. The caret follows the existing fixed-overlay positioning convention; a transformed/filter/perspective ancestor can establish a different fixed containing block and requires separate coordinate handling. Read-only owner review found no blocker on this demo. Registry generation and barrels are inapplicable because registry implementation and public exports did not change. No commit or publication was requested or performed. Regression's existing corpus validator unconditionally requires exact Chrome for any `geometry-paint` row; that broader rule is not a Chrome-specific user request. This compact local Patch plan records Failed-Fix repair and direct proof without claiming full Regression corpus semantic closure or exact Chrome validation.

Next action: None for this local repair. Root may close the native goal and report the stale-tab recovery plus strengthened click-only proof. Product source remained unchanged during attempt 2; no commit or publication occurred.
