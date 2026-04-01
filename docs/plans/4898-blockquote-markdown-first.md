# Issue 4898 Blockquote Markdown-First Analysis

## Task

- Source: GitHub issue `#4898`
- Title: `【markdown】deserialized Markdown is wrong when content container blockquote & list`
- Type: architecture decision
- Goal: decide whether Plate should redesign blockquote to be markdown-first and support nested block content, especially lists inside blockquotes

## Plan

1. Read issue context, repo instructions, and nearby markdown docs/tests.
2. Search `docs/solutions/` for related markdown/list lessons.
3. Inspect current blockquote plugin and markdown serializer/deserializer contracts.
4. Map the current behavior against the requested markdown shape.
5. Recommend whether to keep the current flat model, patch markdown only, or redesign blockquote as a container block.
6. Implement the new container-blockquote contract across markdown + toggle semantics.
7. Update public docs/examples and add a changeset before closeout.

## Findings

- `#4898` and `#4831` describe the same seam from two directions:
  - markdown deserialization of `> - item`
  - transform/toggle behavior that destroys list structure inside blockquote
- Current markdown deserializer rule for `blockquote` in `packages/markdown/src/lib/rules/defaultRules.ts` flattens child paragraphs and nested blockquotes into inline/text children, using `'\n'` sentinels for paragraph breaks.
- Current markdown serializer for `blockquote` emits a single mdast paragraph wrapper, which mirrors the flat text-block contract.
- `BaseBlockquotePlugin` itself is lightweight and does not explicitly forbid nested block children.
- Core normalization tests already tolerate nested block elements inside blockquote and collapse empty nested paragraphs back to inline text, so the hard limit appears to be markdown handling plus command semantics, not a global schema ban.
- `BaseBlockquotePlugin` currently declares text-block editing semantics:
  - `break.default = 'lineBreak'`
  - `toggle = editor.tf.toggleBlock(type)`
- The public docs match that flat model: `tf.blockquote.toggle` is documented as converting the current block between paragraph and blockquote.
- The generic transform layer already supports wrapper semantics via `toggleBlock(type, { wrap: true })`, so a container-style quote does not need brand-new editor primitives.
- The list system is compatible with richer blockquote children:
  - modern list items are blocks with list metadata, not special wrapper nodes
  - list docs already target `blockquote` as a list-capable block type
- Existing markdown tests encode the current flat contract:
  - paragraph breaks inside blockquote become text newlines
  - blockquote inside list is modeled as a flat blockquote node with newline text, not nested paragraphs/list children
- Existing markdown/list learnings reinforce two repo patterns:
  - deserializers must emit the metadata downstream normalization expects
  - mdast helper paths need contract-level tests, not just final-string assertions

## Recommendation

- Yes to the direction: Plate should support blockquote as a real container block for markdown parity.
- No to a silent hard swap right now: current blockquote semantics are public and flat, so this is a staged redesign, not a bugfix.
- Best path:
  1. add nested-block markdown import/export support first
  2. introduce container/wrap quote transforms
  3. keep legacy flat blockquotes temporarily for compatibility
  4. only later consider normalizing all blockquotes to wrapper/container shape in a major release

## Risks

- A hard redesign now would change:
  - stored value shape
  - keyboard behavior inside blockquotes
  - toolbar/turn-into semantics
  - docs and user mental model
- A hybrid transition leaves two internal quote shapes for a while, which is messier, but far cheaper than breaking every existing blockquote value and command flow at once.

## Progress

- 2026-04-01: Loaded `major-task`, `planning-with-files`, `learnings-researcher`, `repo-research-analyst`, and `architecture-strategist`.
- 2026-04-01: Fetched `#4898` and related issue `#4831`.
- 2026-04-01: Read the markdown blockquote rule, list deserializer tests, and blockquote normalization tests.
- 2026-04-01: Confirmed the public docs and transform layer currently define blockquote as a block-type toggle, while the generic editor API already supports a wrap-based container alternative.
- 2026-04-01: Implementation scope set to `packages/markdown`, `packages/basic-nodes`, and the public blockquote docs/examples. This is published package work, so a changeset is required before closeout.
