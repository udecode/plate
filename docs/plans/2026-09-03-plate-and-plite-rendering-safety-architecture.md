# Plate and Plite rendering safety architecture

Objective:
Make large text and code scale without weakening normal rich-text behavior.
Finish only when each removed owner has an executable replacement and its
correctness, lifetime, scale, and product gates pass.

Completion threshold:

- Resolve the work in at most three phases, with every cut either proved or
  explicitly withheld while its current owner stays intact.
- Keep normal text and marks native, externalize only exact-one-Text blocks,
  and keep document virtualization independent.
- Pass the final Full EditorKit budgets, focused product behavior, strict Plite
  closure, five-project browser matrix, public types, docs, and release checks.

Verification surface:

- Plite text rendering, external-text ownership, selection, history,
  composition, decorations, collaboration, DOM integrity, and browser corpus.
- Plate facade inference, read-only propagation, syntax refresh, code-block
  composition, registry output, docs, and the standalone code-block demo.
- Huge multiline code, one huge line, long plain and marked text, mixed marks,
  sparse and dense decorations, print, search, clipboard, and editing.

Constraints:

- Use no more than three checkpoints. Benchmark before accepting production
  architecture. Do not hide a failed lane behind a runtime fallback.
- Preserve any hook, claim, or input guard whose full replacement matrix does
  not pass. Do not add automatic thresholds or a second model or history.
- Keep `editor-ai` outside the product adoption scope.

Boundaries:

- Product adoption is limited to the standalone code-block demo and reusable
  registry component. Normal EditorKit rendering stays native.
- Whole-document virtualization, external block text, and native rich text are
  independent modes. None may silently activate another.
- This local result is not a commit, push, PR, release, or universal
  cross-editor win claim.

Blocked condition:

- Stop completion if canonical text diverges, stale adapter writes land,
  native/external projections coexist, any named behavior gate fails, the
  product budgets fail, or a removed owner lacks its replacement proof.

Work Checklist:

- [x] Reuse the completed external-text plan and confirm editable-island is
  absent from live scoped source.
- [x] Benchmark the normal, external, CodeMirror, Plate, marked, and pinned peer
  lanes before the final production decision.
- [x] Bound normal-render, anchor, decoration, composition, DOM-integrity, and
  syntax work without globally disabling retained text flow.
- [x] Withhold the hook/public-render-protocol cut because its replacement
  matrix is incomplete.
- [x] Add the explicit CodeMirror component only to the code-block demo with a
  10,000-line fixture and no `editor-ai` change.
- [x] Delete the Plate code-line model, editable-island, automatic-threshold,
  duplicate-store, and projection-conflict timing machinery from the accepted
  architecture.
- [x] Pass focused behavior, final product benchmark, strict package, five-
  project browser, type, lint, manifest, docs, changelog, and visual gates.

Phase / pass table:

| Phase | Status | Evidence |
| ----- | ------ | -------- |
| 1 | complete | Bounded renderer and anchor owners pass identity, correctness, and frozen scale gates. |
| 2 | complete | Safe normal-mode cuts pass; risky hook and claim rewrites stay owned by their current implementations. |
| 3 | complete | CodeMirror product behavior, final benchmark, strict closure, and five-project browser matrix pass. |

Verification evidence:

- Final production receipt source fingerprint:
  `cb5cf27d0abe7f94881b34382bdd4eace9f298836a2f7b171df749ace21d1610`.
- Full EditorKit 10,000-line p95: 1,282.91 ms queryable, 32.1 ms input,
  and 410.1 ms highlight settle, all within frozen budgets.
- Focused CodeMirror Chromium behavior: 2 passed. Strict Plite: 735 passed,
  8 expected skips. Five-project matrix: 2,352 passed, 622 expected skips.
- Final www typecheck, focused Ultracite, package manifests, registry changelog,
  benchmark-plan validation, and in-app Browser inspection pass.

Reboot status:

- The external-text and editable-island execution state, current source, and
  plan were reread after continuation. The product receipt was regenerated
  after the last shared-runtime change; no stale product number closes a gate.

Open risks:

- CodeMirror bounds DOM by mounting a viewport. Native page Find and screen
  readers see mounted content only; CodeMirror search, model copy, and print
  cover the full canonical value. This is acceptable only for explicit huge
  code blocks.
- The product-specific automated suite is Chromium. The Plite external-text
  substrate and native editor corpus pass Chromium, Firefox, mobile Chromium,
  WebKit, and mobile WebKit.
- The hook-bearing injection architecture remains debt. Cutting it without
  the replacement matrix would trade measurable cost for stability bugs.

Status:

- Phase 1 passed locally.
- Phase 2 closed at its pivot checkpoint. The bounded kernel cuts passed. The
  hook/public-render-protocol rewrite is withheld because its native focus,
  IME, hydration, custom-host, and cleanup replacement matrix is incomplete.
- Phase 3 passed locally. The final CodeMirror product rerun, strict Plite
  closure, and five-project browser matrix pass.
- No commit, push, PR, release, or `editor-ai` change is authorized.

## Decision

There is no honest one-renderer answer for every document shape. Use three
explicit lanes:

1. **Normal rich text:** keep Plite/Plate text, marks, decorations, selection,
   and accessibility in normal DOM. Make its work bounded and preserve React
   component identity.
2. **Pathological single blocks:** use Plite external text for an exact-one-
   `Text` block. Plite remains canonical for text, selection, history,
   composition, decorations, and collaboration. The adapter owns DOM and
   layout. The explicit CodeMirror code-block component belongs here.
3. **Huge documents:** use the existing explicit document-virtualization mode.
   It is independent of external text and normal rich-text rendering.

External text is the correct escape hatch, not the universal renderer. It
delivers the canonical string reference and exact patches to an adapter. The
adapter may keep its mounted DOM bounded, but Plite does not truncate the
adapter state. The contract adds no line nodes, duplicate document, or second
history. The editable-island schema category and code-line model are gone. The
completed owner and proof ledger is
[external-text-execution.md](./2026-09-03-external-text-execution.md).

