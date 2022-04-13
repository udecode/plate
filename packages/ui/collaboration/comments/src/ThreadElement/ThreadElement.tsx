import React from 'react';
import { ThreadNodeData } from '@udecode/plate-comments';
import {
  getRootProps,
  StyledElementProps,
} from '@udecode/plate-styled-components';
import classNames from 'classnames';
import { getThreadElementStyles } from './ThreadElement.styles';

export const ThreadElement = (props: StyledElementProps<ThreadNodeData>) => {
  const { attributes, children, nodeProps, element } = props;

  const rootProps = getRootProps(props);
  const { root, selected } = getThreadElementStyles(props);

  return (
    <span
      {...attributes}
      css={element.selected ? selected!.css : root.css}
      className={classNames({
        [root.className]: !element.selected,
        [selected!.className]: element.selected,
      })}
      {...rootProps}
      {...nodeProps}
    >
      {children}
    </span>
  );
};
