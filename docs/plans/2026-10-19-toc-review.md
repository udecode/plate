---
review_scopes: [toc]
verdict: pursue
review_basis: [2026-10-04-toc-audit]
work_kind: implementation
review_commit: b54221655ac2e3c624b103c9d98f76e85911fc34
review_inputs: [VISION.md, docs/vision/common.md, docs/vision/plate.md, packages/platejs/src/features/toc/lib/BaseTocPlugin.ts, packages/platejs/src/features/toc/lib/BaseTocPlugin.spec.ts, packages/platejs/src/features/basic-nodes/lib/BaseHeadingPlugins.ts, packages/platejs/src/features/details/lib/BaseDetailsPlugin.ts, packages/platejs/src/docx/export/lib/docxStaticComponents.tsx, packages/platejs/src/docx/export/lib/exportDocx.spec.ts, packages/platejs/src/docx/export/lib/internal/render-document-file.ts, packages/platejs/src/static/internal/staticPresentation.ts, packages/platejs/src/static/components/PlateStatic.reuse-oracle.spec.tsx, packages/platejs/src/react/features/toc/TocPlugin.tsx, packages/platejs/src/migrations/migratePlateV54BuiltIns.internal.ts, packages/platejs/src/utils/plugins/SingleLinePlugin.ts, tooling/entrypoints/entrypoint-dag.mjs, apps/www/src/registry/components/editor/toc.tsx, apps/www/src/registry/components/editor/toc-static.tsx, apps/www/src/registry/components/editor/toc.spec.tsx, apps/www/src/registry/components/editor/details-static.tsx, apps/www/src/registry/components/editor/insert-toolbar-button.tsx, apps/www/src/registry/components/editor/plugins.ts, apps/www/src/registry/components/editor/plugins-static.ts, apps/www/api-reference.config.json, 'content/docs/(plugins)/(elements)/toc.mdx', 'content/docs/(plugins)/(elements)/toc.cn.mdx', .changeset/toc-v54-runtime.md, .changeset/toc-heading-levels.md, .changeset/semantic-details.md, docs/editor-behavior/current-evidence.md]
review_upstreams: ['../lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988', '../tiptap@91c51be53c4655ef07e29ec489471524debfa0ca', '../prosemirror@c7f2f1d7bde70728dfedaa68ca8f5fc3dffa17cc', '../slate@945a484df2497e4c448b33f417b0de2a49840032', '../ckeditor5@14e73cc31b869ce483bd8449f40b9102ac7746da']
---

# Table of contents: one heading list with real levels

Status: executed; its six follow-ups wait as suggested tasks
Topic: toc
Playbook: plan

**Pursue.** The TOC has the right owner, and its read is wrong in four small ways. `BaseTocPlugin` keeps the `toc` void block, its Markdown tag and `read.headings()`, and copied UI keeps click scrolling and the arrival flash, as the 2026-09-07 extraction settled. Each entry renames the heading's `level` to `depth` and carries a `type` that no consumer draws. Copied `toc.tsx` and `toc-static.tsx` cast `depth` to `1 | 2 | 3`, so headings at levels 4 to 6 lose their indent. The package's Word TOC writes every entry flush left, while the copied `TocElementDocx` that indents three levels has no caller. And `queryHeading` keeps a function in plugin state that does what every plugin's read already allows. A probe that replaces `read` through `.extend()` changes the list for the extended handle and for `editor.plugin(BaseTocPlugin)` alike. The [2026-10-04 audit](../research/review-records/2026-10-04-toc-audit.json) reached the same target, and no plan adopted it. Deleting the plugin loses, because static and Word output need a package owner for the block. Moving the outline onto the heading plugin loses, because only the TOC reads it. `review-ledger.mjs next` returned `styles`, which another session is already working on, so this review took `toc`, the next open scope. Its prerequisite scope, `reads`, is closed by the [2026-10-05 reads review](2026-10-05-reads-review.md).

The plan below continues the verdict in this file. Architect's three runners and a cross-judge picked its target, the plan panel's first round cut its block cache and its Word drawing of Details titles, its second round cut its Word link rule, and the Build playbook executes it.

## Brief

### What will change?

The table of contents now indents all six heading levels in the editor, the static view and Word. Each entry carries the heading's level, and the unused depth and node type are gone. Apps that want fewer headings filter the plugin's own heading finder. The tests, a hand drive of every page that shows a TOC and a three-model review of the diff back this. Six follow-ups wait as suggested tasks, such as Word links that point nowhere and a list that rebuilds on every edit.

### What could go wrong?

Apps that read an entry's depth or type must update, and the changeset says how. An app still setting the old heading-list function compiles, and its table of contents shows the default headings, or nothing without a heading plugin. No release shipped that setting. Nobody opened the exported file in Word, because the check read its XML. The HTML export page's style sheet was rebuilt by hand, and nothing keeps it fresh yet.

## Teach

A table of contents in Plate is a block with no text of its own. It draws one link per heading in the document, and clicking a link scrolls to that heading.

The TOC plugin walks the whole document on each edit and asks the heading plugin for each heading's level. Before this change, entries called the level a depth and carried a node type that nothing drew. The copied components indented only three levels, and Word indented none. Apps swapped the list through a function kept in plugin state.

Now entries carry the level, and all six levels indent everywhere. Apps that want fewer headings override the plugin's read and filter its exported heading finder.

## Public API

To list fewer headings, override the plugin's read and filter the exported finder, instead of setting a function in plugin state. The finder is the plugin's own walk, so an override filters it instead of copying it.

```ts before
// packages/platejs/src/features/toc/lib/BaseTocPlugin.spec.ts
BaseTocPlugin.configure({ initialState: { queryHeading } });
```

