---
review_scopes: [ui]
review_basis: [2026-09-17-ui-source-and-command-ownership]
work_kind: implementation
---

# UI composition, commands and installation

Status: Completed

Objective:

Adopt the smallest copied-command and installation contracts for the `ui`
review, prove the generated Base and Radix applications, and record the rejected
geometry experiment without weakening its acceptance gate.

Completion threshold:

The work is complete when every accepted slice has migrated callers, generated
artifacts, documentation and direct proof; the geometry candidate has a frozen
benchmark receipt and an explicit adopt/reject disposition; and the behavior,
decision and ledger owners agree on the result.

Work Checklist:

- [x] Reconcile the governing review, changed inputs and subsequent execution;
  retain valid decisions and original proof limits. Source: Task feature-history
  closure and user instruction to continue the recommended design plan.
- [x] Specify normal/custom command call sites, concrete owners, deleted
  dispatch surfaces, capability and selection/focus laws, and all affected
  callers. Source: Best API and the review's command findings.
- [x] Specify deterministic installation dependency derivation and delivery
  references, preserving explicit install intent, external URLs and provider/
  style/environment identity. Source: review's reproduced registry failure.
- [x] Resolve neutral kit sharing, optional placement and raw geometry with
  truthful acceptance or explicit measurement gates. Source: the ten review
  units, Best API scale gate and Plate Plan.
- [x] Cover adoption, types, docs, registry output, current behavior laws,
  exact proof commands, failure scenarios and rollback. Source: Plate Plan,
  project AGENTS and Task source authority.
- [x] Inspect the final plan, challenge its command and installation contracts
  against source, repair every material gap, validate links/accounting, run its
  completion check, record a source-bound design outcome and reconcile the
  decision/hub. Source: Task feature-history closure, independent last-pass
  audits and Autogoal checklist retention.
- [x] Adopt the accepted command, neutral-kit, dependency and delivery slices;
  reject the geometry candidate under its frozen p95 gate; prove generated
  Base/Radix consumers, website runtime behavior, RSC rendering and registry
  publication; reconcile current evidence and record a source-bound
  implementation outcome. Source: authorized Task execution.

Constraints:

The governing [audit](../research/decisions/registry-ui-ownership.md) accounts
for ten semantic units and 60 census groups. Preserve independent features,
app-owned arrays, distinct live/static aggregates, optional fixed-toolbar
placement, exact mounted-view floating/block UI and feature-owned integration.
No universal runtime command/feature catalog, package preset or new plugin
framework. Preserve independent feature ownership and install-time provider
selection. Publication remains outside this task. Disposable probes are kept
only when they are evidence for a settled decision.

Verification surface:

Planning checks: current source and consumer contracts, previous execution
evidence, doctrine/behavior-law applicability, types of illustrative calls,
plan links and history schema. The earlier 20-test pass and response failure
remain dated evidence; they do not certify the proposed implementation.
Execution commands and their precise claim boundaries will be listed below.

Boundaries:

Lead owns implementation, proof and reconciliation. Earlier read-only sidecars
supplied bounded design evidence; product mutation and verification remained
with the lead. There are no assigned human prerequisites. A failed acceptance
gate keeps the current production owner and records the rejected candidate.

Blocked condition:

No external blocker remains. The raw geometry candidate failed 2 of 12 frozen
p95 cohorts after passing correctness, so the manual production implementation
was restored and retained. Publication is not part of this work.

## Reconciled basis

Ledger lookup finds no source changes in the 60 `ui` groups or captured product
inputs since the review. Its stale inputs are the review skill and Task review
adapter, whose history protocol changed. Four later-dated recovery records
describe older work and use historical-unbound evidence; they are not new UI
adoption. The governing review remains valid input to detailed design.

The governing review remains `2026-09-17-ui-source-and-command-ownership`.
This design binds its execution outcome to that review. The four recovered
historical outcomes remain useful history with unknown current proof.

## Target and hard-cut decisions

App arrays own feature membership. Copied JSX owns labels, layout, capability
presentation and focus policy. Feature operations own edits. Build tooling
derives installation facts; the authored registry retains install intent. The
selected target needs no new package API because copied UI declines unsupported
selection shapes instead of emulating package operations.

