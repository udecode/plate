# Slate v2 Contenteditable Catalog Oracles

Date: 2026-06-13

## Question

Which `contenteditable` case-catalog incidents should become Slate-native
oracles now, and which are raw-IME/device claim gaps?

## Scope

- Inspect `easylogic/contenteditable` locally after web discovery.
- Promote only portable invariants that Slate can prove honestly today.
- Do not claim raw OS IME behavior from synthetic Playwright helpers.
- Do not patch runtime from catalog snippets.

## Verdict

The kept invariant is narrow and useful: Enter during active composition must
stay browser-owned. Slate should not call `preventDefault()` or run model-owned
insert-break handling while IME composition is active.

That maps directly to the current `slate-react` keyboard strategy. The kept
packet adds a package contract:

```bash
cd .tmp/slate-v2/packages/slate-react
bun test:vitest test/keyboard-input-strategy-contract.test.ts -- -t "keeps Enter during active composition browser-owned"
```

Result: 38 passed.

Typecheck:

```bash
cd .tmp/slate-v2
bun --filter ./packages/slate-react typecheck
```

Result: passed.

## Evidence Summary

- The Safari Chinese IME case says preventing `insertParagraph` during or after
  IME composition can corrupt later composition input, and recommends checking
  composition state before `preventDefault()`
  (`../contenteditable/src/content/cases/ce-0559-insertparagraph-preventdefault-composition-broken-safari-chinese-ko.md:43-89`).
- The architecture guide says preventing events during composition can corrupt
  browser IME state and shows both `beforeinput` and `keydown` guards that
  return while composing
  (`../contenteditable/src/pages/editor/history-management.astro:376-490`).
- Chrome/Firefox Korean IME Enter cases are useful pressure, but they are
  draft and environment-bound. They should not become synthetic Playwright
  claims for native OS IME Enter behavior
  (`../contenteditable/src/content/cases/ce-0002-ime-enter-breaks.md:31-63`,
  `../contenteditable/src/content/cases/ce-0022-ime-enter-breaks-firefox.md:32-53`).

## Claim Width

This packet claims package-level Slate routing behavior: active-composition
Enter is handled as browser-owned and does not call `preventDefault()` or mutate
the model. It does not claim real Windows/macOS/Safari/Firefox IME
commit-before-linebreak behavior, raw mobile behavior, or full OS keyboard
coverage.

Missing or duplicate `compositionend` lifecycle behavior is owned by the IME
overlap/lifecycle policy gate. Runtime proof waits for accepted policy and a
real composition-span browser lane.
