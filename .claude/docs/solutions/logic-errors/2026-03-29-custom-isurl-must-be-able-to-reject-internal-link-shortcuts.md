---
module: Link
date: 2026-03-29
problem_type: logic_error
component: tooling
symptoms:
  - "A custom link plugin `isUrl` callback could not prevent `/docs` from being autolinked"
  - "A custom link plugin `isUrl` callback could not prevent `#anchor` from being autolinked"
  - "Pasting internal-path text still created links even when user code explicitly rejected those values"
root_cause: logic_error
resolution_type: code_fix
severity: medium
tags:
  - link
  - autolink
  - validation
  - url
  - isUrl
  - internal-links
  - anchors
---

# Custom `isUrl` must be able to reject internal link shortcuts

## Problem

The link plugin accepted internal paths like `/docs` and anchor links like `#top` before it ever consulted a user-provided `isUrl` callback.

That meant consumers could not opt out of autolinking those shortcuts, even though the public API suggested `isUrl` was the place to control URL acceptance.

## Root cause

`validateUrl` had two fast paths:

- return `true` for internal paths starting with `/` but not `//`
- return `true` for anchor links starting with `#`, unless the text matched a markdown heading

Those branches ran before `isUrl`.

The obvious fix would be to move `isUrl` to the top, but that would break existing behavior because the default `platejs` `isUrl` validator returns `false` for `/docs` and `#top`. The plugin intentionally treats those as valid shortcuts even though the generic URL validator does not.

## Fix

Only give veto power to real custom `isUrl` callbacks.

If the configured validator is still the default `platejs` one, preserve the existing internal-path and anchor-link shortcuts. If the validator is custom, respect its result for those shortcuts.

```ts
import { isUrl as defaultIsUrl } from 'platejs';

const customIsUrl = isUrl && isUrl !== defaultIsUrl ? isUrl : undefined;

if (url.startsWith('/') && !url.startsWith('//')) {
  return customIsUrl ? customIsUrl(url) : true;
}

if (url.startsWith('#')) {
  if (MARKDOWN_HEADING_PATTERN.test(url)) {
    return false;
  }

  return customIsUrl ? customIsUrl(url) : true;
}
```

Regression coverage should prove both layers:

- `validateUrl` rejects `/...` and `#...` when a custom validator says no
- `upsertLink` aborts link insertion when that validator rejection bubbles up through the actual insert path

## Verification

These checks passed:

```bash
bun test packages/link/src/lib/utils/validateUrl.spec.ts packages/link/src/lib/transforms/upsertLink.spec.tsx packages/link/src/lib/withLink.spec.tsx
pnpm install
pnpm turbo build --filter=./packages/link
pnpm turbo typecheck --filter=./packages/link
pnpm lint:fix
pnpm check
```

## Prevention

When plugin code has shortcut branches that intentionally bypass a generic validator, do not blindly reorder the validator to the top. First check whether the default validator would reject the shortcut values.

If user configuration is supposed to override built-in shortcuts, compare the configured callback against the default implementation and only grant override behavior to real custom callbacks.
