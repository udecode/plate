---
description: Build new Plate plugins with Slate-first architecture, sane typing, and explicit React/Plate wrapper boundaries. Use when authoring or refactoring Plate plugin packages, deciding between createSlatePlugin vs createPlatePlugin, defining plugin APIs/transforms/options, or lifting semantic base plugins into React/Plate wrappers.
name: plate-plugin-creator
metadata:
  skiller:
    source: .agents/rules/plate-plugin-creator.mdc
---

# Plate Plugin Creator

Repo-specific companion to Plate's core plugin APIs.

Before shaping a reusable public API, architecture decision, builder/factory
pattern, naming convention, runtime/service boundary, or perf-sensitive public
surface, read [north-star](../north-star/SKILL.md) first. This skill is the
execution companion, not the constitutional source of truth.

Use this skill for Plate-specific plugin authorship: semantic ownership,
authoring order, type-contract fidelity, and React/Plate wrapper boundaries.

Use [docs-plugin](../docs-plugin/SKILL.md) for public plugin docs.

## North-Star Gate

Binary contract:

- If the lane materially changes reusable API shape, runtime boundaries,
  builder/factory patterns, or reusable naming/layering, stop and route to
  [north-star](../north-star/SKILL.md) first. Then include:
  - `north-star updated`
  - or `north-star reaffirmed: <section-name>`
- If not, continue here for plugin execution mechanics.

Owner map:

| Owner | Scope |
| --- | --- |
| `north-star` | doctrine, API shape, runtime boundaries, perf law |
| `plate-plugin-creator` | plugin mechanics, typing, wrappers, file placement |

Do not restate long-form `north-star` law, precedence, or anti-pattern prose
here. Keep only the routing gate, short derived checklist, and execution
mechanics.

Derived checklist from `north-star`:

1. Is the owner/layer explicit?
2. Is this canonical semantics or local sugar?
3. Is the config explicit and copyable?
4. Does the shape add hidden runtime work on the hot path?
5. Does core own a primitive here instead of feature semantics?

## Repo Surfaces

- `packages/*/src/lib` — semantic base plugins, transforms, parsers, rules
- `packages/*/src/react` — Plate/React wrappers, hooks, node props, components
- `packages/core/src/lib/plugin` — Slate-first authoring primitives
- `packages/core/src/react/plugin` — Plate wrapper primitives
- `packages/core/type-tests` — plugin contract source of truth

## Principles

1. **Start where semantics live.** If the behavior matters without React, start
   in `src/lib`.
2. **Use inference before ceremony.** Reach for `createT*` only when explicit
   contract control buys something real.
3. **Wrap base plugins.** If a semantic base already exists, lift it with
   `toPlatePlugin` or `toTPlatePlugin` instead of re-authoring it in React.
4. **Design the API shape on purpose.** Plugin-specific surfaces and merged
   editor surfaces are different tools.
5. **Use shared keys.** Shipped plugin keys and cross-plugin references should
   come from `packages/utils/src/lib/plate-keys.ts`, not random string literals.
6. **Core contracts beat precedent.** Type tests and core authoring APIs outrank
   noisy old package examples.
7. **Keep the lane narrow.** This skill owns plugin authoring, not public docs.

## Critical Rules

### Barrel & File Placement

- Never hand-write or hand-edit `index.ts` / `index.tsx` barrel files. Treat
  them as generated output only.
- When adding, moving, renaming, or deleting public files under exported
  package folders, run `pnpm brl` after the file work and before final
  verification.
- If `pnpm brl` produces a broken barrel, fix the barrel generator/config or
  file placement. Do not patch the generated `index.ts` by hand after `brl`.
- Any helper, matcher, fallback branch, or possible future fork logic that is
  not part of the intended public contract should live under an `internal/`
  directory.
- Default to `internal/` unless the user-facing API genuinely needs the file to
  be importable.

### Creation Flow → [creation-flow.md](./rules/creation-flow.md)

- Start with the decision tree before writing code.
- `createSlatePlugin` / `createTSlatePlugin` own semantic base plugins.
- `toPlatePlugin` / `toTPlatePlugin` lift a semantic base into the React/Plate
  surface.
- `createPlatePlugin` / `createTPlatePlugin` are for real React/Plate-native
  plugins or bundles of existing Plate plugins.
- If you only need to bundle existing Plate plugins, do not invent a fake base
  plugin first.

### Typing & Context → [typing.md](./rules/typing.md)

- Callback context already provides `editor`, `plugin`, `type`, `api`, `tf`,
  `getOptions`, `setOption`, and friends. Use them.
