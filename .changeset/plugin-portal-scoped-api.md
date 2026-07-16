---
"@platejs/core": major
---

Scope `editor.plugin(FooPlugin).api` to the plugin API and expose the composed
editor API through `editor.plugin(FooPlugin).editor.api`.

Replace Slate-era Core exports with Plite and Plate-owned names.

Pass each render wrapper its owning plugin portal context and forward Plite DOM
strategy props through Plate content.

Skip autofocus, input rule, and override work when lifecycle targets are unavailable.

Keep Plate root wiring on direct Plite React imports and infer plugin lookup
and root callback types without local adapter casts.

Prepare v54 beta prerelease versioning and preserve initial selections when
`transformInitialValue` wraps selected text during editor setup.

Install typed plugin-object dependencies recursively with deterministic
overrides, dependency-first ordering, and graph validation.

**Migration:** Replace nested plugin API reads with the scoped portal API:

```tsx
// Before
editor.plugin(FooPlugin).api.foo.method();

// After
editor.plugin(FooPlugin).api.method();
editor.plugin(FooPlugin).editor.api.foo.method();
```

Rename these exports:

- `Slate` to `Plite`
- `PlateSlate` to `PlateRoot`
- `useSlateProps` to `usePlateRootProps`
- `getSlatePlugin` to `getBasePlugin`
- `SlateRenderElementProps` to `PliteRenderElementProps`
- `SlateRenderLeafProps` to `PliteRenderLeafProps`
- `SlateRenderTextProps` to `PliteRenderTextProps`

Replace dependency keys such as `dependencies: ['feature']` with the plugin
object, for example `dependencies: [BaseFeaturePlugin]`.
