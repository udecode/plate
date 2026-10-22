---
review_scopes: [uploads]
review_basis: [2026-10-04-uploads-audit-2]
verdict: pursue
work_kind: implementation
review_commit: 666f02406e936864cc61e5ccb6824321df4d9a42
review_inputs: [VISION.md, docs/vision/common.md, docs/vision/plate.md, docs/research/decisions/uploads-ownership.md, docs/research/review-records/2026-10-04-uploads-audit-2.json, docs/plans/2026-10-01-dnd-transfer-consolidation.md, docs/plans/2026-09-19-upload-draft-asset-protocol.md, docs/plans/topics/dnd.md, '!packages/plitejs/src/core/public-state.ts', '!packages/plitejs/src/interfaces/editor.ts', packages/plitejs/src/dom/plugin/dom-drag.ts, packages/plitejs/src/dom/plugin/dom-editor.ts, packages/plitejs/src/react/editable/clipboard-input-strategy.ts, packages/plitejs/src/core/transfer.ts, packages/platejs/src/react/utils/pipeHandler.internal.ts, content/docs/(guides)/upload.mdx, content/docs/(plugins)/(elements)/media.mdx, content/docs/(plugins)/(functionality)/dnd.mdx, apps/www/scripts/run-dnd-perf.mts, apps/www/src/app/dev/dnd-perf/page.tsx]
review_upstreams: ['../tiptap@91c51be53c4655ef07e29ec489471524debfa0ca', '../lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988', '../prosemirror-view@ca4c78e9b56f1b164c0b3758b59d8748f11b7534', '../prosemirror-dropcursor@061f64ac887a9fac2bf5ef36d31ad4d13a4ecd36', '../BlockNote@1e26f1c5e1cd7df81df9d4ab2a853bf1b298b163', '../ckeditor5@14e73cc31b869ce483bd8449f40b9102ac7746da']
---

# Uploads: every dropped file lands at the edge under the pointer

Status: executed: built and proven in this checkout on next, uncommitted; waiting on your commit
Playbook: plan

Pursue, superseding `2026-10-04-uploads-audit-2` with the same target. The React `UploadPlugin`'s `nativeDrop` option lost its only job when DnD stopped routing files on 2026-10-01. Its off state, the package default, does not turn file drops off. It sends them through Plite's default drop into the paste interceptor, which places them after the drop caret's block with no landing rules. The upload guide's own setup never sets the option, so an app that follows the docs gets that path. Delete the key, and let the React plugin land every external file drop at the block edge under the pointer, through the same landing rules as a block drag. `uploads` is the scope `review-ledger.mjs next` returned. It shares no source file with the in-flight `authored` and `suggestions` plans; both this plan and theirs edit `docs/vision/plate.md`, in different sections, and run `build:registry`.

## Brief

### What will change?

Done. A file dropped into any editor with the upload plugin now lands next to the block under the pointer, or nowhere if that spot isn't allowed. The drop switch is gone, speed is unchanged, and the docs match.

### What could go wrong?

Apps that set the switch must delete that line. Without the drag-and-drop kit, nothing shows where a hovering file will land. A rare document setup can make a drop fail with an error. The Close lists the review's warnings.

## Teach

An upload starts when files reach the upload plugin from the toolbar picker, a paste or a drop. The plugin checks the batch, inserts one draft block per file, sends each file to storage, and swaps each draft for a media block when its upload finishes.

Drops used to take one of two routes. The copied kit turned a switch on, so the plugin checked the spot under the pointer with the block-drag rules and landed the files there. Without the kit the switch was off, so the editor treated the drop like a paste and put the files after the block under the caret, unchecked.

The switch existed so the old drag-and-drop plugin could handle files instead. That plugin stopped on October 1, which left off as the worse route. The switch is gone now, so every drop takes the checked route. The drag-and-drop kit draws the drop line, so without it files land right but show no line.

## Demo

1. Run `pnpm --filter www dev`, then open `http://localhost:3000/blocks/clipboard-upload-proof`. This editor sets up the upload plugin the way the upload guide shows, with no drop option.
2. Drag an image file from your desktop onto the top half of the line that reads "target". The new upload block lands above "target". Before the change it landed below, after the block holding the caret. The frames outline the upload block, which this proof page draws empty.
   ![before](artifacts/2026-10-09-uploads-review/demo/before.png) ![after](artifacts/2026-10-09-uploads-review/demo/after.png)
3. Open `http://localhost:3000/blocks/playground` and drag three images over the first block. A line shows where they will land, and they land there, as before the change.

## Public API

The copied kit drops one line. The guide's setup, which never set the option, gains the landing rules with no code change.

```tsx before
// apps/www/src/registry/components/editor/upload.tsx
export const UploadKit = [
  UploadPlugin.configure({
    component: UploadElement,
    initialState: {
      client,
      getUrl: ({ key }) => {
        const url = new URL(endpoint, window.location.origin);
        url.searchParams.set('op', 'download');
        url.searchParams.set('key', key);
        return url.href;
      },
      maxFiles: 5,
      nativeDrop: true,
      onError: showUploadFailure,
      rules: {
        // The kit's audio, blob, pdf, text and video rules take the same shape.
        image: {
          kind: 'image',
          maxBytes: 4 * 1024 * 1024,
          maxFiles: 3,
          minFiles: 1,
        },
      },
    },
  }),
];
```

```tsx after
// apps/www/src/registry/components/editor/upload.tsx
export const UploadKit = [
  UploadPlugin.configure({
    component: UploadElement,
    initialState: {
      client,
      getUrl: ({ key }) => {
        const url = new URL(endpoint, window.location.origin);
        url.searchParams.set('op', 'download');
        url.searchParams.set('key', key);
        return url.href;
      },
      maxFiles: 5,
      onError: showUploadFailure,
      rules: {
        // The kit's audio, blob, pdf, text and video rules take the same shape.
        image: {
          kind: 'image',
          maxBytes: 4 * 1024 * 1024,
          maxFiles: 3,
          minFiles: 1,
        },
      },
    },
  }),
];
```

## Layer and owner

| Delta | Job | Owner |
| --- | --- | --- |
| changed | Dropped files with an indicator and landing rules | React `UploadPlugin` in `platejs/upload/react`, for every external drag that carries files; the copied DnD kit paints the line |
| removed | Dropped files with `nativeDrop` off | Plite's default drop runs `insertData`, so the paste interceptor places them after the drop caret's block |
| added | Dropped files in an editor with only `BaseUploadPlugin` | Plite's default drop runs `insertData`, so the paste interceptor places them after the drop caret's block |

## Hard cuts and app migration

