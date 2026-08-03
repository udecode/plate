# Hard cut table cell header plugin

Objective:
Hard-cut the table-cell header plugin into one typed tableCell model; done when stale symbols are zero and package, generated-contract, browser, and review gates pass; plan docs/plans/2026-08-03-hard-cut-table-cell-header-plugin.md.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-03-hard-cut-table-cell-header-plugin.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- docs
- browser
- package-api

Mode:
- accepted-plan execution: the user accepted the `best-api` verdict and explicitly said `go hard cut`.

Completion threshold:
- `BaseTableCellHeaderPlugin`, `TableCellHeaderPlugin`, `PLUGINS.tableCellHeader`, persisted `type: 'tableCellHeader'`, `SchemaElementShapeOf`, and `SchemaElementOf` have zero surviving source/docs/export/authoritative-generated matches except explicit migration input fixtures where required. CI-owned registry build output is regenerated from current source and is never edited locally.
- One `tableCell` schema owns optional canonical `header`; HTML preserves `<th>`/`<td>`, Markdown preserves GFM first-row headers, and table mutation/paste/selection behavior passes focused proof.
- A current persisted-value migration rewrites `{ type: 'tableCellHeader' }` to `{ type: 'tableCell', header: true }` with replay/idempotence proof.
- Owning package typechecks/tests, generated editor checks, relevant www typecheck, browser table-demo proof, lint, barrel generation when required, autoreview, and `check-complete` pass.

Verification surface:
- Focused tests for `@platejs/table`, Markdown table codecs, migration contracts, AI/selection consumers, and generated editor contracts.
- Source-first typechecks for modified packages plus `apps/www`.
- `pnpm --filter www editor:generate` followed by `editor:check`.
- Browser proof on `/blocks/table-demo`: render header cells, edit a header cell, insert a row/column, and inspect console/network state.
- Bounded `rg` audit excluding generated schema JSON until the final generated-artifact sweep.

Constraints:
- No public compatibility aliases or runtime shims.
- Preserve arbitrary HTML `<th>` cells instead of reducing Plate to Markdown's position-only model.
- Preserve table grid, spans, clipboard, drag/drop, selection, static/RSC rendering, and generated editor inference.
- Do not manually edit `templates/**`.
- Keep one plan as the execution ledger; do not add a second decision artifact.

Boundaries:
- In scope: Table Base/React descriptors, table model/codec/mutation/paste/selection/tests, Markdown/AI/selection/test-utils consumers, registry table UI/kits/examples, docs, migrations, public exports, generated editor artifacts, release notes, and the two unused Plite schema extractors.
- Source owners: `packages/table`, `packages/utils` capability names, `packages/plite` public schema types, direct consumer packages, `apps/www`, and generated editor contracts.
- Non-goals: redesign headings/lists, add header scopes or new table commands, adopt mdast as Plate's document model, or preserve the removed plugin through aliases.
- Direct Plite boundary owners: `packages/plite/src/interfaces/element.ts` and its barrels/type tests only; no runtime schema redesign.

Output budget strategy:
- Read named owners first. Exclude `*.generated.ts`, `*.schema.json`, `node_modules`, templates, and migration history from broad searches; count/file-list first, inspect bounded slices, then include generated artifacts only during regeneration and final zero-match proof.

Blocked condition:
- Block only if the owning package/runtime contract cannot preserve HTML header semantics or generated schema correctness after three distinct repairs, or required browser/tooling remains unavailable after the repo's one allowed reinstall recovery.

