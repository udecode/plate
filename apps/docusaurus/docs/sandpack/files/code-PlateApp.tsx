export const plateAppCode = `import React, { useState } from 'react';
import { Plate, PlateProvider, useResetPlateEditor } from '@udecode/plate';
import { plainTextValue } from './basic-editor/plainTextValue';
import { editableProps } from './common/editableProps';
import { MyValue } from './typescript/plateTypes';

const Buttons = ({ disabled, setDisabled }: any) => {
  const resetPlateEditor = useResetPlateEditor();

  return (
    <>
      <button
        className="cursor-pointer"
        type="button"
        onClick={() => {
          setDisabled(!disabled);
        }}
      >
        {disabled ? 'Disable editor' : 'Enable editor'}
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
    </>
  );
};

export default () => {
  const [disabled, setDisabled] = useState(false);

  return (
    <PlateProvider initialValue={plainTextValue}>
      <Buttons disabled={disabled} setDisabled={setDisabled} />

      <p />

      {!disabled && <Plate<MyValue> editableProps={editableProps} />}
    </PlateProvider>
  );
};
`;

export const plateAppFile = {
  '/PlateApp.tsx': plateAppCode,
};