```ts after
// content/docs/(plugins)/(elements)/toc.mdx
export const AppTocPlugin = BaseTocPlugin.extend({
  read: ({ editor, state }) => ({
    headings: () =>
      readTocHeadings({ editor, state }).filter((heading) => heading.level <= 3),
  }),
});
```

One app plugin, kept in a module that imports only `platejs/toc`, serves the live kit in the client `toc` file, the static kit in `toc-static` and Word export, because the copied live TOC's `TocPlugin` handle still finds a converted plugin.

```tsx before
```

```tsx after
// content/docs/(plugins)/(elements)/toc.mdx
export const TocKit = [
  toReactPlugin(AppTocPlugin).configure({ component: TocElement }),
];
export const BaseTocKit = [
  AppTocPlugin.configure({ component: TocElementStatic }),
];
```

The copied TOC indents by the heading's own level, all six of them.

```tsx before
// apps/www/src/registry/components/editor/toc.tsx
className={headingItemVariants({
  depth: item.depth as 1 | 2 | 3,
})}
```

```tsx after
// apps/www/src/registry/components/editor/toc.tsx
className={headingItemVariants({
  level: item.level,
})}
```

An entry carries the heading's key, level and text.

```ts before
// packages/platejs/src/features/toc/lib/BaseTocPlugin.ts
export type Heading = {
  depth: number;
  key: NodeKey;
  title: string;
  type: string;
};

export type TocPluginState = {
  queryHeading: ((state: EditorStateView) => Heading[]) | null;
};
```

```ts after
// packages/platejs/src/features/toc/lib/BaseTocPlugin.ts
export type Heading = {
  key: NodeKey;
  level: HeadingLevel;
  title: string;
};

export const readTocHeadings: (
  context: Readonly<{ editor: Editor; state: EditorStateView }>
) => Heading[];
```

## What other editors do

Read at Lexical `dd5c41b131`, Tiptap `91c51be53c`, ProseMirror `c7f2f1d7bd`, CKEditor 5 `14e73cc31b` and Slate `945a484df2`, source only, nothing run. Lexical keeps its list current through mutation listeners, and Tiptap rewalks on each transaction, as Plate keeps doing.

| Delta | Editor | Where the list comes from | Heading identity | How the list updates | Level field |
| --- | --- | --- | --- | --- | --- |
| changed | Plate | Plugin read over the document, headings and leveled Details titles, through an exported finder an override can filter | Editor-scoped `NodeKey`, never saved | Rebuilt on each document change while a TOC renders | `level` |

## Layer and owner

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| Heading finder and entry shape | Plate | `platejs/toc` | The TOC plugin owns heading discovery, and an override filters its exported walk. |
| Word TOC indent | Plate | `platejs/docx/export` | Word export owns its margins. The converter sets a paragraph's left `w:ind` only from `margin-left`. |
| Six-level indent and the field compare | Plate copied UI | registry `toc` and `toc-static` | Copied UI owns every visual choice. |

## Hard cuts and app migration

The cut deletes `TocPluginState`, the `queryHeading` plugin state, the entry's `depth` and `type`, and the copied `TocElementDocx` and `DOCX_DEPTH_INDENT`. The `Heading` type keeps its name and gains `level`. No stored document changes, because nothing saves an entry. An app that still passes `initialState: { queryHeading }` keeps compiling, because a plugin that declares no state accepts any state object. Its TOC then shows the default list. An app that installs no heading plugin and listed its own nodes through `queryHeading` gets an empty TOC. No published release shipped that setting. The census below is a `git grep` over packages, apps, content, changesets, generated output and subject files at `b54221655a`, and the probes ran each changed path.

| Caller | Breaks on | Change |
| --- | --- | --- |
| `packages/platejs/src/features/toc/lib/BaseTocPlugin.spec.ts` | `queryHeading` cases at lines 31 and 264 to 304, `depth` and `type` fixtures | Delete the `queryHeading` cases, move fixtures to `level`, add the cases in step 1 |
| `packages/platejs/src/docx/export/lib/docxStaticComponents.tsx` | `depth` through `Heading` | Indent each row by `level`; links stay as today |
| `packages/platejs/src/static/components/PlateStatic.reuse-oracle.spec.tsx:123` | `depth` | `level` |
| Copied `toc.tsx` | the `depth` cast and the four-field compare | six-row `level` table, compare `key`, `level` and `title` |
| Copied `toc-static.tsx` | the `depth` cast and the dead Word TOC | six-row `level` table, delete `TocElementDocx` and `DOCX_DEPTH_INDENT`, inline `getHeadingList` into `TocElementStatic` |
| Copied `toc.spec.tsx` | `{ depth, key, title, type }` fixtures | `{ key, level, title }` |
| `apps/www/src/registry/examples/values/toc-value.tsx` and its `cn` twin | headings at levels 1 to 3 only | add headings at levels 4 to 6 |
| `content/docs/(plugins)/(elements)/toc.mdx` and `toc.cn.mdx` | the `queryHeading` API item | the read override and the finder |
| `apps/www/api-reference.config.json:1120` and the generated manifest | `TocPluginState` in the `./toc` exclude list | drop it, and route `Heading` and `readTocHeadings` to `/docs/toc` through `include` |
| `apps/www/public/r/toc.json`, `toc-static.json`, `toc-docs.json`, `html-export.json`, `registry.json` and `registry-docs.json` | generated copies of the old code, docs and demo value | regenerate |
| `.changeset/toc-v54-runtime.md` | no v53 migration for `options.queryHeading`, `depth` and `type`; line 11's insert form; line 13's active-heading wording | add the migration, fix both lines |
| `.changeset/toc-heading-levels.md:5` and `semantic-details.md:7` | "depth" | cut the first line, rewrite the second as "level" |
| `docs/plans/topics/correct.md:108` and its rendered `docs/plans/topics/artifacts/correct.html` | open work that names `TocElementDocx` | close the `TocElementDocx` half and keep `HeadingElementDocx` |
| `docs/plans/topics/toc.md` | the Pursue's Open work line, and line 46's claim that each Word TOC row links to its heading's bookmark | replace both at the fold |

