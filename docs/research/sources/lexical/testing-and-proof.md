# Lexical: testing and proof

## Platform-gated tests

- **Platform gates sit inside the test bodies.** `Tab.spec.mjs`'s 'can tab + IME' opens a Chrome DevTools Protocol session and sends `Input.imeSetComposition`, so it runs only in Chromium (`facebook/lexical@dd5c41b1:packages/lexical-playground/__tests__/e2e/Tab.spec.mjs:23-49`). It combines a paragraph Tab, which inserts a TabNode, with CDP composition. Its sibling 'can go to start of line after a tab character' (`:116`) checks that Ctrl/Meta+ArrowLeft after a typed Tab returns to the line start. Mac-only rows return early on other platforms, as #399 does with `if (!IS_MAC)` (`facebook/lexical@dd5c41b1:packages/lexical-playground/__tests__/regression/399-open-line.spec.mjs:27`), so on Linux CI they pass without running. Source: `docs/editor-test-harvester/lexical/plite-processing-ledger.md:931-934`. Limit: CDP composition drives Chromium's IME API, not an OS input method.
