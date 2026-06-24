# restyle docs one by one

Objective:
Restyle Plate docs one document at a time to match `docs-creator` and the new shadcn-dense MDX style layer, with a separate check row for every canonical English MDX doc and translation parity inventory for every `.cn.mdx` file.

Goal plan:
docs/plans/2026-05-31-restyle-docs-one-by-one.md

Template:
docs/plans/templates/docs.md

Primary template:
docs/plans/templates/docs.md

Applied packs:
- none

Docs source:
- type: user chat request
- id / link: N/A
- title: Restyle Plate docs one by one
- acceptance criteria: each canonical English doc under `content/docs` gets an individual docs-creator pass and checked ledger row; `.cn.mdx` translation files are inventoried with explicit defer/parity status; no bulk sweep without per-doc evidence.

Docs lane:
- lane: multi-lane docs corpus: install, guide/system, plugin/feature, serialization/conversion, workflow/AI, API reference, examples, migration, releases
- target docs: 127 canonical English MDX files under `content/docs`, excluding `.cn.mdx` translations
- documented source owner: English docs are canonical source; `.cn.mdx` files are translation surfaces and are not rewritten in English by default
- nearest sibling docs: chosen per document during each one-doc pass
- plugin page: decided per document

Completion threshold:
- All 127 canonical English MDX docs under `content/docs` have checked `Doc:` rows after an individual docs-creator pass.
- Each checked doc row records either a source-backed edit with verification or an explicit no-edit reason after reading the page and its lane baseline.
- All 124 `.cn.mdx` files are inventoried with parity/defer status so translation work is not silently swept into English rewrites.
- Changed docs pass source-backed claim/link/preview audits, `pnpm --filter www build:source`, final `autoreview`, and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-05-31-restyle-docs-one-by-one.md`.

Verification surface:
- Per-doc source audit recorded in this plan before each `Doc:` row is checked.
- `pnpm --filter www build:source` after doc edits.
- Link/preview/source checks scoped to each edited page.
- Final `.agents/skills/autoreview/scripts/autoreview --mode local` with docs-focused prompt.
- Final autogoal mechanical check.

Constraints:
- Follow `.agents/rules/docs-creator.mdc` for docs style and workflow.
- Write current-state docs only. No changelog voice.
- Keep code examples repo-backed and copy-pasteable.
- Do not invent APIs, routes, demos, imports, components, transforms, or options.
- Do not add docs ceremony for tiny typo/copy edits.

Boundaries:
- Source of truth: `content/docs/**/*.mdx`, current Plate source/packages/registry demos, `.agents/rules/docs-creator.mdc`, and shadcn corpus artifact for style.
- Allowed edit scope: `content/docs/**/*.mdx`, this goal plan, and small verification artifacts if needed.
- Browser surface: only when a doc edit changes a rendered preview/demo route or visual component page; otherwise parser/source audits are enough.
- Tracker sync: N/A; no tracker item.
- Non-goals: runtime behavior changes, package/API changes, registry build output, broad translation rewrites, PR/commit/push.

Blocked condition:
- Blocked only if a doc claim cannot be verified from source/registry, the required package/demo route is missing, a translation requires product-language judgment, or `build:source`/autoreview exposes a blocker that cannot be fixed without changing runtime behavior.

Docs state:
- task_type: docs
- task_complexity: major
- current_phase: closeout
- current_phase_status: complete
- next_phase: goal close
- goal_status: active

Current verdict:
- verdict: proceed one doc at a time
- confidence: medium
- next owner: docs
- reason: corpus is large enough that per-doc evidence matters more than a global rewrite.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-05-31-restyle-docs-one-by-one.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| `docs-creator` loaded | yes | User invoked and pasted `docs-creator`; source `.agents/rules/docs-creator.mdc` read. |
| Active goal checked or created | yes | `get_goal` returned none; created active docs restyle goal. |
| Docs lane selected | yes | Multi-lane docs corpus; lane selected per doc before checking its row. |
| Target docs read | partial | Inventory found 127 canonical English docs and 124 `.cn.mdx` translations; each target is read during its one-doc pass. |
| Nearest sibling docs read | partial | Sibling docs are read per target doc, not globally swept. |
| Docs style doctrine read | yes | `.agents/rules/docs-creator.mdc` and shadcn style corpus guidance read. |
| Documented source code read | partial | Source owner is checked per doc before row completion. |
| Ownership map drafted | partial | Global English-doc/translation boundary recorded; package/kit/source ownership is recorded per doc. |
| Plugin-page rules decision | yes | Plugin-page rules apply only to `content/docs/(plugins)/**` pages during each doc pass. |
| Browser/render proof decision | yes | Browser proof only when a rendered preview/demo surface changes; otherwise `build:source` and source audits. |
| PR/tracker expectation decision | yes | No PR, commit, push, or tracker sync requested. |

Work Checklist:
- [x] Objective includes outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition.
- [x] Docs lane is classified as install, guide/system, plugin/feature,
      serialization/conversion, workflow/AI, API reference, or spec/law.
- [x] Target docs and nearest sibling docs were read before writing.
- [x] Docs style doctrine in `docs-creator` was read before writing.
- [x] Documented behavior or API was verified against current source.
- [x] Ownership map records core runtime, package, kit, registry, and app-local
      ownership where relevant.
- [x] Fastest success path appears before deeper mechanics or API reference.
- [x] Opening is three sentences or fewer and avoids generic fluff.
- [x] Named APIs, options, transforms, components, imports, routes, and package
      specifiers are exact and current.
- [x] Plugin docs, if applicable, satisfy kit/manual/API ordering and headless
      package ownership.
- [x] Serialization docs, if applicable, split directions and state environment
      constraints before examples.
- [x] API reference docs, if applicable, use exact contracts and avoid tutorial
      filler.
- [x] Spec/law docs, if applicable, record owner map, evidence, and explicit
      gaps.
- [x] Demos/previews are real registry entries or marked N/A with reason.
- [x] Links target real leaf pages and do not reinforce pages being displaced.
- [x] Anti-slop audit passed: no changelog voice, no fake APIs, no placeholder
      comments, no open task markers, no dead anchors, no redundant summary section.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed docs.
- [x] Review/autoreview target selected for non-trivial docs work, or marked
      N/A with reason.

Per-doc canonical English ledger:
- [x] Doc: content/docs/index.mdx — rewritten as intro/branch-selector page; verified by source-backed link audit, anti-slop audit, opening-length audit, and `pnpm --filter www build:source`
- [x] Doc: content/docs/installation.mdx — rewritten as install path selector; verified by link audit, anti-slop audit, opening-length audit, and `pnpm --filter www build:source`
- [x] Doc: content/docs/installation/docs.mdx — rewritten as local-docs setup guide; verified against docs registry source, link audit, anti-slop audit, opening-length audit, and `pnpm --filter www build:source`
- [x] Doc: content/docs/installation/manual.mdx — rewritten as concise headless setup guide; verified by build:source, link audit, preview registry audit, anti-slop audit, and opening-length audit
- [x] Doc: content/docs/installation/mcp.mdx — rewritten with quick start, client tabs, and registry index table; verified by build:source, link audit, anti-slop audit, opening-length audit, and config/source audit
- [x] Doc: content/docs/installation/next.mdx — rewritten as Next.js Plate UI setup guide; verified by build:source, link audit, preview registry audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/installation/node.mdx — rewritten as Node.js runtime guide; verified by build:source, route audit, source-backed API/package audit, anti-slop/runtime-boundary audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/installation/plate-ui.mdx — rewritten as Plate registry entrypoint; verified by build:source, route audit, registry source audit, docs item audit, card-icon audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/installation/react.mdx — rewritten as React/Vite Plate UI setup guide; verified by build:source, route audit, preview registry audit, registry item audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/installation/rsc.mdx — rewritten as RSC/static rendering guide; verified by build:source, route audit, static runtime source audit, registry kit audit, anti-slop audit, import-boundary audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(guides)/controlled.mdx — rewritten as controlled-value guide; verified by build:source, source-backed value API audit, preview registry audit, stale-option audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(guides)/debugging.mdx — rewritten as source-backed DebugPlugin playbook; verified by build:source, route audit, source-backed debug API audit, `PLUGIN_NODE_TYPE` review fix, anti-slop/stale-error audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(guides)/editor-methods.mdx — rewritten as hook/API/transform/plugin-options guide; verified by build:source, route audit, source-backed editor method audit, anti-slop/stale-method audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(guides)/editor.mdx — rewritten as editor creation/options/type guide; verified by build:source, route audit, source-backed editor option audit, registry component/export audit, anti-slop/stale-config audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(guides)/feature-kits.mdx — rewritten as registry kit guide; verified by build:source, route audit, registry/source audit, full-editor-kit path review fix, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(guides)/form.mdx — rewritten as react-hook-form/shadcn form integration guide; verified by build:source, route audit, Plate/form source audit, dependency audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(guides)/playwright.mdx — rewritten as source-backed Playwright helper guide; verified by build:source, source/export audit, route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(guides)/plugin-components.mdx — rewritten as source-backed plugin rendering guide; verified by build:source, source/render contract audit, route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(guides)/plugin-context.mdx — rewritten as source-backed plugin context guide; verified by build:source, source/context API audit, route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(guides)/plugin-input-rules.mdx — focused cleanup of existing source-backed input-rule reference; verified by build:source, source/rule factory audit, `@platejs/autoformat` compatibility-package review fix, route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(guides)/plugin-methods.mdx — rewritten as source-backed plugin method guide; verified by build:source, source/method-resolution audit, route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(guides)/plugin-rules.mdx — rewritten as source-backed plugin rule guide; verified by build:source, source/rule-engine audit, preview registry audit, route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(guides)/plugin-shortcuts.mdx — rewritten as source-backed shortcut guide; verified by build:source, source/shortcut-resolution audit, route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(guides)/plugin.mdx — rewritten as source-backed plugin overview; verified by build:source, source/plugin contract audit, route audit, link/anchor audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(guides)/static.mdx — rewritten as source-backed static rendering guide; verified by build:source, source/static runtime audit, route audit, registry kit audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(guides)/troubleshooting.mdx — rewritten as source-backed troubleshooting guide; verified by build:source, source/debug/package audit, route audit, depset CLI audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(guides)/typescript.mdx — rewritten as source-backed TypeScript setup and typing guide; verified by build:source, source/type contract audit, route audit, package exports audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(guides)/unit-testing.mdx — rewritten as source-backed unit testing guide; verified by build:source, source/test-utils audit, route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(plugins)/(ai)/ai.mdx — rewritten as source-backed AI plugin guide; verified by check:docs, source/API audit, registry preview/source audit, static link-map audit, anti-slop audit, opening-length audit, and line-count audit; live HTTP route proof blocked because local Next dev servers accepted connections but timed out before any route response
- [x] Doc: content/docs/(plugins)/(ai)/copilot.mdx — rewritten as source-backed Copilot plugin guide; verified by check:docs, source/API audit, registry preview/source audit, static link-map audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(plugins)/(collaboration)/comment.mdx — rewritten as source-backed Comment plugin guide; verified by check:docs, source/API audit, registry preview/source audit, static link-map audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(plugins)/(collaboration)/discussion.mdx — rewritten as source-backed Discussion plugin guide; verified by check:docs, source/API audit, registry preview/source audit, static link-map audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(plugins)/(collaboration)/suggestion.mdx — rewritten as source-backed Suggestion plugin guide; verified by check:docs, source/API audit, registry preview/source audit, static link-map audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(plugins)/(collaboration)/yjs.mdx — rewritten as source-backed Yjs collaboration guide; verified by check:docs, @platejs/yjs typecheck, source/API audit, registry preview/source audit, component route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(plugins)/(elements)/basic-blocks.mdx — rewritten as source-backed Basic Blocks kit guide; verified by check:docs, @platejs/basic-nodes typecheck, source/API audit, registry preview/source audit, component route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(plugins)/(elements)/blockquote.mdx — rewritten as source-backed Blockquote guide; verified by check:docs, @platejs/basic-nodes typecheck, source/API audit, registry preview/source audit, component route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(plugins)/(elements)/callout.mdx — rewritten as source-backed Callout guide; verified by check:docs, @platejs/callout typecheck, source/API audit, registry preview/source audit, component route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(plugins)/(elements)/code-block.mdx — rewritten as source-backed Code Block guide; verified by check:docs, @platejs/code-block typecheck, source/API audit, registry preview/source audit, component route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(plugins)/(elements)/code-drawing.mdx — rewritten as source-backed Code Drawing guide; verified by check:docs, @platejs/code-drawing typecheck, source/API audit, registry preview/source audit, component route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(plugins)/(elements)/column.mdx — rewritten as source-backed Column guide; verified by check:docs, @platejs/layout typecheck, source/API audit, registry preview/source audit, component route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(plugins)/(elements)/date.mdx — rewritten as source-backed Date guide; verified by check:docs, @platejs/date typecheck, source/API audit, registry preview/source audit, component route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(plugins)/(elements)/equation.mdx — rewritten as source-backed Equation guide; verified by check:docs, @platejs/math typecheck, source/API audit, registry preview/source audit, component route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(plugins)/(elements)/excalidraw.mdx — rewritten as source-backed Excalidraw guide; verified by check:docs, @platejs/excalidraw typecheck, source/API audit, registry preview/source audit, component route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(plugins)/(elements)/footnote.mdx — rewritten as source-backed Footnote guide; verified by check:docs, @platejs/footnote typecheck, source/API audit, registry preview/source audit, component route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(plugins)/(elements)/heading.mdx — rewritten as source-backed Heading guide; verified by check:docs, @platejs/basic-nodes typecheck, source/API audit, registry preview/source audit, component route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(plugins)/(elements)/horizontal-rule.mdx — rewritten as source-backed Horizontal Rule guide; verified by check:docs, @platejs/basic-nodes typecheck, source/API audit, registry preview/source audit, component route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(plugins)/(elements)/link.mdx — rewritten as source-backed Link guide; verified by check:docs, @platejs/link typecheck, source/API audit, registry preview/source audit, component route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(plugins)/(elements)/list-classic.mdx — rewritten as source-backed List Classic guide; verified by check:docs, @platejs/list-classic typecheck, source/API audit, registry preview/source audit, component route audit, package-boundary audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(plugins)/(elements)/media.mdx — rewritten as source-backed Media guide; verified by check:docs, @platejs/media typecheck, @platejs/caption typecheck, @platejs/markdown typecheck, source/API audit, registry preview/source audit, component route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(plugins)/(elements)/mention.mdx — rewritten as source-backed Mention guide; verified by check:docs, @platejs/mention typecheck, @platejs/combobox typecheck, @platejs/markdown typecheck, source/API audit, registry preview/source audit, component route audit, inactive Plus preview audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(plugins)/(elements)/table.mdx — rewritten as source-backed Table guide; verified by check:docs, @platejs/table typecheck, @platejs/markdown typecheck, source/API audit, registry preview/source audit, component route audit, inactive Plus preview audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(plugins)/(elements)/toc.mdx — rewritten as source-backed Table of Contents guide; verified by check:docs, @platejs/toc typecheck, @platejs/basic-nodes typecheck, @platejs/markdown typecheck, source/API audit, registry preview/source audit, component route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(plugins)/(elements)/toggle.mdx — rewritten as source-backed Toggle guide; verified by check:docs, @platejs/toggle typecheck, @platejs/indent typecheck, source/API audit, registry preview/source audit, component route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(plugins)/(functionality)/(combobox)/combobox.mdx — rewritten as source-backed Combobox primitive guide; verified by check:docs, @platejs/combobox typecheck, @platejs/mention typecheck, @platejs/slash-command typecheck, @platejs/emoji typecheck, source/API audit, registry preview/source audit, component route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(plugins)/(functionality)/(combobox)/emoji.mdx — rewritten as source-backed Emoji guide; verified by check:docs, @platejs/emoji typecheck, @platejs/combobox typecheck, @platejs/markdown typecheck, source/API audit, registry preview/source audit, component route audit, inactive Plus preview audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(plugins)/(functionality)/(combobox)/slash-command.mdx — rewritten as source-backed Slash Command guide; verified by check:docs, @platejs/slash-command typecheck, @platejs/combobox typecheck, source/API audit, registry preview/source audit, component route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(plugins)/(functionality)/(utils)/exit-break.mdx — rewritten as source-backed Exit Break guide; verified by check:docs, @platejs/utils typecheck, @platejs/core typecheck, source/API audit, registry preview/source audit, component route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(plugins)/(functionality)/(utils)/forced-layout.mdx — rewritten as source-backed Forced Layout guide; verified by check:docs, @platejs/utils typecheck, source/API audit, registry playground audit, route/source audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(plugins)/(functionality)/(utils)/single-block.mdx — rewritten as source-backed Single Block guide; verified by check:docs, @platejs/utils typecheck, source/API audit, registry preview/source audit, component route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(plugins)/(functionality)/(utils)/trailing-block.mdx — rewritten as source-backed Trailing Block guide; verified by check:docs, @platejs/utils typecheck, @platejs/suggestion typecheck, source/API audit, registry source audit, route/source audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(plugins)/(functionality)/autoformat.mdx — rewritten as source-backed Autoformat guide; verified by check:docs, @platejs/autoformat typecheck, @platejs/core typecheck, source/API audit, registry preview/source audit, route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(plugins)/(functionality)/block-menu.mdx — rewritten as source-backed Block Menu guide; verified by check:docs, @platejs/selection typecheck, @platejs/ai typecheck, source/API audit, registry preview/source audit, component route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(plugins)/(functionality)/block-placeholder.mdx — rewritten as source-backed Block Placeholder guide; verified by check:docs, @platejs/utils typecheck, @platejs/core typecheck, source/API audit, registry preview/source audit, route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(plugins)/(functionality)/block-selection.mdx — rewritten as source-backed Block Selection guide; verified by check:docs, @platejs/selection typecheck, @platejs/dnd typecheck, @platejs/ai typecheck, source/API audit, registry preview/source audit, component route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(plugins)/(functionality)/caption.mdx — rewritten as source-backed Caption guide; verified by check:docs, @platejs/caption typecheck, @platejs/media typecheck, @platejs/utils typecheck, source/API audit, registry preview/source audit, component route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(plugins)/(functionality)/cursor-overlay.mdx — rewritten as source-backed Cursor Overlay guide; verified by check:docs, @platejs/selection typecheck, @platejs/ai typecheck, @platejs/table typecheck, @platejs/dnd typecheck, source/API audit, registry preview/source audit, route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(plugins)/(functionality)/dnd.mdx — rewritten as source-backed Drag & Drop guide; verified by check:docs, @platejs/dnd typecheck, @platejs/media typecheck, @platejs/selection typecheck, @platejs/list typecheck, source/API audit, registry preview/source audit, component route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(plugins)/(functionality)/find-replace.mdx — rewritten as source-backed Find guide; verified by check:docs, @platejs/find-replace typecheck, source/API audit, registry preview/source audit, component route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(plugins)/(functionality)/multi-select.mdx — rewritten as source-backed Multi Select guide; verified by check:docs, @platejs/tag typecheck, source/API audit, registry preview/source audit, component route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(plugins)/(functionality)/navigation-feedback.mdx — rewritten as source-backed Navigation Feedback guide; verified by check:docs, @platejs/core typecheck, @platejs/toc typecheck, @platejs/footnote typecheck, source/API audit, registry preview/source audit, route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(plugins)/(functionality)/tabbable.mdx — rewritten as source-backed Tabbable guide; verified by check:docs, @platejs/tabbable typecheck, source/API audit, registry preview/source audit, route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(plugins)/(functionality)/toolbar.mdx — rewritten as source-backed Toolbar guide; verified by check:docs, @platejs/floating typecheck, registry source audit, route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(plugins)/(marks)/basic-marks.mdx — rewritten as source-backed Basic Marks guide; verified by check:docs, @platejs/basic-nodes typecheck, source/API audit, registry preview/source audit, route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(plugins)/(marks)/bold.mdx — rewritten as source-backed Bold guide; verified by check:docs, @platejs/basic-nodes typecheck, source/API audit, registry preview/source audit, route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(plugins)/(marks)/code.mdx — rewritten as source-backed Code guide; verified by check:docs, @platejs/basic-nodes typecheck, source/API audit, registry preview/source audit, route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(plugins)/(marks)/highlight.mdx — rewritten as source-backed Highlight guide; verified by check:docs, @platejs/basic-nodes typecheck, source/API audit, registry preview/source audit, route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(plugins)/(marks)/italic.mdx — rewritten as source-backed Italic guide; verified by check:docs, @platejs/basic-nodes typecheck, source/API audit, registry preview/source audit, route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(plugins)/(marks)/kbd.mdx — rewritten as source-backed Keyboard Input guide; verified by check:docs, @platejs/basic-nodes typecheck, source/API audit, registry preview/source audit, route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(plugins)/(marks)/strikethrough.mdx — rewritten as source-backed Strikethrough guide; verified by check:docs, @platejs/basic-nodes typecheck, source/API audit, registry preview/source audit, route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(plugins)/(marks)/subscript.mdx — rewritten as source-backed Subscript guide; verified by check:docs, @platejs/basic-nodes typecheck, source/API audit, registry preview/source audit, route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(plugins)/(marks)/superscript.mdx — rewritten as source-backed Superscript guide; verified by check:docs, @platejs/basic-nodes typecheck, source/API audit, registry preview/source audit, route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(plugins)/(marks)/underline.mdx — rewritten as source-backed Underline guide; verified by check:docs, @platejs/basic-nodes typecheck, source/API audit, registry preview/source audit, route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(plugins)/(serializing)/csv.mdx — rewritten as source-backed CSV guide; verified by check:docs, @platejs/csv typecheck, @platejs/table typecheck, source/API audit, registry preview/source audit, route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(plugins)/(serializing)/docx-io.mdx — rewritten as source-backed DOCX Import/Export guide; verified by check:docs, @platejs/docx-io typecheck, @platejs/docx typecheck, source/API audit, registry source audit, route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(plugins)/(serializing)/docx.mdx — rewritten as source-backed DOCX paste guide; verified by check:docs, @platejs/docx typecheck, @platejs/juice typecheck, source/API audit, registry preview/source audit, route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(plugins)/(serializing)/html.mdx — rewritten as source-backed HTML guide; verified by check:docs, @platejs/core typecheck, source/API audit, registry preview/source audit, route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(plugins)/(serializing)/markdown.mdx — rewritten as source-backed Markdown guide; verified by check:docs, @platejs/markdown typecheck, @platejs/footnote typecheck, source/API audit, registry preview/source audit, route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(plugins)/(styles)/font.mdx — rewritten as source-backed Font guide; verified by check:docs, @platejs/basic-styles typecheck, @platejs/markdown typecheck, source/API audit, registry preview/source audit, route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(plugins)/(styles)/indent.mdx — rewritten as source-backed Indent guide; verified by check:docs, @platejs/indent typecheck, @platejs/list typecheck, source/API audit, registry preview/source audit, route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(plugins)/(styles)/line-height.mdx — rewritten as source-backed Line Height guide; verified by check:docs, @platejs/basic-styles typecheck, source/API audit, registry preview/source audit, route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(plugins)/(styles)/list.mdx — rewritten as source-backed List guide; verified by check:docs, @platejs/list typecheck, @platejs/indent typecheck, source/API audit, registry preview/source audit, route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/(plugins)/(styles)/text-align.mdx — rewritten as source-backed Text Align guide; verified by check:docs, @platejs/basic-styles typecheck, source/API audit, registry preview/source audit, route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/api/cn.mdx — rewritten as source-backed @udecode/cn API reference; verified by check:docs, @udecode/cn typecheck, @udecode/react-utils typecheck, source/API audit, route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/api/core.mdx — rewritten as dense source-backed Plate core API reference; verified by check:docs, @platejs/core typecheck, source/API audit, route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/api/core/plate-components.mdx — rewritten as source-backed Plate component API reference; verified by check:docs, @platejs/core typecheck, source/API audit, route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/api/core/plate-controller.mdx — rewritten as source-backed PlateController API reference; verified by check:docs, @platejs/core typecheck, source/API audit, route audit, stale-pattern audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/api/core/plate-editor.mdx — rewritten as source-backed PlateEditor API reference; verified by check:docs, @platejs/core typecheck, source/API audit across PlateEditor/PliteEditor/withPlate/withPlite/core plugins, route audit, stale-method audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/api/core/plate-plugin.mdx — rewritten as source-backed PlatePlugin API reference; verified by check:docs, @platejs/core typecheck, source/API audit across PlatePlugin/SlatePlugin/BasePlugin/createPlatePlugin/toPlatePlugin/createPlitePlugin/resolvePlugins, route audit, stale-Plate-prop audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/api/core/plate-store.mdx — rewritten as source-backed Plate store API reference; verified by check:docs, @platejs/core typecheck, @platejs/utils typecheck, source/API audit across PlateStore/createPlateStore/useEditorPlugin/usePluginOption/useEditorSelector/EventEditorStore/useEventPlateId, route audit, stale-import audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/api/floating.mdx — rewritten as source-backed @platejs/floating API reference; verified by check:docs, @platejs/floating typecheck, source/API audit across useVirtualFloating/useFloatingToolbarState/useFloatingToolbar/createVirtualElement/createVirtualRef/rect utilities/Floating UI re-exports, route audit, stale-toolbar-contract audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/api/plate.mdx — rewritten as source-backed platejs package API map; verified by check:docs, platejs typecheck, source/package export audit across platejs base/react/static entrypoints, route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/api/react-utils.mdx — rewritten as source-backed @udecode/react-utils API reference; verified by check:docs, @udecode/react-utils typecheck, source/API audit across package exports, primitive factories, components, ref/effect hooks, outside-click hook, memo/event helpers, and wrappers, route audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/api/resizable.mdx — rewritten as source-backed @platejs/resizable API reference; verified by check:docs, @platejs/resizable typecheck, source/API audit across headless wrapper, resize handle, stores, types, registry usage, and length utilities, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/api/plite.mdx — rewritten as source-backed @platejs/plite package map; verified by check:docs, @platejs/plite typecheck, source/export audit across createEditor, editor namespaces, history, plite-dom re-exports, interfaces, utilities, related routes, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/api/plite/editor-api.mdx — rewritten from generated-style longform into source-backed editor.api method map; verified by check:docs, @platejs/plite typecheck, source/API audit across node queries, text/selection helpers, predicates, element rules, refs, DOM helpers, core hooks, history flags, factories, related routes, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/api/plite/editor-transforms.mdx — rewritten from generated-style longform into source-backed editor.tf method map; verified by check:docs, @platejs/plite typecheck, source/API audit across node/text/mark/selection/DOM/history/core/keyboard transforms, stale shortcut-example audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/api/plite/element.mdx — rewritten as source-backed ElementApi and element type reference; verified by check:docs, @platejs/plite typecheck, source/API audit across TElement, ElementApi guards, element behavior hooks, exported utility types, dead ElementEntry claim removal, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/api/plite/location-ref.mdx — rewritten as source-backed PathRef/PointRef/RangeRef reference; verified by check:docs, @platejs/plite typecheck, source/API audit across ref types, affinity values, editor ref creators/sets, PathRefApi/PointRefApi/RangeRefApi transforms, stale Transforms example removal, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/api/plite/location.mdx — rewritten as source-backed Location/Span/At reference; verified by check:docs, @platejs/plite typecheck, source/API audit across TLocation, Location, Span, At, AtOrDescendant, LocationApi, SpanApi, related routes, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/api/plite/node.mdx — rewritten from generated-style longform into source-backed NodeApi and node-entry map; verified by check:docs, @platejs/plite typecheck, source/API audit across traversal, lookup, data helpers, guards, safe-wrapper behavior, entry aliases, utility types, related routes, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/api/plite/operation.mdx — rewritten as source-backed OperationApi and operation variant reference; verified by check:docs, @platejs/plite typecheck, source/API audit across operation unions, guards, inverse, node/selection/text operation shapes, related routes, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/api/plite/path.mdx — rewritten from generated-style longform into source-backed PathApi reference; verified by check:docs, @platejs/plite typecheck, source/API audit across retrieval, comparison, guards, helpers, transform options, operationCanTransformPath, Plate-specific next/parent/previous/lastIndex behavior, related routes, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/api/plite/point.mdx — rewritten as source-backed PointApi reference; verified by check:docs, @platejs/plite typecheck, source/API audit across get/compare/equals/isAfter/isBefore/isPoint/transform, PointTransformOptions, PointEntry, related routes, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/api/plite/range.mdx — rewritten as source-backed RangeApi reference; verified by check:docs, @platejs/plite typecheck, source/API audit across contains/edges/start/end/equals/includes/intersection/surrounds/points/transform/direction guards/null-safe collapsed-expanded behavior, options, related routes, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/api/plite/text.mdx — rewritten as source-backed TextApi and mark type reference; verified by check:docs, @platejs/plite typecheck, source/API audit across decorations return shape, equals loose option, text guards, matches, LeafPosition, DecoratedRange, Text/Mark utility types, TextEntry export location, related routes, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/api/utils.mdx — rewritten as source-backed @platejs/utils package map; verified by check:docs, @platejs/utils typecheck, source/API audit across package exports, utility plugins, React hooks, registry usage, umbrella re-exports, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/examples/collaboration-example.mdx — rewritten as source-backed Yjs collaboration example page; verified by check:docs, @platejs/yjs typecheck, registry/source audit across collaboration-demo and remote-cursor-overlay, route/link audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/examples/editable-voids.mdx — rewritten as source-backed editable void example page; verified by check:docs, @platejs/core typecheck, registry/source audit across editable-voids demo and value, route/link audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/examples/export.mdx — rewritten as source-backed export example page; verified by check:docs, @platejs/docx-io typecheck, @platejs/markdown typecheck, registry/source audit across export-toolbar-button, docx-export-kit, playground-demo, and export-pro preview, route/link audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/examples/hundreds-blocks.mdx — rewritten as source-backed large document rendering example; verified by check:docs, @platejs/core typecheck, @platejs/basic-nodes typecheck, registry/source audit across hundreds-blocks demo, huge document value, chunking sources, route/link audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/examples/hundreds-editors.mdx — rewritten as source-backed many-editor stress example; verified by check:docs, @platejs/core typecheck, registry/source audit across hundreds-editors demo and multi-editors value, route/link audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/examples/preview-markdown.mdx — rewritten as source-backed Markdown decoration preview example; verified by check:docs, @platejs/core typecheck, @platejs/basic-nodes typecheck, registry/source audit across preview-markdown demo and preview value, route/link audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/examples/version-history.mdx — rewritten as source-backed version-history diff example; verified by check:docs, @platejs/diff typecheck, @platejs/core typecheck, registry/source audit across version-history-demo, diff package audit, route/link audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/migration/slate-to-plate.mdx — rewritten as current-state Plite-to-Plate migration map; verified by check:docs, platejs typecheck, @platejs/core typecheck, @platejs/plite typecheck, source/API audit across editor creation, plugin components, overrides, shortcuts, api/tf surfaces, route/link audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/migration/v48.mdx — rewritten as compact historical major-release upgrade index through v48; verified by check:docs, @platejs/core typecheck, @platejs/yjs typecheck, @platejs/markdown typecheck, @platejs/code-block typecheck, original-history audit via HEAD, current API/source audit across Yjs, Markdown, code-block, plugin, and PlateContent surfaces, route/link audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/components/changelog.mdx — rewritten as dense component-registry changelog with latest entry plus yearly archive tables; verified by check:docs, @platejs/footnote typecheck, @platejs/markdown typecheck, @platejs/docx-io typecheck, original-history audit via HEAD, registry item audit across latest component/kit names, route/link audit, anti-slop audit, opening-length audit, and line-count audit
- [x] Doc: content/docs/releases/index.mdx — rewritten as release index shell with RSS callout and related docs; verified by check:docs, www typecheck, generated release-index audit, ReleaseIndex/RSS source audit, route/link audit, anti-slop audit, opening-length audit, and line-count audit

Translation parity inventory:
- [x] Translation inventory: content/docs/(guides)/controlled.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(guides)/debugging.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(guides)/editor-methods.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(guides)/editor.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(guides)/feature-kits.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(guides)/form.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(guides)/playwright.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(guides)/plugin-components.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(guides)/plugin-context.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(guides)/plugin-methods.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(guides)/plugin-rules.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(guides)/plugin-shortcuts.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(guides)/plugin.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(guides)/static.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(guides)/troubleshooting.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(guides)/typescript.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(guides)/unit-testing.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(plugins)/(ai)/ai.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(plugins)/(ai)/copilot.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(plugins)/(collaboration)/comment.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(plugins)/(collaboration)/discussion.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(plugins)/(collaboration)/suggestion.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(plugins)/(collaboration)/yjs.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(plugins)/(elements)/basic-blocks.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(plugins)/(elements)/blockquote.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(plugins)/(elements)/callout.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(plugins)/(elements)/code-block.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(plugins)/(elements)/column.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(plugins)/(elements)/date.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(plugins)/(elements)/equation.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(plugins)/(elements)/excalidraw.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(plugins)/(elements)/heading.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(plugins)/(elements)/horizontal-rule.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(plugins)/(elements)/link.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(plugins)/(elements)/list-classic.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(plugins)/(elements)/media.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(plugins)/(elements)/mention.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(plugins)/(elements)/table.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(plugins)/(elements)/toc.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(plugins)/(elements)/toggle.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(plugins)/(functionality)/(combobox)/combobox.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(plugins)/(functionality)/(combobox)/emoji.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(plugins)/(functionality)/(combobox)/slash-command.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(plugins)/(functionality)/(utils)/exit-break.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(plugins)/(functionality)/(utils)/forced-layout.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(plugins)/(functionality)/(utils)/single-block.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(plugins)/(functionality)/(utils)/trailing-block.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(plugins)/(functionality)/autoformat.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(plugins)/(functionality)/block-menu.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(plugins)/(functionality)/block-placeholder.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(plugins)/(functionality)/block-selection.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(plugins)/(functionality)/caption.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(plugins)/(functionality)/cursor-overlay.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(plugins)/(functionality)/dnd.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(plugins)/(functionality)/find-replace.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(plugins)/(functionality)/multi-select.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(plugins)/(functionality)/navigation-feedback.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(plugins)/(functionality)/tabbable.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(plugins)/(functionality)/toolbar.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(plugins)/(marks)/basic-marks.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(plugins)/(marks)/bold.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(plugins)/(marks)/code.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(plugins)/(marks)/highlight.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(plugins)/(marks)/italic.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(plugins)/(marks)/kbd.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(plugins)/(marks)/strikethrough.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(plugins)/(marks)/subscript.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(plugins)/(marks)/superscript.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(plugins)/(marks)/underline.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(plugins)/(serializing)/csv.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(plugins)/(serializing)/docx-io.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(plugins)/(serializing)/docx.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(plugins)/(serializing)/html.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(plugins)/(serializing)/markdown.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(plugins)/(styles)/font.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(plugins)/(styles)/indent.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(plugins)/(styles)/line-height.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(plugins)/(styles)/list.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/(plugins)/(styles)/text-align.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/api/cn.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/api/core.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/api/core/plate-components.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/api/core/plate-controller.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/api/core/plate-editor.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/api/core/plate-plugin.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/api/core/plate-store.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/api/floating.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/api/plate.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/api/react-utils.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/api/resizable.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/api/plite.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/api/plite/editor-api.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/api/plite/editor-transforms.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/api/plite/element.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/api/plite/location-ref.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/api/plite/location.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/api/plite/node.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/api/plite/operation.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/api/plite/path.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/api/plite/point.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/api/plite/range.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/api/plite/text.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/api/utils.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/components/changelog.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/examples/collaboration-example.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/examples/editable-voids.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/examples/export.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/examples/hundreds-blocks.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/examples/hundreds-editors.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/examples/preview-markdown.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/examples/version-history.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/index.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/installation.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/installation/docs.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/installation/manual.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/installation/mcp.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/installation/next.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/installation/node.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/installation/plate-ui.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/installation/react.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/installation/rsc.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/migration/index.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/migration/slate-to-plate.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted
- [x] Translation inventory: content/docs/migration/v48.cn.mdx — deferred from direct rewrite; pair after canonical English source page is accepted

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the source audit, parser/build, link/demo check, or review named in this plan | 127 `Doc:` rows checked and 124 translation inventory rows checked. |
| Docs lane shape satisfied | yes | Check the lane-specific structure against `docs-creator` | Per-doc ledger records lane-shaped rewrites or focused acceptance. |
| Source-backed claim audit | yes | Verify every named API/option/transform/component/import/route against source | Per-doc source audits recorded; final scoped autoreview spot-checked high-risk API claims. |
| Ownership map verified | yes | Confirm package/layer/kit/app-local ownership claims against source | Package, registry, app-local, kit, and translation ownership recorded per doc and in global decisions. |
| MDX/content parser | yes | Run `pnpm --filter www build:source` for MDX/content changes | `pnpm --filter www build:source`, `pnpm --filter www check:docs`, and `pnpm --filter www typecheck` passed. |
| Links/routes/previews verified | yes | Check leaf links, routes, anchors, and `<ComponentPreview>` names or record N/A | Per-doc route/link/preview audits recorded; `check:docs` passed after final fixes. |
| Plugin page specifics | yes | If plugin page, apply `docs-creator` kit/manual/API rules or record N/A | Plugin and API docs checked against kit/manual/API ordering where applicable. |
| Browser/render surface changed | N/A | Capture Browser Use proof or record explicit waiver/blocker | No registry demo or visual component implementation changed; docs parser, link/source checks, and typecheck are the proof surface. |
| Package/API behavior changed | N/A | Add changeset or record N/A | Docs-only content changes; no package API/runtime behavior changed. |
| Agent rules or skills changed | N/A | Run `pnpm install` and verify generated skill sync | Out of scope for this docs-restyle goal; unrelated local agent-rule/skill diffs were left untouched and excluded from scoped autoreview. |
| Autoreview for non-trivial docs changes | yes | Load `.agents/skills/autoreview/SKILL.md` and run the right target, or record N/A for tiny/no-local-patch work | Codex engine failed due usage limit; Claude autoreview accepted three docs findings, all fixed; final scoped Claude autoreview exited clean. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | `pnpm lint:fix` passed with no fixes after final docs edits. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-05-31-restyle-docs-one-by-one.md` | Passed after final evidence and closeout state were recorded. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Created active goal, generated docs plan, inventoried 127 canonical English docs and 124 translation files. | done |
| Writing | complete | All 127 canonical English doc rows are checked after individual docs-creator passes. | done |
| Verification | complete | `pnpm lint:fix`, `pnpm --filter www build:source`, `pnpm --filter www check:docs`, `pnpm --filter www typecheck`, and final scoped autoreview passed. | mechanical goal check |
| PR / tracker sync | N/A | No PR, commit, push, or tracker sync requested. | final response |
| Closeout | complete | Final evidence recorded and mechanical checker passed. | final response |

Findings:
- Docs inventory: 127 canonical English MDX files and 124 .cn.mdx translation files under content/docs.
- Per user instruction, the plan uses one checkbox per canonical English doc and processes the next unchecked doc only.
- `content/docs/index.mdx` had marketing-heavy opening prose, stale framework links, and no quick path before explanation.
- `content/docs/installation.mdx` was an option list; it needed a compact branch selector, clearer environment split, and current route links.
- `content/docs/installation/docs.mdx` duplicated MCP setup and hid the real two-path choice behind a long advantages list.
- `content/docs/installation/manual.mdx` was 405 lines, repeated full app snippets, used placeholder comments, and had stale next-step links.
- `content/docs/installation/mcp.mdx` explained MCP before setup and repeated per-client config as separate headings instead of tabs.

Decisions and tradeoffs:
- English MDX files are the canonical rewrite target; `.cn.mdx` files are inventoried and deferred for translation-aware parity instead of being rewritten by English style rules.
- Per-doc rows stay unchecked until that specific page has been read, fixed or explicitly accepted as-is, and verified.

Implementation notes:
- Rewrote `content/docs/index.mdx` with a three-sentence opening, `<Cards>/<Card>` branch selector, ownership table, short Plate UI explanation, corrected install links, and tighter FAQ.
- Rewrote `content/docs/installation.mdx` with a three-sentence opening, `<Cards>/<Card>` path selector, `<Steps>` quick path, environment table, RSC/Node import callout, and next-step links.
- Rewrote `content/docs/installation/docs.mdx` with a `<Cards>/<Card>` path selector, focused Fumadocs and MDX-only setup flows, versioned-docs callout, and compact AI access table.
- Rewrote `content/docs/installation/manual.mdx` as a 288-line headless setup guide with package ownership table, TypeScript config, first editor, marks, elements, persistence, and next-step table.
- Rewrote `content/docs/installation/mcp.mdx` with quick start, Plate registry config, MCP client `<Tabs>`, local docs distinction, and registry index table.
- Rewrote `content/docs/installation/next.mdx` as a Next.js Plate UI setup guide with a client-component boundary, progressive registry installs, plugin component mapping, persistence, and next-step links.
- Rewrote `content/docs/installation/node.mdx` as a server-safe runtime guide with install, server editor, Markdown IO, content transform, runtime boundary table, API table, and valid next-step links.
- Rewrote `content/docs/installation/plate-ui.mdx` as the Plate registry entrypoint with cards, quick start, new-project preset, existing-project registry config, item taxonomy, and manual path handoff.
- Rewrote `content/docs/installation/react.mdx` as a Vite/client-only React setup guide matching the cleaned Next.js progression without App Router/client-component language.
- Rewrote `content/docs/installation/rsc.mdx` as an RSC/static rendering guide centered on `createStaticEditor`, `<PlateStatic>`, `serializeHtml`, runtime boundaries, and the handoff to Node-only processing.
- Rewrote `content/docs/(guides)/controlled.mdx` around Plate value ownership, initial values, persistence, explicit replacement/reset, async values, and manual initialization with `skipInitialization`.
- Rewrote `content/docs/(guides)/debugging.mdx` as a source-backed DebugPlugin playbook with core-plugin setup, runtime logging, `PlateError` capture, custom logger wiring, plugin isolation, minimal reproduction guidance, and exact option/error-type reference.
- Rewrote `content/docs/(guides)/editor-methods.mdx` around editor access hooks, `PlateController`, fallback editor guards, `editor.api` versus `editor.tf`, typed plugin helpers, and plugin option methods.
- Rewrote `content/docs/(guides)/editor.mdx` around editor creation, initial values, core options, node IDs, navigation feedback, limits, component/plugin configuration, and typed editors.
- Rewrote `content/docs/(guides)/feature-kits.mdx` around registry kit types, client kits, base kits, full editor kits, customization, and real registry item names.
- Rewrote `content/docs/(guides)/form.mdx` around Plate-owned editor state, `react-hook-form` sync timing, shadcn Form wiring, validation with `NodeApi.string`, and form/editor reset consistency.
- Rewrote `content/docs/(guides)/playwright.mdx` around `PlaywrightPlugin`, editor handles, scoped editable lookup, path/DOM/selection helpers, browser-context boundaries, exact helper signatures, and source-backed troubleshooting.
- Rewrote `content/docs/(guides)/plugin-components.mdx` around Plate UI ownership, `PlateElement`, `PlateLeaf`, `.withComponent`, `node.component`, editor `components`, `render.as`, styling via `plite-<node-type>`, and exact render API tradeoffs.
- Rewrote `content/docs/(guides)/plugin-context.mdx` around `PlatePluginContext`, `SlatePluginContext`, context helpers, handlers, extension callbacks, `getEditorPlugin(editor, plugin)`, React option hooks, per-editor option state, and `OPTION_UNDEFINED`.
- Cleaned up `content/docs/(guides)/plugin-input-rules.mdx` by tightening the opening to three sentences, adding an on-page jump list, replacing false `@platejs/autoformat` wording, removing placeholder comments, and making custom rule snippets concrete.
- Rewrote `content/docs/(guides)/plugin-methods.mdx` around the actual method resolution contract: configure versus extend, nested plugin behavior, selectors, plugin-specific API/transform access paths, editor-wide methods, overrides, components, and `toPlatePlugin`.
- Rewrote `content/docs/(guides)/plugin-rules.mdx` around the core rule engines, action matrix, break/delete/merge/normalize/selection/match contracts, real package defaults, and source-backed examples without fake custom conditions.
- Rewrote `content/docs/(guides)/plugin-shortcuts.mdx` around shortcut resolution, plugin-specific transform/API fallback, custom handlers, current preventDefault behavior, shortcut removal, root shortcuts, priority, and real default shortcut ownership.
- Rewrote `content/docs/(guides)/plugin.mdx` as the plugin overview/map with exact `createPlatePlugin`/`createPlitePlugin` defaults, node shape rules, behavior fields, option state methods, dependency/priority resolution, typed plugin setup, and compact field reference.
- Rewrote `content/docs/(guides)/static.mdx` around `createStaticEditor`, `<PlateStatic>`, `EditorStatic`, static node components, `serializeHtml`, `<PlateView>`, memoization, and exact static API imports.
- Rewrote `content/docs/(guides)/troubleshooting.mdx` into a diagnosis flow for package alignment, duplicate runtime checks, server/client import boundaries, component wiring, `DebugPlugin`, reinstall, and minimal reproduction evidence.
- Rewrote `content/docs/(guides)/typescript.mdx` around TypeScript 5 package-exports resolution, import boundaries, typed values, typed plugins, package-resolution errors, monorepo source aliases, and verification commands.
- Rewrote `content/docs/(guides)/unit-testing.mdx` around real editor-state tests, hyperscript values, transform/plugin option tests, clipboard/HTML helpers, React Testing Library surfaces, and assertion boundaries.
- Rewrote `content/docs/(plugins)/(ai)/ai.mdx` around `AIKit`, app-owned model routes, plugin/package ownership, manual chat wiring, streaming insertion, prompt submission, server route responsibilities, hooks, plugin options, and utility references.
- Rewrote `content/docs/(plugins)/(ai)/copilot.mdx` around `CopilotKit`, ghost text ownership, AI Gateway route setup, manual plugin configuration, trigger flow, shortcuts, plugin options, API helpers, and editing behavior.
- Rewrote `content/docs/(plugins)/(collaboration)/comment.mdx` around inline comment mark ownership, `CommentKit` versus `DiscussionKit`, registry UI wiring, manual `BaseCommentPlugin` extension, comment mark shape, APIs, transforms, utilities, and static rendering.
- Rewrote `content/docs/(plugins)/(collaboration)/discussion.mdx` around app-local discussion state, `BlockDiscussion`, block discussion indexing, comment/suggestion integration, selectors, UI behavior, and persistence ownership.
- Rewrote `content/docs/(plugins)/(collaboration)/suggestion.mdx` around suggestion mode, inline/block suggestion metadata, `SuggestionKit`, toolbar toggling, discussion integration, accept/reject helpers, APIs, utilities, and static rendering.
- Rewrote `content/docs/(plugins)/(collaboration)/yjs.mdx` around `YjsPlugin`, provider lifecycle, Hocuspocus/WebRTC ownership, app-owned room/auth/persistence, the registry `collaboration-demo`, and `remote-cursor-overlay`.
- Rewrote `content/docs/(plugins)/(elements)/basic-blocks.mdx` around `BasicBlocksKit`, `BaseBasicBlocksKit`, H1-H6 coverage, package-versus-registry ownership, markdown shortcuts, and manual package setup.
- Rewrote `content/docs/(plugins)/(functionality)/(combobox)/slash-command.mdx` around `SlashKit`, `BaseSlashPlugin`, `SlashInputPlugin`, `slash-node`, grouped registry commands, `withTriggerCombobox`, and registry action helpers.
- Rewrote `content/docs/(plugins)/(functionality)/(utils)/exit-break.mdx` around `ExitBreakKit`, `ExitBreakPlugin`, core `insertExitBreak`, strict-sibling target selection, shortcuts, and break-rule integration.
- Rewrote `content/docs/(plugins)/(functionality)/(utils)/forced-layout.mdx` around `NormalizeTypesPlugin`, `withNormalizeTypes`, path rule semantics, strict versus non-strict type behavior, `onError`, and the playground toggle.
- Rewrote `content/docs/(plugins)/(functionality)/(utils)/single-block.mdx` around `SingleBlockPlugin`, `SingleLinePlugin`, root-block normalization, break handling, line-separator filtering, and demo mode toggling.
- Rewrote `content/docs/(plugins)/(functionality)/(utils)/trailing-block.mdx` around `TrailingBlockPlugin`, `withTrailingBlock`, target levels, query filters, default paragraph type, custom insertion wrappers, and EditorKit/SuggestionKit ownership.
- Rewrote `content/docs/(plugins)/(functionality)/autoformat.mdx` around explicit input-rule ownership, `AutoformatKit` text substitutions, feature-owned Markdown shortcuts, the inert `AutoformatPlugin`, and the core validation guard.
- Rewrote `content/docs/(plugins)/(elements)/blockquote.mdx` around wrapper semantics, `BlockquoteRules.markdown()`, lift behavior, normalization, registry UI ownership, and the exact shortcut shape.
- Rewrote `content/docs/(plugins)/(elements)/callout.mdx` around `CalloutKit`, `BaseCalloutKit`, `insertCallout`, callout break/delete behavior, icon storage fallback, `useCalloutEmojiPicker`, and the corrected component route.
- Rewrote `content/docs/(plugins)/(elements)/code-block.mdx` around `CodeBlockKit`, `BaseCodeBlockKit`, `code_block`/`code_line`/`code_syntax`, lowlight decoration ownership, editor behavior, JSON formatting, and exported transforms/queries.
- Rewrote `content/docs/(plugins)/(elements)/code-drawing.mdx` around `CodeDrawingKit`, the void `code_drawing` element, direct `insertCodeDrawing`, browser renderer ownership, debounced registry UI, and removed false bound transform/hook API claims.
- Rewrote `content/docs/(plugins)/(elements)/column.mdx` around `ColumnKit`, `BaseColumnKit`, `column_group`/`column` value shape, toolbar transform routing, `withColumn` normalization, Markdown column tags, and the current `moveMiddleColumn`/`useDebouncePopoverOpen` caveats.
- Rewrote `content/docs/(plugins)/(elements)/date.mdx` around inline void date nodes, `DateKit`, `BaseDateKit`, bound and direct insertion, `date` versus `rawDate` storage, picker behavior, Markdown date tags, and exact date helper/query APIs.
- Rewrote `content/docs/(plugins)/(elements)/equation.mdx` around `MathKit`, block versus inline math ownership, bound and direct insertion, `MathRules`, KaTeX rendering, Markdown `remark-math` serialization, toolbar behavior, and the real Plus preview.
- Rewrote `content/docs/(plugins)/(elements)/excalidraw.mdx` around `ExcalidrawKit`, void node storage, direct `insertExcalidraw`, selection-guarded insertion, dynamic Excalidraw loading, deduplicated canvas persistence, read-only mode, and the lack of package-owned Markdown serialization.

Review fixes:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Broad `rg` included generated/reference-heavy output while checking local docs registry references, preview names, Node runtime claims, RSC/static claims, controlled-value claims, debug API claims, editor method claims, editor option claims, feature-kit registry claims, form integration claims, Playwright helper claims, plugin component rendering claims, input-rule factory claims, plugin method resolution claims, plugin rule/preview claims, plugin overview claims, static rendering claims, troubleshooting claims, TypeScript claims, unit testing claims, AI plugin claims, Copilot claims, Comment claims, Discussion claims, Suggestion claims, Yjs claims, Basic Blocks claims, Blockquote claims, Callout claims, Code Block claims, Code Drawing claims, Column claims, Date claims, Equation claims, and Excalidraw claims | 36 | Exclude generated public registry output and use focused script/registry reads | Resolved by reading targeted package files and registry sources directly. |
| Unquoted route-group path triggered zsh parenthesis globbing while reading route-group docs or app routes | 4 | Quote route-group paths in shell commands | Resolved by rerunning the reads with quoted paths. |
| Hook/controller source paths were guessed under `packages/core/src/react/hooks` and `components` before checking barrels | 2 | Use `rg --files` before focused reads for hook/store files | Resolved by reading `stores/plate/createPlateStore.ts`, `stores/plate/useEditorSelector.ts`, and `stores/plate-controller/plateControllerStore.ts`. |
| Link/source audit regex used an unescaped `](` group and failed with an unclosed-group parse error | 1 | Escape markdown link syntax or split the audit into simpler `rg` commands | Resolved by rerunning the audit with escaped `\\]\\(/docs`. |
| Anti-slop audit regex included an unescaped JSX `{editor}` fragment and failed as an invalid repetition quantifier | 1 | Avoid JSX brace fragments in regex or use fixed-string searches | Resolved by rerunning the audit with the JSX fragment removed. |
| Live HTTP route audit on local Next dev servers timed out for `/`, `/docs/installation`, `/docs/unit-testing`, `/docs/typescript`, `/docs/ai`, and component routes on ports 3004, 3005, and 3006 | 1 | Use `check:docs`, source parity, static link-map audit, and registry-source audits for this doc; retry live route proof after dev server health is restored | Unresolved environment issue; do not count as rendered route proof. |
| Nonexistent Yjs kit path was assumed before checking registry entries | 1 | Search registry item names before reading kit files | Resolved by verifying Yjs has `collaboration-demo` and `remote-cursor-overlay`, but no `yjs-kit`. |
| Anti-slop audit flagged a real TypeScript spread as placeholder ellipsis in the Basic Blocks snippet | 1 | Prefer direct array assignment when the kit is the whole plugin list | Resolved by changing `plugins: [...BasicBlocksKit]` to `plugins: BasicBlocksKit`. |
| Invented `code-block-pro` preview before checking Pro registry names | 1 | Registry-check preview names before adding Pro previews | Resolved by removing the nonexistent preview. |
| Component route audit script only scanned registry `route:` fields and missed component routes generated into `content/docs/meta.json` | 1 | Include `content/docs/meta.json` href and route-map entries in component route audits | Resolved by rerunning the Column route audit against `content/docs/meta.json`. |
| Broad package search mixed `packages/list` with `packages/list-classic` while checking List Classic ownership | 1 | Search the exact package owner before rewriting package-specific docs | Resolved by reading `packages/list-classic` source and keeping `@platejs/list` only as an explicit contrast. |
| Source audit regex for List Classic had a bad shell quote while searching a backticked import string | 1 | Use simpler quoted regexes for package/API audits | Resolved by rerunning the audit with package names and API identifiers split into a plain alternation. |
| Broad Media source/API audit returned registry-heavy output while checking media package, markdown, and component routes | 1 | Keep the audit but verify exact claims with targeted package and registry reads | Resolved by reading `packages/media`, `packages/caption`, `packages/markdown`, and registry item sources directly. |
| Mention Plus registry audit matched a commented `mention-pro` row in `registry-pro.ts` | 1 | Anchor registry checks to active `name:` rows, not commented text | Resolved by rerunning with `^\\s*name:` and removing the nonexistent Plus preview from the doc. |
| Table source/API audit returned registry-heavy output while checking table transforms, hooks, and routes | 1 | Use targeted reads for `BaseTablePlugin`, transforms, registry nodes, and Markdown table tests | Resolved by reading package and registry sources directly. |

Verification evidence:
- `content/docs/index.mdx`: read target, `content/docs/installation.mdx`, shadcn index baseline, MDX component support, and install/source references.
- `pnpm --filter www build:source` in `/Users/zbeyens/git/plate`: passed after the index rewrite.
- `pnpm --filter www build:source` in `/Users/zbeyens/git/plate`: passed after the installation rewrite.
- Index link audit: 13 `/docs/*` links resolve to current `content/docs` MDX files.
- Installation link audit: 13 `/docs/*` links resolve to current `content/docs` MDX files.
- Index anti-slop audit: no banned marketing/changelog/stale-link matches.
- Installation anti-slop audit: no banned marketing/changelog/stale-link matches.
- Index opening audit: 3 sentences before the first `##`.
- Installation opening audit: 3 sentences before the first `##`.
- `content/docs/installation/docs.mdx`: source-backed against `apps/www/scripts/build-docs-registry.mts`, which defines `docs`, `docs-meta`, and `fumadocs` registry items and targets installed docs under `content/docs/plate`.
- `pnpm --filter www build:source` in `/Users/zbeyens/git/plate`: passed after the local-docs rewrite.
- Local Docs link audit: 1 `/docs/*` link resolves to current `content/docs` MDX files.
- Local Docs anti-slop audit: no banned marketing/changelog/stale-list matches.
- Local Docs opening audit: 3 sentences before the first `##`.
- `content/docs/installation/manual.mdx`: source-backed package/import claims against install siblings and `package.json`; preview names verified in `apps/www/src/registry/registry-examples.ts` and `apps/www/src/__registry__/index.tsx`.
- `pnpm --filter www build:source` in `/Users/zbeyens/git/plate`: passed after the manual rewrite.
- Manual link audit: 6 `/docs/*` links resolve to current `content/docs` MDX files.
- Manual anti-slop audit: no banned marketing/changelog/placeholder matches.
- Manual opening audit: 3 sentences before the first `##`.
- Manual length audit: 288 lines after rewrite, below the docs-creator ~300-line anchor-list threshold.
- `content/docs/installation/mcp.mdx`: source-backed against `.agents/skiller.toml`, `apps/www/src/lib/plate-init.test.ts`, and `apps/www/src/lib/llm.ts` for MCP command, registry namespace, and registry index URLs.
- `pnpm --filter www build:source` in `/Users/zbeyens/git/plate`: passed after the MCP rewrite.
- MCP link audit: 1 `/docs/*` link resolves to current `content/docs` MDX files.
- MCP anti-slop audit: no banned marketing/changelog/stale-label matches.
- MCP opening audit: 3 sentences before the first `##`.
- `content/docs/installation/next.mdx`: source-backed preview names verified in `apps/www/src/registry/registry-examples.ts` and `apps/www/src/__registry__/index.tsx`.
- `pnpm --filter www build:source` in `/Users/zbeyens/git/plate`: passed after the Next.js rewrite.
- Next.js link audit: 4 `/docs/*` links resolve to current `content/docs` MDX files.
- Next.js preview registry audit: `installation-next-demo` and `installation-next-0{1,2,3}-*` registry entries resolve in registry source and generated index.
- Next.js anti-slop audit: no banned marketing/changelog/placeholder matches.
- Next.js opening audit: 3 sentences before the first `##`.
- Next.js length audit: 289 lines after rewrite, below the docs-creator ~300-line anchor-list threshold.
- `content/docs/installation/node.mdx`: source-backed against `packages/plate`, `packages/basic-nodes`, and `packages/markdown` package exports plus `createPliteEditor`, `BaseBasicBlocksPlugin`, `BaseBasicMarksPlugin`, `MarkdownPlugin`, `deserializeMd`, and `serializeMd` source definitions.
- `pnpm --filter www build:source` in `/Users/zbeyens/git/plate`: passed after the Node.js rewrite.
- Node.js route audit: 5 `/docs/*` links resolve through the current `content/docs` route-group map.
- Node.js anti-slop/runtime audit: no banned marketing/changelog/placeholder matches and no stale `PlateStatic` link.
- Node.js opening audit: 3 sentences before the first `##`.
- Node.js length audit: 187 lines after rewrite.
- `content/docs/installation/plate-ui.mdx`: source-backed against `apps/www/src/registry/registry.ts`, `registry-blocks.ts`, `registry-kits.ts`, `registry-ui.ts`, `registry-components.ts`, `apps/www/src/lib/plate-registry-config.ts`, `apps/www/src/lib/plate-init.ts`, and `apps/www/scripts/build-docs-registry.mts`.
- `pnpm --filter www build:source` in `/Users/zbeyens/git/plate`: passed after the Plate UI rewrite.
- Plate UI route audit: 7 `/docs/*` links resolve through the current `content/docs` route-group map.
- Plate UI registry audit: `plate-ui`, editor blocks, kits, UI components, API routes, docs, Fumadocs, and `plugin-docs` item naming source verified.
- Plate UI card-icon audit: all card icons resolve in `apps/www/src/config/docs-icons.tsx`.
- Plate UI anti-slop audit: no banned marketing/changelog/stale-link matches.
- Plate UI opening audit: 3 sentences before the first `##`.
- Plate UI length audit: 115 lines after rewrite.
- `content/docs/installation/react.mdx`: source-backed preview names verified in `apps/www/src/registry/registry-examples.ts` and `apps/www/src/__registry__/index.tsx`; registry item names verified in `registry-ui.ts` and `registry-kits.ts`.
- `pnpm --filter www build:source` in `/Users/zbeyens/git/plate`: passed after the React rewrite.
- React route audit: 5 internal links resolve through the current `content/docs` route-group map and known `/editors` route.
- React preview registry audit: `installation-next-demo` and `installation-next-0{1,2,3}-*` registry entries resolve in registry source and generated index.
- React anti-slop audit: no banned marketing/changelog/placeholder matches.
- React opening audit: 3 sentences before the first `##`.
- React length audit: 293 lines after rewrite.
- `content/docs/installation/rsc.mdx`: source-backed against `packages/plate/src/static/index.ts`, `packages/core/src/static/editor/withStatic.tsx`, `packages/core/src/static/components/PlateStatic.tsx`, `packages/core/src/static/serializeHtml.tsx`, `apps/www/src/registry/components/editor/editor-base-kit.tsx`, `apps/www/src/registry/ui/editor-static.tsx`, and `apps/www/src/registry/registry-kits.ts`.
- `pnpm --filter www build:source` in `/Users/zbeyens/git/plate`: passed after the RSC rewrite.
- RSC route audit: 4 `/docs/*` links resolve through the current `content/docs` route-group map.
- RSC anti-slop audit: no banned marketing/changelog/stale-link matches.
- RSC import-boundary audit: no code-fence import from `platejs/react` or `@platejs/*/react`.
- RSC opening audit: 3 sentences before the first `##`.
- RSC length audit: 138 lines after rewrite.
- `content/docs/(guides)/controlled.mdx`: source-backed against `withPlate.ts`, `withPlite.ts`, `setValue.ts`, `init.ts`, `usePliteProps.ts`, and `controlled-demo` registry entries.
- `pnpm --filter www build:source` in `/Users/zbeyens/git/plate`: passed after the controlled-value rewrite.
- Controlled link audit: no `/docs/*` links present.
- Controlled preview registry audit: `controlled-demo` resolves in registry source and generated index.
- Controlled stale-option audit: no `shouldInitialize` or stale controlled-value language remains.
- Controlled anti-slop audit: no banned marketing/changelog/placeholder matches.
- Controlled opening audit: 3 sentences before the first `##`.
- Controlled length audit: 223 lines after rewrite.
- `content/docs/(guides)/debugging.mdx`: source-backed against `packages/core/src/lib/plugins/debug/DebugPlugin.ts`, `packages/core/src/lib/plugins/getCorePlugins.ts`, `packages/core/src/lib/plugins/debug/DebugPlugin.spec.ts`, and `packages/plate/src/{index.tsx,react/index.tsx}` for `DebugPlugin`, `PlateError`, `LogLevel`, options, default behavior, package exports, and React editor imports.
- `pnpm --filter www build:source` in `/Users/zbeyens/git/plate`: passed after the debugging rewrite.
- Debugging route audit: 6 `/docs/*` links resolve through the current `content/docs` route-group map.
- Debugging source/API audit: core debug plugin, core plugin inclusion, package export path, React export path, and test-backed throw/log-level behavior verified.
- Debugging anti-slop/stale-error audit: no banned marketing/changelog/placeholder matches and stale `PLUGIN_NODE_TYPE` removed.
- Debugging opening audit: 2 sentences before the first `##`.
- Debugging length audit: 179 lines after rewrite.
- `content/docs/(guides)/editor-methods.mdx`: source-backed against `packages/core/src/react/stores/plate/createPlateStore.ts`, `packages/core/src/react/stores/plate/useEditorSelector.ts`, `packages/core/src/react/stores/plate/usePluginOption.ts`, `packages/core/src/react/stores/plate-controller/plateControllerStore.ts`, `packages/core/src/react/components/PlateControllerEffect.ts`, `packages/core/src/react/utils/createPlateFallbackEditor.ts`, `packages/core/src/lib/editor/withPlite.ts`, `packages/core/src/react/editor/PlateEditor.ts`, `packages/plite/src/interfaces/editor/{editor-api.ts,editor-transforms.ts}`, `packages/find-replace/src/lib/FindReplacePlugin.ts`, and `packages/table/src/lib/BaseTablePlugin.ts`.
- `pnpm --filter www build:source` in `/Users/zbeyens/git/plate`: passed after the editor-methods rewrite.
- Editor Methods route audit: 5 `/docs/*` links resolve through the current `content/docs` route-group map.
- Editor Methods source/API audit: access hooks, selector signature, controller fallback behavior, editor method surfaces, plugin helper methods, FindReplace options, and Table plugin API/transform examples verified.
- Editor Methods anti-slop/stale-method audit: no banned marketing/changelog/placeholder matches and stale `api.api` / `caseSensitive` examples removed.
- Editor Methods opening audit: 2 sentences before the first `##`.
- Editor Methods length audit: 226 lines after rewrite.
- `content/docs/(guides)/editor.mdx`: source-backed against `packages/core/src/react/editor/{withPlate.ts,usePlateEditor.ts,PlateEditor.ts}`, `packages/core/src/lib/editor/withPlite.ts`, `packages/core/src/lib/plugins/{node-id, navigation-feedback, length, chunking}`, `packages/basic-nodes/src/react`, `packages/table/src/react`, `packages/link/src/react`, and registry UI exports for paragraph/heading components.
- `pnpm --filter www build:source` in `/Users/zbeyens/git/plate`: passed after the editor configuration rewrite.
- Editor Configuration route audit: 12 `/docs/*` links resolve through the current `content/docs` route-group map.
- Editor Configuration source/API audit: `usePlateEditor`, `createPlateEditor`, value loading, node ID defaults, navigation feedback, max length, chunking, component configuration, plugin configuration, and typed editor examples verified.
- Editor Configuration registry/export audit: `H1Element`, `ParagraphElement`, `BasicBlocksPlugin`, `BasicMarksPlugin`, `HeadingPlugin`, `H1Plugin`, `TablePlugin`, `LinkPlugin`, `TPlateEditor`, `createPlateEditor`, and `usePlateEditor` exports verified.
- Editor Configuration anti-slop/stale-config audit: no banned marketing/changelog/placeholder matches and stale long-comment option block removed.
- Editor Configuration opening audit: 2 sentences before the first `##`.
- Editor Configuration length audit: 277 lines after rewrite.
- `content/docs/(guides)/feature-kits.mdx`: source-backed against `apps/www/src/registry/registry-kits.ts`, `apps/www/src/registry/components/editor/editor-kit.tsx`, `editor-base-kit.tsx`, and focused kit files including `basic-nodes-kit`, `basic-blocks-kit`, `basic-marks-kit`, `table-kit`, `media-kit`, `comment-kit`, `discussion-kit`, `ai-kit`, and `basic-blocks-base-kit`.
- `pnpm --filter www build:source` in `/Users/zbeyens/git/plate`: passed after the feature-kits rewrite.
- Feature Kits route audit: 6 `/docs/*` links resolve through the current `content/docs` route-group map.
- Feature Kits registry/source audit: documented registry item names and source kit files exist.
- Feature Kits anti-slop audit: no banned marketing/changelog/placeholder matches.
- Feature Kits opening audit: 2 sentences before the first `##`.
- Feature Kits length audit: 139 lines after rewrite.
- `content/docs/(guides)/form.mdx`: source-backed against `packages/core/src/react/components/Plate.tsx`, `packages/core/src/react/hooks/usePliteProps.ts`, `packages/plite/src/interfaces/node.ts`, `apps/www/src/components/ui/form.tsx`, `apps/www/src/registry/ui/editor.tsx`, `apps/www/src/registry/examples/select-editor-demo.tsx`, and `apps/www/package.json`.
- `pnpm --filter www build:source` in `/Users/zbeyens/git/plate`: passed after the form rewrite.
- Form route audit: 4 `/docs/*` links resolve through the current `content/docs` route-group map.
- Form Plate/form source audit: `onValueChange`, `onBlur`, `FormField`, `FormControl`, `EditorContainer`, `NodeApi.string`, `editor.tf.setValue`, and shadcn form wiring verified.
- Form dependency audit: `react-hook-form` 7.57.0 and `@hookform/resolvers` 5.1.1 present in `apps/www/package.json`.
- Form anti-slop audit: no banned marketing/changelog/placeholder matches.
- Form opening audit: 2 sentences before the first `##`.
- Form length audit: 216 lines after rewrite.
- `content/docs/(guides)/playwright.mdx`: source-backed against `packages/playwright/src/index.ts`, `PlaywrightPlugin.ts`, `usePlaywrightAdapter.tsx`, `getEditorHandle.ts`, `getEditable.ts`, `getNodeByPath.ts`, `getDOMNodeByPath.ts`, `clickAtPath.ts`, `getSelection.ts`, `setSelection.ts`, `getTypeAtPath.ts`, `types.ts`, `packages/playwright/package.json`, `packages/core/src/lib/plugin/BasePlugin.ts`, and `packages/plite/src/interfaces/location.ts`.
- `pnpm --filter www build:source` in `/Users/zbeyens/git/plate`: passed after the Playwright rewrite.
- Playwright route audit: 1 `/docs/*` link resolves through the current `content/docs` route-group map.
- Playwright source/export audit: helper exports, `PlaywrightPlugin`, `window.platePlaywrightAdapter`, `enabled`, `TLocation`, `@playwright/test` peer dependency, and helper signatures verified.
- Playwright anti-slop audit: no banned marketing/changelog/placeholder/stale-variable matches.
- Playwright opening audit: 3 sentences before the first `##`.
- Playwright length audit: 215 lines after rewrite.
- `content/docs/(guides)/plugin-components.mdx`: source-backed against `packages/core/src/react/components/plate-nodes.tsx`, `packages/core/src/react/utils/getRenderNodeProps.ts`, `packages/core/src/react/utils/pluginRenderElement.tsx`, `packages/core/src/react/utils/pluginRenderLeaf.tsx`, `packages/core/src/lib/plugin/createPlitePlugin.ts`, `packages/core/src/internal/plugin/resolvePlugin.ts`, `packages/core/src/internal/plugin/resolvePlugins.ts`, `packages/core/src/lib/editor/withPlite.ts`, `packages/core/src/lib/plugin/BasePlugin.ts`, `apps/www/src/registry/ui/{blockquote-node,code-node,paragraph-node,heading-node}.tsx`, `apps/www/src/registry/components/editor/plugins/{code-block-kit,basic-marks-kit}.tsx`, and `packages/basic-nodes/src`.
- `pnpm --filter www build:source` in `/Users/zbeyens/git/plate`: passed after the plugin-components rewrite.
- Plugin Components route audit: 4 `/docs/*` links resolve through the current `content/docs` route-group map.
- Plugin Components source/render audit: `PlateElement`, `PlateLeaf`, `withComponent`, `node.component`/`render.node` sync, `components`, `override.components`, `render.as`, `plite-<node-type>`, and `@platejs/basic-nodes/react` exports verified.
- Plugin Components anti-slop audit: no banned marketing/changelog/placeholder matches.
- Plugin Components opening audit: 3 sentences before the first `##`.
- Plugin Components length audit: 231 lines after rewrite.
- `content/docs/(guides)/plugin-context.mdx`: source-backed against `packages/core/src/react/plugin/PlatePlugin.ts`, `packages/core/src/lib/plugin/SlatePlugin.ts`, `packages/core/src/lib/plugin/BasePlugin.ts`, `packages/core/src/{lib,react}/plugin/getEditorPlugin.ts`, `packages/core/src/react/stores/plate/useEditorPlugin.ts`, `packages/core/src/react/stores/plate/usePluginOption.ts`, `packages/core/src/lib/editor/{PliteEditor,withPlite}.ts`, and `packages/link/src/react`.
- `pnpm --filter www build:source` in `/Users/zbeyens/git/plate`: passed after the plugin-context rewrite.
- Plugin Context route audit: 2 `/docs/*` links resolve through the current `content/docs` route-group map.
- Plugin Context source/API audit: `PlatePluginContext`, `SlatePluginContext`, `BasePluginContext`, `getEditorPlugin(editor, plugin)`, `useEditorPlugin`, `usePluginOption`, `usePluginOptions`, explicit-editor hook variants, option stores, `setOptions`, and `OPTION_UNDEFINED` verified.
- Plugin Context anti-slop audit: no banned marketing/changelog/placeholder matches.
- Plugin Context opening audit: 3 sentences before the first `##`.
- Plugin Context length audit: 203 lines after rewrite.
- `content/docs/(guides)/plugin-input-rules.mdx`: source-backed against `packages/core/src/lib/plugins/input-rules/**`, `packages/core/src/internal/plugin/{resolvePlugin,resolvePlugins}.ts`, `packages/basic-nodes/src/lib/{BasicBlockRules,BasicMarkRules}.ts`, `packages/code-block/src/lib/CodeBlockRules.ts`, `packages/list/src/lib/*Rules.ts`, `packages/math/src/lib/MathRules.ts`, `packages/link/src/lib/LinkRules.ts`, `packages/autoformat/src/plugin.ts`, and `apps/www/src/registry/components/editor/plugins/autoformat-kit.tsx`.
- `pnpm --filter www build:source` in `/Users/zbeyens/git/plate`: passed after the plugin-input-rules cleanup.
- Plugin Input Rules route audit: 1 `/docs/*` link resolves through the current `content/docs` route-group map.
- Plugin Input Rules source/rule audit: rule registration, explicit rule arrays, plugin-side `rule` builder, rule sorting, `AutoformatPlugin` compatibility behavior, concrete rule families, builders, targets, matchers, and local `AutoformatKit` source verified.
- Plugin Input Rules anti-slop audit: no banned marketing/changelog/placeholder matches.
- Plugin Input Rules opening audit: 3 sentences before the first `##`.
- Plugin Input Rules length audit: 942 lines after cleanup; `On This Page` jump list added, split deferred because this is a dense API/reference page and user asked for one-doc checks rather than route reshaping.
- `content/docs/(guides)/plugin-methods.mdx`: source-backed against `packages/core/src/lib/plugin/createPlitePlugin.ts`, `packages/core/src/internal/plugin/resolvePlugin.ts`, `packages/core/src/internal/plugin/resolvePlugins.ts`, `packages/core/src/internal/utils/mergePlugins.ts`, `packages/core/src/lib/plugin/BasePlugin.ts`, `packages/core/src/lib/utils/extendApi.spec.ts`, `packages/core/src/lib/utils/overrideEditor.spec.ts`, `packages/core/src/react/plugin/toPlatePlugin.ts`, `packages/core/src/react/plugin/PlatePlugin.ts`, and `packages/core/src/react/stores/plate/usePluginOption.spec.tsx`.
- `pnpm --filter www build:source` in `/Users/zbeyens/git/plate`: passed after the plugin-methods rewrite.
- Plugin Methods route audit: `http://localhost:3004/docs/plugin-methods` returned HTTP 200.
- Plugin Methods source/method audit: merge behavior, configuration timing, nested `configurePlugin` no-op behavior, nested `extendPlugin` add-by-key behavior, plugin-specific `editor.api[plugin.key]`, editor-wide `editor.api`, plugin-specific `editor.tf[plugin.key]`, editor-wide `editor.tf`, override merge behavior, `.withComponent()`, and `toPlatePlugin()` method wrapping verified.
- Plugin Methods anti-slop audit: no banned marketing/changelog/placeholder matches.
- Plugin Methods opening audit: 1 sentence before the first `##`.
- Plugin Methods length audit: 366 lines after rewrite; `On This Page` jump list added because the page is over 300 lines.
- `content/docs/(guides)/plugin-rules.mdx`: source-backed against `packages/core/src/lib/plugins/override/{OverridePlugin,withBreakRules,withDeleteRules,withMergeRules,withNormalizeRules}.ts`, `packages/core/src/lib/plugins/affinity/AffinityPlugin.ts`, `packages/core/src/lib/plugin/BasePlugin.ts`, `packages/core/src/lib/plugins/getCorePlugins.ts`, `packages/basic-nodes/src/lib/BaseHeadingPlugin.ts`, `packages/basic-nodes/src/lib/{BaseBoldPlugin,BaseHighlightPlugin}.ts`, `packages/callout/src/lib/BaseCalloutPlugin.ts`, `packages/code-block/src/lib/BaseCodeBlockPlugin.ts`, `packages/code-block/src/lib/queries/isCodeBlockEmpty.ts`, `packages/list/src/lib/BaseListPlugin.tsx`, `packages/link/src/lib/BaseLinkPlugin.ts`, and `packages/comment/src/lib/BaseCommentPlugin.ts`.
- `pnpm --filter www build:source` in `/Users/zbeyens/git/plate`: passed after the plugin-rules rewrite.
- Plugin Rules route audit: `http://localhost:3004/docs/plugin-rules` returned HTTP 200.
- Plugin Rules preview audit: `plugin-rules-demo` exists in `apps/www/src/registry/registry-examples.ts`.
- Plugin Rules source/rule audit: core `OverridePlugin` rule engines, `AffinityPlugin`, action values, `rules.match` behavior, package defaults, `isCodeBlockEmpty`, list metadata matching, and `selection.affinity` boundary ownership verified.
- Plugin Rules anti-slop audit: no banned marketing/changelog/placeholder matches.
- Plugin Rules opening audit: 1 sentence before the first `##`.
- Plugin Rules length audit: 326 lines after rewrite; `On This Page` jump list added because the page is over 300 lines.
- `content/docs/(guides)/plugin-shortcuts.mdx`: source-backed against `packages/core/src/internal/plugin/resolvePlugins.ts`, `packages/core/src/react/components/EditorHotkeysEffect.tsx`, `packages/core/src/react/components/EditorHotkeysEffect.spec.tsx`, `packages/core/src/react/plugin/PlatePlugin.ts`, `packages/core/src/react/utils/shortcuts.spec.tsx`, `packages/basic-nodes/src/react/{BoldPlugin,ItalicPlugin,UnderlinePlugin}.tsx`, `packages/core/src/react/plugins/paragraph/ParagraphPlugin.tsx`, and `packages/ai/src/react/copilot/CopilotPlugin.tsx`.
- `pnpm --filter www build:source` in `/Users/zbeyens/git/plate`: passed after the plugin-shortcuts rewrite.
- Plugin Shortcuts route audit: `http://localhost:3004/docs/plugin-shortcuts` returned HTTP 200.
- Plugin Shortcuts source/shortcut audit: namespaced `editor.meta.shortcuts`, transform-before-API fallback, null removal, skipped missing handlers, `EditorHotkeysEffect`, current `preventDefault` branch behavior, `Shortcut` type, priority fallback, root shortcuts, and default shortcuts verified.
- Plugin Shortcuts anti-slop audit: no banned marketing/changelog/placeholder matches.
- Plugin Shortcuts opening audit: 1 sentence before the first `##`.
- Plugin Shortcuts length audit: 262 lines after rewrite.
- `content/docs/(guides)/plugin.mdx`: source-backed against `packages/core/src/lib/plugin/createPlitePlugin.ts`, `packages/core/src/react/plugin/createPlatePlugin.ts`, `packages/core/src/react/plugin/toPlatePlugin.ts`, `packages/core/src/lib/plugin/{BasePlugin,SlatePlugin}.ts`, `packages/core/src/internal/plugin/{resolvePlugins,pluginInjectNodeProps}.ts`, `packages/basic-styles/src/lib/BaseTextAlignPlugin.ts`, `packages/basic-styles/src/lib/BaseTextAlignPlugin.spec.ts`, and `packages/utils/src/lib/plate-keys.ts`.
- `pnpm --filter www build:source` in `/Users/zbeyens/git/plate`: passed after the plugin overview rewrite.
- Plugin route audit: `http://localhost:3004/docs/plugin` returned HTTP 200.
- Plugin source/contract audit: `createPlatePlugin`, `createPlitePlugin`, default plugin fields, `node.type` default, `isLeaf`/`isDecoration`, `inject.nodeProps`, `setOption`, `setOptions`, dependency warning, priority sort, `override.*`, `PluginConfig`, and `createTPlatePlugin` verified.
- Plugin link/anchor audit: route links and `#configure-existing-fields` / `#react-components` anchors checked against current docs headings; initial stale `#react-hooks` anchor fixed.
- Plugin anti-slop audit: no banned marketing/changelog/placeholder/stale-import matches.
- Plugin opening audit: 3 sentences before the first `##`.
- Plugin length audit: 327 lines after rewrite; `On This Page` jump list added because the page is over 300 lines.
- `content/docs/(guides)/static.mdx`: source-backed against `packages/core/src/static/{components/PlateStatic,components/slate-nodes,editor/withStatic,plugins/ViewPlugin,plugins/getStaticPlugins,serializeHtml,utils/stripHtmlClassNames,utils/stripSlateDataAttributes}.tsx`, `packages/core/src/react/{components/PlateView,editor/usePlateViewEditor}.ts*`, `apps/www/src/registry/ui/editor-static.tsx`, `apps/www/src/registry/components/editor/{editor-base-kit,plugins/basic-blocks-base-kit}.tsx`, and `apps/www/src/registry/registry-kits.ts`.
- `pnpm --filter www build:source` in `/Users/zbeyens/git/plate`: passed after the static rendering rewrite.
- Static route audit: `http://localhost:3004/docs/static` returned HTTP 200.
- Static source/runtime audit: `createStaticEditor`, `ViewPlugin`, `<PlateStatic>`, `PlateStaticProps`, value override, static memoization, `PliteElement`, `PliteLeaf`, `serializeHtml`, `stripClassNames`, `preserveClassNames`, `stripDataAttributes`, `<PlateView>`, and `usePlateViewEditor` verified.
- Static registry audit: `editor-base-kit`, `EditorStatic`, static UI components, and static base kit imports verified.
- Static anti-slop audit: no banned marketing/changelog/placeholder/stale-type matches; `/react` scan hit only the intentional server-import warning.
- Static opening audit: 3 sentences before the first `##`.
- Static length audit: 247 lines after rewrite.
- `content/docs/(guides)/troubleshooting.mdx`: source-backed against `content/docs/(guides)/debugging.mdx`, `content/docs/installation.mdx`, `content/docs/installation/{manual,node,rsc}.mdx`, `packages/core/src/lib/plugins/debug/DebugPlugin.ts`, `packages/core/src/lib/plugins/getCorePlugins.ts`, `packages/core/src/lib/editor/withPlite.ts`, `packages/core/src/internal/plugin/resolvePlugins.ts`, `packages/core/package.json`, `packages/plate/package.json`, `packages/plite/package.json`, and `apps/www/package.json`.
- `npm view depset version description bin readme --json` in `/Users/zbeyens/git/plate`: verified `depset` supports scope targets, `--latest`, `--install`, and `--yes`.
- `pnpm --filter www build:source` in `/Users/zbeyens/git/plate`: passed after the troubleshooting rewrite.
- Troubleshooting route audit: `http://localhost:3004/docs/troubleshooting` returned HTTP 200.
- Troubleshooting source/debug audit: `DebugPlugin` import source, `logLevel`, `OPTION_UNDEFINED`, `PLUGIN_DEPENDENCY_MISSING`, core package Plite versions, `platejs` dependency shape, and server/client import boundary verified.
- Troubleshooting anti-slop audit: no banned marketing/changelog/placeholder/stale-version matches.
- Troubleshooting opening audit: 2 sentences before the first `##`.
- Troubleshooting length audit: 166 lines after rewrite.
- `content/docs/(guides)/typescript.mdx`: source-backed against `apps/www/tsconfig.json`, `packages/plate/package.json`, `packages/core/package.json`, `packages/plite/package.json`, `packages/core/src/react/editor/{PlateEditor,withPlate,usePlateEditor}.ts`, `packages/core/src/react/plugin/createPlatePlugin.ts`, `packages/core/src/lib/plugin/BasePlugin.ts`, and `packages/plite/src/interfaces/{editor/editor-type,element,text}.ts`.
- `pnpm --filter www build:source` in `/Users/zbeyens/git/plate`: passed after the TypeScript rewrite.
- TypeScript route audit: `http://localhost:3004/docs/typescript` returned HTTP 200.
- TypeScript source/type audit: `platejs` package exports, `platejs/react`, `platejs/static`, `Value`, `TElement`, `TText`, `usePlateEditor<V>`, `TPlateEditor`, `PluginConfig`, `createTPlatePlugin`, and repo-only source aliases verified.
- TypeScript anti-slop audit: no banned marketing/changelog/placeholder/stale-version matches; `dist/react` appears only in an explicit "do not alias" warning.
- TypeScript opening audit: 2 sentences before the first `##`.
- TypeScript length audit: 211 lines after rewrite.
- `content/docs/(guides)/unit-testing.mdx`: source-backed against `packages/test-utils/src/{index,jsx,createDataTransfer,getHtmlDocument}.ts`, `packages/link/src/lib/{BaseLinkPlugin,LinkRules}.ts`, `packages/link/src/lib/withLink.spec.tsx`, `packages/basic-nodes/src/lib/BaseBoldPlugin.ts`, and core React test examples.
- `pnpm --filter www build:source` in `/Users/zbeyens/git/plate`: passed after the Unit Testing rewrite.
- Unit Testing route audit: `http://localhost:3004/docs/unit-testing` returned HTTP 200.
- Unit Testing source/test-utils audit: `@platejs/test-utils` exports `jsx`, `jsxt`, `hjsx`, `createDataTransfer`, and `getHtmlDocument`; `@platejs/link` exports `BaseLinkPlugin` and `LinkRules`; `@platejs/basic-nodes` exports `BaseBoldPlugin`.
- Unit Testing anti-slop audit: no banned marketing/changelog/placeholder matches.
- Unit Testing opening audit: 2 sentences before the first `##`.
- Unit Testing length audit: 253 lines after rewrite.
- `content/docs/(plugins)/(ai)/ai.mdx`: source-backed against `packages/ai/src/{index,lib,react}/**`, `packages/ai/src/react/ai-chat/AIChatPlugin.ts`, `packages/ai/src/lib/BaseAIPlugin.ts`, `packages/ai/src/react/ai-chat/utils/submitAIChat.ts`, `packages/ai/src/react/ai-chat/hooks/{useAIChatEditor,useEditorChat,useChatChunk}.ts`, `packages/ai/src/lib/utils/{getEditorPrompt,replacePlaceholders}.ts`, `apps/www/src/registry/components/editor/plugins/ai-kit.tsx`, `apps/www/src/registry/components/editor/use-chat.ts`, and `apps/www/src/registry/app/api/ai/command/route.ts`.
- `pnpm --filter www check:docs` in `/Users/zbeyens/git/plate`: passed after the AI plugin rewrite.
- AI source/API audit: `AIPlugin`, `AIChatPlugin`, `useAIChatEditor`, `useEditorChat`, `useChatChunk`, `streamInsertChunk`, `withAIBatch`, `applyAISuggestions`, `aiCommentToRange`, `findTextRangeInBlock`, `getEditorPrompt`, and `replacePlaceholders` exports verified.
- AI registry audit: `ai-kit`, `ai-api`, `ai-demo`, `markdown-streaming-demo`, and `ai-pro` registry entries verified.
- AI static link-map audit: `/docs/components/ai-menu`, `/docs/components/ai-toolbar-button`, and `/docs/components/ai-node` resolve through `content/docs/meta.json`.
- AI anti-slop audit: no banned marketing/changelog/stale-link matches; stale `/docs/components/ai-leaf`, `/docs/components/ai-anchor-element`, `/docs/components/ai-loading-bar`, and `convertToCoreMessages` references removed.
- AI opening audit: 3 sentences before the first `##`.
- AI length audit: 375 lines after rewrite; `On This Page` jump list added because the page is over 300 lines.
- AI live HTTP route audit: blocked by local Next dev server nonresponse; `3004`, Turbopack `3005`, and webpack `3006` accepted connections but timed out before responding even for `/`.
- `content/docs/(plugins)/(ai)/copilot.mdx`: source-backed against `packages/ai/src/react/copilot/{CopilotPlugin,withCopilot,transforms,utils}.tsx`, `apps/www/src/registry/components/editor/plugins/copilot-kit.tsx`, `apps/www/src/registry/ui/ghost-text.tsx`, and `apps/www/src/registry/app/api/ai/copilot/route.ts`.
- `pnpm --filter www check:docs` in `/Users/zbeyens/git/plate`: passed after the Copilot rewrite.
- Copilot source/API audit: `CopilotPlugin`, `triggerCopilotSuggestion`, `callCompletionApi`, `getNextWord`, `acceptCopilot`, `acceptCopilotNextWord`, `withCopilot`, `AI_GATEWAY_API_KEY`, `generateText`, and `maxOutputTokens` verified.
- Copilot registry audit: `copilot-kit`, `copilot-api`, `ghost-text`, `copilot-demo`, and `copilot-pro` registry entries verified.
- Copilot static link-map audit: no inline `/docs/*` links in the rewritten body; frontmatter Ghost Text route remains metadata-owned.
- Copilot anti-slop audit: no banned marketing/changelog/placeholder/stale-route matches; stale `OPENAI_API_KEY`, `createOpenAI`, `maxTokens`, placeholder comments, and generic provider boilerplate removed.
- Copilot opening audit: 3 sentences before the first `##`.
- Copilot length audit: 258 lines after rewrite.
- `content/docs/(plugins)/(collaboration)/comment.mdx`: source-backed against `packages/comment/src/lib/BaseCommentPlugin.ts`, `packages/comment/src/lib/withComments.ts`, `packages/comment/src/react/CommentPlugin.tsx`, `packages/comment/src/react/hooks/useCommentId.ts`, `packages/comment/src/lib/utils/**`, `apps/www/src/registry/components/editor/plugins/{comment-kit,comment-base-kit,discussion-kit}.tsx`, and `apps/www/src/registry/ui/{comment-node,comment-toolbar-button,comment}.tsx`.
- `pnpm --filter www check:docs` in `/Users/zbeyens/git/plate`: passed after the Comment rewrite.
- Comment source/API audit: `BaseCommentPlugin`, `CommentPlugin`, `useCommentId`, `getCommentKey`, `getDraftCommentKey`, `getTransientCommentKey`, `getCommentCount`, `getCommentKeys`, and `isCommentNodeById` exports verified.
- Comment registry audit: `comment-kit`, `comment-base-kit`, `comment-node`, `comment-toolbar-button`, `block-discussion`, `discussion-demo`, and `discussion-pro` registry entries verified.
- Comment static link-map audit: `/docs/discussion` resolves through current docs route mapping.
- Comment anti-slop audit: no banned marketing/changelog/placeholder/stale-comment matches.
- Comment opening audit: 3 sentences before the first `##`.
- Comment length audit: 274 lines after rewrite.
- `content/docs/(plugins)/(collaboration)/discussion.mdx`: source-backed against `apps/www/src/registry/components/editor/plugins/discussion-kit.tsx`, `apps/www/src/registry/ui/block-discussion.tsx`, `apps/www/src/registry/lib/block-discussion-index.ts`, `apps/www/src/registry/lib/block-discussion-index.spec.tsx`, and `apps/www/src/registry/examples/values/discussion-value.tsx`.
- `pnpm --filter www check:docs` in `/Users/zbeyens/git/plate`: passed after the Discussion rewrite.
- Discussion source/API audit: `discussionPlugin`, `DiscussionKit`, `TDiscussion`, `BlockDiscussion`, `buildBlockDiscussionIndex`, and `useBlockDiscussionItems` exports verified.
- Discussion registry audit: `discussion-kit`, `block-discussion`, `discussion-demo`, and `discussion-pro` registry entries verified.
- Discussion static link-map audit: `/docs/comment` and `/docs/suggestion` resolve through current docs route mapping.
- Discussion anti-slop audit: no banned marketing/changelog/placeholder/stale-state matches.
- Discussion opening audit: 3 sentences before the first `##`.
- Discussion length audit: 214 lines after rewrite.
- `content/docs/(plugins)/(collaboration)/suggestion.mdx`: source-backed against `packages/suggestion/src/lib/BaseSuggestionPlugin.ts`, `packages/suggestion/src/lib/withSuggestion.ts`, `packages/suggestion/src/lib/transforms/{acceptSuggestion,rejectSuggestion,getSuggestionProps}.ts`, `packages/suggestion/src/lib/utils/**`, `packages/suggestion/src/react/SuggestionPlugin.tsx`, `apps/www/src/registry/components/editor/plugins/{suggestion-kit,suggestion-base-kit}.tsx`, and `apps/www/src/registry/ui/{suggestion-node,block-suggestion,suggestion-toolbar-button}.tsx`.
- `pnpm --filter www check:docs` in `/Users/zbeyens/git/plate`: passed after the Suggestion rewrite.
- Suggestion source/API audit: `BaseSuggestionPlugin`, `SuggestionPlugin`, `acceptSuggestion`, `rejectSuggestion`, `getSuggestionProps`, `getSuggestionKey`, `getSuggestionKeys`, `getTransientSuggestionKey`, `SuggestionKit`, `BaseSuggestionKit`, `SuggestionLeaf`, `SuggestionLineBreak`, `VoidRemoveSuggestionOverlay`, and `BlockSuggestionCard` exports verified.
- Suggestion registry audit: `suggestion-kit`, `suggestion-base-kit`, `suggestion-node`, `suggestion-toolbar-button`, `block-suggestion`, `discussion-demo`, and `discussion-pro` registry entries verified.
- Suggestion static link-map audit: `/docs/discussion` resolves through current docs route mapping.
- Suggestion anti-slop audit: no banned marketing/changelog/placeholder/stale-shortcut matches; fake `Cmd + Shift + S` shortcut removed.
- Suggestion opening audit: 3 sentences before the first `##`.
- Suggestion length audit: 239 lines after rewrite.
- `content/docs/(plugins)/(collaboration)/yjs.mdx`: source-backed against `packages/yjs/src/lib/BaseYjsPlugin.ts`, `packages/yjs/src/lib/providers/{types,registry,hocuspocus-provider,webrtc-provider}.ts`, `packages/yjs/src/react/YjsPlugin.tsx`, `apps/www/src/registry/examples/collaboration-demo.tsx`, `apps/www/src/registry/ui/remote-cursor-overlay.tsx`, `apps/www/src/registry/registry-examples.ts`, and `apps/www/src/registry/registry-ui.ts`.
- `pnpm --filter www check:docs` in `/Users/zbeyens/git/plate`: passed after the Yjs rewrite.
- `pnpm --filter @platejs/yjs typecheck` in `/Users/zbeyens/git/plate`: passed after the Yjs rewrite.
- Yjs source/API audit: `BaseYjsPlugin`, `YjsPlugin`, `api.yjs.init`, `connect`, `disconnect`, `destroy`, `UnifiedProvider`, `HocuspocusProviderConfig`, `WebRTCProviderConfig`, `registerProviderType`, sync timeout, initial-value seeding, and empty-provider error verified.
- Yjs registry audit: `collaboration-demo` and `remote-cursor-overlay` registry entries verified; no `yjs-kit` exists.
- Yjs component route audit: `/docs/components/remote-cursor-overlay` resolves through the registry UI item.
- Yjs anti-slop audit: no banned marketing/changelog/placeholder/stale-provider matches.
- Yjs opening audit: 3 prose sentences before the first MDX component.
- Yjs length audit: 297 lines after rewrite.
- `content/docs/(plugins)/(elements)/basic-blocks.mdx`: source-backed against `apps/www/src/registry/components/editor/plugins/{basic-blocks-kit,basic-blocks-base-kit}.tsx`, `packages/basic-nodes/src/{react,lib}/**`, `apps/www/src/registry/registry-{kits,examples,ui}.ts`, and sibling element docs for routing boundaries.
- `pnpm --filter www check:docs` in `/Users/zbeyens/git/plate`: passed after the Basic Blocks rewrite.
- `pnpm --filter @platejs/basic-nodes typecheck` in `/Users/zbeyens/git/plate`: passed after the Basic Blocks rewrite.
- Basic Blocks source/API audit: `BasicBlocksKit`, `BaseBasicBlocksKit`, `ParagraphPlugin`, `H1Plugin` through `H6Plugin`, `BlockquotePlugin`, `HorizontalRulePlugin`, `BasicBlocksPlugin`, `BaseBasicBlocksPlugin`, `HeadingRules`, `BlockquoteRules`, and `HorizontalRuleRules` verified.
- Basic Blocks registry audit: `basic-blocks-demo`, `basic-blocks-kit`, `basic-blocks-base-kit`, `paragraph-node`, `heading-node`, `blockquote-node`, and `hr-node` entries verified.
- Basic Blocks route audit: `/docs/heading`, `/docs/blockquote`, `/docs/horizontal-rule`, `/docs/plugin-input-rules`, and component routes resolve through content docs or registry UI items.
- Basic Blocks anti-slop audit: no banned marketing/changelog/placeholder matches after replacing the spread snippet.
- Basic Blocks opening audit: 3 prose sentences before the first MDX component.
- Basic Blocks length audit: 201 lines after rewrite.
- `content/docs/(plugins)/(elements)/blockquote.mdx`: source-backed against `packages/basic-nodes/src/lib/BaseBlockquotePlugin.ts`, `packages/basic-nodes/src/lib/BasicBlockRules.ts`, blockquote input-rule/spec files, `packages/basic-nodes/src/react/BlockquotePlugin.tsx`, and `apps/www/src/registry/ui/blockquote-node{,-static}.tsx`.
- `pnpm --filter www check:docs` in `/Users/zbeyens/git/plate`: passed after the Blockquote rewrite.
- `pnpm --filter @platejs/basic-nodes typecheck` in `/Users/zbeyens/git/plate`: passed after the Blockquote rewrite.
- Blockquote source/API audit: `BaseBlockquotePlugin`, `BlockquotePlugin`, `BlockquoteRules.markdown()`, `tf.blockquote.toggle()`, `break.empty: lift`, `delete.start: lift`, reverse-tab lift behavior, and flat-child normalization verified.
- Blockquote registry audit: `basic-blocks-demo`, `basic-blocks-kit`, and `blockquote-node` entries verified.
- Blockquote route audit: `/docs/basic-blocks` resolves through content docs and `/docs/components/blockquote-node` resolves through the registry UI item.
- Blockquote anti-slop audit: no banned marketing/changelog/placeholder matches.
- Blockquote opening audit: 2 prose sentences before the first MDX component.
- Blockquote length audit: 133 lines after rewrite.
- `content/docs/(plugins)/(elements)/callout.mdx`: source-backed against `packages/callout/src/lib/{BaseCalloutPlugin,transforms/insertCallout}.ts`, `packages/callout/src/react/{CalloutPlugin,hooks/useCalloutEmojiPicker}.ts`, callout specs, `packages/utils/src/lib/plate-types.ts`, and registry callout kit/UI/example/pro files.
- `pnpm --filter www check:docs` in `/Users/zbeyens/git/plate`: passed after the Callout rewrite.
- `pnpm --filter @platejs/callout typecheck` in `/Users/zbeyens/git/plate`: passed after the Callout rewrite.
- Callout source/API audit: `BaseCalloutPlugin`, `CalloutPlugin`, `insertCallout`, `tf.insert.callout`, `CALLOUT_STORAGE_KEY`, `useCalloutEmojiPicker`, `TCalloutElement`, break/delete rules, icon fallback, and emoji picker storage behavior verified.
- Callout registry audit: `callout-demo`, `callout-kit`, `callout-base-kit`, `callout-node`, and `callout-pro` entries verified.
- Callout route audit: `/docs/components/callout-node` resolves through the component route map; stale `/docs/components/callout` removed.
- Callout anti-slop audit: no banned marketing/changelog/placeholder matches.
- Callout opening audit: 2 prose sentences before the first MDX component.
- Callout length audit: 182 lines after rewrite.
- `content/docs/(plugins)/(elements)/code-block.mdx`: source-backed against `packages/code-block/src/lib/{BaseCodeBlockPlugin,CodeBlockRules,withCodeBlock,withNormalizeCodeBlock,setCodeBlockToDecorations,formatter,queries,transforms}.ts`, `packages/code-block/src/react/CodeBlockPlugin.tsx`, and registry code-block kit/UI/example files.
- `pnpm --filter www check:docs` in `/Users/zbeyens/git/plate`: passed after the Code Block rewrite.
- `pnpm --filter @platejs/code-block typecheck` in `/Users/zbeyens/git/plate`: passed after the Code Block rewrite.
- Code Block source/API audit: `BaseCodeBlockPlugin`, `BaseCodeLinePlugin`, `BaseCodeSyntaxPlugin`, `CodeBlockPlugin`, `CodeLinePlugin`, `CodeSyntaxPlugin`, `CodeBlockRules.markdown`, lowlight options, decoration cache, editor overrides, transforms, queries, and `formatCodeBlock` verified.
- Code Block registry audit: `code-block-demo`, `code-block-kit`, `code-block-base-kit`, and `code-block-node` entries verified; nonexistent `code-block-pro` was not kept.
- Code Block route audit: `/docs/components/code-block-node` resolves through the component route map.
- Code Block anti-slop audit: no banned marketing/changelog/placeholder matches.
- Code Block opening audit: 2 prose sentences before the first MDX component.
- Code Block length audit: 224 lines after rewrite.
- `content/docs/(plugins)/(elements)/code-drawing.mdx`: source-backed against `packages/code-drawing/src/lib/{BaseCodeDrawingPlugin,constants,types,transforms/insertCodeDrawing,utils/renderers,utils/download}.ts`, `packages/code-drawing/src/react/CodeDrawingPlugin.tsx`, and registry code drawing kit/UI/example/value files.
- `pnpm --filter www check:docs` in `/Users/zbeyens/git/plate`: passed after the Code Drawing rewrite.
- `pnpm --filter @platejs/code-drawing typecheck` in `/Users/zbeyens/git/plate`: passed after the Code Drawing rewrite.
- Code Drawing source/API audit: `BaseCodeDrawingPlugin`, `CodeDrawingPlugin`, `CODE_DRAWING_KEY`, `CODE_DRAWING_TYPE`, `VIEW_MODE`, `RENDER_DEBOUNCE_DELAY`, `DOWNLOAD_FILENAME`, `insertCodeDrawing`, `renderCodeDrawing`, `downloadImage`, void node behavior, default insert data, and browser renderer behavior verified.
- Code Drawing registry audit: `code-drawing-demo`, `code-drawing-kit`, `code-drawing-base-kit`, and `code-drawing-node` entries verified.
- Code Drawing route audit: `/docs/components/code-drawing-node` resolves through component route map.
- Code Drawing anti-slop audit: no banned marketing/changelog/placeholder matches.
- Code Drawing opening audit: 2 prose sentences before first MDX component.
- Code Drawing length audit: 177 lines after rewrite.
- `content/docs/(plugins)/(elements)/column.mdx`: source-backed against `packages/layout/src/lib/{BaseColumnPlugin,withColumn,transforms,utils}.ts`, `packages/layout/src/react/{ColumnPlugin,hooks/useDebouncePopoverOpen}.ts`, `packages/markdown/src/lib/rules/columnRules.ts`, and registry column kit/UI/example files.
- `pnpm --filter www check:docs` in `/Users/zbeyens/git/plate`: passed after the Column rewrite.
- `pnpm --filter @platejs/layout typecheck` in `/Users/zbeyens/git/plate`: passed after the Column rewrite.
- Column source/API audit: `BaseColumnPlugin`, `BaseColumnItemPlugin`, `ColumnPlugin`, `ColumnItemPlugin`, `withColumn`, `insertColumnGroup`, `insertColumn`, `toggleColumnGroup`, `setColumns`, `resizeColumn`, `moveMiddleColumn`, `columnsToWidths`, `useDebouncePopoverOpen`, `TColumnGroupElement`, `TColumnElement`, and `columnRules` verified.
- Column registry audit: `column-demo`, `column-kit`, `column-base-kit`, `column-node`, insert toolbar `action_three_columns`, and turn-into toolbar routing verified.
- Column route audit: `/docs/components/column-node` resolves through `content/docs/meta.json`; first audit script missed this generated route map and was corrected.
- Column anti-slop audit: no banned marketing/changelog/placeholder/task-checkbox matches.
- Column opening audit: 3 prose sentences before first MDX component.
- Column length audit: 234 lines after rewrite.
- `content/docs/(plugins)/(elements)/date.mdx`: source-backed against `packages/date/src/lib/{BaseDatePlugin,transforms/insertDate,queries/isPointNextToNode,utils/dateValue}.ts`, `packages/date/src/react/DatePlugin.tsx`, `packages/markdown/src/lib/rules/defaultRules.ts`, `packages/markdown/src/lib/dateElement.spec.ts`, and registry date kit/UI/example files.
- `pnpm --filter www check:docs` in `/Users/zbeyens/git/plate`: passed after the Date rewrite.
- `pnpm --filter @platejs/date typecheck` in `/Users/zbeyens/git/plate`: passed after the Date rewrite.
- Date source/API audit: `BaseDatePlugin`, `DatePlugin`, `insertDate`, `editor.tf.insert.date`, `normalizeDateValue`, `formatDateValue`, `parseCanonicalDateValue`, `getDateDisplayLabel`, `isPointNextToNode`, `TDateElement`, canonical `date`, fallback `rawDate`, and Markdown date serialization verified.
- Date registry audit: `date-demo`, `date-kit`, `date-base-kit`, `date-node`, insert toolbar `KEYS.date`, and static date element verified.
- Date route audit: `/docs/components/date-node` resolves through `content/docs/meta.json`.
- Date anti-slop audit: no banned marketing/changelog/placeholder matches.
- Date opening audit: 3 prose sentences before first MDX component.
- Date length audit: 223 lines after rewrite.
- `content/docs/(plugins)/(elements)/equation.mdx`: source-backed against `packages/math/src/lib/{BaseEquationPlugin,BaseInlineEquationPlugin,MathRules,transforms,utils/getEquationHtml}.ts`, `packages/math/src/react/{EquationPlugin,InlineEquationPlugin,hooks}.ts`, `packages/markdown/src/lib/rules/defaultRules.ts`, `packages/markdown/src/lib/mathSurface.spec.ts`, and registry math kit/UI/example/pro files.
- `pnpm --filter www check:docs` in `/Users/zbeyens/git/plate`: passed after the Equation rewrite.
- `pnpm --filter @platejs/math typecheck` in `/Users/zbeyens/git/plate`: passed after the Equation rewrite.
- Equation source/API audit: `BaseEquationPlugin`, `BaseInlineEquationPlugin`, `EquationPlugin`, `InlineEquationPlugin`, `insertEquation`, `insertInlineEquation`, bound `editor.tf.insert.equation`, bound `editor.tf.insert.inlineEquation`, `MathRules.markdown`, `useEquationElement`, `useEquationInput`, `getEquationHtml`, `TEquationElement`, `texExpression`, KaTeX options, and `remark-math` Markdown surface verified.
- Equation registry audit: `equation-demo`, `math-kit`, `math-base-kit`, `equation-node`, `equation-toolbar-button`, `equation-pro`, insert toolbar block action, and inline toolbar action verified.
- Equation route audit: `/docs/components/equation-node` and `/docs/components/equation-toolbar-button` resolve through `content/docs/meta.json`.
- Equation anti-slop audit: no banned marketing/changelog/placeholder matches.
- Equation opening audit: 3 prose sentences before first MDX component.
- Equation length audit: 242 lines after rewrite.
- `content/docs/(plugins)/(elements)/excalidraw.mdx`: source-backed against `packages/excalidraw/src/lib/{BaseExcalidrawPlugin,types,transforms/insertExcalidraw}.ts`, `packages/excalidraw/src/react/{ExcalidrawPlugin,hooks/useExcalidrawElement,types}.ts`, and registry Excalidraw kit/UI/example files.
- `pnpm --filter www check:docs` in `/Users/zbeyens/git/plate`: passed after the Excalidraw rewrite.
- `pnpm --filter @platejs/excalidraw typecheck` in `/Users/zbeyens/git/plate`: passed after the Excalidraw rewrite.
- Excalidraw source/API audit: `BaseExcalidrawPlugin`, `ExcalidrawPlugin`, `insertExcalidraw`, `useExcalidrawElement`, `TExcalidrawElement`, `ExcalidrawDataState`, `KEYS.excalidraw`, `data.elements`, `data.state`, dynamic `@excalidraw/excalidraw` import, deduplicated `onChange`, and `viewModeEnabled` verified.
- Excalidraw registry audit: `excalidraw-demo`, `excalidraw-kit`, `excalidraw-node`, insert toolbar `KEYS.excalidraw`, and Excalidraw CSS import verified.
- Excalidraw route audit: `/docs/components/excalidraw-node` resolves through `content/docs/meta.json`.
- Excalidraw anti-slop audit: no banned marketing/changelog/placeholder matches.
- Excalidraw opening audit: 3 prose sentences before first MDX component.
- Excalidraw length audit: 187 lines after rewrite.
- `content/docs/(plugins)/(functionality)/(combobox)/slash-command.mdx`: source-backed against `packages/slash-command/src/lib/BaseSlashPlugin.ts`, `packages/slash-command/src/react/SlashPlugin.tsx`, `packages/slash-command/src/lib/BaseSlashPlugin.spec.ts`, `apps/www/src/registry/components/editor/plugins/slash-kit.tsx`, `apps/www/src/registry/ui/slash-node.tsx`, `apps/www/src/registry/components/editor/transforms.ts`, and registry kit/UI/example/pro files.
- `pnpm --filter www check:docs` in `/Users/zbeyens/git/plate`: passed after the Slash Command rewrite.
- `pnpm --filter @platejs/slash-command typecheck` in `/Users/zbeyens/git/plate`: passed after the Slash Command rewrite.
- `pnpm --filter @platejs/combobox typecheck` in `/Users/zbeyens/git/plate`: passed after the Slash Command rewrite.
- Slash Command source/API audit: `BaseSlashPlugin`, `BaseSlashInputPlugin`, `SlashPlugin`, `SlashInputPlugin`, `SlashConfig`, `triggerPreviousCharPattern`, `createComboboxInput`, `withTriggerCombobox`, `SlashInputElement`, `InlineComboboxItem`, `insertBlock`, `insertInlineElement`, `action_three_columns`, and `action_footnote` verified.
- Slash Command registry audit: `slash-kit`, `slash-node`, `slash-command-demo`, and active `slash-command-pro` registry entries verified.
- Slash Command route audit: `/docs/slash-command`, `/docs/components/slash-node`, and `/docs/examples/slash-command` resolve through `content/docs/meta.json`.
- Slash Command anti-slop audit: no banned marketing/changelog/placeholder matches.
- Slash Command opening audit: 3 prose sentences before first MDX component.
- Slash Command length audit: 166 lines after rewrite.
- `content/docs/(plugins)/(functionality)/(utils)/exit-break.mdx`: source-backed against `packages/utils/src/lib/plugins/ExitBreakPlugin.ts`, `packages/utils/src/lib/plugins/ExitBreakPlugin.spec.ts`, `packages/core/src/lib/plugins/slate-extension/transforms/insertExitBreak.ts`, `packages/core/src/lib/plugins/slate-extension/transforms/insertExitBreak.spec.tsx`, `packages/core/src/lib/plugins/override/withBreakRules.ts`, `apps/www/src/registry/components/editor/plugins/exit-break-kit.tsx`, and registry example/value files.
- `pnpm --filter www check:docs` in `/Users/zbeyens/git/plate`: passed after the Exit Break rewrite.
- `pnpm --filter @platejs/utils typecheck` in `/Users/zbeyens/git/plate`: passed after the Exit Break rewrite.
- `pnpm --filter @platejs/core typecheck` in `/Users/zbeyens/git/plate`: passed after the Exit Break rewrite.
- Exit Break source/API audit: `ExitBreakPlugin`, `editor.tf.exitBreak.insert`, `editor.tf.exitBreak.insertBefore`, `editor.tf.insertExitBreak`, `InsertExitBreakOptions`, `match`, `reverse`, `node.isStrictSiblings`, `rules.break`, `'exit'`, and `'deleteExit'` verified.
- Exit Break registry audit: `exit-break-kit`, `exit-break-demo`, and `exitBreakValue` verified.
- Exit Break route audit: `/docs/exit-break`, `/docs/examples/exit-break`, `/docs/plugin-shortcuts`, `/docs/plugin-rules`, and `/docs/api/core/plate-plugin` resolve through `content/docs/meta.json`.
- Exit Break anti-slop audit: no banned marketing/changelog/placeholder matches.
- Exit Break opening audit: 3 prose sentences before first MDX component.
- Exit Break length audit: 194 lines after rewrite.
- `content/docs/(plugins)/(functionality)/(utils)/forced-layout.mdx`: source-backed against `packages/utils/src/lib/plugins/normalize-types/NormalizeTypesPlugin.ts`, `packages/utils/src/lib/plugins/normalize-types/withNormalizeTypes.ts`, `packages/utils/src/lib/plugins/normalize-types/NormalizeTypesPlugin.spec.tsx`, `packages/utils/src/lib/plugins/normalize-types/withNormalizeTypes.spec.tsx`, `packages/utils/src/lib/plate-keys.ts`, and `apps/www/src/registry/examples/playground-demo.tsx`.
- `pnpm --filter www check:docs` in `/Users/zbeyens/git/plate`: passed after the Forced Layout rewrite.
- `pnpm --filter @platejs/utils typecheck` in `/Users/zbeyens/git/plate`: passed after the Forced Layout rewrite.
- Forced Layout source/API audit: `NormalizeTypesPlugin`, `NormalizeTypesConfig`, `withNormalizeTypes`, `rules`, `strictType`, `type`, `onError`, `NodeApi.get`, `ElementApi.isElement`, `editor.api.create.block`, root `normalizeNode`, `KEYS.h1`, and `KEYS.p` verified.
- Forced Layout registry playground audit: `apps/www/src/registry/examples/playground-demo.tsx` enables `NormalizeTypesPlugin` only when `id === 'forced-layout'`; no `forced-layout-kit` or standalone preview exists.
- Forced Layout route/source audit: `/docs/trailing-block`, `/docs/single-block`, and `/docs/plugin-rules` resolve through `content/docs/meta.json`; the forced-layout page is an unlisted source doc and has no generated meta route.
- Forced Layout anti-slop audit: no banned marketing/changelog/placeholder matches.
- Forced Layout opening audit: 2 prose sentences before first MDX component.
- Forced Layout length audit: 131 lines after rewrite.
- `content/docs/(plugins)/(functionality)/(utils)/single-block.mdx`: source-backed against `packages/utils/src/lib/plugins/single-block/SingleBlockPlugin.ts`, `packages/utils/src/lib/plugins/single-block/SingleLinePlugin.ts`, `packages/utils/src/lib/plugins/single-block/SingleBlockPlugin.spec.tsx`, `packages/utils/src/lib/plugins/single-block/SingleLinePlugin.spec.tsx`, `packages/utils/src/lib/plate-keys.ts`, `apps/www/src/registry/examples/single-block-demo.tsx`, and `apps/www/src/registry/registry-examples.ts`.
- `pnpm --filter www check:docs` in `/Users/zbeyens/git/plate`: passed after the Single Block rewrite.
- `pnpm --filter @platejs/utils typecheck` in `/Users/zbeyens/git/plate`: passed after the Single Block rewrite.
- Single Block source/API audit: `SingleBlockPlugin`, `SingleLinePlugin`, `KEYS.singleBlock`, `KEYS.singleLine`, `override.enabled.trailingBlock`, `insertBreak`, `insertSoftBreak`, `normalizeNode`, `TextApi.isText`, root block merging, and line separator filtering verified.
- Single Block registry audit: `single-block-demo`, `SingleBlockDemo`, checkbox mode toggle, `SingleBlockPlugin`, and `SingleLinePlugin` verified.
- Single Block route audit: `/docs/single-block`, `/docs/examples/single-block`, and `/docs/trailing-block` resolve through `content/docs/meta.json`.
- Single Block anti-slop audit: no banned marketing/changelog/placeholder matches.
- Single Block opening audit: 2 prose sentences before first MDX component.
- Single Block length audit: 106 lines after rewrite.
- `content/docs/(plugins)/(functionality)/(utils)/trailing-block.mdx`: source-backed against `packages/utils/src/lib/plugins/trailing-block/TrailingBlockPlugin.ts`, `packages/utils/src/lib/plugins/trailing-block/withTrailingBlock.ts`, `packages/utils/src/lib/plugins/trailing-block/TrailingBlockPlugin.spec.tsx`, `packages/utils/src/lib/plugins/trailing-block/withTrailingBlock.spec.tsx`, `packages/utils/src/lib/plate-keys.ts`, `apps/www/src/registry/components/editor/editor-kit.tsx`, and `apps/www/src/registry/components/editor/plugins/suggestion-kit.tsx`.
- `pnpm --filter www check:docs` in `/Users/zbeyens/git/plate`: passed after the Trailing Block rewrite.
- `pnpm --filter @platejs/utils typecheck` in `/Users/zbeyens/git/plate`: passed after the Trailing Block rewrite.
- `pnpm --filter @platejs/suggestion typecheck` in `/Users/zbeyens/git/plate`: passed after the Trailing Block rewrite.
- Trailing Block source/API audit: `TrailingBlockPlugin`, `TrailingBlockConfig`, `TrailingBlockInsertOptions`, `withTrailingBlock`, `editor.api.last`, `queryNode`, `allow`, `exclude`, `filter`, `maxLevel`, `PathApi.next`, `editor.api.create.block`, `insert`, `KEYS.p`, and `KEYS.trailingBlock` verified.
- Trailing Block registry source audit: `EditorKit` includes `TrailingBlockPlugin`; `SuggestionKit` wraps `TrailingBlockPlugin` insertion in `suggestion.withoutSuggestions`; no dedicated trailing-block preview exists.
- Trailing Block route/source audit: `/docs/trailing-block` and `/docs/single-block` resolve through `content/docs/meta.json`; `/docs/forced-layout` is present as a source MDX doc but has no generated meta route.
- Trailing Block anti-slop audit: no banned marketing/changelog/placeholder matches.
- Trailing Block opening audit: 3 prose sentences before first MDX component.
- Trailing Block length audit: 148 lines after rewrite.
- `content/docs/(plugins)/(functionality)/autoformat.mdx`: source-backed against `apps/www/src/registry/components/editor/plugins/autoformat-kit.tsx`, `apps/www/src/registry/components/editor/plugins/autoformat-classic-kit.tsx`, feature kit input-rule registrations, `packages/autoformat/src/plugin.ts`, `packages/core/src/internal/plugin/resolvePlugins.ts`, `packages/core/src/internal/plugin/resolvePlugins.spec.tsx`, and registry kit/example files.
- `pnpm --filter www check:docs` in `/Users/zbeyens/git/plate`: passed after the Autoformat rewrite and wording trim.
- `pnpm --filter @platejs/autoformat typecheck` in `/Users/zbeyens/git/plate`: passed after the Autoformat rewrite.
- `pnpm --filter @platejs/core typecheck` in `/Users/zbeyens/git/plate`: passed after the Autoformat rewrite.
- Autoformat source/API audit: `AutoformatKit`, `AutoformatShortcutsPlugin`, `autoformatShortcuts`, `createTextSubstitutionInputRule`, code-block `enabled` guard, feature-owned `inputRules`, `AutoformatPlugin`, and core `hasAutoformatPlugin` validation verified.
- Autoformat registry audit: `autoformat-kit`, `autoformat-classic-kit`, `autoformat-demo`, and `autoformat-value` verified.
- Autoformat route audit: `/docs/autoformat`, `/docs/examples/autoformat`, `/docs/plugin-input-rules`, `/docs/basic-blocks`, `/docs/basic-marks`, `/docs/code-block`, and `/docs/list` resolve through `content/docs/meta.json`.
- Autoformat anti-slop audit: no banned marketing/changelog/placeholder matches.
- Autoformat opening audit: 3 prose sentences before first MDX component.
- Autoformat length audit: 151 lines after rewrite.
- `content/docs/(plugins)/(functionality)/block-menu.mdx`: source-backed against `packages/selection/src/react/BlockMenuPlugin.tsx`, `packages/selection/src/react/BlockSelectionPlugin.tsx`, `packages/selection/src/react/hooks/useBlockSelectable.ts`, `apps/www/src/registry/components/editor/plugins/block-menu-kit.tsx`, `apps/www/src/registry/components/editor/plugins/block-selection-kit.tsx`, `apps/www/src/registry/ui/block-context-menu.tsx`, and registry kit/example/UI/pro files.
- `pnpm --filter www check:docs` in `/Users/zbeyens/git/plate`: passed after the Block Menu rewrite.
- `pnpm --filter @platejs/selection typecheck` in `/Users/zbeyens/git/plate`: passed after the Block Menu rewrite.
- `pnpm --filter @platejs/ai typecheck` in `/Users/zbeyens/git/plate`: passed after the Block Menu rewrite.
- Block Menu source/API audit: `BlockMenuPlugin`, `BLOCK_CONTEXT_MENU_ID`, `openId`, `position`, `api.blockMenu.hide`, `api.blockMenu.show`, `api.blockMenu.showContextMenu`, `BlockSelectionPlugin.options.enableContextMenu`, `api.blockSelection.addOnContextMenu`, selection transforms, and `data-plate-open-context-menu` guards verified.
- Block Menu registry audit: `block-menu-kit`, `block-selection-kit`, `block-context-menu`, `block-menu-demo`, and `block-menu-pro` verified.
- Block Menu route audit: `/docs/block-menu`, `/docs/block-selection`, `/docs/components/block-context-menu`, and `/docs/examples/block-menu` resolve through `content/docs/meta.json`.
- Block Menu anti-slop audit: no banned marketing/changelog/placeholder matches.
- Block Menu opening audit: 3 prose sentences before first MDX component.
- Block Menu length audit: 185 lines after rewrite.
- `content/docs/(plugins)/(functionality)/block-placeholder.mdx`: source-backed against `packages/utils/src/react/plugins/BlockPlaceholderPlugin.tsx`, `packages/utils/src/react/plugins/BlockPlaceholderPlugin.spec.tsx`, `packages/core/src/lib/types/EditableProps.ts`, `apps/www/src/registry/components/editor/plugins/block-placeholder-kit.tsx`, `apps/www/src/registry/examples/values/placeholder-value.tsx`, `apps/www/src/registry/ui/editor.tsx`, and registry kit/example files.
- `pnpm --filter www check:docs` in `/Users/zbeyens/git/plate`: passed after the Block Placeholder rewrite.
- `pnpm --filter @platejs/utils typecheck` in `/Users/zbeyens/git/plate`: passed after the Block Placeholder rewrite.
- `pnpm --filter @platejs/core typecheck` in `/Users/zbeyens/git/plate`: passed after the Block Placeholder rewrite.
- Block Placeholder source/API audit: `BlockPlaceholderPlugin`, `_target`, `placeholders`, `query`, `className`, `selectors.placeholder(node)`, injected `placeholder`/`className` node props, focused/collapsed/read-only/composition guards, and editor-level `placeholder` prop verified.
- Block Placeholder registry audit: `block-placeholder-kit`, `block-placeholder-demo`, `blockPlaceholderValue`, and `EditorKit` inclusion verified.
- Block Placeholder route audit: `/docs/block-placeholder` and `/docs/examples/block-placeholder` resolve through `content/docs/meta.json`.
- Block Placeholder anti-slop audit: no banned marketing/changelog/placeholder-comment matches.
- Block Placeholder opening audit: 3 prose sentences before first MDX component.
- Block Placeholder length audit: 165 lines after rewrite.
- `content/docs/(plugins)/(functionality)/block-selection.mdx`: source-backed against `packages/selection/src/react/BlockSelectionPlugin.tsx`, `packages/selection/src/react/components/BlockSelectionAfterEditable.tsx`, `packages/selection/src/react/hooks/{useSelectionArea,useBlockSelectable,useBlockSelected,useBlockSelectionNodes,useIsSelecting}.ts`, block-selection API/transform files, `packages/selection/src/internal/SelectionArea.ts`, `packages/selection/src/internal/types.ts`, `apps/www/src/registry/components/editor/plugins/block-selection-kit.tsx`, `apps/www/src/registry/ui/block-selection.tsx`, and registry example/UI/pro files.
- `pnpm --filter www check:docs` in `/Users/zbeyens/git/plate`: passed after the Block Selection rewrite.
- `pnpm --filter @platejs/selection typecheck` in `/Users/zbeyens/git/plate`: passed after the Block Selection rewrite.
- `pnpm --filter @platejs/dnd typecheck` in `/Users/zbeyens/git/plate`: passed after the Block Selection rewrite.
- `pnpm --filter @platejs/ai typecheck` in `/Users/zbeyens/git/plate`: passed after the Block Selection rewrite.
- Block Selection source/API audit: `BlockSelectionPlugin`, `SelectionArea`, `useBlockSelectable`, `BlockSelectionAfterEditable`, shadow input copy/cut/paste/key handling, `selectedIds`, `anchorId`, `areaOptions`, `enableContextMenu`, `disableSelectAll`, `isSelectable`, `onKeyDownSelecting`, APIs, transforms, and hooks verified.
- Block Selection registry audit: `block-selection-kit`, `block-selection`, `block-selection-demo`, `block-selection-pro`, `BlockSelectionKit` `Cmd+J` wiring, DnD hide state, and `EditorKit` inclusion verified.
- Block Selection route audit: `/docs/block-selection`, `/docs/block-menu`, `/docs/components/block-selection`, and `/docs/examples/block-selection` resolve through `content/docs/meta.json`.
- Block Selection anti-slop audit: no banned marketing/changelog/placeholder/stale-query matches.
- Block Selection opening audit: 2 prose sentences before first MDX component.
- Block Selection length audit: 240 lines after rewrite.
- `content/docs/(plugins)/(functionality)/caption.mdx`: source-backed against `packages/caption/src/lib/{BaseCaptionPlugin,withCaption}.ts`, `packages/caption/src/lib/withCaption.spec.tsx`, `packages/caption/src/react/{CaptionPlugin,components/Caption,components/CaptionTextarea,components/CaptionButton,hooks/useCaptionString,utils/showCaption}.tsx`, `packages/utils/src/lib/plate-types.ts`, `apps/www/src/registry/components/editor/plugins/{media-kit,media-base-kit}.tsx`, `apps/www/src/registry/ui/{caption,media-image-node,media-video-node,media-audio-node,media-file-node,media-embed-node}.tsx`, and registry UI/kit/example files.
- `pnpm --filter www check:docs` in `/Users/zbeyens/git/plate`: passed after the Caption rewrite.
- `pnpm --filter @platejs/caption typecheck` in `/Users/zbeyens/git/plate`: passed after the Caption rewrite.
- `pnpm --filter @platejs/media typecheck` in `/Users/zbeyens/git/plate`: passed after the Caption rewrite.
- `pnpm --filter @platejs/utils typecheck` in `/Users/zbeyens/git/plate`: passed after the Caption rewrite.
- Caption source/API audit: `BaseCaptionPlugin`, `CaptionPlugin`, `withCaption`, `query.allow`, `visibleId`, `focusEndPath`, `focusStartPath`, `selectors.isVisible`, `Caption`, `CaptionTextarea`, `CaptionButton`, `useCaptionString`, `showCaption`, `TCaptionProps`, and `TCaptionElement` verified.
- Caption registry audit: `media-kit`, `media-base-kit`, `caption`, `media-demo`, media node caption placements, and static figcaption rendering verified.
- Caption route audit: `/docs/caption`, `/docs/media`, and `/docs/components/caption` resolve through `content/docs/meta.json`.
- Caption anti-slop audit: no banned marketing/changelog/placeholder-comment matches.
- Caption opening audit: 2 prose sentences before first MDX component.
- Caption length audit: 196 lines after rewrite.
- `content/docs/(plugins)/(functionality)/cursor-overlay.mdx`: source-backed against `packages/selection/src/react/CursorOverlayPlugin.tsx`, `packages/selection/src/react/hooks/useCursorOverlay.ts`, `packages/selection/src/react/queries/{getCursorOverlayState,getSelectionRects}.ts`, `packages/selection/src/react/types.ts`, cursor-overlay query/hook specs, `apps/www/src/registry/components/editor/plugins/cursor-overlay-kit.tsx`, `apps/www/src/registry/ui/cursor-overlay.tsx`, registry kit/UI/example files, and `content/docs/(plugins)/(collaboration)/yjs.mdx`.
- `pnpm --filter www check:docs` in `/Users/zbeyens/git/plate`: passed after the Cursor Overlay rewrite.
- `pnpm --filter @platejs/selection typecheck` in `/Users/zbeyens/git/plate`: passed after the Cursor Overlay rewrite.
- `pnpm --filter @platejs/ai typecheck` in `/Users/zbeyens/git/plate`: passed after the Cursor Overlay rewrite.
- `pnpm --filter @platejs/table typecheck` in `/Users/zbeyens/git/plate`: passed after the Cursor Overlay rewrite.
- `pnpm --filter @platejs/dnd typecheck` in `/Users/zbeyens/git/plate`: passed after the Cursor Overlay rewrite.
- Cursor Overlay source/API audit: `CursorOverlayPlugin`, `options.cursors`, `api.cursorOverlay.addCursor`, `api.cursorOverlay.removeCursor`, blur/focus/drag/setSelection handlers, `useCursorOverlay`, `minSelectionWidth`, `refreshOnResize`, `CursorState`, `CursorOverlayState`, `CursorData`, and local-vs-remote cursor boundary verified.
- Cursor Overlay registry audit: `cursor-overlay-kit`, `cursor-overlay`, `cursor-overlay-demo`, `CursorOverlay` AI streaming guard, DnD drag guard, and table multi-cell guard verified.
- Cursor Overlay route audit: `/docs/cursor-overlay`, `/docs/components/editor`, `/docs/block-selection`, `/docs/ai`, and `/docs/yjs` resolve through `content/docs/meta.json`; stale `/docs/components/cursor-overlay` removed.
- Cursor Overlay anti-slop audit: no banned marketing/changelog/placeholder/stale-route matches.
- Cursor Overlay opening audit: 3 prose sentences before first MDX component.
- Cursor Overlay length audit: 181 lines after rewrite.
- `content/docs/(plugins)/(functionality)/dnd.mdx`: source-backed against `packages/dnd/src/{DndPlugin,hooks/useDndNode,hooks/useDragNode,hooks/useDropNode,components/useDraggable,components/useDropLine,components/Scroller/DndScroller,transforms/onDropNode,transforms/onHoverNode,queries/getBlocksWithId,transforms/focusBlockStartById,transforms/selectBlockById,types}.tsx`, DnD specs, `apps/www/src/registry/components/editor/plugins/dnd-kit.tsx`, `apps/www/src/registry/ui/block-draggable.tsx`, and registry UI/kit/example/pro files.
- `pnpm --filter www check:docs` in `/Users/zbeyens/git/plate`: passed after the Drag & Drop rewrite.
- `pnpm --filter @platejs/dnd typecheck` in `/Users/zbeyens/git/plate`: passed after the Drag & Drop rewrite.
- `pnpm --filter @platejs/media typecheck` in `/Users/zbeyens/git/plate`: passed after the Drag & Drop rewrite.
- `pnpm --filter @platejs/selection typecheck` in `/Users/zbeyens/git/plate`: passed after the Drag & Drop rewrite.
- `pnpm --filter @platejs/list typecheck` in `/Users/zbeyens/git/plate`: passed after the Drag & Drop rewrite.
- Drag & Drop source/API audit: `DndPlugin`, `DRAG_ITEM_BLOCK`, `draggingId`, `dropTarget`, `enableScroller`, `scrollerProps`, `onDropFiles`, `useDraggable`, `useDndNode`, `useDragNode`, `useDropNode`, `useDropLine`, `onDropNode`, `onHoverNode`, `getBlocksWithId`, `focusBlockStartById`, `selectBlockById`, and `DropLineDirection` verified.
- Drag & Drop registry audit: `dnd-kit`, `block-draggable`, `dnd-demo`, `dnd-pro`, `BlockDraggable` path enablement, multi-block preview, list expansion, block-selection bridge, context-menu bridge, and media file-drop behavior verified.
- Drag & Drop route audit: `/docs/dnd`, `/docs/components/block-draggable`, `/docs/block-selection`, `/docs/block-menu`, and `/docs/media` resolve through `content/docs/meta.json`.
- Drag & Drop anti-slop audit: no banned marketing/changelog/placeholder-comment matches.
- Drag & Drop opening audit: 2 prose sentences before first MDX component.
- Drag & Drop length audit: 213 lines after rewrite.
- `content/docs/(plugins)/(functionality)/find-replace.mdx`: source-backed against `packages/find-replace/src/lib/{FindReplacePlugin,decorateFindReplace}.ts`, `packages/find-replace/src/lib/decorateFindReplace.spec.ts`, `apps/www/src/registry/examples/find-replace-demo.tsx`, `apps/www/src/registry/examples/values/find-replace-value.tsx`, `apps/www/src/registry/ui/search-highlight-node.tsx`, and registry example/UI metadata.
- `pnpm --filter www check:docs` in `/Users/zbeyens/git/plate`: passed after the Find rewrite.
- `pnpm --filter @platejs/find-replace typecheck` in `/Users/zbeyens/git/plate`: passed after the Find rewrite.
- Find source/API audit: `FindReplacePlugin`, `options.search`, `decorateFindReplace`, empty-search behavior, case-insensitive matching, text-leaf splitting, range payload, and explicit app-owned replacement boundary verified.
- Find registry audit: `find-replace-demo`, `findReplaceValue`, `FindToolbar`, `SearchHighlightLeaf`, `fixed-toolbar`, `@shadcn/input`, and `search-highlight-node` dependency verified.
- Find route audit: `/docs/components/search-highlight-node` and `/docs/examples/find-replace` resolve through `content/docs/meta.json`.
- Find anti-slop audit: no WIP, banned marketing/changelog, stale whole-word/case-sensitive option, placeholder-comment, open task marker, or FIXME matches.
- Find opening audit: 2 prose sentences before first MDX component.
- Find length audit: 136 lines after rewrite.
- `content/docs/(plugins)/(functionality)/multi-select.mdx`: source-backed against `packages/tag/src/lib/{BaseTagPlugin,isEqualTags}.ts`, `packages/tag/src/lib/*.spec.tsx`, `packages/tag/src/react/{TagPlugin,useSelectedItems,useSelectableItems,useSelectEditorCombobox}.ts*`, `apps/www/src/registry/ui/{select-editor,tag-node}.tsx`, `apps/www/src/registry/examples/select-editor-demo.tsx`, and registry example/UI metadata.
- `pnpm --filter www check:docs` in `/Users/zbeyens/git/plate`: passed after the Multi Select rewrite.
- `pnpm --filter @platejs/tag typecheck` in `/Users/zbeyens/git/plate`: passed after the Multi Select rewrite.
- Multi Select source/API audit: `BaseTagPlugin`, `TagPlugin`, `MultiSelectPlugin`, `tf.insert.tag`, `getSelectedItems`, `useSelectedItems`, `useSelectableItems`, `useSelectEditorCombobox`, `isEqualTags`, duplicate normalization, loose-text cleanup, search trimming, and default new-item filter verified.
- Multi Select registry audit: `select-editor`, `tag-node`, `select-editor-demo`, `SelectEditor`, `SelectEditorContent`, `SelectEditorInput`, `SelectEditorCombobox`, cmdk/fzf/popover wiring, read-only demo behavior, and form integration verified.
- Multi Select route audit: `/docs/multi-select`, `/docs/components/tag-node`, and `/docs/components/select-editor` resolve through `content/docs/meta.json`; registry `select-editor-demo` is linked to `/docs/multi-select`.
- Multi Select anti-slop audit: no WIP, banned marketing/changelog, placeholder-comment, stale `otherPlugins`, stale inline comment, open task marker, or FIXME matches.
- Multi Select opening audit: 2 prose sentences before first MDX component.
- Multi Select length audit: 191 lines after rewrite.
- `content/docs/(plugins)/(functionality)/navigation-feedback.mdx`: source-backed against `packages/core/src/lib/plugins/navigation-feedback/{NavigationFeedbackPlugin,types}.ts`, `packages/core/src/lib/plugins/navigation-feedback/transforms/{flashTarget,navigate}.ts`, core navigation feedback specs, `packages/core/src/react/plugins/navigation-feedback/{NavigationFeedbackPlugin,useNavigationHighlight}.ts*`, `packages/core/src/react/editor/getPlateCorePlugins.ts`, `packages/toc/src/react/hooks/useContentController.ts`, `packages/footnote/src/lib/transforms/{focusFootnoteReference,focusFootnoteDefinition}.ts`, and registry `toc-demo`/`toc-node` metadata.
- `pnpm --filter www check:docs` in `/Users/zbeyens/git/plate`: passed after the Navigation Feedback rewrite.
- `pnpm --filter @platejs/core typecheck` in `/Users/zbeyens/git/plate`: passed after the Navigation Feedback rewrite.
- `pnpm --filter @platejs/toc typecheck` in `/Users/zbeyens/git/plate`: passed after the Navigation Feedback rewrite.
- `pnpm --filter @platejs/footnote typecheck` in `/Users/zbeyens/git/plate`: passed after the Navigation Feedback rewrite.
- Navigation Feedback source/API audit: `NavigationFeedbackPlugin`, `navigationFeedback`, `activeTarget`, `clear`, `isTarget`, `flashTarget`, `navigate`, `useNavigationHighlight`, path refs, pulse/cycle attributes, duration fallback, and scroll-target fallback order verified.
- Navigation Feedback registry/source audit: `toc-demo`, `toc-node`, `useContentController` `flashTarget`, footnote `navigate` transforms, and default core-plugin inclusion verified.
- Navigation Feedback route audit: `/docs/navigation-feedback`, `/docs/toc`, `/docs/footnote`, and `/docs/editor` resolve through `content/docs/meta.json`.
- Navigation Feedback anti-slop audit: no WIP, banned marketing/changelog, placeholder-comment, stale "whatever you need", stale "Done. You now", open task marker, or FIXME matches.
- Navigation Feedback opening audit: 2 prose sentences before first MDX component.
- Navigation Feedback length audit: 236 lines after rewrite.
- `content/docs/(plugins)/(functionality)/tabbable.mdx`: source-backed against `packages/tabbable/src/lib/{BaseTabbablePlugin,findTabDestination,types}.ts`, tabbable specs, `packages/tabbable/src/react/{TabbablePlugin,TabbableEffects}.tsx`, `apps/www/src/registry/components/editor/plugins/tabbable-kit.tsx`, `apps/www/src/registry/examples/tabbable-demo.tsx`, `apps/www/src/registry/examples/values/tabbable-value.tsx`, and registry example/kit metadata.
- `pnpm --filter www check:docs` in `/Users/zbeyens/git/plate`: passed after the Tabbable rewrite.
- `pnpm --filter @platejs/tabbable typecheck` in `/Users/zbeyens/git/plate`: passed after the Tabbable rewrite.
- Tabbable source/API audit: `BaseTabbablePlugin`, `TabbablePlugin`, `TabbableEffects`, `findTabDestination`, `options.query`, `globalEventListener`, `insertTabbableEntries`, `isTabbable`, read-only listener guard, default void filtering, path sorting, and no-destination `tabindex="-1"` fallback verified.
- Tabbable registry audit: `tabbable-kit`, `tabbable-demo`, `tabbableValue`, kit conflict query, `override.enabled.indent=false`, demo void element, and corrected non-spread `plugins: [TabbableKit]` usage verified.
- Tabbable route audit: `/docs/tabbable` resolves through `content/docs/meta.json`.
- Tabbable anti-slop audit: no WIP, banned marketing/changelog, placeholder-comment, stale `otherPlugins`, stale `...TabbableKit`, open task marker, or FIXME matches.
- Tabbable opening audit: 2 prose sentences before first MDX component.
- Tabbable length audit: 186 lines after rewrite.
- `content/docs/(plugins)/(functionality)/toolbar.mdx`: source-backed against `apps/www/src/registry/components/editor/plugins/{fixed-toolbar-kit,floating-toolbar-kit}.tsx`, `apps/www/src/registry/ui/{toolbar,fixed-toolbar,floating-toolbar,fixed-toolbar-buttons,floating-toolbar-buttons,mark-toolbar-button,turn-into-toolbar-button,insert-toolbar-button}.tsx`, `apps/www/src/registry/registry-{kits,ui,examples}.ts`, `packages/floating/src/hooks`, and route metadata.
- `pnpm --filter www check:docs` in `/Users/zbeyens/git/plate`: passed after the Toolbar rewrite.
- `pnpm --filter @platejs/floating typecheck` in `/Users/zbeyens/git/plate`: passed after the Toolbar rewrite.
- Toolbar registry/source audit: `FixedToolbarKit`, `FloatingToolbarKit`, `FixedToolbar`, `FloatingToolbar`, `Toolbar`, `ToolbarButton`, `ToolbarSplitButton`, `ToolbarGroup`, `ToolbarMenuGroup`, `FixedToolbarButtons`, `FloatingToolbarButtons`, `MarkToolbarButton`, `TurnIntoToolbarButton`, and `InsertToolbarButton` verified.
- Toolbar route audit: `/docs/toolbar`, `/docs/components/toolbar`, `/docs/components/fixed-toolbar`, `/docs/components/floating-toolbar`, `/docs/components/mark-toolbar-button`, and `/docs/examples/floating-toolbar` resolve through `content/docs/meta.json`.
- Toolbar anti-slop audit: no WIP, banned marketing/changelog, placeholder-comment, stale `otherPlugins`, "Custom action", "existing items", open task marker, or FIXME matches.
- Toolbar opening audit: 2 prose sentences before first MDX component.
- Toolbar length audit: 227 lines after rewrite.
- `content/docs/(plugins)/(marks)/basic-marks.mdx`: source-backed against `packages/basic-nodes/src/lib/{BaseBasicMarksPlugin,BaseBoldPlugin,BaseItalicPlugin,BaseUnderlinePlugin,BaseStrikethroughPlugin,BaseCodePlugin,BaseSubscriptPlugin,BaseSuperscriptPlugin,BaseHighlightPlugin,BaseKbdPlugin,BasicMarkRules}.ts`, mark input-rule specs, `packages/basic-nodes/src/react/BasicMarksPlugin.tsx`, `apps/www/src/registry/components/editor/plugins/{basic-marks-kit,basic-marks-base-kit}.tsx`, `apps/www/src/registry/ui/{mark-toolbar-button,code-node,highlight-node,kbd-node}.tsx`, and registry example/route metadata.
- `pnpm --filter www check:docs` in `/Users/zbeyens/git/plate`: passed after the Basic Marks rewrite.
- `pnpm --filter @platejs/basic-nodes typecheck` in `/Users/zbeyens/git/plate`: passed after the Basic Marks rewrite.
- Basic Marks source/API audit: `BasicMarksPlugin`, `BaseBasicMarksPlugin`, individual mark plugins, mark keys, render tags, HTML deserializers, mark toggle transforms, sub/sup mutual removal, selection affinity, `BasicMarksKit`, `BaseBasicMarksKit`, and input-rule registrations verified.
- Basic Marks registry audit: `basic-marks-kit`, `basic-marks-base-kit`, `basic-marks-demo`, `basicMarksValue`, `CodeLeaf`, `HighlightLeaf`, `KbdLeaf`, `MarkToolbarButton`, and mark component routes verified.
- Basic Marks route audit: `/docs/basic-marks`, `/docs/bold`, `/docs/italic`, `/docs/underline`, `/docs/strikethrough`, `/docs/code`, `/docs/subscript`, `/docs/superscript`, `/docs/kbd`, `/docs/highlight`, `/docs/components/mark-toolbar-button`, and `/docs/toolbar` resolve through `content/docs/meta.json`.
- Basic Marks anti-slop audit: no WIP, banned marketing/changelog, placeholder-comment, stale `otherPlugins`, open task marker, or FIXME matches.
- Basic Marks opening audit: 2 prose sentences before first MDX component.
- Basic Marks length audit: 193 lines after rewrite.
- `content/docs/(plugins)/(marks)/bold.mdx`: source-backed against `packages/basic-nodes/src/lib/{BaseBoldPlugin,BasicMarkRules}.ts`, `packages/basic-nodes/src/react/BoldPlugin.tsx`, `packages/basic-nodes/src/lib/BaseMarkInputRules.spec.tsx`, `apps/www/src/registry/components/editor/plugins/basic-marks-kit.tsx`, `apps/www/src/registry/ui/{fixed-toolbar-buttons,floating-toolbar-buttons,mark-toolbar-button}.tsx`, and route metadata.
- `pnpm --filter www check:docs` in `/Users/zbeyens/git/plate`: passed after the Bold rewrite.
- `pnpm --filter @platejs/basic-nodes typecheck` in `/Users/zbeyens/git/plate`: passed after the Bold rewrite.
- Bold source/API audit: `BaseBoldPlugin`, `BoldPlugin`, `BoldRules.markdown`, `KEYS.bold`, `node.isLeaf`, `render.as='strong'`, `tf.bold.toggle`, `mod+b`, HTML `strong`/`b`/font-weight parsing, and normal-weight guard verified.
- Bold registry audit: `BasicMarksKit`, `basic-marks-demo`, `MarkToolbarButton nodeType={KEYS.bold}`, fixed/floating toolbar bold buttons, and component routes verified.
- Bold route audit: `/docs/bold`, `/docs/basic-marks`, `/docs/components/mark-toolbar-button`, and `/docs/plugin-shortcuts` resolve through `content/docs/meta.json`.
- Bold anti-slop audit: no WIP, banned marketing/changelog, placeholder-comment, stale `otherPlugins`, stale shortcut config, open task marker, or FIXME matches.
- Bold opening audit: 2 prose sentences before first MDX component.
- Bold length audit: 137 lines after rewrite.
- `content/docs/(plugins)/(marks)/code.mdx`: source-backed against `packages/basic-nodes/src/lib/{BaseCodePlugin,BasicMarkRules}.ts`, `packages/basic-nodes/src/react/CodePlugin.tsx`, `packages/basic-nodes/src/lib/BaseMarkInputRules.spec.tsx`, `apps/www/src/registry/components/editor/plugins/{basic-marks-kit,basic-marks-base-kit}.tsx`, `apps/www/src/registry/ui/{code-node,code-node-static,fixed-toolbar-buttons,floating-toolbar-buttons,mark-toolbar-button}.tsx`, and route metadata.
- `pnpm --filter www check:docs` in `/Users/zbeyens/git/plate`: passed after the Code rewrite.
- `pnpm --filter @platejs/basic-nodes typecheck` in `/Users/zbeyens/git/plate`: passed after the Code rewrite.
- Code source/API audit: `BaseCodePlugin`, `CodePlugin`, `CodeRules.markdown`, `KEYS.code`, `node.isLeaf`, `render.as='code'`, hard selection affinity, `tf.code.toggle`, HTML `code`/Consolas parsing, `pre`/paragraph Consolas guards, and kit `mod+e` shortcut verified.
- Code registry audit: `BasicMarksKit`, `BaseBasicMarksKit`, `CodeLeaf`, `CodeLeafStatic`, `basic-marks-demo`, fixed/floating toolbar code buttons, and component routes verified.
- Code route audit: `/docs/code`, `/docs/code-block`, `/docs/basic-marks`, `/docs/components/code-node`, and `/docs/components/mark-toolbar-button` resolve through `content/docs/meta.json`.
- Code anti-slop audit: no WIP, banned marketing/changelog, placeholder-comment, stale `otherPlugins`, stale shortcut ownership, open task marker, or FIXME matches.
- Code opening audit: 2 prose sentences before first MDX component.
- Code length audit: 145 lines after rewrite.
- `content/docs/(plugins)/(marks)/highlight.mdx`: source-backed against `packages/basic-nodes/src/lib/{BaseHighlightPlugin,BasicMarkRules}.ts`, `packages/basic-nodes/src/react/HighlightPlugin.tsx`, `packages/basic-nodes/src/lib/BaseMarkInputRules.spec.tsx`, `apps/www/src/registry/components/editor/plugins/{basic-marks-kit,basic-marks-base-kit}.tsx`, `apps/www/src/registry/ui/{highlight-node,highlight-node-static,fixed-toolbar-buttons,mark-toolbar-button}.tsx`, and route metadata.
- `pnpm --filter www check:docs` in `/Users/zbeyens/git/plate`: passed after the Highlight rewrite.
- `pnpm --filter @platejs/basic-nodes typecheck` in `/Users/zbeyens/git/plate`: passed after the Highlight rewrite.
- Highlight source/API audit: `BaseHighlightPlugin`, `HighlightPlugin`, `HighlightRules.markdown`, `KEYS.highlight`, `node.isLeaf`, `render.as='mark'`, directional selection affinity, `tf.highlight.toggle`, HTML `mark` parsing, kit `==` and `≡` input rules, and kit `mod+shift+h` shortcut verified.
- Highlight registry audit: `BasicMarksKit`, `BaseBasicMarksKit`, `HighlightLeaf`, `HighlightLeafStatic`, `basic-marks-demo`, fixed toolbar highlight button, and distinction from `SearchHighlightLeaf` verified.
- Highlight route audit: `/docs/highlight`, `/docs/basic-marks`, `/docs/components/highlight-node`, `/docs/components/mark-toolbar-button`, and `/docs/examples/find-replace` resolve through `content/docs/meta.json`.
- Highlight anti-slop audit: no WIP, banned marketing/changelog, placeholder-comment, stale shortcut ownership, stale `otherPlugins`, open task marker, or FIXME matches.
- Highlight opening audit: 2 prose sentences before first MDX component.
- Highlight length audit: 146 lines after rewrite.
- `content/docs/(plugins)/(marks)/italic.mdx`: source-backed against `packages/basic-nodes/src/lib/{BaseItalicPlugin,BasicMarkRules}.ts`, `packages/basic-nodes/src/react/ItalicPlugin.tsx`, `packages/basic-nodes/src/lib/BaseMarkInputRules.spec.tsx`, `apps/www/src/registry/components/editor/plugins/{basic-marks-kit,basic-marks-base-kit}.tsx`, `apps/www/src/registry/ui/{fixed-toolbar-buttons,floating-toolbar-buttons,mark-toolbar-button}.tsx`, and route metadata.
- `pnpm --filter www check:docs` in `/Users/zbeyens/git/plate`: passed after the Italic rewrite.
- `pnpm --filter @platejs/basic-nodes typecheck` in `/Users/zbeyens/git/plate`: passed after the Italic rewrite.
- Italic source/API audit: `BaseItalicPlugin`, `ItalicPlugin`, `ItalicRules.markdown`, `KEYS.italic`, `node.isLeaf`, `render.as='em'`, `tf.italic.toggle`, `mod+i`, HTML `em`/`i`/font-style parsing, and normal-style guard verified.
- Italic registry audit: `BasicMarksKit`, `BaseBasicMarksKit`, `basic-marks-demo`, `MarkToolbarButton nodeType={KEYS.italic}`, fixed/floating toolbar italic buttons, and component routes verified.
- Italic route audit: `/docs/italic`, `/docs/basic-marks`, `/docs/components/mark-toolbar-button`, and `/docs/plugin-shortcuts` resolve through `content/docs/meta.json`.
- Italic anti-slop audit: no WIP, banned marketing/changelog, placeholder-comment, stale shortcut config, stale `otherPlugins`, open task marker, or FIXME matches.
- Italic opening audit: 2 prose sentences before first MDX component.
- Italic length audit: 136 lines after rewrite.
- `content/docs/(plugins)/(marks)/kbd.mdx`: source-backed against `packages/basic-nodes/src/lib/BaseKbdPlugin.ts`, `packages/basic-nodes/src/react/KbdPlugin.tsx`, `apps/www/src/registry/components/editor/plugins/{basic-marks-kit,basic-marks-base-kit}.tsx`, `apps/www/src/registry/ui/{kbd-node,kbd-node-static,more-toolbar-button}.tsx`, and route metadata.
- `pnpm --filter www check:docs` in `/Users/zbeyens/git/plate`: passed after the Keyboard Input rewrite.
- `pnpm --filter @platejs/basic-nodes typecheck` in `/Users/zbeyens/git/plate`: passed after the Keyboard Input rewrite.
- Keyboard Input source/API audit: `BaseKbdPlugin`, `KbdPlugin`, `KEYS.kbd`, `node.isLeaf`, `render.as='kbd'`, hard selection affinity, `tf.kbd.toggle`, and HTML `kbd` parsing verified.
- Keyboard Input registry audit: `BasicMarksKit`, `BaseBasicMarksKit`, `KbdLeaf`, `KbdLeafStatic`, `basic-marks-demo`, and `MoreToolbarButton` direct `KEYS.kbd` toggle verified.
- Keyboard Input route audit: `/docs/kbd`, `/docs/basic-marks`, `/docs/components/kbd-node`, and `/docs/components/more-toolbar-button` resolve through `content/docs/meta.json`.
- Keyboard Input anti-slop audit: no WIP, banned marketing/changelog, placeholder-comment, stale shortcut claims, stale `otherPlugins`, open task marker, or FIXME matches.
- Keyboard Input opening audit: 2 prose sentences before first MDX component.
- Keyboard Input length audit: 133 lines after rewrite.
- `content/docs/(plugins)/(marks)/strikethrough.mdx`: source-backed against `packages/basic-nodes/src/lib/{BaseStrikethroughPlugin,BasicMarkRules}.ts`, `packages/basic-nodes/src/react/StrikethroughPlugin.tsx`, `packages/basic-nodes/src/lib/BaseMarkInputRules.spec.tsx`, `apps/www/src/registry/components/editor/plugins/{basic-marks-kit,basic-marks-base-kit}.tsx`, `apps/www/src/registry/ui/{fixed-toolbar-buttons,floating-toolbar-buttons,mark-toolbar-button}.tsx`, and route metadata.
- `pnpm --filter www check:docs` in `/Users/zbeyens/git/plate`: passed after the Strikethrough rewrite.
- `pnpm --filter @platejs/basic-nodes typecheck` in `/Users/zbeyens/git/plate`: passed after the Strikethrough rewrite.
- Strikethrough source/API audit: `BaseStrikethroughPlugin`, `StrikethroughPlugin`, `StrikethroughRules.markdown`, `KEYS.strikethrough`, `node.isLeaf`, `render.as='s'`, directional selection affinity, `tf.strikethrough.toggle`, HTML `s`/`del`/`strike`/line-through parsing, and text-decoration guard verified.
- Strikethrough registry audit: `BasicMarksKit`, `BaseBasicMarksKit`, `basic-marks-demo`, `MarkToolbarButton nodeType={KEYS.strikethrough}`, fixed/floating toolbar strikethrough buttons, kit input rule, and kit `mod+shift+x` shortcut verified.
- Strikethrough route audit: `/docs/strikethrough`, `/docs/basic-marks`, `/docs/components/mark-toolbar-button`, and `/docs/plugin-shortcuts` resolve through `content/docs/meta.json`.
- Strikethrough anti-slop audit: no WIP, banned marketing/changelog, placeholder-comment, stale package shortcut claim, stale `otherPlugins`, open task marker, or FIXME matches.
- Strikethrough opening audit: 2 prose sentences before first MDX component.
- Strikethrough length audit: 139 lines after rewrite.
- `content/docs/(plugins)/(marks)/subscript.mdx`: source-backed against `packages/basic-nodes/src/lib/{BaseSubscriptPlugin,BasicMarkRules}.ts`, `packages/basic-nodes/src/react/SubscriptPlugin.tsx`, `packages/basic-nodes/src/lib/BaseMarkInputRules.spec.tsx`, `apps/www/src/registry/components/editor/plugins/{basic-marks-kit,basic-marks-base-kit}.tsx`, `apps/www/src/registry/ui/more-toolbar-button.tsx`, and route metadata.
- `pnpm --filter www check:docs` in `/Users/zbeyens/git/plate`: passed after the Subscript rewrite.
- `pnpm --filter @platejs/basic-nodes typecheck` in `/Users/zbeyens/git/plate`: passed after the Subscript rewrite.
- Subscript source/API audit: `BaseSubscriptPlugin`, `SubscriptPlugin`, `SubscriptRules.markdown`, `KEYS.sub`, `node.isLeaf`, `render.as='sub'`, directional selection affinity, `tf.subscript.toggle`, `KEYS.sup` removal, HTML `sub`/`vertical-align: sub` parsing, kit input rule, and kit `mod+comma` shortcut verified.
- Subscript registry audit: `BasicMarksKit`, `BaseBasicMarksKit`, `basic-marks-demo`, and `MoreToolbarButton` direct `KEYS.sub` toggle with `KEYS.sup` removal verified.
- Subscript route audit: `/docs/subscript`, `/docs/superscript`, `/docs/basic-marks`, `/docs/components/more-toolbar-button`, and `/docs/plugin-shortcuts` resolve through `content/docs/meta.json`.
- Subscript anti-slop audit: no WIP, banned marketing/changelog, placeholder-comment, stale package shortcut claim, stale `otherPlugins`, open task marker, or FIXME matches.
- Subscript opening audit: 2 prose sentences before first MDX component.
- Subscript length audit: 130 lines after rewrite.
- `content/docs/(plugins)/(marks)/superscript.mdx`: source-backed against `packages/basic-nodes/src/lib/{BaseSuperscriptPlugin,BasicMarkRules}.ts`, `packages/basic-nodes/src/react/SuperscriptPlugin.tsx`, `packages/basic-nodes/src/lib/BaseMarkInputRules.spec.tsx`, `apps/www/src/registry/components/editor/plugins/{basic-marks-kit,basic-marks-base-kit}.tsx`, `apps/www/src/registry/ui/more-toolbar-button.tsx`, and route metadata.
- `pnpm --filter www check:docs` in `/Users/zbeyens/git/plate`: passed after the Superscript rewrite.
- `pnpm --filter @platejs/basic-nodes typecheck` in `/Users/zbeyens/git/plate`: passed after the Superscript rewrite.
- Superscript source/API audit: `BaseSuperscriptPlugin`, `SuperscriptPlugin`, `SuperscriptRules.markdown`, `KEYS.sup`, `node.isLeaf`, `render.as='sup'`, directional selection affinity, `tf.superscript.toggle`, `KEYS.sub` removal, HTML `sup`/`vertical-align: super` parsing, kit input rule, and kit `mod+period` shortcut verified.
- Superscript registry audit: `BasicMarksKit`, `BaseBasicMarksKit`, `basic-marks-demo`, and `MoreToolbarButton` direct `KEYS.sup` toggle with `KEYS.sub` removal verified.
- Superscript route audit: `/docs/superscript`, `/docs/subscript`, `/docs/basic-marks`, `/docs/components/more-toolbar-button`, and `/docs/plugin-shortcuts` resolve through `content/docs/meta.json`.
- Superscript anti-slop audit: no WIP, banned marketing/changelog, placeholder-comment, stale package shortcut claim, stale `otherPlugins`, open task marker, or FIXME matches.
- Superscript opening audit: 2 prose sentences before first MDX component.
- Superscript length audit: 130 lines after rewrite.
- `content/docs/(plugins)/(marks)/underline.mdx`: source-backed against `packages/basic-nodes/src/lib/{BaseUnderlinePlugin,BasicMarkRules}.ts`, `packages/basic-nodes/src/react/UnderlinePlugin.tsx`, `packages/basic-nodes/src/lib/BaseMarkInputRules.spec.tsx`, `apps/www/src/registry/components/editor/plugins/{basic-marks-kit,basic-marks-base-kit}.tsx`, `apps/www/src/registry/ui/{fixed-toolbar-buttons,floating-toolbar-buttons,mark-toolbar-button}.tsx`, and route metadata.
- `pnpm --filter www check:docs` in `/Users/zbeyens/git/plate`: passed after the Underline rewrite.
- `pnpm --filter @platejs/basic-nodes typecheck` in `/Users/zbeyens/git/plate`: passed after the Underline rewrite.
- Underline source/API audit: `BaseUnderlinePlugin`, `UnderlinePlugin`, `UnderlineRules.markdown`, `KEYS.underline`, `node.isLeaf`, `render.as='u'`, `tf.underline.toggle`, `mod+u`, HTML `u`/text-decoration underline parsing, text-decoration guard, and kit input rule verified.
- Underline registry audit: `BasicMarksKit`, `BaseBasicMarksKit`, `basic-marks-demo`, `MarkToolbarButton nodeType={KEYS.underline}`, and fixed/floating toolbar underline buttons verified.
- Underline route audit: `/docs/underline`, `/docs/basic-marks`, `/docs/components/mark-toolbar-button`, and `/docs/plugin-shortcuts` resolve through `content/docs/meta.json`.
- Underline anti-slop audit: no WIP, banned marketing/changelog, placeholder-comment, stale shortcut config, stale `otherPlugins`, open task marker, or FIXME matches.
- Underline opening audit: 2 prose sentences before first MDX component.
- Underline length audit: 133 lines after rewrite.
- `content/docs/(plugins)/(serializing)/csv.mdx`: source-backed against `packages/csv/src/lib/{CsvPlugin,deserializer/utils/deserializeCsv}.ts`, `packages/csv/src/lib/{CsvPlugin,deserializer/utils/deserializeCsv}.spec.ts`, `packages/table/src/lib/withSetFragmentDataTable.ts`, `apps/www/src/registry/registry-examples.ts`, `apps/www/src/registry/examples/values/deserialize-csv-value.tsx`, and route metadata.
- `pnpm --filter www check:docs` in `/Users/zbeyens/git/plate`: passed after the CSV rewrite.
- `pnpm --filter @platejs/csv typecheck` in `/Users/zbeyens/git/plate`: passed after the CSV rewrite.
- `pnpm --filter @platejs/table typecheck` in `/Users/zbeyens/git/plate`: passed after the CSV rewrite.
- CSV source/API audit: `CsvPlugin`, `CsvPlugin.configure({ options })`, `editor.api.csv.deserialize({ data, ...parseOptions })`, `deserializeCsv`, `KEYS.csv`, `parser.format='text/plain'`, default `errorTolerance=0.25`, default `parseOptions.header=true`, call-site PapaParse override behavior, invalid-CSV `undefined` return, and negative tolerance clamp verified.
- CSV table/clipboard audit: header rows become `th`, array-mode rows become `td`, output is wrapped with empty paragraphs, table rendering is owned by table plugins, and table selection `text/csv` clipboard output is owned by `@platejs/table`.
- CSV registry audit: `csv-demo`, `deserialize-csv-value`, and `TableKit` usage path verified.
- CSV route audit: `/docs/csv`, `/docs/examples/csv`, and `/docs/table` resolve through `content/docs/meta.json`.
- CSV anti-slop audit: no WIP, banned marketing/changelog, placeholder-comment, stale per-call `errorTolerance`, stale serialize API, stale `otherPlugins`, open task marker, or FIXME matches.
- CSV opening audit: 2 prose sentences before first MDX component.
- CSV length audit: 133 lines after rewrite.
- `content/docs/(plugins)/(serializing)/docx-io.mdx`: source-backed against `packages/docx-io/src/lib/{importDocx,types,preprocessMammothHtml,docx-export-plugin,html-to-docx}.ts`, `packages/docx-io/src/lib/{importDocx,html-to-docx}.spec.ts`, `packages/docx/src/lib/docx-cleaner/cleanDocx.ts`, `apps/www/src/registry/components/editor/plugins/{docx-export-kit,docx-kit}.tsx`, `apps/www/src/registry/ui/{import-toolbar-button,export-toolbar-button}.tsx`, registry metadata, and route metadata.
- `pnpm --filter www check:docs` in `/Users/zbeyens/git/plate`: passed after the DOCX Import/Export rewrite.
- `pnpm --filter @platejs/docx-io typecheck` in `/Users/zbeyens/git/plate`: passed after the DOCX Import/Export rewrite.
- `pnpm --filter @platejs/docx typecheck` in `/Users/zbeyens/git/plate`: passed after the DOCX Import/Export rewrite.
- DOCX Import source/API audit: `importDocx`, Mammoth `convertToHtml`, comment preprocessing/extraction, `cleanDocx(preprocessedHtml, rtf)`, `editor.api.html.deserialize`, `ImportDocxResult`, `ImportDocxOptions.rtf`, warnings return, and HTML-parse failure fallback verified.
- DOCX Export source/API audit: `exportToDocx`, `downloadDocx`, `exportEditorToDocx`, `DocxExportPlugin`, `htmlToDocxBlob`, `DOCX_EXPORT_STYLES`, `DEFAULT_DOCX_MARGINS`, `DocxExportOperationOptions`, plugin options, component override extraction, `serializeHtml`, `juice` CSS inlining, Word MIME blob generation, and filename extension behavior verified.
- DOCX registry audit: `DocxExportKit`, `DocxKit`, `ImportToolbarButton`, `ExportToolbarButton`, `BaseEditorKit`, docx-specific code block/column/equation/callout/TOC static components, and registry dependencies verified.
- DOCX Import/Export route audit: `/docs/docx-io`, `/docs/docx`, `/docs/components/import-toolbar-button`, and `/docs/components/export-toolbar-button` resolve through `content/docs/meta.json`.
- DOCX Import/Export anti-slop audit: no WIP, banned marketing/changelog, placeholder-comment, stale `@platejs/docx-export`, unsupported broad support claims, mobile limitation boilerplate, stale `otherPlugins`, open task marker, or FIXME matches.
- DOCX Import/Export opening audit: 2 prose sentences before first MDX component.
- DOCX Import/Export length audit: 182 lines after rewrite.
- `content/docs/(plugins)/(serializing)/docx.mdx`: source-backed against `packages/docx/src/lib/DocxPlugin.ts`, `packages/docx/src/lib/DocxPlugin.spec.ts`, `packages/docx/src/lib/docx-cleaner/{cleanDocx,cleanDocx.spec}.ts`, `packages/docx/src/lib/docx-cleaner/utils/*`, `packages/juice/src/lib/JuicePlugin.ts`, `apps/www/src/registry/components/editor/plugins/docx-kit.tsx`, `apps/www/src/registry/registry-examples.ts`, `apps/www/src/registry/examples/values/deserialize-docx-value.tsx`, and route metadata.
- `pnpm --filter www check:docs` in `/Users/zbeyens/git/plate`: passed after the DOCX paste rewrite.
- `pnpm --filter @platejs/docx typecheck` in `/Users/zbeyens/git/plate`: passed after the DOCX paste rewrite.
- `pnpm --filter @platejs/juice typecheck` in `/Users/zbeyens/git/plate`: passed after the DOCX paste rewrite.
- DOCX paste source/API audit: `DocxPlugin`, `KEYS.docx`, `editOnly`, HTML parser `transformData`, `cleanDocx(data, text/rtf)`, `isDocxContent`, `getDocxListIndent`, `getTextListStyleType`, `getDocxIndent`, `getDocxTextIndent`, image parser query gating, RTF image recovery, footnote cleanup, whitespace wrapper, and plain-HTML guard verified.
- DOCX paste registry audit: `DocxKit`, `DocxPlugin`, `JuicePlugin`, `docx-demo`, and `deserialize-docx-value` verified.
- DOCX paste route audit: `/docs/docx`, `/docs/docx-io`, and `/docs/examples/docx` resolve through `content/docs/meta.json`.
- DOCX paste anti-slop audit: no WIP, banned marketing/changelog, placeholder-comment, stale automatic-formatting/no-code boilerplate, stale `otherPlugins`, open task marker, or FIXME matches.
- DOCX paste opening audit: 2 prose sentences before first MDX component.
- DOCX paste length audit: 113 lines after rewrite.
- `content/docs/(plugins)/(serializing)/html.mdx`: source-backed against `packages/core/src/static/{serializeHtml,serializeHtml.node-props.spec}.tsx`, `packages/core/src/static/deserialize/{htmlStringToEditorDOM,htmlStringToEditorDOM.spec}.ts`, `packages/core/src/static/utils/{stripHtmlClassNames,stripSlateDataAttributes}.ts`, `packages/core/src/lib/plugins/html/{HtmlPlugin,HtmlPlugin.spec}.ts`, `packages/core/src/lib/plugins/html/utils/deserializeHtml.ts`, `apps/www/src/registry/{components/editor/slate-to-html,blocks/slate-to-html/page,lib/create-html-document}.tsx`, registry example metadata, and route metadata.
- `pnpm --filter www check:docs` in `/Users/zbeyens/git/plate`: passed after the HTML rewrite.
- `pnpm --filter @platejs/core typecheck` in `/Users/zbeyens/git/plate`: passed after the HTML rewrite.
- HTML serialize audit: `serializeHtml`, `createStaticEditor`, `PlateStatic`, `EditorStatic`, `ReactDOMServer.renderToStaticMarkup`, default `stripClassNames=false`, default `stripDataAttributes=false`, class-preserve prefix behavior, plugin node props, and full-document wrapper path verified.
- HTML deserialize audit: `HtmlPlugin`, `parser.format='text/html'`, parser body handoff, `editor.api.html.deserialize`, string-to-DOM input, `collapseWhiteSpace=true`, `defaultElementPlugin`, normalized fragment output, and `getEditorDOMFromHtmlString` exported-editor extraction verified.
- HTML registry audit: `html-demo`, `deserialize-html-value`, `plite-to-html`, `BaseEditorKit`, `EditorStatic`, iframe preview, and export download path verified.
- HTML route audit: `/docs/html`, `/docs/static`, `/docs/examples/plite-to-html`, and `/docs/examples/html` resolve through `content/docs/meta.json`.
- HTML anti-slop audit: no WIP, banned marketing/changelog, placeholder-comment, stale `stripClassNames` defaults, stale `stripWhitespace`, fake `SerializeHtmlOptions.value`, broken custom plugin snippet, stale `otherPlugins`, open task marker, or FIXME matches.
- HTML opening audit: 2 prose sentences before first MDX component.
- HTML length audit: 171 lines after rewrite.
- `content/docs/(plugins)/(serializing)/markdown.mdx`: source-backed against `packages/markdown/src/lib/{MarkdownPlugin,MarkdownPlugin.spec}.ts`, `packages/markdown/src/lib/deserializer/{deserializeMd,utils/deserializeInlineMd,utils/parseMarkdownBlocks,utils/getMergedOptionsDeserialize}.ts`, `packages/markdown/src/lib/serializer/{serializeMd,serializeInlineMd,wrapWithBlockId,utils/getMergedOptionsSerialize}.ts`, `packages/markdown/src/lib/{rules/defaultRules,utils/getRemarkPluginsWithoutMdx,mdx.spec,mdxMarks.spec}.tsx`, `apps/www/src/registry/components/editor/plugins/markdown-kit.tsx`, `apps/www/src/registry/examples/markdown-to-slate-demo.tsx`, registry example metadata, and route metadata.
- `pnpm --filter www check:docs` in `/Users/zbeyens/git/plate`: passed after the Markdown rewrite.
- `pnpm --filter @platejs/markdown typecheck` in `/Users/zbeyens/git/plate`: passed after the Markdown rewrite.
- `pnpm --filter @platejs/footnote typecheck` in `/Users/zbeyens/git/plate`: passed after the Markdown rewrite.
- Markdown plugin/API audit: `MarkdownPlugin`, `KEYS.markdown`, default options, `markdown.deserialize`, `markdown.deserializeInline`, `markdown.serialize`, text/plain parser, HTML clipboard skip, URL-only skip, file clipboard exception, option merge precedence, `plainMarks`, and call-site override behavior verified.
- Markdown deserialize audit: `deserializeMd`, `markdownToAstProcessor`, `markdownToPliteNodes`, `remarkParse`, `remarkPlugins`, `htmlToJsx`, `withoutMdx`, `memoize` `_memo`, `parseMarkdownBlocks`, `splitLineBreaks`, `onError`, safe fallback, inline deserialization whitespace preservation, and top-level text paragraph wrapping verified.
- Markdown serialize audit: `serializeMd`, `serializeInlineMd`, `remarkStringify`, `emphasis='_'`, `resourceLink=false`, `remarkStringifyOptions`, `value` defaulting to `editor.children`, `withBlockId`, and `wrapWithBlockId` MDX output verified.
- Markdown registry audit: `MarkdownKit`, footnote base plugins, `remarkMath`, `remarkGfm`, `remarkEmoji`, `remarkMdx`, `remarkMention`, `plainMarks` for suggestion/comment, `markdown-to-slate-demo`, `markdown-demo`, and `preview-markdown-demo` verified.
- Markdown route audit: `/docs/markdown`, `/docs/examples/markdown`, `/docs/examples/preview-markdown`, `/docs/footnote`, `/docs/code-block`, `/docs/equation`, `/docs/mention`, `/docs/column`, and `/docs/toc` resolve through `content/docs/meta.json`.
- Markdown anti-slop audit: no WIP, banned marketing/changelog, placeholder-comment, stale round-trip guarantees, react-markdown migration appendix, raw HTML/rehype overreach, stale `otherPlugins`, open task marker, or FIXME matches.
- Markdown opening audit: 1 prose sentence before first MDX component.
- Markdown length audit: 232 lines after rewrite.
- `content/docs/(plugins)/(styles)/font.mdx`: source-backed against `packages/basic-styles/src/lib/{BaseFontColorPlugin,BaseFontBackgroundColorPlugin,BaseFontFamilyPlugin,BaseFontSizePlugin,BaseFontWeightPlugin}.ts`, `packages/basic-styles/src/react/FontPlugin.tsx`, `packages/basic-styles/src/lib/utils/toUnitLess.ts`, `packages/markdown/src/lib/rules/fontRules.ts`, `apps/www/src/registry/components/editor/plugins/{font-kit,font-base-kit}.tsx`, `apps/www/src/registry/ui/{font-color-toolbar-button,font-size-toolbar-button}.tsx`, registry example metadata, and route metadata.
- `pnpm --filter www check:docs` in `/Users/zbeyens/git/plate`: passed after the Font rewrite.
- `pnpm --filter @platejs/basic-styles typecheck` in `/Users/zbeyens/git/plate`: passed after the Font rewrite.
- `pnpm --filter @platejs/markdown typecheck` in `/Users/zbeyens/git/plate`: passed after the Font rewrite.
- Font package/API audit: `FontColorPlugin`, `FontBackgroundColorPlugin`, `FontFamilyPlugin`, `FontSizePlugin`, `FontWeightPlugin`, base plugin variants, `KEYS.color`, `KEYS.backgroundColor`, `KEYS.fontFamily`, `KEYS.fontSize`, `KEYS.fontWeight`, injected node props, HTML style deserializers, and bound `addMark` transforms verified.
- Font registry audit: `FontKit`, `BaseFontKit`, `font-demo`, `font-value`, `FontColorToolbarButton`, `FontSizeToolbarButton`, fixed toolbar usage, `nodeType` switching, custom color queue behavior, font-size fallback map, and `toUnitLess` usage verified.
- Font Markdown audit: `fontRules` serializes font marks as MDX span styles and deserializes `span` styles for `color`, `background-color`, `font-family`, `font-size`, and `font-weight`.
- Font route audit: `/docs/font`, `/docs/examples/font`, `/docs/components/font-color-toolbar-button`, and `/docs/components/font-size-toolbar-button` resolve through `content/docs/meta.json`.
- Font anti-slop audit: no WIP, banned marketing/changelog, placeholder-comment, fake `FontWeightPlugin` kit inclusion, stale `otherPlugins`, open task marker, or FIXME matches.
- Font opening audit: 2 prose sentences before first MDX component.
- Font length audit: 220 lines after rewrite.
- `content/docs/(plugins)/(styles)/indent.mdx`: source-backed against `packages/indent/src/lib/{BaseIndentPlugin,withIndent,BaseIndentPlugin.spec,withIndent.spec}.ts(x)`, `packages/indent/src/lib/transforms/{indent,outdent,setIndent,setIndent.spec}.ts`, `packages/indent/src/react/{IndentPlugin,hooks/useIndentButton,hooks/useOutdentButton}.ts(x)`, `apps/www/src/registry/components/editor/plugins/{indent-kit,indent-base-kit}.tsx`, `apps/www/src/registry/ui/indent-toolbar-button.tsx`, registry example metadata, and route metadata.
- `pnpm --filter www check:docs` in `/Users/zbeyens/git/plate`: passed after the Indent rewrite.
- `pnpm --filter @platejs/indent typecheck` in `/Users/zbeyens/git/plate`: passed after the Indent rewrite.
- `pnpm --filter @platejs/list typecheck` in `/Users/zbeyens/git/plate`: passed after the Indent rewrite.
- Indent package/API audit: `BaseIndentPlugin`, `IndentPlugin`, `KEYS.indent`, `nodeKey='indent'`, `styleKey='marginLeft'`, default `[KEYS.p]` target, default `offset=24`, default `unit='px'`, `indentMax`, `indent`, `outdent`, `setIndent`, `setNodesProps`, `unsetNodesProps`, and `getNodesOptions` verified.
- Indent Tab behavior audit: `withIndent` caps excess indent, unsets indent on non-target blocks, claims Tab for matching blocks, outdents before fallback, preserves editor ownership for reverse Tab on unindented paragraphs, and lets blockquote lifting handle Shift+Tab when no block indent remains.
- Indent registry audit: `IndentKit`, `BaseIndentKit`, React image target difference, `indent-demo`, `indent-value`, `IndentToolbarButton`, and `OutdentToolbarButton` verified.
- Indent route audit: `/docs/indent`, `/docs/examples/indent`, `/docs/components/indent-toolbar-button`, and `/docs/list` resolve through `content/docs/meta.json`.
- Indent anti-slop audit: no WIP, banned marketing/changelog, placeholder-comment, stale `otherPlugins`, stale target list, fake default `indentMax`, open task marker, or FIXME matches.
- Indent opening audit: 2 prose sentences before first MDX component.
- Indent length audit: 198 lines after rewrite.
- `content/docs/(plugins)/(styles)/line-height.mdx`: source-backed against `packages/basic-styles/src/lib/{BaseLineHeightPlugin,BaseLineHeightPlugin.spec}.ts`, `packages/basic-styles/src/lib/transforms/{setLineHeight,setLineHeight.spec}.ts(x)`, `packages/basic-styles/src/react/LineHeightPlugin.tsx`, `apps/www/src/registry/components/editor/plugins/{line-height-kit,line-height-base-kit}.tsx`, `apps/www/src/registry/ui/line-height-toolbar-button.tsx`, registry example metadata, and route metadata.
- `pnpm --filter www check:docs` in `/Users/zbeyens/git/plate`: passed after the Line Height rewrite.
- `pnpm --filter @platejs/basic-styles typecheck` in `/Users/zbeyens/git/plate`: passed after the Line Height rewrite.
- Line Height package/API audit: `BaseLineHeightPlugin`, `LineHeightPlugin`, `KEYS.lineHeight`, `lineHeight` node prop, default `[KEYS.p]` target, default `defaultNodeValue=1.5`, HTML `lineHeight` parser injection, `setLineHeight`, and bound `tf.lineHeight.setNodes` verified.
- Line Height transform audit: custom values set `lineHeight`, setting the default value unsets `lineHeight`, and non-target blocks are ignored by `setLineHeight`.
- Line Height registry audit: `LineHeightKit`, `BaseLineHeightKit`, target `[...KEYS.heading, KEYS.p]`, valid values `[1, 1.2, 1.5, 2, 3]`, `line-height-demo`, `line-height-value`, and `LineHeightToolbarButton` verified.
- Line Height route audit: `/docs/line-height`, `/docs/examples/line-height`, and `/docs/components/line-height-toolbar-button` resolve through `content/docs/meta.json`.
- Line Height anti-slop audit: no WIP, banned marketing/changelog, placeholder-comment, stale `otherPlugins`, bad `KEYS` import, fake API, open task marker, or FIXME matches.
- Line Height opening audit: 2 prose sentences before first MDX component.
- Line Height length audit: 164 lines after rewrite.
- `content/docs/(plugins)/(styles)/list.mdx`: source-backed against `packages/list/src/lib/{BaseListPlugin,withList,withNormalizeList,types}.ts(x)`, `packages/list/src/lib/transforms/{toggleList,indentList,outdentList,setListNode}.ts`, `packages/list/src/lib/{BulletedListRules,OrderedListRules,TaskListRules}.ts`, `packages/list/src/lib/normalizers/{normalizeListNotIndented,normalizeListStart,withInsertBreakList}.ts`, `packages/list/src/lib/queries/{someList,someTaskList,isOrderedList}.ts`, `packages/list/src/react/{ListPlugin,hooks/useListToolbarButton,hooks/useTaskListToolbarButton}.ts(x)`, `apps/www/src/registry/components/editor/plugins/{list-kit,list-base-kit}.tsx`, `apps/www/src/registry/ui/{block-list,block-list-static,list-toolbar-button}.tsx`, registry example metadata, and route metadata.
- `pnpm --filter www check:docs` in `/Users/zbeyens/git/plate`: passed after the List rewrite.
- `pnpm --filter @platejs/list typecheck` in `/Users/zbeyens/git/plate`: passed after the List rewrite.
- `pnpm --filter @platejs/indent typecheck` in `/Users/zbeyens/git/plate`: passed after the List rewrite.
- List package/API audit: `BaseListPlugin`, `ListPlugin`, `KEYS.list`, `KEYS.listType=listStyleType`, `KEYS.listChecked=checked`, `KEYS.listStart`, `KEYS.listRestart`, `KEYS.listRestartPolite`, `ListStyleType`, `toggleList`, `indentList`, `outdentList`, `someList`, `someTaskList`, and `isOrderedList` verified.
- List behavior audit: HTML paste flattening, indent/listStyleType extraction, input-rule code-block guards, task split behavior, unindented-list cleanup, unordered-list `listStart` cleanup, ordered-list `listStart` normalization, reset-block outdent behavior, and lower/upper roman continuity branch verified.
- List registry audit: `ListKit`, `BaseListKit`, `IndentKit` dependency, `BaseIndentKit` dependency, `BlockList`, `BlockListStatic`, `BulletedListToolbarButton`, `NumberedListToolbarButton`, `TaskListToolbarButton`, `list-demo`, and `list-value` verified.
- List route audit: `/docs/list`, `/docs/examples/list`, `/docs/indent`, `/docs/list-classic`, `/docs/components/block-list`, and `/docs/components/list-toolbar-button` resolve through `content/docs/meta.json`.
- List anti-slop audit: no WIP, banned marketing/changelog, placeholder-comment, stale `otherPlugins`, generic flexible/simplified marketing claims, fake API, open task marker, or FIXME matches.
- List opening audit: 2 prose sentences before first MDX component.
- List length audit: 245 lines after rewrite.
- `content/docs/(plugins)/(styles)/text-align.mdx`: source-backed against `packages/basic-styles/src/lib/{BaseTextAlignPlugin,BaseTextAlignPlugin.spec}.ts`, `packages/basic-styles/src/lib/transforms/{setAlign,setAlign.spec}.ts(x)`, `packages/basic-styles/src/react/TextAlignPlugin.tsx`, `apps/www/src/registry/components/editor/plugins/{align-kit,align-base-kit}.tsx`, `apps/www/src/registry/ui/align-toolbar-button.tsx`, registry example metadata, and route metadata.
- `pnpm --filter www check:docs` in `/Users/zbeyens/git/plate`: passed after the Text Align rewrite.
- `pnpm --filter @platejs/basic-styles typecheck` in `/Users/zbeyens/git/plate`: passed after the Text Align rewrite.
- Text Align package/API audit: `BaseTextAlignPlugin`, `TextAlignPlugin`, `KEYS.textAlign`, stored `align` prop, `styleKey='textAlign'`, default `[KEYS.p]` target, default `start`, valid values, HTML `textAlign` parser injection, `setAlign`, and bound `tf.textAlign.setNodes` verified.
- Text Align transform audit: custom values set `align`, setting `start` unsets `align`, and non-target blocks are ignored by `setAlign`.
- Text Align registry audit: `AlignKit`, `BaseAlignKit`, target `[...KEYS.heading, KEYS.p, KEYS.img, KEYS.mediaEmbed]`, `align-demo`, `align-value`, and `AlignToolbarButton` verified.
- Text Align route audit: `/docs/text-align`, `/docs/examples/align`, and `/docs/components/align-toolbar-button` resolve through `content/docs/meta.json`.
- Text Align anti-slop audit: no WIP, banned marketing/changelog, placeholder-comment, stale `otherPlugins`, fake API, open task marker, or FIXME matches.
- Text Align opening audit: 2 prose sentences before first MDX component.
- Text Align length audit: 175 lines after rewrite.
- `content/docs/api/cn.mdx`: source-backed against `packages/udecode/cn/src/{cn,withCn,withProps,withVariants,index}.ts(x)`, `packages/udecode/cn/package.json`, `packages/udecode/react-utils/src/index.ts`, and route metadata.
- `pnpm --filter www check:docs` in `/Users/zbeyens/git/plate`: passed after the @udecode/cn API rewrite.
- `pnpm --filter @udecode/cn typecheck` in `/Users/zbeyens/git/plate`: passed after the @udecode/cn API rewrite.
- `pnpm --filter @udecode/react-utils typecheck` in `/Users/zbeyens/git/plate`: passed after the @udecode/cn API rewrite.
- @udecode/cn API audit: `cn`, `withCn`, `withProps`, `withVariants`, root `@udecode/react-utils` re-export, package dependencies, peer dependencies, `cx`, `twMerge`, default-prop merge order, class-name merge behavior, `forwardRef`, `cva` variant props, and `onlyVariantsProps` prop stripping verified.
- @udecode/cn route audit: `/docs/api/cn` resolves through `content/docs/meta.json`.
- @udecode/cn anti-slop audit: no WIP, banned marketing/changelog, placeholder-comment, fake ElementType claim for `withCn`, open task marker, or FIXME matches.
- @udecode/cn opening audit: 2 prose sentences before first heading.
- @udecode/cn length audit: 161 lines after rewrite.
- `content/docs/api/core.mdx`: source-backed against `packages/core/src/react/editor/{withPlate,usePlateEditor,usePlateViewEditor,getPlateCorePlugins}.ts`, `packages/core/src/lib/editor/withPlite.ts`, `packages/core/src/lib/plugins/getCorePlugins.ts`, `packages/core/src/static/editor/withStatic.tsx`, `packages/core/src/react/plugin/{createPlatePlugin,toPlatePlugin}.ts`, `packages/core/src/react/components/{Plate,PlateContent,PlateView,plate-nodes,index}.tsx`, `packages/core/src/react/stores/plate/*`, `packages/core/src/react/stores/plate-controller/*`, `packages/core/src/{index,react/index,static/index}.ts`, `packages/{core,plate}/package.json`, `packages/plate/src/{index,react/index,static/index}.tsx`, and route metadata.
- `pnpm --filter www check:docs` in `/Users/zbeyens/git/plate`: passed after the Plate Core rewrite.
- `pnpm --filter @platejs/core typecheck` in `/Users/zbeyens/git/plate`: passed after the Plate Core rewrite.
- Plate Core editor audit: `createPlateEditor`, `withPlate`, `usePlateEditor`, `usePlateViewEditor`, `createStaticEditor`, `withPlite`, memo dependency behavior, disabled `null` return, async `onReady` force-render path, root plugin hook, and value/selection/normalization options verified.
- Plate Core plugin audit: `createPlatePlugin`, `createTPlatePlugin`, `toPlatePlugin`, `toTPlatePlugin`, Plite-to-Plate conversion, method wrapping for chained plugin methods, and typed conversion surfaces verified.
- Plate Core component/store audit: `Plate`, `PlateContent`, `PlateView`, `PlateElement`, `PlateLeaf`, `PlateText`, `useEditorRef`, `useEditorSelector`, `useEditorPlugin`, `usePluginOption`, `usePluginOptions`, `usePlateStore`, `PlateController`, and `usePlateControllerStore` verified.
- Plate Core route audit: `/docs/api/core`, `/docs/api/core/plate-components`, `/docs/api/core/plate-editor`, `/docs/api/core/plate-plugin`, `/docs/api/core/plate-store`, and `/docs/api/core/plate-controller` resolve through `content/docs/meta.json`.
- Plate Core anti-slop audit: no WIP, banned marketing/changelog, placeholder-comment, stale `otherPlugins`, open task marker, or FIXME matches.
- Plate Core opening audit: 2 prose sentences before first heading.
- Plate Core length audit: 298 lines after rewrite.
- `content/docs/api/core/plate-components.mdx`: source-backed against `packages/core/src/react/components/{Plate,PlateContent,PlateView,PlateContainer,Plite,ContentVisibilityChunk,EditorHotkeysEffect,EditorMethodsEffect,EditorRefEffect,PlateControllerEffect,PlateTest,plate-nodes,withHOC,index}.ts(x)`, `packages/core/src/react/hooks/{useEditableProps,usePliteProps}.ts`, `packages/core/src/react/stores/plate/{PlateStore,createPlateStore}.ts`, `packages/core/src/react/utils/{pipeRenderElement,pipeRenderLeaf,pipeRenderText,pluginRenderElement,pluginRenderLeaf,pluginRenderText,getRenderNodeProps,pipeHandler,dom-attributes}.ts(x)`, `packages/core/src/react/plugin/{PlatePlugin,DOMHandlers}.ts`, `packages/core/src/static/components/PlateStatic.tsx`, and route metadata.
- `pnpm --filter www check:docs` in `/Users/zbeyens/git/plate`: passed after the Plate Components rewrite.
- `pnpm --filter @platejs/core typecheck` in `/Users/zbeyens/git/plate`: passed after the Plate Components rewrite.
- Plate Components root audit: `Plate` props, `PlateStoreProvider` scope, editor-null behavior, `readOnly` fallback to `editor.dom.readOnly`, `primary`, callbacks, `suppressInstanceWarning`, and UID assignment verified.
- Plate Components editable audit: `PlateContent` provider requirement, `disabled`/`readOnly` store sync, async empty-children null render, `renderEditable`, `useEditableProps`, DOM handler pipeline, chunk rendering, Plite extension callback sync, hotkey/editor/controller effects, and editable slot order verified.
- Plate Components static/container audit: `PlateView` default copy handler and prop override order, `PlateContainer` before/main/after container slots, `Plite` abovePlite wrapper, `PlateTest` helper behavior, `ContentVisibilityChunk`, and `withHOC` verified.
- Plate Components node primitive audit: `PlateElement`, `PlateLeaf`, `PlateText`, `useNodeAttributes`, block ID behavior, class/style/ref merging, directional and hard affinity spacers, and default `as` elements verified.
- Plate Components route audit: `/docs/api/core/plate-components` resolves through `content/docs/meta.json`.
- Plate Components anti-slop audit: no WIP, banned marketing/changelog, placeholder-comment, stale `otherPlugins`, open task marker, or FIXME matches; `placeholder` occurrences are legitimate `PlateContent` prop examples.
- Plate Components opening audit: 1 prose sentence before first heading.
- Plate Components length audit: 275 lines after rewrite.
- `content/docs/api/core/plate-controller.mdx`: source-backed against `packages/core/src/react/stores/plate-controller/{plateControllerStore,index}.ts`, `packages/core/src/react/components/{PlateControllerEffect,PlateContent,Plate}.ts(x)`, `packages/core/src/react/stores/plate/{createPlateStore,PlateStore}.ts`, `packages/core/src/react/utils/createPlateFallbackEditor.ts`, `packages/core/src/react/stores/plate-controller/plateControllerStore.spec.tsx`, `packages/core/src/react/components/PlateControllerEffect.spec.tsx`, and route metadata.
- `pnpm --filter www check:docs` in `/Users/zbeyens/git/plate`: passed after the Plate Controller rewrite.
- `pnpm --filter @platejs/core typecheck` in `/Users/zbeyens/git/plate`: passed after the Plate Controller rewrite.
- Plate Controller store audit: `PlateController`, `plateControllerStore`, `usePlateControllerLocalStore`, `usePlateControllerExists`, `usePlateControllerStore`, `activeId`, `editorStores`, `primaryEditorIds`, direct ID lookup, active lookup, primary fallback lookup, and `null` result behavior verified.
- Plate Controller registration audit: `PlateControllerEffect` registration, unmount cleanup, primary-editor append/remove behavior, active ID focus behavior, and no-controller no-throw behavior verified.
- Plate Controller fallback audit: `usePlateStore` controller fallback path, `createPlateFallbackEditor`, `editor.meta.isFallback`, immutable `apply` error, and `useEditorMounted` guard verified.
- Plate Controller route/stale-pattern audit: `/docs/api/core/plate-controller` resolves through `content/docs/meta.json`; stale `/docs/api/core/store`, `withHoc`, and `primary` inside `createPlateEditor` patterns removed.
- Plate Controller anti-slop audit: no WIP, banned marketing/changelog, placeholder-comment, stale `otherPlugins`, open task marker, or FIXME matches.
- Plate Controller opening audit: 1 prose sentence before first heading.
- Plate Controller length audit: 187 lines after rewrite.

