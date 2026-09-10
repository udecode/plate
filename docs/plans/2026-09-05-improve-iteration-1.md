# Improve iteration 1

Authority: user invoked `$improve` with no argument. One complete iteration:
review all applicable lanes, rank the strongest opportunities, implement a
coherent high-value batch, prove it, and reconcile expanded audits. Current
project only; local implementation and rule repairs are authorized. No native
goal, schedule, other checkout, commit, push, or publication is requested.
Branch: `next`; structured Autoreview is excluded by current branch policy.

## Current state

- [x] Read the Improve contract, Task workflow and autonomous routing.
- [x] Inventory effective rules and authored owners for all eight lanes.
- [x] Reproduce and classify the outstanding Suggestion failures.
- [x] Rank architecture, correctness, runtime, DX/CI, tests, docs, registry, and workflow findings.
- [x] Implement the selected fixture/proof and doctrine repair batch after target challenge.
- [x] Complete affected proof and reconcile full-area audit obligations, with wider semantic reviews explicitly pending.

Rule and source inventories live in the adjacent
`artifacts/2026-09-05-improve-iteration-1/` directory. Status is explicit;
inventory or sampled inspection does not imply a whole area passed.

## Findings and expanded audits

| Priority | Finding | Evidence / consequence | Next action |
| --- | --- | --- | --- |
| Fixed | Suggestion fixtures compiled into React elements | The factory pragma did not override the package's automatic JSX runtime. Missing fixture children/selection caused 32 false failures. | Explicit classic runtime; all 83 Suggestion cases pass. Expanded to the entire custom-JSX inventory. |
| Fixed | Mandatory VISION routed to retired skills and added an approval gate | Root/detail doctrine contradicted current Task/Benchmark ownership and described a removed VISION skill. | Current routes and active-request authority restored in the canonical owners; mirrors verified. |
| Fixed | DOCX importer fixture path stopped two directories too shallow | Five exact cases failed to open their shared DOCX inputs. | Correct file-relative URL, single-use reader removed; importer and cleaner cases pass. |
| Open | Registry path subscriptions used only by event callbacks | `code-block.tsx:CodeBlockCopyButton` and `code-drawing.tsx:CodeDrawingElement` subscribe without render-time path use. | Next runtime batch: compare event-time path resolution against current subscriptions, including sibling moves and actual copy/edit behavior. |

## Decision trail

The [decision log](artifacts/2026-09-05-improve-iteration-1/decisions.tsv)
consolidates the source-backed decisions at closeout. Its timestamps record
when the log was assembled, not when the underlying checks ran.

The requested trail self-audit checked the original five rows against this
run's recorded actions, current sources, original backups and saved outputs.
All evidence pointers resolved and all 202 checkpoint records matched before
appending the review. The 450-line reduction was recalculated as 211 + 161 + 78.
The log adds the missing docs/rules decision and corrects an earlier summary:
one DOCX reader path was fixed for five importer cases. No independent reviewer
ran. The original fingerprints remain the implementation checkpoint; later
append-only log entries intentionally change the log's hash.

- Default budget is one iteration, with no invented time limit. Preserve prior slop-audit and slop-cut receipts as historical evidence.
- The full-area rules audit includes code compliance and stale rule ownership. A current rule is evidence to evaluate; its existence does not make its cost or architecture defensible.
- Initial failure replay uses the existing Suggestion behavior suite. No tests will be deleted to hide a correctness failure.

## Results

One improvement iteration completed. The selected batch is verified locally;
this is not a complete semantic certification of the repository.

- Fifty Plate hyperscript files explicitly select their JSX runtime. The
  existing `@platejs/test` fixture case also exercises actual TSX syntax.
- `@platejs/test` reuses `platejs/testing` and retains its Plate-specific editor
  constructor. Two implementation files are deleted; the dependency graph and
  generated TypeScript/Turbo files name the surviving owner.
- Eight identical DOM rectangle builders become one file-local helper. Four
  duplicate behavior cases are removed while their identical contracts remain
  at the retained owner. Six other identical-body groups are kept because their
  outer fixtures, policy settings, or implementations differ.
