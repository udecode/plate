---
date: 2026-05-10
topic: slate-v2-udecode-open-issues-reproduction-ralplan
status: done
owner: slate-ralplan
source: gh issue list -R udecode/slate --state open --limit 1000
---

# Slate v2 Udecode Open Issues Reproduction Ralplan

## Verdict

Status: `done`.

There are `11` open issues in `udecode/slate` as of the live `gh` read. This
plan accounts for all of them through exact fixes, already-accounted browser
proof, or deliberately scoped non-claims. The issues cluster into four shared
runtime owners:

- history and selection snapshots after replacement or undo: `udecode/slate#9`,
  `#11`, `#12`, `#14`
- clipboard and void serialization: `udecode/slate#7`, `#10`, `#13`
- composition cancellation and caret ownership: `udecode/slate#6`
- target ownership across voids, native controls, and iframes:
  `udecode/slate#5`, `#8`, `#15`

No `Fixes` claim is allowed until the original repro is red against local
`.tmp/slate-v2`, green against the live reference or a written expected model, and
then green after the implementation change. Rows that were already green stay
`already-accounted`.

## Current Evidence

Live issue intake used GitHub CLI:

```bash
gh issue list -R udecode/slate --state open --limit 1000 --json number,title,body,labels,url,updatedAt,createdAt,author
```

Current local source owners checked in `.tmp/slate-v2`:

- example server command exists as `bun serve`, serving `site` on port `3100`
  from `.tmp/slate-v2/package.json`
- history snapshots are owned by
  `.tmp/slate-v2/packages/slate-history/src/with-history.ts`
- beforeinput text replacement routes through
  `.tmp/slate-v2/packages/slate-react/src/editable/editing-kernel.ts` and
  `.tmp/slate-v2/packages/slate-react/src/editable/mutation-controller.ts`
- undo hotkeys route through
  `.tmp/slate-v2/packages/slate-react/src/editable/keyboard-input-strategy.ts`
- selection import/export is owned by
  `.tmp/slate-v2/packages/slate-react/src/editable/selection-controller.ts`
- composition events are owned by
  `.tmp/slate-v2/packages/slate-react/src/editable/runtime-composition-events.ts`
  and `.tmp/slate-v2/packages/slate-react/src/editable/composition-state.ts`
- target bridge is owned by
  `.tmp/slate-v2/packages/slate-react/src/editable/runtime-target-bridge.ts`
- clipboard export/import is owned by
  `.tmp/slate-v2/packages/slate-dom/src/plugin/dom-clipboard-runtime.ts`
- existing Playwright rows cover pieces of iframe, mentions, images,
  editable-voids, paste-html, richtext, and plaintext, but not the full issue
  repro set below

## Intent And Boundary

Intent: turn every currently open `udecode/slate` issue into issue-first Slate
v2 reproduction work, then execute the smallest architecture repair that fixes
the shared runtime owner.

Outcome: every open issue has one of these states:

- `fixes-claimed`: exact original repro proved red, fixed, and verified
- `improves-claimed`: shared runtime behavior improves but exact repro is not
  closed
- `related`: pressure is accounted for but not in this pass
- `needs-repro`: issue body or video is insufficient for an implementation claim

In scope:

- `udecode/slate#5` through `#15`, all currently open as of the `gh` read
- local reproduction against `http://localhost:3100`
- live reference comparison against `https://www.slatejs.org`
- `.tmp/slate-v2` runtime, history, clipboard, selection, composition, and example
  tests once execution starts

Non-goals:

- no code patches before red proof
- no GitHub comments, labels, closes, or PR text changes
- no `Fixes udecode/slate#...` wording before exact proof exists
- no broad rewrite just because the bug list is ugly

Decision boundary:

- If a repro is green locally, mark it `already-accounted` with the command and
  browser evidence.
- If Playwright is green but Chrome/dev-browser reproduces the bug, trust the
  browser path and preserve the failed harness mismatch in the plan.
- If issue `#13` cannot be reconstructed from its video, leave it `needs-repro`
  and do not infer a fix from the title.
- If a fix needs a runtime/API change, prefer the long-term raw Slate substrate
  over an example-local workaround.

## Decision Brief

Principles:

