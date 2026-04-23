# Update Policy

`north-star` is not decorative. It is a maintained constitutional source.

## Must Update Or Reaffirm When

- introducing a new reusable public API family
- materially changing a public API shape
- introducing a new builder/factory pattern
- changing a runtime/service boundary
- changing a reusable naming/layering rule
- landing a major refactor that invalidates a preferred pattern

## Allowed Evidence

Every such lane must include one of:

- `north-star updated`
- `north-star reaffirmed: <section-name>`

The reaffirmation must name the governing section.

## Review Smell

If a change adds or changes reusable architecture/public-pattern doctrine
without updating or reaffirming `north-star`, the lane is incomplete.

If `plate-plugin-creator` starts accumulating long-form architecture law,
precedence prose, or anti-pattern catalogs, move that content back to
`north-star`.
