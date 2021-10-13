import React from 'react';
import { useFocused, useSelected } from 'slate-react';
import { getHrElementStyles } from './HrElement.styles';
import { HrElementProps } from './HrElement.types';

export const HrElement = (props: HrElementProps) => {
  const {
    attributes,
    children,
    nodeProps,
    styles: _styles,
    element,
    classNames,
    prefixClassNames,
    ...rootProps
  } = props;

  const selected = useSelected();
  const focused = useFocused();
  const styles = getHrElementStyles({ ...props, selected, focused });

  return (
    <div
      {...attributes}
      css={styles.root?.css}
      className={styles.root?.className}
      {...rootProps}
      {...nodeProps}
    >
      <hr
        contentEditable={false}
        {...nodeProps}
        css={styles.hr?.css}
        className={styles.hr?.className}
      />
      {children}
    </div>
  );
};
