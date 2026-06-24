# Plite renderElement extension DX ralplan

Status: done
Date: 2026-05-16
Owner: slate-ralplan
Runtime id: 019e1fc0-dba0-7de1-9236-b484a144cda6
Latest activation: 2026-05-17 render props versus extension-only HH feedback

## Verdict

Yes. The current examples are weird.

The problem is not that `renderElement` and `editor.extend(...)` both exist. The
problem is that first-party feature examples use `editor.extend(...)` for
schema, transforms, paste, or key behavior, then keep a raw top-level
`renderElement` dispatcher for rendering. That teaches users that rendering is
special-case React prop wiring instead of part of the feature extension.

The target is:

```txt
editor.extend(...) + editableRenderers(...) = reusable feature rendering
Editable render props = per-instance override or reference escape hatch
```

Do not hard-cut `Editable.renderElement`. Hard-cut the default teaching pattern
where a feature example owns behavior through extensions but renders through a
throwaway `Element` switch.

2026-05-17 refinement:

Do not make extension-owned rendering the only API. That is too far from Plite's
plain React contract and turns raw Plite into a plugin framework. The best shape
has one normal composition model and one escape hatch:

```txt
extension-owned editableRenderers(...) = default reusable feature rendering
Editable renderElement/renderLeaf/renderText/renderVoid = whole-surface escape hatch
```

The current all-or-nothing precedence is defensible if docs name it honestly:
when a caller passes `renderElement`, that caller owns element rendering for the
Editable. Do not present it as a small additive override that composes with
extension renderers, because live source does not do that today.

Do not add `next()` render middleware in the first architecture cut. It looks
clever, but it reintroduces callback composition into the hot render path and
makes ownership harder to teach. If real app pressure proves a partial local
override is needed, add one local typed renderer-map prop that uses the same
`EditableRenderers` shape and merges above extension maps. Do not make raw
`renderElement` itself a chainable mini-plugin system.

## Intent And Boundaries

Intent:

- decide whether first-party Plite examples should normalize around
  extension-owned rendering
- keep raw `Editable` render props available for app-local overrides
- make the example story fit the extension runtime and typed renderer future

In scope:

- example and docs consistency
- `editableRenderers(...)` renderer-map typing
- example-only helper cleanup such as fake `RenderElementPropsFor<T>`
- issue accounting for render composition pressure

Non-goals:

- no Plite source edit in this planning pass
- no removal of raw `renderElement`, `renderLeaf`, `renderText`,
  `renderSegment`, or `renderVoid`
- no Plate component registry
- no React renderer field in core `slate`
- no fixed issue claim for `#3177`, `#4317`, or `#5349`

Decision boundaries:

- reusable document feature behavior belongs to `editor.extend(...)`
- reusable document feature rendering belongs to `editableRenderers(...)`
- raw `Editable` render props are still public, but examples should present them
  as explicit whole-Editable overrides, reference snippets, tests, and stress
  harnesses
- raw render props override registered renderers for that render family; this is
  an escape-hatch boundary, not the reusable feature composition model
- paragraph rendering must remain explicit where examples need `<p>` semantics,
  because the live fallback currently renders `EditableElement` as `div` or
  `span`

## Live Current State

Renderer registration already exists.

- `packages/plite-react/src/editable/editable-renderers.ts:34-43`
  defines renderer maps for elements, leaves, text, segment, and voids.
- `packages/plite-react/src/editable/editable-renderers.ts:47-54`
  registers those maps through the `plite-react.editable.renderers` capability.
- `packages/plite-react/src/components/editable-text-blocks.tsx:1390-1404`
  reads registered renderers and disables element or void maps when raw
  `Editable` render props are supplied.
- `packages/plite-react/test/surface-contract.tsx:523-597`
  proves `Editable` consumes extension-registered element, leaf, text, segment,
  and void renderers.
- `packages/plite-react/test/surface-contract.tsx:599-635`
  proves raw `Editable` render props override extension-registered renderers.

The public type export is not the main problem.

- `packages/plite-react/src/index.ts:42-53` exports
  `EditableRenderElementProps` as `RenderElementProps`.
