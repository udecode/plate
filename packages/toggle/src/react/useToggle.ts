import { useEffect } from 'react';

import {
  useEditor,
  useEditorPlugin,
  useEditorSelector,
  usePluginStore,
} from '@platejs/core/react';
import { type Element, ElementApi, type NodeKey } from '@platejs/plite';
import { PLUGINS } from '@platejs/utils';

import { BaseTogglePlugin } from '../lib/BaseTogglePlugin';
import { TogglePlugin } from './TogglePlugin';

export const useToggleIndex = () => {
  const { store } = useEditorPlugin(TogglePlugin);
  const toggleIndex = useEditorSelector(
    (editor) => {
      const result = new Map<NodeKey, NodeKey[]>();
      let enclosingToggles: [NodeKey, number][] = [];

      editor.read.children().forEach((element, index) => {
        if (!ElementApi.isElement(element)) return;

        const indentValue = element.indent;
        const indent = typeof indentValue === 'number' ? indentValue : 0;
        const adjustedIndent =
          element.listStyleType && indent ? indent - 1 : indent;

        enclosingToggles = enclosingToggles.filter(
          ([, toggleIndent]) => toggleIndent < adjustedIndent
        );

        const nodeKey = editor.key([index]);

        if (!nodeKey) return;

        result.set(
          nodeKey,
          enclosingToggles.map(([toggleKey]) => toggleKey)
        );

        if (element.type === editor.plugin(PLUGINS.toggle).schema.type) {
          enclosingToggles.push([nodeKey, adjustedIndent]);
        }
      });

      return result;
    },
    {
      equalityFn: (left, right) => {
        if (left === right) return true;
        if (!left || !right || left.size !== right.size) return false;

        return [...left].every(([key, toggleKeys]) => {
          const previousToggleKeys = right.get(key);

          return (
            previousToggleKeys !== undefined &&
            previousToggleKeys.length === toggleKeys.length &&
            toggleKeys.every(
              (toggleKey, index) => previousToggleKeys[index] === toggleKey
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

export const useIsVisible = (elementKey: NodeKey) =>
  !usePluginStore(TogglePlugin, 'isClosed', elementKey);

export const useToggleButtonState = (toggleKey: NodeKey) => {
  const openKeys = usePluginStore(BaseTogglePlugin, 'openKeys');

  return {
    open: openKeys.has(toggleKey),
    toggleKey,
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
        api.toggleKeys([state.toggleKey]);
      },
      onMouseDown: (event: React.MouseEvent) => {
        event.preventDefault();
      },
    },
  };
};

export const useToggleToolbarButtonState = () => {
  const pressed = useEditorSelector((editor) => {
    const selection = editor.read.selection();

    return (
      !!selection &&
      editor.read.nodes.some({
        at: selection,
        match: { type: editor.plugin(BaseTogglePlugin).schema.type },
      })
    );
  });

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

        toggle.api.toggleKeys(
          editor.read.nodes
            .toArray<Element>({
              match: (node) =>
                ElementApi.isElement(node) && editor.read.nodes.isBlock(node),
              mode: 'lowest',
            })
            .map(([, path]) => editor.key(path)!),
          true
        );
        toggle.update.toggle({ collapse: true });
        editor.api.dom.focus();
      },
      onMouseDown: (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
      },
    },
  };
};
