# Format mapping authoring

Simple Markdown tags and marks are callback-free declarations derived from the bound schema, and fidelity claims come from actual output. A callback-less `markdown: { tag: type }` lets the compiler build the node, convert the owner's own properties and traverse children by the schema content model. The 2026-10-04 audit found this live and stopped ([triage audit](../2026-10-04-ledger-triage-audit.md), [authoring design](../2026-09-28-format-mapping-authoring.md), [conversion boundary](../2026-09-28-conversion-boundary-adoption.md)). `node tooling/scripts/review-ledger.mjs show format-mappings` prints the full history.

## Layer and owner

| Responsibility | Decision |
| --- | --- |
| Element tags | `markdown: { tag: type }`; `attributes` covers wire aliases such as `url` and `src`. |
| Marks | Roles come from the schema; a simple mark declares only `tag`, `value`, `style` or `node`. |
| Property exposure | Owner-scoped: ownership permits exposure, and generated representation or an invocation-local `preserve` claim establishes fidelity. A role-only default would write List's `indent` onto `<img>`. |
| Custom encoders | Claim with `preserve(...)`, `encodeNodeAttributes()` and `encodeAttributes()`; a round-trip conformance harness guards the claims. |
| Callback mappings | Date, image and standard-kind `node` mappings, plus generated metadata, URL aliases, captions and native HTML meaning that a property's existence cannot imply. |
| Format semantics | HTML, Markdown, plain text, rendered presentation and DOCX keep their own; HTML keeps its syntax contract and shares the accounting and safety. |

Rejected, and why:

| Alternative | Why it lost |
| --- | --- |
| A helper returning the same verbose callbacks | Deletes no author work. |
| The `mark: true` flag and the read Proxy | Schema roles replace them; deleted. |
| Preservation inferred from schema membership | Membership does not authorize external representation. |
| A universal codec or public intermediate AST | No shared round-trip law. |

## What other editors do

| Editor | What it does | What Plate takes |
| --- | --- | --- |
| Tiptap | Explicit Markdown spec factories | Precedent for declarations, not a measured advantage. |
| ProseMirror | Runtime-owned node construction | The compiler builds nodes from the schema. |

## Main changes

- The 11 element and 13 mark declarations became callback-free; serialize got 12% faster against the old head.

## Open work

- The B4 inline-tag benchmark budget still fails, as it did before. owner: the `markdown` subject. stop: a run within budget.
