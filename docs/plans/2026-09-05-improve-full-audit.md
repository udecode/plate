# Full Plate/Plite improvement audit

Status: audit complete; local proof reconciled on 2026-09-06. Of 54 findings, 52 are resolved locally, API-01 is partly repaired, and RUNTIME-03 remains open. Started 2026-09-05. One project audit iteration, with no time or finding-count cap requested; complete repair closure remains open for those two findings.

## Outcome and authority

Audit every applicable Improve lane and every enumerated authored owner in this checkout. Give each confirmed finding a P0–P3 priority, exact evidence, affected denominator, disposition, and required proof. Select and verify the strongest justified local improvements. Current user authority includes local implementation through Improve; it does not include publication, external messages, another checkout, or a native goal.

P0 means an immediate critical integrity or availability failure; P1 means a serious correctness, ownership, or scale defect that should block the affected claim; P2 means a material bounded defect or recurring maintenance cost; P3 means a smaller actionable improvement. N/A and pending are coverage states, not severity scores. A passed scan is evidence only for its explicit predicate.

## Work list

- [x] Read Poteto Mode's Principles section in full.
- [x] Read Improve, Task autonomous mode, and the Plate workflow.
- [x] Enumerate effective rules, authored owners, entrypoints, consumers, tests, routes, documentation, and generated-output owners.
- [x] Read applicable rule families fully and record their governed sets.
- [x] Audit architecture/API, correctness, runtime/scale, DX/CI, tests/proof, documentation, registry/components, and agent workflow.
- [x] Confirm and prioritize every candidate in context; expand each confirmed pattern to its complete governed set.
- [x] Challenge the strongest target by deletion, merge, inline, and canonical-owner reuse; implement and verify justified units.
- [x] Reconcile every inventory row and finding, preserve proof gaps, and report the exact completion boundary.

## Throughput and evidence

Use one run-local inventory and evidence directory at `docs/plans/artifacts/2026-09-05-improve-full-audit/`. Reuse existing proof runners. A deterministic inventory prevents a convenient sample from becoming the denominator; source reading and behavioral proof still decide the findings. Work proceeds sequentially under this checkout's delegation instruction, with independent read-only tool calls batched. Shared-host measurements cannot establish speedups without a matched comparison.

Branch observed before creating this plan: `next`. Structured Autoreview is not run under branch policy. No Git status or checkout hygiene was performed.

Decision trail: `docs/plans/artifacts/2026-09-05-improve-full-audit/decisions.tsv`. Raw evidence stays local in the ignored artifact directory. The [public-entry scorecard](../analysis/2026-09-05-public-entry-audit.md) retains the per-entry conclusions.

## Coverage

| Lane | Governed area | Rule owner | Status |
| --- | --- | --- | --- |
| Architecture/API | All workspace packages, public entries, consuming apps/tooling | Vision, Plate Review, Best API, Architecture Cleanup | reviewed at public boundaries and confirmed owner patterns; API-01 remains open |
| Correctness | Package behavior, editor/native contracts, lifecycle and recovery | Patch, Regression, Verify Plate | reviewed through owned corpora and changed interaction paths; final closure below |
| Runtime/scale | Implemented editor and app workloads, including pagination | Benchmark | 48 current workload contracts reviewed; RUNTIME-03 remains open |
| DX/CI | Workspace scripts, CI, generators, checks and caches | Benchmark and each tool owner | reviewed; local runner, generator and package proof recorded |
| Tests/proof | All authored test suites, runners and proof declarations | Testing, Verify Plate | 790 runner-owned suites and complete expanded patterns classified; capability limits retained |
| Documentation | Current authored public docs and examples; historical records classified separately | Technical Writing, Task docs | 309 current code-contract inputs and all prose candidates reviewed; four literal examples executed |
| Registry/components | Complete authored registry and shared component consumers | Plate UI and applicable references | complete source/manifest denominator and candidate bodies reviewed; changed routes replayed |
| Agent workflow | Effective instructions, owned sources, provenance, mirrors and helpers | Maintain Workflow, Agent Native Reviewer | 139 source records and 56 shared lock entries classified; applicable methods reviewed and mirrors verified |

## Findings

