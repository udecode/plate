---
'@udecode/plate-media': major
---

`MediaEmbedElement` is now more headless with a smaller bundle size.
Update the following components:
- `npx @udecode/plate-ui@latest add media-embed-element`
  - now uses `react-lite-youtube-embed` for YouTube videos.
  - now uses `react-tweet` for Twitter tweets.
- `npx @udecode/plate-ui@latest add image-element`

Moved:
- `Resizable` to `@udecode/plate-resizable`

Removed:
- `rules` from `MediaPlugin` options. Use `parsers` option in `useinstead.
- `MediaEmbedTweet`
- `MediaEmbedVideo`
- `Tweet`
- `mediaStore`
- `parseMediaUrl`
- `useMediaEmbed`

