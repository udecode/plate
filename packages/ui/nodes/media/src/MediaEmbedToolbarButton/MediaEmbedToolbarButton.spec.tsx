import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import * as core from '@udecode/plate-core';
import { ELEMENT_H1 } from '@udecode/plate-heading';
import { createMediaEmbedPlugin } from '@udecode/plate-media';
import { Plate } from '../../../../../core/src/components/plate/Plate';
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
          <MediaEmbedToolbarButton
            type={ELEMENT_H1}
            getEmbedUrl={getEmbedUrlMock}
            icon={null}
          />
        </Plate>
      );

      const element = getByTestId('ToolbarButton');
      fireEvent.mouseDown(element);

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
          <MediaEmbedToolbarButton type={ELEMENT_H1} icon={null} />
        </Plate>
      );

      const element = getByTestId('ToolbarButton');
      fireEvent.mouseDown(element);

      expect(input2.children).toEqual(output2.children);
    });
  });
});
