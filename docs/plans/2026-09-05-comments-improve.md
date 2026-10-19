# Comments improvement iteration

The resumed iteration covers the Comments C1-C7 owners, all 309 authored
documentation files, and all 380 registry TypeScript sources. The confirmed
repairs cover input policy, focus, timestamp ownership, inferred store types,
documentation contracts, asynchronous UI cleanup, and proof-host freshness.
All governed audits, confirmed repairs and required proof are complete locally.
The final strict replay passes against the current canonical build, with its
served manifest verified before and after the run. The coverage ledger records
the complete source audit independently of executable behavior coverage.

Objective:
Complete one Improve iteration from the latest Comments C1-C7 plans, including
the full audits triggered by confirmed defects.

Completion threshold:
Every applicable governed set has a contextual disposition; confirmed
actionable defects pass their owning proof; no required investigation or
started gate remains unresolved.

Verification surface:
The coverage ledger, source-first typechecks, package and mounted tests,
actual website routes, strict Plite Chromium proof, and source-bound receipts.

Constraints:
Preserve domain, serialized-data, native-input and runtime laws. Keep the
current checkout on `next`. No publication, external messages, other checkout,
or cross-project synchronization is authorized.

Boundaries:
This is the user's resumed Comments Improve iteration in
`/Users/zbeyens/git/plate-2`, under one native goal and this existing plan.
The separate whole-project Improve task retains its own broader findings.

Blocked condition:
Missing access, authority or proof capability prevents all useful remaining
authorized work. Breadth and a green intermediate batch are not blockers.

Work Checklist:
- [x] Complete all applicable improvement lanes and their governed sets.
- [x] Rank source-backed candidates and challenge deleting each owner.
- [x] Reproduce accepted behavior failures before production changes.
- [x] Repair owning boundaries and remove temporary diagnostic implementations.
- [x] Audit all 309 authored MDX files with per-file dispositions.
- [x] Audit all 380 registry TypeScript sources with per-file dispositions.
- [x] Resolve nested comment body/date ownership and mutable DOM policy captures.
- [x] Repair store inference, React fixture typing and its existing typecheck gate.
- [x] Complete repeated source-bound website proof and direct browser interaction.
- [x] Pass final strict Plite proof, reconcile current fingerprints and close the goal.

Budget:
One complete iteration, with no time or token budget. The user requested
Autogoal integration and then resumed the remaining work. No schedule is set.

## Findings and decisions

The strongest justified cuts remove stale policy captures, the provider's
unsubscribed mutable focus read, default-editor restrictions in store APIs,
duplicate streaming loops, and obsolete documentation guidance. The four
Comments owners remain justified: Plite Annotation resolves ranges, Comments
integrates them with the editor, the application owns thread records, and
copied Discussion presents comments and suggestions.

