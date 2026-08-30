import {
  isUrl as defaultIsUrl,
  type BasePluginContext,
  type BasePluginDefinition,
  type BasePluginDefinitionInput,
  defineBasePlugin,
  type Descendant,
  editorCommands,
  type EditorUpdateContext,
  type Element,
  ElementApi,
  type ElementOf,
  type ElementWith,
  PathApi,
  type PlateNodeInsertOptions,
  type PlatePluginTransaction,
  PLUGINS,
  property,
  schema,
  type SchemaElement,
  type SchemaElementProperties,
} from '../../../core';

export const mediaElementProperties = {
  url: property.string({ required: true }),
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

export type MediaUrlProperties = {
  url: string;
  provider?: string;
  sourceUrl?: string;
};

/** Construction input shared by scoped media insert commands. */
export type MediaInsertInput = {
  url: string;
  /**
   * Initial caption content compiled into the media element's direct children.
   * This construction-only field is never persisted.
   */
  caption?: string | readonly Descendant[];
  id?: string;
  width?: number | string;
};

export type FileInsertInput = MediaInsertInput & {
  name?: string;
};

export type AlignedMediaInsertInput = MediaInsertInput & {
  textAlign?: 'center' | 'left' | 'right';
};

export type ImageInsertInput = AlignedMediaInsertInput & {
  alt?: string;
  naturalHeight?: number;
  naturalWidth?: number;
};

export type ProviderMediaInsertInput = AlignedMediaInsertInput & {
  provider?: string;
  sourceUrl?: string;
};

type MediaInsertInputForPlugin<K extends string> =
  K extends typeof PLUGINS.image
    ? ImageInsertInput
    : K extends typeof PLUGINS.file
      ? FileInsertInput
      : K extends typeof PLUGINS.mediaEmbed | typeof PLUGINS.video
        ? ProviderMediaInsertInput
        : K extends typeof PLUGINS.audio
          ? AlignedMediaInsertInput
          : MediaInsertInput;

type MediaElementPluginDefinition = BasePluginDefinition &
  Readonly<{ schema: Readonly<{ element: SchemaElement }> }>;

type MediaPluginUpdate<C extends MediaElementPluginDefinition> = {
  insert: (
    input: MediaInsertInputForPlugin<C['name']>,
    options?: PlateNodeInsertOptions
  ) => boolean;
  setUrl: (input: { element: Element; url: string }) => boolean;
};

type MediaPluginApi = {
  normalizeUrl: (url: string) => MediaUrlProperties | undefined;
};

type MediaPluginExtension = {
  api: (
    context: BasePluginContext<MediaElementPluginDefinition>
  ) => MediaPluginApi;
  commands: NonNullable<
    BasePluginDefinitionInput<MediaElementPluginDefinition>['commands']
  >;
  update: (
    context: BasePluginContext<MediaElementPluginDefinition> & {
      context: EditorUpdateContext;
      tx: PlatePluginTransaction<MediaElementPluginDefinition>;
    }
  ) => {
    insert: (
      input: MediaInsertInput,
      options?: PlateNodeInsertOptions
    ) => boolean;
    setUrl: (input: { element: Element; url: string }) => boolean;
  };
};

/** Installs direct-caption editing, URL normalization, and media construction. */
export function defineMediaPlugin<const C extends MediaElementPluginDefinition>(
  normalizeUrlInput?: (
    state: Readonly<MediaPluginState>,
    url: string
  ) => MediaUrlProperties
): (context: BasePluginContext<C>) => {
  api: (context: BasePluginContext<C>) => MediaPluginApi;
  commands: NonNullable<BasePluginDefinitionInput<C>['commands']>;
  update: (
    context: BasePluginContext<C> & {
      context: EditorUpdateContext;
      tx: PlatePluginTransaction<C>;
    }
  ) => MediaPluginUpdate<C>;
};
export function defineMediaPlugin(
  normalizeUrlInput?: (
    state: Readonly<MediaPluginState>,
    url: string
  ) => MediaUrlProperties
): unknown {
  const extension: (
    context: BasePluginContext<MediaElementPluginDefinition>
  ) => MediaPluginExtension = ({ schema: innerSchema, store }) => {
    const { type } = innerSchema;
    const normalizeUrl = (url: string): MediaUrlProperties | undefined => {
      const state = store.get() as Readonly<MediaPluginState>;
      const normalized = normalizeUrlInput?.(state, url) ?? {
        url: state.transformUrl?.(url) ?? url,
      };

      return (state.isUrl ?? defaultIsUrl)(normalized.url)
        ? normalized
        : undefined;
    };

    return {
      api: () => ({ normalizeUrl }),
      commands: ({ around }) => [
        around(editorCommands.insertBreak, ({ next, state }) => {
          const selection = state.selection();

          if (!selection || state.selection.nodes().length > 0) return false;

          const anchorBlock = state.nodes.block({ at: selection.anchor });
          const focusBlock = state.nodes.block({ at: selection.focus });

          if (
            !anchorBlock ||
            !focusBlock ||
            anchorBlock[0].type !== type ||
            focusBlock[0].type !== type ||
            !PathApi.equals(anchorBlock[1], focusBlock[1])
          ) {
            return false;
          }

          const rightPath = PathApi.next(anchorBlock[1]);
          const result = next();

          if (result === false) return false;

          return state.transaction.extend(result, (tx) => {
            const right = tx.nodes.get(rightPath)?.[0];

            if (!ElementApi.isElement(right) || right.type !== type) {
              return;
            }

            tx.blocks.reset({ at: rightPath });
          });
        }),
      ],
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
          const element = {
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

          tx.nodes.set(
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

  return extension;
}

export type AudioPluginState = MediaPluginState;
export type FilePluginState = MediaPluginState;
export type VideoPluginState = MediaPluginState;

export const BaseAudioPlugin = defineBasePlugin(PLUGINS.audio, {
  initialState: (): AudioPluginState => ({}),
  schema: {
    element: schema.element.textBlock({
      isolating: true,
      keyboardSelectable: true,
      properties: mediaElementProperties,
    }),
  },
  codecs: ({ defineCodecs, schema: { type } }) =>
    defineCodecs({
      'text/markdown': {
        from: type,
        kind: 'node',
        decode: ({ caption, decode, node, parseAttributes }) => {
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

export type AudioElement = ElementOf<typeof BaseAudioPlugin>;

export const BaseFilePlugin = defineBasePlugin(PLUGINS.file, {
  initialState: (): FilePluginState => ({}),
  schema: {
    element: schema.element.textBlock({
      isolating: true,
      keyboardSelectable: true,
      properties: {
        ...mediaElementProperties,
        name: property.string(),
      },
    }),
  },
  codecs: ({ defineCodecs, schema: { type } }) =>
    defineCodecs({
      'text/markdown': {
        from: type,
        kind: 'node',
        decode: ({ caption, decode, node, parseAttributes }) => {
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

export type FileElement = ElementOf<typeof BaseFilePlugin>;

export const BaseVideoPlugin = defineBasePlugin(PLUGINS.video, {
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
  codecs: ({ defineCodecs, schema: { type } }) =>
    defineCodecs({
      'text/markdown': {
        from: type,
        kind: 'node',
        decode: ({ caption, decode, node, parseAttributes }) => {
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

export type VideoElement = ElementOf<typeof BaseVideoPlugin>;

/** Any element that carries the media width capability. */
export type ResizableElement = ElementWith<
  Pick<typeof mediaElementProperties, 'width'>
>;
