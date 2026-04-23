# Plugin Input Rules Doc Plan

## Status

Proposed.

## Goal

Create a new canonical guide at
[content/(guides)/plugin-input-rules.mdx](content/(guides)/plugin-input-rules.mdx)
for the **Input Rules** runtime and API.

This guide should replace the current canonical role of
[content/(plugins)/(functionality)/autoformat.mdx](content/(plugins)/(functionality)/autoformat.mdx)
without pretending that "autoformat" is the right top-level concept.

The new guide should teach the actual system:

- the core `InputRulesPlugin` runtime
- feature-owned markdown rule families
- local copied text-substitution shortcuts
- low-level custom rule authoring

The result should become the canonical user-facing reference for how input
rules work in Plate today.

## Problem Frame

The current docs have a real naming conflict:

- [plugin-rules.mdx](content/(guides)/plugin-rules.mdx) already owns plugin
  behavior rules
- the old `autoformat.mdx` page is trying to explain the input-rule runtime
  under the wrong name

That is why a brand-new guide path is better than squeezing this into either
existing page.

The current `autoformat.mdx` page is also no longer the right abstraction.

Today it mixes multiple different lanes under one old label:

- feature-owned markdown shortcuts from packages like
  `@platejs/basic-nodes`, `@platejs/code-block`, `@platejs/list`,
  `@platejs/link`, and `@platejs/math`
- local copied substitutions from
  [autoformat-kit.tsx](apps/www/src/registry/components/editor/plugins/autoformat-kit.tsx)
- raw custom rule authoring via `defineInputRule(...)`

That made sense when "autoformat" was the broad mental model. It does not match
the current architecture anymore.

Current law is now:

- core owns dispatch and helper primitives
- feature packages own feature semantics
- kits register explicit rule instances
- local app sugar stays local
- there are no hidden defaults

So the docs should teach **Input Rules** as the system and treat `AutoformatKit`
as one example of local copied rule code, not the conceptual center.

## Strong Take

### Page title

Use **Plugin Input Rules** as the page title.

Do **not** title the public page:

- `InputRulesPlugin`
- `Input Rules`

Why:

- `InputRulesPlugin` is too internal
- plain `Input Rules` is semantically right but too collision-prone next to
  `Plugin Rules`
- `Plugin Input Rules` is explicit in nav and avoids the sibling-guide naming
  clash

### File path

Create a new guide path:

- [content/(guides)/plugin-input-rules.mdx](content/(guides)/plugin-input-rules.mdx)

Why:

- it should sit next to [plugin-rules.mdx](content/(guides)/plugin-rules.mdx)
  as the sibling concept
- the guide route will be clearer in nav: `/docs/plugin-input-rules`
- this avoids overloading the old `autoformat` route with the wrong mental
  model

Follow-up handling for the old page:

- keep
  [content/(plugins)/(functionality)/autoformat.mdx](content/(plugins)/(functionality)/autoformat.mdx)
  only if it is narrowed to local copied substitutions or made into a short
  pointer page
- do **not** leave it carrying the canonical runtime explanation once the new
  guide exists

### Chinese parity

Create the Chinese twin in the guide lane:

- [content/(guides)/plugin-input-rules.cn.mdx](content/(guides)/plugin-input-rules.cn.mdx)

Then decide whether the old CN autoformat page becomes narrow or becomes a
pointer page in lockstep with the English version.

## Audience

This doc has three real audiences:

### 1. App consumers

They want to:

- turn on packaged markdown shortcuts
- add local copied text substitutions
- understand which package owns which rule

### 2. Package consumers with light customization

They want to:

- choose variants like `'*'` vs `'_'`
- choose block-fence behavior like `on: 'match' | 'break'`
- override rule activation with `enabled`
- change ordering with `priority`

### 3. Advanced authors

They want to:

- define custom rules
- understand rule targets and context objects
- use helpers like `createMarkInputRule`, `createBlockStartInputRule`,
  `createBlockFenceInputRule`, `createTextSubstitutionInputRule`
- define plugin-side factories via `inputRules: ({ rule }) => [...]`

The page should serve all three without turning the opening into a wall of
internal types.

## Non-Goals

This page should **not**:

- re-document each package’s entire feature page
- turn into a changelog or migration guide
- document dead APIs like boolean-map `inputRules`
- document old "autoformat presets" or "rule groups"
- hide the local-copy lane behind package magic
- force every user into raw `defineInputRule(...)` examples first

## Source Of Truth

### Current docs being displaced

- [content/(plugins)/(functionality)/autoformat.mdx](content/(plugins)/(functionality)/autoformat.mdx)
- [content/(plugins)/(functionality)/autoformat.cn.mdx](content/(plugins)/(functionality)/autoformat.cn.mdx)
- [content/(guides)/plugin-rules.mdx](content/(guides)/plugin-rules.mdx)
- [content/(guides)/plugin-rules.cn.mdx](content/(guides)/plugin-rules.cn.mdx)

### Core runtime and types

- [types.ts](packages/core/src/lib/plugins/input-rules/types.ts)
- [createInputRules.ts](packages/core/src/lib/plugins/input-rules/createInputRules.ts)
- [defineInputRule.ts](packages/core/src/lib/plugins/input-rules/defineInputRule.ts)
- [InputRulesPlugin.ts](packages/core/src/lib/plugins/input-rules/internal/InputRulesPlugin.ts)
- [createInputRuleBuilder.ts](packages/core/src/lib/plugins/input-rules/internal/createInputRuleBuilder.ts)

### Example feature-owned rule families

- [BasicBlockRules.ts](packages/basic-nodes/src/lib/BasicBlockRules.ts)
- [BasicMarkRules.ts](packages/basic-nodes/src/lib/BasicMarkRules.ts)
- [CodeBlockRules.ts](packages/code-block/src/lib/CodeBlockRules.ts)
- [LinkRules.ts](packages/link/src/lib/LinkRules.ts)
- [BulletedListRules.ts](packages/list/src/lib/BulletedListRules.ts)
- [OrderedListRules.ts](packages/list/src/lib/OrderedListRules.ts)
- [TaskListRules.ts](packages/list/src/lib/TaskListRules.ts)
- [MathRules.ts](packages/math/src/lib/MathRules.ts)

### Example kits

- [basic-blocks-kit.tsx](apps/www/src/registry/components/editor/plugins/basic-blocks-kit.tsx)
- [basic-marks-kit.tsx](apps/www/src/registry/components/editor/plugins/basic-marks-kit.tsx)
- [code-block-kit.tsx](apps/www/src/registry/components/editor/plugins/code-block-kit.tsx)
- [link-kit.tsx](apps/www/src/registry/components/editor/plugins/link-kit.tsx)
- [math-kit.tsx](apps/www/src/registry/components/editor/plugins/math-kit.tsx)
- [autoformat-kit.tsx](apps/www/src/registry/components/editor/plugins/autoformat-kit.tsx)

### Navigation and likely cross-links

- [docs.ts](apps/www/src/config/docs.ts)
- [plugin.mdx](content/(guides)/plugin.mdx)
- [plugin.cn.mdx](content/(guides)/plugin.cn.mdx)

### Institutional learnings to align with

- [input-rules-should-register-explicit-rule-instances-while-packages-export-markdown-families.md](docs/solutions/best-practices/input-rules-should-register-explicit-rule-instances-while-packages-export-markdown-families.md)
- [block-fence-input-rules-should-split-fence-matching-from-feature-apply.md](docs/solutions/best-practices/block-fence-input-rules-should-split-fence-matching-from-feature-apply.md)
- [input-rules-should-expose-enabled-in-core-instead-of-helper-local-blockers.md](docs/solutions/best-practices/input-rules-should-expose-enabled-in-core-instead-of-helper-local-blockers.md)

## Replacement Thesis

The new guide should teach one sentence clearly:

> Input rules are the shared runtime for typed editor conversions in Plate.
> Feature packages export semantic rule families, kits register explicit rule
> instances, and local copied shortcuts stay local.

Everything on the page should reinforce that.

## Proposed Page Shape

### Frontmatter

Recommended frontmatter direction:

```md
---
title: Plugin Input Rules
description: Typed editor rules for markdown shortcuts, block fences, autolinks, and local text substitutions.
docs:
  - route: /docs/basic-blocks
    title: Basic Elements
  - route: /docs/basic-marks
    title: Basic Marks
  - route: /docs/code-block
    title: Code Block
  - route: /docs/link
    title: Link
  - route: /docs/list
    title: List
  - route: /docs/equation
    title: Equation
---
```

