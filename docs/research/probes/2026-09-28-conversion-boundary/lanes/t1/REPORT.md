# Lane T1: transfer diagnostics and paste feedback

This receipt covers lane T1 and the decode-context half of S3 in the [adoption plan](../../../../../plans/2026-09-28-conversion-boundary-adoption.md) (D7, A6, "Paste result: the UI owns feedback"). All commands ran from the repository root on 2026-09-28/29 against the shared working tree, using bun 1.3.12, Vitest 4.1.9 and Playwright Chromium on darwin/arm64. Failures in files T1 does not own are recorded here, not repaired.

## What changed

### Decode context (Plite `dom`)

- The transfer decode context gets `report(diagnostic)`.
  - Diagnostics use the public type `DataTransferDiagnostic = Readonly<{ impact: 'lossless' | 'lossy'; message: string }>`, exported from `plitejs/dom`.
  - `decode` still returns a slice or `null`, and programmatic `insertData` still returns a boolean.
- `report` only works while that format's `accept` or `decode` is running. A later call throws.
  - An invalid diagnostic throws a `TypeError` inside the callback. It goes to the lifecycle error channel and the next format gets its turn.
- Each format attempt's reports and MIME type are kept privately. The final list is picked once per decode:
  - The format whose content was inserted keeps all of its reports.
  - A format that was tried and not used keeps only its lossy reports.
  - Those unused-format reports are dropped when the inserted format decoded the same MIME type, since it read the same source.
  - Matching text from another MIME type does not count as recovering the loss.
  - A format that throws contributes no reports.
  - On refusal, the lossy reports from every completed attempt remain.
- Declining without reporting stays silent. Plite never invents a diagnostic for a refused slice.

### Settlement (Plite `dom`, internal)

- `observeDataTransferInsertion(editor, listener, insert)` opens one observation per editor runtime owner.
  - The built-in insertion (the exact editor fragment first, then registered formats) records its first outcome there.
- A successful insertion is reported from the editor's existing after-commit phase, through `attachTransactionSpecAfterCommit`.
  - That hook carries through `transaction.extend`, continuations and the projected-selection rebase.
- A refusal is reported when the observed call returns.
  - An insertion that commits no net change reports `inserted: false`.
  - Inside an open outer update, the result waits for that update's commit.
  - A thrown or rolled-back update reports nothing.
- Later insertions during the same observation, and insertions into other editors, are not attributed to it.

### Mounted outcome (Plite `react`)

- `Editable` gets `onPasteResult?: (result: EditablePasteResult) => void`.
  - The result type is `EditablePasteResult = Readonly<{ diagnostics: readonly DataTransferDiagnostic[]; inserted: boolean }>`, exported from `plitejs/react`. The result object is frozen.
- `EditableDOMRuntime.runPaste` binds delivery to the view that received the paste.
  - It reads that view's current prop, which the same layout effect as `onHistoryReplay` keeps up to date.
  - It delivers only while that view is still mounted, and never redirects to another view.
- Observed paths:
  - the paste event handler (its whole body, so a refusal is reported after repair and trace);
  - `beforeinput` with `insertFromPaste`;
  - Android's deferred `insertFromPaste`, whose scheduled command runs through the view's `runPaste`.
- Not observed: drops, `insertFromYank`, the browser test handle, programmatic `insertData`, `onPaste`-handled pastes, read-only views, and `domCommands.insertData` handlers that don't delegate. In those cases the app or plugin owns the outcome.

### Plate and registry

- `EditorContent` already inherits the prop through `EditableProps` and forwards it, so `PlateContent.tsx` is unchanged.
  - `EditablePasteResult` is re-exported from `platejs/react`.
- Plate spreads the Plite decode context into plugin decoders, so `report` reaches `dataTransferFormats` decoders without a Plate format change. That includes Word paste's nested HTML decode.
- The registry `Editor` passes a module-level `onPasteResult` that shows one `toast.warning` per result with a lossy diagnostic.
  - When something was inserted: "Some pasted content was left out."
  - Otherwise: "The pasted content could not be inserted."
  - Lossless-only results show nothing, and an app's `onPasteResult` prop replaces the default.

## Files

Changed:

- `packages/plitejs/src/dom/plugin/{data-transfer-format,dom-clipboard-runtime}.ts`
- `packages/plitejs/src/dom/{index.ts,internal/index.ts}`
- `packages/plitejs/src/react/components/{editable,editable-text-blocks}.tsx`
- `packages/plitejs/src/react/editable/{editable-dom-runtime,runtime-before-input-events,runtime-clipboard-events,runtime-event-engine,runtime-root-engine,runtime-root-state}.ts`
- `packages/plitejs/src/react/hooks/android-input-manager/{android-input-manager,use-android-input-manager}.ts`
- `packages/plitejs/src/react/index.ts`
- `packages/platejs/src/react/{core.tsx,plite-react.ts}`
- `apps/www/src/registry/components/editor/editor.tsx`
- Specs: `packages/plitejs/test/dom/data-transfer-format.test.ts`, `packages/plitejs/test/react/{android-input-manager-contract.test.ts,input-router-contract.test.tsx,projected-command-contract.test.ts}`, `apps/www/src/registry/components/editor/editor.spec.tsx`

Created:

- `packages/plitejs/test/dom/data-transfer-diagnostics.test.ts`
- `packages/plitejs/test/react/editable-paste-result.test.tsx`
- `packages/platejs/src/react/components/PlateContent-paste-result.spec.tsx`
- `.changeset/plitejs-paste-result.md` and `.changeset/platejs-paste-result.md` (patch)
- A paste-result toast changelog entry was reported as created with `--new`; `--write` was not run, but the evidence file is no longer available to verify its contents.

## Commands and results

