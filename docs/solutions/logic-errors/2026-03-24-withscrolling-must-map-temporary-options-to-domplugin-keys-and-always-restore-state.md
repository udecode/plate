---
module: Core
date: 2026-03-24
problem_type: logic_error
component: plugin_system
symptoms:
  - "withScrolling(...) enabled auto-scroll but ignored temporary mode and operations overrides"
  - "Thrown callbacks could leave DOMPlugin scrolling state dirty for later operations"
root_cause: logic_error
resolution_type: code_change
severity: medium
tags:
  - core
  - dom
  - scrolling
  - plugin-options
  - testing
  - coverage
---

# withScrolling must map temporary options to DOMPlugin keys and always restore state

## Problem

Direct coverage on `withScrolling(...)` exposed two quiet failures in the temporary DOM scrolling helper.

The helper accepted `{ mode, operations, scrollOptions }`, but it spread those fields directly into the DOM plugin option store. The real store keys are `scrollMode`, `scrollOperations`, and `scrollOptions`, so the temporary overrides never actually drove the scrolling logic.

It also reset state only after the callback returned normally. If the callback threw, the editor could keep `AUTO_SCROLL` enabled and retain the temporary DOMPlugin options.

## Root cause

The helper treated its input shape like the DOMPlugin store shape.

That assumption was wrong. `mode` and `operations` are convenience names on the helper API, not persisted option keys.

The reset path also relied on straight-line control flow instead of a `try/finally`.

## Fix

Map the helper options onto the real DOMPlugin keys before writing them:

- `mode -> scrollMode`
- `operations -> scrollOperations`
- `scrollOptions -> scrollOptions`

Then wrap the callback in `try/finally` so both `AUTO_SCROLL` and the previous DOMPlugin options are restored even when the callback throws.

The fix also keeps the nested option objects merged instead of replacing the whole store branch with partial data.

## Verification

These checks passed:

```bash
bun test packages/core/src/lib/plugins/dom/withScrolling.spec.ts
bun test packages/code-block/src/lib/deserializer/htmlDeserializerCodeBlock.spec.ts packages/core/src/lib/plugins/html/HtmlPlugin.spec.ts packages/core/src/lib/plugins/ParserPlugin.spec.ts packages/core/src/lib/plugins/AstPlugin.spec.ts packages/core/src/lib/plugins/dom/withScrolling.spec.ts packages/core/src/lib/plugins/html/utils/htmlElementToLeaf.spec.ts packages/core/src/static/deserialize/htmlStringToEditorDOM.spec.ts packages/core/src/static/pluginRenderTextStatic.spec.tsx packages/core/src/static/pluginRenderLeafStatic.spec.tsx packages/core/src/static/pluginRenderElementStatic.spec.tsx packages/core/src/static/utils/getSelectedDomFragment.spec.tsx packages/core/src/static/utils/pipeDecorate.spec.ts packages/core/src/static/plugins/ViewPlugin.spec.ts packages/excalidraw/src/lib/BaseExcalidrawPlugin.spec.ts packages/dnd/src/transforms/onDropNode.spec.ts packages/link/src/lib/transforms/upsertLink.spec.tsx packages/markdown/src/lib/serializer/convertNodesSerialize.spec.ts
pnpm turbo build --filter=./packages/core --filter=./packages/code-block --filter=./packages/excalidraw --filter=./packages/dnd --filter=./packages/link --filter=./packages/markdown
pnpm turbo typecheck --concurrency=1 --filter=./packages/core --filter=./packages/code-block --filter=./packages/excalidraw --filter=./packages/dnd --filter=./packages/link --filter=./packages/markdown
pnpm lint:fix
```

## Prevention

For helper APIs that temporarily override plugin options, test both of these explicitly:

- the temporary values are written under the real store keys
- the original state comes back after both success and failure paths

Otherwise the helper can look correct in types and still be functionally dead.
