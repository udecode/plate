import React from 'react';

import { useAtomStoreSet, useAtomStoreValue } from 'jotai-x';

import type { AnyEditorPlatePlugin } from '../plugin/PlatePlugin';

import {
  getCompiledPlatePlugin,
  getPlateRuntime,
} from '../../internal/plugin/compilePlateModel';
import { createPluginContext } from '../plugin/createPluginContext.internal';
import { useEditor, usePlateStore } from '../stores';

export function EditorRefPluginEffect({
  id,
  plugin,
}: {
  plugin: AnyEditorPlatePlugin;
  id?: string;
}) {
  const editor = useEditor({ id });

  plugin.useHooks?.(createPluginContext(editor, plugin));

  return null;
}

export function EditorRefEffect({ id }: { id?: string }) {
  const store = usePlateStore(id);
  const editor = useAtomStoreValue(store, 'editor');
  const setIsMounted = useAtomStoreSet(store, 'isMounted');

  React.useEffect(() => {
    setIsMounted(true);

    return () => {
      setIsMounted(false);
    };
  }, [setIsMounted]);

  return (
    <>
      {getPlateRuntime(editor).pluginCache.useHooks.map((pluginName) => (
        <EditorRefPluginEffect
          id={id}
          key={pluginName}
          plugin={
            getCompiledPlatePlugin(editor, pluginName) as AnyEditorPlatePlugin
          }
        />
      ))}
    </>
  );
}
