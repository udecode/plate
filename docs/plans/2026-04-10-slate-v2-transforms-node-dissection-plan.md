---
date: 2026-04-10
topic: slate-v2-transforms-node-dissection
status: completed
source_repos:
  - /Users/zbeyens/git/slate-v2
  - /Users/zbeyens/git/plate-2
---

# Slate v2 `transforms-node.ts` Dissection Plan

## Goal

Move the live node transform bodies out of
[transforms-node.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/transforms-node.ts)
and back into their historical method files under
[/Users/zbeyens/git/slate-v2/packages/slate/src/transforms-node](/Users/zbeyens/git/slate-v2/packages/slate/src/transforms-node).

## Rule

- public method paths should be real owners
- shared helper code can stay shared, but only in one small support file
- no `export * from '../transforms-node'` fake ownership for behavior files

## Target files

- [insert-nodes.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/transforms-node/insert-nodes.ts)
- [move-nodes.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/transforms-node/move-nodes.ts)
- [merge-nodes.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/transforms-node/merge-nodes.ts)
- [remove-nodes.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/transforms-node/remove-nodes.ts)
- [set-nodes.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/transforms-node/set-nodes.ts)
- [unset-nodes.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/transforms-node/unset-nodes.ts)
- [split-nodes.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/transforms-node/split-nodes.ts)
- [wrap-nodes.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/transforms-node/wrap-nodes.ts)
- [lift-nodes.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/transforms-node/lift-nodes.ts)
- [unwrap-nodes.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/transforms-node/unwrap-nodes.ts)

## Support file

- [shared.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/transforms-node/shared.ts)

## Completion criteria

- every method file above owns real logic
- [transforms-node.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/transforms-node.ts) becomes an explicit export surface only
- [index.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/transforms-node/index.ts) explicitly exports those owners
- [pr-description.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/pr-description.md) explains the surviving drift per file
- a narrow `tsc --noEmit --skipLibCheck --target es2022 --module esnext --moduleResolution bundler ...` pass over the touched node transform files and direct callers is green

Status:

- done
