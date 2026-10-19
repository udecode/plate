---
review_scopes: [math]
verdict: pursue
review_basis: [2026-10-18-math-review]
review_commit: 3b7a3692482f8a7972dad2e7847ec6e7dce6b96d
review_inputs: [apps/www/src/registry/components/editor/math.tsx, apps/www/src/registry/components/editor/math-static.tsx, apps/www/src/registry/components/editor/math.spec.tsx, packages/platejs/src/docx/export/lib/docxStaticComponents.tsx, packages/platejs/src/math/lib/BaseEquationPlugin.ts, apps/www/src/registry/examples/values/equation-value.tsx, apps/www/src/registry/blocks/html-export/page.tsx, apps/www/src/registry/components/editor/plugins-static.ts, apps/www/src/registry/components/editor/fixed-toolbar.tsx, apps/www/src/registry/components/editor/floating-toolbar.tsx, docs/vision/plate.md]
review_upstreams: ['../tiptap@91c51be53c4655ef07e29ec489471524debfa0ca', '../BlockNote@1e26f1c5e1cd7df81df9d4ab2a853bf1b298b163', '../milkdown@6a4db480b00db8dd0322b517117dfa2154f3e2e2', '../lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988']
---

# Math: draw inline equations as inline math

Status: executed: inline equations draw in KaTeX inline mode, landing from the worktree
Topic: math
Playbook: verdict

**Pursue, and build it here. Inline equations render in KaTeX's inline mode; block equations keep display mode.** An inline equation is math inside a sentence, written `$...$` in Markdown, which TeX sets in text style. The copied `InlineEquationElement` and its static twin ask KaTeX for display mode instead, so an inline fraction draws at full display size. On `/blocks/html-export` the inline `\frac{\partial}{\partial t}` overlaps the next line in all three columns, and the static column keeps KaTeX's 1em display margin, because its `[&_.katex-display]:my-0` lacks the `!` that the live element needs to beat KaTeX's unlayered stylesheet. Word export already draws inline equations in inline mode, and so do Tiptap, BlockNote, Milkdown and the Lexical playground. Display mode came in with the first inline component in [udecode/plate#3923](https://github.com/udecode/plate/pull/3923), copied from the block element's options with no stated reason, and the same commit added the margin override to undo display mode's spacing. Suggested task t_b66b1550 asked the question, from the forward test of the [2026-10-18 math review](2026-10-18-math-review.md).

## Brief

### What will change?

Inline equations now draw at text size in the editor, the read-only view and HTML export, the way LaTeX, Word export and other editors draw them. Block equations don't change.

### What could go wrong?

Every inline equation gets a little smaller, fractions the most. An app that wants the big size back sets `displayMode: true` in its copied components. The close says what got checked and what didn't.

## Teach

An equation in Plate is a small node that keeps its TeX source. The copied components hand that source to KaTeX, which draws math in one of two styles. Display style is for a formula on its own line: big fractions, limits above and below a sum, centered with space around it. Inline style is for math inside a sentence, with the same symbols sized to sit on the line of text.

Today block and inline equations both ask for display style. So an inline fraction draws at full size, pushes its line taller and, in a narrow column, overlaps the next line. The read-only copy also keeps display style's empty space above and below each inline equation.

The change asks for inline style for inline equations only. Block equations stay as they are, and Word export already worked this way.

## Demo

1. Open `/blocks/equation-demo` and look at item 3, "Inline equation example". The inline equation now sits on its line at text size, while the two block equations stay centered and full size. Further down, the Schrödinger line is no taller than the quadratic formula line.
   ![before](artifacts/2026-10-19-inline-equation-display-mode/before-equation-demo.jpg) ![after](artifacts/2026-10-19-inline-equation-display-mode/after-equation-demo.jpg)
2. Open `/blocks/html-export` and find "The Schrödinger equation" in the Editor, EditorView and HTML columns. Its fraction used to draw at full formula size and crowd the next line. Now it draws at text size inside its own line in every column.
   ![before](artifacts/2026-10-19-inline-equation-display-mode/before-inline-fraction.png) ![after](artifacts/2026-10-19-inline-equation-display-mode/after-inline-fraction.png)
3. On `/blocks/equation-demo`, click `E = mc²`. The source popover opens under it, and Escape closes it with the caret after the equation, as before.

## Public API

The copied editor's inline equation asks KaTeX for inline mode, and its class drops the display-margin override that no longer has a display wrapper to style.

```tsx before
// apps/www/src/registry/components/editor/math.tsx
useEquation({
  element,
  katexRef,
  options: {
    displayMode: true,
    errorColor: '#cc0000',
    fleqn: false,
    leqno: false,
    macros: { '\\f': '#1f(#2)' },
    output: 'htmlAndMathml',
    strict: 'warn',
    throwOnError: false,
    trust: false,
  },
});
```

