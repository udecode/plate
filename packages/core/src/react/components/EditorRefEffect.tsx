import { useAtomStoreSet, useAtomStoreValue } from 'jotai-x';
import React from 'react';

import {
  getCompiledPlatePlugin,
  getPlateRuntime,
} from '../../internal/plugin/compilePlateModel';
import { createPluginContext } from '../plugin/createPluginContext.internal';
import type { AnyResolvedPlatePlugin } from '../plugin/PlatePlugin';
import { useEditor, usePlateStore } from '../stores';

export function EditorRefPluginEffect({
  id,
  plugin,
}: {
  plugin: AnyResolvedPlatePlugin;
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
      {getPlateRuntime(editor).pluginCache.useHooks.map((name) => (
        <EditorRefPluginEffect
          id={id}
          key={name}
          plugin={
            getCompiledPlatePlugin(editor, name) as AnyResolvedPlatePlugin
          }
        />
      ))}
    </>
  );
}