The v1 `templates/plate-playground-template` copy is never edited here. `apps/www/src/components/docs-toc.tsx` reads its own `item.depth` for the docs site's page outline and is not the Plate TOC. `apps/www/src/generated/release-index.json` names `depth` only in a v1 release note, which no change here touches. Decision logs, review records and other plans keep the old names as history.

An app's copied live TOC changes its compare as well as its classes, from `depth` and `type` to `level`.

```tsx
// apps/www/src/registry/components/editor/toc.tsx, before
equalityFn: (previous, next) =>
  previous !== null &&
  previous.length === next.length &&
  previous.every((heading, index) => {
    const nextHeading = next[index];

    return (
      heading.key === nextHeading?.key &&
      heading.depth === nextHeading.depth &&
      heading.title === nextHeading.title &&
      heading.type === nextHeading.type
    );
  }),
```

```tsx
// apps/www/src/registry/components/editor/toc.tsx, after
equalityFn: (previous, next) =>
  previous !== null &&
  previous.length === next.length &&
  previous.every((heading, index) => {
    const nextHeading = next[index];

    return (
      heading.key === nextHeading?.key &&
      heading.level === nextHeading.level &&
      heading.title === nextHeading.title
    );
  }),
```

## Main changes

- The package Word TOC indents each row by `(level - 1) × 24px` through `margin-left`, 360 twips per level, the step the indent plugin uses. Each row keeps today's link.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Custom heading lists | Override the plugin's read and filter its exported heading finder; the plugin-state function goes (look) | Keep the plugin-state function | keep query | big |
| Keeping the list current | Rebuild the list on each edit, as today (look) | Reread only changed blocks, and require a heading's level to depend on that heading alone | block cache | small |
| Entry fields | The heading's key, level and text; depth and type go (look) | Keep depth and type | keep depth | small |
| Entry type name | Keep the name Heading | Rename it to TOC entry | toc entry | detail |
| Deep headings | Every one of the six levels gets its own indent, in the editor, static view and Word | Indent only three levels and cap deeper ones | cap indent | small |
| Word export's TOC | The package's Word TOC indents by level, and the unused copied Word TOC goes | Keep the flat Word TOC | flat word | small |
| Links in the Word TOC | Every row keeps today's link, including the dead ones to Details titles and to headings inside quotes (look) | Make Word export write an internal link only when it writes that link's bookmark | word links | small |
| Old heading-list setting | An app that still sets it compiles and gets the default list, or an empty one without a heading plugin, because no release shipped it (answer) | Make a plugin that declares no state reject any state object, a plugin-system change | reject state | small |
| React test | One case in the plugin system's React spec shows an extended app plugin, converted for React, answering through the stock TOC plugin handle | Add a React TOC test partition with its own spec | react spec | detail |
| Copied indent | Each copied TOC file keeps its own six-step indent table | One shared row component both copied files import | shared row | detail |
| Next step | Plan and build now, as a Pursue continues | Hold at the plan | hold | detail |

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Heading entry | `Heading { depth: number, key, title, type }` | `Heading { key, level: HeadingLevel, title }` | `BaseTocPlugin.ts` | The heading plugin already names and types the level, and no consumer draws `type` | Copied UI, `TocDocx`, specs, docs, changeset | Step 1 six-level case; spec typecheck through `tsconfig.test.json`; www typecheck with no cast | An app reading `depth` or `type` fails to compile | rename |
| Custom heading list | `initialState.queryHeading(state)` | `.extend({ read })`, filtering the exported `readTocHeadings({ editor, state })` | `BaseTocPlugin.ts` | One way to change the list; calling the earlier read recurses, so only an exported finder lets an override filter | toc.mdx and its twin, changeset, API reference | Step 1 override cases; step 2 export case; `react-extend-probe-a1.log` | An app built from unreleased `next` that sets `queryHeading` still compiles and gets the default list, or an empty one without a heading plugin | cut |
| `TocPluginState` | Exported type with one function field | Deleted; the TOC keeps no state | `BaseTocPlugin.ts` | Nothing else lives there | API reference config and manifest | `pnpm brl`, `pnpm --filter www api-reference:check` | None outside this repository's tests and the v1 template | cut |
| Keeping the list current | Full walk of every element on each read | Unchanged | `readTocHeadings` | A heading-level override receives the whole document, and plugins can be swapped, so a cache keyed by block object can serve stale entries | none | Plan panel round 1 | 21 ms per read at 5,000 blocks on a loaded host stays | keep |
| Copied indents | Two three-row cva tables and a cast | Two six-row `level` tables typed by `HeadingLevel`, no cast | copied `toc.tsx`, `toc-static.tsx` | Levels 4 to 6 fall back to the level 1 inset | Registry build, registry changelog | Step 4 six-inset case; hand drive | none | rearchitect |
| Copied list equality | Compare of key, depth, title and type | Compare of key, level and title | copied `toc.tsx` | The entry's fields change | Registry build | www typecheck | none | rename |
| Word TOC | Flat `<p><a>` rows | Each row indented `(level - 1) × 24px` through `margin-left`, links unchanged | package `docxStaticComponents.tsx` | The converter sets a paragraph's left `w:ind` only from `margin-left` | none | Step 2 `w:ind` case | none | rearchitect |
| Copied Word TOC | `TocElementDocx` and `DOCX_DEPTH_INDENT`, no caller | Deleted; `getHeadingList`, which `TocElementStatic` still calls, is inlined | copied `toc-static.tsx` | Dead, and its `paddingLeft` never reached Word | Registry build | Step 4 `git grep` | none | cut |

