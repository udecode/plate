import {
  type BaseEditor,
  type DefinitionOf,
  defineBasePlugin,
  createRuleFactory,
} from '@platejs/core';
import {
  editorCommands,
  type Element,
  type ElementOf,
  type Location,
  type MaximizeMode,
  NodeApi,
  PathApi,
  type Range,
  RangeApi,
  type Text,
  type TextInsertFragmentOptions,
  property,
  schema,
} from '@platejs/plite';
import { PLUGINS } from '@platejs/utils';
import { isDefined, isUrl as defaultIsUrl, sanitizeUrl } from '@udecode/utils';

const BARE_AUTOLINK_LITERAL_RE = /^https?:\/\//i;

export type BaseLinkPluginState = {
  /** List of allowed URL schemes. */
  allowedSchemes: readonly string[];
  /** Skips sanitation of links. */
  dangerouslySkipSanitization: boolean;
  defaultLinkAttributes: React.AnchorHTMLAttributes<HTMLAnchorElement>;
  /** Keeps selected text on pasting links by default. */
  keepSelectedTextOnPaste: boolean;
  /** Configures the range used to find text before the selection. */
  rangeBeforeOptions: Parameters<BaseEditor['read']['points']['before']>[1];
  /** Resolves an href that differs from the displayed URL. */
  getUrlHref?: (url: string) => string | undefined;
  /** Validates link text. */
  isUrl: (text: string) => boolean;
  /** Transforms URL input before validation. */
  transformInput?: (url: string) => string | undefined;
};

export type CreateLinkNodeOptions = {
  url: string;
  children?: Text[];
  target?: string;
  text?: string;
};

export type UnwrapLinkOptions = {
  at?: Location;
  mode?: MaximizeMode;
  split?: boolean;
  voids?: boolean;
};

export interface WrapLinkOptions {
  url: string;
  at?: Location;
  mode?: MaximizeMode;
  split?: boolean;
  target?: string;
  voids?: boolean;
}

export type UpsertLinkOptions = {
  insertNodesOptions?: TextInsertFragmentOptions;
  /** Insert text when the selection is already in a link. */
  insertTextInLink?: boolean;
  skipValidation?: boolean;
  unwrapNodesOptions?: UnwrapLinkOptions;
  wrapNodesOptions?: Omit<WrapLinkOptions, 'url'>;
} & CreateLinkNodeOptions;

export type ValidateUrlOptions = Readonly<{
  allowedSchemes?: readonly string[];
  dangerouslySkipSanitization?: boolean;
  isUrl?: (text: string) => boolean;
}>;

type BaseLinkApi = {
  getAttributes: (
    link: Element
  ) => React.AnchorHTMLAttributes<HTMLAnchorElement>;
  validateUrl: (url: string) => boolean;
};

type LinkTextAutolinkMatch = {
  range: Range;
  url: string;
};

const LINK_AUTOMD_REGEX = /\[([^\]\n]+)]\((\S+)$/;
const MARKDOWN_HEADING_PATTERN = /^#{1,6}\s+/;
const MARKDOWN_LINK_SOURCE_PATTERN = /!?\[[^\]\n]*]\([^)\n]*$/;

const validateUrlWithOptions = (
  { allowedSchemes, dangerouslySkipSanitization, isUrl }: ValidateUrlOptions,
  url: string
) => {
  const customIsUrl = isUrl && isUrl !== defaultIsUrl ? isUrl : undefined;

  if (url.startsWith('/') && !url.startsWith('//')) {
    return customIsUrl ? customIsUrl(url) : true;
  }

  if (url.startsWith('#')) {
    if (MARKDOWN_HEADING_PATTERN.test(url)) return false;

    return customIsUrl ? customIsUrl(url) : true;
  }

  if (isUrl && !isUrl(url)) return false;

  return Boolean(
    dangerouslySkipSanitization ||
      sanitizeUrl(url, { allowedSchemes, permitInvalid: true })
  );
};

const initialState: BaseLinkPluginState = {
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  defaultLinkAttributes: {},
  dangerouslySkipSanitization: false,
  isUrl: defaultIsUrl,
  keepSelectedTextOnPaste: true,
  rangeBeforeOptions: {
    afterMatch: true,
    matchBlockStart: true,
    matchString: ' ',
    skipInvalid: true,
  },
};

