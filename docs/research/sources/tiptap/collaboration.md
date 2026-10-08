# Tiptap: collaboration

## Unique IDs and collaboration caret startup

- **Collaboration startup.** `ueberdosis/tiptap@91c51be53c:packages/extension-unique-id/__tests__/unique-id-collab.spec.ts:58-141` pins that UniqueID does not assign IDs at creation when the Collaboration extension is present with no provider. It assigns them after the first `y-sync$` transaction, including one that arrives before `onCreate` runs, and without Collaboration it still assigns them at once. `ueberdosis/tiptap@91c51be53c:packages/extension-collaboration-caret/__tests__/collaboration-caret.spec.ts:39-187` pins that CollaborationCaret starts without crashing on HTML content with or without a table, and on no content. The harvest routes both to Plate's Yjs and table code (`docs/editor-test-harvester/tiptap/report.md:102`); the Yjs binding now lives in `packages/plitejs/src/yjs`, with Plate's plugin in `packages/platejs/src/yjs`. Read at that commit on 2026-10-08; the 2026-05-10 harvest pinned no commit, but its cited lines match this one.

## Tracked changes

- Tiptap's tracked changes are a paid alpha extension with programmatic review operations (https://tiptap.dev/docs/editor/extensions/functionality/tracked-changes, retrieved 2026-09-10); no source was read, so there is no claim about its reliability. Source: `docs/plite/research/2026-09-10-authored-changes/assessment.md:51`, `read-log.tsv:45`.
