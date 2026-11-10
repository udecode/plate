import type React from 'react';

import type { Editor } from '../editor/Editor';
import { isHeldPress, isLatePress, isStrayClick } from './tapOrder.internal';

type RootMouseEvent = React.MouseEvent;

type PointerContext = { editor: Editor; event: RootMouseEvent };

export const createAnnotationPointerHandlers = ({
  clear,
  keyAt,
  select,
}: {
  clear: (editor: Editor) => void;
  keyAt: (event: RootMouseEvent) => string | null;
  select: (context: PointerContext) => void;
}) => {
  const dragStarts = new WeakMap<
    Element,
    { key: string | null; press: Event }
  >();
  const heldDragStart = (event: RootMouseEvent) => {
    const start = dragStarts.get(event.currentTarget);

    return start && isHeldPress(start.press) ? start : null;
  };
  const leave = ({ editor, event }: PointerContext) => {
    if (!heldDragStart(event)) return;
    dragStarts.delete(event.currentTarget);
    clear(editor);
  };

  return {
    click: (context: PointerContext) => {
      if (!isStrayClick(context.event.nativeEvent)) select(context);
    },
    mouseDownCapture: (context: PointerContext) => {
      const { editor, event } = context;

      if (event.button !== 0 || !editor.api.dom.hasTarget(event.target)) return;
      if (isLatePress(event.nativeEvent)) select(context);
      dragStarts.set(event.currentTarget, {
        key: keyAt(event),
        press: event.nativeEvent,
      });
    },
    mouseLeave: leave,
    mouseMove: (context: PointerContext) => {
      const start = heldDragStart(context.event);

      if (start && keyAt(context.event) !== start.key) leave(context);
    },
  };
};
