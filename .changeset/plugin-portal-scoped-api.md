---
"@platejs/core": major
---

Scope `editor.plugin(FooPlugin).api` to the plugin API and expose the composed editor API through `editor.plugin(FooPlugin).editorApi`.

Prepare v54 beta prerelease versioning and preserve initial selections when
`transformInitialValue` wraps selected text during editor setup.

**Migration:** Replace nested plugin API reads with the scoped portal API:

```tsx
// Before
editor.plugin(FooPlugin).api.foo.method();

// After
editor.plugin(FooPlugin).api.method();
editor.plugin(FooPlugin).editorApi.foo.method();
```
