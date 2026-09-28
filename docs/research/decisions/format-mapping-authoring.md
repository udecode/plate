---
title: Schema-bound format mapping authoring
type: decision
status: accepted
updated: 2026-09-28
review_scope: format-mappings
current_review: 2026-09-28-format-mappings-value-review
reconciled_executions:
  - 2026-09-28-format-mapping-authoring-design
review_history:
  - ../review-records/2026-09-28-format-mappings-value-review.json
related:
  - markdown-conversion.md
  - import-fidelity.md
  - export-fidelity.md
---

# Schema-bound format mapping authoring

**Pursue** a bounded design for simpler feature mappings. Retain the selected
Markdown grammar and each format's semantic owner. This value decision does
not select a final public signature or establish implementation or proof.

Test explicit tag declarations whose compiler derives construction, property
conversion and child traversal from the bound schema. Prefer that deletion of
author work over a helper that merely returns the same verbose callbacks.
Compare deriving the mark/element contract from the schema binding, including
scalar mark values and runtime-owned wrapper children.

Schema membership alone does not authorize external representation. A tag
mapping needs an explicit property-exposure policy; generated metadata,
URL aliases, media captions, date normalization and native HTML meaning cannot
be inferred from a property's existence. Keep custom mappings for those jobs.
HTML, Markdown, plain text, component-rendered presentation and DOCX retain
their distinct semantics; no universal codec or public intermediate AST is
justified by this comparison.

HTML already reports unsupported content properties. Its unassessed ledger
scope does not erase earlier compiler and authoring work. Tiptap's explicit
Markdown spec factories and ProseMirror's runtime-owned node construction are
useful precedents, not evidence of a measured Plate advantage.

Task's next bounded design compares simple columns, text-block tags, scalar
marks, media and date exceptions, and HTML property patches. Existing Markdown
correctness and browser/benchmark closure remain separate authorized work.
No full HTML/static audit, new runtime proof or performance claim is established
by this review.

The design plan
[Format mapping authoring](../../plans/2026-09-28-format-mapping-authoring.md)
is complete ([design record](../review-records/2026-09-28-format-mapping-authoring-design.json)).
A callback-less `markdown: { tag: type }` lets the compiler build the node,
convert the owner's own properties and traverse children by the schema content
model; `attributes` covers wire aliases such as `url`/`src`. Mark roles come from
the schema, so `mark: true` leaves the contract and simple marks declare only
`tag`, `value`, `style` or `node`. Exposure is owner-scoped: a role-only default
would write List's `indent`/`listType` onto `<img>`. A prototype matched
hand-written mappings on 11 of 13 fixtures (the other two differ only in writing
an empty text block self-closing) at 1.02× their cost. Date, image and
standard-kind `node` mappings keep callbacks.

Next: authorize execution of slices S1–S4.
