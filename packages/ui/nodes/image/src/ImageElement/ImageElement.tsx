/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import { Box } from '@udecode/plate-core';
import { Image } from '@udecode/plate-image';
import { useFocused, useReadOnly, useSelected } from 'slate-react';
import { getImageElementStyles } from './ImageElement.styles';
import { ImageElementProps } from './ImageElement.types';

export const ImageElement = (props: ImageElementProps) => {
  const {
    children,
    nodeProps,
    caption = {},
    resizableProps,
    align = 'center',
    ignoreReadOnly = false,
  } = props;

  const { as, ...rootProps } = props;

  const focused = useFocused();
  const selected = useSelected();
  const readOnly = useReadOnly();

  const styles = getImageElementStyles({ ...props, align, focused, selected });

  return (
    <Image.Root {...rootProps} css={styles.root.css}>
      <figure
        css={styles.figure?.css}
        className={`group ${styles.figure?.className}`}
        contentEditable={false}
      >
        <Image.Resizable
          // @ts-ignore
          css={styles.resizable?.css}
          className={styles.resizable?.className}
          handleComponent={{
            left: (
              <Box
                css={[styles.handleLeft?.css]}
                className={styles.handleLeft?.className}
              />
            ),
            right: (
              <Box
                css={styles.handleRight?.css}
                className={styles.handleRight?.className}
              />
            ),
          }}
          align={align}
          readOnly={!ignoreReadOnly && readOnly}
          {...resizableProps}
        >
          <Image.Img
            css={styles.img?.css}
            className={styles.img?.className}
            {...nodeProps}
          />
        </Image.Resizable>

        {!caption.disabled && (
          <Image.Caption.Root
            css={styles.figcaption?.css}
            className={styles.figcaption?.className}
          >
            <Image.Caption.Textarea
              css={styles.caption?.css}
              className={styles.caption?.className}
              placeholder={caption.placeholder ?? 'Write a caption...'}
              readOnly={(!ignoreReadOnly && readOnly) || !!caption.readOnly}
            />
          </Image.Caption.Root>
        )}
      </figure>

      {children}
    </Image.Root>
  );
};
