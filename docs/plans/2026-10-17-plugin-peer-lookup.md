---
review_scopes: [callout, basic]
review_basis: [2026-10-15-details-title-slot, 2026-10-13-basic-review]
verdict: pursue
work_kind: implementation
review_commit: d0209b439a8f18dffa38cb74f8061bc0230bc8cc
review_inputs: [packages/platejs/src/features/details/lib/BaseDetailsPlugin.ts, packages/platejs/src/features/details/lib/BaseDetailsPlugin.spec.ts, packages/platejs/src/features/details/lib/BaseDetailsConversion.spec.ts, packages/platejs/src/features/basic-nodes/lib/BaseHeadingPlugins.ts, packages/platejs/src/features/basic-nodes/lib/BaseHeadingPlugins.spec.tsx, packages/platejs/src/react/plugins/paragraph/ParagraphPlugin.tsx, packages/platejs/src/react/editor/TPlateEditorCore.spec.ts, packages/platejs/src/markdown/lib/detailsSurface.spec.ts, packages/platejs/src/internal/plugin/compilePlateModel.ts, packages/platejs/src/lib/plugin/createPluginContext.internal.ts, packages/platejs/src/features/list/lib/BaseListPlugin.ts, packages/platejs/src/features/list/lib/BaseListPlugin.spec.tsx, packages/platejs/src/features/toc/lib/BaseTocPlugin.ts, packages/platejs/src/features/toc/lib/BaseTocPlugin.spec.ts, apps/www/src/registry/components/editor/slash.spec.tsx, apps/www/src/registry/components/editor/block-menu.spec.tsx, apps/www/src/registry/components/editor/turn-into-toolbar-button.behavior.spec.tsx, tooling/entrypoints/entrypoint-dag.mjs, docs/vision/plate.md, content/docs/(plugins)/(elements)/details.mdx, docs/plans/2026-10-13-basic-review.md]
review_upstreams: ['../lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988', '../tiptap@91c51be53c4655ef07e29ec489471524debfa0ca', '../prosemirror-model@6264de069d8439131e88f8ba06973551916184e4', '../slate@945a484df2497e4c448b33f417b0de2a49840032']
---

# Details and Heading find each other through their plugins

Status: executed: the patch waits uncommitted in your main checkout for your commit
Playbook: plan

Pursue, replacing the proposal. The suggested task asked for a typed lookup that finds an optional peer plugin by name, so Heading and Details can drop the internal `getCompiledPlateModelBinding` read. No caller needs such a lookup. Details can import Heading, because `platejs/details` may depend on the core heading code, and then `editor.plugin(BaseHeadingPlugin)` gives it the typed, installed-checked plugin the law asks for. Heading cannot import Details, because the core bundle must not load it, but it needs only the Summary's element type, and the by-name plugin lookup that lists and uploads already use returns that from the Summary's own plugin. A new name-keyed lookup would contradict `docs/vision/plate.md`, which refuses string lookups and a central plugin-name registry. The paragraph shortcut already reads no binding. Its execution playbook is Build.

## Brief

### What will change?

Details now asks for the real Heading plugin, and Heading reads the title type from the Summary plugin, so neither uses the internal name table. The change waits uncommitted in your checkout.

### What could go wrong?

A custom plugin that only borrows the name heading no longer gives Details titles a level. A plugin named detailsSummary that is not a block now stops the editor from starting. The saved bundle sizes need a refresh.

## Teach

Some Plate plugins need to know about another plugin that may or may not be installed. A Details title can carry a heading level, so Details asks whether Heading is installed and which block type it uses. Heading's level commands also work on a title, so Heading asks the same about the title plugin.

Before this change, both asked by name, in an internal table the editor builds when it starts. Any plugin named heading counted as Heading, and nothing tied the answer to the real plugin.

After the change, Details asks for the real Heading plugin, as the table of contents and lists already do, so only Heading counts. Heading cannot load Details code, so it still asks by name, but through the plugin lookup lists use, which hands back the title's type from the title plugin itself.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| A new lookup that finds a plugin by name with its types | Not added, because the existing lookups cover both callers | Add an internal typed lookup by name | peer lookup | big |
| A plugin that only borrows the name heading | Stops counting as Heading inside Details, like the table of contents and lists | Keeps counting | keep lookalike | small |
| How the design was compared | My own comparison table, no multi-model design round | A three-model design round | architect | detail |
| Review of the plan and diff | No panel, because no public call changes | A panel on the plan and the diff | panel | detail |
| The saved bundle sizes the release check compares | Left as they are until the package builds again (look) | Refresh them in this run | size snapshot | detail |
| A plugin named detailsSummary that is not a block | Makes the editor fail to start, as the rules ask when a lookup finds the wrong kind of plugin | Quietly ignore it, as before | lookalike summary | detail |

