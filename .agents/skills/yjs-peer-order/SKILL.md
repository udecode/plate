---
description: Opt-in formal check for two-peer Yjs convergence, mirror parity, and schema validity across command and delivery orders in Plain and Suggesting modes. Use on demand via pnpm check --audit or when editing packages/plitejs/src/yjs.
argument-hint: '[check | deep | lower | case <identity> | update]'
name: yjs-peer-order
metadata:
  skiller:
    source: .agents/rules/yjs-peer-order.mdc
---

# Yjs peer order

Handle `$ARGUMENTS`. Opt-in `--audit` check (not blocking Local CI) running the real `yjs()` binding on `createEditor` across peers `alice`/`bob` plus late joiners `carol`/`dana`.

**The property.** For every command pair and sync order in the bound, each peer accepts every update, mirrors its own Yjs roots after every step, converges to one schema-valid document, and preserves every base letter count.

**The harm.** A peer diverging from its `Y.Doc` or refusing an update corrupts collaboration until reload and silently drops or doubles text.

## Run it

- `pnpm check yjs-peer-order` (`pnpm check:yjs-peer-order`): full opt-in gate (22,206 leaves, pinned by `GATE_LEAVES`).
- `pnpm check yjs-peer-order --light`: 1-in-6 subset (3,958 leaves, `LIGHT_LEAVES`).
- `pnpm check:yjs-peer-order --all-docs --world=<w> --intent=<plain|suggesting>`: run one extra world/intent at a time (`--unheard` runs concurrent unheard grid schedules outside the gate).
- `pnpm check:yjs-peer-order --world=<w> --intent=<i> --doc=<d> --case='<id>'`: inspect one interleaving.
- `pnpm check:yjs-peer-order --lower`: shrink `packages/plitejs/scripts/yjs-peer-order-baseline.json` after fixes.

Exit 0 passes, 1 reports findings (`yjs-peer-mirror`, `yjs-peer-admission`, `yjs-peer-converge`, `yjs-peer-letters`, `yjs-peer-grid`, `yjs-peer-verdict`), 2 reports harness/flag error.

## Bounds and assumptions

- 1 command per peer at gate (`--commands=2` exceeds 1h); `grid` runs Suggesting heard schedules (`cells` 2x2 at gate, `wide` 2x3 under `--all-docs`) and checks rectangular rows, single-change column/row marks, and plain-editor parity across verdict orders. Excludes marks other than `commentIds`, inlines other than `link`, lists, plain/Editing tables, widths, merged cells, unheard grid crossings, undo/redo, awareness, partial/out-of-order updates, trimmed rooms, Enter in code blocks, browser input, and Hocuspocus providers.

## Bug vs drift

- **Real bug:** solo editor accepts each command, yet peers diverge, throw, or drop letters. Fix owner and run `--lower`.
- **Modeling error:** mirror read or letter-sum oracle disagrees with binding contract. Fix `packages/plitejs/scripts/yjs-peer-order.ts` with reason; never grow baseline.

## Coverage record

Synced at `test(plitejs): widen the Yjs peer-order check to links, quotes, decisions and a late joiner`. Check drift with `git log --oneline <commit>..HEAD -- packages/plitejs/src/yjs packages/plitejs/scripts/yjs-peer-order.ts` and move sync commit only after confirming script and running `pnpm check:yjs-peer-order`.

Covered paths: `packages/plitejs/src/yjs/core/{plugin,controller,editor-adapter,event-change-bridge,replacement,text-runs,root-owners,document}.ts`, `packages/plitejs/src/core/{change/root-change,editor-commands,selection-protocol,editor-schema,representation}.ts`, `packages/plitejs/src/authored/{authored,tree/spare-lines}.ts`, `packages/plitejs/src/transforms-node/split-nodes.ts`.

Use `/pstack:maintain-formal-verification-skill` after changes that skipped this check.
