# IME in an empty paragraph: caret and Escape cancel

Status: waiting: your word to open the PR while `pnpm check` fails as it does at HEAD
Page: https://claude.ai/artifact/EH7444C6TAgXGVDfTka9qH
Playbook: bug-fix

## Brief

### What will change?

In an empty paragraph the input-method caret stays at the end of your draft. When you press Escape there, the editor redraws that one paragraph from the document, so you can type again right away.

### What could go wrong?

Your WeType check on the Mac ran on the first Escape fix. The redraw that replaced it ran only in simulated Chrome, so try WeType once more. A Korean Android keyboard duplicates letters, as before. Safari and Firefox are untried.

## Teach

With a Chinese input method, what you type first shows up as an underlined draft. The browser owns that draft, so the editor must not move the caret or redraw the text under it.

The editor tracks which piece of the page the draft started on. In an empty paragraph that piece is a tiny line-break placeholder, and Chrome throws it away on the first letter. The editor then thought the draft was gone and moved the caret back. On Escape, Chrome also removed the paragraph's text holder and nothing put it back, so typing went off the page.

Now the editor tracks the text holder, which survives the draft. When a draft ends with nothing typed and Chrome has thrown the text holder away, the editor redraws that line's block from the document. It does this before app code hears the draft ended, so nothing draws into the broken block first. The caret comes back before the next key.

## Demo

1. Open the homepage playground, click at the end of the second paragraph, and press Enter to get an empty paragraph.
2. Switch to a Chinese pinyin input method and type `dddd`. The caret should sit at the end of the underlined draft, not after the first letter.
3. Pick a candidate. The characters appear with the caret after them.
4. In a new empty paragraph, type a few letters with the input method, then press Escape. The draft disappears and the empty paragraph's placeholder text comes back.
5. Type a few letters with the input method off. They appear in the paragraph.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Old ownership test | Remove the empty-paragraph test that checked the old behavior | Keep that test and rewrite it for the new behavior | keep the case | detail |
| Two failing decoration tests | Leave them; they failed the same way before this change | Fix them in this change | fix decorations | detail |
| Native check of the final Escape fix | Simulated Chrome only; you retry WeType on the PR (look) | Hold the PR until the automated Mac input-method run works | hold for native | small |
| Opening the PR on red checks | Push the branch and wait for your word; the checks fail before this change too (look) | Open the PR now | open pr | small |
| Code shared with a started task | Go ahead, though the started End-key fix edits the same input code (look) | Hold the PR until that fix lands | wait for End fix | small |
| Text redraw key | Keep one redraw key per text; no test reaches it, here or before (look) | Put back the parent's second key | keep both keys | small |
| When to redraw after Escape | Only when the empty line's text holder is gone at Escape (look) | Every Escape in an empty line, read from the document | redraw every escape | small |
| Custom block state after Escape | A custom block component in that empty line restarts once (look) | Keep its state by restoring the browser's nodes instead | keep block state | small |

## Main changes

- A native composition in an empty text anchors on its `[data-editor-node="text"]` host instead of `null`, so the existing selection-export deferral and DOM-write protection cover the whole preedit (`getNativeCompositionAnchor`).
- An empty text anchors on its host only when the host renders the line-break placeholder `[data-editor-zero-width="n"]`; the `z` spacers beside inline elements stay model-owned as before.
- An empty compositionend that committed nothing finishes at once through a failure scope, with no pending end, so the next keystroke is ordinary input and cannot be claimed as the cancelled composition's final input.
- `applyEditableCompositionEnd` first checks for a cancel whose anchor is an empty line's text host that is no longer under the root. It does this before the Android manager and the app's `onCompositionEnd` run, on every non-Android branch, so a handler that commits React synchronously or claims the event cannot render into the detached host first. A mid-text cancel, a host that is still connected, as WebKit leaves it, and a model-owned start do nothing.
- For that cancel it reads the host's `data-editor-node-key`, resolves its current path and takes the key of the element that owns it (`getTextHostOwnerKey`). `rebuildCancelledLine(lineKey)` bumps that element's own render revision and wakes it. An end handler that then moves the line or replaces its text changes nothing about which block is rebuilt.
- The editor selector context gains `invalidate(nodeKeys)`, which wakes the render listeners of those keys without a model change. The composition handler takes it from the nearest selector context, so nothing is stored per editor.
- Each element's `ElementContext` is keyed by its own revision, and every `EditableDescendantNode` child is keyed by its node key alone, so one key owns the remount at every depth. Text nodes keep their own revision key. React removes the still-connected block, which takes Chrome's stray `<br>` with it, and mounts the block again from the model.
- No `flushSync` and no new stored state. React commits the woken element before the next input task, also when the cancel arrives inside a React commit, and the ref rebind's existing selection export puts the caret back.

