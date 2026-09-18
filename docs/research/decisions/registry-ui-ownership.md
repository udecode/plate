---
title: Registry composition, installation and command ownership
type: decision
status: proposed
updated: 2026-09-18
review_scope: ui
current_review: 2026-09-18-ui-menu-focus-and-block-insertion-ownership
review_history:
  - ../review-records/2026-09-17-ui-source-and-command-ownership.json
  - ../review-records/2026-09-18-ui-menu-focus-and-block-insertion-ownership.json
source_refs:
  - ../../../apps/www/src/registry/components/editor/plugins.ts
  - ../../../apps/www/src/registry/components/editor/plugins-static.ts
  - ../../../apps/www/src/registry/components/editor/fixed-toolbar.tsx
  - ../../../apps/www/src/registry/components/editor/transforms.ts
  - ../../../apps/www/src/registry/components/editor/insert-toolbar-button.tsx
  - ../../../apps/www/src/registry/components/editor/slash.tsx
  - ../../../apps/www/src/registry/bases/base/dropdown-menu.tsx
  - ../../../apps/www/src/registry/bases/radix/dropdown-menu.tsx
  - ../../../apps/www/src/registry/registry.test.ts
  - ../../../apps/www/src/lib/registry-response.ts
related:
  - ../reviews.md#ui
  - ../../vision/plate.md
  - plite-core-ownership.md
  - plite-view-ownership.md
reconciled_executions:
  - 2026-09-18-ui-provider-menu-adapter-completion
  - 2026-09-18-ui-composition-installation-adoption
  - 2026-09-18-ui-composition-installation-design-last-pass
  - 2026-09-18-ui-composition-installation-design-final
  - 2026-09-18-ui-composition-installation-design
  - 2026-09-18-recovered-2026-07-24-decouple-live-and-base-registry-kits
  - 2026-09-18-recovered-2026-07-24-unify-markdown-registry-kit
  - 2026-09-18-recovered-2026-08-13-audit-registry-dependency-metadata
  - 2026-09-18-recovered-2026-09-07-full-plate-ui-extraction-audit
---

# Registry composition, installation and command ownership

**Delete redundant ownership: open-ended string action dispatch, caller-owned
menu close-focus handshakes, the registry transaction recipe, duplicated neutral
kit policy, and manually listed installation facts that existing source can
determine.** Keep copied feature composition, explicit install intent and
renderer-specific lifetimes. No universal runtime feature or command catalog
earns its cost here.

## Current follow-up

The provider-menu adoption stopped one layer too early. Six copied controls
coordinate item selection with menu close through mutable `focusEditorRef`
state, including two copies in the list toolbar and a tri-state variant in the
Insert menu. That state exists only because the adapter exposes final focus at
the content boundary while the decision is made by the selected item. Extend
the copied provider-neutral menu adapter with item-scoped post-close focus
intent. A close caused by Escape, outside interaction, or an item that opens a
different surface must keep provider-default focus behavior. Keep the current
content-level `onFinalFocus` as the low-level escape hatch. Plate and Plite do
not own menu lifecycle.

The bounded `transforms.ts` helper also no longer earns a registry owner. Its
two production consumers repeat 30 calls that combine a target predicate with
the owning plugin's typed insertion. Plite already owns structural insertion
and empty-source replacement; Plate's plugin portal owns semantic element
identity and typed construction. Move the remaining "reuse a matching empty
block, otherwise replace a different empty block or insert after content" law
into the typed Plate insertion path, then delete the raw-transaction callback
helper. The exact `insert`/`upsert` public split remains a Task design question;
the callback recipe is not the target API.

This follow-up retains copied labels, icons, grouping, feature membership and
direct typed operations. It supersedes only the prior conclusion that the
bounded insertion helper and completed provider adapter were durable final
owners.

The user job is to install working source, choose features, customize controls,
and render the same supported content in live and static contexts. The hard
laws are exact mounted-view command targeting, native selection and focus,
server-safe static imports, preserved document semantics, and a complete
installation in the requested environment, provider and style. Independent
features retain their own ownership.

The ideal has four owners: app source chooses plugin membership and order;
copied JSX chooses presentation and truthful action eligibility; existing
feature operations own edits; registry tooling derives required installation
facts, preserves explicit bundles and compiles both public directories as one
generation. Neither build metadata nor toolbar labels choose runtime plugin
membership.

## Assessed units

