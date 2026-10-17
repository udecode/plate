---
'platejs': patch
---

Add `inject.nodeProps.textScope`. Set it to `'nodeKey'` to run a text injection, its `query` and transforms included, only on text whose node key value is not null or undefined. The injection then no longer forces a React render when typing in other text. `SuggestionPlugin` sets it. A plugin that extends `SuggestionPlugin` and paints text without `authored` sets `textScope: 'all'`.

Typing now re-renders text holding the node key of a text injection that has only a `query`, so the attributes it paints stay current. An injection keyed on `text` re-renders every text as it is typed.
