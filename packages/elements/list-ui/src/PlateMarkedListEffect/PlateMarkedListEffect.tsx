import { useEffect } from 'react';
import { useEditorState } from '@udecode/plate-core';
import { useListItemMarkerSelection } from '../hooks';

export const PlateMarkedListEffect = () => {
  const editor = useEditorState();
  const [
    ,
    { setMarkerSelection, removeMarkerSelection },
  ] = useListItemMarkerSelection(editor.id);

  useEffect(() => {
    if (editor?.selection) {
      setMarkerSelection(undefined);
    }
  }, [editor?.selection, setMarkerSelection]);

  useEffect(() => {
    return () => {
      removeMarkerSelection({ id: editor.id as string });
    };
  }, [editor.id, removeMarkerSelection]);

  return null;
};