| Audit unit | Decision, owner and adoption | Hard-cut answer and proof boundary |
| --- | --- | --- |
| Aggregates and shells | Keep `EditorKit`, `BaseEditorKit`, `Editor`, `EditorStatic` and existing frame/scrollport ownership. | Plain arrays already are the smallest app composition. A package preset or universal catalog would add an owner. No aggregate rewrite. |
| Neutral feature policy | Merge Align and Line Height live/static policy into server-safe `AlignKit` and `LineHeightKit`; delete the two static duplicates. | Both pairs compile identically in the planning probe. Static import and mounted proof still belong to adoption. Font has different policy and stays separate. |
| Fixed placement | Keep optional `FixedToolbarPlugin`/`FixedToolbarKit` and ordinary custom JSX. | Deletion only redistributes a real optional-install job. It adds no provider. No new placement abstraction. |
| Floating/block placement | Keep exact mounted-view slots and `editableRef`. | A generic sibling loses a real ownership input. No store, plugin or wrapper deletion is justified by the current evidence. |
| Insertion/conversion | Cut string dispatch and fallback; use typed operations at each menu item, retaining only shared synchronous empty-block insertion policy. Split mutually exclusive leaf formats from wrapper/layout actions and expose each feature's truthful selection capability. | Delete execution catalogs rather than replacing them with a closed catalog. Unsupported Code Drawing conversion disappears. Copied UI never path-loops around a narrower feature operation. See command contract. |
| Existing presentation controls | Keep overlay capture, More, Mode, import controls and app settings. | Their jobs differ; no common registry or package promotion. Block-menu alignment/indent use their existing semantic feature owners. |
| Raw hovering toolbar | **Defer** runtime choice; candidate is existing exact-Editable `useSelectionGeometry`. | There is no matched scale receipt. Keep raw-demo identity and freeze the experiment below before accepting a replacement. |
| Install facts | Derive item and provider package needs before consumption; remove hand-maintained entrypoint/optional-peer/provider arrays and unused `registry-icons.ts`. | Keep item names, file targets, CSS and intentional no-file bundles. Source cannot recover intent. |
| Provider/style delivery | Keep sparse adapters; compile production and development payloads in one generation; keep shared intermediates neutral and bind internal URLs at public serialization. | Delete mode-dependent registry builds and prefix repair. Providers have real focus/render differences; no runtime provider switch. |
| Proof/generated contracts | Use existing source, response, install and browser owners. Keep editor contract generation optional for consumers. | No new proof framework or ordinary-setup code generation prerequisite. |

Value rank: environment-correct complete installs, correct typed commands,
neutral-kit deletion, then the geometry candidate. Execution order follows
dependencies, not this ranking. No compatibility aliases are planned.

## Copied command contract

The old `insertBlock(editor, 'heading-2')` and
`applyBlockAction(editor, value)` hide operations behind unrelated labels. The
menu item should call the installed feature directly. `value` remains a local
presentation/search key and, for the leaf-format group only, a radio key. An
unknown key never resets the block or edits anything. Resolve a key only
against that menu's actual item objects.

For an ordinary custom control, the entire operation remains:

```tsx
import { BaseHeadingPlugin } from 'platejs';
import { useEditor } from 'platejs/react';

function HeadingButton() {
  const editor = useEditor();
  return (
    <button onClick={() => {
      editor.update((tx) => {
        tx.plugin(BaseHeadingPlugin).insert({ level: 2 }, { select: true });
      });
    }}>
      Insert heading
    </button>
  );
}
```

This illustrates the typed edit only. A shipping toolbar uses the existing
ToolbarButton/overlay contract, checks installed/editable eligibility, and
applies its focus policy. It does not need a command registration API.

The sole shared copied helper retains a current user behavior: selecting the
same empty block in Slash is a no-op, while inserting a different kind can
replace the empty block. It takes an already-open transaction, never opens
another one, and never performs asynchronous work or focuses the DOM:

```ts
import type { Element, PluginTransaction } from 'platejs';

export function insertBlock(
  tx: PluginTransaction,
  recipe: {
    matches: (block: Element) => boolean;
    insert: (options: {
      replaceEmpty: boolean;
      select: true;
    }) => undefined;
  },
  options?: { upsert?: boolean }
): void;
```

It reads `tx.nodes.block()`, returns if absent, evaluates `matches` once, and
skips a matching empty block only for `upsert`. Otherwise it calls `insert`
once with `replaceEmpty: !matches` and `select: true`. The callback's
`undefined` return excludes promises; use a block body around feature calls.
Keep this in the copied `transforms.ts` while it has two actual consumers.
It is not a package abstraction. Inlining it loses to duplicated behavioral
policy in Insert and Slash; a typed global recipe collection loses to local
operations without a second registry.

```tsx
import { BaseHeadingPlugin } from 'platejs';
import { insertBlock } from '@/registry/components/editor/transforms';

// Inside an eligible Slash item, after the existing combobox opens its update:
onSelect={(tx) => {
  insertBlock(tx, {
    matches: (block) =>
      !block.listType &&
      block.type === editor.plugin(BaseHeadingPlugin).schema.type &&
      block.level === 2,
    insert: (options) => {
      tx.plugin(BaseHeadingPlugin).insert({ level: 2 }, options);
    },
  }, { upsert: true });
}}
```

