# Slate v2 Docs Legacy-Style Review Plan

Date: 2026-04-28
Status: done
Active pass: Pass 7 complete
Score: 0.92

## Current Verdict

The current `../slate-v2/docs` tree is close to legacy Slate's writing style because large parts are copied from `../slate/docs`. That is not enough. Some pages feel right and quietly teach APIs the live source rejects.

The best direction is a source-backed legacy-style rewrite:

- Keep legacy Slate's information architecture: Introduction, Walkthroughs, Concepts, API, Libraries.
- Keep the calm walkthrough voice: problem first, code second, API reference last.
- Replace stale legacy API claims with current Slate v2 contracts from live source and tests.
- Treat `docs/general/changelog.md` and old migration prose as historical, never the front door.
- Make docs prove the core bargain: Slate stays unopinionated, React stays a projection layer, and app authors get Slate-like render APIs without void/spacer footguns.

Current strongest pages:

| Page | Verdict |
| --- | --- |
| `docs/Summary.md` | Keep the legacy docs tree shape. It is still the right navigation model. |
| `docs/walkthroughs/09-performance.md` | Useful current material on target-scoped hooks and large-document islands. Needs source citations and React 19.2 framing. |
| `docs/api/nodes/element.md` | Best current public explanation of runtime-owned void shells. Needs stronger examples and type-backed imports. |
| `docs/libraries/slate-react/hooks.md` | Correctly warns against broad subscriptions. Too terse for public docs. |
| `docs/libraries/slate-react/slate.md` | Mostly tracks current `Slate` props. Needs ownership cleanup and better example placement. |

Current highest-risk pages:

| Page | Problem |
| --- | --- |
| `docs/Introduction.md` | Exact legacy copy, including beta/plugin claims and stale links. |
| `docs/concepts/07-editor.md` | Teaches extension `methods(editor)` even though source rejects `methods`. |
| `docs/concepts/08-plugins.md` | Same `methods(editor)` contradiction, plus direct editor mutation examples. |
| `docs/concepts/11-normalizing.md` | Still routes through legacy method override style. |
| `docs/api/nodes/editor.md` | Still includes method-extension examples that conflict with the hard cut. |
| `docs/libraries/slate-react/editable.md` | Partial prop list, "under construction" note, wrong ownership of projection props, and legacy `Editor` component typo. |
| `docs/walkthroughs/07-enabling-collaborative-editing.md` | Promises current-version slate-yjs cookbook behavior instead of Slate v2 migration-backbone contracts. |

## Pass 2 Docs / Source Inventory

Pass 2 scanned all 61 public markdown docs under `../slate-v2/docs` and matched the risky rows against live source, tests, and compiled research. The stale docs are clustered enough that the rewrite should be owner-based, not page-by-page whack-a-mole.

| Owner | Docs evidence | Live source / test evidence | Verdict |
| --- | --- | --- | --- |
| Extension API | `docs/concepts/07-editor.md:65-152`, `docs/concepts/08-plugins.md:13-147`, `docs/concepts/11-normalizing.md:37-165`, and `docs/api/nodes/editor.md:426-446` teach `methods(editor)` or method composition. | `../slate-v2/packages/slate/src/core/editor-extension.ts:57-64` rejects legacy `methods`; `../slate-v2/packages/slate/test/extension-methods-contract.ts:14-52` proves both object and function `methods` fail before mutation. | P0 docs/source contradiction. Rewrite around `state`, `tx`, `elements`, `commands`, `normalizers`, `operationMiddlewares`, and commit listeners. |
| Public write lifecycle | `docs/walkthroughs/04-applying-custom-formatting.md:105-109`, `:197-200`, and `docs/walkthroughs/05-executing-commands.md:65-68`, `:98-104` still teach `Editor.addMark` / `Editor.removeMark` as normal author writes. | `../slate-v2/packages/slate/test/write-boundary-contract.ts:27-55` rejects direct primitive writes outside `editor.update`; `../slate-v2/packages/slate/test/state-tx-public-api-contract.ts:29-78` proves grouped `state` reads and `tx` writes. | P1 docs/DX mismatch. Walkthroughs should use `editor.update((tx) => tx.marks.add/remove/toggle(...))` and explain primitive editor methods as advanced/internal bridge where still public. |
| Bundled browser source | `docs/walkthroughs/01-installing-slate.md:15` links a broken `xx-using-the-bundled-source.md`; `docs/walkthroughs/08-using-the-bundled-source.md:47-48` uses `dist/slate.js` and `dist/slate-react.js`. | `../slate-v2/packages/slate/package.json:8-26` and `../slate-v2/packages/slate-react/package.json:8-17` export `dist/index.js`; local dist files are `dist/index.js`, not `dist/slate.js`. | P1 support mismatch. Either delete bundled-source docs or rewrite them to current package artifacts if that path is intentionally supported. |
| Collaboration docs | `docs/walkthroughs/07-enabling-collaborative-editing.md:100-174` and `:350-387` teach `@slate-yjs/*`, `withYjs`, method override normalization, and `editor.insertNodes`. | `../slate-v2/packages/slate/test/migration-backbone-contract.ts:32-195` proves substrate-level `state` / `tx`, schema specs, tagged commits, operation replay, and local-only runtime ids; the review rule says no current-version adapter requirement. | P1 product promise mismatch. Rewrite as collaboration substrate / adapter-author contract, not a current slate-yjs recipe. |
| React runtime docs | `docs/libraries/slate-react/editable.md:11-40` omits `renderVoid`, calls the prop breakdown incomplete, and `:210-223` shows `<Editor>` instead of `<Editable>`. | `../slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx:252-303` exports the current `EditableProps`, including `renderVoid`; `../slate-v2/packages/slate-react/src/index.ts:29-38` exports `Editable` and `RenderVoidProps`. | P1 reference mismatch. Rewrite `Editable` API from source, with normal docs leading through `Slate` + `Editable`, `renderElement`, `renderVoid`, hooks, and overlay props. |
| Projection / decoration ownership | `docs/libraries/slate-react/slate.md:34-81` and `docs/libraries/slate-react/editable.md:149-183` both teach projection/decoration props, but ownership is blurred. | `Slate` composes `decorationSources`, `annotationStores`, and `projectionStore` in `../slate-v2/packages/slate-react/src/components/slate.tsx:37-45` and `:122-136`; `Editable` can also wrap a standalone editor with those props at `editable-text-blocks.tsx:704-729`. | P2 docs organization mismatch. Normal app docs should teach provider ownership first, then standalone `Editable editor={editor}` as an adapter convenience. |
| Void shell DX | `docs/api/nodes/element.md:38-94` correctly teaches content-only `renderVoid`, but the examples need real imports and type-backed props. | `../slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx:191-250` passes only `{ element, target }`; `../slate-v2/packages/slate-react/test/surface-contract.tsx:377-478` proves no `actions`, `selected`, `focused`, `children`, or `attributes` leak to `renderVoid`. | Keep direction. Strengthen examples and connect them to browser contract rows. |
| General changelog / migration docs | `docs/general/changelog.md` still contains legacy claims like `useSlateStatic`, `Transforms.*`, `editor.children`, old `<Editor>` controller, and `Slate.Void` manual wrapper rows. | Current exports use `useEditor`, `useEditorSelector`, `useElementSelected`, and runtime-owned shells; current source rejects direct field/write assumptions. | Historical-only. Keep linked only as old changelog or remove from normal navigation until clearly labeled. |