| ID | Priority | Owner and finding | Evidence and disposition | Current status |
| --- | --- | --- | --- | --- |
| TEST-01 | P1 | `tooling/config/test-suites.mjs`: package-wide exclusions removed 39 slow files from the root slow lane; package tasks intentionally own fast tests. | `test-discovery.json`; actual runner regression failed with `No slow-suite tests matched`. Moved the exclusions to the fast lane only. Five runner contracts pass. Restored full slow proof exposes the rows below; The full restored root suite passes at its recorded checkpoint. | repaired locally; proof recorded |
| TEST-02 | P2 | `packages/platejs/src/csv/lib/esmInterop.slow.ts`: the native Node import targets nonexistent `packages/platejs/src/dist/index.js`. | Deleted the redundant test. The canonical packed-export verifier imports CSV with every public JavaScript subpath in native Node. Node imports, NodeNext/Bundler declarations, SSR and DCE passed; the complete artifact command failed its separate size snapshots. | repaired locally; proof recorded |
| TEST-03 | P1 | `packages/plitejs/src/core/schema-compiler.ts`: deleting a false compiled behavior bit changed ordinary persisted schema identities. | Recovered the pinned fingerprint through private hash canonicalization shared by compilation and contract verification. Kept the feature deleted. Constructor 57/57; schema consumers 76/76; snapshots 222/222; History persistence 18/18; Plite typecheck 11 tasks pass. Package proof passes at its recorded checkpoint. | repaired locally; proof recorded |
| TEST-04 | P2 | `packages/plitejs/test/transforms/deselect/basic.tsx:8`: fixture calls nonexistent `editor.selection.clear()` through `createFixtureTransactionApi`. | Changed the fixture to canonical `selection.set(null)`. Its full transform corpus passes: 843 pass, 60 skip. | repaired locally; proof recorded |
| TEST-05 | P2 | Root suite discovery omits 30 app `.test.ts[x]` / `.test.mts` files and the Oxlint helper suite. | Expanded existing globs. Added application working-directory batches while preserving root preloads, mock isolation and merged JUnit. Eight runner contracts pass, including two real Bun watchers, file-change replay, and sibling cleanup after one watcher exits. Temporary JUnit reports are removed after merging. CLI and both benchmark files have their own commands; the missing root paths alone do not prove a defect. CI-01 adds the CLI command to primary CI. | repaired locally; proof recorded |
| CHECK-01 | P2 | `tooling/scripts/check-plate-schema-adoption.mjs:5409`: the private-module predicate recognizes `.internal.` filenames but misses `/internal/` directories. | Repaired all three predicates and rejected public star re-exports from either private spelling. All 62 checker contracts pass. Twelve false positives are gone; the other 19 rows remain. | repaired locally; proof recorded |
| CHECK-02 | P2 | Stale schema-audit exceptions and missing lexical Base-descriptor resolution cause 18 further false positives; one benchmark uses capability names as persisted identities. | Reconciled each row below. The checker passes across 4,289 source/docs files; 61 checker contracts pass. This is structural predicate coverage, not whole-project semantic approval. | repaired locally; proof recorded |
| UI-01 | P2 | Event-only `usePath()` subscriptions in `CodeBlockCopyButton` and `CodeDrawingElement`. | Current concurrent implementation resolves paths inside copy/drawing handlers. This audit verifies drawing code/language/view changes and exact clipboard output after the block moves from path 2 to 3. Desktop browser and narrow live replay pass; no measured subscription-cost gain is claimed. | concurrent repair verified |
| DOCS-01 | P2 | `content/docs/meta.json`: two toolbar routes each appear twice among sibling navigation entries. | Removed the two obsolete Buttons entries from both page order and sidebar metadata. The complete sidebar duplicate test passes. At 390 px each entry appears once; Fixed Toolbar opens and its next-page link opens Floating Toolbar. This replay also exposed REG-02. | repaired locally; proof recorded |
| DOCS-02 | P2 | `apps/www/src/app/api/search/route.ts`: current Reads/Updates references are omitted from docs API result classification. | Updated the old-anchor tests to current references; both failed on the missing `docsApi` tag. Added current reference categories. Seven route tests pass, including localization and ordinary-heading exclusion. Browser search lists the read in Docs API Sections and selecting it opens the exact current anchor. | repaired locally; proof recorded |
| TEST-06 | P2 | Website route tests pin a growing changelog's first event, a component's complete event history and a registry file count. | Keep the historical event assertions without requiring them to remain newest or sole. Derive payload completeness from the index plus its two required index files. The stronger registry assertion exposed REG-01. | repaired locally; proof recorded |
| REG-01 | P1 | `apps/www/scripts/build-registry.mts`: docs publication writes `registry-docs.json` before style materialization deletes the canonical output directory. | Deleted the single-use write helper; collect docs once and place the docs index in the canonical build input. The owner regenerates 367 payloads; all 16 style combinations pass 5,892 assertions. Normal website typecheck and the live registry docs response pass. | repaired locally; proof recorded |
| RUNNER-01 | P2 | `tooling/scripts/test-suite.mjs`: multiple watch children can outlive one failed child. | Real two-workspace watch regression failed; sibling supervision and signal cleanup now pass, including file-change replay. | repaired locally; proof recorded |
| BENCH-01 | P2 | `benchmarks/editor/benchmarks/plite-schema-architecture-benchmark.ts`: descriptor resolution is checked against capability names. | Gave 100/1,000-descriptor fixtures distinct persisted types and precomputed expected types. Complete benchmark smoke passes with reduced repetitions; no timing or budget claim. | repaired locally; proof recorded |
| PROXY-01 | P1 | `packages/platejs/src/lib/plugin/createPluginContext.internal.ts` and `packages/plitejs/src/core/editor-lifecycle-api.ts`: method proxies reject standard `.call`/`.apply`, crashing React Compiler output. | `/docs/footnote` reproducibly crashed on `isDuplicateDefinition.call`. Permit only these native invocation methods after resolving an actual function; retain own method names and receiver semantics. 38 focused tests pass; browser page/search replay passes. The recorded full package/type checkpoint passes. | repaired locally; proof recorded |
| DOCS-04 | P2 | Footnote docs claim MarkdownKit installs footnotes, while the copied kit only configures Markdown; `nextRefentifier` is a botched rename with an incorrect result type. | Source confirms no Footnote dependency in MarkdownPlugin. Teach FootnoteKit plus MarkdownKit; remove the unused result variable and repair all seven `an ref` occurrences. The complete searched spelling pattern is confined to this page. Current docs and registry generation pass. | repaired locally; proof recorded |
| DOCS-05 | P2 | `apps/www/src/components/command-menu-dialog.tsx`: Fumadocs highlighted Markdown is rendered as plain text. | Use Fumadocs' renderer with standard raw-HTML parsing and a restricted inline sanitization schema. Four component tests pass, including marks, code, emphasis and selection. Browser query displays actual highlights and follows the exact result anchor. | repaired locally; proof recorded |
| TYPES-01 | P2 | Website typecheck exceeds Node's default 4 GB heap and exposes lifecycle-fixture typing errors with a larger heap. | Preserve the native fetch/timer function properties in spies, type external DOM listener adapters, and wrap the synchronous Comments test source through its existing asynchronous channel contract. All 27 lifecycle cases pass. Set an 8 GB heap for both website TypeScript commands; the complete normal website check passes in 51.26 s. This is a working command, not a compiler speedup. | repaired locally; proof recorded |
| REG-02 | P1 | `apps/www/src/app/(app)/docs/[[...slug]]/doc-page.tsx`: the docs fallback excludes feature components, breaking 25 advertised component routes; example names without `-demo` also cannot resolve. | Reuse canonical registry component entries for params, lookup and related links. Match examples with the same slug normalization used to publish params. The actual metadata/static-param path passes 1,216 assertions across English and Chinese. Physical MDX pages retain their separate owner. Narrow browser replay loads both toolbar pages. | repaired locally; proof recorded |
| TYPES-02 | P2 | `apps/www/src/registry/components/editor/comment.tsx`: the composer key handler fails typed lint's consistent-return rule. | Add explicit `return undefined` to the unchanged unhandled-key path. Focused proof passes; the final checkout check is recorded below. | repaired locally; proof recorded |
| DOCS-06 | P3 | `content/docs/meta.json` retains a `v42` badge on the current Plite API and ten unused heading lists. | Remove both badge occurrences, all 185 cached heading names and the unused navigation prop. The current source-derived search index owns headings. Source consumer search finds no runtime reader of the removed navigation field. | repaired locally; proof recorded |
| CI-01 | P2 | `.github/workflows/ci.yml`: CLI generation and migration tests are absent from primary CI. | Added the existing `pnpm --filter @platejs/cli test` command. Baseline CLI proof is 86 passing tests; current CI and local-template dependency contracts pass. | repaired locally; proof recorded |
| CI-02 | P1 | `.github/workflows/registry.yml`: any pending changeset skips the entire PR registry/template validation job. | Remove the skip and its step conditions from validation. Existing local workspace package overrides supply unpublished package inputs. Publication keeps its separate pending-release boundary. Source conditions and local registry generation verified; no hosted CI run is claimed. | repaired locally; proof recorded |
| WF-01 | P2 | `docs/plite/agent-start.md`: the active entrypoint repeats stale current-green measurements, removed commands and moved proof paths. | Point to current Vision/Task and executable proof commands; remove fossilized green claims and correct the three surviving manual soak paths. Keep the explicit manual-soak authority boundary. | repaired locally; proof recorded |
| WF-02 | P2 | `tooling/preset`: the generated template instructs agents to load every skill, repeat that work after compaction, and wait for approval before coding. Two included browser rules are absent; two other included rules depend on the monorepo-only Task path. | Remove the four copied prompt hooks and broken includes; keep template instructions in its existing AGENTS source. The generator removes retired files from older template outputs. A real temporary-project install passes for Codex and Claude; no template output was manually edited. | repaired locally; proof recorded |
| WF-03 | P1 | `tooling/preset/preset.toml`: exporting the root skill lock makes standalone installs depend on `../dotai` and a developer's absolute checkout. | Actual installer fails on a nonexistent sibling Dotai checkout. Give the template a portable lock for shadcn and the two React skills; the real installer passes and preserves unrelated project content. | repaired locally; proof recorded |
| WF-04 | P3 | `docs/vision/plate.md`: public docs route to the retired `docs-creator` owner. | Correct to Technical Writing and Task docs mechanics; existing ownership policy is unchanged. `pnpm install` regenerates current project mirrors successfully. | repaired locally; proof recorded |
| API-01 | P2 | `packages/plitejs/src/index.ts`: framework integration exposes compiler witnesses, runtime identity and transform installers in the ordinary root API. | Cut `compileEditorExtension`, `getCandidateEditorExtensionApi` and `getCompiledSchemaPropertyId` through ordinary constructors and semantic reads. The full integration corpus and packed exports pass. Opaque extension inference, a shared weak resource identity, and declarative state/snapshot lowering still need a combined executable replacement; see the decision packet below. | partly repaired; open |
| API-02 | P2 | `packages/plitejs/src/pagination`: duplicate layout factories and hooks expose the same job. | Consolidated into `createPliteLayout`, `usePliteLayout`, and `usePliteLayoutSnapshot`; optional `engine` owns customization. All callers migrated; 57 pagination tests, 80 typecheck tasks and all 46 applicable Chromium rows pass. The canonical packed proof passes; final browser closure is recorded below. | repaired locally; proof recorded |
| BROWSER-01 | P1 | Virtualized projected blocks intercept clicks on neighboring visible text. | The existing deep-scroll pagination test fails with both the original and consolidated layout factory. Browser `elementFromPoint` resolves paragraph 2706 over visible text belonging to 2705; its virtual row wrapper also intercepts the point. Keep projected wrapper boxes transparent to pointer events and let their visible projected lines and native-flow blocks own hit targets. The existing click/navigation/edit regression now explicitly verifies the hit owner. Full source-bound browser closure is recorded below. | repaired locally; proof recorded |
| RUNTIME-02 | P2 | `packages/plitejs/src/diff/lib/computeDiff.ts`: sibling-to-token conversion and decoding perform quadratic scans, with a finite UTF-16 token domain. | Indexed, equality-checked node matching and integer inline tokens replace both scans. DMP retains ordinary presentation; bounded array bisect preserves inputs beyond its token alphabet. All 43 package cases pass, including 70,000-sibling insertion and separated-edit reconstruction, exhausted UTF-16 text and non-plain values. The production matched probe satisfies its frozen work and timing contract. | repaired locally; proof recorded |
| ARTIFACT-01 | P2 | `tooling/entrypoints/platejs-entrypoint-sizes.json`: packed proof exact-byte snapshots differ from the final built sources. | Updated through the canonical packed-artifact command after source review. All four packages, 80 exports, declarations, SSR, DCE and 38 optional-peer closures pass; reduced snapshot bytes alone are not a performance result. | repaired locally; proof recorded |
| DOCS-03 | P2 | `apps/www/next.config.ts`: dynamic development uses `.source-dev` for collection reads but `createMDX({})` still regenerates `.source`, removing static server exports. | Confirmed installed Fumadocs `createMDX` defaults to `.source`. Set `outDir` to `.source-dev` in dynamic mode. Executable Next loader/alias tests reproduce the mismatch and pass in both modes. | repaired locally; proof recorded |
| RUNNER-02 | P2 | `apps/plite/scripts/run-plite-browser.mjs`: a focused matrix fails when mobile WebKit's file filter selects no tests. | Preserve each project's configured applicability during matrix discovery; explicit empty project runs and an all-empty matrix still fail. Focused real matrix passes; a deliberately nonexistent filename fails. Existing runner contracts pass. | repaired locally; proof recorded |
| BENCH-02 | P2 | Two research fetch commands duplicate their entire 263-line implementation except for the topic name. | One `fetch-research.mjs --topic` owns both package commands. Temporary local-file and inline fixtures verify both topics, default directories and every output hash; missing/malformed topics fail. Existing historical generated research artifacts remain historical. | repaired locally; proof recorded |
| API-03 | P2 | `PliteSingleEditor` and `OwnedPliteRuntime` each own root registration maps, selection caches, DOM synchronization, focus and view-effect publication. | One runtime provider owns direct-editor and multi-root lifetimes. The adapter preserves identity and callbacks; duplicate registration, focus, selection and DOM owners are deleted. Matched probes pass identical work through four 10,000-block roots with balanced teardown. The final 62-case focus/provider corpus, package/type proof and complete browser matrix pass. The original mention-paint failure and its native/DOM/context repair remain recorded below. | repaired locally; proof recorded |
| DOCS-07 | P2 | Current tutorials contain callable obsolete APIs and incomplete imports. | Repair the Chinese Node.js/shortcuts examples, their current heading transform, both static component imports, and the FAQ's unresolved template token. Correct MCP ownership and remove unsupported guarantee language. Full current structural docs checks pass; this does not typecheck every snippet. | repaired locally; proof recorded |
| DOCS-08 | P3 | English reference headings use inconsistent title case. | Reviewed 703 distinct proposed heading changes; apply 1,022 case-only edits across current English pages. Keep API names, code, established API Reference headings and lowercase anchor text unchanged. Chinese prose and historical release/migration snapshots retain their separate ownership. | repaired locally; proof recorded |
| CHECK-03 | P2 | The docs contract checker duplicates `createEditor` and omits `useCreateEditor`. | A real memoized-constructor fixture bypasses invalid-option detection before the fix and is rejected afterward. All checker contracts and all 309 current docs files pass. | repaired locally; proof recorded |
| CHECK-04 | P2 | The Plite docs guard requires three moved soak scripts and one nonexistent script in the agent entrypoint. | Point the existing required/manual-only guard to the three actual tooling owners. Current full Plite docs audit passes; no soak runner was executed. | repaired locally; proof recorded |
| HOOK-01 | P2 | The public `useRecordHotkeys` hook has no live consumer and leaves its document keyboard listener active after unmount. | Delete the unused recorder and its public export. Existing hotkey tests pass. There is no retained feature job to replace; a test that locks the deleted spelling would add no behavior proof. Existing public-hook ownership doctrine applies unchanged. | repaired locally; proof recorded |
| REF-01 | P2 | Three authored ref composers fail React 19 cleanup semantics. | Plate's composer runs callback cleanups but retains sibling object/legacy callback refs. Base FloatingPopover and Command discard callback cleanups. Actual mount/unmount regressions fail before repair and pass afterward for all three owners. The two portable copied primitives retain their local helpers; adding an editor dependency solely for ref composition would create the wrong boundary. | repaired locally; proof recorded |
| API-04 | P2 | `platejs/react` exposes generic controller/Jotai implementation hooks beyond the semantic consumer jobs. | Seven generic hooks and the raw store type are cut from the public entrypoint; unused setters are deleted. The existing private controller retains active/primary/explicit scope lookup. `useEditorContainerRef` owns current container access in PlateContainer and copied SelectEditor. Forty-two focused cases prove provider selection and mounted ref cleanup; React types pass, docs and generated registry are current, and doctrine v156 validates. Packed proof and live SelectEditor replay pass; final browser closure is recorded below. | repaired locally; proof recorded |
| DX-01 | P3 | Root `docs:build` / `docs:start` point at a nonexistent docs package; the unused `tooling/scripts/init.sh` mixes three scratch directories. | Delete the two dead commands and unreferenced helper. The website package and existing template generator retain the real jobs. No new wrapper or deletion-only test is introduced. | repaired locally; proof recorded |
| BENCH-03 | P2 | Benchmark history reports retained artifact receipts as `exists: true` and target status `ok`, conflating recorded evidence with current availability or budget success. | Model durable history as `recorded`, preserve older serialized receipts on input, and update both report consumers. A historical-only receipt regression fails before repair and passes afterward, including regeneration from the current history format. All 20 target-runner tests pass. The report/index regenerate and check through their owners. | repaired locally; proof recorded |
| BENCH-04 | P2 | Two active Yjs target IDs run the identical command, metric and artifact; the narrower row checks only Plate while describing canonical Plite Yjs proof. | Keep `yjs-collaboration`, remove `core-yjs-collaboration-current`, merge its supporting sources and retain the full `pnpm check:plite` correctness gate. The unchanged workload remains registered once. The 48-target registry and generated report check pass. | repaired locally; proof recorded |
| RUNTIME-03 | P1 | The external-text 1,000-block/four-view cold mount exceeds the unchanged 150 ms budget. | The full recorded checkpoint in `external-text-final-checkpoint.json` passes correctness/validity but records cold p50 152.1 ms, cold p95 156.1 ms and warm p95 117.7 ms. A separate decoration-undo cohort fails the noise guard, so overall evaluation is inconclusive. No budget relaxation, host-cause assertion or certification claim. | open budget |
| UI-02 | P2 | `apps/www/src/registry/components/editor/select-command.tsx`: manual invocation of custom child components breaks React hook/lifetime ownership; root and Group also pass multiple children to a single-child slot. | All four `asChild` surfaces fail exact React regressions: root, List, Group and Loading. Reuse Radix Slottable, remove the manual renderer, type guard and React 18 ref fallback, and declare the direct copied-install dependency. The four lifecycle cases and three existing command cases pass, including child ref forwarding and cleanup. Registry generation and live SelectEditor filtering/selection pass. | repaired locally; proof recorded |
| WF-05 | P2 | `docs/development/agent-skills.md`: current onboarding routes broad work to the deleted Auto skill and a missing argument reference. | Route the two invocations and link to Task autonomous mode. The canonical argument reference confirms both forms and the local link resolves. Historical skill-audit decisions remain records. | repaired locally; proof recorded |
| UI-03 | P2 | `BaseCodeBlockPlugin.ts`: block-keyed cached syntax ranges keep an old absolute path when a block moves. | Rebase cached ranges without re-tokenizing and preserve old snapshots. Three package regressions fail before the repair; all 55 owning cases pass afterward. Both desktop/narrow browser rows and the live insertion replay pass. | repaired locally; proof recorded |
| UI-04 | P2 | `plite-example-styles.css`: an auto-centered multi-root page grows beyond the narrow viewport. | The complete auto-margin container sweep finds one failure among six active examples: 105 px overflow at 390 px. Give only the failing page an explicit available width and zero minimum while preserving its 880 px cap. All six browser rows pass; live typing, root-specific undo and visual review pass at exactly 390 px. | repaired locally; proof recorded |
| RUNNER-03 | P2 | `apps/plite/scripts/plite-proof-inputs.mjs`: a broad source monitor treats generated `tmp/stress-artifacts` reports and `.turbo` build logs as input changes. | The strict contract run fails when a concurrent browser updates a report. The existing ignored-directory regression reproduces the same failure in a temporary fixture. Add `tmp` and `.turbo` to the established scratch/output exclusions and exercise all nine declared directory exclusions; all 21 monitor contracts pass, including real source edits and target/output drift. | repaired locally; proof recorded |
| TEST-07 | P2 | `tooling/scripts/entrypoint-turbo.slow.test.mjs`: two graph contracts create, rename and remove probe modules inside production package sources, invalidating concurrent browser proof. | Run both mutating cases in temporary projects copied from actual graph inputs. Every baseline source-task hash must equal the real checkout before testing cache misses and reverse dependency changes. All four original cases pass; the production-source monitor changes from a real source mutation to none. Fixture teardown owns cleanup. | repaired locally; proof recorded |
| RUNNER-04 | P2 | `apps/plite/scripts/build-browser-if-stale.mjs`: freshness requires obsolete `dist/core/index` outputs, rebuilding a valid harness before every browser invocation. | Concurrent repair points the two checks to the package's actual root exports. This audit restores the original paths in a temporary fixture and the existing freshness regression fails; the final 22 build/input cases pass, preserving changed-byte and missing-output invalidation. Actual pretest reports the harness fresh. | concurrent repair verified |

