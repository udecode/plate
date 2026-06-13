# Slate v2 Playwright Selectionchange Race Oracles

Date: 2026-06-13

## Question

Does the Playwright Home plus Shift+End selectionchange race expose a portable
Slate v2 oracle or a Slate runtime patch?

## Scope

- Inspect the local repro source before drawing conclusions.
- Convert only the portable invariant into Slate-native proof.
- Do not patch runtime from a browser issue title or a bare contenteditable
  reproducer.

## Verdict

The useful Slate invariant is detached endpoint import safety. If a browser or
reconciler leaves `window.getSelection()` anchored to a detached text node,
Slate must ignore that DOM selection and keep the current model selection
instead of resolving stale DOM into Slate state.

That is a package-level selection-controller contract, not a runtime patch. The
kept proof adds:

```bash
cd .tmp/slate-v2/packages/slate-react
bun test:vitest test/selection-controller-contract.test.ts -- -t "selectionchange ignores detached DOM endpoints before resolving Slate range"
```

Result: passed.

## Evidence Summary

- The Playwright repro replaces the selected text node during
  `selectionchange`, then drives Home and Shift+End. The failure is an empty
  native selection caused by the browser keeping the anchor in detached DOM
  (`../playwright-selectionchange-race-repro/playwright/tests/home-shift-end.spec.ts:1-56`).
- The React variant performs the same replacement with a guarded
  `selectionchange` listener
  (`../playwright-selectionchange-race-repro/vitest-browser/src/Editor.tsx:1-47`).
- Slate's selection import path checks `ReactEditor.hasSelectableTarget` for
  both endpoints before it resolves a Slate range. The kept contract pins that
  detached endpoints do not call `resolveSlateRange` and do not alter the model
  selection.

## Claim Width

This packet claims Slate package import safety for detached DOM selection
endpoints. It does not claim that Chromium, Playwright, or a custom
contenteditable reconciler always makes Home plus Shift+End produce a native
line selection after arbitrary DOM replacement.