- `packages/plite-react/src/components/editable-text-blocks.tsx:538-559`
  shows that public element renderer props include `attributes`, `children`,
  `element`, `isInline`, and `slots`.

The fallback matters.

- `packages/plite-react/src/components/editable-text-blocks.tsx:892-898`
  falls back to `EditableElement as={inline ? 'span' : 'div'}`. If first-party
  examples cut their raw paragraph fallback, they need a registered paragraph
  renderer where `<p>` matters.

## Weird Current Examples

These examples combine extension-owned behavior with raw render props:

- `apps/www/src/app/(app)/examples/plite/_examples/check-lists.tsx:77-88` passes
  `renderElement={Element}` while `withChecklists` calls `editor.extend(...)`.
- `apps/www/src/app/(app)/examples/plite/_examples/check-lists.tsx:138-146` uses a raw switch with
  a default `<p>`.
- `apps/www/src/app/(app)/examples/plite/_examples/images.tsx:74-108` registers image schema and
  paste/key behavior through `editor.extend(...)`, but still passes
  `renderElement` and inline `renderVoid`.
- `apps/www/src/app/(app)/examples/plite/_examples/images.tsx:155-159` has a top-level `Element`
  whose only job is `<p {...attributes}>{children}</p>`.
- `apps/www/src/app/(app)/examples/plite/_examples/embeds.tsx:47-64` registers video schema with
  `editor.extend(...)`, then uses raw `renderElement` and raw `renderVoid`.
- `apps/www/src/app/(app)/examples/plite/_examples/embeds.tsx:69-73` repeats the trivial paragraph
  renderer.
- `apps/www/src/app/(app)/examples/plite/_examples/inlines.tsx:112-143` registers inline schema
  and paste/insert behavior through `editor.extend(...)`, then passes raw
  `renderElement` and `renderLeaf`.
- `apps/www/src/app/(app)/examples/plite/_examples/inlines.tsx:363-374` uses a raw switch for
  link, button, badge, and paragraph fallback.

Docs also send mixed signals:

- `content/docs/plite/libraries/slate-react/editable.md:54-58` says
  `editableRenderers(...)` is for extension-owned document rendering and raw
  props take precedence.
- `content/docs/plite/libraries/slate-react/editable.md:83-102` still leads a
  dedicated `renderElement` section with a normal-element switch.
- `content/docs/plite/walkthroughs/03-defining-custom-elements.md:81-109`
  teaches extension renderers.
- `content/docs/plite/walkthroughs/04-applying-custom-formatting.md:9-55`
  starts from a raw `renderElement` callback, then
  `content/docs/plite/walkthroughs/04-applying-custom-formatting.md:70-85`
  switches to extension renderers.

The fake example type helper is worse than the `Element` callback:

- `apps/www/src/app/(app)/examples/plite/_examples/custom-types.d.ts:188` defines
  `RenderElementPropsFor<T extends Element> = RenderElementProps<any>`.

That generic parameter is theater. It gives the appearance of per-element
typing while erasing the element type.

## Decision Brief

Chosen shape:

1. Keep raw `Editable` render props.
2. Normalize first-party feature examples to register renderers through
   `editableRenderers(...)` inside the same feature extension, or a clearly
   named example rendering extension installed beside it.
3. Add real typed renderer-map support before rewriting examples that currently
   rely on narrowing inside an `Element` switch.
4. Remove fake example typing like `RenderElementPropsFor<T> =
RenderElementProps<any>`.
5. Keep raw render props only in explicit override/reference/test/stress
   examples.

Why this wins:

- It matches the live runtime contract.
- It fits the docs direction already accepted in the PR reference.
- It avoids making app code manage renderer callback identity.
- It makes feature packages composable: schema, behavior, and renderers can move
  together.
- It still preserves Plite-close escape hatches for one `Editable` instance.

Rejected alternatives:

- Hard-cut `renderElement`: too harsh, breaks the simple app-level override
  story, and contradicts current surface-contract tests.
- Leave examples as-is: bad DX. It teaches the old dispatcher pattern while the
  runtime already has a better registered-renderer path.
