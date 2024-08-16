import React from 'react';

import type { AnyEditorPlugin } from '../../lib/plugin/types/PlatePlugin';

import { getPluginContext } from '../../lib';
import { useEditorRef, usePlateActions, usePlateSelectors } from '../stores';

export function EditorRefPluginEffect({
  id,
  plugin,
}: {
  id?: string;
  plugin: AnyEditorPlugin;
}) {
  const editor = useEditorRef(id);

  plugin.useHooks?.(getPluginContext(editor, plugin));

  return null;
}

export function EditorRefEffect({ id }: { id?: string }) {
  const editor = usePlateSelectors(id).editor();
  const setIsMounted = usePlateActions(id).isMounted();

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
