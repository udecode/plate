# Input Rules Recipe Registration Plan

## Status

- Date: 2026-04-14
- Owner: Codex
- Scope: reusable `inputRules` public API across package plugins and shipped kits
- Execution status: in progress

## Problem Frame

The current `inputRules` API is in an awkward middle state:

- packages own canonical rule definitions
- kits explicitly activate them
- activation currently happens by boolean key maps
- the boolean key maps are weakly typed and push naming pressure onto public
  string keys

That shape is serviceable, but not the best DX.

The stronger model is:

- packages own canonical rule recipes
- no package or generic kit enables them by default
- kits register explicit rule instances
- rule overrides are one-shot object params, not chained mutations
- app-local shorthand remains a separate lane from package-owned canonical rules

## Locked Decisions

### 1. Ownership

- Feature packages own canonical rule semantics.
- Kits own activation.
- Generic/basic kits should not silently enable markdown-style input rules by
  default.
- App-local shorthand stays app-local until it becomes genuinely canonical.

### 2. Public Activation Model

Replace boolean-key activation with explicit rule registration:

```ts
H1Plugin.configure({
  inputRules: [HeadingRules.markdown()],
});
```

Not:

```ts
H1Plugin.configure({
  inputRules: { hash: true },
});
```

### 3. Rule Export Model

- Export semantic rule recipes from the owning package.
- Default to family factories, even when current variants only differ by
  delimiter or match strings.
- For closed canonical package families, expose semantic knobs like `variant`,
  `level`, or `checked` instead of raw mechanics like `trigger`, `match`, or
  literal delimiters.
- For closed families with a single canonical shape in the owning plugin scope,
  prefer no public params at all.
- Use singleton exports only when there is genuinely one canonical shape and no
  meaningful kit-time params.
- Do not export only "complex" rules. Complexity is not the ownership line.

Examples:

```ts
BoldRules.markdown({ variant: '*' })
HeadingRules.markdown()
HorizontalRuleRules.markdown({ variant: '-' })
TaskListRules.markdown({ checked: false })
LinkRules.markdown()
```

### 4. Override Model

- Allow one-shot object overrides when creating a rule instance.
- Do not allow chained override methods.
- For closed canonical families, keep factory params narrow and semantic:
  `variant`, `level`, `checked`.
- Expose raw mechanics like `trigger`, `match`, or delimiters only for
  intentionally open-ended families, not for closed package-owned ones.
- Do not let callers override `resolve` or `apply` on canonical recipes.
- Runtime-level fields like `priority` can still be overridden on the returned
  rule object with object spread when a kit really needs it.

Good:

```ts
BoldRules.markdown({ variant: '_' })
{ ...LinkRules.autolink({ variant: 'paste' }), priority: 200 }
```

Bad:

```ts
HorizontalRuleRules.markdown({ variant: '-' })
  .trigger('-')
  .priority(200)
```

### 5. Genericity Rule

The generic API lives in core builders, not in public leaf names.

- Core can expose generic builders like `mark`, `blockStart`,
  `delimitedInline`, `textSubstitution`.
- Exported package rule names should stay semantic and syntax-lane oriented:
  `markdown`, `autolink`, `task`.
- Do not make every package export `insert`, `toggle`, or similarly generic
  leaf names.

### 6. Lane Split

This migration covers package-owned canonical input rules.

It does not flatten app-local shorthand into the same lane. Current
`AutoformatKit` shorthand remains separate and should be evaluated later as its
own product lane.

## Execution Notes

- Core moved to explicit rule-instance registration. Boolean-key activation is
  gone.
- Package-owned markdown families now export concrete factories like
  `BoldRules.markdown(...)`, `HeadingRules.markdown()`,
  `HorizontalRuleRules.markdown(...)`, `LinkRules.markdown()`, and
  `MathRules.markdown(...)`.
- Matcher duplication was trimmed in core instead of pushing more package-local
  wrappers:
  - stronger block-start matcher path
  - block-fence matcher/helper with `on: 'match' | 'break'`
  - delimited-inline matcher for inline math
  - text-substitution helper for app-local shorthand
