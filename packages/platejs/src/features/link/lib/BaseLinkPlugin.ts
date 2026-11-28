import {
  type Descendant,
  type EditorTransactionSpecBuilder,
  type Element,
  ElementApi,
  type ElementOf,
  type InsertBreakInputRuleReadContext,
  type InsertDataInputRuleReadContext,
  type InsertTextInputRuleReadContext,
  type Location,
  LocationApi,
  type MaximizeMode,
  PathApi,
  type Point,
  type Range,
  RangeApi,
  type Text,
  TextApi,
  defineInputRule,
  definePlugin,
  editorCommands,
  isDefined,
  locateAt,
  property,
  schema,
  txLocate,
} from '../../../core';
import {
  decideUrl,
  encodeUrlInput,
  isBareAutolinkLiteral,
  isStoredUrl,
} from '../../../internal/utils/urlPolicy';

type LinkTextAutolinkMatch = {
  hasTrailing: boolean;
  range: Range;
  url: string;
};

type MarkdownLinkSourceMatch = {
  destination: string;
  isImage: boolean;
  label: string;
  labelEnd: number;
  labelStart: number;
  openParenDepth: number;
  start: number;
};

const SCHEME_TOKEN = /^([a-z][a-z\d+.-]*):(\S+)$/i;
const WWW_TOKEN = /^www\.[^\s]+$/i;
const LEADING_AUTOLINK_WRAPPERS = new Set(['(', '[', '{', '<', "'", '"']);
const TRAILING_AUTOLINK_PUNCTUATION = new Set([
  '.',
  ',',
  ';',
  ':',
  '!',
  '?',
  "'",
  '"',
]);
const CLOSING_TO_OPENING_BRACKET: Record<string, string> = {
  ')': '(',
  '>': '<',
  ']': '[',
  '}': '{',
};

const scanUnclosedMarkdownLink = (
  textBefore: string
): MarkdownLinkSourceMatch | undefined => {
  const lineStart = textBefore.lastIndexOf('\n') + 1;

  for (
    let open = textBefore.lastIndexOf('](');
    open >= lineStart;
    open = open === 0 ? -1 : textBefore.lastIndexOf('](', open - 1)
  ) {
    let depth = 0;
    let closed = false;

    for (let index = open + 2; index < textBefore.length; index++) {
      const ch = textBefore[index];

      if (ch === '(') {
        depth += 1;
      } else if (ch === ')') {
        depth -= 1;
        if (depth < 0) {
          closed = true;
          break;
        }
      }
    }

    if (closed) continue;

    let bracket = -1;

    for (let index = open - 1; index >= lineStart; index--) {
      if (textBefore[index] === '[') {
        bracket = index;
        break;
      }
      if (textBefore[index] === ']') break;
    }

    if (bracket === -1) continue;

    return {
      destination: textBefore.slice(open + 2),
      isImage: bracket > 0 && textBefore[bracket - 1] === '!',
      label: textBefore.slice(bracket + 1, open),
      labelEnd: open,
      labelStart: bracket + 1,
      openParenDepth: depth,
      start: bracket,
    };
  }

  return undefined;
};

const isUnfinishedLinkSource = (before: string) =>
  scanUnclosedMarkdownLink(before) !== undefined;

const stripAutolinkWrappers = (raw: string) => {
  let start = 0;
  let end = raw.length;

  while (start < end && LEADING_AUTOLINK_WRAPPERS.has(raw[start] ?? '')) {
    start += 1;
  }

  while (end > start) {
    const ch = raw[end - 1] ?? '';

    if (TRAILING_AUTOLINK_PUNCTUATION.has(ch)) {
      end -= 1;
      continue;
    }

    const opener = CLOSING_TO_OPENING_BRACKET[ch];

    if (opener) {
      let opens = 0;
      let closes = 0;

      for (let index = start; index < end; index++) {
        if (raw[index] === opener) opens += 1;
        else if (raw[index] === ch) closes += 1;
      }

      if (closes > opens) {
        end -= 1;
        continue;
      }
    }

    break;
  }

  return { end, start };
};

