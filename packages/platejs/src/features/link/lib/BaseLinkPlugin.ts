import {
  type DefinitionOf,
  type Editor,
  type Element,
  type ElementOf,
  type InsertBreakInputRuleReadContext,
  type InsertDataInputRuleReadContext,
  type InsertTextInputRuleReadContext,
  type Location,
  type MaximizeMode,
  NodeApi,
  PathApi,
  type Range,
  RangeApi,
  type Text,
  type TextInsertFragmentOptions,
  defineInputRule,
  definePlugin,
  editorCommands,
  isDefined,
  property,
  schema,
  txLocate,
  locateAt,
} from '../../../core';
import { registerFirstPartyPlugin } from '../../../internal/plugin/firstPartyPlugin';
import { decideUrl, isStoredUrl } from '../../../internal/utils/urlPolicy';

const BARE_AUTOLINK_LITERAL_RE = /^https?:\/\//i;

function encodeUrlInput(url: string) {
  try {
    return url
      .split(/(%[\dA-Fa-f]{2})/)
      .map((part) =>
        /^%[\dA-Fa-f]{2}$/.test(part)
          ? part
          : encodeURI(part).replaceAll('%25', '%')
      )
      .join('');
  } catch (error) {
    if (error instanceof URIError) return url;
    throw error;
  }
}

export type LinkAttributes = Record<string, unknown> & {
  className?: string;
  download?: boolean | string;
  href?: string;
  rel?: string;
  target?: string;
  title?: string;
};

export type BaseLinkPluginState = {
  /**
   * URL schemes the link feature accepts when it inserts, types, pastes or
   * imports a link, and that a rendered link may use. A link pasted as an
   * exact editor fragment keeps its URL. Relative URLs are always allowed;
   * script-capable schemes such as `javascript:` and `data:` never are.
   */
  allowedSchemes: readonly string[];
  defaultLinkAttributes: LinkAttributes;
  /** Keeps selected text on pasting links by default. */
  keepSelectedTextOnPaste: boolean;
  /**
   * Returns the href for typed or pasted text, or `undefined` when the text is
   * not a link. `defaultParseUrl` accepts a whole token with an explicit
   * scheme. The href still has to pass `allowedSchemes`.
   */
  parseUrl: (
    text: string,
    defaultParseUrl: (text: string) => string | undefined
  ) => string | undefined;
  /** Configures the range used to find text before the selection. */
  rangeBeforeOptions: NonNullable<
    Parameters<Editor['read']['points']['before']>[1]
  >;
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
} & CreateLinkNodeOptions;

type BaseLinkApi = {
  getAttributes: (link: Element) => LinkAttributes;
};

type LinkTextAutolinkMatch = {
  range: Range;
  url: string;
};