Initial inventory: four publishable packages, 80 export-map entries and 12,085 selected files. Final reconciliation classifies 12,305 current and initial file records, including generated products, installed rules, historical evidence, fixtures and current authored owners. These counts describe the denominator; the companion records state each predicate and evidence limit.

`entrypoint-review.json` records all 81 public boundaries (80 export-map entries plus the CLI executable), and `public-hook-review.json` records 99 current/historical hook definitions: 91 remain public, seven generic hooks are private/deleted, and the recorder is deleted. Each row has an owner, disposition, evidence limit and the highest confirmed associated priority; rows with no confirmed defect are not assigned a fabricated P3. This is boundary and hook ownership review, not a claim that every implementation reachable from a barrel is defect-free.

The earlier `docs/plans/2026-09-05-improve-iteration-1.md` and its AST/rule/prose inventories identify outstanding work. Their partial semantic coverage stays partial in this run; valid source-bound evidence may be reused after fingerprint checks.

## Proof checkpoints

### Schema identity repair decision

Case `audit:ordinary-schema-identity`: construct a no-argument Plate editor and
read its derived identity. The existing persistence regression requires
`fnv1a64:4164b9dbcdccb294`; the restored slow lane instead returns
`fnv1a64:66cbae4abcdfb59a`. Comparing the compiler with `088a82c84c` isolates
the removed `editableIsland: false` behavior field. An in-memory source probe
restores only that canonical hash input and recovers the exact expected hash;
see `fingerprint-cause-probe.log`.

