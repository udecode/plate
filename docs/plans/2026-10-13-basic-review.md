---
review_scopes: [basic]
verdict: pursue
review_basis: [2026-10-04-basic-audit]
review_commit: 6fa1169c5e723eb3e058697189cdcad85be220f9
work_kind: implementation
review_inputs: [VISION.md, docs/vision/common.md, docs/vision/plate.md, docs/editor-behavior/markdown-editing-spec.md, docs/research/review-records/2026-10-04-basic-audit.json, docs/research/review-records/2026-10-04-toc-audit.json, docs/research/review-records/2026-09-18-recovered-2026-09-07-full-plate-ui-extraction-audit.json, docs/plans/2026-10-04-ledger-triage-audit.md, packages/platejs/src/lib/plugins/paragraph/BaseParagraphPlugin.ts, packages/platejs/src/lib/plugins/getCorePlugins.internal.ts, packages/platejs/src/lib/editor/withPlite.ts, packages/platejs/src/lib/plugin/PluginFormatContext.ts, packages/platejs/src/internal/plugin/pluginFormatOperation.ts, packages/platejs/src/internal/plugin/compilePlateModel.ts, packages/platejs/src/lib/plugin/createPluginContext.internal.ts, packages/platejs/src/lib/plugins/input-rules/types.ts, packages/platejs/src/lib/plugins/input-rules/InputRulesPlugin.ts, packages/platejs/src/lib/plugins/html/HtmlPlugin.ts, packages/platejs/src/internal/plugin/insertExitBlock.ts, packages/platejs/src/features/code-block/lib/BaseCodeBlockPlugin.ts, packages/platejs/src/features/code-block/lib/CodeBlockRules.ts, packages/platejs/src/features/list/lib/listIndex.internal.ts, packages/platejs/src/features/list/lib/listIdentity.internal.ts, packages/platejs/src/ai/react/aiOutputLanding.internal.ts, packages/platejs/src/docx/export/lib/docxStaticComponents.tsx, packages/platejs/src/root.tsx, packages/platejs/src/utils/plugins/ExitBreakPlugin.ts, packages/platejs/src/utils/plugins/SingleBlockPlugin.ts, packages/platejs/src/features/footnote/lib/index.ts, packages/platejs/src/features/media/lib/image/index.ts, packages/platejs/src/features/toc/lib/index.ts, packages/platejs/src/markdown/lib/deserializer/mdastToSlate.ts, packages/platejs/src/react/features/basic-nodes/BasicNodesPlugins.tsx, packages/platejs/src/react/features/indent/IndentPlugin.tsx, apps/www/src/registry/components/editor/table.tsx, apps/www/src/registry/components/editor/fixed-toolbar.tsx, apps/www/src/registry/components/editor/turn-into-toolbar-button.tsx, packages/plitejs/src/core/schema-compiler.ts, packages/plitejs/src/core/editor-schema.ts, packages/plitejs/src/interfaces/editor.ts, packages/plitejs/src/editor/block-void-break.ts, docs/vision/plite.md, tooling/entrypoints/entrypoint-dag.mjs]
review_upstreams: ['../prosemirror-model@6264de069d8439131e88f8ba06973551916184e4', '../prosemirror-markdown@221ec60e26bc72005cacdbfc4f0ee43fda143489', '../prosemirror-inputrules@ea304c0f91a1f2409f17519066fb46c370a78517', '../lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988', '../tiptap@91c51be53c4655ef07e29ec489471524debfa0ca', '../slate@945a484df2497e4c448b33f417b0de2a49840032']
---

# Basic blocks: one identity for paragraph, heading and blockquote

Status: executed: built on next, uncommitted; waiting on your commit
Topic: basic
Playbook: plan

**The plan has three phases, and each one fixes part of the defects on its own.** First, list, TOC and indent find heading, blockquote and code block through their real plugins, and both format registries resolve a descriptor nominally. Second, the code block keeps every pasted character and declares once that input rules stay out of it; the horizontal-rule shortcut stops leaving its marker behind, and Enter on a divider lands the block its container declares. Third, Markdown lands each loose paragraph in the block the schema puts at that position, so a paragraph-less app can import and export Markdown. The Build playbook executes it.

**The verdict is Pursue, superseding the 2026-10-04 target.** Consumers reach the basic blocks by name or by a hard-coded `'paragraph'` instead of asking the owner that knows, and that one habit causes four defects measured on this checkout. Markdown import into an app that gives its document its own root refuses plain text, because the importer wraps loose text in a literal `'paragraph'` the app's schema does not have; HTML import in the same app lands the text in the app's default block. TOC, list and indent find the heading and blockquote by name, so a different plugin that happens to be named `heading` counts as the real one. Typing `# ` or `---` at the start of a code block turns the code block into a heading or a horizontal rule, because each shortcut copies its own code-block check and those two lack it. And `---` or `___` leaves its marker text inside the horizontal rule it creates. The 2026-10-04 review got the heading and blockquote half right. Its paragraph half assumed the core paragraph is always installed, so the format registry could return a string with no fallback. A probe shows an app with its own root can turn the paragraph off, so that target would make the type lie. This session took `basic` because `next` returned it; its prerequisite scope, `model`, is closed. This file holds both the verdict and the plan.

## Brief

### What will change?

Built. Plate finds basic blocks through their real plugins, code blocks keep shortcuts out and pasted text intact, and Markdown lands text where your schema says. Clipboard Markdown went back to its old code after review.

### What could go wrong?

Shortcuts no longer fire inside code blocks, on purpose. The speed check and two package checks stay unproven, held up by a busy machine and another session's files. The API reference waits on another session too. Commits are yours.

## Teach

Plate's basic blocks are the paragraph, heading, blockquote and horizontal rule. Each has one plugin. Other code needs to recognize them, such as list asking whether a block is a heading, or Markdown import wrapping loose text in a block.

Today that code asks in three ways. Copied UI asks the real plugin. List, TOC and indent look the plugin up by name, so any plugin with that name passes. Markdown and a few features wrap text in a hard-coded paragraph, which breaks in an app whose document starts with another block. Each Markdown shortcut also checks for code blocks on its own, and two forgot.

The fix gives each question one owner. The real plugin says which block is which. The schema says which block loose text becomes at each position, as it does for the block after a divider. The code block tells every shortcut to stay out, the way it already keeps review marks out.

## Public API

The code block adds one contribution beside the review-mark veto it already declares, and from then on no input rule runs inside it. A custom block that holds literal text, such as a diagram source, contributes the same point.

```ts before
// packages/platejs/src/features/code-block/lib/BaseCodeBlockPlugin.ts
contributions: [
  authoredVeto.of((element) =>
    element.type === context.schema.type ? 'code-block' : null
  ),
],
```

```ts after
// packages/platejs/src/features/code-block/lib/BaseCodeBlockPlugin.ts
contributions: [
  authoredVeto.of((element) =>
    element.type === context.schema.type ? 'code-block' : null
  ),
  inputRuleVeto.of(context.schema.type),
],
```

The copied autoformat kit drops the wrapper that added its own code-block guard, because the code block now keeps every rule out.

```ts before
// apps/www/src/registry/components/editor/autoformat.tsx
const arrowsRule = createAutoformatTextSubstitutionRule({
  patterns: [
    { format: '→', match: '->' },
    { format: '←', match: '<-' },
    { format: '⇒', match: '=>' },
    { format: '⇐', match: ['<=', '≤='] },
  ],
});
```

```ts after
// apps/www/src/registry/components/editor/autoformat.tsx
const arrowsRule = createTextSubstitutionInputRule({
  patterns: [
    { format: '→', match: '->' },
    { format: '←', match: '<-' },
    { format: '⇒', match: '=>' },
    { format: '⇐', match: ['<=', '≤='] },
  ],
});
```

Inside the packages, list finds the heading through its real plugin instead of by name; TOC and indent change the same way.

```ts before
// packages/platejs/src/features/list/lib/listIndex.internal.ts
const headingDescriptor = getCompiledPlatePlugin(editor, PLUGINS.heading);

return headingDescriptor
  ? editor.plugin(headingDescriptor).schema.type
  : undefined;
```

```ts after
// packages/platejs/src/features/list/lib/listIndex.internal.ts
const heading = editor.plugin(BaseHeadingPlugin);

return heading.installed ? heading.schema.type : undefined;
```

## What other editors do

Read at the revisions in the front matter, by source only; none was run. ProseMirror and Tiptap derive the default block from the content model and skip input rules inside code blocks centrally. Lexical uses node classes and a built-in paragraph.

| Editor | How features find another block | Default block for loose inline content | Input rules inside a code block |
| --- | --- | --- | --- |
| ProseMirror | Schema name, `schema.nodeType('paragraph')` in the Markdown parser | `ContentMatch.defaultType` of the content model | Skipped centrally unless the rule sets `inCode` (`prosemirror-inputrules` `inputrules.ts:120`) |
| Tiptap | Extension name strings, such as the TOC's `anchorTypes: ['heading']` | `defaultBlockAt(match)`, the first text block without required attributes | Skipped centrally when the parent's spec sets `code` (`core/src/InputRule.ts:103`) |
| Lexical | Node classes, such as `$isHeadingNode` and `dependencies: [HeadingNode]` | `$createParagraphNode()`, a core node every editor has | Each Markdown transformer decides |
| Slate | Application strings | The application decides | The application decides |
| Plate today | Name lookup in list, TOC and indent; nominal portals in copied UI | Literal `'paragraph'` in Markdown, the schema's root default in HTML | Each rule copies a code-block check; heading and horizontal rule lack it |
| Plate after this plan | Nominal descriptors in list, TOC, indent and both format registries; by-name lookups for optional image and table peers, and direct paragraph type reads in about twenty editing paths, which Open work keeps | The installed paragraph, else the schema's default for each top-level position | Skipped centrally for any element that contributes `inputRuleVeto`, as ProseMirror skips `spec.code` |

## Document shape

The horizontal-rule shortcut's output changes. Serializers and the void renderer read this node. Typing `---` in an empty paragraph stores the marker today and stores an empty void after the plan, with the caret in the block after it.

