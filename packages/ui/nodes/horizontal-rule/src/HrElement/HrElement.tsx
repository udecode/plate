import React from 'react';
import { Value } from '@udecode/plate-common';
import { getRootProps } from '@udecode/plate-styled-components';
import { useFocused, useSelected } from 'slate-react';
import { getHrElementStyles } from './HrElement.styles';
import { HrElementProps } from './HrElement.types';

export const HrElement = <V extends Value>(props: HrElementProps<V>) => {
  const { attributes, children, nodeProps } = props;

  const selected = useSelected();
  const focused = useFocused();
  const rootProps = getRootProps(props);
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