- Forbid `any` in source files. The only acceptable exception is non-type test
  code where the looseness is intentional and local to the test.
- Do not thread `SlateEditor` through callbacks, options, or helper signatures
  when plugin context already has the editor.
- Prefer `KEYS` from `packages/utils/src/lib/plate-keys.ts` for shipped/shared
  plugin keys and cross-plugin references. Use `editor.getType(KEYS.foo)` when
  you need the resolved node type.
- `createTSlatePlugin` and `createTPlatePlugin` are explicit-contract tools, not
  default ceremony.
- Trust `packages/core/type-tests/*` over stale package precedent.

### Composition & API Shape → [composition.md](./rules/composition.md)

- `extendApi` / `extendTransforms` are plugin-specific surfaces.
- `extendEditorApi` / `extendEditorTransforms` feed the merged editor surface.
- Use `configurePlugin` to override nested child plugins instead of cloning
  their config by hand.
- Use `overrideEditor` when the real ownership is editor behavior, not random
  event glue.
- For React-only augmentation of existing rendered nodes, prefer
  `inject.nodeProps.transformProps` before inventing wrapper components or
  heavier node plumbing. This is especially right when the augmentation needs
  hooks.

## Hard Law

**Slate-first, Plate-second.**

If a plugin has meaningful document semantics without React, author the base in
`packages/*/src/lib` first. Add the React/Plate layer only when rendering,
hooks, or Plate-only editor integration is actually needed.

Named exceptions:

1. React-only hook or `useHooks` plugins
2. DOM/editor-surface plugins with no meaningful Slate-only base
3. Plate-only bundle plugins that just compose existing Plate plugins
4. React node-prop injection that truly depends on hooks or component context

## Do Not Copy

- Do not start in `src/react` just because the consumer eventually uses React.
- Do not re-author a base plugin with `createPlatePlugin` just to add a
  component or small wrapper config.
- Do not hardcode shipped/shared plugin keys when `KEYS` already owns that
  contract.
- Do not cargo-cult `({ editor }: { editor: SlateEditor }) => ...` callback
  annotations when inference already knows the editor type.
- Do not extract editor-locked helpers just to placate TypeScript.
- Do not create new public top-level files when `internal/` is enough.
- Do not treat `transformProps` like a universal replacement for
  `node.component`, `render`, or `useHooks`. Use it when the real job is prop
  augmentation.
- Do not trust the loudest old plugin file over core APIs and type tests.

## Key Patterns

```ts
// Good: semantic base first, thin Plate wrapper second.
export const BaseCommentPlugin = createTSlatePlugin<BaseCommentConfig>({
  key: KEYS.comment,
}).extendApi(...);

export const CommentPlugin = toPlatePlugin(BaseCommentPlugin);

// Good: wrapper adds Plate-only child wiring without re-authoring semantics.
export const CodeBlockPlugin = toPlatePlugin(BaseCodeBlockPlugin, {
  plugins: [CodeLinePlugin, CodeSyntaxPlugin],
});

// Good: direct Plate plugin when the job is React/editor integration.
export const EventEditorPlugin = createPlatePlugin({
  key: 'eventEditor',
  handlers: { ... },
});

// Good: bundle existing Plate plugins without fake base-plugin theater.
export const BasicBlocksPlugin = createPlatePlugin({
  plugins: [BlockquotePlugin, HeadingPlugin, HorizontalRulePlugin],
});
```

## Workflow

1. Read [creation-flow.md](./rules/creation-flow.md) before choosing an API.
2. Search the closest analog in `packages/*/src/lib`, `packages/*/src/react`,
   and `packages/core/type-tests`.
3. Decide whether this is:
   - a semantic base plugin
   - a Plate/React wrapper
   - a React-native exception
   - a bundle plugin
4. Lock the contract shape:
   - options
   - plugin-specific API/transforms
   - merged editor API/transforms
   - nested child plugins
5. Apply the typing rules before adding explicit annotations.
6. Add docs only by handing off to [docs-plugin](../docs-plugin/SKILL.md).
7. Verify the smallest honest surface:
   - package tests for semantic/plugin behavior
   - type tests or targeted typecheck when public contract changed
   - React tests only when the wrapper layer changed

## Audit References

- [plugin-authoring-audit.md](./references/plugin-authoring-audit.md) — real
  repo examples of good patterns and cautionary ones

## Detailed References

- [creation-flow.md](./rules/creation-flow.md)
- [typing.md](./rules/typing.md)
- [composition.md](./rules/composition.md)
