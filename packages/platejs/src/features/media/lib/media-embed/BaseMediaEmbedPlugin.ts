import {
  type BaseInputRule,
  defineInputRule,
  definePlugin,
  type DefinitionOf,
  type Descendant,
  ElementApi,
  type ElementOf,
  type InsertDataInputRuleReadContext,
  PathApi,
  PLUGINS,
  type Point,
  property,
  RangeApi,
  schema,
  SelectionApi,
  TextApi,
} from '../../../../core';
import { getActiveCommandEditor, readAuthoredView } from '../../../../facade';
import { decideUrl, isStoredUrl } from '../../../../internal/utils/urlPolicy';
import { DOMPlugin } from '../../../../lib/plugins/dom/DOMPlugin';
import {
  defineMediaPlugin,
  mediaElementProperties,
  type MediaPluginState,
} from '../BaseMediaPlugin';
import {
  parseIframeUrl,
  parseMediaUrl,
  parseTwitterUrl,
  parseVideoUrl,
} from '../media/parseMediaUrl';
import {
  readHtmlMediaProvider,
  readHtmlMediaWidth,
  writeHtmlMediaProvider,
  writeHtmlMediaWidth,
} from '../mediaHtml.internal';

const MEDIA_EMBED_URL_ATTRIBUTE = 'data-editor-media-url';
const MEDIA_EMBED_WIDTH_ATTRIBUTE = 'data-editor-media-width';

const sanitizeMediaEmbedUrl = (url: string | null | undefined) => {
  const decision = url ? decideUrl('embed', url) : undefined;

  return decision?.ok ? decision.url : undefined;
};

const normalizeMediaEmbedWidth = (
  element: HTMLElement,
  width: string | null
) => {
  if (!width) return undefined;
  const { style } = element.ownerDocument.createElement('div');

  style.width = width;

  return style.width || undefined;
};

export type MediaEmbedPluginState = MediaPluginState & {
  transformUrl: (url: string) => string;
};

const initialState: MediaEmbedPluginState = {
  isUrl: null,
  transformUrl: parseIframeUrl,
};

/**
 * Embeds third-party media. Links to YouTube, Vimeo, Dailymotion, Youku and
 * Coub videos are stored as each provider's player URL, and X (Twitter) post
 * links as the post URL. Any other URL is stored as `transformUrl` returns it;
 * the default takes the `src` out of a pasted `<iframe>` snippet.
 */