Research state after Pass 2:

- Compiled architecture research is current enough for this pass. `docs/research/decisions/slate-v2-state-tx-public-api-and-extension-namespaces.md:100-136` already records the live source gap: state/tx exists and is tested, but docs/examples still teach primitive editor writes.
- React 19.2 evidence is already refreshed as of 2026-04-28 in `docs/research/sources/editor-architecture/react-19-2-external-store-and-background-ui.md:88-102`.
- Node/render DX research already accepts runtime-owned shells and warns that primitive `editor.*` writes are not the public example shape in `docs/research/decisions/editor-node-dx-should-use-runtime-owned-shells-and-spec-first-renderers.md:126-133`.
- No new research page was needed in Pass 2. The gap is now execution-grade docs inventory, not missing research.

## Pass 3 Pressure Findings

Pass 3 pressure-tested the Pass 2 inventory against the north star. The result is blunt: this cannot be fixed by making individual pages nicer. The docs need an owner-order rewrite, because the stale claims cross-cut install, core lifecycle, React rendering, collaboration, and proof.

| Lens | Pressure question | Decision | Plan response |
| --- | --- | --- | --- |
| React 19.2 performance | Do docs teach React as projection, or just sprinkle hook advice? | Strengthen. | React docs must forbid broad subscriptions in rendered content, eager `selected` / `focused` void props, and root-selector advice in hot render paths. Each render page should say: subscribe by target only when the UI draws that fact. |
| Slate-close DX | Are we replacing Slate docs with Plate/spec-factory docs? | Keep Slate-close. | Raw Slate docs should lead with `Slate`, `Editable`, `renderElement`, `renderVoid`, `editor.read`, and `editor.update`. Do not lead with `defineElement`, plugin catalogs, chains, or product namespaces. |
| Unopinionated core | Are docs still treating the editor object as the method dump? | Cut harder. | Organize author writes around `editor.update((tx) => ...)`, reads around `editor.read((state) => ...)`, and operation replay around `applyOperations`. Keep primitive editor methods out of first-path docs. |
| Migration backbone | Are we promising Plate or slate-yjs current-version compatibility? | Keep backbone only. | Document extension namespaces, schema/spec policy, deterministic operations, commits, tags, and local-only targets. Do not publish adapters or current `withYjs` recipes in raw Slate docs. |
| Regression proof | Are examples being treated as proof? | Strengthen. | Every browser-sensitive doc section needs a contract-family row. Demos stay demos; stale-term grep, snippet extraction, and replayable browser contracts are the proof path. |
| Research evidence | Is this a research gap or an execution gap? | Execution gap. | Compiled research is current enough for this pass. Pass 4 should object against the evidence already cited instead of opening another broad research lane. |
| Simplicity | Is the plan too spread out? | Rewrite by owner cluster. | Fix the docs in this order: front door, core lifecycle, React rendering, collaboration substrate, proof gates. Do not patch scattered pages independently. |

Exact rewrite order after Pass 3:

1. Front door: `Introduction.md`, `Summary.md`, install docs, bundled-source docs, and changelog/migration placement.
2. Core lifecycle: Editor, Commands, Transforms, Plugins, Normalizing, and custom-formatting walkthroughs as one `read` / `update` / `state` / `tx` rewrite.
3. React rendering: `Slate`, `Editable`, hooks, elements, voids, decorations, annotations, and performance docs as one runtime-projection rewrite.
4. Collaboration substrate: replace the slate-yjs cookbook with adapter-author backbone docs.
5. Proof gates: stale-term grep, source ledger, extracted snippet checks, and browser contract map.

## Pass 4 Maintainer Objection Pass

Pass 4 challenged the Pass 3 rewrite order as a skeptical Slate maintainer. The pressure did not reverse the hard cuts, but it did narrow two decisions:

- Bundled-source docs should be decided from package artifacts, not deleted by assumption.
- Collaboration docs should become a substrate guide, not disappear from the walkthrough/concepts path entirely.

