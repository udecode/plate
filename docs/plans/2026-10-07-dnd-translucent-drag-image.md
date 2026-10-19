---
review_scopes:
  - dnd
review_basis: []
work_kind: implementation
review_commit: b1a8eba4eb2546eab098a9540c3f10ee91da63ba
review_inputs: [apps/www/tests/browser/dnd.spec.ts]
---

# Translucent drag image with no background

Status: awaiting your answer on how to check the browser's own drag picture; the change, docs and changelog are built and uncommitted
Playbook: plan

## Brief

### What will change?

A dragged block, column or table row shows only its faded content, with no box. Docs and changelog match. Tests pass in a clean copy. The browser's own drag picture is not checked yet.

### What could go wrong?

A browser can drop the fade when it takes its picture of the drag. Then the text shows at full strength, still with no box. Table cells keep a faded fill. Two red checks here come from outside this change.

## Scope

The owner's words on 2026-10-07: "dnd preview 应该改为类似这样的效果 只有半透明的文本 ： 去掉白色背景 编写一个计划文档", with a screenshot of a held drag that shows only grey, translucent heading text over the page. The owner's go on 2026-10-07: "go docs/plans/2026-10-07-dnd-translucent-drag-image.md", after "pull the latest next code before starting".

In scope are the drag image built by `startBlockDrag` in `apps/www/src/registry/components/editor/dnd.tsx`, the Drag image section of the dnd docs in both languages and a registry changelog entry. Out of scope are Plite's `drag.start` and its clones, the 50% dimming of the source block while it drags, and the drop indicator.

`startBlockDrag` also serves the column handle (`column.tsx:119`) and the table row handle (`table.tsx:847`), so their drag images change too and join the proof.

## Decisions

- **Remove the background instead of overriding it.** The wrapper only positions the clones. `previewOf` in `packages/plitejs/src/dom/plugin/dom-drag.ts:760` clones the block host and strips its `data-editor*` attributes, and nothing else paints behind the text. `git log -S"flow-root bg-background"` shows the class arrived in `4e16eada7d` ("dnd") with no stated reason.
- **Fade with opacity, not with a text color.** Opacity fades text, marks, images and block backgrounds alike. It matches the `opacity-50` the kit already gives the source block while it drags (`dnd.tsx:189`). A grey text color would leave images and colored marks at full strength.
- **No Plite change.** `drag.start` returns inert clones and leaves the look to its caller, as the docs' Drag image section says, so the copied UI owns this choice.
- **No new test.** The change is one style token, and the Tests rule forbids asserting a class or constant. Playwright intercepts the drag in every engine, so it never sees the native drag image; the visual claim needs a screenshot of a real OS drag. The existing `dnd:block-preview-origin` case keeps proving the image's content and origin.

## Defaults

| Decision | Pick | Alternative | Word |
| --- | --- | --- | --- |
| Opacity | 50%, the source block's dragging opacity | Another value tuned to the screenshot | "opacity N" |
| Where the opacity lives | On the image wrapper | On each clone, used anyway if a browser drops the wrapper's opacity | "opacity on clones" |
| Dark mode | The same rule: faded light text over the dark page | A separate dark-mode value | "dark opacity N" |
| Column and table row drags | They share the block drag code, so they lose the box too | Keep a box for them with a second drag function | "box on rows" |
| Firefox test proof | Take it from a clean copy of the final code, which passes; this copy fails one case before any drag starts | This copy's own test server only | "firefox here" |
| Site check proof | Every part passes except one that already fails before this change | Wait until that part is fixed elsewhere | "strict site check" |

## Open questions

### Native drag check

How should I check the browser's own drag picture?

Why it needs you: This session cannot see or control your screen.

- Terminal has no screen recording or control rights on this Mac.

- **Grant screen access** (recommended): You give Terminal those rights and relaunch it; I rerun real drags. Cost: Terminal keeps those rights until you remove them.
- **I check it**: You drag a heading in Chrome and Safari and report what you see. Cost: No saved picture of the result.
- **Accept as is**: I close the plan on the in-page picture. Cost: A dropped fade would go unseen.