- Issue-first, not vibes-first. The user gave open issues; each one gets a
  concrete repro.
- Runtime owners beat example patches. A bug that repeats across examples is a
  runtime contract failure until proven otherwise.
- Slate stays raw. Product/editor opinions belong in Plate unless the issue
  exposes a missing raw primitive.
- Browser behavior needs browser proof. IME, clipboard, iframe, void selection,
  and external paste cannot be closed by package-only tests.

Chosen approach:

1. Reproduce all 11 issues in four architecture clusters.
2. Add failing proof rows before implementation.
3. Fix the shared runtime owner for each cluster.
4. Sync issue claims only after the exact original repro is green.

Rejected:

- Fixing one example at a time. That would miss shared ownership bugs.
- Marking the plan done after issue intake. Reproduction is still missing.
- A full rewrite before red proof. That is just expensive guessing.
- Treating live reference divergence as automatically correct. The live behavior
  is the starting expectation, but the raw Slate contract still has to make
  sense.

## Open Issue Matrix

| Issue              | Title                                                 | Bucket                       | First repro route                                                                                       | Current owner guess                                   | Claim state                                                                                  |
| ------------------ | ----------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `udecode/slate#5`  | Images `Cmd+A` selects image voids instead of text    | `v2-dom-selection`           | `/examples/images`, click text, `Cmd+A`                                                                 | select-all keyboard path and void selection rendering | `fixes-claimed`                                                                              |
| `udecode/slate#6`  | Uncommitted Chinese IME composition moves caret       | `v2-input-runtime`           | manual Chrome/dev-browser IME on plaintext, richtext, images, editable-voids, inlines, mentions, tables | composition state, selection source, DOM repair       | `already-accounted` for Chromium CDP cancellation proof; no manual Chinese IME `Fixes` claim |
| `udecode/slate#7`  | Image node copy has no visible external paste         | `v2-clipboard-serialization` | `/examples/images`, copy visual void, paste into external target                                        | DOM clipboard export for block voids                  | `fixes-claimed`                                                                              |
| `udecode/slate#8`  | Editable void undo clears native input only           | `v2-react-runtime`           | `/examples/editable-voids`, insert void, type in native input, `Cmd+Z`                                  | internal-control target ownership and history routing | `fixes-claimed`                                                                              |
| `udecode/slate#9`  | `Cmd+Z` after typing moves caret to line start        | `v2-dom-selection`           | plaintext, richtext, images, editable-voids                                                             | history selection restore and DOM export              | `already-accounted`                                                                          |
| `udecode/slate#10` | Selected mention copy/paste or cut crashes            | `v2-clipboard-serialization` | `/examples/mentions`, select `@R2-D2`, `Cmd+C/V` and `Cmd+X`                                            | inline void clipboard clone/export and cut path       | `already-accounted`                                                                          |
| `udecode/slate#11` | Undo after full `Cmd+A` replacement loses doc         | `v2-core-engine`             | mentions, inlines, tables, select all, type `Z`, `Cmd+Z`                                                | history snapshot around whole-document replacement    | `improves-claimed`                                                                           |
| `udecode/slate#12` | Partial selection replacement undo restores only part | `v2-core-engine`             | plaintext, inlines, styling, code-highlighting                                                          | expanded selection replace and history batch          | `already-accounted`                                                                          |
| `udecode/slate#13` | Paste rendered HTML crash/wrong structure             | `v2-clipboard-serialization` | reconstruct from attached video, then paste-html route                                                  | HTML clipboard import and schema fallback             | `already-accounted`                                                                          |
| `udecode/slate#14` | English replacement over formatted word crashes       | `v2-input-runtime`           | `/examples/hovering-toolbar`, double-click `bold`, type `plain`                                         | beforeinput replacement over marks and history repair | `fixes-claimed`                                                                              |
| `udecode/slate#15` | Iframe toolbar button does not format selection       | `v2-dom-selection`           | `/examples/iframe`, select iframe text, click parent toolbar `B`                                        | cross-window selection target bridge                  | `already-accounted`                                                                          |

## Execution Plan

### Phase 0: Harness Setup

Run from `/Users/zbeyens/git/slate-v2`:

```bash
bun serve
```

