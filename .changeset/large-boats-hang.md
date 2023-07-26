---
'@udecode/plate-media': major
---

`MediaEmbedElement` is now fully headless using `react-tweet`, decreasing the bundle size.
Update the following components:
- `npx @udecode/plate-ui@latest add media-embed-element`
- `npx @udecode/plate-ui@latest add image-element`

Breaking changes:
- removed `useMediaEmbed`
- removed `rules` from `MediaPlugin` options. Use `parsers` option in `useinstead.