## Steps

The owner's `/verdict next` on 2026-10-19 authorizes the build, because its Pursue continues into this plan and its build under Autopilot. One code delegate builds steps 1 to 4 in its own worktree from `b54221655a`, and the lead reviews its diff, then builds steps 5 to 10. The plan lands as one change through `land.mjs`. Each phase ends with a keep or fix-forward call on its own proof. Each new spec case below names the base failure or the planted defect that shows it can fail. Spec files are typechecked with `pnpm exec tsc -p packages/platejs/tsconfig.test.json --noEmit` from the root, compared with the same run at base, because the partition typechecks leave spec files out.

### Phase 1: package read and Word export

Exit: keep when steps 1 to 3 pass.

- [x] 1. In `BaseTocPlugin.ts`, change `Heading` to `{ key, level, title }`, add and export `readTocHeadings({ editor, state })` with today's walk over the supplied state, make the default `read.headings()` call it, and delete `TocPluginState`, `initialState` and `queryHeading`. Export `readTocHeadings` from `platejs/toc` and run `pnpm brl`. Proof: `pnpm --filter platejs test:partition:toc` and `typecheck:partition:toc` pass, and the spec typecheck adds no error. In `BaseTocPlugin.spec.ts`, six headings report `level` 1 to 6 with no `depth` or `type`, which `proof-worktree.mjs --expect-fail` shows failing at base. An app plugin, `BaseTocPlugin.extend({ read })` filtering `readTocHeadings` to levels 1 to 3, returns only those through `editor.plugin(BaseTocPlugin)`. `readTocHeadings({ editor, state })`, called with the live editor and the state of a `createEditorView` document that holds other headings, returns the view's headings; a planted finder that walks `editor.read` instead of `state` fails it. A view's own plugin read cannot show that defect, because it hands the view to the read as its `editor`. In `packages/platejs/src/react/plugin/toReactPlugin.spec.ts`, which `test:partition:react-core` runs, an editor that installs `toReactPlugin(Base.extend({ read }))` returns the replaced read through a separate `toReactPlugin(Base)` handle and through `Base`, the lookup the copied live TOC relies on; a planted resolution that treats the two lifts as unrelated plugins fails it.
- [x] 2. In `docxStaticComponents.tsx`, indent each `TocDocx` row by `marginLeft: (level - 1) * 24px`, and keep each row's link as today. Proof: `pnpm --filter platejs test:partition:docx-export` passes, and the spec typecheck adds no error, with two `exportDocx.spec.ts` cases. Six TOC rows carry `w:ind` left values 0, 360, 720, 1080, 1440 and 1800, which fails at base per `docx-toc-probe-base-a4.log` and `--expect-fail`. Exporting an editor that installs the app plugin from step 1 writes only the rows for levels 1 to 3; a planted `TocDocx` that calls `readTocHeadings` instead of `read.headings()` fails it. When the spec's new imports change the generated task graph, run `pnpm entrypoint:turbo:generate`, keep its output, and confirm `pnpm check entrypoint-graph` passes.
- [x] 3. In `PlateStatic.reuse-oracle.spec.tsx:123`, read `level` in place of `depth`. Proof: the spec typecheck reports that line once step 1 lands and before this edit, as `spike-depth-typecheck-a1.log` shows at base with `depth` renamed, and reports no error after it; `pnpm --filter platejs test:partition:static` passes.

### Phase 2: copied UI and docs sources

Exit: keep when steps 4 to 7 pass. The copied files read phase 1's entry shape, so a failure here is fixed forward, never reverted alone.

- [x] 4. In copied `toc.tsx`, replace the `depth` variants with a six-row `level` table, `pl-0.5`, `pl-[26px]`, `pl-[50px]`, `pl-[74px]`, `pl-[98px]` and `pl-[122px]`, drop the cast, and compare `key`, `level` and `title`. In `toc-static.tsx`, use the same six-row table, delete `TocElementDocx` and `DOCX_DEPTH_INDENT`, and inline `getHeadingList` into `TocElementStatic`. Move `toc.spec.tsx` fixtures to `{ key, level, title }`. Add headings at levels 4, 5 and 6 to `toc-value.tsx` and its `cn` twin. Proof: `toc.spec.tsx` gains one case for `TocElement` and one for `TocElementStatic`, each rendering levels 1 to 6 with six distinct insets. Each fails at base, where the copied TOC still reads `depth`, and under a planted three-row table that leaves levels 4 to 6 with one shared class, per `planted-inset-live-a1.log` and `planted-inset-static-a1.log`. `git grep` finds no `TocElementDocx` or `DOCX_DEPTH_INDENT` in live source.
- [x] 5. Run `plate-docs` on `content/docs/(plugins)/(elements)/toc.mdx`: drop the `queryHeading` API item, document the `Heading` shape, `readTocHeadings`, the one-plugin override for both kits and that renderers call `read.headings()` so an override reaches them, audit example coverage, and carry every change to `toc.cn.mdx`. Proof: the docs checks `plate-docs` names, and a type probe in the run directory that compiles the page's kit snippet, `toReactPlugin(AppTocPlugin).configure({ component: TocElement })`, against copied `TocElement`.
- [x] 6. In `apps/www/api-reference.config.json`, drop `TocPluginState` from the `./toc` exclude list and route `Heading` and `readTocHeadings` to `/docs/toc` through `include`. Then run `pnpm plite:packages:build` in this worktree, so each package's `dist` matches the candidate source, and regenerate the manifest with `pnpm --filter www api-reference`. Proof: `pnpm --filter www api-reference:check` passes, and the manifest gives `readTocHeadings` the route `/docs/toc`.
- [x] 7. Run `pnpm --filter www build:registry` after steps 4 to 6 and keep its generated output. Proof: the registry freshness check passes, `git grep` finds no `queryHeading`, `TocElementDocx` or `item.depth` under `apps/www/public/r`, and `pnpm --filter www typecheck` passes with no cast.

