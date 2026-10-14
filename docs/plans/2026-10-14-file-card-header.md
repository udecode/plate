# File card header fits on phones

Status: waiting on you to open the browser pane beside this session, so I can take the hand drive's last screenshots
Page: https://claude.ai/artifact/RM88mncRJRYqGrStSmYNLf
Playbook: bug-fix

At 375 px, the docs file card under a component page's Manual tab pushed its two copy buttons past the card's right edge, where the card clips them. The 2026-10-14 hand drive of [2026-10-13-basic-review](2026-10-13-basic-review.md) found it and left it in that plan's Open work. This run fixes the card in `apps/www/src/components/block-viewer-code.tsx` and adds `apps/www/tests/browser/block-viewer-code.spec.ts`.

## Brief

### What will change?

On phones, the code card's copy buttons stay inside the card, where you can tap them. Long file paths end with "…". Cards with two files show their file list above the code instead of squeezing it.

### What could go wrong?

On a phone, a two-file card starts with its short file list, so the code sits lower. Tests pass in Chrome and Safari engines. Firefox won't launch here, and the screenshots wait on you opening the browser pane.

## Teach

The docs show each component's source in a code card. Its top bar holds the file's icon, its path and two copy buttons. When a component has several files, a file list sits to the left of the code.

The bar lays these out in a row. The path is one long word with no place to break, so the row could not make it narrower than its full length. On a phone it pushed the buttons past the card's right edge, and the card cut them off. Cards with two files had a second problem. The file list kept its desktop width of 240 px, which left the code 32 px wide.

Now the path shrinks first and ends with "…". Below 640 px, the file list sits above the code at full width. From 640 px up, nothing changes.

## Demo

1. Open http://localhost:3519/docs/components/autoformat in a 375 px wide window, pick the Manual tab and scroll to step 2. The card's top bar shows the icon, `@components/edit…` and both copy buttons inside the card's rounded border.
2. Open http://localhost:3519/docs/components/toolbar the same way. The card shows its file list first, then the code at full width, with both buttons inside the card.
3. Widen the window to 1280 px. Both cards look as before, with the full path and the file list on the left.
4. From the repository root, run `PLAYWRIGHT_BASE_URL=http://localhost:3519 pnpm --dir apps/www exec playwright test --config playwright.config.ts --project=chromium --project=webkit tests/browser/block-viewer-code.spec.ts`. It reports 4 passed.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Cards with several files on phones | File list above the code | Hide the file list on phones | hide tree | small |
| Where a long path gets cut | At the end, with "…" | At the start, so the file name shows | cut start | detail |
| Release note | None, only the docs site changes | A patch note | add changeset | detail |

## Main changes

- The card's top bar wraps the path in a `min-w-0 flex-1 truncate` span, so the path shrinks before anything else, and the button group drops `ml-auto`, which `flex-1` makes redundant.
- Below `sm` (640 px) the card is a column and the file tree spans its width with a bottom border; from `sm` up it is the old row with a 240 or 288 px tree and a right border. The loading card takes the same layout.

## Open work

- At 375 px, the `npm install` command box above the card drew its copy icon over the end of the command text. It is a different component, `CodeBlock`, fixed in [2026-10-14-command-box-copy-icon](2026-10-14-command-box-copy-icon.md). owner: zbeyens. stop: that plan's hand drive passes.

## Close

**Deviation first.** The request named one card shape, and the drive found a second one. A card with two files kept its 240 px file list on phones, so its buttons were clipped too. I fixed both, because the request was the buttons staying inside the card at 375 px. The file-tree case first used the code-block page. That page also renders a huge demo, so the case's tab retry timed out there. It now uses the toolbar page, which has the same two-file card.

**What landed.** `apps/www/src/components/block-viewer-code.tsx` truncates the path and stacks the file list above the code below 640 px. The new `apps/www/tests/browser/block-viewer-code.spec.ts` has two cases at 375 px, one per card shape. Each case checks that both header buttons are the element at their own center. No changeset applies, because only the docs site changes.

**Proof and its limits.**

- Both cases fail `[false, false]` at the old code, `HEAD` 6fa1169c5e, in a fresh worktree with its own www server.
- With only the header fix, the file-tree case still fails and the autoformat case passes. That run isolates the second cause.
- Both cases pass on Chromium and WebKit against the www-drive server, 4 of 4.
- Firefox can't launch on this machine, inside or outside the command sandbox, so the fix carries no Firefox claim.
- The hand drive is incomplete. Its first pass bound four screenshots, and the file-tree edit then made them stale. The pane has been hidden since, so 7 of 8 cells are open. The one covered cell carries a screenshot this session didn't take.

**Counts.** Of 6 asks, 4 are done and 2 are partial. Finding the component, reading `CODING_STANDARDS.md` first, the test that fails at the old code and the removal rule are done, and no removal ran. The hand drive and the fix itself are partial. The fix is proven at 375 px. At 1280 px it was measured and shot only before the file-tree edit. The final layout from 640 px up keeps the old classes, so 1280 is unchanged by inference until the drive shoots it.

**Open work.**

- Finish the hand drive. owner: zbeyens, by opening the browser pane beside this session so I can take the screenshots. stop: `hand-drive.mjs check --log` passes on this plan's log.
