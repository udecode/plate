# Make next's Plite Chromium shards pass

Status: executed: landed in your checkout's working tree, waiting on your commit
Page: https://claude.ai/artifact/Vu4Rm8ir7TYxZJxdxwHTtc
Playbook: bug-fix

## Brief

### What will change?

Plite's Chromium checks pass again in a local run of CI's four shards. Deleting a whole bold line keeps bold for your next word. Dragging past the bottom of a long document keeps scrolling when you nudge the mouse.

### What could go wrong?

The proof ran on a Mac, on this fix alone, not with your checkout's other uncommitted work. Linux CI first checks one key fix. An external-text race under heavy load is left to its own task.

## Teach

Plite's browser tests run against a production build of the example app. CI splits them into four groups, and each group stops at its first failure. So for weeks most tests never ran.

Two failures were real editor bugs. Deleting a whole bold line forgot the bold, because an empty line no longer stores formatting and that delete never kept it at the caret. In a long document, dragging a selection past the bottom stopped scrolling once you moved the mouse again, because a second drag handler grabbed the selection the first one drew. A third bug, in the build tool, crashed every drag that scrolled. Another task's rewrite of that code made it go away.

The rest were tests that still expected behavior the editor changed on purpose, a timing guess a busy machine broke, and errors from other sites' embedded frames. Those tests now expect today's behavior, and the test error check skips other sites' errors.

## Cases

Logs live in `docs/plans/artifacts/2026-10-15-plite-chromium-ci/`. The base run is `full-base-a2.log`: 27 failed, 726 passed, 14 skipped, 7 not run.

| Case | Root cause | Fix | Red, then green | Ends |
| --- | --- | --- | --- | --- |
| Drag cases throw `getFlatTreeParentElement is not defined` (images, embeds, Plate block drag) | Next 16.3.2's Turbopack leaves an import unbound in a `for` update clause that only `continue` reaches, in a body that ends in `return` | task_825633f8's landed rewrite walks the scrollers in a generator whose body completes, so the shape is gone; this run's own helper version was dropped | `repro-variants-a1.log`, then `scan-hazard-rebased-a1-a1.log` and `full-fix3-a1.log` | keep; t_c093a88a adds a check |
| richtext: keeps selected bold as the active mark after deleting its text | `6fa1169c5e` made empty text keep no marks, and the full-block branch of `fragment.delete` never moved the deleted marks to the caret | that branch sets the deleted text's marks as pending marks | `bisect-marks-a1.log`, then `richtext-marks-fix2-a1.log` | keep |
| richtext: keeps empty paragraph styling after the selection leaves and returns | asserts the reverse of the empty-line law in `docs/vision/plite.md` | cut; `content-completion.spec.ts:149` pins the law | `richtext-marks-fix2-a1.log` | keep (cut) |
| authored: three quote reject cases | `422564e6f6` makes a reject hold a replacement's deletion claims as held members on purpose; the spec's `marked` helper counted them | the helper counts claim members only | `full-base-a2.log`, then `authored-fix2-a1.log` | keep |
| authored: Home and End | Playwright on a macOS host maps Shift+End to the document end, and Plite leaves Shift+End to the browser | Meta+Shift+ArrowRight on macOS, Shift+End elsewhere | `full-base-a2.log`, then `authored-fix2-a1.log` | keep; Linux proof is CI |
| suggestion-first-paint | `422564e6f6` paints suggestions through node props, so a text wrapper and its leaf both carry the authored attributes | count text wrappers only | `full-base-a2.log`, then `authored-fix2-a1.log` | keep |
| decorations-async: two IME cases | `a5d07011f3` defers decoration DOM writes in the composing region and keeps the composing text host, per the IME caret plan | the cases expect the intended highlight count and the kept text flow; a repaint after commit is not separately shown | `full-base-a2.log`, then `decorations-async-fix2-a1.log` | keep |
| plate-schema-descriptors | `a5d07011f3` exports a media embed's provider, source URL and width, and list paste generates each list's `listId` | the case expects the shipped projection and ignores generated ids | `full-base-a2.log`, then `schema-descriptors-fix2-a1.log` | keep |
| paste-html: Apple converted spaces before an IME follow-up | `3e0ab4dd7d` moved the restore from Plite core to Plate's HtmlPlugin, and the Plite example parses with its own `DOMParser` helper | the example parser restores the spans itself | `full-base-a2.log`, then `paste-stress-fix3-a1.log` | keep |
| stress: richtext dom-mutation-import undo | the import and the typed text share one undo step only inside the 500 ms merge window, which a loaded runner misses | undo twice; a merged step makes the second undo a no-op | `stress-undo-split-probe-a1.log`, then `stress-fix2-a1.log` | keep |
| stress: embeds (CI only) | Cloudflare Turnstile and Vimeo errors thrown inside third-party frames reach Playwright as page errors, and the recorder matched Vimeo messages one by one | `recordBrowserRuntimeErrors` skips an error whose URLs all name other origins than the page | `runtime-errors-red-a1.log`, then `runtime-errors-green-a2.log` and `paste-stress-fix3-a1.log` | keep |
| images: two drop cases | `4e16eada7d` lands a block-mode node selection after a move, which paints no DOM range | the cases assert the model's node selection | `full-base-a2.log`, then `images-fix2-a1.log` | keep; t_7c515bcf checks body drag |
| huge-document: downward drag autoscroll in virtualized mode | since `bdfb69ab5a`, any view selection moves a pending projected drag into its own branch, which collapses to the mousedown point and stops autoscroll; a virtualized coordinate drag writes one once its anchor row unmounts | the projected drag keeps its branch only for a view selection it wrote; the case nudges the pointer after the view selection paints | `huge-autoscroll-red-a1.log`, then `huge-autoscroll-green-a1.log` | keep |
| external-text: forward Shift+Right boundary | a main-thread block right after the keydown collapses the selection; the lapsing guard is not pinned | none here | failed once at load about 220; 69 of 69 otherwise | defer to t_9de69e6d |

