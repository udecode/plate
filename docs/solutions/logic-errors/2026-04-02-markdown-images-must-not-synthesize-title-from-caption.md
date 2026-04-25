---
module: Markdown
date: 2026-04-02
problem_type: logic_error
component: markdown_serializer
symptoms:
  - "Markdown image serialization added a title even when the Slate image node had no title"
  - "Images serialized as `![alt](url \"alt\")` instead of `![alt](url)`"
  - "Explicit image titles were lost because serialization mirrored the caption into the title slot"
root_cause: synthesized_image_title
resolution_type: code_change
severity: medium
tags:
  - markdown
  - image
  - serializer
  - commonmark
  - captions
  - titles
---

# Markdown images must not synthesize a title from the caption

## Problem

Plate's markdown image serializer treated the caption as both the alt text and
the markdown title. That meant plain images always serialized with an invented
title, and images with a real `node.title` lost it on the way out.

Instead of this:

```md
![Caption](/image.png)
```

Plate produced this:

```md
![Caption](/image.png "Caption")
```

## What Didn't Work

- Assuming the snapshot output was intentional just because it had been around
- Treating the issue as a docs-only parity gap
- Locking more package-surface tests without checking whether the serializer was
  encoding the wrong contract

## Solution

Serialize markdown image titles from `node.title` only, and leave `title`
undefined when the Slate image node does not have one.

The serializer seam changed from this:

```ts
const image: MdImage = {
  alt: captionText,
  title: captionText,
  type: 'image',
  url,
};
```

to this:

```ts
const image: MdImage = {
  alt: captionText,
  title: typeof title === 'string' ? title : undefined,
  type: 'image',
  url,
};
```

That gives the correct behavior for both cases:

```md
![Caption](/image.png)
![Caption](/image.png "Image title")
```

## Why This Works

Markdown image syntax has two separate fields:

- alt text
- optional title

Plate stores those as separate concepts too:

- `caption` for the visible image label
- `title` for the optional markdown title

Once serialization respects that split instead of copying `caption` into both
slots, the markdown output stops inventing data and starts round-tripping the
real node state.

## Verification

These checks passed:

```bash
bun test packages/markdown/src/lib/commonmarkSurface.spec.ts packages/markdown/src/lib/defaultRules.spec.ts apps/www/src/__tests__/package-integration/markdown-rich/serializeMd.spec.tsx
pnpm turbo build --filter=./packages/basic-nodes --filter=./packages/core --filter=./packages/markdown
pnpm turbo typecheck --filter=./packages/basic-nodes --filter=./packages/core --filter=./packages/markdown
pnpm lint:fix
```

## Prevention

- Do not infer optional markdown fields from a different Slate field just to
  make output look "fuller"
- Add package-surface tests for both:
  - images without titles
  - images with explicit titles
- When app snapshots disagree with package-surface expectations, verify the
  serializer contract before blessing the snapshot

## Related Issues

- `#4898`
