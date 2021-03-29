import * as React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { ELEMENT_H1 } from '@udecode/slate-plugins-heading';
import { getImagePlugin } from '@udecode/slate-plugins-image';
import { SlatePlugins } from '../../../../core/src/components/SlatePlugins';
import { getSlatePluginsOptions } from '../../../../slate-plugins/src/utils/getSlatePluginsOptions';
import { ToolbarImage } from './ToolbarImage';
import { input1, input2, output2 } from './ToolbarImage.fixtures';

describe('ToolbarImage', () => {
  describe('when with url', () => {
    // it('should render', () => {
    //   const editor = createEditorPlugins({
    //     editor: input1,
    //     plugins: [getParagraphPlugin(), getImagePlugin()],
    //   });
    //
    //   jest
    //     .spyOn(window, 'prompt')
    //     .mockReturnValue('https://i.imgur.com/removed.png');
    //
    //   const { getByTestId } = render(
    //     <SlatePlugins
    //       initialValue={editor.children}
    //       plugins={[getParagraphPlugin(), getImagePlugin()]}
    //       options={getSlatePluginsOptions()}
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
      const editor = input1;

      // jest
      //   .spyOn(SlatePlugins, 'useTSlateStatic')
      //   .mockReturnValue(editor as any);
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
      const editor = input2;

      // jest
      //   .spyOn(SlatePlugins, 'useTSlateStatic')
      //   .mockReturnValue(editor as any);
      jest.spyOn(window, 'prompt').mockReturnValue('');

      const { getByTestId } = render(
        <SlatePlugins
          initialValue={editor.children}
          plugins={[getImagePlugin()]}
          options={getSlatePluginsOptions()}
        >
          <ToolbarImage type={ELEMENT_H1} icon={null} />
        </SlatePlugins>
      );

      const element = getByTestId('ToolbarButton');
      fireEvent.mouseDown(element);

      expect(editor.children).toEqual(output2.children);
    });
  });
});
