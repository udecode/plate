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

    it('keeps decorate stable across rerenders with unchanged inputs', () => {
      const decorate = mock(() => []);
      const editor = createEditor();

      let currentDecorate: any;
      const renderEditable = (editable: React.ReactElement) => {
        currentDecorate = (editable.props as any).decorate;

        return editable;
      };
      const view = render(
        <Plate editor={editor}>
          <PlateContent decorate={decorate} renderEditable={renderEditable} />
        </Plate>
      );
      const decorateProp = currentDecorate!;
      const entry = [editor.read.children()[0], [0]] as any;

      expect(decorateProp).toBeDefined();

      const initialCallCount = decorate.mock.calls.length;

      decorateProp(entry);
      expect(decorate).toHaveBeenCalledTimes(initialCallCount + 1);

      view.rerender(
        <Plate editor={editor}>
          <PlateContent decorate={decorate} renderEditable={renderEditable} />
        </Plate>
      );

      expect(currentDecorate).toBe(decorateProp);

      const rerenderCallCount = decorate.mock.calls.length;

      currentDecorate!(entry);
      expect(decorate).toHaveBeenCalledTimes(rerenderCallCount + 1);
    });
  });
});
