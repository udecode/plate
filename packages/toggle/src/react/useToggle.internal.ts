import { useEditorPlugin, useEditorSelector } from '@platejs/core/react';
import { ElementApi, type NodeKey } from '@platejs/plite';
import { PLUGINS } from '@platejs/utils';
import { useEffect } from 'react';

import { TogglePlugin } from './TogglePlugin';

export const useToggle = () => {
  const { store } = useEditorPlugin(TogglePlugin);
  const toggleIndex = useEditorSelector(
    (editor) => {
      const result = new Map<NodeKey, NodeKey[]>();
      let enclosingToggles: [NodeKey, number][] = [];

      editor.read.children().forEach((element, index) => {
        if (!ElementApi.isElement(element)) return;

        const indentValue = element.indent;
        const indent = typeof indentValue === 'number' ? indentValue : 0;
        const adjustedIndent = element.listType && indent ? indent - 1 : indent;

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
