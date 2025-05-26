---
'@udecode/plate-heading': major
---

Deprecated package, `HeadingPlugin` moved to `@udecode/plate-basic-elements` and `TocPlugin` moved to `@udecode/plate-toc`. Migration:

- Remove `@udecode/plate-heading` from your dependencies.
- If using `BasicElementsPlugin`, remove `HeadingPlugin` from the `plugins` array.
- If not using `BasicElementsPlugin`, import `HeadingPlugin` from `@udecode/plate-basic-elements`.
- If using `TocPlugin`, add `@udecode/plate-toc` to your dependencies and import `TocPlugin` from `@udecode/plate-toc`.
