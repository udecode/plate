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
  const editorState = useEditorRef();
  const editorRef = usePlateSelectors(id).editorRef()?.ref;

  useEffect(() => {
    setIsRendered(true);

    return () => {
      setIsRendered(false);
    };
  }, [setIsRendered]);

  /**
   * Pass `editorState` to `editorRef` when the editor mounts. Since the editor
   * instance is mutable, we don't need to update it on every change, although
   * consumers will need to manually trigger a re-render inside `onChange` if
   * they want to use `editorRef` with `useState`.
   */
  useEffect(() => {
    if (typeof editorRef === 'function') {
      editorRef(editorState);
      return () => editorRef(null);
    }

    if (editorRef) {
      editorRef.current = editorState;
      return () => {
        editorRef.current = null;
      };
    }
  }, [editorRef, editorState]);

  return (
    <>
      {plugins.map((plugin) => (
        <EditorRefPluginEffect key={plugin.key} plugin={plugin} />
      ))}
    </>
  );
}
