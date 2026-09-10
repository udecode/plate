# Compare designs

Use this only for a decision with material unresolved alternatives.

For each credible candidate, show the same representative caller operation, source of truth, invariants, failure/retry behavior, and migration. Compare what the caller must remember and what the structure makes impossible. A smaller file count is not automatically simpler.

Prefer evidence from the weakest assumption over equal effort on every candidate. A throwaway prototype answers one question and has a removal boundary. Candidate work must not silently replace shipped design or product authority.

Transfer a useful idea from a losing candidate when it improves the selected design. Record the chosen design and the specific rejected tradeoff once in the existing plan.

Repeated repairs at the same boundary justify revisiting the model: reproduce the failure, name the invariant the current shape cannot express, and compare an owner/API change with another patch. A redesign still needs a complete caller migration, preserved external contracts, and proof before deletion.

