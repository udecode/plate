import React from 'react';

import { fireEvent, render, renderHook } from '@testing-library/react';

import { defineBasePlugin } from '../../lib';
import { TestPlate as Plate } from '../__tests__/TestPlate';
import { createPlateEditor } from '../editor';
import { PlateContent } from '../components/PlateContent';
import { useEditableProps } from './useEditableProps';

describe('useEditableProps', () => {
  describe('default', () => {
    it('stops the React handler chain for default shortcuts', () => {
      const shortcutHandler = mock();
      const editableHandler = mock();
      const ancestorHandler = mock();
      const editor = createPlateEditor({
        shortcuts: {
          save: { handler: shortcutHandler, keys: 'ctrl+s' },
        },
      });
      const { container } = render(
        <div onKeyDown={ancestorHandler}>
          <Plate editor={editor}>
            <PlateContent onKeyDown={editableHandler} />
          </Plate>
        </div>
      );
      const editable = container.querySelector('[contenteditable="true"]');

      if (!editable) throw new Error('Expected editable root');

      fireEvent.keyDown(editable, {
        code: 'KeyS',
        ctrlKey: true,
        key: 's',
      });

      expect(shortcutHandler).toHaveBeenCalledTimes(1);
      expect(editableHandler).not.toHaveBeenCalled();
      expect(ancestorHandler).not.toHaveBeenCalled();
    });

    it('continues the React handler chain for propagating shortcuts', () => {
      const shortcutHandler = mock();
      const editableHandler = mock();
      const ancestorHandler = mock();
      const editor = createPlateEditor({
        shortcuts: {
          save: {
            handler: shortcutHandler,
            keys: 'ctrl+s',
            preventDefault: false,
          },
        },
      });
      const { container } = render(
        <div onKeyDown={ancestorHandler}>
          <Plate editor={editor}>
            <PlateContent onKeyDown={editableHandler} />
          </Plate>
        </div>
      );
      const editable = container.querySelector('[contenteditable="true"]');

      if (!editable) throw new Error('Expected editable root');

      fireEvent.keyDown(editable, {
        code: 'KeyS',
        ctrlKey: true,
        key: 's',
      });

      expect(shortcutHandler).toHaveBeenCalledTimes(1);
      expect(editableHandler).toHaveBeenCalledTimes(1);
      expect(ancestorHandler).toHaveBeenCalledTimes(1);
    });

    it('keeps decorate stable across rerenders with unchanged inputs', () => {
      const decorate = mock();

      const editor = createPlateEditor({
        plugins: [
          defineBasePlugin('a', {
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
      const entry = [editor.read.children()[0], [0]] as any;

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