## Public API

No public call or type changes. Details now finds Heading through the plugin itself, not its name, when it releases a title, and asks Heading for the level when it wraps one.

```ts before
// packages/platejs/src/features/details/lib/BaseDetailsPlugin.ts
const headingType = getCompiledPlateModelBinding(
  editor,
  PLUGINS.heading
)?.elementType;

return isSummaryHeadingLevel(level) && headingType
  ? { level, type: headingType }
  : { type: editor.plugin(BaseParagraphPlugin).schema.type };
```

```ts after
// packages/platejs/src/features/details/lib/BaseDetailsPlugin.ts
const heading = editor.plugin(BaseHeadingPlugin);

return isSummaryHeadingLevel(level) && heading.installed
  ? { level, type: heading.schema.type }
  : { type: editor.plugin(BaseParagraphPlugin).schema.type };
```

Heading finds the Summary plugin by name and reads its type from that plugin, in its level read and in its commands.

```ts before
// packages/platejs/src/features/basic-nodes/lib/BaseHeadingPlugins.ts
const summaryType = getCompiledPlateModelBinding(
  editor,
  PLUGINS.detailsSummary
)?.elementType;
```

```ts after
// packages/platejs/src/features/basic-nodes/lib/BaseHeadingPlugins.ts
const summary = getCompiledPlatePlugin(editor, PLUGINS.detailsSummary);
const summaryType = summary
  ? editor.plugin(summary).schema.type
  : undefined;
```

## What other editors do

Read from source, not run: Lexical `dd5c41b131`, Tiptap `91c51be53c`, ProseMirror model `6264de069d` and Slate `945a484df2`. Class-based editors check a peer by its class; name-based editors look it up by name and add types by declaration merging, which Plate's law refuses for lookups.

| Editor | How an extension finds an optional peer | Where its types come from |
| --- | --- | --- |
| Lexical | `editor.hasNodes([HeadingNode])`, a check by class (`packages/lexical/src/LexicalEditor.ts:1570`) | The imported class |
| Tiptap | `getNodeType(name, schema)`, a lookup in `schema.nodes` by name (`packages/core/src/helpers/getNodeType.ts`) | Module augmentation of `Commands` (`packages/extension-heading/src/heading.ts:25`) |
| ProseMirror | `schema.nodes[name]`, keyed by name (`src/schema.ts:585`) | None; node types are untyped by name |
| Slate | No plugin registry; plugins compare `element.type` strings | The app's own custom types |

## Layer and owner

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| Details reads Heading by its descriptor | Plate | `platejs/details`, with a new edge to `standard/basic-nodes` | The import is the nominal lookup the law asks for, and TOC already takes the same edge |
| Heading reads the Summary type through the Summary plugin | Plate | `platejs` root (`standard/basic-nodes`) | Root cannot import Details, so the read stays by name |

## Main changes

- Details finds Heading through `editor.plugin(BaseHeadingPlugin)` and its installed check. A released title takes Heading's type, a wrapped block takes its level from Heading's `read.level`, and `platejs/details` depends on `standard/basic-nodes` in the entrypoint graph.
- Heading reads the Summary type from the Summary plugin it finds by name, through the same lookup list and upload use, instead of the compiled model's name table.

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Typed lookup of an optional peer by name | None | None added | none | `plate.md` lines 1057-1062 refuse string lookups and line 1018 a central plugin-name registry; no caller needs the types | None | Step 1 covers both callers without it | none | keep |
| Heading identity in Details | `getCompiledPlateModelBinding(editor, PLUGINS.heading)?.elementType` | `editor.plugin(BaseHeadingPlugin)` with its installed check | `platejs/details` | `plate.md` lines 1042-1062; the basic review moved list, TOC and indent the same way | No public change | Step 1 | A lookalike `heading` plugin stops counting, on purpose | rearchitect |
| Summary identity in Heading | `getCompiledPlateModelBinding(editor, PLUGINS.detailsSummary)?.elementType` | `getCompiledPlatePlugin` by name, then `editor.plugin(descriptor).schema.type` | `platejs` root | Root cannot import Details; `plate.md` lines 1037-1039 take a type from the schema-owning portal | No public change | Step 1 | A lookalike `detailsSummary` plugin still matches, as list's by-name peers do | rearchitect |
| Heading's HTML read of a title | `registry.has(PLUGINS.detailsSummary)` | Unchanged | `platejs` root | A format-registry name, outside the plugin lookup | None | none | none | keep |

