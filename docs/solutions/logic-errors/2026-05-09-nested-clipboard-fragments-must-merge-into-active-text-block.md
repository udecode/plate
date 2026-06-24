---
title: Nested clipboard fragments must merge into active text block
date: 2026-05-09
category: docs/solutions/logic-errors
module: plite lexical harvest insert-fragment
problem_type: logic_error
component: testing_framework
symptoms:
  - Pasting copied code-line text inside a code line inserted a new top-level code block.
  - Browser proof showed six top-level editor blocks where the code-highlighting example should keep five.
  - The Lexical regression filename pointed at insert-nodes, but the portable behavior was clipboard fragment fitting.
root_cause: logic_error
resolution_type: code_fix
severity: medium
tags: [plite, lexical-harvest, clipboard, insert-fragment, code-block]
---

# Nested clipboard fragments must merge into active text block

## Problem

Lexical regression 1384 is named for insert nodes, but the portable behavior is
native clipboard insertion inside a code block. Copying text from a nested code
line and pasting it inside another code line should insert text into the active
line, not create a new code block sibling.

## Symptoms

- The package proof inserted a separate `code-block` before the target
  `code-block`.
- The browser proof showed six top-level blocks instead of five.
- The visible pasted text landed in a tiny standalone code block before the
  original code block.

## What Didn't Work

- Treating the row as a generic insert-nodes API test. The user-visible bug was
  clipboard fragment fitting.
- Fixing the code-highlighting example with a paste handler. That would hide a
  core insertion bug and duplicate editor policy in product code.
- Asserting only clipboard text. The broken path was structural, not text
  extraction.

## Solution

Add a package contract for inserting this fragment shape:

```ts
[
  {
    type: 'code-block',
    children: [{ type: 'code-line', children: [{ text: 'Add' }] }],
  },
]
```

into a collapsed selection inside an existing `code-line`.

Then update `insertFragment` nested fitting so a single nested text-block child
from the same structural container merges into the active nested text block. The
operation replaces the container's children in one logical operation and places
selection after the inserted text.

Finally, add a browser proof in the code-highlighting example that uses native
desktop clipboard shortcuts and asserts:

- the top-level block count stays unchanged;
- pasted text lands in the current code line;
- the following code line stays intact;
- the code block language metadata stays attached.

## Why This Works

Plite clipboard fragments preserve ancestor structure. A partial copy inside a
code line can therefore arrive as `code-block -> code-line -> text`, even though
the intended paste target is already inside a compatible `code-line`.

The nested fitting path already knows how to replace the shared structural
container. The missing branch was the single-child case where the copied
container has exactly one compatible text-block child. Merging that child's
children into the active text block preserves the surrounding code block and
keeps the paste local to the active line.

## Prevention

- For harvested clipboard rows, assert structure after paste, not just plain
  text.
- Add a package-level fragment shape proof before browser-only fixes when the
  failure inserts the wrong Plite node structure.
- Keep example paste handlers out unless the behavior is product policy rather
  than generic fragment fitting.

## Related Issues

- [Lexical codeblock harvest rows need data transfer boundaries](../best-practices/2026-05-09-lexical-codeblock-harvest-rows-need-data-transfer-boundaries.md)