Insert uses the same body inside `editor.update`, without `upsert`. Every
non-list predicate excludes `listType`; list matching includes its exact
`listType`; headings include `level`; columns match the feature's configured
schema type without ancestor/child-count inference. No matching logic depends
on labels or hard-coded schema names.
Inline Date, Footnote and Equation call their descriptors directly in the
existing transaction. Link uses the copied configured `linkPlugin` portal.
Async image/embed input uses the feature's existing `api.insertUrl`; do not
retain a transaction through a prompt or await.

### Conversion and eligibility

`Turn Into` is not one radio domain. Text, headings and list styles are
mutually exclusive leaf formats and remain a radio group. Quote, Details, Code
and three columns are wrapper, merge or layout actions; render them as ordinary
action/checkbox items with feature-aware active and eligibility state. The
leaf current-type reader may continue to unwrap configured containers, but it
must not claim that an active wrapper is the selected radio value.

| Offered action | Selection contract | One update's existing operations |
| --- | --- | --- |
| Text | Expanded text ranges and exact disjoint node membership. | Clear List when installed, then `tx.blocks.reset()` to the immediate schema default. |
| Heading | Expanded text ranges and exact disjoint node membership. | Clear List when installed, then set the configured Heading type and chosen level. Selecting the already-active radio is a no-op. |
| List | Expanded text ranges and exact disjoint node membership. | Clear List, `tx.blocks.reset()`, then List `toggle({ type })`. |
| Quote | Expanded text ranges and exact disjoint node membership. | Clear List when installed, then Blockquote `toggle()`, which wraps or restores the schema default over exact blocks. |
| Details | One contiguous sibling block run when inactive; exact highest Details ancestors when active. Mixed active/inactive membership is ineligible. | Details `wrap()` when inactive and `unwrap()` when active. Disable disjoint gaps, mixed parents or mixed state and recheck before update. |
| Code | One contiguous sibling block run with homogeneous active state. | CodeBlock `toggle()`. Disable disjoint gaps, mixed parents or mixed active/inactive state and recheck before update. |
| Three columns | Exactly one eligible block. | Column `toggle({ columns: 3 })`. It is a singular layout action, not a block-type radio value. |

These are direct callbacks using descriptors from `platejs`, `platejs/details`
and `platejs/layout`. Delete Code Drawing from Turn Into and Block Menu; keep
its existing insertion from `platejs/code-drawing` when installed. The current
drawing law specifies atomic insertion, not lossless conversion of arbitrary
selected content. Adding a conversion API just to preserve a broken menu item
is unjustified.

Check each operation's actual installed descriptors, editable target and
selection shape before offering it, and recheck at invocation. Absent features
disappear; read-only controls cannot mutate. Slash must check before
committing/removing its input. Hide empty groups. Do not infer availability
from an aggregate kit name, a schema type string, or every plugin imported by a
shared helper. Optional List cleanup must not make List a requirement for
Text/Heading/Quote. Guard optional Heading reads in the leaf current-type label
and CodeBlock reads in the Slash trigger; `.installed === false` portals cannot
be read for schema or capabilities. Text and List reset through schema policy,
so neither requires a copied Paragraph lookup. Block Menu's AI, Indent and
TextAlign entries have the same availability checks.

Use Plite's plural block/selection reads to classify exact membership and
feature-aware active state before structural actions. Details and Code require
an unambiguous homogeneous action as specified above; Columns accepts one
block. Keep installed actions visible but disabled for unsupported current
selection shapes; absent features disappear. An unsupported shape must produce
no update. Do not
turn a disjoint selection into its representative range, and do not repair a
narrow feature operation with copied mutable-path loops. Leaf formats, Quote,
alignment and indent preserve the exact selected block set in one update.
`BlockContextMenu` alignment and indent use the existing TextAlign and Indent
selection-aware operations, with their feature semantics and one undo step:
`editor.plugin(BaseTextAlignPlugin).update.set(align)` and
`editor.plugin(BaseIndentPlugin).update.increase()`/`decrease()`. This fixes an
additional source-confirmed defect: `selection.nodes()` returns no entries for
expanded text selection, so the current loops do nothing. The observed issue
is missing text-selection support, not proven path corruption. Check configured
alignment defaults, indent bounds and nested content as part of adoption.

### Target, focus and lifetime laws

- Reuse `toolbar-overlay.tsx` capture. The editor/view captured when the menu
  opens remains the target even if focus changes before selection. An operation
  must never retarget another mounted view or a replacement document.
- Insert must actually honor `focusEditor`. Ordinary edits return focus to the
  editor; Equation, Link, AI and other UI-opening actions leave final focus to
  that UI. Final-focus callbacks must not override an explicit false value.
- Slash removal and synchronous insertion remain one combobox commit and one
  undo step. AI's UI action remains outside the synchronous edit callback.
- Async media keeps the existing feature-owned captured target and cancellation
  behavior. Read-only changes, detach, document replacement and cancelled input
  must not insert into a new target or steal focus.
  Invoke `api.insertUrl` before awaiting so it captures the target; handle
  resolver rejection and its false cancellation/missing-target result. Restore
  focus only if the captured view remains editable and no newer user action
  owns focus. Never swallow a meaningful insertion failure inside Slash: failure
  must roll back the combobox removal with the edit.