## Evidence

Model: claude-opus-5-5 at xhigh effort ran this review and plan.

This page reviews one question in two scopes: how Details and Heading find each other. It retains `2026-10-15-details-title-slot`, the callout head, whose title-slot question this page does not touch, and `2026-10-13-basic-review`, the basic head, whose Heading identity row this page extends to Details. Reference checkouts read: `../lexical` at `dd5c41b13193efa9ab1574234d8593d2c9e4f988`, `../tiptap` at `91c51be53c4655ef07e29ec489471524debfa0ca`, `../prosemirror-model` at `6264de069d8439131e88f8ba06973551916184e4` and `../slate` at `945a484df2497e4c448b33f417b0de2a49840032`.

### Requirements

- Job: a Details title keeps its heading level through wrap, unwrap and the paragraph shortcut when Heading is installed, and a released title becomes a paragraph when it is not ([BaseDetailsPlugin.spec.ts](../../packages/platejs/src/features/details/lib/BaseDetailsPlugin.spec.ts), lines 85-220).
- Job: Heading's level read and commands work on a title in place (`content/docs/(plugins)/(elements)/details.mdx` and the `[EDIT-DETAILS-TITLE-LEVEL-001]` case at line 267 of the same spec).
- Law: `editor.plugin(plugin)` is the sole public imperative lookup, and its argument is a nominal descriptor; strings and foreign same-name descriptors do not resolve ([plate.md](../vision/plate.md), lines 1057-1062).
- Law: code that accepts an optional descriptor checks `editor.plugin(Plugin).installed`, and never infers availability from node types, schema properties or caches (lines 1042-1052).
- Law: element types come from schema-owning portals or authoring context, and a name serves only capability lookup (lines 1037-1039).
- Law: no central plugin-name registry (line 1018).
- Law: the root feature `basic-nodes` may not import `details` ([entrypoint-dag.mjs](../../tooling/entrypoints/entrypoint-dag.mjs), lines 86 and 97).

### Lanes

- **Details imports Heading, and Heading reads the Summary through its plugin (picked).** It adds no concept, follows the basic review's TOC, list and indent move, and reads every type from a plugin portal.
- **A typed by-name peer lookup, the proposal.** Rejected. It is a string lookup and a name registry the law refuses, and neither caller needs it: Details can import Heading, and Heading reads only a type string. "peer lookup" reopens it.
- **Heading treats any block that declares `level` as a title,** through `editor.read.schema.property`. Rejected, because it infers availability from schema properties, and Plite tests use `level` with other meanings.
- **The Summary contributes its level rule through a plugin point,** as `blockRelease` does. Rejected: a new concept for one contributor, and Heading's HTML read still names the Summary.
- **Strongest deletion: Heading stops knowing the Summary,** and Details owns title levels. Rejected, because `editor.plugin(BaseHeadingPlugin).update.setLevel(2)` on a title is documented in `details.mdx` and the slash, block and turn-into menus call it.
- **`tx.plugins.has(name)`,** the law's name check inside a transaction. Rejected for Heading's read, which runs outside a transaction and needs a type, not a method.
- Proof limits: the proof runs the package and registry specs under Bun, not a browser. The browser spec `apps/www/tests/browser/details-heading.spec.ts` drives the same reads through the UI and is not run, because no rendering or input path changes.

At base, each of the four reads this plan changes is caught by the Details spec when it returns nothing: a Details read fails the wrap and unwrap case, and a Heading read fails the title-level case or the mixed-selection case (`mutate/` logs in the run directory).

### Dependents

No export or signature changes, so a dependent sees a difference only through Heading's level read and commands or Details' wrap and release. A `git grep` of the files the lookup lists for `distribution`, `documents`, `editing`, `footnote`, `media` and `table` finds no such call.