## Steps

- [x] Reproduce both defects on the homepage playground in Chromium. — `docs/plans/artifacts/ime-empty-block/run3.json`
- [x] Find each cause with runtime traces. — `docs/plans/artifacts/ime-empty-block/run2.json`, `docs/plans/artifacts/ime-empty-block/run9-fast.json`
- [x] Write the two regression specs and build the first fix. — `docs/plans/artifacts/ime-empty-block/run4.json`
- [x] Run architect on the built fix and adopt its winner. — `docs/plans/artifacts/ime-empty-block/architect/judge/answer.md`
- [x] Mutation proof for the new conditions; four of five are caught, the uncaught journal push is deleted, and two scope limits have no failing case. — `docs/plans/artifacts/ime-empty-block/mutate/results.json`
- [x] Writing passes on the architect shape and the scoped lint fix. — `docs/plans/artifacts/ime-empty-block/lint-task-a1.log`
- [x] Repeated acceptance proof on the first fix's bytes, which the owner then checked by hand; the recovery replaced that fix, so a later step reruns it. — `docs/plans/artifacts/ime-empty-block/accept-spec-a1.log`
- [x] Reflect on the workflow correction. — `docs/plans/artifacts/ime-empty-block/reflect/brief.md`
- [x] Owner hand check on macOS with WeType: the empty-paragraph caret and Escape then typing both work (2026-10-15). — `docs/plans/2026-10-14-ime-empty-block.decisions.tsv`
- [x] Android Chrome 154 check on the owner's phone, typed with real key taps and read back over DevTools. WeType pinyin, its commit and English keep text and caret right. A Korean keyboard turns `한글` into `ㅎ하한ㄱ그글`, and HEAD does the same, so this change did not cause it. — `docs/plans/artifacts/ime-empty-block/android/ko-hangul.json`, `docs/plans/artifacts/ime-empty-block/android/head-ko-hangul.json`
- [x] PR panel round 1 on the diff. One critical, the cancel replay undoing structure without its text, and four warnings were applied, and five warnings were deferred. — `docs/plans/artifacts/ime-empty-block/panel1/`
- [x] PR panel round 2 on the fixes. The replay restored corruption that a queued repair had fixed, so the journal replay left the loop and was reverted. A caret on the empty host or its leaf now keeps native ownership. — `docs/plans/artifacts/ime-empty-block/panel2/`
- [x] Run architect on the Escape recovery and adopt its winner. It rebuilds the empty line's block from the model, wakes the parent in the same flush and exports the caret synchronously. — `docs/plans/artifacts/ime-empty-block/architect2/judge/answer.md`
- [x] Panel on the recovery plan before building it. Its critical, a React session that cannot keep the text key, moved the remount owner to the element's own revision. — `docs/plans/artifacts/ime-empty-block/panel3/`
- [x] Build the recovery. Its gates follow. A jsdom contract detaches the host, puts a bare `<br>` in the block, fires an empty `compositionEnd`, and checks a new block node with a connected host and one `<br>`. A wake with no model commit remounts the element. The Chromium specs check, before any key, that the block is a new node with no bare `<br>` and that the caret maps to the empty text at offset 0. Typing, an immediate new composition and a cancel then keystroke burst work. A nested block remounts once and stays stable when its parent re-renders during the next preedit. A mid-text cancel and sibling blocks keep their node identity. A `compositionEnd` fired inside a React commit still ends with the caret in the new host, and no React commit error appears. — `docs/plans/artifacts/ime-empty-block/b3-test-react-a1.log`, `docs/plans/artifacts/ime-empty-block/b3-spec-a1.log`
- [x] Run Benchmark's pre-acceptance probe on element rendering, because every element now builds a revision key. Every `react-runtime-node-fanout` render count at 1001 blocks matches HEAD; timing was inconclusive on a loaded host, and the lane's own fan-out assertion fails the same way at HEAD. — `docs/plans/artifacts/ime-empty-block/bench/cand-fanout.json`
- [x] Run the recovery's writing passes and a panel on its diff. Three rounds each applied one critical with a contract that failed first: a stale cached path, an end handler that replaces the line's text, and an end handler that commits React synchronously or claims the event. Round 3 was the last under the cap, so its fix had no panel round. — `docs/plans/artifacts/ime-empty-block/p6-handler-before-a1.log`, `docs/plans/artifacts/ime-empty-block/p6-handler-after-a1.log`, `docs/plans/artifacts/ime-empty-block/p4-moved-line-before-a1.log`, `docs/plans/artifacts/ime-empty-block/p5-replaced-text-before-a1.log`
- [x] Lint the task paths, rerun the repeated acceptance proof, and compare `pnpm check` with HEAD. The same 16 of 25 steps fail at HEAD, with identical error lines and the same failing tests. — `docs/plans/artifacts/ime-empty-block/b6-lint-task-a1.log`, `docs/plans/artifacts/ime-empty-block/fin-spec5-a1.log`, `docs/plans/artifacts/ime-empty-block/fin-pnpm-check-a1.log`, `docs/plans/artifacts/ime-empty-block/pnpm-check-head-a1.log`
- [ ] Commit in a detached worktree, push a branch and open the PR against `next`.