Why I pick it: Saved pictures prove the result and serve later drag checks too.

Attention: look

## Native behavior and proof

| Delta | Behavior | What changes | Proof surface | Source |
| --- | --- | --- | --- | --- |
| changed | Drag preview | `drag.start` returns inert clones and origin; the handle draws them as the drag image at half opacity with no background, for block, column and table row handles | www `dnd.spec.ts` preview origin, Playwright Chromium, Firefox and WebKit, five runs each, Firefox from a fresh worktree; a capture of the image handed to `setDragImage` in the same three engines; the native Chrome and Safari drag image is unproven | `docs/plans/2026-10-07-dnd-translucent-drag-image.md` Close |

## Steps

The plan runs under `.agents/playbooks/build.md`. `dnd.tsx` already holds other sessions' staged work, so the build copies it to scratch before its first edit and measures this change against that copy.

After the pull to `b1a8eba4eb`, `dnd.tsx` held no uncommitted work, so the build measured against that commit instead of a copy.

- [ ] **Step 1. Capture the white box.** Start `pnpm --filter www dev --port 3297` and open `/blocks/playground` in Chrome, then in Safari. Hold a real drag from a heading's handle with `cliclick dd:<handle> dm:<below>`, take `screencapture` while it is held, release with `cliclick du:`, and open each image. Proof: the two screenshots under `docs/plans/artifacts/dnd-translucent-drag-image/` show the white box.
  - Partial. Terminal has no Screen Recording or Accessibility rights, `screencapture` fails and `cliclick` is not installed. A capture of the element handed to `setDragImage` stands in: `proxy/before/*.png` shows an opaque box hiding the text beneath, in Playwright Chromium, Firefox and WebKit, light and dark (`probe-before.log`). Open until the native check runs.
- [ ] **Step 2. Drop the background.** In `startBlockDrag`, change `image.className` from `'flow-root bg-background'` to `'flow-root opacity-50'`. Repeat Step 1's drag five times in each browser, in light and dark mode, and open every capture. Proof: each shows faded text with no box, at the same place relative to the pointer as before. If one browser shows full-strength text, move the opacity onto each clone and repeat the step.
  - The change landed at `dnd.tsx:61`. Partial. The same stand-in, `proxy/after/*.png`, shows faded text over visible text beneath, with opacity 0.5 and a transparent background in every engine and theme, and in Chromium table row and column drags (`probe-after.log`). The native captures stay open.
- [x] **Step 3. Rerun the existing drag proof.** Run `apps/www/tests/browser/dnd.spec.ts` against the step's server in Chromium, Firefox and WebKit without retries. Proof: every case passes, `dnd:block-preview-origin` included.
  - Five runs each on the final bytes: Chromium 105 passed (`final-dnd-spec-chromium.log`), WebKit 105 passed (`final-dnd-spec-webkit.log`). Against this checkout's server, Firefox failed one case, the bottom-padding landing at `repeat4`, in both full runs (`dnd-spec-firefox.log`, `final-dnd-spec-firefox.log`). A fresh worktree with the complete task diff passed all 105 (`fullpatch-full-firefox.log`), so the Firefox proof comes from there, per the Defaults row "firefox here".