### Opening

Open with a direct explanation of what the page is for:

- what input rules are
- what they are good for
- the difference between feature-owned markdown rules and local copied shortcut
  rules

Do **not** open by centering `AutoformatKit` or by comparing yourself to
`plugin-rules` defensively. Just teach the system.

### Suggested top-level sections

1. `## What Plugin Input Rules Are`
2. `## Quick Start`
3. `## Feature-Owned Markdown Rules`
4. `## Local Copied Shortcuts`
5. `## Custom Rules`
6. `## How Rule Execution Works`
7. `## API Reference`

That order is deliberate:

- start with mental model
- then app-consumer use
- then feature-family examples
- then local shortcuts
- then advanced authoring
- only then low-level reference

## Detailed Section Plan

### 1. `## What Plugin Input Rules Are`

Purpose:

- establish the distinction from `Plugin Rules` immediately
- define the ownership split cleanly

Required content:

- one-paragraph explanation of the runtime
- one sentence explicitly separating it from
  [plugin-rules.mdx](content/(guides)/plugin-rules.mdx):
  - `plugin-rules` controls node behavior policy
  - `plugin-input-rules` controls typed conversion behavior
- one bullet list for the ownership model:
  - core runtime
  - feature package rule families
  - local copied shortcuts
- one small table:

| Lane | Owner | Example |
| ---- | ----- | ------- |
| feature markdown rule | package | `HeadingRules.markdown()` |
| feature interaction rule | package | `LinkRules.autolink({ variant: 'space' })` |
| local substitutions | app/local kit | `createTextSubstitutionInputRule(...)` |
| raw custom rule | app or package | `defineInputRule(...)` |

Callout to include:

- input rules are explicit; nothing is activated by default just because a
  plugin exists

### 2. `## Quick Start`

Purpose:

- give the reader the fastest honest setup path

Required content:

- keep `AutoformatKit`, but only as the quick path for common local text
  substitutions
- immediately follow it with a feature-owned markdown kit example so the page
  does not imply `AutoformatKit` is the only or main path

Recommended substeps:

#### `### Add Local Text Substitutions`

Use:

- [autoformat-kit.tsx](apps/www/src/registry/components/editor/plugins/autoformat-kit.tsx)

Explain:

- this kit is local copied code
- it is not a generic `@platejs/autoformat` package contract

#### `### Add Feature-Owned Markdown Rules`

Use a compact `createPlateEditor` example with:

- [basic-blocks-kit.tsx](apps/www/src/registry/components/editor/plugins/basic-blocks-kit.tsx)
- [basic-marks-kit.tsx](apps/www/src/registry/components/editor/plugins/basic-marks-kit.tsx)
- [code-block-kit.tsx](apps/www/src/registry/components/editor/plugins/code-block-kit.tsx)
- [math-kit.tsx](apps/www/src/registry/components/editor/plugins/math-kit.tsx)
- [link-kit.tsx](apps/www/src/registry/components/editor/plugins/link-kit.tsx)

Important:

- show explicit `on` for block-fence families
- do not hide `on` in the examples

### 3. `## Feature-Owned Markdown Rules`

Purpose:

- show the main package-consumer lane in a more systematic way

This should be the biggest section in the tutorial half of the guide.

Recommended subsection order:

#### `### Basic Blocks`

Use:

- `HeadingRules.markdown()`
- `BlockquoteRules.markdown()`
- `HorizontalRuleRules.markdown({ variant: '-' | '_' })`

Explain:

- headings derive the prefix from the plugin key
- blockquote uses `enabled` for code-block gating
- horizontal rule is still a feature-owned block-start rule, not a generic
  fence helper

#### `### Basic Marks`

Use:

- `BoldRules.markdown({ variant: '*' | '_' })`
- `ItalicRules.markdown({ variant: '*' | '_' })`
- `UnderlineRules.markdown()`
- `MarkComboRules.markdown({ variant: ... })`

Explain:

- packages own canonical markdown semantics
- kits choose variants explicitly

#### `### Code Blocks`

Use:

- `CodeBlockRules.markdown({ on: 'match' })`
- a second example with `CodeBlockRules.markdown({ on: 'break' })`

