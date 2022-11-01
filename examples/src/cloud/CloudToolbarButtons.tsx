import React from 'react';
import { CloudEditor, useEventPlateId } from '@udecode/plate';
import { useMyPlateEditorRef } from '../typescript/plateTypes';

export const CloudToolbarButtons = () => {
  const editor = useMyPlateEditorRef(useEventPlateId()) as CloudEditor;
  const getSaveValue = () => {
    // eslint-disable-next-line no-console
    console.log(editor.cloud.getSaveValue());
  };

  return (
    <>
      <button type="button" onClick={getSaveValue}>
        Get Save Value
      </button>
      <button type="button">Await Finish Uploads</button>
      Note: Output in console
    </>
  );
};