Keep the removed editable-island feature deleted. Preserve the hash's reserved
false field in one private canonicalization function, shared by live schema
compilation and generated-contract verification. Deleting schema identity
would remove the mismatch protection needed by persisted snapshots, History,
and Yjs; changing the test would conceal the broken persistence contract.
The compiler owns this repair and Improve authorizes implementation.

Three relevant failures are ordinary snapshots being rejected, old History or
Yjs identities being rejected, and generated contracts disagreeing with the
runtime compiler. Focused schema, snapshot, History, Yjs, generated-contract,
and Plate constructor tests must pass. This changes cold schema hashing only;
it adds no state, cache, subscription, public input, or editor hot path. No
browser-visible or performance claim follows from this repair.

All relative receipts below live in `docs/plans/artifacts/2026-09-05-improve-full-audit/`.

| Check | Observed result |
| --- | --- |
| Initial `pnpm test:all` | Passed; `baseline-tests.log`. It omitted the 39 slow package files. |
| `pnpm plite:test` | Passed, 138 tasks in its second stage; `baseline-package-tests.log`. |
| `pnpm typecheck` | Passed, 88 tasks (74 cached); `baseline-types.log`. |
| `pnpm --filter www check:docs` | Passed; `baseline-docs.log`. |
| Docs code contract / Plite docs audits | Passed; 309 current docs files in the code-contract predicate. |
| Registry source check | Passed; `baseline-registry.log`. |
| Workspace manifests | Passed dependency ownership and every changeset target. |
| Skill resources | Exact, using existing sync-resources checker. |
| Initial lint | Formatting failure in this run's inventory JSON, root package.json, and one registry changelog entry; `baseline-lint.log`. The run-owned artifact must be formatted before handoff. |
| Discovery repair | `slow-discovery-red.log` shows the runner omission; `slow-discovery-green.log` shows 5/5 passing. |
| Restored `pnpm test:slow` | 1,560 pass / 60 skip / 3 fail in shared Bun batch plus passing isolated batches; Node graph test also failed. `restored-slow-suite.log`. |
| Direct public-package smoke | 24/24 passed through the root slow runner; `public-smoke-direct.log`. |
| Browser freshness doctor | Both app and browser artifacts stale; `browser-doctor.json`. No browser success is claimed. |

