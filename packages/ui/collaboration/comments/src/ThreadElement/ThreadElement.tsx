import React from 'react';
import { Thread, ThreadNodeData } from '@udecode/plate-comments';
import {
  getRootProps,
  StyledElementProps,
} from '@udecode/plate-styled-components';
import { createThreadElementStyles } from './ThreadElement.styles';

function determineStyle(
  element: any,
  thread: Thread,
  props: StyledElementProps<ThreadNodeData>
): any {
  let style = null;
  const { root, selected, resolved } = createThreadElementStyles(props);
  if (thread.isResolved) {
    style = resolved;
  } else if (element.selected) {
    style = selected;
  } else {
    style = root;
  }
  return style;
}

export const ThreadElement = (props: StyledElementProps<ThreadNodeData>) => {
  const { attributes, children, nodeProps, element } = props;
  const { thread } = element;

  const rootProps = getRootProps(props);
  const style = determineStyle(element, thread, props);

  return (
    <span
      {...attributes}
      css={style.css}
      className={style.className}
      {...rootProps}
      {...nodeProps}
    >
      {children}
    </span>
  );
};