- Fixed toolbar context follows the authored root's selected view. Floating
  toolbar and block menu keep the exact mounted-view slot. Neither adjacent JSX
  nor a label identifies a command target.

### Caller and deletion manifest

All paths in this table are relative to `apps/www/src/registry/components/editor`.

| Caller | Adoption |
| --- | --- |
| `insert-toolbar-button.tsx` | Local typed item callbacks, per-feature eligibility, actual focus policy, synchronous helper/direct inline/async feature branches. |
| `slash.tsx` | Same feature operations in the existing combobox callback; eligibility before commit; no nested update. |
| `turn-into-toolbar-button.tsx` | Local typed callbacks; split the leaf radio group from structural actions; move the leaf current-type reader here; add feature-aware active/selection eligibility; keep mixed/unknown presentation honest; remove unsupported conversion. |
| `block-menu.tsx` | Direct typed actions, structural eligibility and selection-aware alignment/indent; keep context selection and exact view. |
| `transforms.ts` | Delete `applyBlockAction`, `insertInlineElement`, dispatch maps, `headingLevels`, `listTypes`, `getListType`; replace the old insertion signature with the bounded transaction helper. |
| `transforms.spec.ts`, `transforms-combobox.spec.ts`, `turn-into-toolbar-button.spec.ts` | Rebind useful behavioral cases to the actual operations/menu item owners; retain empty-block, full selection and atomic undo assertions. No deleted-symbol tests. |

The playground template has four legacy consumers, but `templates/**` is
CI-controlled output. Update registry inputs; do not hand-edit the template.
Move dependency edges from the formerly broad transforms item to the specific
menu source that imports each feature. Run the direct file-ownership audit;
transitive reachability alone does not prove correct item ownership.

## Shared neutral kits

Keep the existing install names `align` and `line-height` and exports
`AlignKit`/`LineHeightKit`. Use BaseTextAlignPlugin/BaseLineHeightPlugin from
`platejs`, preserve the current inject configuration and target names, remove
`'use client'`, and export readonly tuples. No alias or alternate static name.

`plugins-static.ts` imports those arrays directly. Delete `align-static.tsx`
and `line-height-static.tsx`, their registry items, and the corresponding
BaseEditorKit dependency edges. Remove toolbar edges from the shared feature
items; fixed/custom toolbar compositions own their controls. Preserve the
actual direct dependencies of those controls after source derivation.

Adopt in `registry-features.ts`, aggregate tests, the English and Chinese Text
Align and Line Height reference pages under `content/docs/(plugins)/(styles)`,
and any current generated editor contracts. Sweep current imports/install
examples for the deleted names; retain immutable historical records. Font,
feature components, renderer-specific integration and live/static aggregate
membership do not change. `BaseEditorKit` has a real React Server Component
consumer at `apps/www/src/app/(app)/docs/examples/server-side/page.tsx`, so the
adoption gate includes a Next build and a render of that route. The
[probe](artifacts/2026-09-18-ui-design/neutral-kits-probe.ts) and
[receipt](artifacts/2026-09-18-ui-design/proof.json) support policy sharing,
not an RSC, browser, bundle-size or performance claim.

## Installation contract

### Derive facts before consumption

`src/registry/registry.ts` stays a pure catalog/composition owner. It may select
the provider's authored files; it must not read the filesystem, traverse the
package DAG, or import generated output. A build-time analyzer runs after that
selection and before any website or artifact consumer sees package metadata:

```ts
import type { Registry } from 'shadcn/schema';

export function deriveRegistryPackageDependencies(
  registry: Registry,
  options: { sourceRoot: string }
): Registry;
```

The analyzer lives in `apps/www/scripts/registry-package-dependencies.mts` and
receives its registry argument; it never imports `registry.ts`. Extract import
parsing and installed-target resolution from the executable
`check-registry-source.mts` into a side-effect-free leaf module shared by the
analyzer and checker. Copied source type imports still need their package
installed. Include static imports, reexports, TS import queries/import-equals,
literal dynamic imports and unshadowed `require`; member calls like
`Plugin.require` are not module imports. Accept string literals and templates
without substitutions. Reject computed module specifiers with location
context and require finite literal branches; authored metadata does not excuse
an unknowable module target.

Resolve public Plate/Plite entrypoints exactly through
`tooling/entrypoints/entrypoint-dag.mjs`, traverse explicit dependency,
external-entrypoint and peer edges with visited sets, and attach required peers
to the source-owning item using package-manifest versions. Asset/type-only
exports use their owning package's declared export, not prefix guessing or an
invented runtime DAG node. A compatible authored version remains authoritative;
an incompatible authored/derived range fails with item/file/specifier context.
Missing source, unknown exports, absent peer versions, broken internal registry
names and ambiguous or missing installed targets are diagnostics, not skipped
dependencies.