```json before
[
  { "type": "horizontalRule", "children": [{ "text": "--" }] },
  { "type": "paragraph", "children": [{ "text": "" }] }
]
```

```json after
[
  { "type": "horizontalRule", "children": [{ "text": "" }] },
  { "type": "paragraph", "children": [{ "text": "" }] }
]
```

Inside a blockquote, the block after a divider changes when the root's default differs from the quote's. In an app whose root default is `title`, Enter on a divider in a quote lands a `title` inside the quote today (`probe-round2-a2.log`); after the plan it lands the quote's declared paragraph, and `---` does the same.

```json before
[
  {
    "type": "blockquote",
    "children": [
      { "type": "horizontalRule", "children": [{ "text": "" }] },
      { "type": "title", "children": [{ "text": "" }] }
    ]
  }
]
```

```json after
[
  {
    "type": "blockquote",
    "children": [
      { "type": "horizontalRule", "children": [{ "text": "" }] },
      { "type": "paragraph", "children": [{ "text": "" }] }
    ]
  }
]
```

Pasting plain text into a code block changes. With Markdown and bold installed, the code block today decodes the paste as Markdown and flattens it, so `a **b** c` loses its asterisks; after the plan the code block inserts the text as typed.

```json before
[{ "type": "codeBlock", "children": [{ "text": "a b c" }] }]
```

```json after
[{ "type": "codeBlock", "children": [{ "text": "a **b** c" }] }]
```

Markdown import of `hello` in an app whose root default is a `title` block changes. The editor API refuses it today and the standalone parse returns a type the app lacks; after the plan both return the app's own block, and serializing it gives `hello` back. In a root whose first slot is a required heading, the first loose paragraph lands in that heading and the rest in the root's default, because each takes the schema's default for its position.

```json before
[{ "type": "paragraph", "children": [{ "text": "hello" }] }]
```

```json after
[{ "type": "title", "children": [{ "text": "hello" }] }]
```

## Layer and owner

Every change but one is Plate product policy on Plite's existing contribution mechanism and schema defaults. The one Plite change repairs the owner that picks the block after a divider, because Enter and the divider shortcut both read it and it picks the root's default inside containers.

| Change | Layer | Package | Why |
| --- | --- | --- | --- |
| `inputRuleVeto` point and its check in the input-rule executor | Plate | `core` (`packages/platejs/src/lib/plugins/input-rules/`) | Core runs every input rule and cannot import a feature, so the feature contributes and core reads |
| Code block contributes its type to `inputRuleVeto`, and inserts any plain-text paste inside itself as typed | Plate | `standard/code-block` | The code block owns literal editing inside itself, as the editing spec says |
| List, TOC and indent read heading and blockquote nominally | Plate | `standard/list`, `toc`, `standard/indent` | New edges `standard/list -> standard/basic-nodes`, `standard/indent -> standard/basic-nodes` and `toc -> standard/basic-nodes`; all acyclic, since basic-nodes imports only core. List's code-block Tab check stays a by-name lookup of an optional peer, because an edge to `standard/code-block` would pull the code block into the Markdown and AI bundles through `standard/list` |
| One nominal format registry resolver | Plate | `core` (`packages/platejs/src/internal/plugin/pluginFormatOperation.ts`), reused by `markdown` | Applies the same schema-family, identity and lineage test `editor.plugin` uses, against the candidate configuration's plugin of that name, and returns that configuration's element type, so behavior and mark plugins still answer no type |
| Markdown landing | Plate | `markdown` | Markdown owns its paragraph syntax and builds it with the installed paragraph's type, else a converter-internal type; a document landing pass asks the schema for each position's default, so recognition never confuses an app block with Markdown syntax |
| The block after a divider | Plite | `plitejs` (`packages/plitejs/src/editor/block-void-break.ts`) | `breakAtSelectedBlockVoid`, named `insertDefaultBlockAfterSelectedBlockVoid` before the build, builds the void's immediate parent's default for the next index through a helper it shares with `blocks.reset`, checks the insertion with `canPlaceAt`, and changes nothing when the parent cannot take it |
| Horizontal-rule shortcut ends with a break on the new void | Plate rule, Plite owner | `standard/basic-nodes` calls `tx.break.insert()` | Typing `---` then reuses the owner Enter uses, and declines when that owner places no block |

## Hard cuts and app migration

No public export or option is removed. String lookups stay valid everywhere, in rules as on the editor and in conversions, because the first review round showed that cutting them only in rules would leave two grammars for one lookup. The Pursue verdict on this owner-requested review counts as the ask for the behavior changes below, taken as `look` Defaults rows. Blast radius by `git grep` across packages, `apps/www/src/registry`, `content/docs`, `docs/vision` and `.agents/rules` on 2026-10-13:

- **Copied guards.** `apps/www/src/registry/components/editor/autoformat.tsx` loses `isTextSubstitutionBlocked`; apps that copied it keep working, because the guard becomes redundant, and drop it on their next copy.
- **Behavior apps can see.** Mark, link, math and text-substitution shortcuts no longer fire inside a code block; today `**x**` there bolds the code text. No input rule runs when a caller inserts text at an explicit location other than the selection; today the rule matches the selection and can convert the wrong block. The horizontal-rule shortcut does nothing when text follows the caret, where today it wraps that text inside the void. A plain-text paste into a code block keeps every character. Enter and Shift+Enter on a divider inside a container land the container's declared block instead of the root's, and do nothing in a container that cannot take another block, where today Enter throws. A foreign plugin that only shares the name `heading` or `blockquote` no longer counts for list, TOC or indent; package specs that build such a fixture move to the real descriptor in step 1.

No stored document needs a migration.

## Native behavior and proof

| Behavior | What changes | Where it is proven |
| --- | --- | --- |
| Typing `# `, `> `, `- `, `---`, `**x**` and `->` inside a code block | Stays literal text in the code block | Package spec through `editor.update.text.insert`; Chromium native typing on `/blocks/autoformat-demo` in `apps/www/tests/browser/autoformat.spec.ts`, five warm runs |
| Typing `---` in an empty paragraph | Empty void, then the container's declared block for the next position, with the caret in it; the next keystroke lands there | Package spec in a paragraph app, a title-root app, a prefix-root body and a blockquote in a title-root app; the same Chromium spec, five warm runs |
| Typing `---` before existing text, or in a slot where a divider cannot go | Declines; the typed text stays | Package spec |
| Pasting into a code block | Plain text keeps every character; URLs, rich text and copied editor fragments land as plain text, and an HTML-only paste keeps its text, as today | Package spec through `editor.api.dom.clipboard.insertData` with Markdown, italic and the link paste rule installed; Chromium native paste of plain text in the same browser spec |
| Enter or Shift+Enter on a divider inside a blockquote, or in a full container | Lands the quote's declared block with the caret in it; a full container stays unchanged | Plite specs in a title-root app with a blockquote and in a one-child container |
| Undo after a horizontal-rule shortcut | One history step, as `EDIT-INPUT-RULE-003` requires | Package spec |

## Performance

- applicability: applied, because the executor's veto runs on every typed key, Enter and paste, and the registry resolver runs per node in Markdown conversion.
- Vercel rules used: none; no React or Next code changes.
- questions answered: cohorts, repeated unit and memory; style and layout, readiness, page load and degradation do not apply, because nothing renders, mounts or measures differently.
- repeated unit: one input command through the executor; one Markdown node during conversion.
- cohorts: 2,000 typed keys in a paragraph with the autoformat kit's rules, the same inside a code block, and Markdown parse and serialize of the `plate-markdown-dialect` prose fixture.
- budgets: median microseconds per key or conversion at most 1.10 times the build base, through `paired-timing.mjs` with planted-slowdown and same-code arms; the veto adds one read of the selection's block and a set lookup per command and removes each rule's own code-block read; the resolver answers each descriptor once per operation; the landing pass runs only without a paragraph and is linear in top-level blocks. The existing `plate-markdown-dialect` and `plate-code-block-text-flow-browser` lanes do not decide this gate, because the first reports parity as inconclusive while passing, and the second installs no input rules.
- React/runtime primitives: none added.
- interaction metrics: the probe's per-key medians in both typing cohorts; native typing proof in step 8 is correctness, not timing.
- trace/CWV proof: not applicable, no load or hydration claim.
- memory tags: one per-operation memo map released with the operation; no retained cache.
- degradation contract: not applicable, complete DOM unchanged.
- dashboard/RUM gap: lab only.
- plan delta: step 15 gates the build; the pre-acceptance decision is `gate`, because the resolver and the veto are not built yet.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Next step | Build after the plan's review | Stop at the plan | stop at plan | big |
| Where imported loose text lands | The block your schema puts at that position, as Enter on a divider does | Make the paragraph impossible to turn off | required paragraph | big |
| Enter on a divider inside a quote or other container | The container's own kind of block | The page's default block, as today | root block on enter | small |
| Keeping shortcuts out of code blocks | The code block says so once and every shortcut obeys, bold and links included (look) | Add the same check to heading and the divider rule | per rule | big |
| Name-based plugin lookups in shortcuts | Keep them, the same as on the editor and in conversions | Remove them from shortcuts only | cut rule names | small |
| Shortcuts when text goes somewhere other than the caret | No shortcut runs; the text just lands there (look) | Run shortcuts against the caret's block, as today | caret shortcuts | small |
| Divider shortcut typed before existing text | Does nothing, and your text stays as typed | Insert the divider and move the text below it | keep suffix | small |
| Pasting plain text into a code block | Every character lands as typed (look) | Let Markdown decode it first, as today | decode code paste | big |
| How list, TOC and indent find heading and blockquote | Through the real plugin | Keep finding them by name | keep names | small |
| List's check for a code block under the caret | Keep finding it by name, so Markdown doesn't bundle the code block | Import the code block into list | import code block | detail |
| Image and table lookups during conversion | Keep finding them by name, so the main bundle stays lean | Import image and table into list and Markdown | cut names | small |
| Markdown's own grouping of loose text | Keep it, so imports do not start warning | Let the schema regroup text and warn on each repair | drop grouping | detail |
| TOC overlap | Fix only TOC's heading lookup here; its result shape stays with the TOC review | Do the whole TOC change here | toc here | small |
| Files another session is editing | Edit on top of its uncommitted work, copying each file first | Wait until that work lands | wait markdown | small |
| A Markdown paragraph property the landing block also sets, such as a block id | The paragraph's value wins, so an id written in Markdown survives | The landing block's own value wins | default wins | detail |
| Speed check on a busy machine | Accept four unclear runs, since none showed a cost beyond normal noise, and rerun it on a quiet machine later (look) | Keep the build open until a quiet machine gives a clear answer | rerun perf | small |
| Package checks that fail on another session's files | Accept them, since they fail the same way with this run's changes taken out, and rerun once that session's work passes (look) | Keep the build open until that session's work passes | rerun package proof | small |