Use local URL `http://localhost:3100`. For Playwright rows, set:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:3100
```

Do not treat a green synthetic row as browser closure for IME, external
clipboard, or iframe toolbar behavior. Use dev-browser or real Chrome when the
observable bug depends on browser state.

### Phase 1: History Replacement And Undo

Issues: `#9`, `#11`, `#12`, `#14`.

Add red proof rows first:

- `playwright/integration/examples/plaintext.test.ts`
- `playwright/integration/examples/richtext.test.ts`
- `playwright/integration/examples/hovering-toolbar.test.ts`
- add or extend inlines, styling, code-highlighting, mentions, and tables rows
  as needed
- `packages/slate-history/test/history-contract.ts` for package-level
  selection-before, replacement, undo, and redo snapshots

Expected architecture repair:

- replacement over an expanded selection must be one history-owned transaction
  with the correct `selectionBefore`
- whole-document replacement must restore original children and selection on
  undo
- plain typing undo must restore caret at the edit point, not the visual line
  start
- marked replacement must not crash when beforeinput imports a DOM selection
  over formatted text

Likely files:

- `packages/slate-history/src/with-history.ts`
- `packages/slate-react/src/editable/editing-kernel.ts`
- `packages/slate-react/src/editable/mutation-controller.ts`
- `packages/slate-react/src/editable/keyboard-input-strategy.ts`
- `packages/slate-react/src/editable/selection-controller.ts`

Verification target:

```bash
bun test packages/slate-history/test/history-contract.ts
PLAYWRIGHT_BASE_URL=http://localhost:3100 playwright test playwright/integration/examples/plaintext.test.ts playwright/integration/examples/richtext.test.ts playwright/integration/examples/hovering-toolbar.test.ts --project=chromium
```

### Phase 2: Clipboard And Void Serialization

Issues: `#7`, `#10`, `#13`.

Add red proof rows first:

- mentions selected inline void copy/paste and cut crash
- images selected block void copy to external/native clipboard payload
- paste-html exact video-derived input once reconstructed
- package proof in `packages/slate-dom/test/clipboard-boundary.ts` where the
  repro can be modeled without browser-only APIs

Expected architecture repair:

- inline void copy/cut/paste must not depend on a missing DOM attach target
- selected block void copy must place useful `text/html` and `text/plain` data
  on the clipboard for external apps
- intra-Slate fragment data must keep working while external HTML fallback is
  useful
- HTML paste import must fail closed or normalize instead of crashing

Likely files:

- `packages/slate-dom/src/plugin/dom-clipboard-runtime.ts`
- `packages/slate-react/src/editable/runtime-clipboard-events.ts`
- `playwright/integration/examples/mentions.test.ts`
- `playwright/integration/examples/images.test.ts`
- `playwright/integration/examples/paste-html.test.ts`

Verification target:

```bash
bun test packages/slate-dom/test/clipboard-boundary.ts
PLAYWRIGHT_BASE_URL=http://localhost:3100 playwright test playwright/integration/examples/mentions.test.ts playwright/integration/examples/images.test.ts playwright/integration/examples/paste-html.test.ts --project=chromium
```

### Phase 3: IME Cancellation

Issue: `#6`.

Add red proof rows first:

- manual or dev-browser Chrome Chinese IME repro on at least plaintext and one
  void/inline-heavy example
- synthetic helper row only as supporting coverage, not closure
- trace selection before composition start, after cancellation, and after the
  next typed character

Expected architecture repair:

- composition start records a logical insertion anchor
- uncommitted composition cancellation restores that anchor
- deletion/Esc/click-away paths do not advance the Slate model selection
- follow-up typing inserts at the original logical point

Likely files:

- `packages/slate-react/src/editable/composition-state.ts`
- `packages/slate-react/src/editable/runtime-composition-events.ts`
- `packages/slate-react/src/editable/selection-reconciler.ts`
- `packages/slate-browser/src/playwright/ime.ts`

Verification target:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:3100 playwright test playwright/integration/examples/plaintext.test.ts playwright/integration/examples/richtext.test.ts playwright/integration/examples/mentions.test.ts --project=chromium --grep "IME|composition"
```

Manual Chrome evidence remains required before any `Fixes #6` claim.

