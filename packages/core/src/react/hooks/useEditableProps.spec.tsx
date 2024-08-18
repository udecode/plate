import React from 'react';

import { render } from '@testing-library/react';

import { createSlatePlugin } from '../../lib';
import { Plate, PlateContent } from '../components';
import { createPlateEditor } from '../editor';

describe('useEditableProps', () => {
  describe('default', () => {
    it('should trigger decorate only once', () => {
      const decorate = jest.fn();

      const editor = createPlateEditor({
        plugins: [
          createSlatePlugin({
            decorate: () => {
              decorate();

              return [];
            },
            key: 'a',
          }),
        ],
      });

      render(
        <Plate editor={editor}>
          <PlateContent />
        </Plate>
      );

      expect(decorate).toHaveBeenCalledTimes(3);
    });
  });

  // describe('redecorate', () => {
  //   it('should trigger decorate twice', () => {
  //     const decorate = jest.fn();
  //
  //     const plugins: PlatePluginList = [
  //       {
  //         key: 'a',
  //         decorate: () => {
  //           decorate();
  //           return [];
  //         },
  //       },
  //     ];
  //
  //     const A = () => {
  //       useEditableProps()
  //
  //       return null
  //     }
  //
  //     const wrapper = ({ children }: any) => (
  //       <Plate plugins={plugins}><A />{children}</Plate>
  //     );
  //
  //     const { result } = renderHook(() => useEditorValue(), {
  //       wrapper,
  //     });
  //
  //     render(<Plate plugins={plugins} />);
  //
  //     act(() => {
  //       getPlateActions().redecorate();
  //     });
  //
  //     expect(decorate).toBeCalledTimes(6);
  //   });
  // });
});
