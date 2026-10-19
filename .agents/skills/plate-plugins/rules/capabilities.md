# Capabilities And Inference

`docs/vision/plate.md` (Plugin and component doctrine) and `docs/vision/plite.md`
(Plite API Direction) hold the capability and inference law. This reference
keeps the order for choosing a capability and the staging rules that apply it.

## Inference Law

Let builders and initializers own contextual typing.

## Capability Boundary Protocol

Classify every contribution before choosing a plugin field. Each field's
boundary is the Vision capability table ("Capability names encode execution
boundaries"). Choose in this order:

1. Stored per editor? Declare defaults in `initialState`, use `store` for live
   access, and use `selectors` only for pure store projections.
2. Reads the document? Use `read` when the result must bind to the supplied
   snapshot or active transaction state.
3. Mutates the document? Use `update` and the supplied `tx` for a mutation that composes with other draft work, or an `api` service that opens exactly one update for a complete model action.
4. Otherwise, use `api` for a plugin-owned service that is not snapshot- or
   transaction-bound.
5. Use the flat native Plite fields only when the capability genuinely belongs
   to editor-wide substrate. If none fits, stop and name the ownership gap.

## API And Transaction Law

- A flat native runtime callback may be assembled before plugin API
  publication. When it needs a staged API, keep the typed callback context and
  read `context.api` at invocation time. Do not eagerly destructure `api`
  during descriptor construction and capture the pre-publication value.
- A shared stage factory never accepts the current descriptor solely to infer
  its name, schema, or element type. Let `.extend(factory(...))` contextually
  bind the stage and read owner capabilities from its callback context.