const DEFAULT_ALLOWED_SCHEMES: readonly string[] = [
  'http',
  'https',
  'mailto',
  'tel',
];

const validateStoredLinkUrl = isStoredUrl('navigation');

/**
 * Schema property validation contract for a stored navigation destination.
 * Accepts the empty placeholder string, relative URLs outside `//`, and valid
 * absolute URLs outside the script-capable floor (`javascript:`, `vbscript:`,
 * `data:`, `blob:`, `filesystem:`), rejecting control characters and
 * backslashes. Pass it to `property.string(linkUrlValidation)` so the schema
 * fingerprint tracks `validationVersion`. Call `getLinkHref` to check whether a
 * stored URL renders as an active link under `allowedSchemes`.
 */
export const linkUrlValidation: Readonly<{
  validate: (
    value: unknown
  ) => value is string & { readonly '~storedLinkUrl': true };
  validationVersion: number;
}> = Object.freeze({
  validate: (
    value: unknown
  ): value is string & { readonly '~storedLinkUrl': true } =>
    validateStoredLinkUrl(value),
  validationVersion: 1,
});

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
  if (WWW_TOKEN.test(text)) {
    const candidate = `https://${text}`;

    try {
      const labels = new URL(candidate).hostname.split('.');
      const tld = labels.at(-1) ?? '';

      if (
        labels.length >= 3 &&
        labels.every((label) => label.length > 0) &&
        /[a-z]/i.test(tld)
      ) {
        return candidate;
      }
    } catch {
      return undefined;
    }

    return undefined;
  }

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
  {
    allowedSchemes,
    parseUrl,
  }: Readonly<{
    allowedSchemes: readonly string[];
    parseUrl: (
      text: string,
      defaultParseUrl: (text: string) => string | undefined
    ) => string | undefined;
  }>,
  text: string
) => {
  const href = parseUrl(text, defaultParseUrl);

  return href === undefined ? undefined : admitLinkInput(allowedSchemes, href);
};

