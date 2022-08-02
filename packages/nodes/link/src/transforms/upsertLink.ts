import {
  getAboveNode,
  getEditorString,
  getNodeProps,
  getPluginOptions,
  getPluginType,
  InsertNodesOptions,
  isExpanded,
  PlateEditor,
  removeNodes,
  UnwrapNodesOptions,
  Value,
  withoutNormalizing,
  WrapNodesOptions,
} from '@udecode/plate-core';
import { ELEMENT_LINK, LinkPlugin } from '../createLinkPlugin';
import { CreateLinkNodeOptions } from '../utils/index';
import { insertLink } from './insertLink';

export type UpsertLinkOptions<
  V extends Value = Value
> = CreateLinkNodeOptions & {
  /**
   * Force update instead of insert.
   */
  update?: boolean;
  insertNodesOptions?: InsertNodesOptions<V>;
  unwrapNodesOptions?: UnwrapNodesOptions<V>;
  wrapNodesOptions?: WrapNodesOptions<V>;
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
  { url, text, update, insertNodesOptions }: UpsertLinkOptions<V>
) => {
  return withoutNormalizing(editor, () => {
    const at = editor.selection;

    if (!at) return;

    const linkAbove = getAboveNode(editor, {
      at,
      match: { type: getPluginType(editor, ELEMENT_LINK) },
    });

    if (linkAbove && !update) {
      editor.insertText(url);
      return true;
    }

    const { isUrl } = getPluginOptions<LinkPlugin, V>(editor, ELEMENT_LINK);

    if (!isUrl?.(url)) {
      return;
    }

    const [linkNode, linkPath] = linkAbove ?? [];

    if (isExpanded(at) || update) {
      // get text to insert in the link
      text = text ?? getEditorString(editor, at);

      if (linkAbove) {
        removeNodes(editor, {
          at: linkPath,
        });
      }
    }

    const props = getNodeProps(linkNode ?? ({} as any));

    insertLink(editor, { ...props, url, text }, insertNodesOptions);
    return true;
  });
};