- Move React renderers into core `slate`: wrong package boundary. Core must stay
  non-React.
- Rewrite examples before typing is fixed: this will replace one weird pattern
  with casts or `any`.
- Make raw render props chain through `next()`: too much middleware ceremony in
  a React hot path. It also blurs the clean rule that extension renderers compose
  and raw props override.
- Add a second local renderer API before demand is proven: not needed for the
  first cut. If partial per-Editable overrides become real, use the same
  `EditableRenderers` map shape instead of inventing another renderer model.

## HH Feedback Review: Keep Render Props, But Demote Them

Status: complete for this activation's review pass.

Harsh take: "only extensions" is the wrong correction. It solves the
two-way-story smell by deleting the Plite-ish part of Plite. A raw Plite React
editor should still let a user pass a plain React renderer without creating a
feature extension.

The real smell is examples and docs treating both surfaces as equal feature
authoring paths. They are not equal:

| User intent                                                 | Public shape                                             | Why                                                                 |
| ----------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------- |
| Reusable feature owns schema, behavior, and UI              | `editor.extend(feature())` plus `editableRenderers(...)` | Feature pieces move together and merge by element/leaf/void type.   |
| One editor surface wants total custom rendering             | `<Editable renderElement={...} renderLeaf={...} />`      | Plite-close escape hatch; caller knowingly owns that render family. |
| One-off demo or test probes render internals                | raw render props                                         | Lowest friction and closest to React.                               |
| Partial local override while preserving extension renderers | not in first cut                                         | Add a local `renderers` map only if real demand appears.            |

Live source makes the distinction concrete:

- `packages/plite-react/src/editable/editable-renderers.ts:34-54`
  stores extension renderers as maps keyed by element/leaf/void names.
- `packages/plite-react/src/components/editable-text-blocks.tsx:1398-1405`
  keeps registered leaf/text/segment renderers unless raw props are supplied,
  and disables element/void maps when `renderElement` or `renderVoid` is passed.
- `packages/plite-react/src/components/editable-text-blocks.tsx:856-865`
  resolves a node renderer from either the raw prop or the typed extension map.
- `packages/plite-react/test/surface-contract.tsx:523-635`
  already proves both registered renderer consumption and raw-prop override
  behavior.

Architecture rule:

```txt
There is one composable renderer registry.
Extensions contribute to it.
Raw Editable render props bypass it for that render family.
```

That gives users a clear mental model without pretending there is only one
installation site. "One architecture, two ownership scopes" is better than
"everything must be an extension" and better than "every example writes a
switch".

External-editor synthesis still backs this:

- ProseMirror proves powerful view escape hatches are useful, but NodeViews are
  too imperative as the default React authoring path.
- Lexical proves runtime-owned reconciliation matters, but node subclasses are
  too heavy for Plite's public node API.
- Tiptap proves extension packaging is the best reusable feature story, while
  its React NodeView layer is not the rendering model to copy.
- The accepted local research target remains spec-first extensions,
  runtime-owned DOM shells, and app-owned visible React renderers.

## Target Example Shape

The examples should converge on this shape:

```tsx
const checklists = defineEditorExtension({
  name: "checklists",
  capabilities: editableRenderers({
    elements: {
      paragraph: ParagraphElement,
      "check-list-item": CheckListItemElement,
    },
  }),
  transforms: {
    deleteBackward({ editor, next }) {
      if (applyChecklistBackspaceStart(editor)) return;

      next();
    },
  },
});

const CheckListsExample = () => {
  const editor = usePliteEditor({
    initialValue,
    withEditor: (editor) => {
      editor = withHistory(editor);
      editor.extend(checklists);
      return editor;
    },
  });

  return (
    <Plite editor={editor}>
      <Editable autoFocus placeholder="Get to work..." spellCheck />
    </Plite>
  );
};
```

The important part is that the reusable checklist renderer is installed through
the checklist extension, not passed as a raw `Editable` callback. Live source
shows `editor.extend(...)` returns a cleanup function, so examples should not
teach fluent chaining.

## Required Type-DX Pass

Before mass example rewrite, fix renderer typing so keyed element renderers get
their narrowed element props.

