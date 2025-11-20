import React from 'react';

import { useAtomStoreSet, useAtomStoreValue } from 'jotai-x';

import type { AnyEditorPlatePlugin } from '../plugin/PlatePlugin';

import { getEditorPlugin, getPlugin } from '../plugin';
import { useEditorRef, usePlateStore } from '../stores';

export function EditorRefPluginEffect({
  id,
  plugin,
}: {
  plugin: AnyEditorPlatePlugin;
  id?: string;
}) {
  const editor = useEditorRef(id);

  plugin.useHooks?.(getEditorPlugin(editor, plugin) as any);

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
      {editor.meta.pluginCache.useHooks.map((key) => (
        <EditorRefPluginEffect
          id={id}
          key={key}
          plugin={getPlugin(editor, { key })}
        />
      ))}
    </>
  );
}