- [x] **Step 4. Docs and changelog.** Run `plate-docs` on `content/docs/(plugins)/(functionality)/dnd.mdx` and its `.cn.mdx` twin, so the Drag image section says the kit draws the image at half opacity with no background, and its snippet matches the kit. Add registry changelog entry `2026-10-07-dnd-translucent-drag-image` beside `2026-10-06-dnd-move-beside`, then run `pnpm --filter www build:registry` and `pnpm generate`. Proof: `pnpm check registry-changelog`, `pnpm check www` and the docs preview of both pages.
  - Both pages render the new section (`page_docs_dnd.html`, `page_cn_docs_dnd.html`). The entry follows `2026-10-02-schema-block-handles`, because `2026-10-06-dnd-move-beside` never existed. `pnpm check registry-changelog` passed (`registry.log`). `pnpm check www` fails at `api-reference:check` on `HistoryApi`, the same way at `b1a8eba4eb` (`head-api-reference-check.log`); its other typecheck links and the production build pass (`www-typecheck-links.log`, `build-www-ci.log`), per the Defaults row "strict site check". `pnpm generate` stopped at the same generator, so `build:registry` ran on its own (`generate.log`, `registry.log`).
- [ ] **Step 5. Close.** Run `deslop` and `no-comments` on `dnd.tsx`, `unslop` on the docs and this plan, and `pnpm exec ultracite fix` then `check` on the touched files. Write the Close, fold and republish.
  - The writing passes and lint ran (`comment-sicko/answer.txt`, `lint-dnd.log`, `lint-final.log`) and the Close is written. The fold waits until Steps 1 and 2 close.

## Completion Gates

| Gate | Result |
| --- | --- |
| Blast radius before code (Build) | skip: no public API changed; `startBlockDrag` is copied registry code, and its three callers are listed in Scope |
| Hard cut sweep (Build) | skip: nothing removed |
| `best-api repair` (Build) | skip: no reusable public API changed |
| Benchmark rerun (Build) | skip: the plan's Proof rules out a scale effect |
| `plate-docs` on the dnd pages (Build) | `content/docs/(plugins)/(functionality)/dnd.mdx` and `dnd.cn.mdx`, Drag image section |
| Thermo-nuclear review of the shared diff (Build) | `docs/plans/artifacts/dnd-translucent-drag-image/thermo/summary.md`, no finding |
| Changeset (Build) | skip: no published package changed; the registry entry covers the copied kit |
| `check-plate-feature` (Build) | skip: not a feature-delivery plan |
| Panel (AGENTS.md reviews list) | skip: no reviews-list row names this plan |
| Decision-trail review (AGENTS.md) | skip: no panel ran, no shared script changed, and the owner is present |

## Proof

Each step names its proof. Native drag images come only from Step 2's real OS drags in Chrome and Safari. Firefox's native drag image stays unverified because no Firefox app is installed on this machine (`ls /Applications`, 2026-10-07); Step 3's Firefox run proves only the image handed to `setDragImage`. The change removes a class and adds opacity to an element the browser snapshots once per drag, so Benchmark's probe does not apply (inferred from the diff).

## Close

Reversals and deviations come first.

- **Steps 1 and 2 ran without native captures.** Terminal has no Screen Recording or Accessibility rights, `screencapture` fails and `cliclick` is not installed (decision log, `verify` rows). A Playwright capture of the element handed to `setDragImage` stood in, before the edit, after it and on the final bytes (`proxy/before`, `proxy/after`, `proxy/final`). It shows the box gone and the fade applied in the page, but not the picture the browser takes, which is the plan's named risk. Both steps stay open on the Native drag check question.
- **Step 3's Firefox proof moved to a fresh worktree.** This checkout's server failed the bottom-padding landing case at `repeat4` in both full Firefox runs, with the same `y` of 3187.449951171875, at `dnd.spec.ts:592`, before `page.mouse.down`. The same full run passed 105 times out of 105 at `b1a8eba4eb`, with only the class change, and with the complete task diff, each in a detached worktree. The failure belongs to this checkout's environment. Defaults row "firefox here".
- **Step 4's site check is red before this change.** `api-reference:check` fails on `platejs` `HistoryApi` at `b1a8eba4eb` too. Every later typecheck link and the production build pass on the final bytes. Defaults row "strict site check".
- **The scope grew to column and table row drags,** because `startBlockDrag` serves their handles. Defaults row "box on rows".
- **The changelog sibling the plan named does not exist.** The entry follows `2026-10-02-schema-block-handles`.
- **A `git stash` ran before the pull.** Upstream had deleted three files that held uncommitted suggestions research edits, so the pull refused. The stash ran before the updated `AGENTS.md` was reread. All six files went to `docs/plans/artifacts/dnd-translucent-drag-image/pre-pull-local-research/`, matched by `git hash-object`, and only this run's stash entry was dropped. They are not back in the working tree.
- **pstack loaded from the plugin cache.** The plugin is installed only for `../ellie`, so its skills and `comment-sicko` ran from `~/.claude/plugins/cache/pstack-claude/pstack/0.9.67`.

