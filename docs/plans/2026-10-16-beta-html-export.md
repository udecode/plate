# Get HTML Export working on beta

Status: executed: HTML Export works on beta again
Page: https://claude.ai/artifact/GMMaYkLoEXy28Fhno7GTGT
Playbook: bug-fix

## Brief

### What will change?

HTML Export works on beta again. Your fix was right, but no beta deploy had passed since yesterday, because of an unrelated type check. Committing another session's fix for that check let the deploy through.

### What could go wrong?

This can happen again without anyone noticing. When a deploy fails, beta keeps the old build, so a broken page looks like a bad fix instead of a missed deploy. Main CI is also red on separate lint errors.

## Teach

Beta is a Vercel deploy of the next branch. Each push builds Plate's packages first, then the docs app. When a step fails, Vercel keeps serving the last build that worked.

HTML Export broke because Next replaces one of React's server renderers with a fake that throws. The merged fix uses the renderer Next leaves alone. But that fix's deploy never got that far. It failed earlier, while building Plate's types. That step refuses any mention of Plite in Plate's types, and a new comment in Plite's docs leaked one in. So beta kept running the build from before both changes, until the reword landed.

The error only shows up in a production build made with webpack, the kind Vercel makes. I didn't check the dev server. A clean copy of the branch, built that way, fails without the fix and works with it. Your local type build passed only because another session had already reworded that comment here without committing it.

## Demo

1. Open https://beta.platejs.org/docs/examples/html-export. Before, the preview said "This page couldn't load". Now it shows the Editor, EditorView and HTML Iframe columns with the exported document.

   ![before](artifacts/2026-10-16-beta-html-export/beta-docs-html-export.jpg)
   ![after](artifacts/2026-10-16-beta-html-export/beta-docs-html-export-after.jpg)

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| CI lint errors | Left to the lint task that already owns them | I fix them here | fix lint | small |

## Close

Reversals and deviations come first. This run first blamed the build machine, because this checkout's type build passed while Vercel's failed. It ruled out the build cache and the CI flag, and found no file name case mismatch, before it found the other session's uncommitted reword. It never tested the Node version. The three platejs build logs came before the run used the proof logger, so they hold no command line or exit status. The proof-logged replay of the refusal backs the same claim.

On your word, this run committed only the declaration-leak plan's six files as `b04e5a1e1f` and pushed next. The four code files matched that plan's saved patch byte for byte, and the finalize test passed 20 of 20 before the commit. This plan and its log stay uncommitted.

The proof covers these runs:

- Beta's `/view/html-export` and `/blocks/html-export` both return digest `4065893653@E1021`, read 2026-10-16.
- Vercel's deploy of `93f6e8a6b6`, which holds PR 5176, ends in Error when `finalize-plate-declarations.mjs` refuses `index-5RQJkr4x.d.ts:6195`. Vercel's GitHub status is failure on `fa0ac06f55`, `0f5e38d480` and `93f6e8a6b6`, and success on `b1e70bb257`, the build beta still serves.
- A clean worktree at `93f6e8a6b6` refuses the same chunk line. That line is the `transfer.adopt` JSDoc "move keeps its blocks, and Plite sets the patched properties", which `0a5cb4f411` added to `packages/plitejs/src/core/editor-reads.ts` at line 51.
- A webpack production build of `apps/www` at `93f6e8a6b6` serves all three HTML Export routes with status 200 and no E1021 digest. The browser shows the docs preview in all three columns with no console error.
- The same build at `0f5e38d480`, whose only code difference is the loader PR 5176 changed, returns beta's 32,856-byte error page with digest `1829801900@E1021`. Its server logs "do not use legacy react-dom/server APIs" twice.
- Vercel's deploy of `b04e5a1e1f` succeeded. Beta's three HTML Export routes then returned 200 with no E1021, with the same byte counts as the local green build, and the docs page showed the preview with no console error.
- Outside tests, no other shipped code calls a legacy `react-dom/server` renderer. The html-export block page is the loader's only server caller in the docs app.

Limits. The browser pane was hidden and ran at 2 frames a second. Every page had finished loading, so no claim here depends on frames. The run did not click Export HTML to download a file. The declaration-leak fix is that plan's proof, not this one's.

## Open work

- Fix the plitejs lint errors that keep next's main CI red. Tracked as suggested task `t_ed79a18b`. owner: zbeyens. stop: next's CI lint step passes.