Plate Plan state:
- status: complete
- phase: complete
- next: none
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | This plan records the one-cell hard cut, migration, no aliases, helper deletion, generated adoption, and proof. |
| Active goal and plan verified | yes | Goal tool created the matching active goal for this exact plan. |
| Current owners read | yes | `BaseTablePlugin.ts`, `TablePlugin.tsx`, registry table components/kits, Markdown table mapping, Plite element extractors, and external narrow precedents were read before target acceptance. |
| Best API target resolved | yes | `best-api review`: one `tableCell` with optional `header`; delete the separate header capability and unused extractor alternatives. |
| Mode and execution boundary resolved | yes | One-shot accepted-plan execution authorized by `go hard cut`. |
| Docs pack selected | yes | Docs adoption is required for removed public descriptors and persisted migration. |
| `docs-creator` loaded | yes | Read completely before docs edits. |
| Docs lane selected | yes | Plugin manual/API and serialization references. |
| Target docs and nearest sibling docs read | yes | Read the EN/CN Table pages plus HTML, CSV, and package release owners that named the split model. |
| Docs style doctrine read | yes | Current docs describe only the canonical one-cell model; migration prose is confined to changesets. |
| Documented source owner identified | yes | `packages/table/src/lib/BaseTablePlugin.ts` and its exported React adapter are the public truth. |
| Browser pack selected | yes | Registry table rendering and interactions change. |
| Browser route / app surface identified | yes | `/blocks/table-demo`. |
| Browser tool decision recorded | yes | Use bundled Browser; no native Chrome-only behavior is in scope. |
| Console/network caveat policy recorded | yes | Record table-demo console/network state; separate unrelated framework warnings explicitly. |
| Package/API pack selected | yes | Public descriptors, schema, persisted values, exports, and generated contracts change. |
| Public surface or package boundary identified | yes | `@platejs/table`, `@platejs/plite`, `@platejs/utils`, direct consumer packages, and copied registry source. |
| Release artifact path selected | yes | Per-package changesets relative to `main`; registry changelog if the copied `table-node` public surface changes. |
| `changeset` skill loaded when `.changeset` is required | yes | Loaded before implementation; one package per file and no forbidden Core minor. |
| Barrel/export impact decision recorded | yes | Exported descriptors/types are removed; run `pnpm brl`. |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports claims cite live source.
- [x] Reusable public call shape has one `best-api` verdict before target lock.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks and any private bridge have complete adoption/deletion answers: hard cut, no bridge.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: no new links, anchors, or previews were added; existing page structure remains valid.
- [x] Browser pack: `/blocks/table-demo`, header edit, row insert, and column insert were recorded before proof.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: table-demo SSR remains blocked by the unrelated existing `aiChatPlugin` initialization cycle; `/dev/table-perf` had no console or network failures.
- [x] Browser pack: DOM and network proof covered the state; no screenshot was needed.
      applicable Browser->Chrome->Computer path cannot inspect the state.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: existing package changesets were updated and copied registry changes have a registry changelog entry.
