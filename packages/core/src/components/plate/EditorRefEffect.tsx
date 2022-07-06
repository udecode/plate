import React, { useEffect } from 'react';
import { useEditorRef } from '../../hooks/slate/useEditorRef';
import {
  getPlateActions,
  usePlateSelectors,
} from '../../stores/plate/platesStore';
import { WithPlatePlugin } from '../../types/plugin/PlatePlugin';
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

  useEffect(() => {
    const plateActions = getPlateActions(editor.id);
    plateActions.isRendered(true);

    return () => {
      plateActions.isRendered(false);
    };
  }, [editor.id]);

  return (
    <>
      {editor.plugins.map((plugin) => (
        <EditorRefPluginEffect key={plugin.key} plugin={plugin} />
      ))}
    </>
  );
};
