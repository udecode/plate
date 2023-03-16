import { BorderStyle, TTableCellElement } from '../../types';

export interface BorderStylesDefault {
  bottom: Required<BorderStyle>;
  right: Required<BorderStyle>;
  left?: Required<BorderStyle>;
  top?: Required<BorderStyle>;
}

export const getTableCellBorders = (
  element: TTableCellElement,
  {
    isFirstCell,
    isFirstRow,
    defaultBorder = {
      size: 1,
      style: 'solid',
      color: 'rgb(209 213 219)',
    },
  }: {
    defaultBorder?: Required<BorderStyle>;
    isFirstCell?: boolean;
    isFirstRow?: boolean;
  } = {}
): BorderStylesDefault => {
  const getBorder = (dir: 'top' | 'bottom' | 'left' | 'right') => {
    const border = element.borders?.[dir];

    return {
      size: border?.size ?? defaultBorder.size,
      style: border?.style ?? defaultBorder.style,
      color: border?.color ?? defaultBorder.color,
    };
  };

  // if (isFirstCell) {
  //   console.log({
  //     bottom: getBorder('bottom'),
  //     right: getBorder('right'),
  //     left: isFirstCell ? getBorder('left') : undefined,
  //     top: isFirstRow ? getBorder('top') : undefined,
  //   });
  // }

  return {
    bottom: getBorder('bottom'),
    right: getBorder('right'),
    left: isFirstCell ? getBorder('left') : undefined,
    top: isFirstRow ? getBorder('top') : undefined,
  };
};
