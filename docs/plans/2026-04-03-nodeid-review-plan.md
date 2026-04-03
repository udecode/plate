# NodeId Review Plan

## Goal

Decide whether `NodeIdPlugin` is already the best performance shape for a major release, and rewrite it only if the measured gain is real.

## Steps

1. Read the current implementation, tests, and existing learnings.
2. Separate init-time normalization from live normalization.
3. Identify which path is still paying unnecessary work.
4. Only rewrite if the gain is measurable and the behavior stays intact.
5. Verify with targeted tests, benchmark evidence, build, typecheck, and lint.
