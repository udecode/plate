# @udecode/plate-media

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
