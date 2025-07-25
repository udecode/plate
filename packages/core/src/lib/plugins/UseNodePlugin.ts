import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  type Descendant,
  type NodeEntry,
  type NodeOperation,
  type Operation,
  type Value,
  NodeApi,
  OperationApi,
  PathApi,
} from 'platejs';
import {
  type TPlateEditor,
  createPlatePlugin,
  useEditorRef,
} from 'platejs/react';

type ListenerFn = (op: NodeOperation) => void;

export const UseNodePlugin = createPlatePlugin({
  key: 'useNode',
  options: {
    listeners: [] as ListenerFn[],
  },
})
  .extendApi(({ getOption, setOption }) => ({
    addListener: (fn: ListenerFn) => {
      getOption('listeners').push(fn);
    },
    removeListener: (fn: ListenerFn) => {
      setOption(
        'listeners',
        getOption('listeners').filter((item) => item !== fn)
      );
    },
  }))
  .overrideEditor(({ getOption, tf: { apply } }) => ({
    transforms: {
      apply: (op) => {
        apply(op);

        if (OperationApi.isNodeOperation(op)) {
          getOption('listeners').forEach((fn) => {
            fn(op);
          });
        }
      },
    },
  }));

export const useNode = <T extends Descendant>(id?: string) => {
  const editor = useEditorRef<TPlateEditor<Value, typeof UseNodePlugin>>();
  const [nodeEntryFromOperaton, setNodeEntryFromOperation] = useState<
    NodeEntry<T> | undefined
  >();
  const prevId = useRef<typeof id>(undefined);
  // We use useMemo instead of useState and useEffect, in order to have a value earlier (1 render cycle earlier)
  const nodeEntry = useMemo<NodeEntry<T> | undefined>(() => {
    const nextNodeEntry =
      id === prevId.current
        ? nodeEntryFromOperaton
        : editor.api.node<T>({ id, at: [] });

    prevId.current = id;

    return nextNodeEntry;
  }, [nodeEntryFromOperaton, editor, id]);

  const handleOperation = useCallback(
    (op: Operation) => {
      switch (op.type) {
        case 'insert_node': {
          if (op.node.id === id) {
            setNodeEntryFromOperation([op.node, op.path] as NodeEntry<T>);
          }

          break;
        }

        case 'merge_node': {
          const path = PathApi.previous(op.path) ?? op.path;
          const node = NodeApi.get(editor, path);

          if (node?.id === id) {
            setNodeEntryFromOperation([node, path] as NodeEntry<T>);
          }

          break;
        }

        case 'move_node': {
          const node = NodeApi.get(editor, op.newPath);

          if (node?.id === id) {
            setNodeEntryFromOperation([node, op.newPath] as NodeEntry<T>);
          }

          break;
        }

        case 'remove_node': {
          if (op.node.id === id) {
            setNodeEntryFromOperation(undefined);
          }

          break;
        }

        case 'set_node':
        case 'split_node': {
          const node = NodeApi.get(editor, op.path);

          if (node?.id === id) {
            setNodeEntryFromOperation([node, op.path] as NodeEntry<T>);
          }

          break;
        }
      }
    },
    [editor, id]
  );

  useEffect(() => {
    editor.api[UseNodePlugin.key].addListener(handleOperation);

    return () => {
      editor.api[UseNodePlugin.key].removeListener(handleOperation);
    };
  }, [editor, handleOperation]);

  return nodeEntry;
};
