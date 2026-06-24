---
title: Clipboard fragment format keys must guard HTML fallback too
date: 2026-05-04
category: docs/solutions/logic-errors
module: plite plite-dom clipboard schema isolation
problem_type: logic_error
component: tooling
symptoms:
  - Custom clipboard MIME keys isolated application payloads but not embedded HTML fallback fragments.
  - A default-key editor could import schema-private JSON from a custom-key source through text/html.
  - Public extension examples needed a handler type without importing private runtime internals.
root_cause: missing_validation
resolution_type: code_fix
severity: medium
tags: [plite, plite-dom, clipboard, data-transfer, fragment-format, insertdata]
---

# Clipboard fragment format keys must guard HTML fallback too

## Problem
Custom Plite clipboard format keys are not enough if the HTML fallback still
uses an unkeyed `data-plite-fragment`. The browser clipboard can lose the custom
MIME payload and still carry `text/html`, so schema isolation has to apply to
both channels.

## Symptoms
- `application/${clipboardFormatKey}` was configurable.
- `text/html` still carried a bare `data-plite-fragment`.
- A receiving default-key editor could treat a custom-key source as trusted
  Plite JSON through the embedded HTML fallback.
- App-owned paste examples had to type `dom.clipboard.insertData` handlers
  without reaching into private runtime files or using `unknown`.

## What Didn't Work
- Only customizing the MIME key. Safari and cross-browser clipboard flows still
  need the HTML carrier, so the fallback must be keyed too.
- Removing embedded HTML fallback. That would break normal Plite-to-Plite paste
  paths that rely on `text/html`.
- Adding a raw Plite rich HTML parser. Schema-specific rich HTML import belongs
  to app capabilities, not `plite-dom`.

## Solution
Write a format marker beside every embedded fragment and require it to match the
receiving editor's configured key:

```ts
attachElement.setAttribute('data-plite-fragment', encoded)
attachElement.setAttribute('data-plite-fragment-format', clipboardFormatKey)
data.setData(`application/${clipboardFormatKey}`, encoded)
```

Import then checks both channels against the same key:

```ts
const fragment =
  data.getData(`application/${clipboardFormatKey}`) ||
  getSlateFragmentAttribute(data, clipboardFormatKey)
```

Keep default compatibility narrow:

- marked embedded fragment: accept only when the marker equals the configured
  `clipboardFormatKey`;
- unmarked embedded fragment: accept only for the default `x-slate-fragment`;
- mismatched custom-key fragment: reject and fall back to safe text handling.

Expose extension-owned paste handling through a public type:

```ts
export type DOMClipboardInsertDataHandler<V extends Value = Value> = (
  editor: DOMEditor<V>,
  data: DataTransfer
) => boolean | void
```

Examples can then register rich HTML/image paste behavior without private
runtime imports:

```ts
const insertData: DOMClipboardInsertDataHandler = (_editor, data) =>
  insertHtmlData(editor, data)

editor.extend({
  capabilities: {
    'dom.clipboard.insertData': insertData,
  },
  name: 'paste-html',
})
```

## Why This Works
The internal Plite fragment is trusted only when the transport identity matches
the receiving editor. The fallback path remains useful for normal browser copy
flows, but it no longer bypasses schema isolation when the custom MIME payload
is absent.

The public handler type keeps extension-owned rich paste policy in the
capability layer. `plite-dom` owns transport and trust boundaries; apps own
foreign HTML interpretation.

## Prevention
- When adding a custom clipboard key, test both `application/*` and `text/html`
  fallback paths.
- Add one rejection test where a default-key editor receives custom-key embedded
  HTML and must fall back to plain text.
- Keep unmarked fallback compatibility limited to the default key.
- Export extension handler types from the public package surface, not private
  runtime modules.
- Do not close schema-isolation clipboard issues until the fallback carrier is
  covered.

## Related Issues
- `docs/solutions/logic-errors/2026-04-03-plite-clipboard-boundary-proof-must-split-fragment-semantics-and-dom-transport.md`
- `docs/solutions/logic-errors/2026-05-04-inline-void-clipboard-export-must-not-assume-block-void-spacer-dom.md`
- `docs/solutions/developer-experience/2026-05-03-slate-public-root-hard-cuts-need-internal-imports-and-explicit-type-exports.md`
