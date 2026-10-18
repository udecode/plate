# Math and equations

Page: https://claude.ai/artifact/2CB1wsDbu19vEN752jPaio

The ledger asks how math values, delimiters, inline selection and rendering should compose. Today an equation is a void element from `platejs/math`: `equation` for a block and `inlineEquation` inside text, each storing its LaTeX source as a flat `latex` string. The same entrypoint maps both to Markdown `math` and `inlineMath` and ships `MathRules` for `$...$` and `$$` input. It imports no KaTeX, so `platejs/math` and `platejs/math/react` load without it. The copied UI draws and edits equations with KaTeX and imports KaTeX's stylesheet itself. Word export turns each equation into Word math through KaTeX's MathML, and it owns the optional `katex` peer. Landed and proven: the flat shape, the Markdown mappings and the input rules in `BaseEquationPlugin.spec.tsx`, the copied popover's local draft with one undoable commit in `math.spec.tsx` and `math.lifecycle.spec.tsx`, Word math in `exportDocx.spec.ts`, and the move of KaTeX out of the plugins in the [2026-10-18 review](../2026-10-18-math-review.md), which adopted the [2026-10-04 audit](../../research/review-records/2026-10-04-math-audit.json)'s Pursue. The scope's history prints with `node tooling/scripts/review-ledger.mjs show math`.

## Public API

The copied editor kit installs both plugins with their Markdown input rules and imports KaTeX's own stylesheet.

```tsx
// apps/www/src/registry/components/editor/math.tsx
import 'katex/dist/katex.min.css';
import katex, { type KatexOptions } from 'katex';
import { MathRules } from 'platejs/math';
import { EquationPlugin, InlineEquationPlugin } from 'platejs/math/react';

export const MathKit = [
  InlineEquationPlugin.configure({
    component: InlineEquationElement,
    inputRules: [MathRules.markdown({ variant: '$' })],
  }),
  EquationPlugin.configure({
    component: EquationElement,
    inputRules: [MathRules.markdown({ on: 'break', variant: '$$' })],
  }),
];
```

The copied static element draws an equation with KaTeX directly.

```tsx
// apps/www/src/registry/components/editor/math-static.tsx
import 'katex/dist/katex.min.css';
import katex from 'katex';
import { BaseEquationPlugin, BaseInlineEquationPlugin } from 'platejs/math';

const html = katex.renderToString(element.latex, {
  displayMode: true,
  errorColor: '#cc0000',
  fleqn: false,
  leqno: false,
  macros: { '\\f': '#1f(#2)' },
  output: 'htmlAndMathml',
  strict: 'warn',
  throwOnError: false,
  trust: false,
});
```

Word export asks KaTeX for MathML itself, and its caller falls back to the TeX source when KaTeX throws.

```tsx
// packages/platejs/src/docx/export/lib/docxStaticComponents.tsx
import katex from 'katex';

import {
  BaseEquationPlugin,
  BaseInlineEquationPlugin,
  type EquationElement,
} from '../../../math';

return katex.renderToString(element.latex, {
  displayMode,
  output: 'mathml',
  throwOnError: true,
  trust: false,
});
```

## Main changes

- `packages/platejs/src/math/lib/BaseEquationPlugin.ts` owns `BaseEquationPlugin`, `BaseInlineEquationPlugin` and `MathRules`, and imports no KaTeX.
- `tooling/entrypoints/entrypoint-dag.mjs` gives the `docx/export` entrypoint the optional `katex` peer, and `math` has none. `packages/platejs/tsdown.config.mts` makes the build refuse `katex` in the built `dist/math/index.js` and `dist/math/react/index.js`.
- The copied `math.tsx` and `math-static.tsx` import `katex` and `katex/dist/katex.min.css`, and `apps/www/src/registry/registry-features.ts` installs `katex@0.16.22` with those two items only.
- `packages/platejs/src/docx/export/lib/internal/math.ts` converts the MathML KaTeX writes into Word math, as the [2026-10-10 Word plan](../2026-10-10-html-word-owns-word.md) built it.

## Layer and owner

