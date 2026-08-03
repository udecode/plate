import {
  type BasePluginContext,
  type BasePluginDefinition,
  defineBasePlugin,
  type PlatePluginTransaction,
} from '@platejs/core';
import {
  type EditorUpdateContext,
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

type MediaElementForPlugin<K extends string> = K extends typeof KEYS.img
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

type MediaInsertInputForPlugin<K extends string> = K extends typeof KEYS.img
  ? ImageInsertInput
  : K extends typeof KEYS.mediaEmbed | typeof KEYS.video
    ? ProviderMediaInsertInput
    : K extends typeof KEYS.audio
      ? AlignedMediaInsertInput
      : MediaInsertInput;

type MediaPluginUpdate<K extends string> = {
  insert: (
    input: MediaInsertInputForPlugin<K>,
    options?: NodeInsertNodesOptions<TMediaElement>
  ) => boolean;
  setUrl: (input: {
    element: MediaElementForPlugin<K>;
    url: string;
  }) => boolean;
};

type MediaPluginApi = {
  normalizeUrl: (url: string) => MediaUrlProperties | undefined;
};

type MediaPluginBaseDefinition<K extends string = string> =
  BasePluginDefinition &
    Readonly<{
      initialState: MediaPluginState;
      name: K;
    }>;

/** Installs direct-child caption normalization and media construction. */
export const defineMediaPlugin =
  (
    normalizeUrlInput?: (
      state: Readonly<MediaPluginState>,
      url: string
    ) => MediaUrlProperties
  ) =>
  <C extends MediaPluginBaseDefinition>({
    store,
    type,
  }: BasePluginContext<C>): {
    api: (context: BasePluginContext<C>) => MediaPluginApi;
    update: (
      context: BasePluginContext<C> & {
        context: EditorUpdateContext;
        tx: PlatePluginTransaction<C>;
      }
    ) => MediaPluginUpdate<C['name']>;
  } => {
    const normalizeUrl = (url: string): MediaUrlProperties | undefined => {
      const state = store.get();
      const normalized = normalizeUrlInput?.(state, url) ?? {
        url: state.transformUrl?.(url) ?? url,
      };

      return (state.isUrl ?? defaultIsUrl)(normalized.url)
        ? normalized
        : undefined;
    };

    return {
      api: () => ({ normalizeUrl }),
      update: ({ tx }) => ({
        insert(input, options) {
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
        setUrl({ element, url }) {
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
  };

export type AudioPluginState = MediaPluginState;
export type FilePluginState = MediaPluginState;
export type VideoPluginState = MediaPluginState;

export const BaseAudioPlugin = defineBasePlugin(KEYS.audio, {
  initialState: (): AudioPluginState => ({}),
  schema: {
    element: schema.element.textBlock({
      isolating: true,
      keyboardSelectable: true,
      properties: mediaElementProperties,
    }),
  },
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/markdown': {
        from: 'audio',
        kind: 'node',
        decode: ({ caption, decode, node, parseAttributes, type }) => {
          const { src, ...props } = parseAttributes(node.attributes);

          return {
            ...props,
            children: caption(decode(node.children)),
            type,
            url: typeof src === 'string' ? src : '',
          };
        },
        encode: ({
          encodePhrasing,
          node,
          propsToAttributes,
          readPlainInline,
          type,
        }) => {
          const { children, type: _, url, ...rest } = node;

          return {
            attributes: propsToAttributes({ ...rest, src: url }),
            children:
              readPlainInline(children) !== ''
                ? [
                    {
                      children: encodePhrasing(children),
                      type: 'paragraph',
                    },
                  ]
                : [],
            name: type,
            type: 'mdxJsxFlowElement',
          };
        },
      },
    }),
}).extend(defineMediaPlugin());

export const BaseFilePlugin = defineBasePlugin(KEYS.file, {
  initialState: (): FilePluginState => ({}),
  schema: {
    element: schema.element.textBlock({
      isolating: true,
      keyboardSelectable: true,
      properties: mediaElementProperties,
    }),
  },
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/markdown': {
        from: 'file',
        kind: 'node',
        decode: ({ caption, decode, node, parseAttributes, type }) => {
          const { src, ...props } = parseAttributes(node.attributes);

          return {
            ...props,
            children: caption(decode(node.children)),
            type,
            url: typeof src === 'string' ? src : '',
          };
        },
        encode: ({
          encodePhrasing,
          node,
          propsToAttributes,
          readPlainInline,
          type,
        }) => {
          const { children, type: _, url, ...rest } = node;

          return {
            attributes: propsToAttributes({ ...rest, src: url }),
            children:
              readPlainInline(children) !== ''
                ? [
                    {
                      children: encodePhrasing(children),
                      type: 'paragraph',
                    },
                  ]
                : [],
            name: type,
            type: 'mdxJsxFlowElement',
          };
        },
      },
    }),
}).extend(defineMediaPlugin());

export const BaseVideoPlugin = defineBasePlugin(KEYS.video, {
  initialState: (): VideoPluginState => ({}),
  schema: {
    element: schema.element.textBlock({
      isolating: true,
      keyboardSelectable: true,
      properties: {
        ...mediaElementProperties,
        provider: property.string(),
        sourceUrl: property.string(),
      },
    }),
  },
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/markdown': {
        from: 'video',
        kind: 'node',
        decode: ({ caption, decode, node, parseAttributes, type }) => {
          const { src, ...props } = parseAttributes(node.attributes);

          return {
            ...props,
            children: caption(decode(node.children)),
            type,
            url: typeof src === 'string' ? src : '',
          };
        },
        encode: ({
          encodePhrasing,
          node,
          propsToAttributes,
          readPlainInline,
          type,
        }) => {
          const { children, type: _, url, ...rest } = node;

          return {
            attributes: propsToAttributes({ ...rest, src: url }),
            children:
              readPlainInline(children) !== ''
                ? [
                    {
                      children: encodePhrasing(children),
                      type: 'paragraph',
                    },
                  ]
                : [],
            name: type,
            type: 'mdxJsxFlowElement',
          };
        },
      },
    }),
}).extend(defineMediaPlugin());
