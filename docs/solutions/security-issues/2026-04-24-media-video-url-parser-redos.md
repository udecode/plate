---
title: Media video URL parsing must not depend on ReDoS-prone parser packages
date: 2026-04-24
category: security-issues
module: "@platejs/media"
problem_type: security_issue
component: tooling
symptoms:
  - "CVE-2026-5986 flags js-video-url-parser as vulnerable"
  - "A crafted time parameter can stall parseVideoUrl"
root_cause: wrong_api
resolution_type: dependency_update
severity: medium
tags: [media, video-url-parser, redos, dependency-security]
---

# Media video URL parsing must not depend on ReDoS-prone parser packages

## Problem

`@platejs/media` used `js-video-url-parser` for a small public helper surface. That package is flagged by CVE-2026-5986 for inefficient regex behavior in time parameter parsing.

## Symptoms

- Security scanners report `js-video-url-parser@0.5.1`.
- `parseVideoUrl('https://www.youtube.com/watch?v=M7lc1UVf-VE&t=111...x')` can spend hundreds of milliseconds before returning.
- The vulnerable package appears both in `packages/media/package.json` and `pnpm-lock.yaml`.

## What Didn't Work

- Bumping the package was not a fix; the affected range covers the published version in use and no safe replacement version was available.
- Guarding only the Plate call site would still leave the vulnerable dependency in the published package graph.

## Solution

Remove the dependency and keep Plate's documented provider surface in local code:

```ts
const parsedUrl = new URL(url);
const id = parsers[provider](parsedUrl);

return {
  id,
  provider,
  sourceKind: 'url',
  sourceUrl: embedUrl === url ? undefined : url,
  url: embedUrl,
};
```

Cover the replacement with provider variants from upstream tests and a timing regression:

```ts
const url = `https://www.youtube.com/watch?v=M7lc1UVf-VE&t=${'1'.repeat(25)}x`;
const start = performance.now();

expect(parseVideoUrl(url)?.id).toBe('M7lc1UVf-VE');
expect(performance.now() - start).toBeLessThan(100);
```

Then run `pnpm install` so `pnpm-lock.yaml` drops the vulnerable package.

## Why This Works

The vulnerable code path lives in the third-party package's `getTime` regex parsing. Plate does not need generic provider metadata or time parsing; it only needs stable provider IDs and canonical embed URLs. The URL API plus small host/path parsers removes the risky regex engine path and keeps the package graph clean.

## Prevention

- For dependency CVEs in published packages, remove the vulnerable package from both manifest and lockfile.
- Preserve public helper behavior with provider-variant tests before deleting a parser dependency.
- Add one regression that measures the exploit shape when the issue is ReDoS.

## Related Issues

- Advisory: https://advisories.gitlab.com/npm/js-video-url-parser/CVE-2026-5986/
