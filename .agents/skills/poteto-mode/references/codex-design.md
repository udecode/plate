# Redesign from First Principles

When an unsettled API or architecture decision conflicts with inherited structure, use [Redesign from First Principles](../../principle-redesign-from-first-principles/SKILL.md) to compare targets. Start from the current user job and hard correctness, security, data and native/runtime laws. Ask what the design would be if those requirements had been present on day one. Existing and proposed names, owners, primitives and package boundaries must earn their place; compare deletion, merging, reuse and replacement at the relevant layers.

Choose the strongest materially justified target before planning adoption. Implementation difficulty and migration effort can affect sequencing; explicit compatibility requirements remain constraints. Existing code and rationale are evidence, not automatic requirements. Keeping the current design is valid when it wins the comparison. A new abstraction must pass the same test as an old one.

Reuse a settled comparison while its requirements and evidence remain valid. A small edit with no unresolved architecture decision does not require a redesign workflow. A review still authorizes only review; implementation and proof follow the project's existing owners. Read the adapter and leaf once without recursively reopening each other.
