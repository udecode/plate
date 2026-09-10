# Plate slop audit — 2026-09-05

The highest-value cuts are in verification tooling. A prop-style check consumes roughly a gigabyte of memory; type-aware lint still requests every package build; two test runners duplicate almost their entire implementation. Meanwhile, some green tests exercise an empty list or repeat an ASCII fixture under Unicode labels.

Scope: `/Users/zbeyens/git/plate-2`. This is an audit with local measurements. No product, test, or workflow repairs were applied. The target is less work per edit and more trustworthy proof.

**1. Remove the whole-repository prop-style audit from default lint. High DX value; measured.**

[`package.json:77`](/Users/zbeyens/git/plate-2/package.json:77) runs `check-inline-component-props.mjs` after Ultracite on every lint invocation. The [checker](/Users/zbeyens/git/plate-2/tooling/scripts/check-inline-component-props.mjs:657) parses every selected source file into an AST and retains all ASTs before tracing imports and public exports. The TSX filter comes **after** parsing. Its [test](/Users/zbeyens/git/plate-2/tooling/scripts/check-inline-component-props.test.mjs:57) explicitly requires archived TSX to participate.

One bounded run inspected **3,830 files / 23.3 MB of source**, including 241 documentation files and 91 donor files. It took **3.587 seconds**, peaked at **1,058,045,952 bytes RSS**, retained 20 candidate prop contracts, and found zero issues. Of those files, 1,965 were not TSX. Non-TSX imports can matter to export tracing; that dependency is precisely why this style check became a whole-program operation.

Cut its invocation from default lint. Keep the inline-props convention; a full dependency analysis to enforce that convention does not earn a place in every edit loop. If the existing audit remains useful for deliberate architecture reviews, run it explicitly. Ordinary lint stays with Oxlint/Ultracite. Do not build another general analysis engine to replace this one. Proof after a repair: compare lint's executed commands and elapsed time, and verify any retained rule on live components and real exported contracts. This cut removes one independent scanner from the normal command path.

**2. Remove blanket package builds from type-aware lint. High DX/CI value; execution graph confirmed, savings unmeasured.**

[`lint-type-aware.mjs:15`](/Users/zbeyens/git/plate-2/tooling/scripts/lint-type-aware.mjs:15) unconditionally calls `pnpm g:build` before Oxlint. [`package.json:63`](/Users/zbeyens/git/plate-2/package.json:63) builds all packages and retries the entire command at concurrency one after any failure. The [test](/Users/zbeyens/git/plate-2/tooling/scripts/plite-source-aliases.test.mjs:144) requires the exact `g:build` step and forbids a `--tsconfig` argument. It protects the expensive implementation rather than checking that type-aware lint resolves workspace types correctly.

The dry plan contains four build tasks: Plite → Plate → CLI/test helpers. Cache hits can avoid compilation, but the dependency on release artifacts remains. This also corrects the earlier DX summary: source-first **typecheck** was improved; the complete `pnpm check` path still includes this build prerequisite.

Use the existing [workspace source-entry owner](/Users/zbeyens/git/plate-2/config/workspace-source-entries.mjs) for lint resolution, as the [source typecheck runner](/Users/zbeyens/git/plate-2/tooling/scripts/typecheck-package-source.mjs:38) already does for TypeScript. Validate the installed Oxlint resolver before removing its build prerequisite; TypeScript success alone does not prove Oxlint resolution. Keep release-artifact builds in artifact checks. Replace the step-lock test with a workspace import fixture whose expected type diagnostic survives without `dist`. Remove the unconditional serial retry; deterministic compiler errors do not improve at concurrency one. No cold build was run to manufacture a savings estimate.

**3. Merge the fast/slow runners and stop paying full discovery for an exact file. High focused-DX value; measured.**

[`test-fast.mjs`](/Users/zbeyens/git/plate-2/tooling/scripts/test-fast.mjs) has 332 lines; [`test-slow.mjs`](/Users/zbeyens/git/plate-2/tooling/scripts/test-slow.mjs) has 335. **319 lines match exactly.** Both own argument parsing, import scanning for module mocks, process isolation, watch/bail handling, and JUnit merging. Fast/slow patterns and explicit-path treatment account for most differences. The [full glob](/Users/zbeyens/git/plate-2/tooling/scripts/test-fast.mjs:81) runs before applying an exact-file filter.