Keep explicitly authored third-party dependencies, bundles, style-only items,
route targets and CSS. The cut is the manually maintained
`EDITOR_*_PACKAGE_ENTRYPOINTS`/optional-peer summaries in
`registry-package-dependencies.ts`, not all intentional metadata. Required
peers belong on leaf owners; installation already traverses registry edges.
Do not flatten every transitive peer into each parent item. Pure no-file
bundles remain legal, and cycles terminate by visited identity.

Provider package lists are also derived facts. Delete `packages` and
`EDITOR_REGISTRY_VARIANT_PACKAGE_NAMES` from `registry-variants.ts` plus the
manual apply/remove logic in `registry.ts`; selected provider source imports
own those dependencies. Delete the production-dead
`toLocalRegistryDependency` helper and its name-only tests. Preserve authored
versions and every independent bundle, CSS, target and registry edge.

The build direction is authored catalog + selected provider source + existing
DAG → one generated metadata snapshot at
`apps/www/src/__registry__/registry-metadata.json` → preview index,
`rehype-utils.ts`, source checks and shadcn build/materializer → public
artifacts. The snapshot contains a generation id and one schema-compatible
derived `Registry` per `PlateRegistryBase`, with item metadata and file
descriptors but no React components. Consumers select an explicit base; only a
job that already means the default Base/Nova composition may use the default.
It is the sole Plate dependency source for those consumers.
`rehype-utils.ts` must not run filesystem/DAG analysis at request time or import
the React preview index. Wire snapshot generation before `dev`, `build` and
`build:registry`; `typecheck` runs a no-write freshness check. Preserve
React/ReactDOM as validated host prerequisites and the declared host-alias
policy. The preview index serializes the derived `dependencies` as well as
`registryDependencies`.

`build:registry` is one environment-neutral compiler invocation. It builds raw
Base and Radix source once with neutral `@plate/*` dependency identities,
materializes styles once, then serializes complete `public/r` and `public/rd`
trees with their respective public roots. Delete the `NODE_ENV` output branch,
the separate `rd` build command and mode-dependent output-target owner; update
their callers to the unified command. This removes build order as a state
dimension rather than testing both orders forever.

No reverse import from catalog/analyzer to generated files. Derive once per
selected provider input, without a process-global cache or a second graph.
Delete unused `registry-icons.ts`; retain `registry-pro.ts`, whose docs/rehype
consumers are real.

### Canonical payloads, sparse overlays and public URLs

Keep `public/r` and `public/rd` as the complete directory-specific Base/Nova
baselines emitted by that same compilation. A second complete
`src/__registry__/overlays/base-nova` tree has no independent job and is
deleted. Only shared sparse provider/style overlays use neutral
`@plate/<name>` identities; external URLs, other registry namespaces and bare
shadcn items retain their meaning.

Preserve direct static installation of both canonical directories. Item
payloads, `registry.json`, and `registry-docs.json` remain complete. Existing
public entrypoints are not redirected through a mandatory application runtime.
At response time, normalize only the selected canonical payload's exact own
origin/directory references, merge the requested neutral sparse overlay, then
serialize every internal dependency recursively using the request origin/base
path, `r` or `rd`, and requested style spelling, including the two Radix
aliases. Index merging retains metadata/file-content conventions.

The generated manifest is authoritative. Overlay absence means inheritance
only when the manifest contains the requested style and does not list that
file. A listed-but-missing overlay, absent canonical item, unknown generation,
or manifest/index/item generation mismatch fails closed. Invalid item/style
still returns null; incomplete generated state is an error rather than a
plausible payload from the wrong provider or style.

Delete source-mode URL-prefix rewriting. Only exact `@plate/` references are
expanded; unrelated absolute URLs are never reinterpreted from host/path
similarity. Preserve the current `@shadcn/` to bare-item adapter. Reuse one
neutral serializer shared by build and response, placed in a runtime-safe
module; the response must not import build/DAG/filesystem-scanning tooling.

For the observed `rd/base-luma/link.json` failure, every internal link must
resolve within the requested development style. No prior production or
development artifact may influence a unified generation. Direct canonical
payloads in both directories must remain independently installable.

Unified generation does not imply safe concurrent writers. Existing
shared `.registry-build` and overlay paths need one exclusive build writer and
isolated staging: acquire `.registry-build/lock` atomically, use an owned
`run-*` directory, and stop deleting the shared staging root. Stage and validate
both canonical directories, sparse overlays, hash-bearing manifest, metadata
snapshot and preview index together. Fail a competing writer before any
deletion. Publish `apps/www/src/__registry__/generation.json` last; the metadata
snapshot and generated preview index expose the same id, while the manifest
binds it to hashes of canonical and overlay payloads. Dynamic responses compare
the marker, manifest, metadata and requested payload hashes and reject a mixed
generation. Outputs remain unchanged until publication begins, and deployments
capture only successful generations. This does not claim crash-atomic local
replacement across multiple directories.

