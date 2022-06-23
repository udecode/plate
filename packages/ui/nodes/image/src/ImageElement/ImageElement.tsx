/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import { Value } from '@udecode/plate-core';
import { useFocused, useSelected } from 'slate-react';
import { Box } from './Box';
import { Image } from './Image';
import { ImageCaption } from './ImageCaption';
import { getImageElementStyles } from './ImageElement.styles';
import { ImageElementProps } from './ImageElement.types';
import { ImageImg } from './ImageImg';
import { ImageResizable } from './ImageResizable';
import { ImageTextArea } from './ImageTextArea';

export const ImageElement = <V extends Value>(props: ImageElementProps<V>) => {
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

  const styles = getImageElementStyles({ ...props, align, focused, selected });

  return (
    <Image
      css={styles.root.css}
      className={styles.root.className}
      {...rootProps}
    >
      <div contentEditable={false}>
        <figure
          css={styles.figure?.css}
          className={`group ${styles.figure?.className}`}
        >
          <ImageResizable
            data-testid="ImageElementResizable"
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
            ignoreReadOnly={ignoreReadOnly}
            align={align}
            {...resizableProps}
          >
            <ImageImg
              data-testid="ImageElementImage"
              css={styles.img?.css}
              className={styles.img?.className}
              {...nodeProps}
            />
          </ImageResizable>

          <ImageCaption
            data-testid="ImageElementCaption"
            css={styles.figcaption?.css}
            className={styles.figcaption?.className}
            caption={caption}
          >
            <ImageTextArea
              data-testid="ImageElementTextArea"
              css={styles.caption?.css}
              className={styles.caption?.className}
              placeholder={caption.placeholder ?? 'Write a caption...'}
              ignoreReadOnly={ignoreReadOnly}
              caption={caption}
            />
          </ImageCaption>
        </figure>
      </div>

      {children}
    </Image>
  );
};
