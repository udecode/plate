---
"slate-dom": major
---

Replace the public DOM bridge install surface with the Slate v2 `dom()` extension and editor DOM APIs.

**Migration:**

- Use `dom()` instead of `withDOM`.
- Use `editor.api.dom` and `editor.api.clipboard` instead of importing `DOMEditor` as a public runtime object.
- Import public DOM helpers from the `slate-dom` package root; Slate 0.x deep imports from `slate-dom/lib/*` are not public.
- Use nullable `resolveSlatePoint` and `resolveSlateRange` through the editor DOM API, and use assert-style DOM APIs only when unresolved DOM targets should throw.
- Replace DOM coverage `selectionPolicy: 'boundary'` with `selectionPolicy: 'skip'`.
- Replace DOM coverage `selectionPolicy: 'model-backed'` with `selectionPolicy: 'model'`.
- Replace DOM coverage `copyPolicy: 'include-model'` with `copyPolicy: 'model'`.
- Replace DOM coverage `copyPolicy: 'summary-only'` with `copyPolicy: 'summary'`.
- Replace DOM coverage `findPolicy: 'not-native-until-mounted'` with `findPolicy: 'native'` or `findPolicy: 'custom'`.
