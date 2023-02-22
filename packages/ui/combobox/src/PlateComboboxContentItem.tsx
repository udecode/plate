import React from 'react';
import {
  ComboboxContent,
  ComboboxContentItemProps,
  useComboboxContentItemState,
} from '@udecode/plate-combobox';
import { Style } from '@udecode/plate-styled-components';

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
    <ComboboxContent.Item
      css={!highlighted ? styleItem?.css : highlightedItem?.css}
      className={
        !highlighted ? styleItem?.className : highlightedItem?.className
      }
      index={index}
      {...rest}
    />
  );
};