## Main changes

- `packages/plitejs/src/core/editor-commands.ts`: the full-block branch of `fragment.delete` sets the deleted text's marks as pending marks when it leaves an empty default block.
- `packages/plitejs/src/react/editable/root-interaction-controller.ts`: a pending projected drag takes over only a view selection it wrote, tracked as `wroteViewSelection`, instead of any view selection.
- `packages/test/src/playwright/runtime-errors.ts`: `recordBrowserRuntimeErrors` skips an error whose URLs all name origins other than the page's, in place of three Vimeo message matches.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Bold after deleting a whole bold line | Your next word stays bold while the caret stays there | The line turns plain right away | plain after delete | small |
| The test that kept an emptied line bold after the caret left | Cut it, since it contradicts the empty-line rule | Keep it and change the rule | keep empty bold test | small |
| Errors from other sites' embedded frames | Tests skip errors that name only other sites | Keep matching known messages one by one | match frame errors | small |
| The external-text race | Its own task, since the guard that lapses is unknown | Fix it in this run | fix race here | small |
| The drag-scroll loop fix | Use the other task's rewrite that already landed | Put this run's version back | my loop fix | detail |
| Home and End key in the authored case | Cmd+Shift+Right on a Mac, Shift+End elsewhere | Shift+End everywhere | shift end everywhere | detail |
| Undo in the stress case | Undo twice, so a merged undo step passes too | Wait out the merge window | wait merge window | detail |
| What the patch applies on top of | The checkout's landed copies of four shared files | The last commit | patch from head | detail |

## Completion Gates

| Gate | Status | Evidence |
| --- | --- | --- |
| Hand drive | passed | `docs/plans/artifacts/2026-10-15-plite-chromium-ci/hand-drive-check-a2.log` |

## Close

Reversals and deviations come first.

- This run's own `getDragAutoScrollTarget` fix is dropped. task_825633f8 landed a generator rewrite of the same loop while this run was open, and the AST scan finds no loop of the hazardous shape in it. The approved row that adds the helper stays in the log.
- The landing deviates from the brief's Landing command. The patch is cut against the checkout's landed copies of `dom-drag-scroll.ts`, `root-interaction-controller.ts` and their two tests, not against `HEAD`. The literal `git diff --cached HEAD` would have carried task_825633f8's and task_50cd0226's hunks again and refused to apply. `rebase/make-patch.sh` in the run directory builds it.
- The huge-document fix edits `root-interaction-controller.ts`, outside the brief's `writes:`. A `started` row added the path before this run's edit, but the checkout's copies of that file and the two tests came into this worktree before that row. The tests carry only the other tasks' bytes and stay out of the patch.
- The first `started` row named `.changeset`, but no changeset landed. plitejs has only its 0.0.1 placeholder on npm and `@platejs/test` is unpublished, so no user upgrades into these fixes.
- One richtext case is cut, because it asserts the reverse of the empty-line law.

