---
module: Plate UI Registry
date: 2026-04-05
problem_type: developer_experience
component: tooling
symptoms:
  - "`Validate Registry` failed in `templates/plate-playground-template` with `Argument of type '\"chatOptions\"' is not assignable to parameter of type '\"state\"'`"
  - "The app source typechecked locally, but the generated template narrowed `usePluginOption(...)` to a key union that no longer included plugin option keys"
root_cause: wrong_api
resolution_type: code_fix
severity: medium
tags:
  - registry
  - templates
  - typescript
  - platejs
  - usepluginoption
  - plugin-state
  - ci
---

# Registry-generated templates may lose plugin option key typing

## Problem

A registry source file can typecheck in `apps/www` while the generated template fails in `Validate Registry`.

This happened in [`use-chat.ts`](/Users/felixfeng/Desktop/repos/plate/apps/www/src/registry/components/editor/use-chat.ts) after reading `chatOptions` with `usePluginOption(aiChatPlugin, 'chatOptions')`.

## Symptoms

- `next build` in `templates/plate-playground-template` failed with:

```text
Argument of type '"chatOptions"' is not assignable to parameter of type '"state"'
```

- The generated template file still came from the current registry source, so the failure was not caused by committed `templates/**` drift.

## What Didn't Work

### 1. Treating the failure like template drift

Removing local `templates/**` diffs was the right cleanup step, but it did not solve the real problem.

`Validate Registry` regenerates templates on the runner. If the registry source produces invalid template code, CI still fails even when the PR does not touch `templates/**`.

### 2. Reading plugin options through a plugin-specific option key

This source code looked fine locally:

```ts
const options = usePluginOption(aiChatPlugin, 'chatOptions');
```

But the generated template lost the narrower plugin option key typing, so `usePluginOption(...)` only accepted `'state'`.

## Solution

Read the plugin state, then access `chatOptions` from that state object instead of asking `usePluginOption(...)` for `'chatOptions'` directly.

In [`use-chat.ts`](/Users/felixfeng/Desktop/repos/plate/apps/www/src/registry/components/editor/use-chat.ts):

```ts
const aiChatState = usePluginOption(aiChatPlugin, 'state') as
  | { chatOptions?: PluginChatOptions }
  | undefined;
const options = aiChatState?.chatOptions;
```

Update the hook regression in [`use-chat.slow.tsx`](/Users/felixfeng/Desktop/repos/plate/apps/www/src/registry/components/editor/use-chat.slow.tsx) to mock `state.chatOptions` instead of returning a bare options object.

## Why This Works

The template generation path preserved access to plugin `state`, but it did not preserve the narrower plugin option key union that exists in the app source.

Reading from `'state'` keeps the access on a key the generated template type surface still recognizes. Pulling `chatOptions` off that returned state object avoids the brittle key-level generic path.

## Prevention

- When a registry component needs plugin-owned configuration, prefer a template-safe access path that survives generation, not the narrowest local generic convenience.
- If a type fix only touches `apps/www/src/registry/**`, prove it against the generated-template path before calling the CI issue fixed.
- Treat `templates/**` as verification output, not the place to patch a registry typing bug.

## Related Issues

- [Template local package overrides must cover transitive exports](/Users/felixfeng/Desktop/repos/plate/docs/solutions/developer-experience/2026-03-28-template-local-package-overrides-must-cover-transitive-exports.md)