```tsx after
// apps/www/src/registry/components/editor/math.tsx
useEquation({
  element,
  katexRef,
  options: {
    displayMode: false,
    errorColor: '#cc0000',
    fleqn: false,
    leqno: false,
    macros: { '\\f': '#1f(#2)' },
    output: 'htmlAndMathml',
    strict: 'warn',
    throwOnError: false,
    trust: false,
  },
});
```

The copied static inline equation does the same.

```tsx before
// apps/www/src/registry/components/editor/math-static.tsx
const html = katex.renderToString(props.element.latex, {
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

```tsx after
// apps/www/src/registry/components/editor/math-static.tsx
const html = katex.renderToString(props.element.latex, {
  displayMode: false,
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

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| How big inline equations draw | At the size of the text around them, as LaTeX, Word export and other editors draw them | Keep drawing them at full formula size | display inline | big |
| The margin fix on inline equations | Delete it, since inline math has no display wrapper to fix | Keep it for apps that switch back to display size | keep margin fix | detail |
| The popover test's check of the KaTeX option | Drop it, since it checked an option passed to a stand-in, not what a user sees | Flip it to check the new option | pin inline option | detail |
| Spelling out the option | Write it out as false, beside the other options the copied code spells out | Leave it out and use KaTeX's default | default option | detail |
| Next step | Build now, since the evidence leaves one clear pick | Stop at the verdict | hold | detail |

## Evidence

Model: claude-opus-5-5 at xhigh effort, read from this session's metadata.

Prior work. `node tooling/scripts/review-ledger.mjs lookup math` names the [2026-10-18 math review](2026-10-18-math-review.md) as the head, a Pursue that moved KaTeX out of `platejs/math` and kept every rendered equation byte for byte. Its forward test listed inline display mode as an older error, and its Open work carded this question. A search of `docs/plans` for `displayMode` and `katex-display` finds no other plan that chose a mode for inline equations.

### Requirements

- An inline equation sits inside a line of text. It is stored as `inlineEquation` with a `latex` string, typed with the `$` rule and mapped to Markdown `inlineMath` (`packages/platejs/src/math/lib/BaseEquationPlugin.ts`). TeX sets `$...$` math in text style.
- Word export draws an inline equation as inline Word math, from KaTeX MathML with `displayMode` false (`packages/platejs/src/docx/export/lib/docxStaticComponents.tsx:83-94`), so the page and Word should agree.
- Copied UI owns presentation ([plate.md](../vision/plate.md)), so the pick lives in `math.tsx` and `math-static.tsx`, and no package changes.
- Block equations keep display mode, centered on their own line.

### Lanes

1. **Keep display mode for inline equations. Loses.** On `/blocks/equation-demo` at 1280 by 900 the inline Schrödinger equation is 40 px tall and stretches its line to 41 px, where plain lines are 25 px. On `/blocks/html-export` its fraction overlaps the next line in the Editor, EditorView and HTML iframe columns, and each static inline equation is 40 px tall because KaTeX's `.katex-display { margin: 1em 0 }` beats the static element's layered `[&_.katex-display]:my-0`. Measurements: `base-measure-a1.json` and `base-measure-html-export-a1.json`; frames: `before-inline-fraction.png` and `before-html-export.jpg`, all in the run directory.
2. **Inline mode, written as `displayMode: false`, with both margin overrides deleted. Wins.** It matches TeX, Word export and every editor read below, and it removes two classes that existed only to undo display mode. The predicted benefit is that no inline equation keeps a `.katex-display` wrapper and the Schrödinger line shrinks toward the plain line height. The browser check marks it held or falsified.
3. **Inline mode by leaving the key out. Loses narrowly.** KaTeX defaults to inline mode, so the output is the same. The copied components spell out every option, defaults such as `fleqn: false` included, so an explicit `false` beside the block's `true` shows the reader the choice.
4. **Add the missing `!` to the static margin override. Loses.** It fixes the static column's spacing and keeps display-size math on a text line, so the overlap stays.
5. **Strongest deletion: share one options object per file between block and inline. Not this question.** The two elements would differ only by `displayMode`, and the output would not change. The copied code keeps each element's options at its call, and that reshaping is not what this task asked.
6. **The rule is wrong. Not a lane.** No rule blocks the target.

### What other editors do

Read from sibling checkouts on 2026-10-19; nothing ran. Every editor that ships inline math draws it in KaTeX's inline mode.

| Editor | Inline math | Block math | Source |
| --- | --- | --- | --- |
| Tiptap | KaTeX's default, inline mode, unless the app passes `katexOptions` | The same options as inline | `packages/extension-mathematics/src/extensions/InlineMath.ts:237-252`, `BlockMath.ts:233-252` |
| BlockNote | `displayMode: !inline` | Display mode | `packages/math-block/src/helpers/latexToHTMLString.ts:13,22`, `exporterHelpers/latexToMathML.ts:15` |
| Milkdown Crepe | `katex.render(code, dom, { throwOnError: false })`, inline mode | Forces `displayMode: true` | `packages/crepe/src/feature/latex/inline-latex.ts:37`, `index.ts:66-71` |
| Lexical playground | `displayMode: !inline` | Display mode | `packages/lexical-playground/src/ui/KatexRenderer.tsx:29`, `nodes/EquationNode.tsx:85` |
| Plate Word export | `displayMode` false | `displayMode` true | `packages/platejs/src/docx/export/lib/docxStaticComponents.tsx:83-94` |

### Dependents

- `documents`: unaffected. `docxStaticComponents.tsx` passes its own `displayMode` and reads nothing from the copied components.
- `ui`: affected through the copied static kit. `apps/www/src/registry/components/editor/plugins-static.ts` installs `BaseMathKit`, so every static render of an inline equation, such as `/blocks/html-export`, changes size. `apps/www/src/registry/components/editor/fixed-toolbar.tsx` and `apps/www/src/registry/components/editor/floating-toolbar.tsx` reach math only through toolbar buttons, which insert equations and draw none.
- `distribution`, `editing` and `persistence`: unaffected. They import only the plugin keys.

### History

- `cb44395d72` in [udecode/plate#3923](https://github.com/udecode/plate/pull/3923), 2024-12-26, added `inline-equation-element.tsx` with the block element's options, `displayMode: true` included, and `[&_.katex-display]:my-0` on its root. The PR body says the elements were added for showcasing and local testing, and gives no reason for display mode. `c32d3d678a`, 2024-12-28, added the static twin with the same options. `1fb72c5810`, the v2 move, added the spec check that the inline element passes `displayMode: true`.
- This review retains every verdict of the [2026-10-18 math review](2026-10-18-math-review.md) and reopens only the inline rendering mode, which that review kept byte for byte on purpose.
- External checkouts read on 2026-10-19: `../tiptap` at `91c51be53c`, `../BlockNote` at `1e26f1c5e1`, `../milkdown` at `6a4db480b0` and `../lexical` at `dd5c41b131`.

Proof limits: the review read source and measured the base in the desktop app's built-in browser at 1280 by 900 in light; the HTML iframe column was judged from its screenshot only.

## Close

Deviations first. The run reversed no pick. Beyond the two components, the change also cut the spec check that pinned `displayMode: true` on a mocked `katex.render`, added the registry changelog entry `2026-10-19-math-inline-mode`, regenerated the registry output that `build:registry` writes, and stated the inline mode in the English and Chinese equation pages' Rendering tables. After the edit, the dev server kept serving the old static element in its server render, and later the old changelog wording on `/docs/releases`, so each check ran again after a restart. The land's rebase onto `next` conflicted on seven generated registry files. The run regenerated them with `build:registry` and the changelog script instead of merging them by hand, then ran the hand drive again.

`InlineEquationElement` in `math.tsx` and `InlineEquationElementStatic` in `math-static.tsx` now pass `displayMode: false` and drop their `[&_.katex-display]:my-0` overrides. Block equations keep `displayMode: true`. No package changed.

Proof:

- Lane 2's predicted benefit held. On `/blocks/equation-demo` at 1280 by 900 in light, no inline equation has a `.katex-display` wrapper, each is 22 px tall, and the Schrödinger line went from 41 px to 32 px, the height of the quadratic line. On `/blocks/html-export` the Schrödinger equation went from 40 px to 22 px tall in the live and static columns, each static inline host went from 40 px to 24 px, and both block equations keep their wrapper at 44 and 49 px.
- After the rebase onto `next`, the hand drive covered all 72 cells `hand-drive.mjs check` listed for the nine changed files. That is seven desktop pages read from screenshots, `/cn/docs/equation` among them, 64 pages loaded without errors, and `/docs/releases`, where the changelog files show.
- `math.spec.tsx` passes its 5 tests, the registry build and changelog freshness checks pass, and lint passes on the three changed source files.

The proof used one browser, the desktop app's built-in Chromium, at one width. The check read the HTML iframe column from screenshots only. No Word export ran, because Word export reads none of the changed code.

The land, its `landed` ledger row, the session title, stopping the server, the cleanup scan and the report follow this close. Every other ask in the brief is done.

This plan leaves no open work. While it landed, 8c226bbbdb on `next` fixed the equation pages' other errors and gave the Chinese page its Rendering table, so the subject drops both of those Open work items, and the Chinese table's inline and static rows get the same inline-mode note.
