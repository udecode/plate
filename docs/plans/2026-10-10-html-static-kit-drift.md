---
review_scopes: [html]
review_basis: []
work_kind: implementation
review_commit: e087f26713
review_inputs: [apps/www/src/registry/components/editor/indent-static.tsx, apps/www/src/registry/components/editor/list-static.tsx, apps/www/src/registry/components/editor/plugins-static.spec.ts]
---

# Static kit loads indented images

Status: done: committed on branch `export-static-presentation`, not pushed
Playbook: bug-fix

The owner asked to build item B, phase 2 of `docs/plans/2026-10-09-html-static-repair-redo.md`: renders without a live editor should follow the live editor's settings. Those renders are the server HTML block, the AI preview, the AI command route and any app that renders stored documents on the server. They build an editor from `BaseEditorKit`, whose options were copied from `EditorKit` by hand and have drifted. A census of every plugin both kits install found two drifted options that change a static render. The live indent and list plugins target images, and the static ones do not. Because the static editor's schema is closed, it does not just draw such an image plainly. It refuses to load any document that holds an indented image.

## Brief

### What will change?

The server HTML page and the AI features failed on any document with an indented image or an image in a list. Now they load it and show the image as a list item, the same as the editor.

### What could go wrong?

Both plugin lists still keep their own copy of these settings, so they can fall out of step again. The new test only catches that for images. I skipped the bigger rework that would share one copy.

## Teach

Plate apps install two plugin lists. The live list runs the editor, with toolbars and editing behavior. The static list runs everywhere there is no live editor, such as a server page that turns a saved document into HTML. Both lists set options by hand, such as which blocks can be indented.

The live list lets you indent an image or put it in a bulleted list. The static list left images out. The static editor checks every document against what its plugins allow, so a saved document with an indented image did not load at all, and the server page failed.

Now both lists name images. The static editor loads the document and draws the image as a bullet item, indented like the text around it.

## Demo

1. The server render path, the one `/blocks/html-export` uses, renders a bulleted list whose second item is an image, with a nested item under it. The image draws as a bullet item at 24 px and the nested item at 48 px. ![server render](artifacts/html-static-kit-drift/browser/server-render.png)

## Main changes

- `BaseIndentKit` and `BaseListKit` add `PLUGINS.image` to `targetPlugins`, matching `IndentKit` and `ListKit`. The list's `targetPlugins` also set the indent plugin's targets through its `override`, so both need it.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| How far B goes | Fix the two options that change what a static render draws, and add a test (look) | Move every option both kits share into shared policy kits, as phase 2 of the earlier plan said | policy kits | small |
| Table default width | Leave the static table without the live 600 px default, because only inserting and resizing a table read it | Copy it to the static kit too | copy table width | detail |
| Order of the static list targets | Keep the static order and add the image at the end | Reorder to match the live kit | match target order | detail |
| Generated registry files | Rebuilt in this change, like earlier work on this branch | Let CI rebuild them | leave registry to CI | detail |

## Steps

- [x] Reproduce through the server block's path (`HtmlExportKit`, `createStaticEditor`, `renderStaticHtml`) and census every option the two kits set differently. Proof: `docs/plans/artifacts/html-static-kit-drift/probe/drift-a4.log`
- [x] Test first, red at `HEAD` for the named defect. Proof: `docs/plans/artifacts/html-static-kit-drift/red/static-image-red-a2.log`
- [x] Add the image to the static indent and list targets, then rerun the spec and the census. Proof: `docs/plans/artifacts/html-static-kit-drift/build/static-spec-a1.log`, `docs/plans/artifacts/html-static-kit-drift/probe/drift-a6.log`
- [x] Open the server render in Chromium and read each block's computed indent and list display. Proof: `docs/plans/artifacts/html-static-kit-drift/browser/look-a2.log`, `docs/plans/artifacts/html-static-kit-drift/browser/server-render.png`
- [x] Registry changelog entries and regenerated registry output. Proof: `docs/plans/artifacts/html-static-kit-drift/build/registry-changelog-check-a1.log`, `docs/plans/artifacts/html-static-kit-drift/build/build-registry-a1.log`, `docs/plans/artifacts/html-static-kit-drift/build/build-registry-check-a1.log`
- [x] Writing passes on the code, the lint fix and the narrow checks on the final bytes. Proof: `docs/plans/artifacts/html-static-kit-drift/comment-sicko/reply.md`, `docs/plans/artifacts/html-static-kit-drift/build/lint-a1.log`, `docs/plans/artifacts/html-static-kit-drift/build/www-tsc-a1.log`, `docs/plans/artifacts/html-static-kit-drift/build/final-tests-a2.log`
- [x] Writing pass on this plan and the changelog entries. Proof: the writing rows of `docs/plans/2026-10-10-html-static-kit-drift.decisions.tsv`

## Open work

- The two kits still set shared options by hand, and the new test catches drift only for images. Another block added to the live indent or list targets alone would break static loads the same way. It moves to the subject's Open work when this plan folds. owner: natamox. stop: the owner says "policy kits", or a new block joins the live indent or list targets, or 2026-11-30.
- The indent docs page says `IndentKit` targets paragraphs, headings, blockquotes, code blocks and toggles, and leaves out images, which the kit has targeted before this change. It moves to the subject's Open work when this plan folds. owner: natamox. stop: the next docs pass on the indent page, or 2026-11-30.

## Close

**Reversal.** Phase 2 of the earlier plan said to move the options both kits share into shared policy kits, after a spike. This iteration fixes only the two options the census found changing a static render, the image targets of indent and list, and adds a test. The Defaults row "How far B goes" reverses it with "policy kits".

**What landed.** `BaseIndentKit` and `BaseListKit` target images, like `IndentKit` and `ListKit`. A static editor now loads a document with an indented image or an image in a list, and draws the image as a list item at its indent. Before the change, the server HTML block, the AI command route and the AI preview threw a schema error on such a document. The registry changelog has an entry for each kit.

**Proof and limits.** The new test fails at `e087f26713` with the schema error and passes on the change. The probe loaded and rendered such a document through the server block's kit, and Chromium shows the image as a bullet item at 24 px with a nested item at 48 px. The www typecheck passes, the static kit, HTML export block, Word export and list tests pass (12 fast, 22 slow), and the registry output is fresh. No route renders a chosen document on the server, so the browser check opened HTML that a script rendered through the server block's path. The AI command route was not run; it builds its editor from `BaseEditorKit` and the live document the same way (`apps/www/src/registry/app/api/ai/command/route.ts:50-54`). The census still shows drift that only editing reads: the table's 600 px default width, editing state of images, links and uploads, the React table plugin's selection ref, and column and toggle corrections that differ only by component.

**Open work.** Two items, listed under Open work.
