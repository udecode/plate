import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const root = 'docs/plans/artifacts/multi-editor-full-architecture-audit';
const source = JSON.parse(
  readFileSync(`${root}/lexical-source-manifest.json`, 'utf8')
);
const conceptManifest = JSON.parse(
  readFileSync(`${root}/lexical-concept-manifest.json`, 'utf8')
);
const issue = JSON.parse(
  readFileSync(
    'docs/editor-issue-harvester/lexical/full/issue-refresh.json',
    'utf8'
  )
);
const inventory = readFileSync(
  'docs/editor-test-harvester/lexical/inventory.md',
  'utf8'
);
const testCount = (name) =>
  Number(
    inventory.match(
      new RegExp(`${name.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')} (\\d+)`)
    )?.[1] ?? 0
  );
const commit = source.repository.commit;
const subject = execFileSync(
  'git',
  ['-C', '../lexical', 'show', '-s', '--format=%s', commit],
  { encoding: 'utf8' }
).trim();
const authored = execFileSync(
  'git',
  ['-C', '../lexical', 'show', '-s', '--format=%aI', commit],
  { encoding: 'utf8' }
).trim();
const sourceConceptRows = Object.entries(source.concepts)
  .map(
    ([id, title]) =>
      `| \`${id}\` | ${title} | [canonical row](./lexical-concept-matrix.md) |`
  )
  .join('\n');

