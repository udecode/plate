# Lexical: collaboration

## Collaboration tests

- 'Undo with collaboration on' (`facebook/lexical@dd5c41b1:packages/lexical-playground/__tests__/e2e/Collaboration.spec.mjs:39`) runs only in the collaboration project. One undo reverts the whole `hello world again` typing burst, and another reverts a whole checklist edit. The test first freezes the Yjs `UndoManager` capture window with `freezeCollabUndoGrouping`, because a CI stall could otherwise split one burst across two undo entries. Source: `docs/editor-test-harvester/lexical/report.md:192`; body read at dd5c41b1 on 2026-10-08.
