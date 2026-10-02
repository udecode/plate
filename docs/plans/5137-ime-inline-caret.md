---
review_scopes: []
review_basis: []
work_kind: implementation
---

# PR 5137 IME caret follow-up

Status: Awaiting native IME proof

## Outcome

Verify and finish the follow-up repair in https://github.com/udecode/plate/pull/5137. Chinese preedit must keep the visible caret at the editing position in the homepage paragraph text beside links. Confirmation and the next key must preserve the intended text and selection. Empty paragraphs, cross-paragraph replacement, custom renderers and existing external input owners must remain correct.

## Scope

The candidate is commit `5fb7c40b1c0891746bdaa7d3b7a1a7f417229981`, based on `a5d07011f3147a8ae39e9b956036bf0d4edaae7b`. Work stays in the current `next` checkout. Inspect and adopt only this repair's files and demonstrated corrections. Public comments, commits, pushes, closing and merging require their own request.

## Decisions

The author reports that the prior repair passed headings and link contents but failed ordinary paragraph text. Earlier retained-flow evidence cannot close this residual symptom. Verify owns the completion boundary and final runtime proof. Autoclosure owns the candidate's cleanup and candid verdict.

Throughput checkpoint: research and source review run in parallel with reproduction; the lead owns every edit. Existing mounted suites and browser runners supply proof. Native OS IME paint requires actual OS input and an inspected image.

The ideal target preserves the browser-owned Text while each text host retains its own latest rendering update. Three same-family Architect runners compared a private host-keyed Map with epoch-owned release batches and deleting protection. The Map keeps the existing runtime, caller signatures and scheduler. Epoch batches add a second rendering lifetime. Deleting protection breaks the connected Text invariant. Interrogate returned no actionable finding. Challenge delta: unchanged. Snapshot and clear before callbacks so a still-protected host can register again. One adoption step replaces the singleton, with the handoff regression as its keep gate.

The exact homepage also exposed an invalid selection import during preedit. Native/model setup matched at offset 2. After `n`, the native offset was 3 and the model incorrectly became 3. Later preedit kept that model offset; the native Chinese commit initially inserted correctly at 2, then model publication moved it to 3. The importer boundary is confirmed by the same replay passing with its native-composing guard. The specific queued producer is inferred from source, not identified by a callback trace.

For that repair, the same-family design attack compared cancellation at composition start with refusal at the canonical import function. `syncEditorSelectionFromDOM` rejects imports only while the local controller is composing and its epoch is native-composing. Cancellation protects only one producer; a second captured range masks the invalid import. Challenge delta: improved, by moving the check to the shared import owner. Android, external owners and final settlement do not satisfy the predicate. One adoption step adds the guard and the real homepage regression, with commit and next input as its keep gate.

The proposed standalone callback-ref defect was dismissed. `EditableText` is internal; both production callers provide nodeKey/path. The attempted public import failed during setup and is not regression evidence. Arbitrary independent updates inside a custom child remain outside the proved renderer contract.

The stronger combined model/DOM oracle exposed a third defect. Chinese commit settled at offset 4; typing `!` produced the right text and model offset 5, but the browser caret settled at 0 in all five runs. The new `EditableTextContent` update boundary claimed its React mutations without requesting selection export after them. Its `componentDidUpdate` requests the existing post-DOM-commit export, as `EditableTextFlow` does after reconciliation. Broadening the shared commit-claim hook would affect unrelated render boundaries; saving a DOM range would add another selection owner. Final proof is recorded below.

Three retained-text CI cases use overlay text as their selection oracle. The current `canUseNativeViewSelection` branch deliberately emits no overlays for these text-only ranges. Their expected strings remain unchanged; the local tests read the canonical harness's native selected text instead. Runtime proof, not missing overlays alone, determines whether this diagnosis holds.

The final attack identified a pending Android action boundary in direct selection export. A connected-runtime DOM contract with the real published Android manager fails when forced export overwrites a caret before its queued action. `syncEditableDOMSelectionToEditor` respects that manager's pending-action gate. The test calls export again after deleting the queued action and verifies the model caret can then export. It does not prove an automatic retry or native Android device behavior.

A broader pending-native-import guard and its compensating browser-handle transition passed the controlled contract but failed the owning browser cases. `plite-browser-accepted.log` records 12 failures and 18 passes in five repetitions, including retained selection and undo. Earlier browser proof without those additions passed all 30. Both additions were cut. Ordinary root reconciliation and forced post-DOM-write export have different contracts; a pending-import flag cannot prohibit every forced export. The surviving Android gate has separate red/green proof. `plite-browser-final-cut.log` passes all 30 repeated cases against the cut. Retained same-family findings are in `artifacts/5137-ime-inline-caret/final-review.md`; the initial design comparison is not preserved as a full transcript.

