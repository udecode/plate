---
title: Link paste autolink must stay literal inside markdown source entry
date: 2026-04-11
category: logic-errors
module: link
problem_type: logic_error
component: tooling
symptoms:
  - "Pasting a URL inside markdown link source such as `[text](` created a rich link node instead of continuing the literal source entry"
  - "Rejecting paste autolink for a valid URL candidate could leave the pasted text missing in bare editor tests"
root_cause: logic_error
resolution_type: code_fix
severity: medium
tags: [link, autolink, paste, markdown, source-entry]
---

# Link paste autolink must stay literal inside markdown source entry

## Problem

The link plugin autolinked pasted URLs too eagerly.

That was fine for plain rich-text paste, but wrong inside markdown source entry
like `[text](...)`, where the user is clearly building literal markdown rather
than asking for a rich link node.

## Symptoms

- Pasting `https://google.com` after `[Example](` produced a link node in the
  middle of literal markdown source.
- Once paste autolink was rejected for that context, bare editor tests exposed
  a second bug: the pasted URL could disappear because the fallback path relied
  on a downstream `insertData` implementation that was not always present.

## What Didn't Work

- Treating every pasted valid URL as an autolink candidate regardless of local
  source-entry context.
- Rejecting autolink and then blindly falling through to `insertData(data)`,
  which does not guarantee plain-text insertion in the bare editor test setup.

## Solution

Add a default paste guard for markdown link source entry and insert the raw
text when a valid URL paste is intentionally kept literal.

```ts
const MARKDOWN_LINK_SOURCE_RE = /!?\[[^\]\n]*]\([^)\n]*$/;

const shouldAutoLinkPasteByDefault = (editor, { textBefore }) => {
  if (editor.api.some({ match: { type: [editor.getType(KEYS.codeBlock)] } })) {
    return false;
  }

  if (!editor.api.isCollapsed()) return true;

  return !MARKDOWN_LINK_SOURCE_RE.test(textBefore);
};
```

Then, for valid URL candidates:

```ts
if (isValidPasteUrl) {
  if (canAutoLinkPaste) {
    return upsertLink(...);
  }

  editor.tf.insertText(text);
  return;
}
```

This keeps default rich-text paste behavior, but preserves literal markdown
source entry when the local context makes that intent obvious.

## Why This Works

The fix separates two decisions that were previously conflated:

- whether the pasted text is a valid URL
- whether the current insertion context should autolink it

Markdown source entry is a real editing context, not noise around the URL.
Once the plugin sees `[... ](` before the cursor, the right behavior is to keep
the URL literal. And when it does that, it must insert the plain text itself
instead of assuming another paste handler will always finish the job.

## Prevention

- Do not autolink pasted URLs in contexts that are clearly building literal
  markdown source.
- When a plugin deliberately rejects a valid specialized paste path, make sure
  it still preserves the raw text instead of relying on an implicit downstream
  fallback.
- Keep paste regressions covered through `withLink.spec.tsx`, not only through
  URL validation tests.

## Related Issues

- [2026-03-28-link-validation-must-not-treat-double-slash-as-internal-path.md](./2026-03-28-link-validation-must-not-treat-double-slash-as-internal-path.md)
- [2026-03-29-custom-isurl-must-be-able-to-reject-internal-link-shortcuts.md](./2026-03-29-custom-isurl-must-be-able-to-reject-internal-link-shortcuts.md)
