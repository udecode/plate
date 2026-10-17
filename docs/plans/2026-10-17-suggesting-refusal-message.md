# Show the Suggesting refusal message in the www refusal specs

Status: executed: waiting on your commit on next
Page: https://claude.ai/artifact/FjAtr59F8ojGF5ximkT9By
Playbook: bug-fix

Suggested task t_391b7b01. Against a www dev server at `c5921381cf`, five cases of `apps/www/tests/browser/suggestion-refusal.spec.ts` failed in Chromium, Firefox and WebKit, and the composition case failed in Chromium. Each waited for the "Suggesting is off in … for now." toast, which never appeared. The editor refused the key and raised the toast. The root layout skipped `<Toaster />` under `PLATE_WWW_PLITE=1`, the mode that `pnpm dev:plite` and the www browser runner serve, so nothing drew the toast.

## Brief

### What will change?

The www browser tests now see the refusal message. Test mode has the toast area too, so every toast the editor raises there shows up.

### What could go wrong?

Toasts now show up in test mode. One sits in the bottom right corner for a few seconds and could cover something a test clicks. I ran the whole Chromium suite with the fix. It had 45 failures, and none came from the fix. 34 fail without it too. 10 were flaky or came from a server left running for an hour. The last was this bug's own test, which passes on a fresh server.

Trying it by hand turned up an older bug. A letter refused at the end of a table cell stays on screen, but the document never gets it. It happens without the fix too, so it's its own task now.

## Teach

A toast is a small message that pops up in a corner of the page. The editor UI that Plate users copy into their apps shows its warnings as toasts, such as "Suggesting is off in tables for now." A toast only shows up when the page has a Toaster component to draw it, and www puts one in its root layout.

www can also run in Plite mode, which one environment flag turns on. The www browser tests run against a server in that mode. The root layout left the Toaster out of Plite mode, along with analytics and a dev-only screen size badge. So the editor refused the key and asked for a toast, but nothing drew it.

The fix puts the Toaster in both modes. Analytics and the badge still stay out of Plite mode. The test had passed once, on a server started without the flag, so nobody noticed.

## Demo

1. Start www in the test mode: from `apps/www`, run `PLATE_WWW_PLITE=1 PLATE_WWW_DEV_SOURCE=1 pnpm exec next dev --port 3653`, then open `http://localhost:3653/blocks/playground`.
2. In the toolbar, switch Editing to Suggestion. Click inside a table cell and type a letter. Nothing is typed, and a toast in the bottom right says "Suggesting is off in tables for now. Switch to Editing to change them."

## Main changes

- `apps/www/src/app/layout.tsx` mounts `<Toaster />` in every mode. `GA` and `TailwindIndicator` stay out of Plite mode.
- The plate-notes lesson that said Plite mode renders no toasts now says to prove a www spec in the mode its runner serves, and records this failure.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Where the fix goes | Show toasts in the test mode, like the normal site | Keep the test mode bare and run these tests on a normal server; drop the toast check from the tests | bare mode | small |
| New test | None, the refusal tests already fail without the fix | Add a test that checks the toast area exists | toaster test | detail |
| Panel review | Skipped, a one-line app change with no public API | Run a panel on the diff | panel | detail |
| Page link | The old page https://claude.ai/artifact/FYXAg5om3XUrPsNZ8fuz18 was gone at the close, so this plan has a new page at https://claude.ai/artifact/FjAtr59F8ojGF5ximkT9By | Drop the new page too, if you deleted the old one on purpose | drop page | detail |

## Steps

- [x] 1. Reproduce on the runner's own mode. Proof: `suggestion-refusal.spec.ts` fails its toast cases in Chromium against a `PLATE_WWW_PLITE=1 PLATE_WWW_DEV_SOURCE=1` server at the base. Done: 6 of 7 fail at the toast (`refusal-chromium-red-a1.log`).
- [x] 2. Find the cause. Proof: the base page in that mode has no Toaster section, and changing only the Toaster mount turns the failing cases green. Done: `cause-evidence.md`, then 7 of 7 pass with only the layout changed (`refusal-chromium-green-a1.log`).
- [x] 3. Fix at the owner, the root layout. Proof: the spec passes in Chromium, Firefox and WebKit on the final bytes. Done: five runs per engine, `final-refusal-{chromium,firefox,webkit}-a1.log`.
- [x] 4. Check the blast radius. Proof: the whole Chromium www suite against the same server, each failure attributed. Done: 45 failures, each attributed in `attribution-table.txt` and the repeat and fresh-server logs.
- [x] 5. Hand drive the playground in the test mode. Proof: a screenshot of the toast and the `hand-drive.mjs check` log. Done: `drive/fix-toast-cell-end.jpg`, `drive/fix-toast-cell-start.png`, `hand-drive-check-a1.log`.

