import React from 'react';
import { useEventPlateId } from '@udecode/plate';
import { PlateCloudEditor } from '@udecode/plate-cloud';
import { useMyPlateEditorRef } from 'examples-next/src/lib/plate/typescript/plateTypes';

const buttonStyle: React.CSSProperties = {
  marginRight: 4,
  background: '#f0f0f0',
  border: 'none',
  padding: 8,
  cursor: 'pointer',
};

export function CloudToolbarButtons() {
  const editor = useMyPlateEditorRef(useEventPlateId()) as PlateCloudEditor;
  const getSaveValue = () => {
    console.info('editor.children', editor.children);
    console.info('editor.cloud.getSaveValue()', editor.cloud.getSaveValue());
  };

  const finishUploads = async () => {
    const start = new Date().getTime();
    // eslint-disable-next-line no-console
    console.info('start finishUploads');
    await editor.cloud.finishUploads();
    const end = new Date().getTime();
    // NOTE: We don't use backtick with curly brace replacement because it
    // doesn't work with gen:code script at time of writing.
    // eslint-disable-next-line no-console
    console.info(`end finishUploads in ms:`, end - start);
  };

  return (
    <>
      <button type="button" style={buttonStyle} onClick={getSaveValue}>
        Get Save Value
      </button>
      <button type="button" style={buttonStyle} onClick={finishUploads}>
        Await Finish Uploads
      </button>
      <span>
        Note: After clicking a button, output will be shown in console.
      </span>
    </>
  );
}
