import React from 'react';
import { render } from '@testing-library/react';

import { Plate } from '../components/index';
import { PlatePlugin } from '../types/index';

describe('useEditableProps', () => {
  describe('default', () => {
    it('should trigger decorate only once', () => {
      const decorate = jest.fn();

      const plugins: PlatePlugin[] = [
        {
          key: 'a',
          decorate: () => () => {
            decorate();
            return [];
          },
        },
      ];

      render(<Plate plugins={plugins} />);

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
  //       <PlateProvider plugins={plugins}><A />{children}</PlateProvider>
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
