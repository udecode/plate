import React from 'react';
import { act, fireEvent, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as core from '@udecode/plate-core';
import { Plate } from '@udecode/plate-core/src';
import { ELEMENT_H1 } from '@udecode/plate-heading';
import { createImagePlugin } from '@udecode/plate-image';
import { createPlateUIEditor } from '@udecode/plate-ui';
import * as slateReact from 'slate-react';
import { ImageToolbarButton } from '../ImageToolbarButton';
import { imgInput } from './ImageElement.fixtures';

describe('ImageElement', () => {
  describe('readOnly mode', () => {
    it('should disable caption editing in readOnly mode', () => {
      const editor = createPlateUIEditor({
        editor: imgInput,
        plugins: [createImagePlugin()],
      });
      jest.spyOn(core, 'usePlateEditorRef').mockReturnValue(editor as any);
      jest.spyOn(slateReact, 'useSelected').mockReturnValue(true);

      const { container } = render(
        <Plate editor={editor} editableProps={{ readOnly: true }} />
      );

      expect(
        container.querySelector('.slate-ImageElement-img')
      ).toBeInTheDocument();

      const caption = container.querySelector(
        '.slate-ImageElement-caption'
      ) as HTMLTextAreaElement;

      act(() => {
        userEvent.type(caption, 'a');
      });

      expect(editor.children).toStrictEqual([
        {
          children: [
            {
              text: '',
            },
          ],
          type: 'img',
          url: 'https://source.unsplash.com/kFrdX5IeQzI',
          width: '75%',
        },
      ]);
    });

    it('should allow caption editing in normal mode', () => {
      const editor = createPlateUIEditor({
        editor: imgInput,
        plugins: [createImagePlugin()],
      });
      jest.spyOn(core, 'usePlateEditorRef').mockReturnValue(editor as any);
      jest.spyOn(slateReact, 'useSelected').mockReturnValue(true);

      const { container, getByTestId } = render(
        <Plate editor={editor}>
          <ImageToolbarButton type={ELEMENT_H1} icon={null} />
        </Plate>
      );

      expect(
        container.querySelector('.slate-ImageElement-img')
      ).toBeInTheDocument();

      const caption = container.querySelectorAll('.slate-ImageElement-caption');
      expect(caption.length).toEqual(1);
      fireEvent.click(caption[0]);
      act(() => {
        fireEvent.change(caption[0], { target: { value: 'a' } });
      });

      expect(editor.children).toStrictEqual([
        {
          caption: [
            {
              text: 'a',
            },
          ],
          children: [
            {
              text: '',
            },
          ],
          type: 'img',
          url: 'https://source.unsplash.com/kFrdX5IeQzI',
          width: '75%',
        },
      ]);
    });
  });
});