### Phase 3: drive, release and teaching

Exit: keep when steps 8 to 10 pass.

- [x] 8. Hand drive the TOC as `verify`'s hand drive reference says, with the cells `node tooling/scripts/hand-drive.mjs scope` lists for the changed files, `/docs/toc` and `/cn/docs/toc` included. Click a level 4 entry and confirm the scroll and the flash. Proof: `hand-drive.mjs check` passes, and each cell's screenshot, read by the lead, shows each level at its own inset and the docs pages' parsed heading, body and loaded demo.
- [x] 9. Add the v53 to v54 TOC migration to `.changeset/toc-v54-runtime.md`: `options.queryHeading` becomes a `.extend({ read })` override, which may return any list or filter `readTocHeadings`; the entry's `id` becomes `key`, its `path` and `type` go, and its `depth` becomes `level`. Fix its line 11 to `editor.plugin(BaseTocPlugin).update.insert()` and line 13 to the copied `toc` component without active-heading observation. Cut the first line of `toc-heading-levels.md`, rewrite `semantic-details.md` line 7's "depth" as "level", and add a registry changelog entry for `toc` and `toc-static`, as `changeset` says. No changeset names `TocPluginState`, which no release shipped. Proof: the `changeset` skill's checks, and `git grep -n -w -E 'depth|TocPluginState' .changeset/toc-heading-levels.md .changeset/semantic-details.md .changeset/toc-v54-runtime.md` finds only the migration line.
- [x] 10. Run `best-api repair` on the custom-list rule. The rule's owner is `docs/plans/topics/toc.md`, and the repair fixes every skill, rule or doc that still teaches `queryHeading` or an entry's `depth`. Close the `TocElementDocx` half of `docs/plans/topics/correct.md:108` and render its page again. Proof: `git grep` for `queryHeading`, `TocPluginState`, `TocElementDocx` and `DOCX_DEPTH_INDENT` over live source, docs, skills and open plans, and for `item.depth` under `apps/www/src/registry`, finds only the v1 template and history; `PLATE_BASELINE_BASE=b54221655ac2e3c624b103c9d98f76e85911fc34 pnpm check removed-api-teaching` passes before the commit; and `node .agents/rules/plate-next/scripts/sync-resources.mjs --check` passes.

## Completion gates

| Gate | Applies | Proof |
| --- | --- | --- |
| Package specs for `toc`, `docx-export`, `static` and `react-core` | yes | Steps 1 to 3 logs |
| Spec typecheck through `tsconfig.test.json`, compared with base | yes | Steps 1 to 3 logs |
| Benchmark probe | no: the read keeps today's walk, and the Word TOC adds only a style per row | none |
| `pnpm brl` | yes, `platejs/toc` exports change | its log |
| Copied UI spec, API reference and registry build | yes | Steps 4, 6 and 7 |
| Hand drive | yes | Step 8 |
| Panel on the diff | yes, reviews row `api-build` | the panel's `seats` rows |
| `land.mjs --check 'pnpm check --affected'` | yes | its log |

## Claims

The verdict above said the list keeps rebuilding on every edit and that a custom list must replace the walk instead of filtering the default list. The first still holds: the plan panel showed a block cache can serve stale entries, so the read keeps today's walk. The plan reverses the second, because the exported finder lets an override filter. The verdict also said only that overriding the read changes the list everywhere; the React probe now shows a converted app plugin reaches the copied live TOC's handle too. The page published after round 1 said Word would stop writing dead links to Details titles. Round 2 cut that change, so Word keeps today's links. It also said an app that still sets `queryHeading` fails to compile; it compiles and gets the default list, or an empty one without a heading plugin.

## Evidence

Model: claude-opus-5-5 at xhigh effort, read from this session's metadata.

Prior work. `node tooling/scripts/review-ledger.mjs lookup toc` names the [2026-10-04 audit](../research/review-records/2026-10-04-toc-audit.json) as the head, a Pursue that no plan adopted. It is stale because `toc.tsx`, `BaseTocPlugin.spec.ts` and `packages/platejs/src/features/toc/` changed since, and `VISION.md` and `docs/vision/common.md` moved. Its plans are the [2026-09-07 extraction audit](2026-09-07-full-plate-ui-extraction-audit.md), complete, the [2026-08-29 click scroll regression](2026-08-29-toc-click-scroll-regression.md) and the [2026-07-13 package reviews](2026-07-13-plate-next-tag-toc-toggle-package-reviews.md), both historical. A search of `docs/plans` for `toc`, `queryHeading` and `active heading` found no other plan on this read. The search covered tracked plans in this checkout, not other sessions' uncommitted work.

### Requirements

- A TOC block is a void `toc` element with a Markdown tag. Inserting one goes through the standard element update, and `BaseTocPlugin.spec.ts` proves the inserted shape as `EDIT-TOC-INSERT-001`.
- Heading levels come from the installed `BaseHeadingPlugin`'s `read.level`, which also gives leveled Details titles a level ([BaseHeadingPlugins.ts](../../packages/platejs/src/features/basic-nodes/lib/BaseHeadingPlugins.ts)). A same-name foreign plugin never counts, as the 2026-10-04 audit required.
- Live identity is the editor-scoped `NodeKey`, and no document saves a runtime key. Word export turns a heading's key into a bookmark name inside the exported file. A row whose key names no bookmark, such as a Details title's, still writes the raw key as its link target, which Open work tracks.
- `read.headings()` is a pure read over supplied state, so the live, static and Word renderers of one document read one list.
- Copied UI owns scrolling, opening a closed Details that holds the heading, the arrival flash and every visual choice. The owner removed the active-heading highlight in `ada2fa7601` on 2026-10-15, and [current-evidence.md](../editor-behavior/current-evidence.md) records that the copied TOC keeps no current-heading state.
- Every public configuration path needs a distinct user job, and next is a redesign with hard cuts over compatibility ([VISION.md](../../VISION.md), [plate.md](../vision/plate.md)).