The lock records an owner token, PID, start time and source identity. Only the
matching owner releases it in `finally`. A build-owned recovery command may
remove the exact lock only after proving the PID is dead and no publication for
that token is active; otherwise it fails with recovery instructions. A
mid-publication process death is detectable through generation mismatch and
requires rerunning the staged build. No runtime artifact service or automatic
deletion of another writer's state is justified.

### Installation proof matrix

Exercise full item/index/docs closure across 2 directories × 16 provider/style
combinations plus the two legacy aliases in each directory: 36 cheap
route/payload cases. Include prefixed
origins, external URL preservation, sparse inheritance, cyclic bundles,
provider package changes and no-file/style-only items. These checks prove
response closure, not that an external CLI installed every combination.

Run the unified build from a clean checkout and from fixtures seeded with each
historical partial-output order. The result and generation hashes must match.
Validate every internal reference and exercise duplicate-writer rejection and
a failed staged build. A production-only output check cannot close this slice.

Extend the existing `registry-create-install-e2e.mts` runner with a typed case
shape containing item, directory, style and route/direct-canonical install
mode. Keep item-only positional arguments as the default filter and
`editor-basic` as the default case. Test actual `shadcn create/add`, assert the
generated `components.json` provider/style, typecheck copied output and run the
existing Next build.

Bound expensive installs to independent axes: the five existing item classes
once, one alternate provider case, one `rd` route case, one legacy-alias case,
and direct-canonical basic and AI cases: ten cases total, with overlap allowed
when a case proves more than one axis. Use the installed preset encoder for
styles. Exhaustive provider/style/directory permutations stay in the cheap
36-case response matrix. Record each actual command/source identity, and do
not claim external installation from response-only tests.

## Deferred raw geometry experiment

Candidate: pass a stable Editable ref from
`apps/www/src/app/(app)/examples/plite/_examples/hovering-toolbar.tsx` into its
toolbar, use Plite React `useSelectionGeometry({ editableRef })`, consume its
bounding rect, and keep local placement and raw mark controls. Remove manual
global `window.getSelection()` range measurement if the candidate passes.
Use the Editable's owner document for portals; preserve pointerdown selection
and keyboard activation. No Plate component or geometry package promotion.

The Plite input is `packages/plitejs/src/react/hooks/use-selection-geometry.tsx`;
its existing geometry owner owns scroll/resize invalidation and cleanup. There
is no Plate proxy in this raw example. Plate's floating toolbar remains on its
existing proxy and exact mounted-view input. No plugin/store/kit is added or
deleted by this candidate.

This changes subscriptions/measurement, so source reasoning alone cannot
accept it. Before touching the production example, Benchmark owns one
disposable paired browser probe with identical document, viewport and input:

| Frozen variable | Contract |
| --- | --- |
| Scale | 1, 100 and 1,000 paragraphs; one and four independent Editables; select one line and 100 lines. |
| Workload | Selection drag, repeated selection changes, scroll/resize, blur, mark pointerdown, keyboard activation, mount/unmount and editable replacement. |
| Correctness | Match the intended selected range/view; no cross-editor focus/selection effects; follow scroll/resize; preserve undo and mark operation. |
| Cost | After warmup, 30 complete-operation samples per paired cohort; candidate p95 may exceed baseline by at most max(1 ms, 10%); steady clean geometry reads are zero; detached owner has zero live listeners/frames. |
| Source | Save baseline/candidate source and runner hashes, browser version, raw samples and result in this plan's artifact directory. Do not substitute an old general geometry review. |

Use the existing hovering-toolbar browser case as correctness owner and a
disposable measurement hook around the complete input-to-position operation.
Freeze instrumentation and command in the receipt before the first candidate
measurement. Extend with multiple editors only as needed to falsify ownership.
If the budgets or native behavior fail, repair the candidate or retain the
current example and record why. No numeric score or paper budget closes this
decision. The same contract reruns on the adopted production path.

## Implementation outcome