## Scope

In: the ledger rows below, the docs pages that teach them, the copied autoformat kit, and the Vision and editing-spec lines that state the old behavior.

Out, each with its owner:

- TOC's result shape and its `queryHeading` cut stay with the 2026-10-04 TOC review.
- Image and table identity stay by-name lookups for optional peers.
- Deleting Markdown's inline-grouping helpers waits on the open Markdown plan's owner, who decides whether lossless repairs should warn.
- Reshaping the horizontal-rule shortcut beyond these fixes needs its own plan, as `EDIT-PROFILE-AUTOFMT-BLOCK-006` says.
- In an app without the paragraph, a Markdown slice parse, such as a paste, and an internal paragraph inside a container still refuse; only whole-document parses land loose text. It goes to Open work.
- An image or upload plugin registered before the code block can still claim a pasted image URL inside a code block, because command handlers run in registration order. It goes to Open work.
- The code block keeps three paste paths, its `insertData`, its `text/html` format and its slice replace; merging the HTML-only fallback into `insertData` goes to Open work.
- A mark rule whose mark is not installed swallows the typed trigger key today (`probe-round2-a2.log` case R5); it goes to Open work.
- The open-line break after a selected void (`applyParagraphBreakAfterSelectedBlockVoid`, `mutation-block-editing.ts:67-95`) inserts a literal paragraph instead of reading step 6's owner; it goes to Open work.
- About twenty editing paths outside conversion still read the paragraph's type directly and throw without it, such as code-block backspace and unwrap, the trailing-block plugin, details, columns, tables and the code fence rule's default block. They go to Open work; this plan's paragraph-less claim covers conversion and the divider shortcut only.
- `insertExitBlock` lands the root's slot-zero default and can leave its container; its other callers keep that behavior here, and the defect goes to Open work.
- A rule that must run inside a vetoing element has no opt-in, because no current rule needs one; the input-rule guide states the limit.
- Copied lint UI compares a plugin name to a stored type (`apps/www/src/registry/components/editor/lint.tsx:21`); it goes to Open work.

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Heading and blockquote identity in list, TOC and indent | Name lookup through `getCompiledPlatePlugin` and list's `getPluginType` | `editor.plugin(Base…Plugin)` with an installed check | `standard/list`, `toc`, `standard/indent` | [plate.md](../vision/plate.md) lines 1024-1029 | No public change | Step 1 | A lookalike plugin stops counting, on purpose | rearchitect |
| Format registry descriptor input | By name in format operations, nominal against the live editor in Markdown | One resolver: the `editor.plugin` identity test against the candidate configuration's plugin of that name, answering that configuration's element type, remembered per operation | `core` | Two answers to one question; Markdown's version reads the wrong configuration during compilation and assumes every plugin is an element | No public change | Steps 2 and 15 | Behavior and mark plugins must keep answering no type | rearchitect |
| Code-block paste | Single-line plain text goes through Markdown decoding and loses characters | The code block inserts non-empty plain text of any paste inside itself as typed, before the fragment path and every decoder; a paste without plain text keeps today's paths | `standard/code-block` | Pasting code must not lose characters | Step 11 | Step 3 | An image or upload handler registered before the code block still claims an image URL | rearchitect |
| Code-block admission for input rules | Seven copied checks; heading and divider rules lack one; mark rules run inside code | `inputRuleVeto`, contributed by the code block, read once by the executor against the selection | `core` point, `standard/code-block` contribution | One owner per fact; the spec makes the code block a strong local owner | Steps 10, 11 and 13; copied autoformat kit | Steps 4, 5, 8 and 15 | Shortcuts some users relied on inside code stop | rearchitect |
| Input rules for an explicit location | Rules match the selection while the text goes to `at`; link alone guards it | The executor runs no rule when `at` differs from the selection | `core` | One target for admission, matching and mutation | No public change | Step 4 | A caller that relied on a rule firing at the caret's block while typing elsewhere loses it | rearchitect |
| String lookups in input rules | String overload on the rule read editor; string values in rule options | Unchanged | `core` | The editor and the format registry keep string lookups for optional peers too | No change | None needed | None | keep |
| The block after a divider | Plite builds the root's default for the top-level index and inserts it inside the container | The void's immediate parent's default for the next index, shared with `blocks.reset`, admitted by `canPlaceAt`, and no change when the parent cannot take it | `plitejs` | Enter, Shift+Enter and the divider shortcut read one owner, and its producer is wrong inside containers and throws in a full one | Steps 12 and 14 | Step 6 | Enter on a divider in a container changes which block it lands | rearchitect |
| Horizontal-rule shortcut | Keeps marker text, swallows a suffix, throws without the paragraph | Deletes the whole match, declines on a suffix or where a divider cannot go, then breaks on the void and declines when no block follows | `standard/basic-nodes` rule on the Plite owner | Outcome O4, the absent-paragraph law, and one owner for the block after a divider | Step 12 | Steps 7 and 8 | The spec calls its shape kit policy; this changes only the defects | rearchitect |
| Markdown landing | 18 literal paragraph fallbacks and one literal image fallback | One helper gives the installed paragraph's type, else a reserved internal type; a document landing pass replaces each top-level internal paragraph with the schema's default for its position when that default is a text block, and refuses any it cannot place | `markdown`, core helper | [plate.md](../vision/plate.md) lines 728-739 | Step 14 | Steps 9 and 15 | Files the open table-cell plan also edits; a slice parse in a paragraph-less app still refuses | rearchitect |
| Standalone Markdown parse schema | Reads the bootstrap state | Reads through `readState` | `markdown` | The standalone parse must see the app's schema | No public change | Step 9 | None found | rearchitect |
| Registry strings for optional peers | By-name lookup for image, table and list's code-block check | Unchanged, documented as a by-name lookup | `core`, `standard/list` | Importing them would put media in the root bundle and the code block in the Markdown bundle | No change | Step 2 | A lookalike plugin with that name still matches | keep |
| Markdown inline grouping helpers | Markdown groups loose inline runs itself | Unchanged | `markdown` | Fitting would report each wrap as a repair warning | No change | None needed | None | keep |
| Implicit root default | Schema default names `paragraph` | Unchanged | `core` (`withPlite.ts`) | Schema vocabulary that overrides already remap | No change | `probe-absent-paragraph-a1.log` case D | None | keep |

## Steps

Each phase ends with a keep or revert decision. Before the first edit to a file that holds another session's uncommitted work, copy it to the run directory.

**Phase 1. Nominal identity and one registry.**

- [x] 1. List, TOC and indent read `BaseHeadingPlugin` and `BaseBlockquotePlugin` through `editor.plugin` with an installed check. Delete the name lookups at `listIndex.internal.ts:114`, `BaseTocPlugin.ts:42`, `BaseIndentPlugin.ts:214` and list's blockquote lookup at `BaseListPlugin.ts:234`. List's code-block Tab check keeps its by-name lookup of an optional peer. Declare the three edges in `tooling/entrypoints/entrypoint-dag.mjs`. Specs that build a same-name `heading` or `blockquote` fixture and read list, TOC or indent move it to the real descriptor or a configured copy and keep their assertions; on 2026-10-13 `git grep` finds them in `BaseTocPlugin.spec.ts`, `BaseListPlugin.spec.tsx`, `listIndex.internal.spec.ts`, `listIndex.internal.slow.ts`, `migrateListIdentity.spec.ts`, `withPlite.slow.ts`, `migratePlateV54.spec.ts`, `inputRules.spec.tsx` and the two `AIChatPlugin` specs, and the step checks each one's reads before moving it. Proof: spec cases that fail at base and pass after. A foreign `definePlugin('heading')` gives TOC no headings and list no heading index; a foreign `blockquote` stops indent's and list's quote checks. A heading remapped to `h` still feeds TOC. Every spec in the census passes unchanged in its assertions. `pnpm check entrypoint-graph` passes.
- [x] 2. One shared resolver answers the format registry's `has` and `type` for descriptor input. It applies the test `editor.plugin` applies, the same schema family and then identity or lineage, extracted from `createPluginAccess` into one predicate both call. It runs that test against the candidate configuration's plugin of that name, and answers that configuration's element type, which is no type for a behavior or mark plugin. It remembers each descriptor's answer for the rest of one format operation. String input stays a by-name lookup. `createPluginFormatOperationContext` and the Markdown runtime both call it. Proof: spec cases. A foreign `paragraph` makes the registry answer no for `BaseParagraphPlugin`, failing at base; a foreign `definePlugin('paragraph')` queried while the real paragraph is installed answers no; of two independent schema-only `definePlugin('example')` descriptors, the one not installed answers no, which lineage alone would answer yes (`probe-round2-a2.log` case R3); a configured `BaseHeadingPlugin` still resolves to its type; a mark plugin answers yes for `has` and no type; with the image plugin installed, `'image'` still answers yes. The existing `ProductFormats.spec.ts` case at lines 137-148 still passes.
- Phase 1 exit: keep when steps 1 and 2 pass with `pnpm --filter platejs typecheck` and the touched partitions' tests; otherwise revert phase 1's edits against the pre-edit copies.

**Phase 2. Code-block paste, input-rule admission and the divider shortcut.**

