---
'@udecode/plate-markdown': minor
---

- Added fallback handling for unsupported MDX tags to gracefully preserve content

- Now remarkMdx is exported directly from the `@udecode/plate-markdown` package instead of importing from `remark-mdx`

- New `onError` option in `DeserializeMdOptions` to handle and catch MDX parsing errors
