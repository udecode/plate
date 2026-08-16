import {
  type Descendant,
  createEditorView,
  type Editor,
  ElementApi,
  NodeApi,
} from '@platejs/plite';
import { MAIN_ROOT_KEY } from '@platejs/plite/internal';

import { type BaseEditor, HtmlPlugin } from '../../lib';

export const getSelectedDomFragment = (editor: BaseEditor): Descendant[] => {
  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0) return [];

  const range = selection.getRangeAt(0);
  const fragment = range.cloneContents();

  const domBlocks = Array.from(
    fragment.querySelectorAll(
      '[data-plite-node="element"][data-plite-path][data-plite-root]'
    )
  );

  if (domBlocks.length === 0) return [];

  const nodes: Descendant[] = [];

  domBlocks.forEach((node, index) => {
    const path = node.getAttribute('data-plite-path')?.split(',').map(Number);
    const root = node.getAttribute('data-plite-root');

    if (
      !path ||
      path.length === 0 ||
      path.some((part) => !Number.isSafeInteger(part) || part < 0) ||
      !root
    ) {
      return;
    }
    const block = (
      root === MAIN_ROOT_KEY
        ? editor
        : createEditorView(editor as unknown as Editor, { root })
    ).read.nodes.get(path);

    // prevent inline elements like link and table cells.
    if (!block || !ElementApi.isElement(block[0]) || block[1].length !== 1)
      return;

    /**
     * If the selection don't cover the all first or last block, we need
     * fallback to deserialize the block to get the correct fragment
     */
    if (
      (index === 0 || index === domBlocks.length - 1) &&
      node.textContent?.trim() !== NodeApi.string(block[0]) &&
      ElementApi.isElement(block[0]) &&
      !editor.read.schema.isVoid(block[0])
    ) {
      const html = document.createElement('div');
      html.append(node);
      const results = editor
        .plugin(HtmlPlugin)
        .api.deserialize({ element: html });

      if (!results) return;
      const [firstResult] = results;

      if (!firstResult) return;

      if (ElementApi.isElement(firstResult)) {
        nodes.push(firstResult);

        return;
      }

      const { children: _children, id: _id, ...blockProps } = block[0];

      nodes.push({
        ...blockProps,
        children: results,
      });
    } else {
      nodes.push(block[0]);
    }
  });

  return nodes;
};
