import * as React from 'react';
import { fireEvent, render } from '@testing-library/react';
import * as core from '@udecode/plate-core';
import { ELEMENT_H1 } from '@udecode/plate-heading';
import { createImagePlugin } from '@udecode/plate-image';
import { Plate } from '../../../../core/src/components/Plate';
import { createPlateOptions } from '../../../../plate/src/utils/createPlateOptions';
import { ToolbarImage } from './ToolbarImage';
import { input1, input2, output2 } from './ToolbarImage.fixtures';

const plugins = [createImagePlugin()];

describe('ToolbarImage', () => {
  describe('when with url', () => {
    // it('should render', () => {
    //   const editor = createEditorPlugins({
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
      jest.spyOn(core, 'useStoreEditorRef').mockReturnValue(input1);
      jest
        .spyOn(window, 'prompt')
        .mockReturnValue('https://i.imgur.com/removed.png');

      const getImageUrlMock = jest.fn();

      const { getByTestId } = render(
        <Plate editor={input1}>
          <ToolbarImage
            type={ELEMENT_H1}
            getImageUrl={getImageUrlMock}
            icon={null}
          />
        </Plate>
      );

      const element = getByTestId('ToolbarButton');
      fireEvent.mouseDown(element);

      expect(getImageUrlMock).toBeCalledTimes(1);
    });
  });

  describe('when without url', () => {
    it('should render', () => {
      jest.spyOn(core, 'useStoreEditorRef').mockReturnValue(input2);
      jest.spyOn(window, 'prompt').mockReturnValue('');

      const { getByTestId } = render(
        <Plate
          initialValue={input2.children}
          plugins={[createImagePlugin()]}
          options={createPlateOptions()}
        >
          <ToolbarImage type={ELEMENT_H1} icon={null} />
        </Plate>
      );

      const element = getByTestId('ToolbarButton');
      fireEvent.mouseDown(element);

      expect(input2.children).toEqual(output2.children);
    });
  });
});
