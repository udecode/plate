import React from 'react';

import { renderHook } from '@testing-library/react';

import { createPlateEditor } from '../editor';
import { Plate } from './Plate';
import { PlateContent } from './PlateContent';

describe('EditorMethodsEffect and redecorate', () => {
  it('set redecorate method on editor', () => {
    const editor = createPlateEditor();

    const wrapper = () => (
      <Plate editor={editor}>
        <PlateContent />
      </Plate>
    );

    renderHook(() => null, { wrapper });

    expect(editor.api.redecorate).toBeDefined();
  });
});
