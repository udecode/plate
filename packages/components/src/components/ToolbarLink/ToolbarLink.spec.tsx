import * as React from 'react';
import { fireEvent, render } from '@testing-library/react';
import {
  ELEMENT_H1,
  ELEMENT_LINK,
  pipe,
  withInlineVoid,
  withLink,
} from '@udecode/slate-plugins';
import { Editor } from 'slate';
import * as SlateReact from 'slate-react';
import { withReact } from 'slate-react';
import { ToolbarLink } from './ToolbarLink';

describe('ToolbarLink', () => {
  describe('when default', () => {
    it('should render', () => {
      const input = ((
        <editor>
          <hp>
            test
            <cursor />
          </hp>
        </editor>
      ) as any) as Editor;

      const output = (
        <editor>
          <hp>
            test
            <ha url="https://i.imgur.com/removed.png">
              https://i.imgur.com/removed.png
            </ha>
            <cursor />
          </hp>
        </editor>
      ) as any;

      const editor = pipe(
        input,
        withReact,
        withLink(),
        withInlineVoid({ inlineTypes: [ELEMENT_LINK] })
      );

      jest.spyOn(SlateReact, 'useSlate').mockReturnValue(editor as any);
      jest
        .spyOn(window, 'prompt')
        .mockReturnValue('https://i.imgur.com/removed.png');

      const { getByTestId } = render(<ToolbarLink icon={null} />);

      const element = getByTestId('ToolbarButton');
      fireEvent.mouseDown(element);

      expect(editor.children).toEqual(output.children);
    });
  });

  describe('when with url', () => {
    it('should render', () => {
      const input = ((
        <editor>
          <hp>
            <ha url="https://i.imgur.com/removed.png">
              <cursor />
              https://i.imgur.com/removed.png
            </ha>
          </hp>
        </editor>
      ) as any) as Editor;

      const output = (
        <editor>
          <hp>
            <ha url="https://i.imgur.com/changed.png">
              <cursor />
              https://i.imgur.com/removed.png
            </ha>
          </hp>
        </editor>
      ) as any;

      jest.spyOn(SlateReact, 'useSlate').mockReturnValue(input as any);
      const prompt = jest
        .spyOn(window, 'prompt')
        .mockReturnValue('https://i.imgur.com/changed.png');

      const { getByTestId } = render(
        <ToolbarLink type={ELEMENT_H1} icon={null} />
      );

      const element = getByTestId('ToolbarButton');
      fireEvent.mouseDown(element);

      expect(prompt).toHaveBeenCalledWith(
        'Enter the URL of the link:',
        'https://i.imgur.com/removed.png'
      );

      // expect(editor.children).toEqual(output.children)
    });
  });

  describe('when without url', () => {
    it('should render', () => {
      const input = ((
        <editor>
          <hp>
            test
            <cursor />
          </hp>
        </editor>
      ) as any) as Editor;

      const output = (
        <editor>
          <hp>
            test
            <cursor />
          </hp>
        </editor>
      ) as any;

      const editor = input;

      jest.spyOn(SlateReact, 'useSlate').mockReturnValue(editor as any);
      jest.spyOn(window, 'prompt').mockReturnValue('');

      const { getByTestId } = render(
        <ToolbarLink type={ELEMENT_H1} icon={null} />
      );

      const element = getByTestId('ToolbarButton');
      fireEvent.mouseDown(element);

      expect(editor.children).toEqual(output.children);
    });
  });
});
