import { useEditor, useEditorSelector } from '@platejs/core/react';
import { KEYS } from '@platejs/utils';

import { ListStyleType } from '../lib';
import { ListPlugin } from './ListPlugin';

export const useListToolbarButtonState = ({
  nodeType = ListStyleType.Disc,
}: {
  nodeType?: string;
} = {}) => {
  const pressed = useEditorSelector((editor) =>
    editor.plugin(ListPlugin).read.isActive(nodeType)
  );

  return {
    nodeType,
    pressed,
  };
};

export const useListToolbarButton = ({
  nodeType,
  pressed,
}: ReturnType<typeof useListToolbarButtonState>) => {
  const editor = useEditor();

  return {
    props: {
      pressed,
      onClick: () => {
        editor.plugin(ListPlugin).update.toggle({
          listStyleType: nodeType,
        });
      },
      onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
      },
    },
  };
};

export const useTodoListToolbarButtonState = () => {
  const pressed = useEditorSelector((editor) =>
    editor.plugin(ListPlugin).read.isActive(KEYS.listTodo)
  );

  return { pressed };
};

export const useTodoListToolbarButton = ({
  pressed,
}: ReturnType<typeof useTodoListToolbarButtonState>) => {
  const editor = useEditor();

  return {
    props: {
      pressed,
      onClick: () => {
        editor.plugin(ListPlugin).update.toggle({
          listStyleType: KEYS.listTodo,
        });
      },
      onMouseDown: (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
      },
    },
  };
};