- `distribution`: unaffected, because `root.tsx`, `markdownParagraph.ts` and the utility plugins never call those reads.
- `documents`: unaffected, because `docxStaticComponents.tsx` only maps `BaseHeadingPlugin.name` to its DOCX renderer.
- `editing`: unaffected, because `ExitBreakPlugin.ts`, `SingleBlockPlugin.ts` and `SingleLinePlugin.ts` never call those reads.
- `footnote`: unaffected, because `BaseFootnotePlugin` never calls those reads.
- `list`: unaffected, because list keeps its own heading check, which the basic review already moved to `editor.plugin(BaseHeadingPlugin)`.
- `markdown`: [detailsSurface.spec.ts](../../packages/platejs/src/markdown/lib/detailsSurface.spec.ts), which converts leveled titles and runs in the proof.
- `media`: unaffected, because `BaseImagePlugin` never calls those reads.
- `react`: [TPlateEditorCore.spec.ts](../../packages/platejs/src/react/editor/TPlateEditorCore.spec.ts), which runs leveled titles through the React plugins and runs in the proof.
- `table`: unaffected, because the copied `table.tsx` never calls those reads.
- `toc`: unaffected, because TOC already reads Heading through `editor.plugin(BaseHeadingPlugin)`.
- `ui`: [slash.spec.tsx](../../apps/www/src/registry/components/editor/slash.spec.tsx), [block-menu.spec.tsx](../../apps/www/src/registry/components/editor/block-menu.spec.tsx) and [turn-into-toolbar-button.behavior.spec.tsx](../../apps/www/src/registry/components/editor/turn-into-toolbar-button.behavior.spec.tsx), which set title levels through the copied menus and run in the proof.

## Steps

Execution authority: suggested task `task_3fa75615`, whose card the owner started in this session. The packet is the two plugin files, the Details spec, the entrypoint graph and its generated output, and this plan. Both reads land as one slice, because each is a few lines and one spec covers both.

- [x] 1. Details reads Heading through `editor.plugin(BaseHeadingPlugin)` in its release props and its wrap, and `publicFeatureDependencies.details` gains `standard/basic-nodes`, with `pnpm entrypoint:turbo:generate` run after. Heading reads the Summary type through `getCompiledPlatePlugin` and `editor.plugin(descriptor).schema.type`, and drops `getCompiledPlateModelBinding`. Proof: a new Details case, where a plugin that only borrows the name `heading` gives a wrapped title no level, fails at base through `proof-worktree.mjs --expect-fail` and passes on the build; the base mutation run shows the specs catch all four reads; `specs.sh` passes on the build; `pnpm check entrypoint-graph` passes; and at base the edited Details file fails `entrypoint-dag/no-forbidden-imports` without the new edge. Done: `lookalike-base-a1.log`, `build-specs-a1.log`, `mutate/`, `dag-edge-base-a1.log` and `entrypoint-graph-a1.log`, and on the final tree `final-specs-a1.log` and `mutate-final/`.
- [x] 2. Checks on the build: `pnpm --filter platejs typecheck`, `pnpm lint:task` on the changed files, and the `details` sizes in `tooling/entrypoints/platejs-entrypoint-sizes.json` against a package build of this tree. Proof: each command's log in the run directory. Done: `typecheck-a1.log` fails only where base fails, `final-partitions-a1.log` and `lint-task-a1.log` pass, and the size snapshot waits for the next package build (Defaults: size snapshot, `entrypoint-sizes-a1.log`).

## Completion Gates

| Gate | Applies | Artifact |
| --- | --- | --- |
| `pstack:thermos` on the slice's diff, because it touches plugin code other plugins read | yes | `thermos/branch/reply.md`; `thermos/quality/reply.md` |
| Writing passes on the product diff and the plan | yes | deslop and no-comments rows in the decision log; unslop and bro on this plan |
| `pnpm check` steps the edits reach | yes | `entrypoint-graph-a1.log`; `final-partitions-a1.log`; `lint-task-a1.log` |
| Hand drive | no | skip: no page draws anything different; `hand-drive.mjs route --none` recorded both plugin files |
| Playtest | no | skip: `playtest.mjs scope` names no scenario catalog for these files |
| `plate-docs` | no | skip: no docs page teaches the lookup or the lookalike case |
| `best-api repair` | no | skip: no public call or type changes |
| Changeset | no | skip: leveled titles come from the unreleased `semantic-details.md`, absent from `.changeset/pre.json`, so users upgrading see no change |

## Proof

The pre-edit baseline ran `specs.sh` at base, and every file passed (`baseline-specs-a1.log`). The base mutation run (`base-reads.mutate.json`) replaced each of the four reads with nothing and the Details spec failed each time. The final tree `4c05343` reran `specs.sh`, the four mutations and the touched typecheck partitions, and all passed.

## Close