Explain:

- `on: 'match'` means fire when the fence becomes complete
- `on: 'break'` means fire on Enter after the fence is complete
- `on` is required because those behaviors are meaningfully different

#### `### Lists`

Use:

- `BulletedListRules.markdown({ variant: '-' })`
- `OrderedListRules.markdown({ variant: '.' })`
- `TaskListRules.markdown({ checked: false })`

Explain:

- list semantics stay in `@platejs/list`
- code-block suppression uses `enabled`, not matcher hacks

#### `### Math`

Use:

- `MathRules.markdown({ variant: '$' })`
- `MathRules.markdown({ variant: '$$', on: 'break' })`

Explain:

- inline `$...$` and block `$$` are intentionally split
- block `$$` requires explicit `on`
- `enabled` exists for app overrides when needed

#### `### Links`

Use:

- `LinkRules.markdown()`
- `LinkRules.autolink({ variant: 'paste' | 'space' | 'break' })`

Explain:

- links are not "just substitutions"
- package owns link semantics and validation

### 4. `## Local Copied Shortcuts`

Purpose:

- salvage the useful part of the old autoformat page without lying about
  ownership

Recommended flow:

#### `### Use createTextSubstitutionInputRule`

Use a compact example based on
[autoformat-kit.tsx](apps/www/src/registry/components/editor/plugins/autoformat-kit.tsx):

- a small local plugin
- one or two substitution patterns
- `enabled` gating around code blocks

Explain:

- this is the best local-copy path for substitutions
- this code belongs in app/local kit space

#### `### When defineInputRule Is Better`

Only after the helper example:

- show a single small `defineInputRule(...)` example
- use it for a case that is not just substitution

Do not lead with raw `defineInputRule(...)`.

### 5. `## Custom Rules`

Purpose:

- teach advanced consumers and package authors how to define custom rules
  without flooding the earlier sections

Recommended subsections:

#### `### Register Explicit Rule Instances`

Show:

```tsx
Plugin.configure({
  inputRules: [
    SomeRules.markdown(...),
    { ...LinkRules.autolink({ variant: 'paste' }), priority: 200 },
  ],
});
```

Required explanation:

- rules are explicit instances
- `priority` is overridden on the returned rule object, not inside package
  factory params

#### `### Use Plugin-Side Factories`

Show:

```tsx
createSlatePlugin({
  key: 'custom',
  inputRules: ({ rule }) => [
    rule.mark(...),
    rule.blockStart(...),
    rule.blockFence(...),
  ],
});
```

Explain:

- this is mainly for package/plugin authors
- `rule.*` helpers are sugar over the shared core builders

### 6. `## How Rule Execution Works`

Purpose:

- explain the runtime lifecycle and stop people from guessing

Required content:

- runtime order:
  1. trigger lane
  2. `enabled`
  3. `resolve`
  4. `apply`
- different targets:
  - `insertText`
  - `insertBreak`
  - `insertData`
- selection context helpers:
  - `getBlockEntry`
  - `getBlockStartRange`
  - `getBlockStartText`
  - `getBlockTextBeforeSelection`
  - `getCharBefore`
  - `getCharAfter`
  - `pluginKey`

Recommended table:

| Field | Purpose |
| ----- | ------- |
| `enabled` | policy gate |
| `resolve` | compute payload |
| `apply` | perform transform |
| `priority` | ordering override |
| `trigger` | typed input dispatch for `insertText` |
| `on` | block-fence commit mode |

Important note:

- `match` and matcher helpers should own syntax, not policy
- use `enabled` for gating instead of returning `undefined` from `match` just to
  suppress a rule

### 7. `## API Reference`

Purpose:

- put the low-level details last, per docs style

Recommended subsections:

#### `### Rule Targets`

- `insertText`
- `insertBreak`
- `insertData`

#### `### Core Helpers`

- `defineInputRule`
- `createMarkInputRule`
- `createBlockStartInputRule`
- `createBlockFenceInputRule`
- `createTextSubstitutionInputRule`
- `matchDelimitedInline`

For each helper, include:

- when to use it
- the most important config fields
- one short code example

#### `### Package Rule Families`

List the important shipped families with one-line descriptions:

- `HeadingRules`
- `BlockquoteRules`
- `HorizontalRuleRules`
- `BoldRules`
- `ItalicRules`
- `MarkComboRules`
- `CodeBlockRules`
- `BulletedListRules`
- `OrderedListRules`
- `TaskListRules`
- `MathRules`
- `LinkRules`

## Example Inventory

The final doc should include these exact example shapes:

1. A quick local substitutions kit example using `AutoformatKit`
2. A feature-owned setup example with:
   - heading
   - blockquote
   - horizontal rule
   - code block with `on: 'match'`
   - list
   - inline math
   - block math with `on: 'break'`
   - link autolink variants
3. A text-substitution helper example using `createTextSubstitutionInputRule`
4. A raw custom rule example using `defineInputRule`
5. A plugin factory example using `inputRules: ({ rule }) => [...]`
6. A `priority` override example using object spread
7. An `enabled` override example

## Copy Decisions

### Keep

- explicit activation via `inputRules`
- local-copy posture for substitutions
- feature-owned markdown examples

### Cut

- the page framing that centers "autoformat"
- the implication that text substitutions and markdown feature shortcuts are the
  same lane
- raw `defineInputRule(...)` as the first customization example

### Add

- the distinction from `Plugin Rules`
- rule lifecycle explanation
- `enabled` as the generic gating lane
- block-fence `on` semantics
- builder/factory examples for plugin authors
- clear ownership map

## Files To Update

### Required

- [content/(guides)/plugin-input-rules.mdx](content/(guides)/plugin-input-rules.mdx)
- [content/(guides)/plugin-input-rules.cn.mdx](content/(guides)/plugin-input-rules.cn.mdx)
- [apps/www/src/config/docs.ts](apps/www/src/config/docs.ts)

### Likely supporting updates

- [content/(plugins)/(functionality)/autoformat.mdx](content/(plugins)/(functionality)/autoformat.mdx)
- [content/(plugins)/(functionality)/autoformat.cn.mdx](content/(plugins)/(functionality)/autoformat.cn.mdx)
- generated registry/doc outputs under `apps/www/public/r/**` will refresh from
  the app build; do not edit them by hand

### Optional follow-up only if needed

- add cross-links from guide and API pages that currently only point at
  [plugin-rules.mdx](content/(guides)/plugin-rules.mdx) when the topic is
  really input rules
- consider updates to:
  - [plugin.mdx](content/(guides)/plugin.mdx)
  - [plugin.cn.mdx](content/(guides)/plugin.cn.mdx)

## Verification Plan

When the doc is actually written, verify with:

- `pnpm turbo build --filter=./apps/www`
- `pnpm turbo typecheck --filter=./apps/www`
- `pnpm lint:fix`

And for browser proof:

- load `/docs/plugin-input-rules` in a browser
- confirm code blocks render
- confirm copied source snippets are up to date
- confirm the page clearly distinguishes itself from `/docs/plugin-rules`
- confirm the old `autoformat` page no longer carries the canonical explanation

## Acceptance Criteria

The replacement is successful when:

- the new guide teaches Input Rules as the actual runtime and public system
- the guide title and path clearly distinguish it from `plugin-rules`
- `AutoformatKit` is demoted to one local example, not the conceptual center
- feature-owned package rules are shown as the primary markdown path
- `enabled`, `priority`, and block-fence `on` are all documented clearly
- the advanced helper/reference material appears in `## API Reference`, not in
  the opening tutorial sections
- the English and Chinese guide pages stay conceptually aligned
- the examples match the current codebase exactly

## Suggested Execution Order

1. Create `plugin-input-rules.mdx` and `plugin-input-rules.cn.mdx`
2. Add the new guide to [docs.ts](apps/www/src/config/docs.ts) near
   `plugin-rules`
3. Build the new guide body with the planned section structure
4. Update examples to current source APIs
5. Add the low-level API reference last
6. Narrow or repoint the old `autoformat` page
7. Build and visually verify

## Final Take

This guide should become the canonical answer to:

- "How do input rules work in Plate?"
- "Where do markdown shortcuts live?"
- "How do I add local copied substitutions?"
- "How do I define a custom rule?"

If the result still feels like "an autoformat page with extra notes" or "a
shadow copy of plugin-rules", it failed.
