# Composition

## Base First, Wrapper Second

If the semantic base exists, wrap it.

Prefer:

```ts
export const MentionPlugin = toPlatePlugin(BaseMentionPlugin);
```

over re-declaring the same semantics in `createPlatePlugin`.

## Use Nested Plugins Intentionally

- Put semantic child plugins in the base plugin's `plugins` array when they are
  part of the semantic contract.
- Put Plate child plugins in the wrapper when the wrapper owns the React/Plate
  layer.

Good example:

```ts
export const CodeBlockPlugin = toPlatePlugin(BaseCodeBlockPlugin, {
  plugins: [CodeLinePlugin, CodeSyntaxPlugin],
});
```

## Configure, Don't Clone

If you need to adjust a nested child plugin, use `configurePlugin` instead of
copy-pasting a new child plugin definition.

That keeps the ownership boundary obvious and preserves shared behavior.

## Extend The Right Surface

- `extend`
  Merge config or compute context-aware config.
- `extendPlugin`
  Reach into a nested plugin when the parent owns that decision.
- `overrideEditor`
  Change editor behavior itself.
- `handlers`
  Use for events that actually belong at the plugin boundary, not as a dumping
  ground for logic that should be a transform or editor override.

## Prefer `transformProps` For React-Only Node Augmentation

When the job is "augment props on already-rendered nodes in the Plate layer",
prefer `inject.nodeProps.transformProps`.

This is especially good when:

- the augmentation is React-only
- hooks are needed
- the semantic base plugin should stay clean
- you do not need to replace the component, only decorate its props

Good fits:

- `BlockSelectionPlugin`
- `NavigationFeedbackPlugin`

Do not over-apply this rule. `transformProps` is for prop augmentation. It is
not a blanket replacement for `node.component`, `render`, wrapper plugins, or
`useHooks`.

## Helpers

Keep helpers inline when they are single-use and context-local.

If you extract a helper:

- make it generic
- keep it context-free when possible
- avoid locking it to `SlateEditor` by habit

Do not create abstraction sludge just because a callback body is slightly long.