`nativeDrop` leaves the React `UploadPlugin`'s state, with no alias. The callers that break are the copied kit (`apps/www/src/registry/components/editor/upload.tsx` line 247) and `UploadPlugin.spec.ts`. The pages that teach it are `media.mdx` line 387, `dnd.mdx` lines 23 and 71, the upload guide's table row on line 153, their Chinese twins and `docs/vision/plate.md` line 1143. Two unreleased changesets teach it, `.changeset/plate-transfer-landing-rules.md` by name and `.changeset/media-v54-runtime.md` lines 24 and 33 as "Honor disabled file drops" and "optional native-drop adaptation", and the generated registry payloads and API reference manifest carry it. No published version has it, because it landed on 2026-09-21, after `platejs@54.0.0-beta.1` on 2026-06-17.

An app that set the key deletes the line, and TypeScript names it:

```tsx
UploadPlugin.configure({
  component: UploadElement,
  initialState: { client, getUrl, onError },
}),
```

An app that left the key off gets the landing rules with no code change. An app with an `insertData` input rule whose `mimeTypes` include `Files` stops receiving dropped files once the React upload plugin is installed, while pasted files still reach the rule; no first-party rule matches `Files`. An app that must keep uploads but refuse dropped files adds a transfer veto for the files payload. The landing check then refuses every spot, so the upload plugin shows no line and consumes the drop, while paste and the picker keep working:

```tsx
import { transferVeto } from 'platejs';
import { definePlugin } from 'platejs/react';

export const RefuseFileDropsPlugin = definePlugin('refuseFileDrops', {
  contributions: [transferVeto.of(({ payload }) => payload.kind === 'files')],
});
```

## Native behavior and proof

| Behavior | What changes | Proof surface |
| --- | --- | --- |
| A file dropped into an editor configured as the upload guide shows | Lands at the block edge under the pointer through the landing rules, instead of after the caret's block | Chromium, a new case in `apps/www/tests/browser/clipboard-upload.spec.ts` on `/blocks/clipboard-upload-proof`, five warm runs without retries |
| Focus after a file drop in a guide-configured editor | Focus stays where it was, as in the copied kit today; before the cut, Plite focused the editor | Chromium, a new case in `clipboard-upload.spec.ts` that drops while the toolbar button holds focus, which fails before the cut |
| Selection after a file drop | The upload plugin no longer sets it; before the cut, Plite set it at the drop point | Source only: `UploadPlugin.tsx` `on.drop` and `submit`'s keyed insert set no selection |
| A file drop in the copied kit | Unchanged | Chromium, the existing three-image drop in `apps/www/tests/browser/files-sdk.spec.ts` |
| The drop line while files hover in the copied kit | Unchanged; the DnD kit paints it | Chromium, the three-image drop asserts `[data-drop-indicator]` after its `dragover` |
| Hover feedback in an editor without the DnD kit | Regresses. The upload plugin calls `preventDefault` on `dragover`, which hides the browser's own caret, and nothing paints a line | unproven; recorded as a look default |
| A spot the hover check admits but the real batch does not | Unchanged, and now reached by guide-configured editors too. Hover and drop check `file`-kind stand-ins, while `submit` creates each draft with its own kind. Under a schema whose content prefix requires an `upload` of kind `file`, an image dropped there throws `EditorSchemaValidationError` out of the drop handler, leaves the document unchanged and skips `onError`. No first-party schema constrains draft kind. The registry's `plugins.schema.json` lists `upload` only in content lists and as the owner of its own `kind` property (read 2026-10-09) | Source probe on the switched-on kit path (`probes/kind-prefix-a2.log`), with target resolution mocked; after the decision-trail review, an unmocked Chromium drop with the cut (`probes/kind-prefix-browser-a3.log`); tracked in Open work |
| A drag that carries text or HTML but no files | Unchanged; Plite's default drop handles it | jsdom, a new must-still-accept case in `UploadPlugin.spec.ts` |
| Pasted files | Unchanged | Chromium, the existing paste cases in `clipboard-upload.spec.ts` |
| File drops in a read-only editor | Unchanged; Plite refuses every files landing (`transfer.ts` line 820) | unproven at runtime |

## Main changes

- The React `UploadPlugin` handles every external drag that carries files. No state flag gates its `dragOver` and `drop` handlers.
- In an editor with the React plugin, a drag that carries files never reaches `BaseUploadPlugin`'s `insertData` interceptor. The interceptor still handles pasted files, and file drops in an editor that installs only `BaseUploadPlugin`; text and HTML drops still reach `insertData` and pass through it.
- The hover check stays approximate, as the 2026-10-02 landing plan recorded. It checks one `file`-kind stand-in per file, and an engine that hides the file count during `dragover` checks one stand-in in all; the drop checks every file but still with `file`-kind stand-ins.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| The file drop switch | Remove it, so every editor with the upload plugin lands dropped files at the pointer (look) | Keep a switch, on by default, whose off setting ignores dropped files | keep drop switch | big |
| Drops that also carry web page markup | Upload the files, as the copied kit does today | Insert the markup instead, as a paste does | markup wins on drop | small |
| What happens after this verdict | Plan the cut and build it in this run, after two panel rounds (look) | Stop at the reviewed plan | hold | big |
| The drop line without the drag-and-drop kit | Leave the line to that kit and say so in the upload guide, so those editors lose the browser's caret while files hover (look) | Draw the line from the editor itself, a drag-and-drop change for later | view draws drop line | small |
| Focus after a file drop | Leave focus and selection where they were, as the copied kit does | Focus the editor and put the caret by the dropped files | focus on file drop | detail |
| Files dropped where only the headless upload plugin is installed | Keep the paste route and say so in the docs | Make the editor handle file drops for the headless plugin too | headless file drops | detail |
| How an app refuses dropped files | A plugin that vetoes file landings, shown in the docs | A new option on the upload plugin | refuse drop option | detail |
| A rejected batch in a drop that also carries markup | Report the rejection and insert nothing | Insert the markup when the files are rejected | markup fallback on drop | detail |
| Where the speed baseline runs | A clean copy of the code at the starting commit, since the machine was too busy for the first run (look) | Undo the cut, rerun the baseline in this checkout on a quiet machine, then cut again | baseline in checkout | detail |

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `nativeDrop` | React state, default `false` | Deleted | none | Its off state routes drops to the caret's block, and its on state is the only correct path | Kit line, spec helper, media and DnD docs and twins, Vision, pending changeset, generated outputs | Package spec and Chromium case fail before and pass after | An app that relied on caret-placed drops moves to the pointer | cut |
| React file drop handler | Runs only with the switch on | Runs for every external drag that carries files | `UploadPlugin` in `platejs/upload/react` | One gesture follows one landing law | None | Same as above, plus the scale probe in steps 2 and 6 | Guide-configured editors gain per-`dragover` landing work; a drag from another document that carries files and editor content uploads the files (not verified in a browser) | adopt |
| `insertData` file interceptor | Paste and switch-off drops | Paste and headless-only drops | `BaseUploadPlugin` | It cannot tell a drop from a paste | None | Existing paste cases | None | keep |
| Drop line painter | Copied DnD kit | Copied DnD kit | `dnd.tsx` `DropIndicator` | `docs/vision/plate.md` line 1133 gives painting to the kit; the `layout` plan is changing `dnd.tsx` | Upload guide sentence | none | Upload without the DnD kit shows no line | defer |

