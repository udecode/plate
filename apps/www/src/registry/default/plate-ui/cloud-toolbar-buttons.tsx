'use client';

import React from 'react';

import type { PlateCloudEditor } from '@udecode/plate-cloud';

import { type Value, useEditorRef } from '@udecode/plate-common';

const buttonStyle: React.CSSProperties = {
  background: '#f0f0f0',
  border: 'none',
  cursor: 'pointer',
  marginRight: 4,
  padding: 8,
};

export function CloudToolbarButtons() {
  const editor = useEditorRef<Value, PlateCloudEditor>();
  const getSaveValue = () => {
    console.info('editor.children', editor.children);
    console.info('editor.cloud.getSaveValue()', editor.cloud.getSaveValue());
  };

  const finishUploads = async () => {
    await editor.cloud.finishUploads();
  };

  return (
    <>
      <button onClick={getSaveValue} style={buttonStyle} type="button">
        Get Save Value
      </button>
      <button onClick={finishUploads} style={buttonStyle} type="button">
        Await Finish Uploads
      </button>
      <span>
        Note: After clicking a button, output will be shown in console.
      </span>
    </>
  );
}
