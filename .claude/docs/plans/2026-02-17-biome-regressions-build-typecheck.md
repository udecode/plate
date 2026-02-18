---
title: Biome Regressions - Build + Typecheck Snapshot
type: fix
date: 2026-02-17
---

# Biome Regressions - Build + Typecheck Snapshot

## Commands Run

- `yarn install`
- `yarn turbo build --filter=@platejs/markdown --filter=@platejs/excalidraw --filter=@platejs/math --filter=www --only --continue=always`
- `yarn turbo typecheck --continue=always --output-logs=errors-only`

## Build Assessment (4 packages)

All 4 fail. These are pre-existing on `staging`.

- `@platejs/markdown`: babel parse error in `node_modules/unified/lib/index.d.ts` (`Identifier 'unified' has already been declared`)
- `@platejs/math`: 60 `UNLOADABLE_DEPENDENCY` errors (KaTeX font assets)
- `@platejs/excalidraw`: unresolved imports in Excalidraw d.ts (`./ContextMenu.scss`, `./locales/en.json`)
- `www`: cannot resolve `@excalidraw/excalidraw/index.css`

## Typecheck Snapshot

Result: `47/54` pass, `7` fail.

Biome-type/interface regressions (new):

- `packages/cursor/src/types.ts:11`: `CursorData` no index signature; fails `UnknownObject` constraint
- `packages/selection/src/react/types.ts:11`: `CursorData` no index signature; fails `UnknownObject` constraint
- `packages/selection/src/internal/types.ts:76`: `SelectionEvents` no index signature; fails `EventMap` constraint
- `packages/media/src/lib/placeholder/transforms/setMediaNode.ts:3`: `props` no index signature; fails `setNodes` arg constraint
- `packages/ai/src/react/ai-chat/internal/types.ts:11`: `MessageDataPart` no index signature; fails `UIDataTypes` constraint

Pre-existing typecheck failures (not Biome interface conversion):

- `@udecode/cmdk`: `TS7016` for `use-sync-external-store/shim/index.js`
- `@platejs/yjs`: `HocuspocusProviderConfiguration` mismatch (`broadcast` / `connect`)
- `www`: unresolved `@excalidraw/excalidraw/index.css`

## Fix Pattern For Biome Regressions

When a type participates in `UnknownObject` / `Record<string, unknown>` / map-style constraints, do not auto-convert to plain interface.

Preferred:

```ts
type X = {
  foo?: string;
} & Record<string, unknown>;
```

Or if interface needed:

```ts
interface X {
  [key: string]: unknown;
  foo?: string;
}
```

