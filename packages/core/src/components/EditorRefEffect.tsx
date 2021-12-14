import React from 'react';
import { useEditorRef } from '../hooks/useEditorRef';
import { usePlateSelectors } from '../stores/plate/platesStore';
import { WithPlatePlugin } from '../types/plugins/PlatePlugin';
import { PlateProps } from './Plate';

export const EditorRefPluginEffect = ({
  plugin,
}: {
  plugin: WithPlatePlugin;
}) => {
  const editor = useEditorRef();

  plugin.useHooks?.(editor, plugin);

  return null;
};

export const EditorRefEffect = ({ id }: Pick<PlateProps, 'id'>) => {
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
