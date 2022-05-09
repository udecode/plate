import React from 'react';
import { useEditorRef } from '../hooks/useEditorRef';
import { Value } from '../slate/editor/TEditor';
import { usePlateSelectors } from '../stores/plate/platesStore';
import { WithPlatePlugin } from '../types/plugins/PlatePlugin';
import { PlateProps } from './Plate';

export const EditorRefPluginEffect = <V extends Value>({
  plugin,
}: {
  plugin: WithPlatePlugin<V>;
}) => {
  const editor = useEditorRef<V>();

  plugin.useHooks?.(editor, plugin);

  return null;
};

export const EditorRefEffect = <V extends Value>({
  id,
}: Pick<PlateProps<V>, 'id'>) => {
  const editor = useEditorRef();
  usePlateSelectors(id).keyPlugins();

  return (
    <>
      {editor.plugins.map((plugin) => (
        <EditorRefPluginEffect key={plugin.key} plugin={plugin} />
      ))}
    </>
  );
};
