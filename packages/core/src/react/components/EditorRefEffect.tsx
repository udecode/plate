import React from 'react';

import type { AnyEditorPlugin } from '../../lib/plugin/types/PlatePlugin';

import { useEditorRef, usePlateSelectors } from '../stores';

export function EditorRefPluginEffect({
  id,
  plugin,
}: {
  id?: string;
  plugin: AnyEditorPlugin;
}) {
  const editor = useEditorRef(id);

  plugin.useHooks?.({ api: editor.api, editor, plugin });

  return null;
}

export function EditorRefEffect({ id }: { id?: string }) {
  const editor = usePlateSelectors(id).editor();

  return (
    <>
      {editor.pluginList.map((plugin) => (
        <EditorRefPluginEffect id={id} key={plugin.key} plugin={plugin} />
      ))}
    </>
  );
}
