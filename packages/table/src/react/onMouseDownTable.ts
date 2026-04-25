import type React from 'react';

import type { DOMHandler } from 'platejs/react';

import { KEYS } from 'platejs';

import type { TableConfig } from '../lib';

const DATA_SLATE_NODE_SELECTOR = '[data-slate-node]';

const getTargetElement = (target: EventTarget | null) => {
  if (target instanceof Element) return target;
  if (target instanceof Node) return target.parentElement;
};

const hasMappedSlateTarget = (target: EventTarget | null) => {
  const slateNode = getTargetElement(target)?.closest(DATA_SLATE_NODE_SELECTOR);

  return !!slateNode && slateNode.getAttribute('data-slate-node') !== 'value';
};

const getClosestEditableChildPath = (
  editor: Parameters<DOMHandler<TableConfig>>[0]['editor'],
  clientY: number
) => {
  let previousPath: number[] | undefined;

  for (const [index, node] of editor.children.entries()) {
    const path = [index];
    const domNode = editor.api.toDOMNode(node);

    if (!(domNode instanceof Element)) continue;

    const rect = domNode.getBoundingClientRect();

    if (clientY < rect.top) {
      return previousPath
        ? { edge: 'end' as const, path: previousPath }
        : { edge: 'start' as const, path };
    }

    if (clientY <= rect.bottom) {
      const height = rect.height || rect.bottom - rect.top;

      return {
        edge: clientY <= rect.top + height / 2 ? 'start' : 'end',
        path,
      } as const;
    }

    previousPath = path;
  }

  if (previousPath) {
    return { edge: 'end' as const, path: previousPath };
  }
};

export const onMouseDownTable: DOMHandler<TableConfig, React.MouseEvent> = ({
  editor,
  event,
}) => {
  if (event.defaultPrevented || event.button !== 0) return;
  if (hasMappedSlateTarget(event.target)) return;

  const editable = event.currentTarget;
  const target = event.target;

  if (!(editable instanceof HTMLElement)) return;
  if (!(target instanceof Node) || !editable.contains(target)) return;
  if (
    !editor.api.some({ at: [], match: { type: editor.getType(KEYS.table) } })
  ) {
    return;
  }

  const closestPath = getClosestEditableChildPath(editor, event.clientY);

  if (!closestPath) return;

  const point =
    closestPath.edge === 'start'
      ? editor.api.start(closestPath.path)
      : editor.api.end(closestPath.path);

  if (!point) return;

  event.preventDefault();
  event.stopPropagation();
  editor.tf.select(point);

  return true;
};
