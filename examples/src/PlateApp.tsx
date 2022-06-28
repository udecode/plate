import React from 'react';
import {
  getPlateActions,
  Plate,
  PlateProvider,
  usePlateSelectors,
} from '@udecode/plate';
import { plainTextValue } from './basic-editor/plainTextValue';
import { editableProps } from './common/editableProps';
import { MyValue } from './typescript/plateTypes';

const id = 'plate';

const Editor = () => {
  const useSelectors = usePlateSelectors(id);
  const enabled = useSelectors ? useSelectors.enabled() : null;

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
          getPlateActions(id).resetEditor();
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
