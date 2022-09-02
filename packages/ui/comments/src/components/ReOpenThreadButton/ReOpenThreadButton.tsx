import React from 'react';
import { Unarchive } from '@styled-icons/material';
import { getReOpenThreadButtonStyles } from './ReOpenThreadButton.styles';
import { ReOpenThreadButtonStyleProps } from './ReOpenThreadButton.types';
import { useReOpenThreadButton } from './useReOpenThreadButton';

export const ReOpenThreadButton = (props: ReOpenThreadButtonStyleProps) => {
  const { onReOpenThread } = useReOpenThreadButton(props);

  const styles = getReOpenThreadButtonStyles(props);

  return (
    <button
      className={styles.root.className}
      css={styles.root.css}
      onClick={onReOpenThread}
      title="Re-open"
      type="button"
    >
      <Unarchive css={styles.icon?.css} className={styles.icon?.className} />
    </button>
  );
};
