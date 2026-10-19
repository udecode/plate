# Portable Text: commands and transforms

## Insert, split and break placement

- **Insert placement.** The harvest groups 17 Portable Text files (236 indexed test and describe names) as pinning that inserts at text start, middle and end, in empty blocks, on selected objects and at explicit locations choose a stable model position and final selection (report.md:118). Under `portabletext/editor@ad2a52d13d9f:packages/editor`: the five `gherkin-tests/insert.*.test.ts` files, `gherkin-tests/splitting-blocks.test.ts`, `src/behaviors/fit-blocks-to-destination.test.ts`, `src/utils/util.block-offset.test.ts`, `src/utils/util.slice-text-block.test.ts`, the seven `tests/event.insert*.test.tsx` files and `tests/withEditableAPIInsert.test.tsx`. The invariant is the harvest's summary, drawn from test names rather than assertion bodies (report.md:70).

## Delete and backspace matrix

- **Delete matrix.** The harvest groups 8 Portable Text files (84 indexed test and describe names) on collapsed, expanded, word, line, block, void-edge and object-to-object deletion, each removing exactly the intended content and leaving a valid selection (report.md:119). Under `portabletext/editor@ad2a52d13d9f:packages/editor`: `gherkin-tests/delete.test.ts`, `gherkin-tests/removing-blocks.test.ts`, the five `tests/event.delete*.test.tsx` files and `tests/withEditableAPIDelete.test.tsx`. `tests/event.delete.matrix.test.tsx` is the compact form: deletes by character, word and block unit in both directions, on a void block, and over expanded ranges within one span, across differently marked spans, across two or more blocks and from one void to another; a range starting at offset 0 of its start block keeps the end block's key. Deletes across container boundaries sit in the containers family.