The Node graph test initially passed and later detected excess hash invalidation. A content-fingerprint comparison confirmed seven unrelated source/test files changed during this run (DOM geometry, root interaction controller, and browser tests), in addition to our two runner files. The graph test mutates the shared checkout and compares timed snapshots; distinguish concurrent input drift from a graph defect before another diagnosis. Continue without touching those other edits.

## Completion predicate

Every enumerated owner and rule family has an evidence-backed disposition; every confirmed finding has a priority and an implemented/proved, rejected, or concretely unresolved disposition; expanded sweeps name their full sets and remaining rows; proof results are bound to the tested sources. No unread or unavailable area is described as passing. No speculative change remains active.

## Schema-audit row reconciliation

- Comments' `on` stage consumes the earlier inferred comments API; retaining this stage follows the inference rule.
- Copilot and the version-history example retain the same shared closure/factory jobs; current structural composition is `slots`, not the earlier `render` field.
- CodeHighlight's existing exception retains its per-editor closure shared with decoration reads; the removed `corrections` contribution no longer belongs in its signature. Its lifetime/cost still belongs in the runtime audit.
- BlockPlaceholder has no extension stages; removed its obsolete exception. The old runtime `render.node` negative fixture is gone, so removed its dead exception machinery and test. Typed negative coverage remains.
- AIChat's one raw property query checks whether arbitrary incoming block types accept preview metadata. The compiler's six raw queries are explicit property-handle contract tests. Removed CodeBlock's absent query count and the redundant global total while retaining exact reviewed per-file counts.
- The Yjs API fixture contains six intentional collaboration editors, and the copied remote-selection fixture contains one. Both named lineages remain confined to collaboration proof.
- Static leaf/text fixtures really construct Base descriptors. The checker now resolves their lexical constructor bindings and aliases; a shadowing parameter remains rejected.
- The benchmark is the genuine identity violation and is repaired in BENCH-01.

The restored root suite passes after PROXY-01 and the website repairs (`final-root-tests.log`). The corrected schema checker passes 4,289 inputs. The current editor/API generators, registry generator, complete website typecheck and documentation checks subsequently pass (`closure-current-editor.log`, `closure-current-api-reference.log`, `closure-current-registry.log`, `closure-current-www.log`, `closure-current-docs.log`, `closure-current-doc-code.log`, `closure-current-plite-docs.log`). Browser evidence in `browser-docs-receipt.json` remains scoped to the named routes and states.

Subsequent proof: the normal website typecheck passes both source and package-integration graphs with its explicit 8 GB heap. Full typed lint passes. Package proof passes 3 core tasks followed by 138 package tasks. The canonical entrypoint-size update command passes all four packed packages, all 80 subpaths, 75 native runtime imports, 41 React-free headless entries, one DOM-free SSR entry, 38 direct optional-peer closures, declarations and tree-shaking. See `www-typecheck-green.log`, `typed-lint-green.log`, `final-package-tests.log`, and `final-packed-artifacts.log`. No publication occurred. Browser proof additionally covers 390 px viewport navigation; no raw mobile-device claim follows.


Template source proof: `preset-install-proof.log` preserves the real missing-Dotai failure. `preset-install-green.log` and `preset-install-receipt.json` record successful portable installation and removal of old prompt hooks. Generated `CLAUDE.md` correctly references the canonical AGENTS source; Codex receives generated AGENTS content. Product template directories remain untouched, as required by their CI ownership.

### Pagination API decision and execution packet

API-02 target: one `createPliteLayout(editor, { page, engine? })` factory,
`usePliteLayout` hook and `usePliteLayoutSnapshot` subscription. Plite owns
derived geometry and its lifetime; the editor retains document content and
persisted settings/page breaks. Plate's existing identity facade inherits the
same exports. A caller-owned engine is a configuration input to this job and
does not justify a second factory, options type, hook or snapshot hook.

The stronger deletion of the layout owner is rejected: it computes reusable
headless geometry and supports independent React and static consumers. The
weaker shared private hook leaves the duplicate public choice intact. Merge
engine resolution into the existing runtime and remove the forwarding runtime
object and second lifecycle registration. Keep the existing geometry algorithm,
page-break writer, deferred connection, error isolation and configuration commit.

Normal and customized calls both import `createPliteLayout` from
`plitejs/pagination`; customization supplies `engine`. React imports
`usePliteLayout` from `plitejs/pagination/react`. No compatibility alias remains.
The obsolete names have consumers in package tests, packed-facade proof and one
current docs page; authored app examples already use the target. Preserve
historical plans as records and regenerate published registry docs.

The disposable matched prototype passes exact initial/customized/restored
snapshots, composition counts and balanced subscriptions for 3, 100 and 1,000
blocks over 30 interleaved measured pairs. At 1,000 blocks its median is 3.32 ms
versus 3.49 ms and p95 is 4.76 ms versus 4.68 ms. These timings show comparable
work in this headless cohort; they are not a speedup or browser performance
claim. See `pagination-prototype-receipt.json` for source hashes and all cohorts.

Readiness is accepted under Improve's existing local implementation authority.
Three failure cases govern adoption: lost custom/default engine reconfiguration,
unbalanced StrictMode/unmount subscriptions, and changed page-break persistence
or projection. Migrate the full caller set; run pagination package/type proof,
the owned pagination browser suite, packed identity/type proof, source/docs
audits and the matching final runtime probe. Repair Best API teaching and append
the next doctrine version without updating package attestations.

### Literal documentation example proof

Case `audit:docs-node-cn` is a pre-acceptance tutorial repair. Structural docs
checks did not exercise the fenced program. Executing that program exposed an
incorrect proposed transaction read (`tx.value.root()`); the live transaction
contract owns `tx.children()`. This was caught before a behavioral green or kept
claim for the tutorial. Regression's exact-reproduction method applies;
there is no reporter contradiction or prior completed behavioral receipt.

The owning permanent proof is `tooling/scripts/plate-doc-examples.test.mjs`.
It extracts the literal current fences, uses the repository's real source
imports, and checks the heading update, appended paragraph and returned text.
The same runner renders both English and Chinese static component examples and
executes the English Node.js transform with Markdown serialization. Both Node
guides also taught removed `state.value.root()` reads; the complete four-call
sweep uses canonical `children()` reads. The English heading transform matched
an obsolete type instead of the current `heading` plus `level: 1`; its literal
example regression now verifies the level change and serialized heading.
`docs-examples-red.log` records the Node example failing while both static
examples pass; `docs-examples-green.log` records all four passing. Model and
runtime errors are applicable; native input, pointer, focus, geometry and
subscription phases are N/A for these headless examples. The methodology repair
is executable snippet coverage in the existing tooling test lane. No editor
runtime change or browser test is needed for this case.

### Ref-cleanup final-check repair

`regression repair audit:ref-cleanup: registry author discovery includes test files`
is a proof-owner repair. The full check passes ref lifetimes but rejects the
new `floating-popover.spec.tsx` as an undeclared installable provider. The actual
registry manifest does not publish that file. Keep the native ref fix and its
regression; filter authored test suffixes from the directory ownership check,
while continuing to reject undeclared production files and directories. The
existing real fixture supplies the failing case and the combined registry and
ref suites supply replay. No runtime, input, focus or geometry change follows
from this test-discovery correction. The original failure remains in
`closure-check.log`; final full replay is required before closure.

### Command child ownership decision