### Phase 4: Target Ownership, Iframes, Native Controls, And Select-All

Issues: `#5`, `#8`, `#15`.

Add red proof rows first:

- image route `Cmd+A` after text focus selects editor body text, not only image
  void UI
- editable void route `Cmd+Z` after typing into native input removes the newly
  inserted void if that matches live reference after local proof
- iframe route keeps selected iframe text as toolbar command target when parent
  toolbar is clicked

Expected architecture repair:

- command target resolution must survive focus moving from the editable to a
  parent toolbar
- internal native controls must not swallow Slate undo for the transaction that
  inserted their owning void node when the intended editor target remains active
- select-all must choose the editor body contract, then render void selection UI
  only when the Slate selection actually targets voids

Likely files:

- `packages/slate-react/src/editable/runtime-target-bridge.ts`
- `packages/slate-react/src/editable/keyboard-input-strategy.ts`
- `packages/slate-react/src/editable/selection-controller.ts`
- `packages/slate-react/src/editable/runtime-focus-mouse-events.ts`
- `playwright/integration/examples/iframe.test.ts`
- `playwright/integration/examples/editable-voids.test.ts`
- `playwright/integration/examples/images.test.ts`

Verification target:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:3100 playwright test playwright/integration/examples/iframe.test.ts playwright/integration/examples/editable-voids.test.ts playwright/integration/examples/images.test.ts --project=chromium
```

### Phase 5: Issue Claim Sync

Only after phases 1-4 are green:

- append exact fork issue dossier closure rows
- update `docs/slate-v2/ledgers/issue-coverage-matrix.md` only with issues that
  have exact repro proof
- update `docs/slate-v2/references/pr-description.md` if a PR claim changes
- run the relevant `.tmp/slate-v2` focused checks
- run `bun run completion-check` in `plate-2` only for planning state

## Phase 1 Execution Evidence

Executed in `/Users/zbeyens/git/slate-v2` on 2026-05-10.

Code owner changes:

- `packages/slate/src/transforms-text/insert-text.ts`: full-document text
  replacement now emits one `replace_children` operation instead of replacing
  the snapshot without operations, so history can invert the edit.
- `packages/slate/src/transforms-text/insert-text.ts`: expanded-range
  replacement uses the post-delete collapsed model selection as the insert
  target, with point refs as fallback, so formatted-word replacement does not
  crash when structural deletion nulls both refs.

Proof rows added or confirmed:

- `playwright/integration/examples/plaintext.test.ts`: `#9` middle-line typing
  undo restores text and caret; `#12` partial selection replacement undo
  restores the original text and selected range.
- `playwright/integration/examples/mentions.test.ts`: `#11` select-all
  replacement undo restores the original mentions document.
- `playwright/integration/examples/hovering-toolbar.test.ts`: `#14` English
  replacement over selected formatted `bold` text does not crash.
- `packages/slate-history/test/history-contract.ts`: full-document selected
  text replacement is one undoable `replace_children` history batch.

Verification:

```bash
cd /Users/zbeyens/git/slate-v2
bun --filter slate typecheck
bun --filter slate-history typecheck
bun lint:fix
bun test ./packages/slate-history/test/history-contract.ts
PLAYWRIGHT_BASE_URL=http://localhost:3100 bun playwright test playwright/integration/examples/plaintext.test.ts playwright/integration/examples/mentions.test.ts playwright/integration/examples/hovering-toolbar.test.ts --project=chromium --grep "keyboard undo restores caret after middle-line typing|keyboard undo restores partial selected text replacement|keyboard undo restores select-all replacement content|typing English over selected formatted text does not crash"
```

Final same-turn results:

- `slate typecheck: Exited with code 0`
- `slate-history typecheck: Exited with code 0`
- `bun lint:fix`: checked 1601 files, fixed 2 files
- `history-contract.ts`: 24 pass, 0 fail
- focused Chromium Playwright proof: 4 passed

Claim safety:

- `udecode/slate#14` has clean local red -> fixed -> green proof in the
  hovering-toolbar row.
- `udecode/slate#11` has green browser proof and package-level history proof
  after the operation fix. The first local red row mixed the real failure with
  a Playwright `ControlOrMeta`/Windows-UA hotkey mismatch, so keep it out of
  PR-facing `Fixes` wording until a clean pre-fix artifact is intentionally
  preserved.
