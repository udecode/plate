# Suggested image deletion

Status: Completed.

Objective:
Fix the image-node deletion crash in the homepage playground and cover retained non-text rendering, review decisions, history and follow-up input.

Completion threshold:
Clicking and deleting the existing image in suggesting mode keeps a reviewable deletion without a live-node-key error. Accept removes it, Reject restores it, history preserves the result, and editing can continue. Cover adjacent draggable retained nodes when the same owning assumption applies.

Verification surface:
Exact homepage `/` with the full Playground EditorKit and image component, source www app, native browser deletion, focused package/component tests, existing suggestion and DnD browser corpus, source typechecks and scoped lint. Final browser replay uses a fresh app process and five retry-free repetitions. Preserve logs and source fingerprints in the artifact directory.

Constraints:
Current authorized next checkout; local changes only. Generic Editor components stay independent of optional plugins. Keep strict live-node key contracts; fix the owning retained-view context rather than suppressing the error or stripping image features. No publication or Git mutation.

Boundaries:
Root owns reproduction and Plate/browser implementation. The retained_image_context agent supplied independent context/adjacency diagnosis and the assigned mounted suggestion tests, then returned ownership. Its temporary native keyboard diagnostics were removed. No competing writers or unconsumed worker results remain.

Blocked condition:
The real playground/image path cannot be reached or the supplied failure cannot be reproduced; continue available diagnosis and state the missing evidence precisely.

Reporter case:
- case_id: `suggested-image-deletion`
- source_refs: user 2026-09-14 and `/Users/zbeyens/.codex/attachments/7556ced6-2163-4ce0-95dc-4c3f30e8d232/pasted-text.txt`.
- Route/setup: homepage `/`, original playground value and full EditorKit, suggesting mode, existing image selected by pointer.
- Action: Delete the image through its native context menu (exact reproduction). Automated keyboard coverage selects its block handle, verifies that selection has not deleted anything, then uses Backspace or Delete.
- Expected: retained image renders under the correct editor view, one reviewable deletion, no runtime error; Accept/Reject and Undo/Redo work; next typing reaches live content.
- Observed report: `Node key requires a live node in this editor; received "image" element`, originating in `useDomDragNode` through `ImageElement` inside `PliteFragment`.
- Environment: macOS; current branch next; reporter browser unspecified. Use installed Chrome for concrete browser proof. Final ref and production/test/harness fingerprints recorded with proof.
- Applicable claims: model, rendered image, node selection, focus, review card, runtime errors, follow-up input. No drag-motion or visual styling claim.

Work Checklist:
- [x] Read the supplied stack and classify the suspected Plate retained-render context boundary.
- [x] Reproduce the exact homepage image deletion before changing runtime code.
- [x] Add focused coverage and repair the durable owner.
- [x] Verify Accept/Reject, Undo/Redo, follow-up typing and applicable adjacent node cases.
- [x] Run affected package/browser checks, five warm repetitions, source checks and release note.
- [x] Reconcile acceptance, preserve evidence and complete the local handoff.

Owner decision:
Native retained views own the rendered snapshot. Plate renderers bind component props, plugin context and hooks to that view through the existing PlateTargetProvider, without a DOM wrapper or optional-plugin dependency. Element, leaf and text callbacks retain stable component boundaries; standalone renderer helpers retain their explicit editor fallback. Existing live-node key checks stay strict. The live view reuses its existing target.

Verification evidence:
The exact homepage error was reproduced in native Chrome with image context-menu Delete before runtime changes. The mounted block-atom regression independently reproduced the same key error, and custom retained marks exposed incorrect read-only facts. Native menu deletion and Cmd+Z subsequently kept the image and caption intact without the crash.

Package proof totals 117 passing tests: 77 renderer, mounted suggestion and provider tests in `renderer-complete.log`, plus 40 DnD tests in `dnd-complete.log`. The DnD file mocks the shared React barrel and must run in a separate process from provider tests; the combined diagnostic run in `package-complete.log` is not a passing receipt. Standalone provider proof confirms all 18 cases, including explicit EditorProvider precedence. Two existing DOM dataset assertions were corrected to the current `data-editor-*` attributes. A simple-leaf CSS class assertion protects the existing styling contract.

Source typechecks for react-core, suggestion-react, dnd-react and media-react pass. Scoped lint passes in `lint-verified.log` and `lint-complete-verified.log`; scoped `git diff --check` is clean. `.changeset/plate-retained-renderer-context.md` records the package fix. No public API or registry source changed, so doctrine, barrel and registry regeneration do not apply.

Final fresh-server Chrome proof passes all 16 suggestion/DnD browser cases in 45.1 seconds (`browser-final.log`, `proof-full.md`). Each new image case then passes five retry-free repetitions: ten passes in 28.7 seconds (`browser-warm.log`, `proof-warm.md`). Both receipts bind the same 33 unchanged source/test/config inputs, Chrome 152.0.7977.83, and source app PID 16401 started after the final production edit at `http://localhost:3306/`. The image tests cover Backspace/Accept and Delete/Reject, immediate Undo/Redo, preserved image source/caption, one review card, the untouched adjacent file, and follow-up live typing with strict runtime-error recording.

Artifacts: `docs/plans/artifacts/suggested-image-deletion/`. `package-red.log` is an explicitly labeled transcript receipt, not a full runner stream. Browser logs distinguish actual runtime failures from locator/readiness corrections. The earlier 16-case and ten-repeat successes are preserved under `browser-before-css-*` and `proof-before-css-*`; only the final receipts above establish the completed candidate.

Open risks:
No unresolved defect in the selected image flow. The apparent extra history batch came from test setup deleting the image before a subsequent key deleted the adjacent file. Native Undo correctly restored the latest deletion. Final tests select the image through its interactive block handle and assert the adjacent file remains unchanged; immediate Undo/Redo pass. No native history production change remains. Proof is local Chrome coverage for the named cases; it does not establish complete Google Docs parity, drag motion, other browsers or performance.

Reboot status:
Completed; no required work remains for this local repair. No commit, publication or release was requested or performed.
