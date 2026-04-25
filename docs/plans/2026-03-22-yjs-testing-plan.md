---
title: Yjs Testing Plan
type: testing
date: 2026-03-22
status: active
---

# Yjs Testing Plan

## Goal

Add high-value non-React coverage for `@platejs/yjs` without doing dumb wrapper vanity tests.

This package currently has:

- zero runtime specs
- nine non-React runtime files with score `10`
- one huge orchestration hotspot in [BaseYjsPlugin.ts](packages/yjs/src/lib/BaseYjsPlugin.ts)

## Scope

- [BaseYjsPlugin.ts](packages/yjs/src/lib/BaseYjsPlugin.ts)
- [registry.ts](packages/yjs/src/lib/providers/registry.ts)
- [hocuspocus-provider.ts](packages/yjs/src/lib/providers/hocuspocus-provider.ts)
- [webrtc-provider.ts](packages/yjs/src/lib/providers/webrtc-provider.ts)
- [withPlateYjs.ts](packages/yjs/src/lib/withPlateYjs.ts)
- [slateToDeterministicYjsState.ts](packages/yjs/src/utils/slateToDeterministicYjsState.ts)

## Explicit Non-Goals

- no `/react` work
- no browser or e2e work
- no one-file-one-smoke-test sweep
- no direct tests for barrels or `types.ts`
- no direct specs for `withTYjs`, `withTCursors`, or `withTYHistory` unless they still lack honest coverage after `withPlateYjs` and `BaseYjsPlugin`

## Findings

- There are no existing Yjs specs at all.
- The highest-value runtime seams are:
  - provider lifecycle wrappers
  - provider registry behavior
  - deterministic initial document seeding
  - `BaseYjsPlugin` `init`, `connect`, `disconnect`, and `destroy`
  - `withPlateYjs` composition order and branch behavior
- The README is not trustworthy as test source of truth. It talks about `providerConfigs`, `customProviders`, and `waitForAllProviders`, while the runtime source exposes `providers` and does not implement that README shape here. Tests should follow source, not docs fanfic.
- [BaseYjsPlugin.ts](packages/yjs/src/lib/BaseYjsPlugin.ts) silently swallows provider creation failures. That may be defensible, or it may be a bug. Do not paper over it with fuzzy tests.
- [slateToDeterministicYjsState.ts](packages/yjs/src/utils/slateToDeterministicYjsState.ts) uses `window.crypto.subtle` directly. In Bun this may be fine, but if it is not, that is a real compatibility seam worth testing and fixing.

## Test Strategy

- Use pure unit tests for:
  - deterministic Yjs state generation
  - registry behavior
  - provider wrapper state transitions
- Use thin plugin contract tests for:
  - `BaseYjsPlugin` editor API and init orchestration
  - `withPlateYjs` composition order and conditional cursor wiring
- Prefer `createSlateEditor` for plugin tests.
- Prefer plain objects and module spies for provider doubles.
- Avoid mounting React or importing app registries.

## Ordered Slices

### Slice 1: Deterministic Seed + Registry

Best first slice. Cheap, deterministic, high signal.

- Files:
  - [slateToDeterministicYjsState.ts](packages/yjs/src/utils/slateToDeterministicYjsState.ts)
  - [registry.ts](packages/yjs/src/lib/providers/registry.ts)
- Add:
  - [slateToDeterministicYjsState.spec.ts](packages/yjs/src/utils/slateToDeterministicYjsState.spec.ts)
  - [registry.spec.ts](packages/yjs/src/lib/providers/registry.spec.ts)
- Cases:
  - same `guid` + same nodes produce bit-identical updates
  - different `guid` or nodes produce different updates
  - produced update decodes into the expected shared `content` state
  - `createProvider` returns the registered class
  - unknown provider type throws a clear error
  - `registerProviderType` overrides or extends the registry intentionally
- Notes:
  - if `window.crypto.subtle` needs a shim in Bun, isolate that in the spec helper and treat missing support as a real compatibility finding

### Slice 2: Provider Wrappers

Second slice. Still cheap. Still real value.