- [x] Package/API pack: `changeset` was loaded; affected existing major changesets retain one package per file and no forbidden Core minor was added.
- [x] Package/API pack: registry UI adoption has a generated registry changelog event; package changes remain represented by package changesets.
- [x] Package/API pack: no no-artifact claim is used; all published deltas have release artifacts.
- [x] Package/API pack: the public shape is an explicit hard cut with one temporary persisted-value migration, no aliases.
- [x] Package/API pack: Table, all downstream packages, and www passed source-first typechecks; Table and focused consumer tests passed.
- [x] Package/API pack: `pnpm brl` and all generated editor contract checks passed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every readiness condition | Source, tests, docs, generated contracts, release artifacts, and browser interaction are complete. |
| Fresh source evidence | yes | Recheck decision-changing current claims | Final `rg` confirms no stale live symbols; generated cell types contain only `tableCell` with optional `header`. |
| Best API review | yes | Resolve/reject every P0/P1 call-shape finding, or record no public shape change | Accepted one descriptor plus semantic property; rejected helper alias and second plugin. |
| Conditional risk and adoption | yes | Complete triggered risk/docs/browser/provenance work or give one scoped N/A reason | Migration, docs, registry, codecs, generated types, and browser interaction are covered. |
| Verification recorded | yes | Record fresh planning proof and exact execution gates | Exact commands and results are recorded below. |
| Handoff prepared | yes | Prepare concise ownership, breaks, proof, risks, and execution order | Public break, migration, proof, and unrelated SSR caveat are ready. |
| Autoreview | yes | Run for implementation changes or record planning-only N/A | Bounded local snapshot exited 0 with no accepted/actionable findings. One `apps/www/public/r` finding was rejected because repo law makes it CI-generated output; authoritative registry source is current. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-03-hard-cut-table-cell-header-plugin.md` | Checker passed after every gate and phase was closed. |
| Docs source-backed claim audit | yes | Verify docs claims against current source or record N/A | EN/CN Table, HTML, and CSV claims match `BaseTablePlugin` and registry kits. |
| Docs links / routes / previews | yes | Verify leaf links, routes, anchors, and preview names or record N/A | No new links/routes/previews; deleted API anchor no longer exists. |
| Docs MDX/content parser | yes | Run `pnpm --filter www build:source` for MDX/content changes, or record N/A | Passed. |
| Plugin page specifics | yes | For plugin pages, apply `docs-creator` kit/manual/API rules; otherwise N/A | Manual kit and API sections expose one cell plugin/component and no deleted helper. |
| Browser interaction proof | yes | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | `/blocks/table-demo`: four `<th>`, header edit, row insertion, and column insertion succeeded. |
| Browser console/network check | yes | Record console/network state or why it is not applicable | Table demo SSR exposes unrelated AI cycle; `/dev/table-perf` reload had zero failed/bad responses and zero console logs. |
| Browser final proof artifact | yes | Record screenshot/trace/route/native proof or exact caveat | Browser DOM counts and CDP network receipt recorded below. |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | Deleted second descriptors/extractors/helper; added `@platejs/table/migrations`; barrel generation passed. |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Published Table/Plite/consumer changes plus copied registry adoption. |
| Published package changeset | yes | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | Existing affected changesets updated; Table and Plite are major. |
| Registry changelog | yes | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | `2026-08-03-unify-table-cells` generated and 43/43 events check passed. |
| No release artifact | yes | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | N/A because every user-visible owner has a package changeset or registry changelog. |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | Table 235/235; focused consumers 27/27; source-first package graph and www typechecks passed. |
| Barrel/export generation | yes | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | 56/56 barrel tasks passed; migrations barrel/export exists. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | completed | Live owner reads and accepted `best-api` verdict | Execute |
| Decide | completed | User accepted one cell identity with explicit `header` and no extractor alternative | Execute |
| Execute | completed | All four slices landed in the shared checkout | Prove and hand off |
| Prove and hand off | completed | Structured review and goal checker are clean | Handoff |

Decision brief:
- outcome: one table cell capability and persisted element identity across Base, React, registry, codecs, generated values, and consumers.
- chosen shape: `{ type: 'tableCell', header?: boolean }`, with omitted `false`, one renderer branching to `<th>`/`<td>`, and Markdown treating row zero as GFM's header row.
- strongest rejected alternative: keep `tableCellHeader` as a node/plugin because ProseMirror does; rejected because Plate's grammar/properties/operations are identical and the split duplicates every owner.
- consequence: breaking persisted-value migration and public descriptor removal, offset by a smaller exact generated schema and simpler package/registry APIs.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Header identity | Separate `tableCellHeader` element and plugin duplicates `tableCell` | One `tableCell` with optional `header` | `@platejs/table` | Header is a cell semantic variant, not distinct grammar or capability | Rewrite source, callers, tests, docs, generated contracts; migrate persisted values | HTML/Markdown/package/browser proof | Missing a type check could silently emit `<td>` | rearchitect |
| Header rendering | Separate Base/React/static/live component registrations | One cell component reads `element.header` | Table package + copied registry UI | Existing header component is only a wrapper | Delete header components and kit entries | static/live rendering tests + Browser | Header styling regression | cut |
| Persisted data | `tableCellHeader` discriminator | `tableCell` plus `header: true` | Table migration owner | Preserve semantic data through a deterministic hard migration | Add current migration and adoption docs | idempotence/replay tests | Existing documents fail schema without migration | rearchitect |
| Schema extractors | Two-argument `SchemaElementShapeOf` and unused `SchemaElementOf` | `ElementOf<Plugin>` only | Plite public types | One-argument shape helper would duplicate `ElementOf`; no current consumers remain | Replace Table aliases, delete exports and references | zero-match + Plite/Core typechecks | External breaking type import | cut |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Model and migration | Table + Plite | Merge cell schemas/types/codecs, add migration, delete extractors | Accepted target and plan active | One canonical cell shape compiles and focused model/migration tests pass | Table/Plite focused type/tests |
| 2. Package consumers | Markdown, AI, selection, test-utils, React | Remove header type/plugin assumptions and preserve semantics | Slice 1 green | Direct packages compile and focused tests pass | source-first typechecks + focused tests |
| 3. Registry/docs/release | www/content/changesets/changelog | Adopt one component/plugin, update values/docs, regenerate contracts | Slices 1-2 green | Current docs and generated artifacts contain no stale API/model | editor generate/check + docs checks |
| 4. Closure | Repo-wide affected owners | barrels, lint, browser, autoreview, zero-match audit | Slices 1-3 green | All named gates pass with no accepted findings | Browser + checks + checker |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Header cells round-trip through HTML | Existing codec split is identical except tag | Table HTML codec tests plus Browser `<th>` rendering | passed |
| GFM first row remains a header | mdast owns one cell type and current decoder branches on row zero | Markdown table import/export focused tests | passed |
| Row/column/paste mutations preserve header state | Mutation code propagates the explicit property | Full Table 235/235 plus Browser row/column insertion | passed |
| Persisted values migrate once | Accepted mapping is deterministic | Three migration contracts cover initial, deferred/named roots, and canonical idempotence | passed |
| Generated consumer types contain one cell variant | Generator reads closed schema | Three generated surfaces check clean with `header?: boolean` | passed |
| Removed APIs are gone | Bounded source audit found direct owners | Final live-source/docs/generated zero-match audit; only migration/release prose remains | passed |

Conditional evidence:
- High-risk scenarios: `<th>` becomes `<td>`; inserted/pasted cells lose header state; generated schema or migration rejects existing documents.
- External research: completed narrow source comparison before acceptance: mdast uses one positional cell, Lexical uses one cell plus header state, ProseMirror duplicates node types.
- Issue/PR provenance: N/A: user-directed internal breaking migration, not issue-backed.
- Docs/registry/browser/release/behavior-law owners: all apply and are represented in gates/slices.

Findings:
- `tableCell` and `tableCellHeader` schemas duplicate grammar, properties, codecs, render props, and merge rules; only HTML tag and persisted discriminator differ.
- Markdown already maps both Plate types to one mdast `tableCell`; its decoder makes row zero the header.
- Registry live/static header components are wrappers over the ordinary cell component.
- `SchemaElementShapeOf` is used only by Table; `SchemaElementOf` has no production call sites.

Decisions and tradeoffs:
- Store `header?: boolean` rather than derive it permanently from position, because Plate imports arbitrary HTML `<th>` cells while GFM is position-only.
- Do not add `scope` or row/column header commands in this cut; current behavior only needs the binary semantic distinction.
- Delete public alternatives instead of aliases; migration owns old persisted data, not runtime compatibility.

Review fixes:
- Final stale scan found and removed the EN/CN `editor.api.table.getCellTypes` docs sections; the Table changeset now gives the descriptor-owned replacement.
- Autoreview reported stale `apps/www/public/r/table-*.json`; rejected as CI-generated registry output that local agents must neither edit nor rebuild. The owning registry source, generated changelog event, and source checks are current.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Migration named-root test initially used an undeclared root | 1 | Install a narrow root owner in the contract | Added `TestRootPlugin`; named-root migration passes. |
| Canonical migration test initially used a schema-invalid foreign element | 1 | Test idempotence with a canonical Table document | Canonical document is preserved exactly. |
| Lint found an unused Table React callback capability | 1 | Remove the unused binding | `pnpm lint:fix` passes with only 15 unrelated oversized-artifact warnings. |
| Table demo initially loaded stale CI-generated registry output | 1 | Temporarily remove only the stale generated item for runtime proof, then restore byte-for-byte | Source registry contract is current; generated output diff is empty after restoration. |
| Full shared-checkout autoreview bundle exceeded the engine's 1,048,576-character cap | 1 | Build a read-only bounded clone from HEAD plus only accepted hard-cut owners | Final 967,122-character snapshot review exited clean. |
| First bounded review shell used unquoted parenthesized paths | 1 | Quote every scope path | Retry advanced to copy. |
| Second bounded review shell used zsh's reserved `path` variable | 1 | Rename the loop variable to `rel` | Final bounded review ran successfully. |

Verification evidence:
- `pnpm --filter @platejs/table typecheck`: passed.
- `pnpm --filter @platejs/table test`: 235/235 across 24 files.
- Focused CSV, Markdown, AI, Core, and Utils suites: 27/27.
- Source-first modified-package graph: 17/17 primary tasks and 64/64 downstream/www tasks.
- `pnpm --filter www build:source`, `editor:generate`, `editor:check`, api-reference checks, and www typecheck: passed.
- `pnpm brl`: 56/56; `pnpm lint:fix`: passed with 15 unrelated size warnings.
- Registry changelog generator: 43/43 events.
- Browser: table-demo rendered four headers, retained an edited header, and propagated headers through row/column insertion; clean `/dev/table-perf` control had zero console logs, failed requests, or bad responses.
- Final `rg`: zero removed live symbols across packages, registry source, generated editor contracts, docs, and tooling; intentional matches remain only in migration/release prose and historical migration material.
- `.agents/skills/autoreview/scripts/autoreview --mode local` on the bounded Table hard-cut snapshot: clean, no accepted/actionable findings. Rejected only stale CI-owned `apps/www/public/r` output.

Final handoff prepared:
- Ownership and target API: Table owns `{ type: 'tableCell', header?: boolean }`; `ElementOf<typeof BaseTableCellPlugin>` is the sole element inference path.
- Public breaks and adoption: header descriptors/components, `PLUGINS.tableCellHeader`, `getCellTypes`, `SchemaElementShapeOf`, and `SchemaElementOf` are deleted; `TableV54MigrationPlugin` owns persisted adoption.
- Runtime/package/docs/browser decisions: one codec/renderer/schema branches on `header`; current docs and copied registry expose only that shape.
- Proof and execution risks: all in-scope gates pass; table-demo SSR still has an unrelated pre-existing `aiChatPlugin` initialization cycle.
- Execution order and user attention: save migrated documents before uninstalling the migration plugin; no compatibility layer exists.

Timeline:
- 2026-08-03T16:05:18.030Z Plate Plan created.
- 2026-08-03: One-cell model, migration, direct consumers, registry, docs, release artifacts, and generated contracts completed.
- 2026-08-03: Package, consumer, generation, formatting, barrel, and Browser proof completed; final autoreview remains.
- 2026-08-03: Bounded structured autoreview exited clean; rejected only CI-owned registry build output.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Final goal checker |
| Where am I going? | Checker and handoff |
| What is the goal? | One canonical typed table cell with no header plugin/helper alternatives |
| What have I learned? | Explicit `header` preserves arbitrary HTML semantics without duplicating the entire plugin/schema surface |
| What have I done? | Implemented and proved the hard cut across runtime, types, migration, consumers, docs, registry, and generated contracts |

Open risks:
- `/blocks/table-demo` server rendering still hits the unrelated existing `aiChatPlugin` initialization cycle; client-side Table interaction and the clean table performance route prove this cut independently.
- `apps/www/public/r/table-*.json` remains stale by design in the local checkout; it is CI-generated output, and repo law forbids local edits or `build:registry` runs. Current registry source is the generation owner.
- Historical changelog/migration prose intentionally retains the removed names and persisted discriminator.
