# Editor Testing OSS Scout

Date: 2026-06-13

Scope:
- Search external editor/browser-testing leads for portable Slate v2 proof
  improvements.
- Promote only source-backed invariants into Slate-native docs/tests/helpers.
- Do not patch runtime from issue titles or snippets.

Outcome:
- Promoted one testing rule: editor-surface proof must not rely on Playwright
  `locator.fill()`. For model-owned `contenteditable`, use keyboard/insertText
  or semantic harness steps, then prove model text, native selection, and native
  event trace when the behavior depends on browser input.
- Patched `slate-browser` README with that rule.
- Rejected rich-text component-test helper cloning as too product-specific; its
  useful offset-selection idea is already covered by Slate's semantic selection
  helpers and native/model selection rows.

Next:
- If Firefox input regressions appear, turn the `playwright-issue-firefox-fill`
  repro into a focused Slate route row that proves `fill()` is not used as the
  oracle and `insertText`/keyboard routes still work.
