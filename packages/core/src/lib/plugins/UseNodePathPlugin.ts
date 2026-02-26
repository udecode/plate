import { useEffect, useState } from 'react';

import {
  type Path,
  type PathRef,
  type PluginConfig,
  type TNode,
  type Value,
  OperationApi,
  PathApi,
} from 'platejs';
import {
  type TPlateEditor,
  createTPlatePlugin,
  useEditorRef,
} from 'platejs/react';

const KEY = 'useNodePath';

type Listener = {
  id: string;
  pathRef: PathRef;
  prevPath: PathRef['current'];
  fn: (path: PathRef['current']) => void;
};

type UseNodePathConfig = PluginConfig<
  typeof KEY,
  { listeners: Listener[] },
  Record<
    typeof KEY,
    {
      addListener: (path: Path, fn: Listener['fn']) => () => void;
    }
  >
>;

export const UseNodePathPlugin = createTPlatePlugin<UseNodePathConfig>({
  key: KEY,
  options: {
    listeners: [],
  },
})
  .extendApi<UseNodePathConfig['api'][typeof KEY]>(
    ({ editor, getOption, setOption }) => ({
      addListener: (path, fn) => {
        const id = crypto.randomUUID();
        const pathRef = editor.api.pathRef(path, { affinity: 'backward' });

        getOption('listeners').push({
          id,
          fn,
          pathRef,
          prevPath: pathRef.current ? [...pathRef.current] : pathRef.current,
        });

        return () => {
          setOption(
            'listeners',
            getOption('listeners').filter((item) => item.id !== id)
          );
        };
      },
    })
  )
  .overrideEditor(({ getOption, tf: { apply } }) => ({
    transforms: {
      apply: (op) => {
        apply(op);

        if (OperationApi.isNodeOperation(op)) {
          getOption('listeners').forEach((item) => {
            if (
              ((item.pathRef.current === null || item.prevPath === null) &&
                item.pathRef.current !== item.prevPath) ||
              (item.pathRef.current &&
                item.prevPath &&
                !PathApi.equals(item.pathRef.current, item.prevPath))
            ) {
              item.fn(item.pathRef.current);

              // eslint-disable-next-line no-param-reassign
              item.prevPath =
                item.pathRef.current === null
                  ? null
                  : [...item.pathRef.current];
            }
          });
        }
      },
    },
  }));

export const useNodePath = (node: TNode) => {
  const editor = useEditorRef<TPlateEditor<Value, typeof UseNodePathPlugin>>();
  const [path, setPath] = useState<Path | null>(
    () => editor.api.findPath(node) ?? null
  );

  useEffect(() => {
    if (!(KEY in editor.plugins) || !path) {
      return;
    }

    return editor.api[KEY].addListener(path, (path) => {
      setPath(path);
    });
  }, []);

  return path;
};