Use one runner implementation with the existing [suite definitions](/Users/zbeyens/git/plate-2/tooling/config/test-suites.mjs) as data. For exact files, validate suite membership directly and inspect only their relevant imports. Keep module-mock isolation and the slow runner's explicit `./` path semantics. Route compatible Node contracts through Node, without the root Happy DOM preload. Preserve Bun for tests that need Bun, JSX, aliases, or DOM behavior. This replaces two implementations with one; it does not justify another runner framework.

The same two [suite-routing tests](/Users/zbeyens/git/plate-2/tooling/scripts/test-suite-routing.test.mjs) passed in every measured invocation:

| Invocation | Median wall time, five measured runs |
| --- | ---: |
| `node --test tooling/scripts/test-suite-routing.test.mjs` | 71.7 ms |
| `bun test ./tooling/scripts/test-suite-routing.test.mjs` | 178.9 ms |
| `bun tooling/scripts/test-fast.mjs tooling/scripts/test-suite-routing.test.mjs` | 302.0 ms |

The wrapper adds **123.1 ms** relative to direct Bun for this file. Node saves **230.3 ms** relative to the wrapper. The Bun–Node difference includes runtime and preload costs; it does not isolate Happy DOM's cost. Merging duplicate code alone is a maintenance improvement. Proof after a repair: preserve selected files, mock isolation, watch, bail, JUnit results, and suite exclusions; repeat the same alternating measurements. Do not multiply this startup cost by every test in a batched CI process.

**4. Delete the empty adopter subsystem and its vacuous tests. Certain structural waste.**

[`check-plite.mjs:64`](/Users/zbeyens/git/plate-2/tooling/scripts/check-plite.mjs:64) declares `plateAdopterPackages = Object.freeze([])`. It still constructs adopter indexes, tracks two affected sets, branches on adopter runtime impact, and returns two adopter result arrays. None can select a package. The canonical package graph already contains the consolidated consumers.

The [“reviewed Plate adopters” test](/Users/zbeyens/git/plate-2/tooling/scripts/check-plite.test.mjs:295) puts every assertion inside a loop over that empty array. Exact replay reports **one passing test with zero assertions executed by its callback**. Other tests compare against `adopterNames`, derived from the same empty list. The “fans out to all adopters” name therefore overstates what it proves, although that test also contains useful current package assertions.

Delete the adopter list, indexes, branches, empty result fields, vacuous test, and assertions about retired adopter command names. Keep the current package/dependent/browser selection assertions, including useful assertions in mixed tests. Proof: the existing affected-plan cases must still select the same real package and browser work. One current dependency model should own selection.

**5. Replace the three fake DOCX character cases with actual characters. High test-trust value.**

The [Unicode/CJK/emoji tests](/Users/zbeyens/git/plate-2/packages/platejs/src/docx/export/lib/internal/html-to-docx.slow.ts:279) all execute this same body:

```ts
const html = '<p>Hello World</p>';
const result = await htmlToDocxBlob(html);
const zip = await loadZipFromBlob(result);
const docXml = await zip.file('word/document.xml')!.async('string');
expect(docXml).toContain('Hello World');
```

All three pass locally. None tests the character class in its title. The file already has a basic content assertion, so these rows add false confidence and repeated ZIP conversion.

Keep character coverage, but supply actual accented text, CJK text, and supplementary-plane emoji in a small parameterized case. Assert the resulting document text. The converter owns this behavior; do not add a source-scanning test to enforce fixture spelling. This repair improves coverage rather than claiming substantial suite savings.

**6. Delete five redundant test cases across four files. Confirmed identical behavior and setup.**

