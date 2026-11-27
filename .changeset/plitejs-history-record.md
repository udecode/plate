---
'plitejs': patch
---

Add `editor.api.history.record(effect, value, { firstWrite })` to record a session step, with `HistoryRecordResult`, `HistoryRecordOptions` and `EditorEffectHistoryKind` exported from `plitejs`. While a `firstWrite` promise runs, the step stays in undo and holds the redo it cleared, so redo returns `busy`. A first write that resolves `blocked` takes the step back and gives back the redo it held. The session effect's replay reads the promise as `firstWrite` on `EditorEffectHistoryReplayContext`, and a first write that rejects reports to the lifecycle error sink with phase `apply`.

**Migration:** `tx.effects.emit` and `editor.update.effects.emit` now refuse a session effect, one defined with `history: { replay }`, both in types and at runtime. Record it outside any update instead:

```ts
// Before
editor.update((tx) => tx.effects.emit(threadEffect, step));

// After
editor.api.history.record(threadEffect, step);
```

`EditorEffectType<T>` and `EditorEffect<T>` now stand for an effect of any history kind, so `emit` refuses them in types. A state field's `effect`, the effects `getCollabEffects` returns and the effect `defineEffect` returns for a `push` or `skip` effect keep emitting as before. Type your own parameter `EditorEffectType<T, EditorJsonValue, StateFieldHistoryPolicy>` to emit it.
