---
'platejs': major
---

Require React and React DOM 19.2 or newer.

Export `SlashPluginState` as the complete mutable state contract for `BaseSlashPlugin`.

- Expose Slash plugins through the Plite-native plugin contract
- Register slash-input values in compiled schemas
- Install the slash-input descriptor as a required plugin dependency
- Use `slashCommand` and `slashInput` as plugin identities, with transient elements persisted as `slashInput`