| Objection target | Maintainer objection | Decision | Plan response |
| --- | --- | --- | --- |
| Owner-order rewrite | "This is too big. Patch the stale snippets and move on." | keep | The stale claims are owner-clustered across install, core lifecycle, React rendering, collaboration, and proof. Page-local patching would leave contradictions split across concepts and walkthroughs. |
| Legacy-style front door | "The copied legacy intro is friendly. Don't rewrite the voice out of it." | keep | Keep legacy IA and calm voice, but remove false beta/plugin/bundle claims. Voice stays; stale facts go. |
| Extension `methods(editor)` removal | "Method composition is familiar and easier to teach." | keep | Live source rejects `methods` before install in `editor-extension.ts:57-64`; docs that teach it are lying. Teach one small `state` helper and one small `tx` helper first. |
| `tx` as normal write API | "Slate users expect direct `Editor.addMark`, `Transforms.*`, and editor methods." | keep | First-path docs use `editor.update((tx) => ...)`. API/reference docs can mention primitive bridges only where source still supports them inside an update boundary. |
| Runtime-owned void rendering | "Legacy `renderElement` plus children is more flexible." | keep | Flexibility here is the bug class. `surface-contract.tsx:377-478` proves normal `renderVoid` receives only `{ element, target }`; app-owned spacers stay out of public docs. |
| React projection docs | "Putting projection on `Slate` makes `Editable` docs less self-contained." | keep | Provider-owned sources are the normal app shape; standalone `Editable editor={editor}` stays an adapter convenience, not the mental model. |
| Bundled-source docs | "Script-tag users still need an answer." | keep | Remove broken UMD/global guidance from normal navigation. Only document ESM CDN/package artifacts if that path is intentionally supported from current output. |
| Collaboration docs | "Users need a working collaboration story." | keep | Keep collaboration docs, but make them adapter-author substrate docs: operations, commits, tags, snapshots, and local-only targets. Do not promise current-version `@slate-yjs` recipes. |
| Browser proof map | "Docs shouldn't be blocked on huge browser tests." | keep | Fast docs work needs snippet/stale-term/source gates; browser-sensitive claims map to contract families, with full replay in `test:stress` or release gates. |

## Pass 5 Ecosystem Maintainer Pass

Pass 5 checked the plan against Plate and slate-yjs migration pressure. The right docs line is still: raw Slate documents migration substrate, not current adapter support.

| Ecosystem | Pressure | Evidence | Decision | Docs response |
| --- | --- | --- | --- | --- |
| Plate plugin typing | Plate has typed plugin `api`, `transforms`, selectors, options, and node config. | `../plate-2/packages/core/src/lib/editor/SlateEditor.ts:162-207` exposes `api`, `tf`, and `transforms`; `../plate-2/packages/core/src/lib/plugin/BasePlugin.ts:503-515` types `api`, `options`, `selectors`, and `transforms`. | keep raw Slate names. | Raw Slate docs teach `state` and `tx`. Plate can map product `api` to `state` groups and `tf` / `transforms` to `tx` groups without raw Slate adopting Plate names. |
| Plate node/plugin behavior | Plate plugins encode inline/void/markable behavior and product transforms. | Mention uses `node: { isInline, isMarkableVoid, isVoid }` and `extendEditorTransforms` in `../plate-2/packages/mention/src/lib/BaseMentionPlugin.ts:31-63`; footnote uses inline void config plus API/transforms in `../plate-2/packages/footnote/src/lib/BaseFootnoteReferencePlugin.ts:87-177`. | keep element specs. | Raw Slate docs teach `elements` / schema specs and content-only `renderVoid`; Plate can compile plugin node config into specs and renderers above Slate. |
| Plate UI/react layer | Plate needs render composition, toolbar state, floating UI, decorators, and annotations. | Link extends plugin API and selectors for floating UI state in `../plate-2/packages/link/src/react/LinkPlugin.tsx:43-97`; v2 `Slate` owns projection sources in `../slate-v2/packages/slate-react/src/components/slate.tsx:37-136`. | keep provider-owned projection. | Raw Slate docs teach `decorationSources`, `annotationStores`, and target-scoped hooks. Plate wraps those with product UI; raw Slate does not document Plate toolbars. |
| slate-yjs local operation capture | Current slate-yjs depends on editor mutation fields and operation interception. | `../slate-yjs/packages/core/src/plugins/withYjs.ts:29-44` defines `YjsEditor`; `:230-280` stores local changes from `editor.children`, overrides `apply`, and flushes on `onChange`. | keep backbone. | Do not claim current `withYjs` works. Teach adapter authors to subscribe to commits and export `commit.operations` with tags. |
| slate-yjs remote import | Current slate-yjs translates Yjs events into Slate operations and applies them. | `../slate-yjs/packages/core/src/applyToSlate/index.ts:25-40` applies translated operations; v2 proves deterministic replay through `applyOperations` in `../slate-v2/packages/slate/test/migration-backbone-contract.ts:135-195`. | keep backbone. | Raw Slate collaboration docs should show remote import through `editor.applyOperations(ops, { tag })`, not instance `editor.apply(op)`. |
| slate-yjs cursor/position state | Collaboration needs remote cursor positions separate from document operations. | slate-yjs stores relative positions in `../slate-yjs/packages/core/src/plugins/withYjs.ts:110-143`; v2 keeps runtime ids local in `migration-backbone-contract.ts:174-194`. | keep local runtime targets. | Docs should say runtime ids and DOM targets are local projection facts; adapters persist positions through their own CRDT layer, not Slate operation payloads. |

Ecosystem wording to use in the docs:

- "Slate exposes the substrate an adapter can target."
- "Plate can build typed product APIs above `state` and `tx`; raw Slate keeps the smaller names."
- "A collaboration adapter imports and exports operations through commits, tags, snapshots, and `applyOperations`."
- "Runtime ids, selected UI, void shells, and DOM anchors are local projection details."

Ecosystem wording to avoid:

- "Plate compatible" without a specific substrate contract.
- "Works with slate-yjs" until a current adapter and browser proof exist.
- `editor.api`, `editor.tf`, `withYjs`, or product command chains as first-path raw Slate docs.