const LINK_AUTOMD_REGEX = /\[([^\]\n]+)]\((\S+)$/;
const SCHEME_TOKEN = /^([a-z][a-z\d+.-]*):(\S+)$/i;

const isUnfinishedLinkSource = (before: string) => {
  const destinationStart =
    Math.max(before.lastIndexOf(')'), before.lastIndexOf('\n')) + 1;

  for (
    let open = before.lastIndexOf('](');
    open >= destinationStart;
    open = open === 0 ? -1 : before.lastIndexOf('](', open - 1)
  ) {
    for (let index = open - 1; index >= 0; index--) {
      if (before[index] === '[') return true;
      if (before[index] === ']' || before[index] === '\n') break;
    }
  }

  return false;
};

const DEFAULT_ALLOWED_SCHEMES: readonly string[] = [
  'http',
  'https',
  'mailto',
  'tel',
];

/**
 * Returns the href a link may navigate to, or `undefined` when the link
 * feature refuses `url`. Surrounding spaces are trimmed. Relative URLs are
 * allowed, except one that starts with `//`. Script-capable schemes such as
 * `javascript:` and `data:`, malformed absolute URLs and any URL holding a
 * control character or backslash are refused. Any other absolute URL needs a
 * scheme in `allowedSchemes`, which defaults to `http`, `https`, `mailto` and
 * `tel`; when the link plugin is installed, pass its `allowedSchemes`.
 */
export const getLinkHref = (
  url: string,
  {
    allowedSchemes = DEFAULT_ALLOWED_SCHEMES,
  }: Readonly<{ allowedSchemes?: readonly string[] }> = {}
): string | undefined => {
  const decision = decideUrl('navigation', url, { allowedSchemes });

  return decision.ok ? decision.url : undefined;
};

const admitLinkInput = (allowedSchemes: readonly string[], input: string) =>
  getLinkHref(encodeUrlInput(input), { allowedSchemes });

const defaultParseUrl = (text: string) => {
  const match = SCHEME_TOKEN.exec(text);

  if (!match) return undefined;

  const [, scheme, rest] = match;

  if (!rest.startsWith('//')) {
    return /^https?$/i.test(scheme) ? undefined : text;
  }
  // URL accepts a dots-only host, as in the `http://...` placeholder.
  try {
    return /[^.]/.test(new URL(text).hostname) ? text : undefined;
  } catch {
    return undefined;
  }
};

const recognizeLinkText = (
  { allowedSchemes, parseUrl }: BaseLinkPluginState,
  text: string
) => {
  const href = parseUrl(text, defaultParseUrl);

  return href === undefined ? undefined : admitLinkInput(allowedSchemes, href);
};

const getLinkAttributes = (
  { allowedSchemes, defaultLinkAttributes }: BaseLinkPluginState,
  link: Element
): LinkAttributes => {
  const { href: _, ...attributes } = defaultLinkAttributes;
  const href =
    typeof link.url === 'string'
      ? getLinkHref(link.url, { allowedSchemes })
      : undefined;

  return {
    ...attributes,
    ...(href === undefined ? {} : { href }),
    ...(typeof link.target === 'string' ? { target: link.target } : {}),
  };
};

const refusedLinkMessage = (format: 'HTML' | 'Markdown', url: string) =>
  `${format} link destination "${url}" is not a link this editor allows; its label was kept.`;

const initialState: BaseLinkPluginState = {
  allowedSchemes: DEFAULT_ALLOWED_SCHEMES,
  defaultLinkAttributes: {},
  keepSelectedTextOnPaste: true,
  parseUrl: (text, parse) => parse(text),
  rangeBeforeOptions: {
    afterMatch: true,
    matchBlockStart: true,
    matchString: ' ',
    skipInvalid: true,
  },
};

/** Enables support for hyperlinks. */
export const BaseLinkPlugin = definePlugin('link', {
  api: ({ store }): BaseLinkApi => ({
    getAttributes: (link) => getLinkAttributes(store.get(), link),
  }),
  initialState,
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
      inline: true,
      properties: {
        target: property.string(),
        url: property.string({
          required: true,
          validate: isStoredUrl('navigation'),
          validationVersion: 1,
        }),
      },
    },
  },
  formats: ({ defineFormats, schema: { type } }) =>
    defineFormats({
      plainText: {
        encode: ({ children, node }) =>
          !node.url || children === node.url
            ? children || node.url
            : `${children} (${node.url})`,
      },
      html: {
        decode: ({ element, pluginState, report }) => {
          const href = element.getAttribute('href');

          if (!href) return undefined;

          const url = getLinkHref(href, {
            allowedSchemes: pluginState.allowedSchemes,
          });

          // Unsafe destinations are already removed; this is the app's
          // narrower URL choice, so the destination is a real loss.
          if (url === undefined) {
            // The label stays, so only the destination is lost.
            report({
              action: 'unwrapped',
              kind: 'attribute',
              message: refusedLinkMessage('HTML', href),
            });

            return undefined;
          }

          const target = element.getAttribute('target');

          return { ...(target ? { target } : {}), url };
        },
        encode: ({ content, node, preserve }) => {
          // Export writes the stored destination: `allowedSchemes` narrows
          // insertion, import and rendering, not what a document holds. The
          // schema already keeps a stored URL above the navigation floor.
          if (!node.url) return { children: content, tag: 'span' };

          preserve('target', 'url');

          return {
            attributes: {
              href: node.url,
              target: node.target,
            },
            children: content,
            tag: 'a',
          };
        },
        match: [{ tag: 'a' }],
      },
      markdown: {
        node: 'link',
        decode: ({ decode, marks, node, pluginState, report }) => {
          const children = decode(node.children, marks);

          // Unsafe destinations are already removed; this is the app's
          // narrower scheme choice, so the destination is a real loss.
          if (
            node.url !== '' &&
            !getLinkHref(node.url, {
              allowedSchemes: pluginState.allowedSchemes,
            })
          ) {
            report({
              action: 'unwrapped',
              kind: 'property',
              message: refusedLinkMessage('Markdown', node.url),
              nodeType: 'link',
            });

            return children;
          }

          return { children, type, url: node.url };
        },
        encode: ({ encodePhrasing, node, preserve, resourceLink }) => {
          const children = encodePhrasing(node.children);

          preserve('url');
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
    attributes: ({ element, store }) => getLinkAttributes(store.get(), element),
  },
})
  .extend(({ plugin, schema: { type }, store }) => ({
    update: ({ tx }) => ({
      exitEnd: () => {
        const selection = tx.selection();

        if (!selection || !tx.selection.isCollapsed()) {
          return undefined;
        }

        const link = tx.nodes.above({
          at: selection,
          type: plugin,
        });

        if (!link || !tx.points.isEnd(selection.focus, link[1])) {
          return undefined;
        }

        const nextPoint = tx.points.after(link[1]);

        if (
          nextPoint &&
          PathApi.equals(
            PathApi.parent(nextPoint.path),
            PathApi.parent(link[1])
          )
        ) {
          tx.selection.set(nextPoint);
        } else {
          const nextPath = PathApi.next(link[1]);

          tx.nodes.insert({ text: '' }, { at: nextPath });
          tx.selection.set({ offset: 0, path: nextPath });
        }

        return true;
      },
      insert: txLocate(
        locateAt(1),
        (
          { children, target, text = '', url: inputUrl }: CreateLinkNodeOptions,
          options?: TextInsertFragmentOptions
        ) => {
          const url = admitLinkInput(store.get().allowedSchemes, inputUrl);

          if (url === undefined) return undefined;

          return (
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
            ) || undefined
          );
        }
      ),
      unwrap: txLocate(
        locateAt(0),
        (options?: UnwrapLinkOptions) =>
          tx.nodes.unwrap({ type: plugin, ...options }) || undefined
      ),
      upsert: txLocate(
        ([options], place) => {
          const insert = options.insertNodesOptions;

          if (insert?.at === undefined) return [options];

          const at = place.location(insert.at);

          return at && [{ ...options, insertNodesOptions: { ...insert, at } }];
        },
        ({
          insertNodesOptions,
          target,
          text,
          url: inputUrl,
        }: UpsertLinkOptions) => {
          const selection = tx.selection();

          if (!selection || tx.selection.nodes().length > 0) return undefined;

          const linkAbove = tx.nodes.above({
            at: selection,
            type: plugin,
          });

          const url = admitLinkInput(store.get().allowedSchemes, inputUrl);

          if (url === undefined) return undefined;

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

          if (RangeApi.isExpanded(selection)) {
            tx.nodes.unwrap({ split: true, type: plugin });

            if (
              !tx.nodes.wrap(
                {
                  children: [],
                  ...(target === undefined ? {} : { target }),
                  type,
                  url,
                },
                { split: true }
              )
            ) {
              return undefined;
            }

            updateText();

            return true;
          }

          const linkEntry = tx.nodes.find({
            at: selection,
            type: plugin,
          });
          const leaf = tx.nodes.leaf(selection.focus.path);

          if (!leaf) return undefined;

          return (
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
            ) || undefined
          );
        }
      ),
      upsertText: txLocate(false, ({ text }: UpsertLinkOptions) => {
        const link = tx.nodes.above({ type: plugin });

        if (!link) return;

        const [linkNode, linkPath] = link;

        if (!text?.length || text === tx.text.string(linkPath)) return;

        tx.nodes.replaceChildren([{ ...linkNode.children[0], text }], {
          at: linkPath,
        });

        const end = tx.points.end(linkPath);

        if (end) tx.selection.set(end);
      }),
      wrap: txLocate(
        locateAt(0),
        ({ target, url: inputUrl, ...options }: WrapLinkOptions) => {
          const url = admitLinkInput(store.get().allowedSchemes, inputUrl);

          if (url === undefined) return undefined;

          return (
            tx.nodes.wrap(
              {
                children: [],
                ...(target === undefined ? {} : { target }),
                type,
                url,
              },
              { split: true, ...options }
            ) || undefined
          );
        }
      ),
    }),
  }))
  .extend(({ plugin }) => ({
    commands: ({ around }) => [
      around(editorCommands.insertText, ({ input, state, next }) => {
        const target = input.options?.at;
        const currentSelection = state.selection();

        if (
          target &&
          (!currentSelection ||
            !RangeApi.isRange(target) ||
            !RangeApi.equals(target, currentSelection))
        ) {
          return next();
        }

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
          tx.plugin(plugin.name).exitEnd();
        });

        return next.after(prefix);
      }),
    ],
  }));

