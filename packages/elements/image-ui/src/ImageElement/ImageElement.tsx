import * as React from 'react';
import { useFocused, useSelected } from 'slate-react';
import { getImageElementStyles } from './ImageElement.styles';
import { ImageElementProps } from './ImageElement.types';

export const ImageElement = (props: ImageElementProps) => {
  const { attributes, children, element, nodeProps } = props;

  const { url } = element;
  const focused = useFocused();
  const selected = useSelected();

  const styles = getImageElementStyles({ ...props, focused, selected });

  return (
    <div
      {...attributes}
      css={styles.root.css}
      className={styles.root.className}
    >
      <div contentEditable={false}>
        <img
          data-testid="ImageElementImage"
          css={styles.img?.css}
          className={styles.img?.className}
          src={url}
          alt=""
          {...nodeProps}
        />
      </div>
      {children}
    </div>
  );
};
