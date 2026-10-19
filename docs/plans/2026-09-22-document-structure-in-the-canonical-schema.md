---
review_scopes: [editing]
review_basis: [2026-09-22-editing-document-structure]
work_kind: implementation
---

# Document structure in the canonical schema

Status: Completed — implementation 2026-09-22, with the proof limits below

Objective:
Implement Plite document structure so an app can require a title and body through its schema, then remove the two app-owned forced-layout corrections.

Completion threshold:
The prefix grammar, enforcement, both consumers, documentation, generated outputs and affected package/browser proof are complete. Preserve any unrelated failing broad gate as an explicit proof limit.

Verification surface:
Live Plite schema definition/compiler/validator/fitter and tests, Plate and raw Plite demos, public docs, existing browser/benchmark targets, the [governing review](../research/review-records/2026-09-22-editing-document-structure.json), `bun docs/plans/artifacts/document-structure-prefix-probe.ts`, `git diff --check`, and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-22-document-structure-in-the-canonical-schema.md`.

Constraints:
- Plite owns neutral grammar and enforcement. Plate owns heading semantics. The app chooses whether its editor requires a title. Ordinary editors retain their existing schema.
- Preserve complete content, named-root closure, legal properties, selection direction, history and collaboration. An invalid change rejects atomically; fitting external content may add required nodes but cannot delete or retag incompatible input.
- Keep exact descriptor inference. No second runtime store, plugin, compatibility alias, app-owned safety correction or callback annotation workaround.

Boundaries:
- In scope: required child prefix plus one remainder; literal properties on required elements; validation, construction, fitting, incremental changes, schema contracts/identity, Plate facade, both demos, docs and proof.
- Out of scope: full regex content expressions, arbitrary path slots, pagination/visual layout, general corrections and unrelated editing work.
- The prior [execution](../research/review-records/2026-09-21-editing-command-input-rule-convergence-execution.json) remains completed for its own work and retains its proof limits; only its app-owned layout replacement is superseded.

Blocked condition:
A decision-changing type/runtime contradiction or failed matched scale probe that cannot be isolated. Neither was found during this planning pass.

## Why the existing owner must change

`packages/plitejs/src/interfaces/schema.ts:254-270` and `core/schema-definition.ts:1327-1426` define type/group rules with whole-content `min/max/default`; nested `all`/`any` discard cardinality. `core/schema-compiler.ts:295-301,2206-2321` compiles those rules to allowed-type sets and a type-only default. `core/editor-schema.ts:2891-2926,3432-3461` checks children by membership and count. `core/slice-fit/compiled-slice-fitter.ts:296-335,490-625` constructs and fits against that program. Plate's `lib/editor/editorApplicationSchema.ts:31` requires a literal `root.min`, and `internal/plugin/compilePlateModel.ts:1425-1435` checks it. No current rule means “first H1, then body.”

`apps/www/src/registry/examples/playground-demo.tsx:23-53,137-155,260-273` creates two editors and enables a children-only title correction. The [source-bound H2 probe](artifacts/editing-api-review/normalize-types-audit-probe.jsonl) confirms that a property-only level change bypasses it until a later structural change. Both English and Chinese fixtures already start with H1. `apps/www/src/app/(app)/examples/plite/_examples/forced-layout.tsx:16-71` has a distinct raw Plite job: title at index 0, paragraph at index 1, then other blocks. It repeats the same insertion/retagging algorithm. From first principles, these are two declarations of document shape, not two reasons for applications to own a correction engine.

The [prior four-editor audit](artifacts/editing-api-review/normalize-types-audit.md) supports schema ownership. ProseMirror/Tiptap match ordered types; they do not enforce heading level. Slate's forced-layout example uses the app-owned normalization approach we intend to cut. No fresh external scan changes that comparison.

## Chosen API and semantics

Add **`schema.content.prefix(required, rest)`** to the existing content builder. `required` is a nonempty readonly tuple of exactly-one `{ element, properties? }` slots. `element` is an installed descriptor or raw element name; `properties` are exact persisted property values for that slot. `rest` is one current content declaration and retains `min/max/default`. The total minimum is prefix length plus `rest.min`; the maximum adds `rest.max` when finite. Prefix slots cannot be optional, repeated, open, groups, `any`, `all`, or nested prefixes. Fail invalid declarations at compilation with the slot path. This is an honest fixed-prefix capability, not an incomplete general `sequence` language.

Keep the existing `schema.content.element`, `all`, `any` and `not` predicate contracts untouched: this job does not justify general property predicates or Boolean matching over them. A `prefix` passed as a nested `all`/`any`/`not` input must fail at declaration rather than discard its order. Infer slot property keys and values from its descriptor; for a raw name, check the declaration against the installed element schema at compilation. The same literal values construct a missing node. Validate against the owner's property descriptor, reject unknown/non-JSON/invalid/nondeterministic values, and compare resolved values when a stored default is omitted. Require a constructible type and complete required properties for a slot. Negative TypeScript cases must reject bad keys and levels for descriptor slots; no cast or caller generic. A raw-name slot cannot infer properties from an uninstalled string and relies on compile-time schema validation instead.

Plate call site:

```ts
import { BaseHeadingPlugin, schema } from 'platejs';

