# Issue 5140: node filters for inline HTML elements

Status: in review
PR: https://github.com/udecode/plate/pull/5141

## Outcome

[Issue 5140](https://github.com/udecode/plate/issues/5140): with `remark-mdx`, `deserializeMd` checked `allowedNodes` and `disallowedNodes` against an inline HTML element's mdast type, `mdxJsxTextElement`, and never against the Plate type it becomes. So `disallowedNodes: ['a']` dropped Markdown links but kept `<a href>` anchors, and since PR 5139 those anchors carry a working URL.

After the fix, `disallowedNodes` also checks an HTML or MDX element by the key of its deserialize rule, at the top level and inside marks: `a` for `<a href>`, `underline` for `<u>`, `br` for `<br>`. `disallowedNodes: ['a']` removes `<a href>`. Allowlists behave exactly as on `main`, so `<br>` and `<span>` styles keep their text wherever `main` kept it. Elements without a rule still fall back to source text.

## Main changes

- `customMdxDeserialize` resolves the element's rule key once: the plugin key the tag resolves to, or the tag name when no plugin owns it. When a rule exists and `disallowedNodes` lists that key, it returns nothing before the rule runs.
- `allowNode.deserialize` is unchanged. It still receives the MDX node, with `name` available for element checks.
- The `disallowedNodes` JSDoc in `MarkdownPlugin.ts` and the Markdown docs page state the new behavior with `remark-mdx`. The `allowedNodes` JSDoc and docs now say what `main` already did: `mdxJsxTextElement` admits inline HTML and MDX elements, `mdxJsxFlowElement` admits block ones, and an admitted element with a rule converts without its rule key listed. A patch changeset describes the change from `main`.

## Defaults

| Decision | Pick | Alternative | Word |
| --- | --- | --- | --- |
| Allowlist rule | Unchanged from `main`; the key check applies to `disallowedNodes` only | Check allowlists by key too, which drops `<br>` and `<span>` text from allowlists that admit `mdxJsxTextElement` | "check allowlists" |
| Cell-list fallback after filtering | A table-cell list whose blocked block child the filter removed converts, keeping only allowed content | Keep the text fallback whenever the unfiltered item held a block | "keep fallback" |
| `allowNode` | Unchanged; it still sees the MDX node | Call it with the resolved type | "allowNode resolved" |
| Chinese docs | Left to languine, as with PR 5139 | Translate the two sentences by hand | "translate cn" |
| `next` | Not ported here; `next` has its own markdown package and the main-to-next sync owns it | Port the fix now | "port" |

## Proof

- Red then green: `a<br/>b <u>c</u> <a href="https://platejs.org">d</a>` under `disallowedNodes: ['underline']` keeps `<u>` without the check line and removes only `<u>` with it, keeping the line break and the link (`deserializer/deserializeMd.spec.ts`). The issue's own case, `<a href>` under `disallowedNodes: ['a']`, failed on `main` at `ef90c27119` and passed with the first version of the test.
- Red then green for allowlists: `a<br/>b <u>c</u>` under `allowedNodes: ['p', 'text', 'mdxJsxTextElement']` lost `<br>` and `<u>` with the first version of the fix, which also checked allowlists, and keeps both now (`deserializer/deserializeMd.spec.ts`).
- `pnpm --filter @platejs/markdown test` in the worktree: 274 pass, 0 fail. `pnpm turbo typecheck --filter=./packages/markdown`: 13/13.
- Probes (deleted after): inside bold, `<a href>` is removed under `disallowedNodes: ['a']`, while `**[l](https://p.org)**` keeps its link, which is the pre-existing bypass listed under Follow-ups. `<foo>b</foo>` falls back to source text.

## Follow-ups

- Node filters skip Markdown children of `**`, `*`, `~~` and list items (`x **[l](https://p.org)**` keeps its link under `disallowedNodes: ['a']`); filed as a follow-up issue.
- `<code>` resolves to the rule key `code_block` through the Markdown type table, so `disallowedNodes: ['code_block']` removes inline `<code>` and `['code']` does not. Pre-existing mapping; owner: zbeyens, untracked.
- An HTML element nested in an unknown tag, or in a tail re-parsed without `remark-mdx` after an MDX error, stays literal source text and is not removed. No live element is created on either path. Owner: zbeyens, untracked.
- An element left with no children after filtering, such as a heading holding only a removed link, is not padded. `main` has the same gap for Markdown children. Owner: zbeyens, untracked.
- `allowNode.deserialize` still sees `mdxJsxTextElement` for HTML elements. Owner: zbeyens, untracked.
- The unknown-element fallback builds a block `p` that no allowlist checks, and drops the mark of its context, so `a **<foo>bar</foo>**` returns unbolded tag text. Pre-existing; owner: zbeyens, untracked.
