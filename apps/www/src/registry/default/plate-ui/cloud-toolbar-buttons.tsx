'use client';

import React from 'react';

import { CloudPlugin } from '@udecode/plate-cloud';
import { useEditorPlugin } from '@udecode/plate-common/react';

const buttonStyle: React.CSSProperties = {
  background: '#f0f0f0',
  border: 'none',
  cursor: 'pointer',
  marginRight: 4,
  padding: 8,
};

export function CloudToolbarButtons() {
  const { api, editor } = useEditorPlugin(CloudPlugin);

  const getSaveValue = () => {
    console.info('editor.children', editor.children);
    console.info('editor.cloud.getSaveValue()', api.cloud.getSaveValue());
  };

  const finishUploads = async () => {
    await api.cloud.finishUploads();
  };

  return (
    <>
      <button style={buttonStyle} onClick={getSaveValue} type="button">
        Get Save Value
      </button>
      <button style={buttonStyle} onClick={finishUploads} type="button">
        Await Finish Uploads
      </button>
      <span>
        Note: After clicking a button, output will be shown in console.
      </span>
    </>
  );
}