| Slice | Final disposition | Direct evidence |
| --- | --- | --- |
| Registry commands | Adopted direct typed feature operations, one bounded synchronous `insertBlock(tx, recipe)` helper, explicit structural eligibility and focus ownership. Unsupported Code Drawing conversion and open-ended dispatch were deleted. | 44 focused behavior tests; seven multi-editor Chromium cases; native Insert, Turn Into, Slash and Block Menu flows in generated Base/Nova and Radix/Luma apps. |
| Provider menu adapters | Adopted one copied menu contract across Base and Radix. Every copied editor menu imports and declares the provider adapter without leaking `asChild`. Base adapters translate cancelable `onSelect`, checkbox/radio close behavior and final focus. Edit-owned menu actions restore editor focus only after selection. | Registry ownership invariant, focused control tests, seven site Chromium cases and native pointer/keyboard proof in both generated provider apps. |
| Neutral kits | Adopted server-safe `AlignKit` and `LineHeightKit` in live and static compositions; deleted duplicate static policy files. | Source checks, registry generation, website production build and a successful request to `/docs/examples/server-side`. |
| Install derivation | Adopted source-derived item/provider package requirements, version reconciliation and deterministic graph traversal while retaining authored install intent. | 33 dependency/publication/materializer tests, source audit and ten isolated generated installs. |
| Delivery | Adopted one locked, staged registry generation for `r` and `rd`, with manifest/hash validation, failure preservation, mixed-generation rejection and stale-lock recovery. | Registry response matrix passed 9 tests with 137 assertions; generation `74dd191cc866ed05d3daf26b4df2faab3b87d5e8ba5f3da33a0fb3af48125e94` published 318 canonical payloads and passed `--check`. |
| Raw geometry | Rejected the hook candidate and retained manual production geometry. Correctness passed, but 2 of 12 frozen p95 cohorts exceeded the all-cohort budget. | [Frozen receipt](artifacts/2026-09-18-ui-design/geometry/receipt.json): 720 accepted samples, 10 passing cohorts, 2 failures; retained production browser suite passed 7 cases. |
| Integration | Adopted current docs, registry changelog, generated editor contracts, behavior evidence and Best API doctrine repair. | Docs/source parity, toolbar variants, generated contract check, website typecheck/build, exact RSC request and ledger checks. |

The final command surface remains copied and feature-owned. The provider adapter
repair was material: Base UI items execute `onClick`, while copied menu callers
use the Radix-style `onSelect` contract. Re-exporting Base items unchanged made
the menu appear functional while silently skipping those callbacks. Every
registered copied editor menu now routes through the adapter and declares its
dependency; a registry invariant enforces that ownership and rejects
provider-specific `asChild` at copied call sites. Edit-owned Align, Line Height,
List, Mode and More actions defer editor focus until provider close-focus, while
file pickers, downloads and dialogs keep their own focus lifecycle.

The website preview intentionally uses its Radix shadcn primitives. Provider
parity belongs to installed output, where the selected shadcn base and sparse
adapter are composed together. The site multi-editor fixture proves shared
editor targeting, focus, read-only behavior and mounted-view routing; generated
Base and Radix applications prove each provider's actual menu behavior.

## Execution verification

The completed run used these owner commands from the repository root unless a
working directory is noted:

```sh
bun test apps/www/src/registry/components/editor/insert-toolbar-button.spec.tsx
bun test apps/www/src/registry/components/editor/turn-into-toolbar-button.behavior.spec.tsx
bun test apps/www/src/registry/components/editor/block-menu.spec.tsx
bun test apps/www/src/registry/components/editor/mark-toolbar-button.spec.tsx
bun test apps/www/src/registry/components/editor/mode-toolbar-button.spec.tsx
bun test apps/www/src/registry/components/editor/toolbar.spec.tsx
bun test apps/www/src/registry/components/editor/transforms.spec.ts apps/www/src/registry/components/editor/transforms-combobox.spec.ts packages/platejs/src/lib/plugin/block-insertion.spec.ts packages/platejs/src/features/media/lib/MediaUrlInput.spec.ts
bun test apps/www/scripts/registry-package-dependencies.spec.mts apps/www/scripts/registry-build-publication.test.mts apps/www/scripts/registry-dependencies.test.mts apps/www/scripts/registry-build-targets.test.mts apps/www/scripts/registry-style-materializer.test.mts apps/www/scripts/registry-style-transform.test.mts
(cd apps/www && bun test ./src/lib/registry-response.test.ts)
pnpm --filter www exec tsx --tsconfig ./scripts/tsconfig.scripts.json scripts/check-registry-source.mts
pnpm --filter www check:toolbar-variants
pnpm --filter www check:docs
pnpm --filter www editor:generate
pnpm --filter www typecheck
pnpm --filter www build:registry
pnpm --filter www test:create-install editor-basic ai dnd table editor-ai
pnpm --filter www test:www-browser:chromium tests/browser/multi-editor.spec.ts
pnpm --filter www build
```

The ten-case install matrix covers Base/Nova and Radix/Luma for each of
`editor-basic`, `ai`, `dnd`, `table` and `editor-ai`. Every generated app passed
a Next production build. The two `editor-ai` apps additionally ran native
browser commands for pointer Insert, keyboard Turn Into, keyboard Slash,
pointer Block Menu and the older More-formatting `onSelect` path, including
editor-focus restoration. This is the provider behavior proof; response tests
alone are not treated as installation evidence.

The website production build served `/docs/examples/server-side` and the final
`/rd/base-nova/editor-ai.json` payload from that exact artifact. The build emits
the existing `vscode-languageserver-types` dynamic-require warning through the
Mermaid/code-drawing static import chain; compilation, prerendering and requests
succeeded.

