import {
  type BasePluginContext,
  createBasePlugin,
  type PluginConfig,
  type PluginReference,
  type UnifiedRuntimeBasePluginConfig,
} from '@platejs/core';
import {
  type NodeInsertNodesOptions,
  property,
  schema,
  type SchemaElementProperties,
} from '@platejs/plite';
import { KEYS } from '@platejs/utils';
import type {
  TAudioElement,
  TFileElement,
  TImageElement,
  TMediaElement,
  TMediaEmbedElement,
  TResizableProps,
  TVideoElement,
} from '@platejs/utils';
import { isUrl as defaultIsUrl } from '@udecode/utils';

export const mediaElementProperties = {
  isUpload: property.boolean(),
  name: property.string(),
  placeholderId: property.string(),
  url: property.string(),
  width: property.json({
    validate: (value): value is number | string =>
      (typeof value === 'number' && Number.isFinite(value)) ||
      typeof value === 'string',
    validationVersion: 1,
  }),
} satisfies SchemaElementProperties;

export const mediaElementContent = schema.content.any(
  [schema.content.text(), schema.content.group('inline')],
  { default: 'text', min: 1 }
);

export type MediaPluginState = {
  isUrl?: (text: string) => boolean;

  /** Transforms the url. */
  transformUrl?: (url: string) => string;
};

export type MediaUrlProperties = Pick<
  TMediaElement,
  'provider' | 'sourceUrl' | 'url'
>;

/** Construction input shared by scoped media insert commands. */
export type MediaInsertInput = {
  url: string;
  /**
   * Initial caption content compiled into the media element's direct children.
   * This construction-only field is never persisted.
   */
  caption?: string | TMediaElement['children'];
  id?: string;
  isUpload?: boolean;
  name?: string;
  placeholderId?: string;
  width?: number | string;
};

export type AlignedMediaInsertInput = MediaInsertInput & {
  align?: NonNullable<TResizableProps['align']>;
};

export type ImageInsertInput = AlignedMediaInsertInput & {
  alt?: string;
  initialHeight?: number;
  initialWidth?: number;
};

export type ProviderMediaInsertInput = AlignedMediaInsertInput & {
  provider?: string;
  sourceUrl?: string;
};

export type MediaPluginConfig = PluginConfig<
  string,
  MediaPluginState,
  {},
  {},
  {},
  {},
  readonly [],
  unknown,
  {
    normalizeUrl: (url: string) => MediaUrlProperties | undefined;
  }
>;

/** Plugin descriptor carrying the scoped media URL API. */
export type MediaPluginReference = Readonly<{
  __config: MediaPluginConfig;
}> &
  PluginReference;

type MediaElementForPluginKey<K extends string> = K extends typeof KEYS.img
  ? TImageElement
  : K extends typeof KEYS.audio
    ? TAudioElement
    : K extends typeof KEYS.file
      ? TFileElement
      : K extends typeof KEYS.video
        ? TVideoElement
        : K extends typeof KEYS.mediaEmbed
          ? TMediaEmbedElement
          : TMediaElement;

type MediaInsertInputForPluginKey<K extends string> = K extends typeof KEYS.img
  ? ImageInsertInput
  : K extends typeof KEYS.mediaEmbed | typeof KEYS.video
    ? ProviderMediaInsertInput
    : K extends typeof KEYS.audio
      ? AlignedMediaInsertInput
      : MediaInsertInput;

type MediaPluginInputConfig = {
  api: object;
  initialState: MediaPluginState;
  key: string;
  selectors: object;
  tx: Record<string, unknown>;
  dependencies?: readonly PluginReference[];
  enabled?: boolean;
  pluginApi: Record<string, never>;
  schemaModel?: unknown;
  state?: object;
};

type MediaPluginUpdate<K extends string> = {
  insert: (
    input: MediaInsertInputForPluginKey<K>,
    options?: NodeInsertNodesOptions<TMediaElement>
  ) => boolean;
  setUrl: (input: {
    element: MediaElementForPluginKey<K>;
    url: string;
  }) => boolean;
};

type MediaPluginExtension<C extends MediaPluginInputConfig> =
  UnifiedRuntimeBasePluginConfig<
    C,
    {},
    MediaPluginConfig['pluginApi'],
    {},
    {},
    MediaPluginUpdate<C['key']>,
    {},
    {}
  >;

/** Installs direct-child caption normalization and media construction. */
export const defineMediaPlugin =
  (
    normalizeUrlInput?: (
      state: Readonly<MediaPluginState>,
      url: string
    ) => MediaUrlProperties
  ) =>
  <C extends MediaPluginInputConfig>({ store, type }: BasePluginContext<C>) => {
    const normalizeUrl = (url: string): MediaUrlProperties | undefined => {
      const state = store.get();
      const normalized = normalizeUrlInput?.(state, url) ?? {
        url: state.transformUrl?.(url) ?? url,
      };

      return (state.isUrl ?? defaultIsUrl)(normalized.url)
        ? normalized
        : undefined;
    };

    const update: NonNullable<MediaPluginExtension<C>['update']> = ({
      tx,
    }) => ({
      insert(
        input: MediaInsertInputForPluginKey<C['key']>,
        options?: NodeInsertNodesOptions<TMediaElement>
      ) {
        if (!tx.selection() && options?.at === undefined) return false;

        const normalized = normalizeUrl(input.url);

        if (!normalized) return false;

        const { caption, ...properties } = {
          ...input,
          ...normalized,
        };
        const children =
          typeof caption === 'string'
            ? [{ text: caption }]
            : caption && caption.length > 0
              ? caption
              : [{ text: '' }];
        const element: TMediaElement = {
          ...properties,
          children,
          type,
        };

        if (options?.at === undefined) {
          tx.blocks.insertAfter(element, options);
        } else {
          tx.nodes.insert(element, options);
        }

        return true;
      },
      setUrl({
        element,
        url,
      }: {
        element: MediaElementForPluginKey<C['key']>;
        url: string;
      }) {
        const properties = normalizeUrl(url);
        const at = tx.nodes.path(element);

        if (!properties || !at) return false;

        tx.nodes.set<TMediaElement>(
          {
            provider: properties.provider,
            sourceUrl: properties.sourceUrl,
            url: properties.url,
          },
          { at }
        );

        return true;
      },
    });

    return {
      api: { normalizeUrl },
      update,
    };
  };

export type AudioPluginState = MediaPluginState;
export type FilePluginState = MediaPluginState;
export type VideoPluginState = MediaPluginState;

export const BaseAudioPlugin = createBasePlugin({
  key: KEYS.audio,
  initialState: (): AudioPluginState => ({}),
  schema: {
    element: {
      content: mediaElementContent,
      isolating: true,
      keyboardSelectable: true,
      properties: mediaElementProperties,
    },
  },
}).extend(defineMediaPlugin());

export const BaseFilePlugin = createBasePlugin({
  key: KEYS.file,
  initialState: (): FilePluginState => ({}),
  schema: {
    element: {
      content: mediaElementContent,
      isolating: true,
      keyboardSelectable: true,
      properties: mediaElementProperties,
    },
  },
}).extend(defineMediaPlugin());

export const BaseVideoPlugin = createBasePlugin({
  key: KEYS.video,
  initialState: (): VideoPluginState => ({}),
  schema: {
    element: {
      content: mediaElementContent,
      isolating: true,
      keyboardSelectable: true,
      properties: {
        ...mediaElementProperties,
        provider: property.string(),
        sourceUrl: property.string(),
      },
    },
  },
}).extend(defineMediaPlugin());
