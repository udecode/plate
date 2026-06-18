---
title: Slate v2 character delete must share text-unit boundaries
date: 2026-05-09
category: docs/solutions/logic-errors
module: slate-v2 core delete
problem_type: logic_error
component: testing_framework
symptoms:
  - Reverse character delete removed only the trailing mark from Tamil and Thai grapheme sequences.
  - '`getCharacterDistance` and `tx.text.delete({ unit: "character", reverse: true })` disagreed on the same text.'
  - Lexical #7163 Unicode rows passed distance checks but failed destructive delete proof.
root_cause: logic_error
resolution_type: code_fix
severity: high
tags: [slate-v2, delete, text-units, unicode, grapheme, lexical-harvest]
---

# Slate v2 character delete must share text-unit boundaries

## Problem

Slate's text-unit helper knew that complex Unicode sequences should be handled
as text units, but reverse `unit: "character"` deletion had a separate complex
script restoration path. That split let package distance tests pass while
destructive delete still corrupted the behavior.

## Symptoms

- `getCharacterDistance("\u0BA8\u0BBF", true)` returned `2`, but reverse delete
  removed only the trailing Tamil vowel mark.
- Existing Thai delete fixtures expected partial deletion of the grapheme.
- Lexical #7163 rows exposed the mismatch once the test exercised real editor
  deletion, not just the string helper.

## What Didn't Work

- Adding more `getCharacterDistance` rows alone was too weak; the delete
  transform could still diverge.
- Keeping the old complex-script branch preserved legacy fixture behavior, but
  it made reverse deletion use a different law than forward deletion and
  `Editor.before(..., { unit: "character" })`.

## Solution

Make `unit: "character"` deletion obey the same boundary owner everywhere.

The fix removed the complex-script reverse-delete reinsertion path from
`packages/slate/src/transforms-text/delete-text.ts`, then updated
the Thai fixtures to expect a whole text-unit deletion.

The regression lock lives in
`packages/slate/test/text-units-contract.ts`:

```ts
const assertUnitCharacterDeletion = (
  testCase: LexicalGraphemeCase,
  reverse: boolean,
) => {
  const editor = createTextEditor(
    testCase.text,
    reverse ? testCase.text.length : 0,
  );

  for (const distance of distances) {
    const before = getEditorText(editor);
    const expected = reverse
      ? before.slice(0, before.length - distance)
      : before.slice(distance);

    editor.update((tx) => {
      tx.text.delete({ reverse, unit: "character" });
    });

    assert.equal(getEditorText(editor), expected, testCase.description);
  }
};
```

## Why This Works

`Editor.before` and `Editor.after` already derive character stops from
`getCharacterDistance`. The delete transform should remove the range those APIs
select. Reinserting part of the removed text after the fact created a second
definition of "character" for reverse deletion only.

Once the restoration branch is gone, forward delete, reverse delete, and
text-unit measurement all share one boundary source.

## Prevention

- Any new text-unit row should have both distance proof and destructive delete
  proof.
- Reverse-delete fixtures for Unicode text should assert whole text-unit
  behavior, not partial combining-mark behavior.
- When external harvest rows expose a helper/transform mismatch, fix the shared
  behavior owner instead of adding transform-specific exceptions.

## Related Issues

- [Slate positions must group character navigation by text-block boundaries](2026-04-27-slate-positions-must-group-character-navigation-by-text-block-boundaries.md)
- [Slate v2 delete selection normalization must distinguish inline spacers from inline targets](2026-04-14-slate-v2-delete-selection-normalization-must-distinguish-inline-spacers-from-inline-targets.md)
