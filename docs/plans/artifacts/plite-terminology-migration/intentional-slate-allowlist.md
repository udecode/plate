# Intentional Slate References After Plite Rename

Allowed remaining `Slate` / `slate` references in active Plite-owned surfaces:

- upstream comparison docs: `content/docs/plite/why-this-fork.mdx`, `content/docs/plite/migration.mdx`, `content/docs/plite/index.mdx`, `content/docs/plite/general/faq.mdx`, and `content/docs/plite/general/resources.mdx` intentionally refer to upstream Slate 0.x or upstream Slate-adjacent prior art;
- upstream issue/PR provenance comments: source comments with `github.com/ianstormtaylor/slate` preserve the browser/runtime bug source;
- negative package metadata assertions: `packages/plite/test/release-scripts-contract.ts` rejects upstream Slate repository/issue URLs in current package manifests;
- route test wording: `apps/plite/tests/plite-browser/donor/examples/example-navigation.test.ts` intentionally compares examples against upstream Slate lineage;
- historical evidence excluded from active cleanup: package `CHANGELOG.md` files, fork issue dossiers, decorations research, and research archives preserve upstream source evidence and should not be rewritten into fake Plite history;
- CSS color names and CSS keywords such as Tailwind `slate-*`, `slategray`, and `translate*` are not product terminology.

The strict stale patterns are not allowed outside that list: `@platejs/slate` except `@platejs/slate-legacy`, `packages/slate` except `packages/slate-legacy`, `/examples/slate`, `/docs/slate`, `slate-v2`, `Plate Slate`, `Slate v2`, and Plite-owned `slate-node` / `slate-point` / `slate-range` error codes.