- [x] 3. When a paste that lands inside a code block carries non-empty `text/plain`, the code block's `insertData` inserts that text as typed, one line or many, before the editor-fragment path, Markdown or any other decoder runs; today only multi-line text takes that branch. A paste without plain text falls through to today's paths, where the code block's `text/html` format recovers the HTML's text. VS Code paste keeps its current handling. That `text/html` format at `BaseCodeBlockPlugin.ts:150` asks the registry for its own descriptor instead of its name. Proof: spec cases with Markdown, italic and the link paste rule installed. Plain `a **b** c`, `*foo*` and `tel:*123*` keep every character; the first two fail at base (`probe-plain-paste-a1.log`). A copied bold word and a copied bold URL land as plain text, and an HTML-only `<strong>hello</strong>` lands `hello`, as they already do at base (`probe-fragment-paste-a4.log`, `probe-round2-a2.log` case R7).
- [x] 4. Add `inputRuleVeto`, a Plate point exported from `platejs` and compiled with the input-rule metadata. When `insertText` carries an explicit `at` that is not a range equal to the selection, the executor runs no rule and returns `next()`, the comparison link's own `insertText` guard makes with `RangeApi.equals`; native typing sets the selection to its target first (`mutation-controller.ts:851-862`), so it still runs rules. Otherwise its three `around` handlers check the selection's block against the point before any rule's `enabled` or `resolve`, and return `next()` without a transaction when the selection is inside an element whose type a plugin contributed. The code block contributes its type. Proof: spec cases. Inside a code block, `# `, `> `, `- `, `---`, `**x**`, a backtick pair, `->`, `$$` then Enter, and URL text all stay literal. A custom element that contributes the point blocks a heading rule, and a custom `insertData` rule and a custom `insertBreak` rule each run outside it and not inside it. With the caret after `#` in a code block, inserting a space at an explicit point in a paragraph leaves the code block unchanged and puts the space in the paragraph; at base it converts the code block (`probe-explicit-at-a1.log`). The code-block cases of `probe-base-controls.ts` fail at base.
- [x] 5. Delete the copied checks at `BaseBlockPlugins.ts:38`, `BaseListPlugin.ts:1502`, `BaseLinkPlugin.ts:701` and `:802`, `BaseEquationPlugin.ts:25`, `CodeBlockRules.ts:24-28` and the copied `autoformat.tsx`, and the explicit-target guards in link's autolink and Markdown rules (`BaseLinkPlugin.ts:747-756` and `:785-794` in the working tree on 2026-10-13, each comparing `options.at` with the selection), keeping each rule's other conditions. Link's own `insertText` guard near line 593 is a command, not a rule, and stays. Proof: steps 3 and 4 still pass with every check gone, and the existing link, math, list, blockquote and code-block rule specs pass.
- [x] 6. Plite's `insertDefaultBlockAfterSelectedBlockVoid` builds the block after a selected block void from the void's immediate parent. Under the root it builds the root's positional default for the next index; under an element it builds that element's declared default child. One schema helper returns that filled default node, or null, and both this owner and `blocks.reset`'s `getDefaultBlockProps` (`public-state.ts`) call it; reset keeps its own throw on null. The owner checks the insertion with `canPlaceAt(parent, parent's children, [block], index, { root })`, which counts the parent's `max` and the siblings the insertion shifts. When that refuses, the owner reports the break handled and changes nothing, so neither `insertBreak` nor `insertSoftBreak` falls through to splitting the parent or typing a newline into the void. Proof: Plite specs through Enter and Shift+Enter. In a title-root app with a blockquote, Enter on a divider in the quote lands a paragraph inside the quote, where the frozen tree lands a `title` (`probe-round2-a2.log` case R1), and Shift+Enter does the same. A root divider still lands the root's positional default. In a container whose content allows at most one child, Enter and Shift+Enter on its divider leave the tree unchanged, where the frozen tree throws (`probe-round3-a1.log` case K1); an insertion that would shift a required prefix sibling out of its slot also leaves the tree unchanged. Plite's existing break specs pass.
- [x] 7. The divider rule declines when text follows the caret. Otherwise it deletes the whole match and sets the block to a divider; when the schema refuses the divider there, `tx.blocks.set` returns false and the rule declines. It then calls `tx.break.insert()`, which reaches step 6's owner, and declines unless the selection now sits in a block that is not a void, right after the divider, so the draft is discarded and the typed key lands as text. Proof: spec cases. In a paragraph app, `---` and `___ ` leave an empty void followed by a paragraph with the caret. In a title-root app the next block is `title`. In a root whose first slot is a required heading, `---` in the body lands a body block, not a heading. Inside a blockquote in a title-root app, the new block is the quote's paragraph. `---` before `abc` stays `---abc`; `---` in a slot that refuses a divider stays typed. One undo returns to the paragraph before the trigger. The divider cases of `probe-base-controls.ts` fail at base, and `probe-hr-break-a1.log` shows the break placement.
- [x] 8. Extend `apps/www/tests/browser/autoformat.spec.ts` with three native cases. Inside a code block, typed `# ` and `**x**` stay literal. In an empty paragraph, `---` makes an empty void, and the next key lands in the following block. A native plain-text paste of `a **b** c` into a code block keeps every character. Proof: `PLAYWRIGHT_BASE_URL=<doctored url> pnpm --filter www test:www-browser:chromium tests/browser/autoformat.spec.ts`, five warm runs, each logged in the run directory.
- Phase 2 exit: keep when steps 3 to 8 pass; otherwise revert phase 2's edits.

**Phase 3. Markdown landing.**

- [x] 9. Markdown builds its paragraph with the type one core helper returns. That is the installed paragraph's type, looked up by name as today, else a reserved internal type that no plugin may declare; the parse refuses with a diagnostic when the schema declares it, so the internal type never collides with an app type such as a code block persisted as `paragraph`. The 18 Markdown, blockquote, footnote and image fallbacks that read `registry.type(PLUGINS.paragraph) ?? 'paragraph'` call that helper, and image fallbacks keep returning their paragraph block, so two standalone invalid images stay two blocks. Recognizing a Markdown paragraph, as `markdownConversion.ts:936` and `markdownDocument.ts:147` do, compares against the helper's type, so it still means paragraph syntax. When no paragraph is installed, a landing pass on the parsed document replaces each top-level internal paragraph at index `i` with a fresh `createDefaultRootChild(root, i)`, which keeps its own properties and generated ids. The landed node takes the paragraph's children and its other properties, each checked through `schema.property` with any it drops reported as a property loss. The parse refuses with a diagnostic when that default is not a non-void element whose content accepts the paragraph's inline children, or when an internal paragraph is left anywhere else, such as inside a container. A slice parse that holds an internal paragraph refuses, as the literal does today. Only when no paragraph is installed does the serializer encode a top-level node as a Markdown paragraph when no mapping claims it, its children are inline, and its type is the root's positional default at its index; with a paragraph installed, an unmapped node still reports its loss. A round trip returns the same Markdown in a root whose positions share one default; in a root with a required first slot, the first paragraph comes back in that slot's syntax, such as `# a`. The standalone parse reads the schema through `readState`. `markdownIntrinsics.ts:130` drops its literal `'image'`. Proof: spec cases. In a title-root app with the paragraph off and the element-id plugin on, `editor.api.markdown.parse` and `parseMarkdown` of `a`, a blank line and `b` both return two `title` blocks with distinct ids, and serializing them returns the same Markdown. In a paragraph-less root whose first slot is a required level-1 heading, the same input returns that heading holding `a`, then a `title` holding `b`. Two standalone invalid images return two blocks, `one` and `two`. With the paragraph off and a code block persisted as `paragraph`, `parseInline` of a fenced block refuses instead of returning its text, and a document parse keeps that code block. With the paragraph off and the divider as the root default, parsing `hello` refuses instead of landing text in a void. With the paragraph on and an unmapped `title` as the root default, serializing a `title` still reports `markdown-unsupported-node`, as it does at base (`probe-round3-a1.log` case K3). With a plugin named `paragraph` that is not `BaseParagraphPlugin`, parsing `> a` still nests a paragraph in the quote, as today. A section-root app with the paragraph on is unchanged. The existing Markdown specs pass. `git grep -n -E "\?\? '(paragraph|image)'" -- packages/platejs/src` lists only the helper and `migratePlateV54Urls.internal.ts`. `probe-base-controls.ts` case `title-root-standalone-markdown-lands-paragraph` fails at base.
  Built with three proof changes, each logged as a deviation. The code block and the blockquote both refuse to install without the paragraph plugin, so the collision case uses an app block persisted as `paragraph`, the nested refusal uses a custom tag container, and the same-name case parses `a` instead of `> a`. Proof: `docs/plans/artifacts/2026-10-13-basic-review/step9-after-a3.log`, base control `docs/plans/artifacts/2026-10-13-basic-review/step9-base-a2-a1.log`, all nine base controls flipped in `docs/plans/artifacts/2026-10-13-basic-review/after-controls-a2.log`.
- Phase 3 exit: keep when step 9 passes; otherwise quarantine the failing site with an Open work item, never restoring a literal outside the helper.

**Docs and law.**

- [x] 10. Run `plate-docs` on `content/docs/(guides)/plugin-input-rules.mdx`, which has no Chinese twin. The page says code blocks keep every rule out and no rule runs when text goes to an explicit location, its examples lose their code-block guards, and it shows a custom literal block contributing `inputRuleVeto`. It states that a rule cannot opt back in inside a vetoing element. Proof: its example coverage audit, the docs checks and the rendered page in the docs preview.
  Built: the guide drops every code-block guard (blockquote, list, the substitution and copied-kit examples, the gating callout, the families table), adds Where rules run with the explicit-location rule and a custom `LiteralPlugin` contributing the veto, and adds an `inputRuleVeto` reference entry. Proof: `docs/plans/artifacts/2026-10-13-basic-review/docs-build-source-a1.log`, `docs/plans/artifacts/2026-10-13-basic-review/docs-parity-a1.log`, rendered pages in `docs/plans/artifacts/2026-10-13-basic-review/docs-render-a1.json`. The API reference manifest waits under Completion gates.
