# Named keys get real key codes in harness presses

Status: executed: the changes wait in the working tree on next for your commit
Page: https://claude.ai/artifact/79VT1FiuodXaPmWiuXcowL
Playbook: bug-fix

`editor.press` in `@platejs/test/playwright` sends modifier shortcuts, and plain keys when the editor has no DOM selection, as synthetic `KeyboardEvent`s. Those events set `which` and `keyCode` only for one-character keys, so `ControlOrMeta+Enter`, `Escape` or an arrow arrived with `keyCode` 0 and an empty `code`. `platejs` re-exports the `is-hotkey` library as `isHotkey`, and that library compares `event.which`. A handler that matches keys with it never saw these events. The select-editor's `isHotkey('mod+enter', event)` close check is one such handler, and its browser spec had switched to `page.keyboard.press` to get around it.

## Brief

### What will change?

When a test presses Enter, Escape, Tab, Backspace, Delete, an arrow, Home, End, Page Up or Page Down, the app now sees what a real press gives it. So Cmd+Enter now closes the select field's menu in tests.

### What could go wrong?

Any test that presses these keys could act differently. I ran all of them before and after, and only the select close test changed, from failing to passing. Your 09:19 commit has a half-done version, and the working tree finishes it.

## Teach

Browser tests drive the editor through a helper that presses keys. For a shortcut with a modifier, and for some plain keys, the helper doesn't press a real key. It builds a fake key event and fires it at the editor.

That fake event had the key's name, like "Enter", but its key number was zero. Some shortcut checks compare that number, so they never saw Enter or Escape. One-letter keys already had their number.

Now each named key gets the same name, code and number a real press reports. A new test presses every one of them for real, then fakes it, and checks that the two match.

## Demo

1. In a terminal at the repo root, run `pnpm --dir packages/test exec vitest run --config ./vitest.config.ts --project browser test/browser/keyboard.browser.test.ts`. You should see one test pass. It presses each named key for real in Chromium, sends it through the harness, and checks that both report the same key, code and key code.

## Main changes

- `packages/test/src/playwright/keyboard.ts` maps the 13 named keys to their `code` and `keyCode`/`which` in one table. Both `parseSyntheticShortcut` and `parsePlainSyntheticKey` read it, and `dispatchSyntheticKey` now sets `code` on the event.
- `parseSyntheticShortcut` takes the platform from its caller instead of reading `process.platform`, so the parser runs in a browser test. `harness.ts` passes `process.platform`.
- `packages/test/test/browser/keyboard.browser.test.ts` compares each synthetic named key with a trusted press of the same key in Chromium, on both parse paths.
- `apps/www/tests/browser/select-editor.spec.ts` keeps its native `page.keyboard.press(close)` and drops the comment that blamed the harness.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| How the select field test closes its menu | A real key press, as before, with the wrong note removed | Switch to the test helper's press | helper press | small |
| What the new test compares against | A real key press in the same browser | Hand-written key numbers | fixed numbers | detail |
| How the test helper learns it runs on a Mac | The caller tells it | A test runner setting | runner setting | detail |
| Release note for the test package | None, because the test package has never been published | Add a release note anyway | release note | detail |
| Where the before and after runs happened | A separate copy of the repo at your latest commit, because other sessions kept changing this one | This working copy | live tree | detail |

## Close

**Reversals and deviations.** The first fix ran the parser in the browser test through a Vite `define` of `process.platform` in `packages/test/vitest.config.ts`. comment-sicko flagged the Node global read inside an otherwise pure parser. `parseSyntheticShortcut` now takes the platform from `harness.ts`, and the `define` and its comment are gone. Your commit `6fa1169c5e` ("authored", 09:19) captured that first version, the first test version and a temporary `editor.press(close)` probe line in the select-editor spec. The working tree finishes all three. The before and after browser runs moved from this checkout to a detached worktree at `6fa1169c5e`, because other sessions' edits stopped the Plite runner twice at `source-changed` and served a `ReactEditor is not defined` crash to one www run.

**What landed, uncommitted on `next`.** `packages/test/src/playwright/keyboard.ts` gives Enter, Escape, Tab, Backspace, Delete, the four arrows, Home, End, PageUp and PageDown their `code` and `keyCode`/`which` on both synthetic paths. `harness.ts` passes `process.platform` to the parser. `packages/test/test/browser/keyboard.browser.test.ts` is new. `packages/test/vitest.config.ts` is back to its pre-task bytes. `apps/www/tests/browser/select-editor.spec.ts` keeps `page.keyboard.press(close)` without the stale comment. Another session removed the spec's 300 ms wait, and that edit is not part of this change.

**Proof.**
- The new test failed at the intake parser with `code: ""` and `keyCode: 0` for every named key, and passes on the frozen candidate `6478d07c50`. Two mutants, one dropping the named-key table and one dropping `code` from the event init, both fail it.
- The eight www specs that call `editor.press` with a named key hold 120 cases. In the worktree, against its own dev server, the base harness passed 112 and failed 6, and the candidate passed 113 and failed 5. Only select-editor `ControlOrMeta+Enter` changed, from red to green. The link-url-policy `tel:` and paste cases each flipped once, in setup before any key press, and the paste case then passed 3 of 3 on the candidate.
- The seven Plite donor files that call `editor.press` with a named key ran in direct Chromium mode. Both harnesses passed 259, failed 2 and skipped 4, and the same two cases failed.
- The select-editor spec with its native close press passed 42 of 42 over three repeats in the worktree and 14 of 14 on this checkout's final bytes.
- `pnpm lint:task` on the five task files reported 0 warnings and 0 errors and changed no bytes.

**Limits.** Chromium only. The worktree runs used `6fa1169c5e` plus this change, not other sessions' uncommitted work. The harness test proves key identity against a trusted press. It does not prove that a synthetic press triggers browser default actions, which it never does.

**Counts.** Of 18 items, 16 are done and 2 are skipped, the commit and the PR, which wait for your word. None partial, blocked or open. Inside the done items, the architect pass was skipped because the fix stays inside one module with one caller, and the changeset was skipped because `@platejs/test` has never been published.

**Open work, not this change.** On `6fa1169c5e`, these fail with and without the fix: richtext "keeps selected bold as the active mark after deleting its text" and "keeps empty paragraph styling after the selection leaves and returns" (6 of 6), comment "AI comments publish as ordinary threads and survive session close", link-url-policy "opens the link form with Cmd+K on a selected word", media-caption "arrow keys traverse the image owner before its caption" and transient-editor-geometry "link floating editor opens from an empty paragraph". owner: you, through the follow-up task this run flagged for the richtext pair. stop: the richtext pair passes on `next`.
