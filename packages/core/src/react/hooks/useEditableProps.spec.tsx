import React from 'react';

import { renderHook } from '@testing-library/react';

import { createSlatePlugin } from '../../lib';
import { TestPlate as Plate } from '../__tests__/TestPlate';
import { createPlateEditor } from '../editor';
import { useEditableProps } from './useEditableProps';

describe('useEditableProps', () => {
  describe('default', () => {
    it('keeps decorate stable across rerenders with unchanged inputs', () => {
      const decorate = mock();

      const editor = createPlateEditor({
        plugins: [
          createSlatePlugin({
            key: 'a',
            decorate: () => {
              decorate();

              return [];
            },
          }),
        ],
      });

      const wrapper = ({ children }: any) => (
        <Plate editor={editor}>{children}</Plate>
      );
      const { result, rerender } = renderHook(() => useEditableProps(), {
        wrapper,
      });
      const decorateProp = result.current.decorate!;
      const entry = [editor.children[0], [0]] as any;

      expect(decorateProp).toBeDefined();

      decorateProp(entry);
      expect(decorate).toHaveBeenCalledTimes(1);

      rerender();

      expect(result.current.decorate).toBe(decorateProp);

      result.current.decorate!(entry);
      expect(decorate).toHaveBeenCalledTimes(2);
    });
  });
});
