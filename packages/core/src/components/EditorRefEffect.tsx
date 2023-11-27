import React, { useEffect } from 'react';

import {
  PlateId,
  useEditorRef,
  usePlateActions,
  usePlateSelectors,
} from '../stores';
import { WithPlatePlugin } from '../types/plugin/PlatePlugin';

export function EditorRefPluginEffect({
  id,
  plugin,
}: {
  id?: PlateId;
  plugin: WithPlatePlugin;
}) {
  const editor = useEditorRef(id);

  plugin.useHooks?.(editor, plugin);

  return null;
}

export function EditorRefEffect({ id }: { id?: PlateId }) {
  const setIsMounted = usePlateActions().isMounted({ scope: id });
  const plugins = usePlateSelectors().plugins({ scope: id });
  const editorState = useEditorRef(id);
  const editorRef = usePlateSelectors().editorRef({ scope: id })?.ref;

  useEffect(() => {
    setIsMounted(true);

    return () => {
      setIsMounted(false);
    };
  }, [setIsMounted]);

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
        <EditorRefPluginEffect key={plugin.key} id={id} plugin={plugin} />
      ))}
    </>
  );
}