## Steps

- [x] Reproduce the homepage defect through Verify. `homepage-owned-trace.log` and `homepage-ime-final.log` preserve displaced commit and follow-up caret failures. Chrome CDP reaches preedit and commit on the exact route; the native OS paint gap remains a separate open gate below.
- [x] Trace and reproduce the two defects. `candidate-handoff-fresh-host.log`, `homepage-frozen-selection-transitions.json`, `homepage-frozen-composition-events.json`, and the source traces in this plan establish the host overwrite and invalid direct import. Artifacts live under `docs/plans/artifacts/5137-ime-inline-caret/`.
- [x] Plan and implement the fix. Three same-family Architect/Interrogate checks selected the existing runtime and selection owners. The lead edited `editable-dom-runtime.ts`, `selection-controller.ts` and `EditableTextContent.componentDidUpdate`, plus their regressions and the three native-selection readouts in `authored-changes.spec.ts`.
- [ ] Verify the reporter's visible caret with native OS IME. The homepage CDP replay passes five times on final source in `homepage-final-cut.log`; it does not prove Pinyin caret pixels. `native-pinyin-probe.json` records one actual Pinyin interaction at the reporter's offset 27, with correct Chinese commit and next input. The preedit capture did not show a painted caret. The five-run attempt stopped before input when Chrome switched to another page. Owner: this task, tracked in the geometry-paint row below. The temporary input source, task tab and server are cleaned up.
- [x] Keep tests failing before the repair. `baseline-react.log`, `candidate-handoff-fresh-host.log` and `homepage-owned-trace.log` are red. Commit/history work is skipped because the user owns commits and did not request one.
- [x] Opening a PR is skipped. This task concerns existing PR #5137; publication, merge and closure were not requested.
- [ ] Fulfil "next: https://github.com/udecode/plate/pull/5137 make sure you verify!!". Local source and browser proof pass, but native OS caret paint is still open under the preceding gate. No closure or merge-ready claim.
- [x] Run the applicable writing passes and review the settled implementation. Deslop and the final no-comments pass found no additional cuts. `final-review.md` records the read-only source review accepting the pending-import cut. This plan and the changeset received an Unslop pass.
- [x] Audit the decision trail, consume its independent same-family review, then reflect. `final-review.md` records the review and its applied corrections. Later decision rows were appended through `decisions-check.mjs` after that review. `reflection.md` records three reviewer lenses and the synthesis; one proposed workflow rule awaits user approval and a runner-recipe follow-up stays local.
- [x] Run the last scoped lint check and hand off the exact local and PR states. `last-scoped-lint.log` exits zero on the ten task code/test paths at the recorded checkpoint. The latest hash check matches nine paths; `editable-dom-runtime.ts` changed afterward, so the old runs do not certify the entire current checkout. The handoff keeps native paint, current-source revalidation and publication open; no commit or external PR mutation was made.

## Proof

Acceptance remains open for native OS IME paint. After the user selected Simplified Chinese Pinyin, actual native keys produced `ce shi`, committed `测试` at offset 27, and inserted the next key `2` at offset 29. The same connected Text kept CDP backend node ID 12929 throughout preedit. `native-pinyin-probe.json` binds the observations and captures. Four follow-up frames show the expected caret blinking between `2` and `xt`, but the single preedit capture has no painted caret. These observations do not close the during-preedit paint gate or the five-run acceptance check. The five-run attempt stopped before input when another Chrome page took the foreground; `native-pinyin-runs.json` contains no completed runs.

Computer Use removed the temporary Pinyin input method through System Settings and restored U.S. Settings lists only U.S.; macOS retains an orphan Pinyin input-mode preference row, so this is not a byte-identical preference restoration. The task's Chrome tab is closed and its native-proof server PID 4788 stopped with exit 130. A private file-URL control fixture was blocked by browser security policy; no workaround was attempted. The duplicate-caret control remains unexecuted. This approval does not authorize paid transcription or workflow edits.

Exact browser environment: Google Chrome 154.0.8037.58, executable `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`; homepage `/` at `http://localhost:3297`. The automated-proof listener PID 5572 and later native-proof listener PID 4788 each had cwd `apps/www`. The task-specific servers ran `PLATE_WWW_DEV_SOURCE=1` with `.next-ime-5137` and stopped after evidence capture. Runtime modes: editable, history enabled, authored edit/markup and the actual EditorKit plus comments/discussions. Fixture-scope: complete English homepage playground fixture, including its original links and annotations. No value replacement is used to certify the homepage.