Ten semantic units cover the ledger question. All ten received a disposition;
none remain unreviewed. The [census accounting](../../plans/artifacts/2026-09-17-ui-review/coverage.json)
classifies all 60 mapped source groups, including ancillary exclusions and
support-only artifacts. This is a composition audit, not certification of
every feature algorithm, locale fixture, or external example.

| Unit | Verdict and target | Evidence and next owner |
| --- | --- | --- |
| Aggregate kits and editor shells | **Stop** replacing plain arrays or merging live/static aggregates. Keep `EditorKit`, `BaseEditorKit`, `Editor`, `EditorStatic`, and frame/scrollport separation. | `plugins.ts`, `plugins-static.ts`, `editor.tsx`, `editor-static.tsx`; default, incremental-install, DOCX, AI and static/export consumers. No follow-up redesign. |
| Neutral feature policy | **Adopted:** one server-safe Align kit and one LineHeight kit; duplicate static counterparts are deleted. Keep distinct renderer bindings. | Source checks, generated installs and the server-rendered docs route prove the shared policy remains safe. |
| Fixed toolbar placement | **Stop** requiring deletion of `FixedToolbarPlugin` and `FixedToolbarKit`. Keep optional kit-based placement and ordinary JSX for custom layouts. | The descriptor supplies only `beforeContainer`, but installation with the copied preset is a real product job. DOCX customization does not justify forcing repeated mounting into every aggregate consumer. No new placement API. |
| Floating toolbar and block menu | **Keep** exact mounted-view placement and copied provider adapters. Their command context, focus semantics and exact Editable input are real requirements. | Generated Base and Radix apps prove native menu behavior; the site fixture proves shared editor targeting. |
| Insert, conversion and shared dispatch | **Pursue:** keep typed feature operations and the deleted string fallback, but absorb matching-empty insertion into the typed Plate operation and delete the registry `transforms.ts` callback recipe. | Existing transaction tests preserve the required atomicity and undo laws; the target public shape and adoption still need design and proof. |
| Existing presentation controls | **Pursue** removing item-to-content focus refs through the existing provider adapter. **Stop** inventing a shared command catalog or moving copied labels/layout into packages. Keep overlay capture, More, Mode, import UI and app settings under their current jobs. | Six current controls reproduce the same close-focus handshake; provider-native interaction proof is required after adoption. |
| Raw Plite hovering toolbar | **Stop** the hook migration and retain the manual production geometry. | The frozen candidate passed correctness but failed 2 of 12 p95 cohorts; the production source was restored byte-for-byte. |
| Installation catalog and dependency facts | **Adopted:** required item/provider packages and optional peers are derived from selected source plus the package DAG. Authored item names, targets, CSS and intentional bundles remain explicit. | Dependency/publication tests, source analysis and ten generated installs pass. |
| Provider/style delivery | **Adopted:** one environment-neutral compiler emits complete `r` and `rd` baselines, neutral sparse overlays, an authoritative manifest and a generation marker together. | Atomic generation, response closure and generated Base/Radix installs pass. |
| Proof and optional generated contracts | **Keep** existing source, response, install and lifetime proof owners; generated editor contracts remain optional for consumers. | Focused tests, browser proof, ten installs, typecheck, docs parity and production build pass. No additional proof framework was added. |

## Decisive evidence

`FixedToolbarPlugin` contributes one JSX tree and no independent schema or
editing behavior. `EditorContainer` renders this slot in its existing parent
context; it creates no extra view provider. Explicit JSX can preserve that
context, so deletion is technically feasible. However, optional inclusion in
the copied preset owns a current installation job. Mandatory JSX adoption
would redistribute mounting across consumers without proving a better lasting
contract. Retain both ordinary JSX and optional placement through the existing
plugin grammar. With multiple Editables under one root, both placements follow
that root's selected target; neither permanently binds the toolbar to its
adjacent Editable. Floating and block-menu slots instead render inside the
exact mounted-view boundary and receive its Editable.

`applyBlockAction(editor, action: string)` recognizes columns, code blocks,
details, lists, headings and quotes. Its remaining branch sets paragraph type.
The Turn Into and block menus offer Code Drawing, so that offered value takes
the paragraph branch. Insert separately declares `focusEditor` but its handler
always calls `editor.api.dom.focus()`. These are concrete consequences of
keeping presentation values and execution policy in separate unchecked maps.
The target is typed operations at the copied call sites, with shared
transaction/selection behavior retained where genuinely shared. A new global
command registration layer would create another owner without resolving this
particular drift.

