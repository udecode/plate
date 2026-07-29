import React from 'react';

import { useAtomStoreSet, useAtomStoreValue } from 'jotai-x';

import type { AnyEditorPlatePlugin } from '../plugin/PlatePlugin';

import { getPlateRuntime } from '../../internal/plugin/compilePlateModel';
import { getEditorPlugin, getPlugin } from '../plugin';
import { useEditor, usePlateStore } from '../stores';

export function EditorRefPluginEffect({
  id,
  plugin,
}: {
  plugin: AnyEditorPlatePlugin;
  id?: string;
}) {
  const editor = useEditor({ id });

  plugin.useHooks?.(getEditorPlugin(editor, plugin));

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
      {getPlateRuntime(editor).pluginCache.useHooks.map((key) => (
        <EditorRefPluginEffect
          id={id}
          key={key}
          plugin={getPlugin(editor, { key })}
        />
      ))}
    </>
  );
}
