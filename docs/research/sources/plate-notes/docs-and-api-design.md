---
title: plate-notes: docs and API design
type: source
status: partial
source_refs:
  - docs/plans/2026-10-24-research-loop.md
updated: 2026-10-25
---

# plate-notes: docs and API design

## Compiler discovery

- **Discover compiler inputs by nominal shape, including default exports.** Fixed export names couple application vocabulary to a compiler. Current `packages/cli/src/generate.ts:188-211` enumerates module exports and requires exactly one non-empty array of nominal plugin descriptors; `default` participates because it is an ordinary module export. Generated types retain the discovered export name rather than assuming `plugins`. Source: `c70bacbd4a:docs/plans/2026-08-14-decouple-plate-generate-export-names.md:287-290`. Limit: this describes plugin-tuple discovery; application-schema candidates use a different discriminator.