Keep custom host composition through the existing Radix primitive. Deleting
the manual renderer removes a competing React owner; Radix Slottable handles
the structural siblings required by the accessible label and group heading.
A wrapper that invokes the component or reimplements ref merging would retain
the defect. The four current call sites share the same helper and all are
covered by exact mount, replacement, cleanup and ref assertions. The source
scan finds no parallel manual child-component invocation in authored registry
or Plate React source. `command-child-permanent-red.log` records four failures;
`command-child-green.log` records the passing suite. Two current draft registry
changelog entries describe the ref and child-composition repairs; their public
JSON is generated through the existing changelog owner.

### Heading-proof final-check repair

`regression repair audit:docs-heading-case: pagination proof pins old title case`
keeps the current sentence-case heading and changes the existing assertion to
an anchored case-insensitive heading check. The failed strict package run
passes 56 pagination behavior cases and fails only this stale presentation
assertion. No runtime edit follows; the same 57-case package suite and strict
handoff command own the replay.


### Provider API adoption

API-04 removes seven generic provider hooks and the raw store type from the
curated React entrypoint. Controller lookup remains private with the existing
active/primary/explicit-ID ordering. The unused provider setters are deleted.
`useEditorContainerRef(id?)` provides the actual container contract used by
PlateContainer and SelectEditor; it returns the existing ref without adding a
provider, subscription or retained state. Direct container reads perform the
same atom subscription as the former generic hook, so no scale machinery is
added and no performance gain is claimed.

Deleting the provider would discard required controller registration and scope
selection. A public atom handle or generic replacement would retain the leaked
implementation. The retained editor hooks, Plate props and container ref cover
every current consumer job. Current English and Chinese references are updated;
historical migration records retain their original meaning.

The existing provider/controller tests pass 19 cases and 41 assertions.
The actual Plate component suite passes 23 cases and 40 assertions, including
nested editor scopes, closest-container identity and null refs after unmount.
Source-first React typecheck passes. See `api04-react-proof.log`,
`api04-container-lifetime.log` and `api04-react-types.log`. Packed and generated
registry closure remains part of the final current-source proof. Best API and
Plate UI teaching is repaired in doctrine v156 without changing attestations.


The API-04 focused invocation initially passed `Plate.slow.tsx` as a bare Bun
filter; its 19-case receipt contains only the three spec files. Explicit replay
with `./packages/.../Plate.slow.tsx` produced the separate 23-case lifetime
receipt. The package task intentionally enumerates fast tests, and the root
slow runner passes absolute file paths. This is a corrected invocation and
coverage description, not a new runner defect.


### Runtime owner decision and acceptance contract

API-03 keeps the existing runtime provider as the single mounted owner of root
registration, focus, selection caching, DOM synchronization, selector delivery
and view-effect cleanup. Direct-editor Plite retains the exact caller editor
and supplies its change observer to that owner; named-root views retain their
own view projections and root-scoped callbacks. The runtime-only provider has
a current independent job: it supplies shared commands and root selectors
without choosing a default view. Deleting the duplicate mounted owner is the
maximum justified cut; deleting root views would lose their DOM/read-only
identity. A helper extraction that retained both state registries is rejected.

The disposable prototype removes 521 lines from the direct provider. Its first
matched diagnostic spans 3, 100 and 1,000 blocks across four mounted roots,
with seven interleaved pairs each. It checks all eight updates, exact direct
editor identity, paired callback snapshots and complete root-map cleanup.
The 48-case existing runtime-provider corpus also passes against the disposable
candidate. These are design evidence, not final production proof.

Before the acceptance replay, freeze these gates: at 3, 100, 1,000 and 10,000
blocks with four roots, candidate semantic selector checks, DOM text-sync work,
core operation counts and React render counts must equal baseline for the
identical eight edits; four mounted roots and ordered paired callbacks must
survive; all registrations must disappear after unmount. The direct root joins
the shared map, so its one additional registration is constant per runtime,
not per document node. Timing remains descriptive under shared-host load;
this ownership cut claims neither a latency improvement nor certification of
an absolute interaction budget. An extra per-node operation, extra React
render, changed callback result or leaked registration rejects adoption.

Run this same frozen contract on the final production source after adoption,
plus the full provider/native corpus, source types and browser matrix. The
original diagnostic receipt is `runtime-prototype-receipt.json`; the separately
named acceptance receipt must include its predicate result and source hashes.


The frozen runtime acceptance replay passes all four cohorts through 10,000
blocks per root. Every paired semantic work counter and React render count is
equal, callbacks remain ordered with matching snapshots, all four DOM roots
receive their updates, and teardown removes every registration. This accepts
the unified owner for local adoption. Primary editor identity is preserved;
there is no new public API or serialization shape. The implementation copies
the accepted candidate only after matching both production source files to the
frozen baseline. Final production tests, matched replay and browser proof remain
required. `runtime-prototype-acceptance.json` records the complete cohort.


The actual runtime source passes `runtime-production-acceptance.json` under the
same frozen cohorts and work predicates as the prototype. The focused current
provider/selection/announcement corpus passes 86 cases; React source types and
focused lint pass. The existing nested-commit test runs for both public provider
forms. The provider cut changes no public exports or persisted state, so its
current ownership doctrine applies without another public-API version.

### RUNTIME-02 prototype contract

The repeated unit is a distinct sibling node. The existing token owner scans
all earlier nodes during encoding and decoding, and assumes every allocated
Unicode code point occupies one UTF-16 unit. The candidate indexes canonical
plain-data representations into equality-checked buckets, retains an exact
fallback for non-plain values, and decodes tokens by index. Hash/key equality
never substitutes for deep node equality. Inline atoms and newline markers use
integer identities; ordinary text retains its original UTF-16 units.

The disposable candidate retains the existing DMP presentation algorithm where
one-unit encoding fits and uses a bounded, linear-space array bisect otherwise.
The existing 200 ms diff timeout still falls back to a complete replacement;
no finite token alphabet may lose input. Before accepting production changes,
require the complete existing diff corpus, both-version reconstruction for
70,000 siblings and exhausted-Unicode inline text, and key-order/non-plain
value equality cases. Freeze normal/large work cohorts at 100, 1,000 and 10,000
distinct unchanged siblings, one warmup and two measured interleaved pairs.
Candidate deep comparisons must be at most the sibling count, versus quadratic
baseline work, and each measured 1,000/10,000-node pair must take less than half
the baseline elapsed time. This is a headless owner comparison, not browser
input-latency certification. Preserve source and probe fingerprints and rerun
on production after acceptance.


RUNTIME-02 production acceptance passes in `diff-production-acceptance.json`:
100/1,000/10,000-node cohorts use identical source fixtures and interleaved
measurement. At 10,000 siblings the measured original takes 23,606/24,088 ms
and production takes 26.7/32.4 ms on this host; counted matching work is
100,000,000 versus 10,000 deep comparisons. This only certifies the unchanged
sibling workload. Arbitrary caller-defined related-node predicates retain their
separate potentially quadratic matching job; no general diff latency guarantee
is inferred. The 200 ms search cutoff preserves complete source/target tokens
as deletion/insertion when a detailed edit script is too costly.

The original 35 compute-diff presentation cases remain unchanged and passing.
The final 43-case diff entrypoint includes six new edge cases and the two
existing extraction cases, including both-version reconstruction on actual
production code. `diff-production-corpus-final.log` and
`diff-production-types-final.log` pass. The first production benchmark replay
caught an incomplete local edit before acceptance; that provisional replay
failed and is superseded by the final exact-source corpus and measurement.
No API or document serialization shape changes in this repair.

