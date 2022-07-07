import React, { HTMLAttributes } from 'react';
import Tippy, { TippyProps } from '@tippyjs/react';
import { createComponentAs } from '@udecode/plate-core';
import {
  ImageCaptionTextareaProps,
  TextareaAutosize,
  useImageCaptionTextarea,
} from '@udecode/plate-image/src/index';
import { StyledProps } from '@udecode/plate-styled-components';
import { useReadOnly, useSelected } from 'slate-react';
import { getPopoverStyles } from './Popover.styles';

export interface PopoverProps extends TippyProps, StyledProps {
  rootProps?: HTMLAttributes<HTMLDivElement>;
}

export const Popover = ({ rootProps, content, ...props }: PopoverProps) => {
  // const editor = useSlate();
  // const isSelectionCollapsed = isCollapsed(editor.selection);
  const readOnly = useReadOnly();
  const selected = useSelected();

  const tippyProps: TippyProps = {
    animation: '',
    arrow: false,
    delay: [0, 0],
    duration: [0, 0],
    interactive: true,
    offset: [0, 12],
    placement: 'bottom',
    theme: 'custom',
    visible: !readOnly && selected,
    render: (attrs) => {
      const { root } = getPopoverStyles(props);

      return (
        <div
          {...attrs}
          contentEditable={false}
          onMouseDown={(e) => {
            e.preventDefault();
          }}
          css={root.css}
          className={root.className}
          {...rootProps}
        >
          {content}
        </div>
      );
    },
  };

  return <Tippy {...tippyProps} {...props} />;
};

export const ImageCaptionTextarea = createComponentAs<ImageCaptionTextareaProps>(
  ({ as, ...props }) => {
    const htmlProps = useImageCaptionTextarea({ as: as as any, ...props });

    return <TextareaAutosize {...htmlProps} />;
  }
);