Do not add viewport-only token wrappers to normal mode. Do not mix block-level
external text with document virtualization. Do not reintroduce code-line nodes
as a fallback if the adapter fails; the normal single-Text renderer remains the
default and the external adapter remains opt-in.

## Hard truth

The explicit three-lane architecture is proved locally. A universal renderer
or a hook rewrite is not.

- The normal full-DOM hot path had real avoidable work: quadratic fallback
  segmentation, content-sized React keys, blanket invalidation, and rebuilding
  the same text change once per mapped endpoint.
- Disabling retained text flow globally was dangerous because it sent every
  text node through those costs. That global option should not become a public
  performance switch.
- Hook-bearing Plate injection remains architectural debt, but cutting it today
  would be reckless. Same-host attributes, local React state, effects, SSR,
  commands, refs, and cleanup do not yet have one production replacement.
- External text solves pathological exact-one-Text blocks. It must not replace
  ordinary marked DOM or whole-document virtualization.
- Correct mark semantics have a real DOM cost. One 480k-character marked leaf
  remains cheap, but 10,000 alternating mark runs require 30,002 DOM elements
  and mounted at 440.0 ms p95. Pretending those wrappers do not exist produced
  the earlier fake win.

## Governing invariants

- One canonical text, selection, history, composition, and collaboration
  owner: Plite.
- One React segment compiler and one stable segment identity model.
- Render delivery and forced DOM repair are different events.
- A normal model edit may rerender a custom leaf without remounting it.
- A true imperative-sync failure may remount the affected text to repair DOM.
- Decoration reconciliation identity includes its source; public adapter keys
  remain source-local until a deliberate public API decision says otherwise.
- One text-pair change is built at most once per anchor-mapping context.
- Hooks run in React components, never in ordinary transform loops.
- Attribute work touches only eligible hosts. One plugin cannot impose a
  renderer penalty on unrelated text.
- Normal mode keeps the full rendered text and marks DOM-present.
- External text, normal DOM, and document virtualization stay separate.
- No compatibility aliases, safety switches, duplicate stores, or second
  rendering protocol may hide a failed cut.

## Requirements ledger

| ID  | Requirement                                            | Gate                                                                                                                                             |
| --- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| R1  | Prevent regressions rather than promise the impossible | Every cut needs an old-behavior oracle, replacement oracle, negative cases, cleanup proof, and scale receipt.                                    |
| R2  | Hook cuts need replacements                            | No hook-bearing injection or DOM-commit hook is deleted until its full row below passes.                                                         |
| R3  | Find other architecture penalties                      | The bounded render, projection, invalidation, input, decoration, syntax, and host-ownership graph is classified below.                           |
| R4  | Cover Plite and Plate                                  | Plite owns kernel/view mechanics; Plate owns plugin, code-block, static, registry, and product adoption.                                         |
| R5  | Use no more than three phases                          | Exactly three checkpoints are defined below. A failed packet is withheld without a runtime fallback.                                             |
| R6  | Separate normal and virtualized behavior               | Normal DOM, external text, and document virtualization are distinct lanes.                                                                       |
| R7  | Include huge code and long text with/without marks     | Phase 3 has multiline code, one huge line, prose, marks, decorations, product composition, and native editing cohorts.                           |
| R8  | Code-block only                                        | Plate product adoption uses the code-block demo. `editor-ai` is excluded.                                                                        |
| R9  | Benchmark before broad claims                          | Every scale-sensitive owner uses frozen baseline/target cohorts; historical editor comparisons are context, not proof of this production source. |

## Benchmark Source

- invocation: `$benchmark all rendering safety and huge code`
- candidate-identity: fingerprint: final production receipt sourceSha256 over the local `a6afd55c30e97c74fe895d1ad005ca75413110f3` checkout
- plate-main-identity: commit: `cce36d378b2f1e5c775dafe1a67c2215165c982c`
- plite-identity: fingerprint: final production receipt sourceSha256 over local Plite and Plate owners
- slate-identity: fingerprint: Slate 0.124.1 and Slate React 0.124.2
- prosemirror-identity: commit: `c7f2f1d7bde70728dfedaa68ca8f5fc3dffa17cc`
- lexical-identity: commit: `dd5c41b13193efa9ab1574234d8593d2c9e4f988`
- wordgard-identity: commit: `b5ad0d057e2790c8cf971c85a9d2fb7e4a82da54` with Wordgard 0.5.1
- final-artifacts: artifact: `docs/plans/artifacts/2026-09-03-plate-and-plite-rendering-safety-architecture/`

## Benchmark Lane Table

| Order | Lane                          | Applies | Status   | Evidence                                                                                         | Next                                                    |
| ----- | ----------------------------- | ------- | -------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| 1     | source-and-host-readiness     | yes     | complete | Package builds, source-first types, peer fixtures, browser hosts, and source fingerprints passed | Closed; invalidate receipts after any owner change      |
| 2     | current-vs-main-product-smoke | no      | N/A: inapplicable - the accepted adapter has no main product counterpart                         | Historical full-DOM product receipt retained            | Closed; do not invent a main comparator                  |
| 3     | plate-vs-plite-decomposition  | yes     | complete | Raw external text, adapter-only, minimal Plate, and full EditorKit were measured separately       | Closed; keep layer results separate                     |
| 4     | owner-microbench-and-trace    | yes     | complete | Segment identity, anchor mapping, attributes, projection, and syntax owners have receipts         | Closed; retained hooks require a new plan               |
| 5     | product-mount-matrix          | yes     | complete | Full code-block demo passed 3 warmups and 15 fresh-context production samples                     | Closed; rerun after product-owner changes               |
| 6     | trusted-editing-matrix        | yes     | complete | Native input, IME, history, selection, clipboard, remote edit, read-only, and cleanup passed      | Closed; preserve browser cases                          |
| 7     | plite-vs-pinned-slate         | yes     | complete | Pinned Slate, ProseMirror, Lexical, and Wordgard 10k receipts provide contextual comparison       | Closed as context; not used as causal product proof     |
| 8     | example-breadth               | yes     | complete | Standalone code-block demo plus strict Plite example corpus passed                               | Closed; `editor-ai` remains excluded                    |
| 9     | large-and-stress              | yes     | complete | 100 to 100k code lines, 10k to 1M single lines, 10k print, huge documents, and stress passed      | Closed; keep external text and virtualization separate |

