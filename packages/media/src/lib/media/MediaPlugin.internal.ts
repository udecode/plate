import type { AnyPluginConfig, BasePlugin, PluginConfig } from '@platejs/core';
import {
  type NodeInsertNodesOptions,
  property,
  schema,
  type SchemaElementProperties,
} from '@platejs/plite';
import type {
  KEYS,
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
  never,
  {
    normalizeUrl: (url: string) => MediaUrlProperties | undefined;
  }
>;

/** Plugin descriptor carrying the scoped media URL API. */
export type MediaPluginReference = Readonly<{
  __config: AnyPluginConfig & {
    pluginApi: MediaPluginConfig['pluginApi'];
  };
  key: string;
}>;

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

/**
 * Installs direct-child caption normalization and media construction.
 *
 * @internal
 */
type MediaPluginInput = Readonly<{
  __config: AnyPluginConfig;
  extend: (...args: never[]) => unknown;
  key: string;
}>;

export const defineMediaPlugin = <
  P extends MediaPluginInput,
  C extends AnyPluginConfig = P['__config'],
>(
  plugin: P,
  normalizeUrlInput?: (
    state: Readonly<MediaPluginState>,
    url: string
  ) => MediaUrlProperties
) => {
  const typedPlugin = plugin as unknown as BasePlugin<C>;

  return typedPlugin.extend((context) => {
    const getState = () => context.store.get() as Readonly<MediaPluginState>;
    const normalizeUrl = (url: string): MediaUrlProperties | undefined => {
      const state = getState();
      const normalized = normalizeUrlInput?.(state, url) ?? {
        url: state.transformUrl?.(url) ?? url,
      };

      return (state.isUrl ?? defaultIsUrl)(normalized.url)
        ? normalized
        : undefined;
    };

    return {
      api: { normalizeUrl },
      update: ({ tx }) => ({
        insert(
          input: MediaInsertInputForPluginKey<C['key']>,
          options?: NodeInsertNodesOptions<MediaElementForPluginKey<C['key']>>
        ) {
          if (!tx.selection() && options?.at === undefined) return;

          const normalized = normalizeUrlInput?.(getState(), input.url);
          const { caption, ...properties } = {
            ...input,
            ...normalized,
          };
          const type = context.type;
          const children =
            typeof caption === 'string'
              ? [{ text: caption }]
              : caption && caption.length > 0
                ? caption
                : [{ text: '' }];
          const element = {
            ...properties,
            children,
            type,
          } as unknown as MediaElementForPluginKey<C['key']>;

          if (options?.at === undefined) {
            tx.blocks.insertAfter(element, options);
          } else {
            tx.nodes.insert(element, options);
          }
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
      }),
    };
  });
};