- Generic rule gating now lives in core as `enabled(context)` instead of
  helper-local `isBlocked(editor)` escape hatches.
- Shipped kits now own activation by registering concrete rule instances.
- `CodeBlockRules.markdown({ on })` and `MathRules.markdown({ variant: '$$', on })`
  now sit on the same core block-fence primitive instead of carrying separate
  block-start / insert-break matcher code.
- `BasicMarksPlugin` and the separate `BasicMarkMarkdownCombosPlugin` were
  removed from the shipped basic-marks kit. The combo rules are currently
  hosted under `BoldPlugin.configure({ inputRules: [...] })` as app-local kit
  wiring, not as a reusable package-level surface.
- Generic text substitutions in `AutoformatKit` dropped the `-- -> —` and
  `... -> …` transforms.

## Verification Snapshot

- `pnpm turbo build --filter=./apps/www`
- `pnpm turbo typecheck --filter=./apps/www`
- `pnpm lint:fix`

Result:

- build passed
- app typecheck passed
- lint passed with no fixes
- only the pre-existing Turbopack NFT warning from
  `apps/www/next.config.ts` remained

## Target API

### Core

Core should accept explicit rule instances:

```ts
type InputRulesConfig = AnyInputRule[];
```

Core should also support recipe materialization ergonomics:

```ts
type InputRuleRecipe<TOptions = void> = TOptions extends void
  ? AnyInputRule
  : (options: TOptions) => AnyInputRule;
```

The runtime registry should only store concrete rule instances. It should not
keep an "available but inactive" named rule map on plugins.

If the runtime needs stable identity for debug or test metadata, derive it
internally from the owning family and normalized params. Only add an optional
explicit `id` override later if real collision cases show up.

### Package Exports

Examples of the intended package surface:

```ts
export const BoldRules = {
  markdown: createBoldMarkdownRule(...),
};

export const HeadingRules = {
  markdown: createHeadingMarkdownRule(...),
};

export const HorizontalRuleRules = {
  markdown: createHorizontalRuleMarkdownRule(...),
};
```

### Kit Activation

Examples of the intended kit surface:

```ts
H1Plugin.configure({
  inputRules: [HeadingRules.markdown()],
});

HorizontalRulePlugin.configure({
  inputRules: [
    HorizontalRuleRules.markdown({ variant: '-' }),
    HorizontalRuleRules.markdown({ variant: '_' }),
  ],
});
```

## Family Inventory

### `@platejs/basic-nodes`

Files:

- `packages/basic-nodes/src/lib/BaseBoldPlugin.ts`
- `packages/basic-nodes/src/lib/BaseItalicPlugin.ts`
- `packages/basic-nodes/src/lib/BaseUnderlinePlugin.ts`
- `packages/basic-nodes/src/lib/BaseCodePlugin.ts`
- `packages/basic-nodes/src/lib/BaseStrikethroughPlugin.ts`
- `packages/basic-nodes/src/lib/BaseSubscriptPlugin.ts`
- `packages/basic-nodes/src/lib/BaseSuperscriptPlugin.ts`
- `packages/basic-nodes/src/lib/BaseHighlightPlugin.ts`
- `packages/basic-nodes/src/lib/BaseHeadingPlugin.ts`
- `packages/basic-nodes/src/lib/BaseBlockquotePlugin.ts`
- `packages/basic-nodes/src/lib/BaseHorizontalRulePlugin.ts`

Current rule families:

- marks: `asterisk`, `underscore`, `backtick`, `tilde`, `caret`, `equals`,
  `alt`
- headings: `hash`
- blockquote: `marker`
- horizontal rule: `dash`, `underscore`

Target:

- move mark rules into exported markdown families per feature so kits choose
  syntax variants instead of wiring raw delimiters
- collapse heading hash logic into one shared markdown family instead of six
  local duplicated `hash` declarations