/** Enables support for hyperlinks. */
export const BaseLinkPlugin = defineBasePlugin('link', {
  api: ({ store }): BaseLinkApi => ({
    getAttributes: (link) => {
      const {
        allowedSchemes,
        dangerouslySkipSanitization,
        defaultLinkAttributes,
      } = store.get();
      const url = typeof link.url === 'string' ? link.url : '';
      const href = dangerouslySkipSanitization
        ? url
        : sanitizeUrl(url, { allowedSchemes }) || undefined;

      return {
        ...defaultLinkAttributes,
        ...(href === undefined ? {} : { href }),
        ...(typeof link.target === 'string' ? { target: link.target } : {}),
      };
    },
    validateUrl: (url) => validateUrlWithOptions(store.get(), url),
  }),
  read: ({ plugin, state, store }) => ({
    findAutolink: (): LinkTextAutolinkMatch | undefined => {
      const selection = state.selection();

      if (!selection || !state.selection.isCollapsed()) return;

      const before = state.points.before(
        selection,
        store.get().rangeBeforeOptions
      );
      const block = before ? undefined : state.nodes.block({ at: selection });
      const blockStart = block && state.points.start(block[1]);
      const range = before
        ? { anchor: before, focus: selection.anchor }
        : blockStart
          ? { anchor: blockStart, focus: selection.anchor }
          : undefined;

      if (
        !range ||
        state.nodes.some({
          at: range,
          type: plugin,
        })
      ) {
        return;
      }

      const text = state.text.string(range);
      const { getUrlHref, isUrl } = store.get();
      const url = getUrlHref?.(text) ?? text;

      if (!isUrl(url)) return;

      return { range, url };
    },
  }),
  initialState,
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
      inline: true,
      properties: {
        target: property.string(),
        url: property.string({ required: true }),
      },
    },
  },
  codecs: ({ defineCodecs, store, schema: { type } }) =>
    defineCodecs({
      'text/html': {
        decode: ({ element }) => {
          const url = element.getAttribute('href');

          if (!url || !validateUrlWithOptions(store.get(), url)) return;

          return {
            target: element.getAttribute('target') || '_blank',
            url,
          };
        },
        encode: ({ content, node }) => {
          const { allowedSchemes, dangerouslySkipSanitization } = store.get();
          const url = typeof node.url === 'string' ? node.url : '';
          const href = dangerouslySkipSanitization
            ? url
            : sanitizeUrl(url, { allowedSchemes }) || undefined;

          if (!href) return null;

          return {
            attributes: {
              href,
              target: node.target,
            },
            children: content,
            tag: 'a',
          };
        },
        match: [{ tag: 'a' }],
      },
      'text/markdown': {
        from: 'link',
        kind: 'node',
        decode: ({ decode, decoration, node }) => ({
          children: decode(node.children, decoration),
          type,
          url: node.url,
        }),
        encode: ({ encodePhrasing, node, resourceLink }) => {
          const children = encodePhrasing(node.children);
          const url = typeof node.url === 'string' ? node.url : '';
          const isBareAutolinkLiteral =
            children.length === 1 &&
            children[0]?.type === 'text' &&
            children[0].value === url &&
            !resourceLink &&
            BARE_AUTOLINK_LITERAL_RE.test(url);

          if (isBareAutolinkLiteral) {
            return {
              type: 'html',
              value: url,
            };
          }

          return {
            children,
            type: 'link',
            url,
          };
        },
      },
    }),

  rules: {
    normalize: { removeEmpty: true },
    selection: { affinity: 'directional' },
  },
  render: {
    nodeProps: ({ element, store }) => {
      const {
        allowedSchemes,
        dangerouslySkipSanitization,
        defaultLinkAttributes,
      } = store.get();
      const url = typeof element.url === 'string' ? element.url : '';
      const href = dangerouslySkipSanitization
        ? url
        : sanitizeUrl(url, { allowedSchemes }) || undefined;

      return {
        ...defaultLinkAttributes,
        ...(href === undefined ? {} : { href }),
        ...(typeof element.target === 'string'
          ? { target: element.target }
          : {}),
      };
    },
  },
})
  .extend(({ api, plugin, schema: { type } }) => ({
    update: ({ tx }) => ({
      exitEnd: () => {
        const selection = tx.selection();

        if (!selection || !tx.selection.isCollapsed()) return;

        const link = tx.nodes.above({
          at: selection,
          type: plugin,
        });

        if (!link || !tx.points.isEnd(selection.focus, link[1])) return;

        const nextPoint = tx.points.after(link[1]);

        if (nextPoint) {
          tx.selection.set(nextPoint);
        } else {
          const nextPath = PathApi.next(link[1]);

          tx.nodes.insert({ text: '' }, { at: nextPath });
          tx.selection.set({ offset: 0, path: nextPath });
        }

        return true;
      },
      insert: (
        { children, target, text = '', url }: CreateLinkNodeOptions,
        options?: TextInsertFragmentOptions
      ) => {
        tx.fragment.replace(
          [
            {
              children: children ?? [{ text }],
              ...(target === undefined ? {} : { target }),
              type,
              url,
            },
          ],
          options
        );
      },
      unwrap: (options?: UnwrapLinkOptions) => {
        const selection = tx.selection();

        if (options?.split && selection) {
          const [start, end] = RangeApi.edges(selection);
          const linkAboveStart = tx.nodes.above({
            at: start,
            type: plugin,
          });
          const linkAboveEnd = tx.nodes.above({
            at: end,
            type: plugin,
          });

          if (
            linkAboveStart &&
            linkAboveEnd &&
            PathApi.equals(linkAboveStart[1], linkAboveEnd[1])
          ) {
            const linkPath = linkAboveStart[1];
            let selectedPath = linkPath;

            if (!tx.points.isEnd(end, linkPath)) {
              tx.nodes.split({ at: end, type: plugin });
            }
            if (!tx.points.isStart(start, linkPath)) {
              tx.nodes.split({ at: start, type: plugin });
              selectedPath = PathApi.next(linkPath);
            }

            tx.nodes.unwrap({ at: selectedPath, type: plugin });

            return true;
          }

          const point = linkAboveStart ? start : linkAboveEnd ? end : undefined;
          const link = linkAboveStart ?? linkAboveEnd;

          if (point && link) {
            tx.nodes.split({ at: point, type: plugin });
            tx.nodes.unwrap({
              at: PathApi.next(link[1]),
              type: plugin,
            });

            return true;
          }
        }

        tx.nodes.unwrap({ type: plugin, ...options });
      },
      upsert: ({
        insertNodesOptions,
        insertTextInLink,
        skipValidation = false,
        target,
        text,
        unwrapNodesOptions,
        url,
        wrapNodesOptions,
      }: UpsertLinkOptions) => {
        const selection = tx.selection();

        if (!selection) return;

        const linkAbove = tx.nodes.above({
          at: selection,
          type: plugin,
        });

        if (insertTextInLink && linkAbove) {
          tx.text.insert(url, { at: selection });

          return true;
        }
        if (!skipValidation && !api.validateUrl(url)) return;

        const nextText = isDefined(text) && text.length === 0 ? url : text;
        const updateText = () => {
          const link = tx.nodes.above({ type: plugin });

          if (!link) return;

          const [linkNode, linkPath] = link;

          if (!nextText?.length || nextText === tx.text.string(linkPath)) {
            return;
          }

          tx.nodes.replaceChildren(
            [{ ...linkNode.children[0], text: nextText }],
            {
              at: linkPath,
            }
          );

          const end = tx.points.end(linkPath);

          if (end) tx.selection.set(end);
        };

        if (linkAbove) {
          const [link, linkPath] = linkAbove;

          if (url !== link.url) {
            tx.nodes.set({ url }, { at: linkPath });
          }
          if (target !== link.target) {
            if (target === undefined) {
              tx.nodes.unset('target', { at: linkPath });
            } else {
              tx.nodes.set({ target }, { at: linkPath });
            }
          }

          updateText();

          return true;
        }

        const linkEntry = tx.nodes.find({
          at: selection,
          type: plugin,
        });

        if (RangeApi.isExpanded(selection)) {
          const unwrapOptions = { split: true, ...unwrapNodesOptions };
          const [start, end] = RangeApi.edges(selection);
          const linkAboveStart = tx.nodes.above({
            at: start,
            type: plugin,
          });
          const linkAboveEnd = tx.nodes.above({
            at: end,
            type: plugin,
          });

          if (
            linkAboveStart &&
            linkAboveEnd &&
            PathApi.equals(linkAboveStart[1], linkAboveEnd[1])
          ) {
            const linkPath = linkAboveStart[1];
            let selectedPath = linkPath;

            if (!tx.points.isEnd(end, linkPath)) {
              tx.nodes.split({ at: end, type: plugin });
            }
            if (!tx.points.isStart(start, linkPath)) {
              tx.nodes.split({ at: start, type: plugin });
              selectedPath = PathApi.next(linkPath);
            }

            tx.nodes.unwrap({ at: selectedPath, type: plugin });
          } else {
            const point = linkAboveStart
              ? start
              : linkAboveEnd
                ? end
                : undefined;
            const link = linkAboveStart ?? linkAboveEnd;

            if (point && link) {
              tx.nodes.split({ at: point, type: plugin });
              tx.nodes.unwrap({
                at: PathApi.next(link[1]),
                type: plugin,
              });
            } else {
              tx.nodes.unwrap({ type: plugin, ...unwrapOptions });
            }
          }

          tx.nodes.wrap(
            {
              children: [],
              ...(target === undefined ? {} : { target }),
              type,
              url,
            },
            { split: true, ...wrapNodesOptions }
          );
          updateText();

          return true;
        }

        const leaf = tx.nodes.leaf(selection.focus.path);

        if (!leaf) return;

        tx.fragment.replace(
          [
            {
              ...(linkEntry ? NodeApi.extractProps(linkEntry[0]) : {}),
              children: [
                { ...leaf[0], text: nextText?.length ? nextText : url },
              ],
              ...(target === undefined ? {} : { target }),
              type,
              url,
            },
          ],
          insertNodesOptions
        );

        return true;
      },
      upsertText: ({ text }: UpsertLinkOptions) => {
        const link = tx.nodes.above({ type: plugin });

        if (!link) return;

        const [linkNode, linkPath] = link;

        if (!text?.length || text === tx.text.string(linkPath)) return;

        tx.nodes.replaceChildren([{ ...linkNode.children[0], text }], {
          at: linkPath,
        });

        const end = tx.points.end(linkPath);

        if (end) tx.selection.set(end);
      },
      wrap: ({ target, url, ...options }: WrapLinkOptions) => {
        tx.nodes.wrap(
          {
            children: [],
            ...(target === undefined ? {} : { target }),
            type,
            url,
          },
          { split: true, ...options }
        );
      },
    }),
  }))
  .extend(({ plugin }) => ({
    commands: ({ around }) => [
      around(editorCommands.insertText, ({ input, state, next }) => {
        if (input.options?.at) return next();

        const selection = state.selection();

        if (!selection || !state.selection.isCollapsed()) {
          return next();
        }

        const link = state.nodes.above({
          at: selection,
          type: plugin,
        });

        if (!link || !state.points.isEnd(selection.focus, link[1])) {
          return next();
        }

        const prefix = state.transaction((tx) => {
          tx.plugin(plugin).exitEnd();
        });

        return next.after(prefix);
      }),
    ],
  }));

