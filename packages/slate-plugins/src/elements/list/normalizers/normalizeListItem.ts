import { Editor, Node, NodeEntry, Path, Transforms } from 'slate';
import { getChildren } from '../../../common/queries/getChildren';
import { insertEmptyElement } from '../../../common/transforms/insertEmptyElement';
import { setDefaults } from '../../../common/utils/setDefaults';
import { DEFAULTS_LIST } from '../defaults';
import { ListNormalizerOptions, ListOptions } from '../types';

/**
 * If the list item has no child: insert an empty paragraph.
 * Else: move the children that are not valid to the paragraph.
 */
export const normalizeListItem = (
  editor: Editor,
  {
    nodeEntry,
    validLiChildrenTypes = [],
  }: { nodeEntry: NodeEntry } & ListNormalizerOptions,
  options?: ListOptions
) => {
  const { p, ul, ol } = setDefaults(options, DEFAULTS_LIST);

  const allValidLiChildrenTypes = [
    ul.type,
    ol.type,
    p.type,
    ...validLiChildrenTypes,
  ];

  const [listItemNode, listItemPath] = nodeEntry;
  const firstChildPath: Path = listItemPath.concat([0]);
  const firstChild: Node = (listItemNode.children as Node[])?.[0];

  if (!firstChild) {
    insertEmptyElement(editor, p.type, { at: firstChildPath });
    return true;
  }

  const children = getChildren(nodeEntry);

  const inlinePathRefs = children
    .filter(
      ([child]) => !allValidLiChildrenTypes.includes(child.type as string)
    )
    .map(([, childPath]) => Editor.pathRef(editor, childPath));

  // Ensure that all lists have a <p> tag as a first element
  if (firstChild.type !== p.type) {
    insertEmptyElement(editor, p.type, { at: firstChildPath });
  }

  // Ensure that any text nodes under the list are inside the <p>
  for (const ref of inlinePathRefs.reverse()) {
    const path = ref.unref();

    if (path) {
      Transforms.moveNodes(editor, {
        at: path,
        to: firstChildPath.concat([0]),
      });
    }
  }

  return inlinePathRefs.length > 0;
};
