# Lexical: plugins and extensions

## Playground product plugins

- **Product plugin specs.** The playground e2e files `Autocomplete`, `CharacterLimit`, `ColumnLayoutBackspaceAtEnd`, `DateTime`, `Emoticons`, `EquationNode`, `MaxLength`, `SpecialTexts` and `Toolbar` test product plugins; a harvest reads them only to split out a raw invariant. Two have since gained owners the ledger did not foresee. Plite limits text insertion to a maximum length (`packages/plitejs/test/max-length-contract.test.ts`), and column layout is a Plate feature with its own law section (`## Columns` in `docs/editor-behavior/markdown-editing-spec.md`). Source: `c70bacbd4a:docs/editor-test-harvester/lexical/plite-processing-ledger.md:839-847`. Limit: the Lexical files were not rerun.

## Extension construction and React ownership

- Lexical's extension graph combines named dependencies, conflicts, peer dependencies, configuration, lifecycle and typed output. Its builder constructs, builds, registers and disposes extensions from creation input. The React composer requires a stable root extension and builds the editor with provider and React extensions inside useMemo; ReactExtension supplies Component and context output. Evidence: docs/plans/2026-05-16-plite-unified-extension-composition-ralplan.md:695-696, citing facebook/lexical:packages/lexical/src/extension-core/types.ts:164, facebook/lexical:packages/lexical-extension/src/LexicalBuilder.ts:138, facebook/lexical:packages/lexical-react/src/LexicalExtensionComposer.tsx:36,89 and ReactExtension.tsx:75 in the local Lexical checkout. Limit: the May 2026 source read records no commit, so this describes the observed version.

## Feature-owned Markdown contributions

- The July 29 architecture comparison at `facebook/lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988` selected feature-owned MDAST import/export contributions as a useful packaging idea: a feature owns its Markdown rule while the document Markdown plugin owns the pipeline. The proposed Plate adoption removed feature entries from central defaultRules without importing Lexical extension bundles or introducing a separate Markdown plugin grammar. Current Plate feature ownership is visible in the markdown mappings in `packages/platejs/src/features/basic-nodes/lib/BaseMarkPlugins.ts`. Source: `docs/plans/2026-07-25-multi-editor-full-architecture-audit.md:2771`. Limit: this retains a source-comparison conclusion; the plan does not identify a Lexical runtime execution for it.

## Extension dependencies

- **Required extensions install their dependencies.** Lexical recursively adds extension-object dependencies, then orders the graph with a depth-first traversal that rejects cycles. CheckList declares List as its dependency, so callers need not install List separately. The July List plan used this as precedent for feature-owned dependencies (`docs/plans/2026-07-12-list-v2-api.md:379-380`). Current local source confirms the mechanism at `facebook/lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988:packages/lexical-extension/src/LexicalBuilder.ts:308-361` and `facebook/lexical:packages/lexical-list/src/LexicalListExtension.ts:82-87`. Limit: source inspection, not an execution of the builder tests; the plan's historical version label is 0.42.
