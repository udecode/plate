import {
  isUrl as defaultIsUrl,
  type BasePluginContext,
  type BasePluginDefinition,
  type BasePluginDefinitionInput,
  definePlugin,
  type Descendant,
  editorCommands,
  type EditorUpdateContext,
  type Element,
  ElementApi,
  type ElementOf,
  type ElementWith,
  PathApi,
  type BlockInsertOptions,
  type BlockUpsertOptions,
  type PluginTransaction,
  PLUGINS,
  property,
  schema,
  type SchemaElement,
  type SchemaElementProperties,
} from '../../../core';
import { applyBlockInsertion } from '../../../internal/plugin/blockInsertion';

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
  isUrl: ((text: string) => boolean) | null;

  /** Transforms the url. */
  transformUrl: ((url: string) => string) | null;
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
    options?: BlockInsertOptions
  ) => boolean;
  setUrl: (input: { element: Element; url: string }) => boolean;
  upsert: (
    input: MediaInsertInputForPlugin<C['name']>,
    options?: BlockUpsertOptions
  ) => boolean;
};

type MediaPluginApi = {
  /** Resolves app-owned URL input and inserts at the captured document target. */
  insertUrl: (
    getUrl: () =>
      | string
      | null
      | undefined
      | Promise<string | null | undefined>,
    options?: BlockInsertOptions & {
      caption?: MediaInsertInput['caption'];
    }
  ) => Promise<boolean>;
  normalizeUrl: (url: string) => MediaUrlProperties | undefined;
};

type MediaPluginStage = {
  api: (
    context: BasePluginContext<MediaElementPluginDefinition> & {
      update: MediaPluginUpdate<MediaElementPluginDefinition>;
    }
  ) => MediaPluginApi;
  commands: NonNullable<
    BasePluginDefinitionInput<MediaElementPluginDefinition>['commands']
  >;
  update: (
    context: BasePluginContext<MediaElementPluginDefinition> & {
      context: EditorUpdateContext;
      tx: PluginTransaction<MediaElementPluginDefinition>;
    }
  ) => {
    insert: (input: MediaInsertInput, options?: BlockInsertOptions) => boolean;
    setUrl: (input: { element: Element; url: string }) => boolean;
    upsert: (input: MediaInsertInput, options?: BlockUpsertOptions) => boolean;
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
      tx: PluginTransaction<C>;
    }
  ) => MediaPluginUpdate<C>;
};
export function defineMediaPlugin(
  normalizeUrlInput?: (
    state: Readonly<MediaPluginState>,
    url: string
  ) => MediaUrlProperties
): unknown {
  const stage: (
    context: BasePluginContext<MediaElementPluginDefinition>
  ) => MediaPluginStage = ({ schema: innerSchema, store }) => {
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
      api: ({ editor, update }) => ({
        insertUrl: async (getUrl, { at, after, caption, ...options } = {}) => {
          const atAnchor =
            at === undefined
              ? undefined
              : editor.anchor(at, {
                  association: 'forward',
                  deletion: 'nearest',
                });
          const block =
            at === undefined
              ? editor.read.nodes.block({ at: after })?.[0]
              : undefined;

          if (!atAnchor && !block) return false;

          try {
            const url = await getUrl();

            if (!url) return false;

            const resolvedAt = atAnchor?.resolve();
            const blockPath = block ? editor.read.nodes.path(block) : undefined;

            if ((atAnchor && !resolvedAt) || (block && !blockPath)) {
              return false;
            }

            if (resolvedAt) {
              return update.insert(
                { caption, url },
                { ...options, at: resolvedAt }
              );
            }
            return update.insert(
              { caption, url },
              { ...options, after: block }
            );
          } finally {
            atAnchor?.release();
          }
        },
        normalizeUrl,
      }),
      commands: ({ around }) => [
        around(editorCommands.insertBreak, ({ next, state }) => {
          const selection = state.selection();

          if (!selection || state.selection.nodes().length > 0) return next();

          const anchorBlock = state.nodes.block({ at: selection.anchor });
          const focusBlock = state.nodes.block({ at: selection.focus });

          if (
            !anchorBlock ||
            !focusBlock ||
            anchorBlock[0].type !== type ||
            focusBlock[0].type !== type ||
            !PathApi.equals(anchorBlock[1], focusBlock[1])
          ) {
            return next();
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
      update: ({ tx }) => {
        const applyMediaInsertion = (
          mode: 'insert' | 'upsert',
          input: MediaInsertInput,
          options: BlockInsertOptions | BlockUpsertOptions = {}
        ) => {
          const resolvedOptions = options as BlockInsertOptions;

          if (
            !tx.selection() &&
            resolvedOptions.at === undefined &&
            resolvedOptions.after === undefined
          ) {
            return false;
          }

          const normalized = normalizeUrl(input.url);
          if (!normalized) return false;
          const { caption, ...properties } = { ...input, ...normalized };
          const element = {
            ...properties,
            children:
              typeof caption === 'string'
                ? [{ text: caption }]
                : caption && caption.length > 0
                  ? caption
                  : [{ text: '' }],
            type,
          };
          const insert = (insertOptions: BlockInsertOptions) => {
            if (
              insertOptions.at === undefined ||
              insertOptions.after !== undefined
            ) {
              return !!tx.blocks.insertAfter(element, {
                ...insertOptions,
                at: insertOptions.after,
              });
            }

            tx.nodes.insert(element, insertOptions);
            return !!tx.nodes.path(element);
          };

          return (
            applyBlockInsertion({
              insert,
              matches: (block) =>
                block.type === type &&
                block.url === element.url &&
                block.provider === element.provider &&
                block.sourceUrl === element.sourceUrl,
              mode,
              onReuse: () => true,
              options,
              tx,
            }) ?? true
          );
        };

        return {
          insert(input, options) {
            return applyMediaInsertion('insert', input, options);
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
          upsert(input, options) {
            return applyMediaInsertion('upsert', input, options);
          },
        };
      },
    };
  };

  return stage;
}

export type AudioPluginState = MediaPluginState;
export type FilePluginState = MediaPluginState;
export type VideoPluginState = MediaPluginState;

export const BaseAudioPlugin = definePlugin(PLUGINS.audio, {
  initialState: (): AudioPluginState => ({ isUrl: null, transformUrl: null }),
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

export const BaseFilePlugin = definePlugin(PLUGINS.file, {
  initialState: (): FilePluginState => ({ isUrl: null, transformUrl: null }),
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

export const BaseVideoPlugin = definePlugin(PLUGINS.video, {
  initialState: (): VideoPluginState => ({ isUrl: null, transformUrl: null }),
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