export type LinkElement = ElementOf<typeof BaseLinkPlugin>;
export type BaseLinkDefinition = DefinitionOf<typeof BaseLinkPlugin>;

const createLinkRule = createRuleFactory(BaseLinkPlugin);

const breakAutolinkRule = createLinkRule<{}, {}, LinkTextAutolinkMatch>({
  type: 'insertBreak',
  resolve: ({ editor }) => editor.plugin(BaseLinkPlugin).read.findAutolink(),
  apply: (context, match) => {
    context.tx.selection.set(match.range);

    if (
      !context.tx.link.upsert({
        url: match.url,
      })
    ) {
      return;
    }

    context.tx.selection.collapse({ edge: 'end' });

    context.tx.link.exitEnd();

    context.insertBreak();

    return true;
  },
});

const pasteAutolinkRule = createLinkRule<
  {},
  {},
  { shouldLink: boolean; text: string; url: string }
>({
  type: 'insertData',
  resolve: (context) => {
    if (!context.text) return;

    const { getUrlHref } = context.editor.plugin(BaseLinkPlugin).store.get();
    const url = getUrlHref?.(context.text) ?? context.text;

    if (!context.editor.plugin(BaseLinkPlugin).api.validateUrl(url)) return;

    const selection = context.editor.read.selection();
    let shouldLink = false;

    const codeBlock = context.editor.plugin(PLUGINS.codeBlock);

    if (
      selection &&
      (!codeBlock.installed ||
        !context.editor.read.nodes.above({
          at: selection,
          type: codeBlock.schema.type,
        }))
    ) {
      shouldLink =
        !context.editor.read.selection.isCollapsed() ||
        !MARKDOWN_LINK_SOURCE_PATTERN.test(
          context.getBlockTextBeforeSelection()
        );
    }

    return { shouldLink, text: context.text, url };
  },
  apply: (context, match) => {
    if (match.shouldLink) {
      const { keepSelectedTextOnPaste } = context.editor
        .plugin(BaseLinkPlugin)
        .store.get();
      const inserted = context.tx.link.upsert({
        insertTextInLink: true,
        text: keepSelectedTextOnPaste ? undefined : match.url,
        url: match.url,
      });

      if (inserted) return true;
    }

    context.tx.text.insert(match.text);

    return true;
  },
});