- [x] 11. Run `plate-docs` on `content/docs/(plugins)/(elements)/code-block.mdx` and its `.cn.mdx` twin, which say shortcuts stay out and plain-text paste lands as typed. Proof: the same.
  Proof: the same three files; both locales render the new paragraph.
- [x] 12. Run `plate-docs` on `content/docs/(plugins)/(elements)/horizontal-rule.mdx` and its `.cn.mdx` twin. The page says the shortcut needs a line of its own and, like Enter on a divider, lands the container's declared block after it. Proof: the same.
  Proof: the same three files; both locales render the new text and the page's preview editor mounts.
- [x] 13. Run `plate-docs`'s audit on `content/docs/(plugins)/(functionality)/autoformat.mdx` and its `.cn.mdx` twin for code-block guards. Proof: the same, or `skip:` with the audit's no-change result.
  skip: the audit found no code-block guard, `enabled` gate or `BaseCodeBlockPlugin` reference in either page (`docs/plans/artifacts/2026-10-13-basic-review/docs-render-a1.json`).
- [x] 14. Run `best-api repair`. `docs/vision/plate.md` lines 728-739 replace the absent-plugin literal with schema-owned landing and name input-rule admission's owner; the editing spec's ownership line about kits disabling autoformat in code blocks says the code block keeps input rules out. The spec's `EDIT-HR-ENTER-001` and `EDIT-ATOMIC-ENTER-SELECTED-001` entries, which promise an adjacent or empty paragraph, say the block is the parent's declared default and that a full parent leaves Enter unchanged, and `docs/editor-behavior/current-evidence.md`'s row citing `block-void-break.ts` names the new specs. Proof: its mirror regeneration and `node .agents/rules/plate-next/scripts/sync-resources.mjs --check`.
  Built: `plate.md` names `inputRuleVeto` as admission's owner and replaces the absent-plugin literal with schema-owned landing; the spec's ownership line, `EDIT-HR-ENTER-001` and `EDIT-ATOMIC-ENTER-SELECTED-001` say what the build does. No evidence row cited `block-void-break.ts`, so the `EDIT-HR-ENTER-001` row, which names the Enter specs, gained the new Plite and divider specs. The teaching sweep's live hits are this plan and the v1 playground template, which runs on published packages; the registry JSON hits regenerate with `build:registry`. The first check failed only on another session's staged `paired-timing.mjs` mirrors, and no file this run edited is mirrored (`docs/plans/artifacts/2026-10-13-basic-review/step14-sync-resources-a1.log`). After that session fixed its mirrors, the rerun at the close passes. Proof: `docs/plans/artifacts/2026-10-13-basic-review/step14-sync-resources-a2.log`.

**Performance gate.**

- [x] 15. After the last panel fix, run one paired probe through `benchmark` and `.agents/rules/benchmark/scripts/paired-timing.mjs`, with the build base in a proof worktree as the `base` arm and the final tree as `candidate`, plus a planted-slowdown arm and a same-code arm. Its four cohorts are typing 2,000 keys into a paragraph with the copied autoformat kit's rules installed, the same typing inside a code block, Markdown parse of the `plate-markdown-dialect` prose fixture, and Markdown serialize of its result. Before timing, each arm asserts its work: a counting rule installed beside the kit's rules sees its trigger reach admission in the paragraph cohort, and in the code-block cohort the candidate's counter stays at zero while the base's does not. The frozen line is the median microseconds per key or per conversion at most 1.10 times the base, with the helper's packet and load rules. Exit 0 accepts; exit 1 sends the resolver or the veto back to `architect`; exit 3 keeps the gate open, and the next probe doubles the packets. Proof: the measurements JSON and the helper's verdict in the run directory with both source identities, and `pstack:benchmark-checklist` on them before the row is logged `verified`.
  Accepted as partial under the Defaults word "rerun perf". Four runs exited 3, because the host's one-minute load reached 21.4, 30.1, 17.3 and 14.3 against the limit of 14, while other sessions ran their own work. The second run doubled each arm's samples from 7 to 14, because the helper fixes the packet count at 6, and the third and fourth ran on arms rebuilt from the post-lint bytes. No run showed a cost beyond noise. Across the 16 cohort runs, the candidate stayed within the spread of the same-code arm, which runs identical code. In the two quietest runs, every candidate ratio was at most 1.08 (`docs/plans/artifacts/2026-10-13-basic-review/step15-paired-a3.log`, `step15-paired-a4.log`; earlier runs `step15-paired-a1.log`, `step15-paired-a2.log`; measurements and source identities in `step15/`).

## Completion gates

| Gate | Check | Result |
| --- | --- | --- |
| Blast radius | `pstack:blast-radius` on the public change before the first code edit | `docs/plans/artifacts/2026-10-13-basic-review/blast-radius.md`, safety fact proven in `probe-blast-radius-a1.log` |
| Slice freezes | `freeze.mjs` after each phase, each with `--parent` of the previous | phase 1 `bbeb783bc9`, phase 2 `fa0fcf389b`, phase 3 `fbad2522b5` |
| Code quality review | skip: the `api-build` panel on the diff is owed from the first slice, and its seats apply the code-quality lens | skip: api-build panel owed |
| Writing passes | `deslop` and `no-comments` on code, `unslop` on docs and this plan, each with a `writing` row | the `writing` rows in `docs/plans/2026-10-13-basic-review.decisions.tsv`: `deslop` and comment-sicko on the build and on each diff round's fixes, `unslop` on the plan, docs and changesets |
| Typed lint before the diff panel | `pnpm exec oxlint --type-aware --format=default` on the task's lintable files, its file count matched to the paths passed | partial: it ran after the round 1 freeze, a logged `trail` deviation, and its two errors were fixed in round 1 (`docs/plans/artifacts/2026-10-13-basic-review/typed-oxlint-a1.log`); the last check reads 0 errors on 48 of the 50 paths, lint ignoring the other two |
| Diff review | the `api-build` panel on the diff, logged under `panel` | three rounds on `485c2bf543`, `000a28083b` and `066ddc8fb4`, ended at the cap with no open critical finding (`panel` rows) |
| Exports | `pnpm brl` after the new export | `docs/plans/artifacts/2026-10-13-basic-review/final-brl-a1.log`, no file changed |
| Registry | `pnpm --filter www build:registry` after the autoformat change | `docs/plans/artifacts/2026-10-13-basic-review/final-build-registry-a1.log` and `final-build-registry-check-a1.log` |
| API reference | the manifest regenerated in a proof worktree, as the verify command recipes say | blocked: the generator throws on another session's unexported `SchemaRoot` decision (`docs/plans/artifacts/2026-10-13-basic-review/final-api-reference-check-a1.log`); `inputRuleVeto` is in `apps/www/api-reference.config.json`, and the manifest waits under Open work |
| Changeset | one `platejs` changeset and one `plitejs` changeset | `.changeset/code-block-input-rule-veto.md` and `.changeset/plite-void-break-parent-default.md` |
| Docs | steps 10 to 13 through `plate-docs`, each with its example coverage audit | steps 10 to 13 above |
| Public API repair | step 14 through `best-api repair` | step 14 above |
| Hand drive | `verify`'s Hand drive on the pages this build changed, judged by `hand-drive.mjs check --log` | `docs/plans/artifacts/2026-10-13-basic-review/hand-drive-check-a1.log`: 46 cells covered, no drift |
| Performance | step 15's paired probe on the final tree | partial, accepted under the Defaults word "rerun perf". Four runs were inconclusive on host load, and none showed a cost beyond same-code noise (`docs/plans/artifacts/2026-10-13-basic-review/step15-paired-a4.log` and the three earlier attempts) |
| Package proof | `pnpm --filter platejs typecheck`, `pnpm --filter plitejs typecheck`, the touched `platejs` partitions' tests, the `plitejs` test lane that holds the break specs, `pnpm check entrypoint-graph` and `pnpm check review-ledger` on the final bytes | partial, accepted under the Defaults word "rerun package proof". `docs/plans/artifacts/2026-10-13-basic-review/final-typecheck-plitejs-a1.log`, `final-plitejs-runtime-contracts-a1.log`, `final-entrypoint-graph-a1.log` and eleven of the twelve `final-test-*-a1.log` partitions pass. The platejs typecheck exits 2, passing 87 of 89 tasks (`final-typecheck-platejs-continue-a1.log`), and the basic-nodes partition exits 1 on 11 cases in `BaseBlockPlugins.authored-tree.spec.ts` while its other three specs pass (`final-basic-nodes-own-a1.log`). Both failures repeat unchanged in the step 15 base arm, which holds the same snapshot of other sessions' uncommitted work with this run's files restored to `HEAD` (`attrib-base-typecheck-migrations-a1.log`, `attrib-base-basic-nodes-a1.log`), so they come from another session's authored-mark rewrite. That arm is not a clean `HEAD`, so the gate stays partial. `pnpm check review-ledger` runs after the fold |
| Last check | `pnpm lint:task` on this task's files | `docs/plans/artifacts/2026-10-13-basic-review/lint-task-a1-a1.log`: formatting only, 0 warnings and 0 errors |

Execution authority: the owner's "verdict basic" brief, whose Pursue verdict continues into the Plan and Build playbooks under Autopilot; no commit on `next`. Packet: build base `6fa1169c5e` plus every other session's uncommitted work in this checkout, which the build keeps and never reverts; each file that holds such work is copied to `docs/plans/artifacts/2026-10-13-basic-review/pre-edit/` before this run's first edit to it.

## Proof

Base controls ran at `HEAD` `6fa1169c5e` in a fresh detached worktree, worktree source only, and all nine defects reproduce (`docs/plans/artifacts/2026-10-13-basic-review/base-controls-a1.log`). The design premises ran on package source with Bun and happy-dom, one run each. They showed that a Plate-defined point collects a plugin's contribution and drops it when the plugin is absent; `readState` sees the app's root; mark rules bold code text today; blockquote cannot be installed without the paragraph (`probe-premises-a2.log`, `probe-container-default-a1.log`). The architect arena, its judge and the synthesis are in `docs/plans/artifacts/2026-10-13-basic-review/architect/`.