| Rank | Finding / counterfactual | Decision and evidence |
| --- | --- | --- |
| 1 | Input handlers capture the previous read-only policy. Locking can pass an event to editable callbacks; unlocking drops the first typed character. | Reproduced all four keyboard/beforeinput transition cases. Pass the current `readOnly` prop to the event engine, selection-import hook, and global lifecycle hook. Keep the mounted runtime and its commit-time update. `runtime-policy-red.log` records four failures; the repaired suite passes. |
| 2 | Composer Enter prevents the native default but does not claim the event in Plate's synthetic handler pipeline. Empty, rejected, and pending submissions insert a paragraph. | Return `true` for handled Enter and cancellation. Three mounted red cases and the live reply reproduced the extra paragraph. Preserve Shift+Enter, composition guard, draft retention, and duplicate-submit guard. |
| 3 | Comment's `api.subscribe` row is detached from its API table in English and Chinese. | Remove the separating blank lines. Both exact routes return one real table row for the method; public identifiers, links and examples are unchanged. |
| 4 | Delete Comments and have copied UI own Annotation directly. | Reject: hit testing, activation, fault isolation, decoration and targeted repaint are independent editor jobs already owned by the package. No redundant layer was established. |
| 5 | Delete Discussion's shared block index or rebuild it for every body update. | Reject: the shared index prevents repeated full scans by block consumers; structural edits already refresh the suggestion-derived input. Existing split/merge and app-only write cases pass. |
| 6 | Replace the successful-save caret or add a focus call to prevent first-character loss. | Reject after exact replay: both still lost the character. The shared read-only capture was the cause. No caret/focus workaround remains. |
| 7 | Treat `contenteditable=true` in read-only mode as the bug. | Reject: Plite intentionally retains native selection and enforces edits through input policy. Tests assert `aria-readonly` and callback behavior. |
| 8 | Incoming dates and a reused injected clock can mutate published comment history. | Two red regressions establish the ownership defect. Clone seeded thread/message timestamps and each clock result at ingress; existing incoming-body copies remain. EN/CN documentation states the readonly snapshot contract. No current consumer mutates nested records; deep freezing and defensive reads add no required behavior. The Comment/Discussion suites pass 20 cases. |
| 9 | DOM strategy replacement, installation and removal use the prior committed runtime value in render-created handlers. | Three red mounted cases reproduce stale browser-handle callbacks. Pass the current `domStrategyRuntime` prop to the event engine, matching the repaired read-only policy flow. The three focused runtime suites pass 62 cases; package source types pass 11 tasks. |
| 10 | Annotation factories and React hooks accept only the default editor type, rejecting an editor with inferred initial data and history. | Type-only repair through Best API and Plite Plan: preserve the input document and extension generics in the public signature, and erase them once inside the existing private store implementation. Keep inference for annotation data. The same normal call must compile; invalid runtimes and unknown data fields must still fail. |
| 11 | The widget store hook has the same default-editor restriction. | Apply the same inferred document/extension boundary to the existing hook and private factory. Keep widget payload inference and existing public metadata. Positive/negative annotation and widget calls compile together. |
| 12 | React fixtures escape the normal typecheck and depend on obsolete test shapes. | Retain the dedicated Vitest ambient config, point it at source entrypoints, repair real fixture contracts, and include it in the existing `typecheck:tests` owner and Turbo inputs. A deliberately invalid temporary fixture makes that gate fail; the fixture is then deleted and the gate passes. All 1,184 mounted tests pass across 81 files. |
| 13 | The documentation checker skips tilde fences and misreads nested shorter fences. | Two red parser cases establish the blind spot. Recognize matching marker type and sufficient closing length, including EOF closure. All 29 checker contracts pass; the current-doc denominator includes both Plite-to-Plate migration pages. |
| 14 | Setup guides teach package-internal aliases and dependency overrides for subpaths; troubleshooting names retired runtime errors. | Rewrite EN/CN TypeScript guidance around public export maps and bundler/NodeNext resolution. Repair referring installation copy and Chinese dependency diagnostics. Document actual descriptor/dependency/schema messages from their source owners. Preserve dated benchmark results as a recorded snapshot rather than a current performance claim. The complete documentation audit is recorded below. |
| 15 | Internal documentation routes, anchors, MDX tables and API embeds can fail despite the narrow code checker passing. | Review every authored document with the MDX/GFM AST and current route, registry and API catalogs. Repair malformed Resizable syntax, table cells, obsolete Scrubber embeds, absolute and relative links, and current migration examples. All 309 files parse; 1,903 links and 1,997 code fences are inventoried with zero structural issues. External links are not all live-HTTP checked. |
| 16 | Copy reports success before clipboard permission or completion is known. | Await the write, disable concurrent requests, show success only on resolution, and retain a retryable failure. Delayed-success and denied-write/retry regressions pass. |
| 17 | SelectCommand can leave an earlier ResizeObserver frame queued; controlled and streaming demos can retain pending work. | Cancel a replaced frame and loading timer. One AbortController stream loop owns both editor modes and aborts on reset, scenario, navigation, mode change and unmount. Existing mounted cleanup tests and ten real-route streaming cases pass. |
| 18 | The compiled Plite provider caches a mutable focus query by editor identity, hiding selection toolbars. | Reuse `useRuntimeFocusState`, the existing mounted DOM focus subscription. Compile the actual provider in its existing Vitest host; two existing per-view focus tests reproduce the compiler failure and all 1,184 React tests pass with the repair. The AI popup and hovering toolbar use the same owner. |
| 19 | Resizable reference copy names the wrong entrypoint, an absent Image component, and a stale minimum width. | Both language pages use `platejs/resizable/react`, a native image with the current node URL, `usePath` for persistence, and the source default of zero. The exact shared TSX example compiles against source exports. |
| 20 | Upload messages contain inaccurate wording; export allocates and removes an empty stylesheet. | Correct the file-size/minimum wording and delete the unused stylesheet work. No new abstraction or state is introduced. |
| 21 | Imperative focus and selection reconciliation can update DOM focus without notifying the compiled provider. Mention selection is correct but its highlight remains absent. | Subscribe the existing focus hook to core view-state invalidation and keep its per-view DOM focus read and mounted-root signal. One red mounted case distinguishes native focus, DOM API and React context. All 1,185 mounted cases, the exact Chromium arrow/paint regression, and direct native keyboard mention paint pass. No extra focus call, timer or public API is added. |
| 22 | The proof monitor's topology test invents a broader source inventory than the runner, so generated app output can fail a source-stability assertion. | Delete the parallel directory list and reuse `browserRunEntries` with the runner's same generated-helper exclusion. All 21 monitor contracts pass. Production metadata checks, including transient source changes, remain intact. |
| 23 | Browser helper freshness still requires retired `core/index` artifacts, forcing an unnecessary package rebuild on every proof invocation and briefly deleting the live Playwright helper. | Check the package's actual root `index` artifacts. An isolated fixture derives outputs from the real package export map: the original freshness check is red, the repaired check reuses the build without rewriting its manifest or entrypoint, and changed or missing output remains stale. The 22 focused build/monitor contracts pass. |

