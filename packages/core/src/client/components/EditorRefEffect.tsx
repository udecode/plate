import React from 'react';

import type { WithPlatePlugin } from '../../shared/types/plugin/PlatePlugin';

import {
  type PlateId,
  useEditorRef,
  usePlateActions,
  usePlateSelectors,
} from '../stores';

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
  const setIsMounted = usePlateActions(id).isMounted();
  const plugins = usePlateSelectors(id).plugins();
  const editorState = useEditorRef(id);
  const editorRef = usePlateSelectors(id).editorRef();

  React.useEffect(() => {
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
  React.useEffect(() => {
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
        <EditorRefPluginEffect id={id} key={plugin.key} plugin={plugin} />
      ))}
    </>
  );
}
