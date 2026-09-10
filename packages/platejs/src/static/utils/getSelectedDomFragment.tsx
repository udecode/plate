import {
  type Descendant,
  ElementApi,
  NodeApi,
  TextApi,
  MAIN_ROOT_KEY,
} from '../../facade';
import { type Editor, HtmlPlugin } from '../../lib';
import { createStaticDocument, type StaticDocument } from '../document';

export const getSelectedDomFragment = (
  editor: Editor,
  options: { document?: StaticDocument; element?: HTMLElement } = {}
): Descendant[] => {
  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0) return [];

  const range = selection.getRangeAt(0);
  if (
    options.element &&
    (!options.element.contains(range.startContainer) ||
      !options.element.contains(range.endContainer))
  ) {
    return [];
  }
  const document =
    options.document ??
    createStaticDocument(editor.read.value(), editor.read.schema);
  const point = (container: globalThis.Node, offset: number) => {
    const element = (
      container.nodeType === 1
        ? (container as HTMLElement)
        : container.parentElement
    )?.closest<HTMLElement>(
      '[data-plite-node="text"][data-plite-path][data-plite-root]'
    );
    if (!element) return undefined;
    const serializedPath = element.dataset.plitePath;
    const root = element.dataset.pliteRoot;
    if (!serializedPath || !root) return undefined;
    const path = serializedPath.split(',').map(Number);
    if (path.some((part) => !Number.isSafeInteger(part) || part < 0)) {
      return undefined;
    }
    const scope = root === MAIN_ROOT_KEY ? document : document.forRoot(root);
    const node = scope.nodes.get(path)?.[0];
    if (!TextApi.isText(node)) return undefined;
    const prefix = window.document.createRange();
    prefix.selectNodeContents(element);
    prefix.setEnd(container, offset);
    const textOffset = node.text.length === 0 ? 0 : prefix.toString().length;
    if (textOffset > node.text.length) return undefined;
    return { root, scope, point: { path, offset: textOffset } };
  };
  const anchor = point(range.startContainer, range.startOffset);
  const focus = point(range.endContainer, range.endOffset);
  if (anchor && focus) {
    if (anchor.root !== focus.root) return [];
    return [
      ...NodeApi.fragment(
        { children: anchor.scope.children(), type: 'static-root' },
        {
          anchor: anchor.point,
          focus: focus.point,
        }
      ),
    ];
  }
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
      root === MAIN_ROOT_KEY ? document : document.forRoot(root)
    ).nodes.get(path);

    // prevent inline elements like link and table cells.
    if (!block || !ElementApi.isElement(block[0]) || block[1].length !== 1) {
      return;
    }

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
      const html = window.document.createElement('div');
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
