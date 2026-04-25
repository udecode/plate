# Input Rules DX Revision Plan

## Status

Proposed.

## Goal

Keep the core input-rules runtime, but fix the public API and ownership model so
the DX is actually worth shipping:

- no public `inputRuleGroups`
- one obvious `Plugin.configure(...)` entry point
- shared rule builders in core instead of repeated local matcher code
- no published package for generic text substitutions
- shadcn-style transparency for shortcut-like behavior

## Source Of Truth

- current deep-interview spec:
  [deep-interview-input-rules-api.md](.omx/specs/deep-interview-input-rules-api.md)
- current major rewrite plan:
  [prd-input-rules-major-rewrite.md](.omx/plans/prd-input-rules-major-rewrite.md)
- current candidate-editor map:
  [editor-architecture-candidates.md](docs/analysis/editor-architecture-candidates.md)

Current code evidence:

- runtime:
  [InputRulesPlugin.ts](packages/core/src/lib/plugins/input-rules/InputRulesPlugin.ts)
  [types.ts](packages/core/src/lib/plugins/input-rules/types.ts)
  [resolvePlugin.ts](packages/core/src/internal/plugin/resolvePlugin.ts)
  [resolvePlugins.ts](packages/core/src/internal/plugin/resolvePlugins.ts)
- duplicated builders / rule logic:
  [markdownInputRules.ts](packages/basic-nodes/src/lib/internal/markdownInputRules.ts)
  [inputRules.ts](packages/list/src/lib/inputRules.ts)
  [inputRules.ts](packages/math/src/lib/inputRules.ts)
  [inputRules.ts](packages/link/src/lib/internal/inputRules.ts)
- current awkward ownership:
  [BaseHeadingPlugin.ts](packages/basic-nodes/src/lib/BaseHeadingPlugin.ts)
  [BaseCodeBlockPlugin.ts](packages/code-block/src/lib/BaseCodeBlockPlugin.ts)
  [BaseLinkPlugin.ts](packages/link/src/lib/BaseLinkPlugin.ts)
  [BaseTypographyPlugin.ts](packages/typography/src/lib/BaseTypographyPlugin.ts)
  [BaseSymbolsPlugin.ts](packages/typography/src/lib/BaseSymbolsPlugin.ts)
  [autoformat-kit.tsx](apps/www/src/registry/components/editor/plugins/autoformat-kit.tsx)

External comparison evidence from local clones:

- Tiptap: feature-owned `addInputRules()` plus typed builder helpers like
  `markInputRule`, `textblockTypeInputRule`, `nodeInputRule`,
  `wrappingInputRule`, `textInputRule`
- Lexical: explicit transformer subsets passed to `MarkdownShortcutPlugin`
- shadcn pattern: copied local code wins for product sugar that people want to
  inspect and mutate

## Harsh Assessment

### What is already right

- core-owned dispatch was the right move
- feature plugins owning feature behavior was the right move
- same-name override and runtime indexing are the right direction

### What is still wrong

- `inputRuleGroups` is too ceremonial for normal usage
- `@platejs/typography` is package sprawl for product sugar
- rule-builder logic is duplicated across packages
- `BaseHeadingPlugin` owning heading shorthand is bad DX because people usually
  configure `H1Plugin` through `H6Plugin`, not the aggregate plugin
- `shouldAutoLinkPaste` duplicates what named rule override should own
- `packages/link/src/lib/automd` is a zombie surface
- `getTextFromBlockStart` as a standalone export is an awkward utility leak
- `defineInputRule` is too raw to be the main builder, but too tiny to help
  people discover the better path

### Bottom line

The runtime is worth keeping. The public API still needs one more hard cleanup
pass.

## Decisions

### 1. Remove public `inputRuleGroups`

`inputRuleGroups` should not survive as public config.

It is accurate, but clunky. It forces every consumer to think about two fields
for one concept: "which shortcuts are on?"

The public config should become:

```ts
ItalicPlugin.configure({
  inputRules: {
    markdown: true,
    emphasisUnderscore: null,
  },
});
```

That is the common path:

- one field
- explicit preset activation
- per-rule override/removal in the same object

### 2. Keep preset bundles, but make them internal definition detail

