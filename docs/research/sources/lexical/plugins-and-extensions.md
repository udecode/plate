# Lexical: plugins and extensions

## Playground product plugins

- **Product plugin specs.** The playground e2e files `Autocomplete`, `CharacterLimit`, `ColumnLayoutBackspaceAtEnd`, `DateTime`, `Emoticons`, `EquationNode`, `MaxLength`, `SpecialTexts` and `Toolbar` test product plugins; a harvest reads them only to split out a raw invariant. Two have since gained owners the ledger did not foresee. Plite limits text insertion to a maximum length (`packages/plitejs/test/max-length-contract.test.ts`), and column layout is a Plate feature with its own law section (`## Columns` in `docs/editor-behavior/markdown-editing-spec.md`). Source: `c70bacbd4a:docs/editor-test-harvester/lexical/plite-processing-ledger.md:839-847`. Limit: the Lexical files were not rerun.

## Extension construction and React ownership

- Lexical's extension graph combines named dependencies, conflicts, peer dependencies, configuration, lifecycle and typed output. Its builder constructs, builds, registers and disposes extensions from creation input. The React composer requires a stable root extension and builds the editor with provider and React extensions inside useMemo; ReactExtension supplies Component and context output. Evidence: docs/plans/2026-05-16-plite-unified-extension-composition-ralplan.md:695-696, citing facebook/lexical:packages/lexical/src/extension-core/types.ts:164, facebook/lexical:packages/lexical-extension/src/LexicalBuilder.ts:138, facebook/lexical:packages/lexical-react/src/LexicalExtensionComposer.tsx:36,89 and ReactExtension.tsx:75 in the local Lexical checkout. Limit: the May 2026 source read records no commit, so this describes the observed version.