## Comparison Signature

| Field                               | Candidate                                                   | Baseline                                                                  | Comparable evidence                                                                                                             |
| ----------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| ref / dirty fingerprint             | Local candidate commit plus final receipt source fingerprint | Main commit plus pinned peer commits                                      | artifact: `code-block-codemirror-product.receipt.json` and `2026-09-02-remove-code-line-model/*.json`                            |
| lockfile / package manager          | Current pnpm lockfile and app-owned CodeMirror dependencies | Same Plate lockfile; isolated peer package locks                           | artifact: `pnpm-lock.yaml` and `2026-09-02-remove-code-line-model/`                                                              |
| build mode / host / port            | Production www route on localhost:3000                      | Production isolated peers and frozen historical full-DOM host             | artifact: `code-block-codemirror-product.receipt.json` and peer receipts                                                        |
| browser / machine / viewport / DPR  | Receipt-recorded Chromium on macOS arm64 at 1280x720        | Receipt-recorded Chromium on the same machine class; peer runs are context | artifact: production and isolated peer receipt environment blocks                                                               |
| route / fixture / document / plugins | Code-block demo, 448,889 characters, full EditorKit         | Matched 10k code payloads; peer plugin shapes differ and remain contextual | artifact: product receipt plus `2026-09-02-remove-code-line-model/huge-code-block-probe.json`                                    |
| setup / action / DOM strategy       | Fresh context, explicit CodeMirror component, canonical insert | Frozen full-DOM and isolated peer insert actions                           | artifact: product runner, prototype receipt, and isolated peer runners                                                          |
| warmups / samples / interleave order | 3 warmups and 15 fresh-context product samples              | Frozen peer receipts use their recorded sample policy; marked DOM alternates | artifact: product receipt, `marked-mixed-parity.production.receipt.json`, and isolated peer receipts                            |

## Current Cause Checkpoint

- state: none
- cause-id: N/A: completed causes are recorded in Cause History
- lane: N/A: no active benchmark lane
- comparable-baseline: N/A: no active cause
- material-delta: N/A: no active cause
- isolated-owner: N/A: no active cause
- causal-intervention: N/A: no active cause
- fix-class: N/A: no active cause
- long-term-target: N/A: no active cause
- decision-owner: N/A: no active cause
- fix-owner: N/A: no active cause
- benchmark-command: N/A: no active cause
- benchmark-rerun: N/A: no active cause
- correctness-command: N/A: no active cause
- correctness-rerun: N/A: no active cause
- resume-lane: N/A: all applicable lanes are complete
- compatibility-verdict: N/A: no active cause
- layer-plan: N/A: no active cause
- benchmark-rerun-result: N/A: no active cause
- correctness-guard-result: N/A: no active cause
- correctness-rerun-result: N/A: no active cause

## Cause History

| Cause ID           | Lane                       | Decision | Fix Class           | Long-Term Target                                           | Decision Owner | Layer Plan               | Compatibility Verdict                                                                      | Fix Owner       | Causal Evidence                                                               | Pre-Fix Correctness                                      | Benchmark Command                                                                                                                        | Benchmark Result                                                   | Correctness Command                                                                                                  | Post-Fix Correctness                                           | Evidence                                                                                                     |
| ------------------ | -------------------------- | -------- | ------------------- | ---------------------------------------------------------- | -------------- | ------------------------ | ------------------------------------------------------------------------------------------ | --------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| huge-code-full-dom | product-mount-matrix       | kept     | runtime-architecture | Explicit external-text CodeMirror component for huge code | best-api       | plite-plan + plate-plan  | hard-cut: remove code-line and editable-island owners while keeping normal rich text native | plate-feature   | Full DOM created about 90k nodes and missed input and highlight budgets       | pass: canonical text and syntax output matched            | `node docs/plans/artifacts/2026-09-03-plate-and-plite-rendering-safety-architecture/code-block-codemirror-product-benchmark.mjs`            | pass: 32.1 ms input and 410.1 ms highlight p95 within budgets     | `pnpm --filter www test:www-browser:chromium tests/browser/code-block-codemirror.spec.ts`                         | pass: 2 complete 10k code-block behavior rows                  | `code-block-codemirror-product.receipt.json` and `apps/www/tests/browser/code-block-codemirror.spec.ts`       |
| hook-attribute-cut | owner-microbench-and-trace | deferred | runtime-architecture | One compiled attribute owner after full behavior proof     | best-api       | plite-plan + plate-plan  | preserve: native-behavior - current hooks own focus, IME, hydration, custom hosts, and cleanup | plate-feature | Attribute-source prototype removed most 10k first-party read cost             | pass: current hook owners preserve the existing behavior matrix | `pnpm exec vitest run docs/plans/artifacts/2026-09-03-plate-and-plite-rendering-safety-architecture/attribute-source.mounted.test.tsx`       | pass: prototype reduced the measured attribute-source cost       | `pnpm check:plite`                                                                                                 | pass: current owners retained and strict closure stayed green | `attribute-source.browser-comparison.receipt.json` and the Phase 2 checkpoint                                 |
| syntax-refresh     | owner-microbench-and-trace | kept     | internal-implementation | Exact-block cancellable syntax refresh                    | benchmark      | N/A: no public API changed | N/A: no compatibility surface changed                                                       | plate-plugin-creator | Overlapping delay jobs and broad cache clearing performed unrelated work | pass: existing syntax output and language changes matched | `node docs/plans/artifacts/2026-09-03-plate-and-plite-rendering-safety-architecture/code-block-codemirror-product-benchmark.mjs`            | pass: actual token settle p95 is 410.1 ms                         | `pnpm --filter platejs exec vitest run src/features/code-block/lib/BaseCodeBlockPlugin.spec.tsx`                  | pass: 51 syntax tests including last-observer cancellation     | `BaseCodeBlockPlugin.spec.tsx` and `code-block-codemirror-product.receipt.json`                               |

