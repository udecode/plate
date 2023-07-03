import React, { useEffect } from 'react';

import { useEditorRef } from '../hooks';
import { PlateId, usePlateActions, usePlateSelectors } from '../stores';
import { WithPlatePlugin } from '../types/plugin/PlatePlugin';

export function EditorRefPluginEffect({ plugin }: { plugin: WithPlatePlugin }) {
  const editor = useEditorRef();

  plugin.useHooks?.(editor, plugin);

  return null;
}

export function EditorRefEffect({ id }: { id?: PlateId }) {
  const setIsRendered = usePlateActions(id).isRendered();
  const plugins = usePlateSelectors(id).plugins();

  useEffect(() => {
    setIsRendered(true);

    return () => {
      setIsRendered(false);
    };
  }, [setIsRendered]);

  return (
    <>
      {plugins.map((plugin) => (
        <EditorRefPluginEffect key={plugin.key} plugin={plugin} />
      ))}
    </>
  );
}