What landed is `/Users/zbeyens/git/plate-2/docs/plans/artifacts/chips/t_61fb954d.patch`, applied to the checkout's working tree on 2026-10-15. It changes 16 files, and each one matches this worktree byte for byte after the apply. A follow-up patch, `/Users/zbeyens/git/plate-2/docs/plans/artifacts/chips/t_61fb954d-close.patch`, restores the parser's escape and adds this Close and the review rows.

The proof runs on a macOS host, on `b1e70bb257` plus the landed copies of the four shared files plus this patch. It never ran on the checkout's combined working tree, which holds other sessions' uncommitted work.

- CI's own command, run per shard through the managed runner after the last product edit, passes all four shards: 209, 191, 185 and 174 passed, 7 skipped. CI's coverage merge over their summaries passes with 766 applicable tests.
- The drag and timing cases, run 5 times each without retries, pass 365 of 365. That covers huge-document's autoscroll, the images file, the richtext bold case, the stress file and the external-text file. The paste-html file passes 365 of 365 over 5 repeats after the last parser edit.
- The huge-document autoscroll case fails 5 of 5 before the fix and passes 5 of 5 after. The retained-suggestion drags in www pass 10 of 10. selection-drag-scroll passes 4 of 5, with its one failure at page setup before any pointer input, then 5 of 5 on a rerun.
- The hand drive covers all 4 cells. It could not judge autoscroll, because the hidden pane throttles frames, so the Playwright case holds that claim.
- `typecheck:tests` and one plitejs contract fail the same way at `HEAD`. t_54844d26 owns both.

Where the proof stops:

- No Linux CI result exists yet, and CI's Linux run is the first check of the Home and End key change.
- The external-text race is still a bug. A forced 250 ms stall after the keydown collapsed the selection 6 of 6 times; the final repeats passed without that stall.
- The two IME cases pass with the intended highlight count and the kept text flow. That the deferred refresh paints after commit is not separately shown.
- The error recorder skips the observed third-party errors. Outside strict mode it would also skip a first-party console error that names only foreign URLs; that case is not observed and not ruled out.
- The Apple space case is proven only through Playwright's native Chromium clipboard.

Attention, reviewed by gpt-6.1-sol @xhigh. The decision-trail review raised 6 warnings, 2 nits and no critical finding, and this Close applies all eight. They cover the proof's tree and the missing Linux result, the landing deviation, the copies made before their `started` row, the narrower IME claim, the recorder's residual risk, the external-text deferral, the non-breaking space escape that the helper extraction had undone, and a double-counted rerun.

Counts over the 14 cases: 13 done, 0 partial, 0 skipped, 0 blocked, 1 open, which is the external-text race in t_9de69e6d.

The close sweep found no archived session behind any card or started task, so it logged nothing.

## Open work

- t_9de69e6d: keep external-text's forward Shift+Right selection under main-thread load. Tracked in `docs/plans/suggested-tasks.decisions.tsv`. owner: zbeyens. stop: the task lands or is dropped.
- t_7c515bcf: check that an image void drags by its body in Chromium. Tracked in the same ledger. owner: zbeyens. stop: the task lands or is dropped.
- t_c093a88a: refuse the Turbopack for-update miscompile in a check, and draft an upstream Next.js issue for you to send. Tracked in the same ledger. owner: zbeyens. stop: the task lands or is dropped.
- The Home and End case is proven on macOS only. Tracked here. owner: zbeyens. stop: the first Plite Chromium CI run on next after your commit passes `authored-changes.spec.ts`, or that run fails it and a task is offered.
- Three subject pages still list open items this run closes: `docs/plans/topics/html.md:156` (the schema descriptor case), `docs/plans/topics/react.md:78` (the two IME cases) and `docs/plans/topics/tags.md:138` (the two richtext cases). The Lexical and ProseMirror harvester ledgers still cite the cut richtext case. Tracked here. owner: zbeyens. stop: each subject's next iteration closes its item, or 2026-11-30.