## Pass 6 Revision Pass

Pass 6 resolves the previously open decisions into execution text. No public API surface stays in maybe-language.

| Row | Final decision | Execution text | Proof gate |
| --- | --- | --- | --- |
| `tx` write lifecycle | First-path docs use `editor.read((state) => ...)` and `editor.update((tx) => ...)`. Primitive editor writers are bridge/API-reference material only where source supports them inside `editor.update`. | Walkthroughs and concepts must not teach `Editor.addMark`, `Editor.removeMark`, `Transforms.*`, or `editor.insertNodes` as normal writes. API pages can include an "Advanced bridge" note that direct primitive writes are rejected outside `editor.update`. | Stale-term grep over walkthroughs/concepts plus `write-boundary-contract.ts:27-77` and `state-tx-public-api-contract.ts:29-108`. |
| Bundled-source docs | Remove broken bundled-source guidance from the normal path. Current artifacts are ESM package entries, not `dist/slate.js` / `dist/slate-react.js` UMD globals. | `walkthroughs/01-installing-slate.md` should not link `xx-using-the-bundled-source.md` or promise `dist/slate.js`. Keep a package-artifact note only if the docs intentionally support ESM CDN imports through `dist/index.js`; otherwise remove `08-using-the-bundled-source.md` from navigation. | Link grep for `xx-using`, `dist/slate.js`, and `dist/slate-react.js`; artifact check against `packages/slate*/dist/index.js` and `config/tsdown.config.mts` ESM format. |
| Collaboration docs | Keep collaboration docs, but make them adapter-substrate docs, not a current `@slate-yjs` recipe. | Replace "enabling collaborative editing" cookbook content with a concept/API page that shows local commit export, remote operation import, tags, snapshots, and runtime-local ids. Mention Plate/slate-yjs as possible adapter consumers only through the substrate contract. | `migration-backbone-contract.ts:135-195`, stale-term grep for `withYjs` as first-path docs, and a later browser remote-apply contract row. |
| Projection docs | Provider-owned projection remains first-path. | `Slate` docs own `decorationSources`, `annotationStores`, and `projectionStore`; `Editable` docs describe rendering projected segments and standalone adapter usage second. | Source ledger for `Slate` projection composition and search-highlight focus contract. |
| Void docs | `renderVoid({ element, target })` remains the only normal void renderer path. | Normal element docs keep `attributes + children`; void docs show visible content only, with `useElementSelected(target)` as opt-in selected UI. | `surface-contract.tsx:377-478` plus browser image/mention navigation rows. |

Final execution order:

1. Front door and navigation.
   Rewrite `Introduction.md`, `Summary.md`, install docs, bundled-source placement, and changelog placement.
2. Core lifecycle docs.
   Rewrite Editor, Commands, Transforms, Plugins, Normalizing, and custom-formatting walkthroughs around `read`, `update`, `state`, `tx`, specs, operations, and commits.
3. React projection docs.
   Rewrite Slate, Editable, hooks, elements, voids, decorations, annotations, and performance around provider-owned projection and target-scoped subscriptions.
4. Collaboration substrate docs.
   Rewrite collaboration as adapter-author substrate: commits, tags, snapshots, operation replay, adapter-owned awareness, and local-only runtime ids.
5. Proof gates.
   Add stale-term grep, source ledger, extracted snippet checks, and browser contract map.

## Pass 7 Closure Audit

Pass 7 closes the review gate. This marks the plan ready for a later execution lane; it does not claim the docs are already rewritten.

| Gate | Result | Evidence |
| --- | --- | --- |
| Total score at least `0.92` | pass | Closure score is `0.92`; no dimension is below `0.91`. |
| No unplanned P0/P1 docs issue | pass | Pass 2 inventories the P0/P1 docs/source contradictions; Pass 6 assigns execution text and proof gates. |
| Every score has evidence | pass | Scorecard cites live `../slate-v2` source/tests, local Plate/slate-yjs source, and compiled research. |
| Research contradiction resolved | pass | Pass 2 and Pass 6 classify the remaining work as execution, not missing research. |
| Public API surface finalized | pass | First-path docs use `read`, `update`, `state`, `tx`, `renderVoid`, provider-owned projection, and migration substrate wording. |
| Objection ledger resolved | pass | Every ledger row is `keep`; previously open rows have Pass 6 execution text. |
| Migration-backbone answers | pass | Plate maps product APIs above raw Slate substrate; slate-yjs maps to commits, tags, snapshots, operations, and adapter-owned awareness. |
| Browser-sensitive proof rows | pass | The plan names unit, stale-grep, snippet, source-ledger, browser-contract, `test:stress`, and release-gate proof families. |
| Pass schedule complete | pass | Passes 1 through 7 are recorded complete. |

## Confidence Scorecard