- These three consolidations remove **450 net lines**: 211 fixture
  implementation lines, 161 geometry-fixture lines and 78 duplicate-test/setup
  lines. This count excludes the JSX declarations, docs/rule edits, generated
  files and the separate DOCX reader simplification.
- Four public docs examples and the Testing source teach the required runtime.
  VISION and Sync Vision use current Task/Improve/Benchmark routing. No shared
  Dotai source changed; these are local adaptations with no downstream sync
  requirement.

### Verification

All logs below are in `artifacts/2026-09-05-improve-iteration-1/`.
`final-fingerprints.json` records the final source checkpoint, relevant
configuration and proof-artifact hashes; it does not certify a packed release.

| Proof | Result | Receipt |
| --- | --- | --- |
| Suggestion exact reproduction | 51 pass / 32 fail before; 83 pass / 0 fail after | `suggestion-baseline.log`, `suggestion-classic.log` |
| Expanded fast hyperscript reproduction | 305 pass / 274 fail and one loading error before; 587 pass / 0 fail after | `hyperscript-baseline.log`, `hyperscript-current.log` |
| Final selected Plate fast/slow tests, package cwd | 890 pass, 0 fail, 53 files | `plate-package-final.log` |
| Same final tests, repository cwd | 890 pass, 0 fail, same 53 files | `plate-root-final.log` |
| Shared fixture and DOM contracts | 44 pass, 0 fail | `fixtures-final.log` |
| DOCX importer and cleaner fixtures | 10 pass, 0 fail | `docx-final.log` |
| Entrypoint graph/tooling contracts | 38 pass, 0 fail | `entrypoint-contracts.log` |
| Test root source types and public API contracts | pass | `fixture-types.log`, `public-types.log` |
| Plain Node source consumer, without DOM globals | fixture, selection and DataTransfer behavior pass | `headless.log`, `headless-source-consumer.ts` |
| Public docs API/source/parity | pass | `docs-check.log` |
| Registry source/dependency checks | pass | `registry-source.log` |
| Scoped format/lint and whitespace | pass | `lint-final.log`; `git diff --check` on the changed sources |
| Generated entrypoint graph | current | `entrypoints-final.log` |
| Agent mirrors and doctrine structure | 72/72 bodies match; resources exact; v154 valid | `mirrors.json`, `doctrine-validation.json` |

Counts overlap across reruns; they are not added together. Final Plate runs
took about 10 seconds each. The before/after workloads execute different
numbers of assertions because fixture repair restores real inputs, so those
durations do not establish a speedup. No editor runtime performance change or
packed release claim is made. Full root `check` and browser/device matrices
were not run for this library-test/workflow batch.

### Coverage and remaining work

`inventory.json` records the initial authored denominator;
`rule-coverage.json` records all 36 owned rule families and 56 installed methods
with their scope and status. Generated mirrors are not separate rule owners.

| Expanded area | Work completed | What remains |
| --- | --- | --- |
| Custom JSX runtime | 1,103 matching source files inventoried; all missing-runtime Plate JSX consumers repaired. Plite corpus and app test configurations reviewed; registry value files already declare classic mode. | No open instance of the confirmed Plate compilation pattern. No claim that every fixture's content is semantically correct. |
| Identical test bodies | 1,918 test/fixture files included in the source scan; all ten exact-body duplicate groups inspected in their enclosing setup. | Four duplicates removed, six justified. Other kinds of weak or redundant tests still require contract review. |
| Source architecture | 3,555 files parsed, with zero parse errors; 320 duplication groups and 257 forwarding candidates recorded. Selected fixture owners consolidated. | Most structural candidates remain unclassified; identical spelling is not enough to delete them. In particular, Base/React `omitPluginContext` has duplicate implementation but distinct typed entrypoints to review before merging. |
| Public documentation | All 309 `content/docs` MDX pages passed owned source/API/parity checks and prose candidate discovery. All four custom-JSX setup examples repaired. | Full semantic API/example and prose review remains open. The 473 prose flags are candidates, not confirmed violations or automatic rewrite instructions. |
| Registry | All 632 authored registry files inventoried; owned source/dependency check passes. All 19 searched shape candidates and 11 path subscriptions inspected. Named types found here describe primitive adapters, state, hook inputs, or test/element contracts rather than local component signatures. | Two event-only subscriptions need the runtime probe described below. Wider component-family, accessibility, optional-plugin and resource-lifetime review remains open. |
| Agent rules | Global/project/nested instructions inventoried; stale-route/authority pattern swept across current doctrine and owned rules. All 72 generated rule mirrors checked. | Full consumer compliance with every applicable domain/principle leaf remains open; source and mirror consistency do not prove behavioral compliance. |
| Runtime and CI performance | Current scripts and all 49 benchmark targets inventoried, including pagination, history, input, collaboration and large-document families. Confirmed fixture/discovery friction repaired. | Existing mount budgets and all fresh runtime comparisons remain open. Historical failures are not waived because the host is busy. |

