import * as React from 'react';
import { fireEvent, render } from '@testing-library/react';
import * as core from '@udecode/slate-plugins-core';
import { ELEMENT_H1 } from '@udecode/slate-plugins-heading';
import { createImagePlugin } from '@udecode/slate-plugins-image';
import { SlatePlugins } from '../../../../core/src/components/SlatePlugins';
import { createSlatePluginsOptions } from '../../../../slate-plugins/src/utils/createSlatePluginsOptions';
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
    //     <SlatePlugins
    //       initialValue={editor.children}
    //       plugins={[createParagraphPlugin(), createImagePlugin()]}
    //       options={createSlatePluginsOptions()}
    //     >
    //       <ToolbarImage type={ELEMENT_IMAGE} icon={null} />
    //     </SlatePlugins>
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
        <SlatePlugins editor={input1}>
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
      jest.spyOn(core, 'useStoreEditorRef').mockReturnValue(input2);
      jest.spyOn(window, 'prompt').mockReturnValue('');

      const { getByTestId } = render(
        <SlatePlugins
          initialValue={input2.children}
          plugins={[createImagePlugin()]}
          options={createSlatePluginsOptions()}
        >
          <ToolbarImage type={ELEMENT_H1} icon={null} />
        </SlatePlugins>
      );

      const element = getByTestId('ToolbarButton');
      fireEvent.mouseDown(element);

      expect(input2.children).toEqual(output2.children);
    });
  });
});