### Probes

Each probe runs from `packages/platejs` with Bun and the source aliases, at `b54221655a`, and logs to the run directory. The decision log cites each log.

- Replacing `read` through `.extend()` with a walk that keeps levels 1 to 3 returns only the level 1 heading, through both `editor.plugin(ShallowToc)` and `editor.plugin(BaseTocPlugin)`.
- A replacement that calls the earlier read, from its context or from the stage factory, recurses until the stack overflows, because the context's `read` is the final read. So only an exported finder lets an override filter the default list.
- `toReactPlugin(BaseTocPlugin.extend({ read }))`, `TocPlugin.extend({ read })` and `BaseTocPlugin.extend({ read })` each return the replaced list through `BaseTocPlugin`, `TocPlugin` and the app's own handles.
- Word export at base writes every TOC row with left indent 0, and the link to a leveled Details title carries the runtime key `r0:n36`, which no bookmark names.
- The copied TOC's three-row table gives levels 4 to 6 only the base class, whose inset equals level 1's.
- At base, Word export bookmarks headings at the top level, in a column, in a table cell and in a Details body, and their TOC links resolve. A leveled Details title's link names no bookmark, and an empty heading gets a bookmark with no row.
- A plugin that declares no state accepts `configure({ initialState: { queryHeading } })` with no type error, while the same call on a plugin that declares state fails with TS2353.
- Renaming the entry's `depth` at base makes `tsconfig.test.json` report `PlateStatic.reuse-oracle.spec.tsx:123`, while the static partition typecheck leaves spec files out.

### Lanes

1. **Keep the current design. Loses.** Deep headings lose their indent in every renderer, the Word TOC is flat, entries carry a field nobody draws under a name the heading plugin does not use, and docs teach a second way to do what `.extend()` already does.
2. **Strongest deletion: delete `BaseTocPlugin` and let copied UI walk headings itself. Loses.** The `toc` node needs a schema, a Markdown tag and an insert update in the package, and Word export renders the TOC from the package without copied UI.
3. **Move the outline read onto `BaseHeadingPlugin`. Loses.** Only TOC renderers read the outline, so the heading plugin would carry a read for one consumer.
4. **Keep the owner, fix the read: level without type, no `queryHeading`, six indents everywhere. Wins.** Predicted benefit: deep headings indent in all three renderers, and the public surface loses one state type and one option. The plan's Close marks it held or falsified.
5. **Keep the list current incrementally. Loses for now, tracked in Open work.** Lexical keeps an index through mutation listeners, which Plate would have to keep in sync by hand. A cache from each top-level block object to its entries needs no listener, and a prototype matched a full walk through 11 edit, undo, transaction and view steps, at 0.006 to 0.032 of base time on a host too loaded for a conclusive result. The plan panel then showed the premise fails. The heading plugin's level read is an override point that receives the whole document, so an override that skips the first block goes stale when another heading moves before it, and swapping the heading plugin changes levels without changing any block. A cache needs a rule that a heading's level depends on that heading alone, and no such rule exists. The full walk measured 21 ms per read at 5,000 blocks and 275 ms at 50,000 on that loaded host.
6. **The rule is wrong. Not a lane.** No rule blocks the target.
7. **Let an override call the earlier stage's read. Not here, tracked in Open work.** It would let any plugin's read be filtered without an exported walk, but it changes how `.extend()` composes reads for every plugin, which is the plugin system's call, not the TOC's.

Architect. Three runners, Opus, Astra and Sol, designed the target from one grounding, and an Opus cross-judge checked their file and line claims. It scored Astra's exported finder with one copied row owner 19, Opus's `maxLevel` option with a block cache 17 and Sol's finder without a cache 15. The plan took Astra's base and put Opus's cache inside the finder. It kept one six-row table in each copied file instead of Astra's shared row, because a cross-file import between the live and static TOC would make every app that installs one copy the other. It takes Sol's extra inventory rows and leaves the plans Sol listed as history.

Plan review. Round 1 seated Opus, Astra and Sol at xhigh. All three found that the block cache can serve stale entries, and that a package Word drawing of Details titles would replace the app's own drawing, where a title of two text runs could split into two Word paragraphs. The plan cut both, so the target is now Sol's uncached finder with Astra's six-level work. The seats also found that an identity compare would rerender the copied TOC more often than today, that phase 2 could not be reverted alone, that the census missed open work and generated files, and that the `TocEntry` rename stopped halfway. The plan applied each.

Round 2 seated the same three. All three found that step 3's typecheck leaves spec files out, so the plan now typechecks specs through `tsconfig.test.json`. Astra and Sol found, and Opus agreed as a warning, that a key that names a heading block says nothing about whether Word writes its bookmark. An app's own Details title drawing can carry a working bookmark the rule would drop, and a heading inside a quote is registered as a bookmark but never written. The plan cut the rule, and Word keeps today's links. All three found that the new React spec had no test command; the plan dropped it, because `toReactPlugin.spec.ts` and `pluginReference.spec.ts` already cover extended plugins reaching their handles. Astra found that an app's old `queryHeading` setting still compiles once the plugin declares no state. The plan keeps the cut, because no published release shipped that setting, and corrects its risk. In answer to the warnings, the plan moves the docs and API reference edits before the registry build, puts the v53 migration in the v54 changeset, adds deep headings to the demo, routes the new export to `/docs/toc` and fixes the census.

