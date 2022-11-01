import React from 'react';
import { CloudEditor, useEventPlateId } from '@udecode/plate';
import { useMyPlateEditorRef } from '../typescript/plateTypes';

const buttonStyle: React.CSSProperties = {
  marginRight: 4,
  background: '#f0f0f0',
  border: 'none',
  padding: 8,
  cursor: 'pointer',
};

export const CloudToolbarButtons = () => {
  const editor = useMyPlateEditorRef(useEventPlateId()) as CloudEditor;
  const getSaveValue = () => {
    // eslint-disable-next-line no-console
    console.log(editor.cloud.getSaveValue());
  };

  const finishUploads = async () => {
    const start = new Date().getTime();
    // eslint-disable-next-line no-console
    console.log('start finishUploads');
    await editor.cloud.finishUploads();
    const end = new Date().getTime();
    // eslint-disable-next-line no-console
    console.log(`end finishUploads ${end - start}ms`);
  };

  return (
    <>
      <button type="button" style={buttonStyle} onClick={getSaveValue}>
        Get Save Value
      </button>
      <button type="button" style={buttonStyle} onClick={finishUploads}>
        Await Finish Uploads
      </button>
      <span style={{ marginLeft: 16 }}>
        Note: Output will be shown in console
      </span>
    </>
  );
};