## Completion Gates

| Gate | Evidence |
| --- | --- |
| Refusal spec, three engines, final bytes | Chromium 35 of 35, Firefox 30 of 30, WebKit 30 of 30, after lint |
| Chromium suite | 45 failures, none caused by the fix |
| Hand drive | toast seen at both ends of a table cell; check covers `/blocks/playground` desktop |
| Writing passes | deslop and no-comments on the layout; unslop and bro on this plan and the plate-notes entry |
| Lint | `pnpm lint:task` on the layout passes, and the file is unchanged |

## Verification

- The refusal spec passed five times in a row in each engine on the final code, on a fresh server in test mode.
- I ran the whole Chromium www suite with the fix, then reran each of its 45 failures on a server without the fix. The Close says where each one comes from.
- By hand on `/blocks/playground`, a key typed into a table cell in Suggesting mode shows the toast.

## Close

Reversals and deviations first.

- `.claude/launch.json` held three server entries for this run's proof servers. They are removed, and the file matches the base.
- The first fix carried a one-line comment. comment-sicko killed it because the refusal spec fails if the Toaster is gated again, so the diff is one line.
- The session restarted twice during the suite. The first run stopped at case 416, and the 23 later spec files ran again as a second run against the same server. Later runs ran detached so a restart could not kill them.
- The failure screenshots of the first suite run and the first base rerun were lost. Playwright empties `test-results` when a run starts, and the copy step died on zsh's read-only `status`. Every log keeps its failure messages.
- The hand drive found drift-1, which predates the fix. It went to suggested task `t_ba20179f`. The log's drift row says the stray letter stays "until the next edit there redraws it". In the drive it cleared on the next key press in another cell.

What landed: `apps/www/src/app/layout.tsx` mounts `<Toaster />` in every mode. The plate-notes entry in `docs/research/sources/plate-notes/testing-and-proof.md` now says to prove a www spec in the mode its runner serves. Both, with this plan and its log, wait in the working tree on next for your commit.

Proof and its limits:

- Reproduction: against a Plite-mode server at base `51f3a53b66`, 6 of the 7 refusal cases failed in Chromium at the toast. The brief's five, plus the Chromium-only composition case.
- Fix: with only the layout changed, 7 of 7 passed in Chromium. 6 passed and the composition case skipped in Firefox and in WebKit.
- Acceptance: on the final bytes after lint, five runs per engine passed. Chromium 35 of 35, Firefox and WebKit 30 of 30 each.
- Suite: the 597 Chromium cases had 45 failures. 33 also fail on a base server from a detached worktree at `51f3a53b66`. The docx export fails 3 of 3 on base, so it predates the fix too. 5 pass on both servers when rerun. 5 failed only on the hour-old fix server: the media-caption arrow-key case and four typing bursts. A fresh base server against a fresh fix server cleared them. The fix passed the typing bursts 20 of 30, base 14 of 30, and both passed the arrow keys 6 of 6. The last failure is the composition refusal case, this bug's own test. On base it fails at the missing toast. On the hour-old fix server it timed out twice while placing the caret, before it reached the toast, then passed 3 of 3 there and 5 of 5 on a fresh server.
- Hand drive: `/blocks/playground` at 1280 px in light, Suggestion mode, one key at the start and one at the end of a table cell. Both showed "Suggesting is off in tables for now. Switch to Editing to change them."
- Limits: Firefox and WebKit ran only the refusal spec, not the whole suite. The hand drive ran in Chromium at desktop width only. The typing bursts are timing checks that fail on both servers some of the time.

Counts: 5 of 5 steps done.

## Open work

- The fix, the plate-notes entry, this plan and its log wait on your commit on next. owner: zbeyens. stop: the owner commits them.
- A key refused at the end of a table cell stays on screen while the model keeps the old text. Tracked as suggested task `t_ba20179f`. owner: zbeyens. stop: `t_ba20179f` lands or is dropped.
