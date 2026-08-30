# Editor Test Harvest: ProseMirror

status: done
score: 0.97
license_mode: permissive
license_evidence: `../prosemirror/LICENSE`
output_mode: durable
versioned_copy_policy: normal
source_meta_commit: `c7f2f1d7bde70728dfedaa68ca8f5fc3dffa17cc`
source_cursor: `sha256:8a8158142c4d7f27635ad76eb698113183f6da1a9b453e81f2d275b8a5a86c84`
target: `../prosemirror` plus its 19 declared package repositories
mode: full, report-only

## Verdict

This is a complete initial harvest of the package graph declared by
`../prosemirror/bin/pm.js:9-13`, not the old six-module subset. It maps all 47
test/support files and all 1,369 named `describe`/`it`/`test` rows at one exact
20-repository cursor.

The strongest portable material is:

1. ordered content matching, filling, and structural replacement;
2. schema-owned mark-conflict laws;
3. change mapping, history, and collaboration pressure;
4. composition, native DOM change, selection geometry, clipboard, and mapped
   view-store browser behavior;
5. command, list, Markdown, search, and review-feature behavior routed to the
   correct Plite or Plate owner.

Do not copy ProseMirror's class model, numeric positions, string grammar, mark
objects, step registry, plugin bags, or imperative view API. The architecture
audit owns those decisions. This report owns portable behavior proof only.

## Cursor And Rerun

The source is a module set, so one repository HEAD is insufficient. The cursor
is the SHA-256 of the sorted newline-delimited `<module> <full-commit>` rows,
including `meta`, with one trailing newline. Every full commit, branch,
upstream, remote, clean bit, and license is recorded in
[`prosemirror-provenance.md`](../../plans/artifacts/multi-editor-full-architecture-audit/prosemirror-provenance.md).

The previous report claimed 32 files and 848 names. It had never inventoried
the full declared graph, so incremental sync was illegal. This run fell back to
a full harvest and newly accounted for 15 test files from keymap, commands,
gapcursor, schema-list, Markdown, test-builder, changeset, and search. Removed
files: 0. The new cursor may advance only while the generated inventory,
test-name index, and this report validate together.

## Inventory

| Metric                            | Count |
| --------------------------------- | ----: |
| Source test/support files         |    47 |
| Named `describe`/`it`/`test` rows | 1,369 |
| Classified files                  |    47 |
| Unresolved or uncertain files     |     0 |
| Portable                          |    21 |
| Portable-mixed                    |    21 |
| Harness/support                   |     5 |
| Behavior rows                     |    23 |

Every file row, commit, line count, category, behavior mapping, and reason is in
[`inventory.md`](inventory.md). Every extracted test name has a source line in
[`test-index.md`](test-index.md).

## License Gate

| Field                 | Value                                                                                                           |
| --------------------- | --------------------------------------------------------------------------------------------------------------- |
| License mode          | `permissive`                                                                                                    |
| Evidence              | Meta and all 19 package repositories declare MIT; exact evidence is linked from the provenance artifact.        |
| Output directory      | `docs/editor-test-harvester/prosemirror/`                                                                       |
| Output mode           | `durable`                                                                                                       |
| Versioned copy policy | `normal`, while still translating behavior into local APIs and fixtures rather than transplanting source bodies |

## Reproducible Commands

Run from `/Users/zbeyens/git/plate-2`:

```bash
node docs/plans/artifacts/multi-editor-full-architecture-audit/prosemirror-build-inventory.mjs

node -e "
const manifest = require('./docs/plans/artifacts/multi-editor-full-architecture-audit/prosemirror-source-manifest.json');
if (manifest.moduleSetCursor !== 'sha256:8a8158142c4d7f27635ad76eb698113183f6da1a9b453e81f2d275b8a5a86c84') process.exit(1);
if (manifest.totals.testFiles !== 47) process.exit(1);
if (manifest.totals.testNames !== 1369) process.exit(1);
if (manifest.totals.unexplainedFiles !== 0) process.exit(1);
"

rg -n "composition|beforeinput|MutationObserver|selection|clipboard" \
  packages/plite-react packages/plite-dom packages/test apps/plite/tests

rg -n "schema|slice|DocumentChange|anchor|history|collab|command" \
  packages/plite/test packages/plite-history/test packages/yjs/test

rg -n "list|markdown|search|diff|suggestion" \
  packages/platejs/src/features/list packages/platejs/src/markdown \
  packages/platejs/src/diff packages/platejs/src/features/suggestion \
  apps/plite/tests
```

