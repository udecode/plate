# Yjs Command Helper Bug Reduction

Goal: reduce obvious browser-visible collaboration demo command bugs.

## Scope

- Keep the fix focused on command/helper behavior in `site/examples/ts/yjs-collaboration.tsx`.
- Use Playwright regressions for observable peer convergence and page errors.
- Preserve existing Yjs/history semantics; no snapshot fallback.

## Progress

- [x] Loaded codex-autoresearch, task, debug, testing, tdd, learnings, and planning context.
- [x] Read current Yjs collaboration helper code and prior structural wrap/fragment/history learnings.
- [x] Add failing Playwright coverage for obvious command-helper bugs.
- [x] Fix command helpers that still hard-code stale text paths.
- [x] Add failing Playwright coverage for disconnected Replace after structured first-block edits.
- [x] Fix disconnected Replace to replay a root `replace_fragment` operation instead of hand-written `[0, 0]` text edits.
- [x] Add failing package and Playwright coverage for splitting inside virtual wrapped blocks.
- [x] Fix virtual wrapper child-slot reads so split-created raw siblings remain visible.
- [x] Fix Split then Merge button DOM sync for the initiating peer.
- [x] Fix custom split undo to delete the right split element by visible slot after a prior virtual merge.
- [x] Re-run the 96-pair connected command matrix; no findings.
- [x] Run focused Playwright and relevant repo checks.
- [x] Capture the reusable stale-command-path learning.

## Findings

- The example already has generic text-entry helpers, but several command buttons still target `[0, 0]`.
- Those hard-coded paths are unsafe after commands create nested wrappers or multiple text leaves.
- The red cases were fragment after fragment, wrap then text/delete/back controls, and append/back/fragment/back.
- Disconnected Replace still used manual `[0, 0]` `remove_text`/`insert_text`. It failed after Wrap with a non-leaf path error and after Fragment with stale offset errors.
- Splitting inside a virtual wrapped block hit the same raw-vs-visible slot bug as earlier structural moves. Inserting the right split node by raw index could throw `Length exceeded!`; after that insert path was fixed, the right split node was still hidden because virtual-child readers returned only the virtual source and ignored later raw siblings.
- Split then Merge produced a model/Yjs-converged value but left the initiating peer's DOM stale until another render. The demo button now bumps its render epoch after Merge.
- Merge then Split then Undo exposed the matching delete-side bug: custom split undo found the right split element by visible path but deleted `parent.delete(index, 1)` by raw index. A hidden merge source before the right split node made Undo delete the hidden node and leave the right split visible.
- The final connected command pair scan covered 96 pairs and returned zero page-error or convergence findings.
- Verification: focused 8-test Playwright structure subset passed, `bun typecheck:site`, `bun lint:fix`, `bun typecheck:root`, `bun lint`, and `bun check` passed.
- Learning captured in `docs/solutions/ui-bugs/yjs-demo-command-stale-text-paths-2026-06-01.md`.
