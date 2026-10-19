# JSON helpers leave the token module

Status: executed, waiting on your commit
Page: https://claude.ai/artifact/E8kEGtva8pt2XJoVZCbytm
Playbook: refactoring

Commit c01399d08b made `schema-definition.ts` import `normalizeSetValues` from `core/change/transform.ts`, and `transform.ts` imported its JSON helpers from `core/change/tokens.ts`. A source-level esbuild bundle of `platejs/slash-command` then kept most of `tokens.ts`, `resolved-token-cursor.ts` and `utils/node-keys.ts`. The owner asked for the smallest ownership move that frees `normalizeSetValues` and `schema-definition.ts` from that machinery, proof on a before and after metafile, and a refreshed entrypoint size snapshot.

## Brief

### What will change?

The small JSON helpers now live in their own file, so the schema code no longer reaches the token code. That matters for anyone who bundles from source. What we publish to npm stays the same size.

### What could go wrong?

Nothing at runtime, since only imports moved. But the slash-command size jump has a different cause than we thought. The published plitejs ships as one big chunk, so the bundler keeps a lot of code the entry never uses. That fix is a separate job.

## Teach

Plite has a token file that turns pieces of a document into a flat list of tokens. That file also held five small helpers for plain data, like "are these two values equal" and "freeze this value". Lots of other code borrowed those helpers from it.

The token file does real work the moment it loads. So when you bundle Plite from source, borrowing even one helper drags the whole token file in. The schema code started borrowing one helper three days ago, and the slash-command bundle grew by about 6 KB of token code.

The helpers now sit in their own small file, and everything borrows them from there. Bundled from source, the token code drops out again. The npm package doesn't change, because it ships most of Plite as one big file, and the bundler keeps all of that file's load-time work no matter what.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Old import path | Every caller moves to the new file, with no re-export from the token file | Keep a re-export in the token file | keep re-export | detail |
| JSON check in set normalization | Keep it, the schema path pays about 2 KB when bundled from source | Skip the check on the schema path | skip schema check | small |
| Size snapshot | Record the tree's current sizes, as you asked | Leave the old snapshot | keep old snapshot | small |

## Main changes

- New `packages/plitejs/src/core/change/json.ts` owns `JsonRecord`, `isRecord`, `jsonEqual`, `cloneJson`, `deepFreeze` and `cloneFrozen`, moved byte for byte from `tokens.ts`. It imports only `isImmutable` from `core/clone.ts`.
- `tokens.ts` imports those helpers from `json.ts` and no longer exports them. All 20 importers in `packages/plitejs/src` and `packages/plitejs/test` import them from `json.ts`; nothing re-exports them.
- `tooling/entrypoints/platejs-entrypoint-sizes.json` records the sizes the release check measures now.

## Close

**The premise did not hold for the shipped package.** On the source-level esbuild bundle, the move removes the growth. On the dist artifact the release check measures, c01399d08b's import added nothing, and the move removes nothing. The dist size drift has a different cause, listed under Open work.

**What landed.** The helper move above, done by `docs/plans/artifacts/json-helpers-leaf/move.mjs`, plus a refreshed size snapshot.

**Proof and its limits.**

- The source-level metafile comes from `measure.mjs`. It runs esbuild 0.28, minified, resolves plitejs to source through the `packages/platejs/tsconfig.json` paths and marks every other package external. `platejs/slash-command` is 103668 bytes at `HEAD` with c01399d08b's schema hunk reverted, 112598 in the tree before the move, and 106491 after it. `tokens.ts`, `resolved-token-cursor.ts` and `utils/node-keys.ts` drop to 0 bytes. The 2823 bytes left are `value-codec.ts` (2011) for `normalizeSetValues`'s JSON check, `transform.ts` (379) and `json.ts`.
- The dist bundle comes from `measure-dist.mjs`, with the same esbuild settings on the built `dist`, each package mapped through its own `exports`. c01399d08b^ gives 453424, c01399d08b gives 457951, and c01399d08b with its schema hunk reverted gives 458195, so the import cost nothing on dist. `HEAD` and `HEAD` plus this diff both give 484713.
- The cause is the chunking. tsdown emits plitejs core as one 1.5 MB `src-*.js` chunk. To a consumer bundler, the token code and the schema code sit in one module. `regions.mjs` attributes the unminified slash-command bundle by source region, and the bundle runs to about 1.1 MB unminified, nearly all of it plitejs. All of `tokens.ts` stays, reached through the change machinery.
- For the size snapshot, the release check's own run on `HEAD` plus this diff, in a detached worktree, matches the tree within 10 bytes on every entry. So the snapshot diff is drift already committed at `HEAD`, not this change. In the final snapshot, `platejs/slash-command` goes from 445428 to 479082 bytes, most entries grow about 37 KB, and `platejs/suggestion` drops from 1139830 to 589014.
- `pnpm plite:release:packages` passes, all 32 entry sizes included. Its first rerun failed by 84 to 105 bytes on 30 of them, because another session edited `schema-compiler.ts` between the update and the check. A second update and check, run back to back, pass. The slash-command value of 445428 dates from da4898bb61 and was not re-recorded since.
- The plitejs test partitions core, authored, diff, history, testing, dom, react and pagination pass, except one `tx.break.exit` case in core. The yjs partition fails 8 exclusive-property cases. The same 9 cases fail at clean `HEAD` 79de482237 in a detached worktree. Typecheck passes, except 2 `canContain` errors in `editor-commands.ts`, which carries another session's uncommitted edit.
- `pnpm lint:task` on the 22 files reports 8 errors, and the same 8 occur at `HEAD`.

**Counts.** Of 6 asks, 5 are done and 1 is partial. The ownership move, the metafile before and after, the snapshot update, the size diff review and the release rerun are done. "The slim-entry growth goes away" holds for source bundles only, so it is partial.

## Open work

- The published plitejs ships its core as one chunk, so every slim platejs entry keeps about 380 KB more than a source bundle of the same entry (484713 versus 106491 bytes for slash-command). Try per-file output for plitejs, as platejs ships, or remove load-time work such as `PreparedTokenSlice.empty`, then measure every entry with the release check. owner: zbeyens, through a follow-up session. stop: `pnpm plite:release:packages` shows the slim entries shrink, or the attempt shows per-file output cannot ship.
- 9 plitejs test cases fail at `HEAD` (8 yjs exclusive-property, 1 `tx.break.exit`). owner: zbeyens. stop: they pass at `HEAD`.
