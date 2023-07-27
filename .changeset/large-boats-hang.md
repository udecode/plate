---
'@udecode/plate-media': major
---

`MediaEmbedElement` is now more headless with a smaller bundle size.
Update the following components:

- `npx @udecode/plate-ui@latest add media-embed-element`
  - now uses `react-lite-youtube-embed` for YouTube videos.
  - now uses `react-tweet` for Twitter tweets.
- `npx @udecode/plate-ui@latest add image-element`

Breaking changes:

- Moved `Resizable` to `@udecode/plate-resizable`
- Moved `Caption`, `CaptionTextarea` to `@udecode/plate-caption`
- Removed `useMediaEmbed`, `MediaEmbedVideo`, `MediaEmbedTweet`, `Tweet`, `parseMediaUrl`, `mediaStore`
- Removed `@udecode/resizable`, `scriptjs`, `react-textarea-autosize` dependencies
- `MediaPlugin`
  - removed `rules`. Use `parsers` option instead.
  - removed `disableCaption`. Use `createCaptionPlugin` instead.
- Caption is now a separate plugin. Install `@udecode/plate-caption` and add it to your plugins:

```ts
import { ELEMENT_IMAGE, ELEMENT_MEDIA_EMBED } from '@udecode/plate-media';

createCaptionPlugin({
  options: { pluginKeys: [ELEMENT_IMAGE, ELEMENT_MEDIA_EMBED] },
});
```
