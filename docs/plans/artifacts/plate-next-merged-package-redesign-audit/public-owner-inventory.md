# Merged Plate public owner inventory

Snapshot: `origin/next` at `494d90c495092d25941b6f57ca7ebf97b5db13dd`

Audit unit: every surviving workspace package and every public JavaScript
entrypoint declared by the merged entrypoint DAG. CSS and `package.json` exports
are counted separately from runtime entrypoints.

Coverage:

- workspace packages: expected 4, actual 4, missing 0, extra 0
- `platejs` public JavaScript entrypoints: expected 60 from `package.json`,
  actual 60 from the DAG, missing 0, extra 0
- runtime split: 30 headless, 1 SSR, 29 client
- private `platejs` DAG owners checked for reachability: 15
- `plitejs` public entrypoints: 9
- `@platejs/test` public entrypoints: 5

Commands:

```bash
find <origin-next-snapshot>/packages -mindepth 2 -maxdepth 2 -name package.json
jq '.exports' <origin-next-snapshot>/packages/platejs/package.json
node tooling/entrypoints/entrypoint-dag.mjs
```

## Workspace packages

| Package | Verdict | Reason | Next |
|---|---|---|---|
| `plitejs` | keep and absorb substrate owners | It is the editor/runtime owner. Yjs mapping, tab navigation, native block-drag mechanics, and generic range-overlay geometry currently leak upward into Plate. | Add only the smallest missing substrate APIs required by the ranked cuts. |
| `platejs` | keep as the sole editor distribution | Consolidation is correct. The remaining problem is feature ownership inside its 60 entrypoints, not npm package count. | Delete or rewrite wrong owners; do not recreate packages. |
| `@platejs/test` | keep separate | Test builders, browser proof, Playwright, and conformance contracts are tooling, not runtime editor API. | No major redesign. |
| `@platejs/cli` | keep separate | It is an executable/build-time tool with its own dependency and release job. | No major redesign. |

## `platejs` public entrypoints

Drift is architectural pressure from 0 (current owner is sound) to 5 (hard cut
or owner move required). `keep` does not claim file-level perfection; it means
no major Plite-era redesign should pre-empt the ranked work.