## Steps

The Build playbook executes this plan. Every step runs in this checkout on `next`, and nothing is committed. Authority: the owner's "/verdict next while we're doing authored one (pick non conflicting one)", whose Pursue continues into this build under the Autopilot rule. Packet: `UploadPlugin.tsx` and its spec, the copied `upload.tsx`, the DnD perf page and runner, `clipboard-upload.spec.ts`, `files-sdk.spec.ts`, the upload, media and DnD docs with their twins, `docs/vision/plate.md` line 1143, two pending changesets, a registry changelog entry, generated registry output and the API reference manifest, and the upload and DnD subject files.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Blast radius before code | yes | `pstack:blast-radius` on `nativeDrop` before step 3 | `docs/plans/artifacts/2026-10-09-uploads-review/blast-radius.md` |
| Hard cut sweep | yes | Callers, exports, tests, docs, examples, browser proof and benchmarks swept for the key | `docs/plans/artifacts/2026-10-09-uploads-review/checks/grep-switch-a1.log`; diff round 1 found two paraphrases the grep missed, fixed with `docs/plans/artifacts/2026-10-09-uploads-review/panel-diff/repro-r1-a1.log` |
| Best API repair | yes | Step 8 | `docs/plans/artifacts/2026-10-09-uploads-review/checks/grep-switch-a1.log` and the Vision line 1143 edit |
| Plate Docs | yes | Step 7 | `docs/plans/artifacts/2026-10-09-uploads-review/www-build-source-a3.log` and `docs/plans/artifacts/2026-10-09-uploads-review/www-build-registry-check-a3.log` after the last docs edit |
| Changeset | yes | Step 9 | `docs/plans/artifacts/2026-10-09-uploads-review/checks/check-registry-changelog-a1.log` |
| Generated output | yes | Step 10 | `docs/plans/artifacts/2026-10-09-uploads-review/checks/build-registry-check-close-a1.log` and `docs/plans/artifacts/2026-10-09-uploads-review/checks/api-reference-check-a1.log` |
| Check steps the edits reach | yes | `pnpm check` steps for typecheck, barrels, registry changelog and review ledger before the acceptance runs | `docs/plans/artifacts/2026-10-09-uploads-review/checks/check-barrels-a1.log`, `check-registry-changelog-a1.log` and `check-review-ledger-a1.log` in that directory; the knowledge step fails the same way at `HEAD` (`docs/plans/artifacts/2026-10-09-uploads-review/checks/knowledge-at-head-a1.log`) |
| Code quality review | skip | The `api-build` panel on the diff is owed, and every seat applies the code-quality lens | skip: api-build panel owed |
| Slice freezes | yes | `freeze.mjs` after each slice | Frozen commits named in the decision log's panel and verify rows, the last `9af49618e9` (`docs/plans/artifacts/2026-10-09-uploads-review/mutate-final.json`) |
| Type-aware lint before the panel | yes | `pnpm exec oxlint --type-aware --format=default` on the task's lintable files | `docs/plans/artifacts/2026-10-09-uploads-review/checks/oxlint-typeaware-a1.log` |
| Writing passes | yes | `deslop`, then `no-comments`, on product code before the panel | Decision-log `writing` rows; comment-sicko replies `docs/plans/artifacts/2026-10-09-uploads-review/comment-sicko/reply.md`, `reply-r1fix.md` and `reply-r2fix.md` |
| Diff panel | yes | `api-build` reviews row | Two rounds; seat answers in `docs/plans/artifacts/2026-10-09-uploads-review/panel-diff/` |
| Last lint fix | yes | `pnpm lint:task` on the task's files | `docs/plans/artifacts/2026-10-09-uploads-review/checks/lint-task-a1.log`; the task files still match the final frozen commit |
| Scale rerun on final bytes | yes | Step 6 contract after the last fix | `docs/plans/artifacts/2026-10-09-uploads-review/bench/compare-frozen-final-a1.log` |
| Decision-trail review | yes | A critical finding was dismissed in plan round 2 | `docs/plans/artifacts/2026-10-09-uploads-review/trail/seat-sol.md`; its flags are settled in decision-log lines 73 to 79 and listed in the Close's Attention |
| Feature plan check | N/A | Not a `plate-plugins` feature-delivery plan | skip: not a feature template plan |