- Files:
  - [hocuspocus-provider.ts](packages/yjs/src/lib/providers/hocuspocus-provider.ts)
  - [webrtc-provider.ts](packages/yjs/src/lib/providers/webrtc-provider.ts)
- Add:
  - [hocuspocus-provider.spec.ts](packages/yjs/src/lib/providers/hocuspocus-provider.spec.ts)
  - [webrtc-provider.spec.ts](packages/yjs/src/lib/providers/webrtc-provider.spec.ts)
- Cases for Hocuspocus:
  - passes `doc` and `awareness` through when provided
  - creates websocket wrapper when `wsOptions` is present
  - reports websocket-construction failure via `onError`
  - `onConnect` flips `isConnected`
  - `onSynced` flips `isSynced` and only emits sync change on the first transition
  - `onDisconnect` clears connect and sync state and emits sync false once
  - constructor fallback path creates a non-connecting provider and surfaces `onError`
  - `disconnect` and `destroy` are safe no-ops when already disconnected
- Cases for WebRTC:
  - uses provided `doc` or creates one
  - `status: { connected: true }` emits connect once and marks synced true
  - `status: { connected: false }` emits disconnect and sync false only when previously connected
  - `disconnect` clears both flags and emits sync false if needed
  - constructor failure calls `onError` and leaves the wrapper non-throwing
  - `connect`, `disconnect`, and `destroy` swallow provider-side throws without crashing
- Harness:
  - mock constructor classes from `@hocuspocus/provider` and `y-webrtc`
  - capture event handlers from the fake provider instance

### Slice 3: `withPlateYjs` Composition

Third slice. Worth it because this file contains real branching and composition, unlike the one-line wrappers under it.

- File:
  - [withPlateYjs.ts](packages/yjs/src/lib/withPlateYjs.ts)
- Add:
  - [withPlateYjs.spec.ts](packages/yjs/src/lib/withPlateYjs.spec.ts)
- Cases:
  - chooses `sharedType` from options when provided
  - falls back to `ydoc.get('content', Y.XmlText)` when no custom shared type exists
  - calls `withTYjs` first with `autoConnect: false`
  - calls `withTCursors` only when `cursors` is enabled and `awareness` exists
  - respects `cursors.autoSend === false`
  - logs a debug error instead of wiring cursors when `awareness` is missing
  - always applies `withTYHistory` last
- Deliberate skip:
  - do not add separate direct specs for [withTYjs.ts](packages/yjs/src/lib/withTYjs.ts), [withTCursors.ts](packages/yjs/src/lib/withTCursors.ts), or [withTYHistory.ts](packages/yjs/src/lib/withTYHistory.ts) unless coverage after this slice still lies in a way that matters

### Slice 4: `BaseYjsPlugin` Editor API

Fourth slice. This is the core of the package.

- File:
  - [BaseYjsPlugin.ts](packages/yjs/src/lib/BaseYjsPlugin.ts)
- Add:
  - [BaseYjsPlugin.api.spec.ts](packages/yjs/src/lib/BaseYjsPlugin.api.spec.ts)
- Cases:
  - default extension creates `ydoc` and `awareness` when omitted
  - `connect()` connects all providers
  - `connect('webrtc')` and `connect(['webrtc', 'hocuspocus'])` filter correctly
  - thrown provider `connect()` errors go to `onError`
  - `disconnect()` disconnects connected providers in reverse order
  - typed disconnect filters correctly
  - `destroy()` only destroys connected providers and still calls `YjsEditor.disconnect`
  - `destroy()` swallows disconnect errors instead of exploding cleanup

### Slice 5: `BaseYjsPlugin` Init Orchestration

Fifth slice. Highest value, highest harness cost.

- File:
  - [BaseYjsPlugin.ts](packages/yjs/src/lib/BaseYjsPlugin.ts)
- Add:
  - [BaseYjsPlugin.init.spec.ts](packages/yjs/src/lib/BaseYjsPlugin.init.spec.ts)