const getLinkAttributes = (
  {
    allowedSchemes,
    defaultLinkAttributes,
  }: Readonly<{
    allowedSchemes: readonly string[];
    defaultLinkAttributes: Record<string, unknown> & {
      className?: string;
      download?: boolean | string;
      rel?: string;
      target?: string;
      title?: string;
    };
  }>,
  link: Element
): Record<string, unknown> & {
  className?: string;
  download?: boolean | string;
  href?: string;
  rel?: string;
  target?: string;
  title?: string;
} => {
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

const exitLinkEnd = (tx: EditorTransactionSpecBuilder, type: string) => {
  const selection = tx.selection();

  if (!selection || !tx.selection.isCollapsed()) {
    return undefined;
  }

  const link = tx.nodes.above({
    at: selection,
    type,
  });

  if (!link || !tx.points.isEnd(selection.focus, link[1])) {
    return undefined;
  }

  const nextPoint = tx.points.after(link[1]);

  if (
    nextPoint &&
    PathApi.equals(PathApi.parent(nextPoint.path), PathApi.parent(link[1]))
  ) {
    tx.selection.set(nextPoint);
  } else {
    const nextPath = PathApi.next(link[1]);

    tx.nodes.insert({ text: '' }, { at: nextPath });
    tx.selection.set({ offset: 0, path: nextPath });
  }

  return true;
};

const refusedLinkMessage = (format: 'HTML' | 'Markdown', url: string) =>
  `${format} link destination "${url}" is not a link this editor allows; its label was kept.`;

const initialState: {
  /**
   * URL schemes the link feature accepts when it inserts, types, pastes or
   * imports a link, and that a rendered link may use. A link pasted as an
   * exact editor fragment keeps its URL. Relative URLs are always allowed;
   * script-capable schemes such as `javascript:` and `data:` never are.
   */
  allowedSchemes: readonly string[];
  defaultLinkAttributes: Record<string, unknown> & {
    className?: string;
    download?: boolean | string;
    rel?: string;
    target?: string;
    title?: string;
  };
  /** Keeps selected text on pasting links by default. */
  keepSelectedTextOnPaste: boolean;
  /**
   * Returns the href for typed or pasted text, or `undefined` when the text is
   * not a link. `defaultParseUrl` accepts a whole token with an explicit
   * scheme or `www.` domain. The href still has to pass `allowedSchemes`.
   */
  parseUrl: (
    text: string,
    defaultParseUrl: (text: string) => string | undefined
  ) => string | undefined;
} = {
  allowedSchemes: DEFAULT_ALLOWED_SCHEMES,
  defaultLinkAttributes: {},
  keepSelectedTextOnPaste: true,
  parseUrl: (text, parse) => parse(text),
};

/** Enables support for hyperlinks. */
export const BaseLinkPlugin = definePlugin('link', {
  api: ({ store }) => ({
    getAttributes: (
      link: Element
    ): Record<string, unknown> & {
      className?: string;
      download?: boolean | string;
      href?: string;
      rel?: string;
      target?: string;
      title?: string;
    } => getLinkAttributes(store.get(), link),
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
          ...linkUrlValidation,
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
        decode: ({
          decode,
          marks,
          node,
          pluginState,
          report,
          schema: formatSchema,
        }) => {
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

          const isAllowedChild = (child: Descendant) =>
            TextApi.isText(child) ||
            (ElementApi.isElement(child) &&
              formatSchema.allowsElementType(type, child.type));

          if (children.every(isAllowedChild)) {
            return { children, type, url: node.url };
          }

          const nodes: Descendant[] = [];
          let run: Descendant[] = [];
          let liftedBlock = false;
          let firstDisallowedType: string | undefined;

          const flush = () => {
            if (run.length === 0) return;

            if (
              run.some(
                (child) => !TextApi.isText(child) || child.text.trim() !== ''
              )
            ) {
              nodes.push({ children: run, type, url: node.url });
            } else if (!liftedBlock) {
              nodes.push(...run);
            }
            run = [];
          };

          for (const child of children) {
            if (isAllowedChild(child)) {
              run.push(child);
              continue;
            }

            if (ElementApi.isElement(child)) {
              firstDisallowedType ??= child.type;
              if (!formatSchema.getElementBehavior(child)?.inline) {
                liftedBlock = true;
              }
            }
            flush();
            nodes.push(child);
          }
          flush();

          report({
            action: 'unwrapped',
            kind: 'property',
            message: `Markdown link cannot wrap "${firstDisallowedType ?? 'content'}"; its link destination was omitted for that content.`,
            nodeType: 'link',
          });

          return nodes;
        },
        encode: ({ encodePhrasing, node, preserve, resourceLink }) => {
          const children = encodePhrasing(node.children);

          preserve('url');
          const url = typeof node.url === 'string' ? node.url : '';

          if (
            children.length === 1 &&
            children[0]?.type === 'text' &&
            children[0].value === url &&
            !resourceLink &&
            isBareAutolinkLiteral(url)
          ) {
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
  component: 'a',
  rules: {
    normalize: { removeEmpty: true },
  },
  render: {
    attributes: ({ element, store }) => getLinkAttributes(store.get(), element),
  },
})
  .extend(({ plugin, schema: { type }, store }) => ({
    update: ({ tx }) => ({
      unwrap: txLocate(
        locateAt(0),
        (options?: {
          at?: Location;
          mode?: MaximizeMode;
          split?: boolean;
        }): true | undefined =>
          tx.nodes.unwrap({ type: plugin, ...options }) || undefined
      ),
      upsert: txLocate(
        locateAt(0),
        (options: {
          url: string;
          at?: Location;
          target?: string | null;
          text?: string;
        }): true | undefined => {
          const { at, target, text, url: inputUrl } = options;
          const hasTarget = 'target' in options;
          const normalizedTarget = target ?? undefined;
          const targetLocation = at ?? tx.selection();

          if (
            !targetLocation ||
            (at === undefined && tx.selection.nodes().length > 0)
          ) {
            return undefined;
          }

          const liveSelection = at === undefined ? null : tx.selection();
          const savedSelection = liveSelection
            ? tx.anchor(liveSelection, {
                association: RangeApi.isCollapsed(liveSelection)
                  ? 'forward'
                  : 'inward',
                deletion: 'nearest',
              })
            : null;
          const restoreSelection = () => {
            if (!savedSelection) return;

            const next = savedSelection.resolve();

            if (next) tx.selection.set(next);
          };

          const linkAbove =
            (LocationApi.isPath(targetLocation)
              ? tx.nodes.get(targetLocation, { type: plugin })
              : undefined) ??
            tx.nodes.above({
              at: targetLocation,
              type: plugin,
            });

          if (linkAbove) {
            const [link, linkPath] = linkAbove;
            const url =
              inputUrl === link.url
                ? link.url
                : admitLinkInput(store.get().allowedSchemes, inputUrl);

            if (url === undefined) return undefined;

            const nextText = isDefined(text) && text.length === 0 ? url : text;
            let changed = false;

            if (url !== link.url) {
              tx.nodes.set({ url }, { at: linkPath });
              changed = true;
            }
            if (hasTarget && normalizedTarget !== link.target) {
              if (normalizedTarget === undefined) {
                tx.nodes.unset('target', { at: linkPath });
              } else {
                tx.nodes.set({ target: normalizedTarget }, { at: linkPath });
              }
              changed = true;
            }
            let replacedLiveLinkText = false;

            if (nextText?.length && nextText !== tx.text.string(linkPath)) {
              const liveSelectionInLink =
                liveSelection !== null &&
                PathApi.isAncestor(linkPath, liveSelection.anchor.path) &&
                PathApi.isAncestor(linkPath, liveSelection.focus.path);

              tx.nodes.replaceChildren(
                [{ ...link.children[0], text: nextText }],
                { at: linkPath }
              );
              changed = true;

              if (at === undefined || liveSelectionInLink) {
                const end = tx.points.end(linkPath);

                if (end) {
                  tx.selection.set(end);
                  replacedLiveLinkText = true;
                }
              }
            }

            if (!replacedLiveLinkText) {
              restoreSelection();
            }

            return changed ? true : undefined;
          }

          const url = admitLinkInput(store.get().allowedSchemes, inputUrl);

          if (url === undefined) return undefined;

          const nextText = isDefined(text) && text.length === 0 ? url : text;
          const targetRange = RangeApi.isRange(targetLocation)
            ? targetLocation
            : LocationApi.isPath(targetLocation)
              ? tx.ranges.get(targetLocation)
              : undefined;

          if (targetRange && RangeApi.isExpanded(targetRange)) {
            const anchorBlock = tx.nodes.block({ at: targetRange.anchor });
            const focusBlock = tx.nodes.block({ at: targetRange.focus });
            const isSingleBlock =
              anchorBlock !== undefined &&
              focusBlock !== undefined &&
              PathApi.equals(anchorBlock[1], focusBlock[1]);
            const wrapAnchor =
              nextText?.length && isSingleBlock
                ? tx.anchor(targetRange, {
                    association: 'inward',
                    deletion: 'nearest',
                  })
                : null;

            if (
              !tx.nodes.wrap(
                {
                  children: [],
                  ...(normalizedTarget === undefined
                    ? {}
                    : { target: normalizedTarget }),
                  type,
                  url,
                },
                {
                  ...(at === undefined ? {} : { at: targetRange }),
                  replace: true,
                  split: true,
                }
              )
            ) {
              return undefined;
            }

            if (wrapAnchor && nextText?.length) {
              const wrappedRange = wrapAnchor.resolve();
              const wrappedLink = wrappedRange
                ? tx.nodes.above({ at: wrappedRange, type: plugin })
                : undefined;

              if (wrappedLink) {
                const [linkNode, linkPath] = wrappedLink;

                if (nextText !== tx.text.string(linkPath)) {
                  tx.nodes.replaceChildren(
                    [{ ...linkNode.children[0], text: nextText }],
                    { at: linkPath }
                  );

                  if (at === undefined) {
                    const end = tx.points.end(linkPath);

                    if (end) tx.selection.set(end);
                  }
                }
              }
            }

            restoreSelection();

            return true;
          }

          const point = tx.points.start(targetLocation);
          const leaf = point && tx.nodes.leaf(point.path);

          if (!leaf) return undefined;

          const inserted = tx.fragment.replace(
            [
              {
                children: [
                  { ...leaf[0], text: nextText?.length ? nextText : url },
                ],
                ...(normalizedTarget === undefined
                  ? {}
                  : { target: normalizedTarget }),
                type,
                url,
              },
            ],
            at === undefined ? undefined : { at: targetLocation }
          );

          if (!inserted) return undefined;

          restoreSelection();

          return true;
        }
      ),
    }),
  }))
  .extend(({ plugin, schema: { type } }) => ({
    commands: ({ around }) => [
      around(editorCommands.insertText, ({ input, state, next }) => {
        const { at, ...options } = input.options ?? {};
        const selection = state.selection();

        if (
          at &&
          (!selection ||
            !RangeApi.isRange(at) ||
            !RangeApi.equals(at, selection))
        ) {
          return next();
        }

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
          exitLinkEnd(tx, type);
        });

        return next.after(prefix, { ...input, options });
      }),
    ],
  }));

export type LinkElement = ElementOf<typeof BaseLinkPlugin>;

type InputRuleOptions<TContext> = {
  enabled?: (context: TContext) => boolean;
  priority?: number;
};

const AUTOLINK_BEFORE_OPTIONS = {
  afterMatch: true,
  matchBlockStart: true,
  matchString: ' ',
  skipInvalid: true,
} as const;

const sliceRangeByUtf16Offsets = (
  editor: InsertTextInputRuleReadContext['editor'],
  range: Range,
  startOffset: number,
  endOffset: number
): Range | undefined => {
  let cursor = 0;
  let anchor: Point | undefined;
  let focus: Point | undefined;

  for (const [textNode, path] of editor.read.nodes.entries({
    at: range,
    match: TextApi.isText,
  })) {
    const sliceStart = PathApi.equals(path, range.anchor.path)
      ? range.anchor.offset
      : 0;
    const sliceEnd = PathApi.equals(path, range.focus.path)
      ? range.focus.offset
      : textNode.text.length;
    const sliceLen = sliceEnd - sliceStart;

    if (
      anchor === undefined &&
      startOffset >= cursor &&
      startOffset < cursor + sliceLen
    ) {
      anchor = { offset: sliceStart + (startOffset - cursor), path };
    }
    if (
      focus === undefined &&
      endOffset > cursor &&
      endOffset <= cursor + sliceLen
    ) {
      focus = { offset: sliceStart + (endOffset - cursor), path };
      break;
    }

    cursor += sliceLen;
  }

  return anchor && focus ? { anchor, focus } : undefined;
};

const pointAtBackwardUtf16Distance = (
  editor: InsertTextInputRuleReadContext['editor'],
  blockRange: Range,
  distanceFromEnd: number
): Point | undefined => {
  if (distanceFromEnd === 0) return blockRange.focus;

  let remaining = distanceFromEnd;

  for (const [textNode, path] of editor.read.nodes.entries({
    at: blockRange,
    match: TextApi.isText,
    reverse: true,
  })) {
    const sliceStart = PathApi.equals(path, blockRange.anchor.path)
      ? blockRange.anchor.offset
      : 0;
    const sliceEnd = PathApi.equals(path, blockRange.focus.path)
      ? blockRange.focus.offset
      : textNode.text.length;
    const sliceLen = sliceEnd - sliceStart;

    if (sliceLen === 0) continue;

    if (remaining <= sliceLen) {
      return { offset: sliceEnd - remaining, path };
    }

    remaining -= sliceLen;
  }

  return undefined;
};

const collectLabelLeaves = (
  tx: EditorTransactionSpecBuilder,
  labelRange: Range
): Text[] => {
  const leaves: Text[] = [];

  for (const [leaf, path] of tx.nodes.entries({
    at: labelRange,
    match: TextApi.isText,
  })) {
    const sliceStart = PathApi.equals(path, labelRange.anchor.path)
      ? labelRange.anchor.offset
      : 0;
    const sliceEnd = PathApi.equals(path, labelRange.focus.path)
      ? labelRange.focus.offset
      : leaf.text.length;
    const text = leaf.text.slice(sliceStart, sliceEnd);

    if (text.length > 0) {
      leaves.push({ ...leaf, text });
    }
  }

  return leaves;
};

const findAutolink = (
  editor: InsertTextInputRuleReadContext['editor']
): LinkTextAutolinkMatch | undefined => {
  const selection = editor.read.selection();

  if (!selection || !editor.read.selection.isCollapsed()) return undefined;
  if (editor.read.nodes.above({ at: selection, type: BaseLinkPlugin })) {
    return undefined;
  }

  const state = editor.plugin(BaseLinkPlugin).store.get();
  const before = editor.read.points.before(selection, AUTOLINK_BEFORE_OPTIONS);
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

  const raw = editor.read.text.string(range);
  const { end, start } = stripAutolinkWrappers(raw);

  if (start >= end) return undefined;

  const url = recognizeLinkText(state, raw.slice(start, end));

  if (url === undefined) return undefined;

  const trimmedRange =
    start === 0 && end === raw.length
      ? range
      : sliceRangeByUtf16Offsets(editor, range, start, end);

  if (!trimmedRange) return undefined;

  return {
    hasTrailing: end < raw.length,
    range: trimmedRange,
    url,
  };
};

const breakAutolinkRule = (
  options: InputRuleOptions<InsertBreakInputRuleReadContext> = {}
) =>
  defineInputRule(BaseLinkPlugin, {
    ...options,
    target: 'insertBreak',
    resolve: ({ editor }) => findAutolink(editor),
    apply: ({ decline, editor, next, tx }, match) => {
      const selection = tx.selection();
      const caretAnchor = selection
        ? tx.anchor(selection.focus, {
            association: 'forward',
            deletion: 'nearest',
          })
        : null;

      if (!tx.link.upsert({ at: match.range, url: match.url })) {
        return decline();
      }

      const nextCaret = caretAnchor?.resolve();

      if (nextCaret) tx.selection.set(nextCaret);
      if (!match.hasTrailing) {
        exitLinkEnd(tx, editor.plugin(BaseLinkPlugin).schema.type);
      }

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

      if (url === undefined || editor.read.selection.nodes().length > 0) {
        return undefined;
      }
      if (
        editor.read.nodes.above({ at: selection, type: BaseLinkPlugin }) ||
        (editor.read.selection.isCollapsed() &&
          isUnfinishedLinkSource(context.getBlockTextBeforeSelection()))
      ) {
        return { text };
      }

      return { label: text, url };
    },
    apply: ({ decline, editor, tx }, match) => {
      if (match.text !== undefined) {
        tx.text.insert(match.text);

        return undefined;
      }

      const selection = tx.selection();

      if (!selection) return decline();

      const { keepSelectedTextOnPaste } = editor
        .plugin(BaseLinkPlugin)
        .store.get();

      if (RangeApi.isExpanded(selection)) {
        if (keepSelectedTextOnPaste) {
          return tx.link.upsert({ url: match.url }) ? undefined : decline();
        }

        const start = RangeApi.start(selection);
        const leaf = tx.nodes.leaf(start.path);

        if (!leaf) return decline();

        const linkType = editor.plugin(BaseLinkPlugin).schema.type;
        const linkNode = {
          children: [{ ...leaf[0], text: match.label }],
          type: linkType,
          url: match.url,
        };

        if (!tx.schema.canWrap(linkNode, { at: start, replace: true })) {
          return decline();
        }

        tx.fragment.delete();

        const survivingLink = tx.nodes.above({ type: BaseLinkPlugin });

        if (survivingLink) {
          const caret = tx.selection();

          if (caret && tx.points.isEnd(caret.focus, survivingLink[1])) {
            exitLinkEnd(tx, linkType);
          } else if (
            caret &&
            tx.points.isStart(caret.anchor, survivingLink[1])
          ) {
            const beforeLink = tx.points.before(survivingLink[1]);

            if (beforeLink) {
              tx.selection.set(beforeLink);
            } else {
              tx.nodes.insert({ text: '' }, { at: survivingLink[1] });
              tx.selection.set({ offset: 0, path: survivingLink[1] });
            }
          }
        }

        return tx.fragment.replace([linkNode]) ? undefined : decline();
      }

      return tx.link.upsert({ text: match.label, url: match.url })
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
    apply: ({ decline, editor, text, tx }, match) => {
      const selection = tx.selection();
      const caretAnchor = selection
        ? tx.anchor(selection.focus, {
            association: 'forward',
            deletion: 'nearest',
          })
        : null;

      if (!tx.link.upsert({ at: match.range, url: match.url })) {
        return decline();
      }

      const nextCaret = caretAnchor?.resolve();

      if (nextCaret) tx.selection.set(nextCaret);
      if (!match.hasTrailing) {
        exitLinkEnd(tx, editor.plugin(BaseLinkPlugin).schema.type);
      }
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
        const scan = scanUnclosedMarkdownLink(textBefore);

        if (
          !scan ||
          scan.isImage ||
          scan.openParenDepth !== 0 ||
          scan.label.length === 0 ||
          scan.destination.length === 0 ||
          /\s/.test(scan.destination)
        ) {
          return undefined;
        }

        const url = admitLinkInput(
          editor.plugin(BaseLinkPlugin).store.get().allowedSchemes,
          scan.destination
        );

        if (url === undefined) return undefined;

        const startPoint = pointAtBackwardUtf16Distance(
          editor,
          blockRange,
          textBefore.length - scan.start
        );
        const labelStartPoint = pointAtBackwardUtf16Distance(
          editor,
          blockRange,
          textBefore.length - scan.labelStart
        );
        const labelEndPoint = pointAtBackwardUtf16Distance(
          editor,
          blockRange,
          textBefore.length - scan.labelEnd
        );

        if (!startPoint || !labelStartPoint || !labelEndPoint) {
          return undefined;
        }

        const matchRange = { anchor: startPoint, focus: selection.anchor };

        if (
          editor.read.nodes.some({
            at: matchRange,
            match: (node) =>
              ElementApi.isElement(node) && editor.read.schema.isInline(node),
          })
        ) {
          return undefined;
        }

        return {
          labelRange: { anchor: labelStartPoint, focus: labelEndPoint },
          range: matchRange,
          url,
        };
      },
      apply: ({ decline, editor, tx }, match) => {
        const children = collectLabelLeaves(tx, match.labelRange);

        if (children.length === 0) return decline();

        const linkType = editor.plugin(BaseLinkPlugin).schema.type;
        const linkNode = { children, type: linkType, url: match.url };

        if (!tx.schema.canWrap(linkNode, { at: match.range.anchor })) {
          return decline();
        }

        tx.fragment.delete({ at: match.range });

        if (!tx.fragment.replace([linkNode])) {
          return decline();
        }

        exitLinkEnd(tx, linkType);

        return undefined;
      },
    }),
  autolink: (
    options:
      | ({
          variant: 'break';
        } & InputRuleOptions<InsertBreakInputRuleReadContext>)
      | ({
          variant: 'paste';
        } & InputRuleOptions<InsertDataInputRuleReadContext>)
      | ({
          variant: 'space';
        } & InputRuleOptions<InsertTextInputRuleReadContext>)
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
