Read [Codex playbook execution](../references/codex-playbooks.md) for the tool, lifecycle, and proof mapping before executing this recipe. Preserve the steps below; record any unavailable capability or inapplicable step explicitly.

### Feature

**You own the design and result. Plan and verify.** Implement directly or delegate a bounded independent unit when permitted and useful.

1. Use `how` when the affected subsystem, owner, or behavior is unclear; reuse an existing source-grounded map when it already answers the question.
2. Use `architect` while consequential choices about public contract, ownership, lifetime, or data model remain unresolved. Preserve an accepted design unless new evidence changes it; a routine function boundary does not require competing designs.
3. For nontrivial multi-step work, record the throughput checkpoint in the existing plan. Keep it as short as the actual dependency and ownership decisions allow:
   - **Blocking first steps.** Gates run before fan-out.
   - **Independent workstreams.** Disjoint files, services, or layers parallelize. Shared writes serialize.
   - **Shared mutable state.** Default to splitting the target (the **separate-before-serializing-shared-state** principle skill). Serialize only for real invariants.
   - **Smallest safe decomposition.** If one worker is best, name why.
4. Implement the bounded unit directly, or delegate an independent unit when permitted and useful. Give a delegate the specific file scope, named data shape, organizing structure and success criteria, then inspect its actual diff. Use **arena** when consequential ownership or public-contract alternatives need independent comparison. A routine error-handling or test-layout choice does not require an arena. Preserve the full implementation method: data shape before logic, comments explaining non-obvious reasons, source grounding for upstream-derived files, and complete adoption/proof for shared-primitive improvements. Commit only with actual authority.
5. Verify on the matching surface. "Inconclusive" or wrong-surface is not a pass; flag it.
6. Use the **sequence-verifiable-units** principle skill: build and verify each coherent unit before the next. When commits or PRs are authorized, follow the user's current checkout, staging, and history policy. An ordered implementation does not require rebasing or a PR stack.
7. If the design is contested, `interrogate` before shipping.
8. Run **Opening a PR** only when publication is authorized; otherwise finish the local handoff.

Code-coupled work (one feature, one migration) stays with a single owner and its checkpoint. If delegation is permitted, fan out only after the blocking phase. Parent-level fan-out is for independent artifacts (audits, cross-subsystem investigations, competing experiments). Update the checkpoint when dependencies change; give a new worker complete current scope rather than relying on chained interrupts.

**Reply:** what you built, what you chose and why, open decisions. Tables for design alternatives.
