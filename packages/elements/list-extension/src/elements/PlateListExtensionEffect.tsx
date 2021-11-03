import { useEffect } from 'react';
import { useEventEditorId, useStoreEditorState } from '@udecode/plate-core';
import { useAtom } from 'jotai';
import { licSelectionState } from '../atoms/licSelection';

export const PlateListExtensionEffect = () => {
  const id = useEventEditorId('focus');
  const editor = useStoreEditorState(id);
  const [, setLicSelection] = useAtom(licSelectionState({ id: id as string }));

  useEffect(() => {
    if (editor?.selection) {
      setLicSelection(undefined);
    }
  }, [editor?.selection, setLicSelection]);

  useEffect(() => {
    return () => {
      licSelectionState.remove({ id: id as string });
    };
  }, [id]);

  return null;
};
