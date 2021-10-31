import * as React from 'react';
import { getHandler } from '@udecode/plate-common';
import { useFocused, useSelected } from 'slate-react';
import { getMentionInputElementStyles } from './MentionInputElement.styles';
import { MentionInputElementProps } from './MentionInputElement.types';

export const MentionInputElement = (props: MentionInputElementProps) => {
  const {
    attributes,
    children,
    nodeProps,
    styles: _styles,
    element,
    classNames,
    prefixClassNames,
    prefix,
    as,
    onClick,
    renderLabel,
    ...rootProps
  } = props;

  const selected = useSelected();
  const focused = useFocused();

  const styles = getMentionInputElementStyles({
    ...props,
    selected,
    focused,
  });

  return (
    <span
      {...attributes}
      as={as}
      data-slate-value={element.value}
      className={styles.root.className}
      css={styles.root.css}
      onClick={getHandler(onClick, element)}
      {...rootProps}
      {...nodeProps}
    >
      {children}
    </span>
  );
};
