# Plate public documentation boundary audit

Status: Complete — audit only; findings remain open for implementation.

User constraint: Plate documentation teaches Plate. Plite is an internal
sublayer. The user explicitly allows both the Performance comparison and
From Plite to Plate migration guide, including the latter's translation.
This audit records findings; product documentation, APIs and publishing
configuration remain outside its write scope.

## Acceptance

- [x] Census every source page and metadata file in `content/docs`, including Chinese translations, and retain exact occurrence evidence.
- [x] Trace site, navigation, search, downloadable docs and rendered source snippets to their publishing owners.
- [x] Record the exact user-confirmed exceptions: `content/docs/(guides)/performance.mdx`, `content/docs/migration/plite-to-plate.mdx`, and `content/docs/migration/plite-to-plate.cn.mdx`.
- [x] Separate prose/link fixes from actual exported names and literal runtime contracts that cannot be renamed in docs alone.
- [x] Give concrete before/after teaching examples, breakage risks, and the strongest justified cut.
- [x] Reconcile independent findings, verify artifact evidence and close the audit without claiming repairs or runtime proof.

Evidence: [complete file census](../../.audit/plate-public-docs/files.tsv),
[all matching source lines](../../.audit/plate-public-docs/occurrences.tsv),
[counts](../../.audit/plate-public-docs/summary.json),
[rerunnable scanner](../../.audit/plate-public-docs/scan.py), and
[decision trail](../../.audit/plate-public-docs/decisions.tsv).

## Verdict

Remove the separate Plite learning tree from Plate's public documentation.
Move the complete editor, transaction, node and location reference into Plate
reference owners. Merge useful runtime explanations into their existing Plate
guides. Keep the two explicitly approved comparison topics. Internal source,
runtime ownership and contributor proof material can still describe Plite.

Readers installing Plate need one editor model and one set of imports. The
current split forces them through a second installation, extension vocabulary
and reference tree even though Plate already exposes those capabilities.
Changing the product packaging does not require deleting the internal runtime.

The hard-cut alternatives were: rewrite vocabulary only; hide navigation only;
or consolidate the published corpus and its canonical references. The first
leaves broken imports and duplicated teaching. The second leaves direct routes,
search, LLM exports and downloaded docs. Consolidation satisfies the user's
constraint while retaining the useful contracts. Keeping the raw tree as another
public learning lane conflicts with that constraint.

## Coverage

The case-insensitive census covers **313 MDX files and 2 metadata files**.
It records **1,703 matching lines in 177 files**. Excluding the three allowed
source files leaves **174 files and 1,679 matching lines**. These are source
counts, not rendered-page counts or individual defects.

| Source group | Files scanned | Files with mentions | Matching lines | Disposition |
| --- | ---: | ---: | ---: | --- |
| Current Plate pages and root metadata, excluding Performance | 210 | 77 | 452 | Rewrite teaching and links; coordinate real source names |
| `api/plite*` reference, EN and CN | 24 | 24 | 98 | Consolidate under Plate reference routes |
| `plite/**` raw tree and its metadata | 74 | 70 | 1,087 | Withdraw the whole tree from public Plate documentation; absorb relevant detail |
| Other migration/release source | 4 | 3 | 42 | Preserve historical facts; keep outside the current teaching corpus or adapt truthfully |
| Approved Performance and From Plite to Plate pages | 3 | 3 | 24 | Keep |

The current Plate group contains 46 affected English MDX pages, 30 Chinese
MDX pages, and root metadata. Four files in the raw tree contain no literal
Plite text, but their publishing owner still needs the same treatment. The
census includes them. Eighteen nontext assets are listed as excluded in the
summary; this audit makes no image-content claim.

The [file census](../../.audit/plate-public-docs/files.tsv) gives every source
file a disposition, including no-match files. The
[registry inventory](../../.audit/plate-public-docs/registry-files.tsv) records
59 additional source files containing Plite text. Some hits are internal
dependency bookkeeping; this is not a count of 59 visible documentation pages.

## Findings and source owners

### 1. Core reference requires the internal learning layer

[Editor API](../../content/docs/api/plite/editor-api.mdx:9) sends readers to
the raw editor page for its complete contract.
[Editor Transforms](../../content/docs/api/plite/editor-transforms.mdx:18)
does the same. The eleven reference subjects and their translations divide
the index and complete reference between two owners.

Merge the canonical detail into Plate-owned editor reads, updates, document
change, node, text, element, path, point, range, location and anchor references.
Move their routes out of `api/plite`; update every inbound link and metadata
entry together. Plate's [core entrypoint](../../packages/platejs/src/core.tsx:3)
already exposes the underlying APIs and selects its own editor factory.
Deleting the raw pages before moving this coverage would remove the complete
reference from Plate readers.

### 2. Ordinary guides explain internal ownership instead of the user's job