## Feature Manifest

| Surface                    | Applies | Owner                                | Artifacts                                                                                            | Consumer                                 | Proof                                                           | Status                                      |
| -------------------------- | ------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------- | ---------------------------------------- | --------------------------------------------------------------- | ------------------------------------------- |
| API                        | yes     | `best-api` and `platejs/react`       | `packages/platejs/src/react/plite-react.ts`, `packages/platejs/src/react/components/plate-nodes.tsx` | Plate element components                 | inferred public type tests and packed declaration audit         | passed                                      |
| Package                    | yes     | `plate-plugin-creator`               | focused `packages/platejs` facade/type changes                                                       | Plate registry components                | focused typecheck, tests, manifests, entrypoint audit           | passed                                      |
| React adapter              | yes     | `plate-ui`                           | `apps/www/src/registry/components/editor/code-block-codemirror.tsx`                                  | explicit high-scale code-block component | adapter contract and Chromium behavior matrix                   | passed                                      |
| Registry UI                | yes     | `plate-ui`                           | registry-local CodeMirror code-block component                                                       | copied Plate code-block UI               | focused tests and standalone demo Browser proof                 | passed                                      |
| Composition                | yes     | `plate-feature`                      | code-block kit replacement in the code-block demo only                                               | code-block demo                          | exact plugin/component audit; `editor-ai` unchanged             | passed                                      |
| Scale proof                | yes     | `benchmark`                          | disposable Plite+CodeMirror receipts, frozen Plate baselines, final full-EditorKit receipt           | users and maintainers                    | pre-acceptance prototype and final production rerun             | passed                                      |
| Registry metadata/examples | yes     | `plate-ui`                           | code-block demo/value source and generated `code-block-codemirror.json`                              | registry installers and demo users       | registry build plus generated-output audit                      | passed                                      |
| Docs                       | yes     | `docs-creator`                       | code-block reference for the explicit high-scale component                                           | Plate users                              | source-backed docs audit and www typecheck                      | passed                                      |
| Release artifacts          | yes     | `changeset` and `registry-changelog` | one Plite/Plate changeset plus existing code-block registry changelog owner                          | package and registry consumers           | changeset, manifest, and changelog validators                   | passed                                      |
| Proof                      | yes     | `plate-feature`                      | commands and receipts in this plan                                                                   | maintainers                              | focused package, app, Browser, strict Plite, and registry gates | passed                                      |
| Plate Next attestation     | no      | `plate-next`                         | N/A: focused change inside the existing stale `platejs` host; no whole-package review                | maintainers                              | N/A: preserve current package attestation                       | N/A: focused change, no full-package review |
| Review/handoff             | yes     | `plate-feature`                      | final decision, risk, and local-state receipt                                                        | user                                     | review and native goal checks                                   | passed                                      |

## Package boundary contract

| Contract                      | Decision                                                                                                           | Evidence                                          |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| shared Plate host             | N/A: this is a focused change inside `packages/platejs`, not a new peer package                                    | package manifest and `pnpm test:manifests`        |
| Plite ownership               | `packages/platejs` inherits Plite external-text types by identity; registry code imports only from `platejs/react` | import audit and public type proof                |
| external dependency ownership | CodeMirror is a normal registry/app dependency; it does not enter `packages/platejs`                               | app manifest, registry metadata, and import audit |
| entrypoint runtime            | the existing `platejs/react` client facade gains type reachability only; headless roots stay React-free            | entrypoint DAG and packed declaration proof       |
| Oxlint coverage               | existing Plate React and app registry globs cover the touched files                                                | scoped lint and config audit                      |

## Accepted public call shape

The Plate facade inherits Plite's owner instead of wrapping it:

```tsx
props.slots.externalText({
  adapter: codeMirrorExternalTextAdapter,
  ariaLabel: "Code block",
  config: { language },
});
```

`PlateElementProps` must expose `EditableElementSlots`, and `platejs/react`
must re-export the Plite `ExternalText*` types by identity. No Plate adapter
manager, render-mode flag, automatic size threshold, second model, or second
history is allowed.

## Architecture cuts and survivors

