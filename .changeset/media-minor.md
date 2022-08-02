---
'@udecode/plate-media': minor
---

- `createMediaEmbedPlugin` default options:
```tsx
options: {
  transformUrl: parseIframeUrl,
  rules: [
    {
      parser: parseTwitterUrl,
      component: MediaEmbedTweet,
    },
    {
      parser: parseVideoUrl,
      component: MediaEmbedVideo,
    },
  ],
},
```
- utils:
  - `parseIframeUrl`
  - `parseMediaUrl`
  - `submitFloatingMedia`
- components:
  - `MediaRoot`
  - `MediaEmbed`
    - `MediaEmbedTweet`: used when provider is twitter
    - `MediaEmbedVideo`: used when provider is a video 
  - `FloatingMedia`
  - `FloatingMediaEditButton`
  - `FloatingMediaUrlInput`
- stores:
  - `mediaStore`
  - `captionGlobalStore`
  - `floatingMediaStore`
  - `resizableStore`
- types:
```tsx
interface TResizableElement extends TElement {
  width?: number;
}

interface TImageElement extends TMediaElement {}

interface TCaptionElement extends TElement {
  caption?: TDescendant[];
}

interface TMediaElement extends TCaptionElement, TResizableElement {
  url: string;
}

type MediaUrlParser = (url: string) => EmbedUrlData | undefined;

type MediaPluginRule = {
  parser: MediaUrlParser;
  component?: RenderFunction<EmbedUrlData>;
};

interface MediaPlugin {
  isUrl?: (text: string) => boolean;

  /**
   * Transforms the url.
   */
  transformUrl?: (url: string) => string;

  /**
   * List of rules. The first rule that matches the url will be used,
   * i.e. its component will be used to render the media. Used by `MediaEmbed`.
   */
  rules?: MediaPluginRule[];
}
```
```tsx
type EmbedUrlData = {
  url?: string;
  provider?: string;
  id?: string;
  component?: RenderFunction<EmbedUrlData>;
};  
```