## Open work

- The automated native input-method lane needs Accessibility and event-posting permission for the terminal and Apple Pinyin enabled (`node tooling/ime/macos-ime.mjs status` showed all three off). owner: the owner (natamox). stop: the owner grants them or drops the lane. Tracked here.
- Reflect Backlog, listed in the Close. owner: the owner (natamox). stop: the owner takes or drops each item. Tracked here.
- On Android, a keyboard that marks just-typed text as its composing region and then replaces it, as the owner's Korean keyboard does, duplicates letters (`한글` becomes `ㅎ하한ㄱ그글`). The editor applies each composition update as a new insert instead of replacing the region, in any paragraph. HEAD does the same, so it is a separate bug. On the same keyboard, typing `ㅎ` in an empty paragraph and pressing Backspace merges the paragraph into the one above and keeps the letter (`more.ㅎ`), also on HEAD. owner: the owner (natamox). stop: the owner starts or drops that fix. Tracked here.
- Plan review limits: a composition that starts over an expanded selection and empties the line is model-owned and is not rebuilt; a missing compositionend is not rebuilt, because that path cannot tell a cancel from a pending commit; WebKit and Firefox are untested. owner: the owner (natamox). stop: the owner takes or drops each. Tracked here.
- Deferred review warnings on the recovery build: WebKit and Firefox rows for the empty-text anchor; moving the cancel branch out of the end handler; two Editables that share one view both redraw the line; the render revision helpers keep their text names while they also count element revisions; the line key is read from the host's `data-editor-node-key` instead of being recorded on the composition epoch at start; the revision bump and its wake sit in two modules; the moved-line contract checks the DOM but not the caret or the next composition. The journal-era warnings went away with the journal. owner: the owner (natamox). stop: the owner takes or drops each. Tracked here and in the decision log.
- No jsdom test fails when a text node's own redraw key is removed, because a model edit there never bumps the text's revision; HEAD has the same gap behind a duplicate parent key. owner: the owner (natamox). stop: the owner adds a browser-level case or drops it. Tracked here and in the decision log.
- Suggested task `local-20261015-1`, After: Fix Android composing-region duplicates and Backspace merge (xhigh). It waits for `task_43552eb2`, `task_50cd0226` and `task_4505cc97`, which also write `packages/plitejs/src/react/editable`. owner: the owner (natamox). stop: the owner starts it in its own session or drops it. Tracked in `docs/plans/suggested-tasks.decisions.tsv`.
- `task_f1475754`, started 2026-10-12, writes `packages/plitejs/src/react/editable` too; if its session is still live, it rebases on this PR. owner: the owner (natamox). stop: that task lands or the owner stops it. Tracked in `docs/plans/suggested-tasks.decisions.tsv`.
- `decorations-async` IME rows fail the same way at HEAD. owner: the owner (natamox). stop: the owner takes or drops it. Tracked here.

## Close

Reversals and deviations come first.

- The lead built the first fix before running architect, the todo list, the mutation proof and this plan. That was fixed only after the owner asked whether the pstack workflow had been followed.
- The first architect round picked a journal that replayed the browser's DOM edits on Escape. The owner checked that version by hand on macOS with WeType. PR panel rounds 1 and 2 then found that the replay could undo structure without its text and restore corruption a queued repair had fixed, so the journal left the loop and was reverted.
- A second architect round picked the remount the PR ships: Escape on an empty line rebuilds that line's block from the document. The plan panel moved the remount owner to the element's own render revision, because the React composition session cannot keep a text key.
- Each of the three build-diff rounds applied one critical finding, each behind a contract that failed first. Round 1 found a stale cached path. Round 2 found an end handler that replaces the line's text. Round 3 found a handler that commits React synchronously or claims the event, so the rebuild now runs before the app's `onCompositionEnd`. Round 3 was the last under the cap, so no panel round reviewed its fix.
- A root `pnpm lint:fix` early in the run rewrote 46 committed files outside the task, which were reverted; `pnpm lint:task` on the task files replaced it.
- The owner's hand check covers the journal version, not the shipped remount.