The homepage spec uses the existing browser helper's composition key event and Chrome CDP composition. It proves browser-owned Text continuity and canonical commit, not a native OS Pinyin session or caret pixels. `homepage-final-cut-preedit.png` was inspected and shows live preedit in the homepage paragraph. Its matching transitions and composition events are retained beside it. Screenshot inspection alone does not certify caret paint.

| Oracle | Positive / forbidden state | Proof and current result |
| --- | --- | --- |
| model during-action | Canonical offset remains 2; do not import preedit offset 3 | `homepage-ime.spec.ts`, `homepage-final-cut.log` passes five times |
| dom-native during-action | Same connected Text contains each preedit; no detached/replaced anchor | Actual homepage Chrome CDP, `homepage-final-cut.log` passes five times |
| model and dom-native after-action | Chinese commit once at the original point; no displaced or duplicate text | `collapsedModelDOMSelection` in the homepage spec; `homepage-final-cut.log` passes five times |
| focus during-action | Actual homepage Editable owns focus; toolbar/body must not take it | `readNativeState` in homepage spec, `homepage-final-cut.log` passes five times |
| follow-up-input follow-up | Native `!` follows the commit; model/native selection agree | `homepage-final-cut.log` passes five times |
| subscription-lifecycle after-action | Cancelled A decoration applies while B composes; B stays protected | `ime-decoration.test.tsx`, `handoff-fixed.log` passes |
| geometry-paint during-action | OS Pinyin caret follows actual preedit without stale pixels | Open, owner: this task. One actual Pinyin probe proves commit and follow-up placement, not preedit paint. Five-run acceptance and duplicate-caret control remain unexecuted. See `native-pinyin-probe.json` and `native-pinyin-runs.json`. |

Recorded package evidence: `adjacent-react-final-cut.log` passes 390 tests in 16 suites. `react-typecheck-final-cut.log` passes the React entrypoint typecheck. `type-aware-scoped-final-cut.log` passes scoped type-aware lint. `dom-runtime.log` passes 13 DOM runtime tests. `plite-browser-final-cut.log` passes all six selected Chrome cases repeated five times, without retries. It rebuilds and serves the actual Plite app. `homepage-final-cut.log` passes five complete two-anchor homepage replays, without retries. `final-cut-source-sha256.txt` binds the ten task code/test paths and matched them after both browser runs. The latest `shasum -a 256 -c` matches nine paths; `editable-dom-runtime.ts` now hashes to `c1fc34f0b759a3ffe3a0f4dcc394fe41e192f944f5636a373b9c3aefb326cd6b` instead of the recorded hash. Its current diff includes a `settleInput` extraction not written by this task. The recorded runs remain historical evidence, not proof of every current byte. Owner: this task, tracked here for affected-check revalidation before closure.

`pnpm check` stops in formatting at four files outside this task: two registry changelog entries, `benchmark-health-latest.json` and `editor-runtime-view.ts`. No later check step ran. These files were left untouched; no matched HEAD baseline was run, so this is not called a pre-existing failure. See `full-check.log`.

PR CI was inspected at the published head. General CI fails type-aware lint in registry and other files outside this diff. Chromium failures include retained-text selection assertions in `authored-changes.spec.ts` and HTML serialization in `plate-schema-descriptors.test.ts`. These are not dismissed as pre-existing: no matched baseline has established that. The relevant selection cases pass the final local repeated proof. A read-only Babysit `check` uses `gh` because Origin is unavailable. `pr-status-final.log` reports six failed checks, review clear, merge blocked. The final `gh pr view` readback in `pr-final-readback.json` confirms the same published head, six failed checks, OPEN and BLOCKED. The public PR has not received these local repairs.

The reporter's attached video was viewed directly in Chrome, without downloading it or calling paid transcription. Frames at 4.49 seconds show heading preedit and candidates; 8.52 and 9.67 seconds show paragraph preedit; the final frame shows the committed text. `artifacts/5137-ime-inline-caret/reporter-paragraph-preedit-9.67.png` preserves the last preedit observation. The paragraph insertion is between `rich-te` and `xt`, at offset 27 in the first text host. The recording shows the complete homepage fixture and a Chinese candidate panel. It does not identify the exact OS or IME implementation reliably, and it is source evidence rather than final-candidate proof.

Reflection follow-ups are tracked in `artifacts/5137-ime-inline-caret/reflection.md`. The accepted Verify review-rule proposal awaits user approval under pstack:reflect. The runner-recipe follow-up has owner: Verify workflow maintainer. No shared instruction, generated skill or external tracker was changed.
