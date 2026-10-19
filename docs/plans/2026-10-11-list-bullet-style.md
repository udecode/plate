# Circle and square bullets draw their chosen marker

Status: executed, changes left in the working tree for your commit
Playbook: bug-fix

## Brief

### What will change?

Circle and square bullets now draw as circles and squares, in the editor and in static HTML. Before, every bullet drew a plain disc, even though the choice was saved.

### What could go wrong?

Static HTML for a styled bullet now carries one more inline style, so saved HTML snapshots of styled bullets would change. WWW_TESTS_RISK

## Teach

A bulleted list item is a normal block, such as a paragraph, that carries a list type and an optional style. The style is what the bullet menu in the toolbar picks, circle or square. A plain disc is the default and stores nothing.

Numbered and task items get wrapped in a real list element that sets their marker. Bulleted items skip that wrapper to stay light. The block itself is told to draw as a list item, so the browser draws its default marker, a disc. Nothing handed the saved style to the browser, in the editor or in static HTML.

Now the bulleted block also gets its saved style as its marker style. A circle item draws a circle and a square item draws a square. Items with no style still draw a disc.

## Demo

1. Start the docs app and open `http://localhost:3297/blocks/list-demo`. Put the caret in a bulleted item, open the small arrow next to the bullet button in the toolbar and pick Circle. The marker turns into a hollow circle.
   ![before](artifacts/list-bullet-style/before-editor-circle-zoom-2.png) ![after](artifacts/list-bullet-style/after-editor-circle-zoom.png)
2. Open the same menu and pick Square. The marker turns into a filled square.
   ![before](artifacts/list-bullet-style/before-editor-square-zoom.png) ![after](artifacts/list-bullet-style/after-editor-square-zoom.png)
3. Render static HTML for a default, a circle and a square bullet with the static editor kit. The three markers read disc, circle and square.
   ![before](artifacts/list-bullet-style/before-static.jpg) ![after](artifacts/list-bullet-style/after-static.jpg)

## Main changes

The bulleted fast path in the copied `ListKit` (`apps/www/src/registry/components/editor/list.tsx`) and `BaseListKit` (`list-static.tsx`) now sets `listStyleType: element?.listStyle` in its injected style, next to `display: 'list-item'`. `BlockList` and `BlockListStatic` still return early for bulleted items, so bullets keep skipping the wrapper. The package's HTML encoder already wrote `list-style-type` for these items, so the copied renderers were the only ones dropping it.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Where the bullet style gets drawn | On the bullet itself, with no extra wrapper | Wrap bullets in a real list, like numbered items | wrap bullets | small |
| A junk style on bullets in static HTML | Leave it, since browsers ignore it and it was already there | Remove it in this fix too | drop list type style | detail |

## Close

Landed in the working tree, uncommitted. Both copied list kits draw the saved bullet style. Two new tests in `apps/www/src/registry/components/editor/list.spec.tsx` cover the editor kit and the static kit. The generated registry output carries the change (`pnpm --filter www build:registry`). A registry changelog entry, `2026-10-11-fix-bullet-list-style`, describes it for people who copied the kits.

Proof. Before the fix, Chromium on the dev server drew a disc after Circle and after Square, while the saved item held `listStyle: "circle"`, then `"square"`, and its computed `list-style-type` stayed `disc`. After the fix, the same steps draw a hollow circle, then a filled square, with computed `circle` and `square`. Static HTML rendered at `HEAD` reads disc, disc, disc for the default, circle and square bullets; on the fix it reads disc, circle, square. Both new tests failed first with `Received: ""` and pass now, 13 of 13 in the file. WWW_TESTS_CLOSE

Limits. The editor proof ran in the in-app Chromium only, not Firefox or WebKit. The static proof rendered through a throwaway probe with the full static editor kit and opened the file in Chromium. It did not go through the HTML export button's download. `pnpm check` did not run. The www type check reports 9 errors, all in `import-toolbar-button.spec.tsx`, a file another session has modified and this run did not touch. None are in the touched files.

Side finding. Static HTML for every bullet also carries `list-type:bulleted` in its style attribute, because the inject's style key defaults to its node key. It predates this fix and browsers ignore it, so it stays, as the Defaults row says.

Counts. 9 items: 8 done, 1 skipped. The skipped item is a panel review, because no reviews-list row covers a copied-kit bug fix.

Reversals: none. Open work: none.