What landed is pushed to branch `fix/ime-empty-block`. The PR against `next` waits for the owner's word, because `pnpm check` fails as it does at HEAD.

- An empty-text composition anchors on its text host, so the preedit caret stays at the preedit end.
- An empty compositionend that wrote nothing finishes at once.
- When Chrome has dropped the line's text host, the editor remounts the line's block from the model before any app handler runs.
- Four Chromium specs in `apps/www/tests/browser/homepage-ime.spec.ts` cover the caret, typing after Escape, a new composition after Escape and mid-text typing after a cancel.
- `ime-caret.test.tsx` covers the anchor choice at each text boundary, top-level and nested rebuilds, a cancel inside a React commit, and end handlers that move the line, replace its text, commit synchronously or claim the event.
- `.changeset/plite-ime-caret.md` describes both fixes.

Proof and its limits come next.

- On the final bytes, frozen as `219c937`, the Chromium spec passes 25 of 25 over five repeats, and the CDP probes pass 5 of 5, the key burst 10 of 10. The plitejs React partition passes 1371, the dom partition 291, typecheck is clean, and the Plite Chromium IME rows pass 30 with 2 skipped (`fin-*.log`).
- Six of seven final mutants fail their named test (`final/mutate-run.log`). The seventh, a cached-path lookup, is equivalent now that the key is read before the end handler.
- No jsdom test fails when a text's own redraw key is removed, here or at HEAD.
- `pnpm check` fails 16 of 25 steps on the final bytes, and the same 16 fail at HEAD in a detached worktree with identical error lines that name no task file. Run alone, `test` fails the same 5 tests as HEAD, `test-slow` fails 10 that HEAD also fails (HEAD fails 12), the plitejs tests fail the same 10 authored and Yjs tests, and `cli-test` passes on both.
- Every browser run simulated Chrome's input method through CDP. A real macOS input method ran only on the journal version, and Android ran with real key taps on the owner's phone, where WeType was right and a Korean keyboard showed two bugs that HEAD shares. Safari and Firefox were not run.
- The hand drive did not run, because this session has no browser tool.
- Element rendering keeps HEAD's render counts at 1001 blocks; its timing was inconclusive on a loaded host (`bench/cand-fanout.json`).

Counts: 23 items in all, the 19 plan steps and 4 close gates. 18 steps are done, and the PR step is partial until the PR opens. Of the gates, the suggested task is done, the hand drive is blocked, and the decision-trail review and a second reflect are open.

The first reflect ran one opus reviewer over the three lenses. Nothing applied without approval, because no lesson was a script fix or a same-length rewording.

Accepted, waiting for the owner's approval:

- Note in `verify`'s command recipes that the managed Plite runner stops after the first failing batch, so a known-red file goes in its own run.
- Note in the hand-drive reference to check for a browser tool before starting `www-drive`.
- Add the CDP Escape-cancel recipe and a tight cancel-then-type loop for timing-sensitive IME specs to `verify`'s native editor proof.
- Add to the Bug fix playbook's step 3 delta that the architect check runs when a fix first touches a second file's API.

Rejected:

- Run proof commands through `proof.mjs` from the first run. The trails rule already says so, so this was an execution miss.
- Keep every progress line in the reply language. The todo rule and the memory already say so; the lead broke it and switched back.
- Record that the architect pick rested on an unreproduced race. This is applied to this Close instead of a rule.

Backlog, each with owner: the owner (natamox) and stop: the owner takes or drops it:

- A wrapper that sets the mise Bun and Node versions from the repository pins, because plain `bun` and the managed runner failed here.
- `proof-worktree.mjs --install` fails offline when one tarball is missing, and `--prefer-offline` worked.
- A `mutate.mjs` mode for browser specs that need a `next dev` server, replacing the hand-made worktree harness in this run.
- The hand-drive Stop hook should also read `git diff`, since shell edits are invisible to it, and accept a logged `blocked` row.
- `cross.mjs` should back off on a 429, because two Codex seats started together dropped one.
- The installed pstack is 0.9.67 while `.claude/settings.json` pins v0.9.84, and nothing warns.
- The Delivery rule's root `pnpm lint:fix` rewrites committed files on `next`, so it should always scope to the task's paths, through the shared source.
- A hook that reports a missing todo list or decision log before the first product edit, so a skipped workflow shows without the owner.
- An architect entry for reviewing an already-built fix with its patch and premises, through the shared source.