const ArticleSchema = {
  root: schema.content.prefix(
    [{ element: BaseHeadingPlugin, properties: { level: 1 } }],
    schema.content.group('block', {
      default: { type: 'paragraph' }, min: 1,
    })
  ),
} as const;
```

The playground passes `schema: ArticleSchema` to **both** `createEditor` calls. Its former `id === 'forced-layout'` condition had no live caller, so applying the declared policy to the actual playground editors makes the example enforce its visible H1. The raw demo declares title and paragraph elements with a `block` group in `defineEditorSchema`, then uses `schema.content.prefix([{ element: 'title' }, { element: 'paragraph' }], schema.content.group('block'))`. It removes its correction. The raw declaration provides constructible defaults. The app chooses the rule; Plite compiles/enforces it; Plate re-exports the builder. A standalone `LayoutPlugin`, `SlotPlugin` or title root has no independent job. Keep general corrections for genuinely custom semantic transformations.

## Runtime contract

1. Extend the existing `SchemaContent` declaration, `CompiledSchemaContentProgram`, default plan, structural contract, fingerprint, restore and schema delta. Encode prefix constraints deterministically, including descriptor source remapping under schema overrides; a changed property constraint changes schema identity. Preserve the old compiled fast path when no prefix exists. No scheduler, per-child cache, parallel state or new document field. `prefix` is an outer content shape, not a nested `SchemaContentRule`, so existing Boolean rule compilation does not inherit positional semantics by accident. Frozen schema inference includes prefix slot types alongside remainder types. Plate's `EditorApplicationSchema.root` type and `compileEditorApplicationSchema` accept and validate the effective total minimum, not a missing top-level `min` field; existing root declarations with literal `min` retain their current behavior.
2. Full validation checks prefix entry `i` at index `i` and all later children against `rest`. Incremental validation checks changed indexes and the fixed prefix boundary. A property-only change to the first heading must revalidate its parent position; children-event dispatch alone is insufficient. Unrelated body text must not scan the whole root.
3. Construct a missing prefix element with its literal properties and that element's existing child default. Construct missing body content only through `rest.default`; fail an ambiguous default rather than guessing. A valid pre-existing required node keeps its identity and properties.
4. Closed-document and `ContentSlice` fitting may prepend missing required nodes before intact incompatible body nodes if `rest` admits those nodes. If not, reject the whole fit; never turn a table or media node into a heading, lose nested roots, or partially publish a document. Open slices use the same target grammar. Existing origin/selection mapping and named-root closure remain authoritative.
5. An authored H1-to-H2 property change at the required position is invalid. The existing command/transaction admission should decline before publication; an explicit illegal low-level update fails atomically with a schema diagnostic. It does not silently move or retag the node. Fitting an external slice may prepend an H1 and preserve an incoming H2 in the body; authored commands must not use that recovery to reinterpret the user's H1-to-H2 edit. Deleting a required title may yield a valid empty title while preserving other blocks. Intentional selection deletion still deletes the selected content. Undo/redo and remote replay use the same canonical document law or reject invalid input, not a local follow-up correction.
6. Primary, named and element-child content can opt in independently. No public `main` root key. A plain schema without `prefix` remains behavior-equivalent.

The strongest rejected alternative is `schema.content.sequence` with arbitrary repetition/alternation. Both live jobs are bounded required prefixes followed by one remainder; a full sequence matcher adds ambiguity and fitting state with no current reader job. Restoring `NormalizeTypesPlugin` or adding a richer Plate variant duplicates schema authority and cannot serve raw Plite. A persisted Title node solely to encode H1 styling changes data ontology for the wrong reason.

## Adoption and proof

| Slice | Owner and adoption | Exit/proof |
| --- | --- | --- |
| 1. Declaration | Plite schema interfaces/definition/compiler/contract and exact types | Compile/default/invalid-property and nested-prefix diagnostics, descriptor-source override remapping, identity/delta/restore round trip, inferred `Value` covering prefix and remainder plus rejected bad descriptor-slot properties; focused `schema-definition.test.ts`, `schema-compiler.test.ts`, `schema-contract-generation.test.ts`, `schema-identity-contract.test.ts`, package source typecheck |
| 2. Enforcement | Plite validator, changed-index admission and canonical fitter | Property-only H2 rejects atomically; missing prefix fills; table-before-title remains complete or whole fit rejects; named roots, open/closed slices, selection and replay agree. Run existing `incremental-schema-validation.test.ts`, `slice-fit-contract.test.ts`, `content-slice-laws.test.ts`, `selection-protocol.test.ts`; add the smallest public-boundary H2 and lossless-table regression cases; focused Yjs schema replay if affected |
| 3. Consumers | Plate application-schema root type/compiler, both playground editor creations, raw Plite demo | Accept effective prefix minimum without a cast, delete `PlaygroundTitlePlugin` and raw `forced-layout` correction; retain English/CN visible title and body. Plate source types/tests and managed Chromium forced-layout/playground route: H2 toolbar action, paste, delete, undo/redo, caret and follow-up typing, no console error. Resolve actual browser test/route from live registry before running |
| 4. Teaching and closure | Plate Docs, behavior/doctrine owners, generated exports/registry | Move one required-title recipe into `content/docs/(guides)/schema.mdx`; delete English/CN forced-layout pages; repair `api/utils.mdx`, `trailing-block.mdx`, `docs-icons.tsx`, metadata, inbound links and pager/sidebar. Resolve the now-stale destination in `docs/plite/reference/public-coverage.json` through its provenance owner. Keep interactive demo if useful. Regenerate the docs registry so the obsolete `forced-layout-docs` item and generated overlay disappear; never hand-edit `public/r/forced-layout-docs.json`. Run `pnpm --filter www build:source`, `pnpm --filter www check:docs`, exact route check, `pnpm brl` if exports move, `pnpm --filter www build:registry` on `next`, doctrine checks and affected full package gates |

`content/docs` teaches Plate as one public editor API. Raw Plite contributor examples stay outside that tree. Inspect the current docs redirect facility before deleting `/docs/forced-layout`; remove all internal links and record any external-link consequence rather than invent a second router. A persisted app schema whose root grammar changes needs an app-owned versioned migration; the playground's in-memory fixture is not evidence of safe migration. No compatibility alias for Normalize Types or the app correction.

## Scale gate

This changes hot content admission. The repeated unit is a changed child at a parent; independent variables are sibling count, prefix length and touched-index count. [The frozen disposable probe](artifacts/document-structure-prefix-probe.ts) compares current allowed-type membership with fixed-index prefix matching. Cohorts: 100, 1,000, 10,000 and 50,000 siblings; 15 alternating samples × 200,000 checks after warmup. Predeclared budget: <=1 visited node/check, target p50 <=1,000 ns and <=3× baseline p50 + 100 ns. Correctness guards reject H2/wrong first and second types and accept valid body. The [receipt](artifacts/document-structure-prefix-probe.json) records source hashes, runtime, p50/p95 and counts; all four cohorts pass.

This is only a matcher-cost falsification probe. JIT nanoseconds do **not** prove full editor speed, cold compile, fitting, DOM or collaboration. During implementation extend the existing `plite-schema-architecture` and construction/fit-locality targets with prefix lengths 1 and 2 and the same four document sizes. Measure cold compile, warm property-only edit, unrelated body edit, paste at prefix boundary, missing-prefix fit, full validation, retained contract bytes and changed-index count. Freeze target-specific materiality before the production rerun. Final acceptance: existing plain-schema budget stays green; one property edit visits changed indexes plus prefix length, independent of document length; p95 meets the owning target's frozen noise/materiality rule; correctness/browser guard passes. A failing production path returns to the canonical owner; do not keep a fast but broken callback. Existing core profiling/benchmarks own detection; no new production telemetry or protected fixture data.

## Failure scenarios and limits

- H2 toolbar/property edit at index 0: decline or atomic diagnostic in the same transaction, with no delayed snap-back, stray history entry or UI error.
- Table/media paste before title: prepend a valid title only if the remainder admits the complete input; otherwise reject atomically. Assert marks, nested roots and mapped selection, not just visible text.
- Delete/undo/remote edit at the prefix: construct or restore one canonical valid state; no second app correction, divergent history or remote-only repair.

The prototype does not model compiler/fitter cost, full editor work or native behavior. These are execution proof gates, not results of this design. No issue/PR or new external research shard is required. No publication or Autoreview on `next` is authorized by this planning request.

Work Checklist:
- [x] Governing review, current source and both consumer shapes reconciled.
- [x] Public call shape, hard cuts and Plite/Plate ownership selected.
- [x] Construction, fitting, incremental property, selection, history and collaboration laws specified.
- [x] Scale applicability and bounded pre-acceptance matcher receipt recorded with limits.
- [x] Adoption, docs merge, behavior/doctrine repair and exact execution proof named.
- [x] Planning-only boundary and open production risks retained.

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Review/source | yes | `2026-09-22-editing-document-structure`; live compiler, validator, fitter and two demos inspected |
| Best API shape | yes | Prefix chosen after hard-cut and full-sequence comparison above |
| Scale-sensitive decision | yes | Frozen prototype matcher receipt; full-operation rerun required in execution |
| Execution authority | yes | User subsequently said `go`; implementation is recorded below |

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary design readiness | yes | Source, API, owners, adoption and risks resolved | Sections above |
| Pre-acceptance scale law | yes | Matched bounded prototype passes | `artifacts/document-structure-prefix-probe.json` |
| Final runtime/browser proof | yes | Execute affected package, browser and production-path checks | Evidence and limits below |
| Publication and Autoreview | no | No PR; `next` forbids Autoreview | Current branch `next` |
| Plan checker | yes | Run after final pass | `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-22-document-structure-in-the-canonical-schema.md` |

Verification evidence:
- Live source and existing [headless H2 reproduction](artifacts/editing-api-review/normalize-types-audit-probe.jsonl) inspected. The old package/browser tests do not cover the new API.
- `bun docs/plans/artifacts/document-structure-prefix-probe.ts`: four isolated matcher cohorts passed the frozen budget; source hashes and measured values are in the receipt.
- Final plan checker and whitespace proof: recorded by the final-pass command results, not product verification.

Open risks:
- The prototype cannot prove the full production path; schema contract serialization, selection-preserving fitting and Yjs replay are the first implementation gates.
- The bounded `prefix` API cannot express arbitrary interleaved/repeated regions or general property predicates. A real third consumer requiring those would reopen this choice; none appears in the scoped census.
- A saved named schema needs a versioned migration when its grammar changes; the demo stores no external document.

Execution state:
- [x] Prefix declaration, type inference, compiler and contract.
- [x] Full/incremental validation and lossless fitting, including rejection of an incompatible open table slice.
- [x] Plate and raw Plite consumer adoption.
- [x] Docs, generated registry, API reference and doctrine closure.
- [x] Focused, package, browser and production-path performance proof, with the broad-gate exceptions recorded below.

Execution evidence and limits:
- [Verification receipt](artifacts/document-structure/verification.json), [strict construction data](artifacts/document-structure/construction-benchmark.json), and [full architecture diagnostic](artifacts/document-structure/architecture-benchmark.json) bind the local observations below.
- Plite package typecheck and full development lane passed; the Yjs partition passed 274 tests, including remote deletion of a required title. Plate basic-nodes tests passed 55 cases. Website typecheck (including API reference, docs source and registry checks) passed; `build:registry` regenerated the docs payloads. `pnpm brl`, doctrine version validation and benchmark-target validation passed.
- Raw Plite forced-layout Chromium passed 2 tests. The playground's H2 toolbar attempt declines without an error, and its existing typing/plain-text-paste test passes after keeping text-compatible paste inside the title. The full suggestion Chromium suite passed 28/30: one first-run paste failure was repaired and the targeted retest passed; the remaining discussion-count assertion expects 5 but observes 4 even when this plan's playground schema is disabled. That unrelated failure remains open.
- Strict construction benchmark passed eight prefix cohorts from 100 to 50,000 body nodes, with changed span 1 and required-node identity retained. The full non-strict architecture benchmark measured one-slot prefix compilation at 0.377 ms p95 and two-slot at 0.114 ms p95, below the added 16 ms gate. The strict architecture run still fails its pre-existing equivalent-reconfiguration ratio gate (observed 5.42× and 19.7× on two attempts against 1.05×); the non-strict full run observed 13.82×. No threshold was weakened. The disposable matcher probe remains only planning evidence.
- No PR or deployment was requested or performed. Saved app documents need an app-owned schema-version migration before adopting a new required prefix.
