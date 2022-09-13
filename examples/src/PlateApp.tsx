import React from 'react';
import { getPlateActions, Plate, PlateProvider } from '@udecode/plate';
import { useResetPlateEditor } from '@udecode/plate-core/src/index';
import { plainTextValue } from './basic-editor/plainTextValue';
import { editableProps } from './common/editableProps';
import { MyValue } from './typescript/plateTypes';

const Editor = () => {
  const resetPlateEditor = useResetPlateEditor();

  return (
    <>
      <button
        className="cursor-pointer"
        type="button"
        onClick={() => {
          getPlateActions(id).enabled(!enabled);
        }}
      >
        {enabled ? 'Disable editor' : 'Enable editor'}
      </button>
      <button
        className="ml-2 cursor-pointer"
        type="button"
        onClick={() => {
          resetPlateEditor();
        }}
      >
        Reset editor (history)
      </button>
      <p />
      <Plate<MyValue>
        id={id}
        editableProps={editableProps}
        initialValue={plainTextValue}
      />
    </>
  );
};

export default () => (
  <PlateProvider id={id}>
    <Editor />
  </PlateProvider>
);