The final diff production source fingerprint is
`e4bf56c8b9486eac89cbc8b6fada42783d740694ae40ae8ca835b5291cdee8d8`.
Its final lint, typecheck, 43-case corpus and unchanged-source matched probe
pass (`diff-production-lint-final.log`, `diff-production-types-final.log`,
`diff-production-corpus-final.log`, `closure-diff-matched.log`).
The probe verifies the production source remains unchanged during measurement.

### API-01 canonical consumer cut and remaining design boundary

Plate no longer imports `compileEditorExtension`,
`getCandidateEditorExtensionApi`, or `getCompiledSchemaPropertyId`. Dynamic
lowering calls `defineExtension(name, definition)` inside its existing compiler;
the already-validated runtime graph is erased only there. Publication reads
`editor.api[name]`, whose existing owner resolves candidate and installed APIs.
Property consumers read `schema.handle.property(declaration).id`, preserving
the compiler's semantic identity and lowered-property override. All three
helpers are cut from the public Plite root and its Plate facade, with their
private Plite consumers retained. No second constructor, cache, public internal
entrypoint, subscription or lifetime is introduced.

The complete existing plugin-resolution, product-codec and public import
corpus passes 113 cases and 575 assertions; the Plate root source typecheck
passes. These changes claim reduced API surface, not faster schema compilation.
The current public docs contain no uses of the removed helpers. API reference
configuration and export expectations follow the cut; generation and packed
proof are closure gates. Best API teaching and doctrine v158 record the owning
boundary without changing package attestations.

The remainder of API-01 is confirmed, unresolved architecture debt. Its
replacement must satisfy three independent contracts together:

- `EditorExtension<Definition>` must carry nominal identity and exact installed
  dependency inference privately, including schema source inference and Plate
  writable-property metadata. An opaque interface is the candidate target;
  applying `Omit` to the current protected witness loses nominal members.
- Canonical extension lifetime must supply one resource identity shared by
  root views. Replacing `getEditorRuntimeOwner` with view object identity forks
  Plate stores; indexing by the shared string ID loses WeakMap cleanup.
- Declarative extension ownership must replace state/transaction and snapshot
  transform installers while preserving descriptor-aware reads, transaction
  plugin portals, migration-before-fitting, read-only initialization and
  rollback. Renaming those installers or moving them to a public internal
  subpath preserves the defect.

The current public contracts do not yet express all three jobs. No executable
replacement has passed their combined runtime, inference and packed-artifact
oracles, so this audit does not delete their active dependencies or claim that
API-01 is closed. The ideal target remains one canonical extension contract;
the three redundant helpers above are the independently proved adoption unit.

### UI-03: syntax ranges retain a moved block's old path

Case `audit:code-syntax-block-relocation`, rendering/projection, Plate owner
`packages/platejs/src/features/code-block/lib/BaseCodeBlockPlugin.ts`.
On `/blocks/code-block-demo`, insert a paragraph before the existing heading.
The first code block moves from index 2 to 3 without a text change. Its cached
syntax ranges remain at index 2 and color the ordinary description paragraph.
The real browser replay observes nine syntax spans on that paragraph at 390 px.

The block-keyed cache in `readBlock` returns absolute ranges unchanged when
text and language are equal. The cache's stable identity survives relocation;
its absolute paths do not. The three package regressions reproduce insertion,
removal and explicit movement, all failing on the old path. Browser regression
replays the original Enter action at desktop and narrow widths. This is a P2
rendering defect; model text and copying remain correct.

Retain the useful tokenization cache, rebase only its returned ranges when a
block's current path differs, preserve previous range snapshots, and do not
rerun the highlighter on structural relocation. Do not add a document scan,
second cache or rehighlight timer. The source sweep finds no other matching
cached-decoration early return in either package. Require the entire owning
code-block suite, both browser rows and a live current-route replay before
keeping the change. No new public contract or timing claim is proposed.

### UI-04: available-width ownership for the multi-root example

The shared stylesheet has eight auto-centered maximum-width containers. Six
have current source consumers. The existing multi-root geometry test checks
children against the document frame, so it passes even when that entire frame
overflows the viewport. Six real-route width cases in the existing navigation
suite reproduce 105 px overflow only on the multi-root example.

The page retains its centering, padding and 880 px cap, and uses the available
width with a zero minimum. No overflow clipping or editor-content rewrite is
added. The five already-fitting examples remain unchanged. `ui04-narrow-red.log`
preserves one failure/five passes; `ui04-narrow-green.log` records all six
passing. Live in-app Chromium confirms client width, inner width and document
scroll width all equal 390, then preserves independent header/footer input and
footer-only undo. `ui04-narrow-review.json` records the full selector set.

### RUNNER-03: proof inputs exclude generated scratch reports

The strict contract run observes an update to a generated stress report under
`apps/plite/tmp`, through its test of broad real-repository monitor roots. That
report is output, but the existing exclusions include `.tmp` and omit `tmp`.
The ordinary ignored-directory test reproduces this misclassification with a
local file write; no shared-checkout timing is required for the regression.

Add the existing scratch directory name to the one shared exclusion owner.
All 21 input/monitor contracts pass, preserving source mutation detection and
explicit target/output drift detection. No assertion is weakened and no
transient source edit is promoted to valid proof. See
`runner03-output-drift-red.log` and `runner03-output-drift-green.log`.

### API-03 final-verification interrupt: mention focus state

The frozen production build `cc72cfc6b745998360780ce37c6d72988c07e0513f224564dfdee7a0beb5684b` fails the existing `arrow keys select mentions atomically from both sides` assertion twice: model point, DOM point, editable focus and void-shell identity pass, but the selected mention lacks its highlight. The earlier serving snapshot passes the same assertion. Current source hashes still produce the frozen build input digest, so source drift does not explain this failure.

Failure kind: `final-verification`. Base acceptance: the original provider corpus and matched runtime contract remain evidence for their predicates, but they do not accept final focus behavior. Diagnostic: unchanged-bytes focus-state divergence; `focus-state-trace: native + dom-api + react-context` records native focus and `api.dom.isFocused()` true while the compiled provider's `useEditorFocused()` remains false. The focused inline-void regression reproduces this distinction without an added synthetic focus event. `mentions-frozen-diagnostic.json`, the original browser artifacts and both exact logs preserve that red. The missed branch updates imperative focus when the root is already active without notifying React's focus subscription; waiting for another model commit is not a valid focus owner.

Run `regression repair audit-runtime-owner-consolidation: mention selection paint after public focus`. The current shared Regression owner already contains the corresponding native/DOM/React phase requirement and its executable rejecting fixture; verify that exact method repair and regenerated parity. Current shared work is repairing this same focus owner, so this audit will inspect and verify its final source before touching the overlapping implementation. Required acceptance remains the focused compiled-provider case, both per-view focus forms, the original browser assertion and complete source-bound browser matrix. No final API-03 acceptance is claimed while that failure remains.

The shared hook repair retains the established editable focus events and also subscribes to the existing view-state publisher, which is notified by `setEditorFocused`. Both unsubscribe together; no timer or document listener is added. The inline-void test and both existing per-view provider forms now compare native focus, DOM focus and React context without synthetic focus events: all 62 cases pass (`mentions-all-view-focus-proof.log`). The matched production probe still passes identical work/render counts, ordered callbacks and complete teardown through four 10,000-block roots; its receipt now also fingerprints the changed focus hook.