Typed renderer-map target:

```ts
type ElementTypeOf<TElement> = TElement extends {
  type: infer TType extends string;
}
  ? TType
  : string;

type ElementForType<TElement, TType extends string> = Extract<
  TElement,
  { type: TType }
> extends never
  ? TElement
  : Extract<TElement, { type: TType }>;

export type EditableElementRendererMap<TElement extends Element = Element> = {
  [K in ElementTypeOf<TElement>]?: RenderElementRenderer<
    ElementForType<TElement, K>
  >;
};

export type EditableVoidRendererMap<TElement extends Element = Element> = {
  [K in ElementTypeOf<TElement>]?: RenderVoidRenderer<
    ElementForType<TElement, K>
  >;
};
```

Then `EditableRenderers<T, TElement>` should use those maps:

```ts
type EditableRenderers<T = unknown, TElement extends Element = Element> = {
  elements?: EditableElementRendererMap<TElement>;
  leaves?: Record<string, EditableLeafRenderer<T>>;
  segment?: EditableSegmentRenderer<T>;
  text?: EditableTextRenderer;
  voids?: EditableVoidRendererMap<TElement>;
};
```

If TypeScript cannot infer cleanly from the current `editableRenderers(...)`
signature, use a curried helper or a `satisfies`-friendly exported type. Do not
invent a second renderer system.

Preferred first attempt:

```ts
editableRenderers<unknown, CustomElement>({
  elements: {
    "check-list-item": CheckListItemElement,
    paragraph: ParagraphElement,
  },
});
```

If generic arguments at every call site feel noisy, add a narrow helper such as
`defineEditableRenderers<CustomElement>()({...})`. Do not add it unless the type
test proves the generic call is too clumsy.

Example cleanup rule:

- delete `RenderElementPropsFor<T> = RenderElementProps<any>`
- prefer inferred props inside keyed renderer maps
- use explicit `RenderVoidProps<ImageElement>` only when it documents a
  content-only void renderer and inference cannot express it cleanly

## Execution Plan For Ralph

1. Type pass:

   - improve renderer-map typing for keyed element and void renderers
   - add public type contract coverage for keyed renderer props
   - remove or replace fake example aliases

2. Example pass:

   - convert feature examples that call `editor.extend(...)` to register
     reusable renderers with `editableRenderers(...)`
   - register paragraph renderers where examples need `<p>` output
   - remove trivial `const Element = (props: RenderElementProps) => <p ... />`
     components from feature examples
   - whitelist raw render props for reference, override, browser-harness, and
     rendering-strategy demos

3. Docs pass:

   - make renderer extensions the first teaching path everywhere
   - keep raw `renderElement` docs under escape hatch or per-instance override
   - fix the formatting walkthrough so it does not start from the old raw
     dispatcher pattern

4. Proof pass:
   - run focused `plite-react` surface contracts
   - run typecheck for the touched Plite packages/examples
   - run browser smoke for rewritten examples
   - add a docs/example guard that catches new feature examples combining
     `editor.extend(...)` with non-whitelisted raw render props

## Typed Renderer-Map Design Pass

Status: complete.

Decision:

- use keyed element and void renderer maps
- infer each renderer prop from the discriminated `element.type`
- keep untyped/base `Element` fallback valid
- keep runtime storage and merge behavior unchanged
- do not create a second renderer registration API unless type tests prove the
  generic `editableRenderers<unknown, CustomElement>(...)` form is too noisy

Design constraints:

- current runtime reads renderer maps by string type, so the type layer should
  not change runtime data shape
- `Element` may not always expose a typed `type` property, so the helper needs a
  string fallback
- void renderers should get the same keyed narrowing as element renderers
- leaf renderer typing is separate and should not block the element/void cleanup

Required tests for Ralph:

- keyed element renderer receives the narrowed element shape
- wrong property access on the wrong keyed renderer fails at type level
- keyed void renderer receives the narrowed element shape
- base `Element` consumers can still pass arbitrary string renderer maps
- raw `Editable renderElement` override precedence stays unchanged
- extension-registered element, leaf, text, segment, and void renderer contract
  stays green

