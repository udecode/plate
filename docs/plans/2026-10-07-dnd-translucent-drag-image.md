---
review_scopes:
  - dnd
review_basis: []
work_kind: implementation
---

# Translucent drag image with no background

Status: planning, held by the owner on 2026-10-07; waits on Build now
Playbook: plan

## Brief

### What did you find?

The kit's `startBlockDrag` wraps the dragged block's clones in a `bg-background` div, so the browser's drag image is an opaque white box. The clones from Plite's `drag.start` paint no background of their own.

### What will change?

`startBlockDrag` drops `bg-background` and draws the image at 50% opacity, so a drag shows only the faded block, as in your screenshot. Plite, the drop indicator and the source block's dimming stay as they are.

### What do you need from me?

Build now, Panel first or Hold. The 50% opacity is a default; name another value to change it.

### What happens if I say go?

I capture today's white box with a real macOS mouse drag in Chrome and Safari, change one class, capture the faded image the same way, then update the dnd docs and the registry changelog and rerun the dnd browser spec.

### What could go wrong?

A browser could drop opacity set on the image's root when it snapshots it. The opacity then moves onto each clone. A block with its own background, such as a code block, still shows that background, faded.

## Scope

The owner's words on 2026-10-07: "dnd preview 应该改为类似这样的效果 只有半透明的文本 ： 去掉白色背景 编写一个计划文档", with a screenshot of a held drag that shows only grey, translucent heading text over the page.

In scope are the drag image built by `startBlockDrag` in `apps/www/src/registry/components/editor/dnd.tsx`, the Drag image section of the dnd docs in both languages and a registry changelog entry. Out of scope are Plite's `drag.start` and its clones, the 50% dimming of the source block while it drags, and the drop indicator.

## Decisions

- **Remove the background instead of overriding it.** The wrapper only positions the clones. `previewOf` in `packages/plitejs/src/dom/plugin/dom-drag.ts:867` clones the block host and strips its `data-editor*` attributes, and nothing else paints behind the text. `git log -S"flow-root bg-background"` shows the class arrived in `4e16eada7d` ("dnd") with no stated reason.
- **Fade with opacity, not with a text color.** Opacity fades text, marks, images and block backgrounds alike. It matches the `opacity-50` the kit already gives the source block while it drags (`dnd.tsx:244`). A grey text color would leave images and colored marks at full strength.
- **No Plite change.** `drag.start` returns inert clones and leaves the look to its caller, as the docs' Drag image section says, so the copied UI owns this choice.
- **No new test.** The change is one style token, and the Tests rule forbids asserting a class or constant. Playwright intercepts the drag in every engine, so it never sees the native drag image; the visual claim needs a screenshot of a real OS drag. The existing `dnd:block-preview-origin` case keeps proving the image's content and origin.

## Defaults

| Decision | Pick | Alternative | Word |
| --- | --- | --- | --- |
| Opacity | 50%, the source block's dragging opacity | Another value tuned to the screenshot | "opacity N" |
| Where the opacity lives | On the image wrapper | On each clone, used anyway if a browser drops the wrapper's opacity | "opacity on clones" |
| Dark mode | The same rule: faded light text over the dark page | A separate dark-mode value | "dark opacity N" |

## Steps

The plan runs under `.agents/playbooks/build.md`. `dnd.tsx` already holds other sessions' staged work, so the build copies it to scratch before its first edit and measures this change against that copy.

- [ ] **Step 1. Capture the white box.** Start `pnpm --filter www dev --port 3297` and open `/blocks/playground` in Chrome, then in Safari. Hold a real drag from a heading's handle with `cliclick dd:<handle> dm:<below>`, take `screencapture` while it is held, release with `cliclick du:`, and open each image. Proof: the two screenshots under `docs/plans/artifacts/dnd-translucent-drag-image/` show the white box.
- [ ] **Step 2. Drop the background.** In `startBlockDrag`, change `image.className` from `'flow-root bg-background'` to `'flow-root opacity-50'`. Repeat Step 1's drag five times in each browser, in light and dark mode, and open every capture. Proof: each shows faded text with no box, at the same place relative to the pointer as before. If one browser shows full-strength text, move the opacity onto each clone and repeat the step.
- [ ] **Step 3. Rerun the existing drag proof.** Run `apps/www/tests/browser/dnd.spec.ts` against the step's server in Chromium, Firefox and WebKit without retries. Proof: every case passes, `dnd:block-preview-origin` included.
- [ ] **Step 4. Docs and changelog.** Run `plate-docs` on `content/docs/(plugins)/(functionality)/dnd.mdx` and its `.cn.mdx` twin, so the Drag image section says the kit draws the image at half opacity with no background, and its snippet matches the kit. Add registry changelog entry `2026-10-07-dnd-translucent-drag-image` beside `2026-10-06-dnd-move-beside`, then run `pnpm --filter www build:registry` and `pnpm generate`. Proof: `pnpm check registry-changelog`, `pnpm check www` and the docs preview of both pages.
- [ ] **Step 5. Close.** Run `deslop` and `no-comments` on `dnd.tsx`, `unslop` on the docs and this plan, and `pnpm exec ultracite fix` then `check` on the touched files. Write the Close, fold and republish.

## Proof

Each step names its proof. Native drag images come only from Step 2's real OS drags in Chrome and Safari. Firefox's native drag image stays unverified because no Firefox app is installed on this machine (`ls /Applications`, 2026-10-07); Step 3's Firefox run proves only the image handed to `setDragImage`. The change removes a class and adds opacity to an element the browser snapshots once per drag, so Benchmark's probe does not apply (inferred from the diff).
