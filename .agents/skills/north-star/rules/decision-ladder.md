# Decision Ladder

Run these in order.

## 1. Is This Reusable?

- reusable public/editor-platform API
- reusable runtime/service boundary
- reusable naming/layering rule

If yes, `north-star` owns the decision.

If no, keep going.

## 2. Is This App-Local Convenience?

- local registry-kit sugar
- one-off docs/demo convenience
- app-only composition

If yes, do not route to `north-star` unless it mutates a reusable contract.

## 3. Is The Pattern Already Settled?

If the reusable pattern is already decided and this task is only about
implementation mechanics, hand off to
[plate-plugin-creator](../plate-plugin-creator/SKILL.md) or another execution
skill.

## 4. Is The Layer Clear?

Pick one:

- constitutional doctrine
- shared primitive
- feature semantic contract
- execution helper
- local convenience

If ambiguous, route upward to `north-star`.

## 5. Does Performance Constrain The Shape?

If yes, run the performance protocol before blessing the prettier API.

## 6. Does This Lane Need Reaffirmation?

If the lane introduces or materially changes a reusable public pattern, include:

- `north-star updated`
- or `north-star reaffirmed: <section-name>`

No implicit reaffirmation.
