import { fireEvent, render } from '@testing-library/react';
import React from 'react';

import { TestPlate as Plate } from '../__tests__/TestPlate';
import { createEditor } from '../editor';
import { PlateContent } from './PlateContent';

describe('PlateContent shortcuts', () => {
  describe('default', () => {
    it('stops the React handler chain for default shortcuts', () => {
      const shortcutHandler = mock();
      const editableHandler = mock();
      const ancestorHandler = mock();
      const editor = createEditor({
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
      const editor = createEditor({
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
  });
});
