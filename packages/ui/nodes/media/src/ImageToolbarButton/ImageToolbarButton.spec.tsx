import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import * as core from '@udecode/plate-common';
import { createImagePlugin } from '@udecode/plate-media';
import { Plate } from '../../../../../core/src/components/Plate';
import { ImageToolbarButton } from './ImageToolbarButton';
import { input1, input2, output2 } from './ImageToolbarButton.fixtures';

const plugins = [createImagePlugin()];

describe('ImageToolbarButton', () => {
  describe('when with url', () => {
    // it('should render', () => {
    //   const editor = createPlateUIEditor({
    //     editor: input1,
    //     plugins: [createParagraphPlugin(), createImagePlugin()],
    //   });
    //
    //   jest
    //     .spyOn(window, 'prompt')
    //     .mockReturnValue('https://i.imgur.com/removed.png');
    //
    //   const { getByTestId } = render(
    //     <Plate
    //       initialValue={editor.children}
    //       plugins={[createParagraphPlugin(), createImagePlugin()]}
    //       options={createPlateOptions()}
    //     >
    //       <ToolbarImage type={ELEMENT_IMAGE} icon={null} />
    //     </Plate>
    //   );
    //
    //   const element = getByTestId('ToolbarButton');
    //   fireEvent.mouseDown(element);
    //
    //   expect(editor.children).toEqual(output1.children);
    // });

    it('should invoke getUrlImage when provided', () => {
      jest.spyOn(core, 'usePlateEditorRef').mockReturnValue(input1 as any);
      jest
        .spyOn(window, 'prompt')
        .mockReturnValue('https://i.imgur.com/removed.png');

      const getImageUrlMock = jest.fn();

      const { getByTestId } = render(
        <Plate initialValue={input1.children} plugins={[createImagePlugin()]}>
          <ImageToolbarButton getImageUrl={getImageUrlMock} icon={null} />
        </Plate>
      );

      const element = getByTestId('ToolbarButton');
      fireEvent.click(element);

      expect(getImageUrlMock).toBeCalledTimes(1);
    });
  });

  describe('when without url', () => {
    it('should render', () => {
      jest.spyOn(core, 'usePlateEditorRef').mockReturnValue(input2 as any);
      jest.spyOn(window, 'prompt').mockReturnValue('');

      const { getByTestId } = render(
        <Plate initialValue={input2.children} plugins={[createImagePlugin()]}>
          <ImageToolbarButton icon={null} />
        </Plate>
      );

      const element = getByTestId('ToolbarButton');
      fireEvent.click(element);

      expect(input2.children).toEqual(output2.children);
    });
  });
});