| Dimension | Weight | Score | Evidence |
| --- | ---: | ---: | --- |
| React 19.2 runtime performance | 0.20 | 0.92 | Performance docs already push target-scoped hooks and large-document islands in `../slate-v2/docs/walkthroughs/09-performance.md:45-51` and `:70-87`; live `useElementSelected` filters by `selectionImpactRuntimeIds` in `../slate-v2/packages/slate-react/src/hooks/use-element-selected.ts:39-57`; closure locks provider-owned projection and target-scoped render subscriptions as docs law. |
| Slate-close unopinionated DX | 0.20 | 0.93 | `../slate-v2/docs/Summary.md:5-76` preserves legacy IA from `../slate/docs/Summary.md:5-76`; `docs/research/sources/slate/walkthrough-concepts-and-api-doc-patterns.md:24-47` supports narrative-first, walkthrough-second, API-last docs; closure keeps Slate-like `renderElement` and `Editable` while moving voids, writes, and collaboration to source-backed v2 contracts. |
| Plate and slate-yjs migration-backbone shape | 0.15 | 0.93 | Plate evidence shows product `api` / `tf` / plugin node config in `../plate-2/packages/core/src/lib/editor/SlateEditor.ts:162-207` and `../plate-2/packages/mention/src/lib/BaseMentionPlugin.ts:31-63`; slate-yjs evidence shows current field/method interception in `../slate-yjs/packages/core/src/plugins/withYjs.ts:230-280`; closure maps those needs to raw Slate substrate without adapter promises. |
| Regression-proof testing strategy | 0.20 | 0.91 | Runtime-owned void shell contracts are tested in `../slate-v2/packages/slate-react/test/surface-contract.tsx:377-478`; `write-boundary-contract.ts:27-77` and `migration-backbone-contract.ts:135-195` cover write and collab substrate proof; closure defines stale-term, source-ledger, snippet, browser-contract, `test:stress`, and release-gate proof families. |
| Research evidence completeness | 0.15 | 0.92 | Compiled Slate docs research captures narrative-first, walkthrough-second, API-last style in `docs/research/sources/slate/walkthrough-concepts-and-api-doc-patterns.md:24-47`; state/tx research captures the live docs gap in `docs/research/decisions/slate-v2-state-tx-public-api-and-extension-namespaces.md:100-136`; closure includes current local Plate, slate-yjs, React 19.2, Slate v2 source, and artifact evidence. |
| shadcn-style composability and hook/component minimalism | 0.10 | 0.91 | `docs/solutions/style.md:5-44` requires progressive guide-first docs; current `../slate-v2/docs/libraries/slate-react/editable.md:40` still tells readers to inspect source because the prop breakdown is incomplete; closure keeps normal docs minimal and pushes bridges/product ceremony to API/reference or Plate. |

Weighted score: 0.92.

Completion is done for the review lane. The plan is ready for a later execution lane.

## Source-Backed Architecture North Star

Docs should teach Slate v2 as a small unopinionated editor runtime with a React projection package, not as a React component library that happens to store editor state.

The docs voice should stay close to legacy Slate:

- Start from the user problem.
- Show the smallest working example.
- Explain the mental model after the reader sees it.
- Move exact types and overloads to API pages.
- Avoid product-framework vocabulary that belongs in Plate.

The docs content must stop copying legacy implementation contracts when Slate v2 has made a hard cut.

## Public API Target

Public docs should teach these as the normal paths:

```tsx
const [editor] = useState(() => withReact(createEditor<CustomValue>()))

<Slate editor={editor} initialValue={initialValue} onChange={setValue}>
  <Editable renderElement={renderElement} renderVoid={renderVoid} />
</Slate>
```

```ts
editor.read((state) => {
  return state.selection.get()
})

editor.update((tx) => {
  tx.nodes.set({ type: 'heading' })
  tx.marks.toggle('bold')
})
```

```tsx
const renderVoid = ({ element, target }: RenderVoidProps<ImageElement>) => {
  return <Image src={element.url} selected={useElementSelected(target)} />
}
```

Docs should not teach these as normal authoring paths:

- direct `editor.children`, `editor.selection`, `editor.operations`, or `editor.marks`
- extension `methods(editor)`
- app-owned void spacer children
- `renderElement` as the normal void renderer
- current-version Plate or slate-yjs adapter promises
- broad selection/focus hooks inside every rendered node

## Internal Runtime Target

Public docs should explain the runtime at the right level:

- React subscribes to committed editor facts.
- Selection, DOM repair, IME, void shells, decoration projection, and large-document islands are runtime-owned.
- App renderers render content, not editor DOM contracts.
- Advanced source/projection APIs are documented after the normal `decorationSources` and `annotationStores` path.

Docs should not expose internal module names or root engine wiring as the author mental model.

## Hook, Component, And Render DX Target

Keep legacy Slate's normal element shape:

```tsx
function Paragraph({ attributes, children }: RenderElementProps) {
  return <p {...attributes}>{children}</p>
}
```

Split voids into content-only rendering:

```tsx
function Image({ element, target }: RenderVoidProps<ImageElement>) {
  const selected = useElementSelected(target)

  return <img data-selected={selected || undefined} src={element.url} />
}
```

Document hook choice by render cost:

| Need | Hook |
| --- | --- |
| Stable editor object | `useEditor()` |
| Toolbar focus state | `useEditorFocused()` |
| Toolbar selection state | `useEditorSelection()` or `useEditorSelector()` |
| Element selected UI | `useElementSelected(target)` |
| Node-scoped data | `useNodeSelector()` |
| Text-scoped data | `useTextSelector()` |
| Decoration/projection data | `useDecorationSelector()` |

The docs should say the rule plainly: content renderers subscribe to the narrowest runtime target they actually draw.

## Plate Migration-Backbone Target

Raw Slate docs should not become Plate docs.

The docs should give Plate a migration backbone by documenting:

- `editor.extend(...)` for named extension installation
- `state` groups for read helpers
- `tx` groups for transaction helpers
- `elements` specs for schema behavior
- `commands`, `commitListeners`, `operationMiddlewares`, and `normalizers` as substrate hooks
- no `editor.api`, `editor.tf`, `editor.plate`, or product-layer namespaces in raw Slate

Plate can map product APIs onto this substrate later:

| Plate concept | Raw Slate substrate |
| --- | --- |
| `editor.api.<plugin>` | `state.<plugin>` read groups |
| `editor.tf.<plugin>` / `editor.transforms.<plugin>` | `tx.<plugin>` write groups |
| plugin `node` config | `elements` / schema specs |
| plugin render pipelines | `renderElement`, `renderVoid`, `renderLeaf`, `renderSegment`, projection sources |
| product selectors/options | Plate-owned stores and wrappers above raw Slate |

