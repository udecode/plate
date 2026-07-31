# Lexical Architecture Ledger

Audit role: current Lexical reference lane for the registered full
Wordgard/Lexical/ProseMirror comparison. This is planning evidence, not
implementation authority.

## Provenance

| Field | Verified value |
| --- | --- |
| Checkout | `../lexical` |
| Commit | `dd5c41b13193efa9ab1574234d8593d2c9e4f988` |
| Prior audited commit | `d52f66e250e031a6c6fd8836d160373b0df557c7` |
| Branch / upstream | `main` / `origin/main` |
| Commit subject | [lexical-markdown] Bug Fix: Preserve headings when typing list shortcuts (#8879) |
| Commit authored | `2026-07-27T09:58:01-05:00` |
| License | MIT, `../lexical/LICENSE:1` |
| Pull law | clean registered checkout; fast-forward only |

The prior cursor is an ancestor of this cursor. The delta contains 392 commits
and 1,542 changed paths. The full source tree, not only that diff, is the
architecture authority.

## Coverage closure

[lexical-source-manifest.json](./lexical-source-manifest.json) maps every
tracked source unit and top-level declaration. The symmetric union lives in
[lexical-concept-manifest.json](./lexical-concept-manifest.json), and its
one-row-per-concept comparison is
[lexical-concept-matrix.md](./lexical-concept-matrix.md).

| Count | Value |
| --- | ---: |
| Git-tracked source units | 2107 |
| Relevant mapped units | 1895 |
| Exact exclusions | 212 |
| Parsed code units | 1232 |
| Top-level declarations/package records | 7450 |
| Mapped declarations | 6518 |
| Excluded declarations | 932 |
| Source-derived Lexical concepts | 59 |
| Local-only symmetric-union concepts | 14 |
| Canonical matrix rows | 73 |
| Relevant parse diagnostics | 0 |
| Unexplained units | **0** |
| Unexplained declarations | **0** |

## Blunt verdict

Current Plite/Plate is architecturally stronger on 69 of 73 atomic jobs.
Lexical is not a substrate donor. It is an excellent browser-behavior donor
with two ideas worth adapting:

1. **P1:** make Markdown node rules ordinary feature-plugin codec
   contributions instead of a central `defaultRules` switch.
2. **P2:** share one reference-counted `selectionchange` listener per
   `Document` across all mounted editor roots.

Lexical's class-node `$config()`, named slots, `DOMSlot`,
`DOMImportExtension`, `DOMRenderExtension`, mutable extension phases,
generic A11y UI helpers, and `GenMap` do not beat their current local owners.

## Full delta disposition

| Delta family | Verdict | Evidence |
| --- | --- | --- |
| Class-node `$config()` synthesis | reject | It couples schema, inheritance, JSON/DOM codecs, and replacement to node classes and required several follow-up fixes; Plite keeps schema data-first and compiled. `../lexical/packages/lexical/src/LexicalNode.ts:1`, `packages/plite/src/interfaces/schema.ts:1` |
| Named node slots | keep local | Plite element-owned roots already have grammar, independent addressing, lifecycle, mapping, collaboration, and host projection. Harvest Lexical concurrency/clipboard rows only. `../lexical/packages/lexical/src/LexicalSlot.ts:1`, `packages/plite/src/core/element-owned-root-index.ts:1` |
| `DOMSlot` and DOM render overrides | reject | Lexical's imperative reconciler needs a DOM boundary object. Plite keeps model ownership renderer-neutral; Plate owns React slots and compiled codecs. `../lexical/packages/lexical/src/LexicalDOMSlot.ts:1`, `packages/plite-react/src/components/editable-text-blocks.tsx:1` |
| `DOMImportExtension` | reject | Plate's schema-owned HTML compiler already orders matchers, detects conflicts, and handles encode plus decode. `../lexical/packages/lexical-html/src/import/DOMImportExtension.ts:1`, `packages/core/src/lib/plugins/html/HtmlPlugin.ts:1` |
| MDAST contributions | **steal/adapt P1** | Feature extensions own syntax import/export handlers and syntax extensions; Plate centralizes feature rules in Markdown. `../lexical/packages/lexical-mdast/src/compile.ts:1`, `packages/markdown/src/lib/rules/defaultRules.ts:1` |
| A11y package | reject architecture; keep proof | Live announcements fit Plite effects/React; focus trap and roving tabindex are UI primitives, not editor substrate. `../lexical/packages/lexical-a11y/src/index.ts:1`, `packages/core/src/lib/plugin/BasePlugin.ts:1` |
| Per-editor `InputState`, explicit read modes, `onWarn` | keep local | These changes remove Lexical ambient/global debt; Plite already has explicit editor state/read/update and diagnostics owners. `../lexical/packages/lexical/src/LexicalEvents.ts:200`, `packages/plite/src/interfaces/editor.ts:1` |
| `GenMap` copy-on-write node map | reject without benchmark | It optimizes Lexical's class-node map and reconciler, not Plite's JSON/change/index model. `../lexical/packages/lexical/src/LexicalGenMap.ts:1`, `packages/plite/src/interfaces/editor.ts:1` |
| Reference-counted document registry | **rearchitect P2** | Lexical shares one document selection listener; current React reconciliation attaches one per mounted root. `../lexical/packages/lexical/src/LexicalEvents.ts:216`, `packages/plite-react/src/editable/selection-reconciler.ts:214` |
| Shadow DOM, IME, iOS/Android, Firefox/Safari fixes | keep proof | These are portable browser laws, not reasons to import Lexical ownership. `docs/editor-test-harvester/lexical/report.md:1` |
| Tooling, devtools, playground, website, packaging | reject architecture | Product and repository policy do not define Plite substrate. `../lexical/packages/lexical-playground/package.json:1` |

## Complete source-derived concept inventory

The canonical matrix carries the full reference, Plite, Plate, six-dimension,
classification, adaptation, prior-candidate, verdict, and priority cells.

| ID | Atomic concept | Canonical comparison |
| --- | --- | --- |
| `LX-CORE-NODE` | Class-based node graph, stable node keys, parent/sibling links, and latest/writable versions | [canonical row](./lexical-concept-matrix.md) |
| `LX-CORE-NODE-CONFIG` | Static node configuration, registration, replacement, inheritance, and DOM/JSON codecs | [canonical row](./lexical-concept-matrix.md) |
| `LX-CORE-STATE` | Immutable EditorState snapshots and mutable pending double buffer | [canonical row](./lexical-concept-matrix.md) |
| `LX-CORE-UPDATE` | Synchronous ambient read/update context, nested update queue, commit, rollback, and tags | [canonical row](./lexical-concept-matrix.md) |
| `LX-CORE-DIRTY` | Dirty leaf/element tracking, transform fixed point, and normalization | [canonical row](./lexical-concept-matrix.md) |
| `LX-CORE-RECONCILE` | Incremental imperative DOM reconciliation and mutation accounting | [canonical row](./lexical-concept-matrix.md) |
| `LX-CORE-SELECTION` | Point, range, node selection, editing transforms, and DOM selection mapping | [canonical row](./lexical-concept-matrix.md) |
| `LX-CORE-CARET` | Typed directional tree caret and range traversal | [canonical row](./lexical-concept-matrix.md) |
| `LX-CORE-COMMAND` | Typed command tokens, listener priority, propagation, and editor dispatch | [canonical row](./lexical-concept-matrix.md) |
| `LX-CORE-EVENT` | Contenteditable event transport, browser branching, composition, clipboard, and input | [canonical row](./lexical-concept-matrix.md) |
| `LX-CORE-INPUT-STATE` | Per-editor input and composition state without module-global event state | [canonical row](./lexical-concept-matrix.md) |
| `LX-CORE-DOM-SLOT` | DOM content boundary abstraction for wrapped and decorated node rendering | [canonical row](./lexical-concept-matrix.md) |
| `LX-CORE-NAMED-SLOT` | Experimental named node-owned content regions across editing, serialization, clipboard, and collaboration | [canonical row](./lexical-concept-matrix.md) |
| `LX-CORE-GENMAP` | Generation-aware copy-on-write map used by node maps and reconciliation | [canonical row](./lexical-concept-matrix.md) |
| `LX-CORE-REFCOUNT` | Reference-counted document resource registry and shared selectionchange transport | [canonical row](./lexical-concept-matrix.md) |
| `LX-CORE-READ-MODE` | Explicit latest and pending editor-state read modes | [canonical row](./lexical-concept-matrix.md) |
| `LX-CORE-WARN` | Editor warning hook and update-recursion diagnostics | [canonical row](./lexical-concept-matrix.md) |
| `LX-CORE-LISTENER` | Editor update, mutation, root, editable, text, and decorator listeners | [canonical row](./lexical-concept-matrix.md) |
| `LX-CORE-NODE-STATE` | Descriptor-backed per-node state, lazy parsing, default elision, and copy-on-write | [canonical row](./lexical-concept-matrix.md) |
| `LX-CORE-GC` | Detached-node and decorator garbage collection | [canonical row](./lexical-concept-matrix.md) |
| `LX-CORE-NODES` | Built-in root, element, text, paragraph, decorator, line-break, tab, and artificial nodes | [canonical row](./lexical-concept-matrix.md) |
| `LX-CORE-UTIL` | Core structural utilities and cleanup composition | [canonical row](./lexical-concept-matrix.md) |
| `LX-EXTENSION-CONTRACT` | Typed extension descriptors, config, dependencies, peers, conflicts, and lifecycle | [canonical row](./lexical-concept-matrix.md) |
| `LX-EXTENSION-COMPILER` | Extension graph compilation, topological order, config merge, build/register, and disposal | [canonical row](./lexical-concept-matrix.md) |
| `LX-EXTENSION-SIGNALS` | Reactive extension signals, watched signal lifecycle, and dependency outputs | [canonical row](./lexical-concept-matrix.md) |
| `LX-CLIPBOARD` | Clipboard MIME import/export, selection serialization, and insertion | [canonical row](./lexical-concept-matrix.md) |
| `LX-CODE` | Code block nodes, flat line structure, tab/indent behavior, and syntax engines | [canonical row](./lexical-concept-matrix.md) |
| `LX-DEVTOOLS` | Editor inspection, state serialization, command log, element picker, and browser extension | [canonical row](./lexical-concept-matrix.md) |
| `LX-DRAGON` | Dragon NaturallySpeaking DOM compatibility | [canonical row](./lexical-concept-matrix.md) |
| `LX-FILE` | Serialized editor file import/export | [canonical row](./lexical-concept-matrix.md) |
| `LX-HASHTAG` | Hashtag text entity and extension | [canonical row](./lexical-concept-matrix.md) |
| `LX-HEADLESS` | Headless editor creation and DOM environment adapters | [canonical row](./lexical-concept-matrix.md) |
| `LX-HISTORY` | Undo/redo stacks, merge heuristics, tags, and shared history | [canonical row](./lexical-concept-matrix.md) |
| `LX-HTML` | HTML generation and fitted DOM import | [canonical row](./lexical-concept-matrix.md) |
| `LX-DOM-IMPORT` | Extension-contributed DOM import declarations and compiled matchers | [canonical row](./lexical-concept-matrix.md) |
| `LX-DOM-RENDER` | Extension-contributed DOM create, update, export, slot, and decorator overrides | [canonical row](./lexical-concept-matrix.md) |
| `LX-MDAST` | Extension-contributed MDAST import/export with syntax-extension preservation | [canonical row](./lexical-concept-matrix.md) |
| `LX-A11Y` | Accessibility live regions, focus trapping, focus restoration, and roving tabindex helpers | [canonical row](./lexical-concept-matrix.md) |
| `LX-INTERNAL` | Private cross-package implementation utilities with no supported public contract | [canonical row](./lexical-concept-matrix.md) |
| `LX-LINK` | Link/autolink nodes, commands, transforms, and extensions | [canonical row](./lexical-concept-matrix.md) |
| `LX-LIST` | List/list-item representation, formatting, checklist, indentation, and normalization | [canonical row](./lexical-concept-matrix.md) |
| `LX-MARK` | Wrapper mark node and range wrapping helpers | [canonical row](./lexical-concept-matrix.md) |
| `LX-MARKDOWN` | Markdown transformers, import, export, and shortcuts | [canonical row](./lexical-concept-matrix.md) |
| `LX-OFFSET` | Flat text-offset view and selection conversion | [canonical row](./lexical-concept-matrix.md) |
| `LX-OVERFLOW` | Overflow node and character-limit wrapping | [canonical row](./lexical-concept-matrix.md) |
| `LX-PLAIN-TEXT` | Plain-text commands and extension | [canonical row](./lexical-concept-matrix.md) |
| `LX-REACT` | React composers, contexts, plugins, hooks, decorators, and contenteditable host | [canonical row](./lexical-concept-matrix.md) |
| `LX-RICH-TEXT` | Rich-text commands, editing rules, headings, quotes, and extension | [canonical row](./lexical-concept-matrix.md) |
| `LX-SELECTION-UTIL` | Selection geometry, style, slicing, cloning, and traversal helpers | [canonical row](./lexical-concept-matrix.md) |
| `LX-TABLE` | Table nodes, grid selection, observer, navigation, commands, and normalization | [canonical row](./lexical-concept-matrix.md) |
| `LX-TAILWIND` | Tailwind theme extension | [canonical row](./lexical-concept-matrix.md) |
| `LX-TEXT` | Text entity registration, root text subscription, and placeholder policy | [canonical row](./lexical-concept-matrix.md) |
| `LX-UTILS` | Reusable registration, DOM, traversal, merge, and selection utilities | [canonical row](./lexical-concept-matrix.md) |
| `LX-YJS` | Yjs node bindings, relative positions, cursors, snapshots, and bidirectional sync | [canonical row](./lexical-concept-matrix.md) |
| `LX-CONSUMER` | Example application and integration consumer | [canonical row](./lexical-concept-matrix.md) |
| `LX-PLAYGROUND` | Playground product nodes, plugins, UI, collaboration, and browser host | [canonical row](./lexical-concept-matrix.md) |
| `LX-WEBSITE` | Documentation site, public concept documentation, and product examples | [canonical row](./lexical-concept-matrix.md) |
| `LX-PROOF` | Unit, integration, browser, regression, fixture, and harness evidence | [canonical row](./lexical-concept-matrix.md) |
| `LX-PACKAGING` | Package metadata, exports, dependency graph, build variants, and workspace boundaries | [canonical row](./lexical-concept-matrix.md) |

## Material candidate LX-MDAST — feature-owned Markdown codec contributions

### Verdict

Adapt the ownership idea, not Lexical's API. Plate already has the stronger
codec compiler and plugin inference. The missing law is simple: the plugin that
owns a node or mark also owns its Markdown rule.

### Current public shape

```ts
import { MarkdownPlugin, defaultRules } from '@platejs/markdown';

const plugins = [
  HeadingPlugin,
  LinkPlugin,
  MarkdownPlugin.configure({
    initialState: {
      rules: {
        ...defaultRules,
        callout: calloutRule,
      },
    },
  }),
];
```

Feature packages install their plugin, but Markdown behavior is repeated in a
central `defaultRules` table or supplied through Markdown plugin state.

### Proposed public shape

```ts
import { createBasePlugin } from '@platejs/core';
import { MarkdownPlugin } from '@platejs/markdown';

export const CalloutPlugin = createBasePlugin({
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/markdown': {
        decode: calloutFromMdast,
        encode: calloutToMdast,
      },
    }),
  key: 'callout',
});

const plugins = [CalloutPlugin, MarkdownPlugin];
```

Use the existing `codecs` authoring job. Do not add a `markdown` root
namespace, `MdastKit`, rule registry, or mutable runtime service. Advanced
foreign contributions use the existing
`defineCodecs(TargetPlugin, { 'text/markdown': ... })` form. The accepted
target includes a schema-bound `text/markdown` overload for
`defineCodecs`; the current generic document-codec overload is not sufficient
for MDAST node handlers.

### Current internal shape

```ts
type MarkdownPluginState = {
  rules: MdRules | null;
};

const runtimeRules = {
  ...defaultRules,
  ...store.rules,
  ...operationOptions.rules,
};
```

`defaultRules.ts` knows headings, links, lists, tables, media, marks, MDX,
mentions, callouts, and other feature contracts.

### Proposed internal shape

```ts
type MarkdownNodeCodec = Readonly<{
  decode?: MdNodeParser['deserialize'];
  encode?: MdNodeParser['serialize'];
}>;

type CompiledMarkdownCodec = Readonly<{
  byMdastType: ReadonlyMap<string, readonly MarkdownNodeCodec[]>;
  byPluginType: ReadonlyMap<string, MarkdownNodeCodec>;
}>;
```

The Plate codec compiler collects and validates node-level Markdown codecs
once. `MarkdownPlugin` privately registers the `text/markdown` rule
compiler; core stores the MIME-keyed declaration without importing MDAST
types. Feature declarations compile into that format runtime rather than
becoming competing document host codecs. `MarkdownPlugin` remains the
document-scoped parser/stringifier,
`editor.api.markdown` remains the operation surface, and per-call rules remain
an explicit advanced override only if a current consumer still needs them.

| Packet | Decision |
| --- | --- |
| Priority | P1 |
| Adopt | Feature-owned `text/markdown` codec rules; deterministic compiled ordering; syntax-extension contributions only where current GFM/MDX jobs require them. |
| Delete | Feature entries from `defaultRules.ts`; duplicated feature-key switches; mutable plugin-state `rules` if a consumer sweep finds no real runtime mutation. |
| Keep | `MarkdownPlugin`, `editor.api.markdown`, document codecs, per-operation filtering/options, unified/remark pipeline, HTML fallback, current MDX breadth. |
| Reject | Lexical extension bundles, mutable config merging, `$getExtensionOutput`, and a second Markdown-specific public grammar. |
| Adoption | Move one feature family at a time, starting with heading/link/list; delete each central row only after its owner codec passes parity. |
| Type proof | Self and foreign codec inference; mdast-node and Plate-node narrowing; duplicate/conflicting owner rejection; no callback annotations or casts. |
| Runtime proof | Import/export round trips, overlapping marks, GFM tables/tasks, MDX/custom constructs, HTML fallback, per-call filter precedence, plugin order invariance. |
| Browser proof | Paste/copy Markdown only where the host codec path participates; no raw-device requirement. |
| Benchmark | Compile once; conversion throughput and retained registry size must not materially regress against the current central map. |
| Next owner | `best-api` target accepted here; `plate-plan` owns boundary/adoption/proof planning. |

## Material candidate LX-CORE-REFCOUNT — document event hub

### Verdict

Move document-global listener ownership out of each React root reconciler and
into one DOM document runtime. This is internal architecture; no public API is
earned.

### Current public shape

```tsx
<Plate>
  <Editable />
  <Editable />
</Plate>
```

The public shape is already correct. Each mounted root currently installs its
own native `selectionchange` listener.

### Proposed public shape

```tsx
<Plate>
  <Editable />
  <Editable />
</Plate>
```

No new provider, option, hook, extension, or editor method.

### Current internal shape

```ts
targetDocument.addEventListener('selectionchange', handleSelectionChange);

return () => {
  targetDocument.removeEventListener(
    'selectionchange',
    handleSelectionChange
  );
};
```

### Proposed internal shape

```ts
const release = domRootRuntime.documentEvents.subscribeSelectionChange(
  root,
  handleSelectionChange
);

return release;
```

`DOMDocumentRuntime` is a `WeakMap<Document, Entry>` with one native
listener, a root-runtime subscriber set, shadow-root-aware routing, and
reference-counted teardown. React consumes it; React does not own it.

| Packet | Decision |
| --- | --- |
| Priority | P2 |
| Adopt | One listener per `Document`, ref-counted subscriptions, root/shadow-root routing, last-subscriber teardown. |
| Delete | Per-root native listener registration and duplicated document scans. |
| Keep | Existing selection import/reconciliation callbacks, realm checks, root identity, multi-root semantics, native-selection ownership policy. |
| Reject | A public generic registry helper and reuse for unrelated events before measurement. |
| Adoption | Add DOM runtime hub; route React roots through it; remove direct listener registration in one hard cut. |
| Correctness proof | Two editors in one document; nested roots; independent teardown; stale disposer; moved root; shadow root; unmanaged captured selection; foreign realm. |
| Runtime proof | Exactly one native listener at N roots, zero at teardown, one callback per owning root, no dispatch after release. |
| Browser proof | Focused Chromium, Firefox, and WebKit selection rows; mobile viewport only. Real-device proof is not required for this internal listener count. |
| Benchmark | 1/10/100 mounted roots; listener count constant and selection dispatch bounded by mounted root routing. |
| Next owner | `plite-plan`, then `plite-dom` plus `plite-react`. |

## Prior candidate reconciliation

`A6` is **superseded as an audit candidate**. Current Plite already uses
descriptor references for dependencies/conflicts, immutable configuration,
typed API/read/update namespaces, contribution points, atomic publication,
rollback, dynamic replacement, and activation cleanup
(`packages/plite/src/core/editor-extension.ts:1`,
`packages/plite/test/extension-methods-contract.ts:1`). Lexical's mutable
`init/build/register/afterRegistration` phases and string peer/conflict edges
would be a regression.

## Independent cursors

| Lane | Current cursor | Closure |
| --- | --- | --- |
| Architecture | `dd5c41b13193efa9ab1574234d8593d2c9e4f988` | 59 source concepts; 73 symmetric rows; 0 unexplained |
| Tests | `dd5c41b13193efa9ab1574234d8593d2c9e4f988` | 405 inventory rows; 351 runnable; 193 portable; 85 portable-mixed; 0 uncertain; 4,212 indexed calls |
| Issues | `2026-07-29T13:25:57.084Z` | 2786 all-state rows; 4 added unchecked; 0 metadata changes; existing decisions preserved |

## Closure

- Canonical concepts unresolved: **0**
- Matrix integrity errors: **0**
- New material candidates: **2**
- Prior candidates unreconciled: **0**
- Blind transplants: **0**
- Implementation performed: **none**
