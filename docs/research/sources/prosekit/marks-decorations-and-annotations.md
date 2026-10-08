# ProseKit: marks decorations and annotations

## Mark ranges

- **Mark-run expansion.** `prosekit/prosekit@3fbfe7906c3448328e80c1c1333647d08e50907e:packages/core/src/commands/expand-mark.spec.ts` (L10, L17, L24) pins `expandMark`: a caret inside a mark expands to the mark's whole run, the command returns false when the caret is outside the mark, and expansion stops at a neighbouring run of the same mark with different attributes, such as a link with another href. Plite and Plate have no such command; a search of `packages/plitejs/src` and `packages/platejs/src` found none on 2026-10-08 (inferred from that search). Plate's links are inline elements, not marks (`packages/platejs/src/features/link/lib/BaseLinkPlugin.ts`). ProseKit's integer ProseMirror positions are donor machinery, not something to copy (`docs/editor-test-harvester/prosekit/report.md:134`).