export type LinkElement = ElementOf<typeof BaseLinkPlugin>;
export type BaseLinkDefinition = DefinitionOf<typeof BaseLinkPlugin>;

type InputRuleOptions<TContext> = {
  enabled?: (context: TContext) => boolean;
  priority?: number;
};

const findAutolink = (
  editor: InsertTextInputRuleReadContext['editor']
): LinkTextAutolinkMatch | undefined => {
  const selection = editor.read.selection();

  if (!selection || !editor.read.selection.isCollapsed()) return undefined;

  const state = editor.plugin(BaseLinkPlugin).store.get();
  const before = editor.read.points.before(selection, state.rangeBeforeOptions);
  const block = before ? undefined : editor.read.nodes.block({ at: selection });
  const blockStart = block && editor.read.points.start(block[1]);
  const range = before
    ? { anchor: before, focus: selection.anchor }
    : blockStart
      ? { anchor: blockStart, focus: selection.anchor }
      : undefined;

  if (!range || editor.read.nodes.some({ at: range, type: BaseLinkPlugin })) {
    return undefined;
  }

  const url = recognizeLinkText(state, editor.read.text.string(range));

  return url === undefined ? undefined : { range, url };
};

const breakAutolinkRule = (
  options: InputRuleOptions<InsertBreakInputRuleReadContext> = {}
) =>
  defineInputRule(BaseLinkPlugin, {
    ...options,
    target: 'insertBreak',
    resolve: ({ editor }) => findAutolink(editor),
    apply: ({ decline, next, tx }, match) => {
      tx.selection.set(match.range);

      if (!tx.link.upsert({ url: match.url })) return decline();

      tx.selection.collapse({ edge: 'end' });
      tx.link.exitEnd();

      return next();
    },
  });