| Change | Layer | Package | Why |
| --- | --- | --- | --- |
| KaTeX HTML for static equations | Plate | copied UI, the `math-static` registry item | Drawing an equation is presentation, and copied UI owns presentation. |
| KaTeX stylesheet | Plate | copied UI, the `math` and `math-static` registry items | KaTeX ships its own stylesheet, so the package needs no copy. |
| TeX to Word MathML | Plate | `platejs/docx/export` | The Word converter maps KaTeX's own MathML, so Word export calls KaTeX itself. |
| `katex` optional peer | Plate | `platejs/docx/export` in `tooling/entrypoints/entrypoint-dag.mjs` | An optional peer belongs to the entrypoint that imports it. |
| `katex@0.16.22` install pin | Plate | the `math` and `math-static` registry items | A direct import of `katex` infers no version. |

## What other editors do

Read from sibling checkouts on 2026-10-18; nothing ran. Every editor that ships math puts KaTeX in the code that draws it, and none puts it in a package that only defines the node.

| Editor | Math node | Who depends on KaTeX | Export |
| --- | --- | --- | --- |
| Tiptap | `extension-mathematics`, block and inline | That extension, as a peer; its node views call `katex.render` | None found |
| BlockNote | Optional `math-block` package | That package, as a dependency; it draws and ships `latexToMathML` | Its exporters get MathML from the math package |
| Milkdown | Crepe's `latex` feature | Crepe, the bundled editor, as a dependency | None found |
| Lexical | `EquationNode` in its playground app | Only the playground app | None |
| CKEditor 5 | No math feature in its repository | None | None |

Sources: `ueberdosis/tiptap@91c51be53c4655ef07e29ec489471524debfa0ca:packages/extension-mathematics`, `TypeCellOS/BlockNote@1e26f1c5e1cd7df81df9d4ab2a853bf1b298b163:packages/math-block`, `Milkdown/milkdown@6a4db480b00db8dd0322b517117dfa2154f3e2e2:packages/crepe/src/feature/latex`, `facebook/lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988:packages/lexical-playground/src/nodes/EquationNode.tsx` and `ckeditor/ckeditor5@14e73cc31b869ce483bd8449f40b9102ac7746da`.

## Open work

- The copied HTML export block loads KaTeX's stylesheet from a CDN at 0.16.18 (`apps/www/src/registry/blocks/html-export/page.tsx:109`), while the equations it exports come from KaTeX 0.16.22. owner: zbeyens, through a suggested task. stop: that task moves the link and its integrity hash to 0.16.22, or the owner drops it.
- The copied export toolbar imports `platejs/docx/export` at its top, so an editor with that toolbar loads Word export, and KaTeX with it, before anyone exports. owner: zbeyens, through a suggested task. stop: that task loads Word export on demand, or the owner drops it.
- Most feature pages still list `@tanstack/react-virtual` in their install line, which only the virtualized editor needs. owner: zbeyens, through a suggested task. stop: that task fixes the other install lines, or the owner drops it.
- `equation.cn.mdx` has no Ownership, Rendering or Markdown section, so Chinese readers miss the layer owners, the KaTeX options and the Markdown mapping. owner: zbeyens, through a suggested task. stop: that task brings the Chinese page level with `equation.mdx`, or the owner drops it.
- The equation page's manual install line omits `react-textarea-autosize` and `lucide-react`, which the copied components import, and the equation, Markdown and Node pages carry older errors: an escaped `\\\\int` example, Markdown math credited to `platejs/markdown`, an undefined `EditorKit`, and inline equations drawn in display mode. owner: zbeyens, through a suggested task. stop: that task fixes each item, or the owner drops it.
- `pnpm plite:release:packages` fails its entrypoint size receipt on 30 deltas that also fail at c83502bc25, and the receipt lists no math entry. owner: zbeyens, through a suggested task. stop: that task reviews each delta and rewrites the receipt, or the owner drops it.
- A copied registry item that imports `katex` later gets an unpinned range, because only `math` and `math-static` write `katex@0.16.22`. owner: zbeyens, through a suggested task. stop: that task pins every `katex` importer from one owner, or the owner drops it.
