import {
  findNode,
  getAboveNode,
  getChildren,
  getEditorString,
  getNodeProps,
  getPluginOptions,
  getPluginType,
  insertNodes,
  InsertNodesOptions,
  isDefined,
  isExpanded,
  PlateEditor,
  removeNodes,
  setNodes,
  TText,
  UnwrapNodesOptions,
  Value,
  withoutNormalizing,
  WrapNodesOptions,
} from '@udecode/plate-core';
import { ELEMENT_LINK, LinkPlugin } from '../createLinkPlugin';
import { TLinkElement } from '../types';
import { CreateLinkNodeOptions } from '../utils/index';
import { insertLink } from './insertLink';
import { unwrapLink } from './unwrapLink';
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
};

export const upsertLinkText = <V extends Value>(
  editor: PlateEditor<V>,
  { text }: UpsertLinkOptions<V>
) => {
  const newLink = getAboveNode<TLinkElement>(editor, {
    match: { type: getPluginType(editor, ELEMENT_LINK) },
  });

  if (newLink) {
    const [, newLinkPath] = newLink;

    if (text?.length && text !== getEditorString(editor, newLinkPath)) {
      withoutNormalizing(editor, () => {
        // remove link children
        getChildren(newLink)
          .reverse()
          .forEach(([, childPath]) => {
            removeNodes(editor, {
              at: childPath,
            });
          });

        // insert link child text
        insertNodes<TText>(
          editor,
          { text: text! },
          {
            at: newLinkPath.concat([0]),
            select: true,
          }
        );
      });
    }
  }
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
  { url, text, insertTextInLink, insertNodesOptions }: UpsertLinkOptions<V>
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

  const { isUrl } = getPluginOptions<LinkPlugin, V>(editor, ELEMENT_LINK);

  if (!isUrl?.(url)) {
    return;
  }

  if (isDefined(text) && !text.length) {
    text = url;
  }

  // edit the link url
  if (linkAbove) {
    if (url !== linkAbove[0]?.url) {
      setNodes<TLinkElement>(
        editor,
        { url },
        {
          at: linkAbove[1],
        }
      );
    }

    upsertLinkText(editor, { url, text });

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
      url,
    });

    upsertLinkText(editor, { url, text });

    return true;
  }

  if (shouldReplaceText) {
    removeNodes(editor, {
      at: linkPath,
    });
  }

  const props = getNodeProps(linkNode ?? ({} as any));

  insertLink(editor, { ...props, url, text }, insertNodesOptions);
  return true;
};
