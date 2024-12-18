---
'@udecode/plate-ai': minor
---

- `api.aiChat.replaceSelection()` – new option `format: 'none' | 'single' | 'all'`
  - `'single'` (default):
    - Single block: Applies block's formatting to inserted content
    - Multiple blocks: Preserves source formatting
  - `'all'`: Forces first block's formatting on all inserted blocks
  - `'none'`: Preserves source formatting completely