Geometry used its separately frozen command and receipt. The candidate is not
present in production source, so no production hook claim is made. The one-host
Chromium result is sufficient to reject adoption under the declared all-cohort
gate; it is not a general browser performance claim.

## Documentation, law and doctrine adoption

The locked `EDIT-GLOBAL-005` law in
`docs/editor-behavior/markdown-editing-spec.md` governs complete expanded text
selections; it does not define disjoint node selections. Exact disjoint
membership comes from `docs/vision/plite.md`'s `NodeSelection` contract and its
plural reads. The drawing section requires atomic insertion and supplies no
arbitrary conversion law. These fixes restore expanded-selection behavior,
respect exact node membership where an operation supports it, and stop
advertising unsupported structural conversion. No new document representation
or editor behavior authority is proposed.

The current behavior-evidence navigation records copied command targeting,
selection/focus and provider-install proof under the UI ledger owner. No new
document representation or normative editing law was needed.

Current English and Chinese Toolbar, Block Menu, Code Block, Column, Date,
Excalidraw, Text Align and Line Height docs teach typed callbacks, structural
eligibility and shared neutral kits. Generated demo contracts and registry
payloads were rebuilt on `next`. A registry changelog records the user-visible
copied UI and installation behavior. No package changeset is needed because the
accepted product changes are copied registry source and build tooling.

Best API doctrine repair was applied to the source rules and Plate vision, Plate
Next doctrine version 211 was appended, mirrors were regenerated, and the
version contract passed. The durable lesson is bounded direct feature calls,
truthful capability presentation and source-derived installation facts; it does
not create a general command registry.

## Failure scenarios and rollback

| Realistic failure | Protection and falsifying evidence |
| --- | --- |
| A menu erases Slash input, targets another editor, or steals Equation/Link focus. | Eligibility before commit; one synchronous edit; captured view; honor UI-owned focus. Native provider tests plus transaction rollback/undo tests must fail on the broken path. |
| A conversion or align/indent action edits only part of the selection or flattens unrelated nodes. | Leaf/Quote/align/indent operations act on exact supported membership. Details/Code require one contiguous sibling run; Columns requires one block. Prove both the positive matrix and pre-update rejection of unsupported shapes, nested structure and one undo step. |
| A styled development install pulls production dependencies or omits an optional peer hidden by workspace hoisting. | Neutral identity, exact source/DAG derivation, unified `r`/`rd` serialization and real isolated CLI installs. External URLs, selected provider and each direct canonical directory are independent gates. |
| A missing overlay silently serves another style, or a failed/concurrent build exposes a mixed generation. | Manifest-authoritative inheritance, generation checks, exclusive writer, isolated stage and validation before publication. Inject failure before publish, compare prior hashes, reject a second writer without writes, and prove stale-lock recovery. Live multi-tree replacement is not claimed atomic. |

Each adopted slice moved with its callers and generated output. The rejected
geometry slice restored the prior production source rather than weakening the
benchmark gate. No compatibility alias, dual kit name, persisted-document
migration or serialized-content rollback was introduced.

Verification evidence:

- Focused command behavior: **44 pass, 0 fail** across Insert, Turn Into, Block
  Menu, transforms, insertion and media URL owners.
- Provider menu ownership: **15 registry tests, 0 fail**, plus **36 focused UI
  tests, 0 fail** across More, Mode, Insert, Turn Into, Block Menu and toolbar
  focus behavior.
- Registry derivation/publication/materialization: **33 pass, 0 fail, 260
  assertions**. Registry responses: **9 pass, 0 fail, 137 assertions**.
- Multi-editor Chromium proof: **7 pass, 0 fail** for shared targeting, focus,
  read-only state and exact mounted views.
- Generated installs: **10 pass, 0 fail** across both providers and five item
  classes; both complete editor apps passed native menu commands.
- Website docs/source parity, toolbar variant bundling, source analysis,
  generated editor contracts, package-integration types, registry freshness and
  production build passed with the final provider-menu source. The exact final
  registry then compiled and ran native command proof in both generated
  complete-editor builds. The built server-side docs page and Base/Nova payload
  responded successfully.
- Geometry correctness passed every frozen check, but performance failed 2 of
  12 p95 cohorts. The hook candidate is rejected and manual geometry remains the
  production owner.

Remaining limits:

The geometry timing receipt covers one macOS host and Chromium build. Provider
menu parity is proven in generated Base/Nova and Radix/Luma apps; the website
preview remains a Radix composition and does not claim runtime provider
switching. The production build retains its existing Mermaid dependency warning.
No publication, release or browser-wide performance claim is included.

This implementation completes the accepted UI command, composition,
installation and delivery target under the governing review. The only proposed
slice not adopted is geometry, with an explicit failed receipt and restored
production source.