- [x] 1. Write the package cases first in `packages/platejs/src/react/features/upload/UploadPlugin.spec.ts`. Replace "leaves native file drops to the DnD owner by default" with "lands a file drop at the resolved edge with no drop configuration"; add "accepts a file drag with no drop configuration", "uploads the files of a drop that also carries HTML" and "passes a drag without files through"; and make the refused-landing case also assert that the handler reports the drop handled. Drop `nativeDrop` from the `configured` helper and its two callers. Proof: the spec at `666f02406e` in a `tooling/scripts/proof-worktree.mjs --with` worktree fails the lands, accepts and refused-landing cases under `--expect-fail`, rerun because `controls/spec-at-base-a1.log` predates the rename and the handled assertion. The HTML case also fails at base, only because the handler is gated off, and the pass-through case passes there. So after step 3, `.agents/pstack/mutate.mjs` on a frozen commit plants three mutants, and each must fail its own case: an HTML-wins guard (the HTML case), a dropped `Files` check (the pass-through case), and `undefined` returned for a refused landing (the refused-landing case's handled assertion).
  Closed by: `docs/plans/artifacts/2026-10-09-uploads-review/controls/spec-at-base-a2.log` (three expected failures at base) and `docs/plans/artifacts/2026-10-09-uploads-review/mutate/html-wins-on-drop-a1.log`, `drop-without-files-check-a1.log`, `refused-landing-unhandled-a1.log` (each mutant fails its own case; control `mutate/control-1-a1.log` passes).
- [x] 2. Run the scale probe's baseline. Give `apps/www/src/app/dev/dnd-perf/page.tsx` an `upload` parameter that adds the copied `UploadKit` and a `refuse` parameter that adds the veto recipe. Give `apps/www/scripts/run-dnd-perf.mts` a `--files <n>` mode that times `dragover` events carrying n files over the cohort's targets, still and moving, and a `--cells` option that moves both targets into the column group's cells. Each run reads back the hovered block's column membership, `[data-drop-indicator]` and the drop effect, and fails when they differ from its cohort, and it records the host load. Run every cohort in Performance on this checkout before step 3, then restate or freeze line 2 from those results as Performance says. Proof: attempt-indexed logs in the run directory, read with `pstack:benchmark-checklist`.
  Reopened: diff rounds 1 and 2 showed the readback could not prove the handler ran, the moving landings changed or the page size matched, so both arms rerun at final acceptance with the runner's claimed-dragover, four-landing and block-count checks.
  Deviation: the in-checkout baseline ran with the host's one-minute load at 17 to 23 on 18 cores from other projects, so every cohort is inconclusive (decision log line 26). The baseline moves to a `proof-worktree.mjs` worktree at `666f02406e` with the two harness files copied in, run back to back with the candidate once the load is under 9.
  Deviation: the runner reads back the drop line and column membership but not the drop effect, because Chrome ignores a handler's write to a constructed `DataTransfer`; the package spec asserts `copy` instead.
  Closed by: `docs/plans/artifacts/2026-10-09-uploads-review/bench/compare-frozen-final-a1.log` (the worktree baseline's eight cohorts and four extra packets, rerun with the final runner on `docs/plans/artifacts/2026-10-09-uploads-review/bench/worktree-setup.log`'s worktree on :3318; the base misses relative line 2 only on moving column cells, which take the 8 ms cap).
- [x] 3. Run `pstack:blast-radius` on `nativeDrop`, then delete it from `packages/platejs/src/react/features/upload/UploadPlugin.tsx`: the `initialState` extend, both `store.get('nativeDrop')` reads, and the opt-in wording in the JSDoc. Proof: the step 1 spec passes, and `pnpm --filter platejs typecheck` is clean.
  Closed by: `docs/plans/artifacts/2026-10-09-uploads-review/blast-radius.md`, `docs/plans/artifacts/2026-10-09-uploads-review/upload-spec-after-cut-a1.log` (10 pass), `docs/plans/artifacts/2026-10-09-uploads-review/platejs-typecheck-a1.log` (exit 0) and `docs/plans/artifacts/2026-10-09-uploads-review/probes/stale-key-a2.log` (a leftover key is ignored at runtime).
- [x] 4. Delete `nativeDrop: true` from `UploadKit` in `apps/www/src/registry/components/editor/upload.tsx`, and make the files-sdk three-image drop assert `[data-drop-indicator]` after its `dragover`. Proof: the TypeScript half of `pnpm --filter www typecheck` reports no new error in the task's files. It runs on its own, because the script runs the generators first and stops at their stale output until step 10. The three-image drop passes in Chromium.
  Closed by: `docs/plans/artifacts/2026-10-09-uploads-review/www-tsc-a1.log` (0 errors; the scripts config `www-scripts-tsc-a1.log` has one error, in `packages/platejs/src/code-drawing/lib/renderers.ts`, outside the task) and `docs/plans/artifacts/2026-10-09-uploads-review/verify/files-sdk-drop-a1.log` (the three-image drop passes with the drop line asserted).
- [x] 5. In `apps/www/tests/browser/clipboard-upload.spec.ts` on `/blocks/clipboard-upload-proof`, keep "a file dropped on the top half of a block lands before it" and add "a file drop leaves focus where it was", which focuses the toolbar button, drops a file on `target` and asserts the button still holds focus. Proof: the landing case failed before the cut (`controls/browser-drop-before-cut-a1.log`), and the focus case runs once on this checkout before step 3, where Plite's default drop focuses the editor and it must fail. After step 4 both pass five warm runs without retries, with the existing paste cases green in the same run.
  Closed by: `docs/plans/artifacts/2026-10-09-uploads-review/controls/browser-focus-before-cut-a1.log` (focus case fails before the cut) and `docs/plans/artifacts/2026-10-09-uploads-review/verify/clipboard-upload-warm-a1.log` to `-a5.log` (five runs, 5 of 5 cases each, no retries).
- [x] 6. Rerun the scale probe's contract on this checkout after step 4. Proof: every frozen line passes on an unloaded host; a loaded host leaves the result inconclusive and the `React file drop handler` ledger row at `gate`.
  Reopened: diff rounds 1 and 2 showed the readback could not prove the handler ran, the moving landings changed or the page size matched, so both arms rerun at final acceptance with the runner's claimed-dragover, four-landing and block-count checks.
  Closed by: `docs/plans/artifacts/2026-10-09-uploads-review/bench/compare-frozen-final-a1.log` (on the final bytes, line 1 passes all 32 checks and the candidate passes relative line 2 everywhere; the moving column-cell cohorts take the 8 ms cap, which both arms meet), `docs/plans/artifacts/2026-10-09-uploads-review/bench/compare-frozen-known-bad-a1.log` (the evaluator fails the planted runs on every line), `docs/plans/artifacts/2026-10-09-uploads-review/bench/plant-check-final-a1.log` (the planted 2 ms delay fails every line), the controls `docs/plans/artifacts/2026-10-09-uploads-review/bench/final-bad-page-blocks-a1.log`, `final-bad-still-moving-a1.log`, `final-bad-no-upload-a1.log` and `final-bad-membership-a1.log` in that directory (each fails with its own readback text) and `docs/plans/artifacts/2026-10-09-uploads-review/bench/checklist-report-final.md` (five alternating packets per side on the decisive cohorts, load 1.9 to 2.8 on 18 cores).
- [x] 7. Run `plate-docs` on `content/docs/(guides)/upload.mdx`, `content/docs/(plugins)/(elements)/media.mdx` and `content/docs/(plugins)/(functionality)/dnd.mdx` with their `.cn.mdx` twins. The media page says the React plugin lands dropped files at the edge under the pointer, and that an editor with only the headless plugin places them after the drop point's block. The DnD page drops the switch from lines 23 and 71 and their twins. The upload guide's table row loses "optional", and the guide says the DnD kit draws the drop line and shows the veto recipe. Proof: a source probe shows `checkFilesLanding` refuses every edge with the recipe's veto installed and admits it without; the edited text read back; `pnpm --filter www build:source`; and `pnpm --filter www build:registry` then `--check` once after the final prose pass.
  Closed by: `docs/plans/artifacts/2026-10-09-uploads-review/probes/veto-recipe-a2.log` (the recipe in the docs shape refuses every edge), `docs/plans/artifacts/2026-10-09-uploads-review/www-build-source-a1.log`, `docs/plans/artifacts/2026-10-09-uploads-review/www-build-registry-a1.log` and `docs/plans/artifacts/2026-10-09-uploads-review/www-build-registry-check-a1.log` (fresh).
- [x] 8. Run `best-api repair` for the removed key. `docs/vision/plate.md` line 1143 becomes: "Dropped files land through the React `UploadPlugin` and the `files` option of `resolveDropTarget`, so file landings pass the same landing rules and a refused landing inserts nothing; an editor with only `BaseUploadPlugin` places them after the drop point's block." Then fix every live artifact that still teaches the switch. Proof: `git grep -n -i -E 'nativeDrop|native drop|native-drop|disabled file drop|原生拖放'` lists only history (closed plans, decision logs, review records, the 2026-10-01 registry changelog) and output that step 10 rewrites.
  Closed by: `docs/plans/artifacts/2026-10-09-uploads-review/checks/grep-switch-a1.log` (only history, this run's files and the subject files step 11 folds).
- [x] 9. Run `changeset`: remove "With `nativeDrop`," from `.changeset/plate-transfer-landing-rules.md` and, from `.changeset/media-v54-runtime.md`, line 24 ("Honor disabled file drops") and the native-drop clause of line 33, add no package changeset because no published version has the key, and add a registry changelog entry for the `upload` kit. Proof: `pnpm check registry-changelog`.
  Closed by: `docs/plans/artifacts/2026-10-09-uploads-review/checks/check-registry-changelog-a1.log` and `docs/plans/artifacts/2026-10-09-uploads-review/changelog-check-a1.log`; the registry entry is the amended unreleased 2026-10-01 entry, per the deviation row.
- [x] 10. Regenerate output: `pnpm --filter www build:registry`, and the API reference manifest in `proof-worktree.mjs <path> 666f02406e --install --with packages/platejs/src/react/features/upload/UploadPlugin.tsx`, which builds `plitejs` and `platejs` and runs `api-reference` without other sessions' uncommitted `plitejs` edits; copy back only the manifest. Proof: `pnpm --filter www build:registry --check` and `git grep -c nativeDrop -- apps/www/public/r apps/www/src/generated` at zero.
  Closed by: `docs/plans/artifacts/2026-10-09-uploads-review/checks/build-registry-check-close-a1.log` (fresh at the close), `docs/plans/artifacts/2026-10-09-uploads-review/regen-manifest-a1.log` (the manifest regenerated at the close, because the first build predated round 1's JSDoc rewrite), `docs/plans/artifacts/2026-10-09-uploads-review/checks/api-reference-check-a1.log` (the manifest check passes on the base plus the final plugin) and `docs/plans/artifacts/2026-10-09-uploads-review/trail/generated-no-key-a1.log` (no generated file holds the key).
- [x] 11. Fold the plan: update `docs/plans/topics/uploads.md`, the `nativeDrop` lines in `docs/plans/topics/dnd.md`, and add a dated paragraph above the 2026-10-04 audit in `2e865a0bc4:docs/research/decisions/uploads-ownership.md`, whose audit text stays as history. Proof: `node .agents/pstack/plan-page.mjs docs/plans/2026-10-09-uploads-review.md --folded` and `node tooling/scripts/review-ledger.mjs check`.
  Closed by: `docs/plans/artifacts/2026-10-09-uploads-review/checks/plan-page-folded-a2.log` and `docs/plans/artifacts/2026-10-09-uploads-review/checks/review-ledger-close-a2.log`; pre-fold copies `docs/plans/artifacts/2026-10-09-uploads-review/uploads-topic.before-fold.md`, `dnd-topic.before-fold.md` and `uploads-ownership.before-fold.md` in that directory.
- [x] 12. Close: `deslop`, `no-comments`, the `api-build` panel on the diff, `pnpm lint:task` on the task's files, then the final rerun of steps 1, 4 and 5 on the settled bytes, then `/pstack:correct` on the classes "new code copies an existing owner" (plan round 1) and "docs still teach a removed option" (diff round 1). Proof: the panel's `seats` rows, the rerun logs and the correct run's output.
  Closed by: the diff panel's two `seats` rows with answers in `docs/plans/artifacts/2026-10-09-uploads-review/panel-diff/`; `docs/plans/artifacts/2026-10-09-uploads-review/checks/lint-task-a1.log`; the final reruns `docs/plans/artifacts/2026-10-09-uploads-review/mutate/control-1-a2.log`, `docs/plans/artifacts/2026-10-09-uploads-review/final/files-sdk-drop-final-a1.log` and `docs/plans/artifacts/2026-10-09-uploads-review/final/clipboard-upload-final-a5.log`; and the correct pass in `docs/plans/artifacts/2026-10-09-uploads-review/correct/sweep-at-base-a9.log` and `docs/plans/artifacts/2026-10-09-uploads-review/correct/mutate/superseded-plan-live-a1.log`, with its own panel's three `seats` rows.

## Performance

The performance pack applies, because guide-configured editors start resolving a landing on every `dragover` that carries files.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Performance pack selected | yes | `AGENTS.md` Proof and tooling: the change adds repeated work per `dragover` |
| User-facing operation and runtime owner identified | yes | One `dragover` carrying files over a block, handled by `UploadPlugin`'s `on.dragOver` through `resolveDropTarget({ files })` and `indicate` |
| Scale variables and cohorts fixed | yes | Root paragraphs at 1,000 and 5,000 blocks (normal, large); cells of the five-column group at 5,000 blocks (stress); the same cells with the veto recipe installed (refused); 1 and 3 files per drag; still and moving pointer in each |
| Budget frozen before target measurement | yes | Line 1 holds candidate file `dragover` p95 to at most baseline p95 plus max(1 ms, 5%) per cohort, the DnD benchmark's budget (`docs/plans/2026-10-01-dnd-transfer-benchmark.md`). Line 2 holds file `dragover` p95 to at most block `dragover` p95 plus max(1 ms, 5%) in the same run and cohort, and runs on the baseline before it freezes. If the baseline misses it, line 2 is restated before the candidate runs as an absolute cap of 8 ms p95 per file `dragover`, half a 60 Hz frame, because `dragover` repeats through the whole gesture. Under the one acceptance rule, a candidate that misses any frozen line keeps the `React file drop handler` ledger row at `gate`, stops the build before step 7, and a new plan iteration adds a check cache to Plite's files landing. A planted 2 ms busy loop in a capture `dragover` listener for file drags, run on the candidate, must fail both lines |
| Baseline and target probe selected | yes | Baseline: the copied kit, switch on, on this checkout before step 3. Target: the same page after step 4, switch gone. Line 1 checks that nothing besides the gate moved; line 2 bounds the work that guide-configured editors now pay |
| Correctness guard selected | yes | Each file cohort reads `[data-drop-indicator]` as `y`, or none when refused, and the hovered blocks' column membership; the drop effect `copy` is asserted by the package spec, because Chrome ignores a handler's write to a constructed `DataTransfer`; steps 1, 4 and 5 |
| Production detector decision recorded | N/A | No runtime detector covers drag events; the harness is the owner |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Pre-acceptance scale proof | yes | Steps 2 and 6 | `docs/plans/artifacts/2026-10-09-uploads-review/bench/compare-frozen-final-a1.log` |
| Warm latency budget | yes | Line 1 per cohort | Line 1 passes all 32 checks in `docs/plans/artifacts/2026-10-09-uploads-review/bench/compare-frozen-final-a1.log` |
| Large/stress scaling | yes | The 5,000 and column cohorts | Same log; worst candidate p95 6.5 ms on moving column cells |
| Cold and failure paths | yes | The refused cohort, where every candidate edge reaches the veto; cold mount is unchanged | The refused cohorts pass with no drop line and no landing, in the same log |
| Payload and fan-out | N/A | No payload or subscription changes; `indicate` publishes to the existing per-view store | Source: `dom-drag.ts` `indicateDOMDropTarget` |
| Production-path rerun | yes | Step 6 on the final bytes | `docs/plans/artifacts/2026-10-09-uploads-review/bench/checklist-report-final.md`; development-mode servers on both arms |
| Correctness guard | yes | Steps 1, 4 and 5 | `docs/plans/artifacts/2026-10-09-uploads-review/mutate/control-1-a2.log`, `docs/plans/artifacts/2026-10-09-uploads-review/final/files-sdk-drop-final-a1.log` and `docs/plans/artifacts/2026-10-09-uploads-review/final/clipboard-upload-final-a5.log` |
| Before/after receipt | yes | Steps 2 and 6 logs | `docs/plans/artifacts/2026-10-09-uploads-review/bench/final-interleaved.out` and `docs/plans/artifacts/2026-10-09-uploads-review/bench/final-packets.out` |
| Detector and privacy | N/A | No detector; no user data | none |
| Performance regression check | yes | `run-dnd-perf.mts --files` | Planted 2 ms delay fails every line: `docs/plans/artifacts/2026-10-09-uploads-review/bench/plant-check-final-a1.log` |

## Open work

- Decide whether the Editable should draw the drop line itself, so an editor without the copied DnD kit shows where files and blocks land; `docs/vision/plate.md` line 1133 gives the line to the kit today, and the in-flight `layout` plan is changing `dnd.tsx`. owner: zbeyens. stop: the next `dnd` review, or 2026-11-30.
- A drop whose full file count no longer fits the edge shown during hover can land at another edge or be refused; only a browser that hides the count during `dragover` reaches it. owner: zbeyens. stop: a report of a misplaced file drop, or 2026-11-30.
- The hover and drop checks use `file`-kind stand-ins while `submit` creates each draft with its own kind, already tracked in `docs/plans/2026-10-02-dnd-schema-derived-landing.md`. Under a schema that constrains upload draft kind by position, a real Chromium drop throws `EditorSchemaValidationError` out of the handler as an uncaught page error, loses the drop and skips `onError` (`probes/kind-prefix-browser-a3.log` in this plan's run directory). No schema in this repository does that, as of 2026-10-10; the fix checks the real kinds before insertion. owner: zbeyens. stop: the first schema that constrains upload draft kind, or 2026-11-30.
- `resolveDropTarget`'s JSDoc in `packages/plitejs/src/dom/plugin/dom-editor.ts` says it resolves "the innermost block edge or side the transfer dry pass admits", but near a nested container's shared edge the band goes to the outermost admitting container (`dom-drag.ts` band loop). owner: zbeyens. stop: the next change to `dom-drag.ts` landing bands, or 2026-11-30.

## Close

Reversals and deviations come first. Line numbers point into the decision log.

- The Vision sentence differs from step 8's approved wording, "places them after the drop point's block". Diff round 1 found that an editor with only `BaseUploadPlugin` handles a drop as a paste, where HTML wins and no veto runs, so line 1143 now says it handles them "as a paste, without landing rules or vetoes" (lines 50 and 72).
- The scale baseline ran in a worktree at `666f02406e` with the harness copied in, not in this checkout before the cut, because other projects loaded the host (line 26). The runner reads back the drop line and column membership but not the drop effect; the package spec asserts the effect instead (line 35).
- Step 9 amended the unreleased 2026-10-01 registry changelog entry instead of adding one (line 33).
- Diff rounds 1 and 2 reopened steps 2 and 6, because the first readback could not prove the handler ran. Both arms reran on the final bytes with the final runner, and the old receipts are superseded (lines 45, 54 and 63). The final comparison uses `compare-frozen.mjs`, because `compare.mjs --line2-cap` capped every cohort instead of only those whose base missed line 2 (line 60).
- The Public API pair quoted a `rules,` line the kit never had; it now quotes the kit's inline rules (line 64).
- Step 10's API reference manifest predated round 1's rewrite of the plugin's doc comment, which the close found while checking that receipt. The manifest was regenerated the same way, and its check now passes (line 95).

What landed:

- The React `UploadPlugin` handles every external drag that carries files. It lands the files at the block edge under the pointer and consumes a drop no edge admits. `nativeDrop` is gone, and the copied kit no longer sets it.
- New package cases cover the landing, accepting a file drag, a drop that also carries HTML, passing a drag without files through, and the consumed refusal. New Chromium cases cover the top-half landing and focus after a drop. The playground's three-image drop now asserts the drop line.
- The run updated the upload, media and DnD pages with their Chinese twins, the Vision line, two pending changesets and the registry changelog entry, and regenerated the registry output and the API reference manifest.
- The DnD perf page and runner gained a file lane with work readbacks and known-bad controls.
- The plan folded into the uploads subject, five lines of the DnD subject and the uploads decision page.
- `/pstack:correct` on two classes. `tooling/scripts/teaching-sweep.mjs` and its test now run best-api repair's search step. The helper lists every line that names a removed API's words, grouped by lifecycle, and every Chinese twin of an English docs hit. A rules-table row names it, and a gate is left as open work in `docs/plans/topics/correct.md`. Its own panel ran the three allowed rounds. They found four critical classes in round 1 and one in round 2, all applied. Round 3 found only warnings, all applied except one deferred case, a status line inside a code fence (lines 80 to 93). Twelve planted mutants each fail their own assertion. Plan lifecycle comes from a new `planLabels` export in `review-ledger.mjs`, which `planStatus` now uses. The copied-owner class stays rule-only, because no check can tell a copied behavior from new code.

Proof and its limits:

- The 10 package spec cases pass, and three planted mutants on the final bytes each fail only their own case (line 56).
- The platejs typecheck and the www `tsc` are clean. The www scripts config has one error, in a file this run did not touch (line 57).
- In Chromium, the five clipboard-upload cases pass in five warm runs without retries, and the three-image drop passes with the drop line asserted, on the final bytes served from source (line 59).
- The scale probe shows no measurable difference between the arms, or between file and block drags. Every frozen line passes, the worst candidate p95 is 6.5 ms on moving column cells, and the decisive cohorts ran five alternating packets per side. A planted 2 ms delay fails every line, and each known-bad control fails for its own defect (lines 61 and 62). The candidate also carries other sessions' uncommitted edits in 19 `plitejs` files, so line 1 compares the cut plus those edits against the base. Line 2, file against block drags in one run, does not depend on them, and the candidate passes it in every cohort without the 8 ms cap (lines 76 and 77). Both servers ran in development mode, and the limiter is inferred, not profiled.
- The lost browser caret while files hover in an editor without the DnD kit is a look default with no runtime proof. Selection after a drop rests on source alone. File drops in a read-only editor, a drag from another document that carries files and editor content, and Firefox, WebKit and Safari have no runtime proof.
- One known defect stays open. The `file`-kind stand-in can admit a spot the real draft kind fails, and the insert then throws out of the drop handler. A real Chromium drop reproduces it with no mocks: the drop is lost, an uncaught error reaches the page, and `onError` never runs (line 75). It stays dismissed only because no schema in this repository constrains the upload kind by position; schemas in apps are unknown. The open item keeps its owner and stop.
- The predicted benefit held. An editor set up as the upload guide shows now lands a dropped file at the edge under the pointer with no code change (the Chromium top-half case), and the React plugin lost its config key and store reads.

Counts: 12 steps, 12 done, 0 partial, 0 skipped, 0 blocked and 0 open.

Review inputs at close, checked with `git diff --numstat 666f02406e` on each:

- Changed by this run: `docs/vision/plate.md` line 1143, `2e865a0bc4:docs/research/decisions/uploads-ownership.md` (the dated paragraph), `docs/plans/topics/dnd.md` (five lines), `content/docs/(guides)/upload.mdx`, `content/docs/(plugins)/(elements)/media.mdx` and `content/docs/(plugins)/(functionality)/dnd.mdx`, and the proof files `apps/www/scripts/run-dnd-perf.mts` and `apps/www/src/app/dev/dnd-perf/page.tsx`.
- Changed by other sessions: `VISION.md` (two invariant lines), `packages/plitejs/src/core/transfer.ts` (hunks in `runTransfer` only) and a second hunk of `docs/vision/plate.md`.
- Unchanged: `docs/vision/common.md`, `docs/research/review-records/2026-10-04-uploads-audit-2.json`, `docs/plans/2026-10-01-dnd-transfer-consolidation.md`, `docs/plans/2026-09-19-upload-draft-asset-protocol.md`, `packages/plitejs/src/dom/plugin/dom-drag.ts`, `packages/plitejs/src/dom/plugin/dom-editor.ts`, `packages/plitejs/src/react/editable/clipboard-input-strategy.ts` and `packages/platejs/src/react/utils/pipeHandler.internal.ts`.

### Attention

reviewed by gpt-6.1-sol @xhigh

- Critical: the snapshot the trail review read left out the regenerated registry output and API manifest, so it still showed `nativeDrop`. The working tree's generated output has no trace of it (line 74).
- Critical: the stand-in dismissal rested on a probe that mocked target resolution. The unmocked Chromium drop now reproduces the throw, and the dismissal rests only on zero schemas in this repository that trigger it (line 75).
- Warning: the candidate arm carried other sessions' uncommitted `plitejs` edits, so the speed comparison against the base is narrower than first claimed (line 76).
- Warning: the 8 ms cap cohorts were picked from base runs that ran alongside the candidate. The candidate passes the stricter line without the cap (line 77).
- Warning: the scripts typecheck error had no base replay. It now fails the same way at the base (line 78).
- Warning: the pick shares files with other sessions. Those files are `docs/vision/plate.md` in separate sections, the registry aggregates that `build:registry` regenerates, one `CODING_STANDARDS.md` row and the skill mirrors that `prepare` regenerates. No source hunk overlaps (line 79).

Open work: the uploads subject's `## Open work` holds four items, the drop line without the DnD kit, the hover-count edge, the stand-in kind throw and the `resolveDropTarget` JSDoc. `docs/plans/topics/correct.md` holds the manifest gate and the deferred review-ledger label findings. zbeyens owns each item, and each names its stop.

## Evidence

Model: Claude Opus 5.5 (`claude-opus-5-5`).

This review supersedes `2026-10-04-uploads-audit-2`. Its verdict, target and lifetime findings hold on current source, and this page replaces its evidence after fifteen member files changed. This review keeps that record's reopening of the browser-provider naming implementation and the four DnD consolidation records, because none of them adopts this cut. It retains the [DnD consolidation plan](2026-10-01-dnd-transfer-consolidation.md), whose move of file drops from DnD to Upload landed, and reopens only the switch that move left in Upload. It retains the [upload draft-asset protocol plan](2026-09-19-upload-draft-asset-protocol.md) except its line 375 decision to make the React drop opt-in, which it reopens because the DnD file callback that decision deferred to is gone. The uploads decision page (`2e865a0bc4:docs/research/decisions/uploads-ownership.md`) still states the 2026-10-04 Pursue and stays true until the build lands.

The editor comparison read these checkouts beside the repository: `../tiptap` at `91c51be53c`, `../lexical` at `dd5c41b131`, `../prosemirror-view` at `ca4c78e9b5`, `../prosemirror-dropcursor` at `061f64ac88`, `../BlockNote` at `1e26f1c5e1`, `../slate` at `945a484df2` and `../ckeditor5` at `14e73cc31b`. Front matter leaves out `../slate`, because untracked `.omx/` and `.tmp/` directories that this run did not create make the ledger read that checkout as moved.

### Requirements

- An external file drop lands where the drop line shows, through the same landing rules as a block drag, and a refused drop inserts nothing (`docs/vision/plate.md` lines 1143 to 1145, `content/docs/(plugins)/(functionality)/dnd.mdx` line 71).
- Names, flags and config keys are API surface, and each needs its own user job (`VISION.md` Common Essentials).
- A public API offers one way to perform each common operation, with no parallel paths (`docs/vision/common.md` Taste).
- Hard cuts beat aliases and deprecated second names (`VISION.md` Invariants 1).
- Upload admits a whole batch atomically, starts transfer after commit, keys files and authority to each live draft, completes into the installed media schema, and revokes on removal, retagging, cleanup and document replacement; history never restarts a request (`docs/vision/plate.md` lines 504 to 521).
- Provider, gateway, storage and durable URL policy stay in copied recipes (`docs/vision/plate.md` lines 1148 to 1154).
- Public docs describe the current API only (`VISION.md` Common Essentials).
- User constraint: "next while we're doing authored one (pick non conflicting one)". The work stays off the `authored` and `suggestions` files.

### Current source

- [`UploadPlugin.tsx`](../../packages/platejs/src/react/features/upload/UploadPlugin.tsx) returns `undefined` from `on.dragOver` and `on.drop` unless `nativeDrop` is on. Its spec still says "leaves native file drops to the DnD owner by default" ([`UploadPlugin.spec.ts`](../../packages/platejs/src/react/features/upload/UploadPlugin.spec.ts) line 71), an owner that no longer exists.
- An unclaimed drop reaches Plite's `applyEditableDrop`, which sets the selection at the event range and runs `domCommands.insertData` ([`clipboard-input-strategy.ts`](../../packages/plitejs/src/react/editable/clipboard-input-strategy.ts) lines 942 to 950). `BaseUploadPlugin`'s interceptor then submits after the caret's block with `replaceEmpty`, and defers to the HTML path whenever the data also holds `text/html` ([`BaseUploadPlugin.ts`](../../packages/platejs/src/features/upload/lib/BaseUploadPlugin.ts) lines 880 to 899).
- The guide's setup example configures `UploadPlugin` without `nativeDrop` (`content/docs/(guides)/upload.mdx` lines 83 to 114), and its API table calls the drop handler optional. `media.mdx` line 387 and `dnd.mdx` line 71 teach the switch.
- `resolveDropTarget` resolves a files drop only to a block edge, never a side ([`dom-editor.ts`](../../packages/plitejs/src/dom/plugin/dom-editor.ts) lines 162 to 170, [`dom-drag.ts`](../../packages/plitejs/src/dom/plugin/dom-drag.ts) lines 661 to 676), so the `'edge' in target` narrowing added with side-drop columns never refuses a real target. A read-only editor refuses every files landing ([`transfer.ts`](../../packages/plitejs/src/core/transfer.ts) line 820).
- Plugin `on.drop` handlers run in plugin order before the Editable's own `onDrop` prop, and the first one that returns `true` stops the rest ([`pipeHandler.internal.ts`](../../packages/platejs/src/react/utils/pipeHandler.internal.ts) lines 138 to 163). An app that must refuse file drops can do it with its own plugin, so that job needs no config key.
- The fifteen member changes since the last review are mechanical: lint fixes in `lib/files.ts`, the authored API rename in `BaseUploadPlugin.lifecycle.spec.ts`, removed `as never` casts in `BaseUploadPlugin.spec.ts`, and the edge narrowing in `UploadPlugin.tsx`. The `dnd.tsx` changes add side-drop columns and touch no file path.
- The 35 package upload specs pass on the current tree (log `docs/plans/artifacts/2026-10-09-uploads-review/upload-specs-base-a1.log`).

Each path hands `submit` its own input. The React drop passes the event's raw `FileList` with a keyed edge. The paste interceptor passes `Array.from(input.files)` after the caret's block. The toolbar picker passes a `File[]` at the selection, and the draft slot picker passes a `File[]` with `{ slot }`. The cut takes drops off the paste route, and paste keeps it.

The predicted benefit, which the plan's Close marks held or falsified, is that an app configured as the upload guide shows lands dropped files through the landing rules with no code change; it gets the drop line only with the DnD kit. The React plugin also loses one config key and one store read per drag event.

### Lanes

- **Chosen, the strongest deletion.** Delete `nativeDrop`. The React `UploadPlugin` resolves every external drag that carries files with `resolveDropTarget`, publishes the landing for the drop line, submits at the keyed edge and consumes a refused drop, so no such drag reaches the `insertData` interceptor. One config key and one parallel drop path go away, and the docs become true.
- **Keep the current design.** It loses. The package default routes drops through the path the DnD design calls policy-less, and the spec and docs describe a DnD owner and an off switch that no longer exist.
- **Keep a switch, on by default, whose off state refuses file drops.** It loses. No caller, doc or issue names an app that wants uploads but not drops, and such an app can refuse drops with its own plugin listed before the upload plugin, because plugin handlers run in dependency and array order and the first `true` stops the rest.
- **Teach Plite's neutral drop to resolve block edges for file payloads.** It loses. It changes Plite's drop law for all data to serve one Plate feature, and Plite would need to know which block a file becomes.
- **Make the paste interceptor drop-aware.** It loses. `insertData` carries no landing target, and the drop line still needs a `dragover` owner, so this keeps two drop paths.
- **Apply paste's HTML-wins rule to drops.** It loses as the default, because a page image dragged from another tab carries both, and uploading it keeps the media durable instead of hotlinking it. The editors split on this: Tiptap and Lexical let files win on drop, while ProseMirror, BlockNote and CKEditor 5 let HTML win (comparison `docs/plans/artifacts/2026-10-09-uploads-review/editors/answer-a2.md`, read by `gpt-6.1-sol` at medium effort and spot-checked against Tiptap's `FileHandlePlugin.ts` and Lexical's `DROP_COMMAND`). It stays the Defaults alternative.

### Design

`architect` ran one outcome-only brief (brief `docs/plans/artifacts/2026-10-09-uploads-review/architect/brief.md`) on three runners: Opus at high effort, `gpt-6-astra` at xhigh and `gpt-6.1-sol` at xhigh. A blind Opus cross-judge scored them 16, 17 and 18 of 24 and recommended the Opus candidate as the base against the totals (verdict `docs/plans/artifacts/2026-10-09-uploads-review/architect/judge/verdict-a1.md`). The lead scored them 15, 20 and 18 before reading the verdict (scores `docs/plans/artifacts/2026-10-09-uploads-review/architect/lead-scores.md`) and picked the same base: it deletes one key, adds nothing and keeps every upload rule in `UploadPlugin.tsx`.

The Astra and Sol candidates both put an upload fallback in the core Plate view and moved the DnD kit's `DropIndicator` into it; Astra also merged `BaseUploadPlugin` and `UploadPlugin` and deleted `platejs/upload/react`. Those lose, because the core view would carry an optional feature's logic, the painter belongs to the kit under `docs/vision/plate.md` line 1133, and the `layout` plan in flight is changing `dnd.tsx`. The lead grafted their findings into the base:

- Plugin handlers run in dependency and array order; plugins have no `priority` key ([`resolvePlugins.ts`](../../packages/platejs/src/internal/plugin/resolvePlugins.ts) lines 2512 to 2535). A plugin listed before the upload plugin takes a file drop first (probe `docs/plans/artifacts/2026-10-09-uploads-review/probes/refuse-order-a3.log`), so the refusing recipe lists it first and handles `dragOver` with `indicate(null)` as well as `drop`.
- Text and HTML drops still reach `insertData`. The guarantee is that a drag carrying files never reaches it when the React plugin is installed.
- Only the copied DnD kit paints the drop line ([`dnd.tsx`](../../apps/www/src/registry/components/editor/dnd.tsx) line 367). The claim narrows to the landing, the upload guide says the kit draws the line, and moving the painter is open work for the `dnd` scope.

The synthesis rejects refusing a drop whose full count moves the hover edge, which needs per-view gesture state for a schema with child limits and stays a named limit. It also rejects reading `files.length` at drop time, which equals the item count there, and the consumed drag-token ordering in Plite, a neutral hardening outside this scope. The judge and the lead found two Opus claims false: `priority: 1000` orders nothing, and `createBrowserUploadKit` does not turn the switch off, because a second `UploadPlugin.configure` merges into the kit's (probe `docs/plans/artifacts/2026-10-09-uploads-review/probes/duplicate-config-a2.log`).

The challenge delta is improved. The target is unchanged; the claim narrows from "lands where the drop line shows" to the landing, the interceptor guarantee is corrected, and the docs gain the refusing plugin.

The hard cut of `nativeDrop` is a look default, because a Pursue on a review the owner asked for counts as the ask for the cuts its plan names.

### Proof limits

This is a source review plus the package specs above, run on a tree where other sessions hold uncommitted `plitejs` edits outside the upload path. No browser run covers a default-configured editor; `files-sdk.spec.ts` drops into the playground kit, which turns the switch on. Whether some app relies on caret-placed file drops is unknown. Live S3, deployed gateways, native devices and performance stay outside this review.
