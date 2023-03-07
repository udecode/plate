import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import * as core from '@udecode/plate-common';
import { createMediaEmbedPlugin } from '@udecode/plate-media';
import { Plate } from '../../../../../core/src/components/Plate';
import { MediaEmbedToolbarButton } from './MediaEmbedToolbarButton';
import { input1, input2, output2 } from './MediaEmbedToolbarButton.fixtures';

describe('MediaEmbedToolbarButton', () => {
  describe('when with url', () => {
    it('should invoke getUrlImage when provided', () => {
      jest.spyOn(core, 'usePlateEditorRef').mockReturnValue(input1 as any);
      jest
        .spyOn(window, 'prompt')
        .mockReturnValue('https://i.imgur.com/removed.png');

      const getEmbedUrlMock = jest.fn();

      const { getByTestId } = render(
        <Plate
          initialValue={input1.children}
          plugins={[createMediaEmbedPlugin()]}
        >
          <MediaEmbedToolbarButton getEmbedUrl={getEmbedUrlMock} icon={null} />
        </Plate>
      );

      const element = getByTestId('ToolbarButton');
      fireEvent.click(element);

      expect(getEmbedUrlMock).toBeCalledTimes(1);
    });
  });

  describe('when without url', () => {
    it('should render', () => {
      jest.spyOn(core, 'usePlateEditorRef').mockReturnValue(input2 as any);
      jest.spyOn(window, 'prompt').mockReturnValue('');

      const { getByTestId } = render(
        <Plate
          initialValue={input2.children}
          plugins={[createMediaEmbedPlugin()]}
        >
          <MediaEmbedToolbarButton icon={null} />
        </Plate>
      );

      const element = getByTestId('ToolbarButton');
      fireEvent.click(element);

      expect(input2.children).toEqual(output2.children);
    });
  });
});
