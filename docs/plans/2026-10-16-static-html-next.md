# Pick the browser renderer for static HTML inside Next

Status: building: waits on PR 5176 to merge, then a beta deploy to confirm it
Page: https://claude.ai/artifact/WcKaZQjf9bRyibUEBALaH5
Playbook: bug-fix

## Brief

### What will change?

Plate's HTML export now uses React's browser renderer when it runs inside Next. The HTML Export example works again in a production build of the docs app. Beta gets it once this deploys.

### What could go wrong?

No test catches it if someone removes the new check, only a production build of the docs app. Plain Node code keeps the edge renderer. Beta still runs yesterday's build, so the fix shows there after a deploy works.

## Teach

Plate's HTML export turns a document into an HTML string on the server with React's server renderer. React ships that renderer in several builds, and Plate picks one when it runs.

Until now Plate took the edge build whenever it ran in Node. In a Next production server, Next swaps the edge build for a stand-in that throws when its old render function is called. So the HTML Export page showed a server error instead of its preview, on beta and in a local production build too.

The fix takes the browser build whenever Next runs the code. Next keeps that build's render function working. Plain Node scripts and tests still take the edge build, because the browser build stops a Node process from exiting.

## Demo

1. Build and start the docs app in production with webpack, then open `/docs/examples/html-export`. Before the fix, the preview says "This page couldn't load" with error E1021, the same thing beta shows today. After the fix, the preview shows the exported document. Both clips are production builds of the same commit, one without the fix and one with it.

   ![before](https://github.com/user-attachments/assets/741490c8-de2c-4f6c-8b05-a86ed2385ad2)
   ![after](https://github.com/user-attachments/assets/8ebe389b-10b7-4a67-a47f-6d8604afb0b0)

## Main changes

- `loadStaticRenderer` in `packages/platejs/src/static/internal/renderStaticHtmlWithOverrides.tsx` loads `react-dom/server.browser` when `process.env.NEXT_RUNTIME` is set, and `react-dom/server.edge` only in plain Node. Next's webpack build maps `react-dom/server.edge` to a stand-in whose `renderToStaticMarkup` throws E1021, and maps `react-dom/server.browser` to a build that keeps it.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Regression check | No new test. The before and after production builds are the proof. A test that fakes Next's stand-in may also break the other static tests running in the same process, though nobody has tried it (look) | Add a test that fakes Next's stand-in | add a check | small |
| Browser build inside Next | Keep it. The browser build stops a plain Node process from exiting on its own, but Next shuts down its own server. The fixed server stopped right away when told to (safe) | Close the handle after each render | close the handle | detail |

## Verification

- A production build of the docs app at the base commit shows E1021 on the HTML Export page, the same error beta shows. The same build with the fix renders the preview.
- With `NEXT_RUNTIME=nodejs`, Next's edge stand-in throws E1021 and Next's browser build renders. The 27 platejs static specs pass with the fix.
- Beta still runs yesterday's build, so the fix is not yet seen there.

## Close

The fix landed as one condition in `loadStaticRenderer` and its comment, with no changeset.

Proof, from the decision log's scopes:

- Beta's frame `/view/html-export`, from deployment `b1e70bb257`, returned digest `4065893653@E1021`, and its docs page threw React error 441 twice in Chromium.
- A webpack production build of `apps/www` in a detached worktree at `fa0ac06f55` compiled the ternary with its Node branch on Next's edge stand-in. Its `/view/html-export` returned digest `1793869394@E1021`, and Chromium recorded the same two React 441 errors and "This page couldn't load".
- The same worktree with only the fix applied built again. Its frame and docs page rendered the preview with no error, and its compiled call loads only the browser build.
- After that render, the fixed server stopped within half a second of a SIGTERM, with exit code 143.
- Next's two modules behave as the fix assumes when called directly, and the 27 platejs static specs pass under Bun.

**Limits.** No test fails if the condition goes away, as the first Defaults row says. Beta still serves `b1e70bb257`, because Vercel failed to deploy `fa0ac06f55`, so the fix is proven locally only.

**Reversals.** An earlier local "red" build was not the base. The docs app reads `platejs` from source, and that build ran after the source fix, so it rendered fine and made the error look Vercel-only. A clean worktree at the base replaced it, and the log marks the old rows superseded. The writing passes ran after the panel launched instead of before.

**Deviations.** The fixed build reused the base worktree after the red run had finished and its outputs were saved, instead of a second worktree as the verify recipes say. The first comment pass spawned comment-sicko directly instead of through the no-comments skill, so it did not count, and the pass ran again through the skill. The PR opened before its title and body were shown to the owner. The first push carried a changeset for a fix to `renderStaticHtml`, which no published platejs has, so users upgrading from the published beta never saw the bug. The owner said to drop it, and a second commit removed it.

**Reflect.** One Opus reviewer read this fix's part of the transcript with three lenses. Nothing was applied, and 13 Backlog items wait on the owner.

Backlog, each with owner natamox and stop when the owner takes or drops it:

1. Run a red control in a base worktree before the first source edit, and say so in the bug-fix playbook's reproduce step.
2. Treat a proof as reopened when the owner asks where it came from, and recheck the artifact.
3. Carry a narrowed claim into drafted messages to teammates too.
4. Note in the verify recipes that the docs app compiles `platejs` from source, so a package `dist` rebuild never matters there.
5. Add a production-only error recipe: `next dev` skips webpack's aliases, and an inlined env check is bound by the shape it compiles to.
6. Let `page-health.mjs` follow the example frame and print the server digest.
7. Copy or document the generated docs source folder that a production build in a proof worktree needs.
8. Small recipe notes: exit a Node probe that loads the browser renderer, the platejs spec command, and binding a beta finding to its deploy.
9. Keep control build outputs until the row that cites them closes.
10. Make the decision-log helper check row order by time, not only at append.
11. Add a CI lane that runs the page check on a production build of the docs app.
12. Check whether any route calls Fumadocs' `serializePageTree` on the server, since it loads Next's throwing stand-in too.
13. Make the changeset skill trigger when a package fix writes a changeset.

Rejected as already covered: showing PR text before opening a PR, proof logs in panel briefs, patching the base worktree, a writing row that claims an uninvoked skill, and the unproven test-skip claim, which the Defaults row now marks.

Panel round 1 ran Opus, Sol and Astra and found no critical issue. The fixes applied were the clean red control, a clearer comment and the changeset's `exportDocx` scope, before the changeset was dropped. All three asked for a check that fails without the condition, and the first Defaults row answers that. Astra noted that the browser build stops a process from exiting on its own inside Next too, and the second Defaults row answers that.

## Open work

- Confirm on beta that HTML Export loads once this fix deploys. owner: natamox. stop: the first beta deploy that holds this fix, or 2026-10-23.
- Vercel failed to deploy next at `fa0ac06f55`, so beta still serves `b1e70bb257`. owner: zbeyens. stop: a next deploy succeeds.