The thermos review changed the wrap. Details now asks Heading's `read.level` for a wrapped block's level instead of repeating Heading's level rule, and `isSummaryHeadingLevel` narrows to `HeadingLevel`. Step 2 named only the `details` sizes, but the saved snapshot also holds root `platejs`, `platejs/details/react` and `platejs/toc`, which this change moves too. The snapshot is not refreshed, because the package build stops on a Plite declaration leak that `t_dc44fa5c` owns, and step 2 closes on that narrower proof (Defaults: size snapshot). The generated `packages/platejs/turbo.json` also gains two lines that this plan's edge does not cause. One adds `typecheck:partition:suggestion` under `test:partition:react-core`, which the base file lacked. The other adds `typecheck:partition:details` under the TOC test partition, which the landed TOC title patch left out of the checkout. The checkout's copy of `BaseDetailsPlugin.ts` already held other landed Details patches, so the run redid its edits on that copy, and the patch carries only its own changes.

Details reads Heading through `editor.plugin(BaseHeadingPlugin)` in its release props and its wrap. Heading reads the Summary type through `getCompiledPlatePlugin` and the Summary plugin's portal. Details, Heading and the paragraph shortcut no longer read `getCompiledPlateModelBinding`. A new Details case pins the lookalike cut. The entrypoint graph gains `details` to `standard/basic-nodes`, with its generated tsconfig and Turbo output. The work lands as an uncommitted patch in the main checkout.

The lookalike case fails at base and passes on the build. At base, at the frozen slice `bb51e6b` and at the final tree `4c05343`, the Details spec fails when any of the four reads returns nothing. The eight selected spec files pass on the final bytes, and so do the Details and basic-nodes typecheck partitions and `pnpm check entrypoint-graph`. The full platejs typecheck fails at base and on the build with the same code-block error, and the spec typecheck reports the same 942 errors on both. Lint passes on the four source files.

No browser run covers this change, because no rendering or input path changes, and the hand drive records both plugin files as showing nothing. The size snapshot is not refreshed. The branch reviewer's scratch specs, not this run's specs, show that React, extended and configured Heading plugins still resolve.

Two Opus reviewers ran thermos on the frozen slice, and neither found a blocker. The run applied two quality edits and dismissed two, with reasons in the decision log. The branch reviewer found one behavior change: a plugin named `detailsSummary` that is not a block now throws when the editor starts. It stays, because the law asks a wrong-kind lookup to throw (Defaults: lookalike summary).

The review read the law in `docs/vision/plate.md`, the user docs in `content/docs/(plugins)/(elements)/details.mdx` and the prior page `docs/plans/2026-10-13-basic-review.md`. It changed `packages/platejs/src/features/details/lib/BaseDetailsPlugin.ts`, `packages/platejs/src/features/details/lib/BaseDetailsPlugin.spec.ts`, `packages/platejs/src/features/basic-nodes/lib/BaseHeadingPlugins.ts` and `tooling/entrypoints/entrypoint-dag.mjs`. It read these without changing them: `packages/platejs/src/react/plugins/paragraph/ParagraphPlugin.tsx`, `packages/platejs/src/internal/plugin/compilePlateModel.ts`, `packages/platejs/src/lib/plugin/createPluginContext.internal.ts`, `packages/platejs/src/features/list/lib/BaseListPlugin.ts`, `packages/platejs/src/features/toc/lib/BaseTocPlugin.ts` and the specs `packages/platejs/src/features/details/lib/BaseDetailsConversion.spec.ts`, `packages/platejs/src/features/basic-nodes/lib/BaseHeadingPlugins.spec.tsx`, `packages/platejs/src/react/editor/TPlateEditorCore.spec.ts`, `packages/platejs/src/markdown/lib/detailsSurface.spec.ts`, `packages/platejs/src/features/list/lib/BaseListPlugin.spec.tsx`, `packages/platejs/src/features/toc/lib/BaseTocPlugin.spec.ts`, `apps/www/src/registry/components/editor/slash.spec.tsx`, `apps/www/src/registry/components/editor/block-menu.spec.tsx` and `apps/www/src/registry/components/editor/turn-into-toolbar-button.behavior.spec.tsx`.

No panel ran (Defaults: panel). No decision-trail review ran, because this card ran in one session, no panel left a critical finding, and no shared script or check changed. Reflect did not run, because no Autonomous run playbook ran and nobody corrected the workflow.

Open work:

- Refresh `tooling/entrypoints/platejs-entrypoint-sizes.json` with `pnpm plite:entrypoint-sizes:update` once the platejs build passes. owner: zbeyens. stop: `t_dc44fa5c` lands and the refresh runs, or the owner drops it.