Evidence: source registers extension slots for `commands`, `capabilities`, `elements`, `normalizers`, `commitListeners`, `operationMiddlewares`, `state`, and `tx` in `../slate-v2/packages/slate/src/core/editor-extension.ts:138-186`.

## slate-yjs Migration-Backbone Target

Raw Slate docs should not promise that current slate-yjs public APIs already work.

They should document the substrate a collab adapter can target:

- deterministic operation replay through `editor.applyOperations(...)`
- commit metadata through `Editor.getLastCommit(...)`
- `Editor.subscribe(...)` for snapshots and commits
- runtime ids kept local to the editor projection
- `editor.update(..., { tag })` for local and remote commit classification
- adapter-owned CRDT positions and awareness state outside Slate operation payloads

Evidence: `../slate-v2/packages/slate/test/migration-backbone-contract.ts:135-195` proves tagged local edits, remote import, operation replay, and runtime ids staying out of operation payloads.

## Legacy Regression Proof Matrix

| Area | Docs acceptance | Proof needed |
| --- | --- | --- |
| Basic install | First walkthrough compiles against current `Slate`, `Editable`, `withReact`, and typed `createEditor`. | Typecheck extracted snippets or docs example fixtures. |
| Event handlers | `onKeyDown` remains the public keyboard entrypoint. Any model command API is advanced. | Unit snippet plus browser keydown replay. |
| Commands | Writes use `editor.update((tx) => ...)`; docs do not call mutating helpers outside a write boundary. | Grep plus command-contract tests. |
| Void rendering | Normal elements use `attributes + children`; voids use `renderVoid({ element, target })`. | `surface-contract.tsx` plus browser image/mention navigation rows. |
| Selection hooks | Node render docs use target-scoped hooks only when drawing selected UI. | Hook tests plus render-count proof. |
| Decorations and annotations | Normal docs lead with `decorationSources` and `annotationStores`; low-level `projectionStore` is last. | Projection tests plus search-highlight focus regression row. |
| Collaboration | Docs explain adapter substrate, not current-version adapter support. | Operation replay and commit metadata tests. |
| Large docs | Performance page teaches islands and target-scoped subscriptions. | Large-doc tests plus browser stress lane. |

## Browser Stress And Parity Strategy

Docs should not rely on demos as proof. Each browser-sensitive doc example should link to a named contract family:

- text input and deletion
- mark toggles
- block transforms
- inline void navigation
- block void navigation
- editable void islands
- table cell navigation
- hover toolbar selection
- search decoration focus retention
- paste and drag/drop
- IME and Android input
- large-document island selection

Fast CI can run a small deterministic subset. Full generated replay belongs in `test:stress` or release-quality `check:full`, not default doc iteration.

## Hard Cuts And Rejected Alternatives

| Decision | Keep / Drop | Reason |
| --- | --- | --- |
| Keep legacy docs IA | Keep | It is still the clearest shape for users and agents. |
| Keep copied legacy prose verbatim | Drop | It preserves stale beta, plugin, bundle, extension, and collaboration claims. |
| Teach extension `methods(editor)` | Drop | Live source rejects it before mutating the editor. |
| Hide incomplete API docs behind "refer to source" | Drop | Public docs must own current public API. |
| Promise current-version slate-yjs support | Drop | The target is migration backbone, not current adapter compatibility. |
| Lead with low-level projection stores | Drop | Normal users need `decorationSources` and `annotationStores` first. |
| Rewrite into Plate-style plugin docs | Drop | Raw Slate should stay unopinionated. Plate owns product conventions. |

## Slate Maintainer Objection Ledger

