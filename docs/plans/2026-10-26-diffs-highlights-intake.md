# Intake: should Plate use Pierre's Highlights?

Status: done: 6 items, 0 chips offered, 1 folded
Page: https://claude.ai/artifact/BP6uG2XnyScSncnwK6m1Rd
Playbook: verdict

No, not now. Highlights is a fast WebAssembly syntax highlighter from the team behind `@pierre/diffs`. Plate's code blocks get their colors from Lowlight, which wraps highlight.js. A swap would drop the colors of stored code blocks in 30 of the 89 languages the picker offers, Auto included, because Highlights 0.2.0 has no lexer for them and never guesses a language. Pages that block WebAssembly would still need Lowlight. And Plate's code blocks spend little of their time in the highlighter. In the September runs on a 10,000-line block, Lowlight took about 57 ms of a 612 ms keystroke, and under 2% of static rendering. One question stays open. Would its incremental tokenizer help huge code blocks? The open quiet-host timing task t_7f07d1f3 now measures that too.

## Brief

### What will change?

Nothing changes in Plate, and we keep Lowlight. The timing task for huge code blocks already on the board now also checks how much of each keystroke Lowlight takes, and how long Highlights would take on the same text.

### What could go wrong?

If Lowlight turns out to take most of each keystroke, a faster highlighter would matter after all. The timing task will tell us. Only then do we decide how Plate should plug in another highlighter.

## Pushback

- **The 298× is against Shiki, and Plate's editor does not use Shiki.** Lowlight wraps highlight.js. On the page's own browser table, Highlights takes 0.08 s and highlight.js 1.35 s, about 17×, and that compares token output with HTML output. The page says the table measures speed only, not highlighting quality.
- **Three different language counts.** The page says 84. The docs table lists 121. The published 0.2.0 package maps 81 lexers, plain text included. The docs run ahead of npm, so judge the package.
- **"Drop-in replacement for Shiki" holds only inside `@pierre/diffs`.** There it is one option. On its own, Highlights returns Shiki-shaped tokens whose boundaries and classes can differ. It takes no TextMate grammars and has no transformer hook.
- **It cannot run everywhere Plate runs.** It compiles its WebAssembly when imported and needs SIMD, and a Content Security Policy can block it. Its own docs say to fall back to Shiki's JavaScript engine, so adopting it means shipping two highlighters.
- **It is a seven-week-old beta.** Version 0.2.0 is its tenth release since 2026-09-09, and its docs say the API may still change.
- **The benchmarks are the vendor's.** They ran on an M4 Pro, and this run reran none of them.

## Items

| # | Item | Outcome | Scope | Strongest reason | Evidence | Next |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Replace Lowlight with Highlights in the native and static code-block kits | Stop | code | Lowlight already does the job for more languages. 30 of the 89 picker entries, Auto included, have no Highlights lexer, so stored blocks in them would lose their colors. Blocked WebAssembly still needs Lowlight, and Lowlight is a small share of the measured time | The kits build Lowlight with every grammar at `apps/www/src/registry/components/editor/code-block-lowlight.ts:387-394`. Auto calls `highlightAuto` at `packages/platejs/src/features/code-block/lib/BaseCodeBlockPlugin.ts:1063-1065`. The picker is `apps/www/src/registry/components/editor/code-block.tsx:35-125`. Highlights' Languages docs say it does not detect a language. The September time split is at `docs/research/sources/plite/performance.md:89` and `docs/plans/2026-09-29-static-document-rendering.md:397` | none |
| 2 | Use Highlights' `LiveTokenizer`, which re-tokenizes only the changed lines, for huge code blocks | Defer | code | The code subject rejects an incremental native parser until a matched benchmark exists. The September split put the decoration refresh (106 ms) and browser input (45 to 53 ms a character) ahead of Lowlight (57 ms) | `docs/plans/topics/code.md:21`, `docs/plans/2026-09-10-editor-performance-execution.md:111` | folded on t_7f07d1f3 |
| 3 | Make the syntax slot highlighter-neutral so apps can plug in Highlights | Stop | code | Speed is the only reason given, and speed alone earns no public provider. A Highlights backend also could not serve Auto, and Plate's rule says a backend must support every public option | `docs/vision/common.md:98-100`, `docs/vision/common.md:81-83`. The slot takes Lowlight's tree and paints class names only, at `packages/platejs/src/features/code-block/lib/BaseCodeBlockPlugin.ts:60-80`, while Highlights tokens carry colors | none |
| 4 | Replace Shiki on the docs site | Stop | none | Shiki already does the job. The docs build on rehype-pretty-code and Shiki transformers, and Highlights plugs into neither | `apps/www/source.config.ts:11`, `apps/www/src/lib/highlight-code.ts:5` and `:49`. Highlights' Highlighters docs say custom grammars need Shiki | none |
| 5 | Feed streamed code through Highlights' `StreamTokenizer` | Stop | code | Streamed text lands in the document, and the syntax reader repaints the block from it. A tokenizer fed from the stream would keep a second copy of text the editor owns | `packages/platejs/src/features/code-block/lib/BaseCodeBlockPlugin.ts:1038-1065`, `docs/vision/common.md:125-127` | none |
| 6 | Use Highlights inside the CodeMirror code view | Stop | code | CodeMirror already highlights incrementally with Lezer. In September's matched 10,000-line run it reached the frame in 61 ms, against 814 ms for native Plate | `apps/www/src/registry/components/editor/code-block-codemirror.tsx:5-10`, `docs/research/sources/tiptap/performance.md:21` | none |

## Order

1. Adopt nothing. Both kits keep Lowlight, and the syntax slot stays as it is.
2. Item 2 gets its numbers from t_7f07d1f3, which already has to time the 10,000-line block on a quiet host. Its finding now also asks for Lowlight's share of each key and for Highlights 0.2.0's full and incremental passes on the same text. If Lowlight is under a fifth of a key, no tokenizer swap can move the budget, and item 2 closes as a Stop. If it is most of a key and Highlights removes most of that, a design question on the highlighter slot and the missing languages comes next.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Where the Highlights timing runs | Added to the timing task already on the board, which uses the same 10,000-line block | A separate task | split highlights | detail |

## Close

This run landed this page and its decision log, and nothing else. It folded item 2's measurement onto t_7f07d1f3 and offered no new task.

The proof is source reads on `origin/next` at 238d4c3f08, the vendor page and its plain-text docs, and the published `@pierre/highlights` 0.2.0 package, unpacked but never run. A script counted the picker's languages against that package's language map. No benchmark, browser or bundle run happened here. Every timing on this page is a September 2026 receipt on older source, which proves only that source. So item 1's Stop comes from the language gap and the WebAssembly fallback, and item 2 stays a Defer until the new timing runs.