| Entrypoint | Runtime | Drift | Verdict | Evidence / reason | Next |
|---|---:|---:|---|---|---|
| `platejs` | headless | 0 | keep | Correct root for standard nodes, styles, code block, indent, link, list, and the Plate editor API. | Do not expand it with optional product features. |
| `platejs/react` | client | 0 | keep | Correct React root and proxy for the standard root feature renderers. | Keep root free of optional feature adapters. |
| `platejs/static` | SSR | 1 | keep | Honest SSR renderer boundary with explicit runtime proof. | Simplify internal React topology opportunistically, not as a major packet. |
| `platejs/diff` | headless | 0 | keep proxy | Thin proxy to the Plite-owned diff substrate. | None. |
| `platejs/dom` | client | 0 | keep proxy | Thin proxy to the Plite DOM owner. | None. |
| `platejs/history` | headless | 0 | keep proxy | Thin proxy to Plite history. | None. |
| `platejs/hyperscript` | headless | 0 | keep proxy | Thin proxy used by tests and JSX fixtures. | None. |
| `platejs/page-layout` | headless | 0 | keep proxy | Plite owns pagination/layout substrate; Plate gives its users the matching subpath. | None. |
| `platejs/page-layout/react` | client | 0 | keep proxy | Correct React proxy for Plite page layout. | None. |
| `platejs/migrations` | headless | 0 | keep | Serialized document compatibility is a hard law; versioned migrations are the correct isolated owner. | Continue deleting migration code only after the supported data window closes. |
| `platejs/ai` | headless | 1 | keep | Preview/state effects and editor-owned AI transforms are a coherent optional product capability. | Keep provider orchestration out of this headless owner. |
| `platejs/ai/react` | client | 4 | redesign | `AIChatPlugin.ts` is about 2,000 lines and combines AI SDK chat, prompt policy, streaming, comments, markdown, tables, cursor previews, and suggestions. | Split editor transforms from provider/chat orchestration after the review model is fixed. |
| `platejs/code-drawing` | client | 1 | keep | Coherent adapter over optional drawing engines. | No major cut. |
| `platejs/code-drawing/react` | client | 0 | keep | Thin React adapter for the feature. | None. |
| `platejs/csv` | headless | 0 | keep | Independent serialization/import job. | None. |
| `platejs/dnd/react` | client | 5 | rewrite | About 1,500 lines and four peers recreate drag sessions, cross-editor moves, and drop ownership already present in Plite's native drag pipeline. | Delete React DnD; retain only Plate block-handle and drop-indicator product behavior over Plite primitives. |
| `platejs/docx` | client | 1 | keep | Large but coherent import/export adapter with genuinely optional heavy peers. | Improve internally; do not split packages or move to root. |
| `platejs/emoji` | headless | 1 | keep | Independent data/search adapter and combobox consumer. | No major cut. |
| `platejs/emoji/react` | client | 0 | keep | Thin React adapter. | None. |
| `platejs/excalidraw` | headless | 1 | keep | Independent node/codec adapter for an optional external editor. | No major cut. |
| `platejs/excalidraw/react` | client | 0 | keep | Thin React adapter. | None. |
| `platejs/floating/react` | client | 2 | keep, trim later | Editor range geometry is useful, but the entrypoint also republishes a broad Floating UI surface. | After overlay consolidation, keep Plate geometry and reconsider raw upstream re-exports. |
| `platejs/juice` | headless | 3 | fold | A 31-line CSS-inlining codec named after its dependency; current first-party consumers are DOCX/HTML ingest. | Fold into the honest HTML/DOCX owner and delete the dependency-named public feature unless independent use is proven. |
| `platejs/markdown` | headless | 1 | keep | Independent format boundary with real codecs and optional parser peers. | No major cut. |
| `platejs/math` | headless | 1 | keep | Independent schema/codec feature with an optional renderer peer. | No major cut. |
| `platejs/math/react` | client | 0 | keep | Thin React adapter. | None. |
| `platejs/callout` | headless | 0 | keep | Small but independent product node. | None. |
| `platejs/callout/react` | client | 0 | keep | Thin React adapter. | None. |
| `platejs/combobox` | headless | 1 | keep | Correct shared trigger/filter capability for mention, slash, emoji, footnote, and AI. | Let Plite own only any missing generic matcher primitive; keep semantic apply behavior here. |
| `platejs/comment` | headless | 5 | cut | It persists `comment`, `comment_<id>`, draft, and transient UI flags on text, duplicating Plite annotations and coupling comments to document writes. | Delete the plugin. Provide a one-shot legacy-mark extraction migration, not a runtime compatibility adapter. |
| `platejs/comment/react` | client | 5 | cut | It only converts the wrong headless plugin into a React plugin. | Delete with `platejs/comment`. |
| `platejs/date` | headless | 0 | keep | Independent inline date node and codecs. | None. |
| `platejs/date/react` | client | 0 | keep | Thin React adapter. | None. |
| `platejs/details` | headless | 0 | keep | The semantic replacement for legacy Toggle: one Details owner with Summary and body structure. | Do not reopen Toggle. |
| `platejs/details/react` | client | 0 | keep | Correct native-details React behavior. | None. |
| `platejs/find-replace` | headless | 4 | rewrite | Transient search paint is modeled as a schema mark and per-block legacy `decorate` pass despite Plite's decoration-source contract. | Rebuild as a client decoration source with no persisted schema property. |
| `platejs/footnote` | headless | 1 | keep | Real document semantics and reference/definition integrity; combobox is only an input capability. | No major cut. |
| `platejs/footnote/react` | client | 0 | keep | Thin React adapter. | None. |
| `platejs/layout` | headless | 1 | keep | Independent column structure with real document semantics. | No major cut. |
| `platejs/layout/react` | client | 0 | keep | Thin React adapter. | None. |
| `platejs/media` | headless | 2 | keep | Image, file, audio, video, embed, placeholder schema and codecs form a coherent media family. | Keep image beside media; do not recreate a base-image package. |
| `platejs/media/react` | client | 2 | keep, narrow later | Upload/placeholder behavior is coherent, but product upload policy and the vendored MIME table need a later scope check. | Do not block the review-model cuts. |
| `platejs/mention` | headless | 1 | keep | Independent persisted inline entity; combobox only supplies transient input. | None. |
| `platejs/mention/react` | client | 0 | keep | Thin React adapter. | None. |
| `platejs/slash-command` | headless | 1 | keep | Independent command-menu trigger/input behavior. | None. |
| `platejs/slash-command/react` | client | 0 | keep | Thin React adapter. | None. |
| `platejs/suggestion` | headless | 5 | redesign | A roughly 2,164-line plugin encodes proposed edits as dynamic node properties and owns tracking, diffing, accept/reject, identity, user state, and corrections in one document-mutating model. | Replace the model with Plite `DocumentChange` proposals plus annotations; keep accept/reject semantics in Plate. |
| `platejs/suggestion/react` | client | 2 | keep only as renderer adapter | The React wrapper is thin, but its owner must follow the redesigned suggestion model. | Rebuild after the headless model. |
| `platejs/table` | headless | 2 | keep | About 15,000 lines reflect real table grammar and transform complexity, not a fake feature boundary. | Modernize APIs incrementally; do not rewrite before review/DnD work. |
| `platejs/table/react` | client | 1 | keep | Thin product renderer/interaction adapter relative to the table model. | No major cut. |
| `platejs/tag` | headless | 0 | keep | Independent persisted inline entity. | None. |
| `platejs/tag/react` | client | 0 | keep | Small renderer behavior. | None. |
| `platejs/toc` | headless | 0 | keep | Independent derived-document feature. | None. |
| `platejs/toc/react` | client | 0 | keep | Thin React adapter. | None. |
| `platejs/cursor/react` | client | 4 | cut into Plite overlay owner | It stores ranges in a Plate plugin, refreshes them via deferred commits, and duplicates Yjs range geometry/equality. | Add one generic range-overlay position primitive in Plite, then delete `CursorOverlayPlugin`. |
| `platejs/resizable/react` | client | 1 | keep | Independent pointer-resize primitive used by both media and tables; it is correctly optional. | Add keyboard/a11y commands later, but keep the boundary. |
| `platejs/tabbable` | headless | 4 | move to Plite | Its public types describe editor focus navigation, not a Plate product feature. | Move the behavior/types to Plite React and keep only a Plate proxy if needed. |
| `platejs/tabbable/react` | client | 4 | move to Plite | It owns keyboard focus traversal through void editor nodes and DOM restoration, which is editing substrate. | Move to Plite React; remove stale `slateNode` naming. |
| `platejs/yjs` | headless | 5 | move implementation to Plite | The Plate wrapper is 15 lines; the other roughly 12,000 lines implement a raw Plite `defineExtension`, canonical changes, schema identity, awareness, and provider lifecycle. | Create `plitejs/yjs`; keep `platejs/yjs` as the Plate-facing proxy/plugin wrapper. |
| `platejs/yjs/react` | client | 4 | move generic work to Plite | Provider subscriptions and remote-range projection are substrate; only Plate plugin composition belongs here. | Move hooks/geometry to `plitejs/yjs/react`, leave a thin Plate proxy. |