The main clusters are [plugin capabilities](../../content/docs/(guides)/plugin.mdx:289),
[plugin methods](../../content/docs/(guides)/plugin-methods.mdx:105),
[plugin context](../../content/docs/(guides)/plugin-context.mdx:122),
[editing behavior](../../content/docs/(guides)/editing-behavior.mdx:22),
[document model](../../content/docs/(guides)/document-model.mdx:6),
[selection](../../content/docs/(guides)/selection.mdx:15), and
[editor reference](../../content/docs/api/core/plate-editor.mdx:22).
Teach commands, corrections, lifecycle, selection and document state directly
as Plate capabilities. Their public call shapes need no second layer label.

The earlier edit to [Authored Changes](../../content/docs/(guides)/authored-changes.mdx:46)
left raw-runtime alternatives, links and serializer imports. That teaching is
outside the corrected scope. Remove those alternatives and use the actual
Plate entrypoints. The Chinese guide also contains direct `plitejs` imports.
The source provides [authored](../../packages/platejs/src/authored/index.ts:1),
[history](../../packages/platejs/src/history/index.ts:1), and
[Yjs](../../packages/platejs/src/yjs/core.ts:1) through Plate.

One concrete setup error: [Yjs](../../content/docs/(plugins)/(collaboration)/yjs.mdx:226)
tells Plate users to install Plite history, while
[getCorePlugins](../../packages/platejs/src/lib/plugins/getCorePlugins.ts:35)
already installs HistoryPlugin. Describe Plate's installed history and its
undo/redo commands. This is a source-proven documentation mismatch; duplicate
installation failure was not reproduced by this audit.

### 3. Publication keeps exposing the raw corpus

| Surface | Evidence | Required change |
| --- | --- | --- |
| Top-level product navigation | [site config](../../apps/www/src/config/site.ts:25) lists Plite beside Plate | Remove the separate Plite navigation destination; retain approved comparisons |
| Plate sidebar | [root filter](../../apps/www/src/lib/docs-root-nav.ts:22) only excludes `/docs/plite`; [metadata](../../content/docs/meta.json:19) also contains `/examples/plite/richtext`, and `api/plite` falls outside the filter | Remove the raw section/example escape and consolidate reference navigation |
| Previous/next links | [pager](../../apps/www/src/lib/docs-page-tree.ts:143) uses the combined page tree | Derive paging from the intended public corpus |
| Direct docs routes | [collection](../../apps/www/source.config.ts:74) and [loader](../../apps/www/src/lib/source.ts:4) expose the common source | Separate internal material from public collection membership; sidebar hiding is insufficient |
| Search, including CN fallback | [search source](../../apps/www/src/app/api/search/route.ts:102) reads unrestricted pages | Index the same public corpus and approved exceptions |
| LLM index and full text | [LLM source](../../apps/www/src/lib/llm-source.ts:14) returns the shared source; [full export](../../apps/www/src/app/(app)/llms-full.txt/route.ts:12) includes all English pages | Export only that public corpus |
| Installable docs | [registry collector](../../apps/www/scripts/build-docs-registry.mts:33) reads every English MDX; [target construction](../../apps/www/scripts/build-docs-registry.mts:153) installs them under `content/docs/plate` | Generate the registry from the same public membership |

Existing generated `public/r/registry-docs.json` has **198 items**, including
**85 whose names contain Plite**. `public/r/docs.json` depends on those 85.
For example, raw authored docs install into
`content/docs/plate/plite/libraries/plite-authored.mdx`. These are checked-output
counts; they are not asserted to match a fresh generator run.

The source does implement separate sidebars. The narrower finding is that the
filter is incomplete and does not govern the other publication channels.
All navigation conclusions here are source-derived, not browser observations.

### 4. Rendered source creates leaks outside MDX

[Dynamic component docs](../../apps/www/src/app/(app)/docs/[[...slug]]/doc-page.tsx:242)
assemble registry metadata, source and examples. The
[MDX source injector](../../apps/www/src/lib/rehype-component.ts:157) reads
real component files. Cleaning only `content/docs` cannot clean those examples.

The [history toolbar metadata](../../apps/www/src/registry/registry-editor.ts:350)
links to Plite History, and its
[component](../../apps/www/src/registry/components/editor/history-toolbar-button.tsx:4)
imports `usePliteHistory` from `platejs/react`. Static components such as
[Paragraph](../../apps/www/src/registry/components/editor/paragraph-static.tsx:2)
expose `PliteElement` and `PliteElementProps`. These need real source API
adoption and copied-caller updates, followed by registry generation.

The [Huge Document page](../../apps/www/src/app/(app)/docs/examples/huge-document/page.tsx:12)
says its panes compare Plate and Plite. The
[demo](../../apps/www/src/registry/examples/huge-document-demo.tsx:26) imports
upstream Slate and defines `EngineKind = 'plate' | 'upstream-slate'` at line 66.
That description is inaccurate regardless of the Performance exception.

### 5. Some visible names are actual contracts