- rename weak names during migration if needed:
  - `marker` should likely become something more concrete
  - `alt` should likely become something meaning-bearing

### `@platejs/code-block`

Files:

- `packages/code-block/src/lib/BaseCodeBlockPlugin.ts`

Current rule family:

- `fence`

Target:

- export `CodeBlockRules.markdown({ on })` if the family is canonical markdown
  entry
- keep `on` explicit because typed-fence commit and Enter-based commit are
  meaningfully different
- kit registers it explicitly

### `@platejs/list`

Files:

- `packages/list/src/lib/BaseListPlugin.tsx`
- `packages/list/src/lib/inputRules.ts`

Current rule families:

- `bullet`
- `ordered`
- `todo`

Target:

- split list markdown families by feature:
  `BulletedListRules`, `OrderedListRules`, `TaskListRules`
- keep list semantics package-owned
- use semantic params like `{ checked: boolean }` instead of raw token
  mechanics for task variants

### `@platejs/list-classic`

Files:

- `packages/list-classic/src/lib/BaseListPlugin.ts`
- `packages/list-classic/src/lib/inputRules.ts`

Current rule families:

- `bullet`
- `ordered`
- `checked`
- `unchecked`

Target:

- export classic list markdown families under split feature namespaces
- evaluate whether `checked` / `unchecked` collapse into one `task` family with
  `{ checked: boolean }`

### `@platejs/link`

Files:

- `packages/link/src/lib/BaseLinkPlugin.ts`
- `packages/link/src/lib/internal/inputRules.ts`

Current rule families:

- `markdown`
- `pasteAutolink`
- `spaceAutolink`
- `breakAutolink`

Target:

- export link-owned rule recipes from the package
- keep link semantics package-owned
- keep host/runtime concerns in the shared input-rule lane, not in kits
- prefer semantic families like `markdown()` or `autolink({ variant: 'paste' })`
  over raw trigger-based kit config

### `@platejs/math`

Files:

- `packages/math/src/lib/BaseInlineEquationPlugin.ts`
- `packages/math/src/lib/BaseEquationPlugin.ts`
- `packages/math/src/lib/inputRules.ts`

Current rule families:

- `dollar`
- `doubleDollar`

Target:

- prefer `MathRules.markdown({ variant: '$' })` for inline and
  `MathRules.markdown({ variant: '$$', on })` for block entry when the only
  extra semantic knob is the block-fence commit mode
- keep separate families only if the semantics materially diverge

### App Kits

Files:

- `apps/www/src/registry/components/editor/plugins/basic-blocks-kit.tsx`
- `apps/www/src/registry/components/editor/plugins/basic-marks-kit.tsx`
- `apps/www/src/registry/components/editor/plugins/code-block-kit.tsx`
- `apps/www/src/registry/components/editor/plugins/link-kit.tsx`
- `apps/www/src/registry/components/editor/plugins/list-kit.tsx`
- `apps/www/src/registry/components/editor/plugins/list-classic-kit.tsx`
- `apps/www/src/registry/components/editor/plugins/math-kit.tsx`

Target:

- import canonical package rule recipes
- register explicit instances
- no boolean-key activation
- keep app-local combo/shorthand plugins local

### App-Local Shortcut Lane

Files:

- `apps/www/src/registry/components/editor/plugins/autoformat-kit.tsx`

This lane is intentionally separate.

It currently defines app-local text substitution rules and other shortcut
behavior. Do not force it into the package-owned canonical recipe migration in
phase 1.

## Migration Phases

### Phase 1: Lock the Core Contract

Files:

- `packages/core/src/lib/plugins/input-rules/types.ts`
- `packages/core/src/internal/plugin/resolvePlugin.ts`
- `packages/core/src/internal/plugin/resolvePlugins.ts`
- `packages/core/src/lib/plugin/SlatePlugin.ts`
- `packages/core/src/react/plugin/PlatePlugin.ts`

Tasks:

- replace boolean-key `inputRules` config with explicit rule-instance arrays
- define a concrete runtime type for registered rule instances
- remove plugin-level "available rule names" activation logic
- keep runtime widening at storage boundaries
- preserve lazy snapshot getters on rule context

