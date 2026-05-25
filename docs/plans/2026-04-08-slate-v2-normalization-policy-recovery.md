---
date: 2026-04-08
topic: slate-v2-normalization-policy-recovery
status: completed
---

# Slate v2 Normalization Policy Recovery

## Goal

Recover the next honest normalization-policy seam for `True Slate RC` without
pretending the engine already has full legacy schema control.

## Current Slice

1. verify the partially-started `shouldNormalize` hook is worth keeping
2. prove the contract with `snapshot-contract.ts` before widening the claim
3. keep the hook narrowly scoped to the custom `normalizeNode` pass
4. update proof and docs only if the code slice survives verification

## Notes

- a fake parity hook is worse than a missing hook
- built-in normalization behavior is still separate from this custom pass gate

## Result

- `shouldNormalize` is kept as a narrow pass-level gate over the custom
  `normalizeNode` seam
- the custom pass now calls `shouldNormalize` once per iteration instead of
  once per entry
- core falls back safely when an older editor instance does not define
  `shouldNormalize`
- the contract is proved in `snapshot-contract.ts` for delegation, pass-level
  gating, and skip behavior
- docs and the proof ledger are aligned to the narrowed claim

## Verification

- `yarn test:custom`
