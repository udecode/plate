# Component Audit

These are the strongest patterns to copy from the current repo.

## Good package extraction

### Media

- App: [media-image-node.tsx](apps/www/src/registry/ui/media-image-node.tsx)
- Package: [useMediaState.ts](packages/media/src/react/media/useMediaState.ts)

Why it works:

- package hook owns real media/editor state
- app still composes the toolbar, caption, resize handles, and shadcn-style UI

### TOC

- App: [toc-node.tsx](apps/www/src/registry/ui/toc-node.tsx)
- Package: [useTocElement.ts](packages/toc/src/react/hooks/useTocElement.ts)

Why it works:

- package hook owns a stable navigation contract
- app still renders the rows and local button styling

### Equation

- App: [equation-node.tsx](apps/www/src/registry/ui/equation-node.tsx)
- Package: [useEquationElement.ts](packages/math/src/react/hooks/useEquationElement.ts)

Why it works:

- package hook does one durable thing: KaTeX rendering effect
- app owns popover composition and local UI

## Cross-platform direction

### 10tap reference

- `../10tap-editor/src/types/EditorBridge.ts`
- `../10tap-editor/src/bridges/core.ts`
- `../10tap-editor/src/RichText/useEditorBridge.tsx`

What to copy:

- stable command/state contract below UI
- extension-owned capability model

What not to copy literally:

- monolithic bridge as the only API
- package-owned UI composition

## Good base/live split

- [footnote-base-kit.tsx](apps/www/src/registry/components/editor/plugins/footnote-base-kit.tsx)
- [footnote-kit.tsx](apps/www/src/registry/components/editor/plugins/footnote-kit.tsx)
- [math-base-kit.tsx](apps/www/src/registry/components/editor/plugins/math-base-kit.tsx)
- [math-kit.tsx](apps/www/src/registry/components/editor/plugins/math-kit.tsx)

Copy this pattern for new surfaces with static + live renderers.

## Good direct editor access

- [comment-node.tsx](apps/www/src/registry/ui/comment-node.tsx)
- [link-node.tsx](apps/www/src/registry/ui/link-node.tsx)

Copy:

- `useEditorPlugin(plugin)` when the whole file is plugin-centric
- `editor.getApi(plugin)` / `editor.getTransforms(plugin)` when that is simpler

## Registry wiring reminders

- [registry-kits.ts](apps/www/src/registry/registry-kits.ts)
- [registry-examples.ts](apps/www/src/registry/registry-examples.ts)

Do not forget style deps like `highlight-style` when a component or example uses
shared highlight tokens.

## Current caution area

There are components in the repo that probably extracted too much into package
hooks for one UI surface. Treat that as a warning, not a precedent.

Default stance:

- extract semantics
- keep shadcn composition open

Major-release stance:

- React package hooks that mostly return renderer-specific UI props/state are
  migration debt
- future work should avoid them even if older code still contains them
