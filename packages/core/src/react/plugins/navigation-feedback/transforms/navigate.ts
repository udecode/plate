import type { Point } from '@platejs/plite';

import type { BaseEditor } from '../../../../lib/editor';
import type { NavigationNavigateOptions } from '../types';

import { flashTarget } from './flashTarget';

const getScrollTarget = (
  editor: BaseEditor,
  { scrollTarget, select, target }: NavigationNavigateOptions
): Point | undefined => {
  if (scrollTarget) return scrollTarget;
  if (select && 'focus' in select && select.focus) return select.focus;
  if (select && 'anchor' in select && select.anchor) return select.anchor;
  if (select && 'path' in select) return select;

  return editor.read.points.start(target.path);
};

export const navigate = (
  editor: BaseEditor,
  {
    flash,
    focus = true,
    scroll = true,
    scrollTarget,
    select,
    target,
  }: NavigationNavigateOptions,
  refreshDecorations: () => void
) => {
  if (!editor.read.nodes.get(target.path)) return false;

  if (focus) {
    editor.api.dom.focus();
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
      editor.api.dom.scrollIntoView(point);
    }
  }

  if (flash !== false) {
    flashTarget(
      editor,
      {
        duration: flash?.duration,
        target,
        variant: flash?.variant,
      },
      refreshDecorations
    );
  }

  return true;
};