The first plan review's findings were checked the same way, one run each, all in the run directory:

- With the caret after `#` in a code block, inserting a space at a paragraph turns the code block into a heading today (`probe-explicit-at-a1.log`).
- Plain `a **b** c` pasted into a code block becomes `a  c`, or `a b c` with bold installed, and `*foo*` becomes `foo`; `tel:*123*` survives only while link's own code-block branch exists (`probe-plain-paste-a1.log`).
- A copied editor fragment pasted into a code block lands as plain text, empty code blocks included, even with the code block's own HTML format turned off. The fragment's slice replace returns false and the decoders flatten it, while the paragraph control keeps bold (`probe-fragment-paste-a2.log` to `-a4.log`, `probe-fragment-paste-mutant-a1.log`).
- `---` typed before `abc` wraps `--abc` inside the divider today (`probe-hr-suffix-a1.log`).
- `insertExitBlock` after a body divider, in a root whose first slot is a required heading, lands another heading. HTML import refuses loose text in a paragraph-less root of that shape (`probe-hr-before-a1.log`).
- `tx.blocks.set` then `tx.break.insert()` lands a paragraph, a `title`, a body paragraph in the prefix root and a paragraph inside the blockquote, each with the caret in it. Inside the required heading the set returns false. The one-undo case needs the history plugin and moves to step 6's spec (`probe-hr-break-a1.log`).

The seats' cases for the explicit location, the exit block, the plain paste and the copied bold URL reproduce the same way on the reviewed tree `dc36860a92` in a detached worktree (`probe-round1-frozen-a1.log`).

The second review's cases ran on its reviewed tree `ef49318db8` in a detached worktree (`probe-round2-a2.log`). Enter's owner lands a `title` inside a blockquote in a title-root app. Two default root children built at positions 0 and 1 carry different generated ids. Two independent schema-only descriptors named `example` both have zero stages and differ in schema family, so lineage alone would match them while `editor.plugin` does not. Two standalone invalid images land as two paragraphs today. A bold-italic rule without the italic plugin swallows the closing `*`. An HTML-only paste into a code block reads empty `text/plain` and still lands `hello` through the code block's HTML format.

The third review's cases ran on its reviewed tree `5207ee61b8` in a detached worktree (`probe-round3-a1.log`). In a container that allows one child, `canContainAt` accepts a second paragraph while `canPlaceAt` refuses it, and Enter on the divider there throws today. With a paragraph installed, serializing an unmapped `title` reports `markdown-unsupported-node`. With the divider as the root default, the default root child is a void.

The plan review stopped at its three-round cap. Its last round's findings are all settled in the plan; the build's diff review takes up anything they missed.

Phase 1 of the build, frozen as `bbeb783bc9`. Four cases where a plugin only shares the heading or blockquote name fail at base and pass after, in TOC, list and indent (`step1-base-a1.log`, `step1-after-a1.log`). Of the ten specs in the census, five moved to the real descriptor with unchanged assertions and five read none of list, TOC or indent. The registry case fails at base on the foreign paragraph and passes after (`step2-base-a1.log`, `step2-after-a1.log`). `pnpm --filter platejs typecheck` passes, 89 tasks uncached. So does `pnpm check entrypoint-graph` (`step1-entrypoint-graph-a2.log`), and the forced tests of the core, markdown, migrations, indent, list and TOC partitions pass. The basic-nodes partition fails nine authored-tree cases, and `AIChatPlugin.suggestions.spec.ts` fails two. Each expects no `held` authored mark. That mark kind exists only in another session's uncommitted rewrite of `plitejs/src/authored`, and the AI spec passes at base (`phase1-test-standard-basic-nodes-a1.log`, `step1-aichat-base-a1.log`).

Phase 2, frozen as `fa0fcf389b`. Each new case fails at base and passes after, every base run in a detached worktree at `6fa1169c5e` with only the new spec copied in:

- Plain `a **b** c` pasted into a code block becomes `a b c` at base (`step3-base-a1.log`).
- `# ` typed in a code block makes a heading at base (`step4-base-a1.log`).
- The six container cases of the block-void break throw schema errors at base, and the two root cases pass there as they should (`step6-base-a1.log`).
- Three of the four divider cases fail at base. The one-undo case already held (`step7-base-a1.log`).

The explicit-location case runs a rule-free paragraph pair, and the vetoing custom element blocks a block-start rule, an `insertBreak` rule and an `insertData` rule that each run in a paragraph (`step4-after-a1.log`). With every copied check deleted, the link, math, list, blockquote, code-block and input-rule specs pass (`step5-after-a2.log`). So do the copied kit's package-integration specs (`step5-www-kits-a1.log`). Step 8's three native cases passed five warm Chromium runs out of five against this checkout's dev server, with `devSource: true` and the native clipboard transport (`step8-chromium-run1-a1.log` to `-run5-a1.log`). Both package typechecks pass (`phase2-typecheck-platejs-a1.log`, `phase2-typecheck-plitejs-a1.log`). Forced tests pass in the core, math, code-block, link and list partitions, and in every `plitejs` partition but yjs. The yjs partition fails eight exclusive-property cases on mark runs across three authors. That spec and the yjs sources it drives are staged by another session, and the spec calls no reset, break, default-child or void code (`phase2-test-plitejs-a1.log`). The basic-nodes partition fails the same nine authored-tree cases as in phase 1.

Phase 3, frozen as `fbad2522b5`. At `HEAD` with only the new spec copied in, the five paragraph-less cases fail and the three with a paragraph installed pass, as they guard behavior that holds at base (`step9-base-a2-a1.log`). The image case fails at base on the standalone parse's bootstrap schema, which step 9's `readState` change fixes; the merge it guards is caught by construction, since inline fallback text would join `one` and `two` into one block. After the change all eight pass (`step9-after-a3.log`), and every one of the nine base controls that read DEFECT at `HEAD` reads OK on this checkout (`after-controls-a2.log`). `deserializeMdWithRuntime` had no caller and is deleted instead of moved to the helper. The reserved-type check runs before any parse, so a slice or inline parse refuses as well as a document. `pnpm --filter platejs typecheck` passes, 89 tasks uncached (`step9-typecheck-a1.log`), and so does `pnpm check entrypoint-graph` (`phase3-entrypoint-graph-a1.log`). The markdown, footnote, media, list, core, AI and migrations partitions pass; basic-nodes fails the same nine authored-tree cases as before (`phase3-test-*-a1.log`).

## Close

**Reversals and deviations.**

- Diff round 3 reverted the clipboard Markdown encoder to its code from before this plan, `?? 'paragraph'` literal included. Its one replacement in round 2 drew another critical finding, so the Panel review rule took the mechanism out of the loop. That rule outranks phase 3's exit text, "never restoring a literal outside the helper". The changeset narrows the claim. In an app without a paragraph plugin, copying part of a block that no Markdown mapping claims writes no `text/markdown`, while a block with its own mapping, such as a `<note>` tag, still writes it (`r3-clipboard-claims-after-a1.log`). A fragment serializer is under Open work.
- Step 3's `text/html` format accepts through the code block's own `context.schema.type` instead of a registry lookup of its descriptor, with the same behavior.
- Step 6's block-void break also reports the break handled, with no change, when the parent has no element default.
- Step 9 rebuilt three proof cases, because the code block and the blockquote refuse to install without the paragraph. The collision case uses an app block stored as `paragraph`, the nested refusal a custom tag container, and the same-name case parses `a`.
- `deserializeMdWithRuntime` had no caller, so the build deleted it instead of moving it to the helper.
- Typed oxlint ran after diff round 1's freeze instead of before it, and round 1 fixed its two errors.
- Four appends used a shell heredoc instead of the Edit tool. Two wrote to the run directory's `probe-fragment-paste.ts` during the plan's probes, and the build logged the other two. An inline `node -e` also wrote `r1-mutate-load.json`, and one foreground `sleep 1` ran before a seat poll.
- Step 15 doubled each arm's samples instead of its packets, and closed as partial under the Defaults word "rerun perf".
- The Build playbook gained a Hand drive gate during the run; this build added the gate and passed it.

**What landed.** List, TOC and indent find heading and blockquote through their real plugins, and one resolver answers both format registries for a descriptor with the `editor.plugin` test. The code block inserts plain-text pastes as typed and contributes its type to the new `inputRuleVeto`, which the executor reads before any rule. No rule runs when text goes to an explicit location other than the selection, and the seven copied code-block checks are gone. Plite's block-void break builds the immediate parent's default and admits it with `canPlaceAt`, and the divider shortcut declines beside text or an inline element, then breaks on the new void. Without a paragraph plugin, Markdown lands each loose paragraph in the root's default for its position and writes it back. The input-rules guide, the code-block and horizontal-rule pages with their Chinese twins, `plate.md`, the editing spec and two changesets say so. The owner commits; this run made no commit.

**Proof and its limits.**

- Each phase's regression cases fail at `6fa1169c5e` in a detached worktree and pass after, while its preservation controls, such as the root break cases and the one-undo case, already pass there. All nine base controls that read DEFECT at `HEAD` read OK (`after-controls-a2.log`).
- The diff panel ran three rounds and ended at the cap with no open critical finding. Mutation runs reverted each round's fixes one at a time, and each guarding spec then failed (`r1-mutate-a2.out`, `r2-mutate-a1.out`).
- Step 8's three native Chromium cases passed five warm runs.
- On the post-lint bytes, the `plitejs` typecheck, eleven of twelve `platejs` partitions, the `plitejs` runtime contracts and the entrypoint graph pass. The `platejs` typecheck fails its `migrations` task, and the basic-nodes partition fails 11 authored-tree cases. Both fail the same way in the step 15 base arm, which holds other sessions' uncommitted work without this run's changes (`attrib-base-*-a1.log`), so the Package proof gate closed as partial under the Defaults word "rerun package proof".
- The hand drive covered 46 cells in the built-in browser. Typed key by key, `---` made a divider with a block after it, and `->` stayed literal in a code block while it became an arrow in a paragraph (`hand-drive-check-a1.log`).
- The proof stops short in five places. Outside step 8 and the hand drive, the package specs type through `editor.update.text.insert`, not native input. Step 15 stayed inconclusive on host load, with no cost visible beyond noise. The two package failures above are attributed, not passed, because the base arm is not a clean `HEAD`. Nothing ran on Safari, Firefox or a device. The API reference manifest is not regenerated, because another session's `SchemaRoot` export blocks the generator.

