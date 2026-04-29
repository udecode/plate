# Inline Void Suggestion Styles

## Goal

Make inline void elements such as mention, date, and inline equation render visible suggestion styling when they carry suggestion metadata.

## Current Facts

- `SuggestionLeaf` styles text leaves only.
- `link`, `media-file`, and several media/block void nodes already read suggestion data and apply explicit classes.
- `mention`, `date`, and `InlineEquationElement` still render their normal token styles even when `suggestionData(...)` returns insert/remove metadata.

## Plan

1. Inspect existing inline element suggestion-style patterns.
2. Add a failing regression test for inline void nodes with suggestion metadata.
3. Introduce a shared inline-element suggestion styling helper if it simplifies the render path.
4. Update runtime and static inline void components to use the same suggestion styling rules where appropriate.
5. Verify targeted tests plus `apps/www` build/typecheck/lint.
