# One owner for the browser handle key

Status: executed, waiting on your commit
Page: https://claude.ai/artifact/RtTZneAnmmGdHWLVPe2zC7
Playbook: refactoring

The browser test helpers now read the browser handle key from plitejs instead of keeping their own copy, so the key can't drift between the editor that writes the handle and the tests that read it.

## Teach

The editor puts a small test handle on its editable element, under a fixed property name. Browser tests read that property inside the page to drive and inspect the editor. plitejs owns the name. The shared test helpers kept a second copy, because importing plitejs from Playwright crashed.

The crash came from three private classes in plitejs that exist only for type checking. Playwright turns TypeScript into JavaScript with Babel. Babel tried to compile the fields of those private classes before deleting them, and it crashes on any field there. Exported ones get deleted first, so they never crashed.

Those three classes now use a read-only getter instead of a field. TypeScript treats both the same way, and Babel leaves getters alone. So Playwright can load plitejs, and the helpers re-export the one key.

## Main changes

- In `packages/plitejs/src/interfaces/editor.ts`, the three non-exported ambient brand classes (`PrivatePluginReferenceBrand`, `PrivatePluginWitness`, `PrivatePluginDependencyWitness`) declare `protected get x(): T;` instead of `protected readonly x: T;`. The brands stay nominal, covariant and inferable. The exported `PluginTypeProvider` and `PluginFactoryTypeProvider` keep their fields, so every exported declaration stays byte-identical.
- `packages/test/src/playwright/constants.ts` re-exports `BROWSER_HANDLE_KEY` from `platejs/testing` and no longer declares it.
- `tooling/entrypoints/entrypoint-dag.mjs` lets the `@platejs/test` playwright entrypoint import `platejs/testing`. Its `root` dependency already declares that edge, so the playwright closure stays the same. The entrypoint generator rewrote `packages/test/turbo.json` and `packages/test/tsconfig.entrypoints/playwright.json` from it.
- `packages/test/test/proof/package-scripts.test.ts` accepts a subpath export that its source file re-exports from another package.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| How the test helpers get the key | Make plitejs loadable in Playwright and re-export its key (look) | Add a new testing-only package entry just for the key | new entry | small |
| Test helpers importing the testing entry | Allow it, since their root entry already does | Keep the old rule and keep a copy of the key | keep copy | small |
| Which brand classes change | Only the three private ones that crash | All five, so they all look alike | all five | detail |
| Other sessions' stale generated files | Leave them to their owners | Regenerate them here | regenerate | detail |

## Close

One decision was reversed. The first build turned all five brand classes into getters. comment-sicko showed that only the three private ones crash Babel, so the two exported classes went back to their fields. Every exported declaration is now byte-identical, and the API reference manifest needs no change.

`BROWSER_HANDLE_KEY` now has one definition, in `packages/plitejs/src/internal/browser-protocol.ts`. `@platejs/test/playwright` re-exports it through `platejs/testing`. Outside docs, `git grep` finds the key's value only in that file. All of it sits uncommitted on `next`.

Proof, each in `docs/plans/artifacts/2026-10-12-browser-handle-key-dedupe/`:

- Red, then green. With only the re-export and a rebuilt `@platejs/test` dist, `playwright test --list` fails with the declare-field SyntaxError at `editor.ts:2741` (`list-red-a2.log`). After the getters, it lists all three tests (`list-green-a2.log`).
- Babel itself. Playwright's own `babelTransform` throws on the pre-run file, passes on the final file, passes with exported fields, and throws again at line 2780 once one private field comes back (`probe-babel-brands-a1.log`).
- Types. A field brand and a getter brand agree on nominal rejection, covariance, `in out` invariance and `infer` under tsc 7.0.2 (`brand-equivalence-a1.log`), and a bogus assertion fails (`brand-equivalence-bogus-a1.log`). Typechecks for plitejs, platejs and `@platejs/test` pass uncached (`typecheck-final-*-a1.log`).
- Tests. `pnpm --filter @platejs/test test` passes 39 of 39 tasks, 0 cached (`test-pkg-test-final-a1.log`). Before the test change, it failed on `playwright/BROWSER_HANDLE_KEY: missing public declaration` (`test-pkg-test-a1.log`).
- DAG. The entrypoint lint passes with the new edge and refuses the import without it (`dag-lint-a1.log`, `dag-lint-control-no-edge-a1.log`).
- Browser. `PLITE_BROWSER_FORCE_PROOF=1 pnpm --filter plite test:plite-browser:chromium tests/plite-browser/donor/examples/iframe.test.ts` under Node 22 rebuilt the app, served it itself and passed 3 of 3 (`plite-chromium-iframe-a3.log`). The dist it loaded imports the key from `platejs/testing` (`dist-key-source-a1.log`).

Limits:

- `pnpm check entrypoint-graph` fails in this checkout on `packages/platejs/turbo.json`, which holds another session's staged edits that the generator doesn't reproduce (`entrypoint-graph-a3.log`). In a detached worktree with every changed and untracked file copied in and only that file regenerated, the real command passes (`wt-entrypoint-graph-a2.log`).
- `pnpm --filter www api-reference --check` stays stale on line 3921, another session's `unwrap` return type. This run adds no hunk there (`manifest-residual-final-a1.log`).
- Only Chromium ran. The change is module loading in the Node test process, not browser behavior.

The run tracked 24 items. 17 are done, 6 skipped, 1 partial, 0 blocked and 0 open. The partial item is the entrypoint check above. The skips are the new pin, candidate ranking, panel, decision-trail review, reflect and changeset, each with its reason in the run's todo list.

Open work:

- Regenerate `packages/platejs/turbo.json` and the manifest's line 3921 with the work that changed them. owner: the session that staged them. stop: its next `pnpm generate`. Tracked here and in the hand-back.
- `docs/plans/2026-10-12-editor-public-naming-review.md` line 196 and `docs/plans/topics/editor-public-naming.md` line 158 still say `@platejs/test` keeps a copy of the key. Decision row 62 of that plan's log records the deviation this run removes. owner: that plan's lead. stop: its next fold. Tracked here and in the hand-back.
- The three DOM resolution message prefixes are still copied in `packages/test/src/playwright/runtime-errors.ts`. plitejs builds them inline and exports no shared constant. owner: the naming plan's lead. stop: a decision to export them from `plitejs/testing`. Tracked here and in the hand-back.