| ID  | Owner/problem                                                               | Decision                                                                                                                                                                                             | Replacement and regression gate                                                                                              | State                                                                              |
| --- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| D1  | React fallback had a second quadratic decoration splitter                   | Delete it; reuse `compileTextFlowSegments`                                                                                                                                                           | Exact empty/clipped/overlap/source-order output, marks, and 100/1k/10k browser cohorts                                       | implemented, passed                                                                |
| D2  | Segment keys serialized whole text and marks                                | Use NodeKey + repair epoch + compiler identity                                                                                                                                                       | Leaf instances and local state survive edits/marks/history; true repair still remounts; zero-width DOM stays canonical       | implemented, passed                                                                |
| D3  | Render delivery and repair remount shared blanket invalidation              | Split them                                                                                                                                                                                           | React-owned text receives selector updates without remount; composition or failed imperative sync bumps repair epoch         | implemented, passed                                                                |
| D4  | Initially plain text had no subscriber for later repair                     | Always mount the private revision subscriber; successful DOM sync still skips render                                                                                                                 | Plain-to-empty repair uses a real epoch and produces canonical zero-width DOM                                                | implemented, passed                                                                |
| D5  | Decoration keys collide across mounted sources                              | Keep public source-local keys; add private source-qualified identity                                                                                                                                 | Atomic source-range swaps preserve the owning wrapper; two views do not alias                                                | implemented, passed                                                                |
| D6  | Anchor endpoints rebuilt the same document change repeatedly                | Memoize one change per text pair and mapping context                                                                                                                                                 | Distinct endpoints map correctly; undo/redo and collaboration anchors remain exact; at most one build per pair/context       | implemented, passed                                                                |
| D7  | Blanket history invalidation remounted React-owned text                     | Delete blanket invalidation                                                                                                                                                                          | Selector delivery remains; custom leaf state survives undo/redo                                                              | implemented, passed                                                                |
| D8  | Decoration broadcast can wake unrelated flows                               | Use existing NodeKey subscriptions and deduplicate shared listeners once per publication                                                                                                             | Source add/remove, moves, two views, cleanup, and zero unrelated reconciliation                                              | implemented; focused proof passed                                                  |
| D8a | Marked benchmark rendered different output across surfaces                  | Give production and control identical semantic mark renderers; fail on signature drift; alternate sample order                                                                                       | Whole-marked and 10,000-run mixed marks retain exact `<strong>` output through typing                                        | implemented; 3 warmups and 15 samples passed                                       |
| D9  | Hook-bearing Plate injection runs hooks inside prop transforms              | Withhold the cut. The prototype proves attribute-read cost, not a complete replacement for state, effects, focus, hydration, refs, and cleanup                                                       | Full replacement matrix below                                                                                                | closed by retaining the current hook owner                                          |
| D10 | Renderer scope/capability is inferred repeatedly                            | Withhold compilation until D9 has a complete production owner; do not add a second domain protocol                                                                                                   | Optional/missing/same-name targets, queries, commands, slots, static output                                                  | closed by retaining the current owner                                               |
| D11 | Render injection also carries command/default/schema concerns               | Withhold the split until every command, default, schema, and round-trip owner can move atomically                                                                                                     | Command targeting, unset defaults, persisted data, HTML/JSON round trips unchanged                                           | closed by retaining the current owner                                               |
| D12 | Structural slots use mixed callback protocols                               | Withhold a slot rewrite; a component-valued rename without full behavior proof is churn                                                                                                              | Suggestion, list, DnD, discussion, voids, refs, and selection identity                                                       | closed by retaining the current owner                                               |
| D13 | React descendant writes and the DOM integrity observer compete              | Stop treating arbitrary presentation attributes as model truth; observe text, structure, `contenteditable`, and reserved `data-plite-*` contracts. Retain exact-root claims for editor-critical writes | Child state attributes persist without a claim; reserved contract corruption repairs; nested/error/unmount/root-swap balance | safe presentation cut passed; critical claims retained                              |
| D14 | Editable-wide composition can replace unrelated retained hosts              | Track the composing path; only its exact/ancestor render region leaves retained flow. Fall back globally only when the native path is unknown                                                        | Real composition start/update/end/cancel, remote conflict, exact caret, no sibling host replacement                          | implemented; focused and native Chromium proof passed                              |
| D15 | Syntax refresh has overlapping delays and broad cache clears                | Use a block-keyed cache, one cancellable 120 ms refresh, and exact changed node keys. Parsing stays synchronous, so no stale async parse result exists                                                | Initial paint and final token settle, undo/redo, language switch, last-observer cleanup                                      | implemented, passed                                                                |
| D16 | Hot-path diagnostics run when profiling is off                              | Reuse opt-in profiler; retain DOM-binding metadata                                                                                                                                                   | Profile on/off matched receipt and mapping tests                                                                             | defer unless measurement makes it material                                         |
| D17 | External adapters receive source-local decoration keys                      | Keep the public source-local contract; no current adapter job proves a cross-source identity API is needed                                                                                           | Existing decoration identity, two-view, source-swap, and cleanup proof                                                       | closed by retaining the current public contract                                     |
| D18 | Native input guards protect pending marks, composition, and opaque handlers | Keep them                                                                                                                                                                                            | Native/model equivalence and exactly-once handler matrix                                                                     | keep                                                                               |
| D19 | Projection-conflict de-duplication created a private microtask scheduler     | Delete timing state; validate committed native/external hosts and fail deterministically                                                                                                             | Single DOM-phase scheduler audit plus external projection and StrictMode lifecycle tests                                     | implemented, passed                                                                |

## Hook replacement contract

Phase 2 rejected this cut. A renamed callback bag is not a replacement. Keep
the current hooks until a later plan proves every row below in production.

| Existing behavior                             | Required owner                                                                    | Proof before deletion                                                                                     |
| --------------------------------------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Pure injected root attributes                 | Compiled `render.attributes`, with no hooks, effects, mutations, or subscriptions | React/static merge order, removal, SSR/hydration, optional targets, custom hosts, no wrapper DOM          |
| Placeholder focus/read-only/composition state | One mounted exact-view React owner invalidating only old/new NodeKeys             | Empty/list/custom-emptiness cases; blur/read-only/query false remove output; two views stay independent   |
| Navigation feedback                           | One mounted exact-view component/source; commands remain editor-owned             | Target moves/deletes, repeat timer cancellation, same-host attributes, focus/scroll options, teardown     |
| External stateful transform                   | A real component with stable type and NodeKey identity                            | `useState`, effects, context, path move, StrictMode balance, type exit, exact cleanup                     |
| Custom host attributes                        | Existing host composition contract                                                | Nested wrappers, voids, composed refs/events, no swallowed props, no extra DOM                            |
| Text/leaf React commit claim                  | Automatic exact-root pre/post commit ownership                                    | Marks, decorations, local state, zero-width repair, foreign character-data repair                         |
| Coverage boundary claims                      | Boundary-owned exact-root lifetime                                                | Staged/full/partial/virtualized transitions, nested roots, ref replacement, cleanup                       |
| Plate after-children and table claims         | Their actual component/write owner                                                | List/suggestion/discussion/table state updates, nested tables, read-only, unmount, foreign sibling repair |