const spaceAutolinkRule = createLinkRule<{}, {}, LinkTextAutolinkMatch>({
  type: 'insertText',
  trigger: ' ',
  resolve: (context) =>
    context.text === ' '
      ? context.editor.plugin(BaseLinkPlugin).read.findAutolink()
      : undefined,
  apply: (context, match) => {
    context.tx.selection.set(match.range);

    if (
      !context.tx.link.upsert({
        url: match.url,
      })
    ) {
      return;
    }

    context.tx.selection.collapse({ edge: 'end' });

    context.tx.link.exitEnd();

    context.insertText(context.text, context.options);

    return true;
  },
});

export const LinkRules = {
  markdown: createLinkRule<{}, {}, { range: Range; text: string; url: string }>(
    {
      type: 'insertText',
      trigger: ')',
      resolve: ({ editor, options, text }) => {
        if (text !== ')' || options?.at) return;

        const selection = editor.read.selection();

        if (!selection || !editor.read.selection.isCollapsed()) return;
        const codeBlock = editor.plugin(PLUGINS.codeBlock);

        if (
          editor.read.nodes.above({
            at: selection,
            type: codeBlock.installed
              ? [codeBlock.schema.type, BaseLinkPlugin]
              : BaseLinkPlugin,
          })
        ) {
          return;
        }

        const block = editor.read.nodes.block({ at: selection });
        const blockStart = block && editor.read.points.start(block[1]);
        const blockRange = blockStart
          ? { anchor: blockStart, focus: selection.anchor }
          : undefined;

        if (!blockRange) return;

        const textBefore = editor.read.text.string(blockRange);
        const match = LINK_AUTOMD_REGEX.exec(textBefore);

        if (!match) return;

        const [, linkText, rawUrl] = match;
        const { transformInput } = editor.plugin(BaseLinkPlugin).store.get();
        const url = transformInput ? (transformInput(rawUrl) ?? '') : rawUrl;

        if (!url || !editor.plugin(BaseLinkPlugin).api.validateUrl(url)) return;

        const startPoint = editor.read.points.before(selection, {
          distance: match[0].length,
          unit: 'character',
        });

        if (!startPoint) return;

        return {
          range: { anchor: startPoint, focus: selection.anchor },
          text: linkText,
          url,
        };
      },
      apply: (context, match) => {
        const inserted = context.tx.link.upsert({
          insertNodesOptions: { at: match.range },
          skipValidation: true,
          text: match.text,
          url: match.url,
        });

        if (inserted) {
          context.tx.link.exitEnd();

          return true;
        }

        context.insertText(context.text, context.options);

        return true;
      },
    }
  ),
  autolink: (
    options:
      | ({ variant: 'break' } & NonNullable<
          Parameters<typeof breakAutolinkRule>[0]
        >)
      | ({ variant: 'paste' } & NonNullable<
          Parameters<typeof pasteAutolinkRule>[0]
        >)
      | ({ variant: 'space' } & NonNullable<
          Parameters<typeof spaceAutolinkRule>[0]
        >)
  ) => {
    if (options.variant === 'break') {
      const { variant: _, ...runtime } = options;

      return breakAutolinkRule(runtime);
    }
    if (options.variant === 'paste') {
      const { variant: _, ...runtime } = options;

      return pasteAutolinkRule(runtime);
    }

    const { variant: _, ...runtime } = options;

    return spaceAutolinkRule(runtime);
  },
};