| Owner | Repeated cases | Cut |
| --- | --- | --- |
| [Document preparation](/Users/zbeyens/git/plate-2/packages/platejs/src/internal/plugin/pipePrepareDocument.spec.tsx:44) | Lines 45, 60, 75 create the same editor with the same initial value and assert the same result. The enclosing descriptions add no setup. | Keep one; delete two. The “already initialized” description does not create that state. |
| [Mention serialization](/Users/zbeyens/git/plate-2/packages/platejs/src/markdown/lib/serializer/serializeMention.spec.ts:60) | Lines 60 and 84 use identical `ref`/`label` input and output. The second title still talks about `key`/`value`. | Keep one accurately named case. |
| [Suggestion rejection](/Users/zbeyens/git/plate-2/packages/platejs/src/features/suggestion/lib/BaseSuggestionPlugin.spec.tsx:2528) | Lines 2528 and 2563 reject the same line-break insert suggestion and expect the same merged paragraph. | Keep one. |
| [Markdown paragraph integration](/Users/zbeyens/git/plate-2/apps/www/src/__tests__/package-integration/markdown-deserializer/deserializeMdParagraphs.spec.tsx:86) | Lines 86 and 108 have identical titles, fixtures, and assertions. | Keep one. |

This removes five repeated executions without losing a distinct input/state/output case. The complete document-preparation and mention files passed: **19 tests, zero failures**. Suggestion and paragraph duplicates were inspected statically, including their enclosing setup; they were not replayed during this audit. After deletion, run the affected files. Do not replace duplicates with tests asserting that the duplicates are absent.

**7. Cut source-spelling tests; retain executable contracts. High maintenance and proof-quality value.**

[`core-benchmark-scripts-contract.ts`](/Users/zbeyens/git/plate-2/packages/plitejs/test/core-benchmark-scripts-contract.ts:487) contains 1,177 lines and 347 detected regex/string assertions. One test claims a history benchmark stays subscribed by matching five strings, including `subscribeSnapshot(editor)` and `tx.history.undo()`. It does not execute that history lane. Nearby assertions freeze local function names, numeric defaults, and output spelling. Some other tests in the file execute summary functions and check finite values; retain those behaviors.

[`react/surface-contract.tsx`](/Users/zbeyens/git/plate-2/packages/plitejs/test/react/surface-contract.tsx:1330) mixes useful runtime/export checks with assertions that retired private type names never appear. At [line 1386](/Users/zbeyens/git/plate-2/packages/plitejs/test/react/surface-contract.tsx:1386), a test requires the prose `Intentionally object-only` and a particular experimental-status comment inside implementation files. Moving or rewriting a comment can fail a runtime contract suite.

Delete historical absence checks and private spelling locks. Express public type laws with compiling positive/negative consumer fixtures; express behavior through the owning runtime. For benchmark correctness, exercise a tiny workload and validate its result/receipt with the existing benchmark infrastructure. These examples do not justify deleting both files wholesale or running full browser benchmarks on every edit.

Apply the same criterion to the [CI test added during the preceding work](/Users/zbeyens/git/plate-2/tooling/scripts/ci-workflow.test.mjs:22): affected-job and skipped-aggregation dependencies are valuable; pinning exact cache-action versions, shard counts, and command spelling in scattered regexes duplicates configuration. Keep deliberate policy assertions where policy is the actual contract. The gain here is fewer synchronized edits and stronger proof, not an established seconds-saved figure.

**8. Delete `callOrReturn`, its two tests, and its orphaned conditional type. Certain private dead code.**

[`callOrReturn.ts`](/Users/zbeyens/git/plate-2/packages/platejs/src/internal/utils/callOrReturn.ts:11) has no current production caller or public re-export in the inspected workspace. Its only importer is its [own test](/Users/zbeyens/git/plate-2/packages/platejs/src/internal/utils/callOrReturn.spec.ts). [`MaybeReturnType`](/Users/zbeyens/git/plate-2/packages/platejs/src/internal/types.ts:1) is only used by this helper. The helper's JSDoc even documents a `context` parameter that does not exist.

Delete that code and the two tests that keep it looking alive. Retain the other types in `internal/types.ts`. Also retain `isFunction`: it has real callers in [plugin definition](/Users/zbeyens/git/plate-2/packages/platejs/src/lib/plugin/defineBasePlugin.ts:323). Proof after deletion is a source reference check and the affected package typecheck, with barrel generation if required. No replacement helper is needed.

