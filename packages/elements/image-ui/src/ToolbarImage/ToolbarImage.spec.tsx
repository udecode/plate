import * as React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { ELEMENT_H1 } from '@udecode/slate-plugins-heading';
import { Editor } from 'slate';
import { SlatePlugins } from '../../../../core/src/components/SlatePlugins';
import { ToolbarImage } from './ToolbarImage';

describe('ToolbarImage', () => {
  describe('when with url', () => {
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
        <hp>test</hp>
        <himg url="https://i.imgur.com/removed.png">
          <cursor />
        </himg>
      </editor>
    ) as any;

    it('should render', () => {
      const editor = input;

      // jest
      //   .spyOn(SlatePlugins, 'useTSlateStatic')
      //   .mockReturnValue(editor as any);
      jest
        .spyOn(window, 'prompt')
        .mockReturnValue('https://i.imgur.com/removed.png');

      const { getByTestId } = render(
        <SlatePlugins editor={input}>
          <ToolbarImage type={ELEMENT_H1} icon={null} />
        </SlatePlugins>
      );

      const element = getByTestId('ToolbarButton');
      fireEvent.mouseDown(element);

      expect(editor.children).toEqual(output.children);
    });

    it('should invoke getUrlImage when provided', () => {
      const editor = input;

      // jest
      //   .spyOn(SlatePlugins, 'useTSlateStatic')
      //   .mockReturnValue(editor as any);
      jest
        .spyOn(window, 'prompt')
        .mockReturnValue('https://i.imgur.com/removed.png');

      const getImageUrlMock = jest.fn();

      const { getByTestId } = render(
        <SlatePlugins editor={input}>
          <ToolbarImage
            type={ELEMENT_H1}
            getImageUrl={getImageUrlMock}
            icon={null}
          />
        </SlatePlugins>
      );

      const element = getByTestId('ToolbarButton');
      fireEvent.mouseDown(element);

      expect(getImageUrlMock).toBeCalledTimes(1);
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

      // jest
      //   .spyOn(SlatePlugins, 'useTSlateStatic')
      //   .mockReturnValue(editor as any);
      jest.spyOn(window, 'prompt').mockReturnValue('');

      const { getByTestId } = render(
        <SlatePlugins editor={input}>
          <ToolbarImage type={ELEMENT_H1} icon={null} />
        </SlatePlugins>
      );

      const element = getByTestId('ToolbarButton');
      fireEvent.mouseDown(element);

      expect(editor.children).toEqual(output.children);
    });
  });
});