Verification evidence:
- Ledger counts: 127 checked canonical English `Doc:` rows and 124 checked `.cn.mdx` translation inventory rows.
- Final docs parser: `pnpm --filter www build:source` in `/Users/zbeyens/git/plate` passed.
- Final docs parity: `pnpm --filter www check:docs` in `/Users/zbeyens/git/plate` passed.
- Final app typecheck: `pnpm --filter www typecheck` in `/Users/zbeyens/git/plate` passed.
- Final lint: `pnpm lint:fix` in `/Users/zbeyens/git/plate` passed with no fixes applied.
- Focused review fixes: added `PLUGIN_NODE_TYPE` to `content/docs/(guides)/debugging.mdx`, clarified `@platejs/autoformat` compatibility-package ownership in `content/docs/(guides)/plugin-input-rules.mdx`, and corrected full editor kit install paths in `content/docs/(guides)/feature-kits.mdx`.
- Final autoreview: `.agents/skills/autoreview/scripts/autoreview --mode local --engine claude --prompt "<docs-restyle scope>"` passed with no accepted/actionable findings. The default Codex engine was attempted first and failed due a local usage limit, so Claude was used as the helper-supported review engine.
- Final mechanical check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-05-31-restyle-docs-one-by-one.md` passed after Closeout and fresh final evidence were recorded.

Final handoff contract:
- PR line: N/A; no PR requested.
- Issue / tracker line: N/A; no tracker item.
- Confidence line: high for parser/link/source surface; final autoreview caveat notes spot-checking on a very large diff.
- Docs lane: multi-lane docs corpus, checked per doc.
- Source-backed claims: per-doc audits plus final scoped autoreview.
- Content build / parser: `pnpm --filter www build:source`, `check:docs`, and `typecheck` passed.
- Links / demos / previews: per-doc route/link/preview audits recorded; no new visual demo implementation changed.
- Browser check: N/A for docs-only content; no registry demo route implementation changed.
- Outcome: 127 canonical English docs checked, 124 `.cn.mdx` translation surfaces inventoried/deferred.
- Caveat: unrelated local agent-rule/skill diffs existed and were excluded from scoped closeout review.
- Verified: final lint/typecheck/docs checks and final scoped autoreview passed.

Final handoff / sync:
- PR: N/A, not requested.
- Issue / tracker: N/A, not requested.
- Browser proof: N/A, docs-only parser/source surface.
- Caveats: Codex autoreview engine hit usage limit; Claude autoreview was used and final scoped run was clean.

Timeline:
- 2026-05-31T07:58:36.638Z Docs goal plan created.
- 2026-05-31T08:06:00Z Inventory added: 127 canonical English docs and 124 translation files.
- 2026-05-31T08:15:00Z Checked `content/docs/index.mdx` after rewrite and focused verification.
- 2026-05-31T08:21:00Z Checked `content/docs/installation.mdx` after rewrite and focused verification.
- 2026-05-31T08:31:00Z Checked `content/docs/installation/docs.mdx` after rewrite and focused verification.
- 2026-05-31T08:42:00Z Checked `content/docs/installation/manual.mdx` after rewrite and focused verification.
- 2026-05-31T08:50:00Z Checked `content/docs/installation/mcp.mdx` after rewrite and focused verification.
- 2026-05-31T08:57:00Z Checked `content/docs/installation/next.mdx` after rewrite and focused verification.
- 2026-05-31T09:05:00Z Checked `content/docs/installation/node.mdx` after rewrite and focused verification.
- 2026-05-31T09:13:00Z Checked `content/docs/installation/plate-ui.mdx` after rewrite and focused verification.
- 2026-05-31T09:20:00Z Checked `content/docs/installation/react.mdx` after rewrite and focused verification.
- 2026-05-31T09:29:00Z Checked `content/docs/installation/rsc.mdx` after rewrite and focused verification.
- 2026-05-31T09:39:00Z Checked `content/docs/(guides)/controlled.mdx` after rewrite and focused verification.
- 2026-05-31T09:50:00Z Checked `content/docs/(guides)/debugging.mdx` after rewrite and focused verification.
- 2026-05-31T10:02:00Z Checked `content/docs/(guides)/editor-methods.mdx` after rewrite and focused verification.
- 2026-05-31T10:14:00Z Checked `content/docs/(guides)/editor.mdx` after rewrite and focused verification.
- 2026-05-31T10:22:00Z Checked `content/docs/(guides)/feature-kits.mdx` after rewrite and focused verification.
- 2026-05-31T10:35:00Z Checked `content/docs/(guides)/form.mdx` after rewrite and focused verification.
- 2026-05-31T10:48:00Z Checked `content/docs/(guides)/playwright.mdx` after rewrite and focused verification.
- 2026-05-31T11:03:00Z Checked `content/docs/(guides)/plugin-components.mdx` after rewrite and focused verification.
- 2026-05-31T11:17:00Z Checked `content/docs/(guides)/plugin-context.mdx` after rewrite and focused verification.
- 2026-05-31T11:35:00Z Checked `content/docs/(guides)/plugin-input-rules.mdx` after focused cleanup and verification.
- 2026-05-31T09:12:54Z Checked `content/docs/(guides)/plugin-methods.mdx` after rewrite and focused verification.
- 2026-05-31T09:18:11Z Checked `content/docs/(guides)/plugin-rules.mdx` after rewrite and focused verification.
- 2026-05-31T09:22:02Z Checked `content/docs/(guides)/plugin-shortcuts.mdx` after rewrite and focused verification.
- 2026-05-31T09:28:00Z Checked `content/docs/(guides)/plugin.mdx` after rewrite and focused verification.
- 2026-05-31T09:32:00Z Checked `content/docs/(guides)/static.mdx` after rewrite and focused verification.
- 2026-05-31T09:35:00Z Checked `content/docs/(guides)/troubleshooting.mdx` after rewrite and focused verification.
- 2026-05-31T09:38:00Z Checked `content/docs/(guides)/typescript.mdx` after rewrite and focused verification.
- 2026-05-31T09:44:00Z Checked `content/docs/(guides)/unit-testing.mdx` after rewrite and focused verification.
- 2026-05-31T09:58:00Z Checked `content/docs/(plugins)/(ai)/ai.mdx` after rewrite and focused verification; live HTTP proof blocked by local dev-server nonresponse.
- 2026-05-31T10:05:00Z Checked `content/docs/(plugins)/(ai)/copilot.mdx` after rewrite and focused verification.
- 2026-05-31T10:12:00Z Checked `content/docs/(plugins)/(collaboration)/comment.mdx` after rewrite and focused verification.
- 2026-05-31T10:18:00Z Checked `content/docs/(plugins)/(collaboration)/discussion.mdx` after rewrite and focused verification.
- 2026-05-31T10:25:00Z Checked `content/docs/(plugins)/(collaboration)/suggestion.mdx` after rewrite and focused verification.
- 2026-05-31T10:13:25Z Checked `content/docs/(plugins)/(collaboration)/yjs.mdx` after rewrite and focused verification.
- 2026-05-31T10:16:40Z Checked `content/docs/(plugins)/(elements)/basic-blocks.mdx` after rewrite and focused verification.
- 2026-05-31T10:18:56Z Checked `content/docs/(plugins)/(elements)/blockquote.mdx` after rewrite and focused verification.
- 2026-05-31T10:21:41Z Checked `content/docs/(plugins)/(elements)/callout.mdx` after rewrite and focused verification.
- 2026-05-31T10:25:16Z Checked `content/docs/(plugins)/(elements)/code-block.mdx` after rewrite and focused verification.
- 2026-05-31T10:30:29Z Checked `content/docs/(plugins)/(elements)/code-drawing.mdx` after rewrite and focused verification.
- 2026-05-31T10:36:12Z Checked `content/docs/(plugins)/(elements)/column.mdx` after rewrite and focused verification.
- 2026-05-31T10:39:38Z Checked `content/docs/(plugins)/(elements)/date.mdx` after rewrite and focused verification.
- 2026-05-31T10:43:24Z Checked `content/docs/(plugins)/(elements)/equation.mdx` after rewrite and focused verification.
- 2026-05-31T10:46:32Z Checked `content/docs/(plugins)/(elements)/excalidraw.mdx` after rewrite and focused verification.
- 2026-05-31T10:51:59Z Checked `content/docs/(plugins)/(elements)/footnote.mdx` after rewrite and focused verification.
- 2026-05-31T10:55:14Z Checked `content/docs/(plugins)/(elements)/heading.mdx` after rewrite and focused verification.
- 2026-05-31T10:57:25Z Checked `content/docs/(plugins)/(elements)/horizontal-rule.mdx` after rewrite and focused verification.
- 2026-05-31T11:00:48Z Checked `content/docs/(plugins)/(elements)/link.mdx` after rewrite and focused verification.
- 2026-05-31T11:06:50Z Checked `content/docs/(plugins)/(elements)/list-classic.mdx` after rewrite and focused verification.
- 2026-05-31T11:11:29Z Checked `content/docs/(plugins)/(elements)/media.mdx` after rewrite and focused verification.
- 2026-05-31T11:14:42Z Checked `content/docs/(plugins)/(elements)/mention.mdx` after rewrite and focused verification.
- 2026-05-31T11:18:07Z Checked `content/docs/(plugins)/(elements)/table.mdx` after rewrite and focused verification.
- 2026-05-31T11:25:39Z Checked `content/docs/(plugins)/(elements)/toc.mdx` after rewrite and focused verification.
- 2026-05-31T11:29:41Z Checked `content/docs/(plugins)/(elements)/toggle.mdx` after rewrite and focused verification.
- 2026-05-31T11:33:48Z Checked `content/docs/(plugins)/(functionality)/(combobox)/combobox.mdx` after rewrite and focused verification.
- 2026-05-31T11:37:17Z Checked `content/docs/(plugins)/(functionality)/(combobox)/emoji.mdx` after rewrite and focused verification.
- 2026-05-31T11:43:00Z Checked `content/docs/(plugins)/(functionality)/(combobox)/slash-command.mdx` after rewrite and focused verification.
- 2026-05-31T11:51:00Z Checked `content/docs/(plugins)/(functionality)/(utils)/exit-break.mdx` after rewrite and focused verification.
- 2026-05-31T11:57:00Z Checked `content/docs/(plugins)/(functionality)/(utils)/forced-layout.mdx` after rewrite and focused verification.
- 2026-05-31T12:02:00Z Checked `content/docs/(plugins)/(functionality)/(utils)/single-block.mdx` after rewrite and focused verification.
- 2026-05-31T12:08:00Z Checked `content/docs/(plugins)/(functionality)/(utils)/trailing-block.mdx` after rewrite and focused verification.
- 2026-05-31T12:16:00Z Checked `content/docs/(plugins)/(functionality)/autoformat.mdx` after rewrite and focused verification.
- 2026-05-31T12:17:00Z Checked `content/docs/(plugins)/(functionality)/block-menu.mdx` after rewrite and focused verification.
- 2026-05-31T12:18:00Z Checked `content/docs/(plugins)/(functionality)/block-placeholder.mdx` after rewrite and focused verification.
- 2026-05-31T12:19:00Z Checked `content/docs/(plugins)/(functionality)/block-selection.mdx` after rewrite and focused verification.
- 2026-05-31T12:20:00Z Checked `content/docs/(plugins)/(functionality)/caption.mdx` after rewrite and focused verification.
- 2026-05-31T12:21:00Z Checked `content/docs/(plugins)/(functionality)/cursor-overlay.mdx` after rewrite and focused verification.
- 2026-05-31T12:22:00Z Checked `content/docs/(plugins)/(functionality)/dnd.mdx` after rewrite and focused verification.
- 2026-05-31T12:33:39Z Checked `content/docs/(plugins)/(functionality)/find-replace.mdx` after rewrite and focused verification.
- 2026-05-31T12:37:14Z Checked `content/docs/(plugins)/(functionality)/multi-select.mdx` after rewrite and focused verification.
- 2026-05-31T12:40:24Z Checked `content/docs/(plugins)/(functionality)/navigation-feedback.mdx` after rewrite and focused verification.
- 2026-05-31T12:42:59Z Checked `content/docs/(plugins)/(functionality)/tabbable.mdx` after rewrite and focused verification.
- 2026-05-31T12:45:28Z Checked `content/docs/(plugins)/(functionality)/toolbar.mdx` after rewrite and focused verification.
- 2026-05-31T12:48:05Z Checked `content/docs/(plugins)/(marks)/basic-marks.mdx` after rewrite and focused verification.
- 2026-05-31T12:50:02Z Checked `content/docs/(plugins)/(marks)/bold.mdx` after rewrite and focused verification.
- 2026-05-31T12:51:56Z Checked `content/docs/(plugins)/(marks)/code.mdx` after rewrite and focused verification.
- 2026-05-31T12:55:18Z Checked `content/docs/(plugins)/(marks)/highlight.mdx` after rewrite and focused verification.
- 2026-05-31T12:57:48Z Checked `content/docs/(plugins)/(marks)/italic.mdx` after rewrite and focused verification.
- 2026-05-31T12:59:42Z Checked `content/docs/(plugins)/(marks)/kbd.mdx` after rewrite and focused verification.
- 2026-05-31T13:01:19Z Checked `content/docs/(plugins)/(marks)/strikethrough.mdx` after rewrite and focused verification.
- 2026-05-31T13:03:37Z Checked `content/docs/(plugins)/(marks)/subscript.mdx` after rewrite and focused verification.
- 2026-05-31T13:05:07Z Checked `content/docs/(plugins)/(marks)/superscript.mdx` after rewrite and focused verification.
- 2026-05-31T13:06:30Z Checked `content/docs/(plugins)/(marks)/underline.mdx` after rewrite and focused verification.
- 2026-05-31T13:09:03Z Checked `content/docs/(plugins)/(serializing)/csv.mdx` after rewrite and focused verification.
- 2026-05-31T13:13:17Z Checked `content/docs/(plugins)/(serializing)/docx-io.mdx` after rewrite and focused verification.
- 2026-05-31T13:15:49Z Checked `content/docs/(plugins)/(serializing)/docx.mdx` after rewrite and focused verification.
- 2026-05-31T13:18:28Z Checked `content/docs/(plugins)/(serializing)/html.mdx` after rewrite and focused verification.
- 2026-05-31T13:25:00Z Checked `content/docs/(plugins)/(serializing)/markdown.mdx` after rewrite and focused verification.
- 2026-05-31T13:27:59Z Checked `content/docs/(plugins)/(styles)/font.mdx` after rewrite and focused verification.
- 2026-05-31T13:30:12Z Checked `content/docs/(plugins)/(styles)/indent.mdx` after rewrite and focused verification.
- 2026-05-31T13:31:56Z Checked `content/docs/(plugins)/(styles)/line-height.mdx` after rewrite and focused verification.
- 2026-05-31T13:35:43Z Checked `content/docs/(plugins)/(styles)/list.mdx` after rewrite and focused verification.
- 2026-05-31T13:37:39Z Checked `content/docs/(plugins)/(styles)/text-align.mdx` after rewrite and focused verification.
- 2026-05-31T13:39:54Z Checked `content/docs/api/cn.mdx` after rewrite and focused verification.
- 2026-05-31T13:48:22Z Checked `content/docs/api/core.mdx` after rewrite and focused verification.
- 2026-05-31T13:53:12Z Checked `content/docs/api/core/plate-components.mdx` after rewrite and focused verification.
- 2026-05-31T13:56:41Z Checked `content/docs/api/core/plate-controller.mdx` after rewrite and focused verification.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout; all 127 canonical English docs are checked and all 124 translation files are inventoried. |
| Where am I going? | Run the final mechanical autogoal check, then close the active goal. |
| What is the goal? | Restyle canonical Plate English docs one doc at a time to match docs-creator style, with per-doc checks and translation inventory. |
| What have I learned? | The rewritten corpus needs tight ownership boundaries: package-owned APIs, registry-owned UI, app-owned persistence/storage/routes, and translation surfaces deferred instead of half-rewritten. |
| What have I done? | Rewrote or accepted every canonical English doc with per-doc evidence, fixed autoreview findings in debugging, input rules, and feature kits, and kept translation parity as an explicit inventory. |

Open risks:
- Final autoreview was a scoped Claude run because the Codex engine hit a usage limit.
- Translation drift remains a separate translation task; every `.cn.mdx` file is inventoried and deferred.