High-risk pass:

- trigger: public type surface and first-party examples
- blast radius: `plite-react` renderer types, example renderer code, docs
- pre-mortem:
  - keyed map typing gets too clever and hurts normal inference
  - examples lose `<p>` output if paragraph renderer registration is skipped
  - raw prop override docs become unclear and users think render props are
    deprecated
- mitigation:
  - type tests before example rewrite
  - explicit paragraph renderer registration in examples that need paragraph DOM
  - keep `Editable` reference docs for raw render props
- verdict: keep.

## Issue Accounting

`#3177` is directly related. The live runtime already has plugin/extension-owned
renderer registration, but current examples still under-teach it. This plan
does not claim `Fixes #3177` or `Improves #3177`.

`#5349` stays blocked on repro. This plan does not prove render churn on empty
editors.

`#4317` stays related pressure only. Registered renderers reduce callback
identity pressure, but the exact `onSelect` render-callback repro still needs
browser proof.

## Steelman

Objection: raw `renderElement` is the classic Plite mental model, so examples
should keep showing it.

Answer: keep it in the `Editable` reference and override docs. Do not teach it
as the normal feature-package pattern when the same example already uses
`editor.extend(...)` for schema and behavior.

Objection: extension renderers can become more ceremony for simple apps.

Answer: simple app-local overrides can still use raw props. Reusable document
features should pay the tiny extension cost because that is how they compose.

Objection: typed renderer maps are not ready.

Answer: correct. That is why the type-DX pass comes first. Rewriting examples
with casts would be fake polish.

## Score

Total: 0.92. The architecture verdict is strong enough for Ralph execution, and
the later closure activation found no remaining Ralplan pass with a runnable
planning move.

| Dimension                              | Score | Evidence                                                                                                                                                                                                                                                                   |
| -------------------------------------- | ----: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React runtime performance              |  0.92 | Registered renderers are editor-owned and raw props disable maps only when explicitly supplied: `packages/plite-react/src/components/editable-text-blocks.tsx:1398-1405`; rejecting `next()` middleware avoids new render-path callback chains.              |
| Plite-close unopinionated DX           |  0.94 | Raw render props remain public and tested as override escape hatches: `packages/plite-react/test/surface-contract.tsx:599-635`; typed maps remove fake example typing without removing the escape hatch.                                                     |
| Plate and slate-yjs migration backbone |  0.91 | Research target keeps feature package ownership together without requiring current Plate API compatibility: `docs/research/decisions/editor-node-dx-should-use-runtime-owned-shells-and-spec-first-renderers.md:176-186`.                                                  |
| Regression-proof testing strategy      |  0.92 | Plan names type contracts, surface-contract preservation, docs/example guard, and browser smoke for rewritten examples. Existing surface tests cover registered renderers and override precedence: `packages/plite-react/test/surface-contract.tsx:523-635`. |
| Research evidence completeness         |  0.91 | Corpus result favors spec-first extension APIs plus runtime-owned DOM and app-owned React renderers: `docs/research/sources/editor-architecture/node-text-mark-render-dx-corpus-ledger.md:200-215`; no new external source read was needed for this scoped review.         |
| shadcn-style composability             |  0.93 | Target preserves normal React components for visible UI and keeps runtime browser ownership separate: `docs/research/systems/editor-node-text-mark-dx-landscape.md:21-30`.                                                                                                 |

## Current Pass State

current_pass: closure-final-gates
current_pass_status: complete
completed_passes:

- current-state-read
- intent-boundary-and-decision-brief
- related-issue-accounting
- typed-renderer-map-design
- steelman-pass
- high-risk-deliberate-pass
- closure-final-gates
- render-prop-vs-extension-architecture-review

skipped_this_activation:

- browser proof: skipped, planning-only markdown/state update
- package typecheck: skipped, no TypeScript/source edits
- implementation TDD: skipped, no implementation allowed in this skill
- issue claim pass: skipped, no `Fixes #...` or behavior claim

final_handoff_status: complete
next_pass: none
next_action: none
next_owner: ralph execution only if the user chooses implementation