**9. Inline forwarding wrappers with no distinct contract. Small locality improvement.**

[`mdastToSlate.ts:10`](/Users/zbeyens/git/plate-2/packages/platejs/src/markdown/lib/deserializer/mdastToSlate.ts:10) forwards unchanged arguments to `buildSlateRoot`, a private function in the same file with one caller. Its `Root` and `MdRoot` annotations name the same upstream type. Put the implementation directly in the exported function, preserving its signature. One definition should explain the operation.

[`compilePlateModel.ts:95`](/Users/zbeyens/git/plate-2/packages/platejs/src/internal/plugin/compilePlateModel.ts:95) adds `getPlateOwner(editor) => getPlateRuntimeOwner(editor)`. Use the imported owner function directly, or an import alias if the local name improves readability. No runtime function is needed to rename it. Existing Markdown behavior and model/type checks are sufficient proof. No measurable editor speed benefit is claimed.

**10. Consolidate eight profiler duration helpers under the existing profiler owner. Maintenance value; no demonstrated speed win.**

The scan found two groups of four identical duration wrappers: [mutation profiling](/Users/zbeyens/git/plate-2/packages/plitejs/src/react/editable/mutation-profiler.ts:5), before-input, DOM input, and the Plite component; then [caret profiling](/Users/zbeyens/git/plate-2/packages/plitejs/src/react/editable/caret-engine.ts:171), root mouse-down, keyboard, and vertical selection. Each checks the same global profiler, calls a callback, and records duration in `finally`. The two groups differ in their clock helper.

Move duration recording into [the existing render profiler](/Users/zbeyens/git/plate-2/packages/plitejs/src/react/render-profiler.ts), preserving callback returns, thrown errors, event names, disabled behavior, and the required clock behavior. Delete the local copies instead of layering another helper over them. Full paths and fingerprints are in the evidence.

A disabled-profiler diagnostic, eight alternating rounds of one million calls after warmup, produced medians of **3.398 ms direct** and **3.416 ms wrapped**. That tiny difference is not useful performance evidence. JIT inlining can erase synthetic overhead, and this does not measure browser allocations or native editor latency. Keep useful instrumentation; do not sell this consolidation as a typing-speed fix.

**11. Consolidate copied E2E error recorders without weakening their policy. Maintenance value.**

Six tests copy the same 20-line `recordRuntimeErrors` implementation, including [homepage drag](/Users/zbeyens/git/plate-2/tooling/e2e/homepage-dnd.test.ts:3) and [floating toolbar](/Users/zbeyens/git/plate-2/tooling/e2e/floating-toolbar.test.ts:6). That is 100 repeated lines beyond one implementation. Font-size and table-tab navigation contain another identical pair with slightly different bodies.

The [shared Playwright recorder](/Users/zbeyens/git/plate-2/packages/test/src/playwright/runtime-errors.ts:35) already owns listener setup and cleanup, but its default console filtering and ignored errors differ from the strict local copies. Reuse that owner only with an explicit policy that preserves each caller's error coverage. A blind replacement with its current defaults would weaken these tests. Prove page-error capture, strict console capture, approved filtering, and listener cleanup, then replay affected browser tests. Do not extract each copied fixture into a separate generic utility.

**Candidates rejected or held back.**