## Complete governed coverage

[coverage.json](artifacts/comments-improve/coverage.json) contains one row for
each of the 689 source files, its initial and final SHA-256, contextual
observations, disposition and evidence references. The path inventory is
reconciled against the repository. The review combines source context with
canonical checks; it does not claim every example was executed or every editor
feature was certified.

| Lane | Governed set and disposition |
| --- | --- |
| Architecture and simplification | All Comments C1-C7 owner/consumer paths; current input policy, DOM strategy, annotation/widget stores and compiled provider. Existing owners retained only for their current independent jobs. No compatibility wrapper or alternate focus owner added. |
| Performance | Existing shared discussion index and keyed subscriptions retained after source and split/merge proof. Redundant async loops and empty stylesheet work removed. Earlier C1-C7 measurements remain historical; no new performance result or budget claim. |
| Test value | React fixtures, runner configuration, package typecheck discovery, positive/negative store inference calls, and actual compiler behavior reviewed. Existing provider focus tests gain the production compiler; no second fixture runner or feature map. |
| Documentation | All 309 authored MDX files, including EN/CN current migration teaching. Per-file roles and prose context, public API claims, code-fence rules, MDX/GFM syntax, routes/anchors, registry embeds and API references reviewed. Historical release material retains its recorded context. |
| Registry | All 380 TS/TSX sources, including examples, copied UI, fixtures and catalog owners. Imports, public call shapes, hooks, effects, event/lifetime ownership, accessibility and dead-work leads reviewed in context. All rows have dispositions. |
| Agent rules | Applicable AGENTS, Task, Improve, Best API, Plite Plan, Plate UI, Testing, Verify Plate, Technical Writing and doctrine owners. Source/generated boundaries and real command discovery verified. Autoreview is inapplicable on `next`; the supplied mapping keeps agent work sequential. |

The timestamp investigation resolves at ingress: bodies and dates supplied by
callers are copied; published records remain readonly by contract. Current
consumers do not mutate nested records, and anchor handles retain their live
identity. Deep freezing or copying every read would add work without fixing an
observed contract failure.

