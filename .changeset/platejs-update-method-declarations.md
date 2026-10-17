---
'platejs': patch
---

- Refuse at compile time an update method in `definePlugin` or `.extend()` that takes arguments and is wrapped in none of `txLocate`, `txSelection` or `txOnly`. Wrap a method whose arguments hold no location as `txLocate(false, (text: string) => …)`.
