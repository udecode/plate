# ProseMirror: model and schema

## Serialized node model

- ProseMirror's `Node.fromJSON` parses JSON strictly against the current schema: it resolves node and mark types, throwing a `RangeError` for an unknown type, and checks attributes, and it has no version runner, so an app transforms old data before calling it (`ProseMirror/prosemirror-model@6264de06:src/node.ts:332-348`, schema binding `src/schema.ts:627-675`). Source: `c70bacbd4a:docs/plite/research/2026-08-17-document-schema-migrations/read-log.tsv:7`, `repo-registry.tsv:7`; reread at the pinned commit on 2026-10-08.

- ProseMirror serializes nodes as JSON `{ type, attrs, content, marks, text }`, and its schema owns content expressions, attributes, editing behavior and validation (`ProseMirror/prosemirror-model@6264de06:src/node.ts:319-395`, `src/schema.ts:371-565`). Its basic schema has one `heading` node with a `level` attribute and a code block whose content is plain text (`ProseMirror/prosemirror-schema-basic@6daea265:src/schema-basic.ts:39-67`). Source: `c70bacbd4a:docs/plite/research/2026-08-17-editor-node-model-standards/README.md:97`, `read-log.tsv:4-6`.

## ProseMirror test families

- **PM-01 content expressions.** `model/test/test-content.ts` checks `ContentMatch.matchType` and `fillBefore` over `*`, `+`, `?`, `{n}` and `{n,m}` counts, choices and groups (`ProseMirror/prosemirror-model@bc912ea0ff8ac935c7f1dc3cf029cd0b6ecdda97:test/test-content.ts:34-123`); the harvest reads it, with `test-node.ts`, `test-replace.ts` and `transform/test/test-structure.ts`, `test-trans.ts`, as checking that structural edits accept exactly the legal child sequences and reject impossible content without damaging the document. Plite's matching law suites are `packages/plitejs/test/schema-compiler-laws.test.ts`, `schema-laws.test.ts` and `slice-fit-laws.test.ts`; the harvest flagged ordered content patterns as an architecture gap (PM-P1-1), not test work. Source: `docs/editor-test-harvester/prosemirror/report.md:140`.

- **PM-02 open slices.** The harvest reads `model/test/test-slice.ts`, `test-replace.ts` and `view/test/webtest-clipboard.ts` as checking that open fragment edges keep enough context through copy, replace, split, join and fitting. Plite counterparts: `packages/plitejs/test/content-slice-laws.test.ts`, `slice-fit-contract.test.ts` and `packages/plitejs/test/dom/clipboard-boundary.test.ts`. Source: `docs/editor-test-harvester/prosemirror/report.md:141`.
