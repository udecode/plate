# Install command box keeps its copy icon off the text

Status: waiting on you to open the browser pane, so I can take the hand drive's screenshots
Page: https://claude.ai/artifact/CusZhfC3Fp7QS7FAawg6Rg
Playbook: bug-fix

At 375 px, the one-line install command boxes on a component page drew their copy icon over the end of the command. The last character could not be seen even when scrolled to the end. The hand drive of [2026-10-14-file-card-header](2026-10-14-file-card-header.md) found it, and the owner asked to fix it in the same session. The box is `CodeBlock` in `apps/www/src/components/codeblock.tsx`, and the new test is `apps/www/tests/browser/codeblock.spec.ts`.

## Brief

### What will change?

Install commands on phones now wrap onto more lines, and the copy icon never sits on the text. On desktop, short commands look the same, and long ones wrap instead of hiding their end.

### What could go wrong?

Long install commands take two lines on desktop. Code samples with several lines still scroll under the icon, as before. Tests pass in Chrome and Safari engines, and the screenshots wait on you opening the browser pane.

## Teach

A component page shows install commands in small dark boxes, such as the npm line that adds Plate. Each box has a copy icon pinned to its top right corner.

The box showed the command on one line and scrolled it sideways. The icon covers the last 36 px of the box, but the box kept only 16 px of space on its right. On a phone, the command ran under the icon. Even scrolled all the way, its last character stayed hidden.

Now a one-line command wraps onto more lines. Every box also keeps 44 px clear on the right. Nothing sits under the icon, and scrolled code samples can reach their last character.

## Demo

1. Open http://localhost:3519/docs/components/autoformat in a 375 px wide window. The CLI box shows `npx shadcn@latest add @plate/autoformat` on two lines, with the copy icon clear of the text.
2. Pick the Manual tab. The `npm install` box under step 1 wraps the same way.
3. Open http://localhost:3519/docs/components/code-block at 1280 px and pick Manual. The long `npm install` line wraps onto a second line and ends in full.
4. From the repository root, run `PLAYWRIGHT_BASE_URL=http://localhost:3519 pnpm --dir apps/www exec playwright test --config playwright.config.ts --project=chromium --project=webkit tests/browser/codeblock.spec.ts`. It reports 2 passed.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Long commands on desktop | Wrap onto a second line | Keep one line that scrolls | scroll commands | small |
| Code samples with several lines | Keep scrolling under the icon | Keep a clear strip beside the icon on every line | gutter samples | small |
| Release note | None, only the docs site changes | A patch note | add changeset | detail |

## Main changes

- `CodeBlock` passes `wrapLongLines` for code without a line break, so commands wrap instead of scrolling.
- Its code area's right padding grows from `1rem` to `2.75rem`, which clears the copy button's `right-2` inset and `size-7` width with a 0.5rem gap.

## Close

**Deviation first.** The suggested task asked to keep 1280 px unchanged. Short commands are unchanged there. A command longer than its box now wraps to a second line, because at the old code its tail hid under the copy icon on desktop too. The Defaults row "scroll commands" restores the single line.

**What landed.** `CodeBlock` in `apps/www/src/components/codeblock.tsx` wraps code that has no line break, and its code area keeps 2.75rem clear on the right. That covers the CLI tab box and the Manual tab's npm box. The one-line commands in the MCP dialog use the same component, but I did not open that dialog. The new `apps/www/tests/browser/codeblock.spec.ts` opens the autoformat page's Manual tab at 375 px. It collects every non-space character of the npm box that sits under the copy button. No changeset applies, because only the docs site changes.

**Proof and its limits.**

- The case fails at the old code, `HEAD` 6fa1169c5e, in a fresh worktree with its own www server. It receives `-matc`, the characters under the icon.
- It passes on Chromium and WebKit on the final bytes, together with the file-card spec, 6 of 6.
- Firefox can't launch on this machine, so the fix carries no Firefox claim.
- At 1280 px, the long code-block command wraps to two lines with no overflow. A measurement shows this, not a screenshot.
- The hand drive has no screenshots yet, because the browser pane is hidden.
- The audit found that on the plugin pages' MDX code samples, the copy icon also covers the first line's tail at rest. Those characters scroll out from under the icon, so I kept that behavior. The Defaults row "gutter samples" changes it.

**Counts.** Of 4 asks, 3 are done and 1 is partial. Reproducing, the fix and the test that fails at the old code are done. The hand drive is partial, waiting on the browser pane. No removal ran.

**Open work.**

- Finish the hand drive for this page and the file-card page. owner: zbeyens, by opening the browser pane beside this session. stop: `hand-drive.mjs check --log` passes on both plans' logs.
