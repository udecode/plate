# Issue 4613: code block paste must not autolink

## Tracker

- Source type: GitHub issue
- Source id: `#4613`
- Title: `Code with // comments pasted inside code blocks is incorrectly recognized as links`
- URL: `https://github.com/udecode/plate/issues/4613`
- Task type: bug
- Expected outcome: pasting plain code into an existing code block keeps the pasted text as plain code lines, without link wrapping or markdown-style link transforms
- Browser surface: likely no; the stable seam should be editor insert handlers and package tests

## Relevant area

- `packages/code-block/src/lib/withInsertDataCodeBlock.ts`
- `packages/link/src/lib/withLink.ts`
- `packages/core/src/lib/plugins/ParserPlugin.ts`
- existing code-block and link paste specs

## Learnings

- Recent code-block regressions in this repo were caused by structural assumptions around `code_line` nodes and stale decorate lifecycles
- This bug smells like the paste pipeline is still allowing link auto-insert logic to run while the selection is inside a code block

## Plan

1. Trace the paste path for plain-text clipboard data inside code blocks.
2. Add the smallest regression test at the real seam.
3. Implement the minimal guard or transform to keep code-block paste as plain text.
4. Run targeted tests, then package build, typecheck, and `lint:fix`.

## Progress

- Fetched the issue and comments.
- Read repo instructions, task skill, planning-with-files, learnings-researcher, and tdd skill docs.
- Read recent local learnings for code-block redecorate and structural line regressions.