Round 3 seated the same three, the last round the cap allows. Astra and Sol found, and Opus agreed as a warning, that the view case could not fail. A view hands itself to a plugin read as its `editor`, so a finder that ignores `state` still reads the view. Step 1 now calls `readTocHeadings` directly with the live editor and a view's state. Opus found that round 2's cited specs never call an extended read through a separately converted handle, the lookup the docs teach, so step 1 adds that case to `toReactPlugin.spec.ts`. All three found that step 6's isolated worktree would build base source and that step 7 needs built packages; both steps now run in this worktree after `pnpm plite:packages:build`. Astra found that an app's old `queryHeading` setting can leave its TOC empty, which is worse than the unfiltered list round 2 assumed. The plan keeps the cut, rates that pick `answer` and says so in the risk. The plan also fixed the statements the link cut left false, completed the v53 migration and added the demo value's generated export to the census. Opus's one-branch converter fix for dead links goes to Open work, because it changes every internal link in an export.

Proof limits at plan time: no browser drive ran, and Word output was read as `document.xml`, not opened in Word. The Close gives the build's limits.

### Dependents

- `documents`: [docxStaticComponents.tsx](../../packages/platejs/src/docx/export/lib/docxStaticComponents.tsx) reads `read.headings()` for the Word TOC. Affected: it switches to `level` and gains the indent.
- `react`: [TocPlugin.tsx](../../packages/platejs/src/react/features/toc/TocPlugin.tsx) wraps `BaseTocPlugin` with `toReactPlugin`. Unaffected, because it adds no read or state.
- `persistence`: [migratePlateV54BuiltIns.internal.ts](../../packages/platejs/src/migrations/migratePlateV54BuiltIns.internal.ts) maps the old `toc` key to `BaseTocPlugin`. Unaffected, because the node shape does not change.
- `ui`: [plugins.ts](../../apps/www/src/registry/components/editor/plugins.ts) and [plugins-static.ts](../../apps/www/src/registry/components/editor/plugins-static.ts) install the TOC kits. Unaffected, because the kits keep their names. `fixed-toolbar.tsx` imports only the shared plugin keys.
- `distribution` and `editing`: `markdownParagraph.ts`, `utils/index.ts`, `ExitBreakPlugin.ts`, `SingleBlockPlugin.ts` and [SingleLinePlugin.ts](../../packages/platejs/src/utils/plugins/SingleLinePlugin.ts) import `PLUGINS` from `plate-keys.ts`, a member of this scope. Unaffected, because the `toc` key stays.

### History

- This review supersedes 2026-10-04-toc-audit, the [2026-10-04 audit](../research/review-records/2026-10-04-toc-audit.json), because part of its target landed and its requirements moved. `read.headings()` now reads levels through `editor.plugin(BaseHeadingPlugin)`, so its foreign-plugin defect is gone, and the owner removed its active-heading highlight on 2026-10-15.
- The [2026-09-07 extraction audit](2026-09-07-full-plate-ui-extraction-audit.md) and its 2026-09-18 execution are retained. They moved scrolling and the flash into copied UI, and this review keeps that split.
- The [2026-08-29 click scroll regression](2026-08-29-toc-click-scroll-regression.md) and the [2026-07-13 package reviews](2026-07-13-plate-next-tag-toc-toggle-package-reviews.md) are retained as history. This review reopens none of their questions.

### Upstream checkouts

Read from source only: Lexical `dd5c41b131`, Tiptap `91c51be53c`, ProseMirror `c7f2f1d7bd`, Slate `945a484df2` and CKEditor 5 `14e73cc31b`. The subject file's What other editors do table holds what each does.

## Close

Reversals and deviations come first.

- The diff panel's one round found no critical finding, so no second round ran. The build applied its five warnings and four nits, except two it deferred. A finder that takes only `state` went to suggested task t_62dcb29c, and premise 6 waited for this fold.
- Step 4's base runs fail on the renamed `depth` field before they reach an inset. A planted three-row table is the control that shows each six-inset case can fail.
- Two cases differ from their step in setup only. The direct finder case takes the view's state out of `view.read` before it calls `readTocHeadings` with the live editor. The base runs of the six-level and Word indent cases drop `readTocHeadings` from the spec import, so they fail on the asserted values, not on the import.
- The docs put the app plugin in a module that imports only `platejs/toc`, apart from the live and static kits, so the server-rendered static kit can import it.
- Beyond the ask, `pnpm --filter www build:tw` rebuilt `apps/www/public/tailwind.css`, so the HTML export page keeps the inset of levels 4 to 6. The rebuild also adds the classes www gained since its last build on 2026-09-23. Suggested task t_20ac8bbb keeps that file fresh.
- The first www typecheck after the hand drive failed, because the drive server had emptied `apps/www/.source`. The rerun with the server stopped passed.

What landed:

- In `platejs/toc`, `Heading` is `{ key, level, title }`. `readTocHeadings({ editor, state })` is exported, and the default `read.headings()` calls it. `TocPluginState`, the plugin's `initialState` and `queryHeading` are gone.
- Word export's `TocDocx` indents each row by `(level - 1) × 24px` through `margin-left`, 360 twips per level, and keeps each row's link.
- Copied `toc.tsx` and `toc-static.tsx` indent six levels from a `level` table with no cast, and the live TOC compares `key`, `level` and `title`. `TocElementDocx` and `DOCX_DEPTH_INDENT` are gone, and `getHeadingList` is inlined into `TocElementStatic`. The demo values hold headings at levels 4 to 6.
- `toc.mdx` and `toc.cn.mdx` teach the read override, `readTocHeadings` and the `Heading` shape. The API reference routes both to `/docs/toc`, the registry output is regenerated, the v54 changeset carries the v53 migration, and a registry changelog entry covers `toc` and `toc-static`.
- `docs/plans/topics/toc.md` holds the folded state, and `docs/plans/topics/correct.md` no longer lists `TocElementDocx` as dead code.

