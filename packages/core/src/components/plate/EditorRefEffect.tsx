import React, { useEffect } from 'react';
import { useEditorRef } from '../../hooks/slate/useEditorRef';
import {
  PlateId,
  usePlateActions,
  usePlateSelectors,
} from '../../stores/index';
import { WithPlatePlugin } from '../../types/plugin/PlatePlugin';

export const EditorRefPluginEffect = ({
  plugin,
}: {
  plugin: WithPlatePlugin;
}) => {
  const editor = useEditorRef();

  plugin.useHooks?.(editor, plugin);

  return null;
};

export const EditorRefEffect = ({ id }: { id?: PlateId }) => {
  const editor = useEditorRef();
  usePlateSelectors(id).keyPlugins();
  const setIsRendered = usePlateActions(id).isRendered();

  useEffect(() => {
    setIsRendered(true);

    return () => {
      setIsRendered(false);
    };
  }, [setIsRendered]);

  return (
    <>
      {editor.plugins.map((plugin) => (
        <EditorRefPluginEffect key={plugin.key} plugin={plugin} />
      ))}
    </>
  );
};
