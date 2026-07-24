import type {
  AnyPluginConfig,
  BasePlugin,
  InferOptions,
  PluginConfig,
} from '@platejs/core';
import {
  type Descendant,
  ElementApi,
  type NodeInsertNodesOptions,
  property,
  schema,
  type SchemaElementProperties,
  TextApi,
  type Value,
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

export type MediaPluginOptions = {
  isUrl?: (text: string) => boolean;

  /** Transforms the url. */
  transformUrl?: (url: string) => string;
};

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

export type MediaPluginConfig = PluginConfig<string, MediaPluginOptions>;

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

const normalizeMediaDescendant = (
  input: unknown,
  location: string,
  {
    isInline,
    type,
  }: {
    isInline: (node: Descendant) => boolean;
    type: string;
  }
): Descendant => {
  if (TextApi.isText(input)) return input;
  if (!ElementApi.isElement(input)) {
    throw new Error(`Invalid media caption node at ${location}.`);
  }

  if (input.type !== type) {
    let changed = false;
    const children = input.children.map((child, index) => {
      const normalized = normalizeMediaDescendant(
        child,
        `${location}.${index}`,
        { isInline, type }
      );

      if (normalized !== child) changed = true;

      return normalized;
    });

    if (!changed) return input;

    return {
      ...input,
      children,
    };
  }

  const hasLegacyCaption = Object.hasOwn(input, 'caption');
  if (!hasLegacyCaption) return input;

  const legacyCaption = Reflect.get(input, 'caption');
  const normalizeCaptionChildren = (
    children: readonly unknown[],
    childLocation: string
  ) =>
    children.map((child, index) =>
      normalizeMediaDescendant(child, `${childLocation}.${index}`, {
        isInline,
        type,
      })
    );
  const isInlineCaptionChild = (child: Descendant) =>
    TextApi.isText(child) || (ElementApi.isElement(child) && isInline(child));
  const normalizeInlineChildren = (
    children: readonly unknown[],
    childLocation: string
  ) => {
    const normalized = normalizeCaptionChildren(children, childLocation);

    if (!normalized.every(isInlineCaptionChild)) {
      throw new Error(
        `Media caption at ${childLocation} must contain inline content.`
      );
    }

    return normalized;
  };
  const isAbsent = (children: readonly Descendant[]) =>
    children.length === 0 ||
    (children.length === 1 &&
      TextApi.isText(children[0]) &&
      children[0].text === '' &&
      Object.keys(children[0]).every((key) => key === 'text'));
  const direct = normalizeInlineChildren(
    input.children,
    `${location}.children`
  );
  let legacy: Descendant[] = [];

  if (!Array.isArray(legacyCaption)) {
    throw new Error(`Legacy media caption at ${location} must be an array.`);
  }

  const normalizedLegacy = normalizeCaptionChildren(
    legacyCaption,
    `${location}.caption`
  );

  if (normalizedLegacy.every(isInlineCaptionChild)) {
    legacy = normalizedLegacy;
  } else if (
    normalizedLegacy.length === 1 &&
    ElementApi.isElement(normalizedLegacy[0]) &&
    normalizedLegacy[0].children.every(isInlineCaptionChild)
  ) {
    legacy = normalizedLegacy[0].children;
  } else {
    throw new Error(
      `Legacy media caption at ${location} must contain inline content or one block wrapper.`
    );
  }

  const nonEmptySources = [direct, legacy].filter(
    (children) => !isAbsent(children)
  );

  if (nonEmptySources.length > 1) {
    throw new Error(
      `Media element at ${location} has multiple non-empty caption sources.`
    );
  }

  const { caption: _caption, ...element } = input;
  const children = nonEmptySources[0] ?? [{ text: '' }];

  return {
    ...element,
    children,
  };
};

/**
 * Installs direct-child caption normalization and media construction.
 *
 * @internal
 */
export const defineMediaPlugin = <C extends AnyPluginConfig>(
  plugin: BasePlugin<C>,
  normalizeInput?: (
    options: Readonly<InferOptions<C>>,
    input: MediaInsertInputForPluginKey<C['key']>
  ) => MediaInsertInputForPluginKey<C['key']>
) =>
  plugin
    .extend({
      transformInitialValue: ({ editor, type, value }) => {
        let changed = false;
        const normalizeChildren = (children: Value, root: string) => {
          let rootChanged = false;
          const normalized = children.map((child, index) => {
            const next = normalizeMediaDescendant(child, `${root}.${index}`, {
              isInline: editor.read.schema.isInline,
              type,
            });

            if (next !== child) {
              changed = true;
              rootChanged = true;
            }

            return next;
          }) as Value;

          return rootChanged ? normalized : children;
        };
        const children = normalizeChildren(value.children, 'main');
        let roots = value.roots;

        if (roots) {
          let rootsChanged = false;
          const nextRoots = Object.fromEntries(
            Object.entries(roots).map(([root, rootChildren]) => {
              const normalized = normalizeChildren(rootChildren, root);

              if (normalized !== rootChildren) rootsChanged = true;

              return [root, normalized];
            })
          );

          if (rootsChanged) roots = nextRoots;
        }

        if (!changed) return value;

        return { ...value, children, ...(roots ? { roots } : {}) };
      },
    })
    .extendTx<{
      insert: (
        input: MediaInsertInputForPluginKey<C['key']>,
        options?: NodeInsertNodesOptions<MediaElementForPluginKey<C['key']>>
      ) => void;
    }>(({ editor, ...context }) => (tx) => ({
      insert(input, options) {
        if (!tx.selection() && options?.at === undefined) return;

        const { caption, ...properties } =
          normalizeInput?.(context.getOptions(), input) ?? input;
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
    }));
