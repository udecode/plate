import React from 'react';

import { renderHook } from '@testing-library/react';

import { TestPlate as Plate } from '../__tests__/TestPlate';
import { createPlateEditor } from '../editor';
import { getPlateEditorInstanceKey } from '../internal/getPlateEditorInstanceKey';
import { usePlateRootProps } from './usePlateRootProps';

describe('usePlateRootProps', () => {
  it('returns the matching runtime editor identity', () => {
    const editor = createPlateEditor({
      initialValue: [{ children: [{ text: 'one' }], type: 'paragraph' }],
    });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Plate editor={editor}>{children}</Plate>
    );
    const { result } = renderHook(
      () => ({
        props: usePlateRootProps({}),
      }),
      { wrapper }
    );

    expect(result.current.props.editor).toBe(editor);
    expect(result.current.props.key).toBe(getPlateEditorInstanceKey(editor));
  });
});