The exact Regression validator suite passes 69 tests, including rejection of a failed focus-state packet without the native/DOM/React trace (`mentions-regression-method-proof.log`). `pnpm install` succeeds (`mentions-workflow-mirrors.log`); source and generated methodology/validator bytes match. Agent Native Reviewer confirms the existing Regression route leads to the canonical rule, compiled-provider and browser oracles, rejecting validator, generated mirror and this same plan. No new wrapper, goal or cross-project update is introduced. The final matrix below supplies native browser acceptance against the rebuilt target.

The subsequent full root check exposes the same output-classification defect for `packages/platejs/.turbo/turbo-build.log`. Extend RUNNER-03 to that concrete producer and expand the existing fixture to all nine declared ignored directory names. It fails deterministically on `.turbo` before the one-owner correction. The complete monitor suite passes afterward, including source edits, explicit target/output changes and manifest invalidation (`runner03-all-output-roots-red.log`, `runner03-all-output-roots-green.log`). The interrupted root run is preserved in `closure-root-focus-replay.log`; it is not reported as passing.

### TEST-07: graph verification owns its temporary source

The full matrix repeatedly stops on an update to the actual `packages/plitejs/src/diff` directory. The source is the Turbo graph test owner: its uncached-partition case writes one probe, and its hash-closure case creates/renames probes across Plite diff, Plite core and Plate static. The browser monitor is correct to reject those writes. Adjacent alias and packed-artifact fixtures already derive their writable roots from `mkdtemp`; the mutation pattern is confined to these two graph cases.

Both cases now use a temporary project containing the actual dry graph's input files, workspace manifests and Turbo configuration. Dependencies are referenced through a directory link. Before any probe, every source-task hash must exactly match the current checkout; this retains the actual graph instead of substituting a synthetic task model. Empty Git metadata is required for Turbo to include the cross-package root inputs. The temporary fixture owns all mutations and one teardown; the original miss, edit, rename, reverse-dependency and restoration assertions remain. No product workspace is switched or published.

`test07-source-isolation-red.log` runs the original four tests successfully while the independent production-source monitor detects the mutation. `test07-source-isolation-final.log` runs all four final tests successfully with `productionSourceChange: null`, including exact initial hash equality. The real suite remains in its existing slow lane. The full root and matrix replay below verify integration after this owner repair.

## Current proof and remaining obligations

All receipt paths below are relative to this plan's evidence directory. Historical red logs above remain diagnostic records. This table identifies the latest applicable proof.

| Gate | Result and receipt |
| --- | --- |
| Full root `pnpm check` | Passed after TEST-07: formatting, lint, typed lint, source-first types and complete root test lanes; `closure-root-fixtures-isolated.log`. Later RUNNER-04 and topology-test changes pass all 22 affected build/input cases plus formatting separately in `closure-current-build-input-contracts.log`, `closure-current-build-input-format.log`, `closure-latest-input-format.log`. |
| Plite package types, tests and runner contracts | Passed in the same checkout's strict run. Copied log and six checked source fingerprints: `closure-shared-current-strict.log`, `closure-shared-current-strict-receipt.json`. TEST-07's later tooling change is covered by the final root check and independent source-mutation monitor. |
| Packed packages | Passed all four packages, 80 subpaths, 75 native Node imports, 41 headless entries, one SSR entry, 38 optional-peer closures, declarations and DCE; `closure-final-packed.log`. |
| Website, docs and generators | Normal website typecheck, editor/API generation, registry generation, docs links and 309 code-contract inputs pass; `closure-current-www.log`, `closure-current-editor.log`, `closure-current-api-reference.log`, `closure-current-registry.log`, `closure-current-docs.log`, `closure-current-doc-code.log`, `closure-current-plite-docs.log`. |
| Native focus and provider lifetime | All 62 focused cases pass, including imperative focus on an already-active root. Narrow live mention highlight, native caret and DOM/context focus pass; `mentions-all-view-focus-proof.log`, `mentions-live-narrow-proof.json`. |
| Matched runtime contract | Final provider and focus-hook fingerprints pass equal work/render counts, ordered callbacks and complete teardown through four 10,000-block roots; `closure-runtime-focus-matched.log`, `runtime-production-acceptance.json`. No latency gain is claimed. |
| Matched diff contract | Final source passes exact reconstruction, bounded work and same-process comparison. At 10,000 siblings, original runs take 21.7/24.7 s and current runs 20.5/34.8 ms, with 100,000,000 versus 10,000 equality comparisons; `closure-diff-matched.log`, `diff-production-acceptance.json`. The claim is confined to this workload. |
| Browser matrix | Passed against the corrected build owner: Chromium 741 pass / 8 skip; Firefox 633 / 116; mobile viewport 346 / 403; WebKit 654 / 95; mobile WebKit 2 / 0. Every project's exact coverage check passes. `closure-browser-current-build-owner.log` and the five `closure-matrix-*.json` files preserve selected test IDs, configured exclusions, skip reasons and project fingerprints. |
| Portable template instructions | Actual standalone installation and preserved unrelated content pass; `preset-install-receipt.json`. The temporary fixture is removed; `preset-fixture-cleanup.json`. |

The served application fingerprint is `b2d34faa65d04ea2b79023c3d4de3237864d859f85a92815333402adf6137fce`, with input digest `b87d8d466a01caa4a10fa350bd7e7eb9cba0bd93048878fa89dd32a3c693bd34`. The runner binds each batch and resumable receipt to source, harness, browser, selection and target identities. Chromium and Firefox completed before a concurrent build temporarily removed the compiled `@platejs/test` harness during WebKit startup. The original failure remains recorded; a matching-fingerprint resume preserves completed batches and replays the missing ones. No assertion or integrity check is bypassed.

The final shared change to the monitor's topology test uses the production `browserRunEntries` and its existing compiled-output metadata exclusion. It retains the zero-watcher and stable-checkpoint assertions against the actual run graph. Independent source-mutation, target-output, manifest and digest cases remain unchanged; all 21 cases pass. This test-only edit does not change served application inputs or the browser runner fingerprint.

RUNNER-04 explains the repeated pretest builds: the package exports `dist/index.js` and `dist/index.d.ts`, while freshness requires absent `dist/core/index` files. The paired app-build owner derives existing HTML paths from the canonical example registry and passes its live freshness inspection; no second instance of this output mismatch is found. A temporary copy with only the original two harness paths restored fails the existing behavioral test (`runner04-original-paths-red.log`). The corrected owner and all monitor contracts pass 22 cases (`closure-current-build-input-contracts.log`), and the actual pretest keeps the existing harness. Source mutation during the preceding matrix correctly invalidates that run; the final replay uses this corrected owner throughout.

`closure-reconciliation-receipt.json` binds 18 passing command logs and all five successful project summaries by hash. The final structural snapshot contains 3,778 source files with no byte drift at reconciliation. `closure-final-target-freshness.json` verifies the live served manifest against the recorded build and confirms both application and browser-harness freshness. The configured matrix contains 2,998 selected test instances: 2,376 pass and 622 have explicit skip outcomes; there are no missing, duplicate or unexpected test IDs.

API-01 and RUNTIME-03 retain their concrete unresolved contracts above. The API cut still requires one executable owner for nominal inference, shared weak resource identity and state/snapshot lowering. The external-text checkpoint remains a measured budget failure with later source drift; it cannot certify the final bytes. Compatibility is not a reason to keep the former, and shared-host load is not an explanation for the latter. No speculative replacement, relaxed budget, raw-device certification, hosted CI result or publication claim is retained.
