import React from 'react';
import { Style } from '@udecode/plate-styled-components';
import {
  ComboboxContentItem,
  ComboboxContentItemProps,
  useComboboxContentItemState,
} from './ComboboxContentItemProps';

export const PlateComboboxContentItem = (
  props: {
    styleItem?: Style;
    index: number;
    highlightedItem?: Style;
  } & ComboboxContentItemProps
) => {
  const { styleItem, index, highlightedItem, ...rest } = props;
  const { highlighted } = useComboboxContentItemState({ index });

  return (
    <ComboboxContentItem
      css={!highlighted ? styleItem?.css : highlightedItem?.css}
      className={
        !highlighted ? styleItem?.className : highlightedItem?.className
      }
      index={index}
      {...rest}
    />
  );
};
