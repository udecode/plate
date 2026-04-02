# Milkdown Reference Corpus

This folder is the repo-safe entry point for Milkdown research.

It exists so later editor-behavior work can use one stable local inventory instead of repeatedly rediscovering the Milkdown repo structure.

## Source

- canonical raw source: local clone at `../milkdown`
- snapshot metadata is recorded in `corpus-metadata.json`
- current clone head is recorded there too

Unlike Typora, Milkdown is already present locally as source code, docs, tests, and examples. We do not need a second raw-content cache.

## Boundary

This repo stores inventories and source pointers, not a broad mirror of the upstream repo.

What is committed here:

- package inventory
- docs API inventory
- e2e suite inventory
- example route inventory
- Storybook inventory
- usage notes

What remains the source of truth:

- `../milkdown/docs/**`
- `../milkdown/packages/**`
- `../milkdown/e2e/**`
- `../milkdown/storybook/**`

## Repo Files

- `corpus-metadata.json`
- `package-catalog.tsv`
- `package-docs-catalog.tsv`
- `api-catalog.tsv`
- `e2e-catalog.tsv`
- `unit-test-catalog.tsv`
- `examples-catalog.tsv`
- `root-docs-catalog.tsv`
- `storybook-catalog.tsv`

## Coverage Snapshot

- packages: `30`
- api docs pages: `29`
- e2e specs: `48`
- package unit tests: `28`
- e2e examples: `9`
- storybook stories: `14`
- markdown fixtures: `14`
- package docs lanes: `30`
- root docs: `4`

## Structural Take

Milkdown’s behavior truth is split across several lanes:

1. `e2e/tests/input/**`
   autoformat and live typing behavior
2. `e2e/tests/shortcut/**`
   keyboard shortcut behavior
3. `e2e/tests/transform/**`
   markdown round-trip and node rendering behavior
4. `packages/**/__test__`, `packages/**/*.test.ts*`, `packages/**/*.spec.ts*`
   package-local assertions for parser, serializer, keymap, and plugin edge cases
5. `packages/plugins/preset-commonmark/**` and `packages/plugins/preset-gfm/**`
   markdown feature surface
6. `packages/transformer/**`
   parser and serializer seam
7. `docs/api/**`
   package-level public docs
8. `storybook/stories/**`
   visual component and plugin demos
9. `packages/**/README.md` and `packages/**/CHANGELOG.md`
   ownership and release breadcrumbs, usually weak for exact behavior
10. root docs like `README.md` and `CONTRIBUTING.md`
   repo context, not behavior truth

So for behavior/spec work, tests beat docs. Docs are the API map. Tests are the truth serum.

## First Files To Use For Behavior Work

Start here:

- `../milkdown/docs/api/preset-commonmark.md`
- `../milkdown/docs/api/preset-gfm.md`
- `../milkdown/docs/api/plugin-indent.md`
- `../milkdown/e2e/tests/input/blockquote.spec.ts`
- `../milkdown/e2e/tests/input/bullet-list.spec.ts`
- `../milkdown/e2e/tests/input/ordered-list.spec.ts`
- `../milkdown/e2e/tests/input/task-list.spec.ts`
- `../milkdown/e2e/tests/shortcut/list.spec.ts`
- `../milkdown/e2e/tests/transform/blockquote.spec.ts`
- `../milkdown/e2e/tests/transform/list.spec.ts`
- `../milkdown/e2e/tests/transform/hardbreak.spec.ts`
- `../milkdown/e2e/tests/data/blockquote.md`
- `../milkdown/e2e/tests/data/list.md`
- `../milkdown/e2e/tests/data/hardbreak.md`
- `../milkdown/packages/plugins/preset-commonmark/src`
- `../milkdown/packages/plugins/preset-gfm/src`
- `../milkdown/packages/plugins/plugin-indent/src`
- `../milkdown/packages/transformer/src/parser`
- `../milkdown/packages/transformer/src/serializer`

Useful supporting lanes:

- `../milkdown/e2e/src/preset-commonmark/`
- `../milkdown/e2e/src/preset-gfm/`
- `../milkdown/storybook/stories/components/`
- `../milkdown/storybook/stories/crepe/`
- `../milkdown/packages/core/src/internal-plugin/keymap.test.ts`
- `../milkdown/packages/plugins/preset-commonmark/src/__test__/trailing-space.spec.ts`
- `../milkdown/packages/plugins/preset-gfm/src/__test__/table-header-row.spec.ts`

## Important Repo Seam

`docs/api/*.md` is not the whole docs site. It is the API-doc source lane.

`docs/src/index.ts` builds those files by matching each `docs/api/<name>.md` page to package `@milkdown/<name>` when that package exists, then generates docs from the package `src/index.ts`.

That means:

- `docs/api/preset-commonmark.md` maps to package `@milkdown/preset-commonmark`
- `docs/api/plugin-indent.md` maps to package `@milkdown/plugin-indent`
- component pages like `component-code-block.md` are standalone docs pages, not package-name matches

## How To Query The Local Clone

Find behavior tests fast:

```bash
rg -n "blockquote|task list|hardbreak|Enter|Backspace|Tab" \
  /Users/zbeyens/git/milkdown/e2e/tests
```

Find parser and serializer seams:

```bash
rg -n "remark|blockquote|list|hardbreak|line break" \
  /Users/zbeyens/git/milkdown/packages/transformer \
  /Users/zbeyens/git/milkdown/packages/plugins/preset-commonmark \
  /Users/zbeyens/git/milkdown/packages/plugins/preset-gfm
```

Find package-local unit tests:

```bash
sed -n '1,80p' \
  docs/editor-behavior/references/milkdown/unit-test-catalog.tsv
```

Find package docs ownership lanes:

```bash
sed -n '1,80p' \
  docs/editor-behavior/references/milkdown/package-docs-catalog.tsv
```

Find example routes tied to tests:

```bash
sed -n '1,40p' \
  docs/editor-behavior/references/milkdown/examples-catalog.tsv
```

## How To Use This In The Spec Work

1. Start from `e2e-catalog.tsv` to find relevant test lanes.
2. If the e2e lane is too coarse, check `unit-test-catalog.tsv` for package-local assertions.
3. Use `examples-catalog.tsv` to map test routes to runnable demo surfaces.
4. Use `api-catalog.tsv` to connect public docs pages to package sources.
5. Use `package-catalog.tsv` and `package-docs-catalog.tsv` to find the owning package and local docs.
6. Read clone files directly from `../milkdown` for detailed behavior.
7. Use `root-docs-catalog.tsv` only for repo context, not behavior decisions.
8. Paraphrase findings back into Plate’s spec docs.

## Non-Rules

- This corpus does not claim Milkdown behavior is automatically better than Plate.
- This corpus does not replace CommonMark or GFM specs.
- This corpus does not make docs authoritative over tests when they disagree.
