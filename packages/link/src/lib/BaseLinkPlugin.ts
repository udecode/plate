import {
  type BaseEditor,
  type InferConfig,
  type PlatePluginTxGroup,
  type PlatePluginTransaction,
  createBasePlugin,
  createRuleFactory,
} from '@platejs/core';
import {
  editorCommands,
  type Element,
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
import { KEYS } from '@platejs/utils';
import type { TLinkElement } from '@platejs/utils';
import { isDefined, isUrl as defaultIsUrl, sanitizeUrl } from '@udecode/utils';

export type BaseLinkOptions = {
  /** List of allowed URL schemes. */
  allowedSchemes?: readonly string[];
  /** Skips sanitation of links. */
  dangerouslySkipSanitization?: boolean;
  defaultLinkAttributes?: React.AnchorHTMLAttributes<HTMLAnchorElement>;
  forceSubmit?: boolean;
  /** Keeps selected text on pasting links by default. */
  keepSelectedTextOnPaste?: boolean;
  /** Configures the range used to find text before the selection. */
  rangeBeforeOptions?: Parameters<BaseEditor['read']['points']['before']>[1];
  /** Hotkeys that trigger the floating link UI. */
  triggerFloatingLinkHotkeys?: readonly string[] | string;
  /** Resolves a URL for the keyboard shortcut and toolbar action. */
  getLinkUrl?: (prevUrl: string | null) => Promise<string | null>;
  /** Resolves an href that differs from the displayed URL. */
  getUrlHref?: (url: string) => string | undefined;
  /** Validates link text. */
  isUrl?: (text: string) => boolean;
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

type BaseLinkTx = {
  insert: (
    node: CreateLinkNodeOptions,
    options?: TextInsertFragmentOptions
  ) => void;
  unwrap: (options?: UnwrapLinkOptions) => boolean | void;
  upsert: (options: UpsertLinkOptions) => boolean | void;
  upsertText: (options: UpsertLinkOptions) => void;
  wrap: (options: WrapLinkOptions) => void;
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

const BaseLinkPluginDefinition = createBasePlugin({
  options: {
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
    triggerFloatingLinkHotkeys: 'meta+k, ctrl+k',
  } as BaseLinkOptions,
  key: 'link',
  render: {
    nodeProps: ({ element, getOptions }) => {
      const {
        allowedSchemes,
        dangerouslySkipSanitization,
        defaultLinkAttributes,
      } = getOptions();
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
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
      inline: true,
      properties: {
        target: property.string(),
        url: property.string(),
      },
    },
  },
  parsers: {
    html: {
      deserializer: {
        rules: [{ validNodeName: 'A' }],
        parse: ({ element, options, type }) => {
          const url = element.getAttribute('href');

          if (url && validateUrlWithOptions(options, url)) {
            return {
              target: element.getAttribute('target') || '_blank',
              type,
              url,
            };
          }
        },
      },
    },
  },
  rules: {
    normalize: { removeEmpty: true },
    selection: { affinity: 'directional' },
  },
  type: KEYS.link,
}).extendApi<BaseLinkApi>(({ getOptions }) => ({
  getAttributes: (link) => {
    const {
      allowedSchemes,
      dangerouslySkipSanitization,
      defaultLinkAttributes,
    } = getOptions();
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
  validateUrl: (url) => validateUrlWithOptions(getOptions(), url),
}));

/** Enables support for hyperlinks. */
export const BaseLinkPlugin = BaseLinkPluginDefinition.extendTxGroup<
  'link',
  PlatePluginTxGroup<BaseLinkTx, InferConfig<typeof BaseLinkPluginDefinition>>
>('link', ({ api, type }) => (tx) => ({
  insert: ({ children, target, text = '', url }, options) => {
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
  unwrap: (options) => {
    const selection = tx.selection();

    if (options?.split && selection) {
      const [start, end] = RangeApi.edges(selection);
      const linkAboveStart = tx.nodes.above({
        at: start,
        match: { type },
      });
      const linkAboveEnd = tx.nodes.above({
        at: end,
        match: { type },
      });

      if (
        linkAboveStart &&
        linkAboveEnd &&
        PathApi.equals(linkAboveStart[1], linkAboveEnd[1])
      ) {
        const linkPath = linkAboveStart[1];
        let selectedPath = linkPath;

        if (!tx.points.isEnd(end, linkPath)) {
          tx.nodes.split({ at: end, match: { type } });
        }
        if (!tx.points.isStart(start, linkPath)) {
          tx.nodes.split({ at: start, match: { type } });
          selectedPath = PathApi.next(linkPath);
        }

        tx.nodes.unwrap({ at: selectedPath, match: { type } });

        return true;
      }

      const point = linkAboveStart ? start : linkAboveEnd ? end : undefined;
      const link = linkAboveStart ?? linkAboveEnd;

      if (point && link) {
        tx.nodes.split({ at: point, match: { type } });
        tx.nodes.unwrap({ at: PathApi.next(link[1]), match: { type } });

        return true;
      }
    }

    tx.nodes.unwrap({ match: { type }, ...options });
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
  }) => {
    const selection = tx.selection();

    if (!selection) return;

    const linkAbove = tx.nodes.above<TLinkElement>({
      at: selection,
      match: { type },
    });

    if (insertTextInLink && linkAbove) {
      tx.text.insert(url, { at: selection });

      return true;
    }
    if (!skipValidation && !api.validateUrl(url)) return;

    const nextText = isDefined(text) && text.length === 0 ? url : text;
    const updateText = () => {
      const link = tx.nodes.above<Element>({ match: { type } });

      if (!link) return;

      const [linkNode, linkPath] = link;

      if (!nextText?.length || nextText === tx.text.string(linkPath)) {
        return;
      }

      tx.nodes.replaceChildren([{ ...linkNode.children[0], text: nextText }], {
        at: linkPath,
      });

      const end = tx.points.end(linkPath);

      if (end) tx.selection.set(end);
    };

    if (linkAbove) {
      const [link] = linkAbove;

      if (url !== link.url) {
        tx.nodes.set<TLinkElement>({ url }, { at: link });
      }
      if (target !== link.target) {
        if (target === undefined) {
          tx.nodes.unset('target', { at: link });
        } else {
          tx.nodes.set<TLinkElement>({ target }, { at: link });
        }
      }

      updateText();

      return true;
    }

    const linkEntry = tx.nodes.find<TLinkElement>({
      at: selection,
      match: { type },
    });

    if (RangeApi.isExpanded(selection)) {
      const unwrapOptions = { split: true, ...unwrapNodesOptions };
      const [start, end] = RangeApi.edges(selection);
      const linkAboveStart = tx.nodes.above({
        at: start,
        match: { type },
      });
      const linkAboveEnd = tx.nodes.above({
        at: end,
        match: { type },
      });

      if (
        linkAboveStart &&
        linkAboveEnd &&
        PathApi.equals(linkAboveStart[1], linkAboveEnd[1])
      ) {
        const linkPath = linkAboveStart[1];
        let selectedPath = linkPath;

        if (!tx.points.isEnd(end, linkPath)) {
          tx.nodes.split({ at: end, match: { type } });
        }
        if (!tx.points.isStart(start, linkPath)) {
          tx.nodes.split({ at: start, match: { type } });
          selectedPath = PathApi.next(linkPath);
        }

        tx.nodes.unwrap({ at: selectedPath, match: { type } });
      } else {
        const point = linkAboveStart ? start : linkAboveEnd ? end : undefined;
        const link = linkAboveStart ?? linkAboveEnd;

        if (point && link) {
          tx.nodes.split({ at: point, match: { type } });
          tx.nodes.unwrap({
            at: PathApi.next(link[1]),
            match: { type },
          });
        } else {
          tx.nodes.unwrap({ match: { type }, ...unwrapOptions });
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
          children: [{ ...leaf[0], text: nextText?.length ? nextText : url }],
          ...(target === undefined ? {} : { target }),
          type,
          url,
        },
      ],
      insertNodesOptions
    );

    return true;
  },
  upsertText: ({ text }) => {
    const link = tx.nodes.above<Element>({ match: { type } });

    if (!link) return;

    const [linkNode, linkPath] = link;

    if (!text?.length || text === tx.text.string(linkPath)) return;

    tx.nodes.replaceChildren([{ ...linkNode.children[0], text }], {
      at: linkPath,
    });

    const end = tx.points.end(linkPath);

    if (end) tx.selection.set(end);
  },
  wrap: ({ target, url, ...options }) => {
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
})).extendExtension(({ type }) => ({
  commands: ({ around }) => [
    around(editorCommands.insertText, ({ input, state, next }) => {
      if (input.options?.at) return next();

      const selection = state.selection();

      if (!selection || !state.selection.isCollapsed()) {
        return next();
      }

      const link = state.nodes.above<Element>({
        at: selection,
        match: { type },
      });

      if (!link || !state.points.isEnd(selection.focus, link[1])) {
        return next();
      }

      const nextPoint = state.points.after(link[1]);
      const prefix = state.transaction((tx) => {
        if (nextPoint) {
          tx.selection.set(nextPoint);
        } else {
          const nextPath = PathApi.next(link[1]);

          tx.nodes.insert({ text: '' }, { at: nextPath });
          tx.selection.set({ offset: 0, path: nextPath });
        }
      });

      return next.after(prefix);
    }),
  ],
}));

export type BaseLinkConfig = InferConfig<typeof BaseLinkPlugin>;

type BaseLinkContract = BaseLinkConfig;

type LinkTextAutolinkMatch = {
  range: Range;
  url: string;
};

const getRangeFromBlockStart = (editor: BaseEditor, range: Range) => {
  const block = editor.read.nodes.block({ at: range });
  const start = block && editor.read.points.start(block[1]);

  if (!start) return;

  return { anchor: start, focus: range.anchor };
};

const getAutolinkMatch = (
  editor: BaseEditor
): LinkTextAutolinkMatch | undefined => {
  const { getUrlHref, isUrl, rangeBeforeOptions } = editor
    .plugin(BaseLinkPlugin)
    .getOptions();
  const selection = editor.read.selection();

  if (!selection || !editor.read.selection.isCollapsed()) return;

  const before = editor.read.points.before(selection, rangeBeforeOptions);
  const beforeWordRange = before
    ? { anchor: before, focus: selection.anchor }
    : getRangeFromBlockStart(editor, selection);

  if (!beforeWordRange) return;
  if (
    editor.read.nodes.some({
      at: beforeWordRange,
      match: { type: editor.getType(BaseLinkPlugin.key) },
    })
  ) {
    return;
  }

  const text = editor.read.text.string(beforeWordRange);
  const url = getUrlHref?.(text) ?? text;

  if (!isUrl?.(url)) return;

  return { range: beforeWordRange, url };
};

const breakAutolinkRule = createRuleFactory<{}, {}, LinkTextAutolinkMatch>({
  type: 'insertBreak',
  resolve: ({ editor }) => getAutolinkMatch(editor),
  apply: (context, match) => {
    context.tx.selection.set(match.range);

    if (
      !(context.tx as PlatePluginTransaction<BaseLinkContract>).link.upsert({
        url: match.url,
      })
    ) {
      return;
    }

    context.tx.selection.collapse({ edge: 'end' });

    const selection = context.tx.selection();
    const linkEntry = selection
      ? context.tx.nodes.above({
          at: selection,
          match: { type: context.editor.getType(BaseLinkPlugin.key) },
        })
      : undefined;

    if (
      selection &&
      linkEntry &&
      context.tx.points.isEnd(selection.focus, linkEntry[1])
    ) {
      const nextPoint = context.tx.points.after(linkEntry[1]);

      if (nextPoint) {
        context.tx.selection.set(nextPoint);
      } else {
        const nextPath = PathApi.next(linkEntry[1]);
        context.tx.nodes.insert({ text: '' }, { at: nextPath });
        context.tx.selection.set({ offset: 0, path: nextPath });
      }
    }

    context.insertBreak();

    return true;
  },
});

const pasteAutolinkRule = createRuleFactory<
  {},
  {},
  { shouldLink: boolean; text: string; url: string }
>({
  type: 'insertData',
  resolve: (context) => {
    if (!context.text) return;

    const { getUrlHref } = context.editor.plugin(BaseLinkPlugin).getOptions();
    const url = getUrlHref?.(context.text) ?? context.text;

    if (!context.editor.plugin(BaseLinkPlugin).api.validateUrl(url)) return;

    const selection = context.editor.read.selection();
    let shouldLink = false;

    if (
      selection &&
      !context.editor.read.nodes.above({
        at: selection,
        match: { type: context.editor.getType(KEYS.codeBlock) },
      })
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
        .getOptions();
      const inserted = (
        context.tx as PlatePluginTransaction<BaseLinkContract>
      ).link.upsert({
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

const spaceAutolinkRule = createRuleFactory<{}, {}, LinkTextAutolinkMatch>({
  type: 'insertText',
  trigger: ' ',
  resolve: (context) =>
    context.text === ' ' ? getAutolinkMatch(context.editor) : undefined,
  apply: (context, match) => {
    context.tx.selection.set(match.range);

    if (
      !(context.tx as PlatePluginTransaction<BaseLinkContract>).link.upsert({
        url: match.url,
      })
    ) {
      return;
    }

    context.tx.selection.collapse({ edge: 'end' });

    const selection = context.tx.selection();
    const linkEntry = selection
      ? context.tx.nodes.above({
          at: selection,
          match: { type: context.editor.getType(BaseLinkPlugin.key) },
        })
      : undefined;

    if (
      selection &&
      linkEntry &&
      context.tx.points.isEnd(selection.focus, linkEntry[1])
    ) {
      const nextPoint = context.tx.points.after(linkEntry[1]);

      if (nextPoint) {
        context.tx.selection.set(nextPoint);
      } else {
        const nextPath = PathApi.next(linkEntry[1]);
        context.tx.nodes.insert({ text: '' }, { at: nextPath });
        context.tx.selection.set({ offset: 0, path: nextPath });
      }
    }

    context.insertText(context.text, context.options);

    return true;
  },
});

export const LinkRules = {
  markdown: createRuleFactory<
    {},
    {},
    { range: Range; text: string; url: string }
  >({
    type: 'insertText',
    trigger: ')',
    resolve: ({ editor, options, text }) => {
      if (text !== ')' || options?.at) return;

      const selection = editor.read.selection();

      if (!selection || !editor.read.selection.isCollapsed()) return;
      if (
        editor.read.nodes.above({
          at: selection,
          match: {
            type: [
              editor.getType(KEYS.codeBlock),
              editor.getType(BaseLinkPlugin.key),
            ],
          },
        })
      ) {
        return;
      }

      const blockRange = getRangeFromBlockStart(editor, selection);

      if (!blockRange) return;

      const textBefore = editor.read.text.string(blockRange);
      const match = LINK_AUTOMD_REGEX.exec(textBefore);

      if (!match) return;

      const [, linkText, rawUrl] = match;
      const { transformInput } = editor.plugin(BaseLinkPlugin).getOptions();
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
      const inserted = (
        context.tx as PlatePluginTransaction<BaseLinkContract>
      ).link.upsert({
        insertNodesOptions: { at: match.range },
        skipValidation: true,
        text: match.text,
        url: match.url,
      });

      if (inserted) {
        const selection = context.tx.selection();
        const linkEntry = selection
          ? context.tx.nodes.above({
              at: selection,
              match: { type: context.editor.getType(BaseLinkPlugin.key) },
            })
          : undefined;

        if (
          selection &&
          linkEntry &&
          context.tx.points.isEnd(selection.focus, linkEntry[1])
        ) {
          const nextPoint = context.tx.points.after(linkEntry[1]);

          if (nextPoint) {
            context.tx.selection.set(nextPoint);
          } else {
            const nextPath = PathApi.next(linkEntry[1]);
            context.tx.nodes.insert({ text: '' }, { at: nextPath });
            context.tx.selection.set({ offset: 0, path: nextPath });
          }
        }

        return true;
      }

      context.insertText(context.text, context.options);

      return true;
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
    const runtime = {
      enabled: options.enabled,
      priority: options.priority,
    };

    if (options.variant === 'break') return breakAutolinkRule(runtime);
    if (options.variant === 'paste') return pasteAutolinkRule(runtime);

    return spaceAutolinkRule(runtime);
  },
};