const pasteAutolinkRule = (
  options: InputRuleOptions<InsertDataInputRuleReadContext> = {}
) =>
  defineInputRule(BaseLinkPlugin, {
    ...options,
    target: 'insertData',
    resolve: (context) => {
      const { editor, text } = context;
      const selection = editor.read.selection();

      if (!text || !selection) return undefined;

      const url = recognizeLinkText(
        editor.plugin(BaseLinkPlugin).store.get(),
        text
      );

      if (url === undefined) return undefined;

      if (
        editor.read.nodes.above({ at: selection, type: BaseLinkPlugin }) ||
        editor.read.selection.nodes().length > 0 ||
        (editor.read.selection.isCollapsed() &&
          isUnfinishedLinkSource(context.getBlockTextBeforeSelection()))
      ) {
        return { text };
      }

      return { url };
    },
    apply: ({ decline, editor, tx }, match) => {
      if (match.text !== undefined) {
        tx.text.insert(match.text);

        return undefined;
      }

      const { keepSelectedTextOnPaste } = editor
        .plugin(BaseLinkPlugin)
        .store.get();

      return tx.link.upsert({
        text: keepSelectedTextOnPaste ? undefined : match.url,
        url: match.url,
      })
        ? undefined
        : decline();
    },
  });

const spaceAutolinkRule = (
  options: InputRuleOptions<InsertTextInputRuleReadContext> = {}
) =>
  defineInputRule(BaseLinkPlugin, {
    ...options,
    target: 'insertText',
    trigger: ' ',
    resolve: (context) => findAutolink(context.editor),
    apply: ({ decline, text, tx }, match) => {
      tx.selection.set(match.range);

      if (!tx.link.upsert({ url: match.url })) return decline();

      tx.selection.collapse({ edge: 'end' });
      tx.link.exitEnd();
      tx.text.insert(text);

      return undefined;
    },
  });

export const LinkRules = {
  markdown: (
    ruleOptions: InputRuleOptions<InsertTextInputRuleReadContext> = {}
  ) =>
    defineInputRule(BaseLinkPlugin, {
      ...ruleOptions,
      target: 'insertText',
      trigger: ')',
      resolve: ({ editor, text }) => {
        if (text !== ')') return undefined;

        const selection = editor.read.selection();

        if (!selection || !editor.read.selection.isCollapsed()) {
          return undefined;
        }
        if (editor.read.nodes.above({ at: selection, type: BaseLinkPlugin })) {
          return undefined;
        }

        const block = editor.read.nodes.block({ at: selection });
        const blockStart = block && editor.read.points.start(block[1]);
        const blockRange = blockStart
          ? { anchor: blockStart, focus: selection.anchor }
          : undefined;

        if (!blockRange) return undefined;

        const textBefore = editor.read.text.string(blockRange);
        const match = LINK_AUTOMD_REGEX.exec(textBefore);

        if (!match) return undefined;

        const isImageSource = textBefore[match.index - 1] === '!';

        if (isImageSource) return undefined;

        const [, linkText, destination] = match;
        const url = admitLinkInput(
          editor.plugin(BaseLinkPlugin).store.get().allowedSchemes,
          destination
        );

        if (url === undefined) return undefined;

        const startPoint = editor.read.points.before(selection, {
          distance: match[0].length,
          unit: 'character',
        });

        if (!startPoint) return undefined;

        return {
          range: { anchor: startPoint, focus: selection.anchor },
          text: linkText,
          url,
        };
      },
      apply: ({ decline, tx }, match) => {
        if (
          !tx.link.upsert({
            insertNodesOptions: { at: match.range },
            text: match.text,
            url: match.url,
          })
        ) {
          return decline();
        }

        tx.link.exitEnd();

        return undefined;
      },
    }),
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

registerFirstPartyPlugin(BaseLinkPlugin);
