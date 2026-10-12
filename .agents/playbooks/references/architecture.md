# Architecture decisions

Read `VISION.md` first. Name the current user job, public compatibility
requirements and hard correctness, security, serialized-data and native laws.
Compare at least two materially different ownership or runtime targets,
including keeping the current design and the strongest justified deletion.

Use concrete public call sites, actual package imports and materially different
consumers. Existing code is evidence; a new abstraction still needs a current
job. Runtime cost arguments need Benchmark's pre-acceptance proof. Public API
plans use the configured architect and plan panel gates.

For each removal, name the behavior it carried, its surviving owner or
authorized deletion, callers, docs, examples and regression proof. Product
removals and breaking migrations require active task authority. An audit only
reports them. Stable published contracts remain part of adoption planning.

An exhaustive audit enumerates the complete bounded owner and records each
member as read, kept, adapted, removed or a named gap. Do not infer whole-owner
coverage from a few representative files. Read the implementation and each
caller whose behavior the change can break.

Rank findings P0 for immediate severe harm, P1 for a blocking correctness or
ownership defect, P2 for a material improvement, and P3 for optional cleanup.
A ready plan has one selected target, settled adoption owners and checkable
proof per step. An unresolved required proof keeps the plan open.
