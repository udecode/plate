# Detached preview clipboard proof

Case: `ai-streaming:static-native-clipboard`.
Status: local candidate, uncommitted and unpushed. This receipt certifies the clipboard case only.

## Invariant and owners

Selecting `copied italic` in the detached, in-place suggestion preview copies the displayed text and its bold/italic marks into an ordinary editor. The source retains `Before selected after.` and `Untouched tail.`, all original marks, and zero history batches.

`PlateStatic` owns pointer focus for its read-only document so Chrome dispatches copy to the selected static surface. `getSelectedDomFragment` resolves native range endpoints through static text paths and extracts the marked document fragment. A partial inline selection does not require a cloned outer block. `writeStaticSelectionClipboardData` accepts that inline HTML when the model fragment is nonempty.

Architecture decision: keep the fix in the static document/clipboard owners. No document mutation, temporary canonical selection, second draft editor, plaintext fallback, or AI-specific copy branch.

## Durable owner proof

Exact owner RED: `PlateStatic.value.spec.tsx`, "owns native copy focus and extracts a partial marked range from the static document". Before the fix the static surface did not become the copy event target. `/tmp/ai-clipboard-red.log`: 6 pass, 1 fail. The historical log is very large because Bun printed DOM objects; read only the failure header.

Final focused command:

```sh
bun test ./packages/platejs/src/static/components/PlateStatic.value.spec.tsx ./packages/platejs/src/static/utils/getSelectedDomFragment.spec.tsx ./packages/platejs/src/static/internal/writeStaticSelectionClipboardData.spec.ts
```

Result: **13 pass, 0 fail, 39 assertions**, `/tmp/ai-clipboard-final-tests.log`. Scoped lint and `git diff --check` pass. No new E2E test: the owner-level RED is exact; native Chrome is required route verification.

## Native route verification

- Ref: `dirty:f03d2b8c2397638acfe8b50abf4e90139778360f`.
- Executable: `/Applications/Google Chrome.app`, version **152.0.7977.84**, macOS.
- Fresh native www dev server started for this case; `http://localhost:3000/blocks/ai-streaming-proof`.
- CUA Chrome tab `1867910329`; native Chrome app keyboard API sends OS Command+C and Command+V.
- Setup: Source `**copied** *italic*`; Start partial edit; Receive; Show clipboard destination.
- Action: pointer drag from displayed `copied` start to `italic` end. Assert native selection `copied italic` and focused static root (`tabIndex=-1`). Native copy; click the empty destination paragraph near its left text edge; native paste; Inspect source.
- Five consecutive warm repetitions passed on stable source bytes. Each mounted a fresh ordinary destination. Each paste event reported `isTrusted=true`, `text/plain=copied italic`, bold `copied`, unmarked space, italic `italic`. Each source snapshot preserved all original text/marks and history 0.
- Final screenshot showed the marked pasted phrase in the destination. The subsequent semantic source check passed.

The rich fragment also preserves existing suggestion metadata, consistent with copying the displayed document.

## Proof-host corrections

The browser-tab shortcut helper dispatches an untrusted paste; use the native Chrome app for OS clipboard proof. Clicking the blank center of a tall contenteditable does not establish an empty paragraph caret; click its actual text line. HMR can replace the draft with canonical content, so discard such runs and repeat after a stable window. These were invalid setup runs, not candidate product failures. Five counted runs had no retry or runtime edits.

Methodology decision: no-change. Existing native-input and stable-source requirements detected these invalid proof paths. Autoreview is prohibited on `next` by the repository instruction. Changeset coverage is in `.changeset/ai-detached-streaming.md`.

## Fingerprints at native replay

- `d173eeff63d8a60da0e0b40c30c4e8b535229dc241e6cc3e29a313096e0c092e` `packages/platejs/src/static/components/PlateStatic.tsx`
- `9941f31e4c7ab938811588776cadabcb9569375c03e7be5855c0d252c14f9640` `packages/platejs/src/static/utils/getSelectedDomFragment.tsx`
- `f3c883544b278ea995df1dd45fe4b0c273e394b5b92e574e9ca6c2577d723476` `packages/platejs/src/static/internal/writeStaticSelectionClipboardData.ts`
- `1851e464f18e4503f670033ccc61ec290706f08a4f42c249c5863703d5b4f3b5` `packages/platejs/src/static/components/PlateStatic.value.spec.tsx`
- `cb8f23ff4d30192075e1f407fa7638afe0d2edfa1851ed21e3b6d24b5d3f8479` `packages/platejs/src/static/utils/getSelectedDomFragment.spec.tsx`
- `ae841c993bbb05379dc10b7e760c00b0a3bf916769e46e353e3fef4e55e46adf` `packages/platejs/src/static/internal/writeStaticSelectionClipboardData.spec.ts`
- `a5b1c8c0084cce352cb338b544e8d955ec6d3e484c2bfada86a93f8118a7bbeb` `apps/www/src/app/(blocks)/blocks/ai-streaming-proof/proof.tsx`
- `61cc4e17c1156ee5246a9de934aa5ef4ea39ae549bec35310f13423a55811a3d` `apps/www/src/registry/components/editor/ai.tsx`
