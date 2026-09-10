---
name: principle-redesign-from-first-principles
description: "Apply when integrating a new requirement into an existing design. Redesign as if the requirement had been a foundational assumption from day one, instead of bolting it on."
---

Read the [Codex runtime adapter](../poteto-mode/references/codex-runtime.md) before applying this skill. It maps platform tools and authority; the complete engineering method below remains in force.

# Redesign From First Principles

When integrating a change, don't bolt it onto the existing design. Redesign as if the requirement had been there from the start. The result should look like what we would have built if we'd known on day one.

- Read all affected files and understand the current design holistically
- Ask: "if we were writing this from scratch with this new requirement, what would we build?"
- Propagate the change through every reference: types, docs, examples, rationale sections
- Think about the redesign holistically, then deliver it incrementally

This is the method for preserving option value when integrating changes into an existing design.