export const BaseMediaEmbedPlugin = definePlugin(PLUGINS.mediaEmbed, {
  schema: {
    element: schema.element.textBlock({
      object: true,
      properties: {
        url: property.string({
          required: true,
          validate: isStoredUrl('embed'),
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
  initialState,

  formats: ({ defineFormats, schema: { type } }) =>
    defineFormats({
      html: [
        {
          decode: ({ element, preserve, report }) => {
            const iframe =
              element.querySelector<HTMLElement>(':scope > iframe');
            const dataUrl = element.getAttribute(MEDIA_EMBED_URL_ATTRIBUTE);
            const url =
              sanitizeMediaEmbedUrl(iframe?.getAttribute('src')) ??
              sanitizeMediaEmbedUrl(dataUrl);

            if (!url) {
              // HTML safety reports an unsafe iframe `src`; this attribute is
              // the embed's own.
              if (dataUrl) {
                report({
                  action: 'dropped',
                  kind: 'element',
                  message: `HTML media embed URL "${dataUrl}" cannot be embedded; the embed was removed.`,
                });
              }

              return undefined;
            }

            const width = readHtmlMediaWidth(
              iframe?.style.width ||
                normalizeMediaEmbedWidth(
                  element,
                  element.getAttribute(MEDIA_EMBED_WIDTH_ATTRIBUTE)
                )
            );

            // The embedded frame and these attributes carry the same values.
            preserve(MEDIA_EMBED_URL_ATTRIBUTE);
            if (width !== undefined) preserve(MEDIA_EMBED_WIDTH_ATTRIBUTE);

            return {
              ...readHtmlMediaProvider(element, { preserve, report }),
              ...(width === undefined ? {} : { width }),
              url,
            };
          },
          encode: ({ content, node, preserve }) => {
            const url =
              typeof node.url === 'string'
                ? sanitizeMediaEmbedUrl(node.url)
                : undefined;
            const width = writeHtmlMediaWidth(node.width);

            if (!url) {
              return null;
            }

            preserve('provider', 'sourceUrl', 'url', 'width');

            return {
              attributes: {
                class: 'editor-media-embed',
                [MEDIA_EMBED_URL_ATTRIBUTE]: url,
                [MEDIA_EMBED_WIDTH_ATTRIBUTE]: width,
                ...writeHtmlMediaProvider(node),
              },
              children: [
                {
                  attributes: {
                    allowfullscreen: true,
                    referrerpolicy: 'strict-origin-when-cross-origin',
                    // Providers play only with scripts and their own origin.
                    sandbox:
                      'allow-scripts allow-same-origin allow-presentation',
                    src: url,
                    title: 'Embedded media',
                  },
                  children: [],
                  style: { width },
                  tag: 'iframe',
                },
                { children: content, tag: 'figcaption' },
              ],
              tag: 'figure',
            };
          },
          match: [{ className: 'editor-media-embed', tag: 'figure' }],
          priority: 10,
        },
        {
          decode: ({ element }) => {
            if (element.parentElement?.matches('figure.editor-media-embed')) {
              return undefined;
            }

            const url = element.getAttribute('src');

            if (!url) return undefined;

            const width = readHtmlMediaWidth(element.style.width);

            return {
              children: [{ text: '' }],
              ...(width === undefined ? {} : { width }),
              url,
            };
          },
          decodeOnly: true,
          match: [{ tag: 'iframe' }],
        },
      ],
      markdown: { tag: type, attributes: { url: 'src' } },
    }),
}).extend(
  defineMediaPlugin('embed', (options, url) => {
    const transformedUrl = options.transformUrl?.(url) ?? url;
    const normalized = parseMediaUrl(transformedUrl, {
      urlParsers: [parseTwitterUrl, parseVideoUrl],
    });

    return {
      ...(normalized?.provider === undefined
        ? {}
        : { provider: normalized.provider }),
      ...(normalized?.sourceUrl === undefined
        ? {}
        : { sourceUrl: normalized.sourceUrl }),
      url: normalized?.url ?? transformedUrl,
    };
  })
);

const hasOnlyKeys = (node: object, keys: readonly string[]) =>
  Object.keys(node).every((key) => keys.includes(key));

const BARE_BLOCK_KEYS = ['children', 'id', 'type'];
const BARE_LINK_KEYS = ['children', 'id', 'type', 'url'];
const YOUTUBE_ID = /^[\w-]{11}$/;
const NUMERIC_ID = /^\d+$/;
const ALPHANUMERIC_ID = /^[a-z\d]+$/i;
const PREFIXED_HOSTS = new Set([
  'coub.com',
  'dailymotion.com',
  'twitter.com',
  'vimeo.com',
  'x.com',
  'youtube.com',
]);

const isBareBlock = (
  node: unknown,
  type: string
): node is { children: Descendant[]; type: string } =>
  ElementApi.isElement(node) &&
  node.type === type &&
  hasOnlyKeys(node, BARE_BLOCK_KEYS);

const readYoutubeId = (host: string, path: string[], url: URL) => {
  if (host === 'youtu.be') return path.length === 1 ? path[0] : undefined;
  if (host !== 'youtube.com') return undefined;
  if (path.length === 1 && path[0] === 'watch') {
    return url.searchParams.get('v') ?? undefined;
  }

  return path.length === 2 && ['embed', 'live', 'shorts'].includes(path[0])
    ? path[1]
    : undefined;
};

const readTweetId = (path: string[]) => {
  const status =
    path[0] === 'i' && path[1] === 'web' ? path.slice(2) : path.slice(1);

  return /^\w+$/.test(path[0] ?? '') &&
    status[0] === 'status' &&
    (status.length === 2 ||
      (status.length === 4 &&
        ['photo', 'video'].includes(status[2]) &&
        NUMERIC_ID.test(status[3])))
    ? status[1]
    : undefined;
};

const readExactProviderLink = (text: string) => {
  let url: URL;

  try {
    url = new URL(text);
  } catch {
    return undefined;
  }
  if (
    url.href.toLowerCase() !== text.toLowerCase() ||
    (url.protocol !== 'https:' && url.protocol !== 'http:') ||
    url.username ||
    url.password ||
    url.port
  ) {
    return undefined;
  }

  const bareHost = url.hostname.replace(/^(?:m|mobile|www)\./, '');
  const host = PREFIXED_HOSTS.has(bareHost) ? bareHost : url.hostname;
  const path = url.pathname.slice(1).replace(/\/$/, '').split('/');

  if (path.includes('')) return undefined;

  const youtube = readYoutubeId(host, path, url);

  if (youtube !== undefined) {
    const start =
      url.searchParams.get('t') ??
      url.searchParams.get('start') ??
      new URLSearchParams(url.hash.slice(1)).get('t');

    return YOUTUBE_ID.test(youtube) && youtube.toLowerCase() !== 'videoseries'
      ? {
          id: youtube,
          provider: 'youtube',
          url: `https://www.youtube.com/watch?v=${youtube}${start ? `&t=${encodeURIComponent(start)}` : ''}`,
        }
      : undefined;
  }

  const [first, second] = path;

  if (
    // The stored URLs drop `h`, which an unlisted video needs to play.
    !url.searchParams.has('h') &&
    ((host === 'vimeo.com' && path.length === 1 && NUMERIC_ID.test(first)) ||
      (host === 'player.vimeo.com' &&
        path.length === 2 &&
        first === 'video' &&
        NUMERIC_ID.test(second)))
  ) {
    const id = host === 'vimeo.com' ? first : second;

    return { id, provider: 'vimeo', url: `https://vimeo.com/${id}` };
  }
  if (
    (host === 'dailymotion.com' &&
      path.length === 2 &&
      first === 'video' &&
      ALPHANUMERIC_ID.test(second)) ||
    (host === 'dai.ly' && path.length === 1 && ALPHANUMERIC_ID.test(first))
  ) {
    const id = host === 'dai.ly' ? first : second;

    return {
      id,
      provider: 'dailymotion',
      url: `https://www.dailymotion.com/video/${id}`,
    };
  }

  const youku =
    host === 'v.youku.com' && path.length === 2 && first === 'v_show'
      ? /^id_([a-z\d]+)(?:==)?\.html$/i.exec(second)?.[1]
      : undefined;

  if (youku) {
    return {
      id: youku,
      provider: 'youku',
      url: `https://v.youku.com/v_show/id_${youku}.html`,
    };
  }
  if (
    host === 'coub.com' &&
    path.length === 2 &&
    (first === 'view' || first === 'embed') &&
    ALPHANUMERIC_ID.test(second)
  ) {
    return {
      id: second,
      provider: 'coub',
      url: `https://coub.com/view/${second}`,
    };
  }

  const tweet =
    host === 'x.com' || host === 'twitter.com' ? readTweetId(path) : undefined;

  return tweet !== undefined && NUMERIC_ID.test(tweet)
    ? { id: tweet, provider: 'twitter', url: `https://x.com/i/status/${tweet}` }
    : undefined;
};

const SCHEME = /[a-z][a-z\d+.-]*:/gi;
const LEADING_SCHEME = /^[a-z][a-z\d+.-]*:/i;

const schemesIn = (text: string) => text.match(SCHEME)?.length ?? 0;

const isOneLink = (text: string) =>
  schemesIn(text) === 1 && LEADING_SCHEME.test(text);

const holdsOneLink = (url: string) => {
  const [beforeFragment, ...fragment] = url.split('#');
  const [address, ...query] = beforeFragment.split('?');

  return (
    isOneLink(address) &&
    schemesIn(fragment.join('#')) === 0 &&
    query
      .join('?')
      .split('&')
      .every((param) => {
        const [key, ...rest] = param.split('=');
        const value = rest.join('=');

        return (
          schemesIn(key) === 0 && (schemesIn(value) === 0 || isOneLink(value))
        );
      })
  );
};

const editsPlainly = (view: ReturnType<typeof getActiveCommandEditor>) => {
  const authored = readAuthoredView(view);

  return (
    !authored || (!('preview' in authored) && authored.intent !== 'propose')
  );
};

const readPastedLink = (text: string) => {
  const url = text.replace(/^[ \t]+|[ \t]+$/g, '');

  return url && holdsOneLink(url) ? readExactProviderLink(url) : undefined;
};

const isBareText = (node: unknown): node is { text: string } =>
  TextApi.isText(node) && hasOnlyKeys(node, ['text']);

const isBareLink = (
  node: unknown,
  linkType: string | undefined
): node is { url: string } => {
  if (
    !ElementApi.isElement(node) ||
    node.type !== linkType ||
    typeof node.url !== 'string' ||
    !hasOnlyKeys(node, BARE_LINK_KEYS)
  ) {
    return false;
  }

  const [leaf, ...rest] = node.children;

  return rest.length === 0 && isBareText(leaf) && leaf.text === node.url;
};

const bareLineText = (
  children: readonly Descendant[],
  linkType: string | undefined
): string | undefined => {
  let link: string | undefined;
  let text = '';

  for (const child of children) {
    if (isBareText(child)) {
      text += child.text;
      continue;
    }
    if (link !== undefined || !isBareLink(child, linkType)) return undefined;

    link = child.url;
  }

  if (link === undefined) return text;

  return link !== '' && /^[ \t]*$/.test(text) ? link : undefined;
};

const pasteAutoEmbedRule = (
  options: BaseInputRule<InsertDataInputRuleReadContext> = {}
) =>
  defineInputRule(BaseMediaEmbedPlugin, {
    ...options,
    target: 'insertData',
    resolve: ({ data, editor, text }) => {
      const link = text ? readPastedLink(text) : undefined;
      const selection = editor.read.selection();
      const view = getActiveCommandEditor();
      const paragraph = editor.plugin(PLUGINS.paragraph);

      if (
        !link ||
        !paragraph.installed ||
        !editsPlainly(view) ||
        !selection ||
        !RangeApi.isCollapsed(selection) ||
        editor.read.selection.nodes().length > 0 ||
        selection.anchor.root !== view.read.view.root()
      ) {
        return undefined;
      }

      const block = editor.read.nodes.block({ at: selection });
      const linkPlugin = editor.plugin(PLUGINS.link);
      const linkType =
        linkPlugin.installed && linkPlugin.schema && 'type' in linkPlugin.schema
          ? linkPlugin.schema.type
          : undefined;
      if (!paragraph.schema || !('type' in paragraph.schema)) return undefined;
      const paragraphType = paragraph.schema.type;

      if (
        !block ||
        !isBareBlock(block[0], paragraphType) ||
        bareLineText(block[0].children, linkType) !== '' ||
        editor.plugin(DOMPlugin).api.clipboard.readSlice(data).kind === 'slice'
      ) {
        return undefined;
      }

      return {
        id: link.id,
        key: editor.key(block[0]),
        linkType,
        paragraphType,
        provider: link.provider,
        root: SelectionApi.root(selection),
        view,
      };
    },
    followUp: ({ tx }, match) => {
      const entry = tx.nodes.get(match.key);

      if (
        !entry ||
        !editsPlainly(match.view) ||
        (SelectionApi.root(tx.selection()) === match.root &&
          tx.selection
            .nodes()
            .some(([, path]) => PathApi.isAncestor(entry[1], path)))
      ) {
        return;
      }

      const [block] = entry;

      if (!isBareBlock(block, match.paragraphType)) return;

      const text = bareLineText(block.children, match.linkType);
      const link = text === undefined ? undefined : readPastedLink(text);

      if (link?.provider !== match.provider || link.id !== match.id) return;
      if (
        !tx.mediaEmbed.insert(
          { url: link.url },
          { before: match.key, select: false }
        )
      ) {
        return;
      }

      const line = tx.nodes.get(match.key);
      const start = tx.points.start(match.key);

      if (!line || !start) return;

      const selection = tx.selection();
      const onLine = (point: Point) =>
        point.root === start.root && PathApi.isAncestor(line[1], point.path);
      const textSelectionOnLine =
        selection &&
        'anchor' in selection &&
        tx.selection.nodes().length === 0 &&
        (onLine(selection.anchor) || onLine(selection.focus))
          ? selection
          : undefined;
      const newSelection =
        textSelectionOnLine &&
        SelectionApi.text({
          anchor: onLine(textSelectionOnLine.anchor)
            ? start
            : textSelectionOnLine.anchor,
          focus: onLine(textSelectionOnLine.focus)
            ? start
            : textSelectionOnLine.focus,
        });

      tx.nodes.replaceChildren([{ text: '' }], {
        at: match.key,
        ...(newSelection ? { newSelection } : {}),
      });
    },
  });

/** Input rules that turn a pasted provider link into a media embed. */
export const MediaEmbedRules = {
  /**
   * A provider link pasted alone on an empty paragraph becomes a media embed
   * above that paragraph, as its own undo step after the paste. The paragraph
   * stays, empty.
   */
  autoEmbed: ({
    variant: _,
    ...options
  }: { variant: 'paste' } & BaseInputRule<InsertDataInputRuleReadContext>) =>
    pasteAutoEmbedRule(options),
};

export type MediaEmbedDefinition = DefinitionOf<typeof BaseMediaEmbedPlugin>;
export type MediaEmbedElement = ElementOf<typeof BaseMediaEmbedPlugin>;