- Cases:
  - throws when `providers` is empty
  - turns provider configs into instantiated providers
  - preserves pre-instantiated custom providers in `_providers`
  - `autoConnect: false` skips provider connection
  - `autoConnect: true` connects all providers
  - waits for first sync transition but does not hang forever if sync never arrives
  - when shared content is empty and `value` is an array, seeds initial content
  - when `value` is a string, uses `editor.api.html.deserialize`
  - when `value` is an async function, awaits it
  - when provided value is empty, falls back to `editor.api.create.value()`
  - custom `sharedType` path uses delta insertion
  - default path uses [slateToDeterministicYjsState.ts](packages/yjs/src/utils/slateToDeterministicYjsState.ts) plus `Y.applyUpdate`
  - pre-populated shared content skips initial seeding
  - connects `YjsEditor` only after the provider sync window
  - calls `editor.tf.init` with `shouldNormalizeEditor: false`
  - triggers `editor.api.onChange()`
  - calls `onReady` with the async flag and final children
- Harness:
  - use `createSlateEditor` with the plugin configured
  - spy on `createProvider`, `YjsEditor.connect`, `Y.applyUpdate`, and editor APIs
  - keep provider doubles tiny and explicit

## File Plan

Expected new runtime specs:

- [slateToDeterministicYjsState.spec.ts](packages/yjs/src/utils/slateToDeterministicYjsState.spec.ts)
- [registry.spec.ts](packages/yjs/src/lib/providers/registry.spec.ts)
- [hocuspocus-provider.spec.ts](packages/yjs/src/lib/providers/hocuspocus-provider.spec.ts)
- [webrtc-provider.spec.ts](packages/yjs/src/lib/providers/webrtc-provider.spec.ts)
- [withPlateYjs.spec.ts](packages/yjs/src/lib/withPlateYjs.spec.ts)
- [BaseYjsPlugin.api.spec.ts](packages/yjs/src/lib/BaseYjsPlugin.api.spec.ts)
- [BaseYjsPlugin.init.spec.ts](packages/yjs/src/lib/BaseYjsPlugin.init.spec.ts)

Optional helper-only files under `__tests__/` are fine if repeated doubles become noisy, but keep them package-local and tiny.

## Deliberate Deferrals

- no direct spec for [types.ts](packages/yjs/src/lib/providers/types.ts)
- no compile-only type lane in the first pass
  - reason: runtime debt is absolute zero right now, so that is the obvious spend
  - exception: if execution exposes broken discriminated-union typing around provider configs, add one narrow type fixture then
- no direct `react` plugin coverage
- no README example tests

## Verification Plan

Targeted first:

- `bun test packages/yjs/src/utils/slateToDeterministicYjsState.spec.ts packages/yjs/src/lib/providers/registry.spec.ts packages/yjs/src/lib/providers/hocuspocus-provider.spec.ts packages/yjs/src/lib/providers/webrtc-provider.spec.ts packages/yjs/src/lib/withPlateYjs.spec.ts packages/yjs/src/lib/BaseYjsPlugin.api.spec.ts packages/yjs/src/lib/BaseYjsPlugin.init.spec.ts`
- `bun test packages/yjs/src`
- `bun run test:slowest -- --top 15 packages/yjs/src`

Package verification:

- `pnpm install`
- `pnpm turbo build --filter=./packages/yjs`
- `pnpm turbo typecheck --filter=./packages/yjs`
- `pnpm lint:fix`

Fallback if workspace-built exports bite:

- `pnpm build`
- `pnpm turbo typecheck --filter=./packages/yjs`

## Done Criteria

- Yjs has real runtime coverage on provider lifecycle, registry, deterministic state seeding, plugin init, and composition wiring.
- We do not add fake direct tests for files whose behavior is already honestly proven through higher-value seams.
- The package verifies cleanly through the repo’s build-first typecheck path.

## First Slice I’d Execute

Do Slice 1 and Slice 2 first.

Reason:

- highest signal
- lowest harness complexity
- they give immediate leverage for the later `BaseYjsPlugin` tests
- if those two slices reveal API drift or provider-constructor weirdness, better to discover that before touching the big orchestration file
