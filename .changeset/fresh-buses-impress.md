---
"@udecode/plate-core": major
---

Moved `serializeHtml` and its utils to `@udecode/plate-serializer-html` as it has a new dependency: [html-entities](https://www.npmjs.com/package/html-entities).
- If you're using `@udecode/plate`, no migration is needed
- Otherwise, import it from `@udecode/plate-serializer-html`
