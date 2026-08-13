import type { ElementWith } from '@platejs/core';
import { useEditor } from '@platejs/core/react';

import type { BaseListPlugin } from '../lib';

export const useTodoListElementState = ({
  element,
}: {
  element: ElementWith<typeof BaseListPlugin>;
}) => {
  const { checked } = element;

  return {
    checked,
    element,
  };
};

export const useTodoListElement = (
  state: ReturnType<typeof useTodoListElementState>
) => {
  const { checked, element } = state;
  const editor = useEditor();

  return {
    checkboxProps: {
      checked: !!checked,
      onCheckedChange: (value: boolean) => {
        if (editor.read.view.isReadOnly()) return;

        editor.update.nodes.set({ checked: value }, { at: element });
      },
    },
  };
};