| Change | Who feels pain | Likely objection | Why not change for change's sake | Evidence | Rejected alternative | Migration answer | Docs / example answer | Regression proof | Ecosystem answer | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Rewrite by owner cluster, not page-by-page | Docs maintainers | "This is too large for a docs cleanup." | The stale claims are cross-cutting; page patches preserve contradictions. | Pass 2 inventory links the same stale API family across install, concepts, walkthroughs, API, React, and collaboration docs. | Patch the most visible snippets first. | Stable owner order makes Plate/slate-yjs substrate docs land after core lifecycle docs. | Execute front door, core lifecycle, React rendering, collaboration substrate, then proof gates. | Stale-term grep plus source ledger per owner. | Ecosystem docs get one substrate story instead of scattered caveats. | keep |
| Rewrite legacy-copied Introduction and install docs | Raw Slate users | "The old docs were friendly. Don't over-design them." | Keep the voice, remove false claims. | `../slate-v2/docs/Introduction.md:3-9` is identical to legacy and still says beta/plugin claims. | Keep copy and patch only code snippets. | Same IA and walkthrough tone, current examples. | New Introduction plus Installing Slate as source-backed first path. | Snippet extraction and link grep. | Plate/slate-yjs unaffected. | keep |
| Replace extension `methods(editor)` docs with `state` / `tx` / specs | Plugin authors | "This makes simple plugins feel more abstract." | Source already hard-cuts `methods`; docs currently lie. | `../slate-v2/packages/slate/src/core/editor-extension.ts:57-64`; `../slate-v2/docs/concepts/08-plugins.md:13-35`. | Keep method override docs as "legacy". | Show one small `state` helper and one small `tx` helper before advanced slots. | Rewrite Plugins and Editor concepts together. | `extension-methods-contract.ts` and `extension-namespaces-contract.ts`. | Plate gets namespaced extension substrate; collab unaffected except deterministic command metadata. | keep |
| Make `tx` the normal write docs path | Legacy Slate authors | "Direct `Editor.*` and `Transforms.*` are the Slate muscle memory." | Write boundaries are already source law; first-path docs should not teach the bridge as the model. | `../slate-v2/packages/slate/test/write-boundary-contract.ts:27-77`; `../slate-v2/packages/slate/test/state-tx-public-api-contract.ts:29-108`. | Keep direct primitive writes in walkthroughs. | `state` / `tx` groups are the plugin and collab substrate. | Walkthroughs use `editor.update((tx) => ...)`; API refs may mention primitive bridges only inside update-boundary caveats. | Grep docs for direct writes plus write-boundary tests. | Plate can build product commands above `tx`; slate-yjs uses operation replay. | keep |
| Make void docs content-only with `renderVoid({ element, target })` | App authors with custom voids | "Legacy `renderElement` worked and was flexible." | It removes the spacer/hidden-anchor footgun that caused layout and selection regressions. | `../slate-v2/packages/slate-react/test/surface-contract.tsx:377-478`; `../slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx:191-250`. | Keep voids in `renderElement` and document caveats. | Normal elements stay legacy; voids move to `renderVoid`. | Element API and Custom Elements walkthrough. | Void shell tests plus browser image/mention rows. | Plate can wrap `renderVoid`; slate-yjs unaffected. | keep |
| Decide bundled-source docs from artifacts | Script-tag users | "Some users still prototype without bundlers." | The current docs point to broken artifact names. | `../slate-v2/docs/walkthroughs/01-installing-slate.md:15`; `../slate-v2/docs/walkthroughs/08-using-the-bundled-source.md:47-48`; package exports point at `dist/index.js`; `config/tsdown.config.mts:28-29` builds ESM. | Leave the old UMD paths and hope unpkg resolves. | None. This is packaging support, not model migration. | Remove bundled-source from normal nav unless ESM CDN imports are intentionally supported and documented from `dist/index.js`. | Link grep plus package artifact check. | Plate/slate-yjs unaffected. | keep |
| Reframe collaboration docs to migration backbone | slate-yjs maintainers | "Users want a working collab recipe." | A wrong recipe is worse than no recipe. Raw Slate must document stable substrate. | `../slate-v2/docs/walkthroughs/07-enabling-collaborative-editing.md:100-174`; `migration-backbone-contract.ts:135-195`. | Keep current slate-yjs cookbook with a warning. | Provide adapter-author contract and minimal operation replay example. | Collaboration concept/API page after core lifecycle docs; no current `withYjs` recipe. | Operation replay tests and browser remote-apply scenario later. | Plate/slate-yjs can migrate to operations/snapshots/commits without raw Slate promising adapters. | keep |
| Move projection docs out of `Editable` prop confusion | App authors using search/comments | "Why not one prop on Editable?" | `Slate` owns shared projection sources; `Editable` renders projected segments. | `../slate-v2/packages/slate-react/src/components/slate.tsx:37-45`; `../slate-v2/docs/libraries/slate-react/editable.md:149-183`. | Keep both docs equally prominent. | Quick path: `Slate decorationSources` plus `Editable renderSegment`; advanced: `projectionStore`. | Slate component, Editable component, and annotation/decorator guide. | Search focus regression and projection source tests. | Plate can wrap sources; collab unaffected. | keep |
| Map browser-sensitive docs to contracts | Docs authors | "Docs should not require slow browser tests for every edit." | The map is release law, not default docs iteration. | `docs/research/decisions/slate-v2-architecture-verdict-after-human-stress-sweep.md:190-211`. | Treat examples as proof. | Contract families protect migration examples without forcing current-version adapters. | Add proof rows beside browser-sensitive docs. | Fast stale/snippet gates in docs work; full replay in stress/release gates. | Plate/slate-yjs can consume the same proof categories later. | keep |

## Pass Schedule And Pass-State Ledger

| Pass | Status | Evidence added | Plan delta | Open issues | Next owner |
| --- | --- | --- | --- | --- | --- |
| 1. Current-state read and initial score | complete | Legacy docs, v2 docs, live source/tests, docs style rules, compiled Slate docs research. | Created this docs-specific review plan and initial score. | Source contradictions still need full inventory. | Pass 2 owner: docs/source audit. |
| 2. Research and live-source refresh | complete | Full risky-pattern grep over 61 public docs; live source/test refs for extension methods, state/tx, write boundary, Slate/Editable props, void shell, bundled package exports, migration backbone, React 19.2 research, and node-DX research. | Added Pass 2 inventory and raised score from `0.72` to `0.76`. | Need pressure-pass decisions and exact rewrite order. | Pass 3 owner: pressure passes. |
| 3. Pressure passes | complete | Performance, DX, unopinionated-core, migration, regression, research, and simplicity pressure rows. | Added owner-order rewrite sequence and raised score from `0.76` to `0.81`. | Need maintainer objections against the owner-order rewrite. | Pass 4 owner: objection ledger. |
| 4. Slate maintainer objection ledger | complete | Added owner-order, tx write lifecycle, bundled-source, collaboration, projection, void, and browser-proof objection rows with keep/resolved decisions. | Raised score from `0.81` to `0.84`; narrowed bundled-source and collaboration decisions to artifact/substrate revisions. | Need ecosystem pass for Plate/slate-yjs backbone wording. | Pass 5 owner: ecosystem maintainer pass. |
| 5. Ecosystem maintainer pass | complete | Local Plate source for `api` / `tf` / plugin node config / render pressure; local slate-yjs source for `withYjs`, local operation capture, remote import, origins, and positions; v2 migration-backbone contract. | Raised score from `0.84` to `0.86`; added Plate concept to raw Slate substrate map and collaboration adapter wording. | Needed revision pass to resolve previously open rows and final gates. | Pass 6 owner: revision pass. |
| 6. Revision pass | complete | Resolved write-lifecycle, bundled-source, collaboration, projection, and void execution text; artifact-gated bundled-source decision; final owner-order phases and proof gates. | Raised score from `0.86` to `0.89`; all objection rows now have keep decisions with execution responses. | Need closure score and final gate audit. | Pass 7 owner: closure score and final gates. |
| 7. Closure score and final gates | complete | Closure audit, final scorecard, final gate results. | Raised score from `0.89` to `0.92`; marked review lane done. | None for the review lane. | Execute the accepted docs plan in a later lane. |