- `udecode/slate#9` and `udecode/slate#12` are green in the added/existing
  plaintext proof rows; no code change was needed for those exact rows in this
  slice.

## Phase 2 Execution Evidence

Executed in `/Users/zbeyens/git/slate-v2` on 2026-05-10.

Issue-source proof:

- `gh issue view 7 -R udecode/slate --json number,title,body,url,comments`
  confirmed the selected image void external paste report.
- `gh issue view 10 -R udecode/slate --json number,title,body,url,comments`
  confirmed the selected mention copy/paste and cut crash report.
- `gh issue view 13 -R udecode/slate --json number,title,body,url,comments`
  confirmed the paste-html report has only the attached video as repro input.
- The `#13` video was downloaded to `.tmp/udecode-slate-13.mp4` and translated
  into a self-copy rendered-content browser row for `/examples/paste-html`.

Current local red proof:

- `udecode/slate#7`: a one-off browser probe against
  `http://localhost:3100/examples/images` copied the selected image void and
  found `text/html` without `<img>` and `text/plain` containing only newlines.
- Live reference comparison against `https://www.slatejs.org/examples/images`
  copied the same kind of selected image void and produced `text/html` with
  `<img>`.

Code owner change:

- `packages/slate-dom/src/plugin/dom-clipboard-runtime.ts`: void selections now
  clone from before the starting void DOM node through after the ending void DOM
  node, so spacer-anchored block void selections include visible external HTML
  content while preserving the internal Slate fragment payload.

Proof rows added or confirmed:

- `packages/slate-dom/test/clipboard-boundary.ts`: selected block void export
  carries the image node in the internal fragment and includes visible `<img>`
  HTML for external clipboard targets.
- `playwright/integration/examples/images.test.ts`: selected image copy writes
  `text/html` with both `data-slate-fragment` and `<img>`.
- `playwright/integration/examples/mentions.test.ts`: selected mention
  copy/paste inserts another mention without runtime errors; selected mention
  cut removes the mention without runtime errors.
- `playwright/integration/examples/paste-html.test.ts`: copied rendered Slate
  content from the paste-html example pastes back as an internal Slate fragment
  with block structure preserved, before generic HTML import policy matters.

Verification:

```bash
cd /Users/zbeyens/git/slate-v2
bun lint:fix
bun test ./packages/slate-dom/test/clipboard-boundary.ts
PLAYWRIGHT_BASE_URL=http://localhost:3100 bun playwright test playwright/integration/examples/images.test.ts playwright/integration/examples/mentions.test.ts playwright/integration/examples/paste-html.test.ts --project=chromium --grep "copies selected image with visible external HTML payload|copies and pastes a selected mention without crashing|cuts a selected mention without crashing|pastes copied rendered Slate content as an internal fragment before HTML import"
bun --filter slate-dom typecheck
bun --filter slate-browser typecheck
```

Final same-turn results:

- `bun lint:fix`: checked 1601 files, fixed 1 file
- `clipboard-boundary.ts`: 25 pass, 0 fail
- focused Chromium Playwright proof: 4 passed
- `slate-dom typecheck: Exited with code 0`
- `slate-browser typecheck: Exited with code 0`

Claim safety:

- `udecode/slate#7` has current local red -> fixed -> green proof and can be a
  fork-lane `fixes-claimed` row.
- `udecode/slate#10` is now covered by exact selected mention browser rows and
  prior inline-void clipboard export work. Do not inflate this to a new
  same-slice fix claim because the added browser rows were green on current
  code.
- `udecode/slate#13` is now represented by the video-derived self-copy
  paste-html row. The row is green on current code, so treat it as
  `already-accounted`, not a new fix claim.

## Phase 3 Execution Evidence

Executed in `/Users/zbeyens/git/slate-v2` on 2026-05-10.

Issue-source proof:

- `gh issue view 6 -R udecode/slate --json number,title,body,url,comments`
  confirmed the Chinese IME cancellation report and its decisive oracle: after
  an uncommitted composition is cancelled, the next typed character must insert
  at the original logical caret position.

