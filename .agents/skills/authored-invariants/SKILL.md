---
description: Opt-in formal checks for Plite authored review decisions, recording, effect ledger rebasing, undo/redo history, and delete/paste ranges. Use on demand via pnpm check --audit or pnpm check <name> --light when editing packages/plitejs/src/authored, core/change, history, or transforms-text.
argument-hint: '[check | light | lower | case <identity> | update]'
name: authored-invariants
metadata:
  skiller:
    source: .agents/rules/authored-invariants.mdc
---

# Authored and change invariants

Handle `$ARGUMENTS`. Five bounded exhaustive TypeScript checks for Plite's authored review tree, recording laws, effect ledger, undo/redo history, and delete/paste ranges. All five are opt-in `--audit` checks in `tooling/scripts/check.mjs` and do not block Local CI.

**The property.** Authored changes decide identically in any admissible order, record with lossless accept/reject/undo projections, preserve work across rebases when the effect ledger returns `held`, round-trip through undo/redo and JSON history restore, and keep unselected text intact and canonical under delete, Return, paste, cut, and bold.

**The harm.** Violating these invariants silently drops or corrupts user text depending on decision order, rebase order, or caret placement.

## Run it

Run from repo root (`--light` runs a reduced bound; `--lower` shrinks a baseline after fixes; `--case='<id>'` inspects one case; `--jobs=<n>` sets workers; `pnpm check --audit` runs all opt-in audits):

| Check | Opt-in command | Light command | Script |
| --- | --- | --- | --- |
| Decision order | `pnpm check authored-order` | `pnpm check authored-order --light` | `packages/plitejs/scripts/authored-decision-order.ts` |
| Recording order | `pnpm check authored-recording` | `pnpm check authored-recording --light` | `packages/plitejs/scripts/authored-recording-order.ts` |
| Effect ledger | `pnpm check effect-ledger` | `pnpm check effect-ledger --light` | `packages/plitejs/scripts/effect-ledger.ts` |
| Undo/redo history | `pnpm check undo-redo-history` | `pnpm check undo-redo-history --light` | `packages/plitejs/scripts/undo-redo-history.ts` |
| Delete/paste ranges | `pnpm check delete-paste-ranges` | `pnpm check delete-paste-ranges --light` | `packages/plitejs/scripts/delete-paste-ranges.ts` |

## Bounds and assumptions

- **Decision order:** <=2 blocks, 2 marks, 2 changes (+ give-back, grid, generated-id); excludes larger docs and unmodeled marks.
- **Recording order:** 1-block docs with 1 pending mark (+ required title) in Suggesting/Editing; excludes multi-block docs.
- **Effect ledger:** 1v1 commands across all worlds, 1/64 sample of 2v2, 2,088 queue cases, 11 planted mutations (`--all --world=<shard>` for full 2v2).
- **Undo/redo history:** <=3 edits/undos/redos + 1 remote block op on 1-block docs across 4 grouping modes (`--blocks`/`--size` widen); excludes DOM/IME grouping.
- **Delete/paste ranges:** carets/ranges on <=2 blocks / 2 lines with link, read-only inline, required title, 1-text code block; excludes Plate block plugins, node selections, and browser `beforeinput`.

## Bug vs drift

- **Real bug:** valid command violates the property. Fix the Plite owner and run `pnpm check:<name> --lower` if known findings clear.
- **Oracle drift / modeling error:** script expects an old shape. Never let drift block CI; run `/pstack:maintain-formal-verification-skill` to realign from current code.
- **Intended change:** update `docs/editor-behavior/markdown-editing-spec.md` or `docs/vision/plite.md` and the script together; never grow a baseline.

## Coverage record

Verify drift with `git log --oneline <commit>..HEAD -- <paths>`; move sync commits forward only after confirming scripts match code:

| Area | Sync commit / subject | Covered paths |
| --- | --- | --- |
| Decision order | `b2228e62ef` | `packages/plitejs/src/authored/{authored.ts,resolve-schema.ts,facts/,tree/}` |
| Recording order | `test(plitejs): check every recording command's accept and reject on every small document` | `packages/plitejs/src/authored/{tree/,ledger/}`, `packages/plitejs/src/core/slice-fit/`, `packages/plitejs/src/history/history-state.ts` |
| Effect ledger | `fix(plitejs): make the effect ledger call every lost merge lost` | `packages/plitejs/src/core/change/{effect-ledger*.ts,document-change.ts,root-change.ts,join.ts,enclosure.ts,wrap-fidelity.ts,transform.ts,tokens.ts}`, `packages/plitejs/src/core/record-store.ts` |
| Undo/redo history | `feat(plitejs): record the facts of every command behind an internal option` | `packages/plitejs/src/history/`, `packages/plitejs/src/core/change/{record.ts,slice-facts.ts,root-change.ts,join.ts,enclosure.ts}`, `packages/plitejs/src/core/anchor-state.ts` |
| Delete/paste ranges | `test(plitejs): run the delete and paste range check over a code block and bold` | `packages/plitejs/src/core/{editor-commands.ts,fragment-deleted-range.ts,slice-landing.ts,public-state.ts,anchor.ts,content-completion.ts}`, `packages/plitejs/src/transforms-text/`, `packages/plitejs/src/transforms-node/{set-nodes.ts,merge-nodes.ts}`, `packages/plitejs/src/editor/{element-read-only.ts,insert-break.ts}` |

Use `/pstack:maintain-formal-verification-skill` after changes that skipped these checks.