- [`compileEditor`](/Users/zbeyens/git/plate-2/packages/platejs/src/compiler/compileEditor.ts:15) is a thin public compiler entrypoint with a deliberate export/signature boundary. A forwarding-body match does not justify deleting that boundary.
- [`createStaticString`](/Users/zbeyens/git/plate-2/packages/platejs/src/static/utils/createStaticString.ts:9) preserves the zero-width text marker. Its small size does not make its behavior or tests redundant.
- [`selection-snapshots.ts`](/Users/zbeyens/git/plate-2/packages/test/src/playwright/selection-snapshots.ts:436) repeats helpers inside browser-evaluated closures. Those closures must work in a different execution context; ordinary module extraction is not a drop-in fix.
- [`generate.test.ts`](/Users/zbeyens/git/plate-2/packages/cli/test/generate.test.ts:80) contains many output-string assertions, but generated source is a real output contract, and the suite also compiles generated artifacts. Raw assertion counts are not a deletion criterion.
- Base/React `omitPluginContext` implementations and their tests look identical but expose different generic constraints through separate public exports. Consolidation remains a candidate; this audit did not prove that consumer inference remains equivalent.
- Identical tiny comparators, isolated fixture factories, and repeated callbacks with different captured state do not automatically warrant a shared utility. Do not trade visible local code for an extra dependency hop without a real ownership benefit.

**Recommended implementation order.**

1. Cut the default prop-style scan and remove lint's release-build dependency after proving source resolution.
2. Merge runner ownership, add exact-file selection, and route compatible tooling contracts without DOM setup.
3. Delete empty adopter machinery and private dead helpers; repair false DOCX coverage and remove confirmed duplicate cases.
4. Remove the identified source-spelling checks, preserving the actual type, runtime, benchmark, and CI contracts.
5. Consolidate profiler and E2E helpers, then inline the low-value forwarding functions during nearby work.

These changes need no new cleanup framework, broad coverage expansion, or quiet-machine requirement. Workflow-doctrine edits, if required by an implementation, belong in the existing reusable workflow source and project adaptation; this audit has not changed them.

**Coverage and receipts.**

The automated pass inventoried **3,559 selected authored JS/TS files**, approximately 834,485 lines, across packages, apps, tooling, benchmarks, config, and executable agent rules. Its test heuristic includes fixtures/helpers: 1,918 files and 8,690 direct test-call matches are inventory signals, not counts of independent behaviors. It found 339 duplicate-body groups and 259 forwarding-function candidates. Those numbers are **not** confirmed defect totals. Manual inspection produced the 11 findings above and the rejected candidates.

The scan excludes installed dependencies, generated output, templates, donor directories, and most non-code documentation. The separate lint inventory includes the docs/donor code that the live checker actually scans. Root scripts and relevant workflow/configuration were inspected separately. No full CI run, browser matrix, coverage expansion, or complete manual review of every inventoried function was performed. Three external-text benchmark files changed after the initial inventory; they are listed in the receipt and support none of the confirmed findings.

Measurements ran on the active machine without asking other applications to stop. Runner measurements alternate order, discard one warmup round, and retain every exit code and output. They used Node 22.22.1 and Bun 1.3.12. The prop checker has one timed sample; its memory and elapsed time describe that run, not a cross-machine guarantee. Source fingerprints accompany reviewed inputs and measurements.

- [AST inventory and candidate groups](/Users/zbeyens/git/plate-2/docs/analysis/artifacts/2026-09-05-slop-audit/scan.json)
- [Reviewed inputs, runner similarity, and inventory drift](/Users/zbeyens/git/plate-2/docs/analysis/artifacts/2026-09-05-slop-audit/review-evidence.json)
- [Prop-checker measurement](/Users/zbeyens/git/plate-2/docs/analysis/artifacts/2026-09-05-slop-audit/inline-props-measurement.json) and [input inventory](/Users/zbeyens/git/plate-2/docs/analysis/artifacts/2026-09-05-slop-audit/inline-props-inventory.json)
- [Runner measurements and commands](/Users/zbeyens/git/plate-2/docs/analysis/artifacts/2026-09-05-slop-audit/runner-measurements.json)
- [Package build dry plan](/Users/zbeyens/git/plate-2/docs/analysis/artifacts/2026-09-05-slop-audit/build-dry-plan.json)
- [Focused test results](/Users/zbeyens/git/plate-2/docs/analysis/artifacts/2026-09-05-slop-audit/focused-tests.json)
- [Disabled-profiler diagnostic](/Users/zbeyens/git/plate-2/docs/analysis/artifacts/2026-09-05-slop-audit/profiler-measurements.json)

The scripts beside these receipts are one-off audit reproduction artifacts. They are not wired into development or CI.
