# @udecode/plate-media

## 24.0.1

## 24.0.0

## 23.7.4

## 23.7.0

## 23.6.0

## 23.3.1

## 23.3.0

## 23.0.0

### Major Changes

- [#2537](https://github.com/udecode/plate/pull/2537) by [@haydencarlson](https://github.com/haydencarlson) – `MediaEmbedElement` is now more headless with a smaller bundle size.
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

## 22.0.2

## 22.0.1

## 22.0.0

### Major Changes

- [#2471](https://github.com/udecode/plate/pull/2471) by [@zbeyens](https://github.com/zbeyens) – Removed:
  - `MediaEmbed`

### Minor Changes

- [#2471](https://github.com/udecode/plate/pull/2471) by [@zbeyens](https://github.com/zbeyens) – New exports:
  - `insertMedia`
  - `useMediaState`
  - `useMediaToolbarButton`

## 21.5.0

## 21.4.2

## 21.4.1

## 21.3.4

## 21.3.2

## 21.3.0

## 21.1.5

## 21.0.0

## 20.7.2

### Patch Changes

- [#2366](https://github.com/udecode/plate/pull/2366) by [@zbeyens](https://github.com/zbeyens) –
  - Fix freeze on image upload: This patch adds a check to ensure the given URL is valid before parsing and extracting video data using `js-video-url-parser` in the `parseVideoUrl` function.
  - Fix insert CSV: This patch modifies the logic in the `withImageUpload` function to ensure that it processes file uploads only if there is no plaintext present.

## 20.7.0

## 20.6.3

## 20.6.0

### Minor Changes

- [#2311](https://github.com/udecode/plate/pull/2311) by [@haydencarlson](https://github.com/haydencarlson) – Added options for twitter embeds

## 20.5.0

### Minor Changes

- [#2302](https://github.com/udecode/plate/pull/2302) by [@zbeyens](https://github.com/zbeyens) –
  - Remove depedency on `re-resizable` in favor of new `@udecode/resizable` package.

## 20.4.0

## 20.3.2

### Patch Changes

- [#2285](https://github.com/udecode/plate/pull/2285) by [@12joan](https://github.com/12joan) – Ignore `defaultPrevented` keydown events

## 20.0.0

## 19.7.0

### Patch Changes

- [#2225](https://github.com/udecode/plate/pull/2225) by [@TomMorane](https://github.com/TomMorane) – fix: hotkey

- [#2220](https://github.com/udecode/plate/pull/2220) by [@TomMorane](https://github.com/TomMorane) – fix: Cannot read properties of null (reading 'toString') when image width is null

## 19.5.0

## 19.4.4

## 19.4.2

## 19.2.0

## 19.1.1

## 19.1.0

## 19.0.3

## 19.0.1

## 19.0.0

## 18.15.0

## 18.13.1

### Patch Changes

- [`37a3c03`](https://github.com/udecode/plate/commit/37a3c038a4ac298a12013a9ba46dacfa57415e4f) by [@zbeyens](https://github.com/zbeyens) –
  - fix: `parseTwitterUrl` undefined check on `url`

## 18.13.0

## 18.9.0

## 18.7.0

## 18.6.0

## 18.2.0

## 18.1.1

## 17.0.3

## 17.0.2

## 17.0.1

## 17.0.0

## 16.8.0

## 16.5.0

### Minor Changes

- [#1832](https://github.com/udecode/plate/pull/1832) by [@zbeyens](https://github.com/zbeyens) –
  - Fixes https://github.com/udecode/editor-protocol/issues/79
  - new option `disableCaption`
  - image and media-embed plugins use `getWithSelectionCaption`

## 16.3.0

## 16.2.0

## 16.1.0

## 16.0.2

## 16.0.1

### Patch Changes

- [#1754](https://github.com/udecode/plate/pull/1754) by [@haydencarlson](https://github.com/haydencarlson) – Fixed twitter embed loading when using multiple plate instances

## 16.0.0

### Major Changes

- [#1721](https://github.com/udecode/plate/pull/1721) by [@zbeyens](https://github.com/zbeyens) –
  - removed:
    - `useImageElement` for `useElement`
    - `MediaEmbedUrlInput` for `FloatingMediaUrlInput`
    - `parseEmbedUrl` for `parseMediaUrl`
    - `EmbedProviders`
  - renamed:
    - `ImageImg` to `Image`
    - `ImageCaptionTextarea` to `CaptionTextarea`
    - `useImageCaptionString` to `useCaptionString`
    - `ImageResizable` to `Resizable`

### Minor Changes

- [#1721](https://github.com/udecode/plate/pull/1721) by [@zbeyens](https://github.com/zbeyens) –

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
