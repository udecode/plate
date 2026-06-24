import type { EditorUpdateTransaction, Point } from '@platejs/plite';
import type { BasePlateEditor } from '../../../editor';
import type { NavigationNavigateOptions } from '../types';

import { flashTarget } from './flashTarget';

const getScrollTarget = (
  editor: BasePlateEditor,
  { scrollTarget, select, target }: NavigationNavigateOptions
): Point | undefined => {
  if (scrollTarget) return scrollTarget;
  if (select && 'focus' in select && select.focus) return select.focus;
  if (select && 'anchor' in select && select.anchor) return select.anchor;
  if (select && 'path' in select) return select;

  return editor.api.start(target.path);
};

export const navigate = (
  editor: BasePlateEditor,
  tx: EditorUpdateTransaction,
  {
    flash,
    focus = true,
    scroll = true,
    scrollTarget,
    select,
    target,
  }: NavigationNavigateOptions
) => {
  if (!editor.api.node(target.path)) return false;

  if (select) {
    if ('focus' in select) {
      tx.selection.set(select);
    } else {
      tx.selection.set({
        anchor: select,
        focus: select,
      });
    }
  }

  if (focus) {
    editor.api.dom?.focus?.();
  }

  if (scroll) {
    const point = getScrollTarget(editor, {
      flash,
      focus,
      scroll,
      scrollTarget,
      select,
      target,
    });

    if (point) {
      editor.api.scrollIntoView(point);
    }
  }

  if (flash !== false) {
    flashTarget(editor, {
      duration: flash?.duration,
      target,
      variant: flash?.variant,
    });
  }

  return true;
};
