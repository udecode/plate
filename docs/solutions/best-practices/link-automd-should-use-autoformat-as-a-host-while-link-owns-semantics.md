---
title: Link automd should use AutoformatPlugin as a host while link owns semantics
date: 2026-04-11
category: best-practices
module: link
problem_type: best_practice
component: tooling
symptoms:
  - Link markdown source entry needed a typed `)` trigger in shipped editor kits.
  - Pushing link automd into plain autoformat rules would have duplicated link parsing, validation, and insertion semantics outside `@platejs/link`.
  - Wiring a link-owned input rule into `AutoformatKit` could break editors that reused the kit without link semantics installed.
root_cause: inadequate_documentation
resolution_type: code_change
severity: medium
tags: [link, autoformat, automd, input-rules, ownership]
---

# Link automd should use AutoformatPlugin as a host while link owns semantics

## Problem

Link automd for `[text](url)` on the closing `)` needed to ship in the current
editor kits.

The trap was obvious: either stuff link behavior into generic autoformat, or
keep it app-local and duplicate link semantics. Both choices are wrong.

## Symptoms

- The desired UX was a typed source-entry conversion, which fit the
  `insertTextRules` runtime shape.
- The actual link behavior still depended on link-only rules like URL
  normalization, validation, and structured link insertion.
- A naive kit-level registration of the rule could fire in editors that had
  autoformat installed but no link plugin configured.

## What Didn't Work

- Treating link automd as just another plain autoformat family.
- Reimplementing link validation or insertion in `@platejs/autoformat`.
- Assuming `AutoformatKit` could always register the rule safely without
  checking whether link semantics were present in the editor.

## Solution

Use `AutoformatPlugin` as the typed-input host, but keep the matcher and
formatting logic in `@platejs/link`.

The rule lives in the link package and resolves only on `)`:

```ts
export const linkAutomdInputRule = {
  trigger: ')',
  resolve: (editor, { options, text }) => {
    if (text !== ')' || options?.at) return;

    return getLinkAutomdMatch(editor);
  },
  format: (editor, _context, match) => {
    upsertLink(editor, {
      insertNodesOptions: { at: match.range },
      skipValidation: true,
      text: match.text,
      url: match.url,
    });
  },
};
```

The matcher stays link-owned and uses link semantics directly:

```ts
const { transformInput } = editor.getOptions(BaseLinkPlugin);
const url = transformInput ? (transformInput(rawUrl) ?? '') : rawUrl;

if (!url || !validateUrl(editor, url)) return;
if (!editor.plugins[KEYS.link]) return;
```

Then the current kits just host it:

```ts
AutoformatPlugin.configure({
  options: {
    insertTextRules: [linkAutomdInputRule],
  },
});
```

## Why This Works

The host/runtime and the semantics stay in the right places.

- `@platejs/autoformat` owns the typed-character dispatch path.
- `@platejs/link` owns link parsing, normalization, validation, and insertion.
- The kit surface stays small.
- Editors without link semantics fail safely because the rule checks for the
  link plugin before doing anything.

That gives you the UX without smearing link behavior across the wrong package.

## Prevention

- If a typed conversion depends on package-specific semantics, keep the rule in
  that package and reuse `insertTextRules` only as a host.
- Do not move validation or node construction into `@platejs/autoformat` just
  because the trigger is typed.
- When a kit registers an optional typed rule, guard it against missing plugin
  semantics instead of assuming the full stack is always present.
- Lock the boundary with both package-level tests and shipped-kit integration
  tests.

## Related Issues

- [2026-04-11-link-automd-autoformat-plan.md](../../plans/2026-04-11-link-automd-autoformat-plan.md)
- [link-automd-belongs-to-the-link-interaction-lane.md](../../research/decisions/link-automd-belongs-to-the-link-interaction-lane.md)
- [autoformat-lanes-must-split-package-owned-rules-from-current-kit-shorthand.md](./autoformat-lanes-must-split-package-owned-rules-from-current-kit-shorthand.md)