The generator uses `git ls-files` for every declared module and a TypeScript AST
walk for declarations and string-literal test names. It fails on an unmapped
source/test file or on inventory-count drift.

## Confidence Score

| Dimension                             | Score | Evidence                                                                                                                                    | Cap hit |
| ------------------------------------- | ----: | ------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| Inventory completeness                |  1.00 | Exact 20-repository cursor; 47 found = 47 classified; every file linked; 0 unresolved.                                                      | none    |
| Behavior extraction depth             |  0.97 | All 42 portable or portable-mixed files have line-indexed test-name extraction; 23 behavior families cover every row.                       | none    |
| Skip precision and negative controls  |  0.98 | Five harness rows remain indexed; vendored Mocha assets and non-test package support have exact exclusion reasons.                          | none    |
| Plite/Plate coverage mapping accuracy |  0.95 | Every behavior row names current checkout owners, target tests, proof kind, and focused command; product policy stays in Plate.             | none    |
| Actionability                         |  0.95 | Every create/refactor/defer row has a target owner and proof command; architecture-dependent rows route to the audit before implementation. | none    |
| Provenance and reproducibility        |  1.00 | Full module commits, composite cursor, generator, inventory, line index, license, and clean-state evidence are durable.                     | none    |

Weighted score: 0.97. Every dimension exceeds 0.85 and the completion threshold
of 0.92 passes.

## Pass-State Ledger

| Pass                   | Status   | Evidence added                                                         | Report delta                                                                            | Open issues                                                       | Next owner                                |
| ---------------------- | -------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------- |
| Intake and license     | complete | MIT evidence across meta and all declared modules.                     | Durable permissive output retained.                                                     | none                                                              | none                                      |
| Boundary and cursor    | complete | Meta plus 19 package repositories; exact commits and composite cursor. | Replaced the false single-repo boundary.                                                | Website remote unavailable, but it is not a runtime/test package. | architecture audit records evidence limit |
| Full inventory         | complete | 47 files, 1,369 names, 0 unresolved.                                   | Added 15 previously omitted files; removed 0.                                           | none                                                              | none                                      |
| Test-name extraction   | complete | AST index with source lines for every file.                            | Replaced 848-row partial index with 1,369 rows.                                         | none                                                              | none                                      |
| Classification         | complete | 21 portable, 21 portable-mixed, 5 harness.                             | Every file has one category and reason.                                                 | none                                                              | none                                      |
| Behavior extraction    | complete | PM-01 through PM-23.                                                   | Added keymap, command, gapcursor, list, Markdown, changeset, search, and fixture lanes. | none                                                              | none                                      |
| Local coverage mapping | complete | Current `packages/**` and `apps/plite/**` owners and commands.         | Removed stale sibling-checkout paths.                                                   | Architecture candidates require acceptance, not harvest work.     | audit / named plan owner                  |
| Action planning        | complete | Create/refactor/covered/defer and proof kind on every row.             | Planning-only; no tests changed.                                                        | none                                                              | user acceptance                           |
| Closure review         | complete | Counts, cursor, links, matrix, score, and pass ledger validated.       | Status advanced to `done`.                                                              | none                                                              | parent editor audit                       |

## Matrix