What landed, uncommitted:

- `apps/www/src/registry/components/editor/dnd.tsx:61` sets the drag image wrapper to `flow-root opacity-50`.
- In `content/docs/(plugins)/(functionality)/dnd.mdx` and `dnd.cn.mdx`, the Drag image section names the fade and the missing background, its snippet gains the class line it never had, and one sentence says blocks with their own fill keep it.
- `apps/www/src/registry/changelog/entries/2026-10-07-dnd-translucent-drag-image.mdx` and its generated JSON.
- `build:registry` wrote `public/r/dnd.json` and `dnd-docs.json` with the change. Ten other generated registry files carry drift from `b1a8eba4eb` source (`base-registry-drift.patch`).

Proof and its limits:

- `dnd.spec.ts` passed five runs without retries: 105 in Chromium and 105 in WebKit on the final bytes, and 105 in Firefox in a fresh worktree of the final bytes. Playwright intercepts drags, so this proves the image's content and origin, not its paint.
- The setDragImage capture shows faded text, a transparent background and opacity 0.5 in Chromium, Firefox and WebKit, light and dark, and for table row and column drags in Chromium. The light Chromium column case never started a drag in three runs, a probe defect.
- Both docs routes render the new text, and `build:source`, docs parity and the registry source check pass.
- `ultracite` and type-aware `oxlint` pass on `dnd.tsx` and the changelog entry. Lint ignores the docs pages.
- The native drag image in Chrome and Safari is not proven, and neither is Firefox's, since no Firefox app is installed.

Counts across the 5 steps and 10 gates: 4 done, 2 partial, 8 skipped, 0 blocked, 1 open.

The panel and the decision-trail review did not run, because no reviews-list row names this plan and the owner is present. The next ledger item is `plite-view` accessibility (`node tooling/scripts/review-ledger.mjs next`), a Pursue verdict not yet adopted.

## Open work

- **Native drag check.** Capture real drags in Chrome and Safari, light and dark, five times each, and move the opacity onto each clone if one browser drops it. owner: Felix grants Terminal its rights or checks by hand, then the next build session. stop: the captures show faded text with no box, or the owner answers Accept as is. Tracked here and in the dnd subject's Open work at the fold.
- **This checkout fails one Firefox landing case.** The bottom-padding case fails at `repeat4` here and passes in fresh worktrees; `final-test-results-firefox/` holds the screenshot. owner: Felix, for this machine's checkout (`pnpm run reinstall` is the recipe's next step). stop: a full Firefox five-run passes in this checkout, or 2026-10-21.
- **The site check is red at `b1a8eba4eb`.** `api-reference:check` fails on `platejs` `HistoryApi`. owner: whoever owns `apps/www/scripts/build-api-reference.mts` and the `platejs` exports. stop: `pnpm check www` passes at `HEAD`.
- **`pnpm install` fails its prepare hook here.** `node_modules/bun` never ran its postinstall, so Skiller and the mirror sync did not run. owner: Felix, local install. stop: `pnpm install` exits 0 in this checkout.
- **Saved research edits.** Six suggestions research files wait in `pre-pull-local-research/`. owner: Felix. stop: Felix reapplies or discards them.
- **pstack is not installed for this project.** owner: Felix runs `claude plugin install pstack@pstack-claude --scope project`. stop: `pstack:` skills load in a session here.
