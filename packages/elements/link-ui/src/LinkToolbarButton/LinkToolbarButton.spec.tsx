import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import * as core from '@udecode/plate-core';
import { ELEMENT_H1 } from '@udecode/plate-heading';
import { createLinkPlugin } from '@udecode/plate-link';
import { createEditorPlugins } from '../../../../plate/src/utils/createEditorPlugins';
import { LinkToolbarButton } from './LinkToolbarButton';
import {
  input1,
  input2,
  input3,
  output1,
  output2,
  output3,
} from './LinkToolbarButton.fixtures';

describe('LinkToolbarButton', () => {
  describe('when default', () => {
    it('should render', () => {
      const editor = createEditorPlugins({
        editor: input1,
        plugins: [createLinkPlugin()],
      });
      jest.spyOn(core, 'usePlateEditorState').mockReturnValue(editor as any);
      jest
        .spyOn(window, 'prompt')
        .mockReturnValue('https://i.imgur.com/removed.png');

      const { getByTestId } = render(<LinkToolbarButton icon={null} />);

      const element = getByTestId('ToolbarButton');
      fireEvent.mouseDown(element);

      expect(editor.children).toEqual(output1.children);
    });
  });

  describe('when with url', () => {
    it('should render', () => {
      const editor = createEditorPlugins({
        editor: input2,
        plugins: [createLinkPlugin()],
      });
      jest.spyOn(core, 'usePlateEditorState').mockReturnValue(editor as any);
      const prompt = jest
        .spyOn(window, 'prompt')
        .mockReturnValue('https://i.imgur.com/changed.png');

      const { getByTestId } = render(
        <LinkToolbarButton type={ELEMENT_H1} icon={null} />
      );

      const element = getByTestId('ToolbarButton');
      fireEvent.mouseDown(element);

      expect(prompt).toHaveBeenCalledWith(
        'Enter the URL of the link:',
        'https://i.imgur.com/removed.png'
      );

      expect(editor.children).toEqual(output2.children);
    });
  });

  describe('when without url', () => {
    it('should render', () => {
      const editor = input3;
      jest.spyOn(core, 'usePlateEditorState').mockReturnValue(editor as any);
      jest.spyOn(window, 'prompt').mockReturnValue('');

      const { getByTestId } = render(
        <LinkToolbarButton type={ELEMENT_H1} icon={null} />
      );

      const element = getByTestId('ToolbarButton');
      fireEvent.mouseDown(element);

      expect(editor.children).toEqual(output3.children);
    });
  });
});