If this matrix fails, keep the existing hook path and ship independent kernel
cuts. Never substitute `safe`, `fast`, or `disableRetainedTextFlow` flags.

## Three execution phases

| Phase                                                | Scope                                                                                                                                                                     | Exit gate                                                                                                                                                                | Pivot rule                                                                                                                                                                    | State                                                            |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| 1. Bound kernel hot paths                            | D1-D7: shared segment compiler, stable identity, render-vs-repair delivery, source-qualified private identity, shared anchor change                                       | Focused behavior tests, full React partition, anchor family, typecheck, lint, production browser identity/interaction, frozen 100/1k/10k budgets                         | If identity or repair breaks, revert only that owner; do not global-disable retained flow or route normal text through external text                                          | checkpoint passed locally                                        |
| 2. Make normal mode safe                             | D8-D14: keyed flow invalidation, bounded DOM integrity ownership, hook-replacement counterfactual, mixed marks, and native composition locality                          | Safe independent cuts pass. Any hook/protocol cut either passes every replacement row or is explicitly withheld with its current owner intact                          | The hook replacement lacks native focus, IME, hydration, custom-host, and cleanup proof, so retain the current guards and close the phase without that cut                    | checkpoint closed: D8, D8a, D13 presentation, and D14 passed; D9-D12 withheld |
| 3. Replace pathological code DOM with a real adapter | D15 plus explicit Plate code-block adoption over Plite external text; no `editor-ai`                                                                                      | CodeMirror adapter passes model/selection/history/composition/collab/decorations/a11y, huge-code timing, code-block demo, print/find/copy, and strict Plite/Plate checks | If adapter/product proof loses behavior or misses budget, keep the existing single-Text native renderer; do not restore code lines or add token virtualization to normal mode | checkpoint passed locally |

## Phase 1 implementation receipt

Production owners:

- `packages/plitejs/src/react/components/editable-text.tsx` reuses the sweep
  compiler and stable segment identity.
- `packages/plitejs/src/react/hooks/use-plite-node-ref.tsx` separates render
  delivery from forced repair.
- `packages/plitejs/src/react/components/plite.tsx` and
  `packages/plitejs/src/react/hooks/use-plite-runtime.tsx` no longer issue
  blanket history invalidation.
- `packages/plitejs/src/react/decoration-source.ts` and
  `packages/plitejs/src/react/components/editable-text-flow.tsx` use private
  source-qualified reconciliation identity without changing public slice keys.
- `packages/plitejs/src/core/anchor.ts` shares one text-pair change through the
  existing mapping context.

Durable behavior proof:

- `packages/plitejs/test/react/text-render-identity-contract.test.tsx` covers
  stateful leaf survival, custom undecorated rerender, source/view identity,
  atomic source swap, and initially plain zero-width repair.
- `packages/plitejs/test/react/dom-strategy-and-scroll.tsx` covers affected and
  sibling custom-leaf identity through history.
- `packages/plitejs/test/anchor-contract.ts` rejects rebuilding one text change
  for every distinct endpoint.
- `packages/plitejs/test/react/decoration-rendering-contract.test.tsx` proves a
  first-bucket refresh does not reconcile the second retained flow.
- `packages/plitejs/test/react/decoration-manager-contract.test.ts` proves one
  listener shared by several changed buckets wakes once per publication.
- `packages/plitejs/test/react/mutation-observer-lifecycle-contract.test.tsx`
  proves descendant React presentation state persists without a root-wide
  claim while reserved Plite contract corruption still repairs.
- `packages/plitejs/test/react/decoration-rendering-contract.test.tsx` proves
  only the composing path leaves retained flow and an unrelated flow can
  reconcile without replacement.
- `apps/plite/tests/plite-browser/donor/examples/decorations-async.test.ts`
  repeats that locality check with Chromium's native IME transport and a model
  edit in the retained sibling.
- Anchor family: 76 passed, 0 failed.
- Full Plite React partition: 1,181 passed across 79 files, 0 failed.
- Focused text/decorations/external-text/DOM-shape set: 70 passed, 0 failed.
- Plite source-first typecheck and focused Ultracite passed.
- `pnpm check:plite:dev` passed all six affected-development steps in 21.2 s:
  85 entrypoint typechecks, app and www integration typechecks, 134 entrypoint
  tests, 232 Node contracts, 25 Bun benchmark contracts, 49 registered targets,
  public package/type proof, and the three-test Chromium smoke.

Production browser identity benchmark, 3 warmups and 15 samples:

| Characters / segment hosts | Historical current commit p95 | Production commit p95 | Historical current second-frame p95 | Production second-frame p95 |
| -------------------------- | ----------------------------: | --------------------: | ----------------------------------: | --------------------------: |
| 100 / 21                   |                        3.2 ms |                3.2 ms |                             17.1 ms |                     17.0 ms |
| 1,000 / 201                |                        6.4 ms |                5.4 ms |                             17.3 ms |                     17.4 ms |
| 10,000 / 2,001             |                       54.0 ms |               14.5 ms |                             72.2 ms |                     31.3 ms |

All frozen `max(1 ms, 10%)` non-regression budgets passed. Every sample added
zero leaf mounts and preserved host/state identity, exact text, decoration
output, and cleanup.

Trusted browser interaction replay passed insert, undo, redo, mark, repair,
follow-up input, focus, and exact caret/text checks. All five seeded leaf
instances retained local state. This is not native IME proof.

Anchor mapping evidence:

- Historical current at 10k text / 1,000 live anchors: browser p95 463.6 ms
  mounted and 372.1 ms unmounted, rebuilding 2,000+ changes.
