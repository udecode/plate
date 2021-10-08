import { createStyles } from '@udecode/plate-styled-components';
import { css } from 'styled-components';
import tw from 'twin.macro';
import { ComboboxStyleProps } from './Combobox.types';

export const getComboboxStyles = (props: ComboboxStyleProps) => {
  const item = [
    tw`flex items-center px-2 cursor-pointer`,
    css`
      font-size: 14px;
      border-radius: 0;
      min-height: 36px;
      user-select: none;
      color: rgb(32, 31, 30);
    `,
  ];

  return createStyles({ prefixClassNames: 'Combobox', ...props }, [
    {
      root: [
        tw`bg-white m-0 p-0 overflow-scroll`,
        css`
          width: 300px;
          max-height: 288px;
          border-radius: 0 0 2px 2px;
          box-shadow: rgba(0, 0, 0, 0.133) 0 3.2px 7.2px 0,
            rgba(0, 0, 0, 0.11) 0 0.6px 1.8px 0;

          z-index: 500;
        `,
      ],
      item: [
        ...item,
        css`
          background: transparent;

          :hover {
            background: rgb(243, 242, 241);
          }
        `,
      ],
      highlightedItem: [
        ...item,
        css`
          background: rgb(237, 235, 233);

          :hover {
            background: rgb(237, 235, 233);
          }
        `,
      ],
    },
  ]);
};
