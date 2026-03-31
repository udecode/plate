---
title: Yjs slow tests need explicit Bun paths and bootstrapped shared types
category: test-failures
date: 2026-03-22
tags:
  - yjs
  - bun
  - tests
  - collaboration
  - sharedType
---

# Yjs slow tests need explicit Bun paths and bootstrapped shared types

## Problem

The new opt-in Yjs collaboration suite looked green on paper and still failed in two stupidly non-obvious ways.

First, Bun refused to run `*.slow.ts` files when the runner passed them as bare filters instead of explicit paths.

Second, the nested `sharedType` collaboration fixture silently tested an impossible setup by creating a fresh `editors.main` `Y.XmlText` independently on each peer.

## Root Cause

Bun test discovery only auto-runs `*.spec.*` and `*.test.*` patterns. When you hand Bun a non-discovered filename like `packages/yjs/src/.../index.slow.ts`, it still treats that string as a test filter unless the argument is an explicit path such as `./packages/.../index.slow.ts`.

The nested `sharedType` issue was a Yjs structure problem, not a Plate bug. If two separate docs each create their own `editors.main` shared type before syncing, Yjs treats those as competing structures. The remote peer keeps its local empty type instead of magically merging the content into it.

## Solution

The slow runner now normalizes matched files to explicit paths before spawning Bun:

```js
const explicitPaths = selectedFiles.map((file) =>
  file.startsWith('/') || file.startsWith('./') ? file : `./${file}`
);
```

That keeps slow tests out of normal `bun test` discovery while still letting `pnpm test:slow -- packages/yjs/src` execute them directly.

The nested `sharedType` fixture now bootstraps both peers from the same empty parent-doc structure first:

```ts
const bootstrap = createNestedParentDoc();
const templateUpdate = Y.encodeStateAsUpdate(bootstrap.parentDoc);

const first = createNestedParentDoc(templateUpdate);
const second = createNestedParentDoc(templateUpdate);
```

That means both peers start with the same `editors.main` shared type identity graph, so later content sync hits the nested `sharedType` instead of disappearing into a map conflict.

## Prevention

- If a Bun runner targets non-discovered filenames, pass `./relative/path` or an absolute path. Bare strings are filter bait.
- For Yjs nested-doc collaboration tests, bootstrap the shared structure once and copy it with `Y.encodeStateAsUpdate` and `Y.applyUpdate` before connecting peers.
- Do not treat `yTextToSlateElement(emptyXmlText)` returning `[{ text: '' }]` as seeded content. Check `sharedType.length` when the real question is whether content was inserted.