We still need bundle semantics. We just do not need a second public config field
for them.

Plugin definition should become:

```ts
ItalicPlugin.extend({
  inputRulePresets: {
    markdown: ["emphasisAsterisk", "emphasisUnderscore"],
  },
  inputRules: {
    emphasisAsterisk: createInputRule({
      type: "delimitedMark",
      mark: KEYS.italic,
      pattern: { start: "*", end: "*", trigger: "*" },
    }),
    emphasisUnderscore: createInputRule({
      type: "delimitedMark",
      mark: KEYS.italic,
      pattern: { start: "_", end: "_", trigger: "_" },
    }),
  },
});
```

Public config should accept both preset names and rule names inside
`inputRules`.

Config semantics:

- preset entry:
  - `true` enables the preset
  - `null` removes the preset
- rule entry:
  - `true` enables the rule directly
  - `{ ... }` configures the rule
  - `null` removes the rule

Constraint:

- preset names and rule names must not collide inside one plugin

### 3. Split delimiter variants into separate public rule names

This was a real miss.

`emphasis` is too coarse if the developer actually cares about `*` vs `_`.

Public rule names should describe the real override unit:

- `emphasisAsterisk`
- `emphasisUnderscore`
- `strongAsterisk`
- `strongUnderscore`
- `boldItalicAsterisk`
- `boldItalicUnderscore`

Same rule for links and math:

- expose the behavioral unit the developer actually wants to turn on or off
- do not hide materially different triggers under one coarse rule name

### 4. Do not ship `@platejs/text-substitutions` as a published package

This should move out of `packages/*`.

Harsh take: smart quotes, arrows, fractions, legal marks, and other generic
substitutions are product sugar, not durable editor semantics.

Best fit:

- keep the generic builder in core
- ship the actual substitution rule sets as registry kits / copied code in
  `apps/www/src/registry/**`
- let users inspect and mutate them exactly like shadcn-installed code

Why this wins:

- avoids package sprawl
- keeps Plate packages focused on document semantics
- preserves shadcn transparency
- makes "I only want three of these rules" trivial

Rejected:

- keep them in `@platejs/autoformat`: wrong ownership, dead direction
- keep them in `@platejs/utils`: too hidden and semantically vague
- keep them in `@platejs/typography`: better than autoformat, still too much
  published surface for copied sugar

### 5. Add one discoverable builder: `createInputRule`

Do not make developers guess a zoo of helper names.

Keep:

- `defineInputRule` as the low-level escape hatch

Add:

- `createInputRule` as the main DX surface

Shape:

```ts
createInputRule({
  type: "delimitedMark",
  mark: KEYS.italic,
  pattern: { start: "*", end: "*", trigger: "*" },
});

createInputRule({
  type: "blockStart",
  trigger: " ",
  match: ">",
  apply: ({ editor }) => {
    editor.tf.toggleBlock(KEYS.blockquote);
  },
});

createInputRule({
  type: "terminalBlock",
  target: KEYS.p,
  terminal: "$$",
  onMatch: ({ editor, path }) => {
    // ...
  },
});

createInputRule({
  type: "textSubstitution",
  match: "...",
  format: "…",
});
```

Design rule:

- one discoverable public builder
- typed variants by `type`
- low-level `defineInputRule` still available for custom logic

### 6. Keep composition, but demote it below the master builder

The repo still needs shared matcher logic. It just should not be the first
thing users learn.

Core should expose advanced composition helpers only as secondary APIs:

- `matchDelimitedText`
- `matchBlockStart`
- `matchTerminalBlock`
- `matchTextSubstitution`

These helpers exist to build custom rules or power `createInputRule`.
They are not the primary marketing surface.

### 7. Move shared builders out of package internals into core

[markdownInputRules.ts](packages/basic-nodes/src/lib/internal/markdownInputRules.ts)
should not stay package-internal.

It already proves the shared layer is missing.

Core should own:

- the master builder
- the advanced matcher/composition helpers
- shared input-rule types

Packages should own:

- only the feature-specific rule definitions

### 8. Move heading rules onto `H1Plugin` through `H6Plugin`

Heading shorthand should not force users to install/configure
`HeadingPlugin` just to get `#`.

