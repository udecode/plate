---
title: Rendering, decorations and overlays, part 2
type: source
status: partial
source_refs:
  - docs/plans/2026-10-24-research-loop.md
updated: 2026-10-25
---

# Rendering, decorations and overlays, part 2

## Rendering

- **Transient feedback needs both mounted-view identity and root-local node identity.** Moving navigation feedback out of model updates fixed sibling views flashing together and read-only views rejecting presentation. Initial production adoption still accepted a key from another content root; the root-boundary regression caught that omission. Current `packages/platejs/src/react/plugins/navigation-feedback/NavigationFeedbackPlugin.ts` keeps its target and timer in a WeakMap keyed by the mounted editor, resolves the NodeKey through that editor's node read, and publishes through `useViewElementAttributes`. Its colocated spec covers calling-view isolation, read-only feedback, foreign roots, movement, deletion and retirement. Source: `c70bacbd4a:docs/plans/2026-09-09-navigation-feedback-api.md:87-89`. Limit: package source and test definitions were read; no fresh browser result is claimed.

- **Portal geometry does not prove portal paint.** The #5088 investigation found a 100×78 selection rectangle and two selected blocks, but the rectangle had a transparent background and zero border. EditorContainer descendant selectors could not style a portal mounted under `document.body`. Check paint on the actual portal during the drag and supply its presentation directly. Source: `c70bacbd4a:docs/plans/5064-reporter-retest-iteration.md:494-496`. The old Selection API is gone; current `packages/platejs/src/react/components/NodeSelection.tsx:911` portals the rectangle into the editable document's body, and `apps/www/src/registry/components/editor/editor.tsx:136` supplies its border and background classes.

- **Toolbar focus preservation and owned-popup lifetime need separate proof.** In #5085, Bold passed while Comment and Turn Into failed through different control paths. Preventing mouse focus transfer repaired the shared button behavior, but a popup also needed its trigger owner to survive legitimate outside focus. Current `apps/www/src/registry/bases/radix/toolbar.tsx:123` composes mousedown prevention with the caller handler; `components/editor/toolbar-overlay.tsx` tracks owned overlays from ARIA trigger state; and `floating-toolbar.tsx:137` stays open for an owned overlay. Source: `docs/plans/5085-toolbar-focus-execution.md:437-441`. Verify distinct control families and the next popup interaction; a green mark button does not prove menus or composers. The repair belongs to Plate UI and does not justify weakening Plite's outside-focus behavior.

- **Hide an empty caption without changing its mounted DOM lifetime.** File selection followed by TOC and text interaction exposed a React `removeChild` failure at `figcaption`. The repair kept the caption mounted, changed visibility through native `hidden`, and preserved the existing React children contract. Source: `c70bacbd4a:docs/plans/2026-08-31-file-caption-click-regression-closure.md:499`, with the exact baseline failure and browser proof recorded at lines 530-543. Current `apps/www/src/registry/components/editor/caption.tsx:98-122` still renders one unconditional `figcaption` with `hidden={hidden}` and `{children}`. This explains the mounted-caption repair; it does not establish a general ban on conditional rendering.

- **View-only controls subscribe to view state.** The Playground mode UI stayed stale because it observed document commits while the relevant state belonged to the view. Current `apps/www/src/registry/components/editor/mode-toolbar-button.tsx:72` reads read-only state through `useEditorViewState`; `packages/plitejs/src/react/hooks/use-editor-view-state.ts:23` subscribes through `subscribeEditorViewState`. Source: `c70bacbd4a:docs/plans/2026-09-12-playground-chrome-startup-regression.md:564`. Use the publisher for the selected state; document publication alone does not cover focus, composition or read-only changes.

- **An abandoned render must not publish a selector.** July's API execution found that render-time callback and data writes could escape work React abandoned. Publish selectors and change filters after commit, then catch up when subscribing or changing the filter. Current `packages/plitejs/src/react/hooks/use-generic-selector.tsx` commits its selector in a layout effect and rejects stale render snapshots; `use-editor-selector.tsx` commits `shouldUpdate` and updates after subscribing. `packages/plitejs/test/react/provider-hooks-contract.tsx:628,738,792` covers abandoned filter, selector and provider-callback renders. Source: `c70bacbd4a:docs/plans/2026-07-22-execute-agent-native-api-shapes.md:398-401`. These owners and tests were inspected, not rerun.

## Copied UI composition

- **A compact popover form must remove its nested inputs' shared styles locally.** The link popup inherited the shared Input's shadow, and wrapper padding inset its divider even though the rows already owned their spacing. The fix keeps the outer popover surface, applies shadow-none to both nested inputs, and removes outer padding only in insert/edit-input modes; button mode retains its padding. Those classes remain in apps/www/src/registry/components/editor/link.tsx:428,440,473,484. Fixing the shared Input or global popover styles would change ordinary controls outside this composition. Source: docs/plans/2026-08-26-fix-link-popover-row-styling.md:262-284.

## Floating placement

- **An unresolved floating control must remain measurable while hidden.** The link toolbar flashed at the viewport origin because its copied adapter exposed Floating UI's initial coordinates before isPositioned became true. Hiding that unresolved open control with display:none broke the dimensions needed for its first placement. Use the placement owner's readiness flag with visibility:hidden; reserve display:none for closed controls or absent geometry. The replacement adapter preserves this distinction in apps/www/src/registry/hooks/use-floating-rect.ts:64-76. The historical hook name use-widget-floating is retired. Source: docs/plans/2026-08-31-fix-link-floating-first-frame.md:304-337.