The remaining `runtime.readOnly` accesses are execution-time reads in committed
external-text operations. Render-created input handlers receive current props.
The 23 JSX keyboard bindings and additional object/forwarded handlers were
reviewed; native inputs and toolbar controls do not share the composer bug.

The docs repair removes package-internal alias recipes and subpath dependency
overrides, uses actual debug/dependency/schema messages, fixes malformed tables
and API embeds, resolves broken internal links, preserves dated measurements,
and makes local-docs configuration directly copyable JSON. Registry catalog
names and BasicBlocksKit members that initially looked stale were verified and
retained.

## API and workflow proof

The annotation and widget public factories/hooks preserve document, extension
and payload inference together. Exact editors are checked at the public
signature, with generic erasure confined to the existing private store.
`annotation-editor-types.tsx` includes accepted inferred calls and rejected
runtime/payload calls. Vision's durable target is unchanged. Best API's
canonical teaching covers these factories, doctrine version 157 is appended,
and previous doctrine versions and package attestations are preserved.

React fixture typing remains inside `plitejs`'s existing `typecheck:tests` gate.
A deliberately invalid temporary fixture made that gate fail and was deleted
after proof. The actual provider is compiled in the existing Vitest host with
its compatible local Babel/React Compiler dependencies. This reproduces the
real-route memoization failure, including nested view focus, without changing
public editor APIs.

Improve uses Autogoal under the user's explicit standing instruction and keeps
one evolving audit plan. A batch cannot close an incomplete iteration. Maintain
Workflow verified the canonical project sources; there is no shared Improve
source or existing named Improve install in the configured sibling projects.
No vendor source, generated skill or other project was hand-edited.

Agent Native Reviewer checked these paths sequentially:

| Intent or state | Verified route |
| --- | --- |
| Improve with required audits remaining | One goal and the same plan remain active. Batch count does not mark an iteration complete. |
| Read-only work or an explicit goal opt-out | Existing request authority takes precedence; no implicit repair or native goal. |
| Store inference repair | Canonical Best API teaching, doctrine version and generated discovery agree; valid and invalid calls are checked together. |
| Compiler-sensitive focus behavior | The existing package runner compiles the actual provider; per-view mounted contracts and website/native follow-up interactions reach the same owner. |
| Fixture, docs parser or runner change | Existing package/source-first and Node contract commands discover it; no new lifecycle, feature map or user approval layer. |

Regenerated source mirrors and the 184 workflow/parser/entrypoint contracts
pass. The later focus-state repair adds one validator rejection/acceptance
contract; all 69 current Regression validator cases pass.
The plan checker is a structural gate; behavioral evidence remains independent.

## Final verification

The final `pnpm check:plite` passes package typechecks and tests, runner
contracts, and all 81 Chromium batches: 741 passes and eight declared skips.
The actual HTTP-served manifest matches current source inputs before and after
the run. Website proof passes 29 cases and 65 zero-retry repeat cases, both
bound to the same 820 unchanged inputs. All 1,185 mounted React cases pass.
The final inventory reconciles all 689 reviewed files and their hashes; the
four additional proof-control inputs also remain unchanged.

The mention regression in `mention-selection-mounted-red.log` establishes
the focus defect: native root focus and `api.dom.isFocused()` are true while
the compiled provider's React context remains false. The existing core
view-state subscription invalidates the same per-view DOM focus read,
preserving nested-root identity. The mounted regression, nested-view cases,
strict mention-paint checks and website focus/submission cases pass. The
Regression validator requires `focus-state-trace: native + dom-api +
react-context` for failed focus-state repairs; its 69 contracts, generated
mirrors and sequential agent routing review pass.

Verification evidence:
- Website Chromium: all 29 Comments and streaming cases pass, including 1280px
  and 390px comment scenarios. A separate zero-retry run repeats the three
  focus/submission and ten streaming cases five times: 65 passes.
- [closeout-browser-receipt.json](artifacts/comments-improve/closeout-browser-receipt.json)
  binds the repeated run to 820 unchanged inputs. Its input digest is
  `sha256:b013109562f7dc19ce23f36a3b08ded12b8d539e2f74c346f3d1593dc3daecc2`.
