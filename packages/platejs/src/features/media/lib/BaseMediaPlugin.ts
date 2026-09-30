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
import { decideUrl, isStoredUrl } from '../../../internal/utils/urlPolicy';
import {
  readHtmlMediaProvider,
  readHtmlMediaWidth,
  writeHtmlMediaProvider,
  writeHtmlMediaWidth,
} from './mediaHtml.internal';

export const mediaElementProperties = {
  width: property.json({
    validate: (value): value is number | string =>
      (typeof value === 'number' && Number.isFinite(value)) ||
      typeof value === 'string',
    validationVersion: 1,
  }),
} satisfies SchemaElementProperties;

const readMediaWidth = (media: HTMLElement) => {
  const width = readHtmlMediaWidth(media.style.width);

  return width === undefined ? {} : { width };
};

// Media names its source in `src` or its first `<source>` child.
const readMediaSource = (media: HTMLElement) =>
  media.getAttribute('src') ||
  media.querySelector(':scope > source[src]')?.getAttribute('src') ||
  undefined;

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

/**
 * What a media URL loads: an image, audio or video, a file download, or an
 * embedded page. Insertion refuses a URL its kind cannot load.
 */
export type MediaUrlKind = 'embed' | 'file' | 'image' | 'media';

/** Installs direct-caption editing, URL normalization, and media construction. */
export function defineMediaPlugin<const C extends MediaElementPluginDefinition>(
  kind: MediaUrlKind,
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
  kind: MediaUrlKind,
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

      return (state.isUrl ?? defaultIsUrl)(normalized.url) &&
        decideUrl(kind, normalized.url).ok &&
        (normalized.sourceUrl === undefined ||
          decideUrl('navigation', normalized.sourceUrl).ok)
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

          const edges = state.ranges.edges(selection);
          const start = edges?.[0];
          const block = start && state.nodes.block({ at: start });

          if (!block || block[0].type !== type) return next();

          let delegate = false;
          let valid = true;
          const result = state.transaction((tx) => {
            if (!tx.selection.isCollapsed()) tx.fragment.delete();

            const caret = tx.selection();
            const media = caret && tx.nodes.block({ at: caret.anchor });

            if (!media || media[0].type !== type) {
              delegate = true;
              return;
            }

            const end = tx.points.end(media[1]);

            if (!end) {
              valid = false;
              return;
            }

            const suffix = tx.slice.get({
              at: { anchor: caret.anchor, focus: end },
            });
            const defaultBlock = tx.schema.createDefaultRootChild(
              caret.anchor.root
            );

            if (!defaultBlock || !ElementApi.isElement(defaultBlock)) {
              valid = false;
              return;
            }

            if (suffix.content.length > 0) {
              tx.fragment.delete({
                at: { anchor: caret.anchor, focus: end },
              });
            }

            const inserted = tx.blocks.insertAfter(defaultBlock, {
              at: media[1],
              replaceEmpty: false,
            });

            if (!inserted) {
              valid = false;
              return;
            }

            const point = tx.points.start(inserted);

            if (!point) {
              valid = false;
              return;
            }

            if (
              suffix.content.length > 0 &&
              !tx.slice.replace(suffix, { at: point })
            ) {
              valid = false;
              return;
            }

            const startPoint = tx.points.start(inserted);

            if (!startPoint) {
              valid = false;
              return;
            }

            tx.selection.set(startPoint);
          });

          if (!valid) return false;

          return delegate ? next.after(result) : result;
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
            resolvedOptions.after === undefined &&
            resolvedOptions.before === undefined
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
      object: true,
      properties: {
        url: property.string({
          required: true,
          validate: isStoredUrl('media'),
          validationVersion: 1,
        }),
        ...mediaElementProperties,
      },
    }),
  },
  formats: ({ defineFormats, schema: { type } }) =>
    defineFormats({
      html: [
        {
          decode: ({ element }) => {
            const media = element.querySelector<HTMLElement>(':scope > audio');
            const url = media ? readMediaSource(media) : undefined;

            if (!media || !url) return undefined;

            return { ...readMediaWidth(media), url };
          },
          encode: ({ content, node, preserve }) => {
            if (typeof node.url !== 'string' || node.url.length === 0) {
              return null;
            }

            preserve('url', 'width');

            return {
              attributes: { class: 'editor-audio' },
              children: [
                {
                  attributes: { controls: true, src: node.url },
                  children: [],
                  style: { width: writeHtmlMediaWidth(node.width) },
                  tag: 'audio',
                },
                { children: content, tag: 'figcaption' },
              ],
              tag: 'figure',
            };
          },
          match: [{ className: 'editor-audio', tag: 'figure' }],
          priority: 16,
        },
        {
          decode: ({ element }) => {
            if (element.parentElement?.matches('figure.editor-audio')) {
              return undefined;
            }

            const url = readMediaSource(element);

            if (!url) return undefined;

            // Fallback text is for browsers without media support, not a caption.
            return {
              children: [{ text: '' }],
              ...readMediaWidth(element),
              url,
            };
          },
          decodeOnly: true,
          match: [{ tag: 'audio' }],
        },
      ],
      plainText: {
        encode: ({ children, node }) =>
          children && children !== node.url
            ? `${children} (${node.url})`
            : node.url,
      },
      markdown: { tag: type, attributes: { url: 'src' } },
    }),
}).extend(defineMediaPlugin('media'));