## Plan Deltas From Review

Added:

- Docs-specific Slate review lane.
- Current docs ranking by source accuracy and legacy style.
- P0 contradiction: extension `methods(editor)` docs conflict with live source.
- Public docs target for `read`, `update`, `state`, `tx`, `renderVoid`, and narrow hooks.
- Collaboration docs correction: migration backbone, not current adapter support.
- Pass 2 stale-doc inventory across extension API, write lifecycle, bundled source, collaboration, React runtime docs, projection ownership, void shell DX, and historical changelog/migration docs.
- Decision not to update research in Pass 2 because the compiled layer already contains the needed 2026-04-28 state/tx, React 19.2, and node-DX decisions.
- Pass 3 pressure findings across React performance, Slate-close DX, unopinionated core boundaries, migration backbone, regression proof, research evidence, and simplicity.
- Exact owner-order rewrite: front door, core lifecycle, React rendering, collaboration substrate, proof gates.
- Pass 4 maintainer objections and accepted/revised responses for owner-order rewrite, tx write lifecycle, void rendering, projection ownership, bundled-source docs, collaboration substrate, and browser proof mapping.
- Pass 5 ecosystem pass with Plate and slate-yjs source evidence, substrate mapping, and wording rules that avoid adapter promises.
- Pass 6 final execution decisions for `tx` first-path docs, bundled-source nav/artifact policy, collaboration substrate placement, projection ownership, void rendering, and proof gates.
- Pass 7 closure audit and final score.

Dropped:

- The assumption that copied legacy docs are "close enough".
- The idea that current docs are mostly up to date because several snippets mention `editor.update`.
- Page-by-page cleanup as the execution strategy. The contradictions are owner-clustered, so page-local patching is the wrong shape.
- Keeping broken bundled-source paths for script-tag users.
- Raw Slate adopting Plate `api` / `tf` / command-chain naming.
- Raw Slate promising current `withYjs` compatibility.
- Keeping previously open decision rows as plan debt.

Strengthened:

- Void docs must stay content-only and source-backed.
- Performance docs need hook choice guidance tied to runtime target subscriptions.
- Editable docs need ownership cleanup instead of source-link escape hatches.
- Raw Slate docs should stay Slate-close and unopinionated; Plate/spec-factory-first examples belong above raw Slate, not inside the core docs front path.
- Primitive editor writes can be mentioned only as API/reference bridge material where source supports them inside `editor.update`; walkthroughs should teach `tx`.
- Collaboration docs must describe operations, commits, tags, snapshots, runtime-local targets, and adapter-owned awareness/position state.
- Bundled-source docs are not a normal walkthrough unless supported ESM CDN artifacts are explicitly documented from current package output.

## Open Questions And What Would Change The Decision

| Question | Current answer | What would change it |
| --- | --- | --- |
| Should the docs keep `yarn add` as the first install command? | No hard dependency on Yarn. Install docs should be package-manager-neutral unless project policy chooses one. | A confirmed docs policy that Slate public docs intentionally use Yarn first. |
| Should bundled-source docs stay? | Not as a normal walkthrough. The current output is ESM `dist/index.js`, not the documented UMD files. | A deliberate browser/CDN bundle artifact with source and release proof. |
| Should collaboration stay a walkthrough? | No current adapter walkthrough. Keep collaboration as a concept/API substrate guide until a compatible adapter and browser proof exist. | A current Slate v2 compatible collab adapter and browser proof. |
| Should `docs/general/changelog.md` stay linked from Summary? | Only as historical/reference material, never as the front-door migration truth. | If the published docs system already hides or scopes it. |

## Implementation Phases With Owners

1. Docs/source inventory
   - Owner: docs reviewer.
   - Output: stale-claim inventory for every public doc page.

2. Front-door rewrite
   - Owner: docs author.
   - Output: `Introduction.md`, `Summary.md`, and `walkthroughs/01-installing-slate.md` updated to current source-backed legacy style.

3. Core API concepts rewrite
   - Owner: core API docs author.
   - Output: Editor, Commands, Plugins, Transforms, Normalizing pages aligned with `editor.read`, `editor.update`, `state`, `tx`, specs, and operation replay.

4. React runtime docs rewrite
   - Owner: slate-react docs author.
   - Output: Slate, Editable, hooks, rendering, voids, decorations, annotations, and performance docs aligned with current source.

5. Collaboration and ecosystem substrate docs
   - Owner: collaboration docs author.
   - Output: migration-backbone explanation with no current-version adapter promise.

6. Proof wiring
   - Owner: test/docs owner.
   - Output: snippet checks, stale-term grep, source line ledger, and slate-browser contract map.

## Fast Driver Gates

Use these during docs work:

```bash
rg -n "methods\\(|editor\\.children|editor\\.selection|editor\\.operations|editor\\.marks|xx-using|dist/slate|under construction|Editor.addMark\\(|Editor.removeMark\\(|editor\\.insertNodes\\(" /Users/zbeyens/git/slate-v2/docs
```

```bash
rg -n "renderVoid|useElementSelected|decorationSources|annotationStores|state:|tx:|applyOperations|onCommit" /Users/zbeyens/git/slate-v2/packages /Users/zbeyens/git/slate-v2/docs
```

Run package/docs typechecks only after actual docs/examples/snippet files change.

## Final Completion Gates

This review lane can be marked `done` only when:

- score is at least `0.92`
- no dimension is below `0.85`
- all public docs contradictions are inventoried or fixed in the plan
- every breaking/paradigm docs change has an accepted objection row
- collaboration docs say migration backbone, not current adapter support
- every major docs page has current source/test evidence
- browser-sensitive examples map to replayable proof rows
- pass schedule is complete
- `tmp/completion-check.md` says `done`
