# Effect And Subscription Budget

Use this when repeated units run effects or subscribe to runtime/editor stores.

## Rule

Repeated units should not run effects unless synchronizing with an external
system. Runtime subscriptions should be selector-based and scoped by id/range.
Changing React context dependencies count too: a hook such as Plate's
`usePath()` can invalidate consumers on path shifts without subscribing to an
external store.

## Check

- no derived state in effects
- no interaction logic in effects watching state
- no reactive path/context dependency when the value is needed only by an
  event handler; resolve it lazily from stable node/node key
- no hand-rolled repeated subscriptions when `useSyncExternalStore` or a local
  selector hook exists
- `useEffectEvent` only for event-like callbacks fired from an effect/observer
  that need latest props without resubscribing
- effect count per repeated unit is tracked
- root-level external subscription count is tracked

## Use Existing Rules

- `react-useeffect`
- `rerender-derived-state-no-effect`
- `rerender-move-effect-to-event`
- `advanced-effect-event-deps`

This rule owns the repeated-unit budget and Plite runtime subscription proof.
