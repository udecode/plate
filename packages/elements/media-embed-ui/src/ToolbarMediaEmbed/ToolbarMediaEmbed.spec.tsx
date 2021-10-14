import * as React from 'react';
import { fireEvent, render } from '@testing-library/react';
import * as core from '@udecode/plate-core';
import { ELEMENT_H1 } from '@udecode/plate-heading';
import { createMediaEmbedPlugin } from '@udecode/plate-media-embed';
import { Plate } from '../../../../core/src/components/Plate';
import { createPlateOptions } from '../../../../plate/src/utils/createPlateOptions';
import { ToolbarMediaEmbed } from './ToolbarMediaEmbed';
import { input1, input2, output2 } from './ToolbarMediaEmbed.fixtures';

describe('ToolbarMediaEmbed', () => {
  describe('when with url', () => {
    it('should invoke getUrlImage when provided', () => {
      jest.spyOn(core, 'useStoreEditorRef').mockReturnValue(input1);
      jest
        .spyOn(window, 'prompt')
        .mockReturnValue('https://i.imgur.com/removed.png');

      const getEmbedUrlMock = jest.fn();

      const { getByTestId } = render(
        <Plate editor={input1}>
          <ToolbarMediaEmbed
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
      jest.spyOn(core, 'useStoreEditorRef').mockReturnValue(input2);
      jest.spyOn(window, 'prompt').mockReturnValue('');

      const { getByTestId } = render(
        <Plate
          initialValue={input2.children}
          plugins={[createMediaEmbedPlugin()]}
          options={createPlateOptions()}
        >
          <ToolbarMediaEmbed type={ELEMENT_H1} icon={null} />
        </Plate>
      );

      const element = getByTestId('ToolbarButton');
      fireEvent.mouseDown(element);

      expect(input2.children).toEqual(output2.children);
    });
  });
});