- Disposable target: 11.3 ms mounted and 6.9 ms unmounted, at most one build
  per text pair/context.
- Production contract rejects repeat construction and the 76-test anchor family
  remains green. The historical browser target establishes cause; it is not a
  current end-to-end product benchmark.

Receipts live in
`docs/plans/artifacts/2026-09-03-plate-and-plite-rendering-safety-architecture/`:

- `text-identity.production-comparison.receipt.json`
- `text-identity.browser-production.benchmark.receipt.json`
- `text-identity.browser-production.interaction.receipt.json`
- `marked-mixed-parity.production.receipt.json`
- `anchor-mapping.current.receipt.json`
- `anchor-mapping.target.receipt.json`
- `anchor-mapping.browser-current.receipt.json`
- `anchor-mapping.browser-target.receipt.json`

## Regression matrix for remaining phases

| Behavior              | Required positive proof                                                               | Required negative/failure proof                                                        |
| --------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Plain and marked DOM  | Exact tags/styles/text, selection through boundaries, local leaf state                | Unsupported custom renderer stays on fallback without penalizing siblings              |
| Repairs               | Corrupt character data/zero-width DOM then type successfully                          | Ordinary React-owned update does not bump repair epoch or remount                      |
| History               | Text, marks, selection, and component identity through undo/redo                      | Skipped-history transactions do not create entries                                     |
| Decorations           | Sparse/dense/overlap/source swap/two views                                            | One source cannot reuse another source's private identity; cleanup leaves no listeners |
| React host writes     | Legitimate descendant state attributes persist                                        | Foreign writes before/after commit are repaired; nested/error paths balance            |
| Injection replacement | Built-ins and representative external stateful owner retain behavior                  | Missing/false targets do no work; hook order never depends on node/plugin count        |
| Commands and data     | Style/font/align/indent/list target the same nodes and preserve unset defaults        | Render cleanup cannot broaden commands or change serialized data                       |
| Native editing        | Unicode, backspace/delete, split, marks, clipboard, focus, remote edits               | Opaque handlers fire once; partial DOM without owned coverage is rejected              |
| Composition           | Start/update/end/cancel and remote conflict preserve final text/caret                 | Unrelated hosts are not replaced; late composition input is rejected once reset        |
| External code adapter | Model, directed selection, history, collaboration, decorations, a11y, print/find/copy | Stale adapter writes rejected; unmount/language switch cancels parsing and listeners   |

## Phase 3 benchmark contract

Freeze baselines before adapter/product changes:

- 100 / 1,000 / 10,000 / 100,000 code lines.
- The 448,889-character product fixture.
- One 10k / 100k / 1M-character line.
- Plain, whole-marked, mixed marks, sparse/dense decorations, and syntax tokens.
- One and two views; local insert/delete/newline, paste, undo/redo, remote edit,
  selection move, language switch, cold mount, first paint, and fully settled
  highlighting.
- Raw Plite external text, adapter-only, minimal Plate, and full code-block demo
  are separate measurements with equivalent rendered output.
- 3 warmups and 15 alternating samples. Report p50/p95/max and work counters.
  Target may not exceed baseline p95 by `max(1 ms, 10%)` for unchanged lanes.
- Keep existing product limits: the 10k-line route is queryable within five
  seconds; minimal input paint p95 <=200 ms; highlight settle p95 <=600 ms.
  Never borrow a minimal-editor result for full EditorKit.

External text already passed its independent 30-cell production benchmark,
including 100,000-line plain, marked, and code-shaped payloads. That proves the
Plite adapter boundary and canonical mark preservation. Because the adapter
does not receive rich-mark rendering instructions, it does not prove visible
mark semantics, CodeMirror, syntax highlighting, or Plate code-block behavior.

The corrected normal-DOM mark receipt uses identical output and alternates the
surface order for every sample. Whole-marked 480k-character text mounted at
32.6 ms p95 and typed at 41.9 ms p95. Ten thousand alternating mark runs
mounted at 440.0 ms p95 and typed at 47.1 ms p95. The matched fallback mounted
at 601.9 ms p95 and typed at 69.9 ms p95 in that 10,000-run cohort. All semantic
signatures matched. The largest production-to-control tolerance ratio was 1.24
in a smaller cohort, so the control comparison is reported rather than sold as
a universal speed win. This corrected production run is the frozen marked
baseline for future changes.

## Phase 2 checkpoint receipt

The safe normal-mode work passed: NodeKey-scoped decoration publication,
identical-output marked benchmarks, presentation-attribute ownership, and
composition-path locality. The attribute-source prototype showed that 10,000
first-party attribute reads could fall from roughly 500 ms to 6 ms, but it did
not cover native focus, IME, hydration, custom hosts, or the full claim-hook
matrix. That evidence is insufficient for a production render-protocol rewrite.

The checkpoint therefore retains D9-D12 and editor-critical exact-root claims.
No removed hook lacks a replacement because no hook was removed. This is the
safe pivot promised by Phase 2, not unfinished implementation disguised as a
pass.

## Phase 3 implementation receipt

Production owners:

- `apps/www/src/registry/components/editor/code-block-codemirror.tsx` is an
  explicit CodeMirror external-text component. It owns only code-block DOM,
  selection projection, native composition transport, decorations, code keys,
  search, and print expansion. Plite owns canonical state and history.
- `apps/www/src/registry/examples/code-block-demo.tsx` replaces only the
  code-block plugin in the code-block demo. Normal `EditorKit`, normal rich
  text, and `editor-ai` are unchanged.
- `packages/platejs/src/features/code-block/lib/BaseCodeBlockPlugin.ts` keeps a
  block-keyed syntax cache and one cancellable delayed refresh. Language
  changes publish only the exact code-block text keys.
- `packages/platejs/src/react/components/Plate.tsx` follows imperative
  read-only changes after mount instead of freezing the initial value.
