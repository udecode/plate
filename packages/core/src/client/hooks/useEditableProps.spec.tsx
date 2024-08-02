import React from 'react';

import { render } from '@testing-library/react';

import { type PlatePlugin, createPlugin } from '../../shared';
import { Plate, PlateContent } from '../components';

describe('useEditableProps', () => {
  describe('default', () => {
    it('should trigger decorate only once', () => {
      const decorate = jest.fn();

      const plugins: PlatePlugin[] = [
        createPlugin({
          decorate: () => () => {
            decorate();

            return [];
          },
          key: 'a',
        }),
      ];

      render(
        <Plate plugins={plugins}>
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
  //     const plugins: PlatePlugin[] = [
  //       {
  //         key: 'a',
  //         decorate: () => () => {
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
  //     const { result } = renderHook(() => usePlateSelectors().value(), {
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
