---
date: 2026-04-06
topic: slate-v2-prosemirror-lexical-roadmap-scan
status: active
---

# Slate v2 ProseMirror + Lexical Roadmap Scan

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

Run a fresh focused code scan of:

- `/Users/zbeyens/git/prosemirror`
- `/Users/zbeyens/git/lexical`

for these seams:

- transaction/update model
- history/bookmark semantics
- clipboard boundary
- extension/plugin composition
- React/runtime subscription model

Then revise
[`package-end-state-roadmap.md`](/Users/zbeyens/git/plate-2/docs/slate-v2/archive/package-end-state-roadmap.md)
with package-level `borrow / reject / later` guidance.

## Phases

1. Map exact source files in `../prosemirror` for the five seams.
2. Map exact source files in `../lexical` for the five seams.
3. Extract concrete takeaways for:
   - `slate`
   - `slate-dom`
   - `slate-react`
   - `slate-history`
   - `slate-browser`
4. Revise the roadmap doc with an explicit appendix:
   - borrow now
   - reject
   - later
5. Verify formatting and summarize what changed.
