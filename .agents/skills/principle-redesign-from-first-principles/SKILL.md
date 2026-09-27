---
name: principle-redesign-from-first-principles
description: "Reconsider an unsettled design when current requirements conflict with inherited structure."
---

# Redesign From First Principles

When integrating a change, don't bolt it onto the existing design. Redesign as if the requirement had been there from the start. The result should look like what we would have built if we'd known on day one.

- Read all affected files and understand the current design holistically
- Ask: "if we were writing this from scratch with this new requirement, what would we build?"
- Keep it simple: choose the simplest design that meets the requirements. Delete, merge, inline or reuse existing components before adding new ones
- Check prior art before inventing. Choose a novel design only when it clearly beats established solutions
- Compare complexity with the current design. A target that adds concepts, layers or states names the requirement that pays for each; otherwise simplify it
- Propagate the change through every reference: types, docs, examples, rationale sections
- Think about the redesign holistically, then deliver it incrementally

This is the method for preserving option value when integrating changes into an existing design.