### Phase 2: Add Package Rule Namespaces / Families

Tasks:

- export canonical rule recipes from each owning package
- remove duplicated per-plugin inline recipe declarations where one family
  factory should exist
- default to family factories
- keep singleton exports only where there is no meaningful instance config
- convert closed canonical families to semantic params instead of raw mechanics

### Phase 3: Migrate Shipped Kits

Tasks:

- update shipped kits to import canonical package rules
- register explicit rule instances
- leave default activation off in generic/basic kits unless the kit is
  intentionally markdown-oriented

Open product call:

- whether `BasicBlocksKit` and `BasicMarksKit` should remain neutral or become
  explicitly markdown-oriented should be decided before implementation

### Phase 4: Test Migration

Files to touch:

- package input rule specs in `packages/*/src/lib/*.spec.tsx`
- `packages/core/src/internal/plugin/resolvePlugins.spec.tsx`
- `packages/core/src/react/utils/inputRules.spec.tsx`
- shipped kit integration tests in `apps/www`

Tasks:

- replace boolean-key activation assertions with explicit rule registration
- add tests for package rule recipe exports
- add tests for family factory options on parameterized families
- add tests proving no defaults fire unless the kit registered the rule

### Phase 5: Docs and Skill Alignment

Files:

- `content/(plugins)/(functionality)/autoformat.mdx`
- `content/(plugins)/(functionality)/autoformat.cn.mdx`
- relevant package docs for input rules
- `north-star` if the final API differs from this plan materially
- `plate-plugin-creator` if implementation mechanics need updating

Tasks:

- document the new ownership and activation model
- explain package-owned recipes vs app-local shorthand
- remove docs language that implies boolean-key activation

## Implementation Order

Recommended order:

1. core runtime/config contract
2. headings + horizontal rule + blockquote
3. mark plugins
4. code block
5. list + list-classic
6. link
7. math
8. shipped kits
9. docs

Why this order:

- headings / hr / blockquote prove parameterized families and multi-variant
  registration early
- marks prove reusable family factories, semantic variants, and kit-local combos
- list/link/math cover more semantic edge cases after the activation model is
  stable

## Risks

### 1. Half-Migrated API Rot

Supporting both boolean-key activation and explicit rule-instance registration
for long will rot the surface.

Mitigation:

- choose one public model
- hard-cut the old one after migration

### 2. Namespace Soup

If every feature invents its own export style, discoverability gets worse.

Mitigation:

- lock one package export convention before phase 2

### 3. Overridable Canonical Semantics

If callers can replace `resolve` or `apply`, canonical recipes stop being
canonical.

Mitigation:

- only allow narrow declarative params in recipe factories
- prefer semantic params over leaked mechanics in closed families
- do not expose semantic callbacks as override inputs

### 4. App-Kit Boundary Drift

If app-local shorthand gets merged into the package-owned lane, ownership gets
muddy again.

Mitigation:

- keep `AutoformatKit` and other local shortcut bundles explicitly separate in
  docs and code

## Open Questions To Resolve Before Execution

1. Final package export convention:
   - `HeadingRules.markdown()`
   - `BoldRules.markdown({ variant: '*' })`
   - `HeadingPlugin.rules.markdown(...)`
   - another namespaced variant
2. Whether neutral shipped kits should disable markdown-style rules by default
   or whether we introduce separate markdown-oriented kits
3. Final naming cleanup targets:
   - blockquote `marker`
   - highlight `alt`
   - any task-list naming consolidation across list packages

## Recommended Next Step

Write the `north-star` rule for this activation model, then implement a proof
slice:

- core contract
- `basic-blocks-kit`
- headings
- blockquote
- horizontal rule

If that slice feels clean, hard-cut the boolean-key model and continue family by
family.

`north-star reaffirmed: laws`
`north-star reaffirmed: pattern-catalog`
`north-star reaffirmed: performance-selection-rules`