- Plite external-text projection validation uses committed DOM and runtime
  ownership. It adds no render-time mutex, timer, or second scheduler.

Behavior proof:

- External-text contract: 50 passed, including exact patches, stale writes,
  directed selection, Plite-owned history, IME epochs, remote conflict,
  read-only, hydration, StrictMode cleanup, and duplicate-projection failure.
- Code-block syntax contract: 51 passed. The last-observer cleanup test failed
  first, then proved the pending refresh is cancelled when its owner unmounts.
- Plate mounted read-only contract: 23 passed.
- Code-block demo Chromium: 2 passed over the 10,000-line fixture. The rows
  cover bounded DOM, highlighting, type/undo/redo, copy/cut/paste, search,
  print, Enter, Tab/Shift-Tab, synthetic IME, remote edits, boundaries,
  language changes, viewing read-only, `aria-label`, and `contenteditable`.
- Plate facade inference, entrypoint typecheck, type tests, manifests, barrels,
  registry generation, registry changelog, www typecheck, and focused
  Ultracite pass.
- `pnpm check:plite:dev` passes all affected package, contract, public-type,
  build, integration-type, and Chromium-smoke owners.
- `pnpm check:plite` passes 85 typecheck tasks, 134 package-test tasks, 232
  tooling contracts, 25 benchmark contracts, public builds/types, and 735
  Chromium tests with 8 expected skips across 81 bounded batches.
- `pnpm check:plite:browser-matrix` passes Chromium 735/8 skipped, Firefox
  627/116 skipped, mobile Chromium 340/403 skipped, WebKit 648/95 skipped,
  and mobile WebKit 2/0 skipped, with zero retries.

Full-EditorKit product benchmark, 3 warmups and 15 fresh-context samples over
448,889 characters / 10,000 lines:

| Measurement                |      p50 | p95 / max |   Budget |
| -------------------------- | -------: | --------: | -------: |
| Navigation to queryable    | 1,067.70 ms | 1,282.91 ms | 5,000 ms |
| Input to next paint        |    23.4 ms |    32.1 ms |   200 ms |
| Actual new-token highlight |   403.7 ms |   410.1 ms |   600 ms |

Every sample preserved the exact model, 0 native Plite text hosts, 256 total
DOM elements and 63 mounted CodeMirror lines after the edit. The adapter
reported 0 stale writes, 0 resets, 1 decoration update, and only the 28 inserted
code units as projected work. The receipt is
`code-block-codemirror-product.receipt.json`, with source fingerprint
`cb5cf27d0abe7f94881b34382bdd4eace9f298836a2f7b171df749ace21d1610`.

The disposable adapter matrix also passes 100/1,000/10,000/100,000 code lines
and 10k/100k/1M single lines. The 10,000-line print projection materialized all
10,000 lines / 54,450 elements in 168.5 ms, then restored the 302-element
viewport DOM in 501.7 ms. These receipts are
`codemirror-external-text-prototype.json` and
`codemirror-external-text-print.json`.

The cost is explicit: browser page Find and a screen reader can inspect only
mounted CodeMirror content. CodeMirror search reaches offscreen text; copy and
print use the full canonical value. This trade belongs only to the opt-in huge
code lane. It is unacceptable as normal rich-text behavior.

## Gate decisions

- **G1 — hook replacement: closed by retention.** The prototype did not prove
  all first-party definitions, static output, custom hosts, slots, native
  focus/IME, hydration, and every DOM-commit-hook caller.
- **G2 — critical DOM ownership: closed by retention.** Presentation writes no
  longer trigger repair. Exact-root claims remain until an automatic owner
  passes the full replacement matrix.
- **G5 — code adapter and syntax owner: passed.** The explicit CodeMirror
  component, exact-key syntax refresh, product benchmark, and demo behavior
  matrix pass.
- **G6 — adapter decoration identity: closed by keeping the source-local public
  contract.** No current user job justifies a broader identity API.

## Verification commands

Phase 1 focused owners:

```sh
pnpm --filter plitejs exec vitest run \
  test/react/text-render-identity-contract.test.tsx \
  test/react/decoration-rendering-contract.test.tsx \
  test/react/decoration-manager-contract.test.ts \
  test/react/external-text-contract.test.tsx \
  test/react/rendered-dom-shape-contract.tsx

pnpm --filter plitejs exec bun test \
  --preload ../../config/plite-source-test-setup.ts \
  ./test/anchor-contract.ts \
  ./test/anchor-mapping-contract.ts \
  ./test/range-anchor-contract.ts \
  ./test/collab-anchor-position-contract.ts \
  ./test/history/anchor-history-contract.ts

pnpm check:plite:dev
```

Closure after Phase 2 or Phase 3:

```sh
pnpm check:plite
pnpm check:plite:browser-matrix
```

Run focused Browser proof on the affected example before broad closure. Use
`/examples/plite/external-text` for the substrate and the standalone code-block
demo for Plate adoption. Package/public changes also require inferred type
proof, current docs, a changeset, `pnpm brl` when exports move, and registry
generation when registry source changes.

## Checkpoint handoff

The final cut is intentionally asymmetric:

- Keep normal rich text fully DOM-present, including marks and decorations.
- Keep the current hook and exact-root claim owners until their complete
  replacement matrix exists.
- Use external text only through an explicit exact-one-Text element component.
- Use CodeMirror only for the opt-in huge code-block component.
- Keep whole-document virtualization separate.
- Do not restore code-line nodes, global retained-flow switches, automatic
  thresholds, editable islands, duplicate models, viewport token wrappers in
  normal mode, or a second history stack.

This is not a claim that Plate wins every benchmark against ProseMirror,
CodeMirror, Lexical, or Wordgard. It is the best proved division of
responsibility in this checkout: Plite canonical state, stable full-DOM rich
text, a bounded adapter for pathological blocks, and explicit document
virtualization. The risky hook rewrite was rejected instead of smuggled in
under a performance label.
