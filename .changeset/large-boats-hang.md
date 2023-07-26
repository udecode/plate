---
'@udecode/plate-media': major
---

`MediaEmbedElement` is now fully headless with a smaller bundle size.
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
`MediaEmbedElement`:
- now uses `react-lite-youtube-embed` for YouTube videos.
- now uses `react-tweet` for Twitter tweets.