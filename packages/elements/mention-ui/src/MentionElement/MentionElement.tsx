import * as React from 'react';
import { getHandler } from '@udecode/plate-common';
import { useFocused, useSelected } from 'slate-react';
import { getMentionElementStyles } from './MentionElement.styles';
import { MentionElementProps } from './MentionElement.types';

export const MentionElement = (props: MentionElementProps) => {
  const {
    attributes,
    children,
    element,
    prefix,
    nodeProps,
    as,
    onClick,
    renderLabel,
  } = props;

  const selected = useSelected();
  const focused = useFocused();

  const styles = getMentionElementStyles({ ...props, selected, focused });

  console.log(element);

  return (
    <span
      {...attributes}
      as={as}
      data-slate-value={element.value}
      className={styles.root.className}
      css={styles.root.css}
      contentEditable={false}
      onClick={getHandler(onClick, element)}
      {...nodeProps}
    >
      {prefix}
      {renderLabel ? renderLabel(element) : element.value}
      {children}
    </span>
  );
};
