import {
  findNode,
  getAboveNode,
  getEditorString,
  getNodeLeaf,
  getNodeProps,
  getPluginOptions,
  getPluginType,
  InsertNodesOptions,
  isDefined,
  isExpanded,
  PlateEditor,
  removeNodes,
  sanitizeUrl,
  setNodes,
  UnwrapNodesOptions,
  Value,
  WrapNodesOptions,
} from '@udecode/plate-core';
import { ELEMENT_LINK, LinkPlugin } from '../createLinkPlugin';
import { TLinkElement } from '../types';
import { CreateLinkNodeOptions } from '../utils/index';
import { insertLink } from './insertLink';
import { unwrapLink } from './unwrapLink';
import { upsertLinkText } from './upsertLinkText';
import { wrapLink } from './wrapLink';

export type UpsertLinkOptions<
  V extends Value = Value
> = CreateLinkNodeOptions & {
  /**
   * If true, insert text when selection is in url.
   */
  insertTextInLink?: boolean;
  insertNodesOptions?: InsertNodesOptions<V>;
  unwrapNodesOptions?: UnwrapNodesOptions<V>;
  wrapNodesOptions?: WrapNodesOptions<V>;
  allowedSchemes?: string[];
  isUrl?: (url: string) => boolean;
};

/**
 * If selection in a link or is not url:
 * - insert text with url, exit
 * If selection is expanded or `update` in a link:
 * - remove link node, get link text
 * Then:
 * - insert link node
 */
export const upsertLink = <V extends Value>(
  editor: PlateEditor<V>,
  {
    url,
    text,
    target,
    insertTextInLink,
    insertNodesOptions,
    allowedSchemes = getPluginOptions<LinkPlugin, V>(editor, ELEMENT_LINK)
      .allowedSchemes,
    isUrl = getPluginOptions<LinkPlugin, V>(editor, ELEMENT_LINK).isUrl,
  }: UpsertLinkOptions<V>
) => {
  const at = editor.selection;

  if (!at) return;

  const linkAbove = getAboveNode<TLinkElement>(editor, {
    at,
    match: { type: getPluginType(editor, ELEMENT_LINK) },
  });

  // anchor and focus in link -> insert text
  if (insertTextInLink && linkAbove) {
    // we don't want to insert marks in links
    editor.insertText(url);
    return true;
  }

  const sanitizedUrl = sanitizeUrl(url, { allowedSchemes });
  if (!sanitizedUrl || !isUrl?.(sanitizedUrl)) return;

  if (isDefined(text) && !text.length) {
    text = sanitizedUrl;
  }

  // edit the link url and/or target
  if (linkAbove) {
    if (sanitizedUrl !== linkAbove[0]?.url || target !== linkAbove[0]?.target) {
      setNodes<TLinkElement>(
        editor,
        { url: sanitizedUrl, target },
        {
          at: linkAbove[1],
        }
      );
    }

    upsertLinkText(editor, { url: sanitizedUrl, text, target });

    return true;
  }

  // selection contains at one edge edge or between the edges
  const linkEntry = findNode<TLinkElement>(editor, {
    at,
    match: { type: getPluginType(editor, ELEMENT_LINK) },
  });

  const [linkNode, linkPath] = linkEntry ?? [];

  let shouldReplaceText = false;

  if (linkPath && text?.length) {
    const linkText = getEditorString(editor, linkPath);

    if (text !== linkText) {
      shouldReplaceText = true;
    }
  }

  if (isExpanded(at)) {
    // anchor and focus in link
    if (linkAbove) {
      unwrapLink(editor, {
        at: linkAbove[1],
      });
    } else {
      unwrapLink(editor, {
        split: true,
      });
    }

    wrapLink(editor, {
      url: sanitizedUrl,
      target,
    });

    upsertLinkText(editor, { url: sanitizedUrl, target, text });

    return true;
  }

  if (shouldReplaceText) {
    removeNodes(editor, {
      at: linkPath,
    });
  }

  const props = getNodeProps(linkNode ?? ({} as any));

  const path = editor.selection?.focus.path;
  if (!path) return;

  // link text should have the focused leaf marks
  const leaf = getNodeLeaf(editor, path);

  // if text is empty, text is url
  if (!text?.length) {
    text = sanitizedUrl;
  }

  insertLink(
    editor,
    {
      ...props,
      url: sanitizedUrl,
      target,
      children: [
        {
          ...leaf,
          text,
        },
      ],
    },
    insertNodesOptions
  );
  return true;
};