export type AudioElement = ElementOf<typeof BaseAudioPlugin>;

export const BaseFilePlugin = definePlugin(PLUGINS.file, {
  initialState: (): FilePluginState => ({ isUrl: null, transformUrl: null }),
  schema: {
    element: schema.element.textBlock({
      object: true,
      properties: {
        url: property.string({
          required: true,
          validate: isStoredUrl('file'),
          validationVersion: 1,
        }),
        ...mediaElementProperties,
        name: property.string(),
      },
    }),
  },
  formats: ({ defineFormats, schema: { type } }) =>
    defineFormats({
      plainText: {
        encode: ({ children, node }) => {
          const label = children || node.name || node.url;

          return label === node.url ? node.url : `${label} (${node.url})`;
        },
      },
      markdown: { tag: type, attributes: { url: 'src' } },
    }),
}).extend(defineMediaPlugin('file'));

export type FileElement = ElementOf<typeof BaseFilePlugin>;

export const BaseVideoPlugin = definePlugin(PLUGINS.video, {
  initialState: (): VideoPluginState => ({ isUrl: null, transformUrl: null }),
  schema: {
    element: schema.element.textBlock({
      object: true,
      properties: {
        url: property.string({
          required: true,
          validate: isStoredUrl('media'),
          validationVersion: 1,
        }),
        ...mediaElementProperties,
        provider: property.string(),
        sourceUrl: property.string({
          validate: isStoredUrl('navigation'),
          validationVersion: 1,
        }),
      },
    }),
  },
  formats: ({ defineFormats, schema: { type } }) =>
    defineFormats({
      html: [
        {
          decode: ({ element, preserve, report }) => {
            const media = element.querySelector<HTMLElement>(':scope > video');
            const url = media ? readMediaSource(media) : undefined;

            if (!media || !url) return undefined;

            return {
              ...readHtmlMediaProvider(element, { preserve, report }),
              ...readMediaWidth(media),
              url,
            };
          },
          encode: ({ content, node, preserve }) => {
            if (typeof node.url !== 'string' || node.url.length === 0) {
              return null;
            }

            preserve('provider', 'sourceUrl', 'url', 'width');

            return {
              attributes: {
                class: 'editor-video',
                ...writeHtmlMediaProvider(node),
              },
              children: [
                {
                  attributes: { controls: true, src: node.url },
                  children: [],
                  style: { width: writeHtmlMediaWidth(node.width) },
                  tag: 'video',
                },
                { children: content, tag: 'figcaption' },
              ],
              tag: 'figure',
            };
          },
          match: [{ className: 'editor-video', tag: 'figure' }],
          priority: 18,
        },
        {
          decode: ({ element }) => {
            if (element.parentElement?.matches('figure.editor-video')) {
              return undefined;
            }

            const url = readMediaSource(element);

            if (!url) return undefined;

            // Fallback text is for browsers without media support, not a caption.
            return {
              children: [{ text: '' }],
              ...readMediaWidth(element),
              url,
            };
          },
          decodeOnly: true,
          match: [{ tag: 'video' }],
        },
      ],
      plainText: {
        encode: ({ children, node }) =>
          children && children !== node.url
            ? `${children} (${node.url})`
            : node.url,
      },
      markdown: { tag: type, attributes: { url: 'src' } },
    }),
}).extend(defineMediaPlugin('media'));

export type VideoElement = ElementOf<typeof BaseVideoPlugin>;

/** Any element that carries the media width capability. */
export type ResizableElement = ElementWith<
  Pick<typeof mediaElementProperties, 'width'>
>;