Next ranked work:

1. Measure and repair the two event-only path subscriptions. Compare the same
   mounted cohorts before/after; prove copying after a preceding block moves,
   drawing edits/deletion, and unchanged focus/selection. Use the current
   `react-locality`, `react-text-flow` and actual registry demo owners. Do not
   claim route-wide performance from a copy-button render count.
2. Continue the semantic documentation/registry/rule audit from the recorded
   denominator. Prioritize source/API truth and optional-plugin/lifetime
   behavior over prose cosmetics; classify each candidate before editing.
3. Review remaining duplicate owners and public API candidates through Best API
   and the owning layer plan when their public shape changes. The whole test
   package stays because React/browser/proof subpaths have independent jobs.

The run stops at the requested default of one completed improvement iteration.
These remaining audits are recorded work, not external blockers or a claim of
saturation. No commit, push, PR, publication or schedule was created.

## Ranked batch

| Rank | Lane / exact owner | Decision and evidence | Proof / remaining scope |
| --- | --- | --- | --- |
| 1 | Tests, correctness and DX: Plate TSX fixtures | Repair the JSX runtime at each hyperscript file. The package uses automatic JSX, while those files specify only a custom factory. Switching Suggestion to classic changes 51/32 to 83/0; the expanded 45-file run changes 305/274 plus one loading error to 587/0. Keep every behavioral assertion. | Exact package runs; fast and slow fixture consumers; root and package invocation. |
| 2 | Architecture: `packages/test/src/{jsx,createDataTransfer}.ts` | Delete copied fixture implementations and expose their existing owner through `platejs/testing`. Keep only the Plate editor-construction adapter, whose initialization is a distinct job. Public names and behavior stay intact. | Existing fixture contracts, headless dependency closure, source types and affected package consumers. |
| 3 | Rules: VISION automation routes and Testing fixture teaching | Remove retired routes and the redundant permission gate. Task already owns autonomy and authority; Benchmark owns performance review. Teach the required JSX runtime in the existing Testing owner. | Entire current doctrine/rule set searched for this pattern; generated discovery mirrors and concrete request routing checked after repair. |
| 4 | Docs: all four authored hyperscript setup examples | Repair the same missing runtime declaration at its teaching source. This opens the all-current-docs audit, including translated pages. | All authored docs enumerated; owned API/source/parity checks plus source review. Broader prose/API candidates are ranked separately from this batch. |
| 5 | Registry: authored fixture values and component patterns | Runtime audit finds registry hyperscript examples already explicitly classic. Keep these implementations. Inventory the full component set and inspect shared patterns before claiming wider compliance. | Registry generation/interaction is unnecessary for unchanged values; wider pattern audit remains open. |
| 6 | Runtime: editor mount, input and large-document owners | Keep the runtime unchanged: the confirmed failure is fixture compilation, not Suggestion semantics. Prior unresolved mount budgets remain open; this repair claims no editor speedup. | Inspect current target inventory, source fingerprints and unresolved performance records before selecting a future runtime batch. |

The target challenge rejected changing Suggestion semantics or removing its
tests: both would conceal a compiler-input defect. For fixture duplication,
deleting the entire test package would also delete independent React, browser
and proof jobs. Sharing the existing headless fixture owner removes duplicate
code while retaining those useful boundaries. Replacing JSX with hand-written
JSON across the corpus would expand fixtures and obscure selection contracts.