| Existing contract | Source | Consequence of changing docs alone |
| --- | --- | --- |
| `PliteElement`, `PliteLeaf`, and static props | [static component exports](../../packages/platejs/src/static/components/plite-nodes.tsx:78) | Invented Plate-named imports fail; adopt real public names before changing examples |
| `usePliteHistory`, `PliteDecorationAttributes`, annotation/widget types | [React exports](../../packages/platejs/src/react/core.tsx:40) | Examples and inferred declarations still expose the internal brand; public name design needs its owning API change |
| `getPliteBrowserEditable`, `locatePliteBrowserBlock/Text` | [test exports](../../packages/test/src/playwright/index.ts:33) | Renamed documentation snippets reference nonexistent helpers; remove unnecessary internal testing detail or adopt real Plate helpers |
| `data-plite-*` and `.plite-*` selectors | [selection behavior](../../packages/plitejs/src/react/inactive-selection.ts:11), [class producer](../../packages/platejs/src/lib/utils/pluginNodeClass.ts:5) | Selection persistence or styling stops matching; prefer existing component props/local styling and coordinate any necessary protocol change |
| `application/x-plite-fragment` | [clipboard runtime](../../packages/plitejs/src/dom/plugin/dom-clipboard-runtime.ts:41) | A made-up MIME name stops exact-fragment interchange; ordinary docs can explain behavior without teaching this literal |
| `markdown-to-plite-demo` | [Markdown page](../../content/docs/(plugins)/(serializing)/markdown.mdx:9) | The preview no longer resolves unless its registry identifier and consumers move together |

No replacement API name is asserted to exist. Detailed public-name design and
protocol adoption remain implementation-owner work. Internal names need not be
renamed merely to remove unnecessary teaching; necessary public names need an
actual source-level solution.

### 6. Generated references and authoring rules can reintroduce the leak

The current API manifest contains 84 records with Plite-related data. Five
have curated routes: `BaseCommentsPlugin`, `CommentsPlugin`, and
`BaseMultiSelectPlugin` include Plite/module names in Plate-route signatures;
two scrubber entries point at raw docs in
[reference configuration](../../apps/www/api-reference.config.json:873).
The [generator](../../apps/www/scripts/build-api-reference.mts:195) copies
declaration and JSDoc content. No source MDX invokes `APIReference`, so these
records are **latent publishing debt**, not demonstrated visible reference text.

The [Plate Docs source rule](../../.agents/rules/plate-docs.mdc:22) currently
makes all raw Plite documentation an exception. That is broader than the user's
two approved topics. An implementation should repair the source rule and its
relevant teaching references through Maintain Workflow, regenerate the skill,
and record the public-teaching boundary in the smallest Vision owner. This
audit reports that repair without editing generated skills or internal doctrine.

## Before / after teaching

These are proposed editorial targets, not edits already applied.

| Before | After |
| --- | --- |
| “Plite owns the tree contract” in Document Model | “Plate stores editor-native JSON. Plugins declare schema-checked properties; codecs convert external formats.” |
| “Install Plite capabilities” in plugin authoring | “Commands and lifecycle” with the same supported Plate plugin fields and `platejs` imports |
| “See the canonical Plite transform reference” | A complete Plate editor-update reference, with the relevant guide linking directly to it |
| Authored Changes branches into raw `plitejs/authored` setup | One Plate setup and the `platejs/authored` reference |
| “Install Plite history” in Yjs | “Plate includes undo and redo. Use its history commands with Yjs.” |
| A Plite-branded component imported from `platejs/static` | A real source-owned public naming change, then updated examples; no fabricated import |

## Adoption order and verification

1. Consolidate complete reference coverage and retarget ordinary guide links;
   preserve the three exact exception files. Keep historical migration facts
   intact rather than globally rewriting old package names.
2. Establish public corpus membership at the publishing owner and apply it to
   direct routes, navigation, pager, search, LLM output and docs registry.
3. Rewrite EN/CN teaching and registry metadata. Resolve necessary public-name
   debt at the API owner and migrate affected copied sources; prefer removing
   irrelevant internal details where no API change is needed.
4. Repair authoring doctrine, regenerate affected outputs, then verify the
   resulting pages, links, exports and publication channels together.

Implementation proof should use the existing MDX build and docs parity check;
exact route/sidebar/pager/search/LLM checks for publication changes; and focused
package/types/browser proof only for actual API or DOM contract changes.
On `next`, registry source changes require `pnpm --filter www build:registry`.
A fresh occurrence check must allow only the approved comparison content and
truthful links to those approved pages, without a broad raw-tree exception.

## Audit evidence and limits

The root scanner covers every source page and metadata file. One read-only
worker reviewed all matching non-raw-tree pages and source API mappings;
another traced publication, registry snippets and generated reference output.
Their findings were reconciled against source excerpts in the parent task.
This was bounded independent source work, not a separate cross-model panel.

`review-ledger.mjs lookup plate-docs` returned no matching scope; the existing
feature ledger explicitly excludes site navigation and generated public output.
This audit does not assign a runtime architecture score or borrow a feature's
proof status.

The census stores per-file hashes and line evidence. The decision trail records
the user-confirmed exceptions and corrects the initial overly broad sidebar
claim. No workspace `agent-transcripts/` directory is available; the trail was
checked against this turn's tool results and resolving source evidence, without
claiming a separate transcript-file review.

No product docs, exports, registry output, navigation or workflow rules were
changed by this audit. No generator, runtime test or browser check was run.
The earlier authored-editor initialization failure was not rechecked here and
is not attributed to these documentation findings.
