import React from 'react';
import { Check } from '@styled-icons/material';
import { createResolveButtonStyles } from './ResolveButton.styles';
import { ResolveButtonStyleProps } from './ResolveButton.types';
import { useResolveButton } from './useResolveButton';

export const ResolveButton = (props: ResolveButtonStyleProps) => {
  const { onResolveThread, title } = useResolveButton(props);

  const styles = createResolveButtonStyles(props);

  return (
    <button
      className={styles.root.className}
      css={styles.root.css}
      onClick={onResolveThread}
      title={title}
      type="button"
    >
      <Check css={styles.icon?.css} className={styles.icon?.className} />
    </button>
  );
};
