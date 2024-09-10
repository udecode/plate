import type {
  BorderDirection,
  BorderStyle,
  TTableCellElement,
} from '../../../lib';

export interface BorderStylesDefault {
  bottom: Required<BorderStyle>;
  right: Required<BorderStyle>;
  left?: Required<BorderStyle>;
  top?: Required<BorderStyle>;
}

export const getTableCellBorders = (
  element: TTableCellElement,
  {
    defaultBorder = {
      color: 'rgb(209 213 219)',
      size: 1,
      style: 'solid',
    },
    isFirstCell,
    isFirstRow,
  }: {
    defaultBorder?: Required<BorderStyle>;
    isFirstCell?: boolean;
    isFirstRow?: boolean;
  } = {}
): BorderStylesDefault => {
  const getBorder = (dir: BorderDirection) => {
    const border = element.borders?.[dir];

    return {
      color: border?.color ?? defaultBorder.color,
      size: border?.size ?? defaultBorder.size,
      style: border?.style ?? defaultBorder.style,
    };
  };

  return {
    bottom: getBorder('bottom'),
    left: isFirstCell ? getBorder('left') : undefined,
    right: getBorder('right'),
    top: isFirstRow ? getBorder('top') : undefined,
  };
};