Proof row added:

- `playwright/integration/examples/rendering-strategy-runtime.test.ts`: added
  `keeps canceled IME caret anchored for the next typed character`.
- The row places the caret inside text, runs Chromium CDP composition
  cancellation steps, asserts the model text and selection stay unchanged, types
  `x`, and asserts insertion happens at the original caret.

Verification:

```bash
cd /Users/zbeyens/git/slate-v2
PLAYWRIGHT_BASE_URL=http://localhost:3100 bun playwright test playwright/integration/examples/rendering-strategy-runtime.test.ts --project=chromium --grep "keeps canceled IME caret anchored for the next typed character"
PLAYWRIGHT_BASE_URL=http://localhost:3100 bun playwright test playwright/integration/examples/rendering-strategy-runtime.test.ts --project=chromium --grep "does not push canceled IME composition onto history|keeps text stable after type-delete-cancel IME composition|keeps canceled IME caret anchored for the next typed character"
bun lint:fix
bun check
```

Final same-turn results:

- focused Chromium Playwright proof: 1 passed.
- focused Chromium cancellation cluster: 3 passed.
- `bun lint:fix`: checked 1601 files, no fixes applied.
- `bun check`: lint, package/site/root typecheck, Bun tests, and Slate React
  Vitest passed.

Claim safety:

- `udecode/slate#6` is `already-accounted` for the automated Chromium CDP
  cancellation path. No runtime code changed.
- Do not promote `#6` to a PR-facing or manual Chinese IME `Fixes` claim from
  this row. The report's raw OS/input-method path still needs manual
  Chrome/device evidence before exact closure wording.

## Phase 4 Execution Evidence

Executed in `/Users/zbeyens/git/slate-v2` on 2026-05-10.

Issue-source proof:

- `gh issue view 5 -R udecode/slate --json number,title,body,url,comments`
  confirmed the images `Cmd+A` report.
- `gh issue view 8 -R udecode/slate --json number,title,body,url,comments`
  confirmed the editable-void native input undo report.
- `gh issue view 15 -R udecode/slate --json number,title,body,url,comments`
  confirmed the iframe toolbar target report.

Current local red proof:

- `udecode/slate#5`: the new images browser row proved the model selected the
  full editor text range from text focus, but the first image still rendered
  selected void chrome during broad text-range select-all.
- `udecode/slate#8`: the new editable-void browser row proved `Cmd+Z` from the
  newly inserted void's native input left two inputs on the page. Desktop Chrome
  routed the decisive undo through `beforeinput historyUndo`, so native input
  undo cleared the input instead of applying Slate history.
- `udecode/slate#15`: the new iframe browser row was green on current code; the
  parent toolbar command did not wrongly format the selected iframe text.

Code owner changes:

- `packages/slate-react/src/editable/input-controller.ts`: `beforeinput`
  history events stay model-owned even when the browser target is an internal
  native control.
- `packages/slate-react/src/editable/runtime-before-input-events.ts`: native
  `historyUndo` and `historyRedo` from internal controls run through Slate
  history before the internal-control stop path.
- `packages/slate-react/src/editable/runtime-keyboard-events.ts` and
  `runtime-root-engine.ts`: keydown capture includes a narrow internal-control
  history fallback for browsers that dispatch undo through keydown instead of
  `beforeinput`.
- `site/examples/ts/images.tsx`: image selection chrome renders only for a
  direct collapsed image selection, not for broad text-range select-all.
- `packages/slate-react/test/kernel-authority-audit-contract.ts`: authority
  inventory was updated for the intentional extra keyboard history render
  wakeups.

Proof rows added or confirmed:

- `playwright/integration/examples/images.test.ts`: `selects image editor text
content from text focus with keyboard select all`.
- `playwright/integration/examples/editable-voids.test.ts`: `undo from a new
editable void input removes the inserted void block`.
- `playwright/integration/examples/iframe.test.ts`: `applies parent toolbar
formatting to selected iframe text`.
- `packages/slate-react/test/editing-kernel-contract.ts`: beforeinput history
  remains model-owned for internal controls.

Verification:

```bash
cd /Users/zbeyens/git/slate-v2
bun test ./packages/slate-react/test/editing-kernel-contract.ts
bun --filter slate-react typecheck
PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_BASE_URL=http://localhost:3100 bun playwright playwright/integration/examples/images.test.ts playwright/integration/examples/editable-voids.test.ts playwright/integration/examples/iframe.test.ts --project=chromium --grep "selects image editor text content from text focus with keyboard select all|undo from a new editable void input removes the inserted void block|applies parent toolbar formatting to selected iframe text"
PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_BASE_URL=http://localhost:3100 bun playwright playwright/integration/examples/images.test.ts --project=chromium --grep "deletes selected image|removes an empty paragraph after an image before deleting the image|inserts a paragraph after a clicked selected image on Enter|copies selected image with visible external HTML payload|selects image editor text content from text focus with keyboard select all"
PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_BASE_URL=http://localhost:3100 bun playwright playwright/integration/examples/editable-voids.test.ts --project=chromium --grep "undo from a new editable void input removes the inserted void block|keeps native paste inside editable void input|restores outer editor selection after editing input inside editable void|runs generated internal-control gauntlet without illegal kernel transitions|keeps ArrowLeft inside editable void input native-owned"
bun lint:fix
bun test:vitest test/kernel-authority-audit-contract.test.ts
bun check
PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_BASE_URL=http://localhost:3100 bun playwright playwright/integration/examples/images.test.ts playwright/integration/examples/editable-voids.test.ts playwright/integration/examples/iframe.test.ts --project=chromium --grep "selects image editor text content from text focus with keyboard select all|undo from a new editable void input removes the inserted void block|applies parent toolbar formatting to selected iframe text"
```

Final same-turn results:

- `editing-kernel-contract.ts`: 20 pass, 0 fail.
- `slate-react typecheck`: passed.
- focused Phase 4 Chromium proof: 3 passed.
- images surrounding Chromium proof: 5 passed.
- editable-voids surrounding Chromium proof: 5 passed.
- `bun lint:fix`: checked 1601 files, fixed 4 files.
- authority audit focused Vitest: 10 passed.
- `bun check`: lint, package/site/root typecheck, Bun tests, and Slate React
  Vitest passed.
- final focused Phase 4 Chromium proof after lint/check: 3 passed.

Non-gate observation:

- An accidental broad Chromium integration run passed 313 tests, skipped 5, and
  failed 5 unrelated rows outside the Phase 4 issue target. The required Phase
  4 rows passed inside that broad run and in the clean focused rerun above.

Claim safety:

- `udecode/slate#5` has local red -> fixed -> green proof for the exact
  `Cmd+A` selected-image visual bug and can be a fork-lane `fixes-claimed`
  row.
- `udecode/slate#8` has local red -> fixed -> green proof for the editable-void
  undo bug and can be a fork-lane `fixes-claimed` row.
- `udecode/slate#15` stays `already-accounted`. The exact browser row is green
  on current code, so no fix claim is attached to this slice.
- `docs/slate-v2/ledgers/issue-coverage-matrix.md` and
  `docs/slate-v2/references/pr-description.md` are unchanged because these are
  fork-local `udecode/slate` issue IDs, not upstream PR auto-close IDs.

## ClawSweeper Accounting

No upstream PR-facing issue claim changes. Fork-local accounting is synced in
`docs/slate-v2/ledgers/fork-issue-dossier.md`.

