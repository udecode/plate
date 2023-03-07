import React from 'react';
import { getHandler, Value } from '@udecode/plate-common';
import { getRootProps } from '@udecode/plate-styled-components';
import { useFocused, useSelected } from 'slate-react';
import { getMentionInputElementStyles } from './MentionInputElement.styles';
import { MentionInputElementProps } from './MentionInputElement.types';

export const MentionInputElement = <V extends Value>(
  props: MentionInputElementProps<V>
) => {
  const { attributes, children, nodeProps, element, as, onClick } = props;

  const rootProps = getRootProps(props);

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
