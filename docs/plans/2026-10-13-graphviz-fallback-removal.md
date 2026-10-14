# Graphviz engine loads by one name

Status: executed, waiting on your commit
Page: https://claude.ai/artifact/2sdr3UmUm1ttvKxXfebgxZ
Playbook: refactoring

`renderGraphviz` loaded the Graphviz engine as `viz.js/full.render.js` and, when that threw, again as `viz.js/full.render`. `packages/platejs/src/code-drawing/viz.d.ts` existed only to type the second name. This closes the open item that [2026-10-13-graphviz-interop-order](2026-10-13-graphviz-interop-order.md) left. It asked to prove or refute that the catch branch is dead in the www app's real bundle, and to remove it if it is.

## Brief

### What will change?

Graphviz drawings now ask for their engine file once. The backup ask and its type file are gone. Both build tools the docs site uses already treated the two names as one file.

### What could go wrong?

If the engine file fails to download, the drawing shows its error one try sooner. Drawings that load look the same.

## Teach

A Graphviz drawing turns diagram text into a picture. It needs a big engine file from the viz.js library, so the editor only fetches it when a drawing first renders.

Until now the code asked for that file by its full name, and if that failed, asked again by a shorter name. The library doesn't tell its file names apart, so build tools read both names as the same file. In both build tools the docs site uses, both asks pointed at that one file. The second ask could only repeat the first.

Now the code asks once. The type file that only existed for the shorter name is gone.

## Demo

1. From `apps/www`, run `PLATE_WWW_DYNAMIC_DOCS=1 PLATE_WWW_DEV_SOURCE=1 pnpm exec next dev --port 3296` and open http://localhost:3296/docs/code-drawing.
2. Click the code in the drawing, pick Graphviz in the menu at its top right, and replace the code with `digraph G { Start -> Viz -> Done }`. Three ovals, Start, Viz and Done, appear joined by arrows. ![after](artifacts/2026-10-13-graphviz-fallback-removal/turbopack-graphviz-render.jpg)
3. From the repository root, run `bun test ./packages/platejs/src/code-drawing`. It reports 14 pass and 0 fail.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Retry after a failed engine download | Gone, the error shows one try sooner | Keep one retry on purpose | keep retry | small |
| Setting that lets the apps see package type files | Kept, other type files may need it | Remove it from three app settings and a test | drop include | detail |
| Old one-line comments in the renderer file | Kept as they are | Delete all six | cut comments | detail |
| Release note | None, nothing users see changes | A patch note | add changeset | detail |
| Proof of the production build | A dev build with the same build tool | A full production build | prod build | detail |

## Main changes

- `renderGraphviz` in `packages/platejs/src/code-drawing/lib/renderers.ts` awaits `import('viz.js/full.render.js')` once and still passes `fullRender.default` to `Viz` when the namespace has one. The inferred `const` already types the synthetic `default`, so I removed the `as typeof fullRender` cast.
- `packages/platejs/src/code-drawing/viz.d.ts` is gone, because `@types/viz.js` already types `viz.js/full.render.js`.

## Candidates

| Rank | Strength | Candidate | Files | Facts | Navigation score | Recommendation | Owner | Proof | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Strong | Extensionless engine retry and its ambient type | `packages/platejs/src/code-drawing/lib/renderers.ts`, `packages/platejs/src/code-drawing/viz.d.ts` | Both bundlers compile both imports to one module id; the retry came with the package's first commit with no bug cited | Easier: one import, one fewer file, no ambient module to trace | Delete the retry and the declaration | `platejs` code-drawing | Chunk scans, live render in both bundlers, code-drawing specs | delete |
| 2 | Worth exploring | `../../packages/*/src/**/*.d.ts` include | `apps/www/tsconfig.json`, `apps/www/tsconfig.package-integration.json`, `apps/plite/tsconfig.json`, `tooling/scripts/check-plite.test.mjs` | Now matches only `commonmark-spec.d.ts`, which only a platejs spec reads | Same | Keep; it is the general path for package ambient declarations | apps tooling | none needed | keep |

## Close

**Reversal first.** The request asked to prove or refute that the catch branch is unreachable. Strictly, it is reachable. In both bundlers the catch runs when the engine chunk fails to load or the engine throws while evaluating. Then it re-requests the identical module. It can never load a different file, so it is dead as a fallback. What remains is an accidental second retry. I removed it on that reading. The Defaults row "keep retry" restores a deliberate retry.

**What landed.** `renderGraphviz` imports `viz.js/full.render.js` once and keeps the CommonJS `default` unwrap. `viz.d.ts` is deleted. The stale example in `docs/research/sources/plate-notes/testing-and-proof.md` now names `markdown/lib/internal/commonmark-spec.d.ts` as the remaining ambient declaration. No changeset applies, because the built package ships no declaration for the extensionless name and rendering is unchanged.

**Proof.** Each log is in `docs/plans/artifacts/2026-10-13-graphviz-fallback-removal/`.

- Turbopack, before the edit. `turbopack-dev-chunks-a2.log` shows both `import()` calls in each of the two served `renderGraphviz` bodies compile to one async loader id for `viz.js@2.1.2/node_modules/viz.js/full.render.js`. `turbopack-runtime-excerpt.txt` holds the served runtime. In it, a failed chunk load retries once after a short delay and stays out of the cache, and a module that throws keeps its error and rethrows it.
- Webpack, the bundler `pnpm --filter www build` uses, before the edit. `webpack-dev-disk-a3.log` shows both calls in each of four bodies load the same chunk id and require the same module id. Its dev runtime clears a failed chunk and a throwing module, so a repeat re-requests the same file.
- After the edit. `turbopack-dev-chunks-post-a2.log` and `webpack-dev-disk-post-a1.log` show one engine import per body. The Turbopack scan ran before the type-only cast removal, which erases at compile time; the webpack scan ran on the final bytes.
- Live render on the final bytes. `turbopack-graphviz-render.jpg` and `webpack-graphviz-render.jpg` show `digraph G { Start -> Viz -> Done }` drawn on `/docs/code-drawing` in each bundler.
- `renderers-pre-a1.log` shows 10 pass before the edit, and `renderers-final-a1.log` shows 14 pass and 0 fail across both code-drawing spec files on the final bytes.
- `typecheck-code-drawing-a2.log` passes, and its build info lists `renderers.ts` and `@types/viz.js/full.render.js.d.ts` with no `viz.d.ts`. `lint-task-a2.log` is clean.
- `knowledge-head-plus-patch-a1.log` and `knowledge-head-a1.log` report the same single K7 finding, in `docs/plans/topics/emoji.md`, so this change adds none. In this checkout, `check-knowledge-a1.log` fails on 52 K7 findings that cite other sessions' new test files. None cites this run's file.

**Limits.** No production `next build` ran. The production claim rests on webpack dev, which I infer resolves `node_modules` the same way. I ran no other bundler that consumers of the published package might use. I infer the full `.js` name is the more portable of the two, since a resolver that demands full specifiers rejects only the short name. The UI drive set the code with a direct form fill, not key-by-key typing.

**Counts.** Source roots inspected: `packages/platejs/src/code-drawing`, `apps/www` and `apps/plite` tsconfigs, `docs/research`. Two candidates, one deleted and one kept. One packet applied and kept. Navigation is easier for the renderer and the same elsewhere. Scale receipts are N/A, since the change runs once per drawing load. Next owner: none.

**Earlier records.** The plans and the probe capture that cite `code-drawing/viz.d.ts` stay as written.