| ID    | ProseMirror test refs                                                                                                                                          | Portable invariant                                                                                                                                               | Proof kind                                               | Current owner and action                                                                                                                                                                                                                       | Focused verification                                                                                                                                                                                                                                    |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PM-01 | `model/test/test-content.ts`, `model/test/test-node.ts`, `model/test/test-replace.ts`, `transform/test/test-structure.ts`, `transform/test/test-trans.ts`      | Ordered child languages, fillers, wrappers, and structural edits must accept exactly legal sequences and reject impossible content without damage.               | generated model laws + package integration               | `packages/plite/test/schema-compiler-laws.test.ts`, `schema-laws.test.ts`, `slice-fit-laws.test.ts`; architecture gap PM-P1-1 must land through `best-api` → `plite-plan`, then Plate list/table fixtures.                                     | `bun test --preload ./config/plite-source-test-setup.ts packages/plite/test/schema-compiler-laws.test.ts packages/plite/test/slice-fit-laws.test.ts`                                                                                                    |
| PM-02 | `model/test/test-slice.ts`, `model/test/test-replace.ts`, `view/test/webtest-clipboard.ts`                                                                     | Open fragment edges retain enough context through copy, replace, split, join, and fitting.                                                                       | model laws + browser clipboard                           | Refactor existing `packages/plite/test/content-slice-laws.test.ts`, `slice-fit-contract.test.ts`, and `packages/plite-dom/test/clipboard-boundary.test.ts`; add only missing open-edge families.                                               | `bun test --preload ./config/plite-source-test-setup.ts packages/plite/test/content-slice-laws.test.ts packages/plite/test/slice-fit-contract.test.ts packages/plite-dom/test/clipboard-boundary.test.ts`                                               |
| PM-03 | `model/test/test-dom.ts`, `model/test/test-node.ts`                                                                                                            | DOM import/export preserves whitespace, nested formatting, namespaces, comments, context, and invalid-content recovery safely.                                   | package codec + real browser                             | Refactor `packages/plite-dom/test/dom-html.test.ts`, `host-codec.test.ts`, and `apps/plite/tests/plite-browser/donor/examples/paste-html.test.ts`; keep schema fitting in Plite and DOM policy in host/Plate codecs.                           | `bun test --preload ./config/plite-source-test-setup.ts packages/plite-dom/test/dom-html.test.ts packages/plite-dom/test/host-codec.test.ts && pnpm --filter plite test:plite-browser:chromium paste-html.test.ts`                                      |
| PM-04 | `model/test/test-mark.ts`, `transform/test/test-trans.ts`                                                                                                      | Text-property add/remove is idempotent; exclusive properties cannot coexist; incoming explicit writes and cursor marks behave deterministically.                 | schema/property laws + package integration               | Current coverage: `packages/plite/test/editor-methods-contract.ts`, `read-update-contract.ts`, `packages/basic-nodes/src/lib/BaseMarkPlugins.spec.ts`. Architecture gap PM-P1-2 routes through `best-api` → `plite-plan` → `plate-plan`.       | `bun test --preload ./config/plite-source-test-setup.ts packages/plite/test/editor-methods-contract.ts packages/plite/test/read-update-contract.ts && pnpm --filter @platejs/basic-nodes test -- BaseMarkPlugins.spec.ts`                               |
| PM-05 | `model/test/test-diff.ts`, `transform/test/test-mapping.ts`, `test-replace_step.ts`, `test-step.ts`, `test-trans.ts`                                           | Canonical changes map, compose, invert, replay, and classify touched ranges across structural edits.                                                             | generated algebra laws + stress                          | Refactor existing `packages/plite/test/document-change-laws.test.ts`, `document-change-structural-transform.test.ts`, `anchor-mapping-contract.ts`; add replace-around-equivalent wrap/unwrap rows only where absent.                          | `bun test --preload ./config/plite-source-test-setup.ts packages/plite/test/document-change-laws.test.ts packages/plite/test/document-change-structural-transform.test.ts packages/plite/test/anchor-mapping-contract.ts`                               |
| PM-06 | `model/test/test-resolve.ts`, `state/test/test-selection.ts`, `transform/test/test-mapping.ts`, `collab/test/test-rebase.ts`, `view/test/webtest-selection.ts` | Selections and anchors map predictably through insert, delete, split, merge, move, atom boundaries, and remote changes.                                          | model laws + React contract + browser                    | Strengthen `packages/plite/test/anchor-contract.ts`, `selection-protocol.test.ts`, `packages/plite-react/test/selection-controller-contract.test.ts`; browser-only geometry remains PM-13.                                                     | `bun test --preload ./config/plite-source-test-setup.ts packages/plite/test/anchor-contract.ts packages/plite/test/selection-protocol.test.ts && pnpm --filter @platejs/plite-react test:vitest -- selection-controller-contract.test.ts`               |
| PM-07 | `history/test/test-history.ts`, `transform/test/test-step.ts`                                                                                                  | Undo grouping, redo invalidation, mapped selections, remote changes, compression, and bounded branch growth remain correct.                                      | package laws + soak benchmark                            | Refactor `packages/plite-history/test/history-contract.ts`, `history-branch-contract.spec.ts`, and `history-soak-contract.slow.ts`; no PM step persistence.                                                                                    | `bun test --preload ./config/plite-source-test-setup.ts packages/plite-history/test/history-contract.ts packages/plite-history/test/history-branch-contract.spec.ts`                                                                                    |
| PM-08 | `collab/test/test-collab.ts`, `collab/test/test-rebase.ts`, `transform/test/test-replace_step.ts`                                                              | Delayed local edits, simultaneous typing, deletes, wrapping, properties, and undo converge across peers.                                                         | generated multi-peer model + Yjs browser                 | Refactor `packages/plite/test/collab-history-runtime-contract.ts`, `collab-canonical-reconcile-contract.ts`, `packages/yjs/test/remote-import-contract.slow.ts`, and `apps/plite/**/yjs-collaboration.test.ts`; retain Yjs, not PM central OT. | `bun test --preload ./config/plite-source-test-setup.ts packages/plite/test/collab-history-runtime-contract.ts packages/plite/test/collab-canonical-reconcile-contract.ts && pnpm --filter plite test:plite-browser:chromium yjs-collaboration.test.ts` |
| PM-09 | `view/test/webtest-domchange.ts`                                                                                                                               | Ambiguous native insert/delete/backspace/enter mutations are interpreted once and routed to model input or bounded repair.                                       | React contract + browser stress                          | Refactor `packages/plite-react/test/model-input-strategy-contract.test.ts`, `mutation-command-dispatch-contract.test.ts`, and `apps/plite/**/dom-coverage-boundaries.test.ts`; scheduler owns timing.                                          | `pnpm --filter @platejs/plite-react test:vitest -- model-input-strategy-contract.test.ts mutation-command-dispatch-contract.test.ts && pnpm --filter plite test:plite-browser:chromium dom-coverage-boundaries.test.ts`                                 |
| PM-10 | `view/test/webtest-composition.ts`, `webtest-domchange.ts`                                                                                                     | Composition survives empty blocks, existing text, marks, decorations, rapid follow-up input, Android newline, overlap cancellation, and cross-block replacement. | React state-machine contract + Chromium/Firefox/WebKit   | Refactor `packages/plite-react/test/composition-state-contract.test.ts`, `runtime-repair-engine-contract.test.tsx`, and `apps/plite/**/richtext.test.ts`; add missing scenarios without synthetic-IME overclaiming.                            | `pnpm --filter @platejs/plite-react test:vitest -- composition-state-contract.test.ts runtime-repair-engine-contract.test.tsx && pnpm --filter plite test:plite-browser:project firefox richtext.test.ts`                                               |
| PM-11 | `view/test/webtest-clipboard.ts`, `model/test/test-dom.ts`                                                                                                     | Clipboard HTML/text carries slice context, wrappers, attrs, comments, custom serializers, and safe fallbacks.                                                    | package round trip + browser paste/copy                  | Refactor `packages/plite-dom/test/clipboard-boundary.test.ts`, `packages/plite/test/clipboard-contract.ts`, and `apps/plite/**/paste-html.test.ts`; codec-specific structural repair is a deletion candidate.                                  | `bun test --preload ./config/plite-source-test-setup.ts packages/plite-dom/test/clipboard-boundary.test.ts packages/plite/test/clipboard-contract.ts && pnpm --filter plite test:plite-browser:chromium paste-html.test.ts`                             |
| PM-12 | `view/test/webtest-decoration.ts`, `webtest-draw-decoration.ts`, `webtest-draw.ts`, `webtest-markview.ts`, `webtest-nodeview.ts`                               | Mapped decorations/widgets/projections preserve order and locality through structural edits and clean up lifecycle resources.                                    | React contracts + render benchmark                       | Refactor `packages/plite-react/test/mapped-view-store.test.ts`, `projection-stress-contract.test.ts`, `widget-layer-contract.test.tsx`. PM NodeView/MarkView authoring remains Plate-owned; raw Plite keeps structural stores.                 | `pnpm --filter @platejs/plite-react test:vitest -- mapped-view-store.test.ts projection-stress-contract.test.ts widget-layer-contract.test.tsx`                                                                                                         |
| PM-13 | `model/test/test-resolve.ts`, `view/test/webtest-selection.ts`, `webtest-endOfTextblock.ts`, `webtest-view.ts`                                                 | DOM selection import/export, coordinates, wrapped lines, bidi/RTL, block edges, widgets, and atoms need real-browser proof.                                      | browser only                                             | Refactor `packages/test/test/browser/selection.browser.test.ts`, `apps/plite/**/navigation-bidi.test.ts`, and `visual-native-selection-smoke.test.ts`; package/jsdom rows cannot close geometry.                                            | `pnpm --filter plite test:plite-browser:chromium navigation-bidi.test.ts visual-native-selection-smoke.test.ts`                                                                                                                                         |
| PM-14 | `state/test/test-state.ts`, `view/test/webtest-view.ts`, `webtest-draw.ts`, `webtest-markview.ts`, `webtest-nodeview.ts`                                       | Extension state, providers, rendered views, teardown, filtering, and follow-up work need deterministic lifecycle and failure isolation.                          | Plite configuration/React contracts + Plate plugin tests | Keep Plite owners `packages/plite/test/extension-configuration.test.ts` and `packages/plite-react/test/view-source-fault-boundary.test.ts`; PM plugin/prop bags are rejected, product plugin lifecycle is Plate-owned.                         | `bun test --preload ./config/plite-source-test-setup.ts packages/plite/test/extension-configuration.test.ts && pnpm --filter @platejs/plite-react test:vitest -- view-source-fault-boundary.test.ts`                                                    |
| PM-15 | `transform/test/trans.ts`, `state/test/state.ts`, `view/test/view.ts`, `markdown/test/build.ts`, `test-builder/test/test-marks.ts`                             | Harness helpers improve fixture ergonomics but do not define product behavior.                                                                                   | harness                                                  | Keep indexed as negative controls. Reuse only fixture ideas in local test support; no runtime work.                                                                                                                                            | `node docs/plans/artifacts/multi-editor-full-architecture-audit/prosemirror-build-inventory.mjs`                                                                                                                                                        |
| PM-16 | `keymap/test/test-keymap.ts`                                                                                                                                   | Key aliases, modifiers, platform normalization, and first-handler semantics must be deterministic.                                                               | package unit + browser keyboard                          | Refactor `packages/plite-dom/test/hotkeys.test.ts`, `hotkeys-no-navigator.test.ts`, and typed command dispatch tests. Do not adopt raw key strings as command identity.                                                                        | `bun test --preload ./config/plite-source-test-setup.ts packages/plite-dom/test/hotkeys.test.ts packages/plite-dom/test/hotkeys-no-navigator.test.ts packages/plite/test/command-spec.test.ts`                                                          |
| PM-17 | `commands/test/test-commands.ts`                                                                                                                               | Delete/join/split/lift/select/mark/block commands respect atoms, isolating boundaries, bidi edges, schema legality, and applicability.                           | command model matrix + selected browser rows             | Refactor `packages/plite/test/delete-contract.ts`, `transforms-contract.ts`, `editor-methods-contract.ts`, and `command-spec.test.ts`; Plate list/table policy remains package-owned.                                                          | `bun test --preload ./config/plite-source-test-setup.ts packages/plite/test/delete-contract.ts packages/plite/test/transforms-contract.ts packages/plite/test/command-spec.test.ts`                                                                     |
| PM-18 | `gapcursor/test/test-gapcursor.ts`                                                                                                                             | A structural cursor is valid only at schema-selectable block gaps and maps through changes without entering forbidden content.                                   | React selection contract + browser navigation            | Map to Plite's extensible/keyboard-selectable selection owners: `packages/plite-react/test/keyboard-selectable-selection.test.tsx` and `apps/plite/**/richtext.test.ts`; reject PM subclass/plugin shape.                                      | `pnpm --filter @platejs/plite-react test:vitest -- keyboard-selectable-selection.test.tsx && pnpm --filter plite test:plite-browser:chromium richtext.test.ts`                                                                                          |
| PM-19 | `schema-list/test/test-commands.ts`                                                                                                                            | Wrap, split, lift, sink, join, and selection behavior remain correct across nested lists and task/list variants.                                                 | Plate package matrix + browser                           | Refactor `packages/platejs/src/features/list/lib/BaseListPlugin.spec.tsx` and `apps/plite/**/check-lists.test.ts`; ordered grammar substrate comes from PM-P1-1.                                                                         | `pnpm --filter platejs test:partition:standard-list && pnpm --filter plite test:plite-browser:chromium check-lists.test.ts`                                                                                                                           |
| PM-20 | `markdown/test/test-custom-parser.ts`, `test-parse.ts`                                                                                                         | Markdown parse/serialize preserves escaping, marks, blocks, lists, custom bindings, and round trips through fitted schema content.                               | Plate package + browser preview/shortcuts                | Refactor `packages/markdown/src/lib/defaultRules.spec.ts`, `serializer/serializeMd.spec.ts`, and `apps/plite/**/markdown-preview.test.ts`; codecs remain host/Plate-owned.                                                                     | `pnpm --filter @platejs/markdown test -- defaultRules.spec.ts serializeMd.spec.ts && pnpm --filter plite test:plite-browser:chromium markdown-preview.test.ts`                                                                                          |
| PM-21 | `changeset/test/test-changed-range.ts`, `test-changes.ts`, `test-diff.ts`, `test-merge.ts`, `test-simplify.ts`                                                 | Human-facing review spans map, merge, bound diff work, and simplify to readable boundaries without becoming transaction truth.                                   | Plate package laws + benchmark                           | Evidence-backed defer until a track-changes consumer needs it. Likely owners: `packages/diff/**` and `packages/suggestion/**`, lowering from `DocumentChange`; no second Plite change model.                                                   | `pnpm --filter @platejs/diff test && pnpm --filter @platejs/suggestion test`                                                                                                                                                                            |
| PM-22 | `search/test/test-query.ts`, `test-search.ts`                                                                                                                  | Search/replace supports string/regex/case/whole-word/groups, maps ranges through edits, and updates highlights incrementally.                                    | Plate/product tests + browser                            | Plate-owned. Refactor `apps/plite/tests/plite-browser/donor/examples/search-highlighting.test.ts` and future search package tests only when the product API is accepted; Plite supplies anchors and mapped decorations.                        | `pnpm --filter plite test:plite-browser:chromium search-highlighting.test.ts`                                                                                                                                                                           |
| PM-23 | `test-builder/test/test-marks.ts`                                                                                                                              | Test fixtures should express document shape, marks, and named selection points compactly without mutating runtime nodes.                                         | test support/type tests                                  | Defer a new DSL until repeated local fixture pain justifies it. Keep current JSX/support owners; never ship test tags in document JSON.                                                                                                        | `bun test --preload ./config/plite-source-test-setup.ts packages/plite/test/schema-laws.test.ts packages/plite/test/selection-protocol.test.ts`                                                                                                         |