const ledger = `# Lexical Architecture Ledger

Audit role: current Lexical reference lane for the registered full
Wordgard/Lexical/ProseMirror comparison. This is planning evidence, not
implementation authority.

## Provenance

| Field | Verified value |
| --- | --- |
| Checkout | \`../lexical\` |
| Commit | \`${commit}\` |
| Prior audited commit | \`d52f66e250e031a6c6fd8836d160373b0df557c7\` |
| Branch / upstream | \`main\` / \`origin/main\` |
| Commit subject | ${subject} |
| Commit authored | \`${authored}\` |
| License | MIT, \`../lexical/LICENSE:1\` |
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
| Git-tracked source units | ${source.summary.trackedUnits} |
| Relevant mapped units | ${source.summary.relevantUnits} |
| Exact exclusions | ${source.summary.excludedUnits} |
| Parsed code units | ${source.summary.codeUnits} |
| Top-level declarations/package records | ${source.summary.declarations} |
| Mapped declarations | ${source.summary.mappedDeclarations} |
| Excluded declarations | ${source.summary.excludedDeclarations} |
| Source-derived Lexical concepts | ${Object.keys(source.concepts).length} |
| Local-only symmetric-union concepts | ${
  conceptManifest.concepts.filter((concept) => concept.origin !== 'reference')
    .length
} |
| Canonical matrix rows | ${conceptManifest.concepts.length} |
| Relevant parse diagnostics | ${source.summary.relevantParseDiagnostics} |
| Unexplained units | **${source.summary.unexplainedUnits}** |
| Unexplained declarations | **${source.summary.unexplainedDeclarations}** |

## Blunt verdict

Current Plite/Plate is architecturally stronger on 69 of 73 atomic jobs.
Lexical is not a substrate donor. It is an excellent browser-behavior donor
with two ideas worth adapting:

1. **P1:** make Markdown node rules ordinary feature-plugin codec
   contributions instead of a central \`defaultRules\` switch.
2. **P2:** share one reference-counted \`selectionchange\` listener per
   \`Document\` across all mounted editor roots.

Lexical's class-node \`$config()\`, named slots, \`DOMSlot\`,
\`DOMImportExtension\`, \`DOMRenderExtension\`, mutable extension phases,
generic A11y UI helpers, and \`GenMap\` do not beat their current local owners.

## Full delta disposition

| Delta family | Verdict | Evidence |
| --- | --- | --- |
| Class-node \`$config()\` synthesis | reject | It couples schema, inheritance, JSON/DOM codecs, and replacement to node classes and required several follow-up fixes; Plite keeps schema data-first and compiled. \`../lexical/packages/lexical/src/LexicalNode.ts:1\`, \`packages/plite/src/interfaces/schema.ts:1\` |
| Named node slots | keep local | Plite element-owned roots already have grammar, independent addressing, lifecycle, mapping, collaboration, and host projection. Harvest Lexical concurrency/clipboard rows only. \`../lexical/packages/lexical/src/LexicalSlot.ts:1\`, \`packages/plite/src/core/element-owned-root-index.ts:1\` |
| \`DOMSlot\` and DOM render overrides | reject | Lexical's imperative reconciler needs a DOM boundary object. Plite keeps model ownership renderer-neutral; Plate owns React slots and compiled codecs. \`../lexical/packages/lexical/src/LexicalDOMSlot.ts:1\`, \`packages/plite-react/src/components/editable-text-blocks.tsx:1\` |
| \`DOMImportExtension\` | reject | Plate's schema-owned HTML compiler already orders matchers, detects conflicts, and handles encode plus decode. \`../lexical/packages/lexical-html/src/import/DOMImportExtension.ts:1\`, \`packages/core/src/lib/plugins/html/HtmlPlugin.ts:1\` |
| MDAST contributions | **steal/adapt P1** | Feature extensions own syntax import/export handlers and syntax extensions; Plate centralizes feature rules in Markdown. \`../lexical/packages/lexical-mdast/src/compile.ts:1\`, \`packages/markdown/src/lib/rules/defaultRules.ts:1\` |
| A11y package | reject architecture; keep proof | Live announcements fit Plite effects/React; focus trap and roving tabindex are UI primitives, not editor substrate. \`../lexical/packages/lexical-a11y/src/index.ts:1\`, \`packages/core/src/lib/plugin/BasePlugin.ts:1\` |
| Per-editor \`InputState\`, explicit read modes, \`onWarn\` | keep local | These changes remove Lexical ambient/global debt; Plite already has explicit editor state/read/update and diagnostics owners. \`../lexical/packages/lexical/src/LexicalEvents.ts:200\`, \`packages/plite/src/interfaces/editor.ts:1\` |
| \`GenMap\` copy-on-write node map | reject without benchmark | It optimizes Lexical's class-node map and reconciler, not Plite's JSON/change/index model. \`../lexical/packages/lexical/src/LexicalGenMap.ts:1\`, \`packages/plite/src/interfaces/editor.ts:1\` |
| Reference-counted document registry | **rearchitect P2** | Lexical shares one document selection listener; current React reconciliation attaches one per mounted root. \`../lexical/packages/lexical/src/LexicalEvents.ts:216\`, \`packages/plite-react/src/editable/selection-reconciler.ts:214\` |
| Shadow DOM, IME, iOS/Android, Firefox/Safari fixes | keep proof | These are portable browser laws, not reasons to import Lexical ownership. \`docs/editor-test-harvester/lexical/report.md:1\` |
| Tooling, devtools, playground, website, packaging | reject architecture | Product and repository policy do not define Plite substrate. \`../lexical/packages/lexical-playground/package.json:1\` |

## Complete source-derived concept inventory

The canonical matrix carries the full reference, Plite, Plate, six-dimension,
classification, adaptation, prior-candidate, verdict, and priority cells.

| ID | Atomic concept | Canonical comparison |
| --- | --- | --- |
${sourceConceptRows}

## Material candidate LX-MDAST — feature-owned Markdown codec contributions

### Verdict

Adapt the ownership idea, not Lexical's API. Plate already has the stronger
codec compiler and plugin inference. The missing law is simple: the plugin that
owns a node or mark also owns its Markdown rule.

### Current public shape

\`\`\`ts
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
\`\`\`

Feature packages install their plugin, but Markdown behavior is repeated in a
central \`defaultRules\` table or supplied through Markdown plugin state.

### Proposed public shape

\`\`\`ts
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
\`\`\`

Use the existing \`codecs\` authoring job. Do not add a \`markdown\` root
namespace, \`MdastKit\`, rule registry, or mutable runtime service. Advanced
foreign contributions use the existing
\`defineCodecs(TargetPlugin, { 'text/markdown': ... })\` form. The accepted
target includes a schema-bound \`text/markdown\` overload for
\`defineCodecs\`; the current generic document-codec overload is not sufficient
for MDAST node handlers.

### Current internal shape

\`\`\`ts
type MarkdownPluginState = {
  rules: MdRules | null;
};

const runtimeRules = {
  ...defaultRules,
  ...store.rules,
  ...operationOptions.rules,
};
\`\`\`

\`defaultRules.ts\` knows headings, links, lists, tables, media, marks, MDX,
mentions, callouts, and other feature contracts.

### Proposed internal shape

\`\`\`ts
type MarkdownNodeCodec = Readonly<{
  decode?: MdNodeParser['deserialize'];
  encode?: MdNodeParser['serialize'];
}>;

type CompiledMarkdownCodec = Readonly<{
  byMdastType: ReadonlyMap<string, readonly MarkdownNodeCodec[]>;
  byPluginType: ReadonlyMap<string, MarkdownNodeCodec>;
}>;
\`\`\`

The Plate codec compiler collects and validates node-level Markdown codecs
once. \`MarkdownPlugin\` privately registers the \`text/markdown\` rule
compiler; core stores the MIME-keyed declaration without importing MDAST
types. Feature declarations compile into that format runtime rather than
becoming competing document host codecs. \`MarkdownPlugin\` remains the
document-scoped parser/stringifier,
\`editor.api.markdown\` remains the operation surface, and per-call rules remain
an explicit advanced override only if a current consumer still needs them.

| Packet | Decision |
| --- | --- |
| Priority | P1 |
| Adopt | Feature-owned \`text/markdown\` codec rules; deterministic compiled ordering; syntax-extension contributions only where current GFM/MDX jobs require them. |
| Delete | Feature entries from \`defaultRules.ts\`; duplicated feature-key switches; mutable plugin-state \`rules\` if a consumer sweep finds no real runtime mutation. |
| Keep | \`MarkdownPlugin\`, \`editor.api.markdown\`, document codecs, per-operation filtering/options, unified/remark pipeline, HTML fallback, current MDX breadth. |
| Reject | Lexical extension bundles, mutable config merging, \`$getExtensionOutput\`, and a second Markdown-specific public grammar. |
| Adoption | Move one feature family at a time, starting with heading/link/list; delete each central row only after its owner codec passes parity. |
| Type proof | Self and foreign codec inference; mdast-node and Plate-node narrowing; duplicate/conflicting owner rejection; no callback annotations or casts. |
| Runtime proof | Import/export round trips, overlapping marks, GFM tables/tasks, MDX/custom constructs, HTML fallback, per-call filter precedence, plugin order invariance. |
| Browser proof | Paste/copy Markdown only where the host codec path participates; no raw-device requirement. |
| Benchmark | Compile once; conversion throughput and retained registry size must not materially regress against the current central map. |
| Next owner | \`best-api\` target accepted here; \`plate-plan\` owns boundary/adoption/proof planning. |

## Material candidate LX-CORE-REFCOUNT — document event hub

### Verdict

Move document-global listener ownership out of each React root reconciler and
into one DOM document runtime. This is internal architecture; no public API is
earned.

### Current public shape

\`\`\`tsx
<Plate>
  <Editable />
  <Editable />
</Plate>
\`\`\`

The public shape is already correct. Each mounted root currently installs its
own native \`selectionchange\` listener.

### Proposed public shape

\`\`\`tsx
<Plate>
  <Editable />
  <Editable />
</Plate>
\`\`\`

No new provider, option, hook, extension, or editor method.

### Current internal shape

\`\`\`ts
targetDocument.addEventListener('selectionchange', handleSelectionChange);

return () => {
  targetDocument.removeEventListener(
    'selectionchange',
    handleSelectionChange
  );
};
\`\`\`

### Proposed internal shape

\`\`\`ts
const release = domRootRuntime.documentEvents.subscribeSelectionChange(
  root,
  handleSelectionChange
);

return release;
\`\`\`

\`DOMDocumentRuntime\` is a \`WeakMap<Document, Entry>\` with one native
listener, a root-runtime subscriber set, shadow-root-aware routing, and
reference-counted teardown. React consumes it; React does not own it.

| Packet | Decision |
| --- | --- |
| Priority | P2 |
| Adopt | One listener per \`Document\`, ref-counted subscriptions, root/shadow-root routing, last-subscriber teardown. |
| Delete | Per-root native listener registration and duplicated document scans. |
| Keep | Existing selection import/reconciliation callbacks, realm checks, root identity, multi-root semantics, native-selection ownership policy. |
| Reject | A public generic registry helper and reuse for unrelated events before measurement. |
| Adoption | Add DOM runtime hub; route React roots through it; remove direct listener registration in one hard cut. |
| Correctness proof | Two editors in one document; nested roots; independent teardown; stale disposer; moved root; shadow root; unmanaged captured selection; foreign realm. |
| Runtime proof | Exactly one native listener at N roots, zero at teardown, one callback per owning root, no dispatch after release. |
| Browser proof | Focused Chromium, Firefox, and WebKit selection rows; mobile viewport only. Real-device proof is not required for this internal listener count. |
| Benchmark | 1/10/100 mounted roots; listener count constant and selection dispatch bounded by mounted root routing. |
| Next owner | \`plite-plan\`, then \`plite-dom\` plus \`plite-react\`. |

## Prior candidate reconciliation

\`A6\` is **superseded as an audit candidate**. Current Plite already uses
descriptor references for dependencies/conflicts, immutable configuration,
typed API/read/update namespaces, contribution points, atomic publication,
rollback, dynamic replacement, and activation cleanup
(\`packages/plite/src/core/editor-extension.ts:1\`,
\`packages/plite/test/extension-methods-contract.ts:1\`). Lexical's mutable
\`init/build/register/afterRegistration\` phases and string peer/conflict edges
would be a regression.

## Independent cursors

| Lane | Current cursor | Closure |
| --- | --- | --- |
| Architecture | \`${commit}\` | ${Object.keys(source.concepts).length} source concepts; ${conceptManifest.concepts.length} symmetric rows; 0 unexplained |
| Tests | \`${commit}\` | ${testCount('total')} inventory rows; ${testCount('runnable')} runnable; ${testCount('portable')} portable; ${testCount('portable-mixed')} portable-mixed; ${testCount('uncertain')} uncertain; 4,212 indexed calls |
| Issues | \`${issue.refreshedAt}\` | ${issue.resultingLedgerCount} all-state rows; ${issue.addedUncheckedCount} added unchecked; ${issue.metadataChangedNeedsRereadCount} metadata changes; existing decisions preserved |

## Closure

- Canonical concepts unresolved: **0**
- Matrix integrity errors: **0**
- New material candidates: **2**
- Prior candidates unreconciled: **0**
- Blind transplants: **0**
- Implementation performed: **none**
`;

writeFileSync(`${root}/lexical-architecture-ledger.md`, ledger);
