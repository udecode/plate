import { useEffect } from 'react';

import {
  useEditor,
  useEditorPlugin,
  useEditorSelector,
  usePluginStore,
} from '@platejs/core/react';
import { type Element, ElementApi } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import { BaseTogglePlugin } from '../lib/BaseTogglePlugin';
import { TogglePlugin } from './TogglePlugin';

export const useToggleIndex = () => {
  const { store } = useEditorPlugin(TogglePlugin);
  const toggleIndex = useEditorSelector(
    (editor) => {
      const result = new Map<string, string[]>();
      let enclosingToggles: [string, number][] = [];

      editor.read.children().forEach((element) => {
        if (!ElementApi.isElement(element)) return;

        const indentValue = element[KEYS.indent];
        const indent = typeof indentValue === 'number' ? indentValue : 0;
        const adjustedIndent =
          element.listStyleType && indent ? indent - 1 : indent;

        enclosingToggles = enclosingToggles.filter(
          ([, toggleIndent]) => toggleIndent < adjustedIndent
        );

        if (typeof element.id !== 'string') return;

        result.set(
          element.id,
          enclosingToggles.map(([toggleId]) => toggleId)
        );

        if (element.type === editor.getType(KEYS.toggle)) {
          enclosingToggles.push([element.id, adjustedIndent]);
        }
      });

      return result;
    },
    {
      equalityFn: (left, right) => {
        if (left === right) return true;
        if (!left || !right || left.size !== right.size) return false;

        return [...left].every(([id, toggleIds]) => {
          const previousToggleIds = right.get(id);

          return (
            previousToggleIds !== undefined &&
            previousToggleIds.length === toggleIds.length &&
            toggleIds.every(
              (toggleId, index) => previousToggleIds[index] === toggleId
            )
          );
        });
      },
    }
  );

  useEffect(() => {
    store.set({ toggleIndex });
  }, [store, toggleIndex]);
};

export const useIsVisible = (elementId: string) =>
  !usePluginStore(TogglePlugin, 'isClosed', elementId);

export const useToggleButtonState = (toggleId: string) => {
  const openIds = usePluginStore(BaseTogglePlugin, 'openIds');

  return {
    open: openIds.has(toggleId),
    toggleId,
  };
};

export const useToggleButton = (
  state: ReturnType<typeof useToggleButtonState>
) => {
  const { api } = useEditorPlugin(BaseTogglePlugin);

  return {
    ...state,
    buttonProps: {
      onClick: (event: React.MouseEvent) => {
        event.preventDefault();
        api.toggleIds([state.toggleId]);
      },
      onMouseDown: (event: React.MouseEvent) => {
        event.preventDefault();
      },
    },
  };
};

export const useToggleToolbarButtonState = () => {
  const pressed = useEditorSelector((editor) =>
    editor.plugin(BaseTogglePlugin).read.isActive()
  );

  return { pressed };
};

export const useToggleToolbarButton = ({
  pressed,
}: ReturnType<typeof useToggleToolbarButtonState>) => {
  const editor = useEditor();

  return {
    props: {
      pressed,
      onClick: () => {
        const toggle = editor.plugin(BaseTogglePlugin);

        toggle.api.toggleIds(
          editor.read.nodes
            .toArray<Element>({
              match: (node) =>
                ElementApi.isElement(node) && editor.read.nodes.isBlock(node),
              mode: 'lowest',
            })
            .flatMap(([node]) =>
              typeof node.id === 'string' ? [node.id] : []
            ),
          true
        );
        editor.update((tx) => {
          tx.blocks.toggle(toggle.type);
          tx.selection.collapse();
        });
        editor.api.dom.focus();
      },
      onMouseDown: (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
      },
    },
  };
};