Alignment and line-height are safe candidates for shared neutral policy;
Font is not an automatic third case. Live Font sets a black default that its
static counterpart does not. Markdown already demonstrates shared neutral
composition. Static presets also intentionally include Code Drawing for AI
serialization while the default live preset omits it. Preserve those deliberate
jobs instead of imposing blanket parity.

Both registry build modes write `src/__registry__/overlays`. The response owner
rewrites only dependencies beginning with the source prefix for the requested
mode. A direct call with `directory: 'rd'`, `style: 'base-luma'` and
`fileName: 'link.json'` returned production dependencies for
`link-toolbar-button`, `suggestion-style` and `use-floating-rect`. This confirms
the response failure on the current artifacts. The final design deletes the
mode split: one neutral compilation serializes both canonical directories and
publishes them with sparse overlays and generation metadata. The original
[receipt](../../plans/artifacts/2026-09-17-ui-review/proof.json) preserves the
invocation and result.

## Alternatives and prior decisions

Keeping all current owners loses to the observed dispatch and environment
failures. Merging all kits into one package preset loses application policy,
static import safety and independent feature omission. Generating runtime kits
from registry metadata would make installation choose editor semantics.

Deleting the entire catalog also loses: routes, targets, style variables and
intentional no-file bundles are authored installation decisions. Retain those
inputs while deriving facts already present in imports and the package DAG.
Likewise, retain provider adapters whose focus/render contracts differ; do not
move their selection into a runtime switch.

A universal feature/command catalog could derive menus and installation, but
no current discovery or dynamic registration job requires that new protocol.
Typed direct operations and existing build owners remove the evidenced drift
with fewer lasting concepts. Package or Plite promotion needs a neutral behavior
law; product labels, defaults and layout do not supply one.

This initial `ui` record rechecks prior kit-facade removal, explicit preset
membership, neutral Markdown reuse, and kit-owned AI/DnD integration. It retains
their justified boundaries without inheriting their runtime acceptance. The
earlier blanket live/base separation does not justify identical policy files;
current doctrine already permits a shared runtime-neutral kit. Prior command
and geometry reviews supply context, not a transferred verdict. Existing
AI/DnD timing and broader-check gaps remain outside this review's acceptance.

## Adoption evidence and limits

The earlier implementation adopted its accepted command, neutral-kit,
dependency and delivery slices. Direct feature calls replaced string dispatch;
unsupported Code Drawing conversion was removed; and structural actions expose
explicit eligibility. The current review reopens completion only for the
registry insertion helper and item-to-content menu focus handshake.

Registry tooling derives package facts, validates versions and traverses the
item/package DAG deterministically. One locked staged build publishes `r`, `rd`,
sparse overlays, manifest and hashes as one generation. The final generation
`74dd191cc866ed05d3daf26b4df2faab3b87d5e8ba5f3da33a0fb3af48125e94`
contains 318 canonical payloads.

Evidence includes 44 focused command tests, 33 dependency/publication tests,
nine response tests, seven multi-editor Chromium cases, and ten isolated
Base/Nova and Radix/Luma installs. Both generated complete editor apps execute
Insert, Turn Into, Slash, Block Menu and the older More-formatting `onSelect`
path with native pointer/keyboard events, including editor-focus restoration.
Every copied editor menu imports and declares the provider adapter, and a
registry invariant excludes provider-specific trigger composition from copied
call sites. The website passed docs parity, source checks, generated-contract
checks, typecheck and production build with the final menu source. The exact
final registry compiled and ran native command proof in both generated
complete-editor builds.

The geometry candidate is resolved as a rejection. Its frozen Chromium probe
accepted 720 samples and passed all correctness/lifecycle checks, but failed the
all-cohort p95 budget in 2 of 12 cohorts. Manual geometry remains production
source. That one-host result supports rejection under the declared gate and no
broader performance claim.

Provider parity belongs to generated install-time compositions. The website
preview remains Radix-backed, while its multi-editor fixture proves shared
editor targeting and focus. The production build retains an existing Mermaid
static-analysis warning. Publication and release are outside this decision's
execution evidence.

## Recovered execution history

The [feature hub](../features/ui.md) links the recovered plan outcomes,
including completed work and rejected experiments. These imports preserve
reported completion with **unknown current proof**: their full original
source/runner/result binding is not recovered. Their recovery date does not
assert that every historical plan ran after the latest review. The plan owns
its lifecycle; these accounts do not reopen unrelated architectural decisions
or authorize repeating completed work. Current review and proof limits above
remain question-specific.