Proof, by each decision row's scope:

- On the final bytes, `test:partition:toc` passes 15 cases, `docx-export` 204, `static` 80 and `react-core` 342, and the copied `toc.spec.tsx` passes 5 (`final-toc-a1.log`, `final-docx-a1.log`, `final-static-a1.log`, `final-react-core-a1.log`, `final-www-spec-a1.log`).
- Each new case fails at base or under its planted defect. That covers the six-level read, the Word `w:ind` values 0 to 1800, the app override in Word export, the direct finder call against a planted `editor.read` walk, the React handle lookup, and both six-inset cases under a three-row table (`planted-inset-live-a1.log`, `planted-inset-static-a1.log`).
- The spec typecheck through `tsconfig.test.json` reports 247 errors at base and on the build, with no new error in a touched file.
- `api-reference:check`, `build:registry --check`, the UI changelog check, `check:docs`, `pnpm --filter www typecheck`, `removed-api-teaching` against `b54221655a` and `sync-resources --check` pass, and `pnpm lint:task` reports 0 warnings on 11 files (`www-typecheck-a4.log`, `check-docs-a3.log`, `removed-api-teaching-a2.log`, `sync-resources-check-a1.log`, `lint-task-a1.log`).
- The hand drive covers 74 of 74 cells on a dev server that served this worktree's source (`hand-drive-check-a1.log`). Every TOC preview indents levels 1 to 6 at 2, 26, 50, 74, 98 and 122 px. Clicking a level 4 entry on `/docs/toc` scrolls its heading to its 80 px scroll margin and flashes it for 1600 ms. Both docs pages render the changed sections as written, and the HTML export frame resolves the six classes.
- Limits: nobody opened the exported file in Word, because the spec reads `document.xml`. The drive ran in the in-app browser at desktop width in the light theme. `land.mjs` runs `pnpm check --affected` with this commit.

The predicted benefit in Lane 4 held. Deep headings indent in all three renderers, and the public surface lost one state type and one option.

Counts: of the 18 items, the 10 steps and 8 completion gates, 16 are done, 1 is skipped (the benchmark probe, which does not apply) and 1, the `land.mjs` check, runs with this commit. None are partial, blocked or open. The plan's open work moved to the subject file, each item with its owner and stop.

The review read these inputs at `review_commit`: `VISION.md`, `docs/vision/common.md`, `docs/vision/plate.md`, `packages/platejs/src/features/toc/lib/BaseTocPlugin.ts`, `packages/platejs/src/features/toc/lib/BaseTocPlugin.spec.ts`, `packages/platejs/src/features/basic-nodes/lib/BaseHeadingPlugins.ts`, `packages/platejs/src/features/details/lib/BaseDetailsPlugin.ts`, `packages/platejs/src/docx/export/lib/docxStaticComponents.tsx`, `packages/platejs/src/docx/export/lib/exportDocx.spec.ts`, `packages/platejs/src/docx/export/lib/internal/render-document-file.ts`, `packages/platejs/src/static/internal/staticPresentation.ts`, `packages/platejs/src/static/components/PlateStatic.reuse-oracle.spec.tsx`, `packages/platejs/src/react/features/toc/TocPlugin.tsx`, `packages/platejs/src/migrations/migratePlateV54BuiltIns.internal.ts`, `packages/platejs/src/utils/plugins/SingleLinePlugin.ts`, `tooling/entrypoints/entrypoint-dag.mjs`, `apps/www/src/registry/components/editor/toc.tsx`, `apps/www/src/registry/components/editor/toc-static.tsx`, `apps/www/src/registry/components/editor/toc.spec.tsx`, `apps/www/src/registry/components/editor/details-static.tsx`, `apps/www/src/registry/components/editor/insert-toolbar-button.tsx`, `apps/www/src/registry/components/editor/plugins.ts`, `apps/www/src/registry/components/editor/plugins-static.ts`, `apps/www/api-reference.config.json`, `content/docs/(plugins)/(elements)/toc.mdx`, `content/docs/(plugins)/(elements)/toc.cn.mdx`, `.changeset/toc-v54-runtime.md`, `.changeset/toc-heading-levels.md`, `.changeset/semantic-details.md` and `docs/editor-behavior/current-evidence.md`.

## Open work

- Word export registers a bookmark for a heading inside a quote but never writes it, and writes a link to a Details title that names no bookmark. The smallest fix is one branch at `xml-builder.ts:1809-1810`. When `getBookmark` misses, it would write the label without `w:hyperlink` instead of falling back to the raw key. That drops only links that cannot resolve and keeps an app-drawn Details title bookmark, but it changes every internal `#` link in an exported document, not only the TOC. owner: suggested task t_7ac4ead9. stop: none.
- The full walk measured 21 ms per read at 5,000 blocks on a loaded host. A quiet-host measurement, and a contract that a heading's level depends on that heading alone, would decide whether an incremental list earns its place. owner: suggested task t_c91e91d7. stop: none.
- Letting an override call the earlier stage's read, Lane 7, is a plugin-system change. owner: suggested task t_76b1739e. stop: none.
- A plugin that declares no state accepts any state object in `configure`. owner: suggested task t_d9d2239e. stop: none.
- `readTocHeadings` walks `state` but reads each level through `editor`'s heading plugin, so a level override that reads the document sees `editor`'s document. The docs say to pass the `editor` and `state` of one read, as every renderer does. A finder that takes only `state` needs a typed plugin read on a read's state, which the plugin system lacks. owner: suggested task t_62dcb29c. stop: none.
- Nothing rebuilds or checks `apps/www/public/tailwind.css`, which the HTML export page loads. owner: suggested task t_20ac8bbb. stop: none.
