---
'platejs': patch
---

- Collapse `BaseLinkPlugin` updates to `upsert` and `unwrap`, removing `insert`, `wrap`, `upsertText`, and `exitEnd`, plus `rangeBeforeOptions`, `defaultLinkAttributes.href`, and unused link option/definition type aliases (`LinkAttributes`, `BaseLinkPluginState`, `CreateLinkNodeOptions`, `UnwrapLinkOptions`, `WrapLinkOptions`, `UpsertLinkOptions`, `BaseLinkDefinition`, `LinkDefinition`)
- Preserve existing link nodes when expanded-selection link wraps are refused by schema rules, preserve `target` on `link.upsert` unless explicitly passed, and preserve live selection when `at` is passed
- Strip leading wrappers and trailing sentence punctuation in typed autolinks, recognize `www.` domains in `defaultParseUrl`, and fix balanced parentheses, UTF-16 emoji offsets, formatted labels, and inline-void safety in `LinkRules.markdown`
- Fix multi-block URL paste when `keepSelectedTextOnPaste` is `false` and align Markdown bare-URL detection across link and table serialization

**Migration:** Replace `editor.update.link.insert(...)`, `editor.update.link.wrap(...)`, and `editor.update.link.upsertText(...)` with `editor.update.link.upsert(...)` (pass `at` directly instead of `insertNodesOptions.at`, and pass `target: null` or `target: undefined` to unset `target`). Remove `rangeBeforeOptions` from `LinkPlugin.configure({ initialState })`, and use inferred types or `LinkElement` instead of the removed type aliases.