| Command | Result |
| --- | --- |
| `cd packages/plitejs && bun test --preload ../../config/plite-source-test-setup.ts test/dom/data-transfer-diagnostics.test.ts test/dom/data-transfer-format.test.ts` | 41 pass, 0 fail (14 new) |
| `cd packages/plitejs && pnpm exec vitest run --config ./vitest.config.mjs test/react/editable-paste-result.test.tsx test/react/android-input-manager-contract.test.ts test/react/input-router-contract.test.tsx test/react/projected-command-contract.test.ts` | 4 files, 145 pass (10 new) |
| `cd packages/platejs && bun test src/react/components/PlateContent-paste-result.spec.tsx src/react/components/PlateContent.spec.tsx` | 29 pass, 0 fail (1 new) |
| `bun test ./apps/www/src/registry/components/editor/editor.spec.tsx` | 5 pass, 0 fail (2 new) |
| `cd packages/plitejs && bun test --preload ../../config/plite-source-test-setup.ts --path-ignore-patterns 'test/react/**'` | 2935 pass, 0 fail, 136 files |
| `cd packages/plitejs && pnpm exec vitest run --config ./vitest.config.mjs` | 90 files, 1332 pass |
| `pnpm --filter plitejs test` | 21/21 turbo tasks |
| `pnpm --filter plitejs typecheck` | 13/13, including test typecheck |
| `pnpm --filter platejs typecheck:partition:react` | pass |
| `pnpm --filter platejs typecheck` | 85/87. The failure is the markdown partition in `src/markdown/lib/internal/{markdownAttributes,markdownMappings}.ts` (formats lane, in progress) |
| Scoped `tsc` for the new Plate spec, and for `editor.tsx` plus `editor.spec.tsx` under `apps/www/tsconfig.json` | 0 errors each |
| `npx oxfmt`, `npx oxlint`, `oxlint --type-aware`, `pnpm exec ultracite check` on T1 files | clean |
| T1 specs rerun after lane P1's final `core/public-state.ts` edits | 41 dom, 145 react, 1 Plate: all pass |
| `cd packages/platejs && bun test src/react/markdownPasteResult.spec.tsx` (lead's corrected spec) | 1 pass |
| Same spec run after `src/react/components/PlateContent-paste-result.spec.tsx` (host facts already cached) | 2 pass |

What the new specs cover:

- `data-transfer-diagnostics.test.ts`:
  - reports arrive after the commit and are frozen, and the programmatic boolean is unchanged;
  - loss from an unused format survives fallback to another MIME type, including equal text;
  - a same-MIME fallback reports only its own loss, and plain declining is silent;
  - a throwing format keeps the error channel and loses its reports;
  - `report` validates its input and rejects late calls;
  - a refusal reports `inserted: false` once, and so does a no-op placement;
  - an open outer update delivers on its commit, and rollback delivers nothing;
  - the exact fragment reports with no diagnostics and runs no decoder;
  - only the first insertion under an observation counts, and observations stay per editor.
- `editable-paste-result.test.tsx` (jsdom host with `beforeinput` support):
  - a direct plain-text paste cancels the `paste` event and reports once after its commit;
  - a rich paste leaves `paste` uncanceled and inserts nothing on it; `beforeinput` then inserts and reports exactly once;
  - a refusal reports its loss;
  - of two views (main and a `header` root), only the one that received the paste reports;
  - the current prop is used after a rerender;
  - plugin-handled and `onPaste`-handled pastes report nothing;
  - a view destroyed before the commit reports to no view;
  - a view that gains focus before the commit never receives the result.
- `android-input-manager-contract.test.ts`: a deferred Android paste is observed at flush; a drop is not.
- `projected-command-contract.test.ts`: a projected-selection paste reports once after its commit, with the retained loss.
- `PlateContent-paste-result.spec.tsx`: a Plate plugin decoder's `report` reaches `EditorContent`'s `onPasteResult` through a DOM paste.
- `editor.spec.tsx`: one warning per lossy result with the correct wording, none for lossless-only results, and an app handler replaces the default.

Mutation checks: I broke each of these rules on purpose, confirmed the matching spec failed, and restored the file from a scratch copy:

- the connected check;
- the prop update;
- the paste-event and `beforeinput` observation;
- the Android paste flag;
- same-payload supersession;
- the lossless filter for unused formats;
- first-outcome ownership;
- open-update settlement;
- dropping a throwing format's reports;
- rejecting late `report` calls.

## Follow-up: Markdown paste reported twice

- **Report:** a `text/markdown` + `text/plain` paste in `markdownPasteResult.spec.tsx` produced `{ diagnostics: [], inserted: false }` from `paste`, then the correct result from `beforeinput`.
- **Cause:** the test host and the event sequence. The paste code had no defect.
  - happy-dom's user agent (`AppleWebKit … HappyDOM`, no `Chrome/`) is classified as WebKit, so `paste` took Safari's direct branch. That branch cancels the event and inserts immediately.
  - happy-dom defines a global `DataTransfer`, so testing-library rebuilt a class-based stub from its own properties only. The paste event therefore carried an empty payload, which was refused.
  - The spec then dispatched `beforeinput` after a canceled paste, which browsers never do.
  - The spec's `getTargetRanges` polyfill also depended on file order, because host facts are cached per window and Bun shares one window across files.
- **Resolution:** the lead changed the spec to use happy-dom's native `DataTransfer` and to dispatch `beforeinput` only when the paste wasn't canceled. It passes alone and after cached host facts. There was no product change.
- **Spec hardening:** `editable-paste-result.test.tsx` now asserts the rule. A direct paste returns `false` from `fireEvent.paste`; a deferred paste returns `true`.

## Browser proof

- **Ran:** an isolated www dev server started from this tree, with no `build:registry`. It has since been stopped and its dist dir removed. The command was `PLATE_WWW_PLITE=1 PLATE_WWW_DEV_SOURCE=1 PLATE_WWW_DIST_DIR=.next-t1 next dev -p 3519`, followed by:
  - `PLAYWRIGHT_BASE_URL=http://localhost:3519 pnpm --filter www test:www-browser:chromium tests/browser/clipboard.spec.ts tests/browser/clipboard-upload.spec.ts`
  - Result: 9/9 pass. That covers trusted Ctrl+V and synthetic paste of HTML (heading, bold, link, unsafe markup, video) and file paste, so the observed paste and `beforeinput` handlers keep real Chromium paste behavior.
- **Not proven in a browser:** a visible toast for a lossy paste, no toast for harmless metadata, and two-view or unmounted delivery in Chromium. The blockers:
  - Plite mode, which the www browser runner uses (`PLATE_WWW_PLITE=1`), makes the root layout skip `<Toaster />`. No toast can render on `/blocks/*`, so the visible toast needs a served mode that mounts `<Toaster />`.
  - The managed runner starts `pnpm dev:plite`, which runs `build:registry`. This lane was excluded from running that.
  - The decoder that produces lossy reports for HTML is still being wired by lane html-safety. The Markdown link case reports lossless, so it shows no toast by design.
  - The Playwright browser handle doesn't expose the editor, so a probe can't install a reporting format without test-only product hooks.
- **To close:** in a mode that mounts `<Toaster />`, paste content whose decoder reports lossy into the registry `Editor` and assert exactly one `[data-sonner-toast]` reading "Some pasted content was left out." Then paste harmless content and assert no toast.

## Open gaps and hand-offs

- **S3:** the lead has wired the Markdown decoders; the HTML decoders are with lane html-safety.
  - Diagnostics that already carry an `impact` (`html-schema-repair`, `html-unsafe-content`, `markdown-schema-repair`) map straight across.
  - The rest need a classification. For example, dropped unsupported content is lossy, while metadata and parser recovery are lossless.
  - The HTML decoder should report before it returns `null` because nothing insertable is left, so the loss survives the plain-text fallback.
- **Re-export `DataTransferDiagnostic` from `platejs/dom`** in `packages/platejs/src/dom/{index.ts,plite-dom.internal.ts}`, which T1 doesn't own. Decoders can already call `context.report` without naming the type.
- **Registry:** `build:registry` derives `sonner` for the `editor` item from the new import. The changelog `--write` still needs to run.
- **Doctrine repair (S6):** needed for `report`, `DataTransferDiagnostic`, `Editable.onPasteResult`, `EditablePasteResult` and `EditorContent`'s inherited prop.
- **Known limits:**
  - An undiagnosed refusal of a rich slice that falls back to plain text is silent.
  - A paste that commits no net change reports `inserted: false` while `insertData` returns `true`.
  - Drops are not observed.
  - Inside an outer update that ends up committing no net change, the paste is never reported.
- **Core dependency:** T1 relies on `attachTransactionSpecAfterCommit`, which had no other callers. Lane P1 confirmed they're keeping it and that their core edits don't affect it.

## Docs text for the lead

In `content/docs/(guides)/clipboard.mdx` (and `.cn.mdx`), under "Custom DataTransfer formats", change the context sentence to "`accept` and `decode` receive `{ data, mimeType, report, snapshot, state }`", then add:

````mdx
### Reporting what a paste leaves out

Call `report(diagnostic)` from `accept` or `decode` to describe what the
payload loses. A diagnostic is `{ impact, message }`: `'lossy'` when pasted
content is left out or loses meaning, `'lossless'` for harmless cleanup such
as dropped metadata. `report` works only while the callback runs.

```ts
decode: ({ data, report }) => {
  const { droppedEmbeds, slice } = parseNotes(data);

  if (droppedEmbeds > 0) {
    report({ impact: "lossy", message: "Embedded notes were left out." });
  }

  return slice;
},
```

Returning `null` or `false` without reporting stays silent. If `accept` or
`decode` throws, Plate discards that format's reports and sends the error to
`lifecycleErrorSink`.
````

Replace the "Plate does not report which format handled a paste…" paragraph under "HTML paste" with:

````mdx
### Paste results

`EditorContent` calls `onPasteResult` once for each paste that Plate's
built-in formats handle: after the pasted content commits (`inserted: true`),
or when no format can insert it (`inserted: false`).

```tsx
<EditorContent
  onPasteResult={({ diagnostics, inserted }) => {
    if (diagnostics.some(({ impact }) => impact === "lossy")) {
      toast.warning(
        inserted
          ? "Some pasted content was left out."
          : "The pasted content could not be inserted."
      );
    }
  }}
/>
```

`diagnostics` holds the reports of the format whose content was inserted.
Loss reported by an earlier format that could not be used stays in the list
unless the inserted format decoded the same MIME type: plain text that
matches the HTML text does not recover what the HTML lost.

Only the editor surface that received the paste is called, and only while it
is mounted. `onPasteResult` is not called when `onPaste` or a
`domCommands.insertData` handler handles the paste, for drops, or for
`editor.api.dom.clipboard.insertData`, which returns a boolean.

The registry `Editor` shows one warning toast for a lossy paste and nothing
for lossless cleanup. Pass `onPasteResult` to replace it.

Paste results do not name the format that handled a paste. When a source
keeps losing content, add the missing mapping: an HTML rule in the owning
plugin's `formats`, or a format for that MIME type.
````

In `content/docs/api/core/plate-components.mdx`, add to the `EditorContent` props:

```mdx
<APIItem name="onPasteResult" type="(result: EditablePasteResult) => void" optional>
  Called once for each paste that the built-in formats handle: after the paste
  commits (`inserted: true`), or when no format can insert it
  (`inserted: false`). `diagnostics` lists `{ impact, message }` reports;
  `impact: 'lossy'` means pasted content was left out.
</APIItem>
```