Best ownership:

- `BaseH1Plugin` owns `h1`
- `BaseH2Plugin` owns `h2`
- ...
- `BaseHeadingPlugin` remains a convenience aggregator only

That gives better kit DX and better package intuition.

### 9. Replace `getTextFromBlockStart` with an editor API helper, not `string` options

Do not overload `editor.api.string(...)` with magic boundary options.

That would make the most basic text getter weird.

Best move:

- remove standalone
  [getTextFromBlockStart.ts](packages/core/src/lib/plugins/input-rules/getTextFromBlockStart.ts)
- add `editor.api.textFromBlockStart()`

Reason:

- obvious name
- matches the actual repeated call site
- no hidden option soup on `string`

If more boundary helpers appear later, then widen to a family. Do not
pre-generalize now.

### 10. Make `InputRulesPlugin` edit-only

This runtime has no business running outside editing surfaces.

That change is small and obvious.

### 11. Hard-cut leftover link API duplication

Do all of these together:

- delete public `packages/link/src/lib/automd`
- remove `shouldAutoLinkPaste` from
  [BaseLinkPlugin.ts](packages/link/src/lib/BaseLinkPlugin.ts)
- make `pasteAutolink` override/config the only customization path

Reason:

- named rule override is the better API
- keeping both surfaces is duplicate behavior control

## Recommended Final API

### Plugin definition

```ts
ItalicPlugin.extend({
  inputRulePresets: {
    markdown: ["emphasisAsterisk", "emphasisUnderscore"],
  },
  inputRules: {
    emphasisAsterisk: createInputRule({
      type: "delimitedMark",
      mark: KEYS.italic,
      pattern: { start: "*", end: "*", trigger: "*" },
    }),
    emphasisUnderscore: createInputRule({
      type: "delimitedMark",
      mark: KEYS.italic,
      pattern: { start: "_", end: "_", trigger: "_" },
    }),
  },
});
```

### Plugin config

```ts
ItalicPlugin.configure({
  inputRules: {
    markdown: true,
    emphasisUnderscore: null,
  },
});
```

### App-local copied sugar

```ts
export const TypographyShortcutsKit = [
  createSlatePlugin({
    key: "typographyShortcuts",
    inputRulePresets: {
      defaults: ["smartQuotes", "ellipsis", "mdash"],
    },
    inputRules: {
      smartQuotes: createInputRule({
        type: "textSubstitution",
        format: ["“", "”"],
        match: '"',
      }),
      ellipsis: createInputRule({
        type: "textSubstitution",
        format: "…",
        match: "...",
      }),
      mdash: createInputRule({
        type: "textSubstitution",
        format: "—",
        match: "--",
      }),
    },
  }).configure({
    inputRules: {
      defaults: true,
    },
  }),
];
```

## Rejected Alternatives

### Keep `inputRuleGroups` and add sugar next to it

Reject.

That keeps the public API split even if the common case is sugar-coated.

### Ship many top-level helper names

Reject.

That is discoverability debt. One master builder plus a low-level escape hatch
is cleaner.

### Keep text substitutions in a published package

Reject.

That is framework surface inflation for behavior most people should inspect
locally.

### Extend `editor.api.string` with block-start flags

Reject.

That makes a simple API weird to save one helper name.

## Migration Plan

### Phase 1. Reshape the core types

Files:

- [types.ts](packages/core/src/lib/plugins/input-rules/types.ts)
- [SlatePlugin.ts](packages/core/src/lib/plugin/SlatePlugin.ts)
- [PlatePlugin.ts](packages/core/src/react/plugin/PlatePlugin.ts)
- [resolvePlugin.ts](packages/core/src/internal/plugin/resolvePlugin.ts)
- [resolvePlugins.ts](packages/core/src/internal/plugin/resolvePlugins.ts)

Tasks:

- replace public `inputRuleGroups` config with `inputRules` preset activation
- rename internal definition storage from groups to presets
- update `editor.meta.inputRules.plugins[*]` to expose `presets`, not `groups`
- keep same-name override, then priority, then deterministic order

### Phase 2. Add the real builder layer

Files:

- [defineInputRule.ts](packages/core/src/lib/plugins/input-rules/defineInputRule.ts)
- new core builder files under `packages/core/src/lib/plugins/input-rules/`

Tasks:

- keep `defineInputRule` minimal
- add `createInputRule`
- add internal matcher helpers used by the typed variants
- move shared mark/block/text-substitution matching out of feature packages

### Phase 3. Promote shared editor helpers

Files:

- [getTextFromBlockStart.ts](packages/core/src/lib/plugins/input-rules/getTextFromBlockStart.ts)
- editor API files under `packages/slate` and `packages/core`

Tasks:

- replace standalone export with `editor.api.textFromBlockStart()`
- update code-block, list, basic-nodes, and any other rule families to use it

### Phase 4. Fix feature ownership

Files:

- [BaseHeadingPlugin.ts](packages/basic-nodes/src/lib/BaseHeadingPlugin.ts)
- heading leaf plugins in the same file
- [BaseCodeBlockPlugin.ts](packages/code-block/src/lib/BaseCodeBlockPlugin.ts)
- [BaseLinkPlugin.ts](packages/link/src/lib/BaseLinkPlugin.ts)
- [inputRules.ts](packages/link/src/lib/internal/inputRules.ts)
- [inputRules.ts](packages/list/src/lib/inputRules.ts)
- [inputRules.ts](packages/math/src/lib/inputRules.ts)

Tasks:

- move heading rule ownership to leaf plugins
- rename coarse public rule names to real override units
- rewrite feature rules to use core builders instead of local matcher copies
- remove `shouldAutoLinkPaste`
- delete `packages/link/src/lib/automd`

### Phase 5. Hard-cut text substitutions out of packages

Files:

- [BaseTypographyPlugin.ts](packages/typography/src/lib/BaseTypographyPlugin.ts)
- [BaseSymbolsPlugin.ts](packages/typography/src/lib/BaseSymbolsPlugin.ts)
- [autoformat-kit.tsx](apps/www/src/registry/components/editor/plugins/autoformat-kit.tsx)
- related registry kit files

Tasks:

- delete the published typography/symbols package direction
- move shipped substitution rules into registry-local copied code
- rename the kit files to what they actually are

### Phase 6. Cleanup and docs

Tasks:

- make `InputRulesPlugin` edit-only
- update docs to teach `inputRules` only
- stop teaching `inputRuleGroups`
- show registry kits as explicit copied shortcut code, not hidden package magic

## Test Plan

### Core

- preset activation through `inputRules`
- same-name override
- preset plus per-rule removal
- direct single-rule enable without a preset
- priority ordering for distinct rules
- runtime meta exposing presets and rules

### Builders

- `createInputRule({ type: 'delimitedMark' })`
- `createInputRule({ type: 'blockStart' })`
- `createInputRule({ type: 'terminalBlock' })`
- `createInputRule({ type: 'textSubstitution' })`
- low-level `defineInputRule` still supports custom rules

### Features

- heading leaf-plugin ownership
- separate `emphasisAsterisk` / `emphasisUnderscore`
- code fence and block math still convert correctly
- link autolink override by named rule instead of `shouldAutoLinkPaste`
- list and blockquote continue to respect code-block guards

### Registry

- copied text-substitution kits stay explicit and editable
- registry metadata surfaces active presets/rules truthfully

## Acceptance Criteria

- public config uses only `inputRules`
- preset activation and per-rule override share one obvious config surface
- no published text-substitution package remains
- shared matcher logic is no longer duplicated across feature packages
- heading shorthand does not require `HeadingPlugin`
- `shouldAutoLinkPaste` is gone
- `packages/link/src/lib/automd` is gone
- `InputRulesPlugin` is edit-only
- docs and registry examples match the new shape

## Next Step

If this direction is approved, the next execution pass should start with a
small core-first spike:

1. replace public `inputRuleGroups` with preset activation inside `inputRules`
2. add `createInputRule`
3. move `getTextFromBlockStart` to `editor.api.textFromBlockStart()`
4. migrate one full feature slice end-to-end:
   - `ItalicPlugin`
   - `H1Plugin`
   - `CodeBlockPlugin`
   - link paste autolink override

That slice is enough to prove the DX before ripping through the rest of the
repo.