- The final 29-case replay on the task-owned server also passes, bound to all
  820 governed/owner/proof inputs in
  [closeout-full-browser-receipt.json](artifacts/comments-improve/closeout-full-browser-receipt.json).
- Direct in-app Browser: native selection opens Ask AI; popup focus accepts
  `Focus remains here` without another click. On the discussion route, empty
  Enter does not submit, `Local reply proof` submits once, and no-click typing
  retains the complete `Follow-up draft`. The browser's effective narrow CSS
  width was 433px; the automated mobile rows are exactly 390px.
- Mounted React: 81 files and 1,185 tests pass with the compiled provider.
  Copied Comment/Discussion, clipboard, SelectCommand and AI lifecycle tests
  pass. App source-first types and root lint pass for their recorded inputs.
- Documentation: 309 files parse, with 1,997 fences, 1,903 links and zero
  structural issues. Current-doc code checks, Plite docs checks, generated
  docs parity and the extracted Resizable example typecheck pass.
- Registry build, changelog synchronization, doctrine validation and generated
  source mirrors pass. The final build contains 367 canonical payloads and
  15 sparse overlays.
- [closeout-plite-summary.json](artifacts/comments-improve/closeout-plite-summary.json)
  records the passing strict gate, 741 Chromium cases, eight declared skips,
  81 batches, and the exact served app manifest.
- [closeout-static-target-attestation.json](artifacts/comments-improve/closeout-static-target-attestation.json)
  verifies the served build against current source before and after strict
  proof. Its input digest is
  `b87d8d466a01caa4a10fa350bd7e7eb9cba0bd93048878fa89dd32a3c693bd34`.
- [completion.json](artifacts/comments-improve/completion.json) records the
  reconciled coverage, unchanged proof inputs and completed local scope.

The final WWW proof uses task-owned PID 17247 in this checkout's `apps/www`
at `http://localhost:3000`. Its Tailwind compilation test uses the same app
source root as Next. Strict Plite uses task-owned PID 93578 at
`http://127.0.0.1:3109`, bound to the HTTP-served app build fingerprint
`b2d34faa65d04ea2b79023c3d4de3237864d859f85a92815333402adf6137fce`.
Earlier server IDs and receipts are historical proof only.

The proof host reuses complete browser-helper builds without rewriting their
manifest or entrypoints. Its isolated regression derives required outputs from
the actual package exports and retains stale detection for changed or missing
outputs. The canonical strict command discovers this regression. The source
monitor test uses the runner's inventory and generated-output exclusion; its
production transient-source checks remain intact. The separate whole-project
task repaired both mutating probes in
`tooling/scripts/entrypoint-turbo.slow.test.mjs` to use temporary projects with
matching source-task hashes. The final strict replay includes these repairs.

Seven additional affected documentation routes render the expected text,
and both local-docs configurations parse. The HTTP receipt is
`closeout-docs-http.json`; direct browser observations are in
`closeout-manual-browser.json`.

The compiled-focus diagnosis retained native/model selection equality and
native focus continuity. The first divergence was the provider's cached
`ReactEditor.isFocused` result. `provider-compiler-compatible-red.log` records
the two failing existing focus contracts; `closeout-react-focus.log` records
the repaired suite. No copied toolbar focus/caret workaround remains. The
current `toolbar-focus-trace-0.json` is a green replay, not the original red
trace.

The copied UI changes are recorded in the two draft registry changelog entries
`2026-09-05-comment-keyboard-submit` and
`2026-09-06-registry-lifetime-repairs`. No new changeset is needed for these
internal beta repairs inside the existing package-introduction changeset.
No exported file was moved, added or removed, so barrel generation does not
apply. Generated registry output is included on `next`; template output remains
CI-owned.

Open risks:
No package release, root `check`, Firefox/WebKit matrix, raw-device mobile
proof or new performance measurement is claimed by this Comments iteration.
Source review is broader than executable example coverage. The strict Plite
gate is complete, and no required Comments Improve investigation remains open.