## Ranked redesign program

1. **Comments hard cut.** Delete document-mark comments and the registry
   `discussionPlugin`. Comments are app/service records projected through Plite
   annotations. Ship a migration extractor for legacy `comment_<id>` marks.
2. **Suggestions redesign.** Store proposed edits as serializable Plite
   `DocumentChange` records with annotation projections. Accept applies a
   change; reject drops it. Do not keep dynamic `suggestion_<id>` properties as
   the primary model.
3. **Native block DnD.** Delete React DnD and its peer stack. Reuse Plite's
   native drag session, clipboard slice, cross-editor move, and autoscroll;
   Plate owns handles, block-selection policy, and indicators.
4. **Yjs owner correction.** Move the raw Plite/Yjs adapter into
   `plitejs/yjs`; preserve `platejs/yjs` as the Plate distribution path.
5. **Projection/overlay consolidation.** One Plite range-geometry owner serves
   remote cursors, local selection cursors, comment widgets, and Yjs. Find uses
   decorations; durable review items use annotations; UI anchors use widgets.
6. **AI chat split.** Keep editor AI transforms in `platejs/ai`; make chat,
   provider, prompt, and tool policy explicit app/adapter composition rather
   than one 2,000-line plugin.
7. **Tab navigation owner correction.** Move void-node focus traversal to
   Plite React.
8. **Small cleanup:** fold `platejs/juice` into its honest HTML/DOCX owner and
   trim broad Floating UI pass-through exports.

## Comments target

Current model:

```text
document text
  -> comment=true
  -> comment_<threadId>=true
  -> comment_draft=true
  -> commentTransient=true

editor plugin store
  -> activeId / hoverId / commentingBlock
  -> discussions / users / currentUserId
```

Target model:

```text
document channel
  -> document content only

comment channel (app/service)
  -> thread id, anchor, bodies, author, status, permissions, audit data

Plite projection
  -> annotation store: anchor + small render payload
  -> widget store: popover/sidebar anchors

Plate registry UI
  -> thread list, composer, resolve/delete controls, renderer
```

Governing decisions:

- A reviewer can write comments while the document is read-only.
- Comment bodies, users, permissions, resolution, and audit events never live
  in editor plugin state.
- Draft and hover state stay in the component/controller that renders them.
- The default comment path does not mutate the document.
- Copy/paste portability is an explicit application persistence decision, not
  a reason to make every comment a document mark.
- Legacy mark extraction belongs in `platejs/migrations`; no permanent runtime
  shim survives the cut.

## Explicitly not next

- Do not rewrite Table. Its complexity is domain complexity and has no cleaner
  Plite owner yet.
- Do not split Image out of Media. Media owns the shared persisted model;
  Resizable already has the independent optional boundary.
- Do not move Callout, Date, Footnote, Layout, Media, Table, Tag, or TOC to the
  root. They remain optional product features.
- Do not recreate npm packages to recover Turbo granularity. The merged DAG
  already supplies per-entrypoint runtime and task ownership.
