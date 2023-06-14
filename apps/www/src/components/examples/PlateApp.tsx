import React, { useState } from 'react';
import {
  Plate,
  PlateProvider,
  useResetPlateEditor,
} from '@udecode/plate-common';

import { editableProps } from '@/plate/demo/editableProps';
import { MyValue } from '@/plate/plate-types';

function Buttons({ disabled, setDisabled }: any) {
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
}

export default function PlateApp() {
  const [disabled, setDisabled] = useState(false);

  return (
    <PlateProvider
      initialValue={[
        {
          type: 'p',
          children: [
            {
              text: 'This is editable plain text with react and history plugins, just like a textarea!',
            },
          ],
        },
      ]}
    >
      <Buttons disabled={disabled} setDisabled={setDisabled} />

      <p />

      {!disabled && <Plate<MyValue> editableProps={editableProps} />}
    </PlateProvider>
  );
}