## Skips And Negative Controls

- Five harness files remain in the inventory with exact reasons; they create no
  product work.
- Meta `demo/test/mocha.css` and `demo/test/mocha.js` are vendored Mocha assets,
  not editor tests.
- Packages with no tracked test/support files are still covered by the
  architecture source manifest; absence of tests is not a phantom inventory
  row.
- ProseMirror string content expressions, numeric coordinates, Step JSON,
  PluginView, NodeView, MarkView, command dispatch, and central OT are not test
  API targets. Only portable behavior is retained.
- No browser, composition, geometry, clipboard, or mobile claim is closed by a
  synthetic package test alone.

## Next Slice

No implementation starts in this planning-only audit.

1. Route PM-P1-1 ordered content patterns through `best-api`, then
   `plite-plan`, then `plate-plan`.
2. Route PM-P1-2 schema-owned exclusive text properties through the same owner
   chain.
3. After acceptance, execute PM-01 and PM-04 proof alongside those architecture
   changes.
4. Independently queue PM-10, PM-09, PM-08, PM-12, and PM-13 as the highest
   browser/runtime proof packets.
5. Keep PM-21, PM-22, and PM-23 deferred until their named Plate/product
   consumer exists.

## Full Inventory Appendix

The complete appendix is [`inventory.md`](inventory.md). The complete
line-indexed test-name corpus is [`test-index.md`](test-index.md). Omitting
either file invalidates this report and prevents the test-harvest cursor from
advancing.