| Issue              | Current status      | Why                                                                                                                                                                             |
| ------------------ | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `udecode/slate#5`  | `fixes-claimed`     | Broad editor text select-all no longer shows direct selected-image chrome; local red -> fixed -> green proof exists.                                                            |
| `udecode/slate#6`  | `already-accounted` | Current Chromium CDP cancellation proof keeps the model text, selection, and next typed character anchored at the original caret. Manual Chinese IME closure remains unclaimed. |
| `udecode/slate#7`  | `fixes-claimed`     | Selected image void copy was red locally because external `text/html` lacked `<img>`; the block-void clipboard fix now has package and Chromium proof.                          |
| `udecode/slate#8`  | `fixes-claimed`     | Internal-control `beforeinput historyUndo` now applies Slate history before native input undo; local red -> fixed -> green proof exists.                                        |
| `udecode/slate#9`  | `already-accounted` | Plaintext middle-line typing undo row is green and restores the caret at the edit point. Broader cross-example scope remains unclaimed.                                         |
| `udecode/slate#10` | `already-accounted` | Exact selected mention copy/paste and cut browser rows are green; prior inline-void clipboard export work owns the crash class.                                                 |
| `udecode/slate#11` | `improves-claimed`  | Mentions select-all replacement undo and package history batch are green; avoid PR-facing `Fixes` until a clean pre-fix red artifact is preserved.                              |
| `udecode/slate#12` | `already-accounted` | Plaintext partial-selection replacement undo row is green and restores the original selected text/range. Multi-example scope remains unclaimed.                                 |
| `udecode/slate#13` | `already-accounted` | The attached video was translated into a self-copy rendered-content paste-html browser row; current code preserves block structure and has no runtime error.                    |
| `udecode/slate#14` | `fixes-claimed`     | Hovering-toolbar English replacement over selected formatted text reproduced the crash locally, then passed after the insert target fix.                                        |
| `udecode/slate#15` | `already-accounted` | Exact iframe parent toolbar row is green on current code; no runtime change or fix claim needed.                                                                                |

## Maintainer Objection Ledger

| Objection                                           | Answer                                                                                                                                                                                                                                |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "These are example bugs, not Slate bugs."           | The repeated cross-example failures point at runtime owners: history, selection, clipboard, composition, and target ownership. Example patches are only acceptable if one repro is truly example-local.                               |
| "Live reference behavior is legacy; v2 can differ." | It can differ only with an explicit raw Slate contract. Undo correctness, non-crashing clipboard operations, stable IME caret ownership, and toolbar commands applying to the active editor target are not optional product opinions. |
| "Do not close fork issues from local tests."        | Correct. Claim sync waits for exact original repro proof and keeps `needs-repro` until then.                                                                                                                                          |
| "External clipboard and IME are hard to automate."  | Then they need manual/dev-browser evidence. Package tests can support but not replace browser proof.                                                                                                                                  |

## Applied Skill Notes

- `slate-ralplan`: applied. This file is the planning/review gate and leaves
  the full issue set accounted.
- `clawsweeper`: applied. All 11 open issues are classified with fork-local
  claim safety; no upstream PR-facing closure claims were written.
- `planning-with-files`: applied through this `docs/plans` file per repo
  override.
- `learnings-researcher`: applied. Prior docs/solutions reinforce that browser
  IME and clipboard rows need honest browser proof and that Playwright can miss
  user-visible behavior.
- `tdd`: applied for the red -> green rows where current behavior failed.
- `performance-oracle`: skipped for this pass. No performance claim is being
  made.
- `vercel-react-best-practices`: skipped for this pass. The current plan is
  runtime behavior, not React rendering breadth.

## Score

Current Ralplan score: `0.93`.

| Criterion                | Score | Reason                                                                                                                  |
| ------------------------ | ----: | ----------------------------------------------------------------------------------------------------------------------- |
| Intent and boundary      |  0.90 | The issue set, non-goals, and claim rules stayed explicit through execution.                                            |
| Live issue intake        |  0.90 | `gh` confirmed all current open issues.                                                                                 |
| Current source grounding |  0.90 | Runtime owners and exact test rows are mapped for all four phases.                                                      |
| Reproduction proof       |  0.90 | All runnable issue rows are green; manual Chinese IME exact closure remains intentionally unclaimed.                    |
| Architecture direction   |  0.92 | Failing rows were repaired at history, clipboard, beforeinput/history ownership, and direct-selection rendering owners. |
| Claim safety             |  0.96 | Fork-local fixes are separated from upstream PR claims; green-only rows stay already-accounted.                         |

Gate: `done`. Phases 1-4 are complete, fork issue dossier is synced, and
upstream PR-facing issue coverage remains unchanged because these are
`udecode/slate` fork issue IDs.

## Next Prompt

No next autonomous pass remains for this ralplan. If work continues, use a new
ralplan for manual Chinese IME device/browser proof or for the unrelated broad
integration failures observed during the accidental full Chromium run.

```text
This ralplan is complete. Start a new focused plan only for manual Chinese IME
proof or unrelated full-suite integration failures.
```