**Counts.** 31 items: 15 steps and 16 Completion gates. 24 done, 4 partial (step 15, the Performance gate, typed lint before the panel and the Package proof gate), 2 skipped (step 13's audit found nothing to change; the code quality review gave way to the `api-build` panel), 1 blocked (the API reference manifest), 0 open.

**Review inputs.** The review read the doctrine in `VISION.md`, `docs/vision/common.md`, `docs/vision/plate.md`, `docs/vision/plite.md` and `docs/editor-behavior/markdown-editing-spec.md`. It read the prior records `docs/research/review-records/2026-10-04-basic-audit.json`, `docs/research/review-records/2026-10-04-toc-audit.json` and `docs/research/review-records/2026-09-18-recovered-2026-09-07-full-plate-ui-extraction-audit.json`, and the triage in `docs/plans/2026-10-04-ledger-triage-audit.md`. Its Plate core sources were `packages/platejs/src/lib/plugins/paragraph/BaseParagraphPlugin.ts`, `packages/platejs/src/lib/plugins/getCorePlugins.internal.ts`, `packages/platejs/src/lib/editor/withPlite.ts`, `packages/platejs/src/lib/plugin/PluginFormatContext.ts`, `packages/platejs/src/internal/plugin/pluginFormatOperation.ts`, `packages/platejs/src/internal/plugin/compilePlateModel.ts`, `packages/platejs/src/lib/plugin/createPluginContext.internal.ts`, `packages/platejs/src/lib/plugins/input-rules/types.ts`, `packages/platejs/src/lib/plugins/input-rules/InputRulesPlugin.ts`, `packages/platejs/src/lib/plugins/html/HtmlPlugin.ts`, `packages/platejs/src/internal/plugin/insertExitBlock.ts`, `packages/platejs/src/root.tsx`, `packages/platejs/src/utils/plugins/ExitBreakPlugin.ts` and `packages/platejs/src/utils/plugins/SingleBlockPlugin.ts`. Its feature sources were `packages/platejs/src/features/code-block/lib/BaseCodeBlockPlugin.ts`, `packages/platejs/src/features/code-block/lib/CodeBlockRules.ts`, `packages/platejs/src/features/list/lib/listIndex.internal.ts`, `packages/platejs/src/features/list/lib/listIdentity.internal.ts`, `packages/platejs/src/ai/react/aiOutputLanding.internal.ts`, `packages/platejs/src/docx/export/lib/docxStaticComponents.tsx`, `packages/platejs/src/features/footnote/lib/index.ts`, `packages/platejs/src/features/media/lib/image/index.ts`, `packages/platejs/src/features/toc/lib/index.ts`, `packages/platejs/src/markdown/lib/deserializer/mdastToSlate.ts`, `packages/platejs/src/react/features/basic-nodes/BasicNodesPlugins.tsx` and `packages/platejs/src/react/features/indent/IndentPlugin.tsx`. Its copied UI sources were `apps/www/src/registry/components/editor/table.tsx`, `apps/www/src/registry/components/editor/fixed-toolbar.tsx` and `apps/www/src/registry/components/editor/turn-into-toolbar-button.tsx`. Its Plite sources were `packages/plitejs/src/core/schema-compiler.ts`, `packages/plitejs/src/core/editor-schema.ts`, `packages/plitejs/src/interfaces/editor.ts` and `packages/plitejs/src/editor/block-void-break.ts`, and the entrypoint graph is `tooling/entrypoints/entrypoint-dag.mjs`.

**Attention.** Reviewed by `codex:gpt-6.1-sol` at xhigh effort, on a frozen snapshot of the plan, the log, the changesets and the task patch (`docs/plans/artifacts/2026-10-13-basic-review/trail-review/answer-sol.md`). Each finding and what the run did:

- Critical. The Package proof gate was counted done while the `platejs` typecheck exited 2 and the basic-nodes partition exited 1. Fixed. The gate is now partial, accepted under the Defaults word "rerun package proof" with labeled `partial` and `accepted` rows, and the counts moved from 25 done to 24.
- Warning. Step 14 cited a sync check that exited 1 on another session's stale mirrors. Fixed. That session repaired its mirrors, the rerun passes (`step14-sync-resources-a2.log`), and step 14 cites both runs.
- Warning. The clipboard claim covered every app block stored as `paragraph`, while a block with its own Markdown mapping still writes `text/markdown`. Fixed in the changeset, this Close, Open work and the subject file.
- Warning. The editor comparison promised nominal descriptors everywhere a package reads a basic block, while Open work keeps about twenty direct paragraph reads. Fixed: the Plate row now names where descriptors are nominal and what still reads by name.
- Warning. The deviation list undercounted the process slips. Fixed. It now names all four heredoc appends, the inline `node -e` write and the one foreground `sleep 1`.
- Nit. The Close said every new case failed at base, while preservation controls passed there. Fixed in the first proof bullet.
- The reviewer did not check whether the clipped Copy buttons predate this build. None of this run's 62 changed files renders the file card, so Open work records it as layout outside this build; no browser control at `HEAD` ran.

**Open work.** The fifteen items below each name an owner and a stop. Two of them are offered as suggested tasks, `insertExitBlock` and the clipped Copy buttons. The manifest regenerates once another session decides the `SchemaRoot` export.

## Open work

- Copied lint UI compares the code block's plugin name to a stored type, so a remapped code block is linted as prose (`apps/www/src/registry/components/editor/lint.tsx:21`; inferred from source, not run). It moves to the subject file's Open work when this plan folds. owner: zbeyens. stop: the next review of the `lint` ledger scope.
- `insertExitBlock` lands the root's slot-zero default and can leave its container (`packages/platejs/src/internal/plugin/insertExitBlock.ts:32` and `:40-57`; `probe-hr-before-a1.log`). Its other callers keep that behavior after this plan. The suggested task offered at this run's close has started, and its uncommitted change deletes `insertExitBlock.ts` and inserts the container's default (`.changeset/platejs-exit-break-default.md`). owner: zbeyens. stop: that change lands.
- About twenty editing paths read the paragraph's type directly and throw or misplace text without it, such as `BaseCodeBlockPlugin.ts:302` and `:723`, `TrailingBlockPlugin.ts:26`, `BaseDetailsPlugin.ts:156-390`, `BaseColumnPlugin.ts:334`, `BaseTablePlugin.ts:590`, `:2446` and `:2637`, `BaseListPlugin.ts:1044` and `CodeBlockRules.ts:7` (source reads, not run). owner: zbeyens. stop: the next review of each owning ledger scope.
- In a paragraph-less app, a Markdown slice parse and an internal paragraph inside a container refuse; HTML import refuses loose text in a paragraph-less root with a required first slot (`probe-hr-before-a1.log`). owner: zbeyens. stop: the next `model` review.
- An image or upload plugin registered before the code block claims a pasted image URL inside a code block (`BaseImagePlugin.ts:432-451`, `BaseUploadPlugin.ts:885-905`; source read, not run). owner: zbeyens. stop: the next code-block review.
- The code block's `text/html` format only serves pastes without plain text after step 3; folding it into `insertData` would delete one of three paste paths. owner: zbeyens. stop: the next code-block review.
- `createMarkInputRule` consumes the trigger key when a mark it applies is not installed, because `apply` returns `undefined` instead of declining (`createInputRules.ts:97-103`; `probe-round2-a2.log` case R5). owner: zbeyens. stop: the next input-rules review.
- No input rule can opt back in inside a vetoing element; no current rule needs to. owner: zbeyens. stop: the first rule that asks for it.
- The open-line break after a selected void inserts a hard-coded `paragraph` (`packages/plitejs/src/react/editable/mutation-block-editing.ts:21-24` and `:67-95`), so a paragraph-less app gets a type its schema lacks; it should read step 6's owner. owner: zbeyens. stop: the next editing review.
- Clipboard Markdown serializes each copied piece as a whole application document. A fragment serializer should encode copied pieces with their owned roots, without root rules or position-based landing. Diff rounds 1 and 2 rewrote the encoder, and after round 3 the Panel review rule reverted it to its code from before this plan, `?? 'paragraph'` literal included. In an app without a paragraph plugin, copying part of a block that no Markdown mapping claims writes no `text/markdown`, and such an app block stored as `paragraph` now writes none where it wrote its text before; a block with its own mapping still writes it. A copy spanning three or more blocks under a root with a prefix slot writes none, as at `HEAD` (`r3-clipboard-claims-after-a1.log`, `r3-clipboard-claims-head-a1.log`, decision rows for diff rounds 1 to 3). owner: zbeyens. stop: the next Markdown review, as a new plan whose panel runs before any change to the encoder.
- Step 15's paired probe never ran on a quiet host. Rerun `paired-timing.mjs` with `step15/config.json` after rebuilding the arms through `step15/setup.mjs`, while the one-minute load stays under 14; exit 1 sends the veto or the resolver back to `architect`. owner: zbeyens. stop: one run on a quiet host exits 0 or 1.
- The `platejs` typecheck fails its `migrations` task and the basic-nodes partition fails 11 authored-tree cases, on another session's uncommitted authored-mark rewrite (`final-typecheck-platejs-continue-a1.log`, `final-test-standard-basic-nodes-a1.log`). Rerun both on this build's files once that work lands. owner: zbeyens. stop: both pass, or a failure that names this build's files reopens the Package proof gate.
- The API reference manifest lacks `inputRuleVeto`. `api-reference.config.json` includes it, but the generator throws on another session's undecided `SchemaRoot` export (`final-api-reference-check-a1.log`). owner: zbeyens. stop: the `SchemaRoot` decision lands and `pnpm --filter www api-reference` regenerates the manifest.
- At 375 px, a component page's file card clips its Copy buttons. They sit at x 338 to 402, past the card's right edge at 336 (`/docs/components/autoformat`, measured during the hand drive). This build changed only the file's content, not the card. owner: zbeyens. stop: a suggested task offered at this run's close.
- A complete Plite schema without a `paragraph` element, beside Plate's enabled paragraph plugin, gets `paragraph` nodes from Markdown. The format registry reports the plugin's element type, so nothing lands, a document parse fails to fit, and an `unknown: 'preserve'` slice keeps the undeclared node (`r2-preserve-probe-a1.log`). owner: zbeyens. stop: the next Markdown review.

## Evidence

Model: claude-opus-5-5 at xhigh effort lead; three source explorers ran on Codex `gpt-6.1-sol` at medium effort, and the explainer on Opus at high effort.

Prior work: the 2026-10-04 audit (Pursue) found list, TOC and indent turning the names heading and blockquote into portals through the private `getCompiledPlatePlugin` lookup, and 18 format sites falling back to a raw `'paragraph'` literal. The 2026-10-04 TOC audit (Pursue, not adopted) wants the same heading fix inside a wider TOC change. Ledger status on 2026-10-13: 68 scopes, 0 unreviewed, 21 Pursue not adopted, 1 deferred, 46 closed. Run directory: `docs/plans/artifacts/2026-10-13-basic-review/`.

Other sessions' uncommitted member files that `next` listed: `apps/www/src/registry/components/editor/mark-toolbar-button.spec.tsx`, `packages/platejs/src/ai/react/AIChatPlugin.streaming.spec.ts`, `packages/platejs/src/features/basic-nodes/lib/BaseBlockPlugins.ts`, `packages/platejs/src/features/basic-nodes/lib/BaseHeadingPlugins.ts`, `packages/platejs/src/features/footnote/lib/BaseFootnotePlugin.ts`, `packages/platejs/src/features/indent/lib/BaseIndentPlugin.ts`, `packages/platejs/src/features/list/lib/BaseListPlugin.spec.tsx`, `packages/platejs/src/features/list/lib/BaseListPlugin.ts`, `packages/platejs/src/markdown/lib/MarkdownPlugin.ts`, `packages/platejs/src/markdown/lib/internal/markdownMappings.ts` and `packages/platejs/src/markdown/lib/serializer/listToMdastTree.ts`. The change to the basic-nodes files is the `txLocate` marker from the in-flight transactions plan; the review's questions do not depend on it. This run builds on all of them and never reverts them.

### Requirements

- Every editing and conversion consumer reaches paragraph, heading, blockquote and horizontal rule through the installed nominal descriptor; a different plugin with the same name does not resolve ([plate.md](../vision/plate.md) lines 1024-1029).
- Heading stays one capability with a required level from 1 to 6; per-level plugins stay forbidden.
- The paragraph is the core text block every Base editor installs, and an application `schema.root` may name another default and turn the paragraph off (`packages/platejs/src/lib/editor/withPlite.ts:429`; probe `probe-absent-paragraph-a1.log`).
- A format runtime builds structural nodes with the installed schema type, and keeps a literal only on the external tree or when the Plate plugin is genuinely absent; a conversion never returns a document its schema refuses ([plate.md](../vision/plate.md) lines 728-739).
- A matched input-rule marker is consumed only when its conversion applies, and the code block is a strong local owner of editing inside it ([markdown-editing-spec.md](../editor-behavior/markdown-editing-spec.md), Code Block and Input-Rule Execution).
- Entrypoint edges stay honest per `tooling/entrypoints/entrypoint-dag.mjs`.
- The owner's constraints for this run: build on other sessions' uncommitted state and never revert it; never commit or push `next`.

### Lanes

- **Keep the current design.** Loses. All four defects above reproduce on this checkout (`probe-default-block-a1.log`, `probe-paragraph-a2.log` case E, `probe-code-block-rules-a2.log`, `probe-hr-rule-a1.log`).
- **The 2026-10-04 target unchanged.** Loses on its paragraph half. `BaseParagraphPlugin.configure({ enabled: false })` with an application root constructs, and `editor.plugin(BaseParagraphPlugin).installed` is then false (`probe-absent-paragraph-a1.log` case F), so a registry that always returns a string would lie. Its heading and blockquote half stands.
- **Strongest deletion: make the paragraph impossible to turn off.** Loses. An application root is public law ([plate.md](../vision/plate.md) line 567), HTML import already serves paragraph-less apps by landing text in the schema's root default, and with the paragraph installed an app whose root holds sections still needs the schema, not the paragraph, to decide where text lands (`probe-section-root-a1.log`).
- **Pursue: ask the owner that knows.** Wins. Block identity comes from the nominal descriptor, the landing block from the schema default for that spot (the read HTML import, exit-block insertion and media already use), and the code-block decline from one owner instead of a copy per shortcut, as ProseMirror and Tiptap do. The plan picks the shapes through `architect`.
- **Proof limits.** Probes ran on package source with Bun and happy-dom, one run each, no browser. The code-block and horizontal-rule cases ran through `editor.update.text.insert`, the public input path the rule specs use, not native typing. The explorers read source and ran nothing; their claims about two registry semantics in one Markdown operation and the detached `parseMarkdown` schema are source reads, and the probe confirms only the detached result.

### Challenge delta

Improved by three plan review rounds, with the architect synthesis's veto, nominal identity and code-block ownership kept.

- Moved: input-rule admission now delegates when an explicit location differs from the selection, instead of checking that location, and link's own copies of that check go.
- Re-owned: the block after a divider moves from `insertExitBlock` to Plite's void-break owner, which is repaired to read the immediate parent.
- Added: the code block owns plain-text paste inside itself, which the veto's removal of link's paste branch needed.
- Replaced: one cached landing type, then a two-sample position test, by a converter-internal paragraph that a document landing pass places at each position.
- Deleted: the string-lookup cut, the `MarkComboRules` descriptor change, and the inline image fallback.
- Tightened: the registry resolver uses the whole `editor.plugin` identity test; the void-break owner admits with `canPlaceAt` and changes nothing when refused; the internal paragraph uses a reserved type and lands only in a text block; the serializer's paragraph fallback runs only without a paragraph; the performance gate is a paired probe with input rules installed.

Re-scored against the incumbent after these cuts, the plan still wins: every defect in Lanes reproduces at `HEAD`, and none of the cuts removes a fix for one.

### Dependents

- `distribution`: [root.tsx](../../packages/platejs/src/root.tsx) re-exports basic-nodes; any new feature edge stays inside the root entrypoint's closure.
- `documents`: [docxStaticComponents.tsx](../../packages/platejs/src/docx/export/lib/docxStaticComponents.tsx) keys renderers by descriptor name and reads TOC headings, so TOC's nominal heading lookup reaches DOCX export.
- `editing`: unaffected; [ExitBreakPlugin.ts](../../packages/platejs/src/utils/plugins/ExitBreakPlugin.ts) and [SingleBlockPlugin.ts](../../packages/platejs/src/utils/plugins/SingleBlockPlugin.ts) import only the `PLUGINS` name map, which this review keeps.
- `footnote`: [index.ts](../../packages/platejs/src/features/footnote/lib/index.ts) re-exports `BaseFootnotePlugin`, whose Markdown decoder wraps loose text with the literal fallback.
- `list`: [listIdentity.internal.ts](../../packages/platejs/src/features/list/lib/listIdentity.internal.ts) receives the heading type that list looks up by name.
- `markdown`: [mdastToSlate.ts](../../packages/platejs/src/markdown/lib/deserializer/mdastToSlate.ts) feeds the deserializer whose paragraph fallbacks change.
- `media`: [index.ts](../../packages/platejs/src/features/media/lib/image/index.ts) re-exports `BaseImagePlugin`, whose invalid-source fallbacks use the literal paragraph.
- `react`: unaffected; [BasicNodesPlugins.tsx](../../packages/platejs/src/react/features/basic-nodes/BasicNodesPlugins.tsx) and [IndentPlugin.tsx](../../packages/platejs/src/react/features/indent/IndentPlugin.tsx) wrap the same descriptors, which keep their identity.
- `table`: unaffected; [table.tsx](../../apps/www/src/registry/components/editor/table.tsx) makes no basic block lookup.
- `toc`: [index.ts](../../packages/platejs/src/features/toc/lib/index.ts) re-exports `BaseTocPlugin`, whose heading lookup changes.
- `ui`: unaffected; [fixed-toolbar.tsx](../../apps/www/src/registry/components/editor/fixed-toolbar.tsx) delegates block identity to [turn-into-toolbar-button.tsx](../../apps/www/src/registry/components/editor/turn-into-toolbar-button.tsx), which already uses nominal descriptors.

### Reconciled reviews and plans

- This review supersedes `2026-10-04-basic-audit` ([record](../research/review-records/2026-10-04-basic-audit.json)): it keeps that review's heading and blockquote target and replaces its paragraph target, which the absent-paragraph probe falsified.
- It retains `2026-09-18-recovered-2026-09-07-full-plate-ui-extraction-audit` ([record](../research/review-records/2026-09-18-recovered-2026-09-07-full-plate-ui-extraction-audit.json)), because copied menus and kits still own composition and already use nominal descriptors.
- It retains `2026-10-04-toc-audit` ([record](../research/review-records/2026-10-04-toc-audit.json)) for TOC's result shape and `queryHeading` cut; only TOC's heading lookup moves here.
- Plans `docs/plans/2026-07-06-plate-next-basic-nodes-package-review.md`, `docs/plans/2026-08-13-repair-heading-component-family.md` and `docs/plans/2026-09-07-full-plate-ui-extraction-audit.md` stay historical; this review retains their outcomes (one heading capability with a level, copied UI ownership) and adopts none of their steps.
