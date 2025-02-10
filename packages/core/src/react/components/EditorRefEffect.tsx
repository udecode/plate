import React from 'react';

import { useAtomStoreSet, useAtomStoreValue } from 'jotai-x';

import type { AnyEditorPlatePlugin } from '../plugin/PlatePlugin';

import { getEditorPlugin } from '../plugin';
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
      {editor.pluginList.map((plugin) => (
        <EditorRefPluginEffect id={id} key={plugin.key} plugin={plugin} />
      ))}
    </>
  );
}
