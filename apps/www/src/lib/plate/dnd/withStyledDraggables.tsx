import React from 'react';
import Tippy, { TippyProps } from '@tippyjs/react';
import {
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_BLOCK,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
  ELEMENT_IMAGE,
  ELEMENT_MEDIA_EMBED,
  ELEMENT_OL,
  ELEMENT_PARAGRAPH,
  ELEMENT_TABLE,
  ELEMENT_TODO_LI,
  ELEMENT_UL,
} from '@udecode/plate';
import { withPlateDraggables } from './withPlateDraggable';

import { Icons } from '@/components/icons';

function GrabberTooltipContent() {
  return (
    <div className="text-[12px]">
      <div>
        Drag <span className="text-[rgba(255,255,255,0.45)]">to move</span>
      </div>
    </div>
  );
}

export const grabberTooltipProps: TippyProps = {
  content: <GrabberTooltipContent />,
  placement: 'bottom',
  arrow: false,
  offset: [0, 0],
  delay: [300, 0],
  duration: [0, 0],
  hideOnClick: true,
  theme: 'small',
};

export const withStyledDraggables = (components: any) => {
  return withPlateDraggables(components, [
    {
      keys: [ELEMENT_PARAGRAPH, ELEMENT_UL, ELEMENT_OL],
      level: 0,
    },
    {
      keys: [
        ELEMENT_PARAGRAPH,
        ELEMENT_BLOCKQUOTE,
        ELEMENT_TODO_LI,
        ELEMENT_H1,
        ELEMENT_H2,
        ELEMENT_H3,
        ELEMENT_H4,
        ELEMENT_H5,
        ELEMENT_H6,
        ELEMENT_IMAGE,
        ELEMENT_OL,
        ELEMENT_UL,
        ELEMENT_TABLE,
        ELEMENT_MEDIA_EMBED,
        ELEMENT_CODE_BLOCK,
      ],
      draggableProps: {
        onRenderDragHandle: () => {
          return (
            <Tippy {...grabberTooltipProps}>
              <button
                type="button"
                className="min-h-[18px] min-w-[18px] cursor-pointer overflow-hidden border-none bg-transparent bg-no-repeat p-0 outline-none"
              >
                <Icons.dragHandle className="h-[18px] w-[18px] text-[rgba(55,53,47,0.3)]" />
              </button>
            </Tippy>
          );
        },
      },
    },
    {
      key: ELEMENT_H1,
      draggableProps: {
        classNames: {
          gutterLeft: 'pt-[2em] px-0 pb-1 text-[1.875em]',
          blockToolbarWrapper: 'h-[1.3em]',
        },
      },
    },
    {
      key: ELEMENT_H2,
      draggableProps: {
        classNames: {
          gutterLeft: 'pt-[1.4em] px-0 pb-1 text-[1.5em]',
          blockToolbarWrapper: 'h-[1.3em]',
        },
      },
    },
    {
      key: ELEMENT_H3,
      draggableProps: {
        classNames: {
          gutterLeft: 'pt-[1em] px-0 pb-1 text-[1.25em]',
          blockToolbarWrapper: 'h-[1.3em]',
        },
      },
    },
    {
      keys: [ELEMENT_H4, ELEMENT_H5, ELEMENT_H6],
      draggableProps: {
        classNames: {
          gutterLeft: 'pt-[0.75em] px-0 pb-0 text-[1.1em]',
          blockToolbarWrapper: 'h-[1.3em]',
        },
      },
    },
    {
      keys: [ELEMENT_PARAGRAPH, ELEMENT_UL, ELEMENT_OL],
      draggableProps: {
        classNames: {
          gutterLeft: 'pt-1 px-0 pb-0',
        },
      },
    },
    {
      key: ELEMENT_BLOCKQUOTE,
      draggableProps: {
        classNames: {
          gutterLeft: 'pt-[18px] px-0 pb-0',
        },
      },
    },
    {
      key: ELEMENT_CODE_BLOCK,
      draggableProps: {
        classNames: {
          gutterLeft: 'pt-3 px-0 pb-0',
        },
      },
    },
  ]);
};
