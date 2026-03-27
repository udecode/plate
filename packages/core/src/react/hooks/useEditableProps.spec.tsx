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

    it('uses editor.api.scrollIntoView for selection scrolling by default', () => {
      const editor = createPlateEditor();
      const domRange = {
        getBoundingClientRect: mock(() => ({
          bottom: 1,
          height: 1,
          left: 0,
          right: 1,
          top: 0,
          width: 1,
        })),
        startContainer: { parentElement: document.createElement('span') },
      } as any;
      const scrollIntoView = mock();

      editor.api.scrollIntoView = scrollIntoView as any;

      const wrapper = ({ children }: any) => (
        <Plate editor={editor}>{children}</Plate>
      );
      const { result } = renderHook(() => useEditableProps(), {
        wrapper,
      });

      result.current.scrollSelectionIntoView?.(editor as any, domRange);

      expect(scrollIntoView).toHaveBeenCalledWith(domRange);
    });

    it('keeps an explicit scrollSelectionIntoView override', () => {
      const editor = createPlateEditor();
      const override = mock();

      const wrapper = ({ children }: any) => (
        <Plate editor={editor}>{children}</Plate>
      );
      const { result } = renderHook(
        () =>
          useEditableProps({
            scrollSelectionIntoView: override as any,
          }),
        {
          wrapper,
        }
      );

      expect(result.current.scrollSelectionIntoView).toBe(override);
    });
  });
});
