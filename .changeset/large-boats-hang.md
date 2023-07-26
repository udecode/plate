---
'@udecode/plate-media': major
---

`MediaEmbedElement` is now more headless with a smaller bundle size.
Update the following components:
- `npx @udecode/plate-ui@latest add media-embed-element`
- `npx @udecode/plate-ui@latest add image-element`

Removed:
- `useMediaEmbed`
- `rules` from `MediaPlugin` options. Use `parsers` option in `useinstead.
- `mediaStore`
- `parseMediaUrl`
- `MediaEmbedTweet`
- `Tweet`
- `MediaEmbedVideo`

- `Resizable` is now more headless, you can add your own `Resizable` component:
  - `npx @udecode/plate-ui@latest add resizable`

`MediaEmbedElement`:
- now uses `react-lite-youtube-embed` for YouTube videos.
- now uses `react-tweet` for Twitter tweets